import atomicDetail from './atomicDetail.vue'
import ResizeHorizontal from '@/components/common/ResizeHorizontal'
export default {
  components: {
    atomicDetail,
  },
  data() {
    return {
      tableLoading: false,
      ruleForm: {
        name: '',
        type: 'ATOM_DISCERN_RULE',
      },
      rules: {
        name: [{ required: true, message: '请输入目录名称', trigger: 'blur' }],
      },
      treeKey: '',
      ruleInfoCatalog: '',
      treeData: [],
      defaultProps: {
        value: 'id',
        label: 'name',
        children: 'subNodes',
      },
      treeLoading: false,
      dialogVisible: false,
      isSelect: true,
      keyword: '',
      page: 1,
      size: 20,
      total: 0,
      tableData: [],
      selections: [],
      showDetail: false,
      ruleId: '',
      isEdit: false,
      showTip: false,
      showList: {
        addList: [],
        failList: [],
        updateList: [],
      },
    }
  },
  mounted() {
    this.getList()
    this.getTree()
    this.initResizeHorizontal()
  },
  watch: {
    keyword(val) {
      // 监听input清空时的
      if (!val) {
        this.getList()
      }
    },
    treeKey(val) {
      this.$refs.tree.filter(val)
    },
  },
  methods: {
    dataOptionsFunction(data) {
      const options = []
      let label = ''
      if (data.name) {
        label =
          data.name.length < 10 ? data.name : data.name.slice(0, 8) + '...'
      }
      options.push({
        icon: 'iconfont icon-revise',
        label: '修改',
        callback: () => {
          this.modifyFolder(data)
        },
        args: 'folder',
      })
      options.push({
        icon: 'iconfont icon-delete',
        label: '删除',
        callback: () => {
          this.deleteFolder(data)
        },
        args: 'folder',
      })
      return options
    },
    modifyFolder(data) {
      this.ruleForm = {
        id: data.id,
        name: data.name,
        type: 'ATOM_DISCERN_RULE',
      }
      this.dialogVisible = true
    },
    deleteFolder(data) {
      this.$DatablauCofirm(`是否确认删除目录“${data.name}”`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.$http
          .delete(this.$url + '/service/discern/category/atom/' + data.id)
          .then(res => {
            this.$message.success('删除目录成功')
            this.dialogVisible = false
            this.getTree()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
    getTree() {
      this.treeLoading = true
      this.$http
        .get(this.$url + '/service/categories/tree/?type=ATOM_DISCERN_RULE')
        .then(res => {
          this.treeLoading = false
          this.treeData = res.data.subNodes || []
          console.log(this.treeData)
        })
        .catch(err => {
          this.treeLoading = false
          this.$showFailure(err)
        })
    },
    nameKeydown(e) {
      e.target.value = e.target.value.replace(/[`\\/]/g, '')
    },
    sureName() {
      this.ruleForm.name = this.ruleForm.name.replace('/', '')
      if (this.ruleForm.id) {
        const params = this.ruleForm
        params.parentId = 0
        this.$http
          .put(
            this.$url + '/service/discern/category/atom/' + this.ruleForm.id,
            params
          )
          .then(res => {
            this.$message.success('修改目录成功')
            this.dialogVisible = false
            this.getTree()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        this.$http
          .post(this.$url + '/service/categories/', this.ruleForm)
          .then(res => {
            this.$message.success('目录创建成功')
            this.dialogVisible = false
            this.getTree()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    addCatalogue() {
      this.ruleForm = {
        id: '',
        name: '',
        type: 'ATOM_DISCERN_RULE',
      }
      this.dialogVisible = true
    },
    selectRule() {
      this.isSelect = true
      this.$refs.tree.setCurrentKey(null)
      this.ruleInfoCatalog = ''
      this.page = 1
      this.keyword = ''
      this.getList()
    },
    handleNodeClick(data, e) {
      this.isSelect = false
      this.ruleInfoCatalog = data.name
      this.getList()
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
    initResizeHorizontal() {
      setTimeout(() => {
        new ResizeHorizontal({
          leftDom: $('.atomic-tree-box'),
          middleDom: $('.resize-column-middle'),
          rightDom: $('.atomic-right-box'),
          noCrack: true,
          minWith: { leftMinWidth: 280 },
        })
      }, 1000)
    },
    search() {
      this.getList()
    },
    handleBeforeUpload(file) {
      if (file.name.includes('.xlsx')) {
      } else {
        this.$message.error(`只能上传xlsx格式的文件!`)
        return false
      }
    },
    handleUploadSuccess(response) {
      if (
        response.copyFailList.length === 0 &&
        response.ruleNotExistList.length === 0 &&
        response.updateList.length === 0 &&
        response.successList.length === 0
      ) {
        this.$datablauMessage({
          message: '请导入非空识别规则',
          type: 'warning',
        })
        return
      }
      this.showList.failList = []
      if (response.copyFailList.length > 0) {
        this.showList.failList = [...response.copyFailList]
      }
      if (response.ruleNotExistList.length > 0) {
        this.showList.failList.push(...response.ruleNotExistList)
      }
      this.showList.addList = response.successList
      this.showList.updateList = response.updateList
      this.showTip = true
      // this.$message.success('上传成功')

      this.getTree() // 重新获取目录
      this.selectRule()
    },
    handleUploadError(e) {
      this.$showUploadFailure(e)
    },
    exportRule(all = false) {
      let ids = ''
      if (!all) {
        ids = this.selections.map(v => v.ruleId).join(',')
      }
      let url = this.$url + '/service/discern/download?ruleIds=' + ids
      this.$datablauDownload(url, {}, '识别规则表')
    },
    showEdit() {
      this.isEdit = false
      this.showDetail = true
    },
    getList() {
      this.tableLoading = true
      const params = {
        search: this.keyword,
        order_by: 'createTime',
        is_asc: false,
        current_page: this.page,
        page_size: this.size,
        ruleInfoCatalog: this.ruleInfoCatalog,
      }
      this.$http
        .get(this.$url + '/service/discern/atom/rules', { params: params })
        .then(data => {
          this.tableLoading = false
          this.tableData = data.data.content || []
          this.total = data.data.totalItems
        })
        .catch(err => {
          this.tableLoading = false
          this.$showFailure(err)
        })
    },
    tableSelectionChanged(selection) {
      this.selections = selection
    },
    mulipleDeleRule() {
      const ids = this.selections.map(v => v.ruleId).join(',')
      this.deleteRule(ids, true)
    },
    handleSizeChange(val) {
      this.size = val
      this.page = 1
      this.getList()
    },
    handleCurrentChange() {
      this.getList()
    },
    editRule(row) {
      this.isEdit = true
      this.ruleId = row.ruleId
      this.showDetail = true
    },
    deleteRule(row, multiple = false) {
      let ids, tipName
      if (multiple) {
        ids = row
        tipName = `选中“${this.selections.length}条”规则，是否确认删除？`
      } else {
        tipName = `是否确认删除？`
        ids = row.ruleId
      }
      this.$DatablauCofirm(tipName, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.$http
          .delete(this.$url + '/service/discern/atom/delete?ruleIds=' + ids)
          .then(data => {
            this.$message.success('删除成功')
            this.getList()
          })
          .catch(err => {
            this.$showFailure(err)
          })
      })
    },
    close() {
      this.getList()
      this.showDetail = false
    },
  },
}
