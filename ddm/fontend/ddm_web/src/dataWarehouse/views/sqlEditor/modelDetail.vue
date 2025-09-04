<template>
  <div class="model-detail-ddd-list">
    <!--<datablau-dialog
      class="dialog-wrapper"
      :visible.sync="editTableDialog"
      title="编辑表"
      append-to-body
      @close="closeTableDetails"
      height="700"
      size="xl">
      <table-details
      ref="tableDetails"
        key="tableDetailsKey"
        v-if="tables[0] && currentModel"
        :rawData="tables[0]"
        :current-model="currentModel"
        :data-by-type="dataByType"
        :isLogicalModel="isDesignModel"
        @updateTabName="updateTabName"
        @updateVersion="updateVersion"
        @updateTableData="updateTableData"
        :typeDataWareHouse="true"
        :TypeUniqueIdToColumnDefaultType="TypeUniqueIdToColumnDefaultType"
      >
      </table-details>
    </datablau-dialog>-->
    <datablau-dialog
      title="选择审批人"
      :visible.sync="selectApprover"
      :modal-append-to-body="true"
      size="s"
    >
      <datablau-form size="small" label-width="85px">
        <el-form-item label="选择审批人" required>
          <datablau-select
            v-model="approver"
            size="mini"
            clearable
            style="width: 100%"
            filterable
            remote
            multiple
            :remote-method="remoteMethod"
            @focus="changeApproverlList('')"
            @clear="changeApproverlList('')"
            @change="changeApproverlList"
            v-selectLazyLoad="approverListloading"
          >
            <el-option
              v-for="v in userList"
              :key="v.username"
              :label="v.fullUserName+'('+v.username+')'"
              :value="v.username"
            ></el-option>
          </datablau-select>
        </el-form-item>
      </datablau-form>
      <div slot="footer">
        <datablau-button @click="approver=[],selectApprover=false">
          取消
        </datablau-button>
        <datablau-button type="important" :disabled="!approver.length" @click="approverBtn">
          确定
        </datablau-button>
      </div>
    </datablau-dialog>
    <div class="modelDetailSearch" >
      <datablau-input :themeBlack="true" style="width: 200px;display: inline-block;margin-right: 16px;" v-model="query" placeholder="请输入查询的表名" clearable @input="changeTable"></datablau-input>
      <span class="select-label">模型主题</span>
      <datablau-select :themeBlack="true" style="width: 200px;display: inline-block;margin-right: 16px;" placeholder="请选择模型主题" multiple v-model="theme" clearable @change="changeTable">
        <el-option v-for="item in themes"
         :key="item"
         :label="item"
          :value="item">
        </el-option>
      </datablau-select>
      <span class="select-label">状态</span>
      <datablau-select :themeBlack="true" style="width: 100px;display: inline-block;margin-right: 16px;" v-model="status" @change="changeTable">
        <el-option key="全部" label="全部" value=""></el-option>
        <el-option v-for="(val, key) in statusArr"
                   :key="key"
                   :label="val"
                   :value="key">
        </el-option>
      </datablau-select>
      <div style="display: inline-block;float:right;"  v-if="this.auth.isAdmin || this.auth['MODEL_EDIT']">
        <datablau-button :themeBlack="true" type="normal" @click="releaseBtn" class="iconfont icon-publish" :disabled="!selectionList.length || item.endVersion.name === 'Latest Version'">
          <datablau-tooltip class="item" effect="dark" content="模型终止版本为latest version不能发起评审" :disabled="item.endVersion.name !== 'Latest Version'" placement="top">
           <span> 评审</span>
          </datablau-tooltip>
         </datablau-button>
        <datablau-button :themeBlack="true" type="normal" @click="newTable" class="iconfont icon-tianjia"> 新建表</datablau-button>
        <datablau-button :themeBlack="true" type="normal" style="float: right" @click="dataMapping" class="iconfont icon-SQL" :disabled="!selectionList.length"> 映射生成</datablau-button>
        <datablau-button :themeBlack="true" type="normal" style="float: right" @click="openDesignModel" class="iconfont icon-bianji"> 编辑模型</datablau-button>
      </div>
    </div>
    <datablau-form-submit style="top:50px">
      <datablau-table
        :data="tableShowData"
        class="tableMOdelDetail"
        @selection-change="handleSelectionChange"
        row-key="id"
        :themeBlack="true"
      >
