"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Character } from "@/lib/types"
import { getAbilityModifier, getProficiencyBonus, canLevelUp } from "@/lib/level-system"
import { STAT_NAMES } from "@/lib/character-generator"

interface CharacterSheetProps {
  character: Character
  onLevelUp?: () => void
  onSkillUpgrade?: (skill: keyof Character["skills"]) => void
}

export function CharacterSheet({ character, onLevelUp, onSkillUpgrade }: CharacterSheetProps) {
  const [selectedSkill, setSelectedSkill] = useState<keyof Character["skills"] | null>(null)

  const experienceProgress = (character.experience / character.experienceToNext) * 100
  const canLevel = canLevelUp(character)

  const skillNames = {
    athletics: "Athletics (Strength)",
    stealth: "Stealth (Dexterity)",
    investigation: "Investigation (Intelligence)",
    perception: "Perception (Wisdom)",
    persuasion: "Persuasion (Charisma)",
    intimidation: "Intimidation (Charisma)",
    survival: "Survival (Wisdom)",
    arcana: "Arcana (Intelligence)",
  }

  const getSkillModifier = (skill: keyof Character["skills"]) => {
    const skillAbilities = {
      athletics: character.stats.STR,
      stealth: character.stats.DEX,
      investigation: character.stats.INT,
      perception: character.stats.WIS,
      persuasion: character.stats.CHA,
      intimidation: character.stats.CHA,
      survival: character.stats.WIS,
      arcana: character.stats.INT,
    }

    const abilityMod = getAbilityModifier(skillAbilities[skill])
    const profBonus = character.skills[skill] > 0 ? getProficiencyBonus(character.level) : 0
    return abilityMod + profBonus
  }

  return (
    <Card className="bg-slate-800 border-slate-700 text-white">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>📋 Character Sheet</span>
          {canLevel && (
            <Button onClick={onLevelUp} className="bg-yellow-600 hover:bg-yellow-700 animate-pulse">
              ⭐ Level Up!
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-700">
            <TabsTrigger value="stats">Abilities</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="progression">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-4">
            {/* Ability Scores */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(character.stats).map(([stat, value]) => {
                const modifier = getAbilityModifier(value)
                return (
                  <div key={stat} className="text-center p-3 bg-slate-700 rounded">
                    <div className="font-bold text-lg">{STAT_NAMES[stat]}</div>
                    <div className="text-2xl font-bold text-blue-400">{value}</div>
                    <div className="text-sm text-slate-300">
                      {modifier >= 0 ? "+" : ""}
                      {modifier}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Combat Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-700 rounded">
                <div className="text-sm text-slate-400">Armor Class</div>
                <div className="text-xl font-bold">{10 + getAbilityModifier(character.stats.DEX)}</div>
              </div>
              <div className="p-3 bg-slate-700 rounded">
                <div className="text-sm text-slate-400">Proficiency Bonus</div>
                <div className="text-xl font-bold">+{getProficiencyBonus(character.level)}</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="skills" className="space-y-4">
            {/* Skill Points */}
            {character.skillPoints > 0 && (
              <div className="p-3 bg-blue-900 rounded border border-blue-600">
                <div className="text-center">
                  <div className="text-lg font-bold">Available Skill Points: {character.skillPoints}</div>
                  <div className="text-sm text-blue-300">Click on a skill to improve it</div>
                </div>
              </div>
            )}

            {/* Skills List */}
            <div className="space-y-2">
              {Object.entries(character.skills).map(([skill, level]) => {
                const skillKey = skill as keyof Character["skills"]
                const modifier = getSkillModifier(skillKey)
                const canUpgrade = character.skillPoints > 0 && level < 5

                return (
                  <div
                    key={skill}
                    className={`p-3 rounded border transition-colors ${
                      canUpgrade ? "border-blue-500 hover:bg-slate-700 cursor-pointer" : "border-slate-600"
                    }`}
                    onClick={() => canUpgrade && onSkillUpgrade?.(skillKey)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{skillNames[skillKey]}</div>
                        <div className="text-sm text-slate-400">
                          Level: {level}/5 • Modifier: {modifier >= 0 ? "+" : ""}
                          {modifier}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {level > 0 && <Badge className="bg-green-600">Trained</Badge>}
                        {canUpgrade && (
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white border-blue-500">
                            Improve
                          </Button>
                        )}
                      </div>
                    </div>
                    <Progress value={(level / 5) * 100} className="mt-2 h-2" />
                  </div>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="progression" className="space-y-4">
            {/* Experience Progress */}
            <div className="p-4 bg-slate-700 rounded">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Experience</span>
                <span className="text-sm text-slate-400">
                  {character.experience} / {character.experienceToNext}
                </span>
              </div>
              <Progress value={experienceProgress} className="h-3" />
              <div className="text-center mt-2 text-sm text-slate-400">
                To next level: {character.experienceToNext - character.experience} XP
              </div>
            </div>

            {/* Character Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-700 rounded text-center">
                <div className="text-2xl font-bold text-yellow-400">{character.level}</div>
                <div className="text-sm text-slate-400">Level</div>
              </div>
              <div className="p-3 bg-slate-700 rounded text-center">
                <div className="text-2xl font-bold text-green-400">
                  {character.hp}/{character.maxHp}
                </div>
                <div className="text-sm text-slate-400">Hit Points</div>
              </div>
            </div>

            {/* Class Features */}
            <div className="p-3 bg-slate-700 rounded">
              <h4 className="font-semibold mb-2">{character.charClass} Class Features</h4>
              <div className="text-sm text-slate-300 space-y-1">
                {character.level >= 1 && <div>• Basic class abilities</div>}
                {character.level >= 2 && <div>• Enhanced techniques</div>}
                {character.level >= 3 && <div>• Specialization</div>}
                {character.level >= 4 && <div>• Ability score improvement</div>}
                {character.level >= 5 && <div>• Master abilities</div>}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
