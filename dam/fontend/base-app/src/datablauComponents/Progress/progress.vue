<template>
  <div>
    <el-progress
      :show-text="false"
      :key="key"
      :percentage="percentage"
      :status="status"
    ></el-progress>
  </div>
</template>

<script>
export default {
  name: 'Progress',
  props: {
    autoStart: {
      type: Boolean,
      default: false,
    },
    timePrediction: {
      type: Number,
      default: 3,
    },
    showRealResult: {
      type: Boolean,
      default: false,
    },
    progress: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      key: 0,
      status: null,
      percentage: 0,
      headTail: 90,
      headInterval: null,
    }
  },
  mounted() {
    if (this.autoStart) {
      this.initHead()
    }
  },
  beforeDestroy() {
    clearInterval(this.headInterval)
  },
  methods: {
    format() {},
    initHead() {
      const interval = 50
      this.headInterval = setInterval(() => {
        if (this.percentage < this.headTail) {
          const percentage =
            this.percentage +
            this.headTail / this.timePrediction / (1000 / interval)
          this.percentage = percentage.toFixed(1) - 0
        } else {
          clearInterval(this.headInterval)
        }
      }, interval)
    },
    start() {
      this.key++
      this.status = null
      clearInterval(this.headInterval)
      this.percentage = 0
      this.initHead()
    },
    finish() {
      this.status = 'success'
      clearInterval(this.headInterval)
      this.percentage = 100
    },
    failure() {
      this.status = 'exception'
      clearInterval(this.headInterval)
    },
    getComponent() {
      return this
    },
    setProgressValue(percent) {
      this.percentage = percent
    },
  },
  watch: {
    progress: {
      immediate: true,
      handler: function (newVal, oldVal) {
        if (this.showRealResult) {
          this.percentage = newVal
        }
      },
    },
  },
}
</script>

<style scoped></style>
