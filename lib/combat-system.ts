import type { Character, NPC, CombatResult, CombatEvent, InventoryItem } from "./types"
import { getAbilityModifier, getProficiencyBonus } from "./level-system"

// Генерация боевого столкновения
export function generateCombatEncounter(character: Character, location: string): NPC {
  const enemies = [
    {
      name: "Гоблин-разбойник",
      race: "Гоблин",
      level: 1,
      hp: 7,
      ac: 15,
      damage: "1d6+2",
      experience: 50,
    },
    {
      name: "Орк-воин",
      race: "Орк",
      level: 2,
      hp: 15,
      ac: 13,
      damage: "1d12+3",
      experience: 100,
    },
    {
      name: "Скелет-страж",
      race: "Нежить",
      level: 1,
      hp: 13,
      ac: 13,
      damage: "1d6+2",
      experience: 50,
    },
    {
      name: "Дикий волк",
      race: "Зверь",
      level: 1,
      hp: 11,
      ac: 12,
      damage: "2d4+2",
      experience: 25,
    },
    {
      name: "Бандит",
      race: "Человек",
      level: 1,
      hp: 11,
      ac: 12,
      damage: "1d6+1",
      experience: 25,
    },
  ]

  const enemy = enemies[Math.floor(Math.random() * enemies.length)]

  return {
    id: `enemy-${Date.now()}`,
    name: enemy.name,
    race: enemy.race,
    occupation: "Враг",
    personality: ["агрессивный", "враждебный"],
    appearance: `${enemy.race}, готов к бою`,
    voice: "villain",
    location,
    relationship: "hostile",
    questGiver: false,
    merchant: false,
    stats: {
      level: enemy.level,
      hp: enemy.hp,
      ac: enemy.ac,
    },
    dialogue: [
      {
        trigger: "combat",
        response: "Готовься к бою!",
        conditions: [],
      },
    ],
    createdAt: new Date(),
  }
}

// Проведение боя
export function resolveCombat(character: Character, enemy: NPC): CombatResult {
  const combatLog: CombatEvent[] = []
  let playerHp = character.hp
  let enemyHp = enemy.stats?.hp || 10
  let round = 1

  while (playerHp > 0 && enemyHp > 0 && round <= 10) {
    // Ход игрока
    const playerAttack = rollAttack(character, enemy.stats?.ac || 10)
    if (playerAttack.hit) {
      const damage = rollDamage("1d8", getAbilityModifier(character.stats.STR))
      enemyHp -= damage
      combatLog.push({
        id: `combat-${Date.now()}-${round}-player`,
        type: "attack",
        attacker: character.name,
        target: enemy.name,
        damage,
        result: `${character.name} наносит ${damage} урона!`,
        timestamp: new Date(),
      })
    } else {
      combatLog.push({
        id: `combat-${Date.now()}-${round}-player-miss`,
        type: "attack",
        attacker: character.name,
        target: enemy.name,
        damage: 0,
        result: `${character.name} промахивается!`,
        timestamp: new Date(),
      })
    }

    if (enemyHp <= 0) break

    // Ход врага
    const enemyAttack = rollAttack(enemy, 10 + getAbilityModifier(character.stats.DEX)) // Базовый AC игрока
    if (enemyAttack.hit) {
      const damage = rollDamage("1d6", 2)
      playerHp -= damage
      combatLog.push({
        id: `combat-${Date.now()}-${round}-enemy`,
        type: "attack",
        attacker: enemy.name,
        target: character.name,
        damage,
        result: `${enemy.name} наносит ${damage} урона!`,
        timestamp: new Date(),
      })
    } else {
      combatLog.push({
        id: `combat-${Date.now()}-${round}-enemy-miss`,
        type: "attack",
        attacker: enemy.name,
        target: character.name,
        damage: 0,
        result: `${enemy.name} промахивается!`,
        timestamp: new Date(),
      })
    }

    round++
  }

  const victory = enemyHp <= 0
  const experienceGained = victory ? (enemy.stats?.level || 1) * 50 : 0
  const goldGained = victory ? Math.floor(Math.random() * 20) + 5 : 0
  const itemsGained = victory ? generateLoot() : []
  const damageTaken = character.hp - playerHp

  return {
    victory,
    experienceGained,
    goldGained,
    itemsGained,
    damageTaken,
  }
}

// Бросок атаки
function rollAttack(attacker: Character | NPC, targetAC: number): { hit: boolean; roll: number; total: number } {
  const roll = Math.floor(Math.random() * 20) + 1
  let attackBonus = 0

  if ("stats" in attacker && attacker.stats) {
    // Для персонажа игрока
    attackBonus = getAbilityModifier(attacker.stats.STR) + getProficiencyBonus(attacker.level)
  } else {
    // Для NPC
    attackBonus = Math.floor((attacker.stats?.level || 1) / 2) + 2
  }

  const total = roll + attackBonus

  return {
    hit: total >= targetAC,
    roll,
    total,
  }
}

// Бросок урона
function rollDamage(diceString: string, modifier = 0): number {
  // Простая реализация для "1d8", "2d6" и т.д.
  const match = diceString.match(/(\d+)d(\d+)/)
  if (!match) return 1 + modifier

  const numDice = Number.parseInt(match[1])
  const diceSize = Number.parseInt(match[2])

  let total = 0
  for (let i = 0; i < numDice; i++) {
    total += Math.floor(Math.random() * diceSize) + 1
  }

  return Math.max(1, total + modifier)
}

// Генерация добычи после боя
function generateLoot(): InventoryItem[] {
  const lootTable = [
    {
      name: "Медные монеты",
      type: "treasure" as const,
      description: "Несколько медных монет",
      value: 5,
      rarity: "common" as const,
      weight: 0.1,
    },
    {
      name: "Зелье лечения",
      type: "consumable" as const,
      description: "Восстанавливает здоровье",
      value: 50,
      rarity: "common" as const,
      weight: 0.5,
    },
    {
      name: "Ржавый кинжал",
      type: "weapon" as const,
      description: "Старый, но еще острый кинжал",
      value: 8,
      rarity: "common" as const,
      weight: 1,
      stats: { damage: "1d4" },
    },
  ]

  const loot: InventoryItem[] = []
  const numItems = Math.floor(Math.random() * 3) // 0-2 предмета

  for (let i = 0; i < numItems; i++) {
    const item = lootTable[Math.floor(Math.random() * lootTable.length)]
    loot.push({
      ...item,
      id: `loot-${Date.now()}-${i}`,
      quantity: 1,
    })
  }

  return loot
}
