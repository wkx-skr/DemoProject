<template>
  <div class="edit-ddl-setting">
    <div class="tab-line">
      <datablau-tabs class="dll-type-tabs" v-model="ddlType" @tab-click="changeDdlType">
        <el-tab-pane
          label="create-脚本配置"
          name="create"
        ></el-tab-pane>
        <el-tab-pane
          label="alter-脚本配置"
          name="alter"
          v-if="!hideAlterDbs.find(item => item === this.dbType.toLowerCase())"
        ></el-tab-pane>
      </datablau-tabs>
    </div>
    <datablau-form-submit class="submit-content">
      <div class="ddl-setting-content">
        <div class="create-ddl-option" v-show="ddlType === 'create'" v-loading="loading">
          <ddl-setting
            ref="ddlSettingCreate"
            :default-option="optionCreate"
            v-if="optionCreate"
            height="100%"
          ></ddl-setting>
        </div>
        <div class="create-ddl-option" v-show="ddlType === 'alter'" v-loading="loading">
          <ddl-setting
            ref="ddlSettingAlter"
            :default-option="optionAlter"
            v-if="optionAlter"
            height="100%"
          ></ddl-setting>
        </div>
      </div>
      <template slot="buttons">
        <datablau-button size="small" type="primary" @click="confirmPost">{{ $v.udp.Yes }}
        </datablau-button>
        <datablau-button size="small" type="secondary" @click="handleRemoveTab">{{ $v.udp.cancel }}</datablau-button>
      </template>
    </datablau-form-submit>

  </div>
</template>

<script>
import editDdlSetting from './editDdlSetting.js'

export default editDdlSetting
</script>
<style lang='scss' scoped>
.edit-ddl-setting {
  height: 100%;

  .tab-line {
    padding: 0 20px;
  }

  .submit-content {
    top: 40px;
  }

}
</style>
