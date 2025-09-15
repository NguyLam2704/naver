import { useState } from "react"
import type { Task } from "@/types/task"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar, CheckCircle2, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

interface CalendarViewProps {
  tasks: Task[]
  onUpdateTask: (id: string, updates: Partial<Task>) => void
}

export function CalendarView({ tasks, onUpdateTask }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const today = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDayOfWeek = firstDayOfMonth.getDay()

  // Create calendar grid
  const calendarDays = []

  // Add empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null)
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  // Get tasks for a specific date
  const getTasksForDate = (day: number) => {
    const dateStr = new Date(currentYear, currentMonth, day).toISOString().split("T")[0]
    return tasks.filter((task) => task.deadline === dateStr)
  }

  // Get tasks for selected date
  const selectedDateTasks = selectedDate ? tasks.filter((task) => task.deadline === selectedDate) : []

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
    setSelectedDate(null)
  }

  const handleDateClick = (day: number) => {
    const dateStr = new Date(currentYear, currentMonth, day).toISOString().split("T")[0]
    setSelectedDate(selectedDate === dateStr ? null : dateStr)
  }

  const isToday = (day: number) => {
    return today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear
  }

  const isSelected = (day: number) => {
    const dateStr = new Date(currentYear, currentMonth, day).toISOString().split("T")[0]
    return selectedDate === dateStr
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground select-none">Calendar</h2>
        {/* <p className="text-muted-foreground select-none">View tasks by deadline</p> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {monthNames[currentMonth]} {currentYear}
                </CardTitle>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  if (day === null) {
                    return <div key={index} className="p-2 h-20" />
                  }

                  const dayTasks = getTasksForDate(day)
                  // const hasOverdue = dayTasks.some((task) => task.status !== "done" && new Date(task.deadline!) < today)

                  return (
                    <button
                      key={day}
                      onClick={() => handleDateClick(day)}
                      className={cn(
                        "p-2 h-20 border rounded-lg text-left hover:bg-accent transition-colors",
                        isToday(day) && "border-neutral-900",
                        isSelected(day) && !isToday(day) && "bg-accent",
                        // hasOverdue && "border-red-300 dark:border-red-700",
                      )}
                    >
                      <div className="font-medium text-sm">{day}</div>
                      <div className="space-y-1 mt-1">
                        {dayTasks.slice(0, 2).map((task) => (
                          <div
                            key={task.id}
                            className={cn(
                              "text-xs px-1 py-0.5 rounded truncate",
                                  task.priority === "high"
                                  ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
                                  : task.priority === "medium"
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                    : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
                            )}
                          >
                            {task.title}
                          </div>
                        ))}
                        {dayTasks.length > 2 && (
                          <div className="text-xs text-muted-foreground">+{dayTasks.length - 2} more</div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selected date tasks */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedDate ? `Tasks for ${new Date(selectedDate).toLocaleDateString()}` : "Select a date"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                selectedDateTasks.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDateTasks.map((task) => (
                      <div
                        key={task.id}
                        className={cn("p-3 border rounded-lg space-y-2", task.status === "done" && "opacity-75")}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-2">
                            <button
                              onClick={() => onUpdateTask(task.id, { status: task.status === "done" ? "todo" : "done"  })}
                              className="mt-0.5"
                            >
                              {task.status === "done" ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              ) : (
                                <Circle className="h-4 w-4 text-muted-foreground" />
                              )}
                            </button>
                            <div>
                              <h4
                                className={cn(
                                  "font-medium text-sm",
                                  task.status === "done" && "line-through text-muted-foreground",
                                )}
                              >
                                {task.title}
                              </h4>
                              {task.description && (
                                <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                              )}
                            </div>
                          </div>
                          <Badge
                            className={cn(
                              "text-xs",
                              task.priority === "high" && "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
                              task.priority === "medium" &&
                                "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
                              task.priority === "low" &&
                                "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
                            )}
                          >
                            {task.priority}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm select-none">No tasks for this date.</p>
                )
              ) : (
                <p className="text-muted-foreground text-sm select-none">Click on a date to view tasks with deadlines.</p>
              )}
            </CardContent>
          </Card>

          {/* Calendar legend */}
          <Card className="mt-4 select-none">
            <CardHeader>
              <CardTitle className="text-sm">Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 bg-primary rounded"></div>
                <span>Today</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 bg-orange-100 dark:bg-orange-900 rounded"></div>
                <span>High priority</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 bg-yellow-100 dark:bg-yellow-900 rounded"></div>
                <span>Medium priority</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 bg-blue-50 dark:bg-green-900 rounded"></div>
                <span>Low priority</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
