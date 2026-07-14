import { ROUTES } from '../components/components.js';
import { getMRIById, getMRIs } from './api/mri.js';
import { getCompanyById, getCompanies } from './api/companies.js';
import { getParadoxes } from './api/paradoxes.js';
import { getResearch } from './api/research.js';

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('report-view-container');
  if (!container) return;

  // 1. Resolve ID from Query Parameter
  const params = new URLSearchParams(window.location.search);
  const rawId = params.get('id');
  console.log("MRI ID parameter extracted:", rawId);

  if (!rawId) {
    displayError(container, "Missing ID: No MRI identifier parameter provided in URL (?id=...)");
    return;
  }

  try {
    console.log("Loading MRI...");
    let mri = await getMRIById(rawId);
    
    // Normalize and retry if not found immediately (e.g. 'beam' -> 'mri_beam_v1')
    if (!mri) {
      let normalizedId = rawId;
      if (!normalizedId.startsWith('mri_')) {
        normalizedId = `mri_${normalizedId}`;
      }
      if (!normalizedId.endsWith('_v1')) {
        normalizedId = `${normalizedId}_v1`;
      }
      console.log(`MRI raw ID "${rawId}" not found. Retrying with normalized ID: "${normalizedId}"`);
      mri = await getMRIById(normalizedId);
    }

    if (!mri) {
      displayError(container, `Invalid ID: The diagnostic report identifier "${rawId}" could not be resolved in database.`);
      return;
    }

    console.log("MRI Found");

    // Fetch related database collections
    const company = await getCompanyById(mri.companyId);
    const paradoxes = await getParadoxes();
    const allMRIs = await getMRIs();
    const allCompanies = await getCompanies();
    const allResearch = await getResearch();

    console.log("Database Collections Ingested. Initializing renderMRI...");
    
    // Call rendering function inside try-catch to isolate stack errors
    renderMRI(mri, company, paradoxes, allMRIs, allCompanies, allResearch, container);

  } catch (err) {
    console.error("Rendering exception caught:", err);
    displayError(container, `Rendering exception:\n${err.message}\n\nStack Trace:\n${err.stack}`);
  }
});

function displayError(container, reason) {
  container.innerHTML = `
    <div class="card" style="padding: var(--space-xl); text-align: center; border-top: 3px solid var(--primary); max-width: 500px; margin: var(--space-xl) auto;">
      <span class="monospace text-xs text-primary-color" style="font-weight: 600; text-transform: uppercase;">ERROR</span>
      <h2 style="font-family: 'Source Serif 4', serif; margin: var(--space-xs) 0 4px 0; border-bottom: none; font-size: 1.5rem;">Growth MRI Unavailable</h2>
      <p class="text-xs" style="color: var(--text-muted); margin: 0 0 var(--space-md) 0;">The diagnostic system encountered an execution error.</p>
      
      <div style="background-color: var(--bg-secondary); border: 1px solid var(--border-color); padding: var(--space-md); border-radius: var(--border-radius); text-align: left; margin-bottom: var(--space-md); font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: var(--text-secondary); white-space: pre-wrap; word-break: break-word; line-height: 1.4;"><strong>Reason:</strong>\n• ${reason}</div>
      
      <div class="flex gap-md" style="justify-content: center; width: 100%;">
        <a href="${ROUTES.caseStudies}" class="btn btn-secondary" style="flex: 1; min-height: 48px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.85rem;">&larr; Back to Diagnostics</a>
        <button onclick="window.location.reload();" class="btn btn-primary" style="flex: 1; min-height: 48px; font-size: 0.85rem;">Reload Report</button>
      </div>
    </div>
  `;
}

