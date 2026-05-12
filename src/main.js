import "./styles.css";
import { BookOpenText, FileUp, Minus, Plus, createElement } from "lucide";
import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";
import { getWordInsight } from "./lexicon.js";
import { buildInsightOptions, getProfileConfig, loadSettings, PROFILE_CONFIGS, saveSettings } from "./settings.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

const app = document.querySelector("#app");

app.innerHTML = `
  <header class="topbar">
    <div class="brand">
      <div class="brand-mark">PR</div>
      <div class="brand-copy">
        <strong>Paper Reading</strong>
        <span>Local PDF Vocabulary Lens</span>
      </div>
    </div>

    <div class="toolbar" aria-label="PDF controls">
      <input id="file-input" type="file" accept="application/pdf" hidden />
      <button class="button button-primary" id="open-file" type="button">
        <i data-lucide="file-up"></i>
        <span>打开 PDF</span>
      </button>
      <div class="icon-group" aria-label="Zoom controls">
        <button class="icon-button" id="zoom-out" type="button" title="缩小">
          <i data-lucide="minus"></i>
        </button>
        <span id="zoom-label" class="zoom-label">120%</span>
        <button class="icon-button" id="zoom-in" type="button" title="放大">
          <i data-lucide="plus"></i>
        </button>
      </div>
      <div class="segmented" aria-label="Vocabulary profile">
        ${Object.entries(PROFILE_CONFIGS).map(([key, profile]) => `
          <button class="${key === "balanced" ? "active" : ""}" type="button" data-profile="${key}" title="${profile.detail}">${profile.label}</button>
        `).join("")}
      </div>
      <label class="switch">
        <input id="heuristic-toggle" type="checkbox" checked />
        <span>低频推断</span>
      </label>
    </div>
  </header>

  <main class="workspace">
    <section id="reader" class="reader" aria-label="PDF reader">
      <div id="empty-state" class="empty-state">
        <div class="empty-glyph"><i data-lucide="book-open-text"></i></div>
        <h1>选择 PDF</h1>
        <p>文件仅在本机浏览器中解析</p>
        <button class="button button-primary" id="empty-open" type="button">
          <i data-lucide="file-up"></i>
          <span>打开 PDF</span>
        </button>
      </div>
      <div id="pages" class="pages" aria-live="polite"></div>
    </section>

    <aside class="vocab-panel" aria-label="Vocabulary panel">
      <div class="panel-heading">
        <div>
          <span class="eyebrow">Vocabulary</span>
          <h2>词汇</h2>
        </div>
        <span id="hit-count" class="count-badge">0</span>
      </div>
      <div id="doc-meta" class="doc-meta">未加载 PDF</div>
      <div id="vocab-list" class="vocab-list"></div>
    </aside>
  </main>

  <div id="status" class="status" hidden></div>
  <div id="tooltip" class="tooltip" role="tooltip" hidden></div>
`;

const ICONS = {
  "book-open-text": BookOpenText,
  "file-up": FileUp,
  minus: Minus,
  plus: Plus
};

for (const iconSlot of app.querySelectorAll("[data-lucide]")) {
  const icon = ICONS[iconSlot.dataset.lucide];
  if (!icon) continue;
  const svg = createElement(icon);
  svg.setAttribute("aria-hidden", "true");
  iconSlot.replaceWith(svg);
}

const els = {
  reader: document.querySelector("#reader"),
  emptyState: document.querySelector("#empty-state"),
  pages: document.querySelector("#pages"),
  fileInput: document.querySelector("#file-input"),
  openFile: document.querySelector("#open-file"),
  emptyOpen: document.querySelector("#empty-open"),
  zoomIn: document.querySelector("#zoom-in"),
  zoomOut: document.querySelector("#zoom-out"),
  zoomLabel: document.querySelector("#zoom-label"),
  heuristicToggle: document.querySelector("#heuristic-toggle"),
  segmented: document.querySelector(".segmented"),
  tooltip: document.querySelector("#tooltip"),
  status: document.querySelector("#status"),
  hitCount: document.querySelector("#hit-count"),
  vocabList: document.querySelector("#vocab-list"),
  docMeta: document.querySelector("#doc-meta")
};

const state = {
  pdf: null,
  fileName: "",
  scale: 1.2,
  settings: buildInsightOptions({ profile: "balanced" }),
  renderToken: 0,
  hits: new Map()
};

