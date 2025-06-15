"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  generateBalancedStats,
  getTotalPointCost,
  getStatCost,
  getClassBaseStats,
  getClassRecommendations,
  getClassDescription,
  STAT_NAMES,
  STAT_DESCRIPTIONS,
  MAX_POINT_BUY_POINTS,
  MIN_STAT_VALUE,
  MAX_STAT_VALUE,
} from "@/lib/character-generator"

const CHARACTER_CLASSES = [
  { value: "Fighter", label: "Fighter" },
  { value: "Wizard", label: "Wizard" },
  { value: "Rogue", label: "Rogue" },
  { value: "Cleric", label: "Cleric" },
  { value: "Ranger", label: "Ranger" },
  { value: "Barbarian", label: "Barbarian" },
  { value: "Bard", label: "Bard" },
  { value: "Paladin", label: "Paladin" },
]

export default function HomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [statMethod, setStatMethod] = useState<"class" | "pointbuy" | "random">("class")
  const [selectedStat, setSelectedStat] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    charClass: "Fighter",
    stats: getClassBaseStats("Fighter"),
  })

  const totalPointsUsed = getTotalPointCost(formData.stats)
  const remainingPoints = MAX_POINT_BUY_POINTS - totalPointsUsed
  const recommendations = getClassRecommendations(formData.charClass)

  const handleClassChange = (newClass: string) => {
    setFormData((prev) => ({
      ...prev,
      charClass: newClass,
      stats: statMethod === "class" ? getClassBaseStats(newClass) : prev.stats,
    }))
  }

  const handleStatMethodChange = (method: "class" | "pointbuy" | "random") => {
    setStatMethod(method)

    if (method === "class") {
      setFormData((prev) => ({
        ...prev,
        stats: getClassBaseStats(prev.charClass),
      }))
    } else if (method === "pointbuy") {
      setFormData((prev) => ({
        ...prev,
        stats: {
          STR: 8,
          DEX: 8,
          CON: 8,
          INT: 8,
          WIS: 8,
          CHA: 8,
        },
      }))
    } else if (method === "random") {
      setFormData((prev) => ({
        ...prev,
        stats: generateBalancedStats(),
      }))
    }
  }

  const handleStatChange = (stat: string, value: string) => {
    const numValue = Math.max(MIN_STAT_VALUE, Math.min(MAX_STAT_VALUE, Number.parseInt(value) || MIN_STAT_VALUE))

    const newStats = {
      ...formData.stats,
      [stat]: numValue,
    }

    // Check if we don't exceed point limit for point buy
    if (statMethod === "pointbuy" && getTotalPointCost(newStats) <= MAX_POINT_BUY_POINTS) {
      setFormData((prev) => ({
        ...prev,
        stats: newStats,
      }))
    } else if (statMethod !== "pointbuy") {
      setFormData((prev) => ({
        ...prev,
        stats: newStats,
      }))
    }
  }

  const getStatColor = (stat: string) => {
    if (recommendations.primary.includes(stat)) return "text-green-400 font-bold"
    if (recommendations.secondary.includes(stat)) return "text-yellow-400"
    if (recommendations.dump.includes(stat)) return "text-red-400"
    return "text-slate-300"
  }

  const getStatIcon = (stat: string) => {
    if (recommendations.primary.includes(stat)) return "⭐"
    if (recommendations.secondary.includes(stat)) return "🔸"
    if (recommendations.dump.includes(stat)) return "🔻"
    return ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert("Please enter a character name")
      return
    }

    if (statMethod === "pointbuy" && remainingPoints < 0) {
      alert("Ability score point limit exceeded!")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/start-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Session creation error")
      }

      const data = await response.json()
      router.push(`/game?sessionId=${data.sessionId}`)
    } catch (error) {
      console.error("Error:", error)
      alert("Character creation error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-5xl bg-slate-800 border-slate-700 text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            🐉 D&D AI Dungeon Master
          </CardTitle>
          <p className="text-slate-300 mt-2">Create your character and embark on an adventure!</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Character Name */}
            <div>
              <Label htmlFor="name" className="text-slate-200">
                Character Name
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your hero's name"
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                required
              />
            </div>

            {/* Character Class */}
            <div>
              <Label htmlFor="charClass" className="text-slate-200">
                Character Class
              </Label>
              <select
                id="charClass"
                value={formData.charClass}
                onChange={(e) => handleClassChange(e.target.value)}
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
              >
                {CHARACTER_CLASSES.map((cls) => (
                  <option key={cls.value} value={cls.value}>
                    {cls.label}
                  </option>
                ))}
              </select>

              {/* Class Description */}
              <div className="mt-2 p-3 bg-slate-700 rounded text-sm text-slate-300">
                {getClassDescription(formData.charClass)}
              </div>
            </div>

            {/* Stat Generation Method */}
            <div>
              <Label className="text-slate-200 mb-3 block">Ability Score Generation Method</Label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <Button
                  type="button"
                  onClick={() => handleStatMethodChange("class")}
                  className={`h-auto p-4 flex flex-col items-center transition-all ${
                    statMethod === "class"
                      ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-500"
                      : "bg-slate-700 hover:bg-slate-600 text-slate-200 border-slate-600"
                  }`}
                  variant="outline"
                >
                  <span className="text-lg mb-1">🎯</span>
                  <span className="font-semibold">Class Stats</span>
                  <span className="text-xs opacity-75">Optimized for class</span>
                </Button>

                <Button
                  type="button"
                  onClick={() => handleStatMethodChange("pointbuy")}
                  className={`h-auto p-4 flex flex-col items-center transition-all ${
                    statMethod === "pointbuy"
                      ? "bg-green-600 hover:bg-green-700 text-white border-green-500"
                      : "bg-slate-700 hover:bg-slate-600 text-slate-200 border-slate-600"
                  }`}
                  variant="outline"
                >
                  <span className="text-lg mb-1">⚖️</span>
                  <span className="font-semibold">Point Buy</span>
                  <span className="text-xs opacity-75">11 points to distribute</span>
                </Button>

                <Button
                  type="button"
                  onClick={() => handleStatMethodChange("random")}
                  className={`h-auto p-4 flex flex-col items-center transition-all ${
                    statMethod === "random"
                      ? "bg-purple-600 hover:bg-purple-700 text-white border-purple-500"
                      : "bg-slate-700 hover:bg-slate-600 text-slate-200 border-slate-600"
                  }`}
                  variant="outline"
                >
                  <span className="text-lg mb-1">🎲</span>
                  <span className="font-semibold">Random Generation</span>
                  <span className="text-xs opacity-75">4d6, drop lowest</span>
                </Button>
              </div>

              {/* Method Information */}
              {statMethod === "pointbuy" && (
                <div className="mb-3 p-3 bg-slate-700 rounded text-sm">
                  <div className="flex justify-between items-center">
                    <span className={remainingPoints < 0 ? "text-red-400" : "text-green-400"}>
                      Points remaining: {remainingPoints} / {MAX_POINT_BUY_POINTS}
                    </span>
                    <span className="text-slate-400">Cost: 8=0, 9=1, 10=2, 11=3, 12=4, 13=5, 14=7, 15=9</span>
                  </div>
                </div>
              )}

              {/* Class Recommendations */}
              <div className="mb-4 p-3 bg-slate-700 rounded">
                <h4 className="font-semibold mb-2">Recommendations for {formData.charClass}:</h4>
                <div className="flex flex-wrap gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <span>⭐ Primary:</span>
                    {recommendations.primary.map((stat) => (
                      <Badge key={stat} className="bg-green-600 text-white">
                        {STAT_NAMES[stat]}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    <span>🔸 Important:</span>
                    {recommendations.secondary.map((stat) => (
                      <Badge key={stat} className="bg-yellow-600 text-white">
                        {STAT_NAMES[stat]}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    <span>🔻 Can dump:</span>
                    {recommendations.dump.map((stat) => (
                      <Badge key={stat} className="bg-red-600 text-white">
                        {STAT_NAMES[stat]}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ability Scores */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(formData.stats).map(([stat, value]) => (
                  <div key={stat} className="space-y-2">
                    <Label
                      htmlFor={stat}
                      className={`text-sm flex items-center gap-1 cursor-pointer ${getStatColor(stat)}`}
                      onClick={() => setSelectedStat(selectedStat === stat ? null : stat)}
                    >
                      <span>{getStatIcon(stat)}</span>
                      <span className="font-semibold">{STAT_NAMES[stat]}</span>
                      {statMethod === "pointbuy" && (
                        <span className="text-xs text-slate-400">(cost: {getStatCost(value)})</span>
                      )}
                    </Label>
                    <div className="relative">
                      <Input
                        id={stat}
                        type="number"
                        min={statMethod === "pointbuy" ? MIN_STAT_VALUE : 3}
                        max={statMethod === "pointbuy" ? MAX_STAT_VALUE : 18}
                        value={value}
                        onChange={(e) => handleStatChange(stat, e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white text-center font-bold"
                        disabled={statMethod === "class"}
                      />
                      {/* Modifier */}
                      <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs text-slate-400">
                        {Math.floor((value - 10) / 2) >= 0 ? "+" : ""}
                        {Math.floor((value - 10) / 2)}
                      </div>
                    </div>

                    {/* Selected Stat Description */}
                    {selectedStat === stat && (
                      <div className="mt-2 p-2 bg-slate-600 rounded text-xs text-slate-300">
                        {STAT_DESCRIPTIONS[stat]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-700 rounded">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-400">{10 + Math.floor((formData.stats.CON - 10) / 2)}</div>
                <div className="text-sm text-slate-400">Starting HP</div>
                <div className="text-xs text-slate-500">Base + Constitution modifier</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-400">{10 + Math.floor((formData.stats.DEX - 10) / 2)}</div>
                <div className="text-sm text-slate-400">Armor Class</div>
                <div className="text-xs text-slate-500">10 + Dexterity modifier</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-400">100</div>
                <div className="text-sm text-slate-400">Starting Gold</div>
                <div className="text-xs text-slate-500">For buying equipment</div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || (statMethod === "pointbuy" && remainingPoints < 0)}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-3"
            >
              {loading ? "Creating Character..." : "⚔️ Start Adventure!"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
