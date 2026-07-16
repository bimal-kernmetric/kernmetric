import { getCompanies } from './api/companies.js';
import { getMRIs } from './api/mri.js';
import { getParadoxes } from './api/paradoxes.js';

document.addEventListener('DOMContentLoaded', async () => {
  const companies = await getCompanies();
  const mris = await getMRIs();
  const paradoxes = await getParadoxes();

  // Page Elements
  const resultsGrid = document.getElementById('library-results-grid');
  const searchInput = document.getElementById('lib-search-input');
  const sortSelect = document.getElementById('sort-select');
  const viewToggleButtons = document.querySelectorAll('.view-toggle-btn');
  const loadMoreBtn = document.getElementById('load-more-btn');

  if (!resultsGrid) return;

  // State Variables
  let currentView = 'companies'; // 'companies', 'paradoxes', 'industries'
  let searchQuery = '';
  let currentSort = 'newest';
  let visibleLimit = 4; // Pagination baseline limit

  // Handle URL redirect pre-check state triggers (e.g. ?view=companies)
  const urlParams = new URLSearchParams(window.location.search);
  const viewParam = urlParams.get('view');
  if (viewParam && ['companies', 'paradoxes', 'industries'].includes(viewParam)) {
    currentView = viewParam;
    updateToggleState(currentView);
  }

  // Initial render
  renderLibrary();

  // 1. Search trigger bind
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase();
      visibleLimit = 4; // reset pagination on search query shifts
      renderLibrary();
    });
  }

  // 2. Sorting trigger bind
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderLibrary();
    });
  }

  // 3. View mode triggers bind
  viewToggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetView = btn.getAttribute('data-view');
      currentView = targetView;
      updateToggleState(currentView);
      visibleLimit = 4; // reset pagination on view change
      renderLibrary();
    });
  });

  function updateToggleState(activeView) {
    viewToggleButtons.forEach(b => {
      b.classList.remove('active');
      b.style.color = 'var(--text-muted)';
      b.style.fontWeight = '400';
      if (b.getAttribute('data-view') === activeView) {
        b.classList.add('active');
        b.style.color = 'var(--primary)';
        b.style.fontWeight = '600';
      }
    });
  }

  // 4. Pagination / Load More bind
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      visibleLimit += 4;
      renderLibrary();
    });
  }

  // Render Logic
  function renderLibrary() {
    resultsGrid.innerHTML = '';
    let dataset = [];

    if (currentView === 'companies') {
      // Loop companies & map to MRIs
      dataset = companies.map(company => {
        const mri = mris.find(m => m.companyId === company.id) || {};
        return {
          type: 'company',
          id: company.id,
          name: company.name,
          industry: company.industry,
          businessModel: company.businessModel,
          estimatedRevenue: company.estimatedRevenue,
          mri: mri,
          mriId: mri.id || `mri_${company.id.replace('company_', '')}_v1`
        };
      });

      // Filter dataset by search query
      dataset = dataset.filter(item => 
        item.name.toLowerCase().includes(searchQuery) ||
        item.industry.toLowerCase().includes(searchQuery) ||
        (item.mri.primaryConstraint && item.mri.primaryConstraint.toLowerCase().includes(searchQuery))
      );

      // Sort dataset
      if (currentSort === 'newest') {
        dataset.sort((a, b) => new Date(b.mri.lastUpdated || '2026-01-01') - new Date(a.mri.lastUpdated || '2026-01-01'));
      } else if (currentSort === 'confidence') {
        dataset.sort((a, b) => (b.mri.confidence || 0) - (a.mri.confidence || 0));
      } else if (currentSort === 'updated') {
        dataset.sort((a, b) => new Date(b.mri.lastUpdated || '2026-01-01') - new Date(a.mri.lastUpdated || '2026-01-01'));
      } else if (currentSort === 'industry') {
        dataset.sort((a, b) => a.industry.localeCompare(b.industry));
      }

    } else if (currentView === 'paradoxes') {
      dataset = paradoxes.map(p => ({
        type: 'paradox',
        id: p.id,
        name: p.name,
        description: p.description,
        taxonomy: p.taxonomy
      }));

      // Filter paradoxes by search query
      dataset = dataset.filter(item => 
        item.name.toLowerCase().includes(searchQuery) ||
        item.description.toLowerCase().includes(searchQuery)
      );

      dataset.sort((a, b) => a.name.localeCompare(b.name));

    } else if (currentView === 'industries') {
      const industries = [...new Set(companies.map(c => c.industry))].filter(Boolean).sort();
      dataset = industries.map(ind => {
        const indComps = companies.filter(c => c.industry === ind);
        return {
          type: 'industry',
          name: ind,
          companies: indComps
        };
      });

      // Filter industries by search query
      dataset = dataset.filter(item => 
        item.name.toLowerCase().includes(searchQuery)
      );
    }

    // Render sliced list according to pagination limits
    const visibleItems = dataset.slice(0, visibleLimit);
    
    // Toggle Load More button display
    if (loadMoreBtn) {
      if (dataset.length > visibleLimit) {
        loadMoreBtn.style.display = 'inline-block';
      } else {
        loadMoreBtn.style.display = 'none';
      }
    }

    if (visibleItems.length === 0) {
      resultsGrid.innerHTML = `
        <div style="grid-column: span 2; text-align: center; color: var(--text-muted); padding: var(--space-xl) 0; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem;">
          No matching diagnostic files found.
        </div>
      `;
      return;
    }

    visibleItems.forEach(item => {
      const el = document.createElement('div');
      
      if (item.type === 'company') {
        el.className = 'editorial-card';
        el.innerHTML = `
          <div style="text-align: left;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-sm);">
              <span class="monospace text-xs text-muted-color" style="text-transform: uppercase; font-size: 0.65rem; letter-spacing: 0.05em;">${item.industry.toUpperCase()}</span>
              <span class="badge ${item.mri.validationState === 'Validated' ? 'badge-blue' : ''}" style="font-size: 0.65rem;">${item.mri.validationState || 'Pending'}</span>
            </div>
            
            <h3 style="font-family: 'Source Serif 4', serif; font-size: 1.6rem; font-weight: 500; margin: 0 0 6px 0; color: var(--text-primary); border-bottom: none; padding-bottom: 0;">${item.name}</h3>
            
            <div style="margin-bottom: var(--space-md); text-align: left;">
              <span class="monospace text-xs text-primary-color" style="display: block; font-size: 0.60rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px;">PRIMARY CONSTRAINT</span>
              <strong style="font-family: 'Source Serif 4', serif; font-size: 1.15rem; color: var(--text-primary); font-weight: 500; display: block; line-height: 1.2;">${item.mri.primaryConstraint || 'Unmapped'}</strong>
              <p style="margin: var(--space-xxs) 0 0 0; font-size: 0.9rem; color: var(--text-secondary); line-height: 1.45;">${item.mri.summary || 'Diagnostic audit files loading.'}</p>
            </div>
          </div>

          <div style="margin-top: auto; border-top: 1px solid var(--border-color); padding-top: var(--space-sm); display: flex; justify-content: space-between; align-items: center; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: var(--text-muted); width: 100%;">
            <div style="text-align: left;">
              <span style="display: block; font-size: 0.65rem; color: var(--text-muted);">EST_REVENUE</span>
              <span style="font-weight: 600; color: var(--text-primary);">${item.estimatedRevenue}</span>
            </div>
            <div style="text-align: left;">
              <span style="display: block; font-size: 0.65rem; color: var(--text-muted);">CONFIDENCE</span>
              <span style="font-weight: 600; color: var(--text-primary);">${item.mri.confidence || 0}%</span>
            </div>
            <a href="case-study.html?id=${item.mriId}" style="color: var(--primary); font-weight: 600; font-size: 0.8rem; text-decoration: none;">Read Growth MRI &rarr;</a>
          </div>
        `;
        
        el.addEventListener('click', (e) => {
          if (!e.target.closest('a')) {
            window.location.href = `case-study.html?id=${item.mriId}`;
          }
        });

      } else if (item.type === 'paradox') {
        el.className = 'editorial-card';
        el.innerHTML = `
          <div style="text-align: left; height: 100%; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <span class="monospace text-xs text-primary-color" style="text-transform: uppercase; font-size: 0.65rem; letter-spacing: 0.05em; display: block; margin-bottom: var(--space-xs);">STRUCTURAL LIMITATION</span>
              <h3 style="font-family: 'Source Serif 4', serif; font-size: 1.5rem; font-weight: 500; margin: 0 0 var(--space-xs) 0; color: var(--text-primary); border-bottom: none; padding-bottom: 0;">${item.name}</h3>
              <p style="margin: 0; font-size: 0.9rem; color: var(--text-secondary); line-height: 1.45;">${item.description}</p>
            </div>
            <div style="margin-top: var(--space-md); border-top: 1px solid var(--border-color); padding-top: var(--space-sm); color: var(--primary); font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; font-weight: 600;">
              Explore Paradox &rarr;
            </div>
          </div>
        `;
        el.addEventListener('click', () => {
          window.location.href = `paradoxes.html?id=${item.id}`;
        });

      } else if (item.type === 'industry') {
        el.className = 'editorial-card';
        el.innerHTML = `
          <div style="text-align: left; height: 100%; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <span class="monospace text-xs text-primary-color" style="text-transform: uppercase; font-size: 0.65rem; letter-spacing: 0.05em; display: block; margin-bottom: var(--space-xs);">INDUSTRY COHORT</span>
              <h3 style="font-family: 'Source Serif 4', serif; font-size: 1.5rem; font-weight: 500; margin: 0 0 var(--space-xs) 0; color: var(--text-primary); border-bottom: none; padding-bottom: 0;">${item.name}</h3>
              <p style="margin: 0; font-size: 0.9rem; color: var(--text-secondary); line-height: 1.45;">
                Studied Brands: <strong>${item.companies.map(c => c.name).join(', ')}</strong>
              </p>
            </div>
            <div style="margin-top: var(--space-md); border-top: 1px solid var(--border-color); padding-top: var(--space-sm); color: var(--primary); font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; font-weight: 600;">
              Browse Cohort &rarr;
            </div>
          </div>
        `;
        el.addEventListener('click', () => {
          // Switch to companies view with text pre-filtered
          searchInput.value = item.name;
          searchQuery = item.name.toLowerCase();
          currentView = 'companies';
          updateToggleState('companies');
          visibleLimit = 4;
          renderLibrary();
        });
      }

      resultsGrid.appendChild(el);
    });
  }
});