const WORD_PATTERN = /[A-Za-z][A-Za-z'-]{2,}/g;
const initialSourceUrl = new URLSearchParams(window.location.search).get("src");
const measureCanvas = document.createElement("canvas");
const measureContext = measureCanvas.getContext("2d");

els.openFile.addEventListener("click", () => els.fileInput.click());
els.emptyOpen.addEventListener("click", () => els.fileInput.click());
els.fileInput.addEventListener("change", async (event) => {
  const [file] = event.target.files || [];
  if (file) await loadPdfFile(file);
  els.fileInput.value = "";
});

els.reader.addEventListener("dragover", (event) => {
  event.preventDefault();
  els.reader.classList.add("dragging");
});

els.reader.addEventListener("dragleave", () => {
  els.reader.classList.remove("dragging");
});

els.reader.addEventListener("drop", async (event) => {
  event.preventDefault();
  els.reader.classList.remove("dragging");
  const file = [...event.dataTransfer.files].find((item) => item.type === "application/pdf");
  if (file) await loadPdfFile(file);
});

els.zoomIn.addEventListener("click", () => setZoom(Math.min(2.2, state.scale + 0.15)));
els.zoomOut.addEventListener("click", () => setZoom(Math.max(0.65, state.scale - 0.15)));

els.segmented.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-profile]");
  if (!button) return;
  applySettings({ profile: button.dataset.profile, allowHeuristic: getProfileConfig(button.dataset.profile).allowHeuristic });
  saveSettings({ profile: button.dataset.profile, allowHeuristic: state.settings.allowHeuristic });
  els.segmented.querySelectorAll("button").forEach((item) => item.classList.toggle("active", item === button));
  rerenderIfReady();
});

els.heuristicToggle.addEventListener("change", () => {
  applySettings({ profile: state.settings.profile, allowHeuristic: els.heuristicToggle.checked });
  saveSettings({ profile: state.settings.profile, allowHeuristic: state.settings.allowHeuristic });
  rerenderIfReady();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") hideTooltip();
});

function setZoom(nextScale) {
  state.scale = Number(nextScale.toFixed(2));
  updateZoomLabel();
  rerenderIfReady();
}

function updateZoomLabel() {
  els.zoomLabel.textContent = `${Math.round(state.scale * 100)}%`;
}

async function loadPdfFile(file) {
  const token = ++state.renderToken;
  showStatus("解析 PDF...");
  hideTooltip();
  els.emptyState.hidden = true;
  els.pages.innerHTML = "";

  try {
    const buffer = await file.arrayBuffer();
    await parsePdfBuffer(buffer, file.name, token);
  } catch (error) {
    console.error(error);
    showStatus("PDF 解析失败，请换一个文件试试", true);
    els.emptyState.hidden = false;
  }
}

