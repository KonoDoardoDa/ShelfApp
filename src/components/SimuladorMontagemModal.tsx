import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Calculator,
  X,
  Plus,
  Trash2,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Boxes,
  Cpu,
  RefreshCw,
  Search,
  ChevronDown,
  Layers,
} from "lucide-react";
import { estoqueKitService } from "../services/estoqueKitService";
import type {
  ItemSimulacaoInput,
  SimulacaoProducaoResultado,
  ItemSimulacaoResultado,
  KitSaldo,
} from "../types/estoqueKit";
import type { Kit } from "../types/kit";

interface SimuladorMontagemModalProps {
  isOpen: boolean;
  onClose: () => void;
  kits: Kit[];
  kitSaldosMap: Map<number, KitSaldo>;
}

export const SimuladorMontagemModal: React.FC<SimuladorMontagemModalProps> = ({
  isOpen,
  onClose,
  kits,
  kitSaldosMap,
}) => {
  const [simulatedKits, setSimulatedKits] = useState<ItemSimulacaoInput[]>([]);
  const [selectedKitId, setSelectedKitId] = useState<number | "">("");
  const [inputQtd, setInputQtd] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [resultado, setResultado] = useState<SimulacaoProducaoResultado | null>(null);
  const [filterText, setFilterText] = useState<string>("");
  const [filtroPainel, setFiltroPainel] = useState<"todos" | "painel" | "nao_painel">("todos");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Executa a simulação sempre que a lista de kits mudar
  const executarSimulacao = useCallback(async (itens: ItemSimulacaoInput[]) => {
    if (itens.length === 0) {
      setResultado(null);
      setErrorMsg(null);
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await estoqueKitService.simularProducao(itens);
      setResultado(res);
    } catch (err: unknown) {
      console.error("Erro na simulação:", err);
      setErrorMsg("Falha ao calcular a simulação de montagem. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && simulatedKits.length > 0) {
      executarSimulacao(simulatedKits);
    }
  }, [isOpen, simulatedKits, executarSimulacao]);

  // Adiciona ou incrementa kit na fila
  const handleAddKit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (selectedKitId === "" || inputQtd <= 0) return;

    setSimulatedKits((prev) => {
      const idx = prev.findIndex((k) => k.kitId === selectedKitId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantidade: copy[idx].quantidade + inputQtd };
        return copy;
      }
      return [...prev, { kitId: Number(selectedKitId), quantidade: inputQtd }];
    });

    setSelectedKitId("");
    setInputQtd(1);
  };

  // Ajusta quantidade de um kit específico
  const handleUpdateQtd = (kitId: number, novaQtd: number) => {
    if (novaQtd <= 0) {
      handleRemoveKit(kitId);
      return;
    }
    setSimulatedKits((prev) =>
      prev.map((k) => (k.kitId === kitId ? { ...k, quantidade: novaQtd } : k))
    );
  };

  // Remove kit da simulação
  const handleRemoveKit = (kitId: number) => {
    setSimulatedKits((prev) => prev.filter((k) => k.kitId !== kitId));
  };

  // Limpa toda a simulação
  const handleClearAll = () => {
    setSimulatedKits([]);
    setResultado(null);
    setErrorMsg(null);
  };

  // Métricas dinâmicas respeitando o modo (Todos, Apenas Painel, Não-Painel)
  const metricasExibicao = useMemo(() => {
    if (!resultado) {
      return {
        viavel: true,
        totalSkus: 0,
        totalOk: 0,
        totalFaltas: 0,
        itensFiltradosModo: [] as ItemSimulacaoResultado[],
        totalPainel: 0,
        totalNaoPainel: 0,
        painelFaltas: 0,
      };
    }

    const painelList = resultado.itens.filter((i) => i.isPainel);
    const naoPainelList = resultado.itens.filter((i) => !i.isPainel);

    let base = resultado.itens;
    if (filtroPainel === "painel") {
      base = painelList;
    } else if (filtroPainel === "nao_painel") {
      base = naoPainelList;
    }

    const totalSkus = base.length;
    const totalOk = base.filter((i) => i.suficiente).length;
    const totalFaltas = base.filter((i) => !i.suficiente).length;
    const viavel = totalFaltas === 0;

    return {
      viavel,
      totalSkus,
      totalOk,
      totalFaltas,
      itensFiltradosModo: base,
      totalPainel: painelList.length,
      totalNaoPainel: naoPainelList.length,
      painelFaltas: painelList.filter((i) => !i.suficiente).length,
    };
  }, [resultado, filtroPainel]);

  // Itens filtrados para exibição na tabela com texto de busca
  const itensFiltrados = useMemo(() => {
    if (!resultado) return [];
    const base = metricasExibicao.itensFiltradosModo;
    if (!filterText.trim()) return base;
    const q = filterText.toLowerCase();
    return base.filter(
      (it) =>
        it.nomeItem.toLowerCase().includes(q) ||
        it.itemId.toString().includes(q) ||
        it.kitsOrigem.some((k) => k.nomeKit.toLowerCase().includes(q))
    );
  }, [resultado, metricasExibicao.itensFiltradosModo, filterText]);

  // Exportação para arquivo CSV estruturado destacando Painel vs Não-Painel
  const handleExportCSV = () => {
    if (!resultado || simulatedKits.length === 0) return;

    const now = new Date();
    const dataHoraStr = now.toLocaleDateString("pt-BR") + " " + now.toLocaleTimeString("pt-BR");

    const painelItens = resultado.itens.filter((i) => i.isPainel);
    const naoPainelItens = resultado.itens.filter((i) => !i.isPainel);

    let csv = "\uFEFF"; // UTF-8 BOM para Excel PT-BR
    if (filtroPainel === "painel") {
      csv += "RELATÓRIO DE SIMULAÇÃO DE PRODUÇÃO - EXCLUSIVO PAINÉIS\n";
      csv += `Data e Hora da Simulação;${dataHoraStr}\n`;
      csv += `Viabilidade dos Painéis;${metricasExibicao.viavel ? "PRODUÇÃO DE PAINÉIS 100% VIÁVEL (Estoque Suficiente)" : `ATENÇÃO: ${metricasExibicao.totalFaltas} PEÇA(S) DE PAINEL EM FALTA`}\n`;
    } else {
      csv += "RELATÓRIO DE SIMULAÇÃO DE PRODUÇÃO / MONTAGEM DE KITS (BOM COMPLETA)\n";
      csv += `Data e Hora da Simulação;${dataHoraStr}\n`;
      csv += `Viabilidade Geral;${resultado.producaoTotalmenteViavel ? "PRODUÇÃO 100% VIÁVEL (Estoque Completo)" : `ATENÇÃO: ${resultado.totalComponentesFaltantes} INSUMO(S) EM FALTA`}\n`;
      csv += `Viabilidade Específica de Painéis;${metricasExibicao.painelFaltas === 0 ? "PAINÉIS 100% VIÁVEIS" : `ATENÇÃO: ${metricasExibicao.painelFaltas} PEÇA(S) DE PAINEL EM FALTA`}\n`;
    }

    csv += `Total de Kits Planejados;${resultado.totalKitsSolicitados} unidades (${resultado.totalTiposKits} modelo(s))\n`;
    csv += `Total de Componentes de Painel;${painelItens.length} itens\n`;
    csv += `Total de Componentes Gerais (Não-Painel);${naoPainelItens.length} itens\n`;
    csv += `Total de Componentes Únicos no Conjunto;${resultado.totalComponentesDistintos} itens\n`;
    csv += `Componentes com Ruptura/Falta;${resultado.totalComponentesFaltantes} itens\n\n`;

    csv += "1. KITS SOLICITADOS NA PRODUÇÃO\n";
    csv += "Código Kit;Nome do Kit;Quantidade Solicitada\n";
    simulatedKits.forEach((s) => {
      const k = kits.find((x) => x.id === s.kitId);
      const nome = k ? k.nome.replace(/"/g, '""') : `Kit #${s.kitId}`;
      csv += `#${s.kitId};"${nome}";${s.quantidade}\n`;
    });
    csv += "\n";

    if (filtroPainel === "painel") {
      csv += "2. COMPONENTES EXCLUSIVOS DO PAINEL (DEMANDA AGREGADA)\n";
      csv += "Código Item;Componente;Classificação;Origem nos Kits;Quantidade Necessária;Estoque Atual;Balanço Estimado;Falta Comprar;Status\n";
      if (painelItens.length === 0) {
        csv += "Nenhum componente de painel demandado para esta simulação;;;;;;;;\n";
      } else {
        painelItens.forEach((it) => {
          const origens = it.kitsOrigem
            .map((ko) => `${ko.nomeKit} (${ko.quantidadeKit} un x ${ko.quantidadePorKit} = ${ko.subtotalNecessario} un)`)
            .join(" | ")
            .replace(/"/g, '""');
          const status = it.suficiente ? "Disponível em Estoque" : `Faltam ${it.faltaEstoque} unidades`;
          const balancoStr = it.saldoAposMontagem >= 0 ? `+${it.saldoAposMontagem}` : `${it.saldoAposMontagem}`;
          csv += `#${it.itemId};"${it.nomeItem.replace(/"/g, '""')}";Painel;"${origens}";${it.quantidadeTotalNecessaria};${it.saldoEstoqueItem};${balancoStr};${it.faltaEstoque};"${status}"\n`;
        });
      }
    } else {
      csv += "2. COMPONENTES EXCLUSIVOS DO PAINEL\n";
      csv += "Código Item;Componente;Classificação;Origem nos Kits;Quantidade Necessária;Estoque Atual;Balanço Estimado;Falta Comprar;Status\n";
      if (painelItens.length === 0) {
        csv += "Nenhum componente de painel demandado para esta simulação;;;;;;;;\n";
      } else {
        painelItens.forEach((it) => {
          const origens = it.kitsOrigem
            .map((ko) => `${ko.nomeKit} (${ko.quantidadeKit} un x ${ko.quantidadePorKit} = ${ko.subtotalNecessario} un)`)
            .join(" | ")
            .replace(/"/g, '""');
          const status = it.suficiente ? "Disponível em Estoque" : `Faltam ${it.faltaEstoque} unidades`;
          const balancoStr = it.saldoAposMontagem >= 0 ? `+${it.saldoAposMontagem}` : `${it.saldoAposMontagem}`;
          csv += `#${it.itemId};"${it.nomeItem.replace(/"/g, '""')}";Painel;"${origens}";${it.quantidadeTotalNecessaria};${it.saldoEstoqueItem};${balancoStr};${it.faltaEstoque};"${status}"\n`;
        });
      }
      csv += "\n";

      csv += "3. COMPONENTES GERAIS / ESTRUTURA (NÃO-PAINEL)\n";
      csv += "Código Item;Componente;Classificação;Origem nos Kits;Quantidade Necessária;Estoque Atual;Balanço Estimado;Falta Comprar;Status\n";
      if (naoPainelItens.length === 0) {
        csv += "Nenhum componente geral (não-painel) demandado para esta simulação;;;;;;;;\n";
      } else {
        naoPainelItens.forEach((it) => {
          const origens = it.kitsOrigem
            .map((ko) => `${ko.nomeKit} (${ko.quantidadeKit} un x ${ko.quantidadePorKit} = ${ko.subtotalNecessario} un)`)
            .join(" | ")
            .replace(/"/g, '""');
          const status = it.suficiente ? "Disponível em Estoque" : `Faltam ${it.faltaEstoque} unidades`;
          const balancoStr = it.saldoAposMontagem >= 0 ? `+${it.saldoAposMontagem}` : `${it.saldoAposMontagem}`;
          csv += `#${it.itemId};"${it.nomeItem.replace(/"/g, '""')}";Não-Painel;"${origens}";${it.quantidadeTotalNecessaria};${it.saldoEstoqueItem};${balancoStr};${it.faltaEstoque};"${status}"\n`;
        });
      }
      csv += "\n";

      csv += "4. DEMANDA CONSOLIDADA GERAL (BOM AGREGADA)\n";
      csv += "Código Item;Componente;Classificação;Origem nos Kits;Quantidade Necessária;Estoque Atual;Balanço Estimado;Falta Comprar;Status\n";
      resultado.itens.forEach((it) => {
        const origens = it.kitsOrigem
          .map((ko) => `${ko.nomeKit} (${ko.quantidadeKit} un x ${ko.quantidadePorKit} = ${ko.subtotalNecessario} un)`)
          .join(" | ")
          .replace(/"/g, '""');
        const tipo = it.isPainel ? "Painel" : "Não-Painel";
        const status = it.suficiente ? "Disponível em Estoque" : `Faltam ${it.faltaEstoque} unidades`;
        const balancoStr = it.saldoAposMontagem >= 0 ? `+${it.saldoAposMontagem}` : `${it.saldoAposMontagem}`;
        csv += `#${it.itemId};"${it.nomeItem.replace(/"/g, '""')}";${tipo};"${origens}";${it.quantidadeTotalNecessaria};${it.saldoEstoqueItem};${balancoStr};${it.faltaEstoque};"${status}"\n`;
      });
    }

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dataArquivo = now.toISOString().slice(0, 10);
    const prefixo = filtroPainel === "painel" ? "simulacao_paineis" : "simulacao_montagem_kits";
    link.setAttribute("href", url);
    link.setAttribute("download", `${prefixo}_${dataArquivo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: "980px", width: "95%", maxHeight: "90vh", display: "flex", flexDirection: "column" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                backgroundColor: "var(--accent-light, rgba(59, 130, 246, 0.15))",
                color: "var(--accent, #3b82f6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Calculator size={20} />
            </div>
            <div>
              <h3 className="modal-title" style={{ margin: 0, fontSize: "17px" }}>
                Simulador de Produção & Montagem de Kits
              </h3>
              <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)" }}>
                Planeje a fabricação de múltiplos kits simultaneamente com distinção entre painel e componentes gerais
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Fechar simulador">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ overflowY: "auto", padding: "20px" }}>
          {/* Seção 1: Adicionar Kits à Simulação */}
          <div
            style={{
              backgroundColor: "var(--bg-card, #1e293b)",
              border: "1px solid var(--border-color, #334155)",
              borderRadius: "10px",
              padding: "16px",
              marginBottom: "18px",
            }}
          >
            <h4
              style={{
                fontSize: "14px",
                margin: "0 0 12px 0",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "var(--text-primary)",
              }}
            >
              <Layers size={16} color="var(--accent, #3b82f6)" />
              Selecionar Kits para Simulação
            </h4>

            <form onSubmit={handleAddKit} style={{ display: "flex", gap: "12px", alignItems: "flex-end", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: "260px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "var(--text-secondary)" }}>
                  Kit de Produto
                </label>
                <div style={{ position: "relative" }}>
                  <select
                    className="form-input"
                    value={selectedKitId}
                    onChange={(e) => setSelectedKitId(e.target.value ? Number(e.target.value) : "")}
                    style={{ appearance: "none", paddingRight: "32px", width: "100%" }}
                  >
                    <option value="">Selecione um kit do catálogo...</option>
                    {kits.map((kit) => {
                      const saldo = kitSaldosMap.get(kit.id);
                      const capacidade = saldo?.capacidadeMontagem ?? 0;
                      return (
                        <option key={kit.id} value={kit.id}>
                          #{kit.id} - {kit.nome} (Capacidade total: {capacidade} un)
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown
                    size={16}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                      color: "var(--text-muted)",
                    }}
                  />
                </div>
              </div>

              <div style={{ width: "130px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "var(--text-secondary)" }}>
                  Quantidade
                </label>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  value={inputQtd}
                  onChange={(e) => setInputQtd(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{ width: "100%" }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={selectedKitId === "" || inputQtd <= 0}
                style={{ height: "40px" }}
              >
                <Plus size={16} /> Adicionar à Fila
              </button>
            </form>

            {/* Fila de Kits Selecionados */}
            {simulatedKits.length > 0 && (
              <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid var(--border-color, #334155)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>
                    Kits na Fila de Produção ({simulatedKits.length}):
                  </span>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="btn btn-sm btn-ghost-danger"
                    style={{ fontSize: "11px", padding: "4px 8px" }}
                  >
                    <Trash2 size={12} /> Limpar Todos
                  </button>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {simulatedKits.map((item) => {
                    const kit = kits.find((k) => k.id === item.kitId);
                    return (
                      <div
                        key={item.kitId}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          backgroundColor: "var(--bg-surface, #0f172a)",
                          border: "1px solid var(--border-color, #334155)",
                          borderRadius: "8px",
                          padding: "6px 12px",
                          fontSize: "13px",
                        }}
                      >
                        <span className="badge badge-blue" style={{ fontSize: "11px" }}>
                          #{item.kitId}
                        </span>
                        <strong style={{ color: "var(--text-primary)" }}>{kit?.nome || `Kit #${item.kitId}`}</strong>

                        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginLeft: "6px" }}>
                          <button
                            type="button"
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleUpdateQtd(item.kitId, item.quantidade - 1)}
                            style={{ padding: "2px 6px", height: "24px", minWidth: "24px" }}
                            title="Diminuir"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantidade}
                            onChange={(e) => handleUpdateQtd(item.kitId, parseInt(e.target.value) || 1)}
                            style={{
                              width: "50px",
                              textAlign: "center",
                              background: "transparent",
                              border: "1px solid var(--border-color, #334155)",
                              borderRadius: "4px",
                              color: "var(--text-primary)",
                              fontWeight: 700,
                              height: "24px",
                              fontSize: "12px",
                            }}
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleUpdateQtd(item.kitId, item.quantidade + 1)}
                            style={{ padding: "2px 6px", height: "24px", minWidth: "24px" }}
                            title="Aumentar"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveKit(item.kitId)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--danger, #ef4444)",
                            cursor: "pointer",
                            padding: "4px",
                            marginLeft: "4px",
                            display: "flex",
                            alignItems: "center",
                          }}
                          title="Remover kit da simulação"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Seção 2: Feedback de Estado e Resultados */}
          {errorMsg && (
            <div
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                border: "1px solid var(--danger, #ef4444)",
                borderRadius: "8px",
                padding: "12px 16px",
                color: "var(--danger, #ef4444)",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
              }}
            >
              <AlertTriangle size={18} />
              {errorMsg}
            </div>
          )}

          {loading ? (
            <div className="loading-container" style={{ padding: "40px" }}>
              <div className="spinner" />
              <p style={{ marginTop: "12px", fontSize: "14px", color: "var(--text-secondary)" }}>
                Calculando demanda agregada de insumos e consultando estoque físico...
              </p>
            </div>
          ) : simulatedKits.length === 0 ? (
            <div className="empty-state" style={{ padding: "40px 20px" }}>
              <div className="empty-state-icon">
                <Calculator size={48} />
              </div>
              <h3 className="empty-state-title">Nenhum kit selecionado</h3>
              <p className="empty-state-text">
                Selecione um ou mais kits acima e defina as quantidades desejadas para ver a lista consolidada de insumos e exportar o relatório.
              </p>
            </div>
          ) : resultado ? (
            <>
              {/* Seletor de Modo de Visualização / Simulação Exclusiva de Painel */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  marginBottom: "14px",
                  flexWrap: "wrap",
                  backgroundColor: "var(--bg-surface, #0f172a)",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color, #334155)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginRight: "4px" }}>
                    Foco da Simulação:
                  </span>
                  <button
                    type="button"
                    className={`btn btn-sm ${filtroPainel === "todos" ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => setFiltroPainel("todos")}
                    style={{ fontSize: "12px" }}
                  >
                    <Layers size={13} /> Todos os Componentes ({resultado.itens.length})
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${filtroPainel === "painel" ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => setFiltroPainel("painel")}
                    style={{
                      fontSize: "12px",
                      backgroundColor: filtroPainel === "painel" ? "#f59e0b" : undefined,
                      borderColor: filtroPainel === "painel" ? "#d97706" : undefined,
                      color: filtroPainel === "painel" ? "#ffffff" : undefined,
                    }}
                    title="Simular demanda e viabilidade exclusiva dos componentes de painel elétrico"
                  >
                    <Cpu size={13} /> ⚡ Exclusivo: Apenas Painéis ({metricasExibicao.totalPainel})
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${filtroPainel === "nao_painel" ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => setFiltroPainel("nao_painel")}
                    style={{ fontSize: "12px" }}
                  >
                    <Boxes size={13} /> Peças Gerais / Não-Painel ({metricasExibicao.totalNaoPainel})
                  </button>
                </div>

                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={handleExportCSV}
                  style={{
                    backgroundColor: "#10b981",
                    backgroundImage: "linear-gradient(180deg, #10b981, #059669)",
                    borderColor: "#059669",
                    fontSize: "12px",
                  }}
                  title="Exportar dados da visualização para planilha CSV"
                >
                  <FileSpreadsheet size={14} /> Exportar CSV ({filtroPainel === "painel" ? "Painéis" : "Completo"})
                </button>
              </div>

              {/* Banner de Viabilidade */}
              <div
                style={{
                  backgroundColor: metricasExibicao.viavel
                    ? "rgba(34, 197, 94, 0.12)"
                    : "rgba(239, 68, 68, 0.12)",
                  border: `1px solid ${
                    metricasExibicao.viavel
                      ? "var(--success, #22c55e)"
                      : "var(--danger, #ef4444)"
                  }`,
                  borderRadius: "10px",
                  padding: "16px",
                  marginBottom: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {metricasExibicao.viavel ? (
                    <CheckCircle2 size={32} color="var(--success, #22c55e)" />
                  ) : (
                    <AlertTriangle size={32} color="var(--danger, #ef4444)" />
                  )}
                  <div>
                    <h4
                      style={{
                        margin: 0,
                        fontSize: "16px",
                        fontWeight: 700,
                        color: metricasExibicao.viavel
                          ? "var(--success, #22c55e)"
                          : "var(--danger, #ef4444)",
                      }}
                    >
                      {filtroPainel === "painel"
                        ? metricasExibicao.viavel
                          ? "Montagem de Painéis 100% Viável"
                          : "Atenção: Insumos de Painel em Falta"
                        : metricasExibicao.viavel
                        ? "Produção 100% Viável (Estoque Completo)"
                        : "Atenção: Estoque Insuficiente"}
                    </h4>
                    <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "var(--text-secondary)" }}>
                      {filtroPainel === "painel"
                        ? metricasExibicao.viavel
                          ? "O estoque físico possui quantidade suficiente de todas as peças exclusivas de painel para fabricar os kits planejados."
                          : `${metricasExibicao.totalFaltas} componente(s) exclusivo(s) de painel estão em déficit e exigem reposição imediata.`
                        : metricasExibicao.viavel
                        ? "O estoque físico possui quantidade suficiente de todas as peças necessárias (painel e gerais) para montar os kits planejados."
                        : `${resultado.totalComponentesFaltantes} componente(s) estão em déficit (${metricasExibicao.painelFaltas} de painel e ${resultado.totalComponentesFaltantes - metricasExibicao.painelFaltas} gerais).`}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  {filtroPainel === "todos" && (
                    <span
                      className={`badge ${metricasExibicao.painelFaltas === 0 ? "badge-green" : "badge-amber"}`}
                      style={{ fontSize: "12px", padding: "6px 10px" }}
                    >
                      <Cpu size={12} /> Painéis: {metricasExibicao.painelFaltas === 0 ? "100% OK" : `${metricasExibicao.painelFaltas} em falta`}
                    </span>
                  )}
                </div>
              </div>

              {/* KPI Cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "12px",
                  marginBottom: "18px",
                }}
              >
                <div
                  style={{
                    backgroundColor: "var(--bg-surface, #0f172a)",
                    border: "1px solid var(--border-color, #334155)",
                    borderRadius: "8px",
                    padding: "14px",
                  }}
                >
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
                    Total de Kits Solicitados
                  </div>
                  <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", marginTop: "4px" }}>
                    {resultado.totalKitsSolicitados} <span style={{ fontSize: "12px", fontWeight: 500 }}>un</span>
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                    Em {resultado.totalTiposKits} modelo(s)
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: "var(--bg-surface, #0f172a)",
                    border: "1px solid var(--border-color, #334155)",
                    borderRadius: "8px",
                    padding: "14px",
                  }}
                >
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
                    {filtroPainel === "painel" ? "Insumos de Painel (BOM)" : "Insumos Requeridos (BOM)"}
                  </div>
                  <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--accent, #3b82f6)", marginTop: "4px" }}>
                    {metricasExibicao.totalSkus} <span style={{ fontSize: "12px", fontWeight: 500 }}>SKUs</span>
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                    {metricasExibicao.totalOk} itens com estoque suficiente
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: "var(--bg-surface, #0f172a)",
                    border: "1px solid var(--border-color, #334155)",
                    borderRadius: "8px",
                    padding: "14px",
                  }}
                >
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
                    {filtroPainel === "painel" ? "Peças de Painel em Falta" : "Componentes Faltantes"}
                  </div>
                  <div
                    style={{
                      fontSize: "22px",
                      fontWeight: 800,
                      color: metricasExibicao.totalFaltas > 0 ? "var(--danger, #ef4444)" : "var(--success, #22c55e)",
                      marginTop: "4px",
                    }}
                  >
                    {metricasExibicao.totalFaltas} <span style={{ fontSize: "12px", fontWeight: 500 }}>itens</span>
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                    {metricasExibicao.totalFaltas === 0 ? "Nenhuma ruptura" : "Exigem ordem de reposição"}
                  </div>
                </div>
              </div>

              {/* Tabela de Insumos */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Boxes size={16} color="var(--accent, #3b82f6)" />
                  {filtroPainel === "painel"
                    ? `Peças Exclusivas de Painel (${itensFiltrados.length})`
                    : filtroPainel === "nao_painel"
                    ? `Peças Gerais Não-Painel (${itensFiltrados.length})`
                    : `Demanda Consolidada de Componentes (${itensFiltrados.length})`}
                </div>

                <div className="search-input-wrapper" style={{ width: "260px" }}>
                  <Search size={14} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Filtrar por peça ou kit..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    style={{ fontSize: "12px", padding: "6px 10px 6px 32px" }}
                  />
                </div>
              </div>

              <div className="table-container" style={{ border: "1px solid var(--border-color, #334155)", borderRadius: "8px" }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: "70px" }}>ID</th>
                      <th>Componente / Peça</th>
                      <th style={{ width: "100px", textAlign: "center" }}>Classificação</th>
                      <th>Origem (Kits)</th>
                      <th style={{ width: "110px", textAlign: "center" }}>Necessário</th>
                      <th style={{ width: "110px", textAlign: "center" }}>Estoque Atual</th>
                      <th style={{ width: "110px", textAlign: "center" }}>Balanço</th>
                      <th style={{ width: "140px", textAlign: "right" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itensFiltrados.map((it) => (
                      <tr
                        key={it.itemId}
                        style={{
                          backgroundColor: it.suficiente ? undefined : "rgba(239, 68, 68, 0.05)",
                        }}
                      >
                        <td>
                          <span className="badge badge-gray" style={{ fontSize: "11px" }}>
                            #{it.itemId}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{it.nomeItem}</div>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {it.isPainel ? (
                            <span
                              className="badge badge-amber"
                              style={{ fontSize: "11px", display: "inline-flex", gap: "4px" }}
                              title="Componente exclusivo do painel"
                            >
                              <Cpu size={11} /> Painel
                            </span>
                          ) : (
                            <span className="badge badge-gray" style={{ fontSize: "11px" }} title="Componente comum / estrutura">
                              Não-Painel
                            </span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                            {it.kitsOrigem.map((ko) => (
                              <span
                                key={ko.kitId}
                                className="badge badge-gray"
                                style={{ fontSize: "11px", whiteSpace: "normal" }}
                                title={`${ko.quantidadeKit} kits x ${ko.quantidadePorKit} peças por kit = ${ko.subtotalNecessario} peças`}
                              >
                                {ko.nomeKit}: <strong>{ko.subtotalNecessario} un</strong>
                              </span>
                            ))}
                          </div>
                        </td>
                        <td style={{ textAlign: "center", fontWeight: 700, fontSize: "13px" }}>
                          {it.quantidadeTotalNecessaria} un
                        </td>
                        <td style={{ textAlign: "center", color: "var(--text-secondary)" }}>
                          {it.saldoEstoqueItem} un
                        </td>
                        <td style={{ textAlign: "center", fontWeight: 700 }}>
                          {it.saldoAposMontagem >= 0 ? (
                            <span style={{ color: "var(--success, #22c55e)" }}>+{it.saldoAposMontagem}</span>
                          ) : (
                            <span style={{ color: "var(--danger, #ef4444)" }}>{it.saldoAposMontagem}</span>
                          )}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          {it.suficiente ? (
                            <span className="badge badge-green" style={{ fontWeight: 600, fontSize: "11px" }}>
                              Disponível
                            </span>
                          ) : (
                            <span
                              className="badge badge-red"
                              style={{
                                fontWeight: 700,
                                fontSize: "11px",
                                display: "inline-flex",
                                gap: "4px",
                                alignItems: "center",
                              }}
                              title={`Estoque insuficiente. Faltam ${it.faltaEstoque} unidades para concluir a montagem.`}
                            >
                              <AlertTriangle size={12} /> Faltam {it.faltaEstoque} un
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            {simulatedKits.length > 0 && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => executarSimulacao(simulatedKits)}
                disabled={loading}
              >
                <RefreshCw size={14} className={loading ? "spinner" : ""} /> Recalcular
              </button>
            )}
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            {resultado && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleExportCSV}
                title="Baixar planilha CSV com os resultados"
              >
                <FileSpreadsheet size={16} /> Exportar CSV
              </button>
            )}
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
