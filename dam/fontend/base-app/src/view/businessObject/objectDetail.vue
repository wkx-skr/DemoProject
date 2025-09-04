<template>
  <div style="padding: 0 20px">
    <datablau-dialog
      title="选择模型"
      :visible.sync="dialog2Visible"
      width="700px"
    >
      <choose-model
        v-if="dialog2Visible"
        @removeModelSelectDialog="dialog2Visible = false"
      ></choose-model>
    </datablau-dialog>
    <datablau-dialog
      title="选择物理表"
      :visible.sync="dialogVisible"
      append-to-body
      v-if="dialogVisible"
      :height="450"
      width="800px"
    >
      <search-business-column
        search-table
        from-business-object
        @full-message-selected="handleObjectSelect"
      ></search-business-column>
    </datablau-dialog>
    <datablau-dialog
      title="绑定字段"
      :visible.sync="chooseColumnDialogVisible"
      width="800px"
      v-if="chooseColumnDialogVisible"
      :height="420"
      :close-on-click-modal="false"
    >
      <bind-column
        :logical-table-data="innerDetail"
        :physical-table-data="currentPhysicalTableData"
        @closeDialog="chooseColumnDialogVisible = false"
        @refresh="getPhysicalTables"
      ></bind-column>
    </datablau-dialog>
    <el-form
      :inline-message="false"
      class="page-form index-page"
      label-position="right"
      label-width="110px"
      :model="innerDetail"
    >
      <el-form-item label="名称" :rules="{ required: true }">
        <datablau-input v-model="innerDetail.businessTabName"></datablau-input>
      </el-form-item>
      <el-form-item label="模型" v-if="$ddmConnectable">
        <el-input
          placeholder="请点击右侧按纽选择模型"
          :value="modelName"
          clearable
          @clear="handleModelNameClear"
        ></el-input>
        <datablau-button
          type="secondary"
          @click="handleSelectModel"
          style="margin-left: 10px"
        >
          选择模型
        </datablau-button>
      </el-form-item>
      <el-form-item label="逻辑表" v-if="$ddmConnectable">
        <el-select
          v-model="innerDetail.tableId"
          filterable
          placeholder="逻辑表"
          @change="handleTableIdChange"
          @clear="handleTableIdClear"
          clearable
        >
          <el-option
            v-for="item in tables"
            :key="item.tableId"
            :label="item.physicalName"
            :value="item.tableId"
          ></el-option>
        </el-select>
      </el-form-item>
    </el-form>

    <span class="title-label" v-if="hasPhysicalLink">绑定的元数据</span>
    <datablau-button v-if="hasPhysicalLink" type="text" @click="callBind">
      选择物理表
    </datablau-button>
    <datablau-table
      v-if="hasPhysicalLink"
      ref="dsTable"
      :data="physicalTables"
      style="width: 600px"
      highlight-current-row
    >
      <el-table-column
        prop="modelCategoryId"
        label="系统"
        :formatter="modelCategoryFormatter"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        prop="modelName"
        label="模型"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        prop="physicalName"
        label="表名"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column label="操作" width="160">
        <template slot-scope="scope">
          <el-button type="text" size="mini" @click="callBindColumn(scope.row)">
            绑定字段
          </el-button>
          <el-button type="text" size="mini" @click="callUnbind(scope.row)">
            解绑表
          </el-button>
        </template>
      </el-table-column>
    </datablau-table>
    <div class="page-btn-group left-bottom" style="margin: 0">
      <datablau-button
        v-if="writable"
        type="important"
        @click="submit"
        :disabled="!innerDetail.businessTabName"
      >
        保存
      </datablau-button>
      <datablau-button type="secondary" @click="closeTab">关闭</datablau-button>
    </div>
  </div>
</template>
<script>
import objectDetail from './objectDetail.js'
export default objectDetail
</script>
<style lang="scss" scoped>
/deep/ .el-table--border {
  border: 0;
}
.page-btn-group {
  padding: 8px 20px 0;
  height: 50px;
  box-sizing: border-box;
  position: absolute;
  bottom: 0;
  right: 0;
  width: 100%;
  z-index: 9;
  border-top: 1px solid var(--border-color-lighter);
  box-shadow: 0 -5px 14px -8px rgba(0, 0, 0, 0.2);
  background-color: #fff;
}
.title-label {
  display: inline-block;
  font-size: 14px;
  font-weight: bold;
  border-left: 4px solid #4396f5;
  padding-left: 0.5em;
  margin: 1em 0 0;
  color: #494850;
}
</style>
