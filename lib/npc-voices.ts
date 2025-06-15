export interface NPCVoice {
  id: string
  name: string
  description: string
  speechPattern: string
  vocabulary: string
  examples: string[]
}

export const NPC_VOICES: NPCVoice[] = [
  {
    id: "noble",
    name: "Благородный",
    description: "Аристократ или знатная особа",
    speechPattern: "Изысканная речь, сложные обороты, вежливость",
    vocabulary: "милорд, изволите, почтеннейший, благоволите",
    examples: [
      "Милорд, позвольте выразить свое почтение.",
      "Благоволите принять мое скромное предложение.",
      "Осмелюсь заметить, что сие дело весьма деликатно.",
    ],
  },
  {
    id: "merchant",
    name: "Торговец",
    description: "Купец или торговец",
    speechPattern: "Деловая речь, упоминание цен и выгоды",
    vocabulary: "золотишко, сделочка, барышик, товарец",
    examples: [
      "Эх, золотишко любит счет, друг мой!",
      "Сделаем сделочку? Тебе выгодно, мне не в убыток.",
      "Товарец первый сорт, не пожалеешь!",
    ],
  },
  {
    id: "guard",
    name: "Стражник",
    description: "Городская стража или солдат",
    speechPattern: "Четкая военная речь, приказы, дисциплина",
    vocabulary: "приказ, дисциплина, порядок, нарушение",
    examples: [
      "Стой! Предъяви документы!",
      "Порядок превыше всего, запомни это.",
      "Нарушение караться будет по всей строгости.",
    ],
  },
  {
    id: "peasant",
    name: "Крестьянин",
    description: "Простолюдин или крестьянин",
    speechPattern: "Простая речь, диалектизмы, жалобы на жизнь",
    vocabulary: "батюшка, матушка, горемычный, нужда",
    examples: [
      "Ох, батюшка, жизнь-то какая тяжкая!",
      "Нужда заела, что и сказать...",
      "Простите, барин, мы люди маленькие.",
    ],
  },
  {
    id: "scholar",
    name: "Ученый",
    description: "Мудрец, маг или исследователь",
    speechPattern: "Научная речь, сложные термины, размышления",
    vocabulary: "исследование, гипотеза, феномен, артефакт",
    examples: [
      "Интересный феномен, требует дальнейшего изучения.",
      "Моя гипотеза подтверждается древними текстами.",
      "Сей артефакт обладает необычными свойствами.",
    ],
  },
  {
    id: "rogue",
    name: "Плут",
    description: "Вор, контрабандист или мошенник",
    speechPattern: "Хитрая речь, намеки, жаргон воров",
    vocabulary: "дельце, шухер, наводка, барыга",
    examples: [
      "Есть одно дельце, но шухер большой...",
      "Слышал наводку на жирную добычу.",
      "Барыга тот еще, но товар качественный.",
    ],
  },
  {
    id: "priest",
    name: "Жрец",
    description: "Священник или служитель храма",
    speechPattern: "Торжественная речь, благословения, мораль",
    vocabulary: "благословение, грех, покаяние, божество",
    examples: [
      "Да благословят тебя боги, дитя мое.",
      "Покайся в грехах своих и обретешь спасение.",
      "Божественная воля непостижима для смертных.",
    ],
  },
  {
    id: "barbarian",
    name: "Варвар",
    description: "Дикарь или воин племени",
    speechPattern: "Грубая речь, простые фразы, упоминание силы",
    vocabulary: "сила, враг, битва, честь",
    examples: ["Сила решает все! Слабые не выживают!", "Враг силен, но мы сильнее!", "Честь воина дороже жизни!"],
  },
  {
    id: "child",
    name: "Ребенок",
    description: "Дети и подростки",
    speechPattern: "Детская речь, любопытство, простота",
    vocabulary: "дядя, тетя, страшно, интересно",
    examples: ["Дядя, а ты настоящий герой?", "Мне страшно, но очень интересно!", "А что там, за той дверью?"],
  },
  {
    id: "elder",
    name: "Старец",
    description: "Пожилые мудрые персонажи",
    speechPattern: "Медленная речь, воспоминания, мудрость",
    vocabulary: "в мои годы, помню, мудрость, опыт",
    examples: ["В мои годы многое повидал...", "Помню, было это давным-давно...", "Мудрость приходит с опытом, юноша."],
  },
  {
    id: "innkeeper",
    name: "Трактирщик",
    description: "Владелец таверны или постоялого двора",
    speechPattern: "Гостеприимная речь, предложения услуг",
    vocabulary: "гость, угощение, комната, новости",
    examples: ["Добро пожаловать, дорогой гость!", "Лучшее угощение в городе у нас!", "Свежие новости за кружкой эля?"],
  },
  {
    id: "villain",
    name: "Злодей",
    description: "Антагонисты и враги",
    speechPattern: "Угрожающая речь, высокомерие, злоба",
    vocabulary: "глупец, власть, месть, страдание",
    examples: [
      "Глупец! Ты не знаешь, с кем связался!",
      "Власть будет моей, а ты пожалеешь!",
      "Твои страдания только начинаются!",
    ],
  },
]

