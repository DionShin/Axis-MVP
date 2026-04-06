# Axis MVP — Backlog

> 마지막 업데이트: 2026-04-03
> 스펙 기준 파일: `Axis.txt` (desktop)

---

## 🔴 피드백 기반 우선 작업

### 1. Suggestions 키워드 기준 만들기
- **현황**: `add-routine.tsx`에서 `DEFAULT_ROUTINES` 전체를 무조건 나열
- **문제**: 온보딩에서 선택한 goal category / difficulty와 무관하게 동일 목록 노출
- **개선 방향**:
  - 온보딩 `goalCategory` / `mainDifficulty` 기반으로 관련도 높은 루틴 먼저 표시
  - 이미 추가한 루틴은 Suggestions에서 제외
  - 예: exercise 선택한 유저 → 운동 관련 루틴 상단 노출

### ~~2. Category 직접 추가 기능~~ ✅ 완료
- `categoryStore.ts` — 커스텀 카테고리 Zustand + AsyncStorage 영속
- `CategoryPicker` 컴포넌트 — 기본 5개 + 커스텀 목록, 인라인 추가 UI
- `add-routine.tsx` / `edit/[id].tsx` 모두 적용

### 3. History 탭 — 루틴 pathway 디자인
- **현황**: 히트맵(GitHub contribution 방식) + 루틴별 달성률 카드
- **문제**: 루틴이 언제 시작/중단/재시작됐는지 흐름을 직관적으로 보기 어려움
- **개선 방향**: GitHub branch graph처럼 루틴별 타임라인을 수직/수평 레인으로 표현
  - 각 루틴 = 하나의 레인 (colored line)
  - 체크한 날 = 채워진 점, 미체크 = 빈 점
  - 루틴 시작/중단/재시작 지점 표시
  - 히트맵은 전체 요약으로 유지하고, 아래에 pathway view 추가

### 4. Routines 탭 필요성 검토
- **현황**: 탭바에 Home / History / Report / Routines / Settings 5개
- **검토 포인트**:
  - Routines 탭의 기능(루틴 목록 보기, 추가/수정/아카이브)이 Home에서도 접근 가능한지
  - 탭이 5개면 하단 바가 좁아짐 — 4개 탭으로 줄이고 Routines 관리를 Settings 또는 Home 내 메뉴로 이동하는 방안 검토
  - 결정 후 탭 구조 리팩토링

---

## 🟡 스펙 기반 미구현 항목

### 5. Recovery 알림 자동 트리거
- **스펙**: "3일 이상 체크 없으면 복귀 유도 알림"
- **현황**: `scheduleRecoveryReminder()` 함수는 있으나 자동 호출 로직 없음
- **개선**: 앱 실행 시 `daysSinceLastCheck` 확인 → 기준 초과 시 자동 스케줄

### 6. 루틴 상세 — 시각적 타임라인
- **스펙**: 9-8 Routine Detail Timeline (시작일, 중단일, 재시작 이력, 상태 변경 타임라인)
- **현황**: 텍스트 row로만 표시 (`routine/[id].tsx`)
- **개선**: 수직 타임라인 컴포넌트로 시각화 (점 + 선 + 날짜)

### 7. Completion Feedback 화면
- **스펙**: 9-6 모든 루틴 체크 완료 시 피드백 ("오늘 기록 완료", 이번 주 연속성, 지난주 대비 변화)
- **현황**: 없음 — 체크해도 홈 화면 그대로
- **개선**: 전체 체크 완료 시 간단한 요약 모달 또는 인라인 피드백 표시

### 8. 데이터 내보내기 (Settings)
- **스펙**: Settings > 데이터 내보내기 (향후)
- **현황**: 없음
- **우선순위**: 낮음 (post-MVP)

---

## 🔵 Post-MVP (스펙에서 명시적 제외)

### 9. 구독 / 프리미엄
- **스펙 Phase 4**: 고급 리포트, 월간/연간 비교, 복귀 추천 고도화, 루틴 성향 분석
- **과금 전략**: 14-15일 무료 체험 → 월간/연간 구독
- **현황**: Settings에 미구현 (Coming soon 제거 후 추가 예정)
- **우선순위**: 첫 출시 후 반응 보고 결정

---

## ✅ 완료된 항목

- [x] Phase 1: 온보딩, 탭 네비게이션, 루틴 생성, 홈 체크 화면
- [x] Phase 2: 체크 데이터 저장(Supabase), 주간/월간 히스토리, 루틴 관리, 복귀 모드
- [x] Phase 3: 리포트 화면, 알림(복수 시간 선택), 설정
- [x] 다크 모드 (토글, 전 화면 적용)
- [x] 알림 시간 선택 — iOS wheel picker UI, 복수 알림 지원
- [x] 로그아웃 버그 수정 (Expo Go 환경)
- [x] 90일 히스토리 데이터 연동
- [x] 루틴 상세 — 총 체크일 수 + 베스트 스트릭
