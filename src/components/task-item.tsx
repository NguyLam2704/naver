"use client"

import { useState } from "react"
import type { Task } from "@/types/task"
import { TaskForm } from "@/components/task-form"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit2, Trash2, Calendar, ArrowRight, ArrowLeft, GripVertical  } from "lucide-react"
import { cn } from "@/lib/utils"

interface TaskItemProps {
  task: Task
  onUpdate: (updates: Partial<Task>) => void
  onDelete: () => void
  onStatusChange?: (taskId: string, newStatus: Task["status"]) => void
  showStatusControls?: boolean
}

export function TaskItem({
  task,
  onUpdate,
  onDelete,
  onStatusChange,
  showStatusControls,
  onDragStart,
  onDragEnd,
  isDragging,
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false)

  const priorityColors = {
    low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  }

  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== "done"

  const getStatusTransitions = (currentStatus: Task["status"]) => {
    switch (currentStatus) {
      case "todo":
        return [{ status: "inprogress" as const, label: "Start", icon: ArrowRight }]
      case "inprogress":
        return [
          { status: "todo" as const, label: "Back", icon: ArrowLeft },
          { status: "done" as const, label: "Complete", icon: ArrowRight },
        ]
      case "done":
        return [{ status: "inprogress" as const, label: "Reopen", icon: ArrowLeft }]
      default:
        return []
    }
  }

  if (isEditing) {
    return (
      <Card>
        <CardContent className="p-4">
          <TaskForm
            task={task}
            onSubmit={(updates) => {
              onUpdate(updates)
              setIsEditing(false)
            }}
            onCancel={() => setIsEditing(false)}
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        "transition-all hover:shadow-md cursor-move",
        task.status === "done" && "opacity-75",
        isOverdue && "border-red-200 dark:border-red-800",
      isDragging && "opacity-50 rotate-2 scale-105",
      )}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move"
        onDragStart?.()
      }}
      onDragEnd={onDragEnd}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
             <div className="flex items-start gap-2 flex-1">
              <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <h3
              className={cn(
                "font-medium text-foreground",
                task.status === "done" && "line-through text-muted-foreground",
              )}
            >
              {task.title}
            </h3>
          </div>

            <div className="flex items-center gap-2">
              <Badge className={priorityColors[task.priority]}>{task.priority}</Badge>

              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="h-8 w-8 p-0">
                <Edit2 className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {task.description && (
            <p className={cn("text-sm text-muted-foreground", task.status === "done" && "line-through")}>
              {task.description}
            </p>
          )}

          {task.deadline && (
            <div className="flex items-center gap-1 text-sm">
              <Calendar className="h-3 w-3" />
              <span className={cn(isOverdue ? "text-red-600 dark:text-red-400 font-medium" : "text-muted-foreground")}>
                {new Date(task.deadline).toLocaleDateString()}
                {isOverdue && " (Overdue)"}
              </span>
            </div>
          )}

          {showStatusControls && onStatusChange && (
            <div className="flex gap-2 pt-2 border-t">
              {getStatusTransitions(task.status).map((transition) => {
                const Icon = transition.icon
                return (
                  <Button
                    key={transition.status}
                    variant="outline"
                    size="sm"
                    onClick={() => onStatusChange(task.id, transition.status)}
                    className="flex items-center gap-1 text-xs"
                  >
                    <Icon className="h-3 w-3" />
                    {transition.label}
                  </Button>
                )
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
