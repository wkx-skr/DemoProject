import autoTable from './autoTable.vue'
export default {
  props: ['data'],
  components: {
    autoTable,
  },
  mounted() {},
  data() {
    return {
      activeName: 'basic',
      environmentData: [
        //        {label:'开发环境1',value:'Dev-DB1'},
        //        {label:'开发环境2',value:'Dev-DB2'},
        //        {label:'测试环境1',value:'Test-DB1'},
        //        {label:'准生产环境',value:'Pre-Pro-DB'},
        //        {label:'生产环境',value:'Pro-DB'},
      ],
      basicData: [
        {
          label: this.$t('meta.map.zone'),
          value: this.data.zone,
        },
        {
          label: this.$t('meta.map.itDepartment'),
          value: this.data.itDepartment,
        },
        {
          label: this.$t('meta.map.owner'),
          value: this.data.owner,
        },
        {
          label: this.$t('meta.map.status'),
          value: this.data.status,
        },
        {
          label: this.$t('meta.map.deployment'),
          value: this.data.deployment,
        },
      ],
      callData: [],
      tableData: [],
      modelData: [],
      keyword: '',
    }
  },
  watch: {
    keyword(newVal, oldVal) {
      if (oldVal && !newVal) {
        this.getTableData()
      }
    },
  },
  methods: {
    handleTabClick() {
      switch (this.activeName) {
        case 'call':
          if (this.callData.length === 0) {
            this.getCallData()
          }
          break
        case 'table':
          if (this.tableData.length === 0) {
            this.getTableData()
          }
          break
        case 'model':
          if (this.modelData.length === 0) {
            this.getModelData()
          }
          break
        case 'environment':
          if (
            this.$customerId === 'gszc' &&
            this.environmentData.length === 0
          ) {
            this.getEnvironmentData()
          }
          break
        default:
          break
      }
    },
    getEnvironmentData() {
      const modelCategoryId = this.data.categoryId
      const url = `${this.$url}/service/models/category/${modelCategoryId}`
      this.$http
        .get(url)
        .then(res => {
          this.environmentData = []
          if (Array.isArray(res.data)) {
            res.data.forEach(item => {
              if (item.connectionInfo.parameterMap.Zone) {
                this.environmentData.push({
                  label: item.connectionInfo.parameterMap.Zone,
                  value: item.definition,
                  detail: item,
                })
              }
            })
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getModelPlain() {
      const modelId = 4598700
      const url = `${this.$meta_url}/service/models/${modelId}/plain`
      this.$http.get(url).then(res => {})
    },
    jumpToModel(row) {
      this.$emit('jump-to-source', { catId1: row.detail.categoryId })
      const index = row.detail.categoryName.indexOf('(')
      const cat = row.detail.categoryName.slice(0, index)
      this.$emit('show-model-detail', {
        modelId: row.detail.modelId,
        catId: row.detail.categoryId,
        cat: cat,
        model: row.detail.definition,
      })
    },
    getModelData() {
      const modelCategoryId = this.data.categoryId
      const url = `${this.$meta_url}/models/ddm/systems/${modelCategoryId}/models`
      this.$http
        .get(url)
        .then(res => {
          this.modelData = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getCallData() {
      const id = this.data.categoryId
      if (!id) {
        return
      }

      const callMap = {}

      this.$http
        .post(`${this.$meta_url}/service/systemcall/search`, {
          currentPage: 0,
          pageSize: 500,
          srcModelCategoryIds: [id],
        })
        .then(res => {
          const srcContent = res.data.content
          srcContent.forEach(item => {
            const id = 'out:' + item.calleeModelCategoryId
            if (!callMap.hasOwnProperty(id)) {
              callMap[id] = []
            }
            callMap[id].push(item)
          })
          this.$http
            .post(`${this.$meta_url}/service/systemcall/search`, {
              currentPage: 0,
              pageSize: 500,
              dstModelCategoryIds: [id],
            })
            .then(res => {
              res.data.content.forEach(item => {
                const id = 'in:' + item.callerModelCategoryId
                if (!callMap.hasOwnProperty(id)) {
                  callMap[id] = []
                }
                callMap[id].push(item)
              })
              this.handleCallMap(callMap)
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleCallMap(callMap) {
      this.callData = []

      for (const index in callMap) {
        const dir = index.split(':')[0]
        const categoryId = index.split(':')[1]
        const details = callMap[index]
        const length = details.length
        this.callData.push({
          dir: dir,
          categoryId: categoryId,
          categoryName:
            this.$modelCategoriesDetailsMap[categoryId].categoryName,
          //            details:details,
          length: length,
          icon: 'call',
        })
      }
    },
    getTableData() {
      this.$http
        .post(`${this.$meta_url}/service/entities/searchMetadata`, {
          currentPage: 1,
          keyword: this.keyword,
          pageSize: 500,
          types: ['TABLE'],
        })
        .then(res => {
          this.tableData = res.data.content
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    search() {
      this.getTableData()
    },
    handleCallClick(row) {
      this.$emit('row-click', { data: row, type: 'call' })
    },
  },
}
