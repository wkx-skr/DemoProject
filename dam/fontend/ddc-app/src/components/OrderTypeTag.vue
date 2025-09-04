<template>
  <el-tag
    :type="typeConfig.type"
    :color="typeConfig.color"
    size="small"
    style="background-color: #fff;"
  >
    {{ typeConfig.label }}
  </el-tag>
</template>

<script>
import { ORDER_TYPE_CONFIG } from '@/api/apply'

export default {
  name: 'OrderTypeTag',
  props: {
    type: {
      type: String,
      required: true
    }
  },
  computed: {
    typeConfig() {
      return ORDER_TYPE_CONFIG[this.type] || {
        label: this.type,
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