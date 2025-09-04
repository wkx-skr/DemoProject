<template>
  <div>
    <el-form
      class="page-form"
      label-position="right"
      label-width="100px"
      size="small"
      :rules="rules"
      :model="authority"
    >
      <!-- v-model="content"  -->
      <el-form-item label="权限名称">
        <el-input
          v-model="authority.roleFriendlyName"
          placeholder="请输入权限名称"
        ></el-input>
      </el-form-item>
      <el-form-item label="权限编码">
        <el-input
          v-model="authority.roleName"
          placeholder="请输入权限编码"
        ></el-input>
      </el-form-item>

      <el-form-item label="一级模块">
        <!-- <el-input v-model="authority.roleModule" placeholder="请选择一级模块"></el-input> -->
        <el-select
          v-model="authority.roleModule"
          filterable
          allow-create
          default-first-option
          @change="changses(authority.roleModule)"
        >
          <el-option
            v-for="item in roleModules"
            :key="item"
            :label="item"
            :value="item"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="二级模块">
        <!-- <el-input v-model="authority.roleModuleClass" placeholder="请选择二级模块"></el-input> -->
        <el-select
          v-model="authority.roleModuleClass"
          filterable
          allow-create
          default-first-option
        >
          <el-option
            v-for="item in roleModuleClasss"
            :key="item"
            :label="item"
            :value="item"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="权限接口">
        <el-input
          v-model="authority.roleUrl"
          placeholder="请输入权限名称"
        ></el-input>
      </el-form-item>
      <el-form-item label="权限方法">
        <el-input
          v-model="authority.roleMethod"
          placeholder="请输入权限方法"
        ></el-input>
      </el-form-item>
      <el-form-item label="权限描述">
        <el-input
          v-model="authority.roleDescription"
          placeholder="请输入权限描述"
        ></el-input>
      </el-form-item>
    </el-form>
    <div class="page-btn-group left-bottom">
      <el-button size="small" type="primary" @click="confirm">确 定</el-button>
      <el-button size="small" class="white-btn" @click="remove">
        {{ $t('common.button.cancel') }}
      </el-button>
      <!-- <el-button size="small" type="primary" @click="resetPassword" v-if="preData && !$prohibitResetPassword">修改密码</el-button> -->
    </div>
  </div>
</template>

<script>
import detail from './detail.js'
export default detail
</script>

<style lang="scss" scoped="scoped">
.margin {
  margin-top: 10px;
  margin-left: 23px;
}
</style>
