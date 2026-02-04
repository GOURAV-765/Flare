import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { getSaved } from "@/lib/saved";
import { Link } from "react-router-dom";
import PageAnnouncer from "@/components/accessibility/PageAnnouncer";

interface JobRow { id: number | string; company_name: string; role_title: string; location?: string; }

export default function Saved() {
  const [jobs, setJobs] = useState<JobRow[]>([]);

  useEffect(() => {
    const run = async () => {
      const ids = getSaved();
      const sb = getSupabase();
      if (sb && ids.length) {
        const { data } = await sb.from("jobs").select("id, company_name, role_title, location").in("id", ids);
        if (data) setJobs(data as unknown as JobRow[]);
      } else {
        setJobs(ids.map((id, i) => ({ id, company_name: "Saved Company" + (i+1), role_title: "Saved Role " + (i+1), location: "Remote" })));
      }
    };
    run();
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <PageAnnouncer title="Saved Jobs" description="View your list of saved jobs." />
      <h1 className="text-3xl font-bold tracking-tight">Saved jobs</h1>
      {jobs.length === 0 ? (
        <p className="mt-4 text-muted-foreground">No saved jobs yet. Browse the <Link to="/jobs" className="underline">jobs</Link>.</p>
      ) : (
        <ul className="mt-6 grid gap-3">
          {jobs.map((j) => (
            <li key={j.id} className="rounded-xl border bg-card p-4">
              <Link to={`/jobs/${j.id}`} className="font-semibold hover:underline">{j.role_title}</Link>
              <div className="text-sm text-muted-foreground">{j.company_name} • {j.location ?? "Remote"}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
