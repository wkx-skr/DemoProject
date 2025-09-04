<template>
  <div class="process-model-tab">
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      :append-to-body="true"
      width="600px"
      class="edit-models-dia"
      :close-on-click-modal="false"
    >
      <div class="models-dialog-body">
        <el-form
          ref="editModel"
          label-position="right"
          label-width="110px"
          size="small"
          :model="editModelData"
          :rules="editRules"
        >
          <el-form-item label="类型：" prop="proDefName">
            <el-select
              v-model="editModelData.proDefName"
              placeholder="请选择类型"
              filterable
            >
              <el-option
                v-for="item in allWorkflowTypes"
                :label="item"
                :value="item"
                :key="item"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="名称：" prop="name">
            <el-input
              maxlength="100"
              v-model="editModelData.name"
              size="mini"
              clearable
              placeholder="请输入名称"
            ></el-input>
          </el-form-item>
          <!--        <el-form-item prop="complex">-->
          <!--          <el-checkbox name="complex" v-model="editModelData.complex" label="复杂模型"></el-checkbox>-->
          <!--        </el-form-item>-->
        </el-form>
      </div>
      <div slot="footer" class="models-dialog-footer">
        <el-button
          type="primary"
          size="small"
          @click="saveEditObj"
          class=""
          :disabled="disabledSave"
        >
          确 定
        </el-button>
        <el-button @click="dialogVisible = false" size="small">取消</el-button>
      </div>
    </el-dialog>
    <el-dialog
      title="选择表单"
      :visible.sync="showFormBindDialog"
      :append-to-body="true"
      width="600px"
      class="edit-models-dia"
      :close-on-click-modal="false"
    >
      <div class="models-dialog-body">
        <el-form
          ref="editModel"
          label-position="right"
          label-width="110px"
          size="small"
        >
          <el-form-item label="类型：" prop="proDefName">
            <el-select v-model="bindFormId" placeholder="请选择类型" filterable>
              <el-option
                v-for="item in allFormList"
                :label="item.formName"
                :value="item.id"
                :key="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="models-dialog-footer">
        <el-button
          type="primary"
          size="small"
          @click="handleBindForm"
          class=""
          :disabled="!bindFormId"
        >
          确 定
        </el-button>
        <el-button @click="showFormBindDialog = false" size="small">
          取消
        </el-button>
      </div>
    </el-dialog>
    <datablau-tab-with-eltable
      class="table-tab-container"
      ref="modelsTable"
      :totalShow="totalShow"
      :columnDefs="columnDefs"
      :getShowData="getShowData"
      :hideTopLine="hideTopLine"
      :hideBottomLine="hideTopLine"
      :tableOption="tableOption"
      :tableHidePagination="tableHidePagination"
      :defaultParaData="defaultParaData"
      @gridSelectionChanged="gridSelectionChanged"
      @changeKeyWord="changeKeyWord"
    >
      <div class="right-btn-container" slot="header">
        <el-button type="primary" size="mini" @click="showAddDialog">
          添 加
        </el-button>
        <el-button size="mini" @click="refreshTable">刷 新</el-button>
      </div>
      <div class="bottom-btn-container" slot="footer">
        <!-- <el-button
          type="danger"
          size="small"
          class="delete-btn"
          @click="deleteBatch"
          :disabled="!couldDeleteBatch"
        >删 除</el-button> -->
      </div>
    </datablau-tab-with-eltable>
    <div class="design-process-container" v-if="showDesignContainer">
      <process-design
        :currentProcessId="currentProcessId"
        :currentProcessData="currentProcessData"
        @saveProcess="saveProcess"
        @closeDesign="closeDesign"
      ></process-design>
    </div>
  </div>
</template>

