<template>
  <div class="process-model-tab">
    <datablau-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      append-to-body
      class="edit-models-dia"
      size="m"
      :close-on-click-modal="false"
    >
      <div class="models-dialog-body" v-if="dialogVisible">
        <datablau-form
          ref="editModel"
          label-position="right"
          label-width="50px"
          :model="editModelData"
          :rules="editRules"
        >
          <el-form-item :label="$t('meta.process.type')" prop="proDefName">
            <datablau-select
              v-model="editModelData.proDefName"
              :placeholder="$t('meta.process.selType')"
              filterable
              style="width: 100%"
            >
              <el-option
                v-for="item in allWorkflowTypes"
                :label="item"
                :value="item"
                :key="item"
              ></el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item :label="$t('meta.process.name')" prop="name">
            <datablau-input
              show-word-limit
              maxlength="100"
              v-model="editModelData.name"
              :placeholder="$t('meta.process.fillName')"
              style="width: 100%"
              class="maxlengthInput edit-form-limit-input"
            ></datablau-input>
          </el-form-item>
          <el-form-item :label="$t('meta.process.desc')" prop="description">
            <datablau-input
              type="textarea"
              clearable
              show-word-limit
              maxlength="100"
              v-model="editModelData.description"
              :placeholder="$t('meta.process.fillDesc')"
              style="width: 100%"
              class="form-center-textarea"
              :autosize="{ minRows: 3, maxRows: 6 }"
            ></datablau-input>
          </el-form-item>
        </datablau-form>
      </div>

      <div slot="footer" class="models-dialog-footer">
        <datablau-button
          type="secondary"
          @click="dialogVisible = false"
          size="small"
        >
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button
          type="important"
          size="small"
          @click="saveEditObj"
          class=""
          style="width: 77px"
          :disabled="disabledSave"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
      </div>
    </datablau-dialog>

    <datablau-dialog
      :title="$t('meta.process.formDetail')"
      :visible.sync="showFormDetail"
      append-to-body
      class="edit-form-dia"
      :close-on-click-modal="false"
      size="m"
      :height="576"
    >
      <form-detail
        :currentFormId="currentFormId"
        @updateFormList="updateFormList"
        @cancelForm="cancelForm"
      ></form-detail>
    </datablau-dialog>

    <datablau-page-title
      class="form-center-title"
      :parent-name="$t('common.page.formCenter')"
      :name="$t('common.page.formCenter')"
    ></datablau-page-title>
    <datablau-tab-with-eltable
      class="table-tab-container form-center-table"
      ref="modelsTable"
      :totalShow="totalShow"
      :columnDefs="columnDefs"
      :getShowData="getShowData"
      :hideTopLine="hideTopLine"
      :hideBottomLine="hideTopLine"
      :tableOption="tableOption"
      :dataSelectAble="true"
      :tableHidePagination="tableHidePagination"
      :defaultParaData="defaultParaData"
      @gridSelectionChanged="gridSelectionChanged"
      @changeKeyWord="changeKeyWord"
    >
      <div class="right-btn-container" slot="header">
        <datablau-button
          type="important"
          size="mini"
          @click="showAddDialog"
          class="iconfont icon-tianjia"
        >
          <!-- 添 加 -->
          {{ $t('meta.process.addForm') }}
        </datablau-button>
        <!-- <datablau-button type="secondary" size="mini" @click="refreshTable">
          刷 新
        </datablau-button> -->
      </div>
      <div class="bottom-btn-container" slot="footer" v-show="couldDeleteBatch">
        <span class="check-info"></span>
        <span class="footer-span">
          {{ $t('system.systemSetting.selLen', { num: selection.length }) }}
        </span>
        <datablau-button
          type="danger"
          size="small"
          class="iconfont icon-delete"
          @click="deleteBatch"
        >
          {{ $t('common.button.delete') }}
        </datablau-button>
      </div>
    </datablau-tab-with-eltable>
  </div>
</template>

