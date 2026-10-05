"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SellPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/sell-car");
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--fa-background)]">
      <p className="text-sm font-medium text-[var(--fa-text)]">
        Opening ...
      </p>
    </main>
  );
}