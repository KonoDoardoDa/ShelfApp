import React from "react";
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
  children,
  className = "",
  style = {},
  align = "left",
}) => {
  return (
    <th
      className={className}
      style={{
        textAlign: align,
        ...style,
      }}
      role="columnheader"
    >
      {children}
    </th>
  );
};
