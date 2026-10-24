import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Users as UsersIcon, Plus, Search, RefreshCw, Trash2, Shield, AlertCircle, Key } from "lucide-react";
import { authService } from "../services/authService";
import type { User, RegisterCredentials } from "../types/auth";
import { Modal } from "../components/Modal";
import { ConfirmModal } from "../components/ConfirmModal";
import { SortableTh } from "../components/SortableTh";
import { useTableSort } from "../hooks/useTableSort";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../hooks/useAuth";
import { getErrorMessage } from "../api/http";

export default function Users() {
  const { success, error: toastError } = useToast();
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Modal de Criação de Usuário
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [nome, setNome] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [senha, setSenha] = useState<string>("");
  const [role, setRole] = useState<string>("Operador");
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Modal de Exclusão
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const carregarUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await authService.getAllUsers();
      setUsers(data || []);
    } catch (err) {
      const msg = getErrorMessage(err);
      setErrorMsg(msg);
      toastError(msg, "Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    if (currentUser?.role?.toLowerCase() === "admin") {
      carregarUsuarios();
    }
  }, [carregarUsuarios, currentUser]);

  const handleOpenCreate = () => {
    setNome("");
    setEmail("");
    setSenha("");
    setRole("Operador");
    setIsCreateModalOpen(true);
  };

  const handleOpenDelete = (user: User) => {
    if (user.id === currentUser?.id) {
      toastError("Você não pode excluir o seu próprio usuário logado.");
      return;
    }
    setDeletingUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !email.trim() || !senha.trim()) {
      toastError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setSubmitting(true);
      const payload: RegisterCredentials = {
        nome: nome.trim(),
        email: email.trim(),
        senha,
        role,
      };
      await authService.register(payload);
      success(`Usuário "${nome.trim()}" cadastrado com sucesso!`);
      setIsCreateModalOpen(false);
      await carregarUsuarios();
    } catch (err) {
      toastError(getErrorMessage(err), "Falha ao criar usuário");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;

    try {
      setDeleting(true);
      await authService.deleteUser(deletingUser.id);
      success(`Usuário "${deletingUser.nome}" removido com sucesso!`);
      setIsDeleteModalOpen(false);
      setDeletingUser(null);
      await carregarUsuarios();
    } catch (err) {
      toastError(getErrorMessage(err), "Falha ao excluir usuário");
    } finally {
      setDeleting(false);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    const term = searchTerm.toLowerCase();
    return users.filter(
      (u) =>
        u.nome.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.role.toLowerCase().includes(term) ||
        u.id.toString().includes(term)
    );
  }, [users, searchTerm]);

  const {
    items: sortedUsers,
    sortKey,
    sortDirection,
    requestSort,
  } = useTableSort(filteredUsers, "id", "asc");

  if (currentUser && currentUser.role?.toLowerCase() !== "admin") {
    return (
      <div className="page-container">
        <div className="empty-state" style={{ margin: "40px auto", maxWidth: "500px" }}>
          <div className="empty-state-icon" style={{ backgroundColor: "var(--danger-light)" }}>
            <AlertCircle size={40} color="var(--danger)" />
          </div>
          <h3 className="empty-state-title">Acesso Restrito</h3>
          <p className="empty-state-text">
            Seu perfil de acesso ({currentUser.role}) não possui permissão para visualizar ou gerenciar os usuários do sistema.
          </p>
          <a href="/" className="btn btn-primary">
            Voltar ao Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-info">
          <h1>
            <UsersIcon size={24} color="var(--accent)" />
            Usuários & Permissões do ERP
          </h1>
          <p>Gerencie operadores, supervisores e administradores cadastrados na ShelfApi</p>
        </div>

        <div className="page-header-actions">
          <button
            className="btn btn-secondary btn-icon"
            onClick={carregarUsuarios}
            title="Atualizar lista"
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? "spinner" : ""} />
          </button>
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <Plus size={18} />
            Novo Usuário
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} />
          <input
            type="text"
            className="form-input"
            placeholder="Pesquisar por nome, e-mail ou perfil..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <span className="badge badge-gray">
          Total: {filteredUsers.length} {filteredUsers.length === 1 ? "usuário" : "usuários"}
        </span>
      </div>

      {/* Conteúdo */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
          <p>Carregando usuários da ShelfApi...</p>
        </div>
      ) : errorMsg ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <AlertCircle size={48} color="var(--danger)" />
          </div>
          <h3 className="empty-state-title">Erro de Conexão</h3>
          <p className="empty-state-text">{errorMsg}</p>
          <button className="btn btn-primary" onClick={carregarUsuarios}>
            <RefreshCw size={16} /> Tentar Novamente
          </button>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <UsersIcon size={48} />
          </div>
          <h3 className="empty-state-title">Nenhum usuário encontrado</h3>
          <p className="empty-state-text">
            {searchTerm
              ? "Nenhum usuário corresponde aos filtros informados."
              : "Cadastre novos usuários para conceder acesso ao sistema."}
          </p>
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <Plus size={16} /> Cadastrar Primeiro Usuário
          </button>
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
                  Nome
                </SortableTh>
                <SortableTh
                  sortKey="email"
                  currentSortKey={sortKey}
                  currentDirection={sortDirection}
                  onSort={requestSort}
                >
                  E-mail
                </SortableTh>
                <SortableTh
                  sortKey="role"
                  currentSortKey={sortKey}
                  currentDirection={sortDirection}
                  onSort={requestSort}
                >
                  Perfil de Acesso
                </SortableTh>
                <SortableTh
                  sortKey="ativo"
                  currentSortKey={sortKey}
                  currentDirection={sortDirection}
                  onSort={requestSort}
                  style={{ width: "110px" }}
                >
                  Status
                </SortableTh>
                <th style={{ width: "110px", textAlign: "right" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map((u) => {
                const isCurrent = u.id === currentUser?.id;
                return (
                  <tr key={u.id}>
                    <td>
                      <span className="badge badge-blue">#{u.id}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {u.nome} {isCurrent && <span style={{ fontSize: "11px", color: "var(--accent)" }}>(Você)</span>}
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>{u.email}</td>
                    <td>
                      {u.role === "Admin" ? (
                        <span className="badge badge-purple">
                          <Shield size={12} /> {u.role}
                        </span>
                      ) : (
                        <span className="badge badge-gray">{u.role}</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${u.ativo ? "badge-green" : "badge-amber"}`}>
                        {u.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        {!isCurrent && (
                          <button
                            className="btn btn-icon btn-sm btn-ghost-danger"
                            onClick={() => handleOpenDelete(u)}
                            title="Remover usuário"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Criação de Usuário */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => !submitting && setIsCreateModalOpen(false)}
        title="Cadastrar Novo Usuário no ERP"
      >
        <form onSubmit={handleSubmitCreate}>
          <div className="form-group">
            <label className="form-label" htmlFor="user-nome">
              Nome Completo *
            </label>
            <input
              id="user-nome"
              type="text"
              className="form-input"
              placeholder="Ex: Carlos Oliveira"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              autoFocus
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="user-email">
              E-mail Corporativo *
            </label>
            <input
              id="user-email"
              type="email"
              className="form-input"
              placeholder="Ex: carlos.oliveira@shelfapp.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="user-senha">
              Senha de Acesso *
            </label>
            <input
              id="user-senha"
              type="password"
              className="form-input"
              placeholder="Mínimo de 6 caracteres"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="user-role">
              Perfil de Acesso *
            </label>
            <select
              id="user-role"
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              disabled={submitting}
            >
              <option value="Admin">Admin (Acesso total e gestão de usuários)</option>
              <option value="Operador">Operador (Estoque, kits e movimentação)</option>
            </select>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <Key size={15} />
              {submitting ? "Cadastrando..." : "Cadastrar Usuário"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => !deleting && setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Remover Usuário"
        message={`Deseja realmente remover o usuário "${deletingUser?.nome}" (${deletingUser?.email})? O acesso dele ao sistema será revogado imediatamente.`}
        confirmLabel="Sim, Remover"
        isLoading={deleting}
      />
    </div>
  );
}
