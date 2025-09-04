export default {
  data() {
    return {
      keywordFromNav: '',
      rawData: {},
      pageSize: 50,
      currentPage: 1,
      pageData: [],
      outerContainer: $('#page-outer')[0],
      showStats: false,
      resultCount: 0,
      timeCost: '',
      currentType: 'all',
      searchTypes: [],
      allTypes: [
        'TABLE', // ok
        'COLUMN', // ok
        //        'TAG',
        // 'MODEL_CATEGORY',//ok
        // 'QUALITY_BUSINESS_RULE',
        'CODE', // ok
        //        'MODEL',
        'DOMAIN', // ok
      ],
      typeMap: {
        82800002: 'Report',
        82800004: 'DataStage',
        80010066: 'DOMAIN',
        80010098: 'CODE',
        80000004: 'TABLE',
        80000005: 'COLUMN',
        80500008: 'VIEW',
        82800003: 'INDEX',
        82800008: 'SHAREFILE',
      },
    }
  },
  mounted() {
    Ps.initialize($('#page-outer')[0])
    this.keywordFromNav = this.$route.query.keyword
    this.getData()
    this.$bus.$on('searchForDam', keyword => {
      this.keywordFromNav = keyword
      this.getData()
    })
  },
  beforeDestroy() {
    this.$bus.$off('searchForDam')
  },
  methods: {
    getDataStageOrReport({ callback }) {
      let typeIds = []
      let allTypes = false
      if (!this.searchTypes || !this.searchTypes.length) {
        allTypes = true
      }
      if (this.searchTypes.includes('Report')) {
        typeIds.push('82800002')
      } else if (this.searchTypes.includes('DataStage')) {
        typeIds.push('82800004')
      } else if (this.searchTypes.includes('DOMAIN')) {
        typeIds.push('80010066')
      } else if (this.searchTypes.includes('SHAREFILE')) {
        typeIds.push('82800008')
      } else if (this.searchTypes.includes('CODE')) {
        typeIds.push('80010098')
      } else if (this.searchTypes.includes('TABLE')) {
        typeIds.push('80000004')
      } else if (this.searchTypes.includes('INDEX')) {
        typeIds.push('82800003')
      } else {
        typeIds = [
          '82800002',
          '82800004',
          '80010066',
          '82800008',
          '80010098',
          '80000004',
          '82800003',
        ]
      }

      this.$http
        .post(`${this.$url}/service/ddc/search`, {
          path: '',
          tagIds: null,
          pageSize: this.pageSize,
          currentPage: this.currentPage - 1,
          keyword: this.keywordFromNav,
          typeIds: typeIds,
        })
        .then(res => {
          this.rawData.content = []
          res.data.hits.hits.forEach(h => {
            let definition = ''
            if (Array.isArray(h._source.columns)) {
              if (h._source.columns.length > 0) {
                definition += '字段：'
              }
              h._source.columns.forEach(item => {
                // definition += `${item.tableName}/${item.columnName}; `;
                definition += `${item.name || item.tableName}; `
              })
            }
            if (h._source.description) {
              definition += ` 描述:${h._source.description}`
            }

            const body = {
              type: this.typeMap[h._source.typeId],
              name: h._source.name,
              definition: definition,
              code: h._source.code,
              orginData: h._source,
            }
            if (h._source.code) {
              body.name += `(${h._source.code})`
            }
            if (h._source.filePath) {
              body.id = h._source.id
            }

            this.rawData.content.push(body)
          })
          if (callback) {
            callback(res.data)
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getData() {
      if (this.rawData.content) {
        this.rawData.content.length = 0
        this.resultCount = 0
      }
      const startTime = new Date().getTime()
      const callback = data => {
        this.getPageData()
        this.resultCount += data.hits.total.value
        const endTime = new Date().getTime()
        this.timeCost = (endTime - startTime) / 1000
        this.outerContainer = $('#page-outer')[0]
        if (this.outerContainer) {
          this.outerContainer.scrollTop = 0
          setTimeout(() => {
            Ps.update(this.outerContainer)
          })
        }
      }

      this.getDataStageOrReport({ callback: callback })
      return
      if (
        this.searchTypes.includes('Report') ||
        this.searchTypes.includes('DataStage')
      ) {
        this.getDataStageOrReport({ callback: callback })
        return
      }

      const requestBody = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        keyword: this.keywordFromNav,
      }
      if (this.searchTypes.length > 0) {
        requestBody.types = this.searchTypes
      } else {
        requestBody.types = this.allTypes
      }

      this.$http
        .post(this.$meta_url + '/service/entities/searchMetadata', requestBody)
        .then(res => {
          this.rawData = res.data
          if (this.searchTypes.length > 0) {
            this.getPageData()
            this.resultCount = res.data.hits.total.value
            const endTime = new Date().getTime()
            this.timeCost = (endTime - startTime) / 1000
            this.outerContainer = $('#page-outer')[0]
            if (this.outerContainer) {
              this.outerContainer.scrollTop = 0
              setTimeout(() => {
                Ps.update(this.outerContainer)
              })
            }
          } else {
            this.getDataStageOrReport({ callback: callback })
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getPageData() {
      //    let start = this.pageSize * (this.currentPage -1);
      //    let end = start + this.pageSize;
      //    this.pageData = this.rawData.content.slice(start,end);
      this.pageData = this.rawData.content
    },
    currentChange() {
      this.currentPage = arguments[0]
      this.getData()
    },
    handleTypeChange() {
      if (this.currentType == 'all') {
        this.searchTypes = []
      } else {
        this.searchTypes = [this.currentType]
      }
      this.currentPage = 1
      this.getData()
    },
    typeTranslate(en) {
      switch (en) {
        case 'TABLE':
          return '表'
        case 'COLUMN':
          return '列'
        case 'MODEL_CATEGORY':
          return '系统'
        case 'DOMAIN':
          return '标准'
        case 'QUALITY_BUSINESS_RULE':
          return '业务质量规则'
        case 'CODE':
          return '标准代码'
        case 'Report':
          return '报表'
        case 'SHAREFILE':
          return '文件'
        case 'INDEX':
          return '指标'
        case 'VIEW':
          return '视图'
        case '':
          return ''
        default:
          return '未知'
      }
    },
    go() {
      const detail = arguments[0]
      let skipBody = null
      const orginData = detail.orginData || {}
      switch (detail.type) {
        case 'DOMAIN':
          skipBody = { name: 'domain', query: { domainId: orginData.domainId } }
          break
        case 'CODE':
          skipBody = { name: 'code', query: { code: orginData.code } }
          break
        case 'MODEL_CATEGORY':
          this.$router.push({
            name: 'modelCategory',
            query: { id: detail.id },
          })
          break
        case 'QUALITY_BUSINESS_RULE':
          this.$router.push({
            name: 'dataQualityRules',
            query: { id: detail.id },
          })
          break
        case 'TABLE':
          skipBody = { name: 'table', query: { objectId: orginData.objectId } }
          break
        case 'VIEW':
          skipBody = { name: 'view', query: { objectId: orginData.objectId } }
          break
        case 'INDEX':
          skipBody = { name: 'index', query: { code: orginData.code } }
          break
        case 'COLUMN':
          // this.$router.push({
          //   name:'dataCatalog',
          //   query:{'table':detail.parentId,'column':detail.objectId}
          // });
          break
        case 'MODEL':
          this.$router.push({
            name: 'dataCatalog',
            query: {
              type: 'model',
              categoryId: detail.modelCategoryId,
              modelId: detail.id,
            },
          })
          break
        case 'Report':
          skipBody = {
            name: 'reportform',
            query: { objectId: detail.orginData.id },
          }
          break
        case 'SHAREFILE':
          skipBody = { name: 'file', query: { objectId: detail.id } }
          break
        default:
          break
      }

      if (skipBody && skipBody.name) {
        this.$skip2(skipBody, 'dam')
      }
    },
    skip2Required() {
      this.$skip2({
        name: 'dataDemand',
        query: {
          currentTab: 'add',
          keyword: this.keywordFromNav,
        },
      })
    },
  },
}
