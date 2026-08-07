import { BackgroundFX } from "@/components/background";
import { Brand, BrandMark } from "@/components/brand";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  FolderKanban,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  Menu,
  Plus,
  Presentation,
  Settings,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/decks", label: "Decks", icon: Presentation },
  { to: "/templates", label: "Templates", icon: LayoutTemplate },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/wallet", label: "Wallet", icon: Wallet },
  { to: "/settings", label: "Settings", icon: Settings },
];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium transition-all duration-200",
              isActive
                ? "bg-gradient-to-r from-sky-500/90 to-indigo-500/90 text-white shadow-[0_8px_20px_rgba(99,102,241,0.35),inset_0_1px_0_rgba(255,255,255,0.35)]"
                : "text-sidebar-foreground/70 hover:bg-white/60 hover:text-foreground",
            )
          }
        >
          <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

function UserChip() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const initials =
    user?.name
      ?.split(/\s+/)
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "GP";

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch {
      /* noop */
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-2.5 rounded-xl border border-white/70 bg-white/50 px-2.5 py-2 text-left backdrop-blur-md transition hover:bg-white/70"
        >
          <Avatar className="h-8 w-8">
            {user?.image && <AvatarImage src={user.image} alt={user.name ?? ""} />}
            <AvatarFallback className="bg-gradient-to-br from-sky-400 to-indigo-500 text-[11px] font-semibold text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-semibold text-foreground">
              {user?.name || "Guest"}
            </span>
            <span className="block truncate text-[11px] text-muted-foreground">
              {user?.email || "anonymous workspace"}
            </span>
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top" className="w-56">
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
          Signed in as {user?.email || "guest"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative min-h-screen">
      <BackgroundFX particleCount={38} />

      {/* Desktop floating sidebar */}
      <aside className="glass-strong no-print fixed bottom-4 left-4 top-4 z-30 hidden w-64 flex-col rounded-2xl lg:flex">
        <Link to="/dashboard" className="px-5 pt-5">
          <Brand />
        </Link>
        <div className="px-5 pb-3 pt-5">
          <Link to="/dashboard">
            <Button className="w-full gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 shadow-[0_10px_24px_rgba(99,102,241,0.4)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(99,102,241,0.5)]">
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              New deck
            </Button>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto pb-2">
          <NavList />
        </div>
        <div className="px-3 pb-3">
          <UserChip />
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="no-print sticky top-0 z-30 flex items-center justify-between gap-3 px-4 py-3 lg:hidden">
        <Link to="/dashboard">
          <Brand />
        </Link>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="glass-soft h-10 w-10 rounded-xl">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 rounded-r-2xl border-r border-white/60 p-0">
            <SheetHeader className="border-b border-border/50 px-5 py-4 text-left">
              <SheetTitle asChild>
                <Link to="/dashboard" onClick={() => setOpen(false)}>
                  <Brand />
                </Link>
              </SheetTitle>
              <SheetDescription className="sr-only">Navigation</SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-3 px-4 py-4">
              <Link to="/dashboard" onClick={() => setOpen(false)}>
                <Button className="w-full gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500">
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                  New deck
                </Button>
              </Link>
              <NavList onNavigate={() => setOpen(false)} />
              <div className="mt-2">
                <UserChip />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      <main className="px-4 pb-14 pt-4 sm:px-6 lg:pl-[19.5rem] lg:pr-8 lg:pt-6">
        {children}
      </main>
    </div>
  );
}

export { BrandMark };
