<template>
  <div class="container">
    <data-source-tab></data-source-tab>
  </div>
</template>

<script>
import dataSourceTab from './dataSourceTab.vue'
export default {
  components: {
    dataSourceTab,
  },
}
</script>

<style scoped>
.container {
  background: #fff;
  position: absolute;
  top: 10px;
  left: 20px;
  right: 20px;
  bottom: 10px;
}
</style>
