import type { PuzzleLevel, PuzzleNode, PuzzlePath, Rotation } from "./types";

const titles = [
  "O Primeiro Convite", "Escada que Espera", "Janela para Cima", "Três Degraus de Nuvem", "Pátio Inclinado", "A Torre Dobrável", "Fonte Sem Fundo", "Terraço do Horizonte",
  "A Ponte de Coral", "Moinho de Vidro", "Jardim em Três Atos", "Maré de Porcelana", "Varanda dos Lírios", "A Chave de Bronze", "Horta Suspensa", "Jardim da Última Maré",
  "Espelho de Chegada", "Retrato Invertido", "Corredor de Duas Luas", "Varanda Repetida", "Valsa das Molduras", "Sala de Água Vertical", "A Porta que Lembra", "Galeria do Avesso",
  "Sombra de Escada", "Relógio de Pedra", "Terraço Escuro", "Torre que Respira", "Onda de Luz", "Sala das Lanternas", "Escadaria da Noite", "Torre do Silêncio",
  "Convites ao Vento", "Sala de Ensaios", "O Arco Infinito", "Damas da Arquitetura", "Quatro Pontos Cardeais", "O Baile Suspenso", "A Última Convidada", "Princesas do Baile",
] as const;

const subtitles = [
  "Alinhe os terraços e descubra uma rota que só existe pelo olhar.",
  "A ponte certa aparece quando o monumento decide girar com você.",
  "Alguns caminhos precisam de uma chave; outros, de uma nova perspectiva.",
  "Luz, espelhos e escadas podem contar a mesma história em ângulos diferentes.",
  "O último salão abre apenas para quem reuniu todos os gestos do baile.",
] as const;

type Position = [number, number, number];

const asRotation = (value: number): Rotation => ((value % 4 + 4) % 4) as Rotation;
const point = (id: string, position: Position, kind: PuzzleNode["kind"], extra: Partial<PuzzleNode> = {}): PuzzleNode => ({ id, position, kind, ...extra });
const route = (id: string, from: string, to: string, visibleAt: Rotation[], options: Partial<PuzzlePath> = {}): PuzzlePath => ({ id, from, to, visibleAt, ...options });

const layoutFrames: Array<{ start: Position; switch: Position; middle: Position; portal: Position; shadow: Position; goal: Position }> = [
  { start: [-3.9, .35, -.8], switch: [-2.0, .9, 1.35], middle: [0, 1.8, -.25], portal: [1.4, 2.65, 1.6], shadow: [2.2, 3.1, -.7], goal: [3.9, 3.8, .35] },
  { start: [-3.6, .35, 1.35], switch: [-1.15, 1.1, .2], middle: [.65, 2.25, -1.45], portal: [2.45, 2.8, .15], shadow: [.9, 3.25, 1.85], goal: [3.8, 4.0, -1.1] },
  { start: [-4.1, .35, -.15], switch: [-2.4, 1.45, -1.65], middle: [-.15, 1.45, 1.25], portal: [1.65, 2.85, -.85], shadow: [2.6, 3.5, 1.35], goal: [4.05, 3.55, -.35] },
  { start: [-3.55, .35, -1.55], switch: [-1.1, 1.1, -1.25], middle: [.15, 2.45, .65], portal: [2.25, 2.25, 1.55], shadow: [1.6, 3.65, -.35], goal: [3.9, 4.1, 1.05] },
  { start: [-3.95, .35, .85], switch: [-1.75, .85, -.85], middle: [.4, 2.0, .3], portal: [1.15, 3.1, -1.6], shadow: [2.85, 3.25, .15], goal: [4.15, 3.75, -1.1] },
  { start: [-3.45, .35, -.25], switch: [-2.1, 1.6, 1.45], middle: [.35, 1.75, 1.25], portal: [2.05, 3.15, -.25], shadow: [.8, 3.55, -1.55], goal: [3.95, 4.15, .9] },
  { start: [-4.15, .35, 1.55], switch: [-1.85, 1.25, .75], middle: [.1, 2.45, -.65], portal: [1.9, 2.6, 1.15], shadow: [2.5, 3.7, -.95], goal: [4.05, 3.9, .15] },
  { start: [-3.65, .35, -.95], switch: [-1.4, .95, .45], middle: [.45, 2.15, 1.5], portal: [2.45, 3.0, -.65], shadow: [1.2, 3.85, .15], goal: [4.15, 4.25, 1.25] },
];

function stagger(frame: Position, id: number, scale = 1): Position {
  const chapter = Math.floor((id - 1) / 8);
  const drift = ((id * 3) % 5 - 2) * 0.16 * scale;
  return [frame[0] + drift, frame[1] + chapter * 0.08, frame[2] - drift * 0.7];
}

