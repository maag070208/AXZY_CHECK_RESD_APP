# APP — AGENTS.md

React Native 0.80 app for AXZY CHECK Residenciales (Android + iOS, RN bare workflow).

> **Before writing code, load**: `.opencode/skills/app/SKILL.md` (mobile design system) and `.opencode/skills/offline/SKILL.md` (WatermelonDB sync rules). For E2E: `.opencode/skills/maestro/SKILL.md`.

## Quick commands

```bash
cd APP
npm start              # Metro bundler
npm start:host         # Metro on 0.0.0.0 (when device is on a different network)
npm run a              # react-native run-android
npm test               # Jest, preset 'react-native'
```

> Note: APP uses **npm** (not pnpm). Lockfile is `package-lock.json`. Do not introduce pnpm.

## Layout

```
APP/
├── App.tsx                       # root: GestureHandlerRootView + Provider + MainNavigator
├── index.js                      # RN entry
├── babel.config.js               # @react-native/babel-preset + reanimated plugin
├── metro.config.js
├── jest.config.js                # preset: 'react-native'
├── android/                      # native Android project
├── ios/                          # native iOS project
├── __tests__/                    # Jest tests (App.test.tsx is the smoke test)
└── src/
    ├── navigation/
    │   ├── MainNavigation.tsx    # NavigationContainer + Drawer + Tabs
    │   ├── navigationRef.ts
    │   ├── types/
    │   ├── header/  drawer/  tabs/  hooks/
    ├── screens/
    │   └── <feature>/            # one folder per screen (auth, home, rounds, check, etc.)
    ├── core/
    │   ├── axios.ts              # configured axios instance (base URL from .env)
    │   ├── database/             # WatermelonDB local DB (offline-first)
    │   │   ├── database.ts
    │   │   ├── schema.ts
    │   │   ├── sync.ts           # pull/push via @nozbe/watermelondb/sync
    │   │   └── models/           # one file per WatermelonDB model
    │   ├── services/             # API call helpers (axios wrappers)
    │   ├── store/                # Redux Toolkit slices
    │   ├── hooks/
    │   ├── constants/
    │   ├── types/
    │   └── utils/
    └── shared/
        ├── components/           # IT* mobile components (ITButton, ITCard, ITBadge, ...)
        ├── theme/                # theme.ts (RN Paper MD3), app.styles.ts
        ├── service/              # upload, notifications, etc.
        ├── assets/
        └── utils/
```

## Critical conventions

### Mobile design system
- Uses **react-native-paper** with a custom MD3 theme (`src/shared/theme/theme.ts`). **Primary color: `#46a545`** (emerald/slate aesthetic, matches WEB).
- All primitives are `IT*` components in `src/shared/components/` (NOT the WEB's `@axzydev/axzy_ui_system` — these are React Native versions): `ITButton`, `ITCard`, `ITBadge`, `ITAlert`, `ITInput`, `ITDatePicker`, `ITDateRangePicker`, `ITTimePicker`, `ITSelect`, `ITToast`, `ITSwitch`, `ITModal`, etc.
- Do not use raw `react-native` primitives (`<View>` for cards, `<TextInput>` standalone) for new code.
- **No hardcoded hex values** in screens. Use `theme.colors.primary`, `theme.colors.secondary`, etc. from `src/shared/theme/theme.ts`.

### Routing
- `@react-navigation/native` + `@react-navigation/drawer` + `@react-navigation/bottom-tabs` + `@react-navigation/native-stack`.
- Entry: `MainNavigation.tsx`. Splits routes by **role** (Admin, LIDER, SHIFT, RESDN, GUARD). When changing a screen's role visibility, update MainNavigation.

### Offline-first (CRITICAL)
- **WatermelonDB** is the local source of truth for most modules.
- `src/core/database/sync.ts` runs `@nozbe/watermelondb/sync` against `GET /sync` and `POST /sync` on the API.
- `LOCAL_TO_API_MAP` translates WatermelonDB table names → Prisma model names (e.g. `roles` → `role`, `clients` → `client`).
- **Migrations of offline modules** are tracked in `offline_migration_checklist.txt` (per-screen status).
- When adding a new screen that needs to work offline, see `.opencode/skills/offline/SKILL.md` and `offline_test_scenarios.txt` for the patterns.

### Auth
- `jwt-decode` (not `react-jwt` like WEB).
- Token stored in Redux (`user` slice). On app load, `MainNavigation.tsx` decodes and either renders the navigator or redirects to login.
- `NetInfo` (`@react-native-community/netinfo`) is used to detect connectivity and gate sync.

### Native deps
- `react-native-fs` — file system (attachments, PDFs).
- `react-native-compressor` — image/video compression before upload.
- `react-native-maps` — Google Maps (key in `.env`; same as WEB).
- `react-native-linear-gradient` — gradient backgrounds.
- `react-native-paper` + `react-native-paper-dates` — date pickers, modals.
- `react-native-gesture-handler` — required at the root of `App.tsx` (`<GestureHandlerRootView>`).
- `react-native-reanimated` — babel plugin must be **last** in `babel.config.js`.

### Style
- **No comments** in code unless asked.
- **Spanish** for user-facing copy.
- **No `any`** — use the typed slice/hook return types.
- Formik + Yup for forms (same as WEB).
- `react-hook-form` is also in deps — pick one per screen and stay consistent.

## Testing

### Unit (Jest)
```bash
npm test                       # all
npm test -- --testPathPattern=Login
npm test -- --watch
```
- Tests in `__tests__/*.test.tsx` and `<screen>/__tests__/`.
- `jest.config.js`: `preset: 'react-native'` — uses the official RN preset, including `babel-jest`.
- Mock native modules with `jest.mock('react-native-fs', ...)` etc. as needed.

### E2E (Maestro)
- `.opencode/skills/maestro/SKILL.md` is the source of truth.
- Maestro flow files go in `APP/.maestro/` (create if missing).
- Test on a real device or emulator; `adb reverse tcp:8081 tcp:8081` for Metro over USB.

## Known bugs / gotchas

- **S3 is blocked** in this env (AWS keys quarantined). Any new upload code should use the API's direct buffer pattern; the APP uploads via `upload.service.ts` which currently hits `POST /uploads` (S3-backed). If uploads fail, that's the S3 block.
- **Stripe**: live keys in `.env`. Do not hardcode test/live — use env.
- **`babel.config.js` plugin order**: reanimated plugin must be **last** or you'll get cryptic runtime errors. Don't reorder.
- **Hermes** is on by default (RN 0.80). If you see "TypeError: undefined is not a function" on a library that should be supported, check that the library is Hermes-compatible.
- **Map key** (`react-native-maps` Google Maps): same key as WEB in `.env`. If the map shows blank, check the key and that the API is enabled for the bundle ID/package.
- **`react-native-paper-dates`**: requires `react-native-localize` for locale; if dates render in English unexpectedly, check locale setup.

## Files / references

- Skill: `.opencode/skills/app/SKILL.md`
- Offline skill: `.opencode/skills/offline/SKILL.md`
- Maestro skill: `.opencode/skills/maestro/SKILL.md`
- Offline status: `offline_migration_checklist.txt` (per-screen)
- Offline test scenarios: `offline_test_scenarios.txt`
- Refinement status: `refinement_status.txt`
- API rules: `../API/AGENTS.md`
- WEB rules (for parity on data models / API contracts): `../WEB/AGENTS.md`
