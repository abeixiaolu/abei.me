<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";

type CompanionState = { kind: "idle" } | { kind: "jump" | "attack" | "portal"; sequence: number };
const props = defineProps<{ routePath: string; placement: "desk" | "window" }>();
const state = ref<CompanionState>({ kind: "idle" });
const reducedMotion = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;
let sequence = 0;
let nextAction: "jump" | "attack" = "jump";
let removeMotionListener = () => {};
const speech = computed(
  () =>
    ({ idle: "出发，去看看！", jump: "跟上我！", attack: "风之伤！", portal: "下一站，到了！" })[
      state.value.kind
    ],
);
const attacking = computed(() => state.value.kind === "attack" || state.value.kind === "portal");

function play(kind: "jump" | "attack" | "portal") {
  clearTimeout(timer);
  const current = ++sequence;
  state.value = { kind, sequence: current };
  timer = setTimeout(
    () => {
      if (sequence === current) state.value = { kind: "idle" };
    },
    reducedMotion.value ? 700 : 1100,
  );
}
function interact() {
  play(nextAction);
  nextAction = nextAction === "jump" ? "attack" : "jump";
}
watch(
  () => props.routePath,
  () => play("portal"),
);
onMounted(() => {
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  const update = () => {
    reducedMotion.value = media.matches;
  };
  update();
  media.addEventListener("change", update);
  removeMotionListener = () => media.removeEventListener("change", update);
});
onUnmounted(() => {
  clearTimeout(timer);
  removeMotionListener();
});
</script>

<template>
  <aside
    class="pixel-companion"
    :class="[
      `companion--${placement}`,
      `companion--${state.kind}`,
      { 'companion--still': reducedMotion },
    ]"
    aria-label="桌面伙伴"
  >
    <div class="companion-speech" aria-hidden="true">{{ speech }}</div>
    <button
      type="button"
      class="companion-button"
      @click="interact"
      aria-label="和犬夜叉互动，跳跃或释放风之伤"
    >
      <img
        :key="state.kind === 'idle' ? 'idle' : state.sequence"
        :src="attacking ? '/pixel/inuyasha-attack.png' : '/pixel/inuyasha-idle.png'"
        alt="犬夜叉像素人偶"
        width="320"
        height="320"
        draggable="false"
      />
    </button>
    <img
      v-if="state.kind === 'portal'"
      class="companion-portal"
      src="/pixel/portal.png"
      alt=""
      aria-hidden="true"
    />
    <span class="companion-hint">点击人偶互动 · 切换页面穿梭</span>
  </aside>
</template>
