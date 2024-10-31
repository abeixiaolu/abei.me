<template>
  <NuxtLoadingIndicator color="#14b8a6" />
  <AppNavbar />
  <div class="pb-24 sm:pb-0 sm:pt-24">
    <AppContainer>
      <NuxtPage />
    </AppContainer>
  </div>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.2s;
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(5px);
}
</style>

<style>
:root {
  --color-bg: #F1F0EA;
  --color-text: #000000de;
}
.dark-mode:root {
  --color-bg: #1a1a1a;
  --color-text: #ffffffde;
}
body {
  background-color: var(--color-bg);
  color: var(--color-text);
}
</style>
