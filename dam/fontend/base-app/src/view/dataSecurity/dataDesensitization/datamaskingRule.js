import ruleEdit from './editDatamaskingRule.vue'
import HTTP from '@/http/main.js'
import ResizeHorizontal from '@/components/common/ResizeHorizontal'
import uploadDialog from '../components/uploadDialog.vue'
import DatabaseType from '@/components/dataSource/DatabaseType.vue'
import API from '@/view/dataSecurity/util/api'

export default {
  data() {
    return {
      fileList: [],
      showUpload: false,
      treeLoading: false,
      dialogVisible: false,
      dialogTitle: '新建目录',
      ruleForm: {
        describe: '',
        name: '',
        type: 'MASK_RULE',
      },
      rules: {
        name: [{ required: true, message: '请输入目录名称', trigger: 'blur' }],
      },
      isSelect: true,
      treeKey: '',
      treeData: [],
      currentNode: {},
      defaultProps: {
        value: 'catalogId',
        label: 'name',
        children: 'subNodes',
      },
      tableLoading: false,
      tableData: [],
      currentPage: 1,
      pageSize: 20,
      total: 0,
      renderEdit: false,
      isEdit: false,
      ruleType: '',
      keyword: '',

      selections: [],
      ruleInfoCatalog: '',
      ruleInfoCatalogId: '',
      ruleData: {},
      sort: '',
    }
  },
  components: {
    ruleEdit,
    uploadDialog,
    DatabaseType,
  },
  async mounted() {
    await this.getTree()
    // this.getRules()
    this.initResizeHorizontal()
  },
  methods: {
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
          this.$blauShowFailure('请选择xlsx格式文件')
          this.fileList = []
          this.$refs.ruleUpload.$refs.upload.uploadFiles = []
          return false
        }
      }
      this.fileList = fileList
      if (fileList && fileList.length >= 2) {
        this.$DatablauCofirm('仅支持上传一个文件，是否覆盖？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
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
        this.$blauShowFailure('只能上传xlsx格式的文件')
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
    async getTree() {
      this.treeLoading = true
      API.getDesensitizeTree()
        .then(res => {
          this.treeLoading = false
          const treeData = res.data.data.subNodes || []
          this.treeData = treeData
          if (!this.ruleInfoCatalogId) {
            this.$nextTick(() => {
              this.ruleInfoCatalogId = (treeData[0] || {}).catalogId
            })
          }
          this.$nextTick(() => {
            if (this.ruleInfoCatalogId) {
              this.currentNode = this.$refs.ruleTree.$refs.tree.getNode({
                catalogId: this.ruleInfoCatalogId,
              }).data
              this.$refs.ruleTree.$refs.tree.setCurrentKey(
                this.ruleInfoCatalogId
              )
            }
          })
        })
        .catch(e => {
          this.treeLoading = false
          this.$showFailure(e)
        })
    },
    dataOptionsFunction(data) {
      const options = []
      let label = ''
      if (data.name) {
        label =
          data.name.length < 10 ? data.name : data.name.slice(0, 8) + '...'
      }
      options.push({
        icon: 'iconfont icon-revise',
        label: '修改目录',
        callback: () => {
          this.modifyFolder(data)
        },
        args: 'folder',
      })
      options.push({
        icon: 'iconfont icon-delete',
        label: '删除目录',
        callback: () => {
          this.deleteFolder(data)
        },
        args: 'folder',
      })
      return options
    },
    modifyFolder(data) {
      this.ruleForm = {
        catalogId: data.catalogId,
        describe: data.describe,
        name: data.name,
        parentId: data.parentId,
        type: 'MASK_RULE',
      }
      this.dialogTitle = '修改目录'
      this.dialogVisible = true
    },
    deleteFolder(data) {
      this.$DatablauCofirm(`确认要删除吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        API.deleteStrategyCatalog(data.catalogId, 'MASK_RULE')
          .then(deleteRes => {
            if (deleteRes.status === 200) {
              this.$blauShowSuccess('删除成功')
              this.$refs.ruleTree.$refs.tree.remove(data.catalogId)
              this.dialogVisible = false
              this.getTree()
            } else {
              this.$blauShowFailure(deleteRes.data)
            }
          })
          .catch(error => {
            this.$blauShowFailure(error)
          })
      })
    },
    nameKeydown(e) {
      e.target.value = e.target.value.replace(/[`\\/]/g, '')
    },

    sureName() {
      this.ruleForm.name = this.ruleForm.name.replace('/', '')
      const params = this.ruleForm
      if (this.ruleForm.catalogId) {
        // params.parentId = 0
        this.$http
          .post(this.$url + `/service/accessStrategy/catalog/modify`, params)
          .then(async res => {
            this.$message.success('修改目录成功')
            this.dialogVisible = false
            this.ruleInfoCatalogId = this.ruleForm.catalogId
            this.getTree()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        this.$http
          .post(this.$url + `/service/accessStrategy/catalog/add`, params)
          .then(async res => {
            this.$message.success('目录创建成功')
            this.dialogVisible = false
            this.ruleInfoCatalogId = res.data.data
            this.getTree()
          })
          .catch(e => {
            this.$showFailure(e)
          })
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
    addCatalogue() {
      this.ruleForm = {
        id: '',
        describe: '',
        name: '',
        type: 'MASK_RULE',
        parentId: 0,
      }
      this.dialogTitle = '新建目录'
      this.dialogVisible = true
    },
    selectRule() {
      this.isSelect = true
      this.$refs.tree.setCurrentKey(null)
      this.ruleInfoCatalog = ''
      this.ruleInfoCatalogId = ''
      this.keyword = ''
      this.currentPage = 1
      this.getRules()
    },
    handleNodeClick(data, e) {
      this.currentNode = data
      this.isSelect = false
      this.ruleInfoCatalog = data.name
      this.ruleInfoCatalogId = data.catalogId
      // this.getRules()
    },

    filterNode(value, data) {
      if (!value) return true
      return data.name && data.name.indexOf(value) !== -1
    },
    dataIconFunction(data, node) {
      if (node.expanded) {
        return 'iconfont icon-openfile'
      } else {
        return 'iconfont icon-file'
      }
    },
    exportRule(all = false) {
      let ids = ''
      if (!all) {
        ids = this.selections.map(v => v.ruleId).join(',')
      }
      HTTP.exportRules(ids).then(res => {
        this.$bus.$emit('getTaskJobResult', res.data, 'export')
      })
    },
    exportRuleModule() {
      let url = this.$url + '/service/datamasking/download?ruleIds=0'
      this.$datablauDownload(url, {}, '脱敏规则模板')
    },
    getDate(time) {
      const date = new Date(time)
      return moment(date).format('YYYY-MM-DD HH:mm')
    },
    sureDel(idList, title) {
      this.$DatablauCofirm(title, '提示', {
        confirmButtonText: this.$t('common.button.ok'),
        cancelButtonText: this.$t('common.button.cancel'),
        type: 'warning',
      }).then(() => {
        API.delDesensitizeRule(idList)
          .then(res => {
            this.$message.success('删除成功')
            this.getRules()
          })
          .catch(err => {
            this.$showFailure(err)
          })
      })
    },
    deleteRule(id) {
      const title = `确认要删除吗？`
      this.sureDel([id], title)
    },
    tableSelectionChanged(selection) {
      this.selections = selection
    },
    // 删除多条规则，传入规则的id数组
    mulipleDeleRule() {
      const ids = this.selections.map(v => v.ruleId)
      const title = `已选择“${this.selections.length}条”数据，确认要删除吗？`
      this.sureDel(ids, title)
    },
    editRule(row) {
      this.ruleData = row
      this.renderEdit = true
      this.isEdit = true
    },
    showEdit() {
      this.renderEdit = true
      this.isEdit = false
    },
    close() {
      this.renderEdit = false
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
    getRules(defaultParams = {}) {
      this.tableLoading = true
      const params = {
        path: this.currentNode.path,
        pageNum: this.currentPage,
        pageSize: this.pageSize,
        orderBy: 'createDate',
        sort: this.sort === 'ascending' ? 'ASC' : 'DESC',
        ruleName: this.keyword, // 规则名字
        catalogId: this.ruleInfoCatalogId, // 目录id
        limit: true, // 是否分页
        ...defaultParams,
      }
      API.desensitizeRuleList(params)
        .then(res => {
          this.tableLoading = false
          const data = res.data.data
          this.tableData = data.result
          this.total = data.total
        })
        .catch(e => {
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
        return '-'
      }
    },
  },
  watch: {
    currentNode: {
      async handler(node) {
        if (node.catalogId) {
          this.ruleInfoCatalogId = node.catalogId
          this.$nextTick(() => {
            this.$refs.ruleTree.$refs.tree.setCurrentKey(node.catalogId)
            // this.expandParents(node)
          })
          this.getRules({
            currentPage: 1,
          })
        }
        this.$datablauLoading.close()
      },
    },
    keyword(val) {
      if (!val) {
        this.currentPage = 1
        this.getRules()
      }
    },

    treeKey(val) {
      this.$refs.tree.filter(val)
    },
  },
}
