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
    athletics: "Атлетика (Сила)",
    stealth: "Скрытность (Ловкость)",
    investigation: "Расследование (Интеллект)",
    perception: "Внимательность (Мудрость)",
    persuasion: "Убеждение (Харизма)",
    intimidation: "Запугивание (Харизма)",
    survival: "Выживание (Мудрость)",
    arcana: "Магия (Интеллект)",
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
          <span>📋 Лист персонажа</span>
          {canLevel && (
            <Button onClick={onLevelUp} className="bg-yellow-600 hover:bg-yellow-700 animate-pulse">
              ⭐ Повысить уровень!
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-700">
            <TabsTrigger value="stats">Характеристики</TabsTrigger>
            <TabsTrigger value="skills">Навыки</TabsTrigger>
            <TabsTrigger value="progression">Прогресс</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-4">
            {/* Основные характеристики */}
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

            {/* Боевые характеристики */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-700 rounded">
                <div className="text-sm text-slate-400">Класс Доспеха</div>
                <div className="text-xl font-bold">{10 + getAbilityModifier(character.stats.DEX)}</div>
              </div>
              <div className="p-3 bg-slate-700 rounded">
                <div className="text-sm text-slate-400">Бонус мастерства</div>
                <div className="text-xl font-bold">+{getProficiencyBonus(character.level)}</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="skills" className="space-y-4">
            {/* Очки навыков */}
            {character.skillPoints > 0 && (
              <div className="p-3 bg-blue-900 rounded border border-blue-600">
                <div className="text-center">
                  <div className="text-lg font-bold">Доступно очков навыков: {character.skillPoints}</div>
                  <div className="text-sm text-blue-300">Нажмите на навык для улучшения</div>
                </div>
              </div>
            )}

            {/* Список навыков */}
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
                          Уровень: {level}/5 • Модификатор: {modifier >= 0 ? "+" : ""}
                          {modifier}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {level > 0 && <Badge className="bg-green-600">Изучен</Badge>}
                        {canUpgrade && (
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white border-blue-500">
                            Улучшить
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
            {/* Прогресс опыта */}
            <div className="p-4 bg-slate-700 rounded">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Опыт</span>
                <span className="text-sm text-slate-400">
                  {character.experience} / {character.experienceToNext}
                </span>
              </div>
              <Progress value={experienceProgress} className="h-3" />
              <div className="text-center mt-2 text-sm text-slate-400">
                До следующего уровня: {character.experienceToNext - character.experience} опыта
              </div>
            </div>

            {/* Информация о персонаже */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-700 rounded text-center">
                <div className="text-2xl font-bold text-yellow-400">{character.level}</div>
                <div className="text-sm text-slate-400">Уровень</div>
              </div>
              <div className="p-3 bg-slate-700 rounded text-center">
                <div className="text-2xl font-bold text-green-400">
                  {character.hp}/{character.maxHp}
                </div>
                <div className="text-sm text-slate-400">Здоровье</div>
              </div>
            </div>

            {/* Способности класса */}
            <div className="p-3 bg-slate-700 rounded">
              <h4 className="font-semibold mb-2">Способности класса {character.charClass}</h4>
              <div className="text-sm text-slate-300 space-y-1">
                {character.level >= 1 && <div>• Базовые способности класса</div>}
                {character.level >= 2 && <div>• Улучшенные техники</div>}
                {character.level >= 3 && <div>• Специализация</div>}
                {character.level >= 4 && <div>• Улучшение характеристик</div>}
                {character.level >= 5 && <div>• Мастерские способности</div>}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
