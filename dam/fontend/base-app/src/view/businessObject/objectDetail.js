import chooseModel from '../dataQuality/techRules/chooseModel.vue'
import searchBusinessColumn from '../dataProperty/meta/searchbusinesscolumn.vue'
import bindColumn from './bindColumn.vue'
import ComponentCaseName from '@constant/ComponentCaseName'
export default {
  props: ['isAppend', 'isEdit', 'currentObject'],
  components: { chooseModel, searchBusinessColumn, bindColumn },
  data() {
    return {
      componentCaseName: ComponentCaseName.BusinessObjectDetail,
      innerDetail: {
        businessTabName: '',
        modelId: null,
        tableId: null,
      },
      modelName: '',
      tableName: '',
      tables: [],
      dialog2Visible: false,
      writable: true,
      editMode: false,

      physicalTables: null,
      dialogVisible: false,

      chooseColumnDialogVisible: false,
      currentPhysicalTableData: null,
    }
  },
  mounted() {
    this.initEventListeners()
    if (this.currentObject) {
      this.editMode = true
      this.innerDetail = this.currentObject
      this.getModelNameById(this.currentObject.modelId)
      this.loadTables()
    }
    this.getDDMTree()
    setTimeout(() => {
      //      this.getModelTree();
    }, 1000)
  },
  beforeDestroy() {
    this.destroyEventListeners()
  },
  methods: {
    // @deprecated
    getModelTree() {
      this.$http
        .get(this.$url + '/service/models/modeltree')
        .then(res => {
          const modelsMap = new Map()
          const findModel = obj => {
            if (obj.type === 'MODEL_CATEGORY' && obj.subNodes) {
              obj.subNodes.forEach(item => {
                modelsMap.set(item.id, obj.id)
              })
            }
            if (obj.subNodes) {
              obj.subNodes.forEach(item => {
                findModel(item)
              })
            }
          }
          findModel(res.data)
          this.modelCategoryMap = modelsMap
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getDDMTree() {
      let smId = ''
      let stId = ''
      if (this.currentObject) {
        smId = this.currentObject.modelId
        stId = this.currentObject.tableId
      }
      if (stId) {
        this.getPhysicalTables(smId, stId)
      }
    },
    getPhysicalTables(smId, stId) {
      if (!smId) {
        smId = this.innerDetail.modelId
        stId = this.innerDetail.tableId
      }
      if (!stId) {
        return
      }
      const requestUrl = `${this.$url}/service/busiObjects/table/${smId}/${stId}/bindings`
      this.$http
        .get(requestUrl)
        .then(res => {
          this.physicalTables = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    callBind() {
      this.dialogVisible = true
    },
    handleObjectSelect(fullMessage) {
      const requestBody = {
        sourceTableId: this.innerDetail.tableId,
        sourceModelId: this.innerDetail.modelId,
        sourceModelCategoryId: null,
        targetTableId: fullMessage.tableId,
        targetModelId: fullMessage.modelId,
        targetModelCategoryId: null,
        tableLevel: true,
      }

      this.$http
        .post(`${this.$url}/service/busiObjects/tables/bind`, requestBody)
        .then(res => {
          this.$bus.$emit('addColumnToBusinessMenuSuccess', {})
          this.getPhysicalTables()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    callUnbind(row) {
      this.$DatablauCofirm('确定要解绑吗？', '', {
        type: 'warning',
      })
        .then(res => {
          const requestBody = {
            sourceTableId: this.innerDetail.tableId,
            sourceModelId: this.innerDetail.modelId,
            sourceModelCategoryId: null,
            targetTableId: row.objectId,
            targetModelId: row.modelId,
            targetModelCategoryId: null,
            tableLevel: true,
          }

          this.$http
            .post(`${this.$url}/service/busiObjects/tables/unbind`, requestBody)
            .then(res => {
              this.getPhysicalTables()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(() => {
          this.$message.info('操作已取消')
        })
    },
    initEventListeners() {
      this.$bus.$on('modelSelected', model => {
        this.clear()
        this.innerDetail.modelId = model.id
        this.modelName = model.name
        this.dialog2Visible = false
        this.loadTables()
      })
    },
    clear() {
      this.innerDetail.tableId = null
      this.tables = []
      this.physicalTables = null
    },
    destroyEventListeners() {
      this.$bus.$off('modelSelected')
    },

    handleSelectModel() {
      this.dialog2Visible = true
    },
    handleModelNameClear() {
      this.innerDetail.tableId = null
      this.physicalTables = null
      this.tables = []
      this.innerDetail.modelId = null
      this.modelName = ''
    },
    loadTables() {
      if (!this.innerDetail.modelId) {
        return
      }
      this.$http
        .get(
          this.$meta_url +
            '/models/ddm/models/' +
            this.innerDetail.modelId +
            '/tables'
        )
        .then(res => {
          if (Array.isArray(res.data)) {
            this.tables = res.data
          }
        })
        .catch(e => {
          this.$showFailure(e)
          this.innerDetail.tableId = null
        })
    },
    refreshList() {
      this.$emit('refreshList')
    },
    closeTab() {
      this.$emit('removeTab', this.innerDetail.businessTabId)
    },
    submit() {
      const method = this.editMode ? 'put' : 'post'
      const url = this.editMode
        ? `${this.$url}/service/busiObjects/tabs/${this.innerDetail.businessTabId}`
        : `${this.$url}/service/busiObjects/tabs`
      this.$http[method](url, this.innerDetail)
        .then(res => {
          this.$message.success(this.$version.common.operationSucceed)
          this.closeTab()
          this.refreshList()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },

    getModelNameById(id) {
      if (!id) return
      this.$http
        .get(this.$meta_url + '/models/ddm/models/' + id)
        .then(res => {
          let data = null
          if (typeof res.data === 'string') {
            data = JSON.parse(res.data)
          } else {
            data = res.data
          }
          this.modelName = data.name
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    modelCategoryFormatter(row) {
      const id = row.modelCategoryId
      return this.$modelCategoriesMap[id]
    },
    handleTableIdChange() {
      this.getPhysicalTables()
    },
    handleTableIdClear() {
      this.innerDetail.tableId = null
      this.physicalTables = null
    },
    callBindColumn(row) {
      this.currentPhysicalTableData = row
      this.chooseColumnDialogVisible = true
    },
  },
  computed: {
    hasPhysicalLink() {
      return this.physicalTables
    },
  },
  watch: {},
}
