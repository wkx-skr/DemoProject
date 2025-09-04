export default {
  props: ['logicalTableData', 'physicalTableData'],
  mounted() {
    this.prepareData()
    this.getPhysicalColumns()
  },
  data() {
    return {
      sourceModelId: null,
      sourceTableId: null,
      targetModelId: null,
      targetTableId: null,

      logicalColumns: [],
      logicalColumnsMap: new Map(),
      physicalColumns: [],
      physicalColumnsMap: new Map(),
      logicalColumn: null,
      physicalColumn: null,
      showColumnSelector: false,

      bindColumns: [],
      bindColumnsSet: new Set(),
      bindColumnsSetInitial: new Set(),

      blur: false,
    }
  },
  methods: {
    prepareData() {
      this.sourceModelId = this.logicalTableData.modelId
      this.sourceTableId = this.logicalTableData.tableId
      this.targetModelId = this.physicalTableData.modelId
      this.targetTableId = this.physicalTableData.objectId
    },
    getLogicalColumns() {
      this.$http
        .get(
          this.$meta_url +
            `/models/ddm/models/${this.sourceModelId}/table/${this.sourceTableId}`
        )
        .then(res => {
          this.logicalColumns = res.data
          res.data.forEach(item => {
            item.physicalName = `${item.physicalName} ${
              item.logicalName ? `(${item.logicalName})` : ''
            }`
            this.logicalColumnsMap.set(item.columnId, item.physicalName)
          })
          this.getBindColumns()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getPhysicalColumns() {
      this.$http
        .get(this.$url + `/service/entities/${this.targetTableId}/columns`)
        .then(res => {
          this.physicalColumns = res.data
          res.data.forEach(item => {
            item.physicalName = `${item.physicalName} ${
              item.logicalName ? `(${item.logicalName})` : ''
            }`
            this.physicalColumnsMap.set(item.objectId, item.physicalName)
          })
          this.getLogicalColumns()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getBindColumns() {
      const requestUrl = `${this.$url}/service/busiObjects/table/${this.sourceModelId}/${this.sourceTableId}/bindings/${this.targetTableId}`
      this.$http
        .get(requestUrl)
        .then(res => {
          res.data.forEach(item => {
            if (item.sourceColumnId) {
              this.bindColumns.push({
                sourceName: this.logicalColumnsMap.get(item.sourceColumnId),
                targetName: this.physicalColumnsMap.get(item.targetColumnId),
                sourceId: item.sourceColumnId,
                targetId: item.targetColumnId,
              })
              this.bindColumnsSet.add(
                item.sourceColumnId + '::' + item.targetColumnId
              )
              this.bindColumnsSetInitial.add(
                item.sourceColumnId + '::' + item.targetColumnId
              )
            }
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    add() {
      if (
        this.bindColumnsSet.has(
          this.logicalColumn.columnId + '::' + this.physicalColumn.objectId
        )
      ) {
        this.$message.info('列表中已有此映射关系')
      } else {
        this.bindColumnsSet.add(
          this.logicalColumn.columnId + '::' + this.physicalColumn.objectId
        )
        this.bindColumns.push({
          sourceName: this.logicalColumn.physicalName,
          targetName: this.physicalColumn.physicalName,
          sourceId: this.logicalColumn.columnId,
          targetId: this.physicalColumn.objectId,
        })
        this.logicalColumn = null
        this.physicalColumn = null
      }
    },
    removeRow(index, row) {
      this.bindColumnsSet.delete(row.sourceId + '::' + row.targetId)
      this.bindColumns.splice(index, 1)
    },
    save() {
      this.saveBind()
    },
    saveUnbind() {
      const removedColumnsSet = new Set()
      this.bindColumnsSetInitial.forEach(item => {
        if (!this.bindColumnsSet.has(item)) {
          removedColumnsSet.add(item)
        }
      })
      if (removedColumnsSet.size > 0) {
        const arr = _.toArray(removedColumnsSet)
        this.saveUnbindOne(arr[0], 0, arr)
      } else {
        if (this.blur) {
          this.$message.success(this.$version.common.operationSucceed)
        }
        this.closeDialog()
      }
    },
    saveBind() {
      const addedColumnsSet = new Set()
      this.bindColumnsSet.forEach(item => {
        if (!this.bindColumnsSetInitial.has(item)) {
          addedColumnsSet.add(item)
        }
      })
      if (addedColumnsSet.size > 0) {
        const arr = _.toArray(addedColumnsSet)
        this.saveBindOne(arr[0], 0, arr)
      } else {
        this.saveUnbind()
      }
    },
    saveBindOne(currentColumn, index, arr) {
      const requestBody = {
        sourceColumnId: currentColumn.split('::')[0],
        targetColumnId: currentColumn.split('::')[1],
        sourceTableId: this.sourceTableId,
        sourceModelId: this.sourceModelId,
        sourceModelCategoryId: null,
        targetTableId: this.targetTableId,
        targetModelId: this.targetModelId,
        targetModelCategoryId: null,
        tableLevel: false,
      }
      this.blur = true
      this.$http
        .post(`${this.$url}/service/busiObjects/tables/bind`, requestBody)
        .then(res => {
          if (index < arr.length - 1) {
            this.saveBindOne(arr[index + 1], index + 1, arr)
          }
          if (index === arr.length - 1) {
            this.saveUnbind()
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    saveUnbindOne(currentColumn, index, arr) {
      const requestBody = {
        sourceColumnId: currentColumn.split('::')[0],
        targetColumnId: currentColumn.split('::')[1],
        sourceTableId: this.sourceTableId,
        sourceModelId: this.sourceModelId,
        sourceModelCategoryId: null,
        targetTableId: this.targetTableId,
        targetModelId: this.targetModelId,
        targetModelCategoryId: null,
        tableLevel: false,
      }
      this.blur = true
      this.$http
        .post(`${this.$url}/service/busiObjects/tables/unbind`, requestBody)
        .then(res => {
          if (index < arr.length - 1) {
            this.saveUnbindOne(arr[index + 1], index + 1, arr)
          }
          if (index === arr.length - 1) {
            this.$message.success(this.$version.common.operationSucceed)
            this.closeDialog()
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },

    unbindTable() {
      const requestBody = {
        sourceTableId: this.sourceTableId,
        sourceModelId: this.sourceModelId,
        sourceModelCategoryId: null,
        targetTableId: this.targetTableId,
        targetModelId: this.targetModelId,
        targetModelCategoryId: null,
        tableLevel: true,
      }

      this.$http
        .post(`${this.$url}/service/busiObjects/tables/unbind`, requestBody)
        .then(res => {
          this.$message.success(this.$version.common.operationSucceed)
          this.closeDialog()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    bindTable() {
      const requestBody = {
        sourceTableId: this.sourceTableId,
        sourceModelId: this.sourceModelId,
        sourceModelCategoryId: null,
        targetTableId: this.targetTableId,
        targetModelId: this.targetModelId,
        targetModelCategoryId: null,
        tableLevel: true,
      }

      this.$http
        .post(`${this.$url}/service/busiObjects/tables/bind`, requestBody)
        .then(res => {
          this.$message.success(this.$version.common.operationSucceed)
          this.closeDialog()
          //        this.$emit('refresh');
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },

    auto() {
      let logicalColumn = null
      let physicalColumn = null
      let cnt = 0
      this.logicalColumns.forEach(l => {
        this.physicalColumns.forEach(p => {
          if (l.physicalName === p.physicalName) {
            logicalColumn = l
            physicalColumn = p
            if (
              this.bindColumnsSet.has(
                logicalColumn.columnId + '::' + physicalColumn.objectId
              )
            ) {
            } else {
              this.bindColumnsSet.add(
                logicalColumn.columnId + '::' + physicalColumn.objectId
              )
              this.bindColumns.push({
                sourceName: logicalColumn.physicalName,
                targetName: physicalColumn.physicalName,
                sourceId: logicalColumn.columnId,
                targetId: physicalColumn.objectId,
              })
              cnt++
            }
          }
        })
      })
      if (cnt === 0) {
        this.$message.info('未自动获取到更多相似字段')
      } else {
        this.$message.info(`获取到${cnt}条相似字段，已添加到列表中`)
      }
    },
    closeDialog() {
      this.$emit('closeDialog')
    },
    sourceNameFormatter(row) {
      return this.logicalColumnsMap.get(row.columnId)
    },
    targetNameFormatter(row) {
      return this.physicalColumnsMap.get(row.objectId)
    },
  },
  computed: {
    addBtnEnable() {
      return this.logicalColumn && this.physicalColumn
    },
  },
}
