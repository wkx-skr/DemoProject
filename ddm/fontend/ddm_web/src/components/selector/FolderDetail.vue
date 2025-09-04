<template>
  <div style="position:relative;height:100%;width:100%;" class="folder-detail" id="domainFolder">
    <div class="tree-search-box">
      <datablau-input
        style="width: 100%"
        size="small"
        suffix-icon="el-icon-search"
        :placeholder="$store.state.$v.dataEntity.filterDomain"
        v-model="keyword"
        clearable
        :themeBlack="$route.path.indexOf('sql_editor') !== -1 ? true: false"
      ></datablau-input>
    </div>
    <div style="position:absolute;top: 40px;bottom: 0;width:100%;border-bottom:1px solid #E6E6E6;overflow:auto;" :style="{borderBottom: $route.path.indexOf('sql_editor') !== -1 ? 'none': '#E6E6E6'}">
      <datablau-table
        class="datablau-table"
        height="100%"
        ref="domainTable"
        :data="tableData"
        v-loading="tableLoading"
        @select="selectDomain"
        :themeBlack="$route.path.indexOf('sql_editor') !== -1 ? true: false"
      >
        <el-table-column v-if="!draggable" label width="28">
          <template slot-scope="scope">
            <el-radio class="el-radio-domainTable" :class="{'black-el-radio':$route.path.indexOf('sql_editor') !== -1}" :label="scope.row" @change="domainChanged" v-model="selectedDomain"></el-radio>
          </template>
        </el-table-column>
        <el-table-column
          min-width="60px"
          :label="$store.state.$v.dataEntity.basicName"
          prop="chName"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span><i class="iconfont icon-biaozhun" style="color: #57a07f;font-size: 16px;margin-right: 5px;margin-left: -10px;"></i>{{scope.row.chName}}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$store.state.$v.doaminSelector.enName"
          prop="enName"
          min-width="60px"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          min-width="60px"
          :label="$store.state.$v.dataEntity.DomainCode"
          prop="domainCode"
          show-overflow-tooltip
        >
        </el-table-column>
      </datablau-table>
    </div>
    <!--<div style="position:absolute;bottom:10px;left:20px;right:0">
      <el-pagination
        style="margin-left: -10px"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="currentPage"
        :page-sizes="[20, 50, 100]"
        :page-size="pageSize"
        :pager-count="5"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </div>-->
  </div>
</template>
<script>
import folderDetail from './FolderDetail'
export default folderDetail
</script>
<style lang="scss" scope>
  .folder-detail {
    border-top: 1px solid rgba(0,0,0,0);
    .ag-root {
      // ag-grid 根元素
      $headerHigth: 50px;
      .ag-header {
        .ag-header-row {
          .ag-header-cell {
            height: $headerHigth;
            line-height: $headerHigth;
            &::after {
              height: $headerHigth;
            }
          }
        }
      }
    }
    .circle {
      position: relative;
      bottom: 1px;
      display: inline-block;
      margin-right: 7px;
      background-color: #5CB793;
      border-radius: 3.5px;
      width: 7px;
      height: 7px;
    }
  }
  #domainFolder .st-page-form {
    @media (max-width: 1525px) {
      .el-form-item__content {
        //border: 1px solid red;
        width: 110px;
        .el-input {
          width: 110px;
        }
        .el-button {
          padding: 7px 10px;
        }
      }
    }
  }
</style>
<style lang="scss">
#domainFolder {
  .el-pagination__editor.el-input {
    width: 50px;
  }
  .el-pagination .el-select .el-input {
    width: 100px;
  }
  .el-pagination {
    text-align: right;
  }
}
.black-el-radio{
  .el-radio__inner{
    background-color: transparent;
    border-color: #888888;;
  }
  .el-radio__input.is-checked .el-radio__inner{
    border-color: #187FFF;
    background: #187FFF;
  }
  .el-radio__inner::after{
    background-color: #333;
  }
}
.el-radio-domainTable{
  .el-radio__label{
    display: none;
  }
}
</style>
