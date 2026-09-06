import api from "../api/http";
import type { Software, CreateSoftwareDto, UpdateSoftwareDto } from "../types/software";

export const softwareService = {
  async getAll(): Promise<Software[]> {
    const response = await api.get<Software[]>("/Software/GetAll");
    return response.data;
  },

  async getById(id: number): Promise<Software> {
    const response = await api.get<Software>("/Software/GetById", {
      params: { id },
    });
    return response.data;
  },

  async create(data: CreateSoftwareDto): Promise<Software> {
    const response = await api.post<Software>("/Software/Create", data);
    return response.data;
  },

  async update(id: number, data: UpdateSoftwareDto): Promise<void> {
    await api.put("/Software/Update", data, {
      params: { id },
    });
  },

  async delete(id: number): Promise<void> {
    await api.delete("/Software/Delete", {
      params: { id },
    });
  },
};
