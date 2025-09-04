<template>
  <div>
    <win-merge-page
      ref="winMergePage"
      dialogTitle="版本对比"
      :bar="false"
      :envType="envType"
      :leftType="leftType"
    >
    </win-merge-page>
    <new-model ref="newModelRef"  :show-button="false" @newModelDetail="newModelDetail" :showDataSourceSel="true"></new-model>
    <datablau-dialog
      title="新建"
      :visible.sync="newDirModel"
      :modal-append-to-body="true"
      size="s"
      :blackTheme="true"
    >
    <datablau-form
    label-width="78px"
    @submit.native.prevent
      >
      <el-form-item label="文件夹名" required>
        <datablau-input :themeBlack="true" style="width:100%"  v-model="newDirName" @keyup.enter.native="addNewDir"></datablau-input>
      </el-form-item>
    </datablau-form>

      <div slot="footer">
        <datablau-button type="normal" :themeBlack="true" @click="newDirName='',newDirModel=false">
          取消
        </datablau-button>
        <datablau-button :themeBlack="true" type="important" @click="addNewDir">
          确定
        </datablau-button>
      </div>
    </datablau-dialog>
    <datablau-dialog
      title="重命名"
      :visible.sync="modifyDirModel"
      :modal-append-to-body="true"
      size="s"
      :blackTheme="true"
    >
    <datablau-form
    label-width="78px"
    @submit.native.prevent
      >
      <el-form-item label="文件夹名" required>
        <datablau-input :themeBlack="true" style="width:100%"  v-model="modifyDirName" @keyup.enter.native="modifyDirNameFunc"></datablau-input>
      </el-form-item>
    </datablau-form>
      <div slot="footer">
        <datablau-button type="normal" :themeBlack="true" @click="modifyDirName='',modifyDirModel=false">
          取消
        </datablau-button>
        <datablau-button :themeBlack="true" type="important" @click="modifyDirNameFunc">
          确定
        </datablau-button>
      </div>
    </datablau-dialog>
    <datablau-dialog
        title="引入模型：选择模型"
        :visible.sync="bindModelDialog"
        :modal-append-to-body="true"
        size="xl"
        height="600px"
        :blackTheme="true"
    >
      <div class="bind-dialog-outer">
        <model-library
            :key="modelLibraryKey"
            :need-bind="true"
            ref="modelLibrary"
            :dialogOpen="true"
            v-show="bindStep === 1"
            :sqlEditor="true"
            @mullTip="mullTip"
        ></model-library>
        <div class="bind-step-2-container" v-show="bindStep === 2">
          <div class="bindModelPath">
            <p>已选模型目录：{{ bindModelPath }}</p>
          </div>
          <datablau-form
              label-position="right"
              label-width="83px"
              ref="form"
              :themeBlack="true"
              style="margin:0 8px"
          >
            <!-- <el-form-item label="模型目录" prop="name">
              <span>{{ bindModelPath }}</span>
            </el-form-item> -->
            <datablau-detail-subtitle :themeBlack="true" title="版本选择" mt="14px"></datablau-detail-subtitle>
            <div style="display: inline-block">
              <span style="margin-left:12px;color:#888888;display: flex;align-items:center"><i class="iconfont icon-tips" style="margin-right:4px"></i>当起始版本和终止版本相同时，显示当前版本所有表。当起始版本和终止版本不同时，显示从起始版本到终止版本变化的表</span>
            </div>
            <div>
              <el-form-item label="起始版本" style="display: inline-block;">
                <datablau-select
                    filterable
                    clearable
                    class="select-panel"
                    v-model="startVersion"
                    placeholder="请选择起始版本"
                    @change="changeSelectVersion"
                    style="width: 300px;"
                    key="startVersion"
                    :themeBlack="true"
                >
                  <el-option
                      v-for="v in versionList"
                      :key="v.startVersion"
                      :label="v.name"
                      :value="v.startVersion"
                      :disabled="(!!endVersion && (v.startVersion - 0) > (endVersion - 0))"
                  >
                  </el-option>
                </datablau-select>
              </el-form-item>
              <el-form-item label="终止版本" style="display: inline-block;">
                <datablau-select
                    style="width: 300px;"
                    filterable
                    clearable
                    class="select-panel"
                    v-model="endVersion"
                    placeholder="请选择起始版本"
                    @change="changeSelectVersion"
                    key="endVersion"
                    :themeBlack="true"
                >
                  <el-option
                      v-for="v in versionList"
                      :key="v.startVersion"
                      :label="v.name"
                      :value="v.startVersion"
                      :disabled="(!!startVersion && (v.startVersion - 0) < (startVersion - 0))"
                  >
                  </el-option>
                </datablau-select>
              </el-form-item>
            </div>
            <datablau-detail-subtitle :themeBlack="true" title="数据库选择" mt="14px"></datablau-detail-subtitle>
            <div>
              <el-form-item label="数据库" style="display: inline-block;">
                <datablau-select
                  filterable
                  clearable
                  class="select-panel"
                  v-model="dataBaseId"
                  placeholder="请选择数据库"
                  @change="getChemaList()"
                  style="width: 300px;"
                  key="startVersion"
                  :themeBlack="true"
                >
                  <el-option
                    v-for="ds in dataSourceList"
                    :key="ds.id"
                    :label="ds.sourceName"
                    :value="ds.id"
                  >
                    <div slot="default">
                      <database-type style="display: inline-block" :size="24"
                                     :value="ds.type" :hideLabel="true">
                      </database-type>
                      {{ ds.sourceName }}
                      <span class="tagName">{{ ds.tagName }}</span>
                    </div>
                  </el-option>
                </datablau-select>
              </el-form-item >
              <el-form-item label="schema" style="display: inline-block;">
                <datablau-select
                  filterable
                  clearable
                  class="select-panel"
                  v-model="schemaName"
                  placeholder="请选择schema"
                  style="width: 300px;"
                  key="startVersion"
                  :themeBlack="true"
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
            </div>
          </datablau-form>
        </div>
      </div>

      <div slot="footer">
        <datablau-button type="normal" :themeBlack="true" @click="bindModelDialog=false">
          取消
        </datablau-button>
        <datablau-button :themeBlack="true" type="important" @click="bindModelConfirm" :disabled="!selectionBindModel">
          {{ bindStep === 1 ? '下一步' : '确定' }}
        </datablau-button>
      </div>
    </datablau-dialog>
    <datablau-dialog
      title="权限管理"
      :visible.sync="modelPermissionVisible"
      :modal-append-to-body="true"
      size="xl"
      height="600px"
      :blackTheme="true"
    >
      <div style="position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        top: 20px;">
        <auth-manage
          :permissionModelId="permissionModelId"
          :sqlEdit="true"
        ></auth-manage>
      </div>

      <div slot="footer">
        <datablau-button :themeBlack="true" @click="modelPermissionVisible = false">
          关闭
        </datablau-button>
      </div>
    </datablau-dialog>
    <datablau-dialog
      title="文件历史版本"
      :visible.sync="versionHistoryModel"
      :modal-append-to-body="true"
      height="400px"
      :blackTheme="true"
    >
      <datablau-table
        @selection-change="handleSelectionChange"
        :data="versionHistoryList"
        row-key="id"
        :data-selectable="true"
        :auto-hide-selection="false"
        ref="historyTable"
        :themeBlack="true"
      >
        <el-table-column
          prop="versionName"
          label="版本名称"
          show-overflow-tooltip>
        </el-table-column>
        <el-table-column
          prop="comment"
          label="变更描述"
          show-overflow-tooltip>
        </el-table-column>
        <el-table-column
          prop="updater"
          label="变更人"
          show-overflow-tooltip>
        </el-table-column>
        <el-table-column
          prop="updateTime"
          label="变更时间"
          show-overflow-tooltip>
          <template slot-scope="scope">
            {{ moment(scope.row.updateTime).format('YYYY-MM-DD HH:mm:ss') }}
          </template>
        </el-table-column>
        <el-table-column
          prop="content"
          label="变更内容"
          width="280px">
          <template scope="{row}">
            <datablau-tooltip
              :content="row.content"
              placement="top"
              :disabled="row.content.length < 100"
              :maxHeight="true"
              effect="dark">
              <span>{{row.content.length > 100 ? row.content.substr(0,100) : row.content}}</span>
            </datablau-tooltip>
          </template>
        </el-table-column>
        <el-table-column
          prop="content"
          label="操作"
          width="90px"
          >
          <template scope="{row}">
            <datablau-button :themeBlack="true" type="normal" @click="viewDetail(row)">查看</datablau-button>
          </template>
        </el-table-column>
      </datablau-table>
      <div slot="footer">
        <span style="float: left" class="difference">* 选择其中两个版本，进行差异对比。</span>
        <datablau-button :themeBlack="true" type="important" @click="difference" :disabled="selectVersion.length<2">版本对比</datablau-button>
        <datablau-button :themeBlack="true" @click="versionHistoryModel=false">{{ $store.state.$v.report.close }}</datablau-button>
      </div>
    </datablau-dialog>
    <db-tree
      v-if="this.auth.isAdmin || this.auth['MODEL_VIEW'] || this.auth['MODEL_EDIT']"
      style="margin-top: -10px;"
      :data="treeData"
      node-key="id"
      ref="modelTree"
      class="model-tree-wrapper"
      :default-expanded-keys="expandKeys"
      :filter-node-method="filterNode"
      @node-click="nodeClick"
      @node-expand="nodeExpand"
      v-loading="treeLoading"
      :props="defaultProps"
      :data-supervise="true"
      :highlight-current="true"
      :data-icon-function="dataIconFunction"
      :right-info-formatter="treeRightInfoFormatter"
      :data-options-function="dataOptionsFunction"
      draggable
      :allow-drop="allowDrop"
      :themeBlack="true"
    ></db-tree>
  </div>
