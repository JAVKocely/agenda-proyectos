import { request } from './client';
import type {
  ProjectSummary,
  ProjectDetail,
  ProjectCreatePayload,
  ProjectUpdatePayload,
  Task,
  TaskCreatePayload,
  TaskUpdatePayload,
  AIGeneratePayload,
} from '../types/project';

export const projectsApi = {
  // Proyectos
  async getProjects(status?: string, search?: string): Promise<ProjectSummary[]> {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (search && search.trim()) params.append('search', search.trim());

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return request<ProjectSummary[]>(`/projects${queryString}`);
  },

  async getProject(id: string): Promise<ProjectDetail> {
    return request<ProjectDetail>(`/projects/${id}`);
  },

  async createProject(payload: ProjectCreatePayload): Promise<ProjectDetail> {
    return request<ProjectDetail>('/projects', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateProject(id: string, payload: ProjectUpdatePayload): Promise<ProjectDetail> {
    return request<ProjectDetail>(`/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async deleteProject(id: string): Promise<{ detail: string }> {
    return request<{ detail: string }>(`/projects/${id}`, {
      method: 'DELETE',
    });
  },

  // Tareas
  async addTask(projectId: string, payload: TaskCreatePayload): Promise<Task> {
    return request<Task>(`/projects/${projectId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateTask(taskId: string, payload: TaskUpdatePayload): Promise<Task> {
    return request<Task>(`/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async deleteTask(taskId: string): Promise<{ detail: string }> {
    return request<{ detail: string }>(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
  },

  // Agente Organizador IA
  async generateProjectWithAI(payload: AIGeneratePayload): Promise<ProjectDetail> {
    return request<ProjectDetail>('/ai/generate-project', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
