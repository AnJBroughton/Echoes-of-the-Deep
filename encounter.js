(function () {
  "use strict";

  const root = document.getElementById("encounterRoot");
  const params = new URLSearchParams(window.location.search);
  const catalog = window.ECHOES_ENCOUNTERS?.encounters || [];
  const encounterId = params.get("id") || window.ECHOES_OFFLINE_DEFAULT_ID || "";
  const encounter = catalog.find((item) => item.id === encounterId);
  const storageKey = encounter ? `echoes.encounter.${encounter.id}.player.v2` : "";
  const channel = encounter && "BroadcastChannel" in window
    ? new BroadcastChannel(`echoes-encounter-player-v2-${encounter.id}`)
    : null;
  let state = encounter ? loadState() : null;

  function escapeHTML(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function defaultState() {
    return {
      stageIndex: 0,
      completedStages: [],
      rotations: Array(encounter?.stages?.[0]?.eyes?.length || 10).fill(0),
      placements: {},
      selectedShard: null,
      sequence: [],
      interactions: [],
      feedback: null,
      revealedHint: 0,
      loreUnlocked: [],
      attempts: {},
      completed: false,
      updatedAt: Date.now()
    };
  }

  function normalizeState(candidate) {
    const base = defaultState();
    const next = { ...base, ...(candidate || {}) };
    next.stageIndex = Math.max(0, Math.min(encounter.stages.length - 1, Number(next.stageIndex) || 0));
    next.completedStages = Array.isArray(next.completedStages) ? next.completedStages : [];
    next.rotations = Array.isArray(next.rotations) ? next.rotations : base.rotations;
    next.placements = next.placements && typeof next.placements === "object" ? next.placements : {};
    next.sequence = Array.isArray(next.sequence) ? next.sequence : [];
    next.interactions = Array.isArray(next.interactions) ? next.interactions : [];
    next.loreUnlocked = Array.isArray(next.loreUnlocked) ? next.loreUnlocked : [];
    next.attempts = next.attempts && typeof next.attempts === "object" ? next.attempts : {};
    return next;
  }

  function loadState() {
    try {
      return normalizeState(JSON.parse(localStorage.getItem(storageKey)));
    } catch (_error) {
      return defaultState();
    }
  }

  function saveState({ broadcast = true } = {}) {
    state.updatedAt = Date.now();
    localStorage.setItem(storageKey, JSON.stringify(state));
    if (broadcast && channel) channel.postMessage(state);
  }

  function commit(mutator) {
    mutator(state);
    saveState();
    render();
  }

  function answerHash(value) {
    let hash = 0x811c9dc5;
    for (const character of value) {
      hash ^= character.charCodeAt(0);
      hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(16).padStart(8, "0");
  }

  function viewURL(view) {
    const url = new URL(window.location.href);
    url.searchParams.set("id", encounter.id);
    url.searchParams.set("view", view);
    return url.href;
  }

  function directoryURL() {
    if (window.ECHOES_OFFLINE_DEFAULT_ID) return viewURL("player");
    return "index.html#encounters";
  }

  function renderDirectory() {
    document.title = "Interactive Encounters · Echoes of the Deep";
    root.innerHTML = `
      <main class="directory">
        <section class="directory-card">
          <p class="eyebrow">Echoes of the Deep</p>
          <h1>Interactive Encounters</h1>
          <p>Choose an encounter to begin. Progress is saved in this browser.</p>
          <div class="directory-list">
            ${catalog.map((item) => `
              <a class="directory-link" href="?id=${encodeURIComponent(item.id)}&view=player">
                <strong>${escapeHTML(item.title)}</strong><br>
                <small>${escapeHTML(item.subtitle)}</small>
              </a>`).join("") || "<p>No encounters are available.</p>"}
          </div>
          <p><a class="link-button" href="index.html#encounters">Return to the wiki</a></p>
        </section>
      </main>`;
  }

  function topbarMarkup() {
    return `
      <header class="encounter-topbar">
        <a class="brand" href="${escapeHTML(directoryURL())}">
          <span class="brand-mark" aria-hidden="true">◉</span>
          <span class="brand-copy"><small>Echoes of the Deep</small><strong>Interactive Encounters</strong></span>
        </a>
        <span class="mode-badge">Player View</span>
        <button class="top-button" data-action="fullscreen">Full Screen</button>
      </header>`;
  }

  function progressMarkup() {
    return encounter.stages.map((stage, index) => {
      const complete = state.completedStages.includes(stage.id);
      const active = index === state.stageIndex && !state.completed;
      return `<span class="progress-eye${complete ? " complete" : ""}${active ? " active" : ""}" title="${escapeHTML(stage.title)}">${complete ? "✓" : stage.number}</span>`;
    }).join("");
  }

  function feedbackMarkup() {
    if (!state.feedback) return "";
    return `<div class="feedback ${escapeHTML(state.feedback.type || "")}" role="status">${escapeHTML(state.feedback.text)}</div>`;
  }

  function magicMarkup() {
    return `<div class="magic-row" aria-label="Magical interactions">
      ${encounter.magicInteractions.map((item) => `
        <button class="magic-button${state.interactions.includes(item.id) ? " used" : ""}" data-magic="${escapeHTML(item.id)}">
          <span aria-hidden="true">${escapeHTML(item.icon)}</span> ${escapeHTML(item.label)}
        </button>`).join("")}
    </div>`;
  }

  function stageHeadingMarkup(stage) {
    return `<header class="stage-heading">
      <span class="stage-number">Challenge ${escapeHTML(stage.number)}</span>
      <h2>${escapeHTML(stage.title)}</h2>
      <p class="kicker">${escapeHTML(stage.kicker)}</p>
    </header>`;
  }

  function stageFooterMarkup(stage) {
    const complete = state.completedStages.includes(stage.id);
    return `
      ${feedbackMarkup()}
      ${complete ? `<aside class="lore-reveal"><strong>Recovered Lore</strong>${escapeHTML(stage.lore)}</aside>` : ""}
      ${magicMarkup()}
      <div class="stage-actions">
        ${complete
          ? `<button class="primary-button" data-action="continue">${state.stageIndex === encounter.stages.length - 1 ? "Open the Final Seal" : "Continue to the Next Challenge"}</button>`
          : '<button class="primary-button" data-action="invoke">Invoke the Seal</button>'}
      </div>`;
  }

  function rotorsMarkup(stage) {
    return `
      ${stageHeadingMarkup(stage)}
      <div class="stage-content">
        <p class="prompt">${escapeHTML(stage.prompt)}</p>
        <blockquote class="inscription">${escapeHTML(stage.clue)}</blockquote>
        <div class="beholder-seal" aria-hidden="true"></div>
        <div class="eye-grid">
          ${stage.eyes.map((eye, index) => {
            const rotation = Number(state.rotations[index]) || 0;
            return `<button class="eye-rotor" data-rotate="${index}" aria-label="Rotate ${escapeHTML(eye.label)} eye. Currently facing ${stage.directions[rotation]}">
              <span class="eye-glyph" aria-hidden="true">${escapeHTML(eye.glyph)}</span>
              <span class="stone-eye" aria-hidden="true"><span class="pupil" style="transform:rotate(${rotation * 90}deg) translateY(-8px)"></span></span>
              <span class="eye-meta"><strong>${escapeHTML(eye.label)}</strong><small>${escapeHTML(stage.directions[rotation])}</small></span>
            </button>`;
          }).join("")}
        </div>
        ${stageFooterMarkup(stage)}
      </div>`;
  }

  function shardForPedestal(pedestalId) {
    return Object.entries(state.placements).find(([, placedOn]) => placedOn === pedestalId)?.[0] || null;
  }

  function placementsMarkup(stage) {
    return `
      ${stageHeadingMarkup(stage)}
      <div class="stage-content">
        <p class="prompt">${escapeHTML(stage.prompt)}</p>
        <blockquote class="inscription">${escapeHTML(stage.clue)}</blockquote>
        <div class="shard-workspace">
          <section class="shard-tray"><h3 class="workspace-title">Memory Shards</h3><div class="shards">
            ${stage.shards.map((shard) => {
              const placed = Boolean(state.placements[shard.id]);
              return `<button class="memory-shard${state.selectedShard === shard.id ? " selected" : ""}${placed ? " placed" : ""}" draggable="true" data-shard="${escapeHTML(shard.id)}">
                <span class="glyph" aria-hidden="true">${escapeHTML(shard.glyph)}</span>
                <span><strong>${escapeHTML(shard.label)}</strong><small>${placed ? `Placed: ${escapeHTML(state.placements[shard.id])}` : "Select or drag this shard"}</small></span>
              </button>`;
            }).join("")}
          </div></section>
          <section class="pedestal-field"><h3 class="workspace-title">Stone Pedestals</h3><div class="pedestals">
            ${stage.pedestals.map((pedestal) => {
              const shardId = shardForPedestal(pedestal.id);
              const shard = stage.shards.find((item) => item.id === shardId);
              return `<button class="pedestal" data-pedestal="${escapeHTML(pedestal.id)}">
                <span class="pedestal-glyph" aria-hidden="true">${escapeHTML(pedestal.glyph)}</span>
                <strong>${escapeHTML(pedestal.label)}</strong>
                ${shard ? `<span class="placed-shard">${escapeHTML(shard.glyph)} ${escapeHTML(shard.label)}</span>` : ""}
              </button>`;
            }).join("")}
          </div></section>
        </div>
        <div class="stage-actions"><button class="secondary-button" data-action="clear-placements">Clear the Pedestals</button></div>
        ${stageFooterMarkup(stage)}
      </div>`;
  }

  function sequenceMarkup(stage) {
    return `
      ${stageHeadingMarkup(stage)}
      <div class="stage-content">
        <p class="prompt">${escapeHTML(stage.prompt)}</p>
        <blockquote class="inscription">${escapeHTML(stage.clue)}</blockquote>
        <div class="sequence-display" aria-label="Selected sequence">
          ${Array.from({ length: stage.length }, (_, index) => {
            const symbol = stage.symbols.find((item) => item.id === state.sequence[index]);
            return `<span class="sequence-slot${symbol ? " filled" : ""}" title="${symbol ? escapeHTML(symbol.label) : `Position ${index + 1}`}">${symbol ? escapeHTML(symbol.glyph) : index + 1}</span>`;
          }).join("")}
        </div>
        <div class="symbol-grid">
          ${stage.symbols.map((symbol) => `<button class="symbol-button" data-symbol="${escapeHTML(symbol.id)}"><span class="glyph" aria-hidden="true">${escapeHTML(symbol.glyph)}</span><small>${escapeHTML(symbol.label)}</small></button>`).join("")}
        </div>
        <div class="stage-actions"><button class="secondary-button" data-action="undo-symbol">Undo</button><button class="secondary-button" data-action="clear-sequence">Clear</button></div>
        ${stageFooterMarkup(stage)}
      </div>`;
  }

  function currentStageMarkup() {
    if (state.completed) {
      return `<div class="completion">
        <div class="completion-mark" aria-hidden="true">◉</div>
        <p class="eyebrow">Karazikar’s Record Restored</p>
        <h2>${escapeHTML(encounter.completion.title)}</h2>
        <p>${escapeHTML(encounter.completion.text)}</p>
        <span class="unlock-banner">${escapeHTML(encounter.completion.unlock)}</span>
        <div class="stage-actions"><button class="secondary-button" data-action="review">Review the Trial</button></div>
      </div>`;
    }
    const stage = encounter.stages[state.stageIndex];
    if (stage.type === "rotors") return rotorsMarkup(stage);
    if (stage.type === "placements") return placementsMarkup(stage);
    return sequenceMarkup(stage);
  }


  function render() {
    if (!encounter) return renderDirectory();
    document.title = `${encounter.title} · Echoes of the Deep`;
    root.className = "encounter-shell player-mode";
    root.style.setProperty("--gold", encounter.theme?.accent || "#d6b45f");
    root.style.setProperty("--arcane", encounter.theme?.arcane || "#a86cff");
    root.style.setProperty("--danger", encounter.theme?.danger || "#d95a68");
    root.innerHTML = `${topbarMarkup()}<div class="encounter-layout">
      <main class="player-stage">
        <header class="encounter-hero">
          <div><p class="eyebrow">${escapeHTML(encounter.antagonist)}</p><h1>${escapeHTML(encounter.title)}</h1><p class="subtitle">${escapeHTML(encounter.introduction)}</p></div>
          <div class="progress-orbit" aria-label="Encounter progress">${progressMarkup()}</div>
        </header>
        <section class="encounter-board">${currentStageMarkup()}</section>
      </main>
    </div>`;
    bindEvents();
  }

  function serializeCurrent(stage) {
    if (stage.type === "rotors") return state.rotations.slice(0, stage.eyes.length).join(",");
    if (stage.type === "placements") return stage.pedestals.map((pedestal) => `${pedestal.id}:${shardForPedestal(pedestal.id) || ""}`).join("|");
    return state.sequence.join(",");
  }

  function invokeSeal() {
    const stage = encounter.stages[state.stageIndex];
    if (answerHash(serializeCurrent(stage)) === stage.answerHash) {
      commit((next) => {
        if (!next.completedStages.includes(stage.id)) next.completedStages.push(stage.id);
        if (!next.loreUnlocked.includes(stage.id)) next.loreUnlocked.push(stage.id);
        next.feedback = { type: "success", text: stage.success };
      });
      return;
    }
    commit((next) => {
      next.attempts[stage.id] = (next.attempts[stage.id] || 0) + 1;
      next.feedback = { type: "error", text: "The mechanism rejects the answer. Stone grinds against stone, and the ten eyes open wider." };
      if (stage.type === "sequence") next.sequence = [];
    });
  }

  function continueEncounter() {
    if (state.stageIndex >= encounter.stages.length - 1) {
      commit((next) => { next.completed = true; next.feedback = null; });
    } else {
      commit((next) => { next.stageIndex += 1; next.feedback = null; next.revealedHint = 0; });
    }
  }

  function placeShard(shardId, pedestalId) {
    const stage = encounter.stages[state.stageIndex];
    if (!stage.shards.some((item) => item.id === shardId)) return;
    commit((next) => {
      for (const [otherShard, location] of Object.entries(next.placements)) {
        if (location === pedestalId) delete next.placements[otherShard];
      }
      next.placements[shardId] = pedestalId;
      next.selectedShard = null;
      next.feedback = null;
    });
  }


  function bindEvents() {
    root.querySelectorAll("[data-rotate]").forEach((button) => button.addEventListener("click", () => {
      const index = Number(button.dataset.rotate);
      commit((next) => { next.rotations[index] = ((next.rotations[index] || 0) + 1) % 4; next.feedback = null; });
    }));
    root.querySelectorAll("[data-magic]").forEach((button) => button.addEventListener("click", () => {
      const interaction = encounter.magicInteractions.find((item) => item.id === button.dataset.magic);
      if (!interaction) return;
      commit((next) => {
        if (!next.interactions.includes(interaction.id)) next.interactions.push(interaction.id);
        next.feedback = { type: "hint", text: interaction.response };
      });
    }));
    root.querySelectorAll("[data-shard]").forEach((button) => {
      button.addEventListener("click", () => commit((next) => { next.selectedShard = button.dataset.shard; next.feedback = null; }));
      button.addEventListener("dragstart", (event) => event.dataTransfer.setData("text/plain", button.dataset.shard));
    });
    root.querySelectorAll("[data-pedestal]").forEach((button) => {
      button.addEventListener("dragover", (event) => { event.preventDefault(); button.classList.add("dragover"); });
      button.addEventListener("dragleave", () => button.classList.remove("dragover"));
      button.addEventListener("drop", (event) => { event.preventDefault(); placeShard(event.dataTransfer.getData("text/plain"), button.dataset.pedestal); });
      button.addEventListener("click", () => { if (state.selectedShard) placeShard(state.selectedShard, button.dataset.pedestal); });
    });
    root.querySelectorAll("[data-symbol]").forEach((button) => button.addEventListener("click", () => {
      const stage = encounter.stages[state.stageIndex];
      if (state.sequence.length >= stage.length) return;
      commit((next) => { next.sequence.push(button.dataset.symbol); next.feedback = null; });
    }));
    root.querySelectorAll("[data-action]").forEach((button) => button.addEventListener("click", async () => {
      const action = button.dataset.action;
      if (action === "invoke") invokeSeal();
      if (action === "continue") continueEncounter();
      if (action === "clear-placements") commit((next) => { next.placements = {}; next.selectedShard = null; next.feedback = null; });
      if (action === "undo-symbol") commit((next) => { next.sequence.pop(); next.feedback = null; });
      if (action === "clear-sequence") commit((next) => { next.sequence = []; next.feedback = null; });
      if (action === "review") commit((next) => { next.completed = false; next.stageIndex = 0; next.feedback = null; });
      if (action === "fullscreen") {
        if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.();
        else await document.exitFullscreen?.();
      }
    }));
  }

  if (channel) {
    channel.addEventListener("message", (event) => {
      if (!event.data || event.data.updatedAt <= state.updatedAt) return;
      state = normalizeState(event.data);
      saveState({ broadcast: false });
      render();
    });
  }
  window.addEventListener("storage", (event) => {
    if (event.key !== storageKey || !event.newValue) return;
    try {
      const incoming = normalizeState(JSON.parse(event.newValue));
      if (incoming.updatedAt > state.updatedAt) { state = incoming; render(); }
    } catch (_error) { /* Ignore malformed external state. */ }
  });

  render();
})();
