import newDiscern from './compontents/newDiscern.vue'
import ResizeHorizontal from '@/components/common/ResizeHorizontal'
import API from '@/view/dataSecurity/util/api'
import { ruleTypeEnum } from '@/view/dataSecurity/util/attrEnum'
import { methodRuleType } from '@/view/dataSecurity/util/util.js'
export default {
  components: {
    newDiscern,
  },
  data() {
    const nameValidatePass = async (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入目录名称'))
      } else {
        // 判断是否含不允许输入的特殊字符
        const reg = /[#/\\@$_%<>]/gi
        if (reg.test(value)) {
          callback(new Error('名称不允许包含#/\\@$_%<>等特殊字符'))
        } else {
          callback()
        }
      }
    }
    return {
      methodRuleType: methodRuleType,
      ruleTypeEnum: ruleTypeEnum,
      ruleType: ruleTypeEnum.GENERAL_RULE,
      ruleName: '新建一般规则',
      catalogTitle: '新建目录',
      nodeKey: 'categoryId',
      expandedList: [],
      itemId: '',
      itemName: '',
      showTable: false,
      tableLoading: false,
      showImportTip: false,
      ruleTipList: [],
      fileList: [],
      uploadShow: false,
      treeKey: '',
      showNew: false,
      discernEditable: true,
      activeDiscernId: null,
      catalogVisible: false,
      rules: {
        name: [
          { required: true, validator: nameValidatePass, trigger: 'blur' },
        ],
      },
      catalogForm: {
        path: '',
        categoryId: '',
        type: 'DISCERN_RULE',
        name: '',
      },
      defaultProps: {
        children: 'children',
        label: 'name',
      },
      treeData: [],
      keyword: '',
      ruleData: null,
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
      itemInfo: {},
    }
  },
  props: {
    hasMachine: {
      type: Boolean,
      default: true,
    },
  },
  watch: {
    treeKey(val) {
      this.$refs.tree.filter(val)
    },
    keyword(val) {
      if (!val) {
        this.form.page = 1
        this.getList()
      }
    },
  },
  mounted() {
    this.breadcrumbNodes = [
      {
        id: 1,
        name: '智能分类分级-识别规则',
      },
      {
        id: 2,
        name: this.ruleName,
      },
    ]
    this.itemId = this.$route.query.itemId
    this.itemName = this.$route.query.name
    if (this.itemId && this.itemName) {
      this.itemInfo = {
        id: this.itemId,
        name: this.itemName,
      }
      this.newRule()
    }
    this.initResizeHorizontal()
    this.getTree()
  },
  methods: {
    handleNodeExpand(data, node) {
      let flag = false
      this.expandedList.some(ele => {
        if (ele === data[this.nodeKey]) {
          flag = true
          return true
        }
      })
      if (!flag) {
        this.expandedList.push(data[this.nodeKey])
      }
    },
    handleNodeCollapse(data, node) {
      if (this.expandedList.indexOf(data[this.nodeKey]) !== -1) {
        const index = this.expandedList.findIndex(item => {
          return item === data[this.nodeKey]
        })
        this.expandedList.splice(index, 1)
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
        this.$blauShowFailure('只能上传xlsx格式的文件')
        return false
      }
    },
    handleRemove(file, fileList) {
      this.fileList = fileList
    },
    handleChange(file, fileList) {
      for (let i = 0; i < fileList.length; i++) {
        if (!this.checkFileValidation(fileList[i], ['xlsx'])) {
          this.$blauShowFailure('请选择xlsx格式文件')
          this.fileList = []
          this.$refs.calssifyUpload.showList = []
          this.$refs.calssifyUpload.$refs.upload.uploadFiles = []
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
        this.uploadShow = false
        // const errorListMap = file.response.data.errorListMap
        // const messageMap = file.response.data.messageMap
        // const errorTotal = file.response.data.failed
        // const successTotal = file.response.data.success
        // let newList = []
        // Object.keys(errorListMap).map(key => {
        //   let newMap = {}
        //   newMap.title = messageMap[key]
        //   newMap.type = 'error'
        //   // newMap.icon = 'success-icon'
        //   // newMap.icon = 'same-icon'
        //   newMap.icon = 'fail-icon'
        //   newMap.data = errorListMap[key]
        //   newMap.id = key
        //   newList.push(newMap)
        // })
        // if (errorTotal) {
        //   let newMap = {}
        //   newMap.title = `导入失败共${errorTotal}条`
        //   newMap.type = 'error'
        //   newMap.total = errorTotal
        //   newMap.icon = 'fail-icon'
        //   newMap.id = 'error'
        // }
        // if (successTotal) {
        //   let newMap = {}
        //   newMap.title = `导入成功共${successTotal}条`
        //   newMap.type = 'success'
        //   newMap.total = successTotal
        //   newMap.icon = 'success-icon'
        //   newMap.id = 'success'
        // }
        // this.ruleTipList = newList
        // if (errorTotal) {
        //   this.showImportTip = true
        // } else {
        //   this.$blauShowSuccess('导入成功')
        // }
        // if (successTotal) {
        //   this.getList()
        // }
        // console.log(file.response)
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
      this.itemInfo = {} // 清空
      this.$router.push({ query: {} })
      this.setHeightTree()
    },
    searchList() {
      this.form.page = 1
      this.getList()
    },
    getCatalogName(e) {
      // console.log(e.target.value)
    },
    setHeightTree() {
      this.$nextTick(() => {
        if (this.$refs.tree) {
          this.$refs.tree.setCurrentKey(this.heightCatalog.categoryId)
        }
      })
    },
    getTree(isRefresh = false, id = '') {
      API.getRuleTree()
        .then(async res => {
          if (res.data.length > 0) {
            await this.getTreeStructure(res.data, isRefresh, id)
            this.showTable = true
            this.setHeightTree()
            this.getList()
          } else {
            this.treeData = []
            this.ruleData = []
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getTreeStructure(treeList, isRefresh, id) {
      let newArray = []
      treeList.map(item => {
        if (item.parentId === 0) {
          newArray.push(item)
        }
      })
      arrToTree(treeList, newArray)
      function arrToTree(list, arr) {
        arr.forEach(res => {
          list.forEach((ret, index) => {
            if (res.categoryId === ret.parentId) {
              if (!res.hasOwnProperty('children')) {
                res.children = []
              }
              res.children.push(ret)
            }
          })
          if (res.hasOwnProperty('children')) {
            arrToTree(list, res.children)
          }
        })
      }
      this.treeData = newArray
      if (isRefresh) {
        this.heightCatalog = this.treeData[0]
        this.curCatalog = this.treeData[0]
      } else {
        if (id) {
          this.heightCatalog = treeList.find(
            item => parseFloat(item.categoryId) === parseFloat(id)
          )
          this.curCatalog = this.heightCatalog
        } else {
          this.heightCatalog = this.treeData[0]
          this.curCatalog = this.treeData[0]
        }
      }
      return newArray
    },
    sureName() {
      this.catalogForm.name = this.catalogForm.name.replace('/', '')
      this.$refs.catalogForm.validate(valid => {
        if (valid) {
          if (this.catalogForm.categoryId) {
            let params = this.catalogForm
            params.parentId = this.curCatalog.parentId
            // console.log(params)
            // return
            API.modifyRuleCatalog(this.catalogForm.categoryId, params)
              .then(res => {
                this.$message.success('修改目录成功')
                this.catalogVisible = false
                this.getTree(false, this.catalogForm.categoryId)
              })
              .catch(e => {
                this.$showFailure(e)
              })
          } else {
            let params = this.catalogForm
            params.parentId = this.curCatalog.categoryId
              ? this.curCatalog.categoryId
              : ''
            API.newRuleCatalog(this.catalogForm)
              .then(res => {
                this.$message.success('目录创建成功')
                this.catalogVisible = false
                if (
                  !this.expandedList.includes(
                    parseFloat(this.curCatalog.categoryId)
                  )
                ) {
                  this.expandedList.push(parseFloat(this.curCatalog.categoryId))
                }
                this.getTree(false, res.data.categoryId)
              })
              .catch(e => {
                this.$showFailure(e)
              })
          }
        }
      })
    },
    handleNodeClick(data) {
      this.heightCatalog = data
      this.curCatalog = data
      this.getList()
    },
    exportRule() {
      if (this.ruleData.length > 0) {
        // 识别规则导出
        API.exportRules().then(res => {
          this.$bus.$emit('getTaskJobResult', res.data, 'export')
        })
      } else {
        this.$datablauMessage.warning(`识别规则为空，不允许导出`)
      }
    },
    modelDownload() {
      const url = this.$url + `/service/datasecurity/rule/download`
      this.$downloadFilePost(url, {})
    },
    callbottomContent(evt) {
      const x = evt.clientX
      const y = evt.clientY
      const options = []
      this.curCatalog = {}
      options.push(
        {
          icon: 'iconfont icon-tianjia',
          label: '新建目录',
          callback: data => {
            this.resetForm()
            this.catalogTitle = '新建目录'
            this.catalogVisible = true
          },
        },
        {
          icon: 'iconfont icon-export',
          label: '导出规则',
          callback: () => {
            this.exportRule()
          },
        },
        {
          icon: 'iconfont icon-import',
          label: '导入规则',
          callback: () => {
            this.uploadShow = true
          },
        }
      )
      if (options.length > 0) {
        let yOfResult = y
        let bottomMargin = 30 * options.length + 15
        if (window.innerHeight - y < bottomMargin) {
          yOfResult = window.innerHeight - bottomMargin
        }
        this.$bus.$emit('callContextMenu', {
          x: x,
          y: yOfResult,
          options: options,
        })
      }
    },
    dataIconFunction(data, node) {
      if (node.expanded) {
        return 'iconfont icon-openfile'
      } else {
        return 'iconfont icon-file'
      }
    },
    dataOptionsFunction(data) {
      const options = []
      if (this.$auth.DATA_SECURITY_DISCERN_RULE_MANAGE) {
        let label = ''
        if (data.name) {
          label =
            data.name.length < 10 ? data.name : data.name.slice(0, 8) + '...'
        }
        options.push({
          icon: 'iconfont icon-tianjia',
          label: '新建子级',
          callback: () => {
            this.resetForm()
            this.catalogTitle = '新建目录'
            this.curCatalog = data
            this.catalogVisible = true
          },
          args: 'folder',
        })
        options.push({
          icon: 'iconfont icon-revise',
          label: '修改目录',
          callback: () => {
            this.catalogTitle = '修改目录'
            this.curCatalog = data
            this.modifyFolder(data)
          },
          args: 'folder',
        })
        options.push({
          icon: 'iconfont icon-delete',
          label: '删除目录',
          callback: () => {
            this.handleDel(data)
          },
          args: 'folder',
        })
      }
      return options
    },
    handleDel(data) {
      this.$DatablauCofirm(`是否确认删除目录“${data.name}”`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        API.delRule(data.categoryId)
          .then(res => {
            this.$datablauMessage.success('删除目录成功')
            this.getTree(false, data.parentId)
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
    resetForm() {
      this.catalogForm = {
        path: '',
        categoryId: '',
        name: '',
        type: 'DISCERN_RULE',
      }
    },
    modifyFolder(data) {
      this.catalogForm = {
        path: data.path,
        categoryId: data.categoryId,
        name: data.name,
        type: 'DISCERN_RULE',
      }
      this.catalogVisible = true
    },
    filterNode(value, data, node) {
      if (!value) return true
      if (data.type === 'ALL' || data.type === 'ALLFILE') {
        return true
      }
      let current = node
      do {
        if (this.$MatchKeyword(current.data, value, 'name')) {
          return true
        }
        current = current.parent
      } while (current && current.data.name)
      return false
    },
    handleRuleChange(selection) {
      this.ruleSelections = selection
    },
    handleCommand(command) {
      this.ruleType = command
      switch (command) {
        case ruleTypeEnum.GENERAL_RULE:
          this.ruleName = '新建一般规则'
          break
        case ruleTypeEnum.CONSANGUINITY_CASCADE:
          this.ruleName = '新建血缘级联规则'
          break
        case ruleTypeEnum.MACHINE_LEARNING:
          this.ruleName = '新建机器学习规则'
          break
        default:
          break
      }
      this.newRule()
    },
    async newRule() {
      this.ruleSelections = []
      await this.resetForm()
      this.activeDiscernId = ''
      this.showNew = true
      this.discernEditable = true
      this.setBreadcrumb()
    },
    editRule(row) {
      switch (row.ruleType) {
        case ruleTypeEnum.GENERAL_RULE:
          this.ruleName = '编辑一般规则'
          break
        case ruleTypeEnum.CONSANGUINITY_CASCADE:
          this.ruleName = '编辑血缘级联规则'
          break
        case ruleTypeEnum.MACHINE_LEARNING:
          this.ruleName = '编辑机器学习规则'
          break
        default:
          this.ruleName = '编辑一般规则'
          break
      }
      this.ruleType = row.ruleType ? row.ruleType : ruleTypeEnum.GENERAL_RULE
      this.ruleSelections = []
      this.showNew = true
      this.discernEditable = true
      this.activeDiscernId = row.ruleId
      this.setBreadcrumb()
    },
    setBreadcrumb() {
      this.breadcrumbNodes.splice(1, 1, {
        id: 2,
        name: this.ruleName,
      })
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
                this.$DatablauCofirm(
                  '当前规则被即将执行的任务所引用，确认是否修改？',
                  '提示',
                  {
                    type: 'warning',
                    cancelButtonText: '取消',
                    confirmButtonText: '确定',
                  }
                )
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
          this.ruleName = '查看一般规则'
          break
        case ruleTypeEnum.CONSANGUINITY_CASCADE:
          this.ruleName = '查看血缘级联规则'
          break
        case ruleTypeEnum.MACHINE_LEARNING:
          this.ruleName = '查看机器学习规则'
          break
        default:
          this.ruleName = '查看一般规则'
          break
      }
      this.ruleType = row.ruleType ? row.ruleType : ruleTypeEnum.GENERAL_RULE
      this.ruleSelections = []
      this.showNew = true
      this.discernEditable = false
      this.activeDiscernId = row.ruleId
      this.setBreadcrumb()
    },
    del(row) {
      this.$DatablauCofirm(`是否确认删除？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        const idList = [row.ruleId]
        this.delRuleList(idList)
      })
    },
    handleDelete() {
      this.$DatablauCofirm(
        `选中“${this.ruleSelections.length}条”，是否确认删除吗`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).then(() => {
        let idList = []
        this.ruleSelections.map(item => {
          idList.push(item.ruleId)
        })
        this.delRuleList(idList)
      })
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
            this.$blauShowFailure(
              `有即将执行的任务引用“${nameList.join('，')}”规则，不允许被删除`
            )
          } else {
            this.$blauShowSuccess('删除成功')
          }
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
        catalogId: this.heightCatalog.categoryId,
      }
      API.getRuleList(params)
        .then(res => {
          this.tableLoading = false
          this.total = res.data.data.total
          this.ruleData = res.data.data.rules
        })
        .catch(e => {
          this.ruleData = []
          this.tableLoading = false
          this.$showFailure(e)
        })
    },
    discernClick(name, params) {
      switch (name) {
        case 'new':
          this.itemInfo = {} // 清空
          this.$router.push({ query: {} })
          if (params.type === 'cancel') {
            this.showNew = false
          } else {
            if (params.type === 'submit') {
              this.showNew = false
              this.$datablauMessage.success('新建成功')
            }
            if (params.type === 'save') {
              this.showNew = false
              this.$datablauMessage.success('保存成功')
            }
            this.heightCatalog = params.data
            this.curCatalog = params.data
          }
          this.setHeightTree()
          this.getList()
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
