<template>
  <label for="like-btn" class="animate-on-click">
    <input id="like-btn" type="checkbox" class="hidden">
    <div class="heart-box">
      <div role="img" alt="interactive heart animation" class="heart" />
    </div>
    Like
  </label>
</template>

<style scoped>
.animate-on-click {
  display: inline-flex;
  vertical-align: middle;
  align-items: center;
  cursor: pointer;
  font-size: 30px;
}

.heart-box {
  display: grid;
  place-content: center;
  width: 60px;
  height: 60px;
}

.heart {
  background-image: url('./heart-sprite.png');
  width: 100px;
  height: 100px;
  background-size: 2900px 100px;
}

.animate-on-click > input:checked + .heart-box > [role="img"] {
  animation: heartAnimation 0.8s steps(29, jump-none) forwards;
}

.animate-on-click:has(:checked) {
  color: #fb345c;
}

@keyframes heartAnimation {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: -2800px 0px;
  }
}
</style>
