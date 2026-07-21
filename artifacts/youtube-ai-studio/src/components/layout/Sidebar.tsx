import * as React from "react"
import { Link, useLocation } from "wouter"
import { LayoutDashboard, Compass, Video, ListTree, PlaySquare, Settings2, Cpu, BarChart3, Fingerprint } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", href: "/", icon: <LayoutDashboard className="h-4 w-4" /> },
    ]
  },
  {
    title: "AI Tools",
    items: [
      { title: "Research Engine", href: "/research", icon: <Compass className="h-4 w-4" /> },
      { title: "Content Studio", href: "/content", icon: <Video className="h-4 w-4" /> },
      { title: "Video Pipeline", href: "/pipeline", icon: <ListTree className="h-4 w-4" /> },
    ]
  },
  {
    title: "YouTube",
    items: [
      { title: "YouTube Studio", href: "/youtube", icon: <PlaySquare className="h-4 w-4" /> },
    ]
  },
  {
    title: "Automation",
    items: [
      { title: "Automation Center", href: "/automation", icon: <Cpu className="h-4 w-4" /> },
    ]
  },
  {
    title: "Settings",
    items: [
      { title: "API Center", href: "/api-settings", icon: <Settings2 className="h-4 w-4" /> },
    ]
  }
]

export function Sidebar() {
  const [location] = useLocation()

  return (
    <div className="flex h-screen w-64 flex-col border-r border-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center border-b border-border px-4">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-primary">
          <Fingerprint className="h-6 w-6" />
          <span>YouTube AI Studio</span>
        </Link>
      </div>
      
      <div className="flex-1 overflow-auto py-4">
        {navGroups.map((group, i) => (
          <div key={i} className="mb-6 px-4">
            <h4 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
              {group.title}
            </h4>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = location === item.href
                return (
                  <Link key={item.href} href={item.href} className={cn(
                    "flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}>
                    {item.icon}
                    {item.title}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 rounded-md bg-secondary/50 p-3">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">C</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-none">Creator Pro</span>
            <span className="text-xs text-muted-foreground mt-1">Enterprise Plan</span>
          </div>
        </div>
      </div>
    </div>
  )
}
