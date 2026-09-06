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
import { Pagination } from "../../components/Pagination";
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
  const [submittingEstoque, setSubmittingEstoque] = useState<boolean>(false);

  // Modal de Auditoria e Histórico de Movimentações
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [auditItemId, setAuditItemId] = useState<number | null>(null);
  const [auditHistorico, setAuditHistorico] = useState<MovimentacaoHistorico[]>([]);
  const [loadingAudit, setLoadingAudit] = useState<boolean>(false);
  const [auditSearch, setAuditSearch] = useState<string>("");
  const [auditFilterTipo, setAuditFilterTipo] = useState<string>("all");

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
    setFornecedorId(fornecedores.length > 0 ? fornecedores[0].id : "");
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

  // Abertura de Modal de Movimentação de Estoque
  const handleOpenEstoqueModal = (item: Item, tipoInicial: "Entrada" | "Saida" = "Entrada") => {
    setStockItem(item);
    setTipoMovimento(tipoInicial);
    setQuantidadeMovimento(1);
    setMotivoMovimento("");
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
        };
        await itemService.update(updateData);
        success(`Item "${nome.trim()}" atualizado com sucesso!`);
      } else {
        const createData: CreateItemDto = {
          nome: nome.trim(),
          fornecedorId: Number(fornecedorId),
          descricao: descricao.trim() || null,
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
      toastError(getErrorMessage(err), "Falha ao excluir item");
    } finally {
      setDeleting(false);
    }
  };

  // Submissão da Movimentação de Estoque
  const handleSubmitEstoque = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockItem) return;

    if (quantidadeMovimento <= 0) {
      toastError("Informe uma quantidade maior que zero.");
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
      item: i,
    }));

    const kitRows: EstoqueRow[] = kitSaldos.map((k) => ({
      tipo: "KIT",
      id: k.kitId,
      nome: k.nomeKit,
      fornecedorNome: "Montagem Interna / Fábrica",
      saldo: k.saldoFisico,
      descricao: `Kit composto por ${k.totalItensComposicao} peças (${k.capacidadeMontagem} montagens disponíveis)`,
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
        matchesStatus = qtd > 10;
      } else if (selectedStatusEstoque === "baixo") {
        matchesStatus = qtd > 0 && qtd <= 10;
      } else if (selectedStatusEstoque === "zerado") {
        matchesStatus = qtd <= 0;
      }

      return matchesSearch && matchesFornecedor && matchesStatus;
    });
  }, [allRows, searchTerm, selectedFornecedorFilter, selectedStatusEstoque]);

  // Registros paginados para renderização na tabela
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  // Filtragem dos logs de Auditoria
  const filteredAudit = useMemo(() => {
    return auditHistorico.filter((log) => {
      const query = auditSearch.toLowerCase();
      const matchesSearch =
        !query ||
        log.nomeItem.toLowerCase().includes(query) ||
        (log.motivo && log.motivo.toLowerCase().includes(query)) ||
        log.usuarioNome.toLowerCase().includes(query) ||
        log.itemId.toString().includes(query);

      const matchesTipo =
        auditFilterTipo === "all" ||
        log.tipo.toUpperCase() === auditFilterTipo.toUpperCase();

      return matchesSearch && matchesTipo;
    });
  }, [auditHistorico, auditSearch, auditFilterTipo]);

  const renderBadgeEstoque = (quantidade?: number) => {
    const qtd = quantidade ?? 0;
    if (qtd > 10) {
      return (
        <span className="badge badge-green" style={{ fontWeight: 600 }}>
          {qtd} un
        </span>
      );
    }
    if (qtd > 0) {
      return (
        <span className="badge badge-amber" style={{ fontWeight: 600 }} title="Estoque Baixo">
          {qtd} un (Baixo)
        </span>
      );
    }
    return (
      <span
        className="badge badge-gray"
        style={{ color: "var(--danger)", borderColor: "rgba(239, 68, 68, 0.3)", fontWeight: 600 }}
        title="Sem saldo em estoque"
      >
        0 un (Esgotado)
      </span>
    );
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
                {f.nome}
              </option>
            ))}
          </select>
        </div>

        <select
          className="form-select"
          style={{ width: "170px" }}
          value={selectedStatusEstoque}
          onChange={(e) => setSelectedStatusEstoque(e.target.value)}
        >
          <option value="all">Todos os Níveis</option>
          <option value="normal">Estoque Normal (&gt; 10)</option>
          <option value="baixo">Estoque Baixo (1 a 10)</option>
          <option value="zerado">Zerados (0 un)</option>
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
                  <th style={{ width: "80px" }}>ID</th>
                  <th>Nome do Registro</th>
                  <th>Origem / Fornecedor</th>
                  <th style={{ width: "170px" }}>Saldo em Estoque</th>
                  <th>Descrição / Detalhes</th>
                  <th style={{ width: "160px", textAlign: "right" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.map((row) => {
                  const isKit = row.tipo === "KIT";
                  return (
                    <tr key={`${row.tipo}-${row.id}`}>
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
                          row.nome
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
                      <td style={{ color: "var(--text-secondary)", maxWidth: "300px" }}>
                        {row.descricao || (
                          <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
                            Sem descrição
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="table-actions">
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

          <Pagination
            currentPage={currentPage}
            totalItems={filteredRows.length}
            pageSize={pageSize}
            pageSizeOptions={[10, 20, 50]}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            itemLabel={filteredRows.length === 1 ? "registro" : "registros"}
          />
        </>
      )}

      {/* Modal de Movimentação de Estoque (Adicionar / Diminuir) */}
      <Modal
        isOpen={isEstoqueModalOpen}
        onClose={() => !submittingEstoque && setIsEstoqueModalOpen(false)}
        title="Movimentação de Estoque"
      >
        <form onSubmit={handleSubmitEstoque}>
          {stockItem && (
            <div
              style={{
                backgroundColor: "var(--bg-app)",
                border: "1px solid var(--border-color)",
                borderRadius: "10px",
                padding: "14px 16px",
                marginBottom: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                  {stockItem.nome}
                </span>
                <span className="badge badge-blue">#{stockItem.id}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", color: "var(--text-secondary)" }}>
                <span>Fornecedor: {fornecedorMap.get(stockItem.fornecedorId) || "—"}</span>
                <span>
                  Saldo Atual: <strong style={{ color: "var(--text-primary)" }}>{saldoAtualStockItem} un</strong>
                </span>
              </div>
            </div>
          )}

          {/* Seleção do Tipo de Movimentação */}
          <div className="form-group">
            <label className="form-label">Tipo de Movimentação</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <button
                type="button"
                className={`btn ${
                  tipoMovimento === "Entrada" ? "btn-primary" : "btn-secondary"
                }`}
                style={{
                  padding: "10px",
                  borderColor: tipoMovimento === "Entrada" ? "#10b981" : undefined,
                  backgroundColor: tipoMovimento === "Entrada" ? "#10b981" : undefined,
                }}
                onClick={() => setTipoMovimento("Entrada")}
              >
                <TrendingUp size={16} />
                Entrada (+ Adicionar)
              </button>

              <button
                type="button"
                className={`btn ${
                  tipoMovimento === "Saida" ? "btn-danger" : "btn-secondary"
                }`}
                style={{ padding: "10px" }}
                onClick={() => setTipoMovimento("Saida")}
              >
                <TrendingDown size={16} />
                Saída (- Diminuir)
              </button>
            </div>
          </div>

          {/* Quantidade a Movimentar */}
          <div className="form-group">
            <label className="form-label" htmlFor="stock-qty">
              Quantidade a {tipoMovimento === "Entrada" ? "Adicionar" : "Subtrair"} *
            </label>
            <input
              id="stock-qty"
              type="number"
              min="1"
              className="form-input"
              value={quantidadeMovimento}
              onChange={(e) => setQuantidadeMovimento(Math.max(1, parseInt(e.target.value, 10) || 1))}
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

          {/* Motivo / Justificativa Auditável */}
          <div className="form-group">
            <label className="form-label" htmlFor="stock-motivo">
              Motivo / Justificativa da Movimentação (Auditável)
            </label>
            <input
              id="stock-motivo"
              type="text"
              className="form-input"
              placeholder="Ex: Recebimento NF-e #1234, Montagem máquina Ambev, Avaria..."
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
        title={
          auditTargetItem
            ? `Auditoria de Estoque: ${auditTargetItem.nome} (#${auditTargetItem.id})`
            : "Histórico de Auditoria de Estoque"
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Barra de Filtros Interna da Auditoria */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
            <div className="search-input-wrapper" style={{ flex: "1 1 240px", minWidth: "220px" }}>
              <Search size={15} />
              <input
                type="text"
                className="form-input"
                placeholder="Filtrar por item, motivo ou operador..."
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
              <option value="all">Todas Operações</option>
              <option value="Entrada">Apenas Entradas (+)</option>
              <option value="Saida">Apenas Saídas (-)</option>
            </select>

            {auditItemId && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleOpenAuditModal()}
                title="Remover filtro de item específico e ver todas as movimentações"
              >
                Ver Todas Movimentações
              </button>
            )}

            <button
              className="btn btn-secondary btn-icon"
              onClick={() => handleOpenAuditModal(auditItemId ?? undefined)}
              title="Recarregar histórico"
              disabled={loadingAudit}
            >
              <RefreshCw size={15} className={loadingAudit ? "spinner" : ""} />
            </button>
          </div>

          {/* Conteúdo do Histórico */}
          {loadingAudit ? (
            <div className="loading-container" style={{ padding: "40px 0" }}>
              <div className="spinner" />
              <p>Carregando registros de auditoria...</p>
            </div>
          ) : filteredAudit.length === 0 ? (
            <div className="empty-state" style={{ padding: "36px 16px" }}>
              <div className="empty-state-icon" style={{ width: "48px", height: "48px" }}>
                <History size={26} />
              </div>
              <h3 className="empty-state-title" style={{ fontSize: "15px" }}>
                Nenhuma movimentação encontrada
              </h3>
              <p className="empty-state-text" style={{ fontSize: "13px", marginBottom: "0" }}>
                {auditSearch || auditFilterTipo !== "all"
                  ? "Nenhum registro corresponde aos filtros de busca."
                  : "Nenhuma alteração de saldo foi registrada para este escopo ainda."}
              </p>
            </div>
          ) : (
            <div className="table-container" style={{ maxHeight: "420px", overflowY: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: "130px" }}>Data & Hora</th>
                    {!auditItemId && <th>Item</th>}
                    <th style={{ width: "110px" }}>Tipo</th>
                    <th style={{ width: "100px" }}>Quantidade</th>
                    <th style={{ width: "140px" }}>Evolução Saldo</th>
                    <th style={{ width: "140px" }}>Responsável</th>
                    <th>Motivo / Justificativa</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAudit.map((log) => {
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
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px" }}>
                            <span style={{ color: "var(--text-muted)" }}>{log.saldoAnterior}</span>
                            <ArrowRight size={12} color="var(--text-muted)" />
                            <strong style={{ color: "var(--text-primary)" }}>{log.saldoPosterior} un</strong>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12.5px" }}>
                            <User size={13} color="var(--accent)" />
                            <span style={{ fontWeight: 500 }}>{log.usuarioNome}</span>
                          </div>
                        </td>
                        <td style={{ color: "var(--text-secondary)" }}>
                          {log.motivo ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                              <FileText size={13} color="var(--text-muted)" />
                              <span>{log.motivo}</span>
                            </div>
                          ) : (
                            <span style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: "12px" }}>
                              Sem motivo informado
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

          <div className="modal-actions" style={{ marginTop: "12px" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsAuditModalOpen(false)}
            >
              Fechar
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de Formulário (Criar / Editar Item) */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => !submitting && setIsFormModalOpen(false)}
        title={editingItem ? "Editar Item de Estoque" : "Cadastrar Novo Item no Estoque"}
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
              placeholder="Ex: Sensor de Presença, Cabo HDMI, Placa Controladora..."
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              autoFocus
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="item-fornecedor">
              Fornecedor Associado *
            </label>
            {fornecedores.length === 0 ? (
              <div>
                <input
                  id="item-fornecedor"
                  type="number"
                  className="form-input"
                  placeholder="ID do Fornecedor"
                  value={fornecedorId}
                  onChange={(e) => setFornecedorId(e.target.value ? Number(e.target.value) : "")}
                  required
                  disabled={submitting}
                />
                <span className="form-error">
                  Nenhum fornecedor cadastrado. Crie um fornecedor no menu Fornecedores ou digite o ID manualmente.
                </span>
              </div>
            ) : (
              <select
                id="item-fornecedor"
                className="form-select"
                value={fornecedorId}
                onChange={(e) => setFornecedorId(Number(e.target.value))}
                required
                disabled={submitting}
              >
                <option value="" disabled>Selecione um fornecedor...</option>
                {fornecedores.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nome} (ID #{f.id})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="item-descricao">
              Descrição / Observações (Opcional)
            </label>
            <textarea
              id="item-descricao"
              className="form-textarea"
              rows={3}
              placeholder="Especificações técnicas, dimensões, número de série ou detalhes adicionais..."
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

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => !deleting && setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Excluir Item de Estoque"
        message={`Deseja realmente remover o item "${deletingItem?.nome}" (ID #${deletingItem?.id}) do estoque?`}
        confirmLabel="Sim, Excluir"
        isLoading={deleting}
      />
    </div>
  );
}
