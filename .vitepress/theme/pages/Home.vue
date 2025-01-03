<template>
  <section>
    <h1 class="text-6xl text-black font-semibold">
      Welcome!
    </h1>

    <div class="mt-16 border-4 border-black p-12 shadow-[8px_8px_0_black]">
      <Content class="prose-xl text-black prose prose-zinc [&>div>:first-child]:mt-0 [&>div>:last-child]:mb-0" />
    </div>
  </section>

  <section class="mt-16">
    <h2 class="text-4xl text-black font-semibold">
      Find me online
    </h2>

    <div class="mt-8 flex flex-wrap justify-center gap-8 md:justify-start">
      <ButtonSecondary href="https://x.com/xiaoluabei" target="_blank">
        Twitter
      </ButtonSecondary>

      <ButtonSecondary href="https://https://github.com/abeixiaolu" target="_blank">
        GitHub
      </ButtonSecondary>

      <ButtonSecondary href="https://bsky.app/profile/xlabei.bsky.social" target="_blank">
        BlueSky
      </ButtonSecondary>

      <ButtonSecondary href="https://music.163.com/#/user/home?id=130837120" target="_blank">
        网易云音乐
      </ButtonSecondary>
    </div>
  </section>
</template>