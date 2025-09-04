<template>
  <div class="editor-inner-container">
    <win-merge-page ref="winMergePage" @set-value="setValue"></win-merge-page>
    <datablau-dialog
        title="签入版本"
        :visible.sync="versionModel"
        :modal-append-to-body="true"
        size="l"
        :blackTheme="true"
    >
      <datablau-form
          size="small"
          label-width="75px"
      >
        <el-form-item
            :label="$store.state.$v.dataEntity.version"
            required
        >
          <datablau-input
            v-model="request.version"
            style="width:100%"
            :themeBlack="true"
          ></datablau-input>
        </el-form-item>
        <el-form-item
          :label="$store.state.$v.dataEntity.disc"
        >
          <datablau-input
            type="textarea"
            v-model="request.description"
            style="width:100%"
            :themeBlack="true"
          ></datablau-input>
        </el-form-item>
      </datablau-form>
      <div slot="footer">
        <datablau-button :themeBlack="true" type="important" @click="saveNewVersionFile" :disabled="Boolean(!request.version)">{{$store.state.$v.dataEntity.ok}}</datablau-button>
        <datablau-button :themeBlack="true" @click="versionModel=false,request.version='',request.description=''">取消</datablau-button>
      </div>
    </datablau-dialog>
    <datablau-dialog
      title="选择租户"
      :visible.sync="tenantFlag"
      :modal-append-to-body="true"
      size="s"
      :blackTheme="true"
    >
      <datablau-form
        size="small"
        label-width="100px"
      >
        <el-form-item
          :label="'租户'"
          required
        >
          <datablau-select
            v-model="tenantId"
            placeholder="请选择租户"
            filterable
            clearable
            style="width: 100%;"
            :themeBlack="true"
          >
            <el-option
              v-for="item in tenantsList"
              :key="item.id"
              :label="item.tenantCode"
              :value="item.id"
            ></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item
          :label="'Worker分组'"
          required
        >
          <datablau-select
            v-model="workerId"
            placeholder="请选择Worker分组"
            filterable
            clearable
            @change="filterList"
            :themeBlack="true"
            style="width: 100%;"
          >
            <el-option
              v-for="item in workerList"
              :key="item"
              :label="item"
              :value="item"
            ></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item
          :label="'环境名称'"
        >
          <datablau-select
            v-model="environmentId"
            placeholder="请选择环境名称"
            filterable
            clearable
            style="width: 100%;"
            :themeBlack="true"
          >
            <el-option
              v-for="item in environmentList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item
          :label="'savepoint列表'"
          v-if="item.type === 19"
        >
          <datablau-select
            v-model="savepoint"
            placeholder="请选择savepoint列表"
            filterable
            clearable
            style="width: 100%;"
            :themeBlack="true"
          >
            <el-option
              v-for="item in savepointList"
              :key="item.path"
              :label="item.name +'('+item.time+')'"
              :value="item.path"
            ></el-option>
          </datablau-select>
        </el-form-item>
      </datablau-form>
      <div slot="footer">
        <datablau-button :themeBlack="true" type="important" @click="sqlStart" >确认</datablau-button>
        <datablau-button :themeBlack="true" @click="tenantFlag=false">取消</datablau-button>
      </div>
    </datablau-dialog>
    <div class="operator-wrapper" v-if="!previewDdl">
      <!-- <div class="path">
        <a-breadcrumb separator=">" style="display: inline-block" :routes="fileFlatArray">
          <template slot="itemRender" slot-scope="{ route }">
                <span @click="clickPath(route)">{{route.name }}</span>
          </template>
        </a-breadcrumb>
      </div> -->
      <div class="list" :style="'left:' + hideTreeLeft">
        <!--<datablau-button tooltipContent="切换主题" :tooltipOptions="{openDelay: 500}" type="icon" class="el-icon-star-off" @click="toggleTheme">
        </datablau-button>-->
        <datablau-button
          type="icon" class="iconfont icon-save" tooltipContent="保存" :tooltipOptions="{openDelay: 500}" @click="saveSql(item)"
          :disabled="disabledType"
        >
        </datablau-button>
        <datablau-button :disabled="disabledType  || typeEditor === 'procedure' || item.temporarilyFile" tooltipContent="签入版本" :tooltipOptions="{openDelay: 500}" type="icon" class="iconfont icon-versions" @click="openNewVersion(item)">
        </datablau-button>
        <span class="icon-divider"></span>
        <datablau-button :disabled="typeEditor === 'file' ? Boolean(!authPro['PROCEDURE_EDIT'] && !authPro.isAdmin) : typeEditor === 'procedure' ? false : true" type="icon" class="iconfont icon-formatclear" tooltipContent="程序格式化" :tooltipOptions="{openDelay: 500}" @click="formatSql(item.codeDetailId)">
        </datablau-button>
        <datablau-button :disabled="(typeEditor === 'file' ? Boolean(!authPro['PROCEDURE_EDIT'] && !authPro.isAdmin) : true) || item.temporarilyFile" type="icon" class="iconfont icon-location" tooltipContent="定位" :tooltipOptions="{openDelay: 500}" @click="locationFile(item)">
        </datablau-button>
        <datablau-button :disabled="typeEditor === 'file' ? Boolean(!authPro['PROCEDURE_EDIT'] && !authPro.isAdmin) || (item.type === 31 || item.type === 32) : typeEditor === 'procedure' ? false : true" class="iconfont icon-lineageview" type="icon" tooltipContent="血缘解析" :tooltipOptions="{openDelay: 500}" @click="getSqlLineage(item)">
        </datablau-button>
        <span class="icon-divider"></span>
        <!--<datablau-button
          v-if="item.nodeAuth.indexOf('DELETE') !== -1 || $store.state.user.isAdmin"
          type="icon"
          class="iconfont icon-delete"
          tooltipContent="删除"
          @click="deleteFile(item)"
        >
        </datablau-button>-->

        <datablau-button :disabled="disabledTypeRun" type="icon" :tooltipContent="item.select ? '运行所选' : '程序运行'" :tooltipOptions="{openDelay: 500}" class="iconfont icon-working" @click="runSql(item)" >
        </datablau-button>
        <datablau-button  v-if="runRefresh" type="icon" :tooltipContent="'执行更新'" :tooltipOptions="{openDelay: 500}" class="iconfont icon-execute
