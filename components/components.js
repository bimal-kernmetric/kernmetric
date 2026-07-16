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
            <img src="assets/logo.svg" alt="KernMetrics" class="logo-img">
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
      <footer class="section border-t" style="padding-top: var(--space-xl); padding-bottom: var(--space-xl); background-color: var(--bg-secondary); border-top: 1px solid var(--border-color);">
        <div class="container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: var(--space-xl); align-items: start;">
          
          <!-- Brand Column -->
          <div style="display: flex; flex-direction: column; gap: var(--space-xs); grid-column: span 1; min-width: 200px;">
            <a href="${ROUTES.home}" class="logo" style="display: flex; align-items: center; text-decoration: none;">
              <img src="assets/logo.svg" alt="KernMetrics" style="height: 38px; width: auto; display: block;" class="logo-img">
            </a>
            <p style="margin: var(--space-xs) 0 0 0; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">
              Growth Intelligence for E-commerce Brands
            </p>
            <p class="text-xs" style="margin: var(--space-sm) 0 0 0; color: var(--text-muted); font-size: 0.75rem;">
              © KernMetrics. All rights reserved.
            </p>
            <button class="theme-toggle" aria-label="Toggle theme" id="footer-theme-toggle" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0; display: inline-flex; align-items: center; font-size: 0.75rem; margin-top: 8px; text-decoration: underline;">
              Toggle Dark/Light Mode
            </button>
          </div>

          <!-- Platform Column -->
          <div style="display: flex; flex-direction: column; gap: var(--space-sm);">
            <h4 style="margin: 0 0 var(--space-xs) 0; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-primary); font-family: system-ui, -apple-system, sans-serif;">Platform</h4>
            <a href="${ROUTES.home}" style="font-size: 0.85rem; color: var(--text-secondary); text-decoration: none; transition: color 0.15s ease;">Overview</a>
            <a href="${ROUTES.methodology}" style="font-size: 0.85rem; color: var(--text-secondary); text-decoration: none; transition: color 0.15s ease;">How it works</a>
            <a href="${ROUTES.home}#pricing" style="font-size: 0.85rem; color: var(--text-secondary); text-decoration: none; transition: color 0.15s ease;">Pricing</a>
          </div>

          <!-- Research Column -->
          <div style="display: flex; flex-direction: column; gap: var(--space-sm);">
            <h4 style="margin: 0 0 var(--space-xs) 0; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-primary); font-family: system-ui, -apple-system, sans-serif;">Research</h4>
            <a href="${ROUTES.growthMRI}" style="font-size: 0.85rem; color: var(--text-secondary); text-decoration: none; transition: color 0.15s ease;">Growth MRI™</a>
            <a href="${ROUTES.caseStudies}" style="font-size: 0.85rem; color: var(--text-secondary); text-decoration: none; transition: color 0.15s ease;">Case Studies</a>
            <a href="${ROUTES.research}" style="font-size: 0.85rem; color: var(--text-secondary); text-decoration: none; transition: color 0.15s ease;">Research Journal</a>
          </div>

          <!-- Company Column -->
          <div style="display: flex; flex-direction: column; gap: var(--space-sm);">
            <h4 style="margin: 0 0 var(--space-xs) 0; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-primary); font-family: system-ui, -apple-system, sans-serif;">Company</h4>
            <a href="${ROUTES.about}" style="font-size: 0.85rem; color: var(--text-secondary); text-decoration: none; transition: color 0.15s ease;">About</a>
            <a href="${ROUTES.about}#careers" style="font-size: 0.85rem; color: var(--text-secondary); text-decoration: none; transition: color 0.15s ease;">Careers</a>
            <a href="${ROUTES.contact}" style="font-size: 0.85rem; color: var(--text-secondary); text-decoration: none; transition: color 0.15s ease;">Contact</a>
          </div>

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

