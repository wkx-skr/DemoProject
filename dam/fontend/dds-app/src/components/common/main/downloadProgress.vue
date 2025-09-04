<template>
  <div>
    <el-dialog
      :visible.sync="showDownloadProgress"
      width="500px"
      title="下载列表"
      :close-on-click-modal="true"
      :modal-append-to-body="true"
      :append-to-body="true"
    >
      <div
        class="download-item"
        v-for="item in downloadComponentsArr"
        :key="item.id"
      >
        <div class="pro-container" v-if="!item.hidden">
          <div style="text-align: right; margin-right: 1em; margin-top: 0.5em">
            <span style="display: inline-block; margin-right: 20px">
              {{ item.fileName || '未命名' }}
            </span>
            <span v-if="item.statu === 'finish'">下载完成!</span>
            <span v-if="item.statu === 'start'">正在下载...</span>
            <span v-if="item.statu === 'fault'">下载失败</span>
          </div>
          <datablau-progress
            :ref="item.id"
            :timePrediction="10"
            :progress="item.progress"
            :showRealResult="true"
          ></datablau-progress>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // showDownloadProgress: true,
      showDownloadProgress: false,
      downloadComponentsArr: null,
    }
  },
  components: {},
  computed: {},
  beforeMount() {
    this.downloadComponentsArr = this.$downloadComponentsArr
  },
  mounted() {
    this.$bus.$on('showDownlodProgress', this.showDownlodProgress)
    this.$bus.$on('hiddenDownlodProgress', this.hiddenDownlodProgress)
  },
  beforeDestroy() {
    this.$bus.$off('showDownlodProgress')
    this.$bus.$off('hiddenDownlodProgress')
  },
  methods: {
    showDownlodProgress() {
      this.showDownloadProgress = true
    },
    hiddenDownlodProgress() {
      const result = this.$downloadComponentsArr.some(item => {
        return item.statu === 'start'
      })
      this.showDownloadProgress = !!result
    },
  },
  watch: {
    downloadComponentsArr: {
      deep: true,
      handler: function (newVal) {
        // console.log(newVal, 'newVal')
        const bool = newVal.some(item => !item.hidden)
        setTimeout(() => {
          if (bool && this.showDownloadProgress) {
            this.showDownlodProgress()
          } else {
            this.hiddenDownlodProgress()
          }
        }, 500)
      },
    },
  },
}
</script>

<style lang="scss" scoped></style>
