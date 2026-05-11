import { Project, Task } from "@/lib/types";

export const demoProjects: Project[] = [
  {
    id: "1",
    title: "Skyline Towers Phase A",
    clientName: "Nova Infra",
    budget: 12000000,
    deadline: "2026-12-15",
    location: "Chennai",
    progressPercentage: 72,
    status: "IN_PROGRESS"
  },
  {
    id: "2",
    title: "Metro Link Station Block",
    clientName: "Urban Rail Corp",
    budget: 8000000,
    deadline: "2026-09-20",
    location: "Bengaluru",
    progressPercentage: 44,
    status: "DELAYED"
  },
  {
    id: "3",
    title: "Green Residences",
    clientName: "Habitat Build",
    budget: 4500000,
    deadline: "2026-07-01",
    location: "Coimbatore",
    progressPercentage: 88,
    status: "IN_PROGRESS"
  }
];

export const demoTasks: Task[] = [
  {
    id: "T-102",
    title: "Foundation concrete quality audit",
    assignedTo: "Engineer Arun",
    priority: "HIGH",
    status: "IN_PROGRESS",
    dueDate: "2026-05-15"
  },
  {
    id: "T-221",
    title: "Electrical duct alignment",
    assignedTo: "Worker Team 4",
    priority: "MEDIUM",
    status: "PENDING",
    dueDate: "2026-05-18"
  },
  {
    id: "T-278",
    title: "Exterior scaffold compliance check",
    assignedTo: "Safety Lead Mira",
    priority: "HIGH",
    status: "DELAYED",
    dueDate: "2026-05-11"
  }
];

export const weeklyProgress = [
  { week: "W1", progress: 35, budget: 15 },
  { week: "W2", progress: 42, budget: 27 },
  { week: "W3", progress: 52, budget: 39 },
  { week: "W4", progress: 61, budget: 50 },
  { week: "W5", progress: 68, budget: 61 },
  { week: "W6", progress: 73, budget: 66 }
];

export const statusSplit = [
  { name: "Completed", value: 28 },
  { name: "In Progress", value: 52 },
  { name: "Delayed", value: 20 }
];
