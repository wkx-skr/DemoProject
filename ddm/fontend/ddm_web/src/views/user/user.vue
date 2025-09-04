<template>
  <div class="content-area">
    <!--<el-dialog
      :title="dialogTitle"
      v-if="dialogVisible"
      :visible.sync="dialogVisible"
      width="400px"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-form size="mini" label-width="5em">
        <el-form-item label="用户名">
          <el-input v-model="dialogBody.username"></el-input>
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="dialogBody.firstname"></el-input>
        </el-form-item>
        <el-form-item label="电子邮件">
          <el-input v-model="dialogBody.email"></el-input>
        </el-form-item>
      </el-form>
      <el-button type="primary" size="small" @click="handleSave">保存</el-button>
      <el-button size="small" @click="dialogVisible=false">关闭</el-button>
    </el-dialog>-->
    <div class="top-header-info-panel-wrapper">
      <b>{{$v.userMgr.userMg}}</b>
      <i class="el-icon-refresh" @click="refresh"></i>
      <el-input
        size="small"
        v-model="keyword"
        prefix-icon="el-icon-search"
        :placeholder="$v.userMgr.placeholder_01"
      ></el-input>
    </div>
    <div class="table-container">
      <el-table
        class="datablau-table"
        :data="tableData"
        row-class-name="row-can-click1"
        height="100%">
        <el-table-column
          prop="username"
          :label="$v.userMgr.userName"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <div>
              <i class="user-icon"></i>
              {{scope.row.username}}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="userType"
          :label="$v.userMgr.userType"
        ></el-table-column>
        <el-table-column
          prop="fullName"
          :label="$v.userMgr.fullName"
        >
        </el-table-column>
        <el-table-column
          prop="email"
          :label="$v.userMgr.email"
        >
        </el-table-column>
        <!-- <el-table-column
          :label="$v.userMgr.editPer"
          width="120"
        >
          <template slot-scope="scope">
            <el-switch v-model="scope.row.isEditor" @change="handleChange(scope.row)"></el-switch>
          </template>
        </el-table-column> -->
      </el-table>
    </div>
    <div class="pagination-container">
      <el-pagination
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        :page-size="pageSize"
        :page-sizes="[20, 50, 100]"
        :current-page.sync="currentPage"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      ></el-pagination>
    </div>
  </div>
</template>

<script>
import user from './user.js'
export default user
</script>

<style lang="scss" scoped>
.content-area {
  left:0;
}
.table-container {
  top:65px;
  bottom:50px;
}
.user-icon {
  display: inline-block;
  margin-right: 8px;
  width: 11px;
  height: 13px;
  background: url('../common/navIcon/user.svg');
  background-size: contain;
  vertical-align: middle;
}
</style>
