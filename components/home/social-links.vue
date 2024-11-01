<template>
  <div>
    <h2 class="uppercase text-xs font-semibold text-slate-400/80 mb-4">
      FIND ME ON
    </h2>
    <div class="space-y-5">
      <NuxtLink
        v-for="link in links"
        :key="link.icon"
        :to="link.url"
        target="_blank"
        external
        class="flex items-center gap-4 dark:hover:text-gray-300 group"
      >
        <span class="text-sm uppercase text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300">
          {{ link.name }}
        </span>
        <div
          class="flex-1 border-b border-dashed border-slate-500/50 group-hover:border-slate-700 dark:group-hover:border-slate-300"
        />
        <Icon
          :name="link.icon"
          class="w-6 h-6 opacity-50 group-hover:opacity-100"
          :class="link.color"
        />
      </NuxtLink>
    </div>
  </div>
</template>

<script lang="ts" setup>
const links = [
  {
    name: 'Twitter',
    url: 'https://x.com/xiaoluabei',
    icon: 'i-ri-twitter-fill',
    color: 'text-[#6BAAE8]',
  },
  {
    name: 'GitHub',
    url: 'https://github.com/abeixiaolu',
    icon: 'i-ri-github-fill',
    color: 'text-[#181717] dark:text-[#E5E5E5]',
  },
  {
    name: 'Bluesky',
    url: 'https://bsky.app/profile/xlabei.bsky.social',
    icon: 'i-ri-bluesky-fill',
    color: 'text-[#3A83F7]',
  },
  {
    name: '网易云音乐',
    url: 'https://music.163.com/#/user/home?id=130837120',
    icon: 'i-ri-netease-cloud-music-fill',
    color: 'text-[#D44439]',
  },
]
</script>
