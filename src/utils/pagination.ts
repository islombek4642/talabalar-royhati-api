export type Pagination = { page: number; limit: number };

export function calcSkipTake(page: number, limit: number) {
  const p = Math.max(1, page);
  const l = Math.max(1, limit);
  const skip = (p - 1) * l;
  const take = l;
  return { skip, take };
}
