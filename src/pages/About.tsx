import { Info, CheckCircle2, Server } from "lucide-react";

export default function About() {
  return (
    <div className="page-container" style={{ maxWidth: "860px" }}>
      <div className="page-header">
        <div className="page-header-info">
          <h1>
            <Info size={24} color="var(--accent)" />
            Sobre o ShelfApp
          </h1>
          <p>Sistema ERP de Gestão de Estoque, Peças, Fornecedores e Kits</p>
        </div>
      </div>

      <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <h3 style={{ fontSize: "17px" }}>Visão Geral da Aplicação</h3>
        <p>
          O <strong>ShelfApp</strong> é o frontend moderno do sistema ERP, desenvolvido com React 19, TypeScript e Vite,
          integrado em tempo real com a <strong>ShelfApi</strong> (desenvolvida em ASP.NET Core Web API com MySQL).
        </p>

        <h4 style={{ fontSize: "15px", marginTop: "10px" }}>Módulos Integrados da ShelfApi:</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <CheckCircle2 size={18} color="var(--success)" />
            <span><strong>Fornecedores:</strong> Cadastro, edição, listagem e remoção de parceiros comerciais.</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <CheckCircle2 size={18} color="var(--success)" />
            <span><strong>Itens e Estoque:</strong> Controle de peças, insumos e componentes vinculados aos fornecedores.</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <CheckCircle2 size={18} color="var(--success)" />
            <span><strong>Kits de Instalação:</strong> Agrupamento de itens em conjuntos modulares com definição de quantidade e identificador de peças de painel.</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <CheckCircle2 size={18} color="var(--success)" />
            <span><strong>Composição de Kits:</strong> Associação detalhada de itens por kit via endpoints dedicados.</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <CheckCircle2 size={18} color="var(--success)" />
            <span><strong>Modo Claro & Escuro:</strong> Suporte completo a temas com alternância rápida na barra superior e persistência de preferência.</span>
          </div>
        </div>

        <div
          style={{
            marginTop: "16px",
            padding: "16px",
            backgroundColor: "var(--bg-app)",
            borderRadius: "8px",
            border: "1px solid var(--border-color)",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <Server size={28} color="var(--accent)" />
          <div>
            <strong style={{ fontSize: "14px" }}>Configuração do Backend (ShelfApi)</strong>
            <p style={{ fontSize: "13px", margin: 0 }}>
              Endpoints RESTful mapeados via Axios em <code>{import.meta.env.VITE_API_URL || "https://localhost:7024/api"}</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}