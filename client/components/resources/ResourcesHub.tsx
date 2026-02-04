import { useEffect, useMemo, useState } from "react";
import { ALL_SKILLS } from "@/data/skills";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { addPoints, badgeFor, getState, isCompleted, markQuiz, quizPassed, setCompleted } from "@/lib/gamify";
import QuizDialog from "@/components/resources/QuizDialog";
import TypingTestDialog from "@/components/resources/TypingTestDialog";
import ProgressSummary from "@/components/resources/ProgressSummary";
import { toast } from "sonner";

const KEY = "resources:selectedSkills";

type ResourceItem = { title: string; url: string; source: string };

function encode(q: string) {
  return encodeURIComponent(q);
}

function resourceLinks(skill: string) {
  const q = skill.trim();
  const generic: { videos: ResourceItem[]; articles: ResourceItem[]; guides: ResourceItem[] } = {
    videos: [
      { title: `YouTube • ${q} for beginners`, url: `https://www.youtube.com/results?search_query=${encode("beginner " + q + " tutorial")}` , source: "YouTube" },
      { title: `YouTube • ${q} crash course`, url: `https://www.youtube.com/results?search_query=${encode(q + " crash course")}`, source: "YouTube" },
    ],
    articles: [
      { title: `freeCodeCamp • ${q} for beginners`, url: `https://www.google.com/search?q=${encode("site:freecodecamp.org beginner " + q)}`, source: "freeCodeCamp" },
      { title: `GCFGlobal • Intro to ${q}`, url: `https://edu.gcfglobal.org/en/search/?q=${encode(q)}`, source: "GCFGlobal" },
    ],
    guides: [
      { title: `free courses • ${q} (Coursera search)`, url: `https://www.coursera.org/search?query=${encode(q + " beginner")}`, source: "Coursera" },
      { title: `Khan Academy • ${q} (search)`, url: `https://www.khanacademy.org/search?page_search_query=${encode(q)}`, source: "Khan Academy" },
    ],
  };

  const lower = q.toLowerCase();
  const extras: ResourceItem[] = [];
  if (/(web|frontend|javascript|html|css|ui)/.test(lower)) {
    extras.push({ title: "MDN Web Docs • Learn web development", url: "https://developer.mozilla.org/en-US/docs/Learn", source: "MDN" });
  }
  if (/(seo|digital|marketing|social)/.test(lower)) {
    extras.push({ title: "Google • SEO Starter Guide", url: "https://developers.google.com/search/docs/fundamentals/seo-starter-guide", source: "Google" });
    extras.push({ title: "HubSpot Academy • Digital marketing", url: `https://academy.hubspot.com/courses?query=${encode(q)}`, source: "HubSpot" });
  }
  if (/(graphic|design|ui|ux|figma)/.test(lower)) {
    extras.push({ title: "Figma • Get started", url: "https://help.figma.com/hc/en-us/sections/360002034613-Get-started", source: "Figma" });
    extras.push({ title: "Canva Design School • Basics", url: "https://www.canva.com/learn/design/", source: "Canva" });
  }
  if (/(typing)/.test(lower)) {
    extras.push({ title: "Typing.com • Lessons", url: "https://www.typing.com/student/lessons", source: "Typing.com" });
  }
  if (/(accounting|finance)/.test(lower)) {
    extras.push({ title: "Khan Academy • Accounting and financial statements", url: "https://www.khanacademy.org/economics-finance-domain/core-finance/accounting-and-financial-statements", source: "Khan Academy" });
  }
  if (/(project management|project-management|project)/.test(lower)) {
    extras.push({ title: "Atlassian • Agile and project management guides", url: "https://www.atlassian.com/agile", source: "Atlassian" });
  }
  if (/(customer support|customer-service|support)/.test(lower)) {
    extras.push({ title: "Zendesk • Customer service training", url: "https://www.zendesk.com/learn/customer-service-training/", source: "Zendesk" });
  }

  return {
    videos: generic.videos,
    articles: generic.articles,
    guides: [...generic.guides, ...extras],
  };
}

