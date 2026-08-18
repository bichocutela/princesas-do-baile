export type Rotation = 0 | 1 | 2 | 3;

export type NodeKind = "start" | "path" | "goal" | "switch" | "portal";

export type PuzzleNode = {
  id: string;
  position: [number, number, number];
  kind: NodeKind;
  label?: string;
  portalTargetId?: string;
};

export type PuzzlePath = {
  id: string;
  from: string;
  to: string;
  visibleAt: Rotation[];
  requiresSwitch?: boolean;
  requiresLight?: boolean;
  kind?: "bridge" | "portal" | "shadow";
};

export type PuzzleLevel = {
  id: number;
  act: 1 | 2 | 3 | 4 | 5;
  title: string;
  subtitle: string;
  initialRotation: Rotation;
  nodes: PuzzleNode[];
  paths: PuzzlePath[];
  startNodeId: string;
  goalNodeId: string;
  objective: string;
};

export type LocalProgress = {
  highestUnlocked: number;
  completedLevelIds: number[];
  collectedInvitationIds: number[];
  soundEnabled: boolean;
  lastPlayedLevelId: number;
};

export type GameSnapshot = {
  level: PuzzleLevel;
  currentNodeId: string;
  rotation: Rotation;
  switchOn: boolean;
  lightOn: boolean;
  completed: boolean;
  highestUnlocked: number;
  completedLevelIds: number[];
  message: string;
};
