<template>
    <div class="databaseManagement">
        <datablau-tabs class="databaseManagement-tabs"  v-model="activeName" @tab-click="handleClick">
          <el-tab-pane label="数据库" name="dataSourceDdm" >
              <databaseMain  ref="databaseMain" ></databaseMain>
              <div style="background: #fff;" v-show="this.$route.query.metaModelId">
                <iframe-container id="dataCatalogDdmModeId"   style="z-index:9;top: 30px;"   ref="iframeContainer" key="damIframeContainer"></iframe-container>
                <div class="iframe-dialog-base-mask v-modal" v-if="showDialogMask" @click="dialogMaskClick"></div>
              </div>
            </el-tab-pane>
          <el-tab-pane label="数据集" name="dataCatalogDdm"  >
          </el-tab-pane>
          <el-tab-pane label="应用系统" name="modelCategoryDdm" >
          </el-tab-pane>
        </datablau-tabs>
        <div style="position: absolute;left: -20px;right: 0;bottom: 0;top: 0;"  v-show="activeName !== 'dataSourceDdm'">
          <iframe-container style="z-index:4;top: 31px;"  ref="iframeContainer" key="damIframeContainer"></iframe-container>
        </div>
        <div class="iframe-dialog-base-mask v-modal" v-if="showDialogMask" @click="dialogMaskClick"></div>
    </div>
  </template>

<script>
import iframeContainer from '@/components/common/iframeContainer/iframeContainer.vue'
import databaseMain from './databaseMain.vue'
export default {
  components: {
    iframeContainer,
    databaseMain
  },
  beforeCreate () {
  },
  mounted () {
    this.$router.push({
      query: {
        type: 'dataSourceDdm'
      }
    })
    this.activeName = 'dataSourceDdm'
    this.$bus.$on('iframe-dialog-visible-change', show => {
      this.showDialogMask = show
    })
  },
  beforeDestroy () {
    this.$bus.$off('iframe-dialog-visible-change')
  },
  data () {
    return {
      activeName: 'dataSourceDdm',
      showDialogMask: false,
      auth: this.$store.state.$auth,
      goMetaJump: false
    }
  },
  methods: {
    goToMeta (msg) {
      this.$router.push({
        query: {
          type: 'dataCatalogDdm',
          metaModelId: msg
        }
      })
    },
    goToMetaJump () {
      // this.activeName = 'dataCatalogDdm'
      // this.goMetaJump = true
    },
    handleClick (type) {
      if (this.activeName === 'dataSourceDdm') {
        this.$refs.databaseMain.getDataSource()
        this.goMetaJump = false
      }
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
.databaseManagement{
    position: absolute;
    top: 0;
    left: 0px;
    right: 0px;
    bottom: 0;
    padding: 0 20px;
}
.iframe-dialog-base-mask {
  z-index: 3;
  // opacity: .0;
}
  /deep/.el-tabs__header{
    z-index: 11;
  }
  </style>
<style lang="scss">
.databaseManagement-tabs{
    .el-tabs__content{
        position: absolute;
        top: 0;
        left: 0px;
        right: 0px;
        bottom: 0;
        // margin: 0 20px;
    }
}
</style>
