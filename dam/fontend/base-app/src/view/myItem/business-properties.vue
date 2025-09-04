<template>
  <div>
    <div class="item" v-for="u in data">
      <span class="title">{{ u.name }}:</span>
      <span class="value">{{ u.value }}</span>
    </div>
  </div>
</template>

<script>
export default {
  props: ['data'],
  data() {
    return {}
  },
}
</script>

<style scoped>
.item {
  display: inline-block;
  margin-right: 2em;
  min-width: 10em;
}
.title {
}
.value {
  font-weight: bold;
  color: #606266;
}
</style>
