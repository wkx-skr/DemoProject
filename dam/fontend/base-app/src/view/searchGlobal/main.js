import IsShowTooltip from '@/view/dataProperty/meta/isShowTooltip.vue'
import Panel from './Panel.vue'
import HTTP from '@/http/main'
export default {
  components: { IsShowTooltip,Panel },
  data() {
    return {
      showGlobalSearch: true,
      keyword: '',
      pageSize: 20,
      totalShow: 0,
      currentPage: 1,
      resultData: [],
      itemTypeOptions: [
        { id: 'sjzcml', chineseName: '数据资产目录', value: '80010076' }, //
        // {
        //   id: 'ywdx',
        //   chineseName: '业务对象',
        //   value: '80010076',
        //   catalogLevel: '3',
        // },
        { id: 'sjbj', chineseName: '标准数据元', value: '80010066' },
        { id: 'cksj', chineseName: '参考数据', value: '80010098' },
        { id: 'xxxt', chineseName: '信息系统', value: '82800012' }, //
        { id: 'sjk', chineseName: '数据库', value: '80010001' }, //
        { id: 'sjb', chineseName: '数据表', value: '80000004' }, //
        { id: 'zd', chineseName: '字段', value: '80000005' },
      ],
      selectedItemType: ['sjb'],
      selectedItemTypeArr: ['80000004', '80500008'],
      typeList: {
        80000004: 'tablenew',
        80500008: 'viewnew',
        80000005: 'columnnew',
        82800002: 'reportnew',
        82800008: 'filenew',
        80010066: 'domainnew',
        80010098: 'codenew',
        82800003: 'domainindexnew',
        82800017: 'rulesnew',
        82800016: 'qualityrulenew',
      },
      reportTypes: {
        List: this.$t('meta.report.list'),
        Report: this.$t('meta.report.report'),
        Analysis: this.$t('meta.report.analysis'),
      },
      queryArr: [],
      columnMapping: {},
      historicalList: localStorage.getItem('historicalList')
        ? JSON.parse(localStorage.getItem('historicalList'))
        : [],
      defaultProps: {
        value: 'id',
        label: 'chineseName',
        children: 'elementList',
        checkStrictly: true,
      },
      metaModelIconMap: {},
      itemTypeChineseName: '',
      queryHistoryRecordTimeout: null,
    }
  },
  mounted() {
    this.getPage()
    this.getColumnMapping()
    this.getAllListModel()
  },
  computed: {
    isMetadata() {
      return (
        this.itemTypeOptions.findIndex(
          item => item.id === this.lastSelectedItemType
        ) === -1
      )
    },
    lastSelectedItemType() {
      return this.selectedItemType[this.selectedItemType.length - 1]
    },
  },
  beforeDestroy() {},
  filters: {
    bigClassFilter(value, queryArr) {
      let result = ''
      queryArr.forEach(e => {
        if (e.ruleCode === value) {
          result = e.optionValue
        }
      })
      return result
    },
  },
  methods: {
    imgPath(data) {
      return `/assets/config/icon/${data?.folderId}` // /assets/config/icon/3
    },
    getMeteObjIcon(obj) {
      HTTP.getMetaModelIconNew(obj)
        .then(res => {
          if (res.data && res.data.size > 0) {
            // 检查返回的blob是否有内容
            const blob = new Blob([res.data], { type: 'image/png' })
            const iconUrl = URL.createObjectURL(blob)
            this.$set(this.metaModelIconMap, obj, iconUrl)

            this.$once('hook:beforeDestroy', () => {
              URL.revokeObjectURL(iconUrl)
            })
          } else {
            this.$set(this.metaModelIconMap, obj, metaModelIcon)
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    queryHistoryRecord(queryStr, cb) {
      this.queryHistoryRecordTimeout &&
        clearTimeout(this.queryHistoryRecordTimeout)
      this.queryHistoryRecordTimeout = setTimeout(() => {
        cb(
          queryStr
            ? (this.historicalList || [])
                .filter(item => {
                  return item && item.indexOf(queryStr) > -1
                })
                .map((item, index) => {
                  return {
                    index,
                    value: item,
                    label: item,
                  }
                })
            : (this.historicalList || []).map((item, index) => {
                return {
                  index,
                  value: item,
                  label: item,
                }
              })
        )
      })
    },
    removeHistoryRecord(item) {
      if (item && this.historicalList.indexOf(item.value) > -1) {
        this.historicalList.splice(this.historicalList.indexOf(item.value), 1)
        localStorage.setItem(
          'historicalList',
          JSON.stringify(this.historicalList)
        )
        this.showGlobalSearch = false
        this.$nextTick(() => {
          this.showGlobalSearch = true
          this.$nextTick(() => {
            this.$refs.showGlobalSearchDom.focus()
          })
        })
      }
    },
    handleElementId(elementList) {
      ;(elementList || []).forEach(element => {
        element.id = `ymx_${element.id}`
        this.handleElementId(element.elementList)
      })
    },
    getAllListModel() {
      this.$http
        .post(this.$meta_url + '/mm/getAllTree')
        .then(res => {
          const dataList = res.data || []
          dataList.forEach(d => {
            d.disabled = true
            d.chineseName = d.metaModelName
            this.handleElementId(d.elementList)
          })
          const idx = this.itemTypeOptions.findIndex(item => item.id === 'ymx')
          if (idx === -1) {
            this.itemTypeOptions.push({
              id: 'ymx',
              chineseName: '接口采集数据',
              disabled: true,
              elementList: dataList,
            })
          } else {
            this.$set(this.itemTypeOptions[idx], 'elementList', dataList)
          }
        })
        .catch(e => {
          this.failureCallback(e)
        })
    },
    getLogicalInfo(logicalInfoArr) {
      this.$http
        .post(this.$meta_url + '/entities/getLogicalInfo', logicalInfoArr)
        .then(res => {
          this.resultData.forEach(element => {
            this.$set(
              element,
              'logical',
              res.data[Number(element.data.objectId)]
            )
          })
        })
        .catch(e => {
          this.failureCallback(e)
        })
    },
    searchCleanUp() {
      this.historicalList = []
      localStorage.setItem('historicalList', [])
    },
    getColumnMapping() {
      this.$http
        .post(this.$meta_url + '/entities/getColumnMapping')
        .then(res => {
          this.columnMapping = res.data
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
    getDataTypeIcon(type) {
      type = type.toUpperCase()
      if (
        type.indexOf('GEOMETRY') !== -1 ||
        type.indexOf('POLYGON') !== -1 ||
        type.indexOf('LINESTRING') !== -1 ||
        type.indexOf('POINT') !== -1 ||
        type.indexOf('POLYGON') !== -1 ||
        type.indexOf('GEOMETRY') !== -1
      ) {
        return 'icon-complexdata'
      }
      if (
        type.indexOf('FLOAT') !== -1 ||
        type.indexOf('DOUBLE') !== -1 ||
        type.indexOf('NUMBER') !== -1 ||
        type.indexOf('DECIMAL') !== -1 ||
        type.indexOf('INT') !== -1 ||
        type.indexOf('BIT') !== -1
      ) {
        return 'icon-int'
      }
      if (
        type.indexOf('TIME') !== -1 ||
        type.indexOf('DATE') !== -1 ||
        type.indexOf('YEAR') !== -1
      ) {
        return 'icon-date'
      }
      if (
        type.indexOf('VARBINARY') !== -1 ||
        type.indexOf('STR') !== -1 ||
        type.indexOf('CLOB') !== -1 ||
        type.indexOf('JSON') !== -1 ||
        type.indexOf('BLOB') !== -1 ||
        type.indexOf('TEXT') !== -1 ||
        type.indexOf('CHAR') !== -1
      ) {
        return 'icon-datafile'
      }
      if (type.indexOf('BINARY') !== -1) {
        return 'icon-file'
      }
    },
    dataTypeFormatter(row, modelType) {
      if (!row) {
        return ''
      }
      let databaseType
      if (modelType) {
        databaseType = modelType.toUpperCase()
      }
      let type =
        this.columnMapping[
          databaseType + '_@@_' + row.replaceAll(/\s*\(.*?\)\s*/g, '')
        ]
      if (type !== undefined) {
        return type
      } else {
        return row.replaceAll(/\s*\(.*?\)\s*/g, '').toUpperCase()
      }
    },
    goTodetail(result) {
      const pos = location.href.indexOf('#/')
      const baseUrl = location.href.slice(0, pos + 2)
      if (result.data.itemType === 80010076) {
        console.log(result.data)
        // 'http://192.168.5.232:18080'
        const ddcUrl = `http://localhost:8075/#/main/dataAsset/manage?code=${
          result.data.code
        }&catalogId=${result.data.catalogId}&path=${result.data.path}`
        window.open(ddcUrl, '_blank')
      } else if (
        result.data.itemType === 80000004 ||
        result.data.itemType === 80500008 ||
        result.data.itemType === 80000005 ||
        this.isMetadata
      ) {
        if (this.isMetadata) {
          window.open(
            baseUrl +
              `main/meta?type=META_MODEL&objectId=${result.data.itemId}&blank=true`,
            '_blank'
          )
        } else {
          window.open(
            baseUrl + `main/meta?objectId=${result.data.itemId}&blank=true`,
            '_blank'
          )
        }
      } else if (result.data.itemType === 82800002) {
        window.open(
          baseUrl +
            `main/reportFormManage?objectId=${result.data.itemId}&blank=true`,
          '_blank'
        )
      } else if (result.data.itemType === 82800008) {
        window.open(
          `${baseUrl}main/metaFolder?objectId=${result.data.itemId}&type=file&blank=true`,
          '_blank'
        )
      } else if (result.data.itemType === 80010066) {
        this.$skip2Domain(result.data.itemId, this.isAssets)
      } else if (result.data.itemType === 80010098) {
        let query = {
          name: 'code',
          query: {
            code: result.data.itemId,
            blank: true,
          },
        }
        this.$skip2(query)
      } else if (result.data.itemType === 82800003) {
        if (JSON.parse(localStorage.getItem('allServers')).includes('METRIC')) {
          const pos = location.href.indexOf('#/')
          const baseUrl = location.href.slice(0, pos + 2)
          const url = `main/indexDefinitionNew?id=${result.data.itemId}&blank=true`
          window.open(baseUrl + url)
        } else {
          this.$skip2Domain(result.data.itemId, this.isAssets)
        }
      } else if (result.data.itemType === 82800017) {
        window.open(
          baseUrl + `main/dataQuality/rules?id=${result.data.itemId}&blank=true`
        )
      } else if (result.data.itemType === 82800016) {
        window.open(
          baseUrl +
            `main/dataQuality/qualityRule?id=${result.data.itemId}&blank=true`
        )
      } else if (result.data.itemType === 82800012) {
        window.open(
          baseUrl + `main/modelCategory?id=${result.data.itemId}&blank=true`
        )
      } else if (result.data.itemType === 80010001) {
        window.open(
          baseUrl +
            `main/metaDatasource?keyword=${result.data.chineseName}&blank=true`
        )
      }
    },
    fileTypeFormatter(fileType) {
      let result = 'filenew'
      if (/(zip|rar|gz|7z)$/.test(fileType)) {
        result = 'zipnew'
      } else if (/xlsx?$/.test(fileType)) {
        result = 'excelnew'
      } else if (/docx?$/.test(fileType)) {
        result = 'wordnew'
      } else if (/pptx?$/.test(fileType)) {
        result = 'pptnew'
      } else if (/pdf$/.test(fileType)) {
        result = 'pdfnew'
      } else if (/txt$/.test(fileType)) {
        result = 'txtnew'
      } else if (/(wav|mp3|aif|au|wma|mmf|amr|ram|au}arm)$/.test(fileType)) {
        result = 'musicnew'
      } else if (/(bmp|gif|jpg|pic|png|tif)$/.test(fileType)) {
        result = 'picturenew'
      } else if (/(avi|mpeg|mpg|mp4|mkv|3gp)$/.test(fileType)) {
        result = 'videonew'
      }

      return result
    },
    getHighlightedText(item, type) {
      // 检查highLight是否存在，并且englishName是否有高亮版本
      if (type === 'englishName') {
        if (
          item.highLight &&
          item.highLight.englishName &&
          item.highLight.englishName.length > 0
        ) {
          // 返回高亮版本的englishName
          return item.highLight.englishName[0]
        }
        // 如果没有高亮版本，则返回原始englishName
        return item.data.englishName
      } else if (type === 'chineseName') {
        if (
          item.highLight &&
          item.highLight.chineseName &&
          item.highLight.chineseName.length > 0
        ) {
          // 返回高亮版本的englishName
          return item.highLight.chineseName[0]
        }
        // 如果没有高亮版本，则返回原始englishName
        return item.data.chineseName
      } else if (type === 'description') {
        if (
          item.highLight &&
          item.highLight.description &&
          item.highLight.description.length > 0
        ) {
          // 返回高亮版本的englishName
          return item.highLight.description[0]
        }
        // 如果没有高亮版本，则返回原始englishName
        return item.data.description
      }
    },
    goSearch(item) {
      if (item) {
        this.keyword = item
      }
      this.handleCurrentChange(1)
      if (this.keyword !== '' && this.keyword !== undefined) {
        if (
          this.historicalList.length >= 5 &&
          !this.historicalList.includes(this.keyword)
        ) {
          this.historicalList.pop()
        }
        this.pushUnique(this.historicalList, this.keyword)
        localStorage.setItem(
          'historicalList',
          JSON.stringify(this.historicalList)
        )
      }
    },
    pushUnique(arr, item) {
      if (!arr.includes(item)) {
        arr.unshift(item)
      }
    },
    getQuery() {
      this.$http
        .post(`${this.$url}/select/option/get`, {
          category: 'TR',
          names: ['规则大类'],
        })
        .then(res => {
          this.queryArr = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    searchQuery(id) {
      let name = ''
      this.queryArr.forEach(element => {
        if (element.id == id) {
          name = element.optionValue
        }
      })
      return name
    },
    selectedItemTypeChangeEvent(name) {
      console.log('selectedItemTypeChangeEvent', name, this.selectedItemType)
      const currentSelectedItemType = this.lastSelectedItemType
      if (currentSelectedItemType === 'sjb') {
        this.selectedItemTypeArr = ['80000004', '80500008']
      } else if (currentSelectedItemType.startsWith('ymx_')) {
        this.selectedItemTypeArr = [
          currentSelectedItemType.replaceAll('ymx_', ''),
        ]
      } else {
        this.selectedItemTypeArr = this.itemTypeOptions
          .filter(item => item.id === currentSelectedItemType)
          .map(item => item.value)
      }
      if (
        currentSelectedItemType === '82800017' ||
        currentSelectedItemType === '82800016'
      ) {
        this.getQuery()
      }
      this.handleCurrentChange(1)
    },
    getPage() {
      const itemType = this.selectedItemTypeArr.filter(item => !!item)
      if (!itemType.length) {
        this.$showFailure('请选择正确的数据类型')
        return
      }
      const obj = {
        keyword: this.keyword,
        itemType,
        pageSize: this.pageSize,
        currentPage: this.currentPage,
      }
      const idx = this.itemTypeOptions.findIndex(
        item => item.id === this.lastSelectedItemType
      )
      if (idx > -1) {
        const selectedItem = this.itemTypeOptions[idx]
        if (selectedItem.catalogLevel) {
          obj.catalogLevel = selectedItem.catalogLevel
        }
      }
      this.$http
        .post(`${this.$meta_url}/global/search/getPage`, obj)
        .then(res => {
          const targetNumbers = ['80000005', '80000004']
          for (const num of targetNumbers) {
            if (this.selectedItemTypeArr.includes(num)) {
              let logicalInfoArr = []
              res.data.content.forEach(item => {
                if (
                  item.data.itemType === 80000004 ||
                  item.data.itemType === 80000005
                ) {
                  logicalInfoArr.push(item.data.objectId)
                }
              })
              this.getLogicalInfo(logicalInfoArr)
            }
          }
          if (this.isMetadata) {
            res.data.content.forEach(item => {
              this.getMeteObjIcon(item.data.itemType)
            })
          }

          this.resultData = res.data.content
          this.totalShow = res.data.totalItems
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleSizeChange(size) {
      this.currentPage = 1
      this.pageSize = size
      this.getPage()
    },
    handleCurrentChange(current) {
      this.currentPage = current
      this.getPage()
    },
  },
}
