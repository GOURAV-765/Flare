import RoleChooser, { RoleChoice } from "@/components/landing/RoleChooser";
import InclusiveIllustration from "@/components/landing/InclusiveIllustration";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import PageAnnouncer from "@/components/accessibility/PageAnnouncer";

export default function Index() {
  const navigate = useNavigate();
  const choose = (type: RoleChoice) => navigate(type === "employee" ? "/employee" : "/employer");

  return (
    <div className="bg-background">
      <PageAnnouncer title="Home" description="Welcome to PWD Jobs. Find work or hire talent with confidence." />
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,theme(colors.primary.DEFAULT)/0.12,transparent_45%),radial-gradient(ellipse_at_bottom_right,theme(colors.primary.DEFAULT)/0.1,transparent_45%)]" />
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div className="space-y-6">
              <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs text-muted-foreground">Inclusive hiring for everyone</span>
              <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
                Find work. Hire talent.
              </h1>
              <p className="text-lg text-muted-foreground max-w-prose">
                A modern job portal bridging persons with disabilities and inclusive employers.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" onClick={() => choose("employee")} className="rounded-full">I’m a job seeker</Button>
                <Button size="lg" variant="outline" onClick={() => choose("employer")} className="rounded-full">I’m an employer</Button>
              </div>
              <ul className="grid grid-cols-2 gap-3 text-sm text-muted-foreground pt-2">
                <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" />No sign‑in needed to explore</li>
                <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" />Accessible by design</li>
                <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" />Skill‑based matching</li>
                <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" />Global opportunities</li>
              </ul>
            </div>
            <div className="relative">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-primary/40 to-primary/0 blur-2xl" aria-hidden />
              <div className="relative rounded-3xl border bg-card p-6 shadow-lg">
                <InclusiveIllustration className="w-full h-auto" />
              </div>
            </div>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border bg-card p-6">
              <h3 className="font-semibold">Choose your path</h3>
              <p className="mt-2 text-sm text-muted-foreground">Start as a job seeker or an employer.</p>
            </div>
            <div className="rounded-3xl border bg-card p-6">
              <h3 className="font-semibold">Build accessible profiles</h3>
              <p className="mt-2 text-sm text-muted-foreground">Use inclusive forms and skill tags.</p>
            </div>
            <div className="rounded-3xl border bg-card p-6">
              <h3 className="font-semibold">Match and apply</h3>
              <p className="mt-2 text-sm text-muted-foreground">Browse jobs and quick‑apply without barriers.</p>
            </div>
          </div>

          <div className="mt-10">
            <div className="rounded-3xl border bg-card p-6">
              <RoleChooser onChoose={choose} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
