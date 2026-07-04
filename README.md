# Indoor Cricket Scorer

A production-ready, mobile-first indoor cricket scoring app for umpires, built with React + TypeScript + Vite, Redux Toolkit, Tailwind CSS, and Firebase.

## Features

- Google Sign-In (Firebase Auth), route-protected app
- Dashboard: Start New Match / Match History / Profile
- Create Match: team names, venue, overs, configurable balls-per-over, auto date/time
- Team Setup: unlimited players per team, add/edit/remove
- Toss + opening lineup selection
- Mobile-optimized live scoring screen:
  - Large tap targets for 0–6 runs, wicket, wide, no ball, bye, leg bye, dead ball
  - Correct handling of extra runs on top of wides/no-balls
  - Wicket flow: dismissal type, bowler/fielder credit, next-batsman prompt
  - New-bowler prompt at every over change
  - Live run rate, required run rate, and target tracking in the 2nd innings
  - Ball-by-ball timeline grouped by over
  - Snapshot-based Undo that fully restores score, wickets, stats, overs, and extras
  - Auto-save to Firestore (debounced) after every ball
- Innings break screen with automatically calculated target
- Match Summary: winner, final score, and MVP / Best Batsman / Best Bowler / Best Fielder
  computed with a transparent weighted-scoring algorithm (see `src/utils/cricketUtils.ts`)
- Match History: searchable list of past matches backed by Firestore, with full scorecards
- Dark, sports-themed, mobile-first UI with a scoreboard-style LED numeric display

## Tech stack

- React 18 + TypeScript + Vite
- Redux Toolkit (`src/store`) — scoring logic lives in `src/utils/cricketEngine.ts` and
  `src/store/slices/matchSlice.ts`, fully decoupled from UI components
- React Router v6
- Tailwind CSS (custom "pitch / stump / sixer / night" theme, see `tailwind.config.js`)
- Firebase Authentication, Cloud Firestore, Firebase Storage

## Getting started

```bash
npm install
cp .env.example .env   # then fill in your Firebase project config
npm run dev
```

### Firebase setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable **Authentication → Google** sign-in provider
3. Create a **Cloud Firestore** database (production mode)
4. Enable **Storage**
5. Copy your web app config into `.env` (see `.env.example`)
6. Deploy the included security rules:
   ```bash
   firebase deploy --only firestore:rules,storage:rules
   ```

## Folder structure

```
src/
  components/
    common/      shared UI (Navbar, modals, loading, toasts)
    scoring/      scoring-screen widgets (buttons, header, modals, timeline)
    team/         team roster editor
  firebase/       Firebase init + auth/firestore/storage services
  hooks/          useAuth, useAutoSaveMatch
  pages/          route-level screens
  routes/         React Router route table
  store/
    slices/       authSlice, matchSlice (core engine), uiSlice, historySlice
  types/          shared TypeScript types
  utils/
    cricketEngine.ts   pure ball-processing engine (used by matchSlice, unit-testable)
    cricketUtils.ts    overs/run-rate/target/MVP-scoring helpers
```

## Scoring & MVP algorithm

The weighted-scoring algorithm (in `cricketUtils.ts`) combines:

- **Batting score** = runs + fours + sixes×2 + a small strike-rate bonus (min 6 balls faced)
- **Bowling score** = wickets×20 + dots − economy penalty (only applied ≥1 over bowled)
- **Fielding score** = (catches + run-outs + stumpings) × 10
- **MVP** = sum of all three per player, highest total wins

This is intentionally simple and fully transparent — tune the weights in one place if your
league wants different emphasis (e.g. heavier bowling weighting for shorter formats).

## Notes on cricket rules implemented

- Wide / no-ball: the 1-run penalty is separate from any runs actually run by the batsmen;
  no-ball runs off the bat are credited to the striker's personal score.
- Byes / leg-byes are legal deliveries (count toward the over) but runs are not credited to
  the batsman.
- Dead ball does not count as a legal delivery and carries no runs.
- Strike rotates on odd runs (including odd byes/leg-byes/extra wide runs) and automatically
  at the end of every over.
- Undo is snapshot-based: the entire innings state is snapshotted before each ball, so undo
  always restores a perfectly consistent state (score, wickets, extras, and every player's
  stats) rather than trying to algebraically reverse an event.
