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

type WorldTheme = {
  floor: Color3;
  tower: Color3;
  accent: Color3;
  switch: Color3;
  portal: Color3;
  shadow: Color3;
  gold: Color3;
};

const theme = (floor: string, tower: string, accent: string, portal: string, shadow: string, gold: string): WorldTheme => ({
  floor: Color3.FromHexString(floor),
  tower: Color3.FromHexString(tower),
  accent: Color3.FromHexString(accent),
  switch: Color3.FromHexString("#63A9AF"),
  portal: Color3.FromHexString(portal),
  shadow: Color3.FromHexString(shadow),
  gold: Color3.FromHexString(gold),
});

const MODULE_THEMES: WorldTheme[] = [
  theme("#24425A", "#D7CCB6", "#E87563", "#785A86", "#303047", "#E0B76A"),
  theme("#2D5267", "#BFD1C7", "#EB8F65", "#5D5F90", "#2A3C4A", "#F0C56C"),
  theme("#304563", "#D6C4D2", "#E35E78", "#7A4C83", "#29263C", "#DDB968"),
  theme("#31575A", "#C7D4B8", "#E69A57", "#557C78", "#263D3B", "#E9C66D"),
  theme("#245360", "#B8D3D0", "#EE746B", "#43788B", "#263D4B", "#F2D27E"),
  theme("#3A495F", "#D7D0C0", "#C9657B", "#755C8F", "#2A2A42", "#E1B761"),
  theme("#285068", "#C8D2DC", "#EE9769", "#5276A2", "#27384C", "#E8C571"),
  theme("#3C4267", "#D8C9DB", "#EA718F", "#8A5F9A", "#2A294B", "#EFC16F"),
  theme("#304F73", "#8EB8C2", "#F0836D", "#6779A8", "#29374D", "#F1CA72"),
  theme("#3C3B63", "#D6C6BC", "#E97A72", "#A0609B", "#29263F", "#EAB964"),
  theme("#263A58", "#B9C8D2", "#DA6A86", "#596C9D", "#202B43", "#DAB767"),
  theme("#2D3E5C", "#D0C2CB", "#E98A6F", "#7D5F96", "#262A40", "#E9C377"),
  theme("#1E344E", "#B5C4CB", "#C46D87", "#586E89", "#1F263A", "#CFAF62"),
  theme("#25364B", "#C4BFC3", "#DD7B72", "#695A78", "#222532", "#D5B35D"),
  theme("#2C3157", "#C6B0D8", "#E66768", "#8062A0", "#22243A", "#F0C86E"),
  theme("#313552", "#C9C8D0", "#D66682", "#7F6AA7", "#24243A", "#E6B96A"),
  theme("#26384E", "#E0D3B9", "#F18064", "#9D6B8B", "#212538", "#F6D17D"),
];

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
  private theme: WorldTheme = MODULE_THEMES[0]!;

  constructor(
    private readonly scene: Scene,
    private readonly onNodeSelected: (nodeId: string) => void,
  ) {}

  build(level: PuzzleLevel) {
    this.disposeLevel();
    this.currentLevel = level;
    this.theme = MODULE_THEMES[(level.module - 1) % MODULE_THEMES.length] ?? MODULE_THEMES[0]!;
    const floorMaterial = this.material("floor-material", this.theme.floor, 0.96);
    floorMaterial.emissiveColor = this.theme.floor.scale(0.17);
    const floor = MeshBuilder.CreateGround("dream-sea", { width: 44, height: 44 }, this.scene);
    floor.position.y = -0.22;
    floor.material = floorMaterial;
    this.created.push(floor, floorMaterial);

    const root = new TransformNode("monument-root", this.scene);
    this.created.push(root);
    this.createModuleLandmark(level, root);

    for (const node of level.nodes) {
      this.createNode(node, root);
    }

    for (const path of level.paths) {
      this.createBridge(path.from, path.to, path.visibleAt, Boolean(path.requiresSwitch), Boolean(path.requiresLight), path.kind, root);
    }

    const playerRoot = new TransformNode("lina", this.scene);
    playerRoot.parent = root;
    const bodyMaterial = this.material("lina-cape", this.theme.accent, 0.98);
    const body = MeshBuilder.CreateCylinder("lina-body", { height: 0.56, diameterTop: 0.35, diameterBottom: 0.72, tessellation: 6 }, this.scene);
    body.parent = playerRoot;
    body.position.y = 0.28;
    body.material = bodyMaterial;
    const headMaterial = this.material("lina-head", this.theme.tower, 1);
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
        ? (path.kind === "shadow" ? this.theme.shadow : path.kind === "portal" ? this.theme.gold : this.theme.accent).scale(0.34)
        : this.theme.shadow.scale(0.07);
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
        ? this.theme.gold.scale(snapshot.completed ? 0.8 : 0.48)
        : isCurrent
          ? this.theme.accent.scale(0.82)
          : isSwitch && !snapshot.switchOn
            ? this.theme.switch.scale(0.62)
            : canReach
              ? this.theme.tower.scale(0.26)
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
    material.emissiveColor = color.scale(0.72);
    material.disableLighting = true;
    material.specularColor = Color3.Black();
    material.alpha = alpha;
    return material;
  }

  private createNode(node: PuzzleNode, parent: TransformNode) {
    const position = toVector(node.position);
    this.positions.set(node.id, position);

    const towerMaterial = this.material(`tower-${node.id}`, this.theme.tower, 1);
    const moduleStyle = (this.currentLevel?.module ?? 1) % 5;
    const towerHeight = Math.max(0.55, position.y + 0.35);
    const tower = moduleStyle === 1
      ? MeshBuilder.CreateBox(`tower-${node.id}`, { width: 1.2, height: towerHeight, depth: 1.2 }, this.scene)
      : MeshBuilder.CreateCylinder(
          `tower-${node.id}`,
          {
            height: towerHeight,
            diameterTop: moduleStyle === 2 ? 0.78 : moduleStyle === 3 ? 1.55 : 1.25,
            diameterBottom: moduleStyle === 2 ? 1.7 : moduleStyle === 4 ? 1.05 : 1.45,
            tessellation: moduleStyle === 0 ? 6 : moduleStyle === 3 ? 3 : moduleStyle === 4 ? 8 : 5,
          },
          this.scene,
        );
    tower.parent = parent;
    tower.position = new Vector3(position.x, towerHeight / 2 - 0.14, position.z);
    tower.rotation.y = moduleStyle === 1 ? Math.PI / 4 : moduleStyle === 3 ? Math.PI / 6 : 0;
    tower.material = towerMaterial;

    const topColor =
      node.kind === "goal" ? this.theme.gold : node.kind === "switch" ? this.theme.switch : node.kind === "portal" ? this.theme.portal : node.kind === "companion" ? this.theme.accent : this.theme.tower;
    const topMaterial = this.material(`top-${node.id}`, topColor, 1);
    const top = MeshBuilder.CreateCylinder(`node-${node.id}`, { height: 0.2, diameter: 1.1, tessellation: 24 }, this.scene);
    top.parent = parent;
    top.position = position.add(new Vector3(0, 0.05, 0));
    top.material = topMaterial;
    top.isPickable = true;
    top.metadata = { puzzleNodeId: node.id };

    if (node.kind === "companion") {
      const companionMaterial = this.material(`companion-${node.id}`, this.theme.accent, 1);
      const companion = MeshBuilder.CreateSphere(`companion-${node.id}`, { diameter: .42, segments: 16 }, this.scene);
      companion.parent = parent;
      companion.position = position.add(new Vector3(0, .55, 0));
      companion.material = companionMaterial;
      companion.isPickable = true;
      companion.metadata = { puzzleNodeId: node.id };
      this.created.push(companion, companionMaterial);
    }

    if (node.kind === "goal" || node.kind === "portal") {
      const archMaterial = this.material(`arch-${node.id}`, node.kind === "goal" ? this.theme.gold : this.theme.portal, 1);
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
    const bridgeColor = kind === "shadow" ? this.theme.shadow : kind === "portal" ? this.theme.gold : this.theme.accent;
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

  private createModuleLandmark(level: PuzzleLevel, parent: TransformNode) {
    const material = this.material(`landmark-${level.module}`, this.theme.portal, 0.96);
    const position = new Vector3((level.module % 3 - 1) * 2.6, 0.45, -3.7 + (level.module % 4) * .45);
    const variant = level.module % 4;
    let landmark: Mesh;
    if (variant === 0) {
      landmark = MeshBuilder.CreateTorus(`landmark-${level.module}`, { diameter: 2.15, thickness: 0.22, tessellation: 24 }, this.scene);
      landmark.rotation.x = Math.PI / 2;
    } else if (variant === 1) {
      landmark = MeshBuilder.CreateCylinder(`landmark-${level.module}`, { height: 2.3, diameterTop: 0.2, diameterBottom: 1.45, tessellation: 5 }, this.scene);
      landmark.position.y = 1.15;
    } else if (variant === 2) {
      landmark = MeshBuilder.CreateBox(`landmark-${level.module}`, { width: 2.2, height: 1.8, depth: 0.32 }, this.scene);
      landmark.rotation.z = Math.PI / 8;
      landmark.position.y = 0.9;
    } else {
      landmark = MeshBuilder.CreateSphere(`landmark-${level.module}`, { diameter: 1.55, segments: 16 }, this.scene);
      landmark.position.y = 0.8;
    }
    landmark.parent = parent;
    landmark.position.x += position.x;
    landmark.position.y += position.y;
    landmark.position.z += position.z;
    landmark.material = material;
    this.created.push(landmark, material);
  }
}
