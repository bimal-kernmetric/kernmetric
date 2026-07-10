import { getCompanies } from './api/companies.js';
import { getMRIs } from './api/mri.js';
import { getParadoxes } from './api/paradoxes.js';

document.addEventListener('DOMContentLoaded', async () => {
  const companies = await getCompanies();
  const mris = await getMRIs();
  const paradoxes = await getParadoxes();

  // Mobile elements
  const resultsGrid = document.getElementById('library-results-grid');
  const showingCountEl = document.getElementById('showing-count');
  const searchInput = document.getElementById('lib-search-input');
  
  const viewCompaniesBtn = document.getElementById('view-companies-btn');
  const viewParadoxesBtn = document.getElementById('view-paradoxes-btn');
  const viewIndustriesBtn = document.getElementById('view-industries-btn');

  const mobileModal = document.getElementById('mobile-filter-modal');
  const mobileFilterBtn = document.getElementById('mobile-filter-trigger-btn');
  const mobileCloseBtn = document.getElementById('mobile-filter-close-btn');
  const mobileClearBtn = document.getElementById('mobile-filter-clear-btn');
  const mobileApplyBtn = document.getElementById('mobile-filter-apply-btn');
  const mobileFiltersContainer = document.getElementById('mobile-filters-container');

  if (!resultsGrid || !mobileModal || !mobileFilterBtn || !mobileCloseBtn || !mobileClearBtn || !mobileApplyBtn || !mobileFiltersContainer) return;

  // State
  let currentView = 'companies'; // 'companies', 'paradoxes', 'industries'
  let searchQuery = '';
  
  let activeFilters = {
    industry: [],
    businessModel: [],
    constraint: [],
    validation: [],
    confidence: [],
    growthArea: []
  };

  // Temp buffer state for bottom-sheet filters
  let tempFilters = {
    industry: [],
    businessModel: [],
    constraint: [],
    validation: [],
    confidence: [],
    growthArea: []
  };

  // Setup view toggle clicks
  viewCompaniesBtn.addEventListener('click', () => swapView('companies'));
  viewParadoxesBtn.addEventListener('click', () => swapView('paradoxes'));
  viewIndustriesBtn.addEventListener('click', () => swapView('industries'));

  function swapView(view) {
    currentView = view;
    [viewCompaniesBtn, viewParadoxesBtn, viewIndustriesBtn].forEach(b => b.classList.remove('active'));
    if (view === 'companies') viewCompaniesBtn.classList.add('active');
    if (view === 'paradoxes') viewParadoxesBtn.classList.add('active');
    if (view === 'industries') viewIndustriesBtn.classList.add('active');
    renderLibrary();
  }

  // Bind search query input
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    renderLibrary();
  });

  // Bind modal drawer trigger triggers
  mobileFilterBtn.addEventListener('click', () => {
    // Sync active filters to temp filter state
    tempFilters = JSON.parse(JSON.stringify(activeFilters));
    updateCheckboxes();
    mobileModal.classList.add('open');
  });

  mobileCloseBtn.addEventListener('click', () => {
    mobileModal.classList.remove('open');
  });

  mobileApplyBtn.addEventListener('click', () => {
    // Copy temp filters to active filters and render
    activeFilters = JSON.parse(JSON.stringify(tempFilters));
    renderLibrary();
    mobileModal.classList.remove('open');
  });

  mobileClearBtn.addEventListener('click', () => {
    Object.keys(tempFilters).forEach(key => tempFilters[key] = []);
    document.querySelectorAll('#mobile-filters-container .filter-checkbox').forEach(cb => cb.checked = false);
    activeFilters = JSON.parse(JSON.stringify(tempFilters));
    renderLibrary();
    mobileModal.classList.remove('open');
  });

  // Checkboxes sync helper
  function updateCheckboxes() {
    mobileFiltersContainer.querySelectorAll('.filter-checkbox').forEach(cb => {
      const key = cb.getAttribute('data-filter-key');
      const val = cb.value;
      cb.checked = tempFilters[key].includes(val);
    });
  }

  // Build filter groups dynamically
  function renderFilters() {
    mobileFiltersContainer.innerHTML = '';

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
        label.style.padding = '8px 0'; // large touch targets

        const val = opt.value || opt;
        const display = opt.label || opt;

        label.innerHTML = `
          <input type="checkbox" class="filter-checkbox" data-filter-key="${key}" value="${val}" style="width: 20px; height: 20px; margin-right: 8px;">
          <span>${display}</span>
        `;
        content.appendChild(label);
      });

      // Checkbox click bindings
      content.querySelectorAll('.filter-checkbox').forEach(cb => {
        cb.addEventListener('change', () => {
          if (cb.checked) {
            tempFilters[key].push(cb.value);
          } else {
            tempFilters[key] = tempFilters[key].filter(v => v !== cb.value);
          }
        });
      });

      header.addEventListener('click', (e) => {
        e.preventDefault();
        group.classList.toggle('collapsed');
      });

      group.appendChild(header);
      group.appendChild(content);
      mobileFiltersContainer.appendChild(group);
    }

    const industriesList = [...new Set(companies.map(c => c.industry))].filter(Boolean).sort();
    const modelsList = [...new Set(companies.map(c => c.businessModel))].filter(Boolean).sort();
    const constraintsList = [...new Set(mris.map(m => m.primaryConstraint))].filter(Boolean).sort();
    const validationStates = [...new Set(mris.map(m => m.validationState))].filter(Boolean).sort();
    const confidenceScores = ["80%+", "90%+"];
    const growthAreas = [...new Set(companies.flatMap(c => c.tags))].filter(Boolean).sort();

    createFilterGroup("Industry", "industry", industriesList);
    createFilterGroup("Business Model", "businessModel", modelsList);
    createFilterGroup("Primary Constraint", "constraint", constraintsList);
    createFilterGroup("Validation Status", "validation", validationStates);
    createFilterGroup("Confidence Range", "confidence", confidenceScores);
    createFilterGroup("Growth Area Tag", "growthArea", growthAreas);
  }

  // Core library rendering engine
  function renderLibrary() {
    resultsGrid.innerHTML = '';
    let filteredCount = 0;

    if (currentView === 'companies') {
      companies.forEach(company => {
        const mri = mris.find(m => m.companyId === company.id) || {};
        
        // Apply filters
        const matchesIndustry = activeFilters.industry.length === 0 || activeFilters.industry.includes(company.industry);
        const matchesModel = activeFilters.businessModel.length === 0 || activeFilters.businessModel.includes(company.businessModel);
        const matchesConstraint = activeFilters.constraint.length === 0 || activeFilters.constraint.includes(mri.primaryConstraint);
        const matchesValidation = activeFilters.validation.length === 0 || activeFilters.validation.includes(mri.validationState);
        
        let matchesConfidence = true;
        if (activeFilters.confidence.length > 0) {
          const val = mri.confidence || 0;
          matchesConfidence = activeFilters.confidence.some(confOpt => {
            if (confOpt === '90%+') return val >= 90;
            if (confOpt === '80%+') return val >= 80;
            return true;
          });
        }

        const matchesGrowthArea = activeFilters.growthArea.length === 0 || company.tags.some(tag => activeFilters.growthArea.includes(tag));
        const matchesSearch = company.name.toLowerCase().includes(searchQuery) || company.industry.toLowerCase().includes(searchQuery) || (mri.primaryConstraint && mri.primaryConstraint.toLowerCase().includes(searchQuery));

        if (matchesIndustry && matchesModel && matchesConstraint && matchesValidation && matchesConfidence && matchesGrowthArea && matchesSearch) {
          filteredCount++;
          
          const card = document.createElement('div');
          card.className = 'km-company-card';
          card.style.width = '100%';
          card.style.cursor = 'pointer';
          card.style.padding = 'var(--space-md)';
          card.style.display = 'flex';
          card.style.flexDirection = 'column';
          card.style.gap = 'var(--space-xs)';
          card.style.textAlign = 'left';

          card.innerHTML = `
            <div class="km-company-card-header" style="margin-bottom: 2px;">
              <div>
                <strong style="font-size: 1.1rem; color: var(--text-primary);">${company.name}</strong>
                <span class="monospace text-xs text-muted-color" style="display: block; font-size: 0.65rem; margin-top: 2px;">${company.industry} • ${company.businessModel}</span>
              </div>
              <span class="badge ${mri.validationState === 'Validated' ? 'badge-blue' : ''}" style="font-size: 0.65rem;">${mri.validationState || 'Pending'}</span>
            </div>
            
            <div style="font-size: 0.85rem; line-height: 1.45;">
              <span class="monospace text-xs text-primary-color" style="display: block; font-size: 0.6rem; text-transform: uppercase;">PRIMARY CONSTRAINT</span>
              <strong style="color: var(--text-primary);">${mri.primaryConstraint || 'Unmapped'}</strong>
              <p style="margin: 4px 0 0 0; color: var(--text-secondary);">${mri.summary || 'Audit in progress.'}</p>
            </div>

            <div class="flex justify-between items-center" style="border-top: 1px dashed var(--border-color); padding-top: var(--space-xs); margin-top: auto; font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: var(--text-muted);">
              <span>Rev: ${company.estimatedRevenue} • Conf: ${mri.confidence || 0}%</span>
              <a href="case-study.html?id=${mri.id}" style="color: var(--primary); font-weight: 600;">Read Growth MRI &rarr;</a>
            </div>
          `;

          card.addEventListener('click', (e) => {
            if (!e.target.closest('a')) {
              window.location.href = `case-study.html?id=${mri.id}`;
            }
          });
          resultsGrid.appendChild(card);
        }
      });
    } else if (currentView === 'paradoxes') {
      paradoxes.forEach(paradox => {
        const matchesSearch = paradox.name.toLowerCase().includes(searchQuery) || paradox.description.toLowerCase().includes(searchQuery);
        if (matchesSearch) {
          filteredCount++;
          const card = document.createElement('div');
          card.className = 'km-constraint-card';
          card.style.width = '100%';
          card.style.cursor = 'pointer';
          card.style.padding = 'var(--space-md)';
          card.style.textAlign = 'left';

          card.innerHTML = `
            <div>
              <div class="monospace text-xs text-muted-color" style="font-size: 0.65rem; text-transform: uppercase;">STRUCTURAL LIMIT</div>
              <h3 style="margin: 4px 0 0 0; font-family: 'Source Serif 4', serif; font-size: 1.25rem; color: var(--text-primary);">${paradox.name}</h3>
            </div>
            <p class="text-xs" style="color: var(--text-secondary); margin: var(--space-xs) 0;">
              ${paradox.description}
            </p>
            <div style="border-top: 1px dashed var(--border-color); padding-top: var(--space-xs); margin-top: auto; color: var(--primary); font-size: 0.75rem; font-family: 'JetBrains Mono', monospace; font-weight: 600;">
              Explore Paradox Details &rarr;
            </div>
          `;
          card.addEventListener('click', () => {
            window.location.href = `paradoxes.html?id=${paradox.id}`;
          });
          resultsGrid.appendChild(card);
        }
      });
    } else if (currentView === 'industries') {
      const industries = [...new Set(companies.map(c => c.industry))].filter(Boolean).sort();
      industries.forEach(indName => {
        const matchesSearch = indName.toLowerCase().includes(searchQuery);
        if (matchesSearch) {
          filteredCount++;
          const indComps = companies.filter(c => c.industry === indName);
          const card = document.createElement('div');
          card.className = 'km-framework-card';
          card.style.width = '100%';
          card.style.cursor = 'pointer';
          card.style.padding = 'var(--space-md)';
          card.style.textAlign = 'left';

          card.innerHTML = `
            <div>
              <div class="monospace text-xs text-primary-color" style="font-weight: 600; font-size: 0.65rem;">INDUSTRY SPHERE</div>
              <h3 style="margin: 4px 0 0 0; font-family: 'Source Serif 4', serif; font-size: 1.25rem; color: var(--text-primary);">${indName}</h3>
            </div>
            <p class="text-xs" style="color: var(--text-secondary); margin: var(--space-xs) 0;">
              Diagnosed Brands in cohort: <strong>${indComps.map(c => c.name).join(', ')}</strong>
            </p>
            <div style="border-top: 1px dashed var(--border-color); padding-top: var(--space-xs); margin-top: auto; color: var(--primary); font-size: 0.75rem; font-family: 'JetBrains Mono', monospace; font-weight: 600;">
              Browse Industry Cohort &rarr;
            </div>
          `;
          card.addEventListener('click', () => {
            // Apply industry filter and switch to companies view
            activeFilters.industry = [indName];
            swapView('companies');
          });
          resultsGrid.appendChild(card);
        }
      });
    }

    showingCountEl.innerText = filteredCount;
  }

  // Initialize filters and list
  renderFilters();
  renderLibrary();
});
