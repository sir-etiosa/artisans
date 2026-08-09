const BASE_URL = "https://api.paystack.co";

function authHeaders() {
  return {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  };
}

export function isPaystackConfigured() {
  return Boolean(process.env.PAYSTACK_SECRET_KEY);
}

// amountNaira is whole naira from the user; Paystack wants the subunit (kobo).
export function nairaToKobo(amountNaira) {
  return Math.round(amountNaira * 100);
}

export async function initializeTransaction({ email, amountKobo, reference, callbackUrl, metadata }) {
  const res = await fetch(`${BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ email, amount: amountKobo, reference, callback_url: callbackUrl, metadata }),
  });
  const json = await res.json();
  return { ok: res.ok && json.status === true, data: json.data, message: json.message };
}

export async function verifyTransaction(reference) {
  const res = await fetch(`${BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: authHeaders(),
  });
  const json = await res.json();
  return { ok: res.ok && json.status === true, data: json.data, message: json.message };
}
