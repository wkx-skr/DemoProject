import paneDetail from './detail/paneDetail.vue'
import HTTP from '@/resource/http'
import sort from '@/resource/utils/sort'
// import modelGraph from './graph/modelGraphEdit.vue'
import report from './report/list.vue'
import history from './version/modelVersion.vue'
import scriptGenerator from './script/modelVersion.vue'
import modelComment from '@/components/commentComponents/comment.vue'
import modelLevel from './level/modelLevel.vue'
import manage from './manage/main.vue'
import PinyinMatch from 'pinyin-match'
import ResizeHorizontal from '@/components/common/ResizeHorizontal'
import $ from 'jquery'
import utils from '@/resource/utils/isJSON'
import Vue from 'vue'
import { mapState } from 'vuex'
import inElectron from '@/resource/utils/environment'
import Clickoutside from 'element-ui/src/utils/clickoutside'
import LDMTypes from '@constant/LDMTypes'
import _ from 'lodash'
import publishModel from './publishModel'
import store from '@/store'
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
    paneDetail,
    modelGraphEdit,
    modelLevel,
    report,
    history,
    scriptGenerator,
    modelComment,
    publishModel,
    manage
  } : {
    paneDetail,
    modelLevel,
    report,
    history,
    scriptGenerator,
    modelComment,
    publishModel,
    manage
  },
  inject: ['refresh'],
  computed: {
    ...mapState(['showEREdit', 'isEditing']),
    isLogical () {
      return this.dataByType.model.TypeUniqueId === '025502f5-3820-4555-9d0f-bbb148840e9a' || this.dataByType.model.TypeUniqueId === '7865092e-58be-4096-b824-11bcba4aa10a' || this.dataByType.model.TypeUniqueId === '71f0d1c4-d45d-4eb7-bd1a-e45a0b018121' || this.dataByType.model.TypeUniqueId === '5c9598bc-6906-4edb-9ddb-a23428e224c2'
    },
    showViewButton () {
      return !this.isLogical && !this.isConceptual && !this.isCassandraOrMongoDB
    },
    isCassandraOrMongoDB () {
      return this.dataByType.model.TypeUniqueId === '8ea840a5-37f4-48f8-82d9-1429e42a0fc6' || this.dataByType.model.TypeUniqueId === '4ab7d425-7b4a-49c2-a19b-86dd5f911706'
    },
    isConceptual () {
      return this.dataByType.model.TypeUniqueId === '721ac3dc-dabe-4be2-ae47-cbd6b0a14d80' || this.dataByType.model.TypeUniqueId === 'f9c0cbd3-055c-4e33-8f41-5022062a8df0'
    },
    isShowVerButton () {
      let result = false
      switch (this.currentModel.modelType) {
        // case 'LogicalBusinessDomain':
        case 'ConceptualBusinessDomain':
          this.currentType = 'domain'
          result = true
          break
        case 'LogicalBusinessObject':
          this.currentType = 'object'
          result = true
          break
      }
      return result
    },
    writable () {
      return this.$store.state.lic.editor && (this.$store.state.user.isAdmin || (this.currentModel && this.currentModel.permission && this.currentModel.permission.editor))
    }
  },
  mounted () {
    // document.addEventListener('click', this.outEditSearch)
    this.getDiagrams()
    this.initHorizontalResize()
    this.getPermission()
    this.$bus.$on('update-model', (data) => {
      if (data) {
        this.diagrams = []
        const transformDiagrams = (diagrams) => {
          return diagrams.filter(item => item.properties.TypeId === 80000006).map(d => {
            let item = d.properties
            if (d.children) {
              item.children = transformDiagrams(d.children)
            }
            this.mapIdToDiagramData[item.Id] = item
            return item
          })
        }
        this.diagrams = transformDiagrams(data)
      }
      this.updateDiagrams()
    })
    window.addEventListener('resize', this.setResizeStyle)
    // document.addEventListener('visibilitychange', this.handlePageVisbleChange)
  },
  beforeDestroy () {
    // document.removeEventListener('click', this.outEditSearch)
    // document.removeEventListener('visibilitychange', this.handlePageVisbleChange)
    window.removeEventListener('resize', this.setResizeStyle)
    this.$bus.$off('append-theme')
    this.$bus.$off('update-model')
  },
  props: {
    currentPath: {},
    currentModel: {
      type: Object
    },
    modelLevel: {
      type: String,
      default: ''
    },
    modelPath: {},
    isEditor: {}
  },
  directives: { Clickoutside },
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
      currentPane = 'tables'
    }
    return {
      longkey: true,
      currentBranchId: '',
      inElectron,
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
      diagrams: [],
      diagramsLoading: true,
      diagramId: null,
      diagramName: null,
      currentPane: currentPane,
      themeBoxToTop: false,
      permissionReady: false,
      showThemeSearch: false,
      themeQuery: '',
      backImg: require('../../assets/images/icon/back.svg'),
      themeImg: require('../../assets/images/icon/themeIcon.svg'),
      themeImgActive: require('../../assets/images/icon/themeIconActive.svg'),
      hideTabs: false,
      // isLogicalModel: false,
      // isConceptual: false,
      verDialogVisible: false,
      currentType: '',
      loading: {
        status: false,
        text: '请求模型数据'
      },
      mapIdToDiagramData: {},
      resizeInstance: null,
      diagram: {},
      ParentRef: null,
      isCollapse: true
    }
  },
  beforeMount () {
    this.currentBranchId = this.currentModel.id
  },
  methods: {
    shrinkToggle(){
      this.isCollapse = !this.isCollapse
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
    handleCurrentPaneChange (pane, isView = false) {
      this.currentPane = pane
      if (isView) {
        this.$nextTick(() => {
          this.$bus.$emit('onlyShowView')
        })
      }
    },
    go2Model (val) {
      // let { pId } = this.$route.query
      let row = this.$parent.originModels.find(v => v.id === val)
      this.$parent.handleRowClick(row)
      this.currentPane = 'detail'
    },
    nodeClick (node) {
      if (window.location.href.indexOf('modelLibrary') > -1) {
        this.$router.push('/main/modelLibrary?pId=' + node.id)
      } else {
        if (inElectron) {
          this.$router.push('/electron/main/list?pId=' + node.id)
        } else {
          this.$router.push('/main/list?pId=' + node.id)
        }
      }
    },

    handlePageVisbleChange () {
      clearTimeout(this.visbleTimer)
      this.visbleTimer = setTimeout(() => {
        if (document.hidden) {
          this.$store.commit('setNeedRefresh', true)
        }
      }, 500)
    },
    handleChangeToDetail () {
      this.currentPane = 'detail'
      if (this.$store.state.needRefresh) {
        this.$store.commit('setNeedRefresh', false)
        // this.refresh()
      }
    },
    goEditPage (row) {
      if (!this.writable) {
        this.$datablauMessage.error('无权限编辑，请联系管理员')
        return
      }
      // if (this.currentModel.diagramCount === 0) {
      //   this.$datablauMessage.error('无主题域，暂时不支持编辑')
      //   return
      // }
      this.$http.put(`${this.$url}/service/editor/${row.id}/lock`).then(res => {
        if (res.data) {
          this.$store.commit('setNeedRefresh', true)
          if (inElectron) {
            // window.open(`./index.html#/main/modeledit?id=${row.id}&currentVersion=${row.currentVersion}&modelType=${row.modelType}&phase=${row.phase ? row.phase : 0}`, '', 'width=1300,height=800,contextIsolation=no,nodeIntegration=yes,autoHideMenuBar=true')
            const { ipcRenderer } = window.require('electron')
            ipcRenderer && ipcRenderer.send('newTab', JSON.stringify({
              currentVersion: row.currentVersion,
              id: row.id,
              modelType: row.modelType,
              phase: row.phase
            }))
          } else {
            console.log(window.NODE_APP.toLowerCase(), 111)
            if (window.NODE_APP.toLowerCase() === 'ddd') {
              let pageUrl = this.BaseUtils.RouterUtils.getFullUrl('modeleditD', {
                id: row.id,
                currentVersion: row.currentVersion,
                modelType: row.modelType
              })
              window.open(pageUrl)
            } else {
              window.open(`${window.baseUrl}#/main/modeledit?id=${row.id}&currentVersion=${row.currentVersion}&modelType=${row.modelType}`)
            }
          }
        }
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    change () {

    },
    showSearchPanel (e) {
      this.showThemeSearch = true
      this.$nextTick(() => {
        $('#searchId').blur().focus()
      })
    },
    outEditSearch (e) {
      this.showThemeSearch = false
      this.themeQuery = ''
    },
    hideTabsChange (val) {
      this.hideTabs = val
    },
    themeSearch () {
      this.$refs.themeTree.filter(this.themeQuery)
    },
    filterNode (value, data) {
      if (!value) return true
      return data.Name.toLowerCase().indexOf(value.toLowerCase()) !== -1
    },
    getPermission () {
      HTTP.getModelPermission({
        modelId: this.currentModel.id,
        successCallback: data => {
          this.$set(this.currentModel, 'permission', data)
          this.permissionReady = true
        }
      })
    },
    initHorizontalResize () {
      const rightMin = 880
      let modelDetailContainer = $('.model-detail-container')
      let containerWidth = modelDetailContainer.width()
      this.$nextTick(() => {
        this.resizeInstance = new ResizeHorizontal({
          leftDom: $(this.$el).find('.tree-area.model'),
          rightDom: $(this.$el).find('.content-box.model-details-content'),
          middleDom: $(this.$el).find('.resize-column-middle.model-details-page'),
          outerDom: $(this.$el),
          leftPaddingCor: 0,
          leftMinSize: 240,
          leftMaxSize: containerWidth - rightMin,
          callback: () => {
            if ($('.detail-wrapper.el-tabs').length > 0 && !$('.detail-wrapper.el-tabs').hasClass('hideTab')) {
              // $('.model-header').width($(this.$el).find('.tree-area').width())
            }

            // this.setResizeStylesetResizeStyle
          },
          onDragEvent: () => {
            this.$refs?.detail?.setResizeStyle()
          }
        })
      })
    },
    setResizeStyle () {
      const rightMin = 880
      let modelDetailContainer = $('.model-detail-container')
      let containerWidth = modelDetailContainer.width()
      this.resizeInstance?.resetResizeConfig({ leftMaxSize: containerWidth - rightMin })
      this.$refs?.detail?.setResizeStyle()
    },
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
      // this.$router.push({
      //   query: null
      // })
      if (window.history.length > 1) {
        this.$router.go(-1)
      } else {
        this.$router.push({
          query: null
        })
      }
    },
    renderContent (h, { node, data, store }) {
      let className = 'tree-icon diagram'
      return (
        <span style="flex: 1; display: flex;align-items: center;">
          <span style="text-align:center;width:24px;">
            <span class={className} ></span>
          </span>
          <span>{data.Name}</span>
        </span>)
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
            !this.$refs.modelGraphReference && this.$bus.$emit('updateTableToList')
            this.$refs.modelGraphReference?.getDiagramDetail()
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
            this.$bus.$emit('updateTableToList')
          }
          this.getModelDetailInfo()
          this.loading.status = false
          // if (Object.keys(this.dataByType.table).length > 200) {
          //   this.$message.warning('模型较大，建议在客户端编辑，不然可能出现页面无响应！')
          // }
        }
      })
    },
    getDiagrams () {
      this.$bus.$on('append-theme', ({ current, parent }) => {
        setTimeout(() => { // 在多层主题域，上层数据更新了，tree.getNode(parent)在setTimeout里能拿到最新的数据
          const tree = this.$refs.themeTree
          const parentNode = tree.getNode(parent)
          const currentNode = tree.getNode(current.Id)
          if (parentNode && !currentNode) {
            // tree.append(current, parent)
            if (parentNode.data.children) {
              parentNode.data.children.push(current)
            } else {
              this.$set(parentNode.data, 'children', [current])
            }
            sort.sortConsiderChineseNumber(parentNode.data.children, 'Name')
            this.$nextTick(() => {
              parentNode.expanded = true
            })
          }
        })
      })
      HTTP.getDiagramsThemeData({ // 主要对于大模型优先获取主题域数据处理后，再获取全量数据
        modelId: this.currentModel.id,
        successCallback: (data) => {
          this.data = data.children
          this.prepareUdpData(data.udp)
          this.dataByType.model = data.properties
          // this.isLogicalModel = this.dataByType.model.TypeUniqueId === '025502f5-3820-4555-9d0f-bbb148840e9a'
          // this.isConceptual = this.dataByType.model.TypeUniqueId === '721ac3dc-dabe-4be2-ae47-cbd6b0a14d80'
          // this.prepareTreeData()

          HTTP.getDiagrams({
            modelId: this.currentModel.id,
            longkey: this.longkey,
            successCallback: (data) => {
              if (this.longkey) {
                data = this.transformData(data)
              }
              this.data = data.children
              _.merge(this.currentModel, data.properties)
              this.getModelDetailInfo()
              this.prepareUdpData(data.udp)
              this.dataByType.model = data.properties
              // this.isLogicalModel = this.dataByType.model.TypeUniqueId === '025502f5-3820-4555-9d0f-bbb148840e9a'
              // this.isConceptual = this.dataByType.model.TypeUniqueId === '721ac3dc-dabe-4be2-ae47-cbd6b0a14d80'
              this.prepareTreeData()
              setTimeout(() => {
                if (this.$route.query.typeId && String(this.$route.query.typeId) === '80000006') {
                  this.diagrams.forEach(item => {
                    if (String(item.Id) === String(this.$route.query.elementId)) {
                      // todo:按主题id跳转时，需要高亮
                      //  this.currentPane = 'diagram' + item.Name
                      this.handleDiagramClick(item)
                      this.$refs.themeTree?.setCurrentKey(this.$route.query.elementId)
                    }
                  })
                }
              })
            }
          })
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
      this.currentModel.diagramCount = this.diagrams.length
      sort.sortConsiderChineseNumber(this.diagrams, 'Name')
    },
    handleDiagramClick (diagram, node, el) {
      // this.ParentRef = diagram.ParentRef
      window.move = false
      this.diagramId = diagram.Id
      this.diagramName = diagram.Name
      this.currentPane = 'diagram'
      this.$nextTick(() => {
        if ($('.detail-wrapper.el-tabs').length > 0 && !$('.detail-wrapper.el-tabs').hasClass('hideTab')) {
          $('.model-header').width($(this.$el).find('.tree-area').width())
        }
      })
      this.$router.replace({
        query: {
          id: this.$route.query.id,
          pId: this.$route.query.pId,
          currentVersion: this.$route.query.currentVersion
        }
      })
    },
    goManageInfo(){
      this.currentPane = 'manage'
      this.isCollapse = false
    },
    handelClickEntityPanel (type) {
      this.currentPane = 'tables'
      this.$router.replace({
        query: {
          id: this.$route.query.id,
          pId: this.$route.query.pId,
          currentVersion: this.$route.query.currentVersion
        }
      })
      if (type === 'isCollapse') {
        this.isCollapse = false
      }
    },
    getModelDetailInfo () {
      this.$route.query.id && this.$http.get(this.$url + '/service/models/' + this.$route.query.id
      ).then(res => {
        this.currentModel.Name = res.data.name
        // this.currentModel.Definition = res.data.description
        this.currentModel.Definition = this.dataByType.model.Definition
        this.currentModel.currentVersion = res.data.currentVersion
        this.currentModel.useProto = res.data.useProto
        this.$set(this.currentModel, 'seed', res.data.seed)
        if (res.data.limitedDsApply) {
          this.$set(this.currentModel, 'limitedDsApply', res.data.limitedDsApply)
          this.$set(this.currentModel, 'limitedDsApplyConfig', JSON.parse(res.data.limitedDsApplyConfig))
        }
        // this.$router.replace({
        //   query: {
        //     id: this.$route.query.id,
        //     modelType: this.$route.query.modelType,
        //     currentVersion: res.data.currentVersion
        //   }
        // })
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    handleCollapseChange (c) {
      // this.themeBoxToTop = !this.themeBoxToTop
    },
    handlePublishModel () {
      this.$refs.publishModel?.dataInit()
    },
    itemChange () {
      if ($('.detail-wrapper.el-tabs').length === 0 || $('.detail-wrapper.el-tabs').hasClass('hideTab')) {
        $('.model-header').width('auto')
      }
      // this.$refs.detail.getRate()
    }
  },
  watch: {
    diagramsLoading (val) {
      if (!val) {
        this.$bus.$emit('updateTableToList')
      }
    },
    themeBoxToTop () {
    },
    themeQuery: {
      handler (val) {
        this.$refs.themeTree.filter(val)
      },
      deep: true
    },
    currentPane (name) {
      if (name !== 'diagram') { // 如果点击基本信息下的栏目
        this.$refs.themeTree.setCurrentKey(null)
      }
      if (name === 'detail') {
        this.$store.dispatch('getPhases')
      }
    }
  }
}
