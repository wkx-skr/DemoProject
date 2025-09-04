import newDiscern from './compontents/newDiscern.vue'
import ResizeHorizontal from '@/components/common/ResizeHorizontal'
import API from '@/view/dataSecurity/util/api'
import { ruleTypeEnum } from '@/view/dataSecurity/util/attrEnum'
import { methodRuleType } from '@/view/dataSecurity/util/util.js'
import catalogTree from '@/view/dataSecurity/components/catalogTree.vue'
import { delObjMethod } from '@/view/dataSecurity/util/util.js'
export default {
  components: {
    newDiscern,
    catalogTree,
  },
  data() {
    return {
      listShow: true,
      nowCatalogName: {},
      methodRuleType: methodRuleType,
      ruleTypeEnum: ruleTypeEnum,
      ruleType: ruleTypeEnum.GENERAL_RULE,
      ruleName: '',
      expandedList: [],
      itemId: '',
      itemName: '',
      tableLoading: true,
      showImportTip: false,
      ruleTipList: [],
      fileList: [],
      uploadShow: false,
      showNew: false,
      discernEditable: true,
      activeDiscernId: null,
      treeData: [],
      keyword: '',
      ruleData: [],
      refList: [],
      ruleSelections: [],
      form: {
        page: 1,
        size: 20,
      },
      sort: '',
      orderBy: 'createTime',
      total: 0,
      breadcrumbNodes: [],
      heightCatalog: {}, // 高亮的目录
      curCatalog: {}, // 当前操作的目录
    }
  },
  props: {
    hasMachine: {
      type: Boolean,
      default: true,
    },
  },
  watch: {
    keyword(val) {
      if (!val) {
        this.searchList()
      }
    },
  },
  mounted() {
    this.ruleName = this.$t('intelligence.newGeneralRule')
    this.itemId = this.$route.query.itemId
    this.itemName = this.$route.query.name
    this.initResizeHorizontal()
    // this.getList()
  },
  methods: {
    clickTree(name, options) {
      switch (name) {
        case 'catalogTree':
          this.page = 1
          this.heightCatalog = options.data
          this.getList()
          break
        case 'listShow':
          this.listShow = false
          break
        default:
          break
      }
    },
    sortChange(data) {
      this.orderBy = data.prop
      this.sort = data.order
      this.form.page = 1
      this.getList()
    },
    checkFileValidation(file, supported) {
      const fileName = file.name
      const splitedName = fileName.split('.')
      const puffix = splitedName[splitedName.length - 1]
      return supported.indexOf(puffix) !== -1
    },
    uploadSure() {
      this.$refs.calssifyUpload.$refs.upload.submit()
    },
    beforeUpload(file) {
      if (!this.checkFileValidation(file, ['xlsx'])) {
        this.$datablauMessage.error(this.$t('intelligence.importTip1'))
        return false
      }
    },
    handleRemove(file, fileList) {
      this.fileList = fileList
    },
    handleChange(file, fileList) {
      for (let i = 0; i < fileList.length; i++) {
        if (!this.checkFileValidation(fileList[i], ['xlsx'])) {
          this.$datablauMessage.error(this.$t('intelligence.selectFileType'))
          this.fileList = []
          this.$refs.calssifyUpload.showList = []
          this.$refs.calssifyUpload.$refs.upload.uploadFiles = []
          return false
        }
      }
      this.fileList = fileList
      if (fileList && fileList.length >= 2) {
        this.$DatablauCofirm(this.$t('securityModule.singleUploadTip'))
          .then(() => {
            fileList.shift()
            this.fileList = fileList
          })
          .catch(e => {
            fileList.pop()
            this.fileList = fileList
          })
      }
      if (file.status === 'success') {
        this.uploadShow = false
        this.$bus.$emit('getTaskJobResult', file.response, 'import')
      }
    },
    handleUploadError(e) {
      this.uploadShow = false
      this.$showUploadFailure(e)
    },
    initResizeHorizontal() {
      setTimeout(() => {
        new ResizeHorizontal({
          leftDom: $('.tree-box'),
          middleDom: $('.resize-column-middle'),
          rightDom: $('.right-box'),
          noCrack: true,
          minWith: { leftMinWidth: 240, leftMaxWidth: 800 },
        })
      }, 1000)
    },
    goBack() {
      this.showNew = false
      this.setHeightTree()
    },
    searchList() {
      this.form.page = 1
      this.getList()
    },
    setHeightTree() {
      this.$nextTick(() => {
        this.$refs.catalogTree.resetId = this.heightCatalog.catalogId
      })
    },
    exportRule(isAll = true) {
      // 识别规则导出
      if (isAll) {
        const params = {
          catalogId: this.heightCatalog.catalogId || 0,
          searchStr: this.keyword,
        }
        API.exportRules(params)
          .then(res => {
            this.$refs.ruleTable.clearSelection()
            this.$bus.$emit('getTaskJobResult', res.data, 'export')
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        const ids = this.ruleSelections.map(item => item.ruleId)
        API.exportSelectRules(ids)
          .then(res => {
            this.$refs.ruleTable.clearSelection()
            this.$bus.$emit('getTaskJobResult', res.data, 'export')
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    handlerExport() {
      this.exportRule(false)
    },
    modelDownload() {
      const url = `/datasecurity/datasecurity/rule/download`
      this.$downloadFilePost(url, {})
    },
    moreHandle(command) {
      switch (command) {
        case 'import':
          this.uploadShow = true
          break
        case 'export':
          this.exportRule()
          break
        default:
          break
      }
    },
    handleRuleChange(selection) {
      this.ruleSelections = selection
    },
    handleCommand(command) {
      this.ruleType = command
      if (this.heightCatalog.catalogId) {
        this.nowCatalogName = {
          name: this.heightCatalog.name,
          catalogId: this.heightCatalog.catalogId,
        }
      } else {
        this.nowCatalogName = {}
      }
      switch (command) {
        case ruleTypeEnum.GENERAL_RULE:
          this.ruleName = this.$t('intelligence.newGeneralRule')
          break
        case ruleTypeEnum.CONSANGUINITY_CASCADE:
          this.ruleName = this.$t('intelligence.newConsanguinityRule')
          break
        case ruleTypeEnum.MACHINE_LEARNING:
          this.ruleName = this.$t('intelligence.newMachineRule')
          break
        default:
          break
      }
      this.newRule()
    },
    async newRule() {
      this.ruleSelections = []
      this.activeDiscernId = ''
      this.showNew = true
      this.discernEditable = true
      this.setBreadcrumb()
    },
    editRule(row) {
      switch (row.ruleType) {
        case ruleTypeEnum.GENERAL_RULE:
          this.ruleName = this.$t('intelligence.editGeneralRule')
          break
        case ruleTypeEnum.CONSANGUINITY_CASCADE:
          this.ruleName = this.$t('intelligence.editConsanguinityRule')
          break
        case ruleTypeEnum.MACHINE_LEARNING:
          this.ruleName = this.$t('intelligence.editMachineRule')
          break
        default:
          this.ruleName = this.$t('intelligence.editGeneralRule')
          break
      }
      this.ruleType = row.ruleType ? row.ruleType : ruleTypeEnum.GENERAL_RULE
      this.ruleSelections = []
      this.showNew = true
      this.discernEditable = true
      this.activeDiscernId = row.ruleId
      this.setCurBreadcrumb(row.path)
    },
    setBreadcrumb() {
      if (this.heightCatalog.nameList) {
        this.breadcrumbNodes = [
          ...this.heightCatalog.nameList,
          { name: this.ruleName },
        ]
      } else {
        this.breadcrumbNodes = [
          {
            name: this.ruleName,
          },
        ]
      }
    },
    setCurBreadcrumb(path) {
      const pathList = path.split('/')
      let newList = []
      pathList.map(item => {
        const newMap = {
          name: item,
        }
        newList.push(newMap)
      })
      this.breadcrumbNodes = [...newList, { name: this.ruleName }]
    },
    edit(row) {
      const params = {
        type: 'ruleId',
        id: row.ruleId,
      }
      API.judgeTaskRun(params)
        .then(res => {
          API.judgeRule(row.ruleId)
            .then(res => {
              if (res.data.data) {
                this.editRule(row)
              } else {
                this.$DatablauCofirm(this.$t('intelligence.ruleTip'))
                  .then(() => {
                    this.editRule(row)
                  })
                  .catch(() => {})
              }
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    see(row) {
      switch (row.ruleType) {
        case ruleTypeEnum.GENERAL_RULE:
          this.ruleName = this.$t('intelligence.viewGeneralRule')
          break
        case ruleTypeEnum.CONSANGUINITY_CASCADE:
          this.ruleName = this.$t('intelligence.viewConsanguinityRule')
          break
        case ruleTypeEnum.MACHINE_LEARNING:
          this.ruleName = this.$t('intelligence.viewMachineRule')
          break
        default:
          this.ruleName = this.$t('intelligence.viewGeneralRule')
          break
      }
      this.ruleType = row.ruleType ? row.ruleType : ruleTypeEnum.GENERAL_RULE
      this.ruleSelections = []
      this.showNew = true
      this.discernEditable = false
      this.activeDiscernId = row.ruleId
      this.setCurBreadcrumb(row.path)
    },
    del(row) {
      const delParams = {
        this: this,
        objName: this.$t('intelligence.idRules'),
        type: 'single',
        name: row.ruleName,
      }
      delObjMethod(delParams).then(() => {
        const idList = [row.ruleId]
        this.delRuleList(idList)
      })
    },
    handleDelete() {
      const delParams = {
        this: this,
        objName: this.$t('intelligence.idRules'),
        type: 'multiple',
        num: this.ruleSelections.length,
      }
      delObjMethod(delParams).then(() => {
        let idList = []
        this.ruleSelections.map(item => {
          idList.push(item.ruleId)
        })
        this.delRuleList(idList)
      })
    },
    getEdit(row) {
      let bool = false
      bool = this.refList.some(m => parseFloat(m) === parseFloat(row.ruleId))
      return bool
    },
    delRuleList(ids) {
      API.delRuleList(ids)
        .then(res => {
          if (res.data.data && res.data.data.length > 0) {
            let nameList = []
            this.ruleData.map(item => {
              res.data.data.map(id => {
                if (parseFloat(item.ruleId) === parseFloat(id)) {
                  nameList.push(item.ruleName)
                }
              })
            })
            this.$datablauMessage.error(
              this.$t('intelligence.delRuleTip', {
                name: nameList.join('，'),
              })
            )
          } else {
            this.$datablauMessage.success(this.$t('securityModule.delSuccess'))
          }
          this.$refs.ruleTable.clearSelection()
          this.form.page = 1
          this.getList()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handlePageChange(val) {
      this.form.page = val
      this.getList()
    },
    handleSizeChange(val) {
      this.form.size = val
      this.form.page = 1
      this.getList()
    },
    getList() {
      this.tableLoading = true
      const params = {
        pageNum: this.form.page,
        pageSize: this.form.size,
        orderBy: this.orderBy,
        sort: this.sort === 'ascending' ? 'ASC' : 'DESC', // ASC/DESC
        searchStr: this.keyword,
        catalogId: this.heightCatalog.catalogId || '',
      }
      API.getRuleList(params)
        .then(res => {
          this.listShow = true
          this.tableLoading = false
          this.total = res.data.data.total
          this.ruleData = res.data.data.rules
          this.refList = res.data.data.refList || []
        })
        .catch(e => {
          this.ruleData = []
          this.tableLoading = false
          this.$showFailure(e)
          this.listShow = false
        })
    },
    discernClick(name, params) {
      switch (name) {
        case 'new':
          if (params.type === 'cancel') {
            this.showNew = false
          } else {
            if (params.type === 'submit') {
              this.showNew = false
              this.$datablauMessage.success(
                this.$t('securityModule.newSuccess')
              )
            }
            if (params.type === 'save') {
              this.showNew = false
              this.$datablauMessage.success(
                this.$t('securityModule.editSuccess')
              )
            }
          }
          this.setHeightTree()
          break
        case 'edit':
          if (params.type === 'save') {
            // this.showNew = false
          }
          break
        default:
          break
      }
    },
  },
}
