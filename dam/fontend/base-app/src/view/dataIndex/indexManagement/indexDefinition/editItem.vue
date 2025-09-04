<template>
  <div style="padding: 0 20px">
    <dim-selector
      ref="dimSelRef"
      @changeSel="changeSel"
      :multiple="false"
    ></dim-selector>
    <standard-selector
      :categoryTypeId="5"
      :hideFilter="true"
      :single="true"
    ></standard-selector>
    <modifier-selector
      ref="modifierSelector"
      @select="handleModifierSelected"
    ></modifier-selector>
    <div class="row-header">
      <datablau-breadcrumb
        @back="back"
        :node-data="nodeData"
        separator="/"
      ></datablau-breadcrumb>
    </div>
    <div v-if="!editMode" style="height: 100px">
      <header-information
        v-if="formData && formData.domainId"
        :details="formData"
      ></header-information>
    </div>
    <datablau-tabs
      v-if="!editMode"
      v-model="activeName"
      @tab-click="handleTabClick"
      style="clear: both"
    >
      <el-tab-pane
        :label="$t('indicator.demand.basic')"
        name="basic"
        v-if="viewMode && permission"
      ></el-tab-pane>
      <el-tab-pane
        v-if="viewMode && permission && permission.includes('指标管理')"
        :label="$t('indicator.definition.mapping')"
        name="mapping"
      ></el-tab-pane>
      <el-tab-pane
        v-if="viewMode && permission && permission.includes('指标预览')"
        :label="$t('indicator.definition.profiling')"
        name="dataProfiling"
      ></el-tab-pane>
      <el-tab-pane
        v-if="$featureMap.FE_LINEAGE"
        :label="$t('meta.DS.tableDetail.lineage.label1')"
        name="lineage"
        class="report-lineage-tab"
      ></el-tab-pane>
      <el-tab-pane
        v-if="viewMode && permission"
        :label="$t('indicator.definition.graph')"
        name="graph"
      ></el-tab-pane>
      <el-tab-pane
        v-if="viewMode && permission && permission.includes('指标预警')"
        :label="$t('indicator.definition.analyzeAndMonitor')"
        name="analyzeAndMonitor"
      ></el-tab-pane>
      <el-tab-pane
        v-if="viewMode && permission && permission.includes('指标授权')"
        :label="$t('indicator.definition.accessControl')"
        name="accessControl"
      ></el-tab-pane>
      <el-tab-pane
        v-if="viewMode && permission && permission.includes('指标预警')"
        :label="$t('indicator.definition.alert')"
        name="redAlert"
      ></el-tab-pane>
      <el-tab-pane
        v-if="viewMode && permission"
        :label="$t('domain.domain.changeHistory')"
        name="version"
      ></el-tab-pane>
    </datablau-tabs>
    <datablau-form-submit
      v-if="editMode"
      style="position: absolute; top: 50px; left: 0; right: 0; bottom: 0"
    >
      <div style="padding: 10px 20px">
        <datablau-form
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
              prop="folderId"
            >
              <datablau-cascader
                expand-trigger="click"
                :options="options ? options : []"
                :props="defaultProps2"
                :change-on-select="true"
                :emit-path="false"
                ref="cascader"
                v-model="formData.folderId"
              ></datablau-cascader>
            </el-form-item>
            <el-form-item
              :label="$t('indicator.definition.domainCode')"
              prop="domainCode"
            >
              <datablau-input
                v-model="formData.domainCode"
                :disabled="!!currentItem || editAndUpdateMode || autoCode"
                :disabledGrey="!!currentItem || editAndUpdateMode || autoCode"
                maxlength="100"
                class="maxlengthInput"
                show-word-limit
              ></datablau-input>
            </el-form-item>
            <el-form-item :label="$t('indicator.dimension.requirement')">
              <datablau-select
                v-model="formData.requirementId"
                filterable
                clearable
              >
                <el-option
                  v-for="item in requirementOption"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                ></el-option>
              </datablau-select>
            </el-form-item>
            <el-form-item
              :label="$t('indicator.definition.chineseName')"
              prop="chineseName"
            >
              <datablau-input
                v-model="formData.chineseName"
                maxlength="200"
                class="maxlengthInput"
                show-word-limit
              ></datablau-input>
            </el-form-item>
            <el-form-item
              :label="$t('indicator.definition.englishName')"
              prop="englishName"
            >
              <datablau-input
                v-model="formData.englishName"
                maxlength="100"
                class="maxlengthInput"
                show-word-limit
              ></datablau-input>
            </el-form-item>
            <el-form-item
              :label="$t('indicator.definition.abbreviation')"
              prop="abbreviation"
            >
              <datablau-input
                v-model="formData.abbreviation"
                maxlength="100"
                class="maxlengthInput"
                show-word-limit
              ></datablau-input>
            </el-form-item>
            <el-form-item
              :label="$t('indicator.definition.validRange')"
              prop="validRange"
            >
              <datablau-date-range
                ref="dataRange"
                v-model="dateRange"
                @changeDateTime="changeEventStartTime"
              ></datablau-date-range>
            </el-form-item>
            <!--<el-form-item label="关联标准">
                <datablau-select value=""></datablau-select>
              </el-form-item>-->
            <!--            <el-form-item label="安全等级" prop="safeLevel">
              <datablau-select v-model="formData.safeLevel">
                <el-option
                  v-for="o in SafeLevel"
                  :key="o"
                  :label="SafeLevelLabel[o]"
                  :value="o"
                ></el-option>
              </datablau-select>
            </el-form-item>-->
            <!--            <el-form-item label="影响程度">
                          <datablau-select value="一般"></datablau-select>
                        </el-form-item>
                        <el-form-item label="生产方式">
                          <datablau-radio v-model="formData.formatMethod">
                            <el-radio v-for="o in FormatMethod" :label="o">
                              {{ FormatMethodLabel[o] }}
                            </el-radio>
                          </datablau-radio>
                        </el-form-item>
                        <el-form-item label="默认图形">
                          <datablau-radio v-model="formData.defaultGraph">
                            <el-radio v-for="o in DefaultGraph" :label="o">
                              {{ DefaultGraphLabel[o] }}
                            </el-radio>
                          </datablau-radio>
                        </el-form-item>-->
            <el-form-item
              :label="udp.name"
              v-for="(udp, index) in udps.filter(e => e.catalog === '标准属性')"
              :key="index"
              :prop="'udp' + udp.udpId"
            >
              <datablau-input
                v-if="!Array.isArray(udp.candidates)"
                type="textarea"
                :autosize="{ minRows: 2 }"
                v-model="additionalPropertiesObj[udp.udpId]"
                :placeholder="$version.domain.placeholder.property"
                maxlength="500"
                class="maxlengthInput"
                show-word-limit
              ></datablau-input>
              <datablau-select
                v-if="Array.isArray(udp.candidates)"
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
            <!--            <el-form-item label="指标标签"></el-form-item>-->
          </div>
          <div
            class="descriptionMessage-title"
            v-if="
              [IndexType.DERIVE, IndexType.FORK].includes(formData.metricType)
            "
          >
            <p class="message-title">指标构成</p>
          </div>
          <div
            v-if="
              [IndexType.DERIVE, IndexType.FORK].includes(formData.metricType)
            "
          >
            <el-form-item
              label="原子/衍生指标"
              prop="relationDomain"
              ref="relationDomainFormItem"
            >
              <relation-domain-list
                :domainCodes="formData.relationDomain"
                :categoryTypeId="5"
                edit-mode
                @clear-form-validator="handleClearRelationDomainValidator"
              >
                <datablau-button
                  slot="add"
                  type="text"
                  class="iconfont icon-tianjia"
                  @click="showStandardChoose"
                >
                  添加原子/衍生指标
                </datablau-button>
              </relation-domain-list>
            </el-form-item>
            <!--<el-form-item
              v-for="(o, i) in formData.relationDomain"
              :key="i"
              :label="'原子/衍生指标' + (i ? i + 1 : '')"
              :required="i === 0"
            >
              <datablau-input
                readonly
                :value="o"
                @click.native="showStandardChoose(i)"
              ></datablau-input>
              <datablau-button
                @click="showStandardChoose(i)"
                style="position: relative; right: 64px; margin-right: -64px"
              >
                选择
              </datablau-button>
              <datablau-button
                v-if="formData.relationDomain.length > 1"
                @click="removeRelationDomainItem(i)"
                type="text"
                class="iconfont icon-delete"
              ></datablau-button>
              <datablau-button
                v-if="i === formData.relationDomain.length - 1"
                type="text"
                class="iconfont icon-tianjia"
                @click="addRelationDomainItem"
              >
                添加原子/衍生指标
              </datablau-button>
            </el-form-item>-->
          </div>
          <div v-if="[IndexType.FORK].includes(formData.metricType)">
            <el-form-item label="时间周期">
              <datablau-input
                placeholder="时间周期类型"
                style="width: 166px"
                :value="timeModifierRef.type"
                readonly
              ></datablau-input>
              <datablau-input
                placeholder="时间周期代码"
                style="width: 166px"
                :value="timeModifierRef.code"
                readonly
              ></datablau-input>
              <datablau-input
                placeholder="时间周期"
                style="width: 167px"
                :value="timeModifierRef.name"
                readonly
              ></datablau-input>
              <datablau-button
                @click="selectTimeModifier"
                type="text"
                style="margin-left: 10px"
              >
                选择时间周期
              </datablau-button>
              <datablau-button
                type="text"
                @click="clearTimeModifier"
                v-show="timeModifierRef.id"
              >
                清除
              </datablau-button>
            </el-form-item>
            <el-form-item label="修饰词">
              <datablau-button
                @click="selectModifier"
                type="text"
                class="iconfont icon-tianjia"
              >
                添加修饰词
              </datablau-button>
              <datablau-table style="width: 800px" :data="modifierRefs">
                <el-table-column
                  label="修饰类型"
                  prop="type"
                  show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                  label="修饰词代码"
                  prop="code"
                  show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                  label="修饰词"
                  prop="name"
                  show-overflow-tooltip
                ></el-table-column>
                <el-table-column label="操作" :width="60" header-align="center">
                  <template slot-scope="scope">
                    <datablau-button
                      type="text"
                      class="iconfont icon-delete"
                      @click="removeModifierValue(scope.$index)"
                    >
                    </datablau-button>
                  </template>
                </el-table-column>
              </datablau-table>
            </el-form-item>
          </div>
          <div
            class="descriptionMessage-title"
            style="margin-top: 20px; margin-bottom: 20px"
          >
            <p class="message-title">{{ $t('domain.domain.businessInfo') }}</p>
          </div>
          <div>
            <el-form-item
              :label="$t('indicator.definition.description')"
              prop="description"
            >
              <datablau-input
                type="textarea"
                v-model="formData.description"
                maxlength="500"
                class="maxlengthInput"
                show-word-limit
              ></datablau-input>
            </el-form-item>
            <el-form-item
              :label="$t('domain.domain.measureUnit')"
              prop="measureUnit"
            >
              <datablau-input
                v-model="formData.measureUnit"
                maxlength="100"
                class="maxlengthInput"
                show-word-limit
              ></datablau-input>
            </el-form-item>
            <!-- <el-form-item
              :label="$t('indicator.definition.relationDomain')"
              v-if="`${formData.metricType}` === '1'"
            >
              <datablau-select
                ref="relationChoose"
                v-model="formData.relationDomain"
                clearable
                multiple
                :placeholder="$t('indicator.definition.selectRelationDomain')"
                @focus="showStandardChoose"
              >
                <el-option
                  v-for="item in relatedDomainsOptions"
                  :key="item.domainId"
                  :label="item.chineseName"
                  :value="item.domainId"
                ></el-option>
              </datablau-select>
            </el-form-item>-->
            <!--<div
              class="dimForm"
              v-for="(dimFormItem, idx) in dimForm"
              v-if="`${formData.metricType}` === '1'"
              :key="idx"
            >
              <el-form-item :label="$t('indicator.definition.descriptor')">
                <datablau-input
                  v-model="dimFormItem.description"
                ></datablau-input>
              </el-form-item>
              <el-form-item
                :label="$t('indicator.definition.descriptorValue')"
                label-width="180px"
              >
                <datablau-button
                  style="padding-left: 0"
                  type="text"
                  @click="addDim(idx)"
                >
                  <i class="el-icon-circle-plus"></i>
                  {{ $t('common.button.add') }}
                </datablau-button>
                <el-tag
                  v-for="(dim, i) in dimFormItem.dimensionValues"
                  :key="`${dim.codeId}${dim.parentId}`"
                  closable
                  @close="handleDelDim(idx, i)"
                  style="margin-right: 10px"
                >
                  {{ dim.chineseName }}
                </el-tag>
              </el-form-item>
            </div>-->
            <!--<el-form-item v-if="`${formData.metricType}` === '1'">
              <datablau-button
                type="text"
                style="padding-left: 0"
                @click="addDimLine()"
              >
                <i class="el-icon-circle-plus"></i>
                {{ $t('indicator.definition.newDimension') }}
              </datablau-button>
            </el-form-item>-->
            <!--            <el-form-item label="指标公式" prop="function">
              <datablau-input
                type="textarea"
                v-model="formData.function"
              ></datablau-input>
            </el-form-item>-->
            <!--<el-form-item :label="$t('domain.domain.authCategoryId')">
              <datablau-select
                v-model="formData.authCategoryId"
                filterable
                clearable
                :placeholder="$t('domain.domain.selectAuthCategoryId')"
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
            <!--<el-form-item :label="$t('domain.domain.synonym')" prop="synonym">
              <datablau-input v-model="formData.synonym"></datablau-input>
            </el-form-item>-->
            <el-form-item
              :label="udp.name"
              v-for="(udp, index) in udps.filter(e => e.catalog === '业务属性')"
              :key="index"
              :prop="'udp' + udp.udpId"
            >
              <datablau-input
                v-if="!Array.isArray(udp.candidates)"
                type="textarea"
                :autosize="{ minRows: 2 }"
                v-model="additionalPropertiesObj[udp.udpId]"
                :placeholder="$version.domain.placeholder.property"
                maxlength="500"
                class="maxlengthInput"
                show-word-limit
              ></datablau-input>
              <datablau-select
                v-if="Array.isArray(udp.candidates)"
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
          </div>
          <div
            class="descriptionMessage-title"
            style="margin-top: 20px; margin-bottom: 20px"
          >
            <p class="message-title">{{ $t('domain.domain.techInfo') }}</p>
          </div>
          <div>
            <el-form-item
              :label="$version.domain.property.rangeType"
              prop="rangeType"
            >
              <datablau-select
                size="mini"
                clearable
                class="inline-input"
                v-model="formData.rangeType"
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
                v-model="formData.dataType"
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
                    v-for="(item, idx) in group.options"
                    :key="`${group.label}/${item.optionValue}` + idx"
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
                v-model.number="formData.dataScale"
                :placeholder="
                  $version.common.pleaseInput + '（数据长度必须是数字）'
                "
                :disabled="fieldState"
                maxlength="9"
                class="maxlengthInput"
                show-word-limit
              ></datablau-input>
            </el-form-item>
            <el-form-item
              :label="$version.domain.property.dataPrecision"
              prop="dataPrecision"
            >
              <datablau-input
                v-model.number="formData.dataPrecision"
                :placeholder="
                  $version.common.pleaseInput + '（数据精度必须是数字）'
                "
                :disabled="fieldState"
                maxlength="9"
                class="maxlengthInput"
                show-word-limit
              ></datablau-input>
            </el-form-item>
            <el-form-item
              :label="$t('domain.domain.dataFormat')"
              prop="dataFormat"
            >
              <datablau-input
                v-model="formData.dataFormat"
                maxlength="100"
                class="maxlengthInput"
                show-word-limit
              ></datablau-input>
            </el-form-item>
            <el-form-item
              :label="udp.name"
              v-for="(udp, index) in udps.filter(e => e.catalog === '技术属性')"
              :key="index"
              :prop="'udp' + udp.udpId"
            >
              <datablau-input
                v-if="!Array.isArray(udp.candidates)"
                type="textarea"
                :autosize="{ minRows: 2 }"
                v-model="additionalPropertiesObj[udp.udpId]"
                :placeholder="$version.domain.placeholder.property"
                maxlength="500"
                class="maxlengthInput"
                show-word-limit
              ></datablau-input>
              <datablau-select
                v-if="Array.isArray(udp.candidates)"
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
          </div>
          <div
            class="descriptionMessage-title"
            style="margin-top: 20px; margin-bottom: 20px"
          >
            <p class="message-title">{{ $t('domain.domain.manageInfo') }}</p>
          </div>
          <div>
            <el-form-item
              :label="$t('domain.domain.tecDefinitionDep')"
              prop="ownerOrg"
            >
              <datablau-select
                ref="desOrgChoose1"
                v-model="formData.ownerOrg"
                clearable
                class="no-dropdown-icon"
                :placeholder="
                  $t('domain.common.selectionPlaceholder', {
                    name: $t('domain.domain.tecDefinitionDep'),
                  })
                "
                @focus.prevent="selectOrganization1"
                @clear="blurFormItem('desOrgChoose1')"
                style="display: inline-block; width: 437px"
              >
                <el-option
                  v-for="item in desOrgOptions"
                  :key="item.id"
                  :label="item.fullName"
                  :value="item.bm"
                ></el-option>
              </datablau-select>
              <datablau-button
                @click="selectOrganization1"
                type="secondary"
                style="position: relative; right: 2px; background-color: #fff"
              >
                选择
              </datablau-button>
            </el-form-item>
            <el-form-item
              :label="$t('domain.domain.busDefinitionDep')"
              prop="descriptionDepartment"
            >
              <datablau-select
                ref="desOrgChoose"
                v-model="formData.descriptionDepartment"
                clearable
                :placeholder="
                  $t('domain.common.selectionPlaceholder', {
                    name: $t('domain.domain.busDefinitionDep'),
                  })
                "
                @focus.prevent="selectOrganization"
                @clear="blurFormItem('desOrgChoose')"
                style="display: inline-block; width: 437px"
                class="no-dropdown-icon"
              >
                <el-option
                  v-for="item in desOrgOptions"
                  :key="item.id"
                  :label="item.fullName"
                  :value="item.bm"
                ></el-option>
              </datablau-select>
              <datablau-button
                @click="selectOrganization"
                style="position: relative; right: 2px; background-color: #fff"
                type="secondary"
              >
                选择
              </datablau-button>
            </el-form-item>
            <el-form-item
              :label="$t('meta.DS.tableDetail.knowledgeGraph.edges.techLeader')"
              prop="techOwner"
            >
              <datablau-input
                v-model="techOwnerDisplay"
                clearable
                :readonly="!userMap[formData.techOwner]"
                @keydown.native.prevent
                @click.native="preSetTechOwner"
                style="width: 437px"
              ></datablau-input>
              <datablau-button
                @click="setOwner('techOwner')"
                type="secondary"
                style="position: relative; right: 2px; background-color: #fff"
              >
                选择
              </datablau-button>
            </el-form-item>
            <el-form-item
              :label="$t('meta.DS.tableDetail.knowledgeGraph.edges.busiLeader')"
              prop="businessOwner"
            >
              <datablau-input
                v-model="businessOwnerDisplay"
                clearable
                :readonly="!userMap[formData.businessOwner]"
                @keydown.native.prevent
                @click.native="preSetBusinessOwner"
                style="width: 437px"
              ></datablau-input>
              <datablau-button
                @click="setOwner('businessOwner')"
                style="position: relative; right: 2px; background-color: #fff"
                type="secondary"
              >
                选择
              </datablau-button>
            </el-form-item>
            <!--<el-form-item label="资产负责人" prop="managementOwner">
              <datablau-input
                :value="userMap[formData.managementOwner]"
                readonly
              ></datablau-input>
              <datablau-button type="text" @click="setOwner('managementOwner')">
                设置
              </datablau-button>
            </el-form-item>-->
            <el-form-item
              :label="udp.name"
              v-for="(udp, index) in udps.filter(e => e.catalog === '管理属性')"
              :key="index"
              :prop="'udp' + udp.udpId"
            >
              <datablau-input
                v-if="!Array.isArray(udp.candidates)"
                type="textarea"
                :autosize="{ minRows: 2 }"
                v-model="additionalPropertiesObj[udp.udpId]"
                :placeholder="$version.domain.placeholder.property"
                maxlength="500"
                class="maxlengthInput"
                show-word-limit
              ></datablau-input>
              <datablau-select
                v-if="Array.isArray(udp.candidates)"
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
            <!--            <el-form-item label="可见范围">-->
            <!--              <datablau-input></datablau-input>-->
            <!--            </el-form-item>-->
          </div>
        </datablau-form>
      </div>
      <div slot="buttons" class="page-btn-group left-bottom" style="margin: 0">
        <!--<datablau-button type="secondary" @click="onSubmit(false)">
        保存
      </datablau-button>-->
        <datablau-button type="important" @click="onSubmit(true)">
          {{ $t('domain.common.submit') }}
        </datablau-button>
        <datablau-button type="secondary" @click="back">
          {{ $t('common.button.cancel') }}
        </datablau-button>
      </div>
    </datablau-form-submit>
    <div
      v-if="viewMode && !editMode && permission"
      style="
        position: absolute;
        top: 180px;
        left: 0;
        right: 0;
        bottom: 0;
        padding: 10px 20px;
        overflow: auto;
      "
    >
      <view-detail
        v-if="activeName === 'basic' && decodeReady"
        :form-data="formData"
        :requirement-option="requirementOption"
        :udps="udps"
      ></view-detail>
      <mapping
        v-if="activeName === 'mapping'"
        :metric-id="currentItem.domainId"
        :metric-name="currentItem.chineseName"
        :allDimsTree="allDimsTree"
        :allDims="allDims"
      ></mapping>
      <red-alert
        v-if="activeName === 'redAlert'"
        :metric-id="currentItem.domainId"
      ></red-alert>
      <analyze-and-monitor
        v-else-if="activeName === 'analyzeAndMonitor'"
        :metric-id="currentItem.domainId"
      ></analyze-and-monitor>
      <version
        v-else-if="activeName === 'version'"
        :domainId="currentItem.domainId"
        :key="currentItem.domainId"
        :typeIds="formData.categoryId"
        :udps="udps"
      ></version>
      <consanguinity-graph
        v-if="activeName === 'lineage'"
        :key="formData.domainId"
        :data="{ objectId: formData.domainId, type: 'INDEX' }"
      ></consanguinity-graph>
      <knowledgeGraph
        ref="knowledgeGraph"
        v-else-if="activeName === 'graph'"
        :summary="{
          properties: { Id: currentItem.domainId, TypeId: '80010066' },
        }"
      ></knowledgeGraph>
      <data-profiling
        v-else-if="activeName === 'dataProfiling'"
        :metric-id="currentItem.domainId"
      ></data-profiling>
      <access-control
        v-else-if="activeName === 'accessControl'"
        :metric-id="currentItem.domainId"
      ></access-control>
    </div>
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
<style lang="scss">
.multiple-column {
  .dimForm {
    .el-form-item {
      display: inline-block;
      &:first-child {
        margin-right: 10px;
      }
    }
  }
  .el-form-item {
    min-width: 532px;
    &:nth-of-type(odd) {
      margin-right: 92px;
      /*outline: 1px solid indianred;*/
    }
    margin-right: 50px;
    margin-bottom: 18px;
  }
  .el-form-item__error {
    padding-top: 0;
  }
  .datablau-input[type='textarea'] {
    width: 924px;
  }
  &.el-form.page-form textarea {
    @media only screen and (max-width: 1456px) {
      width: 700px;
    }
    width: 924px;
  }
}
</style>
