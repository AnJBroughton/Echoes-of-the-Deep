const data = window.WIKI_DATA || { entries: [] };
const grid = document.querySelector('#entryGrid');
const empty = document.querySelector('#emptyState');
const welcome = document.querySelector('#welcome');
const search = document.querySelector('#searchInput');
const count = document.querySelector('#resultCount');
const dialog = document.querySelector('#entryDialog');
const dialogContent = document.querySelector('#dialogContent');
const labels = { memory: 'Memory', location: 'Location', npc: 'NPC', faction: 'Faction', lore: 'Lore', quest: 'Quest', item: 'Item', recap: 'Recap' };
let section = (location.hash.slice(1) || 'home').toLowerCase();

function safe(value = '') {
  return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}
function published() { return data.entries.filter(entry => entry.published); }
function filtered() {
  const query = search.value.trim().toLowerCase();
  const type = section === 'home' ? '' : section === 'memories' ? 'memory' : section.replace(/s$/, '');
  return published().filter(entry => (!type || entry.type === type) && (!query || [entry.title, entry.summary, entry.content, entry.type].join(' ').toLowerCase().includes(query)));
}
function findEntry(id) { return published().find(entry => entry.id === id); }
function imageMarkup(entry) { return entry.image ? `<img src="${safe(entry.image)}" alt="${safe(entry.title)}" style="display:block;width:100%;height:100%;object-fit:contain;background:#081014">` : '✦'; }
function render() {
  document.querySelectorAll('.wiki-nav a').forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${section}`));
  welcome.classList.toggle('hidden', section !== 'home' || Boolean(search.value));
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
  dialogContent.innerHTML = `<div class="dialog-image" style="height:auto;aspect-ratio:3/2;overflow:hidden">${imageMarkup(entry)}</div><div class="dialog-body"><span class="tag">${safe(labels[entry.type] || entry.type)}</span><h2>${safe(entry.title)}</h2><p class="summary">${safe(entry.summary)}</p><div class="content">${safe(entry.content)}</div>${related.length ? `<div class="links">${related.map(item => `<button data-link="${safe(item.id)}">${safe(item.title)}</button>`).join('')}</div>` : ''}</div>`;
  dialogContent.querySelectorAll('[data-link]').forEach(button => button.onclick = () => openEntry(button.dataset.link));
  dialog.showModal();
}
window.addEventListener('hashchange', () => { section = (location.hash.slice(1) || 'home').toLowerCase(); render(); });
search.addEventListener('input', render);
document.querySelector('#closeDialog').onclick = () => dialog.close();
dialog.onclick = event => { if (event.target === dialog) dialog.close(); };
render();
