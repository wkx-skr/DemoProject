<template>
  <div
    style="
      background: #fff;
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
    "
  >
    <!--style="position:absolute;top:0px;left:0;bottom:0;right:0;"-->
    <el-dialog
      width="1000px"
      v-if="dialogVisible"
      append-to-body
      :visible.sync="dialogVisible"
      title="详细信息"
    >
      <el-form
        id="mini-font"
        size="mini"
        label-width="100px"
        style="max-height: 430px; overflow: auto; font-size: 12px !important"
        label-suffix=" : "
      >
        <el-form-item label="Job名称">
          <!--<div class="property-value">-->
          {{ currentData.jobName }}
          <!--</div>-->
        </el-form-item>
        <el-form-item label="Job路径">
          <!--<div class="property-value">-->
          {{ currentData.category }}
          <!--</div>-->
        </el-form-item>
        <el-form-item label="Stage类型">
          <!--<div class="property-value">-->
          {{ currentData.jobType }}
          <!--</div>-->
        </el-form-item>
        <el-form-item label="Stage名称">
          <!--<div class="property-value">-->
          {{ currentData.fieldStageName }}
          <!--</div>-->
        </el-form-item>
        <el-form-item label="数据项类型">
          <!-- <div class="property-value"> -->
          {{ FieldTypeTranslator[currentData.fieldType] }}
          <!-- </div> -->
        </el-form-item>
        <el-form-item label="数据项值">
          <div
            class="property-value"
            v-html="$utils.string.nl2br(currentData.originalFieldName)"
          ></div>
        </el-form-item>

        <el-form-item label="字段">
          <div class="property-value">{{ currentData.fieldValues }}</div>
        </el-form-item>

        <el-form-item label="注释">
          <div
            class="property-value"
            v-html="$utils.string.nl2br(currentData.annotations)"
          ></div>
        </el-form-item>
        <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="dialogVisible = false">
            关闭
          </el-button>
        </span>
      </el-form>
    </el-dialog>
    <div class="row-filter">
      <el-form size="mini" label-width="100px" inline>
        <el-form-item label="模糊搜索" v-if="!pro">
          <el-input
            v-model="requestBody.keyword"
            @keydown.enter.native.prevent="getData"
            @clear="getData"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item v-if="pro" label="Job名称">
          <el-input
            v-model="requestBody.jobName"
            @keydown.enter.native="getData"
            @clear="getData"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item v-if="pro" label="Stage类型">
          <el-select v-model="requestBody.jobType" @change="getData">
            <el-option :value="null" label="全部"></el-option>
            <el-option value="JOB"></el-option>
            <el-option value="SEQ"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="pro" label="Stage名称">
          <el-input
            v-model="requestBody.stageName"
            @keydown.enter.native="getData"
            @clear="getData"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item v-if="pro" label="数据项类型">
          <el-select
            v-model="requestBody.fieldType"
            @change="getData"
            style="width: 180px"
          >
            <el-option :value="null" label="全部"></el-option>
            <el-option
              v-if="requestBody.jobType !== 'SEQ'"
              value="SQL_TEXT"
              :label="FieldTypeTranslator['SQL_TEXT']"
            ></el-option>
            <el-option
              v-if="requestBody.jobType !== 'SEQ'"
              value="SRC_HASH_FILE"
              :label="FieldTypeTranslator['SRC_HASH_FILE']"
            ></el-option>
            <el-option
              v-if="requestBody.jobType !== 'SEQ'"
              value="TARGET_TABLE_NAME"
              :label="FieldTypeTranslator['TARGET_TABLE_NAME']"
            ></el-option>
            <el-option
              v-if="requestBody.jobType !== 'SEQ'"
              value="TARGET_HASH_FILE"
              :label="FieldTypeTranslator['TARGET_HASH_FILE']"
            ></el-option>
            <el-option
              v-if="requestBody.jobType !== 'SEQ'"
              value="EXEC_DOS_LIST"
              :label="FieldTypeTranslator['EXEC_DOS_LIST']"
            ></el-option>
            <el-option
              v-if="requestBody.jobType !== 'JOB'"
              value="JOB_NAMES"
              :label="FieldTypeTranslator['JOB_NAMES']"
            ></el-option>
            <el-option
              v-if="requestBody.jobType !== 'JOB'"
              value="EXEC_COMMANDS"
              :label="FieldTypeTranslator['EXEC_COMMANDS']"
            ></el-option>
            <el-option
              v-if="requestBody.jobType !== 'JOB'"
              value="SENDER_ADDRESS"
              :label="FieldTypeTranslator['SENDER_ADDRESS']"
            ></el-option>
            <el-option
              v-if="requestBody.jobType !== 'JOB'"
              value="RECIPIENT_ADDRESS"
              :label="FieldTypeTranslator['RECIPIENT_ADDRESS']"
            ></el-option>
            <el-option
              v-if="requestBody.jobType !== 'JOB'"
              value="WAIT_FILES"
              :label="FieldTypeTranslator['WAIT_FILES']"
            ></el-option>
          </el-select>
        </el-form-item>
        <br v-if="pro" />
        <el-form-item v-if="pro" label="字段">
          <el-input
            v-model="requestBody.value"
            @keydown.enter.native="getData"
            @clear="getData"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item v-if="pro" label="数据项值">
          <el-input
            v-model="requestBody.fieldName"
            @keydown.enter.native="getData"
            @clear="getData"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item v-if="pro" label="注释">
          <el-input
            v-model="requestBody.annotation"
            @keydown.enter.native="getData"
            @clear="getData"
            clearable
            style="width: 240px"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="text" size="mini" @click="getData">搜索</el-button>
          <el-button @click="pro = !pro" type="text" size="mini">
            <span v-if="!pro">高级筛选</span>
            <span v-else>收起高级筛选</span>
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="row-table" :class="{ pro: pro }">
      <ag-table-component
        ref="columnsTable"
        @grid-ready="onGridReady"
        :gridOptions="gridOptions"
        :columnDefs="columnDefs"
        :rowData="tableData"
        :loading="tableLoading"
        :getRowHeight="getRowHeight"
        :frameworkComponents="frameworkComponents"
      ></ag-table-component>
    </div>
  </div>
</template>
<script>
import main from './main.js'
export default main
</script>
<style lang="scss">
#mini-font * {
  font-size: 12px !important;
}
#mini-font {
  .el-form-item {
    margin-bottom: 8px;
  }
}
</style>
<style lang="scss" scoped>
.row-table {
  position: absolute;
  left: 0px;
  right: 0px;
  bottom: 0px;
  top: 60px;
  &.pro {
    top: 100px;
  }
}
.row-filter {
  position: absolute;
  left: 0px;
  right: 0px;
  top: 15px;
  /*background:pink;*/
  height: 90px;
  border-bottom: 1px solid #f1f5f7;
  .el-input,
  .el-select {
    width: 130px;
  }
}
.property-value {
  border: 1px solid #e1e5e7;
  border-radius: 2px;
  padding-left: 10px;
  margin-right: 20px;
  max-height: 8em;
  min-height: 2.8em;
  overflow: auto;
}
</style>
<style>
/*.ag-cell.ag-cell-not-inline-editing.ag-cell-with-height.ag-cell-value {*/
/*line-height:20px !important;*/
/*}*/
</style>
