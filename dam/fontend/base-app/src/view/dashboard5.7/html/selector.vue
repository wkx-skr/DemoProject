<template>
  <div>
    <el-dialog
      :title="$t('common.dashboard.H5Editor')"
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
