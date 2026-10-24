import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Layers,
  AlertCircle,
  PackageCheck,
  Cpu,
  Boxes,
  MinusCircle,
  Settings2,
  Hammer,
  PackageMinus,
  History,
  AlertTriangle,
  Clock,
  User,
  Calculator,
  FileSpreadsheet,
  Power,
  CheckCircle,
  Ban,
} from "lucide-react";
import { kitService } from "../../services/kitService";
import { kitItemService } from "../../services/kitItemService";
import { itemService } from "../../services/itemService";
import { estoqueKitService } from "../../services/estoqueKitService";
import type { Kit, CreateKitDto, UpdateKitDto, KitDetails, KitItemDetail } from "../../types/kit";
import type { Item } from "../../types/item";
import type {
  KitSaldo,
  MontarKitDto,
  DesmontarKitDto,
  MovimentacaoKitDetalhe,
} from "../../types/estoqueKit";
import { Modal } from "../../components/Modal";
import { ConfirmModal } from "../../components/ConfirmModal";
import { Pagination } from "../../components/Pagination";
import { SimuladorMontagemModal } from "../../components/SimuladorMontagemModal";
import { SortableTh } from "../../components/SortableTh";
import { useTableSort } from "../../hooks/useTableSort";
import { useToast } from "../../hooks/useToast";
import { useAuth } from "../../hooks/useAuth";
import { getErrorMessage } from "../../api/http";

