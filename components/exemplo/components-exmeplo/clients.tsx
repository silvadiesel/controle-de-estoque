"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Plus, Pencil, Trash2, Search, Phone, Mail, Truck } from "lucide-react"
import { useStockStore, type Client } from "@/lib/store"

const emptyClient = {
  name: "",
  document: "",
  phone: "",
  email: "",
  address: "",
  vehiclePlate: "",
  vehicleModel: "",
  notes: "",
}

export function Clients() {
  const { clients, addClient, updateClient, deleteClient } = useStockStore()
  const [search, setSearch] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [newClient, setNewClient] = useState(emptyClient)

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.document.includes(search) ||
      client.vehiclePlate.toLowerCase().includes(search.toLowerCase()),
  )

  const handleAddClient = () => {
    if (newClient.name.trim() && newClient.document.trim()) {
      addClient(newClient)
      setNewClient(emptyClient)
      setIsAddOpen(false)
    }
  }

  const handleUpdateClient = () => {
    if (editingClient && editingClient.name.trim()) {
      updateClient(editingClient.id, editingClient)
      setEditingClient(null)
    }
  }

  const ClientForm = ({
    data,
    setData,
    isEdit = false,
  }: { data: typeof emptyClient | Client; setData: (data: typeof emptyClient | Client) => void; isEdit?: boolean }) => (
    <div className="grid gap-4 py-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Nome / Razão Social *</Label>
          <Input
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            placeholder="Transportadora Silva"
            className="bg-input border-border"
          />
        </div>
        <div className="space-y-2">
          <Label>CPF / CNPJ *</Label>
          <Input
            value={data.document}
            onChange={(e) => setData({ ...data, document: e.target.value })}
            placeholder="00.000.000/0001-00"
            className="bg-input border-border"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Telefone</Label>
          <Input
            value={data.phone}
            onChange={(e) => setData({ ...data, phone: e.target.value })}
            placeholder="(11) 99999-9999"
            className="bg-input border-border"
          />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
            placeholder="contato@empresa.com"
            className="bg-input border-border"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Endereço</Label>
        <Input
          value={data.address}
          onChange={(e) => setData({ ...data, address: e.target.value })}
          placeholder="Rua, número, bairro, cidade"
          className="bg-input border-border"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Placa do Veículo</Label>
          <Input
            value={data.vehiclePlate}
            onChange={(e) => setData({ ...data, vehiclePlate: e.target.value })}
            placeholder="ABC-1234"
            className="bg-input border-border"
          />
        </div>
        <div className="space-y-2">
          <Label>Modelo do Veículo</Label>
          <Input
            value={data.vehicleModel}
            onChange={(e) => setData({ ...data, vehicleModel: e.target.value })}
            placeholder="Scania R450"
            className="bg-input border-border"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Observações</Label>
        <Textarea
          value={data.notes}
          onChange={(e) => setData({ ...data, notes: e.target.value })}
          placeholder="Informações adicionais sobre o cliente"
          className="bg-input border-border min-h-[80px]"
        />
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Clientes</h2>
          <p className="text-muted-foreground">Gerencie os clientes da oficina</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-foreground">Adicionar Cliente</DialogTitle>
              <DialogDescription>Cadastre um novo cliente no sistema</DialogDescription>
            </DialogHeader>
            <ClientForm data={newClient} setData={setNewClient as (data: typeof emptyClient | Client) => void} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddClient} className="bg-primary hover:bg-primary/90">
                Adicionar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, documento ou placa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-input border-border"
        />
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{clients.length}</p>
                <p className="text-sm text-muted-foreground">Total de Clientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clients Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Lista de Clientes</CardTitle>
          <CardDescription>{filteredClients.length} cliente(s) encontrado(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Cliente</TableHead>
                  <TableHead className="text-muted-foreground hidden md:table-cell">Contato</TableHead>
                  <TableHead className="text-muted-foreground hidden lg:table-cell">Veículo</TableHead>
                  <TableHead className="text-muted-foreground text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id} className="border-border">
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{client.name}</p>
                        <p className="text-sm text-muted-foreground">{client.document}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {client.phone || "-"}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {client.email || "-"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{client.vehiclePlate || "-"}</p>
                          <p className="text-xs text-muted-foreground">{client.vehicleModel || "-"}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog
                          open={editingClient?.id === client.id}
                          onOpenChange={(open) => !open && setEditingClient(null)}
                        >
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setEditingClient(client)}>
                              <Pencil className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-card border-border max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-foreground">Editar Cliente</DialogTitle>
                              <DialogDescription>Altere os dados do cliente</DialogDescription>
                            </DialogHeader>
                            {editingClient && (
                              <ClientForm
                                data={editingClient}
                                setData={setEditingClient as (data: typeof emptyClient | Client) => void}
                                isEdit
                              />
                            )}
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setEditingClient(null)}>
                                Cancelar
                              </Button>
                              <Button onClick={handleUpdateClient} className="bg-primary hover:bg-primary/90">
                                Salvar
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="icon" onClick={() => deleteClient(client.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredClients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      Nenhum cliente encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
