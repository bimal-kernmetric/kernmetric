import { ROUTES } from '../components/components.js';
import { getResearch, getResearchById } from './api/research.js';
import { getCompanies } from './api/companies.js';
import { getMRIs } from './api/mri.js';

document.addEventListener('DOMContentLoaded', async () => {
  const panel = document.getElementById('research-main-panel');
  const headerBlock = document.getElementById('research-header-block');

  if (!panel) return;

  const params = new URLSearchParams(window.location.search);
  const paperId = params.get('id');

  if (paperId) {
    // 1. Article Detail View Mode
    const paper = await getResearchById(paperId);
    if (!paper) {
      panel.innerHTML = `<p style="color: var(--primary);">Research publication "${paperId}" not found.</p>`;
      return;
    }

    const companies = await getCompanies();
    const mris = await getMRIs();
    const matchedComps = companies.filter(c => c.tags.some(tag => paper.tags.includes(tag)));

    // Hide main index header to focus on text layout
    if (headerBlock) headerBlock.style.display = 'none';
    document.title = `${paper.title} — KernMetric Research`;

    const tagsHtml = paper.tags.map(t => `<span class="badge text-xs" style="margin-right: 4px;">${t}</span>`).join('');

    panel.innerHTML = `
      <!-- Breadcrumbs at the top of detail -->
      <kern-breadcrumbs></kern-breadcrumbs>

      <div style="margin-bottom: var(--space-md);">
        <a href=ROUTES.research style="font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: var(--text-muted); display: inline-flex; align-items: center; gap: 4px;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to Research Feed
        </a>
      </div>

      <article class="reading-mode" style="max-width: 700px; margin: 0 auto; padding-top: var(--space-md); padding-bottom: var(--space-xl);">
        <div style="border-bottom: 1px solid var(--border-color); padding-bottom: var(--space-sm); margin-bottom: var(--space-lg);">
          <span class="badge badge-blue">${paper.type}</span>
          <h1 style="font-size: 2.5rem; font-weight: 600; line-height: 1.2; margin-top: 6px; margin-bottom: var(--space-xs);">${paper.title}</h1>
          <div class="monospace text-xs" style="color: var(--text-muted); margin-bottom: var(--space-sm);">
            Published ${paper.date} • by ${paper.author}
          </div>
          <div class="flex" style="flex-wrap: wrap;">${tagsHtml}</div>
        </div>

        <p class="lead" style="font-size: 1.15rem; line-height: 1.6; font-weight: 500; margin-bottom: var(--space-md);">
          ${paper.summary}
        </p>

        <div style="font-size: 1.05rem; line-height: 1.8; color: var(--text-secondary);">
          ${paper.content.split('\n\n').map(pText => `<p style="margin-bottom: var(--space-md);">${pText}</p>`).join('')}
        </div>
      </article>

      <!-- Dynamic Recommendations at the bottom -->
      <div style="border-top: 1px solid var(--border-color); padding-top: var(--space-xl); margin-top: var(--space-xl); max-width: 700px; margin-inline: auto; padding-bottom: var(--space-lg);">
        <span class="monospace text-xs text-primary-color" style="font-weight: 600; text-transform: uppercase;">Diagnosed Case Audits</span>
        <h3 style="margin-top: 4px; font-family: 'Source Serif 4', serif; font-size: 1.35rem; margin-bottom: var(--space-md);">Explore Empirical Case Studies</h3>
        
        <div style="display: flex; flex-direction: column; gap: var(--space-sm);">
          ${matchedComps.slice(0, 3).map(comp => {
            const mri = mris.find(m => m.companyId === comp.id);
            if (!mri) return '';
            return `
              <div class="km-company-card" style="cursor: pointer; min-height: auto; flex-direction: row; align-items: center; justify-content: space-between; padding: var(--space-sm) var(--space-md);" onclick="window.location.href='${ROUTES.caseStudy}?id=${mri.id}'">
                <div>
                  <h4 style="margin: 0; font-family: 'Source Serif 4', serif; font-size: 1.15rem;">${comp.name}</h4>
                  <div class="monospace text-xs text-muted-color" style="margin-top: 2px; font-size: 0.65rem;">Primary Constraint: ${mri.primaryConstraint}</div>
                </div>
                <div style="color: var(--primary); font-weight: 600; font-size: 0.8rem; white-space: nowrap;">Read MRI &rarr;</div>
              </div>
            `;
          }).join('') || '<div class="card text-center monospace text-xs text-muted-color" style="padding: var(--space-md);">No direct brand case profiles match these tags.</div>'}
        </div>
        
        <div style="margin-top: var(--space-md); text-align: center;">
          <a href="${ROUTES.atlas}" class="btn btn-secondary w-full" style="min-height: 48px; display: inline-flex; align-items: center; justify-content: center;">Traverse Constraint Atlas&trade;</a>
        </div>
      </div>
    `;
  } else {
    // 2. Hub List View Mode
    if (headerBlock) headerBlock.style.display = 'block';
    document.title = 'Research & Publications — KernMetric';

    const research = await getResearch();
    panel.innerHTML = '';

    // Group items by type
    const types = ["Framework", "Whitepaper", "Report", "Article", "Note"];
    
    types.forEach(type => {
      const typeItems = research.filter(r => r.type === type);
      if (typeItems.length === 0) return;

      const typeSection = document.createElement('div');
      typeSection.style.marginBottom = 'var(--space-xl)';
      
      const typeTitle = document.createElement('h3');
      typeTitle.className = 'monospace text-xs text-muted-color';
      typeTitle.style.textTransform = 'uppercase';
      typeTitle.style.borderBottom = '1px solid var(--border-color)';
      typeTitle.style.paddingBottom = 'var(--space-xxs)';
      typeTitle.style.marginBottom = 'var(--space-md)';
      typeTitle.innerText = `${type}s`;
      
      typeSection.appendChild(typeTitle);

      const itemsList = document.createElement('div');
      itemsList.style.display = 'flex';
      itemsList.style.flexDirection = 'column';
      itemsList.style.gap = 'var(--space-md)';

      typeItems.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.style.paddingBottom = 'var(--space-sm)';
        itemEl.style.borderBottom = '1px dashed var(--border-color)';
        
        const tagsHtml = item.tags.map(t => `<span class="badge text-xs" style="margin-right: 4px; font-size: 0.65rem;">${t}</span>`).join('');
        
        itemEl.innerHTML = `
          <div class="monospace text-xs text-muted-color" style="font-size: 0.7rem; margin-bottom: 2px;">${item.date} • by ${item.author}</div>
          <h4 style="margin: 0 0 var(--space-xxs) 0; font-size: 1.25rem; font-weight: 500;">
            <a href="?id=${item.id}" style="color: var(--text-primary);">${item.title}</a>
          </h4>
          <p class="text-sm" style="margin-bottom: var(--space-xs); line-height: 1.4;">${item.summary}</p>
          <div class="flex">${tagsHtml}</div>
        `;
        
        itemsList.appendChild(itemEl);
      });
      
      typeSection.appendChild(itemsList);
      panel.appendChild(typeSection);
    });
  }
});
