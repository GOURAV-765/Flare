import React, { createContext, useContext, useEffect, useState } from "react";

const READEASE_KEY = "a11y:readease";
const READEASE_SETTINGS_KEY = "a11y:readease-settings";

export interface ReadEasySettings {
  fontSize: number; // 80-150% (multiplier)
  lineHeight: number; // 1.2-2.0
  letterSpacing: number; // 0-0.3em
  wordSpacing: number; // 0-0.15em
}

const DEFAULT_SETTINGS: ReadEasySettings = {
  fontSize: 100,
  lineHeight: 1.65,
  letterSpacing: 0.02,
  wordSpacing: 0.08,
};

interface DyslexiaContextType {
  readEasyMode: boolean;
  setReadEasyMode: (enabled: boolean) => void;
  readEasySettings: ReadEasySettings;
  updateReadEasySettings: (settings: Partial<ReadEasySettings>) => void;
  resetReadEasySettings: () => void;
  announceSection: (title: string, description?: string) => void;
}

const DyslexiaContext = createContext<DyslexiaContextType | undefined>(undefined);

export function DyslexiaProvider({ children }: { children: React.ReactNode }) {
  const [readEasyMode, setReadEasyModeSt] = useState(true); // Auto-enabled by default
  const [readEasySettings, setReadEasySettingsSt] = useState<ReadEasySettings>(DEFAULT_SETTINGS);
  const [announcerReady, setAnnouncerReady] = useState(false);

  useEffect(() => {
    // Load from localStorage if user has set a preference
    const storedMode = localStorage.getItem(READEASE_KEY);
    if (storedMode !== null) {
      setReadEasyModeSt(storedMode === "1");
    }

    const storedSettings = localStorage.getItem(READEASE_SETTINGS_KEY);
    if (storedSettings) {
      try {
        const parsed = JSON.parse(storedSettings);
        setReadEasySettingsSt({ ...DEFAULT_SETTINGS, ...parsed });
      } catch {}
    }
    setAnnouncerReady(true);
  }, []);

  const setReadEasyMode = (enabled: boolean) => {
    setReadEasyModeSt(enabled);
    localStorage.setItem(READEASE_KEY, enabled ? "1" : "0");
    document.documentElement.classList.toggle("a11y-dyslexic", enabled);
    applyReadEasyStyles(enabled, readEasySettings);
  };

  const updateReadEasySettings = (newSettings: Partial<ReadEasySettings>) => {
    const updated = { ...readEasySettings, ...newSettings };
    setReadEasySettingsSt(updated);
    localStorage.setItem(READEASE_SETTINGS_KEY, JSON.stringify(updated));
    applyReadEasyStyles(readEasyMode, updated);
  };

  const resetReadEasySettings = () => {
    setReadEasySettingsSt(DEFAULT_SETTINGS);
    localStorage.setItem(READEASE_SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
    applyReadEasyStyles(readEasyMode, DEFAULT_SETTINGS);
  };

  const applyReadEasyStyles = (enabled: boolean, settings: ReadEasySettings) => {
    const root = document.documentElement;
    if (enabled) {
      root.style.setProperty("--readease-font-size", `${settings.fontSize}%`);
      root.style.setProperty("--readease-line-height", `${settings.lineHeight}`);
      root.style.setProperty("--readease-letter-spacing", `${settings.letterSpacing}em`);
      root.style.setProperty("--readease-word-spacing", `${settings.wordSpacing}em`);
    } else {
      root.style.removeProperty("--readease-font-size");
      root.style.removeProperty("--readease-line-height");
      root.style.removeProperty("--readease-letter-spacing");
      root.style.removeProperty("--readease-word-spacing");
    }
  };

  const announceSection = (title: string, description?: string) => {
    const sr = document.getElementById("a11y-announcer");
    if (sr) {
      sr.textContent = description ? `${title}. ${description}` : title;
    }
  };

  useEffect(() => {
    // Apply on mount and when changed
    document.documentElement.classList.toggle("a11y-dyslexic", readEasyMode);
    localStorage.setItem(READEASE_KEY, readEasyMode ? "1" : "0");
    applyReadEasyStyles(readEasyMode, readEasySettings);
  }, [readEasyMode, readEasySettings]);

  return (
    <DyslexiaContext.Provider
      value={{
        readEasyMode,
        setReadEasyMode,
        readEasySettings,
        updateReadEasySettings,
        resetReadEasySettings,
        announceSection
      }}
    >
      {announcerReady && children}
    </DyslexiaContext.Provider>
  );
}

export function useDyslexia() {
  const context = useContext(DyslexiaContext);
  if (!context) {
    throw new Error("useDyslexia must be used within DyslexiaProvider");
  }
  return context;
}
