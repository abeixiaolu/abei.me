<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useData, useRoute, useRouter } from "vitepress";
import { navigation } from "./navigation";
import PixelCompanion from "./components/PixelCompanion.vue";

const { frontmatter, page } = useData();
const route = useRoute();
const router = useRouter();
const expanded = ref(false);
const content = ref<HTMLElement>();
const isHome = computed(() => route.path === "/" || route.path === "/index.html");
const activeApp = computed(
  () =>
    navigation.find((app) => app.path !== "/" && route.path.startsWith(app.path)) ?? navigation[0],
);
function onKey(event: KeyboardEvent) {
  if (event.key !== "Escape" || event.defaultPrevented) return;
  if (expanded.value) expanded.value = false;
  else if (
    !isHome.value &&
    !(
      event.target instanceof HTMLElement &&
      event.target.closest("input, textarea, [contenteditable]")
    )
  )
    router.go("/");
}
onMounted(() => window.addEventListener("keydown", onKey));
onUnmounted(() => window.removeEventListener("keydown", onKey));
watch(
  () => route.path,
  async () => {
    expanded.value = false;
    await nextTick();
    content.value?.focus({ preventScroll: true });
  },
);
</script>

<template>
  <div class="pixel-site" :class="{ 'reading-expanded': expanded }">
    <a class="skip-link" href="#main-content">跳转到内容</a>
    <header class="pixel-header">
      <a href="/" class="pixel-brand" aria-label="阿北的桌面，返回首页">
        <span class="brand-seal">阿</span><span>ABEI'S DESK</span>
      </a>
      <nav aria-label="主导航" class="pixel-nav">
        <a
          v-for="app in navigation"
          :key="app.path"
          :href="app.path"
          :aria-current="activeApp.path === app.path ? 'page' : undefined"
          >{{ app.label }}</a
        >
      </nav>
    </header>

    <main
      id="main-content"
      ref="content"
      tabindex="-1"
      class="pixel-main"
      :class="isHome ? 'pixel-main--home' : 'pixel-main--inner'"
    >
      <Home v-if="isHome" />
      <section v-else class="pixel-window" :aria-label="activeApp.label">
        <div class="pixel-titlebar">
          <span>ABEI / {{ page.isNotFound ? "404" : activeApp.english }}</span>
          <div class="pixel-window-actions">
            <button
              type="button"
              :aria-label="expanded ? '退出阅读模式' : '展开阅读模式'"
              :aria-pressed="expanded"
              @click="expanded = !expanded"
            >
              <span
                :class="expanded ? 'i-pixelarticons-scale' : 'i-pixelarticons-expand'"
                aria-hidden="true"
              ></span>
            </button>
            <a href="/" aria-label="关闭页面，返回桌面"
              ><span class="i-pixelarticons-close" aria-hidden="true"></span
            ></a>
          </div>
        </div>
        <div class="pixel-window-body" :key="route.path">
          <div v-if="page.isNotFound" class="pixel-not-found">
            <p class="pixel-eyebrow">AREA NOT FOUND</p>
            <h1>这里还没有地图。</h1>
            <p>这个页面可能已经搬走了。回到桌面，再出发吧。</p>
            <a href="/" class="pixel-button">返回桌面</a>
          </div>
          <BlogIndex v-else-if="frontmatter.layout === 'blog'" />
          <BlogShow v-else-if="frontmatter.layout === 'blog-show'" />
          <Projects v-else-if="frontmatter.layout === 'projects'" />
          <Demos v-else-if="frontmatter.layout === 'demo'" />
          <Uses v-else-if="frontmatter.layout === 'uses'" />
          <Gallery v-else-if="frontmatter.layout === 'gallery'" />
          <Content v-else class="prose" />
        </div>
      </section>
      <PixelCompanion :route-path="route.path" :placement="isHome ? 'desk' : 'window'" />
    </main>

    <footer class="pixel-footer">
      <span>© ABEI · HANGZHOU, CHINA</span><span>TAKE YOUR TIME.</span>
    </footer>
  </div>
</template>
