"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { normalizeTrackedPathname, resolvePageViewTarget } from "@/lib/page-views";

const DEDUPE_WINDOW_MS = 1000;

function markRecentlyTracked(pathname: string) {
  try {
    const storageKey = `page-view:${pathname}`;
    const now = Date.now();
    const previous = Number(sessionStorage.getItem(storageKey) ?? "0");

    if (now - previous < DEDUPE_WINDOW_MS) {
      return false;
    }

    sessionStorage.setItem(storageKey, String(now));
    return true;
  } catch {
    return true;
  }
}

export function PageViewTracker() {
  const pathname = usePathname();
  const lastTrackedPathnameRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) {
      return;
    }

    const normalizedPathname = normalizeTrackedPathname(pathname);

    if (!resolvePageViewTarget(normalizedPathname)) {
      return;
    }

    if (lastTrackedPathnameRef.current === normalizedPathname) {
      return;
    }

    if (!markRecentlyTracked(normalizedPathname)) {
      lastTrackedPathnameRef.current = normalizedPathname;
      return;
    }

    lastTrackedPathnameRef.current = normalizedPathname;

    const payload = JSON.stringify({ pathname: normalizedPathname });

    if (navigator.sendBeacon) {
      const sent = navigator.sendBeacon(
        "/api/analytics/page-view",
        new Blob([payload], {
          type: "application/json",
        }),
      );

      if (sent) {
        return;
      }
    }

    void fetch("/api/analytics/page-view", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: payload,
      cache: "no-store",
      keepalive: true,
    }).catch(() => {
      // Access counting should never block page interaction.
    });
  }, [pathname]);

  return null;
}
