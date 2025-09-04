<template>
  <div class="listWrap">
    <datablau-list-search class="search-area">
      <el-form>
        <el-form-item>
          <datablau-input
            style="border-radius: 2px; display: inline-block"
            v-model="keyword"
            :placeholder="$t('meta.lineageManage.scriptManage.fillScriptName')"
            :iconfont-state="true"
            clearable
          ></datablau-input>
        </el-form-item>
        <el-form-item class="btn">
          <datablau-button type="normal" @click="handleSearch">
            {{ $t('common.button.query') }}
          </datablau-button>
        </el-form-item>
      </el-form>
    </datablau-list-search>
    <datablau-form-submit style="margin-top: 44px">
      <datablau-table
        :data="tableData"
        ref="multipleTable"
        height="100%"
        style="height: 100%"
        :singleSelect="single"
        @selection-change="handleSelectionChange"
      >
        <el-table-column width="18">
          <datablau-icon
            :data-type="'code'"
            :size="18"
            style="margin-top: 8px"
          ></datablau-icon>
        </el-table-column>
        <el-table-column
          prop="name"
          show-overflow-tooltip
          align="left"
          min-width="120"
          :label="$t('meta.lineageManage.scriptManage.scriptName')"
        ></el-table-column>
        <el-table-column
          prop="description"
          :label="$t('meta.lineageManage.scriptManage.description')"
          min-width="110"
          show-overflow-tooltip
          align="left"
        ></el-table-column>
        <el-table-column
          min-width="160"
          prop="lineageType"
          :label="$t('meta.lineageManage.scriptManage.lineageType')"
        ></el-table-column>
        <el-table-column
          prop="scriptTypeDesc"
          min-width="120"
          :label="$t('meta.lineageManage.scriptManage.langType')"
        ></el-table-column>
        <el-table-column
          prop="modifityTime"
          :label="$t('meta.lineageManage.scriptManage.modifityTime')"
          :formatter="$timeFormatter"
          width="120"
        ></el-table-column>
        <el-table-column
          prop="creator"
          min-width="100"
          :label="$t('meta.lineageManage.scriptManage.creator')"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="createTime"
          :label="$t('meta.lineageManage.scriptManage.createTime')"
          :formatter="$timeFormatter"
          width="120"
        ></el-table-column>
      </datablau-table>
      <template slot="buttons">
        <datablau-pagination
          style="float: left"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        ></datablau-pagination>
        <div style="float: right">
          <datablau-button type="secondary" @click="closeSelector">
            {{ $t('common.button.cancel') }}
          </datablau-button>
          <datablau-button type="primary" @click="confirmSelect">
            {{ $t('common.button.ok') }}
          </datablau-button>
        </div>
      </template>
    </datablau-form-submit>
  </div>
</template>
<script>
export default {
  props: {
    single: {
      type: Boolean,
      default: false,
    },
  },
  components: {},
  data() {
    return {
      keyword: '',
      tableData: null,
      pageSize: 20,
      currentPage: 1,
      total: 0,
      selected: [],
      showUpload: true,
    }
  },
  created() {},
  mounted() {
    this._getTableData()
  },
  methods: {
    confirmSelect() {
      this.$emit('confirm', this.selected)
    },
    closeSelector() {
      this.$emit('close')
    },
    handleSearch() {
      this.currentPage = 1
      this._getTableData()
    },
    async _getTableData() {
      let param = {
        keyword: this.keyword,
        currentPage: this.currentPage,
        pageSize: this.pageSize,
      }
      try {
        let res = await this.$http.post(
          `${this.$meta_url}/service/lineage/script/page`,
          param
        )
        if (Array.isArray(res.data.content) && res.data.content.length > 0) {
          let tempData = res.data.content.map(item => {
            return {
              scriptTypeDesc:
                item.scriptType === 'JAVASCRIPT'
                  ? 'javascript'
                  : this.$t('meta.lineageManage.scriptManage.regex'),
              ...item,
            }
          })
          this.tableData = tempData
          this.total = res.data.totalItems
        } else {
          this.tableData = []
          this.total = 0
        }
      } catch (e) {
        this.tableData = []
        this.$showFailure(e)
      }
    },
    handleSelectionChange(val) {
      if (this.single) {
        this.selected = [val]
      } else {
        this.selected = val
      }
    },
    handleEdit(row) {
      this.$emit('edit', row)
    },
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
      this._getTableData()
    },
    handleCurrentChange(current) {
      this.currentPage = current
      this._getTableData()
    },
  },
  watch: {
    /* keyword() {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.queryRules()
      }, 800)
    }, */
  },
}
</script>
<style lang="scss" scoped="scoped">
.listWrap {
  position: absolute;
  top: 10px;
  right: 0;
  left: 0;
  bottom: 0;
  min-width: 700px;
  .search-area {
    padding-left: 20px;
    //height: 34px;
    .topBtns {
      margin-right: 20px;
    }
  }
}
</style>
