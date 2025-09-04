<template>
  <div class="setting-cont">
    <div class="title">编码自动生成</div>
    <div class="ul">
      <datablau-detail-subtitle
        class="tile"
        mt="0"
        title="信息项编码自动生成"
      ></datablau-detail-subtitle>
      <!-- <div class="db-fieldMessage-title" style="margin-bottom: 16px">
        <p class="message-title">信息项编码自动生成</p>
      </div> -->
      <datablau-form
        :model="formData"
        ref="formData"
        :label-width="'180px'"
        :rules="rules"
        :disabled="disabled"
      >
        <el-form-item label="自动生成">
          <datablau-switch
            v-model="formData.autoIncState"
            active-text="开启"
            inactive-text="关闭"
            type="innerText"
          ></datablau-switch>
        </el-form-item>
        <el-form-item label="固定前缀">
          <datablau-input
            v-model="formData.prefix"
            @input="resetStartValue"
            :placeholder="$t('common.placeholder.prefix')"
            clearable
            style="width: 500px"
          ></datablau-input>
        </el-form-item>
        <div>
          <el-form-item
            label="数据部分位数"
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
              :placeholder="$t('common.placeholder.prefix')"
              clearable
              style="width: 100px"
            ></datablau-input>
          </el-form-item>
          <el-form-item
            label-width="100px"
            label="起始值"
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
              :placeholder="$t('common.placeholder.prefix')"
              clearable
              style="width: 100px"
            ></datablau-input>
          </el-form-item>
          <el-form-item
            label-width="100px"
            label="自增量"
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
              :placeholder="$t('common.placeholder.prefix')"
              clearable
              style="width: 100px"
            ></datablau-input>
          </el-form-item>
        </div>
        <el-form-item label="下次生成编码样例" v-if="disabled">
          <p>
            {{
              (formData.prefix ? formData.prefix : '') +
              fillZero(formData.nextVal, formData.digitPart) +
              (formData.suffix ? formData.suffix : '')
            }}
          </p>
        </el-form-item>
        <el-form-item label="固定后缀">
          <datablau-input
            v-model.number="formData.suffix"
            @input="resetStartValue"
            :placeholder="$t('common.placeholder.prefix')"
            clearable
            style="width: 500px"
          ></datablau-input>
        </el-form-item>
        <el-form-item>
          <datablau-button type="normal" @click="edit" v-if="disabled">
            {{ $t('common.button.modify') }}
          </datablau-button>
          <datablau-button type="normal" @click="saveFormData" v-if="!disabled">
            {{ $t('common.button.save') }}
          </datablau-button>
          <datablau-button type="normal" @click="closeSave" v-if="!disabled">
            {{ $t('common.button.cancel') }}
          </datablau-button>
        </el-form-item>
      </datablau-form>
    </div>
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
