const allPaintings = Array.isArray(window.GALLERY_DATA) ? window.GALLERY_DATA : [];
let visible = [...allPaintings];
let currentIndex = 0;

const grid = document.getElementById('galleryGrid');
const search = document.getElementById('search');
const empty = document.getElementById('emptyState');
const viewer = document.getElementById('viewer');
const imageFolder = document.body.dataset.imageFolder || 'images';
const thumbFolder = document.body.dataset.thumbFolder || imageFolder;
const collectionCount = document.getElementById('collectionCount');
if (collectionCount) collectionCount.textContent = allPaintings.length;

function escapeHtml(value='') {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}
function detail(label, value) {
  return value ? `<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd>` : '';
}
function imageUrl(file) {
  return `${imageFolder}/${encodeURIComponent(file)}`;
}
function thumbUrl(file) {
  return `${thumbFolder}/${encodeURIComponent(file)}`;
}
function render() {
  grid.innerHTML = visible.map((p, i) => `
    <article class="card" data-index="${i}" tabindex="0">
      <div class="thumb"><img loading="lazy" decoding="async" fetchpriority="low" src="${thumbUrl(p.file)}" data-full="${imageUrl(p.file)}" alt="${escapeHtml(p.title)}"></div>
      <div class="card-body">
        <h3>${escapeHtml(p.title || 'Untitled')}</h3>
        ${p.size ? `<div class="card-size">${escapeHtml(p.size)}</div>` : ''}
        ${p.status ? `<div class="status">${escapeHtml(p.status)}</div>` : ''}
      </div>
    </article>`).join('');
  empty.hidden = visible.length > 0;
  document.querySelectorAll('.card').forEach(card => {
    const open = () => showPainting(Number(card.dataset.index));
    card.addEventListener('click', open);
    card.addEventListener('keydown', e => { if (e.key === 'Enter') open(); });
  });
}
function filterPaintings() {
  const q = search.value.trim().toLowerCase();
  visible = allPaintings.filter(p => !q || [p.title,p.description,p.medium].join(' ').toLowerCase().includes(q));
  render();
}
function showPainting(index) {
  currentIndex = index;
  const p = visible[index];
  if (!p) return;
  const img = document.getElementById('viewerImg');
  img.src = imageUrl(p.file);
  img.alt = p.title || 'Painting';
  document.getElementById('viewerTitle').textContent = p.title || 'Untitled';
  document.getElementById('viewerDetails').innerHTML =
    detail('Medium', p.medium) + detail('Size', p.size) + detail('Status', p.status);
  viewer.showModal();
}
function move(delta) {
  if (!visible.length) return;
  currentIndex = (currentIndex + delta + visible.length) % visible.length;
  showPainting(currentIndex);
}
search.addEventListener('input', filterPaintings);
document.querySelector('.close').addEventListener('click', () => viewer.close());
document.querySelector('.prev').addEventListener('click', () => move(-1));
document.querySelector('.next').addEventListener('click', () => move(1));
viewer.addEventListener('click', e => { if (e.target === viewer) viewer.close(); });
document.addEventListener('keydown', e => {
  if (!viewer.open) return;
  if (e.key === 'ArrowLeft') move(-1);
  if (e.key === 'ArrowRight') move(1);
  if (e.key === 'Escape') viewer.close();
});
document.querySelectorAll('.year').forEach(el => el.textContent = new Date().getFullYear());
render();
