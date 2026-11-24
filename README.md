# Echoes of the Deep — Player Wiki

A campaign reference and interactive encounter platform for **Echoes of the Deep**.

## Safety model

This is a public, player-only wiki. Do not commit DM notes, solutions, or offline bundles that contain them.

Keep DM material outside this repository.

The site reads `data/wiki-data.js`. Only entries with `published: true` appear.

## Sections

Memories, Locations, NPCs, Factions, Quests, Items, Boons & Curses, Interactive Encounters, and Session Recaps.

## Interactive encounters

`encounter.html` is a reusable player shell. It selects a player-safe definition from `data/encounters-player.js` using the `id` query parameter.

- Player: `encounter.html?id=trial-of-ten-eyes&view=player`
- Standalone: `encounters/trial-of-ten-eyes-player.html`

Progress is stored in this browser and synchronized across Player View tabs. New encounters can reuse the same stage renderer.

Regenerate standalone encounter files with:

```sh
node scripts/build-encounter-backups.mjs
```

## Images

Add images to `assets/images/`, then set an entry's `image` field to a path such as `assets/images/mantol-derith.jpg`. Blank image fields show a placeholder.

## GitHub Pages

Open **Settings → Pages**, choose **Deploy from a branch**, then select `main` and `/(root)`.

## Ledger workflow

The private Encounter Ledger remains the source of truth. Its player-wiki export replaces only `data/wiki-data.js`, containing approved player-facing fields.
