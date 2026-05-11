export type ProjectStatus = "PLANNING" | "IN_PROGRESS" | "COMPLETED" | "DELAYED";
export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "DELAYED";

export interface Project {
  id: string;
  title: string;
  clientName: string;
  budget: number;
  deadline: string;
  location: string;
  progressPercentage: number;
  status: ProjectStatus;
}

export interface Task {
  id: string;
  title: string;
  assignedTo: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: TaskStatus;
  dueDate: string;
}
