export const SETTINGS_KEY = "paperReadingSettings";

export const DEFAULT_SETTINGS = {
  profile: "balanced",
  allowHeuristic: true
};

export const PROFILE_CONFIGS = {
  broad: {
    label: "基础",
    detail: "标得更多，适合积累词汇",
    threshold: 1,
    allowHeuristic: true
  },
  balanced: {
    label: "进阶",
    detail: "学术词和常见难词优先",
    threshold: 2,
    allowHeuristic: true
  },
  advanced: {
    label: "高阶",
    detail: "减少 CET6 常规词干扰",
    threshold: 4,
    allowHeuristic: true
  },
  minimal: {
    label: "极简",
    detail: "只保留更难的核心词",
    threshold: 6,
    allowHeuristic: false
  }
};

export function normalizeSettings(value) {
  const settings = value && typeof value === "object" ? value : {};
  const profile = PROFILE_CONFIGS[settings.profile] ? settings.profile : DEFAULT_SETTINGS.profile;
  return {
    profile,
    allowHeuristic: typeof settings.allowHeuristic === "boolean"
      ? settings.allowHeuristic
      : PROFILE_CONFIGS[profile].allowHeuristic
  };
}

export function getProfileConfig(profile) {
  return PROFILE_CONFIGS[profile] || PROFILE_CONFIGS[DEFAULT_SETTINGS.profile];
}

export function buildInsightOptions(settings) {
  const normalized = normalizeSettings(settings);
  const profile = getProfileConfig(normalized.profile);
  return {
    profile: normalized.profile,
    threshold: profile.threshold,
    allowHeuristic: normalized.allowHeuristic
  };
}

export async function loadSettings() {
  const area = getStorageArea("sync") || getStorageArea("local");
  if (!area) return DEFAULT_SETTINGS;
  const data = await storageGet(area, [SETTINGS_KEY]);
  return normalizeSettings(data[SETTINGS_KEY]);
}

export async function saveSettings(settings) {
  const normalized = normalizeSettings(settings);
  const area = getStorageArea("sync") || getStorageArea("local");
  if (!area) return normalized;
  await storageSet(area, { [SETTINGS_KEY]: normalized });
  return normalized;
}

function getStorageArea(name) {
  return globalThis.chrome?.storage?.[name] || null;
}

function storageGet(area, keys) {
  return new Promise((resolve) => {
    area.get(keys, resolve);
  });
}

function storageSet(area, value) {
  return new Promise((resolve) => {
    area.set(value, resolve);
  });
}
