<template>
  <div>
    <el-dialog
      width="500px"
      title="选择标准代码"
      :visible.sync="standardCodeDialogVisible"
      v-if="standardCodeDialogVisible"
      append-to-body
    >
      <div class="tree-box" style="height: 400px; overflow: auto">
        <el-input
          size="mini"
          v-model="keyword"
          placeholder="输入关键字进行搜索"
          clearable
          suffix-icon="el-icon-search"
        ></el-input>
        <el-tree
          ref="tree"
          :data="treeData"
          :props="defaultProps"
          :filter-node-method="filterNode"
          :render-content="renderContent"
          @node-click="handleNodeClick"
          class="light-blue-tree"
        ></el-tree>
      </div>
      <el-button
        :disabled="!selectBtnEnable"
        @click="codeSelected"
        size="small"
        type="primary"
        style="margin-top: 10px"
      >

        {{ $t('common.button.ok') }}

      </el-button>
    </el-dialog>
    <el-dialog
      width="500px"
      title="创建维度"
      :visible.sync="dialogVisible"
      append-to-body
    >
      <div>
        <el-form label-width="80px" size="small">
          <el-form-item :label="TYPE === 'TIME' ? '组' : '维度名称'">
            <el-input v-model="dialogKey"></el-input>
          </el-form-item>
          <el-form-item :label="TYPE === 'TIME' ? '时间周期' : '维度值'">
            <el-input
              type="textarea"
              v-model="dialogValue"
              placeholder="多个值之间请用分号分隔"
            ></el-input>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">
          {{ $t('common.button.cancel') }}
        </el-button>
        <el-button type="primary" @click="submitDim">确 定</el-button>
      </span>
    </el-dialog>
    <el-table
      :data="displayTable"
      class="plain-table"
      :max-height="tableHeight"
      :key="tableKey"
      border
    >
      <el-table-column
        prop="catalogName"
        :label="TYPE === 'TIME' ? '时间周期组' : '维度名称'"
        show-overflow-tooltip
        :width="160"
      ></el-table-column>
      <el-table-column
        prop="values"
        :label="TYPE === 'TIME' ? '时间周期' : '维度值'"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column :width="70" label="操作">
        <template slot-scope="scope">
          <!--<el-button type="text" >修改</el-button>-->
          <el-button type="text" @click="deleteDims(scope.row)">{{ $t('common.button.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div style="margin-top: 10px">
      <el-button type="primary" size="small" @click="addDim">
        {{ TYPE === 'TIME' ? '添加时间组' : '添加维度' }}
      </el-button>
      <el-button
        type="primary"
        size="small"
        @click="exportFromStandardCode"
        v-if="TYPE === 'NORMAL'"
      >
        由标准代码导入
      </el-button>
    </div>
  </div>
</template>
<script>
import code from './dim.js'
export default code
</script>
