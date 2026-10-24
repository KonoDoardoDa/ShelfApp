import { useState, useMemo } from "react";

export type SortDirection = "asc" | "desc";

export interface UseTableSortReturn<T> {
  items: T[];
  sortKey: string | null;
  sortDirection: SortDirection;
  requestSort: (key: string) => void;
}

export function useTableSort<T>(
  data: T[],
  defaultKey: string | null = null,
  defaultDirection: SortDirection = "asc"
): UseTableSortReturn<T> {
  const [sortKey, setSortKey] = useState<string | null>(defaultKey);
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultDirection);

  const requestSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const items = useMemo(() => {
    if (!data || data.length === 0) {
      return data;
    }

    if (!sortKey) {
      return [...data].sort((a, b) => {
        const hasAtivoA = a && typeof a === "object" && "ativo" in (a as Record<string, unknown>);
        const hasAtivoB = b && typeof b === "object" && "ativo" in (b as Record<string, unknown>);
        if (hasAtivoA && hasAtivoB) {
          const ativoA = (a as Record<string, unknown>).ativo !== false;
          const ativoB = (b as Record<string, unknown>).ativo !== false;
          if (ativoA !== ativoB) return ativoA ? -1 : 1;
        }
        return 0;
      });
    }

    return [...data].sort((a, b) => {
      // Regra de Negócio: Registros inativos vão automaticamente para o final da lista,
      // a menos que o usuário esteja ordenando especificamente pela coluna "ativo".
      if (sortKey !== "ativo") {
        const hasAtivoA = a && typeof a === "object" && "ativo" in (a as Record<string, unknown>);
        const hasAtivoB = b && typeof b === "object" && "ativo" in (b as Record<string, unknown>);
        if (hasAtivoA && hasAtivoB) {
          const ativoA = (a as Record<string, unknown>).ativo !== false;
          const ativoB = (b as Record<string, unknown>).ativo !== false;
          if (ativoA !== ativoB) {
            return ativoA ? -1 : 1; // Ativos sobem (-1), Inativos descem para o final (1)
          }
        }
      }

      const getValue = (obj: unknown, path: string): unknown => {
        if (!obj || typeof obj !== "object") return null;
        return path.split(".").reduce((acc: unknown, part: string) => {
          if (acc && typeof acc === "object" && part in (acc as Record<string, unknown>)) {
            return (acc as Record<string, unknown>)[part];
          }
          return null;
        }, obj);
      };

      const valA = getValue(a, sortKey);
      const valB = getValue(b, sortKey);

      // Nulls / Undefined always at the bottom
      if (valA == null && valB == null) return 0;
      if (valA == null) return 1;
      if (valB == null) return -1;

      // Numeric comparison
      if (typeof valA === "number" && typeof valB === "number") {
        return sortDirection === "asc" ? valA - valB : valB - valA;
      }

      // Boolean comparison
      if (typeof valA === "boolean" && typeof valB === "boolean") {
        const numA = valA ? 1 : 0;
        const numB = valB ? 1 : 0;
        return sortDirection === "asc" ? numA - numB : numB - numA;
      }

      // String comparison (pt-BR with numeric collation e.g. #1, #2, #10)
      const strA = String(valA).trim();
      const strB = String(valB).trim();

      const cmp = strA.localeCompare(strB, "pt-BR", {
        numeric: true,
        sensitivity: "base",
      });

      return sortDirection === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortDirection]);

  return { items, sortKey, sortDirection, requestSort };
}
