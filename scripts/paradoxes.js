import { getParadoxes, getRelationships } from './api/paradoxes.js';
import { getCompanies } from './api/companies.js';
import { getResearch } from './api/research.js';

document.addEventListener('DOMContentLoaded', async () => {
  const paradoxes = await getParadoxes();
  const companies = await getCompanies();
  const relationships = await getRelationships();
  const allResearch = await getResearch();

  const grid = document.getElementById('paradoxes-grid');
  const drawer = document.getElementById('detail-drawer');
  const drawerBody = document.getElementById('drawer-content-body');
  const closeBtn = document.getElementById('drawer-close-btn');

  if (!grid || !drawer || !drawerBody || !closeBtn) return;

  // 1. Render Cards Grid using DS v3 classes
  grid.innerHTML = '';
  paradoxes.forEach(paradox => {
    const card = document.createElement('div');
    card.className = 'km-constraint-card';
    card.style.cursor = 'pointer';

    const taxes = paradox.taxonomy.map(t => `<span class="badge text-xs" style="margin-right: 4px; font-size: 0.65rem;">${t}</span>`).join('');
    
    // Find diagnosed companies
    const rels = relationships.filter(r => r.target === paradox.id && r.relationship === 'diagnosed_with');
    const compIds = rels.map(r => r.source);
    const seenCompanies = companies.filter(c => compIds.includes(c.id));
    const seenNames = seenCompanies.map(c => c.name).join(', ');

    card.innerHTML = `
      <div>
        <div style="margin-bottom: var(--space-xs);">${taxes}</div>
        <h3 style="margin-top: 0; font-family: 'Source Serif 4', serif; font-size: 1.35rem;">${paradox.name}</h3>
      </div>
      <p class="text-xs" style="color: var(--text-secondary); line-height: 1.45; margin: var(--space-xs) 0;">
        ${paradox.description.substring(0, 110)}...
      </p>
      <div style="border-top: 1px dashed var(--border-color); padding-top: var(--space-xs); margin-top: auto;">
        <span class="monospace text-xs text-muted-color" style="display: block; font-size: 0.6rem; margin-bottom: 2px;">OBSERVED IN:</span>
        <span class="monospace text-primary-color" style="font-size: 0.75rem; font-weight: 600;">${seenNames || 'General Cohort'}</span>
      </div>
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
    if (drawer.classList.contains('open') && !drawer.contains(e.target) && !e.target.closest('.km-constraint-card')) {
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
    const newUrl = window.location.pathname;
    window.history.pushState(null, '', newUrl);
  }

  // 3. Render Drawer Content dynamically
  async function openDrawer(id) {
    const p = paradoxes.find(item => item.id === id);
    if (!p) return;

    const newUrl = `${window.location.pathname}?id=${id}`;
    window.history.pushState({ id }, '', newUrl);

    // Find companies diagnosed with this paradox
    const rels = relationships.filter(r => r.target === id && r.relationship === 'diagnosed_with');
    const compIds = rels.map(r => r.source);
    const seenCompanies = companies.filter(c => compIds.includes(c.id));

    let seenHtml = '<p class="text-xs" style="color: var(--text-muted); font-family: \'JetBrains Mono\', monospace;">No studied brands diagnosed yet.</p>';
    if (seenCompanies.length > 0) {
      seenHtml = seenCompanies.map(c => `
        <div style="padding: var(--space-xs); border: 1px solid var(--border-color); border-radius: var(--border-radius); background-color: var(--bg-primary); margin-bottom: var(--space-xs); cursor: pointer;" onclick="window.location.href='case-study.html?id=mri_${c.id.replace('company_', '')}_v1'">
          <div style="font-weight: 500; font-size: 0.85rem; color: var(--text-primary);">${c.name}</div>
          <div class="monospace text-xs" style="color: var(--text-muted); font-size: 0.65rem;">${c.industry} • ${c.shopifyTier} • Read Brief &rarr;</div>
        </div>
      `).join('');
    }

    // Match papers sharing taxonomy tags
    const relatedPapers = allResearch.filter(r => r.tags.some(tag => p.taxonomy.includes(tag)));
    let papersHtml = '<p class="text-xs" style="color: var(--text-muted); font-family: \'JetBrains Mono\', monospace;">No theoretical papers reference this paradox tag.</p>';
    if (relatedPapers.length > 0) {
      papersHtml = relatedPapers.map(paper => `
        <div style="padding: var(--space-xs); border: 1px solid var(--border-color); border-radius: var(--border-radius); background-color: var(--bg-primary); margin-bottom: var(--space-xs); cursor: pointer;" onclick="window.location.href='research.html?id=${paper.id}'">
          <div style="font-weight: 500; font-size: 0.85rem; color: var(--text-primary);">${paper.title}</div>
          <div class="monospace text-xs" style="color: var(--text-muted); font-size: 0.65rem;">${paper.author} • Read Publication &rarr;</div>
        </div>
      `).join('');
    }

    // Suggest related paradoxes
    const relatedParadoxes = paradoxes.filter(item => item.id !== p.id && item.taxonomy.some(t => p.taxonomy.includes(t)));
    let relatedHtml = '<p class="text-xs" style="color: var(--text-muted); font-family: \'JetBrains Mono\', monospace;">No related paradoxes match these taxonomy tags.</p>';
    if (relatedParadoxes.length > 0) {
      relatedHtml = relatedParadoxes.map(rp => `
        <div style="padding: var(--space-xs); border: 1px solid var(--border-color); border-radius: var(--border-radius); background-color: var(--bg-primary); margin-bottom: var(--space-xs); cursor: pointer;" onclick="window.location.href='?id=${rp.id}'">
          <div style="font-weight: 500; font-size: 0.85rem; color: var(--text-primary);">${rp.name}</div>
          <div class="monospace text-xs" style="color: var(--text-muted); font-size: 0.65rem;">Taxonomy: ${rp.taxonomy.join(', ')}</div>
        </div>
      `).join('');
    }

    // Generate dynamic feedback loops SVG diagrams based on paradox
    let svgDiagramHtml = '';
    if (p.id === 'paradox_routine_friction') {
      svgDiagramHtml = `
        <svg viewBox="0 0 400 120" style="width: 100%; height: auto; display: block; margin: var(--space-xs) 0;">
          <rect x="10" y="35" width="80" height="50" rx="4" fill="var(--bg-secondary)" stroke="var(--border-color)" />
          <text x="50" y="60" font-size="9" text-anchor="middle" font-family="JetBrains Mono" fill="var(--text-primary)">Setup Delay</text>
          
          <path d="M 90 60 L 110 60" stroke="var(--primary)" stroke-width="1.5" marker-end="url(#arrow)" />
          
          <rect x="110" y="35" width="80" height="50" rx="4" fill="var(--bg-secondary)" stroke="var(--border-color)" />
          <text x="150" y="60" font-size="9" text-anchor="middle" font-family="JetBrains Mono" fill="var(--text-primary)">Low Velocity</text>
          
          <path d="M 190 60 L 210 60" stroke="var(--primary)" stroke-width="1.5" marker-end="url(#arrow)" />
          
          <rect x="210" y="35" width="80" height="50" rx="4" fill="var(--bg-secondary)" stroke="var(--border-color)" />
          <text x="250" y="60" font-size="9" text-anchor="middle" font-family="JetBrains Mono" fill="var(--text-primary)">Backlog Build</text>
          
          <path d="M 290 60 L 310 60" stroke="var(--primary)" stroke-width="1.5" marker-end="url(#arrow)" />
          
          <rect x="310" y="35" width="80" height="50" rx="4" fill="var(--bg-secondary)" stroke="var(--border-color)" />
          <text x="350" y="60" font-size="9" text-anchor="middle" font-family="JetBrains Mono" fill="var(--text-primary)">Cancellation</text>
          
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 2 L 10 5 L 0 8 z" fill="var(--primary)" />
            </marker>
          </defs>
        </svg>
      `;
    } else if (p.id === 'paradox_margin_subsidy') {
      svgDiagramHtml = `
        <svg viewBox="0 0 400 120" style="width: 100%; height: auto; display: block; margin: var(--space-xs) 0;">
          <rect x="10" y="35" width="80" height="50" rx="4" fill="var(--bg-secondary)" stroke="var(--border-color)" />
          <text x="50" y="60" font-size="9" text-anchor="middle" font-family="JetBrains Mono" fill="var(--text-primary)">CAC Surges</text>
          
          <path d="M 90 60 L 110 60" stroke="var(--primary)" stroke-width="1.5" marker-end="url(#arrow)" />
          
          <rect x="110" y="35" width="80" height="50" rx="4" fill="var(--bg-secondary)" stroke="var(--border-color)" />
          <text x="150" y="60" font-size="9" text-anchor="middle" font-family="JetBrains Mono" fill="var(--text-primary)">Ad Inflation</text>
          
          <path d="M 190 60 L 210 60" stroke="var(--primary)" stroke-width="1.5" marker-end="url(#arrow)" />
          
          <rect x="210" y="35" width="80" height="50" rx="4" fill="var(--bg-secondary)" stroke="var(--border-color)" />
          <text x="250" y="60" font-size="9" text-anchor="middle" font-family="JetBrains Mono" fill="var(--text-primary)">Margin Leaks</text>
          
          <path d="M 290 60 L 310 60" stroke="var(--primary)" stroke-width="1.5" marker-end="url(#arrow)" />
          
          <rect x="310" y="35" width="80" height="50" rx="4" fill="var(--bg-secondary)" stroke="var(--border-color)" />
          <text x="350" y="60" font-size="9" text-anchor="middle" font-family="JetBrains Mono" fill="var(--text-primary)">Cohort Decay</text>
          
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 2 L 10 5 L 0 8 z" fill="var(--primary)" />
            </marker>
          </defs>
        </svg>
      `;
    } else {
      svgDiagramHtml = `
        <svg viewBox="0 0 400 120" style="width: 100%; height: auto; display: block; margin: var(--space-xs) 0;">
          <rect x="30" y="35" width="100" height="50" rx="4" fill="var(--bg-secondary)" stroke="var(--border-color)" />
          <text x="80" y="60" font-size="9" text-anchor="middle" font-family="JetBrains Mono" fill="var(--text-primary)">Subsystem Governor</text>
          
          <path d="M 130 60 L 270 60" stroke="var(--primary)" stroke-width="1.5" stroke-dasharray="4" marker-end="url(#arrow)" />
          
          <rect x="270" y="35" width="100" height="50" rx="4" fill="var(--bg-secondary)" stroke="var(--border-color)" />
          <text x="320" y="60" font-size="9" text-anchor="middle" font-family="JetBrains Mono" fill="var(--text-primary)">System Limit</text>
          
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 2 L 10 5 L 0 8 z" fill="var(--primary)" />
            </marker>
          </defs>
        </svg>
      `;
    }

    const taxes = p.taxonomy.map(t => `<span class="badge text-xs" style="margin-right: 4px;">${t}</span>`).join('');

    drawerBody.innerHTML = `
      <h2 style="border-bottom: none; color: var(--primary); margin-top: 0; margin-bottom: var(--space-xs); font-size: 1.75rem; font-family: 'Source Serif 4', serif;">${p.name}</h2>
      <div style="margin-bottom: var(--space-md);">${taxes}</div>
      
      <!-- Definition -->
      <div style="margin-bottom: var(--space-md);">
        <h4 class="monospace text-xs text-muted-color" style="margin-bottom: 2px;">STRUCTURAL DEFINITION</h4>
        <p class="text-sm" style="line-height: 1.5; color: var(--text-primary);">${p.description}</p>
      </div>

      <!-- Diagram -->
      <div style="margin-bottom: var(--space-md);">
        <h4 class="monospace text-xs text-muted-color" style="margin-bottom: 2px;">GOVERNING LOOP DIAGRAM</h4>
        <div style="background-color: var(--bg-secondary); border: 1px solid var(--border-color); padding: var(--space-xs); border-radius: var(--border-radius);">
          ${svgDiagramHtml}
        </div>
      </div>

      <!-- Evidence -->
      <div style="margin-bottom: var(--space-md);">
        <h4 class="monospace text-xs text-muted-color" style="margin-bottom: 2px;">EMPIRICAL EVIDENCE</h4>
        <p class="text-xs" style="background-color: var(--bg-secondary); padding: var(--space-sm); border-radius: var(--border-radius); line-height: 1.5; color: var(--text-secondary); border-left: 3px solid var(--primary);">
          ${p.example}
        </p>
      </div>

      <!-- Validation -->
      <div style="margin-bottom: var(--space-md);">
        <h4 class="monospace text-xs text-muted-color" style="margin-bottom: 2px;">VALIDATION PROTOCOL</h4>
        <p class="text-sm" style="line-height: 1.5; color: var(--text-secondary);">${p.validation}</p>
      </div>

      <!-- Seen In -->
      <div style="margin-bottom: var(--space-md);">
        <h4 class="monospace text-xs text-muted-color" style="margin-bottom: var(--space-xs);">SEEN IN EMPIRICAL COHORTS</h4>
        ${seenHtml}
      </div>

      <!-- Research References -->
      <div style="margin-bottom: var(--space-md);">
        <h4 class="monospace text-xs text-muted-color" style="margin-bottom: var(--space-xs);">RESEARCH & ACADEMIC REFS</h4>
        ${papersHtml}
      </div>

      <!-- Related Paradoxes -->
      <div style="margin-top: var(--space-lg); border-top: 1px solid var(--border-color); padding-top: var(--space-md);">
        <h4 class="monospace text-xs text-muted-color" style="margin-bottom: var(--space-xs);">RELATED PARADOX OBJECTS</h4>
        ${relatedHtml}
      </div>
    `;

    drawer.classList.add('open');
  }
});
