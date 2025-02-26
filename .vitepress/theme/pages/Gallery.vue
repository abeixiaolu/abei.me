<script setup lang="ts">
import type { Album } from '../types/album'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { data as albumsData } from '../../data/albums.data'

// 影集数据
const albums = ref(albumsData)

// 当前查看的相册
const selectedAlbum = ref<Album | null>(null)
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
  if (!selectedAlbum.value)
    return

  currentPhotoIndex.value
    = (currentPhotoIndex.value - 1 + selectedAlbum.value.photos.length)
    % selectedAlbum.value.photos.length
}

// 查看下一张照片
function nextPhoto() {
  if (!selectedAlbum.value)
    return

  currentPhotoIndex.value
    = (currentPhotoIndex.value + 1) % selectedAlbum.value.photos.length
}

// 键盘导航
function handleKeyDown(e: KeyboardEvent) {
  if (showLightbox.value) {
    if (e.key === 'ArrowLeft')
      prevPhoto()
    else if (e.key === 'ArrowRight')
      nextPhoto()
    else if (e.key === 'Escape')
      closeLightbox()
  }
}

// 当前大图
const currentPhoto = computed(() => {
  if (!selectedAlbum.value)
    return null
  return selectedAlbum.value.photos[currentPhotoIndex.value]
})

// 生命周期钩子
onMounted(() => {
  if (albums.value.length > 0)
    selectedAlbum.value = albums.value[0]
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

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
  <section class="space-y-8 md:space-y-16 font-family-anwt">
    <div class="flex items-center absolute w-full left-0 top-0 pt-16 md:pb-16 h-full mx-auto pointer-events-none z--1">
      <!-- 左侧相册导航 -->
      <div class="w-1/8 min-w-[66px] p-4 flex flex-col items-center justify-center pointer-events-auto relative">
        <div
          v-for="(album, index) in albums"
          :key="album.id"
          class="mb-4 cursor-pointer transition-all duration-300 transform hover:scale-105"
          :class="getOpacityClass(index)"
          @click="viewAlbum(album, index)"
        >
          {{ album.title }}
        </div>
      </div>

      <!-- 中间照片展示区 -->
      <div
        class="flex-1 h-full md:whitespace-nowrap overflow-auto md:snap-x snap-y snap-mandatory pointer-events-auto w-full md:w-[unset] md:h-[66vh] text-[0px] scroll-smooth"
      >
        <div
          v-for="(photo, idx) in selectedAlbum?.photos"
          :key="photo.id"
          class="md:h-full block md:inline-block snap-center"
          @click="openLightbox(idx)"
        >
          <img
            :src="photo.src"
            :alt="photo.alt"
            class="h-full"
            loading="lazy"
          >
        </div>
      </div>
    </div>

    <!-- 灯箱模式 -->
    <div
      v-if="showLightbox && currentPhoto"
      class="fixed inset-0 bg-black/95 z-50 flex items-center justify-center backdrop-blur-sm transition-all duration-300"
      @click="closeLightbox"
    >
      <div class="relative w-full h-full flex items-center justify-center" @click.stop>
        <img
          :src="currentPhoto.src"
          :alt="currentPhoto.alt"
          class="max-h-[90vh] max-w-[90vw] object-contain transition-transform duration-500"
          loading="lazy"
        >

        <div
          class="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black/60
                 px-6 py-3 rounded-full text-sm backdrop-blur-sm"
        >
          {{ currentPhoto.description || currentPhoto.alt }}
        </div>

        <button
          class="absolute left-4 p-4 text-white bg-black/40 rounded-full hover:bg-black/60
                 transition-all duration-300 backdrop-blur-sm transform hover:-translate-x-1"
          @click.stop="prevPhoto"
        >
          <i class="i-solar-arrow-left-linear text-2xl" />
        </button>

        <button
          class="absolute right-4 p-4 text-white bg-black/40 rounded-full hover:bg-black/60
                 transition-all duration-300 backdrop-blur-sm transform hover:translate-x-1"
          @click.stop="nextPhoto"
        >
          <i class="i-solar-arrow-right-linear text-2xl" />
        </button>

        <button
          class="absolute top-4 right-4 p-3 text-white bg-black/40 rounded-full
                 hover:bg-black/60 transition-all duration-300 backdrop-blur-sm transform hover:rotate-90"
          @click.stop="closeLightbox"
        >
          <i class="i-solar-close-circle-linear text-2xl" />
        </button>
      </div>
    </div>
  </section>
</template>