export default function ResourcesHub() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const s = params.get("skills");
    const fromUrl = s ? s.split(",").map((x) => x.trim()).filter(Boolean) : [];
    const fromLocal = (() => {
      try { return JSON.parse(localStorage.getItem(KEY) || "[]") as string[]; } catch { return []; }
    })();
    const init = new Set<string>(fromUrl.length ? fromUrl : fromLocal);
    setSelected(init);
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(Array.from(selected)));
  }, [selected]);

  const visibleSkills = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return ALL_SKILLS;
    return ALL_SKILLS.filter((s) => s.toLowerCase().includes(q));
  }, [filter]);

  const toggle = (skill: string, checked: boolean | string) => {
    const next = new Set(selected);
    if (!!checked) next.add(skill); else next.delete(skill);
    setSelected(next);
  };

  const selectedList = Array.from(selected);
  const state = getState();

  return (
    <section aria-labelledby="resources-title" className="mt-16">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 id="resources-title" className="text-3xl font-bold tracking-tight">Beginner-friendly resources</h2>
            <p className="text-muted-foreground">Pick skills to get curated resources. Mark done, take level tests, and earn badges.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" aria-label={`Total points ${state.totalPoints}`}>{state.totalPoints} pts</Badge>
            {selectedList.length > 0 && (
              <Badge variant="outline" aria-label={`Selected ${selectedList.length} skills`}>
                {selectedList.length} selected
              </Badge>
            )}
          </div>
        </div>

        <ProgressSummary />

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Choose skills</CardTitle>
            <CardDescription>Search and select the skills you want to learn.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-center gap-3">
                <Input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Search skills (e.g. Web Development, SEO)" aria-label="Search skills" />
                <Button variant="outline" onClick={() => setFilter("")}>Clear</Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-auto pr-1">
                {visibleSkills.map((s) => (
                  <label key={s} className="flex items-center gap-3">
                    <Checkbox checked={selected.has(s)} onCheckedChange={(c) => toggle(s, c)} aria-label={s} />
                    <span className="text-sm">{s}</span>
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedList.length === 0 && (
          <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">Pick at least one skill above to see beginner resources.</div>
        )}

        <div className="grid gap-6">
          {selectedList.map((skill) => {
            const links = resourceLinks(skill);
            const sp = state.skills[skill] || { points: 0, completed: {}, quizzes: {} };
            const badge = badgeFor(sp.points);
            const toggleDone = (url: string, checked: boolean | string) => {
              const was = isCompleted(skill, url);
              setCompleted(skill, url, !!checked);
              if (!!checked && !was) {
                addPoints(skill, 5);
                toast.success(`+5 pts for completing a resource in ${skill}`);
              }
              setTick((t) => t + 1);
            };
            const onQuizPassed = (lvl: "basic" | "intermediate" | "expert") => {
              if (!quizPassed(skill, lvl)) {
                markQuiz(skill, lvl, true);
                const pts = lvl === "expert" ? 35 : lvl === "intermediate" ? 25 : 15;
                addPoints(skill, pts);
                toast.success(`${lvl === "basic" ? "Beginner" : lvl.charAt(0).toUpperCase()+lvl.slice(1)} quiz passed! +${pts} pts in ${skill}`);
                setTick((t) => t + 1);
              }
            };
            const onTypingPassed = (lvl: "typing-beginner" | "typing-intermediate" | "typing-expert", wpm: number) => {
              if (!quizPassed(skill, lvl)) {
                markQuiz(skill, lvl, true);
                const pts = lvl === "typing-expert" ? 50 : lvl === "typing-intermediate" ? 35 : 25;
                addPoints(skill, pts);
                toast.success(`${lvl.split("-")[1]} typing test passed (${wpm} WPM)! +${pts} pts in ${skill}`);
                setTick((t) => t + 1);
              }
            };
            const done = (url: string) => isCompleted(skill, url);
            const isTyping = skill.toLowerCase() === "typing";
            const levelBadge = (() => {
              if (isTyping) {
                if (quizPassed(skill, "typing-expert")) return "Expert";
                if (quizPassed(skill, "typing-intermediate")) return "Intermediate";
                if (quizPassed(skill, "typing-beginner")) return "Beginner";
              } else {
                if (quizPassed(skill, "expert")) return "Expert";
                if (quizPassed(skill, "intermediate")) return "Intermediate";
                if (quizPassed(skill, "basic")) return "Beginner";
              }
              return badge || undefined;
            })();

            return (
              <Card key={skill}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-3">
                      <span>{skill}</span>
                      <Badge variant="secondary">{sp.points} pts</Badge>
                      {levelBadge && <Badge>{levelBadge}</Badge>}
                    </span>
                    <span className="flex items-center gap-2">
                      {isTyping ? (
                        <>
                          {quizPassed(skill, "typing-beginner") && <Badge variant="outline">Beginner ✔</Badge>}
                          <TypingTestDialog skill={skill} passWpm={25} durationSec={60} onPassed={(w) => onTypingPassed("typing-beginner", w)} />
                          {quizPassed(skill, "typing-beginner") && (
                            <>
                              {quizPassed(skill, "typing-intermediate") && <Badge variant="outline">Intermediate ✔</Badge>}
                              <TypingTestDialog skill={skill} passWpm={35} durationSec={60} onPassed={(w) => onTypingPassed("typing-intermediate", w)} />
                            </>
                          )}
                          {quizPassed(skill, "typing-intermediate") && (
                            <>
                              {quizPassed(skill, "typing-expert") && <Badge variant="outline">Expert ✔</Badge>}
                              <TypingTestDialog skill={skill} passWpm={45} durationSec={60} onPassed={(w) => onTypingPassed("typing-expert", w)} />
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          {quizPassed(skill, "basic") && <Badge variant="outline">Beginner ✔</Badge>}
                          <QuizDialog skill={skill} level="beginner" onPassed={() => onQuizPassed("basic")} />
                          {quizPassed(skill, "basic") && (
                            <>
                              {quizPassed(skill, "intermediate") && <Badge variant="outline">Intermediate ✔</Badge>}
                              <QuizDialog skill={skill} level="intermediate" onPassed={() => onQuizPassed("intermediate")} />
                            </>
                          )}
                          {quizPassed(skill, "intermediate") && (
                            <>
                              {quizPassed(skill, "expert") && <Badge variant="outline">Expert ✔</Badge>}
                              <QuizDialog skill={skill} level="expert" onPassed={() => onQuizPassed("expert")} />
                            </>
                          )}
                        </>
                      )}
                    </span>
                  </CardTitle>
                  <CardDescription>Curated links to start learning {skill} from scratch.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-3">
                    <div>
                      <h3 className="font-semibold">Videos</h3>
                      <ul className="mt-2 grid gap-2 text-sm">
                        {links.videos.map((it) => (
                          <li key={it.url} className="flex items-start justify-between gap-3">
                            <a className="text-primary underline-offset-4 hover:underline" href={it.url} target="_blank" rel="noreferrer">
                              {it.title}
                            </a>
                            <label className="flex items-center gap-2">
                              <Checkbox checked={done(it.url)} onCheckedChange={(c) => toggleDone(it.url, c)} aria-label="Mark complete" />
                              <span className="text-xs text-muted-foreground">Done</span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold">Articles</h3>
                      <ul className="mt-2 grid gap-2 text-sm">
                        {links.articles.map((it) => (
                          <li key={it.url} className="flex items-start justify-between gap-3">
                            <a className="text-primary underline-offset-4 hover:underline" href={it.url} target="_blank" rel="noreferrer">
                              {it.title}
                            </a>
                            <label className="flex items-center gap-2">
                              <Checkbox checked={done(it.url)} onCheckedChange={(c) => toggleDone(it.url, c)} aria-label="Mark complete" />
                              <span className="text-xs text-muted-foreground">Done</span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold">Guides & courses</h3>
                      <ul className="mt-2 grid gap-2 text-sm">
                        {links.guides.map((it) => (
                          <li key={it.url} className="flex items-start justify-between gap-3">
                            <a className="text-primary underline-offset-4 hover:underline" href={it.url} target="_blank" rel="noreferrer">
                              {it.title}
                            </a>
                            <label className="flex items-center gap-2">
                              <Checkbox checked={done(it.url)} onCheckedChange={(c) => toggleDone(it.url, c)} aria-label="Mark complete" />
                              <span className="text-xs text-muted-foreground">Done</span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
