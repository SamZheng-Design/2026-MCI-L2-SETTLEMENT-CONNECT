// ─────────────────────────────────────────────────
// 登录页 — V33 Teal 风格
// 对标合约通 Contract Connect 登录页设计
// 暗色 Teal 渐变背景 + 白色浮动卡片
// ─────────────────────────────────────────────────
import type { Lang } from '../lib/i18n'
import { t } from '../lib/i18n'
import { DEMO_USERS } from '../lib/auth'

export function LoginPage({ lang, error, expired }: { lang: Lang; error?: boolean; expired?: boolean }) {
  return (
    <html lang={lang === 'zh' ? 'zh-CN' : 'en'}>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{lang === 'zh' ? '登录 — 履约通' : 'Login — Settlement Connect'}</title>
        <link href="/static/style.css" rel="stylesheet" />
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{__html: `
          tailwind.config = {
            theme: {
              extend: {
                colors: {
                  brand: { DEFAULT: '#5DC4B3', light: 'rgba(93,196,179,0.1)', dark: '#49A89A', 50: '#eef9f7', 100: '#d5f0ec', 200: '#afe2db', 300: '#80cfc3', 400: '#5DC4B3', 500: '#3a9e8f', 600: '#2e8073', 700: '#26665d', 800: '#23524c', 900: '#1f4540' },
                },
                fontFamily: {
                  sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'PingFang SC', 'Noto Sans SC', 'sans-serif'],
                },
              }
            }
          }
        `}} />
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.0/css/all.min.css" rel="stylesheet" />
      </head>
      <body class="m-0 p-0">
        <div class="login-page">
          {/* ── 暗色 Teal 背景 ── */}
          <div class="login-bg" aria-hidden="true">
            <div class="login-grid"></div>
            <div class="login-orb login-orb-1"></div>
            <div class="login-orb login-orb-2"></div>
            <div class="login-orb login-orb-3"></div>
          </div>

          {/* ── 粒子 ── */}
          <div class="login-particles" aria-hidden="true">
            <div class="login-particle" style={{ left: '12%', top: '18%', animationDelay: '0s', animationDuration: '20s' }}></div>
            <div class="login-particle" style={{ left: '75%', top: '65%', animationDelay: '4s', animationDuration: '24s' }}></div>
            <div class="login-particle" style={{ left: '45%', top: '82%', animationDelay: '8s', animationDuration: '18s' }}></div>
            <div class="login-particle" style={{ left: '88%', top: '25%', animationDelay: '12s', animationDuration: '22s' }}></div>
          </div>

          {/* ── 主内容 ── */}
          <div class="relative z-10 w-full max-w-[440px] px-4">

            {/* ── Logo 区域 (暗色背景上) ── */}
            <div class="text-center mb-6">
              <div class="login-logo-pulse mb-4 inline-flex">
                <svg width="64" height="64" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                  <circle cx="12" cy="16" r="10" fill="#5DC4B3" opacity="0.85" />
                  <circle cx="20" cy="16" r="10" fill="#7DD4C7" opacity="0.55" />
                  <path d="M16 8.5a10 10 0 0 1 0 15" fill="white" opacity="0.3" />
                </svg>
              </div>
              <h1 class="text-white font-bold tracking-[0.15em] uppercase text-xl mb-1" style={{ fontFamily: "'SF Pro Display', -apple-system, system-ui, sans-serif", letterSpacing: '0.15em' }}>
                SETTLEMENT<br/>CONNECT
              </h1>
              <p class="text-white/40 text-[10px] tracking-[0.2em] uppercase mt-2">
                POWERED BY MICRO CONNECT GROUP
              </p>
              <p class="text-white/60 text-sm mt-1.5">
                {lang === 'zh' ? '履约通' : 'Settlement Connect'}
              </p>
            </div>

            {/* ── 白色登录卡片 ── */}
            <div class="login-white-card">

              {/* Error / Expired alerts */}
              {expired && (
                <div class="flex items-center gap-2 p-3 rounded-xl mb-4 text-sm" style={{ background: 'rgba(255,159,10,0.08)', color: '#c78520', border: '1px solid rgba(255,159,10,0.15)' }} role="alert">
                  <i class="fas fa-exclamation-triangle text-xs" aria-hidden="true"></i>
                  {t('loginExpired', lang)}
                </div>
              )}
              {error && (
                <div class="flex items-center gap-2 p-3 rounded-xl mb-4 text-sm" style={{ background: 'rgba(255,55,95,0.06)', color: '#d70015', border: '1px solid rgba(255,55,95,0.12)' }} role="alert">
                  <i class="fas fa-times-circle text-xs" aria-hidden="true"></i>
                  {t('loginError', lang)}
                </div>
              )}

              {/* Login Form */}
              <form method="POST" action={`/login${lang === 'en' ? '?lang=en' : ''}`} aria-label={t('loginTitle', lang)}>
                <div class="mb-4">
                  <label for="username" class="block text-sm font-medium text-gray-600 mb-2">
                    {lang === 'zh' ? '用户名 / 邮箱' : 'Username / Email'}
                  </label>
                  <input
                    type="text" id="username" name="username" required autocomplete="username"
                    class="login-form-input"
                    placeholder={lang === 'zh' ? '请输入用户名或邮箱' : 'Enter username or email'}
                  />
                </div>
                <div class="mb-4">
                  <label for="password" class="block text-sm font-medium text-gray-600 mb-2">
                    {lang === 'zh' ? '密码' : 'Password'}
                  </label>
                  <div class="relative">
                    <input
                      type="password" id="password" name="password" required autocomplete="current-password"
                      class="login-form-input"
                      placeholder={lang === 'zh' ? '请输入密码' : 'Enter password'}
                    />
                    <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 sc-transition" onclick="var p=document.getElementById('password');p.type=p.type==='password'?'text':'password'" aria-label="Toggle password">
                      <i class="fas fa-eye text-sm" aria-hidden="true"></i>
                    </button>
                  </div>
                </div>

                {/* 登录按钮 */}
                <button type="submit" class="login-btn-submit">
                  <i class="fas fa-sign-in-alt mr-2" aria-hidden="true"></i>
                  {t('loginBtn', lang)}
                </button>
              </form>

              {/* 分割线 */}
              <div class="flex items-center gap-3 my-5">
                <div class="flex-1 h-px bg-gray-200"></div>
                <span class="text-xs text-gray-400">{t('loginDemo', lang)}</span>
                <div class="flex-1 h-px bg-gray-200"></div>
              </div>

              {/* Demo 账号 */}
              <div class="space-y-2.5">
                <p class="text-xs text-gray-400 mb-1">
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
                      class="login-demo-card"
                      onclick={`document.getElementById('username').value='${u.username}';document.getElementById('password').value='${u.password}'`}
                      aria-label={`${lang === 'zh' ? '使用' : 'Use'} ${u.name} (${roleLabel[u.role]})`}
                    >
                      <div class="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: `linear-gradient(135deg, ${roleColor[u.role]}, ${roleColor[u.role]}cc)` }}>
                        {u.name.charAt(0)}
                      </div>
                      <div class="flex-1 min-w-0 text-left">
                        <div class="text-sm font-medium text-gray-800">{u.name}</div>
                        <div class="text-xs text-gray-400">{u.username} / {u.password}</div>
                      </div>
                      <span class="text-[11px] px-2.5 py-1 rounded-full font-medium flex-shrink-0" style={{ background: `${roleColor[u.role]}12`, color: roleColor[u.role] }}>
                        {roleLabel[u.role]}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 底部信息 */}
            <div class="text-center mt-5">
              <a
                href={lang === 'zh' ? '/login?lang=en' : '/login'}
                class="text-xs text-white/35 hover:text-white/60 sc-transition inline-flex items-center gap-1"
              >
                <i class="fas fa-globe text-[10px]" aria-hidden="true"></i>
                {lang === 'zh' ? 'English' : '中文'}
              </a>
            </div>
            <div class="text-center mt-3 mb-6">
              <p class="text-[10px] text-white/20 tracking-[0.1em] uppercase">
                MC-Revolution V33 · Micro Connect
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
