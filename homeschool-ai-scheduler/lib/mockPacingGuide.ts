import { ScheduleInput, PacingGuide, WeekEntry } from "./types";

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function generateMockPacingGuide(input: ScheduleInput): PacingGuide {
  const start = new Date(input.startDate);
  const end = new Date(input.endDate);
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const totalWeeks = Math.max(1, Math.round((end.getTime() - start.getTime()) / msPerWeek));

  const weeks: WeekEntry[] = [];

  for (let w = 0; w < totalWeeks; w++) {
    const weekStart = addDays(start, w * 7);
    const weekEnd = addDays(weekStart, input.schoolDaysPerWeek - 1);

    const lessons: WeekEntry["lessons"] = [];

    for (const child of input.children) {
      for (const subject of child.subjects) {
        // Distribute lessons evenly across weeks
        const basePerWeek = Math.floor(subject.totalLessons / totalWeeks);
        const extra = w < (subject.totalLessons % totalWeeks) ? 1 : 0;
        const count = basePerWeek + extra;

        if (count > 0) {
          lessons.push({
            childName: child.name,
            subject: subject.name,
            curriculum: subject.curriculum,
            lessonsToComplete: count,
            notes: generateNote(subject.curriculum, w, count),
          });
        }
      }
    }

    weeks.push({
      week: w + 1,
      dateRange: `${formatDate(weekStart)} – ${formatDate(weekEnd)}`,
      lessons,
    });
  }

  const childSummary = input.children
    .map((c) => `${c.name} (Grade ${c.grade})`)
    .join(", ");

  return {
    title: "Homeschool Pacing Guide",
    totalWeeks,
    summary: `Personalized ${totalWeeks}-week pacing guide for ${childSummary}. Scheduled ${input.schoolDaysPerWeek} school days/week, ${input.dailyHours} hours/day.`,
    weeks,
  };
}

function generateNote(curriculum: string, week: number, count: number): string {
  const notes: Record<string, string[]> = {
    "Math Mammoth": [
      "Focus on number sense and fact fluency.",
      "Work through included practice pages.",
      "Use mental math warm-ups before each lesson.",
      "Check cumulative review pages at end of chapter.",
    ],
    "Story of the World": [
      "Read chapter aloud, then narrate back.",
      "Complete mapwork activity.",
      "Pick one of the suggested projects.",
      "Review timeline figures after reading.",
    ],
    "Well-Trained Mind": [
      "Follow classical sequence for this week.",
      "Integrate grammar and writing exercises.",
      "Include logic stage activities.",
    ],
  };

  const fallback = [
    "Complete assigned lessons and review.",
    `Aim for ${count} focused sessions this week.`,
    "Review previous week before starting new material.",
  ];

  const pool = notes[curriculum] ?? fallback;
  return pool[week % pool.length];
}
