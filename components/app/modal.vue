<script setup lang="ts">
const show = defineModel<boolean>({
  required: true,
})

function close() {
  show.value = false
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="show"
        class="modal-overlay"
        @click="close"
      >
        <div
          class="flex flex-col gap-4 justify-between items-center absolute top-1/2 -translate-y-1/2 right-4"
          @click.stop=""
        >
          <AppCircleButton
            type="default"
            aria-label="close"
            icon="i-solar-close-circle-broken"
            @click="close"
          />
          <slot name="actions" />
        </div>
        <div class="modal-content">
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  @apply fixed top-0 left-0 w-full h-full z-[100] flex justify-center items-center bg-black/50;
}

.modal-content {
  @apply w-full h-full flex items-center justify-center;
}
</style>
