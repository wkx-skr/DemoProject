<template>
  <div>
    <datablau-dialog
      custom-class="domain-selector"
      :title="$store.state.$v.doaminSelector.title"
      :visible.sync="visible"
      width="960px"
      height="570px"
      :close-on-click-modal="false"
      :modal-append-to-body="false"
      :key="key"
      :blackTheme="$route.path.indexOf('sql_editor') !== -1 ? true: false"
    >
      <div
        class="tree-box"
        style="margin-top:5px;height:400px;position: relative"
        v-loading="treeLoading">
        <div class="grey-tree" >
          <div class="tree-search-box" style="width:180px">
            <datablau-input
              size="small"
              suffix-icon="el-icon-search"
              :placeholder="$store.state.$v.doaminSelector.pl"
              v-model="keyword"
              style="width:180px"
              :themeBlack="$route.path.indexOf('sql_editor') !== -1 ? true: false"
              clearable
            ></datablau-input>
          </div>
          <datablau-tree
            :treeWidth="197"
            class="folder-tree-wrapper"
            :data="treeData"
            ref="mainTree"
            :props="defaultProps"
            :data-icon-function="dataIconFunction"
            node-key="foldId"
            :key="treeKey"
            :default-expanded-keys="expandedKeys"
            :default-expand-all="defaultExpandAll"
            :expand-on-click-node="false"
            @node-click="handleItemClicked"
            :draggable="true"
            @node-drag-start="handleDragStart"
            :allow-drag="allowDrag"
            :allow-drop="()=>false"
            :show-checkbox="(false && hasAccess && !(state==='C' && userWorkflow))"
            :highlight-current="true"
            auto-expand-parent
            :check-strictly="false"
            show-overflow-tooltip
            :filter-node-method="filterNode"
            :themeBlack="$route.path.indexOf('sql_editor') !== -1 ? true: false"
          ></datablau-tree>
        </div>
        <!-- <div class="resize-column-middle"></div> -->
        <div class="code-detail-wrapper">
          <folder-detail
            :draggable="draggable"
            :domainHasComment="domainHasComment"
            ref="folderDetail"
            :data="nowFolder"
            :state="state"
            :typeIds="typeIds"
            :selectedType="selectedType"
            @domainSelected="domainSelected"
            @visibleChange="visibleChange"
          ></folder-detail>
        </div>
        <div class="inherit-type" :style="{background: $route.path.indexOf('sql_editor') !== -1 ? 'none': '#f0f0f0'}">
          <h2 :style="{color: $route.path.indexOf('sql_editor') !== -1 ? '#bbb': '#333'}">{{$store.state.$v.doaminSelector.disc}}</h2>
          <el-checkbox-group v-model="selectedType" :class="{'black-el-checkbox-group':$route.path.indexOf('sql_editor') !== -1}" >
            <el-checkbox :disabled="item.disabled" v-for="item in inheritType.filter(item => item.value !== 'enName')" :label="item.value" :key="item.value">{{item.label}}</el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
      <div slot="footer">
        <div class="page-wrapper">
          <datablau-pagination
            v-if="$refs.folderDetail"
            @size-change="$refs.folderDetail.handleSizeChange"
            @current-change="$refs.folderDetail.handleCurrentChange"
            :current-page.sync="$refs.folderDetail.currentPage"
            :page-sizes="[20, 50, 100]"
            :page-size="$refs.folderDetail.pageSize"
            :pager-count="5"
            layout="total, sizes, prev, pager, next, jumper"
            :total="$refs.folderDetail.total"
            :themeBlack="$route.path.indexOf('sql_editor') !== -1 ? true: false"
          ></datablau-pagination>
        </div>
        <datablau-button
          @click="cancelDomainSelector"
          type="secondary"
          :themeBlack="$route.path.indexOf('sql_editor') !== -1 ? true: false"
          size="mini">取消</datablau-button>
         <datablau-button
          v-if="!draggable"
           @click="handleSelect"
           :themeBlack="$route.path.indexOf('sql_editor') !== -1 ? true: false"
           size="mini" :disabled="!enableSelect" type="important">{{$store.state.$v.udp.Yes}}</datablau-button>
      </div>
    </datablau-dialog>
  </div>
