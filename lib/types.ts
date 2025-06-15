export interface Character {
  name: string
  charClass: string
  stats: {
    STR: number
    DEX: number
    CON: number
    INT: number
    WIS: number
    CHA: number
  }
  level: number
  experience: number
  experienceToNext: number
  hp: number
  maxHp: number
  gold: number
  skillPoints: number
  skills: CharacterSkills
}

export interface CharacterSkills {
  athletics: number // STR - лазание, плавание, прыжки
  stealth: number // DEX - скрытность
  investigation: number // INT - поиск улик
  perception: number // WIS - внимательность
  persuasion: number // CHA - убеждение
  intimidation: number // CHA - запугивание
  survival: number // WIS - выживание
  arcana: number // INT - знание магии
}

export interface GameSession {
  id: string
  character: Character
  inventory: InventoryItem[]
  quests: Quest[]
  visitedLocations: string[]
  currentLocation: string
  encounteredNPCs: NPC[]
  combatLog: CombatEvent[]
  history: Array<{
    type: "player" | "dm" | "roll" | "levelup" | "combat"
    content: string
    roll?: number
    timestamp: Date
  }>
  createdAt: Date
}

export interface ActionRequest {
  sessionId: string
  actionText: string
}

export interface ActionResponse {
  result: string
  roll: number
  newItems?: InventoryItem[]
  newQuests?: Quest[]
  questUpdates?: QuestUpdate[]
  locationChange?: string
  goldChange?: number
  hpChange?: number
  experienceGain?: number
  levelUp?: boolean
  newNPC?: NPC
  combatResult?: CombatResult
}

// Новые интерфейсы для системы уровней
export interface LevelUpReward {
  hpIncrease: number
  skillPoints: number
  newAbilities?: string[]
}

// NPC система
export interface NPC {
  id: string
  name: string
  race: string
  occupation: string
  personality: string[]
  appearance: string
  voice: string
  location: string
  relationship: "friendly" | "neutral" | "hostile" | "romantic"
  questGiver: boolean
  merchant: boolean
  stats?: {
    level: number
    hp: number
    ac: number
  }
  dialogue: NPCDialogue[]
  inventory?: InventoryItem[]
  createdAt: Date
}

export interface NPCDialogue {
  trigger: string
  response: string
  conditions?: string[]
}

// Боевая система
export interface CombatEvent {
  id: string
  type: "attack" | "defend" | "spell" | "item"
  attacker: string
  target: string
  damage?: number
  result: string
  timestamp: Date
}

export interface CombatResult {
  victory: boolean
  experienceGained: number
  goldGained: number
  itemsGained: InventoryItem[]
  damageTaken: number
}

// Существующие интерфейсы остаются без изменений
export interface InventoryItem {
  id: string
  name: string
  type: "weapon" | "armor" | "consumable" | "treasure" | "tool" | "misc"
  description: string
  quantity: number
  value: number
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary"
  weight: number
  stats?: {
    damage?: string
    armor?: number
    bonus?: string
  }
}

export interface Quest {
  id: string
  title: string
  description: string
  status: "active" | "completed" | "failed"
  objectives: QuestObjective[]
  reward?: {
    gold?: number
    items?: InventoryItem[]
    experience?: number
  }
  giver?: string
  location?: string
  createdAt: Date
  completedAt?: Date
}

export interface QuestObjective {
  id: string
  description: string
  completed: boolean
}

export interface QuestUpdate {
  questId: string
  objectiveId?: string
  newStatus?: "active" | "completed" | "failed"
  newObjective?: QuestObjective
}

export interface Location {
  id: string
  name: string
  description: string
  type: "town" | "dungeon" | "wilderness" | "landmark"
  connections: string[]
  discovered: boolean
  x: number
  y: number
}
