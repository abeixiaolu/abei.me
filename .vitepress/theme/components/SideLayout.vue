<script setup lang="ts">
const route = useRoute()

const navList = [
  { label: '卷宗 / BLOG', path: '/blog' },
  { label: '法器 / PROJECT', path: '/project' },
  { label: '演示 / DEMO', path: '/demo' },
  { label: '装备 / USES', path: '/use' },
  { label: '游记 / GALLERY', path: '/gallery' },
]

const isOpen = ref(false)
let touchStartX = 0
let touchStartY = 0

function closeNav() { isOpen.value = false }

function onTouchStart(e: TouchEvent) {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
}

function onTouchEnd(e: TouchEvent) {
  const dx = e.changedTouches[0].clientX - touchStartX
  const dy = e.changedTouches[0].clientY - touchStartY
  if (Math.abs(dx) < Math.abs(dy)) return // vertical scroll, ignore
  const halfScreen = window.innerWidth / 2
  if (dx > halfScreen) isOpen.value = true
  if (dx < -halfScreen) isOpen.value = false
}

watch(() => route.path, () => closeNav())

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
  <div class="side-layout">
    <!-- Backdrop -->
    <Transition name="fade">
      <div v-if="isOpen" class="nav-backdrop" @click="closeNav" />
    </Transition>

    <!-- Left nav column -->
    <nav class="side-nav" :class="{ 'side-nav--open': isOpen }">
      <a href="/" class="side-identity">阿北</a>
      <div class="side-links">
        <a
          v-for="nav in navList"
          :key="nav.path"
          :href="nav.path"
          class="side-link"
          :class="{ 'side-link--active': route.path.startsWith(nav.path) }"
        >{{ nav.label }}</a>
      </div>
      <div class="side-sys">SYS.001</div>
      <ThemeBtn class="opacity-50 hover:opacity-100 transition-opacity" />
    </nav>

    <!-- Main content -->
    <main class="side-content">
      <slot />
    </main>
    <div class="side-sys-coord" aria-hidden="true">X:00.0 Y:00.0 // SYS.REC</div>
  </div>
</template>

<style scoped>
.side-layout {
  display: grid;
  grid-template-columns: 80px 1fr;
  height: 100vh;
  overflow: hidden;
}

.side-nav {
  border-right: 1px solid var(--color-hairline);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2.5rem 0;
  justify-content: space-between;
  background: linear-gradient(to right, color-mix(in srgb, var(--color-bg) 80%, transparent), transparent);
}

.side-identity {
  writing-mode: vertical-rl;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 0.5rem;
  color: var(--color-text);
  text-decoration: none;
  transition: opacity 0.2s;
}

.dark .side-identity {
  mix-blend-mode: difference;
  color: #ffffff;
}

.side-identity:hover {
  opacity: 1;
  color: var(--color-accent);
}

.side-links {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.side-link {
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

.side-link::before {
  content: '';
  position: absolute;
  top: 0;
  right: -6px;
  width: 2px;
  height: 0;
  background-color: var(--color-accent);
  transition: height 0.3s ease;
}

.side-link:hover,
.side-link--active {
  opacity: 1;
  color: var(--color-accent);
}

.side-link--active::before,
.side-link:hover::before {
  height: 1rem;
}

.side-sys {
  writing-mode: vertical-rl;
  font-family: var(--font-mono, monospace);
  font-size: 0.55rem;
  letter-spacing: 0.2rem;
  color: var(--color-text);
  opacity: 0.2;
  text-transform: uppercase;
}

.side-content {
  overflow-y: auto;
  height: 100vh;
  padding: 3rem 2.5rem;
  backdrop-filter: blur(2px);
}

.side-content::-webkit-scrollbar { width: 4px; }
.side-content::-webkit-scrollbar-track { background: transparent; }
.side-content::-webkit-scrollbar-thumb { background: var(--color-hairline); border-radius: 2px; }

.side-sys-coord {
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
  z-index: 10;
}

.nav-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.3);
  z-index: 99;
  backdrop-filter: blur(1px);
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ── Mobile ── */
@media (max-width: 768px) {
  .side-layout {
    grid-template-columns: 1fr;
  }

  .side-nav {
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

  .side-nav--open {
    transform: translateX(0);
  }

  .side-content {
    padding: 2rem 1.25rem;
    grid-column: 1;
  }

  .side-sys-coord {
    display: none;
  }
}
</style>
