import { jsxRenderer } from 'hono/jsx-renderer'
import type { Lang } from './lib/i18n'
import { t } from './lib/i18n'
import type { AppMode, SessionUser } from './lib/auth'

declare module 'hono' {
  interface ContextRenderer {
    (content: string | Promise<string>, props?: {
      title?: string
      lang?: Lang
      currentPath?: string
      showBack?: boolean
      // ── 双模式新增 ──
      mode?: AppMode
      user?: SessionUser
      chainReturnUrl?: string
      chainSource?: string
    }): Response | Promise<Response>
  }
}

export const renderer = jsxRenderer(({
  children, title, lang = 'zh', currentPath = '/', showBack = false,
  mode = 'standalone', user, chainReturnUrl, chainSource,
}) => {
  const otherLang = lang === 'zh' ? 'en' : 'zh'
  const langHref = currentPath.split('?')[0] + (otherLang === 'en' ? '?lang=en' : '')
  const isChain = mode === 'chain'
  const roleLabel: Record<string, string> = {
    admin: lang === 'zh' ? '管理员' : 'Admin',
    operator: lang === 'zh' ? '操作员' : 'Operator',
    viewer: lang === 'zh' ? '查看者' : 'Viewer',
  }

  return (
    <html lang={lang === 'zh' ? 'zh-CN' : 'en'}>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title ? `${title} — ${t('appName', lang)}` : t('appName', lang)}</title>
        <link href="/static/style.css" rel="stylesheet" />
        <script src="https://cdn.tailwindcss.com"></script>
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

        {/* ── Chain 模式顶部条 ── */}
        {isChain && (
          <div class="fixed top-0 left-0 right-0 z-[110] h-[28px] flex items-center justify-center gap-2 text-xs text-white" style={{ background: 'linear-gradient(90deg, #3D8F83, #49A89A, #5DC4B3)' }} role="status" aria-label={t('modeChain', lang)}>
            <i class="fas fa-link text-[10px]" aria-hidden="true"></i>
            <span>{t('modeChain', lang)}</span>
            <span class="opacity-60">|</span>
            <span class="opacity-80">{t('chainFrom', lang)}: {chainSource || 'unknown'}</span>
            {chainReturnUrl && (
              <>
                <span class="opacity-60">|</span>
                <a href={chainReturnUrl} class="underline hover:opacity-100 opacity-80 sc-transition">{t('chainReturn', lang)}</a>
              </>
            )}
          </div>
        )}

        {/* ── Navbar 56px 毛玻璃 ── */}
        <nav class="sc-navbar" style={isChain ? { top: '28px' } : {}} role="navigation" aria-label={lang === 'zh' ? '主导航' : 'Main navigation'}>
          <div class="sc-navbar-inner">
            {/* Left: Logo + Name + Nav */}
            <div class="flex items-center gap-5">
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
              {/* Mode badge (inline in navbar) */}
              {isChain ? (
                <span class="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: 'rgba(61,143,131,0.12)', color: '#3D8F83' }}>
                  <i class="fas fa-link text-[8px]" aria-hidden="true"></i>
                  {t('chainBadge', lang)}
                </span>
              ) : (
                <span class="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: 'rgba(93,196,179,0.12)', color: '#3a9e8f' }}>
                  <span class="w-1.5 h-1.5 rounded-full bg-brand" aria-hidden="true"></span>
                  {t('modeStandalone', lang)}
                </span>
              )}
              {/* Nav links */}
              <div class="hidden md:flex items-center gap-1">
                <a href={lang === 'en' ? '/?lang=en' : '/'} class={`nav-link ${currentPath === '/' ? 'active' : ''}`}>{t('navDashboard', lang)}</a>
                <a href={lang === 'en' ? '/uac?lang=en' : '/uac'} class={`nav-link ${currentPath.startsWith('/uac') ? 'active' : ''}`}>{t('navUAC', lang)}</a>
                <a href={lang === 'en' ? '/allocation?lang=en' : '/allocation'} class={`nav-link ${currentPath.startsWith('/allocation') ? 'active' : ''}`}>{t('navAllocation', lang)}</a>
                <a href={lang === 'en' ? '/reconciliation?lang=en' : '/reconciliation'} class={`nav-link ${currentPath.startsWith('/reconciliation') ? 'active' : ''}`}>{t('navRecon', lang)}</a>
                <a href={lang === 'en' ? '/audit?lang=en' : '/audit'} class={`nav-link ${currentPath.startsWith('/audit') ? 'active' : ''}`}>{t('navAudit', lang)}</a>
              </div>
            </div>
            {/* Right: User / Chain back / Lang / Logout */}
            <div class="flex items-center gap-2">
              {/* Chain: Back to Main button */}
              {isChain && chainReturnUrl && (
                <a href={chainReturnUrl} class="sc-btn sc-btn-ghost text-[13px]" aria-label={t('chainReturn', lang)}>
                  <i class="fas fa-arrow-left" aria-hidden="true"></i>
                  <span class="hidden sm:inline">{t('chainReturn', lang)}</span>
                </a>
              )}
              {/* Standalone: showBack for sub-pages */}
              {!isChain && showBack && (
                <a href={lang === 'en' ? '/?lang=en' : '/'} class="sc-btn sc-btn-ghost text-[13px]" aria-label={t('backToMain', lang)}>
                  <i class="fas fa-arrow-left" aria-hidden="true"></i>
                  <span class="hidden sm:inline">{t('backToMain', lang)}</span>
                </a>
              )}
              {/* User info dropdown trigger */}
              {user && (
                <div class="relative" id="user-menu-container">
                  <button
                    class="flex items-center gap-2 px-2 py-1 rounded-lg sc-transition hover:bg-black/[0.04]"
                    onclick="document.getElementById('user-dropdown').classList.toggle('hidden')"
                    aria-haspopup="true"
                    aria-expanded="false"
                    aria-label={user.name}
                  >
                    <div class="w-7 h-7 rounded-full bg-brand flex items-center justify-center text-white text-xs font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <span class="hidden sm:block text-xs text-apple-text font-medium">{user.name}</span>
                    <i class="fas fa-chevron-down text-[8px] text-apple-tertiary" aria-hidden="true"></i>
                  </button>
                  {/* Dropdown */}
                  <div id="user-dropdown" class="hidden absolute right-0 top-full mt-1 w-52 glass-card p-2 z-50" role="menu">
                    <div class="px-3 py-2 border-b border-apple-divider mb-1">
                      <div class="text-sm font-medium">{user.name}</div>
                      <div class="text-xs text-apple-tertiary">{user.email || user.sub}</div>
                      <div class="flex items-center gap-2 mt-1">
                        <span class="text-xs text-apple-secondary">{roleLabel[user.role] || user.role}</span>
                        {isChain ? (
                          <span class="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(61,143,131,0.12)', color: '#3D8F83' }}>{t('chainBadge', lang)}</span>
                        ) : (
                          <span class="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(93,196,179,0.1)', color: '#3a9e8f' }}>{t('modeStandalone', lang)}</span>
                        )}
                      </div>
                    </div>
                    <a href={lang === 'en' ? '/audit?lang=en' : '/audit'} class="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-black/[0.04] sc-transition no-underline text-apple-text" role="menuitem">
                      <i class="fas fa-clipboard-list text-xs text-apple-tertiary w-4" aria-hidden="true"></i>
                      {t('navAudit', lang)}
                    </a>
                    <div class="border-t border-apple-divider mt-1 pt-1">
                      <a href="/logout" class="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-[rgba(255,59,48,0.06)] sc-transition no-underline text-danger" role="menuitem">
                        <i class="fas fa-sign-out-alt text-xs w-4" aria-hidden="true"></i>
                        {t('logout', lang)}
                      </a>
                    </div>
                  </div>
                </div>
              )}
              {/* Lang switch */}
              <a href={langHref} class="sc-btn sc-btn-secondary text-[12px] px-3" aria-label={lang === 'zh' ? 'Switch to English' : '切换到中文'}>
                <i class="fas fa-globe" aria-hidden="true"></i>
                {t('langSwitch', lang)}
              </a>
              {/* Mobile menu */}
              <button class="md:hidden sc-btn sc-btn-secondary px-2" onclick="document.getElementById('mobile-nav').classList.toggle('hidden')" aria-label={lang === 'zh' ? '打开菜单' : 'Open menu'} aria-expanded="false">
                <i class="fas fa-bars" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        </nav>
        {/* Mobile nav */}
        <div id="mobile-nav" class="hidden fixed left-0 right-0 z-50 glass border-b border-apple-divider md:hidden p-4 flex flex-col gap-2" style={isChain ? { top: '84px' } : { top: '56px' }}>
          <a href={lang === 'en' ? '/?lang=en' : '/'} class={`nav-link block ${currentPath === '/' ? 'active' : ''}`}>{t('navDashboard', lang)}</a>
          <a href={lang === 'en' ? '/uac?lang=en' : '/uac'} class={`nav-link block ${currentPath.startsWith('/uac') ? 'active' : ''}`}>{t('navUAC', lang)}</a>
          <a href={lang === 'en' ? '/allocation?lang=en' : '/allocation'} class={`nav-link block ${currentPath.startsWith('/allocation') ? 'active' : ''}`}>{t('navAllocation', lang)}</a>
          <a href={lang === 'en' ? '/reconciliation?lang=en' : '/reconciliation'} class={`nav-link block ${currentPath.startsWith('/reconciliation') ? 'active' : ''}`}>{t('navRecon', lang)}</a>
          <a href={lang === 'en' ? '/audit?lang=en' : '/audit'} class={`nav-link block ${currentPath.startsWith('/audit') ? 'active' : ''}`}>{t('navAudit', lang)}</a>
        </div>

        {/* ── Main Content ── */}
        <main id="main-content" class="sc-content" style={isChain ? { paddingTop: '108px' } : {}} role="main">
          {children}
        </main>

        {/* ── Footer ── */}
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

        {/* ── Global JS ── */}
        <script dangerouslySetInnerHTML={{__html: `
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
            setTimeout(function() { el.classList.remove('show'); setTimeout(function() { el.remove(); }, 300); }, 3000);
          };
          SC.openModal = function(id) { var m = document.getElementById(id); if (m) { m.classList.add('open'); m.querySelector('[data-modal-close]')?.focus(); document.body.style.overflow='hidden'; } };
          SC.closeModal = function(id) { var m = document.getElementById(id); if (m) { m.classList.remove('open'); document.body.style.overflow=''; } };
          SC.openDrawer = function(id) { var o = document.getElementById(id + '-overlay'); var d = document.getElementById(id); if (o) o.classList.add('open'); if (d) { d.classList.add('open'); document.body.style.overflow='hidden'; } };
          SC.closeDrawer = function(id) { var o = document.getElementById(id + '-overlay'); var d = document.getElementById(id); if (o) o.classList.remove('open'); if (d) { d.classList.remove('open'); document.body.style.overflow=''; } };
          document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
              document.querySelectorAll('.sc-modal-overlay.open').forEach(function(m) { m.classList.remove('open'); });
              document.querySelectorAll('.sc-drawer-overlay.open').forEach(function(o) { o.classList.remove('open'); });
              document.querySelectorAll('.sc-drawer.open').forEach(function(d) { d.classList.remove('open'); });
              document.body.style.overflow = '';
            }
          });
          // Close user dropdown on outside click
          document.addEventListener('click', function(e) {
            var dd = document.getElementById('user-dropdown');
            var ct = document.getElementById('user-menu-container');
            if (dd && ct && !ct.contains(e.target)) dd.classList.add('hidden');
          });
          SC.sortTable = function(tableId, colIdx, type) { var table = document.getElementById(tableId); if (!table) return; var th = table.querySelectorAll('th')[colIdx]; var isDesc = th.classList.contains('sorted') && !th.classList.contains('desc'); table.querySelectorAll('th').forEach(function(h) { h.classList.remove('sorted', 'desc'); }); th.classList.add('sorted'); if (isDesc) th.classList.add('desc'); var tbody = table.querySelector('tbody'); var rows = Array.from(tbody.querySelectorAll('tr')); rows.sort(function(a, b) { var aVal = a.children[colIdx]?.textContent?.trim() || ''; var bVal = b.children[colIdx]?.textContent?.trim() || ''; if (type === 'number') { aVal = parseFloat(aVal.replace(/[^0-9.-]/g, '')) || 0; bVal = parseFloat(bVal.replace(/[^0-9.-]/g, '')) || 0; } var cmp = type === 'number' ? aVal - bVal : aVal.localeCompare(bVal); return isDesc ? -cmp : cmp; }); rows.forEach(function(r) { tbody.appendChild(r); }); };
          SC.goPage = function(tableId, page, perPage) { var table = document.getElementById(tableId); if (!table) return; var rows = Array.from(table.querySelectorAll('tbody tr')); var total = rows.length; var totalPages = Math.ceil(total / perPage); page = Math.max(1, Math.min(page, totalPages)); rows.forEach(function(r, i) { r.style.display = (i >= (page-1)*perPage && i < page*perPage) ? '' : 'none'; }); var pag = table.closest('.sc-table-container')?.querySelector('.sc-pagination'); if (pag) { var info = pag.querySelector('.pag-info'); if (info) info.textContent = page + ' / ' + totalPages; var prevBtn = pag.querySelector('[data-pag-prev]'); var nextBtn = pag.querySelector('[data-pag-next]'); if (prevBtn) prevBtn.disabled = page <= 1; if (nextBtn) nextBtn.disabled = page >= totalPages; pag.dataset.currentPage = page; } };
          SC.filterTable = function(tableId, colIdx, value) { var table = document.getElementById(tableId); if (!table) return; var rows = table.querySelectorAll('tbody tr'); rows.forEach(function(r) { if (!value) { r.dataset.filtered = 'false'; r.style.display = ''; return; } var cell = r.children[colIdx]?.textContent?.trim().toLowerCase() || ''; var match = cell.includes(value.toLowerCase()); r.dataset.filtered = match ? 'false' : 'true'; r.style.display = match ? '' : 'none'; }); };
          SC.searchTable = function(tableId, keyword) { var table = document.getElementById(tableId); if (!table) return; var rows = table.querySelectorAll('tbody tr'); rows.forEach(function(r) { if (!keyword) { r.style.display = ''; return; } var text = r.textContent?.toLowerCase() || ''; r.style.display = text.includes(keyword.toLowerCase()) ? '' : 'none'; }); };
        `}} />
      </body>
    </html>
  )
})
