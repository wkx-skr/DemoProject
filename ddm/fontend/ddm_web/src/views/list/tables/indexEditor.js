import _ from 'lodash'
import $ from 'jquery'
import indexColumnsEditor from './indexColumnsEditor.vue'
export default {
  props: ['rawData', 'typeDataWareHouse'],
  components: { indexColumnsEditor },
  beforeMount () {
  },
  mounted () {
    this.prepareTableData()
    this.$bus.$on('removeColumnFromIndexSelectionList', index => {
      this.dataCopied.columnsMsg.splice(index, 1)
    })
  },
  beforeDestroy () {
    this.$bus.$off('removeColumnFromIndexSelectionList')
  },
  data () {
    const indexValidate = (rule, value, callback) => {
      let index = Number.parseInt(rule.field.slice(-1))
      value = _.trim(this.indexS[index].properties.Name)
      const indexNotEmpty = this.indexS.every(item => !!_.trim(item.properties.Name))
      this.$emit('updateIndexNotEmpty', indexNotEmpty)
      if (!value) {
        callback(new Error(this.$store.state.$v.dataEntity.err4))
      } else {
        callback()
      }
    }
    return {
      dataCopied: null,
      indexS: [],
      editMode: false,
      columnsMap: new Map(),
      currentIndex: null,
      requestBody: null,
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
      }
    }
  },
  methods: {
    prepareTableData () {
      this.dataCopied = _.cloneDeep(this.rawData)
      this.indexColumnsEditorKey++
      const { pk, fk, uk, nk, vk, columnsMsg: columns } = this.dataCopied
      columns.forEach(item => {
        this.columnsMap.set(item.properties.Id, item.properties)
      })
      this.indexS = _.concat(pk, fk, uk, nk, vk)
    },
    removeIndex (index) {
      this.indexS.splice(index, 1)
    },
    addIndex (type) {
      const newMacroFormatter = type => {
        let pre = ''
        switch (type) {
          case 'UniqueKey':
            pre = 'uk'
            break
          case 'NonUniqueKey':
            pre = 'ind'
            break
          case 'PrimaryKey':
            pre = 'pk'
            break
          case 'VirtualKey':
            pre = 'vk'
            break
        }
        let maxPost = 0
        this.indexS.forEach(item => {
          if (item.properties.KeyGroupType === type) {
            if (item.properties.Macro && item.properties.Macro.includes(pre + '_' + '%owner%') + '_') {
              let post = Number.parseInt(item.properties.Macro.split('_')[2])
              if (post > maxPost) {
                maxPost = post
              }
            }
          }
        })
        return pre + '_%owner%_' + (maxPost + 1)
      }
      let properties = {
        properties: {
          KeyGroupType: type,
          Macro: newMacroFormatter(type)
        },
        children: []
      }
      properties.properties.Name = properties.properties.Macro.replace('%owner%', this.rawData.tableMsg.Name)
      this.indexS.push(properties)
      this.$nextTick(() => {
        this.currentIndex = this.indexS[this.indexS.length - 1]
        this.$refs.indexTable.setCurrentRow(this.currentIndex)
        $(this.$refs.indexTable.$el).find('.el-table__body-wrapper').scrollTop(1000)
        $(this.$refs.indexTable.$el).find('.el-table__body-wrapper tr:last-child input')[0].focus()
      })
    },
    onRowClick (row) {
      this.indexColumnsEditorVisible = true
      this.currentIndex = row
      this.processCurrentIndex()
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
    },
    handleEditorClose () {
      this.indexColumnsEditorVisible = false
    },
    temporarySave () {
      const { pk, fk, uk, nk, vk } = this.rawData
      const oldData = _.cloneDeep(_.concat(pk, fk, uk, nk, vk))
      const oldDataMap = new Map()
      const [iDelete, iAppend, iChange, iSame] = [[], [], [], []]
      oldData.forEach(item => {
        oldDataMap.set(item.properties.Id, item)
      })
      this.indexS.forEach(item => {
        if (oldDataMap.has(item.properties.Id)) {
          if (JSON.stringify(oldDataMap.get(item.properties.Id)) === JSON.stringify(item)) {
            iSame.push(item)
          } else {
            iChange.push(item)
          }
          oldDataMap.get(item.properties.Id).blur = true
        } else {
          iAppend.push(item)
        }
      })
      oldDataMap.forEach(item => {
        if (!item.blur) {
          iDelete.push(item)
        }
      })

      let newKeyGroups = []
      let delKeyGroups = []
      let modKeyGroups = []
      iDelete.forEach(item => {
        delKeyGroups.push(item.properties.Id)
      })
      iChange.forEach(item => {
        let body = {
          elementId: item.properties.Id,
          name: item.properties.Name,
          type: item.properties.KeyGroupType,
          macro: item.properties.Macro,
          memberNames: [],
          memberIndexTypes: []
        }
        item.children && item.children.forEach(item => {
          let id = item.properties.AttributeRef
          body.memberNames.push(this.columnsMap.get(id).Name)
          body.memberIndexTypes.push(item.properties.OrderType)
        })
        modKeyGroups.push(body)
      })
      iAppend.forEach(item => {
        let body = {
          name: item.properties.Name,
          type: item.properties.KeyGroupType,
          macro: item.properties.Macro,
          memberNames: [],
          memberIndexTypes: []
        }
        item.children.forEach(item => {
          let id = item.properties.AttributeRef
          body.memberNames.push(this.columnsMap.get(id).Name)
          body.memberIndexTypes.push('Ascending')
        })
        newKeyGroups.push(body)
      })
      this.newKeyGroups = newKeyGroups
      this.delKeyGroups = delKeyGroups
      this.modKeyGroups = modKeyGroups
      this.$emit('close')
    },
    handleNameChange (data) {
      data.Macro = ''
    },
    handleMacroChange (data) {
      const macro = data.Macro
      const name = this.rawData.tableMsg.Name
      data.Name = macro.replace('%owner%', name)
    },
    isForeignKey (row) {
      return row && row.properties.KeyGroupType === 'ForeignKey'
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
      }
    },
    joinColumns (row) {
      let columns = []
      row.children && row.children.forEach(item => {
        columns.push(this.columnsMap.get(item.properties.AttributeRef).Name)
      })
      return columns.join(', ')
    },
    saveColumns (columns) {
      this.currentIndex.children = columns
      this.tableKey++
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
    }
  },
  watch: {
    // currentIndex (row) {
    //   this.leftSelection = []
    //   this.rightSelection = []
    //   this.$nextTick(() => {
    //     if (!row.children) {
    //       row.children = []
    //     }
    //     this.$bus.$emit('indexColumnsEditorGetMessage', row.children)
    //   })
    // }
  },
  computed: {
    hasPk () {
      let bool = false
      this.indexS.forEach(item => {
        if (item.properties.KeyGroupType === 'PrimaryKey') {
          bool = true
        }
      })
      return bool
    }
  }
}
