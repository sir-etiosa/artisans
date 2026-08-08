"use client";

import { useEffect, useState } from "react";

/* Fetches the signed-in user once on mount. `loading` stays true until the
   first response lands; `user` is null if the fetch fails (caller decides
   whether that means "redirect to /auth" or just "render nothing yet"). */
export function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data?.user ?? null))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}
