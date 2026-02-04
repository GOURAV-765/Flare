export default function InclusiveIllustration({ className }: { className?: string }) {
  // Accessible inline SVG illustration representing inclusive workplaces
  return (
    <svg
      className={className}
      viewBox="0 0 480 360"
      role="img"
      aria-label="Illustration of diverse people, including a wheelchair user, collaborating at work"
    >
      <defs>
        <linearGradient id="bg" x1="0" x2="1">
          <stop offset="0" stopColor="hsl(var(--primary) / 0.12)" />
          <stop offset="1" stopColor="hsl(var(--primary) / 0.02)" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" rx="24" fill="url(#bg)" />
      {/* Desk */}
      <rect x="60" y="210" width="360" height="16" rx="8" fill="hsl(var(--foreground) / 0.1)" />
      {/* Seated person */}
      <circle cx="140" cy="140" r="20" fill="hsl(var(--foreground) / 0.85)" />
      <rect x="120" y="160" width="40" height="40" rx="8" fill="hsl(var(--foreground) / 0.75)" />
      <rect x="120" y="200" width="60" height="10" rx="5" fill="hsl(var(--primary))" />
      {/* Wheelchair user */}
      <circle cx="300" cy="150" r="18" fill="hsl(var(--foreground) / 0.85)" />
      <rect x="280" y="168" width="42" height="28" rx="8" fill="hsl(var(--foreground) / 0.75)" />
      <circle cx="330" cy="210" r="22" fill="none" stroke="hsl(var(--foreground) / 0.5)" strokeWidth="6" />
      <circle cx="290" cy="210" r="18" fill="none" stroke="hsl(var(--foreground) / 0.4)" strokeWidth="6" />
      <path d="M284 192 L312 206" stroke="hsl(var(--foreground) / 0.5)" strokeWidth="6" strokeLinecap="round" />
      {/* Plants */}
      <rect x="60" y="182" width="14" height="28" rx="4" fill="hsl(var(--primary))" />
      <path d="M67 182 C57 170, 77 168, 67 156 C57 168, 77 170, 67 182" fill="hsl(var(--primary) / 0.6)" />
      <rect x="406" y="182" width="14" height="28" rx="4" fill="hsl(var(--primary))" />
      <path d="M413 182 C403 170, 423 168, 413 156 C403 168, 423 170, 413 182" fill="hsl(var(--primary) / 0.6)" />
      {/* Screen */}
      <rect x="190" y="118" width="100" height="64" rx="8" fill="hsl(var(--background))" stroke="hsl(var(--foreground) / 0.15)" />
      <rect x="200" y="128" width="60" height="10" rx="5" fill="hsl(var(--primary) / 0.7)" />
      <rect x="200" y="144" width="80" height="8" rx="4" fill="hsl(var(--foreground) / 0.15)" />
      <rect x="200" y="158" width="76" height="8" rx="4" fill="hsl(var(--foreground) / 0.12)" />
    </svg>
  );
}
