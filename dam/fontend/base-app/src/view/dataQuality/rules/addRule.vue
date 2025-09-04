<template>
  <div class="tab-page addRule-content">
    <datablau-form-submit>
      <div style="margin: 64px 20px 0">
        <el-form
          v-if="writable"
          class="page-form1"
          label-position="right"
          label-width="180px"
          :model="ruleContent"
          ref="ruleForm"
          :disabled="!writable"
          :rules="rules"
        >
          <el-form-item
            :label="$t('quality.page.dataQualityRules.table.ruleName')"
            prop="name"
          >
            <datablau-input
              v-model="ruleContent.name"
              class="maxlengthInput"
              show-word-limit
              maxlength="40"
              style="width: 500px"
              :placeholder="
                $t('common.placeholder.prefix') +
                $t('quality.page.dataQualityRules.table.ruleName')
              "
            ></datablau-input>
          </el-form-item>
          <el-form-item
            :label="$t('quality.page.dataQualityRules.table.ruleCatalog')"
            prop="catalog"
          >
            <datablau-cascader
              :disabled="$isShort ? !!relTechRules.length : false"
              v-model="ruleContent.catalog"
              :options="options"
              :props="optionProps"
              style="width: 500px"
              @change="handleChangeCatalog"
            ></datablau-cascader>
          </el-form-item>
          <el-form-item
            :label="$t('quality.page.dataQualityRules.table.type')"
            :rules="{ required: true }"
          >
            <datablau-radio
              v-model="ruleContent.category"
              :disabled="$isShort ? !!relTechRules.length : false"
            >
              <el-radio v-for="i in queryArr" :label="i.id" :key="i.id">
                {{ i.optionValue }}
              </el-radio>
            </datablau-radio>
          </el-form-item>
          <el-form-item
            :label="$t('quality.page.dataQualityRules.ruleTable.businessType')"
          >
            <datablau-select
              v-model="ruleContent.businessType"
              :placeholder="
                $t(
                  'quality.page.dataQualityRules.ruleTable.businessTypePlaceholder'
                )
              "
              style="width: 240px"
              filterable
              clearable
            >
              <el-option
                v-for="item in businessTypeList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </datablau-select>
          </el-form-item>
          <!-- <el-form-item
            :label="$t('quality.page.dataQualityRules.applicableSystem')"
          >
            <el-select
              class="system-select"
              v-model="checkedmodelCategoryIds"
              multiple
              filterable
              style="width: 500px"
              :label="
                $t('quality.page.dataQualityRules.applicableSystemPlaceholder')
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
            </el-select>
          </el-form-item> -->
          <el-form-item :label="$t('system.user.organization')" prop="bms">
            <datablau-input
              clearable
              class="width"
              maxlength="100"
              readonly
              v-model="ruleContent.bms"
              :placeholder="
                $t('common.placeholder.selectPrefix') +
                $t('system.user.organization')
              "
              @focus="addBm"
            ></datablau-input>
          </el-form-item>
          <!-- <el-form-item
            :label="$t('quality.page.dataQualityRules.table.releaseStatus')"
            :rules="{ required: true }"
          >
            <datablau-switch
              v-model="ruleContent.state"
              @change="stateChange"
              :inactive-value="0"
              :active-value="1"
              inactive-text=""
              :active-text="$t('quality.page.dataQualityRules.released')"
            ></datablau-switch>
          </el-form-item> -->
          <el-form-item
            :label="$t('quality.page.dataQualityRules.table.description')"
          >
            <datablau-input
              type="textarea"
              style="750px"
              :autosize="{ minRows: 5, maxRows: 80 }"
              v-model="ruleContent.description"
              :placeholder="
                $t('common.placeholder.prefix') +
                $t('quality.page.dataQualityRules.table.description')
              "
            ></datablau-input>
          </el-form-item>
        </el-form>
      </div>
      <div class="quality-details" style="margin: 64px 20px 0" v-if="!writable">
        <div class="row-title">
          <div class="title" style="margin-left: 0px">
            {{ ruleContent.name }}
          </div>
          <datablau-button
            type="important"
            v-if="ruleContent.writable"
            @click="writable = true"
            style="float: right"
          >
            {{ $t('common.button.edit') }}
          </datablau-button>
        </div>
        <div>
          <description :value="ruleContent.description"></description>
        </div>
        <div class="row-section">
          <div
            class="db-fieldMessage-title"
            style="margin-top: 40px; margin-bottom: 20px"
          >
            <p class="message-title">
              {{ $t('quality.page.dataQualityRules.essential') }}
            </p>
          </div>
        </div>
        <div class="item">
          <div
            class="label"
            :style="{ width: $i18n.locale === 'zh' ? '6em' : '13em' }"
          >
            {{ $t('quality.page.dataQualityRules.table.ruleCatalog') }}
          </div>
          <div
            class="value"
            :style="{ 'margin-left': $i18n.locale === 'zh' ? '6em' : '13em' }"
          >
            <span class="tree-icon folder"></span>
            {{ ruleContent.catalog }}
          </div>
        </div>
        <div class="item">
          <div
            class="label"
            :style="{ width: $i18n.locale === 'zh' ? '6em' : '13em' }"
          >
            {{ $t('quality.page.dataQualityRules.table.type') }}
          </div>
          <div
            class="value"
            :style="{ 'margin-left': $i18n.locale === 'zh' ? '6em' : '13em' }"
          >
            {{ searchQuery(ruleContent.category) }}
          </div>
        </div>
        <div class="item">
          <div
            class="label"
            :style="{ width: $i18n.locale === 'zh' ? '6em' : '13em' }"
          >
            {{ $t('quality.page.dataQualityRules.table.releaseStatus') }}
          </div>
          <div
            class="value"
            :style="{ 'margin-left': $i18n.locale === 'zh' ? '6em' : '13em' }"
          >
            <Status :type="ruleContent.state"></Status>
          </div>
        </div>
        <div class="item">
          <div
            class="label"
            :style="{ width: $i18n.locale === 'zh' ? '6em' : '13em' }"
          >
            {{ $t('quality.page.dataQualityRules.table.creator') }}
          </div>
          <div
            class="value"
            :style="{ 'margin-left': $i18n.locale === 'zh' ? '6em' : '13em' }"
          >
            {{ ruleContent.creator }}
          </div>
        </div>
        <div class="item">
          <div
            class="label"
            :style="{ width: $i18n.locale === 'zh' ? '6em' : '13em' }"
          >
            {{ $t('quality.page.dataQualityRules.table.createTime') }}
          </div>
          <div
            class="value"
            :style="{ 'margin-left': $i18n.locale === 'zh' ? '6em' : '13em' }"
          >
            {{ $timeFormatter(ruleContent.createTime) }}
          </div>
        </div>
        <div class="item">
          <div
            class="label"
            :style="{ width: $i18n.locale === 'zh' ? '6em' : '13em' }"
          >
            {{ $t('quality.page.dataQualityRules.table.implementedRules') }}
          </div>
          <div
            class="value"
            :style="{ 'margin-left': $i18n.locale === 'zh' ? '6em' : '13em' }"
          >
            {{ ruleContent.techRuleNumber }}
          </div>
        </div>

        <div class="item full-width">
          <div
            class="label"
            :style="{ width: $i18n.locale === 'zh' ? '6em' : '13em' }"
          >
            {{ $t('quality.page.dataQualityRules.applicableSystem') }}
          </div>
          <div
            class="value"
            :style="{ 'margin-left': $i18n.locale === 'zh' ? '6em' : '13em' }"
          >
            <el-tag
              disable-transitions
              v-for="tag in checkedmodelCategoryIds.map(
                item => $modelCategoriesMap[item]
              )"
              :key="tag"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>
        <div
          class="db-fieldMessage-title"
          style="margin-top: 40px; margin-bottom: 20px"
        >
          <p class="message-title">
            {{ $t('quality.page.dataQualityRules.table.implementedRules') }}
          </p>
        </div>
        <div class="qualityRule-content" style="height: 500px">
          <datablau-table
            ref="multipleTable"
            :data="tableData"
            tooltip-effect="dark"
            style="width: 100%; height: 100%"
            height="100%"
            size="mini"
            :data-selectable="option.selectable"
            :auto-hide-selection="option.autoHideSelectable"
            :show-column-selection="option.showColumnSelection"
            :column-selection="option.columnSelection"
            :border="option.columnResizable"
          >
            <el-table-column
              prop="name"
              :label="$t('quality.page.dataQualityRules.ruleTable.name')"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              :label="
                $t('quality.page.dataQualityRules.ruleTable.modelCategory')
              "
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <span>
                  {{ scope.row.modelCategoryId | systemFilter(systemList) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column
              :label="
                $t(
                  'quality.page.dataQualityRules.ruleTable.bigClassSelectOption'
                )
              "
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <span>{{ scope.row.bigClassSelectOption }}</span>
              </template>
            </el-table-column>
            <el-table-column
              :label="
                $t(
                  'quality.page.dataQualityRules.ruleTable.smallClassSelectOption'
                )
              "
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <span>{{ scope.row.smallClassSelectOption }}</span>
              </template>
            </el-table-column>
            <el-table-column
              :label="
                $t(
                  'quality.page.dataQualityRules.ruleTable.bizTypeSelectOption'
                )
              "
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <span>{{ scope.row.bizTypeSelectOption }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="creator"
              :label="$t('quality.page.dataQualityRules.ruleTable.creator')"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <span>
                  {{
                    getPeopleName([scope.row.creator])
                      ? getPeopleName([scope.row.creator])
                      : scope.row.creator
                  }}
                </span>
              </template>
            </el-table-column>
            <el-table-column
              prop="createTime"
              :label="$t('quality.page.dataQualityRules.ruleTable.createTime')"
              :formatter="$timeFormatter"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              :label="$t('quality.page.dataQualityRules.ruleTable.operation')"
              width="150"
              align="center"
            >
              <template slot-scope="scope">
                <el-button
                  type="text"
                  size="small"
                  @click="addEdit(scope.row, true)"
                >
                  {{ $t('common.button.scan') }}
                </el-button>
              </template>
            </el-table-column>
          </datablau-table>
        </div>
      </div>
      <div class="footer-button" slot="buttons">
        <div class="button-box">
          <datablau-button
            type="important"
            @click="confirmAddRule"
            v-if="writable && !($isShort && ruleData && ruleData.state === 'A')"
            :disabled="!queryArr.length"
          >
            {{ $t('common.button.save') }}
          </datablau-button>
          <datablau-button
            type="important"
            @click="confirmAddRule('publish')"
            v-if="writable && $isShort"
            :disabled="!queryArr.length"
          >
            {{ $t('common.button.saveAndPublish') }}
          </datablau-button>
          <datablau-button type="secondary" @click="removeAddRule">
            {{ $t('common.button.close') }}
          </datablau-button>
        </div>
      </div>
    </datablau-form-submit>
  </div>
</template>

<script>
import addRule from './addRule.js'
export default addRule
</script>
<style lang="scss">
@import '~@/next/components/basic/color.sass';
.addRule-content {
  .el-form-item {
    margin-bottom: 16px;
  }
  .seeDetail {
    .el-form-item {
      margin-bottom: 0px;
    }
  }
  .el-form.page-form1 .el-cascader,
  .el-form.page-form1 .el-input {
    width: 500px;
  }
  .el-form.page-form1 textarea {
    width: 750px;
  }
  .system-select {
    .el-input {
      width: 750px !important;
    }
    .el-input__inner {
      border-radius: 2px;
    }
    .el-input__inner:hover {
      border-color: $primary-color;
    }
    .el-tag.el-tag--info {
      background-color: $table-hover-color;
      border-color: $table-hover-color;
      color: $primary-color;
      padding-left: 10px;
      padding-right: 14px;
    }
    .el-tag.el-tag--info .el-tag__close {
      background: none;
      width: 20px;
      right: -14px;
      height: 24px;
      transform: scale(1);
      line-height: 22px;
      border-radius: 0;
      color: $primary-color;
    }
    .el-tag.el-tag--info .el-tag__close:hover {
      color: $primary-color;
      background: $table-click-color;
    }
  }
}
</style>
