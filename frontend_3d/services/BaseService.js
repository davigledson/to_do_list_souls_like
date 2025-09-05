// services/BaseService.js

// A URL base agora aponta para a raiz do servidor, não para a API
const BASE_URL = 'http://localhost:8000'; 

class BaseService {

  static createFetchInstance(baseURL) {
    const fullBaseURL = `${BASE_URL}${baseURL}`; // Monta a URL completa
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json', // O _request vai sobrescrever isso se necessário
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
        const url = `${fullBaseURL}${path}`; 
        
        const config = {
          method,
          headers: { ...defaultHeaders, ...options.headers },
          ...options
        };

        if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
          config.body = JSON.stringify(data);
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), options.timeout || 10000);
        config.signal = controller.signal;

        try {
          const response = await fetch(url, config);
          clearTimeout(timeoutId);

          
          if (!response.ok) {
          
            const errorBody = await response.text();
            
           
            console.error(` Erro do Servidor (Status ${response.status}):`, errorBody);

            // Lança um erro que inclui o status e o corpo da resposta
            throw new Error(`HTTP ${response.status}: ${errorBody}`);
          }
          
          if (response.status === 204) {
            return null;
          }

          if (!response.ok) {
            const errorData = await response.text().catch(() => 'Erro desconhecido');
            throw new Error(`HTTP ${response.status}: ${errorData}`);
          }
          
         
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
    // ... (sua função de erro, sem alterações)
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
