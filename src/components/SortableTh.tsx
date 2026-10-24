import React from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { SortDirection } from "../hooks/useTableSort";

interface SortableThProps {
  sortKey: string;
  currentSortKey: string | null;
  currentDirection: SortDirection;
  onSort: (key: string) => void;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  align?: "left" | "center" | "right";
  title?: string;
}

export const SortableTh: React.FC<SortableThProps> = ({
  sortKey,
  currentSortKey,
  currentDirection,
  onSort,
  children,
  className = "",
  style = {},
  align = "left",
  title,
}) => {
  const isActive = currentSortKey === sortKey;

  const handleClick = () => {
    onSort(sortKey);
  };

  const justifyMap = {
    left: "flex-start",
    center: "center",
    right: "flex-end",
  };

  return (
    <th
      className={`sortable-th ${className}`}
      style={{
        cursor: "pointer",
        userSelect: "none",
        textAlign: align,
        ...style,
      }}
      onClick={handleClick}
      title={title || `Clique para ordenar por ${typeof children === "string" ? children : "esta coluna"}`}
      role="columnheader"
      aria-sort={isActive ? (currentDirection === "asc" ? "ascending" : "descending") : "none"}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          justifyContent: justifyMap[align],
          width: "100%",
        }}
      >
        <span>{children}</span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            opacity: isActive ? 1 : 0.55,
            color: isActive ? "var(--accent)" : "inherit",
            transition: "all 0.15s ease",
          }}
        >
          {isActive ? (
            currentDirection === "asc" ? (
              <ArrowUp size={13} strokeWidth={2.5} />
            ) : (
              <ArrowDown size={13} strokeWidth={2.5} />
            )
          ) : (
            <ArrowUpDown size={12} strokeWidth={2} />
          )}
        </span>
      </div>
    </th>
  );
};
