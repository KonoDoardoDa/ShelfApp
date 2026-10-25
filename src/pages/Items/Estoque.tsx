import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Boxes,
  AlertCircle,
  Filter,
  Truck,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  History,
  User,
  ArrowRight,
  Clock,
  FileText,
  Layers,
  Hammer,
  Power,
  FileSpreadsheet,
  Upload,
} from "lucide-react";
import { Link } from "react-router-dom";
import { itemService } from "../../services/itemService";
import { fornecedorService } from "../../services/fornecedorService";
import { estoqueService } from "../../services/estoqueService";
import { estoqueKitService } from "../../services/estoqueKitService";
import type {
  Item,
  CreateItemDto,
  UpdateItemDto,
  MovimentarEstoqueDto,
  MovimentacaoHistorico,
} from "../../types/item";
import type { Fornecedor } from "../../types/fornecedor";
import type { KitSaldo } from "../../types/estoqueKit";
import { Modal } from "../../components/Modal";
import { ConfirmModal } from "../../components/ConfirmModal";
import { ImportarXmlModal } from "../../components/ImportarXmlModal";
import { Pagination } from "../../components/Pagination";
import { SortableTh } from "../../components/SortableTh";
import { useTableSort } from "../../hooks/useTableSort";
import { useSearchParams } from "react-router-dom";
import { useToast } from "../../hooks/useToast";
import { useAuth } from "../../hooks/useAuth";
import { getErrorMessage } from "../../api/http";

interface EstoqueRow {
  tipo: "ITEM" | "KIT";
  id: number;
  nome: string;
  fornecedorNome: string;
  saldo: number;
  descricao?: string | null;
  ativo?: boolean;
  item?: Item;
  kit?: KitSaldo;
}

