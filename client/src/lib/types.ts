export type ProjectStatus = "PLANNING" | "IN_PROGRESS" | "COMPLETED" | "DELAYED";
export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "DELAYED";
export type DesignWall = {
  id: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  rotationY: number;
  color?: string;
};

export type DesignOpening = {
  id: string;
  wallId: string;
  kind: "door" | "window";
  offset: number;
  width: number;
  height: number;
  sillHeight: number;
};

export type DesignCameraState = {
  mode: "perspective" | "orthographic";
  preset: "free" | "iso" | "top" | "front" | "right" | "left";
};

export type DesignRecord = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  data: {
    walls: DesignWall[];
    openings?: DesignOpening[];
    camera?: DesignCameraState;
  };
};

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
