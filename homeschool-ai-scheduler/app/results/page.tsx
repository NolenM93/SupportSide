"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PacingGuide, WeekEntry } from "@/lib/types";

export default function ResultsPage() {
  const router = useRouter();
  const [guide, setGuide] = useState<PacingGuide | null>(null);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1);

  useEffect(() => {
    const raw = sessionStorage.getItem("pacingGuide");
    if (!raw) {
      router.push("/schedule");
      return;
    }
    setGuide(JSON.parse(raw));
  }, [router]);

  if (!guide) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading…</div>
      </div>
    );
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 print:hidden">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">📚</span>
            <span className="font-bold text-gray-900">HomeschoolAI</span>
          </Link>
          <div className="flex gap-3">
            <Link
              href="/schedule"
              className="text-sm text-gray-500 hover:text-gray-800 font-medium px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              ← Edit Schedule
            </Link>
            <button
              onClick={handlePrint}
              className="text-sm bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              🖨️ Print / Save PDF
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full mb-3">
            ✅ Schedule Generated
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {guide.title}
          </h1>
          <p className="text-gray-500">{guide.summary}</p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Weeks", value: guide.totalWeeks },
            {
              label: "Avg. Lessons/Week",
              value: guide.weeks[0]?.lessons.length ?? 0,
            },
            { label: "Subjects Tracked", value: guide.weeks[0]?.lessons.length ?? 0 },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center"
            >
              <div className="text-2xl font-bold text-amber-500">{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Week accordion */}
        <div className="space-y-3">
          {guide.weeks.map((week: WeekEntry) => (
            <WeekCard
              key={week.week}
              week={week}
              isOpen={expandedWeek === week.week}
              onToggle={() =>
                setExpandedWeek(expandedWeek === week.week ? null : week.week)
              }
            />
          ))}
        </div>

        <div className="mt-10 text-center print:hidden">
          <Link
            href="/schedule"
            className="inline-block text-amber-600 hover:text-amber-700 font-medium"
          >
            ← Generate a new schedule
          </Link>
        </div>
      </div>
    </div>
  );
}

function WeekCard({
  week,
  isOpen,
  onToggle,
}: {
  week: WeekEntry;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden print:border print:rounded-none print:shadow-none">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors print:hidden"
      >
        <div>
          <span className="font-semibold text-gray-900">Week {week.week}</span>
          <span className="ml-3 text-sm text-gray-400">{week.dateRange}</span>
        </div>
        <span className="text-gray-400 text-lg">{isOpen ? "▲" : "▼"}</span>
      </button>

      {/* Always visible in print */}
      <div
        className={`print:block ${isOpen ? "block" : "hidden"} border-t border-gray-100`}
      >
        <div className="p-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 print:block hidden">
            Week {week.week} · {week.dateRange}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 pb-2 pr-4">
                    Child
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 pb-2 pr-4">
                    Subject
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 pb-2 pr-4">
                    Curriculum
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 pb-2 pr-4">
                    Lessons
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 pb-2">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {week.lessons.map((lesson, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="py-2.5 pr-4 font-medium text-gray-800">
                      {lesson.childName}
                    </td>
                    <td className="py-2.5 pr-4 text-gray-700">
                      {lesson.subject}
                    </td>
                    <td className="py-2.5 pr-4 text-gray-500 text-xs">
                      {lesson.curriculum}
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className="inline-flex items-center justify-center bg-amber-100 text-amber-700 font-semibold text-xs rounded-full w-7 h-7">
                        {lesson.lessonsToComplete}
                      </span>
                    </td>
                    <td className="py-2.5 text-gray-500 text-xs max-w-xs">
                      {lesson.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
