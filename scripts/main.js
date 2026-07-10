// Common Platform Bootstrapper

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initial Theme Set from LocalStorage
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  // Sync the web component header checkbox state (if it loaded before components.js initialized)
  const header = document.querySelector('kern-header');
  if (header && typeof header.syncThemeIcon === 'function') {
    header.syncThemeIcon();
  }

  // 2. Setup Intersection Observer for Fade-Up transitions
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Trigger animation once
      }
    });
  }, observerOptions);

  const animateElements = document.querySelectorAll('.fade-up-element');
  animateElements.forEach(el => observer.observe(el));
});
