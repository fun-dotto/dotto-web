"use client";

import { useState } from "react";

type Level = 1 | 2 | 3;

export function CopyableHeading({
  blockId,
  level,
  children,
}: {
  blockId: string;
  level: Level;
  children: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    const url = `${window.location.origin}${window.location.pathname}#${blockId}`;
    try {
      await navigator.clipboard.writeText(url);
      window.history.replaceState(null, "", `#${blockId}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const prefix = "#".repeat(level);
  const headingClass = {
    1: "mb-4 mt-8 text-3xl font-bold tracking-tight text-label-primary",
    2: "mb-3 mt-6 text-2xl font-semibold tracking-tight text-label-primary",
    3: "mb-2 mt-5 text-xl font-semibold text-label-primary",
  }[level];

  const content = (
    <button
      type="button"
      onClick={handleClick}
      aria-label="このブロックへのリンクをコピー"
      className="group flex w-full items-baseline gap-2 text-left"
    >
      <span
        aria-hidden="true"
        className="font-mono text-label-primary select-none"
      >
        {prefix}
      </span>
      <span className="flex-1">{children}</span>
      {copied && (
        <span className="text-xs text-accent-info shrink-0">コピーしました</span>
      )}
    </button>
  );

  if (level === 1) return <h1 className={headingClass}>{content}</h1>;
  if (level === 2) return <h2 className={headingClass}>{content}</h2>;
  return <h3 className={headingClass}>{content}</h3>;
}
