// Compares the texts on the PR branch with the base branch.
// Usage: node --experimental-strip-types scripts/i18n-report.mjs <baseDir> <headDir> [--check]
// Writes report.md. With --check, exits with code 1 if any problem is found.
import { writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const [baseDir, headDir] = process.argv.slice(2).filter(a => !a.startsWith('--'));
const check = process.argv.includes('--check');
const LANGS = { en: 'English', de: 'German' };

async function load(dir, name) {
  const file = resolve(dir, `${name}.ts`);
  if (!existsSync(file)) return {};
  const mod = await import(pathToFileURL(file).href);
  return mod[name] ?? {};
}

const base = { en: await load(baseDir, 'en'), de: await load(baseDir, 'de') };
const head = { en: await load(headDir, 'en'), de: await load(headDir, 'de') };
const meta = await load(headDir, 'meta');

const keys = [...new Set([...Object.keys(head.en), ...Object.keys(head.de), ...Object.keys(base.en), ...Object.keys(base.de)])];
const changed = keys.filter(k => Object.keys(LANGS).some(l => base[l][k] !== head[l][k]));

const problems = [];
for (const k of changed) {
  for (const l of Object.keys(LANGS)) {
    const v = head[l][k];
    const max = meta[k]?.max;
    if (v === undefined) problems.push(`\`${k}\` is missing in ${LANGS[l]}`);
    else if (!String(v).trim()) problems.push(`\`${k}\` (${l.toUpperCase()}) is empty`);
    else if (max && v.length > max) problems.push(`\`${k}\` (${l.toUpperCase()}) is ${v.length} characters. The limit is ${max}.`);
  }
  if (!meta[k]) problems.push(`\`${k}\` has no entry in meta.ts (where it appears and max length)`);
}

const md = s => String(s).replace(/\|/g, '\\|');
function cell(k, l) {
  const o = base[l][k], v = head[l][k], max = meta[k]?.max;
  if (v === undefined) return '❌ missing';
  const len = max ? ` <sub>${v.length}/${max}${v.length > max ? ' ⚠️' : ''}</sub>` : '';
  if (o === v) return `${md(v)}${len}`;
  if (o === undefined) return `🆕 **${md(v)}**${len}`;
  return `~~${md(o)}~~ → **${md(v)}**${len}`;
}

const repo = process.env.GITHUB_REPOSITORY, branch = process.env.HEAD_REF;
const editLink = l => (repo && branch ? `[edit ${LANGS[l]}](https://github.com/${repo}/edit/${branch}/src/i18n/${l}.ts)` : '');

let out = `<!-- i18n-review -->\n## Text review\n\n`;
if (!changed.length) out += 'No text changes in this pull request.\n';
else {
  out += `| Text | Where | English | German |\n|---|---|---|---|\n`;
  for (const k of changed) out += `| \`${k}\` | ${md(meta[k]?.where ?? '—')} | ${cell(k, 'en')} | ${cell(k, 'de')} |\n`;
  out += `\n${problems.length ? `### ⚠️ ${problems.length} problem${problems.length > 1 ? 's' : ''}\n${problems.map(p => `- ${p}`).join('\n')}\n` : '### ✅ All texts pass the checks\n'}`;
  if (repo && branch) out += `\n**To change a text:** ${editLink('en')} · ${editLink('de')} → change the text → **Commit changes** (keep "Commit directly to the \`${branch}\` branch"). This table updates automatically.\n\n**When the texts are good:** Files changed tab → **Review changes** → **Approve**.\n`;
}
out += `\n<sub>Updated automatically after every push.</sub>\n`;

writeFileSync('report.md', out);
console.log(out);
if (check && problems.length) { console.error(`\n${problems.length} problem(s) found.`); process.exit(1); }
