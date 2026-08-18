# NeuroEcho — Full Project Context

This document is meant to be pasted whole into any AI model (Claude, GPT, Gemini, etc.) at the start of a session to give it complete, accurate working context on this project. It reflects the actual current state of the code, not aspirational or planned features.

---

## 1. What NeuroEcho Is

NeuroEcho is a voice-first cognitive training app for older adults ("seniors"). The core idea: standard app UIs (small buttons, nested menus) are hard for elderly users, so the app is built around a conversational AI companion named **Echo** that the user can just talk to — "open Spot the AI Lie," "how am I doing," "make me an Antakshari game" — instead of navigating menus. It also has four hand-built cognitive mini-games, a progress dashboard, and a system that lets an AI generate entirely new games on request.

Tagline used in copy: *"Training minds in real time. Caring for seniors in real time."* / *"Speak. Play. Remember."*

Target users: seniors, many with larger system font sizes, possible tremor, and low tech confidence. Every UI decision should be evaluated against that.

---

## 2. Repository & Branch

- GitHub: `jainpranitx-spec/neuroecho`
- Active development branch: **`latest`** (not `main` — `main` is stale/legacy)
- Repo owner/admin: `jainpranitx-spec` (Pranit Jain). The account used for CLI operations in this project (`sanjith-cozsmer`) has **push + triage but NOT admin** — cannot change repo settings, default branch, etc. Some GitHub Actions permissions (e.g. "Allow Actions to create PRs") require the owner to toggle in Settings.
- Repo is a **monorepo** with two independent apps at the root:
  - `neuroecho-mobile/` — the actual product (Expo/React Native app)
  - `neuroecho-cognitive-arcade-prototype-v3/` — the backend (Next.js API-only, no UI)
- There is an older, now-unused local Desktop copy at `~/Desktop/aiSymposiumNew/neuroecho` — **do not use it**, it lives inside iCloud Drive sync scope which causes intermittent git corruption. The real working copy is at `~/neuroecho-dev/` (outside iCloud sync).

---

## 3. Architecture

### 3.1 Mobile app (`neuroecho-mobile/`)
- **Expo SDK 54**, React Native 0.81.5, React 19.1.0, TypeScript.
- Styling: **NativeWind v4** (Tailwind classes via `className`, e.g. `className="flex-1 bg-white dark:bg-zinc-900"`).
- Navigation: **React Navigation v7** — a root `NativeStackNavigator` (`RootNavigator.tsx`) wrapping a `BottomTabNavigator` (`MainTabs.tsx`: Hub / Analytics / Settings tabs) plus stack screens for each game and for AI-generated games.
- State/context providers (nested in `App.tsx`, order matters):
  `GestureHandlerRootView > SafeAreaProvider > ThemeProvider > AccessibilityProvider > LanguageProvider > AudioOutputProvider > AppShell`
  Inside `AppShell`: `ErrorBoundary > AiModalProvider > NavigationContainer(+ AiAssistantModal, AiCompanion mounted as siblings)`.
- Tested exclusively via **Expo Go** on physical devices (iOS and Android) — no custom dev client, no EAS build in the normal dev loop. This is an important constraint: **any library requiring native code changes (e.g. real-time camera frame processors, native STT) cannot be used**, since Expo Go only bundles Expo's own official native modules.

### 3.2 Backend (`neuroecho-cognitive-arcade-prototype-v3/`)
- **Next.js 16 (App Router)**, API-route-only — no pages/UI. It was originally a full web app; the UI was stripped out during the RN conversion and now it exists purely to serve `/api/*` routes to the mobile app, plus host the GitHub-Actions-triggering game-request endpoint.
- ORM: **Drizzle ORM** over **PostgreSQL** hosted on **Supabase** (pooler connection, port 6543).
- Deployed target: Vercel (deployment workflow exists but has not been confirmed fully live — most testing happens against a locally-run backend on a LAN).
- package name is `neuroecho-api`.

