<template>
  <div>
    <datablau-table
      class="datablau-table"
      :data="bindColumns"
      style="margin-bottom: 10px"
    >
      <el-table-column prop="sourceName" label="逻辑字段名"></el-table-column>
      <el-table-column prop="targetName" label="物理字段名"></el-table-column>
      <el-table-column label="操作" width="100">
        <template slot-scope="scope">
          <datablau-button
            type="text"
            size="mini"
            @click="removeRow(scope.$index, scope.row)"
          >
            移除行
          </datablau-button>
        </template>
      </el-table-column>
    </datablau-table>
    <datablau-button type="text" size="small" @click="auto">
      智能推荐
    </datablau-button>
    <datablau-button
      type="text"
      size="small"
      @click="showColumnSelector = !showColumnSelector"
    >
      <span v-if="!showColumnSelector">新增映射</span>
      <span v-else>关闭映射</span>
    </datablau-button>
    <el-form
      size="mini"
      inline
      v-if="showColumnSelector"
      style="margin-top: 20px"
    >
      <el-form-item label="逻辑字段">
        <el-select v-model="logicalColumn" value-key="columnId">
          <el-option
            v-for="o in logicalColumns"
            :key="o.columnId"
            :value="o"
            :label="o.physicalName"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="物理字段">
        <el-select v-model="physicalColumn" value-key="objectId">
          <el-option
            v-for="o in physicalColumns"
            :key="o.objectId"
            :value="o"
            :label="o.physicalName"
          ></el-option>
        </el-select>
      </el-form-item>
      <datablau-button type="normal" @click="add" :disabled="!addBtnEnable">
        加入列表
      </datablau-button>
    </el-form>
    <div class="dialog-bottom">
      <datablau-button type="important" @click="save">保存</datablau-button>
      <datablau-button class="white-btn" type="secondary" @click="closeDialog">
        关闭
      </datablau-button>
    </div>
  </div>
</template>
<script>
import bindColumn from './bindColumn.js'
export default bindColumn
</script>
<style scoped lang="scss">
/deep/ .el-form {
  .el-form-item {
    .el-form-item__label {
      line-height: 34px;
    }
  }
}
</style>
