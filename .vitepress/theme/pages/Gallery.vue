<script setup lang="ts">
import { computed, ref } from 'vue'
import { data as galleryData } from '../../data/gallery.data'

interface Album {
  title: string
  description: string
  bordered?: boolean
  pictures: Picture[]
}

interface Picture {
  url: string
  width: number
  height: number
}

// 影集数据
const albums = computed(() => {
  return galleryData.map((item) => {
    return {
      ...item.frontmatter,
      pictures: item.frontmatter.pictures.map((picture: string) => {
        return {
          url: picture,
          width: 0,
          height: 0,
        } satisfies Picture
      }),
    } as Album
  })
})

// 当前查看的相册
const selectedAlbum = ref<Album>(albums.value[0])
// 当前查看的照片索引
const currentPhotoIndex = ref(0)
// 是否显示大图
const showLightbox = ref(false)
// 当前激活的相册索引
const activeAlbumIndex = ref(0)

// 选择相册查看详情
function viewAlbum(album: Album, index: number) {
  selectedAlbum.value = album
  activeAlbumIndex.value = index
}

// 打开灯箱查看大图
function openLightbox(index: number) {
  currentPhotoIndex.value = index
  showLightbox.value = true
  document.body.style.overflow = 'hidden'
}

// 关闭灯箱
function closeLightbox() {
  showLightbox.value = false
  document.body.style.overflow = ''
}

// 查看上一张照片
function prevPhoto() {
  if (!selectedAlbum.value || currentPhotoIndex.value <= 0)
    return

  currentPhotoIndex.value = currentPhotoIndex.value - 1
}

// 查看下一张照片
function nextPhoto() {
  if (!selectedAlbum.value || currentPhotoIndex.value >= selectedAlbum.value.pictures.length - 1)
    return

  currentPhotoIndex.value = currentPhotoIndex.value + 1
}

// 当前大图
const currentPhoto = computed(() => {
  if (!selectedAlbum.value)
    return null
  return selectedAlbum.value.pictures[currentPhotoIndex.value]
})

// 是否可以前进/后退
const canGoPrev = computed(() => currentPhotoIndex.value > 0)
const canGoNext = computed(() => selectedAlbum.value && currentPhotoIndex.value < selectedAlbum.value.pictures.length - 1)

function getOpacityClass(index: number) {
  const distance = Math.abs(index - activeAlbumIndex.value)
  if (distance === 0)
    return 'opacity-100 font-medium'
  else if (distance <= 1)
    return 'opacity-80 scale-80'
  else if (distance <= 2)
    return 'opacity-60 scale-70'
  else if (distance <= 3)
    return 'opacity-40 scale-60'
  return 'opacity-20 scale-50'
}
</script>

<template>
  <section class="flex font-family-anwt h-[calc(100dvh-68px)]">
    <!-- 左侧相册导航 -->
    <div class="w-fit min-w-[66px] px-4 flex flex-col h-full overflow-auto">
      <div
        v-for="(album, index) in albums"
        :key="index"
        class="mb-4 cursor-pointer transition-all duration-300 transform hover:scale-103"
        :class="getOpacityClass(index)"
        @click="viewAlbum(album, index)"
      >
        {{ album.title }}
      </div>
    </div>

    <!-- 中间照片展示区 -->
    <div class="flex-1 mx-auto h-full pb-4 overflow-auto px-4">
      <div
        class="relative w-full grid grid-cols-6 gap-4"
      >
        <div
          v-for="(photo, idx) in selectedAlbum.pictures"
          :key="idx"
          @click="openLightbox(idx)"
        >
          <img
            :src="photo.url"
            :alt="`${selectedAlbum.title} - ${idx + 1}`"
            class="aspect-square object-cover"
            loading="lazy"
          >
        </div>
      </div>
    </div>

    <!-- 灯箱模式 -->
    <div
      v-if="showLightbox && currentPhoto"
      class="fixed inset-0 z-50 flex items-center justify-center transition-all backdrop-blur-sm duration-300"
      @click="closeLightbox"
    >
      <div class="relative w-full h-full flex items-center justify-center " @click.stop="closeLightbox">
        <div class="absolute z-[-1] size-full blur-3xl" :style="{ background: `no-repeat center/cover url(${currentPhoto.url})` }" />
        <img
          :src="currentPhoto.url"
          class="max-h-[90vh] max-w-[90vw] object-contain transition-transform duration-500"
          loading="lazy"
        >

        <button
          v-if="canGoPrev"
          class="absolute left-4 p-2 text-white bg-black/40 rounded-full hover:bg-black/60
                 transition-all duration-300 backdrop-blur-sm transform hover:-translate-x-1"
          @click.stop="prevPhoto"
        >
          <i class="i-solar-arrow-left-linear text-2xl" />
        </button>

        <button
          v-if="canGoNext"
          class="absolute right-4 p-2 text-white bg-black/40 rounded-full hover:bg-black/60
                 transition-all duration-300 backdrop-blur-sm transform hover:translate-x-1"
          @click.stop="nextPhoto"
        >
          <i class="i-solar-arrow-right-linear text-2xl" />
        </button>

        <button
          class="absolute top-4 right-4 p-2 text-white bg-black/40 rounded-full
                 hover:bg-black/60 transition-all duration-300 backdrop-blur-sm transform hover:rotate-90"
          @click.stop="closeLightbox"
        >
          <i class="i-solar-close-circle-linear text-2xl" />
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
img {
  height: auto;
  max-width: 100%;
  display: block;
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