### 3.3 Local dev networking model (important, causes recurring support issues)
Because Expo Go runs on a physical phone, not an emulator, and there's no deployed backend reliably in use, the normal dev workflow is:
1. Run the backend locally: `cd neuroecho-cognitive-arcade-prototype-v3 && npx next dev -H 0.0.0.0 -p 3000` (the `-H 0.0.0.0` is mandatory — without it, Next only listens on localhost and no other device can reach it).
2. Run Metro: `cd neuroecho-mobile && npx expo start -c`.
3. Mobile app's `.env.local` must have `EXPO_PUBLIC_API_URL=http://<host-machine-LAN-IP>:3000` — **not** `localhost` (that would point the phone at itself).
4. Phone must be on the same WiFi/LAN as the host machine (or use `adb reverse tcp:3000 tcp:3000` + `adb reverse tcp:8081 tcp:8081` over USB with `EXPO_PUBLIC_API_URL=http://localhost:3000` if the network has client/AP isolation blocking device-to-device traffic — this has been a recurring real problem on some routers).
5. Env var changes require a full Expo restart (`-c` to clear cache) — editing `.env.local` while Metro is already running does nothing until restart.
6. Common failure mode diagnosed repeatedly: "Network error" on every API call from the phone = phone can't reach the backend at all (wrong/stale IP, backend not running, or Windows Firewall/router isolation blocking it) — distinct from a *status-code* error (e.g. 503), which means the phone *can* reach the backend fine and it's returning a real (often config-related) error.

---

## 4. AI Integration — Important Architectural Decision

**All AI calls are made directly from the mobile client to Google's Gemini API**, using the `@google/generative-ai` npm package and an `EXPO_PUBLIC_GEMINI_API_KEY` env var baked into the app bundle. This was a deliberate, explicit choice by the project owner after being warned of the tradeoff: baking the key into the client bundle means it's technically extractable by anyone who inspects the app binary. A safer backend-proxied version was built and then explicitly reverted at the owner's request. **Do not re-propose moving this server-side without being asked** — it's a known, accepted tradeoff for this project's current stage (hackathon/demo), not an oversight.

The backend *also* has parallel Gemini-calling routes (`/api/ai/query`, `/api/ai/story`, `/api/ai/companion`) left over from an earlier architecture — these still exist and work, but are **not currently called by the mobile app** for the main chat/companion/game-gen features (which all call Gemini client-side via `src/lib/api.ts`). Don't assume the backend AI routes are what's live in the app.

Model used throughout: **`gemini-3.6-flash`**. All structured-output calls use `responseMimeType: "application/json"` + a `SchemaType`-based `responseSchema` (from `@google/generative-ai`) — note the enum fields require `format: "enum"` alongside `enum: [...]`, or TypeScript will reject the schema.

### 4.1 Client-side AI functions (`neuroecho-mobile/src/lib/api.ts`)
- `askAi(query, language)` — the "Ask AI" text assistant (Sparkles button in the header). Returns `{ answer, sources }`. Includes math-formatting cleanup (strips LaTeX the model sometimes emits).
- `askCompanion(audioBase64, mimeType, history, language)` — the voice companion "Echo." Takes recorded audio (see §5), returns `{ transcript, reply, action }` where `action.type` is one of `navigate_game | navigate_screen | generate_game | none`, with `target`, `startAfterNavigate`, and `gamePrompt` fields depending on type. Single Gemini call does transcription + intent detection + reply generation together via the schema.
- `generateGame(prompt, language)` — used by both the voice companion's `generate_game` action and (indirectly, server-side) the community game-request pipeline. Produces a `GeneratedGameDefinition` (see §7).
- `classifyHandGesture(imageBase64)` — used by Motion Match for camera-based hand detection (see §6.4). Returns `"left" | "right" | "none"`.

### 4.2 Known issue: the Gemini key can silently expire/rotate
Mid-session, the `EXPO_PUBLIC_GEMINI_API_KEY` in use (format started with `AQ.`, not the usual `AIzaSy...` prefix of a normal API key) stopped working entirely — every call, even the simplest text-only one, failed with `401 Unauthorized: Expected OAuth 2 access token`. This strongly suggests it was actually a short-lived OAuth-style token, not a permanent API key, and it expired. **If AI features stop working across the board (not just one feature), check the key's validity first** with a minimal test call before assuming a code bug. A fresh key should come from **aistudio.google.com/apikey** and should start `AIzaSy...`.

