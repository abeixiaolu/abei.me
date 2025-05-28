<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
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
// 瀑布流容器引用
const masonryContainer = ref<HTMLElement>()
// 瀑布流项目引用
const masonryItems = ref<HTMLElement[]>([])
// 响应式列数
const columnCount = ref(4)
// 列高度数组
const columnHeights = ref<number[]>([])

// 计算响应式列数
function getColumnCount() {
  const width = window.innerWidth
  if (width < 640)
    return 1
  if (width < 768)
    return 2
  if (width < 1024)
    return 3
  if (width < 1280)
    return 4
  return 5
}

// 初始化瀑布流
function initMasonry() {
  if (!masonryContainer.value)
    return

  const cols = getColumnCount()
  columnCount.value = cols
  columnHeights.value = Array.from({ length: cols }, () => 0)

  // 重置所有图片位置
  masonryItems.value.forEach((item) => {
    item.style.position = 'absolute'
    item.style.left = '0'
    item.style.top = '0'
    item.style.opacity = '0'
  })

  // 等待图片加载完成后重新布局
  layoutMasonry()
}

// 布局瀑布流
async function layoutMasonry() {
  if (!masonryContainer.value || masonryItems.value.length === 0)
    return

  const containerWidth = masonryContainer.value.offsetWidth
  const gap = 16 // 间隙
  const columnWidth = (containerWidth - gap * (columnCount.value - 1)) / columnCount.value

  // 重置列高度
  columnHeights.value = Array.from({ length: columnCount.value }, () => 0)

  for (let i = 0; i < masonryItems.value.length; i++) {
    const item = masonryItems.value[i]
    const img = item.querySelector('img') as HTMLImageElement

    // 等待图片加载
    if (!img.complete) {
      await new Promise((resolve) => {
        img.onload = resolve
        img.onerror = resolve
      })
    }

    // 找到最短的列
    const shortestColumnIndex = columnHeights.value.indexOf(Math.min(...columnHeights.value))

    // 计算位置
    const left = shortestColumnIndex * (columnWidth + gap)
    const top = columnHeights.value[shortestColumnIndex]

    // 设置位置
    item.style.width = `${columnWidth}px`
    item.style.left = `${left}px`
    item.style.top = `${top}px`
    item.style.opacity = '1'
    item.style.transition = 'opacity 0.3s ease'

    // 更新列高度
    columnHeights.value[shortestColumnIndex] += item.offsetHeight + gap
  }

  // 设置容器高度
  const maxHeight = Math.max(...columnHeights.value)
  masonryContainer.value.style.height = `${maxHeight}px`
}

// 窗口大小改变时重新布局
function handleResize() {
  initMasonry()
}

// 选择相册查看详情
function viewAlbum(album: Album, index: number) {
  selectedAlbum.value = album
  activeAlbumIndex.value = index

  // 切换相册时重新初始化瀑布流
  nextTick(() => {
    initMasonry()
  })
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

// 键盘导航
function handleKeyDown(e: KeyboardEvent) {
  if (showLightbox.value) {
    e.preventDefault()
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
  return selectedAlbum.value.pictures[currentPhotoIndex.value]
})

// 是否可以前进/后退
const canGoPrev = computed(() => currentPhotoIndex.value > 0)
const canGoNext = computed(() => selectedAlbum.value && currentPhotoIndex.value < selectedAlbum.value.pictures.length - 1)

// 监听选中相册变化
watch(selectedAlbum, () => {
  nextTick(() => {
    initMasonry()
  })
})

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('resize', handleResize)

  nextTick(() => {
    initMasonry()
  })
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('resize', handleResize)
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
      <!-- 瀑布流容器 -->
      <div
        ref="masonryContainer"
        class="relative w-full"
        style="min-height: 100px;"
      >
        <div
          v-for="(photo, idx) in selectedAlbum.pictures"
          :key="idx"
          ref="masonryItems"
          class="absolute group cursor-pointer overflow-hidden transition-all duration-300"
          :class="selectedAlbum.bordered ? 'border-1 border-solid border-gray-200' : ''"
          @click="openLightbox(idx)"
        >
          <img
            :src="photo.url"
            :alt="`${selectedAlbum.title} - ${idx + 1}`"
            class="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-102"
            loading="lazy"
            @load="layoutMasonry"
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
/* 图片加载优化 */
img {
  height: auto;
  max-width: 100%;
  display: block;
}

/* 平滑过渡 */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
