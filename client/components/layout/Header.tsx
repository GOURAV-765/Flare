import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import A11yControls from "@/components/accessibility/A11yControls";
import { useEffect, useState } from "react";

export default function Header({ className }: { className?: string }) {
  const [points, setPoints] = useState<number>(0);
  useEffect(() => {
    const refresh = () => {
      try {
        const raw = localStorage.getItem("learning:state");
        const total = raw ? (JSON.parse(raw).totalPoints ?? 0) : 0;
        setPoints(total);
      } catch {}
    };
    refresh();
    window.addEventListener("learning:update", refresh as any);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("learning:update", refresh as any);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  return (
    <header className={cn("sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
      <div className="absolute left-0.5 top-[-100px] z-50 flex flex-col gap-1">
        <a href="#main" className="skip-link">Skip to main content</a>
        <a href="#nav" className="skip-link">Skip to navigation</a>
      </div>
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-center gap-2" aria-label="PWD Jobs Home">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">
            <span>PW</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-extrabold tracking-tight">PWD Jobs</span>
            <span className="text-xs text-muted-foreground">Inclusive hiring made easy</span>
          </div>
        </Link>
        <nav id="nav" className="hidden md:flex items-center gap-6 text-sm" aria-label="Primary navigation">
          <a href="/jobs" className="text-muted-foreground hover:text-foreground">Jobs</a>
          <a href="/saved" className="text-muted-foreground hover:text-foreground">Saved</a>
          <a href="/chat" className="text-muted-foreground hover:text-foreground">Chat</a>
          <a href="/resources" className="text-muted-foreground hover:text-foreground">Resources</a>
          <a href="/employee" className="text-muted-foreground hover:text-foreground">Job seekers</a>
          <a href="/employer" className="text-muted-foreground hover:text-foreground">Employers</a>
        </nav>
        <div className="flex items-center gap-2">
          {points > 0 && (
            <span className="hidden sm:inline-flex items-center rounded-full border px-2 py-0.5 text-xs text-muted-foreground" aria-live="polite">{points} pts</span>
          )}
          <A11yControls />
          <a href="/jobs"><Button variant="secondary" className="hidden sm:inline-flex">Browse jobs</Button></a>
          <a href="/employer"><Button>Post a job</Button></a>
        </div>
      </div>
    </header>
  );
}
