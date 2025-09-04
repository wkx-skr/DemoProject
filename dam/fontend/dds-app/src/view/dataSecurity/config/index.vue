<template>
  <div class="setting-cont">
    <template v-if="listShow">
      <div class="title">{{ $t('config.paramsConfig') }}</div>
      <datablau-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane :label="$t('config.code')" name="itemsCode"></el-tab-pane>
        <el-tab-pane
          v-if="$versionFeature.datasecurity_RangerSync"
          :label="$t('config.sync')"
          name="asyncRanger"
        ></el-tab-pane>
      </datablau-tabs>
      <div class="ul" v-if="activeName === 'itemsCode'">
        <!-- <datablau-detail-subtitle
        class="tile"
        mt="0"
        title="信息项编码自动生成"
      ></datablau-detail-subtitle> -->
        <!-- <div class="db-fieldMessage-title" style="margin-bottom: 16px">
        <p class="message-title">信息项编码自动生成</p>
      </div> -->
        <datablau-form
          :model="formData"
          ref="formData"
          :label-width="'120px'"
          :rules="rules"
          :disabled="disabled"
        >
          <el-form-item :label="$t('config.automatically')">
            <datablau-switch
              v-model="formData.autoIncState"
              :active-text="$t('securityModule.enable')"
              :inactive-text="$t('securityModule.disable')"
              type="innerText"
            ></datablau-switch>
          </el-form-item>
          <el-form-item :label="$t('config.fixedPrefix')">
            <datablau-input
              v-model="formData.prefix"
              :placeholder="$t('securityModule.input')"
              clearable
              style="width: 500px"
              maxlength="30"
            ></datablau-input>
          </el-form-item>
          <div>
            <el-form-item
              :label="$t('config.DataDigit')"
              prop="digitPart"
              style="display: inline-block"
            >
              <datablau-input
                v-model.number="formData.digitPart"
                @input="
                  val => {
                    handleEdit(val, 'digitPart')
                  }
                "
                :placeholder="$t('config.maxVal')"
                clearable
                style="width: 100px"
              ></datablau-input>
            </el-form-item>
            <el-form-item
              label-width="100px"
              :label="$t('config.startVal')"
              prop="startVal"
              style="display: inline-block"
            >
              <datablau-input
                v-model.number="formData.startVal"
                @input="
                  val => {
                    handleEdit(val, 'startVal')
                  }
                "
                :placeholder="$t('securityModule.input')"
                clearable
                style="width: 100px"
              ></datablau-input>
            </el-form-item>
            <el-form-item
              label-width="100px"
              :label="$t('config.autoincrement')"
              prop="incStepSize"
              style="display: inline-block"
            >
              <datablau-input
                v-model.number="formData.incStepSize"
                @input="
                  val => {
                    handleEdit(val, 'incStepSize')
                  }
                "
                :placeholder="$t('config.maxVal')"
                clearable
                style="width: 100px"
              ></datablau-input>
            </el-form-item>
          </div>
          <el-form-item :label="$t('config.nextGenerateCode')" v-if="disabled">
            <p>
              {{
                (formData.prefix ? formData.prefix : '') +
                fillZero(formData.nextVal, formData.digitPart) +
                (formData.suffix ? formData.suffix : '')
              }}
            </p>
          </el-form-item>
          <el-form-item :label="$t('config.fixedSuffix')">
            <datablau-input
              v-model="formData.suffix"
              :placeholder="$t('securityModule.input')"
              clearable
              style="width: 500px"
              maxlength="30"
            ></datablau-input>
          </el-form-item>
          <el-form-item>
            <datablau-button type="normal" @click="edit" v-if="disabled">
              {{ $t('securityModule.edit') }}
            </datablau-button>
            <datablau-button
              type="important"
              @click="saveFormData"
              v-if="!disabled"
            >
              {{ $t('securityModule.sure') }}
            </datablau-button>
            <datablau-button
              type="secondary"
              @click="closeSave"
              v-if="!disabled"
            >
              {{ $t('securityModule.cancel') }}
            </datablau-button>
          </el-form-item>
        </datablau-form>
      </div>
      <div class="ul" v-if="activeName === 'asyncRanger'">
        <div style="float: left; height: 34px; line-height: 34px">
          <span class="label" style="float: left">{{ $t('config.sync') }}</span>
          <datablau-switch
            v-model="asyncRanger"
            :active-text="$t('securityModule.enable')"
            :inactive-text="$t('securityModule.disable')"
            type="innerText"
            style="float: left; margin-left: 16px"
            @change="changeRangerSyncStatus"
          ></datablau-switch>

          <datablau-tooltip
            effect="dark"
            :content="$t('config.supportType')"
            placement="right"
            style="margin-top: 2px"
          >
            <i class="iconfont icon-tips"></i>
          </datablau-tooltip>
        </div>

        <datablau-button
          v-if="!asyncRanger"
          type="primary"
          class="iconfont icon-tianjia"
          size="mini"
          @click="addSource"
          style="float: right"
          :disabled="!!dataSourceList.find(item => item.editable === true)"
          :tooltip-content="
            dataSourceList.find(item => item.editable === true)
              ? $t('config.saveTip')
              : ''
          "
        >
          {{ $t('securityModule.addSource') }}
        </datablau-button>
        <div style="width: 100%; float: left; margin-top: 16px">
          <div
            v-for="(source, index) in dataSourceList"
            :key="source.sourceId"
            style="height: 34px; line-height: 34px; margin-bottom: 8px"
          >
            <label for="">
              <span v-if="!asyncRanger && source.editable" style="color: red">
                *
              </span>
              {{ $t('securityModule.datasource') }}：
            </label>
            <datablau-select
              v-if="!asyncRanger && source.editable"
              v-model="source.modelId"
              style="display: inline-block; width: 150px"
            >
              <el-option
                v-for="option in dataSourceOptions"
                :key="option.modelId"
                :label="option.definition"
                :value="option.modelId"
                :disabled="
                  !!dataSourceList.find(item => item.modelId == option.modelId)
                "
              ></el-option>
            </datablau-select>
            <span v-else>{{ source.definition }}</span>
            <label for="" style="margin-left: 16px">
              <span v-if="!asyncRanger && source.editable" style="color: red">
                *
              </span>
              service name：
            </label>
            <datablau-input
              v-if="source.editable"
              v-model="source.serviceName"
              :placeholder="$t('config.inputService')"
            ></datablau-input>
            <span v-else>{{ source.serviceName }}</span>
            <datablau-button
              v-if="!source.editable && !asyncRanger"
              type="text"
              @click="toEditSource(source, index)"
              style="margin-left: 8px"
            >
              {{ $t('securityModule.edit') }}
            </datablau-button>
            <datablau-button
              v-if="source.editable && !asyncRanger"
              type="text"
              @click="toSaveSource(source, index)"
              style="margin-left: 8px"
            >
              {{ $t('securityModule.sure') }}
            </datablau-button>
            <datablau-button
              v-if="source.editable && !asyncRanger"
              type="text"
              @click="toCancelSource(source, index)"
              style="margin-left: 8px"
            >
              {{ $t('securityModule.cancel') }}
            </datablau-button>
            <datablau-button
              v-if="!source.editable && !asyncRanger"
              type="text"
              @click="toDeleteSource(source, index)"
            >
              {{ $t('securityModule.delete') }}
            </datablau-button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import setting from './index.js'

export default setting
</script>

<style lang="scss" scoped>
.setting-cont {
  background: #fff;
  height: 100%;
  padding: 0 20px;

  /deep/.el-tabs__content {
    height: 16px;
    overflow: hidden;
  }
  .title {
    height: 44px;
    line-height: 44px;
    font-weight: 600;
    font-size: 16px;
    color: #555;
  }
  .tile {
    height: 44px;
    line-height: 44px;
  }
}
</style>
<style lang="scss">
.setting-cont-tab {
  .el-tabs__content {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 20px;
    right: 20px;
    margin-top: 34px;
  }
}
</style>
