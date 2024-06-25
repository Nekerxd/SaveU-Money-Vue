import api from './axios';

export default class LancamentosService {
  static async create(movimentacaoDto) {
    console.log(movimentacaoDto)
    const response = await api.post(`/movimentacoes`, movimentacaoDto);
    return response.data;
  }

  static async getById(id) {
    const response = await api.get(`/movimentacoes/${id}`);
    return response.data;
  }

  static async deleteMovimentacao(id) {
    await api.delete(`/movimentacoes/${id}`);
  }

  static async listAll() {
    const response = await api.get(`/movimentacoes`);
    console.log(response.data)
    return response.data;
  }

  static async listAllDespesas() {
    const response = this.listAll()
    response.data
    return response.data;
  }

  static async updateMovimentacao(id, movimentacaoDto) {
    movimentacaoDto = {
      ...movimentacaoDto,
      category: movimentacaoDto.category.value,
      type: movimentacaoDto.type.value,
      status: movimentacaoDto.status.value,
    }
    const response = await api.put(`/movimentacoes/${id}`, movimentacaoDto);
    return response.data;
  }
}