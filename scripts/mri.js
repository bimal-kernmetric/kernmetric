document.addEventListener('DOMContentLoaded', () => {
  const steps = [
    {
      step: 1,
      title: "Observed Symptoms",
      summary: "Mapping cohort anomalies, ad cost surges, and contribution leakage.",
      detail: "We digest raw shopify database logs, cohort retention curves, and customer service transcripts. Rather than accepting high-level summaries, we isolate the exact billing cycles where contribution margins break down."
    },
    {
      step: 2,
      title: "Structural Diagnosis",
      summary: "Isolating bottlenecks back to core operational or behavioral paradoxes.",
      detail: "Using our proprietary taxonomy, we determine whether the cohort churn is driven by routine friction, personalization decay, or attribution dilution traps. We name the upstream bottleneck."
    },
    {
      step: 3,
      title: "Dependency Chains",
      summary: "Mapping downstream variables to core system governors.",
      detail: "We build a logical dependency tree showing how advertising spend, landing page layouts, and email flows are constrained by packaging preparation steps, pricing tiers, or distribution arrangements."
    },
    {
      step: 4,
      title: "Constraint Velocity",
      summary: "Calculating feedback latencies and daily habit formation limits.",
      detail: "We calculate the feedback latency (loop delay) and usage velocity. For subscription products, this means defining the exact threshold (e.g. 5 intakes in 7 days) required to establish a self-sustaining routine."
    },
    {
      step: 5,
      title: "Validation",
      summary: "Running localized trials to evaluate behavior elasticity.",
      detail: "Before committing capital to changes, we run target validation tests (e.g. dispatching travel tins to a 500-user sample) to verify behavior changes and measure elasticities."
    },
    {
      step: 6,
      title: "Experiments",
      summary: "Running formal A/B testing sequences to confirm LTV improvements.",
      detail: "We run controlled tests tracking cohort retention differences, AOV adjustments, or cross-channel ad-spend holdouts to generate statistical verification models."
    },
    {
      step: 7,
      title: "Implementation Roadmap",
      summary: "Deploying structural adjustments to lock in long-term enterprise value.",
      detail: "We deliver full instructions for packaging redesigns, subscription flow changes, pricing revisions, and cross-channel attribution matrices to unlock stable contribution margins."
    }
  ];

  const timeline = document.getElementById('mri-timeline');
  if (timeline) {
    timeline.innerHTML = '';
    
    steps.forEach((item, idx) => {
      const stepEl = document.createElement('div');
      stepEl.className = `timeline-step ${idx === 0 ? 'active' : ''}`;
      
      stepEl.innerHTML = `
        <div class="timeline-node"></div>
        <div class="timeline-content">
          <span class="monospace text-xs text-primary-color" style="font-weight: 500;">PHASE 0${item.step}</span>
          <h4 style="margin: 2px 0; font-size: 1.2rem; font-weight: 600; color: var(--text-primary);">${item.title}</h4>
          <p style="margin: 0; font-size: 0.875rem; color: var(--text-secondary);">${item.summary}</p>
          <div class="timeline-body">
            <p style="margin: var(--space-xs) 0 0 0; font-size: 0.825rem; line-height: 1.5; color: var(--text-secondary); border-top: 1px dashed var(--border-color); padding-top: var(--space-xs);">
              ${item.detail}
            </p>
          </div>
        </div>
      `;
      
      stepEl.addEventListener('click', () => {
        // Toggle current active state, close others
        const allSteps = timeline.querySelectorAll('.timeline-step');
        const isActive = stepEl.classList.contains('active');
        
        allSteps.forEach(s => s.classList.remove('active'));
        if (!isActive) {
          stepEl.classList.add('active');
        }
      });
      
      timeline.appendChild(stepEl);
    });
  }
});
