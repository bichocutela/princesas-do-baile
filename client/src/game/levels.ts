import type { PuzzleLevel, PuzzleNode, PuzzlePath, Rotation } from "./types";
import { getModuleForLevel, MODULES, PHASES_PER_MODULE, TOTAL_LEVELS } from "./modules";

type Position = [number, number, number];

const phaseNames = [
  "A primeira marca", "O ângulo oculto", "Entre duas paredes", "O gesto repetido", "A passagem estreita",
  "A sala sem centro", "O desenho na poeira", "A escada que recorda", "A vista impossível", "O convite selado",
] as const;

const frames: Position[][] = [
  [[-4, .3, -.8], [-2.2, 1.1, 1.2], [0, 1.8, -.2], [1.7, 2.7, 1.3], [3.8, 3.5, .2]],
  [[-3.7, .3, 1.3], [-1.2, 1.4, .3], [.3, 2.1, -1.4], [2.3, 2.8, .1], [4, 3.7, -1]],
  [[-4.1, .3, -.1], [-2.3, 1.5, -1.5], [-.1, 1.7, 1.3], [1.7, 2.9, -.7], [4, 3.7, .4]],
  [[-3.6, .3, -1.4], [-1.1, 1.1, -1.1], [.2, 2.3, .6], [2.2, 2.4, 1.4], [3.9, 4, 1]],
  [[-4, .3, .8], [-1.8, .9, -.8], [.4, 2, .3], [1.2, 3, -1.5], [4, 3.8, -1.1]],
  [[-3.5, .3, -.2], [-2, 1.5, 1.4], [.4, 1.8, 1.2], [2.1, 3, -.2], [4, 4, .9]],
  [[-4.1, .3, 1.4], [-1.8, 1.2, .7], [.1, 2.4, -.6], [1.9, 2.7, 1.1], [4, 3.8, .1]],
  [[-3.7, .3, -.9], [-1.4, 1, .4], [.4, 2.1, 1.4], [2.4, 3, -.6], [4.1, 4.1, 1.2]],
];

const asRotation = (value: number): Rotation => ((value % 4 + 4) % 4) as Rotation;
const point = (id: string, position: Position, kind: PuzzleNode["kind"], extra: Partial<PuzzleNode> = {}): PuzzleNode => ({ id, position, kind, ...extra });
const route = (id: string, from: string, to: string, visibleAt: Rotation[], options: Partial<PuzzlePath> = {}): PuzzlePath => ({ id, from, to, visibleAt, ...options });

function varied(position: Position, levelId: number, amount = 1): Position {
  const drift = (((levelId * 7) % 11) - 5) * .09 * amount;
  const rise = Math.floor((levelId - 1) / PHASES_PER_MODULE) * .045;
  return [position[0] + drift, position[1] + rise, position[2] - drift * .72];
}

function createLevel(id: number): PuzzleLevel {
  const module = getModuleForLevel(id);
  const phase = ((id - 1) % PHASES_PER_MODULE) + 1;
  const frame = frames[(id + module.id * 2) % frames.length] ?? frames[0];
  const initialRotation = asRotation(id + module.id + phase);
  const [startPos, switchPos, middlePos, portalPos, goalPos] = frame.map((position, index) => varied(position, id, 1 + index * .08));
  const shadowPos = varied([portalPos[0] - .3, portalPos[1] + .65, portalPos[2] + 1.4], id, .7);
  const portalExitPos = varied([portalPos[0] + 1.1, portalPos[1] + .55, portalPos[2] - 1.25], id, .65);
  const r0 = initialRotation;
  const r1 = asRotation(r0 + 1);
  const r2 = asRotation(r0 + 2);
  const r3 = asRotation(r0 + 3);
  const nodes: PuzzleNode[] = [point("start", startPos, "start"), point("goal", goalPos, "goal")];
  const paths: PuzzlePath[] = [];
  const needsBridge = module.mechanic === "bridges" || module.mechanic === "compound";
  const needsPortal = module.mechanic === "portals" || module.mechanic === "compound";
  const needsShadow = module.mechanic === "shadows" || module.mechanic === "compound";

  if (needsBridge || needsPortal || needsShadow) {
    nodes.push(point("switch", switchPos, "switch", { label: module.mechanic === "shadows" ? "A lanterna" : "A alavanca" }));
    paths.push(route("entrada", "start", "switch", [r0]));
  } else {
    nodes.push(point("waypoint", switchPos, "path"));
    paths.push(route("primeira-perspectiva", "start", "waypoint", [r0]));
  }

  nodes.push(point("middle", middlePos, "path"));
  paths.push(route("passagem-central", needsBridge || needsPortal || needsShadow ? "switch" : "waypoint", "middle", [r1], {
    requiresSwitch: needsBridge || needsPortal || needsShadow,
    kind: needsBridge ? "bridge" : undefined,
  }));

  if (needsPortal) {
    nodes.push(point("portal-entry", portalPos, "portal", { portalTargetId: "portal-exit" }));
    nodes.push(point("portal-exit", portalExitPos, "portal", { portalTargetId: "portal-entry" }));
    paths.push(route("arco-entrada", "middle", "portal-entry", [r2], { requiresSwitch: true, kind: "portal" }));
    if (needsShadow) {
      nodes.push(point("shadow", shadowPos, "path"));
      paths.push(route("véu-da-sombra", "portal-exit", "shadow", [r3], { requiresSwitch: true, requiresLight: true, kind: "shadow" }));
      paths.push(route("última-luz", "shadow", "goal", [asRotation(r0 + phase % 2)], { requiresSwitch: true, requiresLight: true, kind: "bridge" }));
    } else {
      paths.push(route("arco-saída", "portal-exit", "goal", [r3], { requiresSwitch: true, kind: "portal" }));
    }
  } else if (needsShadow) {
    nodes.push(point("shadow", shadowPos, "path"));
    paths.push(route("sombra-sólida", "middle", "shadow", [r2], { requiresSwitch: true, requiresLight: true, kind: "shadow" }));
    paths.push(route("saída-na-sombra", "shadow", "goal", [r3], { requiresSwitch: true, requiresLight: true, kind: "shadow" }));
  } else {
    paths.push(route("passagem-final", "middle", "goal", [r2], { requiresSwitch: needsBridge, kind: needsBridge ? "bridge" : undefined }));
  }

  return {
    id,
    act: module.act,
    module: module.id,
    moduleTitle: module.title,
    companionState: module.companionState,
    title: `${module.title} · ${phaseNames[phase - 1]}`,
    subtitle: module.subtitle,
    initialRotation,
    nodes,
    paths,
    startNodeId: "start",
    goalNodeId: "goal",
    objective: `Módulo ${module.id}/17 · Fase ${phase}/10. ${module.clue}`,
  };
}

export const LEVELS = Array.from({ length: TOTAL_LEVELS }, (_, index) => createLevel(index + 1));

export function getLevel(levelId: number): PuzzleLevel {
  return LEVELS[Math.max(0, Math.min(LEVELS.length - 1, levelId - 1))] ?? LEVELS[0];
}

export { MODULES };
