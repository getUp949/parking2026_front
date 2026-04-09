<template>
  <div class="mobile-layout">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'MobileLayout'
}
</script>

<style scoped>
.mobile-layout {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
}
</style>
