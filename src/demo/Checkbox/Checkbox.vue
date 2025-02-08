<script setup lang="ts">

</script>

<template>
  <label>
    <input type="checkbox">
    <span>Checkbox</span>
  </label>
</template>

<style scoped>
label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

input[type='checkbox'] {
  appearance: none;
  position: relative;
  display: inline-block;
  width: 2.75rem;
  height: 1.65rem;
  vertical-align: middle;
  border-radius: 2rem;
  box-shadow: 0px 1px 3px #0003 inset;
  transition: .25s linear background;
}

.dark input[type='checkbox'] {
  box-shadow: 0px 2px 3px #fff3 inset;
  background-color: #000;
}

input[type='checkbox']::before {
  content: '';
  position: absolute;
  top: 0.2rem;
  left: 0.25rem;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 0.625rem;
  background: #eee;
  box-shadow: 0px 1px 3px #ccc3;
  transition: .25s linear all;
  transform: translateX(0);
  transform-origin: left;
}

input[type='checkbox']:active::before {
  transform: scaleX(1.3);
}

input[type='checkbox']:checked::before {
  transform: translateX(1rem);
  transform-origin: right;
}

input[type='checkbox']:checked {
  background-color: #000;
}
</style>
