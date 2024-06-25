import api from './axios';

export default class UserService {
  static async getUser() {
    console.log(localStorage.getItem('token'));
    const userId = localStorage.getItem('userId');
    const response = await api.get(`/usuarios/${userId}`);
    return response.data;

  }
}