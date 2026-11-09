<script setup lang="ts">
defineProps<{ command: string; title: string; description: string; meta?: string }>();
</script>

<template>
  <header class="terminal-header">
    <div class="terminal-command">
      <a href="/">首页</a><span aria-hidden="true">/</span><span>{{ title }}</span>
    </div>
    <div class="terminal-heading">
      <h1>{{ title }}</h1>
      <span v-if="meta" class="terminal-meta">{{ meta }}</span>
    </div>
    <p>{{ description }}</p>
  </header>
</template>
