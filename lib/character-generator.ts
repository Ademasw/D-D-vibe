export interface CharacterStats {
  STR: number
  DEX: number
  CON: number
  INT: number
  WIS: number
  CHA: number
}

// Full stat names in English
export const STAT_NAMES: { [key: string]: string } = {
  STR: "Strength",
  DEX: "Dexterity",
  CON: "Constitution",
  INT: "Intelligence",
  WIS: "Wisdom",
  CHA: "Charisma",
}

// Stat descriptions
export const STAT_DESCRIPTIONS: { [key: string]: string } = {
  STR: "Physical power, affects melee attacks and carrying capacity",
  DEX: "Agility and reflexes, affects AC, initiative, and ranged attacks",
  CON: "Health and stamina, affects hit points and fortitude saves",
  INT: "Reasoning ability, affects skill points and knowledge",
  WIS: "Awareness and insight, affects perception and will saves",
  CHA: "Force of personality, affects social interactions and leadership",
}

// Base stats for each class (balanced)
export const CLASS_BASE_STATS: { [key: string]: CharacterStats } = {
  Fighter: {
    STR: 15, // Primary stat
    DEX: 12, // Secondary for AC
    CON: 14, // Important for HP
    INT: 8, // Not critical
    WIS: 10, // Base value
    CHA: 9, // Not critical
  },
  Wizard: {
    STR: 8, // Not needed
    DEX: 12, // For AC and initiative
    CON: 13, // For survivability
    INT: 15, // Primary stat
    WIS: 11, // For perception
    CHA: 9, // Not critical
  },
  Rogue: {
    STR: 9, // Not primary
    DEX: 15, // Primary stat
    CON: 12, // For HP
    INT: 11, // For skills
    WIS: 13, // For perception
    CHA: 8, // Not critical
  },
  Cleric: {
    STR: 10, // Base
    DEX: 9, // Not critical
    CON: 13, // For survivability
    INT: 8, // Not needed
    WIS: 15, // Primary stat
    CHA: 12, // For some spells
  },
  Ranger: {
    STR: 11, // For weapons
    DEX: 14, // Primary stat
    CON: 12, // For HP
    INT: 9, // Not critical
    WIS: 13, // Secondary stat
    CHA: 8, // Not needed
  },
  Barbarian: {
    STR: 15, // Primary stat
    DEX: 11, // Base
    CON: 14, // Very important
    INT: 8, // Not needed
    WIS: 10, // Base
    CHA: 9, // Not critical
  },
  Bard: {
    STR: 8, // Not needed
    DEX: 12, // For AC
    CON: 11, // Base
    INT: 10, // For knowledge
    WIS: 9, // Not critical
    CHA: 15, // Primary stat
  },
  Paladin: {
    STR: 14, // Primary stat
    DEX: 9, // Not critical
    CON: 13, // For HP
    INT: 8, // Not needed
    WIS: 10, // Base
    CHA: 13, // Secondary stat
  },
}

// Generate balanced stats (4d6, drop lowest)
export function generateBalancedStats(): CharacterStats {
  const rollStat = (): number => {
    const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1)
    rolls.sort((a, b) => b - a)
    return rolls.slice(0, 3).reduce((sum, roll) => sum + roll, 0)
  }

  return {
    STR: rollStat(),
    DEX: rollStat(),
    CON: rollStat(),
    INT: rollStat(),
    WIS: rollStat(),
    CHA: rollStat(),
  }
}

// Point Buy system - now 11 points
export function getPointBuyStats(): CharacterStats {
  return {
    STR: 8,
    DEX: 8,
    CON: 8,
    INT: 8,
    WIS: 8,
    CHA: 8,
  }
}

// Calculate point cost for Point Buy system
export function getStatCost(value: number): number {
  const costs: { [key: number]: number } = {
    8: 0, // Base value
    9: 1, // +1 point
    10: 2, // +2 points
    11: 3, // +3 points
    12: 4, // +4 points
    13: 5, // +5 points
    14: 7, // +7 points (more expensive)
    15: 9, // +9 points (very expensive)
  }
  return costs[value] || 0
}

// Calculate total point cost
export function getTotalPointCost(stats: CharacterStats): number {
  return Object.values(stats).reduce((total, stat) => total + getStatCost(stat), 0)
}

// Get base stats for class
export function getClassBaseStats(charClass: string): CharacterStats {
  return CLASS_BASE_STATS[charClass] || CLASS_BASE_STATS.Fighter
}

// Maximum points for distribution (changed from 27 to 11)
export const MAX_POINT_BUY_POINTS = 11
export const MIN_STAT_VALUE = 8
export const MAX_STAT_VALUE = 15

export function getClassDescription(charClass: string): string {
  const descriptions = {
    Fighter:
      "A master of martial combat, skilled with a variety of weapons and armor. Fighters excel in direct combat and can withstand heavy damage.",
    Wizard:
      "A scholarly magic-user capable of manipulating the structures of spells. Wizards have access to the most diverse selection of spells.",
    Rogue:
      "A scoundrel who uses stealth and trickery to achieve goals. Rogues excel at skills, sneak attacks, and avoiding danger.",
    Cleric:
      "A priestly champion who wields divine magic in service of a higher power. Clerics can heal allies and turn undead.",
    Ranger:
      "A warrior of the wilderness, skilled in tracking, survival, and combat. Rangers are excellent scouts and archers.",
    Barbarian:
      "A fierce warrior of primitive background who can enter a battle rage. Barbarians are tough and deal massive damage.",
    Bard: "A master of song, speech, and the magic they contain. Bards are versatile supporters with many skills and spells.",
    Paladin:
      "A holy warrior bound to a sacred oath. Paladins combine martial prowess with divine magic and strong moral convictions.",
  }
  return descriptions[charClass] || "Unknown class"
}

export function getClassRecommendations(charClass: string) {
  const recommendations = {
    Fighter: { primary: ["STR", "CON"], secondary: ["DEX"], dump: ["INT", "CHA"] },
    Wizard: { primary: ["INT"], secondary: ["DEX", "CON"], dump: ["STR", "CHA"] },
    Rogue: { primary: ["DEX"], secondary: ["INT", "CHA"], dump: ["STR", "WIS"] },
    Cleric: { primary: ["WIS"], secondary: ["CON", "STR"], dump: ["INT", "CHA"] },
    Ranger: { primary: ["DEX", "WIS"], secondary: ["CON"], dump: ["INT", "CHA"] },
    Barbarian: { primary: ["STR", "CON"], secondary: ["DEX"], dump: ["INT", "WIS"] },
    Bard: { primary: ["CHA"], secondary: ["DEX", "CON"], dump: ["STR", "WIS"] },
    Paladin: { primary: ["STR", "CHA"], secondary: ["CON"], dump: ["INT", "WIS"] },
  }
  return recommendations[charClass] || { primary: [], secondary: [], dump: [] }
}
