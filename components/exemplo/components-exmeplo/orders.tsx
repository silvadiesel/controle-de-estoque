"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Plus,
  Trash2,
  Search,
  Wrench,
  ShoppingCart,
  CheckCircle,
  Clock,
  XCircle,
  PlayCircle,
  Package,
  X,
} from "lucide-react"
import { useStockStore, type Order, type OrderItem } from "@/lib/store"

const statusConfig = {
  aberta: { label: "Aberta", icon: Clock, className: "bg-secondary text-secondary-foreground" },
  em_andamento: { label: "Em Andamento", icon: PlayCircle, className: "bg-primary/20 text-primary" },
  finalizada: { label: "Finalizada", icon: CheckCircle, className: "bg-emerald-500/20 text-emerald-400" },
  cancelada: { label: "Cancelada", icon: XCircle, className: "bg-destructive/20 text-destructive" },
}

export function Orders() {
  const { orders, clients, products, addOrder, updateOrder, deleteOrder, finalizeOrder } = useStockStore()
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState<"all" | "servico" | "venda">("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null)

  const [newOrder, setNewOrder] = useState({
    type: "servico" as "servico" | "venda",
    clientId: "",
    vehiclePlate: "",
    vehicleModel: "",
    description: "",
    laborCost: 0,
    status: "aberta" as const,
  })
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [selectedProductId, setSelectedProductId] = useState("")
  const [itemQuantity, setItemQuantity] = useState(1)

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.clientName.toLowerCase().includes(search.toLowerCase()) ||
      order.vehiclePlate.toLowerCase().includes(search.toLowerCase()) ||
      order.id.includes(search)
    const matchesType = filterType === "all" || order.type === filterType
    const matchesStatus = filterStatus === "all" || order.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const handleAddItem = () => {
    const product = products.find((p) => p.id === selectedProductId)
    if (product && itemQuantity > 0) {
      const existingIndex = orderItems.findIndex((item) => item.productId === selectedProductId)
      if (existingIndex >= 0) {
        const updated = [...orderItems]
        updated[existingIndex].quantity += itemQuantity
        setOrderItems(updated)
      } else {
        setOrderItems([
          ...orderItems,
          {
            productId: product.id,
            productName: product.name,
            quantity: itemQuantity,
            unitPrice: product.price,
          },
        ])
      }
      setSelectedProductId("")
      setItemQuantity(1)
    }
  }

  const handleRemoveItem = (productId: string) => {
    setOrderItems(orderItems.filter((item) => item.productId !== productId))
  }

  const handleAddOrder = () => {
    const client = clients.find((c) => c.id === newOrder.clientId)
    if (!client || orderItems.length === 0) {
      alert("Selecione um cliente e adicione pelo menos um item")
      return
    }

    addOrder({
      ...newOrder,
      clientName: client.name,
      vehiclePlate: newOrder.vehiclePlate || client.vehiclePlate,
      vehicleModel: newOrder.vehicleModel || client.vehicleModel,
      items: orderItems,
    })

    setNewOrder({
      type: "servico",
      clientId: "",
      vehiclePlate: "",
      vehicleModel: "",
      description: "",
      laborCost: 0,
      status: "aberta",
    })
    setOrderItems([])
    setIsAddOpen(false)
  }

  const handleClientChange = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId)
    setNewOrder({
      ...newOrder,
      clientId,
      vehiclePlate: client?.vehiclePlate || "",
      vehicleModel: client?.vehicleModel || "",
    })
  }

  const calculateTotal = () => {
    const itemsTotal = orderItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
    return itemsTotal + (newOrder.laborCost || 0)
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const openOrdersCount = orders.filter((o) => o.status === "aberta" || o.status === "em_andamento").length
  const servicosCount = orders.filter((o) => o.type === "servico").length
  const vendasCount = orders.filter((o) => o.type === "venda").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Ordens de Serviço e Venda</h2>
          <p className="text-muted-foreground">Gerencie serviços e vendas de peças</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Nova Ordem
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-foreground">Criar Nova Ordem</DialogTitle>
              <DialogDescription>Crie uma ordem de serviço ou venda de peças</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Tipo e Cliente */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tipo de Ordem *</Label>
                  <Select
                    value={newOrder.type}
                    onValueChange={(value: "servico" | "venda") => setNewOrder({ ...newOrder, type: value })}
                  >
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="servico">
                        <div className="flex items-center gap-2">
                          <Wrench className="h-4 w-4" />
                          Ordem de Serviço
                        </div>
                      </SelectItem>
                      <SelectItem value="venda">
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="h-4 w-4" />
                          Ordem de Venda
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Cliente *</Label>
                  <Select value={newOrder.clientId} onValueChange={handleClientChange}>
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Veículo */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Placa do Veículo</Label>
                  <Input
                    value={newOrder.vehiclePlate}
                    onChange={(e) => setNewOrder({ ...newOrder, vehiclePlate: e.target.value })}
                    placeholder="ABC-1234"
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Modelo do Veículo</Label>
                  <Input
                    value={newOrder.vehicleModel}
                    onChange={(e) => setNewOrder({ ...newOrder, vehicleModel: e.target.value })}
                    placeholder="Scania R450"
                    className="bg-input border-border"
                  />
                </div>
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label>Descrição do Serviço/Venda</Label>
                <Textarea
                  value={newOrder.description}
                  onChange={(e) => setNewOrder({ ...newOrder, description: e.target.value })}
                  placeholder="Descreva o serviço a ser realizado ou detalhes da venda"
                  className="bg-input border-border min-h-[80px]"
                />
              </div>

              {/* Adicionar Peças */}
              <div className="space-y-3">
                <Label>Peças Utilizadas</Label>
                <div className="flex gap-2">
                  <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                    <SelectTrigger className="bg-input border-border flex-1">
                      <SelectValue placeholder="Selecione uma peça" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - {formatCurrency(product.price)} (Estoque: {product.quantity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min={1}
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(Number(e.target.value))}
                    className="bg-input border-border w-20"
                  />
                  <Button onClick={handleAddItem} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Lista de itens */}
                {orderItems.length > 0 && (
                  <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border hover:bg-transparent">
                          <TableHead className="text-muted-foreground">Peça</TableHead>
                          <TableHead className="text-muted-foreground text-center">Qtd</TableHead>
                          <TableHead className="text-muted-foreground text-right">Preço Unit.</TableHead>
                          <TableHead className="text-muted-foreground text-right">Subtotal</TableHead>
                          <TableHead className="text-muted-foreground w-10"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orderItems.map((item) => (
                          <TableRow key={item.productId} className="border-border">
                            <TableCell className="text-foreground">{item.productName}</TableCell>
                            <TableCell className="text-center text-foreground">{item.quantity}</TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              {formatCurrency(item.unitPrice)}
                            </TableCell>
                            <TableCell className="text-right text-foreground font-medium">
                              {formatCurrency(item.quantity * item.unitPrice)}
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.productId)}>
                                <X className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              {/* Mão de Obra (só para serviço) */}
              {newOrder.type === "servico" && (
                <div className="space-y-2">
                  <Label>Valor da Mão de Obra</Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={newOrder.laborCost}
                    onChange={(e) => setNewOrder({ ...newOrder, laborCost: Number(e.target.value) })}
                    placeholder="0.00"
                    className="bg-input border-border"
                  />
                </div>
              )}

              {/* Total */}
              <div className="rounded-lg bg-secondary/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-foreground">Total da Ordem</span>
                  <span className="text-2xl font-bold text-primary">{formatCurrency(calculateTotal())}</span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddOrder} className="bg-primary hover:bg-primary/90">
                Criar Ordem
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente, placa ou ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-input border-border"
          />
        </div>
        <Select value={filterType} onValueChange={(v: "all" | "servico" | "venda") => setFilterType(v)}>
          <SelectTrigger className="bg-input border-border w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">Todos os Tipos</SelectItem>
            <SelectItem value="servico">Serviços</SelectItem>
            <SelectItem value="venda">Vendas</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="bg-input border-border w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="aberta">Aberta</SelectItem>
            <SelectItem value="em_andamento">Em Andamento</SelectItem>
            <SelectItem value="finalizada">Finalizada</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{openOrdersCount}</p>
                <p className="text-sm text-muted-foreground">Ordens em Aberto</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <Wrench className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{servicosCount}</p>
                <p className="text-sm text-muted-foreground">Ordens de Serviço</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <ShoppingCart className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{vendasCount}</p>
                <p className="text-sm text-muted-foreground">Ordens de Venda</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Lista de Ordens</CardTitle>
          <CardDescription>{filteredOrders.length} ordem(ns) encontrada(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Ordem</TableHead>
                  <TableHead className="text-muted-foreground hidden md:table-cell">Cliente</TableHead>
                  <TableHead className="text-muted-foreground hidden lg:table-cell">Veículo</TableHead>
                  <TableHead className="text-muted-foreground text-center">Status</TableHead>
                  <TableHead className="text-muted-foreground text-right hidden sm:table-cell">Total</TableHead>
                  <TableHead className="text-muted-foreground text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => {
                  const status = statusConfig[order.status]
                  const StatusIcon = status.icon
                  return (
                    <TableRow key={order.id} className="border-border">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {order.type === "servico" ? (
                            <Wrench className="h-4 w-4 text-primary" />
                          ) : (
                            <ShoppingCart className="h-4 w-4 text-primary" />
                          )}
                          <div>
                            <p className="font-medium text-foreground">#{order.id.slice(0, 8)}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <p className="text-foreground">{order.clientName}</p>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div>
                          <p className="text-foreground">{order.vehiclePlate}</p>
                          <p className="text-xs text-muted-foreground">{order.vehicleModel}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className={status.className}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right hidden sm:table-cell">
                        <span className="font-medium text-foreground">{formatCurrency(order.total)}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Dialog
                            open={viewingOrder?.id === order.id}
                            onOpenChange={(open) => !open && setViewingOrder(null)}
                          >
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => setViewingOrder(order)}>
                                <Package className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-card border-border max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="text-foreground">
                                  Detalhes da Ordem #{order.id.slice(0, 8)}
                                </DialogTitle>
                                <DialogDescription>
                                  {order.type === "servico" ? "Ordem de Serviço" : "Ordem de Venda"} -{" "}
                                  {order.clientName}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                  <div>
                                    <p className="text-sm text-muted-foreground">Veículo</p>
                                    <p className="text-foreground">
                                      {order.vehiclePlate} - {order.vehicleModel}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <Badge variant="secondary" className={statusConfig[order.status].className}>
                                      {statusConfig[order.status].label}
                                    </Badge>
                                  </div>
                                </div>
                                {order.description && (
                                  <div>
                                    <p className="text-sm text-muted-foreground">Descrição</p>
                                    <p className="text-foreground">{order.description}</p>
                                  </div>
                                )}
                                <div>
                                  <p className="text-sm text-muted-foreground mb-2">Itens</p>
                                  <div className="rounded-lg border border-border overflow-hidden">
                                    <Table>
                                      <TableHeader>
                                        <TableRow className="border-border hover:bg-transparent">
                                          <TableHead className="text-muted-foreground">Peça</TableHead>
                                          <TableHead className="text-muted-foreground text-center">Qtd</TableHead>
                                          <TableHead className="text-muted-foreground text-right">Subtotal</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {order.items.map((item, idx) => (
                                          <TableRow key={idx} className="border-border">
                                            <TableCell className="text-foreground">{item.productName}</TableCell>
                                            <TableCell className="text-center text-foreground">
                                              {item.quantity}
                                            </TableCell>
                                            <TableCell className="text-right text-foreground">
                                              {formatCurrency(item.quantity * item.unitPrice)}
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                        {order.laborCost > 0 && (
                                          <TableRow className="border-border">
                                            <TableCell className="text-foreground">Mão de Obra</TableCell>
                                            <TableCell className="text-center">-</TableCell>
                                            <TableCell className="text-right text-foreground">
                                              {formatCurrency(order.laborCost)}
                                            </TableCell>
                                          </TableRow>
                                        )}
                                      </TableBody>
                                    </Table>
                                  </div>
                                </div>
                                <div className="rounded-lg bg-secondary/50 p-4">
                                  <div className="flex items-center justify-between">
                                    <span className="text-lg font-medium text-foreground">Total</span>
                                    <span className="text-2xl font-bold text-primary">
                                      {formatCurrency(order.total)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setViewingOrder(null)}>
                                  Fechar
                                </Button>
                                {(order.status === "aberta" || order.status === "em_andamento") && (
                                  <>
                                    {order.status === "aberta" && (
                                      <Button
                                        variant="outline"
                                        onClick={() => {
                                          updateOrder(order.id, { status: "em_andamento" })
                                          setViewingOrder(null)
                                        }}
                                      >
                                        <PlayCircle className="h-4 w-4 mr-2" />
                                        Iniciar
                                      </Button>
                                    )}
                                    <Button
                                      className="bg-primary hover:bg-primary/90"
                                      onClick={() => {
                                        finalizeOrder(order.id)
                                        setViewingOrder(null)
                                      }}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Finalizar
                                    </Button>
                                  </>
                                )}
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          {order.status !== "finalizada" && order.status !== "cancelada" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                if (confirm("Tem certeza que deseja cancelar esta ordem?")) {
                                  updateOrder(order.id, { status: "cancelada" })
                                }
                              }}
                            >
                              <XCircle className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm("Tem certeza que deseja excluir esta ordem?")) {
                                deleteOrder(order.id)
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {filteredOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      Nenhuma ordem encontrada
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
