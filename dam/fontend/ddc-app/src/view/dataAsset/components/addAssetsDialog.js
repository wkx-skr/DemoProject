import api from '../utils/api'
import HTTP from '@/http/main.js'
import { AssetsTypeEnum } from '@/view/dataAsset/utils/Enum'
import isShowTooltip from '@/components/common/isShowTooltip/isShowTooltip.vue'
import { IndexTypeLabel, IndexTypeLabelEn, IndexType } from '../utils/Enum'
import ResizeHorizontal from '@/components/common/ResizeHorizontal'
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
    bindTip: {
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
          label: this.$t('assets.addAssets.all'),
          text: this.$t('assets.addAssets.all'),
          value: 'all',
        },
        {
          label: this.$t('assets.addAssets.analysis'),
          text: this.$t('assets.addAssets.analysis'),
          value: 'Analysis',
        },
        {
          label: this.$t('assets.addAssets.dataReport'),
          text: this.$t('assets.addAssets.dataReport'),
          value: 'Report',
        },
        {
          label: this.$t('assets.addAssets.detailedList'),
          text: this.$t('assets.addAssets.detailedList'),
          value: 'List',
        },
      ]
      return result
    },
    datasetType() {
      const result = [
        {
          id: 1,
          name: this.$t('assets.generalSettings.table'),
          select: true,
          type: 'TABLE',
          typeId: '80000004',
        },
        {
          id: 2,
          name: this.$t('assets.generalSettings.view'),
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
      metaModelTypes: {},
      metaModelTypesArr: [],
      metaModelMap: {},
      sizesList: [20, 50, 100, 200],
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
        pageSize: 20,
      },
      selectedAssets: [],
      treeData: [],
      tableOptions: [],
      tableName: '',
      tableKeyword: '',
      columns: [],
      // 数据表获取list相关参数
      modelId: '',
      metaModelId: '', // 元模型 列表过滤
      modelIds: null,
      schema: '',
      fromreList: [],
      allFromreList: [],
      displayModelList: [],
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
      modelLoadings: false,
      modelTotal: 0,
      metric: false,
      tabPosition: 'derivative',
      allFromreListNodesMap: new Map(),
      modelIdChangeSchema: '',
      typeArrAll: [],
      metaModelTypesArrAll: [],
    }
  },
  mounted() {
    // this.getModel()
    this.initResizeHorizontal()
    // this.getMetaModelTypes()
  },
  methods: {
    getMetaModelTypes(t) {
      api
        .getMetaModelTypes()
        .then(res => {
          let metaModelTypes = {}
          let data = res.data || []
          data.forEach(item => {
            metaModelTypes[item.assetKey] = item
          })
          this.metaModelTypes = metaModelTypes
          let typeArr = []
          Object.keys(this.metaModelTypes).map(key => {
            let id = this.metaModelTypes[key]?.id
            typeArr.push(id)
          })
          this.typeArrAll = typeArr
          this.metaModelTypesArr = (
            this.addNodeparams?.metaModelTypes || []
          ).map(item => {
            return metaModelTypes[item]
          })
          this.metaModelTypesArrAll = (
            this.addNodeparams?.metaModelTypes || []
          ).map(item => {
            return metaModelTypes[item]
          })
          console.log(this.metaModelTypesArr, 'this.metaModelTypesArr')
          this.initData(t)
          // this.metaModelId = this.metaModelTypesArr[0]?.assetKey
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    initResizeHorizontal() {
      setTimeout(() => {
        new ResizeHorizontal({
          outerDom: $('.add-assets-body'),
          leftDom: $('.assets-directory-tree'),
          middleDom: $('.resize-middle'),
          rightDom: $('.assets-box'),
          noCrack: true,
          minWith: { leftMinWidth: 200 },
        })
      }, 1000)
    },
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
          this.sizesList = [20, 50, 100, 200]
          this.columns = [
            {
              prop: 'tableName',
              label: this.$t('assets.addAssets.dataName'),
              minWidth: '150px',
            },
            {
              prop: 'system',
              label: this.$t('assets.addAssets.businessSystem'),
              minWidth: '120px',
            },
            {
              prop: 'parentPhysicalName',
              label: this.$t('assets.addAssets.dataSource'),
              minWidth: '120px',
            },
            {
              prop: 'time',
              label: this.$t('assets.addAssets.creationTime'),
              minWidth: '120px',
            },
          ]
          this.getTree()
          this.getList()
          break
        case AssetsTypeEnum.DATA_OBJECT:
          this.getModel()
          this.sizesList = [20, 50, 100, 200]
          this.columns = [
            {
              prop: 'tableName',
              label: this.$t('assets.addAssets.dataItemName'),
              minWidth: '150px',
            },
            {
              prop: 'type',
              label: this.$t('assets.addAssets.dataTypes'),
              minWidth: '120px',
            },
            {
              prop: 'domainName',
              label: this.$t('assets.addAssets.dataStandard'),
              minWidth: '120px',
            },
            {
              prop: 'tagNames',
              label: this.$t('assets.addAssets.tags'),
              minWidth: '120px',
            },
          ]
          this.getList()
          this.getDataItem()
          break
        case AssetsTypeEnum.META_MODEL:
          this.sizesList = [20, 50, 100, 200]
          this.columns = [
            {
              prop: 'physicalName',
              label: '名称',
              minWidth: '150px',
            },
            {
              prop: 'logicalName',
              label: '中文名称',
              minWidth: '120px',
            },
            {
              prop: 'modelName',
              label: '数据源',
              minWidth: '120px',
            },
            {
              prop: 'creationTime',
              label: '创建时间',
              minWidth: '120px',
            },
          ]
          let callback = () => {
            // 获取所有可选的模型列表
            this.getList()
          }
          this.getTree(callback)
          break
        case AssetsTypeEnum.DATA_STANDARD:
          this.sizesList = [20, 50, 100, 200]
          this.getTree()
          this.getStandardData()
          break
        case AssetsTypeEnum.DATA_STANDARD_CODE:
          this.sizesList = [20, 50, 100, 200]
          this.getTree()
          this.getCodeData()
          break
        case AssetsTypeEnum.REPORT:
          this.sizesList = [20, 50, 100, 200]
          // 报表
          this.columns = [
            {
              prop: 'code',
              label: this.$t('assets.addAssets.reportNo'),
              minWidth: '120px',
            },
            {
              prop: 'name',
              label: this.$t('assets.addAssets.reportName'),
              minWidth: '150px',
            },
            {
              prop: 'reportType',
              label: this.$t('assets.addAssets.reportType'),
              minWidth: '120px',
            },
            {
              prop: 'owner',
              label: this.$t('assets.addAssets.owner1'),
              minWidth: '120px',
            },
            {
              prop: 'time',
              label: this.$t('assets.addAssets.creationTime'),
              minWidth: '150px',
            },
          ]
          this.getTree()
          break
        case AssetsTypeEnum.FILE:
          this.sizesList = [20, 50, 100, 200]
          this.columns = [
            {
              prop: 'fileName',
              label: this.$t('assets.addAssets.fileName'),
              minWidth: '150px',
            },
            {
              prop: 'type',
              label: this.$t('assets.addAssets.fileType'),
              minWidth: '120px',
            },
            {
              prop: 'size',
              label: this.$t('assets.addAssets.fileSize'),
              minWidth: '120px',
            },
            {
              prop: 'time',
              label: this.$t('assets.addAssets.creationTime'),
              minWidth: '120px',
            },
          ]
          this.getTree()
          this.getList()
          break
        case AssetsTypeEnum.INDEX:
          this.sizesList = [20, 50, 100, 200]
          this.columns = [
            {
              prop: 'name',
              label: this.$t('assets.addAssets.indexName'),
              minWidth: '150px',
            },
            {
              prop: 'domainCode',
              label: this.$t('assets.addAssets.indexCode'),
              minWidth: '120px',
            },
            {
              prop: 'measureUnit',
              label: this.$t('assets.addAssets.measurementName'),
              minWidth: '120px',
            },
            {
              prop: 'type',
              label: this.$t('assets.addAssets.indexType'),
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
    handleClick() {
      this.getTree()
      this.foldId = ''
      this.getIndexData()
    },
    getModel() {
      this.modelLoadings = true
      const params = {
        categoryId: '',
        currentPage: this.modelPage,
        modelName: '',
        pageSize: 500,
      }
      api.getFilteredModel(params).then(res => {
        this.modelLoadings = false
        this.modelTotal = res.data.totalItems
        const content = res.data.content.map(item => {
          return {
            ...item,
            databaseDisplayName: `${
              item.database || item.schema
                ? (item.database || item.schema) +
                  '(' +
                  item.datasourceName +
                  ')'
                : (item.schema || '') +
                  (item.schema ? `(${item.definition})` : item.definition)
            }`,
          }
        })
        if (this.modelPage !== 1) {
          this.fromreList = this.fromreList.concat(content)
        } else {
          this.fromreList = content
        }
        this.allFromreList = this.fromreList
      })
    },
    modelloading() {
      if (this.modelPage * 500 >= this.modelTotal) return
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
        modelIds: this.modelIds,
        pageSize: 20,
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
          this.selectTableLoading = false
          if (defaultParams.keyword === this.tableKeyword) {
            this.selectTableLoading = false
            this.selectTotal = res.data.totalItems
            if (this.tablePage !== 1) {
              this.tableOptions = this.tableOptions.concat(res.data.content)
            } else {
              this.tableOptions = res.data.content || []
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
            this.tableOptions = res.data.content || []
          }
        }
      })
    },
    lazyloading() {
      if (this.tablePage * 20 >= this.selectTotal) return
      this.tablePage++
      this.getDataItem({
        keyword: this.tableKeyword,
        modelIds: this.modelId ? [this.modelId] : null,
      })
    },
    tableSelect(val) {
      this.tablePage = 1
      // this.tableName = val
      this.tableKeyword = val
      this.getDataItem({
        keyword: val,
        modelIds: this.modelId ? [this.modelId] : null,
      })
    },
    getTree(callback) {
      this.treeLoading = true
      if (
        this.type === AssetsTypeEnum.TABLE ||
        this.type === AssetsTypeEnum.VIEW
      ) {
        // 数据集
        this.$http
          .get('/metadata/models/modeltree')
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
      if (this.type === AssetsTypeEnum.META_MODEL) {
        let query = ``
        let metaModelTypes = this.addNodeparams.metaModelTypes || []
        metaModelTypes = metaModelTypes.map(item => {
          return item.split('_@@_')[0]
        })
        // metaModelTypes = ['a', 'b', 'c', 'a']
        metaModelTypes = _.uniq(metaModelTypes)
        let categoryArr = []
        if (this.type === AssetsTypeEnum.META_MODEL) {
          query = `?metaModels=${metaModelTypes.join(',')}`
        }
        this.$http
          .get(`/metadata/models/modeltree${query}`)
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
              this.treeData = this.treeSort(res.data)
              this.modelId = null
              let metaModelMap = {}
              let nodeArr = []
              let getSubNodeModels = node => {
                if (node.modelIds && node.modelIds.length > 0) {
                  nodeArr.push(...node.modelIds)
                }
                let subNodes = node.subNodes || []
                if (subNodes.length > 0) {
                  subNodes.forEach(item => {
                    getSubNodeModels(item)
                  })
                }
              }
              getSubNodeModels(this.treeData)
              nodeArr.forEach(item => {
                metaModelMap[item] = true
              })
              this.metaModelMap = metaModelMap
            }
            callback && callback()
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
      if (this.type === AssetsTypeEnum.INDEX && this.metric) {
        let categoryId = 5
        if (this.tabPosition === 'derived') {
          categoryId = 6
        }
        this.$http
          .post(this.$metric + `/domains/tree/getTree`, {
            categoryId, // 原子和衍生指标
            onlyFolder: true,
            state: '',
          })
          .then(res => {
            this.treeLoading = false
            this.treeData = [res.data] || []
          })
          .catch(e => {
            this.treeLoading = false
            this.$showFailure(e)
          })
      } else if (this.type === AssetsTypeEnum.INDEX) {
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
          .get(`/metadata/dataReport/tree`)
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
      if (this.type === AssetsTypeEnum.FILE) {
        this.$http
          .get(`/metadata/filetree/tree`)
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
        modelId: this.allFromreListNodesMap.get(this.modelId)
          ? this.allFromreListNodesMap.get(this.modelId)
          : this.modelId,
        modelIds: this.modelIds,
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
        case AssetsTypeEnum.META_MODEL:
          let typeId = this.metaModelTypes[this.metaModelId]?.id
          let typeArr = []
          if (!typeId) {
            this.metaModelTypesArr.forEach(element => {
              typeArr.push(element.id)
            })
          }
          params.typeIds = typeId ? [typeId] : typeArr
          break
        case AssetsTypeEnum.DATA_OBJECT:
          params.typeIds = ['80000005']
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
          this.$http.post(`/metadata/entities/column/type`, ids).then(res1 => {
            res.data.content.map((item, index) => {
              res1.data = res1.data || []
              item.type = res1.data[index].type
              item.tagNames = item.tagNames ? item.tagNames : []
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
        if (this.type === AssetsTypeEnum.FILE) {
          this.$http
            .post('/metadata/shareFile/folder/page', params)
            .then(res => {
              resolve(res)
            })
            .catch(e => {
              this.tableLoading = false
              this.$showFailure(e)
            })
        } else {
          this.$http
            .post('/metadata/entities/searchMetadata', params)
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
      const nodesMap = new Map()
      if (t != null) {
        const fromreList = []
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
                      const id = s.id
                      s.id += '_%_' + m.name + '_%_' + s.name
                      fromreList.push({
                        ...s,
                        schema: s.name,
                        collectName: m.name,
                        departmentId: item.id,
                        itOrg: item.name,
                        systemId: c.id,
                        categoryName: c.name,
                        modelId: s.modelIds ? s.modelIds[0] : id,
                        databaseDisplayName: s.name + `(${m.name})`,
                        treeId: s.treeId,
                      })
                      this.allFromreListNodesMap.set(
                        s.treeId,
                        s.modelIds ? s.modelIds[0] : id
                      )
                    })
                  } else if (m.type === 'MODEL') {
                    fromreList.push({
                      ...m,
                      schema: '',
                      collectName: '',
                      departmentId: '',
                      itOrg: '',
                      systemId: c.id,
                      categoryName: c.name,
                      modelId: m.modelIds ? m.modelIds[0] : m.id,
                      databaseDisplayName: m.name,
                      treeId: m.treeId,
                    })
                    this.allFromreListNodesMap.set(
                      m.treeId,
                      m.modelIds ? m.modelIds[0] : m.id
                    )
                  }
                })
              }
            })
        })
        this.allFromreList = fromreList
        this.fromreList = fromreList
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
        this.type === AssetsTypeEnum.VIEW ||
        this.type === AssetsTypeEnum.META_MODEL
      ) {
        if (data.type === 'IT_DEPART' || data.type === 'catlog') {
          if (node.expanded) {
            return 'iconfont icon-openfile'
          } else {
            return 'iconfont icon-file'
          }
        } else if (data.type === 'MODEL') {
          return 'iconfont icon-shujuyuan'
        } else if (data.type === 'SCHEMA' || data.type === 'MODEL_SCHEMA') {
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
        this.type === AssetsTypeEnum.VIEW ||
        this.type === AssetsTypeEnum.META_MODEL
      ) {
        if (data.type === 'MODEL') {
          this.modelId = ''
          this.modelIds = []
          this.schema = ''
          this.modelIds = data.modelIds
          name = data.name
          if (this.type === AssetsTypeEnum.META_MODEL) {
            this.modelId = data.treeId
          }
          this.allFromreList = this.fromreList.filter(
            item => data.modelIds.indexOf(item.modelId) !== -1
          )
          this.getList()
        } else if (data.type === 'MODEL_SCHEMA' || data.type === 'SCHEMA') {
          this.modelId = data.treeId
          this.schema = data.name
          this.modelIds = [parseInt(data.id.split('_%')[0])]
          name = data.id.split('_%_')[1]
          this.getList()
        } else if (data.type === 'MODEL_CATEGORY') {
          this.modelId = ''
          this.modelIds = []
          this.schema = ''
          this.allFromreList = this.fromreList.filter(
            item => item.categoryName === data.name
          )
        } else if (data.type === 'catolog') {
          this.modelId = ''
          this.modelIds = []
          this.schema = ''
        } else if (data.type === 'IT_DEPART') {
          this.allFromreList = this.fromreList.filter(
            item => item.itOrg === data.name
          )
          this.modelId = ''
          this.modelIds = []
          this.schema = ''
        }
        if (this.modelId) {
          const flag = this.fromreList.some(
            item => parseFloat(item.modelId) === parseFloat(this.modelId)
          )
          if (flag) {
            this.allFromreList = this.fromreList.filter(
              item => parseFloat(item.modelId) === parseFloat(this.modelId)
            )
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
    modelIdChange() {
      this.allFromreList.forEach(element => {
        if (element.treeId === this.modelId) {
          this.modelIdChangeSchema = element.schema
        }
      })
    },
    modelIdChangeMeta() {
      this.allFromreList.forEach(element => {
        if (this.modelId === element.treeId) {
          this.metaModelTypesArr = this.metaModelTypesArrAll.filter(
            i => i.metaModelCode === element.metaModelCode
          )
        }
      })
    },
    // 根据 assetsType 和 keyword 查询资产列表
    qureyAssets() {
      this.tablePage = 1
      this.assetPagination.currentPage = 1
      // 清空已选资产
      // this.$refs.assetsTable.clearSelection()
      switch (this.type) {
        case AssetsTypeEnum.TABLE: // 表
        case AssetsTypeEnum.VIEW: // 视图
          this.modelIds = this.modelId
            ? [this.allFromreListNodesMap.get(this.modelId)]
            : null
          this.schema = this.modelIdChangeSchema
          this.getList()
          break
        case AssetsTypeEnum.META_MODEL: // 元模型
          this.modelIds = this.modelId
            ? [this.allFromreListNodesMap.get(this.modelId)]
            : null
          this.schema = this.modelIdChangeSchema
          this.getList()
          break
        case AssetsTypeEnum.DATA_OBJECT: // 数据项
          if (this.tableName) {
            this.tableLoading = true
            // 当选择数据表时，请求新接口获取字段
            this.$http
              .get(
                `${this.$meta_url}/entities/${
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
        default:
          break
      }
    },
    queryReportAssets() {
      this.filterReportAssrts()
    },
    filterReportAssrts() {
      this.assetPagination.currentPage = 1
      this.assetPagination.pageSize = 20
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
        case AssetsTypeEnum.DATA_OBJECT:
          result = row.objectId
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
      if (this.type === 'REPORT' || this.type === 'FILE') key = 'id'
      if (this.type === 'DATA_STANDARD' || this.type === 'INDEX')
        key = 'domainId'
      if (this.type === 'DATA_STANDARD_CODE') key = 'code'
      list.forEach(l => {
        if (!this.addedAssets[this.type]) {
          this.addedAssets[this.type] = []
        }
        if (
          this.addedAssets[this.type] &&
          this.addedAssets[this.type].indexOf(String(l[key])) === -1
        ) {
          newList.push(l)
        }
      })
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
        if (this.type === AssetsTypeEnum.META_MODEL) {
          item.name = item.physicalName
        }
      })
      this.selectedAssets = _.cloneDeep(newList)
      this.$nextTick(() => {
        if (this.selectedAssets.length > 0) {
          const itemH = this.$refs.selectedItems.offsetHeight
          this.height = 530 + itemH + 10
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
              (this.addedAssets[this.type] &&
                this.addedAssets[this.type].indexOf(String(row.domainId)) !==
                  -1)
            break
          case AssetsTypeEnum.DATA_STANDARD_CODE:
            selected =
              selectedList.find(s => s.code === row.code) ||
              (this.addedAssets[this.type] &&
                this.addedAssets[this.type].indexOf(String(row.code)) !== -1)
            break
          case AssetsTypeEnum.REPORT:
          case AssetsTypeEnum.FILE:
            selected =
              selectedList.find(s => s.id === row.id) ||
              (this.addedAssets[this.type] &&
                this.addedAssets[this.type].indexOf(String(row.id)) !== -1)
            break
          default:
            selected =
              selectedList.find(s => s.id === row.id) ||
              (this.addedAssets[this.type] &&
                this.addedAssets[this.type].indexOf(String(row.objectId)) !==
                  -1)
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
          message: this.$t('assets.addAssets.pleaseSelectAssets'),
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
          case AssetsTypeEnum.META_MODEL:
            // subAssetsType = AssetsTypeEnum.META_MODEL
            subAssetsType = AssetsTypeEnum.META_MODEL
            objectId.push(item.objectId)
            objectName.push(item.name)
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
              ? this.$modelCategoriesDetailsMap[item.categoryId]
                  .itDepartmentName
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
        .put('/assets/catalog/bind', params)
        .then(res => {
          const data = res.data.data
          if (data.length > 0) {
            this.bindTip(data)
          } else {
            // console.log('test showSuccess')
            this.$blauShowSuccess(
              this.$t('assets.addAssets.assetBindingSucceeded')
            )
          }
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
        name: this.$t('assets.addAssets.allStandardCodes'),
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
          label: this.$t('assets.addAssets.domainName'),
          minWidth: '150px',
        },
        {
          prop: 'domainCode',
          label: this.$t('assets.addAssets.domainPropCode'),
          minWidth: '120px',
        },
        {
          prop: 'theme',
          label: this.$t('assets.addAssets.theme'),
          minWidth: '120px',
        },
        {
          prop: 'descriptionDepartmentName',
          label: this.$t('assets.addAssets.department'),
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
          label: this.$t('assets.addAssets.theme'),
          minWidth: '100px',
        },
        {
          prop: 'name',
          label: this.$t('assets.addAssets.chineseName'),
          minWidth: '120px',
        },
        {
          prop: 'code',
          label: this.$t('assets.addAssets.code'),
          minWidth: '100px',
        },
        {
          prop: 'submitter',
          label: this.$t('assets.addAssets.owner'),
          minWidth: '80px',
        },
        {
          prop: 'time',
          label: this.$t('assets.addAssets.publishTime'),
          minWidth: '150px',
        },
      ]
      this.tableLoading = true
      const obj = {
        categoryId: 1,
        currentPage: this.assetPagination.currentPage,
        pageSize: this.assetPagination.pageSize,
        name: this.assetsKeyword,
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
              this.addedAssets[AssetsTypeEnum.DATA_STANDARD_CODE] &&
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
    setMaxWidth() {
      let hiddenSpan = $('.el-tree-node__content span[aria-hidden="true"]')
      let maxWidth = 0
      for (let i = 0; i < hiddenSpan.length; i++) {
        const s = $('.el-tree-node__content span[aria-hidden="true"]')[i]
        const width = $(s).css('min-width').slice(0, -2)
        if (Number(width) > maxWidth) {
          maxWidth = parseInt(width)
        }
      }
      const target = $('.data-asset-tree .direction-vertical')
      for (let i = 0; i < target.length; i++) {
        $(target[i]).css('width', Number(maxWidth + 185) + 'px')
      }
    },
    setCurrentExpandTheme(node) {
      this.setMaxWidth()
    },
    //  ———————————————— 指标部分 ——————————————————————
    getIndexData() {
      this.tableLoading = true
      if (this.metric) {
        let param = {
          keyword: this.indexKeyword,
          domainState: 'A',
          folderId: this.foldId,
          submitter: '',
          firstPublishStart: null,
          firstPublishEnd: null,
          metricsType: null,
          orderColumn: ['domainCode'],
          ascOrder: [false],
          currentPage: this.assetPagination.currentPage,
          pageSize: this.assetPagination.pageSize,
          categoryId: 5,
        }
        if (this.tabPosition === 'derived') {
          param.categoryId = 6
        }
        this.$http
          .post(this.$metric + `/domains/domain/getPage`, param)
          .then(res => {
            this.assetPagination.total = res.data.totalItems
            this.tableLoading = false
            let obj = {
              BASIC: '原子指标',
              DERIVE: '衍生指标',
              FORK: '派生指标',
            }
            res.data.content.map(item => {
              item.type = obj[item.metricType]
              item.name =
                item.chineseName +
                (item.englishName ? '(' + item.englishName + ')' : '')
              item.disabled =
                this.addedAssets[this.type] &&
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
        return
      }
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
              this.addedAssets[this.type] &&
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
        this.$refs.directoryTree && this.$refs.directoryTree.setCurrentKey(null)
        getChildrenReport(this.allReportList)
      }
      this.$nextTick(() => {
        childrenArr.forEach(item => {
          item.reportType = this.getReportType(item.type)
          item.time = this.$timeFormatter(item.createTime)
          item.tableName = item.name + (item.code ? `(${item.code})` : '')
          // 初始化时，
          if (this.addedAssets[this.type]) {
            item.disabled =
              this.addedAssets[this.type] &&
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
    getMetric() {},
  },
  watch: {
    catalogueKey(val) {
      this.$refs.directoryTree.filter(val)
    },
    type: {
      handler(t) {
        this.metric = localStorage.getItem('allServers')
          ? JSON.parse(localStorage.getItem('allServers')).includes('METRIC')
          : false
        if (t === AssetsTypeEnum.META_MODEL) {
          this.getMetaModelTypes(t)
        } else {
          this.initData(t)
        }
      },
      immediate: true,
    },
    modelId(val) {
      if (this.type === AssetsTypeEnum.DATA_OBJECT) {
        // 当是数据项时，数据源变化，重新获取检索中数据表的数据
        this.tablePage = 1
        this.tableName = ''
        this.tableOptions = []
        this.modelIds = this.modelId ? [this.modelId] : []
        this.getDataItem({
          modelIds: this.modelId ? [this.modelId] : [],
        })
      }
    },
    // reportKeyword(val) {
    //   this.filterReportAssrts()
    // },
  },
}
