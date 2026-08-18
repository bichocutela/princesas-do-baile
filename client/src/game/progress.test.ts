import { describe, expect, it } from "vitest";
import { completeLevel, createDefaultProgress, normalizeProgress } from "./progress";

describe("progresso local de Princesas do Baile", () => {
  it("cria uma campanha nova na primeira fase", () => {
    expect(createDefaultProgress()).toMatchObject({
      highestUnlocked: 1,
      completedLevelIds: [],
      collectedInvitationIds: [],
      lastPlayedLevelId: 1,
    });
  });

  it("ignora valores inválidos e limita o avanço às cento e setenta fases", () => {
    expect(
      normalizeProgress({
        highestUnlocked: 900,
        completedLevelIds: [1, 1, 0, 41, 171, 12],
        collectedInvitationIds: [2, "3", 170],
        lastPlayedLevelId: 188,
      }),
    ).toMatchObject({
      highestUnlocked: 170,
      completedLevelIds: [1, 12, 41],
      collectedInvitationIds: [2, 170],
      lastPlayedLevelId: 170,
    });
  });

  it("salva o convite e desbloqueia a fase seguinte ao concluir uma fase", () => {
    const afterFirstLevel = completeLevel(createDefaultProgress(), 1);
    expect(afterFirstLevel).toMatchObject({
      highestUnlocked: 2,
      completedLevelIds: [1],
      collectedInvitationIds: [1],
      lastPlayedLevelId: 2,
    });

    const repeatedCompletion = completeLevel(afterFirstLevel, 1);
    expect(repeatedCompletion.completedLevelIds).toEqual([1]);
    expect(repeatedCompletion.collectedInvitationIds).toEqual([1]);
  });
});
