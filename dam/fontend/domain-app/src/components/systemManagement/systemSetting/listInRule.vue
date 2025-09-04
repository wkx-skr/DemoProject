<template>
  <div>
    <datablau-dialog
      title="参数编辑"
      width="1060px"
      :height="600"
      :visible.sync="editDialogVisible"
      :close-on-click-modal="false"
      append-to-body
    >
      <our-detail
        :preData="preData"
        :key="preData ? preData.paramId : -1"
        :item-id="itemId"
        @close="closeEditDialog"
        @update="updateData"
        :from-rule="fromRule"
        :from-job="fromJob"
      ></our-detail>
    </datablau-dialog>
    <our-detail
      :preData="preData"
      :seeDetail="dialogVisible"
      v-if="dialogVisible"
      @handleClose="handleClose"
    ></our-detail>
    <datablau-table :data="tableData">
      <el-table-column
        prop="name"
        show-overflow-tooltip
        :label="$t('quality.page.qualityRule.parametersTable.name')"
      ></el-table-column>
      <el-table-column
        prop="currentValue"
        show-overflow-tooltip
        :label="$t('quality.page.qualityRule.parametersTable.currentValue')"
      ></el-table-column>
      <el-table-column
        prop="valueType"
        show-overflow-tooltip
        :label="$t('quality.page.qualityRule.parametersTable.valueType')"
      ></el-table-column>
      <el-table-column
        prop="valueGenerator"
        show-overflow-tooltip
        :label="$t('quality.page.qualityRule.parametersTable.valueGenerator')"
      ></el-table-column>
      <!-- <el-table-column
        prop="level"
        label="参数级别"
        :formatter="levelFormatter"
      ></el-table-column>
      <el-table-column
        prop="scope"
        width="90"
        label="可见范围"
        :formatter="scopeFormatter"
      ></el-table-column> -->
      <el-table-column
        :label="$t('quality.page.qualityRule.parametersTable.operation')"
        header-align="right"
        align="right"
        width="120"
      >
        <template slot-scope="scope">
          <datablau-button
            type="text"
            v-if="selectable(scope.row)"
            @click="handleEdit(scope.row, 'edit')"
          >
            <span>{{ $t('common.button.edit') }}</span>
          </datablau-button>
          <datablau-button
            v-if="!selectable(scope.row)"
            type="text"
            @click="handleEdit(scope.row, 'see')"
          >
            <span>{{ $t('common.button.scan') }}</span>
          </datablau-button>
        </template>
      </el-table-column>
    </datablau-table>
  </div>
</template>

<script>
import listInRule from './listInRule.js'
export default listInRule
</script>

<style scoped></style>
