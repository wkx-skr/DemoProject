import permission from './permission.vue'
import IsShowTooltip from '@/components/common/isShowTooltip.vue'
import sort from '@/resource/utils/sort'
import themeManagement from '@/views/themeManagement/main.vue'
import tableDetails from './tableDetails.vue'
import HTTP from '@/resource/http'
import LDMTypes from '@constant/LDMTypes'
import { v4 as uuidv4 } from 'uuid'
import setModel from './setModel'
import permissionTable from './permissionTable.vue'

import { forEach } from 'lodash'

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
export default {
  components: {
    permission,
    IsShowTooltip,
    themeManagement,
    tableDetails,
    setModel,
    permissionTable
  },
  data () {
    return {
      keyword: '',
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'name',
        value: 'id'
      },
      defaultExpandedKeys: [1],
      layerVisible: false,
      form: {
        name: '',
        alias: '',
        layerId: null,
        definition: '',
        forceCheckFlag: false
      },
      rules: {
        name: [
          {
            required: true,
            message: '请输入分层名称',
            trigger: 'blur'
          }
        ],
        layerId: [
          {
            required: true,
            message: '请选择分层目录',
            trigger: 'change'
          }
        ],
        entityTemplateId: [
          {
            required: true,
            message: '请选择命名规则',
            trigger: 'change'
          }
        ],
        modelIdName: [
          {
            required: true,
            message: '请选择数据模型',
            trigger: 'change'
          }
        ]
      },
      activeName: 'first',
      formDetail: {},
      themeData: [],
      showAuthManageDialog: false,
      nodeData: [
        {
          name: '分层',
          couldClick: false
        },
        {
          name: '权限管理',
          couldClick: false
        }
      ],
      themeSelectArr: [],
      addThemeVisible: false,
      treeThemeData: [],
      defaultThemeProps: {
        children: 'children',
        label: 'name',
        value: 'id'
      },
      defaultExpandedThemeKeys: [0],
      keywordTheme: '',
      templateList: [],
      namePath: [],
      dataOptionsLayer: [],
      layerContents: [],
      themeCheckList: [],
      themeCheckedKey: [],
      tableData: [],
      pageSize: 20,
      currentPage: 1,
      totalShow: 0,
      keywordTable: '',
      sortedData: [],
      chosenCategoryId: null,
      showThemeManageDialog: false,
      modelsList: [],
      currentModel: {},
      currentTab: 'tables',
      tables: [],
      tableDetailShow: false,
      longkey: true,
      editorType: 'table',
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
      deliverNum: {
        emptyColumnNum: -30000000,
        emptyMemberNum: -40000000
      },
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
      tableDialogKey: 0,
      isLogicalModel: false,
      loading: {
        status: false,
        text: '请求模型数据'
      },
      isDesignModel: false,
      getTableHTMLFunction: null,
      Changes,
      allUdpList: [],
      udpListfilteredArray: [],
      layerId: '',
      permissionObj: {},
      logModal: false,
      nodeClickDataLayer: {},
      rowSubjectId: null,
      currentModelId: null,
      emptyTableNum: -500000000,
      subjectId: '',
      themeDataSelect: [],
      rowAuthTableId: null,
      showAuthManageTableDialog: false,
      rowNameAbbreviation: '',
      addTableDisabled: false,
      endVersion: null,
      openTableType: '',
      syncTableDialogVisible: false,
      syncTableKeyword: '',
      syncTableLoading: false,
      syncTableList: [],
      selectedSyncTables: [],
      layerIdDisabled: false
    }
  },
  mounted () {
    this.getTreeData()
    this.getModelsList()
    this.getAllUdpList()
  },
  methods: {
    onRowAuthClick (row) {
      this.nodeData = [
        {
          name: '实体',
          couldClick: false
        },
        {
          name: row.name,
          couldClick: false
        },
        {
          name: '权限管理',
          couldClick: false
        }
      ]
      this.showAuthManageTableDialog = true
      this.rowAuthTableId = row.tableId
    },
    themeDataChange (id) {
      this.currentPage = 1
      this.filterData()
    },
    getNamingRule (id) {
      if (id) {
        return this.templateList.filter(item => item.id === Number(id))[0]?.name
      } else {
        return ''
      }
    },
    openModelVisible () {
      this.logModal = true
    },
    bpmnResult (result) {
      this.$set(this.form, 'modelId', result.id)
      this.$set(this.form, 'modelIdName', result.name)
    },
    closeMode () {
      this.logModal = false
    },
    removeBlankTab () {
      this.currentTab = 'list'
      this.currentTabClick()
      this.getModelsList(this.currentModelId)
      this.updateTabName()
    },
    onRowEditClick (row) {
      this.$http
        .put(`${this.$url}/layer/${row.modelId}/${row.tableId}/lock`)
        .then(res => {
          this.rowSubjectId = row.subjectId
          this.rowNameAbbreviation = row.properties[80010060]
          this.getDiagramsThemeData(this.currentModelId)
          this.$store.commit('setTableId', row.tableId)
          this.handleDialogData(row.tableId, true, '', row)
          // this.$emit('handleDialogDataEdit', row.tableId, row.isView)
          this.tableDetailShow = true
          this.$router.push({
            params: {
              id: row.modelId // 传递的参数值
            }
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    onRowDeleteClick (row) {
      this.getVersions(this.currentModel.id)
      this.$http
        .put(`${this.$url}/layer/${row.modelId}/${row.tableId}/lock`)
        .then(res => {
          this.$confirm(`${this.$store.state.$v.modelDetail.sureDelete + row.name + this.$store.state.$v.modelDetail.ma}`, '', {
            type: 'warning',
            confirmButtonText: this.$store.state.$v.modelDetail.ok,
            cancelButtonText: this.$store.state.$v.modelDetail.cancel
          }).then(() => {
            this.tableLoading = true
            this.$http.post(`${this.$url}/layer/${row.modelId}/${row.tableId}/unlock`).then(res => {
              HTTP.deleteTableOfModelLayer({
                modelId: this.currentModel.id,
                tableId: row.tableId,
                modelVersion: this.endVersion,
                successCallback: data => {
                  this.getTableData({ id: this.layerId })
                  this.$datablauMessage.success('删除成功！')
                },
                failureCallback: () => {

                },
                finallyCallback: () => {
                  this.tableLoading = false
                }
              })
            }).catch(err => {
              this.$showFailure(err)
            })
          }).catch(() => {
            this.$message.info(this.$store.state.$v.modelDetail.operationCancel)
            this.$http.post(`${this.$url}/layer/${row.modelId}/${row.tableId}/unlock`).then(res => {
            }).catch(err => {
              this.$showFailure(err)
            })
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getVersions (id) {
      if (id) {
        this.$http.get(this.$url + '/service/models/' + id + '/versions').then(res => {
          console.log(res.data[0].endVersion, 'res.data')
          this.endVersion = res.data[0].endVersion
        })
      }
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
    onRowClickTheme (row, type) {
      this.openTableType = type
      this.currentModel.id = row.modelId
      this.rowSubjectId = row.subjectId
      this.$store.commit('setTableId', row.tableId)
      this.getDiagramsThemeData(row.modelId)
      if (!type) {
        this.showThemeManageDialog = false
      }
      this.handleDialogData(row.tableId, '', '', row)
      this.rowNameAbbreviation = row.properties[80010060]
      this.tableDetailShow = true
      this.$router.push({
        params: {
          id: row.modelId // 传递的参数值
        }
      })
    },
    onRowClick (row) {
      this.rowSubjectId = row.subjectId
      this.$store.commit('setTableId', row.tableId)
      this.getDiagramsThemeData(this.currentModelId)
      this.handleDialogData(row.tableId, '', '', row)
      this.rowNameAbbreviation = row.properties[80010060]
      this.tableDetailShow = true
      this.$router.push({
        params: {
          id: row.modelId // 传递的参数值
        }
      })
    },
    addTableDisabledChange () {
      this.addTableDisabled = true
      setTimeout(() => {
        this.addTableDisabled = false
      }, 3000)
    },
    addTable () {
      console.log(this.currentModelId, 'this.currentModelId')
      // this.$http.put(`${this.$url}/service/editor/${this.currentModel.id}/lock`).then(res => {
      //   if (res.data) {
      //     this.$store.commit('setEditStatus', true)
      //     this.$emit('handleDialogData')
      //   } else {
      //     this.$message.error('模型尝试加锁失败，请重试')
      //   }
      // }).catch(err => {
      //   this.$showFailure(err)
      // })
      this.dataByType.table = {}
      this.dataByType.diagram = {}
      this.dataByType.view = {}
      this.dataByType.comment = {}
      this.dataByType.relation = {}
      this.dataByType.model = {}
      this.dataByType.theme = {}
      this.dataByType.schema = {}
      this.emptyTableNum = -500000000
      this.handleDialogData()
      this.tableDetailShow = true
      this.getDiagramsThemeData(this.currentModelId)
      this.addTableDisabledChange()
    },
    updateTabName () {
      this.currentTab = this.tabLabelFormatter(this.tables[0])
      if (this.tables[0].tableMsg.Id.includes('#seed')) {
        this.removeTab(this.tables[0].tableMsg.Id)
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
    },
    closeTableDetail (id, editMode, isView) {
      this.editModeCanBeBefore = false
      this.handleDialogData(id, editMode, isView)
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
    async createDeepRelation (endIds, target, changes, originSourceTablePrevious, noIndexModifed, sourceDeliverColumnIds = null) { // deliverColumnIds === null, 传递所有字段，否则传递指定字段
      if (endIds) {
        for (let endId of new Set(endIds)) { // endIds可能有相同的，比如表A和表B间有主键关系和非主键关系两个
          let cell = this.graph.graph.getDefaultParent().children.find(cell => cell.OwneeRef === endId)
          if (!cell) {
            cell = {
              id: -1,
              OwneeRef: endId
            }
          }
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
      }
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

    tabLabelFormatter (v) {
      if (v.appendMode) {
        return '添加表'
      } else {
        return v.tableMsg.Name + (v.tableMsg.LogicalName ? `(${v.tableMsg.LogicalName})` : '')
      }
    },
    getAllUdpList () {
      this.$http.get(`${this.$url}/service/udps/`)
        .then(res => {
          res.data.forEach((value, key) => {
            if (value.targetTypes[0] === 80000004) {
              this.udpListfilteredArray.push(value)
            }
          })
          this.dataByType.udpOrigin = {
            children: []
          }
          // this.dataByType.udpOrigin.children = []
          const transformedData = new Map()
          res.data.forEach(udp => {
            transformedData.set(udp.udpId, { ExtendedEnumStruct: udp.enumValues?.length ? JSON.stringify(udp.enumValues) : '',
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
              DefaultUDPValue: udp.defaultValue })
            this.dataByType.udpOrigin.children.push({
              objectClass: 'Datablau.LDM.ObjectX',
              properties: { ExtendedEnumStruct: udp.enumValues?.length ? JSON.stringify(udp.enumValues) : '',
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
                DefaultUDPValue: udp.defaultValue }
            })
          })
          this.dataByType.udp = transformedData
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
    handleDialogData (tableId, editMode, isView = false, row) { // tableId可能是viewId
      if (tableId) {
        // this.loading.status = true
        HTTP.getElementContent({
          modelId: this.currentModel.id,
          elementId: tableId,
          longkey: true,
          successCallback: data => {
            if (this.longkey) {
              data = this.transformData(data)
            }
            // this.dataByType.table = {
            //   tableId: data
            // }
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
            this.afterHandleDialogData(tableId, editMode, isView, row)
          },
          finallyCallback: () => {
            // this.loading.status = false
          }
        })
      } else {
        this.emptyTableNum = `#seed${++this.deliverNum.seed}#`
        // this.emptyTableNum = this.deliverNum.seed
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
            new: true,
            Layer: ''
          }
        })
        this.tables.forEach((element, index) => {
          if (element.appendMode) {
            this.tables.splice(index, 1)
          }
        })
        const existTableIndex = this.tables.findIndex(table => {
          return table.appendMode
        })
        let dialog = {
          columnsMsg: [],
          pk: [],
          fk: [],
          uk: [],
          nk: [],
          vk: [],
          tableMsg: {
            LogicalName: '',
            Name: '',
            Definition: '',
            Id: this.emptyTableNum,
            TypeId: LDMTypes.Entity
          },
          appendMode: true
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
    nameAbbreviationChange (newdata) {
      this.rowNameAbbreviation = newdata
    },
    afterHandleDialogData (tableId, editMode, isView, row) {
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
        dialog.appendMode = false
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
        dialog.SubjectId = this.rowSubjectId
        dialog.nameAbbreviation = this.rowNameAbbreviation
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
        if (row) {
          dialog.permissionLi = row.permissionLi
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
    currentTabClick (name) {
      if (this.currentTab === 'list') {
        if (this.openTableType) {
          this.tableDetailShow = false
        } else {
          this.tableDetailShow = false
          this.getTableData({ id: this.layerId })
        }
      }
    },
    removeTab (name) {
      let nextTab = null
      console.log(name, 'name')
      if (name === 'tables') {
        this.currentTab = 'graph'
        this.showTabOfTables = false
      } else {
        let idx = -1
        this.tables.forEach((item, index) => {
          if (name.includes('#seed')) {
            if (item.tableMsg.Id === name) {
              idx = index
              nextTab = this.tables[index + 1] || this.tables[index - 1]
            }
          } else {
            if (item.tableMsg.Id === +name) {
              idx = index
              nextTab = this.tables[index + 1] || this.tables[index - 1]
            }
          }
        })
        if (name.includes('#seed')) {
          delete this.dataByType.table[name] // 防止新增表关闭后，把空表添加进模型
        } else {
          if (+name < 0) {
            delete this.dataByType.table[name] // 防止新增表关闭后，把空表添加进模型
          }
        }
        if (idx !== -1) {
          this.tables.splice(idx, 1)
          this.currentTab = nextTab ? nextTab.tableMsg.Id + '' : 'tables'
          if (this.tables.length === 0) {
            this.tableDetailShow = false
            if (!this.openTableType) {
              this.getTableData({ id: this.layerId })
            }
            this.getModelsList(this.currentModelId)
          }
          return
        }
        this.currentTab = nextTab ? nextTab.tableMsg.Id + '' : 'tables'
      }
    },
    getModelsList (id) {
      this.$http
        .get(`${this.$url}/layer/model/list/all`)
        .then(res => {
          this.modelsList = res.data
          if (id) {
            res.data.forEach(element => {
              if (element.id === id) {
                this.deliverNum.seed = element.seed + 1
                this.currentModel = element
              }
            })
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getDiagramsThemeData (id) {
      this.$http.get(this.$url + `/models/model/source/${id}`).then(res => {
        console.log(res, 'res')
        this.currentModel.Id = res.data.elementId
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    themeManage (data) {
      this.showThemeManageDialog = true
      this.nodeData = [
        {
          name: '主题管理',
          couldClick: false
        }
      ]
    },
    lockLayer (data) {
      this.showAuthManageDialog = true
      this.chosenCategoryId = data.id
      this.nodeData = [
        {
          name: this.treeData[0].name,
          couldClick: false
        },
        {
          name: data.name,
          couldClick: false
        },
        {
          name: '权限管理',
          couldClick: false
        }
      ]
    },
    layerIdChange (value) {
      this.$nextTick(() => {
        this.$set(this.form, 'layerId', value)
      })
      this.$forceUpdate()
    },
    handleCheckChange (data, data2) {
      this.themeCheckList = data2.checkedKeys
    },
    getThemeTree () {
      this.$http
        .get(`${this.$url}/subject/tree`)
        .then(res => {
          res.data.disabled = true
          this.treeThemeData = [res.data]
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    dataIconFunctionTheme (data, node) {
      if (node.expanded) {
        return 'iconfont icon-openfile'
      } else {
        return 'iconfont icon-file'
      }
    },
    filterNodeTheme (value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    addTheme () {
      this.addThemeVisible = true
      this.getThemeTree()
      this.$nextTick(() => {
        this.$refs.treeTheme.setCheckedKeys(this.themeCheckedKey)
      })
    },
    goBack () {
      this.showAuthManageDialog = false
      this.showThemeManageDialog = false
      this.showAuthManageTableDialog = false
      this.openTableType = ''
      this.$router.push({ name: 'layerManage' })
    },
    handleClickTab () {

    },
    // 命名规则模板列表
    getTemplateList () {
      this.$http.get(this.$url + '/service/entitytemplate/publish').then(res => {
        this.templateList = res.data
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    goModelTemplate () {
      var pos = location.href.indexOf('#/')
      var baseUrl = location.href.slice(0, pos + 2)
      window.open(baseUrl + `main/modelTemplate`)
    },
    layerSave () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (this.form.id) {
            let obj = {
              name: this.form.name,
              alias: this.form.alias,
              themeNo: this.form.themeNo,
              definition: this.form.definition,
              parentId: this.form.parentId,
              id: this.form.id,
              // layerId: this.form.layerId,
              modelId: this.form.modelId,
              forceCheckFlag: !!this.form.forceCheckFlag
            }
            this.$http
              .put(`${this.$url}/layer`, this.form)
              .then(res => {
                this.$datablauMessage.success('修改成功')
                this.layerVisible = false
                this.getTreeData()
                this.getModelsList()
                if (this.layerId === this.form.id) {
                  this.getLayerIdDetail(this.form.id)
                  this.getTableData({ id: this.form.id })
                  this.$refs.tree.setCurrentKey(this.form.id)
                }
              })
              .catch(e => {
                this.$showFailure(e)
              })
          } else {
            let obj = {
              name: this.form.name,
              alias: this.form.alias,
              // layerId: this.form.layerId,
              entityTemplateId: this.form.entityTemplateId,
              parentId: this.form.layerId,
              description: this.form.description,
              modelId: this.form.modelId,
              forceCheckFlag: !!this.form.forceCheckFlag
            }
            this.$http
              .post(`${this.$url}/layer`, obj)
              .then(res => {
                this.$datablauMessage.success('创建成功')
                this.layerVisible = false
                this.getTreeData()
                this.getModelsList()
              })
              .catch(e => {
                this.$showFailure(e)
              })
          }
        }
      })
    },
    handleNodeClick (data, node) {
      if (data.id !== 1) {
        this.activeName = 'first'
        if (this.modelsList.filter(item => item.id === data.modelId).length === 0) {
          this.$datablauMessage.error('当前分层未绑定模型，请先绑定模型')
          return
        }
        this.getLayerIdDetail(data.id)
        this.namePath = this.getPath(node)
        this.getLayerThemes(data.id)
        this.getTableData(data)
        // this.getPermissionsTableData(data)
        this.currentModelId = data.modelId
        this.currentModel = this.modelsList.filter(item => item.id === data.modelId)[0]
        this.getDiagramsThemeData(data.modelId)
        this.deliverNum.seed = this.currentModel.seed + 1
        this.tables = []
        this.layerId = data.id
        this.layerIdName = data.name
        this.nodeClickDataLayer = data
        this.permissionObj = data.persion
        this.getTemplateList()
        if (!this.$store.state.user.isAdmin && data.persion.admin === false && data.persion.editor === false && data.persion.viewer === false) {
          this.$datablauMessage.error('无此目录的权限')
        }
      } else {
        this.formDetail = {}
      }
    },
    getLayerThemes (id) {
      this.themeCheckedKey = []
      this.themeCheckList = []
      this.$http
        .get(`${this.$url}/layer/${id}/subjects`)
        .then(res => {
          this.themeData = res.data
          let allTheme = { 'name': '全部主题',
            'id': ''
          }
          this.themeDataSelect = _.cloneDeep(res.data)
          this.themeDataSelect.unshift(allTheme)
          res.data.forEach(element => {
            this.themeCheckedKey.push(element.id)
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getPath (node) {
      const path = []
      let current = node
      // 首先添加当前节点的 name 到路径中
      if (current.data && current.data.name) {
        path.push(current.data.name)
      }
      // 然后向上遍历父节点
      while (current.parent) {
        current = current.parent
        if (current.data && current.data.name) {
          path.push(current.data.name)
        }
      }
      // 返回反转后的路径，因为我们是从当前节点开始向上遍历的
      return path.reverse()
    },
    getLayerIdDetail (id) {
      this.$http
        .get(`${this.$url}/layer/${id}`)
        .then(res => {
          this.formDetail = _.cloneDeep(res.data)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    filterNode (value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    addLayer (data) {
      this.form = {
        forceCheckFlag: false
      }
      this.layerVisible = true
      this.dataOptionsLayer = data
      this.form.layerId = _.cloneDeep(data.id.toString())
      if (this.form.layerId !== '1') {
        this.layerIdDisabled = true
      } else {
        this.layerIdDisabled = false
      }
      this.getTemplateList()
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
    },
    layerThemeEdit (data) {
      this.form = {}
      this.layerVisible = true

      this.getTemplateList()
      this.getLayerIdDetailForm(data.id, data)
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
    },
    closeLayerVisible () {
      this.layerVisible = false
      this.layerIdDisabled = false
    },
    getLayerIdDetailForm (id, data) {
      this.$http
        .get(`${this.$url}/layer/${id}`)
        .then(res => {
          this.form = _.cloneDeep(res.data)
          if (id === 1) {
            this.$set(this.form, 'layerId', '0')
          } else {
            this.$set(this.form, 'layerId', _.cloneDeep(data.parentId.toString()))
            this.form.modelIdName = this.modelsList.filter(item => item.id === this.form.modelId)[0].name
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getPermissionsLayer () {
      this.$http
        .get(`${this.$url}/permissions/layer/`)
        .then(res => {
          this.mergePermissions(this.treeData, res.data)
          if (this.layerId === this.form.id) {
            this.$nextTick(() => {
              let node =
          this.$refs.tree.getNode(this.layerId)
              this.handleNodeClick(node.data, node)
            })
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    mergePermissions (layers, permissions) {
      layers.forEach(layer => {
        // 检查当前层的id是否在权限对象中
        if (permissions.hasOwnProperty(layer.id)) {
          // 将权限数据插入到当前层中
          this.$set(layer, 'persion', permissions[layer.id])
          // layer.persion = permissions[layer.id]
        }
        // 如果当前层有子层，则递归调用mergePermissions
        if (layer.children && layer.children.length > 0) {
          this.mergePermissions(layer.children, permissions)
        }
      })
    },
    dataOptionsFunction (data, node) {
      // this.$datablauMessage.error('无此目录的管理员权限3')
      const commonActions = [
      ]
      const newAdd = [{
        label: '新建',
        icon: 'iconfont icon-tianjia',
        callback: () => {
          this.addLayer(data)
        }
      }]
      const editAction = [{
        label: '编辑',
        icon: 'iconfont icon-bianji',
        callback: () => this.layerThemeEdit(data)
      }]
      const persionAction = [{
        label: '权限',
        icon: 'iconfont icon-lock',
        callback: () => this.lockLayer(data)
      }]
      const deleteAction = [{
        label: '删除',
        icon: 'iconfont icon-delete',
        callback: () => {
          this.$http
            .get(`${this.$url}/layer/${data.id}/tables`)
            .then(res => {
              if (res.data.length > 0) {
                this.$confirm('当前分层下存在关联的表，确认删除该分层吗？', '提示', { type: 'warning' })
                  .then(() => {
                    const id = data.id
                    this.$http.delete(`${this.$url}/layer/${id}`).then(res => {
                      this.$datablauMessage.success('删除成功')
                      this.getTreeData()
                      this.formDetail = {}
                    }).catch(e => {
                      this.$showFailure(e)
                    })
                  })
                  .catch(e => {
                  })
              } else {
                this.$confirm('确定要删除吗？', '提示', { type: 'warning' })
                  .then(() => {
                    const id = data.id
                    this.$http.delete(`${this.$url}/layer/${id}`).then(res => {
                      this.$datablauMessage.success('删除成功')
                      this.getTreeData()
                      this.formDetail = {}
                    }).catch(e => {
                      this.$showFailure(e)
                    })
                  })
                  .catch(e => {
                  })
              }
            })
            .catch(e => {
              this.$showFailure(e)
            })
        }
      }]

      if (data.id === 1) {
        const addlist = []
        const baseOperations = [
          {
            label: '新建',
            icon: 'iconfont icon-tianjia',
            callback: () => {
              this.addLayer(data)
            }
          },
          {
            label: '编辑',
            icon: 'iconfont icon-bianji',
            callback: () => {
              this.layerThemeEdit(data)
            }
          }
        ]
        const adminOperations = [
          {
            label: '权限',
            icon: 'iconfont icon-lock',
            callback: () => {
              this.lockLayer(data)
            }
          },
          {
            label: '主题管理',
            icon: 'iconfont icon-menu-flfj',
            callback: () => {
              this.themeManage(data)
            }
          }
        ]
        if (this.$store.state.user.isAdmin || this.$store.state.$auth['ROLE_DW_SUPERUSER_DDM'] || (data.persio && data.persion.admin === true)) {
          addlist.push(...baseOperations, ...adminOperations)
        } else if (data.persion && data.persion.editor === true) {
          addlist.push(...baseOperations)
        }
        return addlist
      } else if (node.level === 2) {
        const addlist = []
        if (this.$store.state.user.isAdmin || (data.persion && data.persion.admin === true)) {
          addlist.push(...newAdd, ...editAction, ...persionAction, ...deleteAction)
        } else if (this.$store.state.user.isAdmin) {
          addlist.push(...newAdd, ...editAction, ...deleteAction)
        } else if (this.$store.state.user.isAdmin || (data.persion && data.persion.editor === true)) {
          addlist.push(...editAction)
        }
        return addlist
      } else {
        const addlist = []
        if (this.$store.state.user.isAdmin || (data.persion && data.persion.admin === true)) {
          addlist.push(...editAction, ...persionAction, ...deleteAction)
        } else if (this.$store.state.user.isAdmin) {
          addlist.push(...editAction, ...deleteAction)
        } else if (this.$store.state.user.isAdmin || (data.persion && data.persion.editor === true)) {
          addlist.push(...editAction)
        }
        return addlist
      }
    },
    getTreeData () {
      this.layerContents = []
      this.$http
        .get(`${this.$url}/layer/tree`)
        .then(res => {
          this.treeData = [res.data]
          this.layerContents.push({
            id: res.data.id,
            name: res.data.name
          })
          res.data.children.forEach(element => {
            this.layerContents.push({
              id: element.id,
              name: element.name
            })
          })
          this.getPermissionsLayer()
          if (this.form.id) {
            if (this.layerId === this.form.id) {
              this.$nextTick(() => {
                this.$refs.tree.setCurrentKey(this.form.id)
                const node = this.$refs.tree.getNode(this.form.id)
                this.namePath = this.getPath(node)
              })
            } else {
              this.$nextTick(() => {
                this.$refs.tree.setCurrentKey(this.layerId)
              })
            }
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    dataIconFunction (data, node) {
      if (node.expanded) {
        return 'iconfont icon-openfile'
      } else {
        return 'iconfont icon-file'
      }
    },
    themeSave () {
      this.formDetail.subjectIds = this.themeCheckList.length === 0 ? this.themeCheckedKey : this.themeCheckList
      this.$http
        .put(`${this.$url}/layer`, this.formDetail)
        .then(res => {
          this.$datablauMessage.success('添加成功')
          this.addThemeVisible = false
          this.getLayerThemes(this.formDetail.id)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    closeThemeVisible () {
      this.themeCheckList = []
      this.addThemeVisible = false
    },
    scanDetailTheme (row) {
      const pos = location.href.indexOf('#/')
      const baseUrl = location.href.slice(0, pos + 2)
      window.open(baseUrl + `main/layerManage?themeId=${row.id}`)
    },
    deleteTheme (row) {
      this.$http
        .delete(`${this.$url}/layer/${this.formDetail.id}/${row.id}`)
        .then(res => {
          this.$datablauMessage.success('解绑成功')
          this.getLayerThemes(this.formDetail.id)
          this.getTableData({ id: this.layerId })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getThemeName (id) {
      return this.themeData
        .filter(theme => theme.id === id)
        .map(theme => theme.name)[0]
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
    getTableData (data) {
      this.$http
        .get(`${this.$url}/layer/${data.id}/tables`)
        .then(res => {
          this.filteredData = res.data
          this.sortedData = res.data
          this.getPermissionsTableData(data)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getPermissionsTableData (data) {
      this.$http
        .get(`${this.$url}/permissions/layer/tables/${data.id}`)
        .then(res => {
          this.mergeData(res.data, this.filteredData)
          this.filterCurrentPageData()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    mergeData (obj, arr) {
      for (let key in obj) {
        let found = arr.find(item => item.combinedId === key)
        if (found) {
          found.permissionLi = obj[key]
        }
      }
      return arr
    },
    filterCurrentPageData () {
      this.totalShow = this.filteredData.length
      this.tableData = this.filteredData.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
    },
    handleSizeChange (val) {
      this.pageSize = val
      this.currentPage = 1
      this.filterCurrentPageData()
    },
    handleCurrentChange () {
      this.filterCurrentPageData()
    },
    scanDetailTable (row) {
      const pos = location.href.indexOf('#/')
      const baseUrl = location.href.slice(0, pos + 2)
      window.open(baseUrl + `main/list?id=${row.modelId}&objectId=${row.tableId}&objectType=table`)
    },
    handleSortChange ({ column, prop, order }) {
      if (order) {
        sort.sortConsiderChineseNumber(this.sortedData, prop, order)
      } else {
      }
      this.currentPage = 1
      this.filterData()
    },
    filterData () {
      if (!this.keywordTable) {
        if (this.subjectId) {
          let filteredData = []
          this.sortedData.forEach(item => {
            if (item.subjectId === this.subjectId) {
              filteredData.push(item)
            }
          })
          this.filteredData = filteredData
        } else {
          this.filteredData = this.sortedData
        }
      } else {
        const keyword = this.keywordTable.toLowerCase()
        let filteredData = []
        this.sortedData.forEach(item => {
          if ((item.name && item.name.toLowerCase().includes(keyword)) || (item.alis && item.alis.toLowerCase().includes(keyword)) || (item.Definition && item.Definition.toLowerCase().includes(keyword))) {
            filteredData.push(item)
          }
        })
        let filteredData2 = []
        if (this.subjectId) {
          filteredData.forEach(item => {
            if (item.subjectId === this.subjectId) {
              filteredData2.push(item)
            }
          })
        }
        if (this.subjectId) {
          this.filteredData = filteredData2
        } else {
          this.filteredData = filteredData
        }
      }
      this.filterCurrentPageData()
    },
    syncTable () {
      this.syncTableDialogVisible = true
      this.loadSyncTableList() // 加载可同步的表列表
    },
    loadSyncTableList () {
      // 从当前模型ID获取未绑定的表
      if (this.formDetail.modelId) {
        this.$http
          .get(`${this.$url}/layer/unbind/${this.formDetail.modelId}/table`)
          .then(res => {
            this.syncTableList = res.data
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        this.$message.warning('请先选择数据模型')
        this.syncTableDialogVisible = false
      }
    },
    handleSyncTableSelectionChange (selection) {
      this.selectedSyncTables = selection
    },
    confirmSyncTable () {
      if (this.selectedSyncTables.length === 0) {
        this.$message.warning('请选择要同步的表')
        return
      }
      // 构建要同步的表数据
      const tableIds = this.selectedSyncTables.map(table => table.combinedId)
      let obj = {
        layerId: this.layerId,
        modelId: this.currentModelId,
        combinedIds: tableIds
      }
      this.$http
        .put(`${this.$url}/layer/bind/tables`, obj)
        .then(() => {
          this.$message.success('同步成功')
          this.syncTableDialogVisible = false
          // 刷新表格数据
          this.getTableData({ id: this.layerId })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    }
  },
  computed: {
    filteredSyncTableList () {
      if (!this.syncTableKeyword) {
        return this.syncTableList
      }
      const keyword = this.syncTableKeyword.toLowerCase()
      return this.syncTableList.filter(item => {
        return (
          (item.name && item.name.toLowerCase().includes(keyword)) ||
          (item.alis && item.alis.toLowerCase().includes(keyword)) ||
          (item.definition && item.definition.toLowerCase().includes(keyword))
        )
      })
    }
  },
  watch: {
    keywordTheme (val) {
      this.$refs.treeTheme.filter(val)
    },
    keyword (val) {
      this.$refs.tree.filter(val)
    },
    keywordTable () {
      this.currentPage = 1
      this.filterData()
    },
    $route: {
      handler: function (val) {
        if (val.query.themeId) {
          this.themeManage()
        }
      },
      immediate: true,
      deep: true
    }
  }
}