<!--                  :selectable="selected"
-->
        <el-table-column
          type="selection"
          width="25"
        >
        </el-table-column>
        <el-table-column width="30" header-align="center" align="center">
          <template slot-scope="scope">
            <datablau-icon  datablau-icon :data-type="scope.row.type === 'TABLE' ? 'table' : 'table'" icon-type="svg" :size="20" ></datablau-icon>
          </template>
        </el-table-column>
        <!--<el-table-column
          prop="alias"
          label="表中文名"
          min-width="150"
          show-overflow-tooltip>
        </el-table-column>-->
        <el-table-column
          prop="tableName"
          label="表名"
          min-width="150"
          show-overflow-tooltip>
          <template slot-scope="{row}">
            {{row.tableName}}{{row.alias && `（${row.alias}）`}}
          </template>
        </el-table-column>
        <el-table-column
          prop="diagram"
          label="模型主题"
          show-overflow-tooltip>
          <template slot-scope="scope">
            {{scope.row.diagram.join(',')}}
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          label="状态"
          show-overflow-tooltip>
          <template slot-scope="scope">
            <datablau-status
              style="width: 150px"
              :type="statusTypeList[scope.row.status]"
              :desc="typeText[scope.row.status]"
            ></datablau-status>
          </template>
        </el-table-column>
        <el-table-column
          prop="owner"
          label="创建人"
          show-overflow-tooltip>
        </el-table-column>
        <el-table-column
          prop="createTime"
          label="创建时间"
          :formatter="$timeFormatter"
          show-overflow-tooltip>
        </el-table-column>
        <el-table-column
        fixed="right"
          label="操作">
          <template slot-scope="scope">
            <div v-if="!scope.row.exist">该表已被删除，不可操作</div>
            <div v-else style="margin-top: -4px">
              <datablau-button type="icon" tooltipContent="查看" class="iconfont icon-see" @click="openTable(scope.row)"></datablau-button>
              <datablau-button type="icon" tooltipContent="编辑" v-show="auth['MODEL_EDIT'] || auth.isAdmin"  class="iconfont icon-bianji" @click="editTableLock(scope.row)" :disabled="scope.row.status === 1"></datablau-button>
              <datablau-tooltip class="item" effect="dark" :content="!item.dataBaseId || !item.schemaName ? '模型未绑定数据、schema连接！': '数据探查'" placement="bottom">
                <datablau-button type="icon" :disabled="!item.dataBaseId || !item.schemaName" class="iconfont icon-tancha" @click="probe(scope.row)"></datablau-button>
              </datablau-tooltip>
             <!-- <datablau-tooltip class="item" effect="dark" :content="'数据映射'" placement="bottom">
                <datablau-button type="icon" class="iconfont icon-SQL" @click="dataMapping(scope.row)"></datablau-button>
              </datablau-tooltip>-->
            </div>
          </template>
        </el-table-column>
      </datablau-table>
      <template slot="buttons">
        <datablau-pagination
          :current-page='currentPage'
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          @size-change="handlePageSizeChange"
          @current-change="handleCurrentChange"
          :layout="'total, sizes, prev, pager, next, jumper'"
          :themeBlack="true"
        />
      </template>
    </datablau-form-submit>
    <div v-if="dataProbeDialog">
      <dataProbeLog
        :dataProbeDialog="dataProbeDialog"
        :columnMapping="columnMapping"
        :threeIdName="threeIdName"
        :preview="false"
        @closeLog="closeLog"
      ></dataProbeLog>
    </div>
    <datablau-dialog
      title="新建文件"
      :visible.sync="newFileModel"
      :modal-append-to-body="true"
      height="320px"
      width="560px"
    >
      <datablau-form size="small" label-width="75px" ref="fileForm" :model="fileForm" :rules="formRules" >
        <el-form-item
          label="文件名"
          prop="newFileName">
          <datablau-input style="width:100%" v-model="fileForm.newFileName" ></datablau-input>
        </el-form-item>
        <el-form-item
          label="目录选择"
          prop="fileName">
          <datablau-cascader
            :options="fileList"
            v-model="fileForm.fileName"
            ref="cascader"
            style="width: 100%;"
            :props="{ checkStrictly: true ,children: 'childList',label: 'name', value: 'id'}"
            @change="changeCascader"
            clearable></datablau-cascader>
        </el-form-item>
      </datablau-form>
      <div slot="footer">
        <datablau-button type="important" @click="addNewFile">
          确定
        </datablau-button>
        <datablau-button @click="closeFileLog" type="secondary">
          取消
        </datablau-button>
      </div>
    </datablau-dialog>
  </div>
</template>

