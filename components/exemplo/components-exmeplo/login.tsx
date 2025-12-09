"use client"

import type React from "react"
import { useState } from "react"
import { useAuthStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Truck, Eye, EyeOff, Loader2, AlertCircle, Wrench, Package, ClipboardList, ArrowRight } from "lucide-react"

export function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isFocused, setIsFocused] = useState<string | null>(null)
  const { login } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    const success = login(email, password)
    if (!success) {
      setError("Email ou senha incorretos")
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Lado esquerdo - Visual impactante */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Círculos decorativos */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[80px]" />

        {/* Linhas diagonais decorativas */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent transform -rotate-12" />
          <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-primary/10 to-transparent transform rotate-12" />
          <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent transform -rotate-6" />
        </div>

        {/* Conteúdo principal */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold text-white tracking-tight">StockTruck</span>
              <span className="block text-xs text-zinc-500 uppercase tracking-widest">Oficina Pro</span>
            </div>
          </div>

          {/* Texto central */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
                Controle total do
                <span className="block text-primary">seu estoque</span>
              </h1>
              <p className="text-zinc-400 text-lg max-w-md leading-relaxed">
                Gerencie peças, ordens de serviço e fornecedores em um único lugar. Simples, rápido e eficiente.
              </p>
            </div>

            {/* Features cards */}
            <div className="grid gap-4 max-w-md">
              {[
                { icon: Package, title: "Gestão de Estoque", desc: "Controle completo de entradas e saídas" },
                { icon: ClipboardList, title: "Ordens de Serviço", desc: "Acompanhe cada manutenção em tempo real" },
                { icon: Wrench, title: "Peças e Produtos", desc: "Catálogo organizado por categorias" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] backdrop-blur-sm hover:bg-white/[0.05] transition-colors group"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white">{item.title}</h3>
                    <p className="text-xs text-zinc-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-12">
            {[
              { value: "99.9%", label: "Uptime" },
              { value: "+500", label: "Oficinas" },
              { value: "24/7", label: "Suporte" },
            ].map((stat, i) => (
              <div key={i} className="space-y-1">
                <span className="text-2xl font-bold text-white">{stat.value}</span>
                <span className="block text-xs text-zinc-500 uppercase tracking-wider">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lado direito - Formulário */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative">
        {/* Background sutil */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/[0.02]" />

        <div className="w-full max-w-sm relative z-10">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-12">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground">
              <Truck className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-foreground">StockTruck</span>
          </div>

          {/* Header do form */}
          <div className="space-y-2 mb-8">
            <h2 className="text-2xl font-bold text-foreground">Acesse sua conta</h2>
            <p className="text-muted-foreground">Digite suas credenciais para continuar</p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </Label>
              <div
                className={`relative rounded-xl transition-all duration-200 ${isFocused === "email" ? "ring-2 ring-primary/20" : ""}`}
              >
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsFocused("email")}
                  onBlur={() => setIsFocused(null)}
                  required
                  className="h-12 px-4 bg-secondary/50 border-border/50 rounded-xl focus:border-primary focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                />
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Senha
              </Label>
              <div
                className={`relative rounded-xl transition-all duration-200 ${isFocused === "password" ? "ring-2 ring-primary/20" : ""}`}
              >
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsFocused("password")}
                  onBlur={() => setIsFocused(null)}
                  required
                  className="h-12 px-4 pr-12 bg-secondary/50 border-border/50 rounded-xl focus:border-primary focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Erro */}
            {error && (
              <div className="flex items-center gap-3 text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Botão */}
            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all duration-200 group"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  Entrar no sistema
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          {/* Credenciais demo */}
          <div className="mt-8 p-4 rounded-xl bg-secondary/30 border border-border/50">
            <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-medium">Demo</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Email</span>
                <code className="text-sm text-foreground bg-background px-2 py-0.5 rounded">admin@oficina.com</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Senha</span>
                <code className="text-sm text-foreground bg-background px-2 py-0.5 rounded">123456</code>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground mt-8">
            © 2025 StockTruck · Todos os direitos reservados
          </p>
        </div>
      </div>
    </div>
  )
}
