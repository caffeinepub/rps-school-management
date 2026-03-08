import {
  CalendarCheck,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Users,
  Wallet,
} from "lucide-react";
import type { Page } from "../App";

interface NavItem {
  page: Page;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  ocid: string;
}

const navItems: NavItem[] = [
  {
    page: "dashboard",
    label: "डैशबोर्ड",
    sublabel: "Dashboard",
    icon: LayoutDashboard,
    ocid: "nav.dashboard_link",
  },
  {
    page: "students",
    label: "छात्र",
    sublabel: "Students",
    icon: Users,
    ocid: "nav.students_link",
  },
  {
    page: "teachers",
    label: "शिक्षक",
    sublabel: "Teachers",
    icon: GraduationCap,
    ocid: "nav.teachers_link",
  },
  {
    page: "attendance",
    label: "उपस्थिति",
    sublabel: "Attendance",
    icon: CalendarCheck,
    ocid: "nav.attendance_link",
  },
  {
    page: "results",
    label: "परिणाम",
    sublabel: "Results",
    icon: FileText,
    ocid: "nav.results_link",
  },
  {
    page: "fees",
    label: "शुल्क",
    sublabel: "Fees",
    icon: Wallet,
    ocid: "nav.fees_link",
  },
];

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  return (
    <nav className="sidebar-gradient h-full flex flex-col text-sidebar-foreground">
      {/* Logo / School name */}
      <div className="px-5 py-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-white/10 flex items-center justify-center">
            <img
              src="/assets/generated/rps-school-logo-transparent.dim_160x160.png"
              alt="RPS School Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-tight text-white">
              RPS School
            </h1>
            <p className="text-xs text-sidebar-foreground/60 leading-tight">
              School Management
            </p>
          </div>
        </div>
      </div>

      {/* Navigation items */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider px-3 mb-3">
          मुख्य मेनू
        </p>
        {navItems.map((item) => {
          const isActive = currentPage === item.page;
          const Icon = item.icon;
          return (
            <button
              type="button"
              key={item.page}
              data-ocid={item.ocid}
              onClick={() => onNavigate(item.page)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left
                transition-all duration-150 group
                ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-sm"
                    : "hover:bg-sidebar-accent/60 text-sidebar-foreground/80 hover:text-white"
                }
              `}
            >
              <Icon
                className={`h-5 w-5 shrink-0 ${isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/60 group-hover:text-white"}`}
              />
              <div className="min-w-0">
                <div className="text-sm leading-tight truncate">
                  {item.label}
                </div>
                <div
                  className={`text-xs leading-tight truncate ${isActive ? "text-sidebar-primary-foreground/70" : "text-sidebar-foreground/40"}`}
                >
                  {item.sublabel}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-foreground/40 text-center">
          © {new Date().getFullYear()} RPS School
        </p>
        <p className="text-xs text-sidebar-foreground/30 text-center mt-0.5">
          Built with{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sidebar-primary/70 hover:text-sidebar-primary transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </nav>
  );
}
