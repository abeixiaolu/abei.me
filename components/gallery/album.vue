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
    class="flex gap-4"
  >
    <div class="w-[200px] rounded-md overflow-hidden">
      <CldImage
        :src="image.src"
        :alt="image.alt"
        width="600"
        height="600"
        class="w-full h-full cursor-pointer"
        @click="navigateTo(path)"
      />
    </div>
    <div class="flex flex-col">
      <h2
        class="text-2xl font-bold cursor-pointer hover:opacity-80"
        @click="navigateTo(path)"
      >
        {{ title }}
      </h2>
      <time
        class="text-sm text-gray-500 my-4"
        :datetime="pubDate"
      >Published on {{ publishedDate }}</time>
      <p>{{ description }}</p>
    </div>
  </article>
</template>
