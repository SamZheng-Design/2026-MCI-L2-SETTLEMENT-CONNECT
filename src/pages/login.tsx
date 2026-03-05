// ─────────────────────────────────────────────────
// 登录页 — Standalone 模式
// Apple 风格，毛玻璃登录卡片，演示账号快捷填入
// ─────────────────────────────────────────────────
import type { Lang } from '../lib/i18n'
import { t } from '../lib/i18n'
import { DEMO_USERS } from '../lib/auth'

export function LoginPage({ lang, error, expired }: { lang: Lang; error?: boolean; expired?: boolean }) {
  return (
    <div class="min-h-screen bg-apple-bg flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #f5f5f7 0%, #e8f5f2 50%, #f5f5f7 100%)' }}>
      {/* Background decoration */}
      <div class="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div class="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(93,196,179,0.08) 0%, transparent 70%)' }}></div>
        <div class="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(93,196,179,0.06) 0%, transparent 70%)' }}></div>
      </div>

      <div class="relative z-10 w-full max-w-[420px]">
        {/* Logo + Title */}
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center mb-4">
            <svg width="48" height="48" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <circle cx="12" cy="16" r="10" fill="#5DC4B3" opacity="0.85" />
              <circle cx="20" cy="16" r="10" fill="#5DC4B3" opacity="0.55" />
              <path d="M16 8.5a10 10 0 0 1 0 15" fill="white" opacity="0.3" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-apple-text">
            {lang === 'zh' ? '履约通' : 'Settlement Connect'}
          </h1>
          <p class="text-apple-secondary text-sm mt-1">{t('loginSubtitle', lang)}</p>
          {/* Mode badge */}
          <div class="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(93,196,179,0.1)', color: '#3a9e8f' }}>
            <span class="w-1.5 h-1.5 rounded-full bg-brand"></span>
            {t('modeStandalone', lang)}
          </div>
        </div>

        {/* Login Card */}
        <div class="glass-card p-8">
          {/* Error / Expired alerts */}
          {expired && (
            <div class="flex items-center gap-2 p-3 rounded-lg mb-4 text-sm" style={{ background: 'rgba(245,166,35,0.1)', color: '#c78520' }} role="alert">
              <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
              {t('loginExpired', lang)}
            </div>
          )}
          {error && (
            <div class="flex items-center gap-2 p-3 rounded-lg mb-4 text-sm" style={{ background: 'rgba(255,59,48,0.1)', color: '#d70015' }} role="alert">
              <i class="fas fa-times-circle" aria-hidden="true"></i>
              {t('loginError', lang)}
            </div>
          )}

          {/* Login Form */}
          <form method="POST" action={`/login${lang === 'en' ? '?lang=en' : ''}`} class="space-y-4" aria-label={t('loginTitle', lang)}>
            <div>
              <label for="username" class="block text-sm font-medium text-apple-secondary mb-1.5">{t('loginUsername', lang)}</label>
              <input
                type="text" id="username" name="username" required autocomplete="username"
                class="w-full h-11 px-4 rounded-lg border border-apple-divider bg-white text-apple-text text-sm outline-none sc-transition focus:border-brand focus:ring-2 focus:ring-brand-light"
                placeholder={lang === 'zh' ? '输入用户名' : 'Enter username'}
              />
            </div>
            <div>
              <label for="password" class="block text-sm font-medium text-apple-secondary mb-1.5">{t('loginPassword', lang)}</label>
              <input
                type="password" id="password" name="password" required autocomplete="current-password"
                class="w-full h-11 px-4 rounded-lg border border-apple-divider bg-white text-apple-text text-sm outline-none sc-transition focus:border-brand focus:ring-2 focus:ring-brand-light"
                placeholder={lang === 'zh' ? '输入密码' : 'Enter password'}
              />
            </div>
            <button type="submit" class="w-full h-11 rounded-lg bg-brand text-white font-medium text-sm sc-transition hover:bg-brand-dark hover:shadow-lg active:scale-[0.98]">
              {t('loginBtn', lang)}
            </button>
          </form>

          {/* Divider */}
          <div class="flex items-center gap-3 my-5">
            <div class="flex-1 h-px bg-apple-divider"></div>
            <span class="text-xs text-apple-tertiary">{t('loginDemo', lang)}</span>
            <div class="flex-1 h-px bg-apple-divider"></div>
          </div>

          {/* Demo accounts */}
          <div class="space-y-2">
            <p class="text-xs text-apple-tertiary mb-2">
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
                operator: '#F5A623',
                viewer: '#5856d6',
              }
              return (
                <button
                  type="button"
                  class="w-full flex items-center gap-3 p-3 rounded-lg border border-apple-divider bg-white/50 sc-transition hover:border-brand hover:bg-brand-light text-left"
                  onclick={`document.getElementById('username').value='${u.username}';document.getElementById('password').value='${u.password}'`}
                  aria-label={`${lang === 'zh' ? '使用' : 'Use'} ${u.name} (${roleLabel[u.role]})`}
                >
                  <div class="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: roleColor[u.role] }}>
                    {u.name.charAt(0)}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-apple-text">{u.name}</div>
                    <div class="text-xs text-apple-tertiary">{u.username} / {u.password}</div>
                  </div>
                  <span class="text-xs px-2 py-0.5 rounded-full" style={{ background: `${roleColor[u.role]}18`, color: roleColor[u.role] }}>
                    {roleLabel[u.role]}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Language switch */}
        <div class="text-center mt-4">
          <a
            href={lang === 'zh' ? '/login?lang=en' : '/login'}
            class="text-xs text-apple-tertiary hover:text-brand sc-transition"
          >
            <i class="fas fa-globe mr-1" aria-hidden="true"></i>
            {lang === 'zh' ? 'English' : '中文'}
          </a>
        </div>
      </div>
    </div>
  )
}
