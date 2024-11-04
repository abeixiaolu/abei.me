<script setup lang="ts">
const props = defineProps<{
  images: { src: string, alt: string }[]
}>()

const isGalleryOpen = ref(false)
const currentIndex = ref(0)
const showImage = computed(() => props.images[currentIndex.value])
const openGallery = (index: number) => {
  console.log(index)
  currentIndex.value = index
  isGalleryOpen.value = true
}

const closeGallery = () => {
  isGalleryOpen.value = false
}

const slideDirection = ref('next')

const prevImage = () => {
  if (currentIndex.value > 0) {
    slideDirection.value = 'prev'
    currentIndex.value--
  }
}

const nextImage = () => {
  if (currentIndex.value < props.images.length - 1) {
    slideDirection.value = 'next'
    currentIndex.value++
  }
}
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
        class="image-link"
        @click="openGallery(index)"
      >
        <CldImage
          width="6000"
          height="4000"
          :src="image.src"
          :alt="image.alt"
          lazy
          class="image"
        />
      </a>
    </div>
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="isGalleryOpen"
          class="gallery-overlay"
        >
          <div class="flex flex-col gap-4 justify-between items-center absolute top-1/2 -translate-y-1/2 right-14">
            <AppCircleButton
              type="default"
              aria-label="close"
              icon="i-solar-close-circle-broken"
              @click="closeGallery"
            />
            <AppCircleButton
              type="default"
              aria-label="close"
              icon="i-solar-arrow-left-broken"
              :disabled="currentIndex === 0"
              @click="prevImage"
            />
            <AppCircleButton
              type="default"
              aria-label="close"
              icon="i-solar-arrow-right-broken"
              :disabled="currentIndex === props.images.length - 1"
              @click="nextImage"
            />
          </div>
          <div class="gallery-content">
            <Transition
              :name="slideDirection === 'next' ? 'slide-next' : 'slide-prev'"
              mode="out-in"
            >
              <CldImage
                :key="currentIndex"
                class="w-full h-full"
                width="6000"
                height="4000"
                :src="showImage.src"
                :alt="showImage.alt"
                lazy
              />
            </Transition>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style>
.masonry {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  grid-gap: 16px;
  grid-auto-flow: dense;
}

.image-container {
  break-inside: avoid;
  position: relative;
  overflow: hidden;
  transition: transform 0.6s cubic-bezier(0.215, 0.61, 0.355, 1);
  border-radius: 10px;
}

.image-container:nth-child(3n) {
  grid-row: span 2;
}

.image-container:nth-child(6n) {
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

@media (max-width: 640px) {
  .masonry {
    grid-template-columns: repeat(auto-fill, minmax(100%, 1fr));
  }

  .image-container:nth-child(3n),
  .image-container:nth-child(4n) {
    grid-row: auto;
    grid-column: auto;
  }
}

.slide-next-enter-active,
.slide-next-leave-active,
.slide-prev-enter-active,
.slide-prev-leave-active {
  transition: all 0.3s ease;
}

.slide-next-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.slide-next-leave-to {
  opacity: 0;
  transform: translateX(-100px);
}

.slide-prev-enter-from {
  opacity: 0;
  transform: translateX(-100px);
}

.slide-prev-leave-to {
  opacity: 0;
  transform: translateX(100px);
}
</style>

<style>
.gallery-overlay {
  @apply fixed top-0 left-0 w-full h-full z-[100] flex justify-center items-center bg-black/50;
}

.gallery-content {
  @apply w-5/6 h-5/6 m-auto;
}
</style>
