import "./overlay.css";
import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";
import { getWordInsight } from "./lexicon.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL(workerUrl.replace(/^\.\//, ""));

const root = document.querySelector("#overlay-root");
const layer = document.createElement("div");
layer.className = "paper-reading-layer";
root.append(layer);

const params = new URLSearchParams(window.location.search);
const sourceUrl = params.get("src");
const WORD_PATTERN = /[A-Za-z][A-Za-z'-]{2,}/g;
const measureCanvas = document.createElement("canvas");
const measureContext = measureCanvas.getContext("2d");

let pdf = null;
let pageModels = [];
let renderToken = 0;
let parentViewport = {
  scrollX: 0,
  scrollY: 0,
  width: window.innerWidth,
  height: window.innerHeight
};

window.addEventListener("resize", () => renderOverlay());
window.addEventListener("message", (event) => {
  if (event.data?.type !== "paper-reading-viewport") return;
  parentViewport = {
    scrollX: Number(event.data.scrollX) || 0,
    scrollY: Number(event.data.scrollY) || 0,
    width: Number(event.data.width) || window.innerWidth,
    height: Number(event.data.height) || window.innerHeight
  };
  renderOverlay();
});

if (sourceUrl) {
  loadPdf(sourceUrl);
} else {
  showStatus("没有检测到 PDF 地址。");
}

async function loadPdf(url) {
  try {
    showStatus("正在生成标注层...");
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Unexpected status ${response.status}`);
    const buffer = await response.arrayBuffer();
    pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    pageModels = await collectPageModels(pdf);
    renderOverlay();
    showStatus("标注层已开启。再次点击插件可关闭。", 2200);
  } catch (error) {
    console.error(error);
    showStatus("无法读取当前 PDF。请确认扩展已开启“允许访问文件网址”。");
  }
}

async function collectPageModels(documentProxy) {
  const models = [];

  for (let pageNumber = 1; pageNumber <= documentProxy.numPages; pageNumber += 1) {
    const page = await documentProxy.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1 });
    const textContent = await page.getTextContent({ includeMarkedContent: false });
    models.push({ pageNumber, viewport, textContent });
  }

  return models;
}

function renderOverlay() {
  if (!pdf || !pageModels.length) return;

  const token = ++renderToken;
  layer.replaceChildren();

  const layout = estimateViewerLayout(pageModels);
  for (const model of pageModels) {
    if (token !== renderToken) return;
    const pageLayout = layout.pages[model.pageNumber - 1];
    const pageElement = document.createElement("section");
    pageElement.className = "paper-reading-page";
    pageElement.style.left = `${pageLayout.left}px`;
    pageElement.style.top = `${pageLayout.top}px`;
    pageElement.style.width = `${pageLayout.width}px`;
    pageElement.style.height = `${pageLayout.height}px`;
    layer.append(pageElement);

    addHighlights(pageElement, model, pageLayout.scale);
  }
}

function estimateViewerLayout(models) {
  const viewportWidth = window.innerWidth;
  const gap = 14;
  const margin = 18;
  const firstPage = models[0].viewport;
  const scale = Math.min(2.4, Math.max(0.4, (viewportWidth - margin * 2) / firstPage.width));
  let top = margin;
  const pages = [];

  for (const model of models) {
    const width = model.viewport.width * scale;
    const height = model.viewport.height * scale;
    pages.push({
      left: Math.max(margin, (viewportWidth - width) / 2),
      top: top - parentViewport.scrollY,
      width,
      height,
      scale
    });
    top += height + gap;
  }

  return { pages, scale };
}

function addHighlights(pageElement, model, scale) {
  const viewport = model.viewport.clone({ scale });

  for (const item of model.textContent.items) {
    if (!item.str || !/[A-Za-z]/.test(item.str)) continue;

    const matches = [...item.str.matchAll(WORD_PATTERN)];
    if (!matches.length) continue;

    const transform = pdfjsLib.Util.transform(viewport.transform, item.transform);
    const baseLeft = transform[4];
    const baseline = transform[5];
    const fontHeight = Math.max(7, Math.hypot(transform[2], transform[3]));
    const itemWidth = Math.max(1, (item.width || 0) * scale);
    const angle = Math.atan2(transform[1], transform[0]);
    const metrics = buildTextMetrics(item.str, itemWidth, fontHeight);

    for (const match of matches) {
      const rawWord = match[0];
      const insight = getWordInsight(rawWord, { threshold: 2, allowHeuristic: true });
      if (!insight) continue;

      const start = metrics.offsetAt(match.index);
      const end = metrics.offsetAt(match.index + rawWord.length);
      const width = Math.max(8, end - start);
      const height = Math.max(8, fontHeight * 0.78);

      const hit = document.createElement("span");
      hit.className = "paper-reading-hit";
      hit.style.left = `${baseLeft + start}px`;
      hit.style.top = `${baseline - fontHeight * 0.82}px`;
      hit.style.width = `${width}px`;
      hit.style.height = `${height}px`;
      if (Math.abs(angle) > 0.002) {
        hit.style.transformOrigin = "left bottom";
        hit.style.transform = `rotate(${angle}rad)`;
      }
      pageElement.append(hit);
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

function showStatus(message, timeout = 0) {
  let status = document.querySelector(".paper-reading-status");
  if (!status) {
    status = document.createElement("div");
    status.className = "paper-reading-status";
    root.append(status);
  }

  status.textContent = message;
  status.hidden = false;

  if (timeout) {
    window.setTimeout(() => {
      status.hidden = true;
    }, timeout);
  }
}
