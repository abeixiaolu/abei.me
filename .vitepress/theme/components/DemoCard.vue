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
  <div class="border-2 border-black shadow-[4px_4px_0_black]">
    <div class="flex items-center justify-between border-b-2 border-black px-4 py-2">
      <h3
        class="text-xl font-semibold flex gap-1"
      >
        <a v-if="link" :href="link" target="_blank" class="hover:underline decoration-2 after:content-['\2197'] after:text-sm after:mt-[6px] after:ml-1">
          {{ title }}
        </a>
        <span v-else>
          {{ title }}
        </span>
      </h3>
      <Button :href="`https://github.com/abeixiaolu/artsmp.me/tree/main/src/demo/${name}.vue`" target="_blank">
        view code
      </Button>
    </div>
    <div class="p-4">
      <slot />
    </div>
    <div v-if="question && answer" class="border-t-2 border-black p-4 space-y-2">
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
  </div>
</template>
