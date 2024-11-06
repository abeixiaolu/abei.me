<script setup lang="ts">
const bookmarks = [
  {
    label: 'Anthony Fu',
    url: 'https://antfu.me/',
    tag: ['blog', 'good design'],
  },
  {
    label: 'Josh W. Comeau',
    url: 'https://www.joshwcomeau.com/',
    tag: ['blog', 'good design'],
  },
  {
    label: 'Rauno Freiberg',
    url: 'https://rauno.me/',
    tag: ['blog', 'good design'],
  },
  {
    label: 'I\'m Kai',
    url: 'https://kaiyi.cool/',
    tag: ['blog'],
  },
  {
    label: 'Elone Hoo',
    url: 'https://elonehoo.me/',
    tag: ['blog'],
  },
  {
    label: 'Dillion Verma',
    url: 'https://portfolio-magicui.vercel.app/',
    tag: ['blog'],
  },
  {
    label: 'Guoqi Sun',
    url: 'https://sunguoqi.com/',
    tag: ['blog'],
  },
  {
    label: 'erfianugrah',
    url: 'https://www.erfianugrah.com/',
    tag: ['photography'],
  },
  {
    label: 'Shivam Mishra - Software developer, designer.',
    url: 'https://www.shivam.dev/',
    tag: ['blog'],
  },
  {
    label: 'BTDigg - Free Search Engine For Free Torrent Content',
    url: 'https://btdig.com/index.htm',
    tag: ['util'],
  },
  {
    label: 'CSS { In Real Life }',
    url: 'https://css-irl.info/',
    tag: ['blog', 'css'],
  },
  {
    label: 'Ahmad Shadeed',
    url: 'https://ishadeed.com/',
    tag: ['blog', 'css'],
  },
]

const groupedBookmarks = computed(() => {
  const groups: Record<string, typeof bookmarks> = {}

  bookmarks.forEach((bookmark) => {
    bookmark.tag.forEach((tag) => {
      if (!groups[tag]) {
        groups[tag] = []
      }
      groups[tag].push(bookmark)
    })
  })

  return groups
})

function getHost(url: string) {
  const parsedUrl = new URL(url)
  let host = parsedUrl.host
  if (host.startsWith('www.')) {
    host = host.substring(4)
  }
  return host
}

function getThumbnail(url: string) {
  const host = getHost(url)
  return `https://logo.clearbit.com/${host}`
}

// 添加一个追踪图片加载状态的响应式对象
const imgLoadStatus = ref<{ [key: string]: boolean }>({})
bookmarks.forEach((bookmark) => {
  imgLoadStatus.value[bookmark.url] = true
})
// 获取首字母的函数
function getFirstLetter(label: string) {
  return label.charAt(0).toUpperCase()
}

// 处理图片加载失败的函数
function handleImageError(url: string) {
  imgLoadStatus.value[url] = false
}
</script>

<template>
  <div>
    <AppPageHeader title="Bookmarks">
      <p>
        Awesome things I've found on the internet. This page is still WIP, I want to add search like
        <a
          href="https://bmrks.com"
          target="_blank"
          class="text-teal-500 underline"
        >bmrks.com</a>
      </p>
    </AppPageHeader>
    <div
      v-for="(bks, tag) in groupedBookmarks"
      :key="tag"
      class="mb-8"
    >
      <h2 class="text-lg font-medium mb-4 text-gray-700 dark:text-gray-200 uppercase">
        {{ tag }}
      </h2>
      <ul class="space-y-2 ">
        <li
          v-for="bookmark in bks"
          :key="bookmark.url"
          class="slide-enter-content"
        >
          <a
            :href="bookmark.url"
            target="_blank"
            class="flex items-center gap-3 hover:bg-gray-400/10 p-2 rounded-lg -m-2 text-sm min-w-0"
          >
            <div class="w-10 h-10 rounded-md ring-2 ring-zinc-400/50">
              <NuxtImg
                v-if="imgLoadStatus[bookmark.url] !== false"
                :src="getThumbnail(bookmark.url)"
                :alt="bookmark.label"
                class="w-10 h-10 rounded-md"
                loading="lazy"
                @error="handleImageError(bookmark.url)"
              />
              <div
                v-else
                class="w-10 h-10 rounded-md bg-zinc-500/30 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold"
              >
                {{ getFirstLetter(bookmark.label) }}
              </div>
            </div>
            <p class="truncate text-gray-700 dark:text-gray-200">
              {{ bookmark.label }}
            </p>
            <span class="text-xs ml-auto font-medium text-zinc-400">
              {{ getHost(bookmark.url) }}
            </span>
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>
