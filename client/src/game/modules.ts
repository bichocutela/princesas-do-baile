import type { PuzzleLevel } from "./types";

export const TOTAL_LEVELS = 170;
export const PHASES_PER_MODULE = 10;

export type ModuleDefinition = {
  id: number;
  act: PuzzleLevel["act"];
  title: string;
  subtitle: string;
  mechanic: "rotation" | "bridges" | "portals" | "shadows" | "compound";
  clue: string;
  companionState: "alone" | "companioned" | "lost";
};

export const MODULES: ModuleDefinition[] = [
  { id: 1, act: 1, title: "O Mapa que Respira", subtitle: "O primeiro olhar nunca é o verdadeiro.", mechanic: "rotation", clue: "Observe as marcas repetidas antes de girar.", companionState: "alone" },
  { id: 2, act: 1, title: "Terraços do Sussurro", subtitle: "A pedra muda quando ninguém tenta forçá-la.", mechanic: "rotation", clue: "A sombra curta aponta para a passagem longa.", companionState: "alone" },
  { id: 3, act: 1, title: "A Cidade de Cabeça Baixa", subtitle: "Algumas portas só existem no canto do olho.", mechanic: "rotation", clue: "Conte os arcos, mas não confie na ordem.", companionState: "alone" },
  { id: 4, act: 2, title: "Jardins da Maré", subtitle: "Toda ponte cobra uma escolha.", mechanic: "bridges", clue: "A alavanca não abre a ponte que parece pedir ajuda.", companionState: "alone" },
  { id: 5, act: 2, title: "As Sementes de Luz", subtitle: "O jardim cresce na direção da memória.", mechanic: "bridges", clue: "As flores acesas repetem a sequência certa.", companionState: "alone" },
  { id: 6, act: 2, title: "Pátio das Promessas", subtitle: "Uma rota pode ser segura e ainda assim errada.", mechanic: "bridges", clue: "A ponte mais bonita é a que deve esperar.", companionState: "alone" },
  { id: 7, act: 2, title: "A Última Maré", subtitle: "Quando a água sobe, o vazio vira mapa.", mechanic: "bridges", clue: "Escute o ritmo dos espaços entre as plataformas.", companionState: "alone" },
  { id: 8, act: 3, title: "Galerias do Reflexo", subtitle: "O longe pode ser o lado de dentro.", mechanic: "portals", clue: "Procure o arco que não lança sombra.", companionState: "alone" },
  { id: 9, act: 3, title: "O Companheiro do Arco", subtitle: "Duas pessoas podem olhar a mesma ruína de modos diferentes.", mechanic: "portals", clue: "A segunda silhueta conhece uma porta que Lina não vê.", companionState: "companioned" },
  { id: 10, act: 3, title: "Duas Luas", subtitle: "O caminho continua depois do desaparecimento.", mechanic: "portals", clue: "Deixe o companheiro cruzar primeiro; a saída não é simétrica.", companionState: "companioned" },
  { id: 11, act: 4, title: "Torres da Sombra", subtitle: "A luz revela, mas também apaga.", mechanic: "shadows", clue: "Acenda o que parece pequeno para mover o que parece imóvel.", companionState: "companioned" },
  { id: 12, act: 4, title: "A Lanterna de Íris", subtitle: "Uma companhia não é uma garantia.", mechanic: "shadows", clue: "A sombra sólida só existe enquanto a lembrança permanece acesa.", companionState: "companioned" },
  { id: 13, act: 4, title: "O Lugar onde Ele Sumiu", subtitle: "Há perdas que deixam uma forma no chão.", mechanic: "shadows", clue: "Siga a marca deixada por quem já não pode responder.", companionState: "lost" },
  { id: 14, act: 4, title: "Silêncio de Pedra", subtitle: "Lina aprende a caminhar sem a segunda voz.", mechanic: "shadows", clue: "O vazio entre duas lanternas é uma pista, não um erro.", companionState: "lost" },
  { id: 15, act: 5, title: "Salão sem Horizonte", subtitle: "Todas as regras escondem a mesma pergunta.", mechanic: "compound", clue: "Repita o gesto do início, mas em outra escala.", companionState: "lost" },
  { id: 16, act: 5, title: "O Baile das Ausências", subtitle: "Os monumentos guardam quem não voltou.", mechanic: "compound", clue: "Uma porta aberta pode ser uma armadilha de memória.", companionState: "lost" },
  { id: 17, act: 5, title: "A Sala que Escolhe", subtitle: "A cidade enfim olha de volta.", mechanic: "compound", clue: "O último convite não está no ponto mais alto.", companionState: "lost" },
];

export function getModule(moduleId: number): ModuleDefinition {
  return MODULES[Math.max(0, Math.min(MODULES.length - 1, moduleId - 1))] ?? MODULES[0];
}

export function getModuleForLevel(levelId: number): ModuleDefinition {
  return getModule(Math.ceil(levelId / PHASES_PER_MODULE));
}
