import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Scene } from "@babylonjs/core/scene";
import { PuzzleSession } from "./PuzzleSession";
import { PuzzleWorld } from "./PuzzleWorld";
import type { GameSnapshot } from "./types";

export type GameHandle = {
  scene: Scene;
  start: () => void;
  rotate: (direction: -1 | 1) => void;
  moveFirst: () => void;
  restart: () => void;
  loadLevel: (levelId: number) => void;
  nextLevel: () => void;
  dispose: () => void;
};

export async function createGameScene(
  engine: Engine,
  canvas: HTMLCanvasElement,
  onSnapshot: (snapshot: GameSnapshot) => void,
  initialLevelId = 1,
): Promise<GameHandle> {
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0, 0, 0, 0);

  const isCompactViewport = window.innerWidth < 720;
  const initialRadius = isCompactViewport ? 21 : 16;
  const camera = new ArcRotateCamera("isometric-camera", -Math.PI / 4, 1.12, initialRadius, new Vector3(0, 1.4, 0), scene);
  camera.lowerRadiusLimit = isCompactViewport ? 19 : 14;
  camera.upperRadiusLimit = isCompactViewport ? 23 : 17;
  camera.panningSensibility = 0;
  camera.wheelPrecision = 999999;
  camera.attachControl(canvas, false);

  const skyLight = new HemisphericLight("sky-light", new Vector3(0.3, 1, -0.2), scene);
  skyLight.intensity = 1.3;
  skyLight.diffuse = new Vector3(0.94, 0.9, 0.96) as unknown as typeof skyLight.diffuse;
  skyLight.groundColor = new Vector3(0.38, 0.32, 0.46) as unknown as typeof skyLight.groundColor;
  const sunLight = new DirectionalLight("sun-light", new Vector3(-0.4, -1, 0.35), scene);
  sunLight.intensity = 1.38;

  const session = new PuzzleSession(initialLevelId, initialLevelId > 1);
  let world: PuzzleWorld;
  let desiredAlpha = -Math.PI / 4 + session.snapshot().rotation * (Math.PI / 2);

  const emit = () => onSnapshot(session.snapshot());
  const renderCurrentLevel = () => {
    world.build(session.snapshot().level);
    world.refresh(session.snapshot());
    desiredAlpha = -Math.PI / 4 + session.snapshot().rotation * (Math.PI / 2);
    emit();
  };

  world = new PuzzleWorld(scene, (nodeId) => {
    session.moveTo(nodeId);
    world.refresh(session.snapshot());
    emit();
  });
  renderCurrentLevel();

  const rotate = (direction: -1 | 1) => {
    session.rotate(direction);
    desiredAlpha = -Math.PI / 4 + session.snapshot().rotation * (Math.PI / 2);
    world.refresh(session.snapshot());
    emit();
  };

  const moveFirst = () => {
    session.moveFirstAvailable();
    world.refresh(session.snapshot());
    emit();
  };

  const restart = () => {
    session.restart();
    desiredAlpha = -Math.PI / 4 + session.snapshot().rotation * (Math.PI / 2);
    world.refresh(session.snapshot());
    emit();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "Enter", "a", "A", "d", "D", "r", "R"].includes(event.key)) {
      event.preventDefault();
    }
    if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") rotate(-1);
    if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") rotate(1);
    if (event.key === "ArrowUp" || event.key === "Enter") moveFirst();
    if (event.key === "r" || event.key === "R") restart();
  };
  window.addEventListener("keydown", onKeyDown);

  scene.onBeforeRenderObservable.add(() => {
    camera.alpha += (desiredAlpha - camera.alpha) * 0.12;
    world.update();
  });

  return {
    scene,
    start: () => renderCurrentLevel(),
    rotate,
    moveFirst,
    restart,
    loadLevel: (levelId) => {
      session.loadLevel(levelId);
      renderCurrentLevel();
    },
    nextLevel: () => {
      session.goToNextLevel();
      renderCurrentLevel();
    },
    dispose: () => {
      window.removeEventListener("keydown", onKeyDown);
      world.dispose();
      scene.dispose();
    },
  };
}
