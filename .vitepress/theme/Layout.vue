<script setup lang="ts">
import { computed, defineAsyncComponent, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useData, useRoute, useRouter } from "vitepress";

const DeskScene = defineAsyncComponent(() => import("./components/DeskScene.vue"));
const { frontmatter } = useData();
const route = useRoute();
const router = useRouter();
const menuOpen = ref(false);
const expanded = ref(false);
const desktop = ref(false);
const sceneReady = ref(false);
const sceneFailed = ref(false);
const content = ref<HTMLElement>();
const phoneMenu = ref<HTMLElement>();
let menuTrigger: HTMLElement | null = null;
watch(menuOpen, async (open) => {
  if (open) {
    menuTrigger = document.activeElement as HTMLElement;
    await nextTick();
    phoneMenu.value?.querySelector<HTMLElement>("button, a")?.focus();
  } else {
    await nextTick();
    menuTrigger?.focus();
  }
});
const apps = [
  { label: "桌面", english: "HOME", path: "/", icon: "⌂" },
  { label: "文章", english: "NOTES", path: "/blog", icon: "▤" },
  { label: "项目", english: "PROJECTS", path: "/project", icon: "▣" },
  { label: "实验", english: "PLAY", path: "/demo", icon: "⌘" },
  { label: "装备", english: "USES", path: "/use", icon: "▧" },
  { label: "相册", english: "GALLERY", path: "/gallery", icon: "▨" },
];
const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];
const letters = ["", "ABC", "DEF", "GHI", "JKL", "MNO", "PQRS", "TUV", "WXYZ", "", "+", ""];
const isHome = computed(() => route.path === "/" || route.path === "/index.html");
const activeApp = computed(
  () =>
    apps.find((app) => app.path !== "/" && route.path.startsWith(app.path)) ||
    (isHome.value ? apps[0] : { label: "文件", english: "FILE", path: route.path, icon: "▤" }),
);
function closeApp() {
  expanded.value = false;
  router.go("/");
}
function phoneKey(index: number) {
  if (index < apps.length) router.go(apps[index].path);
  else if (index === 6) content.value?.scrollBy({ top: -220, behavior: "smooth" });
  else if (index === 7) content.value?.scrollBy({ top: 220, behavior: "smooth" });
  else if (index === 8 || index === 9) menuOpen.value = !menuOpen.value;
  else if (index === 10) content.value?.scrollTo({ top: 0, behavior: "smooth" });
  else if (index === 11) closeApp();
}
function onKey(event: KeyboardEvent) {
  if (event.key !== "Escape" || event.defaultPrevented) return;
  if (menuOpen.value) menuOpen.value = false;
  else if (expanded.value) expanded.value = false;
  else if (!isHome.value) closeApp();
}
let stopMedia = () => {};
onMounted(() => {
  const media = matchMedia("(min-width: 701px)");
  const update = () => {
    desktop.value = media.matches;
    menuOpen.value = false;
    sceneReady.value = false;
    if (!media.matches) expanded.value = false;
  };
  update();
  media.addEventListener("change", update);
  window.addEventListener("keydown", onKey);
  stopMedia = () => {
    media.removeEventListener("change", update);
    window.removeEventListener("keydown", onKey);
  };
});
onUnmounted(() => stopMedia());
watch(
  () => route.path,
  async () => {
    menuOpen.value = false;
    if (isHome.value) expanded.value = false;
    await nextTick();
    content.value?.scrollTo(0, 0);
  },
);
</script>

<template>
  <div
    class="scene"
    :class="{
      'scene-app': !isHome,
      'scene-expanded': expanded,
      'scene-fallback': sceneFailed,
      'scene-ready': sceneReady,
    }"
  >
    <a class="skip-link" :href="isHome && desktop && !sceneFailed ? '/blog' : '#main-content'"
      >跳转到内容</a
    >
    <header class="scene-header" :inert="expanded || menuOpen">
      <a href="/" class="site-name">ABEI<span>’S</span> DESK<span class="name-dot">.</span></a>
      <nav aria-label="主导航">
        <a
          v-for="app in apps.slice(1)"
          :key="app.path"
          :href="app.path"
          :class="{ selected: activeApp.path === app.path }"
          :aria-current="activeApp.path === app.path ? 'page' : undefined"
          >{{ app.english }}</a
        >
      </nav>
    </header>
    <div v-if="isHome" class="scene-hint">
      <span>HANGZHOU, CHINA</span><span>点击显示器或录像带，打开一个应用</span>
    </div>
    <div class="desk-scene">
      <DeskScene
        v-if="desktop && !sceneFailed"
        :focused="!isHome"
        @open="router.go($event)"
        @ready="sceneReady = true"
        @failed="sceneFailed = true"
      />
      <div v-if="desktop && !sceneReady && !sceneFailed" class="scene-loading" role="status">
        ABEI OS <span>正在打开书桌…</span>
      </div>
      <div class="phone-brand">
        <div class="earpiece" aria-hidden="true"></div>
        <strong>ABEI</strong><small>CONNECTING PEOPLE & IDEAS</small>
      </div>
      <div class="device-screen">
        <div class="screen-top">
          <span>ABEI/OS <i>— TERMINAL</i></span
          ><span>● LOCAL</span>
        </div>
        <div class="screen-body" :inert="menuOpen">
          <div class="screen-title">
            <span
              >~/{{ activeApp.english.toLowerCase() }} <i>/ {{ activeApp.label }}</i></span
            >
            <div class="window-actions">
              <button
                class="expand-button"
                :aria-label="expanded ? '退出阅读模式' : '阅读模式'"
                :aria-pressed="expanded"
                @click="expanded = !expanded"
              >
                {{ expanded ? "▣" : "□" }}
              </button>
              <button v-if="!isHome" aria-label="关闭应用，返回桌面" @click="closeApp">×</button>
            </div>
          </div>
          <main
            id="main-content"
            ref="content"
            class="screen-content"
            :key="route.path"
            tabindex="-1"
          >
            <Home v-if="frontmatter.layout === 'home'" />
            <BlogIndex v-else-if="frontmatter.layout === 'blog'" />
            <BlogShow v-else-if="frontmatter.layout === 'blog-show'" />
            <Projects v-else-if="frontmatter.layout === 'projects'" />
            <Demos v-else-if="frontmatter.layout === 'demo'" />
            <Uses v-else-if="frontmatter.layout === 'uses'" />
            <Gallery v-else-if="frontmatter.layout === 'gallery'" />
            <Content v-else />
          </main>
          <div class="screen-bottom">
            <span>{{ activeApp.english.toLowerCase() }} / UTF-8</span><span>[ ESC ] 返回桌面</span>
          </div>
        </div>
        <nav
          v-if="menuOpen"
          ref="phoneMenu"
          id="phone-menu"
          class="phone-menu"
          aria-label="手机应用列表"
        >
          <div class="phone-menu-title">
            应用列表 <button @click="menuOpen = false" aria-label="关闭菜单">×</button>
          </div>
          <a
            v-for="(app, index) in apps"
            :key="app.path"
            :href="app.path"
            :aria-current="activeApp.path === app.path ? 'page' : undefined"
            ><span>{{ index + 1 }} &nbsp; {{ app.icon }} &nbsp; {{ app.label }}</span
            ><small>{{ app.english }} →</small></a
          >
        </nav>
        <div class="phone-softkeys">
          <button
            :aria-expanded="menuOpen"
            aria-controls="phone-menu"
            @click="menuOpen = !menuOpen"
          >
            {{ menuOpen ? "关闭" : "菜单" }}</button
          ><span aria-hidden="true">●</span><a href="/">桌面</a>
        </div>
      </div>
      <div class="phone-controls">
        <div class="phone-control-row">
          <button
            class="call-key"
            :aria-expanded="menuOpen"
            aria-controls="phone-menu"
            @click="menuOpen = !menuOpen"
            aria-label="打开应用菜单"
          >
            ☰
          </button>
          <div class="direction-key">
            <button
              aria-label="向上滚动"
              @click="content?.scrollBy({ top: -220, behavior: 'smooth' })"
            >
              ▴</button
            ><button
              aria-label="向下滚动"
              @click="content?.scrollBy({ top: 220, behavior: 'smooth' })"
            >
              ▾
            </button>
          </div>
          <a class="end-key" href="/" aria-label="返回桌面">⌂</a>
        </div>
        <div class="keypad">
          <button
            v-for="(key, index) in keys"
            :key="key"
            @click="phoneKey(index)"
            :aria-label="
              index < apps.length
                ? `${key}：打开${apps[index].label}`
                : index === 6
                  ? '七：向上滚动'
                  : index === 7
                    ? '八：向下滚动'
                    : index === 8
                      ? '九：菜单'
                      : index === 9
                        ? '星号：菜单'
                        : index === 10
                          ? '零：回到顶部'
                          : index === 11
                            ? '井号：返回桌面'
                            : key
            "
          >
            <span>{{ key }}</span
            ><small>{{ letters[index] }}</small>
          </button>
        </div>
        <div class="phone-model">3310 · PERSONAL EDITION</div>
      </div>
    </div>
    <footer class="scene-footer">
      <span>© ABEI / A PERSONAL SPACE ON THE INTERNET</span><span>TAKE YOUR TIME. &nbsp; ✳</span>
    </footer>
  </div>
</template>
