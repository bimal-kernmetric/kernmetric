import { getParadoxes, getRelationships } from './api/paradoxes.js';
import { getCompanies } from './api/companies.js';
import { getResearch } from './api/research.js';

document.addEventListener('DOMContentLoaded', async () => {
  const paradoxes = await getParadoxes();
  const companies = await getCompanies();
  const research = await getResearch();
  const relationships = await getRelationships();

  const nodesLayer = document.getElementById('graph-nodes-layer');
  const edgesLayer = document.getElementById('graph-edges-layer');

  if (!nodesLayer || !edgesLayer) return;

  // Clear layers
  nodesLayer.innerHTML = '';
  edgesLayer.innerHTML = '';

  // Setup dynamic SVG canvas for lines
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.position = 'absolute';
  svg.style.top = '0';
  svg.style.left = '0';
  svg.style.pointerEvents = 'none';
  edgesLayer.appendChild(svg);

  const nodeElements = {};

  // Column Positions (in percentages)
  const cols = {
    paradox: 10,
    company: 50,
    research: 90
  };

  // 1. Draw Paradox Nodes (Left Column)
  paradoxes.forEach((p, idx) => {
    const yPercent = ((idx + 1) / (paradoxes.length + 1)) * 100;
    createNode(p.id, p.name, cols.paradox, yPercent, 'paradox');
  });

  // 2. Draw Company Nodes (Center Column)
  companies.forEach((c, idx) => {
    const yPercent = ((idx + 1) / (companies.length + 1)) * 100;
    createNode(c.id, c.name, cols.company, yPercent, 'company');
  });

  // 3. Draw Research Nodes (Right Column)
  research.forEach((r, idx) => {
    const yPercent = ((idx + 1) / (research.length + 1)) * 100;
    createNode(r.id, r.title.substring(0, 20) + '...', cols.research, yPercent, 'research');
  });

  // Helper to create node
  function createNode(id, text, xPercent, yPercent, type) {
    const el = document.createElement('div');
    el.className = 'graph-node';
    el.id = `node-${id}`;
    el.innerText = text;
    el.style.left = `calc(${xPercent}% - 50px)`;
    el.style.top = `calc(${yPercent}% - 15px)`;
    el.style.width = '120px';
    el.style.textAlign = 'center';
    el.style.whiteSpace = 'nowrap';
    el.style.overflow = 'hidden';
    el.style.textOverflow = 'ellipsis';
    
    // Set custom styling base on type
    if (type === 'paradox') {
      el.style.borderColor = 'var(--primary)';
      el.style.color = 'var(--primary)';
    } else if (type === 'company') {
      el.style.backgroundColor = 'var(--bg-secondary)';
      el.style.fontWeight = '500';
    } else {
      el.style.fontSize = '0.7rem';
      el.style.color = 'var(--text-secondary)';
    }

    // Add double click / click router
    el.addEventListener('click', () => {
      if (type === 'company') {
        window.location.href = `case-study.html?id=mri_${id.replace('company_', '')}_v1`;
      } else if (type === 'paradox') {
        window.location.href = `paradoxes.html?id=${id}`;
      } else if (type === 'research') {
        window.location.href = `research.html?id=${id}`;
      }
    });

    nodesLayer.appendChild(el);
    nodeElements[id] = el;

    // Hover highlight effects
    el.addEventListener('mouseenter', () => highlightNodeConnections(id));
    el.addEventListener('mouseleave', clearHighlight);
  }

  // Draw lines
  setTimeout(drawGraphEdges, 100);
  window.addEventListener('resize', drawGraphEdges);

  function drawGraphEdges() {
    svg.innerHTML = '';
    
    relationships.forEach(rel => {
      const fromEl = nodeElements[rel.source];
      const toEl = nodeElements[rel.target];
      if (!fromEl || !toEl) return;

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('id', `edge-${rel.source}-${rel.target}`);
      line.setAttribute('stroke', 'var(--text-muted)');
      line.setAttribute('stroke-width', '1');
      line.setAttribute('stroke-dasharray', '4');
      line.setAttribute('opacity', '0.2');
      line.style.transition = 'all var(--transition-smooth)';
      
      const x1 = fromEl.offsetLeft + fromEl.offsetWidth / 2;
      const y1 = fromEl.offsetTop + fromEl.offsetHeight / 2;
      const x2 = toEl.offsetLeft + toEl.offsetWidth / 2;
      const y2 = toEl.offsetTop + toEl.offsetHeight / 2;

      line.setAttribute('x1', x1);
      line.setAttribute('y1', y1);
      line.setAttribute('x2', x2);
      line.setAttribute('y2', y2);

      svg.appendChild(line);
    });
  }

  function highlightNodeConnections(nodeId) {
    // 1. Find all connected relations
    const connectedRelations = relationships.filter(r => r.source === nodeId || r.target === nodeId);
    const connectedNodeIds = new Set([nodeId]);
    
    connectedRelations.forEach(r => {
      connectedNodeIds.add(r.source);
      connectedNodeIds.add(r.target);
    });

    // Fade out all nodes except connected ones
    Object.keys(nodeElements).forEach(id => {
      const el = nodeElements[id];
      if (connectedNodeIds.has(id)) {
        el.style.opacity = '1';
        el.style.transform = 'scale(1.05)';
        if (id === nodeId) {
          el.style.borderColor = 'var(--primary)';
        }
      } else {
        el.style.opacity = '0.15';
        el.style.transform = 'scale(0.95)';
      }
    });

    // Highlight active edges
    relationships.forEach(rel => {
      const edge = document.getElementById(`edge-${rel.source}-${rel.target}`);
      if (!edge) return;
      
      if (rel.source === nodeId || rel.target === nodeId) {
        edge.setAttribute('stroke', 'var(--primary)');
        edge.setAttribute('stroke-width', '2');
        edge.setAttribute('stroke-dasharray', '0');
        edge.setAttribute('opacity', '1');
      } else {
        edge.setAttribute('opacity', '0.02');
      }
    });
  }

  function clearHighlight() {
    Object.keys(nodeElements).forEach(id => {
      const el = nodeElements[id];
      el.style.opacity = '1';
      el.style.transform = 'none';
      if (id.includes('paradox')) {
        el.style.borderColor = 'var(--primary)';
      } else {
        el.style.borderColor = 'var(--border-color)';
      }
    });

    relationships.forEach(rel => {
      const edge = document.getElementById(`edge-${rel.source}-${rel.target}`);
      if (!edge) return;
      edge.setAttribute('stroke', 'var(--text-muted)');
      edge.setAttribute('stroke-width', '1');
      edge.setAttribute('stroke-dasharray', '4');
      edge.setAttribute('opacity', '0.2');
    });
  }
});
