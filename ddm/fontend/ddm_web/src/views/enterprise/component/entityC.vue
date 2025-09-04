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
      <el-table-column prop="name" label="实体名称">
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
      <el-table-column label="操作">
        <template scope="{row}">
          <span class="jumpClick" @click="bindPhysical(row)">绑定物理表</span>
        </template>
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
    <!--  实体绑定的弹窗  -->
    <entity-binding :dataJson="binding" :flagClear="flagClear" :binFlag="binFlag" @close="bingingClose"></entity-binding>
  </div>
</template>

<script>
import HTTP from '@/resource/http'
import entityBinding from './entityBinding'
export default {
  components: { entityBinding },
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
        val.combinedId && this.getBingC()
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
      originList: [],
      binFlag: false,
      binding: {
        bindTil: '',
        id: ''
      },
      flagClear: false
    }
  },
  methods: {
    getBingC () {
      this.loading = true
      HTTP.getBingC({ entityId: this.parentData.combinedId }).then(res => {
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
    },
    // 绑定物理表
    bindPhysical (row) {
      this.binFlag = true
      this.binding.bindTil = `C'绑定物理表`
      this.binding.id = row.combinedId
    },
    bingingClose () {
      this.binFlag = false
      this.flagClear = !this.flagClear
    },
    physical (row) {
      row.entityFlag = 'entityC'
      let aliasList = JSON.parse(row.alias)
      row.aliasName = aliasList.alias
      row.typeName = `C'`
      row.definition = aliasList.definition
      this.$bus.$emit('showLowerData', { parentData: this.parentData, row })
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
</style>
