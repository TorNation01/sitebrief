"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type IntakeUxMode = "technical" | "simple";

const STORAGE_KEY = "sitebrief_intake_ux_mode";
const MODE_EVENT = "sitebrief-intake-ux-mode";

function readStoredMode(): IntakeUxMode {
  if (typeof window === "undefined") {
    return "simple";
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw === "technical" ? "technical" : "simple";
  } catch {
    return "simple";
  }
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }
  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener(MODE_EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(MODE_EVENT, handler);
  };
}

function getServerSnapshot(): IntakeUxMode {
  return "simple";
}

type IntakeUxModeContextValue = {
  mode: IntakeUxMode;
  setMode: (next: IntakeUxMode) => void;
  toggleMode: () => void;
};

const IntakeUxModeContext = createContext<IntakeUxModeContextValue | null>(null);

export function IntakeUxModeProvider(props: { children: ReactNode }) {
  const mode = useSyncExternalStore(subscribe, readStoredMode, getServerSnapshot);

  const setMode = useCallback((next: IntakeUxMode) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore quota */
    }
    window.dispatchEvent(new Event(MODE_EVENT));
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode === "simple" ? "technical" : "simple");
  }, [mode, setMode]);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      toggleMode,
    }),
    [mode, setMode, toggleMode],
  );

  return <IntakeUxModeContext.Provider value={value}>{props.children}</IntakeUxModeContext.Provider>;
}

export function useIntakeUxMode(): IntakeUxModeContextValue {
  const ctx = useContext(IntakeUxModeContext);
  if (!ctx) {
    throw new Error("useIntakeUxMode must be used within IntakeUxModeProvider");
  }
  return ctx;
}