function renderMRI(mri, company, paradoxes, allMRIs, allCompanies, allResearch, container) {
  const companyName = company ? company.name : 'Unknown Company';
  const paradox = paradoxes.find(p => p.name === mri.primaryConstraint || mri.primaryConstraint.includes(p.name));
  const otherMRIs = allMRIs.filter(m => m.primaryConstraint === mri.primaryConstraint && m.id !== mri.id);
  const otherCompanies = allCompanies.filter(c => otherMRIs.map(m => m.companyId).includes(c.id));
  
  const relatedPapers = allResearch.filter(r => 
    (mri.constraintClass && r.tags.some(tag => mri.constraintClass.includes(tag))) || 
    r.tags.some(tag => mri.primaryConstraint.toLowerCase().includes(tag.toLowerCase()))
  );

  const observationsHtml = (mri.observations || []).map(obs => `
    <li style="margin-bottom: var(--space-xs);">${obs}</li>
  `).join('');

  const constraintsHtml = (mri.constraints || []).map(c => {
    if (typeof c === 'string') {
      return `
        <div style="margin-bottom: var(--space-sm);">
          <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: var(--text-secondary);">${c}</p>
        </div>
      `;
    }
    return `
      <div style="margin-bottom: var(--space-sm);">
        <h4 style="margin: 0; font-family: 'Source Serif 4', serif; font-size: 1.1rem; font-weight: 500;">${c.title || 'Constraint detail'}</h4>
        <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: var(--text-secondary);">${c.description || ''}</p>
      </div>
    `;
  }).join('');

  const experimentsHtml = (mri.experiments || []).map((exp, idx) => `
    <div class="km-experiment-card" style="margin-bottom: var(--space-xs); padding: var(--space-sm); border: 1px solid var(--border-color); border-radius: var(--border-radius); background-color: var(--bg-primary); text-align: left;">
      <div class="km-experiment-card-step" style="font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">EXP_0${idx + 1} // ${exp.status || 'Active'}</div>
      <h4 style="margin: 2px 0 var(--space-xxs) 0; font-family: 'Source Serif 4', serif; font-size: 1.05rem; color: var(--text-primary);">${exp.name}</h4>
      <p class="text-xs" style="color: var(--text-secondary); line-height: 1.45; margin: 0 0 var(--space-xs) 0;">
        <strong>Confidence:</strong> ${exp.confidence || 0}%
      </p>
      <span class="badge badge-blue" style="font-size: 0.65rem;">Result: ${exp.result}</span>
    </div>
  `).join('');

  const relatedRecommendationsHtml = `
    <div style="border-top: 1px solid var(--border-color); padding-top: var(--space-xl); margin-top: var(--space-xl);">
      <span class="monospace text-xs text-primary-color" style="font-weight: 600; text-transform: uppercase;">Related Intelligence Traversals</span>
      <h3 style="margin-top: 4px; font-family: 'Source Serif 4', serif; font-size: 1.5rem; margin-bottom: var(--space-md); text-align: left;">Endless Exploration</h3>
      
      <div class="grid grid-cols-3 gap-md" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
        
        ${paradox ? `
          <div class="km-constraint-card" style="cursor: pointer; padding: var(--space-md); text-align: left;" onclick="window.location.href='${ROUTES.knowledgeGraph}?id=${paradox.id}'">
            <div>
              <div class="monospace text-xs text-muted-color" style="font-size: 0.65rem;">PRIMARY CONSTRAINT</div>
              <h3 style="margin: 4px 0 0 0; font-family: 'Source Serif 4', serif; font-size: 1.25rem;">${paradox.name}</h3>
            </div>
            <p class="text-xs" style="color: var(--text-secondary); margin: var(--space-xs) 0; line-height: 1.4;">
              ${paradox.description.substring(0, 120)}...
            </p>
            <div style="margin-top: auto; color: var(--primary); font-weight: 600; font-size: 0.8rem; border-top: 1px dashed var(--border-color); padding-top: var(--space-xs);">
              Explore Paradox &rarr;
            </div>
          </div>
        ` : ''}

        ${otherCompanies.slice(0, 2).map(comp => {
          const compMRI = otherMRIs.find(m => m.companyId === comp.id);
          if (!compMRI) return '';
          return `
            <div class="km-company-card" style="cursor: pointer; padding: var(--space-md); text-align: left;" onclick="window.location.href='${ROUTES.caseStudy}?id=${compMRI.id}'">
              <div class="km-company-card-header">
                <div>
                  <div class="monospace text-xs text-muted-color" style="font-size: 0.65rem;">DIAGNOSED BRAND</div>
                  <h3 class="km-company-card-title" style="margin: 2px 0; font-size: 1.2rem;">${comp.name}</h3>
                </div>
                <span class="badge badge-blue">Cohort Case</span>
              </div>
              <p class="text-xs" style="color: var(--text-secondary); margin: var(--space-xs) 0; line-height: 1.4;">
                Primary Constraint: <strong>${compMRI.primaryConstraint}</strong>
              </p>
              <div class="flex justify-between items-center" style="border-top: 1px dashed var(--border-color); padding-top: var(--space-xs); font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: var(--text-muted); margin-top: auto;">
                <span>Confidence: ${compMRI.confidence}%</span>
                <span style="color: var(--primary); font-weight: 600;">Read MRI &rarr;</span>
              </div>
            </div>
          `;
        }).join('')}

        ${relatedPapers.slice(0, 2).map(paper => {
          return `
            <div class="km-research-card" style="cursor: pointer; padding: var(--space-md); text-align: left;" onclick="window.location.href='${ROUTES.research}?id=${paper.id}'">
              <div>
                <span class="badge text-xs" style="font-size: 0.65rem; text-transform: uppercase;">${paper.type}</span>
                <h3 style="margin: var(--space-xs) 0 4px 0; font-family: 'Source Serif 4', serif; font-size: 1.25rem;">${paper.title}</h3>
              </div>
              <p class="text-xs" style="color: var(--text-secondary); margin: var(--space-xs) 0; line-height: 1.4;">
                ${paper.summary}
              </p>
              <div class="flex justify-between items-center" style="border-top: 1px dashed var(--border-color); padding-top: var(--space-xs); font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: var(--text-muted); margin-top: auto;">
                <span>${paper.date}</span>
                <span style="color: var(--primary); font-weight: 600;">Read Paper &rarr;</span>
              </div>
            </div>
          `;
        }).join('')}

      </div>
    </div>
  `;

  container.innerHTML = `
    <!-- Desktop: Editorial PDF-style Layout -->
    <div class="pdf-layout text-left" style="text-align: left;">
      <!-- PDF Top Ribbon Header -->
      <div class="flex justify-between items-center" style="border-bottom: 2px solid var(--text-primary); padding-bottom: var(--space-xs); margin-bottom: var(--space-lg);">
        <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: var(--text-primary);">\u2215\u2215 KERNMETRIC SYSTEM AUDIT</span>
        <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">CONFIDENTIAL</span>
      </div>

      <!-- Title and Classification -->
      <div>
        <span class="monospace text-xs text-primary-color" style="font-weight: 600; text-transform: uppercase;">
          Growth MRI\u2122 Report
        </span>
        <h1 style="font-size: 2.25rem; font-weight: 600; line-height: 1.2; margin-top: 4px; margin-bottom: var(--space-sm); font-family: 'Source Serif 4', serif;">
          ${mri.primaryConstraint}
        </h1>
      </div>

      <!-- Document Meta Grid -->
      <div class="pdf-meta-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: var(--space-sm); border-bottom: 1px solid var(--border-color); padding-bottom: var(--space-md); margin-bottom: var(--space-lg);">
        <div>
          <div class="monospace text-xs text-muted-color" style="font-size: 0.65rem;">COMPANY</div>
          <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary);">${companyName}</div>
        </div>
        <div>
          <div class="monospace text-xs text-muted-color" style="font-size: 0.65rem;">INDUSTRY</div>
          <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary);">${company ? company.industry : 'N/A'}</div>
        </div>
        <div>
          <div class="monospace text-xs text-muted-color" style="font-size: 0.65rem;">SHOPIFY TIER</div>
          <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary);">${company ? company.shopifyTier : 'N/A'}</div>
        </div>
        <div>
          <div class="monospace text-xs text-muted-color" style="font-size: 0.65rem;">EST_REVENUE</div>
          <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary);">${company ? company.estimatedRevenue : 'N/A'}</div>
        </div>
      </div>

      <!-- Executive Summary -->
      <div style="margin-bottom: var(--space-lg);">
        <h3 style="margin-top: 0; font-family: 'Source Serif 4', serif; font-size: 1.4rem; border-bottom: none; padding-bottom: 0;">Executive Diagnosis</h3>
        <p class="lead" style="font-size: 1.1rem; line-height: 1.6; color: var(--text-primary);">
          ${mri.summary}
        </p>
      </div>

      <!-- Observations -->
      <div style="margin-bottom: var(--space-lg);">
        <h3 style="font-family: 'Source Serif 4', serif; font-size: 1.4rem; border-bottom: none; padding-bottom: 0;">Observed Symptoms</h3>
        <ul style="padding-left: var(--space-md); color: var(--text-secondary); line-height: 1.6; font-size: 0.95rem; list-style-type: square;">
          ${observationsHtml}
        </ul>
      </div>

      <!-- System Bottleneck Mapping -->
      <div style="margin-bottom: var(--space-lg);">
        <h3 style="font-family: 'Source Serif 4', serif; font-size: 1.4rem; border-bottom: none; padding-bottom: 0;">Identified System Constraints</h3>
        <div style="border-left: 2px solid var(--primary); padding-left: var(--space-md); margin-bottom: var(--space-md);">
          ${constraintsHtml}
        </div>
      </div>

      <!-- Friction Velocity & Latency -->
      <div style="margin-bottom: var(--space-lg);">
        <h3 style="font-family: 'Source Serif 4', serif; font-size: 1.4rem; border-bottom: none; padding-bottom: 0;">Friction Velocity & Latency</h3>
        <p style="font-size: 0.95rem; color: var(--text-secondary); line-height: 1.5;">
          ${mri.velocity}
        </p>
      </div>

      <!-- Validation State and Confidence Details -->
      <div class="grid grid-cols-2 gap-lg" style="grid-template-columns: 1fr 1fr; margin-bottom: var(--space-xl); border-top: 1px solid var(--border-color); padding-top: var(--space-lg);">
        <div>
          <h3 style="margin-top: 0; font-family: 'Source Serif 4', serif; font-size: 1.4rem; border-bottom: none; padding-bottom: 0;">Validation Status</h3>
          <p style="font-size: 0.95rem; margin-bottom: var(--space-sm); color: var(--text-secondary); line-height: 1.5;">${mri.validation}</p>
          <div style="display: flex; gap: var(--space-sm); align-items: center;">
            <div>
              <div class="monospace text-xs text-muted-color" style="font-size: 0.65rem;">CONFIDENCE</div>
              <div style="font-family: 'JetBrains Mono', monospace; font-size: 1.25rem; font-weight: 600; color: var(--primary);">${mri.confidence}%</div>
            </div>
            <div>
              <div class="monospace text-xs text-muted-color" style="font-size: 0.65rem;">STATE</div>
              <span class="badge badge-blue" style="margin-top: 4px;">${mri.validationState}</span>
            </div>
          </div>
        </div>
        <div>
          <h3 style="margin-top: 0; font-family: 'Source Serif 4', serif; font-size: 1.4rem; border-bottom: none; padding-bottom: 0;">Validation Experiments</h3>
          <div style="display: flex; flex-direction: column; gap: var(--space-xs);">
            ${experimentsHtml}
          </div>
        </div>
      </div>

      <!-- PDF Footer -->
      <div class="flex justify-between items-center" style="border-top: 1px solid var(--border-color); padding-top: var(--space-sm); font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; color: var(--text-muted);">
        <span>Doc Ref: KM_MRI_${mri.id.toUpperCase()}</span>
        <span>v${mri.version} \u2022 Published ${mri.lastUpdated}</span>
        <span>Page 1 of 1</span>
      </div>
    </div>

    <!-- Mobile: Adaptive Executive Brief Accordion Interface -->
    <div class="mobile-accordion-layout" style="margin-top: var(--space-lg);">
      <div style="margin-bottom: var(--space-md); border-bottom: 2px solid var(--text-primary); padding-bottom: var(--space-xs); text-align: left;">
        <span class="monospace text-xs text-primary-color" style="font-weight: 600; font-size: 0.65rem;">EXECUTIVE BRIEF // ${companyName.toUpperCase()}</span>
        <h2 style="font-size: 1.5rem; border-bottom: none; margin-top: var(--space-xxs); margin-bottom: var(--space-xxs); font-family: 'Source Serif 4', serif;">${mri.primaryConstraint}</h2>
        <span class="badge badge-blue">${mri.validationState} (${mri.confidence}% Confidence)</span>
      </div>

      <div class="accordion-item open">
        <button class="accordion-trigger">CEO Summary</button>
        <div class="accordion-content" style="max-height: 1000px;">
          <p class="lead" style="font-size: 1.05rem; line-height: 1.6; margin: 0; padding-top: var(--space-xs); text-align: left;">${mri.summary}</p>
        </div>
      </div>

      <div class="accordion-item">
        <button class="accordion-trigger">Observed Symptoms</button>
        <div class="accordion-content">
          <ul style="padding-left: var(--space-md); color: var(--text-secondary); line-height: 1.6; margin: 0; padding-top: var(--space-xs); text-align: left; list-style-type: square;">
            ${observationsHtml}
          </ul>
        </div>
      </div>

      <div class="accordion-item">
        <button class="accordion-trigger">Candidate Constraints</button>
        <div class="accordion-content">
          <div style="border-left: 2px solid var(--primary); padding-left: var(--space-md); padding-top: var(--space-xs); text-align: left;">
            ${constraintsHtml}
          </div>
        </div>
      </div>

      <div class="accordion-item">
        <button class="accordion-trigger">Dependency Chains</button>
        <div class="accordion-content">
          <p style="margin: 0; color: var(--text-secondary); line-height: 1.6; padding-top: var(--space-xs); text-align: left;">${mri.velocity}</p>
        </div>
      </div>

      <div class="accordion-item">
        <button class="accordion-trigger">Evidence</button>
        <div class="accordion-content">
          <p style="margin: 0; color: var(--text-secondary); line-height: 1.6; padding-top: var(--space-xs); text-align: left;">${mri.validation}</p>
        </div>
      </div>

      <div class="accordion-item">
        <button class="accordion-trigger">Validation</button>
        <div class="accordion-content">
          <div style="display: flex; gap: var(--space-sm); align-items: center; padding-top: var(--space-xs); text-align: left;">
            <div>
              <div class="monospace text-xs text-muted-color" style="font-size: 0.65rem;">CONFIDENCE INDEX</div>
              <div style="font-family: 'JetBrains Mono', monospace; font-size: 1.2rem; font-weight: 600; color: var(--primary);">${mri.confidence}%</div>
            </div>
            <div>
              <div class="monospace text-xs text-muted-color" style="font-size: 0.65rem;">VALIDATION STATE</div>
              <span class="badge badge-blue" style="margin-top: 4px;">${mri.validationState}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="accordion-item">
        <button class="accordion-trigger">Experiments</button>
        <div class="accordion-content">
          <div style="display: flex; flex-direction: column; gap: var(--space-xs); padding-top: var(--space-xs);">
            ${experimentsHtml}
          </div>
        </div>
      </div>

      <div class="accordion-item">
        <button class="accordion-trigger">Implementation</button>
        <div class="accordion-content">
          <div style="background-color: var(--bg-secondary); border: 1px dashed var(--border-color); padding: var(--space-sm); border-radius: var(--border-radius); margin-top: var(--space-xs); text-align: left;">
            <div class="monospace text-xs text-primary-color" style="font-weight: 600; text-transform: uppercase;">Estimated Value Impact</div>
            <div style="font-size: 1.2rem; font-weight: 600; color: var(--text-primary); margin-top: 4px; margin-bottom: 4px;">${mri.estimatedImpact || '$1.8M ARR Unlocked'}</div>
            <p class="text-xs" style="margin: 0; color: var(--text-secondary);">Implementation of sachet structures, custom bedside placement triggers, and direct CRM feedback locks.</p>
          </div>
        </div>
      </div>

      <div style="margin-top: var(--space-lg); text-align: center; padding-top: var(--space-md); border-top: 1px solid var(--border-color);">
        <a href="https://cal.com/bimal-kernmetrics" target="_blank" class="btn btn-primary w-full" style="min-height: 48px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.9rem; font-weight: 600;">Book a Growth MRI\u2122</a>
      </div>
    </div>

    <!-- Live related-content dynamic explorer links -->
    ${relatedRecommendationsHtml}
  `;

  // Accordion Logic
  const triggers = container.querySelectorAll('.accordion-trigger');
  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const parent = trigger.parentElement;
      const isOpen = parent.classList.contains('open');

      container.querySelectorAll('.accordion-item').forEach(item => {
        item.classList.remove('open');
        const content = item.querySelector('.accordion-content');
        if (content) content.style.maxHeight = '0';
      });

      if (!isOpen) {
        parent.classList.add('open');
        const content = parent.querySelector('.accordion-content');
        if (content) content.style.maxHeight = '1500px';
      }
    });
  });
}
