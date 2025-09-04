<template>
  <div>
    <datablau-dialog
      title="手动输入"
      :visible.sync="showInsertEditor"
      size="m"
      append-to-body
      custom-class="show-insert-editor-dialog"
      >
      <div>
        <div>
          <i class="iconfont icon-tips" style="margin-right: 8px;color: #999;"></i><span style="color: #555;font-size: 12px;">输入名称以英文分号分隔。</span>
        </div>
        <datablau-input
          class="insert-editor-input"
          style="margin-top: 12px;"
          resize="none"
          v-model="insertEditorValue"
          placeholder="请输入"
          type="textarea"
        ></datablau-input>
      </div>
      <div slot="footer">
        <datablau-button @click="showInsertEditor = false,insertEditorValue=''">
          取消
        </datablau-button>
        <datablau-button
          type="important"
          :disabled="!insertEditorValue"
          @click="confirmInsertEdit"
        >
          确定
        </datablau-button>
      </div>
    </datablau-dialog>
    <datablau-dialog
      title="选择目录"
      :visible.sync="showModeCategory"
      size="l"
      append-to-body
      custom-class="new-model-select-model-category-dialog"
    >
      <div class="tree-container">
        <div class="filter-line">
          <datablau-input
            v-model="keyword"
            :iconfont-state="true"
            :placeholder="$store.state.$v.common.placeholder"
            clearable
          ></datablau-input>
        </div>
        <div class="tree-outer">
          <db-tree
            node-key="id"
            class="category-tree"
            :props="moveTreeDefaultProps"
            :data="treeData"
            :data-supervise="true"
            :data-icon-function="dataIconFunction"
            ref="tree2"
            :default-expand-all="false"
            :default-expanded-keys="defaultkey"
            :filter-node-method="filterNode"
            :expand-on-click-node="true"
            @node-click="chooseMoveCategoryNode"
            :showLockedMessage="false"
            v-if="showModeCategory"
          ></db-tree>
        </div>
      </div>
      <div slot="footer">
        <datablau-button type="secondary" @click="showModeCategory = false">
          取消
        </datablau-button>
        <datablau-button
          type="primary"
          :disabled="!chosenMoveCategoryId"
          @click="handleMoveCategory"
        >
          确定
        </datablau-button>
      </div>
    </datablau-dialog>
    <datablau-form
      class="page-form"
      label-width="132px"
      ref="form"
      :model="formData"
      :rules="rules"
    >
      <el-form-item
        :label="'逆向范围'"
        prop="reverseRange"
      >
        <datablau-checkbox v-if="ds.dbtype !== 'MONGODB'" v-model="formData.reverseRange" @change="handleReverseRangeChange">
          <el-checkbox label="Table">表</el-checkbox>
          <el-checkbox label="View">视图</el-checkbox>
          <el-checkbox label="Relationship">关系</el-checkbox>
          <el-checkbox v-if="ds.dbtype === 'ORACLE' || ds.dbtype === 'OPENGAUSS' || ds.dbtype === 'DB2LUW'" label="Tablespace">Tablespace</el-checkbox>
          <el-checkbox v-if="ds.dbtype === 'ORACLE' || ds.dbtype === 'OPENGAUSS' || ds.dbtype === 'POSTGRESQL' || ds.dbtype === 'DB2LUW'" label="Sequence">Sequence</el-checkbox>
          <el-checkbox v-if="ds.dbtype === 'ORACLE'" label="Synonym">Synonym</el-checkbox>
        </datablau-checkbox>
        <div v-else class="filter-wrapper" style="margin-top: 10px">
          <datablau-tree
            style="width: 100%"
            show-checkbox
            :data="filterTreeData"
            :props="defaultProps"
            node-key="label"
            default-expand-all
            :data-icon-function="dataIconFunctionFilter"
            :default-checked-keys="defaultCheckedKeys"
            @check="filterCheckChanged"
          ></datablau-tree>
        </div>
      </el-form-item>
      <el-form-item
        :label="'逆向结果'"
        v-if="existResult"
      >
        <div class="filter-wrapper" v-loading="loading">
          <datablau-tabs v-if="existTab" style="display: inline-block;margin-right: 12px;" type="card" v-model="activeTab">
            <el-tab-pane label="表" name="table"></el-tab-pane>
            <el-tab-pane label="视图" name="view"></el-tab-pane>
          </datablau-tabs>
          <div v-if="ds.dbtype !== 'MONGODB'" v-show="activeTab === 'table'" :style="!existTab?'margin-top: 0':''" class="result-wrapper">
            <datablau-radio
              style="display: inline-block"
              v-model="allTables"
              @change="handleTableSwitchChange"
            >
              <el-radio :label="true">所有表</el-radio>
              <el-radio :label="false">选取表</el-radio>
            </datablau-radio>
            <datablau-button :disabled="allTables" @click="getDsTableData" type="text">从服务器获取</datablau-button><span style="color: #ddd;font-size: 12px;">|</span><datablau-button :disabled="allTables" @click="showInsertEditorDialog('table')" type="text">手动输入</datablau-button>
            <div style="float: right;">
              <datablau-input :disabled="allTables" style="display: inline-block;width: 160px;" v-model="tableQuery" placeholder="搜索表" :iconfont-state="true"></datablau-input>
              <datablau-button :disabled="allTables" style="margin-left: 20px;" @click="handleFilterTableDataChecked(true)">全选</datablau-button>
              <datablau-button :disabled="allTables" @click="handleFilterTableDataChecked(false)" type="cancel"></datablau-button>
            </div>
          </div>
          <div v-show="activeTab === 'view'" :style="!existTab?'margin-top: 0':''" class="result-wrapper">
            <datablau-radio
              style="display: inline-block"
              v-model="allViews"
              @change="handleViewSwitchChange"
            >
              <el-radio :label="true">所有视图</el-radio>
              <el-radio :label="false">选取视图</el-radio>
            </datablau-radio>
            <datablau-button :disabled="allViews" @click="getDsViewData" type="text">从服务器获取</datablau-button><span style="color: #ddd;font-size: 12px;">|</span><datablau-button :disabled="allViews" @click="showInsertEditorDialog('view')" type="text">手动输入</datablau-button>
            <div style="float: right;">
              <datablau-input :disabled="allViews" style="display: inline-block;width: 160px;" v-model="viewQuery" placeholder="搜索视图" :iconfont-state="true"></datablau-input>
              <datablau-button :disabled="allViews" style="margin-left: 20px;" @click="handleFilterViewDataChecked(true)">全选</datablau-button>
              <datablau-button :disabled="allViews" @click="handleFilterViewDataChecked(false)" type="cancel"></datablau-button>
            </div>
          </div>
          <div class="table content-wrapper" v-show="activeTab === 'table'">
            <datablau-form-submit :class="{'less-top': !existTab}" class="tableCon">
              <datablau-table
                :key="tableKey"
                :data-selectable="true"
                :auto-hide-selection="false"
                :data="tableShowData"
                @selection-change="handleTableSelectionChange"
                :reserve-selection="true"
                :row-key="(row) => row"
                height="100%"
                ref="tableRef"
              >
                <el-table-column
                  label="表名称"
                  min-width="150"
                  show-overflow-tooltip>
                  <template slot-scope="scope">
                    <div>
                      <img :src="tableImg" style="width: 20px;height: 20px;margin-right: 6px;" />{{scope.row}}
                    </div>
                  </template>
                </el-table-column>
                <template v-if="allTables" slot="empty">
                  <div style="font-size: 12px;">
                    <img style="width: 64px;height: 64px" :src="allDataImg" alt="">已选所有表
                  </div>
                </template>
              </datablau-table>
              <template v-if="!allTables" slot="buttons">
                <div style="float: left;line-height: 30px;font-size: 12px;">
                  <span>选中数：{{tableSelection.length}}</span>
                </div>
                <datablau-pagination
                  style="float: right;"
                  @size-change="handleTableSizeChange"
                  @current-change="handleTableCurrentChange"
                  :page-sizes="[20, 50, 100]"
                  :pager-count="5"
                  :page-size="tablePage.pageSize"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="tablePage.total">
                </datablau-pagination>
              </template>
            </datablau-form-submit>
          </div>
          <div class="table content-wrapper" v-show="activeTab === 'view'">
            <datablau-form-submit :class="{'less-top': !existTab}" class="tableCon">
              <datablau-table
                :key="viewKey"
                :data-selectable="true"
                :auto-hide-selection="false"
                :data="viewShowData"
                @selection-change="handleViewSelectionChange"
                :reserve-selection="true"
                :row-key="(row) => row"
                height="100%"
                ref="viewRef"
              >
                <el-table-column
                  label="视图名称"
                  min-width="150"
                  show-overflow-tooltip>
                  <template slot-scope="scope">
                    <div>
                      <img :src="viewImg" style="width: 20px;height: 20px;margin-right: 6px;" />{{scope.row}}
                    </div>
                  </template>
                </el-table-column>
                <template v-if="allViews" slot="empty">
                  <div style="font-size: 12px;">
                    <img style="width: 64px;height: 64px" :src="allDataImg" alt="">已选所有视图
                  </div>
                </template>
              </datablau-table>
              <template v-if="!allViews" slot="buttons">
                <div style="float: left;line-height: 30px;font-size: 12px;">选中数：{{viewSelection.length}}</div>
                <datablau-pagination
                  @size-change="handleViewSizeChange"
                  @current-change="handleViewCurrentChange"
                  :page-sizes="[20, 50, 100]"
                  :page-size="viewPage.pageSize"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="viewPage.total">
                </datablau-pagination>
              </template>
            </datablau-form-submit>
          </div>
        </div>
      </el-form-item>
      <el-form-item
        :label="'逆向至模型目录'"
        prop="path"
      >
        <datablau-input maxlength="40" readonly style="cursor: pointer;" v-model="formData.path"
                        @click.native="showModeCategory=true"></datablau-input>
      </el-form-item>
      <el-form-item
        :label="'模型名称'"
        prop="modelName"
      >
        <datablau-input v-model="formData.modelName"></datablau-input>
      </el-form-item>
      <el-form-item
        :label="'中文名补充'"
        prop="comment"
      >
        <datablau-checkbox :checkboxType="'single'" v-model="formData.comment">
          数据库comment设定为表/字段中文名
        </datablau-checkbox>
      </el-form-item>
    </datablau-form>
  </div>
