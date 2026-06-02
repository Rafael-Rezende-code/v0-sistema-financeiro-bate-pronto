"use client"

import { useState, useEffect } from "react"
import { getCustomersWithStats, createCustomer, updateCustomer, deleteCustomer } from "../actions"
import type { Customer } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Users, Plus, Pencil, Trash2, Phone, ShoppingBag, Clock } from "lucide-react"

type CustomerWithStats = Customer & {
  last_purchase_at?: string | null
  days_since_last_purchase?: number | null
  total_spent?: number | null
  total_orders?: number | null
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

function formatDate(date: string) {
  return new Date(date + "T12:00:00").toLocaleDateString("pt-BR")
}

export default function ClientesPage() {
  const [customers, setCustomers] = useState<CustomerWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<CustomerWithStats | null>(null)
  const [form, setForm] = useState({ name: "", whatsapp: "", team_1: "", notes: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchCustomers = async () => {
    try {
      const data = await getCustomersWithStats()
      setCustomers(data as CustomerWithStats[])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCustomers() }, [])

  const openCreate = () => {
    setEditingCustomer(null)
    setForm({ name: "", whatsapp: "", team_1: "", notes: "" })
    setIsDialogOpen(true)
  }

  const openEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    setForm({
      name: customer.name,
      whatsapp: customer.whatsapp || "",
      team_1: customer.team_1 || "",
      notes: customer.notes || "",
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) return
    setIsSubmitting(true)
    try {
      const fd = new FormData()
      fd.set("name", form.name)
      fd.set("whatsapp", form.whatsapp)
      fd.set("team_1", form.team_1)
      fd.set("notes", form.notes)
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, fd)
      } else {
        await createCustomer(fd)
      }
      setIsDialogOpen(false)
      await fetchCustomers()
    } catch (e) {
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este cliente?")) return
    try {
      await deleteCustomer(id)
      await fetchCustomers()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Gerencie sua base de clientes
          </p>
        </div>
        <Button onClick={openCreate} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">
          Carregando...
        </div>
      ) : customers.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">
          Nenhum cliente cadastrado ainda
        </div>
      ) : (
        <div className="grid gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {customers.map((customer) => (
            <Card key={customer.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{customer.name}</p>
                      {customer.whatsapp && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                          <Phone className="h-3 w-3 shrink-0" />
                          {customer.whatsapp}
                        </p>
                      )}
                      {customer.team_1 && (
                        <p className="text-xs text-muted-foreground truncate">
                          Time: {customer.team_1}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEdit(customer)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(customer.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="mt-3 border-t pt-2 grid grid-cols-2 gap-1.5">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ShoppingBag className="h-3 w-3 shrink-0" />
                    <span>{customer.total_orders || 0} compras</span>
                  </div>
                  <div className="text-xs text-right font-medium text-primary">
                    {formatCurrency(customer.total_spent || 0)}
                  </div>
                  <div className="col-span-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 shrink-0" />
                    {customer.last_purchase_at
                      ? `Última compra: ${formatDate(customer.last_purchase_at)}${customer.days_since_last_purchase ? ` (${customer.days_since_last_purchase}d)` : ''}`
                      : 'Nunca comprou'}
                  </div>
                </div>
                {customer.notes && (
                  <p className="mt-2 text-xs text-muted-foreground border-t pt-2 line-clamp-2">
                    {customer.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCustomer ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nome do cliente"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team_1">Time</Label>
              <Input
                id="team_1"
                value={form.team_1}
                onChange={(e) => setForm({ ...form, team_1: e.target.value })}
                placeholder="Ex: Flamengo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Notas sobre o cliente"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !form.name.trim()}
            >
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
