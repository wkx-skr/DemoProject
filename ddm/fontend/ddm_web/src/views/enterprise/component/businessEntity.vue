<template>
  <div>
    <div class="table-controller">
      <span>包含实体（{{ totalObjects }}个）</span>
      <div class="search-props">
        <datablau-select
          v-if="level === 1"
          v-model="categoryId"
          placeholder="请选择"
          size="small"
        >
          <el-option
            v-for="item in areaOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id">
          </el-option>
        </datablau-select>
        <datablau-input size="small" placeholder="搜索名称" v-model="keyword" style="margin-left: 10px;"></datablau-input>
        <datablau-button style="margin-left:10px" @click="queryTableData">查询</datablau-button>
      </div>
      <div>
        <datablau-button size="mini" type="primary" @click="entityList">刷新</datablau-button>
      </div>
    </div>

    <datablau-table
      :data="tableData"
    >
      <el-table-column prop="name" label="实体名称">
        <template scope="{row}"><span class="jumpClick" @click="physical(row)">{{row.name}}</span></template>
      </el-table-column>
      <el-table-column prop="alias" label="中文名称">
        <template scope="{row}"><span class="jumpClick" @click="physical(row)">{{row.aliasName}}</span></template>
      </el-table-column>
      <el-table-column prop="description" label="描述" show-overflow-tooltip>
        <template scope="{row}">{{row.definition}}</template>
      </el-table-column>
      <el-table-column prop="origin" label="来源" show-overflow-tooltip>
        <template scope="{row}"><span class="jumpClick" @click="originBtn(row)">{{Object.values(row.parentObject).length}}个</span></template>
      </el-table-column>
      <el-table-column prop="" label="操作" show-overflow-tooltip>
        <template scope="{row}">
          <span class="jumpClick margR10" @click="bindC(row)">绑定C'</span>
          <span class="jumpClick" @click="bindPhysical(row)">绑定物理表</span>
        </template>
      </el-table-column>
    </datablau-table>
    <div style="margin-top: 10px; float: right;">
      <datablau-pagination
        :current-page='entityObj.currentPage + 1'
        :total="entityObj.total"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="entityObj.pageSize"
        @size-change="handlePageSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <datablau-dialog class="company-info-edit-wrapper" :visible.sync="flag" width="800px" title="业务实体来源列表">
      <datablau-table :data="originList" v-loading="loading" class="tableDialog">
        <el-table-column prop="name" show-overflow-tooltip label="对象名称">
          <template scope="{row}">
            <span v-show="parentData" class="jumpClick" @click="nameClick(row)">{{row.name}}</span>
            <span v-show="!parentData">{{row.name}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="code" show-overflow-tooltip label="编号"></el-table-column>
        <el-table-column prop="description" show-overflow-tooltip label="描述"></el-table-column>
        <el-table-column prop="status" show-overflow-tooltip label="状态">
          <template scope="{row}">
            {{row.status === 'NotSubmitted' ? '未提交' : row.status === 'UnderReview' ? '未审核' : '已发布'}}
          </template>
        </el-table-column>
        <el-table-column prop="lastModifiedTime" show-overflow-tooltip label="更新时间">
          <template scope="{row}">
            {{time(row.lastModifiedTime)}}
          </template>
        </el-table-column>
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
    entityObj: {
      type: Object,
      default: () => {}
    },
    tableData: {
      type: Array,
      default: () => []
    },
    totalObjects: {
      type: Number,
      default: () => 0
    },
    level: {
      type: Number,
      default: () => 0
    },
    areaOptions: {
      type: Array,
      default: () => []
    },
    parentData: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      keyword: '',
      dataList: [],
      categoryId: '',
      originList: [],
      flag: false,
      loading: false,
      binFlag: false,
      binding: {
        bindTil: '',
        id: ''
      },
      flagClear: false
    }
  },
  watch: {
    level () {
      this.categoryId = ''
    }
  },
  methods: {
    bingingClose () {
      this.binFlag = false
      this.flagClear = !this.flagClear
    },
    nameClick (row) {
      this.flag = false
      this.$bus.$emit('showLowerData', { parentData: this.parentData, row })
    },
    time (val) {
      let data = new Date(parseInt(val))
      let year = data.getFullYear()
      let month = data.getMonth() + 1
      let dates = data.getDate()
      let hours = data.getHours()
      let minute = data.getMinutes()
      let second = data.getSeconds()
      return `${year}-${month < 10 ? '0' + month : month}-${dates < 10 ? '0' + dates : dates} ${hours < 10 ? '0' + hours : hours}:${minute < 10 ? '0' + minute : minute}:${second < 10 ? '0' + second : second}`
    },
    handlePageSizeChange (val) {
      this.entityObj.pageSize = val
      this.entityList()
    },
    handleCurrentChange (val) {
      this.entityObj.currentPage = val
      this.entityList()
    },
    queryTableData () {
      this.entityList()
    },
    entityList () {
      let params = {
        categoryId: this.categoryId,
        content: this.keyword,
        currentPage: this.entityObj.currentPage ? this.entityObj.currentPage - 1 : 0,
        pageSize: this.entityObj.pageSize
      }
      this.$emit('entityList', params)
    },
    physical (row) {
      this.$emit('physical', row)
    },
    originBtn (row) {
      this.flag = true
      this.loading = true
      let ids = Object.keys(row.parentObject).join(',')
      HTTP.searchObj({ ids }).then(res => {
        this.originList = res
        this.loading = false
      })
    },
    // 绑定C`
    bindC (row) {
      this.binFlag = true
      this.binding.bindTil = `绑定C'`
      this.binding.id = row.combinedId
    },
    // 绑定物理表
    bindPhysical (row) {
      this.binFlag = true
      this.binding.bindTil = '绑定物理表'
      this.binding.id = row.combinedId
    }
  },
  mounted () {

  }
}
</script>

<style scoped lang='scss'>
  .table-controller{
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .search-props{
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .search-props .el-input{
    margin-left: 10px;
  }
  .jumpClick{
    color: #409eff;
    cursor: pointer;
  }
  /deep/.el-dialog__body{
    height: 220px;
  }
  .margR10{
    margin-right: 15px;
  }
</style>
