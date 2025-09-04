<template>
  <div class="my-info">
    <my-app moudleType="manageApi"></my-app>
  </div>
</template>
<script>
import myApp from './apiOverview.vue'
export default {
  components: { myApp },
  name: 'manageApi',
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
