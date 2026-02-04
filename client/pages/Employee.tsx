import EmployeeSignUpForm from "@/components/forms/EmployeeSignUpForm";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import PageAnnouncer from "@/components/accessibility/PageAnnouncer";

export default function Employee() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <PageAnnouncer title="Job Seeker Profile" description="Create your profile and tell employers about your skills and experience." />
      <div className="flex items-center justify-between gap-4 mb-4">
        <h1 className="text-3xl font-bold tracking-tight">Create your job‑seeker profile</h1>
        <div className="flex items-center gap-2">
          <Link to="/jobs"><Button variant="outline">Skip for now</Button></Link>
          <Link to="/"><Button variant="ghost">Back</Button></Link>
        </div>
      </div>
      <p className="mt-2 mb-6 text-muted-foreground">Add your age, years of experience (YOE), and select your skills.</p>
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <EmployeeSignUpForm />
      </div>
    </div>
  );
}
