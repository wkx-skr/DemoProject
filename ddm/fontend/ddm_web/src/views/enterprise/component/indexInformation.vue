<template>
  <div>
<!-- 索引信息-->
    <datablau-table
      v-loading="loading"
      class="datablau-table thin"
      :data="indexS"
      ref="tableDetailList"
    >
      <el-table-column label="索引名称">
        <template slot-scope="scope">
          <span>{{scope.row.properties.Name}}</span>
        </template>
      </el-table-column>
      <el-table-column label="宏">
        <template slot-scope="scope">
          <span>{{scope.row.properties.Macro}}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="类型"
        :min-width="50"
        prop="properties.KeyGroupType"
        :formatter="keyNameFormatter">
      </el-table-column>
      <el-table-column
        label="成员字段"
        :min-width="120"
        show-overflow-tooltip
        :formatter="joinColumns"
      >
      </el-table-column>
    </datablau-table>
  </div>
</template>

<script>
import HTTP from '@/resource/http'
import _ from 'lodash'
export default {
  props: {
    parentData: {
      type: Object,
      default: () => {}
    },
    activeName: {
      type: String,
      default: () => ''
    }
  },
  watch: {
    parentData: {
      handler (val) {
        if (val.combinedId) {
          this.bindId = val.combinedId
          this.bindId && this.getDiagramContent()
        }
      },
      deep: true,
      immediate: true
    }
  },
  data () {
    return {
      loading: false,
      tables: [],
      indexS: [],
      bindId: '',
      columnsMap: new Map()
    }
  },
  methods: {
    joinColumns (row) {
      let columns = []
      row.children && row.children.forEach(item => {
        columns.push(this.columnsMap.get(item.properties.AttributeRef).Name)
      })
      return columns.join(', ')
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
    getDiagramContent () {
      HTTP.getElementContent({
        modelId: this.bindId.split('/')[0],
        elementId: this.bindId.split('/')[1],
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
          // this.dataByType = dataColumnOrdered
          this.afterHandleDialogData(dataColumnOrdered)
        }
      })
    },
    afterHandleDialogData (data) {
      let dialog = {}
      dialog.visible = true
      dialog.tableMsg = data.properties
      dialog.columnsMsg = []
      dialog.pk = []
      dialog.fk = []
      dialog.uk = []
      dialog.nk = []
      if (Array.isArray(data.children)) {
        data.children.forEach(item => {
          if (item.properties['RawType'] === 'Attribute') {
            dialog.columnsMsg.push(item)
          } else if (item.properties['RawType'] === 'KeyGroup' && item.properties['KeyGroupType'] === 'PrimaryKey') {
            dialog.pk.push(item)
          } else if (item.properties['RawType'] === 'KeyGroup' && item.properties['KeyGroupType'] === 'ForeignKey') {
            dialog.fk.push(item)
          } else if (item.properties['RawType'] === 'KeyGroup' && item.properties['KeyGroupType'] === 'UniqueKey') {
            dialog.uk.push(item)
          } else if (item.properties['RawType'] === 'KeyGroup' && item.properties['KeyGroupType'] === 'NonUniqueKey') {
            dialog.nk.push(item)
          }
        })
      }
      const exist = this.tables.some(table => {
        return table.tableMsg.Id === dialog.tableMsg.Id
      })
      if (!exist) {
        this.tables.push(dialog)
      } else {
        this.tables.forEach(table => {
          if (table.tableMsg.Id === dialog.tableMsg.Id) {
            Object.keys(dialog).forEach(p => {
              this.$set(table, p, dialog[p])
            })
          }
        })
      }
      const [{ pk, fk, uk, nk, columnsMsg: columns, tableMsg }] = this.tables
      columns.forEach(item => {
        this.columnsMap.set(item.properties.Id, item.properties)
      })
      this.indexS = [...pk, ...fk, ...uk, ...nk]
      this.$bus.$emit('tableMsg', tableMsg)
    }
  },
  mounted () {
  }
}
</script>

<style scoped lang='scss'>
.datablau-table{
  td{
    text-align: left;
  }
}
</style>
