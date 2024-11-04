<script setup lang="ts">
const props = defineProps<{
  images: { src: string, alt: string }[]
}>()
</script>

<template>
  <div class="masonry not-prose">
    <div
      v-for="(image, index) in props.images"
      id="gallery"
      :key="index"
      class="image-container"
    >
      <a
        :href="image.src"
        class="image-link glightbox"
      >
        <NuxtImg
          :src="image.src"
          :alt="image.alt"
          lazy
          class="image"
        />
      </a>
    </div>
  </div>
</template>

<style scoped>
.masonry {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  grid-gap: 16px;
  grid-auto-flow: dense;
}

.image-container {
  break-inside: avoid;
  position: relative;
  overflow: hidden;
  transition: transform 0.6s cubic-bezier(0.215, 0.61, 0.355, 1);
}

.image-container:nth-child(3n) {
  grid-row: span 2;
}

.image-container:nth-child(4n) {
  grid-column: span 2;
}

.image-link {
  display: block;
  height: 100%;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.6s cubic-bezier(0.215, 0.61, 0.355, 1);
}

.image-container:hover {
  transform: scale(1.01);
}

.image-container:hover .image {
  transform: scale(1.005);
}
</style>
