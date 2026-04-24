import"./modulepreload-polyfill-V-bPtHsZ.js";import{n as e,r as t,t as n}from"./book-open-text-sfRVt_ha.js";var r=[`svg`,e,[[`circle`,{cx:`12`,cy:`12`,r:`10`}],[`path`,{d:`m9 12 2 2 4-4`}]]],i=[`svg`,e,[[`circle`,{cx:`12`,cy:`12`,r:`10`}],[`line`,{x1:`9`,x2:`15`,y1:`15`,y2:`9`}]]],a=[`svg`,e,[[`path`,{d:`M15 3h6v6`}],[`path`,{d:`M10 14 21 3`}],[`path`,{d:`M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6`}]]],o=[`svg`,e,[[`path`,{d:`M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0`}],[`circle`,{cx:`12`,cy:`12`,r:`3`}]]],s=[`svg`,e,[[`path`,{d:`M12 2v10`}],[`path`,{d:`M18.4 6.6a9 9 0 1 1-12.77.04`}]]],c=[`svg`,e,[[`path`,{d:`M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8`}],[`path`,{d:`M21 3v5h-5`}],[`path`,{d:`M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16`}],[`path`,{d:`M8 16H3v5`}]]],l=document.querySelector(`#popup`);l.innerHTML=`
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
`;var u={"book-open-text":n,"check-circle-2":r,"circle-slash":i,"external-link":a,eye:o,power:s,"refresh-cw":c};for(let e of l.querySelectorAll(`[data-lucide]`)){let n=u[e.dataset.lucide];if(!n)continue;let r=t(n);r.setAttribute(`aria-hidden`,`true`),e.replaceWith(r)}var d={stateCard:document.querySelector(`#state-card`),stateTitle:document.querySelector(`#state-title`),stateDetail:document.querySelector(`#state-detail`),status:document.querySelector(`#popup-status`),enable:document.querySelector(`#enable-highlights`),disable:document.querySelector(`#disable-highlights`),openReader:document.querySelector(`#open-reader`),check:document.querySelector(`#check-status`)},f=null,p=``;d.enable.addEventListener(`click`,()=>h(!0)),d.disable.addEventListener(`click`,()=>h(!1)),d.openReader.addEventListener(`click`,()=>g()),d.check.addEventListener(`click`,()=>m()),m();async function m(){if(f=await _(),p=x(f?.url||``),!p){y({connected:!1,enabled:!1,title:`不是本地 PDF`,detail:`当前标签页不是 file:// PDF`,message:`请先用浏览器正常打开一个本地 PDF。`,canUseReader:!1});return}let e=await v({type:`paper-reading-status`});if(!e?.connected){y({connected:!1,enabled:!1,title:`原生查看器不可注入`,detail:`当前 PDF 页面没有可通信脚本`,message:`Chrome/Edge 内置 PDF 查看器通常不允许扩展直接加 DOM 标注。可以用插件阅读器打开当前 PDF 来验证标黄。`,canUseReader:!0});return}y({connected:!0,enabled:e.enabled,title:e.enabled?`标黄已开启`:`标黄已关闭`,detail:`当前 PDF 已连接插件`,message:e.enabled?`标注层正在工作。再次点击关闭即可移除。`:`可以点击“开启标黄”测试。`,canUseReader:!0})}async function h(e){if(f||=await _(),p=x(f?.url||``),!p){await m();return}let t=await v({type:e?`paper-reading-enable`:`paper-reading-disable`,sourceUrl:f.url});if(!t?.connected){y({connected:!1,enabled:!1,title:`无法注入当前 PDF`,detail:`浏览器内置 PDF 查看器拒绝脚本`,message:`这类页面无法直接叠加标黄层。请点“用插件阅读器打开”测试当前 PDF。`,canUseReader:!0});return}y({connected:!0,enabled:t.enabled,title:t.enabled?`标黄已开启`:`标黄已关闭`,detail:`当前 PDF 已连接插件`,message:t.enabled?`如果页面右下角出现提示，说明 overlay 已加载。`:`标注层已移除。`,canUseReader:!0})}async function g(){if(!p){await m();return}await chrome.tabs.create({url:chrome.runtime.getURL(`reader.html?src=${encodeURIComponent(p)}`)}),window.close()}async function _(){let[e]=await chrome.tabs.query({active:!0,currentWindow:!0});return e||null}async function v(e){try{return f?.id?await chrome.tabs.sendMessage(f.id,e):null}catch{return null}}function y({connected:e,enabled:t,title:n,detail:r,message:i,canUseReader:a}){d.stateCard.classList.toggle(`connected`,e),d.stateCard.classList.toggle(`enabled`,t),d.stateTitle.textContent=n,d.stateDetail.textContent=r,d.status.textContent=i,d.enable.disabled=!e||t,d.disable.disabled=!e||!t,d.openReader.hidden=!a,b(t)}async function b(e){try{let t=f?.id?{tabId:f.id,text:e?`ON`:``}:{text:e?`ON`:``};if(await chrome.action.setBadgeText(t),e){let e=f?.id?{tabId:f.id,color:`#2f756b`}:{color:`#2f756b`};await chrome.action.setBadgeBackgroundColor(e)}}catch{}}function x(e){try{let t=new URL(e);if(t.protocol===`file:`&&/\.pdf$/i.test(decodeURIComponent(t.pathname)))return e;let n=t.searchParams.get(`src`)||t.searchParams.get(`file`);if(n?.startsWith(`file:`)){let e=new URL(n);if(/\.pdf$/i.test(decodeURIComponent(e.pathname)))return n}}catch{return``}return``}