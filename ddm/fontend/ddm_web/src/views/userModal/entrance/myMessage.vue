<template>
  <div class="my-message">
    <notification
      :hideOuter="true"
      type="messageInbox"
    ></notification>
  </div>
</template>

<script>
import notification from '@/views/notification/notification.vue'
export default {
  components: {
    notification
  }
}
</script>

<style scoped lang="scss">
.my-message {
  position: absolute;
  left: 0;
  bottom: 0;
  top: 0;
  right: 0;

  /deep/ .notification-page {
    left: 0px;
  }
}
</style>