</template>
<script>
import sort from '@/resource/utils/sort'
import string from '@/resource/utils/string'
import _ from 'lodash'
import FolderDetail from './FolderDetail.vue'
import ResizeHorizontal from '@/components/common/ResizeHorizontal'
import $ from 'jquery'
import {mapState} from 'vuex'
export default {
  data () {
    return {
      visible: false,
      keyword: '',
      treeLoading: false,
      keywordSetTimeout: null,
      treeBox: undefined,
      defaultProps: {
        children: 'nodes',
        label: 'name',
        id: 'foldId'
      },
      expandedKeys: [],
      state: 'A',
      defaultExpandAll: false,
      treeData: [],
      enableSelect: false,
      nowDomain: null,
      key: 0,
      inheritType: [{
        label: this.$store.state.$v.udp.dataType,
        value: 'dataType',
        disabled: this.limitedDsApply ? this.limitedDsApplyConfig.rColDt : false
      }, {
        label: this.$store.state.$v.doaminSelector.enName,
        value: 'enName',
        disabled: this.limitedDsApply
      }, {
        label: this.$store.state.$v.erGraph.logicalName,
        value: 'chName',
        disabled: this.limitedDsApply ? this.limitedDsApplyConfig.rColChName : false
      }, {
        label: this.$store.state.$v.doaminSelector.enName2,
        value: 'abbrivation',
        disabled: this.limitedDsApply ? this.limitedDsApplyConfig.rColName : false
      }, {
        label: this.$store.state.$v.doaminSelector.definition,
        value: 'description'
      }, {
        label: this.$store.state.$v.doaminSelector.notNull,
        value: 'notNull'
      }],
      selectedType: ['dataType'],
      treeKey: 0,
      domainHasComment: new Map(),
      nowFolder: null,
      typeIds: 1,
      showShareFile: false,
      handleMiddle: false
    }
  },
  props: {
    limitedDsApply: {
      type: Boolean,
      default: false
    },
    limitedDsApplyConfig: {
      required: true
    },
    draggable: {
      type: Boolean,
      default: false
    }
  },
  mounted () {
    this.processSelectedType()
    this.innerLoadStandard()
    this.$bus.$on('callDomainSelector', () => {
      this.processSelectedType()
      this.visible = true
    })
  },
  beforeDestroy () {
    clearTimeout(this.timeout)
    this.$bus.$off('callDomainSelector')
  },
  components: {
    FolderDetail
  },
  computed: {
    ...mapState(['domainSelectedType'])
  },
  methods: {
    cancelDomainSelector() {
      this.selectedType = this.domainSelectedType
      this.visible = false
    },
    handleDragStart (node, event) {
      this.visible = false
      let obj = {
        foldId: node.data.foldId,
        inheritType: _.cloneDeep(this.selectedType)
      }
      // 在目标表ondrop 通过dataTransfer接收当前拖拽的目录id
      event.dataTransfer.setData('domain-list', JSON.stringify(obj))
    },
    allowDrag (draggingNode) {
      // 为了拖拽时不展示子节点
      draggingNode.expanded = false
      return draggingNode.data.foldId !== 1
    },
    visibleChange (bool) {
      this.visible = bool
    },
    initHorizontalResize () {
      let r = new ResizeHorizontal($('.grey-tree'), $('.code-detail-wrapper'), $('.resize-column-middle'), $('.tree-box'))
    },
    domainSelected (domain) {
      this.nowDomain = domain
      this.enableSelect = true
    },
    innerLoadStandard () {
      return new Promise(resolve => {
        this.treeLoading = true
        const url = `${this.$url}/service/domains/tree/?onlyFolder=true&categoryId=${this.typeIds}`
        this.$http.get(url).then(res => {
          this.treeLoading = false
          sort.sort(res.data.nodes, 'name')
          this.options = [res.data]
          this.treeData = [res.data]
          this.expandedKeys = [res.data.foldId]
          if (this.nowFolder && !this.nowFolder.data) {
            this.$nextTick(() => {
              if (this.$refs.mainTree) {
                this.$refs.mainTree.setCurrentKey(this.nowFolder.foldId)
              }
            })
          } else {
            this.$nextTick(() => {
              if (this.$refs.mainTree) {
                this.$refs.mainTree.setCurrentKey(res.data.foldId)
              }
            })
            this.nowFolder = {
              data: res.data
            }
          }
          this.$nextTick(() => {
            if (this.$refs.mainTree) {
              this.$refs.folderDetail.refreshData()
            }
          })
          resolve()
        }).catch(e => {
          this.treeLoading = false
          this.$showFailure(e)
        })
      })
    },
    getCurrentPathIds (foldObj, isFirst) {
      isFirst && this.currentPathIds.unshift(foldObj.foldId)
      if (foldObj.parentId) {
        this.currentPathIds.unshift(foldObj.parentId)
        this.getParentFoldr(this.options, foldObj.parentId)
      }
    },
    getParentFoldr (list, pId) {
      list.forEach(e => {
        if (e.foldId === pId) {
          this.getCurrentPathIds(e)
        } else {
          if (e.nodes && e.nodes.length) {
            this.getParentFoldr(e.nodes, pId)
          }
        }
      })
    },
    handleItemClicked (data, node) {
      this.nowFolder = data
      this.currentPathIds = []
      if (!this.nowFolder.parentId) {
        this.currentPathIds = this.options[0].foldId
      } else {
        this.getCurrentPathIds(this.nowFolder, true)
      }
      this.$nextTick(() => {
        this.$refs.folderDetail.resetQuery()
      })
      if (data.parentId === 0) {
        this.showShareFile = false
      } else {
        this.showShareFile = true
      }
    },
    openDialog () {
      // this.key++
      setTimeout(() => {
        this.keyword = ''
        this.processSelectedType()
        this.visible = true
        if (!this.handleMiddle) {
          this.$nextTick(() => {
            this.initHorizontalResize()
            this.handleMiddle = true
          })
        }
        this.$nextTick(() => {
          this.$refs.folderDetail.keyword = ''
        })
      }, 400)
    },
    closeDialog () {
      this.visible = false
    },
    filterNode (value, data, node) {
      if (!value) return true
      let current = node
      do {
        if (string.matchKeyword(current.data, value, 'name', 'domainCode')) {
          return true
        }
        current = current.parent
      } while (current && current.data.name)
      return false
    },
    modifyArrKey (obj) {
      const self = this
      if (obj.nodes != null) {
        sort.sortConsiderChineseNumber(obj.nodes)
        obj.nodes.forEach(item => {
          self.modifyArrKey(item)
        })
      }
      if (obj.domains != null && obj.domains.length > 0) {
        sort.sortConsiderChineseNumber(obj.domains)
        obj.domains.forEach(item => {
          if (obj.nodes == null) {
            obj.nodes = []
          }
          obj.nodes.push(item)
        })
      }
    },
    dataIconFunction (data, node) {
      if(node.expanded) {
        return 'iconfont icon-openfile'
      } else {
        return 'iconfont icon-file'
      }
    },
    renderContent (h, { node, data, store }) {
      if (data.code) {
        let className = 'tree-icon domain'
        if (data.updatingId) {
          className += ' is-updating'
        }
        let labelClassName = ''
        if (this.domainHasComment.has(data.id)) {
          labelClassName = 'light-red'
        }
        return (
          <span style="width: 88%;position:relative;" data-code={data.code}>
            <span class={className}></span>
            <span class={labelClassName}>{node.label.length > 8 ? node.label.substring(0, 8) + '...' : node.label}</span>
          </span>
        )
      } else {
        if (this.stas !== 'false') {
          return (
            <span style="width: 88%;position:relative;">
              <span class={node.expanded ? 'iconfont icon-openfile' : 'iconfont icon-file'}></span>
              <span style="margin-left:.5em">{node.label.length > 8 ? node.label.substring(0, 8) + '...' : node.label}</span>
            </span>
          )
        } else { // 此时嵌套在embeddedModule里， 不显示目录操作
          return (
            <span style="width: 88%;position:relative;">
              <span class={node.expanded ? 'iconfont icon-openfile' : 'iconfont icon-file'}></span>
              <span style="margin-left:.5em">{node.label.length > 8 ? node.label.substring(0, 8) + '...' : node.label}</span>
            </span>
          )
        }
      }
    },
    handleSelect () {
      this.nowDomain.inheritType = _.cloneDeep(this.selectedType)
      this.$store.commit('setDomainSelectedType', this.selectedType)
      // this.processSelectedType()
      this.$bus.$emit('domainSelected', this.nowDomain)
      this.$emit('selected', this.nowDomain)
      this.visible = false
      this.enableSelect = false
      this.$refs.folderDetail.keyword = ''
      this.$refs.folderDetail.selectedDomain = null
    },
    processSelectedType () {
      this.selectedType = this.domainSelectedType
      if (this.limitedDsApply) {
        if (this.limitedDsApplyConfig.rColDt) {
          this.inheritType.find(item => item.label === this.$store.state.$v.udp.dataType).disabled = true
          if (!this.selectedType.includes('dataType')) {
            this.selectedType.push('dataType')
          }
        }
        if (this.limitedDsApplyConfig.rColChName) {
          this.inheritType.find(item => item.label === this.$store.state.$v.erGraph.logicalName).disabled = true
          if (!this.selectedType.includes('chName')) {
            this.selectedType.push('chName')
          }
        }
        if (this.limitedDsApplyConfig.rColName) {
          this.inheritType.find(item => item.label === this.$store.state.$v.doaminSelector.enName2).disabled = true
          if (!this.selectedType.includes('abbrivation')) {
            this.selectedType.push('abbrivation')
          }
        }
        this.inheritType.find(item => item.label === this.$store.state.$v.doaminSelector.enName).disabled = true
      }
    }
  },
  watch: {
    keyword (value) {
      this.$refs.mainTree.filter(value)
    },
    limitedDsApply () {
      this.processSelectedType()
    },
    domainSelectedType: {
      deep: true,
      handler() {
        this.processSelectedType()
      }
    }
  }
}
</script>
<style scoped lang="scss">
  .folder-tree-wrapper {
    position: absolute;
    top: 40px;
    left: -17px;
    right: 0;
    bottom: 0;
    overflow: auto;
    width: 197px;
  }
  .grey-tree {
    position: absolute;
    top: 0;
    left: 0;
    width: 180px;
    bottom: 12px;
    overflow: auto;
    margin-right: 10px;
    box-sizing: border-box;
  }
  .resize-column-middle {
    position:absolute;
    top:10px;
    bottom:10px;
    overflow-y:hidden;
    width:10px;
    left: 290px;
    background-color:transparent;
    z-index:10;
    cursor:e-resize !important;
  }
  .code-detail-wrapper {
    position: absolute;
    top: 0;
    left: 200px;
    right: 0;
    bottom: 12px;
    overflow: auto;
  }
  .inherit-type {
    position: absolute;
    padding: 0;
    padding-top: 7px;
    bottom: -26px;
    height: 39px;
    left: 0;
    right: 0;
  }
  .page-wrapper {
    position: absolute;
    bottom: 20px;
    height: 30px;
    left: 20px;
  }
  .inherit-type {
    background: #f0f0f0;
    border-radius: 2px;
    h2 {
      padding: 0 20px;
      display: inline-block;
      vertical-align: middle;
      font-size: 12px;
      font-weight: 500;
    }
    /deep/ .el-checkbox-group {
      display: inline-block;
      vertical-align: middle;
      padding:0;
      font-size: 12px;
      .el-checkbox {
        // margin-bottom: 5px;
        margin-right: 20px;
      }
    }
  }
</style>
<style lang="scss">
.domain-selector {
  .el-dialog__header {
    padding-top: 0;
    padding-bottom: 0;
    height: 50px;
    line-height: 50px;
    padding-left: 20px !important;
    border-bottom: 1px solid #ddd;
  }
  .el-dialog__headerbtn {
    top: 0px;
    right: 10px;
  }
  .tree-search-box {
    width: 240px;
  }
}
.black-el-checkbox-group{
  .el-checkbox__inner{
    background-color: transparent;
    border-color: #888888;;
  }
  .el-checkbox__input.is-checked .el-checkbox__inner{
    background-color: transparent;
    border-color: #187FFF;
  }
  .el-checkbox__inner::after{
    border: 1px solid #187FFF;
  }
  .el-checkbox__input + .el-checkbox__label{
    color: #bbb;
  }
}
</style>
