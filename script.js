/**
 * Alvaro Althaaf Viery — Portfolio Interactions
 * Clean, minimalist timeline animations.
 */

function revealApp() {
  document.documentElement.classList.remove('is-app-loading');
  document.documentElement.classList.add('is-app-ready');
  const splash = document.getElementById('app-splash');
  splash?.setAttribute('aria-busy', 'false');
  window.setTimeout(() => splash?.remove(), 400);
}

function initPortfolio() {
  // 0. Glass header — mobile menu & active section on scroll
  const navLinks = document.querySelectorAll('.site-header__link');
  const brand = document.getElementById('site-header-brand');
  const menuBtn = document.getElementById('nav-menu-btn');
  const nav = document.getElementById('site-header-nav');
  const sections = ['profile', 'about', 'experience', 'skills', 'projects', 'contact']
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const setActiveSection = (id) => {
    navLinks.forEach((link) => {
      link.classList.toggle('is-active', link.dataset.section === id);
    });
  };

  if (sections.length && navLinks.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible[0]) setActiveSection(visible[0].target.id);
    }, { root: null, threshold: [0.2, 0.35, 0.5], rootMargin: '-45% 0px -45% 0px' });

    sections.forEach((section) => sectionObserver.observe(section));
    setActiveSection('profile');
  }

  const closeMobileNav = () => {
    nav?.classList.remove('is-open');
    menuBtn?.setAttribute('aria-expanded', 'false');
    menuBtn?.setAttribute('aria-label', 'Open menu');
  };

  menuBtn?.addEventListener('click', () => {
    const open = nav?.classList.toggle('is-open');
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  navLinks.forEach((link) => link.addEventListener('click', closeMobileNav));
  brand?.addEventListener('click', closeMobileNav);

  document.addEventListener('click', (e) => {
    if (!nav?.classList.contains('is-open')) return;
    if (e.target.closest('.site-header')) return;
    closeMobileNav();
  });

  // 1. Profile entrance fade-in
  const profileSection = document.querySelector('.profile-section');
  if (profileSection) {
    profileSection.style.opacity = '0';
    profileSection.style.transform = 'translateY(16px)';
    profileSection.style.transition = 'opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1)';
    setTimeout(() => {
      profileSection.style.opacity = '1';
      profileSection.style.transform = 'translateY(0)';
    }, 150);
  }

  // 2. General scroll-reveal for .reveal elements
  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        obs.unobserve(entry.target);
      }
    });
  }, { root: null, threshold: 0.05, rootMargin: '0px 0px 60px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // Activate reveals already on screen (e.g. #about deep link)
  requestAnimationFrame(() => {
    document.querySelectorAll('.reveal').forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
        el.classList.add('active');
      }
    });
  });

  // 3. Timeline spine grow animation
  // Triggers as soon as the timeline wrapper enters the viewport
  const spine = document.querySelector('.timeline-spine');
  if (spine) {
    const spineObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          spine.classList.add('grow');
          obs.unobserve(entry.target);
        }
      });
    }, { root: null, threshold: 0.05 });
    spineObserver.observe(spine.parentElement); // observe the .timeline wrapper
  }

  // 4. Staggered reveal for timeline items
  const tlItems = document.querySelectorAll('.tl-item');
  const tlObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // slight delay per item so they cascade in
        const idx = Array.from(tlItems).indexOf(entry.target);
        setTimeout(() => {
          entry.target.classList.add('active');
        }, idx * 120);
        obs.unobserve(entry.target);
      }
    });
  }, { root: null, threshold: 0.1, rootMargin: '0px 0px 40px 0px' });

  tlItems.forEach(item => {
    // Start hidden
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';
    item.style.transition = 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)';
    tlObserver.observe(item);
  });

  // Handle the .active class for tl-items separately (override reveal)
  const itemActiveObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = Array.from(tlItems).indexOf(entry.target);
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, idx * 120);
        itemActiveObserver.unobserve(entry.target);
      }
    });
  }, { root: null, threshold: 0.1, rootMargin: '0px 0px 40px 0px' });

  tlItems.forEach(item => itemActiveObserver.observe(item));

  // 5. About window — sidebar tabs
  const aboutWindow = document.getElementById('about-window');
  if (aboutWindow) {
    const tabBtns = aboutWindow.querySelectorAll('[data-about-tab]');
    const panes = {
      archive: document.getElementById('about-pane-archive'),
      focus: document.getElementById('about-pane-focus'),
      path: document.getElementById('about-pane-path'),
    };

    const activateAboutTab = (tabId) => {
      tabBtns.forEach((btn) => {
        const active = btn.dataset.aboutTab === tabId;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      Object.entries(panes).forEach(([id, pane]) => {
        if (!pane) return;
        const active = id === tabId;
        pane.classList.toggle('is-active', active);
        pane.toggleAttribute('hidden', !active);
      });
    };

    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => activateAboutTab(btn.dataset.aboutTab));
    });
  }

  // 6. Projects — category filters
  const projectFilters = document.querySelectorAll('[data-project-filter]');
  const projectCards = document.querySelectorAll('.project-story');
  if (projectFilters.length && projectCards.length) {
    projectFilters.forEach((btn) => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.projectFilter;
        projectFilters.forEach((b) => {
          const active = b === btn;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
        projectCards.forEach((card) => {
          const categories = (card.dataset.categories || '').split(/\s+/);
          const show = filter === 'all' || categories.includes(filter);
          card.classList.toggle('is-hidden', !show);
          if (show) card.classList.add('active');
        });
      });
    });
  }

  // 7. Contact — copy email
  const contactCopy = document.getElementById('contact-copy');
  const contactHint = document.getElementById('contact-hint');
  const contactEmail = 'varoviery@gmail.com';
  const copyMessages = [
    'Copied — your turn to hit send.',
    'Address saved. Go make it a good email.',
    'In the clipboard. See you in the inbox.',
  ];
  let copyMsgIdx = 0;

  contactCopy?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(contactEmail);
    } catch {
      const input = document.createElement('input');
      input.value = contactEmail;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      input.remove();
    }
    contactCopy.classList.add('is-copied');
    contactCopy.textContent = 'Copied!';
    if (contactHint) {
      contactHint.hidden = false;
      contactHint.textContent = copyMessages[copyMsgIdx % copyMessages.length];
      copyMsgIdx += 1;
    }
    window.setTimeout(() => {
      contactCopy.classList.remove('is-copied');
      contactCopy.textContent = 'Copy address';
      if (contactHint) contactHint.hidden = true;
    }, 2400);
  });

  // 8. Status chip click cycle
  const statusChip = document.getElementById('status-chip');
  const statusText = statusChip?.querySelector('.status-text');
  if (statusChip && statusText) {
    const statuses = [
      "Currently: polishing this portfolio and shipping small improvements.",
      "Currently: turning messy data into clean, readable dashboards.",
      "Currently: automating the boring parts (so the insights ship faster).",
      "Currently: exploring new datasets and writing up what I learn."
    ];
    let idx = 0;
    statusChip.addEventListener('click', () => {
      idx = (idx + 1) % statuses.length;
      statusText.style.opacity = '0';
      statusText.style.transform = 'translateY(-4px)';
      setTimeout(() => {
        statusText.textContent = statuses[idx];
        statusText.style.opacity = '1';
        statusText.style.transform = 'translateY(0)';
      }, 200);
    });
  }

}

function bootPortfolio() {
  const start = () => {
    revealApp();
    initPortfolio();
  };
  const ready = window.__profilePicReady;
  if (ready && typeof ready.then === 'function') {
    ready.then(start).catch(start);
  } else {
    start();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootPortfolio);
} else {
  bootPortfolio();
}
