import React, { useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";
import { ToastContext, type ToastItem, type ToastType } from "./toast-context";

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", title?: string) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { id, type, message, title };
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        removeToast(id);
      }, 4500);
    },
    [removeToast]
  );

  const success = useCallback((msg: string, title = "Sucesso") => showToast(msg, "success", title), [showToast]);
  const error = useCallback((msg: string, title = "Erro") => showToast(msg, "error", title), [showToast]);
  const warning = useCallback((msg: string, title = "Atenção") => showToast(msg, "warning", title), [showToast]);
  const info = useCallback((msg: string, title = "Informação") => showToast(msg, "info", title), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <div className="toast-icon">
              {toast.type === "success" && <CheckCircle2 size={20} />}
              {toast.type === "error" && <XCircle size={20} />}
              {toast.type === "warning" && <AlertTriangle size={20} />}
              {toast.type === "info" && <Info size={20} />}
            </div>
            <div className="toast-body">
              {toast.title && <div className="toast-title">{toast.title}</div>}
              <div className="toast-message">{toast.message}</div>
            </div>
            <button
              className="toast-close"
              onClick={() => removeToast(toast.id)}
              aria-label="Fechar notificação"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
