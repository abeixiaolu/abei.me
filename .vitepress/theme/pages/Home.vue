<script lang="ts" setup>
const socials = [
  { href: 'https://x.com/xiaoluabei', icon: 'i-mdi-twitter-circle', name: 'Twitter' },
  { href: 'https://github.com/abeixiaolu', icon: 'i-mdi-github', name: 'GitHub' },
  { href: 'https://bsky.app/profile/xlabei.bsky.social', icon: 'i-fa6-brands-square-bluesky text-[15px]', name: 'BlueSky' },
  { href: 'https://music.163.com/#/user/home?id=130837120', icon: 'i-simple-icons-neteasecloudmusic text-[15px]', name: '网易云音乐' },
]

const sections = [
  { id: 'intro', text: '简介' },
  { id: 'online', text: 'Online' },
]
</script>

<template>
  <main class="site-shell py-8 md:py-12">
    <div class="reader-grid font-family-anwt">
      <aside class="hidden lg:block">
        <div class="sticky top-24 space-y-5 border-r border-(--color-border) pr-5">
          <img src="/avatar.png" alt="Profile Picture" class="h-14 w-14 rounded-full border border-(--color-border) object-cover">
          <div>
            <p class="text-sm tracking-[0.08em] text-(--color-text-soft)">阅读索引</p>
            <nav class="mt-3 flex flex-col gap-2 text-sm">
              <a v-for="section in sections" :key="section.id" :href="`#${section.id}`" class="text-(--color-text-soft) transition hover:text-(--color-heading)">
                {{ section.text }}
              </a>
            </nav>
          </div>
        </div>
      </aside>

      <section>
        <div id="intro" class="mb-10 border-b border-(--color-border) pb-7">
          <h1 class="text-4xl tracking-[0.04em] text-(--color-heading)">abei.me</h1>
          <p class="mt-2 text-sm tracking-[0.08em] text-(--color-text-soft)">Frontend engineer, notes on code and life.</p>
        </div>

        <div class="content-shell">
          <Content class="prose dark:prose-invert prose-sm sm:prose-base [&>div>:first-child]:mt-0 [&>div>:last-child]:mb-0" />
        </div>

        <section id="online" class="mt-14 border-t border-(--color-border) pt-6">
          <h2 class="text-sm tracking-[0.14em] text-(--color-text-soft)">ONLINE</h2>
          <div class="mt-4 flex flex-wrap gap-3">
            <Button
              v-for="social in socials"
              :key="social.href"
              variant="secondary"
              :href="social.href"
              target="_blank"
              :icon="social.icon"
            >
              {{ social.name }}
            </Button>
          </div>
        </section>
      </section>
    </div>
  </main>
</template>
