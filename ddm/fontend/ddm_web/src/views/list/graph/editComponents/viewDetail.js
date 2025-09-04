import dataStandardCodeDetail from '@/views/list/tables/dataStandardCodeDetail.vue'
import indexEditor from './indexEditor.vue'
import datablauChecked from '@/views/list/tables/datablauChecked.vue'
import udpValidaterInput from '@/views/list/tables/udpValidaterInput.vue'
import datablauTooltip from '@/components/common/tooltip.vue'
import DomainCodeSelector from '@/components/selector/DomainCodeSelector'
import DomainSelector from '@/components/selector/NewDomainSelector'
import CheckInVersion from '@/views/list/tables/CheckInVersion.vue'
// import exportJpa from '@/views/list/script/jpaClass/exportJpa.vue'
import exportDdl from '@/views/list/tables/ddl/exportDDL.vue'
import udpSetting from '@/views/list/graph/editComponents/udpSetting.vue'
import domainPopover from '@/views/list/graph/editComponents/domainPopover'
import $ from 'jquery'
import $version from '@/resource/version.json'
import string from '@/resource/utils/string'
import $const from '@/resource/const'
import _ from 'lodash'
import tableImg from '@/assets/images/tables/table.svg'
import viewImg from '@/assets/images/mxgraphEdit/View.svg'
import editIcon from '@/assets/images/er/icons/icon-edit.png'
import opacityComponent from './opacityComponent.vue'
import translateImg from '@/assets/images/mxgraphEdit/translate.svg'
import translateActiveImg from '@/assets/images/mxgraphEdit/translate-active.svg'
import shrinkImg from '@/assets/images/mxgraphEdit/shrink.svg'
import shrinkActiveImg from '@/assets/images/mxgraphEdit/shrink-active.svg'
import expandImg from '@/assets/images/mxgraphEdit/expand.svg'
import expandActiveImg from '@/assets/images/mxgraphEdit/expand-active.svg'
// import PinyinMatch from 'pinyin-match'
import inElectron from '@/resource/utils/environment'
import LDMTypes from '@constant/LDMTypes'
import { v4 as uuidv4 } from 'uuid'
export default {
  props: ['rawData', 'currentModel', 'dataByType', 'isLogicalModel', 'getViewHTMLFunction', 'graph', 'Changes', 'cellDialogData', 'currentStyleRelatedShapeTemplate', 'formatThemeTemplateData', 'currentId', 'getTableNameNamingMap', 'getColumnNameNamingMap', 'getIndexNameNamingMap', 'categoryOrder', 'isShowSchema', 'TypeUniqueIdToColumnDefaultType', 'deliverNum', 'isDesignModel', 'editorType', 'typeDataWareHouse', 'reNameColumnType', 'loading'],
  components: {
    dataStandardCodeDetail,
    indexEditor,
    datablauChecked,
    datablauTooltip,
    DomainCodeSelector,
    DomainSelector,
    udpValidaterInput,
    CheckInVersion,
    exportDdl,
    opacityComponent,
    udpSetting,
    domainPopover
  },
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
      SQL: ''
    }

    const obj = this.prepareTableUdps(requestBody)
    const obj1 = this.prepareColumnUdps(requestBody)
    if (this.isDesignModel) {
      requestBody.logicalOnly = null
    } else {
      requestBody.physicalOnly = null
    }

    let contentValidate = (rule, value, callback) => {
      value = _.trim(this.requestBody.name)
      if (!value) {
        callback(new Error('视图名是必填的'))
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          this.$showFailure('视图名是必填的')
        }, 200)
      } else {
        callback()
      }
    }
    let columnNameValidate = (rule, value, callback) => {
      if (!value) {
        callback(new Error('字段名是必填的'))
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          this.$showFailure('字段名是必填的')
        }, 200)
      } else {
        if (this.checkColIsDuplicate2(value)) {
          callback(new Error(`字段名 ${value}重名`))
          clearTimeout(this.timer)
          this.timer = setTimeout(() => {
            this.$showFailure(`字段名 ${value}重名`)
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
      lodash: _,
      inElectron,
      viewUsedImg: require('../../../../assets/images/mxgraphEdit/view-used.svg'),
      shrink: this.editorType === 'model',
      editMode: null,
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
      allCols: null,
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
      activeTool: 'jpa',
      buttonLoading: false,
      currentRow: null,
      writable: this.$store.state.lic.editor && (this.$store.state.user.isAdmin || this.currentModel.permission?.editor),
      admin: this.currentModel.permission.admin,
      rules: {
        tableName: {
          required: true,
          validator: contentValidate,
          trigger: ['change', 'blur']
        },
        columnName: {
          required: true,
          validator: columnNameValidate,
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
      sqlOption: {
        OptionOptionWithOwner: false,
        OptionOptionWithDelimiter: false
      },
      schema: [],
      domainLoading: false,
      domainOptions: [],
      editIcon,
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
      expandActive: false,
      shrinkImg,
      shrinkActiveImg,
      expandImg,
      expandActiveImg,
      translateActive: false,
      translateActive1: false,
      translateActive2: false,
      translateImg,
      translateActiveImg,
      isFocusOnly: false
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
    this.onReady()
    $(window).resize(this.handleResize)
    this.$bus.$on('updateDomains', () => {
      // this.tableKey++
      this.highlightRow()
    })
  },
  beforeDestroy () {
    if (this.editorType === 'table' && this.editMode) {
      this.unLockModel()
    }
    $(window).unbind('resize', this.handleResize)
    this.$bus.$off('updateDomains')
  },
  beforeRouteLeave (to, from, next) {
  },
  methods: {
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
                dels: table.children ? table.children.filter(column => (column.objectClass === 'Datablau.LDM.EntityKeyGroup' && column.properties.deleted && !column.properties.new)).map(column => column.properties.Id) : null
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
          this.$http.post(this.$url + '/service/models/' + this.currentModel.id + '/versions', {
            modelId: this.currentModel.id,
            version: request.version,
            description: request.description
          }).then(() => {
            let data = res.data
            // 解决添加表后，出现空白tab页的问题
            if (this.rawData.appendMode) {
              this.$bus.$emit('removeBlankTab', this.rawData.tableMsg.Id)
            }
            this.currentVersion = data.currentVersion
            this.$bus.$emit('update-model', res.data.objects) // 更新模型
            setTimeout(() => { // 避免update-model后返回，覆盖handleDialogData数据，导致children不存在
              if (!this.rawData.appendMode) {
                this.$emit('handleDialogData', this.rawData.tableMsg.Id, false, true)
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
        this.dataByType.view[this.rawData.tableMsg.Id] = this.viewDataBak
        this.$showFailure(e)
      }).finally(() => {
        if (this.loading) {
          this.loading.status = false
        } else {
          this.buttonLoading = false
        }
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
    goToEdit () {
      if (this.$store.state.lic.editor) {
        this.$http.put(`${this.$url}/service/editor/${this.currentModel.id}/lock`).then(res => {
          if (res.data) {
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
    go2Domain (id) {
      // window.open(`${HTTP.getDamLoginUrl()}#/ddm/main/dataStandard?ddmFirst=true&domainId=${id}`)
      const pos = location.href.indexOf('#/')
      const baseUrl = location.href.slice(0, pos + 2)
      window.open(`${baseUrl}main/dataStandard?domain=${id}`)
    },
    formatColumnName (row) {
      row.name = this.getColumnNameNamingMap(row.name)
    },
    changeAbsoluteTop () {
      $('.content-box.is-edit').css('top', $('.view.position-hint')[0].offsetTop + 'px')
    },
    formatViewName () {
      this.requestBody.name = this.getTableNameNamingMap(this.requestBody.name)
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
    changeDomainId (domainCode, scope) {
      scope.row.domainId = domainCode
      let domain = this.domainOptions.find(d => d.domainCode === domainCode)
      if (domain) {
        domain.inheritType = _.cloneDeep(this.$refs.domainSelector.selectedType)
        this.currentRow = scope.row
        this.fillColumnDetailFromDomain(this.currentRow, domain)
      }
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
      this.$emit('changeDialogWidth', '600px')
    },
    resetStyleConfirm () {
      this.currentStyleRelatedShapeTemplate['StyleBackColor'] = ''
      this.currentStyleRelatedShapeTemplate['StyleBackColor2'] = ''
      this.currentStyleRelatedShapeTemplate['StyleThemeRef'] = null
    },
    createSQL () {
      let sqlOption = this.sqlOption
      let dataByType = this.dataByType
      let viewId = this.rawData.tableMsg.Id
      let view = this.dataByType.view[viewId]
      let viewCols = _.cloneDeep(this.rawData.columnsMsg)
      let viewRefstrs = []
      let refTableNames = []
      let schemaObj = dataByType.schema
      const BreakReturn = '\r\n'
      const Tab = '\t'
      const Blank = ' '
      const Dot = '.'

      // if (dataByType.model.TypeUniqueId.toUpperCase() === 'AA8FBE2F-EC17-48B4-B7F1-A9AC47525D3F') {
      //   alert('尚不支持该数据库')
      // }
      function getOwnerName (entity) {
        if (sqlOption && sqlOption.OptionOptionWithOwner) {
          // if (entity.objectClass !== 'Datablau.LDM.EntityView') {
          if (schemaObj[entity.properties.SchemaRef]) {
            return getQuotedName(schemaObj[entity.properties.SchemaRef].properties.Name) + Dot
          }
          // }
        }
        return ''
      }

      function getQuotedName (name) {
        let databaseId = dataByType.model.TypeUniqueId.toUpperCase()
        let delimiter1 = ''
        let delimiter2 = ''
        switch (databaseId) {
          case '076733BE-EE09-4BBA-8ADB-5D2B48036A42':
          case '16C864E9-1492-6D39-7E47-763067512DC2':
          case '2CE303DB-DE63-7696-8A71-041AF6EB772B':
          case '139A6B8F-3D10-4C0E-BA3D-8B43131EF06A':
          case 'ADECDAAC-D24B-4081-94E2-9D6217ECC5AA':
          case 'B6A80960-849E-491E-9283-2042405FBA29':
          case '8CE0D4A7-ADAC-4244-A944-EA74815F5AB8':
          case '0F691FA0-3FD7-42F1-B868-051B0FFAD10C':
          case 'AA8FBE2F-EC17-48B4-B7F1-A9AC47525D3F':
          case '45C7074A-0C6E-4B0B-9EF8-6C6FA5242bC0':
          case 'A5277112-1079-4D90-89E6-A46F00C6C7F0':
          case 'DF57529D-3918-42AA-BC8D-092C2B7C12B4':
          case '5053D067-62BB-f7AE-7971-F28AC8FDD44B':
          case 'B3FA9413-2E92-4927-BC44-AE81EC7D3C8A':
          case 'D6AEBD39-31B0-455F-93E7-41FE9574FC03':
          case 'DDF64306-F260-4BDE-BFF5-F3EAE2EBF489':
          case 'DA68C3BE-EAFC-5CEA-99E6-FE9EF5129549':
            delimiter1 = delimiter2 = '`'

            break
          case '0DD030E7-9412-4ACE-9ED7-E1225DBA2855':
          case '1333DCA6-0D18-195A-6EE0-E6FB0D3666FF':
          case 'F2B1C0D4-1E4E-4CE4-9C98-988191D63C55':
          case '2022EC9E-15F5-DEFF-32B0-DCFABCCDE3EF':
          case 'F3901084-5B9A-4776-86E9-FDEE6F7F87B7':
          case '4091BC89-EEBB-4E1D-866B-A47707804417':
          case '84A19E0F-9937-4B5C-8E55-B1AE54BF9352':
          case '2C85C9CA-D052-467C-8C55-D367D69982CF':
          case '67AE3EBF-8D3B-4E6C-93F5-E35E6CF32C8E':
          case '6D977600-5D0D-441B-A85A-D682827D696C':
          case '597095CA-993C-4EF9-8AEE-48E87F7EE7E2':
          case 'b86fdec4-da62-4ee2-8c65-1bc221d2a578':
          case '097618F2-3A1D-4D4F-A31C-E138217A486A':
          case '8EA840A5-37F4-48F8-82D9-1429E42A0FC6':
          case 'E8FDD9F9-2D5F-456D-A5F4-DE6C17025E23':
          case 'C14A95B1-5FA3-4F1A-9B04-2507E8C96ADE':
          case 'AC2CC521-CFC3-44BD-A838-4CB5E59E856B':
            delimiter1 = delimiter2 = '"'

            break
          case '998E48F9-FFEC-4473-A7A0-754C055C0953':
            delimiter1 = '['
            delimiter2 = ']'

            break
          case '2780503F-7DC1-4C75-9ADF-14A8D87AB388':
            delimiter1 = delimiter2 = ''
            break
        }
        // if (delimiter1 === '') { 有的delimiter是空字符串
        //   throw new Error('没有当前数据库的引用符号')
        // }
        // 有with delimiter配置时，根据数据库类型获取相应的界定符并添加上
        if (sqlOption.OptionOptionWithDelimiter) {
          name = `${delimiter1}${name}${delimiter2}`
        }
        return name
      }
      // 通过视图字段引用的实体表字段id找到实体表
      function getColRefTable (refColId) {
        let tableObj = dataByType.table
        let table = null
        let colName = null
        for (let tableId in tableObj) {
          if (tableObj.hasOwnProperty(tableId)) {
            console.log(tableObj[tableId], 'table')
            if (tableObj[tableId].children) {
              tableObj[tableId].children.some(v => {
                if (v.objectClass === 'Datablau.LDM.EntityAttribute' && v.properties.Id === refColId) {
                  table = tableObj[tableId]
                  colName = v.properties.Name
                  return true
                }
              })
            }
          }
        }
        return { table, colName }
      }
      // 找到与当前视图有视图关系的所有表的名字
      function getViewRefTable () {
        let relationObj = dataByType.relation
        for (let id in relationObj) {
          if (relationObj.hasOwnProperty(id)) {
            let { ChildEntityRef, ParentEntityRef } = relationObj[id].properties
            if (ChildEntityRef === viewId) {
              if (relationObj[id].objectClass === 'Datablau.LDM.RelationshipView' && !relationObj[id].properties.deleted) {
                if (dataByType.table[ParentEntityRef]) {
                  refTableNames.push(getOwnerName(dataByType.table[ParentEntityRef]) + getQuotedName(dataByType.table[ParentEntityRef].properties.Name))
                } else {
                  refTableNames.push(getOwnerName(dataByType.view[ParentEntityRef]) + getQuotedName(dataByType.view[ParentEntityRef].properties.Name))
                }
              }
            }
          }
        }
      }
      function mapReftableToViewCols () {
        viewCols.forEach(v => {
          // 通过视图字段引用的实体表字段id找到对应的实体表
          if (v.properties.Reference) {
            let obj = getColRefTable(v.properties.Reference)
            let { table, colName } = obj
            v.tableSchema = table !== null && schemaObj[table.properties.SchemaRef] && !schemaObj[table.properties.SchemaRef].properties.deleted ? schemaObj[table.properties.SchemaRef].properties.Name : ''
            v.tableName = table !== null ? table.properties.Name : ''
            v.refColName = colName || ''
            v.ownerFullName = `${v.tableSchema && sqlOption.OptionOptionWithOwner ? getQuotedName(v.tableSchema) + '.' : ''}${getQuotedName(v.tableName)}.${getQuotedName(v.refColName)}`
            if (v.properties.Text) {
              viewRefstrs.push(v.properties.Text)
            } else
            if (v.refColName) {
              // 有引用字段并且找到引用的表时
              viewRefstrs.push(v.ownerFullName)
            }
          } else if (v.properties.Text) {
            // 只有表达式但是没引用的时候
            viewRefstrs.push(v.properties.Text)
          }
        })
      }
      mapReftableToViewCols()
      getViewRefTable()
      if (viewCols.length === 0) {
        return ''
      }
      let sql =
`CREATE VIEW${Blank}${getOwnerName(view)}${getQuotedName(view.properties.Name)}
\t(${viewCols.map(v => v.properties.Name).join(',')})
AS
SELECT
\t${viewRefstrs.join(`,${BreakReturn}${Tab}`)}
FROM
\t ${refTableNames.join(',')}
`
      this.requestBody.SQL = sql
    },
    editRow (rowData) {
      this.$emit('openViewColumnDialog', {
        tableId: this.rawData.tableMsg.Id,
        colId: rowData.elementId
      })
    },
    clearDomain (scope) {
      scope.row.domainId = null
      scope.row.domainName = null
    },
    tableRowClassName (scope) {
      if (scope.row.deleted) {
        return 'hide-entity-row'
      } else {
        return ''
      }
    },
    tableCellClassName ({ row, column, rowIndex, columnIndex }) {
      if (row.focusArea && row.focusArea[this.columnNameToFocusAreaPosition[column.property]]) {
        return 'focus'
      } else {
        return ''
      }
    },
    limitedDsApplyMessage (showMessage) {
      if (showMessage) {
        this.$message.warning('此字段引用了数据标准，强管控模式下不允许修改此表单项，请先取消对数据标准的引用')
      }
    },
    onReady () {
      this.prepareTableUdps(this.requestBody)
      let obj1 = this.prepareColumnUdps(this.requestBody)
      this.columnsUdpKeys = obj1.udpMessage
      this.calculateYOfBottom()
      this.getPkColumnIds()
      this.prepareRequestBody()
      this.getSchemaList()
      this.tableKey++
      setTimeout(() => {
        this.editIndex()
      })
    },
    cancel () {
      this.unLockModel()
      // this.rawData = this.rawDataBak
      // this.onReady()
      this.$emit('handleDialogData', this.rawData.tableMsg.Id, false, true) // 注释掉前两行，而用这一行的原因是需要重新获取下最新数据，不用之前老数据rawData，因为rawData在点击保存成功后会被更新，但rawDataBak不会被更新，需要调用handleDialogData来更新rawDataBak
      if (this.rawData.appendMode) {
        delete this.dataByType.view[this.rawData.tableMsg.Id]
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
        if (item.entityType === 80500008) {
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
      if (this.$refs.tableDetailList && this.$refs.tableDetailList.doLayout) {
        this.$nextTick(this.$refs.tableDetailList.doLayout)
      }
      this.calculateYOfBottom()
    },
    getPkColumnIds () {
      this.pk = []
      this.fk = []
      Array.isArray(this.rawData.pk) && this.rawData.pk.forEach(p => {
        Array.isArray(p.children) && p.children.forEach(k => {
          this.pk.push(k.properties['AttributeRef'])
        })
      })
      Array.isArray(this.rawData.fk) && this.rawData.fk.forEach(p => {
        Array.isArray(p.children) && p.children.forEach(k => {
          this.fk.push(k.properties['AttributeRef'])
        })
      })
    },
    isNotNullFormatter (row, col) {
      let val = row.properties[col.property.split('.')[1]]
      if (val === true || this.pk.indexOf(row.properties.Id) > -1) {
        return '非空'
      } else {
        return ''
      }
    },
    handleCellMouseEnter (row, column) {
      this.tempRow = this.allCols.findIndex(item => item.elementId === row.elementId)
      this.tempColumn = this.columnNameToFocusAreaPosition[column.property]
      if (this.drag) {
        if (this.dragStart.row !== -1) {
          let tempRow = this.allCols.findIndex(item => item.elementId === row.elementId)
          let tempColumn = this.columnNameToFocusAreaPosition[column.property]
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
            await this.$confirm(`是否创建新字段？`, '', {
              type: 'warning'
            })
            for (let i = 0; i <= rows.length - (this.allCols.length - rowStart); i++) {
              this.addColumn()
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
            await this.$confirm(`是否创建新字段？`, '', {
              type: 'warning'
            })
            for (let i = 0; i <= rows.length - (this.allCols.length - rowStart); i++) {
              this.addColumn()
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
      let i = scope.$index
      let j = this.columnNameToFocusAreaPosition[scope.column.property]
      let borderClass = ''
      if (scope.row.focusArea && scope.row.focusArea[j]) { // 需要边框
        if (!this.allCols[i - 1] || (this.allCols[i - 1] && !this.allCols[i - 1].focusArea[j])) { // 需要上边框
          borderClass += 'top '
        }
        if (!this.allCols[i + 1] || (this.allCols[i + 1] && !this.allCols[i + 1].focusArea[j])) { // 需要上边框
          borderClass += 'bottom '
        }
        if (!scope.row.focusArea[j - 1]) {
          borderClass += 'left '
        }
        if (!scope.row.focusArea[j + 1]) {
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
      this.requestBody.SchemaRef = this.rawData.tableMsg.SchemaRef
      this.requestBody.SQL = this.rawData.tableMsg.SQL
      //  检查schema是否被删除,删除则清空当前schema
      if (this.dataByType.schema) {
        if (Object.values(this.dataByType.schema).filter(i => !i.properties.deleted).every(v => v.properties.Id !== this.requestBody.SchemaRef)) {
          this.requestBody.SchemaRef = ''
        }
      }
      if (this.isDesignModel) {
        this.requestBody.logicalOnly = this.rawData.tableMsg.IsLogicalOnly
      } else {
        this.requestBody.physicalOnly = this.rawData.tableMsg.IsPhysicalOnly
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
        this.columnsUdpKeys && this.columnsUdpKeys.forEach(i => {
          body.allUdps[String(i)] = item.properties[i] === undefined ? null : item.properties[i]
        })
        this.allCols.push(body)
      })
      this.allColsInitial = _.cloneDeep(this.allCols)
      try {
        let res = await this.$http({
          url: this.$url + '/service/domains/namemap',
          method: 'post',
          data: this.rawData.columnsMsg.map(item => item.properties.DataStandardRef).filter(domainId => domainId)
        })
        let domainIdToName = res.data
        this.rawData.columnsMsg.forEach((item, index) => {
          if (this.allCols[index].domainId) {
            this.$set(this.allCols[index], 'domainName', domainIdToName[item.properties.DataStandardRef])
          }
        })
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
    addColumn () {
      let maxId = this.getMaxId(this.allCols)
      maxId = isNaN(maxId) || maxId === -Infinity ? 0 : maxId
      let body = {
        name: this.getColumnNameNamingMap('Column_' + ++maxId),
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
          $('.el-table__body-wrapper').scrollTop(10000000)
          $('.el-table__body-wrapper tr:last-child input')[0].focus()
        })
      }, 100)
      this.columnAdd = true
    },
    deleteRow (row, index) {
      const col = this.allCols[index]
      const remove = () => {
        // this.allCols.splice(index, 1)
        this.$set(col, 'deleted', true)
        // col.deleted = true
        this.$bus.$emit('removeColumnFromIndexSelectionList', index)
      }
      if (col.elementId) {
        this.updateIndexCausedByDeleteColumn(col, remove)
      } else {
        remove()
      }
    },
    updateIndexCausedByDeleteColumn (col, callback) {
      const columnId = col.elementId
      const index = this.$refs.indexEditor.indexS
      const refsIndex = []
      index.forEach(item => {
        if (item.children && item.children.map(item => item.properties.AttributeRef).includes(columnId)) {
          refsIndex.push(item.properties)
        }
      })
      if (refsIndex.length > 0) {
        this.$DatablauCofirm(`"${col.name}"是索引${refsIndex.map(item => '"' + item.Name + '"').join(',')}的成员字段,是否继续删除`, '提示', {
          type: 'warning'
        }).then(() => {
          index.forEach((item) => {
            if (item.children?.map(item => item.properties.AttributeRef).includes(columnId)) {
              let refIndex
              item.children.forEach((c, i) => {
                if (c.properties.AttributeRef === columnId) {
                  refIndex = i
                }
              })
              item.children.splice(refIndex, 1)
            }
          })
          this.$refs.indexEditor.temporarySave()
          callback()
        }).catch(() => {
        })
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
    check () {
      let tableNameValid = false
      this.$refs.tableNameRef.validate((valid) => {
        tableNameValid = valid
      })
      let columnNameValid = this.allCols.every((item, i) => {
        if (item.deleted) {
          return true
        }
        let v = false
        this.$refs[`name-form${i}${this.shrink ? '-shrink' : ''}`].validate((valid) => {
          v = valid
        })
        return v
      })
      let typeValid = this.allCols.every((item, i) => {
        if (item.deleted) {
          return true
        }
        let v = false
        this.$refs[`type-form${i}${this.shrink ? '-shrink' : ''}`].validate((valid) => {
          v = valid
        })
        return v
      })
      if (!columnNameValid || !tableNameValid || !typeValid) {
        return false
      } else {
        return true
      }
    },
    beforeSave () {
      let res = this.check()
      if (res) {
        this.checkInVersionDialogVisible = true
      }
    },
    async saveInViewEditor (request) {
      this.viewDataBak = _.cloneDeep(this.dataByType.view[this.rawData.tableMsg.Id])
      let changes = await this.save()
      if (changes && changes.length) {
        this.dataByType.view[this.rawData.tableMsg.Id].properties.changed = true
      }
      this.saveModel(request)
    },
    async save (request) {
      let tableNameValid = false
      this.$refs.tableNameRef.validate((valid) => {
        tableNameValid = valid
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
      let columnNameValid = this.allCols.every((item, i) => {
        if (item.deleted) {
          return true
        }
        let v = false
        this.$refs[`name-form${i}${this.shrink ? '-shrink' : ''}`].validate((valid) => {
          v = valid
        })
        return v
      })
      let typeValid = this.allCols.every((item, i) => {
        if (item.deleted) {
          return true
        }
        let v = false
        this.$refs[`type-form${i}${this.shrink ? '-shrink' : ''}`].validate((valid) => {
          v = valid
        })
        return v
      })
      if (!columnNameValid || !tableNameValid || !typeValid) {
        return false
      }
      let changes = []
      this.buttonLoading = true
      this.requestBody.modCols = []
      this.requestBody.newCols = []
      this.requestBody.delCols = []
      const initialMap = new Map()
      const currentSet = new Set()
      this.allColsInitial.forEach(item => {
        initialMap.set(item.elementId, item)
      })
      this.allCols.forEach(item => {
        currentSet.add(item.elementId)
        if (initialMap.has(item.elementId)) {
          if (JSON.stringify(initialMap.get(item.elementId)) !== JSON.stringify(item)) {
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
          this.requestBody.delCols.push(item.elementId)
        }
      })
      let entityId = this.rawData.tableMsg.Id
      let tableData = this.dataByType.view[entityId]
      let change = new (this.Changes)('modifyViewProperties', {
        id: entityId,
        name: tableData.properties.Name,
        pre: _.cloneDeep(tableData.properties),
        now: null
      })
      let tablePropertiesChanged = false
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
      if (tableData.properties.SQL !== this.requestBody.SQL) {
        tableData.properties.SQL = this.requestBody.SQL
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
        change.obj.now = _.cloneDeep(tableData.properties)
        changes.push(change)
      }

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
        DefaultVal: item.defaultVal,
        Definition: item.description,
        IsLogicalOnly: item.logicalOnly,
        IsAutoIncrement: item.IsAutoIncrement,
        StartingValue: item.StartingValue,
        IsPhysicalOnly: item.IsPhysicalOnly,
        DataStandardRef: item.domainId,
        changed: item.changed,
        deleted: item.deleted
      })).forEach(item => {
        let index = this.dataByType.view[entityId].children.findIndex(column => column.objectClass === 'Datablau.LDM.EntityAttribute' && column.properties.Id === item.Id)
        if (index !== -1) {
          let change = new (this.Changes)('modifyColumn', {
            pId: entityId,
            pName: tableData.properties.Name,
            id: item.Id,
            name: item.Name,
            pre: _.cloneDeep(this.dataByType.view[entityId].children[index]),
            now: null
          })
          _.merge(this.dataByType.view[entityId].children[index].properties, item)
          change.obj.now = _.cloneDeep(this.dataByType.view[entityId].children[index])
          changes.push(change)
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
          DefaultVal: item.defaultVal,
          Definition: item.description,
          IsLogicalOnly: item.logicalOnly,
          IsAutoIncrement: item.IsAutoIncrement,
          StartingValue: item.StartingValue,
          IsPhysicalOnly: item.IsPhysicalOnly,
          DataStandardRef: item.domainId,
          changed: item.changed,
          deleted: item.deleted,
          UniqueId: uuidv4(),
          new: item.new
        }
      })).forEach(item => {
        if (!item.properties.deleted) {
          if (this.dataByType.view[entityId].children) {
            this.dataByType.view[entityId].children.push(item)
          } else {
            this.dataByType.view[entityId].children = [item]
          }
          let change = new (this.Changes)('insertColumn', {
            pId: entityId,
            pName: tableData.properties.Name,
            id: item.Id,
            name: item.properties.Name,
            now: this.dataByType.view[entityId].children[this.dataByType.view[entityId].children.length - 1]
          })
          changes.push(change)
        }
      })
      if (this.$refs.indexEditor) {
        this.$refs.indexEditor.temporarySave()
        this.requestBody.newKeyGroups = this.$refs.indexEditor.newKeyGroups
        this.requestBody.delKeyGroups = this.$refs.indexEditor.delKeyGroups
        this.requestBody.modKeyGroups = this.$refs.indexEditor.modKeyGroups
        this.requestBody.modKeyGroups.forEach(item => {
          item.properties.changed = true
          let index = this.dataByType.view[entityId].children.findIndex(column => column.objectClass === 'Datablau.LDM.EntityKeyGroup' && column.properties.Id === item.properties.Id)
          if (index !== -1) {
            let change = new (this.Changes)('modifyIndex', {
              pId: entityId,
              pName: tableData.properties.Name,
              id: item.properties.Id,
              name: item.properties.Name,
              pre: _.cloneDeep(this.dataByType.view[entityId].children[index]),
              now: null
            })
            this.dataByType.view[entityId].children[index] = item

            change.obj.now = _.cloneDeep(item)
            changes.push(change)
          }
        })
        this.requestBody.newKeyGroups.forEach(item => {
          if (!item.properties.deleted) {
            if (this.dataByType.view[entityId].children) {
              this.dataByType.view[entityId].children.push(item)
            } else {
              this.dataByType.view[entityId].children = [item]
            }
            let change = new (this.Changes)('insertIndex', {
              pId: entityId,
              pName: tableData.properties.Name,
              id: item.Id,
              name: item.properties.Name,
              now: this.dataByType.view[entityId].children[this.dataByType.view[entityId].children.length - 1]
            })
            changes.push(change)
          }
        })
        this.requestBody.delKeyGroups.forEach(item => {
          let index = this.dataByType.view[entityId].children.findIndex(column => column.objectClass === 'Datablau.LDM.EntityKeyGroup' && column.properties.Id === item.properties.Id)
          if (index !== -1) {
            let change = new (this.Changes)('deleteIndex', {
              pId: entityId,
              pName: tableData.properties.Name,
              id: item.properties.Id,
              name: item.properties.Name,
              pre: _.cloneDeep(this.dataByType.view[entityId].children[index])
            })
            this.$set(this.dataByType.view[entityId].children[index].properties, 'deleted', true)
            this.dataByType.view[entityId].children[index].children && this.dataByType.view[entityId].children[index].children.forEach(m => {
              this.$set(m.properties, 'deleted', true)
            })
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
            name: shape.properties.Name,
            pre: _.cloneDeep(shape),
            now: null
          })
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
          changes.push(change)
        }
      }

      let changed = tablePropertiesChanged || this.requestBody.modCols.length > 0 || this.requestBody.newCols.length > 0 || this.requestBody.modKeyGroups.length > 0 || this.requestBody.newKeyGroups.length > 0 || this.requestBody.delKeyGroups.length > 0 || styleChanged
      if (changed) {
        let cell = this.graph?.graph.getDefaultParent().children.find(cell => cell.OwneeRef === entityId)
        if (cell) {
          cell.value = await this.getViewHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
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
        let t = this.dataByType.view[entityId]
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
      this.buttonLoading = false
      return changes
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
    onKeyPress (evt) {
      if (evt.code === 'ArrowDown') {
        this.moveToNextLine(evt.target)
      } else if (evt.code === 'ArrowUp') {
        this.moveToNextLine(evt.target, true)
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
      // this.fillColumnDetailFromDomain(row, this.$globalData.domainIdFullMap.get(value.id))
      // this.currentQueryDomainExists = false
      row['cnName'] = value['chName']
      let domain = this.currentQueryDomain.find(d => d.domainCode === value.domainCode)
      if (domain) {
        domain.inheritType = _.cloneDeep(this.$refs.domainSelector.selectedType)
        this.fillColumnDetailFromDomain(row, domain)
        this.currentQueryDomainExists = false
      }
    },
    callCodeSelector (row) {
      this.$refs.domainCodeSelector.openDialog(row.dataStandardCode)
      this.currentRow = row
    },
    clearCode (row) {
      row.dataStandardCode = ''
    },
    handleCodeSelected (code) {
      this.$refs.domainCodeSelector.closeDialog()
      this.currentRow.dataStandardCode = code.code
    },
    callDomainSelector (scope) {
      this.currentRow = scope.row
      this.currentScope = scope
      this.$refs.domainSelector.openDialog()
    },
    handleDomainSelector (domain) {
      this.$refs.domainSelector.closeDialog()
      this.fillColumnDetailFromDomain(this.currentRow, domain)
    },
    fillColumnDetailFromDomain (row, domain) {
      row.domainId = domain.id
      this.$set(row, 'domainName', domain.chName)
      this.domainIdToName[domain.id] = domain.chName
      if (domain.referenceCode) {
        this.$set(row, 'dataStandardCode', domain.referenceCode)
      }
      // this.currentRow.dataStandardCode = domain.referenceCode
      let { inheritType } = domain
      if (inheritType.includes('description')) {
        row.description = domain['description']
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
    // handlePkSelectionChange () {
    //   let pk = []
    //   console.log(this.allCols)
    //   this.allCols.forEach((item, index) => {
    //     if (this.pkSelection[index]) {
    //       pk.push(item.elementId)
    //       item.notNull = true
    //     }
    //   })
    //   this.pk = pk
    //   const index = this.$refs.indexEditor.indexS
    // }
    updateIndexNotEmpty (newValue) {
      this.indexNameNotEmpty = newValue
    }
  },
  watch: {
    // editMode (val) {
    //   if (this.$refs.indexEditor) {
    //     this.$refs.indexEditor.editMode = val
    //   }
    // },
    'rawData.editMode': {
      deep: true,
      handler: function () {
        this.editMode = this.rawData.appendMode || this.rawData.editMode
      }
    },
    activeTab (tab) {
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
            DataStandardCode: item.dataStandardCode,
            TypeId: 80000005,
            LogicalName: item.cnName,
            DefaultVal: item.defaultVal,
            Definition: item.description,
            IsLogicalOnly: item.logicalOnly,
            IsAutoIncrement: item.IsAutoIncrement,
            StartingValue: item.StartingValue,
            IsPhysicalOnly: item.IsPhysicalOnly,
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
