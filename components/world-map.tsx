"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { WORLD_LOCATIONS } from "@/lib/game-data"
import type { Location } from "@/lib/types"

interface WorldMapProps {
  visitedLocations: string[]
  currentLocation: string
  onLocationSelect?: (locationId: string) => void
}

export function WorldMap({ visitedLocations, currentLocation, onLocationSelect }: WorldMapProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)

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
      landmark: "⛰️",
    }
    return icons[type as keyof typeof icons] || "📍"
  }

  const isLocationAccessible = (location: Location) => {
    // A location is accessible if it's discovered or connected to a visited location
    if (visitedLocations.includes(location.id)) return true
    return location.connections.some((connectionId) => visitedLocations.includes(connectionId))
  }

  const discoveredLocations = WORLD_LOCATIONS.filter((loc) => visitedLocations.includes(loc.id))
  const accessibleLocations = WORLD_LOCATIONS.filter(
    (loc) => isLocationAccessible(loc) && !visitedLocations.includes(loc.id),
  )
  const unknownLocations = WORLD_LOCATIONS.filter((loc) => !isLocationAccessible(loc))

  return (
    <Card className="bg-slate-800 border-slate-700 text-white">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🗺️ World Map</span>
          <div className="flex gap-2 text-sm">
            <Badge className="bg-green-600 text-white">{discoveredLocations.length} discovered</Badge>
            <Badge className="bg-yellow-600 text-white">{accessibleLocations.length} accessible</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Map Visualization */}
          <div className="lg:col-span-2">
            <div className="relative bg-slate-700 rounded-lg p-4 h-96 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-600 to-slate-800 opacity-50"></div>

              {/* Location Markers */}
              {WORLD_LOCATIONS.map((location) => {
                const isVisited = visitedLocations.includes(location.id)
                const isCurrent = currentLocation === location.id
                const isAccessible = isLocationAccessible(location)

                return (
                  <div
                    key={location.id}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all hover:scale-110 ${
                      isCurrent ? "z-20 scale-125" : isVisited ? "z-10" : isAccessible ? "z-5" : "z-0"
                    }`}
                    style={{
                      left: `${(location.x / 400) * 100}%`,
                      top: `${(location.y / 300) * 100}%`,
                    }}
                    onClick={() => {
                      setSelectedLocation(location)
                      if (isAccessible && onLocationSelect) {
                        onLocationSelect(location.id)
                      }
                    }}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-lg border-2 ${
                        isCurrent
                          ? "bg-yellow-500 border-yellow-300 animate-pulse"
                          : isVisited
                            ? "bg-green-600 border-green-400"
                            : isAccessible
                              ? "bg-blue-600 border-blue-400"
                              : "bg-gray-600 border-gray-500 opacity-50"
                      }`}
                    >
                      {getLocationTypeIcon(location.type)}
                    </div>

                    {/* Location Name */}
                    <div
                      className={`absolute top-10 left-1/2 transform -translate-x-1/2 text-xs whitespace-nowrap ${
                        isVisited ? "text-white" : isAccessible ? "text-slate-300" : "text-slate-500"
                      }`}
                    >
                      {isVisited || isAccessible ? location.name : "???"}
                    </div>
                  </div>
                )
              })}

              {/* Connection Lines */}
              {WORLD_LOCATIONS.map((location) => {
                if (!visitedLocations.includes(location.id)) return null

                return location.connections.map((connectionId) => {
                  const connectedLocation = WORLD_LOCATIONS.find((loc) => loc.id === connectionId)
                  if (!connectedLocation || !visitedLocations.includes(connectionId)) return null

                  return (
                    <svg
                      key={`${location.id}-${connectionId}`}
                      className="absolute inset-0 pointer-events-none"
                      style={{ width: "100%", height: "100%" }}
                    >
                      <line
                        x1={`${(location.x / 400) * 100}%`}
                        y1={`${(location.y / 300) * 100}%`}
                        x2={`${(connectedLocation.x / 400) * 100}%`}
                        y2={`${(connectedLocation.y / 300) * 100}%`}
                        stroke="rgba(148, 163, 184, 0.3)"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                      />
                    </svg>
                  )
                })
              })}
            </div>

            {/* Map Legend */}
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Current Location</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                <span>Visited</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <span>Accessible</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-600 rounded-full opacity-50"></div>
                <span>Unknown</span>
              </div>
            </div>
          </div>

          {/* Location Details */}
          <div className="space-y-4">
            {selectedLocation ? (
              <div className="p-3 bg-slate-700 rounded">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{getLocationTypeIcon(selectedLocation.type)}</span>
                  <div>
                    <h3 className="font-bold">{selectedLocation.name}</h3>
                    <Badge className={`${getLocationTypeColor(selectedLocation.type)} text-white text-xs`}>
                      {selectedLocation.type}
                    </Badge>
                  </div>
                </div>

                <p className="text-sm text-slate-300 mb-3">{selectedLocation.description}</p>

                {/* Location Status */}
                <div className="mb-3">
                  <h4 className="text-sm font-semibold text-slate-400 mb-2">Status:</h4>
                  <div className="text-sm text-slate-300">
                    {currentLocation === selectedLocation.id && (
                      <div className="text-yellow-400">📍 Current Location</div>
                    )}
                    {visitedLocations.includes(selectedLocation.id) && currentLocation !== selectedLocation.id && (
                      <div className="text-green-400">✅ Visited</div>
                    )}
                    {!visitedLocations.includes(selectedLocation.id) && isLocationAccessible(selectedLocation) && (
                      <div className="text-blue-400">🔓 Accessible</div>
                    )}
                    {!isLocationAccessible(selectedLocation) && <div className="text-gray-400">🔒 Unknown</div>}
                  </div>
                </div>

                {/* Connected Locations */}
                <div className="mb-3">
                  <h4 className="text-sm font-semibold text-slate-400 mb-2">Connections:</h4>
                  <div className="space-y-1">
                    {selectedLocation.connections.map((connectionId) => {
                      const connectedLocation = WORLD_LOCATIONS.find((loc) => loc.id === connectionId)
                      if (!connectedLocation) return null

                      const isConnectedVisited = visitedLocations.includes(connectionId)

                      return (
                        <div key={connectionId} className="text-sm flex items-center gap-2">
                          <span className={isConnectedVisited ? "text-green-400" : "text-slate-400"}>
                            {getLocationTypeIcon(connectedLocation.type)}
                          </span>
                          <span className={isConnectedVisited ? "text-slate-300" : "text-slate-500"}>
                            {isConnectedVisited ? connectedLocation.name : "???"}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Travel Button */}
                {isLocationAccessible(selectedLocation) &&
                  currentLocation !== selectedLocation.id &&
                  onLocationSelect && (
                    <Button
                      onClick={() => onLocationSelect(selectedLocation.id)}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      size="sm"
                    >
                      Travel Here
                    </Button>
                  )}
              </div>
            ) : (
              <div className="p-3 bg-slate-700 rounded text-center text-slate-400">
                Click on a location to view details
              </div>
            )}

            {/* Travel Statistics */}
            <div className="p-3 bg-slate-700 rounded text-sm">
              <h4 className="font-semibold mb-2">🗺️ Exploration</h4>
              <div className="space-y-1 text-slate-300">
                <div>
                  Discovered: {discoveredLocations.length}/{WORLD_LOCATIONS.length}
                </div>
                <div>Accessible: {accessibleLocations.length}</div>
                <div>Unknown: {unknownLocations.length}</div>
                <div>Progress: {Math.round((discoveredLocations.length / WORLD_LOCATIONS.length) * 100)}%</div>
              </div>
            </div>

            {/* Location Types */}
            <div className="p-3 bg-slate-700 rounded text-sm">
              <h4 className="font-semibold mb-2">📍 Location Types</h4>
              <div className="space-y-1 text-slate-300">
                <div className="flex items-center gap-2">
                  <span>🏘️</span>
                  <span>Towns - Safe havens with NPCs and services</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🏰</span>
                  <span>Dungeons - Dangerous areas with treasures</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🌲</span>
                  <span>Wilderness - Natural areas to explore</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>⛰️</span>
                  <span>Landmarks - Points of interest</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
