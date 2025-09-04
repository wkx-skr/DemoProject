<template>
  <div class="content-area">
    <div class="top-header-info-panel-wrapper"><b>{{SoftwareUpdater.softwareUpdater}}</b><i class="el-icon-refresh" @click="refresh"></i></div>
    <div class="title-hint-wrapper">
      <b>{{SoftwareUpdater.package}}</b>
      <i class="line"></i>
    </div>
    <el-upload
      :action="$uploadUrlFormatter(uploadUrl)"
      :limit="2"
      ref="upload"
      multiple
      :auto-upload="false"
      :file-list="fileList"
      :on-change="onChange"
      :on-remove="onRemove"
      :on-success="onSuccess"
      :on-error="onError"
      class="upload-wrapper"
    >
      <el-button slot="trigger" size="small"><i class="el-icon-plus"></i>{{SoftwareUpdater.selectFile}}</el-button>
      <div :class="$isEng ? 'warning engWarning' : 'warning'"><i class="el-icon-warning"></i>{{SoftwareUpdater.upgradePackage}}</div>
    </el-upload>
    <el-button class="upload-btn" size="small" type="primary" @click="submitUpload" :disabled="!fileValid">{{SoftwareUpdater.server}}</el-button>
    <div class="title-hint-wrapper">
      <b>{{SoftwareUpdater.versionConfiguration}}</b>
      <i class="line"></i>
    </div>
    <el-form
      style="margin-top:20px;max-width:600px;"
      size="small"
      label-position="right"
      :label-width="$isEng ? '120px' : '70px'"
    >
      <el-form-item
        :label="SoftwareUpdater.versionNumber"
        required
      >
        <el-input
          v-model="vModel.version"
          :placeholder="SoftwareUpdater.information"
        ></el-input>
      </el-form-item>
      <!--<el-form-item
        label="强制更新"
      >
        <el-switch
          v-model="vModel.mandatory"
        ></el-switch>
      </el-form-item>-->
      <el-form-item
        label="host"
        required
      >
        <el-input
          v-model="vModel.host"
        ></el-input>
      </el-form-item>
      <el-form-item
        :label="SoftwareUpdater.route"
      >
        {{vModel.host}}static/updates/update.zip
      </el-form-item>
      <el-form-item
        :label="SoftwareUpdater.personnel"
      >
        <el-select
          v-model="vModel.users"
          multiple
          filterable
          style="width:100%;"
        >
          <el-option
            v-for="u in users"
            :key="u.userId"
            :label="userLabelFormatter(u)"
            :value="userValueFormatter(u)"
          ></el-option>
        </el-select>
      </el-form-item>
      <!--<el-form-item
        v-for="item in formProps"
        :key="item.label"
        :label="item.label"
        :required="item.required"
      >
        <el-input
          v-if="item.textarea"
          :placeholder="item.placeholder"
          type="textarea"
          v-model="vModel[item.prop]"
          :autosize="{minRows:5}"
        ></el-input>
        <el-input
          v-else
          v-model="vModel[item.prop]"
          :placeholder="item.placeholder"
        ></el-input>
      </el-form-item>-->
      <el-form-item>
        <el-button type="primary" :disabled="!xmlReady" @click="updateCheckVersionXml">{{SoftwareUpdater.saveConfiguration}}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import HTTP from '@/resource/http'
