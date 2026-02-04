import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { DyslexiaProvider } from "@/lib/DyslexiaContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Layout from "./components/layout/Layout";
import Employee from "./pages/Employee";
import Employer from "./pages/Employer";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import Saved from "./pages/Saved";
import PostJob from "./pages/PostJob";
import ResumeBuilder from "./pages/ResumeBuilder";
import Chat from "./pages/Chat";
import Resources from "./pages/Resources";

const queryClient = new QueryClient();

const App = () => (
  <DyslexiaProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><Index /></Layout>} />
          <Route path="/employee" element={<Layout><Employee /></Layout>} />
          <Route path="/employer" element={<Layout><Employer /></Layout>} />
          <Route path="/jobs" element={<Layout><Jobs /></Layout>} />
          <Route path="/jobs/:id" element={<Layout><JobDetails /></Layout>} />
          <Route path="/saved" element={<Layout><Saved /></Layout>} />
          <Route path="/post-job" element={<Layout><PostJob /></Layout>} />
          <Route path="/resume" element={<Layout><ResumeBuilder /></Layout>} />
          <Route path="/chat" element={<Layout><Chat /></Layout>} />
          <Route path="/resources" element={<Layout><Resources /></Layout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<Layout><NotFound /></Layout>} />
        </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
  </DyslexiaProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
