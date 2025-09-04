<template>
  <div class="entity-detail-wrapper">
    <div class="breadcrumb-wrapper" key="tableDetail">
      <datablau-breadcrumb
        :node-data="breadcrumbData"
        @back="goBack"
      ></datablau-breadcrumb>
    </div>

    <div
      class="table-detail-container"
      v-loading="!(rawData && currentModelData)"
    >
      <table-details
        v-if="rawData && currentModelData"
        :loading="false"
        :reNameColumnType="reNameColumnType"
        :editorType="'table'"
        :key="rawData.tableMsg.Id"
        :deliverNum="currentModel"
        :TypeUniqueIdToColumnDefaultType="TypeUniqueIdToColumnDefaultType"
        :tableDialogKey="0"
        ref="tableDetailsEdit"
        :rawData="rawData"
        :current-model="currentModel"
        :data-by-type="dataByType"
        :isLogicalModel="isLogicalModel"
        :isDesignModel="isDesignModel"
        :getTableHTMLFunction="getTableHTMLFunction"
        :startIdToEndIds="startIdToEndIds"
        :createDeepRelation="createDeepRelation"
        :calculateStartIdToEndIds="calculateStartIdToEndIds"
        :cellDialogData="cellDialogData"
        :currentStyleRelatedShapeTemplate="currentStyleRelatedShapeTemplate"
        :formatThemeTemplateData="formatThemeTemplateData"
        :currentId="0"
        :isCassandraOrMongoDB="isCassandraOrMongoDB"
        :isLogical="isLogical"
        :isConceptual="isConceptual"
        :getTableNameNamingMap="getTableNameNamingMap"
        :getColumnNameNamingMap="getColumnNameNamingMap"
        :getIndexNameNamingMap="getIndexNameNamingMap"
        :categoryOrder="categoryOrder"
        :isShowSchema="isShowSchema"
        @changeDialogWidth="changeDialogWidth"
        :LayerEdit="LayerEdit"
        :graph="null"
        :Changes="Changes"
        @openColumnDialog="openColumnDialog"
        @updateTabName="updateTabName"
        @updateVersion="updateVersion"
        @updateTableData="updateTableData"
        @handleDialogData="closeTableDetail"

        @checkColumnDetail="checkColumnDetail"
        @setRequestBody="setRequestBody"
        :showKnowledgeGraph="showKnowledgeGraph"
      >
      </table-details>
    </div>

    <div class="column-detail-wrapper" v-if="showColumnDetail">
      <div class="breadcrumb-wrapper">
        <datablau-breadcrumb
          :node-data="columnBreadcrumbData"
          @back="columnGoBack"
          key="columnDetail"
        ></datablau-breadcrumb>
      </div>

      <div class="column-detail-container">
        <column-detail
          :column-data="currentColumnData"
          :currentModelData="currentModelData"
          :dataByType="dataByType"
          :currentModel="currentModel"
          :requestBody="tableRequestBody"
          :entityData="entityData"
          :showKnowledgeGraph="showKnowledgeGraph"
        ></column-detail>
      </div>
    </div>
  </div>
</template>

