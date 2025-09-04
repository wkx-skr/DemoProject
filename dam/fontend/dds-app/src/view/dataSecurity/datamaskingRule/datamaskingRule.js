import ruleEdit from './editDatamaskingRule.vue'
import ResizeHorizontal from '@/components/common/ResizeHorizontal'
import DatabaseType from '@/components/dataSource/DatabaseType.vue'
import API from '@/view/dataSecurity/util/api'
import catalogTree from '@/view/dataSecurity/components/catalogTree.vue'
import { delObjMethod } from '@/view/dataSecurity/util/util.js'

export default {
  data() {
    return {
      listShow: true,
      fileList: [],
      showUpload: false,
      treeData: [],
      currentNode: {},
      tableLoading: true,
      tableData: [],
      currentPage: 1,
      pageSize: 20,
      total: 0,
      renderEdit: false,
      isEdit: false,
      isView: false,
      keyword: '',

      selections: [],
      ruleData: {},
      sort: '',
      catalogLen: 0,
      catalogId: 0,
      quoteList: [],
      breadcrumbNodes: [],
      curName: '',
      delTip: false,
      catalogMap: {},
    }
  },
  components: {
    ruleEdit,
    DatabaseType,
    catalogTree,
  },
  async mounted() {
    // this.getRules()
    this.initResizeHorizontal()
  },
  methods: {
    setBreadcrumb() {
      if (this.currentNode.nameList) {
        this.breadcrumbNodes = [
          ...this.currentNode.nameList,
          { name: this.curName },
        ]
      } else {
        this.breadcrumbNodes = [
          {
            name: this.curName,
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
      this.breadcrumbNodes = [...newList, { name: this.curName }]
    },
    goBack() {
      this.renderEdit = false
    },
    clickTree(name, options) {
      switch (name) {
        case 'catalogTree':
          this.catalogLen = options.catalogLen
          this.treeData = options.treeData
          this.currentNode = options.data
          this.catalogId = options.data.catalogId || 0
          this.currentPage = 1
          this.getRules()
          break
        case 'listShow':
          this.listShow = false
          break
        default:
          break
      }
    },
    searchRuleList() {
      this.currentPage = 1
      this.getRules()
    },
    sureImport() {
      this.$refs.ruleUpload.$refs.upload.submit()
    },
    handleRemove(file, fileList) {
      this.fileList = fileList
    },
    handleChange(file, fileList) {
      for (let i = 0; i < fileList.length; i++) {
        if (!this.checkFileValidation(fileList[i], ['xlsx'])) {
          this.$datablauMessage.error(this.$t('maskingRule.selFileType'))
          this.fileList = []
          this.$refs.ruleUpload.$refs.upload.uploadFiles = []
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
        this.showUpload = false
        this.$bus.$emit('getTaskJobResult', file.response, 'import')
      }
    },
    handleUploadError(e) {
      this.showUpload = false
      this.$showUploadFailure(e)
    },
    checkFileValidation(file, supported) {
      const fileName = file.name
      const splitedName = fileName.split('.')
      const puffix = splitedName[splitedName.length - 1]
      return supported.indexOf(puffix) !== -1
    },
    beforeUpload(file) {
      if (!this.checkFileValidation(file, ['xlsx'])) {
        this.$datablauMessage.error(this.$t('maskingRule.onlyImportType'))
        return false
      }
    },
    handleCloseUploadDialog() {
      this.showUpload = false
    },
    moreHandle(command) {
      switch (command) {
        case 'import':
          this.showUpload = true
          break
        case 'export':
          this.exportRule(true)
          break
        default:
          break
      }
    },
    initResizeHorizontal() {
      setTimeout(() => {
        new ResizeHorizontal({
          leftDom: $('.rule-management-tree'),
          middleDom: $('.resize-column-middle'),
          rightDom: $('.rule-right-box'),
          noCrack: true,
          minWith: { leftMinWidth: 240, leftMaxWidth: 800 },
        })
      }, 1000)
    },
    exportRule(all = false) {
      let ids = ''
      if (!all) {
        ids = this.selections.map(v => v.ruleId)
        API.exportDatamaskingRule(ids)
          .then(res => {
            this.$refs.table.clearSelection()
            this.$bus.$emit('getTaskJobResult', res.data, 'export')
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        const params = {
          catalogId: this.currentNode.catalogId || 0,
          ruleName: this.keyword,
        }
        API.exportAllDatamasking(params)
          .then(res => {
            this.$refs.table.clearSelection()
            this.$bus.$emit('getTaskJobResult', res.data, 'export')
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    exportRuleModule() {
      let url = '/datasecurity/mask/rule/download'
      this.$datablauDownload(url, {}, this.$t('maskingRule.maskingRuleTem'))
    },
    getDate(time) {
      const date = new Date(time)
      return moment(date).format('YYYY-MM-DD HH:mm')
    },
    sureDel(idList, type, name = '') {
      const delParams = {
        this: this,
        objName: this.$t('maskingRule.title'),
        name: name,
        type: type,
        num: this.selections.length,
      }
      delObjMethod(delParams).then(() => {
        API.delDesensitizeRule(idList)
          .then(res => {
            this.$refs.table.clearSelection()
            this.quoteList = res.data.data || []
            if (this.quoteList.length > 0) {
              this.delTip = true
            } else {
              this.$datablauMessage.success(
                this.$t('securityModule.delSuccess')
              )
            }
            this.currentPage = 1
            this.getRules()
          })
          .catch(err => {
            this.$showFailure(err)
          })
      })
    },
    deleteRule(row) {
      API.judgeCanDel(row.ruleId)
        .then(res => {
          this.sureDel([row.ruleId], 'single', row.ruleName)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    tableSelectionChanged(selection) {
      this.selections = selection
    },
    // 删除多条规则，传入规则的id数组
    mulipleDeleRule() {
      const ids = this.selections.map(v => v.ruleId)
      this.sureDel(ids, 'multiple')
    },
    maskLog(row) {
      const params = {
        name: row.ruleName,
        // ruleId: row.ruleId,
        desc: row.ruleDesc,
        content: row.ruleContent,
        dbType: row.dbType,
      }
      API.maskLogApi(params)
        .then(res => {})
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleRule(row, type) {
      switch (type) {
        case 'see':
          this.curName = this.$t('maskingRule.viewRule')
          this.setCurBreadcrumb(row.catalogPath)
          this.renderEdit = true
          this.isView = true
          this.isEdit = false
          this.maskLog(row)
          break
        case 'edit':
          API.judgeCanDel(row.ruleId)
            .then(res => {
              this.curName = this.$t('maskingRule.editRule')
              this.setCurBreadcrumb(row.catalogPath)
              this.renderEdit = true
              this.isEdit = true
              this.isView = false
            })
            .catch(e => {
              this.$showFailure(e)
            })
          break
        default:
          break
      }
      this.ruleData = row
    },
    showEdit() {
      this.curName = this.$t('maskingRule.newRule')
      this.setBreadcrumb()
      if (this.currentNode.catalogId) {
        this.catalogMap = {
          name: this.currentNode.name,
          id: this.currentNode.catalogId,
        }
      }
      this.renderEdit = true
      this.isEdit = false
      this.isView = false
    },
    close() {
      this.renderEdit = false
      this.currentPage = 1
      this.getRules()
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
      this.getRules()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.getRules()
    },
    sortChange(data) {
      this.sort = data.order
      this.currentPage = 1
      this.getRules()
    },
    getRules() {
      this.tableLoading = true
      const params = {
        // path: this.currentNode.path,
        pageNum: this.currentPage,
        pageSize: this.pageSize,
        orderBy: 'createDate',
        sort: this.sort === 'ascending' ? 'ASC' : 'DESC',
        ruleName: this.keyword, // 规则名字
        catalogId: this.catalogId, // 目录id
        limit: true, // 是否分页
      }
      API.desensitizeRuleList(params)
        .then(res => {
          this.listShow = true
          this.tableLoading = false
          const data = res.data.data
          this.tableData = data.result
          this.total = data.total
        })
        .catch(e => {
          this.listShow = false
          this.$showFailure(e)
        })
    },
    timeFormatter() {
      if (typeof arguments[0] === 'number') {
        return moment(arguments[0]).format('YYYY-MM-DD HH:mm')
      } else if (arguments[0] == undefined) {
        return ''
      } else if (typeof arguments[0] === 'string') {
        return arguments[0]
      }
      if (arguments[0][arguments[1].property]) {
        return moment(arguments[0][arguments[1].property]).format(
          'YYYY-MM-DD HH:mm'
        )
      } else {
        return '--'
      }
    },
  },
  watch: {
    keyword(val) {
      if (!val) {
        this.searchRuleList()
      }
    },
  },
}
