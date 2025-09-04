<template>
  <div class="ddl-setting-list-tab">
    <div class="top-header-info-panel-wrapper">
      <b>DDL 配置</b>
    </div>
    <div class="top-title">
      <div class="search-box">
        <!--请输入关键字-->
        <datablau-input
          size="small"
          :iconfont-state="true"
          v-model="keyword"
          placeholder="搜索模型类型"
          clearable
          style="display: inline-block;vertical-align: top;display: inline-block; margin-left: 10px;"
        ></datablau-input>
      </div>
    </div>
    <datablau-form-submit class="submit-component db-ddl-setting-table">
      <datablau-table
        :data="tableData"
        row-class-name="row-can-click1"
        height="100%"
        :data-selectable="false"
      >
        <!--模型类型-->
        <el-table-column
          prop="text"
          label="模型类型"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <database-type
              :key="scope.row.text"
              :value="scope.row.text"
              :size="24"
              style="display: inline-block;margin-right: 3px;"
            ></database-type>
          </template>
        </el-table-column>

        <!--描述-->
        <!--<el-table-column-->
        <!--  prop="description"-->
        <!--  :label="this.$v.udp.description"-->
        <!--  show-overflow-tooltip-->
        <!--  min-width="250px"-->
        <!--&gt;-->
        <!--</el-table-column>-->

        <!--操作-->
        <el-table-column
          :label="$v.RuleChecking.operation"
          width="160"
          header-align="center"
          align="center"
          fixed="right"
        >
          <template slot-scope="scope">
            <!--编辑-->
            <datablau-button
              type="icon"
              tooltip-content="脚本配置"
              class="iconfont icon-bianji"
              @click="editDdl(scope.row)"
            >
            </datablau-button>
          </template>
        </el-table-column>
      </datablau-table>
      <template slot="buttons">

        <!--<div class="footer-tool" v-show="selection.length > 0">-->
        <!--  <div class="disc-text">-->
        <!--    当前选中“{{ selection.length }}条”信息，是否-->
        <!--  </div>-->
        <!--  <datablau-button @click="deleteBatch" type="danger" class="el-icon-delete">-->
        <!--    删除-->
        <!--  </datablau-button>-->
        <!--</div>-->

        <datablau-pagination
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          :page-size="pageSize"
          :page-sizes="[20, 50, 100]"
          :current-page.sync="currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        ></datablau-pagination>
      </template>
    </datablau-form-submit>
  </div>
</template>

<script>
import dbType from '@/components/dataSource/databaseType.js'
import databaseType from '@/components/common/DatabaseType.vue'

export default {
  name: 'dbList',
  data () {
    return {
      total: 0,
      pageSize: 20,
      currentPage: 1,
      keyword: '',
      tableData: null
    }
  },
  components: {
    databaseType
  },
  props: {},
  beforeMount () {
  },
  computed: {},
  mounted () {
    this.dataInit()
  },
  methods: {
    dataInit () {
      this.getShowData()
    },
    handleFilterChange () {
      this.currentPage = 1
      this.getShowData()
    },
    handleSizeChange (pageSize) {
      this.pageSize = pageSize
      this.currentPage = 1
      this.getShowData()
    },
    handleCurrentChange (currentPage) {
      this.currentPage = currentPage
      this.getShowData()
    },
    getShowData () {
      let arr = dbType.SQL_DB_LIST.concat(dbType.NO_SQL_DB_LIST)
      let keyword = (_.trim(this.keyword) || '').toLowerCase()
      arr = arr.filter(item => {
        return item.text.toLowerCase().indexOf(keyword) !== -1
      })

      this.total = arr.length

      let s = this.pageSize
      let c = this.currentPage

      this.tableData = arr.slice(s * (c - 1), s * c)
      console.log(this.tableData, 'tableData')
    },
    editDdl (data) {
      this.$emit('editDdlSetting', { dbType: data.text })
    }
  },
  watch: {
    keyword (val) {
      this.handleFilterChange()
    }
  }
}
</script>

<style lang="scss" scoped>
.ddl-setting-list-tab {
  .top-header-info-panel-wrapper {
    height: 40px;
    line-height: 40px;
    //margin-top: -20px;
    vertical-align: top;
    padding-left: 20px;
  }

  .top-title {
    position: relative;
    padding-left: 20px;

    .search-box {
      display: inline-block;

      .label {
        font-size: 12px;
        margin-right: 10px;
        margin-left: 20px;
        font-weight: bold;
      }
    }

    .el-input {
      width: 200px;
      height: 34px;
      vertical-align: middle;
    }

    .top-button {
      position: absolute;
      right: 0;
      top: 0;
    }
  }

  .db-ddl-setting-table {
    position: absolute;
    left: 0;
    right: 0;
    top: 75px;
    bottom: 0;

  }
}

</style>
