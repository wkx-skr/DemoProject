<template>
  <div id="add-or-edit" class="qualityRule-detail">
    <datablau-form-submit v-loading="boxLoading">
      <div style="margin: 20px 20px 0">
        <div class="left">
          <el-form
            class="left-part"
            ref="ruleForm"
            :model="form"
            label-width="180px"
            :rules="rules"
            :disabled="isSee"
          >
            <el-form-item
              :label="$t('quality.page.qualityRule.detail.name')"
              prop="name"
            >
              <datablau-input
                clearable
                v-model="form.name"
                maxlength="200"
                style="width: 500px"
                :placeholder="
                  $t('common.placeholder.prefix') +
                  $t('quality.page.qualityRule.detail.name')
                "
                @blur="checkName"
              ></datablau-input>
            </el-form-item>
            <div
              class="db-fieldMessage-title"
              style="margin-top: 40px; margin-bottom: 20px"
            >
              <p class="message-title">
                {{ $t('quality.page.qualityRule.detail.targetBusinessSystem') }}
              </p>
            </div>
            <el-form-item
              :label="$t('quality.page.qualityRule.detail.modelCategories')"
              prop="targetDB"
              class="one"
            >
              <datablau-select
                ref="system"
                style="width: 500px"
                v-model="form.targetDB"
                size="small"
                @change="handleModelCategoryChange()"
                :placeholder="
                  $t('quality.page.qualityRule.detail.modelPlaceholder')
                "
                filterable
                clearable
              >
                <el-option
                  v-for="item in $modelCategories"
                  :key="item.categoryId"
                  :label="item.displayName"
                  :value="item.categoryName"
                ></el-option>
              </datablau-select>
            </el-form-item>
            <div
              class="db-fieldMessage-title"
              style="margin-top: 40px; margin-bottom: 20px"
            >
              <p class="message-title">
                {{ $t('quality.page.qualityRule.detail.ruleContent') }}
              </p>
            </div>
            <el-form-item
              :label="$t('quality.page.qualityRule.detail.ruleTypeWriting')"
              prop="type"
              class="one"
            >
              <datablau-radio v-model="form.type" @change="ruleTypeChange()">
                <el-radio label="SQL">
                  {{ $t('quality.page.qualityRule.detail.type.SQL') }}
                </el-radio>
                <div
                  style="display: inline-block"
                  v-if="$versionFeature['dataquality_NoSQLRuleTypes']"
                >
                  <el-radio label="Regex">
                    {{ $t('quality.page.qualityRule.detail.type.Regex') }}
                  </el-radio>
                  <el-radio label="Function" v-if="$featureMap['FE_DOMAIN']">
                    {{ $t('quality.page.qualityRule.detail.type.Function') }}
                  </el-radio>
                  <el-radio label="Compare">
                    {{ $t('quality.page.qualityRule.detail.type.Compare') }}
                  </el-radio>
                </div>
              </datablau-radio>
            </el-form-item>
            <el-form-item
              :label="$t('quality.page.qualityRule.detail.executeDataSource')"
              prop="modelId"
              v-if="form.type !== 'Compare' && form.type !== 'Function'"
              class="one"
            >
              <datablau-select
                ref="preDataSource"
                style="width: 500px; display: inline-block"
                v-model="form.modelId"
                :placeholder="
                  $t('quality.page.qualityRule.detail.executeDataSource')
                "
                @change="handlePreModelIdChange"
                filterable
                clearable
              >
                <el-option
                  v-for="item in modelList"
                  :key="item.modelId"
                  :label="item.definition"
                  :value="item.modelId"
                ></el-option>
              </datablau-select>
            </el-form-item>
            <el-form-item
              :label="$t('quality.page.qualityRule.detail.RuleBindingMetaData')"
              prop="binddb"
              class="one"
              v-if="
                $versionFeature['dataquality_RuleBindingMetaData'] &&
                form.type !== 'Compare' &&
                form.type !== 'Function'
              "
            >
              <datablau-select
                ref="dataSource"
                style="
                  width: 160px;
                  display: inline-block;
                  margin-bottom: 10px;
                  margin-right: 10px;
                "
                v-model="form.binddb"
                :placeholder="
                  $t('quality.page.qualityRule.detail.targetModelId')
                "
                @clear="initTableAndColumn"
                @change="handleModelIdChange"
                filterable
                clearable
              >
                <el-option
                  v-for="item in modelList"
                  :key="item.modelId"
                  :label="item.definition"
                  :value="item.modelId"
                ></el-option>
              </datablau-select>
              <datablau-select
                style="width: 160px; margin-right: 10px; display: inline-block"
                v-model="form.schemaName"
                :placeholder="
                  $t('quality.page.qualityRule.detail.schemaPlaceholder')
                "
                @clear="clearSchemaName"
                @change="handleSqlModelChange"
                filterable
                clearable
              >
                <el-option
                  v-for="item in schemaArr"
                  :key="item.id"
                  :label="item.name"
                  :value="item.name"
                ></el-option>
              </datablau-select>
              <datablau-select
                filterable
                style="width: 160px; margin-right: 10px; display: inline-block"
                v-model="form.tableId"
                :placeholder="
                  $t('quality.page.qualityRule.detail.tablePlaceholder') +
                  $t('quality.page.qualityRule.detail.view')
                "
                @change="getTableName(form.tableId)"
                remote
                reserve-keyword
                :remote-method="getTableList"
                @clear="initTableAndColumn"
                clearable
              >
                <el-option
                  v-for="item in tableList"
                  :key="item.objectId"
                  :label="item.splicingName"
                  @click.native="initColumn"
                  :value="item.objectId"
                >
                  <datablau-icon
                    style="
                      margin-right: 2px;
                      vertical-align: sub;
                      margin-bottom: 1px;
                    "
                    v-if="item.typeId === 80000004"
                    :data-type="'table'"
                    :icon-type="'svg'"
                    :size="14"
                  ></datablau-icon>
                  <datablau-icon
                    style="
                      margin-right: 2px;
                      vertical-align: sub;
                      margin-bottom: 1px;
                    "
                    v-if="item.typeId === 80500008"
                    :data-type="'view'"
                    :icon-type="'svg'"
                    :size="14"
                  ></datablau-icon>
                  {{ item.splicingName }}
                </el-option>
              </datablau-select>
              <datablau-select
                filterable
                clearable
                style="width: 160px; display: inline-block"
                v-model="form.columnId"
                :placeholder="
                  $t('quality.page.qualityRule.detail.columnPlaceholder')
                "
                remote
                reserve-keyword
                :remote-method="getColumnList"
                @change="getColumnName(form.columnId)"
              >
                <el-option
                  v-for="item in columnList"
                  :key="item.objectId"
                  :label="item.splicingName"
                  :value="item.objectId"
                ></el-option>
              </datablau-select>
            </el-form-item>
            <div v-if="form.type === 'SQL'">
              <el-form-item
                :label="$t('quality.page.qualityRule.detail.sqlContent')"
                prop="content"
              >
                <datablau-input
                  clearable
                  @input="form.sqlPks = []"
                  @change="handleSqlModelChange(false)"
                  type="textarea"
                  :autosize="{ minRows: 8, maxRows: 10 }"
                  style="width: 98%"
                  size="small"
                  :placeholder="$t('quality.page.qualityRule.detail.content')"
                  ref="sqlInput"
                  v-model="form.content"
                ></datablau-input>
                <br />
                <datablau-button
                  v-if="$versionFeature['dataquality_RuleTemplate']"
                  style="margin-top: 10px"
                  v-show="!isSee"
                  type="normal"
                  @click="openDialog"
                >
                  {{ $t('quality.page.qualityRule.detail.templateGeneration') }}
                </datablau-button>
              </el-form-item>

              <el-form-item
                :label="$t('quality.page.qualityRule.detail.autoGeneratePk')"
                prop="autoGeneratePk"
              >
                <datablau-switch
                  style="display: inline-block"
                  v-model="form.autoGeneratePk"
                  @change="autoPkChange"
                ></datablau-switch>
                <span
                  style="
                    color: #999999;
                    font-size: 12px;
                    vertical-align: middle;
                  "
                >
                  <i
                    class="iconfont icon-tips"
                    style="
                      font-size: 14px;
                      margin-right: 7px;
                      margin-left: 15px;
                    "
                  ></i>
                  {{ $t('quality.page.qualityRule.detail.autoGeneratePkTips') }}
                </span>
              </el-form-item>
              <el-form-item
                v-if="!form.autoGeneratePk"
                :label="$t('quality.page.qualityRule.detail.sqlPks')"
                prop="sqlPks"
              >
                <el-select
                  style="width: 98%"
                  multiple
                  v-model="form.sqlPks"
                  @focus="sqlChange"
                  size="small"
                  :placeholder="
                    $t('quality.page.qualityRule.detail.sqlPksPlaceholder')
                  "
                  class="sqlPks-select"
                  clearable
                  filterable
                  default-first-option
                >
                  <el-option
                    v-for="item in sqlPksList"
                    :key="item.label"
                    :label="item.label"
                    @click.native="$refs.ruleForm.validateField('sqlPks')"
                    :value="item.value"
                    :disabled="item.disabled"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                :label="$t('quality.page.qualityRule.detail.countTotalSql')"
                prop="countTotalSql"
              >
                <datablau-input
                  v-if="!showCountTotalSql && !isSee"
                  clearable
                  v-model="form.countTotalSql"
                  @focus="countTotalSql"
                  style="width: 98%"
                  :placeholder="$t('quality.page.qualityRule.detail.pleaseSQL')"
                ></datablau-input>
                <el-input
                  clearable
                  v-if="showCountTotalSql || isSee"
                  type="textarea"
                  ref="countTotalSqlInput"
                  :autosize="{ minRows: 3, maxRows: 10 }"
                  style="width: 98%; display: block"
                  size="small"
                  :placeholder="$t('quality.page.qualityRule.detail.pleaseSQL')"
                  v-model="form.countTotalSql"
                ></el-input>
                <!--<datablau-button
                  style="margin-top: 10px"
                  v-show="!isSee"
                  type="normal"
                  @click="autoCountSQL"
                  :disabled="!form.content"
                >
                  自动生成SQL
                </datablau-button>
                <span
                  v-show="!isSee"
                  style="
                    color: #999999;
                    font-size: 12px;
                    vertical-align: middle;
                  "
                >
                  <i
                    class="iconfont icon-tips"
                    style="
                      font-size: 14px;
                      margin-right: 7px;
                      margin-left: 15px;
                    "
                  ></i>
                  用户需要针对查询结构主表进行统计，该主表为最终用户修改的数据表。尽量避免单条技术规则同时查询多表的质量问题
                </span>-->
              </el-form-item>
              <el-form-item
                :label="$t('quality.page.qualityRule.detail.countProblemSql')"
                prop="countProblemSql"
              >
                <datablau-input
                  v-if="!showCountProblemSql && !isSee"
                  clearable
                  v-model="form.countProblemSql"
                  @focus="countProblemSql"
                  style="width: 98%"
                  :placeholder="$t('quality.page.qualityRule.detail.pleaseSQL')"
                ></datablau-input>
                <el-input
                  clearable
                  v-if="showCountProblemSql || isSee"
                  type="textarea"
                  ref="countProblemSqlInput"
                  :autosize="{ minRows: 3, maxRows: 10 }"
                  style="width: 98%; display: block"
                  size="small"
                  :placeholder="$t('quality.page.qualityRule.detail.pleaseSQL')"
                  v-model="form.countProblemSql"
                ></el-input>
                <!-- <datablau-button
                 style="margin-top: 10px"
                 v-show="!isSee"
                 type="normal"
                 @click="autoProblemSQL"
                 :disabled="!form.content"
               >
                 自动生成SQL
               </datablau-button>
               <span
                 v-show="!isSee"
                 style="
                   color: #999999;
                   font-size: 12px;
                   vertical-align: middle;
                 "
               >
                 <i
                   class="iconfont icon-tips"
                   style="
                     font-size: 14px;
                     margin-right: 7px;
                     margin-left: 15px;
                   "
                 ></i>
                 用户需要针对避免所选主键下数据重复重复，导致统计内容和实际登记问题数据不符
               </span>-->
              </el-form-item>
              <div
                class="db-fieldMessage-title"
                style="margin-top: 40px; margin-bottom: 20px"
              >
                <p class="message-title">
                  {{ $t('quality.page.qualityRule.detail.moreSQL') }}
                </p>
              </div>
              <el-form-item
                :label="$t('quality.page.qualityRule.detail.preconditions')"
              >
                <datablau-input
                  v-if="!showBeforeBox && !isSee"
                  clearable
                  @focus="beforeFocus"
                  style="width: 98%"
                  :placeholder="
                    isSee
                      ? $t('quality.page.qualityRule.detail.preconditionsScan')
                      : $t('quality.page.qualityRule.detail.preconditionsWrite')
                  "
                  v-model="form.preScript"
                ></datablau-input>
                <el-input
                  clearable
                  v-if="showBeforeBox || isSee"
                  type="textarea"
                  ref="beforeInput"
                  :autosize="{ minRows: 3, maxRows: 3 }"
                  style="width: 98%; display: block"
                  size="small"
                  :placeholder="
                    $t('quality.page.qualityRule.detail.beforePlaceholder')
                  "
                  v-model="form.preScript"
                ></el-input>
                <el-checkbox
                  v-if="showBeforeBox || isSee"
                  v-model="form.failOnPreScriptFailure"
                >
                  {{ $t('quality.page.qualityRule.detail.runFailed1') }}
                </el-checkbox>
              </el-form-item>

              <el-form-item
                :label="$t('quality.page.qualityRule.detail.postCondition')"
              >
                <datablau-input
                  v-if="!showAfterBox && !isSee"
                  clearable
                  @focus="afterFocus"
                  style="width: 98%"
                  :placeholder="
                    isSee
                      ? $t('quality.page.qualityRule.detail.postConditionScan')
                      : $t('quality.page.qualityRule.detail.postConditionWrite')
                  "
                  v-model="form.postScript"
                ></datablau-input>
                <el-input
                  clearable
                  v-if="showAfterBox || isSee"
                  type="textarea"
                  ref="afterInput"
                  :autosize="{ minRows: 3, maxRows: 3 }"
                  style="width: 98%; display: block"
                  size="small"
                  :placeholder="
                    $t('quality.page.qualityRule.detail.afterPlaceholder')
                  "
                  v-model="form.postScript"
                ></el-input>
                <el-checkbox
                  v-if="showAfterBox || isSee"
                  v-model="form.failOnPostScriptFailure"
                >
                  {{ $t('quality.page.qualityRule.detail.runFailed2') }}
                </el-checkbox>
              </el-form-item>
            </div>
            <div v-if="form.type === 'Regex'">
              <el-form-item
                :label="$t('quality.page.qualityRule.detail.autoGeneratePk')"
                prop="autoGeneratePk"
              >
                <datablau-switch
                  style="display: inline-block"
                  v-model="form.autoGeneratePk"
                  @change="autoPkChange"
                ></datablau-switch>
                <span
                  style="
                    color: #999999;
                    font-size: 12px;
                    vertical-align: middle;
                  "
                >
                  <i
                    class="iconfont icon-tips"
                    style="
                      font-size: 14px;
                      margin-right: 7px;
                      margin-left: 15px;
                    "
                  ></i>
                  {{ $t('quality.page.qualityRule.detail.autoGeneratePkTips') }}
                </span>
              </el-form-item>
              <el-form-item
                v-if="!form.autoGeneratePk"
                :label="$t('quality.page.qualityRule.detail.resultTablePks')"
                prop="resultTablePks"
              >
                <el-select
                  style="width: 98%; margin: 5px 0 5px 0"
                  multiple
                  v-model="form.resultTablePks"
                  size="small"
                  class="sqlPks-select"
                  :placeholder="
                    $t('el.select.placeholder') +
                    $t('quality.page.qualityRule.detail.resultTablePks')
                  "
                  clearable
                >
                  <el-option
                    v-for="item in pksList"
                    :key="item.objectId"
                    :label="item.physicalName"
                    :value="item.physicalName"
                    @click.native="$refs.ruleForm.validateField('pks')"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                :label="$t('quality.page.qualityRule.detail.matchPattern')"
                class="one"
              >
                <datablau-radio v-model="form.checkMode">
                  <el-radio label="RegexMatch">
                    {{ $t('quality.page.qualityRule.detail.RegexMatch') }}
                  </el-radio>
                  <el-radio label="RegexFind">
                    {{ $t('quality.page.qualityRule.detail.RegexFind') }}
                  </el-radio>
                </datablau-radio>
              </el-form-item>
              <el-form-item
                :label="$t('quality.page.qualityRule.detail.type.Regex')"
                prop="content"
              >
                <datablau-input
                  clearable
                  type="textarea"
                  :autosize="{ minRows: 8, maxRows: 8 }"
                  style="width: 98%; margin-top: 10px"
                  size="small"
                  :placeholder="$t('quality.page.qualityRule.detail.content')"
                  @change="isSuccess = false"
                  v-model="form.content"
                ></datablau-input>
              </el-form-item>
              <el-form-item
                :label="$t('quality.page.qualityRule.detail.checkRowMount')"
              >
                <datablau-input
                  clearable
                  v-model="form.checkRowMount"
                  type="number"
                  maxlength="200"
                  style="width: 98%; margin-top: 5px"
                  :placeholder="
                    $t('quality.page.qualityRule.detail.RowMountPlaceholder')
                  "
                ></datablau-input>
                <br />
              </el-form-item>
            </div>
            <div class="" v-if="form.type === 'Function'">
              <div class="functionBox">
                <el-form
                  label-position="right"
                  label-width="180px"
                  size="small"
                  ref="ruleForm3"
                  :rules="rules2"
                  :model="currentFunction"
                  :disabled="isSee"
                >
                  <el-form-item
                    :label="$t('quality.page.qualityRule.detail.functionModel')"
                    prop="functionModel"
                  >
                    <datablau-select
                      v-model="currentFunction.functionModel"
                      style="width: 500px"
                      @change="handleFunctionModelChange"
                    >
                      <el-option
                        v-for="i in registered"
                        :key="i.uuid"
                        :label="i.name"
                        :value="i.uuid"
                      ></el-option>
                    </datablau-select>
                  </el-form-item>
                  <el-form-item
                    :label="
                      $t('quality.page.qualityRule.detail.funcReturnType')
                    "
                  >
                    {{ currentFunction.funcReturnType }}
                  </el-form-item>
                  <el-form-item
                    :label="$t('quality.page.qualityRule.detail.parameter')"
                  >
                    <p
                      v-if="tipsDataFun === true"
                      style="color: #f56c6c; font-size: 12px"
                    >
                      {{
                        $t('quality.page.qualityRule.paramsTable.requiredWrite')
                      }}
                    </p>
                    <datablau-table
                      style="border: 1px solid #ddd"
                      :data="currentFunction.params"
                    >
                      <el-table-column
                        :label="$t('quality.page.qualityRule.paramsTable.type')"
                        prop="type"
                        show-overflow-tooltip
                      ></el-table-column>
                      <el-table-column
                        :label="$t('quality.page.qualityRule.paramsTable.name')"
                        prop="name"
                        show-overflow-tooltip
                      ></el-table-column>
                      <el-table-column
                        :label="
                          $t('quality.page.qualityRule.paramsTable.description')
                        "
                        prop="description"
                        show-overflow-tooltip
                      ></el-table-column>
                      <el-table-column
                        :label="
                          $t('quality.page.qualityRule.paramsTable.required')
                        "
                        prop="required"
                        show-overflow-tooltip
                        :width="$i18n.locale === 'zh' ? 60 : 80"
                      >
                        <template slot-scope="scope">
                          <span v-if="scope.row.required">
                            {{
                              $t(
                                'quality.page.qualityRule.paramsTable.required'
                              )
                            }}
                          </span>
                          <span v-else>
                            {{
                              $t(
                                'quality.page.qualityRule.paramsTable.noRequired'
                              )
                            }}
                          </span>
                        </template>
                      </el-table-column>
                      <el-table-column
                        :label="
                          $t('quality.page.qualityRule.paramsTable.valueType')
                        "
                        prop="valueType"
                      >
                        <template slot-scope="scope">
                          <el-select
                            v-model="scope.row.valueType"
                            @change="valueTypeChange(scope.row, scope.$index)"
                          >
                            <el-option
                              v-for="(o, k) in VALUE_TYPE"
                              :key="k"
                              :label="o"
                              :value="k"
                            ></el-option>
                          </el-select>
                        </template>
                      </el-table-column>
                      <el-table-column
                        :label="
                          $t('quality.page.qualityRule.paramsTable.value')
                        "
                        prop="value"
                      >
                        <template slot-scope="scope">
                          <div
                            v-if="scope.row.valueType === 'value'"
                            @click="openFunParameterValue(scope.row)"
                          >
                            <el-tooltip
                              class="item"
                              v-if="scope.row.value !== ''"
                              effect="dark"
                              :content="scope.row.value"
                              placement="bottom"
                            >
                              <el-input
                                :disabled="funParameterDialog"
                                v-model="scope.row.value"
                              ></el-input>
                            </el-tooltip>
                            <el-input
                              v-else
                              :disabled="funParameterDialog"
                              v-model="scope.row.value"
                            ></el-input>
                          </div>
                          <el-select
                            v-else
                            v-model="scope.row.value"
                            @change="updateParameters"
                          >
                            <el-option
                              v-for="o in parameterOptions(scope.row)"
                              :key="o.paramId"
                              :label="o.name"
                              :value="o.name"
                            ></el-option>
                          </el-select>
                        </template>
                      </el-table-column>
                    </datablau-table>
                  </el-form-item>
                </el-form>
              </div>
              <div class="functionBox">
                <div
                  class="db-fieldMessage-title"
                  style="margin-bottom: 20px; margin-top: 40px"
                >
                  <p class="message-title">
                    {{ $t('quality.page.qualityRule.detail.associatedData') }}
                    <span style="color: #999; font-size: 12px">
                      <i
                        style="font-size: 14px; margin-right: 7px"
                        class="iconfont icon-tips"
                      ></i>
                      {{
                        $t('quality.page.qualityRule.detail.associatedDataTip')
                      }}
                    </span>
                  </p>
                </div>
                <el-form
                  label-position="right"
                  label-width="180px"
                  size="small"
                  ref="ruleForm4"
                  :rules="rules3"
                  :disabled="isSee"
                  :model="form"
                >
                  <el-form-item
                    :label="
                      $t(
                        'quality.page.qualityRule.detail.chooseModelCategoryId'
                      )
                    "
                    prop="chooseModelCategoryId"
                  >
                    <datablau-select
                      style="width: 500px"
                      v-model="form.chooseModelCategoryId"
                      @change="handleChooseModelChange()"
                      :placeholder="
                        $t('quality.page.qualityRule.detail.funModelCategory')
                      "
                      filterable
                      clearable
                    >
                      <el-option
                        v-for="item in $modelCategories"
                        :key="item.categoryId"
                        :label="item.categoryName"
                        :value="item.categoryId"
                      ></el-option>
                    </datablau-select>
                  </el-form-item>
                  <el-form-item
                    :label="$t('quality.page.qualityRule.detail.dataStandard')"
                  >
                    <datablau-button
                      type="text"
                      @click="addDataStandard"
                      v-if="!isSee"
                      class="iconfont icon-tianjia"
                    >
                      {{
                        $t('quality.page.qualityRule.detail.addDataStandard')
                      }}
                    </datablau-button>
                    <p
                      v-if="tipsData === true"
                      style="
                        color: #f56c6c;
                        font-size: 12px;
                        width: 150px;
                        display: inline-block;
                        padding-left: 10px;
                      "
                    >
                      {{
                        $t('quality.page.qualityRule.detail.dataStandardTips')
                      }}
                    </p>

                    <datablau-table
                      :data="domainArr"
                      style="margin-top: 10px; border: 1px solid #ddd"
                    >
                      <el-table-column
                        :label="
                          $t('quality.page.qualityRule.domainTable.domainCode')
                        "
                        prop="domainCode"
                        show-overflow-tooltip
                      ></el-table-column>
                      <el-table-column
                        :label="
                          $t('quality.page.qualityRule.domainTable.chineseName')
                        "
                        prop="chineseName"
                        show-overflow-tooltip
                      ></el-table-column>
                      <el-table-column
                        :label="
                          $t('quality.page.qualityRule.domainTable.englishName')
                        "
                        prop="englishName"
                        show-overflow-tooltip
                      ></el-table-column>
                      <el-table-column
                        :label="
                          $t('quality.page.qualityRule.domainTable.operation')
                        "
                        prop="type"
                        show-overflow-tooltip
                        :width="$i18n.locale === 'zh' ? 50 : 80"
                      >
                        <template slot-scope="scope">
                          <el-button
                            class="deleteButton"
                            @click="deleteDomainArr(scope.row)"
                            type="text"
                          >
                            {{ $t('common.button.delete') }}
                          </el-button>
                        </template>
                      </el-table-column>
                    </datablau-table>
                  </el-form-item>
                  <el-form-item
                    :label="$t('quality.page.qualityRule.detail.field')"
                  >
                    <datablau-button
                      type="text"
                      @click="addField"
                      v-if="!isSee"
                      class="iconfont icon-tianjia"
                    >
                      {{ $t('quality.page.qualityRule.detail.addField') }}
                    </datablau-button>
                    <datablau-table
                      :data="fieldArr"
                      style="margin-top: 10px; border: 1px solid #ddd"
                      border
                    >
                      <el-table-column
                        min-width="150px"
                        :label="$t('common.page.dataSource')"
                        prop="type"
                        show-overflow-tooltip
                      >
                        <template slot-scope="scope">
                          <datablau-select
                            v-if="!isSee"
                            style="width: 100%"
                            v-model="scope.row.modelId"
                            size="small"
                            :placeholder="
                              $t(
                                'quality.page.qualityRule.detail.targetModelId'
                              )
                            "
                            @clear="fieldArrColumn(scope.row)"
                            @visible-change="getModelLists($event, scope.row)"
                            @change="fieldArrColumn(scope.row)"
                            filterable
                            clearable
                          >
                            <el-option
                              v-for="item in scope.row.modelList"
                              :key="item.modelId"
                              :label="item.definition"
                              :value="item.modelId"
                            ></el-option>
                          </datablau-select>
                          <p v-else>{{ scope.row.definitionModelId }}</p>
                        </template>
                      </el-table-column>
                      <el-table-column
                        min-width="150px"
                        label="Schema"
                        prop="type"
                        show-overflow-tooltip
                      >
                        <template slot-scope="scope">
                          <datablau-select
                            v-if="!isSee"
                            style="width: 100%"
                            v-model="scope.row.schema"
                            :placeholder="
                              $t(
                                'quality.page.qualityRule.detail.schemaPlaceholder'
                              )
                            "
                            filterable
                            clearable
                            @change="
                              schemaFunction(scope.row.schema, scope.row)
                            "
                            @clear="schemaFunctionClear(scope.row)"
                          >
                            <el-option
                              v-for="item in scope.row.schemaArr"
                              :key="item.id"
                              :label="item.name"
                              :value="item.name"
                            ></el-option>
                          </datablau-select>
                          <p v-else>{{ scope.row.schema }}</p>
                        </template>
                      </el-table-column>
                      <el-table-column
                        min-width="150px"
                        :label="$t('quality.page.qualityRule.detail.table')"
                        prop="type"
                        show-overflow-tooltip
                      >
                        <template slot-scope="scope">
                          <datablau-select
                            v-if="!isSee"
                            filterable
                            style="width: 100%"
                            v-model="scope.row.tableId"
                            size="small"
                            :placeholder="
                              $t(
                                'quality.page.qualityRule.detail.tablePlaceholder'
                              ) + $t('quality.page.qualityRule.detail.view')
                            "
                            @change="getFieldArrTableName(scope.row)"
                            remote
                            reserve-keyword
                            :remote-method="
                              $event => {
                                getTableList(
                                  $event,
                                  scope.row.modelId,
                                  scope.row.schema
                                )
                              }
                            "
                            clearable
                            @clear="getFieldArrTableName"
                            @visible-change="getTableLists(scope.row, $event)"
                          >
                            <el-option
                              v-for="item in scope.row.tableList"
                              :key="item.objectId"
                              :label="
                                item.splicingName
                                  ? item.splicingName
                                  : item.physicalName
                              "
                              @click.native="initColumn"
                              :value="item.objectId"
                            >
                              <datablau-icon
                                style="
                                  margin-right: 2px;
                                  vertical-align: sub;
                                  margin-bottom: 1px;
                                "
                                v-if="item.typeId === 80000004"
                                :data-type="'table'"
                                :icon-type="'svg'"
                                :size="14"
                              ></datablau-icon>
                              <datablau-icon
                                style="
                                  margin-right: 2px;
                                  vertical-align: sub;
                                  margin-bottom: 1px;
                                "
                                v-if="item.typeId === 80500008"
                                :data-type="'view'"
                                :icon-type="'svg'"
                                :size="14"
                              ></datablau-icon>
                              {{ item.splicingName }}
                            </el-option>
                          </datablau-select>
                          <p v-else>{{ scope.row.physicalNameTableId }}</p>
                        </template>
                      </el-table-column>
                      <el-table-column
                        min-width="150px"
                        :label="$t('quality.page.qualityRule.detail.field')"
                        prop="type"
                        show-overflow-tooltip
                      >
                        <template slot-scope="scope">
                          <datablau-select
                            v-if="!isSee"
                            filterable
                            clearable
                            style="width: 100%"
                            v-model="scope.row.columnId"
                            size="small"
                            :placeholder="
                              $t(
                                'quality.page.qualityRule.detail.columnPlaceholder'
                              )
                            "
                            remote
                            reserve-keyword
                            :remote-method="
                              $event => {
                                getColumnList($event, scope.row.tableId)
                              }
                            "
                            @visible-change="getColumnLists($event, scope.row)"
                            @change="getFieldArrColumnName(scope.row.columnId)"
                          >
                            <el-option
                              v-for="item in scope.row.columnList"
                              :key="item.objectId"
                              :label="
                                item.splicingName
                                  ? item.splicingName
                                  : item.physicalName
                              "
                              :value="item.objectId"
                            ></el-option>
                          </datablau-select>
                          <p v-else>{{ scope.row.physicalNameColumnId }}</p>
                        </template>
                      </el-table-column>
                      <el-table-column
                        :label="$t('quality.page.qualityRule.detail.operation')"
                        prop="type"
                        show-overflow-tooltip
                        :width="$i18n.locale === 'zh' ? 50 : 80"
                      >
                        <template slot-scope="scope">
                          <datablau-button
                            type="text"
                            v-if="scope.row.delete === true && !isSee"
                            @click="deleteFieldObject(scope.row)"
                          >
                            {{ $t('common.button.delete') }}
                          </datablau-button>
                        </template>
                      </el-table-column>
                    </datablau-table>
                  </el-form-item>
                </el-form>
              </div>
            </div>
            <div class="" v-if="form.type === 'Compare'">
              <el-form-item
                :label="$t('quality.page.qualityRule.detail.dataRelation')"
                style="width: 100%"
              >
                <ul class="compareTypeSelect">
                  <li
                    :class="{
                      active: compareType === 'A_CONTAINS_B',
                      disable: isSee,
                    }"
                    @click="compareTypeChange('A_CONTAINS_B', isSee)"
                  >
                    <p>A⊇B</p>
                    <p>{{ $t('quality.page.qualityRule.detail.AcontainB') }}</p>
                  </li>
                  <li
                    :class="{
                      active: compareType === 'A_EQUALS_B',
                      disable: isSee,
                    }"
                    @click="compareTypeChange('A_EQUALS_B', isSee)"
                  >
                    <p>A=B</p>
                    <p>{{ $t('quality.page.qualityRule.detail.AequalB') }}</p>
                  </li>
                  <li
                    :class="{
                      active: compareType === 'B_CONTAINS_A',
                      disable: isSee,
                    }"
                    @click="compareTypeChange('B_CONTAINS_A', isSee)"
                  >
                    <p>A⊆B</p>
                    <p>{{ $t('quality.page.qualityRule.detail.BcontainA') }}</p>
                  </li>
                </ul>
              </el-form-item>
              <div class="compareBox">
                <p class="compareBox-p">
                  {{ $t('quality.page.qualityRule.detail.dataA') }}
                </p>
                <el-form-item
                  :label="
                    $t('quality.page.qualityRule.detail.executeDataSource')
                  "
                  prop="modelId"
                  class="one"
                  style="width: 100%"
                >
                  <datablau-select
                    style="width: 500px; display: inline-block"
                    v-model="form.modelId"
                    :placeholder="
                      $t('quality.page.qualityRule.detail.executeDataSource')
                    "
                    @change="handlePreModelIdChange"
                    filterable
                    clearable
                  >
                    <el-option
                      v-for="item in modelList"
                      :key="item.modelId"
                      :label="item.definition"
                      :value="item.modelId"
                    ></el-option>
                  </datablau-select>
                </el-form-item>
                <el-form-item
                  v-if="$versionFeature['dataquality_RuleBindingMetaData']"
                  :label="
                    $t('quality.page.qualityRule.detail.RuleBindingMetaData')
                  "
                  prop="binddb"
                  class="one"
                  style="width: 100%"
                >
                  <datablau-select
                    style="
                      width: 160px;
                      display: inline-block;
                      margin-bottom: 10px;
                      margin-right: 10px;
                    "
                    ref="dataSourceA"
                    v-model="form.binddb"
                    :placeholder="
                      $t('quality.page.qualityRule.detail.targetModelId')
                    "
                    @clear="initTableAndColumn"
                    @change="handleModelIdChange"
                    filterable
                    clearable
                  >
                    <el-option
                      v-for="item in modelList"
                      :key="item.modelId"
                      :label="item.definition"
                      :value="item.modelId"
                    ></el-option>
                  </datablau-select>
                  <datablau-select
                    style="
                      width: 160px;
                      margin-right: 10px;
                      display: inline-block;
                    "
                    v-model="form.schemaName"
                    :placeholder="
                      $t('quality.page.qualityRule.detail.schemaPlaceholder')
                    "
                    @clear="clearSchemaName"
                    @change="handleSqlModelChange"
                    filterable
                    clearable
                  >
                    <el-option
                      v-for="item in schemaArr"
                      :key="item.id"
                      :label="item.name"
                      :value="item.name"
                    ></el-option>
                  </datablau-select>
                  <datablau-select
                    filterable
                    style="
                      width: 160px;
                      margin-right: 10px;
                      display: inline-block;
                    "
                    v-model="form.tableId"
                    :placeholder="
                      $t('quality.page.qualityRule.detail.tablePlaceholder') +
                      $t('quality.page.qualityRule.detail.view')
                    "
                    @change="getTableName(form.tableId)"
                    remote
                    reserve-keyword
                    :remote-method="getTableList"
                    @clear="initTableAndColumn"
                    clearable
                  >
                    <el-option
                      v-for="item in tableList"
                      :key="item.objectId"
                      :label="item.splicingName"
                      @click.native="initColumn"
                      :value="item.objectId"
                    >
                      <datablau-icon
                        style="
                          margin-right: 2px;
                          vertical-align: sub;
                          margin-bottom: 1px;
                        "
                        v-if="item.typeId === 80000004"
                        :data-type="'table'"
                        :icon-type="'svg'"
                        :size="14"
                      ></datablau-icon>
                      <datablau-icon
                        style="
                          margin-right: 2px;
                          vertical-align: sub;
                          margin-bottom: 1px;
                        "
                        v-if="item.typeId === 80500008"
                        :data-type="'view'"
                        :icon-type="'svg'"
                        :size="14"
                      ></datablau-icon>
                      {{ item.splicingName }}
                    </el-option>
                  </datablau-select>
                  <datablau-select
                    filterable
                    clearable
                    style="width: 160px; display: inline-block"
                    v-model="form.columnId"
                    :placeholder="
                      $t('quality.page.qualityRule.detail.columnPlaceholder')
                    "
                    remote
                    reserve-keyword
                    :remote-method="getColumnList"
                    @change="getColumnName(form.columnId)"
                  >
                    <el-option
                      v-for="item in columnList"
                      :key="item.objectId"
                      :label="item.splicingName"
                      :value="item.objectId"
                    ></el-option>
                  </datablau-select>
                </el-form-item>
                <el-form-item
                  :label="$t('quality.page.qualityRule.detail.sqlContent')"
                  prop="content"
                >
                  <datablau-input
                    clearable
                    @input="form.sqlPks = []"
                    @change="handleSqlModelChange(false)"
                    type="textarea"
                    :autosize="{ minRows: 8, maxRows: 10 }"
                    style="width: 98%"
                    size="small"
                    :placeholder="$t('quality.page.qualityRule.detail.content')"
                    ref="sqlInput"
                    v-model="form.content"
                  ></datablau-input>
                </el-form-item>
                <el-form-item
                  v-if="!form.autoGeneratePk"
                  :label="$t('quality.page.qualityRule.detail.sqlPks')"
                  prop="sqlPks"
                >
                  <el-select
                    style="width: 98%; margin: 5px 0 5px 0"
                    class="sqlPks-select"
                    multiple
                    v-model="form.sqlPks"
                    @focus="sqlChange"
                    size="small"
                    :placeholder="
                      $t('quality.page.qualityRule.detail.sqlPksPlaceholder')
                    "
                    clearable
                    filterable
                    default-first-option
                  >
                    <el-option
                      v-for="item in sqlPksList"
                      :key="item.label"
                      :label="item.label"
                      @click.native="$refs.ruleForm.validateField('sqlPks')"
                      :value="item.value"
                      :disabled="item.disabled"
                    ></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item
                  :label="$t('quality.page.qualityRule.detail.countTotalSql')"
                  prop="countTotalSql"
                >
                  <datablau-input
                    clearable
                    v-model="form.countTotalSql"
                    style="width: 98%"
                    type="textarea"
                    :autosize="{ minRows: 3, maxRows: 3 }"
                    :placeholder="
                      $t('quality.page.qualityRule.detail.pleaseSQL')
                    "
                  ></datablau-input>
                </el-form-item>
              </div>
              <div class="compareBox">
                <p class="compareBox-p compareBox-pB">
                  {{ $t('quality.page.qualityRule.detail.dataB') }}
                </p>
                <el-form-item
                  :label="$t('quality.page.qualityRule.detail.targetModelId')"
                  prop="modelIdB"
                  class="one"
                  style="width: 100%"
                >
                  <datablau-select
                    style="width: 500px"
                    ref="dataSourceB"
                    v-model="form.modelIdB"
                    :placeholder="
                      $t('el.select.placeholder') +
                      $t('quality.page.qualityRule.detail.targetModelId')
                    "
                    @clear="initTableAndColumnB"
                    @change="handleSqlModelChangeB"
                    filterable
                    clearable
                  >
                    <el-option
                      v-for="item in modelList"
                      :key="item.modelId"
                      :label="item.definition"
                      :value="item.modelId"
                    ></el-option>
                  </datablau-select>
                </el-form-item>
                <el-form-item
                  :label="$t('quality.page.qualityRule.detail.sqlContent')"
                  prop="formattedContentB"
                >
                  <datablau-input
                    clearable
                    @input="form.sqlPksB = []"
                    @change="handleSqlModelChangeB(false)"
                    type="textarea"
                    :autosize="{ minRows: 8, maxRows: 10 }"
                    style="width: 98%"
                    size="small"
                    :placeholder="$t('quality.page.qualityRule.detail.content')"
                    ref="sqlInputB"
                    v-model="form.formattedContentB"
                  ></datablau-input>
                </el-form-item>
                <el-form-item
                  :label="$t('quality.page.qualityRule.detail.sqlPks')"
                  prop="sqlPksB"
                >
                  <el-select
                    style="width: 98%; margin: 5px 0 5px 0"
                    multiple
                    v-model="form.sqlPksB"
                    @focus="sqlChange('dataB')"
                    size="small"
                    :placeholder="
                      $t('quality.page.qualityRule.detail.sqlPksPlaceholder')
                    "
                    clearable
                    filterable
                    default-first-option
                  >
                    <el-option
                      v-for="item in sqlPksList"
                      :key="item.label"
                      :label="item.label"
                      @click.native="$refs.ruleForm.validateField('sqlPks')"
                      :value="item.value"
                      :disabled="item.disabled"
                    ></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item
                  :label="$t('quality.page.qualityRule.detail.countTotalSql')"
                  prop="countTotalSqlB"
                >
                  <datablau-input
                    clearable
                    v-model="form.countTotalSqlB"
                    style="width: 98%"
                    type="textarea"
                    :autosize="{ minRows: 3, maxRows: 3 }"
                    :placeholder="
                      $t('quality.page.qualityRule.detail.pleaseSQL')
                    "
                  ></datablau-input>
                </el-form-item>
              </div>
            </div>
            <div
              class="db-fieldMessage-title"
              style="margin-top: 40px; margin-bottom: 10px"
            >
              <p class="message-title">
                {{ $t('quality.page.qualityRule.detail.ruleParameters') }}
              </p>
              <span
                style="color: #999999; font-size: 12px; vertical-align: middle"
              >
                <i
                  class="iconfont icon-tips"
                  style="font-size: 14px; margin-right: 7px; margin-left: 15px"
                ></i>
                {{ $t('quality.page.qualityRule.detail.ruleParametersTips') }}
              </span>
            </div>
            <el-form-item label-width="0">
              <list-in-rule
                ref="listInRule"
                :item-id="ruleDataObj ? ruleDataObj.id : -1"
                from-rule
                @update-parameterIds="updateParameterIds"
              ></list-in-rule>
            </el-form-item>
          </el-form>
        </div>
        <div class="right">
          <el-form
            ref="ruleForm2"
            label-position="top"
            label-width="120px"
            :model="form"
            :disabled="isSee"
            :rules="rules"
          >
            <el-form-item
              :label="$t('quality.page.qualityRule.detail.ruleType')"
              prop="bigClassSelectOption"
            >
              <el-cascader
                style="width: 300px"
                :options="classOptions"
                @active-item-change="handleActiveClassOptions"
                @change="handleChangeClassOptions"
                v-model="bigsmallValue"
                placement="bottom-start"
              ></el-cascader>
            </el-form-item>
            <el-form-item prop="bizTypeSelectOption">
              <span slot="label">
                <span class="span-box">
                  <span>
                    {{
                      $t('quality.page.qualityRule.table.bizTypeSelectOption')
                    }}
                  </span>
                  <el-tooltip>
                    <span slot="content" style="line-height: 1.5em">
                      {{
                        $t(
                          'quality.page.qualityRule.table.bizTypeSelectOptionTips'
                        )
                      }}
                    </span>
                    <i
                      class="iconfont icon-tips"
                      style="display: inline-block"
                    ></i>
                  </el-tooltip>
                </span>
              </span>
              <datablau-select
                v-model="form.bizTypeSelectOption"
                :placeholder="$t('el.select.placeholder')"
                style="width: 300px"
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
            <el-form-item
              :label="$t('quality.page.qualityRule.detail.importance')"
            >
              <datablau-select
                v-model="form.importance"
                :placeholder="$t('el.select.placeholder')"
                style="width: 300px"
                filterable
                clearable
              >
                <el-option
                  v-for="item in importanceList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </datablau-select>
            </el-form-item>
            <el-form-item
              :label="$t('common.page.dataQualityRules')"
              prop="buRuleId"
            >
              <datablau-select
                v-model="form.buRuleId"
                filterable
                clearable
                @clear="clearableBuRuleId"
                style="width: 300px"
                remote
                reserve-keyword
                :remote-method="getBusinessRulesList"
                :placeholder="
                  $t('quality.page.qualityRule.detail.selectOrInput') +
                  $t('common.page.dataQualityRules')
                "
                @change="buRuleIdChange"
              >
                <el-option
                  v-for="item in businessRules"
                  :label="item.name"
                  :key="item.id"
                  :value="item.id"
                ></el-option>
              </datablau-select>
            </el-form-item>
            <el-form-item
              :label="$t('quality.page.qualityRule.detail.taskOwner')"
              prop="taskOwner"
            >
              <datablau-select
                v-model="form.taskOwner"
                filterable
                clearable
                style="width: 300px"
                :placeholder="
                  $t('quality.page.qualityRule.detail.taskOwnerPlaceholder')
                "
              >
                <el-option
                  v-for="item in taskOwnerOption"
                  :label="item.label"
                  :key="item.value"
                  :value="item.value"
                ></el-option>
              </datablau-select>
            </el-form-item>
            <el-tooltip
              v-if="$i18n.locale === 'zh'"
              style="transform: translate(60px, 26px)"
            >
              <span slot="content" style="line-height: 1.5em">
                {{ $t('quality.page.qualityRule.detail.maxErrorRowTips') }}
              </span>
              <i class="iconfont icon-tips" style="display: inline-block"></i>
            </el-tooltip>
            <el-tooltip v-else style="transform: translate(92px, 26px)">
              <span slot="content" style="line-height: 1.5em">
                {{ $t('quality.page.qualityRule.detail.maxErrorRowTips') }}
              </span>
              <i class="iconfont icon-tips" style="display: inline-block"></i>
            </el-tooltip>
            <el-form-item
              :label="$t('quality.page.qualityRule.detail.maxErrorRow')"
            >
              <datablau-input
                clearable
                v-model="form.maxErrorRow"
                style="width: 300px"
                @input="
                  form.maxErrorRow =
                    form.maxErrorRow >= 10000000
                      ? form.maxErrorRow.slice(0, 9)
                      : form.maxErrorRow
                "
                :placeholder="
                  $t('common.placeholder.prefix') +
                  $t('quality.page.qualityRule.detail.maxErrorRow')
                "
              ></datablau-input>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div class="footer-button" slot="buttons">
        <datablau-button
          type="important"
          v-if="!isSee"
          @click.stop="test"
          :loading="testLoading"
        >
          {{ $t('common.button.test') }}
        </datablau-button>
        <datablau-button
          type="important"
          v-if="
            !isSee &&
            !($isShort && ruleDataObj && ruleDataObj.publicState === 'A')
          "
          :disabled="!isSuccess"
          @click="submit"
          :loading="submitLoading"
        >
          {{ $t('common.button.save') }}
        </datablau-button>
        <datablau-button
          type="important"
          @click="submit('publish')"
          v-if="!isSee && $isShort"
          :disabled="!isSuccess"
        >
          {{ $t('common.button.saveAndPublish') }}
        </datablau-button>
        <datablau-button type="secondary" v-if="!isSee" @click="preBack">
          {{ $t('common.button.close') }}
        </datablau-button>
        <div v-if="isSee && otherJump" style="display: inline-block">
          <datablau-tooltip
            effect="dark"
            placement="top-start"
            :content="
              hasUnclosedTask.toString() === '1'
                ? this.$t('quality.page.qualityRule.disabledEdit1')
                : this.$t('quality.page.qualityRule.disabledEdit2')
            "
            :disabled="
              hasUnclosedTask.toString() !== '1' &&
              hasUnclosedTask.toString() !== '2' &&
              hasUnclosedTask.toString() !== '3'
            "
          >
            <datablau-button
              :disabled="
                hasUnclosedTask.toString() === '1' ||
                hasUnclosedTask.toString() === '2' ||
                hasUnclosedTask.toString() === '3'
              "
              type="important"
              style="margin-right: 10px"
              v-if="
                $auth['QUALITY_TECHNICAL_REGULATION_EDIT'] &&
                auth &&
                ruleDataObj.publicState !== 'X' &&
                ruleDataObj.publicState !== 'C' &&
                ((!$isShort && !ruleDataObj.processing) || $isShort) &&
                !ruleDataObj.children?.length &&
                (ruleDataObj.copyId
                  ? ruleDataObj.applyState !== 'PROCESSING'
                  : true)
              "
              @click="goEdit(ruleDataObj.id)"
            >
              {{ $t('common.button.edit') }}
            </datablau-button>
          </datablau-tooltip>
        </div>
        <datablau-button type="secondary" v-if="isSee" @click="back">
          {{ $t('common.button.return') }}
        </datablau-button>
      </div>
    </datablau-form-submit>
    <el-dialog
      :title="$t('quality.page.qualityRule.SQLmetadata.title')"
      v-loading="tableLoading"
      append-to-body
      :visible.sync="tableDialog"
      width="1100px"
      id="sql-lineage"
    >
      <el-table
        v-if="currentSqlLineageErrMsg === ''"
        height="600px"
        :data="cols"
        class="datablau-table"
        size="small"
      >
        <el-table-column
          prop="output"
          :label="$t('quality.page.qualityRule.SQLmetadata.output')"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :label="$t('quality.page.qualityRule.SQLmetadata.systemName')"
          prop="categoryName"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :label="$t('quality.page.qualityRule.SQLmetadata.dataSourceName')"
          show-overflow-tooltip
        >
          <template>
            <span>{{ dataSourceName }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="schema"
          label="schema"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="table"
          :label="$t('quality.page.qualityRule.SQLmetadata.table')"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="col"
          :label="$t('quality.page.qualityRule.SQLmetadata.col')"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :label="$t('quality.page.qualityRule.SQLmetadata.operation')"
        >
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="changeCol(scope.row)">
              {{ $t('quality.page.qualityRule.SQLmetadata.change') }}
            </el-button>
            <el-button
              type="text"
              size="small"
              @click="delelteCol(scope.$index)"
            >
              {{ $t('common.button.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <p v-else class="error">{{ currentSqlLineageErrMsg }}</p>
    </el-dialog>
    <el-dialog
      :title="$t('quality.page.qualityRule.SQLmetadata.title')"
      v-loading="tableLoading"
      append-to-body
      :visible.sync="tableDialogB"
      width="1100px"
      id="sql-lineage"
    >
      <p>{{ $t('quality.page.qualityRule.detail.dataA') }}</p>
      <el-table
        v-if="currentSqlLineageErrMsg === ''"
        height="600px"
        :data="colsA"
        class="datablau-table"
        size="small"
      >
        <el-table-column
          prop="outputDisplay"
          :label="$t('quality.page.qualityRule.SQLmetadata.output')"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :label="$t('quality.page.qualityRule.SQLmetadata.systemName')"
          show-overflow-tooltip
          prop="categoryName"
        ></el-table-column>
        <el-table-column
          :label="$t('quality.page.qualityRule.SQLmetadata.dataSourceName')"
          show-overflow-tooltip
        >
          <template>
            <span>{{ dataSourceNameA }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="schema"
          label="schema"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="table"
          :label="$t('quality.page.qualityRule.SQLmetadata.table')"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="col"
          :label="$t('quality.page.qualityRule.SQLmetadata.col')"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :label="$t('quality.page.qualityRule.SQLmetadata.operation')"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              size="small"
              @click="delelteCol(scope.$index, 'A')"
            >
              {{ $t('common.button.delete') }}
            </el-button>
            <el-button type="text" size="small" @click="changeCol(scope.row)">
              {{ $t('quality.page.qualityRule.SQLmetadata.change') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <p v-else class="error">{{ currentSqlLineageErrMsg }}</p>
      <p>{{ $t('quality.page.qualityRule.detail.dataB') }}</p>
      <el-table
        v-if="currentSqlLineageErrMsg === ''"
        height="600px"
        :data="colsB"
        class="datablau-table"
        size="small"
      >
        <el-table-column
          prop="outputDisplay"
          :label="$t('quality.page.qualityRule.SQLmetadata.output')"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :label="$t('quality.page.qualityRule.SQLmetadata.systemName')"
          show-overflow-tooltip
          prop="categoryName"
        ></el-table-column>
        <el-table-column
          :label="$t('quality.page.qualityRule.SQLmetadata.dataSourceName')"
          show-overflow-tooltip
        >
          <template>
            <span>{{ dataSourceNameB }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="schema"
          label="schema"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="table"
          :label="$t('quality.page.qualityRule.SQLmetadata.table')"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="col"
          :label="$t('quality.page.qualityRule.SQLmetadata.col')"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :label="$t('quality.page.qualityRule.SQLmetadata.operation')"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              size="small"
              @click="delelteCol(scope.$index, 'B')"
            >
              {{ $t('common.button.delete') }}
            </el-button>
            <el-button
              type="text"
              size="small"
              @click="changeCol(scope.row, 'B')"
            >
              {{ $t('quality.page.qualityRule.SQLmetadata.change') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <p v-else class="error">{{ currentSqlLineageErrMsg }}</p>
    </el-dialog>
    <el-dialog
      v-loading="tableLoading"
      :title="$t('quality.page.qualityRule.metadataMapping')"
      :visible.sync="rowDialogShow"
      append-to-body
      :close-on-click-modal="false"
      width="600px"
    >
      <el-form :model="rowForm" ref="rowForm" label-width="100px">
        <el-form-item
          :label="$t('quality.page.qualityRule.SQLmetadata.output')"
          class="one"
        >
          <el-input
            style="width: 400px"
            v-model="rowForm.output"
            size="small"
            :disabled="true"
          ></el-input>
        </el-form-item>
        <el-form-item
          :label="$t('quality.page.qualityRule.detail.chooseModelCategoryId')"
          prop="targetDB"
          class="one"
        >
          <el-input
            :value="rowForm.categoryName"
            style="width: 400px"
            readonly
          ></el-input>
        </el-form-item>
        <el-form-item
          :label="$t('quality.page.qualityRule.detail.targetModelId')"
          prop="modelId"
          class="one"
          v-if="form.type !== 'Compare' && form.type !== 'Function'"
        >
          <el-select
            :disabled="true"
            style="width: 400px"
            v-model="form.modelId"
            size="small"
            :placeholder="
              $t('el.select.placeholder') +
              $t('quality.page.qualityRule.detail.targetModelId')
            "
            @clear="initTableAndColumn"
            @change="initTableAndColumn"
            filterable
            clearable
          >
            <el-option
              v-for="item in modelList"
              :key="item.modelId"
              :label="item.definition"
              :value="item.modelId"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="schema" prop="" class="one">
          <el-select
            v-model="currentSchema"
            :placeholder="$t('el.select.placeholder') + 'schema'"
            clearable
            @change="handleSchemaChange"
            style="width: 400px"
          >
            <el-option
              v-for="item in schemaList"
              :key="item"
              :label="item"
              :value="item"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          :label="$t('quality.page.qualityRule.detail.table')"
          prop=""
          class="one"
        >
          <el-select
            ref="sqlTableSelect"
            filterable
            style="width: 400px"
            v-model="rowForm.tableId"
            size="small"
            :placeholder="$t('quality.page.qualityRule.detail.sqlTableSelect')"
            @change="getTableName2"
            remote
            reserve-keyword
            :remote-method="getAllTableList"
            @clear="initTableAndColumn"
            clearable
          >
            <el-option
              v-for="item in allTableList"
              :key="item.objectId"
              :label="item.physicalName"
              @click.native="handleOptClick(item.physicalName)"
              :value="item.objectId"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          :label="$t('quality.page.qualityRule.detail.field')"
          prop=""
          class="one"
        >
          <el-select
            filterable
            clearable
            style="width: 400px"
            v-model="rowForm.columnId"
            size="small"
            :placeholder="
              $t('el.select.placeholder') +
              $t('quality.page.qualityRule.detail.columnPlaceholder')
            "
          >
            <el-option
              v-for="item in columnList3"
              :key="item.objectId"
              :label="item.physicalName"
              :value="item.objectId"
              @click.native="handleColClick(item.physicalName)"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <span slot="footer">
        <el-button
          style="width: 70px"
          size="mini"
          @click="rowDialogShow = false"
        >
          {{ $t('common.button.cancel') }}
        </el-button>
        <el-button
          style="width: 70px"
          type="primary"
          size="mini"
          @click="saveChangeCol"
        >
          {{ $t('quality.page.qualityRule.confirm') }}
        </el-button>
      </span>
    </el-dialog>

    <datablau-dialog
      class="jobs-sta"
      width="600px"
      :title="$t('quality.page.qualityRule.generatesql.title')"
      :visible.sync="showDialog"
      append-to-body
      :close-on-click-modal="false"
      style="position: relative; overflow-x: hidden"
    >
      <el-form
        :label-width="$i18n.locale === 'zh' ? '100px' : '120px'"
        :model="form"
        :rules="rules"
        style="max-height: 60vh; overflow: auto"
      >
        <el-form-item :label="$t('common.page.ruleTemplate')" required>
          <el-select
            v-model="templateId"
            size="small"
            :placeholder="
              $t(
                'quality.page.qualityRule.generatesql.placeholder.selectOrInput'
              )
            "
            style="width: 90%"
            remote
            reserve-keyword
            :remote-method="getTemplateList"
            filterable
            @change="templateChange"
            clearable
          >
            <el-option
              v-for="item in templateList"
              :key="item.id"
              :label="item.templateName"
              @click.native="initTemplateObj(item.sql)"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="template.includes('table1')"
          required
          :label="$t('quality.page.qualityRule.generatesql.item.table1')"
        >
          <el-select
            filterable
            style="width: 90%; margin-right: 4%"
            v-model="templateTC.tableName1"
            size="small"
            :placeholder="
              $t('el.select.placeholder') +
              $t('quality.page.qualityRule.generatesql.item.table1')
            "
            remote
            reserve-keyword
            :remote-method="getTableListTemplate"
            @focus="getTableListTemplate('', '', '', 'table')"
          >
            <el-option
              v-for="item in tableListTemplate"
              :key="item.objectId"
              :label="item.splicingName"
              @click.native="initTemplateColumn(item.objectId, 'table1')"
              :value="item.physicalName"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="template.includes('view1')"
          required
          :label="$t('quality.page.ruleTemplate.generatesql.item.view1')"
        >
          <el-select
            filterable
            style="width: 90%; margin-right: 4%"
            v-model="templateTC.viewName1"
            size="small"
            :placeholder="
              $t('quality.page.ruleTemplate.generatesql.placeholder.viewName1')
            "
            remote
            reserve-keyword
            :remote-method="getTableListTemplate"
            @focus="getTableListTemplate('', '', '', 'view')"
          >
            <el-option
              v-for="item in tableListTemplate"
              :key="item.objectId"
              :label="item.physicalName"
              @click.native="initTemplateColumn(item.objectId, 'view1')"
              :value="item.physicalName"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="template.includes('column1')"
          required
          :label="$t('quality.page.qualityRule.generatesql.item.field1')"
        >
          <el-select
            filterable
            clearable
            style="width: 90%"
            v-model="templateTC.columnName1"
            size="small"
            :placeholder="
              $t('el.select.placeholder') +
              $t('quality.page.qualityRule.generatesql.item.field1')
            "
            remote
            reserve-keyword
            :remote-method="initTemplateColumn"
            @focus="initTemplateColumn"
          >
            <el-option
              v-for="item in columnList1"
              :key="item.objectId"
              :label="item.splicingName"
              :value="item.physicalName"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="template.includes('table2')"
          :label="$t('quality.page.qualityRule.generatesql.item.table2')"
          required
        >
          <el-select
            filterable
            style="width: 90%"
            v-model="templateTC.tableName2"
            size="small"
            :placeholder="
              $t('el.select.placeholder') +
              $t('quality.page.qualityRule.generatesql.item.table2')
            "
            remote
            reserve-keyword
            :remote-method="getTableListTemplate"
            @focus="getTableListTemplate('', '', '', 'table')"
          >
            <el-option
              v-for="item in tableListTemplate"
              :key="item.objectId"
              :label="item.splicingName"
              @click.native="initTemplateColumn2(item.objectId, 'table2')"
              :value="item.physicalName"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="template.includes('view2')"
          required
          :label="$t('quality.page.ruleTemplate.generatesql.item.view2')"
        >
          <el-select
            filterable
            style="width: 90%; margin-right: 4%"
            v-model="templateTC.viewName2"
            size="small"
            :placeholder="
              $t('quality.page.ruleTemplate.generatesql.placeholder.viewName2')
            "
            remote
            reserve-keyword
            :remote-method="getTableListTemplate"
            @focus="getTableListTemplate('', '', '', 'view')"
          >
            <el-option
              v-for="item in tableListTemplate"
              :key="item.objectId"
              :label="item.physicalName"
              @click.native="initTemplateColumn2(item.objectId, 'view2')"
              :value="item.physicalName"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="template.includes('column2')"
          :label="$t('quality.page.qualityRule.generatesql.item.field2')"
          required
        >
          <el-select
            clearable
            filterable
            style="width: 90%"
            v-model="templateTC.columnName2"
            size="small"
            :placeholder="
              $t('el.select.placeholder') +
              $t('quality.page.qualityRule.generatesql.item.field2')
            "
            remote
            reserve-keyword
            :remote-method="initTemplateColumn2"
            @focus="initTemplateColumn2"
          >
            <el-option
              v-for="item in columnList2"
              :key="item.objectId"
              :label="item.physicalName"
              :value="item.physicalName"
            ></el-option>
          </el-select>
        </el-form-item>
        <!--        <el-form-item v-if="template === 2" label="外键关联表" required>-->
        <!--          <el-select v-model="templateTC.tableName2" size="small" placeholder="请选择" style="width: 90%" filterable>-->
        <!--            <el-option-->
        <!--              v-for="item in tableList"-->
        <!--              :key="item.objectId"-->
        <!--              :label="item.physicalName"-->
        <!--              @click.native="initTemplateColumn(2, item.objectId)"-->
        <!--              :value="item.physicalName">-->
        <!--            </el-option>-->
        <!--          </el-select>-->
        <!--        </el-form-item>-->
        <!--        <el-form-item v-if="template === 2" label="外键关联列" required>-->
        <!--          <el-select v-model="templateTC.columnName2" size="small" placeholder="请选择" style="width: 90%" filterable>-->
        <!--            <el-option-->
        <!--              v-for="item in columnList2"-->
        <!--              :key="item.objectId"-->
        <!--              :label="item.physicalName"-->
        <!--              :value="item.physicalName">-->
        <!--            </el-option>-->
        <!--          </el-select>-->
        <!--        </el-form-item>-->
        <el-form-item
          v-if="template.includes('[[presetParameter]]')"
          :label="$t('quality.page.qualityRule.generatesql.item.parameterCode')"
          required
        >
          <el-select
            v-model="templateTC.preRawValue"
            size="small"
            :placeholder="$t('el.select.placeholder')"
            style="width: 90%"
            filterable
            clearable
          >
            <el-option
              v-for="item in preRawData"
              :key="item.value"
              :label="item.name"
              :value="item.name"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="template.includes('[[comp]]')"
          :label="$t('quality.page.qualityRule.generatesql.item.rangeOptions')"
          required
        >
          <el-select
            v-model="templateTC.valueRange"
            size="small"
            :placeholder="$t('el.select.placeholder')"
            style="width: 90%"
            filterable
            clearable
          >
            <el-option
              v-for="item in valueRangeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="template.includes('[[comp]]')"
          :label="$t('quality.page.qualityRule.generatesql.item.dataRange')"
          required
        >
          <el-input
            clearable
            v-if="templateTC.valueRange !== 'BETWEEN'"
            style="width: 90%"
            v-model="templateTC.dataRange"
            type="number"
            size="small"
            maxlength="256"
            :placeholder="
              $t('quality.page.qualityRule.generatesql.placeholder.number')
            "
          ></el-input>
          <el-input
            clearable
            v-if="templateTC.valueRange === 'BETWEEN'"
            style="width: 42%; margin-right: 5.5%"
            v-model="templateTC.min"
            type="number"
            size="small"
            maxlength="256"
            :placeholder="
              $t('quality.page.qualityRule.generatesql.placeholder.lowerLimit')
            "
          ></el-input>
          <el-input
            clearable
            v-if="templateTC.valueRange === 'BETWEEN'"
            style="width: 42%"
            v-model="templateTC.max"
            type="number"
            size="small"
            maxlength="256"
            :placeholder="
              $t('quality.page.qualityRule.generatesql.placeholder.upperLimit')
            "
          ></el-input>
        </el-form-item>
        <!--        <el-form-item v-if="template === 6" label="标准代码" required>-->
        <!--          <el-input clearable maxlength="100"-->
        <!--                    size="mini"-->
        <!--                    v-model="standardCodes"-->
        <!--                    placeholder="请选择"-->
        <!--                    style="width: 90%"-->
        <!--                    @click.native="openSelectCode()"-->
        <!--          ></el-input>-->
        <!--          <el-select v-model="standardCode" multiple size="small" placeholder="请选择" style="width: 90%" filterable clearable>-->
        <!--            <el-option-->
        <!--              v-for="item in standardCodeList"-->
        <!--              :key="item.name"-->
        <!--              :label="item.name"-->
        <!--              :value="item.name">-->
        <!--            </el-option>-->
        <!--          </el-select>-->
        <!--        </el-form-item>-->
        <el-form-item
          v-if="template.includes('[[num]]')"
          :label="$t('quality.page.qualityRule.generatesql.item.fieldLength')"
          required
        >
          <el-input
            clearable
            style="width: 90%"
            v-model="templateTC.columnLength"
            type="number"
            size="small"
            maxlength="256"
            :placeholder="
              $t(
                'quality.page.qualityRule.generatesql.placeholder.numberLength'
              )
            "
          ></el-input>
        </el-form-item>
        <datablau-button
          type="important"
          :disabled="toSqlDisabled"
          @click="toSql"
          :style="{ marginLeft: $i18n.locale === 'zh' ? '18%' : '120px' }"
        >
          {{ $t('quality.page.qualityRule.generatesql.title') }}
        </datablau-button>
        <el-form-item
          :label="$t('quality.page.qualityRule.generatesql.item.generatedsql')"
        >
          <el-input
            clearable
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 8 }"
            style="width: 90%; margin-top: 10px"
            size="small"
            :placeholder="$t('quality.page.qualityRule.detail.pleaseSQL')"
            v-model="templateTC.sql"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <datablau-button
          type="cancel"
          @click="showDialog = false"
        ></datablau-button>
        <datablau-button
          type="important"
          :disabled="toSqlDisabled || !templateTC.sql"
          @click="handleOk"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
      </div>
    </datablau-dialog>
    <el-dialog
      :title="$t('quality.page.qualityRule.standardCode')"
      :visible.sync="selectCode"
      width="1200px"
      append-to-body
      :close-on-click-modal="false"
    >
      <standard-code
        @quoteCode="quoteCode"
        @closeDialog="selectCode = false"
        :isName="true"
      ></standard-code>
    </el-dialog>
    <el-dialog
      :title="
        $t('common.button.edit') +
        $t('quality.page.qualityRule.parameterValues')
      "
      :visible.sync="funParameterDialog"
      width="600px"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-input
        ref="input-of-funParameterDialog"
        type="textarea"
        :rows="2"
        :placeholder="
          $t('common.placeholder.prefix') +
          $t('quality.page.qualityRule.parameterValues')
        "
        v-model="funParameterValue"
      ></el-input>
      <div style="margin-top: 30px; text-align: right">
        <el-button
          style="width: 70px"
          type="primary"
          size="mini"
          @click="saveFunParameterValue"
        >
          {{ $t('common.button.ok') }}
        </el-button>
        <el-button
          style="width: 70px"
          size="mini"
          @click="funParameterDialog = false"
        >
          {{ $t('common.button.cancel') }}
        </el-button>
      </div>
    </el-dialog>

    <standard-selector></standard-selector>
  </div>
</template>

<script>
import addOrEdit from './addOrEdit.js'
export default addOrEdit
</script>

<style lang="scss" scoped>
@import '~@/next/components/basic/color.sass';
.functionBox {
  // background: #f6f6f6;
  // width: 64%;
  // margin-bottom: 20px;
  // padding: 15px 0;
}
.boxDiv {
  margin-top: 64px;
  padding-left: 20px;
  overflow-y: auto;
  padding-bottom: 40px;
  min-width: 1100px;
  .one {
    padding-top: 10px;
    width: 63%;
  }
  .right {
    position: absolute;
    top: -1%;
    right: 3%;
    width: 25%;
  }
}
.autoCreate {
  width: 62%;
  height: 30px;
  span {
    float: right;
    color: #4386f5;
    display: inline-block;
    transform: translateY(15px);
    cursor: pointer;
  }
}
.list {
  border: 1px solid #dcdcdc;
  position: absolute;
  top: 40px;
  left: 0;
  background-color: #fff;
  z-index: 999;
  max-height: 250px;
  overflow-y: auto;
  overflow-x: hidden;
  li {
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    padding: 5px 14px;
    cursor: pointer;
    font-size: small;
  }
  li:hover {
    background-color: #f5f5f5;
  }
}
.qualityRule-detail {
  position: absolute;
  top: 44px;
  left: 0px;
  right: 0px;
  bottom: 0;

  .left {
    width: 72%;
    display: inline-block;
    padding-right: 20px;
    overflow: hidden;
    .left-part {
      border-right: 1px solid $border-color;
      padding-right: 20px;
      margin-bottom: 20px;
      .compareTypeSelect {
        li {
          display: inline-block;
          max-width: 350px;
          width: 32%;
          min-width: 160px;
          border-radius: 2px;
          border: 1px solid $border-color;
          padding: 10px;
          cursor: pointer;
          transition: border ease-in-out 0.3s;
          &:nth-of-type(2) {
            margin-left: 10px;
            margin-right: 10px;
          }
          p {
            line-height: 1.6;
            &:first-child {
              font-size: 14px;
              color: $text-default;
              font-weight: 500;
              transition: color ease-in-out 0.3s;
            }
            &:last-child {
              font-size: 12px;
              color: $text-disabled;
              transition: color ease-in-out 0.3s;
            }
          }
          &.active {
            border: 1px solid $primary-color;
            p {
              &:first-child {
                color: $primary-color;
              }
              &:last-child {
                color: $primary-color;
              }
            }
          }
          &.disable {
            pointer-events: none;
          }
        }
      }
      .compareBox {
        // background: #f5f5f5;
        // width: 50%;
        margin-bottom: 20px;
        margin-right: 1%;
        padding-bottom: 16px;
        border: 1px solid $border-color;
        .compareBox-p {
          font-size: 14px;
          padding-left: 16px;
          padding-top: 10px;
          padding-bottom: 10px;
          background: $table-hover-color;
          margin-bottom: 10px;
          &.compareBox-pB {
            background: rgba(102, 191, 22, 0.1);
          }
        }
        .oneA {
          background: $table-hover-color;
          padding: 10px;
          border-radius: 2px 0px 0px 2px;
          // border: 1px solid $border-color;
          border-bottom: none;
        }
      }
    }
  }
  .right {
    width: 28%;
    display: inline-block;
    // position: absolute;
    // top: 54px;
    // right: 20px;
    // width: 25%;
  }
}
</style>
<style lang="scss">
.qualityRule-detail {
  .el-form-item {
    margin-bottom: 16px;
    &:last-child {
      margin-bottom: 0;
    }
  }
  .sqlPks-select {
    .el-input__inner {
      border-radius: 2px;
      padding-top: 0;
    }
  }
  .compareSql {
    .el-textarea__inner {
      border: 1px solid transparent;
    }
  }
}
.el-tooltip__popper {
  max-width: 60% !important;
}
.el-table__header {
  width: 100% !important;
}
.el-table__body {
  width: 100% !important;
}
.el-form-item__error {
  padding-top: 2px;
}
.el-dialog__footer {
  text-align: right;
}
#sql-lineage {
  .error {
    color: red;
    font-size: 16px;
    text-align: center;
    height: 600px;
    overflow: auto;
  }
}
</style>
