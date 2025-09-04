<template>
  <div>
    <div v-show="false">
      <choose-theme></choose-theme>
    </div>
  </div>
</template>

<script>
import chooseTheme from '@/components/common/themePick/chooseTheme.vue'
export default {
  name: 'globalComponent',
  components: {
    chooseTheme,
  },
}
</script>

<style scoped></style>
