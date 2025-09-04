<template>
  <div id="standard-detail" class="domain-detail-component">
    <el-dialog
      :title="$t('domain.domain.addDim')"
      width="400px"
      :visible.sync="showChooseDims"
      :append-to-body="true"
    >
      <div class="row-inner">
        <div class="search-container">
          <el-input
            size="small"
            :placeholder="$t('domain.common.queryPlaceholder')"
            v-model="dimsKeyword"
            :clearable="true"
          ></el-input>
        </div>
      </div>
      <el-table
        class="plain-table choose-dims"
        ref="chooseDimsTable"
        show-overflow-tooltip
        :data="allDimsShow"
        :stripe="true"
        height="400"
        border
      >
        <el-table-column width="20" class-name="empty-column"></el-table-column>
        <el-table-column
          :label="$t('domain.domain.dimension')"
          prop="name"
          column-key="name"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :label="$t('domain.common.operation')"
          ref="check"
          header-align="right"
          align="right"
          v-if="showOperation"
        >
          <template slot-scope="scope">
            <span>
              <el-button
                type="text"
                size="small"
                @click="handleAddDim(scope.row)"
              >
                {{ $t('domain.common.add') }}
              </el-button>
            </span>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <code-select></code-select>
    <standard-selector
      :categoryTypeId="categoryTypeId"
      :hideFilter="true"
      :single="true"
    ></standard-selector>
    <datablau-form-submit>
      <div class="form-group-outer">
        <el-collapse
          style="border-top: none; padding: 0 20px; margin: 0"
          :key="collaseKey"
          v-model="activeCollapse"
          :accordion="false"
        >
          <div
            v-if="$route.path.includes('dataStandard') && false"
            class="header"
          >
            <div style="display: inline-block" class="navigator">
              <span class="d-return icon-i-return" @click="exit(!domainId)">
                {{ $t('common.button.return') }}
              </span>
            </div>
            <h2 v-if="domainId" style="position: relative; top: 2px">
              <!-- {{detail.chineseName}}&nbsp; -->
              {{ $t('domain.domain.editDomain') }}
            </h2>
            <h2 v-if="!domainId">{{ $t('domain.domain.createDomain') }}</h2>
          </div>
          <datablau-form
            :inline-message="false"
            class="page-form thin-textarea standard-page"
            :class="{ disabled: !writable || !partWritable[0] }"
            label-position="right"
            :label-width="'180px'"
            size="small"
            ref="form0"
            :disabled="!writable || !partWritable[0]"
            :rules="writable && partWritable[0] ? rules : {}"
            :model="detail"
            :key="formKey"
          >
            <el-collapse-item name="0">
              <template slot="title">
                <div class="collapse-title">
                  <h2>{{ $t('domain.domain.baseInfo') }}</h2>
                  <i
                    @click="enableEdit(0, $event)"
                    class="el-icon-edit"
                    v-if="writable && !partWritable[0]"
                  ></i>
                </div>
              </template>
              <!--:rules="{ required: true }"-->

              <el-form-item
                :label="$version.domain.property.selectTheme"
                prop="selectedOptions2"
              >
                <el-cascader
                  size="mini"
                  expand-trigger="click"
                  :options="options ? options : []"
                  :props="defaultProps3"
                  :change-on-select="true"
                  v-model="selectedOptions2"
                  ref="pathSelector"
                ></el-cascader>
              </el-form-item>
              <el-form-item
                :label="$t('domain.domainStandard.parentDomain')"
                prop="parentDomainId"
                v-if="contentStatus === 'addField'"
              >
                {{ data.chineseName }}
              </el-form-item>
              <el-form-item
                :label="$t('domain.domainStandard.parentDomain')"
                prop="parentDomainId"
                v-if="contentStatus === 'add' || contentStatus === 'write'"
              >
                <datablau-select
                  class="selectTree"
                  style="width: 600px"
                  ref="selectTree"
                  :popper-append-to-body="false"
                  popper-class="select-tree"
                  v-model="treeData.chineseName"
                  :placeholder="
                    $t('domain.common.selectionPlaceholder', {
                      name: $t('domain.domainStandard.parentDomain'),
                    })
                  "
                  clearable
                  :filterable="true"
                  :remote="true"
                  :remote-method="remoteMethod"
                  :disabled="domainId ? true : false"
                >
                  <el-option
                    :value="treeData.parentDomainId"
                    style="height: auto"
                    :label="treeData.chineseName"
                  >
                    <div class="tree">
                      <datablau-tree
                        :data="domainInheritTree"
                        node-key="domainId"
                        ref="branchTree"
                        class="grey-tree branchTree"
                        :default-expanded-keys="defaultExpandList"
                        :expand-on-click-node="false"
                        :filter-node-method="filterNode2"
                        @node-click="nodeClick"
                        :props="defaultProps2"
                        :data-icon-function="dataIconFunction2"
                      >
                        <span
                          slot-scope="{ data }"
                          :title="data[defaultProps2.label]"
                          class="ellipsis"
                        >
                          {{ data[defaultProps2.label] }}
                        </span>
                      </datablau-tree>
                    </div>
                  </el-option>
                </datablau-select>
              </el-form-item>
              <el-form-item
                :label="$t('domain.domainStandard.domainCode')"
                prop="domainCode"
              >
                <datablau-input
                  v-model="detail.domainCode"
                  :placeholder="
                    $t('domain.domainStandard.domainCodePlaceholder')
                  "
                  :disabled="
                    (!!domainId &&
                      !isDerive &&
                      !(contentStatus === 'addField')) ||
                    autoCode
                  "
                  :disabledGrey="
                    (!!domainId &&
                      !isDerive &&
                      !(contentStatus === 'addField')) ||
                    autoCode
                  "
                  @blur="checkDomainCodeIsExist()"
                ></datablau-input>
                <datablau-checkbox
                  v-if="!domainId && useDam"
                  :checkboxType="'single'"
                  v-model="autoCode"
                  @change="autoCodeChange"
                  :disabled="!autoCodeDisabled"
                  style="display: inline-block; margin-left: 10px"
                >
                  {{ $t('domain.domain.autoCreate') }}
                </datablau-checkbox>
              </el-form-item>
              <el-form-item
                :label="$version.domain.property.domainChName"
                prop="chineseName"
              >
                <datablau-input
                  v-model="detail.chineseName"
                  :placeholder="
                    $version.common.pleaseInput +
                    $version.domain.property.domainChName
                  "
                ></datablau-input>
              </el-form-item>
              <el-form-item
                :label="$version.domain.property.domainEnName"
                prop="englishName"
              >
                <datablau-input
                  v-model="detail.englishName"
                  :placeholder="
                    $version.common.pleaseInput +
                    $version.domain.property.domainEnName
                  "
                ></datablau-input>
              </el-form-item>
              <el-form-item
                :label="$version.domain.property.domainAbbr"
                prop="abbreviation"
                style="margin-bottom: 20px"
              >
                <datablau-input
                  v-model="detail.abbreviation"
                  :placeholder="
                    $version.common.pleaseInput +
                    $version.domain.property.domainAbbr
                  "
                ></datablau-input>
              </el-form-item>
              <el-form-item
                :label="$t('domain.domainStandard.domainDefine')"
                prop="description"
              >
                <datablau-input
                  type="textarea"
                  :autosize="{ minRows: 2 }"
                  v-model="detail.description"
                  :placeholder="
                    $t('domain.common.inputPlaceholder', {
                      name: $t('domain.domainStandard.domainDefine'),
                    })
                  "
                ></datablau-input>
              </el-form-item>
              <el-form-item
                label=""
                label-width="0"
                v-for="(udp, index) in udps.filter(
                  e => e.catalog === $t('domain.domain.standardProp')
                )"
                :key="index"
                :prop="udp.udpId + ''"
                class="udp-form-item"
              >
                <udp-form-label
                  :content="`${udp.name}`"
                  :strWidth="180"
                  :showModel="false"
                  :showRequired="!!udp.required"
                ></udp-form-label>
                <datablau-input
                  v-if="udp.dataType === 'String'"
                  type="textarea"
                  :autosize="{ minRows: 2 }"
                  v-model="additionalPropertiesObj[udp.udpId]"
                  :placeholder="$version.domain.placeholder.property"
                ></datablau-input>
                <datablau-select
                  v-if="
                    Array.isArray(udp.candidates) && udp.dataType === 'List'
                  "
                  v-model="additionalPropertiesObj[udp.udpId]"
                  :placeholder="$version.domain.placeholder.property"
                  style="display: inline-block;"
                >
                  <el-option
                    v-for="item in udp.candidates"
                    :key="item"
                    :label="item"
                    :value="item"
                  ></el-option>
                </datablau-select>
              </el-form-item>
            </el-collapse-item>
          </datablau-form>

          <!-- :label-width="!writable || !partWritable[2] ? '120px' : '135px'" -->
          <datablau-form
            :inline-message="true"
            class="page-form thin-textarea standard-page"
            :class="{ disabled: !writable || !partWritable[2] }"
            label-position="right"
            :label-width="'180px'"
            size="small"
            ref="form2"
            :disabled="!writable || !partWritable[2]"
            :rules="writable && partWritable[2] ? rules : {}"
            :model="detail"
            v-if="
              udps.filter(e => e.catalog === $t('domain.domain.businessProp'))
                .length !== 0
            "
          >
            <el-collapse-item name="2">
              <template slot="title">
                <div class="collapse-title">
                  <h2>{{ $version.domain.propertyType.business }}</h2>
                  <i
                    class="el-icon-edit"
                    @click="enableEdit(2, $event)"
                    v-if="writable && !partWritable[2]"
                  ></i>
                </div>
              </template>

              <el-form-item
                label=""
                label-width="0"
                v-for="(udp, index) in udps.filter(
                  e => e.catalog === $t('domain.domain.businessProp')
                )"
                :key="index"
                :prop="
                  udp.name === $t('domain.domain.dataQualityRules')
                    ? 'busRule'
                    : udp.udpId + ''
                "
                class="udp-form-item"
              >
                <udp-form-label
                  :content="`${udp.name}`"
                  :strWidth="180"
                  :showModel="false"
                  :showRequired="!!udp.required"
                ></udp-form-label>
                <datablau-input
                  v-if="udp.dataType === 'String'"
                  type="textarea"
                  :autosize="{ minRows: 2 }"
                  v-model="additionalPropertiesObj[udp.udpId]"
                  :placeholder="$version.domain.placeholder.property"
                ></datablau-input>
                <datablau-select
                  v-if="
                    Array.isArray(udp.candidates) && udp.dataType === 'List'
                  "
                  v-model="additionalPropertiesObj[udp.udpId]"
                  :placeholder="$version.domain.placeholder.property"
                  style="display: inline-block;"
                >
                  <el-option
                    v-for="item in udp.candidates"
                    :key="item"
                    :label="item"
                    :value="item"
                  ></el-option>
                </datablau-select>
              </el-form-item>
            </el-collapse-item>
          </datablau-form>
          <!-- tech info -->
          <datablau-form
            :inline-message="true"
            class="page-form thin-textarea standard-page"
            :class="{ disabled: !writable || !partWritable[1] }"
            label-position="right"
            :label-width="'180px'"
            size="small"
            ref="form1"
            :disabled="!writable || !partWritable[1]"
            :rules="writable && partWritable[1] ? rules : {}"
            :model="detail"
          >
            <el-collapse-item name="1">
              <template slot="title">
                <div class="collapse-title">
                  <h2>{{ $version.domain.propertyType.technology }}</h2>
                  <i
                    @click="enableEdit(1, $event)"
                    class="el-icon-edit"
                    v-if="writable && !partWritable[1]"
                  ></i>
                </div>
              </template>
              <el-form-item
                :label="$version.domain.property.rangeType"
                prop="rangeType"
              >
                <datablau-select
                  size="mini"
                  clearable
                  class="inline-input"
                  v-model="detail.rangeType"
                  filterable
                  :placeholder="
                    $version.common.pleaseInput +
                    $version.domain.property.rangeType
                  "
                  @change="changeRangeType"
                >
                  <el-option
                    v-for="item in rangeTypeOptions"
                    :key="item.optionValue"
                    :label="item.optionValue"
                    :value="item.optionValue"
                  ></el-option>
                </datablau-select>
              </el-form-item>
              <el-form-item
                :label="$version.domain.property.dataType"
                prop="dataType"
              >
                <datablau-select
                  size="mini"
                  clearable
                  class="inline-input"
                  v-model="detail.dataType"
                  filterable
                  :placeholder="
                    $version.common.pleaseInput +
                    $version.domain.property.dataType
                  "
                >
                  <el-option-group
                    v-for="group in dataTypeFollowRangeType"
                    :key="group.label"
                    :label="group.label"
                  >
                    <el-option
                      v-for="item in group.options"
                      :key="`${group.label}/${item.optionValue}`"
                      :label="item.optionValue"
                      :value="item.optionValue"
                    ></el-option>
                  </el-option-group>
                </datablau-select>
              </el-form-item>
              <div>
                <el-form-item
                  :label="$version.domain.property.dataScale"
                  prop="dataScale"
                  style="display: inline-block"
                >
                  <datablau-input
                    style="width: 200px"
                    v-model="detail.dataScale"
                    maxlength="9"
                    :placeholder="
                      $version.common.pleaseInput +
                      $version.domain.property.dataScale
                    "
                  ></datablau-input>
                </el-form-item>
                <el-form-item
                  style="display: inline-block; padding-left: 40px"
                  :label="$version.domain.property.dataPrecision"
                  prop="dataPrecision"
                  label-width="60px"
                >
                  <datablau-input
                    style="width: 200px"
                    maxlength="9"
                    v-model="detail.dataPrecision"
                    :placeholder="
                      $version.common.pleaseInput +
                      $version.domain.property.dataPrecision
                    "
                  ></datablau-input>
                </el-form-item>
                <el-form-item
                  style="display: inline-block; padding-left: 40px"
                  :label="$version.domain.property.notNull"
                  prop="notNull"
                  :label-width="$i18n.locale === 'en' ? '58px' : '38px'"
                >
                  <el-checkbox v-model="detail.notNull"></el-checkbox>
                </el-form-item>
              </div>
              <el-form-item
                :label="$version.domain.property.dataFormat"
                prop="dataFormat"
              >
                <datablau-input
                  maxlength="200"
                  v-model="detail.dataFormat"
                  :placeholder="
                    $version.common.pleaseInput +
                    $version.domain.property.dataFormat
                  "
                ></datablau-input>
              </el-form-item>

              <el-form-item
                :label="$version.domain.property.referenceCode"
                prop="referenceCode"
                v-if="categoryTypeId !== 2"
              >
                <datablau-input
                  v-model="detail.referenceCode"
                  clearable
                  :placeholder="$t('domain.domain.referenceCodePlaceholder')"
                  @focus="openCodeSelect"
                ></datablau-input>
              </el-form-item>
              <el-form-item
                label=""
                label-width="0"
                v-for="(udp, index) in udps.filter(
                  e => e.catalog === $t('domain.domain.techProp')
                )"
                :key="index"
                :prop="udp.udpId + ''"
                class="udp-form-item"
              >
                <udp-form-label
                  :content="`${udp.name}`"
                  :strWidth="180"
                  :showModel="false"
                  :showRequired="!!udp.required"
                ></udp-form-label>
                <datablau-input
                  v-if="udp.dataType === 'String'"
                  type="textarea"
                  :autosize="{ minRows: 2 }"
                  v-model="additionalPropertiesObj[udp.udpId]"
                  :placeholder="$version.domain.placeholder.property"
                ></datablau-input>
                <datablau-select
                  v-if="
                    Array.isArray(udp.candidates) && udp.dataType === 'List'
                  "
                  v-model="additionalPropertiesObj[udp.udpId]"
                  :placeholder="$version.domain.placeholder.property"
                  style="display: inline-block;"
                >
                  <el-option
                    v-for="item in udp.candidates"
                    :key="item"
                    :label="item"
                    :value="item"
                  ></el-option>
                </datablau-select>
              </el-form-item>
            </el-collapse-item>
          </datablau-form>
          <!-- manage info -->
          <datablau-form
            :inline-message="true"
            class="page-form thin-textarea standard-page"
            :class="{ disabled: !writable || !partWritable[3] }"
            label-position="right"
            :label-width="'180px'"
            size="small"
            ref="form3"
            :disabled="!writable || !partWritable[3]"
            :rules="writable && partWritable[3] ? rules : {}"
            :model="detail"
          >
            <el-collapse-item name="3">
              <template slot="title">
                <div class="collapse-title">
                  <h2>{{ $version.domain.propertyType.management }}</h2>
                  <i
                    class="el-icon-edit"
                    @click="enableEdit(3, $event)"
                    v-if="writable && !partWritable[3]"
                  ></i>
                </div>
              </template>
              <el-form-item
                :label="$t('domain.domain.tecDefinitionDep')"
                prop="descriptionDepartment"
              >
                <datablau-select
                  ref="desOrgChoose"
                  v-model="detail.descriptionDepartment"
                  clearable
                  :placeholder="
                    $t('domain.common.selectionPlaceholder', {
                      name: $t('domain.domain.tecDefinitionDep'),
                    })
                  "
                  @focus="selectOrganization"
                >
                  <el-option
                    v-for="item in desOrgOptions.filter(
                      i => i.bm === detail.descriptionDepartment
                    )"
                    :key="item.id"
                    :label="item.fullName"
                    :value="item.bm"
                  ></el-option>
                </datablau-select>
              </el-form-item>
              <el-form-item
                label=""
                label-width="0"
                v-for="(udp, index) in udps.filter(
                  e => e.catalog === $t('domain.domain.manageProp')
                )"
                :key="index"
                :prop="udp.udpId + ''"
                class="udp-form-item"
              >
                <udp-form-label
                  :content="`${udp.name}`"
                  :strWidth="180"
                  :showModel="false"
                  :showRequired="!!udp.required"
                ></udp-form-label>
                <datablau-input
                  v-if="udp.dataType === 'String'"
                  type="textarea"
                  :autosize="{ minRows: 2 }"
                  v-model="additionalPropertiesObj[udp.udpId]"
                  :placeholder="$version.domain.placeholder.property"
                ></datablau-input>
                <datablau-select
                  v-if="
                    Array.isArray(udp.candidates) && udp.dataType === 'List'
                  "
                  v-model="additionalPropertiesObj[udp.udpId]"
                  :placeholder="$version.domain.placeholder.property"
                  style="display: inline-block;"
                >
                  <el-option
                    v-for="item in udp.candidates"
                    :key="item"
                    :label="item"
                    :value="item"
                  ></el-option>
                </datablau-select>
              </el-form-item>
            </el-collapse-item>
          </datablau-form>
        </el-collapse>
      </div>
      <template slot="buttons">
        <div
          v-if="
            writable &&
            (partWritable[0] ||
              partWritable[1] ||
              partWritable[2] ||
              partWritable[3])
          "
          style="display: inline-block"
        >
          <datablau-button
            v-if="!data || (data && !data.isUpdate)"
            size="small"
            type="primary"
            @click="beforeSave(false)"
            :loading="submitLoading"
          >
            {{ $t('common.button.save') }}
          </datablau-button>
          <datablau-button
            v-if="data && data.isUpdate"
            size="small"
            type="primary"
            @click="beforeSave(true)"
            :loading="submitLoading"
          >
            {{ $t('domain.common.submitApplication') }}
          </datablau-button>
          <datablau-button
            type="secondary"
            @click="exit(!domainId)"
            class="white-btn"
          >
            {{ $t('common.button.cancel') }}
          </datablau-button>
        </div>
        <datablau-button
          type="secondary"
          @click="exit(!domainId)"
          class="white-btn"
          v-else
        >
          {{ $t('common.button.cancel') }}
        </datablau-button>
      </template>
    </datablau-form-submit>
  </div>
</template>

<script>
import standardDetail from './standardDetail.js'
export default standardDetail
</script>

<style lang="scss" scoped>
@import './standardDetail.scss';
</style>
<style lang="scss">
.el-input.parent-code.is-disabled
  input.el-input__inner::-webkit-input-placeholder {
  /* WebKit browsers */
  visibility: visible;
}
</style>
