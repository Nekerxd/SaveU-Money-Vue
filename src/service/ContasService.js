import api from './axios';

export default class ContasService {
  static async create(contaDto) {
    const response = await api.post(`/contas`, contaDto);
    return response.data;
  }

  static async getById(id) {
    const response = await api.get(`/contas/${id}`);
    return response.data;
  }

  static async deleteConta(id) {
    const userId = localStorage.getItem('userId');
    console.log(localStorage.getItem('token'));

    await api.delete('/contas', {
      params: {
        id: id,
        idUsuario: userId
      }
    });
  }

  static async updateConta(id, contaDto) {
    const response = await api.patch(`/contas/${id}`, contaDto);
    return response.data;
  }

  static async getBancos() {
    const response = await api.get(`/bancos`);
    return response.data;
  }
}