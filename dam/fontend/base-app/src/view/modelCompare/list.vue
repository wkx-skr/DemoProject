<template>
  <div class="tab-page">
    <div class="filter-row">
      <div class="row-inner">
        <span class="label">模糊搜索</span>
        <el-input
          clearable
          v-model="keyword"
          style="width: 300px"
          size="small"
          suffix-icon="el-icon-search"
          placeholder="模糊搜索"
        ></el-input>
      </div>
      <div class="page-btn-group right-top">
        <el-button size="mini" @click="refresh">
          <i class="el-icon-refresh"></i>
          刷新
        </el-button>
      </div>
    </div>
    <div class="table-row" style="top: 10px">
      <el-table
        :data="dataDisplay"
        v-loading="loading"
        class="plain-table"
        ref="multipleTable"
        :stripe="true"
        :height="tableHeight"
        border
      >
        <el-table-column prop="name" label="模型名称"></el-table-column>
        <el-table-column prop="categoryName" label="所属系统"></el-table-column>
        <el-table-column
          label="操作"
          header-align="right"
          align="right"
          width="80"
        >
          <template slot-scope="scope">
            <el-button
              size="small"
              type="text"
              @click="handleEdit(scope.$index)"
            >
              比较
            </el-button>
          </template>
        </el-table-column>
        <el-table-column width="10"></el-table-column>
      </el-table>
    </div>
    <div class="footer-row">
      <el-pagination
        style="float: right"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[20, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </div>
  </div>
</template>

<script>
import list from './list.js'
export default list
</script>

<style lang="scss" scoped="scoped">
@import './list.scss';
</style>
