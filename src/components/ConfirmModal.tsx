import React from "react";
import { Modal } from "./Modal";
import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Excluir",
  cancelLabel = "Cancelar",
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="420px">
      <div className="confirm-modal-content">
        <div className="confirm-icon">
          <AlertTriangle size={36} color="#ef4444" />
        </div>
        <p className="confirm-message">{message}</p>
        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Processando..." : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};