// ============================================================================
// CENTRALIZED ANALYTICS & USER BEHAVIOR INSTRUMENTATION
// ============================================================================
(function() {
  if (window.__kernmetric_analytics_loaded__) return;
  window.__kernmetric_analytics_loaded__ = true;

  // 1. Inject GA4 script
  const gaId = 'G-TN1W683L7S';
  const gaScript = document.createElement('script');
  gaScript.async = true;
  gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.prepend(gaScript);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function() { dataLayer.push(arguments); };
  gtag('js', new Date());
  gtag('config', gaId);
  gtag('set', 'user_properties', { visitor_type: 'prospect' });

  // 2. Inject Microsoft Clarity script
  const clarityId = 'xmezqhiwmm';
  (function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window,document,"clarity","script",clarityId);

  // Helper trackEvent function
  function trackEvent(name, params = {}) {
    if (window.gtag) {
      gtag('event', name, params);
    }
  }

  // 3. Scroll Depth Tracking (25%, 50%, 75%, 90%)
  let scrollThresholds = { 25: false, 50: false, 75: false, 90: false };
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (scrollHeight <= 0) return;
    const percent = Math.round((scrollTop / scrollHeight) * 100);
    
    [25, 50, 75, 90].forEach(threshold => {
      if (percent >= threshold && !scrollThresholds[threshold]) {
        scrollThresholds[threshold] = true;
        trackEvent('scroll_depth', {
          depth_percentage: threshold
        });
      }
    });
  });

  // 4. Page Engagement Time tracking
  let startTime = Date.now();
  function reportTime() {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    if (timeSpent > 0 && timeSpent < 3600) { // Limit to 1 hour to ignore inactive background tabs
      trackEvent('time_on_page', {
        seconds: timeSpent
      });
    }
    startTime = Date.now();
  }
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      reportTime();
    }
  });
  window.addEventListener('beforeunload', reportTime);

  // 5. Global Exception Tracker
  window.addEventListener('error', (e) => {
    trackEvent('js_exception', {
      message: e.message,
      filename: e.filename,
      lineno: e.lineno
    });
  });
  window.addEventListener('unhandledrejection', (e) => {
    trackEvent('js_exception', {
      message: e.reason ? e.reason.message || String(e.reason) : 'Unhandled promise rejection'
    });
  });

  // 6. Global Failed Fetch Tracker
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    return originalFetch.apply(this, args).catch(err => {
      trackEvent('failed_fetch', {
        url: args[0] ? (args[0].url || String(args[0])) : 'unknown',
        error: err.message || String(err)
      });
      throw err;
    });
  };

  // 7. Case Study Render Failures Observer
  document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('report-view-container');
    if (container) {
      const observer = new MutationObserver(() => {
        if (container.innerText.includes('ERROR') || container.innerText.includes('Growth MRI Unavailable')) {
          trackEvent('case_study_loading_failure', {
            location: window.location.pathname
          });
          observer.disconnect();
        }
      });
      observer.observe(container, { childList: true, subtree: true });
    }
  });

  // 8. Event Delegation for Click-based Interactions
  document.addEventListener('click', (e) => {
    const target = e.target.closest('a, button, [onclick], .km-constraint-card, .km-company-card, .km-research-card');
    if (!target) return;
    
    const href = target.getAttribute('href') || '';
    const text = target.innerText ? target.innerText.trim().substring(0, 50) : '';
    const id = target.id || '';
    const onClickAttr = target.getAttribute('onclick') || '';
    const currentPath = window.location.pathname;

    // A. CTA: Book Diagnostic (cal.com)
    if (href.includes('cal.com/bimal-kernmetrics') || onClickAttr.includes('cal.com')) {
      let location = 'hero';
      if (target.closest('header')) location = 'header';
      else if (target.closest('footer')) location = 'footer';
      else if (target.closest('.mobile-nav-dropdown')) location = 'mobile_nav';
      else if (currentPath.includes('contact')) location = 'contact_page';
      
      trackEvent('book_diagnostic', { location: location });
    }

    // B. Engagement: View Growth MRI Details
    else if (href.includes('case-study.html') || onClickAttr.includes('case-study.html')) {
      let mriId = '';
      const match = href.match(/id=([^&]+)/) || onClickAttr.match(/id=([^&#]+)/);
      if (match) mriId = match[1];
      trackEvent('case_study_view', {
        mri_id: mriId,
        link_text: text
      });
    }

    // C. Engagement: View Growth MRI Protocol Overview
    else if (href.includes('growth-mri.html') || onClickAttr.includes('growth-mri.html')) {
      let location = 'body';
      if (target.closest('header')) location = 'header';
      else if (target.closest('footer')) location = 'footer';
      trackEvent('growth_mri_view', {
        link_text: text,
        location: location
      });
    }

    // D. Engagement: View Research Details
    else if (href.includes('research.html') || onClickAttr.includes('research.html')) {
      let paperId = '';
      const match = href.match(/id=([^&]+)/) || onClickAttr.match(/id=([^&#]+)/);
      if (match) paperId = match[1];
      trackEvent('research_view', {
        paper_id: paperId || 'archive',
        link_text: text
      });
    }

    // E. Engagement: View Knowledge Graph
    else if (href.includes('knowledge-graph.html') || onClickAttr.includes('knowledge-graph.html')) {
      let location = 'body';
      if (target.closest('header')) location = 'header';
      else if (target.closest('footer')) location = 'footer';
      trackEvent('knowledge_graph_view', {
        link_text: text,
        location: location
      });
    }

    // F. Navigation clicks
    else if (target.closest('nav') || target.closest('.mobile-nav-dropdown')) {
      trackEvent('navigation_click', {
        link_text: text,
        link_url: href
      });
    }

    // G. Outbound clicks
    else if (href.startsWith('http') && !href.includes('kernmetric.com') && !href.includes('cal.com')) {
      trackEvent('outbound_click', {
        destination: href,
        link_text: text
      });
    }

    // H. Copy Link action
    else if (text.toLowerCase().includes('copy link') || id.includes('copy-link')) {
      trackEvent('copy_link', {
        location: currentPath
      });
    }
  });

  // 9. Form Submission (Contact Submit)
  document.addEventListener('submit', (e) => {
    const form = e.target;
    const formId = form.id || '';
    const formAction = form.getAttribute('action') || '';
    const currentPath = window.location.pathname;

    if (formId.includes('contact') || formAction.includes('contact') || currentPath.includes('contact.html')) {
      trackEvent('contact_form_submit', {
        form_id: formId || 'contact_form'
      });
    }
  });

  // 10. Copy Elements Tracker (Email/Link) - No copied text stored for PII safety
  document.addEventListener('copy', () => {
    const selection = window.getSelection().toString();
    const currentPath = window.location.pathname;

    if (selection.includes('@kernmetric.com')) {
      trackEvent('copy_email', {
        location: currentPath
      });
    } else if (selection.startsWith('http') || selection.includes('.html')) {
      trackEvent('copy_link', {
        location: currentPath
      });
    }
  });

  // 11. Search Box Inputs Tracker
  document.addEventListener('submit', (e) => {
    const form = e.target;
    const searchInput = form.querySelector('input[type="search"], input[name="search"], .search-input');
    if (searchInput && searchInput.value.trim()) {
      trackEvent('search_used', {
        query: searchInput.value.trim().substring(0, 100)
      });
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.matches('input[type="search"], input[name="search"], .search-input')) {
      if (e.target.value.trim()) {
        trackEvent('search_used', {
          query: e.target.value.trim().substring(0, 100)
        });
      }
    }
  });

  // 12. Cal.com iframe Callback Hooks
  window.addEventListener('message', (e) => {
    try {
      const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
      if (data && (data.origin === 'Cal' || (data.type && data.type.startsWith('cal:')))) {
        const eventType = data.eventType || data.type;
        if (eventType === 'linkReady' || eventType === 'cal:linkReady') {
          trackEvent('cal_booking_started');
        } else if (eventType === 'bookingSuccessful' || eventType === 'cal:bookingSuccessful') {
          trackEvent('cal_booking_completed');
        }
      }
    } catch (err) {
      // Ignore
    }
  });

})();
