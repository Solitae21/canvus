"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Send, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { selectIsPanelOpen, setPanel } from "@/redux/slice/ui/ui-slice";
import { selectChatMessages } from "@/redux/slice/chat/chat-slice";
import { useYjsCanvas } from "./use-yjs";
import { getGuestIdentity } from "@/lib/guest";
import { getInitials } from "@/lib/random-name";

const formatStamp = (ts: number): string => {
  const d = new Date(ts);
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
};

export default function ChatPanel() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectIsPanelOpen("chat"));
  const messages = useAppSelector(selectChatMessages);
  const { appendChatMessage } = useYjsCanvas();
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const selfId = useMemo(() => getGuestIdentity().userId, []);

  useEffect(() => {
    if (!isOpen) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [isOpen, messages.length]);

  if (!isOpen) return null;

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    appendChatMessage(trimmed);
    setDraft("");
  };

  return (
    <div
      className="fixed right-4 bottom-24 z-40 flex flex-col w-80 h-96
                 bg-surface-container/85 backdrop-blur-[24px]
                 border border-white/[0.08] rounded-2xl
                 shadow-[0_12px_48px_rgba(0,0,0,0.5)]
                 text-on-surface"
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06]">
        <span className="text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant">
          Chat
        </span>
        <button
          onClick={() => dispatch(setPanel({ panel: "chat", open: false }))}
          title="Close chat"
          className="flex items-center justify-center w-7 h-7 rounded-lg
                     text-on-surface-variant hover:text-on-surface hover:bg-white/[0.06]
                     transition-colors duration-150"
        >
          <X size={14} />
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto px-3 py-2 space-y-2"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[12px] text-on-surface-variant/60">
            No messages yet.
          </div>
        ) : (
          messages.map((m) => {
            const isSelf = m.senderId === selfId;
            return (
              <div
                key={m.id}
                className={`flex items-start gap-2 ${isSelf ? "flex-row-reverse" : ""}`}
              >
                <div
                  className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center
                             text-[10px] font-bold text-on-primary"
                  style={{ background: m.senderColor }}
                >
                  {getInitials(m.senderName)}
                </div>
                <div className={`flex-1 ${isSelf ? "text-right" : ""}`}>
                  <div className="flex items-center gap-1.5 text-[10.5px] text-on-surface-variant/70">
                    <span className="font-medium">{m.senderName}</span>
                    <span className="tabular-nums">{formatStamp(m.timestamp)}</span>
                  </div>
                  <div
                    className={`inline-block mt-0.5 px-2.5 py-1.5 rounded-lg text-[12.5px] break-words max-w-[220px]
                               ${
                                 isSelf
                                   ? "bg-primary-container/40 text-on-surface"
                                   : "bg-white/[0.06] text-on-surface"
                               }`}
                  >
                    {m.text}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex items-center gap-1.5 p-2 border-t border-white/[0.06]">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a message…"
          maxLength={1000}
          className="flex-1 bg-white/[0.06] rounded-lg px-2.5 py-1.5 text-[12.5px]
                     text-on-surface placeholder:text-on-surface-variant/50
                     outline-none border border-transparent focus:border-primary/40
                     transition-colors duration-150"
        />
        <button
          onClick={handleSend}
          disabled={!draft.trim()}
          title="Send (Enter)"
          className="flex items-center justify-center w-9 h-9 rounded-lg
                     bg-primary-container text-on-primary
                     hover:brightness-110 active:scale-[0.97]
                     disabled:opacity-40 disabled:pointer-events-none
                     transition-all duration-150"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
