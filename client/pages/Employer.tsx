import EmployerSignUpForm from "@/components/forms/EmployerSignUpForm";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import PageAnnouncer from "@/components/accessibility/PageAnnouncer";

export default function Employer() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <PageAnnouncer title="Employer Profile" description="Create your employer profile and specify your hiring requirements." />
      <div className="flex items-center justify-between gap-4 mb-4">
        <h1 className="text-3xl font-bold tracking-tight">Hire inclusively with confidence</h1>
        <div className="flex items-center gap-2">
          <Link to="/jobs"><Button variant="outline">Skip for now</Button></Link>
          <Link to="/"><Button variant="ghost">Back</Button></Link>
        </div>
      </div>
      <p className="mt-2 mb-6 text-muted-foreground">Specify required skills, age range and YOE for the role.</p>
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <EmployerSignUpForm />
      </div>
    </div>
  );
}
