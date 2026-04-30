# Personal Sync Data

This folder is for syncing your personal Paper Reading data with Git.

Recommended workflow:

1. Open the extension popup.
2. Open `生词库`.
3. Click `导出同步 JSON`.
4. Save or move the downloaded file here as `paper-reading-sync.json`.
5. Commit this folder to Git.
6. On another computer, pull the repo, open `生词库`, click `导入同步 JSON`, and choose this file.

The JSON contains:

- saved vocabulary
- ignored words

It does not contain browser history, cookies, or page content.
