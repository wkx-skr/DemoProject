import HTTP from '../util/api'
import { getAttrList } from '@/view/dataSecurity/util/util'
export default {
  data() {
    return {
      listShow: true,
      pageNo: 1,
      pageSize: 20,
      total: 0,
      searchForm: {
        categoryId: '',
        datasourceId: '',
        modelId: '',
        schema: '',
      },
      gatherList: [],
      structureList: [], // 表单数据
      loading: false,
      selectList: [], // 选中的表单
      options: [], // 下拉
      dataSourceList: [], // 数据源下拉
      schemaList: [], // schema下拉
      eventStartTime: [],
      inventoryModel: {},
      inventory: [],
      typeIconMap: {
        80000004: 'biao',
        80500008: 'shitu',
        80000005: 'ziduan',
      },
      // tableHeight: 0,
      sort: false,
      safetyShow: false,
      failList: [],
      successAssets: [],
      levelList: [],
      topH: 44,
    }
  },
  watch: {
    'searchForm.assetName'(val) {
      if (!val) {
        this.pageNo = 1
        this.getPublishassetsList()
      }
    },
  },
  mounted() {
    this.inventoryModel = {
      MANUAL_INVENTORY: this.$t('reviewAndRelease.artificialInventory'),
      DATA_IDENTIFICATION: this.$t('reviewAndRelease.dataRecognition'),
      BATCH_IMPORT: this.$t('reviewAndRelease.batchImport'),
    }
    this.inventory = [
      {
        value: 'MANUAL_INVENTORY',
        label: this.$t('reviewAndRelease.artificialInventory'),
      },
      {
        value: 'DATA_IDENTIFICATION',
        label: this.$t('reviewAndRelease.dataRecognition'),
      },
      { value: 'BATCH_IMPORT', label: this.$t('reviewAndRelease.batchImport') },
    ]
    this.getBusinessSystemList()
    this.getPublishassetsList()
    getAttrList(HTTP).then(data => {
      this.levelList = data
    })
  },
  methods: {
    domResize(e) {
      this.topH = e + 44
    },
    handleSearch() {
      this.pageNo = 1
      this.getPublishassetsList()
    },
    // 业务系统接口
    getBusinessSystemList() {
      HTTP.getBusinessSystemList()
        .then(res => {
          this.options = res.data.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 业务系统下拉change
    systemChange(id) {
      this.gatherList = []
      this.searchForm.datasourceId = ''
      this.searchForm.modelId = ''
      this.dataSourceList = []
      this.schemaList = []
      this.searchForm.schema = ''
      if (id) {
        this.getGatherList(id)
      }
    },
    // 查询采集源
    getGatherList(id) {
      HTTP.realAataSourceListApi(id)
        .then(res => {
          this.gatherList = res.data.data || []
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    gatherChange(id) {
      this.dataSourceList = []
      this.searchForm.modelId = ''
      this.schemaList = []
      this.searchForm.schema = ''
      if (id) {
        this.getDataSourceList(id)
      }
    },
    // 数据源
    getDataSourceList(id) {
      HTTP.virDataSourceListApi(id)
        .then(res => {
          this.dataSourceList = res.data.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    datasourceIdChange(id) {
      this.searchForm.schema = ''
      this.schemaList = []
      this.dataSourceList.map(item => {
        if (parseFloat(item.modelId) === parseFloat(id)) {
          if (item.type === 'DATADICTIONARY_LOGICAL') {
            this.searchForm.schema =
              item.reverseOptions.DatabaseName.split(',')[0]
            this.schemaList = item.reverseOptions.DatabaseName.split(',')
          } else {
            this.searchForm.schema = item.schema || item.database
            this.schemaList = [item.schema || item.database]
          }
        }
      })
    },
    sortChange(data) {
      // if (!data.order) return
      this.sort = data.order === 'ascending' ? true : !data.order ? null : false
      // this.form.page = 1
      this.getPublishassetsList()
    },
    // 获取评审列表
    getPublishassetsList() {
      this.loading = true
      let json = {
        pageNo: this.pageNo,
        pageSize: this.pageSize,
        startTime: (this.eventStartTime && this.eventStartTime[0]) || '',
        endTime: (this.eventStartTime && this.eventStartTime[1]) || '',
        orderByTime: this.sort,
      }
      !this.searchForm.inventoryModel && delete this.searchForm.inventoryModel
      HTTP.getPublishassetsList({ ...json, ...this.searchForm })
        .then(res => {
          this.listShow = true
          let logicalInfoArr = []
          res.data.data.content.forEach(item => {
            if (item.type === 80000004 || item.type === 80000005) {
              logicalInfoArr.push(item.objectId)
            }
          })
          this.getLogicalInfo(logicalInfoArr)
          this.structureList = res.data.data.content
          this.total = res.data.data.totalItems
          this.loading = false
        })
        .catch(e => {
          this.listShow = false
          this.loading = false
          this.$showFailure(e)
        })
    },
    getLogicalInfo(logicalInfoArr) {
      this.$http
        .post('/metadata/entities/getLogicalInfo', logicalInfoArr)
        .then(res => {
          this.structureList.forEach(element => {
            this.$set(element, 'logical', res.data[Number(element.objectId)])
          })
        })
        .catch(e => {
          this.failureCallback(e)
        })
    },
    //  评审通过
    primary() {
      this.judgesssets(1)
    },
    //  驳回
    cancelbtn() {
      this.judgesssets(-1)
    },
    judgesssets(approval) {
      let text
      approval === 1
        ? (text = this.$t('reviewAndRelease.reviewPass'))
        : (text = this.$t('reviewAndRelease.reviewReject'))
      let json = new FormData()
      let ids = this.selectList.map(item => {
        return item.id
      })
      json.append('approval', approval)
      json.append('ids ', ids)
      HTTP.judgesssets(json)
        .then(res => {
          this.pageNo = 1
          this.$refs.deTable.clearSelection()
          if (res.data.status === 500) {
            this.failList = res.data.data.failAssets
            this.successAssets = res.data.data.successAssets
            this.safetyShow = true
            this.getPublishassetsList()
            return
          }
          this.$datablauMessage.success(text)
          this.getPublishassetsList()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.getPublishassetsList()
    },
    handleCurrentChange(val) {
      this.pageNo = val
      this.getPublishassetsList()
    },
    // 查询
    search() {
      this.pageNo = 1
      this.getPublishassetsList()
    },
    // 重置
    revise() {
      this.eventStartTime = []
      this.dataSourceList = []
      this.schemaList = []
      this.searchForm = {}
      this.pageNo = 1
      this.getPublishassetsList()
    },
    //  表单选中
    handleSelectionChange(row) {
      this.selectList = row
    },
  },
}
