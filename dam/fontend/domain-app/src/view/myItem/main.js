import itemColumn from './itemColumn.vue'
import itemPreview from './itemPreview.vue'
// import relation from './relation.vue';
// import oldRelation from './oldRelation.vue';
import logicalRelation from './logicalRelation.vue'
import consanguinityGraph from './consanguinityGraph.vue'
import comment from './commentComponents/comment.vue'
import dataViste from './dataViste.vue'
import HTTP from '../../http/main'
import 'prismjs/themes/prism.css'
import sqlFormatter from 'sql-formatter'
import Prism from 'prismjs'
import businessProperties from './business-properties.vue'
import tableDetails from '@/view/dataProperty/meta/tableDetails.vue'

export default {
  components: {
    itemColumn,
    itemPreview,
    // relation,
    // oldRelation,
    logicalRelation,
    consanguinityGraph,
    comment,
    dataViste,
    businessProperties,
    tableDetails,
  },
  data() {
    const { grey, greyBorder } = this.$style
    return {
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
      activeName: 'column',
      ps: null,
      summary: {
        definition: '&nbsp;<br>&nbsp;',
        wholeName: ' ',
      },
      summaryLoaded: false,
      show: false,

      columns: [],
      columnsLoaded: false,
      // columnsProfileMap:new Map(),
      columnsProfileLoaded: false,
      columnsProfileKey: 0,
      profilingTimestamp: 0,
      profilingInterval: null,
      profiling: false,
      preview: [],
      previewLoaded: false,
      currentModleId: '',
      currentModelName: '',
      searchKeyword: '',
      commentCnt: 0,
      canNotProfile: true,
      profilingRowCount: 0,
      favoPara: null,
      favId: null,
      jdbcMap: null,
      currentObject: {},
      loadedTags: [],
      isAssets: '',
    }
  },
  props: {},
  beforeMount() {
    this.getJdbcDsMap()
    this.queryData = this.getQuery()
    this.dataType = this.queryData.type
  },
  mounted() {
    if (this.$route.query.isAssets) {
      this.isAssets = this.$route.query.isAssets
    }
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
      this.searchKeyword = this.queryData.keyword
    } else {
      this.searchKeyword = this.queryData.keyword
    }

    // setTimeout(() => {
    //   const listContainer = $(this.$el).find('.ps-container')[0]
    //   this.ps = new NewPs(listContainer)
    // })
    $(window).on('resize', this.handleResize)
    this.getSummary()
    if (this.queryData.type === 'TABLE') {
      this.activeName = 'column'
      this.getColumns()
      this.checkIfCanProfile()
    } else {
      this.activeName = 'sql'
    }

    this.$bus.$on('jumpToObject', ({ type, object }) => {
      object.type = type
      this.handleItemClickFromDetail(object)
    })

    // this.postProfile();
  },
  beforeDestroy() {
    if (this.ps) {
      this.ps.destroy()
    }
    $(window).off('resize', this.handleResize)
  },
  methods: {
    handleItemClickFromDetail({ objectId, type }) {
      const pos = location.href.indexOf('#/')
      const baseUrl = location.href.slice(0, pos + 2)
      if (type === 'REPORT') {
        window.open(
          baseUrl +
            `main/reportFormManage?id=${objectId}&blank=true&isAssets=true&isAssets=${this.isAssets}`,
          '_blank'
        )
      } else {
        window.open(
          baseUrl +
            `main/meta?objectId=${objectId}&blank=true&isAssets=${this.isAssets}`,
          '_blank'
        )
      }
    },
    loadTags() {
      var self = this
      self.$http
        .get(self.$url + '/service/tags/')
        .then(res => {
          if (res.data && res.data.length) {
            var map = {}
            res.data.forEach(item => {
              map[item.tagId] = item
            })
            var treeData = []
            res.data.forEach(item => {
              if (item.parentId) {
                var parent = map[item.parentId]
                if (!parent.children) {
                  parent.children = []
                }
                parent.children.push(item)
              } else {
                treeData.push(item)
              }
            })
            self.loadedTags = treeData
            // self.tagMap = map;
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
        .then(() => {})
    },
    dataInit() {
      this.favoPara = {
        typeId: this.summary.properties.TypeId,
        objId: this.queryData.objectId,
        objectName: this.summary.logicalName || this.summary.physicalName,
      }
      this.currentObject = {
        objectId: this.queryData.objectId,
        type: this.dataType,
      }
      this.checkIfCollected()
      this.getTableRate()
    },
    checkIfCanProfile() {
      HTTP.getIsTableCanProfiling({
        objectId: this.queryData.objectId,
        successCallback: data => {
          if (typeof data === 'boolean') {
            this.canNotProfile = !data
          }
        },
        finallyCallback: e => {
          // this.canNotProfile = true;
        },
      })
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
        objId: this.queryData.objectId,
        typeId: this.summary.properties.TypeId,
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
    transform() {
      this.tableName = this.summary.physicalName
      this.modelId = this.summary.modelId
      const sharp = location.href.indexOf('#')

      window.open(
        location.href.slice(0, sharp + 1) +
          `/transformAction?modelId=${this.modelId}&tableName=${this.tableName}`
      )
      // this.$router.push({name:'transformAction',query:{modelId:this.modelId,tableName:this.tableName}});
      // this.handleClose();
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
      window.close()
      location.hash = ''
      // window.history.back();
    },
    getSummary() {
      const objectId = this.queryData.objectId
      if (objectId) {
        HTTP.getTableSummary({
          objectId: objectId,
          successCallback: data => {
            this.summary = data
            this.summaryLoaded = true
            this.calculateWholeName()
            this.show = true
            this.currentModleId = data.modelId
            this.currentModelName = data.modelName

            if (this.queryData.nav === 'comment') {
              this.activeName = 'comment'
            }
            // this.getCommentCnt();

            this.dataInit()
            if (this.dataType === 'VIEW') {
              if (data.properties) {
                this.initSql(data.properties.SQL)
              }
            }
          },
          failureCallback: e => {
            this.$showFailure(e)
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
    getProfile({ user = false } = {}) {
      const objectId = this.queryData.objectId
      if (objectId) {
        this.profilingTimeStamp = 0
        this.profilingRowCount = 0
        HTTP.getTableProfile({
          objectId: objectId,
          successCallback: data => {
            if (user) {
              if (data.length === 0) {
                this.$message.info('数据探查执行完毕，没有结果可以展示')
              } else {
                this.$message.success('数据探查执行完毕，结果已更新')
              }
            }
            const columnsProfileMap = new Map()

            data.forEach(item => {
              columnsProfileMap.set(item.objectId, item)
              if (
                item.profileTimestamp &&
                item.profileTimestamp > this.profilingTimestamp
              ) {
                this.profilingTimestamp = item.profileTimestamp
              }
              if (item.typeId === 80000004) {
                this.profilingRowCount = item.rowCount
              }
            })
            this.columns.forEach(col => {
              col.profile = columnsProfileMap.get(col.objectId)
            })
            this.columnsProfileKey++
          },
        })
      }
    },
    getProfilingState() {
      const objectId = this.queryData.objectId
      this.profiling = true
      if (objectId) {
        HTTP.getIsTableProfiling({
          objectId: objectId,
          successCallback: isTrue => {
            if (isTrue) {
            } else {
              this.profiling = isTrue
              clearInterval(this.profilingInterval)
              // this.getProfile({user:true});
              this.getColumns({ user: true })
            }
          },
        })
      }
    },
    getColumns({ user = false } = {}) {
      const objectId = this.queryData.objectId
      if (objectId) {
        HTTP.getTableColumns({
          objectId: objectId,
          successCallback: data => {
            this.columns = data
            this.columnsLoaded = true
            this.getProfile({ user: user })
          },
          failureCallback: () => {
            this.columns = []
            this.columnsLoaded = true
          },
        })
      }
    },
    getPreview() {
      this.previewLoaded = true
      const objectId = this.queryData.objectId
      if (objectId) {
        HTTP.getTablePreview({
          objectId: objectId,
          successCallback: data => {
            this.preview = data
            this.previewLoaded = true
          },
          failureCallback: data => {
            this.preview = []
            this.previewLoaded = true
          },
        })
      }
    },
    calculateWholeName() {
      if (
        this.summary.logicalName &&
        this.summary.logicalName !== this.summary.physicalName
      ) {
        this.summary.wholeName =
          this.summary.physicalName + '(' + this.summary.logicalName + ')'
      } else {
        this.summary.wholeName = this.summary.physicalName
      }
    },
    handleCreateView() {
      this.$router.push({
        name: 'createView',
        path: '/main/createView',
        query: {
          objectId: this.queryData.objectId,
          tablePath: this.queryData.catalogPath,
        },
      })
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
    o1() {},
    handleButtonClick(evt) {
      evt.stopPropagation()
      const x = evt.clientX
      const y = evt.clientY
      let options = [
        // {
        //   label: '创建API',
        //   callback: this.o1
        // },
        {
          label: '在线编辑数据',
        },
        {
          label: 'BI数据可视化',
        },
      ]

      options = []
      if (this.dataType === 'TABLE') {
        // if (this.$user.username !== this.summary.owner) {
        //   options.push({
        //     label: '加入申请单',
        //     callback: this.handleApplyData
        //   });
        // } else if (this.$user.username === this.summary.owner) {
        //   options.push({
        //     label:'创建API',
        //     callback:this.handleCreateView
        //   });
        // }
        // if (!this.couldCreateView) {
        //   options = [];
        // }
        // else if(!this.$vdpsMap[this.currentModleId]){
        //   options.push({
        //     label:'创建API',
        //     callback:()=>{
        //       this.$message.warning(`请先根据数据源${this.currentModelName}创建虚拟数据源`);
        //     }
        //   });
        // }
        options.push({
          label: '在线编辑数据',
          callback: this.transform,
        })
      }
      options.push({
        label: 'BI数据可视化',
        callback: () => {
          this.$message.info('请接入BI产品')
        },
      })

      if (options.length > 0) {
        this.$bus.$emit('callContextMenu', {
          x: x,
          y: y,
          options: options,
          isLeft: true,
        })
      }
    },
    initSql(sql) {
      const sqlContent = _.trim(sql)
      // this.sqlContent = sqlFormatter.format(sqlContent);
      this.sqlContent = sqlContent
      this.$nextTick(() => {
        setTimeout(() => {
          Prism.highlightAll()
        })
      })
    },
    copyToClipboard() {
      if (this.sqlContent) {
        this.$utils.string.setClipBoard(this.sqlContent)
        this.$message.success(
          'sql语句已经拷贝到剪贴板，请在目的位置使用 Ctrl + V 进行粘贴'
        )
      } else {
        this.$message.info('没有sql语句可以拷贝')
      }
    },
    getJdbcDsMap() {
      const jdbcMap = {}
      HTTP.getAllDataSource()
        .then(res => {
          const data = res.data
          const fileType = {
            CSV: true,
            EXCEL: true,
            DATADICTIONARY: true,
            TABLEAU: true,
            SMBSHAREFILE: true,
          }
          for (const key in data) {
            const ds = data[key]
            if (
              ds.connectionInfo &&
              ds.connectionInfo.connectType &&
              ds.connectionInfo.connectType === 'JDBC' &&
              !fileType[ds.type]
            ) {
              jdbcMap[ds.modelId] = true
            }
          }
          this.jdbcMap = jdbcMap
        })
        .catch(e => {
          console.log(e)
        })
    },
  },
  computed: {
    hasProfilingAccess() {
      // let roles = this.$user.roles;
      // return !!(roles.indexOf('ROLE_SUPERUSER') > -1 || roles.indexOf('ROLE_DATA_CATALOG_ADMIN'));
      return !this.canNotProfile
    },
    profilingStateLabel() {
      if (this.profilingTimestamp) {
        return `<b>上次运行时间</b><br>${this.$timeFormatter(
          this.profilingTimestamp
        )}`
      } else {
        return '未执行过探查或无结果'
      }
    },
    couldCreateView() {
      return (
        this.summary &&
        this.summary.modelId &&
        this.jdbcMap &&
        this.jdbcMap[this.summary.modelId]
      )
    },
  },
}
