import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Plus, Search, RefreshCw, Edit2, Trash2, Truck, AlertCircle, Power, CheckCircle, Ban } from "lucide-react";
import { fornecedorService } from "../../services/fornecedorService";
import type { Fornecedor, CreateFornecedorDto, UpdateFornecedorDto } from "../../types/fornecedor";
import { Modal } from "../../components/Modal";
import { ConfirmModal } from "../../components/ConfirmModal";
import { SortableTh } from "../../components/SortableTh";
import { useTableSort } from "../../hooks/useTableSort";
import { useToast } from "../../hooks/useToast";
import { getErrorMessage } from "../../api/http";

export default function Fornecedores() {
  const { success, error: toastError } = useToast();

  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"todos" | "ativos" | "inativos">("todos");

  // Modal de Criação / Edição
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingFornecedor, setEditingFornecedor] = useState<Fornecedor | null>(null);
  const [nomeInput, setNomeInput] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Modal de Exclusão
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deletingFornecedor, setDeletingFornecedor] = useState<Fornecedor | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const carregarFornecedores = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await fornecedorService.getAll();
      setFornecedores(data || []);
    } catch (err) {
      const msg = getErrorMessage(err);
      setErrorMsg(msg);
      toastError(msg, "Erro ao carregar fornecedores");
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    carregarFornecedores();
  }, [carregarFornecedores]);

  const handleOpenCreateModal = () => {
    setEditingFornecedor(null);
    setNomeInput("");
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (item: Fornecedor) => {
    setEditingFornecedor(item);
    setNomeInput(item.nome);
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (item: Fornecedor) => {
    setDeletingFornecedor(item);
    setIsDeleteModalOpen(true);
  };

  const handleToggleStatus = async (fornecedor: Fornecedor) => {
    try {
      await fornecedorService.toggleStatus(fornecedor.id);
      const novoStatus = fornecedor.ativo === false ? "reativado" : "inativado";
      success(`Fornecedor "${fornecedor.nome}" ${novoStatus} com sucesso!`);
      await carregarFornecedores();
    } catch (err) {
      toastError(getErrorMessage(err), "Falha ao alterar status");
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeInput.trim()) {
      toastError("O nome do fornecedor é obrigatório.");
      return;
    }

    try {
      setSubmitting(true);
      if (editingFornecedor) {
        const updateData: UpdateFornecedorDto = {
          id: editingFornecedor.id,
          nome: nomeInput.trim(),
          ativo: editingFornecedor.ativo ?? true,
        };
        await fornecedorService.update(editingFornecedor.id, updateData);
        success("Fornecedor atualizado com sucesso!");
      } else {
        const createData: CreateFornecedorDto = {
          nome: nomeInput.trim(),
          ativo: true,
        };
        await fornecedorService.create(createData);
        success("Fornecedor cadastrado com sucesso!");
      }
      setIsFormModalOpen(false);
      await carregarFornecedores();
    } catch (err) {
      toastError(getErrorMessage(err), "Falha ao salvar");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingFornecedor) return;

    try {
      setDeleting(true);
      await fornecedorService.delete(deletingFornecedor.id);
      success(`Fornecedor "${deletingFornecedor.nome}" excluído com sucesso!`);
      setIsDeleteModalOpen(false);
      setDeletingFornecedor(null);
      await carregarFornecedores();
    } catch (err) {
      toastError(getErrorMessage(err), "Aviso do ERP");
    } finally {
      setDeleting(false);
    }
  };

  const filteredFornecedores = useMemo(() => {
    return fornecedores.filter((f) => {
      const matchesSearch =
        !searchTerm.trim() ||
        f.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.id.toString().includes(searchTerm.trim());

      const isAtivo = f.ativo !== false;
      const matchesStatus =
        statusFilter === "todos" ||
        (statusFilter === "ativos" && isAtivo) ||
        (statusFilter === "inativos" && !isAtivo);

      return matchesSearch && matchesStatus;
    });
  }, [fornecedores, searchTerm, statusFilter]);

  const {
    items: sortedFornecedores,
    sortKey,
    sortDirection,
    requestSort,
  } = useTableSort(filteredFornecedores, "id", "asc");

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-info">
          <h1>
            <Truck size={24} color="var(--accent)" />
            Fornecedores
          </h1>
          <p>Gerencie todos os parceiros e fornecedores de peças e insumos da ShelfApi</p>
        </div>

        <div className="page-header-actions">
          <button
            className="btn btn-secondary btn-icon"
            onClick={carregarFornecedores}
            title="Atualizar lista"
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? "spinner" : ""} />
          </button>
          <button className="btn btn-primary" onClick={handleOpenCreateModal}>
            <Plus size={18} />
            Novo Fornecedor
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
            placeholder="Pesquisar por nome ou ID..."
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
            Todos ({fornecedores.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${statusFilter === "ativos" ? "btn-primary" : "btn-secondary"}`}
            style={{ borderRadius: 0, padding: "6px 12px" }}
            onClick={() => setStatusFilter("ativos")}
          >
            <CheckCircle size={13} style={{ marginRight: "4px" }} />
            Ativos ({fornecedores.filter((f) => f.ativo !== false).length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${statusFilter === "inativos" ? "btn-primary" : "btn-secondary"}`}
            style={{ borderRadius: 0, padding: "6px 12px" }}
            onClick={() => setStatusFilter("inativos")}
          >
            <Ban size={13} style={{ marginRight: "4px" }} />
            Inativos ({fornecedores.filter((f) => f.ativo === false).length})
          </button>
        </div>

        <span className="badge badge-gray" style={{ marginLeft: "auto" }}>
          Exibindo: {sortedFornecedores.length}
        </span>
      </div>

      {/* Conteúdo */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
          <p>Carregando fornecedores da ShelfApi...</p>
        </div>
      ) : errorMsg ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <AlertCircle size={48} color="var(--danger)" />
          </div>
          <h3 className="empty-state-title">Erro de Conexão</h3>
          <p className="empty-state-text">{errorMsg}</p>
          <button className="btn btn-primary" onClick={carregarFornecedores}>
            <RefreshCw size={16} /> Tentar Novamente
          </button>
        </div>
      ) : sortedFornecedores.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Truck size={48} />
          </div>
          <h3 className="empty-state-title">Nenhum fornecedor encontrado</h3>
          <p className="empty-state-text">
            {searchTerm || statusFilter !== "todos"
              ? "Nenhum fornecedor corresponde aos filtros selecionados."
              : "Nenhum fornecedor cadastrado na API ainda."}
          </p>
          {!searchTerm && statusFilter === "todos" && (
            <button className="btn btn-primary" onClick={handleOpenCreateModal}>
              <Plus size={16} /> Cadastrar Primeiro Fornecedor
            </button>
          )}
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <SortableTh
                  sortKey="id"
                  currentSortKey={sortKey}
                  currentDirection={sortDirection}
                  onSort={requestSort}
                  style={{ width: "90px" }}
                >
                  ID
                </SortableTh>
                <SortableTh
                  sortKey="nome"
                  currentSortKey={sortKey}
                  currentDirection={sortDirection}
                  onSort={requestSort}
                >
                  Nome do Fornecedor
                </SortableTh>
                <SortableTh
                  sortKey="ativo"
                  currentSortKey={sortKey}
                  currentDirection={sortDirection}
                  onSort={requestSort}
                  style={{ width: "120px" }}
                  align="center"
                >
                  Status
                </SortableTh>
                <th style={{ width: "150px", textAlign: "right" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {sortedFornecedores.map((fornecedor) => {
                const isAtivo = fornecedor.ativo !== false;
                return (
                  <tr key={fornecedor.id} style={{ opacity: isAtivo ? 1 : 0.65 }}>
                    <td>
                      <span className="badge badge-blue">#{fornecedor.id}</span>
                    </td>
                    <td style={{ fontWeight: 500 }}>
                      {fornecedor.nome}
                      {!isAtivo && (
                        <span style={{ marginLeft: "8px", fontSize: "11px", color: "var(--text-muted)" }}>
                          (Inoperante)
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span className={`badge ${isAtivo ? "badge-green" : "badge-gray"}`}>
                        {isAtivo ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions" style={{ justifyContent: "flex-end" }}>
                        <button
                          className={`btn btn-icon btn-sm ${isAtivo ? "btn-ghost-warning" : "btn-ghost-success"}`}
                          onClick={() => handleToggleStatus(fornecedor)}
                          title={isAtivo ? "Inativar fornecedor no ERP" : "Reativar fornecedor"}
                        >
                          <Power size={15} />
                        </button>
                        <button
                          className="btn btn-icon btn-sm btn-ghost-primary"
                          onClick={() => handleOpenEditModal(fornecedor)}
                          title="Editar fornecedor"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="btn btn-icon btn-sm btn-ghost-danger"
                          onClick={() => handleOpenDeleteModal(fornecedor)}
                          title="Excluir fornecedor"
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
      )}

      {/* Modal de Formulário (Criar / Editar) */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => !submitting && setIsFormModalOpen(false)}
        title={editingFornecedor ? "Editar Fornecedor" : "Cadastrar Novo Fornecedor"}
      >
        <form onSubmit={handleSubmitForm}>
          <div className="form-group">
            <label className="form-label" htmlFor="fornecedor-nome">
              Nome do Fornecedor *
            </label>
            <input
              id="fornecedor-nome"
              type="text"
              className="form-input"
              placeholder="Ex: Dell Computadores, Bosch, Intelbras, Siemens..."
              value={nomeInput}
              onChange={(e) => setNomeInput(e.target.value)}
              autoFocus
              required
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
              {submitting ? "Salvando..." : editingFornecedor ? "Salvar Alterações" : "Cadastrar"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => !deleting && setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Excluir Fornecedor"
        message={`Deseja realmente remover o fornecedor "${deletingFornecedor?.nome}"? Se este fornecedor possuir peças ou histórico vinculados, a exclusão será bloqueada e orientamos utilizar a opção Inativar.`}
        confirmLabel="Sim, Excluir"
        isLoading={deleting}
      />
    </div>
  );
}
