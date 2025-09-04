<template>
  <div class="page-outer" style="padding: 0">
    <div class="page-container">
      <div class="com-table" :key="key">
        <el-table
          v-if="false"
          :class="{ hidden: !showTable }"
          class="finder-table"
          :data="tableData"
          :height="tableHeight"
          header-cell-class-name="headerCell"
          border
          @cell-click="handleCellClick"
        >
          <el-table-column :width="40"></el-table-column>
          <el-table-column
            v-for="col in fullHeader"
            :key="col.label"
            :label="col.label"
            :prop="col.label"
            :class-name="col.class"
            show-overflow-tooltip
            :width="200"
            :formatter="cellFormatter"
          >
            <template slot="header" slot-scope="scope">
              <span style="height: 132px">
                <div
                  class="row-select"
                  @click="handleColumnClick(col, $event)"
                ></div>
                <div class="row-title">
                  <span class="type">
                    <span
                      v-if="
                        col.type === 'Timestamp' ||
                        col.type === 'Time' ||
                        col.type === 'Date'
                      "
                    >
                      <i class="fa fa-calendar"></i>
                    </span>
                    <span v-if="col.type === 'Binary'">
                      <i class="fa fa-btc"></i>
                    </span>
                    <span v-else-if="col.physicalType === 'boolean'">
                      <i class="fa fa-adjust"></i>
                    </span>
                    <span v-else-if="col.physicalType === 'string'">ABC</span>
                    <span v-else-if="col.physicalType === 'long'">#</span>
                    <span v-else-if="col.physicalType === 'double'">#.#</span>
                  </span>
                  <span
                    class="label one-line-eclipse"
                    @click="handleColumnClick(col, $event)"
                  >
                    {{ col.label }}
                  </span>
                  <span class="drop">
                    <el-dropdown trigger="click" size="medium">
                      <span class="el-dropdown-link">
                        <i
                          class="el-icon-arrow-down el-icon&#45;&#45;right"
                        ></i>
                      </span>
                      <el-dropdown-menu slot="dropdown">
                        <!--<el-dropdown-item>删除</el-dropdown-item>-->
                      </el-dropdown-menu>
                    </el-dropdown>
                  </span>
                </div>
                <div class="row-line"></div>
                <div class="row-gun">
                  <columnar
                    :data="{ col: col, data: columnMap[col.label] }"
                  ></columnar>
                </div>
              </span>
            </template>
          </el-table-column>
        </el-table>
        <div style="height: 100%">
          <ag-grid-vue
            style="width: 100%; height: 100%"
            class="ag-theme-balham finder-table"
            id="myGrid"
            :gridOptions="gridOptions"
            @grid-ready="onGridReady"
            :columnDefs="columnDefs"
            :rowData="rowData"
            :suppressMenuHide="true"
            :frameworkComponents="frameworkComponents"
            :defaultColDef="defaultColDef"
          ></ag-grid-vue>
        </div>
      </div>
      <div class="com-recipe">
        <!--<add-step></add-step>-->
        <recipe-list
          ref="recipe"
          key="recipeList"
          v-show="currentSide === 'recipe'"
        ></recipe-list>
        <suggestion
          v-if="currentSide === 'suggestion'"
          :key="'suggestion' + sugKey"
          :selectedColumns="selectedColumns"
        ></suggestion>
      </div>
    </div>
  </div>
</template>

<script>
import main from './main.js'
export default main
</script>

<style scoped lang="scss">
@import './main.scss';
</style>
<style lang="scss">
$border: 1px solid #e6e8ed;
.finder-table {
  .ag-header-cell {
    padding: 0;
    border-right: 1px solid lightgrey;
    &::after {
      border: none;
    }
  }
  &.hidden {
    visibility: hidden;
  }
  .selected-cell {
    background-color: #e2f6fc;
  }

  .selected-cell {
    .row-select {
      background: #029ae4;
      color: #fff;
    }
  }
  td {
    .cell {
      padding: 0 1em;
    }
  }
  .row-title {
    height: 28px;
    line-height: 28px;
    background: #fefefc;
    //border:$border;
    //border-right-style:none;
    //border-bottom-style:none;
    position: relative;
    .label {
      cursor: pointer;
      color: #494850;
      font-size: 16px;
      font-weight: bold;
      margin: 0 auto;
      text-align: center;
      display: inline-block;
      width: 100%;
      padding: 0 2em;
    }
    .drop {
      position: absolute;
      right: 0;
      top: -5px;
    }
    .type {
      position: absolute;
      left: 5px;
      font-size: 10px;
      font-weight: normal;
    }
  }
  .row-line {
    height: 6px;
    background: #4eb6ac;
  }
  .row-gun {
    height: 80px;
    padding: 0 0;
    //background:red;
    background: #fefefc;
  }
  .row-select {
    height: 20px;
    line-height: 20px;
    background: #fefefe;
    font-weight: normal;
    /*outline:1px solid #FFF;*/
  }
}
.row-graph {
  height: 200px;
  background: red;
}
</style>
