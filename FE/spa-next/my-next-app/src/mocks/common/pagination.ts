export const paginateList = <T>(
  list: T[],
  pageNumber: number = 1,
  pageSize: number = 50
) => {
  const safePage = Math.max(1, pageNumber);
  const safeSize = Math.max(1, pageSize);
  const start = (safePage - 1) * safeSize;
  const end = start + safeSize;
  return {
    items: list.slice(start, end),
    total: list.length,
  };
};

