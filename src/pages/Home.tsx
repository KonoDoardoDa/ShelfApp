import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Truck,
  Boxes,
  RefreshCw,
  AlertTriangle,
  AlertCircle,
  ArrowUpRight,
  Cpu,
  CheckCircle2,
  ArrowUpDown,
  Layers,
} from "lucide-react";
import KpiCard from "../components/KpiCard";
import { Pagination } from "../components/Pagination";
import { fornecedorService } from "../services/fornecedorService";
import { itemService } from "../services/itemService";
import type { Item } from "../types/item";
import type { Fornecedor } from "../types/fornecedor";
import { getErrorMessage } from "../api/http";

export default function Home() {
  const [loading, setLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [allItens, setAllItens] = useState<Item[]>([]);

  // Filtro do Painel de Itens Críticos
  const [criticalFilter, setCriticalFilter] = useState<"all" | "zerado" | "baixo">("all");

  const carregarDadosDashboard = async () => {
    try {
      setLoading(true);
      setApiError(null);

      const [fornecedoresData, itensData] = await Promise.all([
        fornecedorService.getAll().catch(() => [] as Fornecedor[]),
        itemService.getAll().catch(() => [] as Item[]),
      ]);

      setFornecedores(fornecedoresData);
      setAllItens(itensData);
    } catch (err) {
      setApiError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDadosDashboard();
  }, []);

  const fornecedorMap = useMemo(() => {
    const map = new Map<number, string>();
    fornecedores.forEach((f) => map.set(f.id, f.nome));
    return map;
  }, [fornecedores]);

  // Cálculos de Status de Estoque
  const itensZerados = useMemo(
    () => allItens.filter((i) => (i.quantidadeEstoque ?? 0) <= 0),
    [allItens]
  );

  const itensBaixoEstoque = useMemo(
    () =>
      allItens.filter(
        (i) => (i.quantidadeEstoque ?? 0) > 0 && (i.quantidadeEstoque ?? 0) <= 10
      ),
    [allItens]
  );

  const itensNormais = useMemo(
    () => allItens.filter((i) => (i.quantidadeEstoque ?? 0) > 10),
    [allItens]
  );

  const criticalItens = useMemo(() => {
    if (criticalFilter === "zerado") return itensZerados;
    if (criticalFilter === "baixo") return itensBaixoEstoque;
    return [...itensZerados, ...itensBaixoEstoque];
  }, [itensZerados, itensBaixoEstoque, criticalFilter]);

  // Paginação do Monitor de Itens Críticos (inicia com 5 itens no Dashboard)
  const [criticalPage, setCriticalPage] = useState<number>(1);
  const [criticalPageSize, setCriticalPageSize] = useState<number>(5);

  useEffect(() => {
    setCriticalPage(1);
  }, [criticalFilter, criticalPageSize]);

  const paginatedCriticalItens = useMemo(() => {
    const start = (criticalPage - 1) * criticalPageSize;
    return criticalItens.slice(start, start + criticalPageSize);
  }, [criticalItens, criticalPage, criticalPageSize]);

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-info">
          <h1>Painel Principal (Dashboard)</h1>
          <p>Visão executiva de níveis de estoque, reposição, kits e telemetria integrados com a ShelfApi</p>
        </div>

        <div className="page-header-actions">
          <button
            className="btn btn-secondary"
            onClick={carregarDadosDashboard}
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? "spinner" : ""} />
            Atualizar Métricas
          </button>
        </div>
      </div>

      {/* Aviso de Erro de Conexão com API caso ocorra */}
      {apiError && (
        <div
          className="card"
          style={{
            borderLeft: "4px solid var(--warning)",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            backgroundColor: "var(--warning-light)",
            padding: "16px 20px",
          }}
        >
          <AlertTriangle size={26} color="var(--warning)" style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ color: "var(--text-primary)", fontSize: "14px" }}>
              Comunicação com a ShelfApi:
            </strong>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)" }}>
              {apiError}
            </p>
          </div>
        </div>
      )}

      {/* Grid de KPIs Operacionais (Clicáveis e com Redirecionamento com Filtro Aplicado) */}
      <div className="kpi-grid">
        {/* Total de Itens */}
        <KpiCard
          title="Total de Itens"
          value={loading ? "—" : allItens.length}
          icon={<Boxes size={22} />}
          iconBg="var(--accent-light)"
          iconColor="var(--accent)"
          trend={`${itensNormais.length} Regulares`}
          description="Catálogo de peças e componentes"
          to="/items/estoque"
        />

        {/* Baixo Estoque (Clicável -> /items/estoque?status=baixo) */}
        <KpiCard
          title="Baixo Estoque"
          value={loading ? "—" : itensBaixoEstoque.length}
          icon={<AlertTriangle size={22} />}
          iconBg="rgba(245, 158, 11, 0.15)"
          iconColor="#f59e0b"
          trend="Atenção (1 a 10 un)"
          description="Clique para filtrar itens em reposição"
          to="/items/estoque?status=baixo"
        />

        {/* Itens Zerados (Clicável -> /items/estoque?status=zerado) */}
        <KpiCard
          title="Estoque Zerado"
          value={loading ? "—" : itensZerados.length}
          icon={<AlertCircle size={22} />}
          iconBg="rgba(239, 68, 68, 0.15)"
          iconColor="#ef4444"
          trend="Crítico (0 un)"
          description="Clique para filtrar itens esgotados"
          to="/items/estoque?status=zerado"
        />

        {/* Fornecedores Homologados */}
        <KpiCard
          title="Fornecedores"
          value={loading ? "—" : fornecedores.length}
          icon={<Truck size={22} />}
          iconBg="var(--purple-light)"
          iconColor="var(--purple)"
          trend="Cadeia de Suprimentos"
          description="Parceiros homologados e ativos"
          to="/items/fornecedores"
        />
      </div>

      {/* Monitor de Reposição & Itens Críticos */}
      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
              <AlertTriangle size={18} color="#f59e0b" />
              Monitor de Reposição & Estoque Crítico
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
              Itens que atingiram o limite mínimo ou estão com saldo zerado no almoxarifado
            </p>
          </div>

          {/* Filtro Rápido de Itens Críticos */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              className={`btn btn-sm ${criticalFilter === "all" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setCriticalFilter("all")}
            >
              Todos ({itensZerados.length + itensBaixoEstoque.length})
            </button>
            <button
              className={`btn btn-sm ${criticalFilter === "zerado" ? "btn-danger" : "btn-secondary"}`}
              onClick={() => setCriticalFilter("zerado")}
            >
              Zerados ({itensZerados.length})
            </button>
            <button
              className={`btn btn-sm ${criticalFilter === "baixo" ? "btn-primary" : "btn-secondary"}`}
              style={{
                backgroundColor: criticalFilter === "baixo" ? "#f59e0b" : undefined,
                borderColor: criticalFilter === "baixo" ? "#f59e0b" : undefined,
              }}
              onClick={() => setCriticalFilter("baixo")}
            >
              Baixo Estoque ({itensBaixoEstoque.length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-container" style={{ padding: "30px 0" }}>
            <div className="spinner" />
          </div>
        ) : criticalItens.length === 0 ? (
          <div
            style={{
              padding: "24px",
              borderRadius: "10px",
              backgroundColor: "var(--success-light)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <CheckCircle2 size={28} color="#10b981" style={{ flexShrink: 0 }} />
            <div>
              <strong style={{ color: "#10b981", fontSize: "14.5px" }}>
                Estoque 100% Regularizado
              </strong>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)" }}>
                Nenhum item está com estoque zerado ou abaixo da quantidade de segurança (10 unidades).
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: "80px" }}>ID</th>
                    <th>Nome da Peça / Componente</th>
                    <th>Fornecedor</th>
                    <th style={{ width: "160px" }}>Saldo Atual</th>
                    <th style={{ width: "160px", textAlign: "right" }}>Ação Rápida</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCriticalItens.map((item) => {
                    const qtd = item.quantidadeEstoque ?? 0;
                    const isZerado = qtd <= 0;
                    const fornecedorNome = fornecedorMap.get(item.fornecedorId) || `ID #${item.fornecedorId}`;
                    return (
                      <tr key={item.id}>
                        <td>
                          <span className="badge badge-blue">#{item.id}</span>
                        </td>
                        <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                          {item.nome}
                        </td>
                        <td>
                          <span className="badge badge-gray" style={{ display: "inline-flex", gap: "6px" }}>
                            <Truck size={12} />
                            {fornecedorNome}
                          </span>
                        </td>
                        <td>
                          {isZerado ? (
                            <span
                              className="badge badge-gray"
                              style={{
                                color: "var(--danger)",
                                borderColor: "rgba(239, 68, 68, 0.3)",
                                fontWeight: 700,
                              }}
                            >
                              0 un (Esgotado)
                            </span>
                          ) : (
                            <span className="badge badge-amber" style={{ fontWeight: 700 }}>
                              {qtd} un (Baixo Estoque)
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <Link
                            to={`/items/estoque?status=${isZerado ? "zerado" : "baixo"}`}
                            className="btn btn-secondary btn-sm"
                            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                          >
                            <ArrowUpDown size={13} color="var(--accent)" />
                            Repor Estoque
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={criticalPage}
              totalItems={criticalItens.length}
              pageSize={criticalPageSize}
              pageSizeOptions={[5, 10, 20, 50]}
              onPageChange={setCriticalPage}
              onPageSizeChange={(newSize) => {
                setCriticalPageSize(newSize);
                setCriticalPage(1);
              }}
              itemLabel={criticalItens.length === 1 ? "item crítico" : "itens críticos"}
            />
          </>
        )}
      </div>

      {/* Ações Rápidas de Cadastro */}
      <div className="card">
        <div style={{ marginBottom: "16px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700 }}>Acessos Rápidos do ERP</h3>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            Navegação direta para os módulos operacionais
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
          <Link
            to="/items/fornecedores"
            className="btn btn-secondary"
            style={{ justifyContent: "flex-start", padding: "14px 18px", gap: "12px", borderRadius: "10px" }}
          >
            <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "var(--accent-light)", color: "var(--accent)" }}>
              <Truck size={18} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>Fornecedores</span>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{fornecedores.length} cadastrados</span>
            </div>
            <ArrowUpRight size={14} style={{ marginLeft: "auto", color: "var(--text-muted)" }} />
          </Link>

          <Link
            to="/items/estoque"
            className="btn btn-secondary"
            style={{ justifyContent: "flex-start", padding: "14px 18px", gap: "12px", borderRadius: "10px" }}
          >
            <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "var(--success-light)", color: "var(--success)" }}>
              <Boxes size={18} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>Estoque & Peças</span>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Controle de saldos</span>
            </div>
            <ArrowUpRight size={14} style={{ marginLeft: "auto", color: "var(--text-muted)" }} />
          </Link>

          <Link
            to="/items/kits"
            className="btn btn-secondary"
            style={{ justifyContent: "flex-start", padding: "14px 18px", gap: "12px", borderRadius: "10px" }}
          >
            <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "var(--purple-light)", color: "var(--purple)" }}>
              <Layers size={18} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>Kits & Montagens</span>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Composição de peças</span>
            </div>
            <ArrowUpRight size={14} style={{ marginLeft: "auto", color: "var(--text-muted)" }} />
          </Link>

          <Link
            to="/softwares"
            className="btn btn-secondary"
            style={{ justifyContent: "flex-start", padding: "14px 18px", gap: "12px", borderRadius: "10px" }}
          >
            <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "rgba(59, 130, 246, 0.12)", color: "var(--accent)" }}>
              <Cpu size={18} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>Softwares & CLPs</span>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Controle de implantação</span>
            </div>
            <ArrowUpRight size={14} style={{ marginLeft: "auto", color: "var(--text-muted)" }} />
          </Link>
        </div>
      </div>
    </div>
  );
}
