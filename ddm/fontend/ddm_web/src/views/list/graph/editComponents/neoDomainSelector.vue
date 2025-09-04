<template>
    <div id="neo-domain" v-loading='loading'>
        <!-- <div v-show="!isShowTable" class="input-box1">
            <el-input v-model="keyword" placeholder="搜索所有标准" size="mini" clearable></el-input>
            <img @click="toggleExpand" :src="diagramImg2" alt="">
        </div> -->
        <div v-show="!isShowTable" class="tree-container">
            <el-tree
            :indent="10"
            :data="treeData"
            ref="mainTree"
            :props="defaultProps"
            :render-content="renderContent"
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
            :filter-node-method="filterNode"
          ></el-tree>
        </div>

        <div class="input-box2">
            <el-input :class="{'big-width': isShowTable}" prefix-icon="iconfont icon-search" v-model.trim="keyword" :placeholder="showSearch ? '搜索所有标准' :'搜索当前目录'" size="mini" clearable></el-input>
            <template v-if="!isShowTable">
              <div class="img-box" @click="toggleExpand" v-show="!isExpandAll">
                <i class="iconfont icon-shouqi" ></i>
              </div>
              <div class="img-box" @click="toggleExpand" v-show="isExpandAll">
                <i class="iconfont icon-zhankai" ></i>
              </div>
            </template>
            <el-popover
              placement="right"
              width="255"
              trigger="click"
              v-model="settingVisible"
              @show="processSelectedType"
              @hide="$store.commit('setDomainSelectedType', selectedType)"
              popper-class="domain-setting"
            >
              <div slot="reference" class="bottom-box" :class="{active:settingVisible}">
                <i  class="iconfont icon-shezhi"></i>
              </div>
              <div class="setting-title">
                <span style="color:red;position: relative;top: 3px;">*</span>
                应用数据标准到字段时，将继承所选属性
              </div>
              <el-checkbox-group v-model="selectedType">
                <el-checkbox :disabled="item.disabled" v-for="item in inheritType.filter(item => item.value !== 'enName')" :label="item.value" :key="item.value">{{item.label}}</el-checkbox>
              </el-checkbox-group>
            </el-popover>
            <div class="path-box" :title="currentCategory">
                <i @click="handleBack" class="el-icon-arrow-left"></i>
                <span v-show="!showSearch" class="cat-box">{{currentCategory}}</span>
                <span v-show="showSearch">找到相关结果约{{total}}条</span>
            </div>
        </div>
        <div v-loading="tableLoading" v-show="isShowTable" class="table-box">
            <el-table
              class="datablau-table"
              height="100%"
              ref="domainTable"
              :data="tableData"
              :show-header="false"
            >
              <!--<el-table-column
              >
                <template slot-scope="scope">
                  <template v-if="scope.row.path[scope.row.path.length - 1].length < 10">
                    <span class="text-cotainer hl">{{scope.row.path[scope.row.path.length - 1]}}</span>
                  </template>
                  <template v-else>
                    <datablau-tooltip
                      effect="dark"
                      :content="scope.row.path[scope.row.path.length - 1]"
                      placement="top-start"
                    >
                      <span class="text-cotainer hl">{{scope.row.path[scope.row.path.length - 1]}}</span>
                    </datablau-tooltip>
                  </template>
                </template>
              </el-table-column>
              <el-table-column
                :label="$store.state.$v.doaminSelector.enName"
                prop="enName"
                min-width="60px"
                show-overflow-tooltip
              ></el-table-column> -->
              <el-table-column
              >
              <template slot-scope="scope">
                    <span style="cursor: pointer">
                      <i class="iconfont icon-biaozhun" style="color: rgb(92, 183, 147);margin-right: 8px;vertical-align: middle"></i>
                      <span class="text-cotainer">{{scope.row.chName}}（{{scope.row.enName}}）</span>
                    </span>
                    <el-popover
                      popper-class='domain-popover'
                      placement="right"
                      width="300"
                      trigger="manual"
                      :open-delay="600"
                      v-model="scope.row.domainVisible"
                      >
                      <div class="inner-box" @mouseenter="scope.row.domainVisible = true" @mouseleave="scope.row.domainVisible = false">
                      <div class="domain-title">
                        <!--                          <i class="tree-icon" :class="{domain: typeIds === 1, index: typeIds === 2, system: typeIds === 3}"></i>-->
                        <i class="iconfont icon-biaozhun" style="color: rgb(92, 183, 147);"></i>
                        {{ scope.row.chName }}
                        <p
                          v-if="!$store.state.damConnectable && !inElectron"
                          style="cursor:pointer"
                          @click='go2Domain(scope.row.id)'
                        >
                          标准详情</p>
                      </div>
                      <div class="domain-disc">
                          {{scope.row.description}}
                      </div>
                      <div class="text-item">
                          <span class="label">
                              标准编号
                          </span>
                          <span>
                              {{scope.row.domainCode}}
                          </span>
                      </div>
                      <div class="text-item">
                          <span class="label">
                              英文名称
                          </span>
                          <span>
                              {{scope.row.enName}}
                          </span>
                      </div>
                      <div class="text-item">
                          <span class="label">
                              英文缩写
                          </span>
                          <span>
                              {{scope.row.abbrivation}}
                          </span>
                      </div>
                      <div class="text-item">
                          <span class="label">
                              数据类型
                          </span>
                          <span>
                              {{scope.row.dataType}}
                          </span>
                      </div>
                      <div class="text-item">
                          <span class="label">
                              长度
                          </span>
                          <span>
                              {{scope.row.dataScale}}
                          </span>
                      </div>
                      <div class="text-item">
                          <span class="label">
                              精度
                          </span>
                          <span>
                               {{scope.row.dataPrecision}}
                          </span>
                      </div>
                      <div class="text-item">
                          <span class="label">
                              路径
                          </span>
                          <span>
                              {{scope.row.path.join('/')}}
                          </span>
                      </div>
                      <!-- <div class="text-item">
                          <span class="label">
                              业务部门
                          </span>
                          <span>
                              待确认
                          </span>
                      </div> -->
                      <div class="text-item">
                          <span class="label">
                              关联标准代码
                          </span>
                          <span>
                              {{scope.row.referenceCode}}
                          </span>
                      </div>
                      </div>
                      <i class="el-icon-info" slot="reference" @mousedown="$set(scope.row,'domainVisible',false)" @mouseenter="$set(scope.row,'domainVisible',true)" @mouseleave="$set(scope.row,'domainVisible',false)"></i>
                    </el-popover>
              </template>
              </el-table-column>
              <!-- <el-table-column
                width="34px"
              >
                <template slot-scope="scope">
                   <el-popover
                      placement="right"
                      title=""
                      width="200"
                      trigger="hover"
                      :content="scope.row.chName">
                      <i class="el-icon-info" style="font-size:14px" slot="reference"></i>
                    </el-popover>
                </template>
              </el-table-column> -->
            </el-table>
        </div>
        <div v-show="isShowTable" class="page-box">
            <datablau-pagination
              small
              layout="total,prev, pager, next"
              :pager-count="5"
              :page-size="30"
              @current-change="handleCurrentChange"
              :current-page.sync="currentPage"
              :total="total">
            </datablau-pagination>
        </div>
    </div>
