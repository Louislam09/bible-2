# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**Santa Escritura** is a React Native Bible study app built with Expo, providing comprehensive access to sacred texts with features including multiple Bible versions, interlinear translations (Hebrew/Greek), note-taking, memorization tools, hymns, and AI-powered search. The app uses SQLite for offline Bible data storage and PocketBase for cloud sync functionality.

## Common Development Commands

### Running the App
```powershell
# Start with development client
npm start

# Start development variant (separate app ID)
npm run dev

# Start preview variant
npm run preview

# Run on specific platforms
npm run android
npm run ios
npm run web
```

### Building & Deployment
```powershell
# Build Android app with EAS
npm run build:a
# Alias for: eas build --platform android

# Submit to Google Play
npm run submit:a
# Alias for: eas submit --platform android

# OTA update with custom message
npm run eas:update --message="Your update message"
# Alias for: eas update --platform android --message "$npm_config_message"
```

### Testing & Linting
```powershell
# Run tests in watch mode
npm test
# Uses jest-expo preset

# Run linting
npm run lint
# Uses expo lint (ESLint)
```

### Package Manager
This project uses **bun** as the package manager (evidenced by `bun.lock`). While npm scripts are defined, prefer using `bun` commands when available.

## High-Level Architecture

### State Management - @legendapp/state
The app uses **Legend State** as its primary state management solution, with observable-based reactive patterns:

- **`state/`** - Contains observable state files:
  - `bibleState.ts` - Core Bible reading state (verses, selections, split view, history)
  - `authState.ts` - Authentication state
  - `favoriteState.ts` - Favorite verses management
  - `dbDownloadState.ts` - Database download progress
  - `settingState.ts` - User settings and preferences

- **`context/LocalstoreContext.tsx`** - Main persistent storage using `@legendapp/state` with AsyncStorage:
  - Automatically syncs state to AsyncStorage
  - Manages last read positions, theme, font settings, Bible version
  - Handles cloud sync state and notification preferences
  - Uses `syncObservable()` for automatic persistence

### Database Architecture - Multi-Bible SQLite System
The app uses a complex multi-database setup with expo-sqlite:

**Primary Databases:**
- **Main Bible DB** - Current selected Bible version (RV60, NTV, etc.)
- **Hebrew Interlinear DB** - Old Testament with Strong's numbers
- **Greek Interlinear DB** - New Testament with Strong's numbers
- **Downloadable Bibles** - Users can download additional versions stored as `.biblezip` files

**Database Context** (`context/databaseContext.tsx`):
- Manages 3 concurrent SQLite connections (main + Hebrew + Greek)
- Uses lazy loading: main Bible loads first, then interlinear databases load in parallel
- `getBibleServices()` - Returns appropriate primary/base DB based on current version
- `useLoadDatabase`, `useHebrewDB`, `useGreekDB` - Custom hooks for each database type

