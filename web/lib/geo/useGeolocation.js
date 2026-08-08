"use client";

import { useEffect, useState } from "react";

// Real device coordinates via the browser Geolocation API — no geocoding
// service is configured, so this is raw lat/lng only, never a place name.
export function useGeolocation() {
  const [coords, setCoords] = useState(null);
  const [status, setStatus] = useState("idle"); // "idle" | "loading" | "granted" | "denied" | "unsupported"

  useEffect(() => {
    // Deferred through a microtask so the initial status transition isn't a
    // synchronous setState at the top of the effect body.
    if (!navigator.geolocation) {
      Promise.resolve().then(() => setStatus("unsupported"));
      return;
    }
    Promise.resolve().then(() => setStatus("loading"));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus("granted");
      },
      () => setStatus("denied"),
      { timeout: 10000, maximumAge: 5 * 60 * 1000 }
    );
  }, []);

  return { coords, status };
}
