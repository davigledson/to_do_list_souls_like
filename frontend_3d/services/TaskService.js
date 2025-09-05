// services/TaskService.js
import BaseService from './BaseService.js';

class TaskService extends BaseService {
  static fetchInstance = this.createFetchInstance('tasks');

  /**
   * Cria uma nova task
   * @param {Object} task - Dados da task
   * @param {string} task.title - Título da task
   * @param {string} [task.description] - Descrição da task
   * @param {boolean} task.is_completed - Status de conclusão
   * @param {number} task.todo_id - ID do todo pai
   * @returns {Promise<Object>} Task criada
   */
  static async criar(task) {
    console.log('TaskService.criar - Dados recebidos:', task);
    
    // Garantir que todos os campos obrigatórios estão presentes
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

  /**
   * Lista todas as tasks
   * @returns {Promise<Array>} Lista de tasks
   */
  static async listarTodas() {
    try {
      const response = await this.fetchInstance.get('/');
      return response;
    } catch (error) {
      this.handleError(error, 'Erro ao listar tasks');
      throw error;
    }
  }

  /**
   * Busca uma task por ID
   * @param {number} id - ID da task
   * @returns {Promise<Object>} Task encontrada
   */
  static async buscarPorId(id) {
    try {
      const response = await this.fetchInstance.get(`/${id}`);
      return response;
    } catch (error) {
      this.handleError(error, `Erro ao buscar task ${id}`);
      throw error;
    }
  }

  /**
   * Atualiza uma task
   * @param {number} id - ID da task
   * @param {Object} task - Dados parciais da task para atualizar
   * @returns {Promise<Object>} Task atualizada
   */
  static async atualizar(id, task) {
    try {
      const response = await this.fetchInstance.put(`/${id}`, task);
      return response;
    } catch (error) {
      this.handleError(error, `Erro ao atualizar task ${id}`);
      throw error;
    }
  }

  /**
   * Marca uma task como completa
   * @param {number} id - ID da task
   * @returns {Promise<Object>} Task atualizada
   */
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

  /**
   * Marca uma task como incompleta
   * @param {number} id - ID da task
   * @returns {Promise<Object>} Task atualizada
   */
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

  /**
   * Deleta uma task
   * @param {number} id - ID da task
   * @returns {Promise<void>}
   */
  static async deletar(id) {
    try {
      await this.fetchInstance.delete(`/${id}`);
    } catch (error) {
      this.handleError(error, `Erro ao deletar task ${id}`);
      throw error;
    }
  }

  /**
   * Lista tasks por todo_id
   * @param {number} todoId - ID do todo
   * @returns {Promise<Array>} Lista de tasks do todo
   */
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