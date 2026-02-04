import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { ALL_SKILLS } from "@/data/skills";
import { DISABILITY_TYPES } from "@/data/disabilities";
import { getSupabase } from "@/lib/supabase";
import { isSaved, toggleSaved } from "@/lib/saved";
import { Link } from "react-router-dom";
import PageAnnouncer from "@/components/accessibility/PageAnnouncer";

interface JobRow {
  id: number | string;
  company_name: string;
  role_title: string;
  job_description?: string;
  location?: string;
  yoe_required?: number;
  min_age?: number;
  max_age?: number;
  required_skills?: string[];
  disability_types?: string[];
}

export default function Jobs() {
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [dq, setDq] = useState("");
  const [skillFilter, setSkillFilter] = useState<Set<string>>(new Set());
  const [locationQ, setLocationQ] = useState("");
  const [yoeRange, setYoeRange] = useState<[number, number]>([0, 20]);
  const [sort, setSort] = useState<"new" | "yoe_asc" | "yoe_desc">("new");
  const [disabilityFilter, setDisabilityFilter] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDq(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  // Initialize from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q0 = params.get("q") || "";
    const s0 = params.get("skills");
    const d0 = params.get("dis") || "";
    const sort0 = (params.get("sort") as typeof sort) || "new";
    const loc0 = params.get("loc") || "";
    const y0 = Number(params.get("ymin") || 0);
    const y1 = Number(params.get("ymax") || 20);
    setQ(q0);
    setDq(q0);
    setLocationQ(loc0);
    setYoeRange([isNaN(y0) ? 0 : y0, isNaN(y1) ? 20 : y1]);
    setSort(["new", "yoe_asc", "yoe_desc"].includes(sort0) ? sort0 : "new");
    if (s0) setSkillFilter(new Set(s0.split(",").filter(Boolean)));
    if (d0) setDisabilityFilter(new Set(d0.split(",").filter(Boolean)));
  }, []);

  // Persist to URL
  useEffect(() => {
    const url = new URL(window.location.href);
    dq ? url.searchParams.set("q", dq) : url.searchParams.delete("q");
    locationQ ? url.searchParams.set("loc", locationQ) : url.searchParams.delete("loc");
    url.searchParams.set("ymin", String(yoeRange[0]));
    url.searchParams.set("ymax", String(yoeRange[1]));
    const skills = Array.from(skillFilter).join(",");
    skills ? url.searchParams.set("skills", skills) : url.searchParams.delete("skills");
    const dis = Array.from(disabilityFilter).join(",");
    dis ? url.searchParams.set("dis", dis) : url.searchParams.delete("dis");
    url.searchParams.set("sort", sort);
    window.history.replaceState({}, "", url.toString());
    setPage(1);
  }, [dq, locationQ, yoeRange, skillFilter, disabilityFilter, sort]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const sb = getSupabase();
      if (sb) {
        const { data, error } = await sb.from("jobs").select("*").order("id", { ascending: false });
        if (!error && data) setJobs(data as unknown as JobRow[]);
      }
      if (!sb) {
        setJobs([
          {
            id: "1",
            company_name: "Inclusive Tech",
            role_title: "Customer Support Associate",
            job_description: "Assist users via chat and email. Accessibility-first environment.",
            location: "Remote",
            yoe_required: 0,
            required_skills: ["Typing", "Customer Support"],
          },
          {
            id: "2",
            company_name: "Bright Design",
            role_title: "Junior Graphic Designer",
            job_description: "Create social graphics and simple layouts.",
            location: "Delhi, India (Hybrid)",
            yoe_required: 1,
            required_skills: ["Graphic Design", "Designing"],
          },
        ]);
      }
      setLoading(false);
    };
    run();
  }, []);

  const list = useMemo(() => {
    const text = dq.trim().toLowerCase();
    const loc = locationQ.trim().toLowerCase();
    const [ymin, ymax] = yoeRange;
    const skills = Array.from(skillFilter);
    const filtered = jobs.filter((j) => {
      const matchesText = !text || `${j.company_name} ${j.role_title} ${j.job_description ?? ""}`.toLowerCase().includes(text);
      const matchesLoc = !loc || (j.location ?? "").toLowerCase().includes(loc);
      const y = j.yoe_required ?? 0;
      const matchesYoe = y >= ymin && y <= ymax;
      const matchesSkills = skills.length === 0 || skills.every((s) => j.required_skills?.includes(s));
      const matchesDis = disabilityFilter.size === 0 || Array.from(disabilityFilter).every((d) => j.disability_types?.includes(d));
      return matchesText && matchesLoc && matchesYoe && matchesSkills && matchesDis;
    });
    const sorted = [...filtered].sort((a, b) => {
      if (sort === "new") return 0; // assume fetched by newest
      if (sort === "yoe_asc") return (a.yoe_required ?? 0) - (b.yoe_required ?? 0);
      return (b.yoe_required ?? 0) - (a.yoe_required ?? 0);
    });
    return sorted;
  }, [jobs, dq, locationQ, yoeRange, skillFilter, sort]);

  const toggleSkill = (s: string, checked: boolean | string) => {
    const next = new Set(skillFilter);
    if (!!checked) next.add(s); else next.delete(s);
    setSkillFilter(next);
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <PageAnnouncer title="Browse Jobs" description="Search and filter jobs by title, company, skills, and disability accommodations." />
      <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
        <div className="flex-1 grid gap-2">
          <Label htmlFor="q">Search jobs</Label>
          <Input id="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title, company, or description" />
        </div>
        <div className="w-full md:w-56 grid gap-2">
          <Label>Sort by</Label>
          <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
            <SelectTrigger>
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">Newest</SelectItem>
              <SelectItem value="yoe_asc">YOE: Low to High</SelectItem>
              <SelectItem value="yoe_desc">YOE: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="mb-4 text-sm text-muted-foreground" aria-live="polite">{list.length} job{list.length === 1 ? "" : "s"} found</div>
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">
        <aside className="grid gap-4 md:sticky md:top-20 self-start">
          <div className="grid gap-2">
            <Label htmlFor="loc">Location</Label>
            <Input id="loc" value={locationQ} onChange={(e) => setLocationQ(e.target.value)} placeholder="e.g., Remote, Delhi" />
          </div>
          <div className="grid gap-2">
            <Label>YOE range</Label>
            <Slider value={yoeRange} min={0} max={20} step={1} onValueChange={(v) => setYoeRange([v[0] ?? 0, v[1] ?? 20])} />
            <div className="text-xs text-muted-foreground">{yoeRange[0]}–{yoeRange[1]} years</div>
          </div>
          <div className="grid gap-2">
            <Label>Accessible for</Label>
            <div className="grid grid-cols-1 gap-2">
              {DISABILITY_TYPES.map((d) => (
                <label key={d} className="flex items-center gap-2">
                  <Checkbox checked={disabilityFilter.has(d)} onCheckedChange={(c) => setDisabilityFilter((prev) => { const n = new Set(prev); if (c) n.add(d); else n.delete(d); return n; })} />
                  <span className="text-sm">{d}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="grid gap-2">
            <h3 className="font-semibold">Filter by skills</h3>
            <div className="grid grid-cols-1 gap-2 max-h-[320px] overflow-auto pr-1">
              {ALL_SKILLS.map((s) => (
                <label key={s} className="flex items-center gap-2">
                  <Checkbox checked={skillFilter.has(s)} onCheckedChange={(c) => toggleSkill(s, c)} />
                  <span className="text-sm">{s}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>
        <section className="grid gap-4">
          {loading && (
            <div className="grid gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-xl border bg-card p-5 animate-pulse">
                  <div className="h-5 w-1/3 bg-muted rounded" />
                  <div className="mt-2 h-4 w-1/2 bg-muted rounded" />
                  <div className="mt-4 h-3 w-full bg-muted rounded" />
                </div>
              ))}
            </div>
          )}
          {!loading && list.length === 0 && <p>No jobs found. Try fewer filters.</p>}
          {!loading && list.slice(0, page * pageSize).map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
          {!loading && list.length > page * pageSize && (
            <div className="pt-2">
              <Button variant="outline" onClick={() => setPage((p) => p + 1)} className="w-full">Load more</Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function JobCard({ job }: { job: JobRow }) {
  const [open, setOpen] = useState(false);
  const apply = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const note = String(fd.get("note") || "").trim();
    if (!name || !email) {
      toast.error("Enter name and email");
      return;
    }
    const sb = getSupabase();
    if (sb) {
      await sb.from("applications").insert({ job_id: job.id, name, email, note });
      toast.success("Application sent (no sign-in)");
    } else {
      toast.success("Application recorded (demo mode)");
    }
    setOpen(false);
  };
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm" role="article" aria-labelledby={`job-${job.id}-title`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 id={`job-${job.id}-title`} className="text-lg font-semibold"><Link to={`/jobs/${job.id}`} className="hover:underline">{job.role_title}</Link></h4>
          <p className="text-sm text-muted-foreground">{job.company_name} • {job.location ?? "Remote"}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={isSaved(job.id) ? "secondary" : "outline"}
            aria-pressed={isSaved(job.id)}
            onClick={() => {
              const s = toggleSaved(job.id);
              toast.success(s ? "Saved job" : "Removed from saved");
            }}
          >
            {isSaved(job.id) ? "Saved" : "Save"}
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Quick apply</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Apply to {job.role_title}</DialogTitle>
                <DialogDescription>No sign-in required. We’ll email the employer.</DialogDescription>
              </DialogHeader>
              <form className="grid gap-3" onSubmit={apply}>
                <div className="grid gap-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" name="name" autoComplete="name" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" autoComplete="email" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="note">Cover note (optional)</Label>
                  <Textarea id="note" name="note" placeholder="Write a short note" />
                </div>
                <div className="pt-2">
                  <Button type="submit" className="w-full">Send application</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {job.job_description && (
        <p className="mt-3 text-sm text-muted-foreground">{job.job_description}</p>
      )}
      {job.required_skills && job.required_skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {job.required_skills.map((s) => (
            <span key={s} className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">{s}</span>
          ))}
        </div>
      )}
    </div>
  );
}
