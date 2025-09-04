<template>
  <div class="udp-list-tab">
    <div class="upload-ele-outer">
      <el-upload
        style="display:none;"
        :action="$uploadUrlFormatter(uploadUrl)"
        :before-upload="showBegain"
        :on-error="onError"
        :on-success="onSuccess"
        :show-file-list="false"
        accept=".xlsx"
      >
        <el-button id="ban-upload-btn" v-if="!templateUploading" size="mini"
        ><i class="el-icon-upload"></i>
          {{ $v.udp.batchImport }}
        </el-button>
        <el-button v-else size="mini" disabled>
          <!-- 正在导入... -->
          {{ $v.udp.Importing }}
        </el-button>
      </el-upload>
    </div>
    <!--<div class="top-header-info-panel-wrapper">
      <b>{{ $v.udp.udpAttribute }}</b>
    </div>-->
    <div style="font-size: 12px;margin: 20px 20px;"><i class="iconfont icon-tips" style="margin-right: 6px;"></i>未搜索过滤的状态下，可以拖拽自定义属性所在的行以实现排序</div>
    <div class="top-title">

      <div class="search-box">
        <!--类型过滤的 tab页-->
        <datablau-tabs
          v-model="currentTab"
          type="card"
          @tab-click="onTabChange"
          style="display: inline-block;height: 38px;overflow:hidden;vertical-align: top;"
        >
          <el-tab-pane
            v-for="item in targetTypeArr"
            :label="item.label + `(${(targetCountMap && targetCountMap[item.typeId] && targetCountMap[item.typeId].length) || 0})`"
            :name="item.typeId+''"
            :key="item.typeId"
          ></el-tab-pane>
          <!--<el-tab-pane
            :label="`全部(${(targetCountMap && targetCountMap['all'] && targetCountMap['all'].length) || 0})`"
            name="all"
          ></el-tab-pane>-->
        </datablau-tabs>

        <!--请输入关键字-->
        <datablau-input
          size="small"
          :iconfont-state="true"
          v-model="keyword"
          placeholder="搜索属性名称"
          clearable
          style="display: inline-block;vertical-align: top;display: inline-block; margin-left: 10px;width: 200px;"
        ></datablau-input>
        <div class="top-button">
          <div class="right-btn-container">
            <datablau-button
              type="secondary"
              class="iconfont icon-up"
              :disabled="!currentRow"
              @click="upMoveCurrentRow">
              上移
            </datablau-button>
            <datablau-button
              type="secondary"
              class="iconfont icon-down"
              :disabled="!currentRow"
              @click="downMoveCurrentRow">
              下移
            </datablau-button>
            <datablau-button
              type="primary"
              size="mini"
              @click="updateCommonUdp"
              style="display: inline-block; vertical-align: top;">
              同步公共UDP
            </datablau-button>
            <datablau-button
              type="primary"
              size="mini"
              @click="addUdpTab"
              style="vertical-align: top;margin-right: 20px;"
              class="iconfont icon-tianjia"
            >
              &nbsp;{{ $v.udp.createAttribute }}
            </datablau-button>
          </div>
        </div>
      </div>
    </div>
    <datablau-form-submit class="submit-component rule-table">
      <datablau-table
        :data="tableData"
        row-class-name="row-can-click1"
        row-key="udpId"
        height="100%"
        highlight-current-row
        :data-selectable="true"
        @current-change="handleTableCurrentChange"
        @selection-change="handleSelectionChange"
      >
        <!--属性名称-->
        <el-table-column
          prop="name"
          :label="this.$v.udp.name"
          show-overflow-tooltip
          min-width="150px"
        >
        </el-table-column>

        <!--属性名称对象-->
        <el-table-column
          width="100"
          prop="typeId"
          :label="this.$v.udp.objectHierarchy"
          show-overflow-tooltip
          v-if="currentTab === 'all'"
        >
          <template slot-scope="scope">
            <span class="type-box " :class="'a' + scope.row.typeId">{{ typeIdArr[scope.row.targetTypes[0]] }}</span>
          </template>
        </el-table-column>

        <!--数据类型-->
        <el-table-column
          prop="valueType"
          :label="this.$v.udp.dataType"
          show-overflow-tooltip
          width="100"
        >
        </el-table-column>

        <!--属性分类-->
        <el-table-column
          prop="category"
          :label="this.$v.udp.attributeClassIfication"
          show-overflow-tooltip
          min-width="150px"
        >
        </el-table-column>

        <!--属性分页-->
        <el-table-column
          prop="tabPage"
          label="属性分页"
          show-overflow-tooltip
          min-width="150px"
        >
        </el-table-column>

        <!--业务条线-->
        <!--<el-table-column
          prop="categories"
          :label="this.$v.udp.BelongingbusinessLine"
          show-overflow-tooltip
          min-width="150px"
          :formatter="businessLineFormatter"
          sortable="custom"
        >
        </el-table-column>-->

        <!--描述-->
        <el-table-column
          prop="description"
          :label="this.$v.udp.description"
          show-overflow-tooltip
          width="150"
        >
        </el-table-column>

        <!--操作-->
        <el-table-column
          :label="$v.RuleChecking.operation"
          width="160"
          header-align="center"
          align="center"
          fixed="right"
        >
          <template slot-scope="scope">
            <!--<datablau-button-->
            <!--  type="text"-->
            <!--  @click="seeRules(scope.row, 'see')"-->
            <!--&gt;-->
            <!--  <datablau-tooltip-->
            <!--    effect="dark"-->
            <!--    :content="$v.RuleChecking.see"-->
            <!--    placement="bottom"-->
            <!--  >-->
            <!--    <i class="iconfont icon-see"></i>-->
            <!--  </datablau-tooltip>-->
            <!--</datablau-button>-->

            <!--编辑-->
            <datablau-button
              type="icon"
              :tooltip-content="scope.row.udpId < 70000000 ? '公共UDP禁止编辑' : $v.RuleChecking.edit"
              class="iconfont icon-bianji"
              :disabled="scope.row.udpId < 70000000"
              @click="editUdp(scope.row, 'edit')"
            >
              <!--<datablau-tooltip-->
              <!--  effect="dark"-->
              <!--  :content="$v.RuleChecking.edit"-->
              <!--  placement="bottom"-->
              <!--&gt;-->
              <!--  <i class="iconfont icon-bianji"></i>-->
              <!--</datablau-tooltip>-->
            </datablau-button>

            <!--删除-->
            <datablau-button
              type="icon"
              :tooltip-content="$v.RuleChecking.delete"
              class="iconfont icon-delete"
              @click="deleteUdpItem(scope.row)"
            >
              <!--<datablau-tooltip-->
              <!--  effect="dark"-->
              <!--  :content="$v.RuleChecking.delete"-->
              <!--  placement="bottom"-->
              <!--&gt;-->
              <!--  <i class="iconfont icon-delete"></i>-->
              <!--</datablau-tooltip>-->
            </datablau-button>
          </template>
        </el-table-column>
      </datablau-table>
      <template slot="buttons">

        <div class="footer-tool" v-show="selection.length > 0">
          <div class="disc-text">
            当前选中“{{ selection.length }}条”信息，是否
          </div>
          <datablau-button @click="deleteBatch" type="danger" class="el-icon-delete">
            删除
          </datablau-button>
        </div>
        <div class="operation-btn">
          <!--<datablau-pagination
            style="display: inline-block;vertical-align: middle;margin-right: 10px;"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            :page-size="pageSize"
            :page-sizes="[20, 50, 100]"
            :current-page.sync="currentPage"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          ></datablau-pagination>-->
          <datablau-button @click="udpChangedCancel">取消</datablau-button>
          <datablau-button @click="udpChangedConfirm" type="important">确定</datablau-button>
        </div>
      </template>
    </datablau-form-submit>
  </div>
