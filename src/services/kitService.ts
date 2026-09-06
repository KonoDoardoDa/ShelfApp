import api from "../api/http";
import type { Kit, CreateKitDto, UpdateKitDto, KitDetails } from "../types/kit";

export const kitService = {
  async getAll(): Promise<Kit[]> {
    const response = await api.get<Kit[]>("/Kit/GetAll");
    return response.data;
  },

  async getById(id: number): Promise<Kit> {
    const response = await api.get<Kit>("/Kit/GetById", {
      params: { id },
    });
    return response.data;
  },

  async getWithItems(id: number): Promise<KitDetails> {
    const response = await api.get<KitDetails>(`/Kit/GetWithItems/${id}`);
    return response.data;
  },

  async create(data: CreateKitDto): Promise<Kit> {
    const response = await api.post<Kit>("/Kit/Create", data);
    return response.data;
  },

  async update(id: number, data: UpdateKitDto): Promise<void> {
    await api.put("/Kit/Update", data, {
      params: { id },
    });
  },

  async delete(id: number): Promise<void> {
    await api.delete("/Kit/Delete", {
      params: { id },
    });
  },
};
