"use client";

import { useEffect, useState } from "react";

export function useDashboard() {
  const [profile, setProfile] = useState(undefined); // undefined = loading, null = none yet
  const [bookings, setBookings] = useState([]);
  const [ownArtisanProfileId, setOwnArtisanProfileId] = useState(null);

  const load = () => {
    fetch("/api/artisan-profiles/me")
      .then((res) => (res.ok ? res.json() : { profile: null }))
      .then((data) => setProfile(data.profile));
    fetch("/api/bookings")
      .then((res) => (res.ok ? res.json() : { bookings: [], ownArtisanProfileId: null }))
      .then((data) => {
        setBookings(data.bookings);
        setOwnArtisanProfileId(data.ownArtisanProfileId);
      });
  };

  useEffect(() => { load(); }, []);

  return { profile, bookings, ownArtisanProfileId, reload: load };
}
