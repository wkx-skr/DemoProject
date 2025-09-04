import { cloneDeep } from 'lodash'
import DatabaseType from '@/components/dataSource/DatabaseType.vue'
export default {
  components: {
    DatabaseType,
  },
  name: 'DatablauTable',
  props: {
    testName: String,
    reserveSelection: {
      type: Boolean,
      default: false,
    },
    dataSelectable: {
      type: Boolean,
      default: false,
    },
    singleSelect: {
      type: Boolean,
      default: false,
    },
    hasHeaderStyle: {
      type: Boolean,
      default: false,
    },
    autoHideSelection: {
      type: Boolean,
      default: true,
    },
    showColumnSelection: {
      type: Boolean,
      default: true,
    },
    checkDisabledObj: {
      type: Object,
      default() {
        return {}
      },
    },
    columnSelection: {
      type: Array,
      default() {
        return []
      },
    },
    border: {
      type: Boolean,
      required: false,
      default: true,
    },
    componentCaseName: {
      default: 404, // 一旦数据库中存入该字段，证明该字段缺失。如需保存行内容，务必确保该属性已填写且确保唯一
    },
    height: {},
    allColumns: [],
    svgSize: {
      type: Number,
      required: false,
      default: 160,
    },
    svgType: {
      type: String,
      default: 'data',
    },
    // 处理tableData设置为null时，提示数据类型错误的问题
    loading: {
      type: Boolean,
      default: false,
    },
    isAsset: {
      type: Boolean,
      default: false,
    },
    rowSelectable: {
      type: Function,
      default: null,
    },
  },
  beforeCreate() {},
  beforeDestroy() {
    this.scopeRadio = false
  },
  created() {
    this.emitElementMethod()
    if (this.hasComponentCaseName && this.showColumnSelection) {
      this.setColumnSelection()
    } else {
      this.configurationLoaded = true
    }
    this.scopeRadio = false
  },
  mounted() {
    this.addDomEventListeners()
  },
  data() {
    return {
      selectionCount: 0,
      checkboxKey: 0,
      columnSelected: [],
      tableKey: 0,
      configurationLoaded: false,
      columns: [],
      scopeRadio: false,
      showEmpty: false,
    }
  },
  methods: {
    clearSingleSelect() {
      this.scopeRadio = false
    },
    singleSelectChange(index, row) {
      this.selectionCount = 1
      this.$emit('selection-change', row)
    },
    onlyTwoChange(del_row) {
      this.$refs.table.toggleRowSelection(del_row, false) // 用于多选表格，切换某一行的选中状态，如果使用了第二个参数，则是设置这一行选中与否（selected 为 true 则选中）
    },
    emitElementMethod() {
      const ElementMethods = [
        'clearSelection',
        'toggleRowSelection',
        'toggleAllSelection',
        'toggleRowExpansion',
        'setCurrentRow',
        'clearSort',
        'clearFilter',
        'doLayout',
        'sort',
      ]
      const MethodGenerator = m => {
        return (...args) => {
          return this.$refs.table[m](...args)
        }
      }
      ElementMethods.forEach(m => {
        this[m] = MethodGenerator(m)
      })
    },
    checkSelect(row, index) {
      if (this.rowSelectable) {
        return this.rowSelectable(row)
      } else {
        // 此方法目前仅支持对checkDisabledObj有一个键值对条件判断是否disable，或者增加一个是否取反
        let isChecked = true
        let checkKeyArr = Object.keys(this.checkDisabledObj)
        // diasbale是否取反
        let isReverse = checkKeyArr.indexOf('process_inverse') > -1
        isReverse
          ? checkKeyArr.splice(checkKeyArr.indexOf('process_inverse'), 1)
          : null
        let checkKey = Object.values(checkKeyArr).join()
        if (checkKey) {
          // 判断里面是否存在某个参数
          if (this.checkDisabledObj[checkKey].indexOf(row[checkKey]) !== -1) {
            isChecked = false
          }
        }
        return isReverse ? !isChecked : isChecked
      }
    },
    setColumnSelection() {
      this.loadConfiguration()
        .then(data => {
          try {
            this.columnSelected = JSON.parse(data)
            this.allColumns.forEach(item => {
              if (item.noconfig) {
                this.columnSelected.push(item.prop)
              }
            })
            this.columns = this.allColumns.filter(column => {
              return this.columnSelected.includes(column.prop)
            })
          } catch (e) {}
        })
        .catch(() => {
          if (this.columnSelection.length === 0) {
            this.columnSelected = this.allColumns.map(column => column.prop)
          } else {
            this.columnSelected = _.clone(this.columnSelection)
          }
          this.columns = this.allColumns.filter(column => {
            return this.columnSelected.includes(column.prop)
          })
        })
        .finally(() => {
          setTimeout(() => {
            this.configurationLoaded = true
          })
        })
    },
    handleSelectionChange(selection) {
      this.selectionCount = selection.length
    },
    addDomEventListeners() {
      let timeout = null
      const self = this
      $(this.$refs.table.$el).on('mouseenter', 'th', function (evt) {
        if (
          $(this).hasClass('column-selection-column') ||
          $(this).next().hasClass('column-selection-column')
        ) {
          return
        }
        $(this).mousemove(function (evt) {
          if (evt.offsetX < parseInt($(this).css('width')) / 2) {
            $(this).prev().addClass('need-border')
            $(this).removeClass('need-border')
          } else {
            $(this).prev().removeClass('need-border')
            $(this).addClass('need-border')
          }
        })
      })
      $(this.$refs.table.$el).on('mouseleave', 'th', function () {
        $(this).off('mousemove')
        $(this).removeClass('need-border')
        $(this).prev().removeClass('need-border')
        self.$nextTick(() => {
          self.$refs.table.doLayout()
        })
      })
    },
    loadConfiguration() {
      const widgetId = 'TABLE-COLUMNS-SETTING-' + this.componentCaseName
      return new Promise((resolve, reject) => {
        this.$http
          .post(this.$base_url + `/widget/getWidgetConfig?id=${widgetId}`)
          .then(res => {
            resolve(res.data.content)
          })
          .catch(e => {
            reject()
          })
      })
    },
    saveConfiguration() {
      if (!this.componentCaseName && this.componentCaseName !== 0) {
        console.error('组件实例名称错误,请联系攻城狮修改代码！')
      }
      const widgetId = 'TABLE-COLUMNS-SETTING-' + this.componentCaseName
      this.$http
        .post(this.$base_url + '/widget/saveWidgetConfig', {
          widgetId: widgetId,
          content: JSON.stringify(this.columnSelected),
        })
        .then(() => {})
        .catch(e => {
          this.showFailure(e)
        })
    },
    handleSelectedChange() {
      this.saveConfiguration()
      this.columns = this.allColumns.filter(column => {
        return this.columnSelected.includes(column.prop)
      })
      this.tableKey++
      setTimeout(() => {
        this.addDomEventListeners()
      })
    },
  },
  computed: {
    vLoading() {
      // 检查是否是数组
      return !Array.isArray(this.$attrs.data)
    },
    alwaysShowCheckbox() {
      return this.selectionCount > 0 || !this.autoHideSelection
    },
    selectionClassName() {
      if (this.alwaysShowCheckbox) {
        return 'selection-column always'
      } else {
        return 'selection-column'
      }
    },
    hasComponentCaseName() {
      return (
        (this.componentCaseName && this.componentCaseName !== 404) ||
        this.componentCaseName === 0
      )
    },
  },
  watch: {
    columnSelected() {},
    '$attrs.data'() {
      this.showEmpty = true
      this.$nextTick(() => {
        this.$refs.table.doLayout()
      })
    },
  },
}
