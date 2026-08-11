import { humanizeKey } from "../../lib/api";
import { StatePanel } from "./StatePanel";

function printable(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function DataTable({ rows, maxColumns = 7, caption = "운영 데이터" }: { rows: Record<string, unknown>[]; maxColumns?: number; caption?: string }) {
  if (!rows.length) return <StatePanel kind="empty" title="표시할 데이터가 없습니다" description="실제 운영 데이터가 생성되면 이 영역에 표시됩니다."/>;
  const preferred = ["id", "name", "title", "service_name", "project_code", "status", "email", "category", "progress_percent", "updated_at", "created_at"];
  const all = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  const columns = [...preferred.filter((k) => all.includes(k)), ...all.filter((k) => !preferred.includes(k))].slice(0, maxColumns);
  return <div className="data-table-wrap"><table className="data-table"><caption className="sr-only">{caption}</caption><thead><tr>{columns.map((col) => <th key={col} scope="col">{humanizeKey(col)}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={String(row.id ?? index)}>{columns.map((col) => <td key={col} data-label={humanizeKey(col)}>{col === "status" ? <span className={`admin-status status-${printable(row[col]).toLowerCase().replace(/\W+/g,"-")}`}>{printable(row[col])}</span> : printable(row[col])}</td>)}</tr>)}</tbody></table></div>;
}
