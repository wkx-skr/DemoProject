<template>
  <div class="content-area">
    <datablau-dialog
      :title="editDialogTitle"
      :visible.sync="editDialogVisible"
      ref="editDialog"
      width="460px"
      :close-on-click-modal="false"
      append-to-body
    >
      <datablau-form label-position="right" label-width="80px" size="mini" :rules="rules" v-if="editDialogVisible">
        <el-form-item :label="$v.tagMgr.name" prop="name">
          <el-input ref="editDialogInput" v-model="tagName" @keydown.enter.native="save"></el-input>
        </el-form-item>
        <el-form-item :label="$v.tagMgr.description">
          <el-input type="textarea" v-model="tagDef" @keydown.enter.native="save"></el-input>
        </el-form-item>
      </datablau-form>
      <div slot="footer">
        <datablau-button
          size="small"
          @click="closeEditDialog"
        >{{$v.tagMgr.close}}</datablau-button>
        <datablau-button
          size="small"
          type="primary"
          @click="save"
          :disabled="!canSave"
        >{{$v.tagMgr.save}}</datablau-button>
      </div>
    </datablau-dialog>
    <div class="top-header-info-panel-wrapper">
      <b class="page-title">{{ $v.tagMgr.tagMg }}</b>
      <i class="el-icon-refresh" @click="refresh"></i>
    </div>
    <div class="top-title">
      <div class="search-box">
        <!--请输入关键字-->
        <datablau-input
          size="small"
          :iconfont-state="true"
          prefix-icon="el-icon-search"
          v-model="keyword"
          :placeholder="$v.tagMgr.placeholder_01"
          style="vertical-align: top;"
        ></datablau-input>
        <div class="top-button">
          <div class="right-btn-container">
            <datablau-button
              class="iconfont icon-tianjia" type="important" size="small" style="float:right;margin-top: 4px;"
              @click="initCreateTag"
            >
              {{ $v.tagMgr.creLabel }}
            </datablau-button>
          </div>
        </div>
      </div>
    </div>
    <div class="table-container">
      <datablau-table
        class="datablau-table"
        :data="tableData"
        row-class-name="row-can-click1"
        height="100%">
        <el-table-column
          prop="name"
          :label="$v.tagMgr.name"
          :sortable="true"
          :sort-method="sortNameMethod"
          show-overflow-tooltip
          min-width="150px"
        >
          <template slot-scope="scope">
            <datablau-list-icon :dataType="'icon-biaoqian'"></datablau-list-icon>
            {{scope.row.name}}
          </template>
        </el-table-column>
        <el-table-column
          prop="tagDef"
          :label="$v.tagMgr.description"
          show-overflow-tooltip
          min-width="450px"
        >
        </el-table-column>
        <el-table-column
          :label="$v.tagMgr.operation"
          width="100"
          align="center"
          fixed="right"
        >
          <template slot-scope="scope">
            <datablau-button type="icon" class="iconfont icon-bianji" :tooltip-content="'编辑'" @click="initEditTag(scope.row)"></datablau-button>
            <datablau-button type="icon" class="iconfont icon-delete" :tooltip-content="'删除'" @click="deleteTag(scope.row)"></datablau-button>
          </template>
        </el-table-column>
      </datablau-table>
    </div>
    <div class="pagination-container">
      <datablau-pagination
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        :page-size="pageSize"
        :page-sizes="[20, 50, 100]"
        :current-page.sync="currentPage"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      ></datablau-pagination>
    </div>
  </div>
</template>

<script>
import tag from './tag.js'
export default tag
</script>

<style lang="scss" scoped>
.content-area {
  .top-header-info-panel-wrapper {
    height: 40px;
    line-height: 40px;
    position: absolute;
    left: 20px;
    right: 20px;
    top: 0;

    .page-title {
      line-height: 40px;
    }
  }
}

.top-title {
  //margin-top: 12px;
  position: relative;
  margin-top: 20px;
  //padding-left: 20px;

  .search-box {
    display: inline-block;

    .label {
      font-size: 12px;
      margin-right: 10px;
      margin-left: 20px;
      font-weight: bold;
    }
  }

  .el-input {
    width: 200px;
    height: 34px;
    vertical-align: middle;
  }

  .top-button {
    position: absolute;
    right: 0;
    top: 0;
  }
}

.content-area {
  left: 0;
}

.content-area .table-container {
  top: 75px;
  bottom: 50px;

  .el-icon-edit-outline {
    font-size: 16px;
    margin-right: 18px;
    cursor: pointer;
  }

  .el-icon-delete {
    font-size: 16px;
    cursor: pointer;
  }
}
  .fa {
    font-size: 16px;
    color: #4386F5;
  }
</style>
