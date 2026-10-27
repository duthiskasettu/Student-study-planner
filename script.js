const API = '/api/assignments';
let allAssignments = [];
let currentFilter = 'all';
let searchQuery = '';

// DOM Elements
const form = document.getElementById('assignment-form');
const list = document.getElementById('assignment-list');
const msg = document.getElementById('form-msg');
const searchInput = document.getElementById('search');
const themeBtn = document.getElementById('theme-toggle');

// Theme Toggle Logic
themeBtn.addEventListener('click', () => {
  const isDark = document.body.getAttribute('data-theme') === 'dark';
  document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
  themeBtn.textContent = isDark ? '🌙' : '☀️';
});

// Filter Buttons Logic
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    currentFilter = e.target.dataset.filter;
    updateUI();
  });
});

// Search Logic
searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value.toLowerCase();
  updateUI();
});

function showMsg(t, type) {
  msg.textContent = t; msg.className = 'msg ' + (type || '');
  if (t) setTimeout(() => { msg.textContent = ''; msg.className = 'msg'; }, 3500);
}

function escapeHtml(s) {
  if (!s) return '';
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

async function loadAssignments() {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    allAssignments = await res.json();
    updateUI();
  } catch (e) { console.error(e); showMsg('Failed to load.', 'error'); }
}

function updateUI() {
  // Update Stats
  const total = allAssignments.length;
  const completed = allAssignments.filter(a => a.status === 'Completed').length;
  const pending = total - completed;
  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-pending').textContent = pending;
  document.getElementById('stat-completed').textContent = completed;

  // Filter Tasks
  let filtered = allAssignments;
  if (currentFilter !== 'all') filtered = filtered.filter(a => a.status === currentFilter);
  if (searchQuery) filtered = filtered.filter(a => 
    (a.title && a.title.toLowerCase().includes(searchQuery)) || 
    (a.subject && a.subject.toLowerCase().includes(searchQuery)) ||
    (a.assignmentName && a.assignmentName.toLowerCase().includes(searchQuery))
  );

  render(filtered);
}

function render(items) {
  list.innerHTML = '';
  if (!items.length) { list.innerHTML = '<li style="text-align:center; color:var(--text-muted); padding:20px;">No tasks found.</li>'; return; }
  
  items.forEach(a => {
    const li = document.createElement('li');
    li.className = 'assignment' + (a.status === 'Completed' ? ' completed' : '');
    li.innerHTML = `
      <div class="info">
        <strong>${escapeHtml(a.title || 'Untitled Task')}</strong>
        <small>${escapeHtml(a.subject)} • ${escapeHtml(a.assignmentName)} • Due: ${escapeHtml(a.deadline)}</small>
      </div>
      <div style="display:flex; gap:12px; align-items:center;">
        <span class="badge ${a.priority || 'Medium'}">${a.priority || 'Medium'}</span>
        <div class="actions">
          ${a.status !== 'Completed' ? `<button class="btn-complete" data-action="complete" data-id="${a.id}">✓</button>` : ''}
          <button class="btn-delete" data-action="delete" data-id="${a.id}">🗑</button>
        </div>
      </div>
    `;
    list.appendChild(li);
  });
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  const title = document.getElementById('title').value.trim();
  const subject = document.getElementById('subject').value.trim();
  const assignmentName = document.getElementById('assignmentName').value.trim();
  const deadline = document.getElementById('deadline').value;
  const priority = document.getElementById('priority').value;

  if (!title || !subject || !assignmentName || !deadline) return showMsg('Fill all fields.', 'error');
  
  try {
    const res = await fetch(API, { 
      method:'POST', 
      headers:{'Content-Type':'application/json'}, 
      body: JSON.stringify({ title, subject, assignmentName, deadline, priority }) 
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    form.reset(); showMsg('Task added successfully! ✅','success'); loadAssignments();
  } catch (e) { console.error(e); showMsg('Failed to add.', 'error'); }
});

list.addEventListener('click', async e => {
  const btn = e.target.closest('button[data-action]'); if (!btn) return;
  const id = btn.dataset.id;
  try {
    if (btn.dataset.action === 'complete') {
      const r = await fetch(`${API}/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({status:'Completed'}) });
      if (!r.ok) throw new Error('HTTP ' + r.status);
    } else {
      const r = await fetch(`${API}/${id}`, { method:'DELETE' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
    }
    loadAssignments();
  } catch (e) { console.error(e); showMsg('Action failed.', 'error'); }
});

// Initialize
loadAssignments();
