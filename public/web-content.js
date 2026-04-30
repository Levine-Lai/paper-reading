(function paperReadingWebContent() {
  const MARK_CLASS = "paper-reading-web-hit";
  const STYLE_ID = "paper-reading-web-style";
  const TOOLTIP_ID = "paper-reading-web-tooltip";
  const POPOVER_ID = "paper-reading-web-popover";
  const HIGHLIGHTED_ATTR = "data-paper-reading-highlighted";
  const IGNORED_KEY = "paperReadingIgnoredWords";
  const SAVED_KEY = "paperReadingSavedWords";

  const COMMON_WORDS = new Set(
    `
    a about above across after again against all almost along already also although always am among an and another any
    anyone anything are around as ask at away back be because become been before began begin being best better between
    big both but by came can cannot case child children come common could day did different do does done down each early
    end enough even every example fact far few find first for found from full further get give given go good got great
    group had has have he help her here high him his how however if important in include into is it its just keep kind
    know last late later learn left less let like line little long look made make many may me mean might more most much
    must my near need never new next no not now of off often old on once one only open or order other our out over own
    part people place point possible put question quite read real right said same saw say see seem seen set several she
    should show since small so some something still such take than that the their them then there these they thing think
    this those though through time to together too took two under until up us use used using very want was way we well
    went were what when where whether which while who why will with within without work would year years you your
    `.trim().split(/\s+/)
  );
  const BASIC_BLOCKLIST = new Set(
    `
    actually almost armchairs before book books carried carry century class classes clue clubs coffee collaborators
    concept consider create creativity data design discussions doing dream dreamed during education famous field
    finally first generation happened helped high houses interesting james larger libraries mentioned modern names
    nineteenth nitrous numbers origins oxide paid papers played posts publication qualities rarely reading receive
    remained research science seemed several shift shaping studied study support taking talented teens twenties
    understand visual week worked years
    `.trim().split(/\s+/)
  );

  const LEXICON = {
    accelerate: ["加速；促进", "CET6+"],
    accommodate: ["容纳；适应；调和", "CET6+"],
    accumulate: ["积累；聚积", "CET6+"],
    adjacent: ["相邻的；毗邻的", "CET6+"],
    aggregate: ["总计；聚合；合计的", "学术"],
    albeit: ["尽管；虽然", "低频"],
    algorithm: ["算法", "学术"],
    alleviate: ["缓解；减轻", "CET6+"],
    allocate: ["分配；拨出", "CET6+"],
    ambiguous: ["模棱两可的；含糊的", "CET6+"],
    analogy: ["类比；相似关系", "学术"],
    anomaly: ["异常；反常现象", "学术"],
    anticipate: ["预期；预料", "CET6+"],
    apparent: ["显然的；表面上的", "CET6+"],
    approximate: ["近似的；大约的", "学术"],
    arbitrary: ["任意的；武断的", "学术"],
    ascertain: ["查明；确定", "低频"],
    assess: ["评估；评价", "学术"],
    attribute: ["属性；把……归因于", "学术"],
    augment: ["增加；增强", "学术"],
    auxiliary: ["辅助的；辅助设备", "CET6+"],
    bias: ["偏差；偏见", "学术"],
    canonical: ["标准的；规范的", "学术"],
    capacity: ["容量；能力", "学术"],
    causal: ["因果的", "学术"],
    coherence: ["连贯性；一致性", "学术"],
    coincide: ["同时发生；一致", "CET6+"],
    compensate: ["补偿；弥补", "CET6+"],
    compelling: ["有说服力的；强烈的", "CET6+"],
    complement: ["补充；补足物", "学术"],
    comprehensive: ["全面的；综合的", "CET6+"],
    comprise: ["由……组成；包含", "CET6+"],
    conceive: ["构想；设想", "CET6+"],
    concurrent: ["同时发生的；并发的", "学术"],
    confer: ["授予；商议", "CET6+"],
    confound: ["混淆；干扰因素", "学术"],
    conjecture: ["推测；猜想", "低频"],
    consecutive: ["连续的；连贯的", "CET6+"],
    consensus: ["共识；一致意见", "CET6+"],
    constraint: ["限制；约束", "学术"],
    constitute: ["构成；组成", "CET6+"],
    contaminate: ["污染；弄脏", "CET6+"],
    converge: ["收敛；汇聚", "学术"],
    correlate: ["相关；使相互关联", "学术"],
    criterion: ["标准；准则", "学术"],
    crucial: ["关键的；至关重要的", "CET6+"],
    cumulative: ["累积的", "CET6+"],
    demonstrate: ["证明；展示", "学术"],
    denote: ["表示；指代", "学术"],
    dense: ["密集的；稠密的", "学术"],
    derive: ["推导出；源自", "学术"],
    deteriorate: ["恶化；退化", "CET6+"],
    deterministic: ["确定性的", "学术"],
    deviation: ["偏差；偏离", "学术"],
    diagnose: ["诊断；判断", "CET6+"],
    dimension: ["维度；尺寸", "学术"],
    discrete: ["离散的；分离的", "学术"],
    discriminate: ["区分；歧视", "CET6+"],
    disparity: ["差异；悬殊", "CET6+"],
    distort: ["扭曲；歪曲", "CET6+"],
    diverse: ["多样的；不同的", "学术"],
    domain: ["领域；域", "学术"],
    dynamic: ["动态的；动力学的", "学术"],
    elaborate: ["详述；精心制作的", "CET6+"],
    eliminate: ["消除；排除", "学术"],
    empirical: ["经验的；实证的", "学术"],
    encompass: ["包含；涵盖", "CET6+"],
    encounter: ["遇到；遭遇", "CET6+"],
    enhance: ["增强；提高", "CET6+"],
    entail: ["意味着；需要", "学术"],
    entity: ["实体；存在物", "学术"],
    enumerate: ["列举；枚举", "学术"],
    equivalent: ["等价的；等同物", "学术"],
    erroneous: ["错误的；不正确的", "低频"],
    establish: ["建立；确立", "学术"],
    estimate: ["估计；估算", "学术"],
    evaluate: ["评估；评价", "学术"],
    exacerbate: ["加剧；恶化", "低频"],
    explicit: ["明确的；显式的", "学术"],
    exploit: ["利用；开发；剥削", "CET6+"],
    facilitate: ["促进；使便利", "CET6+"],
    feasible: ["可行的；可实现的", "CET6+"],
    fidelity: ["保真度；忠实度", "学术"],
    finite: ["有限的", "学术"],
    fluctuate: ["波动；起伏", "CET6+"],
    formulate: ["制定；阐述；构建公式", "学术"],
    fragment: ["片段；碎片", "学术"],
    fundamental: ["基本的；根本的", "学术"],
    generate: ["生成；产生", "学术"],
    hierarchical: ["层级的；分层的", "学术"],
    heuristic: ["启发式方法；经验法则", "学术"],
    homogeneous: ["同质的；均匀的", "学术"],
    hypothesis: ["假设；假说", "学术"],
    illustrate: ["说明；阐明", "学术"],
    implicit: ["含蓄的；隐式的", "学术"],
    impose: ["施加；强加", "CET6+"],
    incentive: ["激励；动机", "CET6+"],
    incorporate: ["纳入；包含", "CET6+"],
    induce: ["引起；诱导；归纳", "学术"],
    infer: ["推断；推理", "学术"],
    inherent: ["固有的；内在的", "CET6+"],
    inhibit: ["抑制；阻碍", "CET6+"],
    initiate: ["开始；发起", "CET6+"],
    insight: ["洞见；深刻理解", "学术"],
    integrate: ["整合；合并", "学术"],
    intermediate: ["中间的；中级的", "CET6+"],
    interpret: ["解释；解读", "学术"],
    intervene: ["干预；介入", "CET6+"],
    intrinsic: ["内在的；固有的", "CET6+"],
    invariant: ["不变的；不变量", "学术"],
    investigate: ["调查；研究", "学术"],
    invoke: ["调用；援引", "学术"],
    isolate: ["隔离；分离", "CET6+"],
    latent: ["潜在的；隐性的", "学术"],
    leverage: ["利用；杠杆作用", "学术"],
    longitudinal: ["纵向的；长期追踪的", "学术"],
    magnitude: ["大小；量级；重要性", "学术"],
    manipulate: ["操纵；处理", "CET6+"],
    marginal: ["边际的；微小的", "学术"],
    mediate: ["调解；作为中介", "学术"],
    mechanism: ["机制；机械装置", "学术"],
    methodology: ["方法论；研究方法", "学术"],
    metric: ["指标；度量", "学术"],
    mitigate: ["缓解；减轻", "CET6+"],
    modality: ["模态；形式", "学术"],
    morphology: ["形态学；形态结构", "学术"],
    notation: ["符号；记法", "学术"],
    novel: ["新颖的；小说", "学术"],
    objective: ["目标；客观的", "学术"],
    obtain: ["获得；得到", "学术"],
    occurrence: ["发生；出现；事件", "学术"],
    optimize: ["优化；使最优", "学术"],
    paradigm: ["范式；典型模式", "学术"],
    parameter: ["参数；限定因素", "学术"],
    partition: ["划分；分区", "学术"],
    perceive: ["感知；察觉", "CET6+"],
    persistent: ["持续的；坚持的", "CET6+"],
    perspective: ["视角；观点", "学术"],
    phenomenon: ["现象", "学术"],
    plausible: ["貌似合理的；可信的", "CET6+"],
    preliminary: ["初步的；预备的", "CET6+"],
    premise: ["前提；假定", "学术"],
    prevalent: ["普遍的；流行的", "CET6+"],
    probability: ["概率；可能性", "学术"],
    procedure: ["程序；步骤", "学术"],
    prohibit: ["禁止；阻止", "CET6+"],
    propagate: ["传播；扩散；繁殖", "学术"],
    proportion: ["比例；部分", "学术"],
    protocol: ["协议；规程", "学术"],
    qualitative: ["定性的；质性的", "学术"],
    quantitative: ["定量的；数量的", "学术"],
    rationale: ["理由；基本原理", "学术"],
    recursive: ["递归的", "学术"],
    redundant: ["冗余的；多余的", "CET6+"],
    refine: ["改进；精炼", "学术"],
    regime: ["制度；体制；状态区间", "学术"],
    reinforce: ["强化；加固", "CET6+"],
    relevant: ["相关的；切题的", "学术"],
    replicate: ["复制；复现实验", "学术"],
    residual: ["残余的；残差", "学术"],
    robust: ["稳健的；鲁棒的", "学术"],
    salient: ["显著的；突出的", "学术"],
    scenario: ["情景；方案", "学术"],
    schema: ["模式；图式；纲要", "学术"],
    semantic: ["语义的", "学术"],
    sequential: ["连续的；顺序的", "学术"],
    simulate: ["模拟；仿真", "学术"],
    sparse: ["稀疏的；稀少的", "学术"],
    spatial: ["空间的", "学术"],
    specify: ["具体说明；指定", "学术"],
    spectrum: ["谱；范围", "学术"],
    statistic: ["统计量；统计资料", "学术"],
    stochastic: ["随机的", "学术"],
    subsequent: ["随后的；后来的", "CET6+"],
    subset: ["子集；一小部分", "学术"],
    substantial: ["大量的；实质性的", "CET6+"],
    subtle: ["微妙的；不易察觉的", "CET6+"],
    sufficient: ["足够的；充分的", "学术"],
    suppress: ["抑制；压制", "CET6+"],
    sustain: ["维持；支撑", "CET6+"],
    synthesize: ["综合；合成", "学术"],
    taxonomy: ["分类法；分类体系", "学术"],
    temporal: ["时间的；暂时的", "学术"],
    threshold: ["阈值；门槛", "学术"],
    topology: ["拓扑；拓扑结构", "学术"],
    trajectory: ["轨迹；发展路径", "学术"],
    transient: ["短暂的；瞬态的", "学术"],
    ubiquitous: ["无处不在的；普遍存在的", "低频"],
    underlying: ["潜在的；根本的；位于下面的", "学术"],
    validate: ["验证；确认有效", "学术"],
    variance: ["方差；差异", "学术"],
    viable: ["可行的；能生存的", "CET6+"],
    volatile: ["易变的；不稳定的", "CET6+"]
  };

  let enabled = false;
  let count = 0;
  const dictChunks = new Map();
  let ignoredWords = new Set();
  let savedWords = {};

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === "paper-reading-status") {
      sendResponse({ connected: true, enabled, pageType: "web", count });
      return true;
    }
    if (message?.type === "paper-reading-enable" || message?.type === "paper-reading-toggle") {
      handleEnableMessage(message).then(sendResponse);
      return true;
    }
    if (message?.type === "paper-reading-disable") {
      disable();
      sendResponse({ connected: true, enabled, pageType: "web", count });
      return true;
    }
    return false;
  });

  async function handleEnableMessage(message) {
    if (enabled && message.type === "paper-reading-toggle") {
        disable();
    } else {
      await enable();
    }
    return { connected: true, enabled, pageType: "web", count };
  }

  async function enable() {
    if (enabled) return;
    injectStyle();
    await loadUserLists();
    const root = findArticleRoot();
    const letters = collectCandidateLetters(root);
    await Promise.all([...letters].map(loadDictChunk));
    count = highlightArticle(root);
    enabled = true;
  }

  function disable() {
    document.querySelectorAll(`.${MARK_CLASS}`).forEach((mark) => {
      mark.replaceWith(document.createTextNode(mark.textContent || ""));
    });
    document.body.normalize();
    document.getElementById(TOOLTIP_ID)?.remove();
    document.getElementById(POPOVER_ID)?.remove();
    enabled = false;
    count = 0;
  }

  function highlightArticle(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !/[A-Za-z]{4,}/.test(node.nodeValue)) return NodeFilter.FILTER_REJECT;
        const parent = node.parentElement;
        if (!parent || parent.closest(`.${MARK_CLASS}, script, style, textarea, input, select, button, pre, code, nav, header, footer, aside, svg, canvas`)) {
          return NodeFilter.FILTER_REJECT;
        }
        const style = window.getComputedStyle(parent);
        if (style.visibility === "hidden" || style.display === "none") return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    let hits = 0;
    for (const node of nodes) {
      hits += replaceTextNode(node);
    }
    return hits;
  }

  function replaceTextNode(node) {
    const text = node.nodeValue;
    const fragment = document.createDocumentFragment();
    const regex = /[A-Za-z][A-Za-z'-]{3,}/g;
    let lastIndex = 0;
    let hits = 0;

    for (const match of text.matchAll(regex)) {
      const rawWord = match[0];
      const insight = getWordInsight(rawWord);
      if (!insight) continue;

      fragment.append(document.createTextNode(text.slice(lastIndex, match.index)));
      const mark = document.createElement("span");
      mark.className = MARK_CLASS;
      mark.textContent = rawWord;
      mark.dataset.zh = insight.zh;
      mark.dataset.word = insight.lemma;
      mark.dataset.surface = rawWord;
      mark.dataset.tag = insight.tag;
      mark.dataset.baseChanged = String(insight.lemma !== insight.word);
      mark.setAttribute(HIGHLIGHTED_ATTR, "true");
      if (savedWords[insight.lemma]) mark.classList.add("paper-reading-web-saved");
      mark.addEventListener("click", showWordActions);
      fragment.append(mark);
      lastIndex = match.index + rawWord.length;
      hits += 1;
    }

    if (!hits) return 0;
    fragment.append(document.createTextNode(text.slice(lastIndex)));
    node.replaceWith(fragment);
    return hits;
  }

  function getWordInsight(rawWord) {
    const clean = rawWord.replace(/^[^A-Za-z]+|[^A-Za-z]+$/g, "").replace(/'s$/i, "").toLowerCase();
    if (!clean || clean.length < 5 || COMMON_WORDS.has(clean) || BASIC_BLOCKLIST.has(clean)) return null;

    const lemma = findLemma(clean);
    if (BASIC_BLOCKLIST.has(lemma)) return null;
    if (ignoredWords.has(lemma)) return null;
    const entry = lookupDictionary(lemma) || LEXICON[lemma];
    if (entry?.h === false && lemma === clean) return null;
    if (entry) {
      return Array.isArray(entry)
        ? { word: clean, lemma, zh: entry[0], tag: entry[1] }
        : { word: clean, lemma, zh: entry.zh, tag: entry.tag };
    }

    return null;
  }

  function collectCandidateLetters(root) {
    const letters = new Set();
    const text = (root.innerText || "").slice(0, 250000);
    for (const match of text.matchAll(/[A-Za-z][A-Za-z'-]{3,}/g)) {
      const word = match[0].toLowerCase();
      if (isRoughCandidate(word)) letters.add(word[0]);
    }
    return letters;
  }

  function isRoughCandidate(word) {
    if (!word || word.length < 5 || COMMON_WORDS.has(word)) return false;
    if (LEXICON[word]) return true;
    return word.length >= 8 || /(tion|sion|ment|ity|ive|ous|ance|ence|ism|ist|ize|ise|ate|ical|ology|ography)$/.test(word);
  }

  async function loadDictChunk(letter) {
    if (!/^[a-z]$/.test(letter) || dictChunks.has(letter)) return;
    try {
      const response = await fetch(chrome.runtime.getURL(`dict/${letter}.json`));
      dictChunks.set(letter, response.ok ? await response.json() : {});
    } catch {
      dictChunks.set(letter, {});
    }
  }

  function lookupDictionary(word) {
    const chunk = dictChunks.get(word[0]);
    return chunk?.[word] || null;
  }

  function findLemma(word) {
    const candidates = buildLemmaCandidates(word);
    return candidates.find((candidate) => LEXICON[candidate] || lookupDictionary(candidate)) || word;
  }

  function buildLemmaCandidates(word) {
    const candidates = [];
    const add = (candidate) => {
      if (candidate && candidate.length >= 3 && !candidates.includes(candidate)) candidates.push(candidate);
    };

    if (word.endsWith("ies") && word.length > 4) add(`${word.slice(0, -3)}y`);
    if (word.endsWith("ves") && word.length > 4) {
      add(`${word.slice(0, -3)}f`);
      add(`${word.slice(0, -3)}fe`);
    }
    if (word.endsWith("es") && word.length > 4) {
      add(word.slice(0, -2));
      add(word.slice(0, -1));
    }
    if (word.endsWith("s") && word.length > 4) add(word.slice(0, -1));

    if (word.endsWith("ied") && word.length > 4) add(`${word.slice(0, -3)}y`);
    if (word.endsWith("ed") && word.length > 4) {
      const stem = word.slice(0, -2);
      add(stem);
      add(`${stem}e`);
      add(stripDoubledFinalConsonant(stem));
    }

    if (word.endsWith("ing") && word.length > 5) {
      const stem = word.slice(0, -3);
      add(stem);
      add(`${stem}e`);
      add(stripDoubledFinalConsonant(stem));
    }

    if (word.endsWith("ly") && word.length > 5) {
      const stem = word.slice(0, -2);
      add(stem);
      if (word.endsWith("ically")) add(`${word.slice(0, -6)}ic`);
      if (word.endsWith("ally")) add(`${word.slice(0, -4)}al`);
    }

    add(word);
    return candidates;
  }

  function stripDoubledFinalConsonant(stem) {
    if (/([b-df-hj-np-tv-z])\1$/.test(stem)) return stem.slice(0, -1);
    return stem;
  }

  function findArticleRoot() {
    const candidates = [
      document.querySelector("article"),
      document.querySelector("main"),
      document.querySelector("[role='main']"),
      document.querySelector(".article"),
      document.querySelector(".post"),
      document.querySelector(".entry-content")
    ].filter(Boolean);

    return candidates.sort((a, b) => visibleTextLength(b) - visibleTextLength(a))[0] || document.body;
  }

  function visibleTextLength(element) {
    return (element.innerText || "").replace(/\s+/g, " ").trim().length;
  }

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .${MARK_CLASS} {
        background: rgba(255, 235, 125, 0.42) !important;
        border-radius: 2px !important;
        box-shadow: inset 0 -1px 0 rgba(171, 132, 27, 0.16) !important;
        cursor: help !important;
      }
      .${MARK_CLASS}.paper-reading-web-saved {
        background: rgba(255, 213, 96, 0.62) !important;
      }
      #${TOOLTIP_ID},
      #${POPOVER_ID} {
        position: fixed !important;
        z-index: 2147483647 !important;
        max-width: 320px !important;
        padding: 10px 12px !important;
        border: 1px solid rgba(33, 55, 49, 0.22) !important;
        border-radius: 8px !important;
        background: #fffdf7 !important;
        color: #1f2925 !important;
        box-shadow: 0 12px 36px rgba(33, 30, 24, 0.2) !important;
        font: 13px/1.45 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif !important;
        pointer-events: none !important;
      }
      #${TOOLTIP_ID} strong {
        display: block !important;
        margin-bottom: 4px !important;
        font-size: 14px !important;
      }
      #${TOOLTIP_ID} span {
        display: block !important;
        color: #66736d !important;
        margin-top: 5px !important;
        font-size: 12px !important;
      }
      #${POPOVER_ID} {
        pointer-events: auto !important;
      }
      #${POPOVER_ID} .paper-reading-popover-word {
        display: block !important;
        margin-bottom: 4px !important;
        font-weight: 800 !important;
        font-size: 15px !important;
      }
      #${POPOVER_ID} .paper-reading-popover-zh {
        margin-bottom: 8px !important;
      }
      #${POPOVER_ID} .paper-reading-popover-tag {
        color: #66736d !important;
        margin-bottom: 9px !important;
        font-size: 12px !important;
      }
      #${POPOVER_ID} .paper-reading-popover-actions {
        display: flex !important;
        gap: 8px !important;
      }
      #${POPOVER_ID} button {
        min-height: 30px !important;
        padding: 0 10px !important;
        border: 1px solid rgba(47, 117, 107, 0.24) !important;
        border-radius: 7px !important;
        background: #ffffff !important;
        color: #1f2925 !important;
        cursor: pointer !important;
        font: 13px/1 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif !important;
      }
      #${POPOVER_ID} button[data-action="save"] {
        border-color: transparent !important;
        background: #2f756b !important;
        color: #ffffff !important;
      }
    `;
    document.documentElement.append(style);
  }

  async function loadUserLists() {
    const data = await storageGet([IGNORED_KEY, SAVED_KEY]);
    ignoredWords = new Set(Array.isArray(data[IGNORED_KEY]) ? data[IGNORED_KEY] : []);
    savedWords = data[SAVED_KEY] && typeof data[SAVED_KEY] === "object" ? data[SAVED_KEY] : {};
  }

  function storageGet(keys) {
    return new Promise((resolve) => {
      chrome.storage.local.get(keys, resolve);
    });
  }

  function storageSet(data) {
    return new Promise((resolve) => {
      chrome.storage.local.set(data, resolve);
    });
  }

  function showWordActions(event) {
    event.preventDefault();
    event.stopPropagation();

    const mark = event.currentTarget;
    const popover = getPopover();
    const isSaved = Boolean(savedWords[mark.dataset.word]);

    popover.innerHTML = `
      <span class="paper-reading-popover-word">${escapeHtml(getDisplayWord(mark))}</span>
      <div class="paper-reading-popover-zh">${escapeHtml(mark.dataset.zh || "")}</div>
      <div class="paper-reading-popover-tag">${escapeHtml(mark.dataset.tag || "")}</div>
      <div class="paper-reading-popover-actions">
        <button type="button" data-action="ignore">移除</button>
        <button type="button" data-action="save">${isSaved ? "已添加" : "添加到生词库"}</button>
      </div>
    `;

    popover.querySelector('[data-action="ignore"]').addEventListener("click", () => ignoreWord(mark));
    popover.querySelector('[data-action="save"]').addEventListener("click", () => saveWord(mark));
    popover.hidden = false;
    placePopover(popover, mark);
  }

  function getDisplayWord(mark) {
    const surface = (mark.dataset.surface || mark.textContent || "").toLowerCase();
    const lemma = mark.dataset.word || surface;
    return surface && surface !== lemma ? `${surface} → ${lemma}` : lemma;
  }

  async function ignoreWord(mark) {
    const lemma = mark.dataset.word;
    if (!lemma) return;

    ignoredWords.add(lemma);
    await storageSet({ [IGNORED_KEY]: [...ignoredWords].sort() });
    document.querySelectorAll(`.${MARK_CLASS}[data-word="${cssEscape(lemma)}"]`).forEach(unwrapMark);
    count = Math.max(0, document.querySelectorAll(`.${MARK_CLASS}`).length);
    hidePopover();
  }

  async function saveWord(mark) {
    const lemma = mark.dataset.word;
    if (!lemma) return;

    const previous = savedWords[lemma] || {};
    savedWords[lemma] = {
      lemma,
      surface: mark.dataset.surface || mark.textContent || lemma,
      zh: mark.dataset.zh || previous.zh || "",
      tag: mark.dataset.tag || previous.tag || "",
      url: location.href,
      title: document.title,
      addedAt: previous.addedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reviewCount: previous.reviewCount || 0
    };
    await storageSet({ [SAVED_KEY]: savedWords });
    document.querySelectorAll(`.${MARK_CLASS}[data-word="${cssEscape(lemma)}"]`).forEach((item) => {
      item.classList.add("paper-reading-web-saved");
    });
    hidePopover();
  }

  function unwrapMark(mark) {
    mark.replaceWith(document.createTextNode(mark.textContent || ""));
  }

  function getPopover() {
    let popover = document.getElementById(POPOVER_ID);
    if (!popover) {
      popover = document.createElement("div");
      popover.id = POPOVER_ID;
      popover.hidden = true;
      document.documentElement.append(popover);
      document.addEventListener("click", (event) => {
        if (!event.target.closest?.(`.${MARK_CLASS}, #${POPOVER_ID}`)) hidePopover();
      }, true);
      window.addEventListener("scroll", hidePopover, true);
    }
    return popover;
  }

  function placePopover(popover, mark) {
    const rect = mark.getBoundingClientRect();
    const popoverRect = popover.getBoundingClientRect();
    const gap = 10;
    const left = Math.min(window.innerWidth - popoverRect.width - 10, Math.max(10, rect.left + rect.width / 2 - popoverRect.width / 2));
    const topAbove = rect.top - popoverRect.height - gap;
    const top = topAbove > 10 ? topAbove : rect.bottom + gap;
    popover.style.left = `${left}px`;
    popover.style.top = `${Math.max(10, Math.min(window.innerHeight - popoverRect.height - 10, top))}px`;
  }

  function hidePopover() {
    const popover = document.getElementById(POPOVER_ID);
    if (popover) popover.hidden = true;
  }

  function cssEscape(value) {
    return window.CSS?.escape ? CSS.escape(value) : String(value).replace(/"/g, '\\"');
  }

  function showTooltip(event) {
    const mark = event.currentTarget;
    const tooltip = getTooltip();
    tooltip.innerHTML = `<strong>${escapeHtml(mark.dataset.word || mark.textContent)}</strong>${escapeHtml(mark.dataset.zh || "")}<span>${escapeHtml(mark.dataset.tag || "")}</span>`;
    tooltip.hidden = false;
    moveTooltip(event);
  }

  function moveTooltip(event) {
    const tooltip = getTooltip();
    const gap = 14;
    const rect = tooltip.getBoundingClientRect();
    const left = Math.min(window.innerWidth - rect.width - 10, event.clientX + gap);
    const top = Math.min(window.innerHeight - rect.height - 10, event.clientY + gap);
    tooltip.style.left = `${Math.max(10, left)}px`;
    tooltip.style.top = `${Math.max(10, top)}px`;
  }

  function hideTooltip() {
    const tooltip = document.getElementById(TOOLTIP_ID);
    if (tooltip) tooltip.hidden = true;
  }

  function getTooltip() {
    let tooltip = document.getElementById(TOOLTIP_ID);
    if (!tooltip) {
      tooltip = document.createElement("div");
      tooltip.id = TOOLTIP_ID;
      tooltip.hidden = true;
      document.documentElement.append(tooltip);
    }
    return tooltip;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[char]);
  }
})();
