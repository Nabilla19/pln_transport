/**
 * Mobile Sidebar Toggle & Responsive Functions
 */

document.addEventListener('DOMContentLoaded', function() {
  const sidenav = document.getElementById('sidenav-main');
  const sidenavCollapse = document.getElementById('sidenav-collapse-main');

  if (!sidenav) return;

  // Mobile sidebar toggle button
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'btn btn-icon btn-sm text-secondary d-lg-none';
  toggleBtn.id = 'sidebarToggleBtn';
  toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
  toggleBtn.style.display = 'none';

  // Prepend toggle button to sidenav header
  const sidenavHeader = sidenav.querySelector('.sidenav-header');
  if (sidenavHeader) {
    sidenavHeader.parentElement.insertBefore(toggleBtn, sidenavHeader);
  }

  // Handle window resize
  function handleResize() {
    if (window.innerWidth <= 768) {
      toggleBtn.style.display = 'block';
      sidenav.classList.add('mobile-sidebar');
      
      // Collapse navbar on mobile by default
      if (sidenavCollapse && !sidenav.classList.contains('mobile-expanded')) {
        sidenavCollapse.classList.remove('show');
      }
    } else {
      toggleBtn.style.display = 'none';
      sidenav.classList.remove('mobile-sidebar');
      sidenav.classList.remove('mobile-expanded');
      
      // Expand navbar on desktop
      if (sidenavCollapse) {
        sidenavCollapse.classList.add('show');
      }
    }
  }

  // Initial check
  handleResize();

  // Toggle sidebar on button click
  toggleBtn.addEventListener('click', function(e) {
    e.preventDefault();
    sidenav.classList.toggle('mobile-expanded');
    
    // Toggle collapse show class
    if (sidenavCollapse) {
      sidenavCollapse.classList.toggle('show');
    }
  });

  // Close sidebar when clicking on a link
  const navLinks = sidenav.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      // Only close if it's not a collapsible menu
      if (!this.hasAttribute('data-bs-toggle') && window.innerWidth <= 768) {
        sidenav.classList.remove('mobile-expanded');
        if (sidenavCollapse) {
          sidenavCollapse.classList.remove('show');
        }
      }
    });
  });

  // Handle collapse menus on mobile
  const collapseToggles = sidenav.querySelectorAll('[data-bs-toggle="collapse"]');
  collapseToggles.forEach(toggle => {
    toggle.addEventListener('click', function(e) {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        const targetId = this.getAttribute('data-bs-target') || this.getAttribute('href');
        const target = document.querySelector(targetId);
        
        if (target) {
          target.classList.toggle('show');
          this.setAttribute('aria-expanded', target.classList.contains('show'));
        }
      }
    });
  });

  // Listen for resize events
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(handleResize, 250);
  });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href !== '#' && !this.hasAttribute('data-bs-toggle')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});

// Add responsive class handling for touch devices
if ('ontouchstart' in window) {
  document.body.classList.add('touch-device');
}
