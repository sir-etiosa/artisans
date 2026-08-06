import { Btn } from "@/components/ui";
import { LINE, MUTED, PAPER, PINE } from "@/lib/theme";

export default function EscrowStep({ sel, onBack, onPay }) {
  const rate = sel.rate.replace("From ", "");

  return (
    <div className="fade">
      <h1 className="disp font-bold text-2xl">Payment goes to escrow first.</h1>
      <div className="mt-5 rounded-xl overflow-hidden" style={{ border: `1px solid ${LINE}` }}>
        <div className="flex justify-between px-4 py-3 text-sm"><span style={{ color: MUTED }}>Base rate / call-out</span><span className="font-semibold">{sel.rate}</span></div>
        <div className="flex justify-between px-4 py-3 text-sm" style={{ borderTop: `1px solid ${LINE}` }}><span style={{ color: MUTED }}>Escrow protection</span><span className="font-semibold" style={{ color: PINE }}>Free</span></div>
        <div className="flex justify-between px-4 py-3 text-[15px] font-bold" style={{ borderTop: `1px solid ${LINE}`, background: PAPER }}>
          <span>Held until you confirm</span><span>{rate}</span>
        </div>
      </div>
      <ol className="mt-4 space-y-1.5 text-[13px] list-decimal list-inside" style={{ color: MUTED }}>
        <li>You pay now — we hold it, not the artisan.</li>
        <li>{sel.name.split(" ")[0]} does the job; you track progress in the app.</li>
        <li>You tap “Job done” — funds release. Dispute? We hold and mediate.</li>
      </ol>
      <div className="flex justify-between mt-6">
        <Btn onClick={onBack}>Back</Btn>
        <Btn primary onClick={onPay}>Pay {rate} to escrow</Btn>
      </div>
    </div>
  );
}