### 4.3 Free-tier quota risk
Also discovered: Google's free tier for `gemini-3.6-flash` caps at **20 requests/day** per project. This was exhausted during heavy testing in one session. If AI features become intermittently unavailable / slow with retry delays, check for `429` quota errors before assuming a bug. Recommend the project owner upgrade to a pay-as-you-go plan for reliable multi-person testing.

---

## 5. Voice Companion ("Echo") — Full Technical Detail

- UI: `src/components/AiCompanion.tsx` — a floating mic FAB (bottom-right, position-aware of the tab bar) that opens a full-screen conversational modal.
- Recording: `expo-audio`, using a **custom low-bitrate preset** (`VOICE_RECORDING_OPTIONS` in `src/lib/audioMode.ts`) — 16kHz mono, 32kbps AAC/.m4a — deliberately much smaller than the default HIGH_QUALITY preset (44.1kHz stereo 128kbps) to cut upload/processing latency, since Gemini only needs clear speech, not music quality. This was a real fix for reported "Echo takes forever" complaints.
- **Audio routing bug (fixed)**: enabling microphone recording switches the phone's audio session into a "phone call" category, which on iOS routes subsequent playback through the earpiece speaker instead of the loudspeaker. Fixed by explicitly switching back to a playback-only audio mode (`setPlaybackAudioMode()` in `audioMode.ts`) the instant recording stops. There's also a Settings toggle for loudspeaker vs. earpiece output — functional on Android (`shouldRouteThroughEarpiece`), but **iOS has no such override available in expo-audio**, so iOS always uses the loudspeaker (documented limitation, not a bug).
- History: last 10 turns kept in a ref and sent with each request for conversational context. Reset automatically when the user switches app language (previously left stale-language replies behind — fixed).
- Navigation side-effects: a `navigationRef.ts` module (`createNavigationContainerRef`) lets the companion navigate programmatically from outside the component tree. `navigateToGame`, `navigateToTab`, `navigateToGeneratedGame` helpers.
- In-game control: a lightweight `src/lib/screenActions.ts` registry lets whichever game screen is currently focused register a `start` handler; the companion can say "open X and start it" (`action.startAfterNavigate`) and it'll navigate then call the registered start function ~500ms later (giving the new screen time to mount). Currently wired up in `SpotAiLieScreen` (starts story playback) and `MotionMatchScreen` (starts the gesture stage). Recipe Rebuilder and Era Guesser have no "start" gate — they're playable immediately, so nothing to trigger.
- Voice output quality: `src/lib/speech.ts` looks up and caches the best available "Enhanced"-quality system TTS voice per language via `expo-speech`'s `getAvailableVoicesAsync()`, instead of using the OS default voice (which sounds noticeably robotic). `allowFontScaling`-style OS interference is deliberately avoided here too — see §8.

---

## 6. The Four Built-in Games

All in `src/screens/games/`. Common patterns across all of them:
- A `HowToPlay` component (`src/components/HowToPlay.tsx`) renders 2-4 numbered instruction steps at the top of each game screen, with a 🔊 read-aloud button (`speakFeedback`). This was added because the app originally had zero in-game guidance.
- **Re-entry guard pattern**: every game uses a `useRef<boolean>` lock (e.g. `hasBuzzedRef`, `hasGuessedRef`, `actionLockRef`) alongside the equivalent `useState`, specifically because **state reads are stale across two events landing in the same render tick** (e.g. a double-tap) — the ref updates synchronously and is what actually gates re-entry; the state is just for rendering. This pattern is used consistently and intentionally — don't "simplify" it to state-only.
- Session results are saved via `api.saveSession()` → `POST /api/sessions` → written to the `game_sessions` table, which also updates `totalXp` on the `user_profiles` row.

### 6.1 Spot the AI Lie (`SpotAiLieScreen.tsx`)
Reads a short AI-generated (or preset) story aloud sentence-by-sentence; the user has to buzz in the instant they hear a fabricated/incorrect detail. Has a custom-topic generation flow via `api.generateStory()` (→ backend `/api/ai/story`, still server-side).

### 6.2 Era Guesser (`EraGuesserScreen.tsx`)
Shows a stylized "diorama" scene from a historical decade with one anachronistic item; user taps the item that doesn't belong.

