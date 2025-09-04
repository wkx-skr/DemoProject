import dbType from '@/components/dataSource/databaseType'
import HTTP from '@/resource/http'
import knowledgeGraph from '@/dataWarehouse/views/dataIndex/damComponents/knowledgeGraph.vue'
import udpFormLabel from '@/views/archy/enterpriseLogicalModel/udpFormLabel.vue'

export default {
  data () {
    return {
      isEN: window.lang === 'English',
      nodeData: [],
      currentTab: 'info',
      additionalPropertiesObj: {},
      tableData: [],
      pageSize: 20,
      currentPage: 1,
      total: 0,
      keyword: '',
      modelFilters: [],
      databaseType: '',
      allDepartmentList: []
    }
  },
  components: {
    knowledgeGraph,
    udpFormLabel
  },
  computed: {
    viewDetailName () {
      return this.allDepartmentMap[this.viewDetailObj.itDepartment]?.fullName
    },
    businessDetailName () {
      return this.allDepartmentMap[this.viewDetailObj.businessDepartment]?.fullName
    }
  },
  props: {
    viewDetailObj: {},
    udps: {},
    allDepartmentMap: {}
  },
  beforeMount () {
    let subTree = _.cloneDeep(dbType.DB_TYPE_TREE.subTree)
    this.modelFilters = subTree
  },
  mounted () {
    if (this.viewDetailObj) {
      let path = []
      path = this.viewDetailObj.path.split('/')
      path.forEach(element => {
        this.nodeData.push({
          name: element,
          couldClick: false
        })
      })
      this.nodeData.push({
        name: this.viewDetailObj.name,
        couldClick: false
      })
      this.nodeData.push({
        name: '查看',
        couldClick: false
      })
      if (this.viewDetailObj?.additionalProperties !== null) {
        this.additionalPropertiesObj = this.viewDetailObj?.additionalProperties
      } else {
        this.additionalPropertiesObj = {}
      }
      this.getUserName(this.viewDetailObj.owner)
      // this.getOrgList()
    }
  },
  methods: {
    // 获取所有的机构，并将返回的树形数据 转换成 数组
    getOrgList () {
      this.$http
        .get('/user/org/organization/tree/')
        .then(res => {
          this.allDepartmentList = this.flatten([res.data])
        })
    },
    // 将嵌套数据 拍平成 数组
    flatten (sourceArray, flattenedArray = []) {
      for (const element of sourceArray) {
        if (Array.isArray(element.children) && element.children.length > 0) {
          flattenedArray.push({
            ...element,
            children: []
          })
          this.flatten(element.children, flattenedArray)
        } else {
          flattenedArray.push(element)
        }
      }
      return flattenedArray
    },
    getUserName (name) {
      this.$http
        .get('/user/usermanagement/users/' + name)
        .then(res => {
          this.$set(this.viewDetailObj, 'ownerfullName', res.data.fullUserName)
        })
        .catch(e => this.$showFailure(e))
    },
    goModel (row) {
      this.$skip2({
        type: 'model',
        objectId: row.id
      })
      // const pos = location.href.indexOf('#/')
      // const baseUrl = location.href.slice(0, pos + 2)
      // window.open(baseUrl + `main/list?id=${row.id}&pId=${row.categoryId}`, '_blank')
    },
    changedatabaseType (value) {
      this.getSysModels()
    },
    handleSizeChange (val) {
      this.pageSize = val
      this.currentPage = 1
      this.getSysModels()
    },
    handleCurrentChange (val) {
      this.currentPage = val
      this.getSysModels()
    },
    getSysModels () {
      let obj = {
        systemId: this.viewDetailObj.id,
        name: this.keyword,
        modelType: this.databaseType
      }
      this.$http.post(`${HTTP.$archyServerUrl}model/models?pageSize=${this.pageSize}&currentPage=${this.currentPage}`, obj)
        .then(res => {
          this.tableData = res.data.content
          // this.tableData = res.data.content
          this.total = res.data.totalElements
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    tabChange (tab, event) {
      if (tab.name === 'model') {
        this.getSysModels()
      }
    },
    backClick () {
      this.$emit('openViewDetail', '')
    }
  },
  watch: {
    keyword (value) {
      this.currentPage = 1
      this.getSysModels()
    }
  }
}
