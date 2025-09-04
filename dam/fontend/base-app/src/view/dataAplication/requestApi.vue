<template>
  <div class="my-info">
    <my-app modeType="api"></my-app>
  </div>
</template>
<script>
import myApp from './myApi/myApp.vue'
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
  position: relative;
  width: 100%;
  height: 100%;
  background-color: white;
}
</style>
