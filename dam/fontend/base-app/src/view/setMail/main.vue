<script>
import setMail from "@/components/systemManagement/systemSetting/setMail.vue"
import EmailTemplate from "@/components/systemManagement/systemSetting/emailTemplate.vue";

export default {
  components: {
    EmailTemplate,
    setMail,
  }
}
</script>

<template>
  <div class="page">
    <email-template></email-template>
    <datablau-page-title
      name="邮件设置"
    ></datablau-page-title>
    <set-mail></set-mail>
  </div>
</template>

<style scoped lang="scss">
 .page {
   height: 100%;
   background-color: #FFF;
 }
</style>
