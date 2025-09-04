<template>
  <div style="display: inline-block">
    <datablau-dialog
      title="选择目录"
      :visible.sync="showModeCategory"
      size="l"
      append-to-body
      custom-class="new-model-select-model-category-dialog"
      :blackTheme="showDataSourceSel"
      :scrollDom="'.category-scroll-container.tree-outer'"
    >
      <div class="tree-container">
        <div class="filter-line">
          <datablau-input
              v-model="keyword"
              :iconfont-state="true"
              :placeholder="$store.state.$v.common.placeholder"
              clearable
              :themeBlack="showDataSourceSel"
          ></datablau-input>
        </div>
        <div class="category-scroll-container tree-outer">
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
            :themeBlack="showDataSourceSel"
          ></db-tree>
        </div>
      </div>
      <div slot="footer">
        <datablau-button :themeBlack="showDataSourceSel" type="secondary" @click="showModeCategory = false">
          取消
        </datablau-button>
        <datablau-button
          type="primary"
          :themeBlack="showDataSourceSel"
          :disabled="!chosenMoveCategoryId"
          @click="handleMoveCategory"
        >
          确定
        </datablau-button>
      </div>
    </datablau-dialog>
    <datablau-dialog
      :close-on-click-modal='false'
      :visible.sync="showAddModel"
      width="685px"
      :height="showDataSourceSel ? '600px' : '555px'"
      custom-class="create-model-dialogNew"
      :modal-append-to-body="false"
      :blackTheme="showDataSourceSel"
      :scrollDom="'.db-logo-cont'"
      @close="cancelForm">
      <div class="dialog-head" :class="{'black-theme': showDataSourceSel}" slot="title">
        新建模型
      </div>
      <datablau-form :key="treePathKey" style="position: relative;padding: 6px 20px 0px 20px;" :model="addModelForm"
                     ref="addModelForm" :rules="addModelFormRules" label-width="80px" :inline="false" size="normal">
        <el-form-item style="width: 433px;display: inline-block;" label="模型名称" prop="name" size="mini">
          <datablau-input style="width: 343px;" :themeBlack="showDataSourceSel" maxlength="40" id="limit-paste" v-model="addModelForm.name"></datablau-input>
        </el-form-item>
        <el-form-item style="width: 200px;display: inline-block;" label="版本名称" prop="version" size="mini">
          <datablau-input style="width: 120px" :themeBlack="showDataSourceSel" maxlength="40" v-model="addModelForm.version"></datablau-input>
        </el-form-item>
        <el-form-item label="目录位置" prop="path" size="mini">
          <datablau-input :themeBlack="showDataSourceSel" maxlength="40" readonly style="cursor: pointer;width: 545px;" v-model="addModelForm.path"
                          @click.native="showModeCategory=true"></datablau-input>
        </el-form-item>
        <el-form-item label="版本描述" prop="description" size="mini">
          <datablau-input :autosize="{ minRows: 2, maxRows: 2 }" style="width: 545px;" resizeState type="textarea" :themeBlack="showDataSourceSel" v-model="addModelForm.description"></datablau-input>
        </el-form-item>
        <el-form-item label="选择数据库" v-if="showDataSourceSel">
          <datablau-select
            filterable
            clearable
            class="select-panel"
            v-model="dataBaseId"
            placeholder="请选择数据库"
            @change="getChemaList()"
            key="startVersion"
            :themeBlack="showDataSourceSel"
          >
            <el-option
              v-for="ds in dataSourceList"
              :key="ds.id"
              :label="ds.sourceName"
              :value="ds.id"
            >
              <div slot="default">
                <database-type style="display: inline-block" :size="24"
                               :value="ds.type" :hide-type-text="true">
                </database-type>
                {{ ds.sourceName }}
                <span class="tagName">{{ ds.tagName }}</span>
              </div>
            </el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item label="选择schema" v-if="showDataSourceSel">
          <datablau-select
            filterable
            clearable
            class="select-panel"
            v-model="schemaName"
            placeholder="请选择schema"
            key="startVersion"
            :themeBlack="showDataSourceSel"
          >
            <el-option
              v-for="v in schemaList"
              :key="v"
              :label="v"
              :value="v"
            >
            </el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item label="强管控" size="mini" v-if="$store.state.featureMap.ddm_WebModelAdvancedAttribute">
          <datablau-switch
            style="display:inline-block;margin-right:6px"
            class="limited-switch"
            v-model="limitedDsApply"
          ></datablau-switch>
          <span style="font-size: 12px;">{{
              limitedDsApply ? $store.state.$v.modelDetail.enabled : $store.state.$v.modelDetail.disabled
            }}</span>
          <datablau-tips :effect=" $route.path.indexOf('sql_editor') !== -1?'light':'dark'" :content="$store.state.$v.modelDetail.forcedTip2" icon="icon-tips"
                         style="display:inline-block;margin-right:30px;margin-left:8px;color:#999"></datablau-tips>
          <datablau-checkbox
            style="display: inline-block;"
            class="limited-config"
            v-model="limitedDsApplyConfig"
            :disabled="!limitedDsApply"
          >
            <el-checkbox label="rColDt">{{ $store.state.$v.modelDetail.dataType }}</el-checkbox>
            <el-checkbox label="rColChName">{{ $store.state.$v.modelDetail.cnName }}</el-checkbox>
            <el-checkbox label="rColName">{{ $store.state.$v.modelDetail.colName }}</el-checkbox>
          </datablau-checkbox>
        </el-form-item>
      </datablau-form>
      <div class="tab-wrapper" :class="{'black-theme': showDataSourceSel}">
        <datablau-tabs style="padding: 0 4px;display: inline-block;" v-model="databaseType" :themeBlack="showDataSourceSel">
          <el-tab-pane v-if="addModelFormTypes.length" label="最近使用" name="lastestUse">
          </el-tab-pane>
          <el-tab-pane label="概念与逻辑模型" name="logical">
          </el-tab-pane>
          <el-tab-pane label="关系型物理模型" name="sql">
          </el-tab-pane>
          <el-tab-pane label="非关系型物理模型" name="nosql">
          </el-tab-pane>
        </datablau-tabs>
        <datablau-input v-model="query" style="float: right;" clearable placeholder="搜索模型类型"></datablau-input>
      </div>
      <div class="db-logo-cont" :style="{top: logoChooseTop + 'px'}" :class="{'black-theme': showDataSourceSel}">
