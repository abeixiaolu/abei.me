<template>
  <div class="app">
    <NuxtLoadingIndicator color="#14b8a6" />
    <AppNavbar />
    <div class="pb-24 sm:pb-0 pt-4 sm:pt-28">
      <AppContainer class="slide-enter-content">
        <NuxtPage />
      </AppContainer>
    </div>
  </div>
</template>
