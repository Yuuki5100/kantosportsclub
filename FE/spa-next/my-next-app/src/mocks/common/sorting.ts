type SortOrder = "asc" | "desc" | "ASC" | "DESC";

export const sortList = <T extends Record<string, unknown>>(
  list: T[],
  sortKey?: string,
  sortOrder: SortOrder = "asc"
) => {
  if (!sortKey) return list;
  const order = sortOrder.toLowerCase() === "desc" ? -1 : 1;
  return [...list].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return -1 * order;
    if (bVal == null) return 1 * order;
    if (typeof aVal === "number" && typeof bVal === "number") {
      return (aVal - bVal) * order;
    }
    return String(aVal).localeCompare(String(bVal)) * order;
  });
};