<!--        <div class="db-logo-line"></div>-->
        <div v-if="databaseType === 'lastestUse'" class="db-logo-container">
          <!--          <p class="disc">概念与逻辑模型</p>-->
          <div v-for="item in lodash.clone(addModelFormTypes).reverse().filter(item => query? (logicalModelMap[item] || item).toUpperCase().indexOf(query.toUpperCase())>=0: true)" :key='item' class="db-logo-box"
               :class="{'active-db':item === addModelForm.type}" @click="addModelForm.type = item">
            <img :src="`${webPath}static/image/DBlogos/${item}.png`">
            <div class="db-name">
              {{ logicalModelMap[item] || item }}
            </div>
          </div>
        </div>
        <div v-if="databaseType === 'logical'" class="db-logo-container">
<!--          <p class="disc">概念与逻辑模型</p>-->
          <div v-for="item in logicalModel.filter(item => query? (logicalModelMap[item] || item).toUpperCase().indexOf(query.toUpperCase())>=0: true)" :key='item' class="db-logo-box"
               :class="{'active-db':item === addModelForm.type}" @click="addModelForm.type = item">
            <img :src="`${webPath}static/image/DBlogos/${item}.png`">
            <div class="db-name">
              {{ logicalModelMap[item] }}
            </div>
          </div>
        </div>
        <div v-if="databaseType === 'sql'" class="db-logo-container">
<!--          <p class="disc disc2">关系型物理模型</p>-->
          <div v-for="item in sqlModels.filter(item => query? (logicalModelMap[item] || item).toUpperCase().indexOf(query.toUpperCase())>=0: true)" :key='item' class="db-logo-box"
               :class="{'active-db':item === addModelForm.type}" @click="addModelForm.type = item">
            <img
              :src="`${webPath}static/image/DBlogos/${logoNameMap[item] || (item + '.png')}`">
            <div class="db-name">
              {{ item }}
            </div>
          </div>
        </div>
        <div v-if="databaseType === 'nosql' && noSqlModels.length > 0" class="db-logo-container" style="padding-bottom: 20px;">
