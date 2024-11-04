<script setup lang="ts">
const gallery = await queryContent('gallery').find()
console.log('gallery: ', gallery)
</script>

<template>
  <div>
    <GalleryAlbum
      v-for="item in gallery"
      :key="item._id"
      :title="item.title"
      :pub-date="item.pubDate"
      :description="item.description"
      :image="item.image"
      :path="item._path"
    />
  </div>
</template>
