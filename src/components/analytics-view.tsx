"use client"

import type { Task } from "@/types/task"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { CheckCircle2, Clock, AlertTriangle, TrendingUp, Calendar, Target } from "lucide-react"

interface AnalyticsViewProps {
  tasks: Task[]
}

export function AnalyticsView({ tasks }: AnalyticsViewProps) {
  // Calculate basic stats
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.status === "done").length
  const pendingTasks = totalTasks - completedTasks
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Overdue tasks
  const today = new Date()
  const overdueTasks = tasks.filter(
    (task) => task.status !== "done" && task.deadline && new Date(task.deadline) < today,
  ).length

  // Priority breakdown
  const priorityStats = {
    high: tasks.filter((task) => task.priority === "high").length,
    medium: tasks.filter((task) => task.priority === "medium").length,
    low: tasks.filter((task) => task.priority === "low").length,
  }

  // Completion by priority
  const priorityCompletion = {
    high: {
      total: priorityStats.high,
      completed: tasks.filter((task) => task.priority === "high" && task.status === "done").length,
    },
    medium: {
      total: priorityStats.medium,
      completed: tasks.filter((task) => task.priority === "medium" && task.status === "done").length,
    },
    low: {
      total: priorityStats.low,
      completed: tasks.filter((task) => task.priority === "low" && task.status === "done").length,
    },
  }

  // Tasks created per day (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return date.toISOString().split("T")[0]
  })

  const tasksPerDay = last7Days.map((date) => {
    const dayTasks = tasks.filter((task) => task.createdAt.split("T")[0] === date)
    const completedOnDay = tasks.filter(
      (task) => task.updatedAt && task.updatedAt.split("T")[0] === date && task.status === "done",
    )

    return {
      date: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
      created: dayTasks.length,
      completed: completedOnDay.length,
    }
  })

  // Priority distribution for pie chart
  const priorityData = [
    { name: "High", value: priorityStats.high, color: "#ef4444" },
    { name: "Medium", value: priorityStats.medium, color: "#f59e0b" },
    { name: "Low", value: priorityStats.low, color: "#3b82f6" },
  ].filter((item) => item.value > 0)

  // Completion status for pie chart
  const completionData = [
    { name: "Completed", value: completedTasks, color: "#10b981" },
    { name: "Pending", value: pendingTasks, color: "#6b7280" },
  ].filter((item) => item.value > 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Analytics</h2>
        <p className="text-muted-foreground">Task completion insights and productivity metrics</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold">{totalTasks}</p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-blue-600">{pendingTasks}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{overdueTasks}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Completion Rate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Overall Completion Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{completionRate}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {completedTasks} of {totalTasks} tasks completed
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {priorityData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">No tasks to display</div>
            )}
            <div className="flex justify-center gap-4 mt-4">
              {priorityData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Completion Status */}
        <Card>
          <CardHeader>
            <CardTitle>Completion Status</CardTitle>
          </CardHeader>
          <CardContent>
            {completionData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={completionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {completionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">No tasks to display</div>
            )}
            <div className="flex justify-center gap-4 mt-4">
              {completionData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tasksPerDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="created" fill="#3b82f6" name="Created" />
                <Bar dataKey="completed" fill="#10b981" name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Priority Completion Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Completion by Priority</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(priorityCompletion).map(([priority, stats]) => {
              const rate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
              return (
                <div key={priority} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          priority === "high"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                            : priority === "medium"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                        }
                      >
                        {priority}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {stats.completed}/{stats.total} tasks
                      </span>
                    </div>
                    <span className="text-sm font-medium">{rate}%</span>
                  </div>
                  <Progress value={rate} className="h-2" />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
