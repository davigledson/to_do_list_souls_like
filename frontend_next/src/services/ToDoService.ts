import BaseService from './BaseService';
export interface ToDo {
  _key: string;
  _id: string;
  _rev: string;
  title: string;
  description?: string;
  completed: boolean;
  userId: string; // FK do usuário dono da task
  createdAt?: string;
  updatedAt?: string;
}


export default class ToDoService extends BaseService {
  private static axiosInstance = this.createAxiosInstance('todos');

  static async listarTodos(): Promise<ToDo[]> {
    try {
      const response = await this.axiosInstance.get('/');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Erro ao buscar ToDos');
      throw error;
    }
  }

  static async buscarPorId(id: string): Promise<ToDo> {
    try {
      const response = await this.axiosInstance.get(`/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Erro ao buscar ToDo ID ${id}`);
      throw error;
    }
  }

  static async criar(todo: Omit<ToDo, '_id' | '_key' | '_rev'>): Promise<ToDo> {
    try {
      const response = await this.axiosInstance.post('/', todo);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Erro ao criar ToDo');
      throw error;
    }
  }

  static async atualizar(id: string, todo: ToDo): Promise<ToDo> {
    try {
      const response = await this.axiosInstance.put(`/${id}`, todo);
      return response.data;
    } catch (error) {
      this.handleError(error, `Erro ao atualizar ToDo ID ${id}`);
      throw error;
    }
  }

  static async atualizarParcial(id: string, updates: Partial<ToDo>): Promise<ToDo> {
    try {
      const response = await this.axiosInstance.patch(`/${id}`, updates);
      return response.data;
    } catch (error) {
      this.handleError(error, `Erro ao atualizar parcialmente ToDo ID ${id}`);
      throw error;
    }
  }

  static async deletar(id: string): Promise<void> {
    try {
      await this.axiosInstance.delete(`/${id}`);
    } catch (error) {
      this.handleError(error, `Erro ao deletar ToDo ID ${id}`);
      throw error;
    }
  }

  // Aqui dá pra encaixar a função de "dar criptomoeda"
  static async completarTask(id: string): Promise<ToDo> {
    try {
      const response = await this.axiosInstance.patch(`/${id}/complete`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Erro ao completar ToDo ID ${id}`);
      throw error;
    }
  }
}
