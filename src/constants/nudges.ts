export interface NudgeItem {
  id: string;
  category: string;
  text_ko: string;
  text_en: string;
}

export const NUDGE_CATEGORY_LABELS: Record<string, string> = {
  breathing: 'Breathing',
  posture:   'Posture',
  hydration: 'Hydration',
  eye_care:  'Eye Care',
  movement:  'Movement',
  focus:     'Focus',
};

export const NUDGE_CATEGORY_LABELS_KO: Record<string, string> = {
  breathing: '호흡',
  posture:   '자세',
  hydration: '수분 보충',
  eye_care:  '눈 건강',
  movement:  '움직임',
  focus:     '집중',
};

export const NUDGE_LIBRARY: NudgeItem[] = [
  // Breathing
  { id: 'breathing_1', category: 'breathing', text_ko: '구강호흡하고 계신가요?',        text_en: 'Are you mouth breathing?' },
  { id: 'breathing_2', category: 'breathing', text_ko: '코로 천천히 숨을 들이마셔 보세요.', text_en: 'Try breathing in slowly through your nose.' },
  { id: 'breathing_3', category: 'breathing', text_ko: '깊게 한 번 호흡해볼까요?',       text_en: 'How about taking a deep breath?' },
  // Posture
  { id: 'posture_1', category: 'posture', text_ko: '목 당기실 시간이에요!',          text_en: 'Time for a neck stretch!' },
  { id: 'posture_2', category: 'posture', text_ko: '허리를 곧게 펴보세요.',          text_en: 'Straighten your back.' },
  { id: 'posture_3', category: 'posture', text_ko: '어깨를 뒤로 펴볼까요?',          text_en: 'Roll your shoulders back.' },
  { id: 'posture_4', category: 'posture', text_ko: '턱을 당겨주세요. 거북목 주의!',   text_en: 'Tuck your chin in. Watch out for tech neck!' },
  // Hydration
  { id: 'hydration_1', category: 'hydration', text_ko: '물마실 시간입니다!',           text_en: 'Time to drink some water!' },
  { id: 'hydration_2', category: 'hydration', text_ko: '한 잔의 물, 지금 마셔볼까요?', text_en: 'How about a glass of water right now?' },
  { id: 'hydration_3', category: 'hydration', text_ko: '오늘 물 충분히 마셨나요?',     text_en: 'Have you had enough water today?' },
  // Eye Care
  { id: 'eye_1', category: 'eye_care', text_ko: '눈 깜빡임 기억하고 계신가요?',       text_en: 'Remember to blink!' },
  { id: 'eye_2', category: 'eye_care', text_ko: '20초 동안 먼 곳을 바라봐요.',        text_en: 'Look at something far away for 20 seconds.' },
  { id: 'eye_3', category: 'eye_care', text_ko: '눈을 잠깐 감고 쉬게 해주세요.',      text_en: 'Close your eyes for a moment and rest them.' },
  // Movement
  { id: 'movement_1', category: 'movement', text_ko: '잠깐 일어나서 스트레칭 어때요?',  text_en: 'How about standing up for a quick stretch?' },
  { id: 'movement_2', category: 'movement', text_ko: '30초 자리에서 일어나 걸어볼까요?', text_en: 'Stand up and walk for 30 seconds.' },
  { id: 'movement_3', category: 'movement', text_ko: '손목을 돌려볼까요?',              text_en: 'Try rotating your wrists.' },
  // Focus
  { id: 'focus_1', category: 'focus', text_ko: '지금 가장 중요한 한 가지는 무엇인가요?', text_en: 'What is the one most important thing right now?' },
  { id: 'focus_2', category: 'focus', text_ko: '멀티태스킹 줄이고 하나에 집중해봐요.',   text_en: 'Reduce multitasking and focus on one thing.' },
  { id: 'focus_3', category: 'focus', text_ko: '5분만 집중해볼까요?',                   text_en: 'Can you focus for just 5 minutes?' },
];
