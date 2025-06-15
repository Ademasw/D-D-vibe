interface DeepSeekMessage {
  role: "user" | "assistant" | "system"
  content: string
}

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string
    }
    finish_reason?: string
  }>
  error?: {
    message: string
    type: string
  }
}

export async function askDeepSeek(prompt: string): Promise<string> {
  // Check if API key is available
  if (!process.env.OPENROUTER_API_KEY) {
    console.error("API key not configured")
    return generateFallbackResponse(prompt)
  }

  try {
    console.log("Making request to DeepSeek R1 model...")
    console.log("Prompt length:", prompt.length)

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
        "X-Title": "D&D AI Dungeon Master",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1-0528",
        messages: [
          {
            role: "system",
            content: `You are an expert Dungeon Master for D&D. Create engaging adventures with unique NPC voices.

RESPONSE STYLE:
- Write in Russian language
- Be concise but vivid - focus on action and plot
- Avoid long environment descriptions - only key details
- Emphasize NPC DIALOGUES with unique voices
- Develop plot dynamically with specific events
- ALWAYS complete your thoughts

NPC VOICES (use characteristic vocabulary):
1. NOBLES: "милорд", "изволите", "благоволите"
2. MERCHANTS: "золотишко", "сделочка", "барышик"  
3. GUARDS: "приказ", "дисциплина", "нарушение"
4. PEASANTS: "батюшка", "горемычный", "нужда"
5. SCHOLARS: "феномен", "гипотеза", "артефакт"
6. ROGUES: "дельце", "шухер", "наводка"
7. PRIESTS: "благословение", "покаяние", "божество"
8. BARBARIANS: "сила", "битва", "честь воина"
9. CHILDREN: "дядя", "страшно", "интересно"
10. ELDERS: "в мои годы", "мудрость", "опыт"
11. INNKEEPERS: "гость", "угощение", "новости"
12. VILLAINS: "глупец", "власть", "месть"

RESPONSE STRUCTURE (4-6 sentences):
1. Result of player action (1-2 sentences)
2. NPC dialogue with unique voice (1-2 lines)
3. New event or plot twist (1-2 sentences)
4. Specific choice for player (1 sentence)

FORBIDDEN:
- Long environment descriptions
- Excessive atmospheric details
- Repeating known information
- Incomplete thoughts

Respond in Russian. Be brief but lively.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 600,
        temperature: 0.8, // Немного снижаем для стабильности
        top_p: 0.9,
        frequency_penalty: 0.2,
        presence_penalty: 0.1,
      }),
    })

    console.log("DeepSeek R1 response status:", response.status)
    console.log("Response headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`DeepSeek R1 API error: ${response.status}`)
      console.error("Error response body:", errorText)

      if (response.status === 401) {
        console.error("Authentication failed - check API key")
        return "🔑 Ошибка авторизации API.\n\n" + generateFallbackResponse(prompt)
      }

      if (response.status === 429) {
        console.error("Rate limit exceeded")
        return "⏱️ Превышен лимит запросов.\n\n" + generateFallbackResponse(prompt)
      }

      if (response.status === 400) {
        console.error("Bad request - invalid parameters")
        return "⚠️ Некорректный запрос к API.\n\n" + generateFallbackResponse(prompt)
      }

      console.error("Unknown API error, using fallback")
      return generateFallbackResponse(prompt)
    }

    const responseText = await response.text()
    console.log("Raw response length:", responseText.length)
    console.log("Raw response preview:", responseText.substring(0, 500))

    if (!responseText || responseText.trim().length === 0) {
      console.error("Empty response body from DeepSeek R1")
      return generateFallbackResponse(prompt)
    }

    let data: DeepSeekResponse
    try {
      data = JSON.parse(responseText)
      console.log("Parsed response structure:", {
        hasChoices: !!data.choices,
        choicesCount: data.choices?.length || 0,
        hasError: !!data.error,
        firstChoiceHasMessage: !!data.choices?.[0]?.message,
        firstChoiceContent: data.choices?.[0]?.message?.content?.substring(0, 100),
      })
    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError)
      console.error("Response text that failed to parse:", responseText)
      return generateFallbackResponse(prompt)
    }

    if (data.error) {
      console.error("API returned error object:", data.error)
      return generateFallbackResponse(prompt)
    }

    if (!data.choices || data.choices.length === 0) {
      console.error("No choices in response")
      console.error("Full response data:", JSON.stringify(data, null, 2))
      return generateFallbackResponse(prompt)
    }

    const choice = data.choices[0]
    if (!choice) {
      console.error("First choice is null/undefined")
      return generateFallbackResponse(prompt)
    }

    if (!choice.message) {
      console.error("Choice has no message object")
      console.error("Choice structure:", JSON.stringify(choice, null, 2))
      return generateFallbackResponse(prompt)
    }

    const aiResponse = choice.message.content
    console.log("AI response type:", typeof aiResponse)
    console.log("AI response value:", aiResponse)

    if (!aiResponse) {
      console.error("Message content is null/undefined")
      return generateFallbackResponse(prompt)
    }

    if (typeof aiResponse !== "string") {
      console.error("Message content is not a string, type:", typeof aiResponse)
      console.error("Content value:", aiResponse)
      return generateFallbackResponse(prompt)
    }

    const trimmedResponse = aiResponse.trim()
    if (trimmedResponse.length === 0) {
      console.error("Message content is empty string after trim")
      return generateFallbackResponse(prompt)
    }

    // Ensure response ends properly
    let finalResponse = trimmedResponse
    if (!finalResponse.match(/[.!?]$/)) {
      finalResponse += "."
    }

    // Clean up excessive line breaks
    finalResponse = finalResponse.replace(/\n{3,}/g, "\n\n")

    console.log("✅ DeepSeek R1 success! Final response length:", finalResponse.length)
    console.log("Final response preview:", finalResponse.substring(0, 200) + "...")

    return finalResponse
  } catch (error) {
    console.error("Exception in askDeepSeek:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return generateFallbackResponse(prompt)
  }
}

// Улучшенные fallback ответы с голосами NPC
function generateFallbackResponse(prompt: string): string {
  console.log("Generating fallback response for prompt:", prompt.substring(0, 100))

  const lowerPrompt = prompt.toLowerCase()

  if (lowerPrompt.includes("говор") || lowerPrompt.includes("диалог") || lowerPrompt.includes("разгов")) {
    const dialogueResponses = [
      `Торговец за прилавком оживляется при виде тебя. "Ох, золотишко мое дорогое! Товарец у меня первый сорт, сделаем сделочку?" Он достает странный светящийся амулет. "Всего за сотню золотых отдам!" Покупаешь, торгуешься или уходишь?`,

      `Стражник преграждает путь. "Стой! Предъяви документы! Порядок превыше всего." Его взгляд скользит по твоему оружию. "Но если найдем общий язык... может, и пропущу." Показываешь документы, подкупаешь или готовишься к конфликту?`,

      `Старый жрец поднимает голову от молитв. "Да благословят тебя боги, дитя мое. Вижу, тяжел твой путь." Он встает с колен. "Покайся в грехах и обретешь спасение. Чем могу помочь?" Просишь благословения, исповедуешься или расспрашиваешь о проблемах?`,
    ]
    return dialogueResponses[Math.floor(Math.random() * dialogueResponses.length)]
  }

  if (lowerPrompt.includes("атак") || lowerPrompt.includes("сраж") || lowerPrompt.includes("удар")) {
    const combatResponses = [
      `Твой удар попадает! Варвар в звериных шкурах пошатывается. "Сила решает все! Слабые не выживают!" - рычит он, поднимая топор. "Враг силен, но я сильнее!" Продолжаешь атаковать или защищаешься?`,

      `Элегантный дуэлянт блокирует твой выпад. "Милорд, изволите сражаться? Почтеннейший противник." Его клинок сверкает. "Благоволите принять вызов на честный поединок?" Принимаешь правила дуэли или атакуешь без церемоний?`,

      `Критический удар! Враг падает, роняя светящийся амулет. "Ты... не знаешь... что натворил..." - хрипит он. Амулет пульсирует красным светом. Подбираешь его, уничтожаешь или быстро уходишь?`,
    ]
    return combatResponses[Math.floor(Math.random() * combatResponses.length)]
  }

  if (lowerPrompt.includes("исследу") || lowerPrompt.includes("осматр") || lowerPrompt.includes("ищ")) {
    const explorationResponses = [
      `Ты находишь скрытую нишу в стене. Внутри лежит древний свиток с картой. "Интересный артефакт," - замечает проходящий мимо ученый. "Феномен магической картографии." Изучаешь карту, расспрашиваешь ученого или продолжаешь поиски?`,

      `Под пылью обнаруживается старый рычаг. При нажатии открывается тайный проход. Из глубины доносится детский голос: "Дядя, там страшно, но интересно!" Маленькая девочка указывает в темноту. Входишь в проход, успокаиваешь ребенка или ищешь ее родителей?`,
    ]
    return explorationResponses[Math.floor(Math.random() * explorationResponses.length)]
  }

  // Общие краткие ответы с диалогами
  const generalResponses = [
    `Подозрительный тип в капюшоне подзывает тебя. "Есть одно дельце, но шухер большой. Барыга ищет смельчаков." Он оглядывается. "Слышал наводку на жирную добычу в старом замке. Интересно?" Слушаешь предложение или отказываешься?`,

    `Маленькая девочка подбегает к тебе. "Дядя, ты настоящий герой? Мне страшно!" Она указывает на темный переулок. "Дедушка зашел туда и не вернулся..." Идешь проверить, успокаиваешь девочку или ищешь ее родителей?`,

    `Пол начинает трещать под ногами - древняя ловушка! Ты балансируешь на краю пропасти. Рядом свисает старая цепь, а на противоположной стороне узкий выступ. Прыгаешь к цепи, к выступу или ищешь другой способ?`,

    `Трактирщик машет тебе рукой. "Добро пожаловать, дорогой гость! Лучшее угощение в городе!" Он наклоняется ближе. "Свежие новости за кружкой эля? Говорят, в старом замке творятся странные дела." Заказываешь эль, расспрашиваешь о замке или ищешь комнату?`,

    `Старец с длинной бородой изучает тебя мудрыми глазами. "В мои годы многое повидал, юноша. Мудрость приходит с опытом." Он указывает на развилку дорог. "Левая тропа ведет к богатству, правая - к славе. Но обе полны опасностей." Выбираешь левую тропу, правую или расспрашиваешь подробнее?`,
  ]

  const response = generalResponses[Math.floor(Math.random() * generalResponses.length)]
  console.log("Selected fallback response:", response.substring(0, 100))
  return `⚠️ Резервный режим DM\n\n${response}`
}
