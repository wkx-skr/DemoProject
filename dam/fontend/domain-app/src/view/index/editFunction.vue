<template>
  <div>
    <el-dialog
      width="600px"
      title="编辑函数 "
      append-to-body
      :visible.sync="dialogVisible"
    >
      <div style="max-height: 400px; overflow: auto">
        <el-form
          label-width="100px"
          label-position="right"
          size="small"
          :model="detail"
          style="width: 92%"
        >
          <el-form-item label="函数名称" :rules="[{ required: true }]">
            <el-input v-model="detail.funcName"></el-input>
          </el-form-item>
          <el-form-item label="引擎">
            <el-input v-model="detail.engine"></el-input>
          </el-form-item>
          <el-form-item label="数据库">
            <el-input v-model="detail.database"></el-input>
          </el-form-item>
          <el-form-item label="返回值类型">
            <el-input v-model="detail.returnType"></el-input>
          </el-form-item>
          <el-form-item label="描述">
            <el-input type="textarea" v-model="detail.funcDesc"></el-input>
          </el-form-item>
          <el-form-item
            v-for="(domain, index) in detail.parameters"
            :label="'参数' + (index + 1)"
            :key="index"
            :prop="'parameters.' + index + '.name'"
          >
            <el-input
              v-model="domain.name"
              placeholder="参数的名称"
              style="width: 215px"
            ></el-input>
            <el-input
              v-model="domain.type"
              placeholder="参数的类型"
              style="width: 120px"
            ></el-input>
            <el-button
              @click.prevent="removeDomain(domain)"
              style="float: right; margin-bottom: 15px"
            >
              {{ $t('common.button.delete') }}
            </el-button>
            <el-input
              v-model="domain.description"
              placeholder="参数的描述信息"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button @click="addDomain">新增参数</el-button>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button
          @click="dialogVisible = false"
          size="small"
          style="width: 12%"
        >

          {{ $t('common.button.cancel') }}

        </el-button>
        <el-button
          type="primary"
          size="small"
          @click="submit"
          style="width: 12%"
        >
          确 定
        </el-button>
      </span>
    </el-dialog>
    <el-table
      :data="displayTable"
      class="datablau-table"
      :max-height="tableHeight"
    >
      <!--      <el-table-column prop="funcId" label="编码" show-overflow-tooltip :minx-width="120"></el-table-column>-->
      <el-table-column
        prop="funcName"
        label="名称"
        show-overflow-tooltip
        :minx-width="120"
      ></el-table-column>
      <el-table-column
        prop="engine"
        label="引擎"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        prop="returnType"
        label="返回值类型"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column label="参数列表">
        <template slot-scope="scope">
          <span v-for="(p, i) in scope.row.parameters">
            {{ p.name }}{{ i == scope.row.parameters.length - 1 ? '' : ',' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column :width="130" label="操作">
        <template slot-scope="scope">
          <el-button type="text" @click="editFunction(scope.row)">
            修改
          </el-button>
          <el-button type="text" @click="deleteFunction(scope.row.funcId)">
            {{ $t('common.button.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div style="margin-top: 10px">
      <el-button type="primary" size="small" @click="addFunction">
        添加函数
      </el-button>
    </div>
  </div>
</template>
<script>
import javaScriptCode from './editFunction.js'
export default javaScriptCode
</script>
