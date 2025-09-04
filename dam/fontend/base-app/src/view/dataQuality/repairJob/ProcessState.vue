<template>
  <div class="process-part">
    <span :class="{ green: status === 'NOT_START' }">
      {{ $t('quality.page.dataQualityRepairJob.taskStatus.NOT_START') }}
    </span>
    <i class="fa fa-long-arrow-right"></i>
    <span v-if="!$isShort">
      <span :class="{ green: status === 'ACCEPT' }">
        {{ $t('quality.page.dataQualityRepairJob.taskStatus.ACCEPT') }}
      </span>
      <i class="fa fa-long-arrow-right"></i>
      <span :class="{ green: status === 'CONFIRM' }">
        {{ $t('quality.page.dataQualityRepairJob.taskStatus.CONFIRM') }}
      </span>
      <i class="fa fa-long-arrow-right"></i>
    </span>
    <!-- <span :class="{green: status=== 'SALVE'}">生成解决方案</span>
    <i class="fa fa-long-arrow-right"></i> -->
    <span :class="{ green: status === 'FIXED' }">
      {{ $t('quality.page.dataQualityRepairJob.taskStatus.FIXED') }}
    </span>
    <i class="fa fa-long-arrow-right"></i>
    <span :class="{ green: status === 'CLOSED' }">
      {{ $t('quality.page.dataQualityRepairJob.taskStatus.CLOSED') }}
    </span>
  </div>
</template>

<script>
export default {
  props: {
    status: String,
  },
}
</script>

<style scoped>
* {
  color: #606266;
}
.fa-long-arrow-right {
  margin: 0 0.5em;
}
.green {
  color: #479eff;
  font-weight: bold;
}
.process-part {
  width: 500px;
}
</style>
