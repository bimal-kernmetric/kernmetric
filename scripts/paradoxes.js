import { getParadoxes, getRelationships } from './api/paradoxes.js';
import { getCompanies } from './api/companies.js';

document.addEventListener('DOMContentLoaded', async () => {
  const paradoxes = await getParadoxes();
  const companies = await getCompanies();
  const relationships = await getRelationships();

  const grid = document.getElementById('paradoxes-grid');
  const drawer = document.getElementById('detail-drawer');
  const drawerBody = document.getElementById('drawer-content-body');
  const closeBtn = document.getElementById('drawer-close-btn');

  if (!grid || !drawer || !drawerBody || !closeBtn) return;

  // 1. Render Cards Grid
  grid.innerHTML = '';
  paradoxes.forEach(paradox => {
    const card = document.createElement('div');
    card.className = 'card card-elevated';
    card.style.cursor = 'pointer';
    card.style.borderColor = 'var(--primary)';
    
    const taxes = paradox.taxonomy.map(t => `<span class="badge text-xs" style="margin-right: 4px;">${t}</span>`).join('');
    
    card.innerHTML = `
      <div style="margin-bottom: var(--space-xs);">${taxes}</div>
      <h3 style="margin-top: 0; color: var(--primary);">${paradox.name}</h3>
      <p class="text-sm" style="color: var(--text-secondary); line-height: 1.5; margin-bottom: var(--space-sm);">
        ${paradox.description.substring(0, 120)}...
      </p>
      <span class="monospace text-xs text-primary-color" style="font-weight: 500;">Configure Diagnostic →</span>
    `;

    card.addEventListener('click', () => {
      openDrawer(paradox.id);
    });

    grid.appendChild(card);
  });

  // Drawer Close Action
  closeBtn.addEventListener('click', closeDrawer);
  
  // Close on outer click
  document.addEventListener('click', (e) => {
    if (drawer.classList.contains('open') && !drawer.contains(e.target) && !e.target.closest('.card')) {
      closeDrawer();
    }
  });

  // 2. Parse Query Params to Auto-Open
  const params = new URLSearchParams(window.location.search);
  const activeId = params.get('id');
  if (activeId) {
    openDrawer(activeId);
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    // Remove query parameter cleanly
    const newUrl = window.location.pathname;
    window.history.pushState(null, '', newUrl);
  }

  // 3. Render Drawer Content dynamically
  async function openDrawer(id) {
    const p = paradoxes.find(item => item.id === id);
    if (!p) return;

    // Set URL parameter for deep-linking
    const newUrl = `${window.location.pathname}?id=${id}`;
    window.history.pushState({ id }, '', newUrl);

    // Find companies diagnosed with this paradox
    const rels = relationships.filter(r => r.target === id && r.relationship === 'diagnosed_with');
    const compIds = rels.map(r => r.source);
    const seenCompanies = companies.filter(c => compIds.includes(c.id));

    let seenHtml = '<p class="text-xs" style="color: var(--text-muted);">No studied brands diagnosed yet.</p>';
    if (seenCompanies.length > 0) {
      seenHtml = seenCompanies.map(c => `
        <div style="padding: var(--space-xs); border: 1px solid var(--border-color); border-radius: var(--border-radius); background-color: var(--bg-primary); margin-bottom: var(--space-xs); cursor: pointer;" onclick="window.location.href='case-study.html?id=mri_${c.id.replace('company_', '')}_v1'">
          <div style="font-weight: 500; font-size: 0.85rem; color: var(--text-primary);">${c.name}</div>
          <div class="monospace text-xs" style="color: var(--text-muted); font-size: 0.65rem;">${c.industry} • ${c.shopifyTier}</div>
        </div>
      `).join('');
    }

    const taxes = p.taxonomy.map(t => `<span class="badge text-xs" style="margin-right: 4px;">${t}</span>`).join('');

    drawerBody.innerHTML = `
      <h2 style="border-bottom: none; color: var(--primary); margin-top: 0; margin-bottom: var(--space-xs); font-size: 1.75rem;">${p.name}</h2>
      <div style="margin-bottom: var(--space-md);">${taxes}</div>
      
      <div style="margin-bottom: var(--space-md);">
        <h4 class="monospace text-xs text-muted-color" style="margin-bottom: 2px;">STRUCTURAL DEFINITION</h4>
        <p class="text-sm" style="line-height: 1.5;">${p.description}</p>
      </div>

      <div style="margin-bottom: var(--space-md);">
        <h4 class="monospace text-xs text-muted-color" style="margin-bottom: 2px;">ILLUSTRATIVE EXAMPLE</h4>
        <p class="text-xs" style="background-color: var(--bg-secondary); padding: var(--space-xs); border-radius: var(--border-radius); line-height: 1.5; color: var(--text-secondary);">
          ${p.example}
        </p>
      </div>

      <div style="margin-bottom: var(--space-md);">
        <h4 class="monospace text-xs text-muted-color" style="margin-bottom: 2px;">VALIDATION PROTOCOL</h4>
        <p class="text-sm" style="line-height: 1.5;">${p.validation}</p>
      </div>

      <div style="margin-top: var(--space-lg);">
        <h4 class="monospace text-xs text-muted-color" style="margin-bottom: var(--space-xs);">SEEN IN EMPIRICAL STUDIES</h4>
        ${seenHtml}
      </div>
    `;

    drawer.classList.add('open');
  }
});
