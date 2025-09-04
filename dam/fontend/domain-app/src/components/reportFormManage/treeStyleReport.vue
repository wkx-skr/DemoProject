<template>
  <div class="tree-style-component tree-list-report">
    <datablau-tree-with-list
      ref="treeWithList"
      :treeSearchPH="$t('meta.report.tree.placeholder')"
      class="tree-list-info"
      :getTreeData="getTreeData"
      :treeProps="treeProps"
      :nodeId="treeId"
      :listShowData="listShowData"
      :columnDefs="columnDefs"
      :listTotal="listTotal"
      :showTreeBottom="false"
      :showTreeCheckBox="false"
      :supervise="true"
      tableHeightInfo="100%"
      :tableOption="tableOption"
      :treeDefaultExpanded="treeDefaultExpanded"
      :dataIconFunction="dataIconFunction"
      :dataOptionsFunction="dataOptionsFunction"
      @handleCheckChange="treeCheckedChange"
      @handleNodeClick="treeNodeClick"
      @gridSelectionChanged="gridSelectionChanged"
    >
      <!--@rightListRowClick="rightListRowClick"-->
      <div slot="treeSecondRow" class="tree-second-row">
        <div
          @click="allListClick"
          class="second-row"
          :class="{ 'is-active': isAllActive }"
        >
          <i class="iconfont icon-allfile"></i>
          <span>{{ $t('meta.report.tree.allReport') }}</span>
        </div>
      </div>
      <div slot="treeBottomRow">
        <div class="bottom-part">
          <el-button size="mini" @click="deleteReports" class="margin-left20">
            {{ $t('common.button.delete') }}
          </el-button>
        </div>
      </div>
      <div slot="tableHeader">
        <div v-if="$auth['METADATA_REPORT_VIEW']" class="right-top data-demand">
          <!-- <datablau-button
            size="mini"
            style="font-size: 12px"
            class="iconfont icon-download"
            @click="downloadFile"
          >
            下载模板
          </datablau-button> -->
          <datablau-button
            type="secondary"
            style="font-size: 12px"
            class="icon-ic-quality-import"
            @click="importFile"
            v-if="$auth['METADATA_REPORT_IMPORT']"
          >
            {{ $t('meta.report.importReport') }}
          </datablau-button>
          <datablau-button
            type="secondary"
            class="iconfont icon-tianjia"
            @click="showAddReportFormManageTab"
            v-if="$auth['METADATA_REPORT_ADD']"
          >
            {{ $t('meta.report.addReport') }}
          </datablau-button>
          <datablau-button
            type="secondary"
            class="iconfont icon-expand"
            style="font-size: 12px"
            @click="editUdps"
            v-if="$auth['METADATA_REPORT_UDP']"
          >
            {{ $t('meta.DS.udp.udp') }}
          </datablau-button>
          <!-- <el-dropdown style="margin-left: 10px">
            <datablau-button
              type="secondary"
              icon="el-icon-plus"
              class="green-btn el-btn add-demand-btn"
            >
              更多操作
              <i class="el-icon-arrow-down el-icon--right"></i>
            </datablau-button>
            <el-dropdown-menu slot="dropdown" class="add-demand-dropdown">
              <el-dropdown-item class="dropdown-item-style">
                <div @click="showJobMange">管理导入任务</div>
              </el-dropdown-item> -->
          <!-- <el-dropdown-item class="dropdown-item-style">
                <el-upload
                  class="inline-block"
                  :action="postUrl"
                  :before-upload="handleBeforeUpload"
                  :on-error="onError"
                  :on-success="onSuccess"
                  :show-file-list="false"
                  accept=".xlsx"
                  :headers="$headers"
                >
                  <div>导入报表信息</div>
                </el-upload>
              </el-dropdown-item> -->
          <!-- <el-dropdown-item class="dropdown-item-style">
                <div @click="showImportJobSet">连接报表服务器</div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown> -->
        </div>
        <!-- <datablau-filter-row class="table-filter-row"> -->
        <!-- <el-input
            size="small"
            placeholder="输入关键字进行搜索"
            v-model="keyword"
            :clearable="true"
            style="width: 300px"
            v-if="false"
          ></el-input> -->
        <!-- <el-tooltip
            effect="light"
            content="根据需求编号、报表编号、名称、类型、负责人、更新频率进行搜索"
            placement="right"
          >
            <i class="el-icon-info search-tooltip"></i>
          </el-tooltip> -->

        <!-- </datablau-filter-row> -->
      </div>
      <div slot="tableFooter" class="table-bottom-line-icon">
        <span v-show="mutipleLength" class="check-info-icon"></span>
        <span v-show="mutipleLength" class="footer-row-info">
          {{ this.$t('common.deleteMessage', { selection: mutipleLength }) }}
        </span>
        <datablau-button
          v-show="mutipleLength"
          size="small"
          type="danger"
          class="el-icon-delete"
          @click="handleDeleteReports"
          :disabled="deleteDisabled"
        >
          {{ $t('common.button.delete') }}
        </datablau-button>
      </div>
    </datablau-tree-with-list>
  </div>
