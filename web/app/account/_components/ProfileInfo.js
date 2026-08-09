import { Tick } from "@/components/ui";
import { LINE, MUTED } from "@/lib/theme";
import VerificationStatus from "./VerificationStatus";

function Row({ label, value }) {
  return (
    <div className="flex justify-between py-3" style={{ borderBottom: `1px solid ${LINE}` }}>
      <span className="text-[13px]" style={{ color: MUTED }}>{label}</span>
      <span className="text-[13px] font-medium">{value}</span>
    </div>
  );
}

export default function ProfileInfo({ user, onUserUpdate }) {
  return (
    <section className="card soft p-6">
      <h2 className="disp font-bold text-[17px]">Your details</h2>
      <div className="mt-3">
        <Row label="Full name" value={user.fullName} />
        <Row label="Email" value={<>{user.email} {user.emailVerified && <Tick />}</>} />
        <Row label="Phone" value={user.phone || "—"} />
        <VerificationStatus status={user.verificationStatus} checkedAt={user.verificationCheckedAt} pending={user.hasPendingReview} onUpdate={onUserUpdate} />
      </div>
    </section>
  );
}
