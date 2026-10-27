# Text review demo

A small, real demo of the text review flow on GitHub:

1. A developer changes texts in `src/i18n/` and opens a pull request.
2. GitHub Actions post an English/German table on the pull request and run checks.
3. The text reviewer is added automatically (CODEOWNERS) and gets an email.
4. The reviewer fixes texts in the browser and approves.
5. Branch protection allows the merge only after approval and green checks.
6. A release records which texts shipped.

## What's inside

| File | Job |
|---|---|
| `src/i18n/en.ts`, `de.ts` | The texts. English defines which keys exist. |
| `src/i18n/types.ts` | Makes TypeScript fail if a key is missing in German. |
| `src/i18n/meta.ts` | Where each text appears and its maximum length. |
| `src/app/login-screen.ts` | A tiny stand-in for app code (used to demo path-guard). |
| `scripts/i18n-report.mjs` | Builds the table and finds problems. |
| `.github/workflows/texts.yml` | The three checks: `i18n-review`, `i18n-checks`, `path-guard`. |
| `.github/CODEOWNERS` | Sends every text change to the reviewer. |
| `.github/text-team.txt` | Who counts as text team for path-guard. |

## You need

- Your own GitHub account (the **developer**).
- A **second GitHub account** for the **reviewer**. GitHub doesn't let you approve your own pull request. Use a colleague, or create a second free account with another email address.

## Setup (about 15 minutes)

**1. Create the repo**
- On GitHub: **New repository** → name `text-review-demo` → **Public** → don't add a README → **Create**.
- On the empty repo page, click **uploading an existing file**, and drag in all files and folders from this zip (including the `.github` folder). Commit to `main`.
  - If your computer hides the `.github` folder, use the terminal instead:
    ```bash
    cd text-review-demo
    git init -b main && git add . && git commit -m "Text review demo"
    git remote add origin https://github.com/YOUR_USERNAME/text-review-demo.git
    git push -u origin main
    ```

**2. Put in the reviewer's username**
- Edit `.github/CODEOWNERS` and `.github/text-team.txt` on GitHub (pencil icon) and replace `REVIEWER_USERNAME` with the reviewer account's username. Commit to `main`.

**3. Invite the reviewer**
- **Settings → Collaborators → Add people** → reviewer account. Accept the invite with that account.

**4. Turn on branch protection**
- **Settings → Branches → Add classic branch protection rule** (or Rules → Rulesets).
- Branch name pattern: `main`
- Tick:
  - **Require a pull request before merging**
    - **Require approvals**: 1
    - **Require review from Code Owners**
  - **Require status checks to pass before merging** → search and add `i18n-checks` and `path-guard`. (They show up in the search after they have run once. If they don't appear yet, do the demo step 1 first and come back.)
  - **Do not allow bypassing the above settings** (otherwise you, as the admin, could still merge).
- **Save**.

## Demo script

**As the developer (your account)**

1. Open `src/i18n/en.ts` → pencil icon. Add a new line after `signin.button`:
   ```ts
   'signin.forgot': 'Forgot your password?',
   ```
   Click **Commit changes** → choose **Create a new branch** → name it `texts/signin` → **Propose changes** → **Create pull request**.
2. On the same branch, edit `src/i18n/de.ts`:
   - change `'Weiter'` to `'Fortfahren'`
   - add `'signin.forgot': 'Haben Sie Ihr Passwort vergessen?',`

   Commit directly to `texts/signin`.

   Tip: after step 1 alone, **i18n-checks** fails because German is missing the key. That's the type check working.
3. Watch the pull request. After about a minute you'll see:
   - a **Text review** comment with the EN/DE table,
   - **i18n-checks** failing because the German text is 33 characters (limit 24),
   - the **Merge** button blocked.

**As the reviewer (second account)**

4. Open the email from GitHub, or the pull request, and read the table.
5. In the comment, click **edit German** → change the text to `Passwort vergessen?` → **Commit changes** to `texts/signin`. The table updates and the check turns green.
6. Optional path-guard demo: edit `src/app/login-screen.ts` on the same branch and commit. **path-guard** fails. Undo the change (edit it back) and it passes again.
7. **Files changed** tab → **Review changes** → **Approve** → **Submit review**.

**As the developer again**

8. **Merge pull request** now works.
9. **Releases → Draft a new release** → tag `v1.0.0` → **Publish**. That tag records exactly which texts shipped.
10. Show the history: open `src/i18n/de.ts` → **History** or **Blame** to see who changed each text and when.
