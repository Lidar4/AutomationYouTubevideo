import * as React from "react"
import { Sidebar } from "./Sidebar"

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-14 border-b border-border flex items-center px-6 shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="ml-auto flex items-center gap-4">
            <div className="text-xs text-muted-foreground font-mono">
              STATUS: <span className="text-success ml-1">ONLINE</span>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6">
          <div className="mx-auto w-full max-w-7xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
