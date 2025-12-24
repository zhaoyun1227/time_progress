export interface UserSettings {
  birthDate: string; // YYYY-MM-DD
  lifeExpectancy: number; // Years
  workStartTime: string; // HH:MM
  workEndTime: string; // HH:MM
  focusDuration: number; // Minutes
  hasOnboarded: boolean;
  workDays: number[]; // 0-6, where 0 is Sunday
  semester1Start: string; // MM-DD
  semester1End: string; // MM-DD
  semester2Start: string; // MM-DD
  semester2End: string; // MM-DD
}

export interface TimeProgress {
  percentage: number;
  label: string;
  subtext: string;
  colorClass: string;
  isActive: boolean;
}

export interface Quote {
  text: string;
  author: string;
}
