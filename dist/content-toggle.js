(function paperReadingContentToggle() {
  const IFRAME_ID = "paper-reading-overlay-frame";

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    const existing = document.getElementById(IFRAME_ID);

    if (message?.type === "paper-reading-status") {
      sendResponse({ connected: true, enabled: Boolean(existing) });
      return true;
    }

    if (message?.type === "paper-reading-disable") {
      removeOverlay(existing);
      sendResponse({ connected: true, enabled: false });
      return true;
    }

    if (message?.type !== "paper-reading-toggle" && message?.type !== "paper-reading-enable") return false;

    if (existing) {
      if (message.type === "paper-reading-toggle") {
        removeOverlay(existing);
        sendResponse({ connected: true, enabled: false });
      } else {
        sendResponse({ connected: true, enabled: true });
      }
      return true;
    }

    const sourceUrl = message.sourceUrl || window.location.href;
    const frame = document.createElement("iframe");
    frame.id = IFRAME_ID;
    frame.src = chrome.runtime.getURL(`overlay.html?src=${encodeURIComponent(sourceUrl)}`);
    frame.setAttribute("aria-hidden", "true");
    frame.style.cssText = [
      "position:fixed",
      "inset:0",
      "width:100vw",
      "height:100vh",
      "border:0",
      "z-index:2147483647",
      "pointer-events:none",
      "background:transparent"
    ].join(";");

    document.documentElement.appendChild(frame);
    const syncViewport = () => {
      frame.contentWindow?.postMessage(
        {
          type: "paper-reading-viewport",
          scrollX: window.scrollX,
          scrollY: window.scrollY,
          width: window.innerWidth,
          height: window.innerHeight
        },
        "*"
      );
    };
    const cleanup = () => {
      window.removeEventListener("scroll", syncViewport, true);
      window.removeEventListener("resize", syncViewport);
    };
    frame.addEventListener("load", syncViewport);
    window.addEventListener("scroll", syncViewport, true);
    window.addEventListener("resize", syncViewport);
    frame.paperReadingCleanup = cleanup;
    sendResponse({ connected: true, enabled: true });
    return true;
  });

  function removeOverlay(frame) {
    if (!frame) return;
    frame.paperReadingCleanup?.();
    frame.remove();
  }
})();
