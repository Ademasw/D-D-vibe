import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/sessions"

export async function GET(request: NextRequest, { params }: { params: { sessionId: string } }) {
  try {
    const { sessionId } = params

    const session = getSession(sessionId)
    if (!session) {
      return NextResponse.json({ error: "Сессия не найдена" }, { status: 404 })
    }

    return NextResponse.json({
      character: session.character,
      inventory: session.inventory || [],
      quests: session.quests || [],
      visitedLocations: session.visitedLocations || ["goldenheart-tavern"],
      currentLocation: session.currentLocation || "goldenheart-tavern",
      encounteredNPCs: session.encounteredNPCs || [],
      combatLog: session.combatLog || [],
      history: session.history,
    })
  } catch (error) {
    console.error("Error getting session:", error)
    return NextResponse.json({ error: "Ошибка получения сессии" }, { status: 500 })
  }
}
