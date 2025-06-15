import type { Character, LevelUpReward } from "./types"

// Таблица опыта для уровней (стандарт D&D 5e)
export const EXPERIENCE_TABLE: { [level: number]: number } = {
  1: 0,
  2: 300,
  3: 900,
  4: 2700,
  5: 6500,
  6: 14000,
  7: 23000,
  8: 34000,
  9: 48000,
  10: 64000,
  11: 85000,
  12: 100000,
  13: 120000,
  14: 140000,
  15: 165000,
  16: 195000,
  17: 225000,
  18: 265000,
  19: 305000,
  20: 355000,
}

// Вычисление опыта для следующего уровня
export function getExperienceForNextLevel(level: number): number {
  return EXPERIENCE_TABLE[level + 1] || EXPERIENCE_TABLE[20]
}

// Проверка возможности повышения уровня
export function canLevelUp(character: Character): boolean {
  const nextLevelExp = getExperienceForNextLevel(character.level)
  return character.experience >= nextLevelExp && character.level < 20
}

// Повышение уровня персонажа
export function levelUpCharacter(character: Character): { character: Character; reward: LevelUpReward } {
  if (!canLevelUp(character)) {
    return { character, reward: { hpIncrease: 0, skillPoints: 0 } }
  }

  const newLevel = character.level + 1
  const hpIncrease = Math.floor(Math.random() * 8) + 1 + Math.floor((character.stats.CON - 10) / 2) // 1d8 + CON modifier
  const skillPoints = 2 + Math.floor((character.stats.INT - 10) / 2) // 2 + INT modifier

  const newAbilities = getNewAbilities(character.charClass, newLevel)

  const updatedCharacter: Character = {
    ...character,
    level: newLevel,
    maxHp: character.maxHp + hpIncrease,
    hp: character.hp + hpIncrease, // Полное лечение при повышении уровня
    skillPoints: character.skillPoints + skillPoints,
    experienceToNext: getExperienceForNextLevel(newLevel),
  }

  const reward: LevelUpReward = {
    hpIncrease,
    skillPoints,
    newAbilities,
  }

  return { character: updatedCharacter, reward }
}

// Получение новых способностей по классам
function getNewAbilities(charClass: string, level: number): string[] {
  const abilities: { [key: string]: { [level: number]: string[] } } = {
    Fighter: {
      2: ["Action Surge - дополнительное действие в бою"],
      3: ["Martial Archetype - выбор боевого стиля"],
      4: ["Ability Score Improvement - +2 к характеристикам"],
      5: ["Extra Attack - дополнительная атака"],
    },
    Wizard: {
      2: ["Arcane Recovery - восстановление слотов заклинаний"],
      3: ["Arcane Tradition - выбор школы магии"],
      4: ["Cantrip Improvement - улучшение заговоров"],
      5: ["3rd Level Spells - заклинания 3-го уровня"],
    },
    Rogue: {
      2: ["Cunning Action - хитрые действия"],
      3: ["Roguish Archetype - воровская специализация"],
      4: ["Ability Score Improvement - +2 к характеристикам"],
      5: ["Uncanny Dodge - уклонение от урона"],
    },
    Cleric: {
      2: ["Channel Divinity - божественная сила"],
      3: ["Divine Domain Feature - особенность домена"],
      4: ["Ability Score Improvement - +2 к характеристикам"],
      5: ["Destroy Undead - уничтожение нежити"],
    },
  }

  return abilities[charClass]?.[level] || []
}

// Вычисление модификатора характеристики
export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

// Вычисление бонуса мастерства
export function getProficiencyBonus(level: number): number {
  return Math.ceil(level / 4) + 1
}

// Проверка навыка с броском d20
export function rollSkillCheck(
  character: Character,
  skill: keyof Character["skills"],
  difficulty = 15,
): {
  roll: number
  total: number
  success: boolean
  modifier: number
} {
  const roll = Math.floor(Math.random() * 20) + 1
  const skillValue = character.skills[skill]
  const abilityScore = getSkillAbility(skill, character)
  const abilityModifier = getAbilityModifier(abilityScore)
  const proficiencyBonus = skillValue > 0 ? getProficiencyBonus(character.level) : 0

  const modifier = abilityModifier + proficiencyBonus
  const total = roll + modifier

  return {
    roll,
    total,
    success: total >= difficulty,
    modifier,
  }
}

// Получение связанной характеристики для навыка
function getSkillAbility(skill: keyof Character["skills"], character: Character): number {
  const skillAbilities = {
    athletics: character.stats.STR,
    stealth: character.stats.DEX,
    investigation: character.stats.INT,
    perception: character.stats.WIS,
    persuasion: character.stats.CHA,
    intimidation: character.stats.CHA,
    survival: character.stats.WIS,
    arcana: character.stats.INT,
  }

  return skillAbilities[skill]
}
