<script setup lang="ts">
import TerminalHeader from "../components/TerminalHeader.vue";
const { frontmatter } = useData();
</script>

<template>
  <section class="terminal-page">
    <TerminalHeader
      command="cat ./setup.conf"
      title="工作环境"
      description="日常使用的硬件、软件和工具配置。"
      meta="PERSONAL SETUP"
    />
    <Content class="prose dark:prose-invert" />
  </section>
</template>
