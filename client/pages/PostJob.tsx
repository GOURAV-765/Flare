import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ALL_SKILLS } from "@/data/skills";
import { DISABILITY_TYPES } from "@/data/disabilities";
import { getSupabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import PageAnnouncer from "@/components/accessibility/PageAnnouncer";

export default function PostJob() {
  const [skills, setSkills] = useState<Set<string>>(new Set());
  const [disTypes, setDisTypes] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const groupedSkills = useMemo(() => {
    const mid = Math.ceil(ALL_SKILLS.length / 2);
    return [ALL_SKILLS.slice(0, mid), ALL_SKILLS.slice(mid)];
  }, []);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const company = String(fd.get("company") || "").trim();
    const role = String(fd.get("role") || "").trim();
    const email = String(fd.get("email") || "").trim();
    if (!company || !role || !email) {
      toast.error("Company, role and email are required");
      return;
    }
    const payload = {
      company_name: company,
      role_title: role,
      email,
      phone: fd.get("phone"),
      location: fd.get("location"),
      job_description: fd.get("description"),
      website: fd.get("website"),
      yoe_required: Number(fd.get("yoe") || 0),
      required_skills: Array.from(skills),
      disability_types: Array.from(disTypes),
    };
    const sb = getSupabase();
    if (sb) {
      const { error } = await sb.from("jobs").insert(payload as any);
      if (error) {
        toast.error("Failed to post job");
        return;
      }
      toast.success("Job posted successfully");
    } else {
      toast.success("Job captured (demo mode)");
    }
    navigate("/jobs");
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <PageAnnouncer title="Post a Job" description="Create and post a new job opening with required skills and accommodations." />
      <div className="flex items-center justify-between gap-4 mb-4">
        <h1 className="text-3xl font-bold tracking-tight">Post a job for PwD candidates</h1>
        <Link to="/jobs" className="underline">Skip for now</Link>
      </div>
      <p className="mt-2 mb-6 text-muted-foreground">Include accessibility notes and preferred skills. No sign‑in required.</p>
      <form onSubmit={onSubmit} className="grid gap-6 rounded-2xl border bg-card p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="company">Company</Label>
            <Input id="company" name="company" autoComplete="organization" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">Role title</Label>
            <Input id="role" name="role" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Contact email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Contact phone (optional)</Label>
            <Input id="phone" name="phone" type="tel" autoComplete="tel" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" name="location" placeholder="Remote / City, Country" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="website">Company website</Label>
            <Input id="website" name="website" type="url" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="yoe">YOE required</Label>
            <Input id="yoe" name="yoe" type="number" min={0} defaultValue={0} />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Job description</Label>
          <Textarea id="description" name="description" placeholder="Describe responsibilities, tools, and accessibility support" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <h3 className="font-semibold">Accessible for</h3>
            <div className="grid gap-2">
              {DISABILITY_TYPES.map((d) => (
                <label key={d} className="flex items-center gap-2">
                  <Checkbox checked={disTypes.has(d)} onCheckedChange={(c) => setDisTypes((prev) => { const n = new Set(prev); if (c) n.add(d); else n.delete(d); return n; })} />
                  <span className="text-sm">{d}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="grid gap-2">
            <h3 className="font-semibold">Required skills</h3>
            <div className="grid gap-2">
              {groupedSkills.map((col, idx) => (
                <div key={idx} className="grid gap-2">
                  {col.map((s) => (
                    <label key={s} className="flex items-center gap-2">
                      <Checkbox checked={skills.has(s)} onCheckedChange={(c) => setSkills((prev) => { const n = new Set(prev); if (c) n.add(s); else n.delete(s); return n; })} />
                      <span className="text-sm">{s}</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <Button type="submit" className="h-11">Post job</Button>
        </div>
      </form>
    </div>
  );
}
