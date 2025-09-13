<template>
  <div id="standard-detail" class="domain-detail-component">
    <datablau-dialog
      :title="$t('domain.domain.addBusinessTerm')"
      width="80%"
      :visible.sync="showChooseTermDialogVis"
      :append-to-body="true"
      v-if="showChooseTermDialogVis"
    >
      <glossary-list style="height: 800px" :selection-ids.sync="chooseTerms" />
      <div slot="footer" class="dialog-footer" style="text-align: right">
        <datablau-button type="secondary" @click="closeChooseTermDialog(false)">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button
          type="important"
          @click="closeChooseTermDialog(true)"
          :disabled="!chooseTerms.length"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
      </div>
    </datablau-dialog>
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
          <!-- 标识类属性 start -->
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
                  <h2>{{ $t('domain.domain.symbolInfo') }}</h2>
                  <i
                    @click="enableEdit(0, $event)"
                    class="el-icon-edit"
                    v-if="writable && !partWritable[0]"
                  ></i>
                </div>
              </template>
              <!--:rules="{ required: true }"-->
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
              <!-- 中文名称 -->
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
              <!-- 英文名称 -->
              <el-form-item
                :label="$version.domain.property.domainEnName"
                prop="englishName"
              >
                <datablau-input
                  v-model="detail.englishName"
                  show-word-limit
                  :placeholder="
                    $version.common.pleaseInput +
                    $version.domain.property.domainEnName
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
                label=""
                label-width="0"
                v-for="(udp, index) in udps.filter(
                  e => e.catalog === $t('domain.domain.symbolInfo')
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
                  style="display: inline-block"
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
          <!-- 标识类属性 end -->
          <!-- :label-width="!writable || !partWritable[2] ? '120px' : '135px'" -->
          <!-- 定义类属性 start -->
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
                  <h2>{{ $t('domain.domain.defineInfo') }}</h2>
                  <i
                    class="el-icon-edit"
                    @click="enableEdit(2, $event)"
                    v-if="writable && !partWritable[2]"
                  ></i>
                </div>
              </template>
              <el-form-item
                :label="$version.domain.property.description"
                prop="description"
              >
                <div style="display: flex; align-items: start">
                  <datablau-input
                    type="textarea"
                    :autosize="{ minRows: 3 }"
                    v-model="detail.description"
                    :placeholder="
                      $version.common.pleaseInput +
                      $version.domain.property.description
                    "
                  ></datablau-input>
                  <datablau-button
                    v-if="showAI"
                    type="icon"
                    class="iconfont icon-aisearch"
                    @click="toGenerateAI"
                    :disabled="aiDisabled"
                    style="margin-left: 4px"
                  ></datablau-button>
                </div>
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
                label=""
                label-width="0"
                v-for="(udp, index) in udps.filter(
                  e => e.catalog === $t('domain.domain.defineInfo')
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
                  style="display: inline-block"
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
          <!-- 定义类属性 end -->
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
                  <h2>{{ $t('domain.domain.relaInfo') }}</h2>
                  <i
                    class="el-icon-edit"
                    @click="enableEdit(3, $event)"
                    v-if="writable && !partWritable[3]"
                  ></i>
                </div>
              </template>
              <el-form-item :label="'关联业务术语'" prop="referenceTerm">
                <datablau-input
                  maxlength="200"
                  ref="referenceTermInputDom"
                  v-model="detail.referenceTerm"
                  clearable
                  :placeholder="$version.common.pleaseInput + '关联术语'"
                  @focus="showBusinessTermChoose"
                  @clear="clearRelationBusinessTerm"
                ></datablau-input>
              </el-form-item>
              <el-form-item
                :label="$t('domain.domain.referenceOldDomain')"
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
                label=""
                label-width="0"
                v-for="(udp, index) in udps.filter(
                  e => e.catalog === $t('domain.domain.relaInfo')
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
                  style="display: inline-block"
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
                  <h2>{{ $t('domain.domain.expressInfo') }}</h2>
                  <i
                    @click="enableEdit(1, $event)"
                    class="el-icon-edit"
                    v-if="writable && !partWritable[1]"
                  ></i>
                </div>
              </template>
              <!--              信息类型-->
              <el-form-item label="数据类型" prop="dataType">
                <datablau-select
                  size="mini"
                  clearable
                  class="inline-input"
                  v-model="detail.dataType"
                  filterable
                  :placeholder="$version.common.pleaseInput + '数据类型'"
                  :disabled="fieldState"
                  @change="changeRangeType"
                >
                  <el-option
                    v-for="item in rangeTypeOptions"
                    :key="item.optionValue"
                    :label="item.optionLabel"
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
              <!--              数据类型-->
              <!--              <el-form-item
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
                  type="select"
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
              </el-form-item>-->
              <el-form-item
                :label="$version.domain.property.dataScale"
                prop="dataScale"
              >
                <datablau-input
                  v-model="detail.dataScale"
                  maxlength="9"
                  :placeholder="
                    $version.common.pleaseInput +
                    $version.domain.property.dataScale
                  "
                  :disabled="fieldState"
                ></datablau-input>
              </el-form-item>
              <!--数据单位-->
              <el-form-item
                v-if="detail.dataType === '数值型'"
                label="数据单位"
                prop="unit"
              >
                <datablau-input
                  v-model="detail.unit"
                  placeholder="请输入数据单位"
                  :disabled="fieldState"
                ></datablau-input>
              </el-form-item>
              <!-- 数据精度 -->
              <el-form-item
                :label="$version.domain.property.dataPrecision"
                prop="dataPrecision"
              >
                <datablau-input
                  v-model="detail.dataPrecision"
                  maxlength="9"
                  :placeholder="
                    $version.common.pleaseInput +
                    $version.domain.property.dataPrecision
                  "
                  :disabled="fieldState"
                ></datablau-input>
              </el-form-item>
              <!-- 关联参考数据 -->
              <el-form-item
                label="关联参考数据"
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

              <el-form-item label="取值范围" prop="dataRange">
                <div
                  style="
                    display: flex;
                    width: 300px;
                    justify-content: space-between;
                  "
                >
                  <el-input-number
                    controls-position="right"
                    v-model="detail.minValue"
                    placeholder="最小值"
                  ></el-input-number>
                  <el-input-number
                    controls-position="right"
                    v-model="detail.maxValue"
                    placeholder="最大值"
                  ></el-input-number>
                </div>
              </el-form-item>
              <el-form-item
                :label="$version.domain.property.dataFormat"
                prop="dataFormat"
              >
                <!--                <datablau-input
                  maxlength="200"
                  v-model="detail.dataFormat"
                  :placeholder="
                    $version.common.pleaseInput +
                    $version.domain.property.dataFormat
                  "
                  :disabled="fieldState"
                ></datablau-input>-->
                <datablau-select
                  size="mini"
                  clearable
                  class="inline-input"
                  v-model="detail.dataFormat"
                  filterable
                  :placeholder="$version.common.pleaseInput + '数据格式'"
                  :disabled="fieldState"
                >
                  <el-option
                    v-for="item in dataFormatOptions"
                    :key="item.optionValue"
                    :label="item.optionValue"
                    :value="item.optionValue"
                  ></el-option>
                </datablau-select>
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
              <!--              <el-form-item
                :label="$version.domain.property.notNull"
                prop="notNull"
              >
                <el-checkbox
                  v-model="detail.notNull"
                  :disabled="fieldState"
                ></el-checkbox>
              </el-form-item>-->
              <el-form-item
                label=""
                label-width="0"
                v-for="(udp, index) in udps.filter(
                  e => e.catalog === $t('domain.domain.expressInfo')
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
                  style="display: inline-block"
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

          <!-- 管理类属性 start -->
          <datablau-form
            :inline-message="true"
            class="page-form thin-textarea standard-page"
            :class="{ disabled: !writable || !partWritable[4] }"
            label-position="right"
            :label-width="'180px'"
            size="small"
            ref="form1"
            :disabled="!writable || !partWritable[4]"
            :rules="writable && partWritable[4] ? rules : {}"
            :model="detail"
          >
            <el-collapse-item name="4">
              <template slot="title">
                <div class="collapse-title">
                  <h2>{{ $t('domain.domain.newManageInfo') }}</h2>
                  <i
                    @click="enableEdit(4, $event)"
                    class="el-icon-edit"
                    v-if="writable && !partWritable[4]"
                  ></i>
                </div>
              </template>
              <!-- 业务域 -->
              <el-form-item :label="'业务域'" prop="selectedOptions2">
                <el-cascader
                  size="mini"
                  expand-trigger="click"
                  :options="options ? options[0].nodes : []"
                  :props="defaultProps2"
                  :change-on-select="true"
                  v-model="selectedOptions2"
                  :placeholder="
                    $t('domain.common.pleaseSelect') +
                    $version.domain.property.selectTheme
                  "
                  ref="pathSelector"
                ></el-cascader>
              </el-form-item>

              <!--<el-form-item
                :label="$t('domain.domain.authCategoryId')"
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
              </el-form-item>-->

              <!--<el-form-item
                label=""
                label-width="0"
                v-for="(udp, index) in udps.filter(
                  e => e.catalog === $t('domain.domain.newManageInfo')
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
                  style="display: inline-block"
                >
                  <el-option
                    v-for="item in udp.candidates"
                    :key="item"
                    :label="item"
                    :value="item"
                  ></el-option>
                </datablau-select>
              </el-form-item>-->
            </el-collapse-item>
          </datablau-form>
          <!-- 管理类属性 end -->

          <datablau-form
            :inline-message="true"
            class="page-form thin-textarea standard-page"
            :class="{ disabled: !writable || !partWritable[5] }"
            label-position="right"
            :label-width="'180px'"
            size="small"
            ref="form1"
            :disabled="!writable || !partWritable[5]"
            :rules="writable && partWritable[5] ? rules : {}"
            :model="detail"
          >
            <el-collapse-item name="5">
              <template slot="title">
                <div class="collapse-title">
                  <h2>{{ $t('domain.domain.additionInfo') }}</h2>
                  <i
                    @click="enableEdit(5, $event)"
                    class="el-icon-edit"
                    v-if="writable && !partWritable[5]"
                  ></i>
                </div>
              </template>
              <!-- <el-form-item
                :label="$version.domain.property.domainAbbr"
                prop="abbreviation"
                style="margin-bottom: 20px"
              >
                <datablau-input
                  v-model="detail.abbreviation"
                  maxlength="100"
                  :placeholder="
                    $version.common.pleaseInput +
                    $version.domain.property.domainAbbr
                  "
                ></datablau-input>
              </el-form-item> -->
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
                label=""
                label-width="0"
                v-for="(udp, index) in udps.filter(
                  e => e.catalog === $t('domain.domain.additionInfo')
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
                  style="display: inline-block"
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
            :disabled="submitLoading"
          >
            {{ $t('common.button.ok') }}
          </datablau-button>
          <datablau-button
            v-if="data && data.isUpdate"
            size="small"
            type="primary"
            @click="beforeSave(true)"
            :disabled="submitLoading"
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
.abbreviation {
  .el-input .el-input__count .el-input__count-inner {
    padding: 0;
  }
}
</style>
