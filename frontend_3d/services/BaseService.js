// services/BaseService.js
const BASE_API_URL = 'http://localhost:8000/api/v1';

class BaseService {
  /**
   * Cria uma instância de fetch configurada para um endpoint específico
   * @param {string} endpoint - O endpoint da API
   * @returns {Object} Objeto com métodos HTTP configurados
   */
  static createFetchInstance(endpoint) {
    const baseURL = `${BASE_API_URL}/${endpoint}`;
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    return {
      async get(path = '', options = {}) {
        return this._request('GET', path, null, options);
      },

      async post(path = '', data = null, options = {}) {
        return this._request('POST', path, data, options);
      },

      async put(path = '', data = null, options = {}) {
        return this._request('PUT', path, data, options);
      },

      async patch(path = '', data = null, options = {}) {
        return this._request('PATCH', path, data, options);
      },

      async delete(path = '', options = {}) {
        return this._request('DELETE', path, null, options);
      },

      async _request(method, path, data, options) {
        const url = `${baseURL}${path}`;
        
        const config = {
          method,
          headers: { ...defaultHeaders, ...options.headers },
          ...options
        };

        // Adiciona body apenas para métodos que suportam
        if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
          config.body = JSON.stringify(data);
        }

        // Timeout personalizado
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), options.timeout || 10000);
        config.signal = controller.signal;

        try {
          const response = await fetch(url, config);
          clearTimeout(timeoutId);
          
          // Status 204 (No Content) retorna null
          if (response.status === 204) {
            return null;
          }

          // Verifica se a resposta foi bem-sucedida
          if (!response.ok) {
            const errorData = await response.text().catch(() => 'Erro desconhecido');
            throw new Error(`HTTP ${response.status}: ${errorData}`);
          }

          // Tenta fazer parse do JSON, se não conseguir retorna texto
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            return await response.json();
          }
          
          return await response.text();
        } catch (error) {
          clearTimeout(timeoutId);
          BaseService.handleError(error, `Erro na requisição ${method} ${url}`);
          throw error;
        }
      }
    };
  }

  /**
   * Manipula erros de forma consistente
   * @param {Error} error - O erro capturado
   * @param {string} message - Mensagem personalizada
   */
  static handleError(error, message) {
    if (error.name === 'AbortError') {
      console.error(`${message}: Timeout da requisição`);
    } else if (error.message.includes('HTTP')) {
      console.error(`${message}:`, error.message);
    } else if (error.message.includes('fetch')) {
      console.error(`${message}: Erro de conexão`, error);
    } else {
      console.error(`${message}:`, error);
    }
  }
}

export default BaseService;