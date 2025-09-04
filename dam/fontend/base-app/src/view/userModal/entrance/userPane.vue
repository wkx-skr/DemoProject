<template>
  <user-modal nav-from-entrance="myApply"></user-modal>
</template>

<script>
import userModal from '@/view/userModal/main.vue'
export default {
  components: {
    userModal,
  },
  mounted() {
    alert(1111)
  },
}
</script>

<style scoped></style>
