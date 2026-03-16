(function () {
  if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.classList.add('dark');
  }
})();

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  updateThemeIcon(!isDark);
}

function updateThemeIcon(isLight) {
  const icon  = document.getElementById('themeIcon');
  const label = document.getElementById('themeLabel');

  if (icon) {
    icon.innerHTML = isLight
      ? '<circle cx="12" cy="12" r="4.5"/>' +
        '<line x1="12" y1="2"  x2="12" y2="5"/>' +
        '<line x1="12" y1="19" x2="12" y2="22"/>' +
        '<line x1="4.22" y1="4.22"  x2="6.34" y2="6.34"/>' +
        '<line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/>' +
        '<line x1="2"  y1="12" x2="5"  y2="12"/>' +
        '<line x1="19" y1="12" x2="22" y2="12"/>' +
        '<line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/>' +
        '<line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/>'
      : '<path stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>';
  }

  // ← this is the only new line
  if (label) label.textContent = isLight ? 'Light Mode' : 'Dark Mode';
}

document.addEventListener('DOMContentLoaded', function () {
  updateThemeIcon(!document.documentElement.classList.contains('dark'));
});