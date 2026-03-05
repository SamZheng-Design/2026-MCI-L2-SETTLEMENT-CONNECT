// ─────────────────────────────────────────────────
// 登录页 — V33 Teal 暗色主题
// 深沉 Teal 背景 + 赛博光晕 + 网格线 + 粒子动画
// 对标 MC-Revolution V33 配色范式
// ─────────────────────────────────────────────────
import type { Lang } from '../lib/i18n'
import { t } from '../lib/i18n'
import { DEMO_USERS } from '../lib/auth'

export function LoginPage({ lang, error, expired }: { lang: Lang; error?: boolean; expired?: boolean }) {
  return (
    <div class="login-page">
      {/* ── V33 暗色 Teal 背景 ── */}
      <div class="login-bg" aria-hidden="true">
        {/* 网格线 */}
        <div class="login-grid"></div>
        {/* 光晕球 Orb 1 */}
        <div class="login-orb login-orb-1"></div>
        {/* 光晕球 Orb 2 */}
        <div class="login-orb login-orb-2"></div>
        {/* 光晕球 Orb 3 */}
        <div class="login-orb login-orb-3"></div>
      </div>

      {/* ── Login Card ── */}
      <div class="relative z-10 w-full max-w-[420px] px-4">
        {/* Logo + Title */}
        <div class="text-center mb-8">
          <div class="login-logo-pulse mb-5">
            <svg width="56" height="56" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <circle cx="12" cy="16" r="10" fill="#5DC4B3" opacity="0.9" />
              <circle cx="20" cy="16" r="10" fill="#7DD4C7" opacity="0.6" />
              <path d="M16 8.5a10 10 0 0 1 0 15" fill="white" opacity="0.35" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-white">
            {lang === 'zh' ? '履约通' : 'Settlement Connect'}
          </h1>
          <p class="text-white/50 text-sm mt-2">{t('loginSubtitle', lang)}</p>
          {/* Mode badge */}
          <div class="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(93,196,179,0.15)', color: '#7DD4C7' }}>
            <span class="w-1.5 h-1.5 rounded-full" style={{ background: '#5DC4B3' }}></span>
            {t('modeStandalone', lang)}
          </div>
        </div>

        {/* Login Card — 暗色毛玻璃 */}
        <div class="login-card">
          {/* Error / Expired alerts */}
          {expired && (
            <div class="flex items-center gap-2 p-3 rounded-lg mb-4 text-sm" style={{ background: 'rgba(255,159,10,0.12)', color: '#FF9F0A' }} role="alert">
              <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
              {t('loginExpired', lang)}
            </div>
          )}
          {error && (
            <div class="flex items-center gap-2 p-3 rounded-lg mb-4 text-sm" style={{ background: 'rgba(255,55,95,0.12)', color: '#FF375F' }} role="alert">
              <i class="fas fa-times-circle" aria-hidden="true"></i>
              {t('loginError', lang)}
            </div>
          )}

          {/* Login Form */}
          <form method="POST" action={`/login${lang === 'en' ? '?lang=en' : ''}`} class="space-y-4" aria-label={t('loginTitle', lang)}>
            <div>
              <label for="username" class="block text-sm font-medium text-white/60 mb-1.5">{t('loginUsername', lang)}</label>
              <input
                type="text" id="username" name="username" required autocomplete="username"
                class="login-input"
                placeholder={lang === 'zh' ? '输入用户名' : 'Enter username'}
              />
            </div>
            <div>
              <label for="password" class="block text-sm font-medium text-white/60 mb-1.5">{t('loginPassword', lang)}</label>
              <input
                type="password" id="password" name="password" required autocomplete="current-password"
                class="login-input"
                placeholder={lang === 'zh' ? '输入密码' : 'Enter password'}
              />
            </div>
            <button type="submit" class="login-btn-primary">
              {t('loginBtn', lang)}
            </button>
          </form>

          {/* Divider */}
          <div class="flex items-center gap-3 my-5">
            <div class="flex-1 h-px" style={{ background: 'rgba(93,196,179,0.15)' }}></div>
            <span class="text-xs text-white/30">{t('loginDemo', lang)}</span>
            <div class="flex-1 h-px" style={{ background: 'rgba(93,196,179,0.15)' }}></div>
          </div>

          {/* Demo accounts */}
          <div class="space-y-2">
            <p class="text-xs text-white/30 mb-2">
              <i class="fas fa-info-circle mr-1" aria-hidden="true"></i>
              {t('loginDemoHint', lang)}
            </p>
            {DEMO_USERS.map(u => {
              const roleLabel: Record<string, string> = {
                admin: lang === 'zh' ? '管理员' : 'Admin',
                operator: lang === 'zh' ? '操作员' : 'Operator',
                viewer: lang === 'zh' ? '查看者' : 'Viewer',
              }
              const roleColor: Record<string, string> = {
                admin: '#5DC4B3',
                operator: '#FF9F0A',
                viewer: '#32ADE6',
              }
              return (
                <button
                  type="button"
                  class="login-demo-btn"
                  onclick={`document.getElementById('username').value='${u.username}';document.getElementById('password').value='${u.password}'`}
                  aria-label={`${lang === 'zh' ? '使用' : 'Use'} ${u.name} (${roleLabel[u.role]})`}
                >
                  <div class="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: `linear-gradient(135deg, ${roleColor[u.role]}, ${roleColor[u.role]}cc)` }}>
                    {u.name.charAt(0)}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-white/90">{u.name}</div>
                    <div class="text-xs text-white/35">{u.username} / {u.password}</div>
                  </div>
                  <span class="text-xs px-2 py-0.5 rounded-full" style={{ background: `${roleColor[u.role]}1a`, color: roleColor[u.role] }}>
                    {roleLabel[u.role]}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Language switch */}
        <div class="text-center mt-5">
          <a
            href={lang === 'zh' ? '/login?lang=en' : '/login'}
            class="text-xs text-white/30 hover:text-white/60 sc-transition"
          >
            <i class="fas fa-globe mr-1" aria-hidden="true"></i>
            {lang === 'zh' ? 'English' : '中文'}
          </a>
        </div>

        {/* 底部版权 */}
        <div class="text-center mt-6">
          <p class="text-[11px] text-white/20">
            MC-Revolution V33 &middot; Micro Connect
          </p>
        </div>
      </div>

      {/* ── 粒子浮动动画 (CSS-only) ── */}
      <div class="login-particles" aria-hidden="true">
        <div class="login-particle" style={{ left: '15%', top: '20%', animationDelay: '0s', animationDuration: '18s' }}></div>
        <div class="login-particle" style={{ left: '70%', top: '60%', animationDelay: '3s', animationDuration: '22s' }}></div>
        <div class="login-particle" style={{ left: '40%', top: '80%', animationDelay: '6s', animationDuration: '20s' }}></div>
        <div class="login-particle" style={{ left: '85%', top: '30%', animationDelay: '9s', animationDuration: '16s' }}></div>
        <div class="login-particle" style={{ left: '25%', top: '55%', animationDelay: '12s', animationDuration: '24s' }}></div>
      </div>
    </div>
  )
}
