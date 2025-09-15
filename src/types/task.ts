export interface Task {
  id: string
  title: string
  description?: string
  status: "todo" | "inprogress" | "done"
  priority: "low" | "medium" | "high"
  deadline?: string
  createdAt: string
  updatedAt?: string
}
