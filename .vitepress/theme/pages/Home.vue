<script lang="ts" setup>
const socials = [
  { href: 'https://x.com/xiaoluabei', icon: 'i-mdi-twitter-circle', name: 'Twitter' },
  { href: 'https://github.com/abeixiaolu', icon: 'i-mdi-github', name: 'GitHub' },
  { href: 'https://bsky.app/profile/xlabei.bsky.social', icon: 'i-fa6-brands-square-bluesky text-[15px]', name: 'BlueSky' },
  { href: 'https://music.163.com/#/user/home?id=130837120', icon: 'i-simple-icons-neteasecloudmusic text-[15px]', name: '网易云音乐' },
]
</script>

<template>
  <section>
    <div class="border-4 border-black p-4 lg:p-12 shadow-[8px_8px_0_black]">
      <div class="flex items-center gap-4 mb-4 lg:mb-8">
        <img
          src="/avatar.png"
          alt="Profile Picture"
          class="h-28 w-28 my-0 border-4 border-black rounded-full"
        >
        <h1 class="text-4xl">
          abei.me
        </h1>
      </div>
      <Content class="prose dark:prose-invert prose-sm [&>div>:first-child]:mt-0 [&>div>:last-child]:mb-0" />
    </div>
  </section>

  <section class="mt-16">
    <h2 class="text-3xl font-semibold">
      Find me online
    </h2>

    <div class="mt-8 flex flex-wrap justify-center gap-4 md:justify-start">
      <Button v-for="social in socials" :key="social.href" variant="secondary" :href="social.href" target="_blank" :icon="social.icon">
        {{ social.name }}
      </Button>
    </div>
  </section>
</template>
