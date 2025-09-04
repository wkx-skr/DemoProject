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
              clearable
              maxlength="100"
              v-model="editModelData.name"
              size="mini"
              placeholder="请输入名称"
            ></el-input>
          </el-form-item>
          <el-form-item label="描述：" prop="description">
            <el-input
              clearable
              maxlength="100"
              v-model="editModelData.description"
              size="mini"
              placeholder="请输入描述"
            ></el-input>
          </el-form-item>
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
      title="表单详情"
      :visible.sync="showFormDetail"
      :append-to-body="true"
      width="600px"
      class="edit-form-dia"
      :close-on-click-modal="false"
    >
      <form-detail
        :currentFormId="currentFormId"
        @updateFormList="updateFormList"
      ></form-detail>
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
        <el-button
          type="danger"
          size="small"
          class="delete-btn"
          @click="deleteBatch"
          :disabled="!couldDeleteBatch"
        >
          删 除
        </el-button>
      </div>
    </datablau-tab-with-eltable>
  </div>
</template>

<script>
import HTTP from '@/resource/http.js'
import formDetail from './formDetail.vue'
export default {
  data () {
    return {
      processConfig: null,
      allWorkflowTypes: [],

      // edit form
      showFormDetail: false,
      currentFormId: '',

      // *** tab with table ***
      getAllForm: null,
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
        name: '',
        id: '',
        key: '',
        description: ''
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
      workflowUrl: null,
      formDelete: ['columnDefs', 'allWorkflowTypes', 'selection']
    }
  },
  components: {
    formDetail
  },
  beforeMount () {
    setTimeout(() => {
      HTTP.getFormItemDataType()
        .then(res => {
          const data = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    }, 500)
    const formatterTime = data => {
      const t = this.$timeFormatter(data.value)
      return t
    }
    const columnDefs = [
      {
        type: ['selectionCheckboxColumn']
      },
      {
        headerName: '名称',
        field: 'formName',
        tooltipField: 'formName'
      },
      {
        headerName: '类型',
        field: 'formType',
        tooltipField: 'formType'
      },
      {
        headerName: '描述',
        field: 'description',
        tooltipField: 'description'
      },
      {
        headerName: '操作',
        width: 100,
        type: ['optionsWithContent'],
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
    setTimeout(() => {
      HTTP.getAllWorkflowTypes()
        .then(res => {
          this.allWorkflowTypes = res.data || []
        })
        .catch(e => {
          this.$showFailure(e)
        })
    }, 500)
    // this.getFormItemDataType()
    // this.getAllWorkflowTypes()
  },
  beforeDestroy () {
  },
  methods: {
    getButtonList () {
      const arr = []
      arr.push({ name: 'check', text: '编辑', method: 'checkModel' })
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
        this.getAllForm
          .then(res => {
            const data = res.data.value || []
            this.totalShow = res.data.total
            resolve(data)
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
    changeKeyWord (val) {
      this.keywordData = val
    },
    setGetAllData (para) {
      const requestBody = {
        pageSize: para.pageSize,
        currentPage: para.currentPage,
        name: this.keywordData
      }
      this.getAllForm = HTTP.getWorkflowForm(requestBody)
    },
    gridSelectionChanged (para) {
      const api = para.api
      const arr = api.getSelectedNodes()
      const result = []
      arr.forEach(item => {
        result.push(item.data)
      })
      this.selection = result
    },

    // *** edit dialog ***
    showAddDialog () {
      this.isAddModel = true
      this.editModelData = {
        id: '',
        name: '',
        proDefName: '',
        description: ''
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
        })
        .catch(e => {
          this.$showFailure(e.message)
        })
    },
    unbindProcess ({ data, api, e }) {
      HTTP.unbindProcess({ processId: data.processId })
        .then(res => {
          this.$message.success('解绑成功')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    deleteModel ({ data, api, e }) {
      this.$confirm('删除后不可恢复，确认删除？', '提示', {
        type: 'warning'
      })
        .then(() => {
          const id = data.id
          const para = { id }
          const callback = () => {
            this.$message.success('删除成功')
            const url = `${this.$url}/service/oplog/createLog`
            const body = {
              module: 'FLOW_FORMS',
              table: '',
              operation: 'TABLE_DELETE',
              description: '删除表单中心' + data.id
            }

            this.$http.post(url, body).then(res => {
              this.refreshTable()
            })
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
          formName: this.editModelData.name,
          formType: this.editModelData.proDefName,
          description: this.editModelData.description
        }
        HTTP.saveWorkflowForm({ requestBody: obj })
          .then(res => {
            this.$message.success(sucMsg)
            this.dialogVisible = false
            const url = `${this.$url}/service/oplog/createLog`
            let body = {}
            if (this.isAddModel) {
              body = {
                module: 'FLOW_FORMS',
                table: '',
                operation: 'TABLE_ADD',
                description: '新增表单中心' + obj.name
              }
            } else {
              body = {
                module: 'FLOW_FORMS',
                table: '',
                operation: 'TABLE_MODIFY',
                description: '编辑表单中心' + obj.name
              }
            }
            this.refreshTable()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        this.$showFailure('内容不能为空')
      }
    },
    updateFormList () {
      this.showFormDetail = false
      this.refreshTable()
    },
    refreshTable () {
      if (this.$refs.modelsTable && this.$refs.modelsTable.refreshData) {
        this.$refs.modelsTable.refreshData()
      }
    },
    deleteItem (para, callback) {
      const id = para.id
      HTTP.deleteForm({ formId: id })
        .then(res => {
          this.$message.success('删除成功')
          this.refreshTable()
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
      this.showFormDetail = true
      this.currentFormId = data.id
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
      // let callback = () => {
      //   this.$message.success('删除成功');
      //   this.refreshTable();
      // };
      // let para = {
      //   fun: this.deleteItemAsync,
      //   paraArr: arr,
      //   callback
      // };
      this.$confirm('删除后不可恢复，确认删除？', '提示', {
        type: 'warning'
      })
        .then(() => {
          // this.seriesFunCallback(para);
          const callback = () => {
            this.$message.success('删除成功')
            this.refreshTable()
          }

          arr.forEach((item, index) => {
            if (index === arr.length - 1) {
              this.deleteItem(item)
            } else {
              this.deleteItem(item, callback)
            }
          })
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
      if (this.$refs.modelsTable && this.$refs.modelsTable.resetTableStyle) {
        this.$refs.modelsTable.resetTableStyle()
      }
    }
  },
  watch: {}
}
</script>

<style lang="scss" scoped>
/deep/ .tab-with-table .tab-bottom-line .pagination-container {
    left: 100px;
}
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
