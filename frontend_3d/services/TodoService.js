// services/TodoService.js
import BaseService from './BaseService.js';

class TodoService extends BaseService {
 static fetchInstance = this.createFetchInstance('/api/v1/todos');
  static xmlFetchInstance = this.createFetchInstance('/api/xml/todos');

  static async listarTodos() {
    try {
      const response = await this.fetchInstance.get('/');
      return response;
    } catch (error) {
      this.handleError(error, 'Erro ao listar todos');
      throw error;
    }
  }


  static async buscarPorId(id) {
    try {
      const response = await this.fetchInstance.get(`/${id}`);
      return response;
    } catch (error) {
      this.handleError(error, `Erro ao buscar todo ${id}`);
      throw error;
    }
  }


  static async criar(todo) {
    console.log('TodoService.criar - Dados recebidos:', todo);
    
    try {
      const response = await this.fetchInstance.post('/', todo);
      console.log('TodoService.criar - Todo criado:', response);
      return response;
    } catch (error) {
      this.handleError(error, 'Erro ao criar todo');
      throw error;
    }
  }


  static async atualizar(id, todo) {
    console.log('TodoService.atualizar - Dados recebidos:', { id, todo });
    
    try {
      const response = await this.fetchInstance.put(`/${id}`, todo);
      console.log('TodoService.atualizar - Todo atualizado:', response);
      return response;
    } catch (error) {
      this.handleError(error, `Erro ao atualizar todo ${id}`);
      throw error;
    }
  }

  static async deletar(id) {
    console.log('TodoService.deletar - ID:', id);
    
    try {
      await this.fetchInstance.delete(`/${id}`);
      console.log('TodoService.deletar - Todo deletado com sucesso');
    } catch (error) {
      this.handleError(error, `Erro ao deletar todo ${id}`);
      throw error;
    }
  }


  static async buscarComTasks(id) {
    try {
      const response = await this.fetchInstance.get(`/${id}?include_tasks=true`);
      return response;
    } catch (error) {
      this.handleError(error, `Erro ao buscar todo ${id} com tasks`);
      throw error;
    }
  }


  static async listarPorUsuario(userName) {
    try {
      const response = await this.fetchInstance.get(`?user_name=${encodeURIComponent(userName)}`);
      return response;
    } catch (error) {
      this.handleError(error, `Erro ao listar todos do usuário ${userName}`);
      throw error;
    }
  }


   // --- NOVOS MÉTODOS (XML) ---

  
  static async listarTodosXml() {
    try {
      // Usa a instância de XML e espera uma resposta de texto
      const response = await this.xmlFetchInstance.get('/');
      return response;
    } catch (error) {
      this.handleError(error, 'Erro ao listar todos em XML');
      throw error;
    }
  }

  
  static async obterTodoXml(id) {
    try {
      // Usa a instância de XML para buscar um item específico
      const response = await this.xmlFetchInstance.get(`/${id}/`);
      return response;
    } catch (error) {
      this.handleError(error, `Erro ao buscar todo ${id} em XML`);
      throw error;
    }
  }
}

export default TodoService;