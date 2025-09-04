<template>
  <div>
    <el-dialog
      :title="$store.state.$v.dataEntity.indexEditor"
      :visible.sync="indexColumnsEditorVisible"
      :close-on-click-modal="true"
      width="800px"
      append-to-body
      custom-class='index-editor'
    >
      <index-columns-editor
        :key="indexColumnsEditorKey"
        ref="indexColumnsEditor"
        :dataCopied="dataCopied"
        :columnsMap="columnsMap"
        @saveColumns="saveColumns"
        @close="handleEditorClose"
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
      v-if="editMode && !hasPk"
      type="text"
      :disabled="hasPk"
      class="iconfont icon-tianjia t1"
      @click="addIndex('PrimaryKey')"
    >{{$store.state.$v.dataEntity.pk}}</datablau-button>
    <el-tooltip v-if="editMode && hasPk" content="已经存在主键" placement="bottom" effect="dark">
      <datablau-button
        type="text"
        :disabled="hasPk"
        class="iconfont icon-tianjia t1"
        @click="addIndex('PrimaryKey')"
      >{{$store.state.$v.dataEntity.pk}}</datablau-button>
    </el-tooltip>
    <datablau-button
      v-if="editMode"
      type="text"
      class="iconfont icon-tianjia t1"
      @click="addIndex('UniqueKey')"
    >{{$store.state.$v.dataEntity.ui}}</datablau-button>
    <datablau-button
      v-if="editMode"
      type="text"
      class="iconfont icon-tianjia t1"
      @click="addIndex('NonUniqueKey')"
    >{{$store.state.$v.dataEntity.nui}}</datablau-button>
    <datablau-button
      v-if="editMode"
      type="text"
      class="iconfont icon-tianjia t1"
      @click="addIndex('VirtualKey')"
    >虚拟索引</datablau-button>
  <div class="table-box" :class="{edit:!editMode}">
    <datablau-table
      :data="indexS"
      ref="indexTable"
      height="100%"
      @keydown.native="onKeyPress"
      :show-column-selection="false"
      :key="tableKey"
      :class="{'tableIndexTable':typeDataWareHouse}"
    >

      <el-table-column width="300px" :label="$store.state.$v.dataEntity.indexName">
        <template slot="header" slot-scope="scope">
          <span v-if="editMode" :data="scope.$index" class="table-label required">{{$store.state.$v.dataEntity.indexName}}</span>
          <span v-else class="table-label">{{$store.state.$v.dataEntity.indexName}}</span>
        </template>
        <template slot-scope="scope">
          <span v-if="isForeignKey(scope.row) || !editMode" style="margin-left:1.2em;">{{scope.row.properties.Name}}</span>
          <el-form
            v-else
            size="mini"
            :rules="rules">
            <el-form-item
              style="height:28px;margin-bottom:1px;"
              :prop="'index' + scope.$index"
              :rules="rules.index"
            >
              <datablau-input
                style="width: 240px;"
                @change="handleNameChange(scope.row.properties)"
                v-model="scope.row.properties.Name"
                size="mini"></datablau-input>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column width="300px" :label="$store.state.$v.dataEntity.marco">
        <template slot-scope="scope">
          <span v-if="isForeignKey(scope.row) || !editMode" style="margin-left:1.2em;">{{scope.row.properties.Macro}}</span>
          <datablau-input
            v-else
            style="width: 240px;"
            @change="handleMacroChange(scope.row.properties)"
            v-model="scope.row.properties.Macro"
            size="mini"
          ></datablau-input>
        </template>
      </el-table-column>
      <el-table-column width="50px;">
      </el-table-column>
      <el-table-column
        :label="$store.state.$v.dataEntity.type"
        :min-width="50"
        prop="properties.KeyGroupType"
        :formatter="keyNameFormatter">
      </el-table-column>
      <el-table-column
        :label="$store.state.$v.dataEntity.memberCol"
        :min-width="120"
        show-overflow-tooltip
        :formatter="joinColumns"
      >
      </el-table-column>
      <el-table-column
        v-if="editMode"
        :width="82"
        label="操作"
      >
        <template slot-scope="scope">
          <!-- <el-button
            v-if="editMode"
            type="text"
            @click="onRowClick(scope.row)"
            :disabled="isForeignKey(scope.row)"
          >{{$store.state.$v.dataEntity.edit}}</el-button> -->
          <datablau-button
                  v-if="editMode"
                  type="icon"
                  class="iconfont icon-bianji"
                  style="margin-right: 5px;"
                  @click="onRowClick(scope.row)"
                  :disabled="isForeignKey(scope.row)"
                  :tooltipContent="$store.state.$v.dataEntity.edit"
                >
            </datablau-button>
          <!-- <el-button
            v-if="editMode"
            type="text"
            @click="removeIndex(scope.$index)"
            :disabled="isForeignKey(scope.row)"
          >{{$store.state.$v.dataEntity.delete}}</el-button> -->
          <datablau-button
                  v-if="editMode"
                  type="icon"
                  class="iconfont icon-delete"
                  @click.stop="removeIndex(scope.$index)"
                  style="margin-left:0"
                  :disabled="isForeignKey(scope.row)"
                  :tooltipContent="$store.state.$v.dataEntity.delete"
                >
            </datablau-button>
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
@import '../paneDetail';

.is-block.lt {
  padding-left: 5px;
  padding-right:  5px;
  margin-right: 6px;
}
.is-block.text.lt {
  .iconfont {
    color: #409EFF !important;
  }
}
.table-box {
  position: absolute;
  top: 32px;
  left: 0;
  right: 0;
  bottom: 0;
  &.edit {
    top: 10px;
  }
}
 .is-block {
      padding-top: 0;
      padding-bottom: 0;
      &.t1 {
        position: relative;
        top: -10px;
        font-size: 12px;
        line-height: 22px!important;
        /deep/ span {
          font-size: 12px;
        }
      }
    }
  /deep/.icon-tianjia:before {
        margin-right: 5px;
        font-size: 14px !important;
      }
.datablau-input /deep/ .el-input__inner {
          height: 28px;
          line-height: 28px;
        }
        .el-button {
          /deep/ span {
            font-size: 14px;
            margin-left: 4px;
          }
        }
</style>
<style lang="scss">
.tableIndexTable{
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
</style>
