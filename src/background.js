function isPdfTab(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "file:" && /\.pdf$/i.test(decodeURIComponent(parsed.pathname));
  } catch {
    return false;
  }
}

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id || !isPdfTab(tab.url || "")) {
    await chrome.action.setBadgeText({ tabId: tab.id, text: "" });
    return;
  }

  try {
    const result = await chrome.tabs.sendMessage(tab.id, {
      type: "paper-reading-toggle",
      sourceUrl: tab.url
    });

    await chrome.action.setBadgeText({
      tabId: tab.id,
      text: result?.enabled ? "ON" : ""
    });
    await chrome.action.setBadgeBackgroundColor({ tabId: tab.id, color: "#2f756b" });
  } catch {
    await chrome.action.setBadgeText({ tabId: tab.id, text: "" });
  }
});
