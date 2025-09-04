<template>
  <div class="api-list-process">
    <datablau-dialog
      :title="addThemeTitle"
      :visible.sync="newCatologVisible"
      width="35%"
      :close-on-click-modal="false"
      append-to-body
      class="add-theme"
    >
      <el-form
        :model="apiForm"
        label-width="90px"
        :rules="rules"
        class="apply-form"
        v-if="newCatologVisible"
        @submit.native.prevent
      >
        <el-form-item label="新增分类" prop="apiCatalog" class="dia-info">
          <datablau-input
            v-model="apiForm.apiCatalog"
            maxlength="20"
            show-word-limit
            style="width: 100%"
          ></datablau-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <datablau-button type="secondary" @click="newCatologVisible = false">
          取 消
        </datablau-button>
        <datablau-button
          size="mini"
          :disabled="!confirmAble"
          type="important"
          @click="auditRemark"
        >
          确 定
        </datablau-button>
      </span>
    </datablau-dialog>
    <datablau-dialog
      :title="editThemeTitle"
      :visible.sync="updateCatologVisible"
      width="35%"
      :close-on-click-modal="false"
      append-to-body
      class="edit-theme"
    >
      <el-form
        :model="editThemeForm"
        label-width="90px"
        :rules="rules"
        class="apply-form"
        v-if="updateCatologVisible"
        @submit.native.prevent
      >
        <el-form-item label="分类名称" prop="apiCatalog" class="dia-info">
          <datablau-input
            v-model="editThemeForm.apiCatalog"
            maxlength="50"
          ></datablau-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <datablau-button type="secondary" @click="updateCatologVisible = false">
          取 消
        </datablau-button>
        <datablau-button
          size="mini"
          :disabled="editThemeForm.apiCatalog == ''"
          type="important"
          @click="updateThemeName"
        >
          确 定
        </datablau-button>
      </span>
    </datablau-dialog>
    <datablau-dialog
      title="申请API"
      :close-on-click-modal="false"
      :visible.sync="showApplyDetail"
      append-to-body
      width="800px"
      class="apply-detail"
    >
      <apply-info
        @applySuccess="applySuccess"
        @cancelItem="cancelItem"
        :applyDetail="apiData"
        v-if="showApplyDetail"
      ></apply-info>
    </datablau-dialog>
    <tree-with-list
      :expandAll="true"
      class="table-tab-container"
      ref="modelsTable"
      :hideTreeSecondRow="true"
      :supervise="modeType !== 'apiList'"
      :tableOption="tableOption"
      :dataIconFunction="dataIconFunction"
      :dataOptionsFunction="dataOptionsFunction"
      :getTreeData="getTreeData"
      :hideDefaultFilter="hideDefaultFilter"
      :hideTreeFooter="hideTreeFooter"
      :showTreeCheckBox="false"
      tableHeightInfo="100%"
      :showTreeMoreIcon="false"
      :listTotal="totalShow"
      :columnDefs="columnDefs"
      :treeCheckedKeys="treeCheckedKeys"
      :treeProps="treeProps"
      :listShowData="getShowData"
      :tableHideTopLine="false"
      :hideBottomLine="false"
      :currentNodeKey="currentNodeKey"
      :tableHidePagination="false"
      @gridSelectionChanged="gridSelectionChanged"
      @handleNodeClick="handleNodeClick"
      @rightListRowClick="rightListRowClick"
      :class="{ 'hide-title': hideTitle }"
    >
      <slot name="treeTopRow"></slot>
      <div
        class="bottom-btn-container"
        v-if="isDevApi && mutipleLength"
        slot="tableFooter"
      >
        <span v-if="mutipleLength" class="check-info"></span>
        <span v-if="mutipleLength" class="footer-row-info">
          当前选中“{{ mutipleLength }}条”信息，是否
        </span>
        <datablau-button
          type="primary"
          :disabled="couldDeleteBatch"
          size="mini"
          @click="deleteApis"
        >
          批量删除
        </datablau-button>
        <datablau-button
          type="primary"
          :disabled="couldDeleteBatch"
          size="mini"
          @click="onlineApis"
        >
          批量上线
        </datablau-button>
        <datablau-button
          type="primary"
          :disabled="couldDeleteBatch"
          size="mini"
          @click="offlineApis"
        >
          批量下线
        </datablau-button>
        <!-- <div>
          <el-dropdown>
            <datablau-button  type="primary" size="mini" style="margin-left: 5px;width: 80px">
              更多<i class="el-icon-arrow-down el-icon&#45;&#45;right"></i>
            </datablau-button >
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>
                <div @click="deleteApis">批量删除</div>
              </el-dropdown-item>
              <el-dropdown-item>
                <div @click="onlineApis">批量上线</div>
              </el-dropdown-item>
              <el-dropdown-item>
                <div @click="offlineApis">批量下线</div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div> -->
      </div>
      <div slot="navRight" style="margin-top: 15px">
        <el-form
          class="st-page-form tree-list"
          id="standardListForm"
          label-position="right"
          label-width="64px"
          ref="searchForm"
          :inline="inlineInfo"
          :model="searchFormData"
          style="margin-top: 5px; margin-right: -20px"
          :rules="{
            name: [
              {
                trigger: 'blur',
                validator: $utils.validator.maxLengthCustom(50),
              },
            ],
          }"
        >
          <el-form-item v-if="isDevApi" prop="name">
            <datablau-input
              :iconfont-state="true"
              placeholder="请输入API名称"
              maxlength="50"
              style="width: 240px"
              v-model="searchFormData.name"
              filterable
              clearable
            ></datablau-input>
          </el-form-item>
          <el-form-item v-if="!isDevApi" class="search-input">
            <datablau-input
              :iconfont-state="true"
              v-model="searchFormData.name"
              maxlength="50"
              style="width: 240px"
              filterable
              clearable
              placeholder="API名称"
            ></datablau-input>
          </el-form-item>
          <el-form-item v-if="isDevApi" label="发布状态:">
            <datablau-select
              placeholder="请选择"
              class="select-style"
              style="width: 170px"
              filterable
              clearable
              v-model="searchFormData.status"
            >
              <el-option
                v-for="item in statusOption"
                :key="item.label"
                :value="item.value"
                :label="item.label"
              ></el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item v-if="isDevApi" label="测试状态:">
            <datablau-select
              placeholder="请选择"
              style="width: 170px"
              class="select-style"
              filterable
              clearable
              size="mini"
              v-model="searchFormData.testStatus"
            >
              <el-option
                v-for="item in testStaOption"
                :key="item.label"
                :value="item.value"
                :label="item.label"
              ></el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item class="list-button" v-if="isDevApi">
            <!-- <datablau-button
              size="mini"
              type="primary"
              @click="handleCurrentChange(0)"
            >
              查询
            </datablau-button> -->
            <datablau-button
              type="important"
              class="iconfont icon-tianjia"
              @click="addApi"
            >
              新增API
            </datablau-button>
          </el-form-item>
        </el-form>
      </div>
    </tree-with-list>
  </div>
</template>

<script>
import Vue from 'vue'
import treeWithList from './treeWithList.vue'
import HTTP from '../ddsHTTP.js'
import applyInfo from './applyInfo.vue'
let tableOptionCell = {
  template: `<div>
      <el-switch :title="statusInfo" v-model="status" @click.stop.native @change="toggleStatus" :active-value="actVal"
              :inactive-value="inActVal" style="margin-bottom:10px; margin-right:5px;"></el-switch>
      <datablau-button   type="icon"  :title="$t('common.button.edit')" class="iconfont icon-bianji"  @click="editItem" :disabled="ifEditDisabled"  ></datablau-button >
      <datablau-button  type="icon"  :title="$t('common.button.delete')" class="iconfont icon-delete" @click="deleteApi" :disabled="ifEditDisabled" ></datablau-button > </div>`,
  data() {
    return {
      name: 'api-operator',
      inActVal: 'OFFLINE',
      actVal: 'RELEASE',
      tabComponent: null,
      status: null,
      statusInfo: '',
      rightTableData: [],
    }
  },
  props: ['params', 'dataRrow', 'dataColumn'],
  mounted() {
    this.tabComponent = this.params.tabComponent
    this.statusInfo = this.params.apiStatus === 'OFFLINE' ? '发布' : '下线'
    this.status = this.dataRrow.apiStatus
  },
  computed: {
    ifEditDisabled() {
      let bool = false
      if (this.params.apiStatus === 'RELEASE') {
        bool = true
      }
      return bool
    },
  },
  methods: {
    toggleStatus() {
      const data = this.params.tabComponent
      this.rightTableData = data.rightTableData
      let result
      const tabComponent = this.tabComponent
      if (tabComponent && tabComponent.toggleStatus) {
        result = tabComponent.toggleStatus(this.dataRrow)
        let self = this
        result
          .then(() => {
            // self.dataRrowa.apiStatus = self.status
            // data.refreshCell({
            //   force: true,
            //   columns: ['apiStatus'],
            // })
            self.$set(
              self.rightTableData[self.dataColumn],
              'apiStatus',
              self.status
            )
          })
          .catch(() => {
            if (self.status === 'RELEASE') {
              self.dataRrow.apiStatus = 'OFFLINE'
            } else if (self.status === 'OFFLINE') {
              self.dataRrow.apiStatus = 'RELEASE'
            }
            self.status = self.dataRrow.apiStatus
            self.$set(
              self.rightTableData[self.dataColumn],
              'apiStatus',
              self.status
            )
          })
      }
    },
    editItem(e) {
      const data = this.params
      const tabComponent = this.tabComponent
      tabComponent &&
        tabComponent.editItem &&
        tabComponent.editItem(this.dataRrow)
    },
    deleteApi(e) {
      console.log('kkkkk')
      const data = this.params
      const tabComponent = this.tabComponent
      tabComponent &&
        tabComponent.editItem &&
        tabComponent.deleteApi(this.dataRrow)
    },
  },
}
tableOptionCell = Vue.extend(tableOptionCell)
Vue.component('apiOperator', Vue.extend(tableOptionCell))

export default {
  // name: 'list',
  props: {
    modeType: {
      type: String,
      default: 'apiList', // 我申请的api
    },
    moudleType: {
      type: String,
      default: 'apiList', // 管理api
    },
    // 是否隐藏 操作列
    disabledOption: {
      type: Boolean,
      default: false,
    },
    // 根据 表 id 过滤
    tableIdFilter: {
      type: [String, Number],
      default: '',
    },
    hideTitle: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      rightTableData: [],
      isAllActive: false,
      listTitle: '所有分类',
      addThemeTitle: '',
      treeCheckedKeys: [0],
      searchKeyword: '',
      inActVal: 'OFFLINE',
      actVal: 'RELEASE',
      currentNodeKey: 0,
      searchFormData: {
        name: '',
        status: null,
        testStatus: null,
      },
      selection: [],
      mutipleLength: 0,
      hideTreeFooter: true,
      hideDefaultFilter: true,
      inlineInfo: true,
      // AccessAll: false,
      hasAccessApply: this.$auth.API_DEVELOP_APPLYING,
      AccessAll: this.$auth.API_DEVELOP_ALL,
      folderId: '',
      folderName: '',
      showApplyDetail: false,
      apiForm: {
        apiCatalog: '',
      },
      apiData: {},
      ApiBaseurl: '',
      newCatologVisible: false,
      updateCatologVisible: false,
      editThemeTitle: '修改分类名称',
      editThemeForm: {},
      // *** tab with table ***
      totalShow: 0,
      treeProps: {
        label: 'apiCatalog',
        children: 'children',
      },
      columnDefs: [],
      hideTopLine: false,
      tableOption: {
        selectable: false,
        autoHideSelectable: true,
        showColumnSelection: true,
        columnSelection: [],
        columnResizable: true,
      },
      tableHidePagination: false,
      defaultParaData: {
        currentPage: 1,
        pageSize: 20,
      },
      idArr: [],
      modelMap: {},
      rules: {
        apiCatalog: [
          { required: true, trigger: 'blur', message: '请填写分类名' },
        ],
      },
      statusOption: [
        {
          value: null,
          label: '全部',
        },
        {
          value: 'RELEASE',
          label: '已发布',
        },
        {
          value: 'OFFLINE',
          label: '已下线',
        },
      ],
      testStaOption: [
        {
          value: null,
          label: '全部',
        },
        {
          value: 'SUCCESS',
          label: '成功',
        },
        {
          value: 'FAIL',
          label: '失败',
        },
      ],

      // *** edit dialog ***
      dialogVisible: false,
      applyData: {},
      dialogTitle: '发起流程',
      isAddModel: false,
      applyPropArr: [],
      editRules: {},

      editOriginData: null,
    }
  },
  components: {
    treeWithList,
    applyInfo,
  },
  created() {
    // this.setGetTreeData()
  },
  beforeMount() {
    const customColNameApi = data => {
      return data.name
    }
    const customClassApi = data => {
      return 'api-name'
    }
    const customColNameApiTest = data => {
      let result
      if (data.apiTestStatus === 'SUCCESS') {
        result = '成功'
      } else if (data.apiTestStatus === 'FAIL') {
        result = '失败'
      }

      return result
    }
    const customClassApiTest = data => {
      let result
      if (data.apiTestStatus === 'SUCCESS') {
        result = 'api-test-success'
      } else if (data.apiTestStatus === 'FAIL') {
        result = 'api-test-fail'
      }

      return result
    }
    const formatterTime = data => {
      const t = this.$timeFormatter(data.data.createTime)
      return t.slice(0, -3)
    }
    const columnDefs = [
      {
        headerName: 'API名称',
        field: 'name',
        type: ['customCol'],
        align: 'left',
        headerAlign: 'left',
        customColName: customColNameApi,
        customClass: customClassApi,

        // cellRenderer: params => {
        //   const result = params.data.name
        //   return `<span title="${result}" style="color:#4386F5;cursor:pointer">${result}</span>`
        //   150
        //   // type: ['customSortCol'],
        // },
      },
      {
        headerName: '描述',
        field: 'description',
        tooltipField: 'description',
        // width: 200,
        // type: ['customSortCol'],
      },
      {
        headerName: '创建人',
        field: 'creator',
        tooltipField: 'creator',
        width: 90,
        // type: ['customSortCol'],
      },
      {
        headerName: '分类',
        field: 'apiCatalog',
        tooltipField: 'apiCatalog',
        width: 100,
        // type: ['customSortCol'],
      },
      {
        headerName: '创建时间',
        field: 'createTime',
        width: 120,
        valueFormatter: formatterTime,
        tooltipValueGetter: formatterTime,
        // type: ['customSortCol'],
      },
    ]
    const columnDefsList = [
      {
        headerName: 'API名称',
        field: 'name',
        type: ['customCol'],
        customColName: customColNameApi,
        customClass: customClassApi,
        width: 150,
        // type: ['customSortCol'],
      },
      {
        headerName: '描述',
        field: 'description',
        tooltipField: 'description',
        minWidth: 200,
        // type: ['customSortCol'],
      },
      {
        headerName: '分类',
        field: 'apiCatalog',
        tooltipField: 'apiCatalog',
        width: 60,
        // type: ['customSortCol'],
      },
      {
        headerName: '创建时间',
        field: 'createTime',
        width: 170,
        valueFormatter: formatterTime,
        tooltipValueGetter: formatterTime,
        // type: ['customSortCol'],
      },
      {
        headerName: '测试状态',
        field: 'apiTestStatus',
        type: ['customCol'],
        minWidth: 80,
        customColName: customColNameApiTest,
        customClass: customClassApiTest,
        // cellRenderer: params => {
        //   let result = ''

        //   if (params.data.apiTestStatus === 'SUCCESS') {
        //     result = `<div class="dot-shape" style="background-color:#57A07F"></div>
        //     <span style="color:#57A07F">成功</span>`
        //   } else if (params.data.apiTestStatus === 'FAIL') {
        //     result = `<div class="dot-shape" style="background-color:#F46565"></div>
        //     <span style="color:#F46565">失败</span>`
        //   }
        //   return result
        // },
        // type: ['customSortCol'],
      },
      // {
      //   headerName: '发布状态',
      //   field: 'key',
      //   width: 150,
      //   cellRenderer: (params) => {
      //     let result = '';
      //     if (params.data.apiStatus === 'RELEASE') {
      //       result = "已发布";
      //     } else if (params.data.apiStatus === 'OFFLINE') {
      //       result = '下线'
      //     }
      //     return result;
      //   },
      //   // type: ['customSortCol'],
      // },
    ]
    let obj

    if (this.isDevApi) {
      this.tableOption.selectable = true
      obj = {
        headerName: '操作',
        width: 150,
        name: 'api-operator',
        cellRendererFramework: tableOptionCell,
        type: ['optionsCell'],
        cellRendererParams: { tabComponent: this },
      }
    } else if (this.isApiOverview) {
      obj = {
        headerName: '操作',
        width: 100,
        type: ['optionsWithContent2'],
        cellRendererParams: {
          tabComponent: this,
          options: [
            {
              name: 'propose',
              text: '申请',
              method: 'proposeItem',
              ifBtnDisabled: this.isApplyDisabled,
            },
          ],
        },
      }
    } else if (this.isManageApi) {
      obj = {
        headerName: '操作',
        width: 80,
        type: ['optionsWithContent2'],
        cellRendererParams: {
          tabComponent: this,
          options: [
            {
              name: 'offline',
              text: '下线',
              method: 'offlineItem',
              ifBtnDisabled: this.ifOfflineDisabled,
            },
          ],
        },
      }
    }
    let col = []
    if (this.isApiOverview) {
      col = [...columnDefs, obj]
      this.tableOption.rowSelection = 'single'
    } else if (this.isDevApi) {
      col = [...columnDefsList, obj]
    } else if (this.isManageApi) {
      col = [...columnDefs, obj]
      this.tableOption.rowSelection = 'single'
    }

    if (this.disabledOption) {
      col.pop()
    }
    this.columnDefs = col
  },
  computed: {
    confirmAble() {
      let bool = false
      if (this.apiForm.apiCatalog.trim()) {
        bool = true
      }
      return bool
    },
    disabledSave() {
      let bool = false
      if (this.editRules) {
        for (const key in this.editRules) {
          if (!this.applyData || !this.applyData[key]) {
            bool = 'true'
          }
        }
      }
      return bool
    },
    couldDeleteBatch() {
      let bool = true
      if (this.selection.length > 0) {
        bool = false
      }
      return bool
    },
    isApiOverview() {
      let bool = false
      if (this.modeType === 'apiList' && this.moudleType === 'apiList') {
        bool = true
      }
      return bool
    },
    isDevApi() {
      let bool = false
      if (this.modeType !== 'apiList' && this.moudleType === 'apiList') {
        bool = true
      }
      return bool
    },
    isManageApi() {
      let bool = false
      if (this.modeType === 'apiList' && this.moudleType !== 'apiList') {
        bool = true
      }
      return bool
    },
  },

  mounted() {
    this.getBaseurl()
    this.dataInit()
  },
  beforeDestroy() {},
  methods: {
    dataOptionsFunction(data) {
      const options = []
      let label = ''
      if (data.name) {
        label =
          data.name.length < 10 ? data.name : data.name.slice(0, 8) + '...'
      }
      if (data.id === 0) {
        options.push({
          label: `新增子分类`,
          callback: () => {
            this.addChildTheme(data)
          },
          args: 'folder',
        })
      } else {
        options.push({
          label: '新增同级分类',
          callback: () => {
            this.addSameTheme(data)
          },
          args: 'folder',
        })

        options.push({
          label: `删除`,
          callback: () => {
            this.deleteTheme(data)
          },
          args: 'folder',
        })

        options.push({
          label: `修改`,
          callback: () => {
            this.editTheme(data)
          },
          args: 'folder',
        })
      }

      // todo 分隔线暂时只支持solid实线

      return options
    },
    allListClick() {},
    dataIconFunction(data, node) {
      if (node.expanded && node.childNodes.length > 0) {
        return 'iconfont icon-openfile'
      } else {
        return 'iconfont icon-file'
      }
    },
    dataInit() {
      const query = this.$route.query
      // 是否是其他页面跳转过来的
      if (query.createApi && query.tableId) {
        const tableId = query.tableId
        const query2 = {}
        Object.keys(query).forEach(key => {
          query2[key] = query[key]
        })
        delete query2.createApi
        delete query2.tableId
        this.$router.push({
          name: this.$route.name,
          query: query2,
        })

        this.$nextTick(() => {
          this.addApi(tableId)
        })
      }
    },
    refreshCell() {
      if (this.$refs.modelsTable && this.$refs.modelsTable.forceUpdateCell) {
        this.$refs.modelsTable.forceUpdateCell()
      }
    },
    isRole() {
      return (
        this.$isRole('数据工程师') ||
        this.$isRole('数据服务管理员') ||
        this.$isAdmin
      )
    },
    toggleStatus(data) {
      return new Promise((resolve, reject) => {
        if (data.apiStatus === 'OFFLINE') {
          HTTP.changeApiOnline({
            id: data.id,
            requestBody: 0,
          })
            .then(res => {
              this.$message.success('发布成功')
              resolve('成功')
            })
            .catch(e => {
              this.$showFailure(e)
              reject(e)
            })
        } else if (data.apiStatus === 'RELEASE') {
          HTTP.changeApiOnline({
            id: data.id,
            requestBody: 1,
          })
            .then(res => {
              resolve('成功')
              this.$message.success('下线成功')
            })
            .catch(e => {
              this.$showFailure(e)
              reject(e)
            })
        }
      })
    },
    rightListRowClick(row, column, cell, event) {
      if (row.column.property === 'name') {
        this.$emit('checkedApi', row.row.id)
      }
    },
    editItem(data) {
      this.$emit('editApi', data.tabComponent.apiData.id)
    },
    isApplyDisabled() {
      return !this.hasAccessApply
    },
    ifOfflineDisabled(data) {
      let bool = true
      if (data.apiApplyStatus === 'DISAPPLY') {
        bool = false
      }
      return bool
    },
    cancelItem() {
      this.showApplyDetail = false
    },
    deleteApis() {
      this.$DatablauCofirm('是否确认删除？', '提示', {
        type: 'warning',
      }).then(() => {
        const ids = this.selection.map(item => {
          return item.id
        })
        const len = ids.length
        HTTP.deleteApis(ids)
          .then(res => {
            this.$showSuccess(res.data.message)
            this.refreshTable()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
    onlineApis() {
      const ids = this.selection.map(item => {
        return item.id
      })
      const len1 = this.selection.length
      // console.log(this.selection, 'guojiamin')
      HTTP.onlineApis(ids)
        .then(res => {
          this.$showSuccess(res.data.message)
          this.refreshTable()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    offlineApis() {
      const ids = this.selection.map(item => {
        return item.id
      })
      const len1 = this.selection.length
      // console.log(this.selection, idsArr, 'guojiamin')
      HTTP.offlineApis(ids)
        .then(res => {
          this.$showSuccess(res.data.message)
          this.refreshTable()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleCurrentChange(val) {
      if (this.$refs.searchForm && this.$refs.searchForm.validate) {
        this.$refs.searchForm
          .validate()
          .then(res => {
            // this.getShowData(this.defaultParaData);
            this.refreshRightData(val)
          })
          .catch(e => {
            console.log(e)
          })
      }
    },
    handleNodeClick(data) {
      this.folderId = data.data.id
      this.folderName = data.data.apiCatalog
      this.listTitle = data.data.apiCatalog
      this.$nextTick(() => {
        this.$refs.modelsTable &&
          this.$refs.modelsTable.treeSetCurrent &&
          this.$refs.modelsTable.treeSetCurrent(this.folderId)
      })

      this.refreshRightData()
    },
    getBaseurl() {
      HTTP.getApiBaseurl()
        .then(res => {
          this.ApiBaseurl = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    proposeItem(data) {
      data.e.stopPropagation()
      this.showApplyDetail = true
      this.apiData = data.data
      this.apiData.baseURL = this.ApiBaseurl.slice() + data.data.api
    },
    applySuccess() {
      this.showApplyDetail = false
      this.$showSuccess('提交申请成功')
      this.refreshTable()
    },
    onlineItem(data) {
      const obj = {
        id: data.data.id,
        requestBody: 0,
      }
      HTTP.changeApiOnline(obj)
        .then(res => {
          this.$showSuccess('发布成功')
          this.refreshTable()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    offlineItem(data) {
      this.$DatablauCofirm('是否确认下线？', '提示', {
        type: 'warning',
      })
        .then(() => {
          data.e.stopPropagation()
          const obj = {
            id: data.data.id,
            requestBody: 1,
          }
          HTTP.changeApiOnline(obj)
            .then(res => {
              this.$showSuccess('下线成功')
              this.refreshTable()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(e => {})
    },
    editItem(data) {
      this.$emit('editApi', data.id)
    },
    deleteApi(data) {
      this.$DatablauCofirm('是否确认删除？', '提示', {
        type: 'warning',
      }).then(() => {
        HTTP.deleteApiItem(data.id)
          .then(res => {
            this.$datablauMessage.success('删除成功')
            this.refreshTable()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },

    // *** tab with table ***
    getShowData(para) {
      // 管理api列表和api市场列表数据是一样的
      return new Promise((resolve, reject) => {
        const obj = {
          currentPage: para.currentPage - 1,
          pageSize: para.pageSize,
          group: this.folderName === '所有分类' ? '' : this.folderName,
          name: this.searchFormData.name,
          status:
            this.searchFormData.status === ''
              ? null
              : this.searchFormData.status,
          testStatus:
            this.searchFormData.testStatus === ''
              ? null
              : this.searchFormData.testStatus,
        }
        let newPromise
        // 增加 根据 tableId 过滤
        if (this.tableIdFilter) {
          obj.status = 0
          obj.tableObjectId = this.tableIdFilter
          newPromise = HTTP.getApiLists(obj)
        } else {
          if (this.isDevApi) {
            obj.currentPage = para.currentPage
            newPromise = HTTP.getDevApiList(obj)
          } else if (this.isManageApi || this.isApiOverview) {
            obj.status = 0
            newPromise = HTTP.getApiLists(obj)
          }
        }
        newPromise
          .then(res => {
            const data = res.data
            const content = data.content
            this.totalShow = data.totalItems
            this.rightTableData = content
            resolve(content)
          })
          .catch(e => {
            this.$showFailure(e)
            reject(e)
          })
      })
    },
    gridSelectionChanged(para) {
      const api = para.api
      const arr = api.getSelectedNodes()
      const result = []
      arr.forEach(item => {
        result.push(item.data)
      })
      this.selection = result
      this.mutipleLength = this.selection.length
    },

    // *** edit dialog ***
    addApi(tableId) {
      if (tableId && !isNaN(parseInt(tableId))) {
        this.$emit('addApi', tableId)
      } else {
        this.$emit('addApi')
      }
    },
    showEditDialog({ data, api, e }) {
      //
      this.isAddModel = false
      let metaInfo = data.metaInfo
      if (this.$utils.isJSON(metaInfo)) {
        metaInfo = JSON.parse(metaInfo)
      } else {
        metaInfo = {}
      }
      this.applyData = {
        name: data.name,
        key: data.key,
        description: metaInfo.description || '',
        id: data.id,
      }
      this.dialogVisible = true
    },
    deleteModel({ data, api, e }) {
      // let id = data.id;
      // let url = `${this.$url}/service/model/?id=${id}`;

      // this.$DatablauCofirm('删除后不可恢复，确认删除？','提示',{
      //   type: 'warning',
      // }).then(()=>{
      //   this.$http.delete(url)
      //   .then(res => {
      //    this.$datablauMessage.success('删除成功');
      //     this.refreshTable();
      //   })
      //   .catch(e => {
      //     this.$showFailure(e);
      //   });
      // }).catch((e)=>{
      //
      // });

      this.$DatablauCofirm('删除后不可恢复，确认删除？', '提示', {
        type: 'warning',
        closeOnClickModal: false,
      })
        .then(() => {
          const id = data.id
          const para = { id }
          const callback = () => {
            this.$datablauMessage.success('删除成功')
            this.refreshTable()
          }
          this.deleteItem(para, callback)
        })
        .catch(e => {
          console.info(e)
        })
    },
    saveEditObj() {
      if (this.$refs.processDia && this.$refs.processDia.validate()) {
        const oriData = _.cloneDeep(this.editOriginData)

        const startProcessData = {}
        startProcessData.proDefId = oriData.id
        startProcessData.proDefName = oriData.name
        const formData = []

        const formProperties = oriData.formProperties
        if (formProperties && Array.isArray(formProperties)) {
          formProperties.forEach(item => {
            item.value = this.applyData[item.name] || ''
            if (item.value !== '') {
              formData.push(item.id + '=' + item.value)
            }
          })
        }

        startProcessData.formData = formData

        const url = `${this.$url}/service/workflow/process/apply`

        this.$http
          .post(url, startProcessData)
          .then(res => {
            this.$datablauMessage.success('发起成功')
            this.dialogVisible = false
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        this.$showFailure('内容不能为空')
      }
    },
    refreshRightData(val) {
      if (this.$refs.modelsTable && this.$refs.modelsTable.refreshRightData) {
        this.$refs.modelsTable.refreshRightData(val)
      }
    },
    refreshLeftData() {
      if (this.$refs.modelsTable && this.$refs.modelsTable.refreshLeftData) {
        this.$refs.modelsTable.refreshLeftData()
      }
    },
    refreshTable() {
      if (this.$refs.modelsTable && this.$refs.modelsTable.refreshData) {
        this.$refs.modelsTable.refreshData()
      }
    },
    deleteItem(para, callback) {
      const id = para.id
      const url = `${this.$url}/service/workflow/model/?id=${id}`

      this.$http
        .delete(url)
        .then(res => {
          this.$datablauMessage.success('删除成功')
          this.refreshTable()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },

    handleApply({ data, api, e }) {
      this.dialogTitle = '发起流程：' + data.name
      const id = data.id
      if (!id) return
      const url = `${this.$url}/service/workflow/process/start?proDefId=${id}`
      this.$http
        .get(url)
        .then(res => {
          const data = res.data
          const formProperties = data.formProperties
          const applyData = {}
          const editRules = {}
          const applyPropArr = []
          if (formProperties && Array.isArray(formProperties)) {
            formProperties.forEach(item => {
              const obj = _.cloneDeep(item)
              obj.dataType = obj.type.name
              applyData[item.name] = ''
              if (item.required) {
                editRules[item.name] = {
                  reuqired: item.required,
                  trigger: 'blur',
                  message: '请输入' + item.required,
                }
              }
              if (item.readable) {
                applyPropArr.push(obj)
              }
            })
          }
          this.applyData = applyData
          this.editRules = editRules
          this.applyPropArr = applyPropArr
          if (applyPropArr.length > 0) {
            this.editOriginData = data
            this.dialogVisible = true
          } else {
            this.$datablauMessage.info('流程内容为空')
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    bandProcess({ data, api, e }) {
      //
      const getUrl = `${this.$url}/service/process/bind/page?currentPage=1&name=&pageSize=50`
      this.$http
        .get(getUrl)
        .then(res => {
          const content = res.data.content
          let editConfigObj = null
          if (content && Array.isArray(content)) {
            content.forEach(item => {
              if (item.name === this.$processMap.applyData) {
                editConfigObj = item
              }
            })
          }

          const createUrl = `${this.$url}/service/process/bind/`
          let method = ''

          if (editConfigObj) {
            method = 'post'
            editConfigObj.proDefId = data.id
            editConfigObj.proDefName = data.name
          } else {
            method = 'put'
            editConfigObj = {
              name: this.$processMap.applyData,
              proDefId: data.id,
              proDefName: data.name,
              callbackFlag: '',
              callbackApi: '',
              apiMethod: '',
              jsonFlag: '',
            }
          }

          this.$http[method](createUrl, editConfigObj)
            .then(res => {
              this.$datablauMessage.success('绑定成功')
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    setApproval({ data, api, e }) {
      if (data.name === this.$processMap.dataStandard) {
        this.$emit('showAssignee', data)
        return
      }
      const url = `${this.$url}/service/process/bind/name?name=${this.$processMap.applyData}`
      this.$http
        .get(url)
        .then(res => {
          const data = res.data
          this.choosedUser = data.assignee
          this.setUserDialogShow = true
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // getUserList() {
    //   return [];
    // },

    // async delete  models item
    async deleteItemAsync(para, callback) {
      const id = para.id
      const url = `${this.$url}/service/workflow/model/?id=${id}`

      await this.$http.delete(url)
      callback && callback()
    },

    deleteBatch() {
      const arr = this.selection.map(item => {
        const obj = {
          id: item.id,
        }
        return obj
      })
      // let arr = this.selection.map(item => {id:item.id});
      const callback = () => {
        this.$datablauMessage.success('删除成功')
        this.refreshTable()
      }
      const para = {
        fun: this.deleteItemAsync,
        paraArr: arr,
        callback,
      }
      this.$DatablauCofirm('删除后不可恢复，确认删除？', '提示', {
        type: 'warning',
        closeOnClickModal: false,
      })
        .then(() => {
          this.seriesFunCallback(para)
        })
        .catch(e => console.info(e))
    },
    seriesFunCallback({ fun, paraArr, callback }) {
      let delCallback = null
      const nextCallback = () => {
        paraArr.shift()
        this.seriesFunCallback({ fun, paraArr, callback })
      }
      let obj = null
      if (paraArr && Array.isArray(paraArr) && paraArr.length > 1) {
        delCallback = nextCallback
        obj = paraArr[0]
      } else if (paraArr && Array.isArray(paraArr) && paraArr.length == 1) {
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
    tableLayout() {
      if (this.$refs.modelsTable && this.$refs.modelsTable.resetTableStyle) {
        this.$refs.modelsTable.resetTableStyle()
      }
    },

    saveChoosedUser(userList) {
      const currentProcessData = this.currentProcessData
      const para = {
        // id: currentProcessData.id || '',
        id: '',
        name: this.$processMap.applyData,
        proDefId: currentProcessData.id,
        proDefName: currentProcessData.name,
        assignee: _.cloneDeep(userList),
      }
      const url = `${this.$url}/service/process/bind/`
      this.$http
        .post(url, para)
        .then(res => {
          //
          this.$datablauMessage.success('设置成功')
          this.setUserDialogShow = false
          this.refreshTable()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getTreeData() {
      return new Promise((resolve, reject) => {
        HTTP.getCatalogList()
          .then(res => {
            const data = res.data
            const arr = [
              {
                id: 0,
                type: 'catalog',
                apiCatalog: '所有分类',
                children: data,
              },
            ]
            resolve(arr)
          })
          .catch(e => {
            reject(e)
          })
      })
    },
    addSameTheme(data) {
      this.newCatologVisible = true
      this.addThemeTitle = '新增同级分类'
    },
    addChildTheme(data) {
      this.newCatologVisible = true
      this.addThemeTitle = '新增子级分类'
    },
    auditRemark() {
      const obj = {}
      obj.apiCatalog = this.apiForm.apiCatalog.trim()
      HTTP.createApiCatalog(obj)
        .then(res => {
          this.apiForm.apiCatalog = ''
          this.newCatologVisible = false
          this.refreshTable()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    deleteTheme(data) {
      this.$DatablauCofirm('是否确认删除?', '提示', {
        confirmButtonText: this.$t('common.button.ok'),
        cancelButtonText: this.$t('common.button.cancel'),
        type: 'warning',
      })
        .then(() => {
          HTTP.deleteApiCatalogList(data.id)
            .then(res => {
              this.refreshTable()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(e => {})
    },
    editTheme(data) {
      this.editThemeForm = _.cloneDeep(data)
      this.updateCatologVisible = true
    },
    // 修改分类名称
    updateThemeName() {
      HTTP.updateThemeTitle({
        ...this.editThemeForm,
      })
        .then(res => {
          if (res.status === 200) {
            this.$message.success('修改成功')
            this.updateCatologVisible = false
            this.editThemeForm = {}
            this.$refs.modelsTable.refreshLeftData()
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    commandHandle(command, data) {
      // this.parentPath = ''
      // this.getParentPath(this.treeData, data.parentId)
      switch (command) {
        case 'addSame':
          this.addSameTheme(data)
          break
        case 'addChild':
          this.addChildTheme(data)
          break
        case 'delete':
          this.deleteTheme(data)
          break
      }
    },
    treeNodeRender(h, { node, data, store }) {
      if (this.modeType !== 'apiList') {
        if (node.level === 1) {
          return (
            <span style="flex: 1; display: flex;align-items: center;">
              <span class="icon-i-folder">
                <span class="path1"></span>
                <span class="path2"></span>
              </span>
              <span style="font-weight:bold; margin-left:.5em">
                {node.label}
              </span>
              <span class="three-point" style="position: relative;right: 5px;">
                <el-dropdown
                  trigger="hover"
                  style="float:right;margin-right:5px"
                  size="mini"
                  on-command={command => this.commandHandle(command, data)}
                >
                  <span class="el-dropdown-link">
                    <i class="el-icon-more" slot="reference"></i>
                  </span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="addChild">
                      新增子分类
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </span>
            </span>
          )
        }
        return (
          <span style="width: 88%;position:relative;">
            <span class="icon-i-folder">
              <span class="path1" style="margin-right:2px;"></span>
              <span class="path2"></span>
            </span>
            <span style="margin-left:.5em">
              {node.label && node.label.length > 8
                ? node.label.substring(0, 8) + '...'
                : node.label}
            </span>
            <span class="three-point" style="position: absolute;right: 5px;">
              <el-dropdown
                trigger="hover"
                style="float:right;margin-right:5px"
                size="mini"
                on-command={command => this.commandHandle(command, data)}
              >
                <span class="el-dropdown-link">
                  <i class="el-icon-more" slot="reference"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="addSame">
                    新增同级分类
                  </el-dropdown-item>
                  <el-dropdown-item command="delete">删除分类</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </span>
          </span>
        )
      } else {
        if (node.level === 1) {
          return (
            <span style="flex: 1; display: flex;align-items: center;">
              <span class="icon-i-folder">
                <span class="path1"></span>
                <span class="path2"></span>
              </span>
              <span style="font-weight:bold;margin-left:.5em">
                {node.label}
              </span>
            </span>
          )
        }
        return (
          <span style="width: 88%;position:relative;">
            <span class="icon-i-folder">
              <span class="path1" style="margin-right:2px;"></span>
              <span class="path2"></span>
            </span>
            <span style="margin-left:.5em">
              {node.label && node.label.length > 8
                ? node.label.substring(0, 8) + '...'
                : node.label}
            </span>
          </span>
        )
      }
    },
  },
  watch: {
    searchFormData: {
      deep: true,
      handler: function () {
        this.refreshRightData('treeClick')
        // if (!this.isDevApi) {
        //   // this.getShowData(this.defaultParaData);

        // }
      },
      // deep: true
    },
    newCatologVisible() {
      this.apiForm.apiCatalog = ''
    },
    tableIdFilter() {
      this.refreshRightData()
    },
  },
}
</script>

<style lang="scss" scoped>
@import '~@/next/components/basic/color.sass';
.api-list-process {
  .page-title-row {
    span {
      margin-left: 11px !important;
    }
  }
}
/deep/.api-name {
  color: $primary-color;
  cursor: pointer;
}
/deep/.api-test-success {
  color: #57a07f;
}
/deep/.api-test-fail {
  color: #f46565;
}
.apply-detail,
.add-theme {
  .el-dialog__footer {
    padding-bottom: 45px !important;

    .dialog-footer {
      float: right;
    }
  }
}

.list-title {
  margin-top: -58px;
  margin-left: 0px;
}

.bottom-btn-container {
  margin-left: -3px;
  .check-info {
    width: 14px;
    height: 14px;
    display: inline-block;
    background: $primary-color;
    margin-right: -13px;
    vertical-align: middle;
  }
  .footer-row-info {
    height: 50px;
    margin-right: 10px;
    &:before {
      content: '\e6da';
      font-family: 'element-icons';
      font-size: 12px;
      font-weight: 200;
      margin-right: 5px;
      vertical-align: middle;
      line-height: 15px;
      color: white;
    }
  }
}

.tree-list {
  position: relative;
  z-index: 1000000;
  margin-top: -6px !important;
  margin-left: 20px;

  .el-form-item {
    margin-right: 20px !important;
  }
  .list-button {
    float: right;
    margin-right: 20px;
  }

  .search-input {
    width: 300px;

    .el-form-item__content {
      width: 300px;

      .datablau-input {
        width: 300px !important;

        input {
          width: 300px;
        }
      }
    }
  }
}
.icon-api {
  margin-right: 15px;
}

.table-tab-container {
  left: 0;
  .tree-box {
    margin-top: -33px;
    /deep/.tree-com-box {
      top: 54px;
    }
  }
  /deep/.right-box {
    bottom: 43px !important;
  }

  &.hide-title {
    margin-top: 25px;
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
  /deep/.right-box {
    // top: 13px;
    bottom: 30px;
  }
}
</style>

<style lang="scss">
.start-process-dia {
  .start-dialog-body {
    margin-top: 20px;

    .el-textarea,
    .el-input {
      max-width: 300px;
    }
  }
}
</style>
