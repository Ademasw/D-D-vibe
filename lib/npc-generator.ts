import type { NPC, InventoryItem } from "./types"

// Расы для NPC
const NPC_RACES = [
  "Человек",
  "Эльф",
  "Дворф",
  "Полурослик",
  "Драконорожденный",
  "Гном",
  "Полуэльф",
  "Полуорк",
  "Тифлинг",
  "Аасимар",
]

// Профессии
const NPC_OCCUPATIONS = [
  "Торговец",
  "Кузнец",
  "Трактирщик",
  "Стражник",
  "Фермер",
  "Жрец",
  "Маг",
  "Бард",
  "Охотник",
  "Рыбак",
  "Пекарь",
  "Портной",
  "Алхимик",
  "Писарь",
  "Солдат",
  "Вор",
  "Наемник",
]

// Черты характера
const PERSONALITY_TRAITS = [
  "дружелюбный",
  "подозрительный",
  "жадный",
  "щедрый",
  "любопытный",
  "скрытный",
  "болтливый",
  "молчаливый",
  "храбрый",
  "трусливый",
  "честный",
  "лживый",
  "веселый",
  "угрюмый",
  "мудрый",
  "глупый",
  "терпеливый",
  "вспыльчивый",
  "добрый",
  "злой",
]

// Внешность
const APPEARANCE_FEATURES = [
  "высокий",
  "низкий",
  "худой",
  "полный",
  "мускулистый",
  "хрупкий",
  "с бородой",
  "лысый",
  "с длинными волосами",
  "с короткими волосами",
  "с шрамом",
  "с татуировкой",
  "в очках",
  "с тростью",
  "элегантный",
  "неряшливый",
]

// Голоса (используем существующую систему)
const VOICE_TYPES = [
  "noble",
  "merchant",
  "guard",
  "peasant",
  "scholar",
  "rogue",
  "priest",
  "barbarian",
  "child",
  "elder",
  "innkeeper",
  "villain",
]

