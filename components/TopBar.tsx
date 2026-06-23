"use client";

import Link from "next/link";
import { useState } from "react";

interface TopBarProps {
  title: string;
  backHref?: string;
}

export default function TopBar({ backHref }: TopBarProps) {
  const [open, setOpen] = useState(false);
  return (
    <header className="topbar">
      <div className="topbar-inner">
        {backHref && (
          <Link href={backHref} className="topbar-back">
            ←
          </Link>
        )}

        <a href="/spending-tracker/dashboard" className="topbar-brand">
          <img
            src="https://www.selinnaowen.com/wp-content/uploads/2026/06/tools-logo-1.png"
            alt="lürú tools"
            className="topbar-logo"
          />
          <span className="topbar-title">Spending <em>Tracker</em></span>
        </a>

        <div className="topbar-menu-wrap">
          <button className="topbar-menu-btn" onClick={() => setOpen(!open)} aria-label="Open menu">☰</button>
          {open && (
            <div className="topbar-menu">
              <a href="/lifestyle-tracker">Lifestyle Tracker</a>
              <a href="https://tool.selinnaowen.com/split-bill/">Shared Ledger</a>
              <hr />
              <a href="/spending-tracker/api/auth/sign-out">Log Out</a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
