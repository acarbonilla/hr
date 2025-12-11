# Autopush Helper

The automation script lives at `tools/autopush.js`.

## How to run
- Directly: `node tools/autopush.js`
- Via NPM script (from repo root): `npm run autopush`

## Safety notes
- Ensure you are on the correct branch (typically `main`) before running.
- Review pending changes with `git status` if needed.
- The script stages all changes, commits, and pushes to `origin/main`.

## Custom commit messages
The script generates messages as `Auto-commit: <ISO timestamp>`. To use a custom message, you can temporarily edit `tools/autopush.js` or run your own commit after `git add .`.
