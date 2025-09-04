import metaModelRelationList from './metaModelRelationList.vue'

import fieldColumns from './columns.vue'
import fieldTitle from './fieldTitle.vue'
import fieldRelation from './relation.vue'
import tagRecommend from '@/view/dataStandardTagManage/smartRule/tagRecommend.vue'
import consanguinityGraph from './consanguinityGraph.vue'
import LineageGraphEntrance from './lineageGraphEntrance.vue'
import 'prismjs/themes/prism.css'
import Prism from 'prismjs'
import userSelect from '../../../components/common/UserSelect.vue'
import tableInView from './tableInView.vue'
import HTTP from '@/http/main'
import shareFileUdpEdit from './shareFileUdpEdit.vue'
import dataSteward from './dataSteward.vue'
import groupDepartment from './groupDepartment.vue'
import UserTop from '@/components/userTop/userTop.vue'
import knowledgeGraph from './knowledgeGraph.vue'
import comment from '@/components/commentComponents/comment.vue'
import itemColumn from '../../myItem/itemColumn.vue'
import accessControl from './accessControl'
import whiteList from './whiteList'
import PinyinMatch from 'pinyin-match'
import _ from 'lodash'
import dataServerList from './dataServerList.vue'
import moment from 'moment'
import { basicFormatter } from '@/class/category/CategoryFormatter'
import tooltip from '@/class/commonComponent/tooltip.vue'
import categoryDetail from '@/class/category/categoryDetail.vue'
import TooltipType from '@/class/constant/TooltipType'
import isShowTooltip from './isShowTooltip.vue'
import standardCodeRow from './standardCodeRow.vue'
import compareDetail from './modelCompareReportDetail.vue'
import api from '@/view/dataAsset/utils/api.js'
import metaModelIcon from '@/assets/images/search/metamodel.png'
import { setTimeout } from 'timers'

