<template>
  <div style="margin-top: 10px;">
    <el-dialog
      :title="(isDesignModel ? '键': '索引') + '成员编辑器'"
      custom-class="index-selector"
      :visible.sync="indexColumnsEditorVisible"
      :close-on-click-modal="false"
      width="800px"
      append-to-body
      :before-close="handleClose"
      :class="{'black-themedialog': typeDataWareHouse}"
    >
      <index-columns-editor
        :disabledPk="disabledPk"
        :key="indexColumnsEditorKey"
        :deliverNum="deliverNum"
        ref="indexColumnsEditor"
        :dataCopied="rawData"
        :columnsMap="columnsMap"
        @saveColumns="saveColumns"
        @close="handleEditorClose"
        :themeBlack="typeDataWareHouse"
      ></index-columns-editor>
    </el-dialog>
<!--    <div class="sub-title" style="margin-top:25px;display:inline-block;margin-right:40px;">索引信息</div>-->
    <!--<el-button
      v-show="editMode"
      type="text"
      @click="addColumn"
    >
      <i class="el-icon-circle-plus"></i>
      添加新字段
    </el-button>-->
    <datablau-button
      v-if="editMode && !virtualKey"
      :dblClickTimeout="0"
      type="text"
      :disabled="hasPk"
      class="el-icon-circle-plus-outline"
      @click="addIndex('PrimaryKey')"
    >主键</datablau-button>
    <datablau-button
      v-if="editMode && !virtualKey"
      :dblClickTimeout="0"
      type="text"
      class="el-icon-circle-plus-outline"
      @click="addIndex('UniqueKey')"
    >唯一{{isDesignModel ? '键': '索引'}}</datablau-button>
    <datablau-button
      v-if="editMode && !virtualKey"
      :dblClickTimeout="0"
      type="text"
      class="el-icon-circle-plus-outline"
      @click="addIndex('NonUniqueKey')"
    >非唯一{{isDesignModel ? '键': '索引'}}</datablau-button>
    <datablau-button
      v-if="editMode"
      :dblClickTimeout="0"
      type="text"
      class="el-icon-circle-plus-outline"
      @click="addIndex('VirtualKey')"
    >虚拟{{isDesignModel ? '键': '索引'}}</datablau-button>
    <div class="table-box" :class="{edit:!editMode}">
      <datablau-table
      :data="indexS"
      ref="indexTable"
      class="datablau-table thin"
      highlight-current-row
      @keydown.native="onKeyPress"
      height="100%"
      :key="tableKey"
      :row-class-name="tableRowClassName"
      :themeBlack="typeDataWareHouse"
    >

      <el-table-column width="250" :label="(isDesignModel ? '键': '索引')+'名称'">
        <template slot="header" slot-scope="scope">
          <span v-if="editMode" :data="scope.$index" class="table-label required">{{isDesignModel ? '键': '索引'}}名称</span>
          <span v-else class="table-label">{{isDesignModel ? '键': '索引'}}名称</span>
        </template>
        <template slot-scope="scope">
          <span v-if="!editMode" style="margin-left:1.2em;">{{scope.row.properties.Name}}</span>
          <el-form
            v-else
            :ref='`indexNameInput${scope.$index}`'
            size="mini"
            :model="indexS[scope.$index]"
            :rules="rules">
            <el-form-item
              style="margin-bottom:1px;"
              :prop="'index' + scope.$index"
              :rules="rules.index"
            >
              <datablau-input
                style="width: 100%"
                @change="handleNameChange(scope.row.properties)"
                v-model="scope.row.properties.Name"
                :themeBlack="typeDataWareHouse"
                size="mini"></datablau-input>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column width="250" label="宏">
        <template slot-scope="scope">
          <span v-if="!editMode" style="margin-left:1.2em;">{{scope.row.properties.Macro}}</span>
          <datablau-input
            v-else
            style="width: 100%"
            @change="handleMacroChange(scope.row.properties)"
            v-model="scope.row.properties.Macro"
            :themeBlack="typeDataWareHouse"
            size="mini"
          ></datablau-input>
        </template>
      </el-table-column>
      <el-table-column
        label="类型"
        :width="50"
        prop="properties.KeyGroupType"
        :formatter="keyNameFormatter">
      </el-table-column>
      <el-table-column
        label="成员字段"
        :min-width="120"
        show-overflow-tooltip
        :formatter="joinColumns"
      >
      </el-table-column>
      <el-table-column
        label="操作"
        width="80"
        fixed="right"
      >
        <template slot-scope="scope">
          <datablau-button
            v-if="editMode"
            type="icon"
            @click="onRowClick(scope.row)"
            :disabled="isForeignKey(scope.row)"
            :tooltipContent="isForeignKey(scope.row)?'外键不可编辑':''"
            class="iconfont icon-bianji"
            style="font-size: 14px"
          ></datablau-button>
          <datablau-button
            v-if="editMode"
            type="icon"
            @click="removeIndex(scope.$index)"
            :tooltipContent="isForeignKey(scope.row)?'外键不可删除':(isPrimaryKey(scope.row) && disabledPk && disabledPk.size)? '由于SubType关系存在，该主键不能删除': ''"
            :disabled="isForeignKey(scope.row) || (isPrimaryKey(scope.row) && disabledPk && !!disabledPk.size)"
            class="iconfont icon-delete"
            style="font-size:14px"
          ></datablau-button>
        </template>
      </el-table-column>
    </datablau-table>
    <!--<el-button
      size="small"
      type="primary"
      style="margin-top:10px;"
      @click="temporarySave"
    >暂存</el-button>-->
    </div>
  </div>
</template>
<script>
import indexEditor from './indexEditor.js'
export default indexEditor
</script>
<style lang="scss" scoped>
@import '@/views/list/_paneDetail.scss';
.table-box {
  position: absolute;
  top: 32px;
  left: 0;
  right: 0;
  bottom: 0;
  &.edit {
    top: 0;
  }
}
/deep/ .hide-entity-row {
  display: none;
}
.el-icon-circle-plus-outline:before {
  font-size: 16px;
  margin-right: 3px;
  position: relative;
  top: 1px;
}
.el-table.datablau-table /deep/ tr.current-row td {
  border: none;
}
.el-table.datablau-table /deep/ tr.current-row + tr td {
  border: none;
}
.tableIndexTable /deep/ {
  .el-table, .el-table__expanded-cell{
    background: #fffdff;
  }
  .el-table th.el-table__cell{
    background: #fffdff;
  }
  .el-table tr{
    background: #fffdff;
  }
  .el-table td.el-table__cell, .el-table th.el-table__cell.is-leaf{
    border-bottom: 1px solid #E5E5E5;
  }
  .el-autocomplete{
    .el-input__inner{
      background: #fff !important;
    }
  }
}
.black-themedialog{
  background: rgba(0, 0, 0, .5);
  /deep/ .el-dialog{
    background: #222222;
  }
  /deep/ .el-dialog__title{
      color: #BBBBBB !important;
    }
    /deep/ .el-dialog__headerbtn .el-dialog__close{
      color: #C6C6C6;
    }
    /deep/ .el-dialog__header{
      border-bottom: 1px solid #4D4D4D !important;
    }
}
</style>
