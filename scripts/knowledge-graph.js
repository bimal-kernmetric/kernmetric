import { ROUTES } from '../components/components.js';
import { getCompanies } from './api/companies.js';
import { getParadoxes, getRelationships } from './api/paradoxes.js';
import { getResearch } from './api/research.js';
import { getMRIs } from './api/mri.js';

// Domain Classes
import { Company } from './domain/company.js';
import { Paradox } from './domain/paradox.js';
import { MRI } from './domain/mri.js';

document.addEventListener('DOMContentLoaded', async () => {
  const companies = await getCompanies();
  const paradoxes = await getParadoxes();
  const researchList = await getResearch();
  const mris = await getMRIs();
  const relationships = await getRelationships();

  const mobileKgList = document.getElementById('mobile-kg-list');
  if (window.innerWidth < 1025 && mobileKgList) {
    mobileKgList.innerHTML = '';
    paradoxes.forEach(paradox => {
      const relatedRels = relationships.filter(rel => rel.target === paradox.id && rel.relationship === 'diagnosed_with');
      const relatedCompIds = relatedRels.map(rel => rel.source);
      const relatedComps = companies.filter(c => relatedCompIds.includes(c.id));
      const relatedPapers = researchList.filter(r => r.tags.some(tag => paradox.taxonomy.includes(tag)));
      
      let compsHtml = relatedComps.map(company => {
        const mriId = `mri_${company.id.replace('company_', '')}_v1`;
        const mri = mris.find(m => m.id === mriId) || {};
        return `
          <div style="background-color: var(--bg-secondary); padding: var(--space-sm); border-radius: var(--border-radius); margin-bottom: var(--space-xs); border: 1px solid var(--border-color); text-align: left;">
            <div class="flex justify-between items-center" style="margin-bottom: 4px;">
              <strong style="color: var(--text-primary); font-size: 0.9rem;">${company.name}</strong>
              <span class="badge badge-blue" style="font-size: 0.6rem;">${company.industry}</span>
            </div>
            <p class="text-xs" style="margin: 4px 0 6px 0; color: var(--text-secondary); line-height: 1.4;">
              ${mri.summary || 'Growth diagnostic audit completed.'}
            </p>
            <div class="flex justify-between items-center" style="border-top: 1px dashed var(--border-color); padding-top: 4px; font-size: 0.75rem; font-family: 'JetBrains Mono', monospace; color: var(--text-muted);">
              <span>Impact: ${mri.estimatedImpact || 'N/A'}</span>
              <a href="${ROUTES.caseStudy}?id=${mriId}" style="color: var(--primary); font-weight: 600;">Read MRI &rarr;</a>
            </div>
          </div>
        `;
      }).join('');
      
      if (!compsHtml) {
        compsHtml = `<p class="text-xs text-muted-color" style="font-family: 'JetBrains Mono', monospace; margin: var(--space-xxs) 0;">No studied brands diagnosed yet.</p>`;
      }

      let papersHtml = relatedPapers.map(paper => `
        <div class="flex justify-between items-center" style="padding: 4px 0; border-bottom: 1px solid var(--border-color); font-size: 0.8rem; text-align: left;">
          <span style="color: var(--text-secondary);">${paper.title.substring(0, 32)}...</span>
          <a href="${ROUTES.research}?id=${paper.id}" style="font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; color: var(--primary); font-weight: 500;">Read Paper &rarr;</a>
        </div>
      `).join('');
      
      if (!papersHtml) {
        papersHtml = `<p class="text-xs text-muted-color" style="font-family: 'JetBrains Mono', monospace; margin: var(--space-xxs) 0;">No theoretical papers reference this paradox tag.</p>`;
      }

      const accEl = document.createElement('div');
      accEl.className = 'km-accordion';
      accEl.style.backgroundColor = 'var(--bg-primary)';
      accEl.style.border = '1px solid var(--border-color)';
      accEl.style.borderRadius = 'var(--border-radius)';
      accEl.style.width = '100%';
      
      accEl.innerHTML = `
        <button class="km-accordion-header" style="padding: var(--space-sm) var(--space-md); font-family: 'Source Serif 4', serif; font-size: 1.15rem; color: var(--text-primary);">
          ${paradox.name}
        </button>
        <div class="km-accordion-content" style="padding: 0 var(--space-md);">
          <div style="padding-top: var(--space-xs); padding-bottom: var(--space-md); display: flex; flex-direction: column; gap: var(--space-sm);">
            <div>
              <h5 class="monospace text-xs text-primary-color" style="margin: 0 0 4px 0; font-size: 0.65rem; text-transform: uppercase;">What is this?</h5>
              <p style="margin: 0; font-size: 0.825rem; line-height: 1.45; color: var(--text-secondary);">${paradox.description}</p>
            </div>
            
            <div>
              <h5 class="monospace text-xs text-primary-color" style="margin: 0 0 6px 0; font-size: 0.65rem; text-transform: uppercase;">Diagnosed Brands</h5>
              ${compsHtml}
            </div>

            <div>
              <h5 class="monospace text-xs text-primary-color" style="margin: 0 0 4px 0; font-size: 0.65rem; text-transform: uppercase;">Related Research</h5>
              <div style="display: flex; flex-direction: column; gap: 2px;">
                ${papersHtml}
              </div>
            </div>
          </div>
        </div>
      `;
      
      const header = accEl.querySelector('.km-accordion-header');
      const content = accEl.querySelector('.km-accordion-content');
      header.addEventListener('click', () => {
        const isOpen = accEl.classList.contains('open');
        mobileKgList.querySelectorAll('.km-accordion').forEach(a => {
          a.classList.remove('open');
          const c = a.querySelector('.km-accordion-content');
          if (c) c.style.maxHeight = '0';
        });
        if (!isOpen) {
          accEl.classList.add('open');
          content.style.maxHeight = '1500px';
        }
      });
      
      mobileKgList.appendChild(accEl);
    });
    return;
  }

  const selectorList = document.getElementById('selector-list');
  const viewPanel = document.getElementById('explorer-view-panel');

  if (!selectorList || !viewPanel) return;

  // 1. Render Selector Sidebar List
  selectorList.innerHTML = '';
  
  // Header for Companies
  const compHeader = document.createElement('div');
  compHeader.style.fontWeight = '600';
  compHeader.style.color = 'var(--text-primary)';
  compHeader.style.marginBottom = '6px';
  compHeader.innerText = 'COMPANIES';
  selectorList.appendChild(compHeader);

  companies.forEach(c => {
    const el = document.createElement('div');
    el.style.padding = '4px 8px';
    el.style.cursor = 'pointer';
    el.style.borderRadius = '2px';
    el.className = 'selector-item';
    el.dataset.id = c.id;
    el.innerText = `• ${c.name}`;
    el.addEventListener('click', () => navigateTo(c.id));
    selectorList.appendChild(el);
  });

  // Header for Paradoxes
  const paraHeader = document.createElement('div');
  paraHeader.style.fontWeight = '600';
  paraHeader.style.color = 'var(--text-primary)';
  paraHeader.style.margin = '14px 0 6px 0';
  paraHeader.innerText = 'PARADOXES';
  selectorList.appendChild(paraHeader);

  paradoxes.forEach(p => {
    const el = document.createElement('div');
    el.style.padding = '4px 8px';
    el.style.cursor = 'pointer';
    el.style.borderRadius = '2px';
    el.className = 'selector-item';
    el.dataset.id = p.id;
    el.innerText = `• ${p.name}`;
    el.addEventListener('click', () => navigateTo(p.id));
    selectorList.appendChild(el);
  });

  // 2. Setup SPA Router Navigation
  window.addEventListener('popstate', handleRouter);
  handleRouter();

  function navigateTo(id) {
    const newUrl = `${window.location.pathname}?id=${id}`;
    window.history.pushState({ id }, '', newUrl);
    renderActiveEntity(id);
  }

  function handleRouter() {
    const params = new URLSearchParams(window.location.search);
    const activeId = params.get('id') || 'company_beam';
    renderActiveEntity(activeId);
  }

  // 3. Main Render Logic
  async function renderActiveEntity(id) {
    // Highlight active element in sidebar
    selectorList.querySelectorAll('.selector-item').forEach(el => {
      if (el.dataset.id === id) {
        el.style.backgroundColor = 'rgba(37, 99, 235, 0.1)';
        el.style.color = 'var(--primary)';
        el.style.fontWeight = '500';
      } else {
        el.style.backgroundColor = 'transparent';
        el.style.color = 'var(--text-secondary)';
        el.style.fontWeight = 'normal';
      }
    });

    viewPanel.innerHTML = '';

    // Check entity type
    if (id.startsWith('company_')) {
      const raw = companies.find(c => c.id === id);
      if (!raw) return renderError(id);
      const company = new Company(raw);
      renderCompanyNode(company);
    } else if (id.startsWith('paradox_')) {
      const raw = paradoxes.find(p => p.id === id);
      if (!raw) return renderError(id);
      const paradox = new Paradox(raw);
      renderParadoxNode(paradox);
    } else if (id.startsWith('research_')) {
      const raw = researchList.find(r => r.id === id);
      if (!raw) return renderError(id);
      renderResearchNode(raw);
    } else {
      renderError(id);
    }
  }

  function renderError(id) {
    viewPanel.innerHTML = `<p style="color: var(--primary);">Entity "${id}" not found in graph.</p>`;
  }

  // --- RENDERING DETAIL BLOCKS ---

  async function renderCompanyNode(company) {
    const mri = await company.getMRI();
    const diagnosed = await company.getDiagnosedParadoxes();
    
    // Meta fields
    const tagsHtml = company.tags.map(t => `<span class="badge text-xs" style="margin-right: 4px;">${t}</span>`).join('');
    
    // Connected nodes html cards
    let connectionsHtml = '';
    
    if (mri) {
      connectionsHtml += `
        <div style="margin-bottom: var(--space-md);">
          <h4 class="monospace text-xs text-muted-color" style="margin-bottom: var(--space-xs);">DIAGNOSTIC DATA</h4>
          <div class="card card-elevated" style="cursor: pointer;" id="lnk-mri">
            <div class="flex justify-between items-center">
              <span style="font-weight: 500;">Growth MRI Dossier</span>
              <span class="badge badge-blue">${mri.validationState}</span>
            </div>
            <p class="text-xs" style="margin: 4px 0 0 0; color: var(--text-secondary);">${mri.primaryConstraint}</p>
          </div>
        </div>
      `;
    }

    if (diagnosed.length > 0) {
      const pCards = diagnosed.map(p => `
        <div class="card card-elevated" style="cursor: pointer; border-color: var(--primary);" onclick="document.dispatchEvent(new CustomEvent('nav-graph', {detail: '${p.id}'}))">
          <div style="font-family: 'Source Serif 4', serif; font-weight: 500; font-size: 1.05rem; color: var(--primary);">${p.name}</div>
          <p class="text-xs" style="margin: 4px 0 0 0; color: var(--text-secondary); line-height: 1.4;">${p.description.substring(0, 100)}...</p>
        </div>
      `).join('');

      connectionsHtml += `
        <div>
          <h4 class="monospace text-xs text-muted-color" style="margin-bottom: var(--space-xs);">DIAGNOSED PARADOXES</h4>
          <div class="grid grid-cols-2 gap-sm" style="grid-template-columns: 1fr 1fr;">${pCards}</div>
        </div>
      `;
    }

    viewPanel.innerHTML = `
      <div style="border-bottom: 1px solid var(--border-color); padding-bottom: var(--space-sm); margin-bottom: var(--space-md);">
        <span class="badge badge-blue">STUDIED COMPANY</span>
        <h2 style="border-bottom: none; margin: 4px 0;">${company.name}</h2>
        <div class="monospace text-xs" style="color: var(--text-muted); margin-bottom: var(--space-xs);">${company.domain} • ${company.shopifyTier} • ${company.estimatedRevenue}</div>
        <div class="flex" style="margin-top: 8px;">${tagsHtml}</div>
      </div>
      
      <p style="margin-bottom: var(--space-lg);">
        This brand's subscription cohorts, unit pricing dynamics, and multi-channel attribution configurations have been audited and indexed within the KernMetric growth intelligence OS.
      </p>

      ${connectionsHtml}
    `;

    // Bind dynamic redirects
    const mriLnk = viewPanel.querySelector('#lnk-mri');
    if (mriLnk) {
      mriLnk.addEventListener('click', () => {
        window.location.href = `${ROUTES.caseStudy}?id=${mri.id}`;
      });
    }
  }

  async function renderParadoxNode(paradox) {
    const companiesDiagnosed = await paradox.getConnectedCompanies();
    const supportingResearch = await paradox.getConnectedResearch();

    const taxesHtml = paradox.taxonomy.map(t => `<span class="badge text-xs" style="margin-right: 4px;">${t}</span>`).join('');

    let connectionsHtml = '';

    if (companiesDiagnosed.length > 0) {
      const cCards = companiesDiagnosed.map(c => `
        <div class="card card-elevated" style="cursor: pointer;" onclick="document.dispatchEvent(new CustomEvent('nav-graph', {detail: '${c.id}'}))">
          <div style="font-weight: 500; font-size: 1rem; color: var(--text-primary);">${c.name}</div>
          <div class="monospace text-xs" style="color: var(--text-muted);">${c.industry}</div>
        </div>
      `).join('');

      connectionsHtml += `
        <div style="margin-bottom: var(--space-md);">
          <h4 class="monospace text-xs text-muted-color" style="margin-bottom: var(--space-xs);">SEEN IN COMPANIES</h4>
          <div class="grid grid-cols-2 gap-sm" style="grid-template-columns: 1fr 1fr;">${cCards}</div>
        </div>
      `;
    }

    if (supportingResearch.length > 0) {
      const rCards = supportingResearch.map(r => `
        <div class="card card-elevated" style="cursor: pointer;" onclick="document.dispatchEvent(new CustomEvent('nav-graph', {detail: '${r.id}'}))">
          <span class="badge" style="font-size: 0.6rem;">${r.type}</span>
          <div style="font-family: 'Source Serif 4', serif; font-size: 0.95rem; margin-top: 4px; font-weight: 500;">${r.title}</div>
        </div>
      `).join('');

      connectionsHtml += `
        <div>
          <h4 class="monospace text-xs text-muted-color" style="margin-bottom: var(--space-xs);">SUPPORTING RESEARCH</h4>
          <div class="grid grid-cols-2 gap-sm" style="grid-template-columns: 1fr 1fr;">${rCards}</div>
        </div>
      `;
    }

    viewPanel.innerHTML = `
      <div style="border-bottom: 1px solid var(--border-color); padding-bottom: var(--space-sm); margin-bottom: var(--space-md);">
        <span class="badge badge-blue" style="border-color: var(--primary); color: var(--primary);">STRUCTURAL CONSTRAINT</span>
        <h2 style="border-bottom: none; margin: 4px 0; color: var(--primary);">${paradox.name}</h2>
        <div class="flex" style="margin-top: 8px;">${taxesHtml}</div>
      </div>
      
      <div style="margin-bottom: var(--space-md);">
        <h4 class="monospace text-xs text-muted-color" style="margin-bottom: 2px;">STRUCTURAL DEFINITION</h4>
        <p class="text-sm">${paradox.description}</p>
      </div>

      <div style="margin-bottom: var(--space-md);">
        <h4 class="monospace text-xs text-muted-color" style="margin-bottom: 2px;">ILLUSTRATIVE EXAMPLE</h4>
        <p class="text-xs" style="background-color: var(--bg-secondary); padding: var(--space-xs); border-radius: var(--border-radius); line-height:1.5;">${paradox.example}</p>
      </div>

      <div style="margin-bottom: var(--space-lg);">
        <h4 class="monospace text-xs text-muted-color" style="margin-bottom: 2px;">VALIDATION PROTOCOL</h4>
        <p class="text-sm">${paradox.validation}</p>
      </div>

      ${connectionsHtml}
    `;
  }

  async function renderResearchNode(paper) {
    // Find paradoxes associated with research by querying the relationships map in reverse
    const relatedRelations = relationships.filter(r => r.target === paper.id && r.relationship === 'supported_by');
    const paradoxIds = relatedRelations.map(r => r.source);
    const relatedParadoxes = paradoxes.filter(p => paradoxIds.includes(p.id));

    const tagsHtml = paper.tags.map(t => `<span class="badge text-xs" style="margin-right: 4px;">${t}</span>`).join('');

    let connectionsHtml = '';
    if (relatedParadoxes.length > 0) {
      const pCards = relatedParadoxes.map(p => `
        <div class="card card-elevated" style="cursor: pointer; border-color: var(--primary);" onclick="document.dispatchEvent(new CustomEvent('nav-graph', {detail: '${p.id}'}))">
          <div style="font-family: 'Source Serif 4', serif; font-weight: 500; font-size: 1.05rem; color: var(--primary);">${p.name}</div>
          <p class="text-xs" style="margin: 4px 0 0 0; color: var(--text-secondary);">${p.description.substring(0, 80)}...</p>
        </div>
      `).join('');

      connectionsHtml = `
        <div style="margin-top: var(--space-lg);">
          <h4 class="monospace text-xs text-muted-color" style="margin-bottom: var(--space-xs);">APPLIES TO CONSTRAINTS</h4>
          <div class="grid grid-cols-2 gap-sm" style="grid-template-columns: 1fr 1fr;">${pCards}</div>
        </div>
      `;
    }

    viewPanel.innerHTML = `
      <div style="border-bottom: 1px solid var(--border-color); padding-bottom: var(--space-sm); margin-bottom: var(--space-md);">
        <span class="badge">${paper.type}</span>
        <h2 style="border-bottom: none; margin: 4px 0;">${paper.title}</h2>
        <div class="monospace text-xs" style="color: var(--text-muted);">Published ${paper.date} • by ${paper.author}</div>
        <div class="flex" style="margin-top: 8px;">${tagsHtml}</div>
      </div>
      
      <p class="lead" style="font-size: 1rem; line-height: 1.5; margin-bottom: var(--space-md);">
        <strong>Summary: </strong>${paper.summary}
      </p>

      <div style="background-color: var(--bg-secondary); padding: var(--space-md); border-radius: var(--border-radius); font-size: 0.9rem; line-height: 1.6; color: var(--text-secondary);">
        ${paper.content}
      </div>

      <div class="text-center" style="margin-top: var(--space-md);">
        <a href="${ROUTES.research}?id=${paper.id}" class="btn btn-secondary btn-sm">Read in Research Publication View</a>
      </div>

      ${connectionsHtml}
    `;
  }

  // Handle graph redirect messages inside dynamically injected onclick code
  document.addEventListener('nav-graph', (e) => {
    navigateTo(e.detail);
  });
});
