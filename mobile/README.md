# Ledger Mobile — React Native (Expo)

Full-parity Android app for **Ledger**, the Family Financial Digital Legacy Register.

## Tech stack

| Concern | Library |
|---|---|
| Framework | Expo SDK 51 (managed workflow) |
| Routing | expo-router v3 (file-based) |
| Styling | NativeWind v4 (Tailwind CSS for React Native) |
| State | Zustand |
| HTTP | Axios |
| Auth storage | expo-secure-store |
| OAuth | expo-web-browser (browser redirect) |
| Icons | @expo/vector-icons (Ionicons) |
| Language | TypeScript (strict) |

## API

All requests go to `https://ledger.onelifestack.com/api`.  
Configure via `.env`:

```
EXPO_PUBLIC_API_URL=https://ledger.onelifestack.com/api
```

## Prerequisites

- Node.js 20+
- Expo CLI: `npm install -g @expo/cli`
- EAS CLI (for builds): `npm install -g eas-cli`
- Android Studio (for emulator) or a physical Android device with Expo Go

## Setup

```bash
cd mobile
npm install
```

## Run in development

```bash
# Start Expo dev server
npm start

# Open on Android emulator
npm run android

# Scan QR with Expo Go app on physical device
npm start
```

## Build APK (preview)

```bash
# One-time EAS setup (first build only)
eas login
eas build:configure

# Build unsigned APK for testing
npm run build:android
```

The APK will be available to download from the EAS dashboard.

## Directory layout

```
mobile/
├── app/                       # expo-router file-based routes
│   ├── _layout.tsx            # Root layout — auth guard, redirect logic
│   ├── (auth)/                # Auth screens (no tab bar)
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── forgot-password.tsx
│   │   └── reset-password.tsx
│   ├── (app)/                 # Main app with bottom tab navigator
│   │   ├── _layout.tsx        # Tab navigator (5 tabs)
│   │   ├── index.tsx          # Dashboard
│   │   ├── assets/
│   │   │   ├── index.tsx      # Assets list
│   │   │   └── form.tsx       # Add / edit asset
│   │   ├── insurance/
│   │   │   ├── index.tsx      # Insurance list
│   │   │   └── form.tsx       # Add / edit policy
│   │   ├── alerts.tsx         # Alerts list
│   │   └── more.tsx           # More menu
│   ├── liabilities/           # Stack screens navigated from More
│   ├── digital-accounts/
│   ├── recurring/
│   ├── trusted-persons/
│   └── will.tsx
├── src/
│   ├── api/                   # Axios API modules (one per domain)
│   ├── store/                 # Zustand stores
│   ├── components/            # Shared UI components
│   └── utils/                 # timeAgo, formatCurrency, formatDate
├── assets/                    # App icons (add your own images here)
├── global.css                 # Tailwind entry point for NativeWind
├── tailwind.config.js
├── babel.config.js
├── metro.config.js
├── app.json
└── tsconfig.json
```

## Auth flow

1. **Email/password** — calls `POST /api/auth/login`, stores JWT in SecureStore.
2. **Google OAuth** — opens `https://ledger.onelifestack.com/oauth2/authorization/google` in the device browser via `expo-web-browser`. The Spring backend redirects to the public callback URL after auth. To make this seamless on mobile (deep link back into the app), you need to:
   - Register `ledger://oauth2/callback` as an allowed redirect URI in Google Cloud Console.
   - Update `application.yml` in the backend to include the mobile deep link as an allowed redirect URI.
   - The `app.json` already has the `intentFilters` and `scheme: "ledger"` configured.
3. **Forgot / reset password** — standard email flow via backend.

## SecureStore keys

| Key | Content |
|---|---|
| `ledger_token` | JWT bearer token |
| `ledger_userId` | User ID (UUID) |
| `ledger_email` | User email |
| `ledger_name` | User display name |

## Screens

| Screen | Route | Notes |
|---|---|---|
| Login | `/(auth)/login` | Email/password + Google OAuth button |
| Register | `/(auth)/register` | Name, email, password |
| Forgot password | `/(auth)/forgot-password` | Email → backend sends reset link |
| Reset password | `/(auth)/reset-password?token=...` | Token from email link |
| Dashboard | `/(app)/` | Net worth, counts, onboarding checklist |
| Assets | `/(app)/assets/` | Grouped list with sort chips |
| Asset form | `/(app)/assets/form?id=...` | Add/edit, maturity field for FD/RD/NPS |
| Insurance | `/(app)/insurance/` | Policy list |
| Insurance form | `/(app)/insurance/form?id=...` | Add/edit |
| Alerts | `/(app)/alerts` | Color-coded, tap to mark read |
| More | `/(app)/more` | Menu to all other sections |
| Liabilities | `/liabilities/` | Loan/credit list |
| Digital accounts | `/digital-accounts/` | Online credentials |
| Recurring | `/recurring/` | EMIs, SIPs, subscriptions |
| Trusted persons | `/trusted-persons/` | Contacts with phone/email links |
| Will | `/will` | Single record, inline edit |

## Adding app icon and splash screen

Replace the placeholder files in `assets/`:
- `icon.png` — 1024×1024 PNG
- `splash.png` — 1284×2778 PNG (or any ratio)
- `adaptive-icon.png` — 1024×1024 PNG (Android adaptive icon foreground)

## Known limitations

- Google OAuth via browser redirect does not automatically return to the app — users must manually return after authenticating. Full deep-link integration requires backend changes to allow `ledger://oauth2/callback` as a redirect URI.
- NativeWind v4 is in beta; if you see styling issues, check for className support on the specific component you're using.
- Date fields accept manual text input in `YYYY-MM-DD` format. A date picker library (e.g. `@react-native-community/datetimepicker`) can be added for better UX.
