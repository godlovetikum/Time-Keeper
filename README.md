# TimeKeeper — Android time & app-usage tracker

Mobile android app for tracking and managing app usage. 

Tracks per-app usage, runs timers, warns at 10% remaining with a one-time 
extension (≤60 min), and enforces expiry via blocking overlay, screen lock,
and (optionally) a root-level force-shutdown.

## Prerequisites

- Node 18+
- JDK 17 (Temurin recommended)
- Android Studio with Android SDK 34, NDK 26.1.10909125, build-tools 34.0.0
- A device or emulator running Android 8.0 (API 26) or newer

## Setup

```bash
cd android-app
npm install

# Create android/local.properties pointing at your SDK:
echo "sdk.dir=$ANDROID_HOME" > android/local.properties

# Generate a debug keystore if needed:
keytool -genkey -v -keystore android/app/debug.keystore -storepass android \
  -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 \
  -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
```

## Run

```bash
npm run start          # Metro
npm run android        # debug install on connected device
```

## Build a release APK

```bash
npm run build:release
# Output: android/app/build/outputs/apk/release/app-release.apk
```

To sign with your own keystore, edit `android/app/build.gradle`'s
`signingConfigs.release` and replace the debug keystore reference.

## First-run permissions

Open the **Permissions** screen in-app and grant:

1. **Usage access** (special permission) — required
2. **Display over other apps** — required for the blocking overlay
3. **Accessibility — TimeKeeper Blocker** — required to detect foreground apps
4. **Device admin** — optional; allows lock-screen on expiry
5. **Disable battery optimization** — recommended for reliable background tracking

## How enforcement works

- A foreground service (`TimerForegroundService`) wakes every 5 s and queries
  `UsageStatsManager` events to update `usedMs` per tracked app.
- At 90% of the budget, a high-priority "Extend" notification fires once.
  Tapping Extend (notification action) consumes the one-time extension and
  adds the user's configured minutes (default 30, max 60).
- At 100% of the (possibly extended) budget the service fires whichever of
  these the timer enables:
  - **Overlay** — accessibility service slams Home and the system-overlay
    window shows a "Time's up" screen.
  - **Lock screen** — DeviceAdmin `lockNow()`.
  - **Force shutdown** — only if the device is rooted; runs `su -c reboot -p`.

## Caveats

- Force-shutdown only works on **rooted** devices. On stock devices the
  toggle is gated and warns the user.
- Apps using `AccessibilityService` for blocking face strict Play Store
  review. Sideloading (or Play Store with extra justification) recommended.
- iOS is not supported — Apple's sandbox forbids this category of app.

## Project layout

```
Time-Keeper/
├── android/                                # Native Android project
│   └── app/src/main/
│       ├── AndroidManifest.xml
│       ├── java/com/timekeeper/
│       │   ├── MainActivity.kt
│       │   ├── MainApplication.kt
│       │   ├── modules/                    # JS bridge native modules
│       │   └── services/                   # Foreground service, accessibility, receivers
│       └── res/xml/                        # accessibility & device-admin configs
├── src/
│   ├── App.tsx
│   ├── navigation/
│   ├── screens/
│   ├── components/
│   ├── store/                              # zustand + MMKV
│   ├── native/                             # TS wrappers around bridges
│   ├── theme/                              # light + dark tokens
│   ├── utils/
│   └── types/
├── index.js
├── app.json
└── package.json
```
