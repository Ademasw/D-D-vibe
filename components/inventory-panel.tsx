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

  const weapons = inventory.filter((item) => item.type === "weapon")
  const armor = inventory.filter((item) => item.type === "armor")
  const consumables = inventory.filter((item) => item.type === "consumable")
  const tools = inventory.filter((item) => item.type === "tool")
  const treasures = inventory.filter((item) => item.type === "treasure")
  const misc = inventory.filter((item) => item.type === "misc")

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

  const getRarityIcon = (rarity: string) => {
    const icons = {
      common: "⚪",
      uncommon: "🟢",
      rare: "🔵",
      epic: "🟣",
      legendary: "🟠",
    }
    return icons[rarity as keyof typeof icons] || "⚪"
  }

  const getTypeIcon = (type: string) => {
    const icons = {
      weapon: "⚔️",
      armor: "🛡️",
      consumable: "🧪",
      tool: "🔧",
      treasure: "💎",
      misc: "📦",
    }
    return icons[type as keyof typeof icons] || "📦"
  }

  const totalWeight = inventory.reduce((sum, item) => sum + item.weight * item.quantity, 0)
  const totalValue = inventory.reduce((sum, item) => sum + item.value * item.quantity, 0)

  const ItemList = ({ items, emptyMessage }: { items: InventoryItem[]; emptyMessage: string }) => (
    <div className="space-y-2 max-h-80 overflow-y-auto">
      {items.map((item) => (
        <div
          key={item.id}
          className={`p-3 rounded border cursor-pointer transition-colors ${
            selectedItem?.id === item.id ? "border-blue-500 bg-slate-700" : "border-slate-600 hover:border-slate-500"
          }`}
          onClick={() => setSelectedItem(item)}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getTypeIcon(item.type)}</span>
              <div>
                <h3 className="font-semibold flex items-center gap-1">
                  {item.name}
                  <span className="text-sm">{getRarityIcon(item.rarity)}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {item.quantity > 1 && `Qty: ${item.quantity} • `}
                  Weight: {item.weight * item.quantity} lbs • Value: {item.value * item.quantity} gp
                </p>
              </div>
            </div>
            <Badge className={`${getRarityColor(item.rarity)} text-white text-xs`}>{item.rarity}</Badge>
          </div>
          <p className="text-sm text-slate-300 line-clamp-2">{item.description}</p>
        </div>
      ))}
      {items.length === 0 && <div className="text-center text-slate-400 py-8">{emptyMessage}</div>}
    </div>
  )

  return (
    <Card className="bg-slate-800 border-slate-700 text-white">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🎒 Inventory</span>
          <div className="flex gap-2 text-sm">
            <Badge className="bg-slate-600 text-white">{inventory.length} items</Badge>
            <Badge className="bg-yellow-600 text-white">{totalWeight} lbs</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Item Categories */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-slate-700 text-xs">
                <TabsTrigger value="all">All ({inventory.length})</TabsTrigger>
                <TabsTrigger value="weapons">⚔️ ({weapons.length})</TabsTrigger>
                <TabsTrigger value="armor">🛡️ ({armor.length})</TabsTrigger>
                <TabsTrigger value="consumables">🧪 ({consumables.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <ItemList items={inventory} emptyMessage="No items in inventory" />
              </TabsContent>

              <TabsContent value="weapons">
                <ItemList items={weapons} emptyMessage="No weapons" />
              </TabsContent>

              <TabsContent value="armor">
                <ItemList items={armor} emptyMessage="No armor" />
              </TabsContent>

              <TabsContent value="consumables">
                <ItemList items={consumables} emptyMessage="No consumables" />
              </TabsContent>
            </Tabs>
          </div>

          {/* Item Details */}
          <div className="space-y-4">
            {selectedItem ? (
              <div className="p-3 bg-slate-700 rounded">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{getTypeIcon(selectedItem.type)}</span>
                  <div>
                    <h3 className="font-bold flex items-center gap-1">
                      {selectedItem.name}
                      <span>{getRarityIcon(selectedItem.rarity)}</span>
                    </h3>
                    <Badge className={`${getRarityColor(selectedItem.rarity)} text-white text-xs`}>
                      {selectedItem.rarity}
                    </Badge>
                  </div>
                </div>

                <p className="text-sm text-slate-300 mb-3">{selectedItem.description}</p>

                {/* Item Stats */}
                {selectedItem.stats && (
                  <div className="mb-3">
                    <h4 className="text-sm font-semibold text-slate-400 mb-2">Stats:</h4>
                    <div className="text-sm text-slate-300 space-y-1">
                      {selectedItem.stats.damage && <div>⚔️ Damage: {selectedItem.stats.damage}</div>}
                      {selectedItem.stats.armor && <div>🛡️ AC: +{selectedItem.stats.armor}</div>}
                      {selectedItem.stats.bonus && <div>✨ Bonus: {selectedItem.stats.bonus}</div>}
                    </div>
                  </div>
                )}

                {/* Item Properties */}
                <div className="text-xs text-slate-400 space-y-1 mb-3">
                  <div>Type: {selectedItem.type}</div>
                  <div>Quantity: {selectedItem.quantity}</div>
                  <div>Weight: {selectedItem.weight} lbs each</div>
                  <div>Value: {selectedItem.value} gp each</div>
                  <div>Total Weight: {selectedItem.weight * selectedItem.quantity} lbs</div>
                  <div>Total Value: {selectedItem.value * selectedItem.quantity} gp</div>
                </div>

                {/* Use Item Button */}
                {selectedItem.type === "consumable" && onUseItem && (
                  <Button
                    onClick={() => onUseItem(selectedItem.id)}
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    Use Item
                  </Button>
                )}
              </div>
            ) : (
              <div className="p-3 bg-slate-700 rounded text-center text-slate-400">Select an item to view details</div>
            )}

            {/* Inventory Summary */}
            <div className="p-3 bg-slate-700 rounded text-sm">
              <h4 className="font-semibold mb-2">📊 Summary</h4>
              <div className="space-y-1 text-slate-300">
                <div>Total items: {inventory.length}</div>
                <div>Total weight: {totalWeight} lbs</div>
                <div>Total value: {totalValue} gp</div>
                <div>Current gold: {character.gold} gp</div>
              </div>
            </div>

            {/* Item Categories Summary */}
            <div className="p-3 bg-slate-700 rounded text-sm">
              <h4 className="font-semibold mb-2">📦 Categories</h4>
              <div className="space-y-1 text-slate-300">
                <div>⚔️ Weapons: {weapons.length}</div>
                <div>🛡️ Armor: {armor.length}</div>
                <div>🧪 Consumables: {consumables.length}</div>
                <div>🔧 Tools: {tools.length}</div>
                <div>💎 Treasures: {treasures.length}</div>
                <div>📦 Misc: {misc.length}</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
