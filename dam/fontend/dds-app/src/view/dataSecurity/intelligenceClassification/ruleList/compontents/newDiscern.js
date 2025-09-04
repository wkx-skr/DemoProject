import AddItem from './addItem.vue'
import API from '@/view/dataSecurity/util/api'
import isShowTooltip from '@/view/dataSecurity/components/isShowTooltip.vue'
import catalogTree from './catalogTree.vue'
import { ruleTypeEnum } from '@/view/dataSecurity/util/attrEnum'
import { getPriorityType } from '@/view/dataSecurity/util/util.js'
import PinyinMatch from 'pinyin-match'
import classifyTree from '@/view/dataSecurity/components/classifyTree.vue'
export default {
  components: {
    AddItem,
    isShowTooltip,
    catalogTree,
    classifyTree,
  },
  props: {
    ruleType: {
      type: String,
      default: ruleTypeEnum.GENERAL_RULE,
    },
    discernClick: {
      type: Function,
    },
    editable: {
      type: Boolean,
      default: false,
    },
    discernId: {
      type: [Number, String],
      default: '',
    },
    nowCatalogName: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      classifyCatalogList: [],
      discernTarget: 'AUTH_STANDARD',
      assetsType: 'COLUMN',
      treeKey: '',
      getPriorityType: getPriorityType,
      learnTargetType: 'TABLE_ONLY',
      showError: false,
      catalogIds: '', // 机器学习规则数据分类目录id的集合
      targetData: [], // 机器学习规则数据分类目录的集合
      selectedTargetItems: [],
      showCatalogTree: false,
      catalogType: '',
      ruleTypeEnum: ruleTypeEnum,
      priorityType: '3',
      bloodType: 'DOWNSTREAM',
      algorithms: [],
      selectAlgorithmsList: [], // 获取详情时，已选择的算法集合
      detailLoading: false,
      // 选择识别规则目录
      showCatalog: false,
      catalogProps: {
        children: 'subNodes',
        label: 'name',
      },
      nowData: {},
      curCatalog: {},
      treeData: [],
      canSure: false,
      // 标签选择组件相关
      tagFilterText: '',
      catalogTree: [],
      catalogTree1: [],
      checkList: [],
      rules: {},
      formContent: {
        name: '',
        infoItem: '',
        catalog: '',
        infoItemId: '',
        description: '',
        scoreThreshold: 0.5,
        suggestionThreshold: 3,
      },
      ruleList: [], // 接口获取的规则列表
      nowRuleList: [], // 编辑时，添加详情中的规则（分页加载规则列表，有可能暂时获取不到详情里的规则，回显无法匹配）
      outerType: 'OR',
      ruleDatas: {
        logic: 'OR',
        conditionList: [],
      },
      ruleObj: {
        logic: 'OR',
        discernConditionDtoList: [
          {
            logic: 'OR',
            conditionList: [
              {
                firstProperty: '',
                secondProperty: '',
                threshold: 1,
                tags: [],
                tagList: [],
                algorithmId: '',
                udpId: '',
              },
              {
                firstProperty: '',
                secondProperty: '',
                threshold: 1,
                tags: [],
                tagList: [],
                algorithmId: '',
                udpId: '',
              },
            ],
          },
        ],
      },
      // 外层属性选项
      firstLayer: [],
      // 二层属性选项
      secondLayer: [],
      customerProperties: [],
      thirdLayer: [],
      customerList: [],
      tableAttrs: [],
      viewAttrs: [],
      columnAttrs: [],
      tags: [], // 当前识别条件的标签
      addTagVisible: false,
      curTagsParams: {},
      type: 80000005, // 识别对象类型（目前只支持字段）
      // 测试弹框
      showTest: false,
      placeholderName: '',
      fromreList: [],
      fromreKeyword: '',
      modelName: '',
      modelId: '',
      testId: '',
      testResult: '',
      tablesList: [],
      treeLoading2: false,
      tablesTotal: 0,
      tableId: '',
      fieldList: [],
      treeLoading3: false,
      fieldTotal: 0,
      tablesKeyword: '',
      fieldKeyword: '',
      fieldId: '',
      testName: '',
      treeLoading1: false,
      defaultProps1: {
        value: 'modelId',
        label: 'definition',
        // children: 'subNodes',
      },
      defaultProps2: {
        value: 'objectId',
        label: 'name',
      },
      defaultProps3: {
        value: 'objectId',
        label: 'name',
      },
      isError: false,
      diaWidth: '1000px',
      // 算法列表
      algorithmPage: 1,
      algorithmSize: 20,
      algorithmTotal: 0,
      algorithmLoading: false,
      showItem: false,
      showAddCatalog: false,
      notNext: true,
      tip: '',
    }
  },
  watch: {
    treeKey(val) {
      this.$nextTick(() => {
        this.$refs.catalogTree.filter(val)
      })
    },
    tagFilterText(val) {
      if (!val) {
        this.$nextTick(() => {
          this.catalogTree1 = _.cloneDeep(this.catalogTree)
        })
      }
      this.catalogTree1.forEach((item, index) => {
        if (
          (item.name && PinyinMatch.match(item.name, this.tagFilterText)) ||
          (item.nameLevel2 &&
            PinyinMatch.match(item.nameLevel2, this.tagFilterText))
        ) {
          if (item.nameLevel2 && item.children && item.children.length > 0) {
            item.show = true
          } else {
            item.show = false
          }
        } else {
          if (
            item.children &&
            item.children.some(o =>
              PinyinMatch.match(o.name, this.tagFilterText)
            )
          ) {
            this.catalogTree1[index].children.forEach(o => {
              if (PinyinMatch.match(o.name, this.tagFilterText)) {
                o.show = true
              }
            })
            item.show = true
          } else {
            item.show = false
          }
        }
        return item
      })
    },
    fromreKeyword(val) {
      this.$refs.tree1.filter(val)
    },
    tablesKeyword(val) {
      this.$refs.tree2.filter(val)
    },
    fieldKeyword(val) {
      this.$refs.tree3.filter(val)
    },
    type(val, oldVal) {
      switch (val) {
        case 80000004:
          this.diaWidth = '640px'
          break
        case 80500008:
          this.diaWidth = '640px'
          break
        case 80000005:
          this.diaWidth = '1000px'
          break
        default:
          break
      }
      if (!this.isFirst) {
        if (!this.contentObject[oldVal]) {
          this.contentObject[oldVal] = this.ruleObj.discernConditionDtoList
        }
        if (this.contentObject[val]) {
          this.ruleObj.discernConditionDtoList = this.contentObject[val]
        } else {
          this.ruleObj = {
            logic: 'AND',
            discernConditionDtoList: [
              {
                logic: 'OR',
                conditionList: [
                  {
                    firstProperty: '',
                    secondProperty: '',
                    threshold: 1,
                    tags: [],
                    tagList: [],
                    algorithmId: '',
                    udpId: '',
                  },
                  {
                    firstProperty: '',
                    secondProperty: '',
                    threshold: 1,
                    tags: [],
                    tagList: [],
                    algorithmId: '',
                    udpId: '',
                  },
                ],
              },
              {
                logic: 'OR',
                conditionList: [
                  {
                    firstProperty: '',
                    secondProperty: '',
                    threshold: 1,
                    tags: [],
                    tagList: [],
                    algorithmId: '',
                    udpId: '',
                  },
                ],
              },
            ],
          }
        }
      } else {
        this.isFirst = false
        this.contentObject[val] = this.ruleObj.discernConditionDtoList
      }
    },
    assetsType(type) {
      this.setOptions(type)
    },
  },
  async mounted() {
    this.init()
    window.addEventListener('mousewheel', this.handleMousewheel)
    this.getAlgorithmList()
    this.getTree()
    await this.getTagTree()
    const attrList = [80000005, 80000004, 80500008]
    attrList.map(id => {
      this.getCustomAttr(id)
    })
    if (this.editable) {
      this.getFromre()
    }
    if (this.discernId) {
      this.detailLoading = true
    } else {
      this.detailLoading = false
      if (this.nowCatalogName.catalogId) {
        this.curCatalog = this.nowCatalogName
        this.formContent.catalog = this.curCatalog.name
      }
    }
    setTimeout(() => {
      this.setOptions(this.assetsType)
    }, 1000)
  },
  destroyed() {
    window.removeEventListener('mousewheel', this.handleMousewheel)
  },
  methods: {
    handleMousewheel() {
      const tooltips = document.getElementsByClassName('el-tooltip__popper')
      if (tooltips.length > 0) {
        tooltips[tooltips.length - 1].style.display = 'none'
      }
    },
    init() {
      this.rules = {
        name: [
          {
            required: true,
            message: this.$t('securityModule.input'),
            trigger: 'change',
          },
        ],
        infoItem: [
          {
            required: true,
            message: this.$t('securityModule.placeSelect'),
            trigger: 'change',
          },
        ],
        catalog: [
          {
            required: true,
            message: this.$t('securityModule.placeSelect'),
            trigger: 'change',
          },
        ],
      }
      this.firstLayer = [
        {
          label: this.$t('intelligence.attr'),
          value: 'SELF_PROPERTY',
        },
        {
          label: this.$t('intelligence.customAttr'),
          value: 'DEF_PROPERTY',
        },
        {
          label: this.$t('intelligence.lable'),
          value: 'TAG',
        },
        {
          label: this.$t('intelligence.numVal'),
          value: 'DATA_VALUE',
        },
      ]
      this.secondLayer = [
        {
          label: this.$t('intelligence.columnName'),
          value: 'PHYSICAL_NAME',
        },
        {
          label: this.$t('intelligence.alias'),
          value: 'LOGICAL_NAME',
        },
        {
          label: this.$t('securityModule.des'),
          value: 'DEFINITION',
        },
      ]
    },
    setOptions(type) {
      switch (type) {
        case 'TABLE_VIEW':
          this.firstLayer = [
            {
              label: this.$t('intelligence.attr'),
              value: 'SELF_PROPERTY',
            },
            {
              label: this.$t('intelligence.customAttr'),
              value: 'DEF_PROPERTY',
            },
            {
              label: this.$t('intelligence.lable'),
              value: 'TAG',
            },
          ]
          this.secondLayer[0].label = this.$t('intelligence.tableName')
          this.customerList = this.tableAttrs.concat(this.viewAttrs)
          break
        case 'COLUMN':
          this.secondLayer[0].label = this.$t('intelligence.columnName')
          this.firstLayer = [
            {
              label: this.$t('intelligence.attr'),
              value: 'SELF_PROPERTY',
            },
            {
              label: this.$t('intelligence.customAttr'),
              value: 'DEF_PROPERTY',
            },
            {
              label: this.$t('intelligence.lable'),
              value: 'TAG',
            },
            {
              label: this.$t('intelligence.numVal'),
              value: 'DATA_VALUE',
            },
          ]
          this.customerList = this.columnAttrs
          break
        default:
          break
      }
    },
    discernTargetChange(type) {
      if (type === 'SECURITY_CATEGORY') {
        this.assetsType = 'TABLE_VIEW'
      } else {
        this.assetsType = 'COLUMN'
      }
      this.classifyCatalogList = []
      this.ruleObj = {
        logic: 'OR',
        discernConditionDtoList: [
          {
            logic: 'OR',
            conditionList: [
              {
                firstProperty: '',
                secondProperty: '',
                threshold: 1,
                tags: [],
                tagList: [],
                algorithmId: '',
                udpId: '',
              },
              {
                firstProperty: '',
                secondProperty: '',
                threshold: 1,
                tags: [],
                tagList: [],
                algorithmId: '',
                udpId: '',
              },
            ],
          },
        ],
      }
    },
    assetsChange(type) {
      this.assetsType = type
      this.classifyCatalogList = []
      this.ruleObj = {
        logic: 'OR',
        discernConditionDtoList: [
          {
            logic: 'OR',
            conditionList: [
              {
                firstProperty: '',
                secondProperty: '',
                threshold: 1,
                tags: [],
                tagList: [],
                algorithmId: '',
                udpId: '',
              },
              {
                firstProperty: '',
                secondProperty: '',
                threshold: 1,
                tags: [],
                tagList: [],
                algorithmId: '',
                udpId: '',
              },
            ],
          },
        ],
      }
    },
    handleClose() {
      this.notNext = true
      this.showAddCatalog = false
    },
    addCatalog() {
      // 获取目录id集合
      const newList = this.$refs.classifyTree.$refs.tree.getCheckedNodes()
      this.classifyCatalogList.push(...newList)
      this.showAddCatalog = false
      this.notNext = true
    },
    deleteClassify(row) {
      this.classifyCatalogList = this.classifyCatalogList.filter(
        m => m.id !== row.id
      )
    },
    addClassifyCatalog() {
      this.showAddCatalog = true
    },
    classifyTree(name, options) {
      switch (name) {
        case 'classifyTree':
          this.tip = options.data.tip
          if (options.type === 'num') {
            this.notNext = !options.data.length
          }
          break
        default:
          break
      }
    },
    handleTargetSelectionChange(list) {
      this.selectedTargetItems = list
    },
    deleteTargetItems(item) {
      if (!Array.isArray(item)) {
        const key = 'id'
        const targetIndex = this.targetData.findIndex(
          target => target[key] === item[key]
        )
        if (targetIndex || targetIndex === 0) {
          this.targetData.splice(targetIndex, 1)
        }
      } else {
        this.selectedTargetItems.forEach(item => {
          const targetIndex = this.targetData.findIndex(
            target => target.id === item.id
          )
          if (targetIndex || targetIndex === 0) {
            this.targetData.splice(targetIndex, 1)
          }
        })
      }
    },
    handleLearnTypeChange() {
      this.targetData = []
    },
    addLearnTarget() {
      switch (this.learnTargetType) {
        case 'CATALOG_ASSETS': // 已分类数据资产
        case 'TABLE_ONLY': // 对表进行分类
        case 'TABLE_UN_PUBLISH': // 对字段进行分类(不依赖已分类的表)
          this.catalogType = 'security'
          this.showCatalogTree = true
          break
        case 'AUTH_STANDARD':
          this.catalogType = 'item'
          this.showCatalogTree = true
          break
        default:
          break
      }
    },
    getName(id) {
      // 获取自定义属性的名字，没有返回空
      let result = ''
      this.customerList.map(item => {
        if (id === item.id) {
          result = item.name
        }
      })
      return result
    },
    // 获取自定义属性
    getCustomAttr(typeId) {
      API.customAttr(typeId)
        .then(res => {
          switch (typeId) {
            case 80000004:
              this.tableAttrs = res.data || []
              break
            case 80500008:
              this.viewAttrs = res.data || []
              this.setOptions(this.assetsType)
              break
            case 80000005:
              this.columnAttrs = res.data || []
              this.setOptions(this.assetsType)
              break
            default:
              break
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getCatalog() {
      this.canSure = false
      this.treeKey = ''
      this.showCatalog = true
      this.$nextTick(() => {
        // this.$refs.catalogTree.setCurrentKey(this.curCatalog.catalogId)
        this.$refs.catalogTree.expandTopLevel()
      })
    },
    async getTree() {
      try {
        const res = await API.getStrategyCatalog('DISCERN_RULE')
        if (res.status === 200) {
          const treeData = res.data.data.subNodes || []
          this.treeData = treeData
        } else {
          this.$showFailure(res)
        }
      } catch (error) {
        this.$showFailure(error)
      }
    },
    dataIconFunctionCatalog(data, node) {
      if (node.expanded) {
        return 'iconfont icon-openfile'
      } else {
        return 'iconfont icon-file'
      }
    },
    filterNodeCatalog(value, data, node) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    handleCatalog(data) {
      this.canSure = true
      this.nowData = data
    },
    sureCatalog() {
      this.curCatalog = this.nowData
      this.formContent.catalog = this.curCatalog.name
      this.showCatalog = false
    },
    getFirstName(val) {
      if (val) {
        const result = this.firstLayer.find(item => item.value === val).label
        return result
      }
    },
    getSecondName(val) {
      if (val) {
        const result = this.secondLayer.find(item => item.value === val).label
        return result
      }
    },
    getCustomName(val) {
      let result = ''
      if (val) {
        const newMap = this.customerList.find(
          item => parseFloat(item.id) === parseFloat(val)
        )
        if (newMap) {
          result = newMap.name
        }
        // const result = this.customerList.find(
        //   item => parseFloat(item.id) === parseFloat(val)
        // ).name
        return result
      }
    },
    getRuleName(id) {
      if (id && this.selectAlgorithmsList.length > 0) {
        const result = this.selectAlgorithmsList.find(
          item => parseFloat(item.algorithmId) === parseFloat(id)
        ).algorithmName
        return result
      }
    },
    clickChild(name, options) {
      switch (name) {
        case 'addItem':
          if (options.type === 'infoItem') {
            this.formContent.infoItem = options.data.name
            this.formContent.infoItemId = options.data.itemId
          }
          this.showItem = false
          break
        case 'catalogTree': // 机器学习添加数据分类目录
          if (options.type === 'sure') {
            this.showError = false
            this.catalogIds = options.data.catalogIds
            this.targetData = options.data.targetData
          }
          this.showCatalogTree = false
          break
        default:
          break
      }
    },
    getTargetName(type) {
      let name = ''
      switch (type) {
        case 'TABLE_ONLY':
          name = this.$t('intelligence.tableClass')
          break
        case 'TABLE_PUBLISH':
          name = this.$t('intelligence.columnClass')
          break
        case 'TABLE_UN_PUBLISH':
          name = this.$t('intelligence.columnClass1')
          break
        case 'AUTH_STANDARD':
          name = this.$t('intelligence.infoItem1')
          break
        default:
          break
      }
      return name
    },
    // 获取规则详情
    getRuleDetail(id) {
      API.getRuleDetail(id, !this.editable)
        .then(res => {
          this.detailLoading = false
          const data = res.data.data
          this.curCatalog = {
            name: data.ruleInfoCatalogName,
            catalogId: data.ruleInfoCatalogId,
          }
          this.formContent = {
            name: res.data.data.ruleName.slice(0, 40),
            infoItem: res.data.data.infoName,
            catalog: this.curCatalog.name,
            infoItemId: res.data.data.infoId,
            description: res.data.data.ruleDescription,
            scoreThreshold: res.data.data.threshold,
            suggestionThreshold: res.data.data.top,
          }
          this.priorityType = res.data.data.priority
            ? res.data.data.priority.toString()
            : '3'
          this.discernTarget = data.discernTarget
          this.assetsType = data.discernRange
          this.setOptions(this.assetsType)
          let newList = []
          data.categoryMap &&
            Object.keys(data.categoryMap).map(key => {
              let newMap = {}
              newMap.id = key
              newMap.name = data.categoryMap[key]
              newList.push(newMap)
            })
          this.classifyCatalogList = newList
          switch (this.ruleType) {
            case ruleTypeEnum.GENERAL_RULE:
              let algorithmList = []
              if (res.data.data.algorithmMap) {
                Object.keys(res.data.data.algorithmMap).map(key => {
                  const newMap = {}
                  newMap.algorithmId = parseFloat(key)
                  newMap.algorithmName = res.data.data.algorithmMap[key]
                  algorithmList.push(newMap)
                })
              }
              res.data.data.discernContent.discernConditionDtoList.map(item => {
                item.conditionList.map(list => {
                  if (list.firstProperty === 'TAG') {
                    const tags = list.tags
                    let tagList = []
                    this.catalogTree.map(item => {
                      item.children.length > 0 &&
                        item.children.map(list => {
                          if (tags.some(o => o === list.content.tagId)) {
                            const tagName =
                              list.content.tagId +
                              '^' +
                              list.content.name +
                              '^' +
                              list.content.parentId
                            tagList.push(tagName)
                          }
                        })
                    })
                    this.catalogTree1 = this.catalogTree
                    list.tagList = tagList
                  }
                  if (list.firstProperty === 'DEF_PROPERTY') {
                    const flag = this.customerList.some(
                      m => parseFloat(m.id) === parseFloat(list.udpId)
                    )
                    if (flag) {
                      list.udpId = parseFloat(list.udpId)
                    } else {
                      list.udpId = ''
                    }
                  }
                })
              })
              this.selectAlgorithmsList = algorithmList
              this.pushAlgorithmsList()
              this.ruleObj = res.data.data.discernContent
              console.log(this.ruleObj)
              break
            case ruleTypeEnum.CONSANGUINITY_CASCADE:
              // 目前只支持下游
              this.bloodType =
                res.data.data.directionCNC === 'DOWNSTREAM'
                  ? res.data.data.directionCNC
                  : 'DOWNSTREAM'
              break
            case ruleTypeEnum.MACHINE_LEARNING:
              const learnType = res.data.data.mlModel
              if (learnType === 'AUTH_STANDARD')
                this.targetData = (res.data.data.authStandardList || []).map(
                  item => ({
                    ...item,
                    catalogPathName: item.sensitiveCatalogPath.slice(1),
                  })
                )
              if (
                learnType === 'CATALOG_DESC' ||
                learnType === 'TABLE_ONLY' ||
                learnType === 'TABLE_UN_PUBLISH'
              )
                this.targetData = res.data.data.catalogs || []
              if (learnType === 'CATALOG_ASSETS')
                this.targetData = res.data.data.dataCatalogs || []
              this.learnTargetType = learnType
              this.catalogIds = this.targetData.map(item => item.id).join(',')
              break
            default:
              break
          }
        })
        .catch(e => {
          this.detailLoading = false
          this.$showFailure(e)
        })
    },
    getInfoItem() {
      this.showItem = true
      this.$refs.infoItem.blur()
    },
    lazyloading() {
      if (!this.algorithmLoading) {
        if (this.algorithmPage * 10 >= this.algorithmTotal) return
        this.algorithmPage++
        this.getAlgorithmList()
      }
    },
    remoteMethod(val) {
      this.algorithmPage = 1
      this.getAlgorithmList(val)
    },
    handleAlgorithm(val) {
      this.algorithmPage = 1
      this.getAlgorithmList()
    },
    // 获取算法列表
    getAlgorithmList(key = '') {
      this.algorithmLoading = true
      const params = {
        catalogId: 0,
        searchStr: key,
        pageNum: this.algorithmPage,
        pageSize: this.algorithmSize,
        sort: '',
        orderBy: '',
      }
      API.getAlgorithmList(params)
        .then(res => {
          this.nowRuleList = []
          this.algorithmTotal = res.data.data.total
          this.algorithmLoading = false
          if (this.algorithmPage !== 1) {
            this.ruleList = this.ruleList.concat(res.data.data.algorithms)
          } else {
            this.ruleList = res.data.data.algorithms
          }
          if (this.discernId) {
            this.pushAlgorithmsList()
          } else {
            this.nowRuleList = this.ruleList
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 判断已获取列表中是否有获取详情中的算法库，如果没有加上
    pushAlgorithmsList() {
      this.nowRuleList = _.clone(this.ruleList)
      this.selectAlgorithmsList.map(item => {
        const flag = this.ruleList.some(
          o => parseFloat(o.algorithmId) === parseFloat(item.algorithmId)
        )
        if (!flag) {
          this.nowRuleList.push(item)
        }
      })
    },
    changeProperty(m, index, index1) {
      const firstProperty =
        this.ruleObj.discernConditionDtoList[index].conditionList[index1]
          .firstProperty
      switch (firstProperty) {
        case 'SELF_PROPERTY':
          this.ruleObj.discernConditionDtoList[index].conditionList[
            index1
          ].secondProperty = ''
          break
        case 'DEF_PROPERTY':
          this.ruleObj.discernConditionDtoList[index].conditionList[
            index1
          ].secondProperty = 'DEF_PROPERTY'
          break
        case 'TAG':
          this.ruleObj.discernConditionDtoList[index].conditionList[
            index1
          ].secondProperty = 'TAG'
          break
        case 'DATA_VALUE':
          this.ruleObj.discernConditionDtoList[index].conditionList[
            index1
          ].secondProperty = 'DATA_VALUE'
          break
        default:
          this.ruleObj.discernConditionDtoList[index].conditionList[
            index1
          ].secondProperty = ''
          break
      }
      this.ruleObj.discernConditionDtoList[index].conditionList[
        index1
      ].tagList = []
      this.ruleObj.discernConditionDtoList[index].conditionList[index1].tags =
        []
      this.ruleObj.discernConditionDtoList[index].conditionList[index1].udpId =
        ''
      this.ruleObj.discernConditionDtoList[index].conditionList[
        index1
      ].threshold = 1
      this.ruleObj.discernConditionDtoList[index].conditionList[
        index1
      ].algorithmId = ''
    },
    addQuery() {
      this.ruleObj.discernConditionDtoList.push({
        logic: 'OR',
        conditionList: [
          {
            firstProperty: '',
            secondProperty: '',
            threshold: 1,
            tags: [],
            tagList: [],
            algorithmId: '',
            udpId: '',
          },
          {
            firstProperty: '',
            secondProperty: '',
            threshold: 1,
            tags: [],
            tagList: [],
            algorithmId: '',
            udpId: '',
          },
        ],
      })
    },
    addItem(idx, idx1) {
      this.ruleObj.discernConditionDtoList[idx].conditionList.splice(
        idx1 + 1,
        0,
        {
          firstProperty: '',
          secondProperty: '',
          threshold: 1,
          tags: [],
          tagList: [],
          algorithmId: '',
          udpId: '',
        }
      )
    },
    removeItem(idx, idx1) {
      this.ruleObj.discernConditionDtoList[idx].conditionList.splice(idx1, 1)
      if (this.ruleObj.discernConditionDtoList[idx].conditionList.length == 0) {
        this.ruleObj.discernConditionDtoList.splice(idx, 1)
      }
    },
    changeLogicalType() {
      if (this.ruleObj.logic === 'AND') {
        this.ruleObj.logic = 'OR'
      } else {
        this.ruleObj.logic = 'AND'
      }
    },
    changeLogicalType1(logicalOperator, idx) {
      if (logicalOperator === 'AND') {
        this.ruleObj.discernConditionDtoList[idx].logic = 'OR'
      } else {
        this.ruleObj.discernConditionDtoList[idx].logic = 'AND'
      }
    },
    sure() {
      this.$refs.demoForm.validate(valid => {
        if (valid) {
          let params = {
            ruleId: this.discernId, // 规则id
            ruleName: this.formContent.name, // 规则名称
            ruleDescription: this.formContent.description, // 规则描述
            ruleInfoCatalogId: this.curCatalog.catalogId, // 规则所在目录
            ruleType: this.ruleType ? this.ruleType : ruleTypeEnum.GENERAL_RULE, // 规则类型
            priority: parseFloat(this.priorityType), // 优先级
            discernTarget: this.discernTarget, // 识别目标  AUTH_STANDARD, SECURITY_CATEGORY
          }
          switch (this.ruleType) {
            case ruleTypeEnum.GENERAL_RULE:
              this.canNext().then(() => {
                params.discernCombineDto = this.ruleObj // 一般识别规则
                params.algorithms = this.algorithms // 算法集合
                if (this.discernTarget === 'AUTH_STANDARD') {
                  params.infoId = this.formContent.infoItemId // 信息项id
                } else {
                  if (this.classifyCatalogList.length === 0) {
                    this.$datablauMessage.warning(
                      this.$t('intelligence.selectClassCatalog')
                    )
                    return
                  }
                  // params.discernTarget = this.discernTarget // 识别目标  AUTH_STANDARD, SECURITY_CATEGORY
                  params.discernRange = this.assetsType // 识别资产类型 TABLE_VIEW,COLUMN
                  params.categoryIdList = this.classifyCatalogList.map(m =>
                    parseFloat(m.id)
                  ) // 数据分类id集合
                }
                this.submitData(params)
              })
              break
            case ruleTypeEnum.CONSANGUINITY_CASCADE:
              params.directionCNC = this.bloodType // 血缘级联方向
              this.submitData(params)
              break
            case ruleTypeEnum.MACHINE_LEARNING:
              // 机器学习判断安全目录是否为空
              // params.catalogIds = this.catalogIds // 数据分类id，多个以，分割
              params.top = this.formContent.suggestionThreshold
              params.threshold = this.formContent.scoreThreshold
              params.mlModel = this.learnTargetType
              const id = 'id'
              this.catalogIds = this.targetData.map(item => item[id]).join(',')
              if (this.learnTargetType === 'TABLE_PUBLISH') {
                this.submitData(params)
              } else {
                if (this.targetData.length > 0) {
                  this.showError = false
                  switch (this.learnTargetType) {
                    case 'CATALOG_DESC':
                    case 'TABLE_ONLY':
                    case 'TABLE_UN_PUBLISH':
                      params.catalogIds = this.catalogIds
                      break
                    case 'AUTH_STANDARD':
                      params.authStandardIds = this.catalogIds
                      break
                    case 'CATALOG_ASSETS':
                      params.dataCatalogIds = this.catalogIds
                      break
                    default:
                      break
                  }
                  this.submitData(params)
                } else {
                  this.showError = true
                }
              }

              break
            default:
              break
          }
        } else {
          return false
        }
      })
    },
    submitData(params) {
      if (this.discernId) {
        API.modifyRule(params)
          .then(res => {
            this.discernClick('new', {
              type: 'save',
            })
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        API.newRule(params)
          .then(res => {
            this.discernClick('new', {
              type: 'submit',
            })
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    cancel() {
      this.discernClick('new', {
        type: 'cancel',
      })
    },
    showTsetBox() {},
    // 标签部分
    toAddRuleTag(index, index1) {
      // 添加标签
      const tagList =
        this.ruleObj.discernConditionDtoList[index].conditionList[index1]
          .tagList || []
      this.addTagVisible = true
      this.curTagsParams = {
        index,
        index1,
      }
      this.checkList = tagList || []
    },
    removeRuleTag(index, index1, k) {
      // 删除条件标签
      const tagMap =
        this.ruleObj.discernConditionDtoList[index].conditionList[index1]
          .tagList[k]
      const tagId = tagMap.split('^')[0]
      this.ruleObj.discernConditionDtoList[index].conditionList[
        index1
      ].tagList.splice(k, 1)
      const tags = this.ruleObj.discernConditionDtoList[index].conditionList[
        index1
      ].tags.filter(item => parseFloat(item) !== parseFloat(tagId))
      this.ruleObj.discernConditionDtoList[index].conditionList[index1].tags =
        tags
    },
    getTagTree() {
      API.tagListApi()
        .then(res => {
          if (res.data && Array.isArray(res.data)) {
            this.catalogTree = []
            this.$utils.sort.sortConsiderChineseNumber(res.data)
            res.data.forEach(item => {
              const obj = {
                name: item.name,
                show: true,
                children: [],
              }
              if (item.children && item.children.length > 0) {
                this.$utils.sort.sortConsiderChineseNumber(item.children)
                item.children.forEach(i => {
                  const o = _.cloneDeep(obj)
                  if (!i.name || i.children.length === 0) {
                    o.show = false
                  }
                  o.nameLevel2 = i.name
                  o.children = i.children
                  o.children.forEach(i => {
                    i.show = true
                  })
                  if (
                    i.name !== '数据安全等级' &&
                    i.name !== '重要程度' &&
                    i.name !== '影响程度' &&
                    i.name !== '影响对象' &&
                    i.name !== '影响范围' &&
                    i.name !== '敏感数据'
                  ) {
                    this.catalogTree.push(o)
                  }
                })
              } else {
                obj.show = false
                this.catalogTree.push(obj)
              }
            })
            this.catalogTree1 = _.cloneDeep(this.catalogTree)
          }
          if (this.discernId) {
            // 获取识别规则详情, 用于页面回显
            this.getRuleDetail(this.discernId)
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    tableRowClassName({ row, rowIndex }) {
      if (row.show) {
        return 'show-row'
      } else {
        return 'hide-row'
      }
    },
    checkChange(row, node) {
      // 组内单选，组外多选
      if (this.checkList.length) {
        const arr = this.checkList
          .slice(0, this.checkList.length - 1)
          .map(o => o.split('^')[1])
        row.children.forEach(item => {
          if (arr.includes(item.name)) {
            this.checkList.splice(arr.indexOf(item.name), 1)
          }
        })
      }
    },
    closeDialog() {
      this.addTagVisible = false
    },
    choseTag() {
      let tags = []
      this.checkList.forEach(v => {
        const id = v.split('^')[0]
        tags = tags.concat(id)
      })
      this.ruleObj.discernConditionDtoList[
        this.curTagsParams.index
      ].conditionList[this.curTagsParams.index1].tags = tags
      this.ruleObj.discernConditionDtoList[
        this.curTagsParams.index
      ].conditionList[this.curTagsParams.index1].tagList = this.checkList
      this.closeDialog()
    },
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (rowIndex === 0 && columnIndex === 0) {
        this.calculateArr = []
      }
      if (columnIndex === 0) {
        if (this.calculateArr.includes(this.catalogTree1[rowIndex].name)) {
          return [0, 0]
        } else if (!this.catalogTree1[rowIndex].show) {
          return [1, 1]
        } else {
          const _row = this.catalogTree1.filter(
            item => item.name === this.catalogTree1[rowIndex].name && item.show
          ).length
          const _col = _row > 0 ? 1 : 0
          this.calculateArr.push(this.catalogTree1[rowIndex].name)
          return {
            rowspan: _row,
            colspan: _col,
          }
        }
      }
    },
    // 测试部分
    showTsetBox() {
      this.testResult = ''
      this.testId = ''
      this.testName = ''
      this.tablesList = []
      this.fieldList = []
      if (
        this.discernTarget === 'SECURITY_CATEGORY' &&
        this.assetsType === 'TABLE_VIEW'
      ) {
        // 表和视图
        this.type = 80000004
      } else {
        this.type = 80000005
      }
      this.placeholderName = this.$t('intelligence.inputTable')
      this.canNext().then(() => {
        this.fromreKeyword = ''
        this.modelId = ''
        this.tablesKeyword = ''
        this.fieldKeyword = ''
        this.showTest = true
      })
    },
    canNext() {
      return new Promise((resolve, reject) => {
        let canNextList = []
        this.algorithms = []
        let num = 0
        this.ruleObj.discernConditionDtoList.map(item => {
          item.conditionList.map(list => {
            if (list.firstProperty) {
              list.num = num++
              switch (list.firstProperty) {
                case 'SELF_PROPERTY':
                  if (list.algorithmId && list.secondProperty) {
                    canNextList.push(true)
                    this.algorithms.push(list.algorithmId)
                  } else {
                    canNextList.push(false)
                  }
                  break
                case 'DEF_PROPERTY':
                  list.secondProperty = 'DEF_PROPERTY'
                  if (list.algorithmId && list.udpId) {
                    canNextList.push(true)
                    this.algorithms.push(list.algorithmId)
                  } else {
                    canNextList.push(false)
                  }
                  break
                case 'TAG':
                  list.secondProperty = 'TAG'
                  // 标签可能被删除（list.tagList.length）
                  if (list.tags.length > 0 && list.tagList.length > 0) {
                    canNextList.push(true)
                  } else {
                    canNextList.push(false)
                  }
                  break
                case 'DATA_VALUE':
                  list.secondProperty = 'DATA_VALUE'
                  if (list.algorithmId && list.threshold) {
                    canNextList.push(true)
                    this.algorithms.push(list.algorithmId)
                  } else {
                    canNextList.push(false)
                  }
                  break
                default:
                  break
              }
            } else {
              canNextList.push(false)
            }
          })
        })
        // console.log(canNextList)
        if (canNextList.length > 0) {
          if (canNextList.indexOf(false) !== -1) {
            this.$datablauMessage({
              message: this.$t('intelligence.inputAll'),
              type: 'warning',
            })
          } else {
            resolve(this.ruleObj)
          }
        } else {
          this.$datablauMessage({
            message: this.$t('intelligence.inputAll'),
            type: 'warning',
          })
          return
        }
      })
    },
    getFromre() {
      this.treeLoading1 = true
      const params = {
        categoryId: '',
        currentPage: 1,
        modelName: this.modelName,
        pageSize: 500,
      }
      API.getFromre(params)
        .then(res => {
          this.treeLoading1 = false
          if (res.data.content) {
            res.data.content.map(item => {
              item.select = false
            })
          }
          this.fromreList = res.data.content
        })
        .catch(e => {
          this.treeLoading1 = false
          this.$showFailure(e)
        })
    },
    filterNode1(value, data) {
      if (!value) return true
      return data.definition && data.definition.indexOf(value) !== -1
    },
    filterNode2(value, data) {
      if (!value) return true
      return (
        (data.physicalName && data.physicalName.indexOf(value) !== -1) ||
        (data.logicalName && data.logicalName.indexOf(value) !== -1)
      )
    },
    filterNode3(value, data) {
      if (!value) return true
      return (
        (data.physicalName && data.physicalName.indexOf(value) !== -1) ||
        (data.logicalName && data.logicalName.indexOf(value) !== -1)
      )
    },
    handleNodeClick1(data, e) {
      this.modelId = data.modelId
      this.fieldList = []
      this.testId = ''
      this.getTableList()
    },
    dataIconFunction1(data, node) {
      if (data.type === 'MYSQL') {
        return 'iconfont icon-shujuyuan'
      }
      return 'iconfont icon-shujuyuan'
    },
    handleNodeClick2(data) {
      if (this.type === 80500008 || this.type === 80000004) {
        this.testId = data.objectId
        this.testName = data.name
      } else {
        this.testId = ''
        this.tableId = data.objectId
        this.getField()
      }
    },
    dataIconFunction2(data, node) {
      if (this.type === 80000004 || this.type === 80000005) {
        if (data.type === 'VIEW') {
          return 'iconfont icon-shitu'
        } else {
          return 'iconfont icon-biao'
        }
      } else if (this.type === 80500008) {
        return 'iconfont icon-shitu'
      }
    },
    handleNodeClick3(data) {
      this.fieldId = data.objectId
    },
    treeNodeClick(a, b) {
      if (b.checkedKeys.length > 0) {
        this.$refs.tree3.setCheckedKeys([a.id])
        this.testId = a.objectId
        this.testName = a.physicalName
      } else {
        this.testId = ''
      }
    },
    dataIconFunction3(data, node) {
      return 'iconfont icon-ziduan'
    },
    getTableList() {
      // 获取数据源下的表格
      this.treeLoading2 = true
      let typeIds = []
      if (this.type === 80500008 || this.type === 80000004) {
        typeIds = [80500008, 80000004]
      }
      if (this.type === 80000005) {
        typeIds = [80500008, 80000004]
      }
      const params = {
        keyword: '',
        modelIds: this.modelId ? [this.modelId] : null,
        currentPage: 1,
        modelName: this.modelName,
        pageSize: 500,
        typeIds,
      }
      API.searchMetadataApi(params)
        .then(res => {
          this.treeLoading2 = false
          res.data.content.map(item => {
            item.select = false
            item.name =
              item.physicalName +
              (item.logicalName ? '(' + item.logicalName + ')' : '')
          })
          this.tablesList = res.data.content || []
          this.tablesTotal = res.data.totalItems
        })
        .catch(e => {
          this.tablesList = []
          this.treeLoading2 = false
          this.$showFailure(e)
        })
    },
    getField() {
      if (!this.tableId) {
        return
      }
      this.treeLoading3 = true
      API.getColumns(this.tableId)
        .then(res => {
          this.treeLoading3 = false
          res.data.map(item => {
            item.name =
              item.physicalName +
              (item.logicalName ? '(' + item.logicalName + ')' : '')
          })
          this.fieldList = res.data || []
        })
        .catch(e => {
          this.fieldList = []
          this.treeLoading3 = false
          this.$showFailure(e)
        })
    },
    testRule() {
      this.canNext().then(async data => {
        data.objectId = this.testId
        API.testRule(data)
          .then(res => {
            if (res.data.data.final) {
              this.testResult = this.$t('intelligence.idTip', {
                name: this.testName,
              })
              this.isError = false
            } else {
              this.isError = true
              this.testResult = this.$t('intelligence.notFitRules')
            }
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
  },
}
