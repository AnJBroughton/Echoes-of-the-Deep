# Echoes of the Deep — Player Wiki

A spoiler-safe campaign reference for the players of **Echoes of the Deep**.

## Safety model

This repository is player-facing. Never place DM notes, hidden motives, unrevealed encounters, secret treasure, or undiscovered clues here.

The site reads `data/wiki-data.js`. Only entries with `published: true` appear.

## Sections

Memories, Locations, NPCs, Factions, Lore, Quests, Items, and Session Recaps.

## Images

Add images to `assets/images/`, then set an entry's `image` field to a path such as `assets/images/mantol-derith.jpg`. Blank image fields show a placeholder.

## GitHub Pages

Open **Settings → Pages**, choose **Deploy from a branch**, then select `main` and `/(root)`.

## Ledger workflow

The private Encounter Ledger remains the source of truth. Its player-wiki export replaces only `data/wiki-data.js`, containing approved player-facing fields.