<script>
import HTTP from '@/resource/http.js'
import processDesign from './processDesign/processDesign.vue'
export default {
  data () {
    return {
      processConfig: null,
      allWorkflowTypes: [],

      // *** tab with table ***
      getAllProcess: null,
      totalShow: 0,
      columnDefs: [],
      hideTopLine: false,
      keywordData: '',
      tableOption: {
        rowSelection: 'single'
      },
      tableHidePagination: false,
      defaultParaData: {
        currentPage: 1,
        pageSize: 20
      },
      selection: [],
      modelMap: {},

      // *** edit dialog ***
      dialogVisible: false,
      editModelData: {
        id: '',
        name: '',
        proDefName: '',
        simple: false,
        complex: true
      },
      dialogTitle: '创建流程',
      isAddModel: false,
      editRules: {
        name: {
          required: true,
          trigger: 'blur',
          message: '请输入名称'
        },
        proDefName: {
          required: true,
          trigger: 'blur',
          message: '请选择类型'
        }
      },
      showDesignContainer: false,
      showFormBindDialog: false,
      allFormList: [],
      currentProcessId: '',
      currentProcessData: null,
      bindFormId: ''
    }
  },
  components: {
    processDesign
  },
  beforeMount () {
    const formatterTime = data => {
      const t = this.$timeFormatter(data.value)
      return t
    }
    const formaterStyle = data => {
      const t = data.value ? '简单' : '复杂'
      return t
    }
    const columnDefs = [
      // {
      //   type: ['selectionCheckboxColumn'],
      // },
      {
        headerName: '名称',
        field: 'name',
        tooltipField: 'name'
        // type: ['customSortCol'],
      },
      {
        headerName: '类型',
        field: 'proDefName',
        tooltipField: 'proDefName',
        suppressSizeToFit: true
        // type: ['customSortCol'],
      },
      // {
      //   headerName: '编辑类型',
      //   field: 'simple',
      //   tooltipField: 'simple',
      //   valueFormatter: formaterStyle,
      //   tooltipValueGetter: formaterStyle,
      //   width: 150,
      //    suppressSizeToFit: true,
      //   // type: ['customSortCol'],
      // },
      {
        headerName: '绑定的表单',
        field: 'formName',
        tooltipField: 'formName'
        // type: ['customSortCol'],
      },
      {
        headerName: '创建时间',
        field: 'createTime',
        // tooltipField: 'createTime',
        valueFormatter: formatterTime,
        tooltipValueGetter: formatterTime
        // type: ['customSortCol'],
      },
      // {
      //   headerName: '修改时间',
      //   field: 'lastUpdateTime',
      //   // tooltipField: 'lastUpdateTime',
      //   valueFormatter: formatterTime,
      //   tooltipValueGetter: formatterTime,
      //   width: 150,
      //   // type: ['customSortCol'],
      // },
      {
        headerName: '操作',
        type: ['optionsWithContent'],
        width: 280,
        cellRendererParams: {
          tabComponent: this,
          options: this.getButtonList()
        }
      }
    ]
    this.columnDefs = columnDefs

    this.processConfig = this.$workflowConfig
  },
  computed: {
    disabledSave () {
      let bool = true
      // bool = !!(this.editModelData && this.editModelData.name);
      if (this.editModelData) {
        if (this.editModelData.name) {
          bool = false
        }
      }
      // bool = false;
      return bool
    },
    couldDeleteBatch () {
      const arr = this.selection
      return arr && Array.isArray(arr) && arr.length > 0
    }
  },
  mounted () {
    HTTP.getAllWorkflowTypes()
      .then(res => {
        this.allWorkflowTypes = res.data || []
      })
      .catch(e => {
        this.$showFailure(e)
      })
  },
  methods: {
    getButtonList () {
      const arr = []
      arr.push({ name: 'check', text: '编辑', method: 'checkModel' })
      arr.push({
        name: 'deploy',
        text: '部署',
        method: 'deployModel',
        ifBtnDisabled: this.disableDeploy
      })
      // arr.push({name: 'bind', text: '绑定', method: 'bindProcess', ifBtnDisabled: this.disableBind})
      // arr.push({name: 'unbind', text: '解绑', method: 'unbindProcess', ifBtnDisabled: this.disableUnbind})
      // arr.push({name: 'bindForm', text: '绑定表单', method: 'bindForm'})
      arr.push({ name: 'remove', text: '删除', method: 'deleteModel' })
      return arr
    },

    // *** tab with table ***
    getShowData (para) {
      return new Promise((resolve, reject) => {
        if (!this.getAllData) {
          this.setGetAllData(para)
        }
        const currentPage = para.currentPage
        const pageSize = para.pageSize
        const keyword = para.keyword || ''
        this.getAllProcess
          .then(res => {
            const map = {}
            const data = res.data
            let value = data.value
            // value.sort((a, b) => {
            //   return a.proDefName[0] - b.proDefName[0]
            // })
            this.$utils.sort.sortConsiderChineseNumber(value, 'proDefName')
            this.totalShow = data.total
            if (value && Array.isArray(value)) {
              value.forEach(item => {
                const obj = _.cloneDeep(item)
                item.originData = obj
                map[item.id] = item
                item.createTime = moment(item.createTime).valueOf()
                item.lastUpdateTime = moment(item.lastUpdateTime).valueOf()
                if (item.metaInfo) {
                  item.description = item.metaInfo.description
                  item.revision = item.metaInfo.revision
                }
              })
            } else {
              value = []
            }
            this.modelMap = map
            resolve(data.value)
          })
          .catch(e => {
            console.error(e)
            this.$showFailure(e)
          })
      })
    },
    changeKeyWord (val) {
      this.keywordData = val
    },
    isIE () {
      // 获取当前浏览器相关信息
      var explorer = window.navigator.userAgent.toLowerCase()
      // 判断是否是ie浏览器
      if (
        explorer.indexOf('msie') >= 0 ||
        explorer.indexOf('rv:11.0) like gecko') >= 0
      ) {
        return true
      } else {
        return false
      }
    },
    setGetAllData (para) {
      var params = null
      if (this.isIE()) {
        params = encodeURI(this.keywordData)
      } else {
        params = this.keywordData
      }
      const requestBody = {
        type: 'simple',
        pageSize: para.pageSize,
        currentPage: para.currentPage,
        name: params
      }
      this.getAllProcess = HTTP.getWorkflowProcesses(requestBody)
    },
    gridSelectionChanged (para, keyword) {
      const api = para.api
      const arr = api.getSelectedNodes()
      const result = []
      arr.forEach(item => {
        result.push(item.data)
      })
      this.selection = result
      //
    },

    // *** edit dialog ***
    showAddDialog () {
      this.isAddModel = true
      this.editModelData = {
        id: '',
        name: '',
        proDefName: '',
        simple: false,
        complex: true
      }
      this.dialogVisible = true
    },
    showEditDialog ({ data, api, e }) {
      this.isAddModel = false
      let metaInfo = data.metaInfo
      if (this.$utils.isJSON(metaInfo)) {
        metaInfo = JSON.parse(metaInfo)
      } else {
        metaInfo = {}
      }
      this.editModelData = {
        name: data.name,
        key: data.key,
        description: metaInfo.description || '',
        id: data.id
      }
      this.dialogVisible = true
    },
    disableDeploy (data) {
      return false
    },
    disableBind (data) {
      let bool = false
      if (!data.proDefId || data.bindId) {
        bool = true
      }
      return bool
    },
    disableUnbind (data) {
      let bool = false
      if (!data.bindId) {
        bool = true
      }
      return bool
    },
    bindProcess ({ data, api, e }) {
      const requestBody = {
        processId: data.id,
        itemType: data.proDefName
      }
      HTTP.bindProcess({ requestBody })
        .then(res => {
          this.$message.success('绑定成功')
          this.refreshTable()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    unbindProcess ({ data, api, e }) {
      HTTP.unbindProcess({ bindId: data.bindId })
        .then(res => {
          this.$message.success('解绑成功')
          this.refreshTable()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    isIE () {
      // 获取当前浏览器相关信息
      var explorer = window.navigator.userAgent.toLowerCase()
      // 判断是否是ie浏览器
      if (
        explorer.indexOf('msie') >= 0 ||
        explorer.indexOf('rv:11.0) like gecko') >= 0
      ) {
        return true
      } else {
        return false
      }
    },
    bindForm ({ data, api, e }) {
      var params = null
      this.showFormBindDialog = true
      this.currentProcessId = data.id
      this.bindFormId = data.formId || ''
      if (this.isIE()) {
        params = encodeURI(data.proDefName)
      } else {
        params = data.proDefName
      }
      HTTP.getWorkflowForm({ processType: params })
        .then(res => {
          this.allFormList = res.data.value || []
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleBindForm () {
      const formId = this.bindFormId
      const processId = this.currentProcessId
      HTTP.bindForm({ formId: formId, processId: processId })
        .then(res => {
          this.refreshTable()
          this.showFormBindDialog = false
          this.$message.success('绑定成功')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    deleteModel ({ data, api, e }) {
      this.$confirm('删除后不可恢复，确认删除？', '提示', {
        type: 'warning',
        closeOnClickModal: false
      })
        .then(() => {
          const para = { processId: data.id }
          const callback = () => {
            this.$message.success('删除成功')
            this.refreshTable()
            // const url = `${this.$url}/service/oplog/createLog`
            // const body = {
            //   module: 'FLOW_FLOWS',
            //   table: '',
            //   operation: 'TABLE_DELETE',
            //   description: '删除流程中心' + data.id
            // }

            // this.$http.post(url, body).then(res => {
            // })
          }
          this.deleteItem(para, callback)
        })
        .catch(e => {
          console.info(e)
        })
    },
    saveEditObj () {
      if (this.editModelData && this.editModelData.name) {
        const sucMsg = this.isAddModel ? '添加成功' : '修改成功'
        const obj = {
          id: this.editModelData.id,
          name: this.editModelData.name,
          proDefName: this.editModelData.proDefName,
          simple: !this.editModelData.complex
        }
        HTTP.updateProcess({ requestBody: obj })
          .then(res => {
            this.$message.success(sucMsg)
            this.dialogVisible = false
            const url = `${this.$url}/service/oplog/createLog`
            let body = {}
            this.refreshTable()
            // if (this.isAddModel) {
            //   body = {
            //     module: 'FLOW_FLOWS',
            //     table: '',
            //     operation: 'TABLE_ADD',
            //     description: '新增流程中心' + obj.name
            //   }
            // } else {
            //   body = {
            //     module: 'FLOW_FLOWS',
            //     table: '',
            //     operation: 'TABLE_MODIFY',
            //     description: '编辑流程中心' + obj.name
            //   }
            // }
            // this.$http.post(url, body).then(res => {
            //   this.refreshTable()
            // })
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        this.$showFailure('内容不能为空')
      }
    },
    refreshTable () {
      if (this.$refs.modelsTable && this.$refs.modelsTable.refreshData) {
        this.$refs.modelsTable.refreshData()
      }
    },
    deleteItem (para, callback) {
      HTTP.deleteProcess(para)
        .then(res => {
          callback && callback()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },

    deployModel ({ data, api, e }) {
      const id = data.id
      if (!id) return
      HTTP.deployProcess({ processId: id })
        .then(res => {
          this.$message.success('部署成功')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    checkModel ({ data, api, e }) {
      HTTP.openProcessEditor(data)
      // if (!data.simple) {
      //   let url;
      //   if (this.processConfig && this.processConfig.ip) {
      //     url = `${this.processConfig.ip}${this.processConfig.path}modeler.html?modelId=${data.proModelId}`;
      //     window.open(url);
      //   } else {
      //     this.$message.info('暂无地址');
      //   }
      // } else {
      //   this.currentProcessId = data.id
      //   this.currentProcessData = data
      //   this.showDesignContainer = true
      // }
    },
    saveProcess (config) {
      const para = {}
      // HTTP.saveProcess(para)
    },
    closeDesign () {
      this.showDesignContainer = false
    },

    // async delete  models item
    async deleteItemAsync (para, callback) {
      const id = para.id
      const url = `${this.$url}/service/workflow/model/?id=${id}`

      await this.$http.delete(url)
      callback && callback()
    },

    deleteBatch () {
      const arr = this.selection.map(item => {
        const obj = {
          id: item.id
        }
        return obj
      })
      // let arr = this.selection.map(item => {id:item.id});
      const callback = () => {
        this.$message.success('删除成功')
        this.refreshTable()
      }
      const para = {
        fun: this.deleteItemAsync,
        paraArr: arr,
        callback
      }
      this.$confirm('删除后不可恢复，确认删除？', '提示', {
        type: 'warning',
        closeOnClickModal: false
      })
        .then(() => {
          this.seriesFunCallback(para)
        })
        .catch(e => console.info(e))
    },
    seriesFunCallback ({ fun, paraArr, callback }) {
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
    tableLayout () {
      if (this.$refs.modelsTable && this.$refs.modelsTable.resetTableStyle) {
        this.$refs.modelsTable.resetTableStyle()
      }
    }
  },
  watch: {}
}
</script>

<style lang="scss">
.process-model-tab {
  // border: 1px solid red;
  // position: relative;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background-color: var(--default-bgc);

  .delete-btn {
    margin-left: 20px;
  }
  .design-process-container {
    border: 1px solid red;
    position: fixed;
    z-index: 100;
    top: 50px;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #fff;
  }
}
</style>

<style lang="scss">
.edit-models-dia {
  .models-dialog-body {
    .el-textarea,
    .el-input {
      max-width: 400px;
    }
  }
}
</style>
