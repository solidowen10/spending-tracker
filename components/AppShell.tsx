"use client";

import { useState } from "react";
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

        <footer className="app-footer">
          <div className="app-footer-divider" />
          <p>A tool to track your spending.</p>
          <p>
            ©{" "}
            <a href="https://tool.selinnaowen.com/">
              lürú tools
            </a>
          </p>
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
