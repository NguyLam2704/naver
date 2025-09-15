"use client"

import type { ViewType } from "@/app/page"
import { Button } from "@/components/ui/button"
import { CheckSquare, Calendar, BarChart3 } from "lucide-react"

interface NavigationProps {
  currentView: ViewType
  onViewChange: (view: ViewType) => void
}

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  const views = [
    { id: "tasks" as const, label: "Task List", icon: CheckSquare },
    { id: "calendar" as const, label: "Calendar", icon: Calendar },
    { id: "analytics" as const, label: "Analytics", icon: BarChart3 },
  ]

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">TaskFlow</h1>
          <nav className="flex gap-2">
            {views.map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={currentView === id ? "default" : "ghost"}
                onClick={() => onViewChange(id)}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}
