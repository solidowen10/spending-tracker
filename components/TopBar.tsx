"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";

interface TopBarProps {
  title?: string;
  backHref?: string;
}

const LOGO_SRC = "https://www.selinnaowen.com/wp-content/uploads/2026/06/tools-logo-1.png";
const SPENDING_ACCENT = "#FF8A3D";

const APP_NAV = [
  { label: "Dashboard", href: "/dashboard", icon: "Dashboard" },
  { label: "Entries", href: "/entries", icon: "Entries" },
  { label: "Settings", href: "/settings", icon: "Settings" },
];

const OTHER_TOOLS = [
  { label: "Shared Ledger", href: "https://tool.luruee.com/split-bill", icon: "🧾" },
  { label: "Receipt Scanner", href: "https://tool.luruee.com/receipt-scanner", icon: "📷" },
  { label: "Lifestyle Tracker", href: "https://tool.luruee.com/lifestyle-tracker", icon: "🌿" },
  { label: "All Tools", href: "https://tool.luruee.com/", icon: "🏠" },
];

const SHELL_STYLES = `
.luru-header {
  --shell-accent: #FF8A3D;
  position: sticky;
  top: 0;
  z-index: 1000;
  min-height: 74px;
  padding: 0 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid rgba(25, 29, 33, 0.1);
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(14px);
}

.luru-brand {
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 18px;
  color: #191D21;
  text-decoration: none;
}

.luru-brand-logo {
  width: 28px;
  height: 28px;
  flex: 0 0 auto;
  object-fit: contain;
}

.luru-app-name {
  min-width: 0;
  overflow: hidden;
  color: #171B20;
  font-family: var(--font-seasons);
  font-size: clamp(28px, 3.1vw, 40px);
  font-weight: 650;
  line-height: 1;
  letter-spacing: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.luru-app-name em {
  color: var(--shell-accent);
  font-style: italic;
}

.luru-back {
  color: var(--shell-accent);
  font-size: 20px;
  line-height: 1;
  text-decoration: none;
}

.luru-menu {
  position: relative;
  flex: 0 0 auto;
}

.luru-menu-button {
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(25, 29, 33, 0.12);
  border-radius: 8px;
  background: #FFFFFF;
  color: #30373D;
  cursor: pointer;
  font-size: 22px;
  line-height: 1;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.luru-menu-button:hover,
.luru-menu-button[aria-expanded="true"] {
  border-color: color-mix(in srgb, var(--shell-accent) 40%, transparent);
  background: color-mix(in srgb, var(--shell-accent) 9%, #FFFFFF);
  color: var(--shell-accent);
}

.luru-menu-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: min(260px, calc(100vw - 24px));
  padding: 8px;
  display: none;
  border: 1px solid rgba(25, 29, 33, 0.1);
  border-radius: 8px;
  background: #FFFFFF;
  box-shadow: 0 18px 42px rgba(21, 26, 31, 0.14);
}

.luru-menu-dropdown.is-open {
  display: block;
}

.luru-menu-label {
  padding: 8px 10px 5px;
  color: #8B949E;
  font-family: var(--font-seasons);
  font-size: 10px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 0;
  text-transform: uppercase;
}

.luru-menu-item {
  width: 100%;
  min-height: 40px;
  padding: 9px 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 8px;
  color: #273039;
  font-family: var(--font-seasons);
  font-size: 14px;
  font-weight: 650;
  line-height: 1.2;
  text-decoration: none;
  transition: background 0.12s ease, color 0.12s ease;
}

.luru-menu-item:hover {
  background: color-mix(in srgb, var(--shell-accent) 9%, #FFFFFF);
  color: #15191D;
}

.luru-menu-icon {
  width: 24px;
  flex: 0 0 24px;
  text-align: center;
  color: var(--shell-accent);
  font-size: 16px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0;
}

.luru-menu-divider {
  height: 1px;
  margin: 8px 4px;
  border: 0;
  background: rgba(25, 29, 33, 0.1);
}

.luru-menu-logout {
  color: #737B83;
}

.luru-menu-logout:hover {
  background: #FFF4F4;
  color: #C0392B;
}

@media (max-width: 520px) {
  .luru-header {
    padding: 0 14px;
    min-height: 62px;
  }

  .luru-brand {
    gap: 10px;
  }

  .luru-app-name {
    max-width: 58vw;
    font-size: 24px;
  }
}
`;

export default function TopBar({ backHref }: TopBarProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const shellStyle = { "--shell-accent": SPENDING_ACCENT } as CSSProperties;

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <style>{SHELL_STYLES}</style>
      <header className="luru-header" style={shellStyle}>
        {backHref && (
          <Link href={backHref} className="luru-back" aria-label="Go back">
            ←
          </Link>
        )}

        <Link href="/dashboard" className="luru-brand" aria-label="Spending Tracker home">
          <img className="luru-brand-logo" src={LOGO_SRC} alt="lürúee tools" />
          <span className="luru-app-name">
            Spending <em>Tracker</em>
          </span>
        </Link>

        <div className="luru-menu" ref={menuRef}>
          <button
            className="luru-menu-button"
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={open}
            aria-controls="luru-spending-menu"
            onClick={() => setOpen((value) => !value)}
          >
            ☰
          </button>

          <nav
            id="luru-spending-menu"
            className={`luru-menu-dropdown${open ? " is-open" : ""}`}
            aria-label="Tool navigation"
          >
            <div className="luru-menu-label">This app</div>
            {APP_NAV.map((item) => (
              <Link key={item.href} href={item.href} className="luru-menu-item" onClick={() => setOpen(false)}>
                <span className="luru-menu-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            ))}

            <hr className="luru-menu-divider" />
            <div className="luru-menu-label">Other tools</div>
            {OTHER_TOOLS.map((item) => (
              <a key={item.href} href={item.href} className="luru-menu-item" onClick={() => setOpen(false)}>
                <span className="luru-menu-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </a>
            ))}

            <hr className="luru-menu-divider" />
            <a className="luru-menu-item luru-menu-logout" href="/auth/logout?next=/spending-tracker/login">
              <span className="luru-menu-icon" aria-hidden="true">
                Logout
              </span>
              <span>Log out</span>
            </a>
          </nav>
        </div>
      </header>
    </>
  );
}
