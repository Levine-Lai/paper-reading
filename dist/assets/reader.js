import"./modulepreload-polyfill-V-bPtHsZ.js";import{n as e,r as t,t as n}from"./book-open-text-sfRVt_ha.js";import{a as r,i,n as a,r as o,t as s}from"./lexicon-DxCn67LT.js";var c=[`svg`,e,[[`path`,{d:`M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z`}],[`path`,{d:`M14 2v4a2 2 0 0 0 2 2h4`}],[`path`,{d:`M12 12v6`}],[`path`,{d:`m15 15-3-3-3 3`}]]],l=[`svg`,e,[[`path`,{d:`M5 12h14`}]]],u=[`svg`,e,[[`path`,{d:`M5 12h14`}],[`path`,{d:`M12 5v14`}]]];o.workerSrc=a;var d=document.querySelector(`#app`);d.innerHTML=`
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
      <div class="segmented" aria-label="Difficulty threshold">
        <button class="active" type="button" data-threshold="2">适中</button>
        <button type="button" data-threshold="4">克制</button>
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
`;var f={"book-open-text":n,"file-up":c,minus:l,plus:u};for(let e of d.querySelectorAll(`[data-lucide]`)){let n=f[e.dataset.lucide];if(!n)continue;let r=t(n);r.setAttribute(`aria-hidden`,`true`),e.replaceWith(r)}var p={reader:document.querySelector(`#reader`),emptyState:document.querySelector(`#empty-state`),pages:document.querySelector(`#pages`),fileInput:document.querySelector(`#file-input`),openFile:document.querySelector(`#open-file`),emptyOpen:document.querySelector(`#empty-open`),zoomIn:document.querySelector(`#zoom-in`),zoomOut:document.querySelector(`#zoom-out`),zoomLabel:document.querySelector(`#zoom-label`),heuristicToggle:document.querySelector(`#heuristic-toggle`),segmented:document.querySelector(`.segmented`),tooltip:document.querySelector(`#tooltip`),status:document.querySelector(`#status`),hitCount:document.querySelector(`#hit-count`),vocabList:document.querySelector(`#vocab-list`),docMeta:document.querySelector(`#doc-meta`)},m={pdf:null,fileName:``,scale:1.2,threshold:2,allowHeuristic:!0,renderToken:0,hits:new Map},h=/[A-Za-z][A-Za-z'-]{2,}/g,g=new URLSearchParams(window.location.search).get(`src`),_=document.createElement(`canvas`).getContext(`2d`);p.openFile.addEventListener(`click`,()=>p.fileInput.click()),p.emptyOpen.addEventListener(`click`,()=>p.fileInput.click()),p.fileInput.addEventListener(`change`,async e=>{let[t]=e.target.files||[];t&&await b(t),p.fileInput.value=``}),p.reader.addEventListener(`dragover`,e=>{e.preventDefault(),p.reader.classList.add(`dragging`)}),p.reader.addEventListener(`dragleave`,()=>{p.reader.classList.remove(`dragging`)}),p.reader.addEventListener(`drop`,async e=>{e.preventDefault(),p.reader.classList.remove(`dragging`);let t=[...e.dataTransfer.files].find(e=>e.type===`application/pdf`);t&&await b(t)}),p.zoomIn.addEventListener(`click`,()=>v(Math.min(2.2,m.scale+.15))),p.zoomOut.addEventListener(`click`,()=>v(Math.max(.65,m.scale-.15))),p.segmented.addEventListener(`click`,e=>{let t=e.target.closest(`button[data-threshold]`);t&&(m.threshold=Number(t.dataset.threshold),p.segmented.querySelectorAll(`button`).forEach(e=>e.classList.toggle(`active`,e===t)),C())}),p.heuristicToggle.addEventListener(`change`,()=>{m.allowHeuristic=p.heuristicToggle.checked,C()}),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&j()});function v(e){m.scale=Number(e.toFixed(2)),y(),C()}function y(){p.zoomLabel.textContent=`${Math.round(m.scale*100)}%`}async function b(e){let t=++m.renderToken;M(`解析 PDF...`),j(),p.emptyState.hidden=!0,p.pages.innerHTML=``;try{await S(await e.arrayBuffer(),e.name,t)}catch(e){console.error(e),M(`PDF 解析失败，请换一个文件试试`,!0),p.emptyState.hidden=!1}}async function x(e){let t=++m.renderToken;M(`读取本地 PDF...`),j(),p.emptyState.hidden=!0,p.pages.innerHTML=``;try{let n=await fetch(e);if(!n.ok)throw Error(`Unexpected status ${n.status}`);await S(await n.arrayBuffer(),P(e),t)}catch(e){console.error(e),m.pdf=null,p.pages.innerHTML=``,p.emptyState.hidden=!1,p.docMeta.textContent=`自动读取失败`,M(`无法自动读取这个本地 PDF。请在扩展详情页开启“允许访问文件网址”，或点击“打开 PDF”手动选择。`,!0)}}async function S(e,t,n){m.fileName=t||`Untitled PDF`,m.pdf=await r({data:e}).promise,n===m.renderToken&&await w(n)}async function C(){m.pdf&&await w(++m.renderToken)}async function w(e){if(m.pdf){M(`渲染页面...`),j(),m.hits=new Map,p.pages.innerHTML=``,p.docMeta.textContent=`${m.fileName} · ${m.pdf.numPages} 页`;for(let t=1;t<=m.pdf.numPages;t+=1){if(e!==m.renderToken)return;await T(t,e),M(`渲染页面 ${t}/${m.pdf.numPages}`)}k(),N()}}async function T(e,t){let n=await m.pdf.getPage(e);if(t!==m.renderToken)return;let r=n.getViewport({scale:m.scale}),i=window.devicePixelRatio||1,a=document.createElement(`article`);a.className=`page-frame`,a.style.width=`${r.width}px`,a.style.height=`${r.height}px`,a.dataset.page=String(e);let o=document.createElement(`canvas`);o.className=`pdf-canvas`,o.width=Math.floor(r.width*i),o.height=Math.floor(r.height*i),o.style.width=`${r.width}px`,o.style.height=`${r.height}px`;let s=document.createElement(`div`);s.className=`highlight-layer`,s.style.width=`${r.width}px`,s.style.height=`${r.height}px`;let c=document.createElement(`div`);c.className=`page-badge`,c.textContent=String(e),a.append(o,s,c),p.pages.append(a);let l=o.getContext(`2d`,{alpha:!1}),u=i===1?null:[i,0,0,i,0,0];if(await n.render({canvasContext:l,viewport:r,transform:u}).promise,t!==m.renderToken)return;let d=await n.getTextContent({includeMarkedContent:!1});t===m.renderToken&&E({pageNumber:e,textContent:d,viewport:r,layer:s})}function E({pageNumber:e,textContent:t,viewport:n,layer:r}){for(let a of t.items){if(!a.str||!/[A-Za-z]/.test(a.str))continue;let t=[...a.str.matchAll(h)];if(!t.length)continue;let o=i.transform(n.transform,a.transform),c=o[4],l=o[5],u=Math.max(8,Math.hypot(o[2],o[3])),d=Math.max(1,(a.width||a.str.length*u*.45)*n.scale),f=D(a.str,d,u),p=Math.atan2(o[1],o[0]),g=l-u;if(!(!Number.isFinite(c)||!Number.isFinite(g)))for(let i of t){let t=i[0],a=s(t,{threshold:m.threshold,allowHeuristic:m.allowHeuristic});if(!a)continue;let o=f.offsetAt(i.index),l=f.offsetAt(i.index+t.length),d=c+o,h=Math.max(10,l-o),_=g+u*.06,v=Math.max(10,u*.92);if(d<-20||_<-20||d>n.width||_>n.height)continue;let y=document.createElement(`span`);y.className=`word-hit ${a.isKnown?`known`:`guessed`}`,y.style.left=`${d}px`,y.style.top=`${_}px`,y.style.width=`${h}px`,y.style.height=`${v}px`,Math.abs(p)>.002&&(y.style.transformOrigin=`left bottom`,y.style.transform=`rotate(${p}rad)`),y.dataset.lemma=a.lemma,y.dataset.word=a.word,y.setAttribute(`aria-label`,`${t}: ${a.zh}`),r.append(y),O(a,t,e)}}}function D(e,t,n){_.font=`${n}px Arial, sans-serif`;let r=_.measureText(e).width||e.length||1,i=[0];for(let n=1;n<=e.length;n+=1)i[n]=_.measureText(e.slice(0,n)).width/r*t;return{offsetAt(e){return i[Math.max(0,Math.min(e,i.length-1))]||0}}}function O(e,t,n){let r=m.hits.get(e.lemma)||{...e,forms:new Set,pages:new Set,count:0};r.forms.add(t),r.pages.add(n),r.count+=1,m.hits.set(e.lemma,r)}function k(){let e=[...m.hits.values()].sort((e,t)=>t.isKnown===e.isKnown?t.count-e.count||e.lemma.localeCompare(t.lemma):Number(t.isKnown)-Number(e.isKnown));if(p.hitCount.textContent=String(e.length),p.vocabList.innerHTML=``,!e.length){let e=document.createElement(`div`);e.className=`list-empty`,e.textContent=`暂无命中词`,p.vocabList.append(e);return}for(let t of e){let e=document.createElement(`button`);e.className=`vocab-item`,e.type=`button`,e.dataset.lemma=t.lemma;let n=document.createElement(`span`);n.className=`vocab-word`,n.textContent=t.lemma;let r=document.createElement(`span`);r.className=`vocab-tag ${t.isKnown?``:`muted`}`,r.textContent=t.tag;let i=document.createElement(`span`);i.className=`vocab-zh`,i.textContent=t.zh;let a=document.createElement(`span`);a.className=`vocab-meta`,a.textContent=`${t.count} 次 · p.${[...t.pages].slice(0,4).join(`, `)}`,e.append(n,r,i,a),e.addEventListener(`click`,()=>A(t.lemma)),p.vocabList.append(e)}}function A(e){let t=p.pages.querySelector(`[data-lemma="${CSS.escape(e)}"]`);t&&(t.scrollIntoView({behavior:`smooth`,block:`center`,inline:`center`}),t.classList.add(`pulse`),window.setTimeout(()=>t.classList.remove(`pulse`),900))}function j(){p.tooltip.hidden=!0}function M(e,t=!1){p.status.textContent=e,p.status.hidden=!1,p.status.classList.toggle(`persistent`,t)}function N(){p.status.hidden=!0,p.status.classList.remove(`persistent`)}function P(e){try{let t=new URL(e).pathname.split(`/`).filter(Boolean).pop();return t?decodeURIComponent(t):`Local PDF`}catch{return`Local PDF`}}y(),g&&x(g);