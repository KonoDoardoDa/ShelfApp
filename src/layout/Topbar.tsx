import { useLocation, Link } from "react-router-dom";
import { Moon, Sun, Home, ChevronRight, LogOut } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";
import { ConfirmModal } from "../components/ConfirmModal";
import "./Layout.css";

export default function Topbar() {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === "/") return [{ label: "Dashboard" }];
    if (path === "/items/fornecedores") return [{ label: "Itens & Estoque" }, { label: "Fornecedores" }];
    if (path === "/items/estoque") return [{ label: "Itens & Estoque" }, { label: "Controle de Estoque" }];
    if (path === "/items/kits") return [{ label: "Itens & Estoque" }, { label: "Kits de Produtos" }];
    if (path === "/softwares") return [{ label: "Sistema" }, { label: "Softwares & Licenças" }];
    if (path === "/users") return [{ label: "Sistema" }, { label: "Usuários" }];
    if (path === "/about") return [{ label: "Sistema" }, { label: "Sobre o ERP" }];
    return [{ label: path.replace("/", "") }];
  };

  const breadcrumbs = getBreadcrumbs();

  const getInitials = (name?: string) => {
    if (!name) return "AD";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      <header className="topbar">
        {/* Breadcrumb Navigation */}
        <div className="breadcrumb-wrapper">
          <Link to="/" className="breadcrumb-home" title="Início">
            <Home size={16} />
          </Link>
          {breadcrumbs.map((b, idx) => (
            <div key={idx} className="breadcrumb-segment">
              <ChevronRight size={14} className="breadcrumb-separator" />
              <span className={idx === breadcrumbs.length - 1 ? "breadcrumb-current" : "breadcrumb-ancestor"}>
                {b.label}
              </span>
            </div>
          ))}
        </div>

        {/* Topbar Right Actions */}
        <div className="topbar-right">
          {/* Theme Segmented Switch */}
          <div className="theme-switch-container">
            <button
              type="button"
              className={`theme-segment-btn ${theme === "light" ? "active" : ""}`}
              onClick={() => setTheme("light")}
              title="Ativar Modo Claro"
            >
              <Sun size={14} />
              <span className="theme-segment-label">Claro</span>
            </button>
            <button
              type="button"
              className={`theme-segment-btn ${theme === "dark" ? "active" : ""}`}
              onClick={() => setTheme("dark")}
              title="Ativar Modo Escuro"
            >
              <Moon size={14} />
              <span className="theme-segment-label">Escuro</span>
            </button>
          </div>

          {/* Perfil e Botão Logout */}
          <div className="user-topbar-profile">
            <div className="user-avatar" style={{ width: "32px", height: "32px", fontSize: "12px" }}>
              {getInitials(user?.nome)}
            </div>
            <button
              type="button"
              className="logout-btn"
              onClick={() => setIsLogoutModalOpen(true)}
              title="Encerrar sessão"
            >
              <LogOut size={16} />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Confirmação de Logout */}
      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={logout}
        title="Encerrar Sessão"
        message="Deseja realmente sair do sistema ERP? Você precisará informar seu e-mail e senha novamente para acessar."
        confirmLabel="Sim, Sair"
        cancelLabel="Permanecer"
      />
    </>
  );
}