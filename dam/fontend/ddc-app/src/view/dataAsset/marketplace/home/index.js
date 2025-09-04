import IsShowTooltip from '@/components/common/isShowTooltip/isShowTooltip.vue'
import DataDynamics from './dataDynamics.vue'
import StructureList from './structureList.vue'
import { AssetsTypeEnum } from '@/view/dataAsset/utils/Enum'
import HTTP from '@/http/main'

import {
  handleSuggestionData,
  typeStyleMap,
  getVisitParams,
} from '../../utils/methods'
import api from '../../utils/api'

export default {
  name: 'Home',
  components: { IsShowTooltip, DataDynamics, StructureList },
  data() {
    return {
      keyword: '',
      historyList: [],
      loading: true,
      statisticsData: {},
      allTypes: [
        {
          id: 'CATALOG',
          label: this.$t('assets.marketplace.catalog'),
        },
        {
          id: 'TABLE',
          label: this.$t('assets.marketplace.dataTable'),
        },
        {
          id: 'VIEW',
          label: this.$t('assets.marketplace.view'),
        },
        {
          id: 'DATA_OBJECT',
          label: this.$t('assets.marketplace.dataObject'),
        },
        this.$versionFeature.dataasset_CatalogType
          ? {
              id: 'FILE',
              label: this.$t('assets.marketplace.file'),
            }
          : null,
        this.$versionFeature.dataasset_CatalogType
          ? {
              id: 'REPORT',
              label: this.$t('assets.marketplace.report'),
            }
          : null,
        {
          id: 'DATA_STANDARD',
          label: this.$t('assets.marketplace.standard'),
        },
        {
          id: 'DATA_STANDARD_CODE',
          label: this.$t('assets.marketplace.standardCode'),
        },
        {
          id: 'INDEX',
          label: this.$t('assets.marketplace.indexName'),
        },
        {
          id: AssetsTypeEnum.META_MODEL,
          label: '自定义对象',
        },
      ].filter(i => !!i),
      showInstanceSearch: false,
      isAllTypes: true,
      selectedTypes: [],
      browsingHistory: [],
      suggestions: [],
      suggestLoading: false,
      imgPreUrl: window.setting.products.dam.assetsUrl + '/config/icon/',
      structureList: null,
      metaModelIconMap: {},
    }
  },
  mounted() {
    this.getStructureList()
    this.getStatisticsData()
    this.getSearchHistory()
    document.addEventListener('mousedown', this.handleDocumentClick)
  },
  methods: {
    getMetaModelIcon(typeId) {
      HTTP.getMetaModelIconNew(typeId)
        .then(res => {
          if (res.data && res.data.size > 0) {
            // 检查返回的blob是否有内容
            const blob = new Blob([res.data], { type: 'image/png' })
            const iconUrl = URL.createObjectURL(blob)
            this.$set(this.metaModelIconMap, typeId, iconUrl)
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getStructureList() {
      this.loading = true
      api.getCatalogInstructureList().then(res => {
        const structures = res.data.data || []
        this.structureList = structures.map(s => ({
          id: s.structureId,
          name: s.structureName,
        }))
        this.loading = false
      })
    },
    getAllClassNames(element) {
      let classNames = []
      function getClassNames(el) {
        classNames = classNames.concat([...el.classList].filter(Boolean)) // 过滤掉空字符串
        if (el.parentElement !== null && el.parentElement !== document.body) {
          getClassNames(el.parentElement)
        }
      }
      getClassNames(element)
      return classNames
    },

    handleDocumentClick(e) {
      // console.log(e)
      const allClassName = this.getAllClassNames(e.target)
      // console.log(allClassName)
      if (
        e.target.className.split(' ').indexOf('instance') === -1 &&
        e.target.className.split(' ').indexOf('el-input__inner') === -1 &&
        e.target.className.split(' ').indexOf('type') === -1 &&
        e.target.parentNode.className.split(' ').indexOf('instance') === -1 &&
        allClassName.indexOf('instance') === -1 &&
        this.showInstanceSearch
      ) {
        this.showInstanceSearch = false
      }
    },
    handleSuggestionClick(item, isAuth = false) {
      // if (item.typeId === AssetsTypeEnum.META_MODEL) {
      //   // 元模型
      //   const url = this.BaseUtils.RouterUtils.getFullUrl('dataCatalog', {
      //     objectId: item.objectId,
      //     catalogId: item.catalogId,
      //     id: item.assetsId,
      //     type: 'META_MODEL',
      //     blank: true,
      //   })
      //   window.open(url)
      //   return
      // }
      if (item.isAuth || isAuth || item.typeId === AssetsTypeEnum.META_MODEL) {
        // 资产是否是发布状态
        let getDDCAssets = null
        if (item.typeId === AssetsTypeEnum.META_MODEL) {
          getDDCAssets = Promise.resolve({ data: { data: {} } })
        } else {
          getDDCAssets = api.getDDCAssets(
            item.id || item.assetsId || item.catalogId,
            item.typeId
          )
        }
        getDDCAssets
          .then(async res => {
            if (res.data.data) {
              let url = ''
              switch (item.typeId) {
                case 'CATALOG':
                  url = this.BaseUtils.RouterUtils.getFullUrl(
                    'catalogDetails',
                    {
                      structureId: item.structureId,
                      id: item.catalogId || item.id,
                      blank: true,
                    }
                  )
                  break
                case 'FILE':
                  url = this.BaseUtils.RouterUtils.getFullUrl('fileDetails', {
                    objectId: item.itemId,
                    catalogId: item.catalogId,
                    id: item.assetsId || item.id,
                    blank: true,
                  })
                  break
                case 'REPORT':
                  url = this.BaseUtils.RouterUtils.getFullUrl('reportDetails', {
                    objectId: item.itemId,
                    catalogId: item.catalogId,
                    id: item.assetsId || item.id,
                    blank: true,
                  })
                  break
                case 'TABLE':
                  url = this.BaseUtils.RouterUtils.getFullUrl('tableDetails', {
                    objectId: item.objectId,
                    catalogId: item.catalogId,
                    id: item.assetsId || item.id,
                    type: 'table',
                    blank: true,
                    from: 'market',
                  })
                  break
                case 'VIEW':
                  url = this.BaseUtils.RouterUtils.getFullUrl('viewDetails', {
                    objectId: item.objectId,
                    catalogId: item.catalogId,
                    id: item.assetsId || item.id,
                    type: 'view',
                    blank: true,
                    from: 'market',
                  })
                  break
                case AssetsTypeEnum.META_MODEL:
                  // 元模型
                  url = this.BaseUtils.RouterUtils.getFullUrl('dataCatalog', {
                    objectId: item.objectId,
                    catalogId: item.catalogId,
                    id: item.assetsId,
                    type: 'META_MODEL',
                    blank: true,
                  })
                  break
                case 'DATA_OBJECT':
                  url = this.BaseUtils.RouterUtils.getFullUrl('columnDetails', {
                    objectId: item.objectId,
                    catalogId: item.catalogId,
                    id: item.assetsId || item.id,
                    blank: true,
                  })
                  break
                case 'DATA_STANDARD':
                  url = this.BaseUtils.RouterUtils.getFullUrl('dataStandard', {
                    domainId: item.itemId || item.objectId,
                    blank: true,
                    isAssets: true,
                  })
                  break
                case 'INDEX':
                  // let metric = JSON.parse(localStorage.getItem('allServers')).includes('METRIC')
                  let nameRouter = await this.getName(item)
                  url = this.BaseUtils.RouterUtils.getFullUrl(nameRouter, {
                    domainId: item.itemId || item.objectId,
                    id: item.itemId || item.objectId,
                    blank: true,
                    isAssets: true,
                  })
                  break
                case 'DATA_STANDARD_CODE':
                  url = this.BaseUtils.RouterUtils.getFullUrl('code', {
                    code: item.itemId || item.objectId,
                    blank: true,
                    isAssets: true,
                  })
                  break
              }
              const visitParams = getVisitParams(item)
              if (visitParams.typeId) {
                api.visitAsset({
                  ...visitParams,
                  username: this.username,
                  catalogId: item.catalogId,
                  logical: visitParams.isLogical,
                })
                if (
                  visitParams.typeId === 'DATA_STANDARD' ||
                  visitParams.typeId === 'DATA_STANDARD_CODE' ||
                  visitParams.typeId === 'INDEX'
                ) {
                  api.toVisitAsset({
                    catalogId: item.catalogId,
                    assetType: visitParams.typeId,
                    itemId: item.itemId,
                    assetId: item.assetsId,
                  })
                }
              }
              // console.log(url)
              window.open(url)
            } else {
              this.$showFailure(
                this.$t('assets.marketplace.assetsNotPublishedTip')
              )
            }
          })
          .catch(error => {
            this.$blauShowFailure(error)
          })
      } else {
        let name = ''
        if (
          item.typeId === 'CATALOG' ||
          item.typeId === 'FILE' ||
          item.typeId === 'REPORT'
        ) {
          name = item.name
        } else {
          name = item.alias
        }
        this.$blauShowFailure(
          this.$t('assets.marketplace.noVisitAuth', { name: name })
        )
      }
    },

    async getName(row) {
      let metric = localStorage.getItem('allServers')
        ? JSON.parse(localStorage.getItem('allServers')).includes('METRIC')
        : false
      let name = 'index'
      if (metric) {
        await api
          .getDomainById({ domainId: row.domainId })
          .then(res => {
            name =
              res.data.categoryId === 5
                ? 'indexDefinitionNew'
                : 'forkIndexDefinitionNew'
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
      return name
    },
    getSearchHistory() {
      this.historyList = (localStorage.getItem('searchHistory') || '')
        .split(',')
        .filter(i => i)
        .slice(0, 5)
    },
    enterSupermarket() {
      // console.log('enter supermarket')
      this.$router.push({ name: 'assetSupermarket' })
    },

    getStatisticsData() {
      this.loading = true
      api.getHomeStatistics().then(res => {
        this.loading = false
        const resMap = {}
        res.data.data.forEach(element => {
          resMap[element.type || element.catalogType] = element.totalCount || 0
        })
        this.statisticsData = {
          structureNum: resMap.CatalogStructure || 0,
          themeNum: resMap.Catalog || 0,
          tableNum: resMap.TABLE || 0,
          viewNum: resMap.VIEW || 0,
          columnNum: resMap.DATA_OBJECT || 0,
          reportNum: resMap.REPORT || 0,
          fileNum: resMap.FILE || 0,
          dataStandardNum: resMap.DATA_STANDARD || 0,
          dataStandardCodeNum: resMap.DATA_STANDARD_CODE || 0,
          indexNum: resMap.INDEX || 0,
          metaModel: resMap[AssetsTypeEnum.META_MODEL] || 0,
        }
      })
    },
    searchByHistory(history) {
      this.$router.push({
        name: 'assetSupermarket',
        query: {
          keyword: history,
          types: this.allTypes.map(type => type.id).join(','),
        },
      })
    },
    searchByKeyword() {
      const keyword = this.keyword.trim()
      if (keyword) {
        const historyIndex = this.historyList.findIndex(i => i === keyword)
        if (historyIndex !== -1) {
          this.historyList.splice(historyIndex, 1)
        }
        this.historyList.unshift(keyword)
        localStorage.setItem('searchHistory', this.historyList.join(','))
        this.$router.push({
          name: 'assetSupermarket',
          query: {
            keyword: this.keyword.trim(),
            types: this.isAllTypes
              ? this.allTypes.map(type => type.id).join(',')
              : this.searchTypes.map(type => type.id).join(','),
          },
        })
      }
    },
    getBrowsingHistory() {
      this.suggestLoading = true
      api
        .getAssetVisitHistory({
          pageNum: 0,
          pageSize: 5,
        })
        .then(res => {
          this.suggestLoading = false
          if (this.keyword.trim() === '') {
            this.browsingHistory = res.data.data.content.map(item => {
              const mapRs = { ...item, isAuth: true, isLogical: item.logical }
              switch (item.typeId) {
                // 表
                case 'TABLE':
                case 'table':
                  mapRs.objectId = item.objectId
                  break
                // 数据标准 或 数据指标
                case 'DATA_STANDARD':
                  mapRs.domainId = item.objectId
                  break
                // 数据指标
                case 'INDEX':
                  mapRs.domainId = item.objectId
                  break
                // 报表
                case 'REPORT':
                  mapRs.itemId = item.objectId
                  break
                // 文件
                case 'FILE':
                  mapRs.itemId = item.objectId
                  break
                // 标准代码
                case 'DATA_STANDARD_CODE':
                  mapRs.code = item.objectId
                  break
                case 'CATALOG':
                  mapRs.catalogId = item.objectId.split('/')[0]
                  mapRs.structureId = item.objectId.split('/')[1]
                  break
                default:
                  mapRs.objectId = item.objectId
              }
              return {
                ...mapRs,
              }
            })
          }
        })
        .catch(error => {
          this.$blauShowFailure(error)
          this.suggestLoading = true
        })
    },
    focusKeywordInput() {
      // console.log('focus')
      this.showInstanceSearch = true
      if (this.keyword.trim().length) {
        this.handleKeywordChange()
      } else {
        this.getBrowsingHistory()
      }
    },
    handleKeywordChange() {
      if (this.keyword.trim().length) {
        // 根据keyword和type进行模糊查询
        // this.getSyno() // 同义词查询
        this.suggestions = []
        let typeIds
        if (this.selectedTypes.length) {
          typeIds = this.selectedTypes.map(selected => selected.id)
        } else {
          typeIds = this.allTypes.map(type => type.id)
        }
        let param = {
          pageNum: 0,
          pageSize: 10,
          searchName: this.keyword,
          assetsType: typeIds.join(','),
        }
        this.suggestLoading = true
        api
          .searchSuggestion(param)
          .then(res => {
            this.suggestLoading = false
            if (param.searchName === this.keyword) {
              let data = res.data
              if (typeof data === 'string') data = JSON.parse(data)
              this.handelSuggessData(data.data)
            }
          })
          .catch(error => {
            this.suggestLoading = false
            this.$blauShowFailure(error)
          })
      } else {
        this.getBrowsingHistory()
      }
    },
    handelSuggessData(suggessData) {
      this.suggestions = handleSuggestionData(suggessData)
      this.suggestions[0].options.forEach(element => {
        if (element.typeId === 'METAMODEL_OBJECT') {
          element.itemTypeId && this.getMetaModelIcon(element.itemTypeId)
        }
      })
      if (!this.selectedTypes.length) {
        this.isAllTypes = true
      }
    },

    handleAllTypes() {
      if (!this.isAllTypes) {
        this.isAllTypes = true
        this.selectedTypes = []
      } else {
        // if (this.keyword) {
        //   // this.$showFailure(this.$t('assets.gateway.typeCannotEmpty'))
        //   this.isAllTypes = true
        // } else {
        //   this.isAllTypes = false
        //   this.selectedTypes = []
        // }
      }
      if (this.showInstanceSearch && this.keyword) {
        this.showInstanceSearch = true
        this.handleKeywordChange()
      }
    }, // 选择资产类型
    selectType(type) {
      // console.log(type)
      this.isAllTypes = false
      let selectedTypes = this.selectedTypes
      let index = -1
      selectedTypes.find((selected, idx) => {
        if (selected.label === type.label) {
          index = idx
          return true
        }
        return false
      })
      if (index !== -1) {
        selectedTypes.splice(index, 1)
      } else {
        selectedTypes.push(type)
      }
      if (selectedTypes.length == 0) {
        this.isAllTypes = true
      }
      this.selectedTypes = selectedTypes
      // if (this.selectedTypes.length === this.allTypes.length) {
      //   this.isAllTypes = true
      // }

      if (this.showInstanceSearch && this.keyword) {
        this.showInstanceSearch = true
        this.handleKeywordChange()
      }
    },
    preMap(data) {
      return typeStyleMap(data, this)
    },
  },
}
