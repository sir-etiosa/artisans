"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const URL_ERROR_MESSAGES = {
  missing_token: "That verification link is missing its token.",
  invalid_token: "That verification link is invalid or has expired.",
};

/* All state + the signup/login submit logic for the auth page, kept out of
   the component tree so the JSX files stay focused on markup. */
export function useAuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlError = URL_ERROR_MESSAGES[searchParams.get("error")] || null;

  const [authTab, setAuthTab] = useState("signup");
  const [role, setRole] = useState("customer");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(urlError);
  const [loading, setLoading] = useState(false);

  const changeTab = (tab) => {
    setAuthTab(tab);
    setError(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (authTab === "signup") {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName, email, phone, password, role }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong");
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      } else {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong");
        router.push(data.redirectTo || "/");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    authTab, changeTab, role, setRole,
    fullName, setFullName, email, setEmail, phone, setPhone, password, setPassword,
    error, loading, submit,
  };
}
