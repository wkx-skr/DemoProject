<template>
  <div>
    <!--<el-dialog
      append-to-body
      fullscreen
      title="版本对比"
      :visible.sync="compareDialogVisible"
    >
      <el-table
        style="height:100%;"
        v-if="compareDialogData"
        :data="compareDialogData"
      ></el-table>
    </el-dialog>-->
    <div class="table-container one">
      <ag-table-component
        ref="versionsTable"
        style="height: 100%; width: 100%"
        @grid-ready="onGridReady"
        :gridOptions="gridOptions"
        :defaultColDef="defaultColDef"
        :columnDefs="columnDefs"
        :rowData="tableData"
        :getRowHeight="getRowHeight"
        @selection-changed="onSelectionChanged"
      ></ag-table-component>
    </div>
    <el-button
      type="text"
      v-if="tableData"
      :disabled="!canCompare"
      @click="compareVersions"
    >
      版本对比
    </el-button>
    <el-checkbox
      :disabled="!canCompare"
      v-model="onlyShowDifferent"
      style="margin-left: 3em"
    >
      仅显示变化
    </el-checkbox>
    <div class="table-container">
      <el-table
        class="plain-table"
        v-if="showCompareResult"
        :data="compareResult"
      >
        <el-table-column
          label="属性 \ 版本"
          prop="property"
          :formatter="propertyFormatter"
          show-overflow-tooltip
          width="140"
        ></el-table-column>
        <el-table-column
          v-for="(value, time) in compareResultMap"
          :key="time"
          show-overflow-tooltip
          :label="time"
          :prop="time"
        ></el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import version from './version'
export default version
</script>

<style scoped>
.table-container {
  max-height: 500px;
  margin-top: 10px;
}
</style>
