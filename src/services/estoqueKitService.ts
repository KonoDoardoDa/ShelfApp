import api from "../api/http";
import type {
  KitSaldo,
  MontarKitDto,
  DesmontarKitDto,
  MovimentarKitManualDto,
  MovimentacaoKitDetalhe,
  ResultadoOperacaoKit,
  ItemSimulacaoInput,
  SimulacaoProducaoResultado,
} from "../types/estoqueKit";

export const estoqueKitService = {
  async getAllSaldos(): Promise<KitSaldo[]> {
    const response = await api.get<KitSaldo[]>("/EstoqueKit/Saldos");
    return response.data;
  },

  async getSaldoById(kitId: number): Promise<KitSaldo> {
    const response = await api.get<KitSaldo>(`/EstoqueKit/Saldo/${kitId}`);
    return response.data;
  },

  async montarKit(data: MontarKitDto): Promise<ResultadoOperacaoKit> {
    const response = await api.post<ResultadoOperacaoKit>("/EstoqueKit/Montar", data);
    return response.data;
  },

  async desmontarKit(data: DesmontarKitDto): Promise<ResultadoOperacaoKit> {
    const response = await api.post<ResultadoOperacaoKit>("/EstoqueKit/Desmontar", data);
    return response.data;
  },

  async movimentarManual(data: MovimentarKitManualDto): Promise<ResultadoOperacaoKit> {
    const response = await api.post<ResultadoOperacaoKit>("/EstoqueKit/Movimentar", data);
    return response.data;
  },

  async getHistorico(kitId?: number, limit = 100): Promise<MovimentacaoKitDetalhe[]> {
    const response = await api.get<MovimentacaoKitDetalhe[]>("/EstoqueKit/Historico", {
      params: { kitId, limit },
    });
    return response.data;
  },

  async simularProducao(itens: ItemSimulacaoInput[]): Promise<SimulacaoProducaoResultado> {
    const response = await api.post<SimulacaoProducaoResultado>("/EstoqueKit/Simular", itens);
    return response.data;
  },
};

