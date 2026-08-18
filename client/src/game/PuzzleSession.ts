import { getLevel } from "./levels";
import { completeLevel, loadProgress, saveProgress } from "./progress";
import type { GameSnapshot, LocalProgress, PuzzleLevel, PuzzlePath, Rotation } from "./types";

const asRotation = (value: number): Rotation => ((value % 4 + 4) % 4) as Rotation;

export class PuzzleSession {
  private progress: LocalProgress;
  private currentNodeId: string;
  private rotation: Rotation;
  private switchOn = false;
  private lightOn = false;
  private completed = false;
  private message = "O baile ainda espera. Procure uma passagem que faça sentido de outro ângulo.";
  level: PuzzleLevel;

  constructor(levelId = 1, allowPreview = false) {
    this.progress = loadProgress();
    this.level = getLevel(allowPreview ? levelId : Math.min(levelId, this.progress.highestUnlocked));
    this.currentNodeId = this.level.startNodeId;
    this.rotation = this.level.initialRotation;
  }

  snapshot(): GameSnapshot {
    return {
      level: this.level,
      currentNodeId: this.currentNodeId,
      rotation: this.rotation,
      switchOn: this.switchOn,
      lightOn: this.lightOn,
      completed: this.completed,
      highestUnlocked: this.progress.highestUnlocked,
      completedLevelIds: this.progress.completedLevelIds,
      message: this.message,
      companionState: this.level.companionState,
      companionName: "Íris",
    };
  }

  loadLevel(levelId: number) {
    const safeLevel = Math.min(Math.max(1, levelId), this.progress.highestUnlocked);
    this.level = getLevel(safeLevel);
    this.currentNodeId = this.level.startNodeId;
    this.rotation = this.level.initialRotation;
    this.switchOn = false;
    this.lightOn = false;
    this.completed = false;
    this.message = `${this.level.objective} Clique em um nó iluminado ou use as setas para descobrir a rota.`;
    this.progress = saveProgress({ ...this.progress, lastPlayedLevelId: safeLevel });
  }

  rotate(direction: -1 | 1) {
    if (this.completed) {
      this.message = "O convite já foi encontrado. Escolha a próxima fase ou prossiga.";
      return;
    }
    this.rotation = asRotation(this.rotation + direction);
    this.message = "A arquitetura mudou de conversa. Observe as pontes douradas.";
  }

  restart() {
    this.currentNodeId = this.level.startNodeId;
    this.rotation = this.level.initialRotation;
    this.switchOn = false;
    this.lightOn = false;
    this.completed = false;
    this.message = "A fase voltou ao primeiro gesto. Não há punição por recomeçar.";
  }

  private isPathOpen(path: PuzzlePath) {
    return path.visibleAt.includes(this.rotation) && (!path.requiresSwitch || this.switchOn) && (!path.requiresLight || this.lightOn);
  }

  getOpenPaths() {
    return this.level.paths.filter(
      (path) => this.isPathOpen(path) && (path.from === this.currentNodeId || path.to === this.currentNodeId),
    );
  }

  moveFirstAvailable() {
    const paths = this.getOpenPaths();
    const goalPath = paths.find((path) => path.from === this.level.goalNodeId || path.to === this.level.goalNodeId);
    const path = goalPath ?? paths[0];
    if (!path) {
      this.message = "Nenhuma passagem se alinha daqui. Gire o monumento e tente de novo.";
      return;
    }
    this.moveTo(path.from === this.currentNodeId ? path.to : path.from);
  }

  moveTo(nodeId: string) {
    if (this.completed || nodeId === this.currentNodeId) return;
    const path = this.getOpenPaths().find((candidate) => candidate.from === nodeId || candidate.to === nodeId);
    if (!path) {
      this.message = "Esse nó ainda não conversa com a sua passarela. Tente outro ângulo.";
      return;
    }

    this.currentNodeId = nodeId;
    const node = this.level.nodes.find((candidate) => candidate.id === nodeId);

    if (node?.kind === "switch") {
      this.switchOn = true;
      this.lightOn = true;
      this.message = `${node.label ?? "A lanterna"} foi ativada. As sombras sólidas agora podem sustentar a passagem.`;
      return;
    }

    if (node?.kind === "portal") {
      const exitId = node.portalTargetId;
      if (exitId) {
        this.currentNodeId = exitId;
        this.message = "O espelho trocou o alto pelo longe. Lina atravessou o arco e surgiu em outra face do monumento.";
      } else {
        this.message = "O arco de espelho ainda procura sua outra face.";
      }
      return;
    }

    if (nodeId === this.level.goalNodeId) {
      this.completed = true;
      this.progress = saveProgress(completeLevel(this.progress, this.level.id));
      this.message = "Convite encontrado. O próximo monumento já se inclina em direção ao baile.";
      return;
    }

    this.message = "Lina encontrou um novo patamar. A próxima ponte pode estar em outra face.";
  }

  goToNextLevel() {
    this.loadLevel(Math.min(170, this.level.id + 1));
  }
}
