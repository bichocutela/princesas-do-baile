import { describe, expect, it } from "vitest";
import { LEVELS } from "./levels";
import { MODULES } from "./modules";

describe("catálogo de monumentos", () => {
  it("entrega 170 fases organizadas em 17 módulos de dez fases", () => {
    expect(LEVELS).toHaveLength(170);
    expect(MODULES).toHaveLength(17);
    expect(LEVELS[0]?.module).toBe(1);
    expect(LEVELS[9]?.module).toBe(1);
    expect(LEVELS[10]?.module).toBe(2);
    expect(LEVELS[169]?.module).toBe(17);
  });

  it("mantém layouts, títulos e assinaturas de rota distintos", () => {
    const signatures = LEVELS.map((level) =>
      `${level.title}::${level.nodes.map((node) => `${node.id}:${node.position.join(",")}`).join("|")}::${level.paths.map((path) => `${path.from}-${path.to}-${path.kind ?? "walk"}`).join("|")}`,
    );
    expect(new Set(signatures).size).toBe(170);
  });

  it("atribui uma assinatura própria a cada módulo-capítulo", () => {
    const chapterEntries = MODULES.map((module) => LEVELS[(module.id - 1) * 10]).filter(Boolean);
    const identities = chapterEntries.map((level) =>
      `${level?.symbol}:${level?.moduleTitle}:${level?.subtitle}:${level?.paths.map((path) => `${path.kind ?? "walk"}:${Number(Boolean(path.requiresSwitch))}:${Number(Boolean(path.requiresLight))}`).join(",")}`,
    );
    expect(new Set(chapterEntries.map((level) => level?.symbol)).size).toBe(17);
    expect(new Set(identities).size).toBe(17);
    expect(new Set(MODULES.map((module) => module.clue)).size).toBe(17);
  });

  it("introduz regras enigmáticas em ordem crescente", () => {
    expect(LEVELS.slice(0, 30).every((level) => level.paths.every((path) => !path.requiresLight))).toBe(true);
    expect(LEVELS.slice(70, 100).some((level) => level.paths.some((path) => path.kind === "portal"))).toBe(true);
    expect(LEVELS.slice(100, 140).some((level) => level.paths.some((path) => path.requiresLight))).toBe(true);
    expect(LEVELS.slice(140).some((level) => level.paths.some((path) => path.kind === "portal")) && LEVELS.slice(140).some((level) => level.paths.some((path) => path.requiresLight))).toBe(true);
  });

  it("preserva o arco de Íris entre companhia e perda", () => {
    expect(LEVELS[79]?.companionState).toBe("alone");
    expect(LEVELS[80]?.companionState).toBe("companioned");
    expect(LEVELS[80]?.companionState).toBe("companioned");
    expect(LEVELS[80]?.nodes.some((node) => node.kind === "companion" && node.label === "Íris")).toBe(true);
    expect(LEVELS[119]?.companionState).toBe("companioned");
    expect(LEVELS[119]?.nodes.some((node) => node.kind === "companion")).toBe(true);
    expect(LEVELS[120]?.companionState).toBe("lost");
    expect(LEVELS[120]?.nodes.some((node) => node.kind === "companion")).toBe(false);
  });
});
