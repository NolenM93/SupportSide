export interface Subject {
  name: string;
  curriculum: string;
  totalLessons: number;
  minutesPerLesson: number;
}

export interface Child {
  name: string;
  grade: string;
  subjects: Subject[];
}

export interface ScheduleInput {
  children: Child[];
  startDate: string;
  endDate: string;
  schoolDaysPerWeek: number;
  dailyHours: number;
}

export interface WeekEntry {
  week: number;
  dateRange: string;
  lessons: {
    childName: string;
    subject: string;
    curriculum: string;
    lessonsToComplete: number;
    notes: string;
  }[];
}

export interface PacingGuide {
  title: string;
  totalWeeks: number;
  summary: string;
  weeks: WeekEntry[];
}
