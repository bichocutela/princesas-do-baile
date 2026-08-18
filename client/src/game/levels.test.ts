import { describe, expect, it } from "vitest";
import { LEVELS } from "./levels";

describe("catálogo de monumentos", () => {
  it("entrega quarenta fases em cinco atos completos", () => {
    expect(LEVELS).toHaveLength(40);
    expect(LEVELS.map((level) => level.act)).toEqual([
      ...Array(8).fill(1), ...Array(8).fill(2), ...Array(8).fill(3), ...Array(8).fill(4), ...Array(8).fill(5),
    ]);
  });

  it("mantém layouts e assinaturas de rota distintos entre as quarenta fases", () => {
    const signatures = LEVELS.map((level) =>
      `${level.nodes.map((node) => `${node.id}:${node.position.join(",")}`).join("|")}::${level.paths.map((path) => `${path.from}-${path.to}-${path.kind ?? "walk"}`).join("|")}`,
    );
    expect(new Set(signatures).size).toBe(40);
  });

  it("inclui portais, sombras e combinações no avanço dos atos", () => {
    expect(LEVELS[16]?.paths.some((path) => path.kind === "portal")).toBe(true);
    expect(LEVELS[16]?.nodes.some((node) => node.kind === "portal" && node.portalTargetId)).toBe(true);
    expect(LEVELS[24]?.paths.some((path) => path.kind === "shadow")).toBe(true);
    expect(LEVELS[24]?.paths.some((path) => path.requiresLight)).toBe(true);
    expect(LEVELS[32]?.paths.some((path) => path.kind === "portal")).toBe(true);
    expect(LEVELS[32]?.paths.some((path) => path.kind === "shadow")).toBe(true);
  });
});
