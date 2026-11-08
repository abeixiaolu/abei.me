<script setup lang="ts">
import { data as posts } from "../../data/blog.data";
const shortcuts = [
  { icon: '▤', label: '文章', sub: 'NOTES', path: '/blog' },
  { icon: '▣', label: '项目', sub: 'PROJECTS', path: '/project' },
  { icon: '⌘', label: '实验', sub: 'PLAY', path: '/demo' },
  { icon: '▨', label: '相册', sub: 'GALLERY', path: '/gallery' },
];
</script>
<template>
  <div class="home-screen">
    <div class="home-kicker">PERSONAL COMPUTER &nbsp; / &nbsp; VOL. 01</div>
    <h1>你好，我是阿北<span>_</span></h1>
    <div class="home-bio"><Content /></div>
    <div class="home-divider"><span>EXPLORE THE DESK</span><span>01 — 04</span></div>
    <div class="shortcut-grid"><a v-for="item in shortcuts" :key="item.path" :href="item.path"><span class="shortcut-icon">{{ item.icon }}</span><strong>{{ item.label }}</strong><small>{{ item.sub }}</small></a></div>
    <div class="home-divider recent-heading"><span>RECENT NOTES</span><a href="/blog">ALL NOTES ↗</a></div>
    <div class="recent-list"><a v-for="post in posts.slice(0, 3)" :key="post.url" :href="post.url"><span>▤</span><span>{{ post.frontmatter.title }}</span><span>↗</span></a></div>
  </div>
</template>
