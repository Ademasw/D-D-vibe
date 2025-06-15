"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Location } from "@/lib/types"
import { WORLD_LOCATIONS } from "@/lib/game-data"

interface WorldMapProps {
  visitedLocations: string[]
  currentLocation: string
  onLocationSelect?: (locationId: string) => void
}

export function WorldMap({ visitedLocations, currentLocation, onLocationSelect }: WorldMapProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null)

  const getLocationTypeColor = (type: string) => {
    const colors = {
      town: "bg-blue-600",
      dungeon: "bg-red-600",
      wilderness: "bg-green-600",
      landmark: "bg-purple-600",
    }
    return colors[type as keyof typeof colors] || "bg-gray-600"
  }

  const getLocationTypeIcon = (type: string) => {
    const icons = {
      town: "🏘️",
      dungeon: "🏰",
      wilderness: "🌲",
      landmark: "⛪",
    }
    return icons[type as keyof typeof icons] || "📍"
  }

  const isLocationDiscovered = (locationId: string) => {
    return visitedLocations.includes(locationId) || WORLD_LOCATIONS.find((l) => l.id === locationId)?.discovered
  }

  const canTravelTo = (location: Location) => {
    if (!isLocationDiscovered(location.id)) return false

    // Можно путешествовать если локация связана с текущей
    const currentLoc = WORLD_LOCATIONS.find((l) => l.id === currentLocation)
    return currentLoc?.connections.includes(location.id) || location.id === currentLocation
  }

  return (
    <Card className="bg-slate-800 border-slate-700 text-white">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🗺️ Карта мира</span>
          <Badge className="bg-blue-600 text-white">
            {WORLD_LOCATIONS.find((l) => l.id === currentLocation)?.name || "Неизвестно"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Карта */}
          <div className="lg:col-span-2">
            <div
              className="relative bg-slate-900 rounded-lg border border-slate-600 overflow-hidden"
              style={{ height: "400px" }}
            >
              {/* SVG карта */}
              <svg width="100%" height="100%" viewBox="0 0 400 300" className="absolute inset-0">
                {/* Фон карты */}
                <defs>
                  <pattern id="mapGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#374151" strokeWidth="0.5" opacity="0.3" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#mapGrid)" />

                {/* Соединения между локациями */}
                {WORLD_LOCATIONS.map((location) =>
                  location.connections.map((connectionId) => {
                    const connectedLocation = WORLD_LOCATIONS.find((l) => l.id === connectionId)
                    if (!connectedLocation || !isLocationDiscovered(location.id) || !isLocationDiscovered(connectionId))
                      return null

                    return (
                      <line
                        key={`${location.id}-${connectionId}`}
                        x1={location.x}
                        y1={location.y}
                        x2={connectedLocation.x}
                        y2={connectedLocation.y}
                        stroke="#64748b"
                        strokeWidth="2"
                        strokeDasharray={
                          visitedLocations.includes(location.id) && visitedLocations.includes(connectionId)
                            ? "none"
                            : "5,5"
                        }
                        opacity="0.6"
                      />
                    )
                  }),
                )}

                {/* Локации */}
                {WORLD_LOCATIONS.map((location) => {
                  const discovered = isLocationDiscovered(location.id)
                  const isCurrent = location.id === currentLocation
                  const isHovered = hoveredLocation === location.id
                  const canTravel = canTravelTo(location)

                  if (!discovered) return null

                  return (
                    <g key={location.id}>
                      {/* Подсветка текущей локации */}
                      {isCurrent && (
                        <circle
                          cx={location.x}
                          cy={location.y}
                          r="20"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="3"
                          opacity="0.8"
                        >
                          <animate attributeName="r" values="15;25;15" dur="2s" repeatCount="indefinite" />
                        </circle>
                      )}

                      {/* Иконка локации */}
                      <circle
                        cx={location.x}
                        cy={location.y}
                        r="12"
                        fill={isCurrent ? "#3b82f6" : canTravel ? "#10b981" : "#6b7280"}
                        stroke={isHovered ? "#f59e0b" : "#374151"}
                        strokeWidth="2"
                        className="cursor-pointer transition-all"
                        onMouseEnter={() => setHoveredLocation(location.id)}
                        onMouseLeave={() => setHoveredLocation(null)}
                        onClick={() => {
                          setSelectedLocation(location)
                          if (canTravel && onLocationSelect) {
                            onLocationSelect(location.id)
                          }
                        }}
                      />

                      {/* Название локации */}
                      <text
                        x={location.x}
                        y={location.y + 25}
                        textAnchor="middle"
                        className="text-xs fill-slate-300 pointer-events-none"
                        fontSize="10"
                      >
                        {location.name.length > 15 ? location.name.substring(0, 15) + "..." : location.name}
                      </text>
                    </g>
                  )
                })}
              </svg>
            </div>

            {/* Легенда */}
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <Badge className="bg-blue-600 text-white">🏘️ Город</Badge>
              <Badge className="bg-red-600 text-white">🏰 Подземелье</Badge>
              <Badge className="bg-green-600 text-white">🌲 Дикие земли</Badge>
              <Badge className="bg-purple-600 text-white">⛪ Достопримечательность</Badge>
            </div>
          </div>

          {/* Информация о локации */}
          <div className="space-y-4">
            {selectedLocation ? (
              <div className="p-3 bg-slate-700 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{getLocationTypeIcon(selectedLocation.type)}</span>
                  <div>
                    <h3 className="font-bold">{selectedLocation.name}</h3>
                    <Badge className={`${getLocationTypeColor(selectedLocation.type)} text-white text-xs`}>
                      {selectedLocation.type}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-slate-300 mb-3">{selectedLocation.description}</p>

                {selectedLocation.connections.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-xs font-semibold text-slate-400 mb-1">Соединения:</h4>
                    <div className="space-y-1">
                      {selectedLocation.connections.map((connectionId) => {
                        const connectedLocation = WORLD_LOCATIONS.find((l) => l.id === connectionId)
                        const discovered = isLocationDiscovered(connectionId)
                        return (
                          <div key={connectionId} className="text-xs text-slate-300">
                            {discovered ? connectedLocation?.name : "Неизвестная локация"}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {canTravelTo(selectedLocation) && selectedLocation.id !== currentLocation && onLocationSelect && (
                  <Button
                    onClick={() => onLocationSelect(selectedLocation.id)}
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    Отправиться сюда
                  </Button>
                )}

                {selectedLocation.id === currentLocation && (
                  <Badge className="w-full justify-center bg-blue-600 text-white">Текущая локация</Badge>
                )}
              </div>
            ) : (
              <div className="p-3 bg-slate-700 rounded text-center text-slate-400">
                Нажмите на локацию для просмотра информации
              </div>
            )}

            {/* Статистика исследования */}
            <div className="p-3 bg-slate-700 rounded text-sm">
              <h4 className="font-semibold mb-2">🧭 Исследование</h4>
              <div className="space-y-1 text-slate-300">
                <div>
                  Открыто локаций: {visitedLocations.length + WORLD_LOCATIONS.filter((l) => l.discovered).length}/
                  {WORLD_LOCATIONS.length}
                </div>
                <div>Текущая локация: {WORLD_LOCATIONS.find((l) => l.id === currentLocation)?.name}</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
