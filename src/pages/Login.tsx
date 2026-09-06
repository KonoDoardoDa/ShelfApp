import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck, Mail, Lock, Eye, EyeOff, Sun, Moon, ArrowRight } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { useTheme } from "../hooks/useTheme";
import { getErrorMessage } from "../api/http";
import "./Login.css";

export default function Login() {
  const { login } = useAuth();
  const { success, error: toastError } = useToast();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState<string>("");
  const [senha, setSenha] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !senha.trim()) {
      toastError("Por favor, preencha o e-mail e a senha.");
      return;
    }

    try {
      setSubmitting(true);
      await login({ email: email.trim(), senha });
      success("Autenticado com sucesso!");
      navigate(from, { replace: true });
    } catch (err) {
      toastError(getErrorMessage(err), "Falha na autenticação");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFillDemo = () => {
    setEmail("admin@shelfapp.com");
    setSenha("admin123");
  };

  return (
    <div className="login-minimal-container">
      {/* Botão de Tema no Canto Superior */}
      <div className="login-theme-wrapper">
        <button
          type="button"
          className="login-theme-btn"
          onClick={toggleTheme}
          title={`Alternar para modo ${theme === "dark" ? "claro" : "escuro"}`}
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          <span>{theme === "dark" ? "Modo Claro" : "Modo Escuro"}</span>
        </button>
      </div>

      {/* Card Central Minimalista */}
      <div className="login-minimal-card">
        {/* Marca / Topo do Card */}
        <div className="card-header-minimal">
          <div className="card-logo-icon">
            <ShieldCheck size={26} />
          </div>
          <h1 className="card-brand-title">ShelfApp</h1>
          <p className="card-brand-subtitle">Entre com suas credenciais para acessar o ERP</p>
        </div>

        {/* Formulário de Login */}
        <form onSubmit={handleSubmit} className="login-form-minimal">
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              E-mail
            </label>
            <div className="input-icon-wrapper">
              <Mail size={17} className="input-icon" />
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="nome@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
                required
                disabled={submitting}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              Senha
            </label>
            <div className="input-icon-wrapper">
              <Lock size={17} className="input-icon" />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                className="form-input"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete="current-password"
                required
                disabled={submitting}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary login-btn-minimal"
            disabled={submitting}
          >
            {submitting ? (
              <div className="spinner" style={{ width: "18px", height: "18px" }} />
            ) : (
              <>
                <span>Entrar</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Rodapé do Card com Atalho Discreto */}
        <div className="card-footer-minimal">
          <span>Acesso de teste: <code>admin@shelfapp.com</code></span>
          <button
            type="button"
            className="fill-link-btn"
            onClick={handleFillDemo}
            title="Preencher com credenciais padrão"
          >
            Preencher
          </button>
        </div>
      </div>
    </div>
  );
}
