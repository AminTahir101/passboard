# Passboard iOS App — Design Spec

**Date:** 2026-10-11  
**Status:** Approved  
**Platform:** iOS 17+ (iPad primary, iPhone supported)  
**Architecture:** SwiftUI + MVVM + `supabase-swift`

---

## 1. Project Structure

The Xcode project lives at `PassboardiOS/` inside the monorepo root.

```
PassboardiOS/
├── PassboardiOS.xcodeproj
├── PassboardiOS/
│   ├── PassboardiOSApp.swift          # @main entry, injects AppState into environment
│   ├── AppState.swift                 # @Observable — auth session, profile, language
│   ├── Config.xcconfig                # SUPABASE_URL, SUPABASE_ANON_KEY (gitignored)
│   ├── Supabase/
│   │   └── SupabaseClient.swift       # Singleton client, reads Config values
│   ├── Features/
│   │   ├── Auth/
│   │   │   ├── LoginView.swift
│   │   │   ├── LoginViewModel.swift
│   │   │   └── AccessRequestView.swift
│   │   ├── Dashboard/
│   │   │   ├── DashboardView.swift
│   │   │   └── DashboardViewModel.swift
│   │   ├── Practice/
│   │   │   ├── PracticeSetupView.swift
│   │   │   ├── PracticeSessionView.swift
│   │   │   ├── PracticeResultsView.swift
│   │   │   └── PracticeViewModel.swift
│   │   ├── MockExam/
│   │   │   ├── MockExamSetupView.swift
│   │   │   ├── MockExamSessionView.swift
│   │   │   ├── MockExamResultsView.swift
│   │   │   └── MockExamViewModel.swift
│   │   ├── StudyPlan/
│   │   │   ├── StudyPlanView.swift
│   │   │   ├── StudyPlanSetupView.swift
│   │   │   └── StudyPlanViewModel.swift
│   │   ├── AIChat/
│   │   │   ├── AIChatListView.swift
│   │   │   ├── AIChatView.swift
│   │   │   └── AIChatViewModel.swift
│   │   └── Profile/
│   │       ├── ProfileView.swift
│   │       └── ProfileViewModel.swift
│   ├── Models/
│   │   ├── Profile.swift
│   │   ├── Question.swift
│   │   ├── QuestionAttempt.swift
│   │   ├── MockExam.swift
│   │   ├── MockExamQuestion.swift
│   │   ├── MockAnswer.swift
│   │   ├── StudyPlan.swift
│   │   ├── StudyTask.swift
│   │   ├── AiConversation.swift
│   │   └── AiMessage.swift
│   ├── Services/
│   │   ├── AuthService.swift
│   │   ├── ProfileService.swift
│   │   ├── QuestionService.swift
│   │   ├── MockExamService.swift
│   │   ├── StudyPlanService.swift
│   │   └── AIChatService.swift
│   ├── Navigation/
│   │   ├── RootView.swift             # Switches between SplitView (iPad) and TabView (iPhone)
│   │   └── SidebarView.swift          # iPad persistent sidebar
│   ├── Components/
│   │   ├── CardView.swift
│   │   ├── StatCard.swift
│   │   ├── ProgressRing.swift
│   │   ├── QuestionOptionRow.swift
│   │   └── LoadingOverlay.swift
│   └── Localization/
│       └── Localizable.xcstrings      # String Catalog — EN + AR
├── PassboardiOSTests/
│   └── (unit tests — ViewModels with mock services)
└── PassboardiOSUITests/
    └── (UI tests — login, practice session, language toggle)
```

---

## 2. Architecture

### Pattern: SwiftUI + MVVM + `@Observable`

- **`AppState`** — single `@Observable` class injected via `.environment`. Holds: `session` (Supabase auth session), `profile` (loaded after login), `language` (EN/AR). All views read from it; auth changes propagate automatically via `supabase.auth.authStateChanges`.
- **ViewModels** — one `@Observable` class per feature screen. Scoped to the view's lifetime. Calls into a Service for all data operations.
- **Services** — plain Swift classes (no `@Observable`), one per domain. Wrap `supabase-swift` calls. Defined behind a protocol for testability.
- **No global store** — state stays local to each feature unless it belongs in `AppState` (auth, profile, language).

