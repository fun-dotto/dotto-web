"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyMarkdownButton({ markdown }: { markdown: string }) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
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
      aria-label="ページをマークダウンでコピー"
      className="inline-flex items-center gap-1.5 rounded-md border border-border-primary bg-background-primary px-2.5 py-1.5 text-xs text-label-secondary transition-colors hover:bg-background-secondary"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-accent-info" />
          <span>コピー済み</span>
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          <span>Markdown</span>
        </>
      )}
    </button>
  );
}
