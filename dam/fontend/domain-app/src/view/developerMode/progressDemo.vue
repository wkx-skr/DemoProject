<template>
  <div>
    <div style="width: 500px">
      <el-card>
        <datablau-progress
          :timePrediction="10"
          ref="progressComponent"
        ></datablau-progress>
        <el-button type="text" @click="start">开始</el-button>
        <el-button type="text" @click="finish">成功完成</el-button>
        <el-button type="text" @click="failure">失败</el-button>
        <el-button @click="callAlert">弹框</el-button>
      </el-card>
    </div>

    <el-card>
      <h5>组件名称</h5>
      <li>datablau-progress</li>
      <br />
      <h5>属性</h5>
      <ul>
        <li>timePrediction 指定预测的运行时间，单位为秒</li>
        <li>autoStart 指定是否自动开始，默认为false</li>
      </ul>
      <br />
      <h5>方法</h5>
      <ul>
        <li>start 开始</li>
        <li>finish 完成</li>
        <li>failure 失败</li>
      </ul>
    </el-card>
  </div>
</template>

<script>
export default {
  methods: {
    finish() {
      this.$refs.progressComponent.finish()
    },
    failure() {
      this.$refs.progressComponent.failure()
    },
    start() {
      this.$refs.progressComponent.start()
    },
    callAlert() {
      this.$bus.$emit('showUploadProgress', {
        name: '导入数据标准',
      })
    },
  },
}
</script>

<style scoped></style>