</template>

<script>
import dbTree from '@/views/modelLibrary/tree/DatablauTree.vue'
import sort from '@/resource/utils/sort'
import HTTP from '@/resource/http'
import { v4 as uuidv4 } from 'uuid'
import allDataImg from '@/views/common/navIcon/allData.svg'
import viewImg from '@/assets/images/mxgraphEdit/View.svg'
import tableImg from '@/assets/images/mxgraphEdit/Table.svg'

export default {
  data () {
    return {
      tableKey: 0,
      viewKey: 0,
      reverseBaseUrl: '/ddm-re-instance',
      tableImg,
      viewImg,
      filterTableData: [],
      filterViewData: [],
      filterTableDataChecked: false,
      insertEditorValue: '',
      showInsertEditor: false,
      defaultCheckedKeys: ['Collection', 'Field', 'Index', 'IndexMember', 'Shard', 'PatternView', 'DBRef', 'Database'],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      filterTreeData: [{
        label: 'Collection',
        children: [{
          label: 'Field'
        }, {
          label: 'Index',
          children: [{
            label: 'IndexMember'
          }]
        }, {
          label: 'Shard'
        }, {
          label: 'PatternView'
        }]
      }, {
        label: 'DBRef'
      }, {
        label: 'Database'
      }],
      allDataImg,
      ds: {},
      modelCategoryMap: new Map(),
      tableData: [],
      tableShowData: null,
      tablePage: {
        current: 1,
        pageSize: 20,
        total: 0
      },
      tableSelection: [],
      viewData: [],
      viewShowData: null,
      viewPage: {
        current: 1,
        pageSize: 20,
        total: 0
      },
      viewSelection: [],
      formData: {
        reverseRange: ['Table', 'View', 'Relationship'],
        path: '',
        pathId: 0,
        comment: false,
        modelName: ''
      },
      activeTab: 'table',
      tableQuery: '',
      allTables: true,
      viewQuery: '',
      allViews: true,
      keyword: '',
      moveTreeDefaultProps: {
        label: 'name',
        children: 'children',
        id: 'id'
      },
      treeData: null,
      chosenMoveCategoryId: null,
      showModeCategory: false,
      defaultkey: [1],
      rules: {
        path: [
          { required: true, message: '请选择模型目录', trigger: ['change', 'blur'] }
        ],
        modelName: [
          { required: true, message: '请输入模型名称', trigger: 'blur' },
          { min: 4, max: 40, message: '长度在 4 到 40 个字符', trigger: 'blur' }
        ]
      },
      userClick: true,
      loading: false
    }
  },
  watch: {
    disabledReverseConfirm (val) {
      this.$emit('diabledConfirm', val)
    },
    showModeCategory (newVal) {
      this.keyword = ''
      if (newVal) {
        this.getModelsTree()
      }
    },
    tableQuery () {
      if (!this.allTables) {
        this.tablePage.current = 1
        this.getTableData()
      }
    },
    viewQuery () {
      if (!this.allViews) {
        this.viewPage.current = 1
        this.getViewData()
      }
    },
    keyword (val) {
      this.$refs.tree2.filter(val)
    }
  },
  components: {
    dbTree
  },
  computed: {
    disabledReverseConfirm () {
      if (this.ds.dbtype !== 'MONGODB' && !this.formData.reverseRange.includes('Table') && !this.formData.reverseRange.includes('View') && !this.formData.reverseRange.includes('Tablespace') && !this.formData.reverseRange.includes('Sequence') && !this.formData.reverseRange.includes('Synonym')) {
        return true
      } else if (!this.allTables && !this.tableSelection.length) {
        return true
      } else if (!this.allViews && !this.viewSelection.length) {
        return true
      } else {
        return false
      }
    },
    existTab () {
      return this.ds.dbtype !== 'MONGODB' && this.formData.reverseRange.includes('Table') && this.formData.reverseRange.includes('View')
    },
    existResult () {
      return this.ds.dbtype === 'MONGODB' || this.formData.reverseRange.includes('Table') || this.formData.reverseRange.includes('View')
    }
  },
  mounted () {
    this.$bus.$on('sendStepOneData', this.setDsData)
    setTimeout(() => {
      this.tableShowData = [] // 显示slot
      this.viewShowData = []
    })
  },
  beforeDestroy () {
    this.$bus.$off('sendStepOneData')
  },
  methods: {
    dataIconFunctionFilter (data, node) {
      if (node.expanded) {
        return 'iconfont icon-openfile'
      } else {
        return 'iconfont icon-file'
      }
    },
    handleReverseRangeChange (val) {
      if (this.ds.dbtype === 'MONGODB') {
        this.activeTab = 'view'
      } else if (val.includes('Table')) {
        this.activeTab = 'table'
      } else if (val.includes('View')) {
        this.activeTab = 'view'
      }
    },
    handleFilterTableDataChecked (value) {
      if (value) {
        this.tableSelection = this.filterTableData
        this.userClick = false
        this.tableData.forEach(row => {
          if (value) {
            if (this.filterTableData.includes(row)) {
              this.$refs.tableRef.toggleRowSelection(row, true)
            } else {
              this.$refs.tableRef.toggleRowSelection(row, false)
            }
          } else {
            this.$refs.tableRef.toggleRowSelection(row, value)
          }
        })
        this.userClick = true
      } else {
        this.tableSelection = []
        this.tableKey++
      }
    },
    handleFilterViewDataChecked (value) {
      if (value) {
        this.viewSelection = this.filterViewData
        this.userClick = false
        this.viewData.forEach(row => {
          if (value) {
            if (this.filterViewData.includes(row)) {
              this.$refs.viewRef.toggleRowSelection(row, true)
            } else {
              this.$refs.viewRef.toggleRowSelection(row, false)
            }
          } else {
            this.$refs.viewRef.toggleRowSelection(row, value)
          }
        })
        this.userClick = true
      } else {
        this.viewSelection = []
        this.viewKey++
      }
    },
    confirmInsertEdit () {
      if (this.nowEdit === 'table') {
        this.tableQuery = ''
        this.tableData = this.insertEditorValue.split(';').map(i => i.trim()).filter(i => i)
        this.tablePage.total = this.tableData.length
        this.tablePage.current = 1
        this.tableSelection = this.tableData
        this.getTableData()
        this.userClick = false
        this.tableData.forEach(row => {
          this.$refs.tableRef.toggleRowSelection(row, true)
        })
        this.userClick = true
      } else if (this.nowEdit === 'view') {
        this.viewQuery = ''
        this.viewData = this.insertEditorValue.split(';').map(i => i.trim()).filter(i => i)
        this.viewPage.total = this.viewData.length
        this.viewPage.current = 1
        this.viewSelection = this.viewData
        this.getViewData()
        this.userClick = false
        this.viewData.forEach(row => {
          this.$refs.viewRef.toggleRowSelection(row, true)
        })
        this.userClick = true
      }
      this.insertEditorValue = ''
      this.showInsertEditor = false
    },
    showInsertEditorDialog (type) {
      if (type === 'table') {
        this.userClick = false
        this.tableSelection.forEach(row => {
          this.$refs.tableRef.toggleRowSelection(row, false)
        })
        this.userClick = true
      } else if (type === 'view') {
        this.userClick = false
        this.viewSelection.forEach(row => {
          this.$refs.viewRef.toggleRowSelection(row, false)
        })
        this.userClick = true
      }
      this.nowEdit = type
      this.showInsertEditor = true
    },
    filterCheckChanged (nodeData, { checkedNodes, halfCheckedNodes }) {
      this.formData.reverseRange = [...checkedNodes.map(i => i.label), ...halfCheckedNodes.map(i => i.label)]
    },
    resetData () {
      this.$refs.form.resetFields()
      this.allTables = true
      this.tableShowData = []
      this.tablePage.total = 0
      this.allViews = true
      this.viewShowData = []
      this.viewPage.total = 0
    },
    handleViewSelectionChange (selection) {
      if (this.userClick) {
        this.viewSelection = selection
      }
    },
    handleTableSelectionChange (selection) {
      if (this.userClick) {
        this.tableSelection = selection
      }
    },
    handleTableSizeChange (size) {
      this.tablePage.pageSize = size
      this.getTableData()
    },
    handleTableCurrentChange (current) {
      this.tablePage.current = current
      this.getTableData()
    },
    getTableData () {
      if (this.tableQuery) {
        let tempData = this.tableData.filter(tableName => tableName.toLowerCase().indexOf(this.tableQuery.toLowerCase()) > -1)
        this.filterTableData = tempData
        this.tablePage.total = tempData.length
        this.tableShowData = tempData.slice((this.tablePage.current - 1) * this.tablePage.pageSize, this.tablePage.current * this.tablePage.pageSize)
      } else {
        this.filterTableData = this.tableData
        this.tablePage.total = this.tableData.length
        this.tableShowData = this.tableData.slice((this.tablePage.current - 1) * this.tablePage.pageSize, this.tablePage.current * this.tablePage.pageSize)
      }
    },
    handleViewSizeChange (size) {
      this.viewPage.pageSize = size
      this.getViewData()
    },
    handleViewCurrentChange (current) {
      this.viewPage.current = current
      this.getViewData()
    },
    getViewData () {
      if (this.viewQuery) {
        let tempData = this.viewData.filter(viewName => viewName.toLowerCase().indexOf(this.viewQuery.toLowerCase()) > -1)
        this.filterViewData = tempData
        this.viewPage.total = tempData.length
        this.viewShowData = tempData.slice((this.viewPage.current - 1) * this.viewPage.pageSize, this.viewPage.current * this.viewPage.pageSize)
      } else {
        this.viewPage.total = this.viewData.length
        this.filterViewData = this.viewData
        this.viewShowData = this.viewData.slice((this.viewPage.current - 1) * this.viewPage.pageSize, this.viewPage.current * this.viewPage.pageSize)
      }
    },
    handleTableSwitchChange (val) {
      if (!val) {
        this.tableSelection = []
        this.tableShowData = []
        // this.getDsTableData()
      } else {
        this.tableShowData = []
        this.tablePage.total = 0
        this.tableQuery = ''
      }
    },
    handleViewSwitchChange (val) {
      if (!val) {
        this.viewSelection = []
        this.viewShowData = []
        // this.getDsViewData()
      } else {
        this.viewShowData = []
        this.viewPage.total = 0
        this.tableQuery = ''
      }
    },
    confirmReverseDatabase () {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          this.$emit('diabledConfirm', true)
          try {
            let res = await this.$http.get(this.$url + `/service/models/duplicated?categoryId=${this.formData.pathId}&modelName=${this.formData.modelName}`)
            // if (res.data.subModels?.filter(item => !item.branch).map(item => item.name).includes(this.formData.modelName)) {
            //   this.$datablauMessage.error(`该${this.formData.path}目录下有同名${this.formData.modelName}, 请修改名称后再逆向`)
            //   return
            // }
            if (res.data) {
              this.$datablauMessage.error(`该${this.formData.path}目录下有同名${this.formData.modelName}, 请修改名称后再逆向`)
              this.$emit('diabledConfirm', false)
              return
            }
          } catch (err) {
            this.$showFailure(err)
          }
          let ds = this.ds
          let uuid = uuidv4()
          let options = {
            SelectByType: this.formData.reverseRange.join(';'),
            FilterByType: null,
            SelectedByNames: this.allTables ? null : this.tableSelection.join(';'),
            SelectedViews: this.allViews ? null : this.viewSelection.join(';'),
            SelectedSchemas: ds.schemas.join(';'),
            FilteredSchemas: null,
            CommentToLogicalName: this.formData.comment,
            Options: {
              InferDepth: 5,
              CoverageThreshold: 10,
              ScanCount: 1000,
              ThreadPoolSize: 2
            }
          }
          this.$http.post(`${this.reverseBaseUrl}/service/re/bin/save/to/server?modelInfo=${encodeURIComponent(JSON.stringify({
            name: this.formData.modelName,
            description: '',
            categoryId: this.formData.pathId,
            type: ds.dbtype
          }))}`, {
            'connInfo': {
              'address': ds.hostname,
              'port': ds.dbport,
              'database': ds.dbtype === 'ORACLE' ? 'SID:' + ds.dbname : ds.dbname,
              'authDatabase': null,
              'jdbcUrl': ds.connUrl,
              'selectedSchemas': ds.schemas,
              'type': ds.dbtype,
              'useKerberos': false,
              'cred': {
                'user': ds.username,
                'password': ds.password,
                'encrypt': false,
                'rememberPassword': false
              },
              'kerberosInfo': null,
              'driverId': ds.driverValue,
              'driverClassname': ds.driverClassName,
              'reFromLocal': false,
              'driverPath': null,
              'driverJarName': null,
              'JavaCommand': [
                ' ',
                '-type',
                ds.dbtype,
                '-addr',
                ds.hostname,
                '-port',
                ds.dbport,
                '-user',
                ds.username,
                '-pass',
                ds.password,
                '-dcn',
                ds.driverClassName,
                '-db',
                ds.dbtype === 'ORACLE' ? 'sid:' + ds.dbname : ds.dbname,
                '-ss',
                '"' + ds.schemas.join(';') + '"'
              ]
            },
            'options': JSON.stringify(options),
            'jobId': uuid,
            'JavaCommand': [
              ' ',
              '-type',
              ds.dbtype,
              '-addr',
              ds.hostname,
              '-port',
              ds.dbport,
              '-user',
              ds.username,
              '-pass',
              ds.password,
              '-dcn',
              ds.driverClassName,
              '-db',
              ds.dbtype === 'ORACLE' ? 'sid:' + ds.dbname : ds.dbname,
              '-ss',
              '"' + ds.schemas.join(';') + '"',
              '-opts',
              '"' + JSON.stringify(options) + '"'
            ]
          }).then(res => {
            // console.log(res.data)
            let taskStr = localStorage.getItem('taskIds')
            if (taskStr) {
              let taskArr = JSON.parse(taskStr)
              taskArr.unshift({
                dbtype: ds.dbtype,
                taskId: uuid,
                timestamp: Date.now(),
                modelName: this.formData.modelName
              })
              localStorage.setItem('taskIds', JSON.stringify(taskArr))
            } else {
              let taskArr = [{
                dbtype: ds.dbtype,
                taskId: uuid,
                timestamp: Date.now(),
                modelName: this.formData.modelName
              }]
              localStorage.setItem('taskIds', JSON.stringify(taskArr))
            }
            this.$datablauMessage.success('开始逆向，请在任务中查看进度')
            this.$bus.$emit('openReverseTaskInfoDialog')
            this.$emit('closeDialog')
          }).catch(err => {
            this.$showFailure(err)
          }).finally(() => {
            this.$emit('diabledConfirm', false)
          })
        }
      })
    },
    getDsViewData () {
      this.userClick = false
      this.viewSelection.forEach(row => {
        this.$refs.viewRef.toggleRowSelection(row, false)
      })
      this.userClick = true
      this.loading = true
      let ds = this.ds
      this.$http.post(this.reverseBaseUrl + '/service/re/databases/views', {
        'address': ds.hostname,
        'port': ds.dbport,
        'database': ds.dbtype === 'ORACLE' ? 'SID:' + ds.dbname : ds.dbname,
        'authDatabase': null,
        'jdbcUrl': ds.connUrl,
        'selectedSchemas': ds.schemas,
        'type': ds.dbtype,
        'useKerberos': false,
        'cred': {
          'user': ds.username,
          'password': ds.password,
          'encrypt': false,
          'rememberPassword': false
        },
        'kerberosInfo': null,
        'driverId': ds.driverValue,
        'driverClassname': ds.driverClassName,
        'reFromLocal': false,
        'driverPath': null,
        'driverJarName': null,
        'JavaCommand': [
          ' ',
          '-type',
          ds.dbtype,
          '-addr',
          ds.hostname,
          '-port',
          ds.dbport,
          '-user',
          ds.username,
          '-pass',
          ds.password,
          '-dcn',
          ds.driverClassName,
          '-db',
          ds.dbtype === 'ORACLE' ? 'sid:' + ds.dbname : ds.dbname,
          '-ss',
          '"' + ds.schemas.join(';') + '"'
        ]
      }).then(res => {
        // console.log(res.data)
        this.viewData = Array.from(new Set(res.data))
        this.viewPage.total = this.viewData.length
        this.viewPage.current = 1
        this.viewSelection = this.viewData
        this.getViewData()
        this.userClick = false
        this.viewData.forEach(row => {
          this.$refs.viewRef.toggleRowSelection(row, true)
        })
        this.userClick = true
      }).catch(err => {
        this.$showFailure(err)
      }).finally(() => {
        this.loading = false
      })
    },
    getDsTableData () {
      // 清空之前选中
      this.userClick = false
      this.tableSelection.forEach(row => {
        this.$refs.tableRef.toggleRowSelection(row, false)
      })
      this.userClick = true
      this.loading = true
      let ds = this.ds
      this.$http.post(this.reverseBaseUrl + '/service/re/databases/tables', {
        'address': ds.hostname,
        'port': ds.dbport,
        'database': ds.dbtype === 'ORACLE' ? 'SID:' + ds.dbname : ds.dbname,
        'authDatabase': null,
        'jdbcUrl': ds.connUrl,
        'selectedSchemas': ds.schemas,
        'type': ds.dbtype,
        'useKerberos': false,
        'cred': {
          'user': ds.username,
          'password': ds.password,
          'encrypt': false,
          'rememberPassword': false
        },
        'kerberosInfo': null,
        'driverId': ds.driverValue,
        'driverClassname': ds.driverClassName,
        'reFromLocal': false,
        'driverPath': null,
        'driverJarName': null,
        'JavaCommand': [
          ' ',
          '-type',
          ds.dbtype,
          '-addr',
          ds.hostname,
          '-port',
          ds.dbport,
          '-user',
          ds.username,
          '-pass',
          ds.password,
          '-dcn',
          ds.driverClassName,
          '-db',
          ds.dbtype === 'ORACLE' ? 'sid:' + ds.dbname : ds.dbname,
          '-ss',
          '"' + ds.schemas.join(';') + '"'
        ]
      }).then(res => {
        // console.log(res.data)
        this.tableData = Array.from(new Set(res.data))
        this.tablePage.total = this.tableData.length
        this.tablePage.current = 1
        this.tableSelection = this.tableData
        this.getTableData()
        this.userClick = false
        this.tableData.forEach(row => {
          this.$refs.tableRef.toggleRowSelection(row, true)
        })
        this.userClick = true
      }).catch(err => {
        this.$showFailure(err)
      }).finally(() => {
        this.loading = false
      })
    },
    setDsData (ds) {
      this.ds = ds
      if (this.ds.dbtype === 'MONGODB') {
        this.formData.reverseRange = ['Collection', 'Field', 'Index', 'IndexMember', 'Shard', 'PatternView', 'DBRef', 'Database']
        this.activeTab = 'view'
      } else if (this.ds.dbtype === 'ORACLE') {
        this.formData.reverseRange = ['Table', 'View', 'Relationship', 'Tablespace', 'Sequence', 'Synonym']
        this.activeTab = 'table'
      } else if (this.ds.dbtype === 'OPENGAUSS' || this.ds.dbtype === 'DB2LUW') {
        this.formData.reverseRange = ['Table', 'View', 'Relationship', 'Tablespace', 'Sequence']
        this.activeTab = 'table'
      } else if (this.ds.dbtype === 'POSTGRESQL') {
        this.formData.reverseRange = ['Table', 'View', 'Relationship', 'Sequence']
        this.activeTab = 'table'
      } else {
        this.formData.reverseRange = ['Table', 'View', 'Relationship']
        this.activeTab = 'table'
      }
    },
    pushModels (treeData) {
      const forEach = node => {
        if (!node) return
        if (this.modelCategoryMap.has(node.id)) {
          node.models = this.modelCategoryMap.get(node.id)
        }
        if (node.children) {
          node.children.forEach(item => {
            forEach(item)
          })
        }
      }
      forEach(treeData)
    },
    handleMoveCategory () {
      this.formData.path = this.cateGoryData.name
      this.formData.pathId = this.cateGoryData.id
      this.showModeCategory = false
    },
    getModelsTree (callback) {
      let categoryMap = {}
      const sortModelLib = (result, bindDam = false) => {
        // 递归 增加判断 是否已经绑定 dam 系统
        // childrenBindDam: 自身 或者 子目录 绑定了 dam 系统
        result.childrenBindDam = false
        categoryMap[result.id] = result
        if (result.damModelCategoryId) {
          result.childrenBindDam = true
        }
        result.parentBindDam = !!bindDam
        if (result.children) {
          sort.sortConsiderChineseNumber(result.children, 'name')
          result.children.forEach(item => {
            // 排序 并 返回 是否绑定 dam 系统
            if (sortModelLib(item, !!item.damModelCategoryId || result.parentBindDam)) {
              result.childrenBindDam = true
            }
          })
        }

        return !!result.childrenBindDam
      }
      const handler = (result) => {
        this.rootModelId = result.id
        sortModelLib(result)
        this.pushModels(result)
        this.treeData = [result]
        this.treeDataLoaded = true
        this.categoryMap = categoryMap
        setTimeout(() => {
          callback && callback()
        })
      }
      if (this.$store.state.modelsTree) {
        handler(this.$store.state.modelsTree)
      } else {
        HTTP.getDDMCategories({
          successCallback: handler
        })
      }
    },
    dataIconFunction (data, node) {
      if (node.level === 1) {
        return 'tree-icon model'
      }
      if (node.data.damModelCategoryId) {
        if (node.expanded) {
          return 'iconfont icon-openfilebinding'
        } else {
          return 'iconfont icon-filebinding'
        }
      } else {
        if (node.expanded) {
          return 'iconfont icon-openfile'
        } else {
          return 'iconfont icon-file'
        }
      }
    },
    filterNode (value, data, node) {
      let keyword = _.trim(value)
      if (!keyword) {
        return true
      }
      if (!data.name) {
        return false
      }
      let hasValue = false
      let current = node
      do {
        if (this.$MatchKeyword(node.data, keyword, 'name')) {
          hasValue = true
        }
        current = current.parent
      } while (current && !Array.isArray(current.data))
      return hasValue
    },
    async chooseMoveCategoryNode (data, node) {
      if (data.id === 1) {
        this.$datablauMessage({
          message: '不能选择根目录',
          type: 'error',
          showClose: true
        })
        this.$refs.tree2.setCurrentKey(null)
        this.chosenMoveCategoryId = null
        return
      } else if (!this.$store.state.user.isAdmin) {
        try {
          let res = await this.$http.get(this.$url + `/service/permissions/categories/${data.id}?`)
          if (!res.data.editor) {
            this.$datablauMessage({
              message: '该目录不具有写权限',
              type: 'error',
              showClose: true
            })
            this.$refs.tree2.setCurrentKey(null)
            this.chosenMoveCategoryId = null
            return
          }
        } catch (err) {
          this.$showFailure(err)
        }
      }
      this.chosenMoveCategoryId = data.id
      this.cateGoryData = data
      this.setPathStr(node, [])
    },
    setPathStr (node, ary) {
      ary.unshift(node.data.name)
      if (node.parent.data.parentId !== 0) {
        this.setPathStr(node.parent, ary)
      } else {
        ary.unshift(node.parent.data.name)
      }
      this.cateGoryData.path = '/' + ary.join('/')
    }
  }
}
</script>

<style lang="scss" scoped>
.datablau-radio .el-radio {
  margin-right: 10px;
}
.insert-editor-input {
  /deep/ textarea {
    width: 600px;
    height: 398px;
  }
}
.filter-wrapper {
  border: 1px solid #ddd;
  border-radius: 2px;
  padding: 8px;
  .result-wrapper {
    margin-top: -30px;
  }
  .content-wrapper {
    height: 334px;
    .tableCon{
      position: absolute;
      top: 86px;
      left: 1px;
      right: 1px;
      bottom: 1px;
      &.less-top {
        top: 47px;
      }
    }
  }
}
.tree-container {
  position: relative;
  height: 100%;
  min-height: 400px;
  //overflow: auto;
  //border: 1px solid red;
  width: 100%;

  .filter-line {
    .datablau-input {
      width: 100%;
    }
  }
  .tree-outer {
    position: absolute;
    left: 0;
    right: 0;
    top: 50px;
    bottom: 0;
    overflow: auto;
  }
}
</style>
