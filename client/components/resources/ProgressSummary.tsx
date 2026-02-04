import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LearningState, badgeFor, getState, resetLearning } from "@/lib/gamify";

function highestLevelFor(skill: string, state: LearningState): string | undefined {
  const q = state.skills[skill]?.quizzes || {};
  if (skill.toLowerCase() === "typing") {
    if (q["typing-expert"]?.passed) return "Expert";
    if (q["typing-intermediate"]?.passed) return "Intermediate";
    if (q["typing-beginner"]?.passed) return "Beginner";
  } else {
    if (q["expert"]?.passed) return "Expert";
    if (q["intermediate"]?.passed) return "Intermediate";
    if (q["basic"]?.passed) return "Beginner";
  }
  const pts = state.skills[skill]?.points || 0;
  return badgeFor(pts);
}

function toNextThreshold(points: number) {
  const thresholds = [20, 60, 120];
  for (const t of thresholds) if (points < t) return { current: points, next: t, pct: Math.min(100, Math.round((points / t) * 100)) };
  return { current: points, next: 120, pct: 100 };
}

export default function ProgressSummary() {
  const [state, setState] = useState<LearningState>(getState());

  useEffect(() => {
    const onUpdate = (e: Event) => {
      setState(getState());
    };
    window.addEventListener("learning:update", onUpdate as any);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("learning:update", onUpdate as any);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  const skills = useMemo(() => Object.keys(state.skills).sort(), [state.skills]);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "learning-progress.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const onReset = () => {
    if (confirm("Reset all learning progress?")) {
      resetLearning();
      setState(getState());
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>My progress</span>
          <span className="flex items-center gap-2">
            <Badge variant="secondary">{state.totalPoints} pts</Badge>
            <Button variant="outline" size="sm" onClick={exportJson}>Export</Button>
            <Button variant="destructive" size="sm" onClick={onReset}>Reset</Button>
          </span>
        </CardTitle>
        <CardDescription>Track your skill levels. Badges unlock when you pass level tests. Points come from completions and tests.</CardDescription>
      </CardHeader>
      <CardContent>
        {skills.length === 0 ? (
          <p className="text-sm text-muted-foreground">No progress yet. Select a skill and start learning.</p>
        ) : (
          <div className="grid gap-3">
            {skills.map((s) => {
              const pts = state.skills[s]?.points || 0;
              const lvl = highestLevelFor(s, state);
              const { pct, next } = toNextThreshold(pts);
              return (
                <div key={s} className="grid gap-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{s}</span>
                      <Badge variant="outline">{pts} pts</Badge>
                      {lvl && <Badge>{lvl}</Badge>}
                    </div>
                    <span className="text-xs text-muted-foreground">{pct}% to next level (target {next} pts)</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
