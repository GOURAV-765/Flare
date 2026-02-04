import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ALL_SKILLS } from "@/data/skills";
import PageAnnouncer from "@/components/accessibility/PageAnnouncer";

interface ResumeData {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  summary?: string;
  skills: string[];
  experience?: string;
  education?: string;
  accommodations?: string;
}

export default function ResumeBuilder() {
  const [step, setStep] = useState(1);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [data, setData] = useState<ResumeData>({ name: "", email: "", skills: [] });

  const grouped = useMemo(() => {
    const mid = Math.ceil(ALL_SKILLS.length / 2);
    return [ALL_SKILLS.slice(0, mid), ALL_SKILLS.slice(mid)];
  }, []);

  const next = () => setStep((s) => Math.min(4, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));

  const onPersonal = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setData((d) => ({
      ...d,
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      phone: String(fd.get("phone") || ""),
      location: String(fd.get("location") || ""),
      summary: String(fd.get("summary") || ""),
    }));
    next();
  };

  const onSkills = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setData((d) => ({ ...d, skills: Array.from(picked) }));
    next();
  };

  const onDetails = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setData((d) => ({
      ...d,
      experience: String(fd.get("experience") || ""),
      education: String(fd.get("education") || ""),
      accommodations: String(fd.get("accommodations") || ""),
    }));
    next();
  };

  const printCV = () => window.print();

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <PageAnnouncer title="Resume Builder" description="Build your professional resume step by step." />
      <div className="flex items-center justify-between gap-4 mb-4">
        <h1 className="text-3xl font-bold tracking-tight">Resume Builder</h1>
        <div className="text-sm text-muted-foreground">Step {step} of 4</div>
      </div>

      {step === 1 && (
        <form onSubmit={onPersonal} className="grid gap-6 rounded-2xl border bg-card p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" name="name" autoComplete="name" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="tel" autoComplete="tel" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="summary">Professional summary</Label>
            <Textarea id="summary" name="summary" placeholder="A few sentences about your strengths and goals" />
          </div>
          <div className="flex gap-2">
            <Button type="submit">Continue</Button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={onSkills} className="grid gap-6 rounded-2xl border bg-card p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {grouped.map((col, idx) => (
              <div key={idx} className="grid gap-2">
                {col.map((s) => (
                  <label key={s} className="flex items-center gap-2">
                    <Checkbox checked={picked.has(s)} onCheckedChange={(c) => setPicked((prev) => { const n = new Set(prev); if (c) n.add(s); else n.delete(s); return n; })} />
                    <span className="text-sm">{s}</span>
                  </label>
                ))}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={prev}>Back</Button>
            <Button type="submit">Continue</Button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={onDetails} className="grid gap-6 rounded-2xl border bg-card p-6 shadow-sm">
          <div className="grid gap-2">
            <Label htmlFor="experience">Experience</Label>
            <Textarea id="experience" name="experience" placeholder="List roles, responsibilities and achievements" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="education">Education</Label>
            <Textarea id="education" name="education" placeholder="Degrees, certifications" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="accommodations">Accommodations (optional)</Label>
            <Textarea id="accommodations" name="accommodations" placeholder="Assistive tech, preferred setup, etc" />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={prev}>Back</Button>
            <Button type="submit">Continue</Button>
          </div>
        </form>
      )}

      {step === 4 && (
        <div className="grid gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Preview</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={prev}>Edit</Button>
              <Button onClick={printCV}>Print / Download</Button>
            </div>
          </div>
          <div className="rounded-2xl border bg-white text-black p-6 shadow-sm print:shadow-none print:border-0">
            <h1 className="text-3xl font-bold">{data.name}</h1>
            <div className="text-sm">{data.email}{data.phone ? ` • ${data.phone}` : ""}{data.location ? ` • ${data.location}` : ""}</div>
            {data.summary && <p className="mt-4">{data.summary}</p>}
            {data.skills.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold">Skills</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {data.skills.map((s) => (
                    <span key={s} className="rounded-full border px-2 py-0.5 text-xs">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {data.experience && (
              <div className="mt-4">
                <h3 className="font-semibold">Experience</h3>
                <p className="whitespace-pre-wrap mt-1">{data.experience}</p>
              </div>
            )}
            {data.education && (
              <div className="mt-4">
                <h3 className="font-semibold">Education</h3>
                <p className="whitespace-pre-wrap mt-1">{data.education}</p>
              </div>
            )}
            {data.accommodations && (
              <div className="mt-4">
                <h3 className="font-semibold">Accommodations</h3>
                <p className="whitespace-pre-wrap mt-1">{data.accommodations}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
