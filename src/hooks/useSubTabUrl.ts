import { useState, useEffect, useCallback } from "react";

export function useSubTabUrl<T extends string>(
  basePath: string,
  validTabs: readonly T[],
  defaultTab: T
): [T, (tab: T) => void] {
  const getInitialTab = useCallback((): T => {
    if (typeof window === "undefined") return defaultTab;
    const match = window.location.pathname.match(new RegExp(`^${basePath}/([^/]+)`));
    if (match && validTabs.includes(match[1] as any)) {
      return match[1] as T;
    }
    return defaultTab;
  }, [basePath, validTabs, defaultTab]);

  const [activeTab, setActiveTabState] = useState<T>(getInitialTab);

  const setActiveTab = useCallback((tab: T) => {
    setActiveTabState(tab);
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", `${basePath}/${tab}`);
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [basePath]);

  useEffect(() => {
    const handlePopState = () => {
      setActiveTabState(getInitialTab());
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [getInitialTab]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [activeTab]);

  return [activeTab, setActiveTab];
}
