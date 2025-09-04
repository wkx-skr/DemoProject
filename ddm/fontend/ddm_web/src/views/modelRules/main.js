import HTTP from '@/resource/http'
import _ from 'lodash'
import modelRulesList from './modelRulesList.vue'
import addModelRules from './addModelRules.vue'
import dbType from '@/components/dataSource/databaseType.js'

export default {
  data () {
    return {
      currentTab: '',
      breadcrumbData: ['模型检查规则'],
      // tabsArr: [],
      pageName: this.$v.RuleChecking.modelCheckRuleList, // '模型检查规则列表',
      typeState: '',
      databaseTypeListPromise: null,
      databaseTypeMap: {},
      rulesData: {}
    }
  },
  components: {
    modelRulesList,
    addModelRules
  },
  beforeMount () {
  },
  created () {
    this.getDatabaseTypePromise()
  },
  methods: {
    // 获取数据库类型的 promise
    getDatabaseTypePromise () {
      this.databaseTypeListPromise = new Promise((resolve, reject) => {
        resolve({ data: dbType.DB_TYPE_TREE })
      })

      this.databaseTypeListPromise
        .then(res => {
          let databaseTypeMap = {}
          let data = res.data?.subTree || []
          data.forEach(item => {
            let dataSourceTypeList = item.dataSourceTypeList || []
            dataSourceTypeList.forEach(db => {
              databaseTypeMap[db.second] = db.text2 || db.text
            })
          })
          this.databaseTypeMap = databaseTypeMap
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // databaseTypeForma
    // 格式化数据库类型名称
    databaseTypeFormat (type) {

    },
    removeTab () {
      this.currentTab = ''
    },
    addModel (para = {}, type) {
      let tabName = 'addUdp'
      if (para.code) {
        this.typeState = type
        this.rulesData = para
        tabName = para.id + 'edit'
        let tab = {
          type: 'editUdp',
          name: tabName,
          label: para.code,
          orginData: para
        }
        this.tabAdd(tab)
        this.breadcrumbData = ['模型检查规则', para.code]
      } else {
        this.typeState = 'add'
        this.rulesData = {}
        let tab = {
          type: tabName,
          name: tabName,
          label: this.$v.RuleChecking.createRule, // '创建规则',
          orginData: { id: 'add' }
        }
        this.tabAdd(tab)

        this.breadcrumbData = ['模型检查规则', '新增规则']
      }
      this.currentTab = tabName
    },
    initUdpCategories () {
      let para = {
        successCallback: data => {
          this.refreshUdpCategories(data)
        },
        failureCallback: e => {
          this.$showFailure(e)
        }
      }
      HTTP.getUdpCategories(para)

      let urlPara = {
        successCallback: data => {
          if (!data || !Array.isArray(data)) {
            data = []
          }
          // 业务条线
          this.$globalData.udpCategories = data
        },
        failureCallback: (e) => {
          this.$showFailure(e)
        }
      }
      HTTP.getUdpCategories(urlPara)
    },
    refreshUdpCategories (data) {
      // 所有的 分类
      let udpCategoryArr = []
      let categoryMap = {}
      if (data && Array.isArray(data)) {
        data.forEach(item => {
          if (item.category) {
            categoryMap[item.category] = true
          }
        })
        udpCategoryArr = Object.keys(categoryMap)
        // this.$globalData.udpCategories = data
        this.$globalData.udpCategoryArr = udpCategoryArr
      } else {
        // this.$globalData.udpCategories = []
        this.$globalData.udpCategoryArr = []
      }
    },
    editSuccesed () {
      this.removeTab()
      if (this.$refs.modelRulesList && this.$refs.modelRulesList.getEntriesSearch) {
        this.$refs.modelRulesList.getEntriesSearch()
      }
    },
    showHistory (para) {
      let tabName = para.id + 'history'
      let tab = {
        type: 'history',
        name: tabName,
        label: para.name + this.$v.RuleChecking.history,
        currentUdpId: para.udpId
      }
      this.tabAdd(tab)
    },
    tabAdd (tab) {
      this.currentTab = tab.name
    },
    goBack () {
      this.currentTab = ''
    }
  },
  watch: {

  },
  computed: {
    // showTabs () {
    //   return this.tabsArr && this.tabsArr.length > 0
    // }
  }
}
