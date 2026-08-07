import { randomBytes } from "crypto";

export function generateToken() {
  return randomBytes(32).toString("hex");
}

export function expiresInMinutes(minutes) {
  return new Date(Date.now() + minutes * 60 * 1000);
}
