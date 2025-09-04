<template>
  <div>
    <lineage
      :is-logical="isLogical"
      v-bind="$attrs"
      v-on="$listeners"
      ref="lineage"
      @showFullScreenDialog="showFullScreenDialog"
      :show-full-screen-btn="true"
      :defaultParams="params"
      v-if="!showDialog"
      key="tableLineage"
    ></lineage>
    <el-dialog
      :visible.sync="showDialog"
      top="66px"
      append-to-body
      custom-class="lineage-full-dialog"
      width="90%"
      :close-on-click-modal="false"
      :style="{
        left: appName !== 'DDD' ? '0px' : '200px',
      }"
    >
      <div class="dialog-container lineage-fullscreen-dialog">
        <lineage
          v-bind="$attrs"
          v-on="$listeners"
          ref="lineage"
          v-if="showDialog"
          @showFullScreenDialog="showFullScreenDialog"
          :show-full-screen-btn="false"
          :defaultParams="params"
          key="tableLineage"
        ></lineage>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import lineage from './lineage/lineage'
import HTTP from '@/http/main'

export default {
  data() {
    return {
      showDialog: false,
      params: null,
      appName: HTTP.$appName,
    }
  },
  components: { lineage },
  computed: {},
  mounted() {
    this.dataInit()
  },
  props: {
    isLogical: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    dataInit() {
      // console.log('dataInit')
    },
    getData() {
      if (this.$refs.lineage && this.$refs.lineage.getData) {
        this.$refs.lineage.getData()
      }
    },
    showFullScreenDialog(params) {
      this.params = params
      this.showDialog = true
    },
    hideDialog() {
      this.showDialog = false
    },
    // 父组件调用, 显示 tab dialog
    getQualityProblem() {
      if (this.$refs.lineage && this.$refs.lineage.handleShowProblem) {
        this.$refs.lineage.handleShowProblem()
      }
    },
  },
  watch: {},
}
</script>

<style lang="scss" scoped></style>

<style lang="scss">
.lineage-full-dialog {
  //border: 1px solid red;
  height: 100vh;
  width: 98%;

  margin: 66px auto 20px;
  position: relative;

  &.el-dialog {
    overflow: visible;
  }

  .el-dialog__header {
    position: relative;

    .el-dialog__headerbtn {
      position: absolute;
      right: 0;
      top: -46px;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background-color: #fff;
      color: #777;
      z-index: 2;
    }
  }

  .dialog-container {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;

    &.lineage-fullscreen-dialog {
      padding: 10px 0 0 20px;

      .hide-dialog-btn {
        position: absolute;
        border: 1px solid red;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        right: 0;
        top: -75px;
      }

      .consa-graphBg {
        left: 20px;
        top: 64px;
      }
    }
  }
}
</style>
