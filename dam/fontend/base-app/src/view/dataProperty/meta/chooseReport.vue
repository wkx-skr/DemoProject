<template>
  <div>
    <div id="lineage" class="tab-page">
      <div class="filter-row-info">
        <div class="row-inner">
          <div class="search-container">
            <datablau-input
              placeholder="输入关键字进行搜索"
              v-model="keyword"
              :clearable="true"
              :iconfont-state="true"
            ></datablau-input>
          </div>
          <datablau-tooltip
            content="根据需求编号、报表编号、名称、类型、负责人进行搜索"
            placement="right"
          >
            <i class="iconfont icon-tips"></i>
          </datablau-tooltip>
        </div>
      </div>
      <div class="table-row">
        <!-- :height="tableHeight" -->
        <datablau-table
          ref="reportTable"
          :data="tableDataShow"
          height="100%"
          :stripe="true"
          @selection-change="handleSelectionChange"
          @sort-change="handleSortChange"
          @filter-change="colFilterHandler"
          border
        >
          <el-table-column width="20"></el-table-column>
          <el-table-column
            type="selection"
            width="55"
            v-if="hasAccess"
          ></el-table-column>
          <el-table-column
            label="报表编号"
            prop="code"
            column-key="code"
            :min-width="70"
            sortable="custom"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            label="报表名称"
            prop="name"
            column-key="name"
            :min-width="70"
            sortable="custom"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            label="报表类型"
            prop="type"
            column-key="type"
            :min-width="70"
            show-overflow-tooltip
            :formatter="typeFommatter"
            :filters="appTypes"
          ></el-table-column>
          <el-table-column
            label="我方负责人"
            prop="owner"
            column-key="owner"
            :min-width="80"
            show-overflow-tooltip
            :filters="ownerFilterArr"
          ></el-table-column>
          <el-table-column
            label="提交日期"
            prop="createTime"
            column-key="createTime"
            :min-width="60"
            show-overflow-tooltip
            :formatter="$dateFormatter"
            sortable="custom"
          ></el-table-column>
          <el-table-column
            label="操作"
            ref="check"
            header-align="right"
            align="right"
            fixed="right"
          >
            <template slot-scope="scope">
              <datablau-button
                type="text"
                @click="editReportForm(scope.row, scope.$index)"
                size="small"
              >
                <span>添加</span>
              </datablau-button>
            </template>
          </el-table-column>
        </datablau-table>
      </div>
    </div>
    <div class="dialog-bottom" style="bottom: 9px">
      <datablau-button
        icon="el-icon-delete"
        v-if="hasAccess"
        type="danger"
        size="small"
        @click="deleteRow"
        :disabled="deleteDisabled"
      >
        {{ $t('common.button.delete') }}
      </datablau-button>
      <datablau-pagination
        style="float: right"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="currentPage"
        :page-sizes="[20, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalShow"
      ></datablau-pagination>
    </div>
  </div>
</template>

<script>
import reportFormManageTab from './reportFormManageTab.js'
export default reportFormManageTab
</script>
<style lang="scss" scoped>
.tab-page {
  height: 380px;
  position: relative;
  /*position: absolute;*/
  /*top: 0;*/
  /*left: 0;*/
  /*right: 0;*/
  /*bottom: 0;*/
  overflow: hidden;
  .filter-row-info {
    // padding-left: 20px;
    height: 60px;
    border-bottom: 1px solid #eee;
    .row-inner {
      margin-top: 0;
      overflow: auto;
      min-width: 900px;
      height: 60px;
      .search-container {
        display: inline-block;
        width: 50%;
        max-width: 300px;
        min-width: 200px;
      }
    }
  }
  .table-row {
    position: absolute;
    left: 0;
    right: 0;
    top: 50px;
    bottom: 0px;
    border-bottom: 1px solid #eee;
  }
}
</style>
