import api from "../api/http";
import type { KitItem, CreateKitItemDto, UpdateKitItemDto } from "../types/kit";

export const kitItemService = {
  async getAll(): Promise<KitItem[]> {
    const response = await api.get<KitItem[]>("/KitItem/GetAll");
    return response.data;
  },

  async getByKit(kitId: number): Promise<KitItem[]> {
    const response = await api.get<KitItem[]>("/KitItem/GetByKit", {
      params: { kitId },
    });
    return response.data;
  },

  async getById(kitId: number, itemId: number): Promise<KitItem> {
    const response = await api.get<KitItem>("/KitItem/GetById", {
      params: { kitId, itemId },
    });
    return response.data;
  },

  async create(data: CreateKitItemDto): Promise<KitItem> {
    const response = await api.post<KitItem>("/KitItem/Create", data);
    return response.data;
  },

  async update(kitId: number, itemId: number, data: UpdateKitItemDto): Promise<void> {
    await api.put("/KitItem/Update", data, {
      params: { kitId, itemId },
    });
  },

  async delete(kitId: number, itemId: number): Promise<void> {
    await api.delete("/KitItem/Delete", {
      params: { kitId, itemId },
    });
  },
};
