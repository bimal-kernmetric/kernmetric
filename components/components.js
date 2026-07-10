import { searchEntities } from '../scripts/domain/search.js';
import { CONFIG } from '../config/config.js';

// Resolve links dynamically based on path context
const isSubpage = window.location.pathname.includes('/pages/');
const homeLink = isSubpage ? '../index.html' : 'index.html';
const resolvePage = (fileName) => {
  return isSubpage ? fileName : `pages/${fileName}`;
};
const resolveAsset = (assetName) => {
  return isSubpage ? `../${assetName}` : assetName;
};

class KernHeader extends HTMLElement {
  connectedCallback() {
    const activePath = window.location.pathname;
    
    const getActive = (pageName) => {
      if (activePath.includes(pageName)) return 'active';
      return '';
    };

    this.innerHTML = `
      <header>
        <div class="header-container">
          <a href="${homeLink}" class="logo-link">
            <img src="${resolveAsset('assets/logo.svg')}" alt="KernMetric" class="logo-img">
          </a>
          
          <nav class="nav-links">
            <a href="${resolvePage('methodology.html')}" class="nav-link ${getActive('methodology')}">Methodology</a>
            <a href="${resolvePage('growth-mri.html')}" class="nav-link ${getActive('growth-mri')}">Growth MRI™</a>
            <a href="${resolvePage('case-studies.html')}" class="nav-link ${getActive('case-studies')}">Case Studies</a>
            <a href="${resolvePage('research.html')}" class="nav-link ${getActive('research')}">Research</a>
            <a href="${resolvePage('about.html')}" class="nav-link ${getActive('about')}">About</a>
          </nav>
          
          <div class="header-actions">
            <a href="${resolvePage('contact.html')}" class="header-cta">Book a Diagnostic →</a>
            <button class="mobile-toggle" aria-label="Toggle navigation menu" aria-expanded="false">
              <span class="hamburger-bar"></span>
              <span class="hamburger-bar"></span>
              <span class="hamburger-bar"></span>
            </button>
          </div>
        </div>
        
        <div class="mobile-nav-dropdown">
          <a href="${resolvePage('methodology.html')}" class="mobile-nav-link ${getActive('methodology')}">Methodology</a>
          <a href="${resolvePage('growth-mri.html')}" class="mobile-nav-link ${getActive('growth-mri')}">Growth MRI™</a>
          <a href="${resolvePage('case-studies.html')}" class="mobile-nav-link ${getActive('case-studies')}">Case Studies</a>
          <a href="${resolvePage('research.html')}" class="mobile-nav-link ${getActive('research')}">Research</a>
          <a href="${resolvePage('about.html')}" class="mobile-nav-link ${getActive('about')}">About</a>
          <a href="${resolvePage('contact.html')}" class="mobile-nav-cta">Book a Diagnostic →</a>
        </div>
      </header>
    `;

    // Bind mobile menu toggle
    const toggleBtn = this.querySelector('.mobile-toggle');
    const dropdown = this.querySelector('.mobile-nav-dropdown');
    
    if (toggleBtn && dropdown) {
      toggleBtn.addEventListener('click', () => {
        const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
        toggleBtn.setAttribute('aria-expanded', !isExpanded);
        dropdown.classList.toggle('open');
      });

      // Automatically reset states when scaling up viewport
      window.addEventListener('resize', () => {
        if (window.innerWidth >= 1024) {
          toggleBtn.setAttribute('aria-expanded', 'false');
          dropdown.classList.remove('open');
        }
      });
    }
  }
}

class KernFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer class="section border-t" style="padding-top: var(--space-xl); padding-bottom: var(--space-xl); background-color: var(--bg-secondary);">
        <div class="container flex flex-col md-row justify-between items-center gap-lg">
          <div style="display: flex; flex-direction: column; gap: var(--space-xs);">
            <a href="${homeLink}" class="logo" style="display: flex; align-items: center;">
              <img src="${resolveAsset('assets/logo.svg')}" alt="KernMetric" style="height: 42px; width: auto; display: block;" class="logo-img">
            </a>
            <p class="text-xs" style="margin: 0; color: var(--text-muted);">
              ${CONFIG.tagline} • Platform version ${CONFIG.version}
            </p>
          </div>
          <div class="flex gap-md" style="font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; align-items: center;">
            <a href="${resolvePage('about.html')}" style="color: var(--text-secondary);">Founder</a>
            <a href="https://linkedin.com" target="_blank" style="color: var(--text-secondary);">LinkedIn</a>
            <a href="${resolvePage('contact.html')}" style="color: var(--text-secondary);">Privacy</a>
            <a href="${resolvePage('contact.html')}" style="color: var(--text-secondary);">Terms</a>
            <button class="theme-toggle" aria-label="Toggle theme" id="footer-theme-toggle" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; padding: 0 4px; display: inline-flex; align-items: center; font-family: 'JetBrains Mono', monospace; font-size: 0.75rem;">
              Theme
            </button>
          </div>
          <p class="text-xs" style="margin: 0; color: var(--text-muted); font-family: 'JetBrains Mono', monospace;">
            © 2026 ${CONFIG.siteName} LLC. All rights reserved.
          </p>
        </div>
      </footer>
    `;

    const toggleBtn = this.querySelector('#footer-theme-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
      });
    }
  }
}

class KernSearch extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="search-modal" id="search-overlay">
        <div class="search-container">
          <div class="search-input-wrapper">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" style="margin-right: var(--space-xs);"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" class="search-input" id="search-query-field" placeholder="Search constraints, paradoxes, brands, or research..." autocomplete="off">
            <button class="btn btn-secondary btn-sm" id="search-close-btn" style="padding: 2px 8px; font-family: 'JetBrains Mono', monospace; font-size: 0.7rem;">ESC</button>
          </div>
          <div class="search-results" id="search-results-list">
            <div style="padding: var(--space-md); text-align: center; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; font-size: 0.8rem;">
              Type to begin searching... Try 'Friction', 'Sleep', or 'COGS'
            </div>
          </div>
        </div>
      </div>
    `;

    this.modal = this.querySelector('#search-overlay');
    this.input = this.querySelector('#search-query-field');
    this.resultsContainer = this.querySelector('#search-results-list');
    this.closeBtn = this.querySelector('#search-close-btn');

    this.input.addEventListener('keyup', (e) => this.handleSearch(e.target.value));
    this.closeBtn.addEventListener('click', () => this.close());
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        this.open();
      }
    });
  }

  open() {
    this.modal.style.display = 'flex';
    this.input.focus();
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.modal.style.display = 'none';
    this.input.value = '';
    this.resultsContainer.innerHTML = `
      <div style="padding: var(--space-md); text-align: center; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; font-size: 0.8rem;">
        Type to begin searching... Try 'Friction', 'Sleep', or 'COGS'
      </div>
    `;
    document.body.style.overflow = '';
  }

  async handleSearch(val) {
    if (!val.trim()) {
      this.resultsContainer.innerHTML = `
        <div style="padding: var(--space-md); text-align: center; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; font-size: 0.8rem;">
          Type to begin searching... Try 'Friction', 'Sleep', or 'COGS'
        </div>
      `;
      return;
    }

    const items = await searchEntities(val);
    if (items.length === 0) {
      this.resultsContainer.innerHTML = `
        <div style="padding: var(--space-md); text-align: center; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; font-size: 0.8rem;">
          No matching entities found for "${val}"
        </div>
      `;
      return;
    }

    this.resultsContainer.innerHTML = '';
    items.forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.className = 'search-item';
      
      const tagsHtml = item.tags.map(t => `<span class="badge text-xs" style="margin-right: 4px; margin-top: 4px;">${t}</span>`).join('');
      
      itemEl.innerHTML = `
        <div class="flex justify-between items-center">
          <span style="font-family: 'Source Serif 4', serif; font-size: 1.1rem; font-weight: 500; color: var(--text-primary);">${item.title}</span>
          <span class="badge badge-blue" style="font-size: 0.65rem;">${item.type}</span>
        </div>
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; color: var(--text-muted); margin: 2px 0;">${item.subtitle}</div>
        <p style="font-size: 0.825rem; margin: 4px 0 8px 0; line-height: 1.4; color: var(--text-secondary);">${item.description}</p>
        <div class="flex flex-wrap">${tagsHtml}</div>
      `;
      
      itemEl.addEventListener('click', () => {
        const targetUrl = isSubpage ? item.url : `pages/${item.url}`;
        window.location.href = targetUrl;
        this.close();
      });
      
      this.resultsContainer.appendChild(itemEl);
    });
  }
}

customElements.define('kern-header', KernHeader);
customElements.define('kern-footer', KernFooter);
customElements.define('kern-search', KernSearch);
