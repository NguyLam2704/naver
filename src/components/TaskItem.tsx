import { useState } from "react"
import type { Task } from "@/types/task"
import { TaskForm } from "@/components/AddTaskForm"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit2, Trash2, Calendar, GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"

interface TaskItemProps {
  task: Task
  onUpdate: (updates: Partial<Task>) => void
  onDelete: () => void
  onStatusChange?: (taskId: string, newStatus: Task["status"]) => void
  showStatusControls?: boolean
  onDragStart?: () => void
  onDragEnd?: () => void
  isDragging?: boolean
}

export function TaskItem({
  task,
  onUpdate,
  onDelete,
  onDragStart,
  onDragEnd,
  isDragging,
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false)

  const priorityColors = {
    low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    high: "bg-orange-200 text-orange-800 dark:bg-red-900 dark:text-orange-300",
  }

  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== "done"

  if (isEditing) {
    return (
      <Card>
        <CardContent className="p-3 sm:p-4">
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
        "transition-all hover:shadow-md cursor-move border border-gray-200 dark:border-gray-800 rounded-lg min-h-[120px] min-w-0",
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
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2">
            {/* Title */}
            <div className="flex items-start gap-2 min-w-0">
              <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0 hidden xs:block" />
              <h3
                className={cn(
                  "font-medium text-foreground text-base truncate w-full",
                  task.status === "done" && "line-through text-muted-foreground",
                )}
                title={task.title}
              >
                {task.title}
              </h3>
            </div>
            {/* Badge + Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0 mt-1 md:mt-0">
              <Badge className={cn(priorityColors[task.priority], "text-xs px-2 py-1")}>
                {task.priority}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="h-8 w-8 p-0"
              >
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
            <p
              className={cn(
                "text-sm text-muted-foreground break-words",
                task.status === "done" && "line-through",
              )}
            >
              {task.description}
            </p>
          )}

          {task.deadline && (
            <div className="flex items-center gap-1 text-sm">
              <Calendar className="h-3 w-3 flex-shrink-0" />
              <span
                className={cn(
                  "break-all",
                  isOverdue ? "text-red-600 dark:text-red-400 font-medium" : "text-muted-foreground",
                )}
              >
                {new Date(task.deadline).toLocaleDateString()}
                {isOverdue && " (Overdue)"}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
