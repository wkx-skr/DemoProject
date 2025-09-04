<template>
  <div>
    <datablau-table
      v-loading="loading"
      class="datablau-table thin"
      :data="tableData"
      :header-cell-style="headCellStyle"
      :cell-style="cellStyle"
      fit
    >
      <el-table-column prop="name" label="表/视图名称">
        <template scope="{row}">
          <span class="jumpClick" @click="physical(row)">{{row.name}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="aliasName" label="中文名称">
        <template scope="{row}">
          <span class="jumpClick" @click="physical(row)">{{row.aliasName}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="definition" show-overflow-tooltip label="描述">
      </el-table-column>
      <el-table-column prop="parentObject" label="来源">
        <template scope="{row}"><span class="jumpClick" @click="originBtn(row)">{{Object.values(row.parentObject).length}}个</span></template>
      </el-table-column>
    </datablau-table>
    <datablau-dialog class="company-info-edit-wrapper" :visible.sync="flag" width="800px" title="物理表来源列表">
      <datablau-table :data="originList" v-loading="loadings" class="tableDialog">
        <el-table-column prop="name" show-overflow-tooltip label="名称">
          <template scope="{row}">
<!--            <span v-show="parentData" class="jumpClick" @click="nameClick(row)">{{row.name}}</span>-->
            <span>{{row.name}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="aliasName" show-overflow-tooltip label="中文名称"></el-table-column>
        <el-table-column prop="definition" show-overflow-tooltip label="描述"></el-table-column>
      </datablau-table>
    </datablau-dialog>
  </div>
</template>

<script>
import HTTP from '@/resource/http'
export default {
  props: {
    parentData: {
      type: Object,
      default: () => {}
    }
  },
  watch: {
    parentData: {
      handler (val) {
        if (val.combinedId) {
          if (val.entityFlag === 'entityC') {
            this.entityC()
          } else {
            this.getEntity()
          }
        }
      },
      deep: true,
      immediate: true
    }
  },
  data () {
    return {
      tableData: [],
      headCellStyle: {
        textAlign: 'left',
        fontWeight: 'bold',
        color: '#494850',
        fontSize: '12px',
        height: '32px',
        padding: 0
      },
      cellStyle: {
        textAlign: 'left',
        fontSize: '12px',
        height: '32px',
        padding: 0
      },
      loading: true,
      loadings: false,
      flag: false,
      originList: []
    }
  },
  methods: {
    physical (row) {
      row.entityFlag = 'physical'
      let aliasList = JSON.parse(row.alias)
      row.aliasName = aliasList.alias
      row.typeName = '物理表'
      row.definition = aliasList.definition
      this.$bus.$emit('showLowerData', { parentData: this.parentData, row })
    },
    getEntity () {
      this.loading = true
      HTTP.getEntity({ entityId: this.parentData.combinedId }).then(res => {
        res.forEach(item => {
          item.aliasName = JSON.parse(item.alias).alias
          item.definition = JSON.parse(item.alias).definition
          item.parentObject = JSON.parse(item.alias).parentObject
        })
        this.tableData = res
        this.loading = false
      }).catch(e => {
        this.tableData = []
        this.loading = false
      })
    },
    entityC () {
      this.loading = true
      HTTP.getCphysic({ entityId: this.parentData.combinedId }).then(res => {
        res.forEach(item => {
          item.aliasName = JSON.parse(item.alias).alias
          item.definition = JSON.parse(item.alias).definition
          item.parentObject = JSON.parse(item.alias).parentObject
        })
        this.tableData = res
        this.loading = false
      }).catch(e => {
        this.tableData = []
        this.loading = false
      })
    },
    originBtn (row) {
      this.flag = true
      this.loadings = true
      let ids = Object.keys(row.parentObject).join(',')
      HTTP.findOrigin({ ids }).then(res => {
        res.forEach(item => {
          item.aliasName = JSON.parse(item.alias).alias
          item.definition = JSON.parse(item.alias).definition
        })
        this.originList = res
        this.loadings = false
      })
    }
  },
  mounted () {

  }
}
</script>

<style scoped lang='scss'>
  /deep/ .el-tabs{
    padding-bottom: 48px;
  }
  .jumpClick{
    color: #409eff;
    cursor: pointer;
  }
</style>
