// import { AgGridVue } from 'ag-grid-vue'
import HTTP from '@/http/main'
export default {
  props: ['rawData', 'disableShowColumn'],
  // components: { AgGridVue },
  data() {
    return {
      frameworkComponents: null,

      activeTypeName: 'source',
      tableCal: 0,

      tableDetail: {},
      steps: [],
      defaultProps: {},
      clickedCategories: [],
      modelCategory: null,

      stepId: undefined,
      selection: [],
      step: {},
      firstTime: true,
      model: null,
      dataSources: [],
      ddmModelsMap: {},
      disableButton: false,
      bindOnTable: this.disableShowColumn,
      keyword: '',
      firstLoaded: true,
    }
  },
  mounted() {
    //  this.getSteps();
    this.getTableDetail()
    if (this.$ddmConnectable) {
      this.getDDMModel()
    }
  },
  watch: {
    keyword() {
      this.getSteps()
    },
  },
  methods: {
    getDDMModel() {
      // this.$http.get(this.$url + '/service/models/ddm/models')
      HTTP.getAllModels()
        .then(res => {
          const data = _.cloneDeep(res.data)
          this.ddmModelsMap = {}
          data.children.forEach(department => {
            if (department.children) {
              department.children.forEach(category => {
                if (category.models) {
                  category.models.forEach(model => {
                    model.ddmModel = true
                  })
                  const lastIndex = category.name.lastIndexOf('(')
                  if (lastIndex !== -1) {
                    category.name = category.name.slice(0, lastIndex)
                  } else {
                  }
                  this.ddmModelsMap[category.name] = category.models
                }
              })
            }
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleModelCategoryChange() {
      if (!this.firstTime) {
        this.model = null
      }
      this.innerLoadDataSources()
      this.firstTime = false
    },
    innerLoadDataSources: function () {
      if (!this.modelCategory) {
        this.dataSources = []
        return
      }

      let getUrl =
        this.$url + '/service/models/category/' + this.modelCategory.categoryId
      getUrl += '/simple'
      this.$http
        .get(getUrl)
        .then(res => {
          res.data.forEach(item => {
            item.ddmModel = false
            item.name = item.definition
            item.id = item.modelId
          })
          this.dataSources = res.data
          if (
            this.$ddmConnectable &&
            this.ddmModelsMap[this.modelCategory.categoryName]
          ) {
            this.dataSources = this.dataSources.concat(
              this.ddmModelsMap[this.modelCategory.categoryName]
            )
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    selectable(row, index) {
      return !row.isBind
    },
    handleTabClick(tab) {
      this.activeTypeName = tab.name
      this.firstLoaded = true
      this.getSteps()
    },
    getSteps() {
      this.steps = []
      const allSteps = _.cloneDeep(this.rawData.steps)
      for (const index in allSteps) {
        const step = allSteps[index]
        if (step.name.toLowerCase().indexOf(this.keyword.toLowerCase()) > -1) {
          if (
            (this.activeTypeName === 'source' &&
              step.properties.$input_table) ||
            (this.activeTypeName === 'target' && step.properties.$output_table)
          ) {
            this.steps.push(step)
            for (const i in step.properties) {
              if (i.indexOf('$') === 0) {
                delete step.properties[i]
              }
            }
          }
        }
      }
      if (this.firstLoaded) {
        this.firstLoaded = false
        // setTimeout(()=>{
        //   $('.el-checkbox__input')[0].click();
        // });
      }

      const detail = this.tableDetail
      this.steps.forEach(step => {
        if (detail[step.id]) {
          step.isBind = true
          step.bindTo =
            detail[step.id].modelCategoryName +
            ' / ' +
            detail[step.id].modelName +
            ' / ' +
            detail[step.id].tableName
          step.ddmStep = detail[step.id].ddmStep
        } else {
          step.isBind = false
        }
      })
      this.$utils.sort.sort(this.steps)
    },

    getTableDetail() {
      const lineageId = this.$route.query.id
      this.$http
        .get(
          this.$url +
            '/service/lineage/endpoints/lineage?lineageId=' +
            lineageId
        )
        .then(res => {
          this.tableDetail = {}
          res.data.forEach(item => {
            this.tableDetail[item.stepId] = item
          })
          this.getSteps()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    showTableDetail(data) {},
    getTableBindMessage(lineageId, step) {
      this.$http
        .get(
          this.$url +
            '/service/lineage/endpoints/lineage?lineageId=' +
            lineageId +
            '&stepId=' +
            step.id
        )
        .then(res => {
          if (res.data.length === 0) {
            step.isBind = false
          } else {
            step.isBind = true
            this.tableCal++
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleSelectionChange(selection) {
      this.selection = selection
    },

    unbind(row) {
      this.disableButton = true
      const stepId = row.id
      this.$http
        .put(
          this.$url +
            '/service/lineage/' +
            this.$route.query.id +
            '/unbind?stepId=' +
            stepId
        )
        .then(res => {
          this.$message.success(this.$t('meta.DS.message.unbindSucceed'))
          this.getTableDetail()
          this.disableButton = false
        })
        .catch(e => {
          this.$showFailure(e)
          this.disableButton = false
        })
    },
    bind(from, category) {
      let categoryId
      if (this.selection.length === 0) {
        this.$message.error(
          this.$t('meta.lineageManage.bindCatefory.canNotBindWithoutTable')
        )
      }
      if (from === 'favourite') {
      } else {
        if (!this.model) {
          this.$message.error(
            this.$t(
              'meta.lineageManage.bindCatefory.canNotBindWithoutDataSource'
            )
          )
          return
        }
        let exist = false
        this.clickedCategories.forEach(item => {
          if (item.modelName === this.model.name) {
            exist = true
          }
        })
        if (!exist) {
          this.clickedCategories.push({
            categoryName: this.modelCategory.categoryName,
            categoryAbbreviation: this.modelCategory.categoryAbbreviation,
            modelName: this.model.name,
            ddmModel: this.model.ddmModel,
            model: _.cloneDeep(this.model),
          })
        }
      }
      if (from === 'favourite') {
        categoryId = category.categoryId
        this.model = category.model
      } else {
        categoryId = this.modelCategory.categoryId
      }
      const length = this.selection.length
      let successCount = 0
      this.disableButton = true
      const errorMsg = ''
      this.selection.forEach((item, i) => {
        const requestUrl =
          this.$url +
          '/service/lineage/' +
          this.$route.query.id +
          '/bind?stepId=' +
          item.id +
          '&modelId=' +
          this.model.id +
          '&ddmModel=' +
          this.model.ddmModel +
          '&bindOnTable=' +
          this.bindOnTable
        this.$http
          .post(requestUrl)
          .then(res => {
            if (i + 1 === this.selection.length) {
              this.$message.success(
                this.$t('quality.page.dataQualityRepairJob.operationSucceed')
              )
            }
            successCount++
            if (successCount === length) {
              this.getTableDetail()
              this.disableButton = false
            }
            if (from !== 'favourite') {
              this.modelCategory = null
              this.model = null
            }
          })
          .catch(e => {
            successCount++
            this.$showFailure(e)
            this.disableButton = false
          })
      })
    },
    onGridReady() {},
  },
}
