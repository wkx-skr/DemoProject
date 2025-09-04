<template>
  <div class="index-detail">
    <el-form
      style="max-height: 350px; overflow: auto"
      :inline-message="false"
      class="page-form index-page"
      label-position="right"
      label-width="120px"
      size="small"
      ref="form0"
      :model="innerDetail"
    >
      <el-form-item
        label="业务活动名称"
        prop="busiName"
        :rules="{ required: true, message: '业务活动名称是必填的' }"
      >
        <datablau-input
          v-model="innerDetail.busiName"
          placeholder="请输入业务活动名称"
        ></datablau-input>
      </el-form-item>
      <el-form-item
        label="业务活动编号"
        prop="busiCode"
        :rules="{ required: true, message: '业务活动编号是必填的' }"
      >
        <datablau-input
          v-model="innerDetail.busiCode"
          placeholder="请输入业务活动编号"
        ></datablau-input>
      </el-form-item>
      <!--<el-form-item
            label="输入数据对象"
            prop="inputObj"
            >
            <el-input
              v-model="innerDetail.inputObj"
              placeholder="请输入输入数据对象"
              ></el-input>
          </el-form-item><el-form-item
            label="输出数据对象"
            prop="outputObj"
            >
            <el-input
              v-model="innerDetail.outputObj"
              placeholder="请输入输出数据对象"
              ></el-input>
          </el-form-item>-->
      <el-form-item label="数据等级" prop="dataLevel">
        <datablau-input
          v-model="innerDetail.dataLevel"
          placeholder="数据等级"
        ></datablau-input>
      </el-form-item>
      <el-form-item label="主题域" prop="subjectArea">
        <datablau-input
          v-model="innerDetail.subjectArea"
          placeholder="请输入主题域"
        ></datablau-input>
      </el-form-item>
      <el-form-item label="是否跨主题域" prop="crossAreas">
        <datablau-input
          v-model="innerDetail.crossAreas"
          placeholder="请输入是否跨主题域"
        ></datablau-input>
      </el-form-item>
      <el-form-item label="是否建议主数据对象" prop="isRecommend">
        <datablau-input
          v-model="innerDetail.isRecommend"
          placeholder="请输入是否建议主数据对象"
        ></datablau-input>
      </el-form-item>
      <el-form-item label="负责部门" prop="departments">
        <datablau-input
          v-model="innerDetail.departments"
          placeholder="请输入负责部门,部门之间用分号分隔"
        ></datablau-input>
      </el-form-item>
      <el-form-item label="对应源系统的表" prop="srcTable">
        <datablau-input
          v-model="innerDetail.srcTable"
          placeholder="请输入对应源系统的表,表之间用分号分隔"
        ></datablau-input>
      </el-form-item>
      <el-form-item label="对应源系统名称" prop="srcSys">
        <datablau-input
          v-model="innerDetail.srcSys"
          placeholder="请输入对应源系统名称"
        ></datablau-input>
      </el-form-item>
    </el-form>

    <div
      class="page-btn-group left-bottom dialog-bottom"
      style="text-align: right"
    >
      <datablau-button type="important" @click="beforeUpdateDetail">
        保存
      </datablau-button>
      <datablau-button type="secondary" @click="cancel">
        退出编辑
      </datablau-button>
    </div>
  </div>
</template>

<script>
import indexDetail from './objectDetail.js'
export default indexDetail
</script>

<style lang="scss" scoped="scoped">
@import 'indexDetail';
.index-detail {
  position: relative;
  padding-bottom: 60px;
  .page-btn-group {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding-right: 30px;
    box-sizing: border-box;
  }
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
.index-detail {
  .over-hidden {
    overflow: hidden;
  }
}
</style>
