import { createServerFn } from "@tanstack/react-start";

/**
 * Public Underdog Fantasy data — fetched server-side to avoid CORS and to
 * allow caching. Underdog does not publish a stable public API contract,
 * so we wrap calls in try/catch and always return a typed envelope so the
 * UI can degrade gracefully if the upstream shape changes.
 */

export type BbmStatus = {
  isOpen: boolean;
  tournamentName: string | null;
  totalEntrants: number | null;
  maxEntrants: number | null;
  fetchedAt: string;
};

export type BbmStatusResult =
  | { ok: true; data: BbmStatus }
  | { ok: false; error: string };

const UNDERDOG_BASE = "https://api.underdogfantasy.com";

/**
 * Try to find the current Best Ball Mania tournament from Underdog's public
 * lobby endpoints. We probe a couple of likely paths since the exact path
 * has shifted across seasons; the first one that returns BBM-ish data wins.
 */
async function fetchBbmStatus(): Promise<BbmStatus> {
  const candidates = [
    `${UNDERDOG_BASE}/v1/best_ball/tournaments`,
    `${UNDERDOG_BASE}/beta/v5/lobby`,
    `${UNDERDOG_BASE}/v1/tournaments`,
  ];

  let lastErr = "no candidate succeeded";
  for (const url of candidates) {
    try {
      const res = await fetch(url, {
        headers: {
          accept: "application/json",
          "user-agent": "bbm-scheduler/1.0",
        },
      });
      if (!res.ok) {
        lastErr = `${url} -> ${res.status}`;
        continue;
      }
      const json: unknown = await res.json();
      const found = findBbmTournament(json);
      if (found) {
        return {
          isOpen: found.isOpen,
          tournamentName: found.name,
          totalEntrants: found.entrants,
          maxEntrants: found.maxEntrants,
          fetchedAt: new Date().toISOString(),
        };
      }
      lastErr = `${url} -> no BBM tournament in response`;
    } catch (err) {
      lastErr = `${url} -> ${(err as Error).message}`;
    }
  }
  throw new Error(lastErr);
}

type FoundTournament = {
  name: string;
  isOpen: boolean;
  entrants: number | null;
  maxEntrants: number | null;
};

function findBbmTournament(payload: unknown): FoundTournament | null {
  // Walk the response looking for an object whose title/name mentions "Best
  // Ball Mania". This is intentionally defensive — the schema isn't public.
  const seen = new WeakSet<object>();
  const stack: unknown[] = [payload];
  while (stack.length) {
    const node = stack.pop();
    if (!node || typeof node !== "object") continue;
    if (seen.has(node as object)) continue;
    seen.add(node as object);

    const obj = node as Record<string, unknown>;
    const nameLike =
      (typeof obj.title === "string" && obj.title) ||
      (typeof obj.name === "string" && obj.name) ||
      (typeof obj.display_name === "string" && obj.display_name) ||
      "";
    if (typeof nameLike === "string" && /best ball mania/i.test(nameLike)) {
      const entrants =
        numOrNull(obj.entrant_count) ??
        numOrNull(obj.total_entries) ??
        numOrNull(obj.entries) ??
        null;
      const max =
        numOrNull(obj.max_entries) ??
        numOrNull(obj.maximum_entries) ??
        numOrNull(obj.size) ??
        null;
      const status =
        (typeof obj.status === "string" && obj.status) ||
        (typeof obj.state === "string" && obj.state) ||
        "";
      const isOpen = /open|active|in_progress|drafting/i.test(status) ||
        (entrants !== null && max !== null && entrants < max);
      return { name: nameLike, isOpen, entrants, maxEntrants: max };
    }

    for (const v of Object.values(obj)) {
      if (v && typeof v === "object") stack.push(v);
    }
  }
  return null;
}

function numOrNull(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

export const getBbmStatus = createServerFn({ method: "GET" }).handler(
  async (): Promise<BbmStatusResult> => {
    try {
      const data = await fetchBbmStatus();
      return { ok: true, data };
    } catch (err) {
      console.error("[underdog] getBbmStatus failed:", err);
      return { ok: false, error: (err as Error).message };
    }
  },
);