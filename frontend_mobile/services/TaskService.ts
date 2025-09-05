import BaseService from './BaseService';

export interface Task {
  id?: number;
  todo_id: number;
  title: string;
  description?: string;
  is_completed: boolean;
  created_at?: string;
  updated_at?: string;
}

export default class TaskService extends BaseService {
  private static axiosInstance = this.createAxiosInstance('tasks');

  static async criar(task: { title: string; description?: string; is_completed: boolean; todo_id: number }): Promise<Task> {
    console.log('TaskService.criar - Dados recebidos:', task);
    
    // Garantir que todos os campos obrigatórios estão presentes
    const taskData = {
      title: task.title,
      description: task.description || null,
      is_completed: task.is_completed || false,
      todo_id: task.todo_id
    };
    
    console.log('TaskService.criar - Dados que serão enviados:', taskData);
    
    const response = await this.axiosInstance.post('/', taskData);
    return response.data;
  }

  static async atualizar(id: number, task: Partial<Task>): Promise<Task> {
    const response = await this.axiosInstance.put(`/${id}`, task);
    return response.data;
  }

  static async completar(id: number): Promise<Task> {
   const response = await this.axiosInstance.patch(`/${id}`, {
    is_completed: true
  });
     console.log('TaskService.completar - Dados que serão enviados:',  response.data);
   
    return response.data;
  }

  static async deletar(id: number): Promise<void> {
    await this.axiosInstance.delete(`/${id}`);
  }
}