<script setup lang="ts">
defineProps<{
  title: string
  name: string
  question?: string
  answer?: string
  link?: string
}>()
</script>

<template>
  <BorderContainer size="sm">
    <div class="flex items-center justify-between border-b border-(--color-border) px-4 py-2.5 font-family-anwt">
      <h3
        class="flex gap-1 text-lg text-(--color-heading)"
      >
        <a v-if="link" :href="link" target="_blank" class="link">
          {{ title }}
        </a>
        <span v-else>
          {{ title }}
        </span>
      </h3>
      <a class="link" :href="`https://github.com/abeixiaolu/artsmp.me/tree/main/src/demo/${name}.vue`" target="_blank">
        code
      </a>
    </div>
    <div class="p-4">
      <slot />
    </div>
    <div v-if="question && answer" class="space-y-2 border-t border-(--color-border) p-4">
      <h4 class="text-sm font-bold text-(--color-heading)">
        问题说明
      </h4>
      <p class="text-sm leading-relaxed text-(--color-text-soft)">
        {{ question }}
      </p>
      <p class="text-sm leading-relaxed text-(--color-text-soft)">
        {{ answer }}
      </p>
    </div>
  </BorderContainer>
</template>
