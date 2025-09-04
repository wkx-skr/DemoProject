<template>
  <div class="container">
    <table-demo class="demo-block"></table-demo>
    <form-demo class="demo-block"></form-demo>
    <tree-demo class="demo-block"></tree-demo>
  </div>
</template>

<script>
import tableDemo from './demo/table.vue'
import formDemo from './demo/form.vue'
import treeDemo from './demo/tree.vue'
export default {
  components: {
    tableDemo,
    formDemo,
    treeDemo,
  },
}
</script>

<style scoped>
.demo-block {
  width: 800px;
  display: inline-block;
  clear: both;
  float: left;
}
.container {
  overflow: auto;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #fff;
  padding: 20px;
}
</style>
