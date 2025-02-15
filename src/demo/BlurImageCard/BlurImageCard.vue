<script setup lang="ts">
</script>

<template>
  <div class="card">
    <div class="img-box">
      <img src="https://picsum.photos/1920/1080" alt="">
    </div>
    <div class="content">
      <h2 class="title">
        AI Flower
      </h2>
      <span class="time">1 hour ago</span>
      <p class="desc">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquam laborum autem nobis maxime labore.
      </p>
    </div>
  </div>
</template>

<style scoped>
.card {
  --bg: #fff;
  --text: #333;
  width: 300px;
  height: 280px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: 0.3s;
  background: var(--bg);
  color: var(--text);

  .img-box {
    position: relative;
    width: 100%;
    height: 210px;
    background-color: #333;
    filter: blur(3px);
    transition: 0.3s;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &::before {
      content: '';
      position: absolute;
      bottom: -20px;
      width: 100%;
      height: 40px;
      background-color: var(--bg);
      border-radius: 40px;
    }

    &::after {
      content: '';
      position: absolute;
      bottom: 20px;
      right: 0;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: transparent;
      box-shadow: 36px 39px 0 20px var(--bg);
  }
  }

  &:hover {
    height: 369px;

    .img-box {
      filter: blur(0);
    }
  }

  .content {
    position: relative;
    z-index: 10;
    padding: 20px;
    padding-top: 0;

    .title {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 10px;
      line-height: 1;
    }

    .time {
      display: block;
      font-size: 12px;
      color: #888;
      margin-bottom: 15px;
    }
  }
}

.dark .card {
  --bg: #333;
  --text: #fff;
}
</style>
