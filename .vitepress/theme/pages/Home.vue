<script lang="ts" setup>
const socials = [
  { href: 'https://x.com/xiaoluabei', icon: 'i-mdi-twitter-circle', name: 'Twitter' },
  { href: 'https://github.com/abeixiaolu', icon: 'i-mdi-github', name: 'GitHub' },
  { href: 'https://bsky.app/profile/xlabei.bsky.social', icon: 'i-fa6-brands-square-bluesky text-[15px]', name: 'BlueSky' },
  { href: 'https://music.163.com/#/user/home?id=130837120', icon: 'i-simple-icons-neteasecloudmusic text-[15px]', name: '网易云' },
]

const isNavOpen = ref(false)
let touchStartX = 0
let touchStartY = 0

function closeNav() { isNavOpen.value = false }

function onTouchStart(e: TouchEvent) {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
}
function onTouchEnd(e: TouchEvent) {
  const dx = e.changedTouches[0].clientX - touchStartX
  const dy = e.changedTouches[0].clientY - touchStartY
  if (Math.abs(dx) < Math.abs(dy)) return
  const halfScreen = window.innerWidth / 2
  if (dx > halfScreen) isNavOpen.value = true
  if (dx < -halfScreen) isNavOpen.value = false
}

onMounted(() => {
  document.addEventListener('touchstart', onTouchStart, { passive: true })
  document.addEventListener('touchend', onTouchEnd, { passive: true })
})
onUnmounted(() => {
  document.removeEventListener('touchstart', onTouchStart)
  document.removeEventListener('touchend', onTouchEnd)
})
</script>

<template>
  <div class="home-root">
    <!-- Backdrop -->
    <Transition name="fade">
      <div v-if="isNavOpen" class="nav-backdrop" @click="closeNav" />
    </Transition>

    <!-- Left nav column -->
    <nav class="nav-col" :class="{ 'nav-col--open': isNavOpen }">
      <div class="nav-identity">
        阿北
      </div>
      <div class="nav-links">
        <a href="/blog" class="nav-link" @click="closeNav">卷宗 / BLOG</a>
        <a href="/project" class="nav-link" @click="closeNav">法器 / PROJECT</a>
        <a href="/demo" class="nav-link" @click="closeNav">演示 / DEMO</a>
        <a href="/use" class="nav-link" @click="closeNav">装备 / USES</a>
        <a href="/gallery" class="nav-link" @click="closeNav">游记 / GALLERY</a>
      </div>
      <div class="nav-sys">
        SYS.001
      </div>
      <ThemeBtn class="opacity-50 hover:opacity-100 transition-opacity" />
    </nav>

    <!-- Center title column -->
    <section class="center-col">
      <div class="bio-wrap">
        <div class="center-bio">
          <Content class="prose dark:prose-invert" />
        </div>
      </div>
      <div class="stamp-seal">
        印
      </div>
    </section>

    <!-- Right content column -->
    <aside class="content-col">
      <div class="content-meta">
        <span class="meta-label">STACK // 00</span>
        <span class="meta-label">abei.me</span>
      </div>

      <div class="stack-block">
        <MyStack />
      </div>

      <div class="socials-block">
        <div class="block-label">
          NETWORK // 01
        </div>
        <div class="socials-list">
          <a
            v-for="(social, index) in socials"
            :key="social.href"
            :href="social.href"
            target="_blank"
            class="social-link"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            <span :class="social.icon" />
            {{ social.name }}
          </a>
        </div>
      </div>
    </aside>
    <div class="sys-coord" aria-hidden="true">
      X:00.0 Y:00.0 // SYS.REC
    </div>
  </div>
</template>

<style scoped>
.home-root {
  display: grid;
  grid-template-columns: 80px 1fr 400px;
  grid-template-rows: 100vh;
  overflow: hidden;
}

/* ── Left nav col ── */
.nav-col {
  border-right: 1px solid var(--color-hairline);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2.5rem 0;
  justify-content: space-between;
  overflow: hidden;
  background: linear-gradient(to right, color-mix(in srgb, var(--color-bg) 80%, transparent), transparent);
}

.nav-identity {
  writing-mode: vertical-rl;
  text-orientation: upright;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 0.5rem;
  color: var(--color-text);
}

.dark .nav-identity {
  mix-blend-mode: difference;
  color: #ffffff;
}

