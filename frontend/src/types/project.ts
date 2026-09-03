export type ProjectStatus = 'active' | 'paused' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'stuck' | 'completed';

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  group_name?: string | null;
  order: number;
  due_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectSummary {
  id: string;
  title: string;
  description?: string | null;
  status: ProjectStatus;
  estimated_completion_days?: number | null;
  target_date?: string | null;
  created_at: string;
  updated_at: string;
  total_tasks: number;
  completed_tasks: number;
  progress_percentage: number;
}

export interface ProjectDetail extends ProjectSummary {
  raw_prompt?: string | null;
  tasks: Task[];
}

export interface ProjectCreatePayload {
  title: string;
  description?: string;
  status?: ProjectStatus;
  estimated_completion_days?: number;
}

export interface ProjectUpdatePayload {
  title?: string;
  description?: string;
  status?: ProjectStatus;
  estimated_completion_days?: number;
  target_date?: string;
}

export interface TaskCreatePayload {
  title: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  group_name?: string;
  order?: number;
  due_date?: string;
}

export interface TaskUpdatePayload {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  group_name?: string;
  order?: number;
  due_date?: string;
}

export interface AIGeneratePayload {
  prompt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  color?: string;
  created_at?: string;
}
