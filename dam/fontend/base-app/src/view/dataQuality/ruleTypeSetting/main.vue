<template>
  <div class="main">
    <datablau-list-search style="margin: 0 20px">
      <template slot="title">
        <div>{{ $t('common.page.ruleTypeSetting') }}</div>
      </template>
      <template slot="buttons">
        <datablau-dropdown
          trigger="click"
          class="rightButton two2"
          style="display: inline-block"
        >
          <datablau-button
            type="important"
            class="rightButton iconfont icon-tianjia"
          >
            {{ $t('common.button.add') }}
            <i class="el-icon-arrow-down el-icon--right"></i>
          </datablau-button>
          <el-dropdown-menu style="margin-top: 4px" slot="dropdown">
            <el-dropdown-item @click.native="addRule">
              {{ $t('quality.page.ruleTypeSetting.addRule') }}
            </el-dropdown-item>
            <el-dropdown-item @click.native="addSub">
              {{ $t('quality.page.ruleTypeSetting.addSub') }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </datablau-dropdown>
      </template>
    </datablau-list-search>

    <datablau-form-submit style="margin-top: 84px">
      <datablau-table
        ref="multipleTable"
        :data="tableData"
        tooltip-effect="dark"
        style="width: 100%; height: 100%"
        height="100%"
        v-loading="loading"
        row-key="id"
        :tree-props="{ children: 'resDtoList', hasChildren: 'hasChildren' }"
      >
        <el-table-column
          prop="optionValue"
          :label="$t('quality.page.ruleTypeSetting.name')"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="ruleCode"
          :label="$t('quality.page.ruleTypeSetting.code')"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="ruleSort"
          :label="$t('quality.page.ruleTypeSetting.index')"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="optionComment"
          :label="$t('quality.page.ruleTypeSetting.desc')"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :label="$t('quality.page.problemProgramme.operation')"
          align="center"
          width="200"
          fixed="right"
        >
          <template slot-scope="scope">
            <datablau-button
              type="icon"
              @click.stop="deleteRow(scope.row)"
              :disabled="scope.row.builtIn"
              :title="$t('common.button.delete')"
            >
              <i class="iconfont icon-delete"></i>
            </datablau-button>
            <datablau-button
              type="icon"
              :title="$t('common.button.edit')"
              @click.stop="editRow(scope.row)"
              :disabled="scope.row.builtIn"
            >
              <i class="iconfont icon-bianji"></i>
            </datablau-button>
          </template>
        </el-table-column>
      </datablau-table>
      <!--      <template slot="buttons">
        <datablau-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page.sync="currentPage"
          :page-sizes="[20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          style="display: inline-block; float: right"
        ></datablau-pagination>
      </template>-->
    </datablau-form-submit>
    <edit-dialog
      ref="editDialog"
      @getDialogData="getDialogData"
      :parentData="parentData"
    ></edit-dialog>
  </div>
</template>

<script>
import main from './main.js'
export default main
</script>
<style lang="scss" scoped>
@import '~@/next/components/basic/color.sass';
::v-deep {
  .el-table .el-table__row--level-1 {
    background-color: #f8f8f8;
  }
}
.main {
  width: 100%;
  background-color: var(--default-bgc);
  position: absolute;
  top: 0;
  bottom: 0;
  overflow: auto;
}
/deep/ .el-table__expand-icon {
  width: 16px;
  height: 16px;
  vertical-align: bottom;
}
//有子节点 未展开
/deep/ .el-icon-arrow-right:before {
  background: url('../../../assets/images/icon/fold.svg') no-repeat;
  content: '';
  display: block;
  width: 14px;
  height: 14px;
  font-size: 16px;
  background-size: 14px;
  //vertical-align: -webkit-baseline-middle;
}
// 有子节点 已展开
/deep/ .el-table__expand-icon--expanded {
  vertical-align: bottom;
  .el-icon-arrow-right:before {
    background: url('../../../assets/images/icon/unfold.svg') no-repeat;
    content: '';
    display: block;
    width: 14px;
    height: 14px;
    font-size: 16px;
    background-size: 14px;
    //vertical-align: -webkit-baseline-middle;
  }
}
// 展开折叠时不进行动画，否则图标会旋转
/deep/ .el-table__expand-icon--expanded {
  transform: none;
}
</style>
