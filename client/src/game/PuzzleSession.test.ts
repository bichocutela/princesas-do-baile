import { describe, expect, it } from "vitest";
import { PuzzleSession } from "./PuzzleSession";

describe("sessão de quebra-cabeça", () => {
  it("conclui uma fase do quinto ato ao combinar alavanca, portal e sombra", () => {
    const session = new PuzzleSession(33, true);

    session.moveFirstAvailable();
    expect(session.snapshot()).toMatchObject({ currentNodeId: "switch", switchOn: true, completed: false });

    session.rotate(1);
    session.moveFirstAvailable();
    expect(session.snapshot().currentNodeId).toBe("middle");

    session.rotate(1);
    session.moveFirstAvailable();
    expect(session.snapshot().currentNodeId).toBe("portal-exit");

    session.rotate(1);
    session.moveFirstAvailable();
    expect(session.snapshot().currentNodeId).toBe("shadow");

    session.rotate(1);
    session.moveFirstAvailable();
    expect(session.snapshot()).toMatchObject({ currentNodeId: "goal", completed: true });
  });

  it("acende a lanterna antes de liberar as rotas de sombra", () => {
    const session = new PuzzleSession(25, true);
    expect(session.snapshot().lightOn).toBe(false);
    session.moveFirstAvailable();
    expect(session.snapshot()).toMatchObject({ currentNodeId: "switch", lightOn: true, switchOn: true });
  });
});
