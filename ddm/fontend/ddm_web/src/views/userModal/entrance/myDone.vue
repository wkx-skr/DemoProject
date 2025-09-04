<template>
  <div class="my-done">
    <my-done></my-done>
  </div>
</template>

<script>
import myDone from '@/views/processControl/myDone.vue'
export default {
  components: {
    myDone
  }
}
</script>

<style scoped lang="scss">
.my-done {
  position: absolute;
  left: 0;
  bottom: 0;
  top: 0;
  right: 0;

  /deep/ .my-done-tab {
    left: 0px;
  }
}
</style>
