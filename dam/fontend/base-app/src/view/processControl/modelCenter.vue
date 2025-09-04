<template>
  <div class="process-model-tab">
    <datablau-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      append-to-body
      class="edit-models-dia"
      size="m"
      :close-on-click-modal="false"
      :height="280"
    >
      <div class="models-dialog-body" v-if="dialogVisible">
        <datablau-form
          ref="editModel"
          label-position="right"
          :label-width="$i18n.locale === 'zh' ? '80px' : '110px'"
          :model="editModelData"
          :rules="editRules"
        >
          <el-form-item :label="$t('meta.process.type')" prop="proDefName">
            <datablau-select
              v-model="editModelData.proDefName"
              :placeholder="$t('meta.process.selType')"
              filterable
              disabled
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
              maxlength="100"
              v-model="editModelData.name"
              clearable
              :placeholder="$t('meta.process.fillName')"
              style="width: 100%"
            ></datablau-input>
          </el-form-item>
          <el-form-item
            :label="$t('meta.process.processCoding')"
            prop="proCode"
          >
            <datablau-input
              maxlength="100"
              v-model="editModelData.proCode"
              clearable
              :placeholder="$t('meta.process.processCodingPlaceholder')"
              style="width: 100%"
            ></datablau-input>
          </el-form-item>
          <!--        <el-form-item prop="complex">-->
          <!--          <el-checkbox name="complex" v-model="editModelData.complex" label="复杂模型"></el-checkbox>-->
          <!--        </el-form-item>-->
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
          :disabled="disabledSave"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
      </div>
    </datablau-dialog>
    <el-dialog
      title="选择表单"
      :visible.sync="showFormBindDialog"
      :append-to-body="true"
      width="700px"
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
            <datablau-select
              v-model="bindFormId"
              placeholder="请选择类型"
              filterable
            >
              <el-option
                v-for="item in allFormList"
                :label="item.formName"
                :value="item.id"
                :key="item.id"
              ></el-option>
            </datablau-select>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="models-dialog-footer">
        <datablau-button
          type="important"
          size="small"
          @click="handleBindForm"
          class=""
          style="width: 77px"
          :disabled="!bindFormId"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
        <datablau-button
          type="important"
          @click="showFormBindDialog = false"
          size="small"
        >
          {{ $t('common.button.cancel') }}
        </datablau-button>
      </div>
    </el-dialog>
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
        ref="formDetail"
        :currentFormId="currentFormId"
        @updateFormList="updateFormList"
        @cancelForm="cancelForm"
      ></form-detail>
    </datablau-dialog>
    <datablau-page-title
      class="process-model-title"
      :parent-name="$t('common.page.processCenter')"
      :name="$t('common.page.processCenter')"
    ></datablau-page-title>
    <div style="min-width: 1000px; padding-left: 20px; position: relative">
      <datablau-input
        class="search-input"
        :placeholder="$t('meta.report.placeholder')"
        v-model="keyword"
        clearable
        :iconfont-state="true"
      ></datablau-input>
      <!--      <datablau-button
        type="important"
        style="position: absolute; right: 20px"
        size="mini"
        @click="showAddDialog"
        class="iconfont icon-tianjia"
      >
        {{ $t('meta.process.addPro') }}
      </datablau-button>-->
    </div>
    <datablau-form-submit style="min-width: 1000px; top: 84px">
      <datablau-table
        v-if="proTable"
        :data="tableData"
        ref="proTable"
        class="datablau-table table"
        height="100%"
        :show-column-selection="false"
        row-key="treeId"
        lazy
        :tree-props="{ children: 'children', hasChildren: 'children' }"
        :load="lazyLoad"
        :default-expand-all="filterData"
      >
        <el-table-column :label="$t('meta.process.name')" show-overflow-tooltip>
          <template slot-scope="scope">
            <datablau-list-icon dataType="icon-liucheng"></datablau-list-icon>
            {{
              scope.row.children ? scope.row.proCategoryName : scope.row.name
            }}
          </template>
        </el-table-column>
        <el-table-column
          prop="creator"
          :label="$t('meta.process.creator')"
        ></el-table-column>
        <el-table-column
          prop="createTimeMill"
          :label="$t('meta.process.createTime')"
        >
          <template slot-scope="scope">
            <div>
              {{
                scope.row.createTimeMill
                  ? formatterTime(scope.row.createTimeMill)
                  : ''
              }}
            </div>
          </template>
        </el-table-column>
        <!--        :formatter="this.$timeFormatter"-->
        <el-table-column width="250" align="left" fixed="right">
          <template slot="header">
            <span style="margin-left: 1em">
              {{ $t('system.user.operation') }}
            </span>
          </template>
          <template slot-scope="scope">
            <datablau-button
              @click="editForm(scope.row)"
              type="text"
              style="display: inline-block"
              v-if="
                !scope.row.children &&
                ddcRelated.indexOf(scope.row.proCategoryCode) === -1
              "
            >
              {{ $t('meta.process.editForm') }}
            </datablau-button>
            <datablau-button
              @click="showAddDialog(scope.row)"
              type="text"
              style="display: inline-block"
              v-if="
                scope.row.children &&
                ddcRelated.indexOf(scope.row.proCategoryCode) === -1 &&
                scope.row.proCategoryCode === 'MODEL_REPORT'
              "
            >
              {{ $t('meta.process.addProcess') }}
            </datablau-button>
            <datablau-button
              v-if="
                !scope.row.children &&
                ddcRelated.indexOf(scope.row.proCategoryCode) === -1
              "
              @click="deployModel(scope.row)"
              type="text"
              style="display: inline-block"
            >
              {{ $t('meta.process.arrange') }}
            </datablau-button>
            <datablau-button
              type="text"
              @click="checkModel(scope.row)"
              style="display: inline-block"
              v-if="
                !scope.row.children &&
                ddcRelated.indexOf(scope.row.proCategoryCode) === -1
              "
            >
              {{ $t('common.button.edit') }}
            </datablau-button>
            <datablau-button
              type="text"
              @click="deleteModel(scope.row)"
              style="display: inline-block"
              v-if="!scope.row.children && !scope.row.systemBuilt"
            >
              {{ $t('common.button.delete') }}
            </datablau-button>
          </template>
        </el-table-column>
      </datablau-table>
      <!--      <template slot="buttons">
        <datablau-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page.sync="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="20"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalShow"
          class="page"
        ></datablau-pagination>
      </template>-->
    </datablau-form-submit>

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
import HTTP from '@/http/main'
import processDesign from './processDesign/processDesign.vue'
import formDetail from './formDetail.vue'

