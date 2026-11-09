<script setup lang="ts">
import { data as posts } from "../../data/blog.data";
import { navigation } from "../navigation";
const cartridges = navigation.filter((app) => app.cartridge);
</script>

<template>
  <div class="pixel-home">
    <div class="home-intro">
      <div>
        <h1>你好，我是阿北。</h1>
        <p>写代码，做设计，偶尔带相机出门。</p>
      </div>
      <div class="player-badge" aria-label="玩家一">
        <span>PLAYER 01</span><i class="i-pixelarticons-heart" aria-hidden="true"></i
        ><i class="i-pixelarticons-heart" aria-hidden="true"></i
        ><i class="i-pixelarticons-heart" aria-hidden="true"></i>
      </div>
    </div>
    <div class="pixel-room">
      <img
        class="room-art"
        src="/pixel/room.webp"
        alt="像素书桌，窗外是杭州西湖，桌上放着红白机、显示器和卡带"
        width="1942"
        height="809"
        fetchpriority="high"
      />
      <div class="monitor-content">
        <strong>ABEI / OS</strong><span>PRESS START</span
        ><a href="/blog">进入博客 <i class="i-pixelarticons-arrow-right" aria-hidden="true"></i></a>
      </div>
      <nav class="cartridge-nav" aria-label="桌面应用">
        <a
          v-for="(app, index) in cartridges"
          :key="app.path"
          :href="app.path"
          class="cartridge-link"
          :class="`cartridge-${index}`"
          ><strong>{{ app.label }}</strong
          ><span :class="app.icon" aria-hidden="true"></span
        ></a>
      </nav>
    </div>
    <p class="room-instruction">点击卡带切换页面，和犬夜叉一起探索。</p>
    <section class="home-recent" aria-labelledby="recent-title">
      <h2 id="recent-title">最近更新</h2>
      <div>
        <a v-for="post in posts.slice(0, 2)" :key="post.url" :href="post.url"
          ><span
            >{{ post.frontmatter.title }}
            <i class="i-pixelarticons-external-link" aria-hidden="true"></i></span
          ><time :datetime="post.frontmatter.date">{{
            String(post.frontmatter.date).slice(0, 10).replaceAll("-", ".")
          }}</time></a
        >
      </div>
    </section>
    <details class="home-about">
      <summary>关于这张书桌</summary>
      <Content />
    </details>
  </div>
</template>
