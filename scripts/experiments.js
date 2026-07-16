import { getMRIs } from './api/mri.js';
import { getCompanies } from './api/companies.js';

document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('experiments-grid');
  const searchInput = document.getElementById('experiments-search');
  const tabsList = document.getElementById('experiment-status-tabs');

  if (!grid || !searchInput || !tabsList) return;

  const allMRIs = await getMRIs();
  const allCompanies = await getCompanies();

  // Extract and enrich experiments from all MRI datasets
  const rawExperiments = [];
  allMRIs.forEach(mri => {
    const company = allCompanies.find(c => c.id === mri.companyId);
    const expList = mri.experiments || mri.validationExperiments || [];
    
    expList.forEach((exp, idx) => {
      // Enrich with mock but contextual research specs based on names
      let hypothesis = "Isolating behavioral friction barriers lifts target user action frequency.";
      let method = "Implement streamlined checkout controls, reducing registration step configurations.";
      let metrics = "Retention velocity, feedback loop delay latency.";
      let decisionRule = "LTV lift > 10% relative to control cohort.";

      if (exp.name.includes("Sachet")) {
        hypothesis = "Positioning sachets in plain view on nightstands reduces memory friction, establishing daily ritual loops.";
        method = "Distribute 500 custom bedside holders with single-serve powder sachets to Day-1 cohorts.";
        metrics = "Intake frequency logs, Day-90 billing retention.";
        decisionRule = "If Day-90 retention lifts by >15%, validate strategy.";
      } else if (exp.name.includes("SMS")) {
        hypothesis = "Scheduled ritual notifications sent at target consumption times bypass routine initiation friction.";
        method = "Automate target evening text check-ins reminding subscribers to consume bedtime formulas.";
        metrics = "Adherence self-reporting rates, Month-1 cancellations.";
        decisionRule = "If adherence increases by >12%, scale trigger logic.";
      } else if (exp.name.includes("Lock") || exp.name.includes("Favorite")) {
        hypothesis = "Bypassing complex customization menus locks in active habits, preventing choice fatigue.";
        method = "Deploy a single-click favorite locking option inside billing configurations.";
        metrics = "Checkout page drop-offs, Month-2 churn.";
        decisionRule = "If Month-2 churn drops by >10% relative to baseline, validate lock UI.";
      } else if (exp.name.includes("Telegram")) {
        hypothesis = "Integrating data logs into conversational chat applications lowers reporting friction.";
        method = "Build a Telegram mini-app allowing subscribers to log focus metrics in under 3 seconds.";
        metrics = "Daily log completion rates, user fatigue scores.";
        decisionRule = "Log completion > 75% over a 14-day tracking trial.";
      } else if (exp.name.includes("Price") || exp.name.includes("Elasticity")) {
        hypothesis = "Premium price adjustments on high-loyalty subscription cohorts improve unit economics without triggering churn.";
        method = "Increase DTC bundle pricing by 8% for new signups while maintaining baseline pricing for existing users.";
        metrics = "DTC conversion rates, contribution margins.";
        decisionRule = "Margin increase > 500bps with < 3% decrease in signups.";
      } else if (exp.name.includes("Retail")) {
        hypothesis = "Developing retail-specific packaging sizes prevents pricing comparison conflicts with DTC channels.";
        method = "Distribute exclusive multi-pack bundles to target retail store slots.";
        metrics = "Offline slotting fee payback speeds, channel overlap metrics.";
        decisionRule = "Payback velocity < 6 months.";
      }

      rawExperiments.push({
        id: `EXP_${mri.id.replace('mri_', '').toUpperCase()}_0${idx + 1}`,
        title: exp.name,
        status: exp.status || exp.validationState || "Validated",
        confidence: exp.confidence || 80,
        result: exp.result || "Validated trial lift observed.",
        mriId: mri.id,
        companyName: company ? company.name : "Unknown Company",
        hypothesis,
        method,
        metrics,
        decisionRule
      });
    });
  });

  let activeFilter = 'all';
  let searchQuery = '';

  function renderExperiments() {
    grid.innerHTML = '';
    
    const filtered = rawExperiments.filter(exp => {
      const matchesStatus = activeFilter === 'all' || exp.status === activeFilter;
      const matchesSearch = exp.title.toLowerCase().includes(searchQuery) ||
                            exp.companyName.toLowerCase().includes(searchQuery) ||
                            exp.hypothesis.toLowerCase().includes(searchQuery);
      return matchesStatus && matchesSearch;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: var(--space-xl); text-align: center; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; font-size: 0.85rem;">
          No matching validation experiments found.
        </div>
      `;
      return;
    }

    filtered.forEach(exp => {
      const card = document.createElement('div');
      card.className = 'km-experiment-card';
      card.style.display = 'flex';
      card.style.flexDirection = 'column';
      card.style.gap = 'var(--space-xs)';
      card.style.padding = 'var(--space-md)';
      card.style.border = '1px solid var(--border-color)';
      card.style.borderRadius = 'var(--border-radius)';
      card.style.backgroundColor = 'var(--bg-primary)';

      const badgeClass = exp.status === 'Validated' ? 'badge-blue' : '';

      card.innerHTML = `
        <div class="flex justify-between items-start" style="border-bottom: 1px dashed var(--border-color); padding-bottom: var(--space-xxs); margin-bottom: var(--space-xxs);">
          <div>
            <span class="monospace text-xs text-muted-color" style="font-size: 0.65rem;">${exp.id}</span>
            <h3 style="margin: 2px 0 0 0; font-family: 'Source Serif 4', serif; font-size: 1.25rem; color: var(--text-primary);">${exp.title}</h3>
          </div>
          <span class="badge ${badgeClass}" style="font-size: 0.65rem;">${exp.status}</span>
        </div>

        <div style="font-size: 0.85rem; line-height: 1.45;">
          <p style="margin: 0 0 6px 0; color: var(--text-secondary);"><strong style="color: var(--text-primary);">Hypothesis:</strong> ${exp.hypothesis}</p>
          <p style="margin: 0 0 6px 0; color: var(--text-secondary);"><strong style="color: var(--text-primary);">Method:</strong> ${exp.method}</p>
          <p style="margin: 0 0 6px 0; color: var(--text-secondary);"><strong style="color: var(--text-primary);">Metrics:</strong> ${exp.metrics}</p>
          <p style="margin: 0 0 6px 0; color: var(--text-secondary);"><strong style="color: var(--text-primary);">Decision Rule:</strong> ${exp.decisionRule}</p>
        </div>

        <div style="background-color: var(--bg-secondary); border: 1px dashed var(--border-color); padding: var(--space-xs); border-radius: var(--border-radius); font-size: 0.8rem; margin-top: auto;">
          <div class="monospace text-xs text-muted-color" style="font-size: 0.65rem; text-transform: uppercase;">Observed Outcome</div>
          <p style="margin: 2px 0 0 0; color: var(--text-primary); line-height: 1.4; font-family: 'JetBrains Mono', monospace;">${exp.result}</p>
        </div>

        <div class="flex justify-between items-center" style="border-top: 1px solid var(--border-color); padding-top: var(--space-xs); margin-top: var(--space-xs); font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: var(--text-muted);">
          <span>Cohort: <strong>${exp.companyName}</strong></span>
          <a href="case-study.html?id=${exp.mriId}" style="color: var(--primary); font-weight: 600;">Read MRI &rarr;</a>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  // Bind Search query field
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    renderExperiments();
  });

  // Bind Filter tabs clicks
  const tabButtons = tabsList.querySelectorAll('.km-tab-button');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.getAttribute('data-status');
      renderExperiments();
    });
  });

  renderExperiments();
});
