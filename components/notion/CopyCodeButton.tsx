"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="コードをコピー"
      className="absolute right-2 top-2 inline-flex items-center gap-1.5 rounded-md border border-border-primary bg-background-primary px-2 py-1 text-xs text-label-secondary opacity-0 transition-opacity hover:bg-background-secondary group-hover:opacity-100 focus:opacity-100"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-accent-info" />
          <span>コピー済み</span>
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          <span>コピー</span>
        </>
      )}
    </button>
  );
}