export function getRandomNPCVoice(): NPCVoice {
  return NPC_VOICES[Math.floor(Math.random() * NPC_VOICES.length)]
}

export function getNPCVoiceById(id: string): NPCVoice | undefined {
  return NPC_VOICES.find((voice) => voice.id === id)
}

export function selectNPCVoiceByContext(context: string): NPCVoice {
  const lowerContext = context.toLowerCase()

  // Определяем тип NPC по контексту
  if (lowerContext.includes("торгов") || lowerContext.includes("купец") || lowerContext.includes("магазин")) {
    return getNPCVoiceById("merchant")!
  }

  if (lowerContext.includes("страж") || lowerContext.includes("солдат") || lowerContext.includes("охран")) {
    return getNPCVoiceById("guard")!
  }

  if (lowerContext.includes("благород") || lowerContext.includes("лорд") || lowerContext.includes("граф")) {
    return getNPCVoiceById("noble")!
  }

  if (lowerContext.includes("жрец") || lowerContext.includes("священ") || lowerContext.includes("храм")) {
    return getNPCVoiceById("priest")!
  }

  if (lowerContext.includes("мудрец") || lowerContext.includes("маг") || lowerContext.includes("ученый")) {
    return getNPCVoiceById("scholar")!
  }

  if (lowerContext.includes("вор") || lowerContext.includes("плут") || lowerContext.includes("контрабанд")) {
    return getNPCVoiceById("rogue")!
  }

  if (lowerContext.includes("варвар") || lowerContext.includes("дикар") || lowerContext.includes("племя")) {
    return getNPCVoiceById("barbarian")!
  }

  if (
    lowerContext.includes("ребенок") ||
    lowerContext.includes("дети") ||
    lowerContext.includes("мальчик") ||
    lowerContext.includes("девочка")
  ) {
    return getNPCVoiceById("child")!
  }

  if (lowerContext.includes("старец") || lowerContext.includes("старик") || lowerContext.includes("пожилой")) {
    return getNPCVoiceById("elder")!
  }

  if (lowerContext.includes("трактир") || lowerContext.includes("таверна") || lowerContext.includes("хозяин")) {
    return getNPCVoiceById("innkeeper")!
  }

  if (lowerContext.includes("враг") || lowerContext.includes("злодей") || lowerContext.includes("антагонист")) {
    return getNPCVoiceById("villain")!
  }

  if (lowerContext.includes("крестьян") || lowerContext.includes("простолюд") || lowerContext.includes("деревенск")) {
    return getNPCVoiceById("peasant")!
  }

  // По умолчанию возвращаем случайный голос
  return getRandomNPCVoice()
}
