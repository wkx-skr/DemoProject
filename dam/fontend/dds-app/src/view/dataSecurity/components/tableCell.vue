<template>
  <div class="table-cell">
    <i :class="['iconfont', icon]"></i>
    <span>{{ name }}</span>
  </div>
</template>

<script>
export default {
  props: {
    name: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: 'icon-menu-blsx',
    },
  },
  data() {
    return {}
  },
  created() {},
  mounted() {},
  methods: {},
}
</script>

<style scoped lang="scss">
.table-cell {
  height: 24px;
  line-height: 24px;
  i {
    font-size: 14px;
    margin-right: 4px;
  }
  span {
    display: inline-block;
    height: 24px;
    line-height: 24px;
  }
}
</style>