</template>

<script>
import treeWithList from '@/components/treeWithList/treeWithList.vue'

export default {
  props: {
    hasAccess: {
      type: Boolean,
      default: false,
    },
    postUrl: {
      type: String,
      required: true,
    },
    appTypes: {
      required: true,
    },
  },
  data() {
    return {
      treeProps: {
        label: 'name',
      },
      isAllActive: false,
      rootObj: {},
      treeId: 'treeId',
      treeCheckedNodes: [],
      columnDefs: null,
      listArr: null, // 选中文件夹下的所有报表
      listTotal: 0,
      tableOption: null,
      treeDefaultExpanded: [],
      keyword: '',
      currentNodePath: '', // 左侧树 当前选中节点
      pathMap: {},
      selection: [], // 选中的报表
      mutipleLength: 0,
      deletedIds: new Set(),
    }
  },
  components: {
    treeWithList,
  },
  computed: {
    deleteDisabled() {
      return !(
        this.selection &&
        this.selection.length > 0 &&
        this.$auth.METADATA_REPORT_DELETE
      )
    },
  },
  created() {
    // this.setGetTreeData()
    const formatterTime = data => {
      let t = ''
      if (data.value) {
        t = this.$timeFormatter(data.value) || '无'
      } else {
        t = '无'
      }
      return t
    }
    const formatterClassType = data => {
      return data.type
    }
    const formatterFrec = data => {
      let t = ''
      if (data.value) {
        t = data.value
      } else {
        t = ''
      }
      return t
    }
    const formatterType = data => {
      let typeObj = this.appTypes.filter(item => item.value === data.type) || [
        { label: '' },
      ]
      return typeObj[0].label
    }
    const columnDefs = [
      {
        headerName: '',
        field: '',
        type: ['iconCol'],
        iconType: 'report',
        className: 'iconfont icon-tancha',
        customColName: 'iconfont icon-baobiao',
        // valueFormatter: formatterTime,
      },
      {
        headerName: this.$t('meta.report.reportNum'),
        field: 'code',
        // valueFormatter: formatterTime,
        tooltipField: 'code',
        minWidth: 150,
      },
      {
        headerName: this.$t('meta.report.reportName'),
        field: 'name',
        tooltipField: 'name',
        minWidth: 150,
      },
      {
        headerName: this.$t('meta.report.reportType'),
        field: 'type',
        type: ['customCol'],
        // headerAlign: 'center',
        // align: 'left',
        customClass: formatterClassType,
        customColName: formatterType,
        // tooltipField: 'type',
        valueFormatter: formatterType,
        minWidth: 110,
        // cellRenderer: params => {
        //   const type = params.data.type || ''
        //   let typeObj = this.appTypes.filter(item => item.value === type) || []
        //   typeObj = typeObj[0] ? typeObj[0] : {}
        //   const str = typeObj.label || ''
        //   const classMap = {
        //     Analysis: 'analysis',
        //     Report: 'report',
        //     List: 'list',
        //   }
        //   return `<span class="report-type-cell ${
        //     classMap[typeObj.value]
        //   }">${str}</span>`
        // },
      },
      {
        headerName: this.$t('meta.report.updateFrequency'),
        field: 'frequency',
        valueFormatter: formatterFrec,
        minWidth: this.$i18n.locale === 'en' ? 120 : '',
        // tooltipField: 'frequency',
        // cellRenderer: params => {
        //   const frequency = params.data.frequency || ''
        //   return frequency
        //     ? `<span class="report-frequency-cell">${frequency}</span>`
        //     : '-'
        // },
      },
      {
        headerName: this.$t('meta.report.createTime'),
        field: 'createTime',
        tooltipField: 'createTime',
        valueFormatter: formatterTime,
        minWidth: 150,
      },
      {
        headerName: this.$t('meta.report.owner'),
        field: 'owner',
        tooltipField: 'owner',
        minWidth: 80,
      },
      {
        headerName: this.$t('meta.report.operation'),
        filed: 'options',
        width: 160,
        align: 'center',
        type: ['optionsWithContent'],
        cellRendererParams: {
          tabComponent: this,
          options: [
            {
              name: 'checkReport',
              text: this.$t('meta.report.view'),
              method: 'checkReport',
            },
            {
              name: 'editReport',
              text: this.$t('common.button.edit'),
              method: 'editReport',
              ifBtnDisabled: this.ifCheckDisabled,
            },
          ],
        },
      },
    ]
    this.columnDefs = columnDefs
    const tableOption = {
      selectable: true,
      autoHideSelectable: true,
      showColumnSelection: true,
      columnSelection: [],
      columnResizable: true,
    }
    this.tableOption = tableOption
  },
  mounted() {
    if (this.$route.query.objectId) {
      if (this.$route.query.isAssets) {
        const reportDetail = {
          id: this.$route.query.objectId,
        }
        this.$emit('showReportDetail', reportDetail)
      } else {
        this.getQueryidArr(this.$route.query.objectId)
      }
    }
  },
  methods: {
    ifCheckDisabled() {
      let bool = true
      if (this.$isAdmin || this.$auth.METADATA_REPORT_MODIFY) {
        bool = false
      }
      return bool
    },
    dataOptionsFunction(data) {
      const options = []
      let label = ''
      if (data.name) {
        label =
          data.name.length < 10 ? data.name : data.name.slice(0, 8) + '...'
      }
      if (this.$auth.METADATA_REPORT_EXPORT) {
        options.push({
          label: this.$t('meta.report.tree.exportReport'),
          callback: () => {
            this.export(data)
          },
          args: 'folder',
        })
      }

      return options
    },
    export(data) {
      let newPath = data.path.replace('/' + data.name, '')
      let path = newPath.replace(/\//g, ',').split(',')
      let newArr = path.slice(0)
      newArr.splice(0, 1)
      newArr.push(data.name)
      const url = `${this.$url}/service/dataReport/file/report`
      const params = {
        categorys: newArr,
      }
      this.$downloadFilePost(url, params, this.$t('meta.report.tree.fileName'))
      return
      // newArr = newArr.join(',')
      // const url = `${this.$url}/service/dataReport/file/${newArr}`
      // this.$downloadFile(url)
    },
    dataIconFunction(data, node) {
      if (node.expanded) {
        return 'iconfont icon-openfile'
      } else {
        return 'iconfont icon-file'
      }
    },
    importFile() {
      this.$emit('showImportTask')
    },
    allListClick() {
      let obj = {}
      obj.data = this.rootObj
      this.isAllActive = true
      this.treeNodeClick(obj)
      this.changeHighlightModel('root')
      // this.setCurrentKey(null)
    },
    getQueryidArr(objectId) {
      this.$http
        .get(this.$url + '/service/dataReport/' + objectId)
        .then(res => {
          this.rightListRowClick(res)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getTreeData() {
      return new Promise((resolve, reject) => {
        this.$http
          .get(`${this.$url}/service/dataReport/tree`)
          // this.$http.get(`${this.$url}/service/dataReport/folder/tree`)
          .then(res => {
            const data = this.dealwithTreeData(res.data)
            // data = res.data.nodes;
            // 设置 高亮节点
            setTimeout(() => {
              // console.log(currentNodePath, 'currentNodePath')
              if (false && currentNodePath && this.pathMap[currentNodePath]) {
                const currentNode = this.pathMap[currentNodePath]
                // console.log(currentNode, 'currentNode')
                this.setTreeCurrent(currentNode.treeId)
                this.treeNodeClick(currentNode)
                this.treeDefaultExpanded = [currentNode.treeId]
              } else {
                this.allListClick()
                // this.setTreeCurrent(data.treeId)
                // this.treeNodeClick({ data })
                // this.treeDefaultExpanded = [data.treeId]
              }
            }, 200)
            resolve(data)
          })
          .catch(e => {
            reject(e)
          })
      })
    },

    // setGetTreeData({ currentNodePath } = {}) {
    //   this.getTreeData = new Promise((resolve, reject) => {
    //     this.$http
    //       .get(`${this.$url}/service/dataReport/tree`)
    //       // this.$http.get(`${this.$url}/service/dataReport/folder/tree`)
    //       .then(res => {
    //         const data = this.dealwithTreeData(res.data)
    //         // data = res.data.nodes;
    //         // 设置 高亮节点
    //         setTimeout(() => {
    //           // console.log(currentNodePath, 'currentNodePath')
    //           if (false && currentNodePath && this.pathMap[currentNodePath]) {
    //             const currentNode = this.pathMap[currentNodePath]
    //             // console.log(currentNode, 'currentNode')
    //             this.setTreeCurrent(currentNode.treeId)
    //             this.treeNodeClick(currentNode)
    //             this.treeDefaultExpanded = [currentNode.treeId]
    //           } else {
    //             this.setTreeCurrent(data.treeId)
    //             this.treeNodeClick({ data })
    //             this.treeDefaultExpanded = [data.treeId]
    //           }
    //         }, 200)
    //         resolve([data])
    //       })
    //       .catch(e => {
    //         reject(e)
    //       })
    //   })
    // },
    setTreeCurrent(nodeKey) {
      if (this.$refs.treeWithList && this.$refs.treeWithList.treeSetCurrent) {
        this.$refs.treeWithList.treeSetCurrent(nodeKey)
      }
    },
    treeNodeRender(h, { node, data, store }) {
      // console.log(node, data, store, 'node, data, store')
      return h(
        'span',
        {
          class: 'tree-item-outer',
        },
        [
          h('span', {}, [
            h(
              'span',
              {
                class:
                  data.type === 'catalog'
                    ? 'tree-icon iconfont icon-file'
                    : 'tree-icon iconfont icon-openfile',
              },
              ''
            ),
            h(
              'span',
              {
                class: 'oneline-eclipse tree-label',
                style: 'margin-left:0.5em;',
                attrs: {
                  title: node.label,
                },
              },
              node.label
            ),
          ]),
          // h('span', {
          //   class: 'el-icon-more more',
          //   style: 'line-height:34px;',
          //   click: (evt) => {
          //     this.callContext(data, evt);
          //   }
          // }, ''),
        ]
      )
    },
    listShowData(para) {
      const s = para.pageSize || 20
      const c = para.currentPage || 1
      return new Promise((resolve, reject) => {
        let filterData = []
        if (Array.isArray(this.listArr)) {
          if (this.listArr.length) {
            filterData = this.listArr.filter(item =>
              this.$MatchKeyword(item, para.keyword, 'code', 'name')
            )
          }
          let result =
            Array.isArray(filterData) && filterData.slice(s * (c - 1), s * c)
          this.listTotal = filterData.length
          resolve(result)
        } else {
          resolve(null)
        }
      })
    },
    dealwithTreeData(data) {
      const pathMap = {}
      const treeMap = {}
      let catalogIdCount = 1
      const rootObj = {
        type: 'catalog',
        id: catalogIdCount++,
        name: this.$t('meta.report.tree.allReport1'),
        data: data,
      }
      rootObj.path = rootObj.name
      data.path = rootObj.path
      rootObj.treeId = rootObj.id + 'catalog'
      pathMap[rootObj.path] = rootObj
      treeMap[rootObj.treeId] = rootObj
      const dealwithTreeNode = node => {
        const childrenArr = []
        const reports = node.reports
        const catalogs = node.nodes
        catalogs &&
          catalogs.forEach(item => {
            item.path = `${node.path}/${item.name}`
            const obj = {
              type: 'catalog',
              id: catalogIdCount++,
              children: dealwithTreeNode(item),
              name: item.name,
              data: item,
            }
            obj.path = item.path
            pathMap[obj.path] = obj
            obj.treeId = obj.id + 'catalog'
            childrenArr.push(obj)
            treeMap[obj.treeId] = obj
          })
        reports &&
          reports.forEach(item => {
            const obj = {
              type: 'report',
              id: item.id,
              name: item.name,
              data: item,
            }
            obj.treeId = item.id + 'report'
            // childrenArr.push(obj);
            treeMap[obj.treeId] = obj
          })
        return childrenArr
      }
      const result = dealwithTreeNode(data)
      rootObj.children = result
      this.rootObj = rootObj
      this.pathMap = pathMap
      return result
    },
    deleteReports() {},
    treeCheckedChange(keys) {
      this.treeCheckedNodes = keys
    },
    treeNodeClick(para) {
      const type = (para && para.data && para.data.type) || ''
      if (type === 'report') {
        this.showReportDetail(para)
      } else if (type === 'catalog') {
        this.showCatalogDetail(para)
      }
      if (para.data.name !== this.$t('meta.report.tree.allReport1')) {
        this.changeHighlightModel()
      }
    },
    changeHighlightModel(status) {
      const tree = $('.tree-box')
      const treeNodes = tree.find('.el-tree-node')
      if (status !== 'root') {
        this.isAllActive = false
      } else {
        treeNodes.removeClass('is-current')
      }
    },
    showReportDetail(para) {
      // console.log('show report ',para.data)
      const data = para.data
      const reportDetail = {
        name: data.name,
        id: data.id,
      }
      this.$emit('showReportDetail', reportDetail)
    },
    showCatalogDetail(para) {
      // console.log(para, 'para')
      this.currentNodePath = para.data.path
      // console.log(this.currentNodePath, 'this.currentNodePath')
      const childrenArr = []
      const getChildrenReport = node => {
        if (node.reports && node.reports.length > 0) {
          childrenArr.push(...node.reports)
        }
        const nodes = node.nodes
        if (nodes && nodes.length > 0) {
          nodes.forEach(item => {
            getChildrenReport(item)
          })
        }
        this.listArr = childrenArr
      }
      const data = para.data && para.data.data
      if (data) {
        getChildrenReport(data)
      } else {
        this.listArr = null
      }
      // this.$refs.treeWithList.refreshRightList
      if (this.$refs.treeWithList && this.$refs.treeWithList.refreshRightData) {
        this.$nextTick(() => {
          this.$refs.treeWithList.refreshRightData('treeClick')
        })
      }
      // if (this.$refs.treeWithList && this.$refs.treeWithList.refreshRightList) {
      //   this.$nextTick(this.$refs.treeWithList.refreshRightList);
      // }
    },
    rightListRowClick(para, type) {
      // console.log(para, 'rightListRowClick para')
      const data = para.data
      const reportDetail = {
        name: data.name,
        id: data.id,
        type: type,
      }
      this.$emit('showReportDetail', reportDetail)
    },
    downloadFile(para) {
      this.$emit('downloadFile', para)
    } /*
    showJobMange() {
      this.$emit('showJobMange')
    }, */,
    showAddReportFormManageTab(para) {
      this.$emit('showAddReportFormManageTab', para)
    },
    handleBeforeUpload(para) {
      this.$emit('handleBeforeUpload', para)
    },
    showImportJobSet() {
      this.$emit('showImportJobSet')
    },
    onError(para) {
      this.$emit('onError', para)
    },
    onSuccess(para) {
      if (para === 0) {
        this.$emit('onError', para)
      } else {
        this.$emit('onSuccess', para)
      }
    },
    checkReport({ data, api, e }) {
      e.stopPropagation()
      // console.log(para, 'para')
      this.rightListRowClick({ data })
    },
    editReport({ data, api, e }) {
      e.stopPropagation()
      this.rightListRowClick({ data }, 'edit')
    },
    handleDeleteReports() {
      const selection = this.selection.filter(
        item => !this.deletedIds.has(item.id)
      )
      // if (selection.length > 0) {
      this.$emit('deleteRow', selection)
      // }
      this.selection
        .map(item => item.id)
        .forEach(id => {
          this.deletedIds.add(id)
        })
    },
    gridSelectionChanged(para) {
      const api = para.api
      if (!api) return
      const arr = api.getSelectedNodes()
      const result = []
      arr.forEach(item => {
        result.push(item.data)
      })
      this.mutipleLength = result.length
      this.selection = result
    },
    editUdps() {
      this.$emit('editUdps')
    },
    refreshTree() {
      this.$refs.treeWithList &&
        this.$refs.treeWithList.refreshData &&
        this.$refs.treeWithList.refreshData()
    },
    // refreshTree() {
    //   this.setGetTreeData({ currentNodePath: this.currentNodePath })

    //   setTimeout(() => {
    //     if (
    //       this.$refs.treeWithList &&
    //       this.$refs.treeWithList.refreshLeftTree
    //     ) {
    //       this.$refs.treeWithList.refreshLeftTree()
    //     }
    //   }, 500)
    // },
  },
  watch: {
    keyword(newVal) {
      if (this.$refs.treeWithList && this.$refs.treeWithList.refreshRightList) {
        this.$refs.treeWithList.refreshRightList()
      }
    },
  },
}
</script>

<style lang="scss">
$primary-color: #409eff;
$component-divide-color: #efefef;
$table-hover-color: transparentize(#409eff, 0.9);
$file-green: #56a7b2;
.add-demand-btn {
  &:hover {
    .el-icon-arrow-down::before {
      color: #fff;
    }
  }
}
.tree-style-component.tree-list-report {
  background-color: #fff;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  .margin-left20 {
    margin-left: 20px;
  }
  .report-icon {
    background: url('../../assets/images/search/report.png') no-repeat
      center/contain;
    width: 18px;
    height: 18px;
  }

  .table-filter-row {
    //border: 1px solid red;
  }
  .datablau-table-info {
    height: 100%;
  }

  .table-bottom-line-icon {
    padding-left: 2px;
    .check-info-icon {
      width: 14px;
      height: 14px;
      margin-left: -7px;
      display: inline-block;
      background: $primary-color;
      vertical-align: middle;
    }
    .footer-row-info {
      margin-right: 10px;
      &:before {
        content: '\e6da';
        font-family: 'element-icons';
        font-size: 12px;
        font-weight: 200;
        margin-right: 5px;
        margin-left: -13px;
        vertical-align: middle;
        line-height: 15px;
        color: white;
      }
    }
  }
  .icon-baobiao {
    color: $file-green;
  }
  p {
    &.Report {
      text-align: center;
      width: 64px;
      height: 24px;
      line-height: 24px;
      background: rgba(25, 178, 172, 0.1);
      border-radius: 2px;
      margin-top: 1px;
      color: #19b2ac;
    }
    &.Analysis {
      text-align: center;
      width: 64px;
      height: 24px;
      line-height: 24px;
      background: rgba(130, 0, 150, 0.1);
      border-radius: 2px;
      color: #820096;
      margin-top: 1px;
    }
    &.List {
      text-align: center;
      width: 64px;
      height: 24px;
      line-height: 24px;
      border-radius: 2px;
      background: rgba(30, 150, 0, 0.1);
      margin-top: 1px;
      color: #1e9600;
    }
  }
  .report-type-cell {
    border: 1px solid #719ff5;
    //padding: 3px 8px;
    display: inline-block;
    width: 68px;
    height: 24px;
    line-height: 22px;
    text-align: center;
    color: #719ff5;
    &.Analysis {
      color: #719ff5;
      border-color: #719ff5;
    }
    &.Report {
      color: #dd63ac;
      border-color: #dd63ac;
    }
    &.List {
      color: #3ec5e6;
      border-color: #3ec5e6;
    }
  }
  .report-frequency-cell {
    display: inline-block;
    width: 66px;
    height: 24px;
    line-height: 22px;
    text-align: center;
    border: 1px solid #ba984a;
    color: #ba984a;
  }
  .tree-second-row {
    cursor: pointer;
    width: 100%;
    height: 34px;
    .second-row {
      padding-left: 20px;
      line-height: 34px;
      font-size: 13px;
      span {
      }
      i {
        vertical-align: middle;
        &:before {
          font-size: 16px;
          color: $primary-color;
          margin-right: 7px;
        }
      }
      &:hover {
        background: $table-hover-color;
      }
      &.is-active {
        background: $table-hover-color;
        span {
          color: $primary-color;
        }
      }
      &:before {
        margin-right: 8px;
      }
    }
    &:after {
      content: '';
      width: 100%;
      height: 1px;
      margin-bottom: 4px;
      display: inline-block;
      background: $component-divide-color;
    }
  }
  .tree-icon {
    color: $primary-color;
  }
}
.el-dropdown {
  &:hover {
    .el-icon--right {
      &:before {
        color: #555;
      }
    }
  }
  .is-block {
    &:hover {
      .el-icon--right {
        &:before {
          color: #409eff;
        }
      }
    }
  }
}
</style>
