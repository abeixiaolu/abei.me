<script lang="ts" setup>
import TerminalHeader from "../components/TerminalHeader.vue";
import { data } from "../../data/github-projects.data";
</script>

<template>
  <section class="terminal-page">
    <TerminalHeader
      command="ls ./repos"
      title="项目仓库"
      description="把想法写成代码，留下一些可以运行的东西。"
      :meta="`${data.reduce((total, section) => total + section.projects.length, 0)} REPOS`"
    />
    <p v-if="!data.length" class="project-empty">
      当前目录暂无项目。前往
      <a class="link" href="https://github.com/abeixiaolu" target="_blank" rel="noopener noreferrer"
        >GitHub</a
      >
      查看公开仓库。
    </p>
    <div class="space-y-10">
      <div v-for="section in data" :key="section.title">
        <h2 class="terminal-section-title">{{ section.title }}/</h2>
        <section class="space-y-4 pl-4 pt-2">
          <Project v-for="project in section.projects" :key="project.url" :project />
        </section>
      </div>
    </div>

    <div class="back-btn">
      <Button href="/" size="md">返回桌面</Button>
    </div>
  </section>
</template>

<style scoped>
.back-btn {
  display: flex;
  justify-content: center;
  margin: 3rem 0;
}
</style>
