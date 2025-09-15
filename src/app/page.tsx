import { useState } from "react"
import { TaskListView } from "@/components/task-list-view"
import { CalendarView } from "@/components/calendar-view"
import { AnalyticsView } from "@/components/analytics-view"
import { Navigation } from "@/components/navigation"
import type { Task } from "@/types/task"
import { useLocalStorage } from "@/hooks/use-local-storage"

export type ViewType = "tasks" | "calendar" | "analytics"

export default function TodoApp() {
  const [currentView, setCurrentView] = useState<ViewType>("tasks")
  const [tasks, setTasks] = useLocalStorage<Task[]>("todo-tasks", [])

  const addTask = (task: Omit<Task, "id" | "createdAt">) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    setTasks([...tasks, newTask])
  }

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, ...updates } : task)))
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case "tasks":
        return <TaskListView tasks={tasks} onAddTask={addTask} onUpdateTask={updateTask} onDeleteTask={deleteTask} />
      case "calendar":
        return <CalendarView tasks={tasks} onUpdateTask={updateTask} />
      case "analytics":
        return <AnalyticsView tasks={tasks} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      <main className="container mx-auto px-4 py-8">{renderCurrentView()}</main>
    </div>
  )
}