<script>
import HTTP from '@/http/main'
import formDetail from './formDetail.vue'
export default {
  data() {
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
        rowSelection: 'single',
      },
      tableHidePagination: false,
      defaultParaData: {
        currentPage: 1,
        pageSize: 20,
      },
      selection: [],
      modelMap: {},

      // *** edit dialog ***
      dialogVisible: false,
      editModelData: {
        name: '',
        id: '',
        key: '',
        description: '',
      },
      dialogTitle: '创建流程',
      isAddModel: false,
      editRules: {
        name: {
          required: true,
          trigger: 'blur',
          message: '请输入名称',
        },
        proDefName: {
          required: true,
          trigger: 'blur',
          message: '请选择类型',
        },
      },
      workflowUrl: null,
      formDelete: ['columnDefs', 'allWorkflowTypes', 'selection'],
    }
  },
  components: {
    formDetail,
  },
  beforeMount() {
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
      // {
      //   type: ['selectionCheckboxColumn'],
      // },
      {
        headerName: this.$t('meta.process.name'),
        field: 'formName',
        tooltipField: 'formName',
      },
      {
        headerName: this.$t('meta.process.type'),
        field: 'formType',
        tooltipField: 'formType',
      },
      {
        headerName: this.$t('meta.process.desc'),
        field: 'description',
        tooltipField: 'description',
      },
      {
        headerName: this.$t('meta.process.operation'),
        width: 110,
        type: ['optionsWithContent'],
        cellRendererParams: {
          tabComponent: this,
          options: [
            // { name: 'check', text: '编辑', method: 'checkModel' },
            // { name: 'remove', text: '删除', method: 'deleteModel' }
            {
              name: 'check',
              text: '编辑',
              icon: 'iconfont icon-bianji',
              method: 'checkModel',
            },
            {
              name: 'remove',
              text: '删除',
              icon: 'iconfont icon-delete',
              method: 'deleteModel',
            },
          ],
        },
      },
    ]
    this.columnDefs = columnDefs

    this.processConfig = this.$workflowConfig
  },
  computed: {
    disabledSave() {
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
    couldDeleteBatch() {
      const arr = this.selection
      return arr && Array.isArray(arr) && arr.length > 0
    },
  },
  mounted() {
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
  beforeDestroy() {
    //       this.formDelete.forEach(item => {
    //       if (typeof this[item] === 'object' && this[item]) {
    //         Object.keys(this[item]).forEach(o => {
    //           this[item][o] = null
    //         })
    //       }
    //       this[item] = null
    //     })
  },
  methods: {
    getButtonList() {
      const arr = []
      arr.push({ name: 'check', text: '编辑', method: 'checkModel' })
      arr.push({ name: 'remove', text: '删除', method: 'deleteModel' })

      return arr
    },

    // *** tab with table ***
    getShowData(para) {
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
    changeKeyWord(val) {
      this.keywordData = val
    },
    setGetAllData(para) {
      const requestBody = {
        pageSize: para.pageSize,
        currentPage: para.currentPage,
        name: this.keywordData,
      }
      this.getAllForm = HTTP.getWorkflowForm(requestBody)
    },
    gridSelectionChanged(para) {
      const api = para.api
      const arr = api.getSelectedNodes()
      const result = []
      arr.forEach(item => {
        result.push(item.data)
      })
      this.selection = result
    },

    // *** edit dialog ***
    showAddDialog() {
      this.isAddModel = true
      this.editModelData = {
        id: '',
        name: '',
        proDefName: '',
        description: '',
      }
      this.dialogVisible = true
    },
    showEditDialog({ data, api, e }) {
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
        id: data.id,
      }
      this.dialogVisible = true
    },
    disableDeploy(data) {
      return false
    },
    disableBind(data) {
      let bool = false
      if (!data.proDefId || data.bindId) {
        bool = true
      }
      return bool
    },
    disableUnbind(data) {
      let bool = false
      if (!data.bindId) {
        bool = true
      }
      return bool
    },
    bindProcess({ data, api, e }) {
      const requestBody = {
        processId: data.id,
        itemType: data.proDefName,
      }
      HTTP.bindProcess({ requestBody })
        .then(res => {
          this.$message.success('绑定成功')
        })
        .catch(e => {
          this.$showFailure(e.message)
        })
    },
    unbindProcess({ data, api, e }) {
      HTTP.unbindProcess({ processId: data.processId })
        .then(res => {
          this.$message.success('解绑成功')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    deleteModel({ data, api, e }) {
      this.$DatablauCofirm('删除后不可恢复，确认删除？', '提示', {
        type: 'warning',
        cancelButtonText: this.$t('common.button.cancel'),
        confirmButtonText: this.$t('common.button.ok'),
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
              description: '删除表单中心' + data.id,
            }

            // this.$http.post(url, body).then(res => {
            this.refreshTable()
            // })
          }
          this.deleteItem(para, callback)
        })
        .catch(e => {
          console.info(e)
        })
    },
    saveEditObj() {
      if (this.editModelData && this.editModelData.name) {
        const sucMsg = this.isAddModel ? '添加成功' : '修改成功'
        const obj = {
          id: this.editModelData.id,
          formName: this.editModelData.name,
          formType: this.editModelData.proDefName,
          description: this.editModelData.description,
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
                description: '新增表单中心' + obj.name,
              }
            } else {
              body = {
                module: 'FLOW_FORMS',
                table: '',
                operation: 'TABLE_MODIFY',
                description: '编辑表单中心' + obj.name,
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
    updateFormList() {
      this.showFormDetail = false
      this.refreshTable()
    },
    cancelForm() {
      this.showFormDetail = false
    },
    refreshTable() {
      if (this.$refs.modelsTable && this.$refs.modelsTable.refreshData) {
        this.$refs.modelsTable.refreshData()
      }
    },
    deleteItem(para, callback) {
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

    deployModel({ data, api, e }) {
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
    checkModel({ data, api, e }) {
      this.showFormDetail = true
      this.currentFormId = data.id
    },

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
      // let callback = () => {
      //   this.$message.success('删除成功');
      //   this.refreshTable();
      // };
      // let para = {
      //   fun: this.deleteItemAsync,
      //   paraArr: arr,
      //   callback
      // };
      this.$DatablauCofirm('删除后不可恢复，确认删除？', '提示', {
        type: 'warning',
        cancelButtonText: this.$t('common.button.cancel'),
        confirmButtonText: this.$t('common.button.ok'),
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
  },
  watch: {},
}
</script>

<style lang="scss" scoped>
$primary-color: #409eff;
.process-model-tab {
  // border: 1px solid red;
  // position: relative;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background-color: var(--default-bgc);

  .bottom-btn-container {
    .check-info {
      width: 14px;
      height: 14px;
      display: inline-block;
      background: $primary-color;
      margin-right: -13px;
      vertical-align: middle;
      margin-left: 20px;
    }
    .footer-span {
      color: rgba(85, 85, 85, 1);
      margin-right: 10px;
      &:before {
        content: '\e6da';
        font-family: 'element-icons';
        font-size: 12px;
        font-weight: 200;
        margin-right: 5px;
        vertical-align: middle;
        line-height: 14px;
        color: white;
      }
    }
  }
  .form-center-title {
    height: 40px;
    line-height: 24px;
    padding-top: 8px;
  }
  .form-center-table {
    position: absolute;
    top: 40px;
    left: 0;
    right: 0;
    bottom: 0;
    /deep/ .tab-top-line {
      height: 34px;
    }
    /deep/ .tab-table-line {
      top: 44px;
      left: 20px;
      right: 20px;
      border-top: none;
      .options-column-cell,
      .el-table {
        th.is-right {
          text-align: center;
        }
        td.is-right {
          text-align: left;
          .cell {
            .col-container {
              display: flex;
              align-items: center;
              span {
                white-space: nowrap;
                &.btn-outer {
                  margin-right: 0 !important;
                }
              }
            }
          }
        }
      }
    }
    /deep/ .tab-bottom-line {
      box-shadow: 0 -5px 14px -8px rgba(0, 0, 0, 0.2);
    }
  }
}
</style>

<style lang="scss" scoped>
.edit-models-dia {
  .models-dialog-body {
    .el-textarea,
    .el-input {
      max-width: 400px;
    }
  }
}
.form-center-textarea {
  /deep/ .el-input__count {
    line-height: 20px !important;
  }
}
.edit-form-limit-input {
  /deep/ .el-input__inner {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}
</style>
