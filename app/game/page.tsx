"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { InventoryPanel } from "@/components/inventory-panel"
import { WorldMap } from "@/components/world-map"
import { QuestJournal } from "@/components/quest-journal"
import { CharacterSheet } from "@/components/character-sheet"
import type { Character, InventoryItem, Quest, NPC, CombatEvent } from "@/lib/types"
import { canLevelUp, levelUpCharacter } from "@/lib/level-system"
import { STAT_NAMES } from "@/lib/character-generator"

interface HistoryItem {
  type: "player" | "dm" | "roll" | "levelup" | "combat"
  content: string
  roll?: number
  timestamp: string
}

interface GameData {
  character: Character
  inventory: InventoryItem[]
  quests: Quest[]
  visitedLocations: string[]
  currentLocation: string
  encounteredNPCs: NPC[]
  combatLog: CombatEvent[]
  history: HistoryItem[]
}

export default function GamePage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("sessionId")

  const [gameData, setGameData] = useState<GameData | null>(null)
  const [actionText, setActionText] = useState("")
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("game")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [gameData?.history])

  useEffect(() => {
    if (!sessionId) {
      alert("Сессия не найдена")
      window.location.href = "/"
      return
    }

    loadSession()
  }, [sessionId])

  const loadSession = async () => {
    try {
      const response = await fetch(`/api/session/${sessionId}`)
      if (!response.ok) {
        throw new Error("Сессия не найдена")
      }

      const data = await response.json()
      setGameData({
        character: data.character,
        inventory: data.inventory || [],
        quests: data.quests || [],
        visitedLocations: data.visitedLocations || ["goldenheart-tavern"],
        currentLocation: data.currentLocation || "goldenheart-tavern",
        encounteredNPCs: data.encounteredNPCs || [],
        combatLog: data.combatLog || [],
        history: data.history,
      })
    } catch (error) {
      console.error("Error loading session:", error)
      alert("Ошибка загрузки сессии")
      window.location.href = "/"
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!actionText.trim() || loading || !gameData) return

    const currentAction = actionText.trim()
    setActionText("")
    setLoading(true)

    try {
      const response = await fetch("/api/action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          actionText: currentAction,
        }),
      })

      if (!response.ok) {
        throw new Error("Ошибка обработки действия")
      }

      const data = await response.json()

      // Обновляем игровые данные
      setGameData((prev) => {
        if (!prev) return null

        const newHistory = [
          ...prev.history,
          {
            type: "player" as const,
            content: currentAction,
            timestamp: new Date().toISOString(),
          },
          {
            type: "roll" as const,
            content: `Бросок d20: ${data.roll}`,
            roll: data.roll,
            timestamp: new Date().toISOString(),
          },
          {
            type: "dm" as const,
            content: data.result,
            timestamp: new Date().toISOString(),
          },
        ]

        let updatedCharacter = prev.character

        // Обновляем персонажа
        if (data.experienceGain) {
          updatedCharacter = {
            ...updatedCharacter,
            experience: updatedCharacter.experience + data.experienceGain,
          }
        }

        if (data.goldChange) {
          updatedCharacter = {
            ...updatedCharacter,
            gold: updatedCharacter.gold + data.goldChange,
          }
        }

        if (data.hpChange) {
          updatedCharacter = {
            ...updatedCharacter,
            hp: Math.max(0, Math.min(updatedCharacter.maxHp, updatedCharacter.hp + data.hpChange)),
          }
        }

        return {
          ...prev,
          history: newHistory,
          character: updatedCharacter,
          inventory: data.newItems ? [...prev.inventory, ...data.newItems] : prev.inventory,
          quests: data.newQuests ? [...prev.quests, ...data.newQuests] : prev.quests,
          currentLocation: data.locationChange || prev.currentLocation,
          visitedLocations:
            data.locationChange && !prev.visitedLocations.includes(data.locationChange)
              ? [...prev.visitedLocations, data.locationChange]
              : prev.visitedLocations,
          encounteredNPCs: data.newNPC ? [...prev.encounteredNPCs, data.newNPC] : prev.encounteredNPCs,
        }
      })
    } catch (error) {
      console.error("Error:", error)
      alert("Ошибка отправки действия. Попробуйте еще раз.")
    } finally {
      setLoading(false)
    }
  }

  const handleLevelUp = () => {
    if (!gameData) return

    const { character: newCharacter, reward } = levelUpCharacter(gameData.character)

    setGameData((prev) => {
      if (!prev) return null
      return {
        ...prev,
        character: newCharacter,
        history: [
          ...prev.history,
          {
            type: "levelup" as const,
            content: `🎉 Уровень повышен! +${reward.hpIncrease} HP, +${reward.skillPoints} очков навыков${
              reward.newAbilities?.length ? `, новые способности: ${reward.newAbilities.join(", ")}` : ""
            }`,
            timestamp: new Date().toISOString(),
          },
        ],
      }
    })
  }

  const handleSkillUpgrade = (skill: keyof Character["skills"]) => {
    if (!gameData || gameData.character.skillPoints <= 0) return

    setGameData((prev) => {
      if (!prev) return null
      return {
        ...prev,
        character: {
          ...prev.character,
          skillPoints: prev.character.skillPoints - 1,
          skills: {
            ...prev.character.skills,
            [skill]: Math.min(5, prev.character.skills[skill] + 1),
          },
        },
      }
    })
  }

  const handleUseItem = (itemId: string) => {
    if (!gameData) return

    const item = gameData.inventory.find((i) => i.id === itemId)
    if (!item || item.type !== "consumable") return

    // Простая логика использования предметов
    if (item.name.includes("лечения")) {
      const healAmount = Math.floor(Math.random() * 8) + 4 // 2d4+2
      setGameData((prev) => {
        if (!prev) return null
        return {
          ...prev,
          character: {
            ...prev.character,
            hp: Math.min(prev.character.maxHp, prev.character.hp + healAmount),
          },
          inventory: prev.inventory
            .map((i) => (i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i))
            .filter((i) => i.quantity > 0),
          history: [
            ...prev.history,
            {
              type: "dm" as const,
              content: `Ты используешь ${item.name} и восстанавливаешь ${healAmount} очков здоровья.`,
              timestamp: new Date().toISOString(),
            },
          ],
        }
      })
    }
  }

  const handleLocationSelect = (locationId: string) => {
    if (!gameData) return

    setGameData((prev) => {
      if (!prev) return null
      return {
        ...prev,
        currentLocation: locationId,
        visitedLocations: prev.visitedLocations.includes(locationId)
          ? prev.visitedLocations
          : [...prev.visitedLocations, locationId],
        history: [
          ...prev.history,
          {
            type: "dm" as const,
            content: `Ты перемещаешься в новую локацию. Что будешь делать дальше?`,
            timestamp: new Date().toISOString(),
          },
        ],
      }
    })
  }

  // Функция для определения NPC в тексте
  const detectNPCVoices = (text: string) => {
    const voices = []
    const lowerText = text.toLowerCase()

    if (lowerText.includes("милорд") || lowerText.includes("благоволите") || lowerText.includes("изволите")) {
      voices.push({ name: "Благородный", color: "bg-purple-600" })
    }
    if (lowerText.includes("золотишко") || lowerText.includes("сделочка") || lowerText.includes("барышик")) {
      voices.push({ name: "Торговец", color: "bg-yellow-600" })
    }
    if (lowerText.includes("приказ") || lowerText.includes("дисциплина") || lowerText.includes("стой!")) {
      voices.push({ name: "Стражник", color: "bg-red-600" })
    }
    if (lowerText.includes("батюшка") || lowerText.includes("горемычный") || lowerText.includes("нужда")) {
      voices.push({ name: "Крестьянин", color: "bg-green-600" })
    }
    if (lowerText.includes("феномен") || lowerText.includes("гипотеза") || lowerText.includes("артефакт")) {
      voices.push({ name: "Ученый", color: "bg-blue-600" })
    }
    if (lowerText.includes("дельце") || lowerText.includes("шухер") || lowerText.includes("наводка")) {
      voices.push({ name: "Плут", color: "bg-gray-600" })
    }
    if (lowerText.includes("благословение") || lowerText.includes("покаяние") || lowerText.includes("божество")) {
      voices.push({ name: "Жрец", color: "bg-indigo-600" })
    }
    if (lowerText.includes("сила решает") || lowerText.includes("честь воина") || lowerText.includes("битва")) {
      voices.push({ name: "Варвар", color: "bg-orange-600" })
    }
    if (lowerText.includes("дядя") || lowerText.includes("страшно") || lowerText.includes("интересно")) {
      voices.push({ name: "Ребенок", color: "bg-pink-600" })
    }
    if (lowerText.includes("в мои годы") || lowerText.includes("мудрость") || lowerText.includes("опыт")) {
      voices.push({ name: "Старец", color: "bg-amber-600" })
    }
    if (lowerText.includes("гость") || lowerText.includes("угощение") || lowerText.includes("добро пожаловать")) {
      voices.push({ name: "Трактирщик", color: "bg-teal-600" })
    }
    if (lowerText.includes("глупец") || lowerText.includes("власть") || lowerText.includes("месть")) {
      voices.push({ name: "Злодей", color: "bg-black" })
    }

    return voices
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Загрузка игры...</div>
      </div>
    )
  }

  if (!gameData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Данные игры не найдены</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Информация о персонаже */}
        <Card className="mb-4 bg-slate-800 border-slate-700 text-white">
          <CardHeader>
            <CardTitle className="text-xl flex items-center justify-between">
              <span>
                {gameData.character.name} - {gameData.character.charClass}
              </span>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span>
                    ❤️ {gameData.character.hp}/{gameData.character.maxHp}
                  </span>
                  <Progress value={(gameData.character.hp / gameData.character.maxHp) * 100} className="w-20 h-2" />
                </div>
                <span className="text-yellow-400">💰 {gameData.character.gold} золота</span>
                <span className="text-blue-400">⭐ Уровень {gameData.character.level}</span>
                {canLevelUp(gameData.character) && (
                  <Button onClick={handleLevelUp} size="sm" className="bg-yellow-600 hover:bg-yellow-700 animate-pulse">
                    Повысить уровень!
                  </Button>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 gap-2 text-sm">
              {Object.entries(gameData.character.stats).map(([stat, value]) => (
                <div key={stat} className="text-center">
                  <div className="font-bold">{STAT_NAMES[stat]}</div>
                  <div className="text-slate-300">{value}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Основные вкладки */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800 mb-4">
            <TabsTrigger value="game">🎮 Игра</TabsTrigger>
            <TabsTrigger value="character">📋 Персонаж</TabsTrigger>
            <TabsTrigger value="inventory">🎒 Инвентарь</TabsTrigger>
            <TabsTrigger value="map">🗺️ Карта</TabsTrigger>
            <TabsTrigger value="quests">📋 Квесты</TabsTrigger>
          </TabsList>

          <TabsContent value="game">
            {/* Легенда голосов NPC */}
            <Card className="mb-4 bg-slate-800 border-slate-700 text-white">
              <CardHeader>
                <CardTitle className="text-lg">🎭 Голоса персонажей</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
                  <Badge className="bg-purple-600 text-white">Благородный</Badge>
                  <Badge className="bg-yellow-600 text-white">Торговец</Badge>
                  <Badge className="bg-red-600 text-white">Стражник</Badge>
                  <Badge className="bg-green-600 text-white">Крестьянин</Badge>
                  <Badge className="bg-blue-600 text-white">Ученый</Badge>
                  <Badge className="bg-gray-600 text-white">Плут</Badge>
                  <Badge className="bg-indigo-600 text-white">Жрец</Badge>
                  <Badge className="bg-orange-600 text-white">Варвар</Badge>
                  <Badge className="bg-pink-600 text-white">Ребенок</Badge>
                  <Badge className="bg-amber-600 text-white">Старец</Badge>
                  <Badge className="bg-teal-600 text-white">Трактирщик</Badge>
                  <Badge className="bg-black text-white">Злодей</Badge>
                </div>
              </CardContent>
            </Card>

            {/* История игры */}
            <Card className="mb-4 bg-slate-800 border-slate-700 text-white">
              <CardHeader>
                <CardTitle>📖 Хроника приключений</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 overflow-y-auto space-y-3 mb-4">
                  {gameData.history.map((item, index) => {
                    const npcVoices = item.type === "dm" ? detectNPCVoices(item.content) : []

                    return (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="flex-shrink-0 text-lg">
                          {item.type === "player" && "🧍‍♂️"}
                          {item.type === "roll" && "🎲"}
                          {item.type === "dm" && "🧙"}
                          {item.type === "levelup" && "⭐"}
                          {item.type === "combat" && "⚔️"}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="font-semibold text-sm text-slate-300">
                              {item.type === "player" && "Ты:"}
                              {item.type === "roll" && "Бросок:"}
                              {item.type === "dm" && "DM:"}
                              {item.type === "levelup" && "Уровень:"}
                              {item.type === "combat" && "Бой:"}
                            </div>
                            {/* Показываем голоса NPC */}
                            {npcVoices.map((voice, voiceIndex) => (
                              <Badge key={voiceIndex} className={`${voice.color} text-white text-xs`}>
                                {voice.name}
                              </Badge>
                            ))}
                          </div>
                          <div
                            className={`${
                              item.type === "roll"
                                ? `font-bold ${item.roll && item.roll >= 15 ? "text-green-400" : item.roll && item.roll <= 5 ? "text-red-400" : "text-yellow-400"}`
                                : item.type === "levelup"
                                  ? "text-yellow-400 font-bold"
                                  : item.type === "combat"
                                    ? "text-red-400"
                                    : item.type === "dm"
                                      ? "text-slate-100 leading-relaxed"
                                      : "text-slate-100"
                            }`}
                          >
                            {item.content}
                            {/* Индикатор завершенности для DM ответов */}
                            {item.type === "dm" && item.content.match(/[.!?]$/) && (
                              <span className="text-green-500 ml-1 text-xs">✓</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {loading && (
                    <div className="flex items-center space-x-2 text-slate-400">
                      <div className="text-lg">🧙</div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm">DM обдумывает ответ...</div>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Форма ввода действия */}
                <form onSubmit={handleSubmit} className="flex space-x-2">
                  <Input
                    type="text"
                    value={actionText}
                    onChange={(e) => setActionText(e.target.value)}
                    placeholder="Опишите ваше действие..."
                    className="flex-1 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    disabled={loading}
                  />
                  <Button
                    type="submit"
                    disabled={loading || !actionText.trim()}
                    className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                  >
                    {loading ? "⏳" : "⚔️"}
                  </Button>
                </form>

                {/* Подсказки для игрока */}
                <div className="mt-2 text-xs text-slate-400">
                  💡 Совет: Говорите с NPC для получения уникальных диалогов и информации
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="character">
            <CharacterSheet
              character={gameData.character}
              onLevelUp={handleLevelUp}
              onSkillUpgrade={handleSkillUpgrade}
            />
          </TabsContent>

          <TabsContent value="inventory">
            <InventoryPanel inventory={gameData.inventory} character={gameData.character} onUseItem={handleUseItem} />
          </TabsContent>

          <TabsContent value="map">
            <WorldMap
              visitedLocations={gameData.visitedLocations}
              currentLocation={gameData.currentLocation}
              onLocationSelect={handleLocationSelect}
            />
          </TabsContent>

          <TabsContent value="quests">
            <QuestJournal
              quests={gameData.quests}
              onAbandonQuest={(questId) => {
                setGameData((prev) => {
                  if (!prev) return null
                  return {
                    ...prev,
                    quests: prev.quests.map((q) => (q.id === questId ? { ...q, status: "failed" as const } : q)),
                  }
                })
              }}
            />
          </TabsContent>
        </Tabs>

        {/* Кнопка возврата */}
        <div className="text-center mt-4">
          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            🏠 Создать нового персонажа
          </Button>
        </div>
      </div>
    </div>
  )
}
