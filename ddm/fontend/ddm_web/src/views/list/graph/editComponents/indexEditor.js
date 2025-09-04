import _ from 'lodash'
import $ from 'jquery'
import indexColumnsEditor from './indexColumnsEditor.vue'
import editIcon from '@/assets/images/er/icons/icon-edit.png'
import editGrey from '@/assets/images/er/icons/edit_grey.svg'
import { v4 as uuidv4 } from 'uuid'

export default {
  props: {
    rawData: {

    },
    editMode: {

    },
    virtualKey: {
      default: false,
      type: Boolean
    },
    dataByType: {
      type: Object
    },
    getIndexNameNamingMap: {
      type: Function
    },
    isDesignModel: {
      type: Boolean
    },
    deliverNum: {
      type: Object
    },
    typeDataWareHouse: {

    },
    requestBody: {

    },
    disabledPk: {

    }
  },
  components: { indexColumnsEditor },
  beforeMount () {
  },
  mounted () {
    this.prepareTableData()
    this.$bus.$on('removeColumnFromIndexSelectionList', index => {
      this.dataCopied.columnsMsg.splice(index, 1)
    })
    this.$bus.$on('handleChangeAllKeyGroupName', this.handleChangeAllKeyGroupName)
  },
  beforeDestroy () {
    this.$bus.$off('removeColumnFromIndexSelectionList')
    this.$bus.$off('handleChangeAllKeyGroupName')
  },
  data () {
    const indexValidate = (rule, value, callback) => {
      let index = Number.parseInt(rule.field.slice(-1))
      value = _.trim(this.indexS[index].properties.Name)
      const indexNotEmpty = this.indexS.every(item => !!_.trim(item.properties.Name))
      this.$emit('updateIndexNotEmpty', indexNotEmpty)
      if (!value) {
        callback(new Error('索引名称是必填的'))
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          this.$showFailure('索引名称是必填的')
        }, 200)
      } else {
        if (this.checkIndexIsDuplicate(value)) {
          callback(new Error(`索引名 ${value}重名`))
          clearTimeout(this.timer)
          this.timer = setTimeout(() => {
            this.$showFailure(`索引名 ${value} 重名`)
          }, 200)
        } else {
          callback()
        }
      }
    }
    return {
      dataCopied: null,
      indexS: [],
      columnsMap: new Map(),
      currentIndex: null,
      newKeyGroups: [],
      delKeyGroups: [],
      modKeyGroups: [],
      indexColumnsEditorVisible: false,
      tableKey: 1,
      indexColumnsEditorKey: 0,
      rules: {
        index: {
          required: true,
          validator: indexValidate,
          trigger: ['change', 'blur']
        }
      },
      editIcon,
      editGrey,
      count: 0
    }
  },
  methods: {
    checkIndexIsDuplicate (name) {
      let idx = 0
      this.indexS.forEach(v => {
        if (v.properties.deleted) {
          return
        }
        if (v.properties.Name === name) {
          idx++
        }
      })
      if (idx > 1) {
        return true
      } else {
        return false
      }
    },
    handleClose () {
      this.$refs.indexColumnsEditor.temporarySaveColumns()
    },
    tableRowClassName (scope) {
      if (scope.row.properties.deleted) {
        return 'hide-entity-row'
      } else {
        return ''
      }
    },
    prepareTableData () {
      this.dataCopied = _.cloneDeep(this.rawData)
      this.indexColumnsEditorKey++
      const { columnsMsg: columns } = this.dataCopied
      const { pk, fk, uk, nk, vk } = this.dataCopied
      columns.forEach(item => {
        this.columnsMap.set(item.properties.Id, item.properties)
      })
      this.indexS = _.cloneDeep(_.concat(pk, fk, uk, nk, vk))
      this.indexS.forEach(key => {
        if (key.properties.KeyGroupMemberRefs?.length) {
          key.children.sort((member1, member2) => {
            return key.properties.KeyGroupMemberRefs.findIndex(m => m === member1.properties.Id) - key.properties.KeyGroupMemberRefs.findIndex(m => m === member2.properties.Id)
          })
        }
      })
    },
    removeIndex (index) {
      this.$set(this.indexS[index].properties, 'deleted', true)
      if (this.indexS[index].properties.KeyGroupType === 'PrimaryKey') {
        this.$emit('deleteColumn', this.indexS[index].properties.Id)
      }
    },
    addIndex (type) {
      const newMacroFormatter = type => {
        // let pre = ''
        // switch (type) {
        //   case 'UniqueKey':
        //     pre = 'uk'
        //     break
        //   case 'NonUniqueKey':
        //     pre = 'ind'
        //     break
        //   case 'PrimaryKey':
        //     pre = 'pk'
        //     break
        //   case 'VirtualKey':
        //     pre = 'vk'
        //     break
        // }
        // return pre + '_%owner%_%keyid%'
        if (type === 'PrimaryKey') {
          return this.dataByType.namingOption.PKDefaultMacro
        } else if (type === 'VirtualKey') {
          return 'KeyGroup_%keyid%'
        } else if (type === 'UniqueKey') {
          return this.dataByType.namingOption.UKDefaultMacro
        } else if (type === 'NonUniqueKey') {
          return this.dataByType.namingOption.NUKDefaultMacro
        }
      }
      let properties = {
        properties: {
          KeyGroupType: type,
          Macro: newMacroFormatter(type),
          RawType: 'KeyGroup',
          KeyGroupMemberRefs: [],
          TypeId: 80000093,
          Id: this.deliverNum.seed++,
          UniqueId: uuidv4(),
          new: true
        },
        children: [],
        objectClass: 'Datablau.LDM.EntityKeyGroup'
      }
      let maxPost = this.indexS.filter(i => !i.properties.deleted && i.objectClass === 'Datablau.LDM.EntityKeyGroup').length
      this.indexS.forEach(item => {
        if (item.objectClass === 'Datablau.LDM.EntityKeyGroup') {
          if (item.properties.Name && item.properties.Name.search(/(\d+)$/) !== -1) {
            let post = Number.parseInt(item.properties.Name.slice(item.properties.Name.search(/(\d+)$/)))
            if (post > maxPost) {
              maxPost = post
            }
          }
        }
      })
      // properties.properties.Name = properties.properties.Macro.replace('%owner%', this.rawData.tableMsg.Name).replace('%keyid%', (maxPost + 1))
      properties.properties.Name = this.getIndexNameNamingMap(properties.properties.Macro, this.requestBody.name, (maxPost + 1))
      this.indexS.push(properties)
      this.$nextTick(() => {
        this.currentIndex = this.indexS[this.indexS.length - 1]
        this.processCurrentIndex()
        this.$refs.indexTable.setCurrentRow(this.currentIndex)
        $(this.$refs.indexTable.$el).find('.el-table__body-wrapper').scrollTop(1000)
        $(this.$refs.indexTable.$el).find('.el-table__body-wrapper tr:last-child input')[0].focus()
      })
      this.$emit('getIndexSArr', this.indexS)
    },
    onRowClick (row) {
      this.indexColumnsEditorVisible = true
      this.currentIndex = row
      this.processCurrentIndex()
    },
    handleEditorClose () {
      this.indexColumnsEditorVisible = false
    },
    isIndexChanged () {
      const { pk, fk, uk, nk, vk } = this.dataCopied
      const oldData = _.cloneDeep(_.concat(pk, fk, uk, nk, vk))
      const oldDataMap = new Map()
      oldData.forEach(item => {
        oldDataMap.set(item.properties.Id, item)
      })
      let changed = false
      this.indexS.forEach(item => {
        if (oldDataMap.has(item.properties.Id)) {
          if (JSON.stringify(oldDataMap.get(item.properties.Id)) === JSON.stringify(item)) {
          } else if (item.properties.deleted) {
            changed = true
          } else {
            changed = true
          }
          oldDataMap.get(item.properties.Id).blur = true
        } else {
          changed = true
        }
      })
      oldDataMap.forEach(item => {
        if (!item.blur) {
          changed = true
        }
      })
      return changed
    },
    temporarySave () {
      const { pk, fk, uk, nk, vk } = this.dataCopied
      const oldData = _.cloneDeep(_.concat(pk, fk, uk, nk, vk))
      const oldDataMap = new Map()
      const [iDelete, iAppend, iChange, iSame] = [[], [], [], []]
      oldData.forEach(item => {
        if (!this.dataCopied.sqlCreate) {
          oldDataMap.set(item.properties.Id, item)
        }
      })
      this.indexS.forEach(item => {
        if (oldDataMap.has(item.properties.Id)) {
          if (this.dataCopied.sqlCreate) {
            this.$set(item.properties, 'deleted', false)
            iAppend.push(item)
          } else {
            if (JSON.stringify(oldDataMap.get(item.properties.Id)) === JSON.stringify(item)) {
              iSame.push(item)
            } else if (item.properties.deleted) {
              item.properties.needDeliver = true
              iDelete.push(item)
            } else {
              item.properties.changed = true
              if (JSON.stringify(oldDataMap.get(item.properties.Id).children) !== JSON.stringify(item.children)) {
                item.properties.needDeliver = true
              }
              iChange.push(item)
            }
            oldDataMap.get(item.properties.Id).blur = true
          }
        } else {
          // 假如是字段组件引用当前组件的话是第二种$parent
          iAppend.push(item)
        }
      })
      oldDataMap.forEach(item => {
        if (!item.blur) {
          iDelete.push(item)
        }
      })

      let newKeyGroups = []
      // let delKeyGroups = []
      let modKeyGroups = []
      // iDelete.forEach(item => {
      //   delKeyGroups.push(item.properties.Id)
      // })
      // iChange.forEach(item => {
      //   let body = {
      //     elementId: item.properties.Id,
      //     name: item.properties.Name,
      //     type: item.properties.KeyGroupType,
      //     macro: item.properties.Macro,
      //     memberNames: [],
      //     memberIndexTypes: []
      //   }
      //   item.children && item.children.forEach(item => {
      //     let id = item.properties.AttributeRef
      //     body.memberNames.push(this.columnsMap.get(id).Name)
      //     body.memberIndexTypes.push(item.properties.OrderType)
      //   })
      //   modKeyGroups.push(body)
      // })
      // iAppend.forEach(item => {
      //   let body = {
      //     name: item.properties.Name,
      //     type: item.properties.KeyGroupType,
      //     macro: item.properties.Macro,
      //     memberNames: [],
      //     memberIndexTypes: []
      //   }
      //   item.children.forEach(item => {
      //     let id = item.properties.AttributeRef
      //     body.memberNames.push(this.columnsMap.get(id).Name)
      //     body.memberIndexTypes.push('Ascending')
      //   })
      //   newKeyGroups.push(body)
      // })
      this.newKeyGroups = iAppend
      // this.delKeyGroups = delKeyGroups
      this.modKeyGroups = iChange
      // this.$emit('close')
      this.delKeyGroups = iDelete
    },
    handleNameChange (data) {
      data.Macro = ''
      data.Name = this.getIndexNameNamingMap(null, data.Name)
    },
    handleMacroChange (data) {
      data.mod = true
      const macro = data.Macro
      const name = this.requestBody.name
      let keyId = this.indexS.length + this.count++
      if (data.Name && data.Name.search(/(\d+)$/) !== -1) {
        keyId = Number.parseInt(data.Name.slice(data.Name.search(/(\d+)$/)))
      }
      data.Name = this.getIndexNameNamingMap(macro, name, keyId)
    },
    handleChangeAllKeyGroupName () {
      this.indexS.forEach(keyGroup => {
        let data = keyGroup.properties
        data.mod = true
        const macro = data.Macro
        const name = this.requestBody.name
        let keyId = ''
        if (data.Name && data.Name.search(/(\d+)$/) !== -1) {
          keyId = Number.parseInt(data.Name.slice(data.Name.search(/(\d+)$/)))
        }
        data.Name = this.getIndexNameNamingMap(macro, name, keyId)
      })
    },
    isForeignKey (row) {
      return row && row.properties.KeyGroupType === 'ForeignKey'
    },
    isPrimaryKey (row) {
      return row && row.properties.KeyGroupType === 'PrimaryKey'
    },
    keyNameFormatter (row) {
      const fullName = row.properties.KeyGroupType
      switch (fullName) {
        case 'PrimaryKey':
          return 'PK'
        case 'ForeignKey':
          return 'FK'
        case 'UniqueKey':
          return 'UK'
        case 'NonUniqueKey':
          return 'NUK'
        case 'VirtualKey':
          return 'VK'
      }
    },
    joinColumns (row) {
      let columns = []
      row.children && row.children.forEach(item => {
        if (this.columnsMap.get(item.properties.AttributeRef)) {
          columns.push(this.columnsMap.get(item.properties.AttributeRef).Name)
        }
      })
      return columns.join(', ')
    },
    saveColumns (columns) {
      this.currentIndex.children = columns
      this.currentIndex.properties.KeyGroupMemberRefs = columns.map(column => column.properties.Id)
      this.currentIndex.properties.mod = true
      this.tableKey++
      if (this.currentIndex.properties.KeyGroupType === 'PrimaryKey') { // 修改主键，相应字段变成非空
        this.$bus.$emit('changeToPrimaryColumn', columns.map(member => member.properties.AttributeRef))
      }
      // this.$emit('updateIndexMemberList', this.currentIndex.properties.Id, columns)
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
    processCurrentIndex () {
      this.leftSelection = []
      this.rightSelection = []
      this.$nextTick(() => {
        if (!this.currentIndex.children) {
          this.currentIndex.children = []
        }
        this.$bus.$emit('indexColumnsEditorGetMessage', this.currentIndex.children)
      })
    }
  },
  watch: {
    rawData: {
      handler (val) {
        val.columnsMsg.forEach(item => {
          this.columnsMap.set(item.properties.Id, item.properties)
        })
        // this.dataCopied = _.cloneDeep(val)
      },
      deep: true
    }
  },
  computed: {
    hasPk () {
      let bool = false
      this.indexS.forEach(item => {
        if (item.properties.KeyGroupType === 'PrimaryKey' && !item.properties.deleted) {
          bool = true
        }
      })
      return bool
    }
  }
}
