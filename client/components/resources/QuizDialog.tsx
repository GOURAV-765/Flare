import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export type QuizQuestion = { q: string; options: string[]; correct: number };

function baseQuestions(skill: string): QuizQuestion[] {
  const s = skill.toLowerCase();
  if (/(web|frontend|html|css|javascript|ui|ux|development)/.test(s)) {
    return [
      { q: "What does HTML provide?", options: ["Styling", "Structure", "Database"], correct: 1 },
      { q: "Which CSS property changes text color?", options: ["font-style", "color", "display"], correct: 1 },
      { q: "Where should alt text be placed?", options: ["<video>", "<img>", "<div>"], correct: 1 },
      { q: "What does aria-label help with?", options: ["Accessibility", "Fonts", "Caching"], correct: 0 },
      { q: "CSS Flexbox main axis is controlled by?", options: ["justify-content", "align-items", "z-index"], correct: 0 },
      { q: "Semantic tag for navigation?", options: ["<div>", "<nav>", "<span>"], correct: 1 },
    ];
  }
  if (/(seo|marketing|digital|social)/.test(s)) {
    return [
      { q: "What does SEO stand for?", options: ["Search Engine Optimization", "Social Engagement Outreach", "Site Email Output"], correct: 0 },
      { q: "Which is a ranking factor?", options: ["Keyword stuffing", "Helpful content", "Hidden text"], correct: 1 },
      { q: "What is meta description?", options: ["A page summary", "A CSS file", "A backlink"], correct: 0 },
      { q: "Which helps accessibility & SEO?", options: ["Descriptive alt text", "Invisible text", "Link farms"], correct: 0 },
      { q: "Core web vital?", options: ["LCP", "FTP", "CRT"], correct: 0 },
      { q: "Robots.txt controls?", options: ["Crawling", "CSS colors", "Screen size"], correct: 0 },
    ];
  }
  if (/(graphic|design|figma|ui)/.test(s)) {
    return [
      { q: "What improves readability?", options: ["Low contrast", "Good hierarchy", "Tiny text"], correct: 1 },
      { q: "What is a wireframe?", options: ["High-fidelity design", "Basic layout", "Code snippet"], correct: 1 },
      { q: "Which format is vector?", options: ["SVG", "JPG", "PNG"], correct: 0 },
      { q: "Which grid aids layout?", options: ["8pt grid", "Random", "No grid"], correct: 0 },
      { q: "What is spacing between letters?", options: ["Kerning", "Leading", "Tracking"], correct: 2 },
    ];
  }
  if (/(typing)/.test(s)) {
    return [
      { q: "Which fingers rest on home row keys?", options: ["Thumbs only", "Index to pinky", "No fixed position"], correct: 1 },
      { q: "What helps speed?", options: ["Looking at keyboard", "Proper posture", "Randomly pressing keys"], correct: 1 },
      { q: "Best measure of typing skill?", options: ["Words per minute & accuracy", "Total keys", "Keyboard color"], correct: 0 },
      { q: "Which is a home row key?", options: ["F", "P", ";"], correct: 0 },
    ];
  }
  return [
    { q: `What is ${skill} mainly about?`, options: ["Time travel", "Core concepts and practice", "Only memorization"], correct: 1 },
    { q: `How to begin learning ${skill}?`, options: ["Ignore basics", "Follow beginner guide & practice", "Buy expensive gear first"], correct: 1 },
    { q: `Best way to progress in ${skill}?`, options: ["Consistent practice", "Never get feedback", "Avoid projects"], correct: 0 },
    { q: "What helps accessibility?", options: ["Meaningful labels", "Hidden controls", "Tiny text"], correct: 0 },
  ];
}

function buildLevelQuestions(skill: string, level: "beginner" | "intermediate" | "expert") {
  const all = baseQuestions(skill);
  if (level === "beginner") return all.slice(0, Math.min(3, all.length));
  if (level === "intermediate") return all.slice(0, Math.min(5, all.length));
  return all.slice(0, Math.min(7, all.length));
}

export default function QuizDialog({ skill, level = "beginner", onPassed }: { skill: string; level?: "beginner" | "intermediate" | "expert"; onPassed: (score: number) => void }) {
  const [open, setOpen] = useState(false);
  const questions = useMemo(() => buildLevelQuestions(skill, level), [skill, level]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => { if (!open) { setAnswers({}); setScore(null); } }, [open]);

  const passRatio = level === "expert" ? 0.8 : level === "intermediate" ? 0.7 : 0.66;

  const submit = () => {
    let s = 0;
    questions.forEach((q, i) => { if (answers[i] === q.correct) s += 1; });
    setScore(s);
    if (s >= Math.ceil(questions.length * passRatio)) {
      onPassed(s);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">{level === "beginner" ? "Beginner quiz" : level === "intermediate" ? "Intermediate quiz" : "Expert quiz"}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{skill} • {level.charAt(0).toUpperCase() + level.slice(1)} quiz</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          {questions.map((q, i) => (
            <div key={i} className="grid gap-2">
              <p className="font-medium">{i + 1}. {q.q}</p>
              <RadioGroup value={String(answers[i] ?? "")} onValueChange={(v) => setAnswers((a) => ({ ...a, [i]: Number(v) }))}>
                {q.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <RadioGroupItem id={`q${i}_${idx}`} value={String(idx)} />
                    <Label htmlFor={`q${i}_${idx}`}>{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ))}
          <div className="flex items-center justify-between">
            <Button onClick={submit}>Submit</Button>
            {score !== null && (
              <span aria-live="polite" className="text-sm text-muted-foreground">Score: {score}/{questions.length} {score >= Math.ceil(questions.length * passRatio) ? "• Passed" : "• Try again"}</span>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
