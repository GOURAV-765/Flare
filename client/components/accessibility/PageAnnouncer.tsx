import { useEffect } from "react";
import { useDyslexia } from "@/lib/DyslexiaContext";

interface PageAnnouncerProps {
  title: string;
  description?: string;
}

export default function PageAnnouncer({ title, description }: PageAnnouncerProps) {
  const { announceSection } = useDyslexia();

  useEffect(() => {
    // Announce the section when the component mounts
    announceSection(title, description);
  }, [title, description, announceSection]);

  return null; // This is an invisible component, only for announcements
}
