import { searchEntities } from '../scripts/domain/search.js';
import { CONFIG } from '../config/config.js';

export const ROUTES = {
  home: 'index.html',
  methodology: 'methodology.html',
  growthMRI: 'growth-mri.html',
  caseStudies: 'case-studies.html',
  research: 'research.html',
  about: 'about.html',
  contact: 'contact.html',
  paradoxes: 'paradoxes.html',
  atlas: 'atlas.html',
  knowledgeGraph: 'knowledge-graph.html',
  admin: 'admin.html',
  dashboard: 'dashboard.html',
  login: 'login.html',
  client: 'client.html',
  designSystem: 'design-system.html',
  mobileDiagnostics: 'mobile-diagnostics.html',
  caseStudy: 'case-study.html',
  experiments: 'experiments.html'
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
          <a href="${ROUTES.home}" class="logo-link">
            <img src="assets/logo.svg" alt="KernMetric" class="logo-img">
          </a>
          
          <nav class="nav-links">
            <a href="${ROUTES.home}" class="nav-link ${activePath.endsWith('index.html') || activePath.endsWith('/') ? 'active' : ''}">Platform</a>
            <a href="${ROUTES.caseStudies}" class="nav-link ${getActive('case-studies.html') ? 'active' : ''}">Diagnostics</a>
            <a href="${ROUTES.research}" class="nav-link ${getActive('research.html')}">Research</a>
            <a href="${ROUTES.methodology}" class="nav-link ${getActive('methodology.html')}">Frameworks</a>
          </nav>
          
          <div class="header-actions">
            <a href="https://cal.com/bimal-kernmetrics" target="_blank" class="header-cta">Book a Diagnostic →</a>
            <button class="mobile-toggle" aria-label="Toggle navigation menu" aria-expanded="false">
              <span class="hamburger-bar"></span>
              <span class="hamburger-bar"></span>
              <span class="hamburger-bar"></span>
            </button>
          </div>
        </div>
        
        <div class="mobile-nav-dropdown">
          <a href="${ROUTES.home}" class="mobile-nav-link ${activePath.endsWith('index.html') || activePath.endsWith('/') ? 'active' : ''}">Platform</a>
          <a href="${ROUTES.caseStudies}" class="mobile-nav-link ${getActive('case-studies.html') ? 'active' : ''}">Diagnostics</a>
          <a href="${ROUTES.research}" class="mobile-nav-link ${getActive('research.html')}">Research</a>
          <a href="${ROUTES.methodology}" class="mobile-nav-link ${getActive('methodology.html')}">Frameworks</a>
          <a href="https://cal.com/bimal-kernmetrics" target="_blank" class="mobile-nav-cta">Book Growth MRI™</a>
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
        if (window.innerWidth >= 1100) {
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
            <a href="${ROUTES.home}" class="logo" style="display: flex; align-items: center;">
              <img src="assets/logo.svg" alt="KernMetric" style="height: 42px; width: auto; display: block;" class="logo-img">
            </a>
            <p class="text-xs" style="margin: 0; color: var(--text-muted);">
              ${CONFIG.tagline} • Platform version ${CONFIG.version}
            </p>
          </div>
          <div class="flex gap-md" style="font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; align-items: center;">
            <a href="${ROUTES.experiments}" style="color: var(--text-secondary);">Experiments</a>
            <a href="${ROUTES.about}" style="color: var(--text-secondary);">Founder</a>
            <a href="https://linkedin.com" target="_blank" style="color: var(--text-secondary);">LinkedIn</a>
            <a href="${ROUTES.contact}" style="color: var(--text-secondary);">Privacy</a>
            <a href="${ROUTES.contact}" style="color: var(--text-secondary);">Terms</a>
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

class KernBreadcrumbs extends HTMLElement {
  async connectedCallback() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id') || '';
    
    let pathHtml = `<a href="${ROUTES.home}">Platform</a>`;
    
    if (window.location.pathname.includes('case-study.html')) {
      pathHtml += `
        <span style="margin: 0 8px; color: var(--text-muted); font-size: 0.8rem;">&rsaquo;</span>
        <a href="${ROUTES.caseStudies}">Diagnostics</a>
      `;
      
      if (id) {
        try {
          const mriResponse = await fetch('data/mris.json');
          const mrisData = await mriResponse.json();
          const companiesResponse = await fetch('data/companies.json');
          const companiesData = await companiesResponse.json();
          
          const mri = mrisData.mris.find(m => m.id === id);
          if (mri) {
            const comp = companiesData.companies.find(c => c.id === mri.companyId);
            if (comp) {
              pathHtml += `
                <span style="margin: 0 8px; color: var(--text-muted); font-size: 0.8rem;">&rsaquo;</span>
                <span style="font-weight: 500; color: var(--text-primary);">${comp.name}</span>
                <span style="margin: 0 8px; color: var(--text-muted); font-size: 0.8rem;">&rsaquo;</span>
                <span style="color: var(--text-secondary);">Growth MRI™</span>
                <span style="margin: 0 8px; color: var(--text-muted); font-size: 0.8rem;">&rsaquo;</span>
                <span style="font-weight: 600; color: var(--primary);">${mri.primaryConstraint}</span>
              `;
            }
          }
        } catch (e) {
          console.error("Breadcrumbs fetch error", e);
        }
      }
    } else if (window.location.pathname.includes('case-studies.html') || window.location.pathname.includes('knowledge-graph.html') || window.location.pathname.includes('mobile-diagnostics.html')) {
      pathHtml += `
        <span style="margin: 0 8px; color: var(--text-muted); font-size: 0.8rem;">&rsaquo;</span>
        <span style="font-weight: 500; color: var(--text-primary);">Diagnostics</span>
      `;
    }
    else if (window.location.pathname.includes('research.html')) {
      pathHtml += `
        <span style="margin: 0 8px; color: var(--text-muted); font-size: 0.8rem;">&rsaquo;</span>
        <a href="${ROUTES.research}">Research</a>
      `;
      
      if (id) {
        try {
          const resResponse = await fetch('data/research.json');
          const resData = await resResponse.json();
          const paper = resData.research.find(r => r.id === id);
          if (paper) {
            pathHtml += `
              <span style="margin: 0 8px; color: var(--text-muted); font-size: 0.8rem;">&rsaquo;</span>
              <span style="font-weight: 500; color: var(--text-primary);">${paper.title.substring(0, 30)}...</span>
            `;
          }
        } catch (e) {
          console.error("Breadcrumbs research fetch error", e);
        }
      }
    } else if (window.location.pathname.includes('methodology.html')) {
      pathHtml += `
        <span style="margin: 0 8px; color: var(--text-muted); font-size: 0.8rem;">&rsaquo;</span>
        <span style="font-weight: 500; color: var(--text-primary);">Frameworks</span>
      `;
    } else if (window.location.pathname.includes('atlas.html')) {
      pathHtml += `
        <span style="margin: 0 8px; color: var(--text-muted); font-size: 0.8rem;">&rsaquo;</span>
        <span style="font-weight: 500; color: var(--text-primary);">Constraint Atlas™</span>
      `;
    } else if (window.location.pathname.includes('knowledge-graph.html')) {
      pathHtml += `
        <span style="margin: 0 8px; color: var(--text-muted); font-size: 0.8rem;">&rsaquo;</span>
        <span style="font-weight: 500; color: var(--text-primary);">Knowledge Graph</span>
      `;
    } else if (window.location.pathname.includes('about.html')) {
      pathHtml += `
        <span style="margin: 0 8px; color: var(--text-muted); font-size: 0.8rem;">&rsaquo;</span>
        <span style="font-weight: 500; color: var(--text-primary);">About</span>
      `;
    } else if (window.location.pathname.includes('design-system.html')) {
      pathHtml += `
        <span style="margin: 0 8px; color: var(--text-muted); font-size: 0.8rem;">&rsaquo;</span>
        <span style="font-weight: 500; color: var(--text-primary);">Design System v3</span>
      `;
    }

    this.className = 'km-citation';
    this.style.display = 'flex';
    this.style.flexWrap = 'wrap';
    this.style.alignItems = 'center';
    this.style.marginBottom = 'var(--space-md)';
    this.innerHTML = pathHtml;
  }
}

customElements.define('kern-header', KernHeader);
customElements.define('kern-footer', KernFooter);
customElements.define('kern-breadcrumbs', KernBreadcrumbs);
