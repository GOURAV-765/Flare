import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import { ALL_SKILLS } from "@/data/skills";
import { getSupabase } from "@/lib/supabase";

export default function EmployerSignUpForm() {
  const [skills, setSkills] = useState<Set<string>>(new Set());

  const grouped = useMemo(() => {
    const mid = Math.ceil(ALL_SKILLS.length / 2);
    return [ALL_SKILLS.slice(0, mid), ALL_SKILLS.slice(mid)];
  }, []);

  const toggle = (skill: string, checked: boolean | string) => {
    const next = new Set(skills);
    if (!!checked) next.add(skill);
    else next.delete(skill);
    setSkills(next);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const company = String(fd.get("companyName") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const yoeReq = Number(fd.get("yoeRequired") || 0);
    const minAge = Number(fd.get("minAge") || 0);
    const maxAge = Number(fd.get("maxAge") || 0);
    if (!company || !email || yoeReq < 0 || minAge <= 0 || maxAge <= 0 || minAge > maxAge || skills.size === 0) {
      toast.error("Fill company, email, age range, YOE required and select required skills.");
      return;
    }
    const payload = {
      companyName: company,
      contactPerson: fd.get("contactPerson"),
      email,
      phone: fd.get("phone"),
      location: fd.get("location"),
      website: fd.get("website"),
      roleTitle: fd.get("roleTitle"),
      jobDescription: fd.get("jobDescription"),
      yoeRequired: yoeReq,
      minAge,
      maxAge,
      requiredSkills: Array.from(skills),
    };
    const supabase = getSupabase();
    if (supabase) {
      await supabase.from("jobs").insert({
        company_name: payload.companyName,
        contact_person: payload.contactPerson,
        email: payload.email,
        phone: payload.phone,
        location: payload.location,
        website: payload.website,
        role_title: payload.roleTitle,
        job_description: payload.jobDescription,
        yoe_required: payload.yoeRequired,
        min_age: payload.minAge,
        max_age: payload.maxAge,
        required_skills: payload.requiredSkills,
      });
      toast.success("Employer account created and job saved.");
    } else {
      toast.info("Connected storage not configured. Connect Supabase to save jobs.");
    }
    (e.target as HTMLFormElement).reset();
    setSkills(new Set());
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="companyName">Company name</Label>
          <Input id="companyName" name="companyName" placeholder="Acme Corp" autoComplete="organization" aria-describedby="company-help" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="contactPerson">Contact person</Label>
          <Input id="contactPerson" name="contactPerson" placeholder="John Smith" autoComplete="name" aria-describedby="contact-help" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="hr@acme.com" autoComplete="email" aria-describedby="email-help" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" type="tel" placeholder="+1 555 000 0000" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="location">City / Country</Label>
          <Input id="location" name="location" placeholder="Remote / Bengaluru, India" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="website">Website</Label>
          <Input id="website" name="website" type="url" placeholder="https://company.com" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="yoeRequired">Years of experience required (YOE)</Label>
          <Input id="yoeRequired" name="yoeRequired" type="number" min={0} placeholder="1" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="minAge">Minimum age</Label>
          <Input id="minAge" name="minAge" type="number" min={14} placeholder="18" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="maxAge">Maximum age</Label>
          <Input id="maxAge" name="maxAge" type="number" min={14} placeholder="60" required />
        </div>
        <div className="md:col-span-2 grid gap-2">
          <Label htmlFor="roleTitle">Role you're hiring for</Label>
          <Input id="roleTitle" name="roleTitle" placeholder="Customer Support Associate" />
        </div>
      </div>

      <div className="grid gap-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <p id="company-help">Your legal company/organization name.</p>
          <p id="contact-help">Who should we contact about this job?</p>
          <p id="email-help">We’ll send applicants to this email.</p>
        </div>
        <Label>Required skills</Label>
        <p className="text-sm text-muted-foreground">Select all that apply</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {grouped.map((col, idx) => (
            <div key={idx} className="grid grid-cols-1 gap-3">
              {col.map((skill) => (
                <label key={skill} className="flex items-center gap-3">
                  <Checkbox
                    checked={skills.has(skill)}
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
        <Label htmlFor="jobDescription">Job details</Label>
        <Textarea id="jobDescription" name="jobDescription" placeholder="Describe the role, responsibilities, accessibility notes, and work setup" />
      </div>

      <Button type="submit" className="h-11">Create employer account</Button>
    </form>
  );
}
