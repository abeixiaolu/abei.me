<script setup lang="ts">
</script>

<template>
  <div class="slide-enter-content">
    <ContentList
      v-slot="{ list }"
      path="/gallery"
    >
      <GalleryAlbum
        v-for="item in list"
        :key="item._id"
        :title="item.title"
        :pub-date="item.pubDate"
        :description="item.description"
        :image="item.image"
        :path="item._path"
      />
    </ContentList>
  </div>
</template>