export default {
  data() {
    return {
      proTable: true,
      tableData: null,
      currentPage: 1,
      pageSize: 20,
      keyword: '',
      keywordTimer: null,
      showFormDetail: false,
      currentFormId: '',
      currentProName: '',
      currentTreeId: '',
      loadNodeMap: new Map(),
      allWorkflowTypes: [],
      filterData: false,
      totalShow: 0,
      // *** edit dialog ***
      dialogVisible: false,
      editModelData: {
        id: '',
        name: '',
        proDefName: '',
        proCode: '',
        simple: false,
        complex: true,
      },
      dialogTitle: this.$t('meta.process.createPro'),
      isAddModel: false,
      editRules: {
        name: [
          {
            required: true,
            trigger: 'blur',
            message: this.$t('meta.process.fillName'),
          },
        ],
        proDefName: [
          {
            required: true,
            trigger: 'blur',
            message: this.$t('meta.process.selType'),
          },
        ],
        proCode: [
          {
            required: true,
            trigger: 'blur',
            message: this.$t('meta.process.processCodingPlaceholder'),
          },
        ],
      },
      showDesignContainer: false,
      showFormBindDialog: false,
      allFormList: [],
      currentProcessId: '',
      currentProcessData: null,
      bindFormId: '',
      ddcRelated: [
        'ASSET_OFFLINE_APPLY',
        'ASSET_PUBLISH_APPLY',
        'AUTHORITY_APPLY',
        'CATALOG_CHANGE_APPLY',
        'CATALOG_OFFLINE_APPLY',
        'CATALOG_PUBLISH_APPLY',
      ],
    }
  },
  components: {
    processDesign,
    formDetail,
  },
  beforeMount() {},
  computed: {
    disabledSave() {
      let bool = true
      if (this.editModelData) {
        if (this.editModelData.name && this.editModelData.proCode) {
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
    this.getTableData()
  },
  methods: {
    formatterTime(data) {
      const t = this.$timeFormatter(data)
      return t
    },
    async _reRenderChildrenNodeAfterChange(parentId = '', name = '') {
      const id = parentId || this.currentTreeId
      const proName = name || this.currentProName
      if (this.loadNodeMap.has(id)) {
        let store = this.$refs.proTable.$refs.table.store
        const { tree, treeNode, resolve } = this.loadNodeMap.get(id)
        this.$set(store.states.lazyTreeNodeMap, id, [])
        let data = await this.lazyLoad({
          reRender: true,
          parentId: id,
          name: proName,
          proCategoryCode: tree.proCategoryCode,
        })
        resolve(data)
      } else {
        // this.selectCurrRow.hasChildren = true
      }
    },

    async lazyLoad(tree, treeNode, resolve) {
      if (tree.reRender) {
        let res = await this.$http.post(
          `${window.wBase}workflow/process/list?type=${tree.proCategoryCode}&parentId=${tree.parentId}`
        )
        if (Array.isArray(res.data) && res.data.length > 0) {
          return res.data
        } else {
          return []
        }
      } else {
        this.loadNodeMap.set(tree.treeId, { tree, treeNode, resolve })
        let res = await this.$http.post(
          `${window.wBase}workflow/process/list?type=${tree.proCategoryCode}&parentId=${tree.treeId}`
        )
        if (Array.isArray(res.data) && res.data.length > 0) {
          resolve(res.data)
        } else {
          resolve([])
        }
      }
    },
    // *** tab with table ***
    async getTableData() {
      let res = await this.$http.post(
        `${window.wBase}workflow/process/type/info?appName=${JSON.parse(
          localStorage.getItem('allServers')
        ).join(',')}&keyword=${this.keyword}`
      )
      if (Array.isArray(res.data) && res.data.length > 0) {
        this.tableData = res.data
      } else {
        this.tableData = []
      }
    },
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
    },
    handleCurrentChange(current) {
      this.currentPage = current
    },
    isIE() {
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
    // *** edit dialog ***
    showAddDialog(data) {
      this.isAddModel = true
      this.editModelData = {
        id: '',
        name: '',
        proDefName: data.proCategoryName,
        proCategoryCode: data.proCategoryCode,
        proCode: '',
        simple: false,
        complex: true,
      }
      this.currentProName = data.proCategoryName
      this.currentTreeId = data.treeId
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
          this.refreshTable()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    unbindProcess({ data, api, e }) {
      HTTP.unbindProcess({ bindId: data.bindId })
        .then(res => {
          this.$message.success('解绑成功')
          this.refreshTable()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    bindForm({ data, api, e }) {
      var params = null
      this.showFormBindDialog = true
      this.currentProcessId = data.id
      this.bindFormId = data.formId || ''
      // if (this.isIE()) {
      //   params = encodeURI(data.proDefName)
      // } else {
      params = data.proDefName
      // }
      HTTP.getWorkflowForm({ processType: params })
        .then(res => {
          this.allFormList = res.data.value || []
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleBindForm() {
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
    deleteModel(data) {
      this.$DatablauCofirm('删除后不可恢复，确认删除？', '提示', {
        type: 'warning',
        cancelButtonText: this.$t('common.button.cancel'),
        confirmButtonText: this.$t('common.button.ok'),
      })
        .then(() => {
          const para = { processId: data.id }
          const callback = () => {
            this.$message.success('删除成功')
            if (this.keyword) {
              this.getTableData()
            } else {
              this._reRenderChildrenNodeAfterChange(
                data.parentId,
                data.proDefName
              )
            }
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
          name: this.editModelData.name,
          proDefName: this.editModelData.proDefName,
          proCode: this.editModelData.proCode,
          proCategoryCode: this.editModelData.proCategoryCode,
          simple: !this.editModelData.complex,
        }
        HTTP.updateProcess({ requestBody: obj })
          .then(res => {
            this.$message.success(sucMsg)
            this.dialogVisible = false
            if (this.keyword) {
              this.getTableData()
            } else {
              this._reRenderChildrenNodeAfterChange()
            }
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        this.$showFailure('内容不能为空')
      }
    },
    refreshTable() {
      if (this.$refs.modelsTable && this.$refs.modelsTable.refreshData) {
        this.$refs.modelsTable.refreshData()
      }
    },
    deleteItem(para, callback) {
      HTTP.deleteProcess(para)
        .then(res => {
          callback && callback()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 编辑表单
    editForm(data) {
      this.currentFormId = data.formId
      this.showFormDetail = true
      this.$nextTick(() => {
        this.$refs.formDetail.dataInit()
      })
    },
    updateFormList() {
      this.showFormDetail = false
      this.getTableData()
    },
    cancelForm() {
      this.showFormDetail = false
    },
    // 部署
    deployModel(data) {
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
    checkModel(data) {
      HTTP.openProcessEditor(data)
    },
    saveProcess(config) {
      const para = {}
      // HTTP.saveProcess(para)
    },
    closeDesign() {
      this.showDesignContainer = false
    },
  },
  watch: {
    keyword(newVal, oldVal) {
      if (!newVal) {
        this.filterData = false
      } else {
        this.filterData = true
      }
      // 重新初始化列表
      this.tableData = null
      this.proTable = false
      this.$nextTick(() => {
        this.proTable = true
      })

      if (this.keywordTimer) {
        clearTimeout(this.keywordTimer)
        this.keywordTimer = null
      }
      this.keywordTimer = setTimeout(() => {
        this.getTableData()
      }, 300)
    },
  },
}
</script>

<style lang="scss" scoped>
.process-model-tab {
  // border: 1px solid red;
  // position: relative;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background-color: var(--default-bgc);

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
  .process-model-table {
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
      // box-shadow: 0 -5px 14px -8px rgba(0, 0, 0, 0.2);
      box-shadow: 0px -5px 14px -8px rgba(0, 0, 0, 0.2);
      border-top: 1px solid transparent;
      z-index: 9;
    }
  }
  .process-model-title {
    height: 40px;
    line-height: 24px;
    padding-top: 8px;
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
.el-table__row.el-table__row--level-1 {
  background-color: rgb(247, 249, 251);
}
</style>
