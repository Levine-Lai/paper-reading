const RAW_COMMON_WORDS = `
a about above across after again against all almost alone along already also although always am among an and another
any anyone anything are area around as ask at away back be because become been before began begin being best better
between big both but by came can cannot case change child children city come common company could country course
day did different do does done down each early end enough even every example fact far few find first follow for form
found from full further gave get give given go good got great group had hand has have he head help her here high him
his home house how however if important in include into is it its just keep kind know large last late later law learn
left less let life like line little long look made make man many may me mean men might more most much must my name
near need never new next no non not now number of off often old on once one only open or order other our out over
own part people place point possible present problem public put question quite read real right room run said same saw
say school second see seem seen set several she should show side since small so some something state still such system
take than that the their them then there these they thing think this those though three through time to together too
took toward two under until up us use used using very want was way we well went were what when where whether which
while who why will with within without work world would year years you young your
`;

const RAW_ACADEMIC_SUFFIXES = `
ability acy ality ance ence ant ent ary ate ation cation cial ence ency ibility ible ic ical ify ism ist ity ive
ization ize logy ment ness ous sion tion tive ure
`;

export const COMMON_WORDS = new Set(RAW_COMMON_WORDS.trim().split(/\s+/));
export const ACADEMIC_SUFFIXES = RAW_ACADEMIC_SUFFIXES.trim().split(/\s+/);

export const IRREGULAR_LEMMAS = {
  analyses: "analysis",
  criteria: "criterion",
  data: "datum",
  phenomena: "phenomenon",
  media: "medium",
  indices: "index",
  matrices: "matrix",
  hypotheses: "hypothesis",
  syntheses: "synthesis",
  theses: "thesis",
  corpora: "corpus",
  strata: "stratum",
  appendices: "appendix"
};

