import api from "../api/http";
import type { Fornecedor, CreateFornecedorDto, UpdateFornecedorDto } from "../types/fornecedor";

export const fornecedorService = {
  async getAll(): Promise<Fornecedor[]> {
    const response = await api.get<Fornecedor[]>("/Fornecedor/GetAll");
    return response.data;
  },

  async getById(id: number): Promise<Fornecedor> {
    const response = await api.get<Fornecedor>("/Fornecedor/GetById", {
      params: { id },
    });
    return response.data;
  },

  async create(data: CreateFornecedorDto): Promise<Fornecedor> {
    const response = await api.post<Fornecedor>("/Fornecedor/Create", data);
    return response.data;
  },

  async update(id: number, data: UpdateFornecedorDto): Promise<void> {
    await api.put("/Fornecedor/Update", data, {
      params: { id },
    });
  },

  async toggleStatus(id: number): Promise<void> {
    await api.patch(`/Fornecedor/ToggleStatus/${id}`);
  },

  async delete(id: number): Promise<void> {
    await api.delete("/Fornecedor/Delete", {
      params: { id },
    });
  },
};