// Генерация случайного NPC
export function generateRandomNPC(location: string): NPC {
  const id = `npc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  const name = generateNPCName()
  const race = NPC_RACES[Math.floor(Math.random() * NPC_RACES.length)]
  const occupation = NPC_OCCUPATIONS[Math.floor(Math.random() * NPC_OCCUPATIONS.length)]

  // Генерируем 2-3 черты характера
  const personalityCount = Math.floor(Math.random() * 2) + 2
  const personality = []
  for (let i = 0; i < personalityCount; i++) {
    const trait = PERSONALITY_TRAITS[Math.floor(Math.random() * PERSONALITY_TRAITS.length)]
    if (!personality.includes(trait)) {
      personality.push(trait)
    }
  }

  // Генерируем внешность
  const appearanceCount = Math.floor(Math.random() * 3) + 2
  const appearanceFeatures = []
  for (let i = 0; i < appearanceCount; i++) {
    const feature = APPEARANCE_FEATURES[Math.floor(Math.random() * APPEARANCE_FEATURES.length)]
    if (!appearanceFeatures.includes(feature)) {
      appearanceFeatures.push(feature)
    }
  }

  const appearance = `${race}, ${appearanceFeatures.join(", ")}`
  const voice = VOICE_TYPES[Math.floor(Math.random() * VOICE_TYPES.length)]

  // Определяем отношение
  const relationshipRoll = Math.random()
  let relationship: "friendly" | "neutral" | "hostile" | "romantic"
  if (relationshipRoll < 0.4) relationship = "friendly"
  else if (relationshipRoll < 0.8) relationship = "neutral"
  else if (relationshipRoll < 0.95) relationship = "hostile"
  else relationship = "romantic"

  // Определяем роли
  const questGiver = Math.random() < 0.3 // 30% шанс быть квестодателем
  const merchant = occupation === "Торговец" || Math.random() < 0.2 // 20% шанс быть торговцем

  // Генерируем статы для потенциального боя
  const level = Math.floor(Math.random() * 5) + 1
  const stats = {
    level,
    hp: Math.floor(Math.random() * 20) + level * 5,
    ac: Math.floor(Math.random() * 5) + 10,
  }

  // Генерируем диалоги
  const dialogue = generateNPCDialogue(personality, occupation, voice)

  // Генерируем инвентарь для торговцев
  const inventory = merchant ? generateMerchantInventory() : undefined

  return {
    id,
    name,
    race,
    occupation,
    personality,
    appearance,
    voice,
    location,
    relationship,
    questGiver,
    merchant,
    stats,
    dialogue,
    inventory,
    createdAt: new Date(),
  }
}

// Генерация имени NPC
function generateNPCName(): string {
  const firstNames = [
    "Алексей",
    "Борис",
    "Владимир",
    "Григорий",
    "Дмитрий",
    "Евгений",
    "Анна",
    "Елена",
    "Ирина",
    "Мария",
    "Наталья",
    "Ольга",
    "Эльдар",
    "Торин",
    "Гимли",
    "Леголас",
    "Арагорн",
    "Гэндальф",
    "Арвен",
    "Галадриэль",
    "Эовин",
    "Тауриэль",
  ]

  const lastNames = [
    "Кузнецов",
    "Петров",
    "Сидоров",
    "Иванов",
    "Смирнов",
    "Железнобород",
    "Златокрыл",
    "Светлый",
    "Темный",
    "Мудрый",
    "Быстрый",
    "Сильный",
    "Храбрый",
    "Хитрый",
    "Добрый",
  ]

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]

  return `${firstName} ${lastName}`
}

// Генерация диалогов NPC
function generateNPCDialogue(personality: string[], occupation: string, voice: string): any[] {
  const dialogues = []

  // Приветствие
  if (personality.includes("дружелюбный")) {
    dialogues.push({
      trigger: "greeting",
      response: "Приветствую тебя, путник! Как дела?",
      conditions: [],
    })
  } else if (personality.includes("подозрительный")) {
    dialogues.push({
      trigger: "greeting",
      response: "Что тебе нужно, чужак?",
      conditions: [],
    })
  } else {
    dialogues.push({
      trigger: "greeting",
      response: "Здравствуй.",
      conditions: [],
    })
  }

  // Диалоги по профессии
  if (occupation === "Торговец") {
    dialogues.push({
      trigger: "trade",
      response: "У меня отличные товары! Хочешь посмотреть?",
      conditions: [],
    })
  } else if (occupation === "Стражник") {
    dialogues.push({
      trigger: "law",
      response: "Порядок должен соблюдаться. Никаких нарушений!",
      conditions: [],
    })
  }

  return dialogues
}

// Генерация инвентаря торговца
function generateMerchantInventory(): InventoryItem[] {
  const items: InventoryItem[] = []
  const itemCount = Math.floor(Math.random() * 8) + 3 // 3-10 предметов

  const merchantItems = [
    {
      name: "Железный меч",
      type: "weapon" as const,
      description: "Качественный железный меч",
      value: 25,
      rarity: "common" as const,
      weight: 3,
      stats: { damage: "1d8+1" },
    },
    {
      name: "Кожаная броня",
      type: "armor" as const,
      description: "Прочная кожаная броня",
      value: 20,
      rarity: "common" as const,
      weight: 10,
      stats: { armor: 2 },
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
      name: "Веревка",
      type: "tool" as const,
      description: "Прочная пеньковая веревка",
      value: 2,
      rarity: "common" as const,
      weight: 10,
    },
    {
      name: "Факел",
      type: "tool" as const,
      description: "Освещает темноту",
      value: 1,
      rarity: "common" as const,
      weight: 1,
    },
  ]

  for (let i = 0; i < itemCount; i++) {
    const baseItem = merchantItems[Math.floor(Math.random() * merchantItems.length)]
    const item: InventoryItem = {
      ...baseItem,
      id: `merchant-item-${Date.now()}-${i}`,
      quantity: Math.floor(Math.random() * 3) + 1,
    }
    items.push(item)
  }

  return items
}

// Генерация NPC по контексту
export function generateContextualNPC(context: string, location: string): NPC {
  const lowerContext = context.toLowerCase()

  // Определяем тип NPC по контексту
  let occupation = "Крестьянин"
  let voice = "peasant"
  let personality = ["дружелюбный"]

  if (lowerContext.includes("торгов") || lowerContext.includes("купец")) {
    occupation = "Торговец"
    voice = "merchant"
    personality = ["жадный", "болтливый"]
  } else if (lowerContext.includes("страж") || lowerContext.includes("солдат")) {
    occupation = "Стражник"
    voice = "guard"
    personality = ["строгий", "честный"]
  } else if (lowerContext.includes("жрец") || lowerContext.includes("священ")) {
    occupation = "Жрец"
    voice = "priest"
    personality = ["мудрый", "добрый"]
  } else if (lowerContext.includes("маг") || lowerContext.includes("волшебн")) {
    occupation = "Маг"
    voice = "scholar"
    personality = ["любопытный", "мудрый"]
  }

  // Генерируем базового NPC и модифицируем
  const npc = generateRandomNPC(location)
  npc.occupation = occupation
  npc.voice = voice
  npc.personality = personality
  npc.merchant = occupation === "Торговец"
  npc.questGiver = Math.random() < 0.5

  return npc
}
