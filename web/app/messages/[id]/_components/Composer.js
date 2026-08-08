"use client";

import { useState } from "react";
import { Btn } from "@/components/ui";

export default function Composer({ onSend, sending }) {
  const [text, setText] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <form onSubmit={submit} className="flex gap-2 items-end mt-4">
      <textarea
        rows={1}
        className="field flex-1"
        placeholder="Write a message…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) submit(e);
        }}
      />
      <Btn primary type="submit" disabled={sending || !text.trim()} style={{ opacity: sending || !text.trim() ? 0.6 : 1 }}>
        Send
      </Btn>
    </form>
  );
}
