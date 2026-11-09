<script setup lang="ts">
import TerminalHeader from "../components/TerminalHeader.vue";
import { computed, nextTick, onMounted, onUnmounted, ref } from "vue";
import { data as galleryData } from "../../data/gallery.data";

interface Album {
  title: string;
  description: string;
  bordered?: boolean;
  pictures: Picture[];
}

interface Picture {
  url: string;
  width: number;
  height: number;
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
        } satisfies Picture;
      }),
    } as Album;
  });
});

// 当前查看的相册
const selectedAlbum = ref<Album>(albums.value[0]);
// 当前查看的照片索引
const currentPhotoIndex = ref(0);
// 是否显示大图
const showLightbox = ref(false);
let previousOverflow = "";
const lightbox = ref<HTMLElement>();
let previousFocus: HTMLElement | null = null;
function onLightboxKey(event: KeyboardEvent) {
  if (!showLightbox.value) return;
  if (event.key === "Escape") {
    event.preventDefault();
    closeLightbox();
  }
  if (event.key === "Tab") {
    const buttons = Array.from(lightbox.value?.querySelectorAll<HTMLButtonElement>("button") || []);
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    event.preventDefault();
    const next =
      index < 0
        ? event.shiftKey
          ? buttons.length - 1
          : 0
        : (index + (event.shiftKey ? -1 : 1) + buttons.length) % buttons.length;
    buttons[next]?.focus();
  }
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    prevPhoto();
  }
  if (event.key === "ArrowRight") {
    event.preventDefault();
    nextPhoto();
  }
}
onMounted(() => window.addEventListener("keydown", onLightboxKey, true));
onUnmounted(() => {
  window.removeEventListener("keydown", onLightboxKey, true);
  if (showLightbox.value) document.body.style.overflow = previousOverflow;
});

// 打开灯箱查看大图
async function openLightbox(photo: Picture, index: number) {
  previousFocus = document.activeElement as HTMLElement;
  selectedAlbum.value = albums.value.find((album) => album.pictures.includes(photo))!;
  currentPhotoIndex.value = index;
  previousOverflow = document.body.style.overflow;
  showLightbox.value = true;
  document.body.style.overflow = "hidden";
  await nextTick();
  lightbox.value?.querySelector<HTMLButtonElement>('[aria-label="关闭照片"]')?.focus();
}

// 关闭灯箱
function closeLightbox() {
  showLightbox.value = false;
  document.body.style.overflow = previousOverflow;
  previousFocus?.focus();
}

// 查看上一张照片
async function prevPhoto() {
  if (!selectedAlbum.value || currentPhotoIndex.value <= 0) return;

  currentPhotoIndex.value = currentPhotoIndex.value - 1;
  await restoreLightboxFocus();
}

// 查看下一张照片
async function nextPhoto() {
  if (!selectedAlbum.value || currentPhotoIndex.value >= selectedAlbum.value.pictures.length - 1)
    return;

  currentPhotoIndex.value = currentPhotoIndex.value + 1;
  await restoreLightboxFocus();
}

async function restoreLightboxFocus() {
  await nextTick();
  if (showLightbox.value && !lightbox.value?.contains(document.activeElement)) {
    lightbox.value?.querySelector<HTMLButtonElement>('[aria-label="关闭照片"]')?.focus();
  }
}

// 当前大图
const currentPhoto = computed(() => {
  if (!selectedAlbum.value) return null;
  return selectedAlbum.value.pictures[currentPhotoIndex.value];
});

// 是否可以前进/后退
const canGoPrev = computed(() => currentPhotoIndex.value > 0);
const canGoNext = computed(
  () => selectedAlbum.value && currentPhotoIndex.value < selectedAlbum.value.pictures.length - 1,
);
</script>

<template>
  <section class="terminal-page">
    <TerminalHeader
      command="ls ./frames"
      title="影像档案"
      description="从现实世界采集的光线、街道与片刻。"
      :meta="`${albums.length} ALBUMS`"
    />
    <div v-for="album in albums" :key="album.title" class="mb-4">
      <div class="album-heading">
        <div class="album-title">
          {{ album.title }}/ <small>{{ album.pictures.length }} FRAMES</small>
        </div>
        <div class="album-description">
          {{ album.description }}
        </div>
      </div>
      <div class="gallery-grid">
        <button
          type="button"
          v-for="(photo, idx) in album.pictures"
          :key="idx"
          class="gallery-thumbnail"
          :aria-label="`查看 ${album.title} 第 ${idx + 1} 张照片`"
          :class="album.bordered ? 'border-1 border-gray-200' : ''"
          @click="openLightbox(photo, idx)"
        >
          <img
            :src="photo.url"
            :alt="`${album.title} - ${idx + 1}`"
            class="size-full"
            loading="lazy"
          />
        </button>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="showLightbox && currentPhoto"
        ref="lightbox"
        role="dialog"
        aria-modal="true"
        aria-label="查看照片"
        class="terminal-lightbox fixed inset-0 z-50 flex items-center justify-center transition-all backdrop-blur-sm duration-300"
        @click="closeLightbox"
      >
        <div
          class="relative w-full h-full flex items-center justify-center"
          @click.stop="closeLightbox"
        >
          <div
            class="absolute z-[-1] size-full blur-3xl"
            :style="{ background: `no-repeat center/cover url(${currentPhoto.url})` }"
          />
          <img
            :src="currentPhoto.url"
            :alt="`${selectedAlbum.title} - ${currentPhotoIndex + 1}`"
            class="max-h-[90vh] max-w-[90vw] object-contain transition-transform duration-500"
            loading="lazy"
          />

          <button
            v-if="canGoPrev"
            aria-label="上一张照片"
            class="absolute left-4 p-2 text-white bg-black/40 rounded-full hover:bg-black/60 transition-all duration-300 backdrop-blur-sm transform hover:-translate-x-1"
            @click.stop="prevPhoto"
          >
            <i class="i-solar-arrow-left-linear text-2xl" />
          </button>

          <button
            v-if="canGoNext"
            aria-label="下一张照片"
            class="absolute right-4 p-2 text-white bg-black/40 rounded-full hover:bg-black/60 transition-all duration-300 backdrop-blur-sm transform hover:translate-x-1"
            @click.stop="nextPhoto"
          >
            <i class="i-solar-arrow-right-linear text-2xl" />
          </button>

          <button
            aria-label="关闭照片"
            class="absolute top-4 right-4 p-2 text-white bg-black/40 rounded-full hover:bg-black/60 transition-all duration-300 backdrop-blur-sm transform hover:rotate-90"
            @click.stop="closeLightbox"
          >
            <i class="i-solar-close-circle-linear text-2xl" />
          </button>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.gallery-grid {
  columns: 180px;
  column-gap: 16px;
}
.gallery-thumbnail {
  display: block;
  width: 100%;
  padding: 0;
  margin: 0 0 16px;
  break-inside: avoid;
  background: transparent;
  cursor: zoom-in;
}
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
