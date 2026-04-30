import fs from "node:fs";
import path from "node:path";

const sourcePath = path.resolve("node_modules/ecdict/data/dict.json");
const outDir = path.resolve("public/dict");

const ACADEMIC_RE = /(tion|sion|ment|ity|ive|ous|ance|ence|ism|ist|ize|ise|ate|ical|ology|ography)$/;
const BASIC_TAGS = new Set(["zk", "gk", "cet4"]);
const ADVANCED_TAGS = new Set(["cet6", "ky", "toefl", "ielts", "gre", "gmat", "sat"]);
const BASIC_WORDS = new Set(`
  actually after again almost also although always another around because before began begin better between book books
  believe believed came carried carry century class classes club clubs clue coffee come comes consider couple create
  creativity data design doing dream dreamed during education every famous field finally first generation great
  happened helped high house houses important interesting james larger libraries library mind modern names nineteenth
  nitrous number numbers ordinary own oxide paid papers part people place played post posts publication qualities
  reading receive remained research science seem seemed several shift studied study support taking talented teens time
  together took twenties understand visual week worked world years
`.trim().split(/\s+/));

fs.mkdirSync(outDir, { recursive: true });

const entries = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const entryMap = new Map();
const chunks = new Map();
let kept = 0;
let support = 0;

for (const entry of entries) {
  const word = String(entry.word || "").toLowerCase();
  if (/^[a-z][a-z'-]{3,}$/.test(word) && entry.translation && !/\s/.test(word)) {
    entryMap.set(word, entry);
  }
}

for (const entry of entries) {
  const word = String(entry.word || "").toLowerCase();
  if (!/^[a-z][a-z'-]{3,}$/.test(word)) continue;
  if (!entry.translation || /\s/.test(word)) continue;
  if (BASIC_WORDS.has(word)) continue;
  if (isBasicInflection(word)) continue;

  const tagSet = new Set(String(entry.tag || "").split(/\s+/).filter(Boolean));
  const frequency = getFrequency(entry);
  const hasAdvancedTag = [...tagSet].some((tag) => ADVANCED_TAGS.has(tag));
  const hasBasicTag = [...tagSet].some((tag) => BASIC_TAGS.has(tag));
  const hasAnyExamTag = tagSet.size > 0;
  const isLowFrequency = !hasBasicTag && (frequency === 0 || frequency >= 12000);
  const isAcademicAdvanced = !hasBasicTag && ACADEMIC_RE.test(word) && hasAdvancedTag;
  const isExamAdvanced = hasAdvancedTag && !hasBasicTag;
  const isRareUntagged = !hasAnyExamTag && isLowFrequency && word.length >= 8;

  if (!isRareUntagged && !isAcademicAdvanced && !isExamAdvanced) continue;

  addEntry(word, entry, true);
  kept += 1;

  for (const candidate of buildLemmaCandidates(word)) {
    const baseEntry = entryMap.get(candidate);
    if (!baseEntry || candidate === word) continue;
    if (addEntry(candidate, baseEntry, false)) support += 1;
  }
}

function isBasicInflection(word) {
  for (const candidate of buildLemmaCandidates(word)) {
    if (candidate === word) continue;
    if (BASIC_WORDS.has(candidate)) return true;
    const entry = entryMap.get(candidate);
    if (!entry) continue;
    const tagSet = new Set(String(entry.tag || "").split(/\s+/).filter(Boolean));
    if ([...tagSet].some((tag) => BASIC_TAGS.has(tag))) return true;
  }
  return false;
}

for (const file of fs.readdirSync(outDir)) {
  if (file.endsWith(".json")) fs.unlinkSync(path.join(outDir, file));
}

for (const [letter, data] of chunks) {
  fs.writeFileSync(path.join(outDir, `${letter}.json`), JSON.stringify(data), "utf8");
}

console.log(`Built ${chunks.size} dictionary chunks with ${kept} highlight entries and ${support} lemma support entries.`);

function addEntry(word, entry, highlight) {
  const first = /^[a-z]$/.test(word[0]) ? word[0] : "_";
  if (!chunks.has(first)) chunks.set(first, {});
  const chunk = chunks.get(first);
  if (chunk[word]?.h) return false;
  if (chunk[word] && !highlight) return false;

  const frequency = getFrequency(entry);
  chunk[word] = {
    zh: cleanTranslation(entry.translation),
    tag: buildTag(entry, frequency),
    h: highlight
  };
  return true;
}

function getFrequency(entry) {
  const values = [Number(entry.frq), Number(entry.bnc)].filter((value) => Number.isFinite(value) && value > 0);
  return values.length ? Math.min(...values) : 0;
}

function cleanTranslation(value) {
  return String(value)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("[网络]"))
    .slice(0, 2)
    .join("；")
    .replace(/\s+/g, " ")
    .slice(0, 120);
}

function buildTag(entry, frequency) {
  const tags = String(entry.tag || "")
    .split(/\s+/)
    .filter((tag) => ADVANCED_TAGS.has(tag))
    .slice(0, 2)
    .map((tag) => tag.toUpperCase());

  if (frequency >= 8000 || frequency === 0) tags.push("低频");
  if (!tags.length) tags.push("进阶");
  return [...new Set(tags)].join(" / ");
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

  return candidates;
}

function stripDoubledFinalConsonant(stem) {
  if (/([b-df-hj-np-tv-z])\1$/.test(stem)) return stem.slice(0, -1);
  return stem;
}