### Data flow

```
View → ViewModel → Service → supabase-swift → Supabase (PostgREST / Auth / Edge Functions)
                                    ↑
                              AppState (auth session)
```

---

## 3. Data Models

All models are `Codable` + `Identifiable`, using `snake_case` CodingKeys to match PostgREST column names.

| Swift Model | DB Table | Notes |
|---|---|---|
| `Profile` | `profiles` | Loaded into `AppState` after login |
| `Question` | `questions` | Fetched per-practice/mock session |
| `QuestionAttempt` | `question_attempts` | Written after each practice answer |
| `MockExam` | `mock_exams` | Created at session start |
| `MockExamQuestion` | `mock_exam_questions` | Junction: exam ↔ questions |
| `MockAnswer` | `mock_answers` | Written per answer during mock |
| `StudyPlan` | `study_plans` | One per user |
| `StudyTask` | `study_tasks` | Many per plan |
| `AiConversation` | `ai_conversations` | Chat thread |
| `AiMessage` | `ai_messages` | Individual messages |

Enums mirror DB types: `UserRole`, `AccessStatus`, `Difficulty`, `QuestionStatus`, `CorrectAnswer`, `MessageRole`, task `phase` and `task_type`.

---

## 4. Supabase Integration

**Client** — singleton in `SupabaseClient.swift`, reads `SUPABASE_URL` and `SUPABASE_ANON_KEY` from `Config.xcconfig` at build time.

**Auth**
- Email/password via `supabase.auth.signIn(email:password:)`
- Sign in with Apple via `supabase.auth.signInWithIdToken` — Apple credential → Supabase JWT
- Session persisted to Keychain automatically by the SDK
- Cold launch: SDK restores session; `AppState` listens to `authStateChanges` async stream
- `AppState.profile` loaded once after session established, refreshed on profile update

**Database queries** — PostgREST via `supabase.from("table").select()` etc. All calls are `async throws`.

**AI Chat** — streaming responses via the existing Supabase Edge Function (`/functions/v1/ai-chat`). Uses `URLSession` async bytes stream, same endpoint as the web app.

**Secrets** — `Config.xcconfig` is gitignored. Developer copies `Config.xcconfig.example` locally. CI injects values via environment variables at build time.

---

## 5. Navigation

### iPad (regular horizontal size class)
`NavigationSplitView` with a persistent sidebar. Sidebar items:
1. Dashboard
2. Practice
3. Mock Exams
4. Study Plan
5. AI Chat
6. Profile

Detail column shows the selected feature. Sub-navigation within a feature (e.g. Setup → Session → Results) uses `NavigationStack` inside the detail column.

### iPhone (compact horizontal size class)
`TabView` with 5 tabs: Dashboard, Practice, Mock Exams, Study Plan, Profile. AI Chat accessible from Dashboard quick actions and question results. Sub-navigation uses `NavigationStack` per tab.

### Adaptive switch
`RootView` reads `@Environment(\.horizontalSizeClass)` and renders `NavigationSplitView` or `TabView` accordingly. Same codebase — no duplicate views.

---

## 6. Features

### Auth
- Login: email/password fields + "Sign in with Apple" button (required by App Store guidelines when any sign-in is offered)
- Access request form: full name, email, phone, target exam, expected date, notes → writes to `access_requests` table
- Error states: wrong credentials, no access (access_status ≠ active), network failure
- Redirects to Dashboard on successful login

### Dashboard
- Stats row: days to exam (uses plan's `exam_date` if plan exists, else profile's), accuracy %, questions attempted, streak
- "Today's Study Plan" section: today's tasks with Start buttons (only shown when plan exists)
- Quick actions grid: Practice, Mock Exam, Study Plan, AI Chat
- All data fetched in parallel on appear; skeleton loading state

### Practice
- **Setup**: mode selector (By Category, By Topic, Incorrect Only), exam filter, category/topic picker (cascading), question count slider (5–100)
- **Session**: one question per screen, A–D option rows, Submit → show correct/incorrect feedback + justification, Next button, flag toggle, progress bar
- **Results**: score card, accuracy ring, per-question review list (expandable), "Back to Study Plan" button when launched from a study task (passes `plan_task_id`), auto-ticks task complete via PATCH on session finish
- iPad layout: question text left column, options + explanation right column

### Mock Exam
- **Setup**: question count (50 or 100), optional time limit
- **Session**: timer (top bar on iPad, bottom bar on iPhone), question text + options, flag button; question navigator grid (iPad: sidebar panel; iPhone: toolbar button → sheet); can jump to any question
- **Results**: score, percentage, time taken, per-question review
- Writes `mock_exams` row on start, `mock_answers` rows per answer, updates `completed_at`/`score`/`percentage` on finish

### Study Plan
- **Setup wizard**: exam selector, exam date picker, study days (weekday toggles), questions/day slider (5–100), optional weekly mock (day picker + 50/100 count), focus specialties chip selector; live summary preview
- **Plan view**: days-left count, current phase badge (Foundation/Reinforcement/Final Review), progress %, missed tasks section, today's tasks, week accordion calendar; checkbox to mark tasks complete; Start button links to correct session type
- **Edit/rebuild**: keeps completed tasks, regenerates incomplete future ones from today

### AI Chat
- **Per-question**: launched from practice/mock results with question context pre-loaded as system message; shows question + conversation thread
- **Standalone**: conversation list view (master) + active chat (detail) in split view on iPad; single stack on iPhone
- Streaming: displays assistant response token-by-token via Edge Function stream
- Stores conversations + messages in `ai_conversations` / `ai_messages`

### Profile
- Display: full name, email, target exam, exam date, access status
- Language toggle: EN ↔ AR button — updates `UserDefaults` + `AppState.language`, flips layout direction immediately, no restart
- Sign out: clears session, returns to Login

---

## 7. Localization

- **String Catalog**: `Localizable.xcstrings` — single file, both languages, Xcode 15+ native format
- **RTL**: SwiftUI mirrors most layouts automatically with `.environment(\.layoutDirection, ...)`. Custom components (option rows, progress bars, stat cards) explicitly respect layout direction.
- **Language persistence**: stored in `UserDefaults` key `"app_language"`, read into `AppState` on launch, toggled from Profile without restart
- **Scope**: all user-facing strings localized. Error messages, empty states, button labels all in the catalog.

---

## 8. Design Language

- **Minimum iOS**: 17.0 (required for `@Observable`, String Catalogs, `NavigationSplitView` refinements)
- **Icons**: SF Symbols throughout — no custom icon assets
- **Colors**: single `AccentColor` in `Assets.xcassets` matching web brand; semantic system colors for backgrounds/text (automatic dark mode support)
- **Typography**: SF Pro (system font); Arabic uses system Arabic variant automatically
- **Components**: `CardView`, `StatCard`, `ProgressRing`, `QuestionOptionRow`, `LoadingOverlay` — reused across features
- **Dark mode**: supported via semantic colors; no hardcoded color values

---

## 9. Dependencies

| Package | Purpose |
|---|---|
| `supabase-swift` (via SPM) | Auth, PostgREST, realtime, Edge Function calls |

No other third-party dependencies. All other functionality uses native SwiftUI, Foundation, AuthenticationServices (Sign in with Apple).

---

## 10. Testing

- **Unit tests**: ViewModels tested with mock Services (protocol-based injection). Cover: login flow, question fetching, study plan generation logic, task completion.
- **UI tests**: login → dashboard, complete a 5-question practice session, toggle language EN↔AR.
- **No snapshot tests**: too brittle for bilingual RTL layouts.

---

## 11. Out of Scope

- Admin panel (web-only)
- Push notifications (future)
- Offline mode (online-only)
- App Store submission / provisioning profiles (separate step)

---

## 12. Security

- `Config.xcconfig` gitignored; `Config.xcconfig.example` committed with placeholder values
- Supabase anon key is safe to embed in the client (RLS enforces row-level security, same as web)
- Sign in with Apple: Apple credential exchanged for Supabase JWT server-side — no raw Apple token stored
- Keychain used for session persistence (SDK default)
