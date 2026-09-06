import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  itemLabel?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  pageSizeOptions = [10, 20, 50],
  onPageChange,
  onPageSizeChange,
  itemLabel = "registros",
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  // Geração inteligente de links de página com reticências
  const getPageNumbers = (): (number | "ellipsis")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "ellipsis", totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [
        1,
        "ellipsis",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "ellipsis",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "ellipsis",
      totalPages,
    ];
  };

  const pages = getPageNumbers();

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        Exibindo <strong>{startIndex}</strong> a <strong>{endIndex}</strong> de{" "}
        <strong>{totalItems}</strong> {itemLabel}
      </div>

      <div className="pagination-actions">
        <div className="pagination-size-selector">
          <span>Itens por página:</span>
          <select
            className="pagination-select"
            value={pageSize}
            onChange={(e) => {
              const newSize = Number(e.target.value);
              onPageSizeChange(newSize);
            }}
            aria-label="Quantidade de itens por página"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="pagination-controls">
          <button
            type="button"
            className="pagination-btn"
            onClick={() => onPageChange(1)}
            disabled={currentPage <= 1}
            title="Primeira página"
            aria-label="Primeira página"
          >
            <ChevronsLeft size={16} />
          </button>

          <button
            type="button"
            className="pagination-btn"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            title="Página anterior"
            aria-label="Página anterior"
          >
            <ChevronLeft size={16} />
          </button>

          {pages.map((p, idx) =>
            p === "ellipsis" ? (
              <span key={`ellipsis-${idx}`} className="pagination-ellipsis">
                ...
              </span>
            ) : (
              <button
                key={`page-${p}`}
                type="button"
                className={`pagination-btn ${p === currentPage ? "active" : ""}`}
                onClick={() => onPageChange(p)}
                aria-current={p === currentPage ? "page" : undefined}
              >
                {p}
              </button>
            )
          )}

          <button
            type="button"
            className="pagination-btn"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            title="Próxima página"
            aria-label="Próxima página"
          >
            <ChevronRight size={16} />
          </button>

          <button
            type="button"
            className="pagination-btn"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages}
            title="Última página"
            aria-label="Última página"
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
