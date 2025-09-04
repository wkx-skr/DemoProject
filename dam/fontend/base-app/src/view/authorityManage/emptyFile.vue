<template>
  <div class="data-show-page">
    <div class="center-box">
      <div class="message-box"></div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {}
  },
  components: {},
  computed: {},
  mounted() {
    this.dataInit()
  },
  methods: {
    dataInit() {
      const query = this.$route.query
      if (query) {
        this.msgType = query.msgType
      }
    },
  },
  watch: {},
}
</script>

<style lang="scss">
.data-show-page {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #f4f4f4;

  .center-box {
    margin: 0 auto;
    position: relative;
    max-width: 1240px;
    width: 100%;
    margin: 0 auto;
    height: 100%;
    .message-box {
      position: absolute;
      top: 20px;
      bottom: 20px;
      left: 0;
      right: 0;
      background-color: #fff;
      font-size: 18px;
      text-align: center;
    }
  }
}
</style>
