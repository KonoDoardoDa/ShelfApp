import api from "../api/http";
import type { Item, CreateItemDto, UpdateItemDto } from "../types/item";

export const itemService = {
  async getAll(): Promise<Item[]> {
    const response = await api.get<Item[]>("/Item/GetAllItems");
    return response.data;
  },

  async getById(id: number): Promise<Item> {
    const response = await api.get<Item>("/Item/GetItemById", {
      params: { id },
    });
    return response.data;
  },

  async create(data: CreateItemDto): Promise<number> {
    const response = await api.post<number>("/Item/CreateItem", data);
    return response.data;
  },

  async update(data: UpdateItemDto): Promise<void> {
    await api.put("/Item/UpdateItem", data);
  },

  async toggleStatus(id: number): Promise<void> {
    await api.patch(`/Item/ToggleStatus/${id}`);
  },

  async delete(id: number): Promise<void> {
    await api.delete("/Item/DeleteItem", {
      params: { id },
    });
  },
};
