import { getParadoxes, getRelationships } from './api/paradoxes.js';
import { getCompanies } from './api/companies.js';
import { getResearch } from './api/research.js';
import { getMRIs } from './api/mri.js';

document.addEventListener('DOMContentLoaded', async () => {
  const paradoxes = await getParadoxes();
  const companies = await getCompanies();
  const research = await getResearch();
  const relationships = await getRelationships();
  const allMRIs = await getMRIs();

  // 1. Mobile Adaptive Constraint Traversal Hierarchy View
  const mobileContainer = document.getElementById('mobile-atlas-list');
  if (window.innerWidth < 1025 && mobileContainer) {
    mobileContainer.innerHTML = '';
    paradoxes.forEach(paradox => {
      // Find companies diagnosed with this paradox
      const relatedRels = relationships.filter(rel => rel.target === paradox.id && rel.relationship === 'diagnosed_with');
      const relatedCompIds = relatedRels.map(rel => rel.source);
      const relatedComps = companies.filter(c => relatedCompIds.includes(c.id));
      
      // Find papers sharing taxonomy tags
      const relatedPapers = research.filter(r => r.tags.some(tag => paradox.taxonomy.includes(tag)));
      
      let compsHtml = relatedComps.map(company => {
        const mriId = `mri_${company.id.replace('company_', '')}_v1`;
        const mri = allMRIs.find(m => m.id === mriId) || {};
        
        return `
          <div style="background-color: var(--bg-secondary); padding: var(--space-sm); border-radius: var(--border-radius); margin-bottom: var(--space-xs); border: 1px solid var(--border-color); text-align: left;">
            <div class="flex justify-between items-center" style="margin-bottom: 4px;">
              <strong style="color: var(--text-primary); font-size: 0.9rem;">${company.name}</strong>
              <span class="badge badge-blue" style="font-size: 0.6rem;">${company.industry}</span>
            </div>
            <p class="text-xs" style="margin: 4px 0 6px 0; color: var(--text-secondary); line-height: 1.4;">
              ${mri.summary || 'Growth diagnostic audit completed.'}
            </p>
            <div class="flex justify-between items-center" style="border-top: 1px dashed var(--border-color); padding-top: 4px; font-size: 0.75rem; font-family: 'JetBrains Mono', monospace; color: var(--text-muted);">
              <span>Impact: ${mri.estimatedImpact || 'N/A'}</span>
              <a href="case-study.html?id=${mriId}" style="color: var(--primary); font-weight: 600;">Read MRI &rarr;</a>
            </div>
          </div>
        `;
      }).join('');
      
      if (!compsHtml) {
        compsHtml = `<p class="text-xs text-muted-color" style="font-family: 'JetBrains Mono', monospace; margin: var(--space-xxs) 0;">No studied brands diagnosed yet.</p>`;
      }

      let papersHtml = relatedPapers.map(paper => `
        <div class="flex justify-between items-center" style="padding: 4px 0; border-bottom: 1px solid var(--border-color); font-size: 0.8rem; text-align: left;">
          <span style="color: var(--text-secondary);">${paper.title.substring(0, 32)}...</span>
          <a href="research.html?id=${paper.id}" style="font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; color: var(--primary); font-weight: 500;">Read Paper &rarr;</a>
        </div>
      `).join('');
      
      if (!papersHtml) {
        papersHtml = `<p class="text-xs text-muted-color" style="font-family: 'JetBrains Mono', monospace; margin: var(--space-xxs) 0;">No theoretical papers reference this paradox tag.</p>`;
      }

      const accEl = document.createElement('div');
      accEl.className = 'km-accordion';
      accEl.style.backgroundColor = 'var(--bg-primary)';
      accEl.style.border = '1px solid var(--border-color)';
      accEl.style.borderRadius = 'var(--border-radius)';
      accEl.style.width = '100%';
      
      accEl.innerHTML = `
        <button class="km-accordion-header" style="padding: var(--space-sm) var(--space-md); font-family: 'Source Serif 4', serif; font-size: 1.15rem; color: var(--text-primary);">
          ${paradox.name}
        </button>
        <div class="km-accordion-content" style="padding: 0 var(--space-md);">
          <div style="padding-top: var(--space-xs); padding-bottom: var(--space-md); display: flex; flex-direction: column; gap: var(--space-sm);">
            <div>
              <h5 class="monospace text-xs text-primary-color" style="margin: 0 0 4px 0; font-size: 0.65rem; text-transform: uppercase;">What is this?</h5>
              <p style="margin: 0; font-size: 0.825rem; line-height: 1.45; color: var(--text-secondary);">${paradox.description}</p>
            </div>
            
            <div>
              <h5 class="monospace text-xs text-primary-color" style="margin: 0 0 6px 0; font-size: 0.65rem; text-transform: uppercase;">Diagnosed Brands</h5>
              ${compsHtml}
            </div>

            <div>
              <h5 class="monospace text-xs text-primary-color" style="margin: 0 0 4px 0; font-size: 0.65rem; text-transform: uppercase;">Related Research</h5>
              <div style="display: flex; flex-direction: column; gap: 2px;">
                ${papersHtml}
              </div>
            </div>
          </div>
        </div>
      `;
      
      const header = accEl.querySelector('.km-accordion-header');
      const content = accEl.querySelector('.km-accordion-content');
      header.addEventListener('click', () => {
        const isOpen = accEl.classList.contains('open');
        mobileContainer.querySelectorAll('.km-accordion').forEach(a => {
          a.classList.remove('open');
          const c = a.querySelector('.km-accordion-content');
          if (c) c.style.maxHeight = '0';
        });
        if (!isOpen) {
          accEl.classList.add('open');
          content.style.maxHeight = '1500px';
        }
      });
      
      mobileContainer.appendChild(accEl);
    });
    return;
  }

  // 2. Desktop D3 Relational Network Graph Setup
  const nodesLayer = document.getElementById('graph-nodes-layer');
  const edgesLayer = document.getElementById('graph-edges-layer');

  if (!nodesLayer || !edgesLayer) return;

  // Clear layers
  nodesLayer.innerHTML = '';
  edgesLayer.innerHTML = '';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.position = 'absolute';
  svg.style.top = '0';
  svg.style.left = '0';
  svg.style.pointerEvents = 'none';
  edgesLayer.appendChild(svg);

  const nodeElements = {};
  const cols = {
    paradox: 10,
    company: 50,
    research: 90
  };

  // Draw Paradox Nodes (Left Column)
  paradoxes.forEach((p, idx) => {
    const yPercent = ((idx + 1) / (paradoxes.length + 1)) * 100;
    createNode(p.id, p.name, cols.paradox, yPercent, 'paradox');
  });

  // Draw Company Nodes (Center Column)
  companies.forEach((c, idx) => {
    const yPercent = ((idx + 1) / (companies.length + 1)) * 100;
    createNode(c.id, c.name, cols.company, yPercent, 'company');
  });

  // Draw Research Nodes (Right Column)
  research.forEach((r, idx) => {
    const yPercent = ((idx + 1) / (research.length + 1)) * 100;
    createNode(r.id, r.title.substring(0, 20) + '...', cols.research, yPercent, 'research');
  });

  function createNode(id, text, xPercent, yPercent, type) {
    const el = document.createElement('div');
    el.className = 'graph-node';
    el.id = `node-${id}`;
    el.style.left = `${xPercent}%`;
    el.style.top = `${yPercent}%`;
    el.innerHTML = `
      <div class="node-dot"></div>
      <div class="node-label">${text}</div>
    `;

    if (type === 'company') {
      const mriId = `mri_${id.replace('company_', '')}_v1`;
      el.addEventListener('click', () => {
        window.location.href = `case-study.html?id=${mriId}`;
      });
    } else if (type === 'paradox') {
      el.addEventListener('click', () => {
        window.location.href = `paradoxes.html?id=${id}`;
      });
    } else if (type === 'research') {
      el.addEventListener('click', () => {
        window.location.href = `research.html?id=${id}`;
      });
    }

    nodesLayer.appendChild(el);
    nodeElements[id] = { el, xPercent, yPercent, type };
  }

  // Draw Relationship Edges (Lines)
  relationships.forEach(rel => {
    const srcNode = nodeElements[rel.source];
    const tgtNode = nodeElements[rel.target];
    if (srcNode && tgtNode) {
      drawEdge(srcNode, tgtNode);
    }
  });

  function drawEdge(nodeA, nodeB) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', `${nodeA.xPercent}%`);
    line.setAttribute('y1', `${nodeA.yPercent}%`);
    line.setAttribute('x2', `${nodeB.xPercent}%`);
    line.setAttribute('y2', `${nodeB.yPercent}%`);
    line.setAttribute('stroke', 'var(--border-color)');
    line.setAttribute('stroke-width', '1');
    line.setAttribute('stroke-dasharray', '4');
    line.style.transition = 'all var(--transition-smooth)';
    svg.appendChild(line);

    // Hover Highlight Actions
    const highlight = () => {
      line.setAttribute('stroke', 'var(--primary)');
      line.setAttribute('stroke-width', '2');
      line.removeAttribute('stroke-dasharray');
      nodeA.el.classList.add('highlighted');
      nodeB.el.classList.add('highlighted');
    };

    const reset = () => {
      line.setAttribute('stroke', 'var(--border-color)');
      line.setAttribute('stroke-width', '1');
      line.setAttribute('stroke-dasharray', '4');
      nodeA.el.classList.remove('highlighted');
      nodeB.el.classList.remove('highlighted');
    };

    nodeA.el.addEventListener('mouseenter', highlight);
    nodeA.el.addEventListener('mouseleave', reset);
    nodeB.el.addEventListener('mouseenter', highlight);
    nodeB.el.addEventListener('mouseleave', reset);
  }
});
