<template>
  <div class="tab-page user-list tab-page-ver2">
    <!-- <el-dialog
      title="找回用户"
      :visible.sync="showFindeDeleteUser"
      width="300px"
    >
      <div class="form-box">
        <el-select
          v-model="restoreUsername"
          size="mini"
          placeholder="请选择"
          filterable
        >
          <el-option v-for="name in deletedUsernames" :key="name" :label="name" :value="name"></el-option>
        </el-select>
        <el-button
          @click="handleRestoreUser"
          size="mini"
          :disabled="!restoreUsername"
        >确定</el-button>
      </div>
    </el-dialog> -->
    <div class="filter-row">
      <div class="flter-inde">
        <el-form
          :inline="true"
          :label-position="right"
          :model="formInline"
          class="demo-form-inline"
        >
          <el-form-item label="权限名称" style="margin-left: 30px">
            <el-input v-model="formInline.roleFriendlyName"></el-input>
          </el-form-item>
          <el-form-item label="权限编码">
            <el-input v-model="formInline.roleName"></el-input>
          </el-form-item>
          <br />
          <el-form-item label="一级模块" style="margin-left: 30px">
            <el-input v-model="formInline.roleModule"></el-input>
          </el-form-item>
          <el-form-item label="二级模块">
            <el-input v-model="formInline.roleModuleClass"></el-input>
          </el-form-item>
          <!-- <el-form-item label="活动区域">
            <el-select v-model="formInline.region" placeholder="活动区域">
              <el-option label="区域一" value="shanghai"></el-option>
              <el-option label="区域二" value="beijing"></el-option>
            </el-select>
          </el-form-item> -->
        </el-form>
      </div>
      <div class="page-btn-group right-top">
        <!-- <el-button size="mini" @click="handleShowDeletedUsers" v-if="$isAdmin">
          <i class="fa fa-history"></i>找回用户
        </el-button> -->
        <el-button size="mini" @click="refresh">
          <i class="el-icon-refresh"></i>
          刷新
        </el-button>
        <el-button type="primary" size="small" @click="addTab">添加</el-button>
      </div>
    </div>
    <div class="table-row" style="top: 100px">
      <el-table
        :data="dataDisplay"
        class="plain-table"
        :stripe="true"
        height="100%"
        @selection-change="handleSelectionChange"
        border
      >
        <el-table-column type="selection"></el-table-column>
        <el-table-column
          prop="roleFriendlyName"
          label="权限名称"
        ></el-table-column>
        <el-table-column
          prop="roleDescription"
          label="权限描述"
        ></el-table-column>
        <el-table-column prop="roleName" label="权限编码"></el-table-column>
        <!-- <el-table-column
          prop="roleMethod"
          label="方法">
        </el-table-column> -->
        <el-table-column prop="roleUrl" label="权限接口"></el-table-column>
        <el-table-column prop="roleModule" label="一级模块"></el-table-column>
        <el-table-column
          prop="roleModuleClass"
          label="二级模块"
        ></el-table-column>

        <el-table-column
          label="操作"
          header-align="right"
          align="right"
          width="180"
        >
          <template slot-scope="scope">
            <el-button size="small" type="text" @click="editDetails(scope.row)">
              编辑
            </el-button>
            <el-button size="small" type="text" @click="deletes(scope.row)">
              {{ $t('common.button.delete') }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column width="10"></el-table-column>
      </el-table>
    </div>
    <div class="footer-row">
      <!-- <el-button
        icon="el-icon-delete"
        type="danger"
        size="small"
        class="red-btn"
        @click="preDeleteRows"
        :disabled="deleteDisabled"
        >删除</el-button> -->
      <!-- <el-button
        icon="el-icon-delete"
        type="danger"
        size="small"
        @click="disabledUsers"
        :disabled="deleteDisabled"
        >禁用</el-button> -->
      <datablau-pagination
        style="float: right"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[20, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></datablau-pagination>
    </div>
  </div>
</template>

<script>
import list from './list.js'
export default list
</script>

<style lang="scss" scoped="scoped">
@import './list.scss';
</style>
<style>
.flter-inde .el-input__inner {
  height: 28px;
  line-height: 28px;
}
</style>