export const LEXICON = {
  aberration: { zh: "反常现象；偏差", tag: "低频" },
  abstract: { zh: "抽象的；摘要", tag: "学术" },
  accelerate: { zh: "加速；促进", tag: "CET6+" },
  accommodate: { zh: "容纳；适应；调和", tag: "CET6+" },
  accumulate: { zh: "积累；聚积", tag: "CET6+" },
  accuracy: { zh: "准确性", tag: "学术" },
  adjacent: { zh: "相邻的；毗邻的", tag: "CET6+" },
  aggregate: { zh: "总计；聚合；合计的", tag: "学术" },
  albeit: { zh: "尽管；虽然", tag: "低频" },
  algorithm: { zh: "算法", tag: "学术" },
  align: { zh: "使对齐；使一致", tag: "学术" },
  alleviate: { zh: "缓解；减轻", tag: "CET6+" },
  allocate: { zh: "分配；拨出", tag: "CET6+" },
  alternative: { zh: "替代方案；可替代的", tag: "学术" },
  ambiguous: { zh: "模棱两可的；含糊的", tag: "CET6+" },
  analogy: { zh: "类比；相似关系", tag: "学术" },
  analogous: { zh: "类似的；可类比的", tag: "学术" },
  anomaly: { zh: "异常；反常现象", tag: "学术" },
  antecedent: { zh: "先例；前件；先行词", tag: "低频" },
  anticipate: { zh: "预期；预料", tag: "CET6+" },
  apparent: { zh: "显然的；表面上的", tag: "CET6+" },
  approximate: { zh: "近似的；大约的", tag: "学术" },
  arbitrary: { zh: "任意的；武断的", tag: "学术" },
  architecture: { zh: "架构；体系结构", tag: "学术" },
  articulate: { zh: "清楚表达；清晰的", tag: "CET6+" },
  ascertain: { zh: "查明；确定", tag: "低频" },
  aspect: { zh: "方面；维度", tag: "学术" },
  assess: { zh: "评估；评价", tag: "学术" },
  assign: { zh: "分配；指定", tag: "学术" },
  attain: { zh: "达到；获得", tag: "CET6+" },
  attribute: { zh: "属性；把……归因于", tag: "学术" },
  augment: { zh: "增加；增强", tag: "学术" },
  auxiliary: { zh: "辅助的；辅助设备", tag: "CET6+" },
  bias: { zh: "偏差；偏见", tag: "学术" },
  benchmark: { zh: "基准；基准测试", tag: "学术" },
  beneficial: { zh: "有益的；有利的", tag: "CET6+" },
  boundary: { zh: "边界；界限", tag: "学术" },
  candidate: { zh: "候选项；候选人", tag: "学术" },
  canonical: { zh: "标准的；规范的", tag: "学术" },
  capacity: { zh: "容量；能力", tag: "学术" },
  causal: { zh: "因果的", tag: "学术" },
  coherence: { zh: "连贯性；一致性", tag: "学术" },
  coincide: { zh: "同时发生；一致", tag: "CET6+" },
  collapse: { zh: "崩溃；坍塌；骤降", tag: "CET6+" },
  compensate: { zh: "补偿；弥补", tag: "CET6+" },
  compelling: { zh: "有说服力的；强烈的", tag: "CET6+" },
  complement: { zh: "补充；补足物", tag: "学术" },
  complex: { zh: "复杂的；复合体", tag: "学术" },
  component: { zh: "组成部分；组件", tag: "学术" },
  comprehensive: { zh: "全面的；综合的", tag: "CET6+" },
  comprise: { zh: "由……组成；包含", tag: "CET6+" },
  conceive: { zh: "构想；设想", tag: "CET6+" },
  concise: { zh: "简明的；简洁的", tag: "CET6+" },
  concurrent: { zh: "同时发生的；并发的", tag: "学术" },
  condition: { zh: "条件；状况", tag: "学术" },
  confer: { zh: "授予；商议", tag: "CET6+" },
  confound: { zh: "混淆；干扰因素", tag: "学术" },
  conjecture: { zh: "推测；猜想", tag: "低频" },
  consecutive: { zh: "连续的；连贯的", tag: "CET6+" },
  consensus: { zh: "共识；一致意见", tag: "CET6+" },
  constraint: { zh: "限制；约束", tag: "学术" },
  constitute: { zh: "构成；组成", tag: "CET6+" },
  construct: { zh: "构建；构念", tag: "学术" },
  contaminate: { zh: "污染；弄脏", tag: "CET6+" },
  context: { zh: "语境；上下文；背景", tag: "学术" },
  converge: { zh: "收敛；汇聚", tag: "学术" },
  correlate: { zh: "相关；使相互关联", tag: "学术" },
  criterion: { zh: "标准；准则", tag: "学术" },
  crucial: { zh: "关键的；至关重要的", tag: "CET6+" },
  cumulative: { zh: "累积的", tag: "CET6+" },
  demonstrate: { zh: "证明；展示", tag: "学术" },
  denote: { zh: "表示；指代", tag: "学术" },
  dense: { zh: "密集的；稠密的", tag: "学术" },
  derive: { zh: "推导出；源自", tag: "学术" },
  deteriorate: { zh: "恶化；退化", tag: "CET6+" },
  deterministic: { zh: "确定性的", tag: "学术" },
  deviation: { zh: "偏差；偏离", tag: "学术" },
  diagnose: { zh: "诊断；判断", tag: "CET6+" },
  dimension: { zh: "维度；尺寸", tag: "学术" },
  discrete: { zh: "离散的；分离的", tag: "学术" },
  discriminate: { zh: "区分；歧视", tag: "CET6+" },
  disparity: { zh: "差异；悬殊", tag: "CET6+" },
  dispose: { zh: "处理；处置；使倾向于", tag: "CET6+" },
  distort: { zh: "扭曲；歪曲", tag: "CET6+" },
  diverse: { zh: "多样的；不同的", tag: "学术" },
  domain: { zh: "领域；域", tag: "学术" },
  dynamic: { zh: "动态的；动力学的", tag: "学术" },
  elaborate: { zh: "详述；精心制作的", tag: "CET6+" },
  eliminate: { zh: "消除；排除", tag: "学术" },
  empirical: { zh: "经验的；实证的", tag: "学术" },
  encompass: { zh: "包含；涵盖", tag: "CET6+" },
  encounter: { zh: "遇到；遭遇", tag: "CET6+" },
  enhance: { zh: "增强；提高", tag: "CET6+" },
  entail: { zh: "意味着；需要", tag: "学术" },
  entity: { zh: "实体；存在物", tag: "学术" },
  entropy: { zh: "熵；无序度", tag: "学术" },
  enumerate: { zh: "列举；枚举", tag: "学术" },
  equivalent: { zh: "等价的；等同物", tag: "学术" },
  erroneous: { zh: "错误的；不正确的", tag: "低频" },
  establish: { zh: "建立；确立", tag: "学术" },
  estimate: { zh: "估计；估算", tag: "学术" },
  evaluate: { zh: "评估；评价", tag: "学术" },
  exacerbate: { zh: "加剧；恶化", tag: "低频" },
  exhibit: { zh: "表现出；展示", tag: "学术" },
  explicit: { zh: "明确的；显式的", tag: "学术" },
  exploit: { zh: "利用；开发；剥削", tag: "CET6+" },
  facilitate: { zh: "促进；使便利", tag: "CET6+" },
  feasible: { zh: "可行的；可实现的", tag: "CET6+" },
  fidelity: { zh: "保真度；忠实度", tag: "学术" },
  finite: { zh: "有限的", tag: "学术" },
  fluctuate: { zh: "波动；起伏", tag: "CET6+" },
  formulate: { zh: "制定；阐述；构建公式", tag: "学术" },
  fragment: { zh: "片段；碎片", tag: "学术" },
  fundamental: { zh: "基本的；根本的", tag: "学术" },
  generate: { zh: "生成；产生", tag: "学术" },
  gradient: { zh: "梯度；渐变", tag: "学术" },
  hierarchical: { zh: "层级的；分层的", tag: "学术" },
  heuristic: { zh: "启发式方法；经验法则", tag: "学术" },
  homogeneous: { zh: "同质的；均匀的", tag: "学术" },
  hybrid: { zh: "混合的；混合体", tag: "学术" },
  hypothesis: { zh: "假设；假说", tag: "学术" },
  identical: { zh: "完全相同的", tag: "CET6+" },
  illustrate: { zh: "说明；阐明", tag: "学术" },
  implicit: { zh: "含蓄的；隐式的", tag: "学术" },
  impose: { zh: "施加；强加", tag: "CET6+" },
  incentive: { zh: "激励；动机", tag: "CET6+" },
  incorporate: { zh: "纳入；包含", tag: "CET6+" },
  induce: { zh: "引起；诱导；归纳", tag: "学术" },
  infer: { zh: "推断；推理", tag: "学术" },
  inherent: { zh: "固有的；内在的", tag: "CET6+" },
  inhibit: { zh: "抑制；阻碍", tag: "CET6+" },
  initiate: { zh: "开始；发起", tag: "CET6+" },
  insight: { zh: "洞见；深刻理解", tag: "学术" },
  instantiate: { zh: "实例化；用例子说明", tag: "学术" },
  integrate: { zh: "整合；合并", tag: "学术" },
  intermediate: { zh: "中间的；中级的", tag: "CET6+" },
  interpret: { zh: "解释；解读", tag: "学术" },
  intervene: { zh: "干预；介入", tag: "CET6+" },
  intrinsic: { zh: "内在的；固有的", tag: "CET6+" },
  intuition: { zh: "直觉；直观理解", tag: "学术" },
  invariant: { zh: "不变的；不变量", tag: "学术" },
  investigate: { zh: "调查；研究", tag: "学术" },
  invoke: { zh: "调用；援引", tag: "学术" },
  isolate: { zh: "隔离；分离", tag: "CET6+" },
  latent: { zh: "潜在的；隐性的", tag: "学术" },
  leverage: { zh: "利用；杠杆作用", tag: "学术" },
  linear: { zh: "线性的", tag: "学术" },
  longitudinal: { zh: "纵向的；长期追踪的", tag: "学术" },
  magnitude: { zh: "大小；量级；重要性", tag: "学术" },
  manipulate: { zh: "操纵；处理", tag: "CET6+" },
  marginal: { zh: "边际的；微小的", tag: "学术" },
  mediate: { zh: "调解；作为中介", tag: "学术" },
  mechanism: { zh: "机制；机械装置", tag: "学术" },
  methodology: { zh: "方法论；研究方法", tag: "学术" },
  metric: { zh: "指标；度量", tag: "学术" },
  mitigate: { zh: "缓解；减轻", tag: "CET6+" },
  modality: { zh: "模态；形式", tag: "学术" },
  morphology: { zh: "形态学；形态结构", tag: "学术" },
  notation: { zh: "符号；记法", tag: "学术" },
  novel: { zh: "新颖的；小说", tag: "学术" },
  objective: { zh: "目标；客观的", tag: "学术" },
  obtain: { zh: "获得；得到", tag: "学术" },
  occurrence: { zh: "发生；出现；事件", tag: "学术" },
  offset: { zh: "抵消；偏移量", tag: "学术" },
  optimize: { zh: "优化；使最优", tag: "学术" },
  ordinal: { zh: "序数的；有序的", tag: "学术" },
  paradigm: { zh: "范式；典型模式", tag: "学术" },
  parameter: { zh: "参数；限定因素", tag: "学术" },
  partition: { zh: "划分；分区", tag: "学术" },
  perceive: { zh: "感知；察觉", tag: "CET6+" },
  persistent: { zh: "持续的；坚持的", tag: "CET6+" },
  perspective: { zh: "视角；观点", tag: "学术" },
  perturbation: { zh: "扰动；微小变化", tag: "学术" },
  phenomenon: { zh: "现象", tag: "学术" },
  plausible: { zh: "貌似合理的；可信的", tag: "CET6+" },
  preliminary: { zh: "初步的；预备的", tag: "CET6+" },
  premise: { zh: "前提；假定", tag: "学术" },
  prevalent: { zh: "普遍的；流行的", tag: "CET6+" },
  prior: { zh: "先前的；优先的", tag: "学术" },
  probability: { zh: "概率；可能性", tag: "学术" },
  procedure: { zh: "程序；步骤", tag: "学术" },
  prohibit: { zh: "禁止；阻止", tag: "CET6+" },
  propagate: { zh: "传播；扩散；繁殖", tag: "学术" },
  proportion: { zh: "比例；部分", tag: "学术" },
  protocol: { zh: "协议；规程", tag: "学术" },
  qualitative: { zh: "定性的；质性的", tag: "学术" },
  quantitative: { zh: "定量的；数量的", tag: "学术" },
  randomize: { zh: "随机化", tag: "学术" },
  rationale: { zh: "理由；基本原理", tag: "学术" },
  recursive: { zh: "递归的", tag: "学术" },
  redundant: { zh: "冗余的；多余的", tag: "CET6+" },
  refine: { zh: "改进；精炼", tag: "学术" },
  regime: { zh: "制度；体制；状态区间", tag: "学术" },
  regularize: { zh: "正则化；规范化", tag: "学术" },
  reinforce: { zh: "强化；加固", tag: "CET6+" },
  relevant: { zh: "相关的；切题的", tag: "学术" },
  replicate: { zh: "复制；复现实验", tag: "学术" },
  represent: { zh: "表示；代表", tag: "学术" },
  residual: { zh: "残余的；残差", tag: "学术" },
  resolve: { zh: "解决；解析；分辨", tag: "学术" },
  robust: { zh: "稳健的；鲁棒的", tag: "学术" },
  salient: { zh: "显著的；突出的", tag: "学术" },
  sanction: { zh: "制裁；批准", tag: "CET6+" },
  scenario: { zh: "情景；方案", tag: "学术" },
  schema: { zh: "模式；图式；纲要", tag: "学术" },
  semantic: { zh: "语义的", tag: "学术" },
  sequential: { zh: "连续的；顺序的", tag: "学术" },
  simulate: { zh: "模拟；仿真", tag: "学术" },
  sparse: { zh: "稀疏的；稀少的", tag: "学术" },
  spatial: { zh: "空间的", tag: "学术" },
  specify: { zh: "具体说明；指定", tag: "学术" },
  spectrum: { zh: "谱；范围", tag: "学术" },
  stable: { zh: "稳定的", tag: "学术" },
  statistic: { zh: "统计量；统计资料", tag: "学术" },
  stochastic: { zh: "随机的", tag: "学术" },
  strategy: { zh: "策略；战略", tag: "学术" },
  structure: { zh: "结构；构造", tag: "学术" },
  subsequent: { zh: "随后的；后来的", tag: "CET6+" },
  subset: { zh: "子集；一小部分", tag: "学术" },
  substantial: { zh: "大量的；实质性的", tag: "CET6+" },
  substitute: { zh: "替代；代替物", tag: "CET6+" },
  subtle: { zh: "微妙的；不易察觉的", tag: "CET6+" },
  sufficient: { zh: "足够的；充分的", tag: "学术" },
  suppress: { zh: "抑制；压制", tag: "CET6+" },
  surrogate: { zh: "替代物；代理的", tag: "学术" },
  sustain: { zh: "维持；支撑", tag: "CET6+" },
  symmetric: { zh: "对称的", tag: "学术" },
  synthesize: { zh: "综合；合成", tag: "学术" },
  taxonomy: { zh: "分类法；分类体系", tag: "学术" },
  temporal: { zh: "时间的；暂时的", tag: "学术" },
  threshold: { zh: "阈值；门槛", tag: "学术" },
  tolerate: { zh: "容忍；耐受", tag: "CET6+" },
  topology: { zh: "拓扑；拓扑结构", tag: "学术" },
  trajectory: { zh: "轨迹；发展路径", tag: "学术" },
  transfer: { zh: "转移；迁移；传输", tag: "学术" },
  transient: { zh: "短暂的；瞬态的", tag: "学术" },
  trigger: { zh: "触发；引发", tag: "学术" },
  ubiquitous: { zh: "无处不在的；普遍存在的", tag: "低频" },
  underlying: { zh: "潜在的；根本的；位于下面的", tag: "学术" },
  uniform: { zh: "一致的；均匀的", tag: "学术" },
  valid: { zh: "有效的；合理的", tag: "学术" },
  validate: { zh: "验证；确认有效", tag: "学术" },
  variance: { zh: "方差；差异", tag: "学术" },
  viable: { zh: "可行的；能生存的", tag: "CET6+" },
  virtual: { zh: "虚拟的；实质上的", tag: "学术" },
  volatile: { zh: "易变的；不稳定的", tag: "CET6+" }
};

