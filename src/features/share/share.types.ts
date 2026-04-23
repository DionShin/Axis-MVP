export type ShareTemplate = 'monthly' | 'recovery' | 'milestone';

export interface ShareData {
  // ─── Template 1: Monthly Summary ──────────────────────────────────
  currentMonthLabel: string;          // "4월"
  monthCompletionRate: number;        // 0–1
  topRoutineName: string | null;      // most checks this month
  continuedRoutineCount: number;      // routines with ≥1 check this month
  activeRoutineCount: number;
  restartCount: number;               // routines restarted this month

  // ─── Template 2: Recovery Comeback ────────────────────────────────
  hasComeback: boolean;
  inactivityGapDays: number;          // length of most recent 3+ day gap
  comebackDateLabel: string;          // "4월 3일"

  // ─── Template 3: Milestone ─────────────────────────────────────────
  milestoneRoutineName: string | null;
  milestoneDays: number;              // 7, 14, or 30
  longestStreak: number;
}
