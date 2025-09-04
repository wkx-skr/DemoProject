<template>
  <div>
    <el-dialog
      :title="$t('assetCount.comEditor')"
      :visible.sync="visible"
    ></el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      visible: false,
    }
  },
}
</script>

<style scoped></style>
