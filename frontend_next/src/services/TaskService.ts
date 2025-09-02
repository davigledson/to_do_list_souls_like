import BaseService from './BaseService';
export interface Task {
  _key: string;
  _id: string;
  _rev: string;
  title: string;
  description?: string;
  completed: boolean;
  userId: string; 
  reward?: number; // quantidade de criptomoeda que o usuário ganha ao completar
  createdAt?: string;
  updatedAt?: string;
}

export default class TaskService extends BaseService {
  private static axiosInstance = this.createAxiosInstance('task');

  static async listarTodos(): Promise<Task[]> {
    try {
      const response = await this.axiosInstance.get('/');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Erro ao buscar Tasks');
      throw error;
    }
  }

  static async buscarPorId(id: string): Promise<Task> {
    try {
      const response = await this.axiosInstance.get(`/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Erro ao buscar Task ID ${id}`);
      throw error;
    }
  }

  static async criar(task: Omit<Task, '_id' | '_key' | '_rev'>): Promise<Task> {
    try {
      const response = await this.axiosInstance.post('/', task);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Erro ao criar Task');
      throw error;
    }
  }

  static async atualizar(id: string, task: Task): Promise<Task> {
    try {
      const response = await this.axiosInstance.put(`/${id}`, task);
      return response.data;
    } catch (error) {
      this.handleError(error, `Erro ao atualizar Task ID ${id}`);
      throw error;
    }
  }

  static async atualizarParcial(id: string, updates: Partial<Task>): Promise<Task> {
    try {
      const response = await this.axiosInstance.patch(`/${id}`, updates);
      return response.data;
    } catch (error) {
      this.handleError(error, `Erro ao atualizar parcialmente Task ID ${id}`);
      throw error;
    }
  }

  static async deletar(id: string): Promise<void> {
    try {
      await this.axiosInstance.delete(`/${id}`);
    } catch (error) {
      this.handleError(error, `Erro ao deletar Task ID ${id}`);
      throw error;
    }
  }

 
}
