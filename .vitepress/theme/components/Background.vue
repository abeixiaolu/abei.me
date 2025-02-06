<template>
  <div class="bg" />
</template>

<style scoped>
.bg {
  width: 100vw;
  height: 100vh;
  top:0;
  left:0;
  position: fixed;
  z-index: -1;
  color: var(--color-text);
  background-color: var(--color-bg);
  background-image:
    linear-gradient(-180deg,
      rgba(255, 255, 255, 0),
      var(--color-bg)),
    linear-gradient(to right, var(--color-grid) 1px, transparent 0),
    linear-gradient(to bottom, var(--color-grid) 1px, transparent 0);
  background-size:
    100% 100%,
    20px 20px,
    20px 20px;
  background-position:
    0 0,
    0 0,
    0 0;
  background-repeat: no-repeat, repeat, repeat;
}
</style>