<!--          <p class="disc disc2">非关系型物理模型</p>-->
          <div v-for="item in noSqlModels.filter(item => query? (logicalModelMap[item] || item).toUpperCase().indexOf(query.toUpperCase())>=0: true)" :key='item' class="db-logo-box" :class="{'active-db':item === addModelForm.type}" @click="addModelForm.type = item">
            <img :src="`${webPath}static/image/DBlogos/${item}.png`">
            <div class="db-name">
              {{item}}
            </div>
          </div>
        </div>
      </div>
      <span slot="footer">
        <datablau-button :themeBlack="showDataSourceSel" @click="cancelForm" type="cancel" size='mini'></datablau-button>
        <datablau-button :themeBlack="showDataSourceSel" type="important" :disabled="addModelForm.type === ''"
                         :loading="newModelLoading" :dblClickTimeout="1500" @click="submitForm('addModelForm')"
                         size='mini'>确定</datablau-button>
      </span>
    </datablau-dialog>
    <datablau-dialog
      title="逆向数据库"
      :visible.sync="reverseDataBaseModal"
      width="875px"
      height="650px"
      :key="reverseDataBaseKey"
      append-to-body
      class="dialog-shadow"
      ref="reverseDataBaseRef"
      custom-class="reverse-database-dialog">
      <div class="reverse-database-content-wrapper">
        <div class="hint-wrapper">
          <div class="left-panel panel-detail" :class="{active: step === 'first'}">
            <i class="iconfont" :class="step === 'first'?'icon-fillin': 'icon-zhengque'"></i>
            基本信息
          </div>
          <div class="right-panel panel-detail" :class="{active: step === 'second'}">
            <i class="iconfont icon-fillin" v-if="step === 'second'"></i>
            设置
          </div>
        </div>
        <div class="content-wrapper" v-show="step === 'first'">
          <edi-data-source
            ref="editDataSource"
            :dsEditing="false"
            :dsform="dsform"
            :para="{}"
            :dsformConstant="dsformConstant"
            :dataZoneTags="dataZoneTags"
            :tagTree="[]"
            :tagMap="{}"
            @changeDisabledStepState="changeDisabledStepState"></edi-data-source>
        </div>
        <div class="content-wrapper" v-if="step === 'second'">
          <reverse-database-setting @diabledConfirm="handleDisabledReverseConfirm" :key="reverseDatabaseSettingKey" ref="reverseDatabaseSetting" @closeDialog="closeDialog"></reverse-database-setting>
        </div>
      </div>
      <div slot="footer">
        <datablau-button type="cancel" @click="cancelReverseDataBase"></datablau-button>
        <datablau-button :key="1" :disabled="disabledStep2" type="important" v-if="step === 'first'" @click="goToStep2">下一步</datablau-button>
        <!--        <datablau-button type="important" v-if="step === 'first'" @click="goToStep2">下一步</datablau-button>-->
        <datablau-button :key="2" v-if="step === 'second'" @click="goToStep1">上一步</datablau-button>
        <datablau-button type="important" :disabled="disabledReverseConfirm" v-if="step === 'second'" @click="confirmReverse">确定</datablau-button>
      </div>
    </datablau-dialog>
<!--    <span v-if="!this.$slots.default">
      <span v-if="$store.state.lic.editor && $store.state.lic.quality && $store.state.lic.serverEnable && showButton"
            @click="openCreateModelDialog" class="new-model-btn">
        <i class="iconfont icon-NewModel" style="margin-right: 5px;position: relative;top: 2px;"></i>新建模型
      </span>
    </span>
    <div @click="openCreateModelDialog" v-else>
      <slot></slot>
    </div>-->
    <datablau-dropdown v-if="$store.state.lic.editor && showButton" @command="handleCommand">
      <span class="new-model-btn">
        <i class="iconfont icon-NewModel" style="margin-right: 5px;position: relative;top: 2px;"></i>新建
      </span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="newModel">新建模型</el-dropdown-item>
        <el-dropdown-item command="reverseDataBase">逆向数据库</el-dropdown-item>
      </el-dropdown-menu>
    </datablau-dropdown>
  </div>
</template>