" @click="runSql(item, 'performUpdate')" :disabled="typeEditor === 'file' ? Boolean(!authPro['PROCEDURE_EDIT'] && !authPro.isAdmin) : true">
        </datablau-button>
        <!-- <span class="icon-divider"></span> -->
        <!-- <datablau-button
          type="icon"
          tooltipContent="规则校验"
          :tooltipOptions="{openDelay: 500}"
          @click="allVerification"
          :disabled="Boolean(!authPro['PROJECT_MANAGE']&&!authPro.isAdmin) || currentFile.indexOf('procedure') !== -1"
        >
          <i class="iconfont icon-menu-jhrw"></i>
        </datablau-button>
        <datablau-button
          type="icon"
          tooltipContent="校验查看"
          :tooltipOptions="{openDelay: 500}"
          @click="viewResults"
          :disabled="Boolean(!authPro['PROJECT_MANAGE']&&!authPro.isAdmin)  || currentFile.indexOf('procedure') !== -1"
        >
          <i class="iconfont icon-wentiqingdan"></i>
        </datablau-button> -->
        <!--<datablau-button v-if="item.domainState === 'D'" type="important" @click="applyPublish(item)">
          申请发布
        </datablau-button>
        <datablau-button v-if="item.domainState === 'A'" type="important" @click="applyUpdate(item)">
          申请变更
        </datablau-button>
        <datablau-button v-if="item.domainState === 'A'" type="important" @click="applyAbolish(item)">
          申请废弃
        </datablau-button>-->
      </div>
    </div>
    <div v-if="false">
      <span class="top-label">最大返回行数</span>
      <datablau-input
          v-model="item.maxLength"
          style="display:inline-block; width: 50px; margin: 0 20px;"
          placeholder="请输入返回行数"
          controls-position="right"
      ></datablau-input>
      <datablau-button @click="exportSqlData(item)">
        导出运行结果
      </datablau-button>
    </div>
    <div class="middle-editor-container"  ref="middleEditorContainer" :class="{'bottom-tabs-up': showBottomTabs,'previewDdl': previewDdl=== true}">
      <auto-handle-conflict
          :file="item"
          :result-list="resultList"
      ></auto-handle-conflict>
      <monaco
          ref="editor"
          :opts="monacoOpts"
          @change="changeValue(item, ...arguments)"
          @select="selectStr(item, ...arguments)"
          :isDiff="item.isDiff"
          style="height: 100%"
          v-show="!item.taskParam || item.taskParam.extension === '.sql'"
      ></monaco>
      <!--  -->
      <div v-if="item.taskParam && item.taskParam.extension !== '.sql'" class="extensionBox">
        <datablau-form size="small" :label-width="'100px'">
            <el-form-item label="程序类型" required>
              <datablau-select
                v-model="item.taskParam.extension"
                size="mini"
                style="width: 100%;"
                @change="getMainJars(1)"
                :themeBlack="true"
              >
                <el-option
                  v-for="(v, key) in extensionList"
                  :key="v"
                  :label="key"
                  :value="v"
                ></el-option>
              </datablau-select>
            </el-form-item>
            <el-form-item label="主函数的Class" required v-if="item.taskParam && ( item.taskParam.extension.indexOf('java') !== -1 || item.taskParam.extension.indexOf('scala') !== -1)">
              <datablau-input :themeBlack="true" style="width:100%" v-model.trim="item.taskParam.mainClass"></datablau-input>
            </el-form-item>
            <el-form-item label="主程序包" required v-if="item.taskParam && item.taskParam.extension && item.taskParam.extension !== '.sql'">
              <datablau-select
                v-model="item.taskParam.mainJar"
                size="mini"
                style="width: 100%;"
                :themeBlack="true"
              >
                <el-option
                  v-for="item in mainJarList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                ></el-option>
              </datablau-select>
            </el-form-item>
        </datablau-form>
      </div>
    </div>

    <div class="bottom-info-tabs" ref="bottomInfoTabs"
         :class="{'show-bottom-tabs': showBottomTabs}"
         v-if="!previewDdl">
      <div
          class="show-container"
          v-show="showBottomTabs"
      >
        <div class="control-console" v-show="bottomCurrentTab === 'controlConsole'">
          <controlConsole
            ref="controlConsole"
            :theme="black ? 'dark' : 'light'"
            :errorMes="item.errorStr"
            @hiddenLineageTab="hiddenBottomTab"
            @clearLogsRun="clearLogsRun"
          ></controlConsole>
        </div>
        <div class="sql-result" v-show="bottomCurrentTab === 'data'">
          <sql-data
            ref="sqlData"
            :sql="this.dataSql"
            :dataSourceId="dataSourceId"
            :schemaNameOp="schemaNameOp"
            :maxLength="item.maxLength"
            :bottomCurrentTab="bottomCurrentTab"
            @hiddenLineageTab="hiddenBottomTab"
            @errormsg="showConsole"
            @showDate="showDate"
            :theme="black ? 'dark' : 'light'"
          ></sql-data>
        </div>
        <div class="lineage-outer" v-show="bottomCurrentTab === 'lineage' && (typeEditor === 'file' || typeEditor === 'procedure')">
          <lineage-component
            ref="lineageComponent"
            :sql="this.lineageSql"
            :dataSourceId="dataSourceId"
            @hiddenLineageTab="hiddenBottomTab"
            :theme="black ? 'dark' : 'light'"
            :dataWarehouse="true"
          ></lineage-component>
        </div>
        <div class="logs" v-show="bottomCurrentTab === 'logs'">
          <logsComponent
            ref="logsComponent"
            :theme="black ? 'dark' : 'light'"
            :sqlStartId="sqlStartId"
            @hiddenLineageTab="hiddenBottomTab"
            :item="item"
          ></logsComponent>
        </div>
        <div class="history" v-show="bottomCurrentTab === 'history'">
          <historyComponent
            ref="historyComponent"
            :theme="black ? 'dark' : 'light'"
            :dsProjectCode="dsProjectCode"
            @hiddenLineageTab="hiddenBottomTab"
            @taskVersio="taskVersio"
            @lookLog="lookLog"
            :fileType="item.type"
            :taskCode="item.taskCode"
            :item="item"
          ></historyComponent>
        </div>
      </div>
      <div class="bottom-tabs-container" ref="bottomTabsContainer">
        <div
            class="tab-item" @click="changeBottomCurrentTab('controlConsole')"
            :class="{'current-active-tab': bottomCurrentTab === 'controlConsole'}"
        >控制台
        </div>
        <div
            class="tab-item" @click="changeBottomCurrentTab('lineage')"
            :class="{'current-active-tab': bottomCurrentTab === 'lineage'}"
            v-show="(typeEditor === 'file' && (item.type !== 31 && item.type !== 32) ) || typeEditor === 'procedure'"
        >血缘
        </div>
        <div
            class="tab-item"
            @click="changeBottomCurrentTab('data')"
            :class="{'current-active-tab': bottomCurrentTab === 'data'}"
        >数据
        </div>
        <div
            class="tab-item"
            @click="changeBottomCurrentTab('logs')"
            :class="{'current-active-tab': bottomCurrentTab === 'logs'}"
            v-show="logShowList.indexOf(item.type) !== -1"
        >日志
        </div>
        <div
            class="tab-item"
            @click="changeBottomCurrentTab('history')"
            :class="{'current-active-tab': bottomCurrentTab === 'history'}"
            v-show="logShowList.indexOf(item.type) !== -1"
        >历史
        </div>
        <!--<div class="tab-item"-->
        <!--     v-for="(item, index) in dataResultTabsList" :key="item"-->
        <!--     :class="{'current-active-tab': bottomCurrentTab === item}"-->
        <!--     @click="changeBottomCurrentTab(item)"-->
        <!--&gt;结果 {{ index + 1 }}-->
        <!--</div>-->
        <!--<datablau-tabs v-model="bottomCurrentTab" type="card" @tab-click="changeBottomCurrentTab">-->
        <!--  <el-tab-pane label="血缘" name="lineage">-->
        <!--  </el-tab-pane>-->
        <!--  <el-tab-pane v-for="(item, index) in dataResultTabsList" :key="item" :label="`结果 ${index}`" :name="item">-->
        <!--  </el-tab-pane>-->
        <!--</datablau-tabs>-->
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-irregular-whitespace */

