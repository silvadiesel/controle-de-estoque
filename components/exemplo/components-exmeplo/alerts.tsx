"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useStockStore } from "@/lib/store"
import { AlertTriangle, Package, TrendingUp, Bell, CheckCircle } from "lucide-react"

interface AlertsProps {
  onNavigate: (tab: string) => void
}

export function Alerts({ onNavigate }: AlertsProps) {
  const { getLowStockProducts, products } = useStockStore()
  const lowStockProducts = getLowStockProducts()

  const criticalProducts = lowStockProducts.filter((p) => p.quantity === 0)
  const warningProducts = lowStockProducts.filter((p) => p.quantity > 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Alertas</h2>
        <p className="text-muted-foreground">Monitore os níveis críticos de estoque</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-destructive/10 border-destructive/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-destructive">Crítico</p>
                <p className="text-3xl font-bold text-destructive">{criticalProducts.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Estoque zerado</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-destructive/20 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary/10 border-primary/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary">Atenção</p>
                <p className="text-3xl font-bold text-primary">{warningProducts.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Abaixo do mínimo</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Bell className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/50 border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Normal</p>
                <p className="text-3xl font-bold text-foreground">{products.length - lowStockProducts.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Estoque OK</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                <Package className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      {lowStockProducts.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Tudo certo!</h3>
            <p className="text-muted-foreground text-center">
              Todos os produtos estão com estoque acima do nível mínimo.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Critical Alerts */}
          {criticalProducts.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Estoque Zerado - Crítico
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {criticalProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-lg bg-destructive/10 border border-destructive/30 p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                        <Package className="h-5 w-5 text-destructive" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.code} • {product.category} • {product.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-destructive">0</p>
                        <p className="text-xs text-muted-foreground">Mín: {product.minQuantity}</p>
                      </div>
                      <Button
                        size="sm"
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => onNavigate("movements")}
                      >
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Repor
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Warning Alerts - Agora usa laranja (primary) */}
          {warningProducts.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Estoque Baixo - Atenção
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {warningProducts.map((product) => {
                  const percentage = (product.quantity / product.minQuantity) * 100

                  return (
                    <div
                      key={product.id}
                      className="flex items-center justify-between rounded-lg bg-primary/10 border border-primary/30 p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                          <Package className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.code} • {product.category} • {product.location}
                          </p>
                          {/* Progress bar */}
                          <div className="mt-2 w-32 h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">{product.quantity}</p>
                          <p className="text-xs text-muted-foreground">Mín: {product.minQuantity}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-primary text-primary hover:bg-primary/10 bg-transparent"
                          onClick={() => onNavigate("movements")}
                        >
                          <TrendingUp className="h-4 w-4 mr-1" />
                          Repor
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
