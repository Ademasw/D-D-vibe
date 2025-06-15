"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { NPC, Character } from "@/lib/types"

interface NPCEncounterProps {
  npc: NPC
  character: Character
  onInteract?: (action: string) => void
  onCombat?: () => void
  onTrade?: () => void
}

export function NPCEncounter({ npc, character, onInteract, onCombat, onTrade }: NPCEncounterProps) {
  const [selectedAction, setSelectedAction] = useState<string>("")

  const getRelationshipColor = (relationship: string) => {
    const colors = {
      friendly: "bg-green-600",
      neutral: "bg-yellow-600",
      hostile: "bg-red-600",
      romantic: "bg-pink-600",
    }
    return colors[relationship as keyof typeof colors] || "bg-gray-600"
  }

  const getRelationshipIcon = (relationship: string) => {
    const icons = {
      friendly: "😊",
      neutral: "😐",
      hostile: "😠",
      romantic: "😍",
    }
    return icons[relationship as keyof typeof icons] || "🤔"
  }

  const interactionOptions = [
    { id: "greet", label: "Поприветствовать", icon: "👋" },
    { id: "talk", label: "Поговорить", icon: "💬" },
    { id: "ask_quest", label: "Спросить о заданиях", icon: "❓" },
    { id: "ask_info", label: "Узнать информацию", icon: "ℹ️" },
    { id: "intimidate", label: "Запугать", icon: "😤" },
    { id: "persuade", label: "Убедить", icon: "🗣️" },
  ]

  return (
    <Card className="bg-slate-800 border-slate-700 text-white">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>👤 Встреча с NPC</span>
          <Badge className={`${getRelationshipColor(npc.relationship)} text-white`}>
            {getRelationshipIcon(npc.relationship)} {npc.relationship}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-700">
            <TabsTrigger value="info">Информация</TabsTrigger>
            <TabsTrigger value="interact">Взаимодействие</TabsTrigger>
            <TabsTrigger value="combat">Бой</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            {/* Основная информация */}
            <div className="p-4 bg-slate-700 rounded">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl">
                  {npc.race === "Человек" ? "🧑" : npc.race === "Эльф" ? "🧝" : npc.race === "Дворф" ? "🧔" : "👤"}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{npc.name}</h3>
                  <p className="text-slate-300">
                    {npc.race} • {npc.occupation}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <strong>Внешность:</strong> {npc.appearance}
                </div>
                <div>
                  <strong>Характер:</strong> {npc.personality.join(", ")}
                </div>
                <div>
                  <strong>Локация:</strong> {npc.location}
                </div>
              </div>
            </div>

            {/* Роли */}
            <div className="flex gap-2 flex-wrap">
              {npc.questGiver && <Badge className="bg-blue-600">Квестодатель</Badge>}
              {npc.merchant && <Badge className="bg-yellow-600">Торговец</Badge>}
              {npc.relationship === "hostile" && <Badge className="bg-red-600">Враждебен</Badge>}
            </div>

            {/* Статистики для боя */}
            {npc.stats && (
              <div className="p-3 bg-slate-700 rounded">
                <h4 className="font-semibold mb-2">Боевые характеристики</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-red-400">{npc.stats.level}</div>
                    <div className="text-xs text-slate-400">Уровень</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-400">{npc.stats.hp}</div>
                    <div className="text-xs text-slate-400">Здоровье</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-400">{npc.stats.ac}</div>
                    <div className="text-xs text-slate-400">Класс Доспеха</div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="interact" className="space-y-4">
            {/* Варианты взаимодействия */}
            <div className="grid grid-cols-2 gap-2">
              {interactionOptions.map((option) => (
                <Button
                  key={option.id}
                  variant={selectedAction === option.id ? "default" : "outline"}
                  className="justify-start"
                  onClick={() => {
                    setSelectedAction(option.id)
                    onInteract?.(option.id)
                  }}
                >
                  <span className="mr-2">{option.icon}</span>
                  {option.label}
                </Button>
              ))}
            </div>

            {/* Специальные действия */}
            <div className="space-y-2">
              {npc.merchant && (
                <Button onClick={onTrade} className="w-full bg-yellow-600 hover:bg-yellow-700">
                  💰 Торговать
                </Button>
              )}

              {npc.questGiver && (
                <Button onClick={() => onInteract?.("request_quest")} className="w-full bg-blue-600 hover:bg-blue-700">
                  📋 Попросить задание
                </Button>
              )}
            </div>

            {/* Последние диалоги */}
            <div className="p-3 bg-slate-700 rounded">
              <h4 className="font-semibold mb-2">Возможные диалоги</h4>
              <div className="space-y-1 text-sm text-slate-300">
                {npc.dialogue.slice(0, 3).map((dialogue, index) => (
                  <div key={index}>
                    <strong>{dialogue.trigger}:</strong> "{dialogue.response}"
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="combat" className="space-y-4">
            {npc.relationship === "hostile" ? (
              <div className="space-y-4">
                <div className="p-4 bg-red-900 border border-red-600 rounded">
                  <div className="text-center">
                    <div className="text-2xl mb-2">⚔️</div>
                    <div className="font-bold text-red-300">Враждебный NPC готов к бою!</div>
                    <div className="text-sm text-red-400 mt-1">{npc.name} не настроен на мирные переговоры</div>
                  </div>
                </div>

                <Button onClick={onCombat} className="w-full bg-red-600 hover:bg-red-700" size="lg">
                  ⚔️ Начать бой!
                </Button>

                <div className="text-center text-sm text-slate-400">Победа принесет опыт и возможную добычу</div>
              </div>
            ) : (
              <div className="p-4 bg-slate-700 rounded text-center">
                <div className="text-slate-400">
                  {npc.name} не настроен враждебно.
                  <br />
                  Попробуйте мирное взаимодействие.
                </div>
              </div>
            )}

            {/* Сравнение сил */}
            {npc.stats && (
              <div className="p-3 bg-slate-700 rounded">
                <h4 className="font-semibold mb-2">Сравнение сил</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Ваш уровень:</span>
                    <span className="text-blue-400">{character.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Уровень противника:</span>
                    <span className="text-red-400">{npc.stats.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ваше здоровье:</span>
                    <span className="text-green-400">
                      {character.hp}/{character.maxHp}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Здоровье противника:</span>
                    <span className="text-red-400">{npc.stats.hp}</span>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
