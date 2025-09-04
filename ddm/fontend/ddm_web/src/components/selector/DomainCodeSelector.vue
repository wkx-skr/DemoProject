<template>
  <div>
    <datablau-dialog
      width="720px"
      height="400px"
      custom-class="domain-code-selector"
      :title="$store.state.$v.doaminSelector.title2"
      :visible.sync="standardCodeDialogVisible"
      v-if="standardCodeDialogVisible"
      append-to-body
      :key="key"
      :close-on-click-modal="false"
      :blackTheme="$route.path.indexOf('sql_editor') !== -1 ? true: false"
    >
      <datablau-input :themeBlack="$route.path.indexOf('sql_editor') !== -1 ? true: false" style="width:240px" size="mini" v-model="codeKeyword" placeholder="搜索" clearable suffix-icon="el-icon-search"></datablau-input>
      <div class="tree-box">
        <datablau-tree
          node-key="code"
          default-expand-all
          ref="tree"
          :current-node-key="currentNodeKey"
          :data="codeTreeData"
          :props="codeDefaultProps"
          :filter-node-method="codeFilterNode"
          :render-content="codeRenderContent"
          @node-click="codeHandleNodeClick"
          class="grey-tree"
          :themeBlack="$route.path.indexOf('sql_editor') !== -1 ? true: false"
        >
        </datablau-tree>
      </div>
      <div slot="footer">
         <datablau-button
          @click="standardCodeDialogVisible=false,currentNodeKey=''"
          :themeBlack="$route.path.indexOf('sql_editor') !== -1 ? true: false"
          type="secondary"
          size="mini">取消</datablau-button>
          <datablau-button
            :disabled="!selectBtnEnable"
            :themeBlack="$route.path.indexOf('sql_editor') !== -1 ? true: false"
            @click="codeSelected" size="mini" type="important" style="margin-top:10px;">
            <span>{{$store.state.$v.dataEntity.ok}}</span>
          </datablau-button>
      </div>
    </datablau-dialog>
  </div>
</template>

<script>
import string from '@/resource/utils/string'
export default {
  data () {
    return {
      currentNodeKey: '',
      standardCodeDialogVisible: false,
      codeTreeData: [],
      codeKeyword: '',
      codeDefaultProps: {
        label: 'name',
        id: 'code'
      },
      selectedCode: null,
      selectBtnEnable: false,
      key: 0
    }
  },
  mounted () {
    this.getStandardCodes()
    this.currentNodeKey = ''
  },
  methods: {
    getStandardCodes () {
      this.codeTreeData = this.$globalData.domainCodes?.treeData
    },
    openDialog (id) {
      this.currentNodeKey = id
      this.key++
      this.codeKeyword = ''
      this.standardCodeDialogVisible = true
      this.getStandardCodes()
    },
    closeDialog () {
      this.standardCodeDialogVisible = false
    },
    codeFilterNode (value, data) {
      if (!value) return true
      return string.matchKeyword(data, value, 'name', 'code')
    },
    codeHandleNodeClick (data) {
      this.selectedCode = data
      this.selectBtnEnable = !!data.code
    },
    codeRenderContent (h, { node, data, store }) {
      if (data.code) {
        return (
          <span style="flex: 1; display: flex;align-items: center;" data-code={data.code}>
            <span class="tree-icon domain-code"></span>
            <span>{node.label}</span>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <span>{data.code}</span>
          </span>
        )
      } else {
        return (
          <span style="flex: 1; display: flex;align-items: center;">
            <span class={node.expanded ? 'iconfont icon-openfile' : 'iconfont icon-file'}></span>
            <span>{node.label}</span>
          </span>
        )
      }
    },
    codeSelected () {
      this.currentNodeKey = ''
      this.$emit('selected', _.cloneDeep(this.selectedCode))
      this.selectedCode = null
    }
  },
  watch: {
    codeKeyword (val) {
      this.$refs.tree.filter(val)
    }
  }
}
</script>

<style scoped>

</style>
<style lang="scss">
.domain-code-selector {
  .el-dialog__header {
      margin-bottom: 10px;
      padding-top: 0;
      padding-bottom: 0;
      height: 50px;
      line-height: 50px;
      border-bottom: 1px solid #ddd;
    }
  .el-dialog__headerbtn {
    top: 10px;
    right: 10px;
  }
}
</style>
