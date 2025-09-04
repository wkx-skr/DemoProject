<template>
  <div>
    <el-card
      style="
        position: absolute;
        right: 15px;
        top: 75px;
        bottom: 15px;
        width: 300px;
        overflow: auto;
      "
    >
      <div slot="header" class="clearfix">
        <span>控制面板</span>
      </div>
      <el-form size="mini" label-width="6em">
        <el-form-item label="rowData">
          <el-input v-model="conf.rowData" type="textarea" :rows="3"></el-input>
        </el-form-item>
        <el-form-item label="columnDefs">
          <el-input
            v-model="conf.columnDefs"
            type="textarea"
            :rows="3"
          ></el-input>
        </el-form-item>
        <el-form-item label="theme">
          <el-radio
            value="ag-theme-balham"
            label="ag-theme-balham"
            v-model="gridClass"
          ></el-radio>
          <el-radio
            value="ag-theme-balham-dark"
            label="ag-theme-balham-dark"
            v-model="gridClass"
          ></el-radio>
          <el-radio
            value="ag-theme-blue"
            label="ag-theme-blue"
            v-model="gridClass"
          ></el-radio>
          <el-radio
            value="ag-theme-bootstrap"
            label="ag-theme-bootstrap"
            v-model="gridClass"
          ></el-radio>
          <el-radio
            value="ag-theme-dark"
            label="ag-theme-dark"
            v-model="gridClass"
          ></el-radio>
          <el-radio
            value="ag-theme-fresh"
            label="ag-theme-fresh"
            v-model="gridClass"
          ></el-radio>
          <el-radio
            value="ag-theme-material"
            label="ag-theme-material"
            v-model="gridClass"
          ></el-radio>
        </el-form-item>
        <el-form-item label="style">
          <el-input v-model="gridStyle" type="textarea" :rows="2"></el-input>
        </el-form-item>
      </el-form>
      <el-button @click="draw">绘制</el-button>
    </el-card>
    <el-card
      style="
        position: absolute;
        right: 320px;
        top: 75px;
        bottom: 15px;
        left: 15px;
        overflow: auto;
      "
    >
      <datablau-grid
        :rowData="rowData"
        :columnDefs="columnDefs"
        :grid-style="gridStyle"
        :grid-class="gridClass"
        :row-selection="rowSelection"
      ></datablau-grid>
    </el-card>
  </div>
</template>

<script>
import grid from './grid'
export default grid
</script>

<style scoped></style>
