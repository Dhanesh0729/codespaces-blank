# Keiko — find your flow

A React typing practice app with timed, word count, quote, and custom text tests; live WPM and accuracy; an animated companion; synthesized keystroke sounds; eleven themes; custom accent colors; a reactive keyboard; progress analytics; and JSON backups.

## Run

```sh
npm install
npm run dev
```

Build for production with `npm run build` and preview with `npm run preview`.

Settings and the last 500 completed sessions persist in browser localStorage. Browsers do not permit silent writes to arbitrary local files. Use Export backup to download `keiko-progress.json` and Import backup to restore history. Clearing browser data removes local history, so export a backup first.

Keystroke sounds are generated with Web Audio; no audio downloads or external services are required. Typography uses Google Fonts with local fallbacks. The companion is an original SVG illustration. Its expression responds to speed and accuracy, it animates while typing, and its gaze follows the mouse. Tough-love reactions are optional.

Shift + Tab restarts the current test. Escape closes dialogs. Paste is disabled in the test so performance represents actual typing. Backspace corrections are allowed; accuracy counts all attempted characters, including corrected mistakes. WPM is correct characters divided by five, normalized to elapsed minutes.

## Match analysis and regression checks

Every completed test opens a per-second pace and mistake graph. Inspect seconds using the slider, arrow buttons, or graph hover. The popup identifies the fastest and most error-prone seconds, including characters mistyped and then corrected. Reopen saved breakdowns from the practice journal. Older history keeps its original overall statistics; detailed timelines are recorded for new tests.

The timer uses an independent wall-clock deadline and rejects changes at expiry, including after a background tab is resumed. Keiko has independently animated typing hands and a mouse arm that follows pointer movement. Reduced-motion preferences are respected.

Run the timer and timeline regression checks with `npm test`. They cover continuous typing renders, restart cleanup, background expiry, exact deadlines, corrected mistakes, and partial-second rates.

## Untimed practice and companion studio

Choose **untimed** for a continuously extended passage. Escape completes the match immediately. Five seconds without a character edit completes it automatically; the countdown appears after a short pause, and the idle grace period is excluded from the score. Both endings save the usual match breakdown.

Open **Companion studio** from the sidebar or companion gear to set a name, hair and outfit colors, skin tone, clothing, accessories, personality, animation/reaction preferences, and a celestial, storm, or phoenix divine form. Settings persist automatically. The studio previews appearances and reactions without altering performance history.

God Mode keeps the typing passage steady while surrounding headings and sidebar lettering tremble and scatter as sustained pace rises. Slowing down reduces the effect, and ending/resetting the session restores everything. Its interactive preview has a pace slider: hold a high pace, ease off, then accelerate again. It stays open until you end it or start typing. Reduced motion is respected.
