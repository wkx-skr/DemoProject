<template>
  <div class="index-content-box">
    <datablau-form-submit>
      <div class="index-detail-add">
        <el-form
          :inline-message="false"
          class="page-form index-page"
          label-position="right"
          label-width="110px"
          size="small"
          ref="form0"
          :model="innerDetail"
        >
          <el-form-item
            label="业务流程名称"
            prop="name"
            :rules="{ required: true, message: '业务流程名称是必填的' }"
          >
            <datablau-input
              v-model="innerDetail.name"
              placeholder="请输入业务流程名称"
            ></datablau-input>
          </el-form-item>
          <el-form-item
            label="业务流程编号"
            prop="flowCode"
            :rules="{ required: true, message: '业务流程编号是必填的' }"
          >
            <datablau-input
              v-model="innerDetail.flowCode"
              placeholder="请输入业务流程编号"
            ></datablau-input>
          </el-form-item>
          <el-form-item
            label="业务域"
            prop="path0"
            :rules="{ required: true, message: '业务域是必填的' }"
          >
            <datablau-input
              v-model="innerDetail.path0"
              placeholder="请输入业务域"
            ></datablau-input>
          </el-form-item>
          <el-form-item label="一级业务职能" prop="path1">
            <datablau-input
              v-model="innerDetail.path1"
              placeholder="请输入一级业务职能"
            ></datablau-input>
          </el-form-item>
          <el-form-item label="二级业务职能" prop="path2">
            <datablau-input
              v-model="innerDetail.path2"
              placeholder="请输入二级业务职能"
            ></datablau-input>
          </el-form-item>
          <el-form-item label="三级业务职能" prop="path3">
            <datablau-input
              v-model="innerDetail.path3"
              placeholder="请输入三级业务职能"
            ></datablau-input>
          </el-form-item>
          <el-form-item label="三级以下业务职能" prop="pathMore">
            <datablau-input
              v-model="innerDetail.pathMore"
              placeholder="请输入三级以下的业务职能，之间用分号分隔"
            ></datablau-input>
          </el-form-item>
        </el-form>
      </div>
      <!-- class="page-btn-group left-bottom" -->
      <div slot="buttons" style="text-align: left">
        <datablau-button type="important" @click="beforeUpdateDetail">
          保存
        </datablau-button>
        <datablau-button type="secondary" @click="cancel">
          退出编辑
        </datablau-button>
      </div>
    </datablau-form-submit>
  </div>
</template>

<script>
import indexDetail from './indexDetail'
export default indexDetail
</script>

<style lang="scss" scoped="scoped">
@import 'indexDetail';
/deep/ .form-submit {
  top: 50px;
}
.page-btn-group {
  text-align: right;
  border-top: 1px solid #e0e0e0;
  padding-top: 10px;
  padding-bottom: 20px;
  padding-right: 20px;
  box-sizing: border-box;
  position: absolute;
  bottom: 0;
  right: 0;
  width: 100%;
  z-index: 9;
  box-shadow: 0px -5px 14px -8px rgba(0, 0, 0, 0.2);
  background-color: #fff;
  text-align: right;
  margin: 0;
}
/deep/ .el-form-item {
  margin-bottom: 14px;
  .el-form-item__label {
    height: 34px;
    line-height: 34px;
  }
}
</style>
<style lang="scss">
.index-detail-add {
  // position: absolute;
  // top: 60px;
  // left: 20px;
  padding: 0 20px;
  overflow: auto;
  .over-hidden {
    overflow: hidden;
  }
  .el-form.page-form {
    .el-input {
      width: 100%;
      max-width: 460px;
    }
  }
}
.breadcrumb-content {
  position: absolute;
  top: 0;
  left: 20px;
  height: 40px;
  padding-top: 8px;
  box-sizing: border-box;
  width: 100%;
  background-color: #fff;
  border-bottom: 1px solid #ebeef5;
}
</style>
