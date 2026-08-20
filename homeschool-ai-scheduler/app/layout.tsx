import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HomeschoolAI Scheduler",
  description:
    "AI-powered homeschool pacing guide generator. Input grades, curricula, and schedule constraints to get a personalized weekly plan.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
