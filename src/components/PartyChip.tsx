import { partyStyle } from "@/lib/parties";

// A party-coloured chip (colour cue, not the trademarked symbol).
export function PartyChip({ party, full = false }: { party: string; full?: boolean }) {
  const s = partyStyle(party);
  if (full) {
    return (
      <span
        className="inline-flex max-w-full items-center truncate rounded-full px-2 py-0.5 text-xs font-medium"
        style={{ background: s.color, color: s.fg }}
      >
        {party}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 truncate">
      <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
      <span className="truncate">{party}</span>
    </span>
  );
}