**Database Flow:**
1. App loads → `useInstalledBibles()` scans for available Bible databases
2. Main Bible DB opens based on `currentBibleVersion` setting
3. Once main DB loads, Hebrew & Greek interlinear DBs load in parallel
4. Interlinear features (Strong's numbers, word studies) require all 3 DBs loaded

### Routing - Expo Router (File-based)
Uses **expo-router v5** with file-based routing and typed routes:

- **`app/_layout.tsx`** - Root layout with nested providers (Storage → Theme → Database → Bible → Features)
- **Route Groups:**
  - `(dashboard)/` - Main dashboard and home screens
  - `(search)/` - Search functionality
  - `(game)/` - Bible quiz games
  - `character/` - Biblical character profiles
  - `memorization/` - Verse memorization challenges
  - `timeline/` - Biblical timeline views

- **Navigation Patterns:**
  - Uses custom screen animations defined in `screenAnimations` object
  - Deep linking via `scheme: "sb-rv60"` in app.config.ts
  - Quick Actions integration for iOS/Android app shortcuts

### Service Layer
Services in `services/` directory provide abstraction for external operations:
- `StorageService.ts` - User session management (save/clear)
- `noteService.ts` - Note CRUD operations
- `favoriteVerseService.ts` - Favorite verse management
- `downloadManagerService.ts` - Bible database downloads
- `notificationServices.ts` - Push notifications and daily verse
- `dailyVerseService.ts` - Random daily verse generation

### Cloud Backend - PocketBase
- **`globalConfig.ts`** - Initializes PocketBase client (`pb`)
- Collections: `users`, `notes`, `favorite_verses`, `user_settings`, `access_requests`
- Auth methods: Email/password and Google OAuth
- Cloud sync controlled by `isSyncedWithCloud` setting

### Theme & Styling
- **TailwindCSS v4** with NativeWind for styling
- Custom theme provider in `context/ThemeContext.tsx`
- Supports light/dark mode with multiple color themes (Green, Blue, etc.)
- Expo System UI for navigation bar color control

### Build Variants
The app supports 3 build variants managed via `APP_VARIANT` env variable:
- **development** - `com.louislam09.bible.dev` - Internal testing
- **preview** - `com.louislam09.bible.preview` - Pre-release testing
- **production** - `com.louislam09.bible` - Play Store release

Each variant has unique app icons, splash screens, and Google Services config.

## Key Concepts & Patterns

### Bible Data Flow
1. User navigates to book/chapter → `bibleState$.changeBibleQuery()` updates query
2. `BibleContext` listens to query changes → fetches verses from SQLite
3. Verses stored in `bibleState$.bibleData.topVerses` (and `.bottomVerses` for split view)
4. Components observe state with `use$()` hook and re-render reactively

### Split Screen Feature
- `bibleState$.isSplitActived` - Toggle state for split screen
- Top/bottom panes maintain independent book/chapter/verse state
- Supports comparing different Bible versions or viewing parallel passages

### Verse Selection System
- Single tap → Highlights verse, shows action menu
- Double tap → Marks verse with "double tag" (different highlighting)
- Long press → Multi-select mode (stores in `Map<number, IBookVerse>`)
- Selected verses used for: notes, favorites, sharing, copying

### Database Download System
- Bibles stored as `.biblezip` files (zipped SQLite databases)
- `downloadManagerService.ts` handles download → extract → setup
- Progress tracked in `dbDownloadState$` observable
- Downloads use `expo-file-system` and `jszip` for extraction

### Performance Optimizations
- React Compiler enabled (`reactCompiler: true` in app.config.ts)
- Memo wrappers on provider components to prevent re-renders
- Lazy loading of interlinear databases (only after main DB ready)
- Animation disable option in settings for slower devices

## Important Files

- **`types.tsx`** - Central type definitions, enums, navigation types
- **`app.config.ts`** - Expo configuration, build variants, plugin setup
- **`globalConfig.ts`** - PocketBase client, auth helpers, environment config
- **`tsconfig.json`** - Path alias `@/*` for absolute imports from root

## Development Notes

### When Working with State
- Always use `use$()` hook to observe observables in components
- Use `batch()` when making multiple related state changes
- Persistent state auto-saves via `syncObservable()` - no manual save needed

### When Adding New Bible Versions
1. Add database to appropriate directory
2. Update database naming convention (`.db` for defaults, `.biblezip` for downloadable)
3. Add to `EBibleVersions` enum in types
4. Update `getBibleServices()` switch case if special handling needed

### When Modifying Routing
- File-based routing: create files in `app/` directory
- Update `Screens` enum and `ScreensName` object in `types.tsx`
- Add screen animation type to `screenAnimations` object in `app/_layout.tsx`
- Use typed routes: `router.push()` with route name from `Screens` enum

### OTA Updates
- EAS Updates configured for all variants
- Updates fetched on app launch (`onFetchUpdateAsync()` in root layout)
- Update channels match build variants: `development`, `preview`, `production`

### Environment Variables
Required variables (set in `.env`):
- `EXPO_PUBLIC_POCKETBASE_URL` - PocketBase backend URL
- `EXPO_PUBLIC_GOOGLE_CLIENT_ID` - Google OAuth client ID
- `EXPO_PUBLIC_WEB_GOOGLE_CLIENT_ID` - Web Google OAuth client ID
- `APP_VARIANT` - Build variant (development/preview/production)
