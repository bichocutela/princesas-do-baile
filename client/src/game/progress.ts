import type { LocalProgress } from "./types";

export const PROGRESS_KEY = "princesas-do-baile:progress:v1";

export const createDefaultProgress = (): LocalProgress => ({
  highestUnlocked: 1,
  completedLevelIds: [],
  collectedInvitationIds: [],
  soundEnabled: true,
  lastPlayedLevelId: 1,
});

const uniqueValidIds = (value: unknown): number[] => {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.filter((id): id is number => Number.isInteger(id) && id >= 1 && id <= 170))).sort(
    (a, b) => a - b,
  );
};

export function normalizeProgress(value: unknown): LocalProgress {
  if (!value || typeof value !== "object") return createDefaultProgress();
  const source = value as Partial<LocalProgress>;
  const completedLevelIds = uniqueValidIds(source.completedLevelIds);
  const collectedInvitationIds = uniqueValidIds(source.collectedInvitationIds);
  const highestFromCompletion = completedLevelIds.length ? Math.max(...completedLevelIds) + 1 : 1;
  const highestUnlocked = Math.max(
    1,
    Math.min(170, Number.isInteger(source.highestUnlocked) ? Number(source.highestUnlocked) : highestFromCompletion),
  );

  return {
    highestUnlocked: Math.max(highestUnlocked, Math.min(170, highestFromCompletion)),
    completedLevelIds,
    collectedInvitationIds,
    soundEnabled: source.soundEnabled !== false,
    lastPlayedLevelId:
      Number.isInteger(source.lastPlayedLevelId) && Number(source.lastPlayedLevelId) >= 1
        ? Math.min(170, Number(source.lastPlayedLevelId))
        : 1,
  };
}

export function loadProgress(): LocalProgress {
  if (typeof window === "undefined") return createDefaultProgress();
  try {
    return normalizeProgress(JSON.parse(window.localStorage.getItem(PROGRESS_KEY) ?? "null"));
  } catch {
    return createDefaultProgress();
  }
}

export function saveProgress(progress: LocalProgress): LocalProgress {
  const normalized = normalizeProgress(progress);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(normalized));
  }
  return normalized;
}

export function completeLevel(progress: LocalProgress, levelId: number): LocalProgress {
  const completedLevelIds = uniqueValidIds([...progress.completedLevelIds, levelId]);
  const collectedInvitationIds = uniqueValidIds([...progress.collectedInvitationIds, levelId]);
  return {
    ...progress,
    completedLevelIds,
    collectedInvitationIds,
    highestUnlocked: Math.max(progress.highestUnlocked, Math.min(170, levelId + 1)),
    lastPlayedLevelId: Math.min(170, levelId + 1),
  };
}
