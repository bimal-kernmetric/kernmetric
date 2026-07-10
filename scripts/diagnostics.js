import { getCompanies } from './api/companies.js';
import { getMRIs } from './api/mri.js';
import { getParadoxes } from './api/paradoxes.js';

document.addEventListener('DOMContentLoaded', async () => {
  const companies = await getCompanies();
  const mris = await getMRIs();
  const paradoxes = await getParadoxes();

  const resultsGrid = document.getElementById('library-results-grid');
  const countEl = document.getElementById('results-count');
  const searchInput = document.getElementById('lib-search-input');
  const taxContainer = document.getElementById('taxonomy-filter-list');
  const resetBtn = document.getElementById('reset-filters-btn');

  // Distinct Taxonomies list
  const taxonomies = ["Behavior", "Economics", "Retention", "Pricing", "Lifecycle", "Acquisition"];
  
  // Renders taxonomy checkboxes
  taxContainer.innerHTML = '';
  taxonomies.forEach(tax => {
    const label = document.createElement('label');
    label.className = 'flex items-center gap-sm text-sm cursor-pointer';
    label.style.marginBottom = '4px';
    label.innerHTML = `
      <input type="checkbox" class="tax-filter" value="${tax}">
      ${tax}
    `;
    taxContainer.appendChild(label);
  });

  // Event Listeners for Filters
  searchInput.addEventListener('keyup', renderLibrary);
  resetBtn.addEventListener('click', resetFilters);
  document.querySelectorAll('.tier-filter').forEach(cb => cb.addEventListener('change', renderLibrary));
  taxContainer.querySelectorAll('.tax-filter').forEach(cb => cb.addEventListener('change', renderLibrary));

  // Render initial list
  renderLibrary();

  function resetFilters() {
    searchInput.value = '';
    document.querySelectorAll('.tier-filter, .tax-filter').forEach(cb => cb.checked = false);
    renderLibrary();
  }

  function renderLibrary() {
    const query = searchInput.value.toLowerCase().trim();
    
    // Get checked filters
    const checkedTaxes = Array.from(taxContainer.querySelectorAll('.tax-filter:checked')).map(cb => cb.value);
    const checkedTiers = Array.from(document.querySelectorAll('.tier-filter:checked')).map(cb => cb.value);

    resultsGrid.innerHTML = '';
    let visibleCount = 0;

    companies.forEach(company => {
      const mri = mris.find(m => m.companyId === company.id);
      if (!mri) return;

      // 1. Text Search Filter
      const matchesSearch = 
        company.name.toLowerCase().includes(query) || 
        mri.primaryConstraint.toLowerCase().includes(query) || 
        company.industry.toLowerCase().includes(query) ||
        company.tags.some(t => t.toLowerCase().includes(query));

      // 2. Shopify Tier Filter
      const matchesTier = checkedTiers.length === 0 || checkedTiers.includes(company.shopifyTier);

      // 3. Taxonomy Domain Filter
      const matchesTax = checkedTaxes.length === 0 || checkedTaxes.some(tax => {
        return company.tags.includes(tax) || 
               mri.constraintClass.includes(tax) ||
               (mri.primaryConstraint && mri.primaryConstraint.includes(tax));
      });

      if (matchesSearch && matchesTier && matchesTax) {
        visibleCount++;
        
        const card = document.createElement('div');
        card.className = 'card card-elevated';
        card.style.cursor = 'pointer';
        
        let badgeClass = 'badge-blue';
        if (mri.validationState === 'Hypothesis') badgeClass = '';

        card.innerHTML = `
          <div class="flex justify-between items-start" style="margin-bottom: var(--space-xs);">
            <div>
              <span class="monospace text-xs text-muted-color" style="text-transform: uppercase;">
                ${company.name} • ${company.industry}
              </span>
              <h4 style="margin: 4px 0 0 0; font-size: 1.25rem;">
                ${mri.primaryConstraint}
              </h4>
            </div>
            <span class="badge ${badgeClass}">${mri.validationState}</span>
          </div>
          <p class="text-sm" style="margin-bottom: var(--space-sm); color: var(--text-secondary); line-height: 1.5;">
            ${mri.summary}
          </p>
          <div class="flex justify-between items-center border-t" style="padding-top: var(--space-xs); font-family: 'JetBrains Mono', monospace; font-size: 0.75rem;">
            <div>
              <span style="color: var(--text-muted);">Confidence: </span>
              <span style="color: var(--primary); font-weight: 500;">${mri.confidence}%</span>
            </div>
            <div style="font-size: 0.7rem; color: var(--primary); font-weight: 500;">
              Read MRI →
            </div>
          </div>
        `;

        card.addEventListener('click', () => {
          window.location.href = `case-study.html?id=${mri.id}`;
        });

        resultsGrid.appendChild(card);
      }
    });

    countEl.innerText = visibleCount;
  }
});
