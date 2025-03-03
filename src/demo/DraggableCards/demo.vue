<template>
  <div class="demo-container">
    <h1 class="demo-title">可拖动卡片组件</h1>
    <p class="demo-description">
      尝试拖动顶部的卡片。当卡片被拖动到一定距离时，它会消失，并且会有一张新卡片补充进来。
      每张卡片的背景色和阴影都会根据图片内容自动调整，以保持视觉和谐。
    </p>
    
    <div class="card-demo">
      <DraggableCards />
    </div>
    
    <div class="demo-instructions">
      <h2>使用说明</h2>
      <ul>
        <li>点击并拖动任意卡片</li>
        <li>拖动距离超过阈值时，卡片会消失</li>
        <li>新卡片会自动补充，保持卡片数量不变</li>
        <li>每张卡片都有随机生成的和谐色彩</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import DraggableCards from './index.vue'
</script>

<style scoped>
.demo-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

.demo-title {
  font-size: 32px;
  margin-bottom: 16px;
  text-align: center;
}

.demo-description {
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 40px;
  text-align: center;
  color: rgba(0, 0, 0, 0.7);
}

.card-demo {
  margin: 40px 0;
  height: 600px;
}

.demo-instructions {
  margin-top: 60px;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.demo-instructions h2 {
  font-size: 24px;
  margin-bottom: 16px;
}

.demo-instructions ul {
  padding-left: 20px;
}

.demo-instructions li {
  margin-bottom: 8px;
  line-height: 1.5;
}
</style>