<script>
import dbTree from '@/views/modelLibrary/tree/DatablauTree.vue'
import sort from '@/resource/utils/sort'
import HTTP from '@/resource/http'
import string from '@/resource/utils/string'
import databaseType from '@/components/common/DatabaseType.vue'
import dbType from '@/components/dataSource/databaseType.js'
import inElectron from '@/resource/utils/environment'
import lodash from 'lodash'
import ediDataSource from '@/views/common/ediDataSource.vue'
import reverseDatabaseSetting from '@/views/common/reverseDatabaseSetting.vue'

export default {
  props: {
    showButton: {
      default: true
    },
    showDataSourceSel: {
      default: false
    }
  },
  components: { dbTree, databaseType, ediDataSource, reverseDatabaseSetting },
  watch: {
    showModeCategory (newVal) {
      this.keyword = ''
      // if (newVal) {
      //   this.getModelsTree()
      // }
    },
    limitedDsApply (val) {
      if (!val) {
        this.limitedDsApplyConfig = []
      }
    },
    keyword (val) {
      this.$refs.tree2.filter(val)
    }
  },
  data () {
    return {
      query: '',
      disabledReverseConfirm: false,
      reverseDatabaseSettingKey: 0,
      reverseDataBaseKey: 0,
      disabledStep2: true,
      dsformConstant: {
        name: 'connection-1',
        displayName: '',
        dbtype: 'MYSQL',
        connectType: 'JDBC',
        hostname: 'localhost',
        dbname: '',
        dbport: '3306',
        username: '',
        password: '',
        files: '',
        createTime: '',
        versioning: true,
        CommentToLogicalName: true,
        Zone: '',
        owner: '',
        Deploy: '',
        State: '',
        //        DBVersion:'',
        Description: '',
        extraDbPara: 'SID',
        TagIds: [],
        ViewFiltered: false,
        ProceduresFiltered: false,
        FunctionFiltered: false
      },
      dataZoneTags: [],
      dsformBak: { 'name': 'connection-1', 'displayName': 'm-240221-167', 'dbtype': 'MYSQL', 'connectType': 'JDBC', 'hostname': '', 'dbname': '', 'dbport': '', 'username': '', 'password': '', 'files': '', 'createTime': '', 'versioning': true, 'CommentToLogicalName': true, 'Zone': '', 'owner': '', 'Deploy': '', 'State': '', 'Description': '', 'extraDbPara': 'SID', 'TagIds': [], 'ViewFiltered': false, 'ProceduresFiltered': false, 'FunctionFiltered': false, 'displayNameAdd': '', 'ExcelAutoCollect': 'false', 'GBaseMppVcName': null, 'sharePath': '', 'description': '' },
      dsform: {},
      step: 'first',
      reverseDataBaseModal: false,
      lodash,
      addModelFormTypes: [],
      databaseType: 'lastestUse',
      treePathKey: 0,
      newModelLoading: false,
      keyword: '',
      defaultkey: [1],
      modelCategoryMap: new Map(),
      moveTreeDefaultProps: {
        label: 'name',
        children: 'children',
        id: 'id'
      },
      cateGoryData: {},
      chosenMoveCategoryId: null,
      treeData: null,
      showModeCategory: false,
      webPath: inElectron ? '/' : window.setting.products.ddm.webPath,
      logicalModel: ['Conceptual', 'Logical', 'LogicalApp'],
      logicalModelMap: {
        Conceptual: '概念模型',
        Logical: '逻辑模型',
        LogicalApp: '应用 - 逻辑'
      },
      sqlModels: dbType.SQL_MODEL_LIST,
      noSqlModels: dbType.NO_SQL_MODEL_LIST,
      logoNameMap: {
        'GaussDB': 'GaussDBA.png',
        'CBase': 'CBase.svg'
      },
      addModelForm: {
        name: '',
        type: '',
        path: '',
        pathId: '',
        version: '',
        description: ''
      },
      addModelFormRules: {
        name: [
          { required: true, message: '请输入模型名称', trigger: 'blur' },
          { min: 4, max: 40, message: '长度在 4 到 40 个字符', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择模型类型', trigger: 'change' }
        ],
        version: [
          { required: true, message: '请输入模型版本', trigger: 'change' }
        ],
        path: [
          { required: true, message: '请选择模型目录', trigger: ['change', 'blur'] }
        ]
      },
      showAddModel: false,
      // 是否开启强管控模式
      limitedDsApply: false,
      limitedDsApplyConfig: [],
      dataSourceList: [],
      schemaList: [],
      dataBaseId: '',
      schemaName: ''
    }
  },
  mounted () {
    this.getModelsTree()
    window.NODE_APP === 'ddd' && this.getTagMap()
  },
  computed: {
    logoChooseTop () {
      let top = this.showDataSourceSel ? 370 : 280
      if (!this.$store.state.featureMap.ddm_WebModelAdvancedAttribute) {
        top -= 40
      }
      return top
    }
  },
  methods: {
    handleDisabledReverseConfirm (val) {
      this.disabledReverseConfirm = val
    },
    confirmReverse () {
      this.$refs.reverseDatabaseSetting?.confirmReverseDatabase()
    },
    closeDialog () {
      this.reverseDataBaseModal = false
      this.step = 'first'
    },
    changeDisabledStepState (val) {
      this.disabledStep2 = val
    },
    async goToStep2 () {
      let editDataSource = this.$refs.editDataSource
      let res = await this.$refs.editDataSource.testDataSource({ hideMsg: true }, true)
      if (!res) {
        return
      }
      this.step = 'second'
      if (editDataSource.onlyDatabase) {
        editDataSource.dsform.dbname = editDataSource.preDbnames
        editDataSource.dsform.schemas = []
      } else {
        // editDataSource.dsform.db = editDataSource.dsform.dbname
        editDataSource.dsform.schemas = editDataSource.schemaSelected
      }
      // this.$refs.reverseDatabaseSetting.resetData()
      // this.reverseDatabaseSettingKey++
      this.$nextTick(() => {
        this.$bus.$emit('sendStepOneData', this.$refs.editDataSource.dsform)
        this.disabledReverseConfirm = false
      })
    },
    goToStep1 () {
      this.step = 'first'
    },
    cancelReverseDataBase () {
      this.reverseDataBaseModal = false
    },
    handleCommand (command) {
      if (command === 'newModel') {
        this.openCreateModelDialog()
      } else if (command === 'reverseDataBase') {
        this.handleReverseDataBase()
      }
    },
    handleReverseDataBase () {
      this.$http.get('/gateway/service/instance').then(res => {
        if (!res.data?.includes('ddm-re-instance')) {
          this.$datablauMessage.error('逆向服务未启动')
          return
        }
        this.reverseDataBaseKey++
        this.dsform = _.cloneDeep(this.dsformBak)
        this.step = 'first'
        this.reverseDataBaseModal = true
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    // 获取数据源标签
    getTagMap () {
      this.$http
        .post(this.$baseUrl + '/tags/getAllTags')
        .then(res => {
          const map = {}
          let datazoneTag = {}
          if (res.data && Array.isArray(res.data)) {
            res.data.forEach(item => {
              map[item.tagId] = item
              if (item.name === '数据区域') {
                datazoneTag = item
              }
            })
            res.data.forEach(item => {
              if (item.parentId && map[item.parentId]) {
                let parent = map[item.parentId]
                if (!parent.children) {
                  parent.children = []
                }
                parent.children.push(item)
              }
            })
            this.tagMap = map
            this.getDataSourceList()
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
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
        this.defaultkey = [result.id]
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
        HTTP.getModels({
          successCallback: handler
        })
      }
    },
    getDataSourceList () {
      this.$http.get(`${this.$dddUrl}/service/model/getDataSource?projectId=${this.$route.query.projectId}`)
        .then(res => {
          let data = res.data.data
          this.dataSourceList = data
          this.dataSourceList.forEach(item => {
            let tagList = []
            // item.TagIds
            let tagId = item.connectionInfo?.parameterMap?.TagIds?.split(',') || []
            tagId.forEach(v => {
              if ((v || v === 0) && !isNaN(v - 0)) {
                tagList.push(this.tagMap && this.tagMap[v - 0].name)
              }
            })
            item.tagName = tagList.join(',')
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getChemaList () {
      if (!this.dataBaseId) {
        this.schemaName = ''
        return
      }
      this.$http.get(`${this.$dddUrl}/datatype/${this.dataBaseId}/raw-schemas?search=`).then(res => {
        this.schemaList = res.data
        this.schemaName = ''
      }).catch(err => {
        this.$showFailure(err)
      })
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
      this.addModelForm.path = this.cateGoryData.name
      this.treePathKey++
      this.addModelForm.pathId = this.cateGoryData.id
      this.showModeCategory = false
    },
    chooseMoveCategoryNode (data, node) {
      if (node.level === 1) {
        this.$datablauMessage({
          message: '不能选择根目录',
          type: 'error',
          showClose: true
        })
        this.chosenMoveCategoryId = ''
        this.cateGoryData = null
        return
      }
      this.chosenMoveCategoryId = data.id
      this.cateGoryData = data
      this.setPathStr(node, [])
    },
    setPathStr (node, ary) {
      ary.unshift(node.data.name)
      if (!node.parent) {
        return
      }
      if (node.parent.data.parentId !== 0) {
        this.setPathStr(node.parent, ary)
      } else {
        ary.unshift(node.parent.data.name)
      }
      this.cateGoryData.path = '/' + ary.join('/')
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
    getAddModelFormTypes () {
      let tenantId = localStorage.getItem('tenantId')
      let addModelFormTypes = localStorage.getItem(`addModelFormTypes_${tenantId || ''}`)
      if (addModelFormTypes) {
        this.addModelFormTypes = JSON.parse(addModelFormTypes)
      } else {
        this.addModelFormTypes = []
      }
      if (this.addModelFormTypes.length) {
        this.databaseType = 'lastestUse'
      } else {
        this.databaseType = 'logical'
      }
    },
    openCreateModelDialog () {
      this.getAddModelFormTypes()
      this.limitedDsApply = false
      this.limitedDsApplyConfig = []
      this.dataBaseId = ''
      this.schemaName = ''
      this.schemaList = []
      this.$set(this.addModelForm, 'version', '1.0')
      this.showAddModel = true

      let setCurrentCategory = () => {
        // 回显当前目录
        if (this.$route.name === 'list' && Object.keys(this.$route.query).length === 0 && this.$store.state.currentCategory) {
          let currentCategory = this.categoryMap[this.$store.state.currentCategory]
          if (currentCategory?.parentId) {
            this.addModelForm.path = currentCategory.name
            this.addModelForm.pathId = currentCategory.id
          }
          let parent = this.categoryMap[currentCategory.parentId]
          let path = [currentCategory.name]
          while (parent) {
            path.unshift(parent.name)
            parent = parent.parentId && this.categoryMap[parent.parentId]
          }
          this.cateGoryData.path = '/' + path.join('/')
        }
      }
      this.getModelsTree(setCurrentCategory)
    },
    cancelForm () {
      this.$refs.addModelForm.resetFields()
      this.showAddModel = false
      this.addModelForm = {
        path: '',
        pathId: '',
        name: '',
        type: ''
      }
    },
    submitForm (formName) {
      if (this.newModelLoading) {
        return
      }
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.addModel()
        } else {
          return false
        }
      })
    },
    async addModel () {
      this.newModelLoading = true
      try {
        let res = await HTTP.addModel({
          modelInfo: {
            name: this.addModelForm.name,
            description: '',
            categoryId: this.addModelForm.pathId,
            type: this.addModelForm.type === 'GaussDB' ? 'GaussDBA' : this.addModelForm.type,
            owner: this.$store.state.user.name
          }
        })
        if (this.limitedDsApply) {
          let config = {
            rColDt: false,
            rColChName: false,
            rColName: false
          }
          if (!this.limitedDsApply) {
            this.limitedDsApplyConfig = []
          }
          this.limitedDsApplyConfig.forEach(item => {
            config[item] = true
          })
          let para = {
            modelId: res.id,
            limitedDsApply: this.limitedDsApply,
            requestBody: config
          }

          await HTTP.setLimitedConfig(para)
        }
        await this.$http.post(this.$url + '/service/version/update?isFirst=true', {
          name: this.addModelForm.version,
          description: this.addModelForm.description,
          modelId: res.id
        })
        let tenantId = localStorage.getItem('tenantId')
        let addModelFormTypes = localStorage.getItem(`addModelFormTypes_${tenantId || ''}`)
        let arr = []
        if (addModelFormTypes) {
          arr = JSON.parse(addModelFormTypes)
          let index = arr.findIndex(item => item === this.addModelForm.type)
          if (index >= 0) {
            arr.splice(index, 1)
            arr.push(this.addModelForm.type)
          } else {
            if (arr.length < 5) {
              arr.push(this.addModelForm.type)
            } else {
              arr.shift()
              arr.push(this.addModelForm.type)
            }
          }
        } else {
          arr = [this.addModelForm.type]
        }
        localStorage.setItem(`addModelFormTypes_${tenantId || ''}`, JSON.stringify(arr))
        this.$store.commit('setLastCategoryId', this.addModelForm.pathId)
        // if (this.$route.path.includes('main/list')) {
        //   this.$store.commit('setOpenCreateModel', true)
        // }
        this.$message.success('模型新增成功')
        // 刷新模型后台数据
        this.$bus.$emit('updateModelList')
        this.editModel({ row: res })
        this.newModelLoading = false
        this.showAddModel = false
        res.path = this.cateGoryData.path
        res.dataBaseId = this.dataBaseId
        res.schemaName = this.schemaName
        this.$emit('newModelDetail', res)
      } catch (err) {
        console.error(err)
        this.$showFailure(err)
        this.newModelLoading = false
      }
    },
    editModel (scope) {
      this.$http.put(`${this.$url}/service/editor/${scope.row.id}/lock`).then(res => {
        if (res.data) {
          // this.$router.push({
          //   path: '/main/modeledit',
          //   query: {
          //     id: scope.row.id,
          //     currentVersion: scope.row.currentVersion,
          //     modelType: scope.row.modelType,
          //     phase: scope.row.phase ? scope.row.phase : 0
          //   }
          // })
          if (inElectron) {
            const { ipcRenderer } = window.require('electron')
            ipcRenderer && ipcRenderer.send('newTab', JSON.stringify(scope.row))
          } else {
            window.open(`${window.baseUrl}#/main/modeledit?id=${scope.row.id}&currentVersion=${scope.row.currentVersion}&modelType=${scope.row.modelType}&phase=${scope.row.phase ? scope.row.phase : 0}`, '_blank')
          }
        }
      }).catch(err => {
        this.$showFailure(err)
      })
    }
  }
}
</script>
<style lang="scss">
.reverse-database-dialog {
  .el-dialog__body {
    .datablau-dialog-content {
      .dialog-bottom {
        box-shadow: 0px -5px 14px -8px rgba(0, 0, 0, 0.2);
      }
    }
  }
  .el-dialog__footer {
    box-shadow: 0px -5px 14px -8px rgba(0, 0, 0, 0.2);
  }
}
.create-model-dialogNew {
  .datablau-dialog-content {
    padding: 0 !important;
    overflow: hidden !important;
  }
}

.new-model-select-model-category-dialog {
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

}
</style>
<style lang="scss" scoped>
.reverse-database-content-wrapper {
  .hint-wrapper {
    position: relative;
    z-index: 10;
    .right-panel {
      margin-left: 8px;
    }
    .panel-detail {
      position: relative;
      display: inline-block;
      height: 40px;
      width: calc(50% - 4px);
      line-height: 40px;
      font-size: 14px;
      text-align: center;
      background: #F5F5F5;
      &.left-panel:not(.active) {
        background: linear-gradient( 90deg, rgba(64,158,255,0.1) 0%, rgba(64,158,255,0.2) 100%);
        color: #409EFF;
        &:after {
          border-left: 20px solid rgba(64,158,255,0.2);
        }
      }
      i {
        vertical-align: middle;
      }
      &.active {
        background: linear-gradient(90deg, #74CDFF 0%, #409EFF 100%);
        color: #fff
      }
      &:after, &:before {
        content: '';
        width: 0;
        height: 0;
        position: absolute;
        border-top: 20px solid transparent;
        border-bottom: 20px solid transparent;
        z-index: 2;
      }
      &:first-child:after {
        right: -20px;
        top: 0;
      }
      &:last-child:before {
        border-left: 20px solid #fff;
        left: 0;
        top: 0;
        z-index: 1;
      }
      &.right-panel.active:after {
        display: none;
      }
      &.active:after {
        border-left: 20px solid #409eff;
      }
    }
  }
  .content-wrapper {
    position: absolute;
    top: 45px;
    left: 20px;
    right: 20px;
    bottom: 0;
    overflow: auto;
    z-index: 1;
  }
}
.datablau-tabs /deep/ .el-tabs .el-tabs__nav-wrap:after {
  display: none;
}
.datablau-input /deep/ .el-textarea__inner {
  min-height: unset!important;
}
.new-model-btn {
  display: inline-block;
  height: 32px;
  line-height: 32px;
  opacity: 1;
  background: linear-gradient(131deg, #6ECBFF 0%, #4072FF 100%);
  border-radius: 16px;
  padding: 0 12px;
  margin-right: 8px;
  cursor: pointer;
  font-size: 12px;
  color: #fff;

  &:hover {
    background: linear-gradient(121deg, #64ADFF 0%, #2052EF 100%);
  }
}

.create-model-dialogNew {
  .dialog-head {
    font-size: 16px;
    font-weight: 500;
    color: #555;
    line-height: 50px;
    &.black-theme{
      color: #888;
    }
  }

  .el-dialog__header {
    padding: 0;
    padding-left: 20px;
    height: 50px;
    border-bottom: 1px solid #ddd;
    position: relative;
  }

  .el-dialog__headerbtn {
    top: 14px;
    right: 16px;
    font-size: 14px;
  }

  .el-dialog__body {
    padding-right: 0;
    padding-bottom: 0;
    height: 366px;
    background-color: #f7f7f7;
    overflow-y: auto;
  }

  .el-dialog__footer {
    height: 64px;
  }
  .tab-wrapper {
    border-top: 1px solid #EFEFEF;
    padding: 10px 20px 0;
    &.black-theme{
      border-top: 1px solid #4D4D4D;
    }
  }
  .db-logo-cont {
    overflow: auto;
    position: absolute;
    left: 0;
    bottom: 0;
    top: 230px;
    right: 0;
    padding: 0 16px 0 20px;
    &.black-theme{
      // border-top: 1px solid #4D4D4D;
      .db-logo-container{
        .disc {
          color: #BBBBBB;
        }
        .db-logo-box{
          border: 1px solid #3c4041;
          .db-name{
            background: #4C5052;
            color: #BBBBBB;
          }
          &:hover{
            .db-name{
              color: #BBBBBB;
              background: rgba(64,153,255,.10196078431372549);
            }
          }
          &.active-db{
            .db-name{
              background: #409eff;
              color: #fff;
            }
          }
        }
      }
    }
    .db-logo-container {
      padding: 0 0 0 4px;

      .disc {
        margin-top: 10px;
        font-size: 12px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #555;
        position: relative;
        padding-left: 8px;
        margin-bottom: 8px;

        &::before {
          width: 3px;
          height: 14px;
          background: #409EFF;
          content: '';
          position: absolute;
          top: 1px;
          left: 0;
          display: block;
        }

        &.disc2 {
          margin-top: 6px;
        }
      }

      .db-logo-box {
        position: relative;
        display: inline-block;
        margin-bottom: 10px;
        margin-right: 8px;
        width: 121px;
        cursor: pointer;
        border-radius: 2px 2px 2px 2px;
        overflow: hidden;
        border: 1px solid #DDDCDD;

        &:nth-of-type(5n) {
          margin-right: 0px;
          // margin-left: 10px;
        }

        img {
          display: block;
          margin: 0 auto;
          width: 100%;
          height: auto;
        }

        // background-color: #fffbff;
        .db-name {
          font-size: 12px;
          text-align: center;
          line-height: 24px;
          height: 24px;
          background: #EFEEEF;
          color: #555;
          // background: #4C5052;
          transition: all 0.3s;
          border-radius: 0px 0px 2px 2px;
        }

        &:hover {
          .db-name {
            background: #4099ff1a;
            color: #555;
          }
        }

        &.active-db {
          .db-name {
            background: #409EFF;
            color: #fffbff;
          }

          &:hover {
            .db-name {
              background: #409EFF;
              color: #fffbff;
            }
          }
        }
      }

      .selected-db {
        position: absolute;
        top: 0;
        left: 0;
        width: 112px;
        height: 72px;
        background-color: rgba(85, 85, 85, 0.7);

        img {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      }

    }
  }
}
</style>
