"use client";

export default function SignOutButton() {
  return (
    <button
      onClick={() => {
        window.location.href = "/auth/logout?next=/";
      }}
      style={{
        width: "100%",
        padding: "0.85rem",
        borderRadius: "0.875rem",
        border: "1.5px solid var(--cherry)",
        background: "transparent",
        color: "var(--cherry)",
        fontFamily: "var(--font-seasons)",
        fontWeight: 600,
        fontSize: "0.95rem",
        cursor: "pointer",
        transition: "background 0.15s",
      }}
      onMouseOver={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#fff0f2")}
      onMouseOut={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
    >
      Sign out
    </button>
  );
}
