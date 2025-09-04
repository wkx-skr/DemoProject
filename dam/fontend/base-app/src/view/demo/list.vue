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
          <i class="icon-ic-quality-export"></i>
          刷新
        </el-button>
        <el-button type="primary" size="small" @click="addTab">添加</el-button>
      </div>
    </div>
    <div class="table-row">
      <el-table
        :data="dataDisplay"
        class="plain-table"
        ref="multipleTable"
        :stripe="true"
        :height="tableHeight"
        @selection-change="handleSelectionChange"
        border
      >
        <el-table-column type="selection"></el-table-column>
        <el-table-column
          prop="name"
          :label="$version.quality.ruleName"
        ></el-table-column>
        <el-table-column
          prop="modelCategoryId"
          :formatter="$mappingCategory"
          label="系统"
        ></el-table-column>
        <el-table-column
          prop="createTime"
          label="创建时间"
          :formatter="$timeFormatter"
          width="190"
        ></el-table-column>
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
              编辑
            </el-button>
          </template>
        </el-table-column>
        <el-table-column width="10"></el-table-column>
      </el-table>
    </div>
    <div class="footer-row">
      <el-button
        icon="el-icon-delete"
        type="danger"
        size="small"
        @click="preDeleteRows"
        :disabled="deleteDisabled"
      >
        {{ $t('common.button.delete') }}
      </el-button>
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
