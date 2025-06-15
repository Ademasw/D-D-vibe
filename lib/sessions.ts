import type { GameSession } from "./types"

// Глобальное хранилище сессий в памяти
const sessions = new Map<string, GameSession>()

export function createSession(session: GameSession): void {
  console.log("Creating session:", session.id)
  sessions.set(session.id, session)
}

export function getSession(sessionId: string): GameSession | undefined {
  const session = sessions.get(sessionId)
  console.log("Getting session:", sessionId, "found:", !!session)
  return session
}

export function updateSession(sessionId: string, session: GameSession): void {
  console.log("Updating session:", sessionId)
  sessions.set(sessionId, session)
}

export function generateSessionId(): string {
  const id = Math.random().toString(36).substring(2) + Date.now().toString(36)
  console.log("Generated session ID:", id)
  return id
}

// Функция для броска d20
export function rollD20(): number {
  const roll = Math.floor(Math.random() * 20) + 1
  console.log("Rolled d20:", roll)
  return roll
}

// Создаем тестовую сессию для отладки
export function createTestSession(): string {
  const testSessionId = "test-session-" + Date.now()
  const testSession: GameSession = {
    id: testSessionId,
    character: {
      name: "Тестовый Герой",
      charClass: "Fighter",
      stats: {
        STR: 15,
        DEX: 12,
        CON: 14,
        INT: 10,
        WIS: 13,
        CHA: 11,
      },
      level: 1,
      experience: 0,
      experienceToNext: 300,
      hp: 12,
      maxHp: 12,
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
    },
    inventory: [],
    quests: [],
    visitedLocations: ["goldenheart-tavern"],
    currentLocation: "goldenheart-tavern",
    encounteredNPCs: [],
    combatLog: [],
    history: [
      {
        type: "dm",
        content: "Ты стоишь у входа в древнее подземелье. Каменная арка покрыта мхом, а из темноты веет холодом.",
        timestamp: new Date(),
      },
    ],
    createdAt: new Date(),
  }

  createSession(testSession)
  console.log("Created test session:", testSessionId)
  return testSessionId
}
