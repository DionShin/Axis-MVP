export type PathwayEventType =
  | 'routine_added'
  | 'routine_stopped'
  | 'routine_restarted'
  | 'continuity_milestone'
  | 'inactivity_gap'
  | 'recovery_started';

export interface PathwayEvent {
  id: string;
  type: PathwayEventType;
  date: string;       // YYYY-MM-DD
  title: string;
  subtitle?: string;
  routineName?: string;
}
