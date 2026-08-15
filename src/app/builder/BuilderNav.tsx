"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/builder/bank", label: "bank" },
  { href: "/builder/roles", label: "roles" },
  { href: "/builder/compose", label: "compose" },
  { href: "/builder/strength", label: "strength" },
];

export default function BuilderNav() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-1">
      {TABS.map((t) => {
        const active = pathname === t.href || pathname.startsWith(t.href + "/");
        return (
          <Link key={t.href} href={t.href} className={`lego-navlink${active ? " active" : ""}`}>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
