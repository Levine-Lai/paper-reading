# Optional Dictionary Chunks

The main repository keeps only the lightweight built-in vocabulary from `src/lexicon.js` and `public/web-content.js`.

Generated dictionary chunks such as `a.json`, `b.json`, and `c.json` are intentionally ignored by Git. Run this command after installing dependencies if you want the larger local dictionary:

```bash
npm.cmd run setup:dict
```

Release builds may include these chunks, but source clones do not need to carry them.
