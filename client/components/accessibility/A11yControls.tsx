import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Accessibility } from "lucide-react";
import { useTheme } from "next-themes";
import { useDyslexia } from "@/lib/DyslexiaContext";
import ReadEasySettings from "./ReadEasySettings";

const CONTRAST_KEY = "a11y:contrast";
const TTS_KEY = "a11y:tts";
const CVD_KEY = "a11y:cvd";
const TTS_HOVER_KEY = "a11y:ttsHover";
const SIGN_HOVER_KEY = "a11y:signHover";

export default function A11yControls({ className }: { className?: string }) {
  const { readEasyMode, setReadEasyMode } = useDyslexia();
  const [contrast, setContrast] = useState(false);
  const [tts, setTts] = useState(false);
  const [ttsHover, setTtsHover] = useState(false);
  const [cvd, setCvd] = useState(false);
  const [signHover, setSignHover] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setContrast(localStorage.getItem(CONTRAST_KEY) === "1");
    setTts(localStorage.getItem(TTS_KEY) === "1");
    setCvd(localStorage.getItem(CVD_KEY) === "1");
    setTtsHover(localStorage.getItem(TTS_HOVER_KEY) === "1");
    setSignHover(localStorage.getItem(SIGN_HOVER_KEY) === "1");

    // Remove any previous letter-spacing settings
    document.documentElement.style.setProperty("--a11y-letter-spacing", "0em");
    try { localStorage.removeItem("a11y:letter"); } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("a11y-contrast", contrast);
    localStorage.setItem(CONTRAST_KEY, contrast ? "1" : "0");
  }, [contrast]);

  useEffect(() => {
    localStorage.setItem(TTS_KEY, tts ? "1" : "0");
  }, [tts]);

  useEffect(() => {
    localStorage.setItem(TTS_HOVER_KEY, ttsHover ? "1" : "0");
  }, [ttsHover]);

  useEffect(() => {
    localStorage.setItem(SIGN_HOVER_KEY, signHover ? "1" : "0");
  }, [signHover]);

  useEffect(() => {
    let currentEl: HTMLElement | null = null;
    const main = document.getElementById("main");
    if (!main) return;

    const findReadable = (el: HTMLElement): HTMLElement | null => {
      const tags = ["P","LI","H1","H2","H3","H4","H5","H6","A","BUTTON","LABEL","SPAN","DIV"];
      let node: HTMLElement | null = el;
      while (node && node !== document.body && node !== main.parentElement) {
        if (tags.includes(node.tagName)) {
          const txt = (node.innerText || "").trim();
          if (txt.length >= 3) return node;
        }
        node = node.parentElement as HTMLElement | null;
      }
      return null;
    };

    const onOver = (e: MouseEvent) => {
      if (!tts || !ttsHover) return;
      const el = findReadable(e.target as HTMLElement);
      if (!el) return;
      if (currentEl === el) return;
      currentEl?.classList.remove("tts-reading");
      window.speechSynthesis.cancel();
      const text = el.innerText.trim();
      if (!text) return;
      currentEl = el;
      el.classList.add("tts-reading");
      const utter = new SpeechSynthesisUtterance(text);
      utter.onend = () => {
        if (currentEl === el) {
          el.classList.remove("tts-reading");
          currentEl = null;
        }
      };
      window.speechSynthesis.speak(utter);
    };

    const onLeave = (e: MouseEvent) => {
      const rt = e.relatedTarget as Node | null;
      if (currentEl && (!rt || !currentEl.contains(rt))) {
        window.speechSynthesis.cancel();
        currentEl.classList.remove("tts-reading");
        currentEl = null;
      }
    };

    main.addEventListener("mouseover", onOver);
    main.addEventListener("mouseleave", onLeave);
    return () => {
      main.removeEventListener("mouseover", onOver);
      main.removeEventListener("mouseleave", onLeave);
      if (currentEl) currentEl.classList.remove("tts-reading");
      window.speechSynthesis.cancel();
    };
  }, [tts, ttsHover]);

  // Fingerspelling (sign language) on hover
  useEffect(() => {
    let currentEl: HTMLElement | null = null;
    let overlay: HTMLDivElement | null = null;
    const main = document.getElementById("main");
    if (!main) return;

    const ensureOverlay = () => {
      if (overlay) return overlay;
      overlay = document.createElement("div");
      overlay.id = "asl-hover-overlay";
      overlay.className = "asl-overlay";
      overlay.setAttribute("aria-hidden", "true");
      document.body.appendChild(overlay);
      return overlay;
    };

    const clearOverlay = () => {
      if (overlay) {
        overlay.style.display = "none";
        overlay.innerHTML = "";
      }
      if (currentEl) {
        currentEl.classList.remove("sign-reading");
        currentEl = null;
      }
    };

    const findReadable = (el: HTMLElement): HTMLElement | null => {
      const tags = ["P","LI","H1","H2","H3","H4","H5","H6","A","BUTTON","LABEL","SPAN","DIV"];
      let node: HTMLElement | null = el;
      while (node && node !== document.body && node !== main.parentElement) {
        if (tags.includes(node.tagName)) {
          const txt = (node.innerText || "").trim();
          if (txt.length >= 3) return node;
        }
        node = node.parentElement as HTMLElement | null;
      }
      return null;
    };

    const buildFingerspelling = (text: string) => {
      const ov = ensureOverlay();
      ov.innerHTML = "";
      const container = document.createElement("div");
      container.className = "asl-container";
      const words = text.replace(/\s+/g, " ").trim().split(" ").slice(0, 20);
      for (const w of words) {
        const wordEl = document.createElement("div");
        wordEl.className = "asl-word";
        const letters = w.split("").slice(0, 20);
        for (const ch of letters) {
          const span = document.createElement("span");
          span.className = "asl-letter";
          const norm = ch.normalize("NFD").replace(/[^\p{L}]/gu, "").toUpperCase();
          if (norm && /[A-Z]/.test(norm)) {
            const img = document.createElement("img");
            img.className = "asl-img";
            // Use Wikimedia Commons Special:FilePath to resolve raw SVG for each letter
            img.src = `https://commons.wikimedia.org/wiki/Special:FilePath/Sign_language_${norm}.svg`;
            img.alt = `ASL letter ${norm} (Gallaudet)`;
            img.loading = "lazy";
            span.appendChild(img);
          } else {
            span.textContent = ch;
          }
          wordEl.appendChild(span);
        }
        container.appendChild(wordEl);
      }
      ov.appendChild(container);
      ov.style.display = "block";
    };

    const onOver = (e: MouseEvent) => {
      if (!signHover) return;
      const el = findReadable(e.target as HTMLElement);
      if (!el) return;
      if (currentEl !== el) {
        currentEl?.classList.remove("sign-reading");
        currentEl = el;
        el.classList.add("sign-reading");
      }
      const text = (el.innerText || "").trim().slice(0, 240);
      if (!text) return;
      buildFingerspelling(text);
      onMove(e);
    };

    const onMove = (e: MouseEvent) => {
      if (!signHover || !overlay) return;
      const pad = 12;
      const { innerWidth: vw, innerHeight: vh } = window;
      let x = e.clientX + pad;
      let y = e.clientY + pad;
      const rect = overlay.getBoundingClientRect();
      if (x + rect.width > vw - 8) x = e.clientX - rect.width - pad;
      if (y + rect.height > vh - 8) y = e.clientY - rect.height - pad;
      overlay.style.left = `${Math.max(8, x)}px`;
      overlay.style.top = `${Math.max(8, y)}px`;
    };

    const onLeave = () => {
      clearOverlay();
    };

    if (signHover) {
      ensureOverlay();
      main.addEventListener("mouseover", onOver);
      main.addEventListener("mousemove", onMove);
      main.addEventListener("mouseleave", onLeave);
    }

    return () => {
      main.removeEventListener("mouseover", onOver);
      main.removeEventListener("mousemove", onMove);
      main.removeEventListener("mouseleave", onLeave);
      clearOverlay();
      if (overlay && overlay.parentElement) overlay.parentElement.removeChild(overlay);
      overlay = null;
    };
  }, [signHover]);


  useEffect(() => {
    document.documentElement.classList.toggle("a11y-cvd", cvd);
    localStorage.setItem(CVD_KEY, cvd ? "1" : "0");
  }, [cvd]);

  const speakMain = () => {
    const el = document.getElementById("main");
    if (!el) return;
    const utter = new SpeechSynthesisUtterance(el.innerText);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
    const sr = document.getElementById("a11y-status");
    if (sr) sr.textContent = "Reading page content";
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn("gap-2", className)} aria-label="Accessibility settings">
          <Accessibility className="h-4 w-4" />
          Accessibility
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-h-[80vh] overflow-y-auto" align="end">
        <div className="flex flex-col gap-4 pr-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Dark mode</p>
              <p className="text-sm text-muted-foreground">Reduce glare in low light.</p>
            </div>
            <Switch checked={theme === "dark"} onCheckedChange={(v) => setTheme(v ? "dark" : "light")} aria-label="Toggle dark mode" />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">ReadEasy Mode</p>
              <p className="text-sm text-muted-foreground">Friendly fonts, spacing, and auto announcements for dyslexia support.</p>
            </div>
            <Switch checked={readEasyMode} onCheckedChange={(v) => setReadEasyMode(!!v)} aria-label="Toggle ReadEasy Mode" />
          </div>
          <ReadEasySettings />
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">High contrast</p>
              <p className="text-sm text-muted-foreground">Stronger colors and thicker focus ring.</p>
            </div>
            <Switch checked={contrast} onCheckedChange={(v) => setContrast(!!v)} aria-label="Toggle high contrast" />
          </div>


          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Color-blind friendly</p>
              <p className="text-sm text-muted-foreground">Safer palette and patterns.</p>
            </div>
            <Switch checked={cvd} onCheckedChange={(v) => setCvd(!!v)} aria-label="Toggle color-blind friendly mode" />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Text to speech</p>
              <p className="text-sm text-muted-foreground">Read main content aloud.</p>
            </div>
            <Switch checked={tts} onCheckedChange={(v) => setTts(!!v)} aria-label="Toggle text to speech" />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Read on hover</p>
              <p className="text-sm text-muted-foreground">Start reading the section you hover.</p>
            </div>
            <Switch checked={ttsHover} onCheckedChange={(v) => setTtsHover(!!v)} aria-label="Toggle read on hover" />
          </div>
          <div className="grid grid-cols-3 gap-2" aria-hidden={!tts}>
            <Button variant="outline" size="sm" onClick={speakMain} disabled={!tts} aria-label="Play">Play</Button>
            <Button variant="outline" size="sm" onClick={() => window.speechSynthesis.pause()} disabled={!tts} aria-label="Pause">Pause</Button>
            <Button variant="outline" size="sm" onClick={() => window.speechSynthesis.cancel()} disabled={!tts} aria-label="Stop">Stop</Button>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Sign on hover</p>
              <p className="text-sm text-muted-foreground">Fingerspell hovered text visually.</p>
            </div>
            <Switch checked={signHover} onCheckedChange={(v) => setSignHover(!!v)} aria-label="Toggle sign on hover" />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
