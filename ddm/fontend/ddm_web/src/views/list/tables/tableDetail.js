import dataStandardCodeDetail from './dataStandardCodeDetail'
import indexEditor from './indexEditor.vue'
import datablauChecked from './datablauChecked'
import udpValidaterInput from './udpValidaterInput'
import datablauTooltip from '@/components/common/tooltip.vue'
import DomainCodeSelector from '@/components/selector/DomainCodeSelector'
import DomainSelector from '@/components/selector/NewDomainSelector'
import CheckInVersion from './CheckInVersion.vue'
import exportJpa from './jpaClass/exportJpa.vue'
import exportDdl from './ddl/exportDDL.vue'
import $ from 'jquery'
import $version from '@/resource/version.json'
import string from '@/resource/utils/string'
import $const from '@/resource/const'
import HTTP from '@/resource/http'
import _ from 'lodash'
import tableImg from '@/assets/images/mxgraphEdit/Table.svg'
import viewImg from '@/assets/images/mxgraphEdit/View.svg'
import translateImg from '@/assets/images/mxgraphEdit/translate.svg'
import translateActiveImg from '@/assets/images/mxgraphEdit/translate-active.svg'
// import PinyinMatch from 'pinyin-match'
export default {
  props: ['rawData', 'currentModel', 'dataByType', 'isLogicalModel', 'TypeUniqueIdToColumnDefaultType', 'isCassandraOrMongoDB', 'typeDataWareHouse'],
  components: { dataStandardCodeDetail, indexEditor, datablauChecked, datablauTooltip, DomainCodeSelector, DomainSelector, udpValidaterInput, CheckInVersion, exportJpa, exportDdl },
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
      currentQueryDomain: []
    }

    const obj = this.prepareTableUdps(requestBody)
    const obj1 = this.prepareColumnUdps(requestBody)
    if (this.isLogicalModel) {
      requestBody.logicalOnly = null
    } else {
      requestBody.physicalOnly = null
    }

    let contentValidate = (rule, value, callback) => {
      value = _.trim(this.requestBody.name)
      if (!value) {
        callback(new Error(this.$store.state.$v.dataEntity.err1))
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
    let dataTypeValidate = (rule, value, callback) => {
      if (!(value?.trim())) {
        callback(new Error(this.$store.state.$v.dataEntity.err3))
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          this.$showFailure(this.$store.state.$v.dataEntity.err3)
        }, 200)
      } else {
        callback()
      }
    }
    return {
      attributeName: (this.isLogical || this.isConceptual) ? '属性' : '字段',
      translateActiveImg,
      translateImg,
      translateActive: false,
      viewImg,
      domainLoading: false,
      editMode: false,
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
          trigger: ['change']
        },
        columnName: {
          validator: columnNameValidate,
          trigger: ['change']
        },
        dataType: {
          validator: dataTypeValidate,
          trigger: ['change']
        }
      },
      indexNameNotEmpty: true,
      checkInVersionDialogVisible: false,
      tableImg,
      domainIdToName: {},
      // isLogical: false,
      isEn: window.lang === 'English',
      isOverflow: false
    }
  },
  beforeCreate () {
    this.$version = $version
    this.string = string
  },
  beforeMount () {
  },
  mounted () {
    // this.isLogical = this.$store.state.isLogical
    this.limitedDsApply = this.currentModel.limitedDsApply
    if (this.limitedDsApply) {
      this.limitedDsApplyConfig = this.currentModel.limitedDsApplyConfig
      if (typeof this.currentModel.limitedDsApplyConfig === 'string') {
        this.limitedDsApplyConfig = JSON.parse(this.currentModel.limitedDsApplyConfig)
      }
    }
    this.editMode = this.rawData.appendMode || this.rawData.editMode
    if (this.editMode) {
      this.heartBeat()
      this.heartBeatInterval = setInterval(() => {
        this.heartBeat()
      }, 1000 * 60)
    }
    this.onReady()
    $(window).resize(this.handleResize)
    this.$bus.$on('updateDomains', () => {
      this.tableKey++
      this.highlightRow()
    })
  },
  beforeDestroy () {
    this.unLockModel()
    $(window).unbind('resize', this.handleResize)
    this.$bus.$off('updateDomains')
  },
  beforeRouteLeave (to, from, next) {
  },
  methods: {
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
    translateAll () {
      this.$http.post(this.$url + `/service/nametranslate/`, {
        logicalNames: this.allCols.map(i => i.cnName),
        namingSeperator: '_',
        c2e: true,
        categorySet: ['']
      }).then(res => {
        for (let i = 0; i < this.allCols.length; i++) {
          if (res.data[i] && res.data[i] !== this.allCols[i].cnName) {
            this.allCols[i].name = res.data[i]
          }
        }
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    handleTableCNNameTab (cnName, checkRealTimeTranslate) {
      if (cnName && (!checkRealTimeTranslate || (checkRealTimeTranslate && this.dataByType.namingOption.IsUsingRealTimeTranslate))) {
        this.$http.post(this.$url + `/service/nametranslate/`, {
          logicalNames: [cnName],
          namingSeperator: '_',
          c2e: true,
          categorySet: ['']
        }).then(res => {
          if (res.data[0] && res.data[0] !== cnName) {
            this.requestBody.name = res.data[0]
          }
        }).catch(err => {
          this.$showFailure(err)
        })
      }
    },
    getConfig () {
      return typeof this.currentModel.limitedDsApplyConfig === 'string' ? JSON.parse(this.currentModel.limitedDsApplyConfig) : this.currentModel.limitedDsApplyConfig
    },
    callSet () {
      if (this.activeTool === 'jpa') {
        this.$refs.jpa.callSetting()
      } else {
        this.$refs.ddl.callSetting()
      }
    },
    checkLineage (row) {
      HTTP.skip2('modelLineage', { entityid: row.Id, entityname: row.Name, modelid: this.currentModel.id })
    },
    clearLimitedDomain (bool, scope) {
      if (bool) {
        this.clearDomain(scope)
      }
    },
    clearDomain (scope) {
      scope.row.domainId = null
      scope.row.domainName = null
    },
    limitedDsApplyMessage (showMessage) {
      if (showMessage) {
        this.$message.warning(this.$store.state.$v.modelDetail.forcedTip1)
      }
    },
    onReady () {
      this.calculateYOfBottom()
      this.getPkColumnIds()
      this.prepareRequestBody()
      setTimeout(() => {
        this.editIndex()
      })
    },
    cancel () {
      this.unLockModel()
      this.editMode = false
      this.onReady()
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
        // 默认是表, 如果 type 匹配, 则是 视图
        let typeId = 80000004
        if (this.rawData?.tableMsg?.RawType === 'View') {
          typeId = 80500008
        } else if (this.rawData?.tableMsg?.RawType === 'BusinessObject') {
          typeId = 80100073
        }
        if (item.entityType === typeId) {
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
      if (column.property) {
        let property = column.property.split('.')[1]
      }
    },
    async prepareRequestBody () {
      if (this.rawData.tableMsg.Id) {
        this.requestBody.elementId = this.rawData.tableMsg.Id
      }
      this.requestBody.name = this.rawData.tableMsg.Name
      this.requestBody.cnName = this.rawData.tableMsg.LogicalName
      this.requestBody.description = this.rawData.tableMsg.Definition
      if (this.isLogicalModel) {
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
          description: item.properties.Definition
        }
        if (this.pk.indexOf(body.elementId) > -1) {
          body.notNull = true
        }
        if (this.isLogicalModel) {
          body.logicalOnly = item.properties.IsLogicalOnly
        } else {
          body.physicalOnly = item.properties.IsPhysicalOnly
        }
        body.allUdps = {}
        this.columnsUdpKeys && this.columnsUdpKeys.forEach(i => {
          body.allUdps[String(i)] = item.properties[i]
        })
        this.allCols.push(body)
      })
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
        //   this.$set(this.allCols[index], 'domainName', item.properties.DataStandardRef ? domainIdToName[item.properties.DataStandardRef] : '')
        // })
      } catch (e) {
        this.$showFailure(e)
      }
      this.allColsInitial = _.cloneDeep(this.allCols)
      this.highlightRow()
      this.isOverflow = false
      this.$nextTick(() => {
        let table = document.querySelector('#table-details .table-content .el-table__body-wrapper')
        if (table && table.scrollHeight > table.clientHeight) {
          this.isOverflow = true
        }
      })
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
        let num = parseInt(v.name.split('_')[1])
        return isNaN(num) ? 0 : num
      }))
    },
    addColumn () {
      let maxId = this.getMaxId(this.allCols)
      maxId = isNaN(maxId) || maxId === -Infinity ? 0 : maxId
      let body = {
        name: ((this.isLogicalModel ? 'Attribute_' : this.isCassandraOrMongoDB ? 'Filed_' : 'Column_') + (++maxId)),
        cnName: '',
        description: '',
        dataType: this.TypeUniqueIdToColumnDefaultType[this.dataByType?.model?.TypeUniqueId?.toUpperCase()] || this.TypeUniqueIdToColumnDefaultType[this.dataByType?.model?.TypeUniqueId?.toLowerCase()],
        enName: '',
        domainId: null,
        dataStandardCode: null,
        notNull: false,
        defaultVal: ''
      }
      if (this.isLogicalModel) {
        body.logicalOnly = null
      } else {
        body.physicalOnly = null
      }
      body.allUdps = {}
      this.columnsUdpKeys.forEach(i => {
        body.allUdps[i] = null
      })
      this.allCols.push(body)
      this.$nextTick(() => {
        $('.el-table__body-wrapper').scrollTop(1000)
        $('.el-table__body-wrapper tr:last-child input')[0].focus()
      })
    },
    deleteRow (row, index) {
      const col = this.allCols[index]
      const remove = () => {
        this.allCols.splice(index, 1)
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
        this.$DatablauCofirm(
          `<span style="word-break: break-all;">"${col.name}"${this.$store.state.$v.modelDetail.isIndex}${refsIndex.map(item => '"' + item.Name + '"').join(',')}${this.$store.state.$v.modelDetail.confirmDelete}</span>`,
          this.$store.state.$v.modelDetail.tips,
          {
            dangerouslyUseHTMLString: true,
            type: 'warning'
          }
        ).then(() => {
          for (let indexIndex = 0; indexIndex < index.length; indexIndex++) {
            let item = index[indexIndex]
            if (item.children?.map(item => item.properties.AttributeRef).includes(columnId)) {
              let refIndex
              item.children.forEach((c, i) => {
                if (c.properties.AttributeRef === columnId) {
                  refIndex = i
                }
              })
              // item.children.splice(refIndex, 1)
              if (item.children.length > 1) {
                item.children.splice(refIndex, 1)
              } else {
                index.splice(indexIndex, 1)
                indexIndex--
              }
            }
          }
          this.$refs.indexEditor.temporarySave()
          callback()
        }).catch((err) => {
          console.log(err)
        })
      } else {
        callback()
      }
    },
    updateColumnsMapOfIndexEditor (col) {
      setTimeout(() => {
        if (col.elementId) {
          this.$refs.indexEditor.columnsMap.get(col.elementId).Name = col.name
        }
      })
    },
    editIndex () {
      if (this.indexEditorVisible) {
        this.$refs.indexEditor.prepareTableData()
      }
      this.indexEditorVisible = true
      this.$nextTick(() => {
        this.$refs.indexEditor.editMode = this.editMode
      })
    },
    beforeSave () {
      // this.save()
      this.checkInVersionDialogVisible = true
    },
    save (request) {
      let columnNameValid = this.allCols.every((item, i) => {
        if (item.deleted) {
          return true
        }
        let v = false
        this.$refs[`name-form${i}`].validate((valid) => {
          v = valid
        })
        return v
      })
      if (!columnNameValid) {
        return false
      }
      let typeValid = this.allCols.every((item, i) => {
        if (item.deleted) {
          return true
        }
        let v = false
        this.$refs[`type-form${i}`].validate((valid) => {
          v = valid
        })
        return v
      })
      if (!typeValid) {
        return false
      }
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
            this.requestBody.modCols.push(item)
          }
        }
        if (!item.elementId) {
          this.requestBody.newCols.push(item)
        }
      })
      initialMap.forEach(item => {
        if (!currentSet.has(item.elementId)) {
          this.requestBody.delCols.push(item.elementId)
        }
      })
      if (this.$refs.indexEditor) {
        this.$refs.indexEditor.temporarySave()
        this.requestBody.newKeyGroups = this.$refs.indexEditor.newKeyGroups
        this.requestBody.delKeyGroups = this.$refs.indexEditor.delKeyGroups
        this.requestBody.modKeyGroups = this.$refs.indexEditor.modKeyGroups
      }
      const successCallback = data => {
        if (!data) {
          return
        }
        // 解决添加表后，出现空白tab页的问题
        this.$bus.$emit('removeBlankTab')
        this.$message.success(this.rawData.appendMode ? this.$store.state.$v.dataEntity.success1 : this.$store.state.$v.dataEntity.success2)
        this.currentVersion = data.currentVersion
        this.$bus.$emit('updateTableMessage', data.object)
        let model = _.clone(this.requestBody.allUdps)
        for (let k in model) {
          if (typeof Number.parseInt(k) === 'number' && !isNaN(Number.parseInt(k))) {
          } else {
            delete model[k]
          }
        }
        this.udpMessage = model
        if (this.rawData.appendMode) {
          this.$bus.$emit('appendTableToList', data.object)
          this.rawData.appendMode = false
        } else {
          this.$bus.$emit('updateTableToList', data.object)
        }
        if (this.rawData.editMode) {
          this.rawData.editMode = false
        }
        this.$emit('updateTabName')
        this.editMode = false
        this.unLockModel()
        this.$emit('updateTableData', data.object)
        this.$emit('updateVersion', data.currentVersion)
        this.$nextTick(() => {
          this.onReady()
        })
      }
      HTTP.updateTableOfModel({
        modelId: this.currentModel.id,
        modelVersion: this.currentVersion,
        requestBody: this.requestBody,
        successCallback: data => {
          successCallback(data)
          if (request) {
            this.$http.post(this.$url + '/service/models/' + this.currentModel.id + '/versions', {
              modelId: this.currentModel.id,
              version: request.version,
              description: request.description
            }).then(() => {
              this.$store.commit('setNeedRefresh', true)
            }).catch(e => {
              this.$showFailure(e)
            })
          }
        },
        method: this.rawData.appendMode ? 'POST' : 'PUT',
        failureCallback: () => {
          this.onReady()
          this.$refs.indexEditor.prepareTableData()
        },
        finallyCallback: () => {
          this.buttonLoading = false
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
        pageSize: 10,
        categoryId: 1
      }
      this.domainLoading = true
      this.$http.post(`${this.$url}/service/domains/latest/page`, obj).then(res => {
        this.domainLoading = false
        this.currentQueryDomain = res.data.items
        this.currentQueryDomainExists = this.currentQueryDomain.length > 0
        cb(this.currentQueryDomain)
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
      this.$refs.domainCodeSelector.openDialog()
      this.currentRow = row
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
      this.$set(row, 'domainId', domain.id)
      this.$set(row, 'domainName', domain.chName)
      this.domainIdToName[domain.id] = domain.chName
      if (domain.referenceCode) {
        row.dataStandardCode = domain.referenceCode
      }
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
        if (domain['dataScale']) {
          row['dataType'] = domain['dataType'] + '(' + domain['dataScale'] + ')'
        } else {
          row['dataType'] = domain['dataType']
        }
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
        this.$http.post(`${this.$url}/service/editor/${this.currentModel.id}/unlock`).then(res => {
          if (res.data) {
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
            this.editMode = true
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
      }
    }
  },
  watch: {
    editMode (val, preVal) {
      if (this.$refs.indexEditor) {
        this.$refs.indexEditor.editMode = val
      }
    },
    rawData: {
      deep: true,
      handler: function () {
        this.editMode = this.rawData.appendMode || this.rawData.editMode
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
      const udpMessageDisplay = {}
      Object.keys(udpMessage).forEach(k => {
        if (this.dataByType.udp.get(Number.parseInt(k))) {
          udpMessageDisplay[k] = udpMessage[k]
        }
      })
      return udpMessageDisplay
    },
    columnsUdpKeysDisplay () {
      const columnsUdpKeys = this.columnsUdpKeys
      const columnsUdpKeysDisplay = new Set()
      columnsUdpKeys.forEach(item => {
        if (this.dataByType.udp.get(Number.parseInt(item))) {
          columnsUdpKeysDisplay.add(item)
        }
      })
      return columnsUdpKeysDisplay
    }
  }
}
