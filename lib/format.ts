/** Formats a whole-dollar Canadian price for display, e.g. 1500 → "$1,500". */
export function formatCAD(n: number): string {
  return `$${n.toLocaleString("en-CA")}`;
}
