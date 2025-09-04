import _ from 'lodash'
import moment from 'moment'
import Sortable from 'sortablejs'
import HTTP from '@/resource/http.js'
import LDMTypes from '@constant/LDMTypes'
import { v4 as uuidv4 } from 'uuid'

export default {
  props: {
    orginData: {
      type: Object,
      default: () => {
        return {
          id: 'add'
        }
      }
    },
    valueTypeArr: {
      type: Array,
      required: true
    },
    targetTypeArr: {
      type: Array,
      required: true
    },
    tabPageArr: {
      type: Array,
      required: true
    },
    udpObjArr: {
      type: Object,
      required: true
    },
    udpMap: {
      type: Object,
      required: true
    },
    defaultObjectType: {
      type: String
    }
  },
  data () {
    let emptyValidator = (rule, value, callback) => {
      let bool = _.trim(value)
      if (!bool) {
        callback(new Error(this.$v.udp.valueNotNull))
      } else {
        callback()
      }
    }
    let validateIsExistName = (rule, value, callback) => {
      if (value === '') {
        callback(new Error(this.$v.udp.PleaseEnterName))
      } else {
        let has = false
        for (let i = 0; i < this.$store.state.nameArr.length; i++) {
          if (this.$store.state.nameArr[i].name === value && this.$store.state.nameArr[i].targetTypes.indexOf(this.udpData.targetTypes) > -1) {
            if (this.udpData.id !== this.$store.state.nameArr[i].id) {
              has = true
            }
          }
        }
        if (has) {
          callback(new Error(this.$v.udp.hasname))
        }
        callback()
      }
    }
    let valueValidator = (rule, value, callback) => {
      let bool = this.valueValidate(value)
      if (!bool) {
        callback(new Error(this.$v.udp.dataTypeError))
      } else {
        let hasDefault = this.optionsHasDefault()
        if (!hasDefault) {
          callback(new Error(this.$v.udp.valueNotenumList))
        } else {
          callback()
        }
      }
    }

    return {
      LDMTypes,
      emptyData: {
        id: '',
        udpId: '',
        name: '',
        valueType: '',
        description: '',
        defaultValue: '',
        // options: '',
        needed: false,
        creationTimestamp: 0,
        category: '默认',
        tabPage: '', // 页签
        categories: [],
        modifier: '',
        targetTypes: [], // 存储类型为数组
        parentUdpId: '',
        multiSelect: false,
        enumValues: [] // 枚举值列表
      },
      rules: {
        name: {
          required: true,
          trigger: 'blur',
          validator: validateIsExistName
        },
        valueType: {
          required: true,
          trigger: 'blur',
          message: this.$v.udp.PleaseSelectDataType // '请选择数据类型'
        },
        targetTypes: {
          required: true,
          trigger: 'blur',
          message: this.$v.udp.PleaseSelectObjLevel // '请选择对象层级'
        },
        defaultValue: {
          trigger: 'blur',
          validator: valueValidator
        }
        // options: {
        //   trigger: 'blur',
        //   validator: udpOptionsValidate
        // }
      },
      udpData: {
        tabPage: '', // 页签
        parentUdpId: ''
      },
      valiSuccess: true,
      isEdit: false,
      isAdd: false,
      enumAutoId: 0,
      categoriesType: 'part',
      currentPage: 1,
      pageSize: 20,
      // total: 0,
      enumShowValues: []
    }
  },

  components: {},

  computed: {
    // 上级自定义属性 备选项,
    // 需要过滤掉 父级与兄弟类型的自定义属性
    // 去掉 非枚举值的自定义属性
    parentUdpArr () {
      // let labelMap = {
      //   [LDMTypes.ModelMart]: '模型',
      //   [LDMTypes.Diagram]: '主题域',
      //   [LDMTypes.Entity]: '表',
      //   [LDMTypes.View]: '视图',
      //   [LDMTypes.Attribute]: '字段'
      // }
      let labelMap = {}
      this.targetTypeArr.forEach(item => {
        labelMap[item.typeId] = item.label
      })
      let arr = []
      // 根据 属性对象 进行过滤, 只能显示父级对象和本身的 自定义属性
      let parentUdpMapArr = {
        [LDMTypes.ModelMart]: [LDMTypes.ModelMart],
        [LDMTypes.Diagram]: [LDMTypes.ModelMart, LDMTypes.Diagram],
        [LDMTypes.BusinessObject]: [LDMTypes.ModelMart, LDMTypes.BusinessObject],
        [LDMTypes.Entity]: [LDMTypes.ModelMart, LDMTypes.Entity],
        [LDMTypes.View]: [LDMTypes.ModelMart, LDMTypes.View],
        [LDMTypes.Attribute]: [LDMTypes.ModelMart, LDMTypes.BusinessObject, LDMTypes.Entity, LDMTypes.View, LDMTypes.Attribute]
      }
      let targetTypes = this.udpData.targetTypes
      if (targetTypes) {
        let parentTypes = parentUdpMapArr[targetTypes]
        // 父级对象和本身的 自定义属性
        parentTypes.forEach(type => {
          let udps = []
          let udpArr = this.udpObjArr[type]
          if (udpArr && Array.isArray(udpArr)) {
            udpArr.forEach(item => {
              // 当 udp 是枚举值时, 才可以作为父级自定义属性
              // if (item.enumValues && item.enumValues.length > 0) {
              // 当 udp 是枚举值时, 才可以作为父级自定义属性, 取消这个限制
              item = _.cloneDeep(item)
              // 过滤掉自身, 以及自身的子级
              if (this.udpData.udpId) {
                if (item.udpId === this.udpData.udpId) {
                  item.disabled = true
                }
                let children = this.udpMap[this.udpData.udpId]?.child || []
                let findData = children.find(child => child.udpId === item.udpId)
                if (findData) {
                  item.disabled = true
                }
              }
              udps.push(item)
              // }
            })
          }
          udps && udps.length > 0 && arr.push({
            label: labelMap[type],
            udps: udps
          })
        })
      }
      return arr
    },
    // 只有 STRING, INTEGER, DOUBLE 可以添加枚举值
    canAddEnum () {
      return !!['STRING', 'INTEGER'].includes(this.udpData.valueType)
    },
    // 根据选择的 父级自定义属性, 获取 父级自定义属性的枚举值
    parentUdpValues () {
      let arr = []
      if (this.udpData.parentUdpId) {
        let udp = this.udpMap[this.udpData.parentUdpId]
        if (udp) {
          arr = udp.enumValues || []
        }
      }
      return arr
    },
    // 枚举值列表 总数
    total () {
      return this.udpData?.enumValues?.length || 0
    },
    btnDisable () {
      let result = false
      let keyArr = ['name', 'valueType', 'targetTypes']
      if (!this.udpData) {
        result = true
      }
      if (!result) {
        keyArr.forEach(key => {
          let prop = this.udpData[key] || ''
          prop = _.trim(prop)
          if (!prop) {
            result = true
          }
        })
      }
      return result || !this.valiSuccess
    }
  },

  mounted () {
    this.dataInit()
  },
  destroyed () {
  },
  watch: {
    // 父级自定义属性改变时, 重置枚举值 父值和父键
    parentUdpValues () {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.parentEnumValueInit()
      }, 500)
    },
    // 枚举值列表变化后, 重新生成拖拽组件
    'enumShowValues' (newVal, oldVal) {
      if ((!oldVal || oldVal.length === 0) && newVal && newVal.length > 0) {
        // this.$nextTick(this.rowDrop)
        setTimeout(() => {
          this.rowDrop()
        }, 100)
      }
    }
  },
  methods: {
    checkMultiSelecValue (val, index, isKey) {
      if (this.udpData.valueType === 'STRING' && this.udpData.multiSelect && val.indexOf(',') >= 0) {
        this.$datablauMessage.error('枚举值多选模式下枚举项的键值中不能出现逗号')
        this.$refs[isKey ? `enumKeyInput${index}` : `enumValueInput${index}`].focus()
      }
    },
    classSelect (item) {
      this.udpData.category = item
    },
    classSearch (queryString, cb) {
      cb(queryString ? this.$globalData.udpCategoryArr.filter(item => item.toLowerCase().indexOf(queryString) !== -1) : this.$globalData.udpCategoryArr)
    },
    /** 响应事件 */
    dataInit () {
      this.udpData = {
        parentUdpId: ''
      }
      if (this.orginData && this.orginData.id === 'add') {
        this.isAdd = true
        // this.udpData.enumValues = []
        for (let key in this.emptyData) {
          this.$set(this.udpData, key, this.emptyData[key])
        }

        if (this.defaultObjectType && this.defaultObjectType !== 'all' && !isNaN(parseInt(this.defaultObjectType))) {
          this.udpData.targetTypes = parseInt(this.defaultObjectType)
        }
      } else {
        for (let key in this.orginData) {
          if (key === 'targetTypes') {
            let arr = this.orginData[key] || []
            let targetTypes = parseInt(arr[0] || '')
            this.$set(this.udpData, key, targetTypes)
          } else if (key === 'categories') {
            let arr = this.orginData[key] || []
            arr = arr.map(item => item.id)
            this.$set(this.udpData, key, arr)
          } else {
            this.$set(this.udpData, key, this.orginData[key])
          }

          if (this.udpData.enumValues && Array.isArray(this.udpData.enumValues)) {
            this.udpData.enumValues.forEach(item => {
              this.enumAutoId++
              this.$set(item, 'id', this.enumAutoId)
            })
            // this.parentEnumValueInit()
          } else {
            // this.udpData.enumValues = []
            this.$set(this.udpData, 'enumValues', [])
          }
        }
        // 数据类型是 时间时, 默认值需要 转换成 时间戳
        if (this.udpData.valueType === 'DATETIME' && this.udpData.defaultValue) {
          // this.udpData.defaultValue = 'aaa'
          let oldValue = this.udpData.defaultValue
          this.udpData.defaultValue = moment(this.udpData.defaultValue).valueOf()
          if (isNaN(this.udpData.defaultValue)) {
            this.udpData.defaultValue = ''
            this.$showFailure(`时间格式错误, '${oldValue}' 需要改为 'YYYY-MM-DD HH:mm:ss' 格式`)
          }
        }
        this.$nextTick(() => {
          // 初始化完成后, 需要等待 computed 里的 parentUdpArr 更新,
          // 确定新的值里没有之前选中的 级联属性, 就清空之前选中的值
          let parentUdpFound = false
          this.parentUdpArr.forEach(item => {
            if (item.udps.some(udp => udp.udpId === this.udpData.parentUdpId)) {
              parentUdpFound = true
            }
          })

          if (!parentUdpFound) {
            this.udpData.parentUdpId = ''
          }
        })
      }
      this.getShowPage()
    },
    // 父枚举值 值的初始化
    parentEnumValueInit () {
      if (this.udpData.enumValues && Array.isArray(this.udpData.enumValues)) {
        this.udpData.enumValues.forEach(item => {
          let p = this.parentUdpValues.find(p => item.p === p.i)
          if (p) {
            // item.pn = p.n
            this.$set(item, 'pn', p.n)
          } else {
            // item.pn = ''
            this.$set(item, 'pn', '')
            item.p = ''
          }
        })
      }
    },
    // 修改属性对象后, 自动清空 上级自定义属性
    handleTargetTypesChange (val) {
      this.udpData.parentUdpId = ''
    },
    confirmPost () {
      let res = false
      this.$refs['form'].validate((valid) => {
        res = valid
      })
      if (!res) {
        return
      }
      let requestBody = _.cloneDeep(this.udpData)
      requestBody.targetTypes = [requestBody.targetTypes]

      // 数据类型是 时间时, 默认值需要 转换成 时间戳
      if (this.udpData.valueType === 'DATETIME' && this.udpData.defaultValue) {
        requestBody.defaultValue = moment(this.udpData.defaultValue).format('yyyy-MM-DD HH:mm:ss')
      }

      // 如果是添加枚举值, 则需要将枚举值的 id, 父值 清空
      if (requestBody.enumValues && Array.isArray(requestBody.enumValues)) {
        requestBody.enumValues.forEach(item => {
          delete item.id
          delete item.pn
        })
      }

      // 如果有枚举值列表
      if (requestBody.enumValues && Array.isArray(requestBody.enumValues) && requestBody.enumValues.length > 0) {
        // 默认值必须在枚举值列表中
        if (requestBody.defaultValue) {
          let findData = requestBody.enumValues.find(item => item.i === requestBody.defaultValue)
          if (!findData) {
            this.$datablauMessage.error(this.$t('assets.udp.defaultValueMustInEnum'))
            return
          }
        }

        // 枚举值列表中的值, 数据类型必须符合 选择的数据类型, 主要检查 整数
        if (this.udpData.valueType === 'INTEGER') {
          let notInteger = false
          requestBody.enumValues.forEach(item => {
            if (item.n && !_.isInteger((item.n - 0))) {
              notInteger = true
            }
          })
          if (notInteger) {
            this.$datablauMessage.error(this.$t('assets.udp.enumValueMustBeInteger'))
            return
          }
        }
        // 枚举值多选模式下枚举项的键值中不能出现逗号
        if (this.udpData.valueType === 'STRING' && this.udpData.multiSelect && this.enumShowValues.some(item => ((item.n.indexOf(',') >= 0) || (item.i.indexOf(',') >= 0)))) {
          this.$datablauMessage.error('枚举值多选模式下枚举项的键值中不能出现逗号')
          return
        }

        // 枚举值列表中, 键值对不能为空, 且不能重复
        let enumValueMap = {}
        let enumValueRepeat = false
        let repeatKey = ''
        let enumKeyMap = {}
        let enumKeyRepeat = false
        let enumValueEmpty = false
        let enumParentKeyRepeat = false
        let repeatValue = ''
        let repeatParentValue = ''
        let parentUdp = null
        if (this.udpData.parentUdpId) {
          parentUdp = this.udpMap[this.udpData.parentUdpId]
        }
        requestBody.enumValues.forEach(item => {
          if ((!item.i && item.i !== 0) || (!item.n && item.n !== 0)) {
            enumValueEmpty = true
          }
          if (enumKeyMap[item.i]) {
            if (enumKeyMap[item.i] === item.n) {

            } else {
              enumKeyRepeat = true
              repeatKey = item.i
            }
          } else {
            enumKeyMap[item.i] = item.n
          }
          if (enumValueMap[item.n]) {
            if (enumValueMap[item.n] === item.i) {

            } else {
              enumValueRepeat = true
              repeatValue = item.n
            }
          } else {
            enumValueMap[item.n] = item.i
          }
          if (enumValueMap[item.i + '\t' + item.p]) {
            enumParentKeyRepeat = true
            repeatKey = item.i
            repeatParentValue = item.p
          } else {
            enumValueMap[item.i + '\t' + item.p] = true
          }
        })
        if (enumValueEmpty) {
          this.$datablauMessage.error('枚举值列表中键值对不能为空')
          return
        }
        if (enumKeyRepeat) {
          this.$datablauMessage.error(`枚举值列表中有键 '${repeatKey}' 相同，但值却不同，键值必须一一对应`)
          return
        }
        if (enumValueRepeat) {
          this.$datablauMessage.error(`枚举值列表中有值 '${repeatValue}' 相同，但键却不同，键值必须一一对应`)
          return
        }
        if (enumParentKeyRepeat) {
          this.$datablauMessage.error(repeatParentValue ? `枚举值列表中父键'${repeatParentValue}' 键 '${repeatKey}' 重复了` : `枚举值列表中键 '${repeatKey}' 重复了`)
          return
        }
      }

      // 根据 数据类型, 校验默认值
      if (this.udpData.valueType === 'INTEGER' && this.udpData.enumValues.length === 0) {
        // 有枚举值时, 默认值是 枚举值列表的 key, 不需要校验数据类型
        if (this.udpData.defaultValue && !_.isInteger((this.udpData.defaultValue - 0))) {
          this.$datablauMessage.error(this.$t('默认值必须是整数'))
          return
        }
      } else if (this.udpData.valueType === 'DOUBLE') {
        if (this.udpData.defaultValue && isNaN(this.udpData.defaultValue - 0)) {
          this.$datablauMessage.error(this.$t('默认值必须是数字'))
          return
        }
      }

      let categoryMap = {}
      this.$globalData.udpCategories.forEach(item => {
        categoryMap[item.id] = item
      })
      // if (requestBody.categories.length === 0) {
      //   requestBody.categories = null
      // } else {
      //   requestBody.categories = requestBody.categories.map(item => categoryMap[item])
      // }
      if (this.isAdd) {
        requestBody.new = true
        requestBody.id = uuidv4()
      } else {
        requestBody.modified = true
      }
      // let para = {
      //   requestBody: requestBody,
      //   successCallback: (data) => {
      //     let sucMsg = this.isAdd ? this.$v.udp.addedSuccessfully : this.$v.udp.ModifiedSuccessfully
      //     this.$message.success(sucMsg)
      //     this.$emit('editSuccesed')
      //   },
      //   failureCallback: e => {
      //     this.$showFailure(e)
      //   }
      // }
      //
      // if (this.isAdd) {
      //   HTTP.createUdp(para)
      // } else {
      //   HTTP.updateUdp(para)
      // }
      this.$bus.$emit(this.isAdd ? 'addUdp' : 'modifyUdp', requestBody)
    },
    removetab () {
      this.$emit('closeEditTab')
    },
    optionsHasDefault () {
      this.valiSuccess = true
      let bool = false
      let defaultValue = _.trim(this.udpData.defaultValue)
      let options = this.udpData.options || ''
      options = options.split(';') || []
      options = options.filter(option => !!_.trim(option))
      if (defaultValue && options && options.length > 0) {
        bool = options.find(option => option === defaultValue)
      } else {
        bool = true
      }
      if (!bool) {
        this.valiSuccess = false
      }
      return bool
    },
    validateDefAndOpt () {
      if (this.$refs.form && this.$refs.form.validateField) {
        this.$refs.form.validateField(['defaultValue', 'options'])
      }
    },
    // 数据类型改变后, 清空默认值, 枚举值
    dataTypeChange (type) {
      this.udpData.defaultValue = ''
      this.$nextTick(() => {
        this.udpData.enumValues = []
        this.udpData.parentUdpId = ''
      })

      this.$refs.defaultValue && this.$refs.defaultValue.clearValidate()
      // this.$refs.options && this.$refs.options.clearValidate()
    },
    valueValidate (value) {
      let bool = false
      if (value === undefined) {
        return true
      }
      // 数据类型为 整数, 且没有枚举值时, 校验默认值是否为 整数
      if (this.udpData.valueType === 'INTEGER' && this.udpData.enumValues.length === 0) {
        value = value - 0
        bool = Math.round(value) === value
      } else if (this.udpData.valueType === 'DOUBLE') {
        value = value - 0
        bool = !isNaN(value)
      } else {
        bool = true
      }
      return bool
    },
    // 选择上级自定义属性后, 清空 上级枚举值
    parentUdpChange () {
      this.udpData?.enumValues?.forEach(item => {
        item.p = ''
        item.pn = ''
      })
    },
    addEnumValue () {
      this.udpData?.enumValues?.push({
        id: this.enumAutoId++,
        i: '', // 枚举值Id 键
        n: '', // 枚举值 值
        p: '', // 父枚举值Id 父键
        pn: '' // 父枚举值 父值
      })
      this.getShowPage()
    },
    removeEnumValue (row) {
      let index = this.udpData.enumValues.indexOf(row)
      if (index > -1) {
        this.udpData.enumValues.splice(index, 1)
      }
      this.getShowPage()
    },
    changeParentValue (row) {
      let p = this.parentUdpValues.find(item => item.i === row.p)
      if (p) {
        row.pn = p.n
      } else {
        row.pn = ''
      }
    },
    handleSizeChange (pageSize) {
      this.pageSize = pageSize
      this.getShowPage()
    },
    handleCurrentChange (page) {
      this.currentPage = page
      this.getShowPage()
    },
    getShowPage () {
      // console.log('getShowPage')
      // 已经超出最后一页, 切换到第一页
      if (Math.ceil(this.total / this.pageSize) < this.currentPage) {
        this.currentPage = 1
      }

      let s = this.pageSize
      let c = this.currentPage
      this.enumShowValues = []
      this.$nextTick(() => {
        this.enumShowValues = this.udpData.enumValues.slice(s * (c - 1), s * c)
      })
    },
    // 行-拖拽
    rowDrop () {
      const tbody = this.$refs.enumTable.$el.querySelector(
        '.el-table__body-wrapper tbody'
      )
      // console.log(tbody, Sortable, this.structureList)
      const _this = this
      Sortable.create(tbody, {
        disabled: false, // 是否开启拖拽
        ghostClass: 'sortable-ghost', // 拖拽样式
        animation: 150, // 拖拽延时，效果更好看
        group: {
          // 是否开启跨表拖拽
          pull: false,
          put: false
        },
        handle: '.dragIcon',
        onEnd ({ newIndex, oldIndex }) {
          let arr = _this.udpData.enumValues
          let baseCount = _this.pageSize * (_this.currentPage - 1)
          const currRow = arr.splice(oldIndex + baseCount, 1)[0]
          arr.splice(newIndex + baseCount, 0, currRow)
          _this.getShowPage()
        }
      })
    }
  }
}
