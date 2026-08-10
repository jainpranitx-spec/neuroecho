# NeuroEcho — Mobile (Expo / React Native)

The NeuroEcho cognitive-arcade app for iOS and Android, built with
[Expo](https://expo.dev). It talks to the backend in
[`../neuroecho-cognitive-arcade-prototype-v3`](../neuroecho-cognitive-arcade-prototype-v3)
for all data (profile, game sessions, analytics) and AI features (story
generation, the AI assistant).

## 1. Install dependencies

```bash
npm install
```

## 2. Point the app at your backend

Create `.env.local` (or export the var another way — Expo inlines any
`EXPO_PUBLIC_*` var at build time):

```bash
echo 'EXPO_PUBLIC_API_URL=http://localhost:3000' > .env.local
```

- **Simulator/emulator testing against a local backend**: run the backend
  (`npm run dev` in the backend folder) and point at `http://localhost:3000`.
  Note that on a **physical device** or the **Android emulator**,
  `localhost` refers to the device itself, not your computer — use your
  computer's LAN IP (e.g. `http://192.168.1.23:3000`) or the Android
  emulator's special alias `http://10.0.2.2:3000` instead.
- **Testing against the deployed backend**: use its Vercel URL, e.g.
  `EXPO_PUBLIC_API_URL=https://neuroecho.vercel.app`.

If `EXPO_PUBLIC_API_URL` is unset, the app falls back to
`http://localhost:3000`.

## 3. Run it

```bash
npm run ios      # iOS Simulator (requires Xcode)
npm run android   # Android emulator (requires Android Studio)
npm start         # then scan the QR code with Expo Go on a physical device
```

## Project structure

```
App.tsx                 Root component: providers + navigation
index.ts                Entry point (registers App, imports gesture-handler)
src/
  navigation/            React Navigation setup (tabs + stack)
  screens/               Hub, Analytics, Settings, and the 4 games
  components/            Shared UI (AI assistant modal, confetti burst)
  context/               AI assistant modal open/close state
  lib/                   types, static game data, expo-speech wrapper, API client
  global.css             Tailwind directives (NativeWind)
```

Styling uses [NativeWind](https://www.nativewind.dev) (Tailwind classes on
RN components) to stay close to the original design system. Icons are
[lucide-react-native](https://lucide.dev). Voice playback uses
`expo-speech`; the Motion Match game's camera preview uses `expo-camera`
(the actual gesture "detection" is two large tap buttons — the original web
version never did real hand-tracking either, despite bundling a MediaPipe
dependency it never called).

## Building for real devices / app stores

Native builds run on Expo's cloud via **EAS Build** — a plain CI runner
can't compile iOS/Android natively. Locally:

```bash
npm install -g eas-cli
eas login
eas build --profile preview --platform all   # internal test build
eas build --profile production --platform all
```

Or trigger the **"Build Mobile App (EAS)"** GitHub Actions workflow
manually (Actions tab → select profile/platform → Run workflow). It needs
an `EXPO_TOKEN` repo secret:

1. Create an Expo account at https://expo.dev if you don't have one.
2. Run `eas login` locally once, then `eas whoami` to confirm.
3. Generate a token: https://expo.dev/accounts/[account]/settings/access-tokens
4. `gh secret set EXPO_TOKEN --repo <owner>/<repo>`

## Notes

- Every screen falls back to sample/local data if the backend is
  unreachable (same pattern as the web app it replaced).
- `npm run typecheck` before committing.
