// Platform fee is charged only on completed jobs — never on pending,
// declined, or cancelled bookings, and never framed as tax collection.
export const PLATFORM_FEE_RATE = 0.2;

export function computeBookingFee(amountNaira) {
  const platformFeeNaira = Math.round(amountNaira * PLATFORM_FEE_RATE);
  const payoutNaira = amountNaira - platformFeeNaira;
  return { platformFeeNaira, payoutNaira };
}