.nav-links {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.nav-link {
  writing-mode: vertical-rl;
  font-family: var(--font-mono, monospace);
  font-size: 0.6rem;
  letter-spacing: 0.15rem;
  color: var(--color-text);
  opacity: 0.5;
  text-decoration: none;
  transition: opacity 0.2s ease, color 0.2s ease;
  position: relative;
}

.nav-link::before {
  content: '';
  position: absolute;
  top: 0;
  right: -6px;
  width: 2px;
  height: 0;
  background-color: var(--color-accent);
  transition: height 0.3s ease;
}

.nav-link:hover {
  opacity: 1;
  color: var(--color-accent);
}

.nav-link:hover::before {
  height: 100%;
}

.nav-sys {
  writing-mode: vertical-rl;
  font-family: var(--font-mono, monospace);
  font-size: 0.55rem;
  letter-spacing: 0.2rem;
  color: var(--color-text);
  opacity: 0.3;
}

/* ── Center col ── */
.center-col {
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  overflow: hidden;
  padding: 2rem;
}

.center-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.main-title {
  writing-mode: vertical-rl;
  font-size: 8rem;
  font-weight: 200;
  line-height: 1;
  letter-spacing: 2rem;
  color: var(--color-text);
  opacity: 0.85;
  margin: 0;
  font-family: var(--font-family-anwt, serif);
}

.dark .main-title {
  mix-blend-mode: exclusion;
  opacity: 0.9;
  color: #ffffff;
}

.sub-title {
  writing-mode: vertical-rl;
  font-family: var(--font-mono, monospace);
  font-size: 0.7rem;
  letter-spacing: 0.3rem;
  color: var(--color-text);
  opacity: 0.4;
  text-transform: uppercase;
}

.center-bio {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  font-size: 24px;
  line-height: 1.8;
  opacity: 0.75;
  pointer-events: auto;
  max-height: 488px;
}

.stamp-seal {
  width: 2.5rem;
  height: 2.5rem;
  border: 2px solid var(--color-accent);
  color: var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-family-anwt, serif);
  font-size: 0.9rem;
  font-weight: 700;
  opacity: 0.75;
  border-radius: 2px;
  pointer-events: none;
  flex-shrink: 0;
}

.bio-wrap {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 0.5rem;
}

.center-bio :deep(p) {
  font-size: 16px;
  line-height: 1.8;
}

/* ── Right content col ── */
.content-col {
  border-left: 1px solid var(--color-hairline);
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  overflow-y: auto;
  scrollbar-width: none;
  backdrop-filter: blur(2px);
  background: linear-gradient(to left, color-mix(in srgb, var(--color-bg) 92%, transparent), color-mix(in srgb, var(--color-bg) 50%, transparent));
}

.content-col::-webkit-scrollbar {
  display: none;
}

.sys-coord {
  position: fixed;
  bottom: 20px;
  left: 90px;
  font-family: var(--font-mono, monospace);
  font-size: 0.6rem;
  color: var(--color-text);
  letter-spacing: 0.2rem;
  opacity: 0.35;
  pointer-events: none;
  text-transform: uppercase;
}

.content-meta {
  display: flex;
  justify-content: space-between;
  font-family: var(--font-mono, monospace);
  font-size: 0.65rem;
  color: var(--color-text);
  opacity: 0.45;
  text-transform: uppercase;
  letter-spacing: 0.1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-hairline);
}

.profile-block {
  display: flex;
  gap: 1.25rem;
  align-items: flex-start;
}

.avatar-img {
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--color-hairline);
  flex-shrink: 0;
}

.block-label {
  font-family: var(--font-mono, monospace);
  font-size: 0.65rem;
  letter-spacing: 0.15rem;
  color: var(--color-text);
  opacity: 0.45;
  text-transform: uppercase;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-hairline);
}

.socials-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.social-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-family: var(--font-mono, monospace);
  font-size: 0.75rem;
  color: var(--color-text);
  opacity: 0.6;
  text-decoration: none;
  padding: 0.25rem 0.6rem;
  border: 1px solid var(--color-hairline);
  transition: all 0.2s ease;
  animation: slideUp 0.5s ease-out both;
}

.social-link:hover {
  opacity: 1;
  color: var(--color-accent);
  border-color: var(--color-accent);
}

.home-prose {
  flex: 1;
  min-width: 0;
}
/* ── Mobile ── */
.nav-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 99;
  backdrop-filter: blur(2px);
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 768px) {
  .home-root {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    height: auto;
    min-height: 100vh;
    overflow: auto;
  }

  .nav-col {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    width: 80px;
    z-index: 100;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    background: var(--color-bg);
    border-right: 1px solid var(--color-hairline);
  }

  .nav-col--open {
    transform: translateX(0);
  }

  .center-col {
    grid-column: 1;
    min-height: 60vh;
    padding: 4rem 1.5rem 2rem;
  }

  .content-col {
    grid-column: 1;
    border-left: none;
    border-top: 1px solid var(--color-hairline);
    padding: 2rem 1.5rem;
    background: none;
  }

  .sys-coord {
    display: none;
  }
}
</style>
