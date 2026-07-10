import { getCompanies } from './api/companies.js';
import { getMRIs } from './api/mri.js';
import { getParadoxes } from './api/paradoxes.js';

document.addEventListener('DOMContentLoaded', async () => {
  const companies = await getCompanies();
  const mris = await getMRIs();
  const paradoxes = await getParadoxes();

  // Page Elements
  const resultsGrid = document.getElementById('library-results-grid');
  const totalCountEl = document.getElementById('total-count');
  const showingCountEl = document.getElementById('showing-count');
  const searchInput = document.getElementById('lib-search-input');
  const sortSelect = document.getElementById('sort-select');
  const resetBtn = document.getElementById('reset-filters-btn');
  const resultsTitle = document.getElementById('results-title');

  // Mobile Elements
  const mobileModal = document.getElementById('mobile-filter-modal');
  const mobileFilterBtn = document.getElementById('mobile-filter-trigger-btn');
  const mobileCloseBtn = document.getElementById('mobile-filter-close-btn');
  const mobileClearBtn = document.getElementById('mobile-filter-clear-btn');
  const mobileApplyBtn = document.getElementById('mobile-filter-apply-btn');

  // State
  let currentView = 'companies'; // 'companies', 'paradoxes', 'industries'
  
  let activeFilters = {
    industry: [],
    businessModel: [],
    constraint: [],
    validation: [],
    confidence: [],
    growthArea: []
  };

  // Temp filters for mobile modal buffering
  let tempFilters = {
    industry: [],
    businessModel: [],
    constraint: [],
    validation: [],
    confidence: [],
    growthArea: []
  };

  // Initialize filter panel containers
  renderFilters('desktop-filters-container', false);
  renderFilters('mobile-filters-container', true);

  // Bind Listeners
  searchInput.addEventListener('input', () => renderLibrary());
  sortSelect.addEventListener('change', () => renderLibrary());
  resetBtn.addEventListener('click', () => {
    clearAllFilters(false);
    renderLibrary();
  });

  // View toggle triggers
  document.querySelectorAll('.view-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.view-toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentView = btn.getAttribute('data-view');
      
      // Update Title & Header Sorts based on View
      if (currentView === 'companies') {
        resultsTitle.innerText = 'Diagnostics Library';
        sortSelect.disabled = false;
      } else if (currentView === 'paradoxes') {
        resultsTitle.innerText = 'Structural Paradoxes™';
        sortSelect.disabled = true;
      } else {
        resultsTitle.innerText = 'Industries Index';
        sortSelect.disabled = true;
      }

      renderLibrary();
    });
  });

  // Mobile Modal bindings
  mobileFilterBtn.addEventListener('click', () => {
    // Copy active filters to temp state
    tempFilters = JSON.parse(JSON.stringify(activeFilters));
    updateCheckboxes('mobile-filters-container', tempFilters);
    mobileModal.classList.add('open');
  });

  mobileCloseBtn.addEventListener('click', () => {
    mobileModal.classList.remove('open');
  });

  mobileApplyBtn.addEventListener('click', () => {
    activeFilters = JSON.parse(JSON.stringify(tempFilters));
    // Synchronize desktop checkboxes
    updateCheckboxes('desktop-filters-container', activeFilters);
    renderLibrary();
    mobileModal.classList.remove('open');
  });

  mobileClearBtn.addEventListener('click', () => {
    clearAllFilters(true);
    // Apply immediately and close
    activeFilters = JSON.parse(JSON.stringify(tempFilters));
    updateCheckboxes('desktop-filters-container', activeFilters);
    renderLibrary();
    mobileModal.classList.remove('open');
  });

  // Initial render
  renderLibrary();

  // Helper to clear filters
  function clearAllFilters(isMobileContext) {
    const target = isMobileContext ? tempFilters : activeFilters;
    Object.keys(target).forEach(key => target[key] = []);
    
    const containerId = isMobileContext ? 'mobile-filters-container' : 'desktop-filters-container';
    document.querySelectorAll(`#${containerId} .filter-checkbox`).forEach(cb => cb.checked = false);
    
    if (!isMobileContext) {
      // If cleared on desktop, clear mobile checks as well
      document.querySelectorAll('#mobile-filters-container .filter-checkbox').forEach(cb => cb.checked = false);
    }
  }

  // Helper to sync checkboxes
  function updateCheckboxes(containerId, filtersState) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.querySelectorAll('.filter-checkbox').forEach(cb => {
      const key = cb.getAttribute('data-filter-key');
      const val = cb.value;
      cb.checked = filtersState[key].includes(val);
    });
  }

  // Dynamic filter lists builder
  function renderFilters(containerId, isMobileContext) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    function createFilterGroup(title, key, options) {
      const group = document.createElement('div');
      group.className = 'filter-group';

      const header = document.createElement('button');
      header.className = 'filter-group-header';
      header.innerText = title;

      const content = document.createElement('div');
      content.className = 'filter-group-content';

      options.forEach(opt => {
        const label = document.createElement('label');
        label.className = 'flex items-center gap-sm text-sm cursor-pointer';
        label.style.padding = '2px 0';

        const val = opt.value || opt;
        const display = opt.label || opt;

        label.innerHTML = `
          <input type="checkbox" class="filter-checkbox" data-filter-key="${key}" value="${val}">
          <span>${display}</span>
        `;
        content.appendChild(label);
      });

      // Bind listener
      content.querySelectorAll('.filter-checkbox').forEach(cb => {
        cb.addEventListener('change', () => {
          const targetState = isMobileContext ? tempFilters : activeFilters;
          if (cb.checked) {
            targetState[key].push(cb.value);
          } else {
            targetState[key] = targetState[key].filter(v => v !== cb.value);
          }

          // If on desktop, trigger immediate render
          if (!isMobileContext) {
            renderLibrary();
          }
        });
      });

      header.addEventListener('click', (e) => {
        e.preventDefault();
        group.classList.toggle('collapsed');
      });

      group.appendChild(header);
      group.appendChild(content);
      container.appendChild(group);
    }

    // 1. Industry (Dynamically populated from companies)
    const industries = [...new Set(companies.map(c => c.industry))].filter(Boolean).sort();
    createFilterGroup('Industry', 'industry', industries);

    // 2. Business Model (Dynamically populated from companies)
    const models = [...new Set(companies.map(c => c.businessModel))].filter(Boolean).sort();
    createFilterGroup('Business Model', 'businessModel', models);

    // 3. Primary Constraint (Dynamically populated from paradoxes)
    const constraints = paradoxes.map(p => p.name).sort();
    createFilterGroup('Primary Constraint', 'constraint', constraints);

    // 4. Validation Status
    createFilterGroup('Validation Status', 'validation', ['Hypothesis', 'Evidence-backed', 'Validated']);

    // 5. Confidence Range
    createFilterGroup('Confidence', 'confidence', [
      { label: '70–80%', value: '70-80' },
      { label: '80–90%', value: '80-90' },
      { label: '90%+', value: '90+' }
    ]);

    // 6. Growth Area (Dynamically populated tags excluding brands/framework metadata)
    const exclusionTags = ["CBD", "Sleep", "Nootropics", "Mushroom Coffee", "Customization", "Subscription", "Shopify Plus", "Shopify", "Retail"];
    const allTags = [];
    companies.forEach(c => {
      c.tags.forEach(t => {
        if (!exclusionTags.includes(t)) {
          allTags.push(t);
        }
      });
    });
    const growthAreas = [...new Set(allTags)].filter(Boolean).sort();
    createFilterGroup('Growth Area', 'growthArea', growthAreas);
  }

  // Render main library output
  function renderLibrary() {
    resultsGrid.innerHTML = '';
    const query = searchInput.value.toLowerCase().trim();

    if (currentView === 'companies') {
      renderCompaniesView(query);
    } else if (currentView === 'paradoxes') {
      renderParadoxesView(query);
    } else {
      renderIndustriesView(query);
    }
  }

  // 1. Companies View Renderer
  function renderCompaniesView(query) {
    let filteredList = companies.map(company => {
      const mri = mris.find(m => m.companyId === company.id) || {};
      return { company, mri };
    }).filter(({ company, mri }) => {
      if (!mri.id) return false;

      // Search matching
      const matchesSearch = !query || 
        company.name.toLowerCase().includes(query) ||
        company.industry.toLowerCase().includes(query) ||
        (mri.primaryConstraint && mri.primaryConstraint.toLowerCase().includes(query)) ||
        (mri.validationState && mri.validationState.toLowerCase().includes(query)) ||
        (company.businessModel && company.businessModel.toLowerCase().includes(query)) ||
        company.tags.some(t => t.toLowerCase().includes(query));

      if (!matchesSearch) return false;

      // Filter matching
      if (activeFilters.industry.length > 0 && !activeFilters.industry.includes(company.industry)) return false;
      if (activeFilters.businessModel.length > 0 && !activeFilters.businessModel.includes(company.businessModel)) return false;
      if (activeFilters.constraint.length > 0 && !activeFilters.constraint.includes(mri.primaryConstraint)) return false;
      if (activeFilters.validation.length > 0 && !activeFilters.validation.includes(mri.validationState)) return false;
      
      if (activeFilters.confidence.length > 0) {
        const conf = parseInt(mri.confidence);
        const matchesConf = activeFilters.confidence.some(range => {
          if (range === '70-80') return conf >= 70 && conf < 80;
          if (range === '80-90') return conf >= 80 && conf < 90;
          if (range === '90+') return conf >= 90;
          return false;
        });
        if (!matchesConf) return false;
      }

      if (activeFilters.growthArea.length > 0) {
        const matchesArea = activeFilters.growthArea.some(area => company.tags.includes(area));
        if (!matchesArea) return false;
      }

      return true;
    });

    // Sorting
    const sortVal = sortSelect.value;
    filteredList.sort((a, b) => {
      if (sortVal === 'confidence') {
        return parseInt(b.mri.confidence) - parseInt(a.mri.confidence);
      }
      if (sortVal === 'updated') {
        return new Date(b.mri.lastUpdated || '') - new Date(a.mri.lastUpdated || '');
      }
      if (sortVal === 'industry') {
        return a.company.industry.localeCompare(b.company.industry);
      }
      // default: newest/id
      return b.mri.id.localeCompare(a.mri.id);
    });

    // Update Counts
    totalCountEl.innerText = mris.length;
    showingCountEl.innerText = filteredList.length;

    // Render Cards
    if (filteredList.length === 0) {
      resultsGrid.innerHTML = `<div class="card text-center monospace text-xs text-muted-color" style="grid-column: 1 / -1; padding: var(--space-xl);">No diagnostics match your search criteria.</div>`;
      return;
    }

    filteredList.forEach(({ company, mri }) => {
      const card = document.createElement('div');
      card.className = 'premium-editorial-card fade-in';
      
      let badgeClass = 'badge-blue';
      if (mri.validationState === 'Hypothesis') badgeClass = '';

      card.innerHTML = `
        <div class="premium-editorial-card-header">
          <div>
            <div class="premium-editorial-card-meta">${company.industry}</div>
            <h3 class="premium-editorial-card-title">${company.name}</h3>
          </div>
          <span class="badge ${badgeClass}">${mri.validationState}</span>
        </div>
        
        <div class="premium-editorial-card-content">
          <div style="margin-bottom: var(--space-xs);">
            <span class="monospace text-xs text-muted-color" style="display: block; font-size: 0.65rem;">PRIMARY CONSTRAINT</span>
            <span style="font-size: 0.95rem; font-weight: 500; color: var(--text-primary);">${mri.primaryConstraint}</span>
          </div>
          <div>
            <span class="monospace text-xs text-muted-color" style="display: block; font-size: 0.65rem;">ESTIMATED REVENUE</span>
            <span style="font-size: 0.85rem; color: var(--text-secondary);">${company.estimatedRevenue || 'N/A'}</span>
          </div>
        </div>

        <div class="premium-editorial-card-footer">
          <div>
            <span style="color: var(--text-muted);">CONFIDENCE: </span>
            <span style="color: var(--primary); font-weight: 600;">${mri.confidence}%</span>
          </div>
          <div style="color: var(--primary); font-weight: 600; font-size: 0.8rem;">
            Read Growth MRI &rarr;
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        window.location.href = `case-study.html?id=${mri.id}`;
      });

      resultsGrid.appendChild(card);
    });
  }

  // 2. Structural Paradoxes View Renderer
  function renderParadoxesView(query) {
    let filteredParadoxes = paradoxes.filter(paradox => {
      const relatedMRIs = mris.filter(m => m.primaryConstraint === paradox.name);
      const relatedCompanyIds = relatedMRIs.map(m => m.companyId);
      const relatedComps = companies.filter(c => relatedCompanyIds.includes(c.id));

      const matchesSearch = !query ||
        paradox.name.toLowerCase().includes(query) ||
        paradox.summary.toLowerCase().includes(query) ||
        relatedComps.some(c => c.name.toLowerCase().includes(query));
      
      return matchesSearch;
    });

    totalCountEl.innerText = paradoxes.length;
    showingCountEl.innerText = filteredParadoxes.length;

    if (filteredParadoxes.length === 0) {
      resultsGrid.innerHTML = `<div class="card text-center monospace text-xs text-muted-color" style="grid-column: 1 / -1; padding: var(--space-xl);">No structural paradoxes match your query.</div>`;
      return;
    }

    filteredParadoxes.forEach(paradox => {
      const relatedMRIs = mris.filter(m => m.primaryConstraint === paradox.name);
      const relatedCompanyIds = relatedMRIs.map(m => m.companyId);
      const relatedComps = companies.filter(c => relatedCompanyIds.includes(c.id));

      const card = document.createElement('div');
      card.className = 'premium-editorial-card fade-in';
      card.innerHTML = `
        <div class="premium-editorial-card-header">
          <div>
            <div class="premium-editorial-card-meta">PROPHECY &amp; CONSTRAINT</div>
            <h3 class="premium-editorial-card-title">${paradox.name}</h3>
          </div>
          <span class="badge badge-blue">${paradox.type || 'Paradox'}</span>
        </div>
        
        <div class="premium-editorial-card-content">
          <p class="text-sm" style="color: var(--text-secondary); margin: 0 0 var(--space-xs) 0; line-height: 1.45;">
            ${paradox.summary}
          </p>
          <div style="margin-top: var(--space-xs); border-top: 1px dashed var(--border-color); padding-top: var(--space-xs);">
            <span class="monospace text-xs text-muted-color" style="display: block; font-size: 0.65rem;">DIAGNOSED IN:</span>
            <ul style="margin: 4px 0 0 0; padding-left: 12px; font-size: 0.85rem; color: var(--text-primary); line-height: 1.45;">
              ${relatedComps.map(c => `<li>${c.name}</li>`).join('') || '<li style="color: var(--text-muted);">None diagnosed</li>'}
            </ul>
          </div>
        </div>

        <div class="premium-editorial-card-footer">
          <div>
            <span style="color: var(--text-muted);">AFFECTED: </span>
            <span style="color: var(--primary); font-weight: 600;">${relatedComps.length} Brands</span>
          </div>
          <div style="color: var(--primary); font-weight: 600; font-size: 0.8rem;">
            Explore &rarr;
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        // Toggle view back to companies and filter by this constraint
        currentView = 'companies';
        document.querySelectorAll('.view-toggle-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('[data-view="companies"]').classList.add('active');
        resultsTitle.innerText = 'Diagnostics Library';
        sortSelect.disabled = false;

        // Reset and set active filters
        Object.keys(activeFilters).forEach(key => activeFilters[key] = []);
        activeFilters.constraint = [paradox.name];
        
        // Sync check UI
        updateCheckboxes('desktop-filters-container', activeFilters);
        updateCheckboxes('mobile-filters-container', activeFilters);
        
        renderLibrary();
      });

      resultsGrid.appendChild(card);
    });
  }

  // 3. Industries View Renderer
  function renderIndustriesView(query) {
    const allIndustries = [...new Set(companies.map(c => c.industry))].filter(Boolean).sort();
    
    let filteredIndustries = allIndustries.filter(ind => {
      const indComps = companies.filter(c => c.industry === ind);
      const matchesSearch = !query ||
        ind.toLowerCase().includes(query) ||
        indComps.some(c => c.name.toLowerCase().includes(query));
      
      return matchesSearch;
    });

    totalCountEl.innerText = allIndustries.length;
    showingCountEl.innerText = filteredIndustries.length;

    if (filteredIndustries.length === 0) {
      resultsGrid.innerHTML = `<div class="card text-center monospace text-xs text-muted-color" style="grid-column: 1 / -1; padding: var(--space-xl);">No industries match your query.</div>`;
      return;
    }

    filteredIndustries.forEach(ind => {
      const indComps = companies.filter(c => c.industry === ind);

      const card = document.createElement('div');
      card.className = 'premium-editorial-card fade-in';
      card.innerHTML = `
        <div class="premium-editorial-card-header">
          <div>
            <div class="premium-editorial-card-meta">MARKET SECTOR</div>
            <h3 class="premium-editorial-card-title">${ind}</h3>
          </div>
          <span class="badge">Sector</span>
        </div>
        
        <div class="premium-editorial-card-content">
          <div style="margin-top: var(--space-xs);">
            <span class="monospace text-xs text-muted-color" style="display: block; font-size: 0.65rem;">STUDIED BRANDS:</span>
            <ul style="margin: 4px 0 0 0; padding-left: 12px; font-size: 0.85rem; color: var(--text-primary); line-height: 1.45;">
              ${indComps.map(c => `<li>${c.name}</li>`).join('') || '<li style="color: var(--text-muted);">None studied</li>'}
            </ul>
          </div>
        </div>

        <div class="premium-editorial-card-footer">
          <div>
            <span style="color: var(--text-muted);">AFFECTED: </span>
            <span style="color: var(--primary); font-weight: 600;">${indComps.length} Brands</span>
          </div>
          <div style="color: var(--primary); font-weight: 600; font-size: 0.8rem;">
            Explore &rarr;
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        // Toggle view back to companies and filter by this industry
        currentView = 'companies';
        document.querySelectorAll('.view-toggle-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('[data-view="companies"]').classList.add('active');
        resultsTitle.innerText = 'Diagnostics Library';
        sortSelect.disabled = false;

        // Reset and set active filters
        Object.keys(activeFilters).forEach(key => activeFilters[key] = []);
        activeFilters.industry = [ind];
        
        // Sync check UI
        updateCheckboxes('desktop-filters-container', activeFilters);
        updateCheckboxes('mobile-filters-container', activeFilters);
        
        renderLibrary();
      });

      resultsGrid.appendChild(card);
    });
  }
});