<script>
import HTTP from '@/resource/http'
import LDMTypes from '@constant/LDMTypes'
import tableDetails from './tableDetails.vue'
import columnDetail from './columnDetail.vue'
import sort from '@/resource/utils/sort'
import request from '@/resource/NormalRequest'
const NormalRequest = request.NormalRequest
export default {
  name: 'entityDetail',
  data () {
    return {
      // modelGraphEditor
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
        '5053d067-62bb-f7ae-7971-f28ac8fdd44b': 'String'
      },
      cellDialogData: null,
      currentStyleRelatedShapeTemplate: {},
      categoryOrder: [],

      // model.js
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

      isDesignModel: this.isLogical || this.isConceptual,
      getTableHTMLFunction: null,
      startIdToEndIds: {},
      entityDialogData: {
        tableMsg: {},
        dwMapping: []
      },
      breadcrumbData: ['实体', '实体详情'],
      tableData: null,
      rawData: null,
      currentModelData: null,
      modelDataMap: {},
      longkey: false,
      tableRequestBody: null,

      // 字段详情
      columnBreadcrumbData: ['实体', '字段详情'],
      showColumnDetail: false,
      columnsMap: {},
      currentColumnData: null
    }
  },
  props: {
    logicalModelVersionId: {
      type: Number,
      required: true
    },
    entityData: {
      type: Object,
      required: true
    },
    path: {
      type: Array,
      required: true
    },
    currentModel: {
      type: Object,
      default () {
        return {
          permission: {
            admin: true
          }
        }
      }
    },
    showKnowledgeGraph: {
      type: Boolean,
      default: false
    },
    isShowSchema: {
      type: Boolean,
      default: false
    },
    isLogical: {
      type: Boolean,
      default: true
    },
    isLogicalModel: {
      type: Boolean,
      default: true
    },
    isConceptual: {
      type: Boolean,
      default: true
    },
    isCassandraOrMongoDB: {
      type: Boolean,
      default: false
    },
    modelId: {
      type: [String, Number],
      required: true
    },
    elementId: {
      type: [String, Number],
      required: true
    }
  },
  components: {
    tableDetails,
    columnDetail
  },
  computed: {},
  mounted () {
    this.dataInit()
  },
  methods: {
    dataInit () {
      this.getElementContent()

      this.getDiagrams()
    },
    goBack () {
      this.$emit('goBack')
    },
    getElementContent () {
      let url = `${this.$url}/models/${this.modelId}/table/${this.elementId}?versionId=${this.logicalModelVersionId}`
      let colDetail = this.$http.get(url)
      let getElementContent = NormalRequest({
        url: `${this.$url}/service/models/${this.modelId}/elements/${this.elementId}/content/json?longKey=${this.longkey || false}&versionId=${this.logicalModelVersionId}`
      })
      Promise.all([colDetail, getElementContent])
        .then(([res, data]) => {
          this.tableData = data
          let path = _.cloneDeep(this.path)
          path.push({
            name: data.properties.Name,
            couldClick: false
          })
          this.breadcrumbData = path
          this.dataFormatter(data)
          let columnsMap = {}
          res.data.forEach(item => {
            if (item.typeId === LDMTypes.Attribute) {
              columnsMap[item.elementId] = item
            }
          })
          this.columnsMap = columnsMap
          console.log(this.columnsMap, 'this.columnsMap')
          console.log(this.rawData.columnsMsg, 'this.rawData.columnsMsg')
          this.rawData.columnsMsg?.forEach(col => {
            col.originData = this.columnsMap[col.properties.Id]
          })
          // this.getColumnsDetail()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getColumnsDetail () {
      let columnsMap = {}
      let url = `${this.$url}/models/${this.modelId}/table/${this.elementId}`
      this.$http.get(url)
        .then(res => {
          res.data.forEach(item => {
            if (item.typeId === LDMTypes.Attribute) {
              columnsMap[item.elementId] = item
            }
          })
          this.columnsMap = columnsMap
          this.rawData.columnsMsg?.forEach(col => {
            col.originData = this.columnsMap[col.properties.Id]
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 格式化数据
    dataFormatter (data) {
      // let data = this.dataByType.table[tableId]
      let dialog = {}
      dialog.visible = true
      dialog.tableMsg = data.properties
      dialog.tableOrign = this.entityData

      dialog.editMode = false
      dialog.columnsMsg = []
      dialog.pk = []
      dialog.fk = []
      dialog.uk = []
      dialog.nk = []
      dialog.vk = []
      if (Array.isArray(data.children)) {
        data.children.forEach(item => {
          if (item.properties['TypeId'] === LDMTypes.Attribute) {
            dialog.columnsMsg.push(item)
          } else if (item.properties['TypeId'] === LDMTypes.KeyGroup && item.properties['KeyGroupType'] === 'PrimaryKey') {
            dialog.pk.push(item)
          } else if (item.properties['TypeId'] === LDMTypes.KeyGroup && item.properties['KeyGroupType'] === 'ForeignKey') {
            dialog.fk.push(item)
          } else if (item.properties['TypeId'] === LDMTypes.KeyGroup && item.properties['KeyGroupType'] === 'UniqueKey') {
            dialog.uk.push(item)
          } else if (item.properties['TypeId'] === LDMTypes.KeyGroup && item.properties['KeyGroupType'] === 'NonUniqueKey') {
            dialog.nk.push(item)
          } else if (item.properties['TypeId'] === LDMTypes.KeyGroup && item.properties['KeyGroupType'] === 'VirtualKey') {
            dialog.vk.push(item)
          }
        })
      }
      this.rawData = dialog
      // {
      //   columnsMsg: [],
      //   pk: [],
      //   fk: [],
      //   uk: [],
      //   nk: [],
      //   vk: [],
      //   tableMsg: {
      //     LogicalName: '',
      //     Name: '',
      //     Definition: ''
      //   },
      //   appendMode: true
      // }
    },

    // model.js
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
    getDiagrams () {
      NormalRequest({
        url: `${this.$url}/service/models/${this.modelId}/direct/content/json?longKey=${this.longkey || false}&versionId=${this.logicalModelVersionId}`
      })
        .then(data => {
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
        })
        .catch(e => {
          this.$showFailure(e)
        })
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
    getModelDetailInfo () {
      this.$http.get(`${this.$url}/models/${this.modelId}`)
        .then(res => {
          this.currentModelData = res.data
          this.modelDataMap[this.modelId] = res.data
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
        }).catch(err => {
          this.$showFailure(err)
        })
    },
    LayerEdit () {
    },
    changeDialogWidth () {
    },
    Changes () {
    },
    openColumnDialog () {
    },
    updateTabName () {
    },
    updateVersion () {
    },
    updateTableData () {
    },
    closeTableDetail () {
    },

    // model graph editor
    async createDeepRelation () {
      return {}
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
    getIndexNameNamingMap (macro, name, keyId) {
      if (macro && keyId !== undefined) {
        return this.changeAlphabetType(macro.replace(/%owner%/, name).replace(/%keyid%/, keyId), this.dataByType.namingOption.IndexNameCase)
      } else {
        return this.changeAlphabetType(name, this.dataByType.namingOption.IndexNameCase)
      }
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
    setRequestBody (data) {
      this.tableRequestBody = data
    },

    checkColumnDetail (data) {
      this.showColumnDetail = true
      this.currentColumnData = data
      let path = _.cloneDeep(this.breadcrumbData)
      path.push({
        name: data.name,
        couldClick: false
      })

      this.columnBreadcrumbData = path
    },
    columnGoBack () {
      this.showColumnDetail = false
    }

  },
  watch: {}
}
</script>

<style lang="scss" scoped>
.entity-detail-wrapper {
  background-color: #fff;

  .breadcrumb-wrapper {
    position: relative;
    z-index: 1;
    padding: 0 20px;
    height: 34px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #DDD;
  }

  .table-detail-container, .column-detail-container {
    position: absolute;
    left: 0;
    right: 0;
    top: 34px;
    bottom: 0;
  }

  .table-detail-container {
    z-index: 1;
  }

  .column-detail-wrapper {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 2;
    background-color: #fff;
  }
}

</style>
