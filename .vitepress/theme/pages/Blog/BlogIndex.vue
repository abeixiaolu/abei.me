<script setup lang="ts">
import { computed, ref } from "vue";
import { data } from "../../../data/blog.data";
const categories = ["全部", "技术", "生活", "随笔"];
const category = ref("全部");
const query = ref("");
const filteredPosts = computed(() => {
  const search = query.value.trim().toLocaleLowerCase();
  return data.filter(
    (post) =>
      (category.value === "全部" || post.frontmatter.category === category.value) &&
      (!search ||
        `${post.frontmatter.title} ${post.frontmatter.description ?? ""}`
          .toLocaleLowerCase()
          .includes(search)),
  );
});
const years = computed(() => {
  const grouped = new Map<string, typeof data>();
  for (const post of filteredPosts.value) {
    const year = String(post.frontmatter.date).slice(0, 4);
    const entries = grouped.get(year) ?? [];
    entries.push(post);
    grouped.set(year, entries);
  }
  return grouped;
});
function resetFilters() {
  category.value = "全部";
  query.value = "";
}
</script>

<template>
  <section class="pixel-blog">
    <div class="page-breadcrumb"><a href="/">首页</a><span>/</span><span>博客</span></div>
    <header class="pixel-page-heading">
      <h1>文字日志</h1>
      <p>关于代码、生活，以及尚未想明白的事。</p>
    </header>
    <div class="blog-toolbar">
      <div class="blog-filters" aria-label="文章分类">
        <button
          v-for="item in categories"
          :key="item"
          type="button"
          :aria-pressed="category === item"
          @click="category = item"
        >
          {{ item }}
        </button>
      </div>
      <label class="blog-search"
        ><span class="sr-only">搜索文章</span
        ><input v-model="query" type="search" placeholder="搜索文章" /><i
          class="i-pixelarticons-search"
          aria-hidden="true"
        ></i
      ></label>
    </div>
    <p class="search-results" aria-live="polite">
      {{
        query || category !== "全部"
          ? `找到 ${filteredPosts.length} 篇文章`
          : `共 ${data.length} 篇，慢慢看。`
      }}
    </p>
    <section v-for="[year, posts] in years" :key="year" class="blog-year">
      <h2>{{ year }}</h2>
      <BlogItem v-for="post in posts" :key="post.url" :post="post" />
    </section>
    <div v-if="!filteredPosts.length" class="blog-empty">
      <span class="i-pixelarticons-notes" aria-hidden="true"></span>
      <h2>这一页还空着。</h2>
      <p>换个关键词，或看看全部文章。</p>
      <button type="button" class="pixel-button" @click="resetFilters">显示全部文章</button>
    </div>
    <a class="back-to-desk" href="/"
      ><i class="i-pixelarticons-arrow-left" aria-hidden="true"></i> 返回桌面</a
    >
  </section>
</template>
