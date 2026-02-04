import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function samplePassage(): string {
  const bank = [
    "Practice makes progress. Keep your fingers light and your eyes on the screen.",
    "Typing is a skill built with patience. Accuracy first, then speed will follow.",
    "Stay relaxed, sit upright, and use the home row keys to improve your typing.",
    "Short sentences help measure typing speed fairly and consistently over time.",
    "Focus on steady rhythm. Correct mistakes with backspace and continue typing.",
  ];
  return bank[Math.floor(Math.random() * bank.length)];
}

function computeStats(target: string, typed: string, ms: number) {
  const len = Math.min(typed.length, target.length);
  let correct = 0;
  for (let i = 0; i < len; i++) if (typed[i] === target[i]) correct++;
  const errors = typed.length - correct;
  const minutes = Math.max(ms / 60000, 1 / 60);
  const wpm = Math.max(0, Math.round(((correct / 5) / minutes)));
  const accuracy = typed.length === 0 ? 100 : Math.max(0, Math.round((correct / typed.length) * 100));
  const done = len === target.length && typed.length >= target.length;
  return { correct, errors, wpm, accuracy, done };
}

export default function TypingTestDialog({ skill = "Typing", durationSec = 60, passWpm = 25, onPassed }: { skill?: string; durationSec?: number; passWpm?: number; onPassed: (wpm: number) => void }) {
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<string>(samplePassage());
  const [typed, setTyped] = useState<string>("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState<number>(Date.now());
  const [finished, setFinished] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const msElapsed = startedAt ? now - startedAt : 0;
  const stats = computeStats(target, typed, msElapsed);
  const timeLeft = Math.max(0, durationSec - Math.floor(msElapsed / 1000));
  const passed = stats.wpm >= passWpm && stats.accuracy >= 85;

  useEffect(() => {
    if (!open) {
      setTarget(samplePassage());
      setTyped("");
      setStartedAt(null);
      setFinished(false);
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
      timerRef.current = null;
    }
  }, [open]);

  useEffect(() => {
    if (!startedAt || finished) return;
    let raf = 0;
    const tick = () => {
      setNow(Date.now());
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    timerRef.current = raf;
    return () => cancelAnimationFrame(raf);
  }, [startedAt, finished]);

  useEffect(() => {
    if (!finished && (stats.done || timeLeft <= 0)) {
      setFinished(true);
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
      timerRef.current = null;
      if (passed) onPassed(stats.wpm);
    }
  }, [stats.done, timeLeft, finished, passed, stats.wpm, onPassed]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!startedAt) setStartedAt(Date.now());
    if (finished) return;
    if (e.key.length === 1) {
      setTyped((t) => (t + e.key).slice(0, target.length));
    } else if (e.key === "Backspace") {
      setTyped((t) => t.slice(0, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const reset = () => {
    setTarget(samplePassage());
    setTyped("");
    setStartedAt(null);
    setFinished(false);
    inputRef.current?.focus();
  };

  const charSpans = useMemo(() => {
    const chars = target.split("");
    return chars.map((ch, idx) => {
      const typedCh = typed[idx];
      const state = typedCh == null ? "pending" : typedCh === ch ? "correct" : "wrong";
      const classes = state === "correct" ? "text-emerald-600" : state === "wrong" ? "text-red-500 bg-red-500/10" : "text-muted-foreground";
      const isCaret = idx === typed.length && !finished;
      return (
        <span key={idx} className={`px-[1px] ${classes}`}>{ch}{isCaret && <span className="inline-block w-px h-5 bg-primary align-middle animate-pulse ml-[1px]" />}</span>
      );
    });
  }, [target, typed, finished]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Typing test</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{skill} • {durationSec}s test • Pass ≥{passWpm} WPM & ≥85% accuracy</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="rounded-md border bg-muted/40 p-4 text-sm leading-7">{charSpans}</div>
          <input
            ref={inputRef}
            autoFocus
            onKeyDown={onKeyDown}
            value={""}
            onChange={() => {}}
            className="h-11 w-full rounded-md border bg-background px-3 outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="Start typing here..."
            aria-label="Typing input"
          />
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full border px-2 py-0.5">Time left: {timeLeft}s</span>
            <span className="rounded-full border px-2 py-0.5">WPM: {stats.wpm}</span>
            <span className="rounded-full border px-2 py-0.5">Accuracy: {stats.accuracy}%</span>
            <span className="rounded-full border px-2 py-0.5">Errors: {stats.errors}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {finished ? (passed ? "Passed" : "Try again") : "Type until time ends or text completes"}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={reset}>Reset</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