import monaco from './monaco.vue'
import lineageComponent from '@/dataWarehouse/views/sqlEditor/lineageComponent.vue'
import sqlData from '@/dataWarehouse/views/sqlEditor/sqlData.vue'
import autoHandleConflict from '@/dataWarehouse/views/sqlEditor/autoHandleConflict.vue'
import ContentType from '@/dataWarehouse/views/sqlEditor/ContentType'
import { format } from 'sql-formatter'
import conflict from '@/dataWarehouse/views/sqlEditor/conflict'
// import { changeColor } from '@/resource/changeColor.js'
import Clickoutside from 'element-ui/src/utils/clickoutside'
import WinMergePage from '@/dataWarehouse/components/winMerge/main.vue'
import HTTP from '@/dataWarehouse/resource/http'
import string from '@/resource/utils/string'
import { Base64 } from 'js-base64'
import { mapState } from 'vuex'
import logsComponent from '@/dataWarehouse/views/sqlEditor/logsComponent'
import historyComponent from '@/dataWarehouse/views/sqlEditor/historyComponent'
import controlConsole from '@/dataWarehouse/views/sqlEditor/controlConsole'

export default {
  data () {
    return {
      // changeColor,
      // black: this.isThemeBlack,
      resultList: [],
      versionModel: false,
      bottomCurrentTab: '',
      dataResultTabsList: [],
      dataSql: '',
      lineageSql: '',
      request: {
        version: '',
        description: ''
      },
      branchList: [],
      projectId: +this.$route.query.projectId,
      fileFlatArray: [],
      fileFlatArrayBak: [],
      modelId: null,
      auth: this.$store.state.$auth,
      runRefresh: window.setting.sqlRunRefresh,
      tenantsList: [],
      workerList: [],
      environmentList: [],
      allEnvironmentList: [],
      tenantFlag: false,
      tenantId: '',
      workerId: '',
      environmentId: '',
      version: '',
      dsProjectCode: '',
      sqlStartId: '',
      logShowList: [13, 10, 30, 7, 19],
      taskTypeList: {
        13: 'SHELL',
        10: 'PYTHON',
        'java': 'JAVA',
        'scala': 'SCALA',
        'py': 'PYTHON',
        'sql': 'SQL'
      },
      paramTaskTypeList: {
        30: 'SPARK',
        7: 'FLINK',
        19: 'FLINK_STREAM'
      },
      extensionList: {
        JAVA: '.java',
        SCALA: '.scala',
        PYTHON: '.py'
        // SQL: '.sql'
      },
      mainJarList: [],
      savepointList: [],
      savepoint: ''
    }
  },
  mixins: [conflict],
  components: {
    monaco,
    lineageComponent,
    sqlData,
    autoHandleConflict,
    WinMergePage,
    logsComponent,
    historyComponent,
    controlConsole
  },
  computed: {
    monacoOpts () {
      return {
        value: this.item.content,
        origin: this.item.origin,
        readOnly: this.item.domainState === 'C' || this.item.domainState === 'X',
        theme: this.black ? 'vs-dark' : 'vs'
      }
    },
    hasDiff () {
      return false
      // todo:暂时不做限制，允许保存
      if (this.currentCodeDetailId) {
        const list = this.resultList[this.currentCodeDetailId]
        if (list) {
          return list.some(item => [ContentType.TopLine].includes(item.type))
        }
      }
      return false
    },
    showBottomTabs () {
      return this.bottomCurrentTab
    },
    disabledType () {
      if (this.typeEditor === 'script') {
        return Boolean(!this.authPro['MODEL_EDIT'] && !this.authPro.isAdmin)
      } else {
        return Boolean(!this.authPro['PROCEDURE_EDIT'] && !this.authPro.isAdmin)
      }
    },
    ...mapState({
      currentFileType: (state) => {
        return state.ddtStore.currentFileType
      }
    }),
    disabledTypeRun () {
      if (this.typeEditor === 'script') {
        if (this.currentFileType.dataBaseId === null) {
          return true
        } else {
          return Boolean(!this.authPro['MODEL_EDIT'] && !this.authPro.isAdmin)
        }
      } else {
        return Boolean(!this.authPro['PROCEDURE_EDIT'] && !this.authPro.isAdmin) || this.typeEditor === 'procedure' || (this.item.type === 31 || this.item.type === 32)
      }
    },
    taskCode () {
      return this.item.taskCode || ''
    }
  },
  props: {
    item: {
      type: Object,
      required: true
    },
    dataSourceId: {
      type: [String, Number]
    },
    schemaNameOp: {
      type: [String, Number]
    },
    idToFileData: {
      type: Object,
      required: true
    },
    path: {},
    editFiles: {},
    currentFile: {},
    isThemeBlack: {},
    bottomDomHeightSave: {
      type: Number,
      default: 24
    },
    black: {
      type: Boolean,
      default: true
    },
    bottomDomDis: {
      type: Boolean,
      default: false
    },
    hideBtn: {
      type: Boolean,
      default: false
    },
    fileData: {},
    branchName: {
      type: String,
      default: 'master'
    },
    previewDdl: {
      type: Boolean,
      default: false
    },
    hideTreeLeft: {
      type: String,
      default: '0px'
    },
    authPro: {
      type: Object
    },
    typeEditor: {
      type: String
    }
  },
  directives: { Clickoutside },
  mounted () {
    this.hiddenBottomTab()
    document.addEventListener('keydown', this.keyUpEvent)
    if (this.item && this.item.type !== 'script') {
      this.fileFlatArray = []
      this.getFileFlatData(this.item)
      this.fileFlatArrayBak = _.cloneDeep(this.fileFlatArray)
    } else {
      // console.log('script')
    }
    this.item.select = ''
    // 添加变量，文件为修改状态
    this.$bus.$on('setItemChanged', id => {
      if (this.item.id === id) {
        let FunNames = this.$store.state.funNames[id] || []
        let oldVar = this.$store.state.oldVariable[id] || []
        let oldFun = this.$store.state.oldFunNames[id] || []
        let variable = this.$store.state.variable[id] || []
        // this.$set(this.item, 'changed', true)
        // 对比udf和变量是否有变化
        // let changed = (JSON.stringify(FunNames) === JSON.stringify(oldFun)) && (JSON.stringify(variable) === JSON.stringify(oldVar))
        // this.findData(this.item, { changed })
        // this.$set(node, 'changed', true)
      }
    })
    // $(document).on('keydown', this.advancedSetting)
    this.$nextTick(async () => {
      let idRes = await this.$http.get(`${this.$dddUrl}/service/project/ds-project-mapping/${this.projectId}`)
      let { dsProjectCode } = idRes.data

      this.dsProjectCode = dsProjectCode
      if (this.item.taskCode) {
        this.getTask()
      }
      this.getMainJars()
    })
  },
  beforeDestroy () {
    // document.removeEventListener('keydown', this.keyUpEvent)
    this.$bus.$off('setItemChanged')
    $(document).off('keydown')
  },
  methods: {
    allVerification () {
      this.$bus.$emit('allVerification')
    },
    viewResults () {
      this.$bus.$emit('viewResults')
    },
    getSavepointList (row) {
      let params = {
        dsProjectCode: this.dsProjectCode,
        id: this.item.taskCode
      }
      HTTP.getSavepoint(params)
        .then(res => {
          this.savepointList = res
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // advancedSetting (e) {
    //   if ((e.keyCode === 77 && e.ctrlKey)) {
    //     this.runRefresh = true
    //     this.$emit('change', true)
    //   }
    // },
    // 获取 主程序包
    getMainJars (type) {
      if (!this.item.taskParam) return
      let obj = {
        '.java': 'JAVA',
        '.scala': 'SCALA',
        '.py': 'PYTHON'
      }
      if (type) {
        this.item.taskParam.mainJar = ''
        this.item.taskParam.mainClass = ''
      }
      obj[this.item.taskParam.extension] && HTTP.getMainJars({ programType: obj[this.item.taskParam.extension] })
        .then(res => {
          this.mainJarList = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    setValue (value) {
      let editor = this.$refs['editor'].monacoEditor
      editor.setValue(value)
    },
    locationFile (item) {
      this.$emit('location', item)
    },
    backPath () {
      this.fileFlatArray = _.cloneDeep(this.fileFlatArrayBak)
    },
    clickPath (item) {
      if (item.type === 0) { // 选中文件夹，更新文件路径
        let index = this.fileFlatArray.findIndex(i => i.id === item.parentId)
        this.fileFlatArray = this.fileFlatArray.slice(0, index + 1)
        this.fileFlatArray.push(item)
      } else if (item.type === 1) { // 选中文件，开始编辑
        this.fileFlatArray = _.cloneDeep(this.fileFlatArrayBak)
        this.$emit('triggerNodeClick', item)
      }
    },
    getFileFlatData (item) {
      if (!item) return
      if (item && item.parentId !== 0) {
        this.getFileFlatData(this.idToFileData[item.parentId])
      }
      this.fileFlatArray.push(item)
    },
    keyUpEvent (e) {
      if (e.ctrlKey && e.keyCode === 83) { //
        e.preventDefault()
        if (this.currentFile === 'file' + this.item.id || (this.item.type === 'script')) {
          this.saveSql(this.item)
        }
      }
    },
    // toggleTheme () {
    //   this.changeColor(this.black)
    //   this.black = !this.black
    //   let theme = this.black ? 'vs-dark' : 'vs'
    //   this.$refs.editor.changeTheme(theme)
    // },
    // 获取分支
    getBranchList () {
      HTTP.getBranchList(this.projectId).then(res => {
        this.branchList = res
        // this.branchList.unshift('master')
      }).catch(e => {
        this.$showFailure(e)
      })
    },
    saveNewVersionFile () {
      let item = this.currentItem
      let editor = this.$refs['editor'].monacoEditor
      this.editor = editor
      let content = editor.getValue()
      if (this.item.type === 'script') {
        this.$http.post(this.$dddUrl + `/service/model/version/${this.request.version}`, {
          ddl: content,
          id: this.item.id,
          comment: this.request.description,
          version: this.request.version
        }).then(res => {
          this.$datablauMessage.success('版本签入成功!')
          this.request = {
            version: '',
            description: ''
          }
          this.versionModel = false
          item.content = content
        }).catch(err => {
          this.$showFailure(err)
        })
        return
      }
      if (content.includes('<<<<<<<') || content.includes('>>>>>>>') || content.includes('======= ')) {
        this.$datablauMessage.warning('文件保存冲突，需解决冲突后提交!')
      }
      // let json = { }
      let id = this.$store.state.ddtStore.currentFileType.id
      let variable = this.$store.state.variable[id] || []

      this.$http.post(this.$dddUrl + `/service/code/version?codeDetailId=${item.codeDetailId}&version=${this.request.version}`, {
        codeDetailId: item.codeDetailId,
        content,
        comments: this.request.description,
        version: this.request.version
      }).then(res => {
        let data = res.data
        this.$datablauMessage.success('版本签入成功!')
        this.request = {
          version: '',
          description: ''
        }
        this.versionModel = false
        // item.changed = false
        // this.idToFileData[item.id].changed = false
        item.content = content
        // this.findData(item, { changed: false })
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    selectStr (item, str) {
      // 解决编辑器第一次获取焦点时，总在第一行的问题
      if (!str && !this.item.select) {
        return
      }
      this.$set(item, 'select', str)
    },
    exportSqlData (item) {
      if (this.$refs.sqlData?.exportData) {
        this.$refs.sqlData?.exportData()
      }
    },
    formatSql (id) {
      let editor = this.$refs['editor'].monacoEditor
      editor.setValue(format(editor.getValue(), {
        indentStyle: 'tabularLeft'
      }))
    },
    /**
     * for test. Don't use it in production mode.
     */
    saveSql1 () {
      // eslint-disable no-irregular-whitespace
      const localScript = `CREATE GLOBAL TEMPORARY TABLE tmp_salary (employee_id NUMBER(10), total_salary NUMBER(10)) ON COMMIT
DELETE
  ROWS;
INSERT INTO
  tmp_salary (employee_id, total_salary)
  /*
  removed
  removed
  removed
  removed
  */
SELECT
  s.employee_id,
  SUM(s.salary) AS total_salary
FROM
  salary s
GROUP BY
  s.employee_id;
CREATE
OR REPLACE VIEW employee_income AS
SELECT
  e.employee_id,
  e.name,
  e.gender,
  e.date_of_birth,
  e.date_of_hire,
  d.department_name,
  ts.total_salary,
  b.bonus
FROM
  employee e
  INNER JOIN department d ON e.department_id = d.department_id
  INNER JOIN tmp_salary ts ON e.employee_id = ts.employee_id
  LEFT OUTER JOIN bonus b ON e.employee_id = b.employee_id;`
      const onlineScript = `CREATE GLOBAL TEMPORARY TABLE tmp_salary (employee_id NUMBER(10), total_salary NUMBER(10)) ON COMMIT
DELETE
  ROWS;
INSERT INTO
  tmp_salary (employee_id, total_salary)
SELECT
  s.employee_id,
  SUM(s.salary) AS total_salary
FROM
  salary s
GROUP BY
  s.employee_id;
CREATE
OR REPLACE VIEW employee_income AS
SELECT
  e.employee_id,//
  e.name,//
  e.gender,//
  e.date_of_birth,//
  e.date_of_hire,//

  d.department_name,//
  ts.total_salary,//
  b.bonus
  /*
  add
  add
  add
  add
  add
  add
  */
FROM
  employee e
  INNER JOIN department d ON e.department_id = d.department_id
  INNER JOIN tmp_salary ts ON e.employee_id = ts.employee_id
  LEFT OUTER JOIN bonus b ON e.employee_id = b.employee_id;`
      this.$refs.winMergePage.init(localScript, onlineScript)
    },
    saveSql (item) {
      let editor = this.$refs['editor'].monacoEditor
      this.editor = editor
      let content = editor.getValue()
      // let json = { }
      let id = this.$store.state.ddtStore.currentFileType.id
      let variable = this.$store.state.variable[id] || []
      // variable.forEach(item => {
      //   item.prop = item.name
      // })
      if (this.typeEditor === 'procedure') {
        this.$http.put(HTTP.$dddUrl + '/datatype/sql/' + item.type + '/update', {
          dbType: item.dbType,
          schemaName: item.schemaName,
          procedureName: item.procedureName,
          procedureContent: content,
          datasourceId: item.modelId
        })
          .then(res => {
            if (res.data.code !== 200) {
              this.$datablauMessage.warning(res.data.message)
              return
            }
            this.$datablauMessage.success('保存成功')
            let node = this.idToFileData[item.id]
            this.$set(node, 'changed', false)
            this.$emit('closeFile', item)
          })
          .catch(e => {
            this.$showFailure(e)
          })
        return
      }
      if (item.type === 'script') {
        this.$http.post(this.$dddUrl + '/service/model/saveDDL', {
          ddl: content,
          id: this.item.id
        })
          .then(res => {
            item.changed = false
            this.idToFileData[item.id] && (this.idToFileData[item.id].changed = false)
            item.content = content
            this.$datablauMessage.success('保存成功!')
          })
          .catch(e => {
            this.$showFailure(e)
          })
        return
      }
      // 数据映射零时文件
      if (item.temporarilyFile) {
        this.$http.post(this.$dddUrl + '/service/model/dwMapping/file/save', {
          projectId: this.projectId,
          insertSql: item.content,
          savedPath: item.savedPath,
          fileType: item.type,
          branch: this.branchName
        }).then(res => {
          this.$datablauMessage.success('保存成功')
          this.$emit('refreshTree', { ...res.data, oldFileId: item.id, savedPath: item.savedPath })
        })
          .catch(e => {
            this.$showFailure(e)
          })
        return
      }
      // 有主程序包
      let taskParam = null
      if (this.item.taskParam) {
        taskParam = JSON.stringify(this.item.taskParam)
      }
      this.$http.put(this.$dddUrl + '/service/code/file', {
        id: item.codeDetailId,
        content,
        curId: item.curId,
        properties: variable,
        modelId: this.dataSourceId || item.modelId || '',
        database: this.schemaNameOp,
        funNames: this.$store.state.funNames[id] || [],
        taskParam
      }).then(res => {
        let data = res.data
        item.curId = data.content.curId
        if (!data.conflict) {
          this.$datablauMessage.success('保存成功!')
          item.changed = false
          this.idToFileData[item.id] && (this.idToFileData[item.id].changed = false)
          item.content = content
        } else {
          // item.origin = data.content.content
          let hasConflict = res.data.content.content !== content
          if (hasConflict) {
            this.$datablauMessage.warning('文件保存冲突，需解决冲突后提交!')
            this.$refs.winMergePage.init(content, res.data.content.content)
          } else {
            editor.setValue(data.content.content)
            this.saveSql(item)
          }
        }
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    deleteFile (data) {
      let deleteFile = this.editFiles.find(item => item.id === data.id)
      if (deleteFile) {
        if (this.idToFileData[deleteFile.id].changed) {
          this.$DatablauCofirm('有未保存的内容，确定删除该文件？').then(() => {
            this.editFiles = this.editFiles.filter(item => item.id !== data.id)
            this.idToFileData[deleteFile.id].changed = false
            if (this.editFiles.length) {
              this.$parent.$parent.$parent.$parent.currentFile = this.editFiles[0]?.id + ''
            }
          }).catch(() => {

          })
        } else {
          this.$DatablauCofirm('确定删除该文件？').then(() => {
            this.httpDeleteFile(data)
            this.editFiles = this.editFiles.filter(item => item.id !== data.id)
            if (this.editFiles.length) {
              this.$parent.$parent.$parent.$parent.currentFile = this.editFiles[0]?.id + ''
            }
          }).catch(() => {

          })
        }
      } else {
        this.$DatablauCofirm('确定删除该文件？').then(() => {
          this.httpDeleteFile(data)
        }).catch(() => {

        })
      }
    },
    httpDeleteFile (data) {
      this.$http({
        url: this.$dddUrl + '/service/code/file',
        method: 'delete',
        data: {
          id: data.id,
          projectId: data.projectId,
          codeDetailId: data.codeDetailId,
          name: data.name,
          type: data.type,
          parentId: data.parentId
        }
      }).then(res => {
        this.$datablauMessage.success('删除成功!')
        this.$parent.$parent.$parent.$parent.getFileTreeData()
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    openNewVersion (item) {
      this.currentItem = item
      this.versionModel = true
      // this.getBranchList()
    },
    runSql (item, val) {
      let sql = ''
      if (item.select) {
        sql = item.select
      } else {
        let editor = this.$refs['editor'].monacoEditor
        let content = editor.getValue()
        sql = content
      }
      this.dataSql = sql
      if (this.taskCode) {
        this.getTask()
        this.getSavepointList()
        this.savepoint = ''
        if (this.environmentId === -1) {
          this.environmentId = ''
        }
      }

      // 表示是shell类型
      if (this.logShowList.indexOf(item.type) !== -1) {
        HTTP.getTenants()
          .then(res => {
            this.tenantsList = res
            this.tenantFlag = true
            this.tenantId = ''
          })
          .catch(e => {
            // this.$showFailure(e)
            // let error = res.data.msg || res.data.message
            this.showConsole(e)
          })
        HTTP.getWorkerList()
          .then(res => {
            this.workerList = res.data || []
            this.workerId = this.workerId || this.workerList[0]
            this.workerId && this.getEnvironmentList()
          })
          .catch(e => {
            this.showConsole(e)
          })
        return
      }

      if (this.$refs.sqlData?.refreshData) {
        this.$nextTick(() => {
          !val && this.$refs.sqlData?.refreshData()
          val && this.$refs.sqlData?.performUpdate()
        })
        // 记录再次切到sql文件时，数据弹窗会不会展示
        // let stateAry = this.$store.state.ddtStore.openTableData
        // stateAry.indexOf(this.id) === -1 && this.$store.commit('ddtStore/setOpenTableData', item.id)
      }
    },
    getEnvironmentList () {
      HTTP.getEnvironmentList()
        .then(res => {
          this.allEnvironmentList = res.data
          this.filterList()
        })
        .catch(e => {
          this.showConsole(e)
        })
    },
    filterList () {
      this.environmentList = this.allEnvironmentList.filter(item =>
        this.filterEnvironmentList(item)
      )
      if (this.environmentId === -1) {
        this.environmentId = ''
      } else {
        this.environmentId = this.environmentId || this.environmentList[0].code
      }
    },
    filterEnvironmentList (item) {
      if (!this.workerId) return false
      if (!this.workerList.length) return false
      return item.workerGroups.indexOf(this.workerId) !== -1
    },
    getTask () {
      HTTP.getTask(this.dsProjectCode, this.item.taskCode)
        .then(res => {
          this.environmentId = res.data.environmentCode
          this.workerId = res.data.workerGroup
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    showDate () {
      this.bottomCurrentTab = 'data'
    },
    clearLogsRun () {
      this.item.errorStr = ''
    },
    getTime () {
      let date = new Date()
      let y = date.getFullYear()
      let m = date.getMonth() + 1
      let d = date.getDate()
      let h = date.getHours()
      let f = date.getMinutes()
      let s = date.getSeconds()
      return `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')} ${h.toString().padStart(2, '0')}:${f.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')} `
    },
    showConsole (e) {
      this.item.errorStr = this.item.errorStr || ''
      this.item.errorStr += 'ERROR ' + this.getTime() + e + '\n'
      this.bottomCurrentTab !== 'controlConsole' && (this.bottomCurrentTab = 'controlConsole')
      this.$refs.controlConsole.setValue(this.item.errorStr)
      this.$refs.controlConsole.clearHighLight()
    },
    taskVersio (version) {
      this.version = version
      HTTP.getTenants()
        .then(res => {
          this.tenantsList = res
          this.tenantFlag = true
          this.tenantId = ''
        })
        .catch(e => { this.$showFailure(e) })
    },
    lookLog (id) {
      this.sqlStartId = id
      this.bottomCurrentTab = 'logs'
      this.$refs.logsComponent.monacoOpts.value = ''
      this.$refs.logsComponent.getLogsList(this.sqlStartId)
    },
    async sqlStart () {
      let sql = ''
      if (this.item.select) {
        sql = this.item.select
      } else {
        let editor = this.$refs['editor'].monacoEditor
        let content = editor.getValue()
        sql = content
      }
      if (!this.tenantId || !this.workerId) {
        this.$datablauMessage.warning('租户和worker分组为必填项')
        return
      }
      let param = {
        tenantId: this.tenantId,
        workerGroup: this.workerId,
        environmentCode: this.environmentId || -1,
        name: this.item.name,
        taskType: this.taskTypeList[this.item.type],
        taskParams: {
          rawScript: sql
        }
        // savepoint: this.savepoint
      }
      /* console.log(this.item)
      return */
      if (this.paramTaskTypeList[this.item.type]) {
        let ary = this.item.name.split('.')
        let type = this.item.taskParam.extension.substring(1) || ary[1]
        param.taskParams.programType = this.taskTypeList[type]
        param.taskParams.mainClass = type !== 'py' ? this.item.taskParam.mainClass : ''
        param.taskParams.mainJar = { id: this.item.taskParam.mainJar }
        param.taskType = this.paramTaskTypeList[this.item.type]
      }
      this.$http.post(`${this.$ddsUrl}/projects/${this.dsProjectCode}/executors/d3-task-instance/start?taskCode=${this.taskCode}&version=${this.version}&savepoint=${this.savepoint}`, param)
        .then(res => {
          this.tenantFlag = false
          // this.item.taskCode = res.data.data
          // this.$set(this.item, 'taskCode', res.data.data)
          if (res.data.code !== 0) {
            // this.$datablauMessage.warning(res.data.msg)
            this.showConsole(res.data.msg)
            return
          }
          if (res.data.data.taskDefinitionCode
          ) {
            this.$set(this.item, 'taskCode', res.data.data.taskDefinitionCode
            )
            this.bindTaskCode(res.data.data.taskDefinitionCode)
          }
          if (res.data.data.mappingCode) {
            this.getInstances(res.data.data.mappingCode)
          }
          // this.getHistoryList()
        })
        .catch(e => {
          // this.$showFailure(e)
          this.showConsole(e)
          this.tenantFlag = false
        })
    },
    // 查找任务实例id
    getInstances (mappingCode) {
      let time = null
      this.$http.get(`${this.$ddsUrl}/projects/${this.projectId}/task-instances/${mappingCode}`)
        .then(res => {
          if (res.data.data) {
            this.haveLog(res.data.data)
          } else {
            time = setTimeout(() => {
              this.getInstances(mappingCode)
              clearTimeout(time)
            }, 2000)
          }
        })
        .catch(e => {
          // this.$showFailure(e)
          this.showConsole(e)
        })
    },
    // 查找日志
    haveLog (id) {
      let time = null
      this.$http.get(`${this.$ddsUrl}/log/haveLog/${id}`)
        .then(res => {
          if (res.data.code === 0) {
            this.bottomCurrentTab = 'logs'
            this.$refs.logsComponent.monacoOpts.value = ''
            this.$refs.logsComponent.getLogsList(id)
            this.sqlStartId = id
          } else if (res.data.code === 10201) {
            // this.$datablauMessage.warning('运行错误')
            this.showConsole('运行错误')
          } else if (res.data.code === 10191) {
            // this.$datablauMessage.warning('当前任务暂无日志')
            time = setTimeout(() => {
              this.haveLog(id)
              clearTimeout(time)
            }, 100)
          }
        })
        .catch(e => {
          // this.$showFailure(e)
          this.showConsole(e)
        })
    },
    bindTaskCode (taskCode) {
      this.$http.post(`${this.$dddUrl}/service/code/bindTaskCode?codeDetailId=${this.item.codeDetailId}&taskCode=${taskCode}`)
        .then(res => {
        })
        .catch(e => {
          // this.$showFailure(e)
          this.showConsole(e)
        })
    },
    getSqlLineage (item) {
      this.lineageSql = ''
      let sql = ''
      if (item.select) {
        sql = item.select
      } else {
        let editor = this.$refs['editor'].monacoEditor
        let content = editor.getValue()
        sql = content
      }

      this.lineageSql = sql

      if (this.$refs.lineageComponent?.refreshLineage) {
        this.$refs.lineageComponent?.refreshLineage()
      }

      this.bottomCurrentTab = 'lineage'
    },
    hiddenBottomTab () {
      this.changeBottomCurrentTab(this.bottomCurrentTab || '')
    },
    changeBottomCurrentTab (val) {
      if (this.bottomCurrentTab === val) {
        this.bottomCurrentTab = ''
      } else {
        this.bottomCurrentTab = val
      }
      if (val === 'history' && this.bottomCurrentTab) {
        if (!this.taskCode) {
          this.$refs.historyComponent.historyList = []
          return
        }
        this.$refs.historyComponent.pageNo = 1
        this.$refs.historyComponent.getHistoryList()
      }
      if (val === 'controlConsole') {
        this.$refs.controlConsole.clearHighLight()
      }
      // 切换底部tab 展示
      this.changeBottomHeight()
    },
    changeBottomHeight () {
      this.$emit('changeBottomCurrentTab', this.bottomCurrentTab)
      $(this.$refs.bottomInfoTabs).css('height', this.showBottomTabs ? this.bottomDomHeightSave + 'px' : '24px')
    },
    // 内容改变自动获取值
    changeValue (item, value) {
      /* if (item.type === 'script' || this.typeEditor === 'procedure') {
        if (value !== item.content) {
          this.$set(item, 'changed', true)
        }

        return
      } */
      if (this.previewDdl) return
      this.findData(item)
      // let content = this.$refs['editor'].monacoEditor.getValue()
      // if (item.content === content) {
      //   this.$set(item, 'changed', false)
      // } else {
      //   this.$set(item, 'changed', true)
      // }
      // this.$set(node, 'changed', true)
      this.highlightWhenValueChange(value)
    },
    findData (item, val) {
      let node = {}
      let content = this.$refs['editor'].monacoEditor.getValue()
      if (this.idToFileData[item.id]) {
        node = this.idToFileData[item.id]
        if ((val && val.changed) && item.content === content) {
          this.$set(node, 'changed', false)
        } else if ((val && !val.changed) || item.content !== content) {
          this.$set(node, 'changed', true)
        }
      } else {
        node = this.idToFileData[item.parentId]?.children.find(k => k.id === item.id)
        if ((val && val.changed) && item.content === content) {
          this.$set(node, 'changed', false)
        } else if ((val && !val.changed) || item.content !== content) {
          this.$set(node, 'changed', true)
        }
      }
    }
  },
  watch: {
    bottomDomHeightSave (newVal) {
      $(this.$refs.bottomInfoTabs).css('height', newVal + 'px')
    },
    // 当前 editor 是否是选中
    currentFile (val) {
      // SQL 文件, script 脚本
      if (val === `file${this.item.id}` || val === `script_${this.item.id}` || val === `procedure${this.item.id}`) {
        this.changeBottomHeight()
        this.$bus.$emit('sqlHighlightClear')
        // $(this.$refs.bottomInfoTabs).css('height', '24px')
        // this.bottomCurrentTab = ''
      }
    },
    // 底部 tab 是否显示并且可以拖拽
    bottomCurrentTab () {
      this.changeBottomHeight()
    },
    bottomDomDis (val) {
      if (!val) {
        $(this.$refs.bottomInfoTabs).css('height', '24px')
        this.bottomCurrentTab = ''
      } else {
        $(this.$refs.bottomInfoTabs).css('height', this.bottomDomHeightSave + 'px')
        this.bottomCurrentTab = this.bottomCurrentTab || ''
      }
    }
  }
}
</script>

<style lang="scss" scoped>
$bottomTabContainerHeight: 24px;
/deep/ .tooltip-inner {
  background: rgba(0, 0, 0, 0);
}

.operator-wrapper {
  position: absolute;
  // top: -31px;
  left: 0;
  right: 0;
  line-height: 30px;
  // border: 1px solid #EFEFEF;
  z-index: 99;
  background: #fff;
  .path {
    display: inline-block;
    font-size: 12px;
    line-height: 30px;
    color: #999;
    margin-left: 8px;
  }

  .list {
    margin-right: 8px;
    display: inline-block;
    vertical-align: middle;
    // float: right;
    line-height: 32px;
    font-size: 18px;
    position: absolute;
    top: -40px;
    left: 0;
    .icon-divider{
      display: inline-block;
      width: 1px;
      height: 24px;
      background: #515151;
      margin: 0 6px;
      vertical-align: middle;
    }
  }
}

  .editor-inner-container {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;

    .middle-editor-container {
      position: absolute;
      left: 0;
      right: 0;
      top: 33px;
      bottom: 0px;
      //transition: bottom 0.4s;
      overflow: hidden;

      &.bottom-tabs-up {
        bottom: 0;
      }
      &.previewDdl{
        top: 10px;
      }
    }
  }

  .bottom-info-tabs {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    height: $bottomTabContainerHeight;
    overflow: hidden;
    //transition: height .4s;
    border-top: 1px solid #222222;
    //border: 1px solid red;
    z-index:111;
    background-color: #222222;

    .bottom-tabs-container {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 24px;
    }
    &.show-bottom-tabs {
      // .bottom-tabs-container {
      //   height: 30px;
      // }
      // .tab-item {
      //   line-height: 30px;
      // }
    }
    .tab-item {
      line-height: 24px;
      display: inline-block;
      padding: 0 10px;
      cursor: pointer;
      //margin-right: 4px;
      border: 1px solid #222222;
      border-right: none;
      color: #bbbbbb;
      //transition: all 0.4s;

      &:last-child {
        box-sizing: border-box;
        border-right: 1px solid #222222;
      }

      &.current-active-tab {
        color: #409EFF;
        // border: none;
        border-bottom: 3px solid #409EFF;
        background: rgba(64,158,255,0.1);
      }
    }

    &.show-bottom-tabs {
      height: 328px;
    }

    .show-container {
      position: absolute;
      left: 0;
      right: 0;
      bottom: $bottomTabContainerHeight;
      //height: 300px;
      top: 0;
      /*overflow: auto;*/
      border-bottom: 1px solid #222222;

      .sql-result, .lineage-outer, .control-console, .logs {
        height: 100%;
        width: 100%;
      }
    }

  }
  /deep/.el-input__inner:hover, /deep/.el-textarea__inner:hover{
    border-color:#666666!important; ;
  }
  .extensionBox{
    width: 550px;
    padding-top: 20px;
    padding-left: 20px;
  }
</style>
<style>
  #context-menu .context-menu-style .context-option:hover {
    background: rgba(0, 0, 0, 0);
  }
  .el-tooltip__popper.is-dark {
    background: #555;
    opacity: 0.8;
  }
  .ant-breadcrumb-separator, .ant-breadcrumb, .ant-breadcrumb-link,.ant-dropdown-menu-item, .ant-breadcrumb > span:last-child {
    color: #bbbbbb!important;
    font-size: 12px;
  }
</style>
