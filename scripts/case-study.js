import { getMRIById, getMRIs } from './api/mri.js';
import { getCompanyById, getCompanies } from './api/companies.js';
import { getParadoxes } from './api/paradoxes.js';
import { getResearch } from './api/research.js';

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('report-view-container');
  if (!container) return;

  // 1. Resolve ID from Query Parameter
  const params = new URLSearchParams(window.location.search);
  const mriId = params.get('id');

  if (!mriId) {
    container.innerHTML = `
      <div style="text-align: center; padding: var(--space-xl) 0;">
        <span class="badge mb-md">ERROR 404</span>
        <h2 style="border-bottom: none; margin: 0 0 var(--space-sm) 0;">No MRI Identifier Provided</h2>
        <p class="text-sm" style="color: var(--text-secondary); margin-bottom: var(--space-md);">Please select a diagnostic report from the library.</p>
        <a href="case-studies.html" class="btn btn-primary">Open Case Studies</a>
      </div>
    `;
    return;
  }

  // 2. Fetch Data
  const mri = await getMRIById(mriId);
  if (!mri) {
    container.innerHTML = `
      <div style="text-align: center; padding: var(--space-xl) 0;">
        <span class="badge mb-md">ERROR 404</span>
        <h2 style="border-bottom: none; margin: 0 0 var(--space-sm) 0;">Diagnostic Report Not Found</h2>
        <p class="text-sm" style="color: var(--text-secondary); margin-bottom: var(--space-md);">The report "${mriId}" could not be resolved.</p>
        <a href="case-studies.html" class="btn btn-primary">Back to Library</a>
      </div>
    `;
    return;
  }

  const company = await getCompanyById(mri.companyId);
  const companyName = company ? company.name : 'Unknown Company';

  // Fetch cross-linking data for related recommendations
  const paradoxes = await getParadoxes();
  const allMRIs = await getMRIs();
  const allCompanies = await getCompanies();
  const allResearch = await getResearch();

  const paradox = paradoxes.find(p => p.name === mri.primaryConstraint);
  const otherMRIs = allMRIs.filter(m => m.primaryConstraint === mri.primaryConstraint && m.id !== mri.id);
  const otherCompanies = allCompanies.filter(c => otherMRIs.map(m => m.companyId).includes(c.id));
  
  // Match papers that share constraintClass tags
  const relatedPapers = allResearch.filter(r => 
    r.tags.some(tag => mri.constraintClass.includes(tag)) || 
    r.tags.some(tag => mri.primaryConstraint.toLowerCase().includes(tag.toLowerCase()))
  );

  // Generate dynamic HTML segments
  const observationsHtml = mri.observations.map(obs => `
    <li style="margin-bottom: var(--space-xs);">${obs}</li>
  `).join('');

  const constraintsHtml = mri.constraints.map(c => `
    <div style="margin-bottom: var(--space-sm);">
      <h4 style="margin: 0; font-family: 'Source Serif 4', serif; font-size: 1.1rem; font-weight: 500;">${c.title}</h4>
      <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: var(--text-secondary);">${c.description}</p>
    </div>
  `).join('');

  const experimentsHtml = mri.validationExperiments.map((exp, idx) => `
    <div class="km-experiment-card">
      <div class="km-experiment-card-step">EXP_0${idx + 1} // ${exp.metricTracked.toUpperCase()}</div>
      <h4 style="margin: 2px 0 var(--space-xxs) 0; font-family: 'Source Serif 4', serif; font-size: 1.05rem;">${exp.title}</h4>
      <p class="text-xs" style="color: var(--text-secondary); line-height: 1.45; margin: 0 0 var(--space-xs) 0;">
        <strong>Protocol:</strong> ${exp.protocol}
      </p>
      <span class="badge badge-blue" style="font-size: 0.65rem;">Result: ${exp.result}</span>
    </div>
  `).join('');

  // Re-link related content blocks
  const relatedRecommendationsHtml = `
    <!-- Related Intelligence Traversals Section -->
    <div style="border-top: 1px solid var(--border-color); padding-top: var(--space-xl); margin-top: var(--space-xl);">
      <span class="monospace text-xs text-primary-color" style="font-weight: 600; text-transform: uppercase;">Related Intelligence Traversals</span>
      <h3 style="margin-top: 4px; font-family: 'Source Serif 4', serif; font-size: 1.5rem; margin-bottom: var(--space-md);">Endless Exploration</h3>
      
      <div class="grid grid-cols-3 gap-md" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
        
        <!-- 1. The Paradox Constraint Card -->
        ${paradox ? `
          <div class="km-constraint-card" style="cursor: pointer;" onclick="window.location.href='case-studies.html?view=paradoxes'">
            <div>
              <div class="monospace text-xs text-muted-color" style="font-size: 0.65rem;">PRIMARY CONSTRAINT</div>
              <h3 style="margin: 4px 0 0 0; font-family: 'Source Serif 4', serif; font-size: 1.25rem;">${paradox.name}</h3>
            </div>
            <p class="text-xs" style="color: var(--text-secondary); margin: var(--space-xs) 0;">
              ${paradox.summary || paradox.description}
            </p>
            <div style="margin-top: auto; color: var(--primary); font-weight: 600; font-size: 0.8rem; border-top: 1px solid var(--border-color); padding-top: var(--space-xs);">
              Explore Paradox &rarr;
            </div>
          </div>
        ` : ''}

        <!-- 2. Other diagnosed brand cards -->
        ${otherCompanies.map(comp => {
          const compMRI = otherMRIs.find(m => m.companyId === comp.id);
          return `
            <div class="km-company-card" style="cursor: pointer;" onclick="window.location.href='case-study.html?id=${compMRI.id}'">
              <div class="km-company-card-header">
                <div>
                  <div class="monospace text-xs text-muted-color" style="font-size: 0.65rem;">DIAGNOSED BRAND</div>
                  <h3 class="km-company-card-title">${comp.name}</h3>
                </div>
                <span class="badge badge-blue">Cohort Case</span>
              </div>
              <p class="text-xs" style="color: var(--text-secondary); margin: var(--space-xs) 0;">
                Primary Constraint: <strong>${compMRI.primaryConstraint}</strong>
              </p>
              <div class="flex justify-between items-center" style="border-top: 1px solid var(--border-color); padding-top: var(--space-xs); font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: var(--text-muted); margin-top: auto;">
                <span>Confidence: ${compMRI.confidence}%</span>
                <span style="color: var(--primary); font-weight: 600;">Read MRI &rarr;</span>
              </div>
            </div>
          `;
        }).join('')}

        <!-- 3. Related Research citation cards -->
        ${relatedPapers.slice(0, 2).map(paper => {
          return `
            <div class="km-research-card" style="cursor: pointer;" onclick="window.location.href='research.html?id=${paper.id}'">
              <div>
                <span class="badge text-xs" style="font-size: 0.65rem; text-transform: uppercase;">${paper.type}</span>
                <h3 style="margin: var(--space-xs) 0 4px 0; font-family: 'Source Serif 4', serif; font-size: 1.25rem;">${paper.title}</h3>
              </div>
              <p class="text-xs" style="color: var(--text-secondary); margin: var(--space-xs) 0;">
                ${paper.summary}
              </p>
              <div class="flex justify-between items-center" style="border-top: 1px solid var(--border-color); padding-top: var(--space-xs); font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: var(--text-muted); margin-top: auto;">
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
    <!-- Dynamic Navigation Breadcrumbs Component -->
    <kern-breadcrumbs></kern-breadcrumbs>

    <!-- Desktop: Editorial PDF-style Layout -->
    <div class="pdf-layout">
      <!-- PDF Top Ribbon Header -->
      <div class="flex justify-between items-center" style="border-bottom: 2px solid var(--text-primary); padding-bottom: var(--space-xs); margin-bottom: var(--space-lg);">
        <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: var(--text-primary);">KERNMETRIC // DIAGNOSTIC BRIEF</span>
        <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">CONFIDENTIAL</span>
      </div>

      <!-- Title and Classification -->
      <div>
        <span class="monospace text-xs text-primary-color" style="font-weight: 600; text-transform: uppercase;">
          Growth MRI™ Report
        </span>
        <h1 style="font-size: 2.25rem; font-weight: 600; line-height: 1.2; margin-top: 4px; margin-bottom: var(--space-sm);">
          ${mri.primaryConstraint}
        </h1>
      </div>

      <!-- Document Meta Grid -->
      <div class="pdf-meta-grid">
        <div>
          <div class="monospace text-xs text-muted-color">COMPANY</div>
          <div style="font-size: 0.85rem; font-weight: 500; color: var(--text-primary);">${companyName}</div>
        </div>
        <div>
          <div class="monospace text-xs text-muted-color">INDUSTRY</div>
          <div style="font-size: 0.85rem; font-weight: 500; color: var(--text-primary);">${company ? company.industry : 'N/A'}</div>
        </div>
        <div>
          <div class="monospace text-xs text-muted-color">SHOPIFY TIER</div>
          <div style="font-size: 0.85rem; font-weight: 500; color: var(--text-primary);">${company ? company.shopifyTier : 'N/A'}</div>
        </div>
        <div>
          <div class="monospace text-xs text-muted-color">EST_REVENUE</div>
          <div style="font-size: 0.85rem; font-weight: 500; color: var(--text-primary);">${company ? company.estimatedRevenue : 'N/A'}</div>
        </div>
      </div>

      <!-- Executive Summary -->
      <div style="margin-bottom: var(--space-lg);">
        <h3 style="margin-top: 0; font-family: 'Source Serif 4', serif; font-size: 1.4rem;">Executive Diagnosis</h3>
        <p class="lead" style="font-size: 1.1rem; line-height: 1.6;">
          ${mri.summary}
        </p>
      </div>

      <!-- Observations -->
      <div style="margin-bottom: var(--space-lg);">
        <h3 style="font-family: 'Source Serif 4', serif; font-size: 1.4rem;">Observed Symptoms</h3>
        <ul style="padding-left: var(--space-md); color: var(--text-secondary); line-height: 1.6; font-size: 0.95rem;">
          ${observationsHtml}
        </ul>
      </div>

      <!-- System Bottleneck Mapping -->
      <div style="margin-bottom: var(--space-lg);">
        <h3 style="font-family: 'Source Serif 4', serif; font-size: 1.4rem;">Identified System Constraints</h3>
        <div style="border-left: 2px solid var(--primary); padding-left: var(--space-md); margin-bottom: var(--space-md);">
          ${constraintsHtml}
        </div>
      </div>

      <!-- Friction Velocity & Latency -->
      <div style="margin-bottom: var(--space-lg);">
        <h3 style="font-family: 'Source Serif 4', serif; font-size: 1.4rem;">Friction Velocity & Latency</h3>
        <p style="font-size: 0.95rem;">
          ${mri.velocity}
        </p>
      </div>

      <!-- Validation State and Confidence Details -->
      <div class="grid grid-cols-2 gap-lg" style="grid-template-columns: 1fr 1fr; margin-bottom: var(--space-xl); border-top: 1px solid var(--border-color); padding-top: var(--space-lg);">
        <div>
          <h3 style="margin-top: 0; font-family: 'Source Serif 4', serif; font-size: 1.4rem;">Validation Status</h3>
          <p style="font-size: 0.95rem; margin-bottom: var(--space-sm);">${mri.validation}</p>
          <div style="display: flex; gap: var(--space-sm); align-items: center;">
            <div>
              <div class="monospace text-xs text-muted-color">CONFIDENCE</div>
              <div style="font-family: 'JetBrains Mono', monospace; font-size: 1.25rem; font-weight: 500; color: var(--primary);">${mri.confidence}%</div>
            </div>
            <div>
              <div class="monospace text-xs text-muted-color">STATE</div>
              <span class="badge badge-blue" style="margin-top: 4px;">${mri.validationState}</span>
            </div>
          </div>
        </div>
        <div>
          <h3 style="margin-top: 0; font-family: 'Source Serif 4', serif; font-size: 1.4rem;">Validation Experiments</h3>
          ${experimentsHtml}
        </div>
      </div>

      <!-- PDF Footer -->
      <div class="flex justify-between items-center" style="border-top: 1px solid var(--border-color); padding-top: var(--space-sm); font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; color: var(--text-muted);">
        <span>Doc Ref: KM_MRI_${mri.id.toUpperCase()}</span>
        <span>v${mri.version} • Published ${mri.lastUpdated}</span>
        <span>Page 1 of 1</span>
      </div>
    </div>

    <!-- Mobile: Adaptive Executive Brief Accordion Interface -->
    <div class="mobile-accordion-layout">
      <div style="margin-bottom: var(--space-md); border-bottom: 2px solid var(--text-primary); padding-bottom: var(--space-xs);">
        <span class="monospace text-xs text-primary-color" style="font-weight: 600; font-size: 0.65rem;">EXECUTIVE BRIEF // ${companyName.toUpperCase()}</span>
        <h2 style="font-size: 1.5rem; border-bottom: none; margin-top: var(--space-xxs); margin-bottom: var(--space-xxs);">${mri.primaryConstraint}</h2>
        <span class="badge badge-blue">${mri.validationState} (${mri.confidence}% Confidence)</span>
      </div>

      <div class="accordion-item open">
        <button class="accordion-trigger">CEO Summary</button>
        <div class="accordion-content" style="max-height: 1000px;">
          <p class="lead" style="font-size: 1.05rem; line-height: 1.6; margin: 0; padding-top: var(--space-xs);">${mri.summary}</p>
        </div>
      </div>

      <div class="accordion-item">
        <button class="accordion-trigger">Observed Symptoms</button>
        <div class="accordion-content">
          <ul style="padding-left: var(--space-md); color: var(--text-secondary); line-height: 1.6; margin: 0; padding-top: var(--space-xs);">
            ${observationsHtml}
          </ul>
        </div>
      </div>

      <div class="accordion-item">
        <button class="accordion-trigger">Candidate Constraints</button>
        <div class="accordion-content">
          <div style="border-left: 2px solid var(--primary); padding-left: var(--space-md); padding-top: var(--space-xs);">
            ${constraintsHtml}
          </div>
        </div>
      </div>

      <div class="accordion-item">
        <button class="accordion-trigger">Dependency Chains</button>
        <div class="accordion-content">
          <p style="margin: 0; color: var(--text-secondary); line-height: 1.6; padding-top: var(--space-xs);">${mri.velocity}</p>
        </div>
      </div>

      <div class="accordion-item">
        <button class="accordion-trigger">Evidence</button>
        <div class="accordion-content">
          <p style="margin: 0; color: var(--text-secondary); line-height: 1.6; padding-top: var(--space-xs);">${mri.validation}</p>
        </div>
      </div>

      <div class="accordion-item">
        <button class="accordion-trigger">Validation</button>
        <div class="accordion-content">
          <div style="display: flex; gap: var(--space-sm); align-items: center; padding-top: var(--space-xs);">
            <div>
              <div class="monospace text-xs text-muted-color">CONFIDENCE INDEX</div>
              <div style="font-family: 'JetBrains Mono', monospace; font-size: 1.2rem; font-weight: 600; color: var(--primary);">${mri.confidence}%</div>
            </div>
            <div>
              <div class="monospace text-xs text-muted-color">VALIDATION STATE</div>
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
          <div style="background-color: var(--bg-secondary); border: 1px dashed var(--border-color); padding: var(--space-sm); border-radius: var(--border-radius); margin-top: var(--space-xs);">
            <div class="monospace text-xs text-primary-color" style="font-weight: 600; text-transform: uppercase;">Estimated Value Impact</div>
            <div style="font-size: 1.2rem; font-weight: 600; color: var(--text-primary); margin-top: 4px; margin-bottom: 4px;">${mri.estimatedImpact || '$1.8M ARR Unlocked'}</div>
            <p class="text-xs" style="margin: 0; color: var(--text-secondary);">Implementation of sachet structures, custom bedside placement triggers, and direct CRM feedback locks.</p>
          </div>
        </div>
      </div>

      <div style="margin-top: var(--space-lg); text-align: center; padding-top: var(--space-md); border-top: 1px solid var(--border-color);">
        <a href="https://cal.com/bimal-kernmetrics" target="_blank" class="btn btn-primary w-full" style="min-height: 52px; display: inline-flex; align-items: center; justify-content: center;">Book a Growth MRI™</a>
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

      // Close all accordion items
      container.querySelectorAll('.accordion-item').forEach(item => {
        item.classList.remove('open');
        const content = item.querySelector('.accordion-content');
        if (content) content.style.maxHeight = '0';
      });

      // Toggle current one
      if (!isOpen) {
        parent.classList.add('open');
        const content = parent.querySelector('.accordion-content');
        if (content) content.style.maxHeight = '1000px';
      }
    });
  });
});
