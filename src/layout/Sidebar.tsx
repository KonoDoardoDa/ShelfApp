import { NavLink } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Layers,
  Boxes,
  Truck,
  Monitor,
  Info,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import "./Sidebar.css";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  const getInitials = (name?: string) => {
    if (!name) return "AD";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* Sidebar Header / Logo */}
      <div className="sidebar-header">
        {!collapsed ? (
          <div className="brand-wrapper">
            <div className="brand-logo">
              <ShieldCheck size={20} />
            </div>
            <div className="brand-info">
              <div className="brand-title">
                <span>{import.meta.env.VITE_APP_NAME || "ShelfApp"}</span>
                <span className="brand-badge">ERP</span>
              </div>
              <span className="brand-subtitle">Gestão & Telemetria</span>
            </div>
          </div>
        ) : (
          <div className="brand-logo" style={{ margin: "0 auto" }}>
            <ShieldCheck size={20} />
          </div>
        )}

        <button
          className="collapse-toggle"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
          aria-label={collapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation Sections */}
      <nav className="sidebar-nav">
        {/* Section 1: Principal */}
        <div className="nav-section">
          {!collapsed && <span className="nav-section-title">PRINCIPAL</span>}
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            title="Dashboard Principal"
          >
            <LayoutDashboard size={19} className="nav-icon" />
            {!collapsed && <span className="nav-text">Dashboard</span>}
          </NavLink>
        </div>

        {/* Section 2: Gestão & Estoque */}
        <div className="nav-section">
          {!collapsed && <span className="nav-section-title">ESTOQUE & KITS</span>}

          <NavLink
            to="/items/fornecedores"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            title="Fornecedores"
          >
            <Truck size={19} className="nav-icon" />
            {!collapsed && <span className="nav-text">Fornecedores</span>}
          </NavLink>

          <NavLink
            to="/items/estoque"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            title="Estoque & Itens"
          >
            <Boxes size={19} className="nav-icon" />
            {!collapsed && <span className="nav-text">Estoque & Itens</span>}
          </NavLink>

          <NavLink
            to="/items/kits"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            title="Kits & Composições"
          >
            <Layers size={19} className="nav-icon" />
            {!collapsed && <span className="nav-text">Kits de Produtos</span>}
          </NavLink>
        </div>

        {/* Section 3: Sistema */}
        <div className="nav-section">
          {!collapsed && <span className="nav-section-title">SISTEMA</span>}

          <NavLink
            to="/softwares"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            title="Softwares & Licenças"
          >
            <Monitor size={19} className="nav-icon" />
            {!collapsed && <span className="nav-text">Softwares</span>}
          </NavLink>

          {user?.role?.toLowerCase() === "admin" && (
            <NavLink
              to="/users"
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              title="Usuários & Permissões"
            >
              <Users size={19} className="nav-icon" />
              {!collapsed && <span className="nav-text">Usuários</span>}
            </NavLink>
          )}

          <NavLink
            to="/about"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            title="Sobre o Sistema"
          >
            <Info size={19} className="nav-icon" />
            {!collapsed && <span className="nav-text">Sobre o ERP</span>}
          </NavLink>
        </div>
      </nav>

      {/* Sidebar Footer: User Card */}
      <div className="sidebar-footer">
        {!collapsed ? (
          <div className="user-card" title={user?.email || "Usuário logado"}>
            <div className="user-avatar-wrapper">
              <div className="user-avatar">
                {getInitials(user?.nome)}
              </div>
              <span className="user-status-dot" />
            </div>
            <div className="user-details">
              <span className="user-name-text">{user?.nome || "Operador"}</span>
              <span className="user-role-text">{user?.role || "Usuário"}</span>
            </div>
          </div>
        ) : (
          <div className="user-avatar-wrapper" style={{ margin: "0 auto" }} title={user?.nome}>
            <div className="user-avatar">
              {getInitials(user?.nome)}
            </div>
            <span className="user-status-dot" />
          </div>
        )}
      </div>
    </aside>
  );
}