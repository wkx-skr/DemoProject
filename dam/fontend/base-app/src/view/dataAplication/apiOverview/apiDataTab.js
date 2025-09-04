import HTTP from '@/http/main'
import _ from 'lodash'
import ddsHTTP from '../ddsHTTP.js'
import 'prismjs/themes/prism.css'
import Prism from 'prismjs'
import paramsList from './paramsList.vue'
import returnColsCom from './returnColsList.vue'
import { validateApiURL } from '../validator.js'

export default {
  name: 'apiDataTab',
  data() {
    return {
      loadingData: false,
      apiEditData: {
        id: '',
        api: '',
        name: '',
        version: '',
        apiCatalog: '',
        apiCatalogId: '',
        createTime: '',
        creator: '',
        modifyTime: '',
        effectiveTime: '', // 下线时间
        flowLimit: '',
        overtimeLimit: '',
        method: 'GET',
        apiProtocol: 'http',
        updateFrequency: '',
        resultType: 'JSON',
        description: '',
        modelId: '',
        modelName: '',
        schemaId: '',
        schemaName: '',
        tableObjectId: '',
        tableName: '',
        // sqlContent: 'SELECT dam_busi_obj.busi_code AS busi, dam_busi_obj.busi_name AS name_001, dam_busi_obj.busi_obj_id AS id from dam_busi_obj WHERE id > {{param1}} OR id < {{param2}}',
        sqlContent: '',
        dataAccessLevel: '',
        apiParamDef: '',
        apiResultDef: '',
        apiResultExample: '',
        apiStatus: 'OFFLINE', // OFFLINE, RELEASE
        apiTestStatus: 'FAIL', // SUCCESS, FAIL
        apiAccessMethod: 'WHOLE_TABLE_DATA', // 代理api 接入方式
        proxyUrl: '', // 代理 api 代理url
        // 需要移除字段
        autoOffline: false, // 是否自动下线
        // selectedColumns: [], // 选定的字段
        // selectedColumnsName: []
      },
      apiCatalogArr: [],
      methodArr: [
        'GET',
        // 'PUT',
        'POST',
        // 'DELETE'
      ],
      updateFrequencyArr: ['每周', '每月', '每年'],
      resultTypeArr: ['JSON'],
      safeLevels: ['公开数据', '普通数据', '敏感数据', '机密数据'],
      apiAccessMethodMap: [
        { value: 'WHOLE_TABLE_DATA', label: '整表数据', index: '1' },
        { value: 'CUSTOM_SQL', label: '自定义SQL', index: '2' },
        { value: 'PROXY_API', label: '代理 API', index: '3' },
      ],
      modelList: [],
      tableList: [],
      columnList: [],
      columnMap: {},
      chooseTreeData: [],
      showChooseTable: false,
      chooseReturnCols: false,
      currentSqlConditionCol: null,
      selectColType: 'single', // 选择单行 还是 多行, 单行是 SQL 条件, 多行是 返回值
      modelMap: {},
      dsCascaderProps: {
        value: 'nodeId',
        emitPath: false,
        label: 'name',
        expandTrigger: 'click',
        checkStrictly: true,
      },
      schemaList: [],
      dsCascaderTreeMap: {},
      couldEditSql: true,
      generateSQLVisible: false,
      generateSqlData: {
        chooseCols: [],
        conditionList: [
          {
            column: '',
            rangeType: '',
            rangeValue: '',
            logicalRelation: '',
          },
        ],
        orderByCols: [
          {
            column: '',
            orderType: '',
          },
        ],
      },
      currentSqlOrderCol: null,
      conditionListKey: 1,
      orderListKey: 1000,
      operatorMap: {
        大于: '>',
        小于: '<',
        等于: '=',
      },
      paramsList: [],
      // TODO 重复值 校验
      paramsRepeat: false,
      returnColsList: [],
      returnColRepeat: false,
      paramTypes: {
        STRING: 1,
        INT: 2,
        LONG: 3,
        FLOAT: 4,
        DOUBLE: 5,
        BOOLEAN: 6,
        ARRAY: 7,
      },
      paramLocations: [
        // {
        //   label: 'Parameter Path',
        //   value: 'PARAMETER_PATH',
        //   key: 1
        // },
        {
          label: 'Head',
          value: 'HEAD',
          key: 2,
        },
        {
          label: 'Query',
          value: 'QUERY',
          key: 3,
        },
      ],
      // couldSaveParamEdit: false,
      showJsonContent: true,
    }
  },
  props: {
    apiData: {
      type: Object,
      default() {
        return {}
      },
    },
    ApiBaseurl: {
      default: '',
    },
  },
  components: {
    paramsList,
    returnColsCom,
  },
  computed: {
    isEdit() {
      return false
    },
  },
  beforeMount() {},
  mounted() {
    this.dataInit()
  },
  methods: {
    async dataInit() {
      this.loadingData = true
      try {
        const apiDetail = await ddsHTTP.getApiDetail({ id: this.apiData.id })
        const data = apiDetail.data

        Object.assign(this.apiEditData, data.api)
        // this.paramsList = _.cloneDeep(data.parameters)
        const paramsList = []
        // let proxyParamsList = []
        const arr = _.cloneDeep(data.parameters)
        if (arr && Array.isArray(arr)) {
          arr.forEach(item => {
            if (item.parType === 1) {
              // proxyParamsList.push(item)
            } else {
              paramsList.push(item)
            }
          })
        }
        this.paramsList = paramsList
        // this.proxyParamsList = proxyParamsList
        this.returnColsList = _.cloneDeep(data.responses)
        this.$emit('apiDataRefresh', this.apiEditData)

        this.refreshEditData()
      } catch (e) {
        this.$showFailure(e)
      }
      this.loadingData = false
    },
    /**
     * 展示数据刷新
     */
    refreshEditData() {
      this.$nextTick(this.getTableName)
      this.refreshJson()
      if (this.apiEditData.effectiveTime) {
        this.apiEditData.autoOffline = true
      }

      if (this.$refs.paramsList && this.$refs.paramsList.refreshEditData) {
        this.$refs.paramsList.refreshEditData()
      }

      if (
        this.$refs.returnColsCom &&
        this.$refs.returnColsCom.refreshEditData
      ) {
        this.$refs.returnColsCom.refreshEditData()
      }
    },
    reloadApiData() {
      this.dataInit()
    },
    autoOfflineChange(newVal) {
      if (newVal) {
        const today = new Date()
        this.apiEditData.effectiveTime = today.getTime()
      } else {
        this.apiEditData.effectiveTime = ''
      }
    },

    copyToClipboard() {
      const url = `${this.ApiBaseurl}${this.apiEditData.api}`
      if (this.apiEditData.api) {
        this.$utils.string.setClipBoard(url)
        this.$message.success(
          '访问地址已经复制到剪贴板，请在目的位置使用 Ctrl + V 进行粘贴'
        )
      } else {
        this.$message.info('没有访问地址可以复制')
      }
    },
    jsonFormatter(str) {
      if (this.$utils.isJSON(str)) {
        str = JSON.parse(str)
        str = JSON.stringify(str, null, '\t')
      }
      return str
    },
    refreshJson() {
      this.showJsonContent = false
      this.$nextTick(() => {
        this.showJsonContent = true
        setTimeout(() => {
          Prism.highlightAll()
        })
      })
    },
    showEditTab() {
      if (this.$refs.paramsList && this.$refs.paramsList.resizeTable) {
        this.$refs.paramsList.resizeTable()
      }
      if (this.$refs.returnColsCom && this.$refs.returnColsCom.resizeTable) {
        this.$refs.returnColsCom.resizeTable()
      }
    },
    getColumnList() {
      if (!this.apiEditData.tableObjectId) {
        this.columnList = []
        return
      }
      return new Promise((resolve, reject) => {
        HTTP.getCatalogColumns({
          succesedCallback: data => {
            resolve(data)
          },
          failureCallback: e => {
            reject(e)
          },
          para: {
            objectId: this.apiEditData.tableObjectId,
          },
        })
      })
    },
  },
  watch: {},
}
