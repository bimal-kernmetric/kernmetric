import { ROUTES } from '../components/components.js';
import { getCompanies } from './api/companies.js';
import { getMRIs } from './api/mri.js';
import { getParadoxes } from './api/paradoxes.js';

document.addEventListener('DOMContentLoaded', async () => {
  const companies = await getCompanies();
  const mris = await getMRIs();
  const paradoxes = await getParadoxes();

  // Mobile elements
  const resultsGrid = document.getElementById('library-results-grid');
  const searchInput = document.getElementById('lib-search-input');
  const sortSelect = document.getElementById('sort-select');
  const viewToggleButtons = document.querySelectorAll('.view-toggle-btn');
  const loadMoreBtn = document.getElementById('load-more-btn');

  if (!resultsGrid) return;

  // State
  let currentView = 'companies'; // 'companies', 'paradoxes', 'industries'
  let searchQuery = '';
  let currentSort = 'newest';
  let visibleLimit = 4; // baseline limit for pagination

  // Initial render
  renderLibrary();

  // 1. Search Query Bind
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase();
      visibleLimit = 4;
      renderLibrary();
    });
  }

  // 2. Sorting Bind
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderLibrary();
    });
  }

  // 3. View Mode Toggles
  viewToggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetView = btn.getAttribute('data-view');
      currentView = targetView;
      updateToggleState(currentView);
      visibleLimit = 4;
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

  // 4. Pagination Load More
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      visibleLimit += 4;
      renderLibrary();
    });
  }

  // Core render implementation
  function renderLibrary() {
    resultsGrid.innerHTML = '';
    let dataset = [];

    if (currentView === 'companies') {
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

      // Filter
      dataset = dataset.filter(item => 
        item.name.toLowerCase().includes(searchQuery) ||
        item.industry.toLowerCase().includes(searchQuery) ||
        (item.mri.primaryConstraint && item.mri.primaryConstraint.toLowerCase().includes(searchQuery))
      );

      // Sort
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

      dataset = dataset.filter(item => 
        item.name.toLowerCase().includes(searchQuery)
      );
    }

    // Render Slices
    const visibleItems = dataset.slice(0, visibleLimit);

    if (loadMoreBtn) {
      if (dataset.length > visibleLimit) {
        loadMoreBtn.style.display = 'inline-block';
      } else {
        loadMoreBtn.style.display = 'none';
      }
    }

    if (visibleItems.length === 0) {
      resultsGrid.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); padding: var(--space-xl) 0; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem;">
          No matching diagnostic files found.
        </div>
      `;
      return;
    }

    visibleItems.forEach(item => {
      const el = document.createElement('div');
      
      if (item.type === 'company') {
        el.className = 'mobile-editorial-card';
        el.innerHTML = `
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-sm);">
              <span class="monospace text-xs text-muted-color" style="text-transform: uppercase; font-size: 0.65rem; letter-spacing: 0.05em;">${item.industry.toUpperCase()}</span>
              <span class="badge ${item.mri.validationState === 'Validated' ? 'badge-blue' : ''}" style="font-size: 0.65rem;">${item.mri.validationState || 'Pending'}</span>
            </div>
            
            <h3 style="font-family: 'Source Serif 4', serif; font-size: 1.4rem; font-weight: 500; margin: 0 0 6px 0; color: var(--text-primary); border-bottom: none; padding-bottom: 0;">${item.name}</h3>
            
            <div style="margin-bottom: var(--space-md);">
              <span class="monospace text-xs text-primary-color" style="display: block; font-size: 0.60rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px;">PRIMARY CONSTRAINT</span>
              <strong style="font-family: 'Source Serif 4', serif; font-size: 1.1rem; color: var(--text-primary); font-weight: 500; display: block; line-height: 1.2;">${item.mri.primaryConstraint || 'Unmapped'}</strong>
              <p style="margin: var(--space-xxs) 0 0 0; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">${item.mri.summary || 'Diagnostic audit files loading.'}</p>
            </div>
          </div>

          <div style="margin-top: auto; border-top: 1px solid var(--border-color); padding-top: var(--space-sm); display: flex; justify-content: space-between; align-items: center; font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: var(--text-muted); width: 100%;">
            <div>
              <span style="display: block; font-size: 0.6rem; color: var(--text-muted);">REVENUE</span>
              <span style="font-weight: 600; color: var(--text-primary);">${item.estimatedRevenue}</span>
            </div>
            <div>
              <span style="display: block; font-size: 0.6rem; color: var(--text-muted);">CONFIDENCE</span>
              <span style="font-weight: 600; color: var(--text-primary);">${item.mri.confidence || 0}%</span>
            </div>
            <a href="${ROUTES.caseStudy}?id=${item.mriId}" style="color: var(--primary); font-weight: 600; font-size: 0.8rem;">Read MRI &rarr;</a>
          </div>
        `;
        
        el.addEventListener('click', (e) => {
          if (!e.target.closest('a')) {
            window.location.href = `${ROUTES.caseStudy}?id=${item.mriId}`;
          }
        });

      } else if (item.type === 'paradox') {
        el.className = 'mobile-editorial-card';
        el.innerHTML = `
          <div style="display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
            <div>
              <span class="monospace text-xs text-primary-color" style="text-transform: uppercase; font-size: 0.65rem; letter-spacing: 0.05em; display: block; margin-bottom: var(--space-xs);">STRUCTURAL LIMITATION</span>
              <h3 style="font-family: 'Source Serif 4', serif; font-size: 1.4rem; font-weight: 500; margin: 0 0 var(--space-xs) 0; color: var(--text-primary); border-bottom: none; padding-bottom: 0;">${item.name}</h3>
              <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">${item.description}</p>
            </div>
            <div style="margin-top: var(--space-md); border-top: 1px solid var(--border-color); padding-top: var(--space-sm); color: var(--primary); font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; font-weight: 600;">
              Explore Paradox &rarr;
            </div>
          </div>
        `;
        el.addEventListener('click', () => {
          window.location.href = `${ROUTES.paradoxes}?id=${item.id}`;
        });

      } else if (item.type === 'industry') {
        el.className = 'mobile-editorial-card';
        el.innerHTML = `
          <div style="display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
            <div>
              <span class="monospace text-xs text-primary-color" style="text-transform: uppercase; font-size: 0.65rem; letter-spacing: 0.05em; display: block; margin-bottom: var(--space-xs);">INDUSTRY COHORT</span>
              <h3 style="font-family: 'Source Serif 4', serif; font-size: 1.4rem; font-weight: 500; margin: 0 0 var(--space-xs) 0; color: var(--text-primary); border-bottom: none; padding-bottom: 0;">${item.name}</h3>
              <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">
                Studied Brands: <strong>${item.companies.map(c => c.name).join(', ')}</strong>
              </p>
            </div>
            <div style="margin-top: var(--space-md); border-top: 1px solid var(--border-color); padding-top: var(--space-sm); color: var(--primary); font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; font-weight: 600;">
              Browse Cohort &rarr;
            </div>
          </div>
        `;
        el.addEventListener('click', () => {
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