function createLevel(id: number): PuzzleLevel {
  const act = Math.ceil(id / 8) as PuzzleLevel["act"];
  const initialRotation = asRotation(id - 1);
  const frame = layoutFrames[(id - 1) % layoutFrames.length] ?? layoutFrames[0];
  const start = stagger(frame.start, id);
  const switchPoint = stagger(frame.switch, id, .7);
  const middle = stagger(frame.middle, id, .85);
  const portal = stagger(frame.portal, id, .65);
  const shadow = stagger(frame.shadow, id, .6);
  const goal = stagger(frame.goal, id, .55);
  const r0 = initialRotation;
  const r1 = asRotation(initialRotation + 1);
  const r2 = asRotation(initialRotation + 2);
  const r3 = asRotation(initialRotation + 3);

  const nodes: PuzzleNode[] = [point("start", start, "start"), point("middle", middle, "path"), point("goal", goal, "goal")];
  const paths: PuzzlePath[] = [];

  if (act === 1) {
    const waypoint = point("waypoint", switchPoint, "path");
    nodes.splice(1, 0, waypoint);
    paths.push(
      route("perspectiva-1", "start", "waypoint", [r0]),
      route("perspectiva-2", "waypoint", "middle", [r1]),
      route("perspectiva-3", "middle", "goal", [r2]),
    );
  }

  if (act === 2) {
    nodes.splice(1, 0, point("switch", switchPoint, "switch"));
    paths.push(
      route("alavanca-de-entrada", "start", "switch", [r0]),
      route("ponte-de-lírio", "switch", "middle", [r1]),
      route("passarela-dobrada", "middle", "goal", [r2], { requiresSwitch: true, kind: "bridge" }),
    );
  }

  if (act === 3) {
    const portalExit: Position = [portal[0] + 1.1, portal[1] + .55, portal[2] - 1.35];
    nodes.splice(
      1,
      0,
      point("switch", switchPoint, "switch"),
      point("portal-entry", portal, "portal", { portalTargetId: "portal-exit" }),
      point("portal-exit", portalExit, "portal", { portalTargetId: "portal-entry" }),
    );
    paths.push(
      route("chave-de-galeria", "start", "switch", [r0]),
      route("varanda-refletida", "switch", "middle", [r1]),
      route("arco-de-espelho", "middle", "portal-entry", [r2], { requiresSwitch: true, kind: "portal" }),
      route("saída-invertida", "portal-exit", "goal", [r3], { requiresSwitch: true, kind: "portal" }),
    );
  }

  if (act === 4) {
    nodes.splice(1, 0, point("switch", switchPoint, "switch"), point("shadow", shadow, "path"));
    paths.push(
      route("lanterna-de-entrada", "start", "switch", [r0]),
      route("corredor-escuro", "switch", "middle", [r1]),
      route("sombra-sólida", "middle", "shadow", [r2], { requiresSwitch: true, requiresLight: true, kind: "shadow" }),
      route("sombra-de-saída", "shadow", "goal", [r3], { requiresSwitch: true, requiresLight: true, kind: "shadow" }),
    );
  }

  if (act === 5) {
    const portalExit: Position = [portal[0] + 1.15, portal[1] + .6, portal[2] - 1.25];
    nodes.splice(
      1,
      0,
      point("switch", switchPoint, "switch"),
      point("portal-entry", portal, "portal", { portalTargetId: "portal-exit" }),
      point("portal-exit", portalExit, "portal", { portalTargetId: "portal-entry" }),
      point("shadow", shadow, "path"),
    );
    paths.push(
      route("primeira-inclinação", "start", "switch", [r0]),
      route("ponte-de-ensaio", "switch", "middle", [r1]),
      route("arco-final", "middle", "portal-entry", [r2], { requiresSwitch: true, kind: "portal" }),
      route("véu-de-sombra", "portal-exit", "shadow", [r3], { requiresSwitch: true, requiresLight: true, kind: "shadow" }),
      route("última-passarela", "shadow", "goal", [r0], { requiresSwitch: true, requiresLight: true, kind: "bridge" }),
    );
  }

  return {
    id,
    act,
    title: titles[id - 1],
    subtitle: subtitles[act - 1],
    initialRotation,
    nodes,
    paths,
    startNodeId: "start",
    goalNodeId: "goal",
    objective:
      act === 1 ? "Gire o monumento até que três passarelas se alinhem." :
      act === 2 ? "Ative a alavanca e dobre a rota por outra face." :
      act === 3 ? "Use o arco de espelho quando a rota refletida aparecer." :
      act === 4 ? "Acenda a lanterna e atravesse as sombras sólidas." :
      "Combine ponte, espelho e sombra para abrir o último convite.",
  };
}

export const LEVELS = Array.from({ length: 40 }, (_, index) => createLevel(index + 1));

export function getLevel(levelId: number): PuzzleLevel {
  return LEVELS[Math.max(0, Math.min(LEVELS.length - 1, levelId - 1))] ?? LEVELS[0];
}
