import BaseService from './BaseService';

export interface User {
  _key: string;
  _id: string;
  _rev: string;

  name: string;
  email: string;
  password?: string; // opcional se não retornar para o cliente
  role?: 'admin' | 'user'; // papel do usuário
  balance?: number; // exemplo: saldo de criptomoeda
}

export default class UserService extends BaseService {
  private static axiosInstance = this.createAxiosInstance('user');

  static async listarTodos(): Promise<User[]> {
    try {
      const response = await this.axiosInstance.get('/');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Erro ao buscar Usuários');
      throw error;
    }
  }

  static async buscarPorId(id: string): Promise<User> {
    try {
      const response = await this.axiosInstance.get(`/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Erro ao buscar Usuário ID ${id}`);
      throw error;
    }
  }

  static async criar(user: Omit<User, '_id' | '_rev' | '_key'>): Promise<User> {
    try {
      const response = await this.axiosInstance.post('/', user);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Erro ao criar Usuário');
      throw error;
    }
  }

  static async atualizar(id: string, user: User): Promise<User> {
    try {
      const response = await this.axiosInstance.put(`/${id}`, user);
      return response.data;
    } catch (error) {
      this.handleError(error, `Erro ao atualizar Usuário ID ${id}`);
      throw error;
    }
  }

  static async atualizarParcial(id: string, updates: Partial<User>): Promise<User> {
    try {
      const response = await this.axiosInstance.patch(`/${id}`, updates);
      return response.data;
    } catch (error) {
      this.handleError(error, `Erro ao atualizar parcialmente Usuário ID ${id}`);
      throw error;
    }
  }

  static async deletar(id: string): Promise<void> {
    try {
      await this.axiosInstance.delete(`/${id}`);
    } catch (error) {
      this.handleError(error, `Erro ao deletar Usuário ID ${id}`);
      throw error;
    }
  }
}
