import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Cpu,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Filter,
  AlertCircle,
} from "lucide-react";
import { softwareService } from "../services/softwareService";
import { kitService } from "../services/kitService";
import type { Software, CreateSoftwareDto, UpdateSoftwareDto } from "../types/software";
import type { Kit } from "../types/kit";
import { Modal } from "../components/Modal";
import { ConfirmModal } from "../components/ConfirmModal";
import { SortableTh } from "../components/SortableTh";
import { useTableSort } from "../hooks/useTableSort";
import { useToast } from "../hooks/useToast";
import { getErrorMessage } from "../api/http";

export default function Softwares() {
  const { success, error: toastError } = useToast();

  const [softwares, setSoftwares] = useState<Software[]>([]);
  const [kits, setKits] = useState<Kit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filtroTipo, setFiltroTipo] = useState<string>("TODOS");
  const [filtroStatus, setFiltroStatus] = useState<string>("TODOS");

  // Modal de Formulário (Criar / Editar)
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingSoftware, setEditingSoftware] = useState<Software | null>(null);
  const [nomeSoftware, setNomeSoftware] = useState<string>("");
  const [versao, setVersao] = useState<string>("");
  const [cliente, setCliente] = useState<string>("");
  const [kitId, setKitId] = useState<string | number>("");
  const [nomeKitCustom, setNomeKitCustom] = useState<string>("");
  const [tipoDispositivo, setTipoDispositivo] = useState<string>("CLP");
  const [dataInstalacao, setDataInstalacao] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [status, setStatus] = useState<string>("Operacional");
  const [observacoes, setObservacoes] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Modal de Exclusão
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deletingSoftware, setDeletingSoftware] = useState<Software | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const [softwaresData, kitsData] = await Promise.all([
        softwareService.getAll(),
        kitService.getAll().catch(() => [] as Kit[]),
      ]);
      setSoftwares(softwaresData || []);
      setKits(kitsData || []);
    } catch (err) {
      const msg = getErrorMessage(err);
      setErrorMsg(msg);
      toastError(msg, "Erro ao carregar dados de softwares");
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const handleOpenCreateModal = () => {
    setEditingSoftware(null);
    setNomeSoftware("");
    setVersao("");
    setCliente("");
    setKitId(kits.length > 0 ? kits[0].id : "");
    setNomeKitCustom("");
    setTipoDispositivo("CLP");
    setDataInstalacao(new Date().toISOString().split("T")[0]);
    setStatus("Operacional");
    setObservacoes("");
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (item: Software) => {
    setEditingSoftware(item);
    setNomeSoftware(item.nomeSoftware);
    setVersao(item.versao);
    setCliente(item.cliente);
    setKitId(item.kitId ?? (item.nomeKit ? "custom" : ""));
    setNomeKitCustom(item.nomeKit || "");
    setTipoDispositivo(item.tipoDispositivo || "CLP");
    setDataInstalacao(
      item.dataInstalacao
        ? item.dataInstalacao.split("T")[0]
        : new Date().toISOString().split("T")[0]
    );
    setStatus(item.status || "Operacional");
    setObservacoes(item.observacoes || "");
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (item: Software) => {
    setDeletingSoftware(item);
    setIsDeleteModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeSoftware.trim()) {
      toastError("O nome do software é obrigatório.");
      return;
    }
    if (!versao.trim()) {
      toastError("A versão do software é obrigatória.");
      return;
    }
    if (!cliente.trim()) {
      toastError("O nome do cliente é obrigatório.");
      return;
    }
    if (!dataInstalacao) {
      toastError("A data de instalação é obrigatória.");
      return;
    }

    try {
      setSubmitting(true);

      let resolvedKitId: number | null = null;
      let resolvedNomeKit: string | null = null;

      if (kitId === "custom") {
        resolvedNomeKit = nomeKitCustom.trim() || null;
      } else if (kitId) {
        resolvedKitId = Number(kitId);
        const kitFound = kits.find((k) => k.id === resolvedKitId);
        resolvedNomeKit = kitFound ? kitFound.nome : null;
      }

      const isoDate = new Date(`${dataInstalacao}T12:00:00Z`).toISOString();

      if (editingSoftware) {
        const updatePayload: UpdateSoftwareDto = {
          id: editingSoftware.id,
          nomeSoftware: nomeSoftware.trim(),
          versao: versao.trim(),
          cliente: cliente.trim(),
          kitId: resolvedKitId,
          nomeKit: resolvedNomeKit,
          tipoDispositivo,
          dataInstalacao: isoDate,
          status,
          observacoes: observacoes.trim() || null,
        };

        await softwareService.update(editingSoftware.id, updatePayload);
        success(`Software "${nomeSoftware.trim()}" atualizado com sucesso!`);
      } else {
        const createPayload: CreateSoftwareDto = {
          nomeSoftware: nomeSoftware.trim(),
          versao: versao.trim(),
          cliente: cliente.trim(),
          kitId: resolvedKitId,
          nomeKit: resolvedNomeKit,
          tipoDispositivo,
          dataInstalacao: isoDate,
          status,
          observacoes: observacoes.trim() || null,
        };

        await softwareService.create(createPayload);
        success(`Implantação "${nomeSoftware.trim()}" cadastrada com sucesso!`);
      }

      setIsFormModalOpen(false);
      await carregarDados();
    } catch (err) {
      const msg = getErrorMessage(err);
      toastError(msg, "Erro ao salvar software");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingSoftware) return;
    try {
      setDeleting(true);
      await softwareService.delete(deletingSoftware.id);
      success("Implantação excluída com sucesso!");
      setIsDeleteModalOpen(false);
      setDeletingSoftware(null);
      await carregarDados();
    } catch (err) {
      const msg = getErrorMessage(err);
      toastError(msg, "Erro ao excluir implantação");
    } finally {
      setDeleting(false);
    }
  };

  const filteredSoftwares = useMemo(() => {
    return softwares.filter((s) => {
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        s.nomeSoftware.toLowerCase().includes(query) ||
        s.versao.toLowerCase().includes(query) ||
        s.cliente.toLowerCase().includes(query) ||
        (s.nomeKit && s.nomeKit.toLowerCase().includes(query)) ||
        s.tipoDispositivo.toLowerCase().includes(query) ||
        s.id.toString().includes(query);

      const matchesTipo =
        filtroTipo === "TODOS" ||
        s.tipoDispositivo.toUpperCase() === filtroTipo.toUpperCase();

      const matchesStatus =
        filtroStatus === "TODOS" ||
        s.status.toUpperCase() === filtroStatus.toUpperCase();

      return matchesSearch && matchesTipo && matchesStatus;
    });
  }, [softwares, searchTerm, filtroTipo, filtroStatus]);

  const {
    items: sortedSoftwares,
    sortKey,
    sortDirection,
    requestSort,
  } = useTableSort(filteredSoftwares, "id", "asc");

  const formatarData = (dataStr?: string) => {
    if (!dataStr) return "—";
    try {
      const d = new Date(dataStr);
      return d.toLocaleDateString("pt-BR", { timeZone: "UTC" });
    } catch {
      return dataStr;
    }
  };

  const getStatusBadge = (statusValue: string) => {
    switch (statusValue) {
      case "Operacional":
        return <span className="badge badge-green">Operacional</span>;
      case "Em Testes":
        return <span className="badge badge-amber">Em Testes</span>;
      case "Aguardando Homologação":
        return <span className="badge badge-blue">Aguardando Homologação</span>;
      case "Descontinuado":
        return <span className="badge badge-gray">Descontinuado</span>;
      default:
        return <span className="badge badge-gray">{statusValue}</span>;
    }
  };

  return (
    <div className="page-container">
      {/* Header Padronizado */}
      <div className="page-header">
        <div className="page-header-info">
          <h1>
            <Cpu size={24} color="var(--accent)" />
            Softwares & Implantações
          </h1>
          <p>Controle de versões de software instaladas em CLPs e Inversores por cliente</p>
        </div>

        <div className="page-header-actions">
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
            Nova Implantação
          </button>
        </div>
      </div>

      {/* Filter Bar Padronizada */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} />
          <input
            type="text"
            className="form-input"
            placeholder="Pesquisar por software, versão, cliente, kit ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Filter size={16} color="var(--text-muted)" />
          <select
            className="form-select"
            style={{ width: "170px" }}
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
          >
            <option value="TODOS">Todos os Dispositivos</option>
            <option value="CLP">CLP</option>
            <option value="Inversor">Inversor</option>
            <option value="IHM">IHM</option>
            <option value="Servo">Servoacionamento</option>
            <option value="Outro">Outro</option>
          </select>
        </div>

        <select
          className="form-select"
          style={{ width: "170px" }}
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
        >
          <option value="TODOS">Todos os Status</option>
          <option value="Operacional">Operacional</option>
          <option value="Em Testes">Em Testes</option>
          <option value="Aguardando Homologação">Aguardando Homologação</option>
          <option value="Descontinuado">Descontinuado</option>
        </select>

        <span className="badge badge-gray">
          Total: {filteredSoftwares.length} {filteredSoftwares.length === 1 ? "registro" : "registros"}
        </span>
      </div>

      {/* Conteúdo: Loading, Erro, Vazio ou Tabela */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
          <p>Carregando implantações de softwares...</p>
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
      ) : filteredSoftwares.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Cpu size={48} />
          </div>
          <h3 className="empty-state-title">Nenhuma implantação encontrada</h3>
          <p className="empty-state-text">
            {searchTerm || filtroTipo !== "TODOS" || filtroStatus !== "TODOS"
              ? "Nenhum registro corresponde aos filtros selecionados."
              : "Nenhum software ou firmware registrado ainda."}
          </p>
          <button className="btn btn-primary" onClick={handleOpenCreateModal}>
            <Plus size={16} /> Cadastrar Nova Implantação
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
                  style={{ width: "80px" }}
                >
                  ID
                </SortableTh>
                <SortableTh
                  sortKey="nomeSoftware"
                  currentSortKey={sortKey}
                  currentDirection={sortDirection}
                  onSort={requestSort}
                >
                  Aplicação / Software
                </SortableTh>
                <SortableTh
                  sortKey="versao"
                  currentSortKey={sortKey}
                  currentDirection={sortDirection}
                  onSort={requestSort}
                  style={{ width: "110px" }}
                >
                  Versão
                </SortableTh>
                <SortableTh
                  sortKey="cliente"
                  currentSortKey={sortKey}
                  currentDirection={sortDirection}
                  onSort={requestSort}
                >
                  Cliente Pedinte
                </SortableTh>
                <SortableTh
                  sortKey="tipoDispositivo"
                  currentSortKey={sortKey}
                  currentDirection={sortDirection}
                  onSort={requestSort}
                  style={{ width: "120px" }}
                >
                  Dispositivo
                </SortableTh>
                <SortableTh
                  sortKey="nomeKit"
                  currentSortKey={sortKey}
                  currentDirection={sortDirection}
                  onSort={requestSort}
                >
                  Kit Instalado na Máquina
                </SortableTh>
                <SortableTh
                  sortKey="dataInstalacao"
                  currentSortKey={sortKey}
                  currentDirection={sortDirection}
                  onSort={requestSort}
                  style={{ width: "140px" }}
                >
                  Data Instalação
                </SortableTh>
                <SortableTh
                  sortKey="status"
                  currentSortKey={sortKey}
                  currentDirection={sortDirection}
                  onSort={requestSort}
                  style={{ width: "140px" }}
                >
                  Status
                </SortableTh>
                <th style={{ width: "110px", textAlign: "right" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {sortedSoftwares.map((s) => (
                <tr key={s.id}>
                  <td>
                    <span className="badge badge-blue">#{s.id}</span>
                  </td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                        {s.nomeSoftware}
                      </span>
                      {s.observacoes && (
                        <span
                          style={{
                            fontSize: "12px",
                            color: "var(--text-muted)",
                            maxWidth: "320px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={s.observacoes}
                        >
                          {s.observacoes}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-purple">{s.versao}</span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{s.cliente}</td>
                  <td>
                    <span className="badge badge-gray">{s.tipoDispositivo}</span>
                  </td>
                  <td>
                    {s.nomeKit ? (
                      <span className="badge badge-blue">{s.nomeKit}</span>
                    ) : (
                      <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
                        Não especificado
                      </span>
                    )}
                  </td>
                  <td style={{ color: "var(--text-secondary)" }}>
                    {formatarData(s.dataInstalacao)}
                  </td>
                  <td>{getStatusBadge(s.status)}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn btn-icon btn-sm btn-ghost-primary"
                        onClick={() => handleOpenEditModal(s)}
                        title="Editar implantação"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        className="btn btn-icon btn-sm btn-ghost-danger"
                        onClick={() => handleOpenDeleteModal(s)}
                        title="Excluir implantação"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Formulário Padronizado */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => !submitting && setIsFormModalOpen(false)}
        closeOnBackdrop={true}
        title={
          editingSoftware
            ? "Editar Implantação de Software"
            : "Cadastrar Nova Implantação de Software"
        }
      >
        <form onSubmit={handleSubmitForm}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>
            <div className="form-group">
              <label className="form-label" htmlFor="sw-nome">
                Nome do Software / Aplicação *
              </label>
              <input
                id="sw-nome"
                type="text"
                className="form-input"
                placeholder="Ex: Schneider SoMove, Siemens..."
                value={nomeSoftware}
                onChange={(e) => setNomeSoftware(e.target.value)}
                autoFocus
                required
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="sw-versao">
                Versão *
              </label>
              <input
                id="sw-versao"
                type="text"
                className="form-input"
                placeholder="Ex: v1.0.0, v2.4.1"
                value={versao}
                onChange={(e) => setVersao(e.target.value)}
                required
                disabled={submitting}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "16px" }}>
            <div className="form-group">
              <label className="form-label" htmlFor="sw-cliente">
                Cliente Pedinte da Máquina *
              </label>
              <input
                id="sw-cliente"
                type="text"
                className="form-input"
                placeholder="Ex: Super pão, BreadKing, Marquespan..."
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                required
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="sw-tipo">
                Dispositivo
              </label>
              <select
                id="sw-tipo"
                className="form-select"
                value={tipoDispositivo}
                onChange={(e) => setTipoDispositivo(e.target.value)}
                disabled={submitting}
              >
                <option value="CLP">CLP</option>
                <option value="Inversor">Inversor de Frequência</option>
                <option value="IHM">IHM</option>
                <option value="Servo">Servo</option>
                <option value="Outro">Outro Equipamento</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="sw-kit">
              Kit Instalado na Máquina
            </label>
            <select
              id="sw-kit"
              className="form-select"
              value={kitId}
              onChange={(e) => setKitId(e.target.value)}
              disabled={submitting}
            >
              <option value="">-- Selecione um Kit do ERP (Opcional) --</option>
              {kits
                .filter((k) => k.ativo !== false || k.id === kitId)
                .map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nome} (Kit #{k.id}){k.ativo === false ? " (Inativo)" : ""}
                  </option>
                ))}
              <option value="custom">Outro (Digitar Nome Manualmente)</option>
            </select>
          </div>

          {kitId === "custom" && (
            <div className="form-group">
              <label className="form-label" htmlFor="sw-kit-custom">
                Nome do Kit Personalizado
              </label>
              <input
                id="sw-kit-custom"
                type="text"
                className="form-input"
                placeholder="Ex: Kit pneumático Alimentador..."
                value={nomeKitCustom}
                onChange={(e) => setNomeKitCustom(e.target.value)}
                disabled={submitting}
              />
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-group">
              <label className="form-label" htmlFor="sw-data">
                Data da Instalação *
              </label>
              <input
                id="sw-data"
                type="date"
                className="form-input"
                value={dataInstalacao}
                onChange={(e) => setDataInstalacao(e.target.value)}
                required
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="sw-status">
                Status da Implantação
              </label>
              <select
                id="sw-status"
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={submitting}
              >
                <option value="Operacional">Operacional</option>
                <option value="Em Testes">Em Testes</option>
                <option value="Aguardando Homologação">Aguardando Homologação</option>
                <option value="Descontinuado">Descontinuado</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="sw-obs">
              Descrição / Observações Técnicas (Opcional)
            </label>
            <textarea
              id="sw-obs"
              className="form-textarea"
              rows={3}
              placeholder="Parâmetros ajustados, correção de corrente em disjuntor..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
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
              {submitting
                ? "Salvando..."
                : editingSoftware
                ? "Salvar Alterações"
                : "Cadastrar Implantação"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Confirmação de Exclusão Padronizado */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => !deleting && setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Excluir Registro de Implantação"
        message={`Deseja realmente remover o registro do software "${deletingSoftware?.nomeSoftware}" (Versão ${deletingSoftware?.versao}) instalado para o cliente "${deletingSoftware?.cliente}"?`}
        confirmLabel="Sim, Excluir"
        isLoading={deleting}
      />
    </div>
  );
}
