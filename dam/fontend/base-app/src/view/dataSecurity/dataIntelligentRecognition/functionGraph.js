export default {
  data() {
    return {
      xx: 234324,
      outerType: 'OR',
      loading: true,
      firstLableList: [
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
      ],
      secondLableList: [
        {
          // 内建属性选项
          label: '字段名',
          value: 'physicalName',
        },
        {
          label: '别名',
          value: 'logicalName',
        },
        {
          label: '描述',
          value: 'definition',
        },
      ],
      customerProperties: [],
      parameters: [],
      discrenRules: [], // 识别函数
      atomList: [],
      currentRuleIndex: '',
      ruleTags: [], // 当前识别条件的标签
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.getList()
      this.getIRrules()
      this.loading = false
      if (this.isEditMode) {
        // 编辑时，先判断识别对象类型
        this.getSecondPropertyOptions(1)
      }
    })
    // 先对数据进行解码
    // this.decodeData()
  },
  props: {
    metricoption: [],
    discernContent: [],
    distinguishKeys: {},
    discernType: '',
    groupParams: {},
    outerLogic: {
      type: String,
      default: 'OR',
    },
    isEditMode: false,
    customerList: [],
  },
  watch: {
    discernType(val) {
      if (val) {
        switch (parseInt(val)) {
          case 80000004:
          case 80500008:
            this.firstLableList = [
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
            ]
            break
          case 80000005:
            this.firstLableList = [
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
            ]
            break
          default:
            break
        }
        this.getSecondPropertyOptions(1)
      }
    },
    outerLogic(val) {
      this.outerType = this.outerLogic
    },
    customerList(val) {
      this.customerProperties = val
    },
    discernContent: {
      deep: true,
      handler(val) {
        // console.log(val)
      },
    },
  },
  methods: {
    selectRule(index, index1) {
      const params = {
        index,
        index1,
      }
      this.$emit('showRule', params)
    },
    numberInput(val, index, index1) {
      let num = val.replace(/[^\d.]/g, '')
      if (num > 100) {
        num = 100
      }
      if (num < 1) {
        num = 1
      }
      this.discernContent[index].conditionList[
        index1
      ].ruleModeEntitydataThresholdPer = num
    },
    getTags() {
      this.discernContent[this.groupParams.index].conditionList[
        this.groupParams.index1
      ].ruleTags = this.groupParams.ruleTags
    },
    getList() {
      const params = {
        search: '',
        order_by: 'createTime',
        is_asc: false,
        current_page: 1,
        page_size: 500,
      }
      this.$http
        .get(this.$url + '/service/discern/atom/rules', {
          params: params,
        })
        .then(data => {
          this.atomList = data.data.content || []
          // this.total = data.data.totalItems
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
    getData() {
      const newMap = {
        logic: this.outerType,
        discernConditionDtoList: this.discernContent,
      }
      return newMap
    },
    toAddRuleTag(index, index1) {
      // 添加标签
      // this.currentRuleIndex = index
      this.ruleTags =
        this.discernContent[index].conditionList[index1].ruleTags || []
      const params = {
        isGroup: true,
        index: index,
        index1: index1,
        ruleTags: this.ruleTags,
      }
      this.$emit('openTags', params)
    },
    removeRuleTag(index, index1, k) {
      // 删除条件标签
      this.discernContent[index].conditionList[index1].ruleTags.splice(k, 1)
    },
    handleChange(m, index, index1) {
      if (m) {
        this.getSecondPropertyOptions(m)
      }
      this.discernContent[index].conditionList[index1].secondLevelProperty = ''
    },
    handleMethodNameChange(m, index, index1) {
      this.discrenRules.map(l => {
        if (m == l.methodName) {
          this.discernContent[index].conditionList[index1].parameters =
            l.parameters
          this.discernContent[index].conditionList[index1].details = l.details
        }
      })
    },
    // 获取自定义属性下的二级属性选项
    getSecondPropertyOptions(first) {
      if (first === 1) {
        if (this.discernType === 80000004)
          this.secondLableList[0].label = '表名'
        if (this.discernType === 80500008)
          this.secondLableList[0].label = '视图名'
        if (this.discernType === 80000005)
          this.secondLableList[0].label = '字段名'
      }
      if (first === 2) {
        return
      }
    },
    getIRrules() {
      this.$http(this.$url + '/service/discern/rule/profiles')
        .then(res => {
          this.discrenRules = res.data
          // this.getFunctionInfo()
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
    getFunctionInfo() {
      this.discernContent.map(item => {
        item.conditionList.map(v => {
          this.discrenRules.map(l => {
            if (v.methodName == l.methodName) {
              v.parameters = l.parameters
              v.details = l.details
            }
          })
        })
      })
      console.log(this.discrenRules)
      this.discrenRules.map(item => {})
    },
    changeLogicalType() {
      if (this.outerType === 'AND') {
        this.outerType = 'OR'
      } else {
        this.outerType = 'AND'
      }
    },
    changeLogicalType1(logicalOperator, idx) {
      if (logicalOperator === 'AND') {
        this.discernContent[idx].logic = 'OR'
      } else {
        this.discernContent[idx].logic = 'AND'
      }
    },
    addItem(idx, idx1) {
      this.discernContent[idx].conditionList.splice(idx1 + 1, 0, {
        property: '',
        ruleModeEntitydataThresholdPer: 1,
        secondLevelProperty: '',
        atomicId: '',
        atomicName: '',
        ruleTags: [],
      })
    },
    removeItem(idx, idx1) {
      this.discernContent[idx].conditionList.splice(idx1, 1)
      if (this.discernContent[idx].conditionList.length == 0) {
        this.discernContent.splice(idx, 1)
      }
    },
  },
  computed: {
    logicalOperatorLabel() {
      return this.outerType === 'AND' ? '与' : '或'
    },
    rulesLen() {
      let len = 0
      this.discernContent.map(item => {
        item.conditionList.map(v => {
          len++
        })
      })
      return len
    },
  },
}
