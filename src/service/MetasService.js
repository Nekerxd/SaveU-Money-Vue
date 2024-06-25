import api from './axios';

export default class MetasService {
  static async create(metaDto) {
    console.log(metaDto)
    const response = await api.post(`/metas`, metaDto);
    return response.data;
  }

  static async getById(id) {
    const response = await api.get(`/metas/${id}`);
    return response.data;
  }

  static async listAll() {
    const response = await api.get(`/metas`);
    console.log(response.data)
    return response.data;
  }

  static async listAllDespesas() {
    const response = this.listAll()
    response.data
    return response.data;
  }

  static async updateMovimentacao(id, metaDto) {
    metaDto = {...metaDto}
    const response = await api.patch(`/metas/${id}`, metaDto);
    return response.data;
  }

  static async deleteMeta(meta) {
    let userId = localStorage.getItem('userId')
    await api.delete(`/metas/${meta}`, {params: {idUsuario: userId}});
  }
}