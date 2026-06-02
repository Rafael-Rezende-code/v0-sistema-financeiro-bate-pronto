"use client"

import { useState, useEffect, useTransition } from "react"
import { getSettings, updateSetting } from "../actions"
import type { Setting } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Target, Tag, Bell, Settings } from "lucide-react"

const KEY_PREFIX_TO_GROUP: Record<string, string> = {
  meta: "Metas",
  goal: "Metas",
  preco: "Precificação",
  price: "Precificação",
  custo: "Precificação",
  cost: "Precificação",
  margem: "Precificação",
  margin: "Precificação",
  alerta: "Alertas",
  alert: "Alertas",
  dias: "Alertas",
  day: "Alertas",
  estoque: "Alertas",
  stock: "Alertas",
}

const GROUP_CONFIG: Record<string, { icon: React.ElementType }> = {
  Metas: { icon: Target },
  Precificação: { icon: Tag },
  Alertas: { icon: Bell },
  Geral: { icon: Settings },
}

const GROUP_ORDER = ["Metas", "Precificação", "Alertas", "Geral"]

function getGroup(key: string): string {
  const prefix = key.split("_")[0].toLowerCase()
  return KEY_PREFIX_TO_GROUP[prefix] || "Geral"
}

export default function ConfiguracoesPage() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [values, setValues] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    getSettings()
      .then((data) => {
        setSettings(data)
        const initial: Record<string, string> = {}
        data.forEach((s) => { initial[s.key] = s.value })
        setValues(initial)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = (key: string) => {
    startTransition(async () => {
      await updateSetting(key, values[key] ?? "")
      setSaved((prev) => ({ ...prev, [key]: true }))
      setTimeout(() => setSaved((prev) => ({ ...prev, [key]: false })), 2000)
    })
  }

  const groups: Record<string, Setting[]> = {}
  settings.forEach((s) => {
    const g = getGroup(s.key)
    if (!groups[g]) groups[g] = []
    groups[g].push(s)
  })

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Gerencie os parâmetros do sistema
        </p>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">
          Carregando...
        </div>
      ) : settings.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">
          Nenhuma configuração encontrada
        </div>
      ) : (
        <div className="space-y-6">
          {GROUP_ORDER.map((groupName) => {
            const items = groups[groupName]
            if (!items || items.length === 0) return null
            const { icon: Icon } = GROUP_CONFIG[groupName]
            return (
              <Card key={groupName}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Icon className="h-4 w-4 text-primary" />
                    {groupName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((setting) => (
                    <div key={setting.key} className="flex flex-col sm:flex-row sm:items-end gap-3">
                      <div className="flex-1 space-y-1">
                        <Label className="text-sm font-medium">
                          {setting.label || setting.key}
                        </Label>
                        {setting.description && (
                          <p className="text-xs text-muted-foreground">{setting.description}</p>
                        )}
                        <Input
                          value={values[setting.key] ?? ""}
                          onChange={(e) => setValues({ ...values, [setting.key]: e.target.value })}
                          className="h-9"
                          onKeyDown={(e) => { if (e.key === "Enter") handleSave(setting.key) }}
                        />
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleSave(setting.key)}
                        disabled={isPending}
                        variant={saved[setting.key] ? "outline" : "default"}
                        className="shrink-0 w-full sm:w-auto"
                      >
                        {saved[setting.key] ? "✓ Salvo" : "Salvar"}
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
