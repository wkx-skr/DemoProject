import HTTP from '@/resource/http'
import _ from 'lodash'
import LDMTypes from '@constant/LDMTypes'
import string from '@/resource/utils/string'
import sort from '@/resource/utils/sort'
import udpList from './udpList.vue'
import editUdp from './editUdp.vue'
import udpHistory from './udpHistory.vue'

export default {
  data () {
    return {
      LDMTypes,
      currentTab: 'baseTab',
      pageName: this.$v.udp.udpAttribute, // '自定义属性',
      tabsArr: [],
      // valueTypeArr: ['STRING', 'INTEGER', 'DOUBLE', 'DATETIME'],
      valueTypeArr: [
        { value: 'STRING', label: 'STRING' },
        { value: 'LONGTEXT', label: 'LONGTEXT' },
        { value: 'INTEGER', label: 'INTEGER' },
        { value: 'DOUBLE', label: 'DOUBLE' },
        { value: 'DATETIME', label: 'DATETIME' }
      ],
      targetTypeArr: [
        { type: 'ModelMart', typeId: 80000000, label: this.$v.udp.Model }, // 模型
        { type: 'Diagram', typeId: 80000006, label: this.$v.udp.category }, // 主题域
        { type: 'BusinessObject', typeId: LDMTypes.BusinessObject, label: '业务对象' }, // 业务对象
        { type: 'Entity', typeId: 80000004, label: this.$v.udp.table }, // 表
        { type: 'Attribute', typeId: 80000005, label: this.$v.udp.column }, // 字段
        { type: 'View', typeId: 80500008, label: this.$v.udp.view } // 视图
      ],
      udpCategoriesReady: false,
      tabPageArr: [], // 属性分页备选项
      udpObjArr: {}, // 数据按 属性对象 分类
      udpMap: {}, // 自定义属性 udpId => item
      currentUdpId: '',
      breadcrumbData: [],
      currentTabData: null,
      defaultObjectType: ''
    }
  },
  components: {
    udpList,
    editUdp,
    udpHistory
  },
  props: {
    inDialog: {
      type: Boolean,
      default: false
    }
  },
  beforeMount () {
    this.initUdpCategories()
  },
  mounted () {
  },
  methods: {
    removeTab (para) {
      this.currentTabData = null
      this.breadcrumbData = []
      if (this.$refs.udpList && this.$refs.udpList.refreshTable) {
        this.$refs.udpList.refreshTable()
      }
      // let index = this.tabsArr.findIndex(item => item.name === para)
      // // console.log(index, 'index')
      // if (index !== -1) {
      //   this.tabsArr.splice(index, 1)
      //   this.currentTab = 'baseTab'
      // }
    },
    addUdpTab (para = {}) {
      this.defaultObjectType = para.currentTab || ''
      let tabName = 'addUdp'
      let tab = null
      if (para.name) {
        tabName = para.id + 'edit'
        tab = {
          type: 'editUdp',
          name: tabName,
          label: para.name,
          orginData: para
        }
        // this.tabAdd(tab)
      } else {
        tab = {
          type: tabName,
          name: tabName,
          label: this.$v.udp.addAttribute, // '添加自定义属性',
          orginData: { id: 'add' }
        }
        // this.tabAdd(tab)
      }
      this.currentTab = tabName
      this.currentTabData = tab
      this.breadcrumbData = ['自定义属性', para.name || '新增属性']
    },
    // 初始化业务条线备选项
    initUdpCategories () {
      let para = {
        successCallback: data => {
          if (!data || !Array.isArray(data)) {
            data = []
          }
          // 业务条线
          this.$globalData.udpCategories = data

          this.udpCategoriesReady = true
        },
        failureCallback: e => {
          this.$showFailure(e)
        }
      }
      HTTP.getUdpCategories(para)
        .then(res => {})
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 获取所有 udp 数据, 进行处理
    refreshUdpCategories (data) {
      // 获取所有 属性分类, 属性页签, 业务条线, 用于筛选与下拉框
      let udpCategoryArr = []
      let categoryMap = {}
      let udpMap = {}
      let udpObjArr = {
        // 80000000: [], // 模型
        // 80000006: [], // 主题域
        // 80000004: [], // 表
        // 80000005: [], // 字段
        // 80500008: [] // 视图
      }
      this.targetTypeArr.forEach(item => {
        udpObjArr[item.typeId] = []
      })
      // 页签
      let tabPageArr = new Set()
      if (data && Array.isArray(data)) {
        data.forEach(item => {
          if (item.category) {
            categoryMap[item.category] = true
          }

          udpMap[item.udpId] = item

          if (item.targetTypes && item.targetTypes[0]) {
            udpObjArr[item.targetTypes[0]].push(item)
          }

          if (item.tabPage) {
            tabPageArr.add(item.tabPage)
          }
        })
        udpCategoryArr = Object.keys(categoryMap)

        let circulationArr = null
        // 关联 parent 和 children, 获取每个节点的所有后代节点,
        // 即将节点存入它的所有祖先节点的 children 中
        data.forEach(item => {
          let obj = item

          while (obj.parentUdpId && udpMap[obj.parentUdpId]) {
            let parent = udpMap[obj.parentUdpId]
            // 循环引用时, 报错
            if (parent === item) {
              circulationArr = item.children
              break
            }
            if (parent) {
              if (!parent.children) {
                parent.children = []
              }
              parent.children.push(item)
            }
            obj = parent
          }
        })
        if (circulationArr) {
          this.$datablauMessage.error(`自定义属性 '${circulationArr.map(item => item.name || '').join(',')}' 存在循环引用`)
        }
      }

      this.tabPageArr = [...tabPageArr]
      this.udpObjArr = udpObjArr
      this.udpMap = udpMap
      this.$globalData.udpCategoryArr = udpCategoryArr
    },
    editSuccesed (tabName) {
      this.removeTab(tabName)
      if (this.$refs.udpList && this.$refs.udpList.refreshTable) {
        this.$refs.udpList.refreshTable()
      }
    },
    showHistory (para) {
      // console.log(para, 'para')
      // this.currentUdpId = para.data.udpId
      let tabName = para.id + 'history'
      let tab = {
        type: 'history',
        name: tabName,
        label: `"${para.name}"` + ' ' + this.$v.udp.history,
        currentUdpId: para.udpId
      }
      // this.tabAdd(tab)
      this.currentTabData = tab
      this.breadcrumbData = ['自定义属性', `"${para.name}"` + ' ' + this.$v.udp.history]
    },
    tabAdd (tab) {
      if (!this.tabsArr.some(item => item.name === tab.name)) {
        this.tabsArr.push(tab)
      }
      this.currentTab = tab.name
    },
    goBack () {
      this.removeTab()
    }
  },
  watch: {

  },
  computed: {
    showTabs () {
      return this.tabsArr && this.tabsArr.length > 0
    }
  }
}
