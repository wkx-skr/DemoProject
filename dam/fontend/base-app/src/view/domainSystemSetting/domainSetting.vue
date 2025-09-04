<template>
  <div class="domainSetting-cont">
    <datablau-tabs
      v-model="activeName"
      @tab-click="handleClick"
      class="domainSetting-cont-tab"
    >
      <el-tab-pane
        :label="$t('domain.codeAutoCreate.codeAutoCreate')"
        name="autocode"
      >
        <div class="ul">
          <div class="db-fieldMessage-title" style="margin-bottom: 16px">
            <p class="message-title">
              {{ $t('domain.codeAutoCreate.baseDomainCodeAutoCreate') }}
            </p>
          </div>
          <datablau-form
            :model="formDataStandard"
            ref="formDataStandard"
            :label-width="'180px'"
            :rules="rulesDataStandard"
            :disabled="disabledDataStandard"
          >
            <el-form-item :label="$t('domain.codeAutoCreate.autoCreate')">
              <datablau-switch
                v-model="formDataStandard.autoIncState"
                :active-text="$t('domain.common.open')"
                :inactive-text="$t('domain.common.close')"
                type="innerText"
              ></datablau-switch>
            </el-form-item>
            <el-form-item :label="$t('domain.codeAutoCreate.fixPre')">
              <datablau-input
                v-model="formDataStandard.prefix"
                :placeholder="$t('common.placeholder.prefix')"
                clearable
                style="width: 500px"
              ></datablau-input>
            </el-form-item>
            <div>
              <el-form-item
                :label="$t('domain.codeAutoCreate.partData')"
                prop="digitPart"
                style="display: inline-block"
              >
                <datablau-input
                  v-model.number="formDataStandard.digitPart"
                  @input="
                    val => {
                      handleEdit(val, 'digitPartStandard')
                    }
                  "
                  :placeholder="$t('common.placeholder.prefix')"
                  clearable
                  style="width: 100px"
                ></datablau-input>
              </el-form-item>
              <el-form-item
                :label-width="$i18n.locale === 'en' ? '300px' : '100px'"
                :label="$t('domain.codeAutoCreate.startValue')"
                prop="startVal"
                style="display: inline-block"
              >
                <datablau-input
                  v-model.number="formDataStandard.startVal"
                  @input="
                    val => {
                      handleEdit(val, 'startValStandard')
                    }
                  "
                  :placeholder="$t('common.placeholder.prefix')"
                  clearable
                  style="width: 100px"
                ></datablau-input>
              </el-form-item>
              <el-form-item
                :label-width="$i18n.locale === 'en' ? '200px' : '100px'"
                :label="$t('domain.codeAutoCreate.autoIncrement')"
                prop="incStepSize"
                style="display: inline-block"
              >
                <datablau-input
                  v-model.number="formDataStandard.incStepSize"
                  @input="
                    val => {
                      handleEdit(val, 'incStepSizeStandard')
                    }
                  "
                  :placeholder="$t('common.placeholder.prefix')"
                  clearable
                  style="width: 100px"
                ></datablau-input>
              </el-form-item>
            </div>
            <el-form-item
              :label="$t('domain.codeAutoCreate.createCodeDemo')"
              v-if="disabledDataStandard"
            >
              <p>
                {{
                  (formDataStandard.prefix ? formDataStandard.prefix : '') +
                  fillZero(
                    formDataStandard.nextVal,
                    formDataStandard.digitPart
                  ) +
                  (formDataStandard.suffix ? formDataStandard.suffix : '')
                }}
              </p>
            </el-form-item>
            <el-form-item :label="$t('domain.codeAutoCreate.fixSuffix')">
              <datablau-input
                v-model.number="formDataStandard.suffix"
                :placeholder="$t('common.placeholder.prefix')"
                clearable
                style="width: 500px"
              ></datablau-input>
            </el-form-item>
            <el-form-item>
              <datablau-button
                type="normal"
                @click="edit('DataStandard')"
                v-if="disabledDataStandard"
              >
                {{ $t('common.button.edit') }}
              </datablau-button>
              <datablau-button
                type="normal"
                @click="saveFormDataStandard"
                v-if="!disabledDataStandard"
              >
                {{ $t('common.button.save') }}
              </datablau-button>
              <datablau-button
                type="normal"
                @click="closeSave('DataStandard')"
                v-if="!disabledDataStandard"
              >
                {{ $t('common.button.cancel') }}
              </datablau-button>
            </el-form-item>
          </datablau-form>
        </div>
        <div class="ul">
          <div class="db-fieldMessage-title" style="margin-bottom: 16px">
            <p class="message-title">
              {{ $t('domain.codeAutoCreate.codePropCodeAutoCreate') }}
            </p>
          </div>
          <datablau-form
            :model="formDatacode"
            ref="formDatacode"
            :label-width="'180px'"
            :rules="rulesDatacode"
            :disabled="disabledDatacode"
          >
            <el-form-item :label="$t('domain.codeAutoCreate.autoCreate')">
              <datablau-switch
                v-model="formDatacode.autoIncState"
                :active-text="$t('domain.common.open')"
                :inactive-text="$t('domain.common.close')"
                type="innerText"
              ></datablau-switch>
            </el-form-item>

            <el-form-item :label="$t('domain.codeAutoCreate.fixPre')">
              <datablau-input
                v-model="formDatacode.prefix"
                :placeholder="$t('common.placeholder.prefix')"
                clearable
                style="width: 500px"
              ></datablau-input>
            </el-form-item>
            <div>
              <el-form-item
                :label="$t('domain.codeAutoCreate.partData')"
                prop="digitPart"
                style="display: inline-block"
              >
                <datablau-input
                  v-model.number="formDatacode.digitPart"
                  @input="
                    val => {
                      handleEdit(val, 'digitPartCode')
                    }
                  "
                  :placeholder="$t('common.placeholder.prefix')"
                  clearable
                  style="width: 100px"
                ></datablau-input>
              </el-form-item>
              <el-form-item
                :label-width="$i18n.locale === 'en' ? '300px' : '100px'"
                :label="$t('domain.codeAutoCreate.startValue')"
                prop="startVal"
                style="display: inline-block"
              >
                <datablau-input
                  v-model.number="formDatacode.startVal"
                  @input="
                    val => {
                      handleEdit(val, 'startValCode')
                    }
                  "
                  :placeholder="$t('common.placeholder.prefix')"
                  clearable
                  style="width: 100px"
                ></datablau-input>
              </el-form-item>
              <el-form-item
                :label-width="$i18n.locale === 'en' ? '200px' : '100px'"
                :label="$t('domain.codeAutoCreate.autoIncrement')"
                prop="incStepSize"
                style="display: inline-block"
              >
                <datablau-input
                  v-model.number="formDatacode.incStepSize"
                  @input="
                    val => {
                      handleEdit(val, 'incStepSizeCode')
                    }
                  "
                  :placeholder="$t('common.placeholder.prefix')"
                  clearable
                  style="width: 100px"
                ></datablau-input>
              </el-form-item>
            </div>
            <el-form-item
              :label="$t('domain.codeAutoCreate.createCodeDemo')"
              v-if="disabledDatacode"
            >
              <p>
                {{
                  (formDatacode.prefix ? formDatacode.prefix : '') +
                  fillZero(formDatacode.nextVal, formDatacode.digitPart) +
                  (formDatacode.suffix ? formDatacode.suffix : '')
                }}
              </p>
            </el-form-item>
            <el-form-item :label="$t('domain.codeAutoCreate.fixSuffix')">
              <datablau-input
                v-model="formDatacode.suffix"
                :placeholder="$t('common.placeholder.prefix')"
                clearable
                style="width: 500px"
              ></datablau-input>
            </el-form-item>
            <el-form-item>
              <datablau-button
                type="normal"
                @click="edit('Datacode')"
                v-if="disabledDatacode"
              >
                {{ $t('common.button.edit') }}
              </datablau-button>
              <datablau-button
                type="normal"
                @click="saveFormDatacode"
                v-if="!disabledDatacode"
              >
                {{ $t('common.button.save') }}
              </datablau-button>
              <datablau-button
                type="normal"
                @click="closeSave('Datacode')"
                v-if="!disabledDatacode"
              >
                {{ $t('common.button.cancel') }}
              </datablau-button>
            </el-form-item>
          </datablau-form>
        </div>
        <div class="ul">
          <div class="db-fieldMessage-title" style="margin-bottom: 16px">
            <p class="message-title">
              {{ $t('domain.codeAutoCreate.domainStandardCodeAutoCreate') }}
            </p>
          </div>
          <datablau-form
            :model="formDomainStandard"
            ref="formDomainStandard"
            :label-width="'180px'"
            :rules="rulesDomainStandard"
            :disabled="disabledDomainStandard"
          >
            <el-form-item :label="$t('domain.codeAutoCreate.autoCreate')">
              <datablau-switch
                v-model="formDomainStandard.autoIncState"
                :active-text="$t('domain.common.open')"
                :inactive-text="$t('domain.common.close')"
                type="innerText"
              ></datablau-switch>
            </el-form-item>
            <el-form-item :label="$t('domain.codeAutoCreate.fixPre')">
              <datablau-input
                v-model="formDomainStandard.prefix"
                :placeholder="$t('common.placeholder.prefix')"
                clearable
                style="width: 500px"
              ></datablau-input>
            </el-form-item>
            <div>
              <el-form-item
                :label="$t('domain.codeAutoCreate.partData')"
                prop="digitPart"
                style="display: inline-block"
              >
                <datablau-input
                  v-model.number="formDomainStandard.digitPart"
                  @input="
                    val => {
                      handleEdit(val, 'digitPartDomain')
                    }
                  "
                  :placeholder="$t('common.placeholder.prefix')"
                  clearable
                  style="width: 100px"
                ></datablau-input>
              </el-form-item>
              <el-form-item
                :label-width="$i18n.locale === 'en' ? '300px' : '100px'"
                :label="$t('domain.codeAutoCreate.startValue')"
                prop="startVal"
                style="display: inline-block"
              >
                <datablau-input
                  v-model.number="formDomainStandard.startVal"
                  @input="
                    val => {
                      handleEdit(val, 'startValDomain')
                    }
                  "
                  :placeholder="$t('common.placeholder.prefix')"
                  clearable
                  style="width: 100px"
                ></datablau-input>
              </el-form-item>
              <el-form-item
                :label-width="$i18n.locale === 'en' ? '200px' : '100px'"
                :label="$t('domain.codeAutoCreate.autoIncrement')"
                prop="incStepSize"
                style="display: inline-block"
              >
                <datablau-input
                  v-model.number="formDomainStandard.incStepSize"
                  @input="
                    val => {
                      handleEdit(val, 'incStepSizeDomain')
                    }
                  "
                  :placeholder="$t('common.placeholder.prefix')"
                  clearable
                  style="width: 100px"
                ></datablau-input>
              </el-form-item>
            </div>
            <el-form-item
              :label="$t('domain.codeAutoCreate.createCodeDemo')"
              v-if="disabledDomainStandard"
            >
              <p>
                {{
                  (formDomainStandard.prefix ? formDomainStandard.prefix : '') +
                  fillZero(
                    formDomainStandard.nextVal,
                    formDomainStandard.digitPart
                  ) +
                  (formDomainStandard.suffix ? formDomainStandard.suffix : '')
                }}
              </p>
            </el-form-item>
            <el-form-item :label="$t('domain.codeAutoCreate.fixSuffix')">
              <datablau-input
                v-model="formDomainStandard.suffix"
                :placeholder="$t('common.placeholder.prefix')"
                clearable
                style="width: 500px"
              ></datablau-input>
            </el-form-item>
            <el-form-item>
              <datablau-button
                type="normal"
                @click="edit('DomainStandard')"
                v-if="disabledDomainStandard"
              >
                {{ $t('common.button.edit') }}
              </datablau-button>
              <datablau-button
                type="normal"
                @click="saveFormDomainStandard"
                v-if="!disabledDomainStandard"
              >
                {{ $t('common.button.save') }}
              </datablau-button>
              <datablau-button
                type="normal"
                @click="closeSave('DomainStandard')"
                v-if="!disabledDomainStandard"
              >
                {{ $t('common.button.cancel') }}
              </datablau-button>
            </el-form-item>
          </datablau-form>
        </div>
        <div class="ul">
          <div class="db-fieldMessage-title" style="margin-bottom: 16px">
            <p class="message-title">
              {{ $t('domain.codeAutoCreate.indexCodeAutoCreate') }}
            </p>
          </div>
          <datablau-form
            :model="formIndex"
            ref="formIndex"
            :label-width="'180px'"
            :rules="rulesIndex"
            :disabled="disabledIndex"
          >
            <el-form-item :label="$t('domain.codeAutoCreate.autoCreate')">
              <datablau-switch
                v-model="formIndex.autoIncState"
                :active-text="$t('domain.common.open')"
                :inactive-text="$t('domain.common.close')"
                type="innerText"
              ></datablau-switch>
            </el-form-item>
            <el-form-item :label="$t('domain.codeAutoCreate.fixPre')">
              <datablau-input
                v-model="formIndex.prefix"
                :placeholder="$t('common.placeholder.prefix')"
                clearable
                style="width: 500px"
              ></datablau-input>
            </el-form-item>
            <div>
              <el-form-item
                :label="$t('domain.codeAutoCreate.partData')"
                prop="digitPart"
                style="display: inline-block"
              >
                <datablau-input
                  v-model.number="formIndex.digitPart"
                  @input="
                    val => {
                      handleEdit(val, 'digitPartIndex')
                    }
                  "
                  :placeholder="$t('common.placeholder.prefix')"
                  clearable
                  style="width: 100px"
                ></datablau-input>
              </el-form-item>
              <el-form-item
                :label-width="$i18n.locale === 'en' ? '300px' : '100px'"
                :label="$t('domain.codeAutoCreate.startValue')"
                prop="startVal"
                style="display: inline-block"
              >
                <datablau-input
                  v-model.number="formIndex.startVal"
                  @input="
                    val => {
                      handleEdit(val, 'startValIndex')
                    }
                  "
                  :placeholder="$t('common.placeholder.prefix')"
                  clearable
                  style="width: 100px"
                ></datablau-input>
              </el-form-item>
              <el-form-item
                :label-width="$i18n.locale === 'en' ? '200px' : '100px'"
                :label="$t('domain.codeAutoCreate.autoIncrement')"
                prop="incStepSize"
                style="display: inline-block"
              >
                <datablau-input
                  v-model.number="formIndex.incStepSize"
                  @input="
                    val => {
                      handleEdit(val, 'incStepSizeIndex')
                    }
                  "
                  :placeholder="$t('common.placeholder.prefix')"
                  clearable
                  style="width: 100px"
                ></datablau-input>
              </el-form-item>
            </div>
            <el-form-item
              :label="$t('domain.codeAutoCreate.createCodeDemo')"
              v-if="disabledIndex"
            >
              <p>
                {{
                  (formIndex.prefix ? formIndex.prefix : '') +
                  fillZero(formIndex.nextVal, formIndex.digitPart) +
                  (formIndex.suffix ? formIndex.suffix : '')
                }}
              </p>
            </el-form-item>
            <el-form-item :label="$t('domain.codeAutoCreate.fixSuffix')">
              <datablau-input
                v-model="formIndex.suffix"
                :placeholder="$t('common.placeholder.prefix')"
                clearable
                style="width: 500px"
              ></datablau-input>
            </el-form-item>
            <el-form-item>
              <datablau-button
                type="normal"
                @click="edit('Index')"
                v-if="disabledIndex"
              >
                {{ $t('common.button.edit') }}
              </datablau-button>

              <datablau-button
                type="normal"
                @click="saveFormIndex"
                v-if="!disabledIndex"
              >
                {{ $t('common.button.save') }}
              </datablau-button>
              <datablau-button
                type="normal"
                @click="closeSave('Index')"
                v-if="!disabledIndex"
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
import domainSetting from './domainSetting'

export default domainSetting
</script>

<style lang="scss" scoped>
.domainSetting-cont {
  background: #fff;
  height: 100%;
  padding: 0 20px;
}
</style>
<style lang="scss">
.domainSetting-cont-tab {
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
