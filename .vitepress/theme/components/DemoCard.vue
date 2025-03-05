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
    <div class="flex items-center justify-between border-b-2 border-black dark:border-[#506C59] px-4 py-2">
      <h3
        class="text-xl font-semibold flex gap-1"
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
    <div v-if="question && answer" class="border-t-2 border-black dark:border-[#506C59] p-4 space-y-2">
      <h4 class="text-sm font-bold">
        问题说明
      </h4>
      <p class="text-sm opacity-60 leading-relaxed">
        {{ question }}
      </p>
      <p class="text-sm opacity-60 leading-relaxed">
        {{ answer }}
      </p>
    </div>
  </BorderContainer>
</template>
