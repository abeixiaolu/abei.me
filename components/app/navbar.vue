'use client'
<script setup lang="ts">
const colorMode = useColorMode()
const navItems = [
  { label: 'Home', path: '/', icon: 'i-solar-home-smile-bold-duotone' },
  { label: 'Gallery', path: '/gallery', icon: 'i-solar-camera-minimalistic-bold-duotone' },
  { label: 'Bookmark', path: '/bookmark', icon: 'i-solar-bookmark-bold-duotone' },
  { label: 'Project', path: '/project', icon: 'i-solar-inbox-line-bold-duotone' },
  { label: 'Blog', path: '/blog', icon: 'i-solar-notebook-bold-duotone' },
  { label: 'Lab', path: '/lab', icon: 'i-solar-cursor-bold-duotone' },
  { label: 'What I used?', path: '/bag', icon: 'i-solar-bag-3-bold-duotone' },
]

const navbarRef = shallowRef<HTMLElement>()
let bounds: DOMRect
const track = ({ x, y }: { x: number, y: number }) => {
  console.info({ x, y })
  document.documentElement.style.setProperty('--tip-x', `${x - bounds.left}`)
  document.documentElement.style.setProperty('--tip-y', `${y - bounds.top}`)
}

const teardown = () => {
  navbarRef.value!.removeEventListener('pointermove', track)
  navbarRef.value!.removeEventListener('pointerleave', teardown)
}

const initPointerTrack = () => {
  bounds = navbarRef.value!.getBoundingClientRect()
  navbarRef.value!.addEventListener('pointermove', track)
  navbarRef.value!.addEventListener('pointerleave', teardown)
}

onMounted(() => {
  navbarRef.value?.addEventListener('pointerenter', initPointerTrack)
})
</script>

<template>
  <div class="navbar fixed bottom-4 sm:bottom-auto md:top-0 w-full z-50">
    <AppContainer class="flex items-center my-4">
      <nav
        ref="navbarRef"
        class="inline-flex"
      >
        <ul
          class="flex items-center px-3 text-gray-800 rounded-full shadow-lg shadow-gray-800/10 ring-1 ring-gray-900/5 bg-white/50 dark:bg-black/50 backdrop-blur-lg dark:text-gray-200 dark:ring-white/20"
        >
          <li
            v-for="item in navItems"
            :key="item.path"
            class="flex items-center gap-1 px-2 py-2 hover:text-teal-600"
          >
            <NuxtLink
              :to="item.path"
              class="w-8 h-8 flex items-center justify-center"
              active-class="text-teal-600 rounded-full bg-teal-600/30"
            >
              <Icon
                class="w-5 h-5"
                :name="item.icon"
              />
            </NuxtLink>
          </li>
        </ul>
      </nav>
      <div
        class="tip"
        aria-hidden="true"
      >
        <div class="tip__track">
          <div
            v-for="item in navItems"
            :key="item.path"
          >
            {{ item.label }}
          </div>
        </div>
      </div>
      <button
        class="flex items-center px-2 py-2 rounded-full ml-auto dark:bg-blue-500/20 dark:text-blue-300 bg-rose-400/20 text-rose-400"
        @click="colorMode.preference = colorMode.preference === 'dark' ? 'light' : 'dark'"
      >
        <Icon :name="colorMode.preference === 'dark' ? 'i-solar-moon-fog-bold' : 'i-solar-sun-fog-bold'" />
      </button>
    </AppContainer>
  </div>
</template>

<style scoped>
.navbar {
  --tip-height: 2rem;
  --speed: 0.3;
  --blur: 1;
  --show: 0;
  --ease-in: linear(0 0%,
      0.0039 6.25%,
      0.0156 12.5%,
      0.0352 18.75%,
      0.0625 25%,
      0.0977 31.25%,
      0.1407 37.5%,
      0.1914 43.74%,
      0.2499 49.99%,
      0.3164 56.25%,
      0.3906 62.5%,
      0.5625 75%,
      0.7656 87.5%,
      1 100%);
  --ease: ease;
}
nav {
  anchor-name: --nav;
}
.tip {
  position: fixed;
  position-anchor: --nav;
  /* background: var(--color-bg); */
  color: var(--color-text);
  font-size: 0.875rem;
  border-radius: 100px;
  width: 130px;
  pointer-events: none;
  border: 1px solid var(--color-border);
  height: var(--tip-height);
  z-index: 999999999;
  position-try: flip-block, flip-inline;
  position-try-fallbacks: flip-block, flip-inline;
  left: anchor(left);
  bottom: calc(anchor(top));
  translate: calc(-50% + (var(--tip-x) * 1px)) calc(var(--tip-y) * 1px + -50%);
  overflow: hidden;
  scale: var(--show, 0);
  filter: blur(calc(var(--blur, 0) * 1px));
  transition: scale calc(var(--speed) * 1s) var(--ease),
  filter calc(var(--speed) * 1s) ease;
  backdrop-filter: blur(6px);

  .tip__track {
    display: grid;
    height: var(--tip-height);
    grid-auto-flow: column;
    grid-auto-columns: 100%;
    transition: translate calc(var(--speed) * 1s) calc(var(--speed) * 1s) var(--ease);
    translate: calc((var(--active) - 1) * (-100%)) 0;

    div {
      height: var(--tip-height);
      padding-inline: 0.5rem;
      display: grid;
      place-items: center;
      filter: blur(calc((var(--blur, 0) * 1px) * (1 - var(--shown, 0))));
      opacity: var(--shown, 0);
      transition: filter calc(var(--speed) * 1s) var(--ease-in),
        opacity calc(var(--speed) * 1s) var(--ease);
    }
  }
}

:root:has(.navbar ul:is(:hover)) {
  .tip {
    --show: 1;
    filter: blur(0);
  }

  .tip__track {
    transition-delay: 0s;
  }
}

/* :has() hovering stuff */
.navbar:has(nav li:nth-of-type(1):is(:hover)) {
  --active: 1;

  .tip__track div:nth-of-type(1) {
    --shown: 1;
  }
}

.navbar:has(nav li:nth-of-type(2):is(:hover)) {
  --active: 2;
  .tip__track div:nth-of-type(2) {
    --shown: 1;
  }
}

.navbar:has(nav li:nth-of-type(3):is(:hover)) {
  --active: 3;

  .tip__track div:nth-of-type(3) {
    --shown: 1;
  }
}

.navbar:has(nav li:nth-of-type(4):is(:hover)) {
  --active: 4;

  .tip__track div:nth-of-type(4) {
    --shown: 1;
  }
}

.navbar:has(nav li:nth-of-type(5):is(:hover)) {
  --active: 5;

  .tip__track div:nth-of-type(5) {
    --shown: 1;
  }
}

.navbar:has(nav li:nth-of-type(6):is(:hover)) {
  --active: 6;

  .tip__track div:nth-of-type(6) {
    --shown: 1;
  }
}

.navbar:has(nav li:nth-of-type(7):is(:hover)) {
  --active: 7;

  .tip__track div:nth-of-type(7) {
    --shown: 1;
  }
}
</style>
