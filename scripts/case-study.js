import { getMRIById } from './api/mri.js';
import { getCompanyById } from './api/companies.js';

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
        <p class="text-sm" style="color: var(--text-secondary); margin-bottom: var(--space-md);">The requested identifier "${mriId}" does not exist in the database.</p>
        <a href="case-studies.html" class="btn btn-primary">Open Case Studies</a>
      </div>
    `;
    return;
  }

  const company = await getCompanyById(mri.companyId);
  const companyName = company ? company.name : 'Unknown Brand';

  // Update Page Title
  document.title = `${companyName} Growth MRI — KernMetric`;

  // 3. Render HTML
  let observationsHtml = mri.observations.map(obs => `<li style="margin-bottom: 6px;">${obs}</li>`).join('');
  let constraintsHtml = mri.constraints.map(con => `<p class="text-sm" style="margin-bottom: 8px;">${con}</p>`).join('');
  
  let experimentsHtml = mri.experiments.map(exp => {
    let statusClass = exp.status === 'Validated' ? 'badge-blue' : '';
    return `
      <div class="card" style="margin-bottom: var(--space-sm); background-color: var(--bg-secondary);">
        <div class="flex justify-between items-center" style="margin-bottom: var(--space-xs);">
          <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; font-weight: 500; color: var(--text-primary);">${exp.name}</span>
          <span class="badge ${statusClass}">${exp.status}</span>
        </div>
        <p class="text-xs" style="margin: 0 0 var(--space-xs) 0; color: var(--text-secondary); line-height: 1.4;">${exp.result}</p>
        <div class="monospace text-xs" style="color: var(--text-muted); font-size: 0.65rem;">Confidence: ${exp.confidence}%</div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
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

    <!-- Constraint Velocity -->
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
  `;
});
