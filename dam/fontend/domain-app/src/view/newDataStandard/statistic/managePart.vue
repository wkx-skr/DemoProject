<template>
  <div class="manage-container" style="min-width: 800px">
    <div class="form-part">
      <el-form :inline="true">
        <el-form-item :label="$t('domain.common.department')">
          <datablau-select
            size="mini"
            v-model="departmentValue"
            filterable
            clearable
          >
            <el-option
              v-for="item in partArr"
              :key="item"
              :label="item"
              :value="item"
            ></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item :label="$t('domain.common.system')">
          <datablau-select
            size="mini"
            v-model="systemValue"
            filterable
            clearable
          >
            <el-option
              v-for="item in systemArr"
              :key="item"
              :label="item"
              :value="item"
            ></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item>
          <datablau-button
            type="normal"
            size="mini"
            @click="search()"
            :disabled="tableLoading || updateRefresh"
          >
            {{ $t('domain.common.search') }}
          </datablau-button>
        </el-form-item>
        <el-form-item>
          <datablau-button type="secondary" size="mini" @click="reset()">
            {{ $t('domain.common.reset') }}
          </datablau-button>
        </el-form-item>
        <el-form-item>
          <datablau-button
            type="secondary"
            size="mini"
            :disabled="tableLoading || updateRefresh"
            @click="handleRefresh()"
          >
            {{ $t('domain.common.refresh') }}
          </datablau-button>
        </el-form-item>
        <el-form-item style="float: right; margin-right: 0">
          <datablau-button
            class="iconfont icon-export"
            type="important"
            @click="exportFileSearch"
          >
            {{ $t('domain.common.exportAll') }}
          </datablau-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table-part">
      <datablau-table
        class="datablau-table"
        :data="tableData"
        height="100%"
        v-loading="tableLoading || updateRefresh"
        :data-selectable="true"
        @selection-change="tableSelectionChanged"
      >
        <el-table-column
          prop="toName"
          :label="$t('domain.common.departmentName')"
          min-width="150"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="theme"
          :label="$t('domain.common.themeName')"
          min-width="150"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="categoryName"
          :label="$t('domain.common.systemName')"
          show-overflow-tooltip
          min-width="150"
        ></el-table-column>
        <el-table-column
          prop="refCount"
          :label="$t('domain.queryStandard.domainQuoteItemCount')"
          width="150"
          align="center"
        ></el-table-column>
      </datablau-table>
    </div>
    <div
      style="
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 50px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0px -5px 14px -8px rgb(0 0 0 / 20%);
        border-top: 1px solid transparent;
        z-index: 9;
      "
    >
      <div class="left-btn" style="display: flex; align-items: center">
        <span
          class="footer-row-info"
          v-show="selection.length && selection.length > 0"
        >
          {{
            $t('common.deleteMessage', {
              selection: selection.length,
            })
          }}
        </span>
        <div
          v-show="selection.length && selection.length"
          style="margin-left: 10px"
        >
          <datablau-button
            class="iconfont icon-export"
            size="mini"
            type="important"
            @click="exportFile"
          >
            {{ $t('domain.common.exportSelected') }}
          </datablau-button>
        </div>
      </div>
      <datablau-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="currentPage"
        :page-sizes="[20, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        :style="{ display: 'inline-block' }"
      ></datablau-pagination>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      tableData: [],
      tableLoading: false,
      currentPage: 1,
      pageSize: 20,
      total: 0,
      partArr: [],
      systemArr: [],
      departmentValue: '',
      systemValue: '',
      allData: [],
      storeData: [],
      selection: [],
      timer: null,
      updateRefresh: false,
    }
  },
  props: ['departmentName', 'systemName'],
  created() {
    // 获取系统
    this.$getModelCategories()
  },
  mounted() {
    this.$bus.$on('refreshEnd', () => {
      this.updateRefresh = false
      this.init()
    })
    console.log(this.departmentName)
    this.departmentValue = this.departmentName
    this.systemValue = this.systemName
    this.initDrop()
    this.init()
  },
  beforeDestroy() {
    this.$bus.$off('refreshEnd')
  },
  methods: {
    handleRefresh() {
      // debounce
      this.tableLoading = true
      this.updateRefresh = true
      this.timer && clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.$emit('handleStatisticsRefresh')
      }, 500)
    },
    init() {
      const requestBody = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        categoryName: this.systemValue,
        toName: this.departmentValue,
      }
      this.tableLoading = true
      this.$http
        .post(
          this.$meta_url + '/service/dashboard/domain/count/department',
          requestBody
        )
        .then(res => {
          this.tableData = res.data.content
          this.total = res.data.totalItems
          this.tableLoading = false
        })
        .catch(e => {
          this.tableLoading = false
          this.$showFailure(e)
        })
    },
    initDrop() {
      this.$http
        .get(this.$meta_url + '/service/dashboard/domain/count/department/drop')
        .then(res => {
          this.systemArr = res.data.category
          this.partArr = res.data.department
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    search() {
      this.currentPage = 1
      this.init()
    },
    reset() {
      this.departmentValue = ''
      this.systemValue = ''
      this.currentPage = 1
      this.init()
    },
    handleSizeChange(val) {
      this.currentPage = 1
      this.pageSize = val
      this.init()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.init()
    },
    tableSelectionChanged(selection) {
      this.selection = selection
    },
    // export search result
    exportFileSearch() {
      const requestBody = {
        categoryName: this.systemValue,
        toName: this.departmentValue,
        countIds: null,
      }
      this.$downloadFilePost(
        this.$meta_url + '/service/dashboard/domain/count/department/export',
        requestBody,
        this.$t('domain.queryStandard.domainCountByDepartmentAndTheme')
      )
    },
    exportFile() {
      var domainIds = this.selection.map(item => item.id)
      if (domainIds.length < 1) {
        this.$message.warning(this.$t('domain.common.pleaseCheckItems'))
      } else {
        const requestBody = {
          countIds: domainIds,
        }
        this.$downloadFilePost(
          this.$meta_url + '/service/dashboard/domain/count/department/export',
          requestBody,
          this.$t('domain.queryStandard.domainCountByDepartmentAndTheme')
        )
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.manage-container {
  width: 100%;
  .part-title {
    font-size: 16px;
    margin: 0;
    margin-bottom: 10px;
  }
  .form-part {
    // width: ;
    position: absolute;
    left: 0;
    right: 0;
    top: 24px;
    margin: 0;
  }
  .table-part {
    border-top: 1px solid #e5e5e5;
    position: absolute;
    width: 100%;
    top: 68px;
    bottom: 65px;
  }
}
</style>
