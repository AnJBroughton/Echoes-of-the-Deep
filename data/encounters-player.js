// Player-safe interactive encounter definitions.
// Do not include private notes or plaintext solutions.
window.ECHOES_ENCOUNTERS = {
  version: 1,
  encounters: [
    {
      id: "trial-of-ten-eyes",
      title: "The Trial of the Ten Eyes",
      subtitle: "An interactive beholder puzzle",
      antagonist: "Karazikar the Beholder",
      introduction: "Ten dead eyes wake in the stone. Somewhere beyond them, Karazikar is already watching.",
      theme: {
        accent: "#d6b45f",
        arcane: "#a86cff",
        danger: "#d95a68"
      },
      magicInteractions: [
        {
          id: "detect-magic",
          label: "Detect Magic",
          icon: "✦",
          response: "Threads of divination connect every eye to the central seal. The magic reacts to intention, not force."
        },
        {
          id: "radiant-light",
          label: "Offer Radiant Light",
          icon: "☼",
          response: "The nearest pupils contract. For one breath, old scratches flare along the mechanism like a hidden constellation."
        },
        {
          id: "deep-speech",
          label: "Speak in Deep Speech",
          icon: "◉",
          response: "A voice answers from inside the walls: ‘To be seen is to be owned. To be remembered is to endure.’"
        }
      ],
      stages: [
        {
          id: "ring-of-gazes",
          number: "I",
          type: "rotors",
          title: "The Ring of Gazes",
          kicker: "Ten eyes. Four directions. One judgment.",
          prompt: "Rotate each stone eye until the tenfold gaze obeys the inscription, then invoke the seal.",
          clue: "Star and Crown look skyward. Fang and Web seek the setting dark. Flame, Horn, and Key greet the rising fire. Moon, Tide, and Chain watch the roots below.",
          directions: ["North", "East", "South", "West"],
          eyes: [
            { id: "crown", label: "Crown", glyph: "♛" },
            { id: "fang", label: "Fang", glyph: "⌁" },
            { id: "flame", label: "Flame", glyph: "♨" },
            { id: "tide", label: "Tide", glyph: "≋" },
            { id: "chain", label: "Chain", glyph: "∞" },
            { id: "moon", label: "Moon", glyph: "☾" },
            { id: "key", label: "Key", glyph: "⚿" },
            { id: "horn", label: "Horn", glyph: "♈" },
            { id: "web", label: "Web", glyph: "✣" },
            { id: "star", label: "Star", glyph: "✦" }
          ],
          answerHash: "7ca4f566",
          success: "The ten pupils lock into place. The central seal opens like an eyelid, revealing a memory trapped in amber light.",
          lore: "Karazikar did not build the Ten Eyes to watch intruders. He built them to decide which memories were permitted to survive."
        },
        {
          id: "burden-of-memory",
          number: "II",
          type: "placements",
          title: "The Burden of Memory",
          kicker: "Every tyrant chooses where history rests.",
          prompt: "Place each memory shard upon the pedestal that completes its meaning.",
          clue: "Rule sits above. Hunger gathers at the feast. Fire remembers the pyre. Betrayal knows its own reflection. Silence keeps the grave.",
          shards: [
            { id: "crown", label: "Rule", glyph: "♛", color: "gold" },
            { id: "fang", label: "Hunger", glyph: "⌁", color: "red" },
            { id: "flame", label: "Fire", glyph: "♨", color: "amber" },
            { id: "dagger", label: "Betrayal", glyph: "†", color: "violet" },
            { id: "moon", label: "Silence", glyph: "☾", color: "blue" }
          ],
          pedestals: [
            { id: "throne", label: "The Empty Throne", glyph: "♜" },
            { id: "feast", label: "The Last Feast", glyph: "◒" },
            { id: "pyre", label: "The Black Pyre", glyph: "△" },
            { id: "mirror", label: "The Unkind Mirror", glyph: "◇" },
            { id: "grave", label: "The Nameless Grave", glyph: "▱" }
          ],
          answerHash: "26b7996d",
          success: "The shards sink into the pedestals. Five scenes bloom across the chamber, each showing Karazikar erasing a different version of his defeat.",
          lore: "Five witnesses survived Karazikar’s first fall: a ruler, a flame-bearer, a betrayer, a mourner, and the silence that kept their names."
        },
        {
          id: "tenfold-answer",
          number: "III",
          type: "sequence",
          title: "The Tenfold Answer",
          kicker: "History opens only for those who name its witnesses.",
          prompt: "Select four sigils in the order that records Karazikar’s first ending.",
          clue: "First came the ruler who defied him. Then the fire that scarred him. Third, the reflection that betrayed him. Last, the grave that could not hold his name.",
          length: 4,
          symbols: [
            { id: "crown", label: "Crown", glyph: "♛" },
            { id: "fang", label: "Fang", glyph: "⌁" },
            { id: "flame", label: "Flame", glyph: "♨" },
            { id: "tide", label: "Tide", glyph: "≋" },
            { id: "chain", label: "Chain", glyph: "∞" },
            { id: "moon", label: "Moon", glyph: "☾" },
            { id: "key", label: "Key", glyph: "⚿" },
            { id: "horn", label: "Horn", glyph: "♈" },
            { id: "mirror", label: "Mirror", glyph: "◇" },
            { id: "grave", label: "Grave", glyph: "▱" }
          ],
          answerHash: "a236b997",
          success: "All ten eyes close. A final doorway irises open, and Karazikar’s laughter rolls through the stone.",
          lore: "Karazikar survived because his name remained inside the story of his defeat. The Trial preserves the very history he tried to destroy."
        }
      ],
      completion: {
        title: "The Trial Is Witnessed",
        text: "The seal yields. The party has reconstructed the memory Karazikar tried to erase, and the path beyond the Ten Eyes stands open.",
        unlock: "Unlocked: The Vault of the Severed Gaze"
      }
    }
  ]
};
