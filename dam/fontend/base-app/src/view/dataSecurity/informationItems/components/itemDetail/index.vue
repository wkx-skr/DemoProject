<template>
  <div id="standard-detail" class="domain-detail-component">
    <datablau-form-submit style="margin-top: 20px">
      <datablau-form
        :inline-message="false"
        label-position="right"
        :label-width="'100px'"
        size="small"
        ref="itemForm"
        :rules="editable ? itemRules : {}"
        :model="itemDetails"
      >
        <el-form-item label="信息项名称" prop="name">
          <template v-if="itemEditable">
            <datablau-input
              v-model="itemDetails.name"
              placeholder="请输入中文名称"
            ></datablau-input>
          </template>
          <template v-else>
            <span>{{ itemDetails.name }}</span>
          </template>
        </el-form-item>
        <el-form-item label="信息项编码" prop="stdCode">
          <template v-if="itemEditable">
            <datablau-input
              v-model="itemDetails.stdCode"
              placeholder="请输入信息项编码，该项是信息项的唯一标识"
              :disabled="!!itemDetails.id || autoCodeSelect"
              @blur="checkItemCodeIsExist()"
              :disabledGrey="!!itemDetails.id || autoCodeSelect"
              :style="{ width: !itemDetails.id ? '412px' : '500px' }"
            ></datablau-input>
            <datablau-checkbox
              v-if="!itemDetails.id"
              :checkboxType="'single'"
              v-model="autoCodeSelect"
              @change="autoCodeChange"
              :disabled="!autoCode"
              style="display: inline-block; margin-left: 10px"
            >
              自动生成
            </datablau-checkbox>
          </template>
          <template v-else>
            <span>{{ itemDetails.stdCode }}</span>
          </template>
        </el-form-item>
        <el-form-item label="英文名称" prop="englishName">
          <template v-if="itemEditable">
            <datablau-input
              v-model="itemDetails.englishName"
              placeholder="请输入英文名称"
            ></datablau-input>
          </template>
          <template v-else>
            <span>{{ itemDetails.englishName }}</span>
          </template>
        </el-form-item>
        <el-form-item label="选择目录" prop="catalog">
          <template v-if="itemEditable">
            <el-cascader
              :placeholder="
                itemDetails.catalog ? itemDetails.catalogPathName : '请选择目录'
              "
              size="mini"
              expand-trigger="click"
              :options="itemCatalogOptions ? itemCatalogOptions : []"
              :change-on-select="true"
              v-model="itemDetails.catalog"
              :props="cascaderProps"
              style="width: 500px"
            ></el-cascader>
          </template>
          <template v-else>
            <span>
              {{ itemDetails.catalog && itemDetails.catalog.join('/') }}
            </span>
          </template>
        </el-form-item>
        <el-form-item label="业务定义" prop="businessDepartment">
          <template v-if="itemEditable">
            <datablau-input
              type="textarea"
              v-model="itemDetails.businessDepartment"
              placeholder="请输入业务定义"
              style="width: 500px"
            ></datablau-input>
          </template>
          <template v-else>
            <span>{{ itemDetails.businessDepartment }}</span>
          </template>
        </el-form-item>
        <el-form-item
          :label="udp.name"
          v-for="(udp, index) in udps"
          :key="index"
          :prop="udp.udpId + ''"
        >
          <datablau-input
            v-if="udp.dataType === 'String'"
            type="textarea"
            :autosize="{ minRows: 2 }"
            v-model="additionalPropertiesObj[udp.udpId]"
            :placeholder="$version.domain.placeholder.property"
          ></datablau-input>
          <datablau-select
            v-if="Array.isArray(udp.candidates) && udp.dataType === 'List'"
            v-model="additionalPropertiesObj[udp.udpId]"
            :placeholder="$version.domain.placeholder.property"
          >
            <el-option
              v-for="item in udp.candidates"
              :key="item"
              :label="item"
              :value="item"
            ></el-option>
          </datablau-select>
        </el-form-item>
      </datablau-form>
      <div slot="buttons">
        <datablau-button type="secondary" size="mini" @click="cancelItem">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button
          v-if="itemEditable"
          type="primary"
          size="mini"
          @click="submitItem"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
      </div>
    </datablau-form-submit>
  </div>
</template>

<script>
import itemDetail from './index.js'
export default itemDetail
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
<style lang="scss">
.el-input.parent-code.is-disabled
  input.el-input__inner::-webkit-input-placeholder {
  /* WebKit browsers */
  visibility: visible;
}
</style>
