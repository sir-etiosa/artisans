import Btn from "./Btn";
import { MUTED } from "@/lib/theme";

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4 mt-6">
      <Btn small disabled={page <= 1} onClick={() => onChange(page - 1)} style={{ opacity: page <= 1 ? 0.4 : 1 }}>
        ← Previous
      </Btn>
      <span className="text-[13px] font-medium" style={{ color: MUTED }}>Page {page} of {totalPages}</span>
      <Btn small disabled={page >= totalPages} onClick={() => onChange(page + 1)} style={{ opacity: page >= totalPages ? 0.4 : 1 }}>
        Next →
      </Btn>
    </div>
  );
}
