import "./popup.css";
import { BookOpenText, CheckCircle2, CircleSlash, ExternalLink, Eye, Power, RefreshCw, createElement } from "lucide";

const popup = document.querySelector("#popup");

popup.innerHTML = `
  <main class="popup-shell">
    <section class="popup-brand">
      <div class="popup-mark"><i data-lucide="book-open-text"></i></div>
      <div class="popup-title">
        <strong>Paper Reading</strong>
        <span>PDF vocabulary highlighter</span>
      </div>
    </section>

    <section class="state-card" id="state-card">
      <div class="state-icon"><i data-lucide="eye"></i></div>
      <div>
        <strong id="state-title">正在检测</strong>
        <span id="state-detail">检查当前标签页是否可用</span>
      </div>
    </section>

    <section class="popup-actions">
      <button id="enable-highlights" class="popup-button" type="button">
        <i data-lucide="power"></i>
        <span>开启标黄</span>
      </button>
      <button id="disable-highlights" class="popup-button secondary" type="button">
        <i data-lucide="circle-slash"></i>
        <span>关闭标黄</span>
      </button>
      <button id="open-reader" class="popup-button secondary" type="button" hidden>
        <i data-lucide="external-link"></i>
        <span>用插件阅读器打开</span>
      </button>
      <button id="check-status" class="popup-button ghost" type="button">
        <i data-lucide="refresh-cw"></i>
        <span>重新检测</span>
      </button>
    </section>

    <p id="popup-status" class="popup-status">请先正常打开一个本地 PDF，再点击开启。</p>
    <p class="popup-note">如果显示未连接，请在扩展详情页开启“允许访问文件网址”，然后刷新 PDF 页面。</p>
  </main>
`;

const ICONS = {
  "book-open-text": BookOpenText,
  "check-circle-2": CheckCircle2,
  "circle-slash": CircleSlash,
  "external-link": ExternalLink,
  eye: Eye,
  power: Power,
  "refresh-cw": RefreshCw
};

for (const iconSlot of popup.querySelectorAll("[data-lucide]")) {
  const icon = ICONS[iconSlot.dataset.lucide];
  if (!icon) continue;
  const svg = createElement(icon);
  svg.setAttribute("aria-hidden", "true");
  iconSlot.replaceWith(svg);
}

const els = {
  stateCard: document.querySelector("#state-card"),
  stateTitle: document.querySelector("#state-title"),
  stateDetail: document.querySelector("#state-detail"),
  status: document.querySelector("#popup-status"),
  enable: document.querySelector("#enable-highlights"),
  disable: document.querySelector("#disable-highlights"),
  openReader: document.querySelector("#open-reader"),
  check: document.querySelector("#check-status")
};

let activeTab = null;
let currentPdfUrl = "";

els.enable.addEventListener("click", () => setHighlights(true));
els.disable.addEventListener("click", () => setHighlights(false));
els.openReader.addEventListener("click", () => openReaderFallback());
els.check.addEventListener("click", () => refreshStatus());

refreshStatus();

async function refreshStatus() {
  activeTab = await getActiveTab();
  currentPdfUrl = extractPdfUrl(activeTab?.url || "");
  if (!currentPdfUrl) {
    renderState({
      connected: false,
      enabled: false,
      title: "不是本地 PDF",
      detail: "当前标签页不是 file:// PDF",
      message: "请先用浏览器正常打开一个本地 PDF。",
      canUseReader: false
    });
    return;
  }

  const result = await sendToActiveTab({ type: "paper-reading-status" });
  if (!result?.connected) {
    renderState({
      connected: false,
      enabled: false,
      title: "原生查看器不可注入",
      detail: "当前 PDF 页面没有可通信脚本",
      message: "Chrome/Edge 内置 PDF 查看器通常不允许扩展直接加 DOM 标注。可以用插件阅读器打开当前 PDF 来验证标黄。",
      canUseReader: true
    });
    return;
  }

  renderState({
    connected: true,
    enabled: result.enabled,
    title: result.enabled ? "标黄已开启" : "标黄已关闭",
    detail: "当前 PDF 已连接插件",
    message: result.enabled ? "标注层正在工作。再次点击关闭即可移除。" : "可以点击“开启标黄”测试。",
    canUseReader: true
  });
}

async function setHighlights(enabled) {
  activeTab = activeTab || (await getActiveTab());
  currentPdfUrl = extractPdfUrl(activeTab?.url || "");
  if (!currentPdfUrl) {
    await refreshStatus();
    return;
  }

  const result = await sendToActiveTab({
    type: enabled ? "paper-reading-enable" : "paper-reading-disable",
    sourceUrl: activeTab.url
  });

  if (!result?.connected) {
    renderState({
      connected: false,
      enabled: false,
      title: "无法注入当前 PDF",
      detail: "浏览器内置 PDF 查看器拒绝脚本",
      message: "这类页面无法直接叠加标黄层。请点“用插件阅读器打开”测试当前 PDF。",
      canUseReader: true
    });
    return;
  }

  renderState({
    connected: true,
    enabled: result.enabled,
    title: result.enabled ? "标黄已开启" : "标黄已关闭",
    detail: "当前 PDF 已连接插件",
    message: result.enabled ? "如果页面右下角出现提示，说明 overlay 已加载。" : "标注层已移除。",
    canUseReader: true
  });
}

async function openReaderFallback() {
  if (!currentPdfUrl) {
    await refreshStatus();
    return;
  }

  await chrome.tabs.create({
    url: chrome.runtime.getURL(`reader.html?src=${encodeURIComponent(currentPdfUrl)}`)
  });
  window.close();
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab || null;
}

async function sendToActiveTab(message) {
  try {
    if (!activeTab?.id) return null;
    return await chrome.tabs.sendMessage(activeTab.id, message);
  } catch {
    return null;
  }
}

function renderState({ connected, enabled, title, detail, message, canUseReader }) {
  els.stateCard.classList.toggle("connected", connected);
  els.stateCard.classList.toggle("enabled", enabled);
  els.stateTitle.textContent = title;
  els.stateDetail.textContent = detail;
  els.status.textContent = message;
  els.enable.disabled = !connected || enabled;
  els.disable.disabled = !connected || !enabled;
  els.openReader.hidden = !canUseReader;
  updateBadge(enabled);
}

async function updateBadge(enabled) {
  try {
    const options = activeTab?.id ? { tabId: activeTab.id, text: enabled ? "ON" : "" } : { text: enabled ? "ON" : "" };
    await chrome.action.setBadgeText(options);
    if (enabled) {
      const colorOptions = activeTab?.id ? { tabId: activeTab.id, color: "#2f756b" } : { color: "#2f756b" };
      await chrome.action.setBadgeBackgroundColor(colorOptions);
    }
  } catch {
    // The popup state is still useful even if the browser refuses a badge update.
  }
}

function extractPdfUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "file:" && /\.pdf$/i.test(decodeURIComponent(parsed.pathname))) {
      return url;
    }

    const embedded = parsed.searchParams.get("src") || parsed.searchParams.get("file");
    if (embedded?.startsWith("file:")) {
      const embeddedUrl = new URL(embedded);
      if (/\.pdf$/i.test(decodeURIComponent(embeddedUrl.pathname))) return embedded;
    }
  } catch {
    return "";
  }

  return "";
}
