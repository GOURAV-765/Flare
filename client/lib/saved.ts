const KEY = "saved_jobs_ids";
export function getSaved(): (string | number)[] {
  try {
    const v = localStorage.getItem(KEY);
    return v ? (JSON.parse(v) as (string | number)[]) : [];
  } catch {
    return [];
  }
}
export function isSaved(id: string | number): boolean {
  return getSaved().includes(id);
}
export function toggleSaved(id: string | number): boolean {
  const list = new Set(getSaved());
  if (list.has(id)) list.delete(id); else list.add(id);
  localStorage.setItem(KEY, JSON.stringify(Array.from(list)));
  return list.has(id);
}
