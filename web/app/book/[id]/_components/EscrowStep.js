import { Btn } from "@/components/ui";
import { LINE, MUTED, PAPER, PINE, RED } from "@/lib/theme";
import { computeBookingFee } from "@/lib/booking/fee";
import { NAIRA_PER_ART } from "@/lib/art/constants";

export default function EscrowStep({ sel, onBack, onPay, paying, error, amountNaira, setAmountNaira, balanceArt }) {
  const amount = Number(amountNaira) || 0;
  const { platformFeeNaira, payoutNaira } = computeBookingFee(amount);
  const validAmount = amount > 0;
  const requiredArt = amount / NAIRA_PER_ART;
  const insufficientBalance = balanceArt != null && requiredArt > balanceArt;

  return (
    <div className="fade">
      <h1 className="disp font-bold text-2xl">Payment goes to escrow first.</h1>
      <div className="mt-5">
        <label className="label" htmlFor="agreed-price">Agreed price (₦)</label>
        <input
          id="agreed-price" type="number" min="1" className="field"
          value={amountNaira} onChange={(e) => setAmountNaira(e.target.value)}
          placeholder={sel.rate}
        />
        {balanceArt != null && (
          <p className="text-[12px] mt-1" style={{ color: insufficientBalance ? RED : MUTED }}>
            Your balance: {balanceArt.toLocaleString()} ART (₦{(balanceArt * NAIRA_PER_ART).toLocaleString()})
            {insufficientBalance && " — not enough for this job. Deposit more first."}
          </p>
        )}
      </div>
      <div className="mt-3 rounded-xl overflow-hidden" style={{ border: `1px solid ${LINE}` }}>
        <div className="flex justify-between px-4 py-3 text-sm"><span style={{ color: MUTED }}>Job price</span><span className="font-semibold">₦{amount.toLocaleString()}</span></div>
        <div className="flex justify-between px-4 py-3 text-sm" style={{ borderTop: `1px solid ${LINE}` }}><span style={{ color: MUTED }}>Escrow protection</span><span className="font-semibold" style={{ color: PINE }}>Free</span></div>
        <div className="flex justify-between px-4 py-3 text-sm" style={{ borderTop: `1px solid ${LINE}` }}><span style={{ color: MUTED }}>Platform fee (20%, charged on completion)</span><span className="font-semibold">₦{platformFeeNaira.toLocaleString()}</span></div>
        <div className="flex justify-between px-4 py-3 text-sm" style={{ borderTop: `1px solid ${LINE}` }}><span style={{ color: MUTED }}>{sel.name.split(" ")[0]} receives</span><span className="font-semibold">₦{payoutNaira.toLocaleString()}</span></div>
        <div className="flex justify-between px-4 py-3 text-[15px] font-bold" style={{ borderTop: `1px solid ${LINE}`, background: PAPER }}>
          <span>Held until you confirm</span><span>₦{amount.toLocaleString()}</span>
        </div>
      </div>
      <ol className="mt-4 space-y-1.5 text-[13px] list-decimal list-inside" style={{ color: MUTED }}>
        <li>You pay now — real ART moves to escrow, not to {sel.name.split(" ")[0]} directly.</li>
        <li>{sel.name.split(" ")[0]} does the job; you track progress in the app.</li>
        <li>You tap “Job done” — escrow releases. Dispute or no-show? We step in and resolve it.</li>
      </ol>
      {error && <p className="text-[13px] font-medium mt-3" style={{ color: RED }}>{error}</p>}
      <div className="flex justify-between mt-6">
        <Btn onClick={onBack} disabled={paying}>Back</Btn>
        <Btn primary onClick={onPay} disabled={paying || !validAmount || insufficientBalance} style={{ opacity: paying || !validAmount || insufficientBalance ? 0.6 : 1 }}>
          {paying ? "Booking…" : `Pay ₦${amount.toLocaleString()} to escrow`}
        </Btn>
      </div>
    </div>
  );
}