const standardRow = () => import('./standardRow.vue')
export default {
  props: {
    objectId: Number,
    object: Object,
    objectTypeMaybe: String,
    //    objectType:String,
    loadedTagsBefore: Array,
    expand: Boolean,
    fromBusiness: {
      type: Boolean,
      default: false,
    },
    dataAmount: {
      required: false,
      type: Number,
      default: 5,
    },
    isAnquan: {
      type: Boolean,
      default: false,
    },
    isZichan: {
      type: Boolean,
      default: false,
    },
    hideHeader: {
      default: false,
      type: Boolean,
    },
    summaryFromProps: {
      type: Object,
      required: false,
    },
    dataSecurity: {
      default: false,
      type: Boolean,
    },
    isFloder: {
      // 是否文件页面过来的
      type: Boolean,
      default: false,
    },
    // pageHistory: {},
  },
  created() {
    this.$getUserModelCategory(this.$user.username, this.handleCategory)
  },
  async mounted() {
    try {
      let pageHistory = sessionStorage.getItem('metaModelPageHistory')
      pageHistory = JSON.parse(pageHistory)
      if (pageHistory && pageHistory.length > 0) {
        this.pageHistory = pageHistory
      }
    } catch (e) {
      console.log(e)
    }
    if (this.pageHistory.length === 0) {
      setTimeout(() => {
        let page = window.location.href
        this.pageHistory.push(page)
        let metaModelPageHistory = JSON.stringify(this.pageHistory)
        sessionStorage.setItem('metaModelPageHistory', metaModelPageHistory)
        sessionStorage.removeItem('metaModelFirstBack')
      }, 1000)
    }

    const query = this.$route.query
    this.isAssets = query.isAssets ? query.isAssets : ''
    if (query.isQuality) {
      this.handleClick({ name: 'sixth' })
    }
    this.getDetail()
      .then(res => {
        this.favoPara = {
          typeId: this.summary.dataObjectDto.typeId,
          objId: parseInt(this.object.objectId),
          objectName:
            this.summary.dataObjectDto.physicalName +
            (this.summary.dataObjectDto.logicalName
              ? `(${this.summary.dataObjectDto.logicalName})`
              : ''),
        }
        this.checkIfCollected()
        this.getCollectionNum()
        this.getNode()
        this.getMeteObjIcon()

        this.getObjectBindTags()
        this.getObjectBindTagsWidthGroup()
        this.getProp()
        this.getTagsTreeArr()
        this.getDataTop()

        this.loading = false
        this.summaryLoaded = true
      })
      .catch(e => {
        this.$showFailure(e)
      })
    // if (this.object.type === 'REPORT') {
    //   this.typeIsReport = true
    //   this.getReportDetail(this.object.id)
    //   this.objectType = 'REPORT'
    // } else if (
    //   this.object.type === 'FILE' ||
    //   this.object.type === 'SHARE_FILE'
    // ) {
    //   this.objectType = 'FILE'
    //   this.getFileDetail()
    // } else {
    //   await this.getSummary()
    //   this.getTagsTreeArr()
    //
    //   // 判断是否显示 数据服务 tab
    //   // this.showDataServerDetail()
    // }
    if (this.object.type === 'PACKAGE') {
      this.objType = 'PACKAGE'
    }
    // this.getColumns()
    this.getTagsTreeArr()
    this.loadTagsInitial()
    // this.getColumnMapping()
    this.$bus.$on('userNameChange', name => {
      this.newOwner = name
    })
    this.$utils.sort.sortConsiderChineseNumber(this.loadedTagsBefore)
    this.loadedTagsBefore.forEach(item => {
      if (item.children) {
        this.$utils.sort.sortConsiderChineseNumber(item.children)
      }
    })
    // setTimeout(()=>{
    //   let listContainer =  $(this.$el).find('.ps-container')[0];
    //   this.ps = new NewPs(listContainer);
    // });
    this.setStyle()
    if (this.objType === 'PACKAGE') {
      this.getPackageRelationships()
    }
  },
  beforeDestroy() {
    this.$bus.$off('userNameChange')
  },
  components: {
    metaModelRelationList,
    tooltip,
    categoryDetail,
    fieldColumns,
    fieldTitle,
    fieldRelation,
    // fieldUdp,
    // fieldBusinessObject,
    consanguinityGraph,
    LineageGraphEntrance,
    standardRow,
    userSelect,
    tableInView,
    // fileDetail,
    shareFileUdpEdit,
    dataSteward,
    groupDepartment,
    UserTop,
    knowledgeGraph,
    tagRecommend,
    comment,
    itemColumn,
    // dataViste,
    dataServerList,
    accessControl,
    whiteList,
    isShowTooltip,
    standardCodeRow,
    compareDetail,
  },
  data() {
    return {
      metaModelIcon: null,
      objectProps: [],
      sampleError: '',
      securityList: [],
      isAssets: '', // 是否从数据资产页跳转过来的
      isTip: false,
      colsNameMap: {},
      authForm: {
        type: 'table',
        colIds: [],
        authorityDate: '30天',
      }, // 权限申请数据
      rules: {
        authorityDate: [
          {
            required: true,
            message: this.$t(
              'quality.page.dataQualityRepairJob.showProblemData.rules.expStr'
            ),
            trigger: 'blur',
          },
        ],
      },
      tableKey: 0,
      objType: '',
      typeId: '',
      curTab: 'first',
      TooltipType: TooltipType,
      basicFormatter: basicFormatter,
      objectType: '',
      loading: true,
      summary: {},
      summaryLoaded: false,
      columnsLoaded: false,
      tableViewLoaded: false,
      relationLoaded: false,
      lineageLoaded: false,

      sqlContent: '',
      packageBody: '',
      linkarr: [],

      logicalName: '',
      logicalNameEditing: false,
      logicalNameSaving: false,

      definition: '',
      definitionEditing: false,
      definitionSaving: false,

      addTagVisible: false,
      loadedTags: null,
      tagTreeProps: {
        children: 'children',
        label: 'name',
      },
      tagFilterText: '',
      newTagName: '',
      selectedTagCategory: '',
      canSelectTag: false,

      ownerWritable: false,
      showEditOwnerDialog: false,
      newOwner: '',

      lineageFromApiTables: null,
      apiTablesLoaded: false,
      // report
      typeIsReport: false,
      toolbars: {
        bold: true, // 粗体
        italic: true, // 斜体
        header: true, // 标题
        underline: true, // 下划线
        strikethrough: true, // 中划线
        mark: true, // 标记
        superscript: true, // 上角标
        subscript: true, // 下角标
        quote: true, // 引用
        ol: true, // 有序列表
        ul: true, // 无序列表
        link: true, // 链接
        imagelink: false, // 图片链接
        code: true, // code
        table: true, // 表格
        fullscreen: false, // 全屏编辑
        readmodel: true, // 沉浸式阅读
        htmlcode: true, // 展示html源码
        help: false, // 帮助
        /* 1.3.5 */
        undo: true, // 上一步
        redo: true, // 下一步
        trash: true, // 清空
        save: false, // 保存（触发events中的save事件）
        /* 1.4.2 */
        navigation: true, // 导航目录
        /* 2.1.8 */
        alignleft: true, // 左对齐
        aligncenter: true, // 居中
        alignright: true, // 右对齐
        /* 2.2.1 */
        subfield: true, // 单双栏模式
        preview: true, // 预览
      },
      activeName: this.dataSecurity ? 'whitelist' : 'first',
      scoreColors: ['#99A9BF', '#F7BA2A', '#FF9900'],
      // scoreValue: null,
      data: [],
      tableData: null,
      loadingColumns: true,
      tableDataTop: [],
      propArr: [],
      isFile: false,
      isLogical: null,
      detailColumnLable: this.$t('meta.DS.tableDetail.column.label'),
      typeMap: {
        80000004: '表',
        80500008: '视图',
        80000005: '字段',
        80010119: '函数',
        82800024: '程序包',
        80010118: '存储过程',
      },
      tagsTreeArr: {},
      udpValue: '',
      optionsUdp: [],
      currentPageSample: 1,
      pageSizeSample: 20,
      totalItemsSample: 0,
      sampleListArr: [],
      sampleListArrData: [],
      columnsArr: [],
      sampleListType: [],
      secondBoxHeight: 0,
      columnsBoxHeight: 0,
      thirdBoxHeight: 0,
      changeHistoryArr: [],
      techRuleArr: [],
      domainRuleArr: [],
      hasCollected: false,
      favoPara: null,
      favId: null,
      sampleLoading: true,
      dataQualityLoading: true,
      changeHistoryLoading: true,
      ps: null,
      columnsProfileKey: 0,
      profiling: false,
      techRuleArrDisabled: false,
      /* questionArr: {
        NOT_START: '未处理',
        ACCEPT: '已接收',
        CONFIRM: '已确认',
        FIXED: '已修复',
        VERIFIED: '已验证',
        CLOSED: '已关闭',
      }, */
      checkList: [],
      checkListBak: [],
      catalogTree: [],
      catalogTree1: [],
      tagRecommendKey: 0,
      loadedTagsSecond: [],
      showAuthorityDialog: false,
      authorityType: ['查询'],
      userAuthorityDate: Date.now(),
      applyReason: '',
      ddsEnable: false,
      columnOption: {
        // selectable: true,
        showColumnSelection: false,
        // columnSelection: [],
        columnResizable: true,
      },
      sampleOption: {
        showColumnSelection: false,
        // columnSelection: [],
        columnResizable: true,
      },
      techRuleArrOption: {
        showColumnSelection: false,
        // columnSelection: [],
        columnResizable: true,
      },
      historyOption: {
        showColumnSelection: false,
        columnSelection: [],
        columnResizable: true,
      },
      currentPageExploration: 1,
      pageSizeExploration: 20,
      totalItemsExploration: 0,
      explorationData: [],
      explorationTime: '',
      explorationLoading: false,
      editStateValue: false,
      nodeData1: [],
      nodeData: [],
      heightChange: false,
      columnMapping: {},
      inSystem: false,
      currentUserCategory: [],
      updateState: false,
      journalMes: '',
      dialogVisibleJournal: false,
      profileJobResult: null,
      dialogVisibleProfile: false,
      compareSelection: [], // 版本的比对
      compareSelectionLength: 0,
      disabledCompar: false,
      compareIds: [],
      compareDetailVisible: false,
      compareTableData: '',
      compareVersions: {},
      appName: HTTP.$appName,
      submitAuthorityLoad: false,
      favoriteCount: 0,
      fileTags: {},
      lineageKey: 1,
      aiDisabled: false,
      showAI: Boolean(window.setting.metaAI),
      subRelationTabs: [],
      subRelationCurrentTab: null,
      pageHistory: [],
      defaultProperties: [],
      showHistoryDialog: false,
      versionDetailData: [],
      sortedVersions: [],
    }
  },
  computed: {
    closable() {
      return function (valueIndex) {
        return (
          Boolean(this.contentWritable) &&
          !this.isAssets &&
          !this.hasSecurity(valueIndex.value.builtInCode)
        )
      }
    },
    logicalIcon() {
      if (this.object.type === 'COLUMN' || this.propArr.type === '80000005') {
        return 'logicalcolumn'
      } else {
        return 'logicaltable'
      }
    },
    showDefault() {
      let bool = true
      if (
        this.typeIsReport ||
        this.objectType === 'FILE' ||
        this.objectType === 'SHARE_FILE'
      ) {
        bool = false
      }
      return bool
    },
    contentWritable() {
      return (
        ((this.isFloder && this.$auth.METADATA_FILE_VIEW) ||
          (!this.isFloder && this.$auth.METADATA_EDIT) ||
          (this.inSystem && this.$auth.METADATA_EDIT_CURRENT_SYSTEM)) &&
        this.stas &&
        !this.isAssets
      )
    },
    stas() {
      return this.$route.path.includes('embeddedModule') ? 'false' : 'true'
    },
    hasMetadataLineage() {
      return (
        !this.dataSecurity &&
        this.$featureMap.FE_LINEAGE &&
        ['TABLE', 'COLUMN'].includes(this.objectType) &&
        this.summaryLoaded
      )
    },
  },
  filters: {
    pathFormat(para) {
      para = para || []
      let result = ''
      if (para && Array.isArray(para) && para.length > 0) {
        result = para.join(' / ')
      } else {
        result = '/'
      }
      return result
    },
  },
  methods: {
    showHistoryChange(row) {
      this.$http
        .post(this.$meta_url + `/entities/${this.object.objectId}/versionDetail?version=${row.version}`)
        .then(res => {
          this.sortedVersions = []
          this.versionDetailData = []
          const versions = new Set()
          res.data && res.data.forEach((item) => {
            versions.add(item.version)
            versions.add(item.lastVersion)
          })
          this.sortedVersions = Array.from(versions).sort((a, b) => a - b)
          this.versionDetailData = res.data && res.data.map((item) => {
            const row = { propertyName: item.propertyName }
            this.sortedVersions.forEach((v) => {
              if (v === item.lastVersion) {
                row[`version${v}`] = item.lastValue ?? ''
              } else if (v === item.version) {
                row[`version${v}`] = item.value ?? ''
              } else {
                row[`version${v}`] = ''
              }
            })
            return row
          })
          this.showHistoryDialog = true
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
    async toGenerateAI() {
      const _this = this
      const sentence = window.setting.metaAI
      const variableRegex = /\$\{([^}]+)\}/g
      const variables = []
      let match
      while ((match = variableRegex.exec(sentence)) != null) {
        variables.push(match[1])
      }
      const values = []
      variables.forEach((v, idx) => {
        values[idx] = this.summary[v] || ''
      })
      let newSentence = sentence
      variables.forEach((variable, index) => {
        newSentence = newSentence.replace(`\${${variable}}`, values[index])
      })
      // console.log(newSentence)

      if (!newSentence) return

      this.aiDisabled = true
      this.definition = ''
      // this.detail.description = ''
      this.$ESHTTP('/aic/api/v1/chat/completions', newSentence, answer => {
        if (answer) {
          if (answer.choices && answer.choices.length) {
            answer.choices.forEach(an => {
              if (an.delta.content) {
                this.definition += an.delta.content
                // _this.detail.description += an.delta.content
              }
            })
          }
        } else {
          _this.aiDisabled = false
        }
      })
    },
    hasSecurity(code) {
      // 安全分级管理里面的标签nameList(不能编辑)
      const nameList = [
        'dataAuthA', // 安全等级
        'IMPORTANCE', // 重要程度
        'DEGREE', // 影响程度
        'SCOPE', // 影响范围
        'OBJECT', // 影响对象
      ].filter(i => !!i)
      let flag = false
      if (code) {
        flag = nameList.some(item => code.includes(item))
      }
      return flag
    },
    removeCompareDetail() {
      this.compareDetailVisible = false
      this.compareSelection = []
      this.compareSelectionLength = 0
    },
    versionComparison() {
      if (this.compareSelectionLength === 1) {
        this.compareIds = []
        this.compareIds.push(this.compareSelection[0])
        this.changeHistoryArr.forEach((element, index) => {
          if (element.version === this.compareSelection[0].version) {
            this.compareIds.push(this.changeHistoryArr[index + 1])
          }
        })
      } else {
        this.compareIds = this.compareSelection
      }
      this.compareIds.sort((a, b) => b.version - a.version)
      this.compareVersions = {
        right: this.compareIds[0].versionName,
        left: this.compareIds[1].versionName,
      }
      this.getCompareDetailData()
      this.compareDetailVisible = true
    },
    getCompareDetailData() {
      let param = {
        startVersion: this.compareIds[1].version,
        endVersion: this.compareIds[0].version,
        objectId: this.summary.objectId,
        modelId: this.summary.modelId,
      }
      this.$http
        .post(this.$meta_url + '/entities/version/compareDataObject', param)
        .then(res => {
          this.data = res.data.compareResult
          this.compareTableData = res.data.compareResult.differences
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
    handleSelectionChange(selection) {
      this.compareSelection = selection
      this.compareSelectionLength = selection.length
      let arr = []
      selection.forEach(element => {
        arr.push(element.versionName)
        // arr.push(element.version)
      })
      this.selectionName = arr.join('/')
      if (selection.length > 2) {
        let del_row = selection.shift()
        // console.log('把数组的第一个元素从其中删除后', selection);
        this.$refs.historyList.onlyTwoChange(del_row)
      }
      if (this.compareSelectionLength === 1) {
        selection.forEach(element => {
          if (
            element.version ===
            this.changeHistoryArr[this.changeHistoryArr.length - 1].version
          ) {
            this.disabledCompar = true
          }
        })
        // this.disabledCompar = true
      } else {
        this.disabledCompar = false
      }
    },
    widthsCalculator(label) {
      const minWidth = 120
      const maxWidth = 280
      if (typeof label == 'string') {
        let labelWidth = label.length * 13 + 20
        if (labelWidth > maxWidth) {
          return maxWidth
        }
        if (labelWidth < minWidth) {
          return minWidth
        }
        return labelWidth
      } else {
        return minWidth
      }
    },
    handleCloseAuthorityDialog() {
      this.showAuthorityDialog = false
      this.authForm = {
        type: 'table',
        colIds: [],
        authorityDate: '30天',
      }
      this.applyReason = ''
    },
    updateDomainCode(domainCode) {
      /* if (domainCode) {
        // 数据标准本身携带标准代码
        this.$refs.domainCodeRef.updateDomainCode(domainCode, true)
      } else {
        this.getSummary('updateDomainCode')
      } */
      this.getSummary('updateDomainCode', true)
    },
    handleLook(row) {
      // 数据分类表格详情添加脱敏规则
      row.path = {
        modelName: this.summary.modelName,
        schemaName: this.summary.schemaName,
        physicalName: this.summary.physicalName,
      }
      this.$emit('handleLook', row)
    },
    getNode() {
      if (this.isAnquan) {
        this.nodeData = [
          {
            name: this.$t('common.page.accessControl'),
            couldClick: false,
          },
          {
            name: this.summary.physicalName || this.summary.name,
            couldClick: false,
          },
        ]
      } else if (this.isZichan) {
        this.nodeData = [
          {
            name: this.$t('common.page.businessCatalog'),
            couldClick: false,
          },
          {
            name: this.summary.physicalName || this.summary.name,
            couldClick: false,
          },
        ]
      } else {
        this.nodeData = [
          {
            name: this.summary?.dataObjectDto?.modelName,
            couldClick: false,
          },
          {
            name: this.summary?.dataObjectDto?.physicalName,
            couldClick: false,
          },
        ]
      }
    },
    goQualityProblem() {
      if (this.hasMetadataLineage) {
        this.activeName = 'lineage'
        setTimeout(() => {
          this.$refs.lineageGraphEntrance.focusSelf()
        }, 1000)
      }
    },
    getEditState(value) {
      this.editStateValue = value
    },
    addHistory(page) {
      this.pageHistory.push(page)
      let metaModelPageHistory = JSON.stringify(this.pageHistory)
      sessionStorage.setItem('metaModelPageHistory', metaModelPageHistory)
      sessionStorage.removeItem('metaModelFirstBack')
      window.location.href = page
    },
    backClick() {
      if (this.pageHistory.length > 0) {
        let page = this.pageHistory.pop()
        if (sessionStorage.getItem('metaModelFirstBack') !== 'false') {
          page = this.pageHistory.pop()
          sessionStorage.setItem('metaModelFirstBack', 'false')
        }
        if (!page) {
          // 第一个页面直接返回
          sessionStorage.removeItem('metaModelPageHistory')
          this.$emit('close')
        } else {
          let metaModelPageHistory = JSON.stringify(this.pageHistory)
          sessionStorage.setItem('metaModelPageHistory', metaModelPageHistory)
          window.location.href = page
        }
      } else {
        sessionStorage.removeItem('metaModelFirstBack')
        this.$emit('close')
      }
    },
    nodeClick(node) {
      // console.log(node);
      // this.$emit('close')
      this.jumpToTable(this.summary.tableId)
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
    dataTypeFormatter(row) {
      if (!row.typeName) {
        return ''
      }
      let databaseType
      if (this.propArr.databaseType) {
        databaseType = this.propArr.databaseType.toUpperCase()
      }
      let type =
        this.columnMapping[
          databaseType + '_@@_' + row.typeName.replaceAll(/\s*\(.*?\)\s*/g, '')
        ]
      if (type !== undefined) {
        return type
      } else {
        return row.typeName.replaceAll(/\s*\(.*?\)\s*/g, '')
      }
      // console.log(this.columnMapping.aaa)
      // if (!row.typeName) {
      //   return ''
      // }
      // const type = row.typeName.toLowerCase().replaceAll(/\s*\(.*?\)\s*/g, '')
      // if (
      //   type.includes('int') ||
      //   type.includes('long') ||
      //   type.includes('number')
      // ) {
      //   return '数值'
      // } else if (type.includes('char') || type.includes('text')) {
      //   return '文本'
      // } else if (type.includes('time') || type.includes('date')) {
      //   return '时间'
      // } else if (type.includes('json')) {
      //   return 'JSON文件'
      // } else if (type.includes('binary') || type.includes('raw')) {
      //   if (type.includes('varbinary')) {
      //     return '二进制数据'
      //   } else {
      //     return '二进制文件'
      //   }
      // } else {
      //   return row.typeName
      // }
    },
    iconHtmlFormat2(name) {
      let formatedName = ''
      let color = ''
      let txtColor = ''
      formatedName = name.slice(0, 3).toUpperCase()
      switch (name) {
        case this.$t('meta.DS.tableDetail.sampleData.time'):
          formatedName = 'TIME'
          color = 'rgba(67, 193, 202, 0.1)'
          txtColor = '#43C1CA'
          break
        case this.$t('meta.DS.tableDetail.sampleData.int'):
          color = 'rgba(140, 92, 255, 0.1)'
          txtColor = '#8C5DFE'
          break
        case this.$t('meta.DS.tableDetail.sampleData.text'):
          color = 'rgba(235, 132, 73, 0.1)'
          txtColor = '#EB8449'
          break
        default:
          color = 'rgba(85, 85, 85, 0.1)'
          txtColor = '#777'
          break
      }
      return `<span style="
      color: ${txtColor};background:${color};width:40px;height:22px;font-size: 14px;line-height:22px;text-align:center;border-radius:2px;display:inline-block;margin-right: 5px;">${formatedName}</span>`
    },
    iconHtmlFormat(name) {
      let formatedName = ''
      let color = ''
      let txtColor = ''
      formatedName = name.toUpperCase()
      switch (name) {
        case this.$t('meta.DS.tableDetail.sampleData.time'):
          color = 'rgba(25,178,172, 0.1)'
          txtColor = '#19B2AC'
          break
        case this.$t('meta.DS.tableDetail.sampleData.date'):
          color = 'rgba(25,178,172, 0.1)'
          txtColor = '#19B2AC'
          break
        case this.$t('meta.DS.tableDetail.sampleData.int'):
          color = 'rgba(33, 84, 196, 0.1)'
          txtColor = '#2154C4'
          break
        case this.$t('meta.DS.tableDetail.sampleData.text'):
          color = 'rgba(94,94,255,0.1)'
          txtColor = '#5E5EFF'
          break
        case this.$t('meta.DS.tableDetail.sampleData.file'):
          color = 'rgba(64,158,255,0.1)'
          txtColor = '#409EFF'
          break
        case this.$t('meta.DS.tableDetail.sampleData.json'):
          color = 'rgba(218,133,28,0.1)'
          txtColor = '#DA711C'
          break
        case this.$t('meta.DS.tableDetail.sampleData.binaryFile'):
          color = 'rgba(82,164,85,0.1)'
          txtColor = '#52A455'
          break
        case this.$t('meta.DS.tableDetail.sampleData.binaryText'):
          color = 'rgba(82,164,85,0.1)'
          txtColor = '#52A455'
          break
        case this.$t('meta.DS.tableDetail.sampleData.binaryData'):
          color = 'rgba(82,164,85,0.1)'
          txtColor = '#52A455'
          break
        case this.$t('meta.DS.tableDetail.sampleData.complexData'):
          color = 'rgba(0,136,153,0.1)'
          txtColor = '#008899'
          break
        case this.$t('meta.DS.tableDetail.sampleData.boolean'):
          color = 'rgba(160,94,232,0.1)'
          txtColor = '#A05EE8'
          break
        default:
          color = 'rgba(153, 153, 153, 0.1)'
          txtColor = '#999999'
          break
      }
      return `<span style="
      color: ${txtColor};background:${color};width:76px;height:24px;font-size: 12px;line-height:24px;text-align:center;border-radius:2px;display:inline-block;margin-right: 5px;overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;vertical-align: middle;
      margin-bottom: 1px;">${formatedName}</span>`
    },
    submitData() {
      if (this.authorityType.length === 0) {
        this.$message.error(
          this.$t(meta.DS.tableDetail.permissionApply.selPermissionType)
        )
        return
      }
      let effectiveTime = null
      if (
        this.authForm.authorityDate ===
        this.$t('meta.DS.tableDetail.permissionApply.longTerm')
      ) {
        effectiveTime = ''
      } else if (
        this.authForm.authorityDate ===
        this.$t('meta.DS.tableDetail.permissionApply.30days')
      ) {
        effectiveTime = 30 * 24 * 3600 * 1000
      } else if (
        this.authForm.authorityDate ===
        this.$t('meta.DS.tableDetail.permissionApply.60days')
      ) {
        effectiveTime = 60 * 24 * 3600 * 1000
      } else if (
        this.authForm.authorityDate ===
        this.$t('meta.DS.tableDetail.permissionApply.90days')
      ) {
        effectiveTime = 90 * 24 * 3600 * 1000
      } else if (
        this.authForm.authorityDate ===
        this.$t('meta.DS.tableDetail.permissionApply.customDate')
      ) {
        effectiveTime = moment(this.userAuthorityDate) - Date.now()
      }
      let applyItemType
      // 申请权限添加申请字段权限
      if (this.authForm.type === 'column') {
        applyItemType = 80000005
      } else {
        applyItemType = this.objectType === 'TABLE' ? 80000004 : 80500008
      }
      this.$http
        .get(`${this.$meta_url}/entities/${this.object.objectId}/columns`)
        .then(res => {
          const params = {
            processType: this.$t(
              'meta.DS.tableDetail.permissionApply.dataPermissionApply'
            ),
            formDefs: [
              {
                code: 'applyName',
                // value: this.authForm.type === 'column' ? '' : this.object.name,
                value: this.object.name,
              },
              {
                code: 'applyItemId',
                value:
                  this.authForm.type === 'column'
                    ? this.authForm.colIds[0]
                    : this.object.objectId,
              },
              {
                code: 'applyItemType',
                value: applyItemType,
              },
              {
                code: 'applyReason',
                value: this.applyReason,
              },
              {
                code: 'effectiveTime',
                value: effectiveTime,
              },
              {
                code: 'effectiveStr',
                value:
                  this.authForm.authorityDate ===
                  this.$t('meta.DS.tableDetail.permissionApply.customDate')
                    ? moment(this.userAuthorityDate).format('YYYY-MM-DD')
                    : this.authForm.authorityDate,
              },
              {
                code: 'effectiveType',
                value:
                  this.authForm.authorityDate ===
                  this.$t('meta.DS.tableDetail.permissionApply.longTerm')
                    ? 'LONG'
                    : this.authForm.authorityDate ===
                      this.$t('meta.DS.tableDetail.permissionApply.customDate')
                    ? 'CUSTOM'
                    : 'SHORT',
              },
              {
                code: 'info',
                value: JSON.stringify({
                  applyColumnIds:
                    this.authForm.type === 'column'
                      ? this.authForm.colIds
                      : res.data.map(i => i.objectId),
                  applyColumnNames:
                    this.authForm.type === 'column'
                      ? this.authForm.colIds.map(v => this.colsNameMap[v])
                      : null,
                  readable: this.authorityType.includes('查询'),
                  writable: this.authorityType.includes('写入'),
                  modifiable: this.authorityType.includes('修改'),
                  deleted: this.authorityType.includes('删除'),
                  physicalName: this.object.physicalName,
                  parentPhysicalName: this.object.parentPhysicalName,
                  schema: this.object.schema,
                  name: this.object.name,
                  type: this.objectType,
                }),
              },
            ],
          }
          window.$wHttp
            .post(`${window.wBase}workflow/process/apply`, { ...params })
            .then(res => {
              this.$message.success(this.$t('meta.DS.message.applySendSucceed'))
              this.submitAuthorityLoad = false
              this.showAuthorityDialog = false
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
    },
    submitAuthority() {
      this.submitAuthorityLoad = true
      // 先验证是否提交的为数据字段权限申请
      this.$refs.authForm.validate() // 先验证必填项
      if (
        this.authForm.type === 'column' &&
        this.authForm.colIds.length === 0
      ) {
        this.isTip = true
        return
      } else {
        this.isTip = false
      }
      this.$refs.authForm.validate(valid => {
        if (valid) {
          this.submitData()
        } else {
          return false
        }
      })
    },
    handleApplyAuthority() {
      this.showAuthorityDialog = true
    },
    transform() {
      this.tableName = this.summary.physicalName
      this.modelId = this.summary.modelId
      const sharp = location.href.indexOf('#')

      window.open(
        location.href.slice(0, sharp + 1) +
          `/transformAction?modelId=${this.modelId}&tableName=${this.tableName}`
      )
    },
    handleCreateView() {
      this.$router.push({
        name: 'createView',
        path: '/main/createView',
        query: {
          objectId: this.objectId,
          tablePath: this.$route.path === '/main/meta' ? 'metadata' : 'myItem',
        },
      })
    },
    handleApplyData(event) {
      const data = this.objectId
      const userName = this.$user.username
      this.$utils.localStorage.saveDataApplication({
        attr: 'dataApply',
        data,
        type: 'Object',
        userName: userName,
      })
      this.$showSuccess(this.$t('meta.DS.message.addSucceed'))
      this.$bus.$emit('addTableApplication', event)
    },
    tableRowClassName({ row, rowIndex }) {
      if (row.show) {
        return 'show-row'
      } else {
        return 'hide-row'
      }
    },
    checkChange(row, node) {
      // 组内单选，组外多选
      if (this.checkList.length) {
        const arr = this.checkList
          .slice(0, this.checkList.length - 1)
          .map(o => o.split('^')[1])
        row.children.forEach(item => {
          if (arr.includes(item.name)) {
            this.checkList.splice(arr.indexOf(item.name), 1)
          }
        })
      }
    },
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (rowIndex === 0 && columnIndex === 0) {
        this.calculateArr = []
      }
      if (columnIndex === 0) {
        if (this.calculateArr.includes(this.catalogTree1[rowIndex].name)) {
          return [0, 0]
        } else if (!this.catalogTree1[rowIndex].show) {
          return [1, 1]
        } else {
          const _row = this.catalogTree1.filter(
            item => item.name === this.catalogTree1[rowIndex].name && item.show
          ).length
          const _col = _row > 0 ? 1 : 0
          this.calculateArr.push(this.catalogTree1[rowIndex].name)
          return {
            rowspan: _row,
            colspan: _col,
          }
        }
      }
    },
    // 导出此表
    downloadTable() {
      const href =
        this.$meta_url +
        '/models/' +
        this.summary.modelId +
        '/export?tableIds=' +
        this.summary.objectId +
        '&isSimple=true'
      this.$downloadFilePost(href, {})
    },
    handleResize() {
      if (this.ps) {
        this.$nextTick(() => {
          this.ps.update()
        })
      }
    },
    // 数据质量数据探查
    getColumnsData({ user = false } = {}) {
      const objectId = this.objectId
      if (objectId) {
        HTTP.getTableColumns({
          objectId: objectId,
          successCallback: data => {
            data.sort((a, b) => {
              return a.ordinal - b.ordinal
            })
            this.explorationData = data
            this.totalItemsExploration = data.length
            let s = this.pageSizeExploration
            let c = this.currentPageExploration
            let value = data.slice(s * (c - 1), s * c)
            this.columnsArr = value
            // this.getAccessibleList(value)
            this.columnsLoaded = true
            this.getProfile({ user: user })
            this.getJobResult()
          },
          // failureCallback:()=>{
          //   this.columnsArr = [];
          //   this.columnsLoaded = true;
          //   console.log('------')
          // }
        })
      }
    },
    getJobResult() {
      this.$http
        .post(this.$meta_url + `/profile/jobResult/${this.objectId}`)
        .then(res => {
          this.profileJobResult = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleClickProfile() {
      this.dialogVisibleProfile = true
    },
    postProfile() {
      this.explorationLoading = true
      const objectId = this.objectId
      if (objectId) {
        HTTP.postTableProfile({
          objectId: objectId,
          successCallback: data => {
            this.profiling = true
            this.$bus.$emit('getTaskJobResult', data, 'profiling')
            clearInterval(this.profilingInterval)
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
    getProfilingState() {
      const objectId = this.objectId
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
              this.getColumnsData({ user: true })
            }
          },
        })
      }
    },
    getProfile({ user = false } = {}) {
      const objectId = this.objectId
      if (objectId) {
        this.profilingTimeStamp = 0
        this.profilingRowCount = 0
        HTTP.getTableProfile({
          objectId: objectId,
          successCallback: data => {
            if (user) {
              if (data.length === 0) {
                // this.$message.info(this.$t('meta.DS.message.noResult'))
              } else {
                // this.$message.success(this.$t('meta.DS.message.updated'))
              }
            }
            this.explorationLoading = false
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
            this.columnsArr.forEach(col => {
              col.profile = columnsProfileMap.get(col.objectId)
            })
            this.columnsProfileKey++
            this.explorationTime = data[0].profileTimestamp
          },
          failureCallback: () => {
            this.explorationLoading = false
          },
        })
      }
    },
    goAssessment(rules) {
      rules.forEach(element => {
        this.datablauJobsRun(element.jobId)
      })
      Promise.all([this.datablauJobsRun()]).then(() => {
        this.getTechRule()
        this.$message.success(this.$t('meta.DS.message.evaluated'))
      })
    },
    datablauJobsRun(id) {
      if (id) {
        this.$http
          .put(this.$url + '/service/datablau_jobs/' + id + '/run')
          .then(res => {
            this.isRun = false
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    jumpTotechRuleName(row) {
      this.$http
        .post(
          this.$quality_url + '/quality/rule/tech/' + row.techRuleId + '/check'
        )
        .then(res => {
          window.open(
            this.BaseUtils.RouterUtils.getFullUrl('qualityRule', {
              id: row.techRuleId,
              blank: true,
            })
          )
        })
        .catch(err => {
          this.$message.error('您暂无权限访问')
        })
    },
    jumpToDomain(row) {
      let domainCode = ''
      var pos = location.href.indexOf('#/')
      var baseUrl = location.href.slice(0, pos + 2)
      HTTP.getDomainDetailByIdService({ domainId: `${row.domainId}` }).then(
        res => {
          domainCode = res.data.domainCode
          window.open(
            baseUrl +
              `domain?domainId=${row.domainId}&domainCode=${domainCode}&fromRule=true`
          )
        }
      )
    },
    addTotechRuleName() {
      var pos = location.href.indexOf('#/')
      var baseUrl = location.href.slice(0, pos + 2)
      window.open(baseUrl + 'main/dataQuality/qualityRule?type=add')
    },
    // 查询收藏次数
    getCollectionNum() {
      const params = {
        objId: this.favoPara.objId,
        typeId: this.favoPara.typeId,
      }
      this.$http.post(this.$url + '/favor/count', params).then(res => {
        this.favoriteCount = res.data
        if (res.data === 0) {
          this.hasCollected = false
        }
      })
    },
    // 收藏
    toggleCollecStatus() {
      this.hasCollected = !this.hasCollected
      const obj = this.favoPara
      const succesedCallback = res => {
        const msg = this.hasCollected
          ? this.$t('meta.DS.message.collectSuccess')
          : this.$t('meta.DS.message.unCollectSuccess')
        this.$message.success(msg)
        this.refreshFavStatus()
        this.checkIfCollected()

        this.getCollectionNum()
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
    // 判断资产的认证权限
    getAuth(id) {
      api
        .judgeAuth(id)
        .then(res => {
          this.propArr.auth = res.data.data
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
    // 其他属性
    getProp() {
      // SHARE_FILE  资产管理模块，点击文件进入的
      // console.log(this.object.type);
      if (
        this.isFloder ||
        this.object.type === 'SHARE_FILE' ||
        this.object.type === 'FILE'
      ) {
        this.$http
          .get(this.$meta_url + `/entities/${this.objectId}/file/prop`)
          .then(res => {
            this.propArr = res.data
            if (this.$route.query.isAssets) {
              this.getAuth(this.objectId)
            }
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        this.$http
          .get(this.$meta_url + `/entities/${this.objectId}/summary/prop`)
          .then(res => {
            this.propArr = res.data
            if (this.$route.query.isAssets) {
              this.getAuth(this.objectId)
            }
            const val = res.data.databaseType.split('_').join('').toUpperCase()
            if (
              val === 'DATADICTIONARY' ||
              val === 'LOGICALDATADICTIONARY' ||
              // val === 'EXCEL' ||
              // val === 'CSV' ||
              val === 'TABLEAU'
            ) {
              this.isFile = true
            } else {
              this.isFile = false
            }
            // 逻辑数据源
            if (val === 'DATADICTIONARYLOGICAL') {
              this.isLogical = true
              this.detailColumnLable = this.$t(
                'meta.DS.tableDetail.column.propTitle'
              )
            } else {
              this.isLogical = false
            }
            // 判断所属系统
            let inSystem = this.currentUserCategory.some(item => {
              return `${item}` === `${res.data.category}`
            })
            if (inSystem) {
              this.inSystem = true
            } else {
              this.inSystem = false
            }
            if (
              !this.dataSecurity &&
              (this.objectType === 'TABLE' || this.objectType === 'VIEW')
            ) {
              this.getColumns()
            }
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    handleCategory(res) {
      this.currentUserCategory = res
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
    // 获取标准登记
    getDomain() {
      this.$http
        .get(this.$meta_url + `/entities/${this.objectId}/domain/rule`)
        .then(res => {
          this.domainRuleArr = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },

    // 获取数据质量
    getTechRule() {
      this.$http
        .get(this.$meta_url + `/entities/${this.objectId}/tech/rule`)
        .then(res => {
          this.techRuleArr = res.data
          this.dataQualityLoading = false
          if (this.techRuleArr.rules.length === 0) {
            this.techRuleArrDisabled = true
          } else {
            this.techRuleArrDisabled = false
          }
          this.techRuleArr.rules.forEach(element => {
            if (element.errorRatio === 1 || element.errorRatio === null) {
              element.errorRatioStyleLeft2 = false
            } else {
              element.errorRatioStyleLeft2 = true
            }
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 获取变更历史
    getChangeHistory() {
      this.$http
        .get(this.$meta_url + `/entities/${this.objectId}/history`)
        .then(res => {
          if (res.data.length > 1) {
            this.disabledCompar = false
          } else {
            this.disabledCompar = true
          }
          this.changeHistoryArr = res.data
          let indexNum = this.changeHistoryArr.length
          this.changeHistoryArr.forEach(element => {
            element.versionIndex = indexNum--
          })
          this.changeHistoryLoading = false
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    updateData() {
      this.updateState = true
      this.getSampleList()
    },
    // 获取采样数据列表
    getSampleList() {
      this.sampleLoading = true
      const requestBody = {
        objectId: this.objectId,
        currentPage: this.currentPageSample,
        pageSize: this.pageSizeSample,
      }
      if (this.updateState) {
        requestBody.reload = true
      }
      this.$http
        .post(this.$meta_url + '/entities/data/sample', requestBody)
        .then(res => {
          const tableData = []
          const typeData = []
          if (res.data !== '') {
            this.totalItemsSample = res.data.total
            const columns = res.data.columns
            // this.columnsArr = res.data.columns
            if (res.data.content.length > 0) {
              res.data.content.forEach(item => {
                const line = {}
                item.forEach((value, index) => {
                  if (value === null) {
                    line[columns[index]] = ''
                  } else {
                    line[columns[index]] =
                      typeof value === 'string' ? value : JSON.stringify(value)
                  }
                })
                tableData.push(line)
              })
            } else {
              res.data.columns.forEach(ele => {
                // console.log(element)
                let obj = {}
                obj[ele] = ''
                tableData.push(obj)
              })
            }
            res.data.type.forEach((item, index) => {
              const line = {}
              line[columns[index]] = item
              line.label = columns[index]
              line.type = line[columns[index]]
              line.chColumns = res.data.chColumns[index]
              line.hasAuth = res.data.hasAuth[index]
              line.typeName = line[columns[index]]
              typeData.push(line)
            })
            let s = this.pageSizeSample
            let c = this.currentPageSample
            this.sampleListArrData = tableData
            this.sampleListArr = tableData.slice(s * (c - 1), s * c)
            this.sampleListType = typeData
          } else {
            this.sampleListArr = []
          }
          this.updateState = false
          this.sampleLoading = false
        })
        .catch(e => {
          this.sampleLoading = false
          this.journalMes = e.response.data.errorMessage
          this.sampleError = e.response.data.errorMessage.includes(
            '该数据源不可采样'
          )
            ? '采集管理中设置为不可采样'
            : '数据采样失败'
          // this.$showFailure(e)
        })
    },
    handleClickJournal() {
      this.dialogVisibleJournal = true
    },
    handleSizeChange(val) {
      this.currentPageSample = 1
      this.pageSizeSample = val
      this.sampleListArr = this.sampleListArrData.slice(
        this.pageSizeSample * (this.currentPageSample - 1),
        this.pageSizeSample * this.currentPageSample
      )
    },
    handleCurrentChange(val) {
      this.currentPageSample = val
      this.sampleListArr = this.sampleListArrData.slice(
        this.pageSizeSample * (this.currentPageSample - 1),
        this.pageSizeSample * this.currentPageSample
      )
    },
    explorationSizeChange(val) {
      this.columnsArr.splice(0, this.columnsArr.length)
      this.pageSizeExploration = val
      this.currentPageExploration = 1
      let array = this.explorationData.slice(0, val)
      array.forEach(element => {
        this.columnsArr.push(element)
      })
    },
    explorationCurrentChange(val) {
      this.columnsArr.splice(0, this.columnsArr.length)
      this.currentPageExploration = val
      let array = this.explorationData.slice(
        this.pageSizeExploration * (val - 1),
        this.pageSizeExploration * val
      )
      array.forEach(element => {
        this.columnsArr.push(element)
      })
    },
    // udp属性
    startEdit(u, index) {
      for (const key in this.tagsTreeArr) {
        for (const arr in this.tagsTreeArr[key]) {
          if (this.tagsTreeArr[key][arr].tag === false) {
            this.$set(this.tagsTreeArr[key][arr], 'editMode', false)
          }
        }
      }
      this.udpValue = u.value.value
      if (u.value.type === 'ENUM') {
        // this.optionsUdp = u.value.typeData.split('\n')
        this.optionsUdp = u.value.typeData.split(';')
      }
      u.editMode = u.value.type
    },
    addPropertyValue(u, i) {
      const propId = u.value.id
      if (this.udpValue === null) {
        u.editMode = false
      } else {
        const requestBody = this.udpValue || ''
        this.$plainRequest
          .post(
            this.$meta_url +
              `/udps/updateItemUdpValue?itemId=${this.summary.objectId}&udpId=${propId}&containerType=80010001&containerId=${this.summary.modelId}`,
            requestBody
          )
          .then(res => {
            u.editMode = false
            u.value.value = this.udpValue
            // this.getTagsTreeArr()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    updatePropertyValue(u, i) {
      const requestBody = this.udpValue || ''
      const valueId = u.value.valId
      const propId = u.value.id
      this.$plainRequest
        .post(
          this.$meta_url +
            `/udps/updateItemUdpValue?itemId=${this.summary.objectId}&udpId=${propId}&containerType=80010001&containerId=${this.summary.modelId}`,
          requestBody
        )
        .then(res => {
          u.editMode = false
          u.value.value = this.udpValue
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    save(u, i) {
      const value = _.trim(this.udpValue || '')
      if (u.value.type === 'NUM' && isNaN(value - 0)) {
        this.$message.info(this.$t('meta.DS.message.fillNum'))
        return
      }
      if (u.value.value && u.value.valId) {
        this.updatePropertyValue(u, i)
      } else {
        this.addPropertyValue(u, i)
      }
    },
    cancel(u) {
      u.editMode = false
    },
    // 获取当前标签
    getTagsTreeArr() {
      if (this.secondBoxHeight === 60) {
        this.heightChange = true
      }
      this.$http
        .post(this.$meta_url + `/tag/tree/summary?objectId=${this.objectId}`)
        .then(res => {
          this.securityList = [
            {
              key: '数据安全等级',
              value: '',
              icon: 'icon-safetylevel',
            },
            {
              key: '重要程度',
              value: '',
              icon: 'icon-importance',
            },
            {
              key: '影响程度',
              value: '',
              icon: 'icon-extent',
            },
            {
              key: '影响对象',
              value: '',
              icon: 'icon-impactobject',
            },
            {
              key: '影响范围',
              value: '',
              icon: 'icon-scope',
            },
          ]
          Object.keys(res.data).map(key => {
            if (key === '标签分组') {
              res.data[key].map(v => {
                const newArray = this.securityList.filter(n => n.key === v.key)
                if (newArray.length > 0) {
                  this.securityList.filter(n => n.key === v.key)[0].value =
                    v.value.name
                }
              })
            }
            // 标签过滤数据安全等级，数据安全等级放入资产属性里面
            const curList = res.data[key].filter(
              item =>
                (item.tag &&
                  item.key !== '数据安全等级' &&
                  item.key !== '重要程度' &&
                  item.key !== '影响程度' &&
                  item.key !== '影响对象' &&
                  item.key !== '影响范围') ||
                !item.tag
            )
            curList.sort((a, b) => {
              if (a.value.order && b.value.order) {
                return a.value.order - b.value.order
              }
            })
            res.data[key].map(item => {
              if (item.tag === false) {
                this.$set(item, 'editMode', false)
              }
            })
            res.data[key] = curList
          })
          this.tagsTreeArr = res.data
          this.loadedTags = this.loadedTagsBefore
          setTimeout(() => {
            if (document.getElementById('secondBox')) {
              this.secondBoxHeight =
                document.getElementById('secondBox').offsetHeight + 60
              this.heightChange = false
            }
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 问答
    getTableRate() {
      const para = {
        objId: this.summary.dataObjectDto.objectId,
        typeId: this.summary.dataObjectDto.typeId,
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
    getColumns() {
      this.$http
        .get(this.$meta_url + '/entities/' + this.objectId + '/columns')
        .then(res => {
          res.data.forEach((col, i) => {
            col.key = (function () {
              let ret = ''
              col.keys.forEach(function (val) {
                switch (val.type) {
                  case 'PrimaryKey':
                    ret += ',PK'
                    break
                  case 'ForeignKey':
                    ret += ',FK'
                    break
                  case 'NonUniqueKey':
                    ret += ',NK'
                    break
                  case 'UniqueKey':
                    ret += ',UK'
                    break
                  default:
                    ret += this.$t('meta.DS.treeSubOperation.unknow')
                    break
                }
              })
              return ret.slice(1)
            })()
            this.$utils.sort.sortConsiderChineseNumber(col.tags, 'name')
          })
          this.data = res.data
          this.colsNameMap = {}
          this.data.forEach(element => {
            element.typeName = element.type
            this.colsNameMap[element.objectId] = element.physicalName
          })
          this.data.sort((x1, x2) => {
            if (x1.ordinal && x2.ordinal) {
              return x1.ordinal - x2.ordinal
            }
          })
          // this.getAccessibleList(this.data)
          this.tableData = this.data.slice(0, 10)
          this.loadingColumns = false
        })
        .catch(e => {
          this.$showFailure(e)
        })
        .then(() => {
          this.$emit('loaded')
        })
    },
    newData(data) {
      let result = data.filter(item => !item.access)
      return result || []
    },
    // 判断字段是否已有权限
    getAccessibleList(datas) {
      this.$http({
        url: this.$url + '/service/auth/check/batch',
        method: 'post',
        data: datas.map(data => ({
          itemType: 80000005,
          itemId: data.objectId,
        })),
      })
        .then(res => {
          datas.forEach(item => {
            this.$set(item, 'access', res.data[item.objectId])
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    goMoreFieldList() {
      this.activeName = 'second'
      this.$refs.fieldColumns.getColumns()
    },
    getDataTop(typeId) {
      // 当为文件时，传入typeID
      let obj = {
        objectId: `${this.objectId}`,
        typeId: typeId || this.summary.dataObjectDto.typeId,
        // typeId: '82800009',
        topNumber: `${this.dataAmount}`,
      }
      this.$http
        .post(this.$url + `/objectVisit/getTopUser`, obj)
        .then(res => {
          this.tableDataTop = res.data.sort(
            (a, b) => b.visitCount - a.visitCount
          )
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleClick(value) {
      this.activeName = value.name
      if (value.name === 'first') {
        if (this.secondBoxHeight === 60) {
          this.getTagsTreeArr()
        }
        this.getSummary('', true)
      } else if (value.name === 'second') {
        this.$refs.fieldColumns.getColumns()
        const innerHeight = window.innerHeight
        this.columnsBoxHeight = innerHeight - 211
      } else if (value.name === 'third') {
        // 采样数据
        this.getSampleList()
        const innerHeight = window.innerHeight
        this.thirdBoxHeight = innerHeight - 240
      } else if (value.name === 'fourth') {
        if (this.$refs.consanguinityGraph) {
          this.$refs.consanguinityGraph.getData()
        } else if (this.$refs['consanguinityGraph-view']) {
          this.$refs['consanguinityGraph-view'].getData()
        }
      } else if (value.name === 'lineage') {
        // console.log('lineage')
      } else if (value.name === 'fifth') {
        // this.$refs.knowledgeGraph.getSearchNodeRelation()
        // 改为在内部进行处理
      } else if (value.name === 'sixth') {
        this.getTechRule()
        // this.getDomain()
        this.getColumnsData()
      } else if (value.name === 'seventh') {
        this.getChangeHistory()
      } else if (value.name === 'eighth') {
        this.$refs.comment.getThread()
      } else if (value.name === 'ninth') {
        this.getSummary()
      } else if (value.name === 'data-atlas') {
        this.$refs.dataViste.dataInit()
      }
    },
    setStyle() {
      const innerHeight = window.innerHeight
      this.thirdBoxHeight = innerHeight - 240
    },
    handleLineageFromApiTables(lineageData) {
      this.apiTablesLoaded = false
      this.lineageFromApiTables = lineageData
      this.lineageKey++
      setTimeout(() => {
        this.apiTablesLoaded = true
      })
    },
    copyToClipboard(type) {
      if (type && type === 'body') {
        if (this.sqlContent) {
          this.$utils.string.setClipBoard(this.packageBody)
          this.$message.success(this.$t('meta.DS.message.copySucceed'))
        } else {
          this.$message.info(this.$t('meta.DS.message.noSql'))
        }
      } else {
        if (this.sqlContent) {
          this.$utils.string.setClipBoard(this.sqlContent)
          this.$message.success(this.$t('meta.DS.message.copySucceed'))
        } else {
          this.$message.info(this.$t('meta.DS.message.noSql'))
        }
      }
    },
    getAll(tag) {
      this.getSummary()
      this.getTagsTreeArr()
      this.checkList.push(tag.tagId + '^' + tag.name)
    },
    changeLink(objectId) {
      var pos = location.href.indexOf('#/')
      var baseUrl = location.href.slice(0, pos + 2)
      window.open(baseUrl + `main/meta?objectId=${objectId}`)
    },
    getPackageRelationships() {
      let data = { objectId: this.objectId }
      this.$http
        .post(
          this.$meta_url +
            `/entities/getPackageRelationships/?objectId=${this.objectId}`,
          data
        )
        .then(data => {
          let linkarr = []
          this.linkid = data.data.forEach(item => {
            linkarr.push({
              objectId: item.objectId,
              type: this.typeMap[item.typeId],
              physicalName: item.physicalName,
            })
          })
          this.linkarr = linkarr
        })
    },
    async getDetail() {
      const url = `/metadata/mm/getMetaModelDetailByDataObjectId`
      let res = await this.$http.post(url, {
        dataObjectId: parseInt(this.object.objectId),
      })
      let data = res.data
      this.summary = data
      // this.typeId = this.summary.properties.TypeId
      this.logicalName = data.dataObjectDto.logicalName
      this.definition = data.dataObjectDto.definition

      let subRelationTabs = []
      let childrenM1Object = this.summary.childrenM1Object || []
      // console.log(childrenM1Object, 'childrenM1Object')
      Object.keys(childrenM1Object).forEach(key => {
        let obj = {
          objectId: this.object.objectId,
          childTypeId: key,
          name: childrenM1Object[key],
        }
        subRelationTabs.push(obj)
      })
      this.subRelationTabs = subRelationTabs
      if (this.subRelationTabs.length > 0) {
        this.subRelationCurrentTab = this.subRelationTabs[0].childTypeId
      }

      let objectProps = {}
      let properties = data.properties
      let propertiesM0 = data.propertiesM0
      Object.keys(properties).forEach(key => {
        properties[key].forEach(element => {
          console.log(element, 'element')
          let obj = {
            labelTitle: key,
            label: element.value,
            value: propertiesM0[element.code],
            id: key,
          }
          if (!objectProps[key]) {
            objectProps[key] = []
          }
          objectProps[key].push(obj)
        })
      })
      this.defaultProperties = data.properties['默认分组']
      this.objectProps = objectProps
      this.visitCountUpdate()
    },
    // 访问统计数量增加
    visitCountUpdate() {
      let url = `/base/objectVisit/updateClickCount`
      this.$http.post(url, {
        objectId: parseInt(this.object.objectId),
        typeId: this.summary.dataObjectDto.typeId,
      })
    },
    getMeteObjIcon() {
      // console.log(this.summary, 'this.summary')
      HTTP.getMetaModelIconNew(this.object.typeId || this.summary.dataObjectDto.typeId)
        .then(res => {
          if (res.data && res.data.size > 0) {
            // 检查返回的blob是否有内容
            const blob = new Blob([res.data], { type: 'image/png' })
            const iconUrl = URL.createObjectURL(blob)
            this.metaModelIcon = iconUrl

            this.$once('hook:beforeDestroy', () => {
              URL.revokeObjectURL(iconUrl)
            })
          } else {
            this.metaModelIcon = metaModelIcon // 设置默认图标
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    async getSummary(type, onlyGet) {
      return false
      const callback = res => {
        this.$utils.sort.sortConsiderChineseNumber(res.data.tags, 'name')
        this.summary = res.data
        localStorage.setItem('summary', JSON.stringify(this.summary))
        if (type && type === 'updateDomainCode' && res.data) {
          this.$refs.domainCodeRef.updateDomainCode(res.data.domainCode, false)
        }
        this.typeId = this.summary.properties.TypeId
        this.logicalName = res.data.logicalName
        this.definition = res.data.definition
        if (this.objectTypeMaybe !== 'unknown') {
          this.objectType = this.objectTypeMaybe
        }
        if (res.data.properties) {
          switch (`${res.data.properties.TypeId}`) {
            case '80500008':
              this.objectType = 'VIEW'
              break
            case '80000004':
              this.objectType = 'TABLE'
              break
            case '80000005':
              this.objectType = 'COLUMN'
              break
            case '80010119':
              this.objectType = 'FUNCTION'
              break
            case '80010118':
              this.objectType = 'STORED_PROCEDURE'
              break
            case '82800024':
              this.objectType = 'PACKAGE'
              break
            default:
              console.error(res.data.properties.TypeId)
              break
          }
        }
        if (
          this.objectType === 'VIEW' ||
          this.objectType === 'STORED_PROCEDURE' ||
          this.objectType === 'FUNCTION' ||
          this.objectType === 'PACKAGE'
        ) {
          if (res.data.properties) {
            this.initSql(
              res.data.properties.SQL,
              res.data.properties.PackageBody
            )
          }
        }
        this.ownerWritable =
          this.summary.owner === this.$user.username || this.$isAdmin
        this.favoPara = {
          typeId: this.summary.properties.TypeId,
          objId: this.objectId,
          objectName: this.summary.logicalName || this.summary.physicalName,
        }
        if (res.data.length !== 0 && this.activeName !== 'ninth') {
          this.getProp()
          this.getCollectionNum()
          if (!this.isAnquan) {
            this.getDataTop()
          }
        }
        this.checkIfCollected()

        this.getNode()
      }
      if (this.summaryFromProps) {
        callback({
          data: this.summaryFromProps,
        })
        this.loading = false
        this.summaryLoaded = true
      } else {
        let last = onlyGet ? 'get' : 'summary'
        const requestUrl = this.$meta_url + `/entities/${this.objectId}/${last}`
        await this.$http
          .get(requestUrl)
          .then(res => {
            if (callback) {
              callback(res)
            }
          })
          .catch(e => {
            this.$showFailure(e)
            this.loading = false
          })
          .then(() => {
            this.loading = false
            this.summaryLoaded = true
          })
      }
    },
    // getFileDetail() {
    //   const id = this.objectId || this.object.id
    //   const url = `${this.$meta_url}/shareFile/folder/${id}`
    //   this.$http
    //     .get(url)
    //     .then(res => {
    //       const data = res.data
    //       this.loading = false
    //       this.summaryLoaded = true
    //       this.ownerWritable = false
    //       data.path = data.path || ''
    //       const obj = {
    //         // shareUser
    //         name: data.name,
    //         writable: true,
    //         owner: data.shareUser,
    //         description: data.description,
    //         size: data.size,
    //         lastModifyTime: data.lastModifyTime,
    //         // path: data.path.substring(6),
    //         path: data.path,
    //         sharePath: data.sharePath,
    //         modelId: data.modelId,
    //         id: data.id,
    //         type: 'FILE',
    //         fileType: data.type,
    //         tags: [],
    //
    //         originData: data,
    //       }
    //       this.summary = obj
    //       this.definition = data.description
    //       this.getObjectBindTags()
    //       this.getObjectBindTagsWidthGroup()
    //       if (this.isFloder) {
    //         this.getNode()
    //         this.favoPara = {
    //           objId: id,
    //           objectName: data.name,
    //           typeId: '82800008',
    //         }
    //       }
    //       this.getProp()
    //       this.getCollectionNum()
    //       this.checkIfCollected()
    //     })
    //     .catch(e => {
    //       this.loading = false
    //       this.$showFailure(e)
    //     })
    // },
    backClick1() {
      this.$emit('close')
    },
    nodeClick1() {},
    initSql(sql, bodysql) {
      const sqlContent = _.trim(sql)
      const packageBody = _.trim(bodysql)
      // this.sqlContent = sqlFormatter.format(sqlContent);
      this.sqlContent = sqlContent
      this.packageBody = packageBody
      this.$nextTick(() => {
        setTimeout(() => {
          Prism.highlightAll()
        })
      })
    },
    handleLogicalNameEdit() {
      if (!this.contentWritable || this.isAssets) {
        return
      }
      this.logicalNameEditing = true
      setTimeout(() => {
        $(this.$refs.logicalName.$el).find('input').focus()
      })
    },
    handleDefinitionEdit() {
      if (!this.contentWritable) {
        return
      }
      this.definitionEditing = true
      setTimeout(() => {
        $(this.$refs.definition.$el).find('input').focus()
      })
    },
    saveLogicalName() {
      this.logicalNameSaving = true
      if (typeof this.logicalName === 'string') {
        this.logicalName = this.logicalName.trim()
      } else if (!this.logicalName) {
        this.logicalName = ''
      }
      const requestUrl =
        this.$meta_url + `/entities/${this.summary.dataObjectDto.id}/summary`
      const requestBody = {
        definition: this.summary.dataObjectDto.definition,
        id: this.summary.dataObjectDto.objectId,
        logicalName: this.logicalName,
      }
      this.$http
        .put(requestUrl, requestBody)
        .then(res => {
          // this.$refs.tagRecommend.recommend()
          this.summary.logicalName = this.logicalName
          this.logicalNameEditing = false
          this.tagRecommendKey++
          if (this.logicalName) {
            $('.box-inner.selected .title>span').text(`(${this.logicalName})`)
          } else {
            $('.box-inner.selected .title>span').text('')
          }
          this.getProp()
        })
        .catch(e => {
          this.$showFailure(e)
        })
        .then(() => {
          this.logicalNameSaving = false
        })
    },
    cancelDefinition() {
      this.definitionEditing = false
      this.getSummary('', true)
    },
    cancelDefinitionFile() {
      this.definitionEditing = false
      this.getFileDetail()
    },
    cancelSaveLogicalName() {
      this.logicalNameEditing = false
      this.getSummary('', true)
    },
    saveDefinition() {
      this.definitionSaving = true
      if (this.object.type === 'REPORT') {
        const requestUrl = `${this.$meta_url}/dataReport/update?updateConditionArea=false&updateResultArea=false&updateRelatedTable=false`
        const requestBody = this.summary
        requestBody.description = this.definition
        this.$http
          .post(requestUrl, requestBody)
          .then(res => {
            this.summary.dataObjectDto.description = this.definition
            this.definitionEditing = false
            this.tagRecommendKey++
          })
          .catch(e => {
            this.definitionSaving = false
            this.$showFailure(e)
          })
      } else if (
        this.object.type === 'FILE' ||
        this.object.type === 'SHARE_FILE'
      ) {
        const url = `${this.$meta_url}/shareFile/folder`
        const description = this.definition || ''
        const body = _.cloneDeep(this.summary.originData)
        body.description = description
        this.$http
          .post(url, body)
          .then(res => {
            this.summary.dataObjectDto.description = description
            this.definition = description
            this.definitionEditing = false
            this.tagRecommendKey++
          })
          .catch(e => {
            this.$showFailure(e)
          })
          .then(() => {
            this.definitionSaving = false
          })
      } else {
        const requestUrl =
          this.$meta_url + `/entities/${this.summary.dataObjectDto.id}/summary`
        const requestBody = {
          definition: this.definition,
          id: this.summary.dataObjectDto.objectId,
          logicalName: this.summary.dataObjectDto.logicalName,
        }
        this.$http
          .put(requestUrl, requestBody)
          .then(res => {
            // this.$refs.tagRecommend.recommend()
            this.summary.definition = this.definition
            this.definitionEditing = false
            this.tagRecommendKey++
          })
          .catch(e => {
            this.$showFailure(e)
          })
          .then(() => {
            this.definitionSaving = false
          })
      }
    },
    tooltipFormatter(tag) {
      if (tag.properties) {
        return JSON.parse(tag.properties).description
      } else {
        return ''
      }
    },
    filterTagNode(value, data) {
      if (!value) {
        return true
      }
      return data.name.indexOf(value) !== -1
    },
    clearTagFilterText() {
      var self = this
      self.tagFilterText = ''
      this.catalogTree1 = _.cloneDeep(this.catalogTree)
    },
    beforeAddTag() {
      setTimeout(() => {
        this.checkListBak = _.cloneDeep(this.checkList)
      })
      this.addTagVisible = true
    },
    loadTagsInitial() {
      this.$http
        .post(this.$url + '/tags/tree')
        .then(res => {
          // console.log(this.objectType)
          if (res.data && Array.isArray(res.data)) {
            this.catalogTree = []
            this.$utils.sort.sortConsiderChineseNumber(res.data)
            res.data.forEach(item => {
              const obj = {
                name: item.name,
                show: true,
                children: [],
              }
              if (item.children && item.children.length > 0) {
                this.$utils.sort.sortConsiderChineseNumber(item.children)
                item.children.forEach(i => {
                  const o = _.cloneDeep(obj)
                  if (!i.name || i.children.length === 0) {
                    o.show = false
                  }
                  o.nameLevel2 = i.name
                  o.children = i.children
                  o.children.forEach(i => {
                    i.show = true
                  })
                  this.catalogTree.push(o)
                })
              } else {
                obj.show = false
                this.catalogTree.push(obj)
              }
            })
            const catelogTree = this.catalogTree.filter(
              item =>
                item.nameLevel2 !== '数据安全等级' &&
                item.nameLevel2 !== '影响程度' &&
                item.nameLevel2 !== '影响对象' &&
                item.nameLevel2 !== '影响范围' &&
                item.nameLevel2 !== '重要程度'
            )
            this.catalogTree = catelogTree
            const catalogTree1 = _.cloneDeep(this.catalogTree).filter(
              item =>
                item.nameLevel2 !== '数据安全等级' &&
                item.nameLevel2 !== '影响程度' &&
                item.nameLevel2 !== '影响对象' &&
                item.nameLevel2 !== '影响范围' &&
                item.nameLevel2 !== '重要程度'
            )
            this.catalogTree1 = catalogTree1
            this.loadedTagsSecond = res.data
            setTimeout(() => {
              if (document.getElementById('secondBox')) {
                this.secondBoxHeight =
                  document.getElementById('secondBox').offsetHeight + 60
              }
            })
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    reloadTags() {
      var self = this
      self.$http
        .post(self.$url + '/tags/getAllTags')
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
            self.tagMap = map
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleClose(tag) {
      this.$http
        .post(
          this.$meta_url +
            '/tag/tags/delete?objectId=' +
            this.objectId +
            `&typeId=${this.summary.properties.TypeId}`,
          [
            {
              name: tag.name,
            },
          ]
        )
        .then(res => {
          // this.$refs.tagRecommend.recommend()
          this.getSummary('', true)
          this.getTagsTreeArr()
          this.summary.tags.forEach((item, index) => {
            if (item.name === tag.name) {
              this.summary.tags.splice(index, 1)
            }
          })
          this.checkList = this.checkList.filter(item => {
            const c = item.split('^')
            if (c[1] === tag.name) {
              return false
            } else {
              return true
            }
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    removeFileTag(tag) {
      // console.log(tag, 'tag')
      // console.log(this.summary, 'summary')
      const id = this.summary.id
      let tagIds = this.summary.tags.map(item => item.tagId)
      // const url = this.$meta_url + '/tags/removeTagsToItems'
      const url = this.$url + '/tags/removeTagsToItems'
      const typeId = this.$commentPreCode.ShareFile

      tagIds = tagIds.filter(item => {
        return item !== tag.tagId
      })
      this.$http
        .post(url, [
          {
            tagId: tag.tagId,
            itemId: id,
            typeId: typeId,
          },
        ])
        .then(res => {
          this.$message.success(this.$t('meta.DS.message.operationSucceed'))
          setTimeout(() => {
            this.getObjectBindTags()
            this.getObjectBindTagsWidthGroup()
          }, 0)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    bindTagToObject() {
      if (this.objectType === 'FILE') {
        const tagIds = this.checkList.map(o => o.split('^')[0])
        const url = `${this.$meta_url}/tag/chooseTagRelations`
        const body = {
          tagIds: tagIds,
          itemIds: [this.objectId || this.object.id],
          type: '4',
          recursive: true,
        }
        this.$http
          .post(url, body)
          .then(res => {
            this.getObjectBindTags()
            this.getObjectBindTagsWidthGroup()
            this.addTagVisible = false
          })
          .catch(e => {
            this.$showFailure(e)
          })
        // this.summary.tags.push(this.selectedTag);
        // this.addTagVisible = false;
      } else {
        this.$http
          .post(
            this.$meta_url +
              `/tag/tags/choose?objectId=${this.objectId}&typeId=${this.summary.dataObjectDto.typeId}`,
            this.checkList.map(o => o.split('^')[0])
          )
          .then(res => {
            this.getSummary('', true)
            // this.$refs.tagRecommend.recommend()
            // this.summary.tags.push(this.selectedTag);
            this.getTagsTreeArr()
            this.addTagVisible = false
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    closeDialog() {
      this.checkList = this.checkListBak
      this.addTagVisible = false
    },
    close() {
      this.$emit('close')
    },
    getObjectBindTags() {
      const id = this.summary.dataObjectDto.objectId
      const typeId = this.summary.dataObjectDto.typeId
      const url = `${this.$url}/tags/getTagsOfItem?itemId=${id}&withoutCategory=true&type=${typeId}`
      this.$http
        .post(url)
        .then(res => {
          this.$set(this.summary, 'tags', res.data)
          // this.summary.tags = res.data
          // 文件类获取TOP用户,为文件时 82800008
          // this.getDataTop('82800008')
          // 文件类获取顶部的部分属性
          // this.getProp()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 新文件标签
    getObjectBindTagsWidthGroup() {
      const id = this.summary.id
      const url = `${this.$url}/tags/getTagsOfItemWithGroup?itemId=${id}&withoutCategory=true&type=82800008`
      this.$http
        .get(url)
        .then(res => {
          this.fileTags = res.data
          // this.getDataTop('82800008')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    selectTagChange(node) {
      var self = this
      if (node && node.category) {
        self.canSelectTag = false
      } else {
        self.canSelectTag = true
      }
      self.selectedTag = node
    },
    addTagCategory() {
      var self = this
      self.addTagUnderCategory(null, true)
    },
    tagTreeNodeRender(createElement, node) {
      var self = this

      var getIcons = function () {
        if (node.data.category) {
          return [
            createElement('span', {
              attrs: {
                class: 'tree-icon folder',
              },
            }),
          ]
        } else {
          return [
            createElement('span', {
              attrs: {
                class: 'tree-icon fa fa-tag',
              },
            }),
          ]
        }
      }
      return createElement(
        'span',
        {
          attrs: {
            class: 'tag-tree-node',
          },
        },
        [
          createElement(
            'span',
            {
              attrs: {},
            },
            [
              getIcons(),
              createElement(
                'span',
                {
                  attrs: {},
                },
                [node.node.label]
              ),
            ]
          ),
        ]
      )
    },
    expandOrContract() {
      $('.row-header .fa-expand')
        .add('.row-header .fa-compress')
        .toggleClass('fa-expand')
        .toggleClass('fa-compress')
      this.$parent.expandOrContractItem()
    },
    jumpToTable(tableId) {
      this.$bus.$emit('jumpToObject', {
        type: 'TABLE',
        object: { objectId: tableId },
      })
    },
    submitObjectOwner() {
      this.showEditOwnerDialog = false
      this.$http
        .put(
          this.$meta_url + '/entities/' + this.summary.objectId + '/owner',
          this.newOwner.name
        )
        .then(res => {
          this.summary.owner = this.newOwner.name
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleEditOwner() {
      if (this.ownerWritable) {
        this.newOwner = null
        this.showEditOwnerDialog = true
      }
    },
    getReportDetail(id) {
      HTTP.getReportDetail({ reportId: id })
        .then(res => {
          this.loading = false
          this.summaryLoaded = true
          this.ownerWritable = false
          this.summary = res.data
          this.definition = res.data.description
          this.getNode()
        })
        .catch(e => {
          this.loading = false
          console.log(e)
        })
    },
    showDataServerDetail() {
      HTTP.getDdsServiceStatus()
        .then(res => {
          const data = res.data
          if (data.ddsEnable) {
            this.ddsEnable = true
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
  },
  watch: {
    tagFilterText(val) {
      if (!val) {
        this.$nextTick(() => {
          this.catalogTree1 = _.cloneDeep(this.catalogTree)
        })
      }
      this.checkListBak = _.cloneDeep(this.checkList)
      let tempTree = _.cloneDeep(this.catalogTree1)
      tempTree.forEach((item, index) => {
        if (
          (item.name && PinyinMatch.match(item.name, this.tagFilterText)) ||
          (item.nameLevel2 &&
            PinyinMatch.match(item.nameLevel2, this.tagFilterText))
        ) {
          if (item.nameLevel2 && item.children && item.children.length > 0) {
            item.show = true
          } else {
            item.show = false
          }
        } else {
          if (
            item.children &&
            item.children.some(o =>
              PinyinMatch.match(o.name, this.tagFilterText)
            )
          ) {
            tempTree[index].children.forEach(o => {
              if (PinyinMatch.match(o.name, this.tagFilterText)) {
                o.show = true
              } else {
                o.show = false
              }
            })
            item.show = true
          } else {
            item.show = false
          }
        }
        return item
      })
      this.catalogTree1 = tempTree
    },
    tagsTreeArr: {
      // 监听的对象
      handler(newVal) {},
      deep: true,
      immediate: true,
    },
    'summary.tags': {
      handler(val) {
        if (val) {
          this.checkList = val.map(
            item => (item.id || item.tagId) + '^' + item.name
          )
        }
      },
      deep: true,
      immediate: true,
    },
    'object.logicalElement': {
      handler(val) {
        if (val) {
          this.detailColumnLable = this.$t(
            'meta.DS.tableDetail.column.propTitle'
          )
          this.isLogical = val
        } else {
          this.isLogical = false
        }
      },
      deep: true,
      immediate: true,
    },
    checkList(val) {
      if (val === true) {
        this.checkList = this.checkListBak
      }
    },
  },
}
