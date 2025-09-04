<template>
    <div class="userManagement">
      <datablau-tabs class="userManagement-tabs"  v-model="activeName" @tab-click="handleClick">
          <el-tab-pane  label="用户管理" name="userDdm">
          </el-tab-pane>
          <el-tab-pane  label="机构管理" name="organizationManageDdm">
          </el-tab-pane>
          <el-tab-pane   label="角色管理" name="groupDdm">
          </el-tab-pane>
          <el-tab-pane label="租户管理" name="tenantManage" >
              <tenantManage></tenantManage>
            </el-tab-pane>
      </datablau-tabs>
      <div style="position: absolute;left: -20px;right: 0;bottom: 0;top: 0;" v-show="activeName !== 'tenantManage'">
        <iframe-container style="z-index:4;top: 31px;"  ref="iframeContainer" key="damIframeContainer"></iframe-container>
      </div>
      <div class="iframe-dialog-base-mask v-modal" v-if="showDialogMask" @click="dialogMaskClick"></div>
    </div>
  </template>
<script>
import iframeContainer from '@/components/common/iframeContainer/iframeContainer.vue'
import tenantManage from './tenantManage.vue'

export default {
  components: {
    iframeContainer,
    tenantManage
  },
  beforeCreate () {
    this.$bus.$off('iframe-dialog-visible-change')
  },
  mounted () {
    this.$router.push({
      query: {
        type: 'userDdm'
      }
    })
    this.activeName = 'userDdm'

    this.$bus.$on('iframe-dialog-visible-change', show => {
      this.showDialogMask = show
    })
  },
  beforeDestroy () {
    this.$bus.$off('iframe-dialog-visible-change')
  },
  data () {
    return {
      activeName: 'userDdm',
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
.userManagement{
    position: absolute;
    top: 0;
    left: 20px;
    right: 20px;
    bottom: 0;
    z-index: 4;
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
.userManagement-tabs{
    .el-tabs__content{
        position: absolute;
        top: 0;
        left: 0px;
        right: 0px;
        bottom: 0;
    }
}
</style>
