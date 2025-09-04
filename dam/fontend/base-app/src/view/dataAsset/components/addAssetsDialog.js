import api from '../utils/api'
import HTTP from '@/http/main.js'
import { AssetsTypeEnum } from '@/view/dataAsset/utils/Enum'
import isShowTooltip from '@/view/dataProperty/meta/isShowTooltip.vue'
import {
  IndexTypeLabel,
  IndexTypeLabelEn,
  IndexType,
} from '@/view/dataIndex/indexManagement/indexDefinition/class/Enum'
export default {
  name: 'dataItemDialog',
  components: {
    isShowTooltip,
  },
  props: {
    title: {
      type: String,
      default: '',
    },
    visible: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: AssetsTypeEnum.TABLE,
    },
    defaultProps: {
      type: Object,
      default: () => {
        return {}
      },
    },
    addedAssets: {
      // 已绑定过的资产集合
      type: Object,
      default() {
        return {}
      },
    },
    addAsset: {
      type: Function,
    },
    currentNode: {
      type: Object,
      default() {},
    },
    addNodeparams: {
      type: Object,
      default() {},
    },
    currentStructure: {
      type: Object,
      default() {},
    },
    allCatalogs: {
      type: Object,
      default() {},
    },
  },
  computed: {
    IndexTypeLabel() {
      if (this.$i18n.locale === 'en') {
        return IndexTypeLabelEn
      } else {
        return IndexTypeLabel
      }
    },
    appTypes() {
      // 报表类型
      const result = [
        {
          label: this.$t('assets.assetList.all'),
          text: this.$t('assets.assetList.all'),
          value: 'all',
        },
        {
          label: this.$t('assets.assetList.analysis'),
          text: this.$t('assets.assetList.analysis'),
          value: 'Analysis',
        },
        {
          label: this.$t('assets.assetList.dataReport'),
          text: this.$t('assets.assetList.dataReport'),
          value: 'Report',
        },
        {
          label: this.$t('assets.assetList.detailedList'),
          text: this.$t('assets.assetList.detailedList'),
          value: 'List',
        },
      ]
      return result
    },
    datasetType() {
      const result = [
        {
          id: 1,
          name: this.$t('assets.gateway.table'),
          select: true,
          type: 'TABLE',
          typeId: '80000004',
        },
        {
          id: 2,
          name: this.$t('assets.gateway.view'),
          select: true,
          type: 'VIEW',
          typeId: '80500008',
        },
      ]
      return result
    },
  },
  data() {
    return {
      codeCatalogName: '',
      AssetsTypeEnum: AssetsTypeEnum,
      datasetList: [],
      curReportList: [],
      BASE: '/domain', // 指标API的url公共前缀
      noTreeList: [AssetsTypeEnum.DATA_OBJECT],
      catalogueKey: '',
      treeLoading: false,
      tableLoading: false,
      expandedKeys: [],
      assetsKeyword: '',
      assetsData: undefined,
      assetPagination: {
        total: 0,
        currentPage: 1,
        pageSize: 10,
      },
      selectedAssets: [],
      treeData: [],
      tableOptions: [],
      tableName: '',
      tableKeyword: '',
      columns: [],
      // 数据表获取list相关参数
      modelId: '',
      schema: '',
      fromreList: [],
      allFromreList: [],
      // 数据项
      // 数据标准
      foldId: '', // 左侧树文件id
      department: '',
      departmentFullName: '',
      reportKeyword: '',
      reportList: [],
      reportType: '', // 报表类型筛选
      allReportList: {},
      currentNodeKey: null,
      // 指标
      indexKeyword: '',
      // 数据服务
      applyWord: '',
      serviceGroup: '',
      // 文件
      fileName: '',
      fileTreeId: '',
      height: 530,
      deptId: '', // 技术部门id
      deptName: '', // 技术部门name
      tablePage: 1,
      selectTableLoading: false,
      selectTotal: 0,
      modelPage: 1,
      modelLoading: false,
      modelTotal: 0,
    }
  },
  mounted() {
    this.getModel()
  },
  methods: {
    filterNode(value, data, node) {
      if (!value) return true
      let current = node
      if (this.type === AssetsTypeEnum.FILE) {
        do {
          if (this.$MatchKeyword(current.data, value, 'nodeName')) {
            return true
          }
          current = current.parent
        } while (current && current.data.nodeName)
        return false
      } else if (this.type === AssetsTypeEnum.DATA_SERVICE) {
        do {
          if (this.$MatchKeyword(current.data, value, 'apiCatalog')) {
            return true
          }
          current = current.parent
        } while (current && current.data.nodeName)
        return false
      } else {
        do {
          if (this.$MatchKeyword(current.data, value, 'name')) {
            return true
          }
          current = current.parent
        } while (current && current.data.name)
        return false
      }
    },
    initData(name) {
      switch (name) {
        case AssetsTypeEnum.TABLE:
        case AssetsTypeEnum.VIEW:
          this.columns = [
            {
              prop: 'tableName',
              label: this.$t('assets.assetList.dataName'),
              minWidth: '150px',
            },
            {
              prop: 'system',
              label: this.$t('assets.assetList.businessSystem'),
              minWidth: '120px',
            },
            {
              prop: 'parentPhysicalName',
              label: this.$t('assets.assetList.dataSource'),
              minWidth: '120px',
            },
            {
              prop: 'time',
              label: this.$t('assets.assetList.creationTime'),
              minWidth: '120px',
            },
          ]
          this.getTree()
          this.getList()
          break
        case AssetsTypeEnum.DATA_OBJECT:
          this.columns = [
            {
              prop: 'tableName',
              label: this.$t('assets.assetList.dataItemName'),
              minWidth: '150px',
            },
            {
              prop: 'type',
              label: this.$t('assets.assetList.dataTypes'),
              minWidth: '120px',
            },
            {
              prop: 'domainName',
              label: this.$t('assets.assetList.dataStandard'),
              minWidth: '120px',
            },
            {
              prop: 'tagNames',
              label: this.$t('assets.assetList.tags'),
              minWidth: '120px',
            },
          ]
          this.getList()
          this.getDataItem()
          break
        case AssetsTypeEnum.DATA_STANDARD:
          this.getTree()
          this.getStandardData()
          break
        case AssetsTypeEnum.DATA_STANDARD_CODE:
          this.getTree()
          this.getCodeData()
          break
        case AssetsTypeEnum.REPORT:
          // 报表
          this.columns = [
            {
              prop: 'code',
              label: this.$t('assets.assetList.reportNo'),
              minWidth: '120px',
            },
            {
              prop: 'name',
              label: this.$t('assets.assetList.reportName'),
              minWidth: '150px',
            },
            {
              prop: 'reportType',
              label: this.$t('assets.assetList.reportType'),
              minWidth: '120px',
            },
            {
              prop: 'owner',
              label: this.$t('assets.assetList.owner1'),
              minWidth: '120px',
            },
            {
              prop: 'time',
              label: this.$t('assets.assetList.creationTime'),
              minWidth: '150px',
            },
          ]
          this.getTree()
          break
        case AssetsTypeEnum.DATA_SERVICE:
          this.columns = [
            {
              prop: 'name',
              label: this.$t('assets.assetList.apiName'),
              minWidth: '120px',
            },
            {
              prop: 'description',
              label: this.$t('assets.assetList.applyDes'),
              minWidth: '200px',
            },
            {
              prop: 'creator',
              label: this.$t('assets.assetList.owner'),
              minWidth: '120px',
            },
            {
              prop: 'time',
              label: this.$t('assets.assetList.creationTime'),
              minWidth: '120px',
            },
          ]
          this.getTree()
          this.getList()
          break
        case AssetsTypeEnum.FILE:
          this.columns = [
            {
              prop: 'fileName',
              label: this.$t('assets.assetList.fileName'),
              minWidth: '150px',
            },
            {
              prop: 'type',
              label: this.$t('assets.assetList.fileType'),
              minWidth: '120px',
            },
            {
              prop: 'size',
              label: this.$t('assets.assetList.fileSize'),
              minWidth: '120px',
            },
            {
              prop: 'time',
              label: this.$t('assets.assetList.creationTime'),
              minWidth: '120px',
            },
          ]
          this.getTree()
          this.getList()
          break
        case AssetsTypeEnum.INDEX:
          this.columns = [
            {
              prop: 'name',
              label: this.$t('assets.assetList.indexName'),
              minWidth: '150px',
            },
            {
              prop: 'domainCode',
              label: this.$t('assets.assetList.indexCode'),
              minWidth: '120px',
            },
            {
              prop: 'measureUnit',
              label: this.$t('assets.assetList.measurementName'),
              minWidth: '120px',
            },
            {
              prop: 'type',
              label: this.$t('assets.assetList.indexType'),
              minWidth: '120px',
            },
          ]
          this.getTree()
          this.getIndexData()
          break
        default:
          break
      }
    },
    getModel() {
      this.modelLoading = true
      const params = {
        categoryId: '',
        currentPage: this.modelPage,
        modelName: '',
        pageSize: 20,
      }
      api.getFromre(params).then(res => {
        this.modelLoading = false
        this.modelTotal = res.data.totalItems
        if (this.modelPage !== 1) {
          this.fromreList = this.fromreList.concat(res.data.content)
        } else {
          this.fromreList = res.data.content
        }
        this.allFromreList = this.fromreList
      })
    },
    modelloading() {
      if (this.modelPage * 20 >= this.modelTotal) return
      this.modelPage++
      this.getModel()
    },
    // 添加数据项检索中获取数据表数据
    getDataItem(defaultParams) {
      this.selectTableLoading = true
      const params = {
        currentPage: this.tablePage,
        keyword: this.tableName,
        modelId: this.modelId,
        pageSize: 10,
        schema: '',
        sortByCreateTime: null,
        sortByName: null,
        tagIds: null,
        typeIds: ['80000004', '80500008'],
        ...defaultParams,
        // types: ['TABLE', 'VIEW'],
      }
      this.getData(params).then(res => {
        if (defaultParams) {
          if (defaultParams.keyword === this.tableKeyword) {
            this.selectTableLoading = false
            this.selectTotal = res.data.totalItems
            if (this.tablePage !== 1) {
              this.tableOptions = this.tableOptions.concat(res.data.content)
            } else {
              this.tableOptions = res.data.content
            }
          } else {
            this.tableOptions = []
          }
        } else {
          this.selectTableLoading = false
          this.selectTotal = res.data.totalItems
          if (this.tablePage !== 1) {
            this.tableOptions = this.tableOptions.concat(res.data.content)
          } else {
            this.tableOptions = res.data.content
          }
        }
      })
    },
    lazyloading() {
      console.log(88)
      if (this.tablePage * 10 >= this.selectTotal) return
      this.tablePage++
      this.getDataItem({
        keyword: this.tableKeyword,
      })
    },
    tableSelect(val) {
      this.tablePage = 1
      // this.tableName = val
      this.tableKeyword = val
      this.getDataItem({
        keyword: val,
      })
    },
    getTree() {
      this.treeLoading = true
      if (
        this.type === AssetsTypeEnum.TABLE ||
        this.type === AssetsTypeEnum.VIEW
      ) {
        // 数据集
        this.$http
          .get(this.$url + '/service/models/modeltree')
          .then(res => {
            this.treeLoading = false
            if (res.data.subNodes) {
              const modelTree = _.cloneDeep(res.data.subNodes)
              modelTree.forEach(dep => {
                if (dep.subNodes) {
                  dep.subNodes.forEach(cat => {
                    if (cat.subNodes) {
                      cat.subNodes.forEach(model => {
                        delete model.subNodes
                      })
                    }
                  })
                }
              })
              // this.getModCatMap(res.data)
              this.treeData = this.treeSort(res.data)
            }
          })
          .catch(err => {
            this.treeLoading = false
            this.$showFailure(err)
          })
      }
      // 基础标准左侧树
      if (this.type === AssetsTypeEnum.DATA_STANDARD) {
        this.getStandardDataTree()
      }
      // 标准代码左侧树
      if (this.type === AssetsTypeEnum.DATA_STANDARD_CODE) {
        this.getStandardCodeTree()
      }
      // 指标
      if (this.type === AssetsTypeEnum.INDEX) {
        HTTP.getDomainTreeDetailService({
          onlyFolder: true,
          categoryId: 2, // 标准1， 指标2
        })
          .then(res => {
            this.treeLoading = false
            this.treeData = [res.data] || []
          })
          .catch(e => {
            this.treeLoading = false
            this.$showFailure(e)
          })
      }
      // 报表
      if (this.type === AssetsTypeEnum.REPORT) {
        this.$http
          .get(`${this.$meta_url}/service/dataReport/tree`)
          .then(res => {
            this.treeLoading = false
            const data = res.data
            this.allReportList = data
            this.treeData = (data && data.nodes) || []
            this.curReportList = data
            this.showCatalogDetail(data)
          })
          .catch(e => {
            this.treeLoading = false
            this.$showFailure(e)
          })
      }
      if (this.type === AssetsTypeEnum.DATA_SERVICE) {
        this.$http
          .get(`${this.$url}/service/api/catalogs`)
          .then(res => {
            this.treeLoading = false
            res.data.map(item => {
              item.nodes = []
            })
            if (res.data.length > 0) {
              let nowMap = {
                apiCatalog: this.$t('assets.assetList.allDataServices'),
                id: 0,
                nodes: res.data,
              }
              this.treeData = [nowMap]
            } else {
              this.treeData = []
            }
          })
          .catch(e => {
            this.treeLoading = false
            this.$showFailure(e)
          })
      }
      if (this.type === AssetsTypeEnum.FILE) {
        this.$http
          .get(`${this.$url}/service/filetree/tree`)
          .then(res => {
            this.treeLoading = false
            this.treeData = res.data && res.data[0].nodes
          })
          .catch(e => {
            this.treeLoading = false
            this.$showFailure(e)
          })
      }
    },
    getList() {
      this.tableLoading = true
      let params = {
        currentPage: this.assetPagination.currentPage,
        keyword: this.assetsKeyword,
        modelId: this.modelId,
        pageSize: this.assetPagination.pageSize,
        schema: this.modelId ? this.schema : '',
        sortByCreateTime: null,
        sortByName: null,
        tagIds: null,
        types: null,
      }
      switch (this.type) {
        case AssetsTypeEnum.TABLE:
          params.typeIds = [80000004]
          break
        case AssetsTypeEnum.VIEW:
          params.typeIds = [80500008]
          break
        case AssetsTypeEnum.DATA_OBJECT:
          params.typeIds = ['80000005']
          break
        case AssetsTypeEnum.DATA_SERVICE:
          params = {
            currentPage: this.assetPagination.currentPage - 1,
            group: this.serviceGroup,
            name: this.applyWord,
            pageSize: this.assetPagination.pageSize,
            status: 0,
            testStatus: null,
          }
          break
        case AssetsTypeEnum.FILE:
          params = {
            currentPage: this.assetPagination.currentPage,
            desc: false,
            fileName: this.fileName,
            pageSize: this.assetPagination.pageSize,
            sortField: 'lastModifyTime',
            treeId: this.fileTreeId,
          }
          break
        default:
          break
      }
      this.getData(params).then(res => {
        this.tableLoading = false
        this.assetPagination.total = res.data.totalItems
        const nowAddedAssets = this.addedAssets[this.type]
        let ids = []
        res.data.content.map(item => {
          if (nowAddedAssets && nowAddedAssets.length > 0) {
            item.disabled =
              nowAddedAssets.indexOf(String(item.objectId || item.id)) !== -1
          }

          if (
            this.type === AssetsTypeEnum.TABLE ||
            this.type === AssetsTypeEnum.VIEW
          ) {
            item.tableName =
              item.physicalName +
              (item.logicalName ? '(' + item.logicalName + ')' : '')
            item.system = !this.$modelCategoriesDetailsMap[item.modelCategoryId]
              ? '--'
              : this.$modelCategoriesDetailsMap[item.modelCategoryId]
                  .displayName
            item.time = this.$timeFormatter(item.creationTime)
          }
          if (this.type === AssetsTypeEnum.DATA_OBJECT) {
            item.tableName =
              item.physicalName +
              (item.logicalName ? '(' + item.logicalName + ')' : '')
            item.domainName = item.domainName ? item.domainName : '--'
            ids.push(parseInt(item.objectId))
          }
          if (this.type === AssetsTypeEnum.DATA_SERVICE) {
            item.time = this.$timeFormatter(item.createTime)
          }
          if (this.type === AssetsTypeEnum.FILE) {
            item.tableName = item.physicalName
            item.size = this.$fileSizeFormatter(item.size)
            item.time = this.$timeFormatter(item.createTime)
          }
        })
        // this.getColumnType(ids)
        if (this.type === AssetsTypeEnum.DATA_OBJECT) {
          const params = {
            objectIdList: ids,
          }
          this.$http
            .post(`${this.$url}/service/entities/column/type`, ids)
            .then(res1 => {
              res.data.content.map((item, index) => {
                res1.data = res1.data || []
                item.type = res1.data[index].type
              })
              this.assetsData = res.data.content || []
              this.$nextTick(() => {
                this.toggleRowSelection()
              })
            })
        } else {
          this.assetsData = res.data.content || []
          this.$nextTick(() => {
            this.toggleRowSelection()
          })
        }
      })
    },
    getData(params) {
      return new Promise((resolve, reject) => {
        if (this.type === AssetsTypeEnum.DATA_SERVICE) {
          this.$http
            .post(`${this.$url}/service/api/apis/search`, params)
            .then(res => {
              resolve(res)
            })
            .catch(e => {
              this.tableLoading = false
              this.$showFailure(e)
            })
        } else if (this.type === AssetsTypeEnum.FILE) {
          this.$http
            .post(this.$url + '/service/shareFile/folder/page', params)
            .then(res => {
              resolve(res)
            })
            .catch(e => {
              this.tableLoading = false
              this.$showFailure(e)
            })
        } else {
          this.$http
            .post(this.$meta_url + '/service/entities/searchMetadata', params)
            .then(res => {
              resolve(res)
            })
            .catch(e => {
              this.tableLoading = false
              this.$showFailure(e)
            })
        }
      })
    },
    // 数据表树排序
    treeSort(root) {
      const t = root.subNodes
      if (t != null) {
        this.sortByName(root)
        t.forEach(item => {
          this.sortByName(item)
          item.subNodes &&
            item.subNodes.forEach(c => {
              if (c.type === 'MODEL_CATEGORY') {
                c.id = 'c' + c.id
              }
              if (c.subNodes) {
                this.sortByName(c)
                c.subNodes.forEach(m => {
                  if (m.subNodes) {
                    this.sortByName(m)
                    m.subNodes.forEach(s => {
                      s.id += '_%_' + m.name + '_%_' + s.name
                    })
                  }
                })
              }
            })
        })
      }
      const index = t.findIndex(item => {
        return item.id === 'others'
      })
      if (index !== -1) {
        const others = t.splice(index, 1)
        t.push(others[0])
      }
      return t
    },
    sortByName(node) {
      const departments = node.subNodes
      this.$utils.sort.sortConsiderChineseNumber(departments)
    },
    dataIconFunction(data, node) {
      if (
        this.type === AssetsTypeEnum.TABLE ||
        this.type === AssetsTypeEnum.VIEW
      ) {
        if (data.type === 'IT_DEPART' || data.type === 'catlog') {
          if (node.expanded) {
            return 'iconfont icon-openfile'
          } else {
            return 'iconfont icon-file'
          }
        } else if (data.type === 'MODEL') {
          return 'iconfont icon-shujuyuan'
        } else if (data.type === 'SCHEMA') {
          return 'iconfont icon-schema'
        } else if (data.type === 'MODEL_CATEGORY') {
          return 'iconfont icon-xitong'
        } else {
          // console.error(data)
        }
      } else if (this.type === AssetsTypeEnum.DATA_STANDARD) {
        if (node.expanded) {
          return 'iconfont icon-openfile'
        } else {
          return 'iconfont icon-file'
        }
      } else if (this.type === AssetsTypeEnum.DATA_STANDARD_CODE) {
        if (data.type === 'code') {
          return 'tree-icon domain-code'
        } else {
          if (node.expanded) {
            return 'iconfont icon-openfile'
          } else {
            return 'iconfont icon-file'
          }
        }
      } else {
        if (node.expanded) {
          return 'iconfont icon-openfile'
        } else {
          return 'iconfont icon-file'
        }
      }
    },
    // 根据资产目录查询资产列表
    queryAssetsByDir(data) {
      this.curReportList = data
      let name = ''
      this.assetPagination.currentPage = 1
      this.currentNodeKey = data
      // 清空已选资产
      // this.$refs.assetsTable.clearSelection()
      if (
        this.type === AssetsTypeEnum.TABLE ||
        this.type === AssetsTypeEnum.VIEW
      ) {
        if (data.type === 'MODEL') {
          this.modelId = data.id
          this.schema = ''
          name = data.name
          this.getList()
        } else if (data.type === 'SCHEMA') {
          this.modelId = parseInt(data.id.split('_%')[0])
          this.schema = data.name
          name = data.id.split('_%_')[1]
          this.getList()
        } else if (data.type === 'MODEL_CATEGORY') {
          this.modelId = ''
          this.schema = ''
        } else if (data.type === 'catolog') {
          this.modelId = ''
          this.schema = ''
        } else if (data.type === 'IT_DEPART') {
          this.modelId = ''
          this.schema = ''
        }
        if (this.modelId) {
          const flag = this.fromreList.some(
            item => parseFloat(item.modelId) === parseFloat(this.modelId)
          )
          if (flag) {
          } else {
            this.allFromreList = _.clone(this.fromreList)
            const params = {
              modelId: this.modelId,
              definition: name,
            }
            this.allFromreList.push(params)
          }
        }
      }
      if (this.type === AssetsTypeEnum.DATA_STANDARD) {
        this.foldId = data.foldId
        this.getStandardData() // 刷新基础标准
      }
      if (this.type === AssetsTypeEnum.DATA_STANDARD_CODE) {
        this.foldId = data.foldId
        if (data.code) {
          this.codeCatalogName = data.name
          this.getCodeData() // 刷新标准代码
        } else {
          this.codeCatalogName = ''
          this.getCodeData() // 刷新标准代码
        }
      }
      if (this.type === AssetsTypeEnum.REPORT) {
        this.showCatalogDetail(data)
      }
      if (this.type === AssetsTypeEnum.DATA_SERVICE) {
        if (data.id === 0) {
          this.serviceGroup = ''
        } else {
          this.serviceGroup = data.apiCatalog
        }
        this.getList()
      }
      if (this.type === AssetsTypeEnum.INDEX) {
        this.foldId = data.foldId
        this.getIndexData()
      }
      if (this.type === AssetsTypeEnum.FILE) {
        this.fileTreeId = data.id
        this.getList()
      }
    },
    // 当选择数据表时，因为数据一次性请求完的，需要前端分页
    getDataItemList() {
      this.assetsData =
        this.datasetList.slice(
          this.assetPagination.pageSize *
            (this.assetPagination.currentPage - 1),
          this.assetPagination.pageSize * this.assetPagination.currentPage
        ) || []
      this.tableLoading = false
    },
    // 根据 assetsType 和 keyword 查询资产列表
    qureyAssets() {
      this.tablePage = 1
      this.assetPagination.currentPage = 1
      // 清空已选资产
      this.$refs.assetsTable.clearSelection()
      switch (this.type) {
        case AssetsTypeEnum.TABLE: // 表
        case AssetsTypeEnum.VIEW: // 视图
          this.getList()
          break
        case AssetsTypeEnum.DATA_OBJECT: // 数据项
          if (this.tableName) {
            this.tableLoading = true
            // 当选择数据表时，请求新接口获取字段
            this.$http
              .get(
                `${this.$url}/service/entities/${
                  this.tableName
                }/columns?keyword=${encodeURI(this.assetsKeyword)}`
              )
              .then(res => {
                this.tableLoading = false
                const nowAddedAssets = this.addedAssets[this.type]
                res.data.map(item => {
                  if (nowAddedAssets && nowAddedAssets.length > 0) {
                    item.disabled =
                      nowAddedAssets.indexOf(String(item.objectId)) !== -1
                  }
                  item.tableName =
                    item.physicalName +
                    (item.logicalName ? '(' + item.logicalName + ')' : '')
                  if (item.domains && item.domains.length > 0) {
                    item.domainName = item.domains[0].chineseName
                  } else {
                    item.domainName = '--'
                  }
                  if (item.tags && item.tags.length > 0) {
                    const tagNames = item.tags.map(e => e.name)
                    item.tagNames = tagNames
                  } else {
                    item.tagNames = []
                  }
                })
                this.assetPagination.total = res.data.length
                this.datasetList = res.data || []
                this.getDataItemList()
              })
          } else {
            this.getList()
          }
          break
        case AssetsTypeEnum.DATA_STANDARD:
          if (!this.departmentFullName) {
            this.department = ''
          }
          this.getStandardData()
          break
        case AssetsTypeEnum.DATA_STANDARD_CODE:
          this.getCodeData()
          break
        case AssetsTypeEnum.FILE:
          this.getList()
          break
        case AssetsTypeEnum.INDEX:
          this.getIndexData()
          break
        case AssetsTypeEnum.DATA_SERVICE:
          this.getList()
          break
        default:
          break
      }
    },
    queryReportAssets() {
      this.filterReportAssrts()
    },
    filterReportAssrts() {
      this.assetPagination.currentPage = 1
      this.assetPagination.pageSize = 10
      let newList = []
      if (!this.reportType || this.reportType === 'all') {
        if (this.reportKeyword) {
          newList = this.reportList.filter(item => {
            return (
              item.code.includes(this.reportKeyword) ||
              item.name.includes(this.reportKeyword)
            )
          })
        } else {
          newList = this.reportList
        }
        this.getNewReportList(newList)
      } else {
        newList = this.reportList.filter(item => {
          return item.type === this.reportType
        })
        if (this.reportKeyword) {
          newList = newList.filter(item => {
            return (
              item.code.includes(this.reportKeyword) ||
              item.name.includes(this.reportKeyword)
            )
          })
        }
        this.getNewReportList(newList)
      }
    },
    getAssetRowKeys(row) {
      let result = ''
      switch (this.type) {
        case AssetsTypeEnum.DATA_STANDARD:
          result = row.domainId
          break
        case AssetsTypeEnum.DATA_STANDARD_CODE:
          result = row.code
          break
        case AssetsTypeEnum.INDEX:
          result = row.domainId
          break
        default:
          result = row.id
          break
      }
      return result
    },
    // 注册资产 表格 选择回调
    selectAsset(list) {
      const newList = []
      let key = 'objectId'
      if (
        this.type === 'REPORT' ||
        this.type === 'FILE' ||
        this.type === 'DATA_SERVICE'
      )
        key = 'id'
      if (this.type === 'DATA_STANDARD' || this.type === 'INDEX')
        key = 'domainId'
      if (this.type === 'DATA_STANDARD_CODE') key = 'code'
      list.forEach(l => {
        if (this.addedAssets[this.type].indexOf(String(l[key])) === -1) {
          newList.push(l)
        }
      })
      // console.log(newList)
      newList.sort((a, b) => {
        a.id > b.id
      })
      newList.map(item => {
        if (this.type === AssetsTypeEnum.DATA_OBJECT) {
          item.name = item.physicalName
        }
        if (this.type === AssetsTypeEnum.FILE) {
          item.name = item.fileName
        }
      })
      this.selectedAssets = _.cloneDeep(newList)
      this.$nextTick(() => {
        if (this.selectedAssets.length > 0) {
          const itemH = this.$refs.selectedItems.offsetHeight
          this.height = 530 + itemH
        } else {
          this.height = 530
        }
      })
    },
    // 表格数据是否多页回显
    toggleRowSelection() {
      const selectedList = _.cloneDeep(this.selectedAssets)
      this.assetsData.forEach(row => {
        let selected = false
        switch (this.type) {
          case AssetsTypeEnum.DATA_STANDARD:
          case AssetsTypeEnum.INDEX:
            selected =
              selectedList.find(s => s.domainId === row.domainId) ||
              this.addedAssets[this.type].indexOf(String(row.domainId)) !== -1
            break
          case AssetsTypeEnum.DATA_STANDARD_CODE:
            selected =
              selectedList.find(s => s.code === row.code) ||
              this.addedAssets[this.type].indexOf(String(row.code)) !== -1
            break
          case AssetsTypeEnum.DATA_SERVICE:
          case AssetsTypeEnum.REPORT:
          case AssetsTypeEnum.FILE:
            selected =
              selectedList.find(s => s.id === row.id) ||
              this.addedAssets[this.type].indexOf(String(row.id)) !== -1
            break
          default:
            selected =
              selectedList.find(s => s.id === row.id) ||
              this.addedAssets[this.type].indexOf(String(row.objectId)) !== -1
            break
        }
        this.$refs.assetsTable.toggleRowSelection(row, Boolean(selected))
      })
      this.selectedAssets = selectedList
    },
    // 删除已选资产项
    handleRemoveAsset(index) {
      this.selectedAssets.splice(index, 1)
      this.toggleRowSelection()
    },
    // 资产表 size变化
    handleSizeChange(pageSize) {
      this.assetPagination.currentPage = 1
      this.assetPagination.pageSize = pageSize
      this.changeData()
    },
    changeData() {
      // 更新 assetsData
      switch (this.type) {
        case AssetsTypeEnum.DATA_STANDARD:
          this.getStandardData()
          break
        case AssetsTypeEnum.DATA_STANDARD_CODE:
          this.getCodeData()
          break
        case AssetsTypeEnum.INDEX:
          this.getIndexData()
          break
        case AssetsTypeEnum.REPORT:
          this.showCatalogDetail(this.curReportList)
          break
        case AssetsTypeEnum.DATA_OBJECT:
          if (this.tableName) {
            // 当选择数据表时，请求新接口获取字段
            this.getDataItemList()
          } else {
            this.getList()
          }
          break
        default:
          this.getList()
          break
      }
    },
    // 资产表 当前页改变
    handleCurrentChange(page) {
      this.assetPagination.currentPage = page
      this.changeData()
    },
    closeDialog() {
      this.selectedAssets = []
      this.assetsData = []
      this.$emit('cancel')
      this.$nextTick(() => {
        this.toggleRowSelection()
      })
    },
    getOwnership(type) {
      let assetType = ''
      switch (type) {
        case AssetsTypeEnum.TABLE:
        case AssetsTypeEnum.VIEW:
          assetType = '80000004'
          break
        default:
          break
      }
    },
    // 提交 已选的 资产数据
    submitAssets() {
      if (this.selectedAssets.length === 0) {
        this.$datablauMessage({
          message: '请选择数据资产',
          type: 'warning',
        })
        return
      }
      let objectId = []
      let objectName = []
      let objectIdView = []
      let objectNameView = []
      let objectDeptName = {}
      let deptIdMap = {}
      let subAssetsType = ''
      this.getOwnership(this.type)
      this.selectedAssets.map(item => {
        switch (this.type) {
          case AssetsTypeEnum.TABLE:
          case AssetsTypeEnum.VIEW:
            if (item.type === 'TABLE') {
              subAssetsType = AssetsTypeEnum.TABLE
              objectId.push(item.objectId)
              objectName.push(item.name)
            } else {
              subAssetsType = AssetsTypeEnum.VIEW
              objectIdView.push(item.objectId)
              objectNameView.push(item.name)
            }
            break
          case AssetsTypeEnum.DATA_OBJECT:
            subAssetsType = AssetsTypeEnum.DATA_OBJECT
            objectId.push(item.objectId)
            objectName.push(item.physicalName)
            break
          case AssetsTypeEnum.REPORT:
            subAssetsType = AssetsTypeEnum.REPORT
            objectId.push(item.id)
            objectName.push(item.name)
            break
          case AssetsTypeEnum.DATA_SERVICE:
            subAssetsType = AssetsTypeEnum.DATA_SERVICE
            objectId.push(item.id)
            objectName.push(item.name)
            break
          case AssetsTypeEnum.FILE:
            subAssetsType = AssetsTypeEnum.FILE
            objectId.push(item.id)
            objectName.push(item.fileName)
            break
          case AssetsTypeEnum.INDEX:
            subAssetsType = AssetsTypeEnum.INDEX
            objectId.push(item.domainId)
            objectName.push(item.chineseName)
            break
          case AssetsTypeEnum.DATA_STANDARD:
            subAssetsType = AssetsTypeEnum.DATA_STANDARD
            objectId.push(item.domainId)
            objectName.push(item.englishName)
            objectDeptName[item.domainId] = this.$modelCategoriesDetailsMap[
              item.categoryId
            ]
              ? this.$modelCategoriesDetailsMap[item.categoryId].itDepartment
              : ''
            break
          case AssetsTypeEnum.DATA_STANDARD_CODE:
            subAssetsType = AssetsTypeEnum.DATA_STANDARD_CODE
            objectId.push(item.code)
            objectName.push(item.name)
            break
          default:
            break
        }
      })
      let params = {
        subAssetsType,
        objectName,
        deptNameMap: objectDeptName,
        deptIdMap,
      }
      if (this.addNodeparams && this.addNodeparams.path) {
        // 点击数节点更多时添加数据资产
        params.catalogId = this.addNodeparams.id
        params.catalogPath = this.addNodeparams.path
        params.structureId = this.addNodeparams.structureId
      } else {
        // 当前树节点目录时添加数据资产
        params.catalogId = this.currentNode.id
        params.catalogPath = this.currentNode.catalogPath
        params.structureId = this.currentNode.structureId
      }
      const curTreeNode = this.allCatalogs[this.currentStructure.id]
      const curNode = curTreeNode[params.catalogId]
      const nodeIdList = curNode.catalogPath.split('/')
      let resultName = nodeIdList.map(item => {
        if (parseInt(item)) {
          return curTreeNode[item].name
        }
      })
      resultName.shift()
      if (
        this.type === AssetsTypeEnum.INDEX ||
        this.type === AssetsTypeEnum.DATA_STANDARD ||
        this.type === AssetsTypeEnum.DATA_STANDARD_CODE
      ) {
        params.stringId = objectId
      } else {
        params.objectId = objectId
      }
      let viewParams = {}
      if (
        this.type === AssetsTypeEnum.TABLE ||
        this.type === AssetsTypeEnum.VIEW
      ) {
        // 数据表：视图
        if (objectIdView.length > 0) {
          viewParams = _.clone(params)
          viewParams.objectName = objectNameView
          viewParams.objectId = objectIdView
          viewParams.subAssetsType = 'VIEW'
          this.bindAssets(viewParams, subAssetsType)
        }
        if (objectId.length > 0) {
          this.bindAssets(params, subAssetsType)
        }
      } else {
        this.bindAssets(params, subAssetsType)
      }
    },
    // 绑定资产接口
    bindAssets(params, subAssetsType, id) {
      this.$datablauLoading.loading()
      this.$http
        .put(this.$url + '/service/ddc/catalog/bind', params)
        .then(res => {
          this.$blauShowSuccess(
            this.$t('assets.assetList.assetBindingSucceeded')
          )
          const curParams = {
            type: subAssetsType,
            id: params.catalogId,
          }
          this.addAsset(curParams)
          this.$datablauLoading.close()
          this.closeDialog()
        })
        .catch(e => {
          this.$showFailure(e)
          this.$datablauLoading.close()
        })
    },
    //  ———————————————— 数据标准部分 ——————————————————————
    // 数据标准树
    getStandardDataTree() {
      HTTP.getDomainTreeDetailService({
        onlyFolder: true,
        categoryId: 1, // 标准1， 指标2
      })
        .then(res => {
          this.treeLoading = false
          this.treeData = [res.data]
        })
        .catch(e => {
          this.treeLoading = false
          this.$showFailure(e)
        })
    },
    getStandardCodeTree() {
      let result = {
        name: this.$t('assets.assetList.allStandardCodes'),
        code: '',
        type: 'root',
        nodes: [],
        nodekey: 'root',
      }
      HTTP.getCodeDatasetName()
        .then(res => {
          res.data.forEach(e => {
            const obj = {
              name: e,
              code: e,
              nodes: [],
              nodekey: e,
            }
            result.nodes.push(obj)
          })
          this.treeLoading = false
          this.treeData = [result]
        })
        .catch(e => {
          this.treeLoading = false
          this.$showFailure(e)
        })
    },
    getStandardData() {
      this.columns = [
        {
          prop: 'tableName',
          label: this.$t('assets.assetList.domainName'),
          minWidth: '150px',
        },
        {
          prop: 'domainCode',
          label: this.$t('assets.assetList.domainPropCode'),
          minWidth: '120px',
        },
        {
          prop: 'theme',
          label: this.$t('assets.assetList.theme'),
          minWidth: '120px',
        },
        {
          prop: 'descriptionDepartmentName',
          label: this.$t('assets.assetList.department'),
          minWidth: '120px',
        },
      ]
      this.tableLoading = true
      const params = {
        keyword: this.assetsKeyword,
        folderId: this.foldId,
        categoryId: 1,
        // descriptionDepartment: this.searchFormData.bm,
        descriptionDepartment: this.department,
        currentPage: this.assetPagination.currentPage,
        pageSize: this.assetPagination.pageSize,
      }
      HTTP.getPublicPage(params)
        .then(res => {
          this.assetPagination.total = res.data.totalItems
          this.tableLoading = false
          res.data.content.map(item => {
            item.tableName =
              item.chineseName +
              (item.englishName ? '(' + item.englishName + ')' : '')
            item.theme = (item.path && item.path[1]) || ''
            item.name = item.chineseName
            item.disabled =
              this.addedAssets[AssetsTypeEnum.DATA_STANDARD].indexOf(
                item.domainId
              ) !== -1
          })
          this.assetsData = res.data.content
          this.$nextTick(() => {
            this.toggleRowSelection()
          })
        })
        .catch(e => {
          this.tableLoading = false
          this.$showFailure(e)
        })
    },
    getCodeData() {
      this.columns = [
        {
          prop: 'datasetName',
          label: this.$t('assets.assetList.theme'),
          minWidth: '100px',
        },
        {
          prop: 'name',
          label: this.$t('assets.assetList.chineseName'),
          minWidth: '120px',
        },
        {
          prop: 'code',
          label: this.$t('assets.assetList.code'),
          minWidth: '100px',
        },
        {
          prop: 'submitter',
          label: this.$t('assets.assetList.owner'),
          minWidth: '80px',
        },
        {
          prop: 'time',
          label: this.$t('assets.assetList.publishTime'),
          minWidth: '150px',
        },
      ]
      this.tableLoading = true
      const obj = {
        categoryId: 1,
        currentPage: this.assetPagination.currentPage,
        pageSize: this.assetPagination.pageSize,
        name: this.assetsKeyword,
        // state: null,
        datasetName: this.codeCatalogName,
        state: 'A',
      }
      HTTP.getCodeListServiceV2(obj)
        .then(res => {
          this.assetPagination.total = res.data.total
          this.tableLoading = false
          res.data.data.map(item => {
            item.time = item.publishTime
              ? this.$timeFormatter(item.publishTime)
              : ''
            item.disabled =
              this.addedAssets[AssetsTypeEnum.DATA_STANDARD_CODE].indexOf(
                item.code
              ) !== -1
          })
          this.assetsData = res.data.data
          this.$nextTick(() => {
            this.toggleRowSelection()
          })
        })
        .catch(e => {
          this.tableLoading = false
          this.$showFailure(e)
        })
      return
    },
    setCurrentExpandTheme(node) {},
    //  ———————————————— 指标部分 ——————————————————————
    getIndexData() {
      this.tableLoading = true
      const params = {
        keyword: this.indexKeyword,
        folderId: this.foldId,
        categoryId: 2,
        // descriptionDepartment: this.searchFormData.bm,
        descriptionDepartment: this.department,
        currentPage: this.assetPagination.currentPage,
        pageSize: this.assetPagination.pageSize,
      }
      HTTP.getPublicPage(params)
        .then(res => {
          this.assetPagination.total = res.data.totalItems
          this.tableLoading = false
          res.data.content.map(item => {
            item.type = IndexTypeLabel[IndexType[item.metricType]]
            item.name =
              item.chineseName +
              (item.englishName ? '(' + item.englishName + ')' : '')
            item.disabled =
              this.addedAssets[this.type].length > 0 &&
              this.addedAssets[this.type].indexOf(item.domainId) !== -1
          })
          this.assetsData = res.data.content
          this.$nextTick(() => {
            this.toggleRowSelection()
          })
        })
        .catch(e => {
          this.tableLoading = false
          this.assetsData = []
          this.$showFailure(e)
        })
    },
    //  ———————————————— 选择业务部门 ——————————————————————
    selectDepartment() {
      this.$utils.branchSelect.open(false).then(res => {
        this.department = res.bm
        this.departmentFullName = res.fullName
      })
    },
    //  ————————————————报表部分——————————————————————
    showCatalogDetail(data) {
      this.tableLoading = true
      let childrenArr = []
      const getChildrenReport = node => {
        if (node.reports && node.reports.length > 0) {
          childrenArr.push(...node.reports)
        }
        const nodes = node.nodes
        if (nodes && nodes.length > 0) {
          nodes.forEach(item => {
            getChildrenReport(item)
          })
        }
      }
      if (data.name) {
        getChildrenReport(data)
      } else {
        // 获取全部报表
        this.currentNodeKey = null
        this.$refs.directoryTree &&
          this.$refs.directoryTree.$refs.tree.setCurrentKey(null)
        getChildrenReport(this.allReportList)
      }
      this.$nextTick(() => {
        childrenArr.map(item => {
          item.reportType = this.getReportType(item.type)
          item.time = this.$timeFormatter(item.createTime)
          item.tableName = item.name + (item.code ? `(${item.code})` : '')
          // 初始化时，
          if (this.addedAssets[this.type]) {
            item.disabled =
              this.addedAssets[this.type].length > 0 &&
              this.addedAssets[this.type].indexOf(item.id.toString()) !== -1
          }
        })
        this.reportList = childrenArr
        this.getNewReportList(
          childrenArr
            .filter(item =>
              this.reportType && this.reportType !== 'all'
                ? item.type == this.reportType
                : true
            )
            .filter(item => {
              return (
                item.code.includes(this.reportKeyword) ||
                item.name.includes(this.reportKeyword)
              )
            })
        )
        if (
          this.$refs.directoryTree &&
          this.$refs.directoryTree.refreshRightData
        ) {
          this.$nextTick(() => {
            this.$refs.directoryTree.refreshRightData()
          })
        }
      })
    },
    getNewReportList(childrenArr) {
      this.assetPagination.total = childrenArr.length
      this.assetsData =
        childrenArr.slice(
          this.assetPagination.pageSize *
            (this.assetPagination.currentPage - 1),
          this.assetPagination.pageSize * this.assetPagination.currentPage
        ) || []
      this.tableLoading = false
      this.toggleRowSelection()
    },
    getReportType(type) {
      const name = this.appTypes
        .filter(item => item.value === type)
        .map(o => o.label)
        .toString()
      return name
    },
  },
  watch: {
    catalogueKey(val) {
      this.$refs.directoryTree.filter(val)
    },
    type: {
      handler(t) {
        this.initData(t)
      },
      immediate: true,
    },
    modelId(val) {
      if (this.type === AssetsTypeEnum.DATA_OBJECT) {
        // 当是数据项时，数据源变化，重新获取检索中数据表的数据
        this.tableName = ''
        this.getDataItem()
      }
    },
    reportKeyword(val) {
      this.filterReportAssrts()
    },
  },
}
