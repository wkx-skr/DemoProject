import HTTP from '@/resource/http'
import sort from '@/resource/utils/sort'
// import modelGraph from './graph/modelGraphEdit.vue'
import report from './report/list.vue'
import PinyinMatch from 'pinyin-match'
import ResizeHorizontal from '@/components/common/ResizeHorizontal'
import neoDomain from './graph/editComponents/neoDomainSelector.vue'
import archyObject from "@/views/list/graph/editComponents/archyObject.vue"
import $ from 'jquery'
import _, { cloneDeep } from 'lodash'
import LDMTypes from '@constant/LDMTypes'
import { v4 as uuidv4 } from 'uuid'
let modelGraphEdit = null
if (window.EREncode) {
  try {
    require('@er/modelEdit.css')
  } catch (e) {
    console.log(e)
  }
} else {
  try {
    modelGraphEdit = require('./graph/modelGraphEdit.vue').default
  } catch (e) {
    console.log(e)
  }
}
export default {
  components: modelGraphEdit ? {
    modelGraphEdit,
    neoDomain,
    archyObject
  } : {
    neoDomain,
    archyObject
  },
  mounted () {
    document.addEventListener('click', this.outEditSearch)
    this.getDiagrams()
    // this.initHorizontalResize()
    this.getPermission()
    this.$bus.$on('update-model', (data) => {
      if (data) {
        this.diagrams = []
        this.mapIdToDiagramData = {}
        const transformDiagrams = (diagrams, ParentRef) => {
          return diagrams.filter(item => item.properties.TypeId === 80000006).map(d => {
            let item = d.properties
            if (d.children) {
              item.children = transformDiagrams(d.children, d.properties)
            }
            if (ParentRef) {
              item.ParentRef = ParentRef
            }
            this.mapIdToDiagramData[item.Id] = item
            return item
          })
        }
        this.diagrams = transformDiagrams(data)
      }
      this.updateDiagrams()
    })
    // this.$nextTick(() => {
    //   this.initModelNameWidth()
    // })
    this.$bus.$on('noRefreshDiagram', this.handleNoRefreshDiagram)
    this.$bus.$on('updateDiagramData', this.updateDiagramData)
    // $('.resize-column-middle').on('mousemove', () => {
    //   clearTimeout(this.initWidthTimer)
    //   this.initWidthTimer = setTimeout(() => {
    //     this.initModelNameWidth()
    //   }, 400)
    // })
    this.$bus.$on('refreshERHeader', (modelData) => {
      this.currentModel = modelData
    })
    this.$bus.$on('highlight', (current, key) => {
      this.highLight(current, key)
    })
    let self = this
    window.addEventListener('pagehide', (event) => {
      let tenantId = localStorage.getItem('tenantId')
      if (tenantId) {
        navigator.sendBeacon(`${self.$url}/service/editor/${self.currentModel.id}/unlock?tenantId=${tenantId}`)
      } else {
        navigator.sendBeacon(`${self.$url}/service/editor/${self.currentModel.id}/unlock`)
      }
    }, { capture: true })
    window.addEventListener('unload', (event) => {
      let tenantId = localStorage.getItem('tenantId')
      if (tenantId) {
        navigator.sendBeacon(`${self.$url}/service/editor/${self.currentModel.id}/unlock?tenantId=${tenantId}`)
      } else {
        navigator.sendBeacon(`${self.$url}/service/editor/${self.currentModel.id}/unlock`)
      }
      this.$http.post(`${self.$url}/service/editor/${self.currentModel.id}/unlock`).then(res => {

      }).catch((err) => {
        this.$showFailure(err)
      })
    }, { capture: true })
    window.currentModel = this.currentModel
  },
  beforeDestroy () {
    document.removeEventListener('click', this.outEditSearch)
    this.$bus.$off('append-theme')
    this.$bus.$off('update-model')
    this.$bus.$off('updateDiagramData')
    this.$bus.$off('refreshERHeader')
    this.$bus.$off('noRefreshDiagram')
    this.$bus.$off('highlight')
  },
  data () {
    let currentPane = ''
    if (this.$route.query.typeId && String(this.$route.query.typeId) === '80000006') {
    } else if (this.$route.query.typeId) {
      currentPane = 'tables'
    } else if (this.$route.query.objectId) {
      currentPane = 'tables'
    } else if (this.$route.query.rId) {
      currentPane = 'report'
    } else {
      currentPane = 'detail'
    }
    return {
      diagramsLoading: true,
      longkey: true,
      showBusinessWrapper: false,
      showTableWrapper: false,
      showRelationWrapper: false,
      showCommentWrapper: false,
      showViewWrapper: false,
      showSchemaWrapper: false,
      showCurrentAdd: null,
      stopPop: false,
      currentTableId: null,
      currentRelationId: null,
      currentComentId: null,
      currentViewId: null,
      currentSchemaId: null,
      currentThemeId: null,
      currentBusinessId: null,
      entityTotal: 0,
      isRenderTopHeader: true,
      showTopTilte: true,
      isExpandAll: false,
      showModelSearch: true,
      sumElementNum: 0,
      loading: {
        status: false,
        text: '请求模型数据'
      },
      diagramPath: '',
      leftTreeKey: 0,
      searchPanelExist: true,
      data: {},
      dataByType: {
        table: {},
        diagram: {},
        view: {},
        comment: {},
        relation: {},
        model: {},
        udp: null,
        theme: {},
        schema: {},
        namingOption: {
          'TypeId': 80500101,
          'UniqueId': '04b6cde4-f6fa-4f81-bb54-433ea768d007',
          'UKDefaultMacro': 'idx_%owner%_%keyid%',
          'NUKDefaultMacro': 'idx_%owner%_%keyid%',
          'IndexNameCase': 'None',
          'IndexNameMaxLength': 128,
          'PKDefaultMacro': 'pk_%owner%_%keyid%',
          'NamingSeperator': '_',
          'TableNameCase': 'None',
          'TableNamePostfix': '',
          'TableNamePrefix': '',
          'TableNameMaxLength': 128,
          'ColumnNameCase': 'None',
          'ColumnNamePostfix': '',
          'ColumnNamePrefix': '',
          'ColumnNameMaxLength': 128,
          'IsUsingRealTimeTranslate': false,
          'FKDefaultMacro': 'fk_%owner%_%keyid%',
          'Id': -100,
          'RawType': 'NamingOption',
          'IsTableTranslateEnabled': false,
          'IsColumnTranslateEnabled': true,
          'IsIndexTranslateEnabled': true
        }
      },
      tables: {},
      diagrams: null,
      preDiagrams: null,
      diagramId: null,
      diagramName: null,
      currentPane: currentPane,
      themeBoxToTop: false,
      permissionReady: false,
      showThemeSearch: false,
      searchQuery: '',
      backImg: require('../../assets/images/icon/back.svg'),
      businessUsedImg: require('../../assets/images/mxgraphEdit/business-used.svg'),
      businessUnUsedImg: require('../../assets/images/mxgraphEdit/business-unused.svg'),
      tableUsedImg: require('../../assets/images/mxgraphEdit/table-used.svg'),
      tableUnUsedImg: require('../../assets/images/mxgraphEdit/table-unused.svg'),
      viewUsedImg: require('../../assets/images/mxgraphEdit/view-used.svg'),
      viewUnUsedImg: require('../../assets/images/mxgraphEdit/view-unused.svg'),
      commentUsedImg: require('../../assets/images/mxgraphEdit/comment-used.svg'),
      commentUnUsedImg: require('../../assets/images/mxgraphEdit/comment-unused.svg'),
      figureUsedImg: require('../../assets/images/mxgraphEdit/view-used.svg'),
      relationUsedImg: require('../../assets/images/mxgraphEdit/relation-used.svg'),
      relationUnUsedImg: require('../../assets/images/mxgraphEdit/relation-unused.svg'),
      schemaUsedImg: require('../../assets/images/mxgraphEdit/schema-used.svg'),
      themeUsedImg: require('../../assets/images/mxgraphEdit/theme-used.svg'),
      diagramImg1: require('../../assets/images/mxgraphEdit/diagram1.svg'),
      diagramImg2: require('../../assets/images/mxgraphEdit/diagram2.svg'),
      searchImg: require('../../assets/images/mxgraphEdit/new-icon/search.svg'),
      applyImg: require('../../assets/images/mxgraphEdit/new-icon/apply.svg'),
      hideTabs: false,
      modelPath: '',
      currentModel: {
        id: this.$route.query.id,
        modelType: this.$route.query.modelType
      },
      currentEditSchemaIndex: '',
      tableShowList: [],
      viewShowList: [],
      relationShowList: [],
      commentShowList: [],
      themeShowList: [],
      schemaShowList: [],
      diagramEmtpyNum: -8000000,
      diagramKey: 0,
      defaultExpandedKeys: [],
      mapIdToDiagramData: {},
      diagram: {},
      showUsed: false,
      preDiagramId: null,
      leftShowList: [],
      popoverVisible: false,
      userImg: require('@/assets/images/mxgraphEdit/User.svg'),
      isShowModelList: 'dataModel'

    }
  },
  computed: {
    isLogical () {
      return this.dataByType.model.TypeUniqueId === '025502f5-3820-4555-9d0f-bbb148840e9a' || this.dataByType.model.TypeUniqueId === '7865092e-58be-4096-b824-11bcba4aa10a' || this.dataByType.model.TypeUniqueId === '71f0d1c4-d45d-4eb7-bd1a-e45a0b018121' || this.dataByType.model.TypeUniqueId === '5c9598bc-6906-4edb-9ddb-a23428e224c2'
    },
    showViewButton () {
      return !this.isLogical && !this.isConceptual && !this.isCassandraOrMongoDB
    },
    isCassandraOrMongoDB () {
      return this.dataByType.model.TypeUniqueId === '8ea840a5-37f4-48f8-82d9-1429e42a0fc6' || this.dataByType.model.TypeUniqueId === '4ab7d425-7b4a-49c2-a19b-86dd5f911706'
    },
    showSchema () {
      return !this.isLogical && !this.isConceptual
    },
    isConceptual () {
      return this.dataByType.model.TypeUniqueId === '721ac3dc-dabe-4be2-ae47-cbd6b0a14d80' || this.dataByType.model.TypeUniqueId === 'f9c0cbd3-055c-4e33-8f41-5022062a8df0'
    }
  },
  beforeMount () {
  },
  methods: {
    changeLeftPane (val) {
      this.$store.state.changeLeftPaneValue = val;
      if(val === 'archy') {
        this.$refs.archyObjectRef.currentCategory = null
      }
    },
    toolTipDisabled (content) {
      const span = document.createElement('span')
      $(span).css('display', 'none')
      span.innerText = content
      $(document.body).append(span)
      const width = parseInt($(span).css('width'))
      const itemWidth = 155
      if (this.$isIEAll) {
        span.removeNode(true)
      } else {
        span.remove()
      }
      return itemWidth > width
    },
    handleNoRefreshDiagram () {
      this.noRefreshDiagram = true
    },
    getKeyLength (obj) {
      let count = 0
      for (let key in obj) {
        if (!obj[key].properties.deleted) {
          count++
        }
      }
      return count
    },
    callContext (data, node, evt, fromRight) {
      evt.stopPropagation()
      const x = evt.clientX
      const y = evt.clientY
      const options = this.dataOptionsFunction(data, node)
      if (options.length > 0) {
        let yOfResult = y
        let bottomMargin = 30 * options.length + 15
        if (window.innerHeight - y < bottomMargin) {
          yOfResult = window.innerHeight - bottomMargin
        }
        this.$bus.$emit('callContextMenu-dam', {
          x: x,
          y: yOfResult,
          options: options,
          placement: fromRight ? 'left' : 'right',
          customClassName: 'er-diagram'
        })
      }
    },
    isParent (currentDiagram, deleteDiagram) {
      if (!currentDiagram) {
        return true
      } else if (deleteDiagram?.Id === currentDiagram?.Id) {
        return true
      } else if (currentDiagram?.ParentRef) {
        return this.isParent(this.mapIdToDiagramData[currentDiagram.ParentRef.Id], deleteDiagram)
      } else {
        return false
      }
    },
    dataOptionsFunction (data) {
      const options = []
      options.push({
        icon: 'iconfont icon-bianji',
        label: '编辑',
        callback: () => {
          this.showDiagramEditDialog(data)
        },
        args: 'folder'
      })
      let disabledDelete = this.isParent(this.mapIdToDiagramData[this.diagramId], data)
      options.push({
        icon: `iconfont icon-delete ${disabledDelete ? 'disabled' : ''}`,
        label: '删除',
        callback: () => {
          if (!disabledDelete) {
            this.deleteDiagram(data)
          } else {
            this.$datablauMessage.error('无法删除当前主题域及其父主题域！')
          }
        },
        args: 'folder'
      })
      options.push({
        icon: 'iconfont icon-tianjia',
        label: '新增',
        callback: (args, evt) => {
          evt.stopPropagation()
          console.log(args, evt, 'add')
          this.addDiagram(data)
        },
        args: 'folder'
      })
      return options
    },
    highLight (current, key) {
      // this.cancelHightlight()
      this.currentTableId = null
      this.currentRelationId = null
      this.currentComentId = null
      this.currentViewId = null
      this.currentSchemaId = null
      this.currentThemeId = null
      this.currentBusinessId = null
      this[current] = key
      switch (current) {
        case 'currentBusinessId':
          this.showCurrentAdd = 'business'
          break
        case 'currentTableId':
          this.showCurrentAdd = 'table'
          break
        case 'currentComentId':
          this.showCurrentAdd = 'comment'
          break
        case 'currentViewId':
          this.showCurrentAdd = 'view'
          break
        case 'currentSchemaId':
          this.showCurrentAdd = 'schema'
          break
        case 'currentThemeId':
          this.showCurrentAdd = 'theme'
          break
      }
    },
    handleListHl (current, force = false) {
      this.$nextTick(() => {
        let node = document.querySelector('.el-collapse-item__header.active')
        if (node) {
          node.classList.remove('active')
        }
        if (this.leftShowList.indexOf(current) < 0 || force) {
          setTimeout(() => {
            this.$refs[current].parentNode.classList.add('active')
          }, 200)
        }
        if (force) {
          this.currentTableId = null
          this.currentRelationId = null
          this.currentComentId = null
          this.currentViewId = null
          this.currentSchemaId = null
          this.currentThemeId = null
        }
      })
    },
    cancelHightlight () {
      this.$nextTick(() => {
        let node = document.querySelector('.el-collapse-item__header.active')
        if (node) {
          node.classList.remove('active')
        }
      })
    },
    handleTopHeaderChange (bool) {
      this.isRenderTopHeader = bool
    },
    handleTopTileChange (bool) {
      this.showTopTilte = bool
    },
    toggleExpand () {
      if (!this.leftShowList.length) {
        this.isExpandAll = true
        this.leftShowList = [ 'business', 'table', 'relation', 'comment', 'view', 'schema', 'theme' ]
      } else {
        this.isExpandAll = false
        this.leftShowList = []
      }
    },
    showSearch () {
      this.showModelSearch = true
    },
    colseSearch () {
      this.showModelSearch = false
    },
    exit () {
      this.$refs.modelGraphReference.exit()
    },
    handleModelLoading (bool) {
      this.loading.status = bool
    },
    // initModelNameWidth () {
    //   $('.model-header').width($('.tree-area').width() + 20)
    //   $('.model-name > span').css('max-width', ($('.tree-area').width() - 40) + 'px')
    // },
    getModelDetailInfo () {
      this.$route.query.id && this.$http.get(this.$url + '/service/models/' + this.$route.query.id + '?withPath=true'
      ).then(res => {
        this.currentModel.Name = res.data.name
        let resStr = res.data.path.match(/(\\.*)\?/)[1]
        let arr = resStr.split('\\')
        this.currentModel.pathName = arr[arr.length - 1]
        this.currentModel.branch = res.data.branch
        // this.currentModel.Definition = res.data.description
        this.currentModel.Definition = this.dataByType.model.Definition
        this.currentModel.currentVersion = res.data.currentVersion
        this.currentModel.useProto = res.data.useProto
        this.$set(this.currentModel, 'seed', res.data.seed)
        if (res.data.limitedDsApply) {
          this.$set(this.currentModel, 'limitedDsApply', res.data.limitedDsApply)
          this.$set(this.currentModel, 'limitedDsApplyConfig', JSON.parse(res.data.limitedDsApplyConfig))
        }
        this.$router.replace({
          query: {
            id: this.$route.query.id,
            modelType: this.$route.query.modelType,
            currentVersion: res.data.currentVersion
          }
        })
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    editModelInfo () {
      this.$refs.modelGraphReference.editModel()
    },
    deleteTheme (theme) {
      if (!$('#consa-graph').length) {
        return
      }
      this.$DatablauCofirm('确定删除该主题？', '提示', {
        type: 'warning'
      }).then(() => {
        this.$bus.$emit('themeDeleted', theme)
        this.$set(theme.properties, 'deleted', true)
      }).catch(() => {
        this.$set(theme.properties, 'deleted', false)
      }).finally(() => {
        this.searchAll()
      })
    },
    showThemeEditDialog (theme) {
      theme.showMenu = false
      this.$bus.$emit('themeData', theme)
    },
    applyThemeToGraph (theme) {
      theme.showMenu = false
      this.$bus.$emit('applyThemeToGraph', theme)
    },
    createDiagram () {
      this.$bus.$emit('createDiagram')
    },
    createRelation () {
      if ($('#consa-graph').length === 0) {
        this.$message.warning('请选择任意主题后点击')
        return
      }
      this.$bus.$emit('createRelationLayer')
    },
    createComment () {
      if ($('#consa-graph').length === 0) {
        this.$message.warning('请选择任意主题后点击')
        return
      }
      if (!this.leftShowList.includes('comment')) {
        this.leftShowList.push('comment')
      }
      this.$bus.$emit('createComment')
      this.handleListHl('comment', true)
    },
    createView () {
      if ($('#consa-graph').length === 0) {
        this.$message.warning('请选择任意主题后点击')
        return
      }
      if (!this.leftShowList.includes('view')) {
        this.leftShowList.push('view')
      }
      this.$bus.$emit('createView')
      this.handleListHl('view', true)
    },
    createTable () {
      if ($('#consa-graph').length === 0) {
        this.$message.warning('请选择任意主题后点击')
        return
      }
      if (!this.leftShowList.includes('table')) {
        this.leftShowList.push('table')
      }
      this.$bus.$emit('createTable')
      this.handleListHl('table', true)
    },
    createBusiness () {
      if ($('#consa-graph').length === 0) {
        this.$message.warning('请选择任意主题后点击')
        return
      }
      if (!this.leftShowList.includes('business')) {
        this.leftShowList.push('business')
      }
      this.$bus.$emit('createBusiness')
      this.handleListHl('business', true)
    },
    editItem (item, index) {
      this.$refs.tablePopover && this.$refs.tablePopover[index]?.doClose()
      this.$refs.businessPopover && this.$refs.businessPopover[index]?.doClose()
      this.$refs.relationPopover && this.$refs.relationPopover[index]?.doClose()
      this.$refs.viewPopover && this.$refs.viewPopover[index]?.doClose()
      this.$refs.commentPopover && this.$refs.commentPopover[index]?.doClose()
      if ($('#consa-graph').length === 0) {
        this.$message.warning('请选择任意主题后点击')
        return
      }
      this.$bus.$emit('editItem', item)
    },
    deleteItem (item, index) {
      this.$refs.tablePopover && this.$refs.tablePopover[index]?.doClose()
      this.$refs.businessPopover && this.$refs.businessPopover[index]?.doClose()
      this.$refs.relationPopover && this.$refs.relationPopover[index]?.doClose()
      this.$refs.viewPopover && this.$refs.viewPopover[index]?.doClose()
      this.$refs.commentPopover && this.$refs.commentPopover[index]?.doClose()
      if ($('#consa-graph').length === 0) {
        this.$message.warning('请选择任意主题后点击')
        return
      }
      this.$bus.$emit('deleteItem', item)
    },
    hideBefore (i) {
      if (this.beforeIndex !== undefined) {
        let index = this.beforeIndex
        this.$refs.tablePopover && this.$refs.tablePopover[index]?.doClose()
        this.$refs.businessPopover && this.$refs.businessPopover[index]?.doClose()
        this.$refs.relationPopover && this.$refs.relationPopover[index]?.doClose()
        this.$refs.viewPopover && this.$refs.viewPopover[index]?.doClose()
        this.$refs.commentPopover && this.$refs.commentPopover[index]?.doClose()
      }
      this.beforeIndex = i
    },
    createTheme () {
      if ($('#consa-graph').length === 0) {
        this.$message.warning('请选择任意主题后点击')
        return
      }
      if (!this.leftShowList.includes('theme')) {
        this.leftShowList.push('theme')
      }
      this.$bus.$emit('createTheme')
      this.handleListHl('theme', true)
    },
    createSchema () {
      if (!this.leftShowList.includes('schema')) {
        this.leftShowList.push('schema')
      }
      this.$bus.$emit('createSchema')
      this.handleListHl('schema', true)
    },
    handleSchemaEdit (key, index) {
      this.currentEditSchemaIndex = key
      this.preSchema = _.cloneDeep(this.dataByType.schema[key])
      this.showSchemaWrapper = false
      this.$nextTick(() => {
        this.$refs[`schema${key}`][0].focus()
      })
      this.$refs.schemaPopover[index].doClose()
    },
    handleSchemaChange (schema) {
      schema.properties.Name = schema.properties.Name.trim()
      if (schema.properties.Name !== this.preSchema.properties.Name) {
        this.$bus.$emit('schemaChange', schema, this.preSchema)
      }
    },
    deleteCurrentSchema (schema, index) {
      this.$refs.schemaPopover[index].doClose()
      this.showSchemaWrapper = false
      this.$DatablauCofirm(`确定删除${schema.properties.Name}？`, '提示', {
        type: 'warning'
      }).then(() => {
        this.$bus.$emit('schemaDeleted', schema)
        this.$set(schema.properties, 'deleted', true)
      }).catch(() => {
      }).finally(() => {
        this.searchAll()
      })
    },
    changePane (pane) {
      if (this.currentPane === 'diagram') {

      }
      this.$DatablauCofirm('确认离开，ER图编辑的数据不会保存？', '提示', {
        type: 'warning',
        cancelButtonText: '取消',
        confirmButtonText: '确定'
      }).then(() => {
        this.currentPane = pane
      }).catch(e => { console.log(e) })
    },
    businessClick (id, type) {
      this.showCurrentAdd = type
      this.highLight('currentBusinessId', id)
      if ($('#consa-graph').length === 0) {
        this.$message.warning('请选择任意主题后点击')
      }
    },
    tableClick (id, type) {
      this.showCurrentAdd = type
      this.highLight('currentTableId', id)
      if ($('#consa-graph').length === 0) {
        this.currentPane = 'diagram'
        this.$nextTick(() => {
          this.$refs['modelGraphReference'].handleDialogData(id)
        })
      }
    },
    relationClick (id) {
      this.highLight('currentRelationId', id)
      if ($('#consa-graph').length === 0) {
        this.$message.warning('请选择任意主题后点击')
      }
    },
    themeClick (id) {
      this.highLight('currentThemeId', id)
      if ($('#consa-graph').length === 0) {
        this.$message.warning('请选择任意主题后点击')
      }
    },
    showSearchPanel (e) {
      this.showThemeSearch = true
      this.$nextTick(() => {
        $('#searchId').blur().focus()
      })
    },
    outEditSearch (e) {
      this.showThemeSearch = false
    },
    hideTabsChange (val) {
      this.hideTabs = val
    },
    searchAll (showLeft) {
      if (showLeft) {
        this.leftShowList = ['business', 'table', 'relation', 'comment', 'view', 'schema', 'theme']
      }
      if (this.searchQuery !== '' || this.searchQuery) {
        ['table', 'relation', 'view', 'schema', 'theme'].forEach(name => {
          this[name + 'ShowList'] = []
          Object.values(this.dataByType[name]).forEach(item => {
            if (!item.properties.deleted && (item.properties.Name.toLowerCase().indexOf(this.searchQuery.toLowerCase()) !== -1 || (item.properties.LogicalName && item.properties.LogicalName.toLowerCase().indexOf(this.searchQuery.toLowerCase()) !== -1)) && (name === 'schema' || name === 'theme' || !this.showUsed || (this.showUsed && item.properties.used))) {
              this.$set(item.properties, 'hide', false)
              this[name + 'ShowList'].push(item)
            } else {
              this.$set(item.properties, 'hide', true)
            }
          })
        });
        ['comment'].forEach(name => {
          this[name + 'ShowList'] = []
          Object.values(this.dataByType[name]).forEach(item => {
            if (!item.properties.deleted && (item.properties.Text.toLowerCase().indexOf(this.searchQuery.toLowerCase()) !== -1) && (name === 'schema' || name === 'theme' || !this.showUsed || (this.showUsed && item.properties.used))) {
              this.$set(item.properties, 'hide', false)
              this[name + 'ShowList'].push(item)
            } else {
              this.$set(item.properties, 'hide', true)
            }
          })
        })
      } else {
        ['table', 'relation', 'comment', 'view', 'schema', 'theme'].forEach(name => {
          this[name + 'ShowList'] = []
          Object.values(this.dataByType[name]).forEach(item => {
            if (!item.properties.deleted && (name === 'schema' || name === 'theme' || !this.showUsed || (this.showUsed && item.properties.used))) {
              this.$set(item.properties, 'hide', false)
              this[name + 'ShowList'].push(item)
            } else {
              this.$set(item.properties, 'hide', true)
            }
          })
        })
      }
      this.leftTreeKey++
    },
    filterNode (value, data) {
      if (!value) return true
      return data.Name.toLowerCase().indexOf(value.toLowerCase()) !== -1
    },
    getPermission () {
      HTTP.getModelPermission({
        modelId: this.currentModel.id,
        successCallback: data => {
          this.currentModel.permission = data
          this.permissionReady = true
        }
      })
    },
    // initHorizontalResize () {
    //   setTimeout(() => {
    //     let r = new ResizeHorizontal($(this.$el).find('.tree-area'), $(this.$el).find('.content-box'), $(this.$el).find('.resize-column-middle'), $(this.$el), 0, () => {
    //       if ($('.detail-wrapper.el-tabs').length > 0 && !$('.detail-wrapper.el-tabs').hasClass('hideTab')) {
    //         $('.model-header').width($(this.$el).find('.tree-area').width())
    //       }
    //     })
    //   }, 1000)
    // },
    getPinyinCapital (text) {
      for (let i = 0; i < 26; i++) {
        let char = String.fromCharCode(65 + i)
        let has = PinyinMatch.match(text[0], char)
        if (has) {
          return char
        }
      }
    },
    goBack () {
      this.$bus.$emit('refreshLibrary')
      this.$router.push({
        query: null
      })
    },
    renderContent (h, { node, data, store }) {
      return (
        <span style="flex: 1; display: flex-inline-block;align-items: center;padding-left:0px" class="list-item-wrapper">
          <img src={this.diagramImg2} />
          <span class='node-name'>{data.Name}</span>
          <span class="operate-list">
            <span class="el-icon-more" onClick={evt => this.callContext(data, node, evt, true)}></span>
            {/* <el-popover
              placement="right"
              popper-class="mod-pop"
              width="130"
              visible-arrow={false}
              v-model={data.showPop}
              trigger="click">
              <span slot="reference" class="el-icon-more" ></span>
              <div title="编辑" class="modeEdit-more-itme-box el-icon-edit" onClick={(e) => { e.stopPropagation(); this.showDiagramEditDialog(data) }}>{'编辑'}</div>
              { this.diagramId !== data.Id ? <div title="删除" class="modeEdit-more-itme-box el-icon-delete" onClick={(e) => { e.stopPropagation(); this.deleteDiagram(data) }}>{'删除'}</div> : <i></i> }
              <div title="新增" class="modeEdit-more-itme-box el-icon-plus" onClick={(e) => { e.stopPropagation(); this.addDiagram(data) }}>{'新增'}</div>
            </el-popover> */}
          </span>
        </span>)
    },
    addDiagram (diagram) {
      this.diagramEmtpyNum = this.$refs.modelGraphReference.deliverNum.seed++
      let children = null
      let index = -1
      let item = null
      if (diagram) {
        if (!diagram.children) {
          this.$set(diagram, 'children', [])
        }
        item = {
          ...this.$refs.modelGraphReference.diagramUdpsDefault,
          Id: this.diagramEmtpyNum,
          Name: 'Diagram_' + this.diagramEmtpyNum,
          IsOpen: diagram.IsOpen,
          IsUdpShowOnDiagram: diagram.IsUdpShowOnDiagram,
          RawType: 'Diagram',
          ShowLabel: diagram.ShowLabel,
          TypeId: 80000006,
          ParentRef: diagram,
          StyleThemeRef: null,
          new: true
        }
        diagram.children.push(item)
        sort.sortConsiderChineseNumber(diagram.children, 'Name') // this.diagrams最外层通过datablau-tree排序了，内部的children需要自己排序
        const tree = this.$refs.themeTree
        const parentNode = tree.getNode(diagram.Id)
        parentNode.expanded = true
        children = diagram.children
        index = diagram.children.length - 1
        this.mapIdToDiagramData[item.Id] = item
        // this.clearDiagrams = true
        // this.$bus.$emit('append-theme', {
        //   current: item,
        //   parent: diagram.Id,
        //   changePreDiagram: false
        // })
      } else {
        item = {
          ...this.$refs.modelGraphReference.diagramUdpsDefault,
          Id: this.diagramEmtpyNum,
          Name: 'Diagram_' + this.diagramEmtpyNum,
          IsOpen: true,
          RawType: 'Diagram',
          TypeId: 80000006,
          ParentRef: null,
          StyleThemeRef: null,
          new: true
        }
        this.diagrams.push(item)
        sort.sortConsiderChineseNumber(this.diagrams, 'Name') // this.diagrams最外层通过datablau-tree排序了，内部的children需要自己排序
        children = this.diagrams
        index = this.diagrams.length - 1
        this.mapIdToDiagramData[item.Id] = item
        // if (!this.defaultExpandedKeys.includes(this.diagramEmtpyNum)) {
        //   this.defaultExpandedKeys.push(this.diagramEmtpyNum)
        // }
      }

      let changes = new (this.$refs.modelGraphReference.LayerEdit)([new (this.$refs.modelGraphReference.Changes)('insertDiagram', {
        children,
        index,
        item,
        name: 'Diagram_' + (this.diagramEmtpyNum + 8000001)
      })])
      this.$refs.modelGraphReference.graph.editor.undoManager.undoableEditHappened(changes)
      this.diagramEmtpyNum++
      // this.diagramKey++
      this.$bus.$emit('closeContextMenu')
    },
    showDiagramEditDialog (diagram) {
      this.$bus.$emit('editDiagram', diagram)
      this.$bus.$emit('closeContextMenu')
    },
    deleteDiagram (diagram) {
      let children = null
      let item = null
      let index = -1
      if (diagram.ParentRef) {
        children = this.mapIdToDiagramData[diagram.ParentRef.Id].children
        index = children.findIndex(item => item.Id === diagram.Id)
        if (index !== -1) {
          item = children[index]
          children.splice(index, 1)
        }
      } else {
        children = this.diagrams
        index = this.diagrams.findIndex(item => item.Id === diagram.Id)
        if (index !== -1) {
          item = this.diagrams[index]
          this.diagrams.splice(index, 1)
        }
      }
      let changes = new (this.$refs.modelGraphReference.LayerEdit)([new (this.$refs.modelGraphReference.Changes)('deleteDiagram', {
        children,
        index,
        item,
        name: item.Name
      })])
      this.$refs.modelGraphReference.graph.editor.undoManager.undoableEditHappened(changes)
      this.diagramKey++
      this.$bus.$emit('closeContextMenu')
    },
    transformData (data) {
      if (data instanceof Array) {
        return data.map(item => this.transformData(item))
      } else if (data instanceof Object) {
        let obj = {}
        for (let key of Object.keys(data)) {
          if (key === 'objectClass' && (data[key] === 'Datablau.LDM.EntityKeyGroup' || data[key] === 'Datablau.LDM.Partition' || data[key] === 'Datablau.LDM.EntityDWMapping') && data.children) { // 因为索引和分区的children是全量替换，备份索引方便后续生成增改删
            obj.childrenBefore = _.cloneDeep(data.children)
          }
          if (key === 'objectClass' && (data[key] === 'Datablau.LDM.EntityComposite' || data[key] === 'Datablau.LDM.EntityView')) { // 对比table的properties
            obj.propertiesBefore = _.cloneDeep(data.properties)
            if (obj.propertiesBefore[80100007]) {
              obj.propertiesBefore[80100007] = obj.propertiesBefore[80100007].join(',')
            }
          }
          if (!isNaN(Number(key)) && LDMTypes[key]) {
            obj[LDMTypes[key]] = this.transformData(data[key])
          } else {
            obj[key] = this.transformData(data[key])
          }
        }
        return obj
      } else {
        return data
      }
    },
    updateDiagrams (onRefreshEntity) {
      this.loading.status = true
      this.loading.text = '请求模型数据'
      HTTP.getDiagrams({
        modelId: this.currentModel.id,
        longkey: this.longkey,
        successCallback: (data) => {
          if (this.longkey) {
            data = this.transformData(data)
          }
          if (data.children.length > 10000) {
            this.searchPanelExist = false
          }
          ['table', 'diagram', 'view', 'comment', 'relation', 'model', 'udp', 'theme', 'schema'].forEach(key => {
            Object.keys(this.dataByType[key]).forEach(k => {
              delete this.dataByType[key][k]
            })
          })
          // this.dataByType = {
          //   table: {},
          //   diagram: {},
          //   view: {},
          //   comment: {},
          //   relation: {},
          //   model: {},
          //   udp: null,
          //   theme: {},
          //   schema: {}
          // }
          if (!onRefreshEntity) {
            this.data = data.children
            _.merge(this.currentModel, data.properties)
            this.currentModel.Definition = data.properties.Definition
            this.prepareUdpData(data.udp)
            this.dataByType.model = data.properties
            this.prepareTreeData(false)
            this.$refs.modelGraphReference?.getDiagramDetail()
            this.searchAll()
          } else {
            this.data = data.children
            const self = this
            this.data.forEach((item, index) => {
              //  TODO it's could work for lazy load.
              if (item.properties.TypeId === 80000004 || item.properties.TypeId === 80100073) {
                self.dataByType.table[item.properties.Id] = item
              } else if (item.properties.TypeId === 80000006) {
                self.dataByType.diagram[item.properties.Id] = item
                item.properties.ParentRef = null // 根主题
                if (!item.properties.Definition) {
                  item.properties.Definition = null
                }
              } else if (item.properties.TypeId === 80500008) {
                self.dataByType.view[item.properties.Id] = item
              } else if (item.properties.TypeId === 80000027) {
                self.dataByType.comment[item.properties.Id] = item
              } else if (item.properties.TypeId === 80000007) {
                self.dataByType.relation[item.properties.Id] = item
              } else if (item.properties.TypeId === 80010214) { // 样式主题
                self.dataByType.theme[item.properties.Id] = item
              } else if (item.properties.TypeId === 80700001) {
                self.dataByType.schema[item.properties.Id] = item
              } else if (item.properties.TypeId === 80500101) { // 命名设置
                Object.assign(self.dataByType.namingOption, item.properties)
              }
              if (index === this.data.length - 1) {
                this.sumElementNum = item.properties.Id
              }
            })
          }
          this.getModelDetailInfo()
          this.$bus.$emit('updateTableToList')
          // if (Object.keys(this.dataByType.table).length > 200) {
          //   this.$message.warning('模型较大，建议在客户端编辑，不然可能出现页面无响应！')
          // }
        }
      })
    },
    getDiagrams () {
      this.$bus.$on('append-theme', ({ current, parent, changePreDiagram }) => {
        setTimeout(() => { // 在多层主题域，上层数据更新了，tree.getNode(parent)在setTimeout里能拿到最新的数据
          const tree = this.$refs.themeTree
          const parentNode = tree.getNode(parent)
          if (parentNode && this.clearDiagrams) {
            // tree.append(current, parent) // append方法有bug，sort后不能自动更新,所以弃用
            if (parentNode.data.children) {
              parentNode.data.children.push(current)
            } else {
              this.$set(parentNode.data, 'children', [current])
            }
            sort.sortConsiderChineseNumber(parentNode.data.children, 'Name') // this.diagrams最外层通过datablau-tree排序了，内部的children需要自己排序
            this.$nextTick(() => {
              let currentNode = tree.getNode(current.Id)
              this.mapIdToDiagramData[current.Id] = currentNode.data
              if (changePreDiagram) {
                clearTimeout(this.timer)
                this.timer = setTimeout(() => {
                  this.preDiagrams = _.cloneDeep(this.diagrams)
                }, 800)
              }
              parentNode.expanded = true
            })
          }
        })
      })
      this.loading.status = true
      this.loading.text = '请求模型数据'
      HTTP.getDiagrams({
        modelId: this.currentModel.id,
        longkey: this.longkey,
        successCallback: (data) => {
          if (this.longkey) {
            data = this.transformData(data)
          }
          if (data.children.length > 10000) {
            this.searchPanelExist = false
          }
          this.data = data.children
          _.merge(this.currentModel, data.properties)
          this.getModelDetailInfo()
          this.currentModel.Definition = data.properties.Definition
          this.prepareUdpData(data.udp)
          this.dataByType.model = data.properties
          this.prepareTreeData(true)
          this.searchAll()
          setTimeout(() => {
            if (this.diagrams.length) {
              if (this.diagrams.some(diagram => diagram.IsOpen)) {
                for (let diagram of this.diagrams) {
                  if (diagram.IsOpen) {
                    // todo:按主题id跳转时，需要高亮
                    //  this.currentPane = 'diagram' + item.Name
                    this.handleDiagramClick(diagram)
                    this.$refs.themeTree.setCurrentKey(diagram.Id)
                    break
                  }
                }
              } else {
                this.handleDiagramClick(this.diagrams[0])
                this.$refs.themeTree.setCurrentKey(this.diagrams[0].Id)
              }
            } else {
              setTimeout(() => {
                let uuid = uuidv4()
                this.currentPane = 'diagram'
                this.diagrams = [{
                  ParentRef: null,
                  Definition: null,
                  Id: this.currentModel.seed + 1,
                  IsOpen: true,
                  Name: 'Main',
                  RawType: 'Diagram',
                  TypeId: 80000006,
                  UniqueId: uuid,
                  new: true
                }]
                this.diagram = {
                  children: [],
                  objectClass: 'Datablau.ERD.Diagram',
                  properties: {
                    ParentRef: null,
                    Definition: null,
                    Id: this.currentModel.seed + 1,
                    IsOpen: true,
                    Name: 'Main',
                    RawType: 'Diagram',
                    TypeId: 80000006,
                    UniqueId: uuid,
                    new: true,
                    noexist: true
                  }
                }
                this.diagramId = this.currentModel.seed + 1
                this.currentModel.seed++
                this.loading.status = false
              }, 400)
            }
          })
          // if (Object.keys(this.dataByType.table).length > 200) {
          //   this.$message.warning('模型较大，建议在客户端编辑，不然可能出现页面无响应！')
          // }
          // this.loading.status = false
        }
      })
    },
    prepareUdpData (rawData) {
      this.dataByType.udpOrigin = rawData
      if (rawData && Array.isArray(rawData.children)) {
        let udpMap = new Map()
        rawData.children.forEach(item => {
          if (item.hasOwnProperty('properties') && item.properties.hasOwnProperty('Id') && (item.properties.TypeId === 90002032 || item.properties.TypeId === 90002048)) {
            udpMap.set(item.properties['Id'], item.properties)
          }
        })
        let udp = new Map()
        udpMap.forEach(item => {
          if (item.OwnerRef) {
            let udpId = udpMap.get(item.OwneeRef)?.Id
            if (udpId) {
              udpMap.get(udpId).entityType = item.OwnerRef
              udpMap.get(udpId).pStructId = item.Id
              udp.set(udpId, udpMap.get(udpId))
            }
          }
        })
        this.dataByType.udp = udp
      } else {
        this.dataByType.udp = new Map()
      }
    },
    prepareTreeData (clearDiagrams = true) {
      this.clearDiagrams = clearDiagrams
      const self = this
      this.diagramsLoading = false
      if (clearDiagrams) {
        this.diagrams = []
        this.mapIdToDiagramData = {}
      }
      this.data.forEach((item, index) => {
        //  TODO it's could work for lazy load.
        if (item.properties.TypeId === 80000004 || item.properties.TypeId === 80100073) {
          self.dataByType.table[item.properties.Id] = item
        } else if (item.properties.TypeId === 80000006) {
          self.dataByType.diagram[item.properties.Id] = item
          item.properties.ParentRef = null // 根主题
          if (!item.properties.Definition) {
            item.properties.Definition = null
          }
          // this.defaultExpandedKeys.push(item.properties.Id)
          let properties = item.properties
          if (clearDiagrams) {
            this.mapIdToDiagramData[item.properties.Id] = properties
            this.diagrams.push(properties)
          }
          let tables = []
          let children = item.children
          if (children && children.length > 0) {
            for (let i = 0, len = children.length; i < len; i++) {
              if (children[i] && children[i].properties && children[i].properties.TypeId === 80000008) {
                tables.push(children[i])
              }
            }
          }
          if (tables.length > this.largestDiagramCount) {
            this.largestDiagramCount = tables.length
            this.largestDiagramId = item.properties.Id
          }
        } else if (item.properties.TypeId === 80500008) {
          self.dataByType.view[item.properties.Id] = item
        } else if (item.properties.TypeId === 80000027) {
          self.dataByType.comment[item.properties.Id] = item
        } else if (item.properties.TypeId === 80000007) {
          self.dataByType.relation[item.properties.Id] = item
        } else if (item.properties.TypeId === 80010214) { // 样式主题
          self.dataByType.theme[item.properties.Id] = item
        } else if (item.properties.TypeId === 80700001) {
          self.dataByType.schema[item.properties.Id] = item
        } else if (item.properties.TypeId === 80500101) { // 命名设置
          Object.assign(self.dataByType.namingOption, item.properties)
          self.dataByType.namingOption.IsUsingRealTimeTranslate = false // web端不采用自动翻译
        }
        if (index === this.data.length - 1) {
          this.sumElementNum = item.properties.Id
        }
      })
      Object.values(this.dataByType.relation).forEach(relation => {
        if ((relation.objectClass === 'Datablau.LDM.RelationshipRelational' && relation.properties.RelationalType === 'Identifying') || (relation.objectClass === 'Datablau.LDM.RelationshipSubtype' && relation.properties.RelationalType === 'Identifying')) { // 主键关系和subtype关系的子表需要变为依赖实体
          if (this.dataByType.table[relation.properties.ChildEntityRef]) {
            this.dataByType.table[relation.properties.ChildEntityRef].properties.relied = true
          }
        }
      })
      this.preDiagrams = _.cloneDeep(this.diagrams)
      this.currentModel.diagramCount = this.diagrams.length
      // sort.sortConsiderChineseNumber(this.diagrams, 'Name')
    },
    handleDiagramClick (diagram, node, el, event) {
      if (this.stopPop) {
        this.stopPop = false
        return
      }
      if (diagram.Id !== this.preNodeId) {
        if (diagram.new) {
          this.$DatablauCofirm(`新创建的主题需要先保存才能切换？`, '', {
            type: 'warning',
            confirmButtonText: '保存'
          }).then(() => {
            if (node && this.preNodeId) {
              this.$refs.themeTree.setCurrentKey(this.preNodeId)
              node.isCurrent = false
            }
            this.$refs.modelGraphReference.saveLayer()
          }).catch(() => {
            if (node) {
              this.$refs.themeTree.setCurrentKey(this.preNodeId)
              node.isCurrent = false
            }
          })
        } else if (this.$refs.modelGraphReference && this.$refs.modelGraphReference.historyList.length) {
          this.$DatablauCofirm(`还有${this.$refs.modelGraphReference.historyList.length}条操作未保存，确认切换主题吗？`, '', {
            type: 'warning'
          }).then(() => {
            window.move = false
            this.diagramId = diagram.Id
            this.diagramName = diagram.Name
            this.currentPane = 'diagram'
            this.searchQuery = ''
            this.leftShowList = []
            this.showUsed = false
            this.clearEntitySelectState()
            this.$nextTick(() => {
              if ($('.detail-wrapper.el-tabs').length > 0 && !$('.detail-wrapper.el-tabs').hasClass('hideTab')) {
                $('.model-header').width($(this.$el).find('.tree-area').width())
              }
            })
            this.updateDiagrams(true)
            this.preNodeId = diagram.Id
          }).catch(() => {
            if (node) {
              this.$refs.themeTree.setCurrentKey(this.preNodeId)
              node.isCurrent = false
            }
          })
        } else {
          window.move = false
          this.diagramId = diagram.Id
          this.diagramName = diagram.Name
          this.currentPane = 'diagram'
          this.searchQuery = ''
          this.leftShowList = []
          this.showUsed = false
          this.clearEntitySelectState()
          this.$nextTick(() => {
            if ($('.detail-wrapper.el-tabs').length > 0 && !$('.detail-wrapper.el-tabs').hasClass('hideTab')) {
              $('.model-header').width($(this.$el).find('.tree-area').width())
            }
          })
          this.preNodeId = diagram.Id
        }
      }
    },
    clearEntitySelectState () {
      ['table', 'view', 'relation', 'comment'].forEach(key => {
        Object.values(this.dataByType[key]).forEach(item => {
          this.$set(item.properties, 'used', false)
        })
      })
    },
    handleCollapseChange (c) {
      this.themeBoxToTop = !this.themeBoxToTop
      // this.currentTableId = null
      // this.currentRelationId = null
      // this.currentComentId = null
      // this.currentViewId = null
      // this.currentSchemaId = null
      // this.currentThemeId = null
    },
    itemChange () {
      if ($('.detail-wrapper.el-tabs').length === 0 || $('.detail-wrapper.el-tabs').hasClass('hideTab')) {
        $('.model-header').width('auto')
      }
    },
    checkSchema (obj, key) {
      if (obj.Name !== '') {
        this.currentEditSchemaIndex = ''
      } else {
        this.$DatablauCofirm('schema不能为空', '提示', {
          type: 'warning',
          closeOnClickModal: false
        })
          .then(() => {
            this.$refs[`schema${key}`][0].focus()
          })
          .catch(() => {
            this.$refs[`schema${key}`][0].focus()
          })
      }
    },
    updateDiagramData () {
      this.$nextTick(() => {
        document.querySelectorAll('.grey-tree.model-edit .el-tree-node.is-current').forEach(ele => {
          let parents = $(ele).parents('.el-tree-node')
          let path = $(ele).find('.el-tree-node__content .node-name')[0] && $(ele).find('.el-tree-node__content .node-name')[0].innerText
          parents.each(i => {
            path = $(parents[i]).find('.el-tree-node__content .node-name')[0].innerText + '/' + path
          })
          this.diagramPath = path
        })
      })
    }
  },
  watch: {
    // leftShowList: {
    //   handler (val) {
    //     console.log(val, 22)
    //     this.$nextTick(() => {
    //       val.forEach(v => {
    //         let pNode = this.$refs[v] && this.$refs[v].parentNode
    //         if (pNode) {
    //           pNode.classList.add('active')
    //         }
    //       })
    //     })
    //   }
    // },
    // themeBoxToTop () {
    // },
    diagramsLoading (val) {
      if (!val) {
        this.$bus.$emit('updateTableToList')
      }
    },
    searchQuery: {
      handler (val) {
        // this.$refs.themeTree.filter(val)
      },
      deep: true
    },
    currentPane (name) {
      if (name !== 'diagram') { // 如果点击基本信息下的栏目
        this.$refs.themeTree.setCurrentKey(null)
      }
    },
    'diagram': {
      handler (val) {
        if (this.noRefreshDiagram) {
          this.noRefreshDiagram = false
          return
        }
        clearTimeout(this.diagramTimer)
        this.diagramTimer = setTimeout(() => {
          this.clearEntitySelectState()
          this.diagram && this.diagram.children && this.diagram.children.filter(shape => !shape.properties.deleted).forEach(shape => {
            if (shape.objectClass === 'Datablau.ERD.ShapeEntity' || shape.objectClass === 'Datablau.ERD.ShapeBusinessObject') {
              if (this.dataByType.table[shape.properties.OwneeRef]) {
                if (shape.properties.deleted) {
                  this.$set(this.dataByType.table[shape.properties.OwneeRef].properties, 'used', false)
                } else {
                  this.$set(this.dataByType.table[shape.properties.OwneeRef].properties, 'used', true)
                }
              }
            } else if (shape.objectClass === 'Datablau.ERD.ShapeView') {
              if (this.dataByType.view[shape.properties.OwneeRef]) {
                if (shape.properties.deleted) {
                  this.$set(this.dataByType.view[shape.properties.OwneeRef].properties, 'used', false)
                } else {
                  this.$set(this.dataByType.view[shape.properties.OwneeRef].properties, 'used', true)
                }
              }
            } else if (shape.objectClass === 'Datablau.ERD.ShapeComment') {
              if (this.dataByType.comment[shape.properties.OwneeRef]) {
                if (shape.properties.deleted) {
                  this.$set(this.dataByType.comment[shape.properties.OwneeRef].properties, 'used', false)
                } else {
                  this.$set(this.dataByType.comment[shape.properties.OwneeRef].properties, 'used', true)
                }
              }
            } else if (shape.objectClass.indexOf('Datablau.ERD.Connection') !== -1) {
              if (this.dataByType.relation[shape.properties.OwneeRef]) {
                if (shape.properties.deleted) {
                  this.$set(this.dataByType.relation[shape.properties.OwneeRef].properties, 'used', false)
                } else {
                  this.$set(this.dataByType.relation[shape.properties.OwneeRef].properties, 'used', true)
                }
              }
            }
          })
          this.searchAll()
          if (val?.properties?.Id !== this.preDiagramId) {
            document.querySelectorAll('.grey-tree.model-edit .el-tree-node.is-current').forEach(ele => {
              let parents = $(ele).parents('.el-tree-node')
              let path = $(ele).find('.el-tree-node__content .node-name')[0] && $(ele).find('.el-tree-node__content .node-name')[0].innerText
              parents.each(i => {
                path = $(parents[i]).find('.el-tree-node__content .node-name')[0].innerText + '/' + path
              })
              this.diagramPath = path
            })
          }
          this.preDiagramId = val?.properties?.Id
          this.entityTotal = +(this.dataByType.diagram[this.diagramId] && this.dataByType.diagram[this.diagramId].children.filter(shape => !shape.properties.deleted).length)
        }, 500)
      },
      deep: true
    }
  }
}
