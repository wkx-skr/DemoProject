<template>
  <div class="setting-cont">
    <datablau-tabs v-model="activeName" class="setting-cont-tab">
      <el-tab-pane label="编码自动生成" name="autocode">
        <div class="ul">
          <div class="db-fieldMessage-title" style="margin-bottom: 16px">
            <p class="message-title">信息项编码自动生成</p>
          </div>
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
                :placeholder="$t('common.placeholder.prefix')"
                clearable
                style="width: 500px"
              ></datablau-input>
            </el-form-item>
            <el-form-item>
              <datablau-button type="normal" @click="edit" v-if="disabled">
                {{ $t('common.button.modify') }}
              </datablau-button>
              <datablau-button
                type="normal"
                @click="saveFormData"
                v-if="!disabled"
              >
                {{ $t('common.button.save') }}
              </datablau-button>
              <datablau-button
                type="normal"
                @click="closeSave"
                v-if="!disabled"
              >
                {{ $t('common.button.cancel') }}
              </datablau-button>
            </el-form-item>
          </datablau-form>
        </div>
      </el-tab-pane>
    </datablau-tabs>
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
