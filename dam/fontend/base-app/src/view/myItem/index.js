import comment from './commentComponents/comment.vue'
import HTTP from '../../http/main'
import standardScan from './domain/standardScan.vue'
import indexScan from './index/scan.vue'
export default {
  components: {
    comment,
    indexScan,
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

      currentType: '',
      msgFromParent: undefined,
      baseCode: null,
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
      this.tableRate = Number.parseFloat(this.queryData.vote)
    }
    setTimeout(() => {
      const listContainer = $(this.$el).find('.ps-container')[0]
      this.ps = new NewPs(listContainer)
    })
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
    dataInit() {
      this.favoPara = {
        typeId: this.$commentPreCode.Index,
        objId: this.summary.codeId,
        objectName: this.summary.wholeName,
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
        objId: this.queryData.code,
        typeId: this.$commentPreCode.Index,
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
            `/service/thread/types/1/objects/${this.summary.code}?size=1`
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
    getBaseCode(id, failureCallback) {
      this.$http
        .get(this.$url + '/service/me/baseCodes/' + id)
        .then(res => {
          this.summary = res.data
          this.currentType = 'BASE_CODE'
          this.calculateWholeName()
          this.show = true
          if (this.queryData.nav === 'comment') {
            this.activeName = 'comment'
          }
          this.dataInit()
        })
        .catch(e => {
          this.$showFailure(e)
          if (failureCallback) {
            failureCallback(id)
          }
        })
    },
    getCode(id, failureCallback) {
      this.$http
        .get(this.$url + '/service/me/codes/' + id)
        .then(res => {
          this.summary = res.data
          this.currentType = 'CODE'
          this.calculateWholeName()
          this.show = true
          if (this.queryData.nav === 'comment') {
            this.activeName = 'comment'
          }
          this.dataInit()
        })
        .catch(e => {
          if (failureCallback) {
            failureCallback(id)
          }
        })
        .then(() => {
          this.pageLoading = false
        })
    },

    getSummary() {
      const objectId = this.queryData.code
      this.getCode(objectId, id => {
        this.getBaseCode(id)
      })
    },
    testVacantProfile() {
      this.columns.forEach(col => {
        col.profile = null
      })
      this.columnsProfileKey++
    },
    calculateWholeName() {
      if (this.summary.chAbbr) {
        this.summary.wholeName = this.summary.chAbbr
      } else {
        this.summary.wholeName = this.summary.cnAbbr
      }
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
    n2br(str) {
      if (typeof str === 'string') {
        return str.replace(/\n/g, '<br>')
      } else {
        return ''
      }
    },
  },
  computed: {},
}
