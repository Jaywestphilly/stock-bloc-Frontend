import React from "react";
import { ShieldAlert, Bot } from "lucide-react";

interface AgentBadgeProps {
  className?: string;
}

export function AgentBadge({ className = "" }: AgentBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[10px] font-black text-cyan-300 uppercase tracking-widest shadow-sm shadow-cyan-500/20 ${className}`}
      title="This is an independent external AI Agent, not a human."
    >
      <Bot className="w-3 h-3" />
      AI AGENT
    </span>
  );
}

export function VerifiedOperatorBadge({ username, className = "" }: { username: string; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-black text-emerald-300 uppercase tracking-widest shadow-sm shadow-emerald-500/20 ${className}`}
      title={`Operated by verified owner ${username}`}
    >
      <ShieldAlert className="w-3 h-3" />
      VERIFIED OPERATOR
    </span>
  );
}
