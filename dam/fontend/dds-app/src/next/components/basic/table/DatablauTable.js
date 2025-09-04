import { cloneDeep } from 'lodash'
import DatabaseType from '@/components/dataSource/DatabaseType.vue'
import ColumnSetting from '@components/basic/table/ColumnSetting'
import { getRowIdentity } from 'element-ui/packages/table/src/util.js'
export default {
  components: {
    DatabaseType,
    ColumnSetting,
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
    rowKey: {},
    svgType: {
      type: String,
      default: 'data',
    },
    // 处理tableData设置为null时，提示数据类型错误的问题
    loading: {
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
    this.dom.removeEventListener('scroll', this.handleScroll)
    this.scopeRadio = ''
  },
  created() {
    this.emitElementMethod()
    if (this.hasComponentCaseName && this.showColumnSelection) {
      this.setColumnSelection()
    } else {
      this.configurationLoaded = true
    }
    this.scopeRadio = ''
  },
  mounted() {
    this.addDomEventListeners()
    this.$nextTick(() => {
      // 页面滚动时
      this.dom = this.$refs.table.bodyWrapper
      this.dom.addEventListener('scroll', this.handleScroll)
    })
  },
  data() {
    return {
      dom: '',
      selectionCount: 0,
      checkboxKey: 0,
      columnSelected: [],
      tableKey: 0,
      configurationLoaded: false,
      columns: [],
      scopeRadio: '',
      singleSelectedItem: null,
      showEmpty: false,
      getRowIdentity: getRowIdentity,
    }
  },
  methods: {
    toggleRowExpansion(row, expanded) {
      // fix bug: 手动调用 展开行时, 没有 加载数据
      // 来源: https://github.com/ElemeFE/element/issues/19929
      const {
        table: { toggleRowExpansion, store },
      } = this.$refs
      const {
        states: { lazy, treeData, rowKey },
        assertRowKey,
        loadData,
      } = store
      assertRowKey()
      const id = getRowIdentity(row, rowKey)
      const data = treeData[id]

      /* 非公共方法操作,由于此版本treetable的toggleRowExpansion存
         在懒加载只展开不加载数据的bug,且官方无修复计划,故此处调用其私有方法,
         此处仿照loadOrToggle方法将会检测数据是否加载,
         未加载时加载后展开,已加载则调用toggleRowExpansion */

      // 展开动作
      if (expanded) {
        // 是懒加载但是未完成加载操作的
        if (lazy && data && 'loaded' in data && !data.loaded) {
          // 执行加载动作并展开
          return loadData(row, id, data)
        }
      }
      return toggleRowExpansion(row, expanded)
    },
    handleScroll() {
      const popovers = $('body>.el-tooltip__popper')
      const len = popovers.length - 1
      if (popovers[len]) {
        popovers[len].style.display = 'none'
      }
    },
    clearSingleSelect() {
      this.scopeRadio = ''
      this.singleSelectedItem = null
      this.selectionCount = 0
      this.$emit('selection-change', null)
    },
    singleSelectChange(index, row) {
      this.singleSelectedItem = row
      this.selectionCount = 1
      this.$emit('selection-change', row)
    },
    onlyTwoChange(del_row) {
      this.$refs.table.toggleRowSelection(del_row, false) // 用于多选表格，切换某一行的选中状态，如果使用了第二个参数，则是设置这一行选中与否（selected 为 true 则选中）
    },
    emitElementMethod() {
      const ElementMethods = [
        'clearSelection',
        // 'toggleRowSelection',
        'toggleAllSelection',
        // 'toggleRowExpansion',
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
    toggleRowSelection(row, selected) {
      if (this.singleSelect) {
        if (selected) {
          this.singleSelectedItem = row
          if (this.rowKey) {
            this.scopeRadio = getRowIdentity(row, this.rowKey) || ''
          } else {
            let index = (this.$attrs.data || []).findIndex(item => {
              return item === this.singleSelectedItem
            })
            this.scopeRadio = index === -1 ? '' : index
          }
        } else {
          this.singleSelectedItem = null
          this.scopeRadio = ''
        }
      }
      // if (this.dataSelectable) {
      return this.$refs.table?.toggleRowSelection(row, selected)
      // }
    },
    setColumnSelection() {
      /**
       * setTimeout用于屏蔽created的影响
       * */
      setTimeout(() => {
        this.$refs.columnSetting.prepareWidgetSetting(config => {
          const allColumnsMap = new Map()
          this.allColumns
            .filter(i => i.prop)
            .forEach(item => {
              allColumnsMap.set(item.prop, item)
            })
          const columns = []
          config.forEach(c => {
            if (c.visible) {
              const column = allColumnsMap.get(c.prop)
              if (isNaN(c.width)) {
                column.width = undefined
              } else {
                column.width = parseInt(c.width)
                column.minWidth = undefined
              }
              columns.push(column)
            }
          })
          // 未填写prop的列将置于末尾
          this.allColumns
            .filter(i => !i.prop)
            .forEach(column => {
              columns.push(column)
            })
          this.columns = columns
          setTimeout(() => {
            this.configurationLoaded = true
          })
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
    saveConfiguration() {
      if (!this.componentCaseName && this.componentCaseName !== 0) {
        console.error('组件实例名称错误,请联系攻城狮修改代码！')
      }
      const widgetId = 'TABLE-COLUMNS-SETTING-' + this.componentCaseName
      this.$http
        .post(this.$url + '/service/dashboard/widgets', {
          widgetId: widgetId,
          content: JSON.stringify(this.columnSelected),
        })
        .then(() => {})
        .catch(e => {
          this.showFailure(e)
        })
    },
    handleSelectedChange(config) {
      const allColumnsMap = new Map()
      this.allColumns
        .filter(i => i.prop)
        .forEach(item => {
          allColumnsMap.set(item.prop, item)
        })
      const columns = []
      config.forEach(c => {
        if (c.visible) {
          const column = allColumnsMap.get(c.prop)
          if (isNaN(c.width)) {
            column.width = undefined
          } else {
            column.width = parseInt(c.width)
            column.minWidth = undefined
          }
          columns.push(column)
        }
      })
      // 未填写prop的列将置于末尾
      this.allColumns
        .filter(i => !i.prop)
        .forEach(column => {
          columns.push(column)
        })
      this.columns = columns
      this.tableKey++
      setTimeout(() => {
        this.addDomEventListeners()
      })
    },
    callColumnSetting() {
      this.$refs.columnSetting.callDialog()
    },
    handleUpdateSetting(config) {
      this.handleSelectedChange(config)
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
    '$attrs.data'(newVal, oldVal) {
      this.showEmpty = true
      this.$nextTick(() => {
        let clearRadio = false

        let handleChange = () => {
          if (newVal !== oldVal) {
            clearRadio = true
          } else {
            let index = (newVal || []).findIndex(item => {
              if (this.rowKey) {
                return this.scopeRadio === getRowIdentity(item, this.rowKey)
              } else {
                return item === this.singleSelectedItem
              }
            })

            if (index !== -1) {
              // 保留旧的选中项
              if (!this.rowKey) {
                this.scopeRadio = index
              }
            } else {
              clearRadio = true
            }
          }
        }
        // 是否有选中值, 没有就不处理
        if (this.scopeRadio || this.scopeRadio === 0) {
          if (this.rowKey) {
            if (this.reserveSelection) {
              // 保留原本选中的数据, 不清空
              // 由于存在 scopeRadio 的值, 如果切换分页时到了选中页, 会自动选中
            } else {
              handleChange()
            }
          } else {
            handleChange()
          }
        }
        if (clearRadio) {
          this.clearSingleSelect()
        }
        this.$refs.table.doLayout()
      })
    },
  },
}
