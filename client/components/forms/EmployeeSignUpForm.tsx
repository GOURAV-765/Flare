import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ALL_SKILLS } from "@/data/skills";
import { getSupabase } from "@/lib/supabase";

export default function EmployeeSignUpForm() {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (skill: string, checked: boolean | string) => {
    const next = new Set(selected);
    if (!!checked) next.add(skill);
    else next.delete(skill);
    setSelected(next);
  };

  const grouped = useMemo(() => {
    const mid = Math.ceil(ALL_SKILLS.length / 2);
    return [ALL_SKILLS.slice(0, mid), ALL_SKILLS.slice(mid)];
  }, []);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("fullName") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const age = Number(fd.get("age") || 0);
    const experience = Number(fd.get("experience") || 0);
    if (!name || !email || !age || experience < 0 || selected.size === 0) {
      toast.error("Provide name, email, age, YOE and select at least 1 skill.");
      return;
    }
    const payload = {
      fullName: name,
      email,
      phone: fd.get("phone"),
      location: fd.get("location"),
      age,
      experience,
      portfolio: fd.get("portfolio"),
      accommodations: fd.get("accommodations"),
      skills: Array.from(selected),
    };
    const supabase = getSupabase();
    if (supabase) {
      await supabase.from("employees").insert({
        full_name: payload.fullName,
        email: payload.email,
        phone: payload.phone,
        location: payload.location,
        age: payload.age,
        yoe: payload.experience,
        portfolio: payload.portfolio,
        accommodations: payload.accommodations,
        skills: payload.skills,
      });
      toast.success("Profile saved. We’ll match roles to your skills.");
    } else {
      toast.info("Connected storage not configured. Connect Supabase to save profiles.");
    }
    (e.target as HTMLFormElement).reset();
    setSelected(new Set());
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" name="fullName" placeholder="Jane Doe" autoComplete="name" aria-describedby="fullName-help" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="jane@example.com" autoComplete="email" aria-describedby="email-help" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" type="tel" placeholder="+1 555 000 0000" autoComplete="tel" aria-describedby="phone-help" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="location">City / Country</Label>
          <Input id="location" name="location" placeholder="Delhi, India" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="age">Age</Label>
          <Input id="age" name="age" type="number" min={14} placeholder="25" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="experience">Years of experience (YOE)</Label>
          <Input id="experience" name="experience" type="number" min={0} placeholder="2" required />
        </div>
        <div className="grid gap-2 md:col-span-2">
          <Label htmlFor="portfolio">Portfolio / Resume URL</Label>
          <Input id="portfolio" name="portfolio" type="url" placeholder="https://..." />
        </div>
      </div>

      <div className="grid gap-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <p id="fullName-help">Enter your full legal name.</p>
          <p id="email-help">We’ll only use this to contact you about jobs.</p>
          <p id="phone-help">Optional. Include country code.</p>
        </div>
        <Label>Skills</Label>
        <p className="text-sm text-muted-foreground">Select all that apply</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {grouped.map((col, idx) => (
            <div key={idx} className="grid grid-cols-1 gap-3">
              {col.map((skill) => (
                <label key={skill} className="flex items-center gap-3">
                  <Checkbox
                    checked={selected.has(skill)}
                    onCheckedChange={(c) => toggle(skill, c)}
                    aria-label={skill}
                  />
                  <span>{skill}</span>
                </label>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="accommodations">Accommodations (optional)</Label>
        <Textarea
          id="accommodations"
          name="accommodations"
          placeholder="Tell us any accommodations or assistive technologies you use, preferred work setup, etc."
        />
      </div>

      <Button type="submit" className="h-11">Create my job-seeker profile</Button>
    </form>
  );
}
