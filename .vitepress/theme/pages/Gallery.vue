<script setup lang="ts">
import type { Album } from '../types/album'
import { computed, ref } from 'vue'
import { data as albumsData } from '../../data/albums.data'

// 影集数据
const albums = ref(albumsData)

// 当前查看的相册
const selectedAlbum = ref<Album | null>(null)
// 当前查看的照片索引
const currentPhotoIndex = ref(0)
// 是否显示大图
const showLightbox = ref(false)

// 选择相册查看详情
function viewAlbum(album: Album) {
  selectedAlbum.value = album
}

// 返回相册列表
function backToList() {
  selectedAlbum.value = null
}

// 打开灯箱查看大图
function openLightbox(index: number) {
  currentPhotoIndex.value = index
  showLightbox.value = true
}

// 关闭灯箱
function closeLightbox() {
  showLightbox.value = false
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

// 当前大图
const currentPhoto = computed(() => {
  if (!selectedAlbum.value)
    return null
  return selectedAlbum.value.photos[currentPhotoIndex.value]
})
</script>

<template>
  <section class="space-y-8 md:space-y-16 font-family-anwt">
    <PageHeader />

    <!-- 相册列表 - 瀑布流布局 -->
    <div v-if="!selectedAlbum">
      <!-- 瀑布流相册列表 -->
      <div class="columns-1 md:columns-2 gap-6">
        <BorderContainer
          v-for="album in albums"
          :key="album.id"
          size="sm"
          class="group cursor-pointer transition-all duration-300 p-2! overflow-hidden mb-4"
          @click="viewAlbum(album)"
        >
          <div class="overflow-hidden">
            <img
              :src="album.cover"
              :alt="album.title"
              class="w-full object-cover transition-transform duration-500 group-hover:scale-105"
            >
          </div>
        </BorderContainer>
      </div>

      <!-- 当没有影集时显示 -->
      <div v-if="albums.length === 0" class="text-center py-16">
        <div class="text-6xl opacity-20 mb-4">
          <i class="i-solar-gallery-bold-duotone" />
        </div>
        <p class="text-xl opacity-50 mb-4">
          还没有影集
        </p>
      </div>
    </div>

    <!-- 相册详情 - 瀑布流布局 -->
    <div v-else class="space-y-6">
      <div class="flex items-center">
        <button
          class="flex items-center text-sm opacity-70 hover:opacity-100 transition-opacity"
          @click="backToList"
        >
          <i class="i-solar-arrow-left-broken mr-1" /> 返回
        </button>
        <h2 class="text-2xl font-medium ml-4">
          {{ selectedAlbum.title }}
        </h2>
      </div>

      <!-- 瀑布流照片网格 -->
      <div class="columns-1 md:columns-2 gap-6">
        <div
          v-for="photo in selectedAlbum.photos"
          :key="photo.id"
          class="overflow-hidden rounded-lg cursor-pointer group transition-transform duration-300 hover:shadow-lg mb-4"
          @click="openLightbox(selectedAlbum.photos.indexOf(photo))"
        >
          <img
            :src="photo.src"
            :alt="photo.alt"
            class="w-full object-cover transition-transform duration-500 group-hover:scale-105"
          >
        </div>
      </div>
    </div>

    <!-- 灯箱大图查看 -->
    <div
      v-if="showLightbox && currentPhoto"
      class="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
      @click="closeLightbox"
    >
      <div class="relative w-full h-full flex items-center justify-center" @click.stop>
        <img
          :src="currentPhoto.src"
          :alt="currentPhoto.alt"
          class="max-h-[90vh] max-w-[90vw] object-contain"
          loading="lazy"
        >

        <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-4 py-2 rounded-md text-sm">
          {{ currentPhoto.description || currentPhoto.alt }}
        </div>

        <button
          class="absolute left-4 p-3 text-white bg-black bg-opacity-40 rounded-full hover:bg-opacity-60 transition-all"
          @click.stop="prevPhoto"
        >
          <i class="i-solar-arrow-left-linear text-xl" />
        </button>

        <button
          class="absolute right-4 p-3 text-white bg-black bg-opacity-40 rounded-full hover:bg-opacity-60 transition-all"
          @click.stop="nextPhoto"
        >
          <i class="i-solar-arrow-right-linear text-xl" />
        </button>

        <button
          class="absolute top-4 right-4 p-2 text-white bg-black bg-opacity-40 rounded-full hover:bg-opacity-60 transition-all"
          @click.stop="closeLightbox"
        >
          <i class="i-solar-close-circle-linear text-xl" />
        </button>
      </div>
    </div>
  </section>
</template>
