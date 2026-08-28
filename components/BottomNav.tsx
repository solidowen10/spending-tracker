"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, List, Settings, Grid2X2 } from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard, external: false },
  { href: "/entries", label: "Entries", Icon: List, external: false },
  { href: "https://tool.luruee.com/", label: "Tools", Icon: Grid2X2, external: true },
  { href: "/settings", label: "Settings", Icon: Settings, external: false },
];

interface BottomNavProps {
  onAdd: () => void;
}

export default function BottomNav({ onAdd }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        {NAV.map(({ href, label, Icon, external }, i) => {
          const active = !external && pathname.startsWith(href);
          const fab = i === 2 ? (
            <button key="fab" onClick={onAdd} aria-label="Add entry" className="bottom-nav-fab">
              +
            </button>
          ) : null;

          const item = external ? (
            <a key={href} href={href} className="bottom-nav-link">
              <Icon size={22} strokeWidth={1.8} />
              {label}
            </a>
          ) : (
            <Link key={href} href={href} className={`bottom-nav-link ${active ? "active" : ""}`}>
              <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
              {label}
            </Link>
          );

          return [fab, item];
        })}
      </div>
    </nav>
  );
}
