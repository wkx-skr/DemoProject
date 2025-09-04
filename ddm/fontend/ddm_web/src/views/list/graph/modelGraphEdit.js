import DrawGraph from './DrawGraphEdit.js'
import $ from 'jquery'
import HTTP from '@/resource/http'
import $version from '@/resource/version.json'
import tables from '../tables/tables.vue'
import tableDetails from '@/views/list/graph/editComponents/tableDetails.vue'
import viewDetails from '@/views/list/graph/editComponents/viewDetails.vue'
import string from '@/resource/utils/string'
import _, { max } from 'lodash'
import $const from '@/resource/const'
import checkInVersion from '@/views/list/tables/CheckInVersion.vue'
import edgeDetails from '@/views/list/graph/editComponents/edgeDetails'
import createEdgeDetails from '@/views/list/graph/editComponents/createEdgeDetails'
import colDetails from '@/views/list/graph/editComponents/colDetails'
import viewColDetails from '@/views/list/graph/editComponents/viewColDetails'
import diagramDetails from '@/views/list/graph/editComponents/diagramDetails'
import modelDetails from '@/views/list/graph/editComponents/modelDetails'
import opacityComponent from '@/views/list/graph/editComponents/opacityComponent.vue'
import dialogCom from '@/views/list/graph/editComponents/dialogCom'
import namingStandards from '@/views/list/graph/editComponents/namingStandards'
import namingOption from '@/views/list/graph/editComponents/namingOption'
import udp from '@/views/list/graph/editComponents/udp.vue'
import subtypeDetail from '@/views/list/graph/editComponents/subtypeDetail'
import Clickoutside from 'element-ui/src/utils/clickoutside'
import fontFamily from './fontFamily.js'
import colorToRgba from './colorToRgba'
import inElectron from '@/resource/utils/environment'
import { v4 as uuidv4 } from 'uuid'
import LDMTypes from '@constant/LDMTypes'
import sort from '@/resource/utils/sort'
const MxImage = mxImage
function LayerEdit (changes) {
  this.changes = changes
}

function Changes (type, obj) {
  this.type = type
  this.obj = obj
  setTimeout(() => {
    if (this.type === 'insertRelation') {
      window.modelGraphThis.changeReliedTargetTable(this.obj.now.properties.Id, true)
    } else if (this.type === 'modifyRelation') {
      window.modelGraphThis.changeReliedTargetTable(this.obj.now.properties.Id, true)
    } else if (this.type === 'deleteRelation') {
      window.modelGraphThis.changeReliedTargetTable(this.obj.id, false)
    }
  }, 400)
}

const STYLE = {
  W: 'fillColor=#EEE;strokeColor=#DDD',
  G: 'fillColor=#CCC;strokeColor=#DDD',
  WW: 'fillColor=#FFF;strokeColor=#DDD',
  NONE: 'fillColor=#FFF;strokeColor=#FFF;',
  BLACK: 'fillColor=#FFF;strokeColor=#000',
  TITLE: 'fillColor=#F0F0F0;strokeColor=#000',
  TABLE: 'fillColor=transparent;strokeWidth=1;strokeColor=#ddd;dashed=2;',
  VIEW: 'shape=swimlane;fillColor=#FFF;dashed=1',
  OUTLINE: 'strokeColor=#79EE79;fillColor=#B9EEB9;strokeWidth=1',
  TRANSPARENT: 'fillColor=transparent;strokeColor=#transparent',
  COMMENT: 'fillColor=transparent;strokeColor=transparent',
  FIGURE: 'fillColor=transparent;strokeColor=#ddd;strokeWidth=1',
  SubType: 'resizable=0;fillColor=transparent;strokeWidth=1;strokeColor=#000;'
}

export default {
  name: 'modelGraphEdit',
  props: ['editorType', 'currentId', 'currentName', 'currentModel', 'dataByType', 'data', 'modelId', 'from', 'parentCurrentPane', 'diagrams', 'diagram', 'preDiagrams', 'mapIdToDiagramData', 'sumElementNum', 'searchPanelExist', 'loading', 'showViewButton', 'isCassandraOrMongoDB', 'isLogical', 'isConceptual', 'entityTotal', 'isShowSchema', 'transformData', 'diagramsLoading', 'currentPane', 'disabledEdit'],
  components: { tables, tableDetails, checkInVersion, edgeDetails, colDetails, viewDetails, viewColDetails, createEdgeDetails, diagramDetails, modelDetails, opacityComponent, dialogCom, namingStandards, namingOption, udp, subtypeDetail },
  data () {
    return {
      idMaps: new Map(),
      colList: [],
      dataSourceColumnTypeMapping: {},
      columnTypeMapping: {},
      longkey: true,
      udpKey: 0,
      udpSettingVisible: false,
      selectCells: [],
      TypeUniqueIdToColumnDefaultType: {
        '8CE0D4A7-ADAC-4244-A944-EA74815F5AB8': 'STRING', // hive
        'ADECDAAC-D24B-4081-94E2-9D6217ECC5AA': 'VARCHAR(50)', // MariaDB
        '0F691FA0-3FD7-42F1-B868-051B0FFAD10C': 'VARCHAR(50)',
        'b3fa9413-2e92-4927-bc44-ae81ec7d3c8a': 'VARCHAR(50)', // TDSQLMySQL
        'C14A95B1-5FA3-4F1A-9B04-2507E8C96ADE': 'VARCHAR(50)', // CBase
        'AA8FBE2F-EC17-48B4-B7F1-A9AC47525D3F': 'VARCHAR(50)',
        'F3901084-5B9A-4776-86E9-FDEE6F7F87B7': 'VARCHAR(50)',
        '2C85C9CA-D052-467C-8C55-D367D69982CF': 'VARCHAR(50)',
        '139A6B8F-3D10-4C0E-BA3D-8B43131EF06A': 'STRING',
        'F2B1C0D4-1E4E-4CE4-9C98-988191D63C55': 'VARCHAR2(20)',
        '998E48F9-FFEC-4473-A7A0-754C055C0953': 'VARCHAR(50)',
        '4091BC89-EEBB-4E1D-866B-A47707804417': 'CHAR(18)',
        '8EA840A5-37F4-48F8-82D9-1429E42A0FC6': 'string',
        '4AB7D425-7B4A-49C2-A19B-86DD5F911706': 'string',
        '67AE3EBF-8D3B-4E6C-93F5-E35E6CF32C8E': 'VARCHAR(50)',
        '0DD030E7-9412-4ACE-9ED7-E1225DBA2855': 'VARCHAR(20)',
        '84A19E0F-9937-4B5C-8E55-B1AE54BF9352': 'VARCHAR2(50)',
        '1333DCA6-0D18-195A-6EE0-E6FB0D3666FF': 'VARCHAR2(20)',
        '16C864E9-1492-6D39-7E47-763067512DC2': 'VARCHAR(50)',
        '2CE303DB-DE63-7696-8A71-041AF6EB772B': 'VARCHAR(50)',
        '2022EC9E-15F5-DEFF-32B0-DCFABCCDE3EF': 'VARCHAR2(20)',
        '6d977600-5d0d-441b-a85a-d682827d696c': 'VARCHAR(50)',
        '076733be-ee09-4bba-8adb-5d2b48036a42': 'VARCHAR(50)',
        '597095CA-993C-4EF9-8AEE-48E87F7EE7E2': 'VARCHAR(50)',
        '025502f5-3820-4555-9d0f-bbb148840e9a': 'VARCHAR(50)',
        'b6a80960-849e-491e-9283-2042405fba29': 'STRING',
        '45c7074a-0c6e-4b0b-9ef8-6c6fa5242bc0': 'VARCHAR(50)',
        '721ac3dc-dabe-4be2-ae47-cbd6b0a14d80': 'VARCHAR(50)',
        'e8fdd9f9-2d5f-456d-a5f4-de6c17025e23': 'VARCHAR(50)',
        'a5277112-1079-4d90-89e6-a46f00c6c7f0': 'STRING',
        'df57529d-3918-42aa-bc8d-092c2b7c12b4': 'VARCHAR(50)',
        'b86fdec4-da62-4ee2-8c65-1bc221d2a578': 'VARCHAR(50)',
        '097618F2-3A1D-4D4F-A31C-E138217A486A': 'VARCHAR(80)',
        'F9C0CBD3-055C-4E33-8F41-5022062A8DF0': 'VARCHAR(50)',
        '5C9598BC-6906-4EDB-9DDB-A23428E224C2': 'VARCHAR(50)',
        '7865092E-58BE-4096-B824-11BCBA4AA10A': 'VARCHAR(50)',
        '71F0D1C4-D45D-4EB7-BD1A-E45A0B018121': 'VARCHAR(50)',
        '5053d067-62bb-f7ae-7971-f28ac8fdd44b': 'String',
        '647f241e-bf2f-7f19-6754-ec94e1c07bec': 'String',
        'AC2CC521-CFC3-44BD-A838-4CB5E59E856B': 'VARCHAR2(20)'
      },
      preSelectCell: null,
      realDelete: false,
      attributeImg: require('../../../assets/images/mxgraphEdit/attribute.svg'),
      themeUsedImg: require('../../../assets/images/mxgraphEdit/theme-used.svg'),
      commentUsedImg: require('../../../assets/images/mxgraphEdit/comment-used.svg'),
      activeHistoryIndex: -1,
      bgColorImg: require('../../../assets/images/mxgraphEdit/new-icon/bgcolor.svg'),
      fontSizes: [{ 'value': '12' }, { 'value': '13' }, { 'value': '14' }, { 'value': '15' }, { 'value': '16' }, { 'value': '17' }, { 'value': '18' }, { 'value': '19' }, { 'value': '20' }],
      attributeName: (this.isLogical || this.isConceptual) ? '属性' : '字段',
      showResizeButton: false,
      currentCell: null,
      namingOptionKey: 0,
      entityTotalCount: 0,
      isFullScreen: false,
      toolLv1: true,
      toolLv2: false,
      showMenuBox: false,
      toolSelection: true,
      toolSelection1: false,
      currentStyle: {
        StyleFontFamily: null,
        StyleBackColor: null,
        StyleFontBoldItalic: null,
        StyleFontUnderLine: null,
        StyleFontLineThrough: null,
        StyleTextColor: null,
        StyleFontSize: null,
        checkList: null
      },
      styleSetting: {
        checkList: [],
        boCheckList: []
      },
      tmpThemeDataChange: null,
      fontFamily,
      sumElementNumCopy: this.sumElementNum,
      dialogWidth: '600px',
      colDialogWidth: '600px',
      cellDialogData: null,
      editFigureDialog: false,
      objectClassMap: {
        business: 'Datablau.ERD.ShapeBusinessObject',
        table: 'Datablau.ERD.ShapeEntity',
        view: 'Datablau.ERD.ShapeView',
        comment: 'Datablau.ERD.ShapeComment',
        figure: 'Datablau.ERD.ShapeRectangle'
      },
      edgeDialogKey: 1,
      subtypeDialogKey: 1,
      currentTab: this.from === 'tables' ? 'tables' : 'graph',
      tables: [],
      views: [],
      showTabOfTables: false,
      currentTable: this.from === 'tables' ? 'tables' : 'graph',
      dialog: {
        visible: false,
        data: []
      },
      viewDialog: {
        visible: false,
        data: {
        }
      },
      style: {
        navigator: {
          position: 'absolute',
          height: '150px',
          width: '20px',
          bottom: '15px',
          left: '-5px',
          opacity: 0.95
        }
      },
      param: { $This: this, diagramId: this.currentId },
      fixed: false,
      graph: null,
      sliderValue: 0,
      sliderOldValue: 0,
      showOutline: true,
      options4: [],
      needHide: false, // 避免展示后直接隐藏搜索框
      value9: [],
      showReport: false,
      currentReportType: 'WARN',
      reportShowData: [],
      reportWrongData: [],
      reportWarningData: [],
      reportTipsData: [],
      reportTypeMap: {
        'ERROR': '错误',
        'WARN': '警告',
        'INFO': '提示'
      },
      objectMap: {},
      reportTableHeight: 300,
      levelMap: null,
      hightlightType: '',

      isDesignModel: this.isLogical || this.isConceptual,
      showDataType: !(this.isLogical || this.isConceptual), // 逻辑模型默认不显示字段类型
      columnDisplay: 'all',

      showAllColumn: this.currentId && (this.dataByType.diagram[this.currentId]?.properties?.DisplayLevel === 'ShowColumns' || !this.dataByType.diagram[this.currentId]?.properties?.DisplayLevel),
      showKeyColumn: this.currentId && (this.dataByType.diagram[this.currentId]?.properties?.DisplayLevel === 'ShowKeysOnly'),
      showNoColumn: this.currentId && (this.dataByType.diagram[this.currentId]?.properties?.DisplayLevel === 'ShowTableOnly'),

      showPhysicalName: !(this.isLogical || this.isConceptual),
      showLogicalName: true,
      handleCommandTimeout: null,

      showFullScreenBtn: true,
      isLogicalModel: this.isLogical,

      dataReady: false,
      shrink: false,
      scale: 100,
      adaptImg: require('../../../assets/images/mxgraphEdit/new-icon/adapt.svg'),
      adaptImg1: require('../../../assets/images/mxgraphEdit/new-icon/adapt1.svg'),
      adaptImg2: require('../../../assets/images/mxgraphEdit/new-icon/adapt2.svg'),
      adaptImg3: require('../../../assets/images/mxgraphEdit/new-icon/adapt1-1.svg'),
      adaptImg4: require('../../../assets/images/mxgraphEdit/new-icon/adapt1-2.svg'),
      adaptImg5: require('../../../assets/images/mxgraphEdit/new-icon/adapt1-3.svg'),
      namingOptImg: require('../../../assets/images/mxgraphEdit/new-icon/namingOpt.svg'),
      udpImg: require('../../../assets/images/mxgraphEdit/new-icon/udp.svg'),
      fullscreenImg: require('../../../assets/images/mxgraphEdit/new-icon/fullscreen.svg'),
      fullscreenImg1: require('../../../assets/images/mxgraphEdit/new-icon/fullscreen1.svg'),
      dictionaryImg: require('../../../assets/images/mxgraphEdit/new-icon/dictionary.svg'),
      historyImg: require('../../../assets/images/mxgraphEdit/new-icon/history.svg'),
      plusImg: require('../../../assets/images/icon/plus.svg'),
      reduceImg: require('../../../assets/images/icon/reduce.svg'),
      navigatorImg: require('../../../assets/images/icon/navigator.svg'),
      saveImg: require('../../../assets/images/mxgraphEdit/Save.svg'),
      undoImg: require('../../../assets/images/mxgraphEdit/new-icon/pre1.svg'),
      undoGreyImg: require('../../../assets/images/mxgraphEdit/new-icon/pre.svg'),
      redoImg: require('../../../assets/images/mxgraphEdit/new-icon/next.svg'),
      redoGreyImg: require('../../../assets/images/mxgraphEdit/new-icon/next1.svg'),
      tableImg: require('../../../assets/images/mxgraphEdit/Table.svg'),
      viewImg: require('../../../assets/images/mxgraphEdit/View.svg'),
      businessUsedImg: require('../../../assets/images/mxgraphEdit/business-used.svg'),
      businessImg: require('../../../assets/images/mxgraphEdit/Business.svg'),
      commentImg: require('../../../assets/images/mxgraphEdit/Comment.svg'),
      figureImg: require('../../../assets/images/mxgraphEdit/Figure.svg'),
      relationImg: require('../../../assets/images/mxgraphEdit/Indentify.svg'),
      relationImg1: require('../../../assets/images/mxgraphEdit/NoneIndentify.svg'),
      relationImg2: require('../../../assets/images/mxgraphEdit/Mutiple.svg'),
      relationImg3: require('../../../assets/images/mxgraphEdit/Virtual.svg'),
      relationImg4: require('../../../assets/images/mxgraphEdit/RelationView.svg'),
      relationImg5: require('../../../assets/images/mxgraphEdit/SubtypeActive.svg'),
      relationImgUnactive: require('../../../assets/images/mxgraphEdit/IndentifyUnactive.svg'),
      relationImgUnactive1: require('../../../assets/images/mxgraphEdit/NoneIndentifyUnactive.svg'),
      relationImgUnactive2: require('../../../assets/images/mxgraphEdit/MutipleUnactive.svg'),
      relationImgUnactive3: require('../../../assets/images/mxgraphEdit/VirtualUnactive.svg'),
      relationImgUnactive4: require('../../../assets/images/mxgraphEdit/RelationViewUnactive.svg'),
      relationImgUnactive5: require('../../../assets/images/mxgraphEdit/SubtypeUnactive.svg'),
      deleteImg: require('../../../assets/images/mxgraphEdit/new-icon/del.svg'),
      editImg: require('../../../assets/images/mxgraphEdit/new-icon/edit.svg'),
      editcol: require('../../../assets/images/mxgraphEdit/new-icon/editcol.svg'),
      addCol: require('../../../assets/images/mxgraphEdit/new-icon/addcol.svg'),
      up: require('../../../assets/images/mxgraphEdit/new-icon/up.svg'),
      down: require('../../../assets/images/mxgraphEdit/new-icon/down.svg'),
      edit2: require('../../../assets/images/mxgraphEdit/new-icon/edit2.svg'),
      auto: require('../../../assets/images/mxgraphEdit/new-icon/auto.svg'),
      showTypeImg: require('../../../assets/images/mxgraphEdit/ShowType.svg'),
      userImg: require('../../../assets/images/mxgraphEdit/User.svg'),
      tableDialog: false,
      edgeDialog: false,
      createEdgeDialog: false,
      input1: 'T_tab_1(属性1)',
      input2: 'id(流量来源ID)',
      input3: 'T_tab_2(属性2)',
      input4: 'T_tab_3(属性3)',
      input5: 'T_tab_4(属性4)',
      input6: 'T_tab_5(属性5)',
      emptyShapeNum: -700000000,
      emptyTableNum: -500000000,
      emptyEdgeNum: -100000000,
      emptyRelationNum: -20000000,
      deliverNum: {
        emptyColumnNum: -30000000,
        emptyMemberNum: -40000000,
        seed: this.currentModel.seed + 1
      },
      emptyStyleNum: -60000000,
      emptySchemaNum: -800000000,
      hasEdit: false,
      endCardinalityType: [{
        label: '0,1,n',
        value: 'ZeroOneOrMore'
      }, {
        label: '1,n',
        value: 'OneOrMore'
      }, {
        label: '1,1',
        value: 'OneOnly'
      }, {
        label: '0,1',
        value: 'ZeroOrOne'
      }],
      edgeDialogData: {},
      edgeDialogDataShow: {},
      tableDialogData: {},
      tableDialogDataShow: {
        properties: ''
      },
      subtypeDialog: false,
      subtypeDialogData: {},
      subtypeCellData: null,
      getTableHTMLFunction: null,
      getViewHTMLFunction: null,
      getCommentHTMLFunction: null,
      getFigureHTMLFunction: null,
      tableDialogId: null,
      tableDialogCell: null,
      limitedDsApply: false,
      limitedDsApplyConfig: {
        rColDt: false,
        rColChName: false,
        rColName: false
      },
      checkInVersionDialogVisible: false,
      deleteGraph: [],
      deleteEdge: new Set(),
      newPosX: ($(window).width() - $('.left-panel-wrapper.tree-area').width() - 200) / 2,
      newPosY: ($(window).height() - 250) / 2,
      columnTemplate: {
        objectClass: 'Datablau.LDM.EntityAttribute',
        properties: {
          Name: '',
          DataType: ''
        }
      },
      operateType: '',
      currentEdgeType: null,
      secondConfirm: false,
      quitSecondConfirm: false,
      themeDialog: false,
      activeThemeTab: 'table',
      themeData: {},
      themeCreateTemplate: {
        'RelationshipTextColor': 'NamedColor:Black',
        'CommentBorderWidth': 0,
        'EntityBodyBackgroundColor': 'NamedColor:White',
        'EntityShadowSize': {
          'width': 4,
          'height': 4
        },
        'AttributeTextFont': 'Tahoma, 8.25pt',
        'CommentTextColor': 'NamedColor:Black',
        'Name': 'StyleTheme_',
        'EntityRoundingSize': 0,
        'AttributeTextColor': 'NamedColor:Black',
        'EntityHeaderTextColor': 'NamedColor:Black',
        'CommentShadowSize': {
          'width': 0,
          'height': 0
        },
        'FigureBackgroundColor': 'NamedColor:White',
        'RelationshipTextFont': 'Tahoma, 8.25pt',
        'RelationshipLineWidth': 1,
        'EntityHeaderBackgroundColor': 'NamedColor:Control',
        'RawType': 'StyleTheme',
        'RelationshipLineColor': 'ARGBColor:255:85:85:85',
        'TypeId': 80010214,
        'EntityHeaderSelectedColor': 'NamedColor:LightSteelBlue',
        'CommentBackgroundColor': 'ARGBColor:0:255:242:211',
        'FigureBorderWidth': 1,
        'FigureRoundingSize': 0,
        'FigureTextPosition': 'MiddleCenter',
        'FigureTextColor': 'NamedColor:Black',
        'FigureTextFont': 'Tahoma, 8.25pt',
        'CommentTextFont': 'Tahoma, 8.25pt',
        'FigureBorderColor': 'NamedColor:Black',
        'IsFigureBorderDashed': false,
        'CommentBorderColor': 'NamedColor:Black',
        'EntityBorderWidth': 1,
        'CommentShadowColor': 'ARGBColor:70:0:0:0',
        'IsEntityBorderDashed': false,
        'EntityShadowColor': 'ARGBColor:70:0:0:0',
        'EntityHeaderTextFont': 'Arial, 9.75pt, style=Bold',
        'EntityBorderColor': 'NamedColor:Black',
        // 'EntityBorderColor': 'ARGBColor:255:153:153:153',
        'Id': -1,
        'IsCommentBorderDashed': false,
        'EntityHeaderTextAlignment': 'MiddleCenter',
        'BOBackgroundColor': 'NamedColor:White',
        'BOBorderColor': 'NamedColor:Black',
        'BOBorderWidth': 1,
        'IsBOBorderDashed': false,
        'BORoundingSize': 0,
        'BOTextAlignment': 'MiddleCenter',
        'BOTextColor': 'NamedColor:Black',
        'BOTextFont': 'Tahoma, 8.25pt'
      },
      formatThemeDataCopy: {
        EntityShadowSize: {},
        CommentShadowSize: {}
      },
      textAreaPosition: [{
        label: '左上',
        value: 'TopLeft'
      }, {
        label: '左中',
        value: 'MiddleLeft'
      }, {
        label: '左下',
        value: 'BottomLeft'
      }, {
        label: '中上',
        value: 'TopCenter'
      }, {
        label: '居中',
        value: 'MiddleCenter'
      }, {
        label: '中下',
        value: 'BottomCenter'
      }, {
        label: '右上',
        value: 'TopRight'
      }, {
        label: '右中',
        value: 'RightMiddle'
      }, {
        label: '右下',
        value: 'BottomRight'
      }],
      fontStyle: [{
        label: '常规',
        value: ''
      }, {
        label: '斜体',
        value: 'Italic'
      }, {
        label: '加粗',
        value: 'Bold'
      }, {
        label: '加粗斜体',
        value: 'BoldItalic'
      } ],
      // fontStyle: [{
      //   label: 'R',
      //   value: ''
      // }, {
      //   label: 'I',
      //   value: 'Italic'
      // }, {
      //   label: 'B',
      //   value: 'Bold'
      // }],
      colorToRgba,
      editStyleDialg: false,
      currentStyleRelatedShapeTemplate: {},
      pathIds: new Set(),
      editEntityDialog: false,
      editViewDialog: false,
      editCommentDialog: false,
      entityDialogData: {
        tableMsg: {},
        dwMapping: []
      },
      viewDialogData: {
        tableMsg: {}
      },
      commentDialogData: null,

      colDialog: false,
      colDialogData: {
        tableMsg: {}
      },
      colKey: 0,
      viewColDialog: false,
      diagramDialog: false,
      modelDialog: false,
      viewColDialogData: {
        tableMsg: {}
      },
      tableDialogKey: 0,
      viewColKey: 0,
      diagramKey: 0,
      modelKey: 0,
      operationMap: {
        moveSelectCells: '选择元素移动',
        modelCopy: '模型粘贴',
        modifyUdps: '修改UDP',
        insertIndex: '创建索引',
        modifyIndex: '修改索引',
        deleteIndex: '删除索引',
        insertMapping: '创建字段映射',
        modifyMapping: '修改字段映射',
        deleteMapping: '删除字段映射',
        insertCluster: '创建Cluster',
        modifyCluster: '修改Cluster',
        deleteCluster: '删除Cluster',
        insertPartition: '创建分区',
        modifyPartition: '修改分区',
        deletePartition: '删除分区',
        insertRelation: '创建关系',
        modifyRelation: '修改关系',
        deleteRelation: '删除关系',
        insertColumn: '创建字段',
        insertColumnList: '批量创建字段',
        modifyColumn: '修改字段',
        deleteColumn: '删除字段',
        insertSubtype: '创建',
        modifySubtype: '修改',
        deleteSubtype: '删除',
        modifySize: '修改大小',
        modifyPosition: '修改位置',
        deleteShape: '画布删除',
        modifyShape: '修改Shape',
        insertShape: '画布添加',
        insertConnection: '画布新建连接',
        deleteConnection: '画布删除连接',
        modifyConnection: '画布修改连接',
        deleteTable: '实体删除',
        insertTable: '实体插入',
        modifyTableProperties: '实体修改',
        insertView: '视图插入',
        deleteView: '视图删除',
        modifyViewProperties: '视图修改',
        insertComment: '备注插入',
        deleteComment: '备注删除',
        modifyCommentProperties: '备注修改',
        insertTheme: '插入样式',
        modifyTheme: '修改样式',
        deleteTheme: '删除样式',
        applyTheme: '应用样式',
        modifyFigureLayer: '修改图框层次',
        insertSchema: '插入schema ',
        modifySchema: '修改schema ',
        deleteSchema: '删除schema',
        insertDiagram: '插入主题域',
        modifyDiagram: '修改主题域',
        deleteDiagram: '删除主题域',
        modifyModel: '修改模型',
        modifyNamingOption: '修改命名设置',
        modifyNamingOptionAndApply: '修改应用命名设置',
        constituteFigure: '组合',
        cancelConstituteFigure: '取消组合'
      },
      startIdToEndIds: {},
      Changes,
      LayerEdit,
      diagramData: {},
      modelData: {},
      showSearch: false,
      innerWidth: $(window).width(),
      currentColName: '',
      heartCount: 0,
      domainListVisible: false,
      currentDomainList: [],
      checkedDomainList: [],
      callDomain: false,
      dictionaryVisible: false,
      namingOptionVisible: false,
      categoryOrder: [],
      rulecheck: true,
      idSqlMap: new Map()
    }
  },
  computed: {
    diagramUdpsDefault () { // UDP默认值在创建的时候生成
      let udps = new Set()
      this.dataByType.udp.forEach(item => {
        if (item.entityType === 80000006) {
          udps.add(item)
        }
      })
      let res = {}
      udps && udps.forEach(udp => {
        if (udp.DefaultUDPValue !== undefined) {
          res[udp.Id] = udp.DefaultUDPValue
        }
      })
      return res
    },
    tableUdpsDefault () {
      let udps = new Set()
      this.dataByType.udp.forEach(item => {
        if (item.entityType === 80000004) {
          udps.add(item)
        }
      })
      let res = {}
      udps && udps.forEach(udp => {
        if (udp.DefaultUDPValue !== undefined) {
          res[udp.Id] = udp.DefaultUDPValue
        }
      })
      return res
    },
    businessUdpsDefault () {
      let udps = new Set()
      this.dataByType.udp.forEach(item => {
        if (item.entityType === 80100073) {
          udps.add(item)
        }
      })
      let res = {}
      udps && udps.forEach(udp => {
        if (udp.DefaultUDPValue !== undefined) {
          res[udp.Id] = udp.DefaultUDPValue
        }
      })
      return res
    },
    viewUdpsDefault () {
      let udps = new Set()
      this.dataByType.udp.forEach(item => {
        if (item.entityType === 80500008) {
          udps.add(item)
        }
      })
      let res = {}
      udps && udps.forEach(udp => {
        if (udp.DefaultUDPValue !== undefined) {
          res[udp.Id] = udp.DefaultUDPValue
        }
      })
      return res
    },
    colUdpsDefault () {
      let udps = new Set()
      this.dataByType.udp.forEach(item => {
        if (item.entityType === 80000005) {
          udps.add(item)
        }
      })
      let res = {}
      udps && udps.forEach(udp => {
        if (udp.DefaultUDPValue !== undefined) {
          res[udp.Id] = udp.DefaultUDPValue
        }
      })
      return res
    },
    modelType () {
      let mapValue = this.currentModel.modelType
      if (mapValue.toLowerCase() === 'logical') {
        mapValue = '逻辑'
      } else if (mapValue.toLowerCase() === 'logicalbusinessdomain') {
        mapValue = '业务领域-逻辑'
      } else if (mapValue.toLowerCase() === 'logicalbusinessobject') {
        mapValue = '业务对象-逻辑'
      } else if (mapValue.toLowerCase() === 'logicalapp') {
        mapValue = '应用-逻辑'
      } else if (mapValue.toLowerCase() === 'conceptual') {
        mapValue = '概念'
      } else if (mapValue.toLowerCase() === 'conceptualbusinessdomain') {
        mapValue = '业务领域-概念'
      }
      return mapValue
    },
    showTabs () {
      const res = !!(this.currentId || this.tables.length > 0)
      this.$emit('hideTabs', !res)
      return res
    },
    undoDisabled () {
      return this.graph && this.graph.editor && this.graph.editor.undoManager && (this.graph.editor.undoManager.indexOfNextAdd === 0 || (this.graph.editor.undoManager.indexOfNextAdd === 0 && this.graph.editor.undoManager.history.length === 0))
    },
    redoDisabled () {
      return this.graph && this.graph.editor && this.graph.editor.undoManager && (this.graph.editor.undoManager.indexOfNextAdd === this.graph.editor.undoManager.history.length || (this.graph.editor.undoManager.indexOfNextAdd === 0 && this.graph.editor.undoManager.history.length === 0))
    },
    historyList () {
      if (this.graph && this.graph.editor && this.graph.editor.undoManager) {
        // return this.graph.editor.undoManager.history.slice(0, this.graph.editor.undoManager.indexOfNextAdd).map(o => o.changes).filter(o => o)
        return this.graph.editor.undoManager.history.map(o => o.changes).filter(o => o)
      } else {
        return []
      }
    },
    inDialogLayer () {
      return this.viewDialog.visible || this.tableDialog || this.edgeDialog || this.createEdgeDialog || this.secondConfirm || this.themeDialog || this.editStyleDialg || this.editEntityDialog || this.editViewDialog || this.editFigureDialog || this.editCommentDialog || this.colDialog || this.viewColDialog || this.diagramDialog || this.modelDialog || this.namingOptionVisible || this.dictionaryVisible || this.checkInVersionDialogVisible || this.udpSettingVisible
    }
  },
  directives: { Clickoutside },
  mounted () {
    window.modelGraphThis = this
    window.dblClickTimeout = 100
    this.cacluteColumnTypeMap()
    this.LOGICALBUSINESSOBJECTDataSourceColumnTypeMapping = {}
    this.cacluteDataSourceColumnTypeMapping('LOGICALBUSINESSOBJECT', this.LOGICALBUSINESSOBJECTDataSourceColumnTypeMapping) // 计算业务对象逻辑模型到不同数据库的转换，用于信息架构(肯定是业务对象逻辑模型)拖拽表到当前模型的字段类型转换
    this.updateCommonUdp() // 更新公共UDP
    if (inElectron) {
      const { ipcRenderer } = window.require('electron')
      ipcRenderer.on('openSaveDialog', () => {
        this.checkInVersionDialogVisible = true
      })
    }
    window.dragoverHandler = function dragoverHandler (ev) {
      ev.preventDefault()
    }
    window.handleDrop = this.handleDrop
    if (this.editorType === 'model' && !this.disabledEdit) {
      this.heartBeat()
      this.interval = setInterval(() => {
        this.heartBeat()
      }, 1000 * 60)
    }
    // window.dataByType = this.dataByType
    this.limitedDsApply = this.currentModel.limitedDsApply
    if (this.limitedDsApply) {
      this.limitedDsApplyConfig = this.currentModel.limitedDsApplyConfig
    }
    this.$bus.$on('drawGraph', this.drawGraph)
    this.$bus.$on('themeData', this.processThemeData)
    this.$bus.$on('createRelationLayer', this.createRelationLayer)
    this.$bus.$on('createTheme', this.createTheme)
    this.$bus.$on('createComment', this.createComment)
    this.$bus.$on('createView', this.createView)
    this.$bus.$on('createTable', this.createTable)
    this.$bus.$on('createBusiness', this.createBusiness)
    this.$bus.$on('editItem', this.editItem)
    this.$bus.$on('deleteItem', this.deleteItem)
    this.$bus.$on('schemaChange', this.modSchema)
    this.$bus.$on('createSchema', this.createSchema)
    this.$bus.$on('applyThemeToGraph', this.applyThemeToGraph)
    this.$bus.$on('themeDeleted', this.deleteTheme)
    this.$bus.$on('schemaDeleted', this.deleteSchema)
    this.$bus.$on('changeCurrentEdgeType', this.changeCurrentEdgeType)
    this.$bus.$on('clearPathIds', this.clearPathIds)
    this.$bus.$on('editDiagram', this.editDiagram)
    this.$bus.$on('addEntityListener', this.addEntityListener)
    this.$bus.$on('addArchyListener', this.addArchyListener)
    this.$bus.$on('handleMapTableSaveInModelGraphEdit', this.handleMapTableSaveInModelGraphEdit)
    if (this.from !== 'tables') {
      // loading = this.$loading({
      //   lock: true,
      //   text: '正在绘制ER图，请稍候',
      //   spinner: 'el-icon-loading',
      //   background: 'rgba(238,238,238,0.9)'
      // })
      this.getDiagramContent(() => {
        Object.keys(this.dataByType.diagram[this.currentId]).forEach(k => {
          this.$set(this.diagram, k, this.dataByType.diagram[this.currentId][k])
        })
        window.diagram = this.diagram
        this.$bus.$emit('drawGraph')
        this.dataReady = true
        // this.getRulecheck()
        this.prepareZoomData()
      })
      // 获取所有数据实体数据编译拖动到新主题域
      // this.getEntitiesContent(Object.keys(this.dataByType.table))
    } else {
      this.dataReady = true
    }
    this.$bus.$on('modelSliderValueChange', (value) => {
      this.sliderValue = value
    })
    this.getCategories()
    if (!this.disabledEdit) {
      document.addEventListener('keydown', this.escKeydown)
    }
    $(window).resize(this.resetStyle)
    // 解决添加表后，出现空白tab页的问题
    this.$bus.$on('removeBlankTab', (id) => { this.removeTab(id) })
    // todo 考虑使用visibilitychange事件 与 sendBeacon方法搭配使用
    let self = this
    window.addEventListener('beforeunload', function (e) {
      if (self.historyList.length && !inElectron && !self.disabledEdit && self.editorType === 'model') { // editorType === 'model' 表明在编辑页面
        var confirmationMessage = `还有${self.historyList.length}条操作未保存，确定要退出吗？`;
        (e || window.event).returnValue = confirmationMessage // 兼容 Gecko + IE
        return confirmationMessage // 兼容 Gecko + Webkit, Safari, Chrome
      }
    })
    document.documentElement.onfullscreenchange = this.toggleHeader
    window.addEventListener('keydown', this.KeyDown, true)
    if (!this.disabledEdit) {
      document.addEventListener('paste', this.toPaste)
    }
  },
  beforeDestroy () {
    delete window.dblClickTimeout
    clearInterval(this.interval)
    clearTimeout(this.unlockTimer)
    clearTimeout(this.unlockTimer1)
    document.removeEventListener('keydown', this.KeyDown)
    if (!this.disabledEdit) {
      document.removeEventListener('keydown', this.escKeydown)
      document.removeEventListener('paste', this.toPaste)
    }
    if (this.graph) {
      this.graph.destroy()
    }
    this.$bus.$off('drawGraph')
    this.$bus.$off('modelSliderValueChange')
    this.$bus.$off('createRelationLayer')
    this.$bus.$off('themeData')
    this.$bus.$off('createTheme')
    this.$bus.$off('createComment')
    this.$bus.$off('createSchema')
    this.$bus.$off('createView')
    this.$bus.$off('createTable')
    this.$bus.$off('editItem')
    this.$bus.$off('deleteItem')
    this.$bus.$off('schemaChange')
    this.$bus.$off('applyThemeToGraph')
    $(window).unbind('resize', this.resetStyle)
    this.$bus.$off('removeBlankTab')
    this.$bus.$off('themeDeleted')
    this.$bus.$off('schemaDeleted')
    this.$bus.$off('changeCurrentEdgeType')
    this.$bus.$off('clearPathIds')
    this.$bus.$off('editDiagram')
    this.$bus.$off('addEntityListener')
    this.$bus.$off('addArchyListener')
    this.$bus.$off('handleMapTableSaveInModelGraphEdit')
    document.documentElement.onfullscreenchange = null
    window.dragoverHandler = null
    window.handleDrop = null
  },
  methods: {
    handleMapTableSaveInModelGraphEdit (tableData, request, dataSourceColumnTypeMapping) {
      let tabledata = {}
      let viewdata = {}
      for (const key in tableData) {
        if (tableData.hasOwnProperty(key)) {
          if (tableData[key].properties.RawType === 'View') {
            viewdata[tableData[key].properties.Id] = tableData[key]
          } else {
            tabledata[tableData[key].properties.Id] = tableData[key]
          }
        }
      }
      let dataByTypeCopy = {
        comment: {},
        diagram: [],
        relation: {},
        table: tabledata,
        view: viewdata,
        dataSourceColumnTypeMapping: dataSourceColumnTypeMapping,
        currentModel: {}
      }
      this.replaceNewId(dataByTypeCopy)
      setTimeout(() => { // replaceNewId在setTimeout里往dataByType赋的值，所以这里也需要setTimeout
        this.save(request)
      })
    },
    updateCommonUdp () {
      let udpCopy = this.dataByType.udp
      this.$http.get(this.$url + '/udps/').then(res => {
        let udpList = res.data
        sort.sortConsiderChineseNumber(udpList, 'order', 'ascending')
        udpList.forEach(udp => {
          let item = udpCopy.get(udp.udpId)
          if (item) {
            let udpCopyItem = {
              ExtendedEnumStruct: udp.enumValues?.length ? JSON.stringify(udp.enumValues) : '',
              UniqueId: udp.id,
              ExtendedEnumMultiple: udp.multiSelect,
              FriendlyName: udp.name,
              IsRequired: udp.needed,
              entityType: udp.targetTypes[0],
              Id: udp.udpId,
              UdpValueType: udp.valueType,
              ClassName: udp.category,
              Definition: udp.description,
              PageName: udp.tabPage,
              new: false,
              deleted: false,
              modified: true,
              pStructId: udp.udpId + 1,
              ExtendedEnumParentRef: udp.parentUdpId,
              DefaultUDPValue: udp.defaultValue
              // UDPOrder: udp.UDPOrder
            }

            if (Object.keys(udpCopyItem).every(key => {
              if (key === 'new' || key === 'deleted' || key === 'modified' || key === 'pStructId') {
                return true
              } else {
                if (item[key] === udpCopyItem[key]) {
                  return true
                } else if (!item[key] && !udpCopyItem[key]) {
                  return true
                } else {
                  return false
                }
              }
            })) { // udpCopyItem与item完全相同，不用更新

            } else {
              _.merge(item, udpCopyItem)
            }
          } else {
            udpCopy.set(udp.udpId, {
              ExtendedEnumStruct: udp.enumValues?.length ? JSON.stringify(udp.enumValues) : '',
              UniqueId: udp.id,
              ExtendedEnumMultiple: udp.multiSelect,
              FriendlyName: udp.name,
              IsRequired: udp.needed,
              entityType: udp.targetTypes[0],
              Id: udp.udpId,
              UdpValueType: udp.valueType,
              ClassName: udp.category,
              Definition: udp.description,
              PageName: udp.tabPage,
              new: true,
              deleted: false,
              modified: false,
              pStructId: udp.udpId + 1,
              ExtendedEnumParentRef: udp.parentUdpId,
              DefaultUDPValue: udp.defaultValue,
              // UDPOrder: udp.UDPOrder,
              TypeId: 90002032
            })
          }
        })
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    encode (str) {
      // 首先，我们使用 encodeURIComponent 来获得百分比编码的UTF-8，然后我们将百分比编码转换为原始字节，最后存储到btoa里面
      return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes (match, p1) {
          return String.fromCharCode(Number('0x' + p1))
        }))
    },
    decode (str) {
      // 过程：从字节流到百分比编码，再到原始字符串
      return decodeURIComponent(atob(str).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join(''))
    },
    newArchyDragFromTemplate (archyId, archyName) { // 业务对象拖拽
      this.loading.status = true
      this.$http.get(`${HTTP.$archyServerUrl}object/object/elements/tree/${archyId}`).then(async res => {
        try {
          let archyRes = await this.$http.post(`${HTTP.$archyServerUrl}object/object/info/${archyId}?setEntity=${false}`)
          let { modelId, modelPath } = archyRes.data
          let entityMapData = res.data
          Object.values(entityMapData).forEach(item => {
            if (item.objectClass === 'Datablau.LDM.EntityComposite') {
              let tableData = item
              tableData.properties.ModelSourcePath = modelPath
              tableData.properties.ModelSourceType = 'Inherited'
              tableData.properties.ModelSourceRef = `${tableData.properties.Id}|${tableData.properties.UniqueId}|${tableData.properties.LogicalName ? this.encode(tableData.properties.LogicalName) : ''}|${tableData.properties.Name ? this.encode(tableData.properties.Name) : ''}`
              tableData.properties.ModelRef = modelId
              tableData.children?.forEach(item => {
                if (item.objectClass === 'Datablau.LDM.EntityAttribute') {
                  item.properties.ModelSourcePath = modelPath
                  item.properties.ModelSourceType = 'Inherited'
                  item.properties.ModelSourceRef = `${item.properties.Id}|${item.properties.UniqueId}|${item.properties.LogicalName ? this.encode(item.properties.LogicalName) : ''}|${item.properties.Name ? this.encode(item.properties.Name) : ''}||${tableData.properties.LogicalName ? this.encode(tableData.properties.LogicalName) : ''}|${tableData.properties.Name ? this.encode(tableData.properties.Name) : ''}`
                  item.properties.ModelRef = modelId
                }
              })
            }
          })
          console.log(entityMapData)
          // 获取表的数据后，生成diagram中的shape，组装成模型copy的格式，按照模型copy逻辑实现
          let tableListData = Object.values(entityMapData).filter(item => item.objectClass === 'Datablau.LDM.EntityComposite')
          let relationListData = Object.values(entityMapData).filter(item => item.properties.TypeId === 80000007)
          let diagramChunkWidth = Math.ceil(Math.sqrt(tableListData.length))
          let diagramChunkHeight = Math.ceil(tableListData.length / diagramChunkWidth)
          let tableWidth = 120
          let tableHeight = 120
          let paddingWidth = 40
          let paddingHeight = 40
          let maxSeed = 1000000 // 保证新构建的shape和原来的id不重复
          let tableIdToShapeIdMap = {}
          let diagram = tableListData.map((table, index) => {
            let Id = maxSeed++// 模型copy的时候会替换
            let diagramYChunkIndex = Math.floor(index / diagramChunkWidth)
            let diagramXChunkIndex = index % diagramChunkWidth
            let x = diagramXChunkIndex * (tableWidth + paddingWidth) + paddingWidth
            let y = diagramYChunkIndex * (tableHeight + paddingHeight) + paddingHeight
            let res = {
              objectClass: 'Datablau.ERD.ShapeEntity',
              properties: {
                Id,
                Location: { x, y },
                OwneeRef: table.properties.Id,
                Name: table.properties.Name,
                RawType: 'Shape',
                ShapeSize: { width: 120, height: 120 },
                TypeId: 80000008,
                changed: true,
                UniqueId: uuidv4(),
                new: true
              }
            }
            tableIdToShapeIdMap[table.properties.Id] = Id
            return res
          })
          let parentX = 0
          let parentY = 0
          let parentWidth = diagramChunkWidth * (tableWidth + paddingWidth) + paddingWidth
          let parentHeight = diagramChunkHeight * (tableHeight + paddingHeight) + paddingHeight
          if (this.isLogical || this.isConceptual) { // 逻辑模型添加业务对象，物理模型添加图框
            let seedId = maxSeed++
            let Name = `BusinessObject_${this.deliverNum.seed++}`
            tableListData.push({
              objectClass: 'Datablau.LDM.EntityBusinessObject',
              children: [],
              properties: {
                ...this.businessUdpsDefault,
                CommonMemberRefs: tableListData.map(table => table.properties.Id).join(','),
                ColumnOrderArrayRefs: [],
                DataStandardCode: '',
                Id: seedId,
                IsLogicalOnly: false,
                IsPhysicalOnly: false,
                LogicalName: archyName,
                Name,
                RawType: 'Entity',
                TypeId: 80100073,
                changed: true,
                UniqueId: uuidv4(),
                new: true
              }
            })
            let businessShape = {
              objectClass: 'Datablau.ERD.ShapeBusinessObject',
              properties: {
                Id: maxSeed++,
                CompostedShapesRef: diagram.map(item => item.properties.Id).join(','),
                Location: { x: parentX, y: parentY },
                OwneeRef: seedId,
                Name,
                RawType: 'Shape',
                ShapeSize: { width: parentWidth, height: parentHeight },
                TypeId: 80000008,
                changed: true,
                UniqueId: uuidv4(),
                new: true
              }
            }
            if (this.isConceptual) {
              businessShape.properties.ShapeSize.width = 120
              businessShape.properties.ShapeSize.height = 120
            }
            diagram.push(businessShape)
          } else {
            let seedId = maxSeed++
            let Name = archyName
            diagram.push({
              objectClass: 'Datablau.ERD.ShapeRectangle',
              properties: {
                Id: seedId,
                CompostedShapesRef: diagram.map(item => item.properties.Id).join(','),
                Location: { x: parentX, y: parentY },
                Name,
                Text: archyName,
                OrderNumber: 0,
                RawType: 'Shape',
                ShapeSize: { width: parentWidth, height: parentHeight },
                TypeId: 80000008,
                changed: true,
                UniqueId: uuidv4(),
                new: true
              }
            })
          }
          let subtypeRelationData = relationListData.filter(relation => relation.objectClass === 'Datablau.LDM.RelationshipSubtype')
          let normalRelationData = relationListData.filter(relation => relation.objectClass !== 'Datablau.LDM.RelationshipSubtype')
          diagram = diagram.concat(normalRelationData.map(relation => {
            let edgeType = relation.objectClass.slice(25)
            let Name = 'Connection_' + this.deliverNum.seed++
            let connection = {
              objectClass: edgeType === 'Relational' ? 'Datablau.ERD.ConnectionRelational' : edgeType === 'View' ? 'Datablau.ERD.ConnectionVirtualView' : edgeType === 'Virtual' ? 'Datablau.ERD.ConnectionVirtual' : edgeType === 'editDisabled' ? 'Datablau.ERD.ConnectionVirtualLine' : edgeType === 'ManyToMany' ? 'Datablau.ERD.ConnectionRelationalManyToMany' : 'Datablau.ERD.Connection',
              properties: {
                BendPoints: '',
                ChildShapeRef: tableIdToShapeIdMap[relation.properties.ChildEntityRef],
                EndOrientation: '',
                Id: maxSeed++,
                Name,
                OwneeRef: relation.properties.Id,
                ParentShapeRef: tableIdToShapeIdMap[relation.properties.ParentEntityRef],
                RawType: 'Connection',
                StartOrientation: '',
                TypeId: 80000009,
                UniqueId: uuidv4(),
                new: true
              }
            }
            return connection
          }))
          let subtypeIdToShapeDetail = {}
          subtypeRelationData.forEach(relation => {
            if (relation.properties.SubTypeRef) {
              let subtypeShape = subtypeIdToShapeDetail[relation.properties.SubTypeRef]
              let sourceShape = diagram.find(shape => shape.properties.OwneeRef === relation.properties.ParentEntityRef)
              let targetShape = diagram.find(shape => shape.properties.OwneeRef === relation.properties.ChildEntityRef)
              if (!subtypeShape) { // 主题域不存在subtypeShape
                // 主题域添加subtypeShape,创建subtypeshape到实体的关系
                let subtypeShapeId = maxSeed++
                let subtype = entityMapData[relation.properties.ParentEntityRef]?.children?.find(item => item.properties.Id === relation.properties.SubTypeRef)
                subtypeShape = {
                  properties: {
                    Location: {
                      x: parseInt((sourceShape.properties.Location.x + sourceShape.properties.ShapeSize.width / 2 + targetShape.properties.Location.x + targetShape.properties.ShapeSize.width / 2) / 2),
                      y: parseInt((sourceShape.properties.Location.y + sourceShape.properties.ShapeSize.height / 2 + targetShape.properties.Location.y + targetShape.properties.ShapeSize.height / 2) / 2)
                    },
                    ShapeSize: {
                      width: 40,
                      height: 20
                    },
                    Name: subtype.properties.Name,
                    SubTypeRef: subtype.properties.Id,
                    TypeId: LDMTypes.Shape,
                    Id: subtypeShapeId,
                    UniqueId: uuidv4(),
                    new: true
                  },
                  objectClass: 'Datablau.ERD.ShapeSubtype'
                }
                subtypeIdToShapeDetail[subtypeShape.properties.SubTypeRef] = subtypeShape
                diagram.push(subtypeShape)
              }
              let connection = {
                objectClass: 'Datablau.ERD.ConnectionSubtype',
                properties: {
                  BendPoints: '',
                  ChildShapeRef: targetShape.properties.Id,
                  EndOrientation: '',
                  Id: maxSeed++,
                  Name: `Connection_${this.deliverNum.seed++}`,
                  OwneeRef: relation.properties.Id,
                  ParentShapeRef: subtypeShape.properties.Id,
                  RawType: 'Connection',
                  StartOrientation: '',
                  TypeId: 80000009,
                  UniqueId: uuidv4(),
                  new: true
                }
              }
              diagram.push(connection)
            } else { // topRelation
              let subTypeRef = relation.properties.ChildEntityRef
              let subtypeShape = subtypeIdToShapeDetail[subTypeRef]
              let sourceShape = diagram.find(shape => shape.properties.OwneeRef === relation.properties.ParentEntityRef)
              if (!subtypeShape) { // 主题域不存在subtypeShape
                // 主题域添加subtypeShape,创建subtypeshape到实体的关系
                let subtypeShapeId = maxSeed++
                let subtype = entityMapData[relation.properties.ParentEntityRef]?.children?.find(item => item.properties.Id === subTypeRef)
                subtypeShape = {
                  properties: {
                    Location: {
                      x: parseInt(sourceShape.properties.Location.x + sourceShape.properties.ShapeSize.width + paddingWidth / 2),
                      y: parseInt(sourceShape.properties.Location.y + sourceShape.properties.ShapeSize.height + paddingHeight / 2)
                    },
                    ShapeSize: {
                      width: 40,
                      height: 20
                    },
                    Name: subtype.properties.Name,
                    SubTypeRef: subtype.properties.Id,
                    TypeId: LDMTypes.Shape,
                    Id: subtypeShapeId,
                    UniqueId: uuidv4(),
                    new: true
                  },
                  objectClass: 'Datablau.ERD.ShapeSubtype'
                }
                subtypeIdToShapeDetail[subtypeShape.properties.SubTypeRef] = subtypeShape
                diagram.push(subtypeShape)
              }
              let connection = {
                objectClass: 'Datablau.ERD.ConnectionSubtype',
                properties: {
                  BendPoints: '',
                  ChildShapeRef: subtypeShape.properties.Id,
                  EndOrientation: '',
                  Id: maxSeed++,
                  Name: `Connection_${this.deliverNum.seed++}`,
                  OwneeRef: relation.properties.Id,
                  ParentShapeRef: sourceShape.properties.Id,
                  RawType: 'Connection',
                  StartOrientation: '',
                  TypeId: 80000009,
                  UniqueId: uuidv4(),
                  new: true
                }
              }
              diagram.push(connection)
            }
          })
          let dataByTypeCopy = {
            comment: {},
            diagram,
            relation: { ...(relationListData.reduce((obj, relation) => ({
              ...obj,
              [relation.properties.Id]: relation
            }), {})) },
            table: { ...(tableListData.reduce((obj, table) => ({
              ...obj,
              [table.properties.Id]: table
            }), {})) },
            view: {},
            dataSourceColumnTypeMapping: this.LOGICALBUSINESSOBJECTDataSourceColumnTypeMapping,
            currentModel: {}
          }
          this.replaceNewId(dataByTypeCopy)
        } catch (err) {
          console.log(err)
          this.loading.status = false
        }
      }).catch(err => {
        this.$showFailure(err)
        this.loading.status = false
      })
    },
    newEntityDragFromTemplate (modelId, entityId, versionId, archyId, x, y) { // 实体拖拽
      this.loading.status = true
      this.$http.post(this.$url + `/models/${modelId}/elements/${entityId}/content/json?longKey=true&versionId=${versionId}`).then(async res => {
        try {
          let archyRes = await this.$http.post(`${HTTP.$archyServerUrl}object/object/info/${archyId}?setEntity=${false}`)
          let modelPath = archyRes.data.modelPath
          let tableData = this.transformData(res.data)
          tableData.properties.ModelSourcePath = modelPath
          tableData.properties.ModelSourceType = 'Inherited'
          tableData.properties.ModelSourceRef = `${entityId}|${tableData.properties.UniqueId}|${tableData.properties.LogicalName ? this.encode(tableData.properties.LogicalName) : ''}|${tableData.properties.Name ? this.encode(tableData.properties.Name) : ''}`
          tableData.properties.ModelRef = modelId
          tableData.children?.forEach(item => {
            if (item.objectClass === 'Datablau.LDM.EntityAttribute') {
              item.properties.ModelSourcePath = modelPath
              item.properties.ModelSourceType = 'Inherited'
              item.properties.ModelSourceRef = `${item.properties.Id}|${item.properties.UniqueId}|${item.properties.LogicalName ? this.encode(item.properties.LogicalName) : ''}|${item.properties.Name ? this.encode(item.properties.Name) : ''}||${tableData.properties.LogicalName ? this.encode(tableData.properties.LogicalName) : ''}|${tableData.properties.Name ? this.encode(tableData.properties.Name) : ''}`
              item.properties.ModelRef = modelId
            }
          })
          tableData.children = tableData.children.filter(item => item.properties.KeyGroupType !== 'ForeignKey') // 过滤主键关系的外键
          console.log(tableData)
          // 获取表的数据后，生成diagram中的shape，组装成模型copy的格式，按照模型copy逻辑实现
          let dataByTypeCopy = {
            comment: {},
            diagram: [{
              objectClass: 'Datablau.ERD.ShapeEntity',
              properties: {
                Id: 1000000, // 模型copy的时候会替换
                Location: { x, y },
                OwneeRef: entityId,
                Name: tableData.properties.Name,
                RawType: 'Shape',
                ShapeSize: { width: 120, height: 120 },
                TypeId: 80000008,
                changed: true,
                UniqueId: uuidv4(),
                new: true
              }
            }],
            relation: {},
            table: {
              [entityId]: tableData
            },
            view: {},
            dataSourceColumnTypeMapping: this.LOGICALBUSINESSOBJECTDataSourceColumnTypeMapping,
            currentModel: {}
          }
          this.replaceNewId(dataByTypeCopy)
        } catch (err) {
          console.log(err)
          this.loading.status = false
        }
      }).catch(err => {
        this.$showFailure(err)
        this.loading.status = false
      })
    },
    addArchyListener () {
      Array.from(document.querySelectorAll(`.business-model-archy`)).forEach(businessObj => {
        mxUtils.makeDraggable(businessObj, this.graph.graph, (graph, evt, cell, x, y) => {
          let $businessObj = $(businessObj)
          let archyId = $businessObj.attr('id')
          let archyName = $businessObj.find('.name-wrapper').text()
          this.newArchyDragFromTemplate(archyId, archyName)
        }, businessObj.cloneNode(true), -15, -15, true, false, false)
      })
    },
    addEntityListener (archyId) {
      Array.from(document.querySelectorAll(`.table-archy[parentId='${archyId}']`)).forEach(table => {
        mxUtils.makeDraggable(table, this.graph.graph, (graph, evt, cell, x, y) => {
          let combinedId = $(table).attr('id')
          let arr = combinedId.split('/')
          let logicalModelVersionId = $(table).attr('logicalModelVersionId')
          this.newEntityDragFromTemplate(+arr[0], +arr[1], +logicalModelVersionId, archyId, x, y)
        }, table.cloneNode(true), -15, -15, true, false, false)
      })
    },
    formatThemeData () {
      let obj = {}
      let themeCreateTemplateCopy = _.cloneDeep(this.themeCreateTemplate)
      _.merge(themeCreateTemplateCopy, this.themeData)
      for (let key in themeCreateTemplateCopy) {
        if (themeCreateTemplateCopy.hasOwnProperty(key)) {
          if (key.indexOf('Color') !== -1) {
            let color = DrawGraph.colorFormatter(themeCreateTemplateCopy[key])
            if (this.colorToRgba[color]) {
              obj[key] = this.colorToRgba[color]
            } else {
              obj[key] = color
            }
          } else if (key.indexOf('TextFont') !== -1) {
            let value = themeCreateTemplateCopy[key]
            let arr = value.split(',')
            obj[key + 'Family'] = null
            obj[key + 'Size'] = null
            obj[key + 'BoldItalic'] = ''
            obj[key + 'UnderLine'] = false
            obj[key + 'LineThrough'] = false
            if (arr.length >= 2) {
              obj[key + 'Family'] = arr[0]
              obj[key + 'Size'] = +arr[1].slice(0, -2)
              if (value.indexOf('Bold') !== -1) {
                obj[key + 'BoldItalic'] += 'Bold'
              }
              if (value.indexOf('Italic') !== -1) {
                obj[key + 'BoldItalic'] += 'Italic'
              }
              if (value.indexOf('Underline') !== -1) {
                obj[key + 'UnderLine'] = true
              }
              if (value.indexOf('Strikeout') !== -1) {
                obj[key + 'LineThrough'] = true
              }
            }
          } else {
            obj[key] = themeCreateTemplateCopy[key]
          }
        }
      }
      return obj
    },
    toPaste (e) {
      console.log(e, 'eee')
      if (this.inDialogLayer || (e.target?.className === 'el-input__inner') || (e.target?.className === 'el-textarea__inner')) {
        return
      }
      e.preventDefault()
      this.modelPaste(e)
    },
    cacluteColumnTypeMap () {
      this.columnTypeMapping = {} // 用于数据标准Logical数据库类型到当前模型的的数据类型转换
      this.dataSourceColumnTypeMapping = {} // 用户模型copy的数据类型转换的准备
      this.$http.get(this.$url + '/service/datatype/LOGICAL').then(res => { // Logical 映射表用于数据标准
        let mappingObj = res.data.datatypeMap && res.data.datatypeMap[this.currentModel.modelType.toUpperCase()]
        if (mappingObj) {
          for (let SourceDatatype in mappingObj) {
            this.columnTypeMapping[SourceDatatype.toUpperCase()] = {
              SourceDatatype,
              TargetDatatype: mappingObj[SourceDatatype]
            }
          }
        }
      }).catch(err => {
        this.$showFailure(err)
      }).finally(() => {
        if (this.currentModel.DatatypeMappings) { // 工具箱 映射表用于数据标准和模型copy
          let { DatatypeSettingList } = JSON.parse(this.currentModel.DatatypeMappings)
          DatatypeSettingList.forEach(map => {
            let res = map.SourceDatatype.match(/([\s\S]+)(\(\)$|\(,\)$)/)
            if (res && res[1]) {
              if (map.SourceDB === 'Logical' && map.TargetDB === this.currentModel.modelType) {
                this.columnTypeMapping[res[1].toUpperCase()] = map
              }
              if (map.SourceDB === this.currentModel.modelType) {
                if (!this.dataSourceColumnTypeMapping[map.TargetDB.toUpperCase()]) {
                  this.dataSourceColumnTypeMapping[map.TargetDB.toUpperCase()] = {}
                }
                this.dataSourceColumnTypeMapping[map.TargetDB.toUpperCase()][res[1].toUpperCase()] = map
              }
            } else {
              if (map.SourceDB === 'Logical' && map.TargetDB === this.currentModel.modelType) {
                this.columnTypeMapping[map.SourceDatatype.toUpperCase()] = map
              }
              if (map.SourceDB === this.currentModel.modelType) {
                if (!this.dataSourceColumnTypeMapping[map.TargetDB.toUpperCase()]) {
                  this.dataSourceColumnTypeMapping[map.TargetDB.toUpperCase()] = {}
                }
                this.dataSourceColumnTypeMapping[map.TargetDB.toUpperCase()][map.SourceDatatype.toUpperCase()] = map
              }
            }
          })
        }
      })
      this.$http.get(this.$url + '/service/datatype/' + (this.currentModel.modelType.toUpperCase() === 'GAUSSA' ? 'GAUSSDBA' : this.currentModel.modelType.toUpperCase())).then(res => { // 用于模型copy
        let datatypeMap = res.data.datatypeMap
        for (let datatype in datatypeMap) {
          for (let SourceDatatype in datatypeMap[datatype]) {
            let value = datatypeMap[datatype][SourceDatatype]
            if (!this.dataSourceColumnTypeMapping[datatype]) {
              this.dataSourceColumnTypeMapping[datatype] = {}
            }
            if (!this.dataSourceColumnTypeMapping[datatype][SourceDatatype.toUpperCase()]) { // 保证工具箱优先
              this.dataSourceColumnTypeMapping[datatype][SourceDatatype.toUpperCase()] = {
                SourceDatatype,
                TargetDatatype: value
              }
            }
          }
        }
        this.currentModel.dataSourceColumnTypeMapping = this.dataSourceColumnTypeMapping
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    cacluteDataSourceColumnTypeMapping (modelType, dataSourceColumnTypeMapping) { // 计算某一种modelType映射到其他模型类型的转换表
      if (this.currentModel.DatatypeMappings) { // 工具箱
        let { DatatypeSettingList } = JSON.parse(this.currentModel.DatatypeMappings)
        DatatypeSettingList.forEach(map => {
          let res = map.SourceDatatype.match(/([\s\S]+)(\(\)$|\(,\)$)/)
          if (res && res[1]) {
            if (map.SourceDB === modelType) {
              if (!dataSourceColumnTypeMapping[map.TargetDB.toUpperCase()]) {
                dataSourceColumnTypeMapping[map.TargetDB.toUpperCase()] = {}
              }
              dataSourceColumnTypeMapping[map.TargetDB.toUpperCase()][res[1].toUpperCase()] = map
            }
          } else {
            if (map.SourceDB === modelType) {
              if (!dataSourceColumnTypeMapping[map.TargetDB.toUpperCase()]) {
                dataSourceColumnTypeMapping[map.TargetDB.toUpperCase()] = {}
              }
              dataSourceColumnTypeMapping[map.TargetDB.toUpperCase()][map.SourceDatatype.toUpperCase()] = map
            }
          }
        })
      }
      this.$http.get(this.$url + '/service/datatype/' + (modelType.toUpperCase() === 'GAUSSA' ? 'GAUSSDBA' : modelType.toUpperCase())).then(res => { // 用于模型copy
        let datatypeMap = res.data.datatypeMap
        for (let datatype in datatypeMap) {
          for (let SourceDatatype in datatypeMap[datatype]) {
            let value = datatypeMap[datatype][SourceDatatype]
            if (!dataSourceColumnTypeMapping[datatype]) {
              dataSourceColumnTypeMapping[datatype] = {}
            }
            if (!dataSourceColumnTypeMapping[datatype][SourceDatatype.toUpperCase()]) { // 保证工具箱优先
              dataSourceColumnTypeMapping[datatype][SourceDatatype.toUpperCase()] = {
                SourceDatatype,
                TargetDatatype: value
              }
            }
          }
        }
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    handleDrop (e, isPrimaryColumn = false) {
      e.stopPropagation()
      let isView = false
      let tableNode = e.currentTarget
      if (e.currentTarget.className === 'svg-view') {
        isView = true
      }
      let tableId = parseInt(tableNode.getAttribute('data-oween-id'))
      let data = e.dataTransfer.getData('domain-info')
      let data2 = e.dataTransfer.getData('domain-list')
      // 拖的是单个标准时,只新建一个字段
      let table = isView ? this.dataByType.view[tableId] : this.dataByType.table[tableId]
      let cols = table.children && table.children.filter(v => v.objectClass === 'Datablau.LDM.EntityAttribute' && !v.properties.deleted)
      let maxId = cols ? this.getMaxId(cols) : 0
      let cell = this.graph.graph.getDefaultParent().children.find(cell => cell.OwneeRef === tableId)
      if (isNaN(maxId) || !isFinite(maxId)) {
        maxId = 0
      }
      if (data) {
        let domain = data && JSON.parse(data)
        // 要继承英文名时要判断是否重名
        let currentCols = cols || []
        if (currentCols.length > 0 && domain.inheritType.includes('abbrivation') && currentCols.some(v => v.properties.Name === domain['abbrivation'])) {
          this.$DatablauCofirm('此标准的英文缩写已存在，该标准将不能应用到新' + this.attributeName + '上。是否继续？', '命名冲突', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            let newCol = this.getNewDomainCol(maxId, domain, true)
            this.renderNewCol(newCol, table, cell, true, isView, isPrimaryColumn)
          }).catch(() => {
            // 取消则什么都不做
          })
        } else {
          // 不需要继承英文名
          let newCol = this.getNewDomainCol(maxId, domain, false)
          this.renderNewCol(newCol, table, cell, true, isView, isPrimaryColumn)
        }
      } else if (data2) {
        let domainObj = JSON.parse(data2)
        this.$emit('modelLoading', true)
        // const obj = {
        //   domainState: 'A',
        //   folderId: domainObj.foldId,
        //   submitter: '',
        //   firstPublishStart: null,
        //   firstPublishEnd: null,
        //   ownerOrg: '',
        //   orderColumn: ['createTime'],
        //   ascOrder: [false],
        //   currentPage: 1,
        //   pageSize: 20
        // }
        this.$http.get(`${this.$url}/service/domains/category/${domainObj.foldId}`).then(res => {
          let tableData = res.data
          if (tableData.length > 0) {
            this.domainListVisible = true
            this.currentDomainList = tableData
          } else {
            this.$message.warning('提示：子目录的标准不会被引用；当前目录下没有已发布的标准。')
          }
          this.$emit('modelLoading', false)
          this.currentDomainTableVar = { table, domainObj, maxId, cell, cols }
          this.isPrimaryColumn = isPrimaryColumn
        }).catch(e => {
          this.$emit('modelLoading', false)
          console.error(e)
          this.$showFailure(e)
        })
      }
    },
    handleThemeSettingOpen () {
      if (this.formatThemeDataCopy.EntityHeaderTextFontBoldItalic === 'BoldItalic') {
        this.styleSetting.checkList = ['Bold', 'Italic']
      } else {
        this.styleSetting.checkList = [this.formatThemeDataCopy.EntityHeaderTextFontBoldItalic]
      }
      if (this.formatThemeDataCopy.BOTextFontBoldItalic === 'BoldItalic') {
        this.styleSetting.boCheckList = ['Bold', 'Italic']
      } else {
        this.styleSetting.boCheckList = [this.formatThemeDataCopy.BOTextFontBoldItalic]
      }
    },
    showNormal () {
      clearTimeout(this.lv2Timer)
      this.toolLv2 = false
      this.lv1Timer = setTimeout(() => {
        this.toolLv1 = true
      }, 500)
    },
    showExtend () {
      clearTimeout(this.lv1Timer)
      this.toolLv1 = false
      this.lv2Timer = setTimeout(() => {
        this.toolLv2 = true
      }, 500)
    },
    handleStyleListChange (list) {
      if (list.indexOf('Bold') > -1 && list.indexOf('Italic') > -1) {
        this.currentStyle.StyleFontBoldItalic = 'BoldItalic'
      } else if (list.length > 0) {
        this.currentStyle.StyleFontBoldItalic = list[0]
      } else {
        this.currentStyle.StyleFontBoldItalic = ''
      }
      this.handleTextFormChange()
    },
    handleStyleListChange2 (event, target, key, checkListName) {
      let list = this.styleSetting[checkListName]
      if (list.indexOf('Bold') > -1 && list.indexOf('Italic') > -1) {
        this.$set(target, key, 'BoldItalic')
      } else if (list.length > 0) {
        let idx = list.indexOf('Bold')
        if (idx >= 0) {
          this.$set(target, key, 'Bold')
        } else {
          idx = list.indexOf('Italic')
          if (idx >= 0) {
            this.$set(target, key, 'Italic')
          }
        }
        if (list.length === 1 && list[0] === '') {
          this.$set(target, key, '')
        }
      } else {
        this.$set(target, key, '')
      }
    },
    handleResize (isResizeWidth, isResizeHeight) {
      if (!this.showResizeButton) {
        return
      }
      let cell = this.currentCell
      let $table = cell.isView ? $('#consa-graph').find(`.svg-view[view-id=${cell.OwneeRef}]`) : $('#consa-graph').find(`.svg-table[data-oween-id=${cell.OwneeRef}]`)
      let preWidth = $table.width() + 2
      let preHeight = $table.height() + 2
      let width = 120
      $table.find('.svg-col').each((i, col) => {
        let tmp = $(col).find('span').width() + 40
        if (tmp > width) {
          width = tmp
        }
      })
      if (!$table[0]?.querySelector('.table-body')) {
        return
      }
      let innerHeight = $table[0].querySelector('.table-body').clientHeight
      let height = $table.find('.svg-tName').height() + innerHeight + 20
      if (isResizeWidth && !isResizeHeight) {
        height = preHeight
      }
      if (isResizeHeight && !isResizeWidth) {
        width = preWidth
      }
      if (this.showNoColumn) {
        height = 30
      }
      let shape = this.dataByType.diagram[this.currentId].children.find(item => item.properties.Id === cell.Id)
      shape.properties.ShapeSize.height = height
      shape.properties.ShapeSize.width = width
      shape.properties.changed = true
      cell.geometry.width = width
      cell.geometry.height = height
      cell.changed = true
      let tableOrView = this.graph.dataByType[cell.isView ? 'view' : cell.isTable ? 'table' : cell.isComment ? 'comment' : 'table'][cell.OwneeRef]
      if (tableOrView && tableOrView.posit) {
        const posit = tableOrView.posit
        posit.ShapeSize.width = width
        posit.ShapeSize.height = height
      }
      cell.value = cell.value.replace(/height:\S+px;width:\S+px/, `height:${height}px;width:${width}px`)

      this.graph.editor.undoManager.undoableEditHappened(new LayerEdit([new Changes('modifySize', {
        id: cell.OwneeRef,
        name: tableOrView.properties.Name,
        width,
        height,
        preWidth,
        preHeight
      })]))
      this.graph.graph.refresh(cell)
      this.graph.graph.getView().refresh()
      if (this.graph.displaySetting.type) {
        this.graph.showDataType()
      } else {
        this.graph.hideDataType()
      }
      this.hasEdit = true
    },
    multipleSelectResize (isResizeWidth, isResizeHeight) {
      let cells = this.graph.graph.getSelectionCells()
      if (!cells.length) {
        return
      }
      cells.forEach(cell => {
        if (!cell.isTable && !cell.isView) {
          return
        }
        let $table = cell.isView ? $('#consa-graph').find(`.svg-view[view-id=${cell.OwneeRef}]`) : $('#consa-graph').find(`.svg-table[data-oween-id=${cell.OwneeRef}]`)
        let preWidth = Math.round($table.css('width').slice(0, -2))
        let preHeight = Math.round($table.css('height').slice(0, -2))
        let width = 120
        $table.find('.svg-col').each((i, col) => {
          let tmp = $(col).find('span').width() + 40
          if (tmp > width) {
            width = tmp
          }
        })
        if (!$table[0]?.querySelector('.table-body')) {
          return
        }
        let innerHeight = $table[0].querySelector('.table-body').clientHeight
        let height = $table.find('.svg-tName').height() + innerHeight + 20
        if (isResizeWidth && !isResizeHeight) {
          height = preHeight
        }
        if (isResizeHeight && !isResizeWidth) {
          width = preWidth
        }
        let shape = this.dataByType.diagram[this.currentId].children.find(item => item.properties.Id === cell.Id)
        shape.properties.ShapeSize.height = height
        shape.properties.ShapeSize.width = width
        shape.properties.changed = true
        cell.geometry.width = width
        cell.geometry.height = height
        cell.changed = true
        let tableOrView = this.graph.dataByType[cell.isView ? 'view' : cell.isTable ? 'table' : cell.isComment ? 'comment' : 'table'][cell.OwneeRef]
        if (tableOrView && tableOrView.posit) {
          const posit = tableOrView.posit
          posit.ShapeSize.width = width
          posit.ShapeSize.height = height
        }
        cell.value = cell.value.replace(/height:\S+px;width:\S+px/, `height:${height}px;width:${width}px`)

        this.graph.editor.undoManager.undoableEditHappened(new LayerEdit([new Changes('modifySize', {
          id: cell.OwneeRef,
          name: tableOrView.properties.Name,
          width,
          height,
          preWidth,
          preHeight
        })]))
        this.graph.graph.refresh(cell)
      })
      this.graph.graph.getView().refresh()
      if (this.graph.displaySetting.type) {
        this.graph.showDataType()
      } else {
        this.graph.hideDataType()
      }
      this.hasEdit = true
    },
    getCategories () {
      this.$http.get(this.$url + '/service/nametranslate/category').then(res => {
        this.categoryData = res.data.map(item => ({
          name: item === '' ? '默认' : item,
          checked: true
        }))
        let categoryStr = localStorage.getItem('categoryOrderMap')
        if (categoryStr) {
          let categoryOrderMap = JSON.parse(categoryStr)
          this.categoryData.forEach(i => {
            i.checked = Boolean(categoryOrderMap[i.name] && categoryOrderMap[i.name].checked)
          })
          this.categoryData = this.categoryData.sort((a, b) => {
            if (!categoryOrderMap[a.name]) {
              categoryOrderMap[a.name] = {
                index: this.categoryData.length
              }
            }
            if (!categoryOrderMap[b.name]) {
              categoryOrderMap[b.name] = {
                index: this.categoryData.length
              }
            }
            return categoryOrderMap[a.name].index - categoryOrderMap[b.name].index
          })
        }
        this.categoryOrder = this.categoryData.filter(i => i.checked).map(i => i.name === '默认' ? '' : i.name)
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    changeCategoryOrder (categoryOrder) {
      this.categoryOrder = categoryOrder
    },
    getIndexNameNamingMap (macro, name, keyId) {
      if (macro && keyId !== undefined) {
        return this.changeAlphabetType(macro.replace(/%owner%/, name).replace(/%keyid%/, keyId), this.dataByType.namingOption.IndexNameCase)
      } else {
        return this.changeAlphabetType(name, this.dataByType.namingOption.IndexNameCase)
      }
    },
    changeAlphabetType (name, type) {
      if (type === 'None') {

      } else if (type === 'Lower') {
        name = name.toLowerCase()
      } else if (type === 'Upper') {
        name = name.toUpperCase()
      } else if (type === 'Initial') {
        name = name.slice(0, 1).toUpperCase() + name.slice(1, name.length).toLowerCase()
      }
      return name
    },
    getTableNameNamingMap (name) {
      let { namingOption } = this.dataByType
      if (namingOption.IsTableTranslateEnabled) {
        // name = name.slice(0, namingOption.TableNameMaxLength)
        if (name.toLowerCase().indexOf(namingOption.TableNamePrefix.toLowerCase()) !== 0) {
          name = namingOption.TableNamePrefix + name
        }
        if (name.toLowerCase().lastIndexOf(namingOption.TableNamePostfix.toLowerCase()) !== -1 && name.toLowerCase().lastIndexOf(namingOption.TableNamePostfix.toLowerCase()) + namingOption.TableNamePostfix.length === name.length) {

        } else {
          name = name + namingOption.TableNamePostfix
        }
        name = this.changeAlphabetType(name, namingOption.TableNameCase)
      }
      return name
    },
    getColumnNameNamingMap (name) {
      let { namingOption } = this.dataByType
      if (namingOption.IsColumnTranslateEnabled) {
        // name = name.slice(0, namingOption.ColumnNameMaxLength)
        if (name.toLowerCase().indexOf(namingOption.ColumnNamePrefix.toLowerCase()) !== 0) {
          name = namingOption.ColumnNamePrefix + name
        }
        if (name.toLowerCase().lastIndexOf(namingOption.ColumnNamePostfix.toLowerCase()) !== -1 && name.toLowerCase().lastIndexOf(namingOption.ColumnNamePostfix.toLowerCase()) + namingOption.ColumnNamePostfix.length === name.length) {

        } else {
          name = name + namingOption.ColumnNamePostfix
        }
        name = this.changeAlphabetType(name, namingOption.ColumnNameCase)
      }
      return name
    },
    openNamingOptionDialog () {
      this.namingOptionKey++
      this.namingOptionVisible = true
    },
    openUDPSettingDialog () {
      this.udpKey++
      this.udpSettingVisible = true
    },
    // handleConflictDomain (conflictDomainCount, conflictDomainList, checkedConflictDomainList, domainList, maxId, table, cell, domainObj) {
    //   // 依次确认是否保留冲突字段
    //   if (conflictDomainCount < conflictDomainList.length) {
    //     this.$confirm('此标准的英文缩写已存在，该标准将不能应用到新字段上。是否继续？', '命名冲突', {
    //       confirmButtonText: '确定',
    //       cancelButtonText: '取消',
    //       type: 'warning'
    //     }).then(() => {
    //       checkedConflictDomainList.push(conflictDomainList[conflictDomainCount++])
    //       this.handleConflictDomain(conflictDomainCount, conflictDomainList, checkedConflictDomainList, domainList, maxId, table, cell, domainObj)
    //     }).catch((e) => {
    //       console.error(e)
    //       this.handleConflictDomain(++conflictDomainCount, conflictDomainList, checkedConflictDomainList, domainList, maxId, table, cell, domainObj)
    //     })
    //   } else {
    //     // 确认完毕把标准转换为字段
    //     let newCols = domainList.map(domain => {
    //       domain.inheritType = domainObj.inheritType
    //       let newCol = this.getNewDomainCol(maxId++, domain, false)
    //       if (table.properties.ColumnOrderArrayRefs) {
    //         table.properties.ColumnOrderArrayRefs.push(newCol.properties.Id)
    //       } else {
    //         table.properties.ColumnOrderArrayRefs = [newCol.properties.Id]
    //       }
    //       return newCol
    //     })
    //     let newConflictCols = checkedConflictDomainList.map(domain => {
    //       domain.inheritType = domainObj.inheritType
    //       let newCol = this.getNewDomainCol(maxId++, domain, true)
    //       if (table.properties.ColumnOrderArrayRefs) {
    //         table.properties.ColumnOrderArrayRefs.push(newCol.properties.Id)
    //       } else {
    //         table.properties.ColumnOrderArrayRefs = [newCol.properties.Id]
    //       }
    //       return newCol
    //     })
    //     newCols = newCols.concat(newConflictCols)
    //     let oldChildren = _.cloneDeep(table.children || [])
    //     table.children = table.children.concat(newCols)
    //     table.properties.changed = true
    //     this.graph.editor.undoManager.undoableEditHappened(new LayerEdit([new Changes('insertColumnList', {
    //       pId: table.properties.Id,
    //       pName: table.properties.Name,
    //       pre: oldChildren,
    //       name: '',
    //       now: _.cloneDeep(table.children)
    //     })]))
    //     if (cell) {
    //       cell.value = await this.getTableHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
    //       cell.changed = true
    //       this.graph.graph.getView().refresh()
    //     }
    //     this.domainListVisible = false
    //     this.checkedDomainList = []
    //   }
    // },
    uglyHandleSave () {
      document.querySelector('.drag-box #saveButton').click()
    },
    toggleFullScreen () {
      // if (!this.isFullScreen) {
      //   this.$fullScreen()
      // } else {
      //   this.$exitFullScreen()
      // }
      if (!this.isFullScreen) {
        window.document.documentElement.requestFullscreen()
      } else {
        document.exitFullscreen()
      }
    },
    toggleHeader () {
      this.isFullScreen = !this.isFullScreen
      if (this.editorType === 'table') {
        this.fixed = !this.fixed
      }
      this.$emit('handleTopTileChange', !this.isFullScreen)
      this.$emit('handleTopHeaderChange', !this.isFullScreen)
    },
    handleTopTileChange (bool) {
      if (this.isFullScreen) {
        this.$emit('handleTopTileChange', bool)
      }
    },
    KeyDown (event) {
      if (event.keyCode === 122) {
        event.returnValue = false
        this.toggleFullScreen()
      }
      if (event.ctrlKey === true && (event.keyCode === 48 || event.keyCode === 96)) {
        this.sliderChange(100)
        this.scale = 100
      }
    },
    handleRightClick (e) {
      clearTimeout(this.menuBoxTimer)
      let menuBox = this.$refs.menuBox
      menuBox.style.left = e.clientX + 'px'
      this.showMenuBox = false
      this.showMenuBox = true
      this.menuBoxTimer = setTimeout(() => {
        this.showMenuBox = false
      }, 2000)
    },
    async handleTextFormChange () {
      let shape = this.currentStyle.shape
      let bakStyle = _.cloneDeep(this.currentStyle)
      this.formatTextFontSimpleBack(bakStyle)
      let preShape = _.cloneDeep(shape)
      if (this.currentStyle.isCol) {
        let colStyle = this.currentStyle.colStyle
        if (colStyle) {
          colStyle.properties.StyleFont = bakStyle.StyleFont
          colStyle.properties.StyleTextColor = bakStyle.StyleTextColor
          colStyle.properties.changed = true
        } else {
          // 无字段自定义样式需要新建
          let newStyle = {
            objectClass: 'Datablau.ERD.ShapeMemberStyle',
            properties: {
              AttributeRef: this.currentStyle.colId,
              Id: this.deliverNum.seed++,
              Name: `${this.currentStyle.currentEntity.properties.Name + this.currentStyle.colId}`,
              RawType: 'ShapeMemberStyle',
              TypeId: 80800042,
              UniqueId: uuidv4(),
              StyleFont: bakStyle.StyleFont,
              StyleTextColor: bakStyle.StyleTextColor,
              new: true
            }
          }
          if (this.currentStyle.shape.children) {
            this.currentStyle.shape.children.push(newStyle)
          } else {
            this.currentStyle.shape.children = [newStyle]
          }
          this.currentStyle.colStyle = newStyle
        }
      } else {
        shape.properties.StyleFont = bakStyle.StyleFont
        shape.properties.StyleTextColor = bakStyle.StyleTextColor
      }
      this.currentStyle.shape.properties.changed = true
      this.graph.editor.undoManager.undoableEditHappened(new LayerEdit([new Changes('modifyShape', {
        id: this.currentStyle.shape.properties.Id,
        name: '-' + '工具栏',
        pre: preShape,
        now: _.cloneDeep(this.currentStyle.shape)
      })]))
      let cell = this.currentStyle.cell
      cell.StyleFont = shape.properties['StyleFont']
      cell.StyleTextColor = shape.properties['StyleTextColor']
      cell.changed = true
      // 字段也能修改文字
      if (cell.isTable) {
        cell.value = await this.getTableHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
      } else if (cell.isView) {
        cell.value = await this.getViewHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
      } else if (cell.isComment) {
        cell.value = this.getCommentHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
      }
      this.graph.graph.getView().refresh()
    },
    async handleBackColorChange (val) {
      let arr, style
      if (!val) {
        val = ''
        style = ''
      } else {
        arr = val.split(',')
        style = `ARGBColor:${(parseFloat(arr[3].slice(1, -1)) * 255).toFixed(0)}:${arr[0].slice(5)}:${arr[1].slice(1)}:${arr[2].slice(1)}`
      }
      let preShape = _.cloneDeep(this.currentStyle.shape)
      if (this.currentStyle.isCol) {
        let colStyle = this.currentStyle.colStyle
        if (colStyle) {
          colStyle.properties.StyleBackColor = style
          colStyle.properties.changed = true
        } else {
          // 无字段自定义样式需要新建
          let newStyle = {
            objectClass: 'Datablau.ERD.ShapeMemberStyle',
            properties: {
              AttributeRef: this.currentStyle.colId,
              Id: this.deliverNum.seed++,
              Name: `${this.currentStyle.currentEntity.properties.Name + this.currentStyle.colId}`,
              RawType: 'ShapeMemberStyle',
              TypeId: 80800042,
              UniqueId: uuidv4(),
              StyleBackColor: style,
              new: true
            }
          }
          if (this.currentStyle.shape.children) {
            this.currentStyle.shape.children.push(newStyle)
          } else {
            this.currentTableDiagram.children = [newStyle]
          }
          this.currentStyle.colStyle = newStyle
        }
      } else {
        if (!this.currentStyle.isRelation) {
          this.currentStyle.shape.properties['StyleBackColor'] = style
        } else {
          this.currentStyle.shape.properties['StyleBackColor2'] = style
        }
      }
      this.currentStyle.shape.properties.changed = true
      this.graph.editor.undoManager.undoableEditHappened(new LayerEdit([new Changes('modifyShape', {
        id: this.currentStyle.shape.properties.Id,
        name: '-' + '工具栏',
        pre: preShape,
        now: _.cloneDeep(this.currentStyle.shape)
      })]))
      let cell = this.currentStyle.cell
      cell.changed = true
      if (!this.currentStyle.isRelation) {
        if (cell.isTable) {
          cell.value = await this.getTableHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
        } else if (cell.isView) {
          cell.value = await this.getViewHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
        } else if (cell.isComment) {
          cell.value = this.getCommentHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
        } else if (cell.isFigure) {
          cell.style = this.getFigureHTMLFunction(cell.Id, this.graph.graph, null, null, true)
          this.graph.graph.refresh(cell)
        } else if (cell.isSubType) {
          cell.style = this.graph.drawSubTypeStyle(cell)
          this.graph.graph.refresh(cell)
        }
        cell.StyleBackColor = this.currentStyle.shape.properties['StyleBackColor']
        this.graph.graph.getView().refresh()
      } else {
        cell.style = this.graph.drawEdgeShapeStyle(cell.Id)
        this.graph.graph.refresh(cell)
      }
    },
    async renderNewCol (newCol, table, cell, isRender, isView, isPrimaryColumn = false) {
      if (!newCol) { return }
      let changes = []
      if (table.children) {
        table.children.push(newCol)
      } else {
        table.children = [newCol]
      }
      if (table.properties.ColumnOrderArrayRefs) {
        table.properties.ColumnOrderArrayRefs.push(newCol.properties.Id)
      } else {
        table.properties.ColumnOrderArrayRefs = [newCol.properties.Id]
      }
      changes.push(new Changes('insertColumn', {
        pId: table.properties.Id,
        pName: table.properties.Name,
        id: newCol.properties.Id,
        name: newCol.properties.Name,
        now: _.cloneDeep(newCol)
      }))
      if (isPrimaryColumn) {
        let primaryKey = table.children.find(item => item.properties.KeyGroupType === 'PrimaryKey' && !item.properties.deleted)
        if (primaryKey) {
          let change = new Changes('modifyIndex', {
            pId: table.properties.Id,
            pName: table.properties.Name,
            name: primaryKey.properties.Name,
            pre: _.cloneDeep(primaryKey),
            now: null
          })
          primaryKey.properties.changed = true
          if (!primaryKey.children) {
            primaryKey.children = []
          }
          primaryKey.children.push({
            objectClass: 'Datablau.LDM.EntityKeyGroupMember',
            properties: {
              AttributeRef: newCol.properties.Id,
              Id: this.deliverNum.seed++,
              OrderType: 'Ascending',
              UniqueId: uuidv4(),
              TypeId: 80500001,
              Name: newCol.properties.Name,
              new: true
            }
          })
          primaryKey.properties.KeyGroupMemberRefs = primaryKey.children.map(column => column.properties.Id)
          change.obj.now = _.cloneDeep(primaryKey)
          changes.push(change)
        } else {
          let keyId = 1
          let index = table.children.filter(i => i.objectClass === 'Datablau.LDM.EntityKeyGroup')
          if (index && index.length) {
            let name = index[index.length - 1].properties.Name
            keyId = parseInt(name.slice(name.search(/\d+$/)))
          }
          let children = [{
            objectClass: 'Datablau.LDM.EntityKeyGroupMember',
            properties: {
              AttributeRef: newCol.properties.Id,
              Id: this.deliverNum.seed++,
              OrderType: 'Ascending',
              UniqueId: uuidv4(),
              TypeId: 80500001,
              Name: newCol.properties.Name,
              new: true
            }
          }]
          let primaryKey = {
            children,
            objectClass: 'Datablau.LDM.EntityKeyGroup',
            properties: {
              Id: this.deliverNum.seed++,
              KeyGroupMemberRefs: children.map(i => i.properties.Id),
              KeyGroupType: 'PrimaryKey',
              Macro: this.dataByType.namingOption.PKDefaultMacro,
              Name: this.dataByType.namingOption.PKDefaultMacro.replace(/%owner%/, table.properties.Name).replace(/%keyid%/, '' + (keyId++)),
              RawType: 'KeyGroup',
              TypeId: 80000093,
              UniqueId: uuidv4(),
              new: true
            }
          }
          table.children.push(primaryKey)
          let change = new Changes('insertIndex', {
            pId: table.properties.Id,
            pName: table.properties.Name,
            name: primaryKey.properties.Name,
            now: _.cloneDeep(primaryKey)
          })
          changes.push(change)
        }
      }
      if (isRender) {
        table.properties.changed = true
        this.graph.editor.undoManager.undoableEditHappened(new LayerEdit(changes))
        if (cell) {
          if (isView) {
            cell.value = await this.getViewHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
          } else {
            cell.value = await this.getTableHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
          }
          cell.changed = true
          this.graph.graph.getView().refresh()
        }
      }
    },
    handleDomainCheckAll () {
      this.checkedDomainList = this.currentDomainList.map(v => v.id)
    },
    addPrimaryKey (table, changes, newCols) {
      let primaryKey = table.children.find(item => item.properties.KeyGroupType === 'PrimaryKey' && !item.properties.deleted)
      if (primaryKey) {
        let change = new Changes('modifyIndex', {
          pId: table.properties.Id,
          pName: table.properties.Name,
          name: primaryKey.properties.Name,
          pre: _.cloneDeep(primaryKey),
          now: null
        })
        primaryKey.properties.changed = true
        if (!primaryKey.children) {
          primaryKey.children = []
        }
        primaryKey.children = primaryKey.children.concat(newCols.map(newCol => ({
          objectClass: 'Datablau.LDM.EntityKeyGroupMember',
          properties: {
            AttributeRef: newCol.properties.Id,
            Id: this.deliverNum.seed++,
            OrderType: 'Ascending',
            UniqueId: uuidv4(),
            TypeId: 80500001,
            Name: newCol.properties.Name,
            new: true
          }
        })))
        primaryKey.properties.KeyGroupMemberRefs = primaryKey.children.map(column => column.properties.Id)
        change.obj.now = _.cloneDeep(primaryKey)
        changes.push(change)
      } else {
        let keyId = 1
        let index = table.children.filter(i => i.objectClass === 'Datablau.LDM.EntityKeyGroup')
        if (index && index.length) {
          let name = index[index.length - 1].properties.Name
          keyId = parseInt(name.slice(name.search(/\d+$/)))
        }
        let children = newCols.map(newCol => ({
          objectClass: 'Datablau.LDM.EntityKeyGroupMember',
          properties: {
            AttributeRef: newCol.properties.Id,
            Id: this.deliverNum.seed++,
            OrderType: 'Ascending',
            UniqueId: uuidv4(),
            TypeId: 80500001,
            Name: newCol.properties.Name,
            new: true
          }
        }))
        let primaryKey = {
          children,
          objectClass: 'Datablau.LDM.EntityKeyGroup',
          properties: {
            Id: this.deliverNum.seed++,
            KeyGroupMemberRefs: children.map(i => i.properties.Id),
            KeyGroupType: 'PrimaryKey',
            Macro: this.dataByType.namingOption.PKDefaultMacro,
            Name: this.dataByType.namingOption.PKDefaultMacro.replace(/%owner%/, table.properties.Name).replace(/%keyid%/, '' + (keyId++)),
            RawType: 'KeyGroup',
            TypeId: 80000093,
            UniqueId: uuidv4(),
            new: true
          }
        }
        table.children.push(primaryKey)
        let change = new Changes('insertIndex', {
          pId: table.properties.Id,
          pName: table.properties.Name,
          name: primaryKey.properties.Name,
          now: _.cloneDeep(primaryKey)
        })
        changes.push(change)
      }
    },
    async createColsByDomainList () {
      let currentList = this.currentDomainList.filter(v => this.checkedDomainList.indexOf(v.id) > -1)
      let { table, domainObj, maxId, cell, cols } = this.currentDomainTableVar
      if (!table.children) {
        table.children = []
      }
      // 要继承英文名时要判断是否重名
      let currentCols = cols || []
      let isConflict = false
      if (currentCols.length > 0 && domainObj.inheritType.includes('abbrivation')) {
        currentList.forEach(domain => {
          if (currentCols.some(v => v.properties.Name === domain['abbrivation'])) {
            isConflict = true
            this.$DatablauCofirm('此标准的英文缩写已存在，该标准将不能应用到新' + this.attributeName + '上。是否继续？', '命名冲突', {
              confirmButtonText: '全部应用',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(async () => {
              let newCols = currentList.map(domain => {
                domain.inheritType = domainObj.inheritType
                let newCol = this.getNewDomainCol(maxId++, domain, true)
                if (table.properties.ColumnOrderArrayRefs) {
                  table.properties.ColumnOrderArrayRefs.push(newCol.properties.Id)
                } else {
                  table.properties.ColumnOrderArrayRefs = [newCol.properties.Id]
                }
                return newCol
              })
              let oldChildren = _.cloneDeep(table.children || [])
              table.children = table.children.concat(newCols)
              let changes = []
              changes.push(new Changes('insertColumnList', {
                pId: table.properties.Id,
                pName: table.properties.Name,
                pre: oldChildren,
                name: '',
                now: _.cloneDeep(table.children)
              }))
              if (this.isPrimaryColumn) {
                this.addPrimaryKey(table, changes, newCols)
              }
              table.properties.changed = true
              this.graph.editor.undoManager.undoableEditHappened(new LayerEdit(changes))
              if (cell) {
                if (cell.isTable) {
                  cell.value = await this.getTableHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
                } else if (cell.isView) {
                  cell.value = await this.getViewHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
                }
                cell.changed = true
                this.graph.graph.getView().refresh()
              }
              this.domainListVisible = false
              this.checkedDomainList = []
            }).catch((e) => {
              console.error(e)
            })
          }
        })
      }
      // 冲突不执行后续操作
      if (isConflict) {
        return
      }
      // let domainList = []
      // let conflictDomainList = []
      // let checkedConflictDomainList = []
      // if (currentCols.length > 0 && domainObj.inheritType.includes('abbrivation')) {
      //   currentList.forEach(domain => {
      //     if (currentCols.some(v => v.properties.Name === domain['abbrivation'])) {
      //       conflictDomainList.push(domain)
      //     } else {
      //       // 不重名的放进doaminList
      //       domainList.push(domain)
      //     }
      //   })
      //   if (conflictDomainList.length > 0) {
      //     this.handleConflictDomain(0, conflictDomainList, checkedConflictDomainList, domainList, maxId, table, cell, domainObj)
      //     return
      //   }
      // }
      let newCols = currentList.map(domain => {
        domain.inheritType = domainObj.inheritType
        let newCol = this.getNewDomainCol(maxId++, domain, false)
        if (table.properties.ColumnOrderArrayRefs) {
          table.properties.ColumnOrderArrayRefs.push(newCol.properties.Id)
        } else {
          table.properties.ColumnOrderArrayRefs = [newCol.properties.Id]
        }
        return newCol
      })
      let oldChildren = _.cloneDeep(table.children || [])
      table.children = table.children.concat(newCols)
      let changes = []
      changes.push(new Changes('insertColumnList', {
        pId: table.properties.Id,
        pName: table.properties.Name,
        pre: oldChildren,
        name: '',
        now: _.cloneDeep(table.children)
      }))
      if (this.isPrimaryColumn) {
        this.addPrimaryKey(table, changes, newCols)
      }
      table.properties.changed = true
      this.graph.editor.undoManager.undoableEditHappened(new LayerEdit(changes))
      if (cell) {
        if (cell.isTable) {
          cell.value = await this.getTableHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
        } else if (cell.isView) {
          cell.value = await this.getViewHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
        }
        cell.changed = true
        this.graph.graph.getView().refresh()
      }
      this.domainListVisible = false
      this.checkedDomainList = []
    },
    callDragDomain () {
      this.callDomain = true
      setTimeout(() => {
        this.$refs.dragDomainSelector.openDialog()
      }, 100)
    },
    heartBeat () {
      this.heartCount++
      this.$http.put(`${this.$url}/service/editor/${this.currentModel.id}/heart`).then(res => {
        if (!res.data) {
          if (this.heartCount === 1) {
            setTimeout(() => {
              this.$http.put(`${this.$url}/service/editor/${this.currentModel.id}/lock`).then(res => {
                if (res.data) {

                } else {
                  this.$blauShowFailure('模型尝试加锁失败，请退出后重新打开模型')
                }
              }).catch(err => {
                this.$showFailure(err)
              })
            }, 1000)
          } else {
            this.$blauShowFailure('心跳失败')
          }
        }
      }).catch(err => {
        // if (err.response.data.errorMessage.indexOf('保持心跳失败，失败原因') !== -1 && this.heartCount === 1) {
        if (this.heartCount === 1) {
          setTimeout(() => {
            this.$http.put(`${this.$url}/service/editor/${this.currentModel.id}/lock`).then(res => {
              if (res.data) {

              } else {
                this.$blauShowFailure('模型尝试加锁失败，请退出后重新打开模型')
              }
            }).catch(err => {
              this.$showFailure(err)
            })
          }, 1000)
        } else {
          this.$showFailure(err)
        }
      })
    },
    handleClickOutside () {
      if (this.graph && this.graph.graph) {
        this.graph.graph.popupMenuHandler.hideMenu()
      }
    },
    changeDialogWidth (width) {
      this.dialogWidth = width
      if (width === '600px') {
        this.$refs.tableDetailsEdit?.shrink && (this.$refs.tableDetailsEdit.shrink = true)
        this.$refs.viewDetailsEdit?.shrink && (this.$refs.viewDetailsEdit.shrink = true)
      } else {
        this.$refs.tableDetailsEdit?.shrink && (this.$refs.tableDetailsEdit.shrink = false)
        this.$refs.viewDetailsEdit?.shrink && (this.$refs.viewDetailsEdit.shrink = false)
      }
    },
    changeColDialogWidth (width) {
      this.colDialogWidth = width
    },
    searchChanged () {
      this.showSearch = true
      setTimeout(() => {
        this.needHide = true
      }, 1000)
      this.prepareZoomData()
    },
    reNameColumnType (item, key, domain) {
      if (domain['dataScale']) {
        item[key] = domain['dataType'] + '(' + domain['dataScale'] + (domain.dataPrecision ? `,${domain.dataPrecision})` : '' + ')')
      } else {
        item[key] = domain['dataType']
      }
      let columnTypeMapObj = this.columnTypeMapping[domain.dataType.toUpperCase()]
      if (columnTypeMapObj) {
        if (domain.dataScale) {
          if (columnTypeMapObj.Multiple) {
            item[key] = `${columnTypeMapObj.TargetDatatype}(${columnTypeMapObj.Multiple * domain.dataScale}${domain.dataPrecision ? `,${domain.dataPrecision}` : ''})`
          } else {
            item[key] = `${columnTypeMapObj.TargetDatatype}(${domain.dataScale})`
          }
        } else {
          item[key] = columnTypeMapObj.TargetDatatype
        }
      }
    },
    getNewDomainCol (maxId, domain, isConflict) {
      let newCol = {
        objectClass: 'Datablau.LDM.EntityAttribute',
        properties: {
          ...this.colUdpsDefault,
          Id: this.deliverNum.seed++,
          Name: `Column_${++maxId}`,
          IsNotNull: false,
          RawType: 'Attribute',
          DataType: 'VARCHAR(50)',
          DataStandardRef: domain.id,
          DataStandardCode: domain.referenceCode,
          TypeId: 80000005,
          UniqueId: uuidv4(),
          new: true
        }
      }
      let { inheritType } = domain
      if (inheritType.includes('abbrivation')) {
        newCol.properties['Name'] = isConflict ? `${domain['abbrivation']}${maxId}` : `${domain['abbrivation']}`
      }
      if (this.isDesignModel) {
        newCol.properties.IsLogicalOnly = null
      } else {
        newCol.properties.IsPhysicalOnly = null
      }
      if (inheritType.includes('description')) {
        newCol.properties['Definition'] = domain['description']
      }
      if (inheritType.includes('chName')) {
        newCol.properties['LogicalName'] = domain['chName']
      }

      if (inheritType.includes('dataType')) {
        this.reNameColumnType(newCol.properties, 'DataType', domain)
        // if (domain['dataScale']) {
        //   newCol.properties['DataType'] = domain['dataType'] + '(' + domain['dataScale'] + domain.dataPrecision ? `,${domain.dataPrecision}` : '' + ')'
        // } else {
        //   newCol.properties['DataType'] = domain['dataType']
        // }
        // let columnTypeMapObj = this.columnTypeMapping[domain.dataType]
        // if (columnTypeMapObj) {
        //   if (domain.dataScale) {
        //     if (columnTypeMapObj.Multiple) {
        //       newCol.properties.DataType = `${columnTypeMapObj.TargetDatatype}(${columnTypeMapObj.Multiple * domain.dataScale}${domain.dataPrecision ? `,${domain.dataPrecision}` : ''})`
        //     } else {
        //       newCol.properties.DataType = `${columnTypeMapObj.TargetDatatype}(${domain.dataScale})`
        //     }
        //   } else {
        //     newCol.properties.DataType = columnTypeMapObj.TargetDatatype
        //   }
        // }
      }
      if (inheritType.includes('notNull')) {
        newCol.properties['IsNotNull'] = domain['notNull']
      }
      if (inheritType.includes('enName')) {
        newCol.properties['EnName'] = domain['enName']
      }
      return newCol
    },
    getNewTreeCol (maxId, pId) {
      if (isNaN(maxId) || !isFinite(maxId)) {
        maxId = 114513
      }
      let col = {
        objectClass: 'Datablau.LDM.CollectionNode',
        properties: {
          ...this.colUdpsDefault,
          DataType: 'VARCHAR(50)',
          Id: this.deliverNum.seed++,
          IsNotNull: false,
          Name: `Field_${++maxId}`,
          RawType: 'Attribute',
          TagCode: '',
          TypeId: 80000005,
          LogicalName: '',
          DefaultVal: '',
          Definition: '',
          DataStandardRef: '',
          OwnerRef: pId,
          UniqueId: uuidv4(),
          new: true
        }
      }
      if (this.isLogicalModel) {
        col.properties.IsLogicalOnly = null
      } else {
        col.properties.IsPhysicalOnly = null
      }
      return col
    },
    getMaxId (cols) {
      if (!cols.length) {
        return 0
      }
      return Math.max(...cols.map(v => {
        let arr = v.properties.Name.split('_')
        let num = parseInt(arr[arr.length - 1])
        return isNaN(num) ? 0 : num
      }))
    },
    resetCommentStyleConfirm () {
      this.currentStyleRelatedShapeTemplate['StyleFont'] = ''
      this.currentStyleRelatedShapeTemplate['StyleTextColor'] = ''
      this.currentStyleRelatedShapeTemplate['StyleThemeRef'] = null
      this.currentStyleRelatedShapeTemplate['StyleFontFamily'] = null
      this.currentStyleRelatedShapeTemplate['StyleFontBoldItalic'] = null
      this.currentStyleRelatedShapeTemplate['StyleFontUnderLine'] = null
      this.currentStyleRelatedShapeTemplate['StyleFontLineThrough'] = null
    },
    resetFigureStyleConfirm () {
      this.currentStyleRelatedShapeTemplate['StyleBackColor'] = ''
      this.currentStyleRelatedShapeTemplate['StyleThemeRef'] = null
    },
    async closeFigureDialog (done) {
      if (this.closing && this.closingTimer) {
        return
      }
      this.closing = true
      this.closingTimer = setTimeout(() => {
        this.closing = false
        this.closingTimer = null
      }, 1000)
      let shape = this.dataByType.diagram[this.currentId].children.find(shape => shape.properties.Id === this.cellDialogData.Id)
      if (((shape.properties.StyleThemeRef && this.currentStyleRelatedShapeTemplate.StyleThemeRef && (shape.properties.StyleThemeRef === this.currentStyleRelatedShapeTemplate.StyleThemeRef)) || (!this.currentStyleRelatedShapeTemplate.StyleThemeRef && !shape.properties.StyleThemeRef)) && (this.formatThemeTemplateData(shape.properties).StyleBackColor === this.currentStyleRelatedShapeTemplate.StyleBackColor)) {
        // 未发生任何改变，不用存
        done()
      } else {
        let change = new Changes('modifyShape', {
          id: shape.properties.Id,
          name: shape.properties.Name,
          pre: _.cloneDeep(shape),
          now: null
        })
        shape.properties = this.currentStyleRelatedShapeTemplate
        let arr = []
        if (shape.properties['StyleBackColor'] && shape.properties['StyleBackColor'].indexOf('rgba') !== -1) {
          arr = shape.properties['StyleBackColor'].split(',')
          shape.properties['StyleBackColor'] = `ARGBColor:${(parseFloat(arr[3].slice(1, -1)) * 255).toFixed(0)}:${arr[0].slice(5)}:${arr[1].slice(1)}:${arr[2].slice(1)}`
        }
        let cellList = this.graph.graph.getDefaultParent().children
        let cell = cellList.find(cell => cell.Id === this.cellDialogData.Id)
        if (cell) {
          if (cell.isTable) {
            cell.value = await this.getTableHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
          } else if (cell.isView) {
            cell.value = await this.getViewHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
          } else if (cell.isComment) {
            cell.value = this.getCommentHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
          } else if (cell.isFigure) {
            cell.style = this.getFigureHTMLFunction(cell.Id, this.graph.graph, null, null, true)
            this.graph.graph.refresh(cell)
          }
          cell.changed = true
          cell.StyleThemeRef = shape.properties['StyleThemeRef']
          cell.StyleBackColor = shape.properties['StyleBackColor']
        }
        shape.properties.changed = true
        change.obj.now = _.cloneDeep(shape)
        this.graph.editor.undoManager.undoableEditHappened(new LayerEdit([change]))
        this.graph.graph.getView().refresh()
        done()
      }
    },
    changeCurrentEdgeType (type) {
      this.currentEdgeType = type
    },
    exit () {
      if (this.historyList.length) {
        // this.$DatablauCofirm(`模型[${this.currentModel.Name}]已经发生变更，是否保存模型？`, '', {
        //   type: 'warning',
        //   confirmButtonText: '保存',
        //   cancelButtonText: '否'
        //   // cancelButtonClass: 'red-bg-color'
        // }).then(() => {
        //   $('#saveButton').trigger('click')
        // }).catch(() => {
        //   this.graph.editor.undoManager.clear()
        //   this.$http.post(`${this.$url}/service/editor/${this.currentModel.id}/unlock`).then(res => {
        //     if (res.data) {
        //       this.graph.editor.undoManager.history = []
        //       if (inElectron) {
        //         // this.$router.go(-1)
        //         window.close()
        //       } else {
        //         window.location.href = 'about:blank'
        //         window.close()
        //       }
        //     } else {
        //       this.$blauShowFailure('模型解锁失败，请重试')
        //     }
        //   }).catch(err => {
        //     this.$showFailure(err)
        //   })
        // })
        this.quitSecondConfirm = true
      } else {
        let url = `${this.$url}/service/editor/${this.currentModel.id}/unlock`
        let tenantId = localStorage.getItem('tenantId')
        if (tenantId) {
          url += `?tenantId=${tenantId}`
        }
        this.$http.post(url).then(res => {
          if (res.data) {
            this.graph.editor.undoManager.history = []
            if (inElectron) {
              // this.$router.go(-1)
              window.close()
            } else {
              // window.location.href = 'about:blank'
              window.close()
            }
          } else {
            this.$blauShowFailure('模型解锁失败，请重试')
          }
        }).catch(err => {
          this.$showFailure(err)
        })
      }
    },
    saveBeforeQuit () {
      this.quitSecondConfirm = false
      $('#saveButton').trigger('click')
    },
    immediateQuit () {
      this.quitSecondConfirm = false
      this.graph.editor.undoManager.clear()
      let url = `${this.$url}/service/editor/${this.currentModel.id}/unlock`
      let tenantId = localStorage.getItem('tenantId')
      if (tenantId) {
        url += `?tenantId=${tenantId}`
      }
      this.$http.post(url).then(res => {
        if (res.data) {
          this.graph.editor.undoManager.history = []
          if (inElectron) {
            // this.$router.go(-1)
            window.close()
          } else {
            window.location.href = 'about:blank'
            window.close()
          }
        } else {
          this.$blauShowFailure('模型解锁失败，请重试')
        }
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    cancelQuit () {
      this.quitSecondConfirm = false
    },
    goHistoryBack (index, redo) {
      // 撤销/恢复
      let len = this.graph.editor.undoManager.indexOfNextAdd - index
      if (len > 0 && !redo) {
        for (let i = 0; i < len; i++) {
          this.currentOperate = 'undo'
          this.graph.editor.execute('undo')
        }
      } else if (len <= 0 && redo) {
        for (let i = 0; i > len; i--) {
          this.currentOperate = 'redo'
          this.graph.editor.execute('redo')
        }
      }
      this.activeHistoryIndex = -1
    },
    setActiveIndex (index) {
      let preItem = this.historyList[this.activeHistoryIndex]
      if (preItem) {
        this.$set(preItem, 'active', false)
      }
      let item = this.historyList[index]
      this.$set(item, 'active', true)
      this.activeHistoryIndex = index
    },
    formatTextFontSimpleBack (properties) {
      let packageTextFont = {}
      for (let key in properties) {
        if (!properties.hasOwnProperty(key)) {
          break
        }
        if (key.indexOf('Color') !== -1) {
          let value = properties[key]
          if (value === '' || value === null) {
            continue
          }
          let arr = value.split(',')
          properties[key] = `ARGBColor:${(parseFloat(arr[3].slice(1, -1)) * 255).toFixed(0)}:${arr[0].slice(5)}:${arr[1].slice(1)}:${arr[2].slice(1)}`
        } else if (key.indexOf('Font') !== -1) {
          let index = key.indexOf('Font')
          let k = key.slice(0, index + 4)
          if (packageTextFont[k]) {
            packageTextFont[k][key.slice(index + 4)] = properties[key]
          } else {
            packageTextFont[k] = {
              [key.slice(index + 4)]: properties[key]
            }
          }
          delete properties[key]
        }
      }
      for (let key in packageTextFont) {
        // Tahoma, 8.25pt, style=Bold, Italic, Underline, Strikeout
        if (packageTextFont.hasOwnProperty(key)) {
          let styleMap = packageTextFont[key]
          properties[key] = ''
          if (styleMap['Family']) {
            properties[key] += styleMap['Family'] + ', '
          } else {
            properties[key] += ' , '
          }
          if (styleMap['Size']) {
            properties[key] += styleMap['Size'] + 'pt, '
          } else {
            properties[key] += '9pt, '
          }
          if (styleMap['BoldItalic'] || styleMap['LineThrough'] || styleMap['UnderLine']) {
            properties[key] += 'style='
          }
          if (styleMap['BoldItalic'] === 'BoldItalic') {
            properties[key] += 'Bold, Italic, '
          } else if (styleMap['BoldItalic'] === 'Bold') {
            properties[key] += 'Bold, '
          } else if (styleMap['BoldItalic'] === 'Italic') {
            properties[key] += 'Italic, '
          }
          if (styleMap['UnderLine']) {
            properties[key] += 'Underline, '
          }
          if (styleMap['LineThrough']) {
            properties[key] += 'Strikeout, '
          }
          properties[key] = properties[key].slice(0, -2)
          if (properties[key] === '') {
            delete properties[key]
          }
        }
      }
    },
    async closeThemeDialog (done) {
      if (this.closing && this.closingTimer) {
        return
      }
      this.closing = true
      this.closingTimer = setTimeout(() => {
        this.closing = false
        this.closingTimer = null
      }, 1000)
      let theme = this.formatThemeDataCopy
      if (JSON.stringify(this.tmpThemeDataChange.changes[0].obj.preFormat) === JSON.stringify(theme)) {
        done()
        return
      }
      theme.changed = true
      let themeMap = this.dataByType.theme
      if (themeMap[this.formatThemeDataCopy.Id]) {
        _.merge(themeMap[this.formatThemeDataCopy.Id], {
          'properties': {
            ...theme
          },
          'objectClass': 'Datablau.LDM.StyleTheme'
        })
      } else {
        this.$set(themeMap, [this.formatThemeDataCopy.Id], {
          'properties': {
            ...theme
          },
          'objectClass': 'Datablau.LDM.StyleTheme'
        })
      }
      let properties = themeMap[this.formatThemeDataCopy.Id].properties
      this.formatTextFontSimpleBack(properties)
      let diagram = this.dataByType.diagram[this.currentId]
      // if (diagram.properties.StyleThemeRef === properties.Id) { //有可能内容表应用了该样式，暂时先注释
      let cellList = this.graph.graph.getDefaultParent().children
      // cellList.forEach(async cell => {
      //   if (cell) {
      //     // if (!cell.edge) {
      //     if (cell.isView || cell.isTable || cell.isComment || cell.isFigure) { // 因为有的Figure是edge组成的
      //       if (cell.isTable) {
      //         cell.value = await this.getTableHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
      //         let d = this.diagram.children.find(shape => !shape.properties.deleted && shape.properties.Id === cell.Id)
      //         if (d) {
      //           let roundSize = this.dataByType.table[cell.OwneeRef].properties.TypeId === 80100073 ? d.properties['BORoundingSize'] : d.properties['EntityRoundingSize']
      //           cell.style = STYLE.TABLE + (roundSize ? `rounded=1;perimeter=rectanglePerimeter;arcSize= ${roundSize}` : this.dataByType.table[cell.OwneeRef].properties.relied ? 'rounded=1;perimeter=rectanglePerimeter;arcSize=4' : '')
      //           this.graph.graph.refresh(cell)
      //         }
      //       } else if (cell.isView) {
      //         cell.value = await this.getViewHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
      //         let d = this.diagram.children.find(shape => !shape.properties.deleted && shape.properties.Id === cell.Id)
      //         if (d) {
      //           cell.style = STYLE.TABLE + (d.properties['EntityRoundingSize'] ? `rounded=1;perimeter=rectanglePerimeter;arcSize= ${d.properties['EntityRoundingSize']}` : '')
      //           this.graph.graph.refresh(cell)
      //         }
      //       } else if (cell.isComment) {
      //         cell.value = this.getCommentHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
      //       } else if (cell.isFigure) {
      //         cell.style = this.getFigureHTMLFunction(cell.Id, this.graph.graph, null, null, true)
      //         this.graph.graph.refresh(cell)
      //       }
      //     } else {
      //       cell.style = this.graph.drawEdgeShapeStyle(cell.Id)
      //       this.graph.graph.refresh(cell)
      //     }
      //     cell.changed = true
      //     if (cell.StyleThemeRef) {
      //       cell.StyleThemeRef = null // 为null采用主题域上应用的样式
      //     }
      //   }
      // })
      this.updateCellsStyle(cellList)
      // this.graph.graph.getView().refresh()
      // }
      done()
      this.tmpThemeDataChange.changes[0].obj.now = _.cloneDeep(themeMap[this.formatThemeDataCopy.Id])
      this.graph.editor.undoManager.undoableEditHappened(this.tmpThemeDataChange)
      this.tmpThemeDataChange = null
      this.hasEdit = true
    },
    clearPathIds () {
      this.pathIds = new Set()
    },
    async openColumnDialog ({ tableId, colId }) {
      let res = await this.closeEntityDialog(() => {
        this.editEntityDialog = false
      })
      if (res) {
        setTimeout(() => {
          this.afterHandleColDialogData(tableId, colId)
        }, 100)
      }
    },
    async openViewColumnDialog ({ tableId, colId }) {
      let res = await this.closeViewDialog(() => {
        this.editViewDialog = false
      })
      if (res) {
        setTimeout(() => {
          this.afterHandleColDialogData(tableId, colId, true)
        }, 100)
      }
    },
    async changeReliedTargetTable (relationId, existRelation) {
      let relation = this.dataByType.relation[relationId]
      if (relation.objectClass === 'Datablau.LDM.RelationshipRelational' || relation.objectClass === 'Datablau.LDM.RelationshipSubtype') {
        let targetTable = this.dataByType.table[relation.properties.ChildEntityRef]
        if (!targetTable) { // subtype 半圆
          return
        }
        let relations = Object.values(this.dataByType.relation).filter(relation => !relation.properties.deleted && relation.properties.ChildEntityRef === targetTable.properties.Id)
        targetTable.properties.relied = (existRelation && relation.properties.RelationalType === 'Identifying') || relations.some(relation => (relation.objectClass === 'Datablau.LDM.RelationshipRelational' || relation.objectClass === 'Datablau.LDM.RelationshipSubtype') && relation.properties.RelationalType === 'Identifying') // 首先存在关系，并且关系类型为主键关系
        let cellList = this.graph.graph.getDefaultParent().children
        let target = cellList.find(cell => cell.OwneeRef === relation.properties.ChildEntityRef)
        if (target) {
          let d = this.dataByType.diagram[this.currentId].children.find(shape => !shape.properties.deleted && shape.properties.Id === target.Id)
          let roundSize = this.dataByType.table[targetTable.properties.Id].properties.TypeId === 80100073 ? (d ? d.properties['BORoundingSize'] : 0) : (d ? d.properties['EntityRoundingSize'] : 0) // d 不存在可能是先删除shape再删除connection，回退的时候先恢复connection，导致shape的状态还是删除
          target.style = STYLE.TABLE + (roundSize ? `rounded=1;perimeter=rectanglePerimeter;arcSize= ${roundSize}` : this.dataByType.table[targetTable.properties.Id].properties.relied ? 'rounded=1;perimeter=rectanglePerimeter;arcSize=4' : '')
          let html = await this.getTableHTMLFunction(targetTable.properties.Id, this.graph.graph, null, null, true)
          target.value = html
          let edge = cellList.find(cell => cell.OwneeRef === relation.properties.Id)
          this.graph.graph.refresh(target)
          this.graph.graph.refresh(edge)
          // this.graph.graph.getView().refresh()
        }
      }
    },
    async handleChanges (changes, reverse) {
      if (!changes) {
        return
      }
      let refreshTableGraph = new Set()
      let refreshViewGraph = new Set()
      let refreshCommentGraph = new Set()
      let refreshCell = new Set()
      if (reverse) {
        for (let i = changes.length - 1; i >= 0; i--) {
          let change = changes[i]
          if (change.type === 'moveSelectCells') {
            this.moveSelectCells(-change.obj.delX, -change.obj.delY, change.obj.cells)
          } else if (change.type === 'insertRelation') {
            this.$set(this.dataByType.relation[change.obj.now.properties.Id].properties, 'deleted', true)
            await this.changeReliedTargetTable(change.obj.now.properties.Id, false)
          } else if (change.type === 'modifyRelation') {
            this.$set(this.dataByType.relation, change.obj.now.properties.Id, change.obj.pre)
            if (change.obj.now.properties.RelationalType !== change.obj.pre.properties.RelationalType || change.obj.now.properties.EndCardinality !== change.obj.pre.properties.EndCardinality) {
              let cellList = this.graph.graph.getDefaultParent().children
              let edge = cellList.find(cell => cell.OwneeRef === this.dataByType.relation[change.obj.now.properties.Id].properties.Id)
              edge.style = this.graph.drawEdgeShapeStyle(edge.Id)
              edge.relationalType = change.obj.pre.properties.RelationalType
              this.graph.graph.refresh(edge)
            }
            await this.changeReliedTargetTable(change.obj.now.properties.Id, true)
          } else if (change.type === 'deleteRelation') {
            this.$set(this.dataByType.relation[change.obj.id].properties, 'deleted', false)
            await this.changeReliedTargetTable(change.obj.id, true)
          } else if (change.type === 'insertIndex') {
            let table = this.dataByType.table[change.obj.pId]
            if (!table) {
              table = this.dataByType.view[change.obj.pId]
              refreshViewGraph.add(table)
            } else {
              refreshTableGraph.add(table)
            }
            let column = table.children.find(column => column.properties.Id === change.obj.now.properties.Id && column.objectClass === 'Datablau.LDM.EntityKeyGroup')
            this.$set(column.properties, 'deleted', true)
            refreshTableGraph.add(table)
          } else if (change.type === 'modifyIndex') {
            let table = this.dataByType.table[change.obj.pId]
            if (!table) {
              table = this.dataByType.view[change.obj.pId]
              refreshViewGraph.add(table)
            } else {
              refreshTableGraph.add(table)
            }
            let columnIndex = table.children.findIndex(column => column.properties.Id === change.obj.now.properties.Id && column.objectClass === 'Datablau.LDM.EntityKeyGroup')
            table.children[columnIndex] = change.obj.pre
            refreshTableGraph.add(table)
          } else if (change.type === 'deleteIndex') {
            let table = this.dataByType.table[change.obj.pId]
            if (!table) {
              table = this.dataByType.view[change.obj.pId]
              refreshViewGraph.add(table)
            } else {
              refreshTableGraph.add(table)
            }
            let column = table.children.find(column => column.properties.Id === change.obj.id && column.objectClass === 'Datablau.LDM.EntityKeyGroup')
            this.$set(column.properties, 'deleted', false)
            column.children && column.children.forEach(member => {
              this.$set(member.properties, 'deleted', false)
            })
            refreshTableGraph.add(table)
          } else if (change.type === 'insertMapping') {
            let table = this.dataByType.table[change.obj.pId]
            let column = table.children.find(column => column.properties.Id === change.obj.now.properties.Id && column.objectClass === 'Datablau.LDM.EntityDWMapping')
            this.$set(column.properties, 'deleted', true)
            refreshTableGraph.add(table)
          } else if (change.type === 'modifyMapping') {
            let table = this.dataByType.table[change.obj.pId]
            let columnIndex = table.children.findIndex(column => column.properties.Id === change.obj.now.properties.Id && column.objectClass === 'Datablau.LDM.EntityDWMapping')
            table.children[columnIndex] = change.obj.pre
          } else if (change.type === 'deleteMapping') {
            let table = this.dataByType.table[change.obj.pId]
            let column = table.children.find(column => column.properties.Id === change.obj.id && column.objectClass === 'Datablau.LDM.EntityDWMapping')
            this.$set(column.properties, 'deleted', false)
          } else if (change.type === 'insertPartition') {
            let table = this.dataByType.table[change.obj.pId]
            let column = table.children.find(column => column.properties.Id === change.obj.now.properties.Id && column.objectClass === 'Datablau.LDM.Partition')
            this.$set(column.properties, 'deleted', true)
          } else if (change.type === 'modifyPartition') {
            let table = this.dataByType.table[change.obj.pId]
            let columnIndex = table.children.findIndex(column => column.properties.Id === change.obj.now.properties.Id && column.objectClass === 'Datablau.LDM.Partition')
            table.children[columnIndex] = change.obj.pre
          } else if (change.type === 'deletePartition') {
            let table = this.dataByType.table[change.obj.pId]
            let column = table.children.find(column => column.properties.Id === change.obj.id && column.objectClass === 'Datablau.LDM.Partition')
            this.$set(column.properties, 'deleted', false)
          } else if (change.type === 'insertCluster') {
            let table = this.dataByType.table[change.obj.pId]
            let column = table.children.find(column => column.properties.Id === change.obj.now.properties.Id && column.objectClass === 'Datablau.LDM.EntityCluster')
            this.$set(column.properties, 'deleted', true)
          } else if (change.type === 'modifyCluster') {
            let table = this.dataByType.table[change.obj.pId]
            let columnIndex = table.children.findIndex(column => column.properties.Id === change.obj.now.properties.Id && column.objectClass === 'Datablau.LDM.EntityCluster')
            table.children[columnIndex] = change.obj.pre
          } else if (change.type === 'deleteCluster') {
            let table = this.dataByType.table[change.obj.pId]
            let column = table.children.find(column => column.properties.Id === change.obj.id && column.objectClass === 'Datablau.LDM.EntityCluster')
            this.$set(column.properties, 'deleted', false)
          } else if (change.type === 'insertColumnList') {
            let table = this.dataByType.table[change.obj.pId]
            if (!table) {
              table = this.dataByType.view[change.obj.pId]
              refreshViewGraph.add(table)
            } else {
              refreshTableGraph.add(table)
            }
            table.children.forEach((v, i) => {
              if (change.obj.pre.length <= i && i <= change.obj.now.length - 1) {
                this.$set(v.properties, 'deleted', true)
              }
            })
            refreshTableGraph.add(table)
          } else if (change.type === 'insertColumn') {
            let table = this.dataByType.table[change.obj.pId]
            if (!table) {
              table = this.dataByType.view[change.obj.pId]
              refreshViewGraph.add(table)
            } else {
              refreshTableGraph.add(table)
            }
            let column = table.children.find(column => column.properties.Id === change.obj.now.properties.Id)
            this.$set(column.properties, 'deleted', true)
            refreshTableGraph.add(table)
          } else if (change.type === 'modifyColumn') {
            let table = this.dataByType.table[change.obj.pId]
            if (!table) {
              table = this.dataByType.view[change.obj.pId]
              refreshViewGraph.add(table)
            } else {
              refreshTableGraph.add(table)
            }
            let columnIndex = table.children.findIndex(column => column.properties.Id === change.obj.now.properties.Id)
            table.children[columnIndex] = change.obj.pre
            refreshTableGraph.add(table)
          } else if (change.type === 'deleteColumn') {
            let table = this.dataByType.table[change.obj.pId]
            if (!table) {
              table = this.dataByType.view[change.obj.pId]
              refreshViewGraph.add(table)
            } else {
              refreshTableGraph.add(table)
            }
            let column = table.children.find(column => column.properties.Id === change.obj.id)
            this.$set(column.properties, 'deleted', false)
            refreshTableGraph.add(table)
          } else if (change.type === 'insertSubtype') {
            let table = this.dataByType.table[change.obj.pId]
            let column = table.children.find(column => column.properties.Id === change.obj.now.properties.Id)
            this.$set(column.properties, 'deleted', true)
          } else if (change.type === 'modifySubtype') {
            let table = this.dataByType.table[change.obj.pId]
            let columnIndex = table.children.findIndex(column => column.properties.Id === change.obj.now.properties.Id)
            table.children[columnIndex] = change.obj.pre
            let diagrams = this.dataByType.diagram[this.currentId].children
            let shape = diagrams.find(shape => !shape.properties.deleted && shape.properties.SubTypeRef === change.obj.pre.properties.Id)
            let cellList = this.graph.graph.getDefaultParent().children
            let cell = cellList.find(cell => cell.SubTypeRef === change.obj.pre.properties.Id)
            cell.value = this.graph.drawSubTypeShape(shape, true)
            cell.style = this.graph.drawSubTypeStyle(cell)
            this.graph.graph.refresh(cell)
          } else if (change.type === 'deleteSubtype') {
            let table = this.dataByType.table[change.obj.pId]
            let column = table.children.find(column => column.properties.Id === change.obj.id)
            this.$set(column.properties, 'deleted', false)
          } else if (change.type === 'insertTable') {
            let table = this.dataByType.table[change.obj.id]
            this.$set(table.properties, 'deleted', true)
          } else if (change.type === 'modifyTableProperties') {
            this.dataByType.table[change.obj.id].properties = change.obj.pre
            refreshTableGraph.add(this.dataByType.table[change.obj.id])
          } else if (change.type === 'deleteTable') {
            let table = this.dataByType.table[change.obj.id]
            this.$set(table.properties, 'deleted', false)
          } else if (change.type === 'insertShape') {
            let shape = this.dataByType.diagram[this.currentId].children.find(shape => shape.properties.Id === change.obj.id)
            if (shape) {
              this.$set(shape.properties, 'deleted', true)
            }
          } else if (change.type === 'modifyShape') {
            let children = this.dataByType.diagram[this.currentId].children
            let shapeIndex = children.findIndex(shape => shape.properties.Id === change.obj.now.properties.Id)
            children[shapeIndex] = change.obj.pre
            let shape = children[shapeIndex]
            let cellList = this.graph.graph.getDefaultParent().children
            let cell = cellList.find(cell => cell.Id === change.obj.pre.properties.Id)
            // let cell = cellList.find(cell => cell.Id === ((this.cellDialogData && this.cellDialogData.Id) || (this.edgeDialogData && this.edgeDialogData.Id)))
            if (cell) {
              if (cell.isTable) {
                cell.value = await this.getTableHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
              } else if (cell.isView) {
                cell.value = await this.getViewHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
              } else if (cell.isComment) {
                cell.value = this.getCommentHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
              } else if (cell.isFigure) {
                cell.style = this.getFigureHTMLFunction(cell.Id, this.graph.graph, null, null, true)
                this.graph.graph.refresh(cell)
              } else if (cell.isSubType) {
                setTimeout(() => { // 写在setTimeout里的原因是防止在前进回退修改subtype的中文名时，parent表的数据还没回退到正确状态
                  cell.value = this.graph.drawSubTypeShape(shape, true)
                  cell.style = this.graph.drawSubTypeStyle(cell)
                  this.graph.graph.refresh(cell)
                })
              } else if (cell.edge) {
                cell.style = this.graph.drawEdgeShapeStyle(cell.Id)
                this.graph.graph.refresh(cell)
              }
              cell.changed = true
              cell.StyleThemeRef = shape.properties['StyleThemeRef']
              cell.StyleBackColor = shape.properties['StyleBackColor']
            }
          } else if (change.type === 'deleteShape') {
            let shape = this.dataByType.diagram[this.currentId].children.find(shape => shape.properties.Id === change.obj.id)
            if (shape) {
              shape.properties.deleted = false
            }
          } else if (change.type === 'insertConnection') {
            let connection = this.dataByType.diagram[this.currentId].children.find(shape => shape.properties.Id === change.obj.id)
            if (connection) {
              this.$set(connection.properties, 'deleted', true)
            }
          } else if (change.type === 'modifyConnection') {

          } else if (change.type === 'deleteConnection') {
            let connection = this.dataByType.diagram[this.currentId].children.find(shape => shape.properties.Id === change.obj.id)
            if (connection) {
              connection.properties.deleted = false
            }
          } else if (change.type === 'modifySize') {
            let shape = this.dataByType.diagram[this.currentId].children.find(item => item.properties.OwneeRef === change.obj.id)
            shape.properties.ShapeSize.height = change.obj.preHeight
            shape.properties.ShapeSize.width = change.obj.preWidth
            let table = this.dataByType.table[change.obj.id]
            if (table) {
              refreshTableGraph.add(this.dataByType.table[change.obj.id])
            } else {
              refreshViewGraph.add(this.dataByType.view[change.obj.id])
            }
            let cell = this.graph.graph.getDefaultParent().children.find(item => item.OwneeRef === change.obj.id)
            if (cell) {
              cell.geometry.width = change.obj.preWidth
              cell.geometry.height = change.obj.preHeight
              refreshCell.add(cell)
            }
          } else if (change.type === 'insertView') {
            let view = this.dataByType.view[change.obj.id]
            this.$set(view.properties, 'deleted', true)
          } else if (change.type === 'modifyViewProperties') {
            let view = this.dataByType.view[change.obj.id]
            view.properties = change.obj.pre
            refreshViewGraph.add(view)
          } else if (change.type === 'deleteView') {
            let view = this.dataByType.view[change.obj.id]
            this.$set(view.properties, 'deleted', false)
          } else if (change.type === 'insertComment') {
            let comment = this.dataByType.comment[change.obj.id]
            this.$set(comment.properties, 'deleted', true)
          } else if (change.type === 'modifyCommentProperties') {
            let comment = this.dataByType.comment[change.obj.id]
            comment.properties.Text = change.obj.pre
            refreshCommentGraph.add(comment)
          } else if (change.type === 'deleteComment') {
            let comment = this.dataByType.comment[change.obj.id]
            this.$set(comment.properties, 'deleted', false)
          } else if (change.type === 'insertTheme') {
            this.$set(this.dataByType.theme[change.obj.id].properties, 'deleted', true)
          } else if (change.type === 'modifyTheme') {
            // this.dataByType.theme[change.obj.id] = change.obj.pre
            this.$set(this.dataByType.theme, change.obj.id, change.obj.pre)
            if (this.dataByType.diagram[this.currentId].properties.StyleThemeRef === change.obj.id) {
              let cellList = this.graph.graph.getDefaultParent().children
              // cellList.forEach(async cell => {
              //   if (cell) {
              //     if (cell.isView || cell.isTable || cell.isComment || cell.isFigure) { // 因为有的Figure是edge组成的
              //       if (cell.isTable) {
              //         cell.value = await this.getTableHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
              //         let d = this.diagram.children.find(shape => !shape.properties.deleted && shape.properties.Id === cell.Id)
              //         if (d) {
              //           let roundSize = this.dataByType.table[cell.OwneeRef].properties.TypeId === 80100073 ? d.properties['BORoundingSize'] : d.properties['EntityRoundingSize']
              //           cell.style = STYLE.TABLE + (roundSize ? `rounded=1;perimeter=rectanglePerimeter;arcSize= ${roundSize}` : this.dataByType.table[cell.OwneeRef].properties.relied ? 'rounded=1;perimeter=rectanglePerimeter;arcSize=4' : '')
              //           this.graph.graph.refresh(cell)
              //         }
              //       } else if (cell.isView) {
              //         cell.value = await this.getViewHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
              //       } else if (cell.isComment) {
              //         cell.value = this.getCommentHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
              //       } else if (cell.isFigure) {
              //         cell.style = this.getFigureHTMLFunction(cell.Id, this.graph.graph, null, null, true)
              //         this.graph.graph.refresh(cell)
              //       }
              //     } else {
              //       cell.style = this.graph.drawEdgeShapeStyle(cell.Id)
              //       this.graph.graph.refresh(cell)
              //     }
              //     cell.changed = true
              //     if (cell.StyleThemeRef) {
              //       cell.StyleThemeRef = null // 为null采用主题域上应用的样式
              //     }
              //   }
              // })
              // this.graph.graph.getView().refresh()
              this.updateCellsStyle(cellList)
            }
          } else if (change.type === 'deleteTheme') {
            this.$set(this.dataByType.theme[change.obj.id].properties, 'deleted', false)
            if (this.dataByType.diagram[this.currentId].properties.StyleThemeRef !== change.obj.diagramPre) {
              this.dataByType.diagram[this.currentId].properties.StyleThemeRef = change.obj.diagramPre
              let cellList = this.graph.graph.getDefaultParent().children
              // cellList.forEach(async cell => {
              //   if (cell) {
              //     if (cell.isView || cell.isTable || cell.isComment || cell.isFigure) { // 因为有的Figure是edge组成的
              //       if (cell.isTable) {
              //         cell.value = await this.getTableHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
              //         let d = this.diagram.children.find(shape => !shape.properties.deleted && shape.properties.Id === cell.Id)
              //         if (d) {
              //           let roundSize = this.dataByType.table[cell.OwneeRef].properties.TypeId === 80100073 ? d.properties['BORoundingSize'] : d.properties['EntityRoundingSize']
              //           cell.style = STYLE.TABLE + (roundSize ? `rounded=1;perimeter=rectanglePerimeter;arcSize= ${roundSize}` : this.dataByType.table[cell.OwneeRef].properties.relied ? 'rounded=1;perimeter=rectanglePerimeter;arcSize=4' : '')
              //           this.graph.graph.refresh(cell)
              //         }
              //       } else if (cell.isView) {
              //         cell.value = await this.getViewHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
              //         let d = this.diagram.children.find(shape => !shape.properties.deleted && shape.properties.Id === cell.Id)
              //         if (d) {
              //           cell.style = STYLE.TABLE + (d.properties['EntityRoundingSize'] ? `rounded=1;perimeter=rectanglePerimeter;arcSize= ${d.properties['EntityRoundingSize']}` : '')
              //           this.graph.graph.refresh(cell)
              //         }
              //       } else if (cell.isComment) {
              //         cell.value = this.getCommentHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
              //       } else if (cell.isFigure) {
              //         cell.style = this.getFigureHTMLFunction(cell.Id, this.graph.graph, null, null, true)
              //         this.graph.graph.refresh(cell)
              //       }
              //     } else {
              //       cell.style = this.graph.drawEdgeShapeStyle(cell.Id)
              //       this.graph.graph.refresh(cell)
              //     }
              //     cell.changed = true
              //     if (cell.StyleThemeRef) {
              //       cell.StyleThemeRef = null // 为null采用主题域上应用的样式
              //     }
              //   }
              // })
              // this.graph.graph.getView().refresh()
              this.updateCellsStyle(cellList)
            }
            this.$parent.$parent.$parent.$parent.searchAll()
          } else if (change.type === 'applyTheme') {
            if (this.dataByType.diagram[this.currentId].properties.StyleThemeRef !== change.obj.diagramPre) {
              this.dataByType.diagram[this.currentId].properties.StyleThemeRef = change.obj.diagramPre
              // let d = this.diagrams.find(d => d.Id === this.currentId)
              // if (d) {
              //   d.StyleThemeRef = change.obj.diagramPre
              // }
              let d = this.mapIdToDiagramData[this.currentId]
              if (d) {
                d.StyleThemeRef = change.obj.diagramPre
              }
              let cellList = this.graph.graph.getDefaultParent().children
              // cellList.forEach(async cell => {
              //   if (cell) {
              //     if (cell.isView || cell.isTable || cell.isComment || cell.isFigure) { // 因为有的Figure是edge组成的
              //       if (cell.isTable) {
              //         cell.value = await this.getTableHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
              //       } else if (cell.isView) {
              //         cell.value = await this.getViewHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
              //       } else if (cell.isComment) {
              //         cell.value = this.getCommentHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
              //       } else if (cell.isFigure) {
              //         cell.style = this.getFigureHTMLFunction(cell.Id, this.graph.graph, null, null, true)
              //         this.graph.graph.refresh(cell)
              //       }
              //     } else {
              //       cell.style = this.graph.drawEdgeShapeStyle(cell.Id)
              //       this.graph.graph.refresh(cell)
              //     }
              //     cell.changed = true
              //     if (cell.StyleThemeRef) {
              //       cell.StyleThemeRef = null // 为null采用主题域上应用的样式
              //     }
              //   }
              // })
              // this.graph.graph.getView().refresh()
              this.updateCellsStyle(cellList)
            }
          } else if (change.type === 'modifyFigureLayer') {
            let children = this.graph.graph.getDefaultParent().children
            let cell = children.find(cell => cell.Id === change.obj.id)
            cell.OrderNumber = change.obj.pre
            let shape = this.dataByType.diagram[this.currentId].children.find(shape => shape.properties.Id === cell.Id)
            shape.properties.OrderNumber = change.obj.pre
            let figureList = children.filter(cell => cell.isFigure)
            figureList = figureList.sort((a, b) => (a.OrderNumber - b.OrderNumber || a.Id - b.Id))
            children.splice(0, figureList.length, ...figureList)
            this.graph.graph.getView().refresh()
          } else if (change.type === 'insertSchema') {
            this.$set(this.dataByType.schema[change.obj.id].properties, 'deleted', true)
          } else if (change.type === 'modifySchema') {
            this.$set(this.dataByType.schema, change.obj.id, change.obj.pre)
            this.$parent.$parent.$parent.$parent.$forceUpdate()
          } else if (change.type === 'deleteSchema') {
            this.$set(this.dataByType.schema[change.obj.id].properties, 'deleted', false)
            this.$parent.$parent.$parent.$parent.$forceUpdate()
          } else if (change.type === 'insertDiagram') {
            change.obj.children.splice(change.obj.index, 1)
            this.$parent.$parent.$parent.$parent.diagramKey++
          } else if (change.type === 'deleteDiagram') {
            change.obj.children.splice(change.obj.index, 0, change.obj.item)
            this.$parent.$parent.$parent.$parent.diagramKey++
          } else if (change.type === 'modifyDiagram') {
            let realDiagramIndex = null
            // if (change.obj.now.ParentRef) {
            //   realDiagramIndex = change.obj.now.ParentRef.children.findIndex(diagram => diagram.Id === change.obj.id)
            //   change.obj.now.ParentRef.children[realDiagramIndex] = change.obj.pre
            // } else {
            //   realDiagramIndex = this.diagrams.findIndex(diagram => diagram.Id === change.obj.id)
            //   this.diagrams[realDiagramIndex] = change.obj.pre
            // }
            _.merge(this.mapIdToDiagramData[change.obj.id], change.obj.pre)
            // this.$parent.$parent.$parent.$parent.diagramKey++
            this.$bus.$emit('updateDiagramData')
          } else if (change.type === 'modifyModel') {
            Object.assign(this.modelData, change.obj.pre)
          } else if (change.type === 'modifyNamingOption') {
            this.dataByType.namingOption = change.obj.pre
          } else if (change.type === 'modifyNamingOptionAndApply') {
            this.dataByType.namingOption = change.obj.pre
            change.obj.tablePre.forEach(async (item, index) => {
              let table = this.dataByType.table[item.properties.Id]
              table.properties.Name = item.properties.Name
              table.children && table.children.forEach((c, j) => {
                if (item.children[j].properties.Macro) {
                  c.properties.Macro = item.children[j].properties.Macro
                }
                c.properties.Name = item.children[j].properties.Name
              })
              let cell = this.graph.graph.getDefaultParent().children.find(cell => cell.OwneeRef === table.properties.Id)
              if (cell) {
                cell.value = await this.getTableHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
                this.graph.graph.refresh(cell)
              }
            })
            change.obj.viewPre.forEach(async (item, index) => {
              let view = this.dataByType.view[item.properties.Id]
              view.properties.Name = item.properties.Name
              view.children && view.children.forEach((c, j) => {
                if (item.children[j].properties.Macro) {
                  c.properties.Macro = item.children[j].properties.Macro
                }
                c.properties.Name = item.children[j].properties.Name
              })
              let cell = this.graph.graph.getDefaultParent().children.find(cell => cell.OwneeRef === view.properties.Id)
              if (cell) {
                cell.value = await this.getViewHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
                this.graph.graph.refresh(cell)
              }
            })
            // this.graph.graph.getView().refresh()
          } else if (change.type === 'constituteFigure') {
            let diagrams = this.dataByType.diagram[this.currentId].children
            let shape = diagrams.find(shape => !shape.properties.deleted && shape.properties.Id === change.obj.id)
            shape.properties.CompostedShapesRef = change.obj.pre
          } else if (change.type === 'cancelConstituteFigure') {
            let diagrams = this.dataByType.diagram[this.currentId].children
            let shape = diagrams.find(shape => !shape.properties.deleted && shape.properties.Id === change.obj.id)
            shape.properties.CompostedShapesRef = change.obj.pre
          } else if (change.type === 'modifyUdps') {
            this.dataByType.udp = change.obj.pre
          } else if (change.type === 'modelCopy') {
            let model = change.obj.model
            Object.values(model.table).forEach(table => {
              if (table.properties.needReplaceId) { // 未替换id，说明copy前实体已存在
                this.dataByType.table[table.properties.Id].properties.deleted = true
              }
            })
            Object.values(model.view).forEach(view => {
              if (view.properties.needReplaceId) {
                this.dataByType.view[view.properties.Id].properties.deleted = true
              }
            })
            Object.values(model.comment).forEach(comment => {
              if (comment.properties.needReplaceId) {
                this.dataByType.comment[comment.properties.Id].properties.deleted = true
              }
            })
            Object.values(model.relation).forEach(relation => {
              if (relation.properties.needReplaceId) {
                this.dataByType.relation[relation.properties.Id].properties.deleted = true
              }
            })
            model.diagram.forEach(shape => {
              this.$set(shape.properties, 'deleted', true)
            })
          }
        }
      } else {
        for (let change of changes) {
          if (change.type === 'moveSelectCells') {
            this.moveSelectCells(change.obj.delX, change.obj.delY, change.obj.cells)
          } else if (change.type === 'insertRelation') {
            this.$set(this.dataByType.relation[change.obj.now.properties.Id].properties, 'deleted', false)
            await this.changeReliedTargetTable(change.obj.now.properties.Id, true)
          } else if (change.type === 'modifyRelation') {
            this.$set(this.dataByType.relation, change.obj.now.properties.Id, change.obj.now)
            if (change.obj.now.properties.RelationalType !== change.obj.pre.properties.RelationalType || change.obj.now.properties.EndCardinality !== change.obj.pre.properties.EndCardinality) {
              let cellList = this.graph.graph.getDefaultParent().children
              let edge = cellList.find(cell => cell.OwneeRef === this.dataByType.relation[change.obj.now.properties.Id].properties.Id)
              edge.style = this.graph.drawEdgeShapeStyle(edge.Id)
              edge.relationalType = change.obj.pre.properties.RelationalType
              this.graph.graph.refresh(edge)
            }
            await this.changeReliedTargetTable(change.obj.now.properties.Id, true)
          } else if (change.type === 'deleteRelation') {
            this.$set(this.dataByType.relation[change.obj.id].properties, 'deleted', true)
            await this.changeReliedTargetTable(change.obj.id, false)
          } else if (change.type === 'insertIndex') {
            let table = this.dataByType.table[change.obj.pId]
            if (!table) {
              table = this.dataByType.view[change.obj.pId]
              refreshViewGraph.add(table)
            } else {
              refreshTableGraph.add(table)
            }
            let column = table.children.find(column => column.properties.Id === change.obj.now.properties.Id && column.objectClass === 'Datablau.LDM.EntityKeyGroup')
            this.$set(column.properties, 'deleted', false)
          } else if (change.type === 'modifyIndex') {
            let table = this.dataByType.table[change.obj.pId]
            if (!table) {
              table = this.dataByType.view[change.obj.pId]
              refreshViewGraph.add(table)
            } else {
              refreshTableGraph.add(table)
            }
            let columnIndex = table.children.findIndex(column => column.properties.Id === change.obj.pre.properties.Id && column.objectClass === 'Datablau.LDM.EntityKeyGroup')
            table.children[columnIndex] = change.obj.now
            refreshTableGraph.add(table)
          } else if (change.type === 'deleteIndex') {
            let table = this.dataByType.table[change.obj.pId]
            if (!table) {
              table = this.dataByType.view[change.obj.pId]
              refreshViewGraph.add(table)
            } else {
              refreshTableGraph.add(table)
            }
            let column = table.children.find(column => column.properties.Id === change.obj.id && column.objectClass === 'Datablau.LDM.EntityKeyGroup')
            this.$set(column.properties, 'deleted', true)
            column.children && column.children.forEach(member => {
              this.$set(member.properties, 'deleted', true)
            })
            refreshTableGraph.add(table)
          } else if (change.type === 'insertMapping') {
            let table = this.dataByType.table[change.obj.pId]
            let column = table.children.find(column => column.properties.Id === change.obj.now.properties.Id && column.objectClass === 'Datablau.LDM.EntityDWMapping')
            this.$set(column.properties, 'deleted', false)
          } else if (change.type === 'modifyMapping') {
            let table = this.dataByType.table[change.obj.pId]
            let columnIndex = table.children.findIndex(column => column.properties.Id === change.obj.pre.properties.Id && column.objectClass === 'Datablau.LDM.EntityDWMapping')
            table.children[columnIndex] = change.obj.now
          } else if (change.type === 'deleteMapping') {
            let table = this.dataByType.table[change.obj.pId]
            let column = table.children.find(column => column.properties.Id === change.obj.id && column.objectClass === 'Datablau.LDM.EntityDWMapping')
            this.$set(column.properties, 'deleted', true)
          } else if (change.type === 'insertPartition') {
            let table = this.dataByType.table[change.obj.pId]
            let column = table.children.find(column => column.properties.Id === change.obj.now.properties.Id && column.objectClass === 'Datablau.LDM.Partition')
            this.$set(column.properties, 'deleted', false)
          } else if (change.type === 'modifyPartition') {
            let table = this.dataByType.table[change.obj.pId]
            let columnIndex = table.children.findIndex(column => column.properties.Id === change.obj.now.properties.Id && column.objectClass === 'Datablau.LDM.Partition')
            table.children[columnIndex] = change.obj.now
          } else if (change.type === 'deletePartition') {
            let table = this.dataByType.table[change.obj.pId]
            let column = table.children.find(column => column.properties.Id === change.obj.id && column.objectClass === 'Datablau.LDM.Partition')
            this.$set(column.properties, 'deleted', true)
          } else if (change.type === 'insertCluster') {
            let table = this.dataByType.table[change.obj.pId]
            let column = table.children.find(column => column.properties.Id === change.obj.now.properties.Id && column.objectClass === 'Datablau.LDM.EntityCluster')
            this.$set(column.properties, 'deleted', false)
          } else if (change.type === 'modifyCluster') {
            let table = this.dataByType.table[change.obj.pId]
            let columnIndex = table.children.findIndex(column => column.properties.Id === change.obj.now.properties.Id && column.objectClass === 'Datablau.LDM.EntityCluster')
            table.children[columnIndex] = change.obj.now
          } else if (change.type === 'deleteCluster') {
            let table = this.dataByType.table[change.obj.pId]
            let column = table.children.find(column => column.properties.Id === change.obj.id && column.objectClass === 'Datablau.LDM.EntityCluster')
            this.$set(column.properties, 'deleted', true)
          } else if (change.type === 'insertColumnList') {
            let table = this.dataByType.table[change.obj.pId]
            if (!table) {
              table = this.dataByType.view[change.obj.pId]
              refreshViewGraph.add(table)
            } else {
              refreshTableGraph.add(table)
            }
            table.children.forEach((v, i) => {
              if (change.obj.pre.length <= i && i <= change.obj.now.length - 1) {
                this.$set(v.properties, 'deleted', false)
              }
            })
            refreshTableGraph.add(table)
          } else if (change.type === 'insertColumn') {
            let table = this.dataByType.table[change.obj.pId]
            if (!table) {
              table = this.dataByType.view[change.obj.pId]
              refreshViewGraph.add(table)
            } else {
              refreshTableGraph.add(table)
            }
            let column = table.children.find(column => column.properties.Id === change.obj.now.properties.Id)
            if (column) {
              this.$set(column.properties, 'deleted', false)
            } else {
              change.obj.now.properties.deleted = false
              table.children.push(change.obj.now)
            }
            refreshTableGraph.add(table)
          } else if (change.type === 'modifyColumn') {
            let table = this.dataByType.table[change.obj.pId]
            if (!table) {
              table = this.dataByType.view[change.obj.pId]
              refreshViewGraph.add(table)
            } else {
              refreshTableGraph.add(table)
            }
            let columnIndex = table.children.findIndex(column => column.properties.Id === change.obj.pre.properties.Id)
            table.children[columnIndex] = change.obj.now
            refreshTableGraph.add(table)
          } else if (change.type === 'deleteColumn') {
            let table = this.dataByType.table[change.obj.pId]
            if (!table) {
              table = this.dataByType.view[change.obj.pId]
              refreshViewGraph.add(table)
            } else {
              refreshTableGraph.add(table)
            }
            let column = table.children.find(column => column.properties.Id === change.obj.id)
            this.$set(column.properties, 'deleted', true)
            refreshTableGraph.add(table)
          } else if (change.type === 'insertSubtype') {
            let table = this.dataByType.table[change.obj.pId]
            let column = table.children.find(column => column.properties.Id === change.obj.now.properties.Id)
            if (column) {
              this.$set(column.properties, 'deleted', false)
            } else {
              change.obj.now.properties.deleted = false
              table.children.push(change.obj.now)
            }
          } else if (change.type === 'modifySubtype') {
            let table = this.dataByType.table[change.obj.pId]
            let columnIndex = table.children.findIndex(column => column.properties.Id === change.obj.pre.properties.Id)
            table.children[columnIndex] = change.obj.now
            let diagrams = this.dataByType.diagram[this.currentId].children
            let shape = diagrams.find(shape => !shape.properties.deleted && shape.properties.SubTypeRef === change.obj.now.properties.Id)
            let cellList = this.graph.graph.getDefaultParent().children
            let cell = cellList.find(cell => cell.SubTypeRef === change.obj.now.properties.Id)
            cell.value = this.graph.drawSubTypeShape(shape, true)
            cell.style = this.graph.drawSubTypeStyle(cell)
            this.graph.graph.refresh(cell)
          } else if (change.type === 'deleteSubtype') {
            let table = this.dataByType.table[change.obj.pId]
            let column = table.children.find(column => column.properties.Id === change.obj.id)
            this.$set(column.properties, 'deleted', true)
          } else if (change.type === 'insertTable') {
            let table = this.dataByType.table[change.obj.id]
            this.$set(table.properties, 'deleted', false)
          } else if (change.type === 'modifyTableProperties') {
            this.dataByType.table[change.obj.id].properties = change.obj.now
            refreshTableGraph.add(this.dataByType.table[change.obj.id])
          } else if (change.type === 'deleteTable') {
            let table = this.dataByType.table[change.obj.id]
            this.$set(table.properties, 'deleted', true)
          } else if (change.type === 'insertShape') {
            let shape = this.dataByType.diagram[this.currentId].children.find(shape => shape.properties.Id === change.obj.id)
            if (shape) {
              this.$set(shape.properties, 'deleted', false)
            }
          } else if (change.type === 'modifyShape') {
            let children = this.dataByType.diagram[this.currentId].children
            let shapeIndex = children.findIndex(shape => shape.properties.Id === change.obj.now.properties.Id)
            children[shapeIndex] = change.obj.now
            let shape = children[shapeIndex]
            let cellList = this.graph.graph.getDefaultParent().children
            let cell = cellList.find(cell => cell.Id === change.obj.pre.properties.Id)
            // let cell = cellList.find(cell => cell.Id === ((this.cellDialogData && this.cellDialogData.Id) || (this.edgeDialogData && this.edgeDialogData.Id)))
            if (cell) {
              if (cell.isTable) {
                cell.value = await this.getTableHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
              } else if (cell.isView) {
                cell.value = await this.getViewHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
              } else if (cell.isComment) {
                cell.value = this.getCommentHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
              } else if (cell.isFigure) {
                cell.style = this.getFigureHTMLFunction(cell.Id, this.graph.graph, null, null, true)
                this.graph.graph.refresh(cell)
              } else if (cell.isSubType) {
                cell.value = this.graph.drawSubTypeShape(shape, true)
                cell.style = this.graph.drawSubTypeStyle(cell)
                this.graph.graph.refresh(cell)
              } else if (cell.edge) {
                cell.style = this.graph.drawEdgeShapeStyle(cell.Id)
                this.graph.graph.refresh(cell)
              }
              cell.changed = true
              cell.StyleThemeRef = shape.properties['StyleThemeRef']
              cell.StyleBackColor = shape.properties['StyleBackColor']
            }
          } else if (change.type === 'deleteShape') {
            let shape = this.dataByType.diagram[this.currentId].children.find(shape => shape.properties.Id === change.obj.id)
            if (shape) {
              shape.properties.deleted = true
            }
          } else if (change.type === 'insertConnection') {
            let connection = this.dataByType.diagram[this.currentId].children.find(shape => shape.properties.Id === change.obj.id)
            if (connection) {
              this.$set(connection.properties, 'deleted', false)
            }
          } else if (change.type === 'modifyConnection') {

          } else if (change.type === 'deleteConnection') {
            let connection = this.dataByType.diagram[this.currentId].children.find(shape => shape.properties.Id === change.obj.id)
            if (connection) {
              connection.properties.deleted = true
            }
          } else if (change.type === 'modifySize') {
            let shape = this.dataByType.diagram[this.currentId].children.find(item => item.properties.OwneeRef === change.obj.id)
            shape.properties.ShapeSize.height = change.obj.height
            shape.properties.ShapeSize.width = change.obj.width
            let table = this.dataByType.table[change.obj.id]
            if (table) {
              refreshTableGraph.add(this.dataByType.table[change.obj.id])
            } else {
              refreshViewGraph.add(this.dataByType.view[change.obj.id])
            }
            let cell = this.graph.graph.getDefaultParent().children.find(item => item.OwneeRef === change.obj.id)
            if (cell) {
              cell.geometry.width = change.obj.width
              cell.geometry.height = change.obj.height
              refreshCell.add(cell)
            }
          } else if (change.type === 'insertView') {
            let view = this.dataByType.view[change.obj.id]
            this.$set(view.properties, 'deleted', false)
          } else if (change.type === 'modifyViewProperties') {
            let view = this.dataByType.view[change.obj.id]
            view.properties = change.obj.now
            refreshViewGraph.add(view)
          } else if (change.type === 'deleteView') {
            let view = this.dataByType.view[change.obj.id]
            this.$set(view.properties, 'deleted', true)
          } else if (change.type === 'insertComment') {
            let comment = this.dataByType.comment[change.obj.id]
            this.$set(comment.properties, 'deleted', false)
          } else if (change.type === 'modifyCommentProperties') {
            let comment = this.dataByType.comment[change.obj.id]
            comment.properties.Text = change.obj.now
            refreshCommentGraph.add(comment)
          } else if (change.type === 'deleteComment') {
            let comment = this.dataByType.comment[change.obj.id]
            this.$set(comment.properties, 'deleted', true)
          } else if (change.type === 'insertTheme') {
            this.dataByType.theme[change.obj.id].properties.deleted = false
          } else if (change.type === 'modifyTheme') {
            // this.dataByType.theme[change.obj.id] = change.obj.now
            this.$set(this.dataByType.theme, change.obj.id, change.obj.now)
            if (this.dataByType.diagram[this.currentId].properties.StyleThemeRef === change.obj.id) {
              let cellList = this.graph.graph.getDefaultParent().children
              // cellList.forEach(async cell => {
              //   if (cell) {
              //     if (cell.isView || cell.isTable || cell.isComment || cell.isFigure) { // 因为有的Figure是edge组成的
              //       if (cell.isTable) {
              //         cell.value = await this.getTableHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
              //         let d = this.diagram.children.find(shape => !shape.properties.deleted && shape.properties.Id === cell.Id)
              //         if (d) {
              //           let roundSize = this.dataByType.table[cell.OwneeRef].properties.TypeId === 80100073 ? d.properties['BORoundingSize'] : d.properties['EntityRoundingSize']
              //           cell.style = STYLE.TABLE + (roundSize ? `rounded=1;perimeter=rectanglePerimeter;arcSize= ${roundSize}` : this.dataByType.table[cell.OwneeRef].properties.relied ? 'rounded=1;perimeter=rectanglePerimeter;arcSize=4' : '')
              //           this.graph.graph.refresh(cell)
              //         }
              //       } else if (cell.isView) {
              //         cell.value = await this.getViewHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
              //       } else if (cell.isComment) {
              //         cell.value = this.getCommentHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
              //       } else if (cell.isFigure) {
              //         cell.style = this.getFigureHTMLFunction(cell.Id, this.graph.graph, null, null, true)
              //         this.graph.graph.refresh(cell)
              //       }
              //     } else {
              //       cell.style = this.graph.drawEdgeShapeStyle(cell.Id)
              //       this.graph.graph.refresh(cell)
              //     }
              //     cell.changed = true
              //     if (cell.StyleThemeRef) {
              //       cell.StyleThemeRef = null // 为null采用主题域上应用的样式
              //     }
              //   }
              // })
              // this.graph.graph.getView().refresh()
              this.updateCellsStyle(cellList)
            }
          } else if (change.type === 'deleteTheme') {
            this.$set(this.dataByType.theme[change.obj.id].properties, 'deleted', true)
            if (this.dataByType.diagram[this.currentId].properties.StyleThemeRef !== change.obj.diagramNow) {
              this.dataByType.diagram[this.currentId].properties.StyleThemeRef = change.obj.diagramNow
              let cellList = this.graph.graph.getDefaultParent().children
              // cellList.forEach(async cell => {
              //   if (cell) {
              //     if (cell.isView || cell.isTable || cell.isComment || cell.isFigure) { // 因为有的Figure是edge组成的
              //       if (cell.isTable) {
              //         cell.value = await this.getTableHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
              //         let d = this.diagram.children.find(shape => !shape.properties.deleted && shape.properties.Id === cell.Id)
              //         if (d) {
              //           let roundSize = this.dataByType.table[cell.OwneeRef].properties.TypeId === 80100073 ? d.properties['BORoundingSize'] : d.properties['EntityRoundingSize']
              //           cell.style = STYLE.TABLE + (roundSize ? `rounded=1;perimeter=rectanglePerimeter;arcSize= ${roundSize}` : this.dataByType.table[cell.OwneeRef].properties.relied ? 'rounded=1;perimeter=rectanglePerimeter;arcSize=4' : '')
              //           this.graph.graph.refresh(cell)
              //         }
              //       } else if (cell.isView) {
              //         cell.value = await this.getViewHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
              //         let d = this.diagram.children.find(shape => !shape.properties.deleted && shape.properties.Id === cell.Id)
              //         if (d) {
              //           cell.style = STYLE.TABLE + (d.properties['EntityRoundingSize'] ? `rounded=1;perimeter=rectanglePerimeter;arcSize= ${d.properties['EntityRoundingSize']}` : '')
              //           this.graph.graph.refresh(cell)
              //         }
              //       } else if (cell.isComment) {
              //         cell.value = this.getCommentHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
              //       } else if (cell.isFigure) {
              //         cell.style = this.getFigureHTMLFunction(cell.Id, this.graph.graph, null, null, true)
              //         this.graph.graph.refresh(cell)
              //       }
              //     } else {
              //       cell.style = this.graph.drawEdgeShapeStyle(cell.Id)
              //       this.graph.graph.refresh(cell)
              //     }
              //     cell.changed = true
              //     if (cell.StyleThemeRef) {
              //       cell.StyleThemeRef = null // 为null采用主题域上应用的样式
              //     }
              //   }
              // })
              // this.graph.graph.getView().refresh()
              this.updateCellsStyle(cellList)
            }
            this.$parent.$parent.$parent.$parent.searchAll()
          } else if (change.type === 'applyTheme') {
            if (this.dataByType.diagram[this.currentId].properties.StyleThemeRef !== change.obj.diagramNow) {
              this.dataByType.diagram[this.currentId].properties.StyleThemeRef = change.obj.diagramNow
              // let d = this.diagrams.find(d => d.Id === this.currentId)
              // if (d) {
              //   d.StyleThemeRef = change.obj.diagramNow
              // }
              let d = this.mapIdToDiagramData[this.currentId]
              if (d) {
                d.StyleThemeRef = change.obj.diagramNow
              }
              let cellList = this.graph.graph.getDefaultParent().children
              // cellList.forEach(async cell => {
              //   if (cell) {
              //     if (cell.isView || cell.isTable || cell.isComment || cell.isFigure) { // 因为有的Figure是edge组成的
              //       if (cell.isTable) {
              //         cell.value = await this.getTableHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
              //       } else if (cell.isView) {
              //         cell.value = await this.getViewHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
              //       } else if (cell.isComment) {
              //         cell.value = this.getCommentHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
              //       } else if (cell.isFigure) {
              //         cell.style = this.getFigureHTMLFunction(cell.Id, this.graph.graph, null, null, true)
              //         this.graph.graph.refresh(cell)
              //       }
              //     } else {
              //       cell.style = this.graph.drawEdgeShapeStyle(cell.Id)
              //       this.graph.graph.refresh(cell)
              //     }
              //     cell.changed = true
              //     if (cell.StyleThemeRef) {
              //       cell.StyleThemeRef = null // 为null采用主题域上应用的样式
              //     }
              //   }
              // })
              // this.graph.graph.getView().refresh()
              this.updateCellsStyle(cellList)
            }
          } else if (change.type === 'modifyFigureLayer') {
            let children = this.graph.graph.getDefaultParent().children
            let cell = children.find(cell => cell.Id === change.obj.id)
            cell.OrderNumber = change.obj.now
            let shape = this.dataByType.diagram[this.currentId].children.find(shape => shape.properties.Id === cell.Id)
            shape.properties.OrderNumber = change.obj.now
            let figureList = children.filter(cell => cell.isFigure)
            figureList = figureList.sort((a, b) => (a.OrderNumber - b.OrderNumber || a.Id - b.Id))
            children.splice(0, figureList.length, ...figureList)
            this.graph.graph.getView().refresh()
          } else if (change.type === 'insertSchema') {
            this.dataByType.schema[change.obj.id].properties.deleted = false
          } else if (change.type === 'modifySchema') {
            this.dataByType.schema[change.obj.id] = change.obj.now
            // this.$set()
          } else if (change.type === 'deleteSchema') {
            this.$set(this.dataByType.schema[change.obj.id].properties, 'deleted', true)
            this.$parent.$parent.$parent.$parent.$forceUpdate()
          } else if (change.type === 'insertDiagram') {
            change.obj.children.splice(change.obj.index, 0, change.obj.item)
            this.$parent.$parent.$parent.$parent.diagramKey++
          } else if (change.type === 'deleteDiagram') {
            change.obj.children.splice(change.obj.index, 1)
            this.$parent.$parent.$parent.$parent.diagramKey++
          } else if (change.type === 'modifyDiagram') {
            let realDiagramIndex = null
            // if (change.obj.now.ParentRef) {
            //   realDiagramIndex = change.obj.now.ParentRef.children.findIndex(diagram => diagram.Id === change.obj.id)
            //   change.obj.now.ParentRef.children[realDiagramIndex] = change.obj.now
            // } else {
            //   realDiagramIndex = this.diagrams.findIndex(diagram => diagram.Id === change.obj.id)
            //   this.diagrams[realDiagramIndex] = change.obj.now
            // }
            _.merge(this.mapIdToDiagramData[change.obj.id], change.obj.now)
            // this.$parent.$parent.$parent.$parent.diagramKey++
            this.$bus.$emit('updateDiagramData')
          } else if (change.type === 'modifyModel') {
            Object.assign(this.modelData, change.obj.now)
          } else if (change.type === 'modifyNamingOption') {
            this.dataByType.namingOption = change.obj.now
          } else if (change.type === 'modifyNamingOptionAndApply') {
            this.dataByType.namingOption = change.obj.now
            change.obj.tableNow.forEach(async (item, index) => {
              let table = this.dataByType.table[item.properties.Id]
              table.properties.Name = item.properties.Name
              table.children && table.children.forEach((c, j) => {
                if (item.children[j].properties.Macro) {
                  c.properties.Macro = item.children[j].properties.Macro
                }
                c.properties.Name = item.children[j].properties.Name
              })
              let cell = this.graph.graph.getDefaultParent().children.find(cell => cell.OwneeRef === table.properties.Id)
              if (cell) {
                cell.value = await this.getTableHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
                this.graph.graph.refresh(cell)
              }
            })
            let viewList = Object.values(this.dataByType.view).filter(i => !i.properties.deleted)
            change.obj.viewNow.forEach(async (item, index) => {
              let view = this.dataByType.view[item.properties.Id]
              view.properties.Name = item.properties.Name
              view.children && view.children.forEach((c, j) => {
                if (item.children[j].properties.Macro) {
                  c.properties.Macro = item.children[j].properties.Macro
                }
                c.properties.Name = item.children[j].properties.Name
              })
              let cell = this.graph.graph.getDefaultParent().children.find(cell => cell.OwneeRef === view.properties.Id)
              if (cell) {
                cell.value = await this.getViewHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
                this.graph.graph.refresh(cell)
              }
            })
            // this.graph.graph.getView().refresh()
          } else if (change.type === 'constituteFigure') {
            let diagrams = this.dataByType.diagram[this.currentId].children
            let shape = diagrams.find(shape => !shape.properties.deleted && shape.properties.Id === change.obj.id)
            shape.properties.CompostedShapesRef = change.obj.now
          } else if (change.type === 'cancelConstituteFigure') {
            let diagrams = this.dataByType.diagram[this.currentId].children
            let shape = diagrams.find(shape => !shape.properties.deleted && shape.properties.Id === change.obj.id)
            shape.properties.CompostedShapesRef = change.obj.now
          } else if (change.type === 'modifyUdps') {
            this.dataByType.udp = change.obj.now
          } else if (change.type === 'modelCopy') {
            let model = change.obj.model
            Object.values(model.table).forEach(table => {
              if (table.properties.needReplaceId) {
                this.dataByType.table[table.properties.Id].properties.deleted = false
              }
            })
            Object.values(model.view).forEach(view => {
              if (view.properties.needReplaceId) {
                this.dataByType.view[view.properties.Id].properties.deleted = false
              }
            })
            Object.values(model.comment).forEach(comment => {
              if (comment.properties.needReplaceId) {
                this.dataByType.comment[comment.properties.Id].properties.deleted = false
              }
            })
            Object.values(model.relation).forEach(relation => {
              if (relation.properties.needReplaceId) {
                this.dataByType.relation[relation.properties.Id].properties.deleted = false
              }
            })
            model.diagram.forEach(shape => {
              this.$set(shape.properties, 'deleted', false)
            })
          }
        }
      }
      for (let table of refreshTableGraph) { // 重新渲染table
        let html = await this.getTableHTMLFunction(table.properties.Id, this.graph.graph, null, null, true)
        let source = this.graph.graph.getDefaultParent().children.find(currentCell => currentCell.OwneeRef === table.properties.Id)
        if (source) {
          source.value = html
        } else {
          source = this.deleteGraph.find(currentCell => currentCell.OwneeRef === table.properties.Id)
          if (source) {
            source.value = html
          }
        }
      }
      for (let view of refreshViewGraph) { // 重新渲染table
        let html = await this.getViewHTMLFunction(view.properties.Id, this.graph.graph, null, null, true)
        let source = this.graph.graph.getDefaultParent().children.find(currentCell => currentCell.OwneeRef === view.properties.Id)
        if (source) {
          source.value = html
        } else {
          source = this.deleteGraph.find(currentCell => currentCell.OwneeRef === view.properties.Id)
          if (source) {
            source.value = html
          }
        }
      }
      for (let comment of refreshCommentGraph) { // 重新渲染备注
        let html = this.getCommentHTMLFunction(comment.properties.Id, this.graph.graph, null, null, true)
        let source = this.graph.graph.getDefaultParent().children.find(currentCell => currentCell.OwneeRef === comment.properties.Id)
        if (source) {
          source.value = html
        } else {
          source = this.deleteGraph.find(currentCell => currentCell.OwneeRef === comment.properties.Id)
          if (source) {
            source.value = html
          }
        }
      }
      for (let cell of refreshCell) {
        this.graph.graph.refresh(cell) // 修改边框
      }
      this.graph.graph.getView().refresh() // 修改cell大小
    },
    async closeEdgeDialog (done) {
      if (this.closing && this.closingTimer) {
        return
      }
      this.closing = true
      this.closingTimer = setTimeout(() => {
        this.closing = false
        this.closingTimer = null
      }, 1000)
      let changed = await this.$refs.edgeDetailsEdit.save()
      if (changed) {
        this.hasEdit = true
      }
      done()
    },
    async closeEntityDialog (done) {
      // 编辑表 结束后回调
      if (this.closing && this.closingTimer) {
        return
      }
      this.closing = true
      this.closingTimer = setTimeout(() => {
        this.closing = false
        this.closingTimer = null
      }, 1000)
      let changes = await this.$refs.tableDetailsEdit.save()
      if (!changes) {
        return false
      }
      let data = new LayerEdit(changes)
      if (changes && changes.length) {
        this.hasEdit = true
        this.dataByType.table[this.currentEditTableId].properties.changed = true
        this.graph.editor.undoManager.undoableEditHappened(data)
        // 调整高度
        this.handleResize(true, true)
        // this.showLogicalNameOrPhysicalName()
        done()
      } else if (Array.isArray(changes)) {
        done()
      }
      setTimeout(() => {
        this.refreshGraphShowDetail()
      }, 100)
      return true
    },
    async closeViewDialog (done) {
      if (this.closing && this.closingTimer) {
        return
      }
      this.closing = true
      this.closingTimer = setTimeout(() => {
        this.closing = false
        this.closingTimer = null
      }, 1000)
      let changes = await this.$refs.viewDetailsEdit.save()
      if (!changes) {
        return false
      }
      let data = new LayerEdit(changes)
      if (changes && changes.length) {
        this.hasEdit = true
        this.dataByType.view[this.currentEditViewId].properties.changed = true
        this.graph.editor.undoManager.undoableEditHappened(data)
        // 调整高度
        this.handleResize(true, true)
        // this.showLogicalNameOrPhysicalName()
        done()
      } else if (Array.isArray(changes)) {
        done()
      }
      return true
    },
    closeCommentDialog (done) {
      if (this.closing && this.closingTimer) {
        return
      }
      this.closing = true
      this.closingTimer = setTimeout(() => {
        this.closing = false
        this.closingTimer = null
      }, 1000)
      let changes = []
      let shape = this.dataByType.diagram[this.currentId].children.find(shape => shape.properties.Id === this.cellDialogData.Id)
      this.formatTextFontSimpleBack(this.currentStyleRelatedShapeTemplate)
      let aStr = JSON.stringify(this.currentStyleRelatedShapeTemplate, ['StyleTextColor', 'StyleFont', 'StyleThemeRef'])
      let bStr = JSON.stringify(shape.properties, ['StyleTextColor', 'StyleFont', 'StyleThemeRef'])
      if (aStr === bStr) {

      } else {
        let change = new Changes('modifyShape', {
          id: shape.properties.Id,
          name: shape.properties.Name,
          pre: _.cloneDeep(shape),
          now: null
        })
        shape.properties = this.currentStyleRelatedShapeTemplate
        shape.properties.changed = true
        let cell = this.graph.graph.getDefaultParent().children?.find(cell => !cell.deleted && cell.Id === shape.properties.Id)
        if (cell) {
          cell.changed = true
        }
        change.obj.now = _.cloneDeep(shape)
        changes.push(change)
      }

      let comment = this.dataByType.comment[this.currentEditCommentId]
      if (comment.properties.Text !== this.commentDialogData) {
        changes.push(new Changes('modifyCommentProperties', {
          id: this.currentEditCommentId,
          name: comment.properties.Name,
          pre: comment.properties.Text,
          now: this.commentDialogData
        }))
        this.$set(comment.properties, 'Text', this.commentDialogData)
        // comment.properties.Text = this.commentDialogData
        comment.properties.changed = true
      }
      if (changes.length) {
        let data = new LayerEdit(changes)
        this.hasEdit = true
        this.graph.editor.undoManager.undoableEditHappened(data)
        let cell = this.graph.graph.getDefaultParent().children.find(cell => cell.OwneeRef === this.currentEditCommentId)
        if (cell) {
          cell.StyleThemeRef = shape.properties['StyleThemeRef']
          cell.StyleFont = shape.properties['StyleFont']
          cell.StyleTextColor = shape.properties['StyleTextColor']
          cell.value = this.getCommentHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
          this.graph.graph.getView().refresh()
        }
      }
      done()
    },
    async closeColDialog (done) {
      if (this.closing && this.closingTimer) {
        return
      }
      this.closing = true
      this.closingTimer = setTimeout(() => {
        this.closing = false
        this.closingTimer = null
      }, 1000)
      let changes = await this.$refs.colDetails.save()
      let data = new LayerEdit(changes)
      if (changes.length) {
        this.hasEdit = true
        this.dataByType.table[this.currentEditTableId].properties.changed = true
        this.graph.editor.undoManager.undoableEditHappened(data)
      }
      done()
    },
    async closeViewColDialog (done) {
      if (this.closing && this.closingTimer) {
        return
      }
      this.closing = true
      this.closingTimer = setTimeout(() => {
        this.closing = false
        this.closingTimer = null
      }, 1000)
      try {
        let result = await this.$refs.viewColDetails.save()
        let { changes, isNewHistory } = result
        if (isNewHistory) {
          let data = new LayerEdit(changes)
          if (changes.length) {
            this.hasEdit = true
            this.dataByType.view[this.currentEditViewId].properties.changed = true
            this.graph.editor.undoManager.undoableEditHappened(data)
          }
        } else {
          setTimeout(() => {
            this.$set(this.graph.editor.undoManager.history[this.graph.editor.undoManager.indexOfNextAdd - 1].changes[0], 'changes', changes)
          }, 100)
        }
        done()
      } catch (err) {
        console.log(err)
      } finally {

      }
    },
    closeModelDialog (done) {
      if (this.closing && this.closingTimer) {
        return
      }
      this.closing = true
      this.closingTimer = setTimeout(() => {
        this.closing = false
        this.closingTimer = null
      }, 1000)
      let changes = this.$refs.modelDetails.save()
      if (!changes) {
        return
      }
      if (changes.length) {
        let data = new LayerEdit(changes)
        this.hasEdit = true
        this.graph.editor.undoManager.undoableEditHappened(data)
      }
      done()
    },
    closeDiagramDialog (done) {
      if (this.closing && this.closingTimer) {
        return
      }
      this.closing = true
      this.closingTimer = setTimeout(() => {
        this.closing = false
        this.closingTimer = null
      }, 1000)
      let changes = this.$refs.diagramDetails.save()
      if (!changes) {
        return
      }
      if (changes.length) {
        let data = new LayerEdit(changes)
        this.hasEdit = true
        this.graph.editor.undoManager.undoableEditHappened(data)
        this.$bus.$emit('updateDiagramData')
      }
      done()
    },
    async closeSubtypeDialog (done) {
      if (this.closing && this.closingTimer) {
        return
      }
      this.closing = true
      this.closingTimer = setTimeout(() => {
        this.closing = false
        this.closingTimer = null
      }, 1000)
      let changed = await this.$refs.subtypeDetailEdit.save()
      if (changed) {
        this.hasEdit = true
      }
      done()
    },
    async deleteTheme (theme) {
      let diagram = this.dataByType.diagram[this.currentId]
      let cellList = this.graph.graph.getDefaultParent().children
      this.tmpThemeDataChange = new LayerEdit([new Changes('deleteTheme', {
        id: theme.properties.Id,
        name: theme.properties.Name,
        diagramPre: _.cloneDeep(diagram.properties.StyleThemeRef)
      })])
      if (diagram.properties.StyleThemeRef === theme.properties.Id) {
        diagram.properties.StyleThemeRef = null
        diagram.properties.changed = true
      }
      theme.properties.deleted = true
      this.tmpThemeDataChange.changes[0].obj.diagramNow = _.cloneDeep(diagram.properties.StyleThemeRef)
      this.graph.editor.undoManager.undoableEditHappened(this.tmpThemeDataChange)
      this.tmpThemeDataChange = null
      for (let i = 0; i < diagram.children.length; i++) {
        let shape = diagram.children[i]
        let cell = cellList.find(cell => cell.Id === shape.properties.Id)
        if (cell) {
          if (cell.isView || cell.isTable || cell.isComment || cell.isFigure) { // 因为有的Figure是edge组成的
            if (cell.isTable) {
              cell.value = await this.getTableHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
              let d = this.diagram.children.find(shape => !shape.properties.deleted && shape.properties.Id === cell.Id)
              if (d) {
                let roundSize = this.dataByType.table[cell.OwneeRef].properties.TypeId === 80100073 ? d.properties['BORoundingSize'] : d.properties['EntityRoundingSize']
                cell.style = STYLE.TABLE + (roundSize ? `rounded=1;perimeter=rectanglePerimeter;arcSize= ${roundSize}` : this.dataByType.table[cell.OwneeRef].properties.relied ? 'rounded=1;perimeter=rectanglePerimeter;arcSize=4' : '')
                this.graph.graph.refresh(cell)
              }
            } else if (cell.isView) {
              cell.value = await this.getViewHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
              let d = this.diagram.children.find(shape => !shape.properties.deleted && shape.properties.Id === cell.Id)
              if (d) {
                cell.style = STYLE.TABLE + (d.properties['EntityRoundingSize'] ? `rounded=1;perimeter=rectanglePerimeter;arcSize= ${d.properties['EntityRoundingSize']}` : '')
                this.graph.graph.refresh(cell)
              }
            } else if (cell.isComment) {
              cell.value = this.getCommentHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
            } else if (cell.isFigure) {
              cell.style = this.getFigureHTMLFunction(cell.Id, this.graph.graph, null, null, true)
              this.graph.graph.refresh(cell)
            }
          } else {
            cell.style = this.graph.drawEdgeShapeStyle(cell.Id)
            this.graph.graph.refresh(cell)
          }
          cell.changed = true
          if (cell.StyleThemeRef) {
            cell.StyleThemeRef = null // 为null采用主题域上应用的样式
          }
        }
      }
      // diagram.children.forEach(async shape => {
      //   // if (shape.properties.StyleThemeRef === theme.properties.Id) {
      //   //   delete shape.properties.StyleThemeRef
      //   // }
      //
      // })
      this.$forceUpdate()
      this.graph.graph.getView().refresh()
      this.hasEdit = true
    },
    deleteSchema (schema) {
      this.graph.editor.undoManager.undoableEditHappened(
        new LayerEdit([new Changes('deleteSchema', {
          id: schema.properties.Id,
          name: schema.properties.Name
        })]))
      this.$set(schema.properties, 'delete', true)
      // schema.properties.deleted = true
    },
    resetStyleConfirm () {
      this.currentStyleRelatedShapeTemplate['StyleBackColor'] = ''
      this.currentStyleRelatedShapeTemplate['StyleBackColor2'] = ''
      this.currentStyleRelatedShapeTemplate['StyleThemeRef'] = null
    },
    async editStyleConfirm () {
      let shape = this.dataByType.diagram[this.currentId].children.find(shape => shape.properties.Id === this.edgeDialogData.Id)
      shape.properties = this.currentStyleRelatedShapeTemplate
      let arr = []
      if (shape.properties['StyleBackColor2'] && shape.properties['StyleBackColor2'].indexOf('rgba') !== -1) {
        arr = shape.properties['StyleBackColor2'].split(',')
        shape.properties['StyleBackColor2'] = `ARGBColor:${(parseFloat(arr[3].slice(1, -1)) * 255).toFixed(0)}:${arr[0].slice(5)}:${arr[1].slice(1)}:${arr[2].slice(1)}`
      }
      if (shape.properties['StyleBackColor'] && shape.properties['StyleBackColor'].indexOf('rgba') !== -1) {
        arr = shape.properties['StyleBackColor'].split(',')
        shape.properties['StyleBackColor'] = `ARGBColor:${(parseFloat(arr[3].slice(1, -1)) * 255).toFixed(0)}:${arr[0].slice(5)}:${arr[1].slice(1)}:${arr[2].slice(1)}`
      }
      let cellList = this.graph.graph.getDefaultParent().children
      let cell = cellList.find(cell => cell.Id === this.edgeDialogData.Id)
      if (cell) {
        if (cell.isTable) {
          cell.value = await this.getTableHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
        } else if (cell.isView) {
          cell.value = await this.getViewHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
        } else if (cell.isComment) {
          cell.value = this.getCommentHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
        } else if (cell.isFigure) {
          cell.style = this.getFigureHTMLFunction(cell.Id, this.graph.graph, null, null, true)
          this.graph.graph.refresh(cell)
        }
        cell.changed = true
        cell.StyleThemeRef = shape.properties['StyleThemeRef']
        cell.StyleBackColor2 = shape.properties['StyleBackColor2']
        cell.StyleBackColor = shape.properties['StyleBackColor']
      }
      shape.properties.changed = true
      this.graph.graph.getView().refresh()
      this.editStyleDialg = false
      this.hasEdit = true
    },
    async updateCellsStyle (cellList) {
      for (let i = 0; i < cellList.length; i++) {
        let cell = cellList[i]
        if (cell) {
          if (cell.isView || cell.isTable || cell.isComment || cell.isFigure) { // 因为有的Figure是edge组成的
            if (cell.isTable) {
              cell.value = await this.getTableHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
              let d = this.diagram.children.find(shape => !shape.properties.deleted && shape.properties.Id === cell.Id)
              if (d) {
                let roundSize = this.dataByType.table[cell.OwneeRef].properties.TypeId === 80100073 ? d.properties['BORoundingSize'] : d.properties['EntityRoundingSize']
                cell.style = STYLE.TABLE + (roundSize ? `rounded=1;perimeter=rectanglePerimeter;arcSize= ${roundSize}` : this.dataByType.table[cell.OwneeRef].properties.relied ? 'rounded=1;perimeter=rectanglePerimeter;arcSize=4' : '')
                this.graph.graph.refresh(cell)
              }
            } else if (cell.isView) {
              cell.value = await this.getViewHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
              let d = this.diagram.children.find(shape => !shape.properties.deleted && shape.properties.Id === cell.Id)
              if (d) {
                cell.style = STYLE.TABLE + (d.properties['EntityRoundingSize'] ? `rounded=1;perimeter=rectanglePerimeter;arcSize= ${d.properties['EntityRoundingSize']}` : '')
                this.graph.graph.refresh(cell)
              }
            } else if (cell.isComment) {
              cell.value = this.getCommentHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
            } else if (cell.isFigure) {
              cell.style = this.getFigureHTMLFunction(cell.Id, this.graph.graph, null, null, true)
              this.graph.graph.refresh(cell)
            }
          } else {
            cell.style = this.graph.drawEdgeShapeStyle(cell.Id)
            this.graph.graph.refresh(cell)
          }
          cell.changed = true
          if (cell.StyleThemeRef) {
            cell.StyleThemeRef = null // 为null采用主题域上应用的样式
          }
        }
      }
      this.graph.graph.getView().refresh()
    },
    applyThemeToGraph (theme) {
      let diagram = this.dataByType.diagram[this.currentId]
      this.graph.editor.undoManager.undoableEditHappened(new LayerEdit([new Changes('applyTheme', {
        id: theme.properties.Id,
        name: theme.properties.Name,
        diagramPre: diagram.properties.StyleThemeRef,
        diagramNow: theme.properties.Id
      })]))
      diagram.properties.StyleThemeRef = theme.properties.Id
      diagram.properties.changed = true
      let d = this.mapIdToDiagramData[diagram.properties.Id]
      if (d) {
        d.changed = true
        d.StyleThemeRef = theme.properties.Id
      }
      let cellList = this.graph.graph.getDefaultParent().children
      // cellList.forEach(async cell => {
      //   if (cell) {
      //     if (cell.isView || cell.isTable || cell.isComment || cell.isFigure) { // 因为有的Figure是edge组成的
      //       if (cell.isTable) {
      //         cell.value = await this.getTableHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
      //         let d = this.diagram.children.find(shape => !shape.properties.deleted && shape.properties.Id === cell.Id)
      //         if (d) {
      //           let roundSize = this.dataByType.table[cell.OwneeRef].properties.TypeId === 80100073 ? d.properties['BORoundingSize'] : d.properties['EntityRoundingSize']
      //           cell.style = STYLE.TABLE + (roundSize ? `rounded=1;perimeter=rectanglePerimeter;arcSize= ${roundSize}` : this.dataByType.table[cell.OwneeRef].properties.relied ? 'rounded=1;perimeter=rectanglePerimeter;arcSize=4' : '')
      //           this.graph.graph.refresh(cell)
      //         }
      //       } else if (cell.isView) {
      //         cell.value = await this.getViewHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
      //         let d = this.diagram.children.find(shape => !shape.properties.deleted && shape.properties.Id === cell.Id)
      //         if (d) {
      //           cell.style = STYLE.TABLE + (d.properties['EntityRoundingSize'] ? `rounded=1;perimeter=rectanglePerimeter;arcSize= ${d.properties['EntityRoundingSize']}` : '')
      //           this.graph.graph.refresh(cell)
      //         }
      //       } else if (cell.isComment) {
      //         cell.value = this.getCommentHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
      //       } else if (cell.isFigure) {
      //         cell.style = this.getFigureHTMLFunction(cell.Id, this.graph.graph, null, null, true)
      //         this.graph.graph.refresh(cell)
      //       }
      //     } else {
      //       cell.style = this.graph.drawEdgeShapeStyle(cell.Id)
      //       this.graph.graph.refresh(cell)
      //     }
      //     cell.changed = true
      //     if (cell.StyleThemeRef) {
      //       cell.StyleThemeRef = null // 为null采用主题域上应用的样式
      //     }
      //   }
      // })
      this.updateCellsStyle(cellList)
      diagram.properties.changed = true
      // this.graph.graph.getView().refresh()
      this.hasEdit = true
    },
    formatThemeTemplateData (themeTemplate) {
      let obj = {}
      for (let key in themeTemplate) {
        if (themeTemplate.hasOwnProperty(key)) {
          if (key.indexOf('Color') !== -1) {
            let color = DrawGraph.colorFormatter(themeTemplate[key] || '')
            if (this.colorToRgba[color]) {
              obj[key] = this.colorToRgba[color]
            } else {
              obj[key] = color
            }
          } else if (key.indexOf('Font') !== -1) {
            let value = themeTemplate[key]
            if (!value) {
              break
            }
            let arr = value.split(',')
            obj[key + 'Family'] = null
            obj[key + 'Size'] = null
            obj[key + 'BoldItalic'] = ''
            obj[key + 'UnderLine'] = false
            obj[key + 'LineThrough'] = false
            if (arr.length >= 2) {
              obj[key + 'Family'] = arr[0]
              obj[key + 'Size'] = arr[1].slice(0, -2)
              if (value.indexOf('Bold') !== -1) {
                obj[key + 'BoldItalic'] += 'Bold'
              }
              if (value.indexOf('Italic') !== -1) {
                obj[key + 'BoldItalic'] += 'Italic'
              }
              if (value.indexOf('Underline') !== -1) {
                obj[key + 'UnderLine'] = true
              }
              if (value.indexOf('Strikeout') !== -1) {
                obj[key + 'LineThrough'] = true
              }
            }
          } else {
            obj[key] = themeTemplate[key]
          }
        }
      }
      obj.StyleThemeRef = themeTemplate.StyleThemeRef
      if (!obj.StyleBackColor) {
        obj.StyleBackColor = ''
      }
      if (!obj.StyleBackColor2) {
        obj.StyleBackColor2 = ''
      }
      if (!obj.StyleTextColor) {
        obj.StyleTextColor = ''
      }
      if (!obj.StyleFontUnderLine) {
        obj.StyleFontUnderLine = ''
      }
      if (!obj.StyleFontLineThrough) {
        obj.StyleFontLineThrough = ''
      }
      return obj
    },
    createComment () {
      this.clearRelationConnect()
      this.newCommentDrag(this.graph.graph)
    },
    createTable () {
      this.clearRelationConnect()
      this.newEntityDrag(this.graph.graph)
    },
    createBusiness () {
      this.clearRelationConnect()
      this.newBusinessDrag(this.graph.graph)
    },
    createView () {
      this.clearRelationConnect()
      this.newViewDrag(this.graph.graph)
    },
    createFigure () {
      this.clearRelationConnect()
      this.newFigureDrag(this.graph.graph)
    },
    editItem (item) {
      let cell = this.graph.graph.getDefaultParent().children.find(cell => cell.OwneeRef === item.properties.Id)
      if (cell) {
        this.editLayer(cell)
      }
      // } else {
      //   if (this.dataByType.diagram[this.currentId].children) {
      //     this.cellDialogData = null
      //     this.edgeDialogData = null
      //     this.currentStyleRelatedShapeTemplate = null
      //   }
      //   if (item.properties.TypeId === 80500008) { // View
      //     this.afterHandleViewDialogData(item.properties.Id, true)
      //   } else if (item.properties.TypeId === 80000004) { // Table
      //     this.afterHandleDialogData(item.properties.Id, true)
      //   } else if (item.properties.TypeId === 80000027) { // Comment
      //     this.afterHandleCommentData(item.properties.Id)
      //   } else { // Relation
      //     this.edgeDialogKey++
      //     this.edgeDialog = true
      //   }
      // }
    },
    editDiagram (digram) {
      Object.assign(this.diagramData, digram)
      this.diagramDialog = true
      this.diagramKey++
    },
    editModel () {
      this.modelData = _.cloneDeep(this.currentModel)
      this.modelDialog = true
      this.modelKey++
    },
    deleteItem (item) {
      this.$DatablauCofirm(`确定要刪除${item.properties.TypeId === LDMTypes.Comment ? '文本' : item.properties.Name}？`, '', {
        type: 'warning'
      }).then(() => {
        this.deletedCell = this.graph.graph.getDefaultParent().children.find(cell => cell.OwneeRef === item.properties.Id)
        let cell = this.deletedCell
        if (cell) {
          cell.deleteReal = true // 物理删除
          this.realDelete = true // 物理
          if (cell.isView || cell.isTable || cell.isComment || cell.isFigure || cell.isSubType) { // 因为有的Figure是edge组成的
            this.currentOperate = 'deleteTable'
            this.deleteGraph.push(cell)
            // 删除与此shape相关的线 （关联的线会在change事件中实际删除）
            // let cellList = this.graph.graph.getDefaultParent().children
            // let edgeList = cellList.filter(edge => edge.edge && (edge.target.OwneeRef === cell.OwneeRef || edge.source.OwneeRef === cell.OwneeRef))
            // if (edgeList) {
            //   edgeList.forEach(edge => {
            //     edge.deleteReal = true
            //   })
            // }
          } else {
            this.currentOperate = 'deleteEdge'
          }
          this.graph.graph.setSelectionCell(cell)
          // this.graph.editor.execute('delete', cell)
          if (this.currentOperate === 'deleteEdge' && cell.type === 'Subtype') {
            if (cell.subtypeTopEdge) { // subtype top的connection删除的话须同时删除subtype的shape(目前仅删除subtype的shape就可以了，其他线会关联删除)
              let subtypeCell = cell.target
              this.graph.graph.removeCells([subtypeCell])
            } else { // 删除subtype下面最后一个关系，需要删除整个关系
              let subtypeCell = cell.source
              if (subtypeCell.edges.length <= 2) {
                if (Object.values(this.dataByType.relation).filter(relation => !relation.properties.deleted && relation.properties.ParentEntityRef === subtypeCell.ParentTableId && relation.properties.ChildEntityRef !== subtypeCell.SubTypeRef && relation.properties.SubTypeRef === subtypeCell.SubTypeRef).length >= 2) { // 如果有别的subtype关系，则保留subtype和subtypeTopEdge关系，相关shape删除
                  this.retainSubTypeAndTopRelation = true // retainSubTypeAndTopRelation为true表明不删除subtype实体和top的关系
                }
                this.graph.graph.removeCells([subtypeCell])
              } else {
                this.graph.editor.execute('delete')
              }
            }
          } else {
            if (cell.edges) {
              this.graph.graph.addSelectionCells(cell.edges.filter(edge => edge.target.isSubType).map(edge => edge.target)) // 把表的subtype添加到删除序列
              this.graph.graph.addSelectionCells(cell.edges.filter(edge => edge.source.isSubType && (edge.source.edges.length <= 2)).map(edge => edge.source)) // 把表的subtype添加到删除序列
            }
            this.graph.editor.execute('delete')
          }
        } else {
          this.$set(item.properties, 'deleted', true)
          this.graph.editor.undoManager.undoableEditHappened(new LayerEdit([new Changes('delete' + (item.properties.TypeId === 80500008 ? 'View' : item.properties.TypeId === 80000004 ? 'Table' : item.properties.TypeId === 80000027 ? 'Comment' : 'Relation'), {
            id: item.properties.Id,
            name: item.properties.Name
          })]))
        }
      }).catch(() => {

      })
    },
    createRelationLayer () {
      this.edgeDialogData = {
        isCreated: true,
        name: '',
        source: {
          OwneeRef: null
        },
        target: {
          OwneeRef: null
        },
        ParentKeyRef: null,
        ChildKeyRef: null
      }
      this.edgeDialogKey++
      this.createEdgeDialog = true
    },
    createTheme () {
      this.emptyStyleNum = this.deliverNum.seed++
      this.activeThemeTab = 'table'
      // this.formatThemeDataCopy = _.cloneDeep(this.formatThemeTemplateData(this.themeCreateTemplate))
      this.themeData = _.cloneDeep(this.themeCreateTemplate)
      this.themeData.Id = this.emptyStyleNum++
      this.themeData.Name += this.themeData.Id
      // this.themeDialog = true

      this.$set(this.dataByType.theme, [this.themeData.Id], {
        'properties': {
          ...this.themeData,
          UniqueId: uuidv4(),
          new: true
        },
        'objectClass': 'Datablau.LDM.StyleTheme'
      })
      this.graph.editor.undoManager.undoableEditHappened(new LayerEdit([new Changes('insertTheme', {
        id: this.themeData.Id,
        name: this.themeData.Name
      })]))
      this.$parent.$parent.$parent.$parent.searchAll()
    },
    createSchema () {
      // let Id = this.emptySchemaNum++
      let Id = this.deliverNum.seed++
      let maxId = 0
      for (let id in this.dataByType.schema) {
        let arr = this.dataByType.schema[id].properties.Name.split('_')
        let num = arr && parseInt(arr[1])
        if (!isNaN(num) && num > maxId) {
          maxId = num
        }
      }
      let schema = {
        properties: {
          Name: `Schema_${++maxId}`,
          Id,
          RawType: 'Schema',
          TypeId: 80700001,
          UniqueId: uuidv4(),
          new: true
        },
        objectClass: 'Datablau.LDM.Schema'
      }
      this.$set(this.dataByType.schema, [Id], schema)
      this.graph.editor.undoManager.undoableEditHappened(new LayerEdit([new Changes('insertSchema', {
        id: schema.properties.Id,
        name: schema.properties.Name
      })]))
      this.$parent.$parent.$parent.$parent.searchAll()
    },
    modSchema (schema, preSchema) {
      schema.properties.changed = true
      this.graph.editor.undoManager.undoableEditHappened(new LayerEdit([new Changes('modifySchema', {
        id: schema.properties.Id,
        name: schema.properties.Name,
        pre: preSchema,
        now: schema
      })]))
    },
    processThemeData (theme) {
      this.activeThemeTab = 'table'
      this.themeData = theme.properties
      this.formatThemeDataCopy = _.cloneDeep(this.formatThemeData())
      this.tmpThemeDataChange = new LayerEdit([new Changes('modifyTheme', {
        id: this.formatThemeDataCopy.Id,
        name: this.formatThemeDataCopy.Name,
        pre: _.cloneDeep(theme),
        preFormat: _.cloneDeep(this.formatThemeDataCopy)
      })])
      this.themeDialog = true
    },
    calculateStartIdToEndIds () {
      let startIndexToRelationList = {}
      let startIndexToIndentify = {}
      for (let key in this.dataByType.relation) {
        let relation = this.dataByType.relation[key]
        if (!relation.properties.deleted && (relation.objectClass === 'Datablau.LDM.RelationshipRelational' || relation.objectClass === 'Datablau.LDM.RelationshipSubtype')) {
          if (startIndexToRelationList[relation.properties.ParentEntityRef]) {
            startIndexToRelationList[relation.properties.ParentEntityRef].push(relation.properties.ChildEntityRef)
          } else {
            startIndexToRelationList[relation.properties.ParentEntityRef] = [relation.properties.ChildEntityRef]
          }
          if (relation.properties.RelationalType === 'Identifying') {
            if (startIndexToIndentify[relation.properties.ParentEntityRef]) {
              startIndexToIndentify[relation.properties.ParentEntityRef].push(relation.properties.ChildEntityRef)
            } else {
              startIndexToIndentify[relation.properties.ParentEntityRef] = [relation.properties.ChildEntityRef]
            }
          }
        }
      }
      this.startIdToEndIds = startIndexToRelationList // 包括主键和非主键的子表id
      this.startIdToEndIdsByIndentify = startIndexToIndentify // 仅主键的子表id,用于是否产生环的判断
    },
    isCircle (source, target) {
      this.calculateStartIdToEndIds()
      return this.circleLoop(target.properties.Id, source.properties.Id, this.startIdToEndIdsByIndentify, [])
    },
    circleLoop (startOweeRef, endOweeRef, startIndexToRelationList, path) {
      if (startOweeRef === endOweeRef) {
        return true
      }
      if (startIndexToRelationList[startOweeRef]) {
        let currentEndOweeRefList = startIndexToRelationList[startOweeRef]
        for (let item of currentEndOweeRefList) {
          let p = _.cloneDeep(path)
          p.push(item)
          if (item === endOweeRef) {
            return true
          } else {
            if (this.circleLoop(item, endOweeRef, startIndexToRelationList, p)) {
              return true
            }
          }
        }
      } else {
        return false
      }
    },
    deleteInThemeConfirm () {
      let cell = this.deletedCell
      cell.deleteReal = false // 主题域删除
      this.realDelete = false // 应对选择多个表
      if (cell.isView || cell.isTable || cell.isComment || cell.isFigure || cell.isSubType) { // 因为有的Figure是edge组成的
        this.currentOperate = 'deleteTable'
        // 找到shape的直接id删除
        // this.deleteGraph.push(cell)

        // delete this.graph.shapes[cell.OwneeRef]
        // delete this.graph.dataByType.table[cell.OwneeRef].posit.Id

        // 删除与此shape相关的线 （关联的线会在change事件中实际删除）
        // let cellList = this.graph.graph.getDefaultParent().children
        // let edgeList = cellList.filter(edge => edge.edge && (edge.target.OwneeRef === cell.OwneeRef || edge.source.OwneeRef === cell.OwneeRef))
        // if (edgeList) {
        //   edgeList.forEach(edge => {
        //     edge.deleteReal = false
        //   })
        // }
      } else {
        this.currentOperate = 'deleteEdge'
        // this.deleteEdge.push(cell)
      }
      if (this.currentOperate === 'deleteEdge' && cell.type === 'Subtype') {
        if (cell.subtypeTopEdge) { // subtype top的connection删除的话须同时删除subtype的shape(目前仅删除subtype的shape就可以了，其他线会关联删除
          let subtypeCell = cell.target
          this.graph.graph.removeCells([subtypeCell])
        } else { // 删除subtype下的connection，如果仅剩两个connection，都删除
          let subtypeCell = cell.source
          if (subtypeCell.edges.length <= 2) {
            this.graph.graph.removeCells([subtypeCell])
          } else {
            this.graph.editor.execute('delete')
          }
        }
      } else {
        if (cell.edges) {
          this.graph.graph.addSelectionCells(cell.edges.filter(edge => edge.target.isSubType).map(edge => edge.target)) // 把表的subtype添加到删除序列，被选中，后续就会被删除
          this.graph.graph.addSelectionCells(cell.edges.filter(edge => edge.source.isSubType && (edge.source.edges.length <= 2)).map(edge => edge.source)) // 把表的subtype添加到删除序列
        }
        this.graph.editor.execute('delete')
      }
      this.secondConfirm = false
    },
    async deleteInRealConfirm () {
      let changes = []
      let cell = this.deletedCell
      cell.deleteReal = true // 物理删除
      this.realDelete = true // 应对选择多个表
      if (cell.isView || cell.isTable || cell.isComment || cell.isFigure || cell.isSubType) { // 因为有的Figure是edge组成的
        this.currentOperate = 'deleteTable'
        // this.deleteGraph.push(cell)

        // 删除与此shape相关的线 （关联的线会在change事件中实际删除）
        // let cellList = this.graph.graph.getDefaultParent().children
        // let edgeList = cellList.filter(edge => edge.edge && (edge.target.OwneeRef === cell.OwneeRef || edge.source.OwneeRef === cell.OwneeRef))
        // if (edgeList) {
        //   edgeList.forEach(edge => {
        //     edge.deleteReal = true
        //   })
        // }
      } else {
        this.currentOperate = 'deleteEdge'
        // this.deleteEdge.push(cell)
        // if (cell.rowType === 'Relational') {
        //   this.$confirm(`选中的关系将被删除，外键的列是否需要删除？`, '提示', {
        //     type: 'warning',
        //     confirmButtonText: '是',
        //     cancelButtonText: ' 否 ',
        //     showClose: false,
        //     closeOnClickModal: false
        //   }).then(() => {
        //     // 修改或删除target表的主键，删除外键以及相应的列
        //     let relation = this.dataByType.relation[cell.OwneeRef]
        //     if (relation) {
        //       let targetTable = this.dataByType.table[cell.target.OwneeRef]
        //       let foreignKey = targetTable.children.find(column => column.properties.Id === relation.properties.ChildKeyRef)
        //       foreignKey.children.forEach(member => {
        //         let index = targetTable.children.findIndex(column => column.properties.Id === member.properties.AttributeRef)
        //         if (index !== -1) {
        //           targetTable.children.splice(index, 1)
        //         }
        //       })
        //       let primaryKeyIndex = targetTable.children.find(column => column.objectClass === 'Datablau.LDM.EntityKeyGroup' && column.properties.KeyGroupType === 'PrimaryKey')
        //       let primaryKey = null
        //       if (primaryKeyIndex !== -1) {
        //         primaryKey = targetTable.children[primaryKeyIndex]
        //       }
        //       if (primaryKey) {
        //         if (primaryKey.children.length === foreignKey.children.length) {
        //           targetTable.children.splice(primaryKeyIndex, 1)
        //         } else {
        //           foreignKey.children.forEach(mebmer => {
        //             let index = primaryKey.children.findIndex(pMember => pMember.properties.AttributeRef === mebmer.properties.AttributeRef)
        //             if (index !== -1) {
        //               primaryKey.children.splice(index, 1)
        //             }
        //           })
        //         }
        //       }
        //       let foreignKeyIndex = targetTable.children.findIndex(column => column.properties.Id === relation.properties.ChildKeyRef)
        //       targetTable.children.splice(foreignKeyIndex, 1)
        //       let html = await this.getTableHTMLFunction(targetTable.properties.Id, this.graph.graph, null, null, true)
        //       cell.target.value = html
        //     }
        //   }).catch(() => {
        //     // 修改或删除target表的主键，删除外键
        //     let relation = this.dataByType.relation[cell.OwneeRef]
        //     if (relation) {
        //       let targetTable = this.dataByType.table[cell.target.OwneeRef]
        //       let foreignKey = targetTable.children.find(column => column.properties.Id === relation.properties.ChildKeyRef)
        //       let primaryKeyIndex = targetTable.children.find(column => column.objectClass === 'Datablau.LDM.EntityKeyGroup' && column.properties.KeyGroupType === 'PrimaryKey')
        //       let primaryKey = null
        //       if (primaryKeyIndex !== -1) {
        //         primaryKey = targetTable.children[primaryKeyIndex]
        //       }
        //       if (primaryKey) {
        //         if (primaryKey.children.length === foreignKey.children.length) {
        //           targetTable.children.splice(primaryKeyIndex, 1)
        //         } else {
        //           foreignKey.children.forEach(mebmer => {
        //             let index = primaryKey.children.findIndex(pMember => pMember.properties.AttributeRef === mebmer.properties.AttributeRef)
        //             if (index !== -1) {
        //               primaryKey.children.splice(index, 1)
        //             }
        //           })
        //         }
        //       }
        //       let foreignKeyIndex = targetTable.children.findIndex(column => column.properties.Id === relation.properties.ChildKeyRef)
        //       targetTable.children.splice(foreignKeyIndex, 1)
        //       let html = await this.getTableHTMLFunction(targetTable.properties.Id, this.graph.graph, null, null, true)
        //       cell.target.value = html
        //     }
        //   }).finally(() => {
        //     this.graph.editor.execute('delete', cell)
        //     this.graph.graph.getView().refresh()
        //     console.log(this.graph)
        //   })
      }
      if (this.currentOperate === 'deleteEdge' && cell.type === 'Subtype') {
        if (cell.subtypeTopEdge) { // subtype top的connection删除的话须同时删除subtype的shape(目前仅删除subtype的shape就可以了，其他线会关联删除)
          let subtypeCell = cell.target
          this.graph.graph.removeCells([subtypeCell])
        } else { // 删除subtype下面最后一个关系，需要删除整个关系
          let subtypeCell = cell.source
          if (subtypeCell.edges.length <= 2) {
            if (Object.values(this.dataByType.relation).filter(relation => !relation.properties.deleted && relation.properties.ParentEntityRef === subtypeCell.ParentTableId && relation.properties.ChildEntityRef !== subtypeCell.SubTypeRef && relation.properties.SubTypeRef === subtypeCell.SubTypeRef).length >= 2) { // 如果有别的subtype关系，则保留subtype和subtypeTopEdge关系，相关shape删除
              this.retainSubTypeAndTopRelation = true // retainSubTypeAndTopRelation为true表明不删除subtype实体和top的关系
            }
            this.graph.graph.removeCells([subtypeCell])
          } else {
            this.graph.editor.execute('delete')
          }
        }
      } else {
        if (cell.edges) {
          this.graph.graph.addSelectionCells(cell.edges.filter(edge => edge.target.isSubType).map(edge => edge.target)) // 把表的subtype添加到删除序列
          this.graph.graph.addSelectionCells(cell.edges.filter(edge => edge.source.isSubType && (edge.source.edges.length <= 2)).map(edge => edge.source)) // 把表的subtype添加到删除序列
        }
        this.graph.editor.execute('delete')
      }
      this.secondConfirm = false
    },
    cancelDelete () {
      this.secondConfirm = false
    },
    drawGraph () {
      this.loading.status = true
      this.loading.text = '画布拼命绘制中'
      this.calculateStartIdToEndIds()
      let self = this
      let emitEdge = (evt) => {
        window.mouseDown(evt)
      }
      let newEntityDrag = async (graph, evt, cell) => {
        // if (graph.canImportCell(cell)) {
        this.emptyTableNum = this.deliverNum.seed++
        this.emptyShapeNum = this.deliverNum.seed
        let changes = []
        this.$set(this.dataByType.table, this.emptyTableNum, {
          objectClass: 'Datablau.LDM.EntityComposite',
          children: [],
          properties: {
            ...this.tableUdpsDefault,
            ColumnOrderArrayRefs: [],
            DataStandardCode: '',
            Id: this.emptyTableNum,
            IsLogicalOnly: false,
            IsPhysicalOnly: false,
            Name: this.getTableNameNamingMap((this.isLogical ? 'Entity_' : this.isCassandraOrMongoDB ? 'Collection_' : 'Table_') + this.emptyTableNum),
            RawType: 'Entity',
            TypeId: 80000004,
            changed: true,
            UniqueId: uuidv4(),
            new: true
          }
        })
        changes.push(new Changes('insertTable', {
          id: this.emptyTableNum,
          name: this.dataByType.table[this.emptyTableNum].properties.Name
        }))
        this.$bus.$emit('highlight', 'currentTableId', this.emptyTableNum)
        let pt = {
          x: 100,
          y: 100
        }
        if (evt) {
          pt = graph.getPointForEvent(evt)
        }
        let shapeObj = {
          objectClass: 'Datablau.ERD.ShapeEntity',
          properties: {
            Id: this.emptyShapeNum,
            Location: { x: pt.x, y: pt.y },
            OwneeRef: this.emptyTableNum,
            Name: this.dataByType.table[this.emptyTableNum].properties.Name,
            RawType: 'Shape',
            ShapeSize: { width: 120, height: 120 },
            TypeId: 80000008,
            changed: true,
            UniqueId: uuidv4(),
            new: true
          }
        }
        changes.push(new Changes('insertShape', {
          id: shapeObj.properties.Id,
          name: this.dataByType.table[this.emptyTableNum].properties.Name
        }))
        if (this.dataByType.diagram[this.currentId].children) {
          this.dataByType.diagram[this.currentId].children.push(shapeObj)
        } else {
          this.dataByType.diagram[this.currentId].children = [shapeObj]
        }
        let vertex = null
        if (evt) {
          vertex = await this.getTableHTMLFunction(this.emptyTableNum, graph, evt)
        } else {
          vertex = await this.getTableHTMLFunction(this.emptyTableNum, graph)
        }
        if (!evt) {
          graph.scrollCellToVisible(vertex, true)
        }
        vertex.deleteReal = true
        this.emptyShapeNum++
        this.emptyTableNum++
        setTimeout(() => {
          this.$set(this.graph.editor.undoManager.history[this.graph.editor.undoManager.indexOfNextAdd - 1].changes[0], 'changes', changes)
        })
        // }
      }
      this.newEntityDrag = newEntityDrag
      let newBusinessDrag = async (graph, evt, cell) => {
        // if (graph.canImportCell(cell)) {
        this.emptyTableNum = this.deliverNum.seed++
        this.emptyShapeNum = this.deliverNum.seed
        let changes = []
        this.$set(this.dataByType.table, this.emptyTableNum, {
          objectClass: 'Datablau.LDM.EntityBusinessObject',
          children: [],
          properties: {
            ...this.businessUdpsDefault,
            ColumnOrderArrayRefs: [],
            DataStandardCode: '',
            Id: this.emptyTableNum,
            IsLogicalOnly: false,
            IsPhysicalOnly: false,
            // Name: this.getTableNameNamingMap('BusinessObject_' + this.emptyTableNum),
            Name: 'BusinessObject_' + this.emptyTableNum,
            RawType: 'Entity',
            TypeId: 80100073,
            changed: true,
            UniqueId: uuidv4(),
            new: true
          }
        })
        changes.push(new Changes('insertTable', {
          id: this.emptyTableNum,
          name: this.dataByType.table[this.emptyTableNum].properties.Name
        }))
        this.$bus.$emit('highlight', 'currentBusinessId', this.emptyTableNum)
        let pt = {
          x: 100,
          y: 100
        }
        if (evt) {
          pt = graph.getPointForEvent(evt)
        }
        let shapeObj = {
          objectClass: 'Datablau.ERD.ShapeBusinessObject',
          properties: {
            Id: this.emptyShapeNum,
            Location: { x: pt.x, y: pt.y },
            OwneeRef: this.emptyTableNum,
            Name: this.dataByType.table[this.emptyTableNum].properties.Name,
            RawType: 'Shape',
            ShapeSize: { width: 200, height: 100 },
            TypeId: 80000008,
            changed: true,
            UniqueId: uuidv4(),
            new: true
          }
        }
        changes.push(new Changes('insertShape', {
          id: shapeObj.properties.Id,
          name: this.dataByType.table[this.emptyTableNum].properties.Name
        }))
        if (this.dataByType.diagram[this.currentId].children) {
          this.dataByType.diagram[this.currentId].children.push(shapeObj)
        } else {
          this.dataByType.diagram[this.currentId].children = [shapeObj]
        }
        let vertex = null
        if (evt) {
          vertex = await this.getTableHTMLFunction(this.emptyTableNum, graph, evt)
        } else {
          vertex = await this.getTableHTMLFunction(this.emptyTableNum, graph)
        }
        if (!evt) {
          graph.scrollCellToVisible(vertex, true)
        }
        vertex.deleteReal = true
        this.emptyShapeNum++
        this.emptyTableNum++
        setTimeout(() => {
          this.$set(this.graph.editor.undoManager.history[this.graph.editor.undoManager.indexOfNextAdd - 1].changes[0], 'changes', changes)
        })
        // }
      }
      this.newBusinessDrag = newBusinessDrag
      let newViewDrag = async (graph, evt, cell) => {
        // if (graph.canImportCell(cell)) {
        this.emptyTableNum = this.deliverNum.seed++
        this.emptyShapeNum = this.deliverNum.seed
        let changes = []
        this.$set(this.dataByType.view, this.emptyTableNum, {
          objectClass: 'Datablau.LDM.EntityView',
          children: [],
          properties: {
            ...this.viewUdpsDefault,
            ColumnOrderArrayRefs: [],
            DataStandardCode: '',
            Id: this.emptyTableNum,
            IsLogicalOnly: false,
            IsPhysicalOnly: false,
            // Name: this.getTableNameNamingMap('View_' + this.emptyTableNum),
            Name: 'View_' + this.emptyTableNum,
            RawType: 'View',
            TypeId: 80500008,
            changed: true,
            UniqueId: uuidv4(),
            new: true
          }
        })
        changes.push(new Changes('insertView', {
          id: this.emptyTableNum,
          name: this.dataByType.view[this.emptyTableNum].properties.Name
        }))
        this.$bus.$emit('highlight', 'currentViewId', this.emptyTableNum)
        let pt = {
          x: 100,
          y: 100
        }
        if (evt) {
          pt = graph.getPointForEvent(evt)
        }
        let shapeObj = {
          objectClass: 'Datablau.ERD.ShapeView',
          properties: {
            Id: this.emptyShapeNum,
            Location: { x: pt.x, y: pt.y },
            OwneeRef: this.emptyTableNum,
            Name: this.dataByType.view[this.emptyTableNum].properties.Name,
            RawType: 'Shape',
            ShapeSize: { width: 120, height: 120 },
            TypeId: 80000008,
            changed: true,
            UniqueId: uuidv4(),
            new: true
          }
        }
        changes.push(new Changes('insertShape', {
          id: shapeObj.properties.Id,
          name: this.dataByType.view[this.emptyTableNum].properties.Name
        }))
        if (this.dataByType.diagram[this.currentId].children) {
          this.dataByType.diagram[this.currentId].children.push(shapeObj)
        } else {
          this.dataByType.diagram[this.currentId].children = [shapeObj]
        }
        let vertex = null
        if (evt) {
          vertex = await this.getViewHTMLFunction(this.emptyTableNum, graph, evt)
        } else {
          vertex = await this.getViewHTMLFunction(this.emptyTableNum, graph)
        }
        if (!evt) {
          graph.scrollCellToVisible(vertex, true)
        }
        vertex.deleteReal = true
        this.emptyShapeNum++
        this.emptyTableNum++
        setTimeout(() => {
          this.$set(this.graph.editor.undoManager.history[this.graph.editor.undoManager.indexOfNextAdd - 1].changes[0], 'changes', changes)
        })
        // }
      }
      this.newViewDrag = newViewDrag
      let newCommentDrag = (graph, evt, cell) => {
        // if (graph.canImportCell(cell)) {
        this.emptyTableNum = this.deliverNum.seed++
        this.emptyShapeNum = this.deliverNum.seed
        let changes = []
        this.$set(this.dataByType.comment, this.emptyTableNum, {
          properties: {
            Id: this.emptyTableNum,
            Name: 'Comment_' + this.emptyTableNum,
            RawType: 'Comment',
            TypeId: 80000027,
            changed: true,
            UniqueId: uuidv4(),
            new: true
          },
          objectClass: 'Datablau.LDM.Comment'
        })
        changes.push(new Changes('insertComment', {
          id: this.emptyTableNum,
          name: this.dataByType.comment[this.emptyTableNum].properties.Name
        }))
        this.$bus.$emit('highlight', 'currentComentId', this.emptyTableNum)
        let pt = {
          x: 100,
          y: 100
        }
        if (evt) {
          pt = graph.getPointForEvent(evt)
        }
        let shapeObj = {
          objectClass: 'Datablau.ERD.ShapeComment',
          properties: {
            Id: this.emptyShapeNum,
            Location: { x: pt.x, y: pt.y },
            OwneeRef: this.emptyTableNum,
            Name: this.dataByType.comment[this.emptyTableNum].properties.Name,
            RawType: 'Shape',
            ShapeSize: { width: 120, height: 120 },
            TypeId: 80000008,
            changed: true,
            UniqueId: uuidv4(),
            new: true
          }
        }
        changes.push(new Changes('insertShape', {
          id: shapeObj.properties.Id,
          name: this.dataByType.comment[this.emptyTableNum].properties.Name
        }))
        if (this.dataByType.diagram[this.currentId].children) {
          this.dataByType.diagram[this.currentId].children.push(shapeObj)
        } else {
          this.dataByType.diagram[this.currentId].children = [shapeObj]
        }
        let vertex = null
        if (evt) {
          vertex = this.getCommentHTMLFunction(this.emptyTableNum, graph, evt)
        } else {
          vertex = this.getCommentHTMLFunction(this.emptyTableNum, graph)
        }
        if (!evt) {
          graph.scrollCellToVisible(vertex, true)
        }
        vertex.deleteReal = true
        this.emptyShapeNum++
        this.emptyTableNum++
        setTimeout(() => {
          this.$set(this.graph.editor.undoManager.history[this.graph.editor.undoManager.indexOfNextAdd - 1].changes[0], 'changes', changes)
        })
        // }
      }
      this.newCommentDrag = newCommentDrag
      let newFigureDrag = (graph, evt, cell) => {
        // if (graph.canImportCell(cell)) {
        this.emptyShapeNum = this.deliverNum.seed++
        let changes = []
        let pt = {
          x: 100,
          y: 100
        }
        if (evt) {
          pt = graph.getPointForEvent(evt)
        }
        let name = 'Figure_' + this.emptyShapeNum
        let shapeObj = {
          objectClass: 'Datablau.ERD.ShapeRectangle',
          properties: {
            Id: this.emptyShapeNum,
            Location: { x: pt.x, y: pt.y },
            Name: name,
            OrderNumber: 0,
            RawType: 'Shape',
            ShapeSize: { width: 200, height: 100 },
            TypeId: 80000008,
            changed: true,
            UniqueId: uuidv4(),
            new: true
          }
        }
        changes.push(new Changes('insertShape', {
          id: shapeObj.properties.Id,
          name
        }))
        if (this.dataByType.diagram[this.currentId].children) {
          this.dataByType.diagram[this.currentId].children.push(shapeObj)
        } else {
          this.dataByType.diagram[this.currentId].children = [shapeObj]
        }
        let vertex = this.getFigureHTMLFunction(this.emptyShapeNum, graph, evt)
        vertex.OrderNumber = shapeObj.properties.OrderNumber
        vertex.deleteReal = false
        this.emptyShapeNum++
        setTimeout(() => {
          this.$set(this.graph.editor.undoManager.history[this.graph.editor.undoManager.indexOfNextAdd - 1].changes[0], 'changes', changes)
        })
        // }
      }
      this.newFigureDrag = newFigureDrag
      // loading.close()
      setTimeout(() => {
        this.handleData()
        this.loading.status = false
        $(document).unbind('click')
        let tableBut = document.getElementById('tableButton')
        let tableButDrag = null
        if (tableBut) {
          tableButDrag = tableBut.getElementsByTagName('img')[0].cloneNode(true)
          tableButDrag.style.width = '30px'
          tableButDrag.style.height = '30px'
        }
        let viewBut = document.getElementById('viewButton')
        let viewButDrag = null
        if (viewBut) {
          viewButDrag = viewBut.getElementsByTagName('img')[0].cloneNode(true)
          viewButDrag.style.width = '30px'
          viewButDrag.style.height = '30px'
        }
        let businessBut = document.getElementById('businessButton')
        let businessButDrag = null
        if (businessBut) {
          businessButDrag = businessBut.getElementsByTagName('img')[0].cloneNode(true)
          businessButDrag.style.width = '30px'
          businessButDrag.style.height = '30px'
        }
        let commentBut = document.getElementById('commentButton')
        let commentButDrag = null
        if (commentBut) {
          commentButDrag = commentBut.getElementsByTagName('img')[0].cloneNode(true)
          commentButDrag.style.width = '30px'
          commentButDrag.style.height = '30px'
        }
        let figureBut = document.getElementById('figureButton')
        let figureButDrag = null
        if (figureBut) {
          figureButDrag = figureBut.getElementsByTagName('img')[0].cloneNode(true)
          figureButDrag.style.width = '30px'
          figureButDrag.style.height = '30px'
        }
        let processAddTable = async (tableId, graph, evt, cell, noSelected) => {
          this.emptyShapeNum = this.deliverNum.seed
          let changes = []
          let parent = graph.getDefaultParent()
          let tableCell = parent.children.find(cell => cell.OwneeRef === tableId)
          if (tableCell && !noSelected) {
            graph.setSelectionCell(tableCell)
            graph.scrollCellToVisible(tableCell, true)
            return
          }
          let diagram = self.dataByType.diagram[self.param.diagramId].children
          let diagramThemeId = self.dataByType.diagram[self.param.diagramId].properties.StyleThemeRef
          let themeStyle = {}
          let d = diagram.find(d => {
            if (d.properties.TypeId === 80000008 && !d.properties.deleted) {
              return d.properties.OwneeRef === tableId
            } else {
              return false
            }
          })
          let t = null
          if (!d) {
            t = self.dataByType.table[tableId]
            if (!t) { // 不存在此table
              return
            }
            if (!t.children) { // 可能没获取字段信息，需要获取下
              await self.getEntitiesContent([tableId])
              t = self.dataByType.table[tableId]
            }
            let isBusiness = t.properties.TypeId === 80100073
            d = {}
            d.objectClass = isBusiness ? 'Datablau.ERD.ShapeBusinessObject' : 'Datablau.ERD.ShapeEntity'
            d.properties = {
              TypeId: 80000008,
              Id: self.emptyShapeNum,
              OwneeRef: tableId,
              Name: this.dataByType.table[tableId].properties.Name,
              RawType: 'Shape',
              ShapeSize: {
                width: isBusiness ? 200 : 120,
                height: isBusiness ? 100 : 120
              },
              UniqueId: uuidv4(),
              new: true
            }
            diagram.push(d)
            changes.push(new Changes('insertShape', {
              id: d.properties.Id,
              name: this.dataByType.table[tableId] ? this.dataByType.table[tableId].properties.Name : ''
            }))
          } else {
            t = self.dataByType.table[d.properties.OwneeRef]
          }
          if (!t) { // 不存在此table
            return
          }
          if (self.dataByType.theme) {
            if (diagramThemeId && self.dataByType.theme[diagramThemeId] && !self.dataByType.theme[diagramThemeId].properties.deleted) {
              themeStyle = _.merge(_.cloneDeep(this.themeCreateTemplate), _.cloneDeep(self.dataByType.theme[diagramThemeId].properties))
            } else {
              themeStyle = this.themeCreateTemplate
            }
            if (d.properties.StyleThemeRef) {
              if (self.dataByType.theme[d.properties.StyleThemeRef] && !self.dataByType.theme[d.properties.StyleThemeRef].properties.deleted) {
                themeStyle = _.merge(_.cloneDeep(this.themeCreateTemplate), _.cloneDeep(self.dataByType.theme[d.properties.StyleThemeRef].properties))
              }
            }
          }
          if (!d.properties.Location) {
            d.properties.Location = {
              x: 0, y: 0
            }
          }

          const html = self.graph.drawTableShape(d, t, themeStyle, true)
          if (noSelected) { // 编辑表只需更新html
            return html
          }
          let vertex = null
          graph.getModel().beginUpdate()
          try {
            let pt = null
            if (evt) {
              pt = graph.getPointForEvent(evt)
            } else {
              pt = {
                x: self.newPosX,
                y: self.newPosY
              }
            }
            vertex = graph.insertVertex(parent, tableId, html, pt.x, pt.y, d.properties.ShapeSize.width, this.columnDisplay === 'no' ? 30 : d.properties.ShapeSize.height, this.graph.style.TABLE + (d.properties['EntityRoundingSize'] ? `rounded=1;perimeter=rectanglePerimeter;arcSize= ${d.properties['EntityRoundingSize']}` : t.properties.relied ? 'rounded=1;perimeter=rectanglePerimeter;arcSize=4' : ''))
            vertex.viceValue = vertex.value
            vertex.viceHeight = d.properties.ShapeSize.height
            vertex.Id = self.emptyShapeNum
            vertex.OwneeRef = tableId
            vertex.isTable = true
            vertex.new = true
            if (t.properties.TypeId === 80100073) {
              vertex.isBusiness = true
              vertex.OrderNumber = 0
              graph.orderCells(true, [vertex])

              let children = graph.getDefaultParent().children
              let figureArr = []
              for (let i = children.length - 1; i >= 0; i--) {
                if (children[i].isFigure || children[i].isBusiness) {
                  figureArr = children.slice(0, i + 1)
                  break
                }
              }
              // 图框有顺序需要重新排序
              figureArr = figureArr.sort((a, b) => {
                return a.OrderNumber - b.OrderNumber || a.Id - b.Id
              })
              graph.getDefaultParent().children.splice(0, figureArr.length, ...figureArr)
              graph.refresh()
            }
            self.newPosY += 5
            self.newPosX += 5
          } finally {
            graph.getModel().endUpdate()
          }
          self.emptyShapeNum++
          this.deliverNum.seed++
          self.graph.vertex['shape' + d.properties.Id] = vertex
          // self.graph.shapes[t.properties.Id] = vertex
          graph.setSelectionCell(vertex)
          if (!evt) {
            graph.scrollCellToVisible(vertex, true)
          }
          // setTimeout(() => {
          this.$set(this.graph.editor.undoManager.history[this.graph.editor.undoManager.indexOfNextAdd - 1].changes[0], 'changes', changes)
          // })
          return vertex
        }
        this.getTableHTMLFunction = processAddTable
        let processAddView = async (viewId, graph, evt, cell, noSelected) => {
          this.emptyShapeNum = this.deliverNum.seed
          let changes = []
          let parent = graph.getDefaultParent()
          let viewCell = parent.children.find(cell => cell.OwneeRef === viewId)
          if (viewCell && !noSelected) {
            graph.setSelectionCell(viewCell)
            graph.scrollCellToVisible(viewCell, true)
            return
          }
          let diagram = self.dataByType.diagram[self.param.diagramId].children
          let diagramThemeId = self.dataByType.diagram[self.param.diagramId].properties.StyleThemeRef
          let themeStyle = {}
          let d = diagram.find(d => {
            if (d.properties.TypeId === 80000008 && !d.properties.deleted) {
              return d.properties.OwneeRef === viewId
            } else {
              return false
            }
          })
          if (!d) {
            d = {}
            d.objectClass = 'Datablau.ERD.ShapeView'
            d.properties = {
              Id: self.emptyShapeNum,
              TypeId: 80000008,
              OwneeRef: viewId,
              Name: this.dataByType.view[viewId].properties.Name,
              RawType: 'Shape',
              ShapeSize: {
                width: 'auto',
                height: 'auto'
              },
              UniqueId: uuidv4(),
              new: true
            }
            diagram.push(d)
            changes.push(new Changes('insertShape', {
              id: d.properties.Id,
              name: this.dataByType.view[viewId].properties.Name
            }))
            let t = self.dataByType.view[d.properties.OwneeRef]
            if (!t.children) { // 可能没获取字段信息，需要获取下
              await self.getEntitiesContent([d.properties.OwneeRef])
            }
          }
          if (self.dataByType.theme) {
            if (diagramThemeId && self.dataByType.theme[diagramThemeId] && !self.dataByType.theme[diagramThemeId].properties.deleted) {
              themeStyle = _.merge(_.cloneDeep(this.themeCreateTemplate), _.cloneDeep(self.dataByType.theme[diagramThemeId].properties))
            } else {
              themeStyle = this.themeCreateTemplate
            }
            if (d.properties.StyleThemeRef) {
              if (self.dataByType.theme[d.properties.StyleThemeRef] && !self.dataByType.theme[d.properties.StyleThemeRef].properties.deleted) {
                themeStyle = _.merge(_.cloneDeep(this.themeCreateTemplate), _.cloneDeep(self.dataByType.theme[d.properties.StyleThemeRef].properties))
              }
            }
          }
          let t = self.dataByType.view[d.properties.OwneeRef]
          if (!d.properties.Location) {
            d.properties.Location = {
              x: 0, y: 0
            }
          }
          if (!t) { // 不存在此table
            return
          }
          const html = self.graph.drawViewShape(d, t, themeStyle, true)
          if (noSelected) { // 编辑表只需更新html
            return html
          }
          let vertex = null
          graph.getModel().beginUpdate()
          try {
            let pt = null
            if (evt) {
              pt = graph.getPointForEvent(evt)
            } else {
              pt = {
                x: self.newPosX,
                y: self.newPosY
              }
            }
            vertex = graph.insertVertex(parent, viewId, html, pt.x, pt.y, d.properties.ShapeSize.width, this.columnDisplay === 'no' ? 30 : d.properties.ShapeSize.height, this.graph.style.TABLE + (d.properties['EntityRoundingSize'] ? `rounded=1;perimeter=rectanglePerimeter;arcSize= ${d.properties['EntityRoundingSize']}` : ''))
            vertex.viceValue = vertex.value
            vertex.viceHeight = d.properties.ShapeSize.height
            vertex.Id = self.emptyShapeNum
            vertex.OwneeRef = viewId
            vertex.isView = true
            vertex.new = true
            self.newPosY += 5
            self.newPosX += 5
            let index = this.deleteGraph.find(cell => cell.OwneeRef === viewId)
            if (index !== -1) {
              this.deleteGraph.splice(index, 1)
            }
          } finally {
            graph.getModel().endUpdate()
          }
          self.emptyShapeNum++
          self.deliverNum.seed++
          self.graph.vertex['shape' + d.properties.Id] = vertex
          // self.graph.shapes[t.properties.Id] = vertex
          graph.setSelectionCell(vertex)
          if (!evt) {
            graph.scrollCellToVisible(vertex, true)
          }
          // setTimeout(() => {
          this.$set(this.graph.editor.undoManager.history[this.graph.editor.undoManager.indexOfNextAdd - 1].changes[0], 'changes', changes)
          // })
          return vertex
        }
        this.getViewHTMLFunction = processAddView
        let processAddComment = (commentId, graph, evt, cell, noSelected) => {
          this.emptyShapeNum = this.deliverNum.seed
          let changes = []
          let parent = graph.getDefaultParent()
          let commentCell = parent.children.find(cell => cell.OwneeRef === commentId)
          if (commentCell && !noSelected) {
            graph.setSelectionCell(commentCell)
            graph.scrollCellToVisible(commentCell, true)
            return
          }
          let diagram = self.dataByType.diagram[self.param.diagramId].children
          let diagramThemeId = self.dataByType.diagram[self.param.diagramId].properties.StyleThemeRef
          let themeStyle = {}
          let d = diagram.find(d => {
            if (d.properties.TypeId === 80000008 && !d.properties.deleted) {
              return d.properties.OwneeRef === commentId
            } else {
              return false
            }
          })
          if (!d) {
            d = {}
            d.objectClass = 'Datablau.ERD.ShapeComment'
            d.properties = {
              Id: self.emptyShapeNum,
              TypeId: 80000008,
              OwneeRef: commentId,
              Name: this.dataByType.comment[commentId].properties.Name,
              RawType: 'Shape',
              ShapeSize: {
                width: 'auto',
                height: 'auto'
              },
              UniqueId: uuidv4(),
              new: true
            }
            diagram.push(d)
            changes.push(new Changes('insertShape', {
              id: d.properties.Id,
              name: this.dataByType.comment[commentId].properties.Name
            }))
          }
          if (self.dataByType.theme) {
            if (diagramThemeId && self.dataByType.theme[diagramThemeId]) {
              themeStyle = _.merge(_.cloneDeep(this.themeCreateTemplate), _.cloneDeep(self.dataByType.theme[diagramThemeId].properties))
            } else {
              themeStyle = this.themeCreateTemplate
            }
            if (d.properties.StyleThemeRef) {
              if (self.dataByType.theme[d.properties.StyleThemeRef]) {
                themeStyle = _.merge(_.cloneDeep(this.themeCreateTemplate), _.cloneDeep(self.dataByType.theme[d.properties.StyleThemeRef].properties))
              }
            }
          }
          let t = self.dataByType.comment[d.properties.OwneeRef]
          if (!d.properties.Location) {
            d.properties.Location = {
              x: 0, y: 0
            }
          }
          if (!t) { // 不存在此table
            return
          }
          const html = self.graph.drawCommentShape(d, themeStyle, true)
          if (noSelected) { // 编辑表只需更新html
            return html
          }
          let vertex = null
          graph.getModel().beginUpdate()
          try {
            let pt = null
            if (evt) {
              pt = graph.getPointForEvent(evt)
            } else {
              pt = {
                x: self.newPosX,
                y: self.newPosY
              }
            }
            vertex = graph.insertVertex(parent, commentId, html, pt.x, pt.y, d.properties.ShapeSize.width, d.properties.ShapeSize.height, this.graph.style.COMMENT)
            vertex.Id = self.emptyShapeNum
            vertex.OwneeRef = commentId
            vertex.isComment = true
            vertex.new = true
            self.newPosY += 5
            self.newPosX += 5
            let index = this.deleteGraph.find(cell => cell.OwneeRef === commentId)
            if (index !== -1) {
              this.deleteGraph.splice(index, 1)
            }
          } finally {
            graph.getModel().endUpdate()
          }
          self.emptyShapeNum++
          self.deliverNum.seed++
          self.graph.vertex['shape' + d.properties.Id] = vertex
          // self.graph.shapes[t.properties.Id] = vertex
          graph.setSelectionCell(vertex)
          if (!evt) {
            graph.scrollCellToVisible(vertex, true)
          }
          // setTimeout(() => {
          this.$set(this.graph.editor.undoManager.history[this.graph.editor.undoManager.indexOfNextAdd - 1].changes[0], 'changes', changes)
          // })
          return vertex
        }
        this.getCommentHTMLFunction = processAddComment

        let processAddFigure = (figureId, graph, evt, cell, noSelected) => { // figure没有对应实体
          let parent = graph.getDefaultParent()
          let figureCell = parent.children.find(cell => cell.Id === figureId)
          if (figureCell && !noSelected) {
            graph.setSelectionCell(figureCell)
            graph.scrollCellToVisible(figureCell, true)
            return
          }
          let diagram = self.dataByType.diagram[self.param.diagramId].children
          let diagramThemeId = self.dataByType.diagram[self.param.diagramId].properties.StyleThemeRef
          let themeStyle = {}
          let d = diagram.find(d => {
            if (d.properties.TypeId === 80000008) {
              return d.properties.Id === figureId
            } else {
              return false
            }
          })
          if (!d) {
            d = {}
            d.properties = {
              TypeId: 80000008,
              Id: figureId,
              RawType: 'Shape',
              ShapeSize: {
                width: 'auto',
                height: 'auto'
              },
              UniqueId: uuidv4(),
              new: true
            }
          }
          if (self.dataByType.theme) {
            if (diagramThemeId && self.dataByType.theme[diagramThemeId] && !self.dataByType.theme[diagramThemeId].properties.deleted) {
              themeStyle = _.merge(_.cloneDeep(this.themeCreateTemplate), _.cloneDeep(self.dataByType.theme[diagramThemeId].properties))
            } else {
              themeStyle = this.themeCreateTemplate
            }
            if (d.properties.StyleThemeRef) {
              if (self.dataByType.theme[d.properties.StyleThemeRef] && !self.dataByType.theme[d.properties.StyleThemeRef].properties.deleted) {
                themeStyle = _.merge(_.cloneDeep(this.themeCreateTemplate), _.cloneDeep(self.dataByType.theme[d.properties.StyleThemeRef].properties))
              }
            }
          }
          if (!d.properties.Location) {
            d.properties.Location = {
              x: 0, y: 0
            }
          }
          const style = self.graph.drawFigureShape(d, themeStyle, true)
          if (noSelected) { // 编辑表只需更新html
            return style
          }
          let vertex = null
          graph.getModel().beginUpdate()
          try {
            let pt = null
            if (evt) {
              pt = graph.getPointForEvent(evt)
            } else {
              pt = {
                x: self.newPosX,
                y: self.newPosY
              }
            }
            let html = `<div class="svg-figure" style="width: ${d.properties['ShapeSize'].width}px;height: ${d.properties['ShapeSize'].height}px;opacity: 0;"></div>`
            vertex = graph.insertVertex(parent, self.emptyTableNum, html, pt.x, pt.y, d.properties.ShapeSize.width, d.properties.ShapeSize.height, style)
            vertex.Id = figureId
            vertex.isFigure = true
            vertex.new = true
            vertex.Name = this.dataByType.diagram[this.currentId].children.find(shape => shape.properties.Id === figureId).properties.Name
            vertex.OrderNumber = 0
            self.newPosY += 5
            self.newPosX += 5
            graph.orderCells(true, [vertex])

            let children = graph.getDefaultParent().children
            let figureArr = []
            for (let i = children.length - 1; i >= 0; i--) {
              if (children[i].isFigure || children[i].isBusiness) {
                figureArr = children.slice(0, i + 1)
                break
              }
            }
            // 图框有顺序需要重新排序
            figureArr = figureArr.sort((a, b) => {
              return a.OrderNumber - b.OrderNumber || a.Id - b.Id
            })
            graph.getDefaultParent().children.splice(0, figureArr.length, ...figureArr)
            graph.refresh()
          } finally {
            graph.getModel().endUpdate()
          }
          self.graph.vertex['shape' + d.properties.Id] = vertex
          // self.graph.shapes[t.properties.Id] = vertex
          graph.setSelectionCell(vertex)
          if (!evt) {
            graph.scrollCellToVisible(vertex, true)
          }
          return vertex
        }
        this.getFigureHTMLFunction = processAddFigure

        let processAddRelation = (relationId, graph, hideSelected) => { // hideSelected = true 通过添加表来间接添加connection
          this.graph.graph.getModel().beginUpdate()
          let changes = []
          try {
            this.emptyEdgeNum = this.deliverNum.seed++
            let parent = graph.getDefaultParent()
            let relation = self.dataByType.relation[relationId]
            let parentCell = parent.children.find(cell => relation.objectClass === 'Datablau.LDM.RelationshipSubtype' && relation.properties.SubTypeRef ? cell.SubTypeRef === relation.properties.SubTypeRef : cell.OwneeRef === relation.properties.ParentEntityRef)
            if (!parentCell && relation.objectClass === 'Datablau.LDM.RelationshipSubtype') { // 创建subtypeshape和topSubType的connection
              let source = parent.children.find(cell => cell.OwneeRef === relation.properties.ParentEntityRef)
              let target = parent.children.find(cell => cell.OwneeRef === relation.properties.ChildEntityRef)
              let sourceTable = this.dataByType.table[relation.properties.ParentEntityRef]
              let topRelation = Object.values(this.dataByType.relation).find(relation1 => !relation1.properties.deleted && relation1.properties.ChildEntityRef === relation.properties.SubTypeRef && relation1.properties.ParentEntityRef === sourceTable.properties.Id)
              let subtype = sourceTable.children?.find(column => !column.properties.deleted && column.properties.Id === relation.properties.SubTypeRef)
              let subtypeShape = {
                properties: {
                  Location: {
                    x: parseInt((source.geometry.x + source.geometry.width / 2 + target.geometry.x + target.geometry.width / 2) / 2),
                    y: parseInt((source.geometry.y + source.geometry.height / 2 + target.geometry.y + target.geometry.height / 2) / 2)
                  },
                  ShapeSize: {
                    width: 40,
                    height: 20
                  },
                  Name: subtype.properties.Name,
                  SubTypeRef: subtype.properties.Id,
                  TypeId: LDMTypes.Shape,
                  Id: this.deliverNum.seed++,
                  UniqueId: uuidv4(),
                  new: true
                },
                objectClass: 'Datablau.ERD.ShapeSubtype'
              }
              changes.push(new Changes('insertShape', {
                id: subtypeShape.properties.Id,
                name: subtype.properties.Name
              }))
              this.diagram.children.push(subtypeShape)
              let subtypeHtml = `<div style="height:${subtypeShape.properties.ShapeSize.height}px;width:${subtypeShape.properties.ShapeSize.width}px;">`
              subtypeHtml += `<div class="subtype-shape`
              let exclusive = false
              if (subtype?.properties?.SubtypeType === 'Exclusive') {
                subtypeHtml += ` exclusive`
                exclusive = true
              } else {
                subtypeHtml += ` inclusive`
                exclusive = false
              }
              subtypeHtml += `"></div></div>`
              let subtypeCell = this.graph.graph.insertVertex(
                this.graph.graph.getDefaultParent(), null, subtypeHtml,
                subtypeShape.properties.Location.x,
                subtypeShape.properties.Location.y,
                subtypeShape.properties.ShapeSize.width, subtypeShape.properties.ShapeSize.height,
                `shape=${exclusive ? 'subtype-exclusive' : 'subtype'};${STYLE.SubType}`)
              subtypeCell.Id = subtypeShape.properties.Id
              subtypeCell.SubTypeRef = subtype.properties.Id
              subtypeCell.isSubType = true
              subtypeCell.new = true
              subtypeCell.ParentTableId = sourceTable.properties.Id

              let topEdge = null
              let topEdgeNum = this.deliverNum.seed++
              topEdge = this.graph.graph.insertEdge(this.graph.graph.getDefaultParent(), topEdgeNum, null,
                source, subtypeCell,
                `ZeroOrOne;`
              )

              let topConnection = {
                properties: {
                  ParentShapeRef: topEdge.source.Id,
                  ChildShapeRef: topEdge.target.Id,
                  StartOrientation: 'Vertical',
                  EndOrientation: 'Vertical',
                  BendPoints: topEdge.CurrentBendPoints,
                  TypeId: LDMTypes.Connection,
                  Id: topEdgeNum,
                  Name: `Connection_${topEdgeNum}`,
                  UniqueId: uuidv4(),
                  OwneeRef: topRelation.properties.Id,
                  new: true
                },
                objectClass: 'Datablau.ERD.ConnectionSubtype'
              }
              this.dataByType.diagram[this.currentId].children.push(topConnection)
              changes.push(new Changes('insertConnection', {
                name: topConnection.properties.Name,
                id: topEdgeNum
              }))

              topEdge.Id = topEdgeNum
              topEdge.new = true
              topEdge.subtypeTopEdge = true
              topEdge.OwneeRef = topRelation.properties.Id
              topEdge.endCardinalityType = this.currentEdgeType === 'RelationalIdentifying' || this.currentEdgeType === 'RelationalSubtype' ? 'ZeroOrOne' : this.currentEdgeType === 'RelationalNonIdentifying' ? 'ZeroOneOrMore' : this.currentEdgeType === 'RelationalManyToMany' ? 'None' : ''
              topEdge.type = this.currentEdgeType === 'RelationalIdentifying' ? 'Relational' : this.currentEdgeType === 'RelationalNonIdentifying' ? 'Relational' : this.currentEdgeType === 'RelationalManyToMany' ? 'ManyToMany' : this.currentEdgeType === 'RelationalSubtype' ? 'Subtype' : ''
              topEdge.relationalType = this.currentEdgeType === 'RelationalIdentifying' ? 'Identifying' : this.currentEdgeType === 'RelationalNonIdentifying' ? 'NonIdentifying' : this.currentEdgeType === 'RelationalManyToMany' ? 'ManyToMany' : this.currentEdgeType === 'RelationalSubtype' ? 'Identifying' : ''
              topEdge.deleteReal = true
              topEdge.targetOwneeRef = target.OwneeRef
              topEdge.sourceOwneeRef = source.OwneeRef
              topEdge.deleteColumn = true

              parentCell = subtypeCell
            }
            if (!parentCell) {
              if (!hideSelected) {
                self.$message.warning('缺少关系的起始表')
              }
              this.graph.graph.getModel().endUpdate()
              return
            }
            let childCell = parent.children.find(cell => cell.OwneeRef === relation.properties.ChildEntityRef)
            if (!childCell && relation.objectClass !== 'Datablau.LDM.RelationshipSubtype') {
              if (!hideSelected) {
                self.$message.warning('缺少关系的结束表')
              }
              this.graph.graph.getModel().endUpdate()
              return
            }
            let edgeList = parent.children.filter(cell => cell.edge && cell.OwneeRef === relationId)
            if (edgeList.some(edge => edge && edge.source && edge.target)) {
              edgeList.forEach(edge => {
                if (edge && edge.source && edge.target && !hideSelected) { // 线有完整的信息
                  graph.setSelectionCell(edge)
                  graph.scrollCellToVisible(edge, true)
                }
              })
              this.graph.graph.getModel().endUpdate()
              return
            }
            let edgeStyle = (relation.properties.StartCardinality ? relation.properties.StartCardinality : 'None') + ':' + (relation.properties.EndCardinality ? relation.properties.EndCardinality : 'None')
            if (relation.properties.RelationalType === 'NonIdentifying') {
              edgeStyle += 'Dashed'
            }
            if (relation.objectClass && relation.objectClass.indexOf('Virtual') !== -1) {
              edgeStyle += 'Virtual'
            }
            let edge = graph.insertEdge(parent, self.emptyEdgeNum, null,
              parentCell, childCell,
              edgeStyle
            )
            edge.Id = self.emptyEdgeNum
            edge.new = true
            edge.OwneeRef = relationId
            edge.endCardinalityType = relation.properties.EndCardinality
            edge.CardinalityValue = relation.properties.CardinalityValue
            edge.type = relation.objectClass.slice(25)
            edge.relationalType = relation.properties.RelationalType
            if (!hideSelected) {
              self.graph.graph.setSelectionCell(edge)
              self.graph.graph.scrollCellToVisible(edge, true)
            }
            const connection = {
              objectClass: edge.type === 'Relational' ? 'Datablau.ERD.ConnectionRelational' : edge.type === 'View' ? 'Datablau.ERD.ConnectionVirtualView' : edge.type === 'Virtual' ? 'Datablau.ERD.ConnectionVirtual' : edge.type === 'editDisabled' ? 'Datablau.ERD.ConnectionVirtualLine' : edge.type === 'ManyToMany' ? 'Datablau.ERD.ConnectionRelationalManyToMany' : edge.type === 'Subtype' ? 'Datablau.ERD.ConnectionSubtype' : 'Datablau.ERD.Connection',
              properties: {
                BendPoints: edge.CurrentBendPoints,
                ChildShapeRef: edge.target.Id,
                EndOrientation: edge.EndOrientation,
                Id: self.emptyEdgeNum,
                Name: `Connection_${self.emptyEdgeNum}`,
                OwneeRef: relation.properties.Id,
                ParentShapeRef: edge.source.Id,
                RawType: 'Connection',
                StartOrientation: edge.StartOrientation,
                TypeId: 80000009,
                UniqueId: uuidv4(),
                new: true
              }
            }
            self.dataByType.diagram[self.currentId].children.push(connection)
            changes.push(new Changes('insertConnection', {
              name: relation.properties.Name,
              id: self.emptyEdgeNum
            }))
            edge.style = self.graph.drawEdgeShapeStyle(self.emptyEdgeNum)
            self.graph.graph.refresh(edge)
            self.emptyEdgeNum++
          } catch (e) {
            console.log('绘图出错')
          }
          this.graph.graph.getModel().endUpdate()
          // setTimeout(() => {
          if (changes.length) {
            self.$set(self.graph.editor.undoManager.history[self.graph.editor.undoManager.indexOfNextAdd - 1].changes[0], 'changes', changes)
          }
          // })
          // let cell = [...self.deleteEdge].find(cell => cell.OwneeRef === relationId)
          // if (cell) {
          //   self.deleteEdge.delete(cell)
          // }
        }
        $(document).on('click', '.tableDetail', async function () {
          let tableId = parseInt($(this).attr('id'))
          if (this.createLock) {
            return
          }
          this.createLock = true
          try {
            await processAddTable(tableId, self.graph.graph)
            Object.values(self.dataByType.relation).filter(relation => !relation.properties.deleted && (relation.properties.ParentEntityRef === tableId || relation.properties.ChildEntityRef === tableId)).forEach(relation => {
              processAddRelation(relation.properties.Id, self.graph.graph, true)
            })
          } catch (e) {
            console.log(e)
          } finally {
            this.createLock = false
          }
        })
        $(document).on('click', '.relationDetail', function () {
          let relationId = parseInt($(this).attr('id'))
          processAddRelation(relationId, self.graph.graph)
        })
        $(document).on('click', '.commentDetail', function () {
          let commentId = parseInt($(this).attr('id'))
          processAddComment(commentId, self.graph.graph)
          Object.values(self.dataByType.relation).filter(relation => !relation.properties.deleted && (relation.properties.ParentEntityRef === commentId || relation.properties.ChildEntityRef === commentId)).forEach(relation => {
            processAddRelation(relation.properties.Id, self.graph.graph, true)
          })
        })
        $(document).on('click', '.viewDetail', function () {
          let viewId = parseInt($(this).attr('id'))
          processAddView(viewId, self.graph.graph)
          Object.values(self.dataByType.relation).filter(relation => !relation.properties.deleted && (relation.properties.ParentEntityRef === viewId || relation.properties.ChildEntityRef === viewId)).forEach(relation => {
            processAddRelation(relation.properties.Id, self.graph.graph, true)
          })
        })
        if (tableButDrag) {
          mxUtils.makeDraggable(tableBut, this.graph.graph, newEntityDrag, tableButDrag, -15, -15, true, false, false)
        }
        if (viewButDrag) {
          mxUtils.makeDraggable(viewBut, this.graph.graph, newViewDrag, viewButDrag, -15, -15, true, false, false)
        }
        if (businessButDrag) {
          mxUtils.makeDraggable(businessBut, this.graph.graph, newBusinessDrag, businessButDrag, -15, -15, true, false, false)
        }
        if (commentButDrag) {
          mxUtils.makeDraggable(commentBut, this.graph.graph, newCommentDrag, commentButDrag, -15, -15, true, false, false)
        }
        if (figureButDrag) {
          mxUtils.makeDraggable(figureBut, this.graph.graph, newFigureDrag, figureButDrag, -15, -15, true, false, false)
        }
        // document.getElementsByClassName('tableDetail').forEach(table => {
        //   let tableId = parseInt($(table).attr('id'))
        //   mxUtils.makeDraggable(table, this.graph.graph, (graph, evt, cell) => {
        //     if (graph.canImportCell(cell)) {
        //       processAddTable(tableId, graph, evt, cell)
        //     }
        //   }, table.cloneNode(true))
        // })
        // if (tableBut) {
        //   tableBut.addEventListener('click', () => {
        //     this.createTable()
        //   })
        // }
        // if (viewBut) {
        //   viewBut.addEventListener('click', () => {
        //     this.createView()
        //   })
        // }
        // if (businessBut) {
        //   businessBut.addEventListener('click', () => {
        //     this.createBusiness()
        //   })
        // }
        // commentBut.addEventListener('click', () => {
        //   this.createComment()
        // })
        // figureBut.addEventListener('click', () => {
        //   this.createFigure()
        // })
        let editor = this.graph.editor
        let graph = this.graph.graph
        // graph.addListener(mxEvent.RESIZE_CELLS, (sender, evt) => { // resize
        //   var cells = evt.getProperty('cells')
        //   if (cells != null) {
        //     for (var i = 0; i < cells.length; i++) {
        //       var geo = graph.getCellGeometry(cells[i])
        //       const vertex = this.graph.shapes[cells[i].id]
        //       vertex.value = vertex.value.replace(/height:\d+px;width:\d+px/, `height:${geo.height}px;width:${geo.width}px`)
        //       graph.getModel().setGeometry(cells[i], geo)
        //     }
        //   }
        // })
        if (this.editorType === 'model' && !this.disabledEdit) {
          graph.addListener(mxEvent.DOUBLE_CLICK, (sender, evt) => {
            // if (this.currentEdgeType) {
            //   return
            // }
            let target = evt.properties.event.target
            let currentCol = null
            let cell = evt.getProperty('cell')
            if (typeof target.parentNode.className === 'string' && target.parentNode.className.indexOf('svg-col') > -1) {
              currentCol = target.parentNode
            }
            if (typeof target.className === 'string' && target.className.indexOf('svg-col') > -1) {
              currentCol = target
            }
            if (cell !== undefined) {
              this.loading.text = ''
              this.loading.status = true
              if (currentCol) {
                // 当双击的是字段时，打开字段编辑页面
                let colId = parseInt(currentCol.getAttribute('data-id'))
                this.cellDialogData = cell
                this.edgeDialogData = null
                this.afterHandleColDialogData(cell.OwneeRef, colId, cell.isView)
                this.loading.status = false
                return
              }
              // if (cell.vertex !== null && cell.vertex) {
              if (cell.isView || cell.isTable || cell.isComment || cell.isFigure) {
                if (this.dataByType.diagram[this.currentId].children) {
                  this.cellDialogData = cell
                  this.edgeDialogData = null
                  this.currentStyleRelatedShapeTemplate = this.formatThemeTemplateData(_.cloneDeep(this.dataByType.diagram[this.currentId].children.find(shape => !shape.properties.deleted && shape.properties.Id === cell.Id)).properties)
                }
                if (cell.isView) {
                  this.afterHandleViewDialogData(cell.OwneeRef, true)
                } else if (cell.isTable) {
                  this.afterHandleDialogData(cell.OwneeRef, true)
                } else if (cell.isComment) {
                  if (!this.currentStyleRelatedShapeTemplate.StyleFontFamily) {
                    this.$set(this.currentStyleRelatedShapeTemplate, 'StyleFontFamily', this.currentStyleRelatedShapeTemplate.CommentTextFontFamily)
                  }
                  if (!this.currentStyleRelatedShapeTemplate.StyleFontSize) {
                    this.$set(this.currentStyleRelatedShapeTemplate, 'StyleFontSize', this.currentStyleRelatedShapeTemplate.CommentTextFontSize)
                  }
                  this.afterHandleCommentData(cell.OwneeRef)
                } else if (cell.isFigure && !cell.isPolygon) {
                  this.editFigureDialog = true
                }
              } else if (cell.isSubType) { // subtype编辑
                this.currentStyleRelatedShapeTemplate = this.formatThemeTemplateData(_.cloneDeep(this.dataByType.diagram[this.currentId].children.find(shape => !shape.properties.deleted && shape.properties.Id === cell.Id)).properties)
                let parentTable = this.dataByType.table[cell.ParentTableId]
                let subtype = parentTable.children?.find(column => column.properties.Id === cell.SubTypeRef && !column.properties.deleted)
                this.subtypeDialogKey++
                this.subtypeDialog = true
                this.subtypeDialogData = subtype
                this.subtypeCellData = cell
              } else if (cell.edge != null && cell.edge) {
                // if (cell.type === 'Subtype') {
                //   this.$datablauMessage.warning('Subtype关系暂不支持在web端编辑，请前往客户端')
                //   this.loading.status = false
                //   return
                // } else
                if (cell.type === 'Subtype' && cell.subtypeTopEdge) { // subtype关系的最上面的edge
                  this.currentStyleRelatedShapeTemplate = this.formatThemeTemplateData(_.cloneDeep(this.dataByType.diagram[this.currentId].children.find(shape => !shape.properties.deleted && shape.properties.Id === cell.Id)).properties)
                  let parentTable = this.dataByType.table[cell.target.ParentTableId]
                  let subtype = parentTable.children?.find(column => column.properties.Id === cell.target.SubTypeRef && !column.properties.deleted)
                  this.subtypeDialogKey++
                  this.subtypeDialog = true
                  this.subtypeDialogData = subtype
                  this.subtypeCellData = cell
                  this.loading.status = false
                  return
                }
                if (cell.type === 'editDisabled') {
                  this.$datablauMessage.warning('此虚拟关系不支持编辑')
                  this.loading.status = false
                  return
                }
                // this.currentStyleRelatedShapeTemplate = this.formatThemeTemplateData(_.cloneDeep(this.dataByType.diagram[this.currentId].children.find(shape => !shape.properties.deleted && shape.properties.Id === cell.Id)).properties)
                // this.edgeDialogData = _.cloneDeep(cell)
                // this.cellDialogData = null
                // this.edgeDialogKey++
                // this.edgeDialog = true
                this.currentStyleRelatedShapeTemplate = this.formatThemeTemplateData(_.cloneDeep(this.dataByType.diagram[this.currentId].children.find(shape => !shape.properties.deleted && shape.properties.Id === cell.Id)).properties)
                this.edgeDialogKey++
                this.edgeDialog = true
                this.edgeDialogData = cell
              }
              this.loading.status = false
            }
          })
        }
        // 字段的双击事件
        // $('.svg-col').on('doubleclick', (e) => {
        //   e.stopPropagation()
        //   let tableId = e.currentTarget.getAttribute('p-id')
        //   let colId = parseInt(e.currentTarget.getAttribute('data-id'))
        //   this.afterHandleColDialogData(tableId, colId)
        // })
        graph.addListener(mxEvent.CLICK, (sender, evt) => {
          setTimeout(() => {
            this.preSelectCells = this.graph.graph.getSelectionCells()
          }, 200)
          if (this.$refs.filterDropDown) {
            this.$refs.filterDropDown.visible = false
          }
          if (this.$refs.textFamilyRef) {
            this.$refs.textFamilyRef.visible = false
          }
          if (this.$refs.textSizeRef) {
            this.$refs.textSizeRef.visible = false
          }
          if (this.$refs.textColorRef) {
            this.$refs.textColorRef.showPicker = false
          }
          if (this.$refs.textColorRef2) {
            this.$refs.textColorRef2.showPicker = false
          }
          this.$bus.$emit('closeContextMenu')
          $('.left-panel-wrapper').trigger('click')
          this.$refs.scaleInput1?.$el.querySelector('input').blur()
          this.$refs.scaleInput2?.$el.querySelector('input').blur()
          let cell = evt.getProperty('cell')
          let currentTarget = evt.properties.event.target
          let isCol = false
          let colId = null
          let colStyle = null
          let currentEntity = null
          if (cell) {
            if (cell.isTable) {
              currentEntity = this.dataByType.table[cell.OwneeRef]
            } else if (cell.isView) {
              currentEntity = this.dataByType.view[cell.OwneeRef]
            }
          }
          let target = evt.properties.event.target
          if (currentTarget.className.indexOf && currentTarget.className.indexOf('svg-col') > -1) {
            isCol = true
            colId = parseInt(currentTarget.dataset.id)
          } else if (currentTarget.parentNode && currentTarget.parentNode.className && currentTarget.parentNode.className.indexOf && currentTarget.parentNode.className.indexOf('svg-col') > -1) {
            isCol = true
            colId = parseInt(currentTarget.parentNode.dataset.id)
          }
          if (this.currentOperate !== 'moveCell') { // 不是移动触发的点击
            this.currentCell = cell
            this.showResizeButton = false
          }
          this.currentOperate = 'clickCell'
          if (cell !== undefined) {
            if (cell.isBusiness) {
              this.$bus.$emit('highlight', 'currentBusinessId', cell.OwneeRef)
            } else if (cell.isTable) {
              this.$bus.$emit('highlight', 'currentTableId', cell.OwneeRef)
            } else if (cell.isView) {
              this.$bus.$emit('highlight', 'currentViewId', cell.OwneeRef)
            } else if (cell.edge) {
              this.$bus.$emit('highlight', 'currentRelationId', cell.OwneeRef)
            } else if (cell.isComment) {
              this.$bus.$emit('highlight', 'currentComentId', cell.OwneeRef)
            }
            this.cellDialogData = cell
            let shape = this.dataByType.diagram[this.currentId].children.find(shape => !shape.properties.deleted && shape.properties.Id === cell.Id)
            let style = null
            if (isCol) {
              let tableDiagram = shape
              colStyle = tableDiagram && tableDiagram.children && tableDiagram.children.find(v => v.properties.AttributeRef === colId)
              this.currentTableDiagram = tableDiagram
              if (colStyle) {
                // 说明已经有自定义样式则从diagram获取
                style = this.formatThemeTemplateData(_.cloneDeep(colStyle).properties)
              } else {
                let currentCol = null
                if (cell.isTable) {
                  currentCol = this.dataByType.table[cell.OwneeRef].children.find(v => v.objectClass === 'Datablau.LDM.EntityAttribute' && v.properties.Id === colId)
                } else if (cell.isView) {
                  currentCol = this.dataByType.view[cell.OwneeRef].children.find(v => v.objectClass === 'Datablau.LDM.EntityAttribute' && v.properties.Id === colId)
                }
                // 没有自定义则获取全局字段样式
                if (currentCol) {
                  style = this.formatThemeTemplateData(_.cloneDeep(currentCol).properties)
                }
                // 有全局样式时
                if (style.AttributeTextFontSize) {
                  let newStyle = {
                    StyleFontFamily: style.AttributeTextFontFamily,
                    StyleFontLineThrough: style.AttributeTextFontLineThrough,
                    StyleFontSize: style.AttributeTextFontSize,
                    StyleFontUnderLine: style.AttributeTextFontUnderLine,
                    StyleTextColor: style.AttributeTextColor,
                    StyleBackColor: '',
                    StyleFontBoldItalic: style.AttributeTextFontBoldItalic
                  }
                  style = newStyle
                }
              }
            } else {
              style = this.formatThemeTemplateData(_.cloneDeep(shape.properties))
            }
            this.currentStyle = {
              StyleFontFamily: null,
              StyleBackColor: null,
              StyleFontBoldItalic: null,
              StyleFontUnderLine: null,
              StyleFontLineThrough: null,
              StyleTextColor: null,
              StyleFontSize: null,
              checkList: null,
              shape,
              cell,
              colStyle,
              colId,
              isCol,
              currentEntity
            }
            let checkList = []
            if (style.StyleFontBoldItalic === 'BoldItalic') {
              checkList = ['Bold', 'Italic']
            } else if (style.StyleFontBoldItalic) {
              checkList = [style.StyleFontBoldItalic]
            }
            // this.currentStyle.shape = shape
            // this.currentStyle.cell = cell
            setTimeout(() => {
              this.preSelectCells?.forEach(selectCell => {
                if (selectCell.isTable || selectCell.isView) {
                  let $header = $(`[data-oween-id=${selectCell.OwneeRef}]`).find('.svg-tName')
                  $header.css('backgroundColor', $header.attr('header-unselected-color') === 'Control' ? '#F0F0F0' : $header.attr('header-unselected-color'))
                }
              })
              let cells = this.graph.graph.getSelectionCells()
              cells?.forEach(cell => {
                if (cell.isTable || cell.isView) {
                  let $header = $(`[data-oween-id=${cell.OwneeRef}]`).find('.svg-tName')
                  $header.css('backgroundColor', $header.attr('header-selected-color'))
                }
              })
            })
            if (cell.isTable || cell.isView) {
              this.showResizeButton = true
              // 获取对象的样式属性
              this.currentStyle.StyleBackColor = style.StyleBackColor
              if (isCol) {
                this.currentStyle.StyleFontFamily = style.StyleFontFamily || ''
                this.currentStyle.StyleTextColor = style.StyleTextColor
                this.currentStyle.StyleFontBoldItalic = style.StyleFontBoldItalic || ''
                this.currentStyle.StyleFontLineThrough = style.StyleFontLineThrough || ''
                this.currentStyle.StyleFontUnderLine = style.StyleFontUnderLine || ''
                this.currentStyle.StyleFontSize = style.StyleFontSize
                this.currentStyle.checkList = checkList
              }
            } else if (cell.isFigure) {
              this.currentStyle.StyleBackColor = style.StyleBackColor
            } else if (cell.isComment) {
              this.currentStyle.StyleFontFamily = style.StyleFontFamily || style.CommentTextFontFamily
              this.currentStyle.StyleFontSize = style.StyleFontSize || style.CommentTextFontSize
              this.currentStyle.StyleTextColor = style.StyleTextColor
              this.currentStyle.StyleFontBoldItalic = style.StyleFontBoldItalic || ''
              this.currentStyle.StyleFontLineThrough = style.StyleFontLineThrough || ''
              this.currentStyle.StyleFontUnderLine = style.StyleFontUnderLine || ''
              this.currentStyle.checkList = checkList
            } else if (cell.isSubType) {
              this.currentStyle.StyleBackColor = style.StyleBackColor
            } else { // 是关系
              this.currentStyle.isRelation = true
              this.currentStyle.StyleBackColor = style.StyleBackColor2
            }
          } else {
            this.currentStyle = {
              StyleFontFamily: null,
              StyleBackColor: null,
              StyleFontBoldItalic: null,
              StyleFontUnderLine: null,
              StyleFontLineThrough: null,
              StyleTextColor: null,
              StyleFontSize: null,
              checkList: null
            }
            let $header = $(target).find('.svg-tName')
            $header.each((index, value) => {
              let $h = $(value)
              $h.css('backgroundColor', $h.attr('header-unselected-color') === 'Control' ? '#F0F0F0' : $h.attr('header-unselected-color'))
            })
            this.$bus.$emit('highlight', 'null', null)
          }
        })
        graph.addListener(mxEvent.MOVE_CELLS, (sender, evt) => {
          this.currentOperate = 'moveCell'
          let cells = evt.getProperty('cells')
          let { dx, dy } = evt.properties
          cells && cells.forEach(cell => { // 防止拖出边界
            let { geometry } = cell
            if (geometry.x < 0) {
              if (cell.isFigure) {
                dx -= geometry.x
              }
              geometry.x = 0
            }
            if (geometry.y < 0) {
              if (cell.isFigure) {
                dy -= geometry.y
              }
              geometry.y = 0
            }
          })
          let cell = cells[0]
          if (cell !== undefined) {
            if (cell.isTable || cell.isView) {
              setTimeout(() => {
                this.currentCell = cell
                this.showResizeButton = true
              })
            }
          }
          setTimeout(() => {
            this.preSelectCells?.forEach(selectCell => {
              if (selectCell.isTable || selectCell.isView) {
                let $header = $(`[data-oween-id=${selectCell.OwneeRef}]`).find('.svg-tName')
                $header.css('backgroundColor', $header.attr('header-unselected-color') === 'Control' ? '#F0F0F0' : $header.attr('header-unselected-color'))
              }
            })
            cells?.forEach(cell => {
              if (cell.isTable || cell.isView) {
                let $header = $(`[data-oween-id=${cell.OwneeRef}]`).find('.svg-tName')
                $header.css('backgroundColor', $header.attr('header-selected-color'))
              }
            })
          })
        })
        mxEvent.addListener(this.graph.container, 'mousemove', (event) => {
          let mouseX = mxEvent.getClientX(event) // 获取鼠标在视口中的 X 坐标
          let mouseY = mxEvent.getClientY(event) // 获取鼠标在视口中的 Y 坐标
          // 将视口坐标转换为图形容器内坐标
          let containerPoint = mxUtils.convertPoint(this.graph.container, mouseX, mouseY)
          this.graphX = containerPoint.x // 在图形容器内的 X 坐标
          this.graphY = containerPoint.y // 在图形容器内的 Y 坐标
        })
        graph.getModel().addListener(mxEvent.CHANGE, async (sender, evt) => { // resize
          this.hasEdit = true
          const changes = evt.getProperty('changes')
          if (changes[0] && changes[0].child && changes[0].child.deleteReal) {
            changes.forEach(change => {
              change.child && (change.child.deleteReal = true)
            })
          } else {
            changes.forEach(change => {
              change.child && (change.child.deleteReal = false)
            })
          }
          this.deleteColumnState = null
          if (changes) {
            for (let change of changes) {
              let cell = change.cell
              const geometry = change.geometry
              const previous = change.previous
              if (cell && !cell.edge && geometry && previous) {
                let cs = []
                if (Math.abs(geometry.width - previous.width) > 0.5 || Math.abs(geometry.height - previous.height) > 0.5) { // 大小改动
                  // cell.value = cell.value.replace(/height:\S+px;width:\S+px/, `height:${geometry.height}px;width:${geometry.width}px`)
                  cell.geometry.width = geometry.width
                  cell.geometry.height = geometry.height
                  // graph.getModel().setGeometry(cell, geometry.clone())
                  let shape = this.dataByType.diagram[this.currentId].children.find(item => !item.properties.deleted && item.properties.Id === cell.Id)
                  shape.properties.ShapeSize.height = geometry.height
                  shape.properties.ShapeSize.width = geometry.width
                  let tableOrView = this.graph.dataByType[cell.isView ? 'view' : cell.isTable ? 'table' : cell.isComment ? 'comment' : 'table'][cell.OwneeRef]
                  if (tableOrView && tableOrView.posit) {
                    const posit = tableOrView.posit
                    posit.ShapeSize.width = geometry.width
                    posit.ShapeSize.height = geometry.height
                    this.$bus.$emit('noRefreshDiagram') // 避免卡顿,修改posit相当于修改diagram里的posit会触发外层diagram上的watch方法
                  }
                  // cell.value = cell.value.replace(/height:\S+px;width:\S+px/, `height:${geometry.height}px;width:${geometry.width}px`)
                  if (cell.isTable) {
                    cell.value = await this.getTableHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
                    cell.viceValue = cell.value
                  } else if (cell.isView) {
                    cell.value = await this.getViewHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
                    cell.viceValue = cell.value
                  } else if (cell.isComment) {
                    cell.value = this.getCommentHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
                    this.graph.graph.refresh(cell)
                  } else if (cell.isFigure) {
                    cell.style = this.getFigureHTMLFunction(cell.Id, this.graph.graph, null, null, true)
                    this.graph.graph.refresh(cell)
                  }

                  // 调整大小后重新计算相应关系的起始位置和结束位置 会影响前进回退暂时隐藏
                  // let cellList = this.graph.graph.getDefaultParent().children
                  // let edgeList = cellList.filter(edge => edge.edge && (edge.target.OwneeRef === cell.OwneeRef || edge.source.OwneeRef === cell.OwneeRef))
                  // if (edgeList.length) {
                  //   edgeList.forEach(edge => {
                  //     edge.CurrentBendPoints = ''
                  //     edge.BendPoints = ''
                  //     edge.style = this.graph.drawEdgeShapeStyle(edge.Id)
                  //     edge.setStyle(edge.style)
                  //     this.graph.graph.refresh(edge)
                  //   })
                  // }
                  if (cell.isTable || cell.isView) {
                    let $table = $(`[data-oween-id=${cell.OwneeRef}]`)
                    if (this.graph.displaySetting.column === 'key') {
                      $table.not('.svg-business').find('.svg-col').each((index, item) => {
                        let $item = $(item)
                        if ($item.attr('class').indexOf('k') === -1) {
                          $item.hide()
                        } else {
                          $item.show()
                        }
                      })
                    } else if (this.graph.displaySetting.column === 'all') {
                      if ($table.hasClass('collapsed')) {
                        $table.find('.collapse-btn').click()
                      }
                      $table.find('.svg-col').each((index, item) => {
                        $(item).show()
                      })
                    } else if (this.graph.displaySetting.column === 'no') {
                      cell.geometry.height = 30
                      if (!$table.hasClass('collapsed')) {
                        $table.find('.collapse-btn').click()
                      }
                      $table.not('.svg-business').find('.svg-col').each((index, item) => {
                        $(item).hide()
                      })
                    }
                    graph.refresh(cell)
                    graph.getView().refresh()
                    if (this.graph.displaySetting.type) {
                      $('.svg-col').html(function () {
                        if (!$(this).text().includes($(this).attr('data-type'))) {
                          return '<span>' + $(this).text() + ' : ' + $(this).attr('data-type') + '</span>'
                        }
                      })
                    } else {
                      $('.svg-col').html(function () {
                        return '<span>' + $(this).text().split(' :')[0] + '</span>'
                      })
                    }
                  }

                  cs.push(new Changes('modifySize', {
                    id: cell.OwneeRef,
                    name: cell.isFigure ? cell.Name : cell.isSubType ? 'SubType_' + cell.Id : tableOrView.properties.Name,
                    width: Number.parseInt(cell.geometry.width),
                    height: Number.parseInt(cell.geometry.height)
                  }))
                  window.changePosition = true
                } else if (Math.abs(geometry.x - previous.x) > 0.5 || Math.abs(geometry.y - previous.y) > 0.5) { // 位置改动
                  window.changePosition = true
                  let tableOrView = this.graph.dataByType[cell.isView ? 'view' : cell.isTable ? 'table' : cell.isComment ? 'comment' : 'table'][cell.OwneeRef]
                  if (tableOrView && tableOrView.posit) {
                    const posit = tableOrView.posit
                    posit.Location.x = cell.geometry.x
                    posit.Location.y = cell.geometry.y
                    this.$bus.$emit('noRefreshDiagram') // 避免卡顿
                  }
                  cs.push(new Changes('modifyPosition', {
                    id: cell.isFigure || cell.isSubType ? cell.Id : cell.OwneeRef,
                    name: cell.isFigure ? cell.Name : cell.isSubType ? 'SubType_' + cell.Id : this.dataByType[cell.isView ? 'view' : cell.isTable ? 'table' : cell.isComment ? 'comment' : ''][cell.OwneeRef].properties.Name,
                    x: Number.parseInt(cell.geometry.x),
                    y: Number.parseInt(cell.geometry.y)
                  }))

                  // 组合图框移动操作
                  if (cell && (cell.isFigure || cell.isBusiness) && !(this.currentOperate === 'redo' || this.currentOperate === 'undo')) {
                    let diagrams = this.dataByType.diagram[this.currentId].children
                    let shape = diagrams.find(shape => !shape.properties.deleted && shape.properties.Id === cell.Id)
                    let children = this.graph.graph.getDefaultParent().children
                    if (shape && shape.properties.CompostedShapesRef) {
                      let relatedCells = new Set()
                      shape.properties.CompostedShapesRef.split(',').map(i => {
                        let cell = children.find(cell => cell.Id === +i)
                        if (cell) {
                          relatedCells.add(cell)
                        }
                        cell.edges?.forEach(edge => {
                          if (edge.source.isSubType) {
                            relatedCells.add(edge.source)
                          } else if (edge.target.isSubType) {
                            relatedCells.add(edge.target)
                          }
                        })
                      })
                      relatedCells.forEach(cell => {
                        cell.geometry.x += (geometry.x - previous.x)
                        cell.geometry.y += (geometry.y - previous.y)
                        cell.changed = true
                        this.graph.graph.refresh(cell)
                      })
                      let cellIds = Array.from(relatedCells).map(cell => cell.Id)
                      children.filter(cell => cell.edge && (cellIds.includes(cell.source.Id) || cellIds.includes(cell.target.Id))).forEach(edge => {
                        edge.changed = true
                        this.graph.graph.refresh(edge)
                      })
                      this.graph.graph.getView().refresh()
                    }
                  }
                } else {
                  window.changePosition = false
                }
                if (!(this.currentOperate === 'redo' || this.currentOperate === 'undo')) {
                  setTimeout(() => {
                    this.$set(this.graph.editor.undoManager.history[this.graph.editor.undoManager.indexOfNextAdd - 1].changes[0], 'changes', cs)
                  })
                }
              } else {
                window.changePosition = false
              }
              if (this.currentOperate === 'redo' || this.currentOperate === 'undo') {
                // 组合图框撤销移动操作
                if (cell && (cell.isFigure || cell.isBusiness)) {
                  let diagrams = this.dataByType.diagram[this.currentId].children
                  let shape = diagrams.find(shape => !shape.properties.deleted && shape.properties.Id === cell.Id)
                  let children = this.graph.graph.getDefaultParent().children
                  if (shape && shape.properties.CompostedShapesRef) {
                    let relatedCells = shape.properties.CompostedShapesRef.split(',').map(i => {
                      return children.find(cell => cell.Id === +i)
                    }).filter(item => item)
                    relatedCells.forEach(cell => {
                      cell.geometry.x += (geometry.x - previous.x)
                      cell.geometry.y += (geometry.y - previous.y)
                      cell.changed = true
                      this.graph.graph.refresh(cell)
                    })
                    this.graph.graph.getView().refresh()
                  }
                }
              }
              if (cell) {
                // 记录是否修改
                cell.changed = true
                cell.edges && cell.edges.forEach(item => {
                  if (item.edge) {
                    item.changed = true
                    if (item.OwneeRef && item.OwneeRef !== -1) {
                      this.dataByType.relation[item.OwneeRef].properties.changed = true
                    }
                  }
                })
              }
              if (cell && cell.edge && previous && !(this.currentOperate === 'redo' || this.currentOperate === 'undo')) {
                let cs = []
                window.changePosition = true
                let shape = this.dataByType.diagram[this.currentId].children.find(item => !item.properties.deleted && item.properties.Id === cell.Id)
                if (!cell.isPolygon) {
                  let arr = cell.CurrentBendPoints.split(/[;,]/)
                  shape.properties.BendPoints = cell.CurrentBendPoints
                  shape.properties.changed = true
                  cs.push(new Changes('modifyConnection', {
                    id: cell.Id,
                    name: 'connection_' + cell.Id,
                    start: {
                      x: parseInt(arr[1]),
                      y: parseInt(arr[2])
                    },
                    end: {
                      x: parseInt(arr[6]),
                      y: parseInt(arr[7])
                    }
                  }))
                } else {
                  if (evt.properties && evt.properties.changes) {
                    if (evt.properties.changes.some(change => change instanceof mxTerminalChange)) {
                      cell.geometry.points = cell.pts
                      if (!cell.isLine) { // 图形拖动起始点，终点也被拖动，反之亦然
                        if (change.geometry.sourcePoint.x !== change.previous.sourcePoint.x || change.geometry.sourcePoint.y !== change.previous.sourcePoint.y) {
                          cell.geometry.setTerminalPoint(change.geometry.sourcePoint, false)
                        }
                        if (change.geometry.targetPoint.x !== change.previous.targetPoint.x || change.geometry.targetPoint.y !== change.previous.targetPoint.y) {
                          cell.geometry.setTerminalPoint(change.geometry.targetPoint, true)
                        }
                      }
                      this.graph.graph.getView().refresh()
                    } else {
                      cell.pts = _.cloneDeep(cell.geometry.points)
                    }
                  }
                  let geometry = cell.geometry
                  shape.properties['Path'] = `${geometry.sourcePoint.x},${geometry.sourcePoint.y};` + geometry.points.map(p => `${p.x},${p.y};`).join('')
                  shape.properties['Location'] = `${parseInt(cell.geometry.sourcePoint.x)},${parseInt(cell.geometry.sourcePoint.y)}`
                  if (cell.isLine) {
                    shape.properties['Path'] += `${geometry.targetPoint.x},${geometry.targetPoint.y}`
                  }
                  let points = cell.geometry.points
                  cs.push(new Changes('modifyConnection', {
                    id: cell.Id,
                    name: 'connection_' + cell.Id,
                    start: {
                      x: parseInt(points[0].x),
                      y: parseInt(points[0].y)
                    },
                    end: {
                      x: parseInt(points[points.length - 1].x),
                      y: parseInt(points[points.length - 1].y)
                    }
                  }))
                }
                setTimeout(() => {
                  this.$set(this.graph.editor.undoManager.history[this.graph.editor.undoManager.indexOfNextAdd - 1].changes[0], 'changes', cs)
                })
              }
              cell = change.child
              if (cell) {
                // if (cell.deleteReal || this.realDelete) { // 永久操作
                if (this.realDelete) {
                  if (change.previous) { // 永久删除
                    if (!(cell.isView || cell.isTable || cell.isComment || cell.isFigure || cell.isSubType)) { // 永久线删除
                      if (this.currentOperate === 'deleteEdge') {
                        let changes = []
                        this.deleteEdge.add(cell)
                        if ((cell.type === 'Subtype' && cell.subtypeTopEdge) && !this.retainSubTypeAndTopRelation) {
                          this.$set(this.dataByType.relation[cell.OwneeRef].properties, 'deleted', true)

                          changes.push(new Changes('deleteRelation', {
                            id: this.dataByType.relation[cell.OwneeRef].properties.Id,
                            name: this.dataByType.relation[cell.OwneeRef].properties.Name
                          }))
                        } else if (!(cell.type === 'Subtype' && cell.subtypeTopEdge) && cell.OwneeRef) {
                          this.$set(this.dataByType.relation[cell.OwneeRef].properties, 'deleted', true)

                          changes.push(new Changes('deleteRelation', {
                            id: this.dataByType.relation[cell.OwneeRef].properties.Id,
                            name: this.dataByType.relation[cell.OwneeRef].properties.Name
                          }))
                        }
                        let shape = this.dataByType.diagram[this.currentId].children.find(shape => !shape.properties.deleted && shape.properties.Id === cell.Id)
                        if (shape) {
                          // shape.properties.deleted = true
                          this.$set(shape.properties, 'deleted', true)
                        }
                        changes.push(new Changes('deleteConnection', {
                          id: cell.Id,
                          name: this.dataByType.relation[cell.OwneeRef]?.properties.Name
                        }))
                        this.pathIds = new Set()
                        this.calculateStartIdToEndIds()

                        let originSourceTablePrevious = _.cloneDeep(this.dataByType.table[this.dataByType.relation[cell.OwneeRef].properties.ChildEntityRef])
                        await this.redoUndoRealCancelRelation(cell, changes, this.deleteColumnState)
                        if (this.deleteColumnState) {
                          if (cell.type === 'Relational' && (cell.relationalType === 'Identifying' || cell.relationalType === 'NonIdentifying')) { // 主键关系和非主键关系传递删除
                            let targetOwneeRef = cell.target ? cell.target.OwneeRef : cell.targetOwneeRef
                            let endIds = this.startIdToEndIds[targetOwneeRef]
                            await this.createDeepRelation(endIds, cell.target, changes, originSourceTablePrevious, true)
                          }
                        }
                        // this.$set(this.graph.editor.undoManager.history[this.graph.editor.undoManager.indexOfNextAdd - 1].changes[0], 'changes', changes)
                        setTimeout(() => {
                          if (this.graph.editor.undoManager.history[this.graph.editor.undoManager.indexOfNextAdd - 1].changes[0].changes) {
                            this.graph.editor.undoManager.history[this.graph.editor.undoManager.indexOfNextAdd - 1].changes[0].changes = [...this.graph.editor.undoManager.history[this.graph.editor.undoManager.indexOfNextAdd - 1].changes[0].changes, ...changes]
                          } else {
                            this.$set(this.graph.editor.undoManager.history[this.graph.editor.undoManager.indexOfNextAdd - 1].changes[0], 'changes', changes)
                          }
                        })
                      } else if (this.currentOperate === 'deleteTable') { // 删除表引起的关系删除
                        let cs = []
                        this.deleteEdge.add(cell)
                        if (cell.OwneeRef) {
                          this.$set(this.dataByType.relation[cell.OwneeRef].properties, 'deleted', true)

                          cs.push(new Changes('deleteRelation', {
                            id: this.dataByType.relation[cell.OwneeRef].properties.Id,
                            name: this.dataByType.relation[cell.OwneeRef].properties.Name
                          }))
                        }
                        let shape = this.dataByType.diagram[this.currentId].children.find(shape => !shape.properties.deleted && shape.properties.Id === cell.Id)
                        if (shape) {
                          // shape.properties.deleted = true
                          this.$set(shape.properties, 'deleted', true)
                        }
                        cs.push(new Changes('deleteConnection', {
                          id: cell.Id,
                          name: this.dataByType.relation[cell.OwneeRef]?.properties.Name
                        }))

                        this.pathIds = new Set()
                        this.calculateStartIdToEndIds()
                        if (this.deleteColumnState === null) {
                          if (this.deletedCell?.isSubType) { // 删除的第一个元素是subtype，则弹出是否删除字段的提示框 this.deleteColumnState用于是否弹框

                          } else {
                            this.deleteColumnState = false
                          }
                        } else { // 有值了就不修改了

                        }
                        // this.deleteColumnState = false
                        let originSourceTablePrevious = _.cloneDeep(this.dataByType.table[this.dataByType.relation[cell.OwneeRef].properties.ChildEntityRef])
                        await this.redoUndoRealCancelRelation(cell, cs, this.deleteColumnState)
                        if (this.deleteColumnState) {
                          if (cell.type === 'Relational' && cell.relationalType === 'Identifying') {
                            let targetOwneeRef = cell.target ? cell.target.OwneeRef : cell.targetOwneeRef
                            let endIds = this.startIdToEndIds[targetOwneeRef]
                            await this.createDeepRelation(endIds, cell.target, changes, originSourceTablePrevious, true)
                          }
                        }
                        setTimeout(() => {
                          if (this.graph.editor.undoManager.history[this.graph.editor.undoManager.indexOfNextAdd - 1].changes[0].changes) {
                            this.graph.editor.undoManager.history[this.graph.editor.undoManager.indexOfNextAdd - 1].changes[0].changes = [...this.graph.editor.undoManager.history[this.graph.editor.undoManager.indexOfNextAdd - 1].changes[0].changes, ...cs]
                          } else {
                            this.$set(this.graph.editor.undoManager.history[this.graph.editor.undoManager.indexOfNextAdd - 1].changes[0], 'changes', cs)
                          }
                        })
                      } else if (this.currentOperate === 'redo' || this.currentOperate === 'undo') {
                        this.deleteEdge.add(cell)
                        // this.$set(this.dataByType.relation[cell.OwneeRef].properties, 'deleted', true)
                        // this.$parent.$parent.$parent.$parent.$forceUpdate()
                        // this.pathIds = new Set()
                        // await this.redoUndoRealCancelRelation(cell)
                        // if (cell.type === 'Relational' && cell.relationalType === 'Identifying') {
                        //   let targetOwneeRef = cell.target ? cell.target.OwneeRef : cell.targetOwneeRef
                        //   let endIds = this.startIdToEndIds[targetOwneeRef]
                        //   await this.redoUndoDeepRealCancelRelation(targetOwneeRef, endIds)
                        // }
                        this.handleChanges(change.changes, this.currentOperate === 'undo')
                      }
                    } else { // 永久实体删除
                      if (this.currentOperate === 'deleteTable' || this.currentOperate === 'deleteEdge') {
                        let cs = []

                        let shape = this.dataByType.diagram[this.currentId].children.find(shape => !shape.properties.deleted && shape.properties.Id === cell.Id)
                        if (shape) {
                          this.$set(shape.properties, 'deleted', true)
                          // shape.properties.deleted = true
                        }
                        if (cell.isSubType) {
                          let table = this.dataByType.table[cell.ParentTableId]
                          let subtype = table.children?.find(column => column.properties.Id === cell.SubTypeRef && !column.properties.deleted)
                          cs.push(new Changes('deleteShape', {
                            id: cell.Id,
                            name: subtype.properties.Name
                          }))
                          if (!this.retainSubTypeAndTopRelation) {
                            this.$set(subtype.properties, 'deleted', true)
                            cs.push(new Changes('deleteSubtype', {
                              pId: table.properties.Id,
                              pName: table.properties.Name,
                              id: subtype.properties.Id,
                              name: subtype.properties.Name
                            }))
                          }
                        } else {
                          cs.push(new Changes('deleteShape', {
                            id: cell.Id,
                            name: cell.isFigure ? 'Figure_' + cell.Id : this.graph.dataByType[cell.isView ? 'view' : cell.isTable ? 'table' : cell.isComment ? 'comment' : 'table'][cell.OwneeRef].properties.Name
                          }))
                          if (!cell.isFigure) {
                            cs.push(new Changes('delete' + (cell.isView ? 'View' : cell.isTable ? 'Table' : cell.isComment ? 'Comment' : 'Table'), {
                              id: cell.OwneeRef,
                              name: this.graph.dataByType[cell.isView ? 'view' : cell.isTable ? 'table' : cell.isComment ? 'comment' : 'table'][cell.OwneeRef].properties.Name
                            }))
                            this.$set(this.graph.dataByType[cell.isView ? 'view' : cell.isTable ? 'table' : cell.isComment ? 'comment' : 'table'][cell.OwneeRef].properties, 'deleted', true)
                          }
                        }
                        // setTimeout(() => {
                        //   this.$set(this.graph.editor.undoManager.history[this.graph.editor.undoManager.indexOfNextAdd - 1].changes[0], 'changes', cs)
                        // })
                        setTimeout(() => {
                          if (this.graph.editor.undoManager.history[this.graph.editor.undoManager.indexOfNextAdd - 1].changes[0].changes) {
                            this.graph.editor.undoManager.history[this.graph.editor.undoManager.indexOfNextAdd - 1].changes[0].changes = [...this.graph.editor.undoManager.history[this.graph.editor.undoManager.indexOfNextAdd - 1].changes[0].changes, ...cs]
                          } else {
                            this.$set(this.graph.editor.undoManager.history[this.graph.editor.undoManager.indexOfNextAdd - 1].changes[0], 'changes', cs)
                          }
                        })
                      } else if (this.currentOperate === 'redo' || this.currentOperate === 'undo') {
                        this.$set(this.graph.dataByType[cell.isView ? 'view' : cell.isTable ? 'table' : cell.isComment ? 'comment' : 'table'][cell.OwneeRef].properties, 'deleted', true)
                        this.handleChanges(change.changes, this.currentOperate === 'undo')
                      }
                    }
                  } else { // 永久添加
                    if (!(cell.isView || cell.isTable || cell.isComment || cell.isFigure)) {
                      if (this.currentOperate === 'addEdge') { // 创建关系操作不走这里处理逻辑
                        return
                      } else if (this.currentOperate === 'redo' || this.currentOperate === 'undo') {
                        // this.$set(this.dataByType.relation[cell.OwneeRef].properties, 'deleted', false)
                        // this.$parent.$parent.$parent.$parent.$forceUpdate()
                        // this.pathIds = new Set()
                        // await this.redoUndoRealCreateRelation(cell)
                        // if (cell.type === 'Relational' && cell.relationalType === 'Identifying') {
                        //   let targetOwneeRef = cell.target ? cell.target.OwneeRef : cell.targetOwneeRef
                        //   let endIds = this.startIdToEndIds[targetOwneeRef]
                        //   await this.redoUndoDeepRealCreateRelation(targetOwneeRef, endIds)
                        // }
                        this.handleChanges(change.changes, this.currentOperate === 'undo')
                      }
                    } else {
                      // this.$set(this.dataByType.table[cell.OwneeRef].properties, 'deleted', false)
                      // this.$parent.$parent.$parent.$parent.$forceUpdate()
                      if (this.currentOperate === 'insertTable') {
                        return
                      } else if (this.currentOperate === 'redo' || this.currentOperate === 'undo') {
                        if (change.changes) {
                          this.handleChanges(change.changes, this.currentOperate === 'undo')
                        }
                      }
                      // this.graph.graph.getView().refresh()
                    }
                  }
                  this.$parent.$parent.$parent.$parent.$forceUpdate()
                } else { // 主题域操作
                  if (change.previous) { // 删除
                    if (!(cell.isView || cell.isTable || cell.isComment || cell.isFigure || cell.isSubType)) { // 主题域线删除
                      if (this.currentOperate === 'deleteEdge') {
                        let changes = []
                        this.deleteEdge.add(cell)
                        this.redoUndoThemeCancelRelation(cell)
                        let shape = this.dataByType.diagram[this.currentId].children.find(shape => !shape.properties.deleted && shape.properties.Id === cell.Id)
                        if (shape) {
                          this.$set(shape.properties, 'deleted', true)
                          // shape.properties.deleted = true
                        }
                        changes.push(new Changes('deleteConnection', {
                          id: cell.Id,
                          name: 'connection_' + cell.Id
                        }))
                        // setTimeout(() => {
                        //   this.$set(this.graph.editor.undoManager.history[this.graph.editor.undoManager.indexOfNextAdd - 1].changes[0], 'changes', changes)
                        // })
                        setTimeout(() => {
                          if (this.graph.editor.undoManager.history[this.graph.editor.undoManager.indexOfNextAdd - 1].changes[0].changes) {
                            this.graph.editor.undoManager.history[this.graph.editor.undoManager.indexOfNextAdd - 1].changes[0].changes = [...this.graph.editor.undoManager.history[this.graph.editor.undoManager.indexOfNextAdd - 1].changes[0].changes, ...changes]
                          } else {
                            this.$set(this.graph.editor.undoManager.history[this.graph.editor.undoManager.indexOfNextAdd - 1].changes[0], 'changes', changes)
                          }
                        })
                      } else if (this.currentOperate === 'deleteTable') { // 删除表引起的关系删除
                        let cs = []
                        this.deleteEdge.add(cell)
                        let shape = this.dataByType.diagram[this.currentId].children.find(shape => !shape.properties.deleted && shape.properties.Id === cell.Id)
                        if (shape) {
                          this.$set(shape.properties, 'deleted', true)
                          // shape.properties.deleted = true
                        }
                        cs.push(new Changes('deleteConnection', {
                          id: cell.Id,
                          name: 'connection_' + cell.Id
                        }))
                        setTimeout(() => {
                          if (this.graph.editor.undoManager.history[this.graph.editor.undoManager.indexOfNextAdd - 1].changes[0].changes) {
                            this.graph.editor.undoManager.history[this.graph.editor.undoManager.indexOfNextAdd - 1].changes[0].changes = [...this.graph.editor.undoManager.history[this.graph.editor.undoManager.indexOfNextAdd - 1].changes[0].changes, ...cs]
                          } else {
                            this.$set(this.graph.editor.undoManager.history[this.graph.editor.undoManager.indexOfNextAdd - 1].changes[0], 'changes', cs)
                          }
                        })
                      } else if (this.currentOperate === 'redo' || this.currentOperate === 'undo') {
                        this.deleteEdge.add(cell)
                        this.handleChanges(change.changes, this.currentOperate === 'undo')
                      }
                    } else { // 主题域shape删除
                      if (this.currentOperate === 'deleteTable' || this.currentOperate === 'deleteEdge') { // this.currentOperate 等于 'deleteEdge'表明删除线的同时删除了表
                        let cs = []
                        let shape = this.dataByType.diagram[this.currentId].children.find(shape => !shape.properties.deleted && shape.properties.Id === cell.Id)
                        if (shape) {
                          this.$set(shape.properties, 'deleted', true)
                        }
                        // cs.push(new Changes('deleteShape', {
                        //   id: cell.Id,
                        //   name: cell.isFigure ? 'Figure_' + cell.Id : this.graph.dataByType[cell.isView ? 'view' : cell.isTable ? 'table' : cell.isComment ? 'comment' : 'table'][cell.OwneeRef].properties.Name
                        // }))
                        if (cell.isSubType) {
                          let table = this.dataByType.table[cell.ParentTableId]
                          let subtype = table.children?.find(column => column.properties.Id === cell.SubTypeRef && !column.properties.deleted)
                          cs.push(new Changes('deleteShape', {
                            id: cell.Id,
                            name: subtype.properties.Name
                          }))
                        } else {
                          cs.push(new Changes('deleteShape', {
                            id: cell.Id,
                            name: cell.isFigure ? 'Figure_' + cell.Id : this.graph.dataByType[cell.isView ? 'view' : cell.isTable ? 'table' : cell.isComment ? 'comment' : 'table'][cell.OwneeRef].properties.Name
                          }))
                        }
                        // setTimeout(() => {
                        //   this.$set(this.graph.editor.undoManager.history[this.graph.editor.undoManager.indexOfNextAdd - 1].changes[0], 'changes', cs)
                        // })
                        setTimeout(() => {
                          if (this.graph.editor.undoManager.history[this.graph.editor.undoManager.indexOfNextAdd - 1].changes[0].changes) {
                            this.graph.editor.undoManager.history[this.graph.editor.undoManager.indexOfNextAdd - 1].changes[0].changes = [...this.graph.editor.undoManager.history[this.graph.editor.undoManager.indexOfNextAdd - 1].changes[0].changes, ...cs]
                          } else {
                            this.$set(this.graph.editor.undoManager.history[this.graph.editor.undoManager.indexOfNextAdd - 1].changes[0], 'changes', cs)
                          }
                        })
                      } else if (this.currentOperate === 'redo' || this.currentOperate === 'undo') {
                        this.handleChanges(change.changes, this.currentOperate === 'undo') // 前进回退导致的插入删除，则执行相关前进回退操作（handleChanges）来修改数据
                      }
                    }
                  } else { // 添加
                    if (!(cell.isView || cell.isTable || cell.isComment || cell.isFigure)) { // 主题域线添加
                      if (this.currentOperate === 'addEdge') { // 创建关系操作不走这里处理逻辑
                        return
                      } else if (this.currentOperate === 'redo' || this.currentOperate === 'undo') {
                        this.handleChanges(change.changes, this.currentOperate === 'undo')
                      }
                      // this.redoUndoThemeCreateRelation(cell)
                    } else { // 主题shape添加
                      if (this.currentOperate === 'insertShape') {
                        return
                      } else if (this.currentOperate === 'redo' || this.currentOperate === 'undo') {
                        if (change.changes) {
                          this.handleChanges(change.changes, this.currentOperate === 'undo')
                        }
                      }
                    }
                  }
                }
              }
            }
            this.realDelete = false
            this.currentOperate = ''
            this.retainSubTypeAndTopRelation = false
          }
        })
        graph.addListener(mxEvent.CLICK, async (sender, evt) => {
          let cell = evt.getProperty('cell')
          let event = evt.properties.event
          let currentTarget = event.target
          let isCol = false
          let isTree = false
          // 是否鼠标左键触发
          let isLeftButton = evt.properties.event.button === 0
          if (currentTarget.className.indexOf) {
            isCol = currentTarget.className.indexOf && currentTarget.className.indexOf('svg-col') > -1
            isTree = isLeftButton && currentTarget.className.indexOf && currentTarget.className.indexOf('tree') > -1
          }
          // no-sql字段嵌套子字段展示与隐藏以及相关逻辑
          if (isTree || (isLeftButton && currentTarget.parentNode && currentTarget.parentNode.className && currentTarget.parentNode.className.indexOf && currentTarget.parentNode.className.indexOf('tree') > -1)) {
            let currentTree = currentTarget.classList.contains('tree') ? currentTarget : currentTarget.parentNode
            let currentColId = parseInt(currentTree.getAttribute('data-id'))
            let cell = evt.properties.cell
            let container = document.querySelector(`.svg-table[data-id='${evt.properties.cell.Id}']`)
            let treeContainer = container && container.querySelector('.tree-container')
            let preWidth = container && container.offsetWidth
            let preHeight = container && container.clientHeight
            // 隐藏显示功能
            this.dataByType.table[cell.OwneeRef].children.some(v => {
              // todo修改了表的字段需要回撤处理
              if (v.properties.Id === currentColId) {
                v.properties.IsExpanded = !v.properties.IsExpanded
              }
            })
            let treeBox = currentTree.nextElementSibling
            if (treeBox && treeBox.classList.contains('er-tree-box')) {
              treeBox.classList.toggle('active')
              currentTree.classList.toggle('expand')
            }
            // 根据树的大小，动态改变表样式大小
            // let height = treeContainer && treeContainer.clientHeight + 50
            // let width = treeContainer && treeContainer.offsetWidth + 20
            // let shape = this.dataByType.diagram[this.currentId].children.find(item => item.properties.Id === cell.Id)
            // shape.properties.ShapeSize.height = height
            // shape.properties.ShapeSize.width = width
            // shape.properties.changed = true
            // cell.geometry.height = height
            // cell.geometry.width = width
            // cell.changed = true
            // let tableOrView = this.dataByType[cell.isView ? 'view' : cell.isTable ? 'table' : cell.isComment ? 'comment' : 'table'][cell.OwneeRef]
            // if (tableOrView && tableOrView.posit) {
            //   const posit = tableOrView.posit
            //   posit.ShapeSize.width = width
            //   posit.ShapeSize.height = height
            // }
            // cell.value = await this.getTableHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
            // cell.value = cell.value.replace(/height:\S+px;width:\S+px/, `height:${height}px;width:${width}px`)
            // this.graph.editor.undoManager.undoableEditHappened(new LayerEdit([new Changes('modifySize', {
            //   id: cell.OwneeRef,
            //   name: tableOrView.properties.Name,
            //   width,
            //   height,
            //   preWidth,
            //   preHeight
            // })]))
            // graph.refresh(cell)
            // graph.getView().refresh()
            this.hasEdit = true
          }
          // 点击字段加上背景色
          if (isCol || (currentTarget.parentNode && currentTarget.parentNode.className && currentTarget.parentNode.className.indexOf && currentTarget.parentNode.className.indexOf('svg-col') > -1)) {
            // 拖拽时禁用
            let col = isCol ? currentTarget : currentTarget.parentNode
            if (event.ctrlKey) {
              if (this.colList.length) {
                if (+col.dataset.pid === this.colList[0].pId) {
                  col.classList.add('active')
                  this.colList.push({ pId: +col.dataset.pid, colId: +col.dataset.id })
                } else {
                  document.querySelectorAll('.svg-col').forEach(v => v.classList.remove('active'))
                  this.colList = []
                }
              } else {

              }
            } else {
              document.querySelectorAll('.svg-col').forEach(v => v.classList.remove('active'))
              col.classList.add('active')
              this.colList = [{ pId: +col.dataset.pid, colId: +col.dataset.id }]
            }
          } else {
            document.querySelectorAll('.svg-col').forEach(v => v.classList.remove('active'))
            this.colList = []
          }
          if (this.preSelectCell && (!cell || this.preSelectCell !== cell) && this.preSelectCell.source && this.preSelectCell.target) { // 清空上一次选中边时table的column展示的背景色
            const relationData = this.dataByType.relation[this.preSelectCell.OwneeRef] // 因为有subtype，从relation读取数据是靠谱的
            const parentTableData = this.dataByType[this.preSelectCell.source.isView ? 'view' : 'table'][relationData.properties.ParentEntityRef]
            const childTableData = this.dataByType[this.preSelectCell.target.isView ? 'view' : 'table'][relationData.properties.ChildEntityRef]
            // let parentTableSize = _.cloneDeep(this.preSelectCell.source.geometry)
            // let childTableSize = _.cloneDeep(this.preSelectCell.target.geometry)
            for (let column of (parentTableData?.children || [])) {
              this.$set(column.properties, 'showParent', false)
              this.$set(column.properties, 'showChild', false)
              if (this.preSelectCell.source.isSubType) {
                let children = this.graph.graph.getDefaultParent().children
                let cell = children.find(cell => cell.OwneeRef === parentTableData.properties.Id)
                cell.value = await processAddTable(parentTableData.properties.Id, graph, null, null, true)
              } else {
                if (this.preSelectCell.source.isView) {
                  this.preSelectCell.source.value = await processAddView(parentTableData.properties.Id, graph, null, null, true)
                } else {
                  this.preSelectCell.source.value = await processAddTable(parentTableData.properties.Id, graph, null, null, true)
                }
              }
              // this.preSelectCell.source.value = this.preSelectCell.source.value.replace(/height:\S+px;width:\S+px/, `height:${parentTableSize.height}px;width:${parentTableSize.width}px`)
            }
            for (let column of (childTableData?.children || [])) {
              this.$set(column.properties, 'showParent', false)
              this.$set(column.properties, 'showChild', false)
              if (this.preSelectCell.target.isView) {
                this.preSelectCell.target.value = await processAddView(childTableData.properties.Id, graph, null, null, true)
              } else {
                this.preSelectCell.target.value = await processAddTable(childTableData.properties.Id, graph, null, null, true)
              }
              // this.preSelectCell.target.value = this.preSelectCell.target.value.replace(/height:\S+px;width:\S+px/, `height:${childTableSize.height}px;width:${childTableSize.width}px`)
            }
            // this.preSelectCell.source.geometry.height = height
            this.graph.graph.getView().refresh()
            this.preSelectCell = null
          }
          if (cell && cell.edge) { // 为关系对应的索引加上背景色
            if (cell.OwneeRef === -1 || !cell.OwneeRef) {
              return
            }
            const relationData = this.dataByType.relation[cell.OwneeRef] // 因为有subtype，从relation读取数据是靠谱的
            const parentTableData = this.dataByType[cell.source.isView ? 'view' : 'table'][relationData.properties.ParentEntityRef]
            const childTableData = this.dataByType[cell.target.isView ? 'view' : 'table'][relationData.properties.ChildEntityRef]
            // let parentTableSize = _.cloneDeep(cell.source.geometry)
            // let childTableSize = _.cloneDeep(cell.target.geometry)
            let parentKeyRef = relationData.properties.ParentKeyRef
            if (parentKeyRef || parentKeyRef === 0) {
              if (parentTableData) {
                let entityKeyGroup = parentTableData.children.find((column) => column.objectClass === 'Datablau.LDM.EntityKeyGroup' && column.properties.Id === parentKeyRef)
                if (entityKeyGroup && entityKeyGroup.children) {
                  let columnIds = entityKeyGroup.children.filter(k => !k.properties.deleted).map(k => {
                    return k.properties.AttributeRef
                  })
                  parentTableData.children.forEach(column => {
                    if (columnIds && columnIds.includes(column.properties.Id)) {
                      this.$set(column.properties, 'showParent', true)
                    }
                  })
                  if (cell.source.isSubType) {
                    let children = this.graph.graph.getDefaultParent().children
                    let cell = children.find(cell => cell.OwneeRef === parentTableData.properties.Id)
                    cell.value = await processAddTable(parentTableData.properties.Id, graph, null, null, true)
                  } else {
                    if (cell.source.isView) {
                      cell.source.value = await processAddView(parentTableData.properties.Id, graph, null, null, true)
                    } else {
                      cell.source.value = await processAddTable(parentTableData.properties.Id, graph, null, null, true)
                    }
                  }
                  // cell.source.value = cell.source.value.replace(/height:\S+px;width:\S+px/, `height:${parentTableSize.height}px;width:${parentTableSize.width}px`)
                }
              }
            }
            let childKeyRef = relationData.properties.ChildKeyRef
            if (childKeyRef || childKeyRef === 0) {
              if (childTableData) {
                let childEntityKeyGroup = childTableData.children.find((column) => column.objectClass === 'Datablau.LDM.EntityKeyGroup' && column.properties.Id === childKeyRef)
                if (childEntityKeyGroup && childEntityKeyGroup.children) {
                  let columnIds = childEntityKeyGroup.children.filter(k => !k.properties.deleted).map(k => {
                    return k.properties.AttributeRef
                  })
                  childTableData.children.forEach(column => {
                    if (columnIds && columnIds.includes(column.properties.Id)) {
                      this.$set(column.properties, 'showChild', true)
                    }
                  })
                  if (cell.target.isView) {
                    cell.target.value = await processAddView(childTableData.properties.Id, graph, null, null, true)
                  } else {
                    cell.target.value = await processAddTable(childTableData.properties.Id, graph, null, null, true)
                  }
                  // cell.target.value = cell.target.value.replace(/height:\S+px;width:\S+px/, `height:${childTableSize.height}px;width:${childTableSize.width}px`)
                }
              }
            }
            this.graph.graph.getView().refresh()
            this.preSelectCell = cell
            console.log(this.preSelectCell)
          }
          // this.showLogicalNameOrPhysicalName()
        })
        if (this.editorType === 'model' && !this.disabledEdit) {
          this.graph.graph.popupMenuHandler.factoryMethod = (menu, cell, evt) => {
            if (cell != null) {
              // menu.addItem('Delete当前主题', self.deleteImg, (sender) => {
              //   this.operateType = 'delete'
              //   cell.deleteReal = false
              //   if (!cell.edge) {
              //     // 找到shape的直接id删除
              //     this.deleteGraph.push(cell)
              //     // delete this.graph.shapes[cell.OwneeRef]
              //     // delete this.graph.dataByType.table[cell.OwneeRef].posit.Id
              //   } else {
              //     this.deleteEdge.push(cell)
              //   }
              //
              //   editor.execute('delete', cell)
              // })
              // menu.addItem('Delete永久删除', self.deleteImg, (sender) => {
              //   this.operateType = 'deleteReal'
              //   cell.deleteReal = true
              //   if (!cell.edge) {
              //     this.deleteGraph.push(cell)
              //   } else {
              //     this.deleteEdge.push(cell)
              //     if (cell.rowType === 'Relational') {
              //       this.$confirm(`选中的关系将被删除，外键的列是否需要删除？`, '提示', {
              //         type: 'warning',
              //         confirmButtonText: '是',
              //         cancelButtonText: ' 否 ',
              //         showClose: false,
              //         closeOnClickModal: false
              //       }).then(() => {
              //         console.log(cell)
              //         // 删除target表的主键，外键以及相应的列
              //       })
              //     }
              //   }
              //
              //   editor.execute('delete', cell)
              // })
              let target = evt.target
              let targetClassName = target.className !== '' ? target.className : target.parentNode.className
              let isCol = targetClassName.indexOf && targetClassName.indexOf('svg-col') > -1
              if (target.className !== '') {
                targetClassName = target.className
              } else {
                target = target.parentNode
                targetClassName = target.className
              }
              let isTree = target.classList.contains('tree') || target.parentNode.classList.contains('tree')
              if ((cell.isFigure && !cell.isPolygon) || cell.isBusiness) {
                menu.addItem('当前层级' + cell.OrderNumber)
                menu.addSeparator()
              }
              if (!cell.isPolygon) {
                menu.addItem('编辑', cell.isFigure ? self.edit2 : self.editImg, () => {
                  this.editLayer(cell)
                })
              }
              if (isTree) {
                menu.addItem('添加子' + this.attributeName, self.addCol, async () => {
                  let currentTable = this.dataByType.table[cell.OwneeRef]
                  let cols = []
                  let container = document.querySelector(`.svg-table[data-id='${cell.Id}']`)
                  let treeContainer = container && container.querySelector('.tree-container')
                  let preWidth = container && container.offsetWidth
                  let preHeight = container && container.clientHeight
                  let currentTree = target.classList.contains('tree') ? target : target.parentNode
                  let treeBox = currentTree.nextElementSibling
                  let currentColId = parseInt(currentTree.getAttribute('data-id'))
                  cols = currentTable.children.filter(v => v.objectClass === 'Datablau.LDM.CollectionNode')
                  let newCol = this.getNewTreeCol(this.getMaxId(cols), currentColId)
                  if (currentTable.children) {
                    currentTable.children.push(newCol)
                  } else {
                    currentTable.children = [newCol]
                  }
                  currentTable.properties.changed = true
                  this.graph.editor.undoManager.undoableEditHappened(new LayerEdit([new Changes('insertColumn', {
                    pId: cell.OwneeRef,
                    pName: currentTable.properties.Name,
                    id: newCol.properties.Id,
                    name: newCol.properties.Name,
                    now: newCol
                  })]))
                  // er图上需要展开当前树
                  currentTable.children.some(v => {
                    // todo修改了表的字段需要回撤处理
                    if (v.properties && v.properties.Id === currentColId) {
                      v.properties.IsExpanded = true
                    }
                  })
                  if (treeBox && treeBox.classList.contains('er-tree-box')) {
                    treeBox.classList.add('active')
                    currentTree.classList.add('expand')
                  }
                  // 根据树的大小，动态改变表样式大小
                  let height = treeContainer && treeContainer.clientHeight + 50
                  let width = treeContainer && treeContainer.offsetWidth + 20
                  let shape = this.dataByType.diagram[this.currentId].children.find(item => item.properties.Id === cell.Id)
                  shape.properties.ShapeSize.height = height
                  shape.properties.ShapeSize.width = width
                  shape.properties.changed = true
                  cell.geometry.height = height
                  cell.geometry.width = width
                  cell.changed = true
                  let tableOrView = this.dataByType[cell.isView ? 'view' : cell.isTable ? 'table' : cell.isComment ? 'comment' : 'table'][cell.OwneeRef]
                  if (tableOrView && tableOrView.posit) {
                    const posit = tableOrView.posit
                    posit.ShapeSize.width = width
                    posit.ShapeSize.height = height
                  }
                  cell.value = await this.getTableHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
                  cell.value = cell.value.replace(/height:\S+px;width:\S+px/, `height:${height}px;width:${width}px`)
                  this.graph.editor.undoManager.undoableEditHappened(new LayerEdit([new Changes('modifySize', {
                    id: cell.OwneeRef,
                    name: tableOrView.properties.Name,
                    width,
                    height,
                    preWidth,
                    preHeight
                  })]))
                  graph.refresh(cell)
                  graph.getView().refresh()
                })
              }
              if (isCol) {
                menu.addItem('编辑当前' + self.attributeName, self.editcol, () => {
                  if (cell.isView) {
                    let colId = parseInt(target.getAttribute('data-id'))
                    this.afterHandleColDialogData(cell.OwneeRef, colId, cell.isView)
                  } else if (cell.isTable) {
                    let colId = parseInt(target.getAttribute('data-id'))
                    this.afterHandleColDialogData(cell.OwneeRef, colId, cell.isView)
                  }
                })
              }
              // menu.addItem('样式', self.editImg, () => {
              //   this.editStyleDialg = true
              //   if (this.dataByType.diagram[this.currentId].children) {
              //     this.edgeDialogData = cell
              //     this.currentStyleRelatedShapeTemplate = this.formatThemeTemplateData(_.cloneDeep(this.dataByType.diagram[this.currentId].children.find(shape => shape.properties.Id === cell.Id)).properties)
              //   }
              // })
              if (cell.isBusiness && currentModel.TypeUniqueId !== '721ac3dc-dabe-4be2-ae47-cbd6b0a14d80') {
                menu.addItem('绑定框内实体', self.businessUsedImg, () => {
                  let { x, y, width, height } = cell.geometry
                  let isInArea = (x1, y1, x2, y2, width2, height2) => {
                    if (x1 > x2 && x1 < x2 + width2 && y1 > y2 && y1 < y2 + height2) {
                      return true
                    } else {
                      return false
                    }
                  }

                  let CommonMemberRefs = this.dataByType.diagram[this.currentId].children.filter(item => !item.properties.deleted && item.objectClass === 'Datablau.ERD.ShapeEntity').filter(shape => {
                    let x1 = shape.properties.Location.x
                    let y1 = shape.properties.Location.y
                    let width1 = shape.properties.ShapeSize.width
                    let height1 = shape.properties.ShapeSize.height
                    if (isInArea(x1, y1, x, y, width, height) && isInArea(x1 + width1, y1 + height1, x, y, width, height)) {
                      return true
                    } else {
                      return false
                    }
                  }).map(shape => shape.properties.OwneeRef)
                  if (CommonMemberRefs.length) {
                    let tableData = this.dataByType.table[cell.OwneeRef]
                    let change = new (this.Changes)('modifyTableProperties', {
                      id: cell.OwneeRef,
                      name: tableData.properties.Name,
                      pre: _.cloneDeep(tableData.properties),
                      now: null
                    })
                    if (tableData.properties.CommonMemberRefs) {
                      let arr = tableData.properties.CommonMemberRefs.split(',').map(i => parseInt(i))
                      tableData.properties.CommonMemberRefs = Array.from(new Set([...arr, ...CommonMemberRefs])).join(',')
                    } else {
                      tableData.properties.CommonMemberRefs = CommonMemberRefs.join(',')
                    }
                    change.obj.now = _.cloneDeep(tableData.properties)
                    this.graph.editor.undoManager.undoableEditHappened(new LayerEdit([change]))
                  }
                })
              }
              if ((cell.isTable && !cell.isBusiness) || cell.isView) {
                menu.addItem('适配大小', self.auto, () => {
                  this.handleResize(true, true)
                })
              }
              // menu.addSeparator()
              if ((cell.isFigure && !cell.isPolygon) || cell.isBusiness) {
                // menu.addItem('当前层级' + cell.OrderNumber, self.editImg)
                let diagrams = this.dataByType.diagram[this.currentId].children
                let shape = diagrams.find(shape => !shape.properties.deleted && shape.properties.Id === cell.Id)
                let children = this.graph.graph.getDefaultParent().children
                if (shape && shape.properties.CompostedShapesRef) {
                  menu.addItem('取消组合', self.up, () => {
                    let change = new (this.Changes)('cancelConstituteFigure', {
                      id: cell.Id,
                      name: shape.properties.Name,
                      pre: shape.properties.CompostedShapesRef,
                      now: null
                    })
                    shape.properties.CompostedShapesRef = ''
                    change.obj.now = shape.properties.CompostedShapesRef
                    this.graph.editor.undoManager.undoableEditHappened(new LayerEdit([change]))
                    cell.changed = true
                    shape.properties.changed = true
                  })
                } else {
                  menu.addItem('组合', self.up, () => {
                    let { x, y, width, height } = cell.geometry
                    let isInArea = (x1, y1, x2, y2, width2, height2) => {
                      if (x1 > x2 && x1 < x2 + width2 && y1 > y2 && y1 < y2 + height2) {
                        return true
                      } else {
                        return false
                      }
                    }

                    let CommonMemberRefs = this.graph.graph.getDefaultParent().children.filter(cell => !cell.deleted && !cell.edge).filter(cell => {
                      let x1 = cell.geometry.x
                      let y1 = cell.geometry.y
                      let width1 = cell.geometry.width
                      let height1 = cell.geometry.height
                      if (isInArea(x1, y1, x, y, width, height) && isInArea(x1 + width1, y1 + height1, x, y, width, height)) {
                        return true
                      } else {
                        return false
                      }
                    }).map(cell => cell.Id)
                    if (CommonMemberRefs.length) {
                      let change = new (this.Changes)('constituteFigure', {
                        id: cell.Id,
                        name: shape.properties.Name,
                        pre: shape.properties.CompostedShapesRef,
                        now: null
                      })
                      if (shape.properties.CompostedShapesRef) {
                        let arr = shape.properties.CompostedShapesRef.split(',').map(i => parseInt(i))
                        shape.properties.CompostedShapesRef = Array.from(new Set([...arr, ...CommonMemberRefs])).join(',')
                      } else {
                        shape.properties.CompostedShapesRef = CommonMemberRefs.join(',')
                      }
                      change.obj.now = shape.properties.CompostedShapesRef
                      this.graph.editor.undoManager.undoableEditHappened(new LayerEdit([change]))
                      shape.properties.changed = true
                      cell.changed = true
                    }
                  })
                }
                menu.addItem('前置', self.up, () => {
                  cell.OrderNumber++
                  cell.changed = true
                  let shape = this.dataByType.diagram[this.currentId].children.find(shape => shape.properties.Id === cell.Id)
                  shape.properties.OrderNumber++
                  shape.properties.changed = true
                  let children = this.graph.graph.getDefaultParent().children
                  let figureList = children.filter(cell => cell.isFigure || cell.isBusiness)
                  figureList = figureList.sort((a, b) => (a.OrderNumber - b.OrderNumber || a.Id - b.Id))
                  children.splice(0, figureList.length, ...figureList)
                  this.graph.graph.getView().refresh()
                  let changes = new LayerEdit([new Changes('modifyFigureLayer', {
                    id: shape.properties.Id,
                    name: shape.properties.Name,
                    pre: cell.OrderNumber - 1,
                    now: cell.OrderNumber
                  })])
                  this.graph.editor.undoManager.undoableEditHappened(changes)
                })
                menu.addItem('后置', self.down, () => {
                  cell.OrderNumber--
                  cell.changed = true
                  let shape = this.dataByType.diagram[this.currentId].children.find(shape => !shape.properties.deleted && shape.properties.Id === cell.Id)
                  shape.properties.OrderNumber--
                  shape.properties.changed = true
                  let children = this.graph.graph.getDefaultParent().children
                  let figureList = children.filter(cell => cell.isFigure || cell.isBusiness)
                  figureList = figureList.sort((a, b) => (a.OrderNumber - b.OrderNumber || a.Id - b.Id))
                  children.splice(0, figureList.length, ...figureList)
                  this.graph.graph.getView().refresh()
                  let changes = new LayerEdit([new Changes('modifyFigureLayer', {
                    id: shape.properties.Id,
                    name: shape.properties.Name,
                    pre: cell.OrderNumber + 1,
                    now: cell.OrderNumber
                  })])
                  this.graph.editor.undoManager.undoableEditHappened(changes)
                })
              }
              if (!isCol) {
                menu.addItem('删除', self.deleteImg, (sender) => {
                  // if (cell.type === 'Subtype') {
                  //   this.$datablauMessage.warning('Subtype关系暂不支持在web端编辑，请前往客户端')
                  //   return
                  // }
                  let cells = this.graph.graph.getSelectionCells()
                  // if (cells.some(cell => cell.type === 'Subtype')) {
                  //   this.$datablauMessage.warning('包含Subtype关系暂不支持在web端编辑，请前往客户端')
                  //   this.loading.status = false
                  //   return
                  // }
                  if (cells.length === 1 && cells[0].isFigure) {
                    this.$DatablauCofirm('确定要删除图框？', {
                      confirmButtonText: '确定',
                      cancelButtonText: '取消',
                      type: 'warning'
                    }).then(() => {
                      this.deletedCell = cell
                      this.deleteInThemeConfirm()
                    }).catch(() => {

                    })
                  } else {
                    this.secondConfirm = true
                    this.deletedCell = cell
                  }
                })
              }
            }
            // menu.addItem('Undo', self.undoImg, () => {
            //   this.operateType = 'undo'
            //   editor.execute('undo', cell)
            // })
            //
            // menu.addItem('Redo', self.redoImg, () => {
            //   this.operateType = 'redo'
            //   editor.execute('redo', cell)
            // })
          }
        }
        // $(document).on('click', '.relationButton', () => {
        //   this.currentEdgeType = 'RelationalIdentifying'
        //   document.getElementsByClassName('svg-table').forEach(dom => {
        //     mxEvent.addListener(dom, 'click', emitEdge)
        //     graph.setCellsMovable(false)
        //   })
        // })
        // $(document).on('click', '.relationButton1', () => {
        //   this.currentEdgeType = 'RelationalNonIdentifying'
        //   document.getElementsByClassName('svg-table').forEach(dom => {
        //     mxEvent.addListener(dom, 'click', emitEdge)
        //     graph.setCellsMovable(false)
        //   })
        // })
        // $(document).on('click', '.relationButton2', () => {
        //   this.currentEdgeType = 'RelationalManyToMany'
        //   document.getElementsByClassName('svg-table').forEach(dom => {
        //     mxEvent.addListener(dom, 'click', emitEdge)
        //     graph.setCellsMovable(false)
        //   })
        // })
        // $(document).on('click', '.relationButton3', () => {
        //   this.currentEdgeType = 'RelationalVirtual'
        //   document.getElementsByClassName('svg-table').forEach(dom => {
        //     mxEvent.addListener(dom, 'click', emitEdge)
        //     graph.setCellsMovable(false)
        //   })
        //   document.getElementsByClassName('svg-view').forEach(dom => {
        //     mxEvent.addListener(dom, 'click', emitEdge)
        //     graph.setCellsMovable(false)
        //   })
        //   document.getElementsByClassName('svg-comment').forEach(dom => {
        //     mxEvent.addListener(dom, 'click', emitEdge)
        //     graph.setCellsMovable(false)
        //   })
        //   document.getElementsByClassName('svg-figure').forEach(dom => {
        //     mxEvent.addListener(dom, 'click', emitEdge)
        //     graph.setCellsMovable(false)
        //   })
        // })
        // $(document).on('click', '.relationButton4', () => {
        //   this.currentEdgeType = 'RelationalView'
        //   document.getElementsByClassName('svg-table').forEach(dom => {
        //     mxEvent.addListener(dom, 'click', emitEdge)
        //     graph.setCellsMovable(false)
        //   })
        // })
        // $('#relationButton5').on('click', () => {
        //   this.currentEdgeType = 'RelationalSubType'
        //   document.getElementsByClassName('svg-table').forEach(dom => {
        //     mxEvent.addListener(dom, 'click', emitEdge)
        //     graph.setCellsMovable(false)
        //   })
        // })
        $('#redoButton').on('click', () => {
          this.currentOperate = 'redo'
          editor.execute('redo')
        })
        $('#undoButton').on('click', (e) => {
          this.currentOperate = 'undo'
          editor.execute('undo')
        })
        window.graph = this.graph
        mxConnectionHandler.prototype.waypointsEnabled = true
        let icon = new MxImage('./images/connector.gif', 0, 0)
        mxConnectionHandler.prototype.connectImage = icon
        this.graph.graph.addEdge = function (edge, parent, source, target, index) {
          Array.from(document.getElementsByClassName('svg-table')).forEach(dom => {
            mxEvent.removeListener(dom, 'click', self.emitEdge)
          })
          Array.from(document.getElementsByClassName('subtype-shape')).forEach(dom => {
            mxEvent.removeListener(dom, 'click', self.emitEdge)
          })
          Array.from(document.getElementsByClassName('svg-view')).forEach(dom => {
            mxEvent.removeListener(dom, 'click', self.emitEdge)
          })
          if (self.currentEdgeType === 'RelationalVirtual') {
            // Array.from(document.getElementsByClassName('svg-view')).forEach(dom => {
            //   mxEvent.removeListener(dom, 'click', self.emitEdge)
            // })
            Array.from(document.getElementsByClassName('svg-comment')).forEach(dom => {
              mxEvent.removeListener(dom, 'click', self.emitEdge)
            })
            Array.from(document.getElementsByClassName('svg-figure')).forEach(dom => {
              mxEvent.removeListener(dom, 'click', self.emitEdge)
            })
          }
          if (self.currentEdgeType === 'RelationalVirtual' && (target.isSubType || source.isSubType)) {
            self.$blauShowFailure('不能创建此关系类型')
            self.removeRelationConnect()
          } else if (self.currentEdgeType === 'RelationalView' && (!target.isView || (!source.isTable && !source.isView))) {
            self.$blauShowFailure('不能创建此关系类型')
            self.removeRelationConnect()
          } else if (self.currentEdgeType === 'RelationalSubType' && (!target.isTable || !source.isTable)) {
            self.$blauShowFailure('不能创建此关系类型')
            self.removeRelationConnect()
          } else if ((self.currentEdgeType === 'RelationalIdentifying' || self.currentEdgeType === 'RelationalNonIdentifying' || self.currentEdgeType === 'RelationalManyToMany') && (!target.isTable || !source.isTable)) {
            self.$blauShowFailure('不能创建此关系类型')
            self.removeRelationConnect()
          } else {
            return mxGraph.prototype.addEdge.apply(this, arguments)
          }
        }
        mxConnectionHandler.prototype.insertEdge = async (parent, id, value, source, target, style) => {
          let sourceTable = this.dataByType.table[source.OwneeRef]
          const targetTable = this.dataByType.table[target.OwneeRef]
          if (this.currentEdgeType === 'RelationalSubtype' && !sourceTable) { // 半圆到表Subtype关系
            sourceTable = this.dataByType.table[source.ParentTableId]
          }
          if ((this.currentEdgeType === 'RelationalIdentifying' || this.currentEdgeType === 'RelationalNonIdentifying' || this.currentEdgeType === 'RelationalManyToMany') && !targetTable) {
            this.$blauShowFailure('不能创建此关系类型')
            this.removeRelationConnect()
            return
          }
          let changes = []
          try {
            if (this.currentEdgeType === 'RelationalVirtual') { // 虚拟关系
              await this.createRelation(source, target, this.currentEdgeType, changes)
            } else if (this.currentEdgeType === 'RelationalIdentifying') { // 主键关系
              this.pathIds = new Set()
              if (this.isCircle(sourceTable, targetTable)) {
                await this.$DatablauCofirm(`创建当前一对一的关系会引起非法的环状数据关联，是否转换成一对多的关系？`, '提示', {
                  type: 'warning',
                  confirmButtonText: '是',
                  cancelButtonText: ' 否 ',
                  showClose: false,
                  closeOnClickModal: true
                })
                this.currentEdgeType = 'RelationalNonIdentifying'
                await this.createRelation(source, target, this.currentEdgeType, changes)
                return
              }
              let targetTablePre = _.cloneDeep(targetTable)
              await this.createRelation(source, target, this.currentEdgeType, changes)
              let primaryKeyPre = targetTablePre.children.find(column => !column.properties.deleted && (column.objectClass === 'Datablau.LDM.EntityKeyGroup' && column.properties.KeyGroupType === 'PrimaryKey'))
              let primaryKey = targetTable.children.find(column => !column.properties.deleted && (column.objectClass === 'Datablau.LDM.EntityKeyGroup' && column.properties.KeyGroupType === 'PrimaryKey'))
              if (JSON.stringify(primaryKeyPre?.children?.map(m => m.properties.Id)) !== JSON.stringify(primaryKey?.children?.map(m => m.properties.Id))) { // target表主键索引发生改变传递
                // 算出两次primayKey,差异的增量所对应的字段id,下次传递只需修改这些字段就可以了
                let columnIds = primaryKey?.children?.filter(member => !primaryKeyPre?.children?.find(m => m.properties.Id === member.properties.Id)).map(member => member.properties.AttributeRef)
                let endIds = this.startIdToEndIds[target.OwneeRef]
                await this.createDeepRelation(endIds, target, changes, targetTablePre, true, columnIds)
              }
            } else if (this.currentEdgeType === 'RelationalSubtype') { // 主键关系
              if (!targetTable) { //
                this.$datablauMessage.error('不能创建此关系类型')
                this.currentEdgeType = null
                return
              }
              this.pathIds = new Set()
              if (this.isCircle(sourceTable, targetTable)) {
                this.$datablauMessage.error('创建当前subtype关系会引起非法的环状数据关联！')
                this.currentEdgeType = null
                return
              }
              let targetTablePre = _.cloneDeep(targetTable)
              await this.createRelation(source, target, this.currentEdgeType, changes)
              let primaryKeyPre = targetTablePre.children.find(column => !column.properties.deleted && (column.objectClass === 'Datablau.LDM.EntityKeyGroup' && column.properties.KeyGroupType === 'PrimaryKey'))
              let primaryKey = targetTable.children.find(column => !column.properties.deleted && (column.objectClass === 'Datablau.LDM.EntityKeyGroup' && column.properties.KeyGroupType === 'PrimaryKey'))
              if (JSON.stringify(primaryKeyPre?.children?.map(m => m.properties.Id)) !== JSON.stringify(primaryKey?.children?.map(m => m.properties.Id))) { // target表主键索引发生改变传递
                // 算出两次primayKey,差异的增量所对应的字段id
                let columnIds = primaryKey?.children?.filter(member => !primaryKeyPre?.children?.find(m => m.properties.Id === member.properties.Id)).map(member => member.properties.AttributeRef)
                let endIds = this.startIdToEndIds[target.OwneeRef]
                await this.createDeepRelation(endIds, target, changes, targetTablePre, true, columnIds)
              }
            } else if (this.currentEdgeType === 'RelationalNonIdentifying') {
              await this.createRelation(source, target, this.currentEdgeType, changes)
            } else if (this.currentEdgeType === 'RelationalManyToMany') {
              await this.createRelation(source, target, this.currentEdgeType, changes)
            } else if (this.currentEdgeType === 'RelationalView') {
              await this.createRelation(source, target, this.currentEdgeType, changes)
            }
            setTimeout(() => {
              this.$set(this.graph.editor.undoManager.history[this.graph.editor.undoManager.indexOfNextAdd - 1].changes[0], 'changes', changes)
            })
          } catch (err) {
            console.log(err)
          } finally {
            this.graph.graph.setCellsMovable(true)
            Array.from(document.getElementsByClassName('svg-table')).forEach(dom => {
              mxEvent.removeListener(dom, 'click', self.emitEdge)
            })
            Array.from(document.getElementsByClassName('subtype-shape')).forEach(dom => {
              mxEvent.removeListener(dom, 'click', self.emitEdge)
            })
            Array.from(document.getElementsByClassName('svg-view')).forEach(dom => {
              mxEvent.removeListener(dom, 'click', self.emitEdge)
            })
            if (self.currentEdgeType === 'RelationalVirtual') {
              // Array.from(document.getElementsByClassName('svg-view')).forEach(dom => {
              //   mxEvent.removeListener(dom, 'click', self.emitEdge)
              // })
              Array.from(document.getElementsByClassName('svg-comment')).forEach(dom => {
                mxEvent.removeListener(dom, 'click', self.emitEdge)
              })
              Array.from(document.getElementsByClassName('svg-figure')).forEach(dom => {
                mxEvent.removeListener(dom, 'click', self.emitEdge)
              })
            }
          }
          this.currentEdgeType = null
        }
        LayerEdit.prototype.undo = function () {
          self.handleChanges(this.changes, true)
        }
        LayerEdit.prototype.redo = function () {
          self.handleChanges(this.changes)
        }
        LayerEdit.prototype.isSignificant = () => {
          return false
        }
        LayerEdit.prototype.die = () => {

        }

        // this.graph.editor.undoManager.undoableEditHappened(new LayerEdit('edit'))
      })
    },
    emitEdge (evt) {
      window.mouseDown(evt)
    },
    saveModel () {
      if (!this.graph.editor.undoManager.indexOfNextAdd) {
        this.$message.warning('请修改后保存')
        return
      }
      this.checkInVersionDialogVisible = true
    },
    // 创建其他元素后，移除选择关系的效果
    clearRelationConnect () {
      if (this.currentEdgeType) {
        this.removeRelationConnect()
      }
    },
    removeRelationConnect () {
      this.currentEdgeType = null
      this.graph.graph.setCellsMovable(true)
      Array.from(document.getElementsByClassName('svg-table')).forEach(dom => {
        mxEvent.removeListener(dom, 'click', this.emitEdge)
      })
      Array.from(document.getElementsByClassName('subtype-shape')).forEach(dom => {
        mxEvent.removeListener(dom, 'click', this.emitEdge)
      })
      Array.from(document.getElementsByClassName('svg-view')).forEach(dom => {
        mxEvent.removeListener(dom, 'click', this.emitEdge)
      })
      if (this.currentEdgeType === 'RelationalVirtual') {
        // Array.from(document.getElementsByClassName('svg-view')).forEach(dom => {
        //   mxEvent.removeListener(dom, 'click', this.emitEdge)
        // })
        Array.from(document.getElementsByClassName('svg-comment')).forEach(dom => {
          mxEvent.removeListener(dom, 'click', this.emitEdge)
        })
        Array.from(document.getElementsByClassName('svg-figure')).forEach(dom => {
          mxEvent.removeListener(dom, 'click', this.emitEdge)
        })
      }
    },
    relationClick () {
      if (this.currentEdgeType === 'RelationalIdentifying') {
        this.removeRelationConnect()
      } else {
        this.currentEdgeType = 'RelationalIdentifying'
        Array.from(document.getElementsByClassName('svg-table')).forEach(dom => {
          mxEvent.addListener(dom, 'click', this.emitEdge)
          this.graph.graph.setCellsMovable(false)
        })
      }
    },
    relationClick5 () {
      if (this.currentEdgeType === 'RelationalSubtype') {
        this.removeRelationConnect()
      } else {
        this.currentEdgeType = 'RelationalSubtype'
        Array.from(document.getElementsByClassName('svg-table')).forEach(dom => {
          mxEvent.addListener(dom, 'click', this.emitEdge)
          this.graph.graph.setCellsMovable(false)
        })
        Array.from(document.getElementsByClassName('subtype-shape')).forEach(dom => {
          mxEvent.addListener(dom, 'click', this.emitEdge)
          this.graph.graph.setCellsMovable(false)
        })
      }
    },
    relationClick1 () {
      if (this.currentEdgeType === 'RelationalNonIdentifying') {
        this.removeRelationConnect()
      } else {
        this.currentEdgeType = 'RelationalNonIdentifying'
        Array.from(document.getElementsByClassName('svg-table')).forEach(dom => {
          mxEvent.addListener(dom, 'click', this.emitEdge)
          this.graph.graph.setCellsMovable(false)
        })
      }
    },
    relationClick2 () {
      if (this.currentEdgeType === 'RelationalManyToMany') {
        this.removeRelationConnect()
      } else {
        this.currentEdgeType = 'RelationalManyToMany'
        Array.from(document.getElementsByClassName('svg-table')).forEach(dom => {
          mxEvent.addListener(dom, 'click', this.emitEdge)
          this.graph.graph.setCellsMovable(false)
        })
      }
    },
    relationClick3 () {
      if (this.currentEdgeType === 'RelationalVirtual') {
        this.removeRelationConnect()
      } else {
        this.currentEdgeType = 'RelationalVirtual'
        Array.from(document.getElementsByClassName('svg-table')).forEach(dom => {
          mxEvent.addListener(dom, 'click', this.emitEdge)
          this.graph.graph.setCellsMovable(false)
        })
        // Array.from(document.getElementsByClassName('subtype-shape')).forEach(dom => {
        //   mxEvent.addListener(dom, 'click', this.emitEdge)
        //   this.graph.graph.setCellsMovable(false)
        // })
        Array.from(document.getElementsByClassName('svg-view')).forEach(dom => {
          mxEvent.addListener(dom, 'click', this.emitEdge)
          this.graph.graph.setCellsMovable(false)
        })
        Array.from(document.getElementsByClassName('svg-comment')).forEach(dom => {
          mxEvent.addListener(dom, 'click', this.emitEdge)
          this.graph.graph.setCellsMovable(false)
        })
        Array.from(document.getElementsByClassName('svg-figure')).forEach(dom => {
          mxEvent.addListener(dom, 'click', this.emitEdge)
          this.graph.graph.setCellsMovable(false)
        })
      }
    },
    relationClick4 () {
      if (this.currentEdgeType === 'RelationalView') {
        this.removeRelationConnect()
      } else {
        this.currentEdgeType = 'RelationalView'
        Array.from(document.getElementsByClassName('svg-table')).forEach(dom => {
          mxEvent.addListener(dom, 'click', this.emitEdge)
          this.graph.graph.setCellsMovable(false)
        })
        Array.from(document.getElementsByClassName('svg-view')).forEach(dom => {
          mxEvent.addListener(dom, 'click', this.emitEdge)
          this.graph.graph.setCellsMovable(false)
        })
      }
    },
    editLayer (cell) {
      this.loading.status = true
      // if (cell.vertex !== null && cell.vertex) {
      if (cell.isView || cell.isTable || cell.isComment || cell.isFigure) { // 因为有的Figure是edge组成的
        if (this.dataByType.diagram[this.currentId].children) {
          this.cellDialogData = cell
          this.currentStyleRelatedShapeTemplate = this.formatThemeTemplateData(_.cloneDeep(this.dataByType.diagram[this.currentId].children.find(shape => !shape.properties.deleted && shape.properties.Id === cell.Id)).properties)
        }
        if (cell.isView) {
          this.afterHandleViewDialogData(cell.OwneeRef, true)
        } else if (cell.isTable) {
          this.afterHandleDialogData(cell.OwneeRef, true)
        } else if (cell.isComment) {
          if (!this.currentStyleRelatedShapeTemplate.StyleFontFamily) {
            this.$set(this.currentStyleRelatedShapeTemplate, 'StyleFontFamily', this.currentStyleRelatedShapeTemplate.CommentTextFontFamily)
          }
          if (!this.currentStyleRelatedShapeTemplate.StyleFontSize) {
            this.$set(this.currentStyleRelatedShapeTemplate, 'StyleFontSize', this.currentStyleRelatedShapeTemplate.CommentTextFontSize)
          }
          this.afterHandleCommentData(cell.OwneeRef)
        } else if (cell.isFigure && !cell.isPolygon) {
          this.editFigureDialog = true
        }
        // this.tableDialogId = cell.OwneeRef
        // let table = this.dataByType.table[this.tableDialogId]
        // this.tableDialogData = table
        // this.tableDialogCell = cell
        // this.tableDialogDataShow = _.cloneDeep(table)
        // this.tableDialog = true
      } else if (cell.isSubType) { // subtype编辑
        this.currentStyleRelatedShapeTemplate = this.formatThemeTemplateData(_.cloneDeep(this.dataByType.diagram[this.currentId].children.find(shape => !shape.properties.deleted && shape.properties.Id === cell.Id)).properties)
        let parentTable = this.dataByType.table[cell.ParentTableId]
        let subtype = parentTable.children?.find(column => column.properties.Id === cell.SubTypeRef && !column.properties.deleted)
        this.subtypeDialogKey++
        this.subtypeDialog = true
        this.subtypeDialogData = subtype
        this.subtypeCellData = cell
      } else if (cell.edge != null && cell.edge) { // 关系
        // if (cell.type === 'Subtype') {
        //   this.$datablauMessage.warning('Subtype关系暂不支持在web端编辑，请前往客户端')
        //   this.loading.status = false
        //   return
        // } else
        if (cell.type === 'Subtype' && cell.subtypeTopEdge) { // subtype关系的最上面的edge
          this.currentStyleRelatedShapeTemplate = this.formatThemeTemplateData(_.cloneDeep(this.dataByType.diagram[this.currentId].children.find(shape => !shape.properties.deleted && shape.properties.Id === cell.Id)).properties)
          let parentTable = this.dataByType.table[cell.target.ParentTableId]
          let subtype = parentTable.children?.find(column => column.properties.Id === cell.target.SubTypeRef && !column.properties.deleted)
          this.subtypeDialogKey++
          this.subtypeDialog = true
          this.subtypeDialogData = subtype
          this.subtypeCellData = cell
          this.loading.status = false
          return
        }
        if (cell.type === 'editDisabled') {
          this.$datablauMessage.warning('此虚拟关系不支持编辑')
          this.loading.status = false
          return
        }
        this.currentStyleRelatedShapeTemplate = this.formatThemeTemplateData(_.cloneDeep(this.dataByType.diagram[this.currentId].children.find(shape => !shape.properties.deleted && shape.properties.Id === cell.Id)).properties)
        this.edgeDialogKey++
        this.edgeDialog = true
        this.edgeDialogData = cell
        // this.edgeDialogDataShow = _.cloneDeep(cell)
      }
      this.loading.status = false
    },
    async redoUndoThemeCancelRelation (cell) {
      if (cell.type === 'Relational' || cell.type === 'RelationalManyToMany') {
        let relation = this.dataByType.relation[cell.OwneeRef]
        let targetTable = this.dataByType.table[cell.target.OwneeRef]
        let foreignKey = targetTable.children.find(column => column.properties.Id === relation.properties.ChildKeyRef)
        let sourceTable = this.dataByType.table[cell.source.OwneeRef]
        foreignKey.children && foreignKey.children.forEach(member => {
          let index = targetTable.children.findIndex(column => column.properties.Id === member.properties.AttributeRef)
          if (index !== -1) {
            targetTable.children[index].properties.showParent = false
            targetTable.children[index].properties.showChild = false
          }
          index = sourceTable.children.findIndex(column => column.properties.Id === targetTable.children[index].properties.Reference)
          if (index !== -1) {
            sourceTable.children[index].properties.showParent = false
            sourceTable.children[index].properties.showChild = false
          }
        })
        let html = await this.getTableHTMLFunction(targetTable.properties.Id, this.graph.graph, null, null, true)
        cell.target.value = html
        html = await this.getTableHTMLFunction(sourceTable.properties.Id, this.graph.graph, null, null, true)
        cell.source.value = html
        this.graph.graph.getView().refresh()
      }
    },
    async redoUndoThemeCreateRelation (cell) {
      if (cell.type === 'Relational' || cell.type === 'RelationalManyToMany') {
        let relation = this.dataByType.relation[cell.OwneeRef]
        let targetTable = this.dataByType.table[cell.target.OwneeRef]
        let sourceTable = this.dataByType.table[cell.source.OwneeRef]
        let foreignKey = targetTable.children.find(column => column.properties.Id === relation.properties.ChildKeyRef)
        let primaryKey = targetTable.children.find(column => column.objectClass === 'Datablau.LDM.EntityKeyGroup' && column.properties.KeyGroupType === 'PrimaryKey')
        // foreignKey.properties.deleted = false
        // foreignKey.children.forEach(member => {
        //   let column = targetTable.children.find(column => column.properties.Id === member.properties.AttributeRef)
        //   column.properties.deleted = false
        //   primaryKey.children.find(primaryMember => primaryMember.properties.AttributeRef === column.properties.Id).properties.deleted = false
        // })
        foreignKey.children.forEach(member => {
          let index = targetTable.children.findIndex(column => column.properties.Id === member.properties.AttributeRef)
          if (index !== -1) {
            targetTable.children[index].properties.showParent = false
            targetTable.children[index].properties.showChild = false
          }
          index = sourceTable.children.findIndex(column => column.properties.Id === targetTable.children[index].properties.Reference)
          if (index !== -1) {
            sourceTable.children[index].properties.showParent = false
            sourceTable.children[index].properties.showChild = false
          }
        })
        let html = await this.getTableHTMLFunction(targetTable.properties.Id, this.graph.graph, null, null, true)
        cell.target.value = html
        html = await this.getTableHTMLFunction(sourceTable.properties.Id, this.graph.graph, null, null, true)
        cell.source.value = html
        this.graph.graph.getView().refresh()
      } else if (cell.type === 'RelationalVirtual') {

      }
    },
    async redoUndoDeepRealCancelRelation (targetOwneeRef, endIds, changes) {
      if (endIds) {
        for (let endId of endIds) {
          let relation = Object.values(this.dataByType.relation).find(relation => relation.properties.TypeId === LDMTypes.Relationship && (relation.properties.RelationalType === 'Identifying' || relation.properties.RelationalType === 'NonIdentifying') && relation.properties.ParentEntityRef === targetOwneeRef && relation.properties.ChildEntityRef === endId)
          let nextEdge = this.graph.graph.getDefaultParent().children.find(cell => cell.edge && cell.OwneeRef === relation.properties.Id)
          if (!nextEdge) {
            nextEdge = {
              OwneeRef: relation.properties.Id,
              type: 'Relational',
              relationalType: 'Identifying',
              deleteColumn: true,
              sourceOwneeRef: targetOwneeRef,
              targetOwneeRef: endId
            }
          }
          nextEdge.deleteColumn = true
          let nextTargetOwneeRef = nextEdge.target ? nextEdge.target.OwneeRef : nextEdge.targetOwneeRef
          if (this.pathIds.has(endId)) {
            continue
          }
          try {
            await this.redoUndoRealCancelRelation(nextEdge, changes, this.deleteColumnState, true)

            // this.pathIds.add(targetOwneeRef)
            // this.pathIds.add(endId)
            let ids = this.startIdToEndIds[nextTargetOwneeRef]
            await this.redoUndoDeepRealCancelRelation(nextTargetOwneeRef, ids, changes)
          } catch (e) {
            console.log(e)
          }
        }
      }
    },
    deepDeliver (table, changes) {
      this.clearPathIds()
      try {
        this.calculateStartIdToEndIds()
        setTimeout(async () => {
          let endIds = this.startIdToEndIds[table.properties.Id]
          let target = this.graph.graph.getDefaultParent().children.find(cell => cell.OwneeRef === table.properties.Id)
          await this.createDeepRelation(endIds, target, changes)
        })
      } catch (e) {
        console.log(e)
      }
    },
    async redoUndoRealCancelRelation (cell, changes, deleteColumnState, retainEdge) { // 删除关系的相关逻辑
      if ((cell.type === 'Subtype' && !cell.subtypeTopEdge) || cell.type === 'Relational' || cell.type === 'RelationalManyToMany') {
        // 因为有前进和回退，索引当创建关系后回退是，只逻辑删除column，恢复时把column状态置为存在，新建的索引不管，索引未能引用到column，那就表明该索引不应该存在
        let thenReturn = false
        let targetTable = null
        let foreignKey = null
        let sourceTable = null
        try {
          if (this.currentOperate.indexOf('delete') !== -1) {
            if (deleteColumnState === null) {
              await this.$DatablauCofirm(`选中的关系将被删除，外键的列是否需要删除？`, '提示', {
                type: 'warning',
                confirmButtonText: '是',
                cancelButtonText: ' 否 ',
                showClose: false,
                closeOnClickModal: false
              })
            } else {
              await new Promise((resolve, reject) => {
                if (deleteColumnState) {
                  resolve()
                } else {
                  reject(new Error('不删除column'))
                }
              })
            }
          }
          // else if (this.currentOperate === 'redo' || this.currentOperate === 'undo') {
          //   await new Promise((resolve, reject) => {
          //     if (cell.deleteColumn) {
          //       resolve()
          //     } else {
          //       reject(new Error('不删除column'))
          //     }
          //   })
          // }

          thenReturn = true
          cell.deleteColumn = true
          this.deleteColumnState = true
          // 修改或删除target表的主键，删除外键以及相应的列
          let relation = this.dataByType.relation[cell.OwneeRef]
          if (relation) {
            targetTable = this.dataByType.table[cell.target.OwneeRef]
            foreignKey = targetTable.children.find(column => column.properties.Id === relation.properties.ChildKeyRef)
            sourceTable = this.dataByType.table[cell.type === 'Subtype' ? cell.source.ParentTableId : cell.source.OwneeRef]
            targetTable.properties.changed = true
            foreignKey.children.forEach(member => {
              let index = targetTable.children.findIndex(column => column.properties.Id === member.properties.AttributeRef)
              if (index !== -1) {
                let targetColumn = targetTable.children[index]
                // if (!targetColumn.properties.conflictRetain) {
                targetColumn.properties.deleted = true
                changes.push(new Changes('deleteColumn', {
                  pId: targetTable.properties.Id,
                  pName: targetTable.properties.Name,
                  id: targetColumn.properties.Id,
                  name: targetColumn.properties.Name
                }))
                // }
                targetColumn.properties.showParent = false
                targetColumn.properties.showChild = false
              }
              index = sourceTable.children.findIndex(column => column.properties.Id === targetTable.children[index].properties.Reference)
              if (index !== -1) {
                sourceTable.children[index].properties.showParent = false
                sourceTable.children[index].properties.showChild = false
              }
            })
            let primaryKeyIndex = targetTable.children.findIndex(column => column.objectClass === 'Datablau.LDM.EntityKeyGroup' && column.properties.KeyGroupType === 'PrimaryKey')
            let primaryKey = null
            if (primaryKeyIndex !== -1) {
              primaryKey = targetTable.children[primaryKeyIndex]
            }
            if (cell.relationalType === 'Identifying' && primaryKey) { // 主键关系才需删除主键索引
              let change = new Changes('modifyIndex', {
                pId: targetTable.properties.Id,
                pName: targetTable.properties.Name,
                name: primaryKey.properties.Name,
                pre: _.cloneDeep(primaryKey),
                now: null
              })

              foreignKey.children.forEach(mebmer => {
                let primaryMember = primaryKey.children.find(pMember => pMember.properties.AttributeRef === mebmer.properties.AttributeRef)
                if (!primaryMember.properties.retain) {
                  primaryMember.properties.deleted = true
                }
              })
              primaryKey.children = primaryKey.children?.filter(m => !m.properties.deleted)
              change.obj.now = _.cloneDeep(primaryKey)
              primaryKey.properties.changed = true
              changes.push(change)
            }
            foreignKey = targetTable.children.find(column => column.objectClass === 'Datablau.LDM.EntityKeyGroup' && column.properties.KeyGroupType === 'ForeignKey' && column.properties.Id === relation.properties.ChildKeyRef)
            if (retainEdge) {
              let change = new Changes('modifyIndex', {
                pId: targetTable.properties.Id,
                pName: targetTable.properties.Name,
                name: foreignKey.properties.Name,
                pre: _.cloneDeep(foreignKey),
                now: null
              })
              foreignKey.properties.changed = true
              foreignKey.children.forEach(member => {
                member.properties.deleted = true
              })
              change.obj.now = _.cloneDeep(foreignKey)
              changes.push(change)
            } else {
              foreignKey.properties.deleted = true

              changes.push(new Changes('deleteIndex', {
                pId: targetTable.properties.Id,
                pName: targetTable.properties.Name,
                name: foreignKey.properties.Name,
                id: foreignKey.properties.Id
              }))
            }
          }
        } catch (e) {
          // 删除外键, 不删除column
          if (!thenReturn) {
            cell.deleteColumn = false
            this.deleteColumnState = false
            let relation = this.dataByType.relation[cell.OwneeRef]
            if (relation) {
              targetTable = this.dataByType.table[cell.target.OwneeRef]
              foreignKey = targetTable.children.find(column => column.properties.Id === relation.properties.ChildKeyRef)
              sourceTable = this.dataByType.table[cell.type === 'Subtype' ? cell.source.ParentTableId : cell.source.OwneeRef]
              let primaryKeyIndex = targetTable.children.findIndex(column => column.objectClass === 'Datablau.LDM.EntityKeyGroup' && column.properties.KeyGroupType === 'PrimaryKey')
              foreignKey.children && foreignKey.children.forEach(member => {
                let index = targetTable.children.findIndex(column => column.properties.Id === member.properties.AttributeRef)
                if (index !== -1) {
                  targetTable.children[index].properties.showParent = false
                  targetTable.children[index].properties.showChild = false
                }
                index = sourceTable.children.findIndex(column => column.properties.Id === targetTable.children[index].properties.Reference)
                if (index !== -1) {
                  sourceTable.children[index].properties.showParent = false
                  sourceTable.children[index].properties.showChild = false
                }
              })
              let foreignKeyIndex = targetTable.children.findIndex(column => column.properties.Id === relation.properties.ChildKeyRef)
              targetTable.children[foreignKeyIndex].properties.deleted = true
              targetTable.properties.changed = true
              changes.push(new Changes('deleteIndex', {
                pId: targetTable.properties.Id,
                pName: targetTable.properties.Name,
                name: foreignKey.properties.Name,
                id: foreignKey.properties.Id
              }))
            }
          }
        }
        let html = await this.getTableHTMLFunction(targetTable.properties.Id, this.graph.graph, null, null, true)
        if (cell.target) {
          cell.target.value = html
        } else {
          let target = this.graph.graph.getDefaultParent().children.find(curentCell => curentCell.OwneeRef === cell.targetOwneeRef)
          if (target) {
            target.value = html
          } else {
            target = this.deleteGraph.find(curentCell => curentCell.OwneeRef === cell.targetOwneeRef)
            if (target) {
              target.value = html
            }
          }
        }
        html = await this.getTableHTMLFunction(sourceTable.properties.Id, this.graph.graph, null, null, true)
        if (cell.source) {
          if (cell.type === 'Subtype') {
            let source = this.graph.graph.getDefaultParent().children.find(curentCell => curentCell.OwneeRef === sourceTable.properties.Id)
            if (source) {
              source.value = html
            }
          } else {
            cell.source.value = html
          }
        } else {
          let source = this.graph.graph.getDefaultParent().children.find(curentCell => curentCell.OwneeRef === cell.sourceOwneeRef)
          if (source) {
            source.value = html
          } else {
            source = this.deleteGraph.find(curentCell => curentCell.OwneeRef === cell.sourceOwneeRef)
            if (source) {
              source.value = html
            }
          }
        }
        this.graph.graph.getView().refresh()
        if (!retainEdge) {
          this.$set(this.dataByType.relation[cell.OwneeRef].properties, 'deleted', true)
          this.$parent.$parent.$parent.$parent.$forceUpdate()
        }
      } else if (cell.type === 'View') {
        try {
          /*
          处理source端视图或表
           */
          const relation = this.dataByType.relation[cell.OwneeRef]
          {
            const sourceId = cell.source.OwneeRef
            const isView = !!this.dataByType.view[sourceId]
            const targetViewOrTable = isView ? this.dataByType.view[sourceId] : this.dataByType.table[sourceId]
            targetViewOrTable.properties.changed = true
            const virtualKey = targetViewOrTable.children.find(column => column.objectClass === 'Datablau.LDM.EntityKeyGroup' && column.properties.KeyGroupType === 'VirtualKey' && column.properties.Id === relation.properties.ParentKeyRef)
            virtualKey.properties.deleted = true
            const change = new Changes('deleteIndex', {
              pId: targetViewOrTable.properties.Id,
              pName: targetViewOrTable.properties.Name,
              name: virtualKey.properties.Name,
              id: virtualKey.properties.Id
            })
            changes.push(change)
            const html = await this[isView ? 'getViewHTMLFunction' : 'getTableHTMLFunction'](targetViewOrTable.properties.Id, this.graph.graph, null, null, true)
            if (cell.source) {
              cell.source.value = html
            }
          }
          /*
          处理target端视图
           */
          {
            const targetId = cell.target.OwneeRef/* ? cell.target.OwneeRef : cell.targetOwneeRef */
            const targetView = this.dataByType.view[targetId]
            targetView.properties.changed = true
            const virtualKey = targetView.children.find(column => column.objectClass === 'Datablau.LDM.EntityKeyGroup' && column.properties.KeyGroupType === 'VirtualKey' && column.properties.Id === relation.properties.ChildKeyRef)
            virtualKey.properties.deleted = true
            const change = new Changes('deleteIndex', {
              pId: targetView.properties.Id,
              pName: targetView.properties.Name,
              name: virtualKey.properties.Name,
              id: virtualKey.properties.Id
            })
            changes.push(change)
            virtualKey.children?.forEach(member => {
              let column = targetView.children.find(column => column.properties.Id === member.properties.AttributeRef)
              let change = new Changes('modifyColumn', {
                pId: targetView.properties.Id,
                pName: targetView.properties.Name,
                name: column.properties.Name,
                pre: _.cloneDeep(column)
              })
              delete column.properties.Reference
              change.obj.now = _.cloneDeep(column)
              changes.push(change)
            })
            const html = await this.getViewHTMLFunction(targetView.properties.Id, this.graph.graph, null, null, true)
            if (cell.target) {
              cell.target.value = html
            }
          }
          this.graph.graph.getView().refresh()
        } catch (e) {
          console.error('未能更新关系关联的字段信息')
          console.error(e)
        }
      } else {
        console.debug(`删除未处理类型的关系${cell.type}`)
      }
    },
    async redoUndoDeepRealCreateRelation (targetOwneeRef, endIds) {
      if (endIds) {
        for (let endId of endIds) {
          let relation = Object.values(this.dataByType.relation).find(relation => relation.properties.TypeId === LDMTypes.Relationship && relation.properties.RelationalType === 'Identifying' && relation.properties.ParentEntityRef === targetOwneeRef && relation.properties.ChildEntityRef === endId)
          let nextEdge = this.graph.graph.getDefaultParent().children.find(cell => cell.edge && cell.OwneeRef === relation.properties.Id)
          if (!nextEdge) {
            nextEdge = {
              OwneeRef: relation.properties.Id,
              type: 'Relational',
              relationalType: 'Identifying',
              deleteColumn: true,
              sourceOwneeRef: targetOwneeRef,
              targetOwneeRef: endId
            }
          }
          nextEdge.deleteColumn = true
          let nextTargetOwneeRef = nextEdge.target ? nextEdge.target.OwneeRef : nextEdge.targetOwneeRef
          if (this.pathIds.has(endId)) {
            continue
          }
          try {
            await this.redoUndoRealCreateRelation(nextEdge, true)
            // this.pathIds.add(nextTargetOwneeRef)
            // this.pathIds.add(endId)
            let ids = this.startIdToEndIds[nextTargetOwneeRef]
            await this.redoUndoDeepRealCreateRelation(nextTargetOwneeRef, ids)
          } catch (e) {
            console.log(e)
          }
        }
      }
    },
    async redoUndoRealCreateRelation (cell, donotCreateEdge = false) {
      let relation = this.dataByType.relation[cell.OwneeRef]
      let targetTable = this.dataByType.table[cell.target ? cell.target.OwneeRef : cell.targetOwneeRef]
      let sourceTable = this.dataByType.table[cell.source ? cell.source.OwneeRef : cell.sourceOwneeRef]
      let foreignKey = targetTable.children.find(column => column.objectClass === 'Datablau.LDM.EntityKeyGroup' && column.properties.KeyGroupType === 'ForeignKey' && column.properties.Id === relation.properties.ChildKeyRef && column.children)
      let primaryKey = targetTable.children.find(column => column.objectClass === 'Datablau.LDM.EntityKeyGroup' && column.properties.KeyGroupType === 'PrimaryKey')
      if (cell.type === 'Relational' || cell.type === 'RelationalManyToMany') {
        if (cell.deleteColumn) { // 删除列，恢复主键索引，外键索引，column和背景色
          if (foreignKey) {
            foreignKey.properties.deleted = false
            foreignKey.children.forEach(member => {
              member.properties.deleted = false
              let column = targetTable.children.find(column => column.properties.Id === member.properties.AttributeRef)
              column.properties.deleted = false
              if (cell.relationalType === 'Identifying' && primaryKey && primaryKey.children) {
                let primaryMember = primaryKey.children.find(primaryMember => primaryMember.properties.AttributeRef === column.properties.Id)
                primaryMember.properties.deleted = false
              }
            })
            if (cell.relationalType === 'Identifying') {
              primaryKey.properties.deleted = false
            }
            foreignKey.children.forEach(member => {
              let index = targetTable.children.findIndex(column => column.properties.Id === member.properties.AttributeRef)
              if (index !== -1) {
                targetTable.children[index].properties.showParent = false
                targetTable.children[index].properties.showChild = false
              }
              index = sourceTable.children.findIndex(column => column.properties.Id === targetTable.children[index].properties.Reference)
              if (index !== -1) {
                sourceTable.children[index].properties.showParent = false
                sourceTable.children[index].properties.showChild = false
              }
            })
          }
        } else { // 未删除列，恢复外键索引和背景色
          if (foreignKey) {
            foreignKey.properties.deleted = false
            foreignKey.children.forEach(member => {
              member.properties.deleted = false
              let index = targetTable.children.findIndex(column => column.properties.Id === member.properties.AttributeRef)
              if (index !== -1) {
                targetTable.children[index].properties.showParent = false
                targetTable.children[index].properties.showChild = false
              }
              index = sourceTable.children.findIndex(column => column.properties.Id === targetTable.children[index].properties.Reference)
              if (index !== -1) {
                sourceTable.children[index].properties.showParent = false
                sourceTable.children[index].properties.showChild = false
              }
            })
          }
        }
      }
      let html = await this.getTableHTMLFunction(targetTable.properties.Id, this.graph.graph, null, null, true)
      if (cell.target) {
        cell.target.value = html
      } else {
        let target = this.graph.graph.getDefaultParent().children.find(curentCell => curentCell.OwneeRef === cell.targetOwneeRef)
        if (target) {
          target.value = html
        } else {
          target = this.deleteGraph.find(curentCell => curentCell.OwneeRef === cell.targetOwneeRef)
          if (target) {
            target.value = html
          }
        }
      }
      html = await this.getTableHTMLFunction(sourceTable.properties.Id, this.graph.graph, null, null, true)
      if (cell.source) {
        cell.source.value = html
      } else {
        let source = this.graph.graph.getDefaultParent().children.find(curentCell => curentCell.OwneeRef === cell.sourceOwneeRef)
        if (source) {
          source.value = html
        } else {
          source = this.deleteGraph.find(curentCell => curentCell.OwneeRef === cell.sourceOwneeRef)
          if (source) {
            source.value = html
          }
        }
      }
      this.graph.graph.getView().refresh()
      if (!donotCreateEdge) {
        this.$set(this.dataByType.relation[cell.OwneeRef].properties, 'deleted', false)
        this.$parent.$parent.$parent.$parent.$forceUpdate()
      }
    },
    async createDeepRelation (endIds, target, changes, originSourceTablePrevious, noIndexModifed, sourceDeliverColumnIds = null) { // deliverColumnIds === null, 传递所有字段，否则传递指定字段
      // if (sourceDeliverColumnIds && !sourceDeliverColumnIds.length) {
      //   return
      // }
      if (endIds) {
        for (let endId of new Set(endIds)) { // endIds可能有相同的，比如表A和表B间有主键关系和非主键关系两个
          let cell = this.graph.graph.getDefaultParent().children.find(cell => cell.OwneeRef === endId)
          if (!cell) {
            cell = {
              id: -1,
              OwneeRef: endId
            }
          }
          // if (this.pathIds.has(endId)) { // 已传递过该路径, （这块逻辑已废弃）
          //   continue
          // }
          let relations = Object.values(this.dataByType.relation).filter(relation => !relation.properties.deleted && relation.properties.TypeId === LDMTypes.Relationship && relation.properties.ParentEntityRef === target.OwneeRef && relation.properties.ChildEntityRef === cell.OwneeRef) // 父表到子表可能有多个relation需要传递
          let sourceTablePrevious = null
          if (originSourceTablePrevious) {
            sourceTablePrevious = _.cloneDeep(this.dataByType.table[endId])
          }
          for (let relation of relations) {
            relation.properties.changed = true
            let sourcePrimaryKey = this.dataByType.table[relation.properties.ParentEntityRef]?.children?.find(column => !column.properties.deleted && column.objectClass === 'Datablau.LDM.EntityKeyGroup' && column.properties.Id === relation.properties.ParentKeyRef)
            let originSourcePrimaryKeyPrevious = null
            if (originSourceTablePrevious) {
              originSourcePrimaryKeyPrevious = originSourceTablePrevious.children.find(column => !column.properties.deleted && column.objectClass === 'Datablau.LDM.EntityKeyGroup' && column.properties.Id === relation.properties.ParentKeyRef)
            }
            let targetTablePrimaryKeyCurrentChanged = await this.createRelation(target, cell, 'Relational' + (relation.objectClass === 'Datablau.LDM.RelationshipSubtype' ? 'Subtype' : relation.properties.RelationalType), changes, relation, sourcePrimaryKey, originSourcePrimaryKeyPrevious, noIndexModifed, sourceDeliverColumnIds)
            if ((relation.properties.RelationalType === 'Identifying' || relation.properties.RelationalType === 'NonIdentifying') && (relation.objectClass === 'Datablau.LDM.RelationshipRelational' || relation.objectClass === 'Datablau.LDM.RelationshipSubtype') && targetTablePrimaryKeyCurrentChanged) { // 主键关系非主键关系都需要传递（父表删除主键字段），并且需要下个传递关系的父表的主键修改过
              let targetForeignKey = this.dataByType.table[relation.properties.ChildEntityRef]?.children?.find(column => column.objectClass === 'Datablau.LDM.EntityKeyGroup' && column.properties.Id === relation.properties.ChildKeyRef)
              let targetColumns = targetForeignKey?.children?.map(m => m.properties.AttributeRef).map(targetColumnId => {
                let targetColumn = this.dataByType.table[relation.properties.ChildEntityRef]?.children?.find(column => !column.properties.deleted && column.properties.Id === targetColumnId)
                return targetColumn
              }).filter(item => item)
              let sourcePrimaryKey = this.dataByType.table[relation.properties.ParentEntityRef]?.children?.find(column => !column.properties.deleted && column.objectClass === 'Datablau.LDM.EntityKeyGroup' && column.properties.Id === relation.properties.ParentKeyRef)
              let targetDeliverColumnIds = sourceDeliverColumnIds?.map(sourceColumnId => {
                let sourceMember = sourcePrimaryKey?.children?.find(m => m.properties.AttributeRef === sourceColumnId)
                let targetMember = targetForeignKey?.children?.find(m => m.properties.Reference === sourceMember?.properties.Id)
                let mapTargetColumn = targetColumns?.find(column => !column.properties.deleted && column.properties.Id === targetMember?.properties.AttributeRef)
                return mapTargetColumn?.properties.Id
              })
              // this.pathIds.add(target.OwneeRef)
              // this.pathIds.add(endId)
              let ids = this.startIdToEndIds[endId] // 深度遍历
              if (ids) {
                await this.createDeepRelation(ids, cell, changes, sourceTablePrevious, noIndexModifed, targetDeliverColumnIds)
              }
            }
          }
        }
        // for (let endId of endIds) { // 广度遍历
        //   let cell = this.graph.graph.getDefaultParent().children.find(cell => cell.OwneeRef === endId)
        //   if (!cell) {
        //     cell = {
        //       id: -1,
        //       OwneeRef: endId
        //     }
        //   }
        //   let ids = this.startIdToEndIds[endId]
        //   if (ids) {
        //     await this.createDeepRelation(ids, cell, type)
        //   }
        // }
      }
    },
    async createRelation (source, target, type = 'RelationalIdentifying', changes, noneEdge, sourcePrimaryKey, sourcePrimaryKeyPrevious, noIndexModifed, sourceDeliverColumnIds) { // sourcePrimaryKey可自定义父表传递的主键, noneEdge一般为relation，有sourcePrimaryKey必有noneEdge， 有sourcePrimaryKeyPrevious必有sourcePrimaryKey和noneEdge, sourcePrimaryKeyPrevious做传递用, noIndexModifed为true不创建新的外键索引, sourceDeliverColumnIds传递的字段id
      this.emptyEdgeNum = this.deliverNum.seed++
      this.emptyRelationNum = this.deliverNum.seed++
      this.currentEdgeType = type
      if (type === 'RelationalView') { // table到视图的关系单独处理
        const sourceTable = this.dataByType.table[source.OwneeRef] || this.dataByType.view[source.OwneeRef]
        const targetTable = this.dataByType.view[target.OwneeRef]
        let edge = null
        edge = this.graph.graph.insertEdge(this.graph.graph.getDefaultParent(), this.emptyEdgeNum, null,
          source, target,
          'OneOnlyDashed'
        )
        const relation = {
          objectClass: 'Datablau.LDM.RelationshipView',
          properties: {
            ChildEntityRef: target.OwneeRef,
            EndCardinality: 'OneOnly',
            Id: this.emptyRelationNum,
            Label: 'ref',
            Name: `rs_${sourceTable.properties.Name}_${targetTable.properties.Name}`,
            ParentEntityRef: source.OwneeRef,
            RawType: 'Relationship',
            RelationalType: 'NonIdentifying',
            StartCardinality: 'OneOnly',
            TypeId: 80000007,
            UniqueId: uuidv4(),
            new: true
          }
        }
        this.$set(this.dataByType.relation, this.emptyRelationNum, relation)
        changes.push(new Changes('insertRelation', {
          name: relation.properties.Name,
          now: _.cloneDeep(relation)
        }))
        setTimeout(() => {
          const connection = {
            objectClass: 'Datablau.ERD.ConnectionVirtualView',
            properties: {
              BendPoints: edge.CurrentBendPoints,
              ChildShapeRef: edge.target.Id,
              EndOrientation: edge.EndOrientation,
              Id: this.emptyEdgeNum,
              Name: `Connection_${this.emptyEdgeNum}`,
              OwneeRef: this.emptyRelationNum,
              ParentShapeRef: edge.source.Id,
              RawType: 'Connection',
              StartOrientation: edge.StartOrientation,
              TypeId: 80000009,
              UniqueId: uuidv4(),
              new: true
            }
          }
          this.dataByType.diagram[this.currentId].children.push(connection)
          changes.push(new Changes('insertConnection', {
            name: relation.properties.Name,
            id: this.emptyEdgeNum
          }))
          edge.style = this.graph.drawEdgeShapeStyle(this.emptyEdgeNum)
          this.graph.graph.refresh(edge)
          this.emptyRelationNum++
          this.emptyEdgeNum++
        })
        edge.Id = this.emptyEdgeNum
        edge.new = true
        edge.OwneeRef = relation.properties.Id
        edge.endCardinalityType = 'OneOnly'
        edge.type = 'View'
        edge.relationalType = 'NonIdentifying'
        edge.deleteReal = true
        edge.targetOwneeRef = target.OwneeRef
        edge.sourceOwneeRef = source.OwneeRef
        edge.deleteColumn = true
        this.currentOperate = 'addEdge'
        setTimeout(() => {
          this.graph.graph.setCellsMovable(true)
        })
        this.currentEdgeType = null
        return relation // 视图字段编辑的时候创建视图关系用到了此relation
      } else if (type === 'RelationalVirtual') { // 虚拟关系， 必须source和target都为实体（表和视图）才创建关系
        const sourceTable = this.dataByType[source.isView ? 'view' : source.isComment ? 'comment' : 'table'][source.OwneeRef]
        const targetTable = this.dataByType[target.isView ? 'view' : target.isComment ? 'comment' : 'table'][target.OwneeRef]
        let needCreateRelation = source.vertex && (source.isView || source.isTable || source.isSubType) && target.vertex && (target.isView || target.isTable || target.isSubType)
        let edge = null
        edge = this.graph.graph.insertEdge(this.graph.graph.getDefaultParent(), this.emptyEdgeNum, null,
          source, target,
          needCreateRelation ? 'ZeroOneOrMoreDashed' : 'Dashed'
        )
        let relation = null
        if (needCreateRelation) {
          relation = {
            objectClass: 'Datablau.LDM.RelationshipVirtual',
            properties: {
              ChildEntityRef: target.isSubType ? target.OwneeRef : target.SubTypeRef,
              EndCardinality: 'ZeroOneOrMore',
              Id: this.emptyRelationNum,
              Label: 'ref',
              Name: `rs_${source.isSubType ? 'Subtype_' + source.SubTypeRef : sourceTable ? sourceTable.properties.Name : source.isFigure ? 'Figure_' + source.Id : 'Unkonwn'}_${target.isSubType ? 'Subtype_' + target.SubTypeRef : targetTable ? targetTable.properties.Name : target.isFigure ? 'Figure_' + target.Id : 'Unkonwn'}_${this.emptyRelationNum}`,
              ParentEntityRef: source.isSubType ? source.OwneeRef : source.SubTypeRef,
              RawType: 'Relationship',
              RelationalType: 'NonIdentifying',
              StartCardinality: 'ZeroOrOne',
              TypeId: 80000007,
              UniqueId: uuidv4(),
              new: true
            }
          }
          this.$set(this.dataByType.relation, this.emptyRelationNum, relation)
          changes.push(new Changes('insertRelation', {
            name: relation.properties.Name,
            now: _.cloneDeep(relation)
          }))

          setTimeout(() => {
            const connection = {
              objectClass: 'Datablau.ERD.ConnectionVirtual',
              properties: {
                BendPoints: edge.CurrentBendPoints,
                ChildShapeRef: edge.target.Id,
                EndOrientation: edge.EndOrientation,
                Id: this.emptyEdgeNum,
                Name: `Connection_${this.emptyEdgeNum}`,
                OwneeRef: this.emptyRelationNum,
                ParentShapeRef: edge.source.Id,
                RawType: 'Connection',
                StartOrientation: edge.StartOrientation,
                TypeId: 80000009,
                UniqueId: uuidv4(),
                new: true
              }
            }
            this.dataByType.diagram[this.currentId].children.push(connection)
            changes.push(new Changes('insertConnection', {
              name: relation.properties.Name,
              id: this.emptyEdgeNum
            }))
            edge.style = this.graph.drawEdgeShapeStyle(this.emptyEdgeNum)
            edge.type = needCreateRelation ? 'Virtual' : 'editDisabled' // 建立在图框和备注上的虚拟关系，没有relation，不能编辑
            this.graph.graph.refresh(edge)
            this.emptyRelationNum++
            this.emptyEdgeNum++
          })
        } else {
          setTimeout(() => {
            const connection = {
              objectClass: 'Datablau.ERD.ConnectionVirtualLine',
              properties: {
                BendPoints: edge.CurrentBendPoints,
                ChildShapeRef: edge.target.Id,
                EndOrientation: edge.EndOrientation,
                Id: this.emptyEdgeNum,
                Name: `Connection_${this.emptyEdgeNum}`,
                OwneeRef: this.emptyRelationNum,
                ParentShapeRef: edge.source.Id,
                RawType: 'Connection',
                StartOrientation: edge.StartOrientation,
                TypeId: 80000009,
                UniqueId: uuidv4(),
                new: true
              }
            }
            this.dataByType.diagram[this.currentId].children.push(connection)
            changes.push(new Changes('insertConnection', {
              name: 'connection',
              id: this.emptyEdgeNum
            }))
            edge.style = this.graph.drawEdgeShapeStyle(this.emptyEdgeNum)
            this.graph.graph.refresh(edge)
            this.emptyRelationNum++
            this.emptyEdgeNum++
          })
        }
        edge.Id = this.emptyEdgeNum
        edge.new = true
        edge.OwneeRef = needCreateRelation ? relation.properties.Id : null
        edge.endCardinalityType = needCreateRelation ? 'ZeroOneOrMore' : 'Dashed'
        edge.type = 'Virtual'
        edge.relationalType = 'NonIdentifying'
        edge.deleteReal = needCreateRelation
        edge.targetOwneeRef = target.OwneeRef
        edge.sourceOwneeRef = source.OwneeRef
        edge.deleteColumn = true
        edge.type = needCreateRelation ? 'Virtual' : 'editDisabled' // 建立在图框和备注上的虚拟关系，没有relation，不能编辑
        this.currentOperate = 'addEdge'
        setTimeout(() => {
          this.graph.graph.setCellsMovable(true)
        })
        this.currentEdgeType = null
        return
      } else if (type === 'RelationalManyToMany') {
        const sourceTable = this.dataByType.table[source.OwneeRef]
        const targetTable = this.dataByType.table[target.OwneeRef]
        let sourcePrimaryKey = sourceTable.children && sourceTable.children.find(column => !column.properties.deleted && column.objectClass === 'Datablau.LDM.EntityKeyGroup' && column.properties.KeyGroupType === 'PrimaryKey')
        if (!sourcePrimaryKey) {
          if (!sourceTable.children) {
            sourceTable.children = []
          }
          let keyId = 1
          let index = sourceTable.children.filter(i => i.objectClass === 'Datablau.LDM.EntityKeyGroup')
          if (index && index.length) {
            let name = index[index.length - 1].properties.Name
            keyId = parseInt(name.slice(name.search(/\d+$/)))
          }
          let primaryKey = {
            children: [],
            objectClass: 'Datablau.LDM.EntityKeyGroup',
            properties: {
              Id: this.deliverNum.seed++,
              KeyGroupMemberRefs: [],
              KeyGroupType: 'PrimaryKey',
              Macro: this.dataByType.namingOption.PKDefaultMacro,
              Name: this.dataByType.namingOption.PKDefaultMacro.replace(/%owner%/, sourceTable.properties.Name).replace(/%keyid%/, '' + (keyId++)),
              RawType: 'KeyGroup',
              TypeId: 80000093,
              UniqueId: uuidv4(),
              new: true
            }
          }
          sourceTable.children.push(primaryKey)
          changes.push(new Changes('insertIndex', {
            pId: sourceTable.properties.Id,
            pName: sourceTable.properties.Name,
            name: primaryKey.properties.Name,
            now: _.cloneDeep(primaryKey)
          }))
          sourceTable.properties.changed = true
          sourcePrimaryKey = primaryKey
        }
        let targetPrimaryKey = targetTable.children && targetTable.children.find(column => !column.properties.deleted && column.objectClass === 'Datablau.LDM.EntityKeyGroup' && column.properties.KeyGroupType === 'PrimaryKey')
        if (!targetPrimaryKey) {
          if (!targetTable.children) {
            targetTable.children = []
          }
          let keyId = 1
          let index = targetTable.children.filter(i => i.objectClass === 'Datablau.LDM.EntityKeyGroup')
          if (index && index.length) {
            let name = index[index.length - 1].properties.Name
            keyId = parseInt(name.slice(name.search(/\d+$/)))
          }
          let primaryKey = {
            children: [],
            objectClass: 'Datablau.LDM.EntityKeyGroup',
            properties: {
              Id: this.deliverNum.seed++,
              KeyGroupMemberRefs: [],
              KeyGroupType: 'PrimaryKey',
              Macro: this.dataByType.namingOption.PKDefaultMacro,
              Name: this.dataByType.namingOption.PKDefaultMacro.replace(/%owner%/, targetTable.properties.Name).replace(/%keyid%/, '' + (keyId++)),
              RawType: 'KeyGroup',
              TypeId: 80000093,
              UniqueId: uuidv4(),
              new: true
            }
          }
          targetTable.children.push(primaryKey)
          changes.push(new Changes('insertIndex', {
            pId: targetTable.properties.Id,
            pName: targetTable.properties.Name,
            name: primaryKey.properties.Name,
            now: _.cloneDeep(primaryKey)
          }))
          targetTable.properties.changed = true
          targetPrimaryKey = primaryKey
        }
        let edge = null
        edge = this.graph.graph.insertEdge(this.graph.graph.getDefaultParent(), this.emptyEdgeNum, null,
          source, target,
          this.currentEdgeType === 'RelationalIdentifying' ? `ZeroOrOne;` : this.currentEdgeType === 'RelationalNonIdentifying' ? 'ZeroOrOne:ZeroOneOrMoreDashed' : this.currentEdgeType === 'RelationalManyToMany' ? 'ZeroOneOrMore:ZeroOneOrMore' : 'ZeroOneOrMoreDashed'
        )
        const relation = {
          objectClass: this.currentEdgeType === 'RelationalManyToMany' ? 'Datablau.LDM.RelationshipManyToMany' : 'Datablau.LDM.RelationshipRelational',
          properties: {
            ChildEntityRef: target.OwneeRef,
            // ChildKeyRef: targetForeignKey.properties.Id,
            EndCardinality: this.currentEdgeType === 'RelationalIdentifying' ? 'ZeroOrOne' : this.currentEdgeType === 'RelationalNonIdentifying' ? 'ZeroOneOrMore' : this.currentEdgeType === 'RelationalManyToMany' ? 'ZeroOneOrMore' : 'None',
            Id: this.emptyRelationNum,
            Label: 'ref',
            Name: `rs_${sourceTable.properties.Name}_${targetTable.properties.Name}_${this.emptyRelationNum}`,
            ParentEntityRef: source.OwneeRef,
            // ParentKeyRef: sourcePrimaryKey.properties.Id,
            RawType: this.currentEdgeType === 'RelationalIdentifying' ? 'Relationship' : this.currentEdgeType === 'RelationalNonIdentifying' ? 'Relationship' : this.currentEdgeType === 'RelationalManyToMany' ? 'RelationalManyToMany' : '',
            RelationalType: this.currentEdgeType === 'RelationalIdentifying' ? 'Identifying' : this.currentEdgeType === 'RelationalNonIdentifying' ? 'NonIdentifying' : this.currentEdgeType === 'RelationalManyToMany' ? 'ManyToMany' : '',
            StartCardinality: this.currentEdgeType === 'RelationalIdentifying' ? 'OneOnly' : this.currentEdgeType === 'RelationalNonIdentifying' ? 'ZeroOrOne' : this.currentEdgeType === 'RelationalManyToMany' ? 'ZeroOneOrMore' : 'None',
            TypeId: 80000007,
            UniqueId: uuidv4(),
            new: true
          }
        }
        relation.properties.ChildKeyRef = targetPrimaryKey.properties.Id
        relation.properties.ParentKeyRef = sourcePrimaryKey.properties.Id
        relation.properties.changed = true
        this.$set(this.dataByType.relation, this.emptyRelationNum, relation)
        changes.push(new Changes('insertRelation', {
          name: relation.properties.Name,
          now: _.cloneDeep(relation)
        }))
        let tempCurrentEdgeType = this.currentEdgeType
        let emptyEdgeNum = this.emptyEdgeNum
        let emptyRelationNum = this.emptyRelationNum
        setTimeout(() => {
          const connection = {
            objectClass: tempCurrentEdgeType === 'RelationalManyToMany' ? 'Datablau.ERD.ConnectionRelationalManyToMany' : 'Datablau.ERD.ConnectionRelational',
            properties: {
              BendPoints: edge.CurrentBendPoints,
              ChildShapeRef: edge.target.Id,
              EndOrientation: edge.EndOrientation,
              Id: emptyEdgeNum,
              Name: `Connection_${emptyEdgeNum}`,
              OwneeRef: emptyRelationNum,
              ParentShapeRef: edge.source.Id,
              RawType: 'Connection',
              StartOrientation: edge.StartOrientation,
              TypeId: 80000009,
              UniqueId: uuidv4(),
              new: true
            }
          }
          this.dataByType.diagram[this.currentId].children.push(connection)
          changes.push(new Changes('insertConnection', {
            name: relation.properties.Name,
            id: emptyEdgeNum
          }))
          edge.style = this.graph.drawEdgeShapeStyle(this.emptyEdgeNum)
          this.graph.graph.refresh(edge)
          this.emptyRelationNum++
          this.emptyEdgeNum++
        })

        // this.dataByType.diagram[this.currentId].children.splice(this.dataByType.diagram[this.currentId].children.length, 0, relation)
        edge.Id = this.emptyEdgeNum
        edge.new = true
        edge.OwneeRef = relation.properties.Id
        edge.endCardinalityType = this.currentEdgeType === 'RelationalIdentifying' ? 'ZeroOrOne' : this.currentEdgeType === 'RelationalNonIdentifying' ? 'ZeroOneOrMore' : this.currentEdgeType === 'RelationalManyToMany' ? 'None' : ''
        edge.type = this.currentEdgeType === 'RelationalIdentifying' ? 'Relational' : this.currentEdgeType === 'RelationalNonIdentifying' ? 'Relational' : this.currentEdgeType === 'RelationalManyToMany' ? 'ManyToMany' : ''
        edge.relationalType = this.currentEdgeType === 'RelationalIdentifying' ? 'Identifying' : this.currentEdgeType === 'RelationalNonIdentifying' ? 'NonIdentifying' : this.currentEdgeType === 'RelationalManyToMany' ? 'ManyToMany' : ''
        edge.deleteReal = true
        edge.targetOwneeRef = target.OwneeRef
        edge.sourceOwneeRef = source.OwneeRef
        edge.deleteColumn = true
        this.graph.vertex['edge' + edge.Id] = edge
        this.currentOperate = 'addEdge'
        setTimeout(() => {
          this.graph.graph.setCellsMovable(true)
        })
        this.currentEdgeType = null
        return
      }
      if (noneEdge ? (noneEdge.objectClass !== 'Datablau.LDM.RelationshipRelational' && noneEdge.objectClass !== 'Datablau.LDM.RelationshipSubtype') : false) { // 如果要传递关系，必须是主键关系或外键关系以及subtype关系才能传递
        return
      }

      let targetTablePrimaryKeyCurrentChanged = false // 原表主键本次传递是否被修改

      let isSameSourcePrimaryKey = true
      let hasSourcePrimaryKey = true
      let sourceTable = this.dataByType.table[source.OwneeRef]
      let targetTable = this.dataByType.table[target.OwneeRef]
      if (!targetTable && noneEdge?.objectClass === 'Datablau.LDM.RelationshipSubtype') { // subtype关系中的target为半圆，则不传递，但可能传递exclusive或者inclusive的中文名
        let subtypeCell = this.graph.graph.getDefaultParent().children.find(cell => cell.SubTypeRef === target.OwneeRef)
        let subtypeShape = this.diagram.children?.find(shape => !shape.properties.deleted && shape.objectClass === 'Datablau.ERD.ShapeSubtype' && shape.properties.SubTypeRef === target.OwneeRef)
        let change = new Changes('modifyShape', {
          id: subtypeShape.properties.Id,
          name: subtypeShape.properties.Name || `SubType_${subtypeShape.properties.Id}`,
          pre: _.cloneDeep(subtypeShape),
          now: _.cloneDeep(subtypeShape)
        })
        subtypeCell.value = this.graph.drawSubTypeShape(subtypeShape, true)
        // subtypeCell.style = this.graph.drawSubTypeStyle(subtypeCell) 未更改样式不需要更新style
        this.graph.graph.refresh(subtypeCell)
        this.currentEdgeType = null
        changes.push(change)
        return
      }
      if (!sourceTable) { // subtype关系中source为半圆，则按照第二种subtype关系传递， 根据source.ParentTableId属性是否存在来判断
        sourceTable = this.dataByType.table[source.ParentTableId]
      }
      if (!sourcePrimaryKey) {
        isSameSourcePrimaryKey = false
        hasSourcePrimaryKey = false
        sourcePrimaryKey = sourceTable.children && sourceTable.children.find(column => !column.properties.deleted && column.objectClass === 'Datablau.LDM.EntityKeyGroup' && column.properties.KeyGroupType === 'PrimaryKey')
      } else if (JSON.stringify(sourcePrimaryKey?.children) !== JSON.stringify(sourcePrimaryKeyPrevious?.children)) {
        isSameSourcePrimaryKey = false
      } else {
        // if (sourcePrimaryKey !== (sourceTable.children && sourceTable.children.find(column => column.objectClass === 'Datablau.LDM.EntityKeyGroup' && column.properties.KeyGroupType === 'PrimaryKey'))) {
        if (noneEdge.properties.ParentKeyRefBak && noneEdge.properties.ParentKeyRef !== noneEdge.properties.ParentKeyRefBak) {
          isSameSourcePrimaryKey = false
        }
      }

      // 在noneEdge=true的情况下（更新已有关系链）判断子表是否存在

      sourceTable.children && sourceTable.children.forEach(column => {
        if (column.objectClass === 'Datablau.LDM.EntityAttribute') {
          column.properties.changeName = false
        }
      })
      targetTable.children && targetTable.children.forEach(column => {
        if (column.objectClass === 'Datablau.LDM.EntityAttribute') {
          column.properties.conflictRetain = false
        }
      })
      let change = null
      let change1 = null
      let targetPrimaryKey = {}
      let targetForeignKey = {}
      let keyGroupList = targetTable.children && targetTable.children.filter(column => column.properties.TypeId === LDMTypes.KeyGroup)
      let keyId = 0
      if (keyGroupList && keyGroupList.length) {
        keyGroupList.forEach(k => {
          let name = k.properties.Name
          let temp = parseInt(name.slice(name.search(/\d+$/)))
          if (temp > keyId) {
            keyId = temp
          }
        })
      }
      keyId++
      let foreignKeyCopy = null
      let foreignKeyBak = null
      if (sourcePrimaryKey && !sourcePrimaryKey.properties.deleted) {
        // 把主键索引copy到子表的主键索引和外键索引
        if (!targetTable.children) {
          targetTable.children = []
        }
        if (!sourcePrimaryKey.children) {
          sourcePrimaryKey.children = []
        }
        let primaryKeyColumnIds = sourcePrimaryKey.children.map(member => member.properties.AttributeRef)
        targetPrimaryKey = targetTable.children && targetTable.children.find(column => !column.properties.deleted && column.objectClass === 'Datablau.LDM.EntityKeyGroup' && column.properties.KeyGroupType === 'PrimaryKey')
        const getNewName = (column, list1, list2, num) => {
          let name = column.properties.Name + (num || '')
          if (num === undefined) {
            num = 0
          }
          // if (list1.some(i => i.properties.Name === name)) {
          //   getNewName(column, list1, list2, num + 1)
          // } else
          if (list2.some(i => !i.properties.deleted && i.properties.Name === name && i.properties.Id !== column.properties.Id)) {
            getNewName(column, list1, list2, num + 1)
          } else {
            column.properties.Name += (num || '')
          }
        }
        const getNewLogicalName = (column, list1, list2, num) => {
          let name = column.properties.LogicalName + (num || '')
          if (num === undefined) {
            num = 0
          }
          if (list2.some(i => !i.properties.deleted && i.properties.LogicalName === name && i.properties.Id !== column.properties.Id)) {
            getNewLogicalName(column, list1, list2, num + 1)
          } else {
            column.properties.LogicalName += (num || '')
          }
        }
        if (this.currentEdgeType === 'RelationalIdentifying' || this.currentEdgeType === 'RelationalSubtype') { // 主键关系 或者 subtype关系
          if (sourcePrimaryKeyPrevious && sourcePrimaryKey?.properties.Id === sourcePrimaryKeyPrevious?.properties.Id) { // 修改父表主键关系，导致传递，比如(A,B) -> (A, C)，需删除B的字段和主外键，然后创建C的字段和主外键
            let columnDeleteIds = []
            let memberDeleteIds = []
            if (!sourcePrimaryKeyPrevious.children) {
              sourcePrimaryKeyPrevious.children = []
            }
            sourcePrimaryKeyPrevious.children.forEach(member => {
              let sameMember = sourcePrimaryKey.children.find(member2 => !member.properties.deleted && member2.properties.AttributeRef === member.properties.AttributeRef)
              if (!sameMember) {
                columnDeleteIds.push(member.properties.AttributeRef)
                memberDeleteIds.push(member.properties.Id)
              }
            })
            memberDeleteIds.forEach(id => {
              // 删除列
              let sourceMember = sourcePrimaryKeyPrevious.children?.find(member => !member.properties.deleted && member.properties.Id === id)
              let foreignKeyCopy = targetTable.children.find(column => !column.properties.deleted && column.properties.Id === noneEdge.properties.ChildKeyRef)
              let mapTargetColumn = targetTable.children.find(column => foreignKeyCopy?.children?.find(m => !m.properties.deleted && (m.properties.Reference === sourceMember.properties.Id))?.properties.AttributeRef === column.properties.Id)
              if (mapTargetColumn) {
                mapTargetColumn.properties.deleted = true
                changes.push(new Changes('deleteColumn', {
                  pId: targetTable.properties.Id,
                  pName: targetTable.properties.Name,
                  id: mapTargetColumn.properties.Id,
                  name: mapTargetColumn.properties.Name
                }))
              }
              // 修改主键
              let primaryKeCopy = targetTable.children.find(column => column.objectClass === 'Datablau.LDM.EntityKeyGroup' && column.properties.KeyGroupType === 'PrimaryKey')
              let change = new Changes('modifyIndex', {
                pId: targetTable.properties.Id,
                pName: targetTable.properties.Name,
                name: primaryKeCopy.properties.Name,
                pre: _.cloneDeep(primaryKeCopy),
                now: null
              })
              targetTablePrimaryKeyCurrentChanged = true
              if (primaryKeCopy.properties.KeyGroupMemberRefs) {
                let resultMemberIndex = primaryKeCopy.children.findIndex(member4 => !member4.properties.deleted && member4.properties.AttributeRef === mapTargetColumn?.properties.Id)
                let resultMember = primaryKeCopy.children[resultMemberIndex]
                if (resultMember) { // 主键有此member需要删除
                  // this.$set(resultMember.properties, 'deleted', true)
                  // resultMember.properties.hasDeleted = true
                  primaryKeCopy.children.splice(resultMemberIndex, 1)
                  primaryKeCopy.properties.KeyGroupMemberRefs.splice(primaryKeCopy.properties.KeyGroupMemberRefs.findIndex(item => item === resultMember.properties.Id), 1)
                  // mapTargetColumn.properties.Reference = null
                }
                primaryKeCopy.properties.changed = true
                change.obj.now = _.cloneDeep(primaryKeCopy)
                changes.push(change)
              }
            })
            memberDeleteIds.forEach(id => {
              // 修改外键
              let foreignKeyCopy = targetTable.children.find(column => !column.properties.deleted && column.properties.Id === noneEdge.properties.ChildKeyRef)
              let change = new Changes('modifyIndex', {
                pId: targetTable.properties.Id,
                pName: targetTable.properties.Name,
                name: foreignKeyCopy.properties.Name,
                pre: _.cloneDeep(foreignKeyCopy),
                now: null
              })
              foreignKeyCopy.properties.changed = true
              // let mapMember = foreignKeyCopy.children.find(member => member.properties.Reference === id)
              // mapMember.properties.deleted = true
              foreignKeyCopy.children = foreignKeyCopy.children?.filter(member => member.properties.Reference !== id)
              change.obj.now = _.cloneDeep(foreignKeyCopy)
              changes.push(change)
            })
          }
          if (targetPrimaryKey) { // 存在主键索引则修改相应主键索引
            change = new Changes('modifyIndex', {
              pId: targetTable.properties.Id,
              pName: targetTable.properties.Name,
              name: targetPrimaryKey.properties.Name,
              pre: _.cloneDeep(targetPrimaryKey),
              now: null
            })
            targetTablePrimaryKeyCurrentChanged = true
            targetPrimaryKey.properties.changed = true
            // 主键索引
            let primaryKeyCopy = _.cloneDeep(sourcePrimaryKey)
            // let foreignKeyCopy = null
            // let foreignKeyBak = null
            if (noneEdge) { // 修改外键索引
              foreignKeyCopy = targetTable.children.find(column => !column.properties.deleted && column.properties.Id === noneEdge.properties.ChildKeyRef)
              foreignKeyBak = _.cloneDeep(foreignKeyCopy)
              foreignKeyCopy.properties.changed = true
              change1 = new Changes('modifyIndex', {
                pId: targetTable.properties.Id,
                pName: targetTable.properties.Name,
                name: foreignKeyCopy.properties.Name,
                pre: _.cloneDeep(foreignKeyCopy),
                now: null
              })
              // 外键索引应该改变
              // let previousSourcePrimaryKey = sourceTable.children.find(column => column.properties.Id === noneEdge.properties.ParentKeyRef)
              // previousSourcePrimaryKey.children.forEach(targetForeignKeyMember => {
              //   if (targetForeignKeyMember.properties.deleted) {
              //     return
              //   }
              //   let mapTargetColumn = targetTable.children.find(column => column.properties.Reference === targetForeignKeyMember.properties.AttributeRef)
              //   if (!foreignKeyCopy.properties.KeyGroupMemberRefs) {
              //     return
              //   }
              //   let resultMember = foreignKeyCopy.children.find(member4 => !member4.properties.deleted && member4.properties.AttributeRef === mapTargetColumn.properties.Id)
              //   if (resultMember) { // 外键有此member需要删除
              //     this.$set(resultMember.properties, 'deleted', true)
              //     resultMember.properties.hasDeleted = true
              //     foreignKeyCopy.properties.KeyGroupMemberRefs.splice(foreignKeyCopy.properties.KeyGroupMemberRefs.findIndex(item => item === resultMember.properties.Id), 1)
              //     mapTargetColumn.properties.Reference = null
              //   } else {
              //     resultMember.properties.hasDeleted = false
              //   }
              // })
              foreignKeyCopy.properties.KeyGroupMemberRefs = []
              foreignKeyCopy.children = []
            } else {
              foreignKeyCopy = _.cloneDeep(sourcePrimaryKey)
              foreignKeyCopy.properties.KeyGroupMemberRefs = []
              foreignKeyCopy.children = []
            }
            let mapSourceColumns = primaryKeyCopy.children.map(m => m.properties.AttributeRef)
            for (let i = 0; i < primaryKeyCopy.children.length; i++) {
              let member = primaryKeyCopy.children[i]
              let primaryMember = sourcePrimaryKeyPrevious?.children.find(m => !m.properties.deleted && m.properties.AttributeRef === member.properties.AttributeRef)
              member.properties.Reference = member.properties.Id
              member.properties.Id = this.deliverNum.seed++
              member.properties.UniqueId = uuidv4()
              let conflictSourceColumn = null
              let conflictTargetColumn = null
              if (!targetPrimaryKey.children) {
                targetPrimaryKey.children = []
              }
              if (!targetPrimaryKey.properties.KeyGroupMemberRefs) {
                targetPrimaryKey.properties.KeyGroupMemberRefs = []
              }
              const sourceColumn = sourceTable.children.find(column => !column.properties.deleted && column.properties.Id === member.properties.AttributeRef)
              targetTable.children.forEach(targetColumn => {
                if (!targetColumn.properties.deleted && ((sourcePrimaryKeyPrevious && (sourcePrimaryKeyPrevious?.properties.Id !== sourcePrimaryKey?.properties.Id)) ? targetColumn.properties.Name === sourceColumn.properties.Name : noneEdge ? foreignKeyBak?.children?.find(m => !m.properties.deleted && (m.properties.Reference === (primaryMember ? primaryMember.properties.Id : member.properties.Id)))?.properties.AttributeRef === targetColumn.properties.Id : targetColumn.properties.Name === sourceColumn.properties.Name)) {
                  conflictSourceColumn = sourceColumn
                  conflictTargetColumn = targetColumn
                }
              })
              debugger
              if (conflictTargetColumn) { // 有冲突字段
                let createNewColumn = false
                try {
                  // if (isSameSourcePrimaryKey || sourcePrimaryKeyPrevious) {
                  if (this.isCircle(sourceTable, targetTable)) { // 非主键关系和主键关系形成环

                  } else if (sourcePrimaryKeyPrevious && (sourcePrimaryKey.properties.Id !== sourcePrimaryKeyPrevious?.properties.Id)) {
                    await this.$DatablauCofirm(`该${this.attributeName}[${conflictSourceColumn.properties.Name}]已经存在，是否新建${this.attributeName}？`, '提示', {
                      type: 'warning',
                      confirmButtonText: '是',
                      cancelButtonText: ' 否 ',
                      showClose: false,
                      closeOnClickModal: true
                    })
                  } else if (isSameSourcePrimaryKey || sourcePrimaryKeyPrevious?.children.map(m => m.properties.Id).includes(member.properties.Id)) { // 已传递过的字段，不需要新建
                    await Promise.reject(new Error('不新建' + this.attributeName))
                  // } else if (!noneEdge || hasSourcePrimaryKey) {
                  } else if (!noneEdge) { // 切换Parentkeyref或者新建关系(!noneEdge)弹是否创建字段提示框
                    await this.$DatablauCofirm(`该${this.attributeName}[${conflictSourceColumn.properties.Name}]已经存在，是否新建${this.attributeName}？`, '提示', {
                      type: 'warning',
                      confirmButtonText: '是',
                      cancelButtonText: ' 否 ',
                      showClose: false,
                      closeOnClickModal: true
                    })
                  } else if (noneEdge) {
                    await Promise.reject(new Error('不新建' + this.attributeName))
                  }
                  createNewColumn = true
                  targetPrimaryKey.children.push(member)
                  targetPrimaryKey.properties.KeyGroupMemberRefs.push(member.properties.Id)
                  targetPrimaryKey.properties.changed = true
                  conflictSourceColumn && (conflictSourceColumn.properties.changeName = true)
                  let memberCopy = _.cloneDeep(member)
                  memberCopy.properties.Reference = member.properties.Reference
                  memberCopy.properties.Id = this.deliverNum.seed++
                  memberCopy.properties.UniqueId = uuidv4()
                  memberCopy.properties.new = true
                  foreignKeyCopy.properties.KeyGroupMemberRefs.push(memberCopy.properties.Id)
                  foreignKeyCopy.children.push(memberCopy)
                  conflictSourceColumn && (conflictSourceColumn.properties.nocopy = false)
                } catch (e) {
                  if (!createNewColumn) { // 点取消, 为同名字段添加主外键索引
                    let change = new Changes('modifyColumn', {
                      pId: targetTable.properties.Id,
                      pName: targetTable.properties.Name,
                      name: conflictTargetColumn.properties.Name,
                      pre: _.cloneDeep(conflictTargetColumn)
                    })
                    let conflictMember = targetPrimaryKey.children.find(targetMember => {
                      const targetColumn = targetTable.children.find(column => !column.properties.deleted && column.properties.Id === targetMember.properties.AttributeRef)
                      const sourceColumn = sourceTable.children.find(column => !column.properties.deleted && column.properties.Id === member.properties.AttributeRef)
                      if (targetColumn && sourceColumn && ((sourcePrimaryKeyPrevious && (sourcePrimaryKeyPrevious?.properties.Id !== sourcePrimaryKey?.properties.Id)) ? targetColumn.properties.Name === sourceColumn.properties.Name : noneEdge ? foreignKeyBak?.children?.find(m => !m.properties.deleted && (m.properties.Reference === (primaryMember ? primaryMember.properties.Id : member.properties.Id)))?.properties.AttributeRef === targetColumn.properties.Id : targetColumn.properties.Name === sourceColumn.properties.Name)) {
                        return true
                      } else {
                        return false
                      }
                    })
                    if (conflictMember) { // 该字段为主键，添加外键索引
                      conflictMember.properties.retain = true
                      if (conflictMember.properties.hasDeleted) {
                        this.$set(conflictMember.properties, 'deleted', false)
                        conflictMember.properties.hasDeleted = false
                      }
                      let memberCopy = _.cloneDeep(conflictMember)
                      memberCopy.properties.Reference = member.properties.Reference
                      memberCopy.properties.Id = this.deliverNum.seed++
                      memberCopy.properties.UniqueId = uuidv4()
                      memberCopy.properties.new = true
                      foreignKeyCopy.properties.KeyGroupMemberRefs.push(memberCopy.properties.Id)
                      foreignKeyCopy.children.push(memberCopy)
                      // primaryKeyColumnIds.splice(primaryKeyColumnIds.findIndex(id => id === member.properties.AttributeRef), 1) // 标志是否创建column
                      conflictTargetColumn.properties.conflictRetain = true
                      targetPrimaryKey.properties.changed = true
                    } else { // 不是主键，添加主键索引和外键索引
                      member.properties.AttributeRef = conflictTargetColumn.properties.Id
                      targetPrimaryKey.children.push(member)
                      targetPrimaryKey.properties.KeyGroupMemberRefs.push(member.properties.Id)
                      change.obj.now = _.cloneDeep(targetPrimaryKey)
                      // targetPrimaryKey.properties.changed = true
                      conflictMember = member
                      let memberCopy = _.cloneDeep(conflictMember)
                      memberCopy.properties.Reference = conflictMember.properties.Reference
                      memberCopy.properties.Id = this.deliverNum.seed++
                      memberCopy.properties.UniqueId = uuidv4()
                      memberCopy.properties.new = true
                      foreignKeyCopy.properties.KeyGroupMemberRefs.push(memberCopy.properties.Id)
                      foreignKeyCopy.children.push(memberCopy)
                      // primaryKeyColumnIds.splice(primaryKeyColumnIds.findIndex(id => id === member.properties.AttributeRef), 1)
                      conflictTargetColumn.properties.conflictRetain = true
                    }
                    conflictSourceColumn && (conflictSourceColumn.properties.nocopy = true)
                    if ((conflictTargetColumn.properties.Reference !== conflictSourceColumn.properties.Id || conflictTargetColumn.properties.Name !== conflictSourceColumn.properties.Name || conflictTargetColumn.properties.LogicalName !== conflictSourceColumn.properties.LogicalName || conflictTargetColumn.properties.DataType !== conflictSourceColumn.properties.DataType || conflictTargetColumn.properties.DataStandardRef !== conflictSourceColumn.properties.DataStandardRef || conflictTargetColumn.properties.Definition !== conflictSourceColumn.properties.Definition)) {
                      if (sourceDeliverColumnIds && !sourceDeliverColumnIds.includes(mapSourceColumns[i])) { // 只传递需要修改的字段
                        continue
                      }
                      conflictTargetColumn.properties.Reference = conflictSourceColumn.properties.Id
                      conflictTargetColumn.properties.Name = conflictSourceColumn.properties.Name
                      conflictTargetColumn.properties.LogicalName = conflictSourceColumn.properties.LogicalName
                      conflictTargetColumn.properties.DataType = conflictSourceColumn.properties.DataType
                      conflictTargetColumn.properties.DataStandardRef = conflictSourceColumn.properties.DataStandardRef
                      conflictTargetColumn.properties.Definition = conflictSourceColumn.properties.Definition
                      conflictTargetColumn.properties.changed = true
                      change.obj.name = conflictTargetColumn.properties.Name
                      change.obj.now = _.cloneDeep(conflictTargetColumn)
                      changes.push(change)
                    }
                  }
                }
              } else {
                targetPrimaryKey.children.push(member)
                member.properties.Id = this.deliverNum.seed++
                member.properties.UniqueId = uuidv4()
                member.properties.new = true
                targetPrimaryKey.properties.KeyGroupMemberRefs.push(member.properties.Id)
                let memberCopy = _.cloneDeep(member)
                memberCopy.properties.Reference = member.properties.Reference
                memberCopy.properties.Id = this.deliverNum.seed++
                memberCopy.properties.UniqueId = uuidv4()
                foreignKeyCopy.properties.KeyGroupMemberRefs.push(memberCopy.properties.Id)
                foreignKeyCopy.children.push(memberCopy)
                targetPrimaryKey.properties.changed = true
              }
            }
            if (!noneEdge) {
              foreignKeyCopy.properties.Id = this.deliverNum.seed++
              foreignKeyCopy.properties.UniqueId = uuidv4()
              foreignKeyCopy.properties.new = true
              foreignKeyCopy.properties.Macro = this.dataByType.namingOption.FKDefaultMacro
              // foreignKeyCopy.properties.Macro = foreignKeyCopy.properties.Macro.replace(/pk/, 'fk')
              foreignKeyCopy.properties.Macro = this.dataByType.namingOption.FKDefaultMacro
              foreignKeyCopy.properties.Name = this.getIndexNameNamingMap(foreignKeyCopy.properties.Macro, targetTable.properties.Name, keyId++)
              foreignKeyCopy.properties.KeyGroupType = 'ForeignKey'
              targetTable.children.push(foreignKeyCopy)
            }
            targetForeignKey = foreignKeyCopy
          } else { // 不存在主键索引创建主键索引 和 外键索引
            // 主键索引
            let primaryKeyCopy = _.cloneDeep(sourcePrimaryKey)
            targetPrimaryKey = _.cloneDeep(sourcePrimaryKey)
            targetPrimaryKey.properties.Id = this.deliverNum.seed++
            targetPrimaryKey.properties.UniqueId = uuidv4()
            targetPrimaryKey.properties.new = true
            targetPrimaryKey.children = []
            targetPrimaryKey.properties.KeyGroupMemberRefs = []
            targetPrimaryKey.properties.Name = this.getIndexNameNamingMap(this.dataByType.namingOption.PKDefaultMacro, targetTable.properties.Name, keyId++)
            change = new Changes('insertIndex', {
              pId: target.OwneeRef,
              pName: targetTable.properties.Name,
              name: targetPrimaryKey.properties.Name,
              // pre: _.cloneDeep(targetPrimaryKey),
              now: null
            })
            targetTablePrimaryKeyCurrentChanged = true
            // 外键索引
            // let foreignKeyCopy = null
            // let foreignKeyBak = null
            if (noneEdge) { // 修改外键索引
              foreignKeyCopy = targetTable.children.find(column => !column.properties.deleted && column.properties.Id === noneEdge.properties.ChildKeyRef)
              foreignKeyBak = _.cloneDeep(foreignKeyCopy)
              foreignKeyCopy.properties.changed = true
              change1 = new Changes('modifyIndex', {
                pId: targetTable.properties.Id,
                pName: targetTable.properties.Name,
                name: foreignKeyCopy.properties.Name,
                pre: _.cloneDeep(foreignKeyCopy),
                now: null
              })
              // 外键索引应该改变
              // let previousSourcePrimaryKey = sourceTable.children.find(column => column.properties.Id === noneEdge.properties.ParentKeyRef)
              // previousSourcePrimaryKey.children.forEach(targetForeignKeyMember => {
              //   if (targetForeignKeyMember.properties.deleted) {
              //     return
              //   }
              //   let mapTargetColumn = targetTable.children.find(column => column.properties.Reference === targetForeignKeyMember.properties.AttributeRef)
              //   if (!foreignKeyCopy.properties.KeyGroupMemberRefs) {
              //     return
              //   }
              //   let resultMember = foreignKeyCopy.children.find(member4 => !member4.properties.deleted && member4.properties.AttributeRef === mapTargetColumn.properties.Id)
              //   if (resultMember) { // 主键有此member删除
              //     this.$set(resultMember.properties, 'deleted', true)
              //     resultMember.properties.hasDeleted = true
              //     foreignKeyCopy.properties.KeyGroupMemberRefs.splice(foreignKeyCopy.properties.KeyGroupMemberRefs.findIndex(item => item === resultMember.properties.Id), 1)
              //     mapTargetColumn.properties.Reference = null
              //   } else {
              //     resultMember.properties.hasDeleted = false
              //   }
              // })
              foreignKeyCopy.properties.KeyGroupMemberRefs = []
              foreignKeyCopy.children = []
            } else {
              foreignKeyCopy = _.cloneDeep(sourcePrimaryKey)
              foreignKeyCopy.properties.KeyGroupMemberRefs = []
              foreignKeyCopy.children = []
            }

            foreignKeyCopy.properties.KeyGroupMemberRefs = []
            foreignKeyCopy.children = []
            primaryKeyCopy.properties.Macro = this.dataByType.namingOption.PKDefaultMacro
            primaryKeyCopy.properties.Id = this.deliverNum.seed++
            primaryKeyCopy.properties.UniqueId = uuidv4()
            primaryKeyCopy.properties.new = true
            // primaryKeyCopy.properties.Name = primaryKeyCopy.properties.Macro.replace(/%owner%/, targetTable.properties.Name).replace(/%keyid%/, keyId++)
            primaryKeyCopy.properties.Name = this.getIndexNameNamingMap(primaryKeyCopy.properties.Macro, targetTable.properties.Name, keyId++)
            primaryKeyCopy.properties.KeyGroupMemberRefs = []
            let mapSourceColumns = primaryKeyCopy.children.map(m => m.properties.AttributeRef)
            for (let i = 0; i < primaryKeyCopy.children.length; i++) {
              let member = primaryKeyCopy.children[i]
              let primaryMember = sourcePrimaryKeyPrevious?.children.find(m => !m.properties.deleted && m.properties.AttributeRef === member.properties.AttributeRef)
              member.properties.Reference = member.properties.Id
              member.properties.Id = this.deliverNum.seed++
              member.properties.UniqueId = uuidv4()
              member.properties.new = true
              let conflictSourceColumn = null
              let conflictTargetColumn = null
              const sourceColumn = sourceTable.children.find(column => !column.properties.deleted && column.properties.Id === member.properties.AttributeRef)
              targetTable.children.forEach(targetColumn => {
                if (!targetColumn.properties.deleted && ((sourcePrimaryKeyPrevious && (sourcePrimaryKeyPrevious?.properties.Id !== sourcePrimaryKey?.properties.Id)) ? targetColumn.properties.Name === sourceColumn.properties.Name : noneEdge ? foreignKeyBak?.children?.find(m => !m.properties.deleted && (m.properties.Reference === (primaryMember ? primaryMember.properties.Id : member.properties.Id)))?.properties.AttributeRef === targetColumn.properties.Id : targetColumn.properties.Name === sourceColumn.properties.Name)) {
                  conflictSourceColumn = sourceColumn
                  conflictTargetColumn = targetColumn
                }
              })
              if (conflictTargetColumn) {
                let createNewColumn = false
                try {
                  // if (isSameSourcePrimaryKey || sourcePrimaryKeyPrevious) {
                  if (this.isCircle(sourceTable, targetTable)) { // 非主键关系和主键关系形成环

                  } else if (sourcePrimaryKeyPrevious && (sourcePrimaryKey.properties.Id !== sourcePrimaryKeyPrevious?.properties.Id)) {
                    await this.$DatablauCofirm(`该${this.attributeName}[${conflictSourceColumn.properties.Name}]已经存在，是否新建${this.attributeName}？`, '提示', {
                      type: 'warning',
                      confirmButtonText: '是',
                      cancelButtonText: ' 否 ',
                      showClose: false,
                      closeOnClickModal: true
                    })
                  } else if (isSameSourcePrimaryKey || sourcePrimaryKeyPrevious?.children.map(m => m.properties.Id).includes(member.properties.Id)) {
                    await Promise.reject(new Error('不新建' + this.attributeName))
                  // } else if (!noneEdge || hasSourcePrimaryKey) {
                  } else if (!noneEdge) {
                    await this.$DatablauCofirm(`该${this.attributeName}[${conflictSourceColumn.properties.Name}]已经存在，是否新建${this.attributeName}？`, '提示', {
                      type: 'warning',
                      confirmButtonText: '是',
                      cancelButtonText: ' 否 ',
                      showClose: false,
                      closeOnClickModal: true
                    })
                  } else if (noneEdge) {
                    await Promise.reject(new Error('不新建' + this.attributeName))
                  }
                  createNewColumn = true
                  targetPrimaryKey.children.push(member)
                  targetPrimaryKey.properties.KeyGroupMemberRefs.push(member.properties.Id)
                  conflictSourceColumn && (conflictSourceColumn.properties.changeName = true)
                  let memberCopy = _.cloneDeep(member)
                  memberCopy.properties.Reference = member.properties.Reference
                  memberCopy.properties.Id = this.deliverNum.seed++
                  memberCopy.properties.UniqueId = uuidv4()
                  memberCopy.properties.new = true
                  foreignKeyCopy.properties.KeyGroupMemberRefs.push(memberCopy.properties.Id)
                  foreignKeyCopy.children.push(memberCopy)
                  conflictSourceColumn && (conflictSourceColumn.properties.nocopy = false)
                } catch (e) {
                  if (!createNewColumn) { // 点取消, 为同名字段添加主外键索引
                    let change = new Changes('modifyColumn', {
                      pId: targetTable.properties.Id,
                      pName: targetTable.properties.Name,
                      name: conflictTargetColumn.properties.Name,
                      pre: _.cloneDeep(conflictTargetColumn)
                    })
                    let conflictMember = targetPrimaryKey.children.find(targetMember => {
                      const targetColumn = targetTable.children.find(column => !column.properties.deleted && column.properties.Id === targetMember.properties.AttributeRef)
                      const sourceColumn = sourceTable.children.find(column => !column.properties.deleted && column.properties.Id === member.properties.AttributeRef)
                      if (targetColumn && sourceColumn && ((sourcePrimaryKeyPrevious && (sourcePrimaryKeyPrevious?.properties.Id !== sourcePrimaryKey?.properties.Id)) ? targetColumn.properties.Name === sourceColumn.properties.Name : noneEdge ? foreignKeyBak?.children?.find(m => !m.properties.deleted && (m.properties.Reference === (primaryMember ? primaryMember.properties.Id : member.properties.Id)))?.properties.AttributeRef === targetColumn.properties.Id : targetColumn.properties.Name === sourceColumn.properties.Name)) {
                        return true
                      } else {
                        return false
                      }
                    })
                    if (conflictMember) { // 该字段为主键，添加外键索引
                      conflictMember.properties.retain = true
                      let memberCopy = _.cloneDeep(conflictMember)
                      memberCopy.properties.Reference = member.properties.Reference
                      memberCopy.properties.Id = this.deliverNum.seed++
                      memberCopy.properties.UniqueId = uuidv4()
                      memberCopy.properties.new = true
                      foreignKeyCopy.properties.KeyGroupMemberRefs.push(memberCopy.properties.Id)
                      foreignKeyCopy.children.push(memberCopy)
                      // primaryKeyColumnIds.splice(primaryKeyColumnIds.findIndex(id => id === member.properties.AttributeRef), 1) // 标志是否创建column
                      conflictTargetColumn.properties.conflictRetain = true
                      targetPrimaryKey.properties.changed = true
                    } else { // 不是主键，添加主键索引和外键索引
                      member.properties.AttributeRef = conflictTargetColumn.properties.Id
                      targetPrimaryKey.children.push(member)
                      targetPrimaryKey.properties.KeyGroupMemberRefs.push(member.properties.Id)
                      conflictMember = member
                      let memberCopy = _.cloneDeep(conflictMember)
                      memberCopy.properties.Reference = conflictMember.properties.Reference
                      memberCopy.properties.Id = this.deliverNum.seed++
                      memberCopy.properties.UniqueId = uuidv4()
                      memberCopy.properties.new = true
                      foreignKeyCopy.properties.KeyGroupMemberRefs.push(memberCopy.properties.Id)
                      foreignKeyCopy.children.push(memberCopy)
                      // primaryKeyColumnIds.splice(primaryKeyColumnIds.findIndex(id => id === member.properties.AttributeRef), 1)
                      conflictTargetColumn.properties.conflictRetain = true
                      targetPrimaryKey.properties.Id = this.deliverNum.seed++
                      targetPrimaryKey.properties.UniqueId = uuidv4()
                      targetPrimaryKey.properties.new = true
                    }
                    conflictSourceColumn && (conflictSourceColumn.properties.nocopy = true)
                    if ((conflictTargetColumn.properties.Reference !== conflictSourceColumn.properties.Id || conflictTargetColumn.properties.Name !== conflictSourceColumn.properties.Name || conflictTargetColumn.properties.LogicalName !== conflictSourceColumn.properties.LogicalName || conflictTargetColumn.properties.DataType !== conflictSourceColumn.properties.DataType || conflictTargetColumn.properties.DataStandardRef !== conflictSourceColumn.properties.DataStandardRef || conflictTargetColumn.properties.Definition !== conflictSourceColumn.properties.Definition)) {
                      if (sourceDeliverColumnIds && !sourceDeliverColumnIds.includes(mapSourceColumns[i])) { // 只传递需要修改的字段
                        continue
                      }
                      conflictTargetColumn.properties.Reference = conflictSourceColumn.properties.Id
                      conflictTargetColumn.properties.Name = conflictSourceColumn.properties.Name
                      conflictTargetColumn.properties.LogicalName = conflictSourceColumn.properties.LogicalName
                      conflictTargetColumn.properties.DataType = conflictSourceColumn.properties.DataType
                      conflictTargetColumn.properties.DataStandardRef = conflictSourceColumn.properties.DataStandardRef
                      conflictTargetColumn.properties.Definition = conflictSourceColumn.properties.Definition
                      conflictTargetColumn.properties.changed = true
                      change.obj.name = conflictTargetColumn.properties.Name
                      change.obj.now = _.cloneDeep(conflictTargetColumn)
                      changes.push(change)
                    }
                  }
                }
              } else {
                targetPrimaryKey.children.push(member)
                member.properties.Id = this.deliverNum.seed++
                member.properties.UniqueId = uuidv4()
                member.properties.new = true
                targetPrimaryKey.properties.KeyGroupMemberRefs.push(member.properties.Id)
                targetPrimaryKey.properties.Id = this.deliverNum.seed++
                targetPrimaryKey.properties.UniqueId = uuidv4()
                targetPrimaryKey.properties.new = true
                let memberCopy = _.cloneDeep(member)
                memberCopy.properties.Reference = member.properties.Reference
                memberCopy.properties.Id = this.deliverNum.seed++
                memberCopy.properties.UniqueId = uuidv4()
                memberCopy.properties.new = true
                foreignKeyCopy.properties.KeyGroupMemberRefs.push(memberCopy.properties.Id)
                foreignKeyCopy.children.push(memberCopy)
              }
            }
            targetTable.children.push(targetPrimaryKey)
            if (!noneEdge) {
              foreignKeyCopy.properties.Id = this.deliverNum.seed++
              foreignKeyCopy.properties.UniqueId = uuidv4()
              foreignKeyCopy.properties.new = true
              foreignKeyCopy.properties.Macro = this.dataByType.namingOption.FKDefaultMacro
              foreignKeyCopy.properties.Macro = foreignKeyCopy.properties.Macro.replace(/pk/, 'fk')
              // foreignKeyCopy.properties.Name = foreignKeyCopy.properties.Macro.replace(/%owner%/, targetTable.properties.Name).replace(/%keyid%/, keyId++)
              foreignKeyCopy.properties.Name = this.getIndexNameNamingMap(foreignKeyCopy.properties.Macro, targetTable.properties.Name, keyId++)
              foreignKeyCopy.properties.KeyGroupType = 'ForeignKey'
              targetTable.children.push(foreignKeyCopy)
            }
            targetForeignKey = foreignKeyCopy
          }
        } else if (this.currentEdgeType === 'RelationalNonIdentifying') {
          // 添加外键索引
          debugger
          if (sourcePrimaryKeyPrevious && sourcePrimaryKey?.properties.Id === sourcePrimaryKeyPrevious?.properties.Id) { // 修改父表主键关系，导致传递，比如(A,B) -> (A, C)，需删除B的字段和外键，然后创建C的字段和外键
            let columnDeleteIds = []
            let memberDeleteIds = []
            if (!sourcePrimaryKeyPrevious.children) {
              sourcePrimaryKeyPrevious.children = []
            }
            sourcePrimaryKeyPrevious.children.forEach(member => {
              let sameMember = sourcePrimaryKey.children.find(member2 => !member.properties.deleted && member2.properties.AttributeRef === member.properties.AttributeRef)
              if (!sameMember) {
                columnDeleteIds.push(member.properties.AttributeRef)
                memberDeleteIds.push(member.properties.Id)
              }
            })
            memberDeleteIds.forEach(id => {
              // 删除列
              let sourceMember = sourcePrimaryKeyPrevious.children?.find(member => !member.properties.deleted && member.properties.Id === id)
              let foreignKeyCopy = targetTable.children.find(column => !column.properties.deleted && column.properties.Id === noneEdge.properties.ChildKeyRef)
              let mapTargetColumn = targetTable.children.find(column => foreignKeyCopy?.children?.find(m => !m.properties.deleted && (m.properties.Reference === sourceMember.properties.Id))?.properties.AttributeRef === column.properties.Id)
              if (mapTargetColumn) {
                mapTargetColumn.properties.deleted = true
                changes.push(new Changes('deleteColumn', {
                  pId: targetTable.properties.Id,
                  pName: targetTable.properties.Name,
                  id: mapTargetColumn.properties.Id,
                  name: mapTargetColumn.properties.Name
                }))
                // 如果子表主键存在该字段，需要删除主键中的member
                debugger
                let targetPrimaryKey = targetTable.children.find(column => !column.properties.deleted && column.properties.KeyGroupType === 'PrimaryKey')
                if (targetPrimaryKey) {
                  let change = new Changes('modifyIndex', {
                    pId: targetTable.properties.Id,
                    pName: targetTable.properties.Name,
                    name: targetPrimaryKey.properties.Name,
                    pre: _.cloneDeep(targetPrimaryKey),
                    now: null
                  })
                  targetTablePrimaryKeyCurrentChanged = true
                  targetPrimaryKey.properties.changed = true
                  // let mapMember = foreignKeyCopy.children.find(member => member.properties.Reference === id)
                  // mapMember.properties.deleted = true
                  targetPrimaryKey.children = targetPrimaryKey.children?.filter(member => member.properties.AttributeRef !== mapTargetColumn.properties.Id)
                  change.obj.now = _.cloneDeep(targetPrimaryKey)
                  changes.push(change)
                }
              }
            })
            memberDeleteIds.forEach(id => {
              // 修改外键
              let foreignKeyCopy = targetTable.children.find(column => !column.properties.deleted && column.properties.Id === noneEdge.properties.ChildKeyRef)
              let change = new Changes('modifyIndex', {
                pId: targetTable.properties.Id,
                pName: targetTable.properties.Name,
                name: foreignKeyCopy.properties.Name,
                pre: _.cloneDeep(foreignKeyCopy),
                now: null
              })
              foreignKeyCopy.properties.changed = true
              // let mapMember = foreignKeyCopy.children.find(member => member.properties.Reference === id)
              // mapMember.properties.deleted = true
              foreignKeyCopy.children = foreignKeyCopy.children?.filter(member => member.properties.Reference !== id)
              change.obj.now = _.cloneDeep(foreignKeyCopy)
              changes.push(change)
            })
          }

          // let foreignKeyCopy = null
          // let foreignKeyBak = null
          if (noneEdge) { // 修改外键索引
            foreignKeyCopy = targetTable.children.find(column => !column.properties.deleted && column.properties.Id === noneEdge.properties.ChildKeyRef)
            foreignKeyBak = _.cloneDeep(foreignKeyCopy)
            foreignKeyCopy.properties.changed = true
            change1 = new Changes('modifyIndex', {
              pId: targetTable.properties.Id,
              pName: targetTable.properties.Name,
              name: foreignKeyCopy.properties.Name,
              pre: _.cloneDeep(foreignKeyCopy),
              now: null
            })
            // 外键索引应该改变
            // let previousSourcePrimaryKey = sourceTable.children.find(column => column.properties.Id === noneEdge.properties.ParentKeyRef)
            // previousSourcePrimaryKey.children.forEach(targetForeignKeyMember => {
            //   if (targetForeignKeyMember.properties.deleted) {
            //     return
            //   }
            //   let mapTargetColumn = targetTable.children.find(column => column.properties.Reference === targetForeignKeyMember.properties.AttributeRef)
            //   if (!foreignKeyCopy.properties.KeyGroupMemberRefs) {
            //     return
            //   }
            //   let resultMember = foreignKeyCopy.children.find(member4 => !member4.properties.deleted && member4.properties.AttributeRef === mapTargetColumn.properties.Id)
            //   if (resultMember) { // 主键有此member删除
            //     this.$set(resultMember.properties, 'deleted', true)
            //     resultMember.properties.hasDeleted = true
            //     foreignKeyCopy.properties.KeyGroupMemberRefs.splice(foreignKeyCopy.properties.KeyGroupMemberRefs.findIndex(item => item === resultMember.properties.Id), 1)
            //     mapTargetColumn.properties.Reference = null
            //   } else {
            //     resultMember.properties.hasDeleted = false
            //   }
            // })
            foreignKeyCopy.properties.KeyGroupMemberRefs = []
            foreignKeyCopy.children = []
          } else {
            foreignKeyCopy = _.cloneDeep(sourcePrimaryKey)
            foreignKeyCopy.properties.Macro = this.dataByType.namingOption.FKDefaultMacro
            foreignKeyCopy.properties.Id = this.deliverNum.seed++
            foreignKeyCopy.properties.UniqueId = uuidv4()
            foreignKeyCopy.properties.new = true
            foreignKeyCopy.properties.Macro = foreignKeyCopy.properties.Macro.replace(/pk/, 'fk')
            // foreignKeyCopy.properties.Name = foreignKeyCopy.properties.Macro.replace(/%owner%/, targetTable.properties.Name).replace(/%keyid%/, keyId++)
            foreignKeyCopy.properties.Name = this.getIndexNameNamingMap(foreignKeyCopy.properties.Macro, targetTable.properties.Name, keyId++)
            foreignKeyCopy.properties.KeyGroupType = 'ForeignKey'
            foreignKeyCopy.properties.KeyGroupMemberRefs = []
            foreignKeyCopy.children = []
          }
          let primaryKeyCopy = _.cloneDeep(sourcePrimaryKey)
          let mapSourceColumns = primaryKeyCopy.children.map(m => m.properties.AttributeRef)

          let createNewColumnArr = []
          let conflictSourceColumnArr = []
          let conflictTargetColumnArr = []

          for (let i = 0; i < primaryKeyCopy.children.length; i++) {
            let member = primaryKeyCopy.children[i]
            let primaryMember = sourcePrimaryKeyPrevious?.children.find(m => !m.properties.deleted && m.properties.AttributeRef === member.properties.AttributeRef)
            member.properties.Reference = member.properties.Id
            member.properties.Id = this.deliverNum.seed++
            member.properties.UniqueId = uuidv4()
            let conflictSourceColumn = null
            let conflictTargetColumn = null
            const sourceColumn = sourceTable.children.find(column => !column.properties.deleted && column.properties.Id === member.properties.AttributeRef)
            targetTable.children.forEach(targetColumn => {
              if (!targetColumn.properties.deleted && ((sourcePrimaryKeyPrevious && (sourcePrimaryKeyPrevious?.properties.Id !== sourcePrimaryKey?.properties.Id)) ? targetColumn.properties.Name === sourceColumn.properties.Name : noneEdge ? foreignKeyBak?.children?.find(m => !m.properties.deleted && (m.properties.Reference === (primaryMember ? primaryMember.properties.Id : member.properties.Id)))?.properties.AttributeRef === targetColumn.properties.Id : targetColumn.properties.Name === sourceColumn.properties.Name)) {
                conflictSourceColumn = sourceColumn
                conflictTargetColumn = targetColumn
              }
            })
            conflictSourceColumnArr.push(conflictSourceColumn)
            conflictTargetColumnArr.push(conflictTargetColumn)
            let createNewColumn = false
            if (conflictTargetColumn) {
              try {
                // if (isSameSourcePrimaryKey || sourcePrimaryKeyPrevious) {
                // if (this.isCircle(sourceTable, targetTable)) { // 非主键关系和主键关系形成环
                //   await Promise.reject(new Error('不新建' + this.attributeName))
                // } else
                if (this.isCircle(sourceTable, targetTable) && !noneEdge) { // 必须是新建关系并将要成环的情况下
                  await Promise.resolve('新建字段')
                } else if (sourcePrimaryKeyPrevious && (sourcePrimaryKey.properties.Id !== sourcePrimaryKeyPrevious?.properties.Id)) {
                  await this.$DatablauCofirm(`该${this.attributeName}[${conflictSourceColumn.properties.Name}]已经存在，是否新建${this.attributeName}？`, '提示', {
                    type: 'warning',
                    confirmButtonText: '是',
                    cancelButtonText: ' 否 ',
                    showClose: false,
                    closeOnClickModal: true
                  })
                } else if (isSameSourcePrimaryKey || sourcePrimaryKeyPrevious?.children.map(m => m.properties.Id).includes(member.properties.Id)) {
                  await Promise.reject(new Error('不新建' + this.attributeName))
                // } else if (!noneEdge || hasSourcePrimaryKey) {
                } else if (!noneEdge) {
                  await this.$DatablauCofirm(`该${this.attributeName}[${conflictSourceColumn.properties.Name}]已经存在，是否新建${this.attributeName}？`, '提示', {
                    type: 'warning',
                    confirmButtonText: '是',
                    cancelButtonText: ' 否 ',
                    showClose: false,
                    closeOnClickModal: true
                  })
                } else if (noneEdge) {
                  await Promise.reject(new Error('不新建' + this.attributeName))
                }
                createNewColumn = true
                createNewColumnArr.push(createNewColumn)
                // if (noneEdge) {
                //   let resultMember = targetPrimaryKey?.children?.find(member => member.properties.AttributeRef === conflictTargetColumn.properties.Id)
                //   if (resultMember && resultMember.properties.hasDeleted) {
                //     this.$set(resultMember.properties, 'deleted', false)
                //   }
                //   conflictSourceColumn.properties.changeName = true
                //   let memberCopy = _.cloneDeep(member)
                //   memberCopy.properties.Reference = member.properties.Reference
                //   memberCopy.properties.Id = this.deliverNum.seed++
                //   memberCopy.properties.new = true
                //   foreignKeyCopy.properties.KeyGroupMemberRefs.push(memberCopy.properties.Id)
                //   foreignKeyCopy.children.push(memberCopy)
                //   conflictSourceColumn.properties.nocopy = false
                // }
              } catch (e) {
                if (!createNewColumn) { // 点取消, 为同名字段添加外键索引
                  createNewColumnArr.push(createNewColumn)
                  // if (noneEdge) {
                  //   let change = new Changes('modifyColumn', {
                  //     pId: targetTable.properties.Id,
                  //     pName: targetTable.properties.Name,
                  //     name: conflictTargetColumn.properties.Name,
                  //     pre: _.cloneDeep(conflictTargetColumn)
                  //   })
                  //   let memberCopy = _.cloneDeep(member)
                  //   memberCopy.properties.Reference = member.properties.Reference
                  //   memberCopy.properties.Id = this.deliverNum.seed++
                  //   memberCopy.properties.new = true
                  //   foreignKeyCopy.properties.KeyGroupMemberRefs.push(memberCopy.properties.Id)
                  //   foreignKeyCopy.children.push(memberCopy)
                  //   // primaryKeyColumnIds.splice(primaryKeyColumnIds.findIndex(id => id === member.properties.AttributeRef), 1)
                  //   conflictTargetColumn.properties.conflictRetain = true
                  //   conflictSourceColumn.properties.changeName = true
                  //   conflictSourceColumn.properties.nocopy = true
                  //   if ((conflictTargetColumn.properties.Reference !== conflictSourceColumn.properties.Id || conflictTargetColumn.properties.Name !== conflictSourceColumn.properties.Name || conflictTargetColumn.properties.LogicalName !== conflictSourceColumn.properties.LogicalName || conflictTargetColumn.properties.DataType !== conflictSourceColumn.properties.DataType || conflictTargetColumn.properties.DataStandardRef !== conflictSourceColumn.properties.DataStandardRef || conflictTargetColumn.properties.Definition !== conflictSourceColumn.properties.Definition)) {
                  //     if (sourceDeliverColumnIds && !sourceDeliverColumnIds.includes(mapSourceColumns[i])) { // 只传递需要修改的字段
                  //       continue
                  //     }
                  //     conflictTargetColumn.properties.Reference = conflictSourceColumn.properties.Id
                  //     conflictTargetColumn.properties.Name = conflictSourceColumn.properties.Name
                  //     conflictTargetColumn.properties.LogicalName = conflictSourceColumn.properties.LogicalName
                  //     conflictTargetColumn.properties.DataType = conflictSourceColumn.properties.DataType
                  //     conflictTargetColumn.properties.DataStandardRef = conflictSourceColumn.properties.DataStandardRef
                  //     conflictTargetColumn.properties.Definition = conflictSourceColumn.properties.Definition
                  //     conflictTargetColumn.properties.changed = true
                  //     change.obj.name = conflictTargetColumn.properties.Name
                  //     change.obj.now = _.cloneDeep(conflictTargetColumn)
                  //     changes.push(change)
                  //   }
                  // }
                }
              }
            } else {
              // member.properties.Reference = member.properties.Reference
              createNewColumn = true
              createNewColumnArr.push(createNewColumn)
              // if (noneEdge) {
              //   // member.properties.Id = this.deliverNum.seed++
              //   member.properties.new = true
              //   foreignKeyCopy.children.push(member)
              //   foreignKeyCopy.properties.KeyGroupMemberRefs.push(member.properties.Id)
              // }
            }
          }

          let primaryKeyColumnIds = targetPrimaryKey?.children?.map(member => member.properties.AttributeRef)
          // 首先是创建关系，不是传递关系， 然后都不创建新字段复用子表字段，并且复用的子表字段全是子表主键，那么确认是否创建标识关系
          let changeCreateRelationType = !noneEdge && createNewColumnArr.length && createNewColumnArr.every(i => !i) && conflictTargetColumnArr.every(conflictTargetColumn => primaryKeyColumnIds?.includes(conflictTargetColumn.properties.Id))
          if (changeCreateRelationType) {
            try {
              await this.$DatablauCofirm(`将建立标识关系，是否继续？`, '提示', {
                type: 'warning',
                confirmButtonText: '是',
                cancelButtonText: ' 否 ',
                showClose: false,
                closeOnClickModal: true
              })
              this.currentEdgeType = 'RelationalIdentifying'
            } catch (e) {
              return
            }
          }
          for (let i = 0; i < primaryKeyCopy.children.length; i++) {
            let member = primaryKeyCopy.children[i]
            let createNewColumn = createNewColumnArr[i]
            let conflictSourceColumn = conflictSourceColumnArr[i]
            let conflictTargetColumn = conflictTargetColumnArr[i]
            if (conflictTargetColumn) {
              if (!createNewColumn) {
                let change = new Changes('modifyColumn', {
                  pId: targetTable.properties.Id,
                  pName: targetTable.properties.Name,
                  name: conflictTargetColumn.properties.Name,
                  pre: _.cloneDeep(conflictTargetColumn)
                })
                let memberCopy = _.cloneDeep(member)
                memberCopy.properties.Reference = member.properties.Reference
                memberCopy.properties.Id = this.deliverNum.seed++
                memberCopy.properties.UniqueId = uuidv4()
                memberCopy.properties.new = true
                foreignKeyCopy.properties.KeyGroupMemberRefs.push(memberCopy.properties.Id)
                foreignKeyCopy.children.push(memberCopy)
                // primaryKeyColumnIds.splice(primaryKeyColumnIds.findIndex(id => id === member.properties.AttributeRef), 1)
                conflictTargetColumn.properties.conflictRetain = true
                conflictSourceColumn.properties.changeName = true
                conflictSourceColumn && (conflictSourceColumn.properties.nocopy = true)
                if ((conflictTargetColumn.properties.Reference !== conflictSourceColumn.properties.Id || conflictTargetColumn.properties.Name !== conflictSourceColumn.properties.Name || conflictTargetColumn.properties.LogicalName !== conflictSourceColumn.properties.LogicalName || conflictTargetColumn.properties.DataType !== conflictSourceColumn.properties.DataType || conflictTargetColumn.properties.DataStandardRef !== conflictSourceColumn.properties.DataStandardRef || conflictTargetColumn.properties.Definition !== conflictSourceColumn.properties.Definition)) {
                  if (sourceDeliverColumnIds && !sourceDeliverColumnIds.includes(mapSourceColumns[i])) { // 只传递需要修改的字段
                    continue
                  }
                  conflictTargetColumn.properties.Reference = conflictSourceColumn.properties.Id
                  conflictTargetColumn.properties.Name = conflictSourceColumn.properties.Name
                  conflictTargetColumn.properties.LogicalName = conflictSourceColumn.properties.LogicalName
                  conflictTargetColumn.properties.DataType = conflictSourceColumn.properties.DataType
                  conflictTargetColumn.properties.DataStandardRef = conflictSourceColumn.properties.DataStandardRef
                  conflictTargetColumn.properties.Definition = conflictSourceColumn.properties.Definition
                  conflictTargetColumn.properties.changed = true
                  change.obj.name = conflictTargetColumn.properties.Name
                  change.obj.now = _.cloneDeep(conflictTargetColumn)
                  changes.push(change)
                }
              } else {
                let resultMember = targetPrimaryKey?.children?.find(member => member.properties.AttributeRef === conflictTargetColumn.properties.Id)
                if (resultMember && resultMember.properties.hasDeleted) {
                  this.$set(resultMember.properties, 'deleted', false)
                }
                conflictSourceColumn && (conflictSourceColumn.properties.changeName = true)
                let memberCopy = _.cloneDeep(member)
                memberCopy.properties.Reference = member.properties.Reference
                memberCopy.properties.Id = this.deliverNum.seed++
                memberCopy.properties.UniqueId = uuidv4()
                memberCopy.properties.new = true
                foreignKeyCopy.properties.KeyGroupMemberRefs.push(memberCopy.properties.Id)
                foreignKeyCopy.children.push(memberCopy)
                conflictSourceColumn && (conflictSourceColumn.properties.nocopy = false)
              }
            } else {
              // member.properties.Id = this.deliverNum.seed++
              member.properties.new = true
              foreignKeyCopy.children.push(member)
              foreignKeyCopy.properties.KeyGroupMemberRefs.push(member.properties.Id)
            }
          }
          if (!noneEdge) {
            targetTable.children.push(foreignKeyCopy)
          }
          targetForeignKey = foreignKeyCopy
          if (!targetPrimaryKey) { // 外键关系子表没有主键的话需创建空的主键
            targetPrimaryKey = {
              objectClass: 'Datablau.LDM.EntityKeyGroup',
              properties: {
                Id: this.deliverNum.seed++,
                IsUnique: true,
                KeyGroupType: 'PrimaryKey',
                KeyGroupMemberRefs: [],
                Macro: this.dataByType.namingOption.PKDefaultMacro,
                // Name: `pk_${(this.isLogical ? 'Entity_' : this.isCassandraOrMongoDB ? 'Collection_' : 'Table_')}${targetTable.properties.Name}_${keyId++}`,
                // Name: this.dataByType.namingOption.PKDefaultMacro.replace(/%owner%/, targetTable.properties.Name).replace(/%keyid%/, keyId++),
                Name: this.getIndexNameNamingMap(this.dataByType.namingOption.PKDefaultMacro, targetTable.properties.Name, keyId++),
                RawType: 'KeyGroup',
                TypeId: 80000093,
                UniqueId: uuidv4(),
                new: true
              },
              children: []
            }
            targetTable.children.push(targetPrimaryKey)
          }
          // targetPrimaryKey = primaryKeyCopy
        }
        if (this.currentEdgeType === 'RelationalIdentifying' || this.currentEdgeType === 'RelationalNonIdentifying' || this.currentEdgeType === 'RelationalSubtype') {
          // 在子表创建相关字段
          sourceTable.children.forEach(column => {
            if (column.objectClass !== 'Datablau.LDM.EntityAttribute' || column.properties.deleted) {
              return
            }
            if (primaryKeyColumnIds.includes(column.properties.Id)) {
              debugger
              let sourcePrimaryKeyMember = sourcePrimaryKey?.children?.find(member => !member.properties.deleted && member.properties.AttributeRef === column.properties.Id)
              let foreignKeyMember = targetForeignKey && targetForeignKey.children && targetForeignKey.children.find(member => !member.properties.deleted && (column.properties.nocopy ? member.properties.Reference === sourcePrimaryKeyMember.properties.Id : member.properties.AttributeRef === column.properties.Id)) // column.properties.nocopy 为false这时的targetForeignKey还是sourcePrimaryKey的copy
              let primaryKeyMember = targetPrimaryKey && targetPrimaryKey.children && targetPrimaryKey.children.find(member => !member.properties.deleted && (column.properties.nocopy ? member.properties.Reference === sourcePrimaryKeyMember.properties.Id && (foreignKeyMember ? member.properties.AttributeRef === foreignKeyMember.properties.AttributeRef : true) : member.properties.AttributeRef === column.properties.Id))
              let targetForeignKeyMemberBak = foreignKeyBak?.children?.find(member => !member.properties.deleted && member.properties.Reference === sourcePrimaryKeyMember.properties.Id)
              let columnCopy = _.cloneDeep(column)
              columnCopy.properties.Reference = column.properties.Id
              let targetRetainColumn = targetTable.children.find(targetColumn => !targetColumn.properties.deleted && (targetColumn.properties.conflictRetain) && (targetForeignKeyMemberBak ? targetColumn.properties.Id === targetForeignKeyMemberBak?.properties.AttributeRef : noneEdge && sourcePrimaryKeyPrevious?.properties.Id === sourcePrimaryKey?.properties.Id ? false : targetColumn.properties.Name === column.properties.Name)) // noneEdge存在表名传递关系时关系线存在，这时不需要（同名字段复用）
              // let targetRetainColumn = targetTable.children.find(targetColumn => (targetColumn.properties.conflictRetain) && (targetColumn.properties.Reference === column.properties.Id || targetColumn.properties.Name === column.properties.Name))
              if (targetRetainColumn) { // 复用该字段
                // let primaryKeyMember = null
                // let foreignKeyMember = null
                if (targetPrimaryKey) {
                  // primaryKeyMember = targetPrimaryKey.children && targetPrimaryKey.children.find(member => member.properties.AttributeRef === column.properties.Id)
                }
                if (targetForeignKey) {
                  // foreignKeyMember = targetForeignKey.children && targetForeignKey.children.find(member => member.properties.AttributeRef === column.properties.Id)
                }

                if (primaryKeyMember && (this.currentEdgeType === 'RelationalIdentifying' || this.currentEdgeType === 'RelationalSubtype') && sourceTable !== targetTable) {
                  primaryKeyMember.properties.AttributeRef = targetRetainColumn.properties.Id
                  targetRetainColumn.properties.IsNotNull = true
                }
                if (foreignKeyMember) {
                  foreignKeyMember.properties.AttributeRef = targetRetainColumn.properties.Id
                }
                // if (columnCopy.properties.changeName) {
                let tempName = targetRetainColumn.properties.Name
                let change = new Changes('modifyColumn', {
                  pId: targetTable.properties.Id,
                  pName: targetTable.properties.Name,
                  name: targetRetainColumn.properties.Name,
                  pre: _.cloneDeep(targetRetainColumn)
                })
                getNewName(targetRetainColumn, sourceTable.children, targetTable.children)
                if (targetRetainColumn.properties.LogicalName && (this.isLogical || this.isConceptual)) {
                  getNewLogicalName(targetRetainColumn, sourceTable.children, targetTable.children)
                }
                if (targetRetainColumn.properties.Name !== tempName) {
                  change.obj.now = _.cloneDeep(targetRetainColumn)
                  changes.push(change)
                }
                // }
              } else if (columnCopy.properties.changeName) { // 不复用该字段，新建不同名字段
                // let primaryKeyMember = targetPrimaryKey && targetPrimaryKey.children && targetPrimaryKey.children.find(member => member.properties.AttributeRef === column.properties.Id)
                if (primaryKeyMember && (this.currentEdgeType === 'RelationalIdentifying' || this.currentEdgeType === 'RelationalSubtype')) {
                  primaryKeyMember.properties.AttributeRef = this.deliverNum.seed
                }
                // let foreignKeyMember = targetForeignKey && targetForeignKey.children && targetForeignKey.children.find(member => member.properties.AttributeRef === column.properties.Id)
                if (foreignKeyMember) {
                  foreignKeyMember.properties.AttributeRef = this.deliverNum.seed
                  let sourcePrimaryKeyMember = sourcePrimaryKey.children.find(member => !member.properties.deleted && member.properties.AttributeRef === column.properties.Id)
                  foreignKeyMember.properties.Reference = sourcePrimaryKeyMember.properties.Id
                }
                columnCopy.properties.Id = this.deliverNum.seed++
                columnCopy.properties.UniqueId = uuidv4()
                columnCopy.properties.new = true
                if (primaryKeyMember && (this.currentEdgeType === 'RelationalIdentifying' || this.currentEdgeType === 'RelationalSubtype')) {
                  columnCopy.properties.IsNotNull = true
                } else {
                  columnCopy.properties.IsNotNull = false
                }
                delete columnCopy.keyType
                getNewName(columnCopy, sourceTable.children, targetTable.children)
                if (columnCopy.properties.LogicalName && (this.isLogical || this.isConceptual)) {
                  getNewLogicalName(columnCopy, sourceTable.children, targetTable.children)
                }
                targetTable.children.push(columnCopy)

                changes.push(new Changes('insertColumn', {
                  pId: targetTable.properties.Id,
                  pName: targetTable.properties.Name,
                  name: columnCopy.properties.Name,
                  now: _.cloneDeep(columnCopy)
                }))
              } else { // 不复用该字段, 新建字段
                if (sourceDeliverColumnIds && !sourceDeliverColumnIds.includes(column.properties.Id)) {
                  return
                }
                if (targetPrimaryKey) {
                  // let primaryKeyMember = targetPrimaryKey.children && targetPrimaryKey.children.find(member => member.properties.AttributeRef === column.properties.Id)
                  if (primaryKeyMember && (this.currentEdgeType === 'RelationalIdentifying' || this.currentEdgeType === 'RelationalSubtype')) {
                    primaryKeyMember.properties.AttributeRef = this.deliverNum.seed
                  }
                }
                if (targetForeignKey) {
                  // let foreignKeyMember = targetForeignKey.children && targetForeignKey.children.find(member => member.properties.AttributeRef === column.properties.Id)
                  if (foreignKeyMember) {
                    foreignKeyMember.properties.AttributeRef = this.deliverNum.seed
                    let sourcePrimaryKeyMember = sourcePrimaryKey.children.find(member => !member.properties.deleted && member.properties.AttributeRef === column.properties.Id)
                    if (foreignKeyMember) {
                      foreignKeyMember.properties.Reference = sourcePrimaryKeyMember?.properties.Id
                    }
                  }
                }
                columnCopy.properties.Id = this.deliverNum.seed++
                columnCopy.properties.UniqueId = uuidv4()
                columnCopy.properties.new = true
                if (targetPrimaryKey && primaryKeyMember && (this.currentEdgeType === 'RelationalIdentifying' || this.currentEdgeType === 'RelationalSubtype')) {
                  columnCopy.properties.IsNotNull = true
                } else {
                  columnCopy.properties.IsNotNull = false
                }
                delete columnCopy.keyType
                getNewName(columnCopy, sourceTable.children, targetTable.children)
                if (columnCopy.properties.LogicalName && (this.isLogical || this.isConceptual)) {
                  getNewLogicalName(columnCopy, sourceTable.children, targetTable.children)
                }
                targetTable.children.push(columnCopy)

                changes.push(new Changes('insertColumn', {
                  pId: targetTable.properties.Id,
                  pName: targetTable.properties.Name,
                  name: columnCopy.properties.Name,
                  now: _.cloneDeep(columnCopy)
                }))
              }
            }
          })
        }
        // if (change && !noIndexModifed) { // 目标表修改或者添加了主键
        if (change) { // 目标表修改或者添加了主键
          change.obj.now = _.cloneDeep(targetPrimaryKey)
          changes.push(change)
        }
        // if (targetForeignKey.properties && !noIndexModifed) { // 目标表添加或修改了外键
        if (targetForeignKey.properties) { // 目标表添加或修改了外键
          if (noneEdge) {
            change1.obj.now = _.cloneDeep(targetForeignKey)
            changes.push(change1)
          } else {
            changes.push(new Changes('insertIndex', {
              pId: target.OwneeRef,
              pName: targetTable.properties.Name,
              name: targetForeignKey.properties.Name,
              now: _.cloneDeep(targetForeignKey)
            }))
          }
        }

        if (!noneEdge) {
          this.currentOperate = 'addEdge'
          targetTable.properties.ColumnOrderArrayRefs = [] // 后面await this.getTableHTMLFunction的drawTableShape会更新ColumnOrderArrayRefs
          let html = await this.getTableHTMLFunction(targetTable.properties.Id, this.graph.graph, null, null, true)
          target.value = html
          let subtype = null
          let topRelation = null
          if (this.currentEdgeType === 'RelationalSubtype' && !source.ParentTableId) { // source.ParentTableId不存在表明第一种subtype关系创建
            subtype = {
              properties: {
                SubtypeType: 'Exclusive',
                AttributeRef: null,
                TypeId: LDMTypes.Subtype,
                Id: this.deliverNum.seed,
                Name: `Subtype_${this.deliverNum.seed++}`,
                UniqueId: uuidv4(),
                new: true
              },
              objectClass: 'Datablau.LDM.EntitySubtype'
            }
            changes.push(new Changes('insertSubtype', {
              pId: sourceTable.properties.Id,
              pName: sourceTable.properties.Name,
              id: subtype.properties.Id,
              name: subtype.properties.Name,
              now: _.cloneDeep(subtype)
            }))
            sourceTable.children.push(subtype)
            sourceTable.properties.changed = true
            topRelation = {
              properties: {
                Label: 'ref',
                ParentEntityRef: sourceTable.properties.Id,
                ChildEntityRef: subtype.properties.Id,
                NotationType: 'InformationEngineering',
                RelationalType: 'Identifying',
                StartCardinality: 'OneOnly',
                EndCardinality: 'ZeroOrOne',
                Direction: 'Unidirectional',
                StartRole: sourceTable.properties.Name,
                EndRole: subtype.properties.Name,
                StartMultiplicity: '0,1',
                EndMultiplicity: '0,1',
                TypeId: LDMTypes.Relationship,
                Id: this.deliverNum.seed,
                Name: `rs_${sourceTable.properties.Name}_${subtype.properties.Name}_${this.deliverNum.seed++}`,
                UniqueId: uuidv4(),
                new: true
              },
              objectClass: 'Datablau.LDM.RelationshipSubtype'
            }
            this.$set(this.dataByType.relation, topRelation.properties.Id, topRelation)
            changes.push(new Changes('insertRelation', {
              name: topRelation.properties.Name,
              now: _.cloneDeep(topRelation)
            }))
          } else {
          }
          const relation = {
            objectClass: this.currentEdgeType === 'RelationalManyToMany' ? 'Datablau.LDM.RelationshipManyToMany' : this.currentEdgeType === 'RelationalSubtype' ? 'Datablau.LDM.RelationshipSubtype' : 'Datablau.LDM.RelationshipRelational',
            properties: {
              ChildEntityRef: target.OwneeRef,
              // ChildKeyRef: targetForeignKey.properties.Id, 后续有赋值
              EndCardinality: this.currentEdgeType === 'RelationalIdentifying' || this.currentEdgeType === 'RelationalSubtype' ? 'ZeroOrOne' : this.currentEdgeType === 'RelationalNonIdentifying' ? 'ZeroOneOrMore' : this.currentEdgeType === 'RelationalManyToMany' ? 'ZeroOneOrMore' : 'None',
              Id: this.emptyRelationNum,
              Label: 'ref',
              Name: `rs_${sourceTable.properties.Name}_${targetTable.properties.Name}_${this.emptyRelationNum}`,
              ParentEntityRef: (this.currentEdgeType === 'RelationalSubtype' && source.ParentTableId) ? source.ParentTableId : source.OwneeRef,
              // ParentKeyRef: sourcePrimaryKey.properties.Id,
              RawType: this.currentEdgeType === 'RelationalIdentifying' || this.currentEdgeType === 'RelationalSubtype' ? 'Relationship' : this.currentEdgeType === 'RelationalNonIdentifying' ? 'Relationship' : this.currentEdgeType === 'RelationalManyToMany' ? 'RelationalManyToMany' : '',
              RelationalType: this.currentEdgeType === 'RelationalIdentifying' || this.currentEdgeType === 'RelationalSubtype' ? 'Identifying' : this.currentEdgeType === 'RelationalNonIdentifying' ? 'NonIdentifying' : this.currentEdgeType === 'RelationalManyToMany' ? 'ManyToMany' : '',
              StartCardinality: this.currentEdgeType === 'RelationalIdentifying' || this.currentEdgeType === 'RelationalSubtype' ? 'OneOnly' : this.currentEdgeType === 'RelationalNonIdentifying' ? 'ZeroOrOne' : this.currentEdgeType === 'RelationalManyToMany' ? 'ZeroOneOrMore' : 'None',
              TypeId: 80000007,
              UniqueId: uuidv4(),
              new: true
            }
          }
          if (this.currentEdgeType === 'RelationalSubtype') {
            if (source.ParentTableId) {
              relation.properties.SubTypeRef = source.SubTypeRef // 这种情况下,source就是半圆
            } else {
              relation.properties.SubTypeRef = subtype.properties.Id
            }
          }
          if (this.currentEdgeType === 'RelationalIdentifying' || this.currentEdgeType === 'RelationalNonIdentifying' || this.currentEdgeType === 'RelationalSubtype') {
            relation.properties.ChildKeyRef = targetForeignKey.properties.Id
            relation.properties.ParentKeyRef = sourcePrimaryKey.properties.Id
            relation.properties.changed = true
          }
          this.$set(this.dataByType.relation, this.emptyRelationNum, relation)
          changes.push(new Changes('insertRelation', {
            name: relation.properties.Name,
            now: _.cloneDeep(relation)
          }))

          let subtypeCell = null
          let subtypeShape = null
          let edge = null
          if (this.currentEdgeType === 'RelationalSubtype' && !source.ParentTableId) { // 绘制subtype两个connection和半圆
            this.graph.graph.getModel().beginUpdate()
            try {
              subtypeShape = {
                properties: {
                  Location: {
                    x: parseInt((source.geometry.x + source.geometry.width / 2 + target.geometry.x + target.geometry.width / 2) / 2),
                    y: parseInt((source.geometry.y + source.geometry.height / 2 + target.geometry.y + target.geometry.height / 2) / 2)
                  },
                  ShapeSize: {
                    width: 40,
                    height: 20
                  },
                  Name: subtype.properties.Name,
                  SubTypeRef: subtype.properties.Id,
                  TypeId: LDMTypes.Shape,
                  Id: this.deliverNum.seed++,
                  UniqueId: uuidv4(),
                  new: true
                },
                objectClass: 'Datablau.ERD.ShapeSubtype'
              }
              changes.push(new Changes('insertShape', {
                id: subtypeShape.properties.Id,
                name: subtype.properties.Name
              }))
              this.diagram.children.push(subtypeShape)
              let subtypeHtml = `<div style="height:${subtypeShape.properties.ShapeSize.height}px;width:${subtypeShape.properties.ShapeSize.width}px;">`
              subtypeHtml += `<div class="subtype-shape`
              let exclusive = false
              if (subtype?.properties?.SubtypeType === 'Exclusive') {
                subtypeHtml += ` exclusive`
                exclusive = true
              } else {
                subtypeHtml += ` inclusive`
                exclusive = false
              }
              subtypeHtml += `"></div></div>`
              subtypeCell = this.graph.graph.insertVertex(
                this.graph.graph.getDefaultParent(), null, subtypeHtml,
                subtypeShape.properties.Location.x,
                subtypeShape.properties.Location.y,
                subtypeShape.properties.ShapeSize.width, subtypeShape.properties.ShapeSize.height,
                `shape=${exclusive ? 'subtype-exclusive' : 'subtype'};${STYLE.SubType}`)
              subtypeCell.Id = subtypeShape.properties.Id
              subtypeCell.SubTypeRef = subtype.properties.Id
              subtypeCell.isSubType = true
              subtypeCell.new = true
              subtypeCell.ParentTableId = sourceTable.properties.Id

              let topEdge = null
              let topEdgeNum = this.deliverNum.seed++
              topEdge = this.graph.graph.insertEdge(this.graph.graph.getDefaultParent(), topEdgeNum, null,
                source, subtypeCell,
                `ZeroOrOne;`
              )

              let topConnection = {
                properties: {
                  ParentShapeRef: topEdge.source.Id,
                  ChildShapeRef: topEdge.target.Id,
                  StartOrientation: 'Vertical',
                  EndOrientation: 'Vertical',
                  BendPoints: topEdge.CurrentBendPoints,
                  TypeId: LDMTypes.Connection,
                  Id: topEdgeNum,
                  Name: `Connection_${topEdgeNum}`,
                  UniqueId: uuidv4(),
                  OwneeRef: topRelation.properties.Id,
                  new: true
                },
                objectClass: 'Datablau.ERD.ConnectionSubtype'
              }
              this.dataByType.diagram[this.currentId].children.push(topConnection)
              changes.push(new Changes('insertConnection', {
                name: topConnection.properties.Name,
                id: topEdgeNum
              }))

              topEdge.Id = topEdgeNum
              topEdge.new = true
              topEdge.subtypeTopEdge = true
              topEdge.OwneeRef = topRelation.properties.Id
              topEdge.endCardinalityType = this.currentEdgeType === 'RelationalIdentifying' || this.currentEdgeType === 'RelationalSubtype' ? 'ZeroOrOne' : this.currentEdgeType === 'RelationalNonIdentifying' ? 'ZeroOneOrMore' : this.currentEdgeType === 'RelationalManyToMany' ? 'None' : ''
              topEdge.type = this.currentEdgeType === 'RelationalIdentifying' ? 'Relational' : this.currentEdgeType === 'RelationalNonIdentifying' ? 'Relational' : this.currentEdgeType === 'RelationalManyToMany' ? 'ManyToMany' : this.currentEdgeType === 'RelationalSubtype' ? 'Subtype' : ''
              topEdge.relationalType = this.currentEdgeType === 'RelationalIdentifying' ? 'Identifying' : this.currentEdgeType === 'RelationalNonIdentifying' ? 'NonIdentifying' : this.currentEdgeType === 'RelationalManyToMany' ? 'ManyToMany' : this.currentEdgeType === 'RelationalSubtype' ? 'Identifying' : ''
              topEdge.deleteReal = true
              topEdge.targetOwneeRef = target.OwneeRef
              topEdge.sourceOwneeRef = source.OwneeRef
              topEdge.deleteColumn = true
              this.graph.vertex['edge' + topEdge.Id] = topEdge

              edge = this.graph.graph.insertEdge(this.graph.graph.getDefaultParent(), this.emptyEdgeNum, null,
                subtypeCell, target,
                this.currentEdgeType === 'RelationalIdentifying' || this.currentEdgeType === 'RelationalSubtype' ? `ZeroOrOne;` : this.currentEdgeType === 'RelationalNonIdentifying' ? 'ZeroOrOne:ZeroOneOrMoreDashed' : this.currentEdgeType === 'RelationalManyToMany' ? 'ZeroOneOrMore:ZeroOneOrMore' : 'ZeroOneOrMoreDashed'
              )
            } catch (e) {
              console.log('绘图出错')
            }
            this.graph.graph.getModel().endUpdate()
          } else if (this.currentEdgeType === 'RelationalIdentifying' || this.currentEdgeType === 'RelationalNonIdentifying' || (this.currentEdgeType === 'RelationalSubtype' && source.ParentTableId)) {
            edge = this.graph.graph.insertEdge(this.graph.graph.getDefaultParent(), this.emptyEdgeNum, null,
              source, target,
              this.currentEdgeType === 'RelationalIdentifying' || this.currentEdgeType === 'RelationalSubtype' ? `ZeroOrOne;` : this.currentEdgeType === 'RelationalNonIdentifying' ? 'ZeroOrOne:ZeroOneOrMoreDashed' : this.currentEdgeType === 'RelationalManyToMany' ? 'ZeroOneOrMore:ZeroOneOrMore' : 'ZeroOneOrMoreDashed'
            )
          }
          // this.dataByType.diagram[this.currentId].children.splice(this.dataByType.diagram[this.currentId].children.length, 0, relation)
          edge.Id = this.emptyEdgeNum
          edge.new = true
          edge.OwneeRef = relation.properties.Id
          edge.endCardinalityType = this.currentEdgeType === 'RelationalIdentifying' || this.currentEdgeType === 'RelationalSubtype' ? 'ZeroOrOne' : this.currentEdgeType === 'RelationalNonIdentifying' ? 'ZeroOneOrMore' : this.currentEdgeType === 'RelationalManyToMany' ? 'None' : ''
          edge.type = this.currentEdgeType === 'RelationalIdentifying' ? 'Relational' : this.currentEdgeType === 'RelationalNonIdentifying' ? 'Relational' : this.currentEdgeType === 'RelationalManyToMany' ? 'ManyToMany' : this.currentEdgeType === 'RelationalSubtype' ? 'Subtype' : ''
          edge.relationalType = this.currentEdgeType === 'RelationalIdentifying' ? 'Identifying' : this.currentEdgeType === 'RelationalNonIdentifying' ? 'NonIdentifying' : this.currentEdgeType === 'RelationalManyToMany' ? 'ManyToMany' : this.currentEdgeType === 'RelationalSubtype' ? 'Identifying' : ''
          edge.deleteReal = true
          edge.targetOwneeRef = target.OwneeRef
          edge.sourceOwneeRef = (this.currentEdgeType === 'RelationalSubtype' && source.ParentTableId) ? source.ParentTableId : source.OwneeRef
          edge.deleteColumn = true
          this.graph.vertex['edge' + edge.Id] = edge

          let tempCurrentEdgeType = this.currentEdgeType
          let emptyEdgeNum = this.emptyEdgeNum
          let emptyRelationNum = this.emptyRelationNum
          setTimeout(() => {
            const connection = {
              objectClass: tempCurrentEdgeType === 'RelationalManyToMany' ? 'Datablau.ERD.ConnectionRelationalManyToMany' : tempCurrentEdgeType === 'RelationalSubtype' ? 'Datablau.ERD.ConnectionSubtype' : 'Datablau.ERD.ConnectionRelational',
              properties: {
                BendPoints: edge.CurrentBendPoints,
                ChildShapeRef: edge.target.Id,
                EndOrientation: edge.EndOrientation,
                Id: emptyEdgeNum,
                Name: `Connection_${emptyEdgeNum}`,
                OwneeRef: emptyRelationNum,
                ParentShapeRef: edge.source.Id,
                RawType: 'Connection',
                StartOrientation: edge.StartOrientation,
                TypeId: 80000009,
                UniqueId: uuidv4(),
                new: true
              }
            }
            this.dataByType.diagram[this.currentId].children.push(connection)
            changes.push(new Changes('insertConnection', {
              name: relation.properties.Name,
              id: emptyEdgeNum
            }))
            edge.style = this.graph.drawEdgeShapeStyle(this.emptyEdgeNum)
            this.graph.graph.refresh(edge)
            this.emptyRelationNum++
            this.emptyEdgeNum++
          })
        } else {
          targetTable.properties.ColumnOrderArrayRefs = []
          let html = await this.getTableHTMLFunction(targetTable.properties.Id, this.graph.graph, null, null, true)
          target.value = html
          for (let relation of Object.values(this.dataByType.relation)) {
            // if (relation && relation.properties.ParentEntityRef === source.OwneeRef && relation.properties.ChildEntityRef === target.OwneeRef) {
            if (relation && noneEdge.properties.Id === relation.properties.Id) {
              if (relation.properties.ChildKeyRef !== targetForeignKey.properties.Id) {
                let table = this.dataByType.table[target.OwneeRef]
                if (table && table.children) {
                  table.children.forEach(column => {
                    if (column.objectClass === 'Datablau.LDM.EntityKeyGroup' && column.properties.KeyGroupType === 'ForeignKey' && column.properties.Id === relation.properties.ChildKeyRef) {
                      column.properties.deleted = true

                      changes.push(new Changes('deleteIndex', {
                        pId: target.OwneeRef,
                        pName: targetTable.properties.Name,
                        name: column.properties.Name,
                        id: column.properties.Id
                      }))
                    }
                  })
                }
              }
              if (!noIndexModifed) {
                let change = new Changes('modifyRelation', {
                  name: relation.properties.Name,
                  pre: _.cloneDeep(relation)
                })

                relation.properties.ChildKeyRef = targetForeignKey.properties.Id
                relation.properties.ParentKeyRef = sourcePrimaryKey.properties.Id
                relation.properties.changed = true

                change.obj.now = _.cloneDeep(relation)
                changes.push(change)
              }
            }
          }
        }
        setTimeout(() => {
          this.graph.graph.setCellsMovable(true)
        })
        targetTable.properties.ColumnOrderArrayRefs = []
        this.graph.graph.getView().refresh()
      } else { // 没有主键
        if (!noneEdge) {
          this.currentOperate = 'addEdge'
          let sourcePrimaryKey = {
            objectClass: 'Datablau.LDM.EntityKeyGroup',
            properties: {
              Id: this.deliverNum.seed++,
              IsUnique: true,
              KeyGroupType: 'PrimaryKey',
              Macro: this.dataByType.namingOption.PKDefaultMacro,
              KeyGroupMemberRefs: [],
              // Name: `pk_${(this.isLogical ? 'Entity_' : this.isCassandraOrMongoDB ? 'Collection_' : 'Table_')}${targetTable.properties.Name}_${keyId++}`,
              // Name: this.dataByType.namingOption.PKDefaultMacro.replace(/%owner%/, targetTable.properties.Name).replace(/%keyid%/, keyId++),
              Name: this.getIndexNameNamingMap(this.dataByType.namingOption.PKDefaultMacro, targetTable.properties.Name, keyId++),
              RawType: 'KeyGroup',
              TypeId: 80000093,
              UniqueId: uuidv4(),
              new: true
            },
            children: []
          }
          if (sourceTable.children) {
            sourceTable.children.push(sourcePrimaryKey)
          } else {
            sourceTable.children = [sourcePrimaryKey]
          }
          changes.push(new Changes('insertIndex', {
            pId: sourceTable.properties.Id,
            pName: sourceTable.properties.Name,
            name: sourcePrimaryKey.properties.Name,
            now: _.cloneDeep(sourcePrimaryKey)
          }))
          sourceTable.properties.changed = true
          let foreignKeyCopy = _.cloneDeep(sourcePrimaryKey)
          foreignKeyCopy.properties.Macro = this.dataByType.namingOption.FKDefaultMacro
          foreignKeyCopy.properties.Id = this.deliverNum.seed++
          foreignKeyCopy.properties.UniqueId = uuidv4()
          foreignKeyCopy.properties.new = true
          foreignKeyCopy.properties.Macro = foreignKeyCopy.properties.Macro.replace(/pk/, 'fk')
          // foreignKeyCopy.properties.Name = foreignKeyCopy.properties.Macro.replace(/%owner%/, targetTable.properties.Name).replace(/%keyid%/, keyId++)
          foreignKeyCopy.properties.Name = this.getIndexNameNamingMap(foreignKeyCopy.properties.Macro, targetTable.properties.Name, keyId++)
          foreignKeyCopy.properties.KeyGroupType = 'ForeignKey'
          foreignKeyCopy.properties.KeyGroupMemberRefs = []
          foreignKeyCopy.children = []
          let targetPrimaryKey = _.cloneDeep(sourcePrimaryKey)
          targetPrimaryKey.properties.Id = this.deliverNum.seed++
          targetPrimaryKey.properties.UniqueId = uuidv4()
          targetPrimaryKey.properties.new = true
          if (targetTable.children) {
            if (!targetTable.children.find(column => !column.properties.deleted && column.properties.KeyGroupType === 'PrimaryKey')) { // 子表没有主键
              targetTable.children.push(targetPrimaryKey)
              changes.push(new Changes('insertIndex', {
                pId: targetTable.properties.Id,
                pName: targetTable.properties.Name,
                name: targetPrimaryKey.properties.Name,
                now: _.cloneDeep(targetPrimaryKey)
              }))
              targetTablePrimaryKeyCurrentChanged = true
            }
            targetTable.children.push(foreignKeyCopy)
            changes.push(new Changes('insertIndex', {
              pId: targetTable.properties.Id,
              pName: targetTable.properties.Name,
              name: foreignKeyCopy.properties.Name,
              now: _.cloneDeep(foreignKeyCopy)
            }))
          } else {
            targetTable.children = [targetPrimaryKey, foreignKeyCopy]
            changes.push(new Changes('insertIndex', {
              pId: targetTable.properties.Id,
              pName: targetTable.properties.Name,
              name: targetPrimaryKey.properties.Name,
              now: _.cloneDeep(targetPrimaryKey)
            }))
            targetTablePrimaryKeyCurrentChanged = true
            changes.push(new Changes('insertIndex', {
              pId: targetTable.properties.Id,
              pName: targetTable.properties.Name,
              name: foreignKeyCopy.properties.Name,
              now: _.cloneDeep(foreignKeyCopy)
            }))
          }
          let targetForeignKey = foreignKeyCopy
          targetTable.properties.ColumnOrderArrayRefs = []
          let html = await this.getTableHTMLFunction(targetTable.properties.Id, this.graph.graph, null, null, true)
          target.value = html
          let subtype = null
          let topRelation = null
          if (this.currentEdgeType === 'RelationalSubtype' && !source.ParentTableId) { // source.ParentTableId不存在表明第一种subtype关系创建
            subtype = {
              properties: {
                SubtypeType: 'Exclusive',
                AttributeRef: null,
                TypeId: LDMTypes.Subtype,
                Id: this.deliverNum.seed,
                Name: `Subtype_${this.deliverNum.seed++}`,
                UniqueId: uuidv4(),
                new: true
              },
              objectClass: 'Datablau.LDM.EntitySubtype'
            }
            changes.push(new Changes('insertSubtype', {
              pId: sourceTable.properties.Id,
              pName: sourceTable.properties.Name,
              id: subtype.properties.Id,
              name: subtype.properties.Name,
              now: _.cloneDeep(subtype)
            }))
            sourceTable.children.push(subtype)
            sourceTable.properties.changed = true
            topRelation = {
              properties: {
                Label: 'ref',
                ParentEntityRef: sourceTable.properties.Id,
                ChildEntityRef: subtype.properties.Id,
                NotationType: 'InformationEngineering',
                RelationalType: 'Identifying',
                StartCardinality: 'OneOnly',
                EndCardinality: 'ZeroOrOne',
                Direction: 'Unidirectional',
                StartRole: sourceTable.properties.Name,
                EndRole: subtype.properties.Name,
                StartMultiplicity: '0,1',
                EndMultiplicity: '0,1',
                TypeId: LDMTypes.Relationship,
                Id: this.deliverNum.seed,
                Name: `rs_${sourceTable.properties.Name}_${subtype.properties.Name}_${this.deliverNum.seed++}`,
                UniqueId: uuidv4(),
                new: true
              },
              objectClass: 'Datablau.LDM.RelationshipSubtype'
            }
            this.$set(this.dataByType.relation, topRelation.properties.Id, topRelation)
            changes.push(new Changes('insertRelation', {
              name: topRelation.properties.Name,
              now: _.cloneDeep(topRelation)
            }))
          } else {
          }
          const relation = {
            objectClass: this.currentEdgeType === 'RelationalManyToMany' ? 'Datablau.LDM.RelationshipManyToMany' : this.currentEdgeType === 'RelationalSubtype' ? 'Datablau.LDM.RelationshipSubtype' : 'Datablau.LDM.RelationshipRelational',
            properties: {
              ChildEntityRef: target.OwneeRef,
              EndCardinality: this.currentEdgeType === 'RelationalIdentifying' || this.currentEdgeType === 'RelationalSubtype' ? 'ZeroOrOne' : this.currentEdgeType === 'RelationalNonIdentifying' ? 'ZeroOneOrMore' : this.currentEdgeType === 'RelationalManyToMany' ? 'ZeroOneOrMore' : 'None',
              Id: this.emptyRelationNum,
              Label: 'ref',
              Name: `rs_${sourceTable.properties.Name}_${targetTable.properties.Name}_${this.emptyRelationNum}`,
              ParentEntityRef: (this.currentEdgeType === 'RelationalSubtype' && source.ParentTableId) ? source.ParentTableId : source.OwneeRef,
              RawType: this.currentEdgeType === 'RelationalIdentifying' || this.currentEdgeType === 'RelationalSubtype' ? 'Relationship' : this.currentEdgeType === 'RelationalNonIdentifying' ? 'Relationship' : this.currentEdgeType === 'RelationalManyToMany' ? 'RelationalManyToMany' : '',
              RelationalType: this.currentEdgeType === 'RelationalIdentifying' || this.currentEdgeType === 'RelationalSubtype' ? 'Identifying' : this.currentEdgeType === 'RelationalNonIdentifying' ? 'NonIdentifying' : this.currentEdgeType === 'RelationalManyToMany' ? 'ManyToMany' : '',
              StartCardinality: this.currentEdgeType === 'RelationalIdentifying' || this.currentEdgeType === 'RelationalSubtype' ? 'OneOnly' : this.currentEdgeType === 'RelationalNonIdentifying' ? 'ZeroOrOne' : this.currentEdgeType === 'RelationalManyToMany' ? 'ZeroOneOrMore' : 'None',
              TypeId: 80000007,
              UniqueId: uuidv4(),
              new: true
            }
          }
          if (this.currentEdgeType === 'RelationalSubtype') {
            if (source.ParentTableId) {
              relation.properties.SubTypeRef = source.SubTypeRef // 这种情况下,source就是半圆
            } else {
              relation.properties.SubTypeRef = subtype.properties.Id
            }
          }
          if (this.currentEdgeType === 'RelationalIdentifying' || this.currentEdgeType === 'RelationalNonIdentifying' || this.currentEdgeType === 'RelationalSubtype') {
            relation.properties.ChildKeyRef = targetForeignKey && targetForeignKey.properties && targetForeignKey.properties.Id
            relation.properties.ParentKeyRef = sourcePrimaryKey && sourcePrimaryKey.properties && sourcePrimaryKey.properties.Id
            relation.properties.changed = true
          }
          this.$set(this.dataByType.relation, this.emptyRelationNum, relation)
          changes.push(new Changes('insertRelation', {
            name: relation.properties.Name,
            now: _.cloneDeep(relation)
          }))

          let subtypeCell = null
          let subtypeShape = null
          let edge = null
          if (this.currentEdgeType === 'RelationalSubtype' && !source.ParentTableId) { // 绘制subtype两个connection和半圆
            this.graph.graph.getModel().beginUpdate()
            try {
              subtypeShape = {
                properties: {
                  Location: {
                    x: parseInt((source.geometry.x + source.geometry.width / 2 + target.geometry.x + target.geometry.width / 2) / 2),
                    y: parseInt((source.geometry.y + source.geometry.height / 2 + target.geometry.y + target.geometry.height / 2) / 2)
                  },
                  ShapeSize: {
                    width: 40,
                    height: 20
                  },
                  Name: subtype.properties.Name,
                  SubTypeRef: subtype.properties.Id,
                  TypeId: LDMTypes.Shape,
                  Id: this.deliverNum.seed++,
                  UniqueId: uuidv4(),
                  new: true
                },
                objectClass: 'Datablau.ERD.ShapeSubtype'
              }
              changes.push(new Changes('insertShape', {
                id: subtypeShape.properties.Id,
                name: subtype.properties.Name
              }))
              this.diagram.children.push(subtypeShape)
              let subtypeHtml = `<div style="height:${subtypeShape.properties.ShapeSize.height}px;width:${subtypeShape.properties.ShapeSize.width}px;">`
              subtypeHtml += `<div class="subtype-shape`
              let exclusive = false
              if (subtype?.properties?.SubtypeType === 'Exclusive') {
                subtypeHtml += ` exclusive`
                exclusive = true
              } else {
                subtypeHtml += ` inclusive`
                exclusive = false
              }
              subtypeHtml += `"></div></div>`
              subtypeCell = this.graph.graph.insertVertex(
                this.graph.graph.getDefaultParent(), null, subtypeHtml,
                subtypeShape.properties.Location.x,
                subtypeShape.properties.Location.y,
                subtypeShape.properties.ShapeSize.width, subtypeShape.properties.ShapeSize.height,
                `shape=${exclusive ? 'subtype-exclusive' : 'subtype'};${STYLE.SubType}`)
              subtypeCell.Id = subtypeShape.properties.Id
              subtypeCell.SubTypeRef = subtype.properties.Id
              subtypeCell.isSubType = true
              subtypeCell.new = true
              subtypeCell.ParentTableId = sourceTable.properties.Id

              let topEdge = null
              let topEdgeNum = this.deliverNum.seed++
              topEdge = this.graph.graph.insertEdge(this.graph.graph.getDefaultParent(), topEdgeNum, null,
                source, subtypeCell,
                `ZeroOrOne;`
              )

              let topConnection = {
                properties: {
                  ParentShapeRef: topEdge.source.Id,
                  ChildShapeRef: topEdge.target.Id,
                  StartOrientation: 'Vertical',
                  EndOrientation: 'Vertical',
                  BendPoints: topEdge.CurrentBendPoints,
                  TypeId: LDMTypes.Connection,
                  Id: topEdgeNum,
                  Name: `Connection_${topEdgeNum}`,
                  UniqueId: uuidv4(),
                  OwneeRef: topRelation.properties.Id,
                  new: true
                },
                objectClass: 'Datablau.ERD.ConnectionSubtype'
              }
              this.dataByType.diagram[this.currentId].children.push(topConnection)
              changes.push(new Changes('insertConnection', {
                name: topConnection.properties.Name,
                id: topEdgeNum
              }))

              topEdge.Id = topEdgeNum
              topEdge.new = true
              topEdge.subtypeTopEdge = true
              topEdge.OwneeRef = topRelation.properties.Id
              topEdge.endCardinalityType = this.currentEdgeType === 'RelationalIdentifying' || this.currentEdgeType === 'RelationalSubtype' ? 'ZeroOrOne' : this.currentEdgeType === 'RelationalNonIdentifying' ? 'ZeroOneOrMore' : this.currentEdgeType === 'RelationalManyToMany' ? 'None' : ''
              topEdge.type = this.currentEdgeType === 'RelationalIdentifying' ? 'Relational' : this.currentEdgeType === 'RelationalNonIdentifying' ? 'Relational' : this.currentEdgeType === 'RelationalManyToMany' ? 'ManyToMany' : this.currentEdgeType === 'RelationalSubtype' ? 'Subtype' : ''
              topEdge.relationalType = this.currentEdgeType === 'RelationalIdentifying' ? 'Identifying' : this.currentEdgeType === 'RelationalNonIdentifying' ? 'NonIdentifying' : this.currentEdgeType === 'RelationalManyToMany' ? 'ManyToMany' : this.currentEdgeType === 'RelationalSubtype' ? 'Identifying' : ''
              topEdge.deleteReal = true
              topEdge.targetOwneeRef = target.OwneeRef
              topEdge.sourceOwneeRef = source.OwneeRef
              topEdge.deleteColumn = true
              this.graph.vertex['edge' + topEdge.Id] = topEdge

              edge = this.graph.graph.insertEdge(this.graph.graph.getDefaultParent(), this.emptyEdgeNum, null,
                subtypeCell, target,
                this.currentEdgeType === 'RelationalIdentifying' || this.currentEdgeType === 'RelationalSubtype' ? `ZeroOrOne;` : this.currentEdgeType === 'RelationalNonIdentifying' ? 'ZeroOrOne:ZeroOneOrMoreDashed' : this.currentEdgeType === 'RelationalManyToMany' ? 'ZeroOneOrMore:ZeroOneOrMore' : 'ZeroOneOrMoreDashed'
              )
            } catch (e) {
              console.log('绘图出错')
            }
            this.graph.graph.getModel().endUpdate()
          } else if (this.currentEdgeType === 'RelationalIdentifying' || this.currentEdgeType === 'RelationalNonIdentifying' || (this.currentEdgeType === 'RelationalSubtype' && source.ParentTableId)) {
            edge = this.graph.graph.insertEdge(this.graph.graph.getDefaultParent(), this.emptyEdgeNum, null,
              source, target,
              this.currentEdgeType === 'RelationalIdentifying' || this.currentEdgeType === 'RelationalSubtype' ? `ZeroOrOne;` : this.currentEdgeType === 'RelationalNonIdentifying' ? 'ZeroOrOne:ZeroOneOrMoreDashed' : this.currentEdgeType === 'RelationalManyToMany' ? 'ZeroOneOrMore:ZeroOneOrMore' : 'ZeroOneOrMoreDashed'
            )
          }
          // this.dataByType.diagram[this.currentId].children.splice(this.dataByType.diagram[this.currentId].children.length, 0, relation)
          edge.Id = this.emptyEdgeNum
          edge.new = true
          edge.OwneeRef = relation.properties.Id
          edge.endCardinalityType = this.currentEdgeType === 'RelationalIdentifying' || this.currentEdgeType === 'RelationalSubtype' ? 'ZeroOrOne' : this.currentEdgeType === 'RelationalNonIdentifying' ? 'ZeroOneOrMore' : this.currentEdgeType === 'RelationalManyToMany' ? 'None' : ''
          edge.type = this.currentEdgeType === 'RelationalIdentifying' ? 'Relational' : this.currentEdgeType === 'RelationalNonIdentifying' ? 'Relational' : this.currentEdgeType === 'RelationalManyToMany' ? 'ManyToMany' : this.currentEdgeType === 'RelationalSubtype' ? 'Subtype' : ''
          edge.relationalType = this.currentEdgeType === 'RelationalIdentifying' ? 'Identifying' : this.currentEdgeType === 'RelationalNonIdentifying' ? 'NonIdentifying' : this.currentEdgeType === 'RelationalManyToMany' ? 'ManyToMany' : this.currentEdgeType === 'RelationalSubtype' ? 'Identifying' : ''
          edge.deleteReal = true
          edge.targetOwneeRef = target.OwneeRef
          edge.sourceOwneeRef = (this.currentEdgeType === 'RelationalSubtype' && source.ParentTableId) ? source.ParentTableId : source.OwneeRef
          edge.deleteColumn = true
          this.graph.vertex['edge' + edge.Id] = edge

          let tempCurrentEdgeType = this.currentEdgeType
          let emptyEdgeNum = this.emptyEdgeNum // emptyEdgeNum 在createRelation一开始已赋值，后续传递时setTimeout可能会改变，所以要临时赋值
          let emptyRelationNum = this.emptyRelationNum
          setTimeout(() => {
            const connection = {
              objectClass: tempCurrentEdgeType === 'RelationalManyToMany' ? 'Datablau.ERD.ConnectionRelationalManyToMany' : tempCurrentEdgeType === 'RelationalSubtype' ? 'Datablau.ERD.ConnectionSubtype' : 'Datablau.ERD.ConnectionRelational',
              properties: {
                BendPoints: edge.CurrentBendPoints,
                ChildShapeRef: edge.target.Id,
                EndOrientation: edge.EndOrientation,
                Id: emptyEdgeNum,
                Name: `Connection_${emptyEdgeNum}`,
                OwneeRef: emptyRelationNum,
                ParentShapeRef: edge.source.Id,
                RawType: 'Connection',
                StartOrientation: edge.StartOrientation,
                TypeId: 80000009,
                UniqueId: uuidv4(),
                new: true
              }
            }
            this.dataByType.diagram[this.currentId].children.push(connection)
            changes.push(new Changes('insertConnection', {
              name: relation.properties.Name,
              id: emptyEdgeNum
            }))
            edge.style = this.graph.drawEdgeShapeStyle(this.emptyEdgeNum)
            this.graph.graph.refresh(edge)
            this.emptyRelationNum++
            this.emptyEdgeNum++
          })
        } else {
          // for (let relation of Object.values(this.dataByType.relation)) {
          //   if (relation && relation.properties.ParentEntityRef === source.OwneeRef && relation.properties.ChildEntityRef === target.OwneeRef) {
          //     if (relation.properties.ChildKeyRef !== targetForeignKey.properties.Id) {
          //       let table = this.dataByType.table[target.OwneeRef]
          //       if (table && table.children) {
          //         table.children.forEach(column => {
          //           if (column.objectClass === 'Datablau.LDM.EntityKeyGroup' && column.properties.KeyGroupType === 'ForeignKey' && column.properties.Id === relation.properties.ChildKeyRef) {
          //             column.properties.deleted = true
          //
          //             changes.push(new Changes('deleteIndex', {
          //               pId: table.properties.Id,
          //               pName: table.properties.Name,
          //               name: column.properties.Name,
          //               id: column.properties.Id
          //             }))
          //           }
          //         })
          //       }
          //     }
          //     let change = new Changes('modifyRelation', {
          //       name: relation.properties.Name,
          //       pre: _.cloneDeep(relation)
          //     })
          //
          //     relation.properties.ChildKeyRef = targetForeignKey.properties.Id
          //     relation.properties.ParentKeyRef = sourcePrimaryKey.properties.Id
          //     relation.properties.changed = true
          //
          //     change.obj.now = _.cloneDeep(relation)
          //     changes.push(change)
          //   }
          // }
          let table = this.dataByType.table[target.OwneeRef]
          if (table && table.children) {
            table.children.forEach(column => {
              if (column.objectClass === 'Datablau.LDM.EntityKeyGroup' && column.properties.KeyGroupType === 'ForeignKey' && column.properties.Id === noneEdge.properties.ChildKeyRef) {
                column.properties.deleted = true

                changes.push(new Changes('deleteIndex', {
                  pId: table.properties.Id,
                  pName: table.properties.Name,
                  name: column.properties.Name,
                  id: column.properties.Id
                }))
                table.properties.changed = true
              }
            })
            if (sourcePrimaryKey && !sourcePrimaryKey.properties.deleted) {
              let change = new Changes('modifyRelation', {
                name: noneEdge.properties.Name,
                pre: _.cloneDeep(noneEdge)
              })

              noneEdge.properties.ChildKeyRef = targetForeignKey.properties.Id
              noneEdge.properties.ParentKeyRef = sourcePrimaryKey.properties.Id
              noneEdge.properties.changed = true
              change.obj.now = _.cloneDeep(noneEdge)
              changes.push(change)
            } else {
              if (!sourcePrimaryKey) {
                console.error('sourcePrimaryKey 为空')
              }
              let change = new Changes('deleteRelation', {
                name: noneEdge.properties.Name,
                id: noneEdge.properties.Id
              })
              this.$set(noneEdge.properties, 'deleted', true)
              changes.push(change)
              let cell = this.graph.graph.getDefaultParent().children.find(c => c.OwneeRef === noneEdge.properties.Id)
              let shape = this.diagram.children.find(s => s.properties.OwneeRef === noneEdge.properties.Id && !s.properties.deleted)
              this.$set(shape.properties, 'deleted', true)
              this.graph.graph.removeCells([cell])
              changes.push(new Changes('deleteConnection', {
                id: cell.Id,
                name: this.dataByType.relation[cell.OwneeRef].properties.Name
              }))
            }

            targetTable.properties.ColumnOrderArrayRefs = []
            let html = await this.getTableHTMLFunction(targetTable.properties.Id, this.graph.graph, null, null, true)
            target.value = html
          }
        }
        setTimeout(() => {
          this.graph.graph.setCellsMovable(true)
        })
        this.graph.graph.getView().refresh()
      }
      this.currentEdgeType = null
      return targetTablePrimaryKeyCurrentChanged
    },
    getDiagramDetail () {
      this.getDiagramContent(() => {
        Object.keys(this.dataByType.diagram[this.currentId]).forEach(k => {
          this.$set(this.diagram, k, this.dataByType.diagram[this.currentId][k])
        })
        this.$bus.$emit('updateTableToList')
        this.$bus.$emit('drawGraph')
        this.dataReady = true
        this.getRulecheck()
        this.prepareZoomData()
      })
    },
    addColumn (index) {
      this.tableDialogDataShow.children.splice(index, 0, _.cloneDeep(this.columnTemplate))
    },
    deleteColumn (index) {
      this.tableDialogDataShow.children.splice(index, 1)
      if (this.tableDialogDataShow.children.filter(column => column.objectClass === 'Datablau.LDM.EntityAttribute').length === 0) {
        this.tableDialogDataShow.properties = {
          Id: this.tableDialogDataShow.properties.Id,
          Name: this.tableDialogDataShow.properties.Name,
          RawType: this.tableDialogDataShow.properties.RawType
        }
        this.tableDialogDataShow.children = [_.cloneDeep(this.columnTemplate)]
      }
    },
    async editTableConfirm () {
      this.hasEdit = true
      this.dataByType.table[this.tableDialogId] = this.tableDialogDataShow
      let html = await this.getTableHTMLFunction(this.tableDialogId, this.graph.graph, null, null, true)
      this.tableDialogCell.value = html
      this.tableDialogCell.columnChanged = true
      this.graph.graph.getView().refresh()
      this.tableDialog = false
    },
    flatFormatTransfer (obj, parentId) {
      let res = {
        modelId: +this.currentModel.id,
        elementId: obj.properties[LDMTypes.Id],
        parentId,
        // combinedId: `${+this.currentModel.id}/${obj.properties[LDMTypes.Id]}`,
        alias: null,
        name: obj.properties[LDMTypes.Name],
        typeId: obj.properties[LDMTypes.TypeId],
        domainId: null,
        refCode: null,
        properties: {
          ...obj.properties
        },
        objectClass: obj.objectClass
      }
      if (obj.objectClass === 'Datablau.LDM.EntityAttribute') {
        if (obj.properties[LDMTypes.DataStandardRef]) {
          res.domainId = obj.properties[LDMTypes.DataStandardRef]
        }
        if (obj.properties[LDMTypes.LogicalName]) {
          res.alias = obj.properties[LDMTypes.LogicalName]
        }
        if (obj.properties[LDMTypes.DataStandardCode]) {
          res.refCode = obj.properties[LDMTypes.DataStandardCode]
        }
      }
      return res
    },
    compareKeyGroupMember (column, saveFlatFormat, added = false) {
      let children = column.children?.filter(member => !member.properties.deleted).map(member => {
        if (!member.properties.Name) {
          member.properties.Name = 'KeyGroupMember'
        }
        return {
          objectClass: member.objectClass,
          properties: {
            ...this.encodeData(member.properties)
          }
        }
      })
      let childrenBefore = column.childrenBefore?.filter(member => !member.properties.deleted).map(member => {
        if (!member.properties[LDMTypes.Name]) {
          member.properties[LDMTypes.Name] = 'KeyGroupMember'
        }
        return {
          objectClass: member.objectClass,
          properties: {
            ...member.properties
          }
        }
      })
      if (added) {
        children?.forEach(member => {
          saveFlatFormat.added.push(this.flatFormatTransfer(member, column.properties.Id))
        })
      } else {
        children?.forEach(member => {
          let mem = childrenBefore?.find(m2 => m2.properties[LDMTypes.Id] === member.properties[LDMTypes.Id])
          if (mem) {
            if (JSON.stringify(mem) === JSON.stringify(member)) {

            } else {
              saveFlatFormat.updated.push(this.flatFormatTransfer(member, column.properties.Id))
            }
          } else {
            saveFlatFormat.added.push(this.flatFormatTransfer(member, column.properties.Id))
          }
        })
        childrenBefore?.forEach(member => {
          let mem = children?.find(m2 => m2.properties[LDMTypes.Id] === member.properties[LDMTypes.Id])
          if (mem) {
          } else {
            saveFlatFormat.removed.push(member.properties[LDMTypes.Id])
          }
        })
      }
    },
    save (request) {
      this.loading.status = true
      let saveFlatFormat = {
        modelId: +this.currentModel.id,
        lastVersion: this.currentModel.currentVersion,
        added: [],
        removed: [],
        updated: [],
        udps: [],
        useProtobuf: this.currentModel.useProto
      }
      let graph = this.graph?.graph
      let parent = graph?.getDefaultParent()
      let colStyleMods = []
      let colStyleNews = []
      const shapeFormat = (mxCell) => {
        let currentShape = this.dataByType.diagram[this.currentId].children.find(v => !v.properties.deleted && v.properties.Id === mxCell.Id)
        let currentChildren = currentShape && currentShape.children
        let newChildren = currentChildren && currentChildren.filter(v => v.properties.new)
        let modChildren = currentChildren && currentChildren.filter(v => !v.properties.new && v.properties.changed)
        if (!currentShape.properties.Name) {
          currentShape.properties.Name = 'Shape'
        }
        let obj = this.encodeData(currentShape.properties)
        let res = {
          // objectClass: this.objectClassMap[mxCell.isTable ? (mxCell.isBusiness ? 'business' : 'table') : mxCell.isView ? 'view' : mxCell.isComment ? 'comment' : mxCell.isFigure ? 'figure' : ''],
          objectClass: currentShape.objectClass,
          properties: {
            ...obj
          }
        }
        // res.properties = {
        //   90000002: mxCell.Id,
        //   80000003: `${parseInt(mxCell.geometry.x)},${parseInt(mxCell.geometry.y)}`, // location
        //   80000026: `${Math.ceil(mxCell.geometry.width)},${Math.ceil(mxCell.geometry.height)}`, // shapeSize, 有可能自动计算为小数，向上取整
        //   90000011: mxCell.OwneeRef,
        //   80100056: false
        // }
        res.properties[90000002] = mxCell.Id
        res.properties[80000003] = `${parseInt(mxCell.geometry.x)},${parseInt(mxCell.geometry.y)}` // location
        res.properties[80000026] = `${Math.ceil(mxCell.geometry.width)},${Math.ceil(mxCell.geometry.height)}` // shapeSize, 有可能自动计算为小数，向上取整
        res.properties[90000011] = mxCell.OwneeRef
        res.properties[80100056] = false
        if (mxCell.isFigure || mxCell.isBusiness) {
          if (mxCell.isFigure) {
            delete res.properties[90000011]
          }
          res.properties[80010108] = mxCell.OrderNumber
          res.properties[80010302] = currentShape.properties.CompostedShapesRef
          if (mxCell.isPolygon) {
            let geometry = mxCell.geometry
            res.properties[81300061] = `${geometry.sourcePoint.x},${geometry.sourcePoint.y};` + geometry.points.map(p => `${p.x},${p.y};`).join('')
            res.properties[80000003] = `${parseInt(mxCell.geometry.sourcePoint.x)},${parseInt(mxCell.geometry.sourcePoint.y)}`
            if (mxCell.isLine) {
              res.properties[81300061] += `${geometry.targetPoint.x},${geometry.targetPoint.y}`
            }
          }
        }
        if (mxCell.StyleThemeRef) {
          res.properties[80010285] = mxCell.StyleThemeRef
        }
        if (mxCell.StyleTextColor) {
          res.properties[80500090] = mxCell.StyleTextColor
        }
        if (mxCell.StyleFont) {
          res.properties[80500089] = mxCell.StyleFont
        }
        let oweenId = mxCell.OwneeRef
        if (typeof oweenId === 'number' && this.graph.dataByType.table[oweenId]) {
          let posit = this.graph.dataByType.table[oweenId].posit
          if (posit && posit.Reference) {
            res.properties[80500060] = posit.Reference // reference
          }
        }
        if (mxCell.StyleBackColor) {
          res.properties[80500087] = mxCell.StyleBackColor
        }
        if (mxCell.StyleBackColor2) {
          res.properties[80500088] = mxCell.StyleBackColor2
        }
        if (mxCell.new) {
          saveFlatFormat.added.push(this.flatFormatTransfer(res, this.currentId))
        } else if (mxCell.changed) {
          saveFlatFormat.updated.push(this.flatFormatTransfer(res, this.currentId))
        }
        if (modChildren) {
          // let currentMod = modChildren.map(v => ({
          //   properties: {
          //     90000002: v.properties.Id,
          //     80500087: v.properties.StyleBackColor,
          //     80500089: v.properties.StyleFont,
          //     80500090: v.properties.StyleTextColor
          //   }
          // }))
          let currentMod = modChildren.map(v => {
            let obj = this.encodeData(v.properties)
            return {
              objectClass: v.objectClass,
              properties: {
                ...obj
              }
            }
          })
          saveFlatFormat.updated = saveFlatFormat.updated.concat(currentMod.map(obj => this.flatFormatTransfer(obj, mxCell.Id)))
          colStyleMods = colStyleMods.concat(currentMod)
        }
        if (newChildren) {
          // let currentNew = newChildren.map(v => ({
          //   properties: {
          //     80500005: v.properties.AttributeRef,
          //     80000008: mxCell.Id,
          //     80500087: v.properties.StyleBackColor,
          //     80500089: v.properties.StyleFont,
          //     80500090: v.properties.StyleTextColor
          //   }
          // }))
          let currentNew = newChildren.map(v => {
            let obj = this.encodeData(v.properties)
            let res = {
              objectClass: v.objectClass,
              properties: {
                ...obj
              }
            }
            res.properties[80000008] = mxCell.Id
            return res
          })
          saveFlatFormat.added = saveFlatFormat.added.concat(currentNew.map(obj => this.flatFormatTransfer(obj, mxCell.Id)))
          colStyleNews = colStyleNews.concat(currentNew)
        }
        return res
      }
      const tableFormatToIndex = (tableList) => {
        return tableList?.map(table => {
          let obj = this.encodeData(table.properties)
          delete obj[80100007]
          let res = {
            objectClass: table.objectClass,
            propertiesBefore: table.propertiesBefore,
            properties: {
              ...obj
            },
            children: {
              80000093: { // 索引
                news: table.children ? table.children.filter(column => column.objectClass === 'Datablau.LDM.EntityKeyGroup' && !column.properties.deleted && column.properties.new).map(column => {
                  let properties = column.properties
                  let columnIds = properties.KeyGroupMemberRefs && properties.KeyGroupMemberRefs.map(memberId => {
                    let findedMember = column.children.find(member => {
                      return member.properties.Id === memberId
                    })
                    if (findedMember) {
                      let findedColumn = table.children.find(column => column.properties.Id === findedMember.properties.AttributeRef)
                      if (findedColumn) {
                        return findedColumn.properties.Id
                      } else {
                        return null
                      }
                    } else {
                      return null
                    }
                  }).filter(columnId => columnId)
                  let objColumn = this.encodeData(column.properties)
                  this.compareKeyGroupMember(column, saveFlatFormat, true)
                  // delete objColumn[80500005]
                  // delete objColumn[80500007]
                  // delete objColumn[80500060]
                  let res = {
                    objectClass: column.objectClass,
                    properties: {
                      ...objColumn
                    }
                  }
                  res.properties[80000096] = res.properties[80000096]?.join(',')
                  // res.properties[80500005] = columnIds
                  // res.properties[80500007] = column.children && column.children.filter(member => !member.properties.deleted).map(member => member.properties.OrderType || 'None')
                  // res.properties[80500060] = column.children && column.children.filter(member => !member.properties.deleted).map(member => member.properties.Reference)
                  return res
                }) : null,
                mods: table.children ? table.children.filter(column => (column.objectClass === 'Datablau.LDM.EntityKeyGroup' && !column.properties.new && !column.properties.deleted && column.properties.changed)).map(column => {
                  let properties = column.properties
                  let columnIds = properties.KeyGroupMemberRefs && properties.KeyGroupMemberRefs.map(memberId => {
                    let findMember = null
                    table.children.forEach(column => {
                      if (column.objectClass === 'Datablau.LDM.EntityKeyGroup' && !column.properties.deleted) {
                        column && column.children && column.children.forEach(member => {
                          if (member.properties.Id === memberId) {
                            findMember = member
                          }
                        })
                      }
                    })
                    if (!findMember || findMember.properties.deleted) {
                      return null
                    }
                    let findColumn = table.children.find(column => column.properties.Id === findMember.properties.AttributeRef)
                    if (!findColumn || findColumn.properties.deleted) {
                      return null
                    } else {
                      return findColumn.properties.Id
                    }
                  }).filter(columnId => columnId)
                  let KeyGroupMemberRefs = properties.KeyGroupMemberRefs && properties.KeyGroupMemberRefs.map(memberId => {
                    let findMember = null
                    table.children.forEach(column => {
                      if (column.objectClass === 'Datablau.LDM.EntityKeyGroup' && !column.properties.deleted) {
                        column && column.children && column.children.forEach(member => {
                          if (member.properties.Id === memberId) {
                            findMember = member
                          }
                        })
                      }
                    })
                    if (!findMember || findMember.properties.deleted) {
                      return null
                    } else {
                      return findMember.properties.Id
                    }
                  }).filter(findMemberId => findMemberId)
                  let objColumn = this.encodeData(column.properties)
                  this.compareKeyGroupMember(column, saveFlatFormat)
                  // delete objColumn[80500005]
                  delete objColumn[80000096]
                  // delete objColumn[80500007]
                  // delete objColumn[80500060]
                  let res = {
                    objectClass: column.objectClass,
                    properties: {
                      ...objColumn
                    }
                  }
                  // res.properties[80500005] = columnIds
                  // res.properties[80500007] = column.children && column.children.filter(member => !member.properties.deleted).map(member => member.properties.OrderType || 'None')
                  // res.properties[80500060] = column.children && column.children.filter(member => !member.properties.deleted).map(member => member.properties.Reference)
                  res.properties[80000096] = KeyGroupMemberRefs?.join(',')
                  return res
                }) : null,
                dels: table.children ? table.children.filter(column => (column.objectClass === 'Datablau.LDM.EntityKeyGroup' && column.properties.deleted && !column.properties.new)).map(column => {
                  column.childrenBefore && (saveFlatFormat.removed = saveFlatFormat.removed.concat(column.childrenBefore?.map(member => member.properties[LDMTypes.Id])))
                  return column.properties.Id
                }) : null
              },
              [LDMTypes.Partition]: {
                news: table.children ? table.children.filter(column => column.objectClass === 'Datablau.LDM.Partition' && !column.properties.deleted && column.properties.new).map(column => {
                  let objColumn = this.encodeData(column.properties)
                  this.compareKeyGroupMember(column, saveFlatFormat, true)
                  let res = {
                    objectClass: column.objectClass,
                    properties: {
                      ...objColumn
                    }
                  }
                  return res
                }) : null,
                mods: table.children ? table.children.filter(column => (column.objectClass === 'Datablau.LDM.Partition' && !column.properties.new && !column.properties.deleted && column.properties.changed)).map(column => {
                  let objColumn = this.encodeData(column.properties)
                  this.compareKeyGroupMember(column, saveFlatFormat)
                  let res = {
                    objectClass: column.objectClass,
                    properties: {
                      ...objColumn
                    }
                  }
                  return res
                }) : null,
                dels: table.children ? table.children.filter(column => (column.objectClass === 'Datablau.LDM.Partition' && column.properties.deleted && !column.properties.new)).map(column => {
                  column.childrenBefore && (saveFlatFormat.removed = saveFlatFormat.removed.concat(column.childrenBefore?.map(member => member.properties[LDMTypes.Id])))
                  return column.properties.Id
                }) : null
              },
              [LDMTypes.Cluster]: {
                news: table.children ? table.children.filter(column => column.objectClass === 'Datablau.LDM.EntityCluster' && !column.properties.deleted && column.properties.new).map(column => {
                  let objColumn = this.encodeData(column.properties)
                  this.compareKeyGroupMember(column, saveFlatFormat, true)
                  let res = {
                    objectClass: column.objectClass,
                    properties: {
                      ...objColumn
                    }
                  }
                  return res
                }) : null,
                mods: table.children ? table.children.filter(column => (column.objectClass === 'Datablau.LDM.EntityCluster' && !column.properties.new && !column.properties.deleted && column.properties.changed)).map(column => {
                  let objColumn = this.encodeData(column.properties)
                  this.compareKeyGroupMember(column, saveFlatFormat)
                  let res = {
                    objectClass: column.objectClass,
                    properties: {
                      ...objColumn
                    }
                  }
                  return res
                }) : null,
                dels: table.children ? table.children.filter(column => (column.objectClass === 'Datablau.LDM.EntityCluster' && column.properties.deleted && !column.properties.new)).map(column => {
                  column.childrenBefore && (saveFlatFormat.removed = saveFlatFormat.removed.concat(column.childrenBefore?.map(member => member.properties[LDMTypes.Id])))
                  return column.properties.Id
                }) : null
              },
              [LDMTypes.Subtype]: {
                news: table.children ? table.children.filter(column => column.objectClass === 'Datablau.LDM.EntitySubtype' && !column.properties.deleted && column.properties.new).map(column => {
                  let objColumn = this.encodeData(column.properties)
                  let res = {
                    objectClass: column.objectClass,
                    properties: {
                      ...objColumn
                    }
                  }
                  return res
                }) : null,
                mods: table.children ? table.children.filter(column => (column.objectClass === 'Datablau.LDM.EntitySubtype' && !column.properties.new && !column.properties.deleted && column.properties.changed)).map(column => {
                  let objColumn = this.encodeData(column.properties)
                  let res = {
                    objectClass: column.objectClass,
                    properties: {
                      ...objColumn
                    }
                  }
                  return res
                }) : null,
                dels: table.children ? table.children.filter(column => (column.objectClass === 'Datablau.LDM.EntitySubtype' && column.properties.deleted && !column.properties.new)).map(column => {
                  return column.properties.Id
                }) : null
              },
              [LDMTypes.DWMapping]: {
                news: table.children ? table.children.filter(column => column.objectClass === 'Datablau.LDM.EntityDWMapping' && !column.properties.deleted && column.properties.new).map(column => {
                  let objColumn = this.encodeData(column.properties)
                  this.compareKeyGroupMember(column, saveFlatFormat, true)
                  let res = {
                    objectClass: column.objectClass,
                    properties: {
                      ...objColumn
                    }
                  }
                  return res
                }) : null,
                mods: table.children ? table.children.filter(column => (column.objectClass === 'Datablau.LDM.EntityDWMapping' && !column.properties.new && !column.properties.deleted && column.properties.changed)).map(column => {
                  let objColumn = this.encodeData(column.properties)
                  this.compareKeyGroupMember(column, saveFlatFormat)
                  let res = {
                    objectClass: column.objectClass,
                    properties: {
                      ...objColumn
                    }
                  }
                  return res
                }) : null,
                dels: table.children ? table.children.filter(column => (column.objectClass === 'Datablau.LDM.EntityDWMapping' && column.properties.deleted && !column.properties.new)).map(column => {
                  column.childrenBefore && (saveFlatFormat.removed = saveFlatFormat.removed.concat(column.childrenBefore?.map(member => member.properties[LDMTypes.Id])))
                  return column.properties.Id
                }) : null
              }
            }
          }
          res.properties[80100007] = table.children && table.children.filter(column => column.objectClass === 'Datablau.LDM.EntityAttribute' && !column.properties.deleted).map(column => column.properties.Id).join(',') // 前进回退不修改ColumnOrderArrayRefs，所以不能使用
          return res
          // let udps = Object.keys(table.properties).filter(key => typeof Number.parseInt(key) === 'number' && !isNaN(Number.parseInt(key))).map(key => ({ [key]: table.properties[key] }))
          // let res = {
          //   objectClass: table.properties.TypeId === 80000004 ? 'Datablau.LDM.EntityComposite' : table.properties.TypeId === 80100073 ? 'Datablau.LDM.EntityBusinessObject' : 'Datablau.LDM.EntityView',
          //   properties: {
          //     90000002: table.properties.Id,
          //     90000003: table.properties.Name,
          //     80010058: table.properties.LogicalName,
          //     90000004: table.properties.Definition,
          //     80010141: table.properties.IsPhysicalOnly,
          //     80100052: table.properties.IsLogicalOnly,
          //     80700005: table.properties.SchemaRef,
          //     80500086: table.properties.CommonMemberRefs,
          //     // 80100007: table.properties.ColumnOrderArrayRefs
          //     80100007: table.children && table.children.filter(column => column.objectClass === 'Datablau.LDM.EntityAttribute' && !column.properties.deleted).map(column => column.properties.Id) // 前进回退不修改ColumnOrderArrayRefs，所以不能使用
          //   },
          //   children: {
          //     80000093: { // 索引
          //       news: table.children ? table.children.filter(column => column.objectClass === 'Datablau.LDM.EntityKeyGroup' && !column.properties.deleted && column.properties.Id < 0).map(column => {
          //         let properties = column.properties
          //         let columnIds = properties.KeyGroupMemberRefs && properties.KeyGroupMemberRefs.map(memberId => {
          //           let findedMember = column.children.find(member => {
          //             return member.properties.Id === memberId
          //           })
          //           if (findedMember) {
          //             let findedColumn = table.children.find(column => column.properties.Id === findedMember.properties.AttributeRef)
          //             if (findedColumn) {
          //               return findedColumn.properties.Id
          //             } else {
          //               return null
          //             }
          //           } else {
          //             return null
          //           }
          //         }).filter(columnId => columnId)
          //         return {
          //           properties: {
          //             90000002: properties.Id,
          //             90000003: properties.Name,
          //             80000097: properties.KeyGroupType,
          //             80010138: properties.Macro,
          //             80500005: columnIds,
          //             80000096: properties.KeyGroupMemberRefs,
          //             80500007: column.children && column.children.filter(member => !member.properties.deleted).map(member => member.properties.OrderType || 'None'),
          //             80500060: column.children && column.children.filter(member => !member.properties.deleted).map(member => member.properties.Reference),
          //             80010141: false,
          //             80100052: false
          //           }
          //         }
          //       }) : null,
          //       mods: table.children ? table.children.filter(column => (column.objectClass === 'Datablau.LDM.EntityKeyGroup' && column.properties.Id > 0 && !column.properties.deleted)).map(column => {
          //         let properties = column.properties
          //         console.log(properties, 'prop')
          //         let columnIds = properties.KeyGroupMemberRefs && properties.KeyGroupMemberRefs.map(memberId => {
          //           let findMember = null
          //           table.children.forEach(column => {
          //             if (column.objectClass === 'Datablau.LDM.EntityKeyGroup' && !column.properties.deleted) {
          //               column && column.children && column.children.forEach(member => {
          //                 if (member.properties.Id === memberId) {
          //                   findMember = member
          //                 }
          //               })
          //             }
          //           })
          //           if (!findMember || findMember.properties.deleted) {
          //             return null
          //           }
          //           let findColumn = table.children.find(column => column.properties.Id === findMember.properties.AttributeRef)
          //           if (findColumn.properties.deleted) {
          //             return null
          //           } else {
          //             return findColumn.properties.Id
          //           }
          //         }).filter(columnId => columnId)
          //         let KeyGroupMemberRefs = properties.KeyGroupMemberRefs && properties.KeyGroupMemberRefs.map(memberId => {
          //           let findMember = null
          //           table.children.forEach(column => {
          //             if (column.objectClass === 'Datablau.LDM.EntityKeyGroup' && !column.properties.deleted) {
          //               column && column.children && column.children.forEach(member => {
          //                 if (member.properties.Id === memberId) {
          //                   findMember = member
          //                 }
          //               })
          //             }
          //           })
          //           if (!findMember || findMember.properties.deleted) {
          //             return null
          //           } else {
          //             return findMember.properties.Id
          //           }
          //         }).filter(findMemberId => findMemberId)
          //         return {
          //           properties: {
          //             90000002: properties.Id,
          //             90000003: properties.Name,
          //             80000097: properties.KeyGroupType,
          //             80010138: properties.Macro,
          //             80500005: columnIds,
          //             80000096: KeyGroupMemberRefs,
          //             80500007: column.children && column.children.filter(member => !member.properties.deleted).map(member => member.properties.OrderType || 'None'),
          //             80500060: column.children && column.children.filter(member => !member.properties.deleted).map(member => member.properties.Reference)
          //           }
          //         }
          //       }) : null,
          //       dels: table.children ? table.children.filter(column => (column.objectClass === 'Datablau.LDM.EntityKeyGroup' && column.properties.deleted && column.properties.Id > 0)).map(column => column.properties.Id) : null
          //     }
          //   }
          // }
          // if (table.properties.TypeId === LDMTypes.View) {
          //   res.properties[80500009] = table.properties.SQL
          // }
          // if (udps.length) {
          //   _.merge(res.properties, udps.reduce((pre, cur) => ({ ...pre, ...cur })))
          // }
          // return res
        })
      }
      let tableIds = new Set()
      let tableIndexModifyObjList = tableFormatToIndex(Array.from(new Set([...Object.values(this.dataByType.relation).filter(relation => !relation.properties.deleted && relation.properties.changed).map(relation => {
        if (relation.objectClass === 'Datablau.LDM.RelationshipRelational' || relation.objectClass === 'Datablau.LDM.RelationshipSubtype') {
          let childId = relation.properties.ChildEntityRef
          if (!tableIds.has(childId)) {
            tableIds.add(childId)
            return this.dataByType.table[childId]
          } else {
            return null
          }
        }
      }).filter(o => o).filter(table => !table.properties.deleted && !table.properties.new), ...Object.values(this.dataByType.table).filter(table => table.properties.changed && !table.properties.deleted && !table.properties.new)])))
      let tableIndexInsertObjList = tableFormatToIndex(Object.values(this.dataByType.table).filter(table => !table.properties.deleted && table.properties.new))

      const tableFormatToColumnModified = (tableList) => {
        let list = tableList.map(table => {
          let obj = this.encodeData(table.properties)
          delete obj[80100007]
          let res = {
            objectClass: table.objectClass,
            propertiesBefore: table.propertiesBefore,
            properties: {
              ...obj
            }
          }
          res.properties[80100007] = table.children && table.children.filter(column => column.objectClass === 'Datablau.LDM.EntityAttribute' && !column.properties.deleted).map(column => column.properties.Id).join(',')
          if (table.children) {
            res.children = {
              80000005: { // 字段
                news: table.children.filter(column => column.objectClass === 'Datablau.LDM.EntityAttribute' && column.properties.new && !column.properties.deleted).map(
                  column => {
                    let objColumn = this.encodeData(column.properties)
                    let res = {
                      objectClass: column.objectClass,
                      properties: {
                        ...objColumn
                      }
                    }
                    return res
                  }),
                mods: table.children && table.children.filter(column => column.objectClass === 'Datablau.LDM.EntityAttribute' && !column.properties.new && column.properties.changed && !column.properties.deleted).map(
                  column => {
                    let objColumn = this.encodeData(column.properties)
                    let res = {
                      objectClass: column.objectClass,
                      properties: {
                        ...objColumn
                      }
                    }
                    return res
                  }),
                dels: table.children && table.children.filter(column => column.objectClass === 'Datablau.LDM.EntityAttribute' && !column.properties.new && column.properties.deleted).map(
                  column => column.properties.Id)
              }
            }
          }
          return res
          // let udps = Object.keys(table.properties).filter(key => typeof Number.parseInt(key) === 'number' && !isNaN(Number.parseInt(key))).map(key => ({ [key]: table.properties[key] }))
          // let res = {
          //   properties: {
          //     90000002: table.properties.Id,
          //     90000003: table.properties.Name,
          //     80010058: table.properties.LogicalName,
          //     90000004: table.properties.Definition,
          //     80010141: table.properties.IsPhysicalOnly,
          //     80100052: table.properties.IsLogicalOnly,
          //     80700005: table.properties.SchemaRef,
          //     80500086: table.properties.CommonMemberRefs,
          //     80100007: table.children && table.children.filter(column => column.objectClass === 'Datablau.LDM.EntityAttribute' && !column.properties.deleted).map(column => column.properties.Id)
          //   }
          // }
          // if (table.children) {
          //   res.children = {
          //     80000005: { // 字段
          //       news: table.children.filter(column => column.objectClass === 'Datablau.LDM.EntityAttribute' && column.properties.Id < 0 && !column.properties.deleted).map(
          //         column => {
          //           let properties = column.properties
          //           let insertColumnUdps = Object.keys(properties).filter(key => typeof Number.parseInt(key) === 'number' && !isNaN(Number.parseInt(key))).map(key => ({ [key]: table.properties[key] }))
          //           let res = {
          //             properties: {
          //               90000002: properties.Id,
          //               90000003: properties.Name,
          //               80010058: properties.LogicalName,
          //               90000004: properties.Definition,
          //               80000002: properties.DataType,
          //               80100034: properties.DefaultValue,
          //               80010141: properties.IsPhysicalOnly,
          //               80100033: properties.IsNotNull,
          //               80500058: properties.DataStandardRef,
          //               80010111: properties.DataStandardCode,
          //               80100052: properties.IsLogicalOnly,
          //               80100035: properties.IsAutoIncrement,
          //               80500066: properties.StartingValue,
          //               80600135: properties.IdentityIncrementBy,
          //               80600133: properties.IdentityMaxValue,
          //               80600134: properties.IdentityMinValue,
          //               80600138: properties.IdentityCacheValue,
          //               80600137: properties.IsIdentityOrder,
          //               80600136: properties.IsIdentityCycle,
          //               80500060: properties.Reference,
          //               80000022: properties.Text
          //             }
          //           }
          //           if (insertColumnUdps.length) {
          //             _.merge(res.properties, insertColumnUdps.reduce((pre, cur) => ({ ...pre, ...cur })))
          //           }
          //           return res
          //         }),
          //       mods: table.children && table.children.filter(column => column.objectClass === 'Datablau.LDM.EntityAttribute' && column.properties.Id > 0 && column.properties.changed && !column.properties.deleted).map(
          //         column => {
          //           let properties = column.properties
          //           let modifiedColumnUdps = Object.keys(properties).filter(key => typeof Number.parseInt(key) === 'number' && !isNaN(Number.parseInt(key))).map(key => ({ [key]: properties[key] }))
          //           let res = {
          //             properties: {
          //               90000002: properties.Id,
          //               90000003: properties.Name,
          //               80010058: properties.LogicalName,
          //               90000004: properties.Definition,
          //               80000002: properties.DataType,
          //               80100034: properties.DefaultValue,
          //               80010141: properties.IsPhysicalOnly,
          //               80100033: properties.IsNotNull,
          //               80500058: properties.DataStandardRef,
          //               80010111: properties.DataStandardCode,
          //               80100052: properties.IsLogicalOnly,
          //               80010059: properties.EnName,
          //               80100035: properties.IsAutoIncrement,
          //               80500066: properties.StartingValue,
          //               80600135: properties.IdentityIncrementBy,
          //               80600133: properties.IdentityMaxValue,
          //               80600134: properties.IdentityMinValue,
          //               80600138: properties.IdentityCacheValue,
          //               80600137: properties.IsIdentityOrder,
          //               80600136: properties.IsIdentityCycle,
          //               80500060: properties.Reference,
          //               80000022: properties.Text
          //             }
          //           }
          //           if (modifiedColumnUdps.length) {
          //             _.merge(res.properties, modifiedColumnUdps.reduce((pre, cur) => ({ ...pre, ...cur })))
          //           }
          //           return res
          //         }),
          //       dels: table.children && table.children.filter(column => column.objectClass === 'Datablau.LDM.EntityAttribute' && column.properties.Id > 0 && column.properties.deleted).map(
          //         column => column.properties.Id)
          //     }
          //   }
          // }
          // if (udps.length) {
          //   _.merge(res.properties, udps.reduce((pre, cur) => ({ ...pre, ...cur })))
          // }
          // return res
        })
        return list
      }
      tableIds = new Set()
      let tableColumnModifiedObjList = tableFormatToColumnModified(Array.from(new Set([...Object.values(this.dataByType.relation).filter(relation => !relation.properties.deleted && relation.properties.changed).map(relation => {
        if (relation.objectClass === 'Datablau.LDM.RelationshipRelational' || relation.objectClass === 'Datablau.LDM.RelationshipSubtype') {
          let childId = relation.properties.ChildEntityRef
          if (!tableIds.has(childId)) {
            tableIds.add(childId)
            return this.dataByType.table[childId]
          } else {
            return null
          }
        }
      }).filter(o => o).filter(table => !table.properties.deleted && !table.properties.new), ...Object.values(this.dataByType.table).filter(table => !table.properties.new && !table.properties.deleted && ((table.children && table.children.filter(column => column.objectClass === 'Datablau.LDM.EntityAttribute' && !column.properties.deleted && column.properties.new).length > 0) || table.properties.changed))])))
      let tableColumnInsertObjList = tableFormatToColumnModified(Object.values(this.dataByType.table).filter(table => table.properties.new && !table.properties.deleted))
      tableColumnModifiedObjList.forEach(item => {
        let findedItem = tableIndexModifyObjList.find(item2 => item.properties[90000002] === item2.properties[90000002])
        if (findedItem) {
          _.merge(findedItem, item)
        } else {
          tableIndexModifyObjList.push(item)
        }
      })
      tableIndexModifyObjList.forEach(obj => { // table的修改
        if (!obj.properties[LDMTypes.SchemaRef]) {
          delete obj.properties[LDMTypes.SchemaRef]
        }
        if (JSON.stringify(obj.properties) !== JSON.stringify(obj.propertiesBefore)) {
          saveFlatFormat.updated.push(this.flatFormatTransfer(obj, this.currentModel.Id))
        }
        obj.children[LDMTypes.Attribute]?.mods && (saveFlatFormat.updated = saveFlatFormat.updated.concat(obj.children[LDMTypes.Attribute].mods.map(column => this.flatFormatTransfer(column, obj.properties[LDMTypes.Id]))))
        obj.children[LDMTypes.Attribute]?.news && (saveFlatFormat.added = saveFlatFormat.added.concat(obj.children[LDMTypes.Attribute].news.map(column => this.flatFormatTransfer(column, obj.properties[LDMTypes.Id]))))
        obj.children[LDMTypes.Attribute]?.dels && (saveFlatFormat.removed = saveFlatFormat.removed.concat(obj.children[LDMTypes.Attribute].dels))
        obj.children[LDMTypes.KeyGroup]?.mods && (saveFlatFormat.updated = saveFlatFormat.updated.concat(obj.children[LDMTypes.KeyGroup].mods.map(keygroup => this.flatFormatTransfer(keygroup, obj.properties[LDMTypes.Id]))))
        obj.children[LDMTypes.KeyGroup]?.news && (saveFlatFormat.added = saveFlatFormat.added.concat(obj.children[LDMTypes.KeyGroup].news.map(keygroup => this.flatFormatTransfer(keygroup, obj.properties[LDMTypes.Id]))))
        obj.children[LDMTypes.KeyGroup]?.dels && (saveFlatFormat.removed = saveFlatFormat.removed.concat(obj.children[LDMTypes.KeyGroup].dels))
        obj.children[LDMTypes.Partition]?.mods && (saveFlatFormat.updated = saveFlatFormat.updated.concat(obj.children[LDMTypes.Partition].mods.map(partition => this.flatFormatTransfer(partition, obj.properties[LDMTypes.Id]))))
        obj.children[LDMTypes.Partition]?.news && (saveFlatFormat.added = saveFlatFormat.added.concat(obj.children[LDMTypes.Partition].news.map(partition => this.flatFormatTransfer(partition, obj.properties[LDMTypes.Id]))))
        obj.children[LDMTypes.Partition]?.dels && (saveFlatFormat.removed = saveFlatFormat.removed.concat(obj.children[LDMTypes.Partition].dels))
        obj.children[LDMTypes.Cluster]?.mods && (saveFlatFormat.updated = saveFlatFormat.updated.concat(obj.children[LDMTypes.Cluster].mods.map(cluster => this.flatFormatTransfer(cluster, obj.properties[LDMTypes.Id])))) // properties属性的修改，别忘了
        obj.children[LDMTypes.Cluster]?.news && (saveFlatFormat.added = saveFlatFormat.added.concat(obj.children[LDMTypes.Cluster].news.map(cluster => this.flatFormatTransfer(cluster, obj.properties[LDMTypes.Id]))))
        obj.children[LDMTypes.Cluster]?.dels && (saveFlatFormat.removed = saveFlatFormat.removed.concat(obj.children[LDMTypes.Cluster].dels))
        obj.children[LDMTypes.Subtype]?.mods && (saveFlatFormat.updated = saveFlatFormat.updated.concat(obj.children[LDMTypes.Subtype].mods.map(subtype => this.flatFormatTransfer(subtype, obj.properties[LDMTypes.Id]))))
        obj.children[LDMTypes.Subtype]?.news && (saveFlatFormat.added = saveFlatFormat.added.concat(obj.children[LDMTypes.Subtype].news.map(subtype => this.flatFormatTransfer(subtype, obj.properties[LDMTypes.Id]))))
        obj.children[LDMTypes.Subtype]?.dels && (saveFlatFormat.removed = saveFlatFormat.removed.concat(obj.children[LDMTypes.Subtype].dels))
        obj.children[LDMTypes.DWMapping]?.mods && (saveFlatFormat.updated = saveFlatFormat.updated.concat(obj.children[LDMTypes.DWMapping].mods.map(partition => this.flatFormatTransfer(partition, obj.properties[LDMTypes.Id]))))
        obj.children[LDMTypes.DWMapping]?.news && (saveFlatFormat.added = saveFlatFormat.added.concat(obj.children[LDMTypes.DWMapping].news.map(partition => this.flatFormatTransfer(partition, obj.properties[LDMTypes.Id]))))
        obj.children[LDMTypes.DWMapping]?.dels && (saveFlatFormat.removed = saveFlatFormat.removed.concat(obj.children[LDMTypes.DWMapping].dels))
      })
      tableColumnInsertObjList.forEach(item => {
        let findedItem = tableIndexInsertObjList.find(item2 => item.properties[90000002] === item2.properties[90000002])
        if (findedItem) {
          _.merge(findedItem, item)
        } else {
          tableIndexInsertObjList.push(item)
        }
      })
      tableIndexInsertObjList.forEach(obj => { // table的插入
        saveFlatFormat.added.push(this.flatFormatTransfer(obj, this.currentModel.Id))
        obj.children[LDMTypes.Attribute]?.news && (saveFlatFormat.added = saveFlatFormat.added.concat(obj.children[LDMTypes.Attribute].news.map(column => this.flatFormatTransfer(column, obj.properties[LDMTypes.Id]))))
        obj.children[LDMTypes.KeyGroup]?.news && (saveFlatFormat.added = saveFlatFormat.added.concat(obj.children[LDMTypes.KeyGroup].news.map(keygroup => this.flatFormatTransfer(keygroup, obj.properties[LDMTypes.Id]))))
        obj.children[LDMTypes.Partition]?.news && (saveFlatFormat.added = saveFlatFormat.added.concat(obj.children[LDMTypes.Partition].news.map(partition => this.flatFormatTransfer(partition, obj.properties[LDMTypes.Id]))))
        obj.children[LDMTypes.Cluster]?.news && (saveFlatFormat.added = saveFlatFormat.added.concat(obj.children[LDMTypes.Cluster].news.map(cluster => this.flatFormatTransfer(cluster, obj.properties[LDMTypes.Id])))) // properties属性的修改，别忘了
        obj.children[LDMTypes.Subtype]?.news && (saveFlatFormat.added = saveFlatFormat.added.concat(obj.children[LDMTypes.Subtype].news.map(subtype => this.flatFormatTransfer(subtype, obj.properties[LDMTypes.Id]))))
        obj.children[LDMTypes.DWMapping]?.news && (saveFlatFormat.added = saveFlatFormat.added.concat(obj.children[LDMTypes.DWMapping].news.map(partition => this.flatFormatTransfer(partition, obj.properties[LDMTypes.Id]))))
      })
      saveFlatFormat.removed = saveFlatFormat.removed.concat(Object.values(this.dataByType.table).filter(table => !table.properties.new && table.properties.deleted).map(table => table.properties.Id))

      let viewIds = new Set()
      let viewIndexModifyObjList = tableFormatToIndex(Array.from(new Set([...Object.values(this.dataByType.relation).filter(relation => !relation.properties.deleted && relation.properties.changed).map(relation => {
        if (relation.objectClass === 'Datablau.LDM.RelationshipView') {
          let childId = relation.properties.ChildEntityRef
          if (!viewIds.has(childId)) {
            viewIds.add(childId)
            return this.dataByType.view[childId]
          } else {
            return null
          }
        }
      }).filter(o => o).filter(view => !view.properties.deleted && !view.properties.new), ...Object.values(this.dataByType.view).filter(view => view.properties.changed && !view.properties.deleted && !view.properties.new)])))
      let viewIndexInsertObjList = tableFormatToIndex(Object.values(this.dataByType.view).filter(view => !view.properties.deleted && view.properties.new))
      viewIds = new Set()
      let viewColumnModifiedObjList = tableFormatToColumnModified(Array.from(new Set([...Object.values(this.dataByType.relation).filter(relation => !relation.properties.deleted && relation.properties.changed).map(relation => {
        if (relation.objectClass === 'Datablau.LDM.RelationshipView') {
          let childId = relation.properties.ChildEntityRef
          if (!viewIds.has(childId)) {
            viewIds.add(childId)
            return this.dataByType.view[childId]
          } else {
            return null
          }
        }
      }).filter(o => o).filter(view => !view.properties.deleted && !view.properties.new), ...Object.values(this.dataByType.view).filter(view => !view.properties.new && !view.properties.deleted && ((view.children && view.children.filter(column => column.objectClass === 'Datablau.LDM.EntityAttribute' && !column.properties.deleted && column.properties.new).length > 0) || view.properties.changed))])))
      let viewColumnInsertObjList = tableFormatToColumnModified(Object.values(this.dataByType.view).filter(view => view.properties.new && !view.properties.deleted))
      viewColumnModifiedObjList.forEach(item => {
        let findedItem = viewIndexModifyObjList.find(item2 => item.properties[90000002] === item2.properties[90000002])
        if (findedItem) {
          _.merge(findedItem, item)
        } else {
          viewIndexModifyObjList.push(item)
        }
      })
      viewIndexModifyObjList.forEach(obj => { // view的修改
        if (!obj.properties[LDMTypes.SchemaRef]) {
          delete obj.properties[LDMTypes.SchemaRef]
        }
        if (JSON.stringify(obj.properties) !== JSON.stringify(obj.propertiesBefore)) {
          saveFlatFormat.updated.push(this.flatFormatTransfer(obj, this.currentModel.Id))
        }
        obj.children[LDMTypes.Attribute]?.mods && (saveFlatFormat.updated = saveFlatFormat.updated.concat(obj.children[LDMTypes.Attribute].mods.map(column => this.flatFormatTransfer(column, obj.properties[LDMTypes.Id]))))
        obj.children[LDMTypes.Attribute]?.news && (saveFlatFormat.added = saveFlatFormat.added.concat(obj.children[LDMTypes.Attribute].news.map(column => this.flatFormatTransfer(column, obj.properties[LDMTypes.Id]))))
        obj.children[LDMTypes.Attribute]?.dels && (saveFlatFormat.removed = saveFlatFormat.removed.concat(obj.children[LDMTypes.Attribute].dels))
        obj.children[LDMTypes.KeyGroup]?.mods && (saveFlatFormat.updated = saveFlatFormat.updated.concat(obj.children[LDMTypes.KeyGroup].mods.map(keygroup => this.flatFormatTransfer(keygroup, obj.properties[LDMTypes.Id]))))
        obj.children[LDMTypes.KeyGroup]?.news && (saveFlatFormat.added = saveFlatFormat.added.concat(obj.children[LDMTypes.KeyGroup].news.map(keygroup => this.flatFormatTransfer(keygroup, obj.properties[LDMTypes.Id]))))
        obj.children[LDMTypes.KeyGroup]?.dels && (saveFlatFormat.removed = saveFlatFormat.removed.concat(obj.children[LDMTypes.KeyGroup].dels))
      })
      viewColumnInsertObjList.forEach(item => {
        let findedItem = viewIndexInsertObjList.find(item2 => item.properties[90000002] === item2.properties[90000002])
        if (findedItem) {
          _.merge(findedItem, item)
        } else {
          viewIndexInsertObjList.push(item)
        }
      })
      viewIndexInsertObjList.forEach(obj => { // view的插入
        saveFlatFormat.added.push(this.flatFormatTransfer(obj, this.currentModel.Id))
        obj.children[LDMTypes.Attribute]?.news && (saveFlatFormat.added = saveFlatFormat.added.concat(obj.children[LDMTypes.Attribute].news.map(column => this.flatFormatTransfer(column, obj.properties[LDMTypes.Id]))))
        obj.children[LDMTypes.KeyGroup]?.news && (saveFlatFormat.added = saveFlatFormat.added.concat(obj.children[LDMTypes.KeyGroup].news.map(keygroup => this.flatFormatTransfer(keygroup, obj.properties[LDMTypes.Id]))))
      })
      saveFlatFormat.removed = saveFlatFormat.removed.concat(Object.values(this.dataByType.view).filter(view => !view.properties.new && view.properties.deleted).map(view => view.properties.Id))

      saveFlatFormat.removed = saveFlatFormat.removed.concat(Object.values(this.dataByType.comment).filter(comment => !comment.properties.new && comment.properties.deleted).map(comment => comment.properties.Id))

      if (this.dataByType.diagram[this.currentId]) {
        saveFlatFormat.removed = saveFlatFormat.removed.concat(this.dataByType.diagram[this.currentId].children.filter(i => !i.properties.new && i.properties.deleted).map(i => i.properties.Id))
      }

      saveFlatFormat.removed = saveFlatFormat.removed.concat(Object.values(this.dataByType.relation).filter(relation => relation.properties.deleted && !relation.properties.new).map(relation => relation.properties.Id))

      saveFlatFormat.removed = saveFlatFormat.removed.concat(Object.values(this.dataByType.theme).filter(theme => theme.properties.deleted && !theme.properties.new).map(theme => theme.properties.Id))

      saveFlatFormat.removed = saveFlatFormat.removed.concat(Object.values(this.dataByType.schema).filter(schema => schema.properties.deleted && !schema.properties.new).map(schema => schema.properties.Id))

      // let diagramSaveData = null
      // if (this.dataByType.diagram[this.currentId].properties.changed) {
      //   diagramSaveData = {
      //     mods: [{
      //       properties: {
      //         90000002: this.currentId,
      //         80010285: this.dataByType.diagram[this.currentId].properties.StyleThemeRef
      //       }
      //     }]
      //   }
      // }
      let diagramSaveData = {
        news: [],
        mods: [],
        dels: []
      }

      // let diagramChildren = {
      //   80000008: { // Shape
      //     news: parent.children && parent.children.filter(mxCell => (!mxCell.edge || mxCell.isPolygon) && (mxCell.value || mxCell.isFigure) && mxCell.new).map(shapeFormat),
      //     mods: parent.children && parent.children.filter(mxCell => (mxCell.changed || mxCell.colStyleChanged) && (!mxCell.edge || mxCell.isPolygon) && (mxCell.value || mxCell.isFigure) && !mxCell.new).map(shapeFormat),
      //     dels: this.dataByType.diagram[this.currentId].children.filter(i => !i.properties.new && i.properties.deleted && i.objectClass.indexOf('Datablau.ERD.Connection') === -1).map(i => i.properties.Id)
      //   },
      //   80000009: { // connection
      //     news: parent.children && parent.children.filter(cell => cell.edge && !cell.isPolygon && cell.new).map(cell => { // 有些线没有relation仅创建了connection要传递保存信息
      //       let shape = this.dataByType.diagram[this.currentId].children.find(i => !i.properties.deleted && cell.Id === i.properties.Id)
      //       let obj = this.encodeData(shape.properties)
      //       let res = {
      //         objectClass: shape.objectClass,
      //         properties: {
      //           ...obj
      //         }
      //       }
      //       _.merge(res.properties, {
      //         90000002: cell.Id,
      //         80500056: cell.EndOrientation,
      //         80500055: cell.StartOrientation,
      //         80500057: cell.CurrentBendPoints,
      //         80000060: cell.source ? cell.source.Id : -1,
      //         80000061: cell.target ? cell.target.Id : -1,
      //         90000011: cell.OwneeRef
      //       })
      //       if (shape.properties.StyleBackColor) {
      //         res.properties[80500087] = shape.properties.StyleBackColor
      //       }
      //       if (shape.properties.StyleBackColor2) {
      //         res.properties[80500088] = shape.properties.StyleBackColor2
      //       }
      //       if (!cell.OwneeRef) {
      //         delete res.properties[90000011]
      //       }
      //       return res
      //     }),
      //     mods: parent.children && parent.children.filter(cell => cell.edge && !cell.isPolygon && cell.changed && !cell.new).map(cell => { // 有些线没有relation修改了起始点和结束点也要传递保存信息, changed属性只在了cell上有，shape上没有同步有changed属性，但是有new属性, cell也有new属性
      //       let shape = this.dataByType.diagram[this.currentId].children.find(i => !i.properties.deleted && cell.Id === i.properties.Id)
      //       let obj = this.encodeData(shape.properties)
      //       let res = {
      //         objectClass: shape.objectClass,
      //         properties: {
      //           ...obj
      //         }
      //       }
      //       _.merge(res.properties, {
      //         90000002: cell.Id,
      //         80500056: cell.EndOrientation,
      //         80500055: cell.StartOrientation,
      //         80500057: cell.CurrentBendPoints,
      //         80000060: cell.source ? cell.source.Id : -1,
      //         80000061: cell.target ? cell.target.Id : -1,
      //         90000011: cell.OwneeRef
      //       })
      //       if (shape.properties.StyleBackColor) {
      //         res.properties[80500087] = shape.properties.StyleBackColor
      //       }
      //       if (shape.properties.StyleBackColor2) {
      //         res.properties[80500088] = shape.properties.StyleBackColor2
      //       }
      //       return res
      //     }),
      //     dels: this.dataByType.diagram[this.currentId].children.filter(i => !i.properties.new && i.properties.deleted && i.objectClass.indexOf('Datablau.ERD.Connection') !== -1).map(i => i.properties.Id)
      //   }
      // }

      const compareDiff = (preTree, tree, news, mods, dels) => {
        if (!preTree) {
          if (!tree) {

          } else {
            news.splice(news.length - 1, 0, ...(tree.filter(item => item.new)))
          }
        } else {
          if (!tree) {
            dels.splice(dels.length - 1, 0, ...(preTree.filter(item => !item.new)))
          } else {
            preTree.forEach(node => {
              let node1 = tree.find(node1 => node1.Id === node.Id)
              if (!node1) {
                dels.push(node)
              }
            })
            tree.forEach(node => {
              let node1 = preTree.find(node1 => node1.Id === node.Id)
              if (!node1) {
                news.push(node)
              } else {
                if (node.changed) {
                  mods.push(node)
                  // 子节点也可能改变
                  compareDiff(node1.children, node.children, news, mods, dels)
                } else {
                  compareDiff(node1.children, node.children, news, mods, dels)
                }
              }
            })
          }
        }
      }

      compareDiff(this.preDiagrams, this.diagrams, diagramSaveData.news, diagramSaveData.mods, diagramSaveData.dels)
      diagramSaveData.news = diagramSaveData.news.sort((a, b) => { return b - a })
      // console.log(this.preDiagrams, this.diagrams, diagramSaveData)
      const diagramFormat = (item) => {
        let obj = this.encodeData(item)
        let res = {
          objectClass: 'Datablau.ERD.Diagram',
          properties: {
            ...obj
          }
        }
        // let res = {
        //   properties: {
        //     90000003: item.Name,
        //     90000002: item.Id,
        //     80100000: true, // IsOpen,
        //     90000004: item.Definition,
        //     80010285: item.StyleThemeRef
        //   }
        // }
        // let udps = Object.keys(item).filter(key => typeof Number.parseInt(key) === 'number' && !isNaN(Number.parseInt(key))).map(key => ({ [key]: item[key] }))
        // if (udps.length) {
        //   _.merge(res.properties, udps.reduce((pre, cur) => ({ ...pre, ...cur })))
        // }
        if (item.ParentRef) {
          res.properties[80500060] = item.ParentRef.Id
        }
        return res
      }
      diagramSaveData.dels = diagramSaveData.dels.map(item => item.Id)
      saveFlatFormat.removed = saveFlatFormat.removed.concat(diagramSaveData.dels)
      const findDeepItems = (list, res) => {
        if (!list) {
          return
        }
        list.map(diagramFormat).forEach(item => {
          res.push(item)
        })
        list.forEach(node => {
          if (node.new) {
            findDeepItems(node.children, res)
          }
        })
      }
      let res = []
      findDeepItems(diagramSaveData.news, res)
      diagramSaveData.news = res
      saveFlatFormat.added = saveFlatFormat.added.concat(diagramSaveData.news.map(obj => this.flatFormatTransfer(obj, obj.properties[LDMTypes.Reference] || this.currentModel.Id)))
      diagramSaveData.mods = diagramSaveData.mods.map(diagramFormat)
      saveFlatFormat.updated = saveFlatFormat.updated.concat(diagramSaveData.mods.map(obj => this.flatFormatTransfer(obj, obj.properties[LDMTypes.Reference] || this.currentModel.Id)))
      let modelChanges = []
      if (this.currentModel.changed) {
        // 模型外部名称需另一个接口保存
        // HTTP.modModelInfo({
        //   name: this.currentModel.Name,
        //   description: this.currentModel.Definition,
        //   id: +this.currentModel.id
        // }).then(res => {
        //   // eslint-disable-next-line handle-callback-err
        // }).catch(err => {
        // })
        let obj = this.encodeData(this.currentModel)
        modelChanges.push({
          properties: {
            ...obj
          }
        })
        // modelChanges.push({
        //   properties: {
        //     90000003: this.currentModel.Name,
        //     90000004: this.currentModel.Definition,
        //     90000002: this.currentModel.Id,
        //     ...this.currentModel.allUdps
        //   }
        // })
        saveFlatFormat.updated.push(this.flatFormatTransfer({
          properties: {
            ...obj
          }
        }, 0)) // modelSource的parentId 为0
      }

      let namingOptionChanges = []
      let { namingOption } = this.dataByType
      if (namingOption.changed) {
        let obj = this.encodeData(namingOption)
        let res = {
          objectClass: 'Datablau.LDM.NamingOption',
          properties: {
            ...obj
          }
        }
        namingOptionChanges.push(res)
        // namingOptionChanges.push({
        //   properties: {
        //     90000002: namingOption.Id,
        //     80010175: namingOption.PKDefaultMacro,
        //     80010176: namingOption.UKDefaultMacro,
        //     80010177: namingOption.FKDefaultMacro,
        //     80010178: namingOption.NUKDefaultMacro,
        //     80500102: namingOption.TableNameCase,
        //     80500103: namingOption.TableNamePrefix,
        //     80500104: namingOption.TableNamePostfix,
        //     80500105: namingOption.TableNameMaxLength,
        //     80500106: namingOption.ColumnNameCase,
        //     80500107: namingOption.ColumnNamePrefix,
        //     80500108: namingOption.ColumnNamePostfix,
        //     80500109: namingOption.ColumnNameMaxLength,
        //     80500110: namingOption.IndexNameCase,
        //     80500111: namingOption.IndexNameMaxLength,
        //     80500112: namingOption.NamingSeperator,
        //     // 80500113: namingOption.IsUsingRealTimeTranslate,
        //     80500114: namingOption.IsTableTranslateEnabled,
        //     80500115: namingOption.IsColumnTranslateEnabled,
        //     80500116: namingOption.IsIndexTranslateEnabled
        //   }
        // })
        saveFlatFormat.updated.push(this.flatFormatTransfer(res, this.currentModel.Id))
      }
      let params = {
        name: this.currentName,
        diagramId: this.currentId,
        properties: {
          80010001: { // 模型修改
            mods: modelChanges
          },
          80500101: { // 命名设置
            mods: namingOptionChanges
          },
          80000006: diagramSaveData, // diagram
          80100073: { // business
            mods: tableIndexModifyObjList.filter(table => table.objectClass === 'Datablau.LDM.EntityBusinessObject'),
            news: tableIndexInsertObjList.filter(table => table.objectClass === 'Datablau.LDM.EntityBusinessObject'),
            dels: Object.values(this.dataByType.table).filter(table => !table.properties.new && table.properties.deleted && table.objectClass === 'Datablau.LDM.EntityBusinessObject').map(table => table.properties.Id)
          },
          80000004: { // table
            mods: tableIndexModifyObjList.filter(table => table.objectClass === 'Datablau.LDM.EntityComposite'),
            news: tableIndexInsertObjList.filter(table => table.objectClass === 'Datablau.LDM.EntityComposite'),
            dels: Object.values(this.dataByType.table).filter(table => !table.properties.new && table.properties.deleted && table.objectClass === 'Datablau.LDM.EntityComposite').map(table => table.properties.Id)
          },
          80500008: { // view
            mods: viewIndexModifyObjList,
            news: viewIndexInsertObjList,
            dels: Object.values(this.dataByType.view).filter(view => !view.properties.new && view.properties.deleted).map(view => view.properties.Id)
          },
          80000027: { // comment
            // mods: Object.values(this.dataByType.comment).filter(comment => comment.properties.Id > 0 && !comment.properties.deleted && comment.properties.changed).map(comment => ({
            //   properties: {
            //     90000002: comment.properties.Id,
            //     90000003: comment.properties.Name,
            //     80000022: comment.properties.Text
            //   }
            // })),
            // news: Object.values(this.dataByType.comment).filter(comment => comment.properties.Id < 0 && !comment.properties.deleted).map(comment => ({
            //   properties: {
            //     90000002: comment.properties.Id,
            //     80000022: comment.properties.Text
            //   }
            // })),
            mods: Object.values(this.dataByType.comment).filter(comment => !comment.properties.new && !comment.properties.deleted && comment.properties.changed).map(comment => {
              let obj = this.encodeData(comment.properties)
              let res = {
                objectClass: comment.objectClass,
                properties: {
                  ...obj
                }
              }
              saveFlatFormat.updated.push(this.flatFormatTransfer(res, this.currentModel.Id))
              return res
            }),
            news: Object.values(this.dataByType.comment).filter(comment => comment.properties.new && !comment.properties.deleted).map(comment => {
              let obj = this.encodeData(comment.properties)
              let res = {
                objectClass: comment.objectClass,
                properties: {
                  ...obj
                }
              }
              saveFlatFormat.added.push(this.flatFormatTransfer(res, this.currentModel.Id))
              return res
            }),
            dels: Object.values(this.dataByType.comment).filter(comment => !comment.properties.new && comment.properties.deleted).map(comment => comment.properties.Id)
          },
          80000008: parent ? { // Shape
            news: parent.children && parent.children.filter(mxCell => (!mxCell.edge || mxCell.isPolygon) && (mxCell.value || mxCell.isFigure) && mxCell.new).map(shapeFormat),
            mods: parent.children && parent.children.filter(mxCell => (mxCell.changed || mxCell.colStyleChanged) && (!mxCell.edge || mxCell.isPolygon) && (mxCell.value || mxCell.isFigure) && !mxCell.new).map(shapeFormat),
            // dels: this.deleteGraph.filter(i => i.Id >= 0).map(i => i.Id)
            dels: this.dataByType.diagram[this.currentId].children.filter(i => !i.properties.new && i.properties.deleted && i.objectClass.indexOf('Datablau.ERD.Connection') === -1).map(i => i.properties.Id)
          } : {},
          80800042: {
            mods: colStyleMods,
            news: colStyleNews,
            dels: []
          },
          80000007: { // relation
            news: Object.values(this.dataByType.relation).filter(relation => !relation.properties.deleted && relation.properties.new).map(relation => {
              // let res = {
              //   objectClass: relation.objectClass,
              //   properties: {
              //     90000002: relation.properties.Id,
              //     90000003: relation.properties.Name,
              //     80000072: relation.properties.EndCardinality,
              //     80000021: relation.properties.Label,
              //     80000052: relation.properties.ParentEntityRef,
              //     80000053: relation.properties.ChildEntityRef,
              //     80000070: relation.properties.RelationalType,
              //     80000054: relation.properties.ParentKeyRef,
              //     80000055: relation.properties.ChildKeyRef,
              //     80100050: relation.properties.CardinalityValue
              //   }
              // }
              // if (relation.properties.IsCascade !== undefined) {
              //   res.properties[80010203] = relation.properties.IsCascade
              // }
              // return res
              let obj = this.encodeData(relation.properties)
              let res = {
                objectClass: relation.objectClass,
                properties: {
                  ...obj
                }
              }
              if (relation.properties.IsCascade !== undefined) {
                res.properties[80010203] = relation.properties.IsCascade
              }
              saveFlatFormat.added.push(this.flatFormatTransfer(res, this.currentModel.Id))
              return res
            }),
            mods: Object.values(this.dataByType.relation).filter(relation => !relation.properties.deleted && !relation.properties.new && relation.properties.changed).map(relation => {
              // let res = {
              //   objectClass: relation.objectClass,
              //   properties: {
              //     90000002: relation.properties.Id,
              //     90000003: relation.properties.Name,
              //     80000072: relation.properties.EndCardinality,
              //     80000021: relation.properties.Label,
              //     80000052: relation.properties.ParentEntityRef,
              //     80000053: relation.properties.ChildEntityRef,
              //     80000070: relation.properties.RelationalType,
              //     80000054: relation.properties.ParentKeyRef,
              //     80000055: relation.properties.ChildKeyRef,
              //     80100050: relation.properties.CardinalityValue
              //   }
              // }
              // if (relation.properties.IsCascade !== undefined) {
              //   res.properties[80010203] = relation.properties.IsCascade
              // }
              // return res
              let obj = this.encodeData(relation.properties)
              let res = {
                objectClass: relation.objectClass,
                properties: {
                  ...obj
                }
              }
              if (relation.properties.IsCascade !== undefined) {
                res.properties[80010203] = relation.properties.IsCascade
              }
              saveFlatFormat.updated.push(this.flatFormatTransfer(res, this.currentModel.Id))
              return res
            }),
            dels: Object.values(this.dataByType.relation).filter(relation => relation.properties.deleted && !relation.properties.new).map(relation => relation.properties.Id)
          },
          80000009: parent ? { // connection
            news: parent.children && parent.children.filter(cell => cell.edge && !cell.isPolygon && cell.new).map(cell => { // 有些线没有relation仅创建了connection要传递保存信息
              // let shape = this.dataByType.diagram[this.currentId].children.find(i => !i.properties.deleted && cell.Id === i.properties.Id)
              // let res = {
              //   objectClass: shape.objectClass,
              //   properties: {
              //     90000002: cell.Id,
              //     80500056: cell.EndOrientation,
              //     80500055: cell.StartOrientation,
              //     80500057: cell.CurrentBendPoints,
              //     80000060: cell.source ? cell.source.Id : -1,
              //     80000061: cell.target ? cell.target.Id : -1,
              //     90000011: cell.OwneeRef
              //   }
              // }
              // if (shape.properties.StyleBackColor) {
              //   res.properties[80500087] = shape.properties.StyleBackColor
              // }
              // if (shape.properties.StyleBackColor2) {
              //   res.properties[80500088] = shape.properties.StyleBackColor2
              // }
              // if (!cell.OwneeRef) {
              //   delete res.properties[90000011]
              // }
              // return res
              let shape = this.dataByType.diagram[this.currentId].children.find(i => !i.properties.deleted && cell.Id === i.properties.Id)
              let obj = this.encodeData(shape.properties)
              let res = {
                objectClass: shape.objectClass,
                properties: {
                  ...obj
                }
              }
              _.merge(res.properties, {
                90000002: cell.Id,
                80500056: cell.EndOrientation,
                80500055: cell.StartOrientation,
                80500057: cell.CurrentBendPoints,
                80000060: cell.source ? cell.source.Id : -1,
                80000061: cell.target ? cell.target.Id : -1,
                90000011: cell.OwneeRef
              })
              if (shape.properties.StyleBackColor) {
                res.properties[80500087] = shape.properties.StyleBackColor
              }
              if (shape.properties.StyleBackColor2) {
                res.properties[80500088] = shape.properties.StyleBackColor2
              }
              if (!cell.OwneeRef) {
                delete res.properties[90000011]
              }
              saveFlatFormat.added.push(this.flatFormatTransfer(res, this.currentId))
              return res
            }),
            mods: parent.children && parent.children.filter(cell => cell.edge && !cell.isPolygon && cell.changed && !cell.new).map(cell => { // 有些线没有relation修改了起始点和结束点也要传递保存信息, changed属性只在了cell上有，shape上没有同步有changed属性，但是有new属性, cell也有new属性
              // let shape = this.dataByType.diagram[this.currentId].children.find(i => !i.properties.deleted && cell.Id === i.properties.Id)
              // let res = {
              //   objectClass: cell.type === 'Relational' ? 'Datablau.ERD.ConnectionRelational' : cell.type === 'View' ? 'Datablau.ERD.ConnectionVirtualView' : '',
              //   properties: {
              //     90000002: cell.Id,
              //     80500056: cell.EndOrientation,
              //     80500055: cell.StartOrientation,
              //     80500057: cell.CurrentBendPoints,
              //     80000060: cell.source ? cell.source.Id : -1,
              //     80000061: cell.target ? cell.target.Id : -1,
              //     90000011: cell.OwneeRef
              //   }
              // }
              // if (shape.properties.StyleBackColor) {
              //   res.properties[80500087] = shape.properties.StyleBackColor
              // }
              // if (shape.properties.StyleBackColor2) {
              //   res.properties[80500088] = shape.properties.StyleBackColor2
              // }
              // return res
              let shape = this.dataByType.diagram[this.currentId].children.find(i => !i.properties.deleted && cell.Id === i.properties.Id)
              let obj = this.encodeData(shape.properties)
              let res = {
                objectClass: shape.objectClass,
                properties: {
                  ...obj
                }
              }
              _.merge(res.properties, {
                90000002: cell.Id,
                80500056: cell.EndOrientation,
                80500055: cell.StartOrientation,
                80500057: cell.CurrentBendPoints,
                80000060: cell.source ? cell.source.Id : -1,
                80000061: cell.target ? cell.target.Id : -1,
                90000011: cell.OwneeRef
              })
              if (shape.properties.StyleBackColor) {
                res.properties[80500087] = shape.properties.StyleBackColor
              }
              if (shape.properties.StyleBackColor2) {
                res.properties[80500088] = shape.properties.StyleBackColor2
              }
              saveFlatFormat.updated.push(this.flatFormatTransfer(res, this.currentId))
              return res
            }),
            // dels: [...this.deleteEdge].filter(i => i.Id >= 0).map(i => i.Id)
            dels: this.dataByType.diagram[this.currentId].children.filter(i => !i.properties.new && i.properties.deleted && i.objectClass.indexOf('Datablau.ERD.Connection') !== -1).map(i => i.properties.Id)
          } : {},
          80010214: { // 样式
            news: Object.values(this.dataByType.theme).filter(theme => !theme.properties.deleted && theme.properties.new).map(theme => {
              // let properties = theme.properties
              // return {
              //   properties: {
              //     '90000003': properties.Name,
              //     '90000002': properties.Id,
              //     '80010233': properties.AttributeTextColor,
              //     '80010232': properties.AttributeTextFont,
              //     '80010248': properties.CommentBackgroundColor,
              //     '80010249': properties.CommentBorderColor,
              //     '80010250': properties.CommentBorderWidth,
              //     '80010269': properties.CommentShadowColor,
              //     '80010268': `${properties.CommentShadowSize.width},${properties.CommentShadowSize.height}`,
              //     '80010253': properties.CommentTextColor,
              //     '80010252': properties.CommentTextFont,
              //     '80010215': properties.EntityBodyBackgroundColor,
              //     '80010216': properties.EntityBorderColor,
              //     '80010217': properties.EntityBorderWidth,
              //     '80010219': properties.EntityHeaderBackgroundColor,
              //     '80010220': properties.EntityHeaderSelectedColor,
              //     '80010262': properties.EntityHeaderTextAlignment,
              //     '80010266': properties.EntityHeaderTextColor,
              //     '80010264': properties.EntityHeaderTextFont,
              //     '80010221': properties.EntityRoundingSize,
              //     '80010271': properties.EntityShadowColor,
              //     '80010270': `${properties.EntityShadowSize.width},${properties.EntityShadowSize.height}`,
              //     '80010279': properties.FigureBackgroundColor,
              //     '80010280': properties.FigureBorderColor,
              //     '80010281': properties.FigureBorderWidth,
              //     '80010293': properties.FigureRoundingSize,
              //     '80010251': properties.IsCommentBorderDashed,
              //     '80010218': properties.IsEntityBorderDashed,
              //     '80010292': properties.IsFigureBorderDashed,
              //     '80010238': properties.RelationshipLineColor,
              //     '80010241': properties.RelationshipLineWidth,
              //     '80010239': properties.RelationshipTextColor,
              //     '80010240': properties.RelationshipTextFont
              //   }
              // }
              let properties = theme.properties
              let obj = this.encodeData(properties)
              let res = {
                objectClass: theme.objectClass,
                properties: {
                  ...obj
                }
              }
              res.properties[80010268] = `${properties.CommentShadowSize.width},${properties.CommentShadowSize.height}`
              res.properties[80010270] = `${properties.EntityShadowSize.width},${properties.EntityShadowSize.height}`
              saveFlatFormat.added.push(this.flatFormatTransfer(res, this.currentModel.Id))
              return res
            }),
            mods: Object.values(this.dataByType.theme).filter(theme => !theme.properties.deleted && !theme.properties.new && theme.properties.changed).map(theme => {
              // let properties = theme.properties
              // return {
              //   properties: {
              //     '90000003': properties.Name,
              //     '90000002': properties.Id,
              //     '80010233': properties.AttributeTextColor,
              //     '80010232': properties.AttributeTextFont,
              //     '80010248': properties.CommentBackgroundColor,
              //     '80010249': properties.CommentBorderColor,
              //     '80010250': properties.CommentBorderWidth,
              //     '80010269': properties.CommentShadowColor,
              //     '80010268': `${properties.CommentShadowSize.width},${properties.CommentShadowSize.height}`,
              //     '80010253': properties.CommentTextColor,
              //     '80010252': properties.CommentTextFont,
              //     '80010215': properties.EntityBodyBackgroundColor,
              //     '80010216': properties.EntityBorderColor,
              //     '80010217': properties.EntityBorderWidth,
              //     '80010219': properties.EntityHeaderBackgroundColor,
              //     '80010220': properties.EntityHeaderSelectedColor,
              //     '80010262': properties.EntityHeaderTextAlignment,
              //     '80010266': properties.EntityHeaderTextColor,
              //     '80010264': properties.EntityHeaderTextFont,
              //     '80010221': properties.EntityRoundingSize,
              //     '80010271': properties.EntityShadowColor,
              //     '80010270': `${properties.EntityShadowSize.width},${properties.EntityShadowSize.height}`,
              //     '80010279': properties.FigureBackgroundColor,
              //     '80010280': properties.FigureBorderColor,
              //     '80010281': properties.FigureBorderWidth,
              //     '80010293': properties.FigureRoundingSize,
              //     '80010251': properties.IsCommentBorderDashed,
              //     '80010218': properties.IsEntityBorderDashed,
              //     '80010292': properties.IsFigureBorderDashed,
              //     '80010238': properties.RelationshipLineColor,
              //     '80010241': properties.RelationshipLineWidth,
              //     '80010239': properties.RelationshipTextColor,
              //     '80010240': properties.RelationshipTextFont
              //   }
              // }
              let properties = theme.properties
              let obj = this.encodeData(properties)
              let res = {
                objectClass: theme.objectClass,
                properties: {
                  ...obj
                }
              }
              res.properties[80010268] = `${properties.CommentShadowSize.width},${properties.CommentShadowSize.height}`
              res.properties[80010270] = `${properties.EntityShadowSize.width},${properties.EntityShadowSize.height}`
              saveFlatFormat.updated.push(this.flatFormatTransfer(res, this.currentModel.Id))
              return res
            }),
            dels: Object.values(this.dataByType.theme).filter(theme => theme.properties.deleted && !theme.properties.new).map(theme => theme.properties.Id)
          },
          80700001: {// schema
            news: Object.values(this.dataByType.schema).filter(schema => !schema.properties.deleted && schema.properties.new).map(schema => {
              // let properties = schema.properties
              // return {
              //   properties: {
              //     90000002: properties.Id,
              //     90000003: properties.Name
              //   }
              // }
              let properties = schema.properties
              let obj = this.encodeData(properties)
              let res = {
                objectClass: schema.objectClass,
                properties: {
                  ...obj
                }
              }
              saveFlatFormat.added.push(this.flatFormatTransfer(res, this.currentModel.Id))
              return res
            }),
            mods: Object.values(this.dataByType.schema).filter(schema => !schema.properties.deleted && !schema.properties.new && schema.properties.changed).map(schema => {
              // let properties = schema.properties
              // return {
              //   properties: {
              //     90000002: properties.Id,
              //     90000003: properties.Name
              //   }
              // }
              let properties = schema.properties
              let obj = this.encodeData(properties)
              let res = {
                objectClass: schema.objectClass,
                properties: {
                  ...obj
                }
              }
              saveFlatFormat.updated.push(this.flatFormatTransfer(res, this.currentModel.Id))
              return res
            }),
            dels: Object.values(this.dataByType.schema).filter(schema => schema.properties.deleted && !schema.properties.new).map(schema => schema.properties.Id)
          }
        },
        udps: {
          mods: [...this.dataByType.udp.values()].filter(item => !item.new && item.modified).map(item => {
            // let res = {
            //   properties: {
            //     90000002: item.Id,
            //     90000003: item.Name,
            //     90000005: item.ValueType,
            //     90000006: 90002032,
            //     90000001: item.TypeId,
            //     90000010: item.entityType,
            //     90000012: item.IsVisible,
            //     90000015: item.FriendlyName,
            //     90000021: item.IsUDP,
            //     90000026: item.IsRequired,
            //     90000028: item.ExtendedEnumStruct,
            //     90000031: item.UdpValueType,
            //     90000008: item.ClassName,
            //     90000027: item.PageName
            //   }
            // }
            // if (item.ExtendedEnumParentRef) {
            //   res.properties[90000029] = item.ExtendedEnumParentRef
            // }
            // if (item.UDPOrder) {
            //   res.properties[90000025] = item.UDPOrder
            // }
            // return res
            let obj = this.encodeData(item)
            let res = {
              objectClass: 'Datablau.LDM.ObjectX',
              properties: {
                ...obj
              }
            }
            if (!item.ExtendedEnumParentRef) {
              delete res.properties[90000029]
            }
            let index = this.dataByType.udpOrigin.children?.findIndex(upd => upd.properties.Id === item.Id)
            if (index >= 0) {
              this.dataByType.udpOrigin.children[index] = res
            }
            return res
          }),
          news: [...this.dataByType.udp.values()].filter(item => item.new && !item.deleted).reduce((sum, item) => {
            const typeMap = {
              STRING: 'System.String',
              INTEGER: 'System.Int32',
              DOUBLE: 'System.Double',
              DATETIME: 'System.DateTime',
              LONGTEXT: 'System.String'
            }
            // let res = {
            //   properties: {
            //     90000002: item.Id,
            //     90000003: `${LDMTypes[item.entityType]}_has_PropertyType_${item.pStructId}`,
            //     90000005: item.ValueType,
            //     90000006: item.UniqueId,
            //     90000001: 90002032,
            //     90000010: item.entityType,
            //     90000012: item.IsVisible,
            //     90000015: item.FriendlyName,
            //     90000021: item.IsUDP,
            //     90000026: item.IsRequired,
            //     90000028: item.ExtendedEnumStruct,
            //     90000031: item.UdpValueType,
            //     90000008: item.ClassName,
            //     90000027: item.PageName
            //   }
            // }
            // if (item.ExtendedEnumParentRef) {
            //   res.properties[90000029] = item.ExtendedEnumParentRef
            // }
            // if (item.UDPOrder) {
            //   res.properties[90000025] = item.UDPOrder
            // }
            // sum.push(res)
            let obj = this.encodeData(item)
            let res = {
              objectClass: 'Datablau.LDM.ObjectX',
              properties: {
                ...obj
              }
            }
            res.properties[90000003] = `${LDMTypes[item.entityType]}_has_PropertyType_${item.Id}`
            res.properties[90000021] = true
            res.properties[90000005] = typeMap[item.UdpValueType]
            if (!item.ExtendedEnumParentRef) {
              delete res.properties[90000029]
            }
            sum.push(res)
            let res1 = {
              objectClass: 'Datablau.LDM.ObjectX',
              properties: {
                90000002: item.pStructId,
                90000003: `PropertyType_${item.Id}`,
                90000006: uuidv4(),
                90000001: 90002048,
                90000010: item.entityType,
                90000011: item.Id
              }
            }
            sum.push(res1)
            this.dataByType.udpOrigin.children?.push(res)
            this.dataByType.udpOrigin.children?.push(res1)
            return sum
          }, []),
          dels: [...this.dataByType.udp.values()].filter(item => !item.new && item.deleted).reduce((sum, item) => {
            sum.push(item.Id)
            sum.push(item.pStructId)
            let index1 = this.dataByType.udpOrigin.children?.findIndex(udp => udp.properties.Id === item.Id)
            this.dataByType.udpOrigin.children?.splice(index1, 1)
            let index2 = this.dataByType.udpOrigin.children?.findIndex(udp => udp.properties.Id === item.pStructId)
            this.dataByType.udpOrigin.children?.splice(index2, 1)
            return sum
          }, [])
        }
      }
      if ([...this.dataByType.udp.values()].some(item => ((!item.new && item.modified) || (item.new && !item.deleted) || (!item.new && item.deleted)))) {
        if (!this.currentModel.changed) {
          let obj = this.encodeData(this.currentModel) // 修改udp相当于修改model-source
          saveFlatFormat.updated.push(this.flatFormatTransfer({
            properties: {
              ...obj
            }
          }, 0)) // modelSource的parentId 为0
        }
        saveFlatFormat.udps = this.dataByType.udpOrigin.children?.map(udp => ({
          properties: {
            ...this.encodeData(udp.properties)
          }
        }))
      }
      this.$http.put(`${this.$url}/service/editor/models/${this.currentModel.id}/save?ver=${this.$route.query.currentVersion}`, saveFlatFormat).then(res => {
        this.$http.get(`/archy/object/updateStateForD/${saveFlatFormat.modelId}`)
          .then(() => {})
          .catch(() => {})
        if (res.data) {
          this.$router.replace({
            query: {
              id: this.$route.query.id,
              modelType: this.$route.query.modelType,
              currentVersion: res.data.currentVersion
            }
          })
          this.currentModel.currentVersion = res.data.currentVersion
          this.$http.post(this.$url + '/service/models/' + this.currentModel.id + '/versions', {
            modelId: this.currentModel.id,
            version: request.version,
            description: request.description
          }).then(() => {
            this.graph?.editor.undoManager.clear()
            if (this.diagram?.properties?.noexist) {
              delete this.diagram.properties.noexist
            }
            this.$bus.$emit('update-model', res.data.objects) // 更新模型
            this.$blauShowSuccess('保存成功')
            localStorage.setItem('mapTableObj', JSON.stringify({}))
            this.hasEdit = false
            this.deleteEdge = new Set()
            this.$router.replace({
              query: {
                id: this.$route.query.id,
                modelType: this.$route.query.modelType,
                currentVersion: res.data.currentVersion
              }
            })
          }).catch((err) => {
            this.$showFailure(err)
          })
        }
      }).catch(e => {
        this.$showFailure(e)
      }).finally(() => {
        this.loading.status = false
      })
    },
    encodeData (data) {
      if (data instanceof Array) {
        return data.map(item => this.encodeData(item))
      } else if (data instanceof Object) {
        let obj = {}
        for (let key of Object.keys(data)) {
          if (!isNaN(Number(key))) {
            obj[key] = this.transformData(data[key])
          } else if (LDMTypes[key] !== undefined) {
            obj[LDMTypes[key]] = this.transformData(data[key])
          }
        }
        return obj
      } else {
        return data
      }
    },
    limitedDsApplyMessage (showMessage) {
      if (showMessage) {
        this.$message.warning('此' + this.attributeName + '引用了数据标准，强管控模式下不允许修改此表单项，请先取消对数据标准的引用')
      }
    },
    queryDataType (queryString, cb) {
      let allDataTypes = $const.DataTypes[this.currentModel.modelType.toLowerCase()]
      // switch (this.currentModel.modelType) {
      //   case 'Oracle':
      //   case 'Mysql':
      //   case 'Logical':
      //     allDataTypes
      //     break
      //   default:
      //     allDataTypes = $const.DataTypes.common
      //     break
      // }
      if (this.dataTypeFocusPrevent) {
        cb()
        return
      }
      let result = queryString && this.dataTypeSearchMode ? allDataTypes.filter((item) => {
        if (typeof item === 'string') {
          return (item.toLowerCase().indexOf(queryString.toLowerCase()) > -1)
        } else {
          return false
        }
      }) : allDataTypes
      const Folders = []
      if (queryString && this.dataTypeSearchMode) {
        /*  const folderSet = new Set()
        result.forEach(item => {
          let index = allDataTypes.indexOf(item)
          do {
            index--
          } while (typeof allDataTypes[index] === 'string')
          folderSet.add(allDataTypes[index])
        })
        result = _.concat(result, folderSet)  */
        result = _.uniq(result)
      }
      cb(result.map(item => {
        if (typeof item === 'string') {
          return {
            value: item
          }
        } else {
          return {
            value: item.label,
            type: 'folder'
          }
        }
      }))
    },
    editEdgeConfirm () {
      this.hasEdit = true
      this.edgeDialogData.endCardinalityType = this.edgeDialogDataShow.endCardinalityType
      this.edgeDialogData.CardinalityValue = this.edgeDialogDataShow.CardinalityValue
      let index = this.edgeDialogData.style.indexOf('Dashed') !== -1 ? this.edgeDialogData.style.indexOf('Dashed') : this.edgeDialogData.style.indexOf(';')
      this.edgeDialogData.style = this.edgeDialogData.endCardinalityType + this.edgeDialogData.style.slice(index)
      this.graph.graph.refresh(this.edgeDialogData)
      this.edgeDialog = false
    },
    moveSelectCells (delX, delY, historyCells) {
      let cells = historyCells || this.graph.graph.getSelectionCells()
      let edges = this.graph.graph.getChildEdges()
      cells.forEach(cell => {
        let obj = diagram.children?.find(shape => !shape.properties.deleted && shape.properties.Id === cell.Id)
        if (obj.properties.TypeId === LDMTypes.Connection) {
          setTimeout(() => {
            this.graph.graph.refresh(cell)
          })
          return
        } else if (cell.isPolygon) {
          if (cell.isLine) {
            [cell.geometry.sourcePoint, cell.geometry.targetPoint, ...cell.geometry.points].forEach(p => {
              p.x += delX
              p.y += delY
            })
          } else {
            [cell.geometry.targetPoint, ...cell.geometry.points].forEach(p => {
              p.x += delX
              p.y += delY
            })
          }
        } else {
          cell.geometry.x += delX
          cell.geometry.y += delY
        }

        ['Location'].forEach(key => {
          if (obj.properties[key]) {
            obj.properties[key] = {
              x: parseInt(obj.properties[key].x + delX),
              y: parseInt(obj.properties[key].y + delY)
            }
          }
        });
        // ['BendPoints'].forEach(key => {
        //   if (obj.properties[key]) {
        //     obj.properties[key] = obj.properties[key].replace(/(\d+|\d+.\d+),(\d+|\d+.\d+)/g, (match, p1, p2) => { return parseInt(+p1 + delX) + ',' + (parseInt(+p2 + delY)) })
        //   }
        // });
        ['Path'].forEach(key => {
          if (obj.properties[key]) {
            obj.properties[key] = obj.properties[key].replace(/(\d+|\d+.\d+),\s*(\d+|\d+.\d+)/g, (match, p1, p2) => { return parseInt(+p1 + delX) + ',' + (parseInt(+p2 + delY)) })
          }
        })
        // let connections = diagram.children?.filter(shape => !shape.properties.deleted && (shape.properties.ChildShapeRef === cell.Id || shape.properties.ParentShapeRef === cell.Id))
        // connections.forEach(connection => {
        //   debugger
        //   let edge = edges.find(cell => cell.Id === connection.properties.Id)
        //   let newBendPoints = null
        //   if (connection.properties.ChildShapeRef === cell.Id) {
        //     let str = connection.properties.BendPoints.split(';')
        //     newBendPoints = str[0] + ';' + (str[1].replace(/(\d+|\d+.\d+),(\d+|\d+.\d+)/g, (match, p1, p2) => {
        //       return parseInt(+p1 + delX) + ',' + (parseInt(+p2 + delY))
        //     }))
        //   } else if (connection.properties.ParentShapeRef === cell.Id) {
        //     let str = connection.properties.BendPoints.split(';')
        //     newBendPoints = (str[0].replace(/(\d+|\d+.\d+),(\d+|\d+.\d+)/g, (match, p1, p2) => {
        //       return parseInt(+p1 + delX) + ',' + (parseInt(+p2 + delY))
        //     })) + ';' + str[1]
        //   } else {
        //     newBendPoints = connection.properties.BendPoints
        //   }
        //   connection.properties.BendPoints = newBendPoints
        //   edge.CurrentBendPoints = newBendPoints
        //   // edge.BendPoints = newBendPoints
        //   this.graph.graph.refresh(edge)
        // })
        cell.changed = true
        this.graph.graph.refresh(cell)
      })
      this.graph.graph.getView().refresh()
    },
    columnCopy () {
      let pId = this.colList[0].pId
      let colIds = this.colList.map(i => i.colId)
      let table = this.dataByType.table[pId] || this.dataByType.view[pId]
      let columnInfos = {
        colList: table.children?.filter(column => !column.properties.deleted && colIds.includes(column.properties.Id)),
        dataSourceColumnTypeMapping: this.dataSourceColumnTypeMapping
      }
      let ele = document.createElement('input')
      ele.value = JSON.stringify(columnInfos)
      document.body.appendChild(ele)
      ele.select()
      document.execCommand('copy')
      document.body.removeChild(ele)
    },
    modelCopy () {
      let cells = this.graph.graph.getSelectionCells()
      let dataByTypeCopy = {
        comment: {},
        diagram: [],
        relation: {},
        table: {},
        view: {},
        dataSourceColumnTypeMapping: this.dataSourceColumnTypeMapping,
        currentModel: this.currentModel
      }
      if (this.dataByType.schema) {
        dataByTypeCopy.schema = _.cloneDeep(this.dataByType.schema)
      }
      let diagram = this.dataByType.diagram[this.currentId]
      cells.forEach(cell => {
        if (cell.isTable || cell.isView || cell.isComment) {
          dataByTypeCopy[cell.isTable ? 'table' : cell.isView ? 'view' : cell.isComment ? 'comment' : 'table'][cell.OwneeRef] = _.cloneDeep(this.dataByType[cell.isTable ? 'table' : cell.isView ? 'view' : cell.isComment ? 'comment' : 'table'][cell.OwneeRef])
          if (cell.isTable && dataByTypeCopy.table[cell.OwneeRef].children) {
            // dataByTypeCopy.table[cell.OwneeRef].children = dataByTypeCopy.table[cell.OwneeRef].children.filter(item => item.properties['TypeId'] !== LDMTypes.Partition) 分区也copy，就不过滤了
          }
          let shape = diagram.children?.find(shape => !shape.properties.deleted && shape.properties.Id === cell.Id)
          dataByTypeCopy.diagram.push(shape)
        } else if (cell.isFigure) {
          let shape = diagram.children?.find(shape => !shape.properties.deleted && shape.properties.Id === cell.Id)
          dataByTypeCopy.diagram.push(shape)
        } else if (cell.isSubType) {
          let topEdge = cell.edges.find(edge => edge.source.OwneeRef === cell.ParentTableId)
          let parentTableShape = cells.find(c => c.OwneeRef === cell.ParentTableId)
          let shape = diagram.children?.find(shape => !shape.properties.deleted && shape.properties.Id === cell.Id)
          if (this.graph.graph.isCellSelected(topEdge) && parentTableShape) { // subtype的topedge的起始表选中以及topedge选择则加入此shape
            dataByTypeCopy.diagram.push(shape)
          } else { // 否则不加入
          }
          // if (this.graph.graph.isCellSelected(topEdge) && cell.edges.filter(edge => this.graph.graph.isCellSelected(edge) && edge.Id !== topEdge.Id).length >= 1 && cell.edges.filter(edge => this.graph.graph.isCellSelected(edge) && edge.Id !== topEdge.Id).every(edge => this.graph.graph.isCellSelected(edge.target))) { // subtype的除topedge的选中edge个数大于等于1，并且每个选中的edge末端的表都选中
          //   dataByTypeCopy.diagram.push(shape)
          // } else { // 删除subtype的cell以便于后续删除相关关系
          //   let subtypeIndex = cells.find(c => c.Id === cell.Id)
          //   cells.splice(subtypeIndex, 1)
          //   let deleteTableIds = new Set([...cell.edges.map(edge => edge.source.OwneeRef), ...cell.edges.map(edge => edge.target.OwneeRef)])
          //   deleteTableIds.delete(undefined)
          //   setTimeout(() => {
          //     dataByTypeCopy.diagram = dataByTypeCopy.diagram.filter(shape => !deleteTableIds.has(shape.properties.OwneeRef))
          //     deleteTableIds.forEach(tableId => {
          //       let index = cells.find(c => c.OwneeRef === tableId)
          //       cells.splice(index, 1)
          //       delete dataByTypeCopy.table[tableId]
          //     })
          //   }, 50)
          // }
        } else if (cell.edge && !cell.isPolygon) {
          setTimeout(() => { // 确保添加关系的时候所有的table已处理完
            let shape = diagram.children?.find(shape => !shape.properties.deleted && shape.properties.Id === cell.Id)
            let parentCell = cells.find(c => c.Id === shape.properties.ParentShapeRef)
            let childCell = cells.find(c => c.Id === shape.properties.ChildShapeRef)
            if (parentCell && childCell) {
              if (cell.type === 'Subtype' && parentCell.isSubType) { // 如果父元素是subtype，那么还需topEdge和父表都选中
                let topEdge = parentCell.edges.find(edge => edge.source.OwneeRef === parentCell.ParentTableId)
                let parentTableShape = cells.find(c => c.OwneeRef === parentCell.ParentTableId)
                if (this.graph.graph.isCellSelected(topEdge) && parentTableShape) {
                  dataByTypeCopy.relation[cell.OwneeRef] = this.dataByType.relation[cell.OwneeRef]
                  dataByTypeCopy.diagram.push(shape)
                }
              } else {
                dataByTypeCopy.relation[cell.OwneeRef] = this.dataByType.relation[cell.OwneeRef]
                dataByTypeCopy.diagram.push(shape)
              }
            }
          }, 100)
        }
      })
      setTimeout(() => { // 保证diagram中的关系存在（异步 setTimeout）才写入数据
        cells.forEach(cell => {
          if (cell.isTable || cell.isView) {
            let table = dataByTypeCopy.table[cell.OwneeRef] || dataByTypeCopy.view[cell.OwneeRef]
            table.children?.filter(column => !column.properties.deleted && column.objectClass === 'Datablau.LDM.EntityKeyGroup' && column.properties.KeyGroupType === 'ForeignKey').forEach(column => { // 删除不存在关系的外键
              let relation = Object.values(dataByTypeCopy.relation).find(relation => relation.properties.ChildEntityRef === table.properties.Id && column.properties.Id === relation.properties.ChildKeyRef)
              if (!relation) {
                column.properties.deleted = true
              }
            })
          }
        })
        let ele = document.createElement('input')
        ele.value = JSON.stringify(dataByTypeCopy)
        document.body.appendChild(ele)
        ele.select()
        document.execCommand('copy')
        document.body.removeChild(ele)
        // navigator.clipboard.writeText(JSON.stringify(dataByTypeCopy)).then(() => {
        //   this.$datablauMessage.success('拷贝成功！')
        // }).catch((err) => {
        //   this.$showFailure(err)
        // })
      }, 200)
    },
    async columnPaste (copyObj) {
      if (this.preSelectCells.length) {
        let cell = this.preSelectCells[this.preSelectCells.length - 1]
        let table = this.dataByType.table[cell.OwneeRef] || this.dataByType.view[cell.OwneeRef]
        if (!table.children) {
          table.children = []
        }
        copyObj.colList.forEach(column => {
          this.replaceObjectId(column, copyObj)
          this.getNewColumnName(column, 'Name', table.children, 0) // 复用下重启名字方法
          if (column.properties.LogicalName && (this.isLogical || this.isConceptual)) {
            this.getNewColumnName(column, 'LogicalName', table.children, 0)
          }
        })
        let changes = []
        let change = new Changes('insertColumnList', {
          pId: table.properties.Id,
          pName: table.properties.Name,
          pre: _.cloneDeep(table.children),
          name: '',
          now: null
        })
        table.properties.changed = true
        copyObj.colList.forEach(column => {
          table.children.push(column)
        })
        change.obj.now = _.cloneDeep(table.children)
        changes.push(change)
        let change2 = new (this.Changes)('modifyTableProperties', {
          id: table.properties.Id,
          name: table.properties.Name,
          pre: _.cloneDeep(table.properties),
          now: null
        })
        table.properties.ColumnOrderArrayRefs = table.children.filter(column => column.objectClass === 'Datablau.LDM.EntityAttribute' && !column.properties.deleted).map(column => column.properties.Id)
        table.properties.changed = true
        change2.obj.now = _.cloneDeep(table.properties)
        changes.push(change2)
        if (cell.isTable) {
          cell.value = await this.getTableHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
        } else if (cell.isView) {
          cell.value = await this.getViewHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
        }
        this.graph.graph.getView().refresh()
        this.graph.editor.undoManager.undoableEditHappened(new LayerEdit(changes))
      }
    },
    modelPaste (e) {
      try {
        // const modelString = await navigator.clipboard.readText()
        const copyString = e.clipboardData.getData('text')
        try {
          let copyObj = JSON.parse(copyString)
          if (copyObj.colList) { // 字段copy
            this.columnPaste(copyObj)
          } else { // 模型copy
            this.replaceNewId(copyObj)
          }
        } catch (err) {
          console.log(err)
        }
      } catch (err) {
        this.$showFailure(err)
      }
    },
    prepareData (model) { // 预处理数据，比如view不能粘贴到逻辑模型
      // Object.values(model.relation).forEach((relation) => { // subtype不copy
      //   if (relation.objectClass === 'Datablau.LDM.RelationshipSubtype') {
      //     delete model.relation[relation.properties.Id]
      //     model.diagram = model.diagram.filter(shape => shape.properties.OwneeRef !== relation.properties.Id)
      //   }
      // })
      if (this.isLogical || this.isConceptual || this.isCassandraOrMongoDB) { // 删除视图及其相关关系
        Object.values(model.view).forEach(obj => {
          delete model.view[obj.properties.Id]
          let index = model.diagram.findIndex(shape => shape.properties.OwneeRef === obj.properties.Id)
          let shapeDeleted = model.diagram.splice(index, 1)[0]
          Object.values(model.relation).forEach(relation => {
            if (relation.properties.ChildEntityRef === obj.properties.Id || relation.properties.ParentEntityRef === obj.properties.Id) {
              delete model.relation[relation.properties.Id]
            }
          })
          model.diagram = model.diagram.filter(shape => shape.properties.ChildShapeRef !== shapeDeleted.properties.Id && shape.properties.ParentShapeRef !== shapeDeleted.properties.Id)
        })
      }
      if (this.isLogical || this.isConceptual) {
        model.schema = {}
      }
      if (!this.isLogical && !this.isConceptual) {
        Object.values(model.table).forEach(obj => {
          if (obj.properties.TypeId === LDMTypes.BusinessObject) {
            delete model.table[obj.properties.Id]
            let index = model.diagram.findIndex(shape => shape.properties.OwneeRef === obj.properties.Id)
            let shapeDeleted = model.diagram.splice(index, 1)[0]
            Object.values(model.relation).forEach(relation => {
              if (relation.properties.ChildEntityRef === obj.properties.Id || relation.properties.ParentEntityRef === obj.properties.Id) {
                delete model.relation[relation.properties.Id]
              }
            })
            model.diagram = model.diagram.filter(shape => shape.properties.ChildShapeRef !== shapeDeleted.properties.Id && shape.properties.ParentShapeRef !== shapeDeleted.properties.Id)
          }
        })
        Object.values(model.relation).forEach(relation => {
          if (relation.properties.RelationalType === 'ManyToMany') {
            delete model.relation[relation.properties.Id]
            model.diagram = model.diagram.filter(shape => shape.properties.OwneeRef !== relation.properties.Id)
          }
          if (relation.objectClass === 'Datablau.LDM.RelationshipSubtype') { // 转换成主键关系
            if (relation.properties.SubTypeRef) {
              let connection = model.diagram.find(shape => shape.properties.OwneeRef === relation.properties.Id)
              let parentShape = model.diagram.find(shape => shape.properties.OwneeRef === relation.properties.ParentEntityRef)
              connection.objectClass = 'Datablau.ERD.ConnectionRelational'
              connection.properties.ParentShapeRef = parentShape.properties.Id
            } else { // top Relation删除
              delete model.relation[relation.properties.Id]
              model.diagram = model.diagram.filter(shape => shape.properties.OwneeRef !== relation.properties.Id)
            }
          }
        })
        model.diagram = model.diagram.filter(shape => shape.objectClass !== 'Datablau.ERD.ShapeSubtype')
      }
      if (this.isConceptual) { // 删除表，前面已删除视图
        Object.values(model.table).forEach(obj => {
          if (obj.properties.TypeId === LDMTypes.Entity) {
            delete model.table[obj.properties.Id]
            let index = model.diagram.findIndex(shape => shape.properties.OwneeRef === obj.properties.Id)
            let shapeDeleted = model.diagram.splice(index, 1)[0]
            Object.values(model.relation).forEach(relation => {
              if (relation.properties.ChildEntityRef === obj.properties.Id || relation.properties.ParentEntityRef === obj.properties.Id) {
                delete model.relation[relation.properties.Id]
              }
            })
            model.diagram = model.diagram.filter(shape => shape.properties.ChildShapeRef !== shapeDeleted.properties.Id && shape.properties.ParentShapeRef !== shapeDeleted.properties.Id)
            let subtypeIds = obj.children?.filter(column => !column.properties.deleted && column.objectClass === 'Datablau.LDM.EntitySubtype').map(column => column.properties.Id)
            if (subtypeIds) {
              model.diagram = model.diagram.filter(shape => !subtypeIds.includes(shape.properties.SubTypeRef))
            }
          }
        })
      }
    },
    replaceNewId (model) {
      this.loading.status = true
      this.idMaps = new Map()
      this.prepareData(model)
      if (model.currentModel?.id === this.currentModel.id) { // 同一模型内copy, 不存在的shape不需要生成新的实体
        model.diagram.forEach(shape => {
          if (shape.properties.OwneeRef) {
            let findShape = this.diagram.children?.find(s => !s.properties.deleted && s.properties.OwneeRef === shape.properties.OwneeRef)
            if (!findShape) {
              shape.properties.needReplaceId = false
              model.table[shape.properties.OwneeRef] && (model.table[shape.properties.OwneeRef].properties.needReplaceId = false)
              model.view[shape.properties.OwneeRef] && (model.view[shape.properties.OwneeRef].properties.needReplaceId = false)
              model.comment[shape.properties.OwneeRef] && (model.comment[shape.properties.OwneeRef].properties.needReplaceId = false)
              model.relation[shape.properties.OwneeRef] && (model.relation[shape.properties.OwneeRef].properties.needReplaceId = false)
            } else {
              shape.properties.needReplaceId = true
              model.table[shape.properties.OwneeRef] && (model.table[shape.properties.OwneeRef].properties.needReplaceId = true)
              model.view[shape.properties.OwneeRef] && (model.view[shape.properties.OwneeRef].properties.needReplaceId = true)
              model.comment[shape.properties.OwneeRef] && (model.comment[shape.properties.OwneeRef].properties.needReplaceId = true)
              model.relation[shape.properties.OwneeRef] && (model.relation[shape.properties.OwneeRef].properties.needReplaceId = true)
            }
          }
        })
        Object.values(model.table).forEach(table => {
          if (table.properties.needReplaceId !== false) {
            table.properties.needReplaceId = true
            this.getNewEntityName(table, 'Name', Object.values(this.dataByType.table), Object.values(model.table), 0)
            if (table.properties.LogicalName) {
              this.getNewEntityName(table, 'LogicalName', Object.values(this.dataByType.table), Object.values(model.table), 0)
            }
            this.replaceObjectId(table, model)
          } else {
            table.children?.forEach(column => {
              this.transferType(column, model)
            })
          }
        })
        Object.values(model.view).forEach(view => {
          if (view.properties.needReplaceId !== false) {
            view.properties.needReplaceId = true
            this.getNewEntityName(view, 'Name', Object.values(this.dataByType.view), Object.values(model.view), 0)
            if (view.properties.LogicalName) {
              this.getNewEntityName(view, 'LogicalName', Object.values(this.dataByType.view), Object.values(model.view), 0)
            }
            this.replaceObjectId(view, model)
          } else {
            view.children?.forEach(column => {
              this.transferType(column, model)
            })
          }
        })
        Object.values(model.comment).forEach(comment => {
          if (comment.properties.needReplaceId !== false) {
            comment.properties.needReplaceId = true
            this.replaceObjectId(comment)
          }
        })
        Object.values(model.relation).forEach(relation => {
          if (relation.properties.needReplaceId !== false) {
            relation.properties.needReplaceId = true
            this.replaceObjectId(relation)
          }
        })
      } else {
        Object.values(model.table).forEach(table => {
          table.properties.needReplaceId = true
          this.getNewEntityName(table, 'Name', Object.values(this.dataByType.table), Object.values(model.table), 0)
          if (table.properties.LogicalName) {
            this.getNewEntityName(table, 'LogicalName', Object.values(this.dataByType.table), Object.values(model.table), 0)
          }
          this.replaceObjectId(table, model)
        })
        Object.values(model.view).forEach(view => {
          view.properties.needReplaceId = true
          this.getNewEntityName(view, 'Name', Object.values(this.dataByType.view), Object.values(model.view), 0)
          if (view.properties.LogicalName) {
            this.getNewEntityName(view, 'LogicalName', Object.values(this.dataByType.view), Object.values(model.view), 0)
          }
          this.replaceObjectId(view, model)
        })
        Object.values(model.comment).forEach(comment => {
          comment.properties.needReplaceId = true
          this.replaceObjectId(comment)
        })
        Object.values(model.relation).forEach(relation => {
          relation.properties.needReplaceId = true
          this.replaceObjectId(relation)
        })
      }
      this.startX = Number.MAX_VALUE
      this.startY = Number.MAX_VALUE
      model.diagram.filter(shape => shape.properties.Location).forEach(shape => {
        if (shape.properties.Location.x < this.startX) {
          this.startX = shape.properties.Location.x
        }
        if (shape.properties.Location.y < this.startY) {
          this.startY = shape.properties.Location.y
        }
      })
      this.delX = this.startX === Number.MAX_VALUE ? this.graphX : this.graphX - this.startX
      this.delY = this.startX === Number.MAX_VALUE ? this.graphY : this.graphY - this.startY
      model.diagram.forEach(shape => {
        if (shape.properties.needReplaceId !== false) {
          shape.properties.needReplaceId = true
          this.replaceObjectId(shape, model)
        } else { // diagram的shape比较特殊，需要新Id，新的位置
          shape.properties.Id = this.deliverNum.seed++
          shape.properties.UniqueId = uuidv4()
          shape.properties.new = true
          let obj = shape;
          ['Location'].forEach(key => {
            if (obj.properties[key]) {
              obj.properties[key] = {
                x: parseInt(obj.properties[key].x + this.delX),
                y: parseInt(obj.properties[key].y + this.delY)
              }
            }
          });
          ['BendPoints'].forEach(key => {
            if (obj.properties[key]) {
              obj.properties[key] = obj.properties[key].replace(/(\d+|\d+.\d+),(\d+|\d+.\d+)/g, (match, p1, p2) => { return parseInt(+p1 + this.delX) + ',' + (parseInt(+p2 + this.delY)) })
            }
          });
          ['Path'].forEach(key => {
            if (obj.properties[key]) {
              obj.properties[key] = obj.properties[key].replace(/(\d+|\d+.\d+),\s*(\d+|\d+.\d+)/g, (match, p1, p2) => { return parseInt(+p1 + this.delX) + ',' + (parseInt(+p2 + this.delY)) })
            }
          })
        }
      })
      setTimeout(() => {
        this.drawModel(model)
        this.loading.status = false
      })
    },
    drawModel (model) {
      let changes = [new Changes('modelCopy', {
        name: '',
        model: model
      })]
      Object.values(model.table).forEach(table => {
        this.dataByType.table[table.properties.Id] = table
        table.properties.relied = false
      })
      Object.values(model.view).forEach(view => {
        this.dataByType.view[view.properties.Id] = view
      })
      Object.values(model.comment).forEach(comment => {
        this.dataByType.comment[comment.properties.Id] = comment
      })
      Object.values(model.relation).forEach(relation => {
        this.dataByType.relation[relation.properties.Id] = relation
        if ((relation.objectClass === 'Datablau.LDM.RelationshipRelational' && relation.properties.RelationalType === 'Identifying') || (relation.objectClass === 'Datablau.LDM.RelationshipSubtype' && relation.properties.RelationalType === 'Identifying')) { // 主键关系和subtype关系的子表需要变为依赖实体
          if (this.dataByType.table[relation.properties.ChildEntityRef]) {
            this.dataByType.table[relation.properties.ChildEntityRef].properties.relied = true
          }
        }
      })
      let diagram = this.dataByType.diagram[this.currentId]
      if (!diagram) { // 可能是来自映射建表的copy模型，没有diagram
        return
      }
      if (diagram.children) {
        diagram.children.splice(diagram.children.length, 0, ...model.diagram)
      } else {
        diagram.children = model.diagram
      }
      this.graph.graph.getModel().beginUpdate()
      try {
        this.graph.drawShape(model.diagram)
        this.graph.drawEdge(model.diagram)
      } catch (e) {
        console.log('绘图出错')
      }
      this.graph.graph.getModel().endUpdate()
      if (this.graph.editor.undoManager.history[this.graph.editor.undoManager.indexOfNextAdd - 1]) {
        this.$set(this.graph.editor.undoManager.history[this.graph.editor.undoManager.indexOfNextAdd - 1]?.changes[0], 'changes', changes)
      }
    },
    getNewEntityName (obj, Name = 'Name', arr1, arr2, startIndex) {
      let name = startIndex === 0 ? obj.properties[Name] : obj.properties[Name] + `(${startIndex})`
      if ((arr1 && arr1.some(item => !item.properties.deleted && item.properties[Name] === name)) || (arr2 && arr2.some(item => !item.properties.deleted && item.properties[Name] === name && item.properties.Id !== obj.properties.Id))) {
        this.getNewEntityName(obj, Name, arr1, arr2, startIndex + 1)
      } else {
        obj.properties[Name] = name
      }
    },
    getNewColumnName (obj, Name = 'Name', arr, startIndex) {
      let name = startIndex === 0 ? obj.properties[Name] : obj.properties[Name] + `${startIndex}`
      if ((arr && arr.some(item => !item.properties.deleted && item.properties[Name] === name))) {
        this.getNewColumnName(obj, Name, arr, startIndex + 1)
      } else {
        obj.properties[Name] = name
      }
    },
    transferType (obj, model) { // 字段类型转换
      if (obj.objectClass === 'Datablau.LDM.EntityAttribute') {
        let columnTypeMapping = model?.dataSourceColumnTypeMapping[this.currentModel.modelType.toUpperCase()]
        if (columnTypeMapping) {
          let dataType = ''
          let wei = ''
          let wei2 = ''
          if (obj.properties.DataType.indexOf('(') !== -1) {
            let res = obj.properties.DataType.match(/([\s\S]+)(\((\d+)\)$|\((\d+),(\d+)\)$)/)
            dataType = res[1]
            if (res[3]) {
              wei = +res[3]
            } else {
              if (res[4]) {
                wei = +res[4]
              }
              if (res[5]) {
                wei2 = +res[5]
              }
            }
          } else {
            dataType = obj.properties.DataType
          }
          if (dataType) {
            let type2 = columnTypeMapping[dataType.toUpperCase()]
            if (type2?.TargetDatatype) {
              if (type2.Multiple) {
                obj.properties.DataType = type2.TargetDatatype + (wei2 ? `(${wei * type2.Multiple},${wei2})` : wei ? `(${wei * type2.Multiple})` : '')
              } else {
                obj.properties.DataType = type2.TargetDatatype + (wei2 ? `(${wei},${wei2})` : wei ? `(${wei})` : '')
              }
            }
          }
        }
      }
    },
    replaceObjectId: function (obj, model) {
      console.log(obj, model)
      let schemaMap = model?.schema
      this.transferType(obj, model)
      this.idMaps.set(obj.properties.Id, this.deliverNum.seed++)
      if (obj.children) {
        // obj.children.sort((a, b) => {
        //   if (a.objectClass === 'Datablau.LDM.EntityAttribute') {
        //     return -1
        //   } else if (a.objectClass === 'Datablau.LDM.EntityKeyGroup') {
        //     return 1
        //   } else {
        //     return 0
        //   }
        // }).forEach(item => {
        //   this.replaceObjectId(item)
        // })
        obj.children.forEach(item => {
          this.replaceObjectId(item, model)
        })
      }
      if (obj.properties.SchemaRef) {
        let schema = schemaMap && schemaMap[obj.properties.SchemaRef]
        if (schema) {
          let currentSchema = Object.values(this.dataByType.schema).filter(item => !item.properties.deleted).find(item => item.properties.Name === schema.properties.Name)
          if (currentSchema) {
            obj.properties.SchemaRef = currentSchema.properties.Id
          } else {
            obj.properties.SchemaRef = this.deliverNum.seed
            this.$set(this.dataByType.schema, this.deliverNum.seed, {
              objectClass: 'Datablau.LDM.Schema',
              properties: {
                Id: this.deliverNum.seed++,
                Name: schema.properties.Name,
                TypeId: 80700001,
                UniqueId: uuidv4(),
                new: true
              }
            })
          }
        } else {
          delete obj.properties.SchemaRef
        }
      }
      obj.properties.Id = this.idMaps.get(obj.properties.Id)
      obj.properties.UniqueId = uuidv4()
      obj.properties.new = true;
      ['ColumnOrderArrayRefs', 'KeyGroupMemberRefs', 'ClusterMemberRefs', 'PartitionMemberOrderRefs', 'PartitionElementOrderRefs'].forEach(key => {
        if (obj.properties[key]) {
          if (obj.properties[key] instanceof Array) { // refs已经解析成了数组
            obj.properties[key] = obj.properties[key].map(n => this.idMaps.get(n))
          } else { // refs还是初始值逗号分隔的字符串
            obj.properties[key] = obj.properties[key].split(',').map(i => +i).map(n => this.idMaps.get(n)).join(',')
          }
        }
      });
      ['ChildEntityRef', 'ChildKeyRef', 'ParentKeyRef', 'ParentEntityRef', 'OwneeRef'].forEach(key => {
        if (obj.properties[key]) {
          obj.properties[key] = this.idMaps.get(obj.properties[key])
        }
      });
      ['Location'].forEach(key => {
        if (obj.properties[key] && (obj.objectClass.indexOf('Datablau.ERD') >= 0)) { // 必须是diagram的Location，实体上的Location在分区Storage里有意义
          obj.properties[key] = {
            x: parseInt(obj.properties[key].x + this.delX),
            y: parseInt(obj.properties[key].y + this.delY)
          }
        }
      });
      ['BendPoints'].forEach(key => {
        if (obj.properties[key]) {
          obj.properties[key] = obj.properties[key].replace(/(\d+|\d+.\d+),(\d+|\d+.\d+)/g, (match, p1, p2) => { return parseInt(+p1 + this.delX) + ',' + (parseInt(+p2 + this.delY)) })
        }
      });
      ['Path'].forEach(key => {
        if (obj.properties[key]) {
          obj.properties[key] = obj.properties[key].replace(/(\d+|\d+.\d+),\s*(\d+|\d+.\d+)/g, (match, p1, p2) => { return parseInt(+p1 + this.delX) + ',' + (parseInt(+p2 + this.delY)) })
        }
      })
      setTimeout(() => { // 以防止idMaps里的Id对应未生成
        ['AttributeRef', 'Reference', 'ChildShapeRef', 'ParentShapeRef', 'SubTypeRef'].forEach(key => {
          if (obj.properties[key]) {
            obj.properties[key] = this.idMaps.get(obj.properties[key])
          }
        });
        ['CompostedShapesRef'].forEach(key => { // 写在settimeout里保证CommonMemberRefs的引用idMaps都有
          if (obj.properties[key]) {
            if (obj.properties[key] instanceof Array) { // refs已经解析成了数组
              obj.properties[key] = obj.properties[key].map(n => this.idMaps.get(n))
            } else { // refs还是初始值逗号分隔的字符串
              obj.properties[key] = obj.properties[key].split(',').map(i => +i).map(n => this.idMaps.get(n)).join(',')
            }
          }
        })
      })
    },
    escKeydown (e) {
      if (e.keyCode === 27) {
        e.preventDefault()
        if (this.fixed) {
          this.$exitFullScreen()
          this.fixed = false
        }
      }
      if (e.ctrlKey) {
        if (!e.shiftKey && e.key === 'z') {
          if (this.inDialogLayer) {
            return
          }
          this.currentOperate = 'undo'
          this.graph?.editor.execute('undo')
        } else if (!e.shiftKey && e.key === 'y') {
          if (this.inDialogLayer) {
            return
          }
          this.currentOperate = 'redo'
          this.graph?.editor.execute('redo')
        } else if (!e.shiftKey && e.key === 'a') {
          if (this.inDialogLayer) {
            return
          }
          this.currentOperate = 'selectAll'
          this.graph?.editor.execute('selectAll')
        } else if (!e.shiftKey && e.key === 's') {
          if (this.inDialogLayer) {
            return
          }
          e.preventDefault()
          this.currentOperate = 'saveModel'
          if (!this.graph.editor.undoManager.indexOfNextAdd) {
            this.$message.warning('请修改后保存')
            return
          }
          this.checkInVersionDialogVisible = true
        } else if (e.key === '-') {
          e.preventDefault()
          this.minView()
        } else if (e.key === '=') {
          e.preventDefault()
          this.maxView()
        } else if (e.keyCode === 107) {
          e.preventDefault()
          this.sliderChange(100)
        } else if (e.key === 'c' || e.key === 'C') {
          if (this.inDialogLayer) {
          } else if (this.colList.length) {
            e.preventDefault()
            this.columnCopy()
          } else if (this.graph.graph.getSelectionCells().length) {
            e.preventDefault()
            this.modelCopy()
          }
        } else if (e.key === 'v') {
          // if (this.inDialogLayer) {
          //   return
          // }
          // e.preventDefault()
          // this.modelPaste(e)
        }
      }
      if (e.altKey) {
        let delX = 0
        let delY = 0
        if (e.key === 'ArrowRight') {
          delX = 10
        } else if (e.key === 'ArrowLeft') {
          delX = -10
        } else if (e.key === 'ArrowUp') {
          delY = -10
        } else if (e.key === 'ArrowDown') {
          delY = 10
        }
        if (delX || delY) {
          this.moveSelectCells(delX, delY)
          let cells = this.graph.graph.getSelectionCells()
          this.graph.editor.undoManager.undoableEditHappened(new LayerEdit([new Changes('moveSelectCells', {
            cells: cells,
            delX,
            delY
          })]))
        }
      }
      if (e.keyCode === 27) {
        this.removeRelationConnect()
        this.graph.graph.clearSelection()
      }
      let cells = this.graph?.graph?.getSelectionCells()
      if (e.key === 'Delete' && cells?.length > 0 && !this.inDialogLayer) {
        // if (cells.some(cell => cell.type === 'Subtype')) {
        //   this.$datablauMessage.warning('包含Subtype关系暂不支持在web端编辑，请前往客户端')
        //   this.loading.status = false
        //   return
        // }
        if (cells.length === 1 && cells[0].isFigure) {
          this.$DatablauCofirm('确定要删除图框？', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.deletedCell = cells[0]
            this.deleteInThemeConfirm()
          }).catch(() => {

          })
        } else {
          this.secondConfirm = true
          this.deletedCell = cells[0]
        }
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        let activeEle = document.activeElement
        if (activeEle.tagName === 'INPUT') {
          let $newInput = null
          let $input = $(document.activeElement)
          let text = $input.val()
          if (e.key === 'ArrowRight' && activeEle.selectionEnd === text.length) { // 下一个
            $newInput = $input.closest('td').next('td').find('input')
            $newInput.focus()
            const mousedownEvent = new MouseEvent('mousedown', {
              bubbles: true, // 是否冒泡
              cancelable: true, // 是否可取消
              view: window // 事件所属的窗口对象
            })
            const mouseupEvent = new MouseEvent('mouseup', {
              bubbles: true, // 是否冒泡
              cancelable: true, // 是否可取消
              view: window // 事件所属的窗口对象
            })
            // v-clickoutside 点击外部模拟
            $newInput[0]?.dispatchEvent(mousedownEvent)
            $newInput?.click()
            $newInput[0]?.dispatchEvent(mouseupEvent)
          } else if (e.key === 'ArrowLeft' && activeEle.selectionStart === 0) { // 上一个
            $newInput = $input.closest('td').prev('td').find('input')
            $newInput.focus()
            const mousedownEvent = new MouseEvent('mousedown', {
              bubbles: true, // 是否冒泡
              cancelable: true, // 是否可取消
              view: window // 事件所属的窗口对象
            })
            const mouseupEvent = new MouseEvent('mouseup', {
              bubbles: true, // 是否冒泡
              cancelable: true, // 是否可取消
              view: window // 事件所属的窗口对象
            })
            // v-clickoutside 点击外部模拟
            $newInput[0]?.dispatchEvent(mousedownEvent)
            $newInput?.click()
            $newInput[0]?.dispatchEvent(mouseupEvent)
          }
        }
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        let activeEle = document.activeElement
        if (activeEle.tagName === 'INPUT') {
          let $input = $(document.activeElement)
          let index = $input.closest('tr').children('td').index($input.closest('td'))
          let $newInput = null
          if (e.key === 'ArrowUp') { // 上一个
            $newInput = $($input.closest('tr').prev('tr').children('td')[index]).find('input')
            $newInput.focus()
          } else if (e.key === 'ArrowDown') { // 下一个
            $newInput = $($input.closest('tr').next('tr').children('td')[index]).find('input')
            $newInput.focus()
          }
          const mousedownEvent = new MouseEvent('mousedown', {
            bubbles: true, // 是否冒泡
            cancelable: true, // 是否可取消
            view: window // 事件所属的窗口对象
          })
          const mouseupEvent = new MouseEvent('mouseup', {
            bubbles: true, // 是否冒泡
            cancelable: true, // 是否可取消
            view: window // 事件所属的窗口对象
          })
          $newInput[0]?.dispatchEvent(mousedownEvent)
          $newInput?.click()
          $newInput[0]?.dispatchEvent(mouseupEvent)
        }
      }
    },
    sliderChange (val) {
      // const scale = Math.pow(1.2, (val - 1) * 10)
      this.graph && this.graph.graph && this.graph.graph.getView().setScale(val / 100)
    },
    minView (val) {
      // if (this.scale === 50) {
      //   return
      // }
      // this.graph.graph.zoomOut()
      // this.scale = (this.scale * 10 - 1) / 10
      this.scale -= 50
      this.graph.graph.getView().setScale(this.scale / 100)
    },
    maxView (val) {
      // if (this.scale === 400) {
      //   return
      // }
      this.scale += 50
      this.graph.graph.getView().setScale(this.scale / 100)
    },
    formatTooltip (val) {
      return val + '%'
    },
    getDiagramContent (callback) {
      if (this.diagram.properties?.noexist) {
        this.$bus.$emit('drawGraph') // 画空画布，以便编辑
        this.dataByType.diagram[this.currentId] = this.diagram
        this.loading.status = false
        this.$parent.$parent.$parent.$parent.$refs.themeTree.setCurrentKey(this.currentId)
        this.$bus.$emit('updateDiagramData')
        return
      }
      if (!this.currentModel.id || !this.currentId) {
        return
      }
      this.loading.status = true
      this.loading.text = '拼命请求主题域数据'
      HTTP.getElementContent({
        modelId: this.currentModel.id,
        elementId: this.currentId,
        longkey: this.longkey,
        successCallback: data => {
          if (this.longkey) {
            data = this.transformData(data)
          }
          const elementArr = []
          if (data) {
            this.dataByType.diagram[data.properties.Id] = data
          }
          if (data && data.children) {
            data.children.forEach(item => {
              item.properties.deleted = false
              if (item.properties.TypeId === 80000006) {
                const appendNode = (parent, current) => {
                  if (!this.dataByType.diagram[current.properties.Id]) {
                    this.dataByType.diagram[current.properties.Id] = item
                    let cur = {
                      ...this.diagramUdpsDefault, // 默认UDP
                      ...current.properties, // 防止丢失UDP
                      Id: current.properties.Id,
                      Name: current.properties.Name,
                      IsOpen: current.properties.IsOpen,
                      Definition: current.properties.Definition,
                      IsUdpShowOnDiagram: current.properties.IsUdpShowOnDiagram,
                      RawType: 'Diagram',
                      ShowLabel: current.properties.ShowLabel,
                      TypeId: 80000006,
                      ParentRef: parent.properties
                    }
                    this.$bus.$emit('append-theme', {
                      current: cur,
                      parent: parent.properties.Id,
                      changePreDiagram: true
                    })
                  }
                  current.children && current.children.forEach(subItem => {
                    if (subItem && subItem.properties && subItem.properties.TypeId === 80000006) {
                      appendNode(current, subItem)
                    }
                  })
                }
                appendNode(data, item)
              } else {
                const elementId = item.properties.OwneeRef
                if (typeof item.properties.Location === 'string') {
                  let [x, y] = item.properties.Location.split(',')
                  item.properties.Location = {
                    x: Number.parseInt(x),
                    y: Number.parseInt(y)
                  }
                }
                if (elementId) {
                  elementArr.push(elementId)
                } else {
                  // console.warn('OwneeRef not found')
                  // console.warn(item)
                }
              }
            })
            let entityIds = new Set(elementArr)
            if (this.editorType !== 'table') {
              for (let key in this.dataByType.relation) {
                let relation = this.dataByType.relation[key]
                if (this.dataByType.table[relation.properties.ChildEntityRef] || this.dataByType.view[relation.properties.ChildEntityRef] || this.dataByType.comment[relation.properties.ChildEntityRef]) { // 过滤EntitySubtype， Subtype一定在ChildEntityRef，后端有bug，不过滤EntitySubtype不能取到正确结构
                  entityIds.add(relation.properties.ChildEntityRef)
                }
                entityIds.add(relation.properties.ParentEntityRef)
              }
            }
            this.getEntitiesContent([...entityIds], callback)
            if (elementArr.length > 0) {
              // this.getEntitiesContent(elementArr, callback)
            } else {
              this.loading.status = false
            }
          } else {
            this.dataByType.diagram[this.currentId].children = []
            Object.keys(this.dataByType.diagram[this.currentId]).forEach(k => {
              this.$set(this.diagram, k, this.dataByType.diagram[this.currentId][k])
            })
            window.diagram = this.diagram
            this.$bus.$emit('drawGraph') // 画空画布，以便编辑
            this.dataReady = true
            this.loading.status = false
          }
        }
      })
    },
    getEntitiesContent (elementArr, callback) {
      return HTTP.getElementsContent({
        modelId: this.currentModel.id,
        elementIds: elementArr,
        longkey: this.longkey,
        successCallback: data => {
          if (this.longkey) {
            data = this.transformData(data)
          }
          for (let index in data) {
            let value = data[index]
            this.captureData(value)
          }
          this.$parent.$parent.$parent.$parent.$forceUpdate()
          if (callback) {
            callback()
          }
        }
      })
    },
    captureData (data) {
      if (data.properties['TypeId'] === 80000004 || data.properties['TypeId'] === 80100073) {
        const dataColumnOrdered = {
          objectClass: data.properties['TypeId'] === 80000004 ? 'Datablau.LDM.EntityComposite' : data.properties['TypeId'] === 80100073 ? 'Datablau.LDM.EntityBusinessObject' : '',
          posit: data.posit,
          properties: data.properties,
          propertiesBefore: data.propertiesBefore,
          children: []
        }
        if (data.properties.ColumnOrderArrayRefs) {
          const columnMap = new Map()
          data.children.forEach(item => {
            if (item.properties.TypeId === 80000005) {
              columnMap.set(item.properties.Id, item)
            } else {
              dataColumnOrdered.children.push(item)
            }
          })
          data.properties.ColumnOrderArrayRefs.forEach(item => {
            if (columnMap.get(item)) {
              dataColumnOrdered.children.push(columnMap.get(item))
            }
          })
        } else {
          dataColumnOrdered.children = data.children
        }
        if (this.dataByType.table[data.properties.Id].properties.relied) {
          dataColumnOrdered.properties.relied = true
        }
        this.$set(this.dataByType.table, data.properties.Id, dataColumnOrdered)
        // this.dataByType.table[data.properties.Id] = dataColumnOrdered
      } else if (data.properties['TypeId'] === 80500008) {
        this.dataByType.view[data.properties.Id] = data
      } else if (data.properties['TypeId'] === 80000027) {
        this.dataByType.comment[data.properties.Id] = data
      } else if (data.properties['TypeId'] === 80000007) {
        // this.dataByType.relation[data.properties.Id] = data
      } else {
        console.log('else')
      }
    },
    updateVersion (version) {
      if (version) {
        this.currentModel.currentVersion = version
      } else {
        this.currentModel.currentVersion++
      }
    },
    async updateTableData (data, index) {
      this.dataByType.table[data.properties.Id] = data
      this.afterHandleDialogData(data.properties.Id)
      if (this.$refs.tables) {
        this.$refs.tables.updateTableData(data)
      }
      if (this.$refs.partTables) {
        this.$refs.partTables.updateTableData(data)
      }
      if (this.from === 'graph') {
        let tableCell = this.graph.graph.getDefaultParent().children.find(cell => cell.OwneeRef === data.properties.Id)
        let html = await this.getTableHTMLFunction(data.properties.Id, this.graph.graph, null, null, true)
        tableCell.setValue(html)
        this.tables.splice(index, 1)
        this.graph.graph.getView().refresh()
        this.currentTab = 'graph'
      }
    },
    fullScreenForLogicalRelation () {
      this.changeFullScreen()
      this.showFullScreenBtn = false
    },
    doLayout () {
      this.graph.doLayout()
    },
    prepareZoomData () {
      let objectMap = {}
      let states = []
      let { table, view, diagram } = this.dataByType
      let diagramMap = new Map()
      let list = []
      this.list = []
      diagram[this.currentId].children.forEach(item => {
        if (item.properties.OwneeRef) {
          diagramMap.set(item.properties.OwneeRef, item.properties.Id)
        }
        if ((item.objectClass === 'Datablau.ERD.ShapeRectangle') && item.properties.Name) {
          let resultObj = {
            value: 'figure:' + item.properties.Id,
            label: item.properties.Name
          }
          list.push(resultObj)
        }
      })
      let designModel = this.isDesignModel
      // this.isDesignModel = designModel
      // this.showDataType = !designModel

      for (let key in table) {
        let item = table[key]
        let tableId = item.properties.Id
        let tableName = item.properties.Name
        if (item.properties.TypeId === LDMTypes.Entity || item.properties.TypeId === LDMTypes.BusinessObject) {
          if (designModel) {
            if (item.properties.LogicalName) {
              tableName = item.properties.LogicalName
            }
          } else {
            if (item.properties.LogicalName) {
              tableName = item.properties.Name + '(' + item.properties.LogicalName + ')'
            }
          }
          if (diagramMap.has(tableId)) {
            let diagramId = diagramMap.get(tableId)
            let resultObj = {
              value: 'table:' + diagramId + ':' + tableName,
              label: tableName
            }
            objectMap[tableId] = resultObj
            list.push(resultObj)
            Array.isArray(item.children) && item.children.forEach(column => {
              if (column.properties.TypeId === LDMTypes.Attribute) {
                let columnName = column.properties.Name
                if (designModel) {
                  if (column.properties.LogicalName) {
                    columnName = column.properties.LogicalName
                  }
                } else {
                  if (column.properties.LogicalName) {
                    columnName = column.properties.Name + '(' + column.properties.LogicalName + ')'
                  }
                }
                let resultObj = {}
                if (item.properties.TypeId === LDMTypes.BusinessObject) {
                  resultObj = {
                    value: 'business_column:' + diagramId + ':' + columnName + ':' + column.properties.Id,
                    label: tableName + ' / ' + columnName
                  }
                } else if (item.properties.TypeId === LDMTypes.Entity) {
                  resultObj = {
                    value: 'table_column:' + diagramId + ':' + columnName + ':' + column.properties.Id,
                    label: tableName + ' / ' + columnName
                  }
                }
                objectMap[column.properties.Id] = resultObj
                list.push(resultObj)
              }
            })
          }
        }
      }
      for (let key in view) {
        let item = view[key]
        let viewId = item.properties.Id
        let viewName = item.properties.Name
        if (item.properties.TypeId === LDMTypes.View) {
          if (designModel) {
            if (item.properties.LogicalName) {
              viewName = item.properties.LogicalName
            }
          } else {
            if (item.properties.LogicalName) {
              viewName = item.properties.Name + '(' + item.properties.LogicalName + ')'
            }
          }
          if (diagramMap.has(viewId)) {
            let diagramId = diagramMap.get(viewId)
            let resultObj = {
              value: 'view:' + diagramId + ':' + viewName,
              label: viewName
            }
            objectMap[viewId] = resultObj
            list.push(resultObj)
            Array.isArray(item.children) && item.children.forEach(column => {
              if (column.properties.TypeId === LDMTypes.Attribute) {
                let columnName = column.properties.Name
                if (designModel) {
                  if (column.properties.LogicalName) {
                    columnName = column.properties.LogicalName
                  }
                } else {
                  if (column.properties.LogicalName) {
                    columnName = column.properties.Name + '(' + column.properties.LogicalName + ')'
                  }
                }
                let resultObj = {
                  value: 'view_column:' + diagramId + ':' + columnName + ':' + column.properties.Id,
                  label: viewName + ' / ' + columnName
                }
                objectMap[column.properties.Id] = resultObj
                list.push(resultObj)
              }
            })
          }
        }
      }
      this.objectMap = objectMap
      this.$bus.$emit('loadSearchList', list)
      this.list = list
    },
    handleData () {
      let data = this.dataByType
      if (!data) {
        return
      }
      $('#consa-graph').html('')
      $('.graph-outline').html('')
      if (this.graph) {
        this.graph.destroy()
      }
      this.graph = new DrawGraph($('#consa-graph')[0], data, this.param, $('.graph-outline')[0], this.themeCreateTemplate, this.isDesignModel, this.showLogicalName, this.showPhysicalName, this.showDataType, this.editorType)
      if (this.showKeyColumn) {
        this.graph.displaySetting.column = 'key'
      } else if (this.showAllColumn) {
        this.graph.displaySetting.column = 'all'
      } else if (this.showNoColumn) {
        this.graph.displaySetting.column = 'no'
      }
      this.graph.start()
      if (this.showKeyColumn) {
        this.handleCommand('keyColumn')
      } else if (this.showAllColumn) {
        // this.handleCommand('allColumn')
      } else if (this.showNoColumn) {
        this.handleCommand('noColumn')
      }
      console.debug('总耗时：' + (Date.now() - window.startTime) / 1000.0 + '秒')
    },
    showTabDetail (id, isView, sqlObj) {
      this.editModeCanBeBefore = true
      if (sqlObj) {
        sqlObj.children[0].children.forEach(element => {
          element.oldId = element.properties.Id
          if (element.children && (element.properties['KeyGroupType'] === 'PrimaryKey' || element.properties['KeyGroupType'] === 'NonUniqueKey' || element.properties['KeyGroupType'] === 'ForeignKey' || element.properties['KeyGroupType'] === 'UniqueKey' || element.properties['KeyGroupType'] === 'VirtualKey')) {
            element.children.forEach(item => {
              item.properties.AttributeRefOld = item.properties.AttributeRef
            })
          }
          this.idSqlMap.set(element.properties.Id, '')
        })
      }
      this.handleDialogData(id, false, isView, sqlObj)
    },
    showViewDetail (id) {
      this.editModeCanBeBefore = true
      this.handleDialogData(id, false, true)
    },
    editTabDetail (id, isView) {
      this.handleDialogData(id, true, isView)
    },
    closeTableDetail (id, editMode, isView) {
      this.editModeCanBeBefore = false
      this.handleDialogData(id, editMode, isView)
    },
    deleteTable (id) {

    },
    handleDialogData (tableId, editMode, isView = false, sqlObj) { // tableId可能是viewId
      if (tableId) {
        if (this.from === 'tables') {
          this.loading.status = true
          HTTP.getElementContent({
            modelId: this.currentModel.id,
            elementId: tableId,
            longkey: this.longkey,
            successCallback: data => {
              if (this.longkey) {
                data = this.transformData(data)
              }
              const dataColumnOrdered = {
                properties: data.properties,
                propertiesBefore: data.propertiesBefore,
                children: [],
                objectClass: data.objectClass
              }
              if (data.properties.ColumnOrderArrayRefs) {
                const columnMap = new Map()
                data.children.forEach(item => {
                  if (item.properties.TypeId === 80000005) {
                    columnMap.set(item.properties.Id, item)
                  } else {
                    dataColumnOrdered.children.push(item)
                  }
                })
                data.properties.ColumnOrderArrayRefs.forEach(item => {
                  if (columnMap.get(item)) {
                    dataColumnOrdered.children.push(columnMap.get(item))
                  }
                })
              } else {
                dataColumnOrdered.children = data.children
              }
              if (isView) {
                this.dataByType.view[tableId] = dataColumnOrdered
              } else {
                this.dataByType.table[tableId] = dataColumnOrdered
              }
              this.afterHandleDialogData(tableId, editMode, isView)
            },
            finallyCallback: () => {
              this.loading.status = false
            }
          })
        } else if (this.from === 'graph') { // 有画布的graph已加载table详情数据
          this.afterHandleDialogData(tableId, editMode, isView)
        }
      } else {
        this.emptyTableNum = this.deliverNum.seed++
        // 添加新表
        this.$set(this.dataByType.table, this.emptyTableNum, {
          objectClass: 'Datablau.LDM.EntityComposite',
          children: [],
          properties: {
            ...this.tableUdpsDefault,
            ColumnOrderArrayRefs: [],
            DataStandardCode: '',
            Id: this.emptyTableNum,
            IsLogicalOnly: false,
            IsPhysicalOnly: false,
            Name: this.getTableNameNamingMap((this.isLogical ? 'Entity_' : this.isCassandraOrMongoDB ? 'Collection_' : 'Table_') + (this.sumElementNumCopy += 2)),
            RawType: 'Entity',
            TypeId: 80000004,
            changed: true,
            UniqueId: uuidv4(),
            new: true
          }
        })
        const existTableIndex = this.tables.findIndex(table => {
          return table.appendMode
        })
        let dialog = {}
        if (sqlObj) {
          dialog = {
            columnsMsg: [],
            pk: [],
            fk: [],
            uk: [],
            nk: [],
            vk: [],
            tableMsg: {
              ...this.tableUdpsDefault,
              LogicalName: sqlObj.children[0].properties.LogicalName,
              Name: sqlObj.children[0].properties.Name,
              Definition: sqlObj.children[0].properties.Definition,
              Id: this.emptyTableNum++,
              TypeId: LDMTypes.Entity
            },
            appendMode: true,
            sqlCreate: true
          }
          if (Array.isArray(sqlObj.children)) {
            let children = []
            children.push(sqlObj.children[0])
            sqlObj.children[0].children.forEach(item => {
              item.properties.Id = this.emptyTableNum++
              item.properties.deleted = false
              item.properties.new = true
              this.idSqlMap.set(item.oldId, item.properties.Id)
              this.$nextTick(() => {
                if (!item.properties.deleted) {
                  if (item.properties['TypeId'] === LDMTypes.Attribute) {
                    dialog.columnsMsg.push(item)
                  } else if (item.properties['KeyGroupType'] === 'PrimaryKey') {
                    item.children.forEach(element => {
                      element.properties.AttributeRef = this.idSqlMap.get(element.properties.AttributeRefOld)
                      element.properties.Id = this.emptyTableNum++
                      item.properties.KeyGroupMemberRefs = []
                      item.properties.KeyGroupMemberRefs.push(element.properties.Id)
                    })
                    dialog.pk.push(item)
                  } else if (item.properties['KeyGroupType'] === 'ForeignKey') {
                    item.children.forEach(element => {
                      element.properties.AttributeRef = this.idSqlMap.get(element.properties.AttributeRefOld)
                      element.properties.Id = this.emptyTableNum++
                      item.properties.KeyGroupMemberRefs = []
                      item.properties.KeyGroupMemberRefs.push(element.properties.Id)
                    })
                    dialog.fk.push(item)
                  } else if (item.properties['KeyGroupType'] === 'UniqueKey') {
                    item.children.forEach(element => {
                      element.properties.AttributeRef = this.idSqlMap.get(element.properties.AttributeRefOld)
                      element.properties.Id = this.emptyTableNum++
                      item.properties.KeyGroupMemberRefs = []
                      item.properties.KeyGroupMemberRefs.push(element.properties.Id)
                    })
                    dialog.uk.push(item)
                  } else if (item.properties['KeyGroupType'] === 'NonUniqueKey') {
                    item.children.forEach(element => {
                      element.properties.AttributeRef = this.idSqlMap.get(element.properties.AttributeRefOld)
                      element.properties.Id = this.emptyTableNum++
                      item.properties.KeyGroupMemberRefs = []
                      item.properties.KeyGroupMemberRefs.push(element.properties.Id)
                    })
                    dialog.nk.push(item)
                  } else if (item.properties['KeyGroupType'] === 'VirtualKey') {
                    item.children.forEach(element => {
                      element.properties.AttributeRef = this.idSqlMap.get(element.properties.AttributeRefOld)
                      element.properties.Id = this.emptyTableNum++
                      item.properties.KeyGroupMemberRefs = []
                      item.properties.KeyGroupMemberRefs.push(element.properties.Id)
                    })
                    dialog.vk.push(item)
                  } else if (item.properties['TypeId'] === LDMTypes.Partition) { // 表分区
                    dialog.partition = item
                  } else if (item.properties.TypeId === LDMTypes.DWMapping) { // 数仓映射
                    dialog.dwMapping.push(item)
                  } else if (item.properties.TypeId === LDMTypes.Cluster) { // hive cluster
                    dialog.cluster = item
                  }
                }
              })
            })
          }
          let ColumnOrderArrayRefsM = []
          sqlObj.children[0].properties.ColumnOrderArrayRefs.forEach(element => {
            ColumnOrderArrayRefsM.push(this.idSqlMap.get(element))
          })
          sqlObj.children[0].properties.ColumnOrderArrayRefs = ColumnOrderArrayRefsM
        } else {
          dialog = {
            columnsMsg: [],
            pk: [],
            fk: [],
            uk: [],
            nk: [],
            vk: [],
            tableMsg: {
              ...this.tableUdpsDefault,
              LogicalName: '',
              Name: '',
              Definition: '',
              Id: this.emptyTableNum++,
              TypeId: LDMTypes.Entity
            },
            appendMode: true
          }
        }
        if (existTableIndex === -1) {
          this.tables.push(dialog)
          this.currentTab = dialog.tableMsg.Id + ''
          this.$nextTick(() => {
            this.$refs.tableDetailsEdit && this.$refs.tableDetailsEdit[this.tables.length - 1].onReady()
            this.$refs.tableDetailsEdit && this.$refs.tableDetailsEdit[this.tables.length - 1].startHeartBeat()
          })
        } else {
          this.currentTab = this.tables[existTableIndex].tableMsg.Id + ''
          this.$nextTick(() => {
            this.$refs.tableDetailsEdit && this.$refs.tableDetailsEdit[existTableIndex].onReady()
            this.$refs.tableDetailsEdit && this.$refs.tableDetailsEdit[existTableIndex].startHeartBeat()
          })
        }
      }
    },
    afterHandleDialogData (tableId, editMode, isView) {
      if (tableId) { //  it means a table already exists
        this.editEntityDialog = true
        let data = null
        if (isView) {
          data = this.dataByType.view[tableId]
        } else {
          data = this.dataByType.table[tableId]
        }
        let dialog = {}
        dialog.visible = true
        dialog.tableMsg = data.properties
        if (!dialog.tableMsg.LogicalName) {
          //          dialog.tableMsg.LogicalName = dialog.tableMsg.Name;
        }
        if (editMode) {
          dialog.editMode = true
        } else {
          dialog.editMode = false
        }
        if (!isView && data.properties.PartitionElementDesign) {
          dialog.partitionElementDesign = JSON.parse(data.properties.PartitionElementDesign)
        }
        dialog.columnsMsg = []
        dialog.pk = []
        dialog.fk = []
        dialog.uk = []
        dialog.nk = []
        dialog.vk = []
        dialog.partition = null
        dialog.dwMapping = []
        dialog.cluster = null
        if (Array.isArray(data.children)) {
          data.children.forEach(item => {
            if (!item.properties.deleted) {
              if (item.properties['TypeId'] === LDMTypes.Attribute) {
                dialog.columnsMsg.push(item)
              } else if (item.properties['KeyGroupType'] === 'PrimaryKey') {
                dialog.pk.push(item)
              } else if (item.properties['KeyGroupType'] === 'ForeignKey') {
                dialog.fk.push(item)
              } else if (item.properties['KeyGroupType'] === 'UniqueKey') {
                dialog.uk.push(item)
              } else if (item.properties['KeyGroupType'] === 'NonUniqueKey') {
                dialog.nk.push(item)
              } else if (item.properties['KeyGroupType'] === 'VirtualKey') {
                dialog.vk.push(item)
              } else if (item.properties['TypeId'] === LDMTypes.Partition) { // 表分区
                dialog.partition = item
              } else if (item.properties.TypeId === LDMTypes.DWMapping) { // 数仓映射
                dialog.dwMapping.push(item)
              } else if (item.properties.TypeId === LDMTypes.Cluster) { // hive cluster
                dialog.cluster = item
              }
            }
          })
        }
        dialog.dwMapping.sort((a, b) => { // mapping按照创建顺序排序
          return a.properties.Id - b.properties.Id
        })
        dialog.dwMapping.forEach(mapping => {
          mapping.children?.sort((a, b) => {
            return a.properties.Id - b.properties.Id
          })
        })
        if (this.editorType === 'model') {
          this.currentEditTableId = tableId
          this.entityDialogData = dialog
          this.tableDialogKey++
          this.$nextTick(() => {
            this.$refs.tableDetailsEdit.onReady()
          })
        } else if (this.editorType === 'table') {
          if (isView) {
            const exist = this.views.some(view => {
              return view.tableMsg.Id === dialog.tableMsg.Id
            })
            if (!exist) {
              this.views.push(dialog)
              this.$nextTick(() => {
                this.$refs.viewDetailsEdit && this.$refs.viewDetailsEdit[this.views.length - 1].onReady()
                if (editMode) {
                  this.$refs.viewDetailsEdit && this.$refs.viewDetailsEdit[this.views.length - 1].startHeartBeat() // 如果是单表编辑，开启心跳
                }
              })
            } else {
              this.views.forEach((view, index) => {
                if (view.tableMsg.Id === dialog.tableMsg.Id) {
                  if (!dialog.editMode && view.editMode && this.editModeCanBeBefore) {
                  } else {
                    Object.keys(dialog).forEach(p => {
                      this.$set(view, p, dialog[p])
                    })
                    this.$nextTick(() => {
                      this.$refs.viewDetailsEdit && this.$refs.viewDetailsEdit[index].onReady()
                      if (editMode) {
                        this.$refs.viewDetailsEdit && this.$refs.viewDetailsEdit[index].startHeartBeat()
                      }
                    })
                  }
                }
              })
            }
            this.currentTab = dialog.tableMsg.Id + ''
          } else {
            const exist = this.tables.some(table => {
              return table.tableMsg.Id === dialog.tableMsg.Id
            })
            if (!exist) {
              this.tables.push(dialog)
              this.$nextTick(() => {
                this.$refs.tableDetailsEdit && this.$refs.tableDetailsEdit[this.tables.length - 1].onReady()
                if (editMode) {
                  this.$refs.tableDetailsEdit && this.$refs.tableDetailsEdit[this.tables.length - 1].startHeartBeat()
                }
              })
            } else {
              this.tables.forEach((table, index) => {
                if (table.tableMsg.Id === dialog.tableMsg.Id) {
                  if (!dialog.editMode && table.editMode && this.editModeCanBeBefore) {
                  } else {
                    Object.keys(dialog).forEach(p => {
                      this.$set(table, p, dialog[p])
                    })
                    this.$nextTick(() => {
                      this.$refs.tableDetailsEdit && this.$refs.tableDetailsEdit[index].onReady()
                      if (editMode) {
                        this.$refs.tableDetailsEdit && this.$refs.tableDetailsEdit[index].startHeartBeat()
                      }
                    })
                  }
                }
              })
            }
            this.currentTab = dialog.tableMsg.Id + ''
          }
        }
      }
    },

    afterHandleViewDialogData (viewId, editMode) {
      if (viewId) { //  it means a table already exists
        this.editViewDialog = true
        let data = this.dataByType.view[viewId]
        let dialog = {}
        dialog.visible = true
        dialog.tableMsg = data.properties
        if (!dialog.tableMsg.LogicalName) {
          //          dialog.tableMsg.LogicalName = dialog.tableMsg.Name;
        }
        if (editMode) {
          dialog.editMode = true
        }
        dialog.columnsMsg = []
        dialog.pk = []
        dialog.fk = []
        dialog.uk = []
        dialog.nk = []
        dialog.vk = []
        if (Array.isArray(data.children)) {
          data.children.forEach(item => {
            if (!item.properties.deleted) {
              if (item.properties['TypeId'] === LDMTypes.Attribute) {
                dialog.columnsMsg.push(item)
              } else if (item.properties['KeyGroupType'] === 'PrimaryKey') {
                dialog.pk.push(item)
              } else if (item.properties['KeyGroupType'] === 'ForeignKey') {
                dialog.fk.push(item)
              } else if (item.properties['KeyGroupType'] === 'UniqueKey') {
                dialog.uk.push(item)
              } else if (item.properties['KeyGroupType'] === 'NonUniqueKey') {
                dialog.nk.push(item)
              } else if (item.properties['KeyGroupType'] === 'VirtualKey') {
                dialog.vk.push(item)
              }
            }
          })
        }
        this.currentEditViewId = viewId
        this.viewDialogData = dialog
        this.$nextTick(() => {
          this.$refs.viewDetailsEdit.onReady()
        })
      }
    },

    afterHandleCommentData (commentId) {
      if (commentId) {
        this.currentEditCommentId = commentId
        this.commentDialogData = this.dataByType.comment[commentId].properties.Text
        if (this.currentStyleRelatedShapeTemplate.StyleFontBoldItalic === 'BoldItalic') {
          this.styleSetting.checkList = ['Bold', 'Italic']
        } else {
          this.styleSetting.checkList = [this.currentStyleRelatedShapeTemplate.StyleFontBoldItalic]
        }
        this.editCommentDialog = true
      }
    },

    // 处理列编辑页面需要的数据
    afterHandleColDialogData (tableId, colId, isView) {
      if (tableId) { //  it means a table already exists
        let data = isView ? this.dataByType.view[tableId] : this.dataByType.table[tableId]
        let dialog = {}
        dialog.visible = true
        dialog.tableMsg = data.properties
        dialog.colId = colId
        // if (editMode) {
        //   dialog.editMode = true
        // }
        dialog.columnsMsg = []
        dialog.pk = []
        dialog.fk = []
        dialog.uk = []
        dialog.nk = []
        dialog.vk = []
        if (Array.isArray(data.children)) {
          data.children.forEach(item => {
            if (item.properties['TypeId'] === LDMTypes.Attribute && !item.properties.deleted) {
            // 查找点击的字段的信息
              if (colId === item.properties.Id) {
                dialog.columnsMsg.push(item)
                if (item.properties.LogicalName) {
                  this.currentColName = ` ${item.properties.Name}(${item.properties.LogicalName}):  ${item.properties.DataType}`
                } else {
                  this.currentColName = ` ${item.properties.Name}:  ${item.properties.DataType}`
                }
              }
            } else if (item.properties['TypeId'] === LDMTypes.KeyGroup && item.properties['KeyGroupType'] === 'PrimaryKey' && !item.properties.deleted) {
              dialog.pk.push(item)
            } else if (item.properties['TypeId'] === LDMTypes.KeyGroup && item.properties['KeyGroupType'] === 'ForeignKey' && !item.properties.deleted) {
              dialog.fk.push(item)
            } else if (item.properties['TypeId'] === LDMTypes.KeyGroup && item.properties['KeyGroupType'] === 'UniqueKey' && !item.properties.deleted) {
              dialog.uk.push(item)
            } else if (item.properties['TypeId'] === LDMTypes.KeyGroup && item.properties['KeyGroupType'] === 'NonUniqueKey' && !item.properties.deleted) {
              dialog.nk.push(item)
            } else if (item.properties['TypeId'] === LDMTypes.KeyGroup && item.properties['KeyGroupType'] === 'VirtualKey' && !item.properties.deleted) {
              dialog.vk.push(item)
            }
          })
        }
        if (isView) {
          this.currentEditViewId = tableId
        } else {
          this.currentEditTableId = tableId
        }
        if (isView) {
          this.viewColDialogData = _.cloneDeep(dialog)
          this.viewColDialog = true
          // this.viewColKey++
          this.$nextTick(() => {
            this.$refs.viewColDetails.onReady()
          })
        } else {
          this.colDialogData = _.cloneDeep(dialog)
          this.colDialog = true
          // this.colKey++
          this.$nextTick(() => {
            this.$refs.colDetails.onReady()
          })
        }
      }
    },
    updateTabName () {
      this.currentTab = this.tabLabelFormatter(this.tables[0])
    },
    tabLabelFormatter (v) {
      if (v.appendMode) {
        return '添加表'
      } else {
        return v.tableMsg.Name + (v.tableMsg.LogicalName ? `(${v.tableMsg.LogicalName})` : '')
      }
    },
    showColDetail (id, pId) {
      let table = this.dataByType.table[pId]
      var data = {}
      for (let i = 0; i < table.children.length; i++) {
        if (table.children[i].properties.Id === id) {
          data = table.children[i].properties
          break
        }
      }
      this.dialog.title = $version.scan.dialog_col.title
      this.dialog.data = [{
        key: $version.scan.dialog_col.name,
        value: data.Name
      }, {
        key: $version.scan.dialog_col.alias,
        value: data.LogicalName
      }, {
        key: $version.scan.dialog_col.type,
        value: data.DataType
      }, {
        key: $version.scan.dialog_col.def,
        value: data.Definition
      }]
      this.dialog.visible = true
    },
    sliderFormatter: (value) => {
      if (value === 0) {
        return '100%'
      } else {
        return (100 * Math.pow(1.2, value)).toFixed(0) + '%'
      }
    },
    handleSliderChange (value) {
      let dif = value - this.sliderOldValue
      let factor = Math.pow(1.2, dif)
      this.graph.zoom(factor)
      this.sliderOldValue = value
    },
    changeFullScreen () {
      // if (!this.fixed) {
      //   this.$fullScreen()
      // } else {
      //   this.$exitFullScreen()
      // }
      if (!this.fixed) {
        window.document.documentElement.requestFullscreen()
      } else {
        document.exitFullscreen()
      }
      // this.fixed = !this.fixed
      this.$bus.$emit('ifFullScreen', this.fixed)
    },
    handleDataReportChange () {
      this.getRulecheck()
      this.showReport = !this.showReport
      if (this.showReport) {
        this.$nextTick(() => {
          this.handleReportTypeChange()
        })
      }
    },
    handleReportTypeChange (tab) {
      let name = ''
      if (tab && tab.name) {
        name = tab.name
      } else {
        name = this.currentReportType
      }
      if (name === 'ERROR') {
        this.reportShowData = this.reportWrongData
      } else if (name === 'WARN') {
        this.reportShowData = this.reportWarningData
      } else if (name === 'INFO') {
        this.reportShowData = this.reportTipsData
      }
      this.resetStyle()
    },
    remoteMethod (query) {
      if (query !== '') {
        this.loading.status = true
        setTimeout(() => {
          this.options4 = this.list.filter(item => {
            return string.matchKeyword(item, query, 'label')
          })
          this.loading.status = false
        }, 10)
      } else {
        this.options4 = []
      }
    },
    handleSelect (value) {
      if (value) {
        this.graph.focusTable(value)
      } else {
        this.options4 = []
      }
    },
    clickOutside () {
      if (this.needHide && this.showSearch) {
        this.value9 = []
        this.showSearch = false
        this.needHide = false
        this.options4 = []
      }
    },
    clearSelect (value) {
      $('.highlight').removeClass('highlight')
    },
    handleRowClick (row, column, event) {
      if (row.e) {
        let value = this.objectMap[row.e] ? this.objectMap[row.e].value : null
        if (value) {
          this.handleSelect(value)
        }
      }
    },
    expandAll () {
      this.graph.expandAll()
    },
    collapseAll () {
      this.graph.collapseAll()
    },
    toggleShowOutline () {
      this.showOutline = !this.showOutline
      this.shrink = false
      this.graph.refreshOutline()
    },
    getRulecheck (callback) {
      if (this.rulecheck) {
        this.$http.get(this.$url + '/service' + '/models/' + this.modelId + '/rulecheck')
          .then(res => {
            this.rulecheck = false
            let levelMap = {}
            let arr = res.data ? res.data.result : []
            let wrongData = []
            let warningData = []
            let tipsData = []
            if (arr && Array.isArray(arr) && arr.length > 0) {
              arr.forEach(item => {
                if (item.l === 'ERROR') {
                  wrongData.push(item)
                } else if (item.l === 'WARN') {
                  warningData.push(item)
                } else if (item.l === 'INFO') {
                  tipsData.push(item)
                }
                levelMap[item.t] = item.l
              })
            }
            this.reportWrongData = wrongData
            this.reportWarningData = warningData
            this.reportTipsData = tipsData
            this.reportShowData = this.reportWrongData
            this.levelMap = levelMap
            callback && callback()
          })
          .catch(e => {
            this.rulecheck = true
            this.$showFailure(e)
          })
      }
    },
    resetTableHeight () {
      this.reportTableHeight = $('.tablbe-conta').height()
      this.innerWidth = $(window).width()
    },
    resetStyle () {
      this.resetTableHeight()
    },
    beforeHandleCommand (command) {
      clearTimeout(this.handleCommandTimeout)
      this.handleCommandTimeout = setTimeout(() => {
        this.handleCommand(command)
      })
    },
    handleCommand (command) {
      // 调整显示
      if (command.indexOf('Column') > -1) {
        this.showNoColumn && (this.showNoColumn = false)
        this.showKeyColumn && (this.showKeyColumn = false)
        this.showAllColumn && (this.showAllColumn = false)
      }
      let diagram = this.mapIdToDiagramData[this.currentId]
      switch (command) {
        case 'dataType':
          this.showDataType = !this.showDataType
          if (this.showDataType) {
            this.graph.showDataType()
          } else {
            this.graph.hideDataType()
          }
          break

        case 'allColumn':
          this.showAllColumn = true
          this.columnDisplay = 'all'
          if (diagram) {
            diagram.DisplayLevel = 'ShowColumns'
            diagram.changed = true
          }
          this.expandAll()
          break
        case 'keyColumn':
          this.showKeyColumn = true
          this.columnDisplay = 'key'
          if (diagram) {
            diagram.DisplayLevel = 'ShowKeysOnly'
            diagram.changed = true
          }
          this.graph.showKeyColumn()
          break
        case 'noColumn':
          this.showNoColumn = true
          this.columnDisplay = 'no'
          if (diagram) {
            diagram.DisplayLevel = 'ShowTableOnly'
            diagram.changed = true
          }
          this.collapseAll()
          break
        case 'logicalName':
          if (!this.showPhysicalName && this.showLogicalName) {
            break
          }
          this.showLogicalName = !this.showLogicalName
          this.graph.showLogical = this.showLogicalName
          break
        case 'physicalName':
          if (this.showPhysicalName && !this.showLogicalName) {
            break
          }
          this.showPhysicalName = !this.showPhysicalName
          this.graph.showPhysical = this.showPhysicalName
          break
        default:
          break
      }
      this.showLogicalNameOrPhysicalName()
    },
    refreshGraphShowDetail () {
      if (this.showDataType) {
        this.graph.showDataType()
      } else {
        this.graph.hideDataType()
      }

      // if (this.showAllColumn) {
      //   this.expandAll()
      // } else if (this.showKeyColumn) {
      //   this.graph.showKeyColumn()
      // } else if (this.showNoColumn) {
      //   this.collapseAll()
      // }

      this.showLogicalNameOrPhysicalName()
    },
    showLogicalNameOrPhysicalName () {
      if (this.showPhysicalName && this.showLogicalName) {
        this.graph.showFullName(this.isDesignModel)
      } else if (this.showPhysicalName && !this.showLogicalName) {
        this.graph.showPhysicalName(this.isDesignModel)
      } else {
        this.graph.showLogicalName(this.isDesignModel)
      }
    },
    showDefault () {
      let query = this.$route.query
      if (query && query.checkResultType) {
        let checkResultType = query.checkResultType
        this.hightlightType = checkResultType
        let showReport = () => {
          this.currentReportType = this.levelMap[checkResultType]
          this.$nextTick(() => {
            this.showReport = false
            this.handleDataReportChange()
          })
        }
        if (this.levelMap) {
          showReport()
        } else {
          this.getRulecheck(showReport)
        }
      }
    },
    getTableRowClass ({ row, rowIndex }) {
      let str = 'table-row-class'
      if (row.t === this.hightlightType) {
        str += ' highlight-line'
      }
      return str
    },
    removeTab (name) {
      let nextTab = null
      if (name === 'tables') {
        this.currentTab = 'graph'
        this.showTabOfTables = false
      } else {
        let idx = -1
        this.tables.forEach((item, index) => {
          if (item.tableMsg.Id === +name) {
            idx = index
            nextTab = this.tables[index + 1] || this.tables[index - 1] || this.views[0]
          }
        })
        if (+name < 0) {
          delete this.dataByType.table[name] // 防止新增表关闭后，把空表添加进模型
        }
        if (idx !== -1) {
          this.tables.splice(idx, 1)
          this.currentTab = nextTab ? nextTab.tableMsg.Id + '' : 'tables'
          return
        }

        this.views.forEach((item, index) => {
          if (item.tableMsg.Id === +name) {
            idx = index
            nextTab = this.views[index + 1] || this.views[index - 1] || this.tables[this.tables.length - 1]
          }
        })
        this.views.splice(idx, 1)
        this.currentTab = nextTab ? nextTab.tableMsg.Id + '' : 'tables'
      }
    },
    handleTabName (obj) {
      if (obj.tableMsg.LogicalName) {
        return `${obj.tableMsg.Name}(${obj.tableMsg.LogicalName})`
      }
      return obj.tableMsg.Name
    },
    exportGraph () {
      const xmlDoc = mxUtils.createXmlDocument()
      const root = xmlDoc.createElement('output')
      const graph = this.graph.graph
      xmlDoc.appendChild(root)
      const [MxXmlCanvas2D, MxImageExport, MxXmlRequest] = [mxXmlCanvas2D, mxImageExport, mxXmlRequest]
      const xmlCanvas = new MxXmlCanvas2D(root)
      const imgExport = new MxImageExport()
      imgExport.drawState(graph.getView().getState(graph.model.root), xmlCanvas)
      const bounds = graph.getGraphBounds()
      const w = Math.ceil(bounds.x + bounds.width)
      const h = Math.ceil(bounds.y + bounds.height)
      const xml = mxUtils.getXml(root)
      console.log(xml, $(xml))
      // new MxXmlRequest(location.href, 'format=png&w=' + w +
      //   '&h=' + h + '&bg=#F9F7ED&xml=' + encodeURIComponent(xml))
      //   .simulate(document, '_self')
    },
    saveLayer () {
      if (!this.graph.editor.undoManager.indexOfNextAdd) {
        this.$message.warning('请修改后保存')
        return
      }
      this.checkInVersionDialogVisible = true
    }
  },
  watch: {
    'currentModel.seed' (val) {
      this.deliverNum.seed = val + 1
    },
    activeThemeTab (val) {
      switch (val) {
        case 'table':
          if (this.formatThemeDataCopy.EntityHeaderTextFontBoldItalic === 'BoldItalic') {
            this.styleSetting.checkList = ['Bold', 'Italic']
          } else {
            this.styleSetting.checkList = [this.formatThemeDataCopy.EntityHeaderTextFontBoldItalic]
          }
          break
        case 'column':
          if (this.formatThemeDataCopy.AttributeTextFontBoldItalic === 'BoldItalic') {
            this.styleSetting.checkList = ['Bold', 'Italic']
          } else {
            this.styleSetting.checkList = [this.formatThemeDataCopy.AttributeTextFontBoldItalic]
          }
          break
        case 'comment':
          if (this.formatThemeDataCopy.CommentTextFontBoldItalic === 'BoldItalic') {
            this.styleSetting.checkList = ['Bold', 'Italic']
          } else {
            this.styleSetting.checkList = [this.formatThemeDataCopy.CommentTextFontBoldItalic]
          }
          break
        case 'relation':
          if (this.formatThemeDataCopy.RelationshipTextFontBoldItalic === 'BoldItalic') {
            this.styleSetting.checkList = ['Bold', 'Italic']
          } else {
            this.styleSetting.checkList = [this.formatThemeDataCopy.RelationshipTextFontBoldItalic]
          }
          break
      }
    },
    entityTotal: {
      handler (newVal, oldVal) {
        this.entityTotalCount = newVal
      }
    },
    sumElementNum (val) {
      this.sumElementNumCopy = val
    },
    currentId (newVal) {
      this.handleData()
    },
    sliderValue (value) {
      this.handleSliderChange(value)
    },
    showOutline: {
      handler (newVal) {
        this.$bus.$emit('showOutlineChange', newVal)
      },
      immediate: true
    },
    parentCurrentPane (val) {

    },
    historyList () {
      if (this.showSearch) {
        clearTimeout(this.historyTimer)
        this.historyTimer = setTimeout(() => {
          this.prepareZoomData()
        }, 5000)
      }
      if (inElectron) {
        const { ipcRenderer } = require('electron')
        ipcRenderer.send('needSave', this.modelId, !!this.historyList.length)
      }
      if (this.editorType === 'model' && !this.disabledEdit) {
        clearTimeout(this.unlockTimer)
        this.unlockTimer = setTimeout(() => { // 两小时未操作解锁该模型
          let url = `${this.$url}/service/editor/${this.currentModel.id}/unlock`
          let tenantId = localStorage.getItem('tenantId')
          if (tenantId) {
            url += `?tenantId=${tenantId}`
          }
          this.$http.post(url).then(res => {
            if (res.data) {
              clearInterval(this.heartBeatInterval)
              this.$DatablauCofirm('2小时未操作，已解锁该模型， 是否继续编辑', '提示', {
                type: 'warning',
                confirmButtonText: '确定',
                showClose: false,
                closeOnClickModal: false
              }).then(() => {
                this.$http.get(this.$url + '/service/models/' + this.currentModel.id
                ).then(res => {
                  if (res.data.currentVersion === +this.$route.query.currentVersion && this.editorType === 'model') {
                    this.$http.put(`${this.$url}/service/editor/${this.currentModel.id}/lock`).then(res => {
                      if (res.data) {
                        this.heartBeat()
                        this.heartBeatInterval = setInterval(() => {
                          this.heartBeat()
                        }, 1000 * 60)
                      } else {
                        this.$blauShowFailure('模型尝试加锁失败，请重试')
                      }
                    }).catch(err => {
                      this.$showFailure(err)
                    })
                  } else {
                    this.$DatablauCofirm('模型在解锁期间已被修改，请刷新浏览器后再次操作', '提示', {
                      type: 'warning',
                      confirmButtonText: '确定',
                      showClose: false,
                      closeOnClickModal: false
                    })
                  }
                }).catch(err => {
                  this.$showFailure(err)
                })
              }).catch(() => {

              })
            } else {
              this.$blauShowFailure('模型解锁失败')
            }
          }).catch(err => {
            this.$showFailure(err)
          }).finally(() => {
            clearInterval(this.interval)
          })
        }, 3600000 * 2)

        clearTimeout(this.unlockTimer1)
        this.noOperateTime = Date.now()
        this.unlockTimer1 = setTimeout(() => { // 半小时未操作提示用户
          this.$DatablauCofirm(`已超过${parseInt((Date.now() - this.noOperateTime) / 60000)}分钟未操作，超过两小时自动解锁该模型`, '提示', {
            type: 'warning',
            confirmButtonText: '确定',
            showClose: false,
            closeOnClickModal: false
          })
        }, 3600000 * 0.5)
      }
    }
  }
}
