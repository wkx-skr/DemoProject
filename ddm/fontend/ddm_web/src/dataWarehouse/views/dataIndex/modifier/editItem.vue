<template>
  <div style="padding: 0 20px">
    <standard-selector
      :categoryTypeId="1"
      :hideFilter="true"
      :single="true"
    ></standard-selector>
    <div class="row-header">
      <datablau-breadcrumb
        @back="back"
        :node-data="nodeData"
        separator="/"
      ></datablau-breadcrumb>
    </div>
    <datablau-form-submit
      v-if="editMode"
      style="position: absolute; top: 50px; left: 0; right: 0; bottom: 0"
    >
      <div style="padding: 10px 20px">
        <datablau-form
          v-if="udpLoadedReady"
          class="page-form multiple-column"
          label-position="right"
          label-width="180px"
          :rules="formRules"
          ref="form"
          :model="formData"
        >
          <div class="descriptionMessage-title">
            <p class="message-title">{{ $t('domain.domain.baseInfo') }}</p>
          </div>
          <div>
            <el-form-item
              :label="$t('system.systemSetting.dir')"
              prop="catalogId"
            >
              <datablau-cascader
                expand-trigger="click"
                :options="options ? options : []"
                :props="defaultProps2"
                :change-on-select="true"
                :emit-path="false"
                ref="cascader"
                v-model="formData.catalogId"
              ></datablau-cascader>
            </el-form-item>
            <el-form-item
              label="来源标准"
              prop="sourceDomainId"
              v-if="modifierCategory === ModifierCategory.BASE"
            >
              <datablau-input
                v-model="sourceDomainName"
                @click.native="selectDomain"
                readonly
              ></datablau-input>
              <datablau-button
                @click="selectDomain"
                style="position: relative; right: 64px"
              >
                选择
              </datablau-button>
            </el-form-item>
            <el-form-item :label="Label.name" prop="name">
              <datablau-input
                v-model="formData.name"
                maxlength="100"
                class="maxlengthInput"
                show-word-limit
              ></datablau-input>
            </el-form-item>
            <el-form-item :label="Label.code" prop="code">
              <datablau-input
                v-model="formData.code"
                maxlength="100"
                class="maxlengthInput"
                show-word-limit
              ></datablau-input>
            </el-form-item>
            <el-form-item label="英文名称" prop="englishName">
              <datablau-input
                v-model="formData.englishName"
                maxlength="100"
                class="maxlengthInput"
                show-word-limit
              ></datablau-input>
            </el-form-item>
            <el-form-item label="英文简称" prop="abbrName">
              <datablau-input
                v-model="formData.abbrName"
                maxlength="100"
                class="maxlengthInput"
                show-word-limit
              ></datablau-input>
            </el-form-item>
            <el-form-item label="业务定义" prop="businessDefinition">
              <datablau-input
                v-model="formData.businessDefinition"
                type="textarea"
                maxlength="500"
                class="maxlengthInput"
                show-word-limit
              ></datablau-input>
            </el-form-item>
            <el-form-item
              :label="udp.name"
              v-for="(udp, index) in udps"
              :key="index"
            >
              <datablau-input
                type="textarea"
                :autosize="{ minRows: 2 }"
                v-model="formData.udps[udp.id]"
                placeholder="请输入该属性"
              ></datablau-input>
            </el-form-item>
            <el-form-item :label="Label.valueName">
              <!--              {{ formData.modifierValues }}-->
              <modifier-value
                :data-list="formData.modifierValues"
                :modifier-category="modifierCategory"
                :current-item="currentItem"
                v-if="modifierValuesReady"
              ></modifier-value>
            </el-form-item>
          </div>
        </datablau-form>
      </div>
      <div slot="buttons" class="page-btn-group left-bottom" style="margin: 0">
        <datablau-button
          type="important"
          @click="onSubmit(true)"
          :disabled="submitLoading"
        >
          {{ $t('domain.common.submit') }}
        </datablau-button>
        <datablau-button type="secondary" @click="back">
          {{ $t('common.button.cancel') }}
        </datablau-button>
      </div>
    </datablau-form-submit>
  </div>
</template>
<script>
import EditItem from './editItem.js'
export default EditItem
</script>
<style lang="scss" scoped>
@import '~@/next/components/basic/color.sass';
.row-header {
  padding: 10px 0 8px;
  border-bottom: 1px solid $border-color;
}
.part-title {
  border-left: 4px solid $primary-color;
  margin-bottom: 20px;
  margin-top: 8px;
  padding-left: 6px;
  color: $text-default;
  font-size: 14px;
}
</style>
