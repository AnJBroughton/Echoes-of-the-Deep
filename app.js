const data = window.WIKI_DATA || { entries: [] };
const grid = document.querySelector('#entryGrid');
const empty = document.querySelector('#emptyState');
const welcome = document.querySelector('#welcome');
const homeDashboard = document.querySelector('#homeDashboard');
const search = document.querySelector('#searchInput');
const count = document.querySelector('#resultCount');
const dialog = document.querySelector('#entryDialog');
const dialogContent = document.querySelector('#dialogContent');
const labels = { memory: 'Memory', location: 'Location', npc: 'NPC', faction: 'Faction', lore: 'Lore', quest: 'Quest', item: 'Item', boon: 'Boon', curse: 'Curse', recap: 'Recap' };
let section = (location.hash.slice(1) || 'home').toLowerCase();

function safe(value = '') {
  return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}
function published() { return data.entries.filter(entry => entry.published); }
function filtered() {
  const query = search.value.trim().toLowerCase();
  const types = section === 'home' ? [] : section === 'memories' ? ['memory'] : section === 'boons-curses' ? ['boon', 'curse'] : [section.replace(/s$/, '')];
  return published().filter(entry => (!types.length || types.includes(entry.type)) && (!query || [entry.title, entry.summary, entry.content, entry.type].join(' ').toLowerCase().includes(query)));
}
function findEntry(id) { return published().find(entry => entry.id === id); }
function imageMarkup(entry) { return entry.image ? `<img src="${safe(entry.image)}" alt="${safe(entry.title)}" style="display:block;width:100%;height:100%;object-fit:contain;background:#081014">` : '✦'; }
function galleryMarkup(entry) {
  const images = Array.isArray(entry.images) ? entry.images.filter(Boolean) : [];
  return images.length ? `<div style="display:grid;gap:14px;margin-top:24px">${images.map((image, index) => `<img src="${safe(image)}" alt="${safe(entry.title)} map ${index + 2}" style="display:block;width:100%;height:auto;border:1px solid var(--line);border-radius:10px;background:#081014">`).join('')}</div>` : '';
}
function entryDate(entry) { return Date.parse(entry.updatedAt || '') || 0; }
function newest(entries, limit) { return [...entries].sort((a, b) => entryDate(b) - entryDate(a) || data.entries.indexOf(b) - data.entries.indexOf(a)).slice(0, limit); }
function homeCard(entry) {
  return `<button class="home-card" type="button" data-home-id="${safe(entry.id)}">${entry.image ? `<img src="${safe(entry.image)}" alt="">` : ''}<span class="home-card-copy"><span class="tag">${safe(labels[entry.type] || entry.type)}</span><strong>${safe(entry.title)}</strong><small>${safe(entry.summary || '')}</small></span></button>`;
}
function renderHome() {
  const config = data.campaign?.home || {};
  const entries = published().filter(entry => entry.id !== 'welcome-to-the-archive');
  const current = findEntry(config.currentEntryId) || newest(entries.filter(entry => entry.type === 'recap'), 1)[0];
  const priorities = (config.priorityIds || []).map(findEntry).filter(Boolean);
  const recent = newest(entries.filter(entry => entry !== current), config.recentLimit || 6);
  const timeline = newest(entries.filter(entry => entry.type === 'recap'), config.timelineLimit || 3);
  homeDashboard.innerHTML = `${current ? `<section class="home-current"><div class="home-current-image">${imageMarkup(current)}</div><div class="home-current-copy"><p class="eyebrow">${safe(config.currentEyebrow || 'Current chapter')}</p><h2>${safe(current.title)}</h2><p>${safe(current.summary || '')}</p><p class="objective"><strong>What comes next</strong><br>${safe(config.currentObjective || '')}</p><button class="button" type="button" data-home-id="${safe(current.id)}">Read the latest recap</button></div></section>` : ''}<section class="home-section"><h2>Latest discoveries</h2><div class="home-cards">${recent.map(homeCard).join('')}</div></section>${priorities.length ? `<section class="home-section"><h2>Party priorities</h2><div class="home-cards">${priorities.map(homeCard).join('')}</div></section>` : ''}<section class="home-section"><h2>Explore the archive</h2><div class="home-categories"><a href="#locations">Locations</a><a href="#npcs">NPCs</a><a href="#recaps">Session Recaps</a><a href="#quests">Quests</a><a href="#items">Items</a><a href="#boons-curses">Boons &amp; Curses</a><a href="#factions">Factions</a><a href="#memories">Memories</a></div></section>${timeline.length ? `<section class="home-section"><h2>Campaign timeline</h2><div class="home-cards">${timeline.map(homeCard).join('')}</div></section>` : ''}`;
  homeDashboard.querySelectorAll('[data-home-id]').forEach(card => card.onclick = () => openEntry(card.dataset.homeId));
}
function render() {
  document.querySelectorAll('.wiki-nav a').forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${section}`));
  const dashboardMode = section === 'home' && !search.value;
  welcome.classList.add('hidden');
  homeDashboard.classList.toggle('hidden', !dashboardMode);
  grid.classList.toggle('hidden', dashboardMode);
  if (dashboardMode) renderHome();
  const entries = filtered();
  count.textContent = `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`;
  grid.innerHTML = entries.map(entry => `<article class="entry" tabindex="0" role="button" data-id="${safe(entry.id)}"><div class="entry-image" style="height:auto;aspect-ratio:3/2;overflow:hidden">${imageMarkup(entry)}</div><div class="entry-body"><span class="tag">${safe(labels[entry.type] || entry.type)}</span><h2>${safe(entry.title)}</h2><p>${safe(entry.summary || entry.content)}</p><span class="open">Read entry →</span></div></article>`).join('');
  empty.classList.toggle('hidden', entries.length > 0);
  grid.querySelectorAll('.entry').forEach(card => {
    card.onclick = () => openEntry(card.dataset.id);
    card.onkeydown = event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openEntry(card.dataset.id); } };
  });
}
function openEntry(id) {
  const entry = findEntry(id); if (!entry) return;
  const related = (entry.links || []).map(findEntry).filter(Boolean);
  dialogContent.innerHTML = `<div class="dialog-image" style="height:auto;aspect-ratio:3/2;overflow:hidden">${imageMarkup(entry)}</div><div class="dialog-body"><span class="tag">${safe(labels[entry.type] || entry.type)}</span><h2>${safe(entry.title)}</h2><p class="summary">${safe(entry.summary)}</p><div class="content">${safe(entry.content)}</div>${galleryMarkup(entry)}${related.length ? `<div class="links">${related.map(item => `<button data-link="${safe(item.id)}">${safe(item.title)}</button>`).join('')}</div>` : ''}</div>`;
  if (entry.effect) {
    dialogContent.querySelector('.content').insertAdjacentHTML('afterend', `<section class="item-effect" aria-label="Effect"><h3>Effect</h3><p class="effect-rarity">${safe(entry.effect.rarity)}</p><p>${safe(entry.effect.text)}</p></section>`);
  }
  dialogContent.querySelectorAll('[data-link]').forEach(button => button.onclick = () => openEntry(button.dataset.link));
  dialog.showModal();
}
window.addEventListener('hashchange', () => { section = (location.hash.slice(1) || 'home').toLowerCase(); render(); });
search.addEventListener('input', render);
document.querySelector('#closeDialog').onclick = () => dialog.close();
dialog.onclick = event => { if (event.target === dialog) dialog.close(); };
render();
