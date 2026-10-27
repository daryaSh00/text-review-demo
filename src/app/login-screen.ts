// A tiny stand-in for the real app screen. It only shows how code reads the texts.
import { en } from '../i18n/en.ts';
import { de } from '../i18n/de.ts';

export function loginScreen(lang: 'en' | 'de'): string {
  const t = lang === 'en' ? en : de;
  return `${t['signin.title']}\n[ ${t['signin.button']} ]`;
}
