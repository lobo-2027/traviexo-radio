# TRAVIEXO RADIO — Golden Music background (safe preview)

Base: backup/v70-approved-2026-11-06. Never merge to main before iPhone playback verification.

## Design rules
- Background image is decorative only: no play/pause, next, previous, menu or station buttons painted into it.
- Existing HTML player, tabs, search and fold button remain the only interactive controls.
- Place image behind existing main UI, with pointer-events:none and a dark contrast overlay.
- On iPhone, use background-size:cover only if guitar is not cropped; otherwise use a dedicated mobile crop or background-size:contain with a dark fill.
- Respect env(safe-area-inset-top) and env(safe-area-inset-bottom).
- Do not alter audio element, MediaSession, streaming source, playback state, or collapsed-player behavior.

## Implementation pending asset
Upload approved clean image to assets/TRAVIEXO_GOLDEN_MUSIC_BACKGROUND.png on this preview branch. The generated background contains a gold treble-clef guitar and **no drawn controls**.

## Acceptance tests
1. No duplicate visible controls or menu items.
2. Play/pause, previous/next, search, categories and fold all remain tappable.
3. Audio continues when folding the player and when iPhone is locked (where station/browser permits).
4. Landscape and portrait do not crop the guitar or obscure labels.
5. Existing official deployment is unchanged.
