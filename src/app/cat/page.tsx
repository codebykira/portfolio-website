import type { Metadata } from "next";
import CatViewer from "../../components/cat-viewer";

export const metadata: Metadata = {
  title: "cat",
  description: "A 3D cat you can turn around.",
};

export default function CatPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0b0b0f] px-6 py-12">
      <div className="w-full max-w-3xl">
        <CatViewer />
        <p className="mt-6 text-center text-sm text-white/40">
          drag to turn &middot; scroll to zoom &middot; click to pet
        </p>
      </div>
    </main>
  );
}
