// Простая альтернативная функция с проверенной моделью
export async function askDeepSeekAlternative(prompt: string): Promise<string> {
  if (!process.env.OPENROUTER_API_KEY) {
    return generateSimpleFallback()
  }

  try {
    console.log("Using simple alternative approach...")

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
        "X-Title": "D&D AI Dungeon Master",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.2-3b-instruct:free", // Проверенная бесплатная модель
        messages: [
          {
            role: "user",
            content: `You are a D&D Dungeon Master. Respond in Russian with 1-2 short sentences about what happens next in this situation: ${prompt}`,
          },
        ],
        max_tokens: 100,
        temperature: 0.7,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      const content = data.choices?.[0]?.message?.content

      if (content && content.trim().length > 0) {
        console.log("✅ Alternative model worked!")
        return content.trim()
      }
    }

    throw new Error("Alternative model failed")
  } catch (error) {
    console.error("Alternative model error:", error)
    return generateSimpleFallback()
  }
}

function generateSimpleFallback(): string {
  const responses = [
    "Ты продолжаешь свое приключение. Впереди новые вызовы ждут тебя!",
    "Что-то происходит вокруг тебя. Время принимать решение!",
    "Ситуация развивается. Какой будет твой следующий ход?",
    "Приключение продолжается. Что ты предпримешь дальше?",
    "Новые возможности открываются перед тобой. Действуй!",
  ]
  return responses[Math.floor(Math.random() * responses.length)]
}
