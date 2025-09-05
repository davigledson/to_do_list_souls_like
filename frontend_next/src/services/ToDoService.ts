import BaseService from './BaseService';

export interface Todo {
  id?: number;
  title: string;
  user_name?: string;
  created_at?: string;
  updated_at?: string;
  tasks?: Task[];
}

export interface Task {
  id?: number;
  todo_id: number;
  title: string;
  description?: string;
  is_completed: boolean;
  created_at?: string;
  updated_at?: string;
}

export default class TodoService extends BaseService {
  private static axiosInstance = this.createAxiosInstance('todos');

  static async listarTodos(): Promise<Todo[]> {
    const response = await this.axiosInstance.get('/');
    return response.data;
  }

  static async buscarPorId(id: number): Promise<Todo> {
    const response = await this.axiosInstance.get(`/${id}`);
    return response.data;
  }

  static async criar(todo: Omit<Todo, 'id' | 'created_at' | 'updated_at' | 'tasks'>): Promise<Todo> {
    const response = await this.axiosInstance.post('/', todo);
    return response.data;
  }

  static async atualizar(id: number, todo: Partial<Todo>): Promise<Todo> {
    const response = await this.axiosInstance.put(`/${id}`, todo);
    return response.data;
  }

  static async deletar(id: number): Promise<void> {
    await this.axiosInstance.delete(`/${id}`);
  }
}