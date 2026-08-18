import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, BookOpen, RotateCcw, Sparkles, X } from "lucide-react";
import { createGameScene, type GameHandle } from "@/game/scene";
import { Engine } from "@babylonjs/core/Engines/engine";
import { getLevel, LEVELS, MODULES } from "@/game/levels";
import type { GameSnapshot } from "@/game/types";

const LOGO_URL = "/manus-storage/princesas-optical-logo_714ccbeb.png";
const STAGE_URL = "/manus-storage/princesas-optical-stage_bae2c755.png";

const initialSnapshot: GameSnapshot = {
  level: getLevel(1),
  currentNodeId: "start",
  rotation: 0,
  switchOn: false,
  lightOn: false,
  completed: false,
  highestUnlocked: 1,
  completedLevelIds: [],
  message: "O baile ainda espera. Procure uma passagem que faça sentido de outro ângulo.",
  companionState: "alone",
  companionName: "Íris",
};

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<GameHandle | null>(null);
  const startedRef = useRef(false);
  const [snapshot, setSnapshot] = useState<GameSnapshot>(initialSnapshot);
  const isDemo = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("demo");
  const requestedDemoLevel = typeof window !== "undefined" ? Number(new URLSearchParams(window.location.search).get("level") ?? "1") : 1;
  const demoLevel = Number.isInteger(requestedDemoLevel) ? Math.max(1, Math.min(170, requestedDemoLevel)) : 1;
  const [started, setStarted] = useState(isDemo);
  const [levelsOpen, setLevelsOpen] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || startedRef.current) return;
    startedRef.current = true;
    const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, adaptToDeviceRatio: true });
    let disposed = false;

    createGameScene(
      engine,
      canvas,
      (nextSnapshot) => {
        if (!disposed) setSnapshot(nextSnapshot);
      },
      isDemo ? demoLevel : 1,
    ).then((handle) => {
      if (disposed) {
        handle.dispose();
        return;
      }
      handleRef.current = handle;
      engine.runRenderLoop(() => handle.scene.render());
      if (isDemo) {
        const steps = [
          window.setTimeout(() => handle.moveFirst(), 500),
          window.setTimeout(() => handle.rotate(1), 1050),
          window.setTimeout(() => handle.moveFirst(), 1650),
        ];
        window.setTimeout(() => steps.forEach((step) => window.clearTimeout(step)), 2500);
      }
    });

    const onResize = () => engine.resize();
    window.addEventListener("resize", onResize);
    return () => {
      disposed = true;
      window.removeEventListener("resize", onResize);
      handleRef.current?.dispose();
      handleRef.current = null;
      engine.dispose();
      startedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!started) return;
      const key = event.key.toLowerCase();
      if (["arrowleft", "a"].includes(key)) {
        event.preventDefault();
        handleRef.current?.rotate(-1);
      } else if (["arrowright", "d"].includes(key)) {
        event.preventDefault();
        handleRef.current?.rotate(1);
      } else if (["arrowup", "w", " "].includes(key)) {
        event.preventDefault();
        handleRef.current?.moveFirst();
      } else if (["arrowdown", "s"].includes(key)) {
        event.preventDefault();
        handleRef.current?.restart();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [started]);

  const progressLabel = useMemo(
    () => `${snapshot.completedLevelIds.length.toString().padStart(3, "0")} / 170 convites`,
    [snapshot.completedLevelIds.length],
  );

  const enterGame = () => {
    setStarted(true);
    handleRef.current?.loadLevel(snapshot.highestUnlocked);
  };

  const chooseLevel = (levelId: number) => {
    if (levelId > snapshot.highestUnlocked) return;
    setStarted(true);
    setLevelsOpen(false);
    handleRef.current?.loadLevel(levelId);
  };

  return (
    <main className="game-shell" style={{ "--stage-url": `url(${STAGE_URL})` } as React.CSSProperties}>
      <canvas ref={canvasRef} className="game-canvas" aria-label="Diorama interativo de Princesas do Baile" />

      {!started ? (
        <section className="title-card" aria-label="Início de Princesas do Baile">
          <div className="title-card__glow" />
          <img className="title-card__logo" src={LOGO_URL} alt="Logo de Princesas do Baile" />
          <p className="title-card__eyebrow">JOGO GRATUITO · 40 MONUMENTOS</p>
          <h1>O baile ainda espera.</h1>
          <p className="title-card__copy">
            Gire o olhar, una passagens impossíveis e devolva os convites perdidos à cidade suspensa.
          </p>
          <button className="button button--primary" type="button" onClick={enterGame}>
            <Sparkles size={18} aria-hidden="true" />
            Entrar no monumento
          </button>
          <p className="title-card__hint">Sem cronômetro, sem compras, sem punição por recomeçar.</p>
        </section>
      ) : null}

      {started ? (
        <>
          <header className="game-header">
            <div className="game-header__identity">
              <img src={LOGO_URL} alt="" className="game-header__mark" />
              <div>
                <p><span className="module-symbol" aria-label={`Símbolo do módulo ${snapshot.level.module}`}>{snapshot.level.symbol}</span> PRINCESAS DO BAILE · MÓDULO {snapshot.level.module} · FASE {snapshot.level.id.toString().padStart(3, "0")}</p>
                <h2>{snapshot.level.title}</h2>
              </div>
            </div>
            <div className="game-header__actions">
              <span className="progress-pill">{progressLabel}</span>
              <button className="icon-button" type="button" aria-label="Escolher fase" onClick={() => setLevelsOpen(true)}>
                <BookOpen size={19} />
              </button>
              <button className="icon-button" type="button" aria-label="Recomeçar fase" onClick={() => handleRef.current?.restart()}>
                <RotateCcw size={19} />
              </button>
            </div>
          </header>

          <aside className={`story-chip ${snapshot.completed ? "is-concealed" : ""}`}>
            <span className="story-chip__dot" />
            <p>{snapshot.level.objective}</p>
          </aside>
          {snapshot.companionState !== "alone" ? (
            <aside className={`companion-chip companion-chip--${snapshot.companionState}`}>
              <span className="companion-chip__mark">{snapshot.companionState === "companioned" ? "Í" : "…"}</span>
              <p>{snapshot.companionState === "companioned" ? `${snapshot.companionName} segue com Lina.` : `${snapshot.companionName} se perdeu entre os monumentos.`}</p>
            </aside>
          ) : null}

          <section className="directional-pad" aria-label="Direcional da fase">
            <button className="dpad-button dpad-button--up" type="button" aria-label="Seguir passagem" onClick={() => handleRef.current?.moveFirst()}>
              <ArrowUp size={20} />
              <span>Ir</span>
            </button>
            <button className="dpad-button dpad-button--left" type="button" aria-label="Girar para a esquerda" onClick={() => handleRef.current?.rotate(-1)}>
              <ArrowLeft size={20} />
              <span>Girar</span>
            </button>
            <div className="dpad-center" aria-hidden="true">{snapshot.rotation + 1}</div>
            <button className="dpad-button dpad-button--right" type="button" aria-label="Girar para a direita" onClick={() => handleRef.current?.rotate(1)}>
              <ArrowRight size={20} />
              <span>Girar</span>
            </button>
            <button className="dpad-button dpad-button--down" type="button" aria-label="Recomeçar fase" onClick={() => handleRef.current?.restart()}>
              <ArrowDown size={20} />
              <span>Reiniciar</span>
            </button>
          </section>

          <p className={`message-strip ${snapshot.completed ? "is-concealed" : ""}`} role="status">{snapshot.message}</p>

          {snapshot.completed ? (
            <section className="completion-card" aria-live="polite">
              <p className="completion-card__kicker">CONVITE RECUPERADO</p>
              <h3>Um novo salão se abre.</h3>
              <p>O monumento guardou sua memória. Você pode avançar ou revisitar esta rota quando quiser.</p>
              <div className="completion-card__actions">
                {snapshot.level.id < 170 ? (
                  <button className="button button--primary" type="button" onClick={() => handleRef.current?.nextLevel()}>
                    Próxima fase
                    <ArrowRight size={18} />
                  </button>
                ) : (
                  <button className="button button--primary" type="button" onClick={() => setLevelsOpen(true)}>
                    Rever os monumentos
                    <BookOpen size={18} />
                  </button>
                )}
                <button className="button button--quiet" type="button" onClick={() => handleRef.current?.restart()}>
                  Jogar de novo
                </button>
              </div>
            </section>
          ) : null}
        </>
      ) : null}

      {levelsOpen ? (
        <section className="level-drawer" role="dialog" aria-modal="true" aria-label="Mapa de monumentos">
          <div className="level-drawer__topline">
            <div>
              <p className="title-card__eyebrow">MAPA DO BAILE</p>
              <h2>170 convites</h2>
            </div>
            <button className="icon-button icon-button--light" type="button" aria-label="Fechar mapa" onClick={() => setLevelsOpen(false)}>
              <X size={18} />
            </button>
          </div>
          <p className="level-drawer__intro">Cada bloco apresenta uma nova maneira de tornar a arquitetura possível.</p>
          <div className="module-list">
            {MODULES.map((module) => {
              const moduleLevels = LEVELS.filter((level) => level.module === module.id);
              const moduleUnlocked = moduleLevels.some((level) => level.id <= snapshot.highestUnlocked);
              return (
                <section className={`module-section ${moduleUnlocked ? "module-section--open" : ""}`} key={module.id}>
                  <div className="module-section__heading">
                    <div>
                      <p>MÓDULO {module.id.toString().padStart(2, "0")} · ATO {module.act}</p>
                      <h3>{module.title}</h3>
                    </div>
                    <span>{moduleLevels.filter((level) => snapshot.completedLevelIds.includes(level.id)).length}/10</span>
                  </div>
                  <p className="module-section__clue">{module.subtitle}</p>
                  <div className="level-grid">
                    {moduleLevels.map((level) => {
                      const isUnlocked = level.id <= snapshot.highestUnlocked;
                      const isCompleted = snapshot.completedLevelIds.includes(level.id);
                      return (
                        <button
                          className={`level-card ${isUnlocked ? "level-card--open" : ""} ${isCompleted ? "level-card--complete" : ""}`}
                          disabled={!isUnlocked}
                          key={level.id}
                          type="button"
                          onClick={() => chooseLevel(level.id)}
                        >
                          <span>{level.id.toString().padStart(3, "0")}</span>
                          <strong>{level.title.replace(`${module.title} · `, "")}</strong>
                          <em>{isCompleted ? "Convite salvo" : isUnlocked ? `Fase ${((level.id - 1) % 10) + 1}/10` : "Bloqueado"}</em>
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </section>
      ) : null}
    </main>
  );
}
