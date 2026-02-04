export type Badge = "Beginner" | "Intermediate" | "Expert";

export type SkillProgress = {
  points: number;
  completed: Record<string, boolean>; // key: resource url
  quizzes: Record<string, { passed: boolean; attempts: number; last: number }>;
};

export type LearningState = {
  totalPoints: number;
  skills: Record<string, SkillProgress>;
};

const KEY = "learning:state";

export function getState(): LearningState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as LearningState;
  } catch {}
  return { totalPoints: 0, skills: {} };
}

export function saveState(state: LearningState) {
  localStorage.setItem(KEY, JSON.stringify(state));
  try { window.dispatchEvent(new CustomEvent("learning:update", { detail: state })); } catch {}
}

export function getSkill(state: LearningState, skill: string): SkillProgress {
  if (!state.skills[skill]) state.skills[skill] = { points: 0, completed: {}, quizzes: {} };
  return state.skills[skill];
}

export function badgeFor(points: number): Badge | undefined {
  if (points >= 120) return "Expert";
  if (points >= 60) return "Intermediate";
  if (points >= 20) return "Beginner";
  return undefined;
}

export function addPoints(skill: string, pts: number) {
  const s = getState();
  const sp = getSkill(s, skill);
  sp.points += pts;
  s.totalPoints += pts;
  saveState(s);
}

export function setCompleted(skill: string, url: string, done: boolean) {
  const s = getState();
  const sp = getSkill(s, skill);
  sp.completed[url] = done;
  saveState(s);
}

export function isCompleted(skill: string, url: string): boolean {
  const s = getState();
  return !!s.skills[skill]?.completed[url];
}

export function markQuiz(skill: string, quizId: string, passed: boolean) {
  const s = getState();
  const sp = getSkill(s, skill);
  const q = sp.quizzes[quizId] || { passed: false, attempts: 0, last: Date.now() };
  q.attempts += 1;
  q.last = Date.now();
  q.passed = q.passed || passed;
  sp.quizzes[quizId] = q;
  saveState(s);
}

export function quizPassed(skill: string, quizId: string): boolean {
  const s = getState();
  return !!s.skills[skill]?.quizzes[quizId]?.passed;
}

export function resetLearning() {
  localStorage.removeItem(KEY);
  const s = getState();
  saveState(s);
}
