import TopRightCorner from '@/components/common/main/topRightCorner/topRightCorner.vue'
import api from '../../utils/api'
import {
  handleSuggestionData,
  typeStyleMap,
  getSearchTypes,
  getVisitParams,
  toBrowsing,
} from '../../utils/methods'
export default {
  name: 'assetSearch',
  data() {
    return {
      isAllTypes: false,
      activeName: 'type0',
      selectedTypes: [],
      keywords: '',
      suggestions: [],
      showSearchHelper: false,
      showSuggestions: false,
      recentSearchList: [],
      username: '',
      browsingHistory: [],
      searchTypes: [],
      searchResults: [],
      currentResults: [],
      pagination: {
        page: 1,
        pageSize: 20,
        total: 0,
      },
      hasFocus: false,
    }
  },
  components: { TopRightCorner },
  mounted() {
    this.$store.commit('setDDCHome', true)
    this.searchTypes = getSearchTypes(this)
    this.$nextTick(() => {
      const query = this.$route.query
      this.keywords = query.keyword
      const selectedTypes = query.types
        ? query.types.split(',').map(type => {
            return this.searchTypes.find(t => t.id == type)
          })
        : []
      this.selectedTypes = selectedTypes
      if (selectedTypes.length === this.searchTypes.length) {
        this.isAllTypes = true
      }
      api.getUserInfo().then(res => {
        this.username = res.data.username
        const searchHistory =
          JSON.parse(localStorage.getItem('search-history')) || {}
        this.recentSearchList = searchHistory[res.data.username] || []
        this.searchByKeyword()
      })
      document.addEventListener('click', this.handleDocumentClick)
    })
  },
  methods: {
    handleDocumentClick(e) {
      // console.log(e)
      // const path = e.path
      // if (!(e.target.className === 'el-input__inner')) {
      if (
        e.target.className.indexOf('body') !== -1 ||
        e.target.className.indexOf('header') !== -1
      ) {
        this.hasFocus = false
        this.showSearchHelper = false
        this.showSuggestions = false
      }
    },
    getSearchHistory() {
      api.getUserInfo().then(res => {
        this.username = res.data.username
        const searchHistory =
          JSON.parse(localStorage.getItem('search-history')) || {}
        this.recentSearchList = searchHistory[res.data.username] || []
      })
    },
    getBrowsingHistory() {
      api
        .getAssetVisitHistory({
          pageNum: 0,
          pageSize: 5,
        })
        .then(res => {
          this.browsingHistory = res.data.data.content.map(item => {
            const mapRs = { ...item }
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
    handleCurrentChange(page) {
      // console.log(page)
      this.getSearchResult(
        this.getSearchParams({
          assetsType: String(this.activeName),
          pageNum: page,
          pageSize: 20,
        })
      )
    },
    // 搜索关键词输入框 focus 时
    focusKeywordInput() {
      this.hasFocus = true
      if (this.keywords.trim().length) {
        this.showSearchHelper = false
        this.showSuggestions = true
        if (this.suggestions.length === 0) {
          this.handleKeywordChange()
        }
      } else {
        this.showSearchHelper = true
        this.showSuggestions = false
        this.getBrowsingHistory()
        this.getSearchHistory()
      }
    },
    // 点击搜索按钮 或 敲回车
    searchByKeyword(p = {}) {
      this.hasFocus = false
      this.showSearchHelper = false
      this.showSuggestions = false
      const keyword = this.keywords.trim()
      if (this.recentSearchList.indexOf(keyword) === -1 && keyword) {
        const rs = _.cloneDeep(this.recentSearchList)
        const searchHistory =
          JSON.parse(localStorage.getItem('search-history')) || {}
        rs.push(keyword)
        // console.log(rs)
        searchHistory[this.username] = rs
        localStorage.setItem('search-history', JSON.stringify(searchHistory))
        this.recentSearchList = rs
      }
      let typeIds
      if (this.selectedTypes.length) {
        typeIds = [this.selectedTypes[0].id]
      } else {
        typeIds = [this.searchTypes[0].id]
        this.isAllTypes = true
        this.$nextTick(() => {
          this.handleAllTypes()
        })
      }
      this.activeName = String(typeIds[0])
      // if (typeIds.includes('TABLE')) {
      //   typeIds.push('VIEW')
      // }
      this.getSearchResult(
        this.getSearchParams({
          pageNum: 1,
          pageSize: 20,
          assetsType: typeIds.join(','),
        })
      )
      this.$refs.keywordInput.blur()
    },
    getSearchParams(p = {}) {
      return {
        pageNum: 1,
        pageSize: 10,
        searchName: this.keywords,
        assetsType: p.assetsType,
        ...p,
      }
    },
    getSearchResult(params) {
      this.$datablauLoading.loading()
      api
        .searchByKeyword(params)
        .then(res => {
          const formatedRes = this.handleSearchData(
            res.data.data.buckets,
            params.assetsType
          )
          this.searchResults = formatedRes
          this.currentResults = formatedRes || []
          console.log(params)
          this.pagination = {
            total: res.data.data.totalHits,
            page: params.pageNum,
            pageSize: params.pageSize,
          }
          this.$datablauLoading.close()
        })
        .catch(e => {
          this.currentResults = []
          this.$datablauLoading.close()
          this.$showFailure(e)
        })
    },
    handleKeywordChange() {
      // console.log(this.keywords)
      if (this.keywords.trim().length) {
        // 根据keyword和type进行模糊查询
        // this.getSyno() // 同义词查询
        let typeIds
        if (this.selectedTypes.length) {
          typeIds = this.selectedTypes.map(selected => selected.id)
        } else {
          typeIds = this.searchTypes.map(type => type.id)
          this.isAllTypes = true
          this.$nextTick(() => {
            this.handleAllTypes()
          })
        }
        // if (typeIds.indexOf('TABLE') !== -1) typeIds.push('VIEW')
        let param = {
          pageNum: 0,
          pageSize: 10,
          searchName: this.keywords,
          assetsType: typeIds.join(','),
        }
        api
          .searchSuggestion(param)
          .then(res => {
            // console.log(res)
            console.log(this.hasFocus)
            const formatedSuggestionData = handleSuggestionData(res.data.data)
            this.suggestions = formatedSuggestionData
            if (this.hasFocus) {
              this.showSuggestions = true
              this.showSearchHelper = false
            }
          })
          .catch(e => {
            const formatedSuggestionData = handleSuggestionData([])
            this.suggestions = formatedSuggestionData
            this.showSuggestions = true
            this.showSearchHelper = false
          })
      } else {
        this.showSearchHelper = true
        this.showSuggestions = false
        this.getBrowsingHistory()
        this.getSearchHistory()
        this.suggestions = []
      }
    },
    handleSearchData(data = [], type) {
      // console.log(data)
      const res = []
      data.forEach(h => {
        const originData = {
          ...h,
          typeId: h.subAssetsType,
          objectId: h.itemId,
          code: h.domainCode, // 标准代码
          itemId: h.itemId, // 数据标准/基础标准
          id: h.id,
          api: h.api,
          domainId: h.itemId,
          categoryId: h.categoryId,
          secName: h.alias,
          structureId: h.structureId,
          catalogId: h.catalogId,
          isAuth: h.isAuth,
        }
        const body = {
          typeId: type,
          type,
          name: h.assetsName,
          code: h.domainCode,
          originData,
        }
        if (h.code) {
          body.name += `(${h.code})`
        }
        if (h.filePath) {
          body.id = h.id
        }

        res.push(body)
      })
      // console.log(res)
      return res
    },
    formatAlias(str) {
      if (!str) {
        return ''
      }
      if (this.keywords) {
        const strList = this.keywords.split(' ').filter(item => item)
        strList.map(item => {
          if (str.includes(item)) {
            str = str
              .replace(new RegExp(item, 'g'), `<em>${item}</em>`)
              .replace(
                new RegExp(item.toLowerCase(), 'g'),
                `<em>${item.toLowerCase()}</em>`
              )
              .replace(
                new RegExp(item.toUpperCase(), 'g'),
                `<em>${item.toUpperCase()}</em>`
              )
          }
        })
        return str
      } else {
        return str
      }
      if (this.keywords) {
        let heightStr = str
          .replace(new RegExp(this.keywords, 'g'), `<em>${this.keywords}</em>`)
          .replace(
            new RegExp(this.keywords.toLowerCase(), 'g'),
            `<em>${this.keywords.toLowerCase()}</em>`
          )
          .replace(
            new RegExp(this.keywords.toUpperCase(), 'g'),
            `<em>${this.keywords.toUpperCase()}</em>`
          )
        return heightStr
      } else {
        return str
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
        if (this.showSuggestions) {
          this.$showFailure(this.$t('assets.gateway.typeCannotEmpty'))
          this.isAllTypes = true
        } else {
          this.selectedTypes = []
        }
      }
      if (this.showSuggestions) {
        this.handleKeywordChange()
      }
    },
    // 选择资产类型
    selectType(type) {
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
      if (selectedTypes.length === this.searchTypes.length) {
        this.isAllTypes = true
      }

      if (this.showSuggestions) {
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

    handleTabClick() {
      this.getSearchResult(
        this.getSearchParams({
          assetsType: String(this.activeName),
          pageNum: 1,
          pageSize: 20,
        })
      )
    },

    handleResultClick(item) {
      if (item.originData.isAuth) {
        const visitParams = getVisitParams(item.originData)
        api.visitAsset(visitParams)
        toBrowsing(item.originData, this)
      } else {
        this.$blauShowFailure(`您对${item.originData.assetsName}没有访问权限`)
      }
    },
    handleSuggestionClick(item) {
      // console.log(item)
      if (item.isAuth) {
        const visitParams = getVisitParams(item)
        api.visitAsset({
          ...visitParams,
          username: this.username,
        })
        toBrowsing(item, this)
      } else {
        this.$blauShowFailure(`您对${item.name}没有访问权限`)
      }
    },
  },
  destroyed() {
    console.log('待销毁')
    document.removeEventListener('click', this.handleDocumentClick)
    this.$store.commit('setDDCHome', false)
  },
}
