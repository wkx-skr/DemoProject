<template>
  <el-tooltip placement="top">
    <template slot="content">
      <div v-html="content"></div>
    </template>
    <i class="el-icon-info" style="font-size:14px;color:#c1d0ff"></i>
  </el-tooltip>
</template>
<script>
export default {
  props: {
    content: String
  }
}
</script>

<style scoped>

</style>
