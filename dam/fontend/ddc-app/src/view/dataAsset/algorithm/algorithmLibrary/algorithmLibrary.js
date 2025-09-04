import newAlgorithm from './components/newAlgorithm.vue'
import detail from './components/detail.vue'
import API from '@/view/dataAsset/utils/s_api'
import ResizeHorizontal from '@/components/common/ResizeHorizontal'
import catalogTree from '../../intelligence/components/catalogTree.vue'
import { delObjMethod } from '@/view/dataAsset/utils/util.js'
export default {
  components: {
    newAlgorithm,
    detail,
    catalogTree,
  },
  data() {
    return {
      listShow: true,
      catalogId: 0,
      showMap: {},
      showTip: false,
      uploadShow: false,
      ruleTipList: [],
      fileList: [],
      tableLoading: true,
      keyword: '',
      tableData: [],
      selections: [],
      page: 1,
      size: 20,
      total: 0,
      sort: '',
      orderBy: 'createTime',
      newShow: false,
      isView: false,
      breadcrumbNodes: [],
      curName: '',
      algorithmId: '',
      isEdit: false,
      typeList: [
        {
          type: 'USER_DEFINED',
          value: '自定义',
        },
        {
          type: 'BUILT_IN',
          value: '内置',
        },
      ], // 算法库类型
      currentNode: {}, // 高亮目录
      catalogLen: 0,
    }
  },
  watch: {
    keyword(val) {
      if (!val) {
        this.handleSearch()
      }
    },
  },
  mounted() {
    this.initResizeHorizontal()
    // this.getList()
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
    clickTree(name, options) {
      switch (name) {
        case 'catalogTree':
          this.catalogLen = options.catalogLen
          this.page = 1
          this.currentNode = options.data
          this.catalogId = options.data.catalogId || 0
          this.getList()
          break
        case 'listShow':
          this.listShow = false
          break
        default:
          break
      }
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
    moreHandle(command) {
      switch (command) {
        case 'import':
          this.uploadShow = true
          break
        case 'export':
          this.exportAlgorithm(true)
          break
        default:
          break
      }
    },
    exportAlgorithm(isAll = false) {
      let params
      if (isAll) {
        params = {
          catalogId: this.catalogId || 0,
          searchStr: this.keyword,
        }
        API.exportAllAlgorithm(params).then(res => {
          this.$refs.table.clearSelection()
          this.$bus.$emit('getTaskJobResult', res.data, 'export')
        })
      } else {
        params = this.selections.map(item => item.algorithmId)
        API.exportSelectedAlgorithm(params).then(res => {
          this.$refs.table.clearSelection()
          this.$bus.$emit('getTaskJobResult', res.data, 'export')
        })
      }
    },
    uploadSure() {
      this.$refs.algorithmUpload.$refs.upload.submit()
    },
    // 下载算法模板
    modelDownload() {
      const url = `/assets/discern/algorithm/download`
      this.$downloadFilePost(url, {}, '算法模板')
    },
    checkFileValidation(file, supported) {
      const fileName = file.name
      const splitedName = fileName.split('.')
      const puffix = splitedName[splitedName.length - 1]
      return supported.indexOf(puffix) !== -1
    },
    beforeUpload(file) {
      if (!this.checkFileValidation(file, ['xlsx'])) {
        this.$datablauMessage.error('请选择xlsx或csv格式文件')
        return false
      }
    },
    // 导入文件上传失败
    handleUploadError(e) {
      this.uploadShow = false
      this.$showUploadFailure(e)
    },
    handleRemove(file, fileList) {
      this.fileList = fileList
    },
    // 上传时，文件变化的回调
    handleChange(file, fileList) {
      for (let i = 0; i < fileList.length; i++) {
        if (!this.checkFileValidation(fileList[i], ['xlsx'])) {
          this.$datablauMessage.error('请选择xlsx格式文件')
          this.fileList = []
          this.$refs.algorithmUpload.showList = []
          this.$refs.algorithmUpload.$refs.upload.uploadFiles = []
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
        this.$bus.$emit('getTaskJobResult', file.response, 'import')
        this.page = 1
        this.catalogId = 0
        this.getList()
      }
    },
    sortChange(data) {
      this.orderBy = data.prop
      this.sort = data.order
      this.page = 1
      this.getList()
    },
    getType(type) {
      if (type) {
        const resuleList = this.typeList.filter(item => item.type === type)
        const result = resuleList[0].value
        return result
      } else {
        return ''
      }
    },
    handleSearch() {
      this.page = 1
      this.getList()
    },
    goBack() {
      this.newShow = false
      this.setCurrentKey()
    },
    getList() {
      this.tableLoading = true
      const params = {
        catalogId: this.catalogId || 0,
        pageNum: this.page,
        pageSize: this.size,
        searchStr: this.keyword,
        sort: this.sort === 'ascending' ? 'ASC' : 'DESC', // ASC/DESC
        orderBy: this.orderBy,
      }
      API.getAlgorithmList(params)
        .then(res => {
          this.listShow = true
          this.tableLoading = false
          this.total = res.data.data.total
          this.tableData = res.data.data.algorithms || []
        })
        .catch(e => {
          this.listShow = false
          this.tableLoading = false
          this.$showFailure(e)
        })
    },
    addAlgorithm() {
      this.selections = []
      this.curName = '新建算法'
      this.setBreadcrumb()
      this.isEdit = false
      this.isView = false
      this.newShow = true
    },
    handleTableChange(data) {
      this.selections = data
    },
    editAlgorithm(row) {
      this.selections = []
      this.curName = '编辑算法'
      this.setCurBreadcrumb(row.catalogPath)
      this.isEdit = true
      this.algorithmId = row.algorithmId
      this.isView = false
      this.newShow = true
    },
    handleEdit(row) {
      const params = {
        type: 'algorithmId',
        id: row.algorithmId,
      }
      API.judgeTaskRun(params)
        .then(res => {
          API.judgeAlgorithm(row.algorithmId)
            .then(res => {
              if (res.data.data) {
                this.editAlgorithm(row)
              } else {
                this.$DatablauCofirm('当前算法被规则所引用，确认是否修改？')
                  .then(() => {
                    this.editAlgorithm(row)
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
    handleView(row) {
      this.selections = []
      this.curName = '查看算法'
      this.setCurBreadcrumb(row.catalogPath)
      this.algorithmId = row.algorithmId
      this.isView = true
      this.newShow = true
    },
    handleDel(row) {
      const delParams = {
        this: this,
        objName: '算法',
        name: row.algorithmName,
        type: 'single',
      }
      delObjMethod(delParams).then(() => {
        const idList = [row.algorithmId]
        this.delAlgorithm(idList)
      })
    },
    handleDelete() {
      const delParams = {
        this: this,
        objName: '算法',
        type: 'multiple',
        num: this.selections.length,
      }
      delObjMethod(delParams).then(() => {
        let idList = []
        this.selections.map(item => {
          idList.push(item.algorithmId)
        })
        this.delAlgorithm(idList)
      })
    },
    handleData(data) {
      const tipMap = data.tipMap
      data.mapList.map(item => {
        if (item.type === 'array') {
          let list = []
          Object.keys(tipMap[item.prop]).map(m => {
            list.push(tipMap[item.prop][m])
          })
          item.list = list
        }
        if (item.type === 'number') {
          if (tipMap[item.prop]) {
            item.num = tipMap[item.prop]
          } else {
            item.num = 0
          }
        }
      })
      const flag = data.mapList.some(
        item => item.type === 'array' && item.list.length > 0
      )
      this.showMap = data
      if (flag) {
        this.showTip = true
      } else {
        this.$datablauMessage.success('删除成功')
      }
    },
    delAlgorithm(ids) {
      API.delAlgorithm(ids)
        .then(async res => {
          this.showMap = {}
          let mapList = [
            {
              tip: '',
              name: '成功删除',
              icon: 'error',
              type: 'number',
              prop: 'sucNums',
            },
            {
              tip: '父算法下有子算法，不允许删除父算法',
              type: 'array',
              name: '失败删除',
              icon: 'error',
              prop: 'hasChildren',
            },
            {
              tip: '算法已被识别规则引用，不允许被删除',
              type: 'array',
              icon: 'error',
              name: '失败删除',
              prop: 'ref',
            },
          ]
          this.showMap.mapList = mapList
          this.showMap.tipMap = res.data.data
          await this.handleData(this.showMap)
          this.$refs.table.clearSelection()
          this.page = 1
          this.getList()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handlePageChange(val) {
      this.page = val
      this.getList()
    },
    handleSizeChange(val) {
      this.size = val
      this.page = 1
      this.getList()
    },
    setCurrentKey() {
      this.$nextTick(() => {
        this.$refs.catalogTree.resetId = this.currentNode.catalogId
      })
    },
    algorithmClick(name, params) {
      this.page = 1
      switch (name) {
        case 'new':
          if (params.type === 'cancel') {
            this.newShow = false
          }
          this.setCurrentKey()
          break
        default:
          break
      }
    },
  },
}