async function loadPdfFromUrl(sourceUrl) {
  const token = ++state.renderToken;
  showStatus("读取本地 PDF...");
  hideTooltip();
  els.emptyState.hidden = true;
  els.pages.innerHTML = "";

  try {
    const response = await fetch(sourceUrl);
    if (!response.ok) {
      throw new Error(`Unexpected status ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    await parsePdfBuffer(buffer, getFileNameFromUrl(sourceUrl), token);
  } catch (error) {
    console.error(error);
    state.pdf = null;
    els.pages.innerHTML = "";
    els.emptyState.hidden = false;
    els.docMeta.textContent = "自动读取失败";
    showStatus("无法自动读取这个本地 PDF。请在扩展详情页开启“允许访问文件网址”，或点击“打开 PDF”手动选择。", true);
  }
}

async function parsePdfBuffer(buffer, fileName, token) {
  state.fileName = fileName || "Untitled PDF";
  const loadingTask = pdfjsLib.getDocument({ data: buffer });
  state.pdf = await loadingTask.promise;
  if (token !== state.renderToken) return;
  await renderDocument(token);
}

async function rerenderIfReady() {
  if (!state.pdf) return;
  await renderDocument(++state.renderToken);
}

async function renderDocument(token) {
  if (!state.pdf) return;
  showStatus("渲染页面...");
  hideTooltip();
  state.hits = new Map();
  els.pages.innerHTML = "";
  els.docMeta.textContent = `${state.fileName} · ${state.pdf.numPages} 页`;

  for (let pageNumber = 1; pageNumber <= state.pdf.numPages; pageNumber += 1) {
    if (token !== state.renderToken) return;
    await renderPage(pageNumber, token);
    showStatus(`渲染页面 ${pageNumber}/${state.pdf.numPages}`);
  }

  updateVocabPanel();
  hideStatus();
}

async function renderPage(pageNumber, token) {
  const page = await state.pdf.getPage(pageNumber);
  if (token !== state.renderToken) return;

  const viewport = page.getViewport({ scale: state.scale });
  const outputScale = window.devicePixelRatio || 1;

  const pageFrame = document.createElement("article");
  pageFrame.className = "page-frame";
  pageFrame.style.width = `${viewport.width}px`;
  pageFrame.style.height = `${viewport.height}px`;
  pageFrame.dataset.page = String(pageNumber);

  const canvas = document.createElement("canvas");
  canvas.className = "pdf-canvas";
  canvas.width = Math.floor(viewport.width * outputScale);
  canvas.height = Math.floor(viewport.height * outputScale);
  canvas.style.width = `${viewport.width}px`;
  canvas.style.height = `${viewport.height}px`;

  const highlightLayer = document.createElement("div");
  highlightLayer.className = "highlight-layer";
  highlightLayer.style.width = `${viewport.width}px`;
  highlightLayer.style.height = `${viewport.height}px`;

  const pageBadge = document.createElement("div");
  pageBadge.className = "page-badge";
  pageBadge.textContent = String(pageNumber);

  pageFrame.append(canvas, highlightLayer, pageBadge);
  els.pages.append(pageFrame);

  const context = canvas.getContext("2d", { alpha: false });
  const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

  await page.render({ canvasContext: context, viewport, transform }).promise;
  if (token !== state.renderToken) return;

  const textContent = await page.getTextContent({ includeMarkedContent: false });
  if (token !== state.renderToken) return;
  layoutHighlights({ pageNumber, textContent, viewport, layer: highlightLayer });
}

function layoutHighlights({ pageNumber, textContent, viewport, layer }) {
  for (const item of textContent.items) {
    if (!item.str || !/[A-Za-z]/.test(item.str)) continue;
    const matches = [...item.str.matchAll(WORD_PATTERN)];
    if (!matches.length) continue;

    const itemTransform = pdfjsLib.Util.transform(viewport.transform, item.transform);
    const left = itemTransform[4];
    const baseline = itemTransform[5];
    const fontHeight = Math.max(8, Math.hypot(itemTransform[2], itemTransform[3]));
    const itemWidth = Math.max(1, (item.width || item.str.length * fontHeight * 0.45) * viewport.scale);
    const metrics = buildTextMetrics(item.str, itemWidth, fontHeight);
    const angle = Math.atan2(itemTransform[1], itemTransform[0]);
    const top = baseline - fontHeight;

    if (!Number.isFinite(left) || !Number.isFinite(top)) continue;

    for (const match of matches) {
      const rawWord = match[0];
      const insight = getWordInsight(rawWord, {
        profile: state.settings.profile,
        threshold: state.settings.threshold,
        allowHeuristic: state.settings.allowHeuristic
      });
      if (!insight) continue;

      const start = metrics.offsetAt(match.index);
      const end = metrics.offsetAt(match.index + rawWord.length);
      const wordLeft = left + start;
      const wordWidth = Math.max(10, end - start);
      const wordTop = top + fontHeight * 0.06;
      const wordHeight = Math.max(10, fontHeight * 0.92);
      if (wordLeft < -20 || wordTop < -20 || wordLeft > viewport.width || wordTop > viewport.height) continue;

      const mark = document.createElement("span");
      mark.className = `word-hit ${insight.isKnown ? "known" : "guessed"}`;
      mark.style.left = `${wordLeft}px`;
      mark.style.top = `${wordTop}px`;
      mark.style.width = `${wordWidth}px`;
      mark.style.height = `${wordHeight}px`;
      if (Math.abs(angle) > 0.002) {
        mark.style.transformOrigin = "left bottom";
        mark.style.transform = `rotate(${angle}rad)`;
      }
      mark.dataset.lemma = insight.lemma;
      mark.dataset.word = insight.word;
      mark.setAttribute("aria-label", `${rawWord}: ${insight.zh}`);
      layer.append(mark);

      recordHit(insight, rawWord, pageNumber);
    }
  }
}

function buildTextMetrics(text, pdfWidth, fontHeight) {
  measureContext.font = `${fontHeight}px Arial, sans-serif`;
  const total = measureContext.measureText(text).width || text.length || 1;
  const offsets = [0];

  for (let index = 1; index <= text.length; index += 1) {
    offsets[index] = (measureContext.measureText(text.slice(0, index)).width / total) * pdfWidth;
  }

  return {
    offsetAt(index) {
      return offsets[Math.max(0, Math.min(index, offsets.length - 1))] || 0;
    }
  };
}

function recordHit(insight, rawWord, pageNumber) {
  const current = state.hits.get(insight.lemma) || {
    ...insight,
    forms: new Set(),
    pages: new Set(),
    count: 0
  };
  current.forms.add(rawWord);
  current.pages.add(pageNumber);
  current.count += 1;
  state.hits.set(insight.lemma, current);
}

function updateVocabPanel() {
  const entries = [...state.hits.values()].sort((a, b) => {
    if (b.isKnown !== a.isKnown) return Number(b.isKnown) - Number(a.isKnown);
    return b.count - a.count || a.lemma.localeCompare(b.lemma);
  });

  els.hitCount.textContent = String(entries.length);
  els.vocabList.innerHTML = "";

  if (!entries.length) {
    const empty = document.createElement("div");
    empty.className = "list-empty";
    empty.textContent = "暂无命中词";
    els.vocabList.append(empty);
    return;
  }

  for (const entry of entries) {
    const item = document.createElement("button");
    item.className = "vocab-item";
    item.type = "button";
    item.dataset.lemma = entry.lemma;

    const head = document.createElement("span");
    head.className = "vocab-word";
    head.textContent = entry.lemma;

    const tag = document.createElement("span");
    tag.className = `vocab-tag ${entry.isKnown ? "" : "muted"}`;
    tag.textContent = entry.tag;

    const zh = document.createElement("span");
    zh.className = "vocab-zh";
    zh.textContent = entry.zh;

    const meta = document.createElement("span");
    meta.className = "vocab-meta";
    meta.textContent = `${entry.count} 次 · p.${[...entry.pages].slice(0, 4).join(", ")}`;

    item.append(head, tag, zh, meta);
    item.addEventListener("click", () => scrollToLemma(entry.lemma));
    els.vocabList.append(item);
  }
}

function scrollToLemma(lemma) {
  const target = els.pages.querySelector(`[data-lemma="${CSS.escape(lemma)}"]`);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
  target.classList.add("pulse");
  window.setTimeout(() => target.classList.remove("pulse"), 900);
}

function showTooltip(anchor, insight) {
  const title = document.createElement("div");
  title.className = "tooltip-title";
  title.textContent = insight.lemma;

  const zh = document.createElement("div");
  zh.className = "tooltip-zh";
  zh.textContent = insight.zh;

  const meta = document.createElement("div");
  meta.className = "tooltip-meta";
  meta.textContent = `${insight.tag}${insight.reason ? ` · ${insight.reason}` : ""}`;

  els.tooltip.replaceChildren(title, zh, meta);
  els.tooltip.hidden = false;

  requestAnimationFrame(() => {
    const rect = anchor.getBoundingClientRect();
    const tooltipRect = els.tooltip.getBoundingClientRect();
    const gap = 10;
    const left = clamp(rect.left + rect.width / 2 - tooltipRect.width / 2, 10, window.innerWidth - tooltipRect.width - 10);
    const topCandidate = rect.top - tooltipRect.height - gap;
    const top = topCandidate > 10 ? topCandidate : rect.bottom + gap;
    els.tooltip.style.transform = `translate(${left}px, ${top}px)`;
  });
}

function hideTooltip() {
  els.tooltip.hidden = true;
}

function showStatus(message, persistent = false) {
  els.status.textContent = message;
  els.status.hidden = false;
  els.status.classList.toggle("persistent", persistent);
}

function hideStatus() {
  els.status.hidden = true;
  els.status.classList.remove("persistent");
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getFileNameFromUrl(sourceUrl) {
  try {
    const parsed = new URL(sourceUrl);
    const tail = parsed.pathname.split("/").filter(Boolean).pop();
    return tail ? decodeURIComponent(tail) : "Local PDF";
  } catch {
    return "Local PDF";
  }
}

updateZoomLabel();
initSettings();

if (initialSourceUrl) {
  loadPdfFromUrl(initialSourceUrl);
}

async function initSettings() {
  applySettings(await loadSettings());
  rerenderIfReady();
}

function applySettings(settings) {
  state.settings = buildInsightOptions(settings);
  els.heuristicToggle.checked = state.settings.allowHeuristic;
  els.segmented.querySelectorAll("button[data-profile]").forEach((button) => {
    button.classList.toggle("active", button.dataset.profile === state.settings.profile);
  });
}
