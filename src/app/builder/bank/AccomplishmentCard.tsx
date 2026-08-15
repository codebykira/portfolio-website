"use client";

import type { Accomplishment } from "../lib/types";

interface Props {
  item: Accomplishment;
  onDelete: (id: string) => void;
}

export default function AccomplishmentCard({ item, onDelete }: Props) {
  return (
    <div className="lego-card p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm leading-relaxed" style={{ color: "var(--ink)" }}>
          {item.polished || item.raw_note}
        </p>
        <button
          onClick={() => onDelete(item.id)}
          className="pixel shrink-0 text-xs"
          style={{ color: "var(--muted)" }}
          aria-label="Delete brick"
        >
          ✕
        </button>
      </div>

      {(item.metrics.length > 0 || item.themes.length > 0 || item.skills.length > 0) && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.metrics
            .filter((m) => m.value)
            .map((m, i) => (
              <span key={`m${i}`} className="lego-tag lego-tag--metric">
                {m.label}: {m.value}
              </span>
            ))}
          {item.skills.map((s, i) => (
            <span key={`s${i}`} className="lego-tag">
              {s}
            </span>
          ))}
          {item.themes.map((t, i) => (
            <span key={`t${i}`} className="lego-tag" style={{ background: "#eef2ff" }}>
              #{t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
