"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const POLL_MS = 8000;

export function useThread(conversationId) {
  const router = useRouter();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const pollRef = useRef(null);

  const load = useCallback(() => {
    fetch(`/api/messages/conversations/${conversationId}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        setConversation(data.conversation);
        setMessages(data.messages);
      })
      .catch(() => router.replace("/messages"));
  }, [conversationId, router]);

  useEffect(() => {
    load();
    pollRef.current = setInterval(load, POLL_MS);
    return () => clearInterval(pollRef.current);
  }, [load]);

  const send = async (body) => {
    setSending(true);
    try {
      const res = await fetch(`/api/messages/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (res.ok) load();
    } finally {
      setSending(false);
    }
  };

  return { conversation, messages, send, sending };
}
