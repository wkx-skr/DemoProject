import TopRightCorner from '@/components/common/main/topRightCorner/topRightCorner.vue'
// import CatalogDefaultImage from '/static/images/dataAssets/homeCatalogBg.png'
import api from '../utils/api'
import {
  handleSuggestionData,
  typeStyleMap,
  getSearchTypes,
  getVisitParams,
  toBrowsing,
} from '../utils/methods'
export default {
  name: 'assetHome',
  components: { TopRightCorner },
  data() {
    return {
      keywords: '',
      catalogDatas: [],
      showSearchHelper: false,
      searchTypes: [],
      isAllTypes: false,
      selectedTypes: [],
      recentSearchList: [],
      username: '',
      browsingHistory: [],
      suggestions: [],
      showSuggestion: false,
      catalogDefaultImage: '/static/images/dataAssets/homeCatalogBg.png',
    }
  },
  mounted() {
    this.$store.commit('setDDCHome', true)
    this.searchTypes = getSearchTypes(this)
    api.getUserInfo().then(res => {
      this.username = res.data.username
      const searchHistory =
        JSON.parse(localStorage.getItem('search-history')) || {}
      this.recentSearchList = searchHistory[res.data.username] || []
    })

    document.addEventListener('click', this.handleDocumentClick)
    this.$datablauLoading.loading()
    api
      .getCatalogInstructureList()
      .then(res => {
        this.catalogDatas = res.data.data
        this.$datablauLoading.close()
      })
      .catch(e => {
        this.$datablauLoading.close()
        this.$showFailure(e)
      })
  },
  methods: {
    handleDocumentClick(e) {
      console.log(e)
      // const path = e.path
      // if (!(e.target.className === 'el-input__inner')) {
      if (
        e.target.className.indexOf('body') !== -1 ||
        e.target.className.indexOf('header') !== -1
      ) {
        // console.log('隐藏')
        this.showSearchHelper = false
        this.showSuggestion = false
      }
    },
    getBrowsingHistory() {
      api
        .getAssetVisitHistory({
          pageNum: 0,
          pageSize: 5,
        })
        .then(res => {
          this.browsingHistory = res.data.data.content.map(item => {
            const mapRs = { ...item, isAuth: true }
            switch (item.typeId) {
              // 表
              case 'TABLE':
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
            return mapRs
          })
        })
    },
    // 搜索关键词输入框 focus 时
    focusKeywordInput() {
      if (this.keywords.trim().length) {
        this.showSearchHelper = false
        this.showSuggestion = true
      } else {
        this.showSearchHelper = true
        this.showSuggestion = false
        this.getBrowsingHistory()
      }
    },
    // 点击搜索按钮 或 敲回车
    searchByKeyword() {
      const keyword = this.keywords.trim()
      if (keyword) {
        this.$router.push({
          name: 'assetSearch',
          query: {
            keyword: this.keywords.trim(),
            types: this.selectedTypes.length
              ? this.selectedTypes.map(type => type.id).join(',')
              : this.searchTypes.map(type => type.id).join(','),
          },
        })
      }
    },
    handleKeywordChange() {
      if (this.keywords.trim().length) {
        // 根据keyword和type进行模糊查询
        // this.getSyno() // 同义词查询
        this.suggestions = []
        let typeIds
        if (this.selectedTypes.length) {
          typeIds = this.selectedTypes.map(selected => selected.id)
        } else {
          typeIds = this.searchTypes.map(type => type.id)
        }
        // if (typeIds.indexOf('TABLE') !== -1) typeIds.push('VIEW')
        let param = {
          pageNum: 0,
          pageSize: 10,
          searchName: this.keywords,
          assetsType: typeIds.join(','),
        }
        api.searchSuggestion(param).then(res => {
          // console.log(res.data, typeof res.data)
          let data = res.data
          if (typeof data === 'string') data = JSON.parse(data)
          // console.log(data)
          this.handelSuggessData(data.data)
        })
        // .catch(e => {
        //   this.handelSuggessData([])
        // })
      } else {
        this.showSearchHelper = true
        this.showSuggestion = false
        this.getBrowsingHistory()
      }
    },
    handelSuggessData(suggessData) {
      // console.log(suggessData)
      this.suggestions = handleSuggestionData(suggessData)
      this.showSuggestion = true
      this.showSearchHelper = false
      if (!this.selectedTypes.length) {
        this.isAllTypes = true
        this.$nextTick(() => {
          this.handleAllTypes()
        })
      }
    },

    preMap(data) {
      return typeStyleMap(data, this)
    },
    // 全部类型
    handleAllTypes() {
      if (this.isAllTypes) {
        this.selectedTypes = _.cloneDeep(this.searchTypes)
      } else {
        if (this.showSuggestion) {
          this.$showFailure(this.$t('assets.gateway.typeCannotEmpty'))
          this.isAllTypes = true
        } else {
          this.selectedTypes = []
        }
      }
    },
    // 选择资产类型
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
      this.selectedTypes = selectedTypes

      if (this.showSuggestion) {
        this.handleKeywordChange()
      }
    },
    // 点击最近搜索，回显搜索关键词
    renderKey(key) {
      this.keywords = key
      this.$nextTick(() => {
        this.handleKeywordChange()
      })
    },

    handleSuggestionClick(item) {
      // console.log(item)
      if (item.isAuth) {
        const visitParams = getVisitParams(item)
        if (visitParams.typeId) {
          api.visitAsset({
            ...visitParams,
            username: this.username,
          })
        }
        toBrowsing(item, this)
      } else {
        this.$blauShowFailure(`您对${item.name}没有访问权限`)
      }
    },
    // 点击门户首页 目录卡片 跳转至数据浏览页
    catalogOverview(catalog) {
      this.$router.push({
        name: 'assetOverview',
        query: {
          structureId: catalog.structureId,
        },
      })
    },
  },
  destroyed() {
    console.log('待销毁')
    document.removeEventListener('click', this.handleDocumentClick)
    this.$store.commit('setDDCHome', false)
  },
}
