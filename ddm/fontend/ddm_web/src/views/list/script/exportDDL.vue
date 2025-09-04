<template>
  <div v-loading="loading">
    <el-dialog
      append-to-body
      :title="$store.state.$v.dataEntity.ddlScript + $store.state.$v.dataEntity.setting"
      width="900px"
      :visible.sync="showSettingDialog"
    >
      <ddl-setting
        v-if="option"
        :default-option="option"
        :options="options"
        @close="showSettingDialog=false"
        @submit="updateData"
      ></ddl-setting>
    </el-dialog>
    <div class="table-box">
      <el-table
        ref="multipleTable"
        :data="tableData"
        height="100%"
        row-class-name="row-can-click"
        @row-click="toggleSelection"
        @selection-change="handleSelectionChange"
        class="datablau-table">
        <el-table-column type="selection"></el-table-column>
        <el-table-column prop="name" :label="$store.state.$v.report.version"></el-table-column>
        <el-table-column :label="$store.state.$v.report.publisher" prop="creator"></el-table-column>
        <el-table-column prop="timestamp" :label="$store.state.$v.report.time" :formatter="$timeFormatter"></el-table-column>
        <el-table-column prop="description" :label="$store.state.$v.report.description" show-overflow-tooltip></el-table-column>
      </el-table>
    </div>
    <div style="margin-top:1.5em;">
      <el-button type="primary" size="small" @click="getScript" :disabled="multipleSelection.length!==1">{{$store.state.$v.dataEntity.generateCreateScript}}</el-button>
      <el-button type="primary" size="small" @click="getScript" :disabled="multipleSelection.length!==2"> {{$store.state.$v.dataEntity.alter}}</el-button>
      <el-button size="small" @click="callSetting"><i class="el-icon-setting"></i> {{$store.state.$v.dataEntity.typeFilter}}</el-button>
      <br><br>{{scriptTitle}}
    </div>
    <div v-if="incrementalScript" :key="scriptKey">
      <div
        class="sql-container">
        <div class="sql-content">
          <pre><code class="language-sql"><p v-html="incrementalScript"></p></code></pre>
        </div>
      </div>
      <el-button size="small" class="el-icon-download" @click="downloadScript"> {{$store.state.$v.dataEntity.output}}</el-button>
      <el-button size="small" class="el-icon-document-copy" @click="copyScript"> {{$store.state.$v.dataEntity.copy}}</el-button>
    </div>
  </div>
</template>

<script>
import exportDDL from './exportDDL.js'
export default exportDDL
</script>

<style scoped>
.table-box {
  min-height:100px;
  height:300px;
  max-height:300px;
}
pre {
  height:300px;
  overflow:auto;
}
</style>
