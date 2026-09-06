import api from "../api/http";
import type {
  MovimentarEstoqueDto,
  MovimentacaoResponse,
  MovimentacaoHistorico,
} from "../types/item";

export const estoqueService = {
  async getSaldo(itemId: number): Promise<number> {
    const response = await api.get<{ itemId: number; saldo: number }>("/Estoque/GetSaldo", {
      params: { itemId },
    });
    return response.data.saldo;
  },

  async movimentar(data: MovimentarEstoqueDto): Promise<MovimentacaoResponse> {
    const response = await api.post<MovimentacaoResponse>("/Estoque/Movimentar", data);
    return response.data;
  },

  async getHistorico(itemId?: number, limit: number = 100): Promise<MovimentacaoHistorico[]> {
    const response = await api.get<MovimentacaoHistorico[]>("/Estoque/Historico", {
      params: {
        itemId: itemId || undefined,
        limit,
      },
    });
    return response.data;
  },
};
