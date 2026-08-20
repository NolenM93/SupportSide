"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ScheduleInput, Child, Subject } from "@/lib/types";

const GRADE_OPTIONS = [
  "Pre-K", "Kindergarten", "1st", "2nd", "3rd", "4th",
  "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th",
];

const CURRICULUM_SUGGESTIONS = [
  "Math Mammoth",
  "Saxon Math",
  "Singapore Math",
  "Story of the World",
  "Well-Trained Mind",
  "Sonlight",
  "Apologia Science",
  "IEW Writing",
  "Classical Conversations",
  "Other",
];

const SUBJECT_SUGGESTIONS = [
  "Math", "Reading", "Language Arts", "Writing", "History",
  "Science", "Latin", "Art", "Music", "PE",
];

function emptySubject(): Subject {
  return { name: "", curriculum: "", totalLessons: 100, minutesPerLesson: 30 };
}

function emptyChild(): Child {
  return { name: "", grade: "1st", subjects: [emptySubject()] };
}

export default function SchedulePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const defaultEnd = new Date();
  defaultEnd.setMonth(defaultEnd.getMonth() + 9);

  const [form, setForm] = useState<ScheduleInput>({
    children: [emptyChild()],
    startDate: today,
    endDate: defaultEnd.toISOString().split("T")[0],
    schoolDaysPerWeek: 5,
    dailyHours: 5,
  });

  function updateChild(i: number, field: keyof Child, value: string) {
    setForm((prev) => {
      const children = [...prev.children];
      children[i] = { ...children[i], [field]: value };
      return { ...prev, children };
    });
  }

  function updateSubject(ci: number, si: number, field: keyof Subject, value: string | number) {
    setForm((prev) => {
      const children = [...prev.children];
      const subjects = [...children[ci].subjects];
      subjects[si] = { ...subjects[si], [field]: value };
      children[ci] = { ...children[ci], subjects };
      return { ...prev, children };
    });
  }

  function addChild() {
    setForm((prev) => ({ ...prev, children: [...prev.children, emptyChild()] }));
  }

  function removeChild(i: number) {
    setForm((prev) => ({
      ...prev,
      children: prev.children.filter((_, idx) => idx !== i),
    }));
  }

  function addSubject(ci: number) {
    setForm((prev) => {
      const children = [...prev.children];
      children[ci] = {
        ...children[ci],
        subjects: [...children[ci].subjects, emptySubject()],
      };
      return { ...prev, children };
    });
  }

  function removeSubject(ci: number, si: number) {
    setForm((prev) => {
      const children = [...prev.children];
      children[ci] = {
        ...children[ci],
        subjects: children[ci].subjects.filter((_, idx) => idx !== si),
      };
      return { ...prev, children };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/generate-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Unknown error");
      }
      const guide = await res.json();
      sessionStorage.setItem("pacingGuide", JSON.stringify(guide));
      router.push("/results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <span className="text-xl">📚</span>
          <span className="font-bold text-gray-900">HomeschoolAI</span>
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Your Schedule
          </h1>
          <p className="text-gray-500">
            Fill in your details and we&apos;ll generate a personalized pacing
            guide.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Schedule Constraints */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-900 text-lg mb-4">
              📅 Schedule Constraints
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  value={form.startDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, startDate: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  required
                  value={form.endDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, endDate: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School Days / Week
                </label>
                <select
                  value={form.schoolDaysPerWeek}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      schoolDaysPerWeek: Number(e.target.value),
                    }))
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {[3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n} days
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Daily Hours
                </label>
                <select
                  value={form.dailyHours}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      dailyHours: Number(e.target.value),
                    }))
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {[2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>
                      {n} hours
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Children */}
          {form.children.map((child, ci) => (
            <section
              key={ci}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 text-lg">
                  🧒 Child {ci + 1}
                </h2>
                {form.children.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeChild(ci)}
                    className="text-sm text-red-400 hover:text-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Emma"
                    value={child.name}
                    onChange={(e) => updateChild(ci, "name", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grade
                  </label>
                  <select
                    value={child.grade}
                    onChange={(e) => updateChild(ci, "grade", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    {GRADE_OPTIONS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subjects */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-700 text-sm">Subjects</h3>
                {child.subjects.map((subject, si) => (
                  <div
                    key={si}
                    className="bg-gray-50 rounded-xl p-4 border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Subject {si + 1}
                      </span>
                      {child.subjects.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSubject(ci, si)}
                          className="text-xs text-red-400 hover:text-red-600"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Subject Name
                        </label>
                        <input
                          type="text"
                          required
                          list={`subjects-${ci}-${si}`}
                          placeholder="e.g. Math"
                          value={subject.name}
                          onChange={(e) =>
                            updateSubject(ci, si, "name", e.target.value)
                          }
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                        />
                        <datalist id={`subjects-${ci}-${si}`}>
                          {SUBJECT_SUGGESTIONS.map((s) => (
                            <option key={s} value={s} />
                          ))}
                        </datalist>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Curriculum
                        </label>
                        <input
                          type="text"
                          required
                          list={`curricula-${ci}-${si}`}
                          placeholder="e.g. Math Mammoth"
                          value={subject.curriculum}
                          onChange={(e) =>
                            updateSubject(ci, si, "curriculum", e.target.value)
                          }
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                        />
                        <datalist id={`curricula-${ci}-${si}`}>
                          {CURRICULUM_SUGGESTIONS.map((c) => (
                            <option key={c} value={c} />
                          ))}
                        </datalist>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Total Lessons
                        </label>
                        <input
                          type="number"
                          required
                          min={1}
                          max={500}
                          value={subject.totalLessons}
                          onChange={(e) =>
                            updateSubject(
                              ci,
                              si,
                              "totalLessons",
                              Number(e.target.value)
                            )
                          }
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Minutes / Lesson
                        </label>
                        <input
                          type="number"
                          required
                          min={5}
                          max={120}
                          value={subject.minutesPerLesson}
                          onChange={(e) =>
                            updateSubject(
                              ci,
                              si,
                              "minutesPerLesson",
                              Number(e.target.value)
                            )
                          }
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addSubject(ci)}
                  className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                >
                  + Add Subject
                </button>
              </div>
            </section>
          ))}

          <button
            type="button"
            onClick={addChild}
            className="w-full border-2 border-dashed border-gray-200 rounded-2xl py-4 text-gray-400 hover:border-amber-300 hover:text-amber-500 transition-colors font-medium"
          >
            + Add Another Child
          </button>

          {error && (
            <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-bold text-lg py-4 rounded-xl transition-colors"
          >
            {loading ? "Generating your schedule…" : "Generate Schedule →"}
          </button>
        </form>
      </div>
    </div>
  );
}
