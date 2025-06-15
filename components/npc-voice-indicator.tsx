import { Badge } from "@/components/ui/badge"
import type { NPCVoice } from "@/lib/npc-voices"

interface NPCVoiceIndicatorProps {
  voice: NPCVoice
  className?: string
}

export function NPCVoiceIndicator({ voice, className = "" }: NPCVoiceIndicatorProps) {
  const getVoiceColor = (voiceId: string) => {
    const colors: { [key: string]: string } = {
      noble: "bg-purple-600 text-white",
      merchant: "bg-yellow-600 text-white",
      guard: "bg-red-600 text-white",
      peasant: "bg-green-600 text-white",
      scholar: "bg-blue-600 text-white",
      rogue: "bg-gray-600 text-white",
      priest: "bg-indigo-600 text-white",
      barbarian: "bg-orange-600 text-white",
      child: "bg-pink-600 text-white",
      elder: "bg-amber-600 text-white",
      innkeeper: "bg-teal-600 text-white",
      villain: "bg-black text-white",
    }
    return colors[voiceId] || "bg-slate-600 text-white"
  }

  return (
    <Badge className={`${getVoiceColor(voice.id)} ${className}`} title={voice.description}>
      {voice.name}
    </Badge>
  )
}
