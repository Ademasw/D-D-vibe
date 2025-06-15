"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { InventoryItem, Character } from "@/lib/types"

interface InventoryPanelProps {
  inventory: InventoryItem[]
  character: Character
  onUseItem?: (itemId: string) => void
}

export function InventoryPanel({ inventory, character, onUseItem }: InventoryPanelProps) {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: "bg-gray-600",
      uncommon: "bg-green-600",
      rare: "bg-blue-600",
      epic: "bg-purple-600",
      legendary: "bg-orange-600",
    }
    return colors[rarity as keyof typeof colors] || "bg-gray-600"
  }

  const getTypeIcon = (type: string) => {
    const icons = {
      weapon: "⚔️",
      armor: "🛡️",
      consumable: "🧪",
      treasure: "💎",
      tool: "🔧",
      misc: "📦",
    }
    return icons[type as keyof typeof icons] || "📦"
  }

  const groupedItems = inventory.reduce(
    (acc, item) => {
      if (!acc[item.type]) acc[item.type] = []
      acc[item.type].push(item)
      return acc
    },
    {} as Record<string, InventoryItem[]>,
  )

  const totalWeight = inventory.reduce((sum, item) => sum + item.weight * item.quantity, 0)
  const totalValue = inventory.reduce((sum, item) => sum + item.value * item.quantity, 0)

  return (
    <Card className="bg-slate-800 border-slate-700 text-white">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🎒 Инвентарь</span>
          <div className="text-sm font-normal">
            <span className="text-yellow-400">💰 {character.gold} золота</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Список предметов */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-slate-700">
                <TabsTrigger value="all">Все</TabsTrigger>
                <TabsTrigger value="weapon">⚔️</TabsTrigger>
                <TabsTrigger value="armor">🛡️</TabsTrigger>
                <TabsTrigger value="consumable">🧪</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-2 max-h-64 overflow-y-auto">
                {inventory.map((item) => (
                  <div
                    key={item.id}
                    className={`p-2 rounded border cursor-pointer transition-colors ${
                      selectedItem?.id === item.id
                        ? "border-blue-500 bg-slate-700"
                        : "border-slate-600 hover:border-slate-500"
                    }`}
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getTypeIcon(item.type)}</span>
                        <div>
                          <div className="font-semibold">{item.name}</div>
                          <div className="text-xs text-slate-400">
                            {item.quantity > 1 && `x${item.quantity} • `}
                            {item.weight}кг • {item.value}зм
                          </div>
                        </div>
                      </div>
                      <Badge className={`${getRarityColor(item.rarity)} text-white text-xs`}>{item.rarity}</Badge>
                    </div>
                  </div>
                ))}
                {inventory.length === 0 && <div className="text-center text-slate-400 py-8">Инвентарь пуст</div>}
              </TabsContent>

              {Object.entries(groupedItems).map(([type, items]) => (
                <TabsContent key={type} value={type} className="space-y-2 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`p-2 rounded border cursor-pointer transition-colors ${
                        selectedItem?.id === item.id
                          ? "border-blue-500 bg-slate-700"
                          : "border-slate-600 hover:border-slate-500"
                      }`}
                      onClick={() => setSelectedItem(item)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getTypeIcon(item.type)}</span>
                          <div>
                            <div className="font-semibold">{item.name}</div>
                            <div className="text-xs text-slate-400">
                              {item.quantity > 1 && `x${item.quantity} • `}
                              {item.weight}кг • {item.value}зм
                            </div>
                          </div>
                        </div>
                        <Badge className={`${getRarityColor(item.rarity)} text-white text-xs`}>{item.rarity}</Badge>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Детали предмета */}
          <div className="space-y-4">
            {selectedItem ? (
              <div className="p-3 bg-slate-700 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{getTypeIcon(selectedItem.type)}</span>
                  <div>
                    <h3 className="font-bold">{selectedItem.name}</h3>
                    <Badge className={`${getRarityColor(selectedItem.rarity)} text-white text-xs`}>
                      {selectedItem.rarity}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-slate-300 mb-3">{selectedItem.description}</p>
                <div className="space-y-1 text-xs text-slate-400">
                  <div>Тип: {selectedItem.type}</div>
                  <div>Количество: {selectedItem.quantity}</div>
                  <div>Вес: {selectedItem.weight} кг</div>
                  <div>Стоимость: {selectedItem.value} зм</div>
                </div>
                {selectedItem.type === "consumable" && onUseItem && (
                  <Button
                    onClick={() => onUseItem(selectedItem.id)}
                    className="w-full mt-3 bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    Использовать
                  </Button>
                )}
              </div>
            ) : (
              <div className="p-3 bg-slate-700 rounded text-center text-slate-400">
                Выберите предмет для просмотра деталей
              </div>
            )}

            {/* Статистика */}
            <div className="p-3 bg-slate-700 rounded text-sm">
              <h4 className="font-semibold mb-2">📊 Статистика</h4>
              <div className="space-y-1 text-slate-300">
                <div>Предметов: {inventory.length}</div>
                <div>Общий вес: {totalWeight.toFixed(1)} кг</div>
                <div>Общая стоимость: {totalValue} зм</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
