export interface CharacterStats {
  STR: number
  DEX: number
  CON: number
  INT: number
  WIS: number
  CHA: number
}

// Полные названия статов на русском
export const STAT_NAMES: { [key: string]: string } = {
  STR: "Сила",
  DEX: "Ловкость",
  CON: "Телосложение",
  INT: "Интеллект",
  WIS: "Мудрость",
  CHA: "Харизма",
}

// Описания статов
export const STAT_DESCRIPTIONS: { [key: string]: string } = {
  STR: "Физическая сила, влияет на урон в ближнем бою и подъем тяжестей",
  DEX: "Ловкость и скорость, влияет на класс доспеха и дальние атаки",
  CON: "Выносливость и здоровье, влияет на количество очков жизни",
  INT: "Интеллект и знания, влияет на заклинания волшебников",
  WIS: "Мудрость и интуиция, влияет на восприятие и заклинания жрецов",
  CHA: "Харизма и сила личности, влияет на социальные взаимодействия",
}

// Базовые статы для каждого класса (сбалансированные)
export const CLASS_BASE_STATS: { [key: string]: CharacterStats } = {
  Fighter: {
    STR: 15, // Основная характеристика
    DEX: 12, // Вторичная для AC
    CON: 14, // Важно для HP
    INT: 8, // Не критично
    WIS: 10, // Базовое значение
    CHA: 9, // Не критично
  },
  Wizard: {
    STR: 8, // Не нужна
    DEX: 12, // Для AC и инициативы
    CON: 13, // Для выживаемости
    INT: 15, // Основная характеристика
    WIS: 11, // Для восприятия
    CHA: 9, // Не критично
  },
  Rogue: {
    STR: 9, // Не основная
    DEX: 15, // Основная характеристика
    CON: 12, // Для HP
    INT: 11, // Для навыков
    WIS: 13, // Для восприятия
    CHA: 8, // Не критично
  },
  Cleric: {
    STR: 10, // Базовое
    DEX: 9, // Не критично
    CON: 13, // Для выживаемости
    INT: 8, // Не нужен
    WIS: 15, // Основная характеристика
    CHA: 12, // Для некоторых заклинаний
  },
  Ranger: {
    STR: 11, // Для оружия
    DEX: 14, // Основная характеристика
    CON: 12, // Для HP
    INT: 9, // Не критично
    WIS: 13, // Вторичная характеристика
    CHA: 8, // Не нужна
  },
  Barbarian: {
    STR: 15, // Основная характеристика
    DEX: 11, // Базовое
    CON: 14, // Очень важно
    INT: 8, // Не нужен
    WIS: 10, // Базовое
    CHA: 9, // Не критично
  },
  Bard: {
    STR: 8, // Не нужна
    DEX: 12, // Для AC
    CON: 11, // Базовое
    INT: 10, // Для знаний
    WIS: 9, // Не критично
    CHA: 15, // Основная характеристика
  },
  Paladin: {
    STR: 14, // Основная характеристика
    DEX: 9, // Не критично
    CON: 13, // Для HP
    INT: 8, // Не нужен
    WIS: 10, // Базовое
    CHA: 13, // Вторичная характеристика
  },
}

// Генерация сбалансированных статов (4d6, убираем наименьший)
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

// Система распределения очков (Point Buy) - теперь 11 очков
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

// Подсчет стоимости очков для Point Buy системы (изменена таблица)
export function getStatCost(value: number): number {
  const costs: { [key: number]: number } = {
    8: 0, // Базовое значение
    9: 1, // +1 очко
    10: 2, // +2 очка
    11: 3, // +3 очка
    12: 4, // +4 очка
    13: 5, // +5 очков
    14: 7, // +7 очков (дороже)
    15: 9, // +9 очков (очень дорого)
  }
  return costs[value] || 0
}

// Подсчет общей стоимости статов
export function getTotalPointCost(stats: CharacterStats): number {
  return Object.values(stats).reduce((total, stat) => total + getStatCost(stat), 0)
}

// Получение базовых статов для класса
export function getClassBaseStats(charClass: string): CharacterStats {
  return CLASS_BASE_STATS[charClass] || CLASS_BASE_STATS.Fighter
}

// Получение рекомендованных статов для класса (для отображения)
export function getClassRecommendations(charClass: string): {
  primary: string[]
  secondary: string[]
  dump: string[]
} {
  const recommendations: { [key: string]: { primary: string[]; secondary: string[]; dump: string[] } } = {
    Fighter: {
      primary: ["STR", "CON"],
      secondary: ["DEX"],
      dump: ["INT", "CHA"],
    },
    Wizard: {
      primary: ["INT"],
      secondary: ["DEX", "CON"],
      dump: ["STR", "CHA"],
    },
    Rogue: {
      primary: ["DEX"],
      secondary: ["WIS", "INT"],
      dump: ["STR", "CHA"],
    },
    Cleric: {
      primary: ["WIS"],
      secondary: ["CON", "CHA"],
      dump: ["INT", "DEX"],
    },
    Ranger: {
      primary: ["DEX", "WIS"],
      secondary: ["CON"],
      dump: ["INT", "CHA"],
    },
    Barbarian: {
      primary: ["STR", "CON"],
      secondary: ["DEX"],
      dump: ["INT", "CHA"],
    },
    Bard: {
      primary: ["CHA"],
      secondary: ["DEX", "CON"],
      dump: ["STR", "INT"],
    },
    Paladin: {
      primary: ["STR", "CHA"],
      secondary: ["CON"],
      dump: ["INT", "DEX"],
    },
  }

  return recommendations[charClass] || recommendations.Fighter
}

// Максимальные очки для распределения (изменено с 27 на 11)
export const MAX_POINT_BUY_POINTS = 11
export const MIN_STAT_VALUE = 8
export const MAX_STAT_VALUE = 15

// Получение описания класса
export function getClassDescription(charClass: string): string {
  const descriptions: { [key: string]: string } = {
    Fighter: "Мастер боя, специализирующийся на оружии и доспехах. Высокие Сила и Телосложение.",
    Wizard: "Изучает магию через книги и исследования. Основная характеристика - Интеллект.",
    Rogue: "Скрытный и ловкий, мастер критических ударов. Основная характеристика - Ловкость.",
    Cleric: "Служитель божества с целительными способностями. Основная характеристика - Мудрость.",
    Ranger: "Следопыт и охотник, мастер выживания. Основные характеристики - Ловкость и Мудрость.",
    Barbarian: "Дикий воин с яростью в бою. Основные характеристики - Сила и Телосложение.",
    Bard: "Музыкант и рассказчик с магическими способностями. Основная характеристика - Харизма.",
    Paladin: "Святой воин, сочетающий бой и божественную магию. Основные - Сила и Харизма.",
  }

  return descriptions[charClass] || "Универсальный класс персонажа."
}