export function cleanWord(raw) {
  return raw
    .replace(/^[^A-Za-z]+|[^A-Za-z]+$/g, "")
    .replace(/'s$/i, "")
    .toLowerCase();
}

export function findLemma(raw) {
  const word = cleanWord(raw);
  if (!word) return "";
  if (LEXICON[word]) return word;
  if (IRREGULAR_LEMMAS[word]) return IRREGULAR_LEMMAS[word];

  const candidates = [];
  if (word.endsWith("ies") && word.length > 4) candidates.push(`${word.slice(0, -3)}y`);
  if (word.endsWith("ied") && word.length > 4) candidates.push(`${word.slice(0, -3)}y`);
  if (word.endsWith("ing") && word.length > 5) {
    candidates.push(word.slice(0, -3));
    candidates.push(`${word.slice(0, -3)}e`);
  }
  if (word.endsWith("ed") && word.length > 4) {
    candidates.push(word.slice(0, -2));
    candidates.push(`${word.slice(0, -1)}`);
  }
  if (word.endsWith("ly") && word.length > 5) {
    candidates.push(word.slice(0, -2));
    if (word.endsWith("ically")) candidates.push(`${word.slice(0, -6)}ic`);
    if (word.endsWith("ally")) candidates.push(`${word.slice(0, -4)}al`);
  }
  if (word.endsWith("s") && word.length > 3) candidates.push(word.slice(0, -1));

  return candidates.find((candidate) => LEXICON[candidate]) || word;
}

export function getWordInsight(raw, options = {}) {
  const clean = cleanWord(raw);
  if (!clean || clean.length < 4 || !/^[a-z][a-z'-]*$/.test(clean)) return null;

  const lemma = findLemma(clean);
  const entry = LEXICON[lemma];
  const isKnown = Boolean(entry);
  const startsLikeName = /^[A-Z][a-z]+/.test(raw) && !isKnown;
  if (startsLikeName) return null;

  const suffix = ACADEMIC_SUFFIXES.find((item) => clean.endsWith(item));
  let score = 0;
  const reasons = [];

  if (isKnown) {
    score += 4;
    reasons.push(entry.tag);
  }
  if (!COMMON_WORDS.has(clean) && clean.length >= 8) {
    score += 1;
    reasons.push("低频形态");
  }
  if (suffix && clean.length >= 7) {
    score += 1;
    reasons.push("学术后缀");
  }
  if (/(ph|thm|tion|sion|ity|ive|ous|ary|ize|ise|ate|ical)$/.test(clean) && clean.length >= 7) {
    score += 1;
  }

  const threshold = options.threshold ?? 3;
  const allowHeuristic = options.allowHeuristic ?? true;
  if (!isKnown && (!allowHeuristic || score < threshold)) return null;

  return {
    word: clean,
    lemma,
    score,
    isKnown,
    tag: entry?.tag || "推断",
    zh: entry?.zh || "疑似低频或学术词；本地词库暂未收录精确释义",
    reason: reasons.filter(Boolean).join(" · ") || "词形较复杂"
  };
}
