const root = document.documentElement;
const header = document.querySelector('.site-header');
const themeToggle = document.querySelector('[data-theme-toggle]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const menu = document.getElementById('mobile-menu');
let theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
root.setAttribute('data-theme', theme);

function setThemeIcon(theme) {
  themeToggle.innerHTML = theme === 'dark'
    ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"></circle><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path></svg>'
    : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
}

if (themeToggle) {
  setThemeIcon(theme);
  themeToggle.addEventListener('click', function () {
    theme = theme === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', theme);
    setThemeIcon(theme);
  });
}

if (menuToggle && menu) {
  menuToggle.addEventListener('click', function () {
    const open = menu.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
  });

  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    menu.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Menü öffnen');
  }));
}

const mainSections = [...document.querySelectorAll('[data-main-section]')];
const subSections = [...document.querySelectorAll('[data-sub-section]')];
const mainLinks = [...document.querySelectorAll('[data-main-link]')];
const tocGroupLinks = [...document.querySelectorAll('[data-group-link]')];
const tocSubLinks = [...document.querySelectorAll('[data-sub-link]')];
const tocGroups = [...document.querySelectorAll('.toc-group')];

let ticking = false;
let lastScrollY = window.scrollY;
let manualNavigationUntil = 0;

function clearMainActive() {
  mainLinks.forEach(link => link.classList.remove('active'));
  tocGroupLinks.forEach(link => link.classList.remove('active'));
  tocGroups.forEach(group => group.classList.add('collapsed'));
}

function setActiveMain(id) {
  clearMainActive();
  mainLinks
    .filter(link => link.dataset.mainLink === id)
    .forEach(link => link.classList.add('active'));

  tocGroupLinks
    .filter(link => link.dataset.groupLink === id)
    .forEach(link => link.classList.add('active'));

  const group = document.querySelector(`.toc-group[data-group="${id}"]`);
  if (group) group.classList.remove('collapsed');
}

function setActiveSub(id) {
  tocSubLinks.forEach(link => link.classList.remove('active'));
  if (!id) return;

  tocSubLinks
    .filter(link => link.dataset.subLink === id)
    .forEach(link => link.classList.add('active'));
}

function getMainAtScroll() {
  if (window.scrollY <= 80) return 'top';

  const viewportBottom = window.scrollY + window.innerHeight;
  const documentBottom = document.documentElement.scrollHeight;

  if (documentBottom - viewportBottom <= 80) return 'kontakt';

  const marker = Math.max(140, window.innerHeight * 0.22);
  let current = 'top';

  for (const section of mainSections) {
    const rect = section.getBoundingClientRect();
    if (rect.top <= marker) current = section.dataset.mainSection;
  }

  return current;
}

function getSubAtScroll(activeMain) {
  if (activeMain !== 'projekte') return null;

  const relevant = subSections.filter(
    section => section.dataset.parentSection === activeMain
  );

  const offset = Math.max(window.innerHeight * 0.28, 90);
  let current = null;

  for (const section of relevant) {
    const top = section.getBoundingClientRect().top;
    if (top <= offset) current = section.dataset.subSection;
  }

  return current;
}

function updateNavigation() {
  if (Date.now() < manualNavigationUntil) return;

  const activeMain = getMainAtScroll();
  setActiveMain(activeMain);
  setActiveSub(getSubAtScroll(activeMain));
}

function updateHeaderVisibility() {
  const currentY = window.scrollY;
  const delta = currentY - lastScrollY;
  const scrollingDown = delta > 8;
  const scrollingUp = delta < -6;

  if (currentY > 120 && scrollingDown) header.classList.add('header-hidden');
  else if (scrollingUp || currentY < 40) header.classList.remove('header-hidden');

  lastScrollY = currentY;
}

function onScroll() {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      updateNavigation();
      updateHeaderVisibility();
      ticking = false;
    });
    ticking = true;
  }
}

function handleNavClick(targetId, subId = null) {
  manualNavigationUntil = Date.now() + 700;
  setActiveMain(targetId);
  setActiveSub(subId);
}

mainLinks.forEach(link => {
  link.addEventListener('click', () => {
    handleNavClick(link.dataset.mainLink);
  });
});

tocGroupLinks.forEach(link => {
  link.addEventListener('click', () => {
    handleNavClick(link.dataset.groupLink);
  });
});

tocSubLinks.forEach(link => {
  link.addEventListener('click', () => {
    handleNavClick('projekte', link.dataset.subLink);
  });
});

updateNavigation();
updateHeaderVisibility();

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);

// E-Mail Kontakt
document.querySelectorAll('.show-email').forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        
        const encoded = "a29udGFrdEBpdHMtZGl0ei5kZQ=="; 
        const email = atob(encoded);
        
        // Finde den Link, der direkt neben dem geklickten Button liegt
        const link = this.nextElementSibling; 
        
        link.href = "mailto:" + email;
        link.textContent = email;
        link.style.display = "inline";
        
        // Verstecke den Button, der geklickt wurde
        this.style.display = "none";
    });
});