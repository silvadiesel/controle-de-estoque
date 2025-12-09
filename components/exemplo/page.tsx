"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Dashboard } from "@/components/dashboard"
import { Products } from "@/components/products"
import { Movements } from "@/components/movements"
import { Alerts } from "@/components/alerts"
import { Settings } from "@/components/settings"
import { Clients } from "@/components/clients"
import { Suppliers } from "@/components/suppliers"
import { Orders } from "@/components/orders"
import { Login } from "@/components/login"
import { useStockStore, useAuthStore } from "@/lib/store"
import { Bell } from "lucide-react"

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const { getLowStockProducts } = useStockStore()
  const { isAuthenticated } = useAuthStore()
  const alertCount = getLowStockProducts().length

  if (!isAuthenticated) {
    return <Login />
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />
      case "products":
        return <Products />
      case "movements":
        return <Movements />
      case "orders":
        return <Orders />
      case "clients":
        return <Clients />
      case "suppliers":
        return <Suppliers />
      case "alerts":
        return <Alerts onNavigate={setActiveTab} />
      case "settings":
        return <Settings />
      default:
        return <Dashboard />
    }
  }

  const pageTitles: Record<string, string> = {
    dashboard: "Dashboard",
    products: "Produtos",
    movements: "Movimentações",
    orders: "Ordens",
    clients: "Clientes",
    suppliers: "Fornecedores",
    alerts: "Alertas",
    settings: "Configurações",
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <main className="lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between px-4 lg:px-8">
            <div className="lg:hidden w-10" />
            <h1 className="text-lg font-semibold text-foreground hidden sm:block">
              {pageTitles[activeTab] || "Dashboard"}
            </h1>
            {/* Alert Badge */}
            <button
              onClick={() => setActiveTab("alerts")}
              className="relative flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Alertas</span>
              {alertCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                  {alertCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-8">{renderContent()}</div>
      </main>
    </div>
  )
}
