<script lang="ts" setup>
const socials = [
  { href: 'https://x.com/xiaoluabei', icon: 'i-mdi-twitter-circle', name: 'Twitter' },
  { href: 'https://github.com/abeixiaolu', icon: 'i-mdi-github', name: 'GitHub' },
  { href: 'https://bsky.app/profile/xlabei.bsky.social', icon: 'i-fa6-brands-square-bluesky text-[15px]', name: 'BlueSky' },
  { href: 'https://music.163.com/#/user/home?id=130837120', icon: 'i-simple-icons-neteasecloudmusic text-[15px]', name: '网易云音乐' },
]
</script>

<template>
  <main class="site-shell py-8 md:py-12">
    <section class="font-family-anwt">
      <BorderContainer>
        <div class="mb-8 flex items-center gap-5 border-b border-(--color-border) pb-6">
          <img src="/avatar.png" alt="Profile Picture" class="my-0 h-20 w-20 rounded-full border border-(--color-border) object-cover">
          <div>
            <h1 class="text-4xl tracking-[0.04em] text-(--color-heading)">
              abei.me
            </h1>
            <p class="mt-1 text-sm tracking-[0.08em] text-(--color-text-soft)">
              Frontend engineer, notes on code and life.
            </p>
          </div>
        </div>
        <div class="content-shell">
          <Content class="prose dark:prose-invert prose-sm sm:prose-base [&>div>:first-child]:mt-0 [&>div>:last-child]:mb-0" />
        </div>
      </BorderContainer>
    </section>

    <section class="mt-14 font-family-anwt">
      <h2 class="text-lg tracking-[0.1em] text-(--color-heading)">
        Find me online
      </h2>

      <div class="mt-5 flex flex-wrap gap-3">
        <Button
          v-for="social in socials" :key="social.href" variant="secondary" :href="social.href"
          target="_blank" :icon="social.icon"
        >
          {{ social.name }}
        </Button>
      </div>
    </section>
  </main>
</template>
