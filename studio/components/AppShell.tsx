"use client";

import { usePathname } from "next/navigation";
import { TabBar } from "@/components/TabBar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const publicSite = pathname.startsWith("/s/") || pathname.startsWith("/preview/");
  if (publicSite) return <>{children}</>;

  return (
    <div className="studio-bg flex min-h-full flex-1 flex-col">
      <div className="flex flex-1 flex-col">{children}</div>
      <TabBar />
    </div>
  );
}
