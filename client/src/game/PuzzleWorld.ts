import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Scene } from "@babylonjs/core/scene";
import type { GameSnapshot, NodeKind, PuzzleLevel, PuzzleNode } from "./types";

type NodeRender = {
  top: Mesh;
  glow: StandardMaterial;
  kind: NodeKind;
};

type PathRender = {
  bridge: Mesh;
  material: StandardMaterial;
  from: string;
  to: string;
  visibleAt: number[];
  requiresSwitch: boolean;
  requiresLight: boolean;
  kind?: "bridge" | "portal" | "shadow";
};

const COLORS = {
  porcelain: Color3.FromHexString("#F4E9D5"),
  coral: Color3.FromHexString("#E56B63"),
  lagoon: Color3.FromHexString("#5AA7B4"),
  plum: Color3.FromHexString("#5D4969"),
  gold: Color3.FromHexString("#D5B46A"),
  shadow: Color3.FromHexString("#2D2940"),
};

function toVector(position: PuzzleNode["position"]) {
  return new Vector3(position[0], position[1], position[2]);
}

export class PuzzleWorld {
  private readonly created: Array<{ dispose: () => void }> = [];
  private readonly nodes = new Map<string, NodeRender>();
  private readonly paths: PathRender[] = [];
  private readonly positions = new Map<string, Vector3>();
  private playerRoot: TransformNode | null = null;
  private targetPlayerPosition = Vector3.Zero();
  private currentLevel: PuzzleLevel | null = null;

  constructor(
    private readonly scene: Scene,
    private readonly onNodeSelected: (nodeId: string) => void,
  ) {}

  build(level: PuzzleLevel) {
    this.disposeLevel();
    this.currentLevel = level;

    const floorMaterial = this.material("floor-material", COLORS.lagoon, 0.92);
    floorMaterial.emissiveColor = COLORS.lagoon.scale(0.24);
    const floor = MeshBuilder.CreateGround("dream-sea", { width: 44, height: 44 }, this.scene);
    floor.position.y = -0.22;
    floor.material = floorMaterial;
    this.created.push(floor, floorMaterial);

    const root = new TransformNode("monument-root", this.scene);
    this.created.push(root);

    for (const node of level.nodes) {
      this.createNode(node, root);
    }

    for (const path of level.paths) {
      this.createBridge(path.from, path.to, path.visibleAt, Boolean(path.requiresSwitch), Boolean(path.requiresLight), path.kind, root);
    }

    const playerRoot = new TransformNode("lina", this.scene);
    playerRoot.parent = root;
    const bodyMaterial = this.material("lina-cape", COLORS.coral, 0.98);
    const body = MeshBuilder.CreateCylinder("lina-body", { height: 0.56, diameterTop: 0.35, diameterBottom: 0.72, tessellation: 6 }, this.scene);
    body.parent = playerRoot;
    body.position.y = 0.28;
    body.material = bodyMaterial;
    const headMaterial = this.material("lina-head", COLORS.porcelain, 1);
    const head = MeshBuilder.CreateSphere("lina-head", { diameter: 0.33, segments: 10 }, this.scene);
    head.parent = playerRoot;
    head.position.y = 0.67;
    head.material = headMaterial;
    this.created.push(playerRoot, body, head, bodyMaterial, headMaterial);
    this.playerRoot = playerRoot;

    this.scene.onPointerDown = (_event, pickInfo) => {
      const selected = pickInfo?.pickedMesh?.metadata?.puzzleNodeId as string | undefined;
      if (selected) this.onNodeSelected(selected);
    };
  }

  refresh(snapshot: GameSnapshot) {
    this.targetPlayerPosition = this.positions.get(snapshot.currentNodeId)?.add(new Vector3(0, 0.3, 0)) ?? Vector3.Zero();
    const openPathKeys = new Set(
      snapshot.level.paths
        .filter(
          (path) => path.visibleAt.includes(snapshot.rotation) && (!path.requiresSwitch || snapshot.switchOn) && (!path.requiresLight || snapshot.lightOn),
        )
        .map((path) => `${path.from}:${path.to}`),
    );

    for (const path of this.paths) {
      const isOpen = openPathKeys.has(`${path.from}:${path.to}`);
      path.bridge.isVisible = isOpen;
      path.material.alpha = isOpen ? 0.98 : 0.12;
      path.material.emissiveColor = isOpen
        ? (path.kind === "shadow" ? COLORS.plum : path.kind === "portal" ? COLORS.gold : COLORS.coral).scale(0.28)
        : COLORS.plum.scale(0.05);
    }

    for (const [nodeId, render] of Array.from(this.nodes.entries())) {
      const isCurrent = nodeId === snapshot.currentNodeId;
      const isGoal = render.kind === "goal";
      const isSwitch = render.kind === "switch";
      const canReach = snapshot.level.paths.some(
        (path) =>
          path.visibleAt.includes(snapshot.rotation) &&
          (!path.requiresSwitch || snapshot.switchOn) &&
          (!path.requiresLight || snapshot.lightOn) &&
          ((path.from === snapshot.currentNodeId && path.to === nodeId) ||
            (path.to === snapshot.currentNodeId && path.from === nodeId)),
      );
      render.glow.emissiveColor = isGoal
        ? COLORS.gold.scale(snapshot.completed ? 0.8 : 0.4)
        : isCurrent
          ? COLORS.coral.scale(0.75)
          : isSwitch && !snapshot.switchOn
            ? COLORS.lagoon.scale(0.55)
            : canReach
              ? COLORS.porcelain.scale(0.18)
              : Color3.Black();
    }
  }

  update() {
    if (!this.playerRoot) return;
    this.playerRoot.position = Vector3.Lerp(this.playerRoot.position, this.targetPlayerPosition, 0.13);
  }

  dispose() {
    this.disposeLevel();
    this.scene.onPointerDown = undefined;
  }

  private disposeLevel() {
    while (this.created.length) this.created.pop()?.dispose();
    this.nodes.clear();
    this.paths.length = 0;
    this.positions.clear();
    this.playerRoot = null;
  }

  private material(name: string, color: Color3, alpha: number) {
    const material = new StandardMaterial(name, this.scene);
    material.diffuseColor = color;
    material.emissiveColor = color.scale(0.035);
    material.specularColor = Color3.Black();
    material.alpha = alpha;
    return material;
  }

  private createNode(node: PuzzleNode, parent: TransformNode) {
    const position = toVector(node.position);
    this.positions.set(node.id, position);

    const towerMaterial = this.material(`tower-${node.id}`, COLORS.porcelain, 1);
    const tower = MeshBuilder.CreateCylinder(
      `tower-${node.id}`,
      { height: Math.max(0.55, position.y + 0.35), diameterTop: 1.25, diameterBottom: 1.45, tessellation: 6 },
      this.scene,
    );
    tower.parent = parent;
    tower.position = new Vector3(position.x, Math.max(0.55, position.y + 0.35) / 2 - 0.14, position.z);
    tower.material = towerMaterial;

    const topColor =
      node.kind === "goal" ? COLORS.gold : node.kind === "switch" ? COLORS.lagoon : node.kind === "portal" ? COLORS.plum : COLORS.porcelain;
    const topMaterial = this.material(`top-${node.id}`, topColor, 1);
    const top = MeshBuilder.CreateCylinder(`node-${node.id}`, { height: 0.2, diameter: 1.1, tessellation: 24 }, this.scene);
    top.parent = parent;
    top.position = position.add(new Vector3(0, 0.05, 0));
    top.material = topMaterial;
    top.isPickable = true;
    top.metadata = { puzzleNodeId: node.id };

    if (node.kind === "goal" || node.kind === "portal") {
      const archMaterial = this.material(`arch-${node.id}`, node.kind === "goal" ? COLORS.gold : COLORS.plum, 1);
      const left = MeshBuilder.CreateBox(`arch-left-${node.id}`, { width: 0.18, height: 1.1, depth: 0.18 }, this.scene);
      const right = MeshBuilder.CreateBox(`arch-right-${node.id}`, { width: 0.18, height: 1.1, depth: 0.18 }, this.scene);
      const crown = MeshBuilder.CreateBox(`arch-crown-${node.id}`, { width: 0.86, height: 0.16, depth: 0.18 }, this.scene);
      for (const archPiece of [left, right, crown]) {
        archPiece.parent = parent;
        archPiece.material = archMaterial;
        this.created.push(archPiece);
      }
      left.position = position.add(new Vector3(-0.36, 0.62, 0));
      right.position = position.add(new Vector3(0.36, 0.62, 0));
      crown.position = position.add(new Vector3(0, 1.12, 0));
      this.created.push(archMaterial);
    }

    this.nodes.set(node.id, { top, glow: topMaterial, kind: node.kind });
    this.created.push(tower, top, towerMaterial, topMaterial);
  }

  private createBridge(
    fromId: string,
    toId: string,
    visibleAt: number[],
    requiresSwitch: boolean,
    requiresLight: boolean,
    kind: "bridge" | "portal" | "shadow" | undefined,
    parent: TransformNode,
  ) {
    const from = this.positions.get(fromId);
    const to = this.positions.get(toId);
    if (!from || !to) return;
    const horizontalFrom = new Vector3(from.x, 0, from.z);
    const horizontalTo = new Vector3(to.x, 0, to.z);
    const length = Vector3.Distance(horizontalFrom, horizontalTo);
    const bridgeColor = kind === "shadow" ? COLORS.plum : kind === "portal" ? COLORS.gold : COLORS.coral;
    const bridgeMaterial = this.material(`bridge-${fromId}-${toId}`, bridgeColor, kind === "shadow" ? 0.82 : 0.98);
    const bridge = MeshBuilder.CreateBox(
      `bridge-${fromId}-${toId}`,
      { width: Math.max(1.05, length), height: 0.16, depth: 0.54 },
      this.scene,
    );
    bridge.parent = parent;
    bridge.position = Vector3.Center(from, to).add(new Vector3(0, 0.08, 0));
    bridge.rotation.y = -Math.atan2(to.z - from.z, to.x - from.x);
    bridge.material = bridgeMaterial;
    bridge.isPickable = false;

    this.paths.push({ bridge, material: bridgeMaterial, from: fromId, to: toId, visibleAt, requiresSwitch, requiresLight, kind });
    this.created.push(bridge, bridgeMaterial);
  }
}
