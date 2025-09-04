<template>
    <div class="processManagement">
        <datablau-tabs class="processManagement-tabs"  v-model="activeName" @tab-click="handleClick">
            <el-tab-pane label="流程中心" name="processCenter">

            </el-tab-pane>
            <el-tab-pane  label="流程监控" name="allApply">

            </el-tab-pane>
            <el-tab-pane  label="监听器" name="monitor">

            </el-tab-pane>
        </datablau-tabs>
        <div style="position: absolute;left: -20px;right: 0;bottom: 0;top: 0;">
          <iframe-container style="z-index:4;top: 31px;"  ref="iframeContainer" key="damIframeContainer"></iframe-container>
        </div>
          <div class="iframe-dialog-base-mask v-modal" v-if="showDialogMask" @click="dialogMaskClick"></div>
    </div>
  </template>

<script>
import iframeContainer from '@/components/common/iframeContainer/iframeContainer.vue'
export default {
  components: {
    iframeContainer
  },
  beforeCreate () {
  },
  mounted () {
    this.$router.push({
      query: {
        type: 'processCenter'
      }
    })
    this.activeName = 'processCenter'
    this.$bus.$on('iframe-dialog-visible-change', show => {
      this.showDialogMask = show
    })
  },
  beforeDestroy () {
    this.$bus.$off('iframe-dialog-visible-change')
  },
  data () {
    return {
      activeName: 'processCenter',
      showDialogMask: false,
      auth: this.$store.state.$auth
    }
  },
  methods: {
    handleClick (type) {
      this.$router.push({
        query: {
          type: this.activeName
        }
      })
    },
    dialogMaskClick () {
      this.$refs.iframeContainer.dialogMaskClick()
    }
  }
}
</script>
<style lang="scss" scoped>
.processManagement{
    position: absolute;
    top: 0;
    left: 20px;
    right: 20px;
    bottom: 0;
}
.iframe-dialog-base-mask {
  z-index: 3;
  // opacity: 0;
}
/deep/.el-tabs__header{
  z-index: 11;
}
  </style>
<style lang="scss">
.processManagement-tabs{
    .el-tabs__content{
        position: absolute;
        top: 0;
        left: 0px;
        right: 0px;
        bottom: 0;
    }
}
</style>