</template>
<script>
import sort from '@/resource/utils/sort'
import string from '@/resource/utils/string'
import HTTP from '@/resource/http'
import inElectron from '@/resource/utils/environment'
import { mapState } from 'vuex'
export default {
  data () {
    return {
      inElectron,
      settingVisible: false,
      loading: false,
      diagramImg2: require('@/assets/images/mxgraphEdit/new-icon/expand.svg'),
      keyword: '',
      defaultProps: {
        children: 'nodes',
        label: 'name',
        id: 'id'
      },
      treeData: [],
      treeKey: 0,
      typeIds: 1,
      defaultExpandAll: false,
      nowFolder: null,
      expandedKeys: [],
      currentCategory: '',
      isExpandAll: false,
      selectedType: ['dataType'],
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

      // table 相关
      isShowTable: false,
      tableData: [],
      currentPage: 1,
      total: 0,
      showSearch: true,
      tableLoading: false
    }
  },
  props: {
    limitedDsApply: {
      type: Boolean,
      default: false
    },
    limitedDsApplyConfig: {
      required: true
    }
  },
  mounted () {
    this.getTree()
    this.processSelectedType()
  },
  beforeDestroy () {
    document.querySelectorAll('#neo-domain .el-table__row').forEach(row => {
      console.log(row)
      row.onmouseenter = null
    })
  },
  computed: {
    ...mapState(['domainSelectedType'])
  },
  methods: {
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
    },
    go2Domain (id) {
      this.$go2Domain(id)
    },
    toggleExpand () {
      this.isExpandAll = !this.isExpandAll
      this.setAllExpand(this.isExpandAll)
    },
    setAllExpand (state) {
      let nodes = this.$refs.mainTree.store.nodesMap
      for (let i in nodes) {
        nodes[i].expanded = state
      }
    },
    handleBack () {
      this.noSearch = true
      this.isShowTable = false
      this.showSearch = true
      this.nowFolder = null
      this.keyword = ''
    },
    handleCurrentChange (val) {
      this.currentPage = val
      this.initTableData()
    },
    resetQuery () {
      this.keyword = ''
      this.noSearch = true
      this.searchFormData = {
        stateValue: null,
        domainName: '',
        bigVersionId: '',
        startTime: null,
        endTime: null,
        domainCode: '',
        submitter: ''
      }
      this.handleCurrentChange(1)
    },
    refreshData () {
      this.initTableData()
    },
    initTableData () {
      document.querySelectorAll('#neo-domain .el-table__row').forEach(row => {
        row.onmouseenter = null
      })
      this.noSearch = false
      const obj = {
        domainCode: this.keyword,
        chineseName: this.keyword,
        domainState: 'A',
        folderId: (this.nowFolder && this.nowFolder.foldId) || this.typeIds,
        submitter: '',
        firstPublishStart: null,
        firstPublishEnd: null,
        ownerOrg: '',
        orderColumn: ['createTime'],
        ascOrder: [false],
        currentPage: this.currentPage,
        pageSize: 30
      }
      this.tableLoading = true
      this.$http.post(`${this.$url}/service/domains/latest/page`, obj).then(res => {
        this.tableLoading = false
        this.tableData = res.data.items
        this.total = res.data.totalItems
        // er图支持拖拽落标
        setTimeout(() => {
          let rows = document.querySelectorAll('#neo-domain .el-table__row')
          rows.forEach((v, i) => {
            v.draggable = true
            v.ondragstart = event => {
              let currentDomain = res.data.items[i]
              currentDomain.inheritType = this.selectedType || []
              event.dataTransfer.setData('domain-info', JSON.stringify(currentDomain))
              this.$emit('visibleChange', false)
            }
            v.ondragend = e => {
              this.$emit('visibleChange', true)
            }
            v.onmouseenter = e => {
              let rows = document.querySelectorAll('#neo-domain .el-table__row')
              rows.forEach(row => {
                row.classList.remove('active')
              })
              v.classList.add('active')
            }
          })
        }, 200)
        if (!this.noSearch) {
          this.isShowTable = true
        }
      }).catch(e => {
        this.tableLoading = false
        this.$showFailure(e)
      })
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
    allowDrag (draggingNode) {
      // 为了拖拽时不展示子节点
      draggingNode.expanded = false
      return draggingNode.data.foldId !== 1
    },
    handleDragStart (node, event) {
      this.visible = false
      let obj = {
        foldId: node.data.foldId,
        inheritType: _.cloneDeep(this.selectedType) || []
      }
      // 在目标表ondrop 通过dataTransfer接收当前拖拽的目录id
      event.dataTransfer.setData('domain-list', JSON.stringify(obj))
    },
    handleItemClicked (data, node) {
      this.nowFolder = data

      this.$nextTick(() => {
        this.isShowTable = true
        this.showSearch = false
        this.resetQuery()
      })
      this.currentCategory = data.name
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
            <datablau-tooltip
              effect="dark"
              content={node.label}
              placement="top-start"
            >
              <span v-show={node.label.length > 12} class={labelClassName}>{node.label.substring(0, 12) + '...'}</span>
            </datablau-tooltip>
            <span v-show={node.label.length <= 12} class={labelClassName}>{node.label}</span>
          </span>
        )
      } else {
        if (this.stas !== 'false') {
          return (
            <span style="width: 88%;position:relative;">
              <span class="tree-icon folder">
                <i class="iconfont icon-file"></i>
                <i class="iconfont icon-openfile"></i>
              </span>
              <datablau-tooltip
                effect="dark"
                content={node.label}
                placement="top-start"
              >
                <span v-show={node.label.length > 12} class='label-text'>{node.label.substring(0, 12) + '...'}</span>
              </datablau-tooltip>
              <span v-show={node.label.length <= 12} class='label-text'>{node.label}</span>
            </span>
          )
        } else { // 此时嵌套在embeddedModule里， 不显示目录操作
          return (
            <span style="width: 88%;position:relative;">
              <span class="tree-icon folder">
                <i class="iconfont icon-file"></i>
                <i class="iconfont icon-openfile"></i>
              </span>
              <datablau-tooltip
                effect="dark"
                content={node.label}
                placement="top-start"
              >
                <span v-show={node.label.length > 12} class='label-text'>{node.label.substring(0, 12) + '...'}</span>
              </datablau-tooltip>
              <span v-show={node.label.length <= 12} class='label-text'>{node.label}</span>
            </span>
          )
        }
      }
    },
    getTree () {
      this.loading = true
      this.$http.get(`${this.$url}/service/domains/tree/?onlyFolder=true&categoryId=${this.typeIds}`)
        .then(res => {
          this.loading = true
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
        }).catch(e => {
          this.treeLoading = false
          this.$showFailure(e)
        })
    }
  },
  watch: {
    keyword (value) {
      this.currentPage = 1
      if (this.timeout) {
        clearTimeout(this.timeout)
      }
      this.timeout = setTimeout(() => {
        // if (!this.noSearch) {
        //   this.isShowTable = true
        // }
        // this.noSearch = false
        if (!this.nowFolder || !this.nowFolder.data || this.nowFolder.data.foldId === 1) {
          this.showSearch = true
        } else {
          this.showSearch = false
        }
        this.initTableData()
        this.timeout = null
      }, 400)
    },
    limitedDsApply () {
      this.processSelectedType()
    }
  }
}
</script>
<style lang="scss" scoped>
  .el-table /deep/ td.el-table__cell {
    border-bottom: none;
  }
    .setting-title {
      font-size: 12px;
      font-weight: 500;
      text-align: left;
    }
    .el-checkbox {
      display: block;
      /deep/.el-checkbox__label {
        font-size: 12px;
      }
    }

    #neo-domain {
      position:absolute;
      top:0px;
      bottom:0;
      left:30px;
      right:0;
      border-left: 1px solid #ddd;
    /deep/ .el-table--enable-row-hover .el-table__body tr:hover>td {
      background-color: #f0f7ff;
    }
    /deep/ .el-tree-node__content>.el-tree-node__expand-icon {
      font-size: 13px;
      color: #999;
      transform: rotate(270deg);
      &:hover {
        color: #409eff;
      }
    }
    /deep/ .el-table.datablau-table td {
      height: 34px;
    }
    /deep/ .el-table__row.active {
      background-color: #f0f7ff;
    }
    /deep/ .el-table__row .hl{
      display: inline-block;
      position: relative;
      width: 110px;
      z-index: 1;
    }
    .text-cotainer {
      display: inline-block;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      height: 20px;
      line-height: 20px;
      width: 180px;
      vertical-align: middle;
    }
    /deep/ .tree-icon.folder {
      margin-right: 0;
      display: inline-flex;
      background: unset;
      justify-content: center;
      align-items: center;
      color: #409eff;
      .iconfont {
        font-size: 14px;
      }
      .icon-file {
        display: inline;
      }
      .icon-openfile {
        display: none;
      }
    }
    /deep/ .el-tree--highlight-current .el-tree-node.is-current>.el-tree-node__content {
        .label-text {
        color: #409eff;
      }
    }
    /deep/ .is-expanded > .el-tree-node__content {
      .tree-icon.folder {
        .icon-file {
          display: none;
        }
        .icon-openfile {
          display: inline;
        }
      }
    }
    /deep/ .el-tree-node__content {
      color: #555;
    }
    /deep/ .el-tree .el-icon-caret-right:before {
          content: "";
        }
    /deep/ .el-tree .el-tree-node__expand-icon.expanded.el-icon-caret-right {
      transform: rotate(180deg);
      &:before{
          content: "";
        }
    }
    .el-input {
        width: 166px;
        height: 30px;
        vertical-align: middle;
        &.big-width {
          width: 196px;
        }
    }
    .input-box2 {
        padding-left: 10px;
        padding-top: 10px;
        height: 70px;
        border-bottom: 1px solid #ddd;
        /deep/ .el-input__inner {
          height: 30px;
          line-height: 30px;
        }
        .cat-box {
           overflow: hidden;
           white-space: nowrap;
           text-overflow: ellipsis;
        }
        .img-box {
          vertical-align: middle;
          margin-left: 6px;
          width: 24px;
          height: 30px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #999;
          .icon-shouqi {
            color: #999;
          }
          &:hover {
             color: #409eff;
             .icon-shouqi {
               color: #409eff;
             }
          }
        }
        .path-box {
           height: 30px;
           display: flex;
           align-items: center;
           font-size: 12px;
           font-weight: 400;
           color: #555555;
           overflow: hidden;
           text-overflow: ellipsis;
           white-space: nowrap;
           i {
              font-size: 13px;
               margin-right: 6px;
               cursor: pointer;
               color: #999;
               &:hover {
                color: #409eff;
               }
           }
        }
    }
    .tree-container {
        position: absolute;
        top: 40px;
        bottom: 0;
        left: 0;
        right: 0;
        overflow-y: auto;
        padding-top: 10px;
        background: #fff;
    }
    .bottom-box {
      margin-left: 6px;
      cursor: pointer;
      display: inline-flex;
      justify-content: space-between;
      align-items: center;
      height: 30px;
      line-height: 30px;
      color: #999;
      vertical-align: middle;
      // cursor: pointer;
      &:hover,&.active {
        color: #4496ff;;
      }
      // span {
      //   margin-right: 46px;
      // }
      .el-icon-arrow-right {
        width: 24px;
        line-height: 30px;
        text-align: center;
        cursor: pointer;
      }
    }
    .table-box {
        position: absolute;
        top: 70px;
        bottom: 30px;
        left: 0;
        right: 0px;
        .el-popover__reference {
            font-size: 14px;
            position: absolute;
            right: 10px;
            top: 0px;
            width: 230px;
            height: 30px;
            opacity: 0;
            // display: none;
        }
        // tr {
        //     position: relative;
        //     &:hover {
        //         .el-popover__reference {
        //             cursor: pointer;
        //             display: inline-block;
        //         }
        //     }
        // }
    }
    .page-box {
        width: 240px;
        padding-left: 6px;
        position: absolute;
        bottom: 0px;
        height: 30px;
        z-index: 5;
        background-color: #fff;
        box-shadow: 0px -2px 4px 0px rgba(85,85,85,0.20);
        overflow-x: auto;
        overflow-y: hidden;
    }
}
</style>
<style lang="scss">
.el-popover.domain-popover {
    padding: 10px;
    .tree-icon.domain {
        left: 5px;
    }
    .domain-title {
        position: relative;
        font-size: 14px;
        font-weight: 500;
        color: #555555;
        > p {
          position: absolute;
          top: 2px;
          right: 17px;
          color: #4496FF;
          font-size: 12px;
        }
    }
    .domain-disc {
        margin-bottom: 7px;
        padding-left: 24px;
        font-size: 12px;
        font-weight: 400;
        text-align: left;
        color: #555555;
        line-height: 24px;
        border-bottom: 1px solid rgba(85,85,85,0.10);;
    }
    .text-item {
        font-size: 12px;
        font-weight: 400;
        color: #555555;
        margin-bottom: 5px;
    }
    .label {
        margin-right: 10px;
        display: inline-block;
        width: 72px;
        text-align: right;
    }
}
.domain-setting {
      padding-left: 14px;
    }
</style>
