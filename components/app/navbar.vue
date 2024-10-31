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
</script>

<template>
  <div class="fixed bottom-4 sm:bottom-auto md:top-0 w-full z-50">
    <AppContainer>
      <nav>
        <ul
          class="flex items-center px-3 my-4 text-gray-800 rounded-full shadow-lg shadow-gray-800/10 ring-1 ring-gray-900/5 bg-white/50 dark:bg-black/50 backdrop-blur-lg dark:text-gray-200 dark:ring-white/20"
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
          <button
            class="flex items-center px-2 py-2 rounded-full ml-auto dark:bg-blue-500/20 dark:text-blue-300 bg-rose-400/20 text-rose-400"
            @click="colorMode.preference = colorMode.preference === 'dark' ? 'light' : 'dark'"
          >
            <Icon :name="colorMode.preference === 'dark' ? 'i-solar-moon-fog-bold' : 'i-solar-sun-fog-bold'" />
          </button>
        </ul>
      </nav>
    </AppContainer>
  </div>
</template>
