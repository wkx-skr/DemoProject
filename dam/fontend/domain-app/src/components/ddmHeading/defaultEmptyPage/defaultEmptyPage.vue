<template>
  <div class="empty-page" v-loading="loading"></div>
</template>

<script>
export default {
  name: 'defaultEmptyPage',
  data() {
    return {
      loading: true,
    }
  },
  components: {},
  mounted() {
    this.dataInit()
  },
  methods: {
    dataInit() {},
  },
  watch: {},
}
</script>

<style lang="scss" scoped>
.empty-page {
  background-color: #fff;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
}
</style>
