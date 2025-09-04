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
          prop="catalog"
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
                @click="handleAddDim(scope.row.catalogId)"
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
                  <h2>{{ labelText.standard }}</h2>
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
                  :props="defaultProps2"
                  :change-on-select="true"
                  v-model="selectedOptions2"
                  :placeholder="'请选择' + $version.domain.property.selectTheme"
                  ref="pathSelector"
                ></el-cascader>
              </el-form-item>
              <el-form-item :label="labelText.domainCode" prop="domainCode">
                <datablau-input
                  v-model="detail.domainCode"
                  :placeholder="$version.domain.placeholder.code"
                  :disabled="(!!domainId && !isDerive) || autoCode"
                  @blur="checkDomainCodeIsExist()"
                  :disabledGrey="(!!domainId && !isDerive) || autoCode"
                ></datablau-input>
                <datablau-checkbox
                  v-if="!domainId && (typeIds === 1 || typeIds === 2) && useDam"
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
                :label="udp.name"
                v-for="(udp, index) in udps.filter(
                  e => e.catalog === $t('domain.domain.standardProp')
                )"
                :key="index"
                :prop="udp.udpId + ''"
              >
                <datablau-input
                  v-if="udp.dataType === 'String'"
                  type="textarea"
                  :autosize="{ minRows: 3 }"
                  v-model="additionalPropertiesObj[udp.udpId]"
                  :placeholder="$version.domain.placeholder.property"
                ></datablau-input>
                <datablau-select
                  v-if="
                    Array.isArray(udp.candidates) && udp.dataType === 'List'
                  "
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
                :label="$version.domain.property.referenceCode"
                prop="referenceCode"
                v-if="categoryTypeId !== 2"
              >
                <datablau-input
                  v-model="detail.referenceCode"
                  clearable
                  :placeholder="$t('domain.domain.referenceCodePlaceholder')"
                  ref="referenceCode"
                  @focus="openCodeSelect"
                ></datablau-input>
              </el-form-item>
              <el-form-item
                :label="$version.domain.property.description"
                prop="description"
              >
                <datablau-input
                  type="textarea"
                  :autosize="{ minRows: 3 }"
                  v-model="detail.description"
                  :placeholder="
                    $version.common.pleaseInput +
                    $version.domain.property.description
                  "
                ></datablau-input>
              </el-form-item>
              <el-form-item
                :label="$version.domain.property.businessRule"
                prop="businessRule"
              >
                <datablau-input
                  type="textarea"
                  :autosize="{ minRows: 3 }"
                  v-model="detail.businessRule"
                  :placeholder="
                    $version.common.pleaseInput +
                    $version.domain.property.businessRule
                  "
                ></datablau-input>
              </el-form-item>
              <el-form-item
                :label="$version.domain.property.source"
                prop="source"
              >
                <datablau-input
                  maxlength="200"
                  type="textarea"
                  :autosize="{ minRows: 3 }"
                  v-model="detail.source"
                  :placeholder="
                    $version.common.pleaseInput +
                    $version.domain.property.source
                  "
                ></datablau-input>
              </el-form-item>
              <el-form-item
                :label="$version.domain.property.synonym"
                prop="synonym"
              >
                <datablau-input
                  maxlength="200"
                  type="textarea"
                  :autosize="{ minRows: 3 }"
                  v-model="detail.synonym"
                  :placeholder="
                    $version.common.pleaseInput +
                    $version.domain.property.synonym
                  "
                ></datablau-input>
              </el-form-item>
              <el-form-item
                :label="
                  $t('domain.domain.referenceTypeDomain', {
                    domainType:
                      labelText.nameAbbr !== $t('domain.domain.standard')
                        ? labelText.nameAbbr
                        : $t('domain.common.basicDomain'),
                  })
                "
                prop="relationDomain"
              >
                <datablau-input
                  ref="relationChoose"
                  v-model="relationDomainString"
                  clearable
                  :placeholder="
                    $t('domain.common.selectionPlaceholder', {
                      name: labelText.nameAbbr,
                    })
                  "
                  key="relationDomain"
                  @focus="showStandardChoose"
                  @clear="clearRelationDomain"
                >
                  <!--<el-option-->
                  <!--  v-for="item in relatedDomainsOptions"-->
                  <!--  :key="item.domainId"-->
                  <!--  :label="item.chineseName"-->
                  <!--  :value="item.domainId"-->
                  <!--&gt;</el-option>-->
                </datablau-input>
              </el-form-item>
              <el-form-item
                :label="$version.domain.property.authCategoryId"
                prop="authCategoryId"
                v-if="useDam"
              >
                <datablau-select
                  v-model="detail.authCategoryId"
                  filterable
                  clearable
                  :placeholder="
                    $t('domain.common.selectionPlaceholder', {
                      name: $t('domain.domain.authCategoryId'),
                    })
                  "
                >
                  <el-option
                    v-for="item in $modelCategories"
                    :key="item.categoryId"
                    :label="
                      item.categoryName + '(' + item.categoryAbbreviation + ')'
                    "
                    :value="item.categoryId"
                  ></el-option>
                </datablau-select>
              </el-form-item>
              <el-form-item
                :label="$version.domain.property.function"
                prop="function"
                v-if="categoryTypeId === 2"
              >
                <datablau-input
                  maxlength="200"
                  type="textarea"
                  :autosize="{ minRows: 3 }"
                  v-model="detail.function"
                  :placeholder="
                    $version.common.pleaseInput +
                    $version.domain.property.function
                  "
                ></datablau-input>
              </el-form-item>
              <el-form-item
                :label="$version.domain.property.measureUnit"
                prop="measureUnit"
                v-if="categoryTypeId === 2"
              >
                <datablau-input
                  maxlength="200"
                  type="textarea"
                  :autosize="{ minRows: 3 }"
                  v-model="detail.measureUnit"
                  :placeholder="
                    $version.common.pleaseInput +
                    $version.domain.property.measureUnit
                  "
                ></datablau-input>
              </el-form-item>
              <el-form-item
                :label="$version.domain.property.monitorObjects"
                prop="monitorObjects"
                v-if="categoryTypeId === 2"
              >
                <datablau-input
                  type="textarea"
                  :autosize="{ minRows: 3 }"
                  maxlength="200"
                  v-model="detail.monitorObjects"
                  :placeholder="
                    $version.common.pleaseInput +
                    $version.domain.property.monitorObjects
                  "
                ></datablau-input>
              </el-form-item>

              <el-form-item
                :label="udp.name"
                v-for="(udp, index) in udps.filter(
                  e => e.catalog === $t('domain.domain.businessProp')
                )"
                :key="index"
                :prop="
                  udp.name === $t('domain.domain.dataQualityRules')
                    ? 'busRule'
                    : udp.udpId + ''
                "
              >
                <datablau-input
                  v-if="udp.dataType === 'String'"
                  type="textarea"
                  :autosize="{ minRows: 3 }"
                  v-model="additionalPropertiesObj[udp.udpId]"
                  :placeholder="$version.domain.placeholder.property"
                ></datablau-input>
                <datablau-select
                  v-if="
                    Array.isArray(udp.candidates) && udp.dataType === 'List'
                  "
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
              <el-form-item
                :label="$version.domain.property.dim"
                prop="dimCodes"
                v-if="categoryTypeId === 2"
              >
                <datablau-button type="primary" @click="addDims">
                  {{ $t('domain.domain.addDim') }}
                </datablau-button>
              </el-form-item>
              <el-form-item
                v-for="catalogId in dimsDisplay"
                :key="catalogId"
                :label="allDims[catalogId].catalog"
              >
                <datablau-select
                  v-model="allDims[catalogId].selected"
                  clearable
                  multiple
                  filterable
                  @change="handleSelectChange"
                >
                  <el-option
                    v-for="value in allDims[catalogId].values"
                    :key="value.dimId"
                    :value="value.dimId"
                    :label="value.value"
                  ></el-option>
                </datablau-select>
                &nbsp;
                <el-button
                  type="text"
                  size="mini"
                  @click="deleteDimItem(catalogId)"
                  icon="el-icon-delete"
                ></el-button>
              </el-form-item>
              <el-form-item
                :label="$version.domain.property.relationDocuments"
                prop="relationDocuments"
              >
                <datablau-button type="normal" @click="handleUploadFile">
                  {{
                    $t('domain.common.addObject', {
                      typeName: $t('domain.domain.relationDocuments'),
                    })
                  }}
                </datablau-button>
              </el-form-item>
              <el-form-item>
                <relation-doc
                  ref="relationDoc"
                  :useDam="false"
                  :documentsIds="detail.documentIds"
                ></relation-doc>
              </el-form-item>
            </el-collapse-item>
          </datablau-form>

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
                :label="$version.domain.property.descriptionDepartment"
                prop="descriptionDepartment"
              >
                <datablau-select
                  ref="desOrgChoose"
                  v-model="detail.descriptionDepartment"
                  clearable
                  :placeholder="
                    $t('domain.common.selectionPlaceholder', {
                      name: $t('domain.domain.busDefinitionDep'),
                    })
                  "
                  @focus="selectOrganization"
                  @visible-change="showSelectOrganization"
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
                :label="$version.domain.property.ownerOrg"
                prop="ownerOrg"
              >
                <datablau-select
                  ref="ownerChooseSelect"
                  v-model="detail.ownerOrg"
                  clearable
                  :placeholder="
                    $t('domain.common.selectionPlaceholder', {
                      name: $t('domain.domain.techDepartment'),
                    })
                  "
                  @focus="selectOwnerOrg"
                  @visible-change="showSelectOwnerOrg"
                >
                  <el-option
                    v-for="item in ownerOrgOptions.filter(
                      i => i.bm === detail.ownerOrg
                    )"
                    :key="item.id"
                    :label="item.fullName"
                    :value="item.bm"
                  ></el-option>
                </datablau-select>
              </el-form-item>
              <el-form-item
                :label="$version.domain.property.parentCode"
                prop="parentCode"
                style="margin-bottom: 20px"
                v-if="categoryTypeId === 2"
              >
                <datablau-input
                  v-model="detail.parentCode"
                  readonly
                  class="parent-code"
                  :placeholder="$t('domain.domain.autoParentIndex')"
                ></datablau-input>
              </el-form-item>
              <el-form-item
                :label="udp.name"
                v-for="(udp, index) in udps.filter(
                  e => e.catalog === $t('domain.domain.manageProp')
                )"
                :key="index"
                :prop="udp.udpId + ''"
              >
                <datablau-input
                  v-if="udp.dataType === 'String'"
                  type="textarea"
                  :autosize="{ minRows: 3 }"
                  v-model="additionalPropertiesObj[udp.udpId]"
                  :placeholder="$version.domain.placeholder.property"
                ></datablau-input>
                <datablau-select
                  v-if="
                    Array.isArray(udp.candidates) && udp.dataType === 'List'
                  "
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
            </el-collapse-item>
          </datablau-form>

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
                :label="$t('domain.domain.weatherDomainStandard')"
                v-if="categoryTypeId === 1"
              >
                <datablau-switch
                  v-model="fieldState"
                  @change="changeFieldStateValue"
                  :active-text="$t('domain.common.true')"
                  :inactive-text="$t('domain.common.false')"
                  type="innerText"
                ></datablau-switch>
              </el-form-item>
              <el-form-item
                :label="$t('domain.domain.domainStandardType')"
                v-if="fieldState === true && categoryTypeId === 1"
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
                      name: $t('domain.domain.domainStandardType'),
                    })
                  "
                  clearable
                  :filterable="true"
                  :remote="true"
                  :remote-method="remoteMethod"
                  @change="selectdDmainInherit"
                >
                  <el-option
                    :value="treeData.domainId"
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
                        :props="defaultProps3"
                        :data-icon-function="dataIconFunction2"
                      >
                        <span
                          slot-scope="{ data }"
                          :title="data[defaultProps3.label]"
                          class="ellipsis"
                        >
                          {{ data[defaultProps3.label] }}
                        </span>
                      </datablau-tree>
                    </div>
                  </el-option>
                </datablau-select>
              </el-form-item>
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
                  :disabled="fieldState"
                  @change="changeRangeType"
                >
                  <el-option
                    v-for="item in rangeTypeOptions"
                    :key="item.optionValue"
                    :label="item.optionValue"
                    :value="item.optionValue"
                  ></el-option>
                </datablau-select>
                <!--                <el-autocomplete
                  size="mini"
                  clearable
                  class="inline-input"
                  v-model="detail.rangeType"
                  value-key="optionValue"
                  :fetch-suggestions="getRangeTypeOptions"
                  :placeholder="
                    $version.common.pleaseInput +
                    $version.domain.property.rangeType
                  "
                  :disabled="fieldState"
                  @select="changeRangeType"
                ></el-autocomplete>-->
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
                  :disabled="fieldState"
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
              <el-form-item
                :label="$version.domain.property.dataScale"
                prop="dataScale"
              >
                <datablau-input
                  v-model.number="detail.dataScale"
                  :placeholder="
                    $version.common.pleaseInput +
                    $version.domain.property.dataScale
                  "
                  :disabled="fieldState"
                ></datablau-input>
              </el-form-item>
              <el-form-item
                :label="$version.domain.property.dataPrecision"
                prop="dataPrecision"
              >
                <datablau-input
                  v-model.number="detail.dataPrecision"
                  :placeholder="
                    $version.common.pleaseInput +
                    $version.domain.property.dataPrecision
                  "
                  :disabled="fieldState"
                ></datablau-input>
              </el-form-item>
              <el-form-item
                :label="$version.domain.property.dataFormat"
                prop="dataFormat"
              >
                <datablau-input
                  maxlength="200"
                  v-model.number="detail.dataFormat"
                  :placeholder="
                    $version.common.pleaseInput +
                    $version.domain.property.dataFormat
                  "
                  :disabled="fieldState"
                ></datablau-input>
              </el-form-item>
              <el-form-item
                :label="$version.domain.property.notNull"
                prop="notNull"
              >
                <el-checkbox
                  v-model="detail.notNull"
                  :disabled="fieldState"
                ></el-checkbox>
              </el-form-item>
              <el-form-item
                :label="udp.name"
                v-for="(udp, index) in udps.filter(
                  e => e.catalog === $t('domain.domain.techProp')
                )"
                :key="index"
                :prop="udp.udpId + ''"
              >
                <datablau-input
                  v-if="udp.dataType === 'String'"
                  type="textarea"
                  :autosize="{ minRows: 3 }"
                  v-model="additionalPropertiesObj[udp.udpId]"
                  :placeholder="$version.domain.placeholder.property"
                ></datablau-input>
                <datablau-select
                  v-if="
                    Array.isArray(udp.candidates) && udp.dataType === 'List'
                  "
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
            {{ $t('common.button.ok') }}
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
