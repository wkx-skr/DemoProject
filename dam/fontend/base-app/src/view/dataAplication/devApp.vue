<template>
  <div class="my-info">
    <my-app componentType="devApp"></my-app>
  </div>
</template>
<script>
import myApp from './applyOverview.vue'
export default {
  components: { myApp },
  data() {
    return {}
  },
  methods: {},
}
</script>
<style scoped lang="scss">
.my-info {
  width: 100%;
  height: 100%;
  background-color: white;
}
</style>
