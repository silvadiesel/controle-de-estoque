"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useStockStore } from "@/lib/store"
import { Package, AlertTriangle, TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts"

export function Dashboard() {
  const { products, movements, getLowStockProducts } = useStockStore()

  const totalProducts = products.length
  const totalItems = products.reduce((acc, p) => acc + p.quantity, 0)
  const lowStockCount = getLowStockProducts().length
  const totalValue = products.reduce((acc, p) => acc + p.quantity * p.price, 0)

  const recentEntries = movements.filter((m) => m.type === "entrada").slice(0, 5)
  const recentExits = movements.filter((m) => m.type === "saida").slice(0, 5)

  // Dados para o gráfico de categorias
  const categoryData = products.reduce(
    (acc, product) => {
      const existing = acc.find((item) => item.category === product.category)
      if (existing) {
        existing.quantity += product.quantity
        existing.value += product.quantity * product.price
      } else {
        acc.push({
          category: product.category,
          quantity: product.quantity,
          value: product.quantity * product.price,
        })
      }
      return acc
    },
    [] as { category: string; quantity: number; value: number }[],
  )

  // Dados para o gráfico de movimentações (últimos 7 dias simulados)
  const movementData = [
    { day: "Seg", entradas: 12, saidas: 8 },
    { day: "Ter", entradas: 8, saidas: 15 },
    { day: "Qua", entradas: 20, saidas: 10 },
    { day: "Qui", entradas: 5, saidas: 12 },
    { day: "Sex", entradas: 15, saidas: 18 },
    { day: "Sáb", entradas: 3, saidas: 5 },
    { day: "Dom", entradas: 0, saidas: 2 },
  ]

  const colors = ["#f97316", "#22c55e", "#3b82f6", "#eab308", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground">Visão geral do seu estoque</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Produtos</p>
                <p className="text-3xl font-bold text-foreground">{totalProducts}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Package className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Itens em Estoque</p>
                <p className="text-3xl font-bold text-foreground">{totalItems}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-chart-2/20 flex items-center justify-center">
                <Activity className="h-6 w-6 text-chart-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Estoque Baixo</p>
                <p className="text-3xl font-bold text-foreground">{lowStockCount}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-chart-5/20 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-chart-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold text-foreground">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalValue)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-chart-4/20 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-chart-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Movimentações Chart */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-foreground">Movimentações da Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={movementData}>
                  <defs>
                    <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorSaidas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                      color: "#f8fafc",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="entradas"
                    stroke="#22c55e"
                    fillOpacity={1}
                    fill="url(#colorEntradas)"
                    name="Entradas"
                  />
                  <Area
                    type="monotone"
                    dataKey="saidas"
                    stroke="#f97316"
                    fillOpacity={1}
                    fill="url(#colorSaidas)"
                    name="Saídas"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-chart-2" />
                <span className="text-sm text-muted-foreground">Entradas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-primary" />
                <span className="text-sm text-muted-foreground">Saídas</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categorias Chart */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-foreground">Estoque por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical">
                  <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    type="category"
                    dataKey="category"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                      color: "#f8fafc",
                    }}
                    formatter={(value: number) => [value, "Quantidade"]}
                  />
                  <Bar dataKey="quantity" radius={[0, 4, 4, 0]}>
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Entries */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-chart-2" />
              Últimas Entradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma entrada recente</p>
              ) : (
                recentEntries.map((movement) => (
                  <div key={movement.id} className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                    <div>
                      <p className="font-medium text-foreground">{movement.productName}</p>
                      <p className="text-xs text-muted-foreground">{movement.reason}</p>
                    </div>
                    <span className="font-bold text-chart-2">+{movement.quantity}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Exits */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-foreground flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-primary" />
              Últimas Saídas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentExits.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma saída recente</p>
              ) : (
                recentExits.map((movement) => (
                  <div key={movement.id} className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                    <div>
                      <p className="font-medium text-foreground">{movement.productName}</p>
                      <p className="text-xs text-muted-foreground">{movement.reason}</p>
                    </div>
                    <span className="font-bold text-primary">-{movement.quantity}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
