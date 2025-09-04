import DrawGraph from './DrawGraph.js'
import $ from 'jquery'
import HTTP from '@/resource/http'
import $version from '@/resource/version.json'
import tables from '../tables/tables.vue'
import tableDetails from '../tables/tableDetails.vue'
import string from '@/resource/utils/string'
import editImg from '@/assets/images/mxgraphEdit/Edit.svg'
import inElectron from '@/resource/utils/environment'
import LDMTypes from '@constant/LDMTypes'
// import Vue from 'vue'
// import { mapState } from 'vuex'
export default {
  name: 'modelGraph',
  props: ['currentId', 'currentName', 'currentModel', 'dataByType', 'data', 'modelId', 'from', 'hideEntityClick', 'isView', 'isConceptual', 'isLogical', 'diagramsLoading', 'isCassandraOrMongoDB'],
  components: { tables, tableDetails },
  data () {
    return {
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
      fullscreenImg1: require('../../../assets/images/mxgraphEdit/new-icon/fullscreen1.svg'),
      toolSelection: false,
      showTypeImg: require('../../../assets/images/mxgraphEdit/ShowType.svg'),
      fullscreenImg: require('../../../assets/images/mxgraphEdit/new-icon/fullscreen.svg'),
      editImg,
      currentTab: this.from === 'tables' ? 'tables' : 'graph',
      tables: [],
      showTabOfTables: false,
      currentTable: null,
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
      loading: true,
      loadingText: '请求数据',
      fixed: false,
      graph: null,
      sliderValue: 0,
      sliderOldValue: 0,
      showOutline: true,
      options4: [],
      value9: [],
      showReport: false,
      currentReportType: 'WARN',
      reportShowData: [],
      reportWrongData: [],
      reportWarningData: [],
      reportTipsData: [],
      reportTypeMap: {
        'ERROR': this.$store.state.$v.erGraph.error,
        'WARN': this.$store.state.$v.erGraph.warning,
        'INFO': this.$store.state.$v.erGraph.tips
      },
      objectMap: {},
      reportTableHeight: 300,
      levelMap: null,
      hightlightType: '',

      isDesignModel: this.isLogical || this.isConceptual,
      isLogicalModel: this.isLogical,
      showDataType: true,
      columnDisplay: 'all',

      showAllColumn: this.currentId && (this.dataByType.diagram[this.currentId].properties.DisplayLevel === 'ShowColumns' || !this.dataByType.diagram[this.currentId].properties.DisplayLevel),
      showKeyColumn: this.currentId && (this.dataByType.diagram[this.currentId].properties.DisplayLevel === 'ShowKeysOnly'),
      showNoColumn: this.currentId && (this.dataByType.diagram[this.currentId].properties.DisplayLevel === 'ShowTableOnly'),

      showPhysicalName: !(this.isLogical || this.isConceptual),
      showLogicalName: true,
      handleCommandTimeout: null,

      showFullScreenBtn: true,
      dataReady: false,
      shrink: false,
      scale: 100,
      plusImg: require('../../../assets/images/icon/plus.svg'),
      reduceImg: require('../../../assets/images/icon/reduce.svg'),
      navigatorImg: require('../../../assets/images/icon/navigator.svg')
    }
  },
  mounted () {
    this.$bus.$once('drawGraph', () => {
      this.loading = true
      // loading.close()
      setTimeout(() => {
        this.handleData()
      })
    })
    if (this.from !== 'tables') {
      // loading = this.$loading({
      //   lock: true,
      //   text: '正在绘制ER图，请稍候',
      //   spinner: 'el-icon-loading',
      //   background: 'rgba(238,238,238,0.9)'
      // })
      this.getDiagramContent(() => {
        this.$bus.$emit('drawGraph')
        this.dataReady = true
        this.getRulecheck()
        this.prepareZoomData()
      })
    }
    this.$bus.$on('modelSliderValueChange', (value) => {
      this.sliderValue = value
    })
    document.addEventListener('keydown', this.escKeydown)
    window.addEventListener('keydown', this.KeyDown, true)
    $(window).resize(this.resetStyle)
    // 解决添加表后，出现空白tab页的问题
    this.$bus.$on('removeBlankTab', () => { this.removeTab('') })
  },
  beforeDestroy () {
    document.removeEventListener('keydown', this.escKeydown)
    if (this.graph) {
      this.graph.destroy()
    }
    this.$bus.$off('drawGraph')
    this.$bus.$off('modelSliderValueChange')
    $(window).unbind('resize', this.resetStyle)
    this.$bus.$off('removeBlankTab')
  },
  methods: {
    tabChange () {
      // if (this.tables.length === 1) {
      //   this.showTabs = false
      //   return
      // }
      // this.showTabs = true
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
    goEditPage (row) {
      this.$http.put(`${this.$url}/service/editor/${row.id}/lock`).then(res => {
        if (res.data) {
          this.$store.commit('setNeedRefresh', true)
          if (inElectron) {
            this.$router.push({
              path: '/main/modeledit',
              query: {
                id: row.id,
                currentVersion: row.currentVersion,
                modelType: row.currentVersion,
                phase: row.phase ? row.phase : 0
              }
            })
          } else {
            window.open(`${window.baseUrl}#/main/modeledit?id=${row.id}&currentVersion=${row.currentVersion}&modelType=${row.modelType}&phase=${row.phase ? row.phase : 0}`)
          }
        }
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    escKeydown (e) {
      if (e.keyCode === 27) {
        if (this.fixed) {
          this.$exitFullScreen()
          this.fixed = false
        }
      }
    },
    formatTooltip (val) {
      return val + '%'
    },
    sliderChange (val) {
      this.graph && this.graph.graph.getView().setScale(val / 100)
    },
    minView () {
      if (this.scale === 0.1) {
        return
      }
      this.graph.graph.zoomOut()
      this.scale = (this.scale * 10 - 1) / 10
    },
    maxView () {
      if (this.scale === 2) {
        return
      }
      this.graph.graph.zoomIn()
      this.scale = (this.scale * 10 + 1) / 10
    },
    getDiagramContent (callback) {
      HTTP.getElementContent({
        modelId: this.currentModel.id,
        elementId: this.currentId,
        successCallback: data => {
          const elementArr = []
          if (data) {
            this.dataByType.diagram[data.properties.Id] = data
          }
          if (data && data.children) {
            data.children.forEach(item => {
              if (item.properties.TypeId === 80000006) {
                const appendNode = (parent, current) => {
                  if (!this.dataByType.diagram[current.properties.Id]) {
                    this.dataByType.diagram[current.properties.Id] = item
                    this.$bus.$emit('append-theme', {
                      current: {
                        Id: current.properties.Id,
                        Name: current.properties.Name
                      },
                      parent: parent.properties.Id
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
            if (elementArr.length > 0) {
              this.getEntitiesContent(elementArr, callback)
            } else {
              this.$bus.$emit('drawGraph')
              this.dataReady = true
              this.getRulecheck()
              this.prepareZoomData()
              this.loading = false
            }
          } else {
            this.loading = false
          }
        }
      })
    },
    getEntitiesContent (elementArr, callback) {
      HTTP.getElementsContent({
        modelId: this.currentModel.id,
        elementIds: elementArr,
        successCallback: data => {
          for (let index in data) {
            let value = data[index]
            this.captureData(value)
          }
          if (callback) {
            callback()
          }
        }
      })
    },
    captureData (data) {
      if (data.properties['TypeId'] === 80000004 || data.properties['TypeId'] === 80100073) {
        const dataColumnOrdered = {
          posit: data.posit,
          properties: data.properties,
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
          columnMap.forEach((v, k) => {
            if (!data.properties.ColumnOrderArrayRefs.includes(k) && v.properties.TypeId === 80000005) {
              dataColumnOrdered.children.push(v)
            }
          })
        } else {
          dataColumnOrdered.children = data.children
        }
        this.dataByType.table[data.properties.Id] = dataColumnOrdered
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
    getEntityContent (elementArr, index, callback) {
      HTTP.getElementContent({
        modelId: this.currentModel.id,
        elementId: elementArr[index],
        successCallback: data => {
          this.captureData(data)
          if (index < elementArr.length - 1) {
            this.getEntityContent(elementArr, index + 1, callback)
          } else {
            callback()
          }
        }
      })
    },
    updateVersion (version) {
      if (version) {
        this.currentModel.currentVersion = version
      } else {
        this.currentModel.currentVersion++
      }
    },
    updateTableData (data) {
      this.dataByType.table[data.properties.Id] = data
      this.afterHandleDialogData(data.properties.Id)
      if (this.$refs.tables) {
        this.$refs.tables.updateTableData(data)
      }
      if (this.$refs.partTables) {
        this.$refs.partTables.updateTableData(data)
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

      diagram[this.currentId].children.forEach(item => {
        if (item.properties.OwneeRef) {
          diagramMap.set(item.properties.OwneeRef, item.properties.Id)
        }
      })
      let list = []
      this.list = []
      let designModel = false
      if (this.dataByType.model['TypeUniqueId'] === '025502f5-3820-4555-9d0f-bbb148840e9a') { // design model
        designModel = true
      }
      // this.isDesignModel = designModel
      // this.showDataType = !designModel

      for (let key in table) {
        let item = table[key]
        let tableId = item.properties.Id
        let tableName = item.properties.Name
        if (item.properties.TypeId === LDMTypes.Entity) {
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
                let resultObj = {
                  value: 'table_column:' + diagramId + ':' + columnName + ':' + column.properties.Id,
                  label: tableName + ' / ' + columnName
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
      this.list = list
    },
    handleData () {
      document.querySelector('.el-loading-text').innerHTML = '画布绘制中'
      let data = this.dataByType
      if (!data) {
        return
      }
      $('#consa-graph').html('')
      $('.graph-outline').html('')
      if (this.graph) {
        this.graph.destroy()
      }
      this.graph = new DrawGraph($('#consa-graph')[0], data, this.param, $('.graph-outline')[0], this.isDesignModel)
      window.graph = this.graph
      this.graph.start()
      this.graph.graph.addListener(mxEvent.CLICK, (sender, evt) => {
        if (this.$refs.filterDropDown) {
          this.$refs.filterDropDown.visible = false
        }
      })
      this.graph.graph.addListener(mxEvent.MOVE_CELLS, (sender, evt) => {
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
      })
      this.graph.graph.getModel().addListener(mxEvent.CHANGE, async (sender, evt) => {
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
        if (changes) {
          for (let change of changes) {
            let cell = change.cell
            const geometry = change.geometry
            const previous = change.previous
            if (cell && !cell.edge && geometry && previous) {
              let cs = []
              if (Math.abs(geometry.width - previous.width) > 0.5 || Math.abs(geometry.height - previous.height) > 0.5) { // 大小改动

              } else if (Math.abs(geometry.x - previous.x) > 0.5 || Math.abs(geometry.y - previous.y) > 0.5) { // 位置改动
                // 组合图框移动操作
                if (cell.isFigure) {
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
              } else {
              }
            }
          }
        }
      })
      if (this.showKeyColumn) {
        this.handleCommand('keyColumn')
      } else if (this.showAllColumn) {
        //        this.handleCommand('allColumn');
      } else if (this.showNoColumn) {
        this.handleCommand('noColumn')
      }
    },
    showTabDetail (id) {
      this.handleDialogData(id)
    },
    showViewDetail (id) {
      this.viewDialog.data = this.dataByType.view[id].properties
      // this.viewDialog.visible = true
    },
    editTabDetail (id) {
      this.handleDialogData(id, true)
    },
    deleteTable (id) {

    },
    handleDialogData (tableId, editMode) {
      if (tableId) {
        HTTP.getElementContent({
          modelId: this.currentModel.id,
          elementId: tableId,
          successCallback: data => {
            const dataColumnOrdered = {
              properties: data.properties,
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
              columnMap.forEach((v, k) => {
                if (!data.properties.ColumnOrderArrayRefs.includes(k) && v.properties.TypeId === 80000005) {
                  dataColumnOrdered.children.push(v)
                }
              })
            } else {
              dataColumnOrdered.children = data.children
            }
            this.dataByType.table[tableId] = dataColumnOrdered
            this.afterHandleDialogData(tableId, editMode)
          }
        })
      } else {
        this.tables = [{
          columnsMsg: [],
          pk: [],
          fk: [],
          uk: [],
          nk: [],
          vk: [],
          tableMsg: {
            LogicalName: '',
            Name: '',
            Definition: ''
          },
          appendMode: true
        }]
        this.updateTabName()
      }
    },
    afterHandleDialogData (tableId, editMode = false) {
      if (tableId) { //  it means a table already exists
        let data = this.dataByType.table[tableId]
        let dialog = {}
        dialog.visible = true
        dialog.tableMsg = data.properties
        if (!dialog.tableMsg.LogicalName) {
          //          dialog.tableMsg.LogicalName = dialog.tableMsg.Name;
        }
        dialog.editMode = editMode
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
        const exist = this.tables.some(table => {
          return table.tableMsg.Id === dialog.tableMsg.Id
        })
        if (!exist) {
          this.tables.push(dialog)
          // this.showTabs = true
        } else {
          this.tables.forEach(table => {
            if (table.tableMsg.Id === dialog.tableMsg.Id) {
              Object.keys(dialog).forEach(p => {
                this.$set(table, p, dialog[p])
              })
            }
          })
        }
        this.currentTab = this.tabLabelFormatter(dialog)
      }
    },
    updateTabName () {
      this.currentTab = this.tabLabelFormatter(this.tables[0])
    },
    tabLabelFormatter (v) {
      if (!v) {
        return
      }
      if (v.appendMode) {
        return this.isLogical ? this.$store.state.$v.dataEntity.addEntity : this.$store.state.$v.dataEntity.addTable
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
      if (!this.fixed) {
        this.$fullScreen()
        this.fixed = true
      } else {
        this.$exitFullScreen()
        this.fixed = false
      }
      this.$bus.$emit('ifFullScreen', this.fixed)
    },
    handleDataReportChange () {
      this.showReport = !this.showReport
      if (this.showReport) {
        this.getRulecheck()
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
        this.loading = true
        setTimeout(() => {
          this.options4 = this.list.filter(item => {
            return string.matchKeyword(item, query, 'label')
          })
          this.loading = false
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
      this.$http.get(this.$url + '/service' + '/models/' + this.modelId + '/rulecheck')
        .then(res => {
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
          this.levelMap = levelMap
          if (this.currentReportType === 'ERROR') {
            this.reportShowData = this.reportWrongData
          } else if (this.currentReportType === 'WARN') {
            this.reportShowData = this.reportWarningData
          } else if (this.currentReportType === 'INFO') {
            this.reportShowData = this.reportTipsData
          }
          callback && callback()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    resetTableHeight () {
      this.reportTableHeight = $('.tablbe-conta').height()
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
      if (command.indexOf('Column') > -1) {
        this.showNoColumn && (this.showNoColumn = false)
        this.showKeyColumn && (this.showKeyColumn = false)
        this.showAllColumn && (this.showAllColumn = false)
      }

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
          this.expandAll()
          break
        case 'keyColumn':
          this.showKeyColumn = true
          this.columnDisplay = 'key'
          this.graph.showKeyColumn()
          break
        case 'noColumn':
          this.showNoColumn = true
          this.columnDisplay = 'no'
          this.collapseAll()
          break
        case 'logicalName':
          if (!this.showPhysicalName && this.showLogicalName) {
            break
          }
          this.showLogicalName = !this.showLogicalName
          break
        case 'physicalName':
          if (this.showPhysicalName && !this.showLogicalName) {
            break
          }
          this.showPhysicalName = !this.showPhysicalName
          break
        default:
          break
      }
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
        let idx = 0
        this.tables.forEach((item, index) => {
          if (this.handleTabName(item) === name) {
            idx = index
            nextTab = this.tables[index + 1] || this.tables[index - 1]
          }
        })
        this.tables.splice(idx, 1)
        this.currentTab = nextTab ? this.handleTabName(nextTab) : 'tables'
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
    }
  },
  watch: {
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
    }
  },
  computed: {
    // ...mapState(['showEREdit']),
    showTabs () {
      const res = !!(this.currentId || this.tables.length > 0)
      this.$emit('hideTabs', !res)
      return res
    }
  }
}
