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
              font-family: "Plus Jakarta Sans", sans-serif;
              font-size: 13px;
              font-weight: 500;
              line-height: 1.45;
              letter-spacing: 0;
            }

            .luru-footer-link {
              color: var(--shell-accent);
              font-family: "Fredoka", sans-serif;
              font-size: 14px;
              font-weight: 600;
              line-height: 1.4;
              letter-spacing: 0;
              text-decoration: none;
            }

            .luru-footer-link:hover {
              text-decoration: underline;
            }
          `}</style>
          <p className="luru-footer-tagline">Small tools, built and self-hosted by Owen.</p>
          <a className="luru-footer-link" href="https://tool.selinnaowen.com/">
            lürú tools
          </a>
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
