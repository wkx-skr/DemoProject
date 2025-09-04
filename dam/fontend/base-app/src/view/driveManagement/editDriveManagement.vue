<template>
  <div class="container">
    <datablau-form-submit>
      <el-form
        class="page-form"
        size="small"
        :model="ruleForm"
        :rules="rules"
        ref="ruleForm"
        label-width="100px"
      >
        <el-form-item :label="$t('meta.driveManage.name')" prop="driverName">
          <datablau-input
            :placeholder="$t('meta.driveManage.fillName')"
            v-model="ruleForm.driverName"
          ></datablau-input>
        </el-form-item>
        <el-form-item
          :label="$t('meta.driveManage.driverClassName')"
          prop="driverClassName"
        >
          <datablau-input
            :disabled="dsEditing"
            :placeholder="$t('meta.driveManage.fillDriverClassName')"
            v-model="ruleForm.driverClassName"
          ></datablau-input>
        </el-form-item>
        <el-form-item
          :label="$t('meta.driveManage.uploadFile')"
          prop="storedFileName"
        >
          <!-- <el-input
          v-model="ruleForm.storedFileName"
          :disabled="true"
          placeholder="请获取文件id"
        ></el-input> -->
          <!-- <datablau-input
            style="display: block"
            :disabled="true"
            :placeholder="$t('meta.driveManage.getFileId')"
            v-model="ruleForm.storedFileName"
          ></datablau-input> -->
          <datablau-upload
            accept=".jar, .zip"
            v-if="!dsEditing"
            :isEdit="true"
            :headers="$headers"
            :drag="true"
            :action="uploadDriUrl"
            list-type="text"
            :fileListZip="fileListZip"
            :limit="1"
            :on-success="onRefDocSuce"
            :on-error="onRefDocErr"
            :on-remove="onRemove"
            :show-file-list="true"
            class="upload-wraper"
          >
            <slot>
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">
                {{ $t('meta.driveManage.dragOr1') }}
                <em>{{ $t('meta.driveManage.click') }}</em>
              </div>
            </slot>
          </datablau-upload>
        </el-form-item>
        <el-form-item :label="$t('meta.driveManage.type')" prop="type">
          <datablau-select
            style="width: 300px"
            :disabled="dsEditing"
            v-model="ruleForm.type"
            clearable
            :placeholder="$t('meta.driveManage.selType')"
            size="mini"
          >
            <el-option
              v-for="item in typeOption"
              :key="item.dbType"
              :label="item.dbLabel"
              :value="item.dbType"
            ></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item
          :label="$t('meta.driveManage.isInner')"
          prop="builtIn"
          v-if="dsEditing"
        >
          <el-select
            :disabled="dsEditing"
            v-model="ruleForm.builtIn"
            :placeholder="$t('meta.driveManage.selIsInner')"
          >
            <el-option
              v-for="(builtIn, index) in builtInOption"
              :key="index"
              :label="builtIn.lable"
              :value="builtIn.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          :label="$t('meta.driveManage.defaultSel')"
          prop="defaultDriver"
          v-if="dsEditing"
        >
          <el-select
            :disabled="dsEditing"
            v-model="ruleForm.defaultDriver"
            :placeholder="$t('meta.driveManage.selDefaultSel')"
          >
            <el-option
              v-for="(defaultDriver, index) in defaultDriverOption"
              :key="index"
              :label="defaultDriver.lable"
              :value="defaultDriver.value"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="buttons" style="text-align: left">
        <datablau-button type="secondary" @click="resetForm">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button
          type="important"
          @click="submitForm"
          :disabled="addDisabled"
        >
          {{ $t('common.button.save') }}
        </datablau-button>
      </div>
    </datablau-form-submit>
  </div>
</template>

<script>
import js from './editDriveManagement.js'
export default js
</script>
<style lang="scss" scoped>
.page-form {
  padding: 10px 0;
}
/deep/ .el-form.page-form .el-input {
  width: 400px;
}
/deep/ .form-submit {
  padding: 0 20px;
}
/deep/ .el-form-item {
  margin-bottom: 14px;
}
.absolute-btns {
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
.upload-wraper {
  display: inline-block;
  .upload-btn {
    background-color: #479eff;
    color: #fff;
    margin-left: 10px;
  }
}
.upload-wraper {
  // margin-top: 14px;
  /deep/ .el-upload {
    .el-upload-dragger {
      width: 400px;
      height: 206px;
      .el-upload__text {
        color: #555555;
      }
      .el-icon-upload {
        margin: 0 auto;
        margin-top: 67px;
        color: #e5e5e5;
      }
    }
  }
}
</style>
