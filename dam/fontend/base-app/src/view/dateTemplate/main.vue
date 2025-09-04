<script>
import dateTemplate from "@/components/systemManagement/scheduleTemplate/list.vue"
export default {
  components: {
    dateTemplate,
  }
}
</script>

<template>
  <div class="page">
    <datablau-page-title
      :name="$t('system.systemSetting.timeTemp')"
    ></datablau-page-title>
    <date-template></date-template>
  </div>
</template>

<style scoped lang="scss">
 .page {
   height: 100%;
   background-color: #FFF;
 }
</style>
