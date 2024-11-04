<script setup lang="ts">
const props = defineProps<{
  title?: string
  pubDate: string
  description: string
  path?: string
  image: {
    src: string
    alt: string
  }
}>()

const publishedDate = new Date(props.pubDate).toLocaleDateString('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})
</script>

<template>
  <article
    class="flex gap-4 mb-4 last:mb-0 items-end"
  >
    <div class="w-[200px] rounded-md overflow-hidden shrink-0">
      <NuxtLink :to="path">
        <CldImage
          loading="lazy"
          width="6000"
          height="4000"
          quality="30"
          :src="image.src"
          :alt="image.alt"
          class="w-full h-full cursor-pointer hover:scale-105 transition-all duration-300"
          @click="navigateTo(path)"
        />
      </NuxtLink>
    </div>
    <div class="flex flex-col">
      <h2
        class="text-2xl font-bold chakra"
        @click="navigateTo(path)"
      >
        <NuxtLink
          class="wrapping-underline"
          :to="path"
        >
          {{ title }}
        </NuxtLink>
      </h2>
      <time
        class="text-sm text-gray-500 my-4"
        :datetime="pubDate"
      >
        Published on {{ publishedDate }}
      </time>
      <p class="text-md line-clamp-2">
        {{ description }}
      </p>
    </div>
  </article>
</template>