### 6.3 Recipe Rebuilder (`RecipeRebuilderScreen.tsx`)
Steps of a recipe are scrambled; user reorders them via up/down arrow buttons per step, then verifies.
**Bug fixed**: the "scrambled" step data in `src/lib/gameData.ts` was actually stored in *already-correct* order for every recipe (`correctIndex` exactly matched array position) — the game only ever looked scrambled if the user happened to hit the manual reshuffle button. Fixed with a proper Fisher-Yates shuffle applied on load and on recipe change (`shuffleSteps()` in the screen file), with a re-shuffle-if-still-sorted guard.

### 6.4 Motion Match (`MotionMatchScreen.tsx`)
Dual-task game: an object (fruit/food vs. machine/tool) is shown; user must raise the correct hand (left = fruit, right = machine) as fast as possible.
- **Bug fixed**: the target card used to literally print `"Category: FRUIT"` / `"Category: MACHINE"` right under the object name — handing the player the answer. Removed.
- **Real camera detection (newly implemented, not yet live-verified)**: previously the camera preview was 100% cosmetic — detection was always just two manual tap buttons ("RAISE LEFT" / "RAISE RIGHT"), which still work and remain as a fallback. Since Expo Go can't load real-time frame-processor camera libraries (e.g. `react-native-vision-camera` + worklets need a custom native dev client), real detection is implemented via **periodic still-photo capture** (`CameraView.takePictureAsync`, every 1.2s while playing) sent to `api.classifyHandGesture()` for Gemini-vision classification of which side of frame a raised hand is on. A "Swap Sides" button was added because front-camera mirroring conventions differ by device/platform and this hasn't been verified on real hardware yet (blocked on the Gemini key issue in §4.2 — **this feature needs live verification once a working key is available**).

---

## 7. AI-Generated Games — Two Completely Separate Systems (Important Distinction)

There are **two different, non-overlapping ways games get AI-generated** in this app. They were built at different times by different people and have very different privacy/sharing models. Do not conflate them.

### 7.1 Voice-created games ("Games Echo made for you") — instant, private, local-only
- Triggered by asking the voice companion for something not in the built-in four (e.g. "make me an Antakshari game").
- `api.generateGame()` is called **directly from the phone**, Gemini responds in a few seconds with a complete `GeneratedGameDefinition` (title, description, `kind: "quiz" | "challenge"`, `accent`, `instructions[]`, `rounds[]`).
- Stored via `src/lib/localGeneratedGames.ts` in **`AsyncStorage` on that specific device only** — never touches the backend, GitHub, or any server. Shows up under a "Games Echo made for you" section on the Hub, badged "Just for you."
- Gone if the app is uninstalled / storage cleared. No other user, ever, sees it.

### 7.2 "Request a game" flow — slower, human-reviewed, shared with everyone once merged
- A form on the Hub screen (dashed-border card) where the user types a free-text idea. Calls `POST /api/games/request` on the **backend**.
- The backend rate-limits to **3 requests/hour per IP** (in-memory, resets on server restart) and requires `GAME_GENERATOR_GITHUB_TOKEN` (a GitHub PAT) to fire a `repository_dispatch` event (`game_requested`) at the repo.
- This triggers `.github/workflows/generate-game.yml`, running on `ubuntu-latest`:
  1. Checks out `latest`
  2. Runs `neuroecho-mobile/scripts/generate-game.mjs <request-id> <prompt>` — calls Gemini server-side (uses the `GEMINI_API_KEY` **GitHub Actions secret**, separate from the mobile `.env.local` value) with a stricter validation pass (content-safety rules baked into the system prompt: no timers, gambling, medical claims, unsafe movement, copyrighted lyrics, URLs, personal data), then **appends the result into `neuroecho-mobile/src/lib/generatedGames.ts`** (the shared, committed manifest).
  3. Runs `tsc --noEmit` and `npx expo export --platform android` as safety gates.
  4. Pushes a `generated-game/<id>` branch and opens a PR against `latest` for human review.
