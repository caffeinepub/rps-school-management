import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Attendance from "./pages/Attendance";
import Dashboard from "./pages/Dashboard";
import Fees from "./pages/Fees";
import Results from "./pages/Results";
import Students from "./pages/Students";
import Teachers from "./pages/Teachers";

export type Page =
  | "dashboard"
  | "students"
  | "teachers"
  | "attendance"
  | "results"
  | "fees";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = (page: Page) => {
    setCurrentPage(page);
    setSidebarOpen(false);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "students":
        return <Students />;
      case "teachers":
        return <Teachers />;
      case "attendance":
        return <Attendance />;
      case "results":
        return <Results />;
      case "fees":
        return <Fees />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
          role="button"
          tabIndex={-1}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 lg:flex-shrink-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <Sidebar currentPage={currentPage} onNavigate={navigate} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar for mobile */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-card border-b border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="shrink-0"
          >
            {sidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
          <span className="font-display font-bold text-lg text-foreground">
            RPS School
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">{renderPage()}</main>
      </div>

      <Toaster richColors position="top-right" />
    </div>
  );
}
