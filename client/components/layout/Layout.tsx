import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr_auto]">
      <Header />
      <main id="main">{children}</main>
      <div id="a11y-status" className="sr-only" aria-live="polite" aria-atomic="true"></div>
      <div id="a11y-announcer" className="sr-only" aria-live="assertive" aria-atomic="true"></div>
      <Footer />
    </div>
  );
}