</template>

<script>
import $ from 'jquery'
import _ from 'lodash'
import HTTP from '@/resource/http.js'
import LDMTypes from '@constant/LDMTypes'
import sort from '@/resource/utils/sort'
import Sortable from 'sortablejs'

export default {
  data () {
    return {
      currentRow: null,
      currentId: 60000000,
      udpCopy: _.cloneDeep(this.dataByType.udp),
      allUdpPromise: null,

      // *** tab with table ***
      tabName: this.$v.udp.udpAttribute,
      totalShow: 0,
      columnDefs: [],
      hideTopLine: false,
      tableOption: {
        // rowSelection: 'single',
      },
      tableHidePagination: false,
      defaultParaData: {
        currentPage: 1,
        pageSize: 20
      },
      selection: [],
      actionsArr: [],

      // *** edit dialog ***
      dialogVisible: false,
      dialogType: 'categories',
      editUdpData: {
        udp: '',
        id: ''
      },
      currentUdpId: '',
      dialogTitle: this.$v.udp.createBusinessLine, // '编辑业务条线',
      isAddUdp: false,
      uploadUrl: HTTP.uploadUrl.udpTemplate,
      templateUploading: false,
      currentTab: LDMTypes.ModelMart + '',
      targetCountMap: {},
      nameArr: [], // 业务条线名称数组
      pageSize: 20,
      currentPage: 1,
      keyword: '',
      sortData: { prop: 'name', order: 'ascending' },
      tableData: [],
      total: 0,
      typeIdArr: {
        [LDMTypes.ModelMart]: '模型', // '模型'
        [LDMTypes.Diagram]: this.$v.udp.category, // '主题域'
        [LDMTypes.BusinessObject]: '业务对象', // '业务对象'
        '80000004': this.$v.RuleChecking.table, // '表',
        '80500008': this.$v.RuleChecking.view, // '视图',
        '80000005': this.$v.RuleChecking.column, // '字段',
        '80000093': this.$v.RuleChecking.keyValue // '键值'
      }
    }
  },
  components: {
    // tabWithTable,
    // udpHistory,
    // eslint-disable-next-line vue/no-unused-components
    valueTypeCom: {
      render (h) {
        return h('span', {
          class: this.params.data.valueType
        }, this.params.data.valueType)
      }
    },
    // eslint-disable-next-line vue/no-unused-components
    operationCom: {
      render (h) {
        return h('div', [
          h('i', {
            class: 'el-icon-edit-outline',
            style: {
              fontSize: '16px',
              color: '#7D8493',
              marginRight: '20px',
              cursor: 'pointer'
            },
            on: {
              click: () => this.params.tabComponent.editUdp(this.params)
            }
          }),
          h('i', {
            class: 'el-icon-delete',
            style: {
              fontSize: '16px',
              color: '#7D8493',
              marginRight: '20px',
              cursor: 'pointer'
            },
            on: {
              click: () => this.params.tabComponent.deleteUdpItem(this.params)
            }
          }),
          h('i', {
            class: 'show-history',
            on: {
              click: () => { this.params.tabComponent.showHistory(this.params) }
            }
          })
        ])
      }
    }
  },
  props: {
    refreshUdpCategories: {
      type: Function,
      required: true
    },
    valueTypeArr: {
      type: Array,
      required: true
    },
    targetTypeArr: {
      type: Array,
      required: true
    },
    dataByType: {

    },
    Changes: {

    },
    graph: {

    },
    LayerEdit: {

    }
  },
  beforeMount () {
    this.dataInit()
    let formatterTime = (data) => {
      let t = this.$timeFormatter(data.value)
      return t
    }
    let targetFomatter = (data) => {
      let typeId = parseInt(data.value[0])
      let target = this.targetTypeArr.find(item => item.typeId === typeId) || {}
      return target.label
    }
    let categoriesFomatter = (data) => {
      let arr = ''
      let result = ''
      if (data.value && Array.isArray(data.value) && data.value.length > 0) {
        arr = data.value.map(item => item.name)
        result = arr.join(',')
      } else {
        result = this.$v.udp.overall // '全局'
      }
      return result
    }
    let typeFormatter = (data) => {
      let result = ''
      this.valueTypeArr.forEach(item => {
        if (data.value === item.value) {
          result = item.label
        }
      })
      return result
    }
    // let columnDefs = [
    //   {
    //     // 对象层级
    //     headerName: this.$v.udp.objectHierarchy,
    //     field: 'targetTypes',
    //     // tooltipField: 'targetTypes',
    //     valueFormatter: targetFomatter,
    //     tooltipValueGetter: targetFomatter,
    //     width: 150,
    //     minWidth: 150,
    //     type: ['customFilter'],
    //     filterParams: {
    //       getFilterItem: this.getTargetFilterItem
    //     }
    //   },
    //   {
    //     headerName: this.$v.udp.name,
    //     field: 'name',
    //     tooltipField: 'name',
    //     // width: 150,
    //     minWidth: 150,
    //     type: ['customSortCol']
    //   },
    //   {
    //     headerName: this.$v.udp.dataType, // 数据类型
    //     field: 'valueType',
    //     // tooltipField: 'valueType',
    //     valueFormatter: typeFormatter,
    //     tooltipValueGetter: typeFormatter,
    //     width: 100,
    //     minWidth: 100,
    //     type: ['customFilter'],
    //     filterParams: {
    //       getFilterItem: this.getFilterItem
    //     },
    //     cellRendererFramework: 'valueTypeCom'
    //   },
    //   {
    //     headerName: this.$v.udp.defaultValue, // 默认值
    //     field: 'defaultValue',
    //     tooltipField: 'defaultValue',
    //     // width: 100,
    //     minWidth: 100
    //     // type: ['customSortCol'],
    //   },
    //   {
    //     headerName: this.$v.udp.description, // 备注
    //     field: 'description',
    //     tooltipField: 'description',
    //     // width: 150,
    //     minWidth: 150
    //     // type: ['customSortCol'],
    //   },
    //   {
    //     headerName: this.$v.udp.BelongingbusinessLine, // '所属业务条线',
    //     field: 'categories',
    //     // tooltipField: 'description',
    //     valueFormatter: categoriesFomatter,
    //     tooltipValueGetter: categoriesFomatter,
    //     // width: 150,
    //     minWidth: 150,
    //     type: ['customFilter'],
    //     filterParams: {
    //       getFilterItem: this.getCateFilterItem
    //     }
    //   },
    //   {
    //     headerName: this.$v.udp.modificationTime, // '修改时间',
    //     field: 'creationTimestamp',
    //     // tooltipField: 'createTime',
    //     valueFormatter: formatterTime,
    //     tooltipValueGetter: formatterTime,
    //     width: 150,
    //     suppressSizeToFit: true,
    //     type: ['customSortCol']
    //   },
    //   {
    //     headerName: this.$v.udp.attributeClassIfication, // '属性分类',
    //     field: 'category',
    //     tooltipField: 'category',
    //     // valueFormatter: categoriesFomatter,
    //     // tooltipValueGetter: categoriesFomatter,
    //     // width: 150,
    //     minWidth: 150,
    //     type: ['customFilter'],
    //     filterParams: {
    //       getFilterItem: this.getTypeFilterItem
    //     }
    //   },
    //   {
    //     headerName: this.$v.udp.operation, // '操作',
    //     width: 150,
    //     type: ['optionsWithContent'],
    //     cellRendererFramework: 'optionCol',
    //     // cellRendererParams: { tabComponent: this }
    //     cellRendererParams: {
    //       tabComponent: this,
    //       options: [
    //         { name: 'edit', icon: 'iconfont icon-bianji', text: '编辑', method: 'editUdp' },
    //         { name: 'remove', icon: 'iconfont icon-delete', text: '删除', method: 'deleteUdpItem' },
    //         { name: 'history', icon: 'iconfont icon-History', text: '历史', method: 'showHistory' }
    //       ]
    //     }
    //   }
    // ]
    // this.columnDefs = columnDefs

    let options = [
      {
        icon: 'iconfont icon-download',
        label: this.$v.udp.download, // '下载模版',
        callback: this.downloadTemplate
      },
      {
        icon: 'iconfont icon-import',
        label: this.$v.udp.batchImport, // '批量导入',
        callback: () => {
          if (!this.templateUploading) {
            $('#ban-upload-btn').click()
          } else {
            this.$datablauMessage.warning(this.$v.udp.ImportingPlase)
          }
        }
      },
      {
        icon: 'iconfont icon-export',
        label: this.$v.udp.batchExport, // '批量导出',
        callback: () => {
          this.exportUdps()
        }
      },
      {
        icon: 'iconfont icon-shezhi',
        label: this.$v.udp.businessline, // '业务条线',
        callback: this.showCategoryDialog
      }
    ]
    this.actionsArr = options
  },
  computed: {
    editBottomItemConfirm () {
      let bool = false
      bool = !!(this.editUdpData && this.editUdpData.udp)
      return bool
    },
    couldDeleteBatch () {
      let arr = this.selection
      return arr && Array.isArray(arr) && arr.length > 0
    }
  },
  mounted () {
    this.$bus.$on('modifyUdp', this.modifyUdp)
    this.$bus.$on('addUdp', this.addUdp)
    this.rowDrop()
  },
  beforeDestroy () {
    this.$bus.$off('modifyUdp')
    this.$bus.$off('addUdp')
  },
  methods: {
    updateCommonUdp () {
      this.$http.get(this.$url + '/udps/').then(res => {
        let udpList = res.data
        sort.sortConsiderChineseNumber(udpList, 'order', 'ascending')
        udpList.forEach(udp => {
          if (this.udpCopy.get(udp.udpId)) {
            let udpCopyItem = {
              ExtendedEnumStruct: udp.enumValues?.length ? JSON.stringify(udp.enumValues) : '',
              UniqueId: udp.id,
              ExtendedEnumMultiple: udp.multiSelect,
              FriendlyName: udp.name,
              IsRequired: udp.needed,
              entityType: udp.targetTypes[0],
              Id: udp.udpId,
              UdpValueType: udp.valueType,
              ClassName: udp.category,
              Definition: udp.description,
              PageName: udp.tabPage,
              new: false,
              deleted: false,
              modified: true,
              pStructId: udp.udpId + 1,
              ExtendedEnumParentRef: udp.parentUdpId,
              DefaultUDPValue: udp.defaultValue ? udp.defaultValue : ''
              // UDPOrder: udp.UDPOrder
            }
            _.merge(this.udpCopy.get(udp.udpId), udpCopyItem)
          } else {
            this.udpCopy.set(udp.udpId, {
              ExtendedEnumStruct: udp.enumValues?.length ? JSON.stringify(udp.enumValues) : '',
              UniqueId: udp.id,
              ExtendedEnumMultiple: udp.multiSelect,
              FriendlyName: udp.name,
              IsRequired: udp.needed,
              entityType: udp.targetTypes[0],
              Id: udp.udpId,
              UdpValueType: udp.valueType,
              ClassName: udp.category,
              Definition: udp.description,
              PageName: udp.tabPage,
              new: true,
              deleted: false,
              modified: false,
              pStructId: udp.udpId + 1,
              ExtendedEnumParentRef: udp.parentUdpId,
              DefaultUDPValue: udp.defaultValue ? udp.defaultValue : '',
              // UDPOrder: udp.UDPOrder,
              TypeId: 90002032
            })
          }
        })
        if (res.data?.length) {
          this.allUdpPromise = new Promise((resolve, reject) => {
            resolve([...this.udpCopy.values()].filter(item => !item.deleted).map(item => ({
              enumValues: item.ExtendedEnumStruct ? JSON.parse(item.ExtendedEnumStruct) : [],
              id: item.UniqueId,
              multiSelect: item.ExtendedEnumMultiple,
              name: item.FriendlyName,
              needed: item.IsRequired,
              targetTypes: [item.entityType],
              udpId: item.Id,
              valueType: item.UdpValueType,
              category: item.ClassName,
              description: item.Definition,
              tabPage: item.PageName,
              new: item.new,
              deleted: item.deleted,
              modified: item.modified,
              pStructId: item.pStructId,
              parentUdpId: item.ExtendedEnumParentRef,
              defaultValue: item.DefaultUDPValue,
              UDPOrder: item.UDPOrder
            })))
          })
          this.allUdpPromise.then(res => {
            let data = res
            this.$store.commit('changeNameArr', data)
            this.refreshUdpCategories(data)
          }).catch(err => {
            console.log(err)
          })
          this.$emit('removeTab')
          this.handleFilterChange()
        }
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    upMoveCurrentRow () {
      if (this.currentRow) {
        let index = this.tableData.findIndex(item => item.udpId === this.currentRow.udpId)
        if (index !== 0) {
          this.tableData.splice(index - 1, 0, this.tableData.splice(index, 1)[0])
          this.updateOrder()
        }
      }
    },
    downMoveCurrentRow () {
      if (this.currentRow) {
        let index = this.tableData.findIndex(item => item.udpId === this.currentRow.udpId)
        if (index !== this.tableData.length - 1) {
          this.tableData.splice(index + 1, 0, this.tableData.splice(index, 1)[0])
          this.updateOrder()
        }
      }
    },
    handleTableCurrentChange (val) {
      this.currentRow = val
    },
    rowDrop () {
      const tbody = document.querySelector('.submit-component .el-table__body-wrapper tbody')
      const _this = this
      this.sortObj = Sortable.create(tbody, {
        onEnd ({ newIndex, oldIndex }) {
          const currRow = _this.tableData.splice(oldIndex, 1)[0]
          _this.tableData.splice(newIndex, 0, currRow)
          _this.updateOrder()
        }
      })
    },
    updateOrder () {
      this.tableData.filter(item => !item.deleted).forEach((item, index) => {
        item.UDPOrder = index
        item.modified = true
        let udp = this.udpCopy.get(item.udpId)
        udp.UDPOrder = index
        udp.modified = true
      })
    },
    udpChangedCancel () {
      this.$emit('closeDialog')
    },
    udpChangedConfirm () {
      if (JSON.stringify(this.dataByType.udp) === JSON.stringify(this.udpCopy)) {
        this.$emit('closeDialog')
        return
      }
      let change = new (this.Changes)('modifyUdps', {
        name: '',
        pre: _.cloneDeep(this.dataByType.udp),
        now: _.cloneDeep(this.udpCopy)
      })
      this.graph.editor.undoManager.undoableEditHappened(new (this.LayerEdit)([change]))
      this.dataByType.udp = this.udpCopy
      this.$emit('closeDialog')
    },
    addUdp (udp) {
      udp.udpId = this.currentId++
      udp.pStructId = this.currentId++
      // if (this.tableData.some(item => item.UDPOrder && !item.deleted)) {
      if (this.tableData.length) {
        udp.UDPOrder = +(this.tableData[this.tableData.length - 1].UDPOrder) + 1
      } else {
        udp.UDPOrder = 1
      }
      // }
      this.udpCopy.set(udp.udpId, {
        ExtendedEnumStruct: udp.enumValues?.length ? JSON.stringify(udp.enumValues) : '',
        UniqueId: udp.id,
        ExtendedEnumMultiple: udp.multiSelect,
        FriendlyName: udp.name,
        IsRequired: udp.needed,
        entityType: udp.targetTypes[0],
        Id: udp.udpId,
        UdpValueType: udp.valueType,
        ClassName: udp.category,
        Definition: udp.description,
        PageName: udp.tabPage,
        new: udp.new,
        deleted: udp.deleted,
        modified: udp.modified,
        pStructId: udp.pStructId,
        ExtendedEnumParentRef: udp.parentUdpId,
        DefaultUDPValue: udp.defaultValue,
        UDPOrder: udp.UDPOrder,
        TypeId: 90002032
      })
      this.allUdpPromise = new Promise((resolve, reject) => {
        resolve([...this.udpCopy.values()].filter(item => !item.deleted).map(item => ({
          enumValues: item.ExtendedEnumStruct ? JSON.parse(item.ExtendedEnumStruct) : [],
          id: item.UniqueId,
          multiSelect: item.ExtendedEnumMultiple,
          name: item.FriendlyName,
          needed: item.IsRequired,
          targetTypes: [item.entityType],
          udpId: item.Id,
          valueType: item.UdpValueType,
          category: item.ClassName,
          description: item.Definition,
          tabPage: item.PageName,
          new: item.new,
          deleted: item.deleted,
          modified: item.modified,
          pStructId: item.pStructId,
          parentUdpId: item.ExtendedEnumParentRef,
          defaultValue: item.DefaultUDPValue,
          UDPOrder: item.UDPOrder
        })))
      })
      this.allUdpPromise.then(res => {
        let data = res
        this.$store.commit('changeNameArr', data)
        this.refreshUdpCategories(data)
      }).catch(err => {
        console.log(err)
      })
      this.$emit('removeTab')
      this.handleFilterChange()
    },
    modifyUdp (udp) {
      let udpCopyItem = {
        ExtendedEnumStruct: udp.enumValues?.length ? JSON.stringify(udp.enumValues) : '',
        UniqueId: udp.id,
        ExtendedEnumMultiple: udp.multiSelect,
        FriendlyName: udp.name,
        IsRequired: udp.needed,
        entityType: udp.targetTypes[0],
        Id: udp.udpId,
        UdpValueType: udp.valueType,
        ClassName: udp.category,
        Definition: udp.description,
        PageName: udp.tabPage,
        new: udp.new,
        deleted: udp.deleted,
        modified: udp.modified,
        pStructId: udp.pStructId,
        ExtendedEnumParentRef: udp.parentUdpId,
        DefaultUDPValue: udp.defaultValue,
        UDPOrder: udp.UDPOrder
      }
      _.merge(this.udpCopy.get(udp.udpId), udpCopyItem)
      // this.udpCopy.set(udp.udpId, {
      //   ExtendedEnumStruct: JSON.stringify(udp.enumValues),
      //   UniqueId: udp.id,
      //   ExtendedEnumMultiple: udp.multiSelect,
      //   FriendlyName: udp.name,
      //   IsRequired: udp.needed,
      //   entityType: udp.targetTypes[0],
      //   Id: udp.udpId,
      //   UdpValueType: udp.valueType,
      //   ClassName: udp.category,
      //   Definition: udp.description,
      //   PageName: udp.tabPage,
      //   new: udp.new,
      //   deleted: udp.deleted,
      //   modified: udp.modified,
      //   pStructId: udp.pStructId,
      //   ExtendedEnumParentRef: udp.parentUdpId,
      //   UDPOrder: udp.UDPOrder
      // })
      this.allUdpPromise = new Promise((resolve, reject) => {
        resolve([...this.udpCopy.values()].filter(item => !item.deleted).map(item => ({
          enumValues: item.ExtendedEnumStruct ? JSON.parse(item.ExtendedEnumStruct) : [],
          id: item.UniqueId,
          multiSelect: item.ExtendedEnumMultiple,
          name: item.FriendlyName,
          needed: item.IsRequired,
          targetTypes: [item.entityType],
          udpId: item.Id,
          valueType: item.UdpValueType,
          category: item.ClassName,
          description: item.Definition,
          tabPage: item.PageName,
          new: item.new,
          deleted: item.deleted,
          modified: item.modified,
          pStructId: item.pStructId,
          parentUdpId: item.ExtendedEnumParentRef,
          defaultValue: item.DefaultUDPValue,
          UDPOrder: item.UDPOrder
        })))
      })
      this.allUdpPromise.then(res => {
        let data = res
        this.$store.commit('changeNameArr', data)
        this.refreshUdpCategories(data)
      }).catch(err => {
        console.log(err)
      })
      this.$emit('removeTab')
      this.handleFilterChange()
    },
    dataInit () {
      for (let udp of this.udpCopy.values()) {
        if (udp.Id > this.currentId) {
          this.currentId = udp.Id
        }
      }
      this.currentId += 2 // udp有两部分组成（定义，类型），所有加2
      if (this.currentId < 70000000) {
        this.currentId = 70000000
      }
      // this.allUdpPromise = HTTP.getUdpList({})
      this.allUdpPromise = new Promise((resolve, reject) => {
        resolve([...this.udpCopy.values()].filter(item => !item.deleted).map(item => ({
          enumValues: item.ExtendedEnumStruct ? JSON.parse(item.ExtendedEnumStruct) : [],
          id: item.UniqueId,
          multiSelect: item.ExtendedEnumMultiple,
          name: item.FriendlyName,
          needed: item.IsRequired,
          targetTypes: [item.entityType],
          udpId: item.Id,
          valueType: item.UdpValueType,
          category: item.ClassName,
          description: item.Definition,
          tabPage: item.PageName,
          new: item.new,
          deleted: item.deleted,
          modified: item.modified,
          pStructId: item.pStructId,
          parentUdpId: item.ExtendedEnumParentRef,
          defaultValue: item.DefaultUDPValue,
          UDPOrder: item.UDPOrder
        })))
      })
      this.allUdpPromise
        .then(res => {
          let data = res
          this.$store.commit('changeNameArr', data)
          this.refreshUdpCategories(data)
        })
        .catch(err => {
          console.log(err)
        })

      this.handleFilterChange()
    },
    // *** tab with table ***
    getShowData (para) {
      // console.log(para, 'para')
      return new Promise((resolve, reject) => {
        let currentPage = para.currentPage
        let pageSize = para.pageSize
        let keyword = para.keyword || ''

        this.allUdpPromise
          .then(res => {
            let data = res

            // 根据tab过滤
            let targetCountMap = {}
            this.targetTypeArr.forEach(item => {
              targetCountMap[item.typeId] = []
            })
            data.forEach(item => {
              let targetTypes = item.targetTypes[0] + '' || ''
              if (targetCountMap[targetTypes]) {
                targetCountMap[targetTypes].push(item)
              }
            })
            targetCountMap.all = data || []
            this.targetCountMap = targetCountMap

            if (this.currentTab !== 'all') {
              data = targetCountMap[this.currentTab] || []
            }
            if (data.some(item => item.UDPOrder)) {
              data.sort((a, b) => {
                if (a.UDPOrder !== undefined && b.UDPOrder !== undefined) {
                  return +a.UDPOrder - +b.UDPOrder
                } else if (a.UDPOrder !== undefined) {
                  return false
                } else if (b.UDPOrder !== undefined) {
                  return true
                } else {
                  return a.udpId - b.udpId
                }
              })
            }

            if (!data || !Array.isArray(data)) {
              data = []
            }

            // 根据关键词过滤
            let keyword = para.keyword || ''
            keyword = _.trim(keyword)
            if (keyword) {
              let result = []
              keyword = keyword.toLowerCase()
              let name = ''
              data.forEach(item => {
                name = item.name || ''
                name = name.toLowerCase()
                let index = name.indexOf(keyword)
                if (index !== -1) {
                  result.push(item)
                }
              })
              data = result
            }
            this.total = data.length || 0

            // if (para.filterType && para.filterType.valueType && Array.isArray(para.filterType.valueType) && para.filterType.valueType.length > 0) {
            //   let arr = []
            //   let choosedMap = {}
            //   para.filterType.valueType.forEach(item => {
            //     item = item.toLowerCase()
            //     choosedMap[item] = true
            //   })
            //   // console.log(choosedMap, 'choosedMap')
            //   data.forEach(item => {
            //     let valueType = (item.valueType || '').toLowerCase()
            //     if (choosedMap[valueType]) {
            //       arr.push(item)
            //     }
            //   })
            //   data = arr
            // }
            // // targetTypes
            // if (para.filterType && para.filterType.targetTypes && Array.isArray(para.filterType.targetTypes) && para.filterType.targetTypes.length > 0) {
            //   let arr = []
            //   let choosedMap = {}
            //   this.targetTypeArr.forEach(item => {
            //     let label = item.label
            //     if (para.filterType.targetTypes.some(targetType => targetType === label)) {
            //       choosedMap[item.typeId] = true
            //     }
            //   })
            //   // console.log(choosedMap, 'choosedMap')
            //   data.forEach(item => {
            //     let targetTypes = parseInt(item.targetTypes[0])
            //     if (choosedMap[targetTypes]) {
            //       arr.push(item)
            //     }
            //   })
            //   data = arr
            // }
            //
            // // categories
            // if (para.filterType && para.filterType.categories && Array.isArray(para.filterType.categories) && para.filterType.categories.length > 0) {
            //   let arr = []
            //   let choosedMap = {
            //     'Overall Situation': true
            //   }
            //   this.$globalData.udpCategories.forEach(item => {
            //     let label = item.name
            //     if (para.filterType.categories.some(catStr => catStr === label)) {
            //       choosedMap[this.$v.udp.overall] = false
            //       choosedMap[item.id] = true
            //     }
            //   })
            //   // console.log(choosedMap, 'choosedMap')
            //   data.forEach(item => {
            //     let bool = item.categories.some(item => choosedMap[item.id])
            //     if (!item.categories || !Array.isArray(item.categories) || item.categories.length === 0) {
            //       // 全局
            //       bool = choosedMap[this.$v.udp.overall]
            //     }
            //     if (bool) {
            //       arr.push(item)
            //     }
            //   })
            //   data = arr
            // }
            //
            // // type
            // if (para.filterType && para.filterType.category && Array.isArray(para.filterType.category) && para.filterType.category.length > 0) {
            //   let arr = []
            //   let choosedMap = {}
            //   this.$globalData.udpCategoryArr.forEach(item => {
            //     // choosedMap[item] = true
            //     if (para.filterType.category.some(catStr => catStr === item)) {
            //       choosedMap[item] = true
            //     }
            //   })
            //   data.forEach(item => {
            //     let bool = choosedMap[item.category]
            //     if (bool) {
            //       arr.push(item)
            //     }
            //   })
            //   data = arr
            // }
            //
            // // if (para.sortData && para.sortData.colId) {
            // //   let colId = para.sortData.colId
            // //   let order = para.sortData.sort === 'asc' ? 'ascending' : 'descending'
            // //   sort.sortConsiderChineseNumber(data, colId, order)
            // // }
            //
            // // 排序
            //
            // // 增加 typeId 用于排序
            // data.forEach(item => {
            //   item.typeId = item.targetTypes[0] || ''
            //   item.categoriesStr = item.categories?.map(item => item.name).join(',') || ''
            // })
            // if (this.sortData && this.sortData.prop) {
            //   if (this.sortData.prop === 'categories') {
            //     sort.sortConsiderChineseNumber(data, 'categoriesStr', this.sortData.order || 'ascending')
            //   } else {
            //     sort.sortConsiderChineseNumber(data, this.sortData.prop, this.sortData.order || 'ascending')
            //   }
            // }

            this.totalShow = data.length

            let s = para.pageSize
            let c = para.currentPage

            // let arr = data.slice(s * (c - 1), s * c)
            resolve(data)
          })
          .catch(e => {
            this.$showFailure(e)
            reject(e)
          })
      })
    },
    gridSelectionChanged (para) {
      let api = para.api
      let arr = api.getSelectedNodes()
      let result = []
      arr.forEach(item => {
        result.push(item.data)
      })
      this.selection = result
      // console.log(this.selection, 'selection')
    },
    handleSelectionChange (result) {
      this.selection = result
    },
    // table filter
    getFilterItem () {
      return new Promise((resolve, reject) => {
        let result = this.valueTypeArr.map(item => item.label)
        resolve(result)
      })
    },
    getTargetFilterItem () {
      return new Promise((resolve, reject) => {
        let result = this.targetTypeArr.map(item => item.label)
        resolve(result)
      })
    },
    getCateFilterItem () {
      return new Promise((resolve, reject) => {
        let result = this.$globalData.udpCategories.map(item => item.name)
        result.push(this.$v.udp.overall)
        resolve(result)
      })
    },
    getTypeFilterItem () {
      return new Promise((resolve, reject) => {
        resolve(this.$globalData.udpCategoryArr)
      })
    },

    addUdpTab () {
      this.$emit('addUdpTab', { currentTab: this.currentTab })
    },

    // *** edit dialog ***
    showCategoryDialog () {
      this.dialogTitle = this.$v.udp.EditBusinessLines // '编辑业务条线'
      this.dialogType = 'categories'
      this.dialogVisible = true
    },
    editUdp (data) {
      this.$emit('addUdpTab', data)
    },
    deleteUdpItem (data) {
      this.$DatablauCofirm('确认删除？', this.$v.udp.Tips, {
        type: 'warning',
        customClass: 'width500'
      }).then(() => {
        let id = data.udpId
        let udp = this.udpCopy.get(id)
        udp.deleted = true
        this.udpCopy.set(id, udp)
        this.allUdpPromise = new Promise((resolve, reject) => {
          resolve([...this.udpCopy.values()].filter(item => !item.deleted).map(item => ({
            enumValues: item.ExtendedEnumStruct ? JSON.parse(item.ExtendedEnumStruct) : [],
            id: item.UniqueId,
            multiSelect: item.ExtendedEnumMultiple,
            name: item.FriendlyName,
            needed: item.IsRequired,
            targetTypes: [item.entityType],
            udpId: item.Id,
            valueType: item.UdpValueType,
            category: item.ClassName,
            description: item.Definition,
            tabPage: item.PageName,
            new: item.new,
            deleted: item.deleted,
            modified: item.modified,
            pStructId: item.pStructId,
            parentUdpId: item.ExtendedEnumParentRef,
            defaultValue: item.DefaultUDPValue,
            UDPOrder: item.UDPOrder
          })))
        })
        this.allUdpPromise.then(res => {
          let data = res
          this.$store.commit('changeNameArr', data)
          this.refreshUdpCategories(data)
        }).catch(err => {
          console.log(err)
        })
        this.handleFilterChange()
      }).catch((e) => {
        console.info(e)
      })
    },
    // saveEditObj () {
    //   if (this.editUdpData && this.editUdpData.udp) {
    //     let method = this.isAddUdp ? 'put' : 'post'
    //     let sucMsg = this.isAddUdp ? '添加成功' : '修改成功'
    //     let synonymContent = this.editUdpData.udp || ''
    //     let id = this.editUdpData.id || ''
    //     let url = ''
    //     if (this.isAddUdp) {
    //       url = `${this.$url}/service/synonym/?synonymContent=${synonymContent}`
    //     } else {
    //       url = `${this.$url}/service/synonym/?synonymContent=${synonymContent}&id=${id}`
    //       if (!id) {
    //         this.$showFailure('id不能为空')
    //         return
    //       }
    //     }
    //     this.$http[method](url)
    //       .then(res => {
    //         // console.log(res, 'res')
    //         this.$datablauMessage.success(sucMsg)
    //         this.dialogVisible = false
    //         this.refreshTable()
    //       })
    //       .catch(e => {
    //         this.$showFailure(e)
    //       })
    //   } else {
    //     this.$showFailure('内容不能为空')
    //   }
    // },
    showHistory (data) {
      this.$emit('showHistory', data)
    },
    refreshTable () {
      this.dataInit()
      if (this.$refs.udpTable && this.$refs.udpTable.refreshData) {
        this.$refs.udpTable.refreshData()
      }
    },
    deleteItem (para, callback) {
      let delpara = {
        udpId: para.id,
        successCallback: callback,
        failureCallback: e => {
          this.$showFailure(e)
        }
      }
      HTTP.deleteUdp(delpara)
    },

    // async delete  udp item
    async deleteItemAsync (para, callback) {
      this.deleteItem(para, callback)
      // let id = para.id
      // let url = `${this.$url}/service/synonym/?id=${id}`

      // await this.$http.delete(url)
      // callback && callback()
    },

    deleteBatch () {
      let arr = this.selection.map(item => {
        let obj = {
          id: item.udpId
        }
        return obj
      })
      // let arr = this.selection.map(item => {id:item.id});
      let callback = () => {
        this.$datablauMessage.success(this.$v.udp.deletedSuccessfully)
        this.refreshTable()
      }
      // let para = {
      //   fun: this.deleteItemAsync,
      //   paraArr: arr,
      //   callback
      // }
      this.$confirm('确认删除？', this.$v.udp.Tips, {
        type: 'warning'
      }).then(() => {
        // this.seriesFunCallback(para)
        arr.forEach(item => {
          let id = item.id
          let udp = this.udpCopy.get(id)
          udp.deleted = true
          this.udpCopy.set(id, udp)
        })
        this.allUdpPromise = new Promise((resolve, reject) => {
          resolve([...this.udpCopy.values()].filter(item => !item.deleted).map(item => ({
            enumValues: item.ExtendedEnumStruct ? JSON.parse(item.ExtendedEnumStruct) : [],
            id: item.UniqueId,
            multiSelect: item.ExtendedEnumMultiple,
            name: item.FriendlyName,
            needed: item.IsRequired,
            targetTypes: [item.entityType],
            udpId: item.Id,
            valueType: item.UdpValueType,
            category: item.ClassName,
            description: item.Definition,
            tabPage: item.PageName,
            new: item.new,
            deleted: item.deleted,
            modified: item.modified
          })))
        })
        this.allUdpPromise.then(res => {
          let data = res
          this.$store.commit('changeNameArr', data)
          this.refreshUdpCategories(data)
        }).catch(err => {
          console.log(err)
        })
        this.handleFilterChange()
      }).catch(e => console.info(e))
    },
    seriesFunCallback ({ fun, paraArr, callback }) {
      let delCallback = null
      let nextCallback = () => {
        paraArr.shift()
        this.seriesFunCallback({ fun, paraArr, callback })
      }
      let obj = null
      if (paraArr && Array.isArray(paraArr) && paraArr.length > 1) {
        delCallback = nextCallback
        obj = paraArr[0]
      } else if (paraArr && Array.isArray(paraArr) && paraArr.length === 1) {
        obj = paraArr[0]
        delCallback = () => {
          paraArr.shift()
          callback && callback()
        }
      } else {
        callback && callback()
      }
      try {
        obj && fun(obj, delCallback)
      } catch (e) {
        this.$showFailure(e)
      }
    },
    tableLayout () {
      if (this.$refs.udpTable && this.$refs.udpTable.resetTableStyle) {
        this.$refs.udpTable.resetTableStyle()
      }
    },
    downloadTemplate () {
      HTTP.downloadUdpTemplate()
    },
    showBegain () {
      this.$datablauMessage.success(this.$v.udp.startImport)
      this.templateUploading = true
      this.$bus.$emit('showUploadProgress', {
        name: this.$v.udp.importUdpcatelog, // '导入自定义属性目录',
        time: 10
      })
    },
    onError (e) {
      this.templateUploading = false
      this.$message.closeAll()
      this.$bus.$emit('changeUploadProgress', false)
      // this.$showUploadFailure(e)
      let msg = JSON.parse(e.message)?.errorMessage || '导入错误'
      msg = msg.replace(/\n/g, '<br>')

      // // 测试
      // msg += msg
      // msg += msg
      // msg += msg

      this.$datablauMessage({
        dangerouslyUseHTMLString: true,
        message:
          '<div style="max-width:900px;overflow:auto;line-height: 24px;max-height: 300px;">' +
          msg +
          '</div>',
        type: 'error',
        showClose: true,
        duration: 0
      })
      setTimeout(() => {
        $('.datablau-messagetip').css('height', 'auto')
      }, 100)
    },
    onSuccess (res) {
      this.templateUploading = false
      this.$message.closeAll()
      this.$datablauMessage.success('导入成功')
      this.$bus.$emit('changeUploadProgress', true)
      this.refreshTable()
    },
    exportUdps () {
      this.$datablauMessage.success(this.$v.udp.startDownload)
      HTTP.exportUdps()
    },

    // 业务条线格式化
    businessLineFormatter (data, column, cellValue, index) {
      let arr = ''
      let result = ''
      if (cellValue && Array.isArray(cellValue) && cellValue.length > 0) {
        arr = cellValue.map(item => item.name)
        result = arr.join(',')
      } else {
        result = this.$v.udp.overall // '全局'
      }
      return result
    },
    // 分页相关
    handleFilterChange () {
      let para = {
        keyword: this.keyword || '',
        pageSize: this.pageSize || 20,
        currentPage: this.currentPage || 1
      }
      this.getShowData(para)
        .then(res => {
          this.tableData = res
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleSizeChange (val) {
      this.pageSize = val
      this.handleFilterChange()
    },
    handleCurrentChange (val) {
      this.currentPage = val
      this.handleFilterChange()
    },
    sortChange ({ column, prop, order }) {
      this.sortData = {
        prop,
        order
      }
      this.handleFilterChange()
    },
    onTabChange (tab) {
      // this.currentTab = tab
      this.handleFilterChange()
      this.currentRow = null
    }
  },
  watch: {
    keyword (val) {
      if (!val) {
        this.rowDrop()
      } else {
        this.sortObj?.destroy()
      }
      this.handleFilterChange()
    }
  }
}
</script>

<style lang="scss" scoped>
  .operation-btn {
    float: right;
  }
.udp-list-tab {
  position: absolute;
  z-index: 0;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;

  /deep/ .tab-bottom-line {
    //border: 1px solid red;
    right: 0;
    margin-bottom: 10px;

    .pagination-container {
      padding-right: 0;

      .el-pagination {
        text-align: left;
      }
    }

    .left-btn-container {
      left: auto;
      right: 20px;
      z-index: 1;
      margin-top: 4px;
    }
  }

  .top-button {
    position: absolute;
    right: 0;
    top: 0;
  }

  .top-header-info-panel-wrapper {
    height: 40px;
    line-height: 40px;
    //margin-top: -20px;
    vertical-align: top;
    padding-left: 20px;

  }

  .top-title {
    //margin-top: 12px;
    position: relative;
    padding-left: 20px;

    .search-box {
      display: inline-block;

      .label {
        font-size: 12px;
        margin-right: 10px;
        margin-left: 20px;
        font-weight: bold;
      }
    }

    .el-input {
      width: 200px;
      height: 34px;
      vertical-align: middle;
    }

    .top-button {
      position: absolute;
      right: 0;
      top: 0;
    }
  }

  .type-box {
    display: inline-block;
    width: 60px;
    height: 22px;
    border-radius: 2px;
    background: rgba(0, 136, 153, .1);
    color: #008899;
    text-align: center;
    line-height: 22px;

    &.a80000004 {
      background: rgba(0, 149, 217, .1);
      color: #0095D9;
    }

    &.a80500008 {
      background: rgba(75, 92, 196, .1);
      color: #4B5CC4;
    }

    &.a80000005 {
      background: rgba(180, 76, 151, .1);
      color: #B44C97;
    }

    &.a80100073, &.a80010001 {
      background: rgba(64, 158, 255, .1);
      color: #008899;
    }
  }

  .submit-component {
    position: absolute;
    left: 0;
    right: 0;
    top: 95px;
    bottom: 0;

    .rule-table {
      left: 20px;
      right: 20px;

      .el-icon-edit-outline {
        font-size: 16px;
        margin-right: 18px;
        cursor: pointer;
      }

      .el-icon-delete {
        font-size: 16px;
        cursor: pointer;
      }
    }
  }

  .bottom {
    padding: 8px 20px;
    position: absolute;
    border-top: 1px solid #ddd;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50px;
    z-index: 9;
    background-color: #fff;
  }

  .footer-tool {
    position: absolute;
    left: 20px;
    z-index: 9;
    height: 30px;

    .disc-text {
      margin-right: 10px;
      line-height: 30px;
      font-size: 12px;
    }

    div {
      float: left;
    }
  }

  .table-tab-container .el-pagination__total {
    margin-left: 78px;
  }

  //.top-header-info-panel-wrapper {
  //  display: inline-block;
  //  margin-right: 7px;
  //}

  .delete-btn {
    margin-left: 0;
  }

  .more-action {
    margin-right: 20px;
    //padding-top: 9px;
    //padding-bottom: 9px;

    .el-button {
      font-size: 12px;
    }
  }

  //.table-wrapper {
  //  margin: 5px 20px 0px;
  //}
  .tab-with-table .tab-top-line .search-input {
    margin-left: 0;
  }

  .tab-with-table .tab-top-line .search-input {
    width: 200px;
  }

  .more-act-con .more-act-btn {
    color: #20293B;
  }

  .STRING {
    display: block;
    padding: 6px 12px;
    background: #EFE8FF;
    border-radius: 12px;
    color: #8C5DFF;
    font-size: 12px;
    line-height: 1;
    font-weight: bold;
  }
  .DOUBLE {
    display: block;
    padding: 6px 12px;
    background: #FCEAF5;
    border-radius: 12px;
    color: #EA69B8;
    font-size: 12px;
    line-height: 1;
    font-weight: bold;
  }
  .INTEGER {
    display: block;
    padding: 6px 12px;
    background: #E9F8F2;
    border-radius: 12px;
    color: #66CEA6;
    font-size: 12px;
    line-height: 1;
    font-weight: bold;
  }
  .DATETIME {
    display: block;
    padding: 6px 12px;
    background: #E3F7FC;
    border-radius: 12px;
    color: #3EC5E6;
    font-size: 12px;
    line-height: 1;
    font-weight: bold;
  }

  /deep/ {
    .tab-with-table .datablau-tab-table-line {
      margin-right: 20px;
      bottom: 60px;
    }
  }
}

.width500 {
  width: 500px;
}
</style>
<style lang="scss">
  .submit-component {
    .el-table.datablau-table tr.current-row + tr td {
      border-color: #EBEEF5;
      border-top-color: #EBEEF5;
    }
  }
</style>
