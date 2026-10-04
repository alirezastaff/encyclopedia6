"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const fetchStartedEvent = "sse-page-fetch-started";
const fetchSettledEvent = "sse-page-fetch-settled";

function isAiSearchPage(pathname: string, search: string) {
  return pathname.endsWith("/knowledge-graph") && new URLSearchParams(search).get("ai") === "1";
}

export default function PageTransition() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const currentPath = useRef(pathname);
  const navigationCycle = useRef(0);
  const pendingFetches = useRef(0);

  useLayoutEffect(() => {
    const originalFetch = window.fetch.bind(window);
    const trackedFetch: typeof window.fetch = (...args) => {
      pendingFetches.current += 1;
      window.dispatchEvent(new Event(fetchStartedEvent));
      return originalFetch(...args).finally(() => {
        pendingFetches.current -= 1;
        window.dispatchEvent(new Event(fetchSettledEvent));
      });
    };

    window.fetch = trackedFetch;
    return () => {
      if (window.fetch === trackedFetch) window.fetch = originalFetch;
    };
  }, []);

  function waitForPageReady(cycle: number) {
    return new Promise<void>((resolve) => {
      let quietTimer: number | undefined;

      const cleanup = () => {
        if (quietTimer !== undefined) window.clearTimeout(quietTimer);
        window.clearTimeout(maxWaitTimer);
        observer.disconnect();
        document.removeEventListener("load", onActivity, true);
        document.removeEventListener("error", onActivity, true);
        window.removeEventListener(fetchStartedEvent, onActivity);
        window.removeEventListener(fetchSettledEvent, onActivity);
        resolve();
      };

      const visibleImagesReady = () => Array.from(document.images).every((image) => {
        if (image.loading === "lazy") {
          const bounds = image.getBoundingClientRect();
          if (bounds.bottom < 0 || bounds.top > window.innerHeight || bounds.right < 0 || bounds.left > window.innerWidth) return true;
        }
        return image.complete;
      });

      const finishAfterQuiet = () => {
        if (cycle !== navigationCycle.current) {
          cleanup();
          return;
        }
        const fontsReady = !document.fonts || document.fonts.status === "loaded";
        if (pendingFetches.current !== 0 || !visibleImagesReady() || !fontsReady) {
          if (quietTimer !== undefined) window.clearTimeout(quietTimer);
          quietTimer = undefined;
          return;
        }
        if (quietTimer === undefined) {
          quietTimer = window.setTimeout(async () => {
            const images = Array.from(document.images).filter((image) => {
              if (image.loading !== "lazy") return true;
              const bounds = image.getBoundingClientRect();
              return bounds.bottom >= 0 && bounds.top <= window.innerHeight && bounds.right >= 0 && bounds.left <= window.innerWidth;
            });
            await Promise.all(images.map((image) => image.decode?.().catch(() => undefined)));
            if (cycle === navigationCycle.current && pendingFetches.current === 0 && visibleImagesReady()) setVisible(false);
            cleanup();
          }, 450);
        }
      };

      const onActivity = () => {
        if (quietTimer !== undefined) window.clearTimeout(quietTimer);
        quietTimer = undefined;
        finishAfterQuiet();
      };

      const observer = new MutationObserver(onActivity);
      observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["src", "class", "style"] });
      document.addEventListener("load", onActivity, true);
      document.addEventListener("error", onActivity, true);
      window.addEventListener(fetchStartedEvent, onActivity);
      window.addEventListener(fetchSettledEvent, onActivity);
      const maxWaitTimer = window.setTimeout(() => {
        if (cycle === navigationCycle.current) setVisible(false);
        cleanup();
      }, 20000);

      if (document.fonts?.status !== "loaded") {
        void document.fonts?.ready.then(onActivity).catch(onActivity);
      }
      finishAfterQuiet();
    });
  }

  useEffect(() => {
    const showOnNavigation = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin || destination.pathname === window.location.pathname) return;
      if (isAiSearchPage(destination.pathname, destination.search)) return;
      navigationCycle.current += 1;
      setVisible(true);
    };

    const showOnHistoryNavigation = () => {
      if (isAiSearchPage(window.location.pathname, window.location.search)) return;
      navigationCycle.current += 1;
      setVisible(true);
    };
    document.addEventListener("click", showOnNavigation, true);
    window.addEventListener("popstate", showOnHistoryNavigation);

    return () => {
      document.removeEventListener("click", showOnNavigation, true);
      window.removeEventListener("popstate", showOnHistoryNavigation);
    };
  }, []);

  useEffect(() => {
    if (currentPath.current === pathname) return;
    currentPath.current = pathname;
    navigationCycle.current += 1;
    if (isAiSearchPage(pathname, window.location.search)) {
      return;
    }
    const cycle = navigationCycle.current;
    requestAnimationFrame(() => {
      if (cycle !== navigationCycle.current) return;
      setVisible(true);
      void waitForPageReady(cycle);
    });
  }, [pathname]);

  useEffect(() => {
    if (document.readyState === "complete") {
      void waitForPageReady(navigationCycle.current);
      return;
    }
    const beginWhenLoaded = () => void waitForPageReady(navigationCycle.current);
    window.addEventListener("load", beginWhenLoaded, { once: true });
    return () => window.removeEventListener("load", beginWhenLoaded);
  }, []);

  return (
    <>
      <div className={`page-transition-veil${visible ? " is-visible" : ""}`} aria-hidden="true">
        <div className="page-transition-content">
          <strong className="page-transition-brand">SSE Knowledge Platform</strong>
          <span className="page-transition-track"><span className="page-transition-progress" /></span>
        </div>
      </div>
      <noscript>
        <style>{`.page-transition-veil{display:none!important}`}</style>
      </noscript>
    </>
  );
}
