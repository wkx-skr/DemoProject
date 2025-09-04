/** * 将系统按IT部门分类, 显示为联级选择器 * 接收属性: * systems: 系统数组[],
choosedSystem: id, 选中的系统ID(默认值), isDisable: function
判断某一项是否可用(参数, category, return bool) disabled: boolean
联级选择器是否禁用 size: String 样式 isAll: 是否显示所有系统 withAbbre:
Boolean是否显示英文缩写, */

<template>
  <el-cascader
    placeholder="请选择系统"
    filterable
    clearable
    :options="optSystems"
    :props="{}"
    :show-all-levels="false"
    :change-on-select="false"
    :disabled="disabled"
    :size="size"
    :value="selectedSystem"
    @change="changeSys"
  ></el-cascader>
</template>

<script>
export default {
  props: {
    systems: {
      // 备选项
      type: Array,
    },
    choosedSystem: {
      // 选中项
      type: [String, Number],
    },
    isDisable: {
      // 判断每一项是否可用
      type: Function,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String,
      default: 'mini',
    },
    isAll: {
      type: Boolean,
      default: true,
    },
    withAbbre: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      optSystems: [],
      selectedSystem: [],
      itDepMap: {}, // sysId => itDepName
    }
  },
  components: {},
  computed: {},
  mounted() {
    this.dataInit()
  },
  methods: {
    dataInit() {
      this.getAllSystems()
    },
    changeSys(arr) {
      let sysId = ''
      sysId = arr[arr.length - 1]
      this.$emit('change', sysId)
    },
    getAllSystems() {
      const initSys = () => {
        const itDepArr = []
        const itMap = {} // itDepName => [systems]
        const testMap = {}
        let catAttr = ''
        if (!this.isAll) {
          if (this.systems.length > 0 && this.systems[0].categoryId) {
            catAttr = 'categoryId'
          } else {
            catAttr = 'id' // 当输入备选没有 categoryId 属性, 以后按需要修改
          }
          this.systems.forEach(item => {
            testMap[item.catAttr] = true
          })
        }
        this.$modelCategories.forEach(item => {
          if (this.isAll || testMap[item.catAttr]) {
            this.itDepMap[item.categoryId] = item.itDepartment
            if (!itMap[item.itDepartment]) {
              const arr = []
              const obj = {
                label: item.itDepartment,
                value: item.itDepartment,
                children: arr,
              }
              itMap[item.itDepartment] = arr
              itDepArr.push(obj)
            }
            const obj = {
              value: item.categoryId,
            }
            if (this.isDisable) {
              const bool = this.isDisable(item)
              obj.disabled = bool
            }
            if (this.withAbbre) {
              obj.label = this.$modelCategoriesMap[item.categoryId]
            } else {
              obj.label = item.categoryName
            }
            itMap[item.itDepartment].push(obj)
          }
        })
        this.$utils.sort.sortConsiderChineseNumber(itDepArr, 'label')
        itDepArr.forEach(item => {
          this.$utils.sort.sortConsiderChineseNumber(item.children, 'label')
        })
        this.optSystems = itDepArr
        if (this.choosedSystem) {
          const arr = [this.itDepMap[this.choosedSystem], this.choosedSystem]
          this.selectedSystem = arr
        }
      }
      this.$getModelCategories(initSys)
    },
  },
  watch: {},
}
</script>

<style lang="scss" scoped></style>
