import SetUdp from '@/view/dataProperty/meta/setUdp.vue'
import ModelCategoryController from '../../../../base-components/http/baseController/ModelCategoryController.ts'
var no_result = 'No Result'
export default {
  components: {
    SetUdp,
  },
  data() {
    return {
      writable: true,
      tableKey: 0,
      multipleSelection: [],
      keyword: '',
      rawData: [],
      categories: [],
      categoriesDisplay: null,
      currentPage: 1,
      pageSize: 20,
      total: 0,
      deleteCategoriesDisabled: true,
      pageLocker: false,
      // dupTest: {},
      itDepsArr: [],
      zoneArr: [],
      busDepArr: [],
      udpDialogVisible: false,
      uploadUrl: ModelCategoryController.uploadModelCategories(),
    }
  },
  watch: {
    keyword() {
      this.filt()
    },
  },
  mounted() {
    const self = this
    this.loadAllCategories()
    this.$bus.$on('reloadCategory', arg => {
      if (arg === 'currentPage') {
        this.reload('currentPage')
      } else {
        this.reload()
      }
      this.$refs.multipleTable.clearSort()
      this.$refs.multipleTable.columnConfig.order = ''
    })
  },

  beforeDestroy() {
    this.$bus.$off('reloadCategory')
  },
  methods: {
    closeSetUp() {
      this.udpDialogVisible = false
    },
    getAssignedData() {
      if (this.$route.query.id) {
        this.rawData.forEach(category => {
          if (category.categoryId == this.$route.query.id) {
            this.$bus.$emit('addCategory', _.clone(category))
          }
        })
      }
    },
    reload(arg) {
      this.loadAllCategories(arg)
    },
    add() {
      this.$bus.$emit('showAddTab')
    },
    handleEdit($index) {
      const category = this.categoriesDisplay[$index]
      const cate = _.clone(category)
      this.$bus.$emit('addCategory', cate)
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
      this.deleteCategoriesDisabled = this.multipleSelection.length == 0
    },
    templateDownload() {
      this.$downloadFilePost(
        ModelCategoryController.exportModelCategoryTemplate()
      )
    },
    loadAllCategories(arg) {
      this.$getModelCategories(() => {
        this.rawData = this.$modelCategories
        const itDupTest = {}
        const zoneDupTest = {}
        const busDupTest = {}
        this.itDepsArr = []
        this.zoneArr = []
        this.busDepArr = []
        const pushObj = (arr, map, item, attr) => {
          if ((item[attr] || item[attr] === 0) && !map[item[attr]]) {
            const obj = { name: item[attr] }
            arr.push(obj)
            map[item[attr]] = true
          }
        }
        this.$modelCategories.forEach(item => {
          pushObj(this.itDepsArr, itDupTest, item, 'itDepartment')
          pushObj(this.zoneArr, zoneDupTest, item, 'zone')
          pushObj(this.busDepArr, busDupTest, item, 'businessDepartment')
          // if(!itDupTest[item.itDepartment]) {
          //   let obj = {
          //     name: item.itDepartment,
          //   };
          //   this.itDepsArr.push(obj);
          //   itDupTest[item.itDepartment] = true;
          // }
          // if(item.zone && !zoneDupTest[item.zone]) {
          //   let obj = {
          //     name: item.zone,
          //   };
          //   this.zoneArr.push(obj);
          //   zoneDupTest[item.zone] = true;
          // }
          // if(item.businessDepartment && !busDupTest[item.businessDepartment]) {
          //   let obj = {
          //     name: item.businessDepartment,
          //   };
          //   this.busDepArr.push(obj);
          //   busDupTest[item.businessDepartment] = true;
          // }
        })
        this.$utils.sort.sortConsiderChineseNumber(this.itDepsArr)
        this.$utils.sort.sortConsiderChineseNumber(this.zoneArr)
        this.$utils.sort.sortConsiderChineseNumber(this.busDepArr)
        this.$emit('getItPars', {
          itDepsArr: this.itDepsArr,
          zoneArr: this.zoneArr,
          busDepArr: this.busDepArr,
        })
        this.filt(arg)
        this.getAssignedData()
      })
    },
    handleSortChange(arg) {
      this.filt(null, arg.prop, arg.order)
    },
    filt(arg, propertyName = 'categoryId', order = 'descending') {
      const self = this
      self.categories = []
      this.rawData.forEach(item => {
        if (
          this.$MatchKeyword(
            item,
            this.keyword,
            'categoryName',
            'categoryAbbreviation'
          )
        ) {
          self.categories.push(item)
        }
      })
      if (propertyName) {
        this.$utils.sort.sortConsiderChineseNumber(
          this.categories,
          propertyName,
          order
        )
      }
      this.total = this.categories.length
      if (arg === 'currentPage') {
      } else {
        this.currentPage = 1
      }
      this.changeCategoriesDisplay(this.currentPage)
    },
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
      this.changeCategoriesDisplay()
    },
    handleCurrentChange(current) {
      this.currentPage = current
      this.changeCategoriesDisplay(current)
    },
    changeCategoriesDisplay(current) {
      const self = this
      self.categoriesDisplay =
        self.categories.slice(
          self.pageSize * (self.currentPage - 1),
          self.pageSize * self.currentPage
        ) || []
    },
    confirmDeleteCategory(row) {
      ModelCategoryController.deleteModelCategory({ requestBody: row })
        .then(_ => {
          this.$message.success(this.$t('meta.DS.message.operationSucceed'))
          this.reload()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleBeforeUpload() {
      this.pageLocker = true
    },
    handleUploadSuccess() {
      this.pageLocker = false
      this.$message.success(this.$t('meta.DS.message.uploadSucceed'))
      this.reload()
    },
    handleUploadError(e) {
      this.pageLocker = false
      this.$showUploadFailure(e)
    },
    exportTable() {
      const idArr = this.keyword
        ? this.categories.map(e => e.categoryId)
        : this.$modelCategories.map(e => e.categoryId)
      this.$downloadFilePost(
        ModelCategoryController.exportSysList(),
        idArr,
        this.$t('meta.common.sourceType.appSystem')
      )
    },
    deleteSystem(scope) {
      this.$DatablauCofirm(
        this.$t('meta.modelCategory.deleteDialogText', {
          categoryName: scope.row.categoryName
        }),
        this.$t('meta.modelCategory.deleteDialogTitle')
      )
        .then(() => {
          const row = scope.row
          this.confirmDeleteCategory(row)
        })
        .catch(e => {})
    },
    importanceFormatter(row, column) {
      const r = row[column.property]
      switch (r) {
        case this.$t('meta.modelCategory.low'):
          return this.$t('meta.modelCategory.low')
        case this.$t('meta.modelCategory.medium'):
          return this.$t('meta.modelCategory.medium')
        case this.$t('meta.modelCategory.high'):
          return this.$t('meta.modelCategory.high')
      }
    },
    setUdp() {
      this.udpDialogVisible = true
    },
  },
}
