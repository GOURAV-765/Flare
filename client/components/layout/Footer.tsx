export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8 text-sm text-muted-foreground flex flex-col md:flex-row items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} PWD Jobs. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <a href="#employee" className="hover:text-foreground">For job seekers</a>
          <a href="#employer" className="hover:text-foreground">For employers</a>
        </div>
      </div>
    </footer>
  );
}
