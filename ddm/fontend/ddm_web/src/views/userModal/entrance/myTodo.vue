<template>
  <div class="my-to-do">
    <my-todo></my-todo>
  </div>
</template>

<script>
import myTodo from '@/views/processControl/myTodo.vue'
export default {
  components: {
    myTodo
  }
}
</script>

<style scoped lang="scss">
.my-to-do {
  position: absolute;
  left: 0;
  bottom: 0;
  top: 0;
  right: 0;

  /deep/ .to-do-tab {
    left: 0px;
  }
}
</style>