</template>

<script>
import string from '@/resource/utils/string'
import authManage from '@/views/list/manage/main.vue'
import dbTree from '@/views/modelLibrary/tree/DatablauTree.vue'
import modelLibrary from '@/views/modelLibrary/modelLibrary.vue'
import newModel from '@/views/common/newModel.vue'
import HTTP from '@/dataWarehouse/resource/http.js'
import { mapState } from 'vuex'
import moment from 'moment'
import WinMergePage from '@/dataWarehouse/components/winMerge/main.vue'
import databaseType from '@/components/common/DatabaseType.vue'

export default {
  name: 'model',
  props: {
    models: {
      type: Array,
      default: () => []
    },
    scriptList: {
      type: Array,
      default: () => []
    },
    currentKey: {
      type: Array,
      default: () => []
    }
  },
  watch: {
    currentKey (val) {
      this.$nextTick(() => {
        this.$refs.modelTree.setCurrentKey(val[0])
      })
    }
  },
  data () {
    return {
      moment,
      envType: '',
      leftType: '',
      selectVersion: [],
      modelLibraryKey: 0,
      projectId: +this.$route.query.projectId,
      treeData: [],
      defaultProps: {
        children: 'childList',
        label: 'name'
      },
      treeLoading: true,
      newDirModel: false,
      currentParentId: null,
      newDirName: '',
      currentItem: null,
      modifyDirName: '',
      modifyDirModel: false,
      bindModelDialog: false,
      bindStep: 1,
      selectionBindModel: null,
      bindModelPath: '',
      editModel: false,
      startVersion: '',
      endVersion: '',
      versionList: [],
      expandKeys: [],
      modelPermissionVisible: false,
      permissionModelId: null,
      versionHistoryModel: false,
      versionHistoryList: [],
      dataBaseId: '',
      dataSourceList: [],
      schemaList: [],
      schemaName: '',
      tagMap: [], // 标签列表
      filePath: '',
      filePathArr: []
    }
  },
  components: {
    dbTree,
    modelLibrary,
    authManage,
    newModel,
    WinMergePage,
    databaseType
  },
  mounted () {
    this.getTreeData()
    this.getTagMap()
    /* this.$nextTick(() => {
      setTimeout(() => {
        this.getCacheFile()
      }, 500)
    }) */
  },
  provide () {
    return {
      refresh: () => {
      }
    }
  },
  computed: {
    // selectionVersionList () {
    //   return this.versionList.map(item => {
    //     let isEnable = item.startVersion >=
    //     return item
    //   })
    // }
    ...mapState({
      auth: (state) => {
        return state.ddtStore.auth
      }
    })
  },
  methods: {
    getCacheFile () {
      HTTP.getCacheFile(this.projectId)
        .then(res => {
          let select = !!(res.codeDetailFiles && res.codeDetailFiles.length)
          // console.log(this.treeData, 'this.treeData')
          if (this.auth.isAdmin || this.auth['MODEL_VIEW'] || this.auth['MODEL_EDIT']) {
            res.modelFiles.forEach(item => {
              this.getModelId(this.treeData, item, select)
            })
          }
        })
        .catch(e => {})
    },
    getModelId (ary, id, select) {
      try {
        ary.forEach(item => {
          if (item.id === id) {
            !select && this.$refs.modelTree.setCurrentKey(item.id)
            // this.$parent.$refs.fileTree.setCurrentKey(null)
            this.expandKeys = [item.parentId]
            let path = item.parentFilePath.indexOf('/') !== -1 ? item.parentFilePath.split('/') : []
            path.length && path.splice(0, 1)
            item.filePath = path.join('/') + `${path.length ? '/' : ''}`
            this.$emit('openModelData', { data: item, noCache: 'noCache', select })
            throw new Error('end')
          }
          if (item.childList) {
            this.getModelId(item.childList, id, select)
          }
        })
      } catch (e) {

      }
    },
    // 查看DDL
    seeDDL (data) {
      HTTP.ddlView(data.id).then(res => {
        res.content = res.ddl || ''
        this.$emit('addScriptList', res)
      }).catch(e => {
        this.$showFailure(e)
      })
    },
    async showVersion (data) {
      this.versionHistoryModel = true
      this.versionHistoryList = []
      await HTTP.ddlView(data.id).then(res => {
        res.comment = ''
        res.content = res.ddl || ''
        res.updater = res.creator
        res.versionName = 'Latest'
        this.versionHistoryList.push(res)
      }).catch(e => {
        this.$showFailure(e)
      })
      this.$http.get(`${this.$dddUrl}/service/model/version/list?projectId=${this.projectId}&modelId=${data.modelId}`).then(res => {
        res.data.forEach(item => {
          item.content = item.ddl || ''
          item.versionName = item.version || ''
        })
        res.data && res.data.length && this.versionHistoryList.push(...res.data)
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    // 查看历史表格选择
    handleSelectionChange (row) {
      this.selectVersion = row
      if (row.length > 2) {
        this.$refs.historyTable.toggleRowSelection(row[0], false)
      }
    },
    // 对比差异
    difference () {
      this.envType = this.selectVersion[1].versionName === 'Latest' ? 'Latest' : this.selectVersion[1].version
      this.leftType = this.selectVersion[0].versionName === 'Latest' ? 'Latest' : this.selectVersion[0].version
      // versionName
      this.$refs.winMergePage.init(this.selectVersion[0].content, this.selectVersion[1].content)
    },
    viewDetail (row) {
      this.$emit('addScriptList', row)
      this.versionHistoryModel = false
    },
    modelPermission (data, node) {
      this.modelPermissionVisible = true
      this.permissionModelId = data.modelId
    },
    mullTip (val) {
      this.selectionBindModel = val
    },
    bindModelConfirm () {
      if (this.bindStep === 1) {
        this.selectionBindModel = this.selectionBindModel || this.$refs.modelLibrary?.multipleSelection
        this.bindStep = 2
        this.getVersions()
        this.bindModelPath = this.selectionBindModel.path
        return
      } else {
        if (!this.startVersion || !this.endVersion) {
          this.$datablauMessage.error('请选择版本')
          return
        }
      }
      let startVersion = this.versionList.find(item => item.startVersion === this.startVersion)
      let endVersion = this.versionList.find(item => item.startVersion === this.endVersion)
      let datasourceType = this.selectionBindModel.modelType || this.selectionBindModel.datasourceType
      let para = this.editModel ? {
        'id': this.selectionBindModel.bindid,
        'parentId': this.currentItem.id,
        'branch': this.selectionBindModel.branch === 'false' ? false : !!this.selectionBindModel.branch,
        'projectId': this.projectId,
        'name': this.selectionBindModel.modelName,
        'type': 1,
        'modelId': this.selectionBindModel.id,
        'categoryId': this.selectionBindModel.categoryId,
        'version': this.selectionBindModel.currentVersion,
        'path': this.bindModelPath,
        // 'creator': 'string',
        // 'comment': 'string',
        'startVersion': {
          'name': startVersion.name,
          'version': startVersion.id
        },
        'endVersion': {
          'name': endVersion.name,
          'version': endVersion.id
        },
        dataBaseId: this.dataBaseId,
        schemaName: this.schemaName,
        datasourceType
      }
        : {
          // 'createTime': '2023-03-16T09:54:43.436Z',
          // 'updateTime': '2023-03-16T09:54:43.436Z',
          // 'id': this.selectionBindModel.id,
          'parentId': this.currentItem.id,
          'branch': this.selectionBindModel.branch,
          'projectId': this.projectId,
          'name': this.selectionBindModel.modelName + `(${this.selectionBindModel.branch ? this.selectionBindModel.name : 'master'})`,
          'type': 1,
          'modelId': this.selectionBindModel.id,
          'categoryId': this.selectionBindModel.categoryId,
          'version': this.selectionBindModel.currentVersion,
          'path': this.bindModelPath,
          // 'creator': 'string',
          // 'comment': 'string',
          'startVersion': {
            'name': startVersion.name,
            'version': startVersion.id
          },
          'endVersion': {
            'name': endVersion.name,
            'version': endVersion.id
          },
          dataBaseId: this.dataBaseId,
          schemaName: this.schemaName,
          datasourceType
          // 'childList': [
          //   'string'
          // ]
        }

      let url = `${this.$dddUrl}/service/model/ref`
      let method = this.editModel ? 'put' : 'post'
      this.$http({
        url: url,
        method: method,
        data: para,
        headers: { 'Content-Type': 'application/json' }
      })
        .then(res => {
          this.bindModelDialog = false
          this.$datablauMessage.success('绑定成功')
          this.editModel && this.$emit('updateTabsData', para)
          // ddl脚本运行时使用选中的modelId
          if (para.dataBaseId) {
            this.$bus.$emit('dataSourceIdChange', para.dataBaseId)
            // 更新ddl脚本中熟悉的数据库
            // this.$store.commit('ddtStore/setCurrentFileType', { type: 0, id: res.data.id, hidRightMenu: false, dataBaseId: para.dataBaseId, schemaName: para.schemaName })
          }
          this.getTreeData()
        }).catch(err => {
          this.$showFailure(err)
        })
    },
    bindModel (data) {
      this.editModel = false
      this.selectionBindModel = null
      this.bindStep = 1
      this.currentItem = data
      this.dataBaseId = ''
      this.schemaName = ''
      this.schemaList = []
      this.bindModelDialog = true
      this.modelLibraryKey++
    },
    editModelDetail (data, node) {
      this.editModel = true
      this.bindStep = 1
      // this.selectionBindModel = data
      this.bindModelPath = data.path
      let selectionBindModel = _.cloneDeep(data)
      selectionBindModel.modelName = data.name
      selectionBindModel.id = data.modelId
      selectionBindModel.currentVersion = data.version
      selectionBindModel.bindid = data.id
      selectionBindModel.startVersion = data.startVersion
      selectionBindModel.endVersion = data.endVersion
      this.selectionBindModel = selectionBindModel
      this.schemaName = data.schemaName || ''
      this.dataBaseId = data.dataBaseId || ''
      this.bindModelConfirm()
      // this.bindStep = 2
      this.currentItem = node?.parent?.data || {}
      this.bindModelDialog = true
      this.getChemaList('refresh')
    },
    getVersions (newModel) {
      // this.startVersion = this.selectionBindModel?.startVersion || ''
      // this.endVersion = this.selectionBindModel?.endVersion || ''
      HTTP.getVersions({ modelId: this.selectionBindModel.id })
        .then(data => {
          data.forEach(item => {
            if (item.name === 'Latest Version') {
              item.startVersion = parseInt(item.startVersion) + 1
            }
          })
          this.versionList = data || []
          if (newModel) {
            this.endVersion = this.versionList[0].startVersion
            this.startVersion = this.versionList[this.versionList.length - 1].startVersion
            this.bindStep = ''
            this.bindModelConfirm()
          }
          if (this.selectionBindModel) {
            let s = this.selectionBindModel?.startVersion?.version
            let e = this.selectionBindModel?.endVersion?.version
            this.startVersion = this.versionList.find(item => item.id === Number(s))?.startVersion
            this.endVersion = this.versionList.find(item => item.id === Number(e))?.startVersion
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    changeSelectVersion () {
    },
    getChemaList (val) {
      if (!this.dataBaseId) {
        this.schemaName = ''
        this.schemaList = []
        return
      }
      this.$http.get(`${this.$dddUrl}/datatype/${this.dataBaseId}/raw-schemas?search=`).then(res => {
        this.schemaList = res.data
        !val && (this.schemaName = '')
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    httpDeleteFile (data) {
      this.$http({
        url: this.$dddUrl + '/service/model/ref',
        method: 'delete',
        data: {
          id: data.id,
          projectId: this.projectId,
          name: data.name,
          type: data.type,
          parentId: data.parentId
        }
      }).then(res => {
        this.$datablauMessage.success('删除成功!')
        this.getTreeData()
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    deleteFile (data) {
      let ary = [...this.scriptList, ...this.models]
      let tabList = ary.filter(item => item.id === data.id)
      this.$DatablauCofirm(tabList.length ? '模型已打开，确定删除？' : '确定删除该模型引用？').then(() => {
        this.httpDeleteFile(data)
        tabList.length && this.$emit('delModel', tabList)
      }).catch(() => {

      })
    },
    deleteDir (data) {
      let ary = [...this.scriptList, ...this.models]
      let idList = (data.childList && data.childList.map(item => item.id)) || []
      let tabList = ary.filter(item => idList.indexOf(item.id) !== -1)
      this.$DatablauCofirm(data.childList ? '确定删除该文件夹？该文件夹下所有模型引用都会被删除！' : '确定删除该文件夹？').then(() => {
        this.$http({
          url: this.$dddUrl + '/service/model/folder/' + data.id,
          method: 'delete'
        }).then(res => {
          this.$datablauMessage.success('删除成功!')
          this.getTreeData()
          tabList.length && this.$emit('delModel', tabList)
        }).catch(err => {
          this.$showFailure(err)
        })
      }).catch(() => {

      })
    },
    modifyDirNameFunc () {
      const reg = /[#/\\@$%<>]/gi
      if (reg.test(this.modifyDirName)) {
        this.$datablauMessage.error(`名称不允许包含#/\\@$%<>等特殊字符`)
        return
      }
      this.$http.put(this.$dddUrl + '/service/model/folder', {
        id: this.currentParentId,
        name: this.modifyDirName,
        parentId: this.currentItem.parentId,
        projectId: this.projectId,
        type: this.currentItem.type
      }).then(res => {
        this.$datablauMessage.success('修改成功!')
        this.modifyDirName = ''
        this.modifyDirModel = false
        this.getTreeData()
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    addNewDir () {
      if (!this.newDirName) {
        this.$datablauMessage.error('请输入文件夹名')
      } else {
        const reg = /[#/\\@$%<>]/gi
        if (reg.test(this.newDirName)) {
          this.$datablauMessage.error(`名称不允许包含#/\\@$%<>等特殊字符`)
          return
        }
        this.$http.post(this.$dddUrl + '/service/model/folder', {
          projectId: this.projectId,
          parentId: this.currentParentId,
          type: 0,
          name: this.newDirName
        }).then(res => {
          this.$datablauMessage.success('文件夹创建成功！')
          this.getTreeData()
          this.newDirName = ''
          this.newDirModel = false
        }).catch(err => {
          this.$showFailure(err)
        })
      }
    },
    getTreeData () {
      this.$http.get(`${this.$dddUrl}/service/model/tree/${this.projectId}`).then(res => {
        if (!this.auth.isAdmin && !this.auth['MODEL_EDIT']) {
          this.treeData = []
        }
        this.treeData = [res.data]
        this.expandKeys = [this.currentParentId || res.data.id]
        this.getCacheFile()
        this.$emit('getTreeData', this.treeData)
      }).catch(err => {
        this.$showFailure(err)
      }).finally(() => {
        this.treeLoading = false
      })
    },
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
                tagList.push(this.tagMap[v - 0].name)
              }
            })
            item.tagName = tagList.join(',')
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    filterNode (value, data) {
      if (!value) {
        return true
      } else {
        return string.matchKeyword(data, value, 'name')
      }
    },
    dataIconFunction (data, node) {
      if (data.type === 0) { // 文件夹
        if (data.parentId === 0) {
          return 'iconfont icon-modelfile'
        } else {
          return 'iconfont icon-openfile'
        }
      } else if (data.type === 1) { // 文件
        return 'tree-icon model1'
      } else {
        return ''
      }
    },
    nodeExpand (data, node, el) {
      this.$emit('nodeExpand', { ele: el.$refs.node })
    },
    nodeClick (data, node) {
      this.filePath = ''
      this.filePathArr = []
      this.getFilePath(node)
      let stateAry = this.$store.state.ddtStore.openTableData
      if (stateAry.indexOf(data.id) !== -1) {
        this.bottomDomDis = true
      } else {
        this.bottomDomDis = false
      }
      this.$emit('clearTreeActive', 'model')
      if (data.type === 1) { // 模型
        data.filePath = this.filePath
        this.$emit('openModelData', { data })
        this.$store.commit('ddtStore/setCurrentFileType', {
          type: 0,
          id: null,
          hidRightMenu: true
        })
      }
      // if (data.type === 1) { // 模型
      //   const pos = location.href.indexOf('#/')
      //   const baseUrl = location.href.slice(0, pos + 2)
      //   window.open(`${baseUrl}main/modelLibrary?id=${data.modelId}&pId=${data.categoryId}&currentVersion=${data.version}`)
      // }
    },
    getFilePath (node) {
      if (node.parent.level > 1) {
        // this.filePath += node.parent.data.name + '/'
        this.filePathArr.push(node.parent.data.name)
        this.filePath = this.filePathArr.reverse().join('/') + '/'
        this.getFilePath(node.parent)
      }
    },
    treeRightInfoFormatter (node, data) {
      if (data.changed) {
        return `<span style="color: rgb(218,140,87)">M</span>`
      } else {
        return ''
      }
    },
    setNewModel () {
      this.currentParentId = this.treeData[0]?.id
      this.currentItem = this.treeData[0]
      this.$refs.newModelRef.openCreateModelDialog()
    },
    async newModelDetail (res) {
      HTTP.getModelsList({
        successCallback: async data => {
          let newModel = data.find(item => item.id === res.id)
          this.selectionBindModel = _.cloneDeep(newModel)
          this.selectionBindModel.modelName = res.name
          this.schemaName = res.schemaName || ''
          this.dataBaseId = res.dataBaseId || ''
          this.bindModelPath = res.path
          await this.getVersions('newModel')
        }
      })
    },
    allowDrop (draggingNode) {
      this.$emit('allowDropModel', { draggingNode })
    },
    dataOptionsFunction (data, node) {
      const isAdmin = this.$store.state.user.isAdmin
      this.currentParentId = data.parentId
      let result = []
      if (!isAdmin && !this.auth['MODEL_EDIT']) {
        return result
      }
      if (data.type === 0) { // 文件夹
        result.push({
          label: '新建',
          callback: () => {
            this.currentParentId = data.id
            this.newDirModel = true
          }
        })

        result.push({
          label: '重命名',
          callback: () => {
            this.currentParentId = data.id
            this.currentItem = data
            this.modifyDirName = data.name
            this.modifyDirModel = true
          }
        })
        // result.push({
        //   label: '移动目录',
        //   callback: () => {
        //     this.moveDir(data)
        //   }
        // })
        if (data.parentId !== 0) {
          result.push({
            label: '删除',
            callback: () => {
              this.deleteDir(data)
            }
          })
        }
        result.push({
          label: '引入模型',
          callback: () => {
            this.currentParentId = data.id
            this.editModel = false
            this.bindModel(data)
          }
        })
        result.push({
          label: '新建模型',
          callback: () => {
            this.currentParentId = data.id
            this.currentItem = data
            this.editModel = false
            this.$refs.newModelRef.openCreateModelDialog()
          }
        })
      } else if (data.type === 1) { // 文件
        // result.push({
        //   label: '查看模型',
        //   callback: () => {
        //     this.nodeClick(data)
        //   }
        // })
        result.push({
          label: '查看DDL脚本',
          callback: () => {
            this.seeDDL(data)
          }
        })
        result.push({
          label: '查看历史版本',
          callback: () => {
            this.showVersion(data)
          }
        })
        result.push({
          line: 'solid'
        })
        result.push({
          label: '生成DDL脚本',
          callback: () => {
            this.$emit('showDdlScript', data)
          }
        })
        result.push({
          label: 'DDL生成配置',
          callback: () => {
            this.$emit('showDdlConfiguration', data)
          }
        })
        result.push({
          line: 'solid'
        })
        result.push({
          label: '模型权限管理',
          callback: () => {
            this.modelPermission(data, node)
          }
        })
        result.push({
          label: '属性',
          callback: () => {
            this.editModelDetail(data, node)
          }
        })
        result.push({
          line: 'solid'
        })
        // result.push({
        //   label: '移动文件',
        //   callback: () => {
        //     this.moveDir(data)
        //   }
        // })

        result.push({
          label: '删除',
          callback: () => {
            this.deleteFile(data)
          }
        })
      }
      return result
    }
  }
}
</script>

<style lang="scss" scoped>
  .el-select-dropdown__item.is-disabled {
    color: #888;
  }
  /deep/.el-input__inner{
    border: 1px solid #666;

  }
  /deep/ .el-input__inner:hover{
    border: 1px solid #888;
  }
  .difference{
    color: #bbb;
    line-height: 32px;
  }
  /deep/.el-input__inner::placeholder{
    color: #bbb;
  }
  .bind-step-2-container{
    position: absolute;
    left: 8px;
    right: 8px;
    top: 8px;
    bottom: 0;
  }
  .bindModelPath{
    width: 100%;
    height: 40px;
    background: #333333;
    border-radius: 2px;
    display: flex;
    align-items: center;
    margin-bottom: 4px;
    p{
      color: #BBBBBB;
      font-size: 14px;
      padding: 0 16px;
    }
  }
  #model-library /deep/ {
    .tree-area.blackTheme {
      background: #222;
    }
    .content-area {
      background: #222;
    }
  }
</style>
<style lang="scss">
.model-tree-wrapper{
  .grey-tree.datablau-tree .iconfont{
    color: #888888;
  }
  .grey-tree.datablau-tree .el-tree-node.is-current > .el-tree-node__content{
    background-color: #409eff1a ;
    border-left: 2px solid #409EFF ;
    color: #409fff;
  }
  .grey-tree .el-tree-node__content{
    border-left: 2px solid transparent;
  }
}
.el-message-box__title{
  color: #bbb;
}
</style>
