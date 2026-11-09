<script setup lang="ts">
defineProps<{ command: string; title: string; description: string; meta?: string }>();
</script>

<template>
  <header class="terminal-header">
    <div class="terminal-command">
      <span>abei@desk:~</span><span aria-hidden="true">$</span> {{ command }}
    </div>
    <div class="terminal-heading">
      <h1>{{ title }}<span aria-hidden="true">_</span></h1>
      <span v-if="meta" class="terminal-meta">{{ meta }}</span>
    </div>
    <p>{{ description }}</p>
  </header>
</template>
