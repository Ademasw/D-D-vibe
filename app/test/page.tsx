"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function TestPage() {
  const [testResult, setTestResult] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [customPrompt, setCustomPrompt] = useState("Я осматриваю комнату в поисках сокровищ")

  const testDeepSeekR1 = async () => {
    setLoading(true)
    setTestResult("Тестирование DeepSeek R1...")

    try {
      const response = await fetch("/api/action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: "test-session-" + Date.now(),
          actionText: customPrompt,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setTestResult(`✅ DeepSeek R1 работает!

🎲 Бросок d20: ${data.roll}

🧙 Ответ DM:
${data.result}

📊 Статус: ${data.result.includes("⚠️") ? "Резервный режим (API недоступен)" : "DeepSeek R1 активен"}

⏱️ Время ответа: ${new Date().toLocaleTimeString()}`)
      } else {
        setTestResult(`❌ Ошибка API:
${data.error}

Детали: ${data.details || "Нет дополнительной информации"}`)
      }
    } catch (error) {
      setTestResult(`❌ Ошибка сети:
${error}

Проверьте подключение к интернету и настройки API ключа.`)
    } finally {
      setLoading(false)
    }
  }

  const testDirectAPI = async () => {
    setLoading(true)
    setTestResult("Прямое тестирование DeepSeek R1 API...")

    try {
      const testResponse = await fetch("/api/test-deepseek", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: "Тест DeepSeek R1: создай короткое описание таверны для D&D игры",
        }),
      })

      const data = await testResponse.json()

      if (testResponse.ok) {
        setTestResult(`✅ Прямой тест DeepSeek R1:

Модель: deepseek-r1-0528
API ключ: ${data.apiKeyPrefix || "Не установлен"}

Ответ:
${data.response || "Нет ответа"}

Статус: ${data.success ? "Успешно" : "Ошибка"}`)
      } else {
        setTestResult(`❌ Прямой тест не удался:
${data.error}

${data.details || ""}`)
      }
    } catch (error) {
      setTestResult(`❌ Ошибка прямого теста: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-slate-800 border-slate-700 text-white">
          <CardHeader>
            <CardTitle>🧪 Тест DeepSeek R1 (deepseek-r1-0528)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="prompt" className="text-slate-200">
                Тестовое действие игрока:
              </Label>
              <Input
                id="prompt"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Введите действие для тестирования..."
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
              />
            </div>

            <div className="grid grid-cols-1 gap-2">
              <Button onClick={testDeepSeekR1} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                {loading ? "Тестирование..." : "🎲 Тест игрового процесса"}
              </Button>

              <Button onClick={testDirectAPI} disabled={loading} className="bg-green-600 hover:bg-green-700">
                {loading ? "Тестирование..." : "🔧 Прямой тест API"}
              </Button>
            </div>

            {testResult && (
              <div className="bg-slate-700 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm">{testResult}</pre>
              </div>
            )}

            <div className="mt-4 p-3 bg-slate-700 rounded-lg text-sm">
              <p className="text-slate-300 font-semibold mb-2">Информация о DeepSeek R1:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>Модель: deepseek-r1-0528</li>
                <li>Специализация: рассуждения и логика</li>
                <li>Оптимизирован для сложных задач</li>
                <li>Поддержка русского языка</li>
                <li>Максимум токенов: 300</li>
              </ul>
            </div>

            <Button
              onClick={() => (window.location.href = "/")}
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              🏠 Вернуться к игре
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
