<script lang="ts" setup>
import { PowerGlitch } from 'powerglitch'

const socials = [
  { href: 'https://x.com/xiaoluabei', icon: 'i-mdi-twitter-circle', name: 'Twitter' },
  { href: 'https://github.com/abeixiaolu', icon: 'i-mdi-github', name: 'GitHub' },
  { href: 'https://bsky.app/profile/xlabei.bsky.social', icon: 'i-fa6-brands-square-bluesky text-[15px]', name: 'BlueSky' },
  { href: 'https://music.163.com/#/user/home?id=130837120', icon: 'i-simple-icons-neteasecloudmusic text-[15px]', name: '网易云音乐' },
]

onMounted(() => {
  PowerGlitch.glitch('.avatar-glitch', {
    playMode: 'click',
    timing: {
      duration: 1000,
      iterations: 1,
      easing: 'ease-in-out',
    },
    glitchTimeSpan: {
      start: 0,
      end: 1,
    },
  })
})
</script>

<template>
  <main class="mx-auto max-w-screen-md">
    <section class="font-family-anwt ">
      <BorderContainer>
        <div class="flex items-center mb-4 lg:mb-8 avatar-glitch">
          <img src="/avatar.png" alt="Profile Picture" class="h-28 w-28 my-0 border-4 border-black dark:border-[#506C59] rounded-full">
          <h1 class="text-4xl border-4 border-transparent dark:text-[#506C59] border-b-black dark:border-b-[#506C59] border-l-0 px-4 py-1 pl-5 pb-2 translate-x-[-10px] text-black">
            abei.me
          </h1>
        </div>
        <Content class="prose dark:prose-invert prose-sm [&>div>:first-child]:mt-0 [&>div>:last-child]:mb-0" />
      </BorderContainer>
    </section>

    <section class="mt-16">
      <h2 class="text-3xl font-semibold">
        Find me online
      </h2>

      <div class="mt-8 flex flex-wrap justify-center gap-4 md:justify-start">
        <Button
          v-for="(social, index) in socials" :key="social.href" variant="secondary" :href="social.href"
          target="_blank" :icon="social.icon" :style="{
            animation: `slideUp 0.5s ease-out ${index * 0.15}s both`,
          }"
        >
          {{ social.name }}
        </Button>
      </div>
    </section>
  </main>
</template>
