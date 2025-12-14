import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Home,
  Users,
  Package,
  Layers,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "./Sidebar.css";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [openItems, setOpenItems] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith("/items")) {
      setOpenItems(true);
    }
  }, [location.pathname]);

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        {!collapsed && (
          <h2 className="logo">{import.meta.env.VITE_APP_NAME}</h2>
        )}

        <button
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav>
        <NavLink to="/" className="menu-item">
          <Home size={18} />
          {!collapsed && <span>Home</span>}
        </NavLink>

        <NavLink to="/users" className="menu-item">
          <Users size={18} />
          {!collapsed && <span>Usuários</span>}
        </NavLink>

        <div
            className="menu-group"
            onMouseEnter={() => collapsed && setOpenItems(true)}
            onMouseLeave={() => collapsed && setOpenItems(false)}
        >
        <button
            className="menu-item menu-button"
            onClick={() => !collapsed && setOpenItems(!openItems)}
        >
            <Package size={18} />
            {!collapsed && (
            <>
                <span>Items</span>
                <span className={`arrow ${openItems ? "open" : ""}`}>▸</span>
            </>
            )}
        </button>

        {/* Submenu */}
        {openItems && (
            <div className={`submenu ${collapsed ? "floating" : ""}`}>
            <NavLink to="/items/kits" className="submenu-item" onClick={() => setOpenItems(false)}>
                <Layers size={16} />
                Kits
            </NavLink>
            <NavLink to="/items/estoque" className="submenu-item" onClick={() => setOpenItems(false)}>
                <Layers size={16} />
                Estoque
            </NavLink>
            <NavLink to="/items/fornecedores" className="submenu-item" onClick={() => setOpenItems(false)}>
                <Layers size={16} />
                Fornecedores
            </NavLink>
            </div>
            )}
            </div>

        <NavLink to="/about" className="menu-item">
          <Info size={18} />
          {!collapsed && <span>Sobre</span>}
        </NavLink>
      </nav>
    </aside>
  );
}