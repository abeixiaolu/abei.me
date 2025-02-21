<script setup lang="ts">
</script>

<template>
  <section class="space-y-8 md:space-y-16">
    <PageHeader />

    <div class="columns-1 md:columns-2 gap-6">
      <DemoCard
        title="Sprite Animation"
        name="TwitterLikeBtn/TwitterLikeBtn"
        question="inline-flex 可能会造成元素下方出现空白？"
        answer="inline-flex 元素会按照文本基线对齐，浏览器会为其保留降部字形（如 g、p）的空间，即使没有文字也会显示这个空白区域。使用 vertical-align: middle 可以解决这个问题。"
        link="https://leanrada.com/notes/css-sprite-sheets/"
        class="mb-4 break-inside-avoid"
      >
        <TwitterLikeBtn />
      </DemoCard>

      <DemoCard
        title="Checkbox"
        name="Checkbox/Checkbox"
        class="mb-4 break-inside-avoid"
      >
        <Checkbox />
      </DemoCard>

      <DemoCard
        title="Blur Image Card"
        name="BlurImageCard/BlurImageCard"
        class="mb-4 break-inside-avoid"
      >
        <BlurImageCard />
      </DemoCard>

      <DemoCard
        title="Matrix Rain"
        name="MatrixRain/MatrixRain"
        class="mb-4 break-inside-avoid"
      >
        <MatrixRain />
      </DemoCard>
    </div>

    <div class="flex justify-center">
      <Button href="/" size="md">
        Back to Home
      </Button>
    </div>
  </section>
</template>
