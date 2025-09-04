import comment from './commentComponents/comment.vue'
import HTTP from '../../http/main'
import standardScan from './domain/standardScan.vue'
import scan from '@/view/newDataStandard/standardScan.vue'
export default {
  components: {
    comment,
    standardScan,
    scan,
  },
  data() {
    const { grey, greyBorder } = this.$style
    return {
      pageLoading: true,
      style: {
        preview: {
          // height:'180px',
          // borderBottom:greyBorder,
          padding: '10px 5px',
        },
      },
      dataType: '',
      sqlContent: '',
      tableRate: 0,
      hasCollected: false,
      queryData: {},
      catalogPathArr: [],
      activeName: 'detail',
      ps: null,
      summary: {
        definition: '&nbsp;<br>&nbsp;',
        wholeName: ' ',
      },
      show: true,

      searchKeyword: '',
      commentCnt: 0,
      canNotProfile: true,
      profilingRowCount: 0,
      favoPara: null,
      favId: null,

      udps: null,
      domainHasComment: new Map(),
      typeIds: 1,
      labelText: {
        typeName: '数据标准',
        standard: this.$version.domain.propertyType.standard,
        domainCode: this.$version.domain.property.domainCode,
        status: '标准状态',
        name: '标准名称',
        nameAbbr: '标准',
      },
      nodeData: [],
    }
  },
  props: {},
  beforeMount() {
    this.queryData = this.getQuery()
    this.dataType = this.queryData.type
  },
  mounted() {
    this.queryData = this.getQuery()
    if (this.queryData.catalogPath && this.queryData.catalogPath.length > 0) {
      if (!Array.isArray(this.queryData.catalogPath)) {
        this.queryData.catalogPath = [this.queryData.catalogPath]
      }
      const catalogMap = this.$globalData.catalogsMap
      const arr = []
      this.queryData.catalogPath.forEach(item => {
        item = item - 0
        if (item && catalogMap.has(item)) {
          const cur = catalogMap.get(item)
          arr.push(cur)
        }
      })
      this.catalogPathArr = arr
    } else {
      this.searchKeyword = this.queryData.keyword
      if (this.queryData.vote) {
        this.tableRate = Number.parseFloat(this.queryData.vote)
      } else {
        this.tableRate = 0
      }
    }
    // setTimeout(() => {
    //   const listContainer = $(this.$el).find('.ps-container')[0]
    //   this.ps = new NewPs(listContainer)
    // })
    $(window).on('resize', this.handleResize)
    this.getSummary()
  },
  beforeDestroy() {
    if (this.ps) {
      this.ps.destroy()
    }
    $(window).off('resize', this.handleResize)
  },
  methods: {
    getNode() {
      this.nodeData = [
        {
          name: this.searchKeyword ? this.searchKeyword + '的搜索结果' : '全部结果',
          couldClick: false,
        },
        { name: this.summary.chineseName, couldClick: false },
      ]
    },
    dataInit() {
      this.favoPara = {
        typeId: this.$commentPreCode.Domain,
        objId: this.summary.domainId,
        objectName: this.summary.chineseName,
      }
      this.checkIfCollected()
    },
    toggleCollecStatus() {
      this.hasCollected = !this.hasCollected
      const obj = this.favoPara
      const succesedCallback = res => {
        const msg = this.hasCollected ? '收藏成功' : '取消收藏成功'
        this.$message.success(msg)
        this.refreshFavStatus()
        this.checkIfCollected()
      }
      const failureCallback = e => {
        this.$showFailure(e)
        this.refreshFavStatus()
        this.checkIfCollected()
      }
      if (this.hasCollected) {
        HTTP.addFavorite({
          succesedCallback: succesedCallback,
          failureCallback: failureCallback,
          para: obj,
        })
      } else {
        this.favId &&
          HTTP.removeCollection({
            succesedCallback: succesedCallback,
            failureCallback: failureCallback,
            para: {
              favId: this.favId,
            },
          })
      }
    },
    checkIfCollected() {
      const para = this.favoPara
      HTTP.getIfCollected({
        succesedCallback: data => {
          this.hasCollected = !!data
          if (data) {
            this.favId = data.id
          }
        },
        failureCallback: e => {
          this.$showFailure(e)
          this.hasCollected = false
        },
        para: para,
      })
    },
    refreshFavStatus() {
      HTTP.refreshCollectionList({
        succesedCallback: data => {},
        failureCallback: e => {
          this.$showFailure(e)
        },
      })
    },
    getTableRate() {
      const para = {
        objId: this.queryData.domainId,
        typeId: this.$commentPreCode.Domain,
      }
      HTTP.getAverageRate({
        succesedCallback: res => {
          this.tableRate = parseFloat(res)
        },
        failureCallback: e => {
          this.$showFailure(e)
        },
        para: para,
      })
    },
    handleRateSubmit() {
      this.getTableRate()
    },
    getCommentCnt() {
      this.$http
        .get(
          this.$url +
            `/service/thread/types/1/objects/${this.summary.objectId}?size=1`
        )
        .then(res => {
          this.commentCnt = res.data.thread.msgCount - 1
        })
        .catch(e => {
          this.commentCnt = 0
        })
    },
    handleResize() {
      if (this.ps) {
        this.$nextTick(() => {
          this.ps.update()
        })
      }
    },
    handleTabClick() {
      this.handleResize()
      switch (this.activeName) {
        case 'column':
          if (!this.columnsLoaded) {
            this.getColumns()
          }
          break
        case 'data':
          if (!this.previewLoaded) {
            this.getPreview()
          }
          break
        case 'dataViste':
          this.$refs.dataViste && this.$refs.dataViste.dataInit()
          break
        default:
          break
      }
    },
    handleShowAllData() {
      if (this.searchKeyword) {
        this.$router.push({
          name: 'search',
          query: { keyword: this.searchKeyword },
        })
      } else {
        this.back2Index()
      }
    },
    handleSkip2catalog(data) {
      this.$router.push({
        name: 'search',
        query: { catalogId: data.id },
      })
    },
    handleClose() {
      this.$emit('close')
      // window.history.back();
      window.close()
      location.hash = ''
    },
    getUdps() {
      HTTP.getUpds({ categoryId: this.typeIds })
        .then(res => {
          let data = res.data
          if (data && Array.isArray(data)) {
            data = data.filter(
              item => item.bindFolderId - 0 === this.typeIds - 0
            )
          } else {
            data = []
          }
          this.udps = data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getSummary() {
      const objectId = this.queryData.domainId
      if (objectId) {
        HTTP.getDomainDetail({
          domainId: objectId,
          successCallback: data => {
            this.summary = data
            this.getNode()
            this.typeIds = data.categoryId
            this.getUdps()
            this.calculateWholeName()
            this.show = true
            if (this.queryData.nav === 'comment') {
              this.activeName = 'comment'
            }
            this.dataInit()
          },
          failureCallback: e => {
            this.$showFailure(e)
          },
          finallyCallback: () => {
            this.pageLoading = false
          },
        })
      }
    },
    postProfile() {
      const objectId = this.queryData.objectId
      if (objectId) {
        HTTP.postTableProfile({
          objectId: objectId,
          successCallback: data => {
            this.profiling = true
            this.profilingInterval = setInterval(() => {
              this.getProfilingState()
            }, 1500)
          },
          failureCallback: e => {
            this.$showFailure(e)
          },
        })
      }
    },
    testVacantProfile() {
      this.columns.forEach(col => {
        col.profile = null
      })
      this.columnsProfileKey++
    },
    calculateWholeName() {
      this.summary.wholeName = this.summary.domainChName
    },
    handleApplyData(event) {
      const data = this.queryData.objectId
      const userName = this.$user.username
      this.$utils.localStorage.saveDataApplication({
        attr: 'dataApply',
        data,
        type: 'Object',
        userName: userName,
      })
      this.$showSuccess('添加成功')
      this.$bus.$emit('addTableApplication', event)
    },
    getQuery() {
      const obj = this.$route.query || {}
      // if (this.data) {
      //   for(let key in this.data) {
      //     obj[key] = this.data[key];
      //   }
      // }
      return obj
    },
    back2Index() {
      this.$router.push({
        name: 'home',
      })
    },
  },
  computed: {},
}
