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
    try {
      const response = await this.axiosInstance.get('/');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Erro ao buscar Todos');
      throw error;
    }
  }

  static async buscarPorId(id: number): Promise<Todo> {
    try {
      const response = await this.axiosInstance.get(`/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Erro ao buscar Todo ID ${id}`);
      throw error;
    }
  }

  static async criar(todo: Omit<Todo, 'id' | 'created_at' | 'updated_at' | 'tasks'>): Promise<Todo> {
    try {
      const response = await this.axiosInstance.post('/', todo);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Erro ao criar Todo');
      throw error;
    }
  }

  static async atualizar(id: number, todo: Partial<Todo>): Promise<Todo> {
    try {
      const response = await this.axiosInstance.put(`/${id}`, todo);
      return response.data;
    } catch (error) {
      this.handleError(error, `Erro ao atualizar Todo ID ${id}`);
      throw error;
    }
  }

  static async deletar(id: number): Promise<void> {
    try {
      await this.axiosInstance.delete(`/${id}`);
    } catch (error) {
      this.handleError(error, `Erro ao deletar Todo ID ${id}`);
      throw error;
    }
  }
}