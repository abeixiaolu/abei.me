<script setup lang="ts">
defineProps<{
  title: string;
  name: string;
  question?: string;
  answer?: string;
  link?: string;
}>();
</script>

<template>
  <section class="terminal-demo">
    <div class="demo-heading">
      <h3 class="demo-title">
        <a v-if="link" :href="link" target="_blank" class="link">
          {{ title }}
        </a>
        <span v-else>
          {{ title }}
        </span>
      </h3>
      <a
        class="link"
        :href="`https://github.com/abeixiaolu/abei.me/tree/main/src/demo/${name}.vue`"
        target="_blank"
      >
        [source]
      </a>
    </div>
    <div class="p-4">
      <slot />
    </div>
    <div v-if="question && answer" class="demo-notes">
      <h4 class="text-sm font-bold">// 实验笔记</h4>
      <p class="text-sm leading-relaxed">
        {{ question }}
      </p>
      <p class="text-sm leading-relaxed">
        {{ answer }}
      </p>
    </div>
  </section>
</template>
