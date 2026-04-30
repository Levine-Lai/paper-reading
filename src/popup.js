import "./popup.css";
import { BookOpenText, CircleSlash, ExternalLink, Eye, Power, RefreshCw, createElement } from "lucide";

const popup = document.querySelector("#popup");

popup.innerHTML = `
  <main class="popup-shell">
    <section class="popup-brand">
      <div class="popup-mark"><i data-lucide="book-open-text"></i></div>
      <div class="popup-title">
        <strong>Paper Reading</strong>
        <span>web article highlighter</span>
      </div>
    </section>

    <section class="state-card" id="state-card">
      <div class="state-icon"><i data-lucide="eye"></i></div>
      <div>
        <strong id="state-title">正在检测</strong>
        <span id="state-detail">检查当前页面是否可用</span>
      </div>
    </section>

    <section class="popup-actions">
      <button id="open-vocab" class="popup-button" type="button">
        <i data-lucide="book-open-text"></i>
        <span>打开生词库</span>
      </button>
      <button id="enable-highlights" class="popup-button" type="button">
        <i data-lucide="power"></i>
        <span>开启标黄</span>
      </button>
      <button id="disable-highlights" class="popup-button secondary" type="button">
        <i data-lucide="circle-slash"></i>
        <span>关闭标黄</span>
      </button>
      <button id="open-pdf-reader" class="popup-button secondary" type="button" hidden>
        <i data-lucide="external-link"></i>
        <span>用插件阅读器打开 PDF</span>
      </button>
      <button id="check-status" class="popup-button ghost" type="button">
        <i data-lucide="refresh-cw"></i>
        <span>重新检测</span>
      </button>
    </section>

    <p id="popup-status" class="popup-status">在网页文章页面点击“开启标黄”。</p>
    <p class="popup-note">普通网页可直接标黄；浏览器内置 PDF 查看器通常不能被直接注入，需要使用插件阅读器。</p>
  </main>
`;

const ICONS = {
  "book-open-text": BookOpenText,
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
  openVocab: document.querySelector("#open-vocab"),
  enable: document.querySelector("#enable-highlights"),
  disable: document.querySelector("#disable-highlights"),
  openPdfReader: document.querySelector("#open-pdf-reader"),
  check: document.querySelector("#check-status")
};

let activeTab = null;
let currentPdfUrl = "";
let currentPageKind = "unknown";

els.openVocab.addEventListener("click", () => openVocab());
els.enable.addEventListener("click", () => setHighlights(true));
els.disable.addEventListener("click", () => setHighlights(false));
els.openPdfReader.addEventListener("click", () => openPdfReader());
els.check.addEventListener("click", () => refreshStatus());

refreshStatus();

async function openVocab() {
  await chrome.tabs.create({ url: chrome.runtime.getURL("vocab.html") });
  window.close();
}

async function refreshStatus() {
  activeTab = await getActiveTab();
  const url = activeTab?.url || "";
  currentPdfUrl = extractPdfUrl(url);
  currentPageKind = getPageKind(url);

  if (currentPageKind === "unsupported") {
    renderState({
      connected: false,
      enabled: false,
      title: "此页面不支持",
      detail: "扩展不能注入浏览器内部页面",
      message: "请在普通网页文章、https 网站，或本地 PDF 页面使用。",
      showPdfReader: false
    });
    return;
  }

  const result = await sendToActiveTab({ type: "paper-reading-status" });
  if (result?.connected) {
    const countText = result.enabled ? `已标出 ${result.count || 0} 个词` : "可以点击开启标黄";
    renderState({
      connected: true,
      enabled: result.enabled,
      title: result.enabled ? "标黄已开启" : "网页文章已连接",
      detail: result.pageType === "web" ? countText : "当前页面已连接插件",
      message: result.enabled ? "悬停黄色单词可查看中文释义。" : "点击“开启标黄”会扫描当前网页正文。",
      showPdfReader: false
    });
    return;
  }

  if (currentPdfUrl) {
    renderState({
      connected: false,
      enabled: false,
      title: "原生 PDF 不可注入",
      detail: "浏览器内置 PDF 查看器没有响应",
      message: "可以用插件阅读器打开当前 PDF；普通网页文章则可直接标黄。",
      showPdfReader: true
    });
    return;
  }

  renderState({
    connected: false,
    enabled: false,
    title: "网页脚本未连接",
    detail: "当前网站没有响应插件",
    message: "请刷新页面后重试。若仍失败，可能是该网站限制扩展脚本。",
    showPdfReader: false
  });
}

async function setHighlights(enabled) {
  activeTab = activeTab || (await getActiveTab());
  const url = activeTab?.url || "";
  currentPdfUrl = extractPdfUrl(url);
  currentPageKind = getPageKind(url);

  if (currentPageKind === "unsupported") {
    await refreshStatus();
    return;
  }

  const result = await sendToActiveTab({
    type: enabled ? "paper-reading-enable" : "paper-reading-disable",
    sourceUrl: url
  });

  if (!result?.connected) {
    await refreshStatus();
    return;
  }

  renderState({
    connected: true,
    enabled: result.enabled,
    title: result.enabled ? "标黄已开启" : "标黄已关闭",
    detail: result.enabled ? `已标出 ${result.count || 0} 个词` : "当前页面已恢复",
    message: result.enabled ? "悬停黄色单词可查看中文释义。" : "标黄已移除。",
    showPdfReader: false
  });
}

async function openPdfReader() {
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

function renderState({ connected, enabled, title, detail, message, showPdfReader }) {
  els.stateCard.classList.toggle("connected", connected);
  els.stateCard.classList.toggle("enabled", enabled);
  els.stateTitle.textContent = title;
  els.stateDetail.textContent = detail;
  els.status.textContent = message;
  els.enable.disabled = !connected || enabled;
  els.disable.disabled = !connected || !enabled;
  els.openPdfReader.hidden = !showPdfReader;
  updateBadge(enabled);
}

async function updateBadge(enabled) {
  try {
    const badge = activeTab?.id ? { tabId: activeTab.id, text: enabled ? "ON" : "" } : { text: enabled ? "ON" : "" };
    await chrome.action.setBadgeText(badge);
    if (enabled) {
      const color = activeTab?.id ? { tabId: activeTab.id, color: "#2f756b" } : { color: "#2f756b" };
      await chrome.action.setBadgeBackgroundColor(color);
    }
  } catch {
    // Popup state is still useful if the browser refuses a badge update.
  }
}

function getPageKind(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") return "web";
    if (parsed.protocol === "file:" && /\.pdf$/i.test(decodeURIComponent(parsed.pathname))) return "pdf";
  } catch {
    return "unsupported";
  }

  return "unsupported";
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
