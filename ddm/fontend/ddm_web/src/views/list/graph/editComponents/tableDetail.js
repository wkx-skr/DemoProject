import dataStandardCodeDetail from '@/views/list/tables/dataStandardCodeDetail.vue'
import indexEditor from './indexEditor.vue'
import datablauChecked from '@/views/list/tables/datablauChecked.vue'
import udpValidaterInput from '@/views/list/tables/udpValidaterInput.vue'
import datablauTooltip from '@/components/common/tooltip.vue'
import DomainCodeSelector from '@/components/selector/DomainCodeSelector'
import DomainSelector from '@/components/selector/NewDomainSelector'
import CheckInVersion from '@/views/list/tables/CheckInVersion.vue'
import exportJpa from '@/views/list/tables/jpaClass/exportJpa.vue'
import exportDdl from '@/views/list/tables/ddl/exportDDL.vue'
import udpSetting from '@/views/list/graph/editComponents/udpSetting.vue'
import partionEditor from '@/views/list/graph/editComponents/partionEditor'
import clusterEditor from '@/views/list/graph/editComponents/clusterEditor'
import dwMapping from '@/views/list/graph/editComponents/dwMapping'
import domainPopover from '@/views/list/graph/editComponents/domainPopover'
import $ from 'jquery'
import $version from '@/resource/version.json'
import string from '@/resource/utils/string'
import $const from '@/resource/const'
import HTTP from '@/resource/http'
import _ from 'lodash'
import tableImg from '@/assets/images/mxgraphEdit/Table.svg'
import viewImg from '@/assets/images/mxgraphEdit/View.svg'
import editIcon from '@/assets/images/er/icons/icon-edit.png'
import opacityComponent from './opacityComponent.vue'
import Sortable from 'sortablejs'
import translateImg from '@/assets/images/mxgraphEdit/translate.svg'
import translateActiveImg from '@/assets/images/mxgraphEdit/translate-active.svg'
import shrinkImg from '@/assets/images/mxgraphEdit/shrink.svg'
import shrinkActiveImg from '@/assets/images/mxgraphEdit/shrink-active.svg'
import expandImg from '@/assets/images/mxgraphEdit/expand.svg'
import expandActiveImg from '@/assets/images/mxgraphEdit/expand-active.svg'
import inElectron from '@/resource/utils/environment'
import { v4 as uuidv4 } from 'uuid'
import LDMTypes from '@constant/LDMTypes'
import 'pl-table/themes/index.css'
import { PlTable, PlTableColumn } from 'pl-table'
import IsShowTooltip from '@/components/common/isShowTooltip.vue'
export default {
  name: 'tableDetails',
  props: ['rawData', 'currentModel', 'dataByType', 'isLogicalModel', 'getTableHTMLFunction', 'graph', 'Changes', 'startIdToEndIds', 'createDeepRelation', 'calculateStartIdToEndIds', 'cellDialogData', 'currentStyleRelatedShapeTemplate', 'formatThemeTemplateData', 'currentId', 'isCassandraOrMongoDB', 'isLogical', 'tableDialogKey', 'isConceptual', 'getTableNameNamingMap', 'getColumnNameNamingMap', 'getIndexNameNamingMap', 'categoryOrder', 'isShowSchema', 'isDesignModel', 'LayerEdit', 'TypeUniqueIdToColumnDefaultType', 'deliverNum', 'editorType', 'typeDataWareHouse', 'authPro', 'reNameColumnType', 'loading'],
  components: { dataStandardCodeDetail, indexEditor, datablauChecked, datablauTooltip, DomainCodeSelector, DomainSelector, udpValidaterInput, CheckInVersion, exportJpa, exportDdl, opacityComponent, udpSetting, partionEditor, dwMapping, domainPopover, datablauTable: PlTable, elTableColumn: PlTableColumn, clusterEditor, IsShowTooltip },
  data () {
    let requestBody = {
      // elementId: null,
      name: null,
      cnName: null,
      description: null,
      newCols: [],
      modCols: [],
      newKeyGroups: [],
      delKeyGroups: [],
      allUdps: {},
      currentQueryDomainExists: false,
      SchemaRef: '',
      currentQueryDomain: []
    }
    const obj = this.prepareTableUdps(requestBody)
    const obj1 = this.prepareColumnUdps(requestBody)
    if (this.isDesignModel) {
      requestBody.logicalOnly = null
    } else {
      requestBody.physicalOnly = null
    }
    let cnNameValidate = (rule, value, callback) => {
      value = _.trim(this.requestBody.cnName)
      if (!value) {
        callback(new Error('中文名是必填的'))
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          this.$showFailure('中文名是必填的')
        }, 200)
      } else {
        callback()
      }
    }
    let descriptionValidate = (rule, value, callback) => {
      value = _.trim(this.requestBody.description)
      if (!value) {
        callback(new Error('定义是必填的'))
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          this.$showFailure('定义是必填的')
        }, 200)
      } else {
        callback()
      }
    }
    let contentValidate = (rule, value, callback) => {
      value = _.trim(this.requestBody.name)
      let errStr = (this.isLogical || this.isConceptual) ? this.rawData.tableMsg.TypeId === 80100073 ? '业务对象名是必填的' : '实体名是必填的' : '表名是必填的'
      if (!value) {
        callback(new Error(errStr))
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          this.$showFailure(errStr)
        }, 200)
      } else {
        callback()
      }
    }
    let contentValidate2 = (rule, value, callback) => {
      value = _.trim(this.requestBody.nameAbbreviation)
      console.log(value, 'value')
      let errStr = (this.isLogical || this.isConceptual) ? this.rawData.tableMsg.TypeId === 80100073 ? '业务对象名是必填的' : '实体名是必填的' : '表名是必填的'
      if (!value) {
        callback(new Error(errStr))
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          this.$showFailure(errStr)
        }, 200)
      } else {
        callback()
      }
    }
    let columnNameValidate = (rule, value, callback) => {
      if (!(value?.trim())) {
        callback(new Error(this.attributeName + '名是必填的'))
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          this.$showFailure(this.attributeName + '名是必填的')
        }, 200)
      } else {
        if (this.checkColIsDuplicate2(value)) {
          callback(new Error(this.attributeName + `名 ${value}重名`))
          clearTimeout(this.timer)
          this.timer = setTimeout(() => {
            this.$showFailure(`${this.attributeName}名 ${value} 重名`)
          }, 200)
        } else {
          callback()
        }
      }
    }
    let logicalColumnNameValidate = (rule, value, callback) => {
      if (!(value?.trim())) {
        callback()
      } else {
        if (this.checkLogicalColIsDuplicate2(value)) {
          callback(new Error(`中文名 ${value}重名`))
          clearTimeout(this.timer)
          this.timer = setTimeout(() => {
            this.$showFailure(`中文名 ${value} 重名`)
          }, 200)
        } else {
          callback()
        }
      }
    }
    let dataTypeValidate = (rule, value, callback) => {
      if (!(value?.trim())) {
        callback(new Error('数据类型是必填的'))
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          this.$showFailure(`数据类型是必填的`)
        }, 200)
      } else {
        callback()
      }
    }
    return {
      rawDataBak: [],
      disabledPk: new Set(),
      lodash: _,
      LDMTypes,
      businessImg: require('@/assets/images/mxgraphEdit/Business.svg'),
      inElectron,
      caculating: false,
      tableUsedImg: require('../../../../assets/images/mxgraphEdit/table-used.svg'),
      attributeName: (this.isLogical || this.isConceptual) ? '属性' : '字段',
      businessEntityList: [],
      editMode: this.rawData.editMode,
      limitedDsApply: false,
      limitedDsApplyConfig: {
        rColDt: false,
        rColChName: false,
        rColName: false
      },
      currentVersion: this.currentModel.currentVersion,
      yOfBottom: '220px',
      pk: [],
      fk: [],
      pkSelection: [],
      allCols: [],
      allColsInitial: null,
      tableKey: 0,
      indexEditorVisible: false,
      dataTypeFocusPrevent: false,
      dataTypeSearchMode: false,
      dataTypeCurrentIndex: -1,
      requestBody: requestBody,
      udpMessage: obj.udpMessage,
      columnsUdpKeys: obj1.udpMessage,
      activeTab: this.$route.query.tab === 'index' ? 'index' : 'column',
      activeTool: this.$store.state.featureMap.ddm_JPAClass ? 'jpa' : 'ddl',
      buttonLoading: false,
      currentRow: null,
      writable: this.$store.state.lic.editor && (this.$store.state.user.isAdmin || this.currentModel.permission?.editor),
      admin: this.currentModel.permission.admin,
      rules: {
        cnName: {
          required: true,
          validator: cnNameValidate,
          trigger: ['change', 'blur']
        },
        description: {
          required: true,
          validator: descriptionValidate,
          trigger: ['change', 'blur']
        },
        tableName: {
          validator: contentValidate,
          trigger: ['change', 'blur']
        },
        tableName2: {
          validator: contentValidate2,
          trigger: ['change', 'blur']
        },
        columnName: {
          validator: columnNameValidate,
          trigger: ['change', 'blur']
        },
        logicalColumnName: {
          validator: logicalColumnNameValidate,
          trigger: ['change', 'blur']
        },
        dataType: {
          required: true,
          validator: dataTypeValidate,
          trigger: ['change', 'blur']
        }
      },
      indexNameNotEmpty: true,
      checkInVersionDialogVisible: false,
      tableImg,
      viewImg,
      domainIdToName: {},
      allUpdsInital: {},
      columnNum: -2000000,
      memberNum: -9000000,
      shrink: this.editorType === 'model',
      schema: [],
      domainLoading: false,
      domainOptions: [],
      editIcon,
      newChanges: null,
      currentColId: '',
      drag: false,
      dragStart: {
        row: -1,
        column: -1
      },
      columnNameToFocusAreaPosition: {
        cnName: 0,
        name: 1,
        dataType: 2
      },
      focusAreaPositionToColumnName: {
        0: 'cnName',
        1: 'name',
        2: 'dataType'
      },
      tempRow: -1,
      tempColumn: -1,
      tempFocusRow: -1,
      tempFocusColumn: -1,
      isFocusArea: false,
      isFocusOnly: false,
      translateImg,
      translateActiveImg,
      translateActive: false,
      translateActive1: false,
      translateActive2: false,
      expandActive: false,
      shrinkImg,
      shrinkActiveImg,
      expandImg,
      expandActiveImg,
      entityQuery: '',
      business: {
        currentPage: 1,
        pageSize: 20,
        total: 0
      },
      entityData: [],
      tableHeight: 200,
      formEdit: {
        entitytemplate: ''
      },
      entitytemplateList: [],
      treeThemeData: [],
      layertreeData: [],
      addThemeVisible: false,
      keywordTheme: '',
      defaultThemeProps: {
        children: 'children',
        label: 'name',
        value: 'id'
      },
      themeCheckList: {},
      themeCheckedKey: [],
      openThemeVisibleType: '',
      moreShow: false,
      strongChecks: false,
      strongChecksPrefix: '',
      strongChecksSuffix: '',
      strongChecksName: '',
      tableVersionList: [],
      indexSArr: []
    }
  },
  beforeCreate () {
    this.$version = $version
    this.string = string
  },
  beforeMount () {
  },
  mounted () {
    this.rawDataBak = _.cloneDeep(this.rawData)
    this.limitedDsApply = this.currentModel.limitedDsApply
    if (this.limitedDsApply) {
      this.limitedDsApplyConfig = this.currentModel.limitedDsApplyConfig
    }
    this.editMode = this.rawData.appendMode || this.rawData.editMode
    if (this.rawData.columnsMsg) {
      this.onReady()
    }
    this.calculateTableHeight()
    this.$nextTick(() => {
      if (this.rawData.editMode && this.currentModel.forceCheckFlag) {
        this.$set(this.requestBody, 'nameAbbreviation', this.rawData.tableMsg.AbbrName)
        this.entitytemplateChange(this.currentModel.entityTemplateId)
      }
    })
    $(window).resize(this.handleResize)
    this.$bus.$on('updateDomains', () => {
      // this.tableKey++
      this.highlightRow()
    })
    this.$bus.$on('changeToPrimaryColumn', this.addNotNullToColumn)
    this.$bus.$on('addNewColumn', this.addColumn)
    this.$bus.$on('deleteTableColumn', this.deleteRow)
  },
  beforeDestroy () {
    if (this.editorType === 'table' && this.editMode) {
      this.unLockModel()
    }
    $(window).unbind('resize', this.handleResize)
    this.$bus.$off('updateDomains')
    this.$bus.$off('changeToPrimaryColumn')
    this.$bus.$off('addNewColumn')
    this.$bus.$off('deleteTableColumn')
  },
  beforeRouteLeave (to, from, next) {
  },
  methods: {
    entitytemplateChange (value) {
      if (!this.rawData.appendMode || this.rawData.appendMode === false) {
        this.buttonLoading = true
        this.$http
          .get(`${this.$url}/entitytemplate/property?modelId=${this.currentModel.id}&tableId=${this.rawData.tableMsg.Id}&entityTemplateId=${value}&separator=${encodeURIComponent('_')}`)
          .then(res => {
            this.getPropertyList(res.data)
            this.buttonLoading = false
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    getPropertyList (data) {
      this.$http
        .get(`${this.$url}/entitytemplate/property/list`)
        .then(res => {
          this.getTranslationName(data, res.data)
          this.entitytempList = res.data
          this.entitytempSlicing = data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getTranslationName (data, list) {
      list.forEach(element => {
        if (element.value === '%80020075%') {
          element.valueName = ''
        } else if (element.value === '%80020076%') {
          element.valueName = ''
        } else if (element.value === '%800200761%') {
          element.valueName = ''
        } else if (element.value === '%80100005%') {
          element.valueName = this.rawData.tableMsg.LogicalName
        } else if (element.value === '%90000004%') {
          element.valueName = this.rawData.tableMsg.Definition
        }

        if (element.value.includes('{')) {
          for (let key in this.requestBody.allUdps) {
            if (this.requestBody.allUdps.hasOwnProperty(key)) {
              if (element.value.includes(key)) {
                for (const [key1, value1] of this.dataByType.udp.entries()) {
                  if (key1 === Number(key)) {
                    if (value1.UdpValueType === 'STRING' && value1.ExtendedEnumStruct) {
                      let result = this.requestBody.allUdps[key]?.split(', ').map(num => {
                        let foundItem = JSON.parse(value1.ExtendedEnumStruct).find(item => item.i === num)
                        if (foundItem) {
                          return foundItem.n
                        }
                        return ''
                      }).join(',')
                      element.valueName = result
                    } else {
                      element.valueName = this.requestBody.allUdps[key]
                    }
                  }
                }
              }
            }
          }
        }
      })
      let prefix = data.prefix
      let suffix = data.suffix
      list.forEach(item => {
        if (prefix.includes(item.value) && item.valueName && item.valueName.trim() !== '') {
          prefix = prefix.replace(item.value, item.valueName)
        } else if (prefix.includes(item.value) && (!item.valueName || item.valueName.trim() === '')) {
          let reg = new RegExp(item.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[_%]', 'g')
          prefix = prefix.replace(reg, '')
        }
        if (suffix.includes(item.value) && item.valueName && item.valueName.trim() !== '') {
          suffix = suffix.replace(item.value, item.valueName)
        } else if (suffix.includes(item.value) && (!item.valueName || item.valueName.trim() === '')) {
          let reg = new RegExp('_' + item.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
          suffix = suffix.replace(reg, '')
        }
      })
      this.strongChecksPrefix = prefix
      this.strongChecksSuffix = suffix
    },
    activeTabChange () {
      if (this.activeTab === 'versionpage') {
        this.getVersionList()
      }
    },
    getVersionList () {
      if (this.rawData.tableMsg.Id) {
        this.$http
          .get(`${this.$url}/models/${this.currentModel.id}/editlog/table/${this.rawData.tableMsg.Id}`)
          .then(res => {
            this.tableVersionList = res.data
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    logFormatter (row) {
      let str = ''
      switch (row.opType) {
        case 'CREATE':
          str += this.$store.state.$v.modelDetail.create
          break
        case 'UPDATE':
          str += this.$store.state.$v.modelDetail.mod
          break
        case 'DELETE':
          str += this.$store.state.$v.modelDetail.delete
          break
        default:
          console.error(
            this.$store.state.$v.modelDetail.noOperation + row.opType
          )
          break
      }
      str += this.typeFormatter(row)
      str += row.name
      return str
    },
    typeFormatter (a) {
      let typeId
      if (typeof a === 'object') {
        typeId = a.typeId
      } else if (typeof a === 'number') {
        typeId = a
      } else if (typeof a === 'string') {
        typeId = Number.parse(a)
      }
      switch (typeId) {
        case 80000004:
          return this.$store.state.$v.udp.table
        case 80000005:
          return this.$store.state.$v.udp.column
        case 80000006:
          return this.$store.state.$v.udp.category
        case 80000093:
          return this.$store.state.$v.modelDetail.keyKeygroup
        case 80500001:
          return this.$store.state.$v.modelDetail.keyIndex
        case 80500008:
          return this.$store.state.$v.udp.view
        case 80010001:
          return this.$store.state.$v.udp.Model
        case 80100073:
          return this.$store.state.$v.dataEntity.business
        default:
          return typeId
      }
    },
    calculateTableHeight () {
      this.$nextTick(() => {
        this.tableHeight = this.editMode ? $('.table-box1').height() - 2 : $('.table-box2').height() - 2
      })
    },
    addNotNullToColumn (columnIds) {
      columnIds.forEach(columnId => {
        let item = this.allCols.find(item => item.elementId === columnId)
        if (item) {
          item.notNull = true
        }
      })
      this.pkSelection = []
      this.allCols.forEach(col => {
        if (columnIds.includes(col.elementId)) {
          this.pkSelection.push(true)
        } else {
          this.pkSelection.push(false)
        }
      })
    },
    startHeartBeat () {
      this.heartBeat()
      this.heartBeatInterval = setInterval(() => {
        this.heartBeat()
      }, 1000 * 60)
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
      if (this.rawData.editMode && this.currentModel.forceCheckFlag) {
        res.name = `${this.strongChecksPrefix}${this.requestBody.nameAbbreviation}${this.strongChecksSuffix}`
        res.properties[80010060] = this.requestBody.nameAbbreviation
      } else {
        res.name = obj.properties[LDMTypes.Name]
        res.properties[80010060] = this.requestBody.name
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
    saveModel (request) {
      if (this.loading) {
        this.loading.status = true
      } else {
        this.buttonLoading = true
      }
      let saveFlatFormat = {
        modelId: +this.currentModel.id,
        lastVersion: this.currentModel.currentVersion,
        added: [],
        removed: [],
        updated: [],
        udps: [],
        useProtobuf: this.currentModel.useProto
      }
      const tableFormatToIndex = (tableList) => {
        return tableList?.map(table => {
          if (this.rawData.editMode && this.currentModel.forceCheckFlag) {
            table.properties.Name = `${this.strongChecksPrefix}${this.requestBody.nameAbbreviation}${this.strongChecksSuffix}`
          }
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
                  res.properties[80000096] = res.properties[80000096].join(',')
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
        if (relation.objectClass === 'Datablau.LDM.RelationshipRelational') {
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
        if (relation.objectClass === 'Datablau.LDM.RelationshipRelational') {
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

      // saveFlatFormat.removed = saveFlatFormat.removed.concat(this.dataByType.diagram[this.currentId].children.filter(i => !i.properties.new && i.properties.deleted).map(i => i.properties.Id))

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
      this.$http.put(`${this.$url}/service/editor/models/${this.currentModel.id}/save?ver=${this.currentVersion}`, saveFlatFormat).then(res => {
        if (res.data) {
          this.$router.replace({
            query: {
              id: this.$route.query.id,
              modelType: this.$route.query.modelType,
              currentVersion: res.data.currentVersion
            }
          })
          this.currentModel.currentVersion = res.data.currentVersion
          this.currentVersion = res.data.currentVersion
          this.$http.post(this.$url + '/service/models/' + this.currentModel.id + '/versions', { // 嵌入版本
            modelId: this.currentModel.id,
            version: request.version,
            description: request.description
          }).then(() => {
            let data = res.data
            // 解决添加表后，出现空白tab页的问题
            if (this.rawData.appendMode) {
              this.$bus.$emit('removeBlankTab', this.rawData.tableMsg.Id, this.currentModel.id)
            }
            this.currentVersion = data.currentVersion
            this.$bus.$emit('update-model', res.data.objects) // 更新模型
            setTimeout(() => { // 避免update-model后返回，覆盖handleDialogData数据，导致children不存在
              if (!this.rawData.appendMode) {
                this.$emit('handleDialogData', this.rawData.tableMsg.Id, false, false) // handleDialogData函数里设置了editMode = false
              } else {
                this.editMode = false
                this.rawData.editMode = false
              }
              this.$message.success(this.rawData.appendMode ? this.$store.state.$v.dataEntity.success1 : this.$store.state.$v.dataEntity.success2)
            }, 400)
            this.unLockModel()
            this.$emit('updateVersion', data.currentVersion)
          }).catch((err) => {
            this.$showFailure(err)
          })
        }
      }).catch(e => {
        this.dataByType.table[this.rawData.tableMsg.Id] = this.tableDataBak // 保存失败，数据本身已发生改变，需要回到保存前状态
        this.$showFailure(e)
      }).finally(() => {
        setTimeout(() => {
          if (this.loading) {
            this.loading.status = false
          } else {
            this.buttonLoading = false
          }
        }, 400)
      })
    },
    transformData (data) {
      if (data instanceof Array) {
        return data.map(item => this.transformData(item))
      } else if (data instanceof Object) {
        let obj = {}
        for (let key of Object.keys(data)) {
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
    heartBeat () {
      this.$http.put(`${this.$url}/service/editor/${this.currentModel.id}/heart`).then(res => {
        if (!res.data) {
          this.$message.error('心跳失败')
        }
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    unLockModel () {
      if (this.$store.state.lic.editor) {
        clearInterval(this.heartBeatInterval)
        this.heartBeatInterval = null
        let url = `${this.$url}/service/editor/${this.currentModel.id}/unlock`
        let tenantId = localStorage.getItem('tenantId')
        if (tenantId) {
          url += `?tenantId=${tenantId}`
        }
        this.$http.post(url).then(res => {
          if (res.data) {
            this.$store.commit('setEditStatus', false)
          } else {
            this.$message.error('模型解锁失败，请重试')
          }
        }).catch(err => {
          this.$showFailure(err)
        })
      }
    },
    checkLineage (row) {
      HTTP.skip2('modelLineage', { entityid: row.Id, entityname: row.Name, modelid: this.currentModel.id })
    },
    goToEdit () {
      if (this.$store.state.lic.editor) {
        this.$http.put(`${this.$url}/service/editor/${this.currentModel.id}/lock`).then(res => {
          if (res.data) {
            this.activeTab = this.$route.query.tab === 'index' ? 'index' : 'column'
            this.$store.commit('setEditStatus', true)
            this.editMode = true
            this.rawData.editMode = true
            this.heartBeat()
            this.heartBeatInterval = setInterval(() => {
              this.heartBeat()
            }, 1000 * 60)
          } else {
            this.$message.error('模型尝试加锁失败，请重试')
          }
        }).catch(err => {
          this.$showFailure(err)
        })
      } else {
        this.editMode = true
        this.rawData.editMode = true
      }
    },
    callSet () {
      if (this.activeTool === 'jpa') {
        this.$refs.jpa.callSetting()
      } else {
        this.$refs.ddl.callSetting()
      }
    },
    go2Domain (id) {
      // window.open(`${HTTP.getDamLoginUrl()}#/ddm/main/dataStandard?ddmFirst=true&domainId=${id}`)
      const pos = location.href.indexOf('#/')
      const baseUrl = location.href.slice(0, pos + 2)
      window.open(`${baseUrl}main/dataStandard?domain=${id}`)
    },
    formatTableName () {
      this.requestBody.name = this.getTableNameNamingMap(this.requestBody.name)
      this.$bus.$emit('handleChangeAllKeyGroupName')
    },
    formatColumnName (row) {
      row.name = this.getColumnNameNamingMap(row.name)
    },
    handleBusinessSelectionChange (selectEntitys) {
      this.requestBody.CommonMemberRefs = this.businessEntityList.join(',')
    },
    handleBusinessSizeChange (size) {
      this.business.size = size
    },
    handleBusinessCurrentChange (current) {
      this.business.currentPage = current
    },
    changeAbsoluteTop () {
      $('.content-box.is-edit').css('top', $('.table.position-hint')[0].offsetTop + 'px')
    },
    rowDrop () {
      const tbody = $('.datablau-table.unshrink .el-table__fixed tbody')[0]
      const _this = this
      Sortable.create(tbody, {
        onEnd ({ newIndex, oldIndex }) {
          const currRow = _this.allCols.splice(oldIndex, 1)[0]
          _this.allCols.splice(newIndex, 0, currRow)
          _this.rawData.tableMsg.ColumnOrderArrayRefs = []
          _this.getPkColumnIds()
        }
      })
      const tbodyShrink = $('.datablau-table.shrink .el-table__fixed tbody')[0]
      Sortable.create(tbodyShrink, {
        onEnd ({ newIndex, oldIndex }) {
          const currRow = _this.allCols.splice(oldIndex, 1)[0]
          _this.allCols.splice(newIndex, 0, currRow)
          _this.rawData.tableMsg.ColumnOrderArrayRefs = []
          _this.getPkColumnIds()
        }
      })
    },
    isTableChanged () {
      let entityId = this.rawData.tableMsg.Id
      let tableData = this.dataByType.table[entityId]
      if (tableData.properties.changed) {
        return tableData.properties.changed
      }
      if (tableData.properties.Name !== this.requestBody.name) {
        return true
      }
      if (tableData.properties.Definition !== this.requestBody.description) {
        return true
      }
      const initialMap = new Map()
      let changed = false
      this.allColsInitial.forEach(item => {
        initialMap.set(item.elementId, item)
      })
      this.allCols.some(item => {
        if (initialMap.has(item.elementId)) {
          if (JSON.stringify(initialMap.get(item.elementId)) !== JSON.stringify(item)) {
            changed = true
            return true
          }
        } else if (!item.deleted) {
          changed = true
          return true
        } else if (item.deleted) {
          changed = true
          return true
        }
      })
      return changed
    },
    checkColName ({ name }, idx) {
      if (this.checkColIsDuplicate(name, idx)) {
        this.$confirm(this.attributeName + '不能重名', '提示', {
          type: 'warning',
          closeOnClickModal: false
        })
          .then(() => {
            this.$nextTick(() => {
              this.$refs[`colName${idx}`].focus()
            })
          })
          .catch(() => {
            this.$nextTick(() => {
              this.$refs[`colName${idx}`].focus()
            })
          })
      } else if (name === '') {
        this.$confirm(this.attributeName + '名不能为空', '提示', {
          type: 'warning',
          closeOnClickModal: false
        })
          .then(() => {
            // this.$refs[`colName${idx}`].focus()
          })
          .catch(() => {
            this.$nextTick(() => {
              this.$refs[`colName${idx}`].focus()
            })
          })
      }
    },
    checkColIsDuplicate (name, idx) {
      return this.dataByType.table[this.rawData.tableMsg.Id].children.some(v => v.properties.Name === name && v.properties.Id !== this.allCols[idx].elementId)
    },
    checkColIsDuplicate2 (name) {
      let idx = 0
      this.allCols.forEach(v => {
        if (v.deleted) {
          return
        }
        if (v.name === name) {
          idx++
        }
      })
      if (idx > 1) {
        return true
      } else {
        return false
      }
    },
    checkLogicalColIsDuplicate2 (cnName) {
      let idx = 0
      this.allCols.forEach(v => {
        if (v.deleted) {
          return
        }
        if (v.cnName === cnName) {
          idx++
        }
      })
      if (idx > 1) {
        return true
      } else {
        return false
      }
    },
    up (index) {
      for (let i = index - 1; i >= 0; i--) {
        if (this.allCols[i].deleted) {
          continue
        } else {
          this.allCols.splice(i, 0, ...this.allCols.splice(index, 1))
          break
        }
      }
      this.getPkColumnIds()
    },
    down (index) {
      for (let i = index + 1; i < this.allCols.length; i++) {
        if (this.allCols[i].deleted) {
          continue
        } else {
          this.allCols.splice(i, 0, ...this.allCols.splice(index, 1))
          break
        }
      }
      this.getPkColumnIds()
    },
    searchDomain (query) {
      const obj = {
        domainCode: query,
        chineseName: query,
        domainState: 'A',
        folderId: 1,
        submitter: '',
        firstPublishStart: null,
        firstPublishEnd: null,
        ownerOrg: '',
        orderColumn: ['createTime'],
        ascOrder: [false],
        currentPage: 1,
        pageSize: 10
      }
      this.domainLoading = true
      this.$http.post(`${this.$url}/service/domains/latest/page`, obj).then(res => {
        this.domainLoading = false
        this.domainOptions = res.data.items
      }).catch(e => {
        this.$showFailure(e)
      }).finally(() => {
        this.domainLoading = false
      })
    },
    getSchemaList () {
      let schema = []
      for (let id in this.dataByType.schema) {
        if (this.dataByType.schema.hasOwnProperty(id)) { schema.push({ id: parseInt(id), name: this.dataByType.schema[id].properties.Name }) }
      }
      if (schema.every(v => v.id !== this.rawData.tableMsg.SchemaRef)) {
        this.rawData.tableMsg.SchemaRef = ''
      }
      this.schema = schema
    },
    toExpand () {
      this.shrink = false
      this.$emit('changeDialogWidth', `${$('#model-edit').width() - $('.left-panel-wrapper.tree-area').width() - 44}px`)
    },
    toShrink () {
      this.shrink = true
      // this.$emit('changeDialogWidth', '50vw')
      this.$emit('changeDialogWidth', '600px')
    },
    resetStyleConfirm () {
      this.currentStyleRelatedShapeTemplate['StyleBackColor'] = ''
      this.currentStyleRelatedShapeTemplate['StyleBackColor2'] = ''
      this.currentStyleRelatedShapeTemplate['StyleThemeRef'] = null
    },
    editRow (rowData) {
      if (this.fk.indexOf(rowData.elementId) > -1) {
        // 外键
        return
      }
      this.$emit('openColumnDialog', {
        tableId: this.rawData.tableMsg.Id,
        colId: rowData.elementId
      })
    },
    changeDomainId (domainCode, scope) {
      let row = this.allCols[scope.$index]
      row.domainId = domainCode
      let domain = this.domainOptions.find(d => d.domainCode === domainCode)
      if (domain) {
        domain.inheritType = _.cloneDeep(this.$refs.domainSelector.selectedType)
        this.currentRow = row
        this.fillColumnDetailFromDomain(this.currentRow, domain)
      }
    },
    clearDomain (scope) {
      let row = this.allCols[scope.$index]
      row.domainId = null
      row.domainName = null
      scope.row.domainId = null
      scope.row.domainName = null
    },
    tableRowClassName (scope) {
      let currentRow = this.allCols[scope.rowIndex]
      if (currentRow.deleted) {
        return 'hide-entity-row'
      } else {
        return ''
      }
    },
    tableCellClassName ({ row, column, rowIndex, columnIndex }) {
      row.rowIndex = rowIndex
      column.columnIndex = columnIndex
      let currentRow = this.allCols[rowIndex]
      if (currentRow.focusArea && currentRow.focusArea[this.columnNameToFocusAreaPosition[column.property]]) {
        return 'focus'
      } else {
        return ''
      }
    },
    limitedDsApplyMessage (showMessage) {
      if (showMessage) {
        this.$message.warning('此' + this.attributeName + '引用了数据标准，强管控模式下不允许修改此表单项，请先取消对数据标准的引用')
      }
    },
    onReady () {
      // this.rowDrop()
      this.changeToExistTab()
      this.prepareTableUdps(this.requestBody)
      let obj1 = this.prepareColumnUdps(this.requestBody)
      this.columnsUdpKeys = obj1.udpMessage
      this.calculateYOfBottom()
      this.prepareRequestBody()
      this.getPkColumnIds()
      this.getSchemaList()
      // this.activeTab = 'column'
      this.getEntityData()
      this.tableKey++
      this.$refs.partitionRef?.initPartition()
      this.$refs.clusterRef?.initCluster()
      this.$nextTick(() => { // dwMapping有allCols属性，在修改后不会第一时间在子组件拿到
        this.$refs.dwMappingRef?.initDwMapping()
      })
      setTimeout(() => {
        this.editIndex()
        this.caculateSubtypeRelatedForeinKey(this.rawData.fk)
      })
    },
    caculateSubtypeRelatedForeinKey (fkArr) {
      this.disabledPk = new Set()
      fkArr.forEach(keygroup => {
        let fkId = keygroup.properties.Id
        let subtypeRelation = Object.values(this.dataByType.relation).find(relation => !relation.properties.deleted && relation.properties.ChildKeyRef === fkId && relation.objectClass === 'Datablau.LDM.RelationshipSubtype')
        if (subtypeRelation) {
          keygroup.children?.forEach(member => {
            this.disabledPk.add(member.properties.AttributeRef)
          })
        }
      })
    },
    changeToExistTab () {
      if (!(this.currentModel.IsDataWarehouse && this.rawData.dwMapping && this.rawData.dwMapping.length) && this.activeTab === 'dwMapping') {
        this.activeTab = 'column'
      } else if (this.activeTab === 'business' && this.rawData.tableMsg.TypeId !== 80100073) {
        this.activeTab = 'column'
      }
    },
    cancel () {
      this.unLockModel()
      if (this.rawData.appendMode) {
        delete this.dataByType.table[this.rawData.tableMsg.Id]
        this.$bus.$emit('removeBlankTab', this.rawData.tableMsg.Id)
      } else {
        // this.rawData = this.rawDataBak
        // this.onReady()
        this.$emit('handleDialogData', this.rawData.tableMsg.Id, false, false) // 注释掉前两行，而用这一行的原因是需要重新获取下最新数据，不用之前老数据rawData，因为rawData在点击保存成功后会被更新，但rawDataBak不会被更新，需要调用handleDialogData来更新rawDataBak
      }
      this.editMode = false
      this.rawData.editMode = false
    },
    updateTableUdp () {

    },
    updateUdpValue (obj, index, value) {
      this.$set(obj, index, value)
    },
    prepareTableUdps (requestBody) {
      let model = _.clone(this.rawData.tableMsg)
      let tableUdps = new Set()
      this.dataByType.udp.forEach(item => {
        if (item.entityType === this.rawData.tableMsg.TypeId) { // 80000004
          tableUdps.add(item.Id)
        }
      })
      for (let k in model) {
        if (typeof Number.parseInt(k) === 'number' && !isNaN(Number.parseInt(k))) {
        } else {
          delete model[k]
        }
      }
      tableUdps.forEach(item => {
        if (!model[item]) {
          model[item] = ''
        }
      })
      for (let index in model) {
        // requestBody.allUdps[index] = model[index]
        this.$set(requestBody.allUdps, index, model[index])
      }
      this.allUpdsInital = _.cloneDeep(requestBody.allUdps)
      this.udpMessage = model
      this.$set(this, 'udpMessage', model)
      return {
        udpMessage: model
      }
    },
    prepareColumnUdps (requestBody) {
      let columnsUdps = new Set()
      this.dataByType.udp.forEach(item => {
        if (item.entityType === 80000005) {
          columnsUdps.add(item.Id)
        }
      })
      return {
        udpMessage: columnsUdps
      }
    },
    removeExtraUdps () {
    },
    calculateYOfBottom () {
      let height = $('.top-area').css('height')
      this.yOfBottom = Number.parseInt(height) + 84 + 'px'
    },
    callCodeDetail (code) {
      this.$bus.$emit('callCodeDetail', code)
    },
    handleResize () {
      this.calculateTableHeight()
      if (this.$refs.tableDetailList && this.$refs.tableDetailList.doLayout) {
        this.$nextTick(this.$refs.tableDetailList.doLayout)
      }
      if (this.$refs.tableDetailListShrink && this.$refs.tableDetailListShrink.doLayout) {
        this.$nextTick(this.$refs.tableDetailListShrink.doLayout)
      }
      this.calculateYOfBottom()
      if (!this.shrink) {
        this.$emit('changeDialogWidth', `${$('#model-edit').width() - $('.left-panel-wrapper.tree-area').width() - 44}px`)
      }
    },
    getPkColumnIds () {
      this.pk = []
      this.fk = []
      this.pkSelection = []
      Array.isArray(this.rawData.pk) && this.rawData.pk.forEach(p => {
        Array.isArray(p.children) && p.children.forEach(k => {
          this.pk.push(k.properties['AttributeRef'])
        })
      })
      this.allCols.forEach(col => {
        if (this.pk.indexOf(col.elementId) !== -1) {
          this.pkSelection.push(true)
        } else {
          this.pkSelection.push(false)
        }
      })

      Array.isArray(this.rawData.fk) && this.rawData.fk.forEach(p => {
        Array.isArray(p.children) && p.children.forEach(k => {
          this.fk.push(k.properties['AttributeRef'])
        })
      })
    },
    updateIndexMemberList (columnId, memberList) {
      for (let name of ['pk', 'fk', 'uk', 'nk', 'vk']) {
        let column = this.rawData[name].find(column => column.properties.Id === columnId)
        if (column) {
          column.children = memberList
          column.properties.KeyGroupMemberRefs = memberList.map(column => column.properties.Id)
          break
        }
      }
      this.getPkColumnIds()
    },
    deleteColumn (indexId) {
      let index = this.rawData.pk.findIndex(index => index.properties.Id === indexId)
      this.rawData.pk.splice(index, 1)
      this.getPkColumnIds()
    },
    isNotNullFormatter (row, col) {
      let val = row.properties[col.property.split('.')[1]]
      if (val === true || this.pk.indexOf(row.properties.Id) > -1) {
        return '非空'
      } else {
        return ''
      }
    },
    handleCellMouseEnter (row, column, cell, event) {
      this.tempRow = row.rowIndex
      this.tempColumn = column.columnIndex
      if (this.drag) {
        if (this.dragStart.row !== -1) {
          let tempRow = row.rowIndex
          let tempColumn = column.columnIndex
          this.drawArea(this.dragStart.row, this.dragStart.column, tempRow, tempColumn)
        }
      }
    },
    handleCellMouseLeave (row, column, cell, event) {
      if (this.drag) {

      }
    },
    drawArea (startRow, startColumn, endRow, endColumn) {
      if (startRow > endRow) {
        this.drawArea(endRow, startColumn, startRow, endColumn)
        return
      }
      if (startColumn > endColumn) {
        this.drawArea(startRow, endColumn, endRow, startColumn)
        return
      }
      this.startRow = startRow
      this.endRow = endRow
      this.startColumn = startColumn
      this.endColumn = endColumn
      this.allCols.forEach((item, index) => {
        item.focusArea = [false, false, false]
        if (index >= startRow && index <= endRow) {
          item.focusArea.forEach((obj, i) => {
            if (i >= startColumn && i <= endColumn) {
              item.focusArea[i] = true
            }
          })
        }
      })
      this.isFocusArea = true
    },
    handleTableMouseDown (evt) {
      this.drag = true
      this.dragStart.row = this.tempRow
      this.dragStart.column = this.tempColumn
      this.tempFocusRow = this.tempRow
      this.tempFocusColumn = this.tempColumn
      // if (!$(evt.target).parents('td').hasClass('focus')) {
      this.allCols.forEach(item => {
        item.focusArea = [false, false, false]
      })
      // }
      // this.allCols[this.tempFocusRow].focusArea.splice(this.tempFocusColumn, 1, true)
      this.isFocusArea = false
    },
    handleTableMouseUp (evt) {
      this.drag = false
      this.dragStart.row = -1
      this.dragStart.column = -1
    },
    isFocusAreaText (str) {
      let arr = str.split('\r\n')
      if (arr.length > 1) {
        return true
      }
      for (let i = 0; i < arr.length; i++) {
        let item = arr[i].split('\t')
        if (item.length > 1) {
          return true
        }
      }
      return false
    },
    async handleTablePaste (evt) {
      let paste = (evt.clipboardData || window.clipboardData).getData('text')
      if (this.isFocusArea) {
        evt.preventDefault()
        let rows = paste.split(/\r\n/)
        if (!rows.length) {
          return
        }
        let rowStart = this.startRow
        let firstI = this.startColumn
        let firstJ = this.endColumn
        // for (let i = 0; i < this.allCols.length - 1; i++) {
        //   for (let j = 0; j < 3; j++) {
        //     if (this.allCols[i].focusArea[j]) {
        //       if (firstI === -1) {
        //         rowStart = i
        //         firstI = j
        //       }
        //     } else {
        //       if (firstI !== -1 && firstJ === -1) {
        //         firstJ = j - 1
        //         break
        //       }
        //     }
        //   }
        //   if (firstI !== -1) {
        //     if (firstJ === -1) {
        //       firstJ = 2
        //       break
        //     } else {
        //       break
        //     }
        //   }
        // }
        if (rows.length > this.allCols.length - rowStart) {
          try {
            await this.$confirm(`是否创建新${this.attributeName}？`, '', {
              type: 'warning'
            })
            for (let i = 0; i <= rows.length - (this.allCols.length - rowStart); i++) {
              this.addColumn(true)
            }
          } catch (e) {
            rows.splice(this.allCols.length - rowStart + 1)
          }
        }
        for (let i = 0; i < rows.length; i++) {
          let rowsArr = rows[i].split(/\t/)
          let item = this.allCols[rowStart + i]
          for (let j = firstI; j < Math.min(firstI + rowsArr.length, 3); j++) {
            item[this.focusAreaPositionToColumnName[j + '']] = rowsArr[j - firstI]
          }
        }
      } else if (this.isFocusAreaText(paste)) {
        evt.preventDefault()
        let rows = paste.split(/\r\n/)
        if (!rows.length) {
          return
        }
        let rowStart = this.tempFocusRow
        let firstI = this.tempFocusColumn
        if (rows.length > this.allCols.length - rowStart) {
          try {
            await this.$confirm(`是否创建新${this.attributeName}？`, '', {
              type: 'warning'
            })
            for (let i = 0; i <= rows.length - (this.allCols.length - rowStart); i++) {
              this.addColumn(true)
            }
          } catch (e) {
            rows.splice(this.allCols.length - rowStart + 1)
          }
        }
        for (let i = 0; i < rows.length; i++) {
          let rowsArr = rows[i].split(/\t/)
          let item = this.allCols[rowStart + i]
          for (let j = firstI; j < Math.min(firstI + rowsArr.length, 3); j++) {
            item[this.focusAreaPositionToColumnName[j + '']] = rowsArr[j - firstI]
          }
        }
      }
    },
    caculateBorderClass (scope) {
      if (scope.row.deleted) {
        return ''
      }
      if (this.typeDataWareHouse) {
        return 'black-el-input'
      }
      let i = scope.$index
      let j = this.columnNameToFocusAreaPosition[scope.column.property]
      let borderClass = ''
      let currentRow = this.allCols[scope.$index]
      if (currentRow.focusArea && currentRow.focusArea[j]) { // 需要边框
        if (!this.allCols[i - 1] || (this.allCols[i - 1] && !this.allCols[i - 1].focusArea[j])) { // 需要上边框
          borderClass += 'top '
        }
        if (!this.allCols[i + 1] || (this.allCols[i + 1] && !this.allCols[i + 1].focusArea[j])) { // 需要上边框
          borderClass += 'bottom '
        }
        if (!currentRow.focusArea[j - 1]) {
          borderClass += 'left '
        }
        if (!currentRow.focusArea[j + 1]) {
          borderClass += 'right '
        }
        return borderClass
      } else {
        return ''
      }
    },
    async handleTableCopy (e) {
      if (this.isFocusArea) {
        e.preventDefault()
        let str = ''
        for (let i = this.startRow; i <= this.endRow; i++) {
          for (let j = this.startColumn; j <= this.endColumn; j++) {
            let item = this.allCols[i]
            str += (item[this.focusAreaPositionToColumnName[j + '']] || '') + '\t'
          }
          str = str.substr(0, str.length - 1)
          str += '\r\n'
        }
        str = str.substr(0, str.length - 2)
        e.clipboardData.setData('text/plain', str)
      }
    },
    async prepareRequestBody () {
      if (this.rawData.tableMsg.Id) {
        this.requestBody.elementId = this.rawData.tableMsg.Id
        this.$store.commit('setTableId', this.rawData.tableMsg.Id)
      }
      this.requestBody.name = this.rawData.tableMsg.Name
      this.requestBody.cnName = this.rawData.tableMsg.LogicalName
      this.requestBody.description = this.rawData.tableMsg.Definition
      this.requestBody.SchemaRef = this.rawData.tableMsg.SchemaRef || ''
      if (this.rawData.tableMsg.Location) {
        this.$set(this.requestBody, 'Location', this.rawData.tableMsg.Location)
      } else {
        this.$set(this.requestBody, 'Location', '')
      }
      if (this.rawData.tableMsg.TableType) {
        this.$set(this.requestBody, 'TableType', this.rawData.tableMsg.TableType)
      } else {
        this.$set(this.requestBody, 'TableType', '')
      }
      if (this.rawData.tableMsg.TblProperties) {
        this.$set(this.requestBody, 'TblProperties', this.rawData.tableMsg.TblProperties)
      } else {
        this.$set(this.requestBody, 'TblProperties', '')
      }
      //  检查schema是否被删除,删除则清空当前schema
      if (this.dataByType.schema) {
        if (Object.values(this.dataByType.schema).filter(i => !i.properties.deleted).every(v => v.properties.Id !== this.requestBody.SchemaRef)) {
          this.requestBody.SchemaRef = ''
        }
      }
      if (this.rawData.sqlCreate) {
        this.requestBody.newKeyGroups = []
        this.rawData.pk.forEach(element => {
          this.requestBody.newKeyGroups.push(element)
        })
        this.rawData.uk.forEach(element => {
          this.requestBody.newKeyGroups.push(element)
        })
        this.rawData.nk.forEach(element => {
          this.requestBody.newKeyGroups.push(element)
        })
        this.rawData.vk.forEach(element => {
          this.requestBody.newKeyGroups.push(element)
        })
      }
      if (this.isDesignModel) {
        this.requestBody.logicalOnly = this.rawData.tableMsg.IsLogicalOnly
      } else {
        this.requestBody.physicalOnly = this.rawData.tableMsg.IsPhysicalOnly
      }
      if (this.isLogical || this.isConceptual) {
        this.requestBody.CommonMemberRefs = this.rawData.tableMsg.CommonMemberRefs
        if (this.rawData.tableMsg.CommonMemberRefs) {
          this.businessEntityList = this.rawData.tableMsg.CommonMemberRefs.split(',').map(i => +i)
        } else {
          this.businessEntityList = []
        }
      }
      this.allCols = []
      this.rawData.columnsMsg.forEach(item => {
        let body = {
          elementId: item.properties.Id,
          name: item.properties.Name,
          cnName: item.properties.LogicalName,
          dataType: item.properties.DataType,
          notNull: item.properties.IsNotNull,
          domainId: item.properties.DataStandardRef,
          dataStandardCode: item.properties.DataStandardCode,
          defaultVal: item.properties.DefaultValue,
          description: item.properties.Definition,
          deleted: item.properties.deleted,
          focusArea: [false, false, false]
        }
        if (this.pk.indexOf(body.elementId) > -1) {
          body.notNull = true
        }
        if (this.isDesignModel) {
          body.logicalOnly = item.properties.IsLogicalOnly
        } else {
          body.physicalOnly = item.properties.IsPhysicalOnly
        }
        body.allUdps = {}
        if (this.rawData.sqlCreate) {
          body.new = true
        }
        this.columnsUdpKeys && this.columnsUdpKeys.forEach(i => {
          body.allUdps[String(i)] = item.properties[i] === undefined ? null : item.properties[i]
        })
        this.allCols.push(body)
      })
      if (this.rawData.sqlCreate) {
        this.allColsInitial = []
      } else {
        this.allColsInitial = _.cloneDeep(this.allCols)
      }
      try {
        let res = await this.$http({
          url: this.$url + '/service/domains/namemap',
          method: 'post',
          data: this.rawData.columnsMsg.map(item => item.properties.DataStandardRef).filter(domainId => domainId)
        })
        if (res.data) {
          this.domainIdToName = res.data
        }
        // this.rawData.columnsMsg.forEach((item, index) => {
        //   if (this.allCols[index].domainId) {
        //     this.$set(this.allCols[index], 'domainName', domainIdToName[item.properties.DataStandardRef])
        //   }
        // })
      } catch (e) {
        this.$showFailure(e)
      }
      this.highlightRow()
    },
    highlightRow () {
      if (this.$route.query.elementId) {
        setTimeout(() => {
          this.allCols.forEach((item, index) => {
            if (this.$route.query.typeId === '80000005' && String(item.elementId) === String(this.$route.query.elementId)) {
              item.checked = true
              const dom = $(this.$refs.tableDetailList.$el).find(`tr:nth-child(${index + 1})`)
              dom.css('fontWeight', 'bold')
              dom.css('color', '#4386f5')
              dom.css('backgroundColor', '#f0f6ff')
            }
          })
        })
      }
    },
    getMaxId (cols) {
      return Math.max(...cols.map(v => {
        let arr = v.name.split('_')
        let num = parseInt(arr[arr.length - 1])
        return isNaN(num) ? 0 : num
      }))
    },
    addColumn (addDwItem = false) { // addDwItem 是否添加字段映射的item
      let maxId = this.getMaxId(this.allCols)
      maxId = isNaN(maxId) || maxId === -Infinity ? 0 : maxId
      let body = {
        name: this.getColumnNameNamingMap((this.isLogical || this.isConceptual ? 'Attribute_' : this.isCassandraOrMongoDB ? 'Filed_' : 'Column_') + (++maxId)),
        cnName: '',
        description: '',
        dataType: this.TypeUniqueIdToColumnDefaultType[this.currentModel.TypeUniqueId?.toUpperCase()] || this.TypeUniqueIdToColumnDefaultType[this.currentModel.TypeUniqueId?.toLowerCase()] || 'VARCHAR(50)',
        enName: '',
        domainId: null,
        dataStandardCode: null,
        notNull: false,
        defaultVal: '',
        elementId: this.deliverNum.seed++,
        focusArea: [false, false, false],
        deleted: false,
        new: true
      }
      if (this.isDesignModel) {
        body.logicalOnly = null
      } else {
        body.physicalOnly = null
      }
      body.allUdps = {}
      this.columnsUdpKeys.forEach(i => {
        let udp = this.dataByType.udp.get(Number(i))
        body.allUdps[String(i)] = udp.DefaultUDPValue !== undefined ? udp.DefaultUDPValue : null
      })
      this.allCols.push(body)
      clearTimeout(this.scrollTimer)
      this.scrollTimer = setTimeout(() => {
        this.$nextTick(() => {
          $('.el-table__body-wrapper').scrollTop(10000000000)
          // $('.el-table__fixed-body-wrapper tr:last-child input')[0].focus()
        })
      }, 400)
      this.columnAdd = true
      let result = { col: body, colIndex: this.allCols.length - 1 }
      if (addDwItem) {
        this.$bus.$emit('addDwItem', result)
      }
      return result
    },
    async deleteRow (row, index) {
      if (this.fk.indexOf(row.elementId) > -1) {
        // 外键
        return
      }
      // if (this.caculating && this.caculatingTimer) {
      //   return
      // }
      // this.caculating = true
      // this.caculatingTimer = setTimeout(() => {
      //   this.caculating = false
      //   this.caculatingTimer = null
      // }, 500)
      const col = this.allCols[index]
      const remove = () => {
        // this.allCols.splice(index, 1)
        this.$set(col, 'deleted', true)
        // col.deleted = true
        this.$bus.$emit('removeColumnFromIndexSelectionList', index)
        this.$bus.$emit('deleteColumn', col.elementId) // 如果有partition，需要删除相应member元素, 如何有字段映射删除字段映射member
      }
      if (col.elementId) {
        await this.updateIndexCausedByDeleteColumn(col, remove)
      } else {
        remove()
      }
      // 删除字段提交一条保存记录，因为主键member会删除无法恢复
      // let changes = await this.save()
      // let data = new (this.LayerEdit)(changes)
      // if (changes && changes.length) {
      //   this.dataByType.table[this.rawData.tableMsg.Id].properties.changed = true
      //   this.graph.editor.undoManager.undoableEditHappened(data)
      //   setTimeout(() => {
      //     this.$parent.$parent.afterHandleDialogData(this.rawData.tableMsg.Id, true)
      //   }, 200)
      // }
    },
    async updateIndexCausedByDeleteColumn (col, callback) {
      const columnId = col.elementId
      const index = this.$refs.indexEditor.indexS
      const refsIndex = []
      index.forEach(item => {
        if (item.children && item.children.map(item => item.properties.AttributeRef).includes(columnId)) {
          refsIndex.push(item.properties)
        }
      })
      if (refsIndex.length > 0) {
        try {
          await this.$DatablauCofirm(`"${col.name}"是索引${refsIndex.map(item => '"' + item.Name + '"').join(',')}的成员${this.attributeName},是否继续删除`, '提示', {
            type: 'warning'
          })
          for (let indexIndex = 0; indexIndex < index.length; indexIndex++) {
            let item = index[indexIndex]
            if (item.children?.map(item => item.properties.AttributeRef).includes(columnId)) {
              let refIndex
              item.children.forEach((c, i) => {
                if (c.properties.AttributeRef === columnId) {
                  refIndex = i
                }
              })
              item.children.splice(refIndex, 1)
              // if (item.children.length > 1) {
              //   item.children.splice(refIndex, 1)
              // } else {
              //   index.splice(indexIndex, 1)
              //   indexIndex--
              // }
            }
          }
          this.$refs.indexEditor.temporarySave()
          callback()
        } catch (e) {
          console.log(e)
        }
      } else {
        callback()
      }
    },
    updateColumnsMapOfIndexEditor (col) {
      if (this.timer) {
        clearTimeout(this.timer)
      }
      this.timer = setTimeout(() => {
        if (col.elementId) {
          this.$refs.indexEditor.columnsMap.get(col.elementId).Name = col.name
        }
        this.timer = null
      }, 200)
    },
    editIndex () {
      if (this.indexEditorVisible) {
        this.$refs.indexEditor.prepareTableData()
      }
      this.indexEditorVisible = true
      // this.$nextTick(() => {
      //   this.$refs.indexEditor.editMode = this.editMode
      // })
    },
    beforeSave () {
      let res = this.check()
      if (res) {
        this.checkInVersionDialogVisible = true
      }
    },
    async saveInTableEditor (request) {
      this.tableDataBak = _.cloneDeep(this.dataByType.table[this.rawData.tableMsg.Id])
      let changes = await this.save()
      if (changes && changes.length) {
        this.dataByType.table[this.rawData.tableMsg.Id].properties.changed = true
      }
      this.saveModel(request)
    },
    deepDeliver (table, changes, change, noIndexModifed, deliverColumnIds) {
      this.$bus.$emit('clearPathIds')
      try {
        this.calculateStartIdToEndIds()
        setTimeout(() => {
          if (this.graph) {
            let endIds = this.startIdToEndIds[table.properties.Id]
            let target = this.graph?.graph.getDefaultParent().children.find(cell => cell.OwneeRef === table.properties.Id)
            if (target) {
              this.createDeepRelation(endIds, target, changes, change.obj.preTable, noIndexModifed, deliverColumnIds)
            }
          }
        })
      } catch (e) {
        console.log(e)
      }
    },
    check () {
      let tableNameValid = false
      this.$refs.tableNameRef.validate((valid) => {
        if (valid) {
          if (this.$refs.udpSetting) {
            this.$bus.$emit('myValidateForm')
            if (!that.udpValidate) {
              this.$showFailure('UDP必填项不能为空')
            } else {
              tableNameValid = true
            }
          } else {
            tableNameValid = true
          }
        }
      })
      let logicalColumnNameValid = true
      if (this.isDesignModel) {
        for (let i = 0; i < this.allCols.length; i++) {
          let item = this.allCols[i]
          if (item.deleted) {
            continue
          }
          if (item.cnName?.trim() && this.checkLogicalColIsDuplicate2(item.cnName)) {
            $('.el-table__body-wrapper').scrollTop(31 * i)
            setTimeout(() => { // 延迟校验，不然校验不生效
              this.$refs[`logical-name-form${i}${this.shrink ? '-shrink' : ''}`].validate((valid) => {
              })
            })
            logicalColumnNameValid = false
            return false
          }
        }
      }
      let columnNameValid = true
      for (let i = 0; i < this.allCols.length; i++) {
        let item = this.allCols[i]
        if (item.deleted) {
          continue
        }
        if (this.checkColIsDuplicate2(item.name)) {
          $('.el-table__body-wrapper').scrollTop(31 * i)
          setTimeout(() => { // 延迟校验，不然校验不生效
            this.$refs[`name-form${i}${this.shrink ? '-shrink' : ''}`].validate((valid) => {
            })
          })
          columnNameValid = false
          return false
        }
      }
      let typeValid = true
      for (let i = 0; i < this.allCols.length; i++) {
        let item = this.allCols[i]
        if (item.deleted) {
          continue
        }
        if (!item.dataType) {
          $('.el-table__body-wrapper').scrollTop(31 * i)
          setTimeout(() => { // 延迟校验，不然校验不生效
            this.$refs[`type-form${i}${this.shrink ? '-shrink' : ''}`].validate((valid) => {
            })
          })
          typeValid = false
          return false
        }
      }
      let clusterValid = true
      if (this.$refs.clusterRef) {
        clusterValid = this.$refs.clusterRef.valid()
      }
      if (!columnNameValid || !tableNameValid || !typeValid || !logicalColumnNameValid || !clusterValid) {
        return false
      } else {
        return true
      }
    },
    myValidate (valid) {
      this.udpValidate = valid
    },
    async save () {
      let that = this
      let tableNameValid = false
      this.$refs.tableNameRef.validate((valid) => {
        if (valid) {
          if (this.$refs.udpSetting) {
            this.$bus.$emit('myValidateForm')
            if (!that.udpValidate) {
              this.$showFailure('UDP必填项不能为空')
            } else {
              tableNameValid = true
            }
          } else {
            tableNameValid = true
          }
        }
      })
      let indexNameValid = true
      this.$refs.indexEditor.indexS.forEach((item, i) => {
        if (item.properties.deleted) {
          return
        }
        this.$refs.indexEditor.$refs[`indexNameInput${i}`].validate(valid => {
          indexNameValid = valid && indexNameValid
        })
      })
      if (!indexNameValid) {
        // this.$datablauMessage.error('有索引名称为空！')
        return false
      }
      let logicalColumnNameValid = true
      if (this.isDesignModel) {
        for (let i = 0; i < this.allCols.length; i++) {
          let item = this.allCols[i]
          if (item.deleted) {
            continue
          }
          if (item.cnName?.trim() && this.checkLogicalColIsDuplicate2(item.cnName)) {
            $('.el-table__body-wrapper').scrollTop(31 * i)
            setTimeout(() => { // 延迟校验，不然校验不生效
              this.$refs[`logical-name-form${i}${this.shrink ? '-shrink' : ''}`].validate((valid) => {
              })
            })
            logicalColumnNameValid = false
            return false
          }
        }
      }
      let columnNameValid = true
      for (let i = 0; i < this.allCols.length; i++) {
        let item = this.allCols[i]
        if (item.deleted) {
          continue
        }
        if (this.checkColIsDuplicate2(item.name)) {
          $('.el-table__body-wrapper').scrollTop(31 * i)
          setTimeout(() => { // 延迟校验，不然校验不生效
            this.$refs[`name-form${i}${this.shrink ? '-shrink' : ''}`].validate((valid) => {
            })
          })
          columnNameValid = false
          return false
        }
      }
      let typeValid = true
      for (let i = 0; i < this.allCols.length; i++) {
        let item = this.allCols[i]
        if (item.deleted) {
          continue
        }
        if (!item.dataType) {
          $('.el-table__body-wrapper').scrollTop(31 * i)
          setTimeout(() => { // 延迟校验，不然校验不生效
            this.$refs[`type-form${i}${this.shrink ? '-shrink' : ''}`].validate((valid) => {
            })
          })
          typeValid = false
          return false
        }
      }
      let clusterValid = true
      if (this.$refs.clusterRef) {
        clusterValid = this.$refs.clusterRef.valid()
      }
      if (!columnNameValid || !tableNameValid || !typeValid || !logicalColumnNameValid || !indexNameValid || !clusterValid) {
        return false
      }
      let changes = []
      // this.buttonLoading = true
      this.requestBody.modCols = []
      this.requestBody.newCols = []
      this.requestBody.delCols = []
      const initialMap = new Map()
      const currentSet = new Set()
      this.allColsInitial.forEach(item => {
        initialMap.set(item.elementId, item)
      })
      this.allCols.forEach(item => {
        delete item.focusArea
        if (!item.deleted) {
          currentSet.add(item.elementId)
        }
        if (initialMap.has(item.elementId)) {
          let tempItem = initialMap.get(item.elementId)
          delete tempItem.focusArea
          let itemCopy = _.cloneDeep(item)
          delete itemCopy.rowIndex
          if (JSON.stringify(tempItem) !== JSON.stringify(itemCopy) && !item.deleted) {
            item.changed = true
            this.requestBody.modCols.push(item)
          }
        } else if (!item.deleted) {
          this.requestBody.newCols.push(item)
        }
        // if (item.deleted) {
        //   this.requestBody.delCols.push(item.elementId)
        // }
      })
      initialMap.forEach(item => {
        if (!currentSet.has(item.elementId)) {
          this.requestBody.delCols.push(item)
        }
      })

      let entityId = this.rawData.tableMsg.Id
      let tableData = this.dataByType.table[entityId]

      if (this.$refs.partitionRef) {
        this.$refs.partitionRef.temporarySave()
        if (this.$refs.partitionRef.del) {
          let item = this.$refs.partitionRef.del
          let index = this.dataByType.table[entityId].children.findIndex(column => column.objectClass === 'Datablau.LDM.Partition' && column.properties.Id === item.properties.Id)
          if (index !== -1) {
            let change = new (this.Changes)('deletePartition', {
              pId: entityId,
              pName: tableData.properties.Name,
              id: item.properties.Id,
              name: item.properties.Name,
              pre: _.cloneDeep(this.dataByType.table[entityId].children[index])
            })
            this.$set(this.dataByType.table[entityId].children[index].properties, 'deleted', true)
            changes.push(change)
          }
        } else if (this.$refs.partitionRef.new) {
          let item = this.$refs.partitionRef.new
          let change = new (this.Changes)('insertPartition', {
            pId: entityId,
            pName: tableData.properties.Name,
            id: item.properties.Id,
            name: item.properties.Name,
            now: null,
            preTable: _.cloneDeep(this.dataByType.table[entityId])
          })
          if (this.dataByType.table[entityId].children) {
            this.dataByType.table[entityId].children.push(item)
          } else {
            this.dataByType.table[entityId].children = [item]
          }
          change.obj.now = this.dataByType.table[entityId].children[this.dataByType.table[entityId].children.length - 1]
          changes.push(change)
        } else if (this.$refs.partitionRef.mod) {
          let item = this.$refs.partitionRef.mod
          item.properties.changed = true
          let index = this.dataByType.table[entityId].children.findIndex(column => column.objectClass === 'Datablau.LDM.Partition' && column.properties.Id === item.properties.Id)
          if (index !== -1) {
            let change = new (this.Changes)('modifyPartition', {
              pId: entityId,
              pName: tableData.properties.Name,
              id: item.properties.Id,
              name: item.properties.Name,
              pre: _.cloneDeep(this.dataByType.table[entityId].children[index]),
              preTable: _.cloneDeep(this.dataByType.table[entityId]),
              now: null
            })
            this.dataByType.table[entityId].children[index] = item
            change.obj.now = _.cloneDeep(item)
            changes.push(change)
          }
        }
      }

      if (this.$refs.clusterRef) {
        this.$refs.clusterRef.temporarySave()
        if (this.$refs.clusterRef.new) { // Cluster没有删除
          let item = this.$refs.clusterRef.new
          let change = new (this.Changes)('insertCluster', {
            pId: entityId,
            pName: tableData.properties.Name,
            id: item.properties.Id,
            name: item.properties.Name,
            now: null,
            preTable: _.cloneDeep(this.dataByType.table[entityId])
          })
          if (this.dataByType.table[entityId].children) {
            this.dataByType.table[entityId].children.push(item)
          } else {
            this.dataByType.table[entityId].children = [item]
          }
          change.obj.now = this.dataByType.table[entityId].children[this.dataByType.table[entityId].children.length - 1]
          changes.push(change)
        } else if (this.$refs.clusterRef.mod) {
          let item = this.$refs.clusterRef.mod
          item.properties.changed = true
          let index = this.dataByType.table[entityId].children.findIndex(column => column.objectClass === 'Datablau.LDM.EntityCluster' && column.properties.Id === item.properties.Id)
          if (index !== -1) {
            let change = new (this.Changes)('modifyCluster', {
              pId: entityId,
              pName: tableData.properties.Name,
              id: item.properties.Id,
              name: item.properties.Name,
              pre: _.cloneDeep(this.dataByType.table[entityId].children[index]),
              preTable: _.cloneDeep(this.dataByType.table[entityId]),
              now: null
            })
            this.dataByType.table[entityId].children[index] = item
            change.obj.now = _.cloneDeep(item)
            changes.push(change)
          }
        }
      }
      let change = new (this.Changes)('modifyTableProperties', {
        id: entityId,
        name: tableData.properties.Name,
        pre: _.cloneDeep(tableData.properties),
        now: null
      })
      let tablePropertiesChanged = false
      if (tableData.properties.PartitionElementDesign || this.rawData.partitionElementDesign) {
        let tmpStr = JSON.stringify(this.rawData.partitionElementDesign)
        if (tableData.properties.PartitionElementDesign !== tmpStr) {
          tableData.properties.PartitionElementDesign = tmpStr
          tablePropertiesChanged = true
        }
      }
      if (tableData.properties.LogicalName !== this.requestBody.cnName) {
        tableData.properties.LogicalName = this.requestBody.cnName
        tablePropertiesChanged = true
      }
      if (tableData.properties.Name !== this.requestBody.name) {
        tableData.properties.Name = this.requestBody.name
        tablePropertiesChanged = true
      }
      if (tableData.properties.Definition !== this.requestBody.description) {
        tableData.properties.Definition = this.requestBody.description
        tablePropertiesChanged = true
      }
      if (this.isDesignModel) {
        if (tableData.properties.IsLogicalOnly !== this.requestBody.logicalOnly) {
          tableData.properties.IsLogicalOnly = this.requestBody.logicalOnly
          tablePropertiesChanged = true
        }
      } else {
        if (tableData.properties.IsPhysicalOnly !== this.requestBody.physicalOnly) {
          tableData.properties.IsPhysicalOnly = this.requestBody.physicalOnly
          tablePropertiesChanged = true
        }
        tableData.properties.IsPhysicalOnly = this.requestBody.physicalOnly
      }
      if (tableData.properties.SchemaRef !== this.requestBody.SchemaRef) {
        tableData.properties.SchemaRef = this.requestBody.SchemaRef
        tablePropertiesChanged = true
      }
      if (tableData.properties.CommonMemberRefs !== this.requestBody.CommonMemberRefs) {
        tableData.properties.CommonMemberRefs = this.requestBody.CommonMemberRefs
        tablePropertiesChanged = true
      }
      if (tableData.properties.Location !== this.requestBody.Location) {
        tableData.properties.Location = this.requestBody.Location
        tablePropertiesChanged = true
      }
      if (tableData.properties.TableType !== this.requestBody.TableType) {
        tableData.properties.TableType = this.requestBody.TableType
        tablePropertiesChanged = true
      }
      if (tableData.properties.TblProperties !== this.requestBody.TblProperties) {
        tableData.properties.TblProperties = this.requestBody.TblProperties
        tablePropertiesChanged = true
      }

      if (JSON.stringify(tableData.properties.ColumnOrderArrayRefs) !== JSON.stringify(this.allCols.filter(i => !i.deleted).map(i => i.elementId))) {
        tableData.properties.ColumnOrderArrayRefs = this.allCols.filter(i => !i.deleted).map(i => i.elementId)
        tablePropertiesChanged = true
      }
      if (JSON.stringify(this.allUpdsInital) !== JSON.stringify(this.requestBody.allUdps)) {
        Object.assign(tableData.properties, this.requestBody.allUdps)
        tablePropertiesChanged = true
      }
      if (tablePropertiesChanged) {
        // change.obj.now = _.cloneDeep(tableData.properties)
        setTimeout(() => { // 字段顺序ColumnOrderArrayRefs在有环状关系的情况下在关闭弹层后，因为传递可能会被更新，所以延迟获取
          change.obj.now = _.cloneDeep(tableData.properties)
        }, 300)
        changes.push(change)
      }

      let { parentKeyRefs, columnIds } = this.caculateDeliverParentKeyRef(tableData)
      this.requestBody.modCols.map(item => ({
        ...item.allUdps,
        DataType: item.dataType,
        Id: item.elementId,
        IsNotNull: item.notNull,
        Name: item.name,
        RawType: 'Attribute',
        DataStandardCode: item.dataStandardCode,
        TypeId: 80000005,
        LogicalName: item.cnName,
        DefaultValue: item.defaultVal,
        Definition: item.description,
        IsLogicalOnly: item.logicalOnly,
        IsAutoIncrement: item.IsAutoIncrement,
        StartingValue: item.StartingValue,
        IsPhysicalOnly: item.physicalOnly,
        DataStandardRef: item.domainId,
        changed: item.changed,
        deleted: item.deleted
      })).forEach(item => {
        let index = this.dataByType.table[entityId].children.findIndex(column => column.objectClass === 'Datablau.LDM.EntityAttribute' && column.properties.Id === item.Id)
        if (index !== -1) {
          let change = new (this.Changes)('modifyColumn', {
            pId: entityId,
            pName: tableData.properties.Name,
            id: item.Id,
            name: item.Name,
            pre: _.cloneDeep(this.dataByType.table[entityId].children[index]),
            preTable: _.cloneDeep(this.dataByType.table[entityId]),
            now: null
          })
          _.merge(this.dataByType.table[entityId].children[index].properties, item)
          change.obj.now = _.cloneDeep(this.dataByType.table[entityId].children[index])
          changes.push(change)
          let primaryKey = this.dataByType.table[entityId].children.find(column => column.properties.KeyGroupType === 'PrimaryKey')
          // if (primaryKey && primaryKey.children && primaryKey.children.find(member => member.properties.AttributeRef === item.Id)) {
          if (columnIds.includes(item.Id)) {
            let table = this.dataByType.table[entityId]
            this.$bus.$emit('clearPathIds')
            try {
              this.calculateStartIdToEndIds()
              setTimeout(() => {
                let endIds = this.startIdToEndIds[table.properties.Id]
                let target = this.graph?.graph.getDefaultParent().children.find(cell => cell.OwneeRef === table.properties.Id)
                if (target) {
                  this.createDeepRelation(endIds, target, changes, change.obj.preTable, true, [item.Id]) // true表明不需要修改索引，只是修改字段信息传递
                }
              })
            } catch (e) {
              console.log(e)
            }
          }
        }
      })
      this.requestBody.newCols.map(item => ({
        objectClass: 'Datablau.LDM.EntityAttribute',
        properties: {
          ...item.allUdps,
          DataType: item.dataType,
          Id: item.elementId,
          IsNotNull: item.notNull,
          Name: item.name,
          RawType: 'Attribute',
          DataStandardCode: item.dataStandardCode,
          TypeId: 80000005,
          LogicalName: item.cnName,
          DefaultValue: item.defaultVal,
          Definition: item.description,
          IsLogicalOnly: item.logicalOnly,
          IsAutoIncrement: item.IsAutoIncrement,
          StartingValue: item.StartingValue,
          IsPhysicalOnly: item.physicalOnly,
          DataStandardRef: item.domainId,
          changed: item.changed,
          deleted: item.deleted,
          UniqueId: uuidv4(),
          new: item.new
        }
      })).forEach(item => {
        if (!item.properties.deleted) {
          let change = new (this.Changes)('insertColumn', {
            pId: entityId,
            pName: tableData.properties.Name,
            id: item.properties.Id,
            name: item.properties.Name,
            preTable: _.cloneDeep(this.dataByType.table[entityId])
          })
          if (this.dataByType.table[entityId].children) {
            this.dataByType.table[entityId].children.push(item)
          } else {
            this.dataByType.table[entityId].children = [item]
          }
          change.obj.now = this.dataByType.table[entityId].children[this.dataByType.table[entityId].children.length - 1]
          changes.push(change)
        }
      })
      this.requestBody.delCols.map(item => ({
        ...item.allUdps,
        DataType: item.dataType,
        Id: item.elementId,
        IsNotNull: item.notNull,
        Name: item.name,
        RawType: 'Attribute',
        DataStandardCode: item.dataStandardCode,
        TypeId: 80000005,
        LogicalName: item.cnName,
        DefaultValue: item.defaultVal,
        Definition: item.description,
        IsLogicalOnly: item.logicalOnly,
        IsAutoIncrement: item.IsAutoIncrement,
        StartingValue: item.StartingValue,
        IsPhysicalOnly: item.physicalOnly,
        DataStandardRef: item.domainId,
        changed: item.changed,
        deleted: item.deleted
      })).forEach(item => {
        let index = this.dataByType.table[entityId].children.findIndex(column => column.objectClass === 'Datablau.LDM.EntityAttribute' && column.properties.Id === item.Id)
        if (index !== -1) {
          let change = new (this.Changes)('deleteColumn', {
            pId: tableData.properties.Id,
            pName: tableData.properties.Name,
            id: item.Id,
            name: item.Name,
            preTable: _.cloneDeep(this.dataByType.table[entityId])
          })
          this.dataByType.table[entityId].children[index].properties.deleted = true
          changes.push(change)
          let subtypes = tableData.children?.filter(i => i.objectClass === 'Datablau.LDM.EntitySubtype' && i.properties.AttributeRef === item.Id) // 如果有subtype清除subtype上绑定的相关字段
          subtypes?.forEach(subtypeData => {
            let change = new (this.Changes)('modifySubtype', {
              pId: tableData.properties.Id,
              pName: tableData.properties.Name,
              name: subtypeData.properties.Name,
              pre: _.cloneDeep(subtypeData)
            })
            let cellData = this.graph?.graph.getDefaultParent().children.find(cell => !cell.deleted && cell.SubTypeRef === subtypeData.properties.Id)
            if (cellData) {
              subtypeData.properties.AttributeRef = ''
              subtypeData.properties.changed = true
              change.obj.now = _.cloneDeep(subtypeData)
              changes.push(change)
              let shape = this.dataByType.diagram[this.currentId].children.find(shape => shape.properties.Id === cellData.Id)
              cellData.value = this.graph.drawSubTypeShape(shape, true)
              cellData.style = this.graph.drawSubTypeStyle(cellData)
              this.graph.graph.refresh(cellData)
            }
          })
          if (columnIds.includes(item.Id)) {
            let table = this.dataByType.table[entityId]
            this.$bus.$emit('clearPathIds')
            try {
              this.calculateStartIdToEndIds()
              setTimeout(() => {
                let endIds = this.startIdToEndIds[table.properties.Id]
                let target = this.graph?.graph.getDefaultParent().children.find(cell => cell.OwneeRef === table.properties.Id)
                if (target) {
                  this.createDeepRelation(endIds, target, changes, change.obj.preTable, true, [item.Id]) // true表明不需要修改索引，只是修改字段信息传递
                }
              })
            } catch (e) {
              console.log(e)
            }
          }
        }
      })
      if (this.$refs.indexEditor) {
        this.$refs.indexEditor.temporarySave()
        this.requestBody.newKeyGroups = this.$refs.indexEditor.newKeyGroups
        this.requestBody.modKeyGroups = this.$refs.indexEditor.modKeyGroups
        this.requestBody.delKeyGroups = this.$refs.indexEditor.delKeyGroups
        this.requestBody.modKeyGroups.forEach(item => {
          item.properties.changed = true
          let index = this.dataByType.table[entityId].children.findIndex(column => column.objectClass === 'Datablau.LDM.EntityKeyGroup' && column.properties.Id === item.properties.Id)
          if (index !== -1) {
            let change = new (this.Changes)('modifyIndex', {
              pId: entityId,
              pName: tableData.properties.Name,
              id: item.properties.Id,
              name: item.properties.Name,
              pre: _.cloneDeep(this.dataByType.table[entityId].children[index]),
              preTable: _.cloneDeep(this.dataByType.table[entityId]),
              now: null
            })
            this.dataByType.table[entityId].children[index] = item
            // if (item.properties.KeyGroupType === 'PrimaryKey') {
            let table = this.dataByType.table[entityId]
            setTimeout(() => {
              if (item.properties.KeyGroupType === 'PrimaryKey') {
                this.changeUpRelationType(table, item, changes, change.obj.pre) // 先传递后修改关系, 外键关系不可修改
              }
            }, 200)
            if (parentKeyRefs.includes(item.properties.Id)) {
              if (item.properties.needDeliver) {
                let deliverColumnIds = this.caculateDeliverColumnIds(change.obj.pre, item)
                this.deepDeliver(table, changes, change, true, deliverColumnIds) // 传递
              }
            }

            change.obj.now = _.cloneDeep(item)
            changes.push(change)
          }
        })
        this.requestBody.newKeyGroups.forEach(item => {
          if (!item.properties.deleted) {
            let change = new (this.Changes)('insertIndex', {
              pId: entityId,
              pName: tableData.properties.Name,
              id: item.properties.Id,
              name: item.properties.Name,
              now: null,
              preTable: _.cloneDeep(this.dataByType.table[entityId])
            })
            if (this.dataByType.table[entityId].children) {
              this.dataByType.table[entityId].children.push(item)
            } else {
              this.dataByType.table[entityId].children = [item]
            }
            change.obj.now = this.dataByType.table[entityId].children[this.dataByType.table[entityId].children.length - 1]
            changes.push(change)
            // if (item.properties.KeyGroupType === 'PrimaryKey') {
            let table = this.dataByType.table[entityId]
            setTimeout(() => {
              if (item.properties.KeyGroupType === 'PrimaryKey') {
                this.changeUpRelationType(table, item, changes)
              }
            }, 200)
            if (parentKeyRefs.includes(item.properties.Id)) {
              if (item.properties.needDeliver) {
                this.deepDeliver(table, changes, change, true) // 传递
              }
            }
          }
        })
        this.requestBody.delKeyGroups.forEach(item => {
          let index = this.dataByType.table[entityId].children.findIndex(column => column.objectClass === 'Datablau.LDM.EntityKeyGroup' && column.properties.Id === item.properties.Id)
          if (index !== -1) {
            let change = new (this.Changes)('deleteIndex', {
              pId: entityId,
              pName: tableData.properties.Name,
              id: item.properties.Id,
              name: item.properties.Name,
              pre: _.cloneDeep(this.dataByType.table[entityId].children[index]),
              preTable: _.cloneDeep(this.dataByType.table[entityId])
            })
            this.$set(this.dataByType.table[entityId].children[index].properties, 'deleted', true)
            this.dataByType.table[entityId].children[index].children && this.dataByType.table[entityId].children[index].children.forEach(m => {
              this.$set(m.properties, 'deleted', true)
            })
            changes.push(change)
            // if (item.properties.KeyGroupType === 'PrimaryKey') {
            let table = this.dataByType.table[entityId]
            setTimeout(() => {
              if (item.properties.KeyGroupType === 'PrimaryKey') {
                this.changeUpRelationType(table, item, changes, change.obj.pre)
              }
            }, 200)
            if (parentKeyRefs.includes(item.properties.Id)) {
              if (item.properties.needDeliver) {
                this.deepDeliver(table, changes, change, true)// 传递
              }
            }
          }
        })
      }

      if (this.$refs.dwMappingRef) {
        this.$refs.dwMappingRef.temporarySave()
        let newDwMapping = this.$refs.dwMappingRef.newDwMapping
        let modDwMapping = this.$refs.dwMappingRef.modDwMapping
        let delDwMapping = this.$refs.dwMappingRef.delDwMapping
        newDwMapping.forEach(item => {
          let change = new (this.Changes)('insertMapping', {
            pId: entityId,
            pName: tableData.properties.Name,
            id: item.properties.Id,
            name: item.properties.Name,
            preTable: _.cloneDeep(this.dataByType.table[entityId])
          })
          if (this.dataByType.table[entityId].children) {
            this.dataByType.table[entityId].children.push(item)
          } else {
            this.dataByType.table[entityId].children = [item]
          }
          change.obj.now = this.dataByType.table[entityId].children[this.dataByType.table[entityId].children.length - 1]
          changes.push(change)
        })
        modDwMapping.forEach(item => {
          item.properties.changed = true
          let index = this.dataByType.table[entityId].children.findIndex(column => column.properties.Id === item.properties.Id)
          let preItem = this.$refs.dwMappingRef.dwMappingBak?.find(i => i.properties.Id === item.properties.Id)
          if (index !== -1) {
            let change = new (this.Changes)('modifyMapping', {
              pId: entityId,
              pName: tableData.properties.Name,
              id: item.properties.Id,
              name: item.properties.Name,
              pre: _.cloneDeep(preItem),
              preTable: _.cloneDeep(this.dataByType.table[entityId]),
              now: null
            })
            this.dataByType.table[entityId].children[index] = item
            change.obj.now = _.cloneDeep(item)
            changes.push(change)
          }
        })
        delDwMapping.forEach(item => {
          let index = this.dataByType.table[entityId].children.findIndex(column => column.properties.Id === item.properties.Id)
          if (index !== -1) {
            let change = new (this.Changes)('deleteMapping', {
              pId: entityId,
              pName: tableData.properties.Name,
              id: item.properties.Id,
              name: item.properties.Name,
              pre: _.cloneDeep(this.dataByType.table[entityId].children[index]),
              preTable: _.cloneDeep(this.dataByType.table[entityId])
            })
            this.$set(this.dataByType.table[entityId].children[index].properties, 'deleted', true)
            changes.push(change)
          }
        })
      }

      let shape = this.dataByType.diagram[this.currentId]?.children.find(shape => shape.properties.OwneeRef === this.rawData.tableMsg.Id)
      let styleChanged = false
      if (shape) {
        if (shape.properties.StyleThemeRef === this.currentStyleRelatedShapeTemplate.StyleThemeRef && this.formatThemeTemplateData(shape.properties).StyleBackColor === this.currentStyleRelatedShapeTemplate.StyleBackColor && this.formatThemeTemplateData(shape.properties).StyleBackColor2 === this.currentStyleRelatedShapeTemplate.StyleBackColor2) {
          // 未发生任何改变，不用存
          styleChanged = false
        } else {
          styleChanged = true
          let change = new (this.Changes)('modifyShape', {
            id: shape.properties.Id,
            name: '-' + this.dataByType.table[shape.properties.OwneeRef].properties.Name,
            pre: _.cloneDeep(shape),
            now: null
          })
          console.log(_.cloneDeep(shape).properties, 'pre')
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
          shape.properties.changed = true
          change.obj.now = _.cloneDeep(shape)
          console.log(change.obj.now, 'now')
          changes.push(change)
        }
      }

      let changed = tablePropertiesChanged || this.requestBody.modCols.length > 0 || this.requestBody.newCols.length > 0 || this.requestBody.modKeyGroups.length > 0 || this.requestBody.newKeyGroups.length > 0 || this.requestBody.delKeyGroups.length > 0 || styleChanged
      if (changed) {
        let cell = this.graph?.graph.getDefaultParent().children.find(cell => cell.OwneeRef === entityId)
        if (cell) {
          cell.value = await this.getTableHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
          cell.changed = true
          if (styleChanged) {
            cell.StyleThemeRef = shape.properties['StyleThemeRef']
            cell.StyleBackColor = shape.properties['StyleBackColor']
            cell.StyleBackColor2 = shape.properties['StyleBackColor2']
          }
          this.graph.graph.getView().refresh()
        }
      }
      if (!this.graph) { // getTableHTMLFunction方法里做了字段排序，在没有画布的时候需要排序
        const dataColumnOrdered = {
          children: []
        }
        let t = this.dataByType.table[entityId]
        if (t.properties.ColumnOrderArrayRefs && t.properties.ColumnOrderArrayRefs.length && JSON.stringify(t.properties.ColumnOrderArrayRefs) !== JSON.stringify(t.children && t.children.filter(i => !i.properties.deleted && i.properties.TypeId === 80000005).map(i => i.properties.Id))) {
          const columnMap = new Map()
          if (t.children) {
            t.children.forEach(item => {
              if (item.properties.TypeId === 80000005) {
                columnMap.set(item.properties.Id, item)
              } else {
                dataColumnOrdered.children.push(item)
              }
            })
            t.properties.ColumnOrderArrayRefs.forEach(item => {
              if (columnMap.get(item)) {
                dataColumnOrdered.children.push(columnMap.get(item))
              }
            })
            t.children = dataColumnOrdered.children
          }
        }
      }
      this.$refs.partitionRef?.$refs.form?.resetFields()
      this.buttonLoading = false
      return changes
      // const successCallback = data => {
      //   if (!data) {
      //     return
      //   }
      //   // 解决添加表后，出现空白tab页的问题
      //   this.$bus.$emit('removeBlankTab')
      //   this.$message.success(this.rawData.appendMode ? '新增成功' : '修改成功')
      //   this.currentVersion = data.currentVersion
      //   this.$bus.$emit('updateTableMessage', data.object)
      //   let model = _.clone(this.rawData.tableMsg)
      //   for (let k in model) {
      //     if (typeof Number.parseInt(k) === 'number' && !isNaN(Number.parseInt(k))) {
      //     } else {
      //       delete model[k]
      //     }
      //   }
      //   this.udpMessage = model
      //   if (this.rawData.appendMode) {
      //     this.$bus.$emit('appendTableToList', data.object)
      //     this.rawData.appendMode = false
      //   } else {
      //     this.$bus.$emit('updateTableToList', data.object)
      //   }
      //   if (this.rawData.editMode) {
      //     this.rawData.editMode = false
      //   }
      //   this.$emit('updateTabName')
      //   this.editMode = false
      //   this.$emit('updateTableData', data.object)
      //   this.$emit('updateVersion', data.currentVersion)
      //   this.$nextTick(() => {
      //     this.onReady()
      //   })
      // }
      // HTTP.updateTableOfModel({
      //   modelId: this.currentModel.id,
      //   modelVersion: this.currentVersion,
      //   requestBody: this.requestBody,
      //   successCallback: data => {
      //     successCallback(data)
      //     if (request) {
      //       this.$http.post(this.$url + '/service/models/' + this.currentModel.id + '/versions', {
      //         modelId: this.currentModel.id,
      //         version: request.version,
      //         description: request.description
      //       }).then(() => {
      //       }).catch(e => {
      //         this.$showFailure(e)
      //       })
      //     }
      //   },
      //   method: this.rawData.appendMode ? 'POST' : 'PUT',
      //   failureCallback: () => {
      //     this.onReady()
      //     this.$refs.indexEditor.prepareTableData()
      //   },
      //   finallyCallback: () => {
      //     this.buttonLoading = false
      //   }
      // })
    },
    caculateDeliverColumnIds (preKeyGroup, nowKeyGroup) {
      let preColumnIds = preKeyGroup?.children?.map(member => member.properties.AttributeRef) || []
      let newColumnIds = nowKeyGroup?.children?.map(member => member.properties.AttributeRef) || []
      let resColumnIds = []
      preColumnIds.forEach(columnId => {
        if (!newColumnIds.includes(columnId)) {
          resColumnIds.push(columnId)
        }
      })
      newColumnIds.forEach(columnId => {
        if (!preColumnIds.includes(columnId)) {
          resColumnIds.push(columnId)
        }
      })
      return resColumnIds
    },
    caculateDeliverParentKeyRef (table) {
      let relations = Object.values(this.dataByType.relation).filter(relation => !relation.properties.deleted && (relation.properties.RelationalType === 'Identifying' || relation.properties.RelationalType === 'NonIdentifying') && relation.properties.ParentEntityRef === table.properties.Id)
      let parentKeyRefs = relations?.map(relation => relation.properties.ParentKeyRef)
      let keyGroup = table?.children?.filter(column => parentKeyRefs?.includes(column.properties.Id))
      let columnIds = table?.children?.filter(column => keyGroup?.reduce((pre, cur) => pre.concat(cur.children?.map(m => m.properties.AttributeRef)), []).includes(column.properties.Id)).map(column => column.properties.Id)
      return {
        parentKeyRefs: parentKeyRefs || [],
        columnIds: columnIds || []
      }
    },
    changeUpRelationType (targetTable, targetPrimaryKey, changes, targetPrimaryKeyPrevious) {
      let relations = Object.values(this.dataByType.relation).filter(relation => !relation.properties.deleted && relation.properties.ChildEntityRef === targetTable.properties.Id && (relation.properties.RelationalType === 'Identifying' || relation.properties.RelationalType === 'NonIdentifying')) // 找到子表的主键关系和非主键关系
      if (targetPrimaryKeyPrevious) { // 仅修改主键的member对应的字段所关联的关系才修改
        let changeAttributeIds = []
        targetPrimaryKey.children?.forEach(member => {
          if (!targetPrimaryKeyPrevious.children?.map(mem => mem.properties.AttributeRef).includes(member.properties.AttributeRef)) {
            changeAttributeIds.push(member.properties.AttributeRef)
          }
        })
        targetPrimaryKeyPrevious.children?.forEach(member => {
          if (!(targetPrimaryKey.properties.deleted ? [] : targetPrimaryKey.children)?.map(mem => mem.properties.AttributeRef).includes(member.properties.AttributeRef)) {
            changeAttributeIds.push(member.properties.AttributeRef)
          }
        })
        relations = relations.filter(relation => {
          let foreignKey = targetTable.children?.find(column => column.properties.Id === relation.properties.ChildKeyRef)
          return foreignKey.children?.map(member => member.properties.AttributeRef).some(columnId => changeAttributeIds.includes(columnId))
        })
      }
      relations.forEach(relation => {
        let foreignKey = targetTable.children.find(keyGroup => keyGroup.properties.Id === relation.properties.ChildKeyRef)
        let foreignKeyMapColumns = foreignKey?.children?.map(member => member.properties.AttributeRef)
        let primaryKeyMapColumns = targetPrimaryKey.properties.deleted ? [] : targetPrimaryKey?.children.map(member => member.properties.AttributeRef)
        let changed = false
        let change = new (this.Changes)('modifyRelation', {
          name: relation.properties.Name,
          pre: _.cloneDeep(relation)
        })
        if (!foreignKeyMapColumns?.length) { // 子表foreignKey为空，不做任何改变
        } else if (foreignKeyMapColumns?.length && foreignKeyMapColumns?.every(columnId => primaryKeyMapColumns.includes(columnId))) { // 外键是主键子集，修改上游关系为主键关系
          if (relation.properties.RelationalType !== 'Identifying') {
            relation.properties.RelationalType = 'Identifying'
            relation.properties.StartCardinality = 'OneOnly'
            changed = true
          }
        } else { // 外键不是主键子集，修改上游关系为非主键关系
          if (relation.properties.RelationalType !== 'NonIdentifying') {
            relation.properties.RelationalType = 'NonIdentifying'
            relation.properties.StartCardinality = 'ZeroOrOne'
            changed = true
          }
        }
        if (changed) {
          relation.properties.changed = true
          change.obj.now = _.cloneDeep(relation)
          changes.push(change)
          let cellList = this.graph.graph.getDefaultParent().children
          let edge = cellList.find(cell => cell.OwneeRef === relation.properties.Id)
          edge.style = this.graph.drawEdgeShapeStyle(edge.Id)
          edge.relationalType = relation.properties.RelationalType
          this.graph.graph.refresh(edge)
        }
      })
    },
    queryDomain (query, cb) {
      // let allDomains = this.$globalData.allDomains
      // let currentQueryDomain = allDomains.filter(item => {
      //   return string.matchKeyword(item, queryString, 'value')
      // })
      // this.currentQueryDomainExists = currentQueryDomain.length > 0
      // cb(currentQueryDomain)

      const obj = {
        domainCode: query,
        chineseName: query,
        domainState: 'A',
        folderId: 1,
        submitter: '',
        firstPublishStart: null,
        firstPublishEnd: null,
        ownerOrg: '',
        orderColumn: ['createTime'],
        ascOrder: [false],
        currentPage: 1,
        pageSize: 10
      }
      this.domainLoading = true
      this.$http.post(`${this.$url}/service/domains/latest/page`, obj).then(res => {
        this.domainLoading = false
        this.currentQueryDomain = res.data.items
        this.currentQueryDomainExists = this.currentQueryDomain.length > 0
        if (this.currentQueryDomainExists) {
          cb(this.currentQueryDomain)
        } else {
          clearTimeout(this.fetchTimer)
          this.fetchTimer = setTimeout(() => {
            // eslint-disable-next-line standard/no-callback-literal
            cb([])
          }, 100)
        }
      }).catch(e => {
        this.$showFailure(e)
      }).finally(() => {
        this.domainLoading = false
      })
    },
    queryDataType (queryString, cb) {
      if (this.drag) {
        cb()
        return
      }
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
    onFocus (index) {
      this.dataTypeSearchMode = false
      this.dataTypeCurrentIndex = index
    },
    onInput () {
      this.dataTypeSearchMode = true
    },
    onSelect (val) {
      let value = val.value
      let index = value.indexOf('(')
      if (index > 0) {
        let dom = $($(this.$refs.tableDetailList.$el).find('tr')[this.dataTypeCurrentIndex + 1]).find('td.data-type input')
        this.dataTypeFocusPrevent = true
        dom.focus()
        setTimeout(() => {
          this.dataTypeFocusPrevent = false
        }, 500)
        dom.click()
        setTimeout(() => {
          dom[0].selectionStart = dom[0].selectionEnd = index + 1
        })
      }
    },
    clearLimitedDomain (bool, scope) {
      if (bool) {
        this.clearDomain(scope)
      }
    },
    handleCNNameTab (scope) {
      if (scope.row.cnName && this.dataByType.namingOption.IsUsingRealTimeTranslate) {
        this.$http.post(this.$url + `/service/nametranslate/`, {
          logicalNames: [scope.row.cnName],
          namingSeperator: this.dataByType.namingOption.NamingSeperator,
          c2e: true,
          categorySet: this.categoryOrder
        }).then(res => {
          if (res.data[0]) {
            this.allCols[scope.$index].name = this.getColumnNameNamingMap(res.data[0])
          }
        }).catch(err => {
          this.$showFailure(err)
        })
      }
    },
    handleTableCNNameTab (cnName, checkRealTimeTranslate) {
      if (cnName && (!checkRealTimeTranslate || (checkRealTimeTranslate && this.dataByType.namingOption.IsUsingRealTimeTranslate))) {
        this.$http.post(this.$url + `/service/nametranslate/`, {
          logicalNames: [cnName],
          namingSeperator: this.dataByType.namingOption.NamingSeperator,
          c2e: true,
          categorySet: this.categoryOrder
        }).then(res => {
          if (res.data[0]) {
            this.requestBody.name = this.getTableNameNamingMap(res.data[0])
          }
        }).catch(err => {
          this.$showFailure(err)
        })
      }
    },
    translateCurrent () {
      if (this.isFocusOnly) {
        let cnName = this.allCols[this.rowIndex].cnName
        if (cnName) {
          this.$http.post(this.$url + `/service/nametranslate/`, {
            logicalNames: [cnName],
            namingSeperator: this.dataByType.namingOption.NamingSeperator,
            c2e: true,
            categorySet: this.categoryOrder
          }).then(res => {
            if (res.data[0]) {
              this.allCols[this.rowIndex].name = this.getColumnNameNamingMap(res.data[0])
            }
          }).catch(err => {
            this.$showFailure(err)
          })
        }
      } else if (this.isFocusArea) {
        this.$http.post(this.$url + `/service/nametranslate/`, {
          logicalNames: this.allCols.filter((item, index) => index >= this.startRow && index <= this.endRow).map(i => i.cnName),
          namingSeperator: this.dataByType.namingOption.NamingSeperator,
          c2e: true,
          categorySet: this.categoryOrder
        }).then(res => {
          for (let i = this.startRow; i <= this.endRow; i++) {
            if (res.data[i - this.startRow]) {
              this.allCols[i].name = this.getColumnNameNamingMap(res.data[i - this.startRow])
            }
          }
        }).catch(err => {
          this.$showFailure(err)
        })
      }
    },
    translateAll () {
      this.$http.post(this.$url + `/service/nametranslate/`, {
        logicalNames: this.allCols.map(i => i.cnName),
        namingSeperator: this.dataByType.namingOption.NamingSeperator,
        c2e: true,
        categorySet: this.categoryOrder
      }).then(res => {
        for (let i = 0; i < this.allCols.length; i++) {
          if (res.data[i]) {
            this.allCols[i].name = this.getColumnNameNamingMap(res.data[i])
          }
        }
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    handleFocusIn (event) {
      clearTimeout(this.focusTimeout)
      this.isFocusOnly = true
      this.rowIndex = +($(event.target).attr('rowindex'))
    },
    handleFocusOut (event) {
      this.focusTimeout = setTimeout(() => {
        this.isFocusOnly = false
      }, 500)
    },
    onKeyPress (evt) {
      let result = $(evt.target)
      if (evt.code === 'ArrowDown') {
        evt.preventDefault()
        if (!result.parents('tr').next().next().next().next().next().next().next().length) {
          $('.el-table__body-wrapper tr.current-row')[0].scrollIntoView({ block: 'center' }) // 滚动当前页面，防止后续数据刷新不到
        }
        clearTimeout(this.pressTimer)
        this.pressTimer = setTimeout(() => {
          evt.target.focus()
        }, 20)
        // this.moveToNextLine(evt.target)
      } else if (evt.code === 'ArrowUp') {
        evt.preventDefault()
        if (!result.parents('tr').prev().prev().prev().prev().prev().prev().prev().length) {
          $('.el-table__body-wrapper tr.current-row')[0].scrollIntoView({ block: 'center' })
        }
        clearTimeout(this.pressTimer)
        this.pressTimer = setTimeout(() => {
          evt.target.focus()
        }, 20)
        // this.moveToNextLine(evt.target, true)
      } else if (evt.code === 'Tab') {
        // if (!$(evt.target).parents('td').hasClass('focus')) {
        this.allCols.forEach(item => {
          item.focusArea = [false, false, false]
        })
        // }
        // let tColumn = (this.tempFocusColumn + 1) % 3
        // if (tColumn < this.tempFocusColumn) {
        //   this.tempFocusRow = this.tempFocusRow + 1
        // }
        // this.tempFocusColumn = tColumn
        // this.allCols[this.tempFocusRow].focusArea.splice(this.tempFocusColumn, 1, true)
      }
    },
    moveToNextLine (dom, toTop) {
      let result = $(dom)
      if (result.attr('fetchsuggestions') && this.currentQueryDomainExists) {
        return
      }
      let className = result.parents('td').attr('class').trim()
      let nextTr = result.parents('tr').next()
      if (toTop) {
        nextTr = result.parents('tr').prev()
      }
      let nextIn = nextTr.find('.' + className)
      let nextInputer = nextIn.find('input')
      if (nextInputer) {
        nextInputer.focus()
      }
    },
    handleOptionSelect (value, row) {
      row['cnName'] = value['chName']
      let domain = this.currentQueryDomain.find(d => d.domainCode === value.domainCode)
      if (domain) {
        domain.inheritType = _.cloneDeep(this.$refs.domainSelector.selectedType)
        this.fillColumnDetailFromDomain(row, domain)
        this.currentQueryDomainExists = false
      }
    },
    callCodeSelector (scope) {
      this.currentRow = this.allCols[scope.$index]
      this.currentScope = scope
      this.$refs.domainCodeSelector.openDialog(this.currentRow.dataStandardCode)
    },
    clearCode (scope) {
      scope.row.dataStandardCode = ''
      this.allCols[scope.$index].dataStandardCode = ''
    },
    handleCodeSelected (code) {
      this.$refs.domainCodeSelector.closeDialog()
      this.currentRow.dataStandardCode = code.code
      this.currentScope.row.dataStandardCode = code.code
    },
    callDomainSelector (scope) {
      this.currentRow = this.allCols[scope.$index] // 因为采用pl-table导致scope.row返回的不是最新的allCols数据
      this.$refs.domainSelector.openDialog()
    },
    handleDomainSelector (domain) {
      this.$refs.domainSelector.closeDialog()
      this.fillColumnDetailFromDomain(this.currentRow, domain)
    },
    fillColumnDetailFromDomain (row, domain) {
      this.$set(row, 'domainId', domain.id)
      this.$set(row, 'domainName', domain.chName)
      this.domainIdToName[domain.id] = domain.chName
      if (domain.referenceCode) {
        this.$set(row, 'dataStandardCode', domain.referenceCode)
      }
      // this.$set(row, 'dataStandardCode', domain.referenceCode)
      // this.currentRow.dataStandardCode = domain.referenceCode
      let { inheritType } = domain
      if (inheritType.includes('description')) {
        row['description'] = domain['description']
      }
      if (inheritType.includes('chName')) {
        row['cnName'] = domain['chName']
      }
      if (inheritType.includes('abbrivation')) {
        row['name'] = domain['abbrivation']
      }
      if (inheritType.includes('dataType')) {
        this.reNameColumnType(row, 'dataType', domain)
        // if (domain['dataScale']) {
        //   row['dataType'] = domain['dataType'] + '(' + domain['dataScale'] + ')'
        // } else {
        //   row['dataType'] = domain['dataType']
        // }
      }
      if (inheritType.includes('notNull')) {
        row['notNull'] = domain['notNull']
      }
      if (inheritType.includes('enName')) {
        row['enName'] = domain['enName']
      }
    },
    async handlePkSelectionChange () {
      // if (this.caculating && this.caculatingTimer) {
      //   return
      // }
      // this.caculating = true
      // this.caculatingTimer = setTimeout(() => {
      //   this.caculating = false
      //   this.caculatingTimer = null
      // }, 500)
      let pk = []
      this.allCols.forEach((item, index) => {
        if (this.pkSelection[index]) {
          pk.push(item.elementId)
          item.notNull = true
        }
      })
      this.pk = pk
      const index = this.$refs.indexEditor.indexS
      let primaryKey = index.find(item => item.properties.KeyGroupType === 'PrimaryKey' && !item.properties.deleted)
      if (primaryKey) {
        if (!primaryKey.children) {
          primaryKey.children = []
        }
        let children = []
        pk.forEach(columnId => {
          let member = primaryKey.children.find(member => member.properties.AttributeRef === columnId)
          if (member) {
            children.push(member)
          } else {
            children.push({
              objectClass: 'Datablau.LDM.EntityKeyGroupMember',
              properties: {
                AttributeRef: columnId,
                Id: this.deliverNum.seed++,
                OrderType: 'Ascending',
                UniqueId: uuidv4(),
                TypeId: 80500001,
                Name: this.allCols.filter(
                  item => item.elementId === columnId
                )[0].name,
                new: true
              }
            })
          }
        })
        primaryKey.children = children
        primaryKey.properties.KeyGroupMemberRefs = children.map(column => column.properties.Id)
      } else {
        let keyId = 1
        if (index && index.length) {
          let name = index[index.length - 1].properties.Name
          keyId = parseInt(name.slice(name.search(/\d+$/)))
        }
        let children = pk.map(columnId => ({
          objectClass: 'Datablau.LDM.EntityKeyGroupMember',
          properties: {
            AttributeRef: columnId,
            Id: this.deliverNum.seed++,
            OrderType: 'Ascending',
            UniqueId: uuidv4(),
            TypeId: 80500001,
            Name: this.allCols.filter(
              item => item.elementId === columnId
            )[0].name,
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
            // Name: this.dataByType.namingOption.PKDefaultMacro.replace(/%owner%/, this.rawData.tableMsg.Name).replace(/%keyid%/, '' + (keyId++)),
            RawType: 'KeyGroup',
            TypeId: 80000093,
            UniqueId: uuidv4(),
            new: true
          }
        }
        let maxPost = this.indexSArr.filter(i => !i.properties.deleted && i.objectClass === 'Datablau.LDM.EntityKeyGroup').length
        this.indexSArr.forEach(item => {
          if (item.objectClass === 'Datablau.LDM.EntityKeyGroup') {
            if (item.properties.Name && item.properties.Name.search(/(\d+)$/) !== -1) {
              let post = Number.parseInt(item.properties.Name.slice(item.properties.Name.search(/(\d+)$/)))
              if (post > maxPost) {
                maxPost = post
              }
            }
          }
        })
        primaryKey.properties.Name = this.getIndexNameNamingMap(primaryKey.properties.Macro, this.requestBody.name, (maxPost + 1))
        index.push(primaryKey)
        this.$set(this.rawData, 'pk', [primaryKey])
      }
      // 点击主键提交一条保存记录，因为主键member会删除无法恢复
      // let changes = await this.save()
      // let data = new (this.LayerEdit)(changes)
      // if (changes && changes.length) {
      //   this.dataByType.table[this.rawData.tableMsg.Id].properties.changed = true
      //   this.graph.editor.undoManager.undoableEditHappened(data)
      //   setTimeout(() => {
      //     this.$parent.$parent.afterHandleDialogData(this.rawData.tableMsg.Id, true)
      //   }, 200)
      // }
    },
    getIndexSArr (arr) {
      this.indexSArr = arr
    },
    updateIndexNotEmpty (newValue) {
      this.indexNameNotEmpty = newValue
    },
    entitySortChange () {

    },
    getConfig () {
      return typeof this.currentModel.limitedDsApplyConfig === 'string' ? JSON.parse(this.currentModel.limitedDsApplyConfig) : this.currentModel.limitedDsApplyConfig
    },
    getEntityData () {
      let result = Object.values(this.dataByType.table).filter(i => !i.properties.deleted && i.properties.TypeId === 80000004)
      this.business.total = result.length
      this.entityData = result.map(item => ({
        ...item,
        key: item.properties.Id,
        label: item.properties.Name + (item.properties.LogicalName ? '（' + item.properties.LogicalName + '）' : ''),
        disabled: !this.editMode
      }))
    },
    moreClick () {
      this.moreShow = !this.moreShow
    }
  },
  watch: {
    tableDialogKey () {
      // this.entityQuery = ''
      // this.business.currentPage = 1
      // this.$refs.entityTable.clearSelection()
      // this.$nextTick(() => {
      //   if (this.requestBody.CommonMemberRefs) {
      //     this.requestBody.CommonMemberRefs.split(',').map(id => this.entityData.find(i => i.properties.Id === parseInt(id))).forEach(row => {
      //       this.$refs.entityTable.toggleRowSelection(row, true)
      //     })
      //   }
      // })
    },
    editMode (val) {
      // if (this.$refs.indexEditor) {
      //   this.$refs.indexEditor.editMode = val
      // }
      this.getEntityData()
      this.calculateTableHeight()
      if (val && this.activeTab === 'Code') {
        this.activeTab = 'column'
      }
    },
    'rawData.editMode': {
      deep: true,
      handler: function () {
        this.editMode = this.rawData.appendMode || this.rawData.editMode
      }
    },
    activeTab (tab) {
      if (tab === 'column') {
        this.calculateTableHeight()
      }
      if (tab === 'index' && this.columnAdd) {
        this.rawData.columnsMsg = this.allCols.map(item => ({
          objectClass: 'Datablau.LDM.EntityAttribute',
          properties: {
            ...item.allUdps,
            DataType: item.dataType,
            Id: item.elementId,
            IsNotNull: item.notNull,
            Name: item.name,
            RawType: 'Attribute',
            TagCode: item.dataStandardCode,
            TypeId: 80000005,
            LogicalName: item.cnName,
            DefaultVal: item.defaultVal,
            Definition: item.description,
            IsLogicalOnly: item.logicalOnly,
            IsAutoIncrement: item.IsAutoIncrement,
            StartingValue: item.StartingValue,
            IsPhysicalOnly: item.physicalOnly,
            DataStandardRef: item.domainId,
            changed: item.changed,
            deleted: item.deleted
          }
        }))
      }
    }
    // allCols () {
    //   this.pkSelection.length = this.allCols.length
    //   this.allCols.forEach((item, index) => {
    //     this.pkSelection[index] = this.pk.indexOf(item.elementId) > -1
    //   })
    // }
  },
  computed: {
    computedTopStyle () {
      // 根据条件计算top值
      if (this.rawData.editMode === true || this.rawData.appendMode) {
        if (this.rawData.tableMsg.TypeId === 80100073) {
          return { top: '100px' }
        } else {
          return { top: '180px' }
        }
      } else if (this.typeDataWareHouse && this.editMode) {
        return { top: '55px' }
      } else if (this.rawData.visible) {
        if (this.moreShow) {
          return { top: '166px' }
        } else {
          return { top: '100px' }
        }
      } else {
        return { top: '100px' }
      }
    },
    // entityData () {
    //   if (this.entityQuery) {
    //     let result = []
    //     for (let key in this.dataByType.table) {
    //       let i = this.dataByType.table[key]
    //       if (!i.properties.deleted && i.properties.TypeId === 80000004 && string.matchKeyword(i.properties, this.entityQuery, 'Name', 'LogicalName')) {
    //         result.push(i)
    //       }
    //     }
    //     // let result = Object.values(this.dataByType.table).filter(i => !i.properties.deleted && i.properties.TypeId === 80000004 && string.matchKeyword(i.properties, this.entityQuery, 'Name', 'LogicalName'))
    //     this.business.total = result.length
    //     return result.map(item => ({
    //       ...item,
    //       key: item.properties.Id
    //     }))
    //   } else {
    //     let result = []
    //     for (let key in this.dataByType.table) {
    //       let i = this.dataByType.table[key]
    //       if (!i.properties.deleted && i.properties.TypeId === 80000004) {
    //         result.push(i)
    //       }
    //     }
    //     // let result = Object.values(this.dataByType.table).filter(i => !i.properties.deleted && i.properties.TypeId === 80000004)
    //     this.business.total = result.length
    //     return result.map(item => ({
    //       ...item,
    //       key: item.properties.Id
    //     }))
    //   }
    // },
    // entityShowData () {
    //   return this.entityData.slice((this.business.currentPage - 1) * this.business.pageSize, this.business.currentPage * this.business.pageSize)
    // },
    requiredFormNotEmpty () {
      const columnsNotEmpty = this.allCols.every(item => {
        return !!_.trim(item.name) && !!_.trim(item.dataType)
      })
      return !!_.trim(this.requestBody.name) && columnsNotEmpty && this.indexNameNotEmpty
    },
    udpMessageDisplay () {
      const udpMessage = this.udpMessage
      const udpMessageDisplay = new Map()
      let udpList = [...this.dataByType.udp.values()].filter(item => !item.deleted && item.entityType === this.rawData.tableMsg.TypeId)
      if (udpList.some(item => item.UDPOrder)) {
        udpList.sort((a, b) => {
          return +a.UDPOrder - +b.UDPOrder
        })
      }
      udpList.forEach(udpDetail => {
        let k = udpDetail.Id
        if (udpMessage[k] !== undefined) {
          if (!udpDetail.PageName) {
            let obj = udpMessageDisplay.get(udpDetail.ClassName || '')
            if (obj) {
              obj.set(k, udpMessage[k])
            } else {
              udpMessageDisplay.set(udpDetail.ClassName || '', new Map([[k, udpMessage[k]]]))
            }
          }
        }
      })
      return udpMessageDisplay
    },
    udpMessagePageDisplay () {
      const udpMessage = this.udpMessage
      const udpMessagePageDisplay = new Map()

      let udpList = [...this.dataByType.udp.values()].filter(item => !item.deleted && item.entityType === this.rawData.tableMsg.TypeId)
      if (udpList.some(item => item.UDPOrder)) {
        udpList.sort((a, b) => {
          return +a.UDPOrder - +b.UDPOrder
        })
      }
      udpList.forEach(udpDetail => {
        let k = udpDetail.Id
        if (udpMessage[k] !== undefined) {
          if (udpDetail.PageName) {
            let pageMap = udpMessagePageDisplay.get(udpDetail.PageName)
            if (pageMap) {
              let obj = pageMap.get(udpDetail.ClassName || '')
              if (obj) {
                obj.set(k, udpMessage[k])
              } else {
                pageMap.set(udpDetail.ClassName || '', new Map([[k, udpMessage[k]]]))
              }
            } else {
              udpMessagePageDisplay.set(udpDetail.PageName, new Map([[udpDetail.ClassName || '', new Map([[k, udpMessage[k]]])]]))
            }
          }
        }
      })
      return udpMessagePageDisplay
    },
    columnsUdpDisplay () {
      const columnsUdpKeys = this.columnsUdpKeys
      const columnsUdpDisplay = new Map()

      let udpList = [...this.dataByType.udp.values()].filter(item => !item.deleted && item.entityType === 80000005)
      if (udpList.some(item => item.UDPOrder)) {
        udpList.sort((a, b) => {
          return +a.UDPOrder - +b.UDPOrder
        })
      }
      udpList.forEach(udpDetail => {
        let k = udpDetail.Id
        columnsUdpDisplay.set(k, udpDetail)
      })
      return columnsUdpDisplay
    }
  }
}