<script>
// import tableDetails from '@/views/list/tables/tableDetails.vue'
import HTTP from '@/resource/http'
import http from '@/dataWarehouse/resource/http'
import sort from '@/resource/utils/sort'
import dataProbeLog from '@/dataWarehouse/views/sqlEditor/dataProbeLog'
import _ from 'lodash'
import $ from 'jquery'
import LDMTypes from '@constant/LDMTypes'
export default {
  props: {
    item: {
      type: Object,
      required: true
    },
    modelTreeData: {
      type: Array,
      required: true
    },
    projectName: {
      type: String
    },
    auth: {
      type: Object
    }
  },
  mounted () {
    // this.getTableData()
    this.getModelInfo(this.item.modelId)
    let self = this
    window.addEventListener('pagehide', (event) => {
      if (this.$store.state.lic.editor && this.$store.state.isEditing) {
        navigator.sendBeacon(`${self.$url}/service/editor/${self.currentModel.id}/unlock`)
      }
    }, { capture: true })
    window.addEventListener('unload', (event) => {
      if (this.$store.state.lic.editor && this.$store.state.isEditing) {
        navigator.sendBeacon(`${self.$url}/service/editor/${self.currentModel.id}/unlock`)
        this.$http.post(`${self.$url}/service/editor/${self.currentModel.id}/unlock`).then(res => {

        }).catch((err) => {
          this.$showFailure(err)
        })
      }
    }, { capture: true })
  },
  components: {
    // tableDetails,
    dataProbeLog
  },
  computed: {
    isLogical () {
      return this.dataByType.model.TypeUniqueId === '025502f5-3820-4555-9d0f-bbb148840e9a' || this.dataByType.model.TypeUniqueId === '7865092e-58be-4096-b824-11bcba4aa10a' || this.dataByType.model.TypeUniqueId === '71f0d1c4-d45d-4eb7-bd1a-e45a0b018121' || this.dataByType.model.TypeUniqueId === '5c9598bc-6906-4edb-9ddb-a23428e224c2'
    },
    showViewButton () {
      return !this.isLogical && !this.isConceptual && !this.isCassandraOrMongoDB
    },
    isCassandraOrMongoDB () {
      return this.dataByType.model.TypeUniqueId === '8ea840a5-37f4-48f8-82d9-1429e42a0fc6' || this.dataByType.model.TypeUniqueId === '4ab7d425-7b4a-49c2-a19b-86dd5f911706'
    },
    isConceptual () {
      return this.dataByType.model.TypeUniqueId === '721ac3dc-dabe-4be2-ae47-cbd6b0a14d80' || this.dataByType.model.TypeUniqueId === 'f9c0cbd3-055c-4e33-8f41-5022062a8df0'
    },
    threeIdName () {
      return {
        tableName: this.probeTableName,
        dataSourceId: this.item.dataBaseId,
        schemaName: this.item.schemaName
      }
    }
  },
  data () {
    return {
      tableDetailsKey: 0,
      tableData: [],
      tableShowData: null,
      query: '',
      tableName: '',
      probeTableName: '',
      theme: '',
      status: '',
      currentModel: null,
      dataByType: {
        table: {},
        diagram: {},
        view: {},
        comment: {},
        relation: {},
        model: {},
        udp: null,
        theme: {},
        schema: {},
        namingOption: {
          'TypeId': 80500101,
          'UniqueId': '04b6cde4-f6fa-4f81-bb54-433ea768d007',
          'UKDefaultMacro': 'idx_%owner%_%keyid%',
          'NUKDefaultMacro': 'idx_%owner%_%keyid%',
          'IndexNameCase': 'None',
          'IndexNameMaxLength': 128,
          'PKDefaultMacro': 'pk_%owner%_%keyid%',
          'NamingSeperator': '_',
          'TableNameCase': 'None',
          'TableNamePostfix': '',
          'TableNamePrefix': '',
          'TableNameMaxLength': 128,
          'ColumnNameCase': 'None',
          'ColumnNamePostfix': '',
          'ColumnNamePrefix': '',
          'ColumnNameMaxLength': 128,
          'IsUsingRealTimeTranslate': false,
          'FKDefaultMacro': 'fk_%owner%_%keyid%',
          'Id': -100,
          'RawType': 'NamingOption',
          'IsTableTranslateEnabled': false,
          'IsColumnTranslateEnabled': true,
          'IsIndexTranslateEnabled': true
        }
      },
      isDesignModel: this.isLogical || this.isConceptual,
      tables: [],
      editTableDialog: false,
      currentOperation: '',
      currentRow: {},
      themes: [],
      statusArr: {
        0: '草稿',
        1: '审核中',
        2: '已评审',
        3: '已撤回',
        4: '已驳回'
        // 5: '已发布'
      },
      currentPage: 1,
      pageNo: 0,
      pageSize: 20,
      total: 0,
      inputList: [],
      projectId: +this.$route.query.projectId,
      typeText: {
        0: '草稿',
        1: '审核中',
        2: '已评审',
        3: '已撤回',
        4: '已驳回',
        5: '已发布'
      },
      statusTypeList: {
        0: 1,
        1: 2,
        2: 6,
        3: 7,
        4: 5,
        5: 4
      },
      selectionList: [],
      TypeUniqueIdToColumnDefaultType: {
        '8CE0D4A7-ADAC-4244-A944-EA74815F5AB8': 'STRING', // hive
        'ADECDAAC-D24B-4081-94E2-9D6217ECC5AA': 'VARCHAR(50)', // MariaDB
        '0F691FA0-3FD7-42F1-B868-051B0FFAD10C': 'VARCHAR(50)',
        'b3fa9413-2e92-4927-bc44-ae81ec7d3c8a': 'VARCHAR(50)', // TDSQLMySQL
        'C14A95B1-5FA3-4F1A-9B04-2507E8C96ADE': 'VARCHAR(50)', // CBase
        'AA8FBE2F-EC17-48B4-B7F1-A9AC47525D3F': 'VARCHAR(50)',
        'F3901084-5B9A-4776-86E9-FDEE6F7F87B7': 'VARCHAR(50)',
        '2C85C9CA-D052-467C-8C55-D367D69982CF': 'VARCHAR(50)',
        '139A6B8F-3D10-4C0E-BA3D-8B43131EF06A': 'STRING',
        'F2B1C0D4-1E4E-4CE4-9C98-988191D63C55': 'VARCHAR2(20)',
        '998E48F9-FFEC-4473-A7A0-754C055C0953': 'VARCHAR(50)',
        '4091BC89-EEBB-4E1D-866B-A47707804417': 'CHAR(18)',
        '8EA840A5-37F4-48F8-82D9-1429E42A0FC6': 'string',
        '4AB7D425-7B4A-49C2-A19B-86DD5F911706': 'string',
        '67AE3EBF-8D3B-4E6C-93F5-E35E6CF32C8E': 'VARCHAR(50)',
        '0DD030E7-9412-4ACE-9ED7-E1225DBA2855': 'VARCHAR(20)',
        '84A19E0F-9937-4B5C-8E55-B1AE54BF9352': 'VARCHAR2(50)',
        '1333DCA6-0D18-195A-6EE0-E6FB0D3666FF': 'VARCHAR2(20)',
        '16C864E9-1492-6D39-7E47-763067512DC2': 'VARCHAR(50)',
        '2CE303DB-DE63-7696-8A71-041AF6EB772B': 'VARCHAR(50)',
        '2022EC9E-15F5-DEFF-32B0-DCFABCCDE3EF': 'VARCHAR2(20)',
        '6d977600-5d0d-441b-a85a-d682827d696c': 'VARCHAR(50)',
        '076733be-ee09-4bba-8adb-5d2b48036a42': 'VARCHAR(50)',
        '597095CA-993C-4EF9-8AEE-48E87F7EE7E2': 'VARCHAR(50)',
        '025502f5-3820-4555-9d0f-bbb148840e9a': 'VARCHAR(50)',
        'b6a80960-849e-491e-9283-2042405fba29': 'STRING',
        '45c7074a-0c6e-4b0b-9ef8-6c6fa5242bc0': 'VARCHAR(50)',
        '721ac3dc-dabe-4be2-ae47-cbd6b0a14d80': 'VARCHAR(50)',
        'e8fdd9f9-2d5f-456d-a5f4-de6c17025e23': 'VARCHAR(50)',
        'a5277112-1079-4d90-89e6-a46f00c6c7f0': 'STRING',
        'df57529d-3918-42aa-bc8d-092c2b7c12b4': 'VARCHAR(50)',
        'b86fdec4-da62-4ee2-8c65-1bc221d2a578': 'VARCHAR(50)',
        '097618F2-3A1D-4D4F-A31C-E138217A486A': 'VARCHAR(80)',
        'F9C0CBD3-055C-4E33-8F41-5022062A8DF0': 'VARCHAR(50)',
        '5C9598BC-6906-4EDB-9DDB-A23428E224C2': 'VARCHAR(50)',
        '7865092E-58BE-4096-B824-11BCBA4AA10A': 'VARCHAR(50)',
        '71F0D1C4-D45D-4EB7-BD1A-E45A0B018121': 'VARCHAR(50)',
        '5053d067-62bb-f7ae-7971-f28ac8fdd44b': 'String'
      },
      columnMapping: {},
      dataProbeDialog: false,
      userPage: 1,
      approver: [],
      userList: [],
      usetotal: 0,
      selectApprover: false,
      newFileModel: false,
      fileForm: {
        newFileName: '',
        fileName: []
      },
      fileList: [],
      formRules: {
        newFileName: { required: true, message: '请输入文件名', trigger: 'blur' },
        fileName: { required: true, message: '请选择目录', trigger: 'blur' }
      },
      sourceListType: {
        hive: 1,
        mysql: 2,
        postgresql: 3,
        oracle: 4,
        starrocks: 5,
        sqlserver: 6,
        flinksql: 7,
        flinkjar: 8,
        java: 9,
        python: 10,
        gbase: 11,
        'transwarp-inceptor': 12,
        shell: 13,
        file: 14,
        migration: 15
      },
      reflectionCon: ''
    }
  },
  watch: {
    currentModel (val) {
      this.getDiagrams()
    },
    item: {
      handler (val) {
        this.getTableData()
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    handleSelectionChange (val) {
      this.selectionList = val
    },
    statusType (val) {
      let t = ''
      if (val === '草稿') {
        t = 'draft'
      } else if (val === '已评审') {
        t = 'reviewed'
      } else if (val === '已上线') {
        t = 'online'
      }
      return t
    },
    handlePageSizeChange (val) {
      this.pageSize = val
      this.currentPage = 1
      this.pageNo = 0
      // this.getPaging(0, val)
      this.getTableData()
    },
    handleCurrentChange (val) {
      this.currentPage = val
      this.pageNo = val - 1
      // this.getPaging((val - 1) * this.pageSize, val * this.pageSize)
      this.getTableData()
    },
    getPaging (star, size) {
      // 不是搜索翻页
      if (this.total !== this.tableData.length) {
        this.tableShowData = this.inputList.splice(star, size)
        this.inputList.splice(star, 0, ...this.tableShowData)
        return
      }
      this.tableShowData = this.tableData.splice(star, size)
      this.tableData.splice(star, 0, ...this.tableShowData)
    },
    filterTable () {
      this.pageSize = 10
      this.currentPage = 1
      let ary = this.tableData.filter(i => {
        if (this.query) {
          return i.tableName.indexOf(this.query) !== -1 || (i.alias && i.alias.indexOf(this.query) !== -1)
        } else {
          return true
        }
      }).filter(i => {
        if (this.theme && this.theme.length) {
          return i.diagram.some(d => this.theme.includes(d))
        } else {
          return true
        }
      }).filter(i => {
        if (this.status) {
          if (this.status === '全部') {
            return true
          } else {
            return i.status === Number(this.status)
          }
        } else {
          return true
        }
      })
      this.inputList = _.cloneDeep(ary)
      this.total = this.inputList.length
      this.getPaging(0, this.pageSize)
    },
    /* getStatus () {
      this.$http.get(`${this.$dddUrl}/service/model/status/list`).then(res => {
        this.statusArr = res.data
      }).catch(err => {
        this.$showFailure(err)
      })
    }, */
    getDiagramThemes () {
      let endVersion = this.item.endVersion.name === 'Latest Version' ? '-1' : this.item.endVersion.version
      this.$http.get(`${this.$dddUrl}/service/model/${this.currentModel.id}/${endVersion}/diagram`).then(res => {
        this.themes = res.data
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    openDesignModel () {
      this.$http.put(`${this.$url}/service/editor/${this.currentModel.id}/lock`).then(res => {
        if (res.data) {
          let pageUrl = this.BaseUtils.RouterUtils.getFullUrl('modeleditD', {
            id: this.currentModel.id,
            modelType: this.currentModel.modelType
          })
          window.open(pageUrl)
          // window.open(`./#/main/modeledit?id=${this.currentModel.id}&modelType=${this.currentModel.modelType}`)
        } else {
          this.$message.error('模型尝试加锁失败，请重试')
        }
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    updateTabName () {
      this.currentTab = this.tabLabelFormatter(this.tables[0])
    },
    updateVersion (version) {
      if (version) {
        this.currentModel.currentVersion = version
      } else {
        this.currentModel.currentVersion++
      }
    },
    updateTableData (data) {
      this.dataByType.table[data.properties.Id] = data
      this.afterHandleDialogData(data.properties.Id)
      if (this.$refs.tables) {
        this.$refs.tables.updateTableData(data)
      }
      if (this.$refs.partTables) {
        this.$refs.partTables.updateTableData(data)
      }
    },
    getPermission () {
      HTTP.getModelPermission({
        modelId: this.currentModel.id,
        successCallback: data => {
          this.$set(this.currentModel, 'permission', data)
          this.permissionReady = true
        }
      })
    },
    changeAlphabetType (name, type) {
      if (type === 'None') {

      } else if (type === 'Lower') {
        name = name.toLowerCase()
      } else if (type === 'Upper') {
        name = name.toUpperCase()
      } else if (type === 'Initial') {
        name = name.slice(0, 1).toUpperCase() + name.slice(1, name.length).toLowerCase()
      }
      return name
    },
    getTableNameNamingMap (name) {
      let { namingOption } = this.dataByType
      if (namingOption.IsTableTranslateEnabled) {
        // name = name.slice(0, namingOption.TableNameMaxLength)
        if (name.toLowerCase().indexOf(namingOption.TableNamePrefix.toLowerCase()) !== 0) {
          name = namingOption.TableNamePrefix + name
        }
        if (name.toLowerCase().lastIndexOf(namingOption.TableNamePostfix.toLowerCase()) !== -1 && name.toLowerCase().lastIndexOf(namingOption.TableNamePostfix.toLowerCase()) + namingOption.TableNamePostfix.length === name.length) {

        } else {
          name = name + namingOption.TableNamePostfix
        }
        name = this.changeAlphabetType(name, namingOption.TableNameCase)
      }
      return name
    },
    handleDialogData (tableId, editMode, type, rowLock) {
      if (tableId) {
        this.$http.get(`${this.$url}/service/models/${this.currentModel.id}/elements/${tableId}/content/json`).then(res => {
          let data = res.data
          const dataColumnOrdered = {
            properties: data.properties,
            children: [],
            objectClass: data.objectClass
          }
          if (data.properties.ColumnOrderArrayRefs) {
            const columnMap = new Map()
            data.children.forEach(item => {
              if (item.properties.TypeId === 80000005) {
                columnMap.set(item.properties.Id, item)
              } else {
                dataColumnOrdered.children.push(item)
              }
            })
            data.properties.ColumnOrderArrayRefs.forEach(item => {
              if (columnMap.get(item)) {
                dataColumnOrdered.children.push(columnMap.get(item))
              }
            })
            columnMap.forEach((v, k) => {
              if (!data.properties.ColumnOrderArrayRefs.includes(k) && v.properties.TypeId === 80000005) {
                dataColumnOrdered.children.push(v)
              }
            })
          } else {
            dataColumnOrdered.children = data.children
          }
          this.dataByType.table[tableId] = dataColumnOrdered
          this.afterHandleDialogData(tableId, editMode)
          // if (type === 'edit') {
          //   this.editTableLock(rowLock)
          // }
        }).catch((err) => {
          this.contentJson = false
          if (err.response.status === 500) {
            this.contentJson = false
            if (type === 'edit') {
              this.$blauShowSuccess('当前表已删除，不可编辑', 'warning')
            } else {
              this.$blauShowSuccess('当前表已删除，不可查看', 'warning')
            }
          } else {
            this.$showFailure(err)
          }
        })
      } else {
        // 添加新表
        this.$set(this.dataByType.table, this.currentModel.seed, {
          objectClass: 'Datablau.LDM.EntityComposite',
          children: [],
          properties: {
            ColumnOrderArrayRefs: [],
            DataStandardCode: '',
            Id: this.currentModel.seed,
            IsLogicalOnly: false,
            IsPhysicalOnly: false,
            Name: this.getTableNameNamingMap((this.isLogical ? 'Entity_' : this.isCassandraOrMongoDB ? 'Collection_' : 'Table_') + (this.sumElementNumCopy += 2)),
            RawType: 'Entity',
            TypeId: 80000004,
            changed: true,
            new: true
          }
        })
        this.tables = [{
          columnsMsg: [],
          pk: [],
          fk: [],
          uk: [],
          nk: [],
          vk: [],
          tableMsg: {
            LogicalName: '',
            Name: '',
            Definition: '',
            Id: this.currentModel.seed++
          },
          appendMode: editMode
        }]
        this.updateTabName()
      }
    },
    afterHandleDialogData (tableId, editMode = false) {
      this.tables = []
      if (tableId) { //  it means a table already exists
        let data = this.dataByType.table[tableId]
        let dialog = {}
        dialog.visible = true
        dialog.tableMsg = data.properties
        if (!dialog.tableMsg.LogicalName) {
          //          dialog.tableMsg.LogicalName = dialog.tableMsg.Name;
        }
        dialog.editMode = editMode
        dialog.columnsMsg = []
        dialog.pk = []
        dialog.fk = []
        dialog.uk = []
        dialog.nk = []
        dialog.vk = []
        dialog.partition = null
        dialog.dwMapping = []
        if (Array.isArray(data.children)) {
          data.children.forEach(item => {
            if (!item.properties.deleted) {
              if (item.properties['TypeId'] === LDMTypes.Attribute) {
                dialog.columnsMsg.push(item)
              } else if (item.properties['KeyGroupType'] === 'PrimaryKey') {
                dialog.pk.push(item)
              } else if (item.properties['KeyGroupType'] === 'ForeignKey') {
                dialog.fk.push(item)
              } else if (item.properties['KeyGroupType'] === 'UniqueKey') {
                dialog.uk.push(item)
              } else if (item.properties['KeyGroupType'] === 'NonUniqueKey') {
                dialog.nk.push(item)
              } else if (item.properties['KeyGroupType'] === 'VirtualKey') {
                dialog.vk.push(item)
              } else if (item.properties['TypeId'] === LDMTypes.Partition) {
                dialog.partition = item
              } else if (item.properties.TypeId === LDMTypes.DWMapping) {
                dialog.dwMapping.push(item)
              }
            }
          })
        }
        dialog.dwMapping.sort((a, b) => { // mapping按照创建顺序排序
          return a.properties.Id - b.properties.Id
        })
        dialog.dwMapping.forEach(mapping => {
          mapping.children?.sort((a, b) => {
            return a.properties.Id - b.properties.Id
          })
        })
        const exist = this.tables.some(table => {
          return table.tableMsg.Id === dialog.tableMsg.Id
        })
        if (!exist) {
          this.tables.push(dialog)
          // this.showTabs = true
        } else {
          this.tables.forEach(table => {
            if (table.tableMsg.Id === dialog.tableMsg.Id) {
              Object.keys(dialog).forEach(p => {
                this.$set(table, p, dialog[p])
              })
            }
          })
        }
        this.currentTab = this.tabLabelFormatter(dialog)
      }
    },
    tabLabelFormatter (v) {
      if (this.currentOperation === 'openTable') {
        this.$emit('openTable', {
          id: this.item.modelId + '_' + this.currentRow.id,
          name: this.currentRow.tableName + '_' + this.currentModel.name,
          table: this.tables[0],
          currentModel: this.currentModel,
          dataByType: this.dataByType
        })
      } else if (this.currentOperation === 'newTable') {
        this.$emit('openTable', {
          id: this.item.modelId + '_' + this.tables[0].tableMsg.Id,
          name: '新建表' + '_' + this.currentModel.name,
          table: this.tables[0],
          currentModel: this.currentModel,
          dataByType: this.dataByType
        })
      }
      if (!v) {
        return
      }
      if (v.appendMode) {
        return this.isLogical ? this.$store.state.$v.dataEntity.addEntity : this.$store.state.$v.dataEntity.addTable
      } else {
        return v.tableMsg.Name + (v.tableMsg.LogicalName ? `(${v.tableMsg.LogicalName})` : '')
      }
    },
    prepareUdpData (rawData) {
      if (rawData && Array.isArray(rawData.children)) {
        let udpMap = new Map()
        rawData.children.forEach(item => {
          if (item.hasOwnProperty('properties') && item.properties.hasOwnProperty('Id') && (item.properties.TypeId === 90002032 || item.properties.TypeId === 90002048)) {
            udpMap.set(item.properties['Id'], item.properties)
          }
        })
        let udp = new Map()
        udpMap.forEach(item => {
          if (item.OwnerRef) {
            let udpId = udpMap.get(item.OwneeRef)?.Id
            if (udpId) {
              udpMap.get(udpId).entityType = item.OwnerRef
              udpMap.get(udpId).pStructId = item.Id
              udp.set(udpId, udpMap.get(udpId))
            }
          }
        })
        this.dataByType.udp = udp
      } else {
        this.dataByType.udp = new Map()
      }
    },
    prepareTreeData (clearDiagrams = true) {
      this.clearDiagrams = clearDiagrams
      const self = this
      this.diagramsLoading = false
      if (clearDiagrams) {
        this.diagrams = []
        this.mapIdToDiagramData = {}
      }
      this.data.forEach((item, index) => {
        //  TODO it's could work for lazy load.
        if (item.properties.TypeId === 80000004 || item.properties.TypeId === 80100073) {
          self.dataByType.table[item.properties.Id] = item
        } else if (item.properties.TypeId === 80000006) {
          self.dataByType.diagram[item.properties.Id] = item
          item.properties.ParentRef = null // 根主题
          if (!item.properties.Definition) {
            item.properties.Definition = null
          }
          // this.defaultExpandedKeys.push(item.properties.Id)
          let properties = item.properties
          if (clearDiagrams) {
            this.mapIdToDiagramData[item.properties.Id] = properties
            this.diagrams.push(properties)
          }
          let tables = []
          let children = item.children
          if (children && children.length > 0) {
            for (let i = 0, len = children.length; i < len; i++) {
              if (children[i] && children[i].properties && children[i].properties.TypeId === 80000008) {
                tables.push(children[i])
              }
            }
          }
          if (tables.length > this.largestDiagramCount) {
            this.largestDiagramCount = tables.length
            this.largestDiagramId = item.properties.Id
          }
        } else if (item.properties.TypeId === 80500008) {
          self.dataByType.view[item.properties.Id] = item
        } else if (item.properties.TypeId === 80000027) {
          self.dataByType.comment[item.properties.Id] = item
        } else if (item.properties.TypeId === 80000007) {
          self.dataByType.relation[item.properties.Id] = item
        } else if (item.properties.TypeId === 80010214) { // 样式主题
          self.dataByType.theme[item.properties.Id] = item
        } else if (item.properties.TypeId === 80700001) {
          self.dataByType.schema[item.properties.Id] = item
        } else if (item.properties.TypeId === 80500101) { // 命名设置
          Object.assign(self.dataByType.namingOption, item.properties)
          self.dataByType.namingOption.IsUsingRealTimeTranslate = false // web端不采用自动翻译
        }
        if (index === this.data.length - 1) {
          this.sumElementNum = item.properties.Id
        }
      })
      this.preDiagrams = _.cloneDeep(this.diagrams)
      this.currentModel.diagramCount = this.diagrams.length
      // sort.sortConsiderChineseNumber(this.diagrams, 'Name')
    },
    handleDiagramClick (diagram, node, el) {
      window.move = false
      this.diagramId = diagram.Id
      this.diagramName = diagram.Name
      this.currentPane = 'diagram'
      this.$nextTick(() => {
        if ($('.detail-wrapper.el-tabs').length > 0 && !$('.detail-wrapper.el-tabs').hasClass('hideTab')) {
          $('.model-header').width($(this.$el).find('.tree-area').width())
        }
      })
    },
    getDiagrams () {
      this.$bus.$on('append-theme', ({ current, parent, changePreDiagram }) => {
        const tree = this.$refs.themeTree
        const parentNode = tree.getNode(parent)
        let currentNode = tree.getNode(current.Id)
        if (parentNode && this.clearDiagrams) {
          tree.append(current, parent)
          this.$nextTick(() => {
            let currentNode = tree.getNode(current.Id)
            this.mapIdToDiagramData[current.Id] = currentNode.data
            if (changePreDiagram) {
              clearTimeout(this.timer)
              this.timer = setTimeout(() => {
                this.preDiagrams = _.cloneDeep(this.diagrams)
              }, 800)
            }
            parentNode.expanded = true
          })
        }
      })
      HTTP.getDiagrams({
        modelId: this.currentModel.id,
        longkey: this.longkey,
        successCallback: (data) => {
          if (this.longkey) {
            data = this.transformData(data)
          }
          if (data.children.length > 10000) {
            this.searchPanelExist = false
          }
          this.data = data.children
          _.merge(this.currentModel, data.properties)
          // this.getModelDetailInfo()
          this.currentModel.Definition = data.properties.Definition
          this.prepareUdpData(data.udp)
          this.dataByType.model = data.properties
          this.prepareTreeData()
          // this.searchAll()
          setTimeout(() => {
            if (this.$route.query.typeId && String(this.$route.query.typeId) === '80000006') {
              this.diagrams.forEach(item => {
                if (String(item.Id) === String(this.$route.query.elementId)) {
                  // todo:按主题id跳转时，需要高亮
                  //  this.currentPane = 'diagram' + item.Name
                  this.handleDiagramClick(item)
                }
              })
            }
          })
          // if (Object.keys(this.dataByType.table).length > 200) {
          //   this.$message.warning('模型较大，建议在客户端编辑，不然可能出现页面无响应！')
          // }
          // this.loading.status = false
        }
      })
    },
    getModelInfo (modelId) {
      this.$http.get(`${this.$url}/service/models/${modelId}`).then(res => {
        this.currentModel = res.data
        this.$set(this.currentModel, 'seed', res.data.seed)
        this.currentModel.seed++
        this.getPermission()
        this.getDiagramThemes()
        // this.getStatus()
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    newTable () {
      this.$http.put(`${this.$url}/service/editor/${this.currentModel.id}/lock`).then(res => {
        if (res.data) {
          this.currentOperation = 'newTable'
          this.handleDialogData(null, true)
        } else {
          this.$message.error('模型尝试加锁失败，请重试')
        }
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    openTable (row) {
      this.currentRow = row
      this.currentOperation = 'openTable'
      row.modelId = this.item.modelId
      this.handleDialogData(row.id)
    },
    // 发布
    async releaseBtn () {
      let ary = this.selectionList.find(row => row.status === 1 || row.status === 2 || !row.exist)
      if (ary) {
        this.$datablauMessage.error('审核中，已评审，已被删除的表不能评审！')
        return
      }
      await this.changeApproverlList('')
      // this.selectApprover = true
      this.approverBtn()
    },
    approverBtn () {
      let params = []
      this.selectionList.forEach(item => {
        params.push({
          // 'projectId': this.projectId,
          'modelId': this.item.modelId,
          'modelVersion': this.item.endVersion.version,
          'tableId': item.id,
          'tableVersion': this.item.endVersion.version,
          'modelName': this.item.name,
          'tableName': item.alias ? item.tableName + `(${item.alias})` : item.tableName,
          projectName: this.projectName
        })
      })
      this.$http.post(`${this.$dddUrl}/service/model/version/publish`, params)
        .then(res => {
          this.$datablauMessage.success('提交评审成功')
          this.approver = []
          this.getTableData()
          this.selectApprover = false
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    approverListloading () {
      if (this.usetotal && this.usetotal >= this.userList.length) return
      this.userPage += 1
      this.getUsers('')
    },
    remoteMethod (val) {
      // setTimeout(() => {
      this.userPage = 1
      this.getUsers(val)
      // }, 300)
    },
    changeApproverlList (val) {
      this.userPage = 1
      this.getUsers(val || '')
    },
    getUsers (approver) {
      let requestBody = {
        currentPage: this.userPage,
        pageSize: 20,
        username: approver,
        fullUserName: approver
      }

      this.$http.post('/user/org/groups/page?appName=ddt', requestBody)
        .then(res => {
          if (this.currentPage === 1) {
            this.userList = res.data.content
          } else {
            this.userList.push(...res.data.content)
          }
          this.usetotal = res.data.totalItems
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
    closeTableDetails () {
      this.editTableDialog = false
      this.tables = []
      this.$refs.tableDetails.cancel()
    },
    getColumnMapping () {
      this.$http
        .post(HTTP.$damServerUrl + 'entities/getColumnMapping')
        .then(res => {
          this.columnMapping = res.data
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
    closeLog () {
      this.dataProbeDialog = false
    },
    async probe (row) {
      this.probeTableName = row.tableName
      await this.getColumnMapping()
      this.dataProbeDialog = true
    },
    dataMapping () {
      let ary = this.selectionList.map(item => { return { 'tableId': item.id, 'tableName': item.tableName } })
      this.$http.post(this.$ddmUrl + `/service/models/dwmapping/${this.item.modelId}/table/sql`, ary)
        .then(async res => {
          let type = this.sourceListType[this.item?.datasourceType?.toLowerCase()]
          res.data.forEach(item => {
            item.sql && this.$emit('setNewFile', {
              content: item.sql,
              type,
              modelId: this.item.dataBaseId,
              schemaName: this.item.schemaName,
              id: item.tableName + item.tableId + this.item.id,
              name: item.tableName + '_' + item.mappingName,
              parentId: '0',
              temporarilyFile: true,
              filePath: this.item.filePath
            })
          })
          let ary = res.data.map(item => {
            if (!item.sql) {
              return item.tableName
            }
          }).filter(item => item)
          ary.length && this.$datablauMessage.warning('表：' + ary.join('、') + '暂无映射关系')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    changeCascader () {
      this.$refs.cascader.$refs.dataCascader.dropDownVisible = false
    },
    addNewFile () {
      this.closeFileLog()
      let type = this.sourceListType[this.item.datasourceType.toLowerCase()]
      this.$emit('setNewFile', { ...this.fileForm, content: this.reflectionCon, type, modelId: this.item.dataBaseId })
    },
    closeFileLog () {
      this.newFileModel = false
    },
    getSqlList () {
      http.changeDataTree({
        id: this.projectId
      })
        .then(res => {
          this.fileList = [res]
          this.filterList(this.fileList)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    filterList (ary) {
      if (ary) {
        for (let i = 0; i < ary.length; i++) {
          if (ary[i].type !== 0) {
            ary.splice(i, 1)
            i--
          }
        }
        ary.forEach(item => {
          if (item.childList.length) {
            this.filterList(item.childList)
          }
          if (!item.childList.length) {
            item.childList = null
          }
        })
      }
    },
    editTable (row) {
      this.currentRow = row
      this.currentOperation = 'openTable'
      row.modelId = this.item.modelId
      this.handleDialogData(row.id, true, 'edit', row)
    },
    editTableLock (row) {
      this.$http.put(`${this.$url}/service/editor/${this.currentModel.id}/lock`).then(res => {
        if (res.data) {
          this.currentRow = row
          this.currentOperation = 'openTable'
          row.modelId = this.item.modelId
          this.handleDialogData(row.id, true)
        } else {
          this.$message.error('模型尝试加锁失败，请重试')
        }
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    changeTable () {
      this.pageNo = 0
      this.currentPage = 1
      this.getTableData()
    },
    getTableData () {
      // console.log(this.item.endVersion)
      let endVersion = this.item.endVersion.name === 'Latest Version' ? '-1' : this.item.endVersion.version
      let startVersion = this.item.startVersion.name === 'Latest Version' ? '-1' : this.item.startVersion.version
      let json = {
        modelId: this.item.modelId,
        startVerId: Number(startVersion),
        endVerId: Number(endVersion),
        projectId: this.projectId,
        /* status: this.status,
        tableName: this.query,
        theme: this.theme, */
        pageNo: this.pageNo,
        pageSize: this.pageSize
      }
      this.status && (json.status = this.status)
      this.query && (json.tableName = this.query)
      this.theme && (json.theme = this.theme)
      this.$http.post(`${this.$dddUrl}/service/model/history/versions/diff`, json).then(res => {
        this.tableShowData = res.data
        this.total = this.tableShowData[0]?.dataSize || 0
        // this.getPaging(0, this.pageSize)
      }).catch(err => {
        this.$showFailure(err)
      })
    }
    /* selected (row, i) {
      if (row.status === 1 || row.status === 2 || row.status === 5 || !row.exist) {
        return false // 不可勾选
      } else {
        return true // 可勾选
      }
    } */
  }
}
</script>
<style lang="scss" scoped>
  .model-detail-ddd-list {
    position: absolute;
    left: 0px;
    right: 0px;
    bottom: 0;
    top: 32px;
    background: #222222;
    padding-left: 20px;
    padding-right: 20px;
    .operator-wrapper {
      position: absolute;
      top: -62px;
      left: 0;
      right: 0;
      line-height: 30px;
      // border: 1px solid #EFEFEF;
      z-index: 1;
      background: #fff;
      .path {
        display: inline-block;
        font-size: 12px;
        line-height: 30px;
        color: #999;
        margin-left: 8px;
      }
    }
  }
  .modelDetailSearch{
    margin-top:16px;
    margin-bottom: 8px;
    .select-label{
      margin-right: 8px;
      color: #bbbbbb;
    }
  }
  /deep/.el-checkbox__input.is-disabled .el-checkbox__inner{
    background-color: #666;
  }
  .status {
    position: relative;
    color: #999;
    padding-left: 10px;
    /*top: 5px;*/
    &::before {
      position: absolute;
      top: 9px;
      left: -1px;
      content: '';
      display: inline-block;
      width: 6px;
      height: 6px;
      background: #999;
      border-radius: 50%;
    }
    span {
      padding-left: 10px;
    }
    &.c1 {
      color: #409eff;
      &::before {
        background: #409eff;
      }
    }
    &.c2 {
      color: #66bf16;
      &::before {
        background: #66bf16;
      }
    }
    &.c3 {
      color: #E66A15;
      &::before {
        background: #E66A15;
      }
    }
    &.c4 {
      color: #ff4b53;
      &::before {
        background: #ff4b53;
      }
    }
  }
  .existName{
    color: #999;
  }
</style>
<style lang="scss">
.tableMOdelDetail{
  .el-table, .el-table__expanded-cell{
    background: #fffdff;
  }
  .el-table th.el-table__cell{
    background: #fffdff;
  }
  .el-table tr{
    background: #fffdff;
  }
  .el-table td.el-table__cell, .el-table th.el-table__cell.is-leaf{
    border-bottom: 1px solid #E5E5E5;
  }
}
  .model-detail-ddd-list .dialog-wrapper .datablau-tabs .el-tabs {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #fff;
  }
  .setting .el-checkbox__inner::after {
      border-left: 0;
      border-top: 0;
    }
  .index-editor {
    .el-button.is-disabled {
      border: unset;
    }
    .el-checkbox__inner::after {
      border-left: 0;
      border-top: 0;
    }
  }
.model-detail-ddd-list{

  .el-input__inner{
    color: #606166;
  }
  .el-input__inner::placeholder{
    color: #606166;
  }
  .row-buttons{
    border-top: 1px solid #45494A;
  }
}

</style>
