import HTTP from '@/http/main.js'
import multipleTagRule from './ruleComponent/multipleTagRule.vue'
import standardSelector from '@/view/dataProperty/meta/standardSelector.vue'
import regexTagRule from './ruleComponent/regexTagRule.vue'
import FunctionGraph from './functionGraph.vue'
import atomicRule from './atomicRule.vue'
import PinyinMatch from 'pinyin-match'
export default {
  data() {
    return {
      atomicMap: {},
      atomicList: {},
      showRS: false,
      customerList: [],
      diaWidth: '640px',
      isFirst: true,
      currentTagList: [],
      groupTagList: [],
      isGroup: false,
      groupParams: {},
      // 数据源弹框
      showTest: false,
      placeholderName: '',
      fromreList: [],
      fromreKeyword: '',
      categoryId: '',
      modelName: '',
      modelId: '',
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

      graphKey: 0,
      metricoption: [],
      filterData: {
        logicalOperator: 'AND',
        query: [
          {
            logicalOperator: 'AND',
            query: [
              {
                comparisonOperator: 'EQUAL_TO',
                value: '',
              },
            ],
          },
        ],
      },
      defaultProps: {
        children: 'children',
        label: 'name',
        value: 'id',
      },
      discrenRules: [],
      form: {
        name: '',
        categoryId: '',
        disc: '',
        discernType: '',
        level: 2,
        status: true,
      },
      defaultKeys: [],
      treeData: this.$globalData.catalogs.children,
      renderRule: false,
      activeName: 'rule',
      currentStandard: {},
      showCatSelector: false,
      tagObj: {},
      currentCatList: [],
      opt1: [
        {
          value: 1,
          label: 'p1',
        },
        {
          value: 2,
          label: 'p2',
        },
        {
          value: 3,
          label: 'p3',
        },
        {
          value: 4,
          label: 'p4',
        },
      ],
      opt2: [
        {
          value: true,
          label: '启用',
        },
        {
          value: true,
          label: '禁用',
        },
      ],
      modelList: [
        {
          label: 'METADATA',
          value: '元数据识别',
        },
        {
          label: 'ENTITYDATA',
          value: '数据识别',
        },
      ],
      currentRule: '',
      tagGroupList: [],
      loading: false,
      threshold: undefined,
      // 标签选择组件相关
      tagFilterText: '',
      catalogTree: [],
      authTree: [],
      authTags: [],
      currentAuthTag: '',
      currentAuthObj: {},
      currentModes: ['forPhysicalName'],
      checkList: [],
      checkListBak: [],
      addTagVisible: false,
      loadedTagsSecond: [],
      rules: {
        name: [
          {
            required: true,
            message: '请输入规则名称',
            trigger: 'change',
          },
        ],
        categoryId: [
          {
            required: true,
            message: '请选择目录',
            trigger: 'change',
          },
        ],
      },
      sendTagObj: {},
      currentTips: '',

      currentMaskingRuleId: '',
      maskingRules: [],
      currentMaskingTips: '',
      testContent: '',
      testResult: '',
      showResult: false,
      nodeData: [],
      levelOption: [],
      accessCode: '',
      firstPropertyOptions: [
        {
          label: '内建属性',
          value: 1,
        },
        {
          label: '自定义属性',
          value: 2,
        },
        {
          label: '标签',
          value: 3,
        },
        {
          label: '数据值',
          value: 4,
        },
      ],
      distinguishKeys: {
        key1: 'logic',
        key2: 'discernConditionDtoList',
        key3: 'conditionList',
      },
      accessCodeList: {},
      curAccessCodeList: {},
      discernContent: [
        {
          logic: 'OR',
          conditionList: [
            {
              property: '',
              ruleModeEntitydataThresholdPer: 1,
              secondLevelProperty: '',
              atomicId: '',
              atomicName: '',
              ruleTags: [],
            },
          ],
        },
      ],
      outerLogic: 'OR',
      currentIdxIds: [],
      contentObject: {},
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
      testId: '',
      testName: '',
      nowSort: {},
      categoryKeyword: '',
    }
  },
  props: ['isEditMode', 'ruleType', 'ruleId', 'treeData1', 'ruleInfoCatalog'],
  components: {
    multipleTagRule,
    standardSelector,
    regexTagRule,
    FunctionGraph,
    atomicRule,
  },
  created() {
    this.getTagGroupList()
  },
  mounted() {
    // this.getIndexTree()
    this.loadTagsInitial()
    this.getAuthTags()
    this.getDataMaskingRules()
    if (this.isEditMode) {
      // 编辑模式则请求该规则详情数据
      this.getDIscernRuleDetail()
    } else {
      this.getCustomerList()
      // 点击tree目录的新建,将目录带过去
      if (this.ruleInfoCatalog) {
        this.treeData1.map(item => {
          if (this.ruleInfoCatalog === item.name) {
            this.form.categoryId = item.id
          }
        })
      }
    }
    this.$bus.$on('domainSelected', this.handleStandardChoose)
    this.getNode()
    this.getLevelList() // 获取脱敏层级列表

    this.getFromre()
  },
  beforeDestroy() {
    this.$bus.$off('domainSelected', this.handleStandardChoose)
  },
  methods: {
    showRule(params) {
      this.showRS = true
      this.nowSort = params
    },
    addRules(ruleList) {
      // 数组只有1个
      this.discernContent[this.nowSort.index].conditionList[
        this.nowSort.index1
      ].atomicId = ruleList.ruleId
      this.discernContent[this.nowSort.index].conditionList[
        this.nowSort.index1
      ].atomicName = ruleList.ruleName
    },
    getCustomerList() {
      this.form.discernType = this.form.discernType
        ? this.form.discernType
        : 80000004
      this.$http
        .get(this.$url + `/service/entities/udps/${this.form.discernType}`)
        .then(res => {
          this.customerList = res.data || []
        })
        .catch(err => {
          this.customerList = []
          this.$showFailure(err)
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
      this.getTableList()
    },
    dataIconFunction1(data, node) {
      if (data.type === 'MYSQL') {
        return 'iconfont icon-shujuyuan'
      }
      return 'iconfont icon-shujuyuan'
    },
    handleNodeClick2(data) {
      if (
        this.form.discernType === 80500008 ||
        this.form.discernType === 80000004
      ) {
        this.testId = data.objectId
        this.testName = data.name
      } else {
        this.tableId = data.objectId
        this.getField()
      }
    },
    dataIconFunction2(data, node) {
      if (
        this.form.discernType === 80000004 ||
        this.form.discernType === 80000005
      ) {
        if (data.type === 'VIEW') {
          return 'iconfont icon-shitu'
        } else {
          return 'iconfont icon-biao'
        }
      } else if (this.form.discernType === 80500008) {
        return 'iconfont icon-shitu'
      }
    },
    handleNodeClick3(data) {
      const functionMap = this.$refs.functionGraph.getData()
      this.fieldId = data.objectId
    },
    treeNodeClick(a, b) {
      if (b.checkedKeys.length > 0) {
        this.$refs.tree3.setCheckedKeys([a.id])
      }
      // console.log(this.$refs.tree3.getCheckedNodes());
      this.testId = a.objectId
      this.testName = a.physicalName
    },
    dataIconFunction3(data, node) {
      return 'iconfont icon-ziduan'
    },
    getFromre() {
      this.treeLoading1 = true
      const params = {
        categoryId: this.categoryId,
        currentPage: 1,
        modelName: this.modelName,
        pageSize: 500,
      }
      this.$http
        .post(this.$meta_url + `/service/models/fromre/page`, params)
        .then(res => {
          this.treeLoading1 = false
          // this.total = res.data.totalItems
          if (res.data.content) {
            res.data.content.map(item => {
              item.select = false
            })
          }
          this.fromreList = res.data.content
        })
        .catch(e => {
          this.treeLoading1 = false
          this.$blauShowFailure(e)
        })
    },
    getTableList() {
      // 获取数据源下的表格
      this.treeLoading2 = true
      let types = []
      if (this.form.discernType === 80500008) {
        types = ['VIEW']
      }
      if (this.form.discernType === 80000004) {
        types = ['TABLE']
      }
      if (this.form.discernType === 80000005) {
        types = ['TABLE', 'VIEW']
      }
      const params = {
        keyword: '',
        modelId: this.modelId,
        currentPage: 1,
        modelName: this.modelName,
        pageSize: 500,
        types,
      }
      this.$http
        .post(this.$meta_url + `/service/entities/searchMetadata`, params)
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
          this.$blauShowFailure(e)
        })
    },
    getField() {
      if (!this.tableId) {
        return
      }
      this.treeLoading3 = true
      this.$http
        .get(this.$url + `/service/entities/${this.tableId}/columns`)
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
          this.$blauShowFailure(e)
        })
    },
    updateFunction(data) {
      this.filterData = data
    },
    addQuery() {
      this.discernContent.push({
        logic: 'OR',
        conditionList: [
          {
            property: '',
            secondLevelProperty: '',
            atomicId: '',
            atomicName: '',
            ruleTags: [],
          },
          {
            property: '',
            secondLevelProperty: '',
            atomicId: '',
            atomicName: '',
            ruleTags: [],
          },
        ],
      })
    },
    getLevelList() {
      this.$http
        .get(this.$url + '/service/auth/access')
        .then(res => {
          res.data.map(item => {
            this.accessCodeList[item.accessCode] = ''
          })
          this.curAccessCodeList = Object.assign({}, this.curAccessCodeList)
          this.levelOption = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    dataIconFunction(data, node) {
      if (node.expanded) {
        return 'iconfont icon-openfile'
      } else {
        return 'iconfont icon-file'
      }
    },
    getNode() {
      this.nodeData = [
        {
          name: '业务识别规则',
          level: 1,
        },
        {
          name: this.isEditMode ? '编辑识别规则' : '新建识别规则',
          level: 2,
        },
      ]
    },
    commitCatSelects() {
      const newArr = []
      const nodes = this.$refs.tree.getCheckedNodes()
      nodes.forEach(v => {
        newArr.push({
          infoCatalogId: v.id,
          infoCatalogName: v.name,
        })
      })
      this.showCatSelector = false
      this.currentCatList = newArr
    },
    closeCatTag(idx) {
      this.currentCatList.splice(idx, 1)
    },
    getCurrentIds() {
      this.currentIdxIds = this.$refs.tree.getCheckedKeys()
    },
    getAtomicNameList(ids) {
      this.$http
        .post(this.$url + '/service/discern/search?ruleIds=' + ids)
        .then(res => {
          res.data.map(item => {
            this.atomicMap[item.ruleId] = item.ruleName
          })
          this.discernContent.map(item => {
            item.conditionList.map(v => {
              if (v.atomicId) {
                v.atomicName = this.atomicMap[v.atomicId]
              }
            })
          })
          console.log(this.discernContent)
        })
    },
    getDIscernRuleDetail() {
      this.loading = true
      HTTP.getDIscernRuleDetail(this.ruleId)
        .then(async res => {
          this.loading = false
          const data = res.data
          this.currentStandard.chineseName = data.domainName
          this.currentStandard.domainId = data.domainId
          this.form = {
            name: data.ruleName,
            categoryId: data.categoryId,
            discernType: data.discernType ? data.discernType : 80000004,
            status: data.enabled,
            model: data.ruleMode,
            level: data.rulePriority,
            disc: data.ruleDescription,
            ruleModeEntitydataThresholdPer: data.ruleModeEntitydataThresholdPer,
          }

          this.getCustomerList()
          // this.handleDiscernTypeChange(data.discernType)
          // 数据标签
          let newObj = {}
          for (const i in data.tags) {
            if (data.tags.hasOwnProperty(i)) {
              // 区分安全和普通标签
              if (data.tags[i].builtInCode) {
                this.currentAuthTag = data.tags[i].tagId
              } else {
                newObj[i] = data.tags[i].tagId + '^' + data.tags[i].name
              }
            }
          }
          this.tagObj = newObj
          let atomicIdList = []
          data.discernCombineDto.discernConditionDtoList.map(item => {
            item.conditionList.map(v => {
              if (v.atomicId) {
                v.atomicName = ''
                atomicIdList.push(v.atomicId)
              }
            })
          })
          this.discernContent = data.discernCombineDto.discernConditionDtoList
          atomicIdList = Array.from(new Set(atomicIdList))
          await this.getAtomicNameList(atomicIdList.join(','))
          this.contentObject[data.discernType] = this.discernContent
          this.outerLogic = data.discernCombineDto.logic
          // 脱敏规则
          this.curAccessCodeList = data.datamaskContent
          if (data.datamaskContent.static) {
            this.currentMaskingRuleId = data.datamaskContent.static
          }
          // 数据分类
          this.defaultKeys = data.infoCatalogIds
          this.currentCatList = data.infoCatalogs
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
    handleStandardChoose(choose) {
      const { chineseName, domainId } = choose
      this.currentStandard = {
        chineseName,
        domainId,
      }
    },
    showStandard() {
      this.$bus.$emit('callDomainSelector', {
        multiple: false,
      })
    },
    closeEdit() {
      this.$emit('close')
    },
    getAuthObj() {
      let obj = null
      this.authTags.forEach((v, i) => {
        if (v.content.tagId === this.currentAuthTag) {
          obj = this.authTags[i].content
        }
      })
      return obj
    },
    formateRule(ruleContent) {
      const obj = {
        className: 'DiscernRuleString',
      }
      obj.methodName = ruleContent.methodName
      ruleContent.parameters.forEach(v => {
        obj[v.parameter] = v.value
      })
      return obj
    },
    showTsetBox() {
      this.testResult = ''
      this.testId = ''
      this.testName = ''
      this.tablesList = []
      this.fieldList = []
      this.canNext().then(() => {
        if (this.form.discernType === 80000004) {
          this.placeholderName = '搜索表'
        } else if (this.form.discernType === 80000005) {
          this.placeholderName = '搜索表或视图'
        } else if (this.form.discernType === 80500008) {
          this.placeholderName = '搜索视图'
        } else {
          this.placeholderName = '搜索表'
        }
        this.showTest = true
      })
    },
    canNext() {
      return new Promise((resolve, reject) => {
        let canNextList = []
        let num = 0
        const functionMap = this.$refs.functionGraph.getData()
        functionMap.discernConditionDtoList.map(item => {
          item.conditionList.map(list => {
            if (list.property) {
              list.num = num++
              switch (list.property) {
                case 1:
                case 2:
                  if (list.atomicId && list.secondLevelProperty) {
                    canNextList.push(true)
                  } else {
                    canNextList.push(false)
                  }
                  break
                case 3:
                  let newList = []
                  Object.keys(list.ruleTags).forEach(key => {
                    newList.push(list.ruleTags[key].split('^')[0])
                  })
                  list.secondLevelProperty = newList.join(',')
                  if (Object.keys(list.ruleTags).length > 0) {
                    canNextList.push(true)
                  } else {
                    canNextList.push(false)
                  }
                  break
                case 4:
                  if (list.atomicId && list.ruleModeEntitydataThresholdPer) {
                    canNextList.push(true)
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
        if (canNextList.length > 0) {
          if (canNextList.indexOf(false) !== -1) {
            this.$datablauMessage({
              message: '请填写完整的识别条件',
              type: 'warning',
            })
          } else {
            resolve(functionMap)
          }
        } else {
          this.$datablauMessage({
            message: '请填写完整的识别条件',
            type: 'warning',
          })
          return
        }
      })
    },
    beforeSave() {
      this.canNext().then(data => {
        this.$refs.form.validate(valid => {
          if (valid) {
            this.saveRules(data)
          } else {
            return false
          }
        })
      })
    },
    saveRules(functionMap) {
      this.loading = true
      const tagObj = this.getAuthObj()
      const rule = _.cloneDeep(this.form.ruleContent)

      if (tagObj) {
        this.sendTagObj[tagObj.parentId] = tagObj.tagId
      }
      let ruleInfoCatalog = ''
      this.treeData1.map(item => {
        if (item.id === this.form.categoryId) {
          ruleInfoCatalog = item.name
        }
      })
      let datamaskContent = {
        ...this.curAccessCodeList,
      }
      datamaskContent.static = this.currentMaskingRuleId
      let atomicIdList = []
      functionMap.discernConditionDtoList.map(item => {
        item.conditionList.map(v => {
          if (v.atomicId) {
            atomicIdList.push(v.atomicId)
          }
        })
      })
      atomicIdList = Array.from(new Set(atomicIdList))

      const requestBody = {
        atomStr: atomicIdList.join(','), // 所有原子规则的id
        ruleName: this.form.name, // 规则名称
        categoryId: this.form.categoryId, // 目录id
        ruleInfoCatalog, // 目录名字
        ruleDescription: this.form.disc, // 规则描述
        rulePriority: this.form.level, // 规则优先级
        enabled: this.form.status, // 规则是否开启
        discernType: this.form.discernType, // 规则识别对象
        discernCombineDto: functionMap, // 规则内容（多个识别条件）
        datamaskContent: datamaskContent, // 脱敏规则
        tagIds: this.sendTagObj, // 识别结果标签
        domainId: this.currentStandard.domainId || '', // 识别结果标准
        infoCatalogIds: this.currentIdxIds, // 识别结果分类
        // ruleContent: this.formateRule(rule) //
      }
      if (this.isEditMode) {
        HTTP.updateDIscernRule(this.ruleId, requestBody)
          .then(res => {
            this.$message.success('规则编辑成功')
            this.closeEdit()
          })
          .catch(err => {
            this.loading = false
            this.$showFailure(err)
          })
      } else {
        HTTP.createDIscernRule(requestBody)
          .then(res => {
            this.$message.success('规则创建成功')
            this.closeEdit()
          })
          .catch(err => {
            this.loading = false
            console.error(err)
            this.$showFailure(err)
          })
      }
    },
    // 标签选择组件相关
    clearTagFilterText() {
      var self = this
      self.tagFilterText = ''
    },
    loadTagsInitial() {
      this.$http
        .get(this.$url + '/service/tags/tree')
        .then(res => {
          if (res.data && Array.isArray(res.data)) {
            this.catalogTree = []
            this.authTree = []
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
                  if (i.name === '数据安全等级') {
                    this.authTree.push(o)
                  } else {
                    this.catalogTree.push(o)
                  }
                })
              } else {
                obj.show = false
                this.catalogTree.push(obj)
              }
            })
            this.authTags = this.authTree[0].children
            this.loadedTagsSecond = res.data
            setTimeout(() => {
              if (document.getElementById('secondBox')) {
                this.secondBoxHeight =
                  document.getElementById('secondBox').offsetHeight + 60
              }
            })
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getAuthTags() {
      this.$http.get(this.$url + '/service/auth/assets').then(res => {
        const obj = {
          name: '标签分类',
          nameLevel2: '安全等级',
          show: true,
          children: res.data,
        }
      })
    },
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (rowIndex === 0 && columnIndex === 0) {
        this.calculateArr = []
      }
      if (columnIndex === 0) {
        if (this.calculateArr.includes(this.catalogTree[rowIndex].name)) {
          return [0, 0]
        } else if (!this.catalogTree[rowIndex].show) {
          return [1, 1]
        } else {
          const _row = this.catalogTree.filter(
            item => item.name === this.catalogTree[rowIndex].name && item.show
          ).length
          const _col = _row > 0 ? 1 : 0
          this.calculateArr.push(this.catalogTree[rowIndex].name)
          return {
            rowspan: _row,
            colspan: _col,
          }
        }
      }
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
    getTagList(params) {
      let newList = []
      Object.keys(params).forEach(key => {
        newList.push(params[key] + '^' + key)
      })
      this.checkList = newList || []
    },
    openTags(params) {
      this.isGroup = true
      this.groupParams = params
      this.getTagList(params.ruleTags)
      this.currentTagList = params.ruleTags
      this.addTagVisible = true
    },
    openParentTags() {
      this.isGroup = false
      this.getTagList(this.tagObj)
      this.currentTagList = this.tagObj
      this.addTagVisible = true
    },
    choseTag() {
      const tag = {}
      this.checkList.forEach(v => {
        const arr = v.split('^')
        tag[arr[2]] = arr[0] + '^' + arr[1]
      })
      this.currentTagList = tag
      if (this.isGroup) {
        this.groupTagList = this.currentTagList
        this.groupParams.ruleTags = this.currentTagList
        this.$refs.functionGraph.getTags()
      } else {
        this.tagObj = tag
      }
      this.closeDialog()
    },
    closeDialog() {
      this.checkList = this.checkListBak
      this.addTagVisible = false
    },
    removeTag(key) {
      const newObj = delete this.tagObj[key]
      this.tagObj = _.cloneDeep(this.tagObj)
    },
    // 标签选择组件结束

    // test
    getTagGroupList() {
      this.$http
        .get(this.$url + '/service/tags/group')
        .then(res => {
          this.tagGroupList = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    deleteStandard() {
      this.currentStandard = {
        chineseName: '',
        domainId: '',
      }
    },
    isShowInput(string) {
      const type = string.toLowerCase()
      if (
        type.indexOf('string') > -1 ||
        type === 'date' ||
        type === 'calendar'
      ) {
        return true
      }
      return false
    },
    getDataMaskingRules() {
      HTTP.getDataMaskingRules()
        .then(res => {
          const data = res.data
          const newArr = []
          data.forEach(v => {
            const id = parseInt(v.id.split('-')[0])
            // 只要自定义规则
            if (id !== 0) {
              v.id = id
              newArr.push(v)
            }
          })
          this.maskingRules = newArr
        })
        .catch(err => {
          this.$showFailure(err)
          console.error(err)
        })
    },
    handleMaskingChange(id) {
      this.maskingRules.forEach(v => {
        if (id === v.id) {
          this.currentMaskingTips = v.details
        }
      })
    },
    handleLevelChange(id, item) {
      this.curAccessCodeList[item.accessCode] = id
      // this.accessCode = accessCode
    },
    async getRuleContent(id) {
      return new Promise(resolve => {
        this.$http
          .get(this.$url + '/service/discern/atom/' + id)
          .then(res => {
            const ruleContent = res.data.ruleContent
            resolve(ruleContent)
          })
          .catch(err => {
            this.$showFailure(err)
          })
      })
    },
    testRule() {
      this.canNext().then(async data => {
        data.objectId = this.testId
        for (let i = 0; i < data.discernConditionDtoList.length; i++) {
          for (
            let j = 0;
            j < data.discernConditionDtoList[i].conditionList.length;
            j++
          ) {
            try {
              const atomicId =
                data.discernConditionDtoList[i].conditionList[j].atomicId
              console.log(atomicId)
              let ruleContent
              if (atomicId) {
                ruleContent = await this.getRuleContent(atomicId)
              }
              data.discernConditionDtoList[i].conditionList[j].ruleContent =
                ruleContent
            } catch (e) {
              this.$showFailure(e)
            }
          }
        }
        const params = {
          discernCombineDto: data,
        }
        this.$http
          .post(this.$url + '/service/discern/checkLogic', data)
          .then(res => {
            if (res.data.final) {
              this.testResult = `识别到：“${this.testName}”符合规则`
              this.isError = false
            } else {
              this.isError = true
              this.testResult = '没有识别到符合规则的内容'
            }
          })
          .catch(e => {
            this.$blauShowFailure(e)
          })
      })
      return
      this.showResult = false
      const form = this.form
      const rule = _.cloneDeep(form.ruleContent)
      const obj = {
        rule: this.formateRule(rule),
      }
      obj.rule.contents = this.testContent
      HTTP.testDiscernRule(obj.rule)
        .then(res => {
          this.showResult = true
          this.loading = false
          let str =
            res.data.length > 0
              ? `识别到：${res.data.join(',')}`
              : '没有识别到任何字符'
          this.testResult = str
        })
        .catch(err => {
          this.$showFailure(err)
          this.loading = false
        })
    },
    changeType(type) {
      this.isFirst = false
    },
    filterCategory(value, data, node) {
      if (!value) return true
      let bool = false
      while (node.level > 0 && !bool) {
        if (PinyinMatch.match(node.data.name, value)) {
          bool = true
        }
        node = node.parent
      }
      return bool
    },
  },
  computed: {
    inputs() {
      return this.form.ruleContent.parameters.filter(v => {
        return this.isShowInput(v.type)
      })
    },
    numbers() {
      return this.form.ruleContent.parameters.filter(v => {
        return !this.isShowInput(v.type)
      })
    },
    disableTest() {
      if (
        this.form.ruleContent.methodName === '' ||
        !this.form.ruleContent.methodName
      ) {
        return true
      }
      if (this.testContent === '') {
        return true
      }
    },
  },
  watch: {
    fromreKeyword(val) {
      this.$refs.tree1.filter(val)
    },
    tablesKeyword(val) {
      this.$refs.tree2.filter(val)
    },
    fieldKeyword(val) {
      this.$refs.tree3.filter(val)
    },
    'form.discernType'(val, oldVal) {
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
          this.contentObject[oldVal] = this.discernContent
        }
        if (this.contentObject[val]) {
          this.discernContent = this.contentObject[val]
        } else {
          this.discernContent = [
            {
              logic: 'OR',
              conditionList: [
                {
                  property: '',
                  ruleModeEntitydataThresholdPer: 1,
                  secondLevelProperty: '',
                  atomicId: '',
                  atomicName: '',
                  ruleTags: [],
                },
              ],
            },
          ]
        }
      } else {
        this.isFirst = false
        this.contentObject[val] = this.discernContent
      }
      this.getCustomerList()
    },
    tagFilterText(val) {
      this.checkListBak = _.cloneDeep(this.checkList)
      this.catalogTree.forEach((item, index) => {
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
            this.catalogTree[index].children.forEach(o => {
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
    tagObj: {
      handler(val) {
        const newArr = []
        const newObj = {}
        for (const i in val) {
          if (val.hasOwnProperty(i)) {
            newArr.push(
              val[i].split('^')[0] + '^' + val[i].split('^')[1] + '^' + i
            )
            newObj[i] = val[i].split('^')[0]
          }
        }
        this.sendTagObj = newObj
        this.checkList = newArr
      },
      deep: true,
      immediate: true,
    },
    // 目录树回显处理
    currentCatList(val) {
      const newArr = []
      val.forEach(v => {
        newArr.push(v.infoCatalogId)
      })
      this.defaultKeys = newArr
      this.currentIdxIds = newArr
    },
    checkList(val) {
      if (val === true) {
        this.checkList = this.checkListBak
      }
    },
    categoryKeyword(newVal) {
      this.$refs.tree.filter(newVal)
    },
    showCatSelector(newVal) {
      if (newVal) {
        this.categoryKeyword = ''
      }
    },
  },
}
