<template>
  <el-tag
    :type="statusConfig.type"
    :color="statusConfig.color"
    size="small"
    style="background-color: #fff;"
  >
    {{ statusConfig.label }}
  </el-tag>
</template>

<script>
import { BATCH_STATUS_CONFIG } from '@/api/apply'

export default {
  name: 'StatusTag',
  props: {
    status: {
      type: String,
      required: true
    }
  },
  computed: {
    statusConfig() {
      return BATCH_STATUS_CONFIG[this.status] || {
        label: this.status,
        color: '#909399',
        type: 'info'
      }
    }
  }
}
</script>

<style scoped lang="scss">
.el-tag {
  border: none;
  font-weight: 500;
}
</style> 