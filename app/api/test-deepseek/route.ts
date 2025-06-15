import { type NextRequest, NextResponse } from "next/server"
import { askDeepSeek } from "@/lib/ai"

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    // Check if API key is set
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        {
          error: "API ключ не настроен",
          details: "Переменная окружения OPENROUTER_API_KEY не найдена",
          instructions: [
            "1. Получите API ключ для DeepSeek R1",
            "2. Добавьте OPENROUTER_API_KEY в .env.local",
            "3. Перезапустите сервер",
          ],
        },
        { status: 500 },
      )
    }

    const testPrompt = prompt || "Создай короткое описание начала D&D приключения в подземелье."

    console.log("Testing DeepSeek R1 with prompt:", testPrompt.substring(0, 100) + "...")

    // Test the API
    const response = await askDeepSeek(testPrompt)

    const isUsingFallback = response.includes("⚠️ Резервный режим DM")

    return NextResponse.json({
      success: !isUsingFallback,
      response,
      model: "deepseek-r1-0528",
      provider: "DeepSeek",
      apiKeySet: !!process.env.OPENROUTER_API_KEY,
      apiKeyPrefix: process.env.OPENROUTER_API_KEY?.substring(0, 12) + "...",
      usingFallback: isUsingFallback,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Test API error:", error)
    return NextResponse.json(
      {
        error: "Ошибка тестирования DeepSeek R1",
        details: error instanceof Error ? error.message : "Неизвестная ошибка",
        model: "deepseek-r1-0528",
      },
      { status: 500 },
    )
  }
}
