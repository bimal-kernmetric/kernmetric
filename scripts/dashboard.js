import { CONFIG } from '../config/config.js';
import { getCompanies } from './api/companies.js';
import { getMRIs } from './api/mri.js';
import { getParadoxes } from './api/paradoxes.js';
import { getResearch } from './api/research.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Fetch database counts
  const companies = await getCompanies();
  const mris = await getMRIs();
  const paradoxes = await getParadoxes();
  const research = await getResearch();

  // 1. Populate Telemetry Counters
  document.getElementById('kpi-companies').innerText = companies.length;
  document.getElementById('kpi-paradoxes').innerText = paradoxes.length;
  document.getElementById('kpi-experiments').innerText = CONFIG.telemetry.validationExperiments;
  document.getElementById('kpi-research').innerText = research.length;

  // 2. Populate Latest Diagnostic MRIs Feed
  const feedContainer = document.getElementById('mri-feed-container');
  if (feedContainer) {
    feedContainer.innerHTML = '';
    
    // Sort MRIs by lastUpdated descending
    const sortedMRIs = [...mris].sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
    
    sortedMRIs.forEach(mri => {
      const company = companies.find(c => c.id === mri.companyId);
      const companyName = company ? company.name : 'Unknown Brand';
      
      const card = document.createElement('div');
      card.className = 'card card-elevated';
      card.style.cursor = 'pointer';
      
      // Determine badge color class based on validationState
      let badgeClass = 'badge-blue';
      if (mri.validationState === 'Hypothesis') badgeClass = '';
      
      card.innerHTML = `
        <div class="flex justify-between items-start" style="margin-bottom: var(--space-xs);">
          <div>
            <span class="monospace text-xs text-muted-color" style="text-transform: uppercase;">
              ${companyName} • ${mri.constraintClass}
            </span>
            <h4 style="margin: 4px 0 0 0; font-size: 1.3rem;">
              ${mri.primaryConstraint}
            </h4>
          </div>
          <div style="text-align: right; display: flex; flex-direction: column; gap: 4px; align-items: flex-end;">
            <span class="badge ${badgeClass}">${mri.validationState}</span>
            <span class="monospace text-xs" style="color: var(--text-muted); font-size: 0.65rem;">v${mri.version}</span>
          </div>
        </div>
        <p class="text-sm" style="margin-bottom: var(--space-sm); color: var(--text-secondary);">
          ${mri.summary}
        </p>
        <div class="flex justify-between items-center border-t" style="padding-top: var(--space-xs); font-family: 'JetBrains Mono', monospace; font-size: 0.75rem;">
          <div>
            <span style="color: var(--text-muted);">Impact: </span>
            <span style="color: var(--primary); font-weight: 500;">${mri.estimatedImpact}</span>
          </div>
          <div>
            <span style="color: var(--text-muted);">Confidence: </span>
            <span style="color: var(--text-primary); font-weight: 500;">${mri.confidence}%</span>
          </div>
        </div>
      `;
      
      card.addEventListener('click', () => {
        window.location.href = `case-study.html?id=${mri.id}`;
      });
      
      feedContainer.appendChild(card);
    });
  }

  // 3. Populate Activity Feed
  const activityContainer = document.getElementById('activity-feed-container');
  if (activityContainer) {
    const activities = [
      { date: 'JULY 09', type: 'MRI UPDATE', msg: 'Everyday Dose: Ritual Fragmentation updated to v1.3 (Confidence stable at 89%)' },
      { date: 'JULY 05', type: 'TRIAL VALID', msg: 'Perelel prenatal trimester automatic SMS progression validated (96% confidence rate)' },
      { date: 'JUNE 28', type: 'PUBLICATION', msg: 'Bimal Murali published whitepaper: "The Illusion of LTV"' },
      { date: 'JUNE 15', type: 'HYPOTHESIS', msg: 'Create gummy pricing elasticity limits added to atlas catalog' },
      { date: 'JUNE 01', type: 'TRIAL VALID', msg: 'Naked Nutrition Meta-Amazon cross-channel MMM spillover models evidence-backed' },
      { date: 'MAY 18', type: 'NEW MRI', msg: 'Promix Nutrition: AOV compression diagnostic index generated (v1.0)' },
      { date: 'MAY 02', type: 'PUBLICATION', msg: 'Bimal Murali published article: "Ritual Engineering in CPG Packaging"' }
    ];

    activityContainer.innerHTML = '';
    activities.forEach(act => {
      const actEl = document.createElement('div');
      actEl.className = 'activity-item';
      actEl.innerHTML = `
        <div class="activity-marker">${act.date}<br><span style="font-size: 0.6rem; color: var(--text-muted);">${act.type}</span></div>
        <div style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4;">${act.msg}</div>
      `;
      activityContainer.appendChild(actEl);
    });
  }
});