export default function Kits() {
  const { success, error: toastError, warning: toastWarning } = useToast();
  const { user } = useAuth();

  const [kits, setKits] = useState<Kit[]>([]);
  const [kitSaldosMap, setKitSaldosMap] = useState<Map<number, KitSaldo>>(new Map());
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"todos" | "ativos" | "inativos">("todos");

  // Paginação
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Reseta para a primeira página ao pesquisar ou alterar itens por página ou filtro de status
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, pageSize, statusFilter]);

  // Modal de Montar Kit (Dar saída em peças e entrada no kit)
  const [isMontarModalOpen, setIsMontarModalOpen] = useState<boolean>(false);
  const [montarKitTarget, setMontarKitTarget] = useState<KitSaldo | null>(null);
  const [montarQtd, setMontarQtd] = useState<number>(1);
  const [montarMotivo, setMontarMotivo] = useState<string>("");
  const [submittingMontar, setSubmittingMontar] = useState<boolean>(false);

  // Modal de Desmontar Kit (Dar saída no kit e devolução de peças ao estoque)
  const [isDesmontarModalOpen, setIsDesmontarModalOpen] = useState<boolean>(false);
  const [desmontarKitTarget, setDesmontarKitTarget] = useState<KitSaldo | null>(null);
  const [desmontarQtd, setDesmontarQtd] = useState<number>(1);
  const [desmontarMotivo, setDesmontarMotivo] = useState<string>("");
  const [submittingDesmontar, setSubmittingDesmontar] = useState<boolean>(false);

  // Modal de Histórico de Movimentações do Kit
  const [isHistoricoModalOpen, setIsHistoricoModalOpen] = useState<boolean>(false);
  const [historicoKitTarget, setHistoricoKitTarget] = useState<Kit | null>(null);
  const [historicoList, setHistoricoList] = useState<MovimentacaoKitDetalhe[]>([]);
  const [loadingHistorico, setLoadingHistorico] = useState<boolean>(false);

  // Modal do Simulador de Montagem Multi-Kits
  const [isSimuladorOpen, setIsSimuladorOpen] = useState<boolean>(false);

  // Modal de Criar / Editar Kit
  const [isKitModalOpen, setIsKitModalOpen] = useState<boolean>(false);
  const [editingKit, setEditingKit] = useState<Kit | null>(null);
  const [kitNome, setKitNome] = useState<string>("");
  const [submittingKit, setSubmittingKit] = useState<boolean>(false);

  // Modal de Exclusão de Kit
  const [isDeleteKitModalOpen, setIsDeleteKitModalOpen] = useState<boolean>(false);
  const [deletingKit, setDeletingKit] = useState<Kit | null>(null);
  const [deletingKitLoading, setDeletingKitLoading] = useState<boolean>(false);

  // Modal de Detalhes e Gestão de Itens do Kit
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [activeKitDetails, setActiveKitDetails] = useState<KitDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);

  // Lista de itens do estoque para vincular ao kit
  const [estoqueItens, setEstoqueItens] = useState<Item[]>([]);

  // Formulário de Adicionar Item ao Kit
  const [selectedItemId, setSelectedItemId] = useState<number | "">("");
  const [quantidade, setQuantidade] = useState<number>(1);
  const [isPainel, setIsPainel] = useState<boolean>(false);
  const [addingItemLoading, setAddingItemLoading] = useState<boolean>(false);

  // Edição de Item dentro do Kit
  const [editingKitItem, setEditingKitItem] = useState<KitItemDetail | null>(null);
  const [editQtd, setEditQtd] = useState<number>(1);
  const [editIsPainel, setEditIsPainel] = useState<boolean>(false);
  const [isEditKitItemModalOpen, setIsEditKitItemModalOpen] = useState<boolean>(false);
  const [updatingKitItemLoading, setUpdatingKitItemLoading] = useState<boolean>(false);

  // Exclusão de Item do Kit
  const [itemToRemove, setItemToRemove] = useState<KitItemDetail | null>(null);
  const [isRemoveItemModalOpen, setIsRemoveItemModalOpen] = useState<boolean>(false);
  const [removingItemLoading, setRemovingItemLoading] = useState<boolean>(false);

  const carregarKits = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const [dataKits, dataSaldos] = await Promise.all([
        kitService.getAll(),
        estoqueKitService.getAllSaldos().catch(() => [] as KitSaldo[]),
      ]);
      setKits(dataKits || []);
      const map = new Map<number, KitSaldo>();
      (dataSaldos || []).forEach((s) => map.set(s.kitId, s));
      setKitSaldosMap(map);
    } catch (err) {
      const msg = getErrorMessage(err);
      setErrorMsg(msg);
      toastError(msg, "Erro ao carregar kits");
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  const carregarEstoqueItens = useCallback(async () => {
    try {
      const items = await itemService.getAll();
      setEstoqueItens(items || []);
    } catch (err) {
      console.warn("Erro ao buscar itens de estoque:", err);
    }
  }, []);

  useEffect(() => {
    carregarKits();
    carregarEstoqueItens();
  }, [carregarKits, carregarEstoqueItens]);

  const handleOpenCreateKit = () => {
    setEditingKit(null);
    setKitNome("");
    setIsKitModalOpen(true);
  };

  const handleOpenEditKit = (kit: Kit) => {
    setEditingKit(kit);
    setKitNome(kit.nome);
    setIsKitModalOpen(true);
  };

  const handleOpenDeleteKit = (kit: Kit) => {
    setDeletingKit(kit);
    setIsDeleteKitModalOpen(true);
  };

  const handleSubmitKit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kitNome.trim()) {
      toastError("O nome do kit é obrigatório.");
      return;
    }

    try {
      setSubmittingKit(true);
      if (editingKit) {
        const updateData: UpdateKitDto = {
          id: editingKit.id,
          nome: kitNome.trim(),
          ativo: editingKit.ativo ?? true,
        };
        await kitService.update(editingKit.id, updateData);
        success(`Kit "${kitNome.trim()}" atualizado com sucesso!`);
      } else {
        const createData: CreateKitDto = {
          nome: kitNome.trim(),
          ativo: true,
        };
        await kitService.create(createData);
        success(`Kit "${kitNome.trim()}" criado com sucesso!`);
      }
      setIsKitModalOpen(false);
      await carregarKits();
    } catch (err) {
      toastError(getErrorMessage(err), "Falha ao salvar kit");
    } finally {
      setSubmittingKit(false);
    }
  };

  const handleToggleStatus = async (kit: Kit) => {
    try {
      await kitService.toggleStatus(kit.id);
      const novoStatus = kit.ativo === false ? "reativado" : "inativado";
      success(`Kit "${kit.nome}" ${novoStatus} com sucesso!`);
      await carregarKits();
    } catch (err) {
      toastError(getErrorMessage(err), "Falha ao alterar status do kit");
    }
  };

  const handleConfirmDeleteKit = async () => {
    if (!deletingKit) return;

    try {
      setDeletingKitLoading(true);
      await kitService.delete(deletingKit.id);
      success(`Kit "${deletingKit.nome}" removido com sucesso!`);
      setIsDeleteKitModalOpen(false);
      setDeletingKit(null);
      await carregarKits();
    } catch (err) {
      toastError(getErrorMessage(err), "Falha ao excluir kit");
    } finally {
      setDeletingKitLoading(false);
    }
  };

  // Carregar detalhes com itens do Kit
  const handleOpenDetails = async (kit: Kit) => {
    try {
      setLoadingDetails(true);
      setIsDetailsModalOpen(true);
      const details = await kitService.getWithItems(kit.id);
      setActiveKitDetails(details);
      // Resetar form de adição
      setSelectedItemId(estoqueItens.length > 0 ? estoqueItens[0].id : "");
      setQuantidade(1);
      setIsPainel(false);
    } catch (err) {
      // Caso GetWithItems falhe ou kit não possua itens ainda
      setActiveKitDetails({
        id: kit.id,
        nome: kit.nome,
        items: [],
      });
      toastError(getErrorMessage(err), "Não foi possível carregar a composição completa");
    } finally {
      setLoadingDetails(false);
    }
  };

  const reloadActiveKitDetails = async (kitId: number) => {
    try {
      const details = await kitService.getWithItems(kitId);
      setActiveKitDetails(details);
    } catch (err) {
      console.warn("Erro ao recarregar detalhes do kit:", err);
    }
  };

  // Adicionar Item ao Kit
  const handleAddItemToKit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeKitDetails) return;
    if (!selectedItemId || Number(selectedItemId) <= 0) {
      toastError("Selecione um item do estoque.");
      return;
    }

    const itemIdNum = Number(selectedItemId);
    const existing = activeKitDetails.items?.find((i) => i.itemId === itemIdNum);
    if (existing) {
      const nomeItem =
        existing.itemNome ||
        estoqueItens.find((i) => i.id === itemIdNum)?.nome ||
        `Item #${itemIdNum}`;
      toastWarning(
        `O item "${nomeItem}" já existe na composição deste kit (Quantidade atual: ${existing.quantidade} un). Incremente a quantidade do item existente na tabela abaixo em vez de adicioná-lo novamente.`,
        "Item já existente no kit"
      );
      return;
    }

    if (quantidade <= 0 || quantidade > 1000000) {
      toastError("A quantidade deve ser entre 1 e 1.000.000 unidades.");
      return;
    }

    try {
      setAddingItemLoading(true);
      await kitItemService.create({
        kitId: activeKitDetails.id,
        itemId: itemIdNum,
        quantidade: Number(quantidade),
        isPainel,
      });

      success("Item adicionado ao kit com sucesso!");
      await reloadActiveKitDetails(activeKitDetails.id);
      setQuantidade(1);
      setIsPainel(false);
    } catch (err) {
      const msg = getErrorMessage(err);
      if (msg.toLowerCase().includes("já existe") || msg.toLowerCase().includes("duplicate")) {
        toastWarning(msg, "Item já existente no kit");
      } else {
        toastError(msg, "Erro ao adicionar item ao kit");
      }
    } finally {
      setAddingItemLoading(false);
    }
  };

  // Abrir edição de item do kit
  const handleOpenEditKitItem = (item: KitItemDetail) => {
    setEditingKitItem(item);
    setEditQtd(item.quantidade);
    setEditIsPainel(item.isPainel);
    setIsEditKitItemModalOpen(true);
  };

  // Salvar alteração no item do kit
  const handleSaveEditKitItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeKitDetails || !editingKitItem) return;

    if (Number(editQtd) <= 0 || Number(editQtd) > 1000000) {
      toastError("A quantidade deve ser entre 1 e 1.000.000 unidades.");
      return;
    }

    try {
      setUpdatingKitItemLoading(true);
      await kitItemService.update(activeKitDetails.id, editingKitItem.itemId, {
        kitId: activeKitDetails.id,
        itemId: editingKitItem.itemId,
        quantidade: Number(editQtd),
        isPainel: editIsPainel,
      });

      success("Composição do kit atualizada!");
      setIsEditKitItemModalOpen(false);
      setEditingKitItem(null);
      await reloadActiveKitDetails(activeKitDetails.id);
    } catch (err) {
      toastError(getErrorMessage(err), "Erro ao atualizar item do kit");
    } finally {
      setUpdatingKitItemLoading(false);
    }
  };

  // Remover item do kit
  const handleOpenRemoveItem = (item: KitItemDetail) => {
    setItemToRemove(item);
    setIsRemoveItemModalOpen(true);
  };

  const handleConfirmRemoveItem = async () => {
    if (!activeKitDetails || !itemToRemove) return;

    try {
      setRemovingItemLoading(true);
      await kitItemService.delete(activeKitDetails.id, itemToRemove.itemId);
      success("Item removido da composição do kit!");
      setIsRemoveItemModalOpen(false);
      setItemToRemove(null);
      await reloadActiveKitDetails(activeKitDetails.id);
    } catch (err) {
      toastError(getErrorMessage(err), "Erro ao remover item do kit");
    } finally {
      setRemovingItemLoading(false);
    }
  };

  // --- Operações de Montagem e Estoque de Kits ---
  const handleOpenMontar = (kitId: number) => {
    const saldo = kitSaldosMap.get(kitId);
    if (!saldo) return;
    setMontarKitTarget(saldo);
    setMontarQtd(1);
    setMontarMotivo("");
    setIsMontarModalOpen(true);
  };

  const handleSubmitMontar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!montarKitTarget) return;

    if (montarQtd <= 0) {
      toastError("Informe uma quantidade válida maior que zero para montar.");
      return;
    }

    if (montarQtd > montarKitTarget.capacidadeMontagem) {
      toastError(
        `Saldo insuficiente de peças. Capacidade máxima no momento: ${montarKitTarget.capacidadeMontagem} kit(s).`
      );
      return;
    }

    try {
      setSubmittingMontar(true);
      const payload: MontarKitDto = {
        kitId: montarKitTarget.kitId,
        quantidade: Number(montarQtd),
        motivo: montarMotivo.trim() || null,
        usuarioNome: user?.nome || user?.email || "Operador",
      };

      const res = await estoqueKitService.montarKit(payload);
      success(res.mensagem || `Montagem de ${montarQtd} kit(s) concluída com sucesso!`);
      setIsMontarModalOpen(false);
      setMontarKitTarget(null);
      await carregarKits();
    } catch (err) {
      toastError(getErrorMessage(err), "Falha ao montar kit");
    } finally {
      setSubmittingMontar(false);
    }
  };

  const handleOpenDesmontar = (kitId: number) => {
    const saldo = kitSaldosMap.get(kitId);
    if (!saldo) return;
    if (saldo.saldoFisico <= 0) {
      toastError("Este kit não possui saldo montado em estoque para desmontar.");
      return;
    }
    setDesmontarKitTarget(saldo);
    setDesmontarQtd(1);
    setDesmontarMotivo("");
    setIsDesmontarModalOpen(true);
  };

  const handleSubmitDesmontar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desmontarKitTarget) return;

    if (desmontarQtd <= 0) {
      toastError("Informe uma quantidade válida maior que zero para desmontar.");
      return;
    }

    if (desmontarQtd > desmontarKitTarget.saldoFisico) {
      toastError(`Saldo insuficiente. O kit possui apenas ${desmontarKitTarget.saldoFisico} unidade(s) montadas.`);
      return;
    }

    try {
      setSubmittingDesmontar(true);
      const payload: DesmontarKitDto = {
        kitId: desmontarKitTarget.kitId,
        quantidade: Number(desmontarQtd),
        motivo: desmontarMotivo.trim() || null,
        usuarioNome: user?.nome || user?.email || "Operador",
      };

      const res = await estoqueKitService.desmontarKit(payload);
      success(res.mensagem || `Desmontagem concluída! Peças devolvidas ao estoque.`);
      setIsDesmontarModalOpen(false);
      setDesmontarKitTarget(null);
      await carregarKits();
    } catch (err) {
      toastError(getErrorMessage(err), "Falha ao desmontar kit");
    } finally {
      setSubmittingDesmontar(false);
    }
  };

  const handleOpenHistorico = async (kit?: Kit) => {
    setHistoricoKitTarget(kit || null);
    setIsHistoricoModalOpen(true);
    try {
      setLoadingHistorico(true);
      const logs = await estoqueKitService.getHistorico(kit ? kit.id : undefined);
      setHistoricoList(logs || []);
    } catch (err) {
      toastError(getErrorMessage(err), "Erro ao carregar histórico de movimentações");
    } finally {
      setLoadingHistorico(false);
    }
  };

  const handleExportKitAuditCSV = () => {
    if (historicoList.length === 0) return;
    const now = new Date();
    const dataHoraStr = now.toLocaleDateString("pt-BR") + " " + now.toLocaleTimeString("pt-BR");

    let csv = "\uFEFF"; // UTF-8 BOM para Excel PT-BR
    csv += "HISTÓRICO DE AUDITORIA DE MOVIMENTAÇÕES DE KITS\n";
    csv += `Escopo;${historicoKitTarget ? `Kit #${historicoKitTarget.id} - "${historicoKitTarget.nome.replace(/"/g, '""')}"` : "Todos os Kits do ERP"}\n`;
    csv += `Data de Exportação;${dataHoraStr}\n`;
    csv += `Total de Registros;${historicoList.length}\n\n`;

    csv += "Data / Hora;Código Kit;Nome do Kit;Operação;Quantidade;Saldo Anterior;Saldo Posterior;Operador;Motivo\n";
    sortedKitAudit.forEach((log) => {
      const dataFormatada = new Date(log.dataMovimentacao).toLocaleString("pt-BR");
      const motivoFormatado = (log.motivo || "Não informado").replace(/"/g, '""');
      const operador = (log.usuarioNome || "Sistema").replace(/"/g, '""');
      const isEntrada = log.tipo.toUpperCase() === "MONTAGEM" || log.tipo.toUpperCase() === "ENTRADA";
      const qtdFormatada = isEntrada ? `+${log.quantidade}` : `-${log.quantidade}`;
      csv += `"${dataFormatada}";#${log.kitId};"${log.nomeKit.replace(/"/g, '""')}";"${log.tipo}";${qtdFormatada};${log.saldoAnterior};${log.saldoPosterior};"${operador}";"${motivoFormatado}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dataArquivo = now.toISOString().slice(0, 10);
    const prefixo = historicoKitTarget ? `logs_movimentacao_kit_${historicoKitTarget.id}` : "logs_movimentacoes_kits_geral";
    link.setAttribute("href", url);
    link.setAttribute("download", `${prefixo}_${dataArquivo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    success("Logs de movimentações de kit exportados para CSV com sucesso!");
  };

  const handleExportKitCSV = async (kit: Kit) => {
    let itens = kitSaldosMap.get(kit.id)?.itens;
    let saldoFisico = kitSaldosMap.get(kit.id)?.saldoFisico ?? 0;
    let capacidade = kitSaldosMap.get(kit.id)?.capacidadeMontagem ?? 0;

    if (!itens || itens.length === 0) {
      try {
        const freshSaldo = await estoqueKitService.getSaldoById(kit.id);
        if (freshSaldo) {
          itens = freshSaldo.itens;
          saldoFisico = freshSaldo.saldoFisico;
          capacidade = freshSaldo.capacidadeMontagem;
        }
      } catch (err) {
        console.warn("Erro ao buscar dados atualizados do kit:", err);
      }
    }

    const painelItens = (itens || []).filter((i) => i.isPainel);
    const naoPainelItens = (itens || []).filter((i) => !i.isPainel);

    // Agrupar itens por fornecedor para a visão consolidada
    const fornecedoresMap = new Map<string, typeof itens>();
    (itens || []).forEach((it) => {
      const forn = it.nomeFornecedor || "Sem Fornecedor";
      if (!fornecedoresMap.has(forn)) {
        fornecedoresMap.set(forn, []);
      }
      fornecedoresMap.get(forn)!.push(it);
    });

    const fornecedoresOrdenados = Array.from(fornecedoresMap.keys()).sort((a, b) => {
      if (a === "Sem Fornecedor") return 1;
      if (b === "Sem Fornecedor") return -1;
      return a.localeCompare(b, "pt-BR");
    });

    const now = new Date();
    const dataHoraStr = now.toLocaleDateString("pt-BR") + " " + now.toLocaleTimeString("pt-BR");

    let csv = "\uFEFF"; // UTF-8 BOM para Excel PT-BR
    csv += "FICHA TÉCNICA E COMPOSIÇÃO DE KIT\n";
    csv += `Código do Kit;#${kit.id}\n`;
    csv += `Nome do Kit;"${kit.nome.replace(/"/g, '""')}"\n`;
    csv += `Estoque Físico Atual (Prontos);${saldoFisico} unidades\n`;
    csv += `Capacidade de Montagem com Estoque Atual;${capacidade} unidades\n`;
    csv += `Data de Exportação;${dataHoraStr}\n`;
    csv += `Total de Componentes de Painel;${painelItens.length} itens\n`;
    csv += `Total de Componentes Gerais (Não-Painel);${naoPainelItens.length} itens\n`;
    csv += `Total de Insumos Únicos;${(itens || []).length} itens\n\n`;

    // 1. COMPONENTES EXCLUSIVOS DO PAINEL (padrão antigo)
    csv += "1. COMPONENTES EXCLUSIVOS DO PAINEL\n";
    csv += "Código;Componente;Classificação;Qtd por Kit;Estoque Atual;Capacidade Parcial;Status\n";
    if (painelItens.length === 0) {
      csv += "Nenhum componente de painel cadastrado para este kit;;;;;;\n";
    } else {
      painelItens.forEach((it) => {
        const status = it.saldoEstoqueItem >= it.quantidadeNecessaria ? "Disponível" : "Estoque Insuficiente";
        csv += `#${it.itemId};"${it.nomeItem.replace(/"/g, '""')}";Painel;${it.quantidadeNecessaria};${it.saldoEstoqueItem};${it.montagensPossiveis} un;${status}\n`;
      });
    }
    csv += "\n";

    // 2. COMPONENTES GERAIS / ESTRUTURA (NÃO-PAINEL) (padrão antigo)
    csv += "2. COMPONENTES GERAIS / ESTRUTURA (NÃO-PAINEL)\n";
    csv += "Código;Componente;Classificação;Qtd por Kit;Estoque Atual;Capacidade Parcial;Status\n";
    if (naoPainelItens.length === 0) {
      csv += "Nenhum componente geral (não-painel) cadastrado para este kit;;;;;;\n";
    } else {
      naoPainelItens.forEach((it) => {
        const status = it.saldoEstoqueItem >= it.quantidadeNecessaria ? "Disponível" : "Estoque Insuficiente";
        csv += `#${it.itemId};"${it.nomeItem.replace(/"/g, '""')}";Não-Painel;${it.quantidadeNecessaria};${it.saldoEstoqueItem};${it.montagensPossiveis} un;${status}\n`;
      });
    }
    csv += "\n";

    // 3. LISTA CONSOLIDADA DE INSUMOS POR FORNECEDOR (KIT + PAINEL UNIFICADOS - padrão atual)
    csv += "3. LISTA CONSOLIDADA DE INSUMOS POR FORNECEDOR (KIT + PAINEL UNIFICADOS)\n";
    csv += "Fornecedor;Código Item;Componente;Classificação;Qtd por Kit;Estoque Físico Atual;Capacidade Parcial;Status de Estoque\n";

    if (!itens || itens.length === 0) {
      csv += "Este kit não possui componentes cadastrados em sua composição;;;;;;;\n";
    } else {
      fornecedoresOrdenados.forEach((forn) => {
        const itensForn = fornecedoresMap.get(forn) || [];
        itensForn.sort((a, b) => a.nomeItem.localeCompare(b.nomeItem, "pt-BR"));

        let subtotalQtd = 0;
        itensForn.forEach((it) => {
          subtotalQtd += it.quantidadeNecessaria;
          const status = it.saldoEstoqueItem >= it.quantidadeNecessaria
            ? "Disponível em Estoque"
            : `Insuficiente (Falta ${it.quantidadeNecessaria - it.saldoEstoqueItem} un)`;
          const classif = it.isPainel ? "Painel" : "Não-Painel";
          csv += `"${forn.replace(/"/g, '""')}";#${it.itemId};"${it.nomeItem.replace(/"/g, '""')}";"${classif}";${it.quantidadeNecessaria};${it.saldoEstoqueItem};${it.montagensPossiveis} un;"${status}"\n`;
        });

        csv += `"[SUBTOTAL ${forn.replace(/"/g, '""')}]";"";"${itensForn.length} item(ns) distinto(s)";"";${subtotalQtd};"";"";""\n\n`;
      });
    }

    // 4. RESUMO DE INSUMOS POR FORNECEDOR
    csv += "\n4. RESUMO DE INSUMOS E CAPACIDADE POR FORNECEDOR\n";
    csv += "Fornecedor;Total de Peças Diferentes;Total de Unidades por Kit;Capacidade de Montagem Suportada\n";
    fornecedoresOrdenados.forEach((forn) => {
      const itensForn = fornecedoresMap.get(forn) || [];
      const totalUnidades = itensForn.reduce((acc, curr) => acc + curr.quantidadeNecessaria, 0);
      const capacidadeGargaloForn = itensForn.length > 0 ? Math.min(...itensForn.map((i) => i.montagensPossiveis)) : 0;
      csv += `"${forn.replace(/"/g, '""')}";${itensForn.length};${totalUnidades};${capacidadeGargaloForn} kit(s)\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const filename = `kit_${kit.id}_${kit.nome.toLowerCase().replace(/[^a-z0-9]/g, "_")}_composicao.csv`;
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    success("Ficha técnica do kit exportada para CSV com sucesso!");
  };

  const filteredKits = useMemo(() => {
    return kits.filter((k) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm.trim() ||
        k.nome.toLowerCase().includes(term) ||
        k.id.toString().includes(term);

      const isAtivo = k.ativo !== false;
      const matchesStatus =
        statusFilter === "todos" ||
        (statusFilter === "ativos" && isAtivo) ||
        (statusFilter === "inativos" && !isAtivo);

      return matchesSearch && matchesStatus;
    });
  }, [kits, searchTerm, statusFilter]);

  const enrichedKits = useMemo(() => {
    return filteredKits.map((k) => {
      const saldo = kitSaldosMap.get(k.id);
      return {
        ...k,
        saldoFisico: saldo?.saldoFisico ?? 0,
        capacidadeMontagem: saldo?.capacidadeMontagem ?? 0,
        totalItensComposicao: saldo?.totalItensComposicao ?? 0,
      };
    });
  }, [filteredKits, kitSaldosMap]);

  const {
    items: sortedKits,
    sortKey: kitSortKey,
    sortDirection: kitSortDir,
    requestSort: requestKitSort,
  } = useTableSort(enrichedKits, "id", "asc");

  // Kits paginados para exibição na tabela
  const paginatedKits = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedKits.slice(start, start + pageSize);
  }, [sortedKits, currentPage, pageSize]);

  // Hook de Ordenação para os Itens da Composição (BOM)
  const bomItems = useMemo(() => {
    return activeKitDetails?.items || [];
  }, [activeKitDetails]);

  const {
    items: sortedBomItems,
    sortKey: bomSortKey,
    sortDirection: bomSortDir,
    requestSort: requestBomSort,
  } = useTableSort(bomItems, "itemNome", "asc");

  // Hook de Ordenação para o Histórico de Auditoria do Kit
  const {
    items: sortedKitAudit,
    sortKey: kitAuditSortKey,
    sortDirection: kitAuditSortDir,
    requestSort: requestKitAuditSort,
  } = useTableSort(historicoList, "dataMovimentacao", "desc");

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-info">
          <h1>
            <Layers size={24} color="var(--accent)" />
            Gestão de Kits & Composições
          </h1>
          <p>Cadastre kits de produtos e componha seus itens, quantidades e peças de painel</p>
        </div>

        <div className="page-header-actions">
          <button
            className="btn btn-secondary"
            onClick={() => handleOpenHistorico()}
            title="Ver histórico consolidado de movimentações e montagens de todos os kits"
          >
            <History size={18} />
            Histórico Geral
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setIsSimuladorOpen(true)}
            title="Simular demanda agregada de insumos para múltiplos kits"
            style={{
              borderColor: "var(--accent, #3b82f6)",
              color: "var(--accent, #3b82f6)",
            }}
          >
            <Calculator size={18} />
            Simular Montagem
          </button>
          <button
            className="btn btn-secondary btn-icon"
            onClick={carregarKits}
            title="Atualizar lista"
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? "spinner" : ""} />
          </button>
          <button className="btn btn-primary" onClick={handleOpenCreateKit}>
            <Plus size={18} />
            Novo Kit
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar" style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
        <div className="search-input-wrapper" style={{ flex: "1 1 300px" }}>
          <Search size={16} />
          <input
            type="text"
            className="form-input"
            placeholder="Pesquisar por nome ou ID do kit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="btn-group" style={{ display: "inline-flex", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border)" }}>
          <button
            type="button"
            className={`btn btn-sm ${statusFilter === "todos" ? "btn-primary" : "btn-secondary"}`}
            style={{ borderRadius: 0, padding: "6px 12px" }}
            onClick={() => setStatusFilter("todos")}
          >
            Todos ({kits.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${statusFilter === "ativos" ? "btn-primary" : "btn-secondary"}`}
            style={{ borderRadius: 0, padding: "6px 12px" }}
            onClick={() => setStatusFilter("ativos")}
          >
            <CheckCircle size={13} style={{ marginRight: "4px" }} />
            Ativos ({kits.filter((k) => k.ativo !== false).length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${statusFilter === "inativos" ? "btn-primary" : "btn-secondary"}`}
            style={{ borderRadius: 0, padding: "6px 12px" }}
            onClick={() => setStatusFilter("inativos")}
          >
            <Ban size={13} style={{ marginRight: "4px" }} />
            Inativos ({kits.filter((k) => k.ativo === false).length})
          </button>
        </div>

        <span className="badge badge-gray" style={{ marginLeft: "auto" }}>
          Exibindo: {filteredKits.length} {filteredKits.length === 1 ? "kit" : "kits"}
        </span>
      </div>

      {/* Conteúdo dos Kits */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
          <p>Carregando kits da ShelfApi...</p>
        </div>
      ) : errorMsg ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <AlertCircle size={48} color="var(--danger)" />
          </div>
          <h3 className="empty-state-title">Erro de Conexão</h3>
          <p className="empty-state-text">{errorMsg}</p>
          <button className="btn btn-primary" onClick={carregarKits}>
            <RefreshCw size={16} /> Tentar Novamente
          </button>
        </div>
      ) : filteredKits.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Layers size={48} />
          </div>
          <h3 className="empty-state-title">Nenhum kit encontrado</h3>
          <p className="empty-state-text">
            {searchTerm
              ? "Nenhum kit corresponde aos termos da pesquisa."
              : "Cadastre kits para agrupar múltiplos itens e criar pacotes de instalação."}
          </p>
          <button className="btn btn-primary" onClick={handleOpenCreateKit}>
            <Plus size={16} /> Cadastrar Primeiro Kit
          </button>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <SortableTh
                    sortKey="id"
                    currentSortKey={kitSortKey}
                    currentDirection={kitSortDir}
                    onSort={requestKitSort}
                    style={{ width: "80px" }}
                  >
                    ID
                  </SortableTh>
                  <SortableTh
                    sortKey="nome"
                    currentSortKey={kitSortKey}
                    currentDirection={kitSortDir}
                    onSort={requestKitSort}
                  >
                    Nome do Kit
                  </SortableTh>
                  <SortableTh
                    sortKey="saldoFisico"
                    currentSortKey={kitSortKey}
                    currentDirection={kitSortDir}
                    onSort={requestKitSort}
                    style={{ width: "160px" }}
                  >
                    Estoque Físico (Prontos)
                  </SortableTh>
                  <SortableTh
                    sortKey="capacidadeMontagem"
                    currentSortKey={kitSortKey}
                    currentDirection={kitSortDir}
                    onSort={requestKitSort}
                    style={{ width: "190px" }}
                  >
                    Capacidade de Montagem
                  </SortableTh>
                  <SortableTh
                    sortKey="totalItensComposicao"
                    currentSortKey={kitSortKey}
                    currentDirection={kitSortDir}
                    onSort={requestKitSort}
                    style={{ width: "170px" }}
                    align="center"
                  >
                    Composição
                  </SortableTh>
                  <SortableTh
                    sortKey="ativo"
                    currentSortKey={kitSortKey}
                    currentDirection={kitSortDir}
                    onSort={requestKitSort}
                    style={{ width: "110px" }}
                    align="center"
                  >
                    Status
                  </SortableTh>
                  <th style={{ width: "210px", textAlign: "center" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginatedKits.map((kit) => {
                  const isAtivo = kit.ativo !== false;
                  const saldo = kitSaldosMap.get(kit.id);
                  const saldoFisico = saldo?.saldoFisico ?? 0;
                  const capacidade = saldo?.capacidadeMontagem ?? 0;
                  const totalComposicao = saldo?.totalItensComposicao ?? 0;

                  return (
                    <tr key={kit.id} style={{ opacity: isAtivo ? 1 : 0.65 }}>
                      <td>
                        <span className="badge badge-blue">#{kit.id}</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {kit.nome}
                        {!isAtivo && (
                          <span style={{ marginLeft: "8px", fontSize: "11px", color: "var(--text-muted)" }}>
                            (Inoperante)
                          </span>
                        )}
                      </td>
                      <td>
                        {saldoFisico > 0 ? (
                          <span className="badge badge-green" style={{ fontWeight: 700 }}>
                            {saldoFisico} un prontos
                          </span>
                        ) : (
                          <span className="badge badge-gray" style={{ color: "var(--text-muted)" }}>
                            0 un
                          </span>
                        )}
                      </td>
                      <td>
                        {totalComposicao === 0 ? (
                          <span className="badge badge-gray" style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                            Sem itens vinculados
                          </span>
                        ) : capacidade > 0 ? (
                          <span
                            className="badge badge-blue"
                            style={{ fontWeight: 700 }}
                            title={`Saldo de peças atual permite montar ${capacidade} unidades`}
                          >
                            {capacidade} un montáveis
                          </span>
                        ) : (
                          <span
                            className="badge badge-amber"
                            style={{ fontWeight: 600, display: "inline-flex", gap: "4px" }}
                            title="Peças insuficientes no estoque para montar este kit"
                          >
                            <AlertTriangle size={12} /> 0 un (Falta peça)
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenDetails(kit)}
                          title="Ver itens e composição do kit"
                        >
                          <PackageCheck size={15} color="var(--accent)" />
                          Composição ({totalComposicao})
                        </button>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span className={`badge ${isAtivo ? "badge-green" : "badge-gray"}`}>
                          {isAtivo ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className={`btn btn-icon btn-sm ${isAtivo ? "btn-ghost-warning" : "btn-ghost-success"}`}
                            onClick={() => handleToggleStatus(kit)}
                            title={isAtivo ? "Inativar kit no ERP" : "Reativar kit"}
                          >
                            <Power size={15} />
                          </button>
                          <button
                            className="btn btn-icon btn-sm btn-ghost-primary"
                            onClick={() => handleOpenMontar(kit.id)}
                            title={!isAtivo ? "Kit inativo no ERP (não permite montagem)" : "Montar Kit (dar baixa em peças e creditar kit)"}
                            disabled={!isAtivo || totalComposicao === 0 || capacidade === 0}
                          >
                            <Hammer size={15} />
                          </button>
                          <button
                            className="btn btn-icon btn-sm btn-ghost-primary"
                            onClick={() => handleOpenDesmontar(kit.id)}
                            title="Desmontar Kit (devolver peças ao estoque)"
                            disabled={saldoFisico === 0}
                          >
                            <PackageMinus size={15} />
                          </button>
                          <button
                            className="btn btn-icon btn-sm btn-ghost-primary"
                            onClick={() => handleOpenHistorico(kit)}
                            title="Histórico de montagens/movimentações deste kit"
                          >
                            <History size={15} />
                          </button>
                          <button
                            className="btn btn-icon btn-sm btn-ghost-primary"
                            onClick={() => handleExportKitCSV(kit)}
                            title="Exportar composição do kit em CSV (Painel vs Não-Painel)"
                            style={{ color: "#10b981" }}
                          >
                            <FileSpreadsheet size={15} />
                          </button>
                          <button
                            className="btn btn-icon btn-sm btn-ghost-primary"
                            onClick={() => handleOpenEditKit(kit)}
                            title="Editar nome do kit"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            className="btn btn-icon btn-sm btn-ghost-danger"
                            onClick={() => handleOpenDeleteKit(kit)}
                            title="Excluir kit"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={filteredKits.length}
            pageSize={pageSize}
            pageSizeOptions={[10, 20, 50]}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            itemLabel={filteredKits.length === 1 ? "kit" : "kits"}
          />
        </>
      )}

      {/* Modal de Criação / Edição de Kit */}
      <Modal
        isOpen={isKitModalOpen}
        onClose={() => !submittingKit && setIsKitModalOpen(false)}
        title={editingKit ? "Editar Kit" : "Cadastrar Novo Kit"}
        maxWidth="500px"
      >
        <form onSubmit={handleSubmitKit}>
          <div className="form-group">
            <label className="form-label" htmlFor="kitNome">
              Nome do Kit *
            </label>
            <input
              id="kitNome"
              type="text"
              className="form-input"
              placeholder="Ex: Kit Automação Batedeira 100L..."
              value={kitNome}
              onChange={(e) => setKitNome(e.target.value)}
              required
              disabled={submittingKit}
              autoFocus
            />
          </div>

          <div className="modal-footer" style={{ padding: "16px 0 0 0", marginTop: "20px" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsKitModalOpen(false)}
              disabled={submittingKit}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={submittingKit}>
              {submittingKit ? "Salvando..." : editingKit ? "Salvar Alterações" : "Criar Kit"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Confirmação de Exclusão de Kit */}
      <ConfirmModal
        isOpen={isDeleteKitModalOpen}
        onClose={() => !deletingKitLoading && setIsDeleteKitModalOpen(false)}
        onConfirm={handleConfirmDeleteKit}
        title="Excluir Kit"
        message={`Deseja realmente excluir o kit "${deletingKit?.nome}"? Kits com histórico de montagens, instalações ou saldo não podem ser excluídos, devendo ser inativados.`}
        confirmLabel="Sim, Excluir"
        isLoading={deletingKitLoading}
      />

      {/* Modal Grande de Composição e Itens do Kit */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title={`Composição do Kit: ${activeKitDetails?.nome || ""}`}
        maxWidth="720px"
      >
        {loadingDetails ? (
          <div className="loading-container">
            <div className="spinner" />
            <p>Buscando itens vinculados ao kit...</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Seção de Adição de Novo Item ao Kit */}
            <div className="card" style={{ padding: "16px", backgroundColor: "var(--bg-app)" }}>
              <h4 style={{ fontSize: "14px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Plus size={16} color="var(--accent)" />
                Adicionar Item ao Kit
              </h4>
              <form onSubmit={handleAddItemToKit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 110px auto", gap: "12px", alignItems: "flex-end" }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Item do Estoque</label>
                    <select
                      className="form-select"
                      value={selectedItemId}
                      onChange={(e) => setSelectedItemId(Number(e.target.value))}
                      required
                      disabled={addingItemLoading}
                    >
                      {estoqueItens.length === 0 ? (
                        <option value="">Nenhum item cadastrado no estoque</option>
                      ) : (
                        estoqueItens.map((i) => (
                          <option key={i.id} value={i.id}>
                            {i.nome} (ID #{i.id})
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Quantidade</label>
                    <input
                      type="number"
                      min="1"
                      max="1000000"
                      className="form-input"
                      value={quantidade}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setQuantidade(Math.min(1000000, Math.max(1, val)));
                      }}
                      required
                      disabled={addingItemLoading}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label className="form-checkbox" style={{ fontSize: "12px" }}>
                      <input
                        type="checkbox"
                        checked={isPainel}
                        onChange={(e) => setIsPainel(e.target.checked)}
                        disabled={addingItemLoading}
                      />
                      <span>Item de Painel?</span>
                    </label>

                    <button
                      type="submit"
                      className="btn btn-primary btn-sm"
                      disabled={addingItemLoading || estoqueItens.length === 0}
                    >
                      <Plus size={14} />
                      {addingItemLoading ? "Adicionando..." : "Adicionar"}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Tabela de Itens já associados */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
                <h4 style={{ fontSize: "14px", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  <Boxes size={16} color="var(--accent)" />
                  Itens Atuais na Composição ({activeKitDetails?.items?.length || 0})
                </h4>
                {activeKitDetails && (
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={() => {
                      const k = kits.find((x) => x.id === activeKitDetails.id) || { id: activeKitDetails.id, nome: activeKitDetails.nome };
                      handleExportKitCSV(k);
                    }}
                    title="Exportar esta composição em CSV (Painel vs Não-Painel)"
                  >
                    <FileSpreadsheet size={14} color="#10b981" /> Exportar CSV do Kit
                  </button>
                )}
              </div>

              {!activeKitDetails?.items || activeKitDetails.items.length === 0 ? (
                <div className="empty-state" style={{ padding: "30px 16px" }}>
                  <p className="empty-state-text" style={{ marginBottom: 0 }}>
                    Este kit ainda não possui nenhum item vinculado. Use o formulário acima para adicionar peças do estoque.
                  </p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <SortableTh
                          sortKey="itemNome"
                          currentSortKey={bomSortKey}
                          currentDirection={bomSortDir}
                          onSort={requestBomSort}
                        >
                          Item
                        </SortableTh>
                        <SortableTh
                          sortKey="quantidade"
                          currentSortKey={bomSortKey}
                          currentDirection={bomSortDir}
                          onSort={requestBomSort}
                          style={{ width: "90px" }}
                          align="center"
                        >
                          Qtd
                        </SortableTh>
                        <SortableTh
                          sortKey="isPainel"
                          currentSortKey={bomSortKey}
                          currentDirection={bomSortDir}
                          onSort={requestBomSort}
                          style={{ width: "120px" }}
                          align="center"
                        >
                          Tipo
                        </SortableTh>
                        <th style={{ width: "100px", textAlign: "right" }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedBomItems.map((item) => (
                        <tr key={item.itemId}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{item.itemNome || `Item #${item.itemId}`}</div>
                            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>ID: #{item.itemId}</span>
                          </td>
                          <td style={{ textAlign: "center", fontWeight: 700 }}>
                            {item.quantidade}x
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {item.isPainel ? (
                              <span className="badge badge-amber" title="Componente exclusivo do painel">
                                <Cpu size={12} /> Painel
                              </span>
                            ) : (
                              <span className="badge badge-gray" title="Componente comum">
                                Padrão
                              </span>
                            )}
                          </td>
                          <td>
                            <div className="table-actions">
                              <button
                                className="btn btn-icon btn-sm btn-ghost-primary"
                                onClick={() => handleOpenEditKitItem(item)}
                                title="Editar quantidade ou tipo"
                              >
                                <Settings2 size={15} />
                              </button>
                              <button
                                className="btn btn-icon btn-sm btn-ghost-danger"
                                onClick={() => handleOpenRemoveItem(item)}
                                title="Remover item do kit"
                              >
                                <MinusCircle size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsDetailsModalOpen(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Edição de Item do Kit */}
      <Modal
        isOpen={isEditKitItemModalOpen}
        onClose={() => !updatingKitItemLoading && setIsEditKitItemModalOpen(false)}
        title={`Editar Parâmetros: ${editingKitItem?.itemNome || "Item"}`}
        maxWidth="440px"
      >
        <form onSubmit={handleSaveEditKitItem}>
          <div className="form-group">
            <label className="form-label">Quantidade</label>
            <input
              type="number"
              min="1"
              max="1000000"
              className="form-input"
              value={editQtd}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                setEditQtd(Math.min(1000000, Math.max(1, val)));
              }}
              required
              disabled={updatingKitItemLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-checkbox">
              <input
                type="checkbox"
                checked={editIsPainel}
                onChange={(e) => setEditIsPainel(e.target.checked)}
                disabled={updatingKitItemLoading}
              />
              <span>É Item de Painel? (isPainel)</span>
            </label>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsEditKitItemModalOpen(false)}
              disabled={updatingKitItemLoading}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={updatingKitItemLoading}>
              {updatingKitItemLoading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Confirmação de Remoção de Item do Kit */}
      <ConfirmModal
        isOpen={isRemoveItemModalOpen}
        onClose={() => !removingItemLoading && setIsRemoveItemModalOpen(false)}
        onConfirm={handleConfirmRemoveItem}
        title="Remover Item do Kit"
        message={`Deseja realmente remover o item "${itemToRemove?.itemNome || `#${itemToRemove?.itemId}`}" deste kit? O item continuará disponível no estoque.`}
        confirmLabel="Remover do Kit"
        isLoading={removingItemLoading}
      />

      {/* Modal de Montagem de Kit */}
      <Modal
        isOpen={isMontarModalOpen}
        onClose={() => !submittingMontar && setIsMontarModalOpen(false)}
        title={`Montagem de Kit: ${montarKitTarget?.nomeKit || ""}`}
        maxWidth="680px"
      >
        <form onSubmit={handleSubmitMontar}>
          {montarKitTarget && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  padding: "14px",
                  backgroundColor: "var(--bg-app)",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                }}
              >
                <div>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Estoque Físico Atual:</span>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                    {montarKitTarget.saldoFisico} un prontos
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Capacidade Máxima de Montagem:</span>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--accent)" }}>
                    {montarKitTarget.capacidadeMontagem} un montáveis
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Quantidade de Kits a Montar *</label>
                <input
                  type="number"
                  min="1"
                  max={montarKitTarget.capacidadeMontagem}
                  className="form-input"
                  value={montarQtd}
                  onChange={(e) => setMontarQtd(Math.max(1, parseInt(e.target.value) || 1))}
                  required
                  disabled={submittingMontar || montarKitTarget.capacidadeMontagem <= 0}
                />
                <span style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
                  A montagem deduzirá as peças necessárias do estoque e somará {montarQtd} kit(s) no estoque físico.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Peças que serão consumidas do estoque:</label>
                <div className="table-container" style={{ maxHeight: "200px", overflowY: "auto" }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th style={{ width: "90px", textAlign: "center" }}>Por Kit</th>
                        <th style={{ width: "110px", textAlign: "center" }}>Total Necessário</th>
                        <th style={{ width: "110px", textAlign: "center" }}>Saldo Atual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {montarKitTarget.itens.map((it) => {
                        const totalReq = it.quantidadeNecessaria * montarQtd;
                        const hasEnough = it.saldoEstoqueItem >= totalReq;
                        return (
                          <tr key={it.itemId}>
                            <td style={{ fontWeight: 600 }}>{it.nomeItem}</td>
                            <td style={{ textAlign: "center" }}>{it.quantidadeNecessaria}x</td>
                            <td style={{ textAlign: "center", fontWeight: 700 }}>{totalReq} un</td>
                            <td style={{ textAlign: "center" }}>
                              <span className={hasEnough ? "badge badge-green" : "badge badge-amber"}>
                                {it.saldoEstoqueItem} un
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Motivo / Ordem de Produção (Opcional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex.: Lote de montagem #142 / Pré-montagem para estoque"
                  value={montarMotivo}
                  onChange={(e) => setMontarMotivo(e.target.value)}
                  disabled={submittingMontar}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsMontarModalOpen(false)}
                  disabled={submittingMontar}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingMontar || montarKitTarget.capacidadeMontagem <= 0 || montarQtd > montarKitTarget.capacidadeMontagem}
                >
                  <Hammer size={16} />
                  {submittingMontar ? "Registrando Montagem..." : `Confirmar Montagem (${montarQtd})`}
                </button>
              </div>
            </div>
          )}
        </form>
      </Modal>

      {/* Modal de Desmontagem de Kit */}
      <Modal
        isOpen={isDesmontarModalOpen}
        onClose={() => !submittingDesmontar && setIsDesmontarModalOpen(false)}
        title={`Desmontagem de Kit: ${desmontarKitTarget?.nomeKit || ""}`}
        maxWidth="680px"
      >
        <form onSubmit={handleSubmitDesmontar}>
          {desmontarKitTarget && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div
                style={{
                  padding: "14px",
                  backgroundColor: "var(--warning-light)",
                  border: "1px solid rgba(245, 158, 11, 0.25)",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <AlertTriangle size={22} color="#f59e0b" style={{ flexShrink: 0 }} />
                <div>
                  <strong style={{ fontSize: "13.5px", color: "var(--text-primary)" }}>
                    Devolução de Componentes ao Almoxarifado
                  </strong>
                  <p style={{ margin: 0, fontSize: "12.5px", color: "var(--text-secondary)" }}>
                    Ao desmontar, o saldo físico do kit será reduzido e todas as peças constituintes serão devolvidas integralmente ao estoque de peças avulsas.
                  </p>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Quantidade de Kits a Desmontar *</label>
                <input
                  type="number"
                  min="1"
                  max={desmontarKitTarget.saldoFisico}
                  className="form-input"
                  value={desmontarQtd}
                  onChange={(e) => setDesmontarQtd(Math.max(1, parseInt(e.target.value) || 1))}
                  required
                  disabled={submittingDesmontar || desmontarKitTarget.saldoFisico <= 0}
                />
                <span style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
                  Disponível em estoque para desmontar: <b>{desmontarKitTarget.saldoFisico} unidade(s)</b>
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Componentes que serão devolvidos ao estoque:</label>
                <div className="table-container" style={{ maxHeight: "200px", overflowY: "auto" }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th style={{ width: "90px", textAlign: "center" }}>Por Kit</th>
                        <th style={{ width: "120px", textAlign: "center" }}>Total Devolvido</th>
                      </tr>
                    </thead>
                    <tbody>
                      {desmontarKitTarget.itens.map((it) => (
                        <tr key={it.itemId}>
                          <td style={{ fontWeight: 600 }}>{it.nomeItem}</td>
                          <td style={{ textAlign: "center" }}>{it.quantidadeNecessaria}x</td>
                          <td style={{ textAlign: "center", fontWeight: 700, color: "var(--success)" }}>
                            +{it.quantidadeNecessaria * desmontarQtd} un
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Motivo da Desmontagem (Opcional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex.: Reaproveitamento de componentes / Cancelamento de pedido"
                  value={desmontarMotivo}
                  onChange={(e) => setDesmontarMotivo(e.target.value)}
                  disabled={submittingDesmontar}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsDesmontarModalOpen(false)}
                  disabled={submittingDesmontar}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-danger"
                  disabled={submittingDesmontar || desmontarKitTarget.saldoFisico <= 0 || desmontarQtd > desmontarKitTarget.saldoFisico}
                >
                  <PackageMinus size={16} />
                  {submittingDesmontar ? "Desmontando..." : `Confirmar Desmontagem (${desmontarQtd})`}
                </button>
              </div>
            </div>
          )}
        </form>
      </Modal>

      {/* Modal de Histórico de Movimentações do Kit */}
      <Modal
        isOpen={isHistoricoModalOpen}
        onClose={() => setIsHistoricoModalOpen(false)}
        title={historicoKitTarget ? `Histórico de Movimentações: ${historicoKitTarget.nome} (#${historicoKitTarget.id})` : "Histórico Geral de Movimentações de Kits"}
        maxWidth="1050px"
      >
        <div>
          {loadingHistorico ? (
            <div className="loading-container" style={{ padding: "30px 0" }}>
              <div className="spinner" />
              <p>Carregando registros de auditoria...</p>
            </div>
          ) : historicoList.length === 0 ? (
            <div className="empty-state" style={{ padding: "30px 0" }}>
              <div className="empty-state-icon">
                <History size={36} />
              </div>
              <h3 className="empty-state-title">Nenhuma movimentação registrada</h3>
              <p className="empty-state-text">
                {historicoKitTarget
                  ? "Este kit ainda não teve ordens de montagem, desmontagem ou ajustes manuais registrados."
                  : "Nenhuma movimentação de kit registrada no sistema até o momento."}
              </p>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
                <span className="badge badge-gray">Total: {historicoList.length} registro(s)</span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleExportKitAuditCSV}
                  title="Exportar histórico de movimentações para arquivo CSV"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <FileSpreadsheet size={15} color="#10b981" />
                  Exportar Logs (CSV)
                </button>
              </div>
              <div className="table-container" style={{ maxHeight: "400px", overflowY: "auto", overflowX: "auto" }}>
                <table className="data-table" style={{ minWidth: "900px" }}>
                <thead>
                  <tr>
                    <SortableTh
                      sortKey="dataMovimentacao"
                      currentSortKey={kitAuditSortKey}
                      currentDirection={kitAuditSortDir}
                      onSort={requestKitAuditSort}
                      style={{ width: "140px" }}
                    >
                      Data / Hora
                    </SortableTh>
                    <SortableTh
                      sortKey="tipo"
                      currentSortKey={kitAuditSortKey}
                      currentDirection={kitAuditSortDir}
                      onSort={requestKitAuditSort}
                      style={{ width: "120px" }}
                    >
                      Operação
                    </SortableTh>
                    <SortableTh
                      sortKey="quantidade"
                      currentSortKey={kitAuditSortKey}
                      currentDirection={kitAuditSortDir}
                      onSort={requestKitAuditSort}
                      style={{ width: "90px" }}
                      align="center"
                    >
                      Qtd
                    </SortableTh>
                    <SortableTh
                      sortKey="saldoPosterior"
                      currentSortKey={kitAuditSortKey}
                      currentDirection={kitAuditSortDir}
                      onSort={requestKitAuditSort}
                      style={{ width: "120px" }}
                      align="center"
                    >
                      Saldo
                    </SortableTh>
                    <SortableTh
                      sortKey="motivo"
                      currentSortKey={kitAuditSortKey}
                      currentDirection={kitAuditSortDir}
                      onSort={requestKitAuditSort}
                    >
                      Motivo
                    </SortableTh>
                    <SortableTh
                      sortKey="usuarioNome"
                      currentSortKey={kitAuditSortKey}
                      currentDirection={kitAuditSortDir}
                      onSort={requestKitAuditSort}
                      style={{ width: "110px" }}
                    >
                      Operador
                    </SortableTh>
                  </tr>
                </thead>
                <tbody>
                  {sortedKitAudit.map((log) => {
                    const isMontagem = log.tipo.toUpperCase() === "MONTAGEM" || log.tipo.toUpperCase() === "ENTRADA";
                    return (
                      <tr key={log.id}>
                        <td style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <Clock size={12} />
                            {new Date(log.dataMovimentacao).toLocaleString("pt-BR")}
                          </span>
                        </td>
                        <td>
                          {isMontagem ? (
                            <span className="badge badge-green" style={{ fontWeight: 700 }}>
                              <Hammer size={11} /> {log.tipo}
                            </span>
                          ) : (
                            <span className="badge badge-amber" style={{ fontWeight: 700 }}>
                              <PackageMinus size={11} /> {log.tipo}
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: "center", fontWeight: 700 }}>
                          {isMontagem ? `+${log.quantidade}` : `-${log.quantidade}`}
                        </td>
                        <td style={{ textAlign: "center", fontSize: "12.5px" }}>
                          <span style={{ color: "var(--text-muted)" }}>{log.saldoAnterior}</span>
                          {" ➔ "}
                          <strong style={{ color: "var(--text-primary)" }}>{log.saldoPosterior}</strong>
                        </td>
                        <td style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
                          {log.motivo || <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Sem motivo informado</span>}
                        </td>
                        <td style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <User size={12} />
                            {log.usuarioNome}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

          <div className="modal-actions" style={{ marginTop: "16px" }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsHistoricoModalOpen(false)}>
              Fechar
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal do Simulador de Montagem Multi-Kits */}
      <SimuladorMontagemModal
        isOpen={isSimuladorOpen}
        onClose={() => setIsSimuladorOpen(false)}
        kits={kits}
        kitSaldosMap={kitSaldosMap}
      />
    </div>
  );
}