import sort from '@/resource/utils/sort'
import _ from 'lodash'
import datablauTooltip from '@/components/common/tooltip.vue'
export default {
  components: {
    // datablauTooltip
  },
  data () {
    const formProps = [
      {
        label: this.$v.SoftwareUpdater.versionNumber,
        placeholder: this.$v.SoftwareUpdater.information,
        prop: 'version',
        textarea: false,
        required: true
      }, {
        label: this.$v.SoftwareUpdater.update,
        prop: 'mandatory',
        boolean: true
      }, {
        label: this.$v.SoftwareUpdater.personnel,
        prop: 'users',
        placeholder: this.$v.SoftwareUpdater.allUsers,
        textarea: true
      }, {
        label: 'host',
        prop: 'host',
        required: true
      }
    ]
    let vModel = {
      version: '',
      // mandatory: false,
      users: '',
      host: location.origin + location.pathname
    }
    return {
      users: [],
      formProps: formProps,
      vModel: vModel,
      uploadUrl: this.$url + '/service/utils/update/DDM/file',
      fileList: [],
      fileValid: false,
      SoftwareUpdater: this.$v.SoftwareUpdater
    }
  },
  mounted () {
    this.getUsers()
  },
  inject: ['refresh'],
  methods: {
    getUsers () {
      HTTP.getUsers({
        successCallback: data => {
          sort.sort(data, 'username')
          this.users = data
        }
      })
    },
    userLabelFormatter (user) {
      const fullName = _.toString(user.firstname) + _.toString(user.lastname)
      if (fullName) {
        return user.username + ` (${fullName})`
      } else {
        return user.username
      }
    },
    userValueFormatter (user) {
      return user.username
    },
    onChange (file, fileList) {
      let zipReady, htmlReady
      fileList.forEach(file => {
        if (file.name === 'update.zip') {
          zipReady = true
        } else if (file.name === 'releasenotes.html') {
          htmlReady = true
        }
      })
      if (fileList.length === 2 && zipReady && htmlReady) {
        this.fileValid = true
      } else {
        this.fileValid = false
      }
    },
    onRemove () {
      this.fileValid = false
    },
    onError (err, file) {
      console.error(err)
      this.$message.warning(file.name + this.SoftwareUpdater.serverErrorMsg)
    },
    onSuccess (response, file) {
      this.$message.success(file.name + this.SoftwareUpdater.serverSuccessMsg)
      this.fileValid = false
    },
    submitUpload () {
      this.$refs.upload.submit()
    },
    updateCheckVersionXml () {
      const requestBody = this.vModel
      HTTP.updateCheckVersionXml({
        requestBody: requestBody,
        successCallback: () => {
          this.$message.success(this.SoftwareUpdater.updateMsg)
        }
      })
    }
  },
  computed: {
    xmlReady () {
      return this.vModel.version && this.vModel.host
    }
  }
}
</script>

<style lang="scss" scoped>
  .upload-wrapper {
    padding: 25px 10px 0;
    .el-button {
      font-size: 13px;
      line-height: 1;
    }
    .el-button--default {
      width: 360px;
      height: 34px;
      color: #888F9D;
      i {
        margin-right: 5px;
      }
    }
    .warning {
      margin-left: 10px;
      display: inline-block;
      width: 340px;
      height: 34px;
      padding: 0 10px;
      background: #EDF4FF;
      border-radius: 4px;
      font-size: 14px;
      color: #4386F5;
      line-height: 34px;
      i {
        margin-right: 7px;
        font-size: 16px;
        color: #4386F5;
      }
    }
    .engWarning{
      width: 360px;
    }
    /deep/ .el-upload-list {
      width: 360px;
    }
  }
  .upload-btn {
    margin: 13px 10px 50px;
    padding: 0;
    display: block;
    width: 110px;
    height: 34px;
  }
  .title-hint-wrapper {
    margin-top: 20px;
    position: relative;
    font-size: 14px;
    line-height: 16px;
    b {
      display: inline-block;
      padding-right: 4px;
      background: #fff;
    }
    b::before {
      display: inline-block;
      margin-right: 6px;
      content: '';
      width: 4px;
      height: 16px;
      background: #4386F5;
      vertical-align: bottom;
    }
    .line {
      position: absolute;
      top: 8px;
      right: 0;
      left: 0;
      border-top: 1px solid #E0E0E0;
      z-index: -1;
    }
  }
  /deep/ {
    .el-form-item__label {
      font-size: 12px;
      color: #232E43;
    }
    .el-form-item__content {
      font-size: 12px;
    }
  }
  .content-area {
    left:0;
  }
</style>
