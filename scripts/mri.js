document.addEventListener('DOMContentLoaded', () => {
  const steps = [
    {
      step: 1,
      title: "Observed Symptoms",
      summary: "Mapping cohort anomalies, ad cost surges, and contribution leakage.",
      detail: "We digest raw shopify database logs, cohort retention curves, and customer service transcripts. Rather than accepting high-level summaries, we isolate the exact billing cycles where contribution margins break down.",
      deliverable: "Cohort Anomalies Log, Downstream Cost Matrix",
      symptoms: ["Contribution margins flatline as scale increases", "Cohort churn matches billing loop frequencies", "CAC increases faster than AOV growth metrics"]
    },
    {
      step: 2,
      title: "Structural Diagnosis",
      summary: "Isolating bottlenecks back to core operational or behavioral paradoxes.",
      detail: "Using our proprietary taxonomy, we determine whether the cohort churn is driven by routine friction, personalization decay, or attribution dilution traps. We name the upstream bottleneck.",
      deliverable: "Paradox Identification Dossier, Bottleneck Map",
      symptoms: ["Usage frequency decay sits below product expiration velocities", "Google and Meta platform checkout counts diverge from stripe records"]
    },
    {
      step: 3,
      title: "Dependency Chains",
      summary: "Mapping downstream variables to core system governors.",
      detail: "We build a logical dependency tree showing how advertising spend, landing page layouts, and email flows are constrained by packaging preparation steps, pricing tiers, or distribution arrangements.",
      deliverable: "System Flow Diagram, Downstream Dependency Map",
      symptoms: ["Adjustments in funnel creatives produce zero lift in LTV", "Landing page conversion spikes cause inventory stock-outs upstream"]
    },
    {
      step: 4,
      title: "Constraint Velocity",
      summary: "Calculating feedback latencies and daily habit formation limits.",
      detail: "We calculate the feedback latency (loop delay) and usage velocity. For subscription products, this means defining the exact threshold (e.g. 5 intakes in 7 days) required to establish a self-sustaining routine.",
      deliverable: "Habit Velocity Threshold Chart, Loop delay latency log",
      symptoms: ["Customers cancel subscription because of 'unopened product backlogs'", "Habit cues are too complex or disjointed to integrate into daily rituals"]
    },
    {
      step: 5,
      title: "Validation",
      summary: "Running localized trials to evaluate behavior elasticity.",
      detail: "Before committing capital to changes, we run target validation tests (e.g. dispatching travel tins to a 500-user sample) to verify behavior changes and measure elasticities.",
      deliverable: "Trial Elasticity Report, User Trial Cohort Feedback",
      symptoms: ["Capital investment required to deploy full roadmap is high", "Behavior change assumptions must be verified on active cohorts first"]
    },
    {
      step: 6,
      title: "Experiments",
      summary: "Running formal A/B testing sequences to confirm LTV improvements.",
      detail: "We run controlled tests tracking cohort retention differences, AOV adjustments, or cross-channel ad-spend holdouts to generate statistical verification models.",
      deliverable: "A/B Cohort Test Reports, Verification Holdout Matrix",
      symptoms: ["Statistical verification is needed to validate diagnostic gains", "Internal teams require structured holdout data before scaling changes"]
    },
    {
      step: 7,
      title: "Implementation Roadmap",
      summary: "Deploying structural adjustments to lock in long-term enterprise value.",
      detail: "We deliver full instructions for packaging redesigns, subscription flow changes, pricing revisions, and cross-channel attribution matrices to unlock stable contribution margins.",
      deliverable: "Final Enterprise Implementation Guide, Cohort Value Lock",
      symptoms: ["System throughput must be stabilized to secure long-term equity", "Diagnostic findings must be translated into active roadmap roadmaps"]
    }
  ];

  // 1. Desktop Stepper Setup
  const stepListContainer = document.getElementById('mri-step-list');
  const viewportContainer = document.getElementById('mri-viewport');

  if (stepListContainer && viewportContainer) {
    let currentStepIdx = 0;

    function renderStepRail() {
      stepListContainer.innerHTML = '';
      steps.forEach((item, idx) => {
        const btn = document.createElement('button');
        btn.className = `view-toggle-btn ${idx === currentStepIdx ? 'active' : ''}`;
        btn.style.width = '100%';
        btn.style.textAlign = 'left';
        btn.style.padding = '12px var(--space-sm)';
        btn.style.display = 'flex';
        btn.style.flexDirection = 'column';
        btn.style.gap = '2px';
        btn.style.border = '1px solid transparent';
        btn.style.borderRadius = 'var(--border-radius)';
        
        if (idx === currentStepIdx) {
          btn.style.backgroundColor = 'var(--primary)';
          btn.style.color = '#ffffff';
        } else {
          btn.style.backgroundColor = 'transparent';
          btn.style.color = 'var(--text-secondary)';
        }

        btn.innerHTML = `
          <span class="monospace text-xs" style="font-size: 0.65rem; color: ${idx === currentStepIdx ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)'};">STAGE 0${item.step}</span>
          <span style="font-family: 'Inter', sans-serif; font-size: 0.85rem; font-weight: 600;">${item.title}</span>
        `;

        btn.addEventListener('click', () => {
          currentStepIdx = idx;
          renderStepRail();
          renderActiveStep();
        });

        stepListContainer.appendChild(btn);
      });
    }

    function renderActiveStep() {
      const item = steps[currentStepIdx];
      viewportContainer.innerHTML = '';

      const contentBlock = document.createElement('div');
      contentBlock.className = 'fade-in';
      contentBlock.innerHTML = `
        <div style="border-bottom: 1px solid var(--border-color); padding-bottom: var(--space-xs); margin-bottom: var(--space-md);">
          <span class="monospace text-xs text-primary-color" style="font-weight: 600; text-transform: uppercase;">STAGE 0${item.step} // CONSTRAINTS LIFECYCLE</span>
          <h2 style="margin: 4px 0 0 0; font-family: 'Source Serif 4', serif; font-size: 1.75rem; border-bottom: none;">${item.title}</h2>
        </div>

        <p class="lead" style="font-size: 1.1rem; line-height: 1.6; margin-bottom: var(--space-md); color: var(--text-primary);">
          ${item.summary}
        </p>

        <div style="font-size: 0.95rem; line-height: 1.6; color: var(--text-secondary); margin-bottom: var(--space-lg);">
          ${item.detail}
        </div>

        <div class="km-accordion" id="accordion-symptoms">
          <button class="km-accordion-header">Typical Observed Symptoms</button>
          <div class="km-accordion-content">
            <ul style="margin: 0; padding-left: 16px; font-size: 0.85rem; line-height: 1.6; color: var(--text-secondary);">
              ${item.symptoms.map(s => `<li style="margin-bottom: 4px;">${s}</li>`).join('')}
            </ul>
          </div>
        </div>

        <div class="km-accordion" id="accordion-deliverables">
          <button class="km-accordion-header">Outcome Deliverables</button>
          <div class="km-accordion-content">
            <div style="background-color: var(--bg-secondary); border: 1px dashed var(--border-color); padding: var(--space-sm); border-radius: var(--border-radius); font-size: 0.85rem; color: var(--text-primary); font-family: 'JetBrains Mono', monospace;">
              // DELIVERABLE FILE: ${item.deliverable}
            </div>
          </div>
        </div>

        <div class="flex justify-between items-center" style="margin-top: var(--space-xl); border-top: 1px solid var(--border-color); padding-top: var(--space-md);">
          <button class="btn btn-secondary btn-sm" id="prev-step-btn" ${currentStepIdx === 0 ? 'disabled' : ''}>&larr; Previous Stage</button>
          <div class="monospace text-xs text-muted-color">Stage ${item.step} of 7</div>
          <button class="btn btn-primary btn-sm" id="next-step-btn" ${currentStepIdx === steps.length - 1 ? 'disabled' : ''}>Next Stage &rarr;</button>
        </div>
      `;

      const prevBtn = contentBlock.querySelector('#prev-step-btn');
      const nextBtn = contentBlock.querySelector('#next-step-btn');

      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          if (currentStepIdx > 0) {
            currentStepIdx--;
            renderStepRail();
            renderActiveStep();
          }
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          if (currentStepIdx < steps.length - 1) {
            currentStepIdx++;
            renderStepRail();
            renderActiveStep();
          }
        });
      }

      const accordions = contentBlock.querySelectorAll('.km-accordion');
      accordions.forEach(acc => {
        const header = acc.querySelector('.km-accordion-header');
        const content = acc.querySelector('.km-accordion-content');
        header.addEventListener('click', (e) => {
          e.preventDefault();
          const isOpen = acc.classList.contains('open');
          accordions.forEach(a => {
            a.classList.remove('open');
            const c = a.querySelector('.km-accordion-content');
            if (c) c.style.maxHeight = '0';
          });
          if (!isOpen) {
            acc.classList.add('open');
            content.style.maxHeight = '300px';
          }
        });
      });

      viewportContainer.appendChild(contentBlock);
    }

    renderStepRail();
    renderActiveStep();
  }

  // 2. Mobile Accordion Setup
  const mobileContainer = document.getElementById('mri-mobile-accordion-container');
  if (mobileContainer) {
    mobileContainer.innerHTML = '';
    steps.forEach((item, idx) => {
      const stepEl = document.createElement('div');
      stepEl.className = 'km-accordion';
      stepEl.style.backgroundColor = 'var(--bg-primary)';
      stepEl.style.border = '1px solid var(--border-color)';
      stepEl.style.borderRadius = 'var(--border-radius)';
      
      stepEl.innerHTML = `
        <button class="km-accordion-header" style="padding: var(--space-sm) var(--space-md); font-family: 'Source Serif 4', serif; font-size: 1.15rem;">
          STAGE 0${item.step}: ${item.title}
        </button>
        <div class="km-accordion-content" style="padding: 0 var(--space-md);">
          <div style="padding-top: var(--space-xs); padding-bottom: var(--space-md); display: flex; flex-direction: column; gap: var(--space-sm);">
            <div>
              <h5 class="monospace text-xs text-primary-color" style="margin: 0 0 4px 0; font-size: 0.65rem; text-transform: uppercase;">What is this?</h5>
              <p style="margin: 0; font-size: 0.85rem; line-height: 1.45; color: var(--text-secondary);">${item.detail}</p>
            </div>
            <div>
              <h5 class="monospace text-xs text-primary-color" style="margin: 0 0 4px 0; font-size: 0.65rem; text-transform: uppercase;">Why does it matter?</h5>
              <ul style="margin: 0; padding-left: 16px; font-size: 0.8rem; line-height: 1.45; color: var(--text-secondary);">
                ${item.symptoms.map(s => `<li style="margin-bottom: 2px;">${s}</li>`).join('')}
              </ul>
            </div>
            <div>
              <h5 class="monospace text-xs text-primary-color" style="margin: 0 0 4px 0; font-size: 0.65rem; text-transform: uppercase;">What should I do next?</h5>
              <p style="margin: 0 0 var(--space-xs) 0; font-size: 0.85rem; line-height: 1.45; color: var(--text-secondary);">Unlock outcome: <strong>${item.deliverable}</strong></p>
              <a href="https://cal.com/bimal-kernmetrics" target="_blank" class="btn btn-primary btn-sm" style="display: inline-flex; align-items: center; justify-content: center; width: 100%; min-height: 40px; margin-top: 4px;">Book a Growth MRI™ &rarr;</a>
            </div>
          </div>
        </div>
      `;
      
      const header = stepEl.querySelector('.km-accordion-header');
      const content = stepEl.querySelector('.km-accordion-content');
      header.addEventListener('click', () => {
        const isOpen = stepEl.classList.contains('open');
        mobileContainer.querySelectorAll('.km-accordion').forEach(a => {
          a.classList.remove('open');
          const c = a.querySelector('.km-accordion-content');
          if (c) c.style.maxHeight = '0';
        });
        if (!isOpen) {
          stepEl.classList.add('open');
          content.style.maxHeight = '800px';
        }
      });
      
      mobileContainer.appendChild(stepEl);
    });
  }
});
