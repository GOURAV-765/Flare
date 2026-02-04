import ResourcesHub from "@/components/resources/ResourcesHub";
import PageAnnouncer from "@/components/accessibility/PageAnnouncer";

export default function Resources() {
  return (
    <div className="container mx-auto px-4 py-10">
      <PageAnnouncer title="Resources Hub" description="Learn new skills with beginner-friendly videos, articles, and guides." />
      <h1 className="text-4xl font-extrabold tracking-tight">Resources Hub</h1>
      <p className="mt-2 text-muted-foreground">Learn new skills with beginner-friendly videos, articles, and guides. Earn points, levels, and badges as you progress.</p>
      <ResourcesHub />
    </div>
  );
}
