<!-- 个人工作台--我的申请 -->
<template>
  <div class="mayApply">
    <myApply assets="assets"></myApply>
  </div>
</template>

<script>
import myApply from '@/view/processControl/myApply.vue'
export default {
  components: { myApply },
  name: 'assetsMyApply',
  data() {
    return {
      activeName: 'agency',
    }
  },
}
</script>

<style scoped lang="scss">
.mayApply {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
}
</style>
