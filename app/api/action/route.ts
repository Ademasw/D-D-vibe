import { type NextRequest, NextResponse } from "next/server"
import { getSession, updateSession, rollD20 } from "@/lib/sessions"
import { askDeepSeek } from "@/lib/ai"
import type { ActionRequest, ActionResponse } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const body: ActionRequest = await request.json()
    const { sessionId, actionText } = body

    console.log("=== D&D Action Processing ===")
    console.log("Session:", sessionId)
    console.log("Player action:", actionText)

    if (!sessionId || !actionText) {
      console.error("Missing required fields:", { sessionId: !!sessionId, actionText: !!actionText })
      return NextResponse.json({ error: "Отсутствуют обязательные поля" }, { status: 400 })
    }

    // Получение сессии
    const session = getSession(sessionId)
    if (!session) {
      console.error("Session not found:", sessionId)
      return NextResponse.json({ error: "Сессия не найдена" }, { status: 404 })
    }

    console.log("Session found, character:", session.character.name)

    // Бросок d20
    const roll = rollD20()
    console.log("D20 roll:", roll)

    // Добавление действия игрока в историю
    session.history.push({
      type: "player",
      content: actionText,
      timestamp: new Date(),
    })

    // Добавление броска в историю
    session.history.push({
      type: "roll",
      content: `Бросок d20: ${roll}`,
      roll,
      timestamp: new Date(),
    })

    // Краткий контекст для сбалансированных ответов
    const character = session.character
    const lastDMResponse =
      session.history
        .slice()
        .reverse()
        .find((h) => h.type === "dm")?.content || "Приключение начинается"

    // Сбалансированный промпт
    const prompt = `GAME SITUATION:
Character: ${character.name} (${character.charClass})
Stats: STR ${character.stats.STR}, DEX ${character.stats.DEX}, CON ${character.stats.CON}, INT ${character.stats.INT}, WIS ${character.stats.WIS}, CHA ${character.stats.CHA}

Last event: ${lastDMResponse.substring(0, 150)}

PLAYER ACTION: "${actionText}"
DICE RESULT: ${roll}/20 ${roll >= 15 ? "(excellent!)" : roll >= 10 ? "(good)" : roll >= 6 ? "(average)" : "(failure)"}

Describe the result briefly but vividly. If there are NPCs - give them unique voices. Offer a specific choice to the player. Maximum 4-6 sentences in Russian.`

    console.log("Sending prompt to DeepSeek R1...")
    console.log("Prompt length:", prompt.length)

    // Получение ответа от DeepSeek R1
    let aiResponse: string
    try {
      aiResponse = await askDeepSeek(prompt)
      console.log("Received response from DeepSeek R1, length:", aiResponse.length)
    } catch (aiError) {
      console.error("Error from askDeepSeek:", aiError)
      aiResponse = `Приключение продолжается! Твое действие "${actionText}" приводит к неожиданным последствиям. Что делаешь дальше?`
    }

    // Проверяем, что ответ не пустой
    if (!aiResponse || aiResponse.trim().length === 0) {
      console.error("Empty AI response, using emergency fallback")
      aiResponse = `Твое действие "${actionText}" имеет последствия. Бросок ${roll} определяет исход. Что предпримешь дальше?`
    }

    console.log("Final AI response preview:", aiResponse.substring(0, 100))

    // Добавление ответа DM в историю
    session.history.push({
      type: "dm",
      content: aiResponse,
      timestamp: new Date(),
    })

    // Обновление сессии
    updateSession(sessionId, session)

    const response: ActionResponse = {
      result: aiResponse,
      roll,
    }

    console.log("=== Action Processed Successfully ===")
    return NextResponse.json(response)
  } catch (error) {
    console.error("=== Action Processing Error ===")
    console.error("Error type:", error instanceof Error ? error.constructor.name : typeof error)
    console.error("Error message:", error instanceof Error ? error.message : String(error))
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")

    // Возвращаем более информативную ошибку
    return NextResponse.json(
      {
        error: "Ошибка обработки действия",
        details: error instanceof Error ? error.message : "Неизвестная ошибка",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
