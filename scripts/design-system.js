document.addEventListener('DOMContentLoaded', () => {
  // 1. Accordion Interactions
  const accordions = document.querySelectorAll('.km-accordion');
  accordions.forEach(acc => {
    const header = acc.querySelector('.km-accordion-header');
    const content = acc.querySelector('.km-accordion-content');
    if (header && content) {
      header.addEventListener('click', () => {
        const isOpen = acc.classList.contains('open');
        
        // Close all
        accordions.forEach(item => {
          item.classList.remove('open');
          const c = item.querySelector('.km-accordion-content');
          if (c) c.style.maxHeight = '0';
        });

        // Toggle current
        if (!isOpen) {
          acc.classList.add('open');
          content.style.maxHeight = '500px';
        }
      });
    }
  });

  // 2. Tab Interactions
  const tabsContainers = document.querySelectorAll('.km-tabs-container');
  tabsContainers.forEach(container => {
    const buttons = container.querySelectorAll('.km-tab-button');
    const panels = container.querySelectorAll('.km-tab-panel');

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');

        // Remove active class from buttons
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Toggle visibility of panels
        panels.forEach(panel => {
          panel.classList.remove('active');
          if (panel.id === targetTab) {
            panel.classList.add('active');
          }
        });
      });
    });
  });
});
