export type GoalCategory = 'exercise' | 'study' | 'productivity' | 'life_habits' | 'self_improvement';
export type MainDifficulty = 'starting' | 'consistency' | 'restarting';
export type FrequencyType = 'daily' | 'weekly';
export type RoutineStatus = 'active' | 'archived';
export type RoutineEventType = 'created' | 'archived' | 'restarted' | 'edited';
export type PeriodType = 'weekly' | 'monthly';

export interface User {
  id: string;
  email: string;
  nickname: string;
  onboarding_completed: boolean;
  goal_category: GoalCategory | null;
  main_difficulty: MainDifficulty | null;
  reminder_time: string | null;
  created_at: string;
}

export interface Routine {
  id: string;
  user_id: string;
  name: string;
  category: string;
  frequency_type: FrequencyType;
  frequency_value: number;
  preferred_time: string | null;
  status: RoutineStatus;
  created_at: string;
  archived_at: string | null;
  restarted_at: string | null;
}

export interface RoutineCheck {
  id: string;
  user_id: string;
  routine_id: string;
  date: string;
  checked: boolean;
  checked_at: string;
}

export interface RoutineEvent {
  id: string;
  user_id: string;
  routine_id: string;
  event_type: RoutineEventType;
  event_payload: Record<string, unknown> | null;
  created_at: string;
}

export interface InsightReport {
  id: string;
  user_id: string;
  period_type: PeriodType;
  start_date: string;
  end_date: string;
  summary_text: string;
  best_routine_id: string | null;
  worst_routine_id: string | null;
  created_at: string;
}
