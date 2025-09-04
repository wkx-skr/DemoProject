<template>
  <div id="data-source" class="tab-page">
    <el-dialog
      title="创建虚拟数据源"
      v-if="dialogCrVdsVisible"
      :visible.sync="dialogCrVdsVisible"
      :append-to-body="true"
    >
      <create-virds
        ref="createVirds"
        :currentDataSource="currentDataSource"
        @handleCreated="handleCreated"
      ></create-virds>
    </el-dialog>
    <div class="filter-row">
      <div class="row-inner">
        <div class="search-container">
          <el-input
            size="small"
            placeholder="输入关键字进行搜索"
            v-model="keyword"
            :clearable="true"
          ></el-input>
        </div>
        <!--<el-button size="small" class="green-btn addButton el-btn" @click="handleCreateVirDS">创建虚拟数据源</el-button>-->
      </div>
    </div>
    <div class="table-row">
      <el-table
        class="el-table plain-table"
        ref="dsTable"
        :key="tableKey"
        v-loading="loadingDS"
        :data="displayData"
        :height="tableHeight"
        :stripe="true"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        :row-class-name="tableRowClassName"
        border
      >
        <el-table-column
          label="数据源名称"
          min-width="100"
          prop="definition"
          show-overflow-tooltip
          sortable="custom"
        >
          <template slot-scope="scope">
            {{ scope.row.definition }}
            <el-tooltip
              content="该数据源为主数据源"
              placement="right"
              v-show="scope.row.primaryModel"
            >
              <i class="el-icon-circle-check"></i>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column
          prop="type"
          label="类型"
          sortable="custom"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="categoryName"
          min-width="100"
          label="所属系统"
          show-overflow-tooltip
          sortable="custom"
        ></el-table-column>
        <!--<el-table-column prop="creationTime" label="创建日期" min-width="180" :formatter="$timeFormatter" sortable="custom">
        </el-table-column>-->
        <el-table-column type="expand" width="120" label="数据连接描述">
          <template slot-scope="scope">
            <el-tag
              style="margin-right: 10px"
              :disable-transitions="true"
              size="small"
              :key="key"
              v-for="(value, key) in scope.row.connectionInfo.parameterMap"
            >
              <b>{{ key }} :</b>
              {{ value }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="虚拟数据源名称" show-overflow-tooltip>
          <template slot-scope="scope">
            <span v-if="vdpMap[scope.row.modelId]">
              {{ vdpMap[scope.row.modelId].name }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="虚拟数据源显示名" show-overflow-tooltip>
          <template slot-scope="scope">
            <span v-if="vdpMap[scope.row.modelId]">
              {{ vdpMap[scope.row.modelId].displayName }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="虚拟数据源描述" show-overflow-tooltip>
          <template slot-scope="scope">
            <span v-if="vdpMap[scope.row.modelId]">
              {{ vdpMap[scope.row.modelId].description }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="140"
          header-align="right"
          align="center"
          fixed="right"
          v-if="showMore"
        >
          <template slot-scope="scope">
            <el-button
              v-if="!vdpMap[scope.row.modelId]"
              type="text"
              size="mini"
              @click="handleCreateVirDS(scope.row)"
              :disabled="!isEable(scope.row)"
            >
              创建虚拟数据源
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="footer-row">
      <el-pagination
        style="float: right"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="currentPage"
        :page-sizes="[20, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </div>
  </div>
</template>

<script>
import js from './dataSourceTab.js'
export default js
</script>
<style lang="scss" scoped>
.tab-page {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  .filter-row {
    padding-left: 20px;
    height: 60px;
    line-height: 60px;
    border-bottom: 1px solid #eee;
    .search-container {
      display: inline-block;
      width: 50%;
      max-width: 300px;
      min-width: 200px;
    }
    .addButton {
      float: right;
      margin-right: 20px;
    }
    .row-inner {
      margin-top: 10px;
    }
  }
  .table-row {
    position: absolute;
    left: 0;
    right: 0;
    top: 60px;
    bottom: 60px;
    border-bottom: 1px solid #eee;
  }
  .footer-row {
    z-index: 9;
  }
}
</style>
<style lang="scss">
.el-table .success-row {
  /*background: #f0f9eb !important;*/
  td {
    background: #f0f9eb !important;
  }
}
</style>
