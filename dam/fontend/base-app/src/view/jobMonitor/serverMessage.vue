<template>
  <div>
    <datablau-detail
      :column="1"
      label-width="6em"
    >
<!--      <el-form-item label="服务ID">{{message.serverId}}</el-form-item>-->
<!--      <br>-->
      <el-form-item :label="$t('system.taskMonitoring.node')">{{message.master ? 'Scheduler': 'Node'}}</el-form-item>
      <br>
      <el-form-item :label="$t('system.taskMonitoring.address')">{{message.host}}</el-form-item>
      <br>
      <el-form-item :label="$t('system.taskMonitoring.port')">{{message.port}}</el-form-item>
      <br>
      <el-form-item :label="$t('system.taskMonitoring.memory')">{{message.heapSize}}</el-form-item>
    </datablau-detail>
  </div>
</template>
<script>
export default {
  props: {
    message: Object,
  }
}
</script>
