<template>
  <div>
    <modifier-value-selector
      v-if="showValueDialog"
      :modifier-type-id="modifierType.id"
      :modifier-category="modifierCategory"
      @close="handleCloseModifierValueSelector"
      @select="handleModifierValueSelect"
    ></modifier-value-selector>
    <datablau-dialog
      :title="Label.choose"
      :visible.sync="visible"
      size="xl"
      :height="606"
      @close="handleClose"
    >
      <div style="height: 450px; overflow: auto">
        <div class="typeTable typeIndexTable">
          <datablau-input
            style="width: 100%; padding: 0 10px; padding-top: 10px"
            :placeholder="$t('meta.DS.standardDialog.directory')"
            v-model="keyword"
            clearable
            :iconfont-state="true"
          ></datablau-input>
          <div
            style="
              position: absolute;
              top: 50px;
              left: 10px;
              right: 10px;
              bottom: 10px;
              overflow: auto;
            "
          >
            <datablau-tree
              ref="tree"
              node-key="id"
              :data="treeData"
              :props="defaultProps"
              :data-icon-function="dataIconFunction"
              :default-expanded-keys="defaultExpandedKeys"
              @node-expand="nodeExpand"
              @node-collapse="nodeCollapse"
              :filter-node-method="filterNode"
              @node-click="handleNodeClick"
              :auto-expand-parent="false"
            ></datablau-tree>
          </div>
        </div>
        <div style="position: absolute; top: 10px; left: 280px; right: 20px">
          <datablau-input
            v-model="searchFormData.name"
            :style="{
              width:
                modifierCategory === ModifierCategory.BASE ? '280px' : '330px',
            }"
            :placeholder="Label.searchPlaceholder"
            clearable
            iconfont-state
          ></datablau-input>
        </div>
        <div
          style="
            position: absolute;
            top: 44px;
            bottom: 50px;
            right: 20px;
            left: 280px;
            border-bottom: 1px solid #e6e6e6;
          "
        >
          <div style="height: 100%; width: 100%; overflow: auto">
            <datablau-table
              :data="tableData"
              height="100%"
              row-class-name="row-can-click"
              @row-click="handleRowClick"
            >
              <el-table-column
                :label="Label.code"
                prop="code"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                :label="Label.name"
                prop="name"
                show-overflow-tooltip
              ></el-table-column>
            </datablau-table>
          </div>
        </div>
      </div>
      <div class="dialog-bottom">
        <div style="position: absolute; left: 20px">
          <datablau-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page.sync="currentPage"
            :page-sizes="[20, 50, 100]"
            :page-size="pageSize"
            :pager-count="5"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
          ></datablau-pagination>
        </div>
        <datablau-button @click="handleClose" type="secondary" style="">
          {{ $t('common.button.close') }}
        </datablau-button>
      </div>
    </datablau-dialog>
  </div>
</template>
<script>
import ModifierSelector from '@/view/dataIndexNew/indexManagement/indexDefinition/component/ModifierSelector.js'
export default ModifierSelector
</script>
<style scoped lang="scss">
.typeTable {
  position: absolute;
  top: 44px;
  bottom: 50px;
  left: 20px;
  right: 700px;
  padding: 0;
  border: 1px solid #dddddd;
  border-top: none;
  &.typeIndexTable {
    top: 11px;
    border-top: 1px solid #dddddd;
  }
}
</style>
