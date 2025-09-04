<template>
  <div class="container">
    <el-form class="page-form" size="small" :model="ruleForm" :rules="rules" ref="ruleForm" label-width="180px">
      <el-form-item :label="$v.drive.driveName" prop="driverName">
        <el-input v-model="ruleForm.driverName" :placeholder="$v.drive.PleasedriverName"></el-input>
      </el-form-item>
      <el-form-item :label="$v.drive.driverClassName" prop="driverClassName">
        <el-input :disabled="dsEditing" v-model="ruleForm.driverClassName" :placeholder="$v.drive.PleasedriverClassName"></el-input>
      </el-form-item>
      <el-form-item :label="$v.drive.file" prop="storedFileName">
        <el-input v-model="ruleForm.storedFileName" :disabled="true" :placeholder="$v.drive.PleaseGetFileID"></el-input>
        <el-upload
          :action="$uploadUrlFormatter(uploadDriUrl)"
          :beforeUpload="uploadHandle"
          :on-success="onRefDocSuce"
          :on-error="onRefDocErr"
          :show-file-list="false"
          class="upload-wraper"
          accept=".jar"
          :headers="$headers"
          v-if="!dsEditing"
        >
          <el-button
            size="small"
            icon="el-icon-upload2"
            class="upload-btn"
          >{{$v.drive.upload}}
          </el-button>
        </el-upload>
      </el-form-item>
      <el-form-item :label="$v.drive.type" prop="type">
        <el-select :disabled="true" v-model="ruleForm.type" :placeholder="$v.drive.PleaseSelectType">
          <el-option
            v-for="item in typeOption"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$v.drive.builtIn" prop="builtIn" v-if="dsEditing">
        <el-select :disabled="dsEditing" v-model="ruleForm.builtIn" :placeholder="$v.drive.PleaseSelectBuiltIn">
          <el-option v-for="(builtIn,index) in builtInOption" :key="index" :label="builtIn.lable"
                     :value="builtIn.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$v.drive.defaultSelection" prop="defaultDriver" v-if="dsEditing">
        <el-select :disabled="dsEditing" v-model="ruleForm.defaultDriver" :placeholder="$v.drive.PleaseChoosedefaultValue">
          <el-option v-for="(defaultDriver,index) in defaultDriverOption" :key="index" :label="defaultDriver.lable"
                     :value="defaultDriver.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :disabled="addDisabled" @click="submitForm('ruleForm')">{{$v.drive.save}}</el-button>
        <el-button @click="resetForm('ruleForm')">{{$v.drive.cancel}}</el-button>
      </el-form-item>
    </el-form>

  </div>
</template>

<script>
import js from './editDriveManagement.js'

export default js
</script>
<style lang="scss" scoped>
.upload-wraper {
  display: inline-block;

  .upload-btn {
    background-color: #479EFF;
    color: #fff;
    margin-left: 10px;
  }
}

.container {
  padding-top: 20px;

  .page-form {
    /deep/ .el-input {
      width: 360px;
    }
  }
}

</style>
