<template>
  <div class="bg" />
</template>

<style scoped>
.bg {
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  position: fixed;
  z-index: -1;
  background-color: var(--color-bg);
  background-image:
    radial-gradient(1200px 600px at 12% -10%, color-mix(in srgb, var(--color-primary) 8%, transparent), transparent 65%),
    radial-gradient(900px 500px at 88% -20%, color-mix(in srgb, var(--color-magenta) 7%, transparent), transparent 65%),
    linear-gradient(180deg, var(--color-bg-soft), var(--color-bg) 22%, var(--color-bg) 76%, var(--color-bg-soft));
  background-size:
    100% 100%,
    100% 100%,
    100% 100%;
  background-position:
    0 0,
    0 0,
    0 0;
  background-repeat: no-repeat;
}
</style>
