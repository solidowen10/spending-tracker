"use client";

import { useState, type CSSProperties } from "react";
import BottomNav from "./BottomNav";
import AddEntrySheet from "./AddEntrySheet";

type Category = { id: string; name: string; emoji: string; color: string };

interface AppShellProps {
  children: React.ReactNode;
  categories: Category[];
  currency: string;
}

export default function AppShell({ children, categories, currency }: AppShellProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <div className="app-shell">
        {children}

        <footer className="luru-footer" style={{ "--shell-accent": "#FF8A3D" } as CSSProperties}>
          <style>{`
            .luru-footer {
              margin-top: 64px;
              padding: 28px 20px 112px;
              border-top: 1px solid rgba(25, 29, 33, 0.1);
              text-align: center;
            }

            .luru-footer-tagline {
              margin: 0 0 8px;
              color: #8B949E;
              font-family: var(--font-seasons);
              font-size: 13px;
              font-weight: 500;
              line-height: 1.45;
              letter-spacing: 0;
            }

            .luru-footer-link {
              color: var(--shell-accent);
              font-family: var(--font-seasons);
              font-size: 14px;
              font-weight: 600;
              line-height: 1.4;
              letter-spacing: 0;
              text-decoration: none;
            }

            .luru-footer-link:hover {
              text-decoration: underline;
            }

            .luru-footer-text {
              margin: 0;
              color: #8B949E;
              font-family: var(--font-seasons);
              font-size: 13px;
              font-weight: 650;
              line-height: 1.45;
              letter-spacing: 0;
            }
          `}</style>
          <p className="luru-footer-text">© lürúee tools</p>
        </footer>
      </div>

      <BottomNav onAdd={() => setSheetOpen(true)} />
      <AddEntrySheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        categories={categories}
        currency={currency}
      />
    </>
  );
}
