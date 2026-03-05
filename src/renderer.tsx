import { jsxRenderer } from 'hono/jsx-renderer'
import type { Lang } from './lib/i18n'
import { t } from './lib/i18n'

declare module 'hono' {
  interface ContextRenderer {
    (content: string | Promise<string>, props?: {
      title?: string
      lang?: Lang
      currentPath?: string
      showBack?: boolean
    }): Response | Promise<Response>
  }
}

export const renderer = jsxRenderer(({ children, title, lang = 'zh', currentPath = '/', showBack = false }) => {
  const otherLang = lang === 'zh' ? 'en' : 'zh'
  const langHref = currentPath.split('?')[0] + (otherLang === 'en' ? '?lang=en' : '')

  return (
    <html lang={lang === 'zh' ? 'zh-CN' : 'en'}>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title ? `${title} — ${t('appName', lang)}` : t('appName', lang)}</title>
        <link href="/static/style.css" rel="stylesheet" />
        <script src="https://cdn.tailwindcss.com"></script>
        {/* Tailwind config with Apple-style design tokens */}
        <script dangerouslySetInnerHTML={{__html: `
          tailwind.config = {
            theme: {
              extend: {
                colors: {
                  brand:   { DEFAULT: '#5DC4B3', light: 'rgba(93,196,179,0.1)', dark: '#4db3a2', 50: '#eef9f7', 100: '#d5f0ec', 200: '#afe2db', 300: '#80cfc3', 400: '#5DC4B3', 500: '#3a9e8f', 600: '#2e8073', 700: '#26665d', 800: '#23524c', 900: '#1f4540' },
                  apple:   { text: '#1d1d1f', secondary: '#6e6e73', tertiary: '#86868b', bg: '#f5f5f7', card: 'rgba(255,255,255,0.65)', divider: 'rgba(0,0,0,0.06)' },
                  success: '#34C759',
                  warning: '#F5A623',
                  danger:  '#FF3B30',
                },
                fontFamily: {
                  sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'PingFang SC', 'Noto Sans SC', 'sans-serif'],
                },
                borderRadius: {
                  'sm': '6px', 'DEFAULT': '8px', 'md': '10px', 'lg': '12px', 'xl': '16px', '2xl': '20px', '3xl': '24px',
                },
                boxShadow: {
                  'card': '0 2px 12px rgba(0,0,0,0.06), 0 0.5px 1px rgba(0,0,0,0.04)',
                  'card-hover': '0 4px 24px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)',
                  'modal': '0 24px 80px rgba(0,0,0,0.16)',
                  'toast': '0 4px 24px rgba(0,0,0,0.12)',
                },
                transitionDuration: { 'DEFAULT': '280ms' },
                transitionTimingFunction: { 'apple': 'cubic-bezier(0.25, 0.1, 0.25, 1)' },
              }
            }
          }
        `}} />
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.0/css/all.min.css" rel="stylesheet" />
      </head>
      <body class="bg-apple-bg text-apple-text font-sans">
        {/* Skip to content — a11y */}
        <a href="#main-content" class="skip-link">{lang === 'zh' ? '跳转到主要内容' : 'Skip to main content'}</a>

        {/* ── Navbar 56px 毛玻璃 ── */}
        <nav class="sc-navbar" role="navigation" aria-label={lang === 'zh' ? '主导航' : 'Main navigation'}>
          <div class="sc-navbar-inner">
            {/* Left: Logo + Name + Nav */}
            <div class="flex items-center gap-5">
              {/* 双圆 SVG Logo */}
              <a href={lang === 'en' ? '/?lang=en' : '/'} class="flex items-center gap-2.5 no-underline" aria-label={t('appName', lang)}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                  <circle cx="12" cy="16" r="10" fill="#5DC4B3" opacity="0.85" />
                  <circle cx="20" cy="16" r="10" fill="#5DC4B3" opacity="0.55" />
                  <path d="M16 8.5a10 10 0 0 1 0 15" fill="white" opacity="0.3" />
                </svg>
                <span class="text-[15px] font-semibold tracking-tight text-apple-text hidden sm:inline">
                  {lang === 'zh' ? '履约通' : 'Settlement Connect'}
                </span>
              </a>
              {/* Nav links */}
              <div class="hidden md:flex items-center gap-1">
                <a href={lang === 'en' ? '/?lang=en' : '/'} class={`nav-link ${currentPath === '/' ? 'active' : ''}`}>{t('navDashboard', lang)}</a>
                <a href={lang === 'en' ? '/uac?lang=en' : '/uac'} class={`nav-link ${currentPath.startsWith('/uac') ? 'active' : ''}`}>{t('navUAC', lang)}</a>
                <a href={lang === 'en' ? '/allocation?lang=en' : '/allocation'} class={`nav-link ${currentPath.startsWith('/allocation') ? 'active' : ''}`}>{t('navAllocation', lang)}</a>
                <a href={lang === 'en' ? '/reconciliation?lang=en' : '/reconciliation'} class={`nav-link ${currentPath.startsWith('/reconciliation') ? 'active' : ''}`}>{t('navRecon', lang)}</a>
              </div>
            </div>
            {/* Right: Lang switch + Back */}
            <div class="flex items-center gap-3">
              {showBack && (
                <a href={lang === 'en' ? '/?lang=en' : '/'} class="sc-btn sc-btn-ghost text-[13px]" aria-label={t('backToMain', lang)}>
                  <i class="fas fa-arrow-left" aria-hidden="true"></i>
                  <span class="hidden sm:inline">{t('backToMain', lang)}</span>
                </a>
              )}
              <a href={langHref} class="sc-btn sc-btn-secondary text-[12px] px-3" aria-label={lang === 'zh' ? 'Switch to English' : '切换到中文'}>
                <i class="fas fa-globe" aria-hidden="true"></i>
                {t('langSwitch', lang)}
              </a>
              {/* Mobile menu button */}
              <button class="md:hidden sc-btn sc-btn-secondary px-2" onclick="document.getElementById('mobile-nav').classList.toggle('hidden')" aria-label={lang === 'zh' ? '打开菜单' : 'Open menu'} aria-expanded="false">
                <i class="fas fa-bars" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        </nav>
        {/* Mobile nav dropdown */}
        <div id="mobile-nav" class="hidden fixed top-[56px] left-0 right-0 z-50 glass border-b border-apple-divider md:hidden p-4 flex flex-col gap-2">
          <a href={lang === 'en' ? '/?lang=en' : '/'} class={`nav-link block ${currentPath === '/' ? 'active' : ''}`}>{t('navDashboard', lang)}</a>
          <a href={lang === 'en' ? '/uac?lang=en' : '/uac'} class={`nav-link block ${currentPath.startsWith('/uac') ? 'active' : ''}`}>{t('navUAC', lang)}</a>
          <a href={lang === 'en' ? '/allocation?lang=en' : '/allocation'} class={`nav-link block ${currentPath.startsWith('/allocation') ? 'active' : ''}`}>{t('navAllocation', lang)}</a>
          <a href={lang === 'en' ? '/reconciliation?lang=en' : '/reconciliation'} class={`nav-link block ${currentPath.startsWith('/reconciliation') ? 'active' : ''}`}>{t('navRecon', lang)}</a>
        </div>

        {/* ── Main Content ── */}
        <main id="main-content" class="sc-content" role="main">
          {children}
        </main>

        {/* ── Footer (Aurora dark gradient) ── */}
        <footer class="sc-footer" role="contentinfo">
          <div class="relative z-10 max-w-[1280px] mx-auto">
            <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <svg width="24" height="24" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                  <circle cx="12" cy="16" r="10" fill="#5DC4B3" opacity="0.85" />
                  <circle cx="20" cy="16" r="10" fill="#5DC4B3" opacity="0.55" />
                </svg>
                <span class="text-sm text-white/80 font-medium">{t('footerSlogan', lang)}</span>
              </div>
              <span class="text-xs text-white/50">{t('footerCopy', lang)}</span>
            </div>
          </div>
        </footer>

        {/* ── Toast Container ── */}
        <div id="toast-container" class="sc-toast-container" role="status" aria-live="polite"></div>

        {/* ── Global Inline Scripts ── */}
        <script dangerouslySetInnerHTML={{__html: `
          // Toast system
          window.SC = window.SC || {};
          SC.toast = function(msg, type) {
            type = type || 'info';
            var container = document.getElementById('toast-container');
            var el = document.createElement('div');
            el.className = 'sc-toast sc-toast-' + type;
            el.setAttribute('role', 'alert');
            var icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
            el.innerHTML = '<i class="fas ' + (icons[type] || icons.info) + '"></i><span>' + msg + '</span>';
            container.appendChild(el);
            requestAnimationFrame(function() { el.classList.add('show'); });
            setTimeout(function() {
              el.classList.remove('show');
              setTimeout(function() { el.remove(); }, 300);
            }, 3000);
          };

          // Modal open/close
          SC.openModal = function(id) {
            var m = document.getElementById(id);
            if (m) { m.classList.add('open'); m.querySelector('[data-modal-close]')?.focus(); document.body.style.overflow='hidden'; }
          };
          SC.closeModal = function(id) {
            var m = document.getElementById(id);
            if (m) { m.classList.remove('open'); document.body.style.overflow=''; }
          };

          // Drawer open/close
          SC.openDrawer = function(id) {
            var o = document.getElementById(id + '-overlay');
            var d = document.getElementById(id);
            if (o) o.classList.add('open');
            if (d) { d.classList.add('open'); document.body.style.overflow='hidden'; }
          };
          SC.closeDrawer = function(id) {
            var o = document.getElementById(id + '-overlay');
            var d = document.getElementById(id);
            if (o) o.classList.remove('open');
            if (d) { d.classList.remove('open'); document.body.style.overflow=''; }
          };

          // Keyboard: Escape to close modals/drawers
          document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
              document.querySelectorAll('.sc-modal-overlay.open').forEach(function(m) { m.classList.remove('open'); });
              document.querySelectorAll('.sc-drawer-overlay.open').forEach(function(o) { o.classList.remove('open'); });
              document.querySelectorAll('.sc-drawer.open').forEach(function(d) { d.classList.remove('open'); });
              document.body.style.overflow = '';
            }
          });

          // Sort table
          SC.sortTable = function(tableId, colIdx, type) {
            var table = document.getElementById(tableId);
            if (!table) return;
            var th = table.querySelectorAll('th')[colIdx];
            var isDesc = th.classList.contains('sorted') && !th.classList.contains('desc');
            table.querySelectorAll('th').forEach(function(h) { h.classList.remove('sorted', 'desc'); });
            th.classList.add('sorted');
            if (isDesc) th.classList.add('desc');
            var tbody = table.querySelector('tbody');
            var rows = Array.from(tbody.querySelectorAll('tr'));
            rows.sort(function(a, b) {
              var aVal = a.children[colIdx]?.textContent?.trim() || '';
              var bVal = b.children[colIdx]?.textContent?.trim() || '';
              if (type === 'number') {
                aVal = parseFloat(aVal.replace(/[^0-9.-]/g, '')) || 0;
                bVal = parseFloat(bVal.replace(/[^0-9.-]/g, '')) || 0;
              }
              var cmp = type === 'number' ? aVal - bVal : aVal.localeCompare(bVal);
              return isDesc ? -cmp : cmp;
            });
            rows.forEach(function(r) { tbody.appendChild(r); });
          };

          // Pagination
          SC.goPage = function(tableId, page, perPage) {
            var table = document.getElementById(tableId);
            if (!table) return;
            var rows = Array.from(table.querySelectorAll('tbody tr'));
            var total = rows.length;
            var totalPages = Math.ceil(total / perPage);
            page = Math.max(1, Math.min(page, totalPages));
            rows.forEach(function(r, i) {
              r.style.display = (i >= (page-1)*perPage && i < page*perPage) ? '' : 'none';
            });
            // Update pagination UI
            var pag = table.closest('.sc-table-container')?.querySelector('.sc-pagination');
            if (pag) {
              var info = pag.querySelector('.pag-info');
              if (info) info.textContent = page + ' / ' + totalPages;
              var prevBtn = pag.querySelector('[data-pag-prev]');
              var nextBtn = pag.querySelector('[data-pag-next]');
              if (prevBtn) prevBtn.disabled = page <= 1;
              if (nextBtn) nextBtn.disabled = page >= totalPages;
              pag.dataset.currentPage = page;
            }
          };

          // Filter table
          SC.filterTable = function(tableId, colIdx, value) {
            var table = document.getElementById(tableId);
            if (!table) return;
            var rows = table.querySelectorAll('tbody tr');
            rows.forEach(function(r) {
              if (!value) { r.dataset.filtered = 'false'; r.style.display = ''; return; }
              var cell = r.children[colIdx]?.textContent?.trim().toLowerCase() || '';
              var match = cell.includes(value.toLowerCase());
              r.dataset.filtered = match ? 'false' : 'true';
              r.style.display = match ? '' : 'none';
            });
          };

          // Search table (across all columns)
          SC.searchTable = function(tableId, keyword) {
            var table = document.getElementById(tableId);
            if (!table) return;
            var rows = table.querySelectorAll('tbody tr');
            rows.forEach(function(r) {
              if (!keyword) { r.style.display = ''; return; }
              var text = r.textContent?.toLowerCase() || '';
              r.style.display = text.includes(keyword.toLowerCase()) ? '' : 'none';
            });
          };
        `}} />
      </body>
    </html>
  )
})
