// services/TaskService.js
import BaseService from './BaseService.js';

class TaskService extends BaseService {
  static fetchInstance = this.createFetchInstance('/api/v1/tasks');

  static async criar(task) {
    console.log('TaskService.criar - Dados recebidos:', task);
    
    
    const taskData = {
      title: task.title,
      description: task.description || null,
      is_completed: task.is_completed || false,
      todo_id: task.todo_id
    };
    
    console.log('TaskService.criar - Dados que serão enviados:', taskData);
    
    try {
      const response = await this.fetchInstance.post('/', taskData);
      return response;
    } catch (error) {
      this.handleError(error, 'Erro ao criar task');
      throw error;
    }
  }

  static async listarTodas() {
    try {
      const response = await this.fetchInstance.get('/');
      return response;
    } catch (error) {
      this.handleError(error, 'Erro ao listar tasks');
      throw error;
    }
  }

  static async buscarPorId(id) {
    try {
      const response = await this.fetchInstance.get(`/${id}`);
      return response;
    } catch (error) {
      this.handleError(error, `Erro ao buscar task ${id}`);
      throw error;
    }
  }

  static async atualizar(id, task) {
    try {
      const response = await this.fetchInstance.put(`/${id}`, task);
      return response;
    } catch (error) {
      this.handleError(error, `Erro ao atualizar task ${id}`);
      throw error;
    }
  }

  static async completar(id) {
    try {
      const response = await this.fetchInstance.patch(`/${id}`, {
        is_completed: true
      });
      
      console.log('TaskService.completar - Resposta:', response);
      return response;
    } catch (error) {
      this.handleError(error, `Erro ao completar task ${id}`);
      throw error;
    }
  }

  static async descompletar(id) {
    try {
      const response = await this.fetchInstance.patch(`/${id}`, {
        is_completed: false
      });
      return response;
    } catch (error) {
      this.handleError(error, `Erro ao descompletar task ${id}`);
      throw error;
    }
  }

  static async deletar(id) {
    try {
      await this.fetchInstance.delete(`/${id}`);
    } catch (error) {
      this.handleError(error, `Erro ao deletar task ${id}`);
      throw error;
    }
  }


  static async listarPorTodo(todoId) {
    try {
      const response = await this.fetchInstance.get(`?todo_id=${todoId}`);
      return response;
    } catch (error) {
      this.handleError(error, `Erro ao listar tasks do todo ${todoId}`);
      throw error;
    }
  }
}

export default TaskService;