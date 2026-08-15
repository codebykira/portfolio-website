import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { pixelFont, displayFont, bodyFont } from "@/lib/fonts";
import BuilderNav from "./BuilderNav";
import SignOutButton from "./SignOutButton";
import "./builder.css";

export const metadata = { title: "Résumé Builder" };

export default async function BuilderLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className={`${pixelFont.variable} ${displayFont.variable} ${bodyFont.variable} builder-root`}>
      <div className="builder-frame">
        <header className="lego-topbar">
          <span className="lego-brand">
            <span className="lego-brand-mark" aria-hidden />
            résumé.build
          </span>
          <BuilderNav />
          <div className="ml-auto flex items-center gap-3">
            <span className="lego-label hidden sm:inline" style={{ letterSpacing: "0.06em" }}>
              {user.email}
            </span>
            <SignOutButton />
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
      </div>
    </div>
  );
}
