<template>
  <div class="my-info">
    <my-app moudleType="manageApp"></my-app>
  </div>
</template>
<script>
import myApp from './applyOverview.vue'
export default {
  components: { myApp },
  name: 'manageApp',
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
