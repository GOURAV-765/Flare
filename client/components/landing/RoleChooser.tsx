import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Briefcase, UserCheck } from "lucide-react";

export type RoleChoice = "employee" | "employer";

export default function RoleChooser({ onChoose, className }: { onChoose: (c: RoleChoice) => void; className?: string }) {
  return (
    <div className={cn("grid gap-6 sm:grid-cols-2", className)}>
      <RoleCard
        title="I’m a job seeker"
        description="Create your profile, add skills, age and YOE—we’ll match you to inclusive roles."
        icon={<UserCheck className="h-6 w-6" />}
        cta="Continue as job seeker"
        onClick={() => onChoose("employee")}
      />
      <RoleCard
        title="I’m an employer"
        description="Post a role with required skills, YOE and age range and find qualified talent."
        icon={<Briefcase className="h-6 w-6" />}
        cta="Continue as employer"
        onClick={() => onChoose("employer")}
        buttonClassName="mt-5"
      />
    </div>
  );
}

function RoleCard({ title, description, icon, cta, onClick, buttonClassName }: { title: string; description: string; icon: React.ReactNode; cta: string; onClick: () => void; buttonClassName?: string }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm">
      <div className="absolute -inset-1 bg-gradient-to-t from-primary/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <div className="mt-6">
          <Button onClick={onClick} className={cn("w-full sm:w-auto", buttonClassName)}>{cta}</Button>
        </div>
      </div>
    </div>
  );
}
