<template>
  <div class="user-workbench-apply">
    <my-apply></my-apply>
  </div>

</template>

<script>
import myApply from '@/views/processControl/myApply.vue'
export default {
  components: {
    myApply
  }
}
</script>

<style scoped lang="scss">
.user-workbench-apply /deep/ .my-apply-tab {
  left: 0px;
}
</style>
