import { type NextRequest, NextResponse } from "next/server"
import type { Character, GameSession } from "@/lib/types"
import { createSession, generateSessionId } from "@/lib/sessions"
import { getRandomScenario } from "@/lib/scenarios"
import { STARTING_ITEMS, COMMON_STARTING_ITEMS, STARTING_QUESTS } from "@/lib/game-data"
import { getExperienceForNextLevel } from "@/lib/level-system"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, charClass, stats } = body

    // Валидация входных данных
    if (!name || !charClass || !stats) {
      return NextResponse.json({ error: "Отсутствуют обязательные поля" }, { status: 400 })
    }

    const conModifier = Math.floor((Number.parseInt(stats.CON) - 10) / 2)
    const baseHp = 10 + conModifier

    // Создание персонажа с расширенными характеристиками
    const character: Character = {
      name,
      charClass,
      stats: {
        STR: Number.parseInt(stats.STR) || 8,
        DEX: Number.parseInt(stats.DEX) || 8,
        CON: Number.parseInt(stats.CON) || 8,
        INT: Number.parseInt(stats.INT) || 8,
        WIS: Number.parseInt(stats.WIS) || 8,
        CHA: Number.parseInt(stats.CHA) || 8,
      },
      level: 1,
      experience: 0,
      experienceToNext: getExperienceForNextLevel(1),
      hp: baseHp,
      maxHp: baseHp,
      gold: 100,
      skillPoints: 2,
      skills: {
        athletics: 0,
        stealth: 0,
        investigation: 0,
        perception: 0,
        persuasion: 0,
        intimidation: 0,
        survival: 0,
        arcana: 0,
      },
    }

    // Получаем случайный начальный сценарий
    const scenario = getRandomScenario()

    // Создаем стартовый инвентарь
    const classItems = STARTING_ITEMS[charClass] || []
    const startingInventory = [...classItems, ...COMMON_STARTING_ITEMS]

    // Создание сессии с новыми данными
    const sessionId = generateSessionId()
    const session: GameSession = {
      id: sessionId,
      character,
      inventory: startingInventory,
      quests: [...STARTING_QUESTS],
      visitedLocations: ["goldenheart-tavern"],
      currentLocation: "goldenheart-tavern",
      encounteredNPCs: [],
      combatLog: [],
      history: [
        {
          type: "dm",
          content: scenario.message,
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
    }

    createSession(session)

    return NextResponse.json({
      sessionId,
      message: `Персонаж ${character.name} создан! Приключение "${scenario.name}" начинается...`,
    })
  } catch (error) {
    console.error("Error creating session:", error)
    return NextResponse.json({ error: "Ошибка создания сессии" }, { status: 500 })
  }
}