- The PR-creation step originally used the default `github.token`, which fails with *"GitHub Actions is not permitted to create or approve pull requests"* unless the repo owner enables that specifically in **Settings → Actions → General → Workflow permissions** (an org/repo-level setting, admin-only, not fixable via any token swap — confirmed this empirically: swapping to a personal-access-token `GH_TOKEN` did **not** bypass it, since the restriction is tied to the Actions execution context itself, not the credential used). **This setting has since been enabled by the owner**, so the pipeline now completes automatically end-to-end without manual PR creation.
- Once merged, the game is in `GENERATED_GAMES` (the shared array) and **ships to every install** — the Hub screen shows *all* entries in that array to every user (this was a real bug: it originally only showed a merged game to the specific device whose local `AsyncStorage` record matched the request ID, contradicting the app's own copy which explicitly tells users "it will appear here after it is approved and released." Fixed — `availableGeneratedGames` is now just `GENERATED_GAMES` directly, no per-device filtering).
- **Known bug-fixed-during-dev**: the insertion script originally used `current.replace(match[1], ...)` — a plain substring search-and-replace — which matched the *wrong* occurrence of `"[]"` in the file (it also appears inside the unrelated `choices?: GeneratedGameChoice[]` type declaration earlier in the file, corrupting that declaration instead of the array). Fixed to use the full unique regex pattern for the replace instead of the short captured substring.
- **Known bug-fixed-during-dev**: the script also defaulted to `gemini-2.5-flash`, a since-retired model (`404: no longer available to new users`) — fixed to `gemini-3.6-flash`, matching everything else.

### 7.3 The shared renderer
Both systems' games render through the same component: `src/screens/games/GeneratedGameScreen.tsx`. It takes `route.params.localDefinition` (passed inline for both freshly-voice-created games and Hub-tapped community games, avoiding any async lookup) or falls back to `getGeneratedGame(id)` (static lookup in the committed manifest). Renders `quiz` rounds (multiple choice, one correct) or `challenge` rounds (a single "I completed this" button) — deliberately **declarative data only, never executable code**, a safety property preserved throughout.

---

## 8. Accessibility System

- `src/context/AccessibilityContext.tsx`: `textSize` ("standard" | "large" | "extraLarge"), `highContrast`, `reduceMotion`, `voiceFeedback` — persisted to `AsyncStorage`, exposed via `useAccessibility()`.
- `src/components/AccessibleText.tsx`: a drop-in replacement for RN's `Text`, used almost everywhere in the app (`import Text from "../components/AccessibleText"`). Parses the Tailwind `text-*` size class from `className` and applies the user's `fontScale` multiplier manually.
- **Bug fixed**: this component originally left `allowFontScaling` **on** (RN's native OS-level font scaling) *at the same time* as applying its own manual `fontScale` multiplier — the two compounded (e.g. 1.15x app-level "large" default × up to 2x OS-level scaling on a phone with large system text settings, common for seniors) and caused widespread UI overflow ("the UI is messed up" reports traced back to this). Fixed: `allowFontScaling={false}` so the app's own Settings control is the single source of truth, and the default `textSize` was reset from `"large"` back to `"standard"` so nothing is scaled up unless a user explicitly opts in.
- Also fixed: `MainTabs.tsx` had a hardcoded `headerStyle: { height: 64 }` which could clip header content on notch/Dynamic-Island devices — removed, letting React Navigation size it automatically.

---

## 9. Internationalization

- `src/lib/i18n.ts` + `src/context/LanguageContext.tsx`. Currently supports **English and Hindi** (`AppLanguage = "en" | "hi"`), user-togglable in Settings, persisted to `AsyncStorage`.
- Covers all app "chrome" — navigation, Hub, Settings, Analytics, both AI surfaces (companion + assistant). **Does not** cover the actual content of the four built-in games (story text, recipe steps, era-guesser scenes, motion-match labels) — that's a known, explicitly-scoped-out gap, not an oversight; translating game content is a much larger content task that hasn't been requested yet.
- `setSpeechLanguage()` in `speech.ts` is called whenever the language changes, so TTS automatically switches to a matching-language voice (`en-US` / `hi-IN`).
- AI replies (both companion and assistant) are instructed via system prompt to respond in the selected language regardless of what language the audio/text input was in.

---

## 10. Database Schema (Supabase Postgres, via Drizzle)

Four tables, defined in `neuroecho-cognitive-arcade-prototype-v3/src/db/schema.ts`:
- **`user_profiles`** — name, age, difficultyLevel, speechRate, tremorAssist, highContrast, voiceFeedbackEnabled, cognitiveGoals (jsonb array), streakDays, totalXp.
- **`game_sessions`** — profileId (FK), gameType, score, maxScore, accuracyPercentage, durationSeconds, details (jsonb: difficulty/mistakesCount/reactionTimeMs/summary/aiNotes).
- **`ai_generated_stories`** — topic, storyText, falseDetail, falseSentenceIndex, correctedFact, explanation (used by Spot the AI Lie's custom-topic feature).
- **`cognitive_insights`** — profileId (FK), memoryScore/sequencingScore/visualRecognitionScore/motorControlScore, aiSummary, recommendation.

`src/db/index.ts` uses a **lazy Proxy** so importing the db module doesn't crash at startup if `DATABASE_URL` is unset — it only throws when actually queried. All routes that touch the DB (`/api/analytics`, `/api/profile`) have **graceful fallback responses** (hardcoded default JSON) if the DB call fails, so the app stays functional even with a broken DB connection — only real persistence is lost, not the whole app. This has mattered in practice: the Supabase password has been rotated more than once during development, temporarily breaking DB writes while the rest of the app kept working via fallbacks.

`/api/health` returns `{"ok": true/false}` based on whether a live DB query succeeds — the fastest way to check DB connectivity.

---

## 11. Environment Variables

### `neuroecho-mobile/.env.local`
```
EXPO_PUBLIC_API_URL=http://<backend-host-LAN-IP>:3000
EXPO_PUBLIC_GEMINI_API_KEY=<Gemini API key, starts AIzaSy...>
```

### `neuroecho-cognitive-arcade-prototype-v3/.env.local`
```
DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
GEMINI_API_KEY=<same Gemini key, used by the backend's own AI routes>
GAME_GENERATOR_GITHUB_TOKEN=<GitHub PAT with repo scope — needed to dispatch the game-generation workflow>
```

### GitHub Actions repo secrets (separate store — `gh secret set`, not `.env.local`)
- `GEMINI_API_KEY` — used by `scripts/generate-game.mjs` inside the CI workflow.
- `GAME_GENERATOR_GITHUB_TOKEN` — used for the `gh pr create` step (works around the Actions PR-creation restriction).
- `EXPO_TOKEN` — for EAS-related workflows.

**Never commit any of the above.** `.env.local` files are gitignored in both apps — verified repeatedly throughout development.

---

## 12. Known Open Items / Things Not Yet Done

- Camera-based hand detection in Motion Match (§6.4) is implemented but **not yet verified on live hardware** — blocked on getting a working Gemini key at time of writing.
- Game content (story text, recipes, era scenes) is not translated to Hindi — chrome-only i18n.
- CI workflows (`ci.yml`, `deployment.yml`) still only trigger on `branches: [main]`, not `latest` — flagged, not fixed, since it's unclear whether that's wanted.
- Backend deployment to Vercel is set up but not confirmed continuously live — most testing is against a locally-run backend.
- No automated tests beyond Maestro E2E flow scaffolding (`.maestro/`) for Android — added by a teammate, not deeply exercised yet.

---

## 13. Conventions Worth Preserving

- **No comments explaining *what* code does** — only *why*, when it's a non-obvious constraint, workaround, or invariant (e.g. the ref-guard pattern, the mirroring uncertainty, the substring-replace bug). This style is used consistently throughout and should be matched.
- **Ref-based re-entry guards**, not state-based, for anything gating rapid double-fires (see §6 common patterns).
- **Verify before claiming**: throughout this project's history, assumptions about library APIs, model names, and behavior have repeatedly turned out wrong when not checked against actual installed `.d.ts` files or live API calls (e.g. the deprecated Gemini model, the corrupted-file bug, the OAuth-token key). Prefer reading the actual installed package types or making a real test call over recalling from memory.
- **Data-only AI generation, never executable code** — both game-generation systems produce declarative JSON rendered by a fixed, safe renderer. Don't design a feature that has AI output arbitrary code that then runs on-device.
