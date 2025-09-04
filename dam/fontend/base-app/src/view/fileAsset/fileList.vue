<template>
  <div class="citic-list folder-detail">
    <div class="area-title">
      <div class="page-title-row short">
        <span class="menu font-medium path">
          <span v-for="(i, k) in folderData.path" :key="k">
            {{ i }}
            <i class="fa fa-chevron-right" v-if="folderData"></i>
          </span>
        </span>
      </div>
    </div>
    <div class="area-table">
      <datablau-tab-with-table
        ref="fileListTable"
        class="table-tab-container"
        :columnDefs="columnDefs"
        :totalShow="totalShow"
        :getShowData="getShowData"
        :hideTopLine="true"
        :hideBottomLine="false"
        :tableOption="gridOptions"
        :tableHidePagination="false"
        :defaultParaData="defaultParaData"
        @cellClicked="cellClicked"
      ></datablau-tab-with-table>
    </div>
  </div>
</template>
<script>
import folderDetail from './fileList.js'
export default folderDetail
</script>
<style lang="scss" scoped>
.folder-detail {
  border-top: 1px solid rgba(0, 0, 0, 0);
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

  .area-table {
    height: calc(100% - 50px);
    // position: absolute;
    // left: 0;
    // top: 0;
    // bottom: 0;
    // right: 0;
  }
}
</style>
