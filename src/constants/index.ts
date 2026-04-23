export const DEFAULT_ROUTINES = [
  // exercise
  { name: 'Exercise 10 minutes',    name_ko: '10분 운동하기',            category: 'exercise' },
  { name: 'Morning stretch',         name_ko: '아침 스트레칭',            category: 'exercise' },
  { name: 'Walk 15 minutes',         name_ko: '15분 걷기',               category: 'exercise' },
  { name: 'Evening walk',            name_ko: '저녁 산책',               category: 'exercise' },
  // study
  { name: 'Read 10 minutes',         name_ko: '10분 독서하기',            category: 'study' },
  { name: 'Study 10 minutes',        name_ko: '10분 공부하기',            category: 'study' },
  { name: 'Review daily plan',       name_ko: '하루 계획 점검하기',        category: 'study' },
  { name: 'Review notes',            name_ko: '노트 복습하기',            category: 'study' },
  // productivity
  { name: "Write tomorrow's plan",   name_ko: '내일 계획 써두기',          category: 'productivity' },
  { name: 'Clear inbox',             name_ko: '받은 메일함 정리',          category: 'productivity' },
  { name: 'Daily review',            name_ko: '오늘 하루 되돌아보기',       category: 'productivity' },
  // life_habits
  { name: 'Drink water',             name_ko: '물 한 잔 마시기',           category: 'life_habits' },
  { name: 'Sleep by 11pm',           name_ko: '11시 전에 자기',           category: 'life_habits' },
  { name: 'No phone 1hr before bed', name_ko: '자기 1시간 전 폰 내려놓기', category: 'life_habits' },
  { name: 'Cook one meal',           name_ko: '직접 요리하기',            category: 'life_habits' },
  // self_improvement
  { name: 'Journal 5 minutes',       name_ko: '5분 일기 쓰기',            category: 'self_improvement' },
  { name: 'Meditate 5 minutes',      name_ko: '5분 명상하기',             category: 'self_improvement' },
  { name: 'Gratitude note',          name_ko: '감사 일기 쓰기',           category: 'self_improvement' },
  { name: 'Cold shower',             name_ko: '찬물 샤워하기',            category: 'self_improvement' },
];

export const MAX_ONBOARDING_ROUTINES = 3;
export const RECOVERY_TRIGGER_DAYS = 3;

export * from './nudges';
