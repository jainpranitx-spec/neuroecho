# NeuroEcho — The Cognitive Arcade

Personalized AI cognitive games for older adults: Spot the AI Lie, Era
Guesser, Recipe Rebuilder, and Motion Match. Available on **iOS and
Android** via a React Native (Expo) app.

## Architecture

```
neuroecho-cognitive-arcade-prototype-v3/   Backend API (Next.js, no UI)
                                            → Postgres (Drizzle ORM)
                                            → Gemini (story gen, AI assistant)
                                            → deploys to Vercel

neuroecho-mobile/                          Mobile app (Expo / React Native)
                                            → iOS + Android
                                            → calls the backend over HTTP
                                            → builds via EAS Build
```

The mobile app is the actual product — it has no server-side code of its
own and talks to the backend for everything (profile, game sessions,
analytics, AI features). The backend has no UI; it's purely API routes.

## Getting started

1. **Backend**: see [`neuroecho-cognitive-arcade-prototype-v3/README.md`](./neuroecho-cognitive-arcade-prototype-v3/README.md)
   — set up Postgres, run migrations, start the API.
2. **Mobile app**: see [`neuroecho-mobile/README.md`](./neuroecho-mobile/README.md)
   — point it at the backend, run in a simulator or on your phone via Expo Go.

## CI/CD

- **`.github/workflows/ci.yml`** — on every push/PR: typechecks + lints +
  migrates + builds the backend; typechecks + bundles the mobile app.
- **`.github/workflows/deployment.yml`** — on push to `main`, after CI
  passes: deploys the backend to Vercel.
- **`.github/workflows/mobile-build.yml`** — manual trigger: builds the
  mobile app for iOS/Android via EAS Build (needs an `EXPO_TOKEN` secret;
  see the mobile README).
