<template>
  <section>
    <div class="border-4 border-black p-4 lg:p-12 shadow-[8px_8px_0_black]">
      <Content class="prose dark:prose-invert prose-sm [&>div>:first-child]:mt-0 [&>div>:last-child]:mb-0" />
    </div>
  </section>

  <section class="mt-16">
    <h2 class="text-3xl font-semibold">
      Find me online
    </h2>

    <div class="mt-8 flex flex-wrap justify-center gap-4 md:justify-start">
      <ButtonSecondary href="https://x.com/xiaoluabei" target="_blank" icon="i-logos-twitter">
        Twitter
      </ButtonSecondary>

      <ButtonSecondary href="https://https://github.com/abeixiaolu" target="_blank" icon="i-logos-github-icon">
        GitHub
      </ButtonSecondary>

      <ButtonSecondary href="https://bsky.app/profile/xlabei.bsky.social" target="_blank" icon="i-logos-bluesky">
        BlueSky
      </ButtonSecondary>

      <ButtonSecondary
        href="https://music.163.com/#/user/home?id=130837120" target="_blank"
        icon="i-simple-icons-neteasecloudmusic text-red-500"
      >
        网易云音乐
      </ButtonSecondary>
    </div>
  </section>
</template>
