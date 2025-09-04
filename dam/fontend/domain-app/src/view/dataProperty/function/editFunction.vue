<template>
  <el-card style="margin: 20px" v-show="dialogVisible">
    <div slot="header">函数编辑</div>
    <el-form
      label-position="right"
      label-width="6em"
      size="small"
      v-if="currentFunction"
    >
      <el-form-item label="名称">
        <el-input
          v-model="currentFunction.funcName"
          style="width: 600px"
        ></el-input>
      </el-form-item>
      <el-form-item label="函数模板">
        <el-select
          v-model="functionModel"
          style="width: 600px"
          @change="handleFunctionModelChange"
        >
          <el-option
            v-for="i in registered"
            :key="i.uuid"
            :label="i.name"
            :value="i.uuid"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="返回值类型">
        {{ currentFunction.funcReturnType }}
      </el-form-item>
      <el-form-item label="参数">
        <el-table class="datablau-table" :data="params">
          <el-table-column
            label="类型"
            prop="type"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            label="名称"
            prop="name"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            label="描述"
            prop="description"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            label="必填"
            prop="required"
            show-overflow-tooltip
            :width="60"
          >
            <template slot-scope="scope">
              <span v-if="scope.row.required">必填</span>
              <span v-else>非必填</span>
            </template>
          </el-table-column>
          <el-table-column label="值类型" prop="valueType">
            <template slot-scope="scope">
              <el-select
                v-model="scope.row.valueType"
                @change="scope.row.value = undefined"
              >
                <el-option
                  v-for="(o, k) in VALUE_TYPE"
                  :key="k"
                  :label="o"
                  :value="k"
                ></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="值" prop="value">
            <template slot-scope="scope">
              <el-input
                v-if="scope.row.valueType === 'value'"
                v-model="scope.row.value"
              ></el-input>
              <el-select v-else v-model="scope.row.value">
                <el-option
                  v-for="o in parameterOptions(scope.row)"
                  :key="o.paramId"
                  :label="o.name"
                  :value="o.name"
                ></el-option>
              </el-select>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item>
        <el-button size="small" type="primary" @click="save">保存</el-button>
        <el-button size="small" @click="closeDialog">关闭</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>
<script>
import editFunction from './editFunction.js'
export default editFunction
</script>