export default function Estoque() {
  const { success, error: toastError } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [itens, setItens] = useState<Item[]>([]);
  const [kitSaldos, setKitSaldos] = useState<KitSaldo[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filtros da Tabela Principal
  const [tipoEstoqueFilter, setTipoEstoqueFilter] = useState<"all" | "pecas" | "kits">("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedFornecedorFilter, setSelectedFornecedorFilter] = useState<string>("all");
  const [selectedStatusEstoque, setSelectedStatusEstoque] = useState<string>(
    searchParams.get("status") || "all"
  );

  // Paginação
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  useEffect(() => {
    const statusParam = searchParams.get("status");
    if (statusParam) {
      setSelectedStatusEstoque(statusParam);
    }
  }, [searchParams]);

  // Reseta para a página 1 ao alterar filtros ou itens por página
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedFornecedorFilter, selectedStatusEstoque, tipoEstoqueFilter, pageSize]);

  // Modal de Formulário (Criar / Editar Item)
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [nome, setNome] = useState<string>("");
  const [fornecedorId, setFornecedorId] = useState<number | "">("");
  const [descricao, setDescricao] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Modal de Exclusão
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deletingItem, setDeletingItem] = useState<Item | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  // Modal de Movimentação de Estoque (Entrada / Saída)
  const [isEstoqueModalOpen, setIsEstoqueModalOpen] = useState<boolean>(false);
  const [stockItem, setStockItem] = useState<Item | null>(null);
  const [tipoMovimento, setTipoMovimento] = useState<"Entrada" | "Saida">("Entrada");
  const [quantidadeMovimento, setQuantidadeMovimento] = useState<number>(1);
  const [motivoMovimento, setMotivoMovimento] = useState<string>("");
  const [notaFiscalMovimento, setNotaFiscalMovimento] = useState<string>("");
  const [submittingEstoque, setSubmittingEstoque] = useState<boolean>(false);

  // Modal de Auditoria e Histórico de Movimentações
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [auditItemId, setAuditItemId] = useState<number | null>(null);
  const [auditHistorico, setAuditHistorico] = useState<MovimentacaoHistorico[]>([]);
  const [loadingAudit, setLoadingAudit] = useState<boolean>(false);
  const [auditSearch, setAuditSearch] = useState<string>("");
  const [auditFilterTipo, setAuditFilterTipo] = useState<string>("all");

  // Modal de Importação Massiva via XML
  const [isImportXmlModalOpen, setIsImportXmlModalOpen] = useState<boolean>(false);

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const [itensData, fornecedoresData, kitsData] = await Promise.all([
        itemService.getAll(),
        fornecedorService.getAll().catch(() => [] as Fornecedor[]),
        estoqueKitService.getAllSaldos().catch(() => [] as KitSaldo[]),
      ]);
      setItens(itensData || []);
      setFornecedores(fornecedoresData || []);
      setKitSaldos(kitsData || []);
    } catch (err) {
      const msg = getErrorMessage(err);
      setErrorMsg(msg);
      toastError(msg, "Erro ao carregar estoque");
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const fornecedorMap = useMemo(() => {
    const map = new Map<number, string>();
    fornecedores.forEach((f) => map.set(f.id, f.nome));
    return map;
  }, [fornecedores]);

  // Abertura de Modais de Cadastro / Edição
  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setNome("");
    const defaultFornecedor = fornecedores.find((f) => f.ativo !== false);
    setFornecedorId(defaultFornecedor ? defaultFornecedor.id : fornecedores.length > 0 ? fornecedores[0].id : "");
    setDescricao("");
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (item: Item) => {
    setEditingItem(item);
    setNome(item.nome);
    setFornecedorId(item.fornecedorId);
    setDescricao(item.descricao || "");
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (item: Item) => {
    setDeletingItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleToggleItemStatus = async (item: Item) => {
    try {
      await itemService.toggleStatus(item.id);
      const novoStatus = item.ativo === false ? "reativado" : "inativado";
      success(`Item "${item.nome}" ${novoStatus} com sucesso!`);
      await carregarDados();
    } catch (err) {
      toastError(getErrorMessage(err), "Falha ao alterar status");
    }
  };

  // Abertura de Modal de Movimentação de Estoque
  const handleOpenEstoqueModal = (item: Item, tipoInicial: "Entrada" | "Saida" = "Entrada") => {
    setStockItem(item);
    setTipoMovimento(tipoInicial);
    setQuantidadeMovimento(1);
    setMotivoMovimento("");
    setNotaFiscalMovimento("");
    setIsEstoqueModalOpen(true);
  };

  // Abertura de Modal de Auditoria e Histórico
  const handleOpenAuditModal = async (itemId?: number) => {
    const targetId = itemId ?? null;
    setAuditItemId(targetId);
    setAuditSearch("");
    setAuditFilterTipo("all");
    setIsAuditModalOpen(true);

    try {
      setLoadingAudit(true);
      const data = await estoqueService.getHistorico(targetId ?? undefined, 150);
      setAuditHistorico(data || []);
    } catch (err) {
      toastError(getErrorMessage(err), "Falha ao carregar histórico de auditoria");
    } finally {
      setLoadingAudit(false);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      toastError("O nome do item é obrigatório.");
      return;
    }
    if (!fornecedorId || Number(fornecedorId) <= 0) {
      toastError("Selecione um fornecedor válido.");
      return;
    }

    try {
      setSubmitting(true);
      if (editingItem) {
        const updateData: UpdateItemDto = {
          id: editingItem.id,
          nome: nome.trim(),
          fornecedorId: Number(fornecedorId),
          descricao: descricao.trim() || null,
          ativo: editingItem.ativo ?? true,
        };
        await itemService.update(updateData);
        success(`Item "${nome.trim()}" atualizado com sucesso!`);
      } else {
        const createData: CreateItemDto = {
          nome: nome.trim(),
          fornecedorId: Number(fornecedorId),
          descricao: descricao.trim() || null,
          ativo: true,
        };
        await itemService.create(createData);
        success(`Item "${nome.trim()}" criado com sucesso!`);
      }
      setIsFormModalOpen(false);
      await carregarDados();
    } catch (err) {
      toastError(getErrorMessage(err), "Falha ao salvar item");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;

    try {
      setDeleting(true);
      await itemService.delete(deletingItem.id);
      success(`Item "${deletingItem.nome}" removido do estoque!`);
      setIsDeleteModalOpen(false);
      setDeletingItem(null);
      await carregarDados();
    } catch (err) {
      toastError(getErrorMessage(err), "Aviso do ERP");
    } finally {
      setDeleting(false);
    }
  };

  // Submissão da Movimentação de Estoque
  const handleSubmitEstoque = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockItem) return;

    if (quantidadeMovimento <= 0 || quantidadeMovimento > 1000000) {
      toastError("A quantidade a ser movimentada deve ser entre 1 e 1.000.000 unidades.");
      return;
    }

    const saldoAtual = stockItem.quantidadeEstoque ?? 0;
    if (tipoMovimento === "Saida" && quantidadeMovimento > saldoAtual) {
      toastError(`Saldo insuficiente. O item possui apenas ${saldoAtual} unidades em estoque.`);
      return;
    }

    try {
      setSubmittingEstoque(true);
      const payload: MovimentarEstoqueDto = {
        itemId: stockItem.id,
        tipo: tipoMovimento,
        quantidade: Number(quantidadeMovimento),
        motivo: motivoMovimento.trim() || null,
        notaFiscal: tipoMovimento === "Entrada" && notaFiscalMovimento.trim() ? notaFiscalMovimento.trim() : null,
        usuarioNome: user?.nome || user?.email || "Operador",
      };

      const res = await estoqueService.movimentar(payload);
      success(`Movimentação registrada com sucesso! Novo saldo: ${res.novoSaldo} un.`);
      setIsEstoqueModalOpen(false);
      setStockItem(null);
      await carregarDados();
    } catch (err) {
      toastError(getErrorMessage(err), "Falha ao movimentar estoque");
    } finally {
      setSubmittingEstoque(false);
    }
  };

  const allRows: EstoqueRow[] = useMemo(() => {
    const itemRows: EstoqueRow[] = itens.map((i) => ({
      tipo: "ITEM",
      id: i.id,
      nome: i.nome,
      fornecedorNome: fornecedorMap.get(i.fornecedorId) || `ID #${i.fornecedorId}`,
      saldo: i.quantidadeEstoque ?? 0,
      descricao: i.descricao,
      ativo: i.ativo !== false,
      item: i,
    }));

    const kitRows: EstoqueRow[] = kitSaldos.map((k) => ({
      tipo: "KIT",
      id: k.kitId,
      nome: k.nomeKit,
      fornecedorNome: "Montagem Interna / Fábrica",
      saldo: k.saldoFisico,
      descricao: `Kit composto por ${k.totalItensComposicao} peças (${k.capacidadeMontagem} montagens disponíveis)`,
      ativo: true,
      kit: k,
    }));

    if (tipoEstoqueFilter === "pecas") return itemRows;
    if (tipoEstoqueFilter === "kits") return kitRows;
    return [...itemRows, ...kitRows];
  }, [itens, kitSaldos, fornecedorMap, tipoEstoqueFilter]);

  const filteredRows = useMemo(() => {
    return allRows.filter((row) => {
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm.trim() ||
        row.nome.toLowerCase().includes(query) ||
        (row.descricao && row.descricao.toLowerCase().includes(query)) ||
        row.id.toString().includes(query);

      const matchesFornecedor =
        selectedFornecedorFilter === "all" ||
        (row.item && row.item.fornecedorId.toString() === selectedFornecedorFilter);

      const qtd = row.saldo;
      let matchesStatus = true;
      if (selectedStatusEstoque === "normal") {
        matchesStatus = qtd > 10 && row.ativo !== false;
      } else if (selectedStatusEstoque === "baixo") {
        matchesStatus = qtd > 0 && qtd <= 10 && row.ativo !== false;
      } else if (selectedStatusEstoque === "zerado") {
        matchesStatus = qtd <= 0 && row.ativo !== false;
      } else if (selectedStatusEstoque === "inativo") {
        matchesStatus = row.ativo === false;
      }

      return matchesSearch && matchesFornecedor && matchesStatus;
    });
  }, [allRows, searchTerm, selectedFornecedorFilter, selectedStatusEstoque]);

  // Hook de Ordenação para a Tabela Principal
  const {
    items: sortedRows,
    sortKey,
    sortDirection,
    requestSort,
  } = useTableSort(filteredRows, "id", "asc");

  // Registros paginados baseados no array ordenado
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, currentPage, pageSize]);

  // Filtragem dos logs de Auditoria
  const filteredAudit = useMemo(() => {
    return auditHistorico.filter((log) => {
      const query = auditSearch.toLowerCase();
      const matchesSearch =
        !query ||
        log.nomeItem.toLowerCase().includes(query) ||
        (log.motivo && log.motivo.toLowerCase().includes(query)) ||
        (log.notaFiscal && log.notaFiscal.toLowerCase().includes(query)) ||
        (log.fornecedorNome && log.fornecedorNome.toLowerCase().includes(query)) ||
        (log.usuarioNome && log.usuarioNome.toLowerCase().includes(query)) ||
        log.itemId.toString().includes(query);

      const matchesTipo =
        auditFilterTipo === "all" || log.tipo.toLowerCase() === auditFilterTipo.toLowerCase();

      return matchesSearch && matchesTipo;
    });
  }, [auditHistorico, auditSearch, auditFilterTipo]);

  // Hook de Ordenação para a Tabela de Auditoria
  const {
    items: sortedAudit,
    sortKey: auditSortKey,
    sortDirection: auditSortDir,
    requestSort: requestAuditSort,
  } = useTableSort(filteredAudit, "dataMovimentacao", "desc");

  // Renderiza badge com cor semântica do saldo de estoque
  const renderBadgeEstoque = (qtd: number) => {
    if (qtd <= 0) {
      return <span className="badge badge-red font-mono">Zerado ({qtd} un)</span>;
    }
    if (qtd <= 10) {
      return <span className="badge badge-amber font-mono">Estoque Baixo ({qtd} un)</span>;
    }
    return <span className="badge badge-green font-mono">{qtd} un</span>;
  };

  const formatarDataHora = (dataStr: string) => {
    try {
      const d = new Date(dataStr);
      return d.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dataStr;
    }
  };

  const handleExportAuditCSV = () => {
    if (filteredAudit.length === 0) return;
    const now = new Date();
    const dataHoraStr = now.toLocaleDateString("pt-BR") + " " + now.toLocaleTimeString("pt-BR");

    const targetItemObj = auditItemId ? itens.find((i) => i.id === auditItemId) : null;

    let csv = "\uFEFF"; // UTF-8 BOM para Excel PT-BR
    csv += "HISTÓRICO DE AUDITORIA DE MOVIMENTAÇÕES DE ESTOQUE (PEÇAS)\n";
    csv += `Escopo;${targetItemObj ? `Item #${targetItemObj.id} - "${targetItemObj.nome.replace(/"/g, '""')}"` : "Todas as Peças do ERP"}\n`;
    csv += `Data de Exportação;${dataHoraStr}\n`;
    csv += `Total de Registros;${filteredAudit.length}\n\n`;

    csv += "Data / Hora;Código Item;Nome da Peça;Fornecedor;Nota Fiscal;Tipo de Operação;Quantidade;Saldo Anterior;Saldo Posterior;Responsável;Motivo / Justificativa\n";

    sortedAudit.forEach((log) => {
      const dataFormatada = formatarDataHora(log.dataMovimentacao);
      const nomeItem = (log.nomeItem || `Item #${log.itemId}`).replace(/"/g, '""');
      const itemCadastrado = itens.find((i) => i.id === log.itemId);
      const fornecedor = (
        log.fornecedorNome ||
        (itemCadastrado?.fornecedorId ? fornecedorMap.get(itemCadastrado.fornecedorId) : null) ||
        "Sem Fornecedor"
      ).replace(/"/g, '""');
      const nfFormatada = (log.notaFiscal || "—").replace(/"/g, '""');
      const tipo = log.tipo;
      const isEntrada = tipo === "Entrada";
      const qtdFormatada = isEntrada ? `+${log.quantidade}` : `-${log.quantidade}`;
      const operador = (log.usuarioNome || "Sistema").replace(/"/g, '""');
      const motivoFormatado = (log.motivo || "Não informado").replace(/"/g, '""');

      csv += `"${dataFormatada}";#${log.itemId};"${nomeItem}";"${fornecedor}";"${nfFormatada}";"${tipo}";${qtdFormatada};${log.saldoAnterior};${log.saldoPosterior};"${operador}";"${motivoFormatado}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dataArquivo = now.toISOString().slice(0, 10);
    const prefixo = auditItemId ? `logs_movimentacao_item_${auditItemId}` : "logs_movimentacoes_estoque_geral";
    link.setAttribute("href", url);
    link.setAttribute("download", `${prefixo}_${dataArquivo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    success("Logs de movimentações de estoque exportados para CSV com sucesso!");
  };

  const saldoAtualStockItem = stockItem?.quantidadeEstoque ?? 0;
  const novoSaldoPreview =
    tipoMovimento === "Entrada"
      ? saldoAtualStockItem + Number(quantidadeMovimento || 0)
      : saldoAtualStockItem - Number(quantidadeMovimento || 0);

  const saldoInsuficiente = tipoMovimento === "Saida" && novoSaldoPreview < 0;
  const auditTargetItem = auditItemId ? itens.find((i) => i.id === auditItemId) : null;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-info">
          <h1>
            <Boxes size={24} color="var(--accent)" />
            Controle de Estoque & Itens
          </h1>
          <p>Catálogo de produtos, peças e saldo em estoque integrado em tempo real com a ShelfApi</p>
        </div>

        <div className="page-header-actions">
          {false && (
          <button
            className="btn btn-secondary"
            onClick={() => setIsImportXmlModalOpen(true)}
            title="Importar itens e entradas de estoque em massa via arquivo XML (NF-e SEFAZ ou genérico)"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <Upload size={16} color="var(--accent, #3b82f6)" />
            Importar XML / NF-e
          </button>
          )}
          <button
            className="btn btn-secondary"
            onClick={() => handleOpenAuditModal()}
            title="Visualizar histórico completo de auditoria das movimentações"
          >
            <History size={16} />
            Histórico de Auditoria
          </button>
          <button
            className="btn btn-secondary btn-icon"
            onClick={carregarDados}
            title="Atualizar lista"
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? "spinner" : ""} />
          </button>
          <button className="btn btn-primary" onClick={handleOpenCreateModal}>
            <Plus size={18} />
            Novo Item
          </button>
        </div>
      </div>

      {/* Seletor de Categoria: Todos / Peças Avulsas / Kits Pré-Montados */}
      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
        <button
          type="button"
          className={`btn btn-sm ${tipoEstoqueFilter === "all" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setTipoEstoqueFilter("all")}
        >
          Todos os Estoques ({itens.length + kitSaldos.length})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${tipoEstoqueFilter === "pecas" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setTipoEstoqueFilter("pecas")}
        >
          <Boxes size={14} /> Peças & Componentes ({itens.length})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${tipoEstoqueFilter === "kits" ? "btn-primary" : "btn-secondary"}`}
          style={{
            backgroundColor: tipoEstoqueFilter === "kits" ? "var(--purple)" : undefined,
            borderColor: tipoEstoqueFilter === "kits" ? "var(--purple)" : undefined,
            color: tipoEstoqueFilter === "kits" ? "#ffffff" : undefined,
          }}
          onClick={() => setTipoEstoqueFilter("kits")}
        >
          <Layers size={14} /> Kits Pré-Montados ({kitSaldos.length})
        </button>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} />
          <input
            type="text"
            className="form-input"
            placeholder="Pesquisar por nome, descrição ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Filter size={16} color="var(--text-muted)" />
          <select
            className="form-select"
            style={{ width: "190px" }}
            value={selectedFornecedorFilter}
            onChange={(e) => setSelectedFornecedorFilter(e.target.value)}
          >
            <option value="all">Todos os Fornecedores</option>
            {fornecedores.map((f) => (
              <option key={f.id} value={f.id.toString()}>
                {f.nome} {f.ativo === false ? "(Inativo)" : ""}
              </option>
            ))}
          </select>
        </div>

        <select
          className="form-select"
          style={{ width: "180px" }}
          value={selectedStatusEstoque}
          onChange={(e) => setSelectedStatusEstoque(e.target.value)}
        >
          <option value="all">Todos os Níveis</option>
          <option value="normal">Estoque Normal (&gt; 10)</option>
          <option value="baixo">Estoque Baixo (1 a 10)</option>
          <option value="zerado">Zerados (0 un)</option>
          <option value="inativo">Inativos no ERP</option>
        </select>

        <span className="badge badge-gray">
          Total: {filteredRows.length} {filteredRows.length === 1 ? "registro" : "registros"}
        </span>
      </div>

      {/* Conteúdo */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
          <p>Carregando itens de estoque da ShelfApi...</p>
        </div>
      ) : errorMsg ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <AlertCircle size={48} color="var(--danger)" />
          </div>
          <h3 className="empty-state-title">Erro de Conexão</h3>
          <p className="empty-state-text">{errorMsg}</p>
          <button className="btn btn-primary" onClick={carregarDados}>
            <RefreshCw size={16} /> Tentar Novamente
          </button>
        </div>
      ) : filteredRows.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Boxes size={48} />
          </div>
          <h3 className="empty-state-title">Nenhum registro encontrado</h3>
          <p className="empty-state-text">
            {searchTerm || selectedFornecedorFilter !== "all" || selectedStatusEstoque !== "all" || tipoEstoqueFilter !== "all"
              ? "Nenhum item ou kit corresponde aos filtros selecionados."
              : "Nenhum item ou kit cadastrado no estoque ainda."}
          </p>
          <button className="btn btn-primary" onClick={handleOpenCreateModal}>
            <Plus size={16} /> Cadastrar Novo Item
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
                    currentSortKey={sortKey}
                    currentDirection={sortDirection}
                    onSort={requestSort}
                    style={{ width: "85px" }}
                  >
                    ID
                  </SortableTh>
                  <SortableTh
                    sortKey="nome"
                    currentSortKey={sortKey}
                    currentDirection={sortDirection}
                    onSort={requestSort}
                  >
                    Nome do Registro
                  </SortableTh>
                  <SortableTh
                    sortKey="fornecedorNome"
                    currentSortKey={sortKey}
                    currentDirection={sortDirection}
                    onSort={requestSort}
                  >
                    Origem / Fornecedor
                  </SortableTh>
                  <SortableTh
                    sortKey="saldo"
                    currentSortKey={sortKey}
                    currentDirection={sortDirection}
                    onSort={requestSort}
                    style={{ width: "160px" }}
                  >
                    Saldo em Estoque
                  </SortableTh>
                  <SortableTh
                    sortKey="ativo"
                    currentSortKey={sortKey}
                    currentDirection={sortDirection}
                    onSort={requestSort}
                    style={{ width: "105px" }}
                    align="center"
                  >
                    Status
                  </SortableTh>
                  <SortableTh
                    sortKey="descricao"
                    currentSortKey={sortKey}
                    currentDirection={sortDirection}
                    onSort={requestSort}
                  >
                    Descrição / Detalhes
                  </SortableTh>
                  <th style={{ width: "180px", textAlign: "center" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.map((row) => {
                  const isKit = row.tipo === "KIT";
                  const isAtivo = row.ativo !== false;
                  return (
                    <tr key={`${row.tipo}-${row.id}`} style={{ opacity: isAtivo ? 1 : 0.65 }}>
                      <td>
                        {isKit ? (
                          <span className="badge badge-purple" title="Kit pré-montado">
                            #K{row.id}
                          </span>
                        ) : (
                          <span className="badge badge-blue" title="Peça individual">
                            #{row.id}
                          </span>
                        )}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {isKit ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span
                              className="badge badge-purple"
                              style={{ fontSize: "10px", padding: "1px 6px", fontWeight: 700 }}
                            >
                              KIT
                            </span>
                            <span style={{ color: "var(--text-primary)" }}>{row.nome}</span>
                          </div>
                        ) : (
                          <span>
                            {row.nome}
                            {!isAtivo && (
                              <span style={{ marginLeft: "8px", fontSize: "11px", color: "var(--text-muted)" }}>
                                (Inoperante)
                              </span>
                            )}
                          </span>
                        )}
                      </td>
                      <td>
                        {isKit ? (
                          <span
                            className="badge badge-purple"
                            style={{ display: "inline-flex", gap: "6px" }}
                          >
                            <Layers size={12} />
                            {row.fornecedorNome}
                          </span>
                        ) : (
                          <span
                            className="badge badge-gray"
                            style={{ display: "inline-flex", gap: "6px" }}
                          >
                            <Truck size={12} />
                            {row.fornecedorNome}
                          </span>
                        )}
                      </td>
                      <td>{renderBadgeEstoque(row.saldo)}</td>
                      <td style={{ textAlign: "center" }}>
                        <span className={`badge ${isAtivo ? (isKit ? "badge-purple" : "badge-green") : "badge-gray"}`}>
                          {isAtivo ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td style={{ color: "var(--text-secondary)", maxWidth: "300px" }}>
                        {row.descricao || (
                          <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
                            Sem descrição
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="table-actions" style={{ justifyContent: "center" }}>
                          {isKit ? (
                            <>
                              <Link
                                to="/items/kits"
                                className="btn btn-icon btn-sm btn-ghost-primary"
                                title="Montar / Gerenciar kit no módulo de Kits"
                              >
                                <Hammer size={15} />
                              </Link>
                              <Link
                                to="/items/kits"
                                className="btn btn-icon btn-sm btn-ghost-primary"
                                title="Ver composição e detalhes deste kit"
                              >
                                <Layers size={15} />
                              </Link>
                            </>
                          ) : (
                            row.item && (
                              <>
                                <button
                                  className={`btn btn-icon btn-sm ${isAtivo ? "btn-ghost-warning" : "btn-ghost-success"}`}
                                  onClick={() => handleToggleItemStatus(row.item!)}
                                  title={isAtivo ? "Inativar peça no ERP" : "Reativar peça"}
                                >
                                  <Power size={15} />
                                </button>
                                <button
                                  className="btn btn-icon btn-sm btn-ghost-primary"
                                  onClick={() => handleOpenEstoqueModal(row.item!)}
                                  title="Movimentar estoque (Entrada / Saída)"
                                >
                                  <ArrowUpDown size={15} />
                                </button>
                                <button
                                  className="btn btn-icon btn-sm btn-ghost-primary"
                                  onClick={() => handleOpenAuditModal(row.id)}
                                  title="Ver histórico de auditoria deste item"
                                >
                                  <History size={15} />
                                </button>
                                <button
                                  className="btn btn-icon btn-sm btn-ghost-primary"
                                  onClick={() => handleOpenEditModal(row.item!)}
                                  title="Editar item"
                                >
                                  <Edit2 size={15} />
                                </button>
                                <button
                                  className="btn btn-icon btn-sm btn-ghost-danger"
                                  onClick={() => handleOpenDeleteModal(row.item!)}
                                  title="Excluir item"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Paginação do Dashboard */}
          <Pagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={filteredRows.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </>
      )}

      {/* Modal de Formulário (Criar / Editar Item) */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => !submitting && setIsFormModalOpen(false)}
        title={editingItem ? "Editar Item de Estoque" : "Cadastrar Novo Item"}
      >
        <form onSubmit={handleSubmitForm}>
          <div className="form-group">
            <label className="form-label" htmlFor="item-nome">
              Nome do Item *
            </label>
            <input
              id="item-nome"
              type="text"
              className="form-input"
              placeholder="Ex: Sensor Fotoelétrico, Parafuso M4, Conector RJ45..."
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              autoFocus
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="item-fornecedor">
              Fornecedor do Item *
            </label>
            <select
              id="item-fornecedor"
              className="form-select"
              value={fornecedorId}
              onChange={(e) => setFornecedorId(Number(e.target.value))}
              required
              disabled={submitting}
            >
              <option value="" disabled>
                Selecione um fornecedor
              </option>
              {fornecedores
                .filter((f) => f.ativo !== false || f.id === fornecedorId)
                .map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nome} {f.ativo === false ? "(Inativo)" : ""}
                  </option>
                ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="item-descricao">
              Descrição / Especificações Técnicas
            </label>
            <textarea
              id="item-descricao"
              className="form-input"
              style={{ minHeight: "80px", resize: "vertical" }}
              placeholder="Detalhes adicionais, part number, dimensões, voltagem..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsFormModalOpen(false)}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Salvando..." : editingItem ? "Salvar Alterações" : "Cadastrar Item"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Movimentação de Estoque (Entrada / Saída) */}
      <Modal
        isOpen={isEstoqueModalOpen}
        onClose={() => !submittingEstoque && setIsEstoqueModalOpen(false)}
        title={`Movimentar Estoque: ${stockItem?.nome}`}
      >
        <form onSubmit={handleSubmitEstoque}>
          {/* Seletor do Tipo de Operação */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
            <button
              type="button"
              className={`btn ${tipoMovimento === "Entrada" ? "btn-primary" : "btn-secondary"}`}
              style={{
                flex: 1,
                backgroundColor: tipoMovimento === "Entrada" ? "#10b981" : undefined,
                borderColor: tipoMovimento === "Entrada" ? "#10b981" : undefined,
                color: tipoMovimento === "Entrada" ? "#ffffff" : undefined,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
              onClick={() => setTipoMovimento("Entrada")}
            >
              <TrendingUp size={16} />
              Entrada de Peças
            </button>

            <button
              type="button"
              className={`btn ${tipoMovimento === "Saida" ? "btn-danger" : "btn-secondary"}`}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
              onClick={() => setTipoMovimento("Saida")}
            >
              <TrendingDown size={16} />
              Saída de Peças
            </button>
          </div>

          {/* Quantidade a Movimentar */}
          <div className="form-group">
            <label className="form-label" htmlFor="stock-qtd">
              Quantidade de Unidades *
            </label>
            <input
              id="stock-qtd"
              type="number"
              min="1"
              max="1000000"
              className="form-input"
              placeholder="Ex: 5"
              value={quantidadeMovimento}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                setQuantidadeMovimento(Math.min(1000000, Math.max(1, val)));
              }}
              required
              autoFocus
              disabled={submittingEstoque}
            />
          </div>

          {/* Prévia do Saldo Resultante */}
          <div
            style={{
              padding: "12px 16px",
              borderRadius: "8px",
              backgroundColor: saldoInsuficiente ? "var(--danger-light)" : "var(--accent-light)",
              border: `1px solid ${saldoInsuficiente ? "var(--danger)" : "rgba(59, 130, 246, 0.3)"}`,
              marginBottom: "18px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "13px",
            }}
          >
            <span>
              {saldoInsuficiente ? "Saldo Insuficiente!" : "Novo Saldo Estimado:"}
            </span>
            <strong
              style={{
                fontSize: "15px",
                color: saldoInsuficiente ? "var(--danger)" : "var(--accent)",
              }}
            >
              {saldoAtualStockItem} {tipoMovimento === "Entrada" ? "+" : "-"} {quantidadeMovimento} ={" "}
              {novoSaldoPreview} un
            </strong>
          </div>

          {/* Nota Fiscal (Opcional - Exclusivo para Entradas de Mercadoria) */}
          {false && tipoMovimento === "Entrada" && (
            <div className="form-group">
              <label
                className="form-label"
                htmlFor="stock-nf"
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <FileText size={14} color="var(--accent, #3b82f6)" />
                <span>Nota Fiscal (NF-e) / Documento</span>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "normal" }}>
                  (Opcional)
                </span>
              </label>
              <input
                id="stock-nf"
                type="text"
                className="form-input"
                placeholder="Ex: NF 10452, Pedido #8821, Remessa 42..."
                value={notaFiscalMovimento}
                onChange={(e) => setNotaFiscalMovimento(e.target.value)}
                disabled={submittingEstoque}
                maxLength={100}
              />
            </div>
          )}

          {/* Motivo / Justificativa Auditável */}
          <div className="form-group">
            <label className="form-label" htmlFor="stock-motivo">
              Motivo / Justificativa da Movimentação (Auditável)
            </label>
            <input
              id="stock-motivo"
              type="text"
              className="form-input"
              placeholder="Ex: Recebimento fornecedor, Peça extra para teste, Ajuste..."
              value={motivoMovimento}
              onChange={(e) => setMotivoMovimento(e.target.value)}
              disabled={submittingEstoque}
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsEstoqueModalOpen(false)}
              disabled={submittingEstoque}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`btn ${tipoMovimento === "Entrada" ? "btn-primary" : "btn-danger"}`}
              disabled={submittingEstoque || saldoInsuficiente}
              style={{
                backgroundColor:
                  tipoMovimento === "Entrada" && !saldoInsuficiente ? "#10b981" : undefined,
                borderColor:
                  tipoMovimento === "Entrada" && !saldoInsuficiente ? "#10b981" : undefined,
              }}
            >
              {submittingEstoque
                ? "Processando..."
                : tipoMovimento === "Entrada"
                ? `Confirmar Entrada (+${quantidadeMovimento})`
                : `Confirmar Saída (-${quantidadeMovimento})`}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Auditoria e Histórico de Movimentações */}
      <Modal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        maxWidth="1180px"
        title={
          auditTargetItem
            ? `Auditoria de Estoque: ${auditTargetItem.nome} (#${auditTargetItem.id})`
            : "Histórico de Auditoria de Estoque"
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Barra de Filtros Interna da Auditoria */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
            <div className="search-input-wrapper" style={{ flex: "1 1 260px", minWidth: "220px" }}>
              <Search size={15} />
              <input
                type="text"
                className="form-input"
                placeholder="Buscar por item, NF, fornecedor, operador ou motivo..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
              />
            </div>

            <select
              className="form-select"
              style={{ width: "160px" }}
              value={auditFilterTipo}
              onChange={(e) => setAuditFilterTipo(e.target.value)}
            >
              <option value="all">Todas as Operações</option>
              <option value="Entrada">Apenas Entradas</option>
              <option value="Saida">Apenas Saídas</option>
            </select>

            <span className="badge badge-gray" style={{ marginLeft: "auto" }}>
              Total: {filteredAudit.length}
            </span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleExportAuditCSV}
              disabled={filteredAudit.length === 0}
              title="Exportar histórico de movimentações para arquivo CSV"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <FileSpreadsheet size={15} color="#10b981" />
              Exportar Logs (CSV)
            </button>
          </div>

          {/* Tabela de Histórico de Auditoria */}
          {loadingAudit ? (
            <div className="loading-container" style={{ padding: "40px" }}>
              <div className="spinner" />
              <p>Carregando histórico auditável da ShelfApi...</p>
            </div>
          ) : sortedAudit.length === 0 ? (
            <div className="empty-state" style={{ padding: "30px 10px" }}>
              <div className="empty-state-icon">
                <FileText size={36} color="var(--text-muted)" />
              </div>
              <p className="empty-state-text">
                {auditSearch || auditFilterTipo !== "all"
                  ? "Nenhum registro corresponde aos filtros de busca."
                  : "Nenhuma alteração de saldo foi registrada para este escopo ainda."}
              </p>
            </div>
          ) : (
            <div className="table-container" style={{ maxHeight: "440px", overflowY: "auto", overflowX: "auto" }}>
              <table className="data-table" style={{ minWidth: "1080px" }}>
                <thead>
                  <tr>
                    <SortableTh
                      sortKey="dataMovimentacao"
                      currentSortKey={auditSortKey}
                      currentDirection={auditSortDir}
                      onSort={requestAuditSort}
                      style={{ width: "135px" }}
                    >
                      Data & Hora
                    </SortableTh>
                    {!auditItemId && (
                      <SortableTh
                        sortKey="nomeItem"
                        currentSortKey={auditSortKey}
                        currentDirection={auditSortDir}
                        onSort={requestAuditSort}
                        style={{ width: "160px" }}
                      >
                        Item
                      </SortableTh>
                    )}
                    <SortableTh
                      sortKey="fornecedorNome"
                      currentSortKey={auditSortKey}
                      currentDirection={auditSortDir}
                      onSort={requestAuditSort}
                      style={{ width: "130px" }}
                    >
                      Fornecedor
                    </SortableTh>
                    {false && (
                    <SortableTh
                      sortKey="notaFiscal"
                      currentSortKey={auditSortKey}
                      currentDirection={auditSortDir}
                      onSort={requestAuditSort}
                      style={{ width: "115px" }}
                    >
                      NF / Doc
                    </SortableTh>
                    )}
                    <SortableTh
                      sortKey="tipo"
                      currentSortKey={auditSortKey}
                      currentDirection={auditSortDir}
                      onSort={requestAuditSort}
                      style={{ width: "105px" }}
                    >
                      Tipo
                    </SortableTh>
                    <SortableTh
                      sortKey="quantidade"
                      currentSortKey={auditSortKey}
                      currentDirection={auditSortDir}
                      onSort={requestAuditSort}
                      style={{ width: "95px" }}
                    >
                      Quantidade
                    </SortableTh>
                    <SortableTh
                      sortKey="saldoPosterior"
                      currentSortKey={auditSortKey}
                      currentDirection={auditSortDir}
                      onSort={requestAuditSort}
                      style={{ width: "135px" }}
                    >
                      Evolução Saldo
                    </SortableTh>
                    <SortableTh
                      sortKey="usuarioNome"
                      currentSortKey={auditSortKey}
                      currentDirection={auditSortDir}
                      onSort={requestAuditSort}
                      style={{ width: "160px" }}
                    >
                      Responsável
                    </SortableTh>
                    <SortableTh
                      sortKey="motivo"
                      currentSortKey={auditSortKey}
                      currentDirection={auditSortDir}
                      onSort={requestAuditSort}
                    >
                      Motivo / Justificativa
                    </SortableTh>
                  </tr>
                </thead>
                <tbody>
                  {sortedAudit.map((log) => {
                    const isEntrada = log.tipo === "Entrada";
                    return (
                      <tr key={log.id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px" }}>
                            <Clock size={13} color="var(--text-muted)" />
                            <span>{formatarDataHora(log.dataMovimentacao)}</span>
                          </div>
                        </td>
                        {!auditItemId && (
                          <td>
                            <strong style={{ color: "var(--text-primary)" }}>{log.nomeItem}</strong>
                            <span style={{ color: "var(--text-muted)", fontSize: "11px", marginLeft: "6px" }}>
                              #{log.itemId}
                            </span>
                          </td>
                        )}
                        <td>
                          <span style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
                            {log.fornecedorNome ||
                              (itens.find((i) => i.id === log.itemId)?.fornecedorId
                                ? fornecedorMap.get(itens.find((i) => i.id === log.itemId)!.fornecedorId)
                                : null) ||
                              "—"}
                          </span>
                        </td>
                        {false && (
                        <td>
                          {log.notaFiscal ? (
                            <span
                              className="badge font-mono"
                              style={{
                                backgroundColor: "rgba(59, 130, 246, 0.12)",
                                color: "#3b82f6",
                                border: "1px solid rgba(59, 130, 246, 0.3)",
                                fontWeight: 700,
                                fontSize: "11.5px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                              title={`Nota Fiscal / Documento: ${log.notaFiscal}`}
                            >
                              <FileText size={11} />
                              {log.notaFiscal}
                            </span>
                          ) : (
                            <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>—</span>
                          )}
                        </td>
                        )}
                        <td>
                          {isEntrada ? (
                            <span className="badge badge-green" style={{ fontWeight: 600 }}>
                              <TrendingUp size={12} style={{ marginRight: "3px" }} />
                              Entrada
                            </span>
                          ) : (
                            <span
                              className="badge badge-gray"
                              style={{
                                color: "var(--danger)",
                                borderColor: "rgba(239, 68, 68, 0.3)",
                                fontWeight: 600,
                              }}
                            >
                              <TrendingDown size={12} style={{ marginRight: "3px" }} />
                              Saída
                            </span>
                          )}
                        </td>
                        <td style={{ fontWeight: 700, color: isEntrada ? "#10b981" : "var(--danger)" }}>
                          {isEntrada ? `+${log.quantidade}` : `-${log.quantidade}`} un
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span className="badge badge-gray">{log.saldoAnterior} un</span>
                            <ArrowRight size={12} color="var(--text-muted)" />
                            <span
                              className="badge"
                              style={{
                                backgroundColor: isEntrada
                                  ? "rgba(16, 185, 129, 0.15)"
                                  : "rgba(239, 68, 68, 0.15)",
                                color: isEntrada ? "#10b981" : "var(--danger)",
                                fontWeight: 700,
                              }}
                            >
                              {log.saldoPosterior} un
                            </span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                            <div
                              style={{
                                width: "22px",
                                height: "22px",
                                borderRadius: "50%",
                                backgroundColor: "rgba(255, 255, 255, 0.08)",
                                border: "1px solid rgba(255, 255, 255, 0.15)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              <User size={12} color="var(--accent, #3b82f6)" />
                            </div>
                            <span style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-primary)" }}>
                              {log.usuarioNome || "Sistema"}
                            </span>
                          </div>
                        </td>
                        <td style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
                          {log.motivo ? (
                            <span>{log.motivo}</span>
                          ) : (
                            <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
                              Não informado
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsAuditModalOpen(false)}
            >
              Fechar Histórico
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => !deleting && setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Excluir Item"
        message={`Deseja realmente remover o item "${deletingItem?.nome}"? Se esta peça possuir movimentações de estoque ou vínculos com kits, a exclusão será impedida para manter a integridade do ERP e orientamos utilizar a opção Inativar.`}
        confirmLabel="Sim, Excluir"
        isLoading={deleting}
      />

      {/* Modal de Importação Massiva via XML (NF-e / SEFAZ) */}
      <ImportarXmlModal
        isOpen={isImportXmlModalOpen}
        onClose={() => setIsImportXmlModalOpen(false)}
        fornecedores={fornecedores}
        itensExistentes={itens}
        onSuccess={carregarDados}
      />
    </div>
  );
}
