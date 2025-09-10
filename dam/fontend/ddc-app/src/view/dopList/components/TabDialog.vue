<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :show-close="false"
    top="15vh"
    width="900px"
    @close="handleClose"
    append-to-body
  >
<!--    @tab-click="handleTabClick"-->
    <datablau-tabs
      v-model="currentTab"
      :hasContent="true"
    >
      <el-tab-pane v-for="item in tabs" :name="item.name" :label="item.title">
        <datablau-table
          class="datablau-table-info"
          ref="detailTable"
          :data="item.data"
          height="100%"
          highlight-current-row
          :border="true"
        >
          <el-table-column
            v-for="attr in item.columns"
            v-bind="attr"
            show-overflow-tooltip
          />
        </datablau-table>
      </el-tab-pane>
    </datablau-tabs>


    <span slot="footer" class="dialog-footer">
      <datablau-button @click="handleClose">关闭</datablau-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'ApprovalDialog',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    tabs: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      currentTab: "tab1"
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible
      },
      set(value) {
        if (!value) {
          this.$emit('cancel')
        }
      },
    },
  },
  watch: {
    tabs: {
      handler(newVal) {
        if (newVal) {
          this.currentTab = this.tabs && this.tabs.length>0 ? this.tabs[0].name : 'tab1' 
        }
      },
      immediate: true,
    },
  },
  methods: {
    handleConfirm() {

    },
    handleClose() {
      this.$emit('cancel')
    },
  },
}
</script>

<style scoped lang="scss">
::v-deep .el-dialog {
  .el-dialog__header {
    display: none !important;
  }

  .el-dialog__body {
    padding-top: 12px;
    max-height: 75vh;
    min-height: 50vh;
    overflow-y: auto;
  }

  .el-dialog__footer {
    text-align: right;
  }
}
</style>
