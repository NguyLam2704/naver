import type React from "react"

import { useState } from "react"
import type { Task } from "@/types/task"
import { TaskForm } from "@/components/task-form"
import { TaskItem } from "@/components/task-item"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface TaskListViewProps {
  tasks: Task[]
  onAddTask: (task: Omit<Task, "id" | "createdAt">) => void
  onUpdateTask: (id: string, updates: Partial<Task>) => void
  onDeleteTask: (id: string) => void
}

export function TaskListView({ tasks, onAddTask, onUpdateTask, onDeleteTask }: TaskListViewProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [draggedTask, setDraggedTask] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)

  const todoTasks = tasks.filter((task) => task.status === "todo")
  const inProgressTasks = tasks.filter((task) => task.status === "inprogress")
  const doneTasks = tasks.filter((task) => task.status === "done")

  const columns = [
    { id: "todo", title: "To Do", tasks: todoTasks, color: "bg-blue-50 border-blue-200" },
    { id: "inprogress", title: "In Progress", tasks: inProgressTasks, color: "bg-yellow-50 border-yellow-200" },
    { id: "done", title: "Done", tasks: doneTasks, color: "bg-green-50 border-green-200" },
  ]

  const handleStatusChange = (taskId: string, newStatus: Task["status"]) => {
    onUpdateTask(taskId, { status: newStatus, updatedAt: new Date().toISOString() })
  }

  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId)
  }

  const handleDragEnd = () => {
    setDraggedTask(null)
    setDragOverColumn(null)
  }

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    setDragOverColumn(columnId)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    if (draggedTask && columnId !== draggedTask) {
      const newStatus = columnId as Task["status"]
      handleStatusChange(draggedTask, newStatus)
    }
    setDraggedTask(null)
    setDragOverColumn(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Task Board</h2>
          <p className="text-muted-foreground">
            {todoTasks.length} to do, {inProgressTasks.length} in progress, {doneTasks.length} completed
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Task</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskForm
              onSubmit={(task) => {
                onAddTask({ ...task, status: "todo" })
                setShowAddForm(false)
              }}
              onCancel={() => setShowAddForm(false)}
            />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => (
          <div key={column.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg text-foreground">{column.title}</h3>
              <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">
                {column.tasks.length}
              </span>
            </div>

            <div
              className={`min-h-[400px] p-4 rounded-lg border-2 border-dashed ${column.color} space-y-3 transition-colors ${
                dragOverColumn === column.id ? "border-solid border-primary bg-primary/5" : ""
              }`}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {column.tasks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">No tasks in {column.title.toLowerCase()}</p>
                  {dragOverColumn === column.id && <p className="text-primary text-sm mt-2">Drop task here</p>}
                </div>
              ) : (
                column.tasks
                  .sort((a, b) => {
                    // Sort by priority, then by deadline
                    const priorityOrder = { high: 3, medium: 2, low: 1 }
                    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                      return priorityOrder[b.priority] - priorityOrder[a.priority]
                    }
                    if (a.deadline && b.deadline) {
                      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
                    }
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                  })
                  .map((task) => (
                    <div
                      key={task.id}
                      className={`bg-white rounded-lg shadow-sm border transition-opacity ${
                        draggedTask === task.id ? "opacity-50" : ""
                      }`}
                      draggable
                      onDragStart={() => handleDragStart(task.id)}
                      onDragEnd={handleDragEnd}
                    >
                      <TaskItem
                        task={task}
                        onUpdate={(updates) => onUpdateTask(task.id, updates)}
                        onDelete={() => onDeleteTask(task.id)}
                        onStatusChange={handleStatusChange}
                        showStatusControls={true}
                        isDragging={draggedTask === task.id}
                      />
                    </div>
                  ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
