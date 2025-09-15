"use client"

import { useState, useEffect } from "react"
import { TaskListView } from "@/page/TaskList"
import { CalendarView } from "@/page/Calendar"
import { AnalyticsView } from "@/page/Chart"
import { Navigation } from "@/components/NavBar"
import type { Task } from "@/types/task"
import { useLocalStorage } from "@/hooks/use-local-storage"

export type ViewType = "tasks" | "calendar" | "analytics"

export default function TodoApp() {
  const [currentView, setCurrentView] = useState<ViewType>("tasks")
  const [tasks, setTasks] = useLocalStorage<Task[]>("todo-tasks", [])

  useEffect(() => {
    const migratedTasks = tasks.map((task) => {
      // Check if task has old completed field but no status
      if ("completed" in task && !("status" in task)) {
        const { completed, ...taskWithoutCompleted } = task as any
        return {
          ...taskWithoutCompleted,
          status: completed ? "done" : "todo",
        } as Task
      }
      // Ensure task has status field
      if (!("status" in task)) {
        return { ...(task as Task), status: "todo" as const }
      }
      return task
    })

    // Update tasks if migration was needed
    if (JSON.stringify(migratedTasks) !== JSON.stringify(tasks)) {
      setTasks(migratedTasks)
    }
  }, [tasks, setTasks])

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
