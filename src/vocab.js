import "./vocab.css";

const SAVED_KEY = "paperReadingSavedWords";
const IGNORED_KEY = "paperReadingIgnoredWords";

const app = document.querySelector("#vocab-app");

app.innerHTML = `
  <main class="vocab-shell">
    <header class="vocab-header">
      <div>
        <h1>生词库</h1>
        <p>保存的单词用于复习；移除的单词以后不会再被标黄。</p>
      </div>
      <div class="actions">
        <button id="export-sync" class="button primary" type="button">导出同步 JSON</button>
        <button id="import-sync" class="button" type="button">导入同步 JSON</button>
        <button id="export-csv" class="button primary" type="button">导出 CSV</button>
        <button id="refresh" class="button" type="button">刷新</button>
        <input id="import-file" type="file" accept="application/json" hidden />
      </div>
    </header>

    <section class="toolbar">
      <input id="search" class="search" type="search" placeholder="搜索单词或释义" />
      <div id="stats" class="stats"></div>
    </section>

    <section class="grid">
      <section class="panel">
        <h2>已添加</h2>
        <div id="word-list" class="word-list"></div>
      </section>
      <section class="panel">
        <h2>已移除</h2>
        <div id="ignored-list" class="ignored-list"></div>
      </section>
    </section>
  </main>
`;

const els = {
  exportSync: document.querySelector("#export-sync"),
  importSync: document.querySelector("#import-sync"),
  importFile: document.querySelector("#import-file"),
  exportCsv: document.querySelector("#export-csv"),
  refresh: document.querySelector("#refresh"),
  search: document.querySelector("#search"),
  stats: document.querySelector("#stats"),
  wordList: document.querySelector("#word-list"),
  ignoredList: document.querySelector("#ignored-list")
};

let savedWords = {};
let ignoredWords = [];

els.refresh.addEventListener("click", load);
els.search.addEventListener("input", render);
els.exportCsv.addEventListener("click", exportCsv);
els.exportSync.addEventListener("click", exportSyncJson);
els.importSync.addEventListener("click", () => els.importFile.click());
els.importFile.addEventListener("change", importSyncJson);

load();

async function load() {
  const data = await storageGet([SAVED_KEY, IGNORED_KEY]);
  savedWords = data[SAVED_KEY] && typeof data[SAVED_KEY] === "object" ? data[SAVED_KEY] : {};
  ignoredWords = Array.isArray(data[IGNORED_KEY]) ? data[IGNORED_KEY] : [];
  render();
}

function render() {
  const query = els.search.value.trim().toLowerCase();
  const words = Object.values(savedWords)
    .filter((item) => {
      if (!query) return true;
      return `${item.lemma} ${item.surface} ${item.zh} ${item.tag}`.toLowerCase().includes(query);
    })
    .sort((a, b) => String(b.addedAt || "").localeCompare(String(a.addedAt || "")));

  els.stats.textContent = `${Object.keys(savedWords).length} 个生词 · ${ignoredWords.length} 个移除词`;
  renderSaved(words);
  renderIgnored(query);
}

function renderSaved(words) {
  els.wordList.innerHTML = "";
  if (!words.length) {
    els.wordList.innerHTML = `<div class="empty">暂无生词</div>`;
    return;
  }

  for (const item of words) {
    const card = document.createElement("article");
    card.className = "word-card";
    card.innerHTML = `
      <div class="word-top">
        <span class="word">${escapeHtml(item.lemma)}</span>
        <span class="tag">${escapeHtml(item.tag || "")}</span>
      </div>
      <div class="zh">${escapeHtml(item.zh || "")}</div>
      <div class="meta">${escapeHtml(item.title || "")}${item.url ? ` · ${escapeHtml(item.url)}` : ""}</div>
      <div class="meta">添加时间：${formatTime(item.addedAt)}</div>
      <div class="mini-actions">
        <button type="button" data-action="delete" data-word="${escapeHtml(item.lemma)}">删除</button>
      </div>
    `;
    card.querySelector('[data-action="delete"]').addEventListener("click", () => deleteSaved(item.lemma));
    els.wordList.append(card);
  }
}

function renderIgnored(query) {
  els.ignoredList.innerHTML = "";
  const words = ignoredWords.filter((word) => !query || word.includes(query)).sort();
  if (!words.length) {
    els.ignoredList.innerHTML = `<div class="empty">暂无移除词</div>`;
    return;
  }

  for (const word of words) {
    const item = document.createElement("div");
    item.className = "ignored-item";
    item.innerHTML = `<span>${escapeHtml(word)}</span><button type="button">恢复</button>`;
    item.querySelector("button").addEventListener("click", () => restoreIgnored(word));
    els.ignoredList.append(item);
  }
}

async function deleteSaved(word) {
  delete savedWords[word];
  await storageSet({ [SAVED_KEY]: savedWords });
  render();
}

async function restoreIgnored(word) {
  ignoredWords = ignoredWords.filter((item) => item !== word);
  await storageSet({ [IGNORED_KEY]: ignoredWords });
  render();
}

function exportCsv() {
  const rows = [["word", "surface", "translation", "tag", "title", "url", "addedAt"]];
  for (const item of Object.values(savedWords)) {
    rows.push([item.lemma, item.surface, item.zh, item.tag, item.title, item.url, item.addedAt].map(csvCell));
  }
  const csv = rows.map((row) => row.join(",")).join("\n");
  downloadText("paper-reading-vocabulary.csv", csv, "text/csv;charset=utf-8");
}

function exportSyncJson() {
  const payload = {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    app: "paper-reading",
    savedWords,
    ignoredWords
  };
  downloadText("paper-reading-sync.json", JSON.stringify(payload, null, 2), "application/json;charset=utf-8");
}

async function importSyncJson(event) {
  const [file] = event.target.files || [];
  event.target.value = "";
  if (!file) return;

  try {
    const payload = JSON.parse(await file.text());
    savedWords = normalizeSavedWords(payload.savedWords);
    ignoredWords = normalizeIgnoredWords(payload.ignoredWords);
    await storageSet({
      [SAVED_KEY]: savedWords,
      [IGNORED_KEY]: ignoredWords
    });
    render();
  } catch (error) {
    console.error(error);
    window.alert("导入失败：请选择由 Paper Reading 导出的同步 JSON。");
  }
}

function normalizeSavedWords(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const result = {};
  for (const [key, item] of Object.entries(value)) {
    if (!item || typeof item !== "object") continue;
    const lemma = String(item.lemma || key || "").trim().toLowerCase();
    if (!lemma) continue;
    result[lemma] = {
      lemma,
      surface: String(item.surface || lemma),
      zh: String(item.zh || ""),
      tag: String(item.tag || ""),
      url: String(item.url || ""),
      title: String(item.title || ""),
      addedAt: String(item.addedAt || new Date().toISOString()),
      updatedAt: String(item.updatedAt || item.addedAt || new Date().toISOString()),
      reviewCount: Number(item.reviewCount || 0)
    };
  }
  return result;
}

function normalizeIgnoredWords(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((word) => String(word).trim().toLowerCase()).filter(Boolean))].sort();
}

function downloadText(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function storageGet(keys) {
  return new Promise((resolve) => chrome.storage.local.get(keys, resolve));
}

function storageSet(data) {
  return new Promise((resolve) => chrome.storage.local.set(data, resolve));
}

function formatTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleString("zh-CN");
}

function csvCell(value) {
  return `"${String(value || "").replace(/"/g, '""')}"`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}
