// services/BaseService.js
import axios from 'axios';

const BASE_API_URL = 'http://localhost:8000/api/v1';

export default abstract class BaseService {
  protected static createAxiosInstance(endpoint: string ) {
    const instance = axios.create({
      baseURL: `${BASE_API_URL}/${endpoint}`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });


    return instance;
  }

  protected static handleError(error: unknown, message: string) {
    if (axios.isAxiosError(error)) {
      console.error(`${message}:`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    } else {
      console.error(`${message}:`, error);
    }
  }
}
