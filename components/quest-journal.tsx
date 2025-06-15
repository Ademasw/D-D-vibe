"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import type { Quest } from "@/lib/types"

interface QuestJournalProps {
  quests: Quest[]
  onAbandonQuest?: (questId: string) => void
}

export function QuestJournal({ quests, onAbandonQuest }: QuestJournalProps) {
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null)

  const activeQuests = quests.filter((q) => q.status === "active")
  const completedQuests = quests.filter((q) => q.status === "completed")
  const failedQuests = quests.filter((q) => q.status === "failed")

  const getStatusColor = (status: string) => {
    const colors = {
      active: "bg-blue-600",
      completed: "bg-green-600",
      failed: "bg-red-600",
    }
    return colors[status as keyof typeof colors] || "bg-gray-600"
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      active: "⏳",
      completed: "✅",
      failed: "❌",
    }
    return icons[status as keyof typeof icons] || "📋"
  }

  const getQuestProgress = (quest: Quest) => {
    const completed = quest.objectives.filter((obj) => obj.completed).length
    const total = quest.objectives.length
    return { completed, total, percentage: total > 0 ? (completed / total) * 100 : 0 }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <Card className="bg-slate-800 border-slate-700 text-white">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>📋 Журнал квестов</span>
          <div className="flex gap-2 text-sm">
            <Badge className="bg-blue-600 text-white">{activeQuests.length} активных</Badge>
            <Badge className="bg-green-600 text-white">{completedQuests.length} выполнено</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Список квестов */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-slate-700">
                <TabsTrigger value="active">Активные ({activeQuests.length})</TabsTrigger>
                <TabsTrigger value="completed">Выполненные ({completedQuests.length})</TabsTrigger>
                <TabsTrigger value="failed">Провалены ({failedQuests.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="space-y-2 max-h-80 overflow-y-auto">
                {activeQuests.map((quest) => {
                  const progress = getQuestProgress(quest)
                  return (
                    <div
                      key={quest.id}
                      className={`p-3 rounded border cursor-pointer transition-colors ${
                        selectedQuest?.id === quest.id
                          ? "border-blue-500 bg-slate-700"
                          : "border-slate-600 hover:border-slate-500"
                      }`}
                      onClick={() => setSelectedQuest(quest)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getStatusIcon(quest.status)}</span>
                          <div>
                            <h3 className="font-semibold">{quest.title}</h3>
                            <p className="text-xs text-slate-400">
                              {quest.giver && `От: ${quest.giver}`}
                              {quest.location && ` • ${quest.location}`}
                            </p>
                          </div>
                        </div>
                        <Badge className={`${getStatusColor(quest.status)} text-white text-xs`}>{quest.status}</Badge>
                      </div>

                      <div className="mb-2">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Прогресс</span>
                          <span>
                            {progress.completed}/{progress.total}
                          </span>
                        </div>
                        <Progress value={progress.percentage} className="h-2" />
                      </div>

                      <p className="text-sm text-slate-300 line-clamp-2">{quest.description}</p>
                    </div>
                  )
                })}
                {activeQuests.length === 0 && (
                  <div className="text-center text-slate-400 py-8">Нет активных квестов</div>
                )}
              </TabsContent>

              <TabsContent value="completed" className="space-y-2 max-h-80 overflow-y-auto">
                {completedQuests.map((quest) => (
                  <div
                    key={quest.id}
                    className={`p-3 rounded border cursor-pointer transition-colors ${
                      selectedQuest?.id === quest.id
                        ? "border-green-500 bg-slate-700"
                        : "border-slate-600 hover:border-slate-500"
                    }`}
                    onClick={() => setSelectedQuest(quest)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getStatusIcon(quest.status)}</span>
                        <div>
                          <h3 className="font-semibold">{quest.title}</h3>
                          <p className="text-xs text-slate-400">
                            Выполнено: {quest.completedAt && formatDate(quest.completedAt)}
                          </p>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(quest.status)} text-white text-xs`}>{quest.status}</Badge>
                    </div>
                    <p className="text-sm text-slate-300 line-clamp-2">{quest.description}</p>
                  </div>
                ))}
                {completedQuests.length === 0 && (
                  <div className="text-center text-slate-400 py-8">Нет выполненных квестов</div>
                )}
              </TabsContent>

              <TabsContent value="failed" className="space-y-2 max-h-80 overflow-y-auto">
                {failedQuests.map((quest) => (
                  <div
                    key={quest.id}
                    className={`p-3 rounded border cursor-pointer transition-colors ${
                      selectedQuest?.id === quest.id
                        ? "border-red-500 bg-slate-700"
                        : "border-slate-600 hover:border-slate-500"
                    }`}
                    onClick={() => setSelectedQuest(quest)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getStatusIcon(quest.status)}</span>
                        <div>
                          <h3 className="font-semibold text-red-400">{quest.title}</h3>
                          <p className="text-xs text-slate-400">{quest.giver && `От: ${quest.giver}`}</p>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(quest.status)} text-white text-xs`}>{quest.status}</Badge>
                    </div>
                    <p className="text-sm text-slate-300 line-clamp-2">{quest.description}</p>
                  </div>
                ))}
                {failedQuests.length === 0 && (
                  <div className="text-center text-slate-400 py-8">Нет проваленных квестов</div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Детали квеста */}
          <div className="space-y-4">
            {selectedQuest ? (
              <div className="p-3 bg-slate-700 rounded">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{getStatusIcon(selectedQuest.status)}</span>
                  <div>
                    <h3 className="font-bold">{selectedQuest.title}</h3>
                    <Badge className={`${getStatusColor(selectedQuest.status)} text-white text-xs`}>
                      {selectedQuest.status}
                    </Badge>
                  </div>
                </div>

                <p className="text-sm text-slate-300 mb-3">{selectedQuest.description}</p>

                {/* Цели квеста */}
                <div className="mb-3">
                  <h4 className="text-sm font-semibold text-slate-400 mb-2">Цели:</h4>
                  <div className="space-y-1">
                    {selectedQuest.objectives.map((objective) => (
                      <div key={objective.id} className="flex items-center gap-2 text-sm">
                        <span className={objective.completed ? "text-green-400" : "text-slate-400"}>
                          {objective.completed ? "✅" : "⭕"}
                        </span>
                        <span className={objective.completed ? "line-through text-slate-400" : "text-slate-300"}>
                          {objective.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Награда */}
                {selectedQuest.reward && (
                  <div className="mb-3">
                    <h4 className="text-sm font-semibold text-slate-400 mb-2">Награда:</h4>
                    <div className="text-sm text-slate-300 space-y-1">
                      {selectedQuest.reward.gold && <div>💰 {selectedQuest.reward.gold} золота</div>}
                      {selectedQuest.reward.experience && <div>⭐ {selectedQuest.reward.experience} опыта</div>}
                      {selectedQuest.reward.items && selectedQuest.reward.items.length > 0 && (
                        <div>🎁 {selectedQuest.reward.items.length} предмет(ов)</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Информация */}
                <div className="text-xs text-slate-400 space-y-1">
                  {selectedQuest.giver && <div>Квестодатель: {selectedQuest.giver}</div>}
                  {selectedQuest.location && <div>Локация: {selectedQuest.location}</div>}
                  <div>Получен: {formatDate(selectedQuest.createdAt)}</div>
                  {selectedQuest.completedAt && <div>Выполнен: {formatDate(selectedQuest.completedAt)}</div>}
                </div>

                {selectedQuest.status === "active" && onAbandonQuest && (
                  <Button
                    onClick={() => onAbandonQuest(selectedQuest.id)}
                    className="w-full mt-3 bg-red-600 hover:bg-red-700"
                    size="sm"
                  >
                    Отказаться от квеста
                  </Button>
                )}
              </div>
            ) : (
              <div className="p-3 bg-slate-700 rounded text-center text-slate-400">
                Выберите квест для просмотра деталей
              </div>
            )}

            {/* Статистика */}
            <div className="p-3 bg-slate-700 rounded text-sm">
              <h4 className="font-semibold mb-2">📊 Статистика</h4>
              <div className="space-y-1 text-slate-300">
                <div>Всего квестов: {quests.length}</div>
                <div>Активных: {activeQuests.length}</div>
                <div>Выполнено: {completedQuests.length}</div>
                <div>Провалено: {failedQuests.length}</div>
                {completedQuests.length > 0 && (
                  <div>
                    Успешность:{" "}
                    {Math.round((completedQuests.length / (completedQuests.length + failedQuests.length)) * 100)}%
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
