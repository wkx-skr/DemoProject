<template>
  <div
    class="apply-detail-page"
    v-loading="loading"
    :style="
      $route.query.taskId
        ? 'margin-top: -40px;padding-top: 30px;max-height:99vh'
        : ''
    "
  >
    <datablau-tabs v-model="activeName">
      <el-tab-pane
        class="change-form"
        :label="$t('userPane.myTodo.changeCompare')"
        name="first"
        v-if="
          !hideTopForm &&
          applyDetailData.processType === '变更目录申请' &&
          ((typeId && typeId.value !== '2') || !typeId)
        "
      >
        <div>
          <div class="apply-reason" v-if="formData.applyReason">
            <div class="reason-title">
              <span class="iconfont icon-change change-icon"></span>
              <span class="change-text">变更原因</span>
            </div>
            <div class="reason-content">{{ formData.applyReason.value }}</div>
          </div>
          <el-row :gutter="10">
            <el-col :span="12">
              <div
                style="
                  width: 450px;
                  height: 34px;
                  line-height: 34px;
                  background: #f5f5f5;
                  text-align: center;
                "
              >
                {{ $t('userPane.myTodo.beforeChange') }}
              </div>
              <datablau-form
                class="page-form"
                ref="form"
                :model="formData"
                inline
              >
                <el-form-item
                  style="width: 40%"
                  v-for="item in Object.keys(formData.oldCatalogData).filter(item => item !== hideAuthCategoryName)"
                  label-width="100"
                  class="jjjjjj"
                  :class="{
                    oldChange: isCatalogChange(
                      item,
                      formData.oldCatalogData[item],
                      formData.newCatalogData[item]
                    ),
                  }"
                  :key="item"
                  :label="catalogChangeLabelMap[item] + ':'"
                >
                  {{ formatCatalogValue(item, formData.oldCatalogData[item]) }}
                </el-form-item>
              </datablau-form>
            </el-col>
            <el-col :span="12">
              <div
                style="
                  width: 450px;
                  height: 34px;
                  line-height: 34px;
                  color: #66bf16;
                  background: rgba(102, 191, 22, 0.1);
                  text-align: center;
                "
              >
                {{ $t('userPane.myTodo.afterChange') }}
              </div>
              <datablau-form
                class="page-form"
                ref="form"
                :model="formData"
                inline
              >
                <el-form-item
                  style="width: 40%"
                  v-for="item in Object.keys(formData.newCatalogData).filter(item => item !== hideAuthCategoryName)"
                  label-width="100"
                  class="jjjjjj"
                  :class="{
                    newChange: isCatalogChange(
                      item,
                      formData.oldCatalogData[item],
                      formData.newCatalogData[item]
                    ),
                  }"
                  :key="item"
                  :label="catalogChangeLabelMap[item] + ':'"
                >
                  {{ formatCatalogValue(item, formData.newCatalogData[item]) }}
                </el-form-item>
              </datablau-form>
            </el-col>
          </el-row>
        </div>
        <div class="form-outer"></div>
      </el-tab-pane>
      <el-tab-pane
        :label="$t('userPane.myTodo.changeCompare')"
        name="first"
        v-if="
          !hideTopForm &&
          applyDetailData.processType === '数据标准_修改' &&
          !myDone &&
          ((typeId && typeId.value !== '2') || !typeId)
        "
      >
        <el-row :gutter="10" style="padding-top: 10px">
          <el-col :span="12">
            <div
              style="
                width: 450px;
                height: 34px;
                line-height: 34px;
                background: #f5f5f5;
                text-align: center;
              "
            >
              {{ $t('userPane.myTodo.beforeChange') }}
            </div>
            <standard-scan
              v-if="domainId && udps"
              :domain-id="domainId"
              :label-text="labelText()"
              :udps="udps"
              @updating-domain-id="setUpdatingDomainId"
              @base-dom="setBaseDom"
            ></standard-scan>
          </el-col>
          <el-col :span="12">
            <div
              style="
                width: 450px;
                height: 34px;
                line-height: 34px;
                color: #66bf16;
                background: rgba(102, 191, 22, 0.1);
                text-align: center;
              "
            >
              {{ $t('userPane.myTodo.afterChange') }}

              <!--<div
                class="green-checkbox"
                style="
                  font-size: 12px;
                  position: relative;
                  top: -34px;
                  right: -168px;
                "
              >
                <el-checkbox v-model="checkBoxValueTrue"></el-checkbox>
                仅显示修改
              </div>-->
            </div>
            <standard-scan
              v-if="updatingDomainId && udps"
              :domain-id="updatingDomainId"
              :label-text="labelText()"
              :udps="udps"
              :base-dom="baseDom"
            ></standard-scan>
          </el-col>
        </el-row>
        <div class="form-outer"></div>
      </el-tab-pane>
      <el-tab-pane
        :label="$t('userPane.myTodo.applyForm')"
        name="second"
        v-else-if="
          !hideTopForm &&
          applyDetailData.processType !== '技术规则' &&
          applyDetailData.processType !== '数据申请' &&
          applyDetailData.processType !== '数据权限申请' &&
          [
            '变更目录申请',
            '发布目录申请',
            '下线目录申请',
            '资产发布申请',
            '资产下线申请',
          ].indexOf(applyDetailData.processType) === -1 &&
          ((typeId && typeId.value !== '2') || !typeId)
        "
      >
        <div class="item-title"></div>
        <div
          class="table-form-box"
          v-if="
            applyDetailData.processType === '资产发布申请' ||
            applyDetailData.processType === '资产下线申请'
          "
        >
          <div class="table-box">
            <datablau-table
              :data="tableFormData"
              height="100%"
              v-loading="tableFormLoading"
            >
              <el-table-column
                prop="assetsName"
                min-width="120"
                :label="$t('userPane.myTodo.assetsName')"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                prop="assetsSecurityLevel"
                min-width="120"
                :label="'userPane.myTodo.safeLevel'"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                prop="assetsType"
                min-width="100"
                :label="'userPane.myTodo.assetsType'"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  <div
                    class="type-class"
                    :style="getAssetsType(scope.row.assetsType, 2)"
                  >
                    {{ getAssetsType(scope.row.assetsType, 1) }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                prop="currentStatus"
                min-width="100"
                :label="'userPane.myTodo.assetsStatus'"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ transState(scope.row.currentStatus) }}
                </template>
              </el-table-column>
              <el-table-column
                prop="authoritativeSource"
                min-width="100"
                :label="'userPane.myTodo.source'"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                prop="catalogName"
                min-width="150"
                :label="'userPane.myTodo.catalogName'"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                prop="deptName"
                min-width="120"
                :label="'userPane.myTodo.deptName'"
                show-overflow-tooltip
              ></el-table-column>
            </datablau-table>
          </div>
          <div class="table-form-btn">
            <datablau-pagination
              @current-change="handlePageChange"
              @size-change="handleAssetSizeChange"
              :current-page.sync="tableFormParams.pageNum"
              :page-sizes="[10, 20, 50, 100]"
              :page-size="tableFormParams.pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="formTotal"
              class="page"
            ></datablau-pagination>
          </div>
        </div>
        <!-- 新版指标,5表示原子和衍生指标,6表示派生指标,此处需要使用字符串类型的5,6       -->
        <div class="apply-form" v-else-if="['5', '6'].includes(typeId.value)">
          <metrics-apply-form :raw-data="applyDetailData"></metrics-apply-form>
        </div>
        <div class="apply-form" v-else>
          <el-form
            class="page-form"
            label-position="right"
            size="small"
            ref="form"
            label-width="160"
            :rules="formRules"
            :model="formData"
            inline
          >
            <el-form-item
              v-for="item in formData"
              label-width="100"
              class="jjjjjj"
              :key="item.code"
              :label="item.name"
              :required="item.required"
            >
              <datablau-input
                clearable
                v-if="item.name === '数据标准id' || item.name === '代码编号'"
                size="mini"
                v-model="item.value"
                disabled
              ></datablau-input>
              <datablau-input
                v-else-if="item.name === '标准编码'"
                :value="formatterCode(item.value)"
                size="mini"
                disabled
                clearable
                maxlength="100"
              ></datablau-input>
              <el-select
                v-else-if="item.name === '敏感度'"
                size="mini"
                v-model="item.value"
                clearable
                style="width: 100%"
                :disabled="!couldEdit"
              >
                <el-option
                  style="width: 245px"
                  v-for="(item, index) in sensitiveList"
                  :key="item"
                  :value="item"
                  :label="item"
                ></el-option>
              </el-select>
              <datablau-input
                maxlength="100"
                v-else-if="item.name === '相关数据'"
                type="text"
                size="mini"
                v-model="relationData"
                clearable
                :disabled="!couldEdit"
                @focus="selectRelateData"
              ></datablau-input>
              <el-select
                v-else-if="item.name === '与相关数据关系'"
                size="mini"
                v-model="item.value"
                clearable
                style="width: 100%"
                :disabled="!couldEdit || !relationData"
              >
                <el-option
                  style="width: 245px"
                  v-for="(item, index) in relationList"
                  :key="item"
                  :value="item"
                  :label="item"
                ></el-option>
              </el-select>
              <el-select
                v-else-if="item.name === '标准来源'"
                size="mini"
                v-model="item.value"
                clearable
                style="width: 100%"
                :disabled="!couldEdit"
              >
                <el-option
                  v-for="item in sourceArr"
                  style="width: 245px"
                  :key="item"
                  :label="item"
                  :value="item"
                ></el-option>
              </el-select>
              <datablau-input
                maxlength="100"
                v-else-if="item.name === '标准依据'"
                type="text"
                size="mini"
                v-model="item.value"
                clearable
                :disabled="!couldEdit"
              ></datablau-input>
              <datablau-input
                maxlength="100"
                v-else-if="item.code === 'relationDomain'"
                type="text"
                size="mini"
                v-model="relatedDomain"
                clearable
                :disabled="!couldEdit"
              ></datablau-input>
              <datablau-input
                maxlength="100"
                v-else-if="item.name === '参考文档'"
                type="text"
                size="mini"
                v-model="relatedDocument"
                clearable
                :disabled="!couldEdit"
              ></datablau-input>
              <el-select
                v-else-if="item.name === '业务数据类型'"
                size="mini"
                v-model="item.value"
                clearable
                filterable
                style="width: 100%"
                :disabled="!couldEdit"
              >
                <el-option
                  v-for="item in dataTypeList"
                  style="width: 245px"
                  :key="item"
                  :label="item"
                  :value="item"
                ></el-option>
              </el-select>
              <datablau-input
                clearable
                maxlength="100"
                v-else-if="item.name === '数据格式'"
                size="mini"
                v-model="item.value"
                :disabled="!couldEdit"
                @blur="translateData(item.value)"
              ></datablau-input>
              <datablau-input
                clearable
                maxlength="100"
                v-else-if="item.name === '非空'"
                size="mini"
                disabled
                v-model="isNotNull"
              ></datablau-input>
              <el-tooltip
                :open-delay="800"
                v-else-if="item.name === '修饰维度'"
                :disabled="!dimsCodes"
                class="item"
                effect="light"
                :content="dimsCodes"
                placement="top"
              >
                <datablau-input
                  clearable
                  maxlength="100"
                  size="mini"
                  disabled
                  v-model="dimsCodes"
                ></datablau-input>
              </el-tooltip>
              <el-tooltip
                :open-delay="800"
                v-else-if="item.type === 'STRING'"
                :disabled="!item.value"
                class="item"
                effect="light"
                :content="item.value"
                placement="top"
              >
                <datablau-input
                  clearable
                  maxlength="100"
                  size="mini"
                  v-model="item.value"
                  :disabled="
                    !couldEdit ||
                    item.name === '技术数据类型' ||
                    item.name === '数据长度' ||
                    item.name === '数据精度'
                  "
                ></datablau-input>
              </el-tooltip>
              <el-tooltip
                :open-delay="800"
                v-else-if="item.type === 'ORGANIZATION'"
                :disabled="!item.value"
                class="item"
                effect="light"
                :content="$utils.getBranchNameByBm(item.value)"
                placement="top"
              >
                <datablau-input
                  clearable
                  maxlength="100"
                  size="mini"
                  v-model="item.value"
                  :disabled="!couldEdit"
                ></datablau-input>
              </el-tooltip>
              <datablau-input
                clearable
                maxlength="100"
                v-else-if="item.type === 'LONG'"
                size="mini"
                v-model.number="item.value"
                :disabled="!couldEdit"
              ></datablau-input>
              <div
                v-else-if="item.type === 'BOOLEAN'"
                style="
                  display: inline-block;
                  width: 340px;
                  padding-left: 10px;
                  padding-right: 30px;
                "
              >
                {{ item.value ? '是' : '否' }}
              </div>
              <el-select
                v-else-if="item.type === 'ENUM'"
                size="mini"
                v-model="item.value"
                :disabled="!couldEdit"
              >
                <el-option
                  v-for="o in item.enums"
                  :value="o"
                  :label="o"
                  :key="o"
                ></el-option>
              </el-select>
              <div
                v-else-if="item.type === 'DATE'"
                style="
                  display: inline-block;
                  width: 340px;
                  padding-left: 10px;
                  padding-right: 30px;
                "
              >
                {{ $dateFormatter(parseInt(item.value)) }}
              </div>
            </el-form-item>
            <el-form-item
              v-for="item in additionalProperties"
              :key="item.name"
              :label="item.name"
              :label-width="100"
            >
              <datablau-input
                :value="item.value"
                size="mini"
                disabled
                clearable
                maxlength="100"
              ></datablau-input>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
      <el-tab-pane
        class="catalog-apply-form"
        :label="$t('userPane.myTodo.catalogInfo')"
        name="catalogue"
        v-if="
          applyDetailData.processType === '发布目录申请' ||
          applyDetailData.processType === '下线目录申请'
        "
      >
        <div class="item-title"></div>

        <div class="apply-form">
          <div class="apply-reason" v-if="formData.applyReason">
            <div class="reason-title">
              <span class="iconfont icon-change change-icon"></span>
              <span class="change-text">申请原因</span>
            </div>
            <div class="reason-content">{{ formData.applyReason.value }}</div>
          </div>
          <datablau-form inline>
            <el-form-item
              v-for="item in Object.values(formData).filter(
                item => item.code !== 'applyReason'
              )"
              label-width="100"
              class="jjjjjj"
              :key="item.code"
              :label="item.name + ':'"
              :required="item.required"
              style="width: 45%"
            >
              {{ item.value }}
            </el-form-item>
          </datablau-form>
        </div>
      </el-tab-pane>
      <el-tab-pane
        :label="$t('userPane.myTodo.assetList')"
        name="assetList"
        v-if="
          applyDetailData.processType === '资产发布申请' ||
          applyDetailData.processType === '资产下线申请'
        "
        class="assets-apply-form"
      >
        <div class="item-title"></div>
        <div class="table-form-box">
          <div class="apply-reason" v-if="formData.applyReason">
            <div class="reason-title">
              <span class="iconfont icon-change change-icon"></span>
              <span class="change-text">申请原因</span>
            </div>
            <div class="reason-content">{{ formData.applyReason.value }}</div>
          </div>
          <div class="table-box">
            <datablau-form-submit>
              <datablau-table
                :data="tableFormData"
                height="100%"
                v-loading="tableFormLoading"
              >
                <el-table-column
                  prop="assetsName"
                  min-width="120"
                  label="资产名称"
                  show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                  prop="assetsSecurityLevel"
                  min-width="120"
                  label="数据安全等级"
                  show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                  prop="assetsType"
                  min-width="100"
                  label="资产类型"
                  show-overflow-tooltip
                >
                  <template slot-scope="scope">
                    <div
                      class="type-class"
                      :style="getAssetsType(scope.row.assetsType, 2)"
                    >
                      {{ getAssetsType(scope.row.assetsType, 1) }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="currentStatus"
                  min-width="100"
                  label="资产状态"
                  show-overflow-tooltip
                >
                  <template slot-scope="scope">
                    {{ transState(scope.row.currentStatus) }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="authoritativeSource"
                  min-width="100"
                  label="权威来源"
                  show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                  prop="catalogName"
                  min-width="150"
                  label="所在资产目录"
                  show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                  prop="deptName"
                  min-width="120"
                  label="数据权属"
                  show-overflow-tooltip
                ></el-table-column>
              </datablau-table>
              <div class="table-form-btn" slot="buttons">
                <datablau-pagination
                  @current-change="handlePageChange"
                  @size-change="handleAssetSizeChange"
                  :current-page.sync="tableFormParams.pageNum"
                  :page-sizes="[10, 20, 50, 100]"
                  :page-size="tableFormParams.pageSize"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="formTotal"
                  class="page"
                ></datablau-pagination>
              </div>
            </datablau-form-submit>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane
        :label="$t('userPane.myTodo.applyForm')"
        name="fifth"
        v-if="applyDetailData.processType === '数据权限申请'"
      >
        <div class="authority-wrapper" v-if="formData.info">
          <ul>
            <li v-if="!isTechRule">
              <span>数据源：</span>
              <datablau-input
                style="display: inline-block"
                :title="JSON.parse(formData.info.value).parentPhysicalName"
                disabled
                v-model="JSON.parse(formData.info.value).parentPhysicalName"
              ></datablau-input>
              <span style="margin-left: 20px">schema：</span>
              <datablau-input
                disabled
                v-model="JSON.parse(formData.info.value).schema"
              ></datablau-input>
            </li>
            <li v-if="!isTechRule">
              <span>
                {{
                  JSON.parse(formData.info.value).type === 'VIEW'
                    ? '视图'
                    : '表'
                }}：
              </span>
              <datablau-input
                disabled
                v-model="formData.applyName.value"
              ></datablau-input>
              <span style="margin-left: 20px">物理表名：</span>
              <datablau-input
                disabled
                v-model="JSON.parse(formData.info.value).physicalName"
              ></datablau-input>
            </li>
            <li v-else>
              <p style="margin-bottom: 20px">{{ formData.applyName.value }}</p>
            </li>
            <li>
              <span>{{ formData.userChineseName.name }}：</span>
              <datablau-input
                disabled
                v-model="formData.userChineseName.value"
              ></datablau-input>
              <span style="margin-left: 20px">
                {{ formData.orgFullName.name }}：
              </span>
              <datablau-input
                disabled
                v-model="formData.orgFullName.value"
              ></datablau-input>
            </li>
            <li>
              <span>{{ formData.accessLevel.name }}：</span>
              <datablau-input
                disabled
                v-model="formData.accessLevel.value"
              ></datablau-input>
              <span style="margin-left: 20px">
                {{ formData.assetsLevel.name }}：
              </span>
              <datablau-input
                disabled
                v-model="formData.assetsLevel.value"
              ></datablau-input>
            </li>
            <li>
              <span>{{ formData.ultraVires.name }}：</span>
              <datablau-input
                disabled
                v-model="formData.ultraVires.value"
              ></datablau-input>
            </li>
            <!--<li>
                <span>{{formData.info.name}}</span>
                <el-checkbox-group disabled :value="Object.keys(JSON.parse(formData.info.value)).filter(key => JSON.parse(formData.info.value)[key])">
                  <el-checkbox label="readable">查询</el-checkbox>
                  <el-checkbox label="modifiable">修改</el-checkbox>
                  <el-checkbox label="writable">写入</el-checkbox>
                  <el-checkbox label="deleted">删除</el-checkbox>
                </el-checkbox-group>
              </li>-->
            <li>
              <span>{{ formData.effectiveStr.name }}：</span>
              <datablau-input
                v-if="!couldEdit"
                disabled
                v-model="termOfValidity"
              ></datablau-input>
              <!-- v-model="formData.effectiveStr.value" -->
              <datablau-radio
                v-else
                style="display: inline-block"
                disabled
                :value="
                  formData.effectiveStr.value !== '长期' &&
                  formData.effectiveStr.value !== '30天' &&
                  formData.effectiveStr.value !== '60天' &&
                  formData.effectiveStr.value !== '90天'
                    ? '自定义日期'
                    : formData.effectiveStr.value
                "
              >
                <el-radio label="长期"></el-radio>
                <el-radio label="30天"></el-radio>
                <el-radio label="60天"></el-radio>
                <el-radio label="90天"></el-radio>
                <el-radio label="自定义日期"></el-radio>
                <el-date-picker
                  disabled
                  v-model="formData.effectiveStr.value"
                  type="date"
                  :clearable="false"
                  placeholder="选择日期"
                ></el-date-picker>
              </datablau-radio>
            </li>
            <li v-if="formData.applyReason">
              <span style="vertical-align: top">
                {{ formData.applyReason.name }}：
              </span>
              <datablau-input
                :rows="3"
                type="textarea"
                disabled
                v-model="formData.applyReason.value"
              ></datablau-input>
            </li>
          </ul>
        </div>
      </el-tab-pane>
      <!-- 技术规则申请信息-->
      <el-tab-pane
        label="申请信息"
        name="eight"
        v-if="
          applyDetailData.processType === '技术规则' ||
          applyDetailData.processType === '业务规则'
        "
      >
        <el-form
          label-position="right"
          label-width="110px"
          style="padding-top: 18px"
        >
          <el-form-item label="申请原因: ">
            <div>{{ techRule.applyReason }}</div>
          </el-form-item>
          <el-form-item label="附件: ">
            <div class="doc">
              <span class="docName">{{ techRule.applyFileName }}</span>
              <datablau-button
                v-show="techRule.applyFile"
                size="small"
                @click.stop="downloadFile"
                style="position: relative; top: 1px; margin-left: 10px"
              >
                <i class="iconfont icon-download"></i>
                下载附件
              </datablau-button>
            </div>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <!-- 技术规则申请表单-->
      <el-tab-pane
        label="申请表单"
        name="seventh"
        v-if="applyDetailData.processType === '技术规则'"
      >
        <datablau-table :data="techRuleApplyData" style="min-height: 200px">
          <el-table-column label="规则名称" prop="name" show-overflow-tooltip>
            <template slot-scope="scope">
              <datablau-tooltip
                content="您没有权限查看此技术规则"
                placement="bottom-start"
                :disabled="scope.row.hasAuthToView"
              >
                <datablau-button
                  type="text"
                  @click="goTechRuleDetail(scope.row)"
                  :disabled="!scope.row.hasAuthToView"
                >
                  {{ scope.row.name }}
                </datablau-button>
              </datablau-tooltip>
            </template>
          </el-table-column>
          <el-table-column
            label="规则类型"
            prop="bigClassSelectOption"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            label="所属业务规则"
            prop="buRuleName"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            label="创建人"
            prop="creator"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            label="重要程度"
            prop="importance"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            label="状态"
            prop="processState"
            show-overflow-tooltip
          ></el-table-column>
          <!--          <el-table-column
            label="审批意见"
            prop="comment"
            min-width="120"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <datablau-input v-model="scope.row.comment"></datablau-input>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" show-overflow-tooltip>
            <template slot-scope="scope">
              <datablau-switch
                v-model="scope.row.pass"
                :active-value="true"
                :inactive-value="false"
              ></datablau-switch>
            </template>
          </el-table-column>-->
        </datablau-table>
      </el-tab-pane>
      <!-- 业务规则申请表单-->
      <el-tab-pane
        label="申请表单"
        name="seventh"
        v-if="applyDetailData.processType === '业务规则'"
      >
        <datablau-table :data="buRuleApplyData" style="min-height: 200px">
          <el-table-column label="规则名称" prop="name" show-overflow-tooltip>
            <template slot-scope="scope">
              <datablau-tooltip
                content="您没有权限查看此业务规则"
                placement="bottom-start"
                :disabled="scope.row.hasAuthToView"
              >
                <datablau-button
                  type="text"
                  @click="gobuRuleDetail(scope.row)"
                  :disabled="!scope.row.hasAuthToView"
                >
                  {{ scope.row.name }}
                </datablau-button>
              </datablau-tooltip>
            </template>
          </el-table-column>
          <el-table-column label="类型" prop="category" show-overflow-tooltip>
            <template slot-scope="scope">
              <span>{{ scope.row.category }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="所属机构"
            prop="orgName"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            label="创建人"
            prop="creator"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            label="状态"
            prop="processState"
            show-overflow-tooltip
          ></el-table-column>
        </datablau-table>
      </el-tab-pane>
      <el-tab-pane
        :label="$t('userPane.myTodo.applyData')"
        name="sixth"
        v-if="tableColumnDef.length > 0"
      >
        <div class="apply-table-data">
          <el-button type="text" v-if="couldEdit" @click="addCodeValue()">
            <i class="el-icon-circle-plus"></i>
            添加代码值
          </el-button>
          <datablau-input
            style="width: 200px"
            size="mini"
            v-model="tableKeyword"
            :placeholder="$t('meta.report.placeholder')"
            :iconfont-state="true"
            clearable
          ></datablau-input>
          <datablau-table
            ref="applyDataTable"
            id="codeTable"
            height="270"
            max-height="450px"
            :data="tableData"
          >
            <el-table-column
              :label="$t('userPane.myTodo.codeNum')"
              prop="order"
              v-if="!applyDetailData.processType.includes('标准代码')"
            ></el-table-column>

            <el-table-column
              v-for="item in tableColumnDef"
              :label="item.name"
              :prop="item.value"
              :column-key="item.value"
              :key="item.value"
              min-width="100"
            >
              <!--          <template slot-scope="scope">-->
              <!--            <datablau-input clearable size="mini" v-model="scope.row[item.value]" :disabled="!couldEdit"></datablau-input>-->
              <!--          </template>-->
            </el-table-column>
            <el-table-column
              :label="$t('userPane.userPane.operation')"
              align="center"
              fixed="right"
              :width="100"
              v-if="couldEdit"
            >
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="text"
                  v-if="couldEdit"
                  @click="editRow(scope.row, scope.$index)"
                >
                  {{ $t('common.button.edit') }}
                </el-button>
                <el-button
                  size="mini"
                  type="text"
                  v-if="couldEdit"
                  @click="deleteCodeRow(scope.row, scope.$index)"
                >
                  {{ $t('common.button.delete') }}
                </el-button>
              </template>
            </el-table-column>
          </datablau-table>
          <datablau-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page.sync="currentPage"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="10"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            style="float: right; margin-top: 5px"
            class="page"
          >
            >
          </datablau-pagination>
        </div>
      </el-tab-pane>
      <el-tab-pane
        :label="$t('userPane.myTodo.approRecord')"
        name="third"
        class="task-assign-list"
      >
        <div>
          <datablau-table :data="taskDtos">
            <!-- <el-table-column width="20"></el-table-column> -->
            <el-table-column
              :label="$t('userPane.myTodo.taskName')"
              prop="taskName"
              column-key="taskName"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              :label="$t('userPane.myTodo.approver')"
              prop="assignee"
              column-key="assignee"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                {{ userMap[scope.row.assignee] }}
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('userPane.myTodo.startTime')"
              prop="startTime"
              column-key="startTime"
              show-overflow-tooltip
              :formatter="$timeFormatter"
            ></el-table-column>
            <el-table-column
              :label="$t('userPane.myTodo.endTime')"
              prop="endTime"
              column-key="endTime"
              show-overflow-tooltip
              :formatter="$timeFormatter"
            ></el-table-column>
            <el-table-column
              :label="$t('userPane.myTodo.approStatus')"
              prop="endTime"
              column-key="endTime"
              show-overflow-tooltip
              :formatter="statusFormatter"
            ></el-table-column>
            <el-table-column
              :label="$t('userPane.myTodo.ApproOpinion')"
              prop="endTime"
              column-key="endTime"
              show-overflow-tooltip
              :formatter="opinionFormatter"
            ></el-table-column>
          </datablau-table>
        </div>
      </el-tab-pane>
      <el-tab-pane
        :label="$t('userPane.myTodo.ApproOpinion')"
        name="fourth"
        class="approval-opinion"
        v-if="parseInt(requestType) === 2"
      >
        <el-form
          ref="processDia"
          label-position="right"
          label-width="110px"
          :model="applyData"
          :rules="assignRules"
          style="padding-top: 18px"
        >
          <el-form-item :label="$user.username + ': '">
            <datablau-input
              maxlength="500"
              v-model="applyData.currentComment"
              size="mini"
              :rows="3"
              clearable
              :placeholder="`请输入审批意见 `"
              type="textarea"
              :show-word-limit="true"
            ></datablau-input>
          </el-form-item>
          <el-form-item>
            <datablau-button
              :disabled="submitDisabled"
              v-for="item in handleArr"
              :key="item.id"
              :type="
                item.name == '提交' || item.name == '通过'
                  ? 'important'
                  : 'secondary'
              "
              size="mini"
              @click="handleApply(item)"
            >
              {{ item.name === null ? '提交' : item.name }}
              <i class="el-icon-loading" v-if="item.submitLoading"></i>
            </datablau-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </datablau-tabs>

    <div
      class="apply-section"
      v-if="applyDetailData.processType === '数据申请'"
    >
      <check-application
        :form-dtos="formDtosSource"
        :type="applyDetailData.requestType"
      ></check-application>
    </div>

    <el-dialog
      title="选择数据标准"
      :visible.sync="standardVisible"
      width="450px"
      append-to-body
      :close-on-click-modal="false"
      :before-close="closeSelect"
    >
      <div class="tree-search-box">
        <datablau-input
          maxlength="100"
          size="small"
          class="search-input"
          suffix-icon="el-icon-search"
          placeholder="请输入标准名称或编码"
          v-model="keyword"
          clearable
        ></datablau-input>
      </div>
      <div
        class="tree-box"
        style="margin-top: 5px; height: 350px; overflow: auto"
      >
        <el-tree
          class="grey-tree"
          :data="treeData"
          ref="mainTree"
          :props="defaultProps"
          :render-content="renderContent"
          node-key="id"
          :default-expanded-keys="expandedKeys"
          :default-expand-all="defaultExpandAll"
          :expand-on-click-node="true"
          @node-click="handleItemClicked"
          v-loading="treeLoading"
          :highlight-current="true"
          :filter-node-method="filterNode"
        ></el-tree>
      </div>
      <el-button @click="closeSelect" style="margin-left: 20em" size="small">
        {{ $t('common.button.close') }}
      </el-button>
      <el-button
        @click="handleSelect"
        size="mini"
        :disabled="!enableSelect"
        type="primary"
      >
        {{ $t('domain.common.sel') }}
      </el-button>
    </el-dialog>
    <el-dialog
      :title="!couldEdit ? '查看引用代码' : '选择标准代码'"
      :visible.sync="codeSelectVisible"
      append-to-body
      :close-on-click-modal="false"
    >
      <div v-loading="codeDialogLoading">
        <div style="color: #6e9a3a; margin-bottom: 10px">基本信息:</div>
        <el-form
          class="page-form"
          label-position="right"
          size="small"
          label-width="140"
          inline
          :disabled="!couldEdit"
          :model="codeData"
        >
          <el-form-item label="代码名称:">
            <!--          <el-select-->
            <!--            size="mini"-->
            <!--            v-model="codeData.name"-->
            <!--            clearable-->
            <!--            filterable-->
            <!--          >-->
            <!--            <el-option v-for="item in standardCodeList"-->
            <!--                       :key="item.code"-->
            <!--                       :label="item.name"-->
            <!--                       :value="item.name"-->
            <!--                       @click.native="getCodeInfo(item.code)"-->
            <!--            ></el-option>-->
            <!--          </el-select>-->
            <span>{{ codeData.name }}</span>
          </el-form-item>
          <el-form-item label="代码编号:" v-if="codeData.name">
            <span>{{ codeData.code }}</span>
          </el-form-item>
          <el-form-item label="英文名称:" v-if="codeData.name">
            <span>{{ codeData.enName }}</span>
          </el-form-item>
          <el-form-item label="标准来源:" v-if="codeData.name">
            <span>{{ codeData.source }}</span>
          </el-form-item>
          <el-form-item label="业务说明:" v-if="codeData.name">
            <span>{{ codeData.description }}</span>
          </el-form-item>
          <el-form-item label="备注说明:" v-if="codeData.name">
            <span>{{ codeData.note }}</span>
          </el-form-item>
        </el-form>
        <div style="color: #6e9a3a; margin-bottom: 10px; margin-top: 20px">
          代码取值:
        </div>
        <datablau-input
          style="width: 200px; margin-bottom: 5px"
          size="mini"
          v-if="!couldEdit"
          v-model="tableKeyword"
          placeholder="输入关键字进行搜索"
        ></datablau-input>
        <el-table
          class="datablau-table"
          :data="codeData.values"
          :stripe="true"
          :header-cell-style="{ 'background-color': '#F1F5F8' }"
          :max-height="tableHeight"
        >
          <el-table-column :width="20"></el-table-column>
          <el-table-column label="代码值编号" prop="order"></el-table-column>
          <el-table-column
            label="代码值"
            prop="value"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            label="代码值注释"
            prop="definition"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            label="业务说明"
            prop="definition2"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            label="代码值编码规则"
            prop="definition3"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            label="备注"
            prop="definition4"
            show-overflow-tooltip
          ></el-table-column>
        </el-table>
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page.sync="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="10"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          style="margin-top: 5px"
          class="page"
        ></el-pagination>
      </div>
      <span slot="footer" class="dialog-footer">
        <!--    <el-button size="mini" @click="codeSelectVisible = false">返回</el-button>-->
        <!--    <el-button size="mini" type="primary" @click="confirmReferenceCode">确 定</el-button>-->
      </span>
    </el-dialog>
    <el-dialog
      title="选择标准代码"
      :visible.sync="selectCode"
      width="1200px"
      append-to-body
      :close-on-click-modal="false"
    >
      <standard-code
        @quoteCode="quoteCode"
        @closeDialog="selectCode = false"
      ></standard-code>
    </el-dialog>
    <el-dialog
      :title="codeValueObj.value ? '编辑代码值' : '添加代码值'"
      :visible.sync="addCodeValueVisible"
      width="400px"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-form v-model="codeValueObj" size="small" style="margin-bottom: 30px">
        <el-form-item label="代码值" required>
          <datablau-input
            size="small"
            v-model="codeValueObj.value"
            maxlength="100"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="代码值注释" required>
          <datablau-input
            size="small"
            v-model="codeValueObj.definition"
            maxlength="100"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="业务说明" prop="definition2">
          <datablau-input
            size="small"
            v-model="codeValueObj.definition2"
            maxlength="100"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="代码值编码规则" prop="definition3">
          <datablau-input
            size="small"
            v-model="codeValueObj.definition3"
            maxlength="100"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="备注" prop="definition4">
          <datablau-input
            size="small"
            v-model="codeValueObj.definition4"
            maxlength="100"
          ></datablau-input>
        </el-form-item>
      </el-form>
      <el-button
        @click="handleConfirm"
        size="mini"
        :disabled="!codeValueObj.value || !codeValueObj.definition"
        type="primary"
      >
        {{ $t('common.button.ok') }}
      </el-button>
      <el-button
        @click="addCodeValueVisible = false"
        style="margin-left: 20px; margin-bottom: 5px"
        size="small"
      >
        {{ $t('common.button.close') }}
      </el-button>
    </el-dialog>
  </div>
</template>

<script>
import utils from '@/resource/utils/isJSON'
import HTTP from '@/resource/http.js'
import $version from '@/resource/version.json'
// import standardCode from '../newDataStandard/standardCode.vue'
import { translate } from '../../utils/translate'
import checkApplication from './checkApplication.vue'
import standardScan from '../newDataStandard/standardScanBasic.vue'
import UserInformationService from '@service/UserInformationService'
import {AssetsTypeEnum} from './placeholder/utils/Enum'
import MetricsApplyForm from '@/dataWarehouse/views/dataIndex/indexManagement/indexDefinition/entrance/applyForm.vue'
import IsShowTooltip from '@/components/common/isShowTooltip.vue'

export default {
  components: {
    // standardCode,
    checkApplication,
    standardScan,
    MetricsApplyForm,
  },
  data() {
    return {
      tableFormLoading: false,
      formTotal: 0,
      batchFlag: '', // 资产申请表单的批次号
      tableFormParams: {
        pageNum: 1,
        pageSize: 10,
      },
      tableFormData: [],
      activeName: '',
      checkBoxValueTrue: false,
      hideTopForm: true,
      formData: {},
      tableColumnDef: [],
      tableData: [],
      assignData: [],
      taskDtos: [], // 任务审批记录
      handleArr: [], // 审批方式
      applyData: {
        // 审批意见
        currentComment: '',
      },
      requestType: '',
      formRules: {},
      assignRules: {},
      formDtos: [],
      formDtosSource: [],
      taskId: '',
      themeCategoryArr: [],
      sourceArr: [
        '金融国家标准',
        '金融行业标准',
        '工信部标准',
        '民政部标准',
        '国家统计局标准',
        '国家发展改革委标准',
        '财政部标准',
        '国际标准',
        '行内标准',
      ],
      themeArr: [],
      sensitiveList: ['普通级', '内部使用级'],
      relationList: ['组合', '引用'],
      standardVisible: false,
      treeLoading: false,
      expandedKeys: [],
      defaultExpandAll: false,
      checkedList: [],
      treeData: [],
      options: [],
      keyword: '',
      enableSelect: false,
      defaultProps: {
        children: 'children',
        label: 'className',
        childId: 'childId',
      },
      nowDomain: null,
      relationData: '',
      dataTypeList: [],
      applyArr: ['财务管理领域', '风险管理领域', '客户开户流程'],
      applyArea: [],
      standardOwner: '',
      standardAdmin: '',
      standardBranch: '',
      standardCodeList: [],
      couldEdit: false,
      loading: false,
      referenceCode: '',
      codeSelectVisible: false,
      codeData: {},
      codeDialogLoading: false,
      submitLoading: false,
      oldType: '',
      oldCodeValue: '',
      branchNameMapping: {},
      selectCode: false,
      manyEachPage: 10,
      currentPage: 1,
      tableAllData: [],
      tableAllData2: [],
      tableHeight: null,
      firstTimeout: null,
      tableKeyword: '',
      isEditCodeValue: false,
      oldCodeValueObj: {},
      submitter: '',
      addCodeValueVisible: false,
      codeValueObj: {
        value: '',
        definition: '',
        definition2: '',
        definition3: '',
        definition4: '',
      },
      orderList: [0],
      standardOptions: [],
      standardPath: [],
      submitDisabled: false,
      additionalProperties: [],
      isNotNull: '否',
      typeId: null, // 1：标准 2：指标 3：企业级数据字典
      dimsCodes: '',
      relatedDomain: '',
      relatedDocument: '',
      deleteArr: [
        'formData',
        'tableColumnDef',
        'tableData',
        'assignData',
        'taskDtos',
        'formDtos',
        'standardCodeList',
        'codeData',
        'tableAllData',
        'tableAllData2',
        'oldCodeValueObj',
        'codeValueObj',
      ],
      domainId: null,
      udps: null,
      updatingDomainId: null,
      baseDom: null,
      isTechRule: false,
      userMap: {},
      catalogChangeLabelMap: {
        catalogName: '目录名称',
        catalogType: '目录类型',
        catalogPath: '目录路径',
        catalogKeywords: '关键词',
        applyReason: '申请原因',
        department: '数据权属',
        shareType: '可访问人',
        editablePerson: '可编辑人',
        abbreviation: '英文简称',
        approverName: '审批人',
        directoryStructure: '资产目录空间',
        dataSteward: '数据管家',
        describe: '描述',
        currentStatus: '目录状态',
        catalogExtensions: '扩展属性',
      },
      techRuleApplyData: null,
      techRule: {
        applyReason: '暂无原因',
        applyFile: '',
        applyFileName: '暂无附件',
      },
      buRuleApplyData: null,
      queryArr: [],
      hideAuthCategoryName: ''
    }
  },
  props: {
    applyDetailData: {},
    closeDialog: Boolean,
    myDone: Boolean,
    businessType: String,
  },
  beforeMount() {
    this.applyDetailData.processType = this.applyDetailData.proCategoryName
  },
  beforeDestroy() {
    this.$bus.$off('viewData')
    this.deleteArr.forEach(item => {
      if (typeof this[item] === 'object' && this[item]) {
        Object.keys(this[item]).forEach(o => {
          this[item][o] = null
        })
      }
      this[item] = null
    })
    if (window.CollectGarbage) {
      window.CollectGarbage()
    }
  },
  computed: {
    termOfValidity() {
      if (isNaN(Number(this.formData.effectiveStr.value))) {
        return this.formData.effectiveStr.value
      } else {
        return this.$timeFormatter(
          Number(this.formData.effectiveStr.value),
          'YYYY-MM-DD hh:mm'
        )
      }
    },
    // couldEdit () {
    //   // let bool = false
    //   // if (this.requestType) {
    //   //   if (parseInt(this.requestType) === 2 || parseInt(this.requestType) === 4) {
    //   //     bool = true
    //   //   }
    //   // }
    //   return parseInt(this.requestType) === 2
    // }
    total() {
      return this.tableAllData2.length
    },
  },
  mounted() {
    this.$bus.$on('viewData', this.getViewData)
    this.requestType = this.applyDetailData.requestType
    this.dataInit().then(() => {
      if (this.formData.catalogId && this.formData.catalogId.value) {
        this.standardPath = parseInt(this.formData.catalogId.value)
      }
      this.referenceCode = this.formData.referenceCode
        ? this.formData.referenceCode.value
        : ''
      this.relationData = this.formData.relatedData
        ? this.formData.relatedData.value
        : ''
      this.isNotNull =
        this.formData.notNull && JSON.parse(this.formData.notNull.value)
          ? '是'
          : '否'
      // console.log(this.formData.notNull, 'not null')
      // if (this.formData.businessType && this.formData.businessType.value === '代码类' && this.formData.referenceCode.value) {
      //   this.oldType = this.formData.businessType.value
      //   this.oldCodeValue = this.formData.referenceCode.value
      // }
      /* setTimeout(() => {
        if (this.tableData.length) {
          const st = JSON.stringify(this.tableData)
          this.tableAllData = JSON.parse(st)
          // this.total = this.tableAllData.length
          this.handleCurrentChange(1)
        }
      }, 300) */
      const processType = this.applyDetailData.processType
      if (
        !this.hideTopForm &&
        processType === '数据标准_修改' &&
        !this.myDone &&
        ((this.typeId && this.typeId.value !== '2') || !this.typeId)
      ) {
        this.activeName = 'first'
      } else if (processType === '数据权限申请') {
        this.activeName = 'fifth'
      } else if (processType === '变更目录申请') {
        this.activeName = 'first'
      } else if (
        processType === '发布目录申请' ||
        processType === '下线目录申请'
      ) {
        this.activeName = 'catalogue'
      } else if (
        processType === '资产发布申请' ||
        processType === '资产下线申请'
      ) {
        this.activeName = 'assetList'
      } else if (
        !this.hideTopForm &&
        this.applyDetailData.processType !== '数据申请' &&
        this.applyDetailData.processType !== '数据权限申请' &&
        ((this.typeId && this.typeId.value !== '2') || !this.typeId)
      ) {
        this.activeName = 'second'
      } else {
        this.activeName = 'third'
      }
    })
    // this.gethemeBigClassList()
    // this.getDataTypeList()
    this.getStandardCodeList()
    this.tableHeight = document.documentElement.clientHeight * 0.7
  },
  methods: {
    // 技术规则下载附件
    downloadFile() {
      try {
        const url =
          this.$url + '/service/files/' + this.techRule.applyFile + '/download'
        this.$downloadFile(url)
      } catch (e) {
        this.$showFailure(e)
      }
    },

    // 跳转技术规则
    goTechRuleDetail(row) {
      this.$http
        .post(this.$quality_url + '/quality/rule/tech/' + row.ruleId + '/check')
        .then(res => {
          if (row.hasAuthToView) {
            var pos = location.href.indexOf('#/')
            var baseUrl = location.href.slice(0, pos + 2)
            window.open(
              baseUrl +
                `main/dataQuality/qualityRule?id=${row.ruleId}&copyId=${row.copyId}&copy=true`
            )
          }
        })
        .catch(err => {
          this.$message.error('您没有权限查看此技术规则')
        })
    },
    // 跳转业务规则
    gobuRuleDetail(row) {
      this.$http
        .post(this.$quality_url + '/quality/rule/bu/' + row.ruleId + '/check')
        .then(res => {
          if (row.hasAuthToView) {
            var pos = location.href.indexOf('#/')
            var baseUrl = location.href.slice(0, pos + 2)
            window.open(
              baseUrl + `main/dataQuality/rules?id=${row.ruleId}&copy=true`
            )
          }
        })
        .catch(err => {
          this.$message.error('您没有权限查看此业务规则')
        })
    },
    handleAssetSizeChange(val) {
      this.tableFormParams.pageSize = val
      this.tableFormParams.pageNum = 1
      this.getList()
    },
    handlePageChange(val) {
      this.tableFormParams.pageNum = val
      this.getList()
    },
    getList() {
      const params = {
        batchFlag: this.batchFlag,
      }
      this.tableFormLoading = true
      this.$http
        .get(
          `/workflow/service/task/batch/${this.tableFormParams.pageNum}/${this.tableFormParams.pageSize}`,
          { params: params }
        )
        .then(res1 => {
          this.tableFormLoading = false
          this.formTotal = res1.data.data.total
          let tableFormData = []
          res1.data.data.value.map(item => {
            let newMap = {}
            newMap.batchFlag = this.batchFlag
            item.map(o => {
              newMap[o.property] = o.propertyValue
            })
            tableFormData.push(newMap)
          })
          this.tableFormData = tableFormData
          // console.log(this.tableFormData)
        })
    },
    transState(type) {
      if (type === 'UNPUBLISHED') {
        return '未发布'
      } else if (type === 'UNDER_REVIEW') {
        return '审核中'
      } else if (type === 'PUBLISHED') {
        return '已发布'
      } else if (type === 'OFFLINE') {
        return '已下线'
      } else {
        return '未发布'
      }
    },
    getAssetsType(type, num, data = {}) {
      let result = ''
      let color = ''
      let rgba = ''
      let iconType = ''
      switch (type) {
        case AssetsTypeEnum.DATA_COLLECTION:
        case AssetsTypeEnum.TABLE:
          result = this.$t('assets.assetList.dataSheet')
          color = '#3295f8'
          rgba = '(50,149,248,0.1)'
          iconType = 'TABLE'
          break
        case AssetsTypeEnum.VIEW:
          result = this.$t('assets.assetList.view')
          color = '#4b5cc4'
          rgba = '(75,92,196,0.1)'
          iconType = 'view'
          break
        case AssetsTypeEnum.DATA_OBJECT:
          result = this.$t('assets.assetList.dataItem')
          color = '#c44ad1'
          rgba = '(196,74,209,0.1)'
          iconType = 'COLUMN'
          break
        case AssetsTypeEnum.DATA_STANDARD:
          result = this.$t('assets.assetList.dataStandard')
          color = '#38b48b'
          rgba = '(56,180,139,0.1)'
          iconType = 'DOMAIN'
          break
        case AssetsTypeEnum.DATA_STANDARD_CODE:
          result = this.$t('assets.assetList.dataStandard')
          color = '#38b48b'
          rgba = '(56,180,139,0.1)'
          iconType = 'daima'
          break
        case AssetsTypeEnum.INDEX:
          result = this.$t('assets.assetList.dataIndicators')
          color = '#d1af3e'
          rgba = '(209,175,62,0.1)'
          iconType = 'domain_code'
          break
        case AssetsTypeEnum.REPORT:
          result = this.$t('assets.assetList.dataReport')
          color = '#008899'
          rgba = '(0,136,153,0.1)'
          iconType = 'Report'
          break
        case AssetsTypeEnum.FILE:
          result = this.$t('assets.assetList.file')
          color = '#3397ff'
          rgba = '(51,151,255,0.1)'
          iconType = data.fileType ? data.fileType : 'file'
          break
        case AssetsTypeEnum.DATA_SERVICE:
          result = this.$t('assets.assetList.dataService')
          color = '#35bae6'
          rgba = '(53,186,230,0.1)'
          iconType = 'service'
          break
        default:
          break
      }
      if (num === 1) {
        return result
      }
      if (num === 2) {
        const style = {
          color: color,
          background: 'rgba' + rgba,
          textAlign: 'center',
        }
        return style
      }
      if (num === 3) {
        return iconType
      }
    },
    setUpdatingDomainId(domainId) {
      this.updatingDomainId = domainId
    },
    setBaseDom(dom) {
      this.baseDom = dom
    },
    getViewData(data) {
      this.formData.applyViews = {
        value: JSON.stringify(data.map(item => item.choosedViewId)),
      }
    },
    dataInit() {
      return new Promise(resolve => {
        this.loading = true
        const para = {
          processInstanceId: this.applyDetailData.processInstanceId,
          type: this.requestType,
        }
        if (para.type !== 1) {
          para.taskId = this.applyDetailData.taskId
          this.taskId = this.applyDetailData.taskId
        }
        HTTP.getApplyDetail(para)
          .then(res => {
            if (
              this.applyDetailData.processType === '资产发布申请' ||
              this.applyDetailData.processType === '资产下线申请'
            ) {
              // 资产发布为批量发布
              this.batchFlag = res.data.formDtos
                .filter(item => item.code === 'batchFlag')
                .map(o => {
                  return o.value
                })
                .toString()
              this.getList()
            }
            this.loading = false
            const data = res.data
            let formDtos =
              data.formDtos.filter(
                item => !!item.readable && item.name !== '扩展属性'
              ) || []
            this.formDtosSource = data.formDtos
            if (
              this.applyDetailData.processType === '技术规则' ||
              this.applyDetailData.processType === '业务规则'
            ) {
              this.techRule.applyReason =
                data.formDtos.filter(item => item.name === '申请原因')[0]
                  ?.value || '暂无原因'
              this.techRule.applyFile =
                data.formDtos.filter(item => item.name === '上传附件')[0]
                  ?.value || ''
              if (this.techRule.applyFile) {
                this.$http
                  .get(
                    this.$url +
                      `/service/files/?fileIds=${this.techRule.applyFile}`
                  )
                  .then(res => {
                    this.$nextTick(() => {
                      this.techRule.applyFileName =
                        res.data[0]?.fileOrginalName || '暂无附件'
                    })
                  })
              }
            }
            this.typeId = data.formDtos.find(e => e.code === 'categoryId')
            try {
              const domainIdDto = data.formDtos.find(e => e.code === 'domainId')
              if (domainIdDto) {
                this.domainId = domainIdDto.value
              }
            } catch (e) {}
            if (this.typeId) {
              try {
                this.relatedDomain = JSON.parse(
                  data.formDtos.find(e => e.name === '相关标准').value
                ).length
                  ? JSON.parse(
                      data.formDtos.find(e => e.name === '相关标准').value
                    ).toString()
                  : ''
              } catch (e) {}
              switch (this.typeId.value) {
                case '1':
                  formDtos = data.formDtos.filter(
                    e =>
                      e.code !== 'parentCode' &&
                      e.code !== 'dimCodes' &&
                      e.code !== 'documentIds' &&
                      e.code !== 'function' &&
                      e.code !== 'measureUnit' &&
                      e.code !== 'monitorObjects'
                  )
                  break
                case '3':
                  formDtos = data.formDtos.filter(
                    e =>
                      e.code !== 'parentCode' &&
                      e.code !== 'dimCodes' &&
                      e.code !== 'documentIds' &&
                      e.code !== 'function' &&
                      e.code !== 'measureUnit' &&
                      e.code !== 'monitorObjects'
                  )
                  data.formDtos.find(e => e.name === '标准编码').name =
                    '字典编码'
                  data.formDtos.find(e => e.name === '标准来源').name =
                    '字典来源'
                  data.formDtos.find(e => e.name === '相关标准').name =
                    '相关字典'
                  break
                case '2':
                  formDtos = data.formDtos.filter(
                    e => e.code !== 'referenceCode'
                  )
                  data.formDtos.find(e => e.name === '标准编码').name =
                    '指标编码'
                  data.formDtos.find(e => e.name === '标准来源').name =
                    '指标来源'
                  data.formDtos.find(e => e.name === '相关标准').name =
                    '相关指标'
                  data.formDtos.find(e => e.code === 'dimCodes') &&
                    this.convertDimCodes(
                      data.formDtos.find(e => e.code === 'dimCodes').value
                    )
                  try {
                    this.relatedDocument = JSON.parse(
                      data.formDtos.find(e => e.name === '参考文档').value
                    ).length
                      ? JSON.parse(
                          data.formDtos.find(e => e.name === '参考文档').value
                        ).toString()
                      : ''
                  } catch (e) {}
                  break
                default:
                  formDtos = data.formDtos.filter(
                    e =>
                      e.code !== 'parentCode' &&
                      e.code !== 'dimCodes' &&
                      e.code !== 'documentIds' &&
                      e.code !== 'function' &&
                      e.code !== 'measureUnit' &&
                      e.code !== 'monitorObjects'
                  )
                  break
              }
            }
            this.handleArr = data.outgoingFlows || []
            const task = data.taskDtos
            this.taskDtos = task
            // 通过登录名获取姓名
            const users =
              Array.isArray(this.taskDtos) && this.taskDtos.map(i => i.assignee)
            this.getNameByUserName(users)
            // this.taskDtos.sort((a, b) => {
            //   return a.endTime - b.endTime
            // })

            formDtos.sort((a, b) => {
              return a.order - b.order
            })
            // 技术规则
            if (this.applyDetailData.processType.includes('技术规则')) {
              // console.log(formDtos, 'formDtos[0].value')
              formDtos = data.formDtos.filter(item => {
                return item.code === 'copyDataInfo'
              })
              let ruleApplyTable =
                formDtos[0].value && JSON.parse(formDtos[0].value)
              ruleApplyTable.forEach(item => {
                item.hasAuthToView = false
                if (
                  (this.$user.username === item.creator &&
                    this.$auth.TECHNICAL_REGULATION_VIEW_MY) ||
                  this.$auth.TECHNICAL_REGULATION_VIEW_ALL
                ) {
                  item.hasAuthToView = true
                }
              })
              this.techRuleApplyData = ruleApplyTable || []
            }
            // 业务规则
            if (this.applyDetailData.processType.includes('业务规则')) {
              formDtos = data.formDtos.filter(item => {
                return item.code === 'copyDataInfo'
              })
              let ruleApplyTable =
                formDtos[0].value && JSON.parse(formDtos[0].value)
              ruleApplyTable.forEach(item => {
                item.hasAuthToView = false
                if (
                  (this.$user.username === item.creator &&
                    this.$auth.BUSINESS_RULE_VIEW_MY) ||
                  this.$auth.BUSINESS_RULE_VIEW_ALL
                ) {
                  item.hasAuthToView = true
                }
              })
              this.buRuleApplyData = ruleApplyTable || []
            }
            this.formDtos = formDtos
            this.applyData.currentComment = ''
            // this.couldEdit = this.taskDtos[0].startUserIdOld === this.$user.username && parseInt(this.requestType) === 2
            this.couldEdit = data.repeatApply
            // this.couldEdit = true
            this.formDtoFormatter(formDtos)
            const propertiesObj = data.formDtos.filter(
              e => e.name === '扩展属性'
            )[0]
            if (propertiesObj && propertiesObj.value) {
              if (
                this.businessType === 'biaozhundaima' ||
                this.businessType === 'lingyubiaozhundaima'
              ) {
                const categoryObj = data.formDtos.filter(
                  e => e.code === 'categoryId'
                )[0]
                HTTP.getUpds({
                  categoryId: categoryObj ? categoryObj.value : 1,
                  standardCode: true,
                })
                  .then(res => {
                    this.udps = res.data
                    const objAll = JSON.parse(propertiesObj.value)
                    this.additionalProperties = []
                    res.data.length &&
                      Object.keys(objAll).forEach(e => {
                        const obj = {
                          name: res.data.find(
                            item => item.udpId === parseInt(e)
                          ).name,
                          value: objAll[e],
                        }
                        this.additionalProperties.push(obj)
                      })
                  })
                  .catch(e => {
                    this.$showFailure(e)
                  })
              } else {
                this.$http
                  .get(
                    this.$url +
                      `/service/domains/udps?categoryId=${this.typeId.value}`
                  )
                  .then(res => {
                    this.udps = res.data
                    const objAll = JSON.parse(propertiesObj.value)
                    this.additionalProperties = []
                    res.data.length &&
                      Object.keys(objAll).forEach(e => {
                        const obj = {
                          name: res.data.find(
                            item => item.udpId === parseInt(e)
                          ).name,
                          value: objAll[e],
                        }
                        this.additionalProperties.push(obj)
                      })
                  })
                  .catch(e => {
                    this.$showFailure(e)
                  })
              }
            }
            resolve()
          })
          .catch(e => {
            this.loading = false
            this.$showFailure(e)
          })
      })
    },
    getNameByUserName(users) {
      UserInformationService.getUsernames(users).then(map => {
        map.forEach((item, index) => {
          this.$set(this.userMap, index, item)
        })
      })
    },
    convertDimCodes(list) {
      if (!list) return
      this.$http
        .post(`${this.$domain_url}/me/dims/catalogs/codes`, JSON.parse(list))
        .then(res => {
          const arr = []
          res.data.forEach(e => {
            arr.push([e.catalog.catalog, e.value].join('/'))
          })
          this.dimsCodes = arr.toString()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    formatterCode(val) {
      if (val.includes('-@COPY!')) {
        const index = val.indexOf('-')
        return val.slice(0, index)
      } else {
        return val
      }
    },
    formatCatalogValue(key, value) {
      if (key === 'currentStatus') return this.transState(value)
      if (key === 'catalogExtensions') {
        return (
          value &&
          value
            .map(item => `${item.proName}: ${item.proValue || ' '}`)
            .join(',')
        )
      }

      return value
    },
    isCatalogChange(key, oldVal, newVal) {
      return (
        this.formatCatalogValue(key, oldVal) !==
        this.formatCatalogValue(key, newVal)
      )
    },
    // gethemeBigClassList () {
    //   this.$http.get(this.$url + '/service/domains/classification/query').then(res => {
    //     this.themeCategoryArr = res.data
    //     setTimeout(() => {
    //       try {
    //         const obj = res.data.filter(e => e.className === this.formData.themeCategory.value)[0]
    //         this.bigThemeChange(obj)
    //       } catch (e) {
    //       }
    //     }, 1000)
    //   }).catch(e => {
    //     this.$showFailure(e);
    //   });
    // },
    formDtoFormatter(formDtos) {
      const formData = {}
      const formRules = {}
      formDtos.forEach(item => {
        if (item.type === 'LABEL_JSON') {
          const value = item.value
          if (value && this.$utils.isJSON(value)) {
            this.tableColumnDef = JSON.parse(value) || []
          }
        } else if (item.type === 'VALUE_JSON') {
          const value = item.value
          if (value && this.$utils.isJSON(value)) {
            this.tableAllData = JSON.parse(value)
            this.tableAllData.sort((a, b) => {
              return a.order - b.order
            })
            this.orderList = JSON.parse(value).map(e => e.order)
            this.tableAllData2 = JSON.parse(JSON.stringify(this.tableAllData))
            this.handleCurrentChange(1)
          }
        } else {
          if (item.type === 'BOOLEAN') {
            item.value = item.value === 'true'
          }
          if (item.readable) {
            this.hideTopForm = false
            if (!item.writable) {
              // item.value = item.value
            }
            formData[item.code] = item
            if (item.required) {
              formRules[item.code] = {
                required: true,
                trigger: 'blur',
              }
            }
          }
        }
      })
      if (this.typeId && (this.typeId.value === '1' || this.typeId.value > 4)) {
        ;[
          'requirementId',
          'requirementName',
          'metricType',
          'expireDate',
          'takeEffectDate',
          'safeLevel',
          'managementOwner',
          'techOwner',
          'businessOwner',
        ].forEach(item => {
          delete formData[item]
        })
      }
      if (this.applyDetailData.processType === '变更目录申请') {
        const { oldCatalogData, newCatalogData } = formData
        formData.oldCatalogData = JSON.parse(oldCatalogData.value)
        formData.newCatalogData = JSON.parse(newCatalogData.value)
        ;[
          'deptId',
          'catalogId',
          'approver',
          'applyReason',
          'approverId',
          'reviewer',
          'bm',
        ].forEach(item => {
          delete formData.oldCatalogData[item]
          delete formData.newCatalogData[item]
        })
      }
      // if (
      //   this.applyDetailData.processType === '发布目录申请' ||
      //   this.applyDetailData.processType === '下线目录申请'
      // ) {
      //   delete formData.applyReason
      // }
      // if (
      //   this.applyDetailData.processType === '发布目录申请' ||
      //   this.applyDetailData.processType === '下线目录申请'
      // ) {
      //   delete formData.applyReason
      // }
      this.formData = formData
      // this.isTechRule = this.formData.applyName.value.indexOf('问题清单') === 0
      this.formRules = formRules
    },
    tabledataFilter() {
      this.tableAllData2 = this.tableAllData.filter(
        e =>
          e.value.toLowerCase().includes(this.tableKeyword.toLowerCase()) ||
          e.definition.toLowerCase().includes(this.tableKeyword.toLowerCase())
      )
      this.handleCurrentChange(1)
    },
    translateData(data) {
      if (this.formData.dataFormat.value.indexOf(',') < 0) {
        // this.detail.dataFormat = translate(data);
        this.formData.dataType.value = translate(data)

        if (this.formData.dataType.value.includes('NaN')) {
          this.$message.error('请输入正确的数据格式，重新输入')
          this.formData.dataType.value = ''
          this.formData.dataFormat.value = ''
          this.formData.dataScale.value = ''
          this.formData.dataPrecision.value = ''
        } else if (this.formData.dataType.value === 'DATE') {
          this.formData.dataScale.value = ''
          this.formData.dataPrecision.value = ''
        } else if (this.formData.dataType.value === 'TIMESTAMP') {
          this.formData.dataScale.value = ''
          this.formData.dataPrecision.value = ''
        } else {
          const index1 = this.formData.dataType.value.indexOf('(')
          const index2 = this.formData.dataType.value.indexOf(',')
          const index3 = this.formData.dataType.value.indexOf(')')
          const index4 = data.indexOf('(')
          if (this.formData.dataType.value.indexOf(',') > 0) {
            this.formData.dataScale.value = this.formData.dataType.value.slice(
              index1 + 1,
              index2
            )
            this.formData.dataPrecision.value =
              this.formData.dataType.value.slice(
                index2 + 1,
                this.formData.dataType.value.length - 1
              )
          } else if (this.formData.dataType.value === 'INTEGER') {
            this.formData.dataScale.value = data.slice(0, index4)
            this.formData.dataPrecision.value = ''
          } else {
            this.formData.dataScale.value = this.formData.dataType.value.slice(
              index1 + 1,
              index3
            )
            this.formData.dataPrecision.value = ''
          }
        }
      }
    },
    startProcess() {
      const formData = this.getEditObj()
      this.$emit('startProcess', formData)
    },
    checkValueRequired() {
      let ok = true
      for (const item in this.formData) {
        if (this.formData.hasOwnProperty(item)) {
          if (this.formData[item].required && !this.formData[item].value) {
            ok = false
            this.$message.error(this.formData[item].name + '是必填的')
            break
          }
        }
      }
      return ok
    },
    handleApply(handleItem) {
      this.submitDisabled = true
      // if (!this.checkCodeValueRequired()) {
      //   return
      // }
      // if (!this.checkValueRequired()) {
      //   return
      // }
      if (
        this.applyDetailData.requestType === 2 &&
        handleItem.name === '通过' &&
        this.applyDetailData.processType === '数据申请' &&
        (!this.formData.applyViews.value ||
          JSON.parse(this.formData.applyViews.value).some(id => id === ''))
      ) {
        this.$message.error('请选择视图')
        return
      }
      this.handleArr.forEach((element, index) => {
        if (element.name === handleItem.name) {
          this.$set(this.handleArr[index], 'submitLoading', true)
        }
      })
      const formData = this.getEditObj()
      // console.log(formData)
      const para = {
        requestBody: {
          taskId: this.taskId,
          nextFlow: handleItem.id,
          comment: this.applyData.currentComment,
          username: this.$store.state.user.name,
          formDtos: formData,
          processType: this.applyDetailData.processType,
        },
      }
      HTTP.completeTask(para)
        .then(res => {
          this.handleArr.forEach((element, index) => {
            if (element.name === handleItem.name) {
              this.$set(this.handleArr[index], 'submitLoading', false)
            }
          })
          this.$message.success('处理成功')
          // this.$bus.$emit('completeTask')
          this.$emit('changeVisible', false)
          if (
            this.oldCodeValue &&
            (this.oldType !== this.formData.businessType.value ||
              this.oldCodeValue !== this.formData.referenceCode.value)
          ) {
            this.$http
              .get(
                `${this.$url}/service/domains/standard/state/process/${this.oldCodeValue}`
              )
              .then()
          }
          if (this.$route.query.taskId) {
            return
          }
          this.$bus.$emit('completeTask')
          this.submitDisabled = false
        })
        .catch(e => {
          this.handleArr.forEach((element, index) => {
            if (element.name === handleItem.name) {
              this.$set(this.handleArr[index], 'submitLoading', false)
            }
          })
          this.submitDisabled = false
          this.$showFailure(e)
        })
    },

    getEditObj() {
      const result = []
      this.formDtos.forEach(item => {
        const obj = {}
        for (const key in item) {
          obj[key] = item[key]
        }
        if (this.applyDetailData.processType !== '变更目录申请') {
          if (this.formData[item.code]) {
            obj.value = this.formData[item.code].value
          }
        }
        result.push(obj)
      })
      // console.log(result)
      if (this.tableAllData.length) {
        // this.tableAllData.forEach((e, i) => {
        //   e.order = i + 1
        // })
        result.forEach(e => {
          if (e.name === '码值取值') {
            e.value = JSON.stringify(this.tableAllData)
          }
        })
      }
      return result
    },

    statusFormatter(row, column, cellValue, index) {
      let result = ''
      if (row.endTime) {
        if (row.param && row.param.result) {
          result = row.param.result
        } else {
          result = '通过'
        }
      } else {
        if (row.startTime) {
          result = '审批中'
        } else {
          result = '待审批'
        }
      }
      return result
    },
    opinionFormatter(row, column, cellValue, index) {
      let result = ''
      if (row.endTime) {
        if (row.param && row.param.opinion) {
          result = row.param.opinion
        } else {
          result = ''
        }
      }
      return result
    },
    bigThemeChange(item) {
      this.themeArr = item.children
      this.changeTheme()
    },
    openSelectCode(code) {
      if (this.couldEdit) {
        this.selectCode = true
      } else {
        this.codeSelectVisible = true
        this.getCodeInfo(code)
      }
    },
    quoteCode(val) {
      this.referenceCode = val
    },
    getCodeInfo(code) {
      if (!code) {
        return
      }
      this.codeDialogLoading = true
      this.$http
        .get(this.$url + '/service/domains/codes/content?codeNumber=' + code)
        .then(res => {
          this.codeDialogLoading = false
          this.codeData = res.data
          const st = JSON.stringify(this.codeData.values)
          this.tableAllData = JSON.parse(st)
          this.tableAllData.sort((a, b) => {
            return a.order - b.order
          })
          this.orderList = JSON.parse(st).map(e => e.order)
          this.tableAllData2 = JSON.parse(st)
          this.tabledataFilter()
        })
        .catch(e => {
          this.codeDialogLoading = false
          this.$showFailure(e)
        })
    },
    confirmReferenceCode() {
      this.referenceCode = this.codeData.code
      this.codeSelectVisible = false
    },
    selectRelateData() {
      this.standardVisible = true
      this.innerLoadStandard()
    },
    innerLoadStandard() {
      this.treeLoading = true
      this.defaultExpandAll = false
      this.checkedList = []
      this.treeData = []
      const self = this
      const get_url = this.$url + '/service/domains/classification/query_domain'
      self.$http
        .get(get_url)
        .then(res => {
          self.checkedList = []
          self.checkedListLength = 0
          if (res.data && res.data[0]) {
            this.options = _.cloneDeep(res.data)
          }
          if (res.data) {
            self.modifyArrKey(res.data)
            var businessData = res.data
          } else {
            var businessData = []
          }
          self.treeData = businessData
          if (arguments[0] !== true) {
            self.expandedKeys = []
          }
          self.treeLoading = false
        })
        .catch(e => {
          this.$showFailure(e)
          self.treeLoading = false
        })
    },
    modifyArrKey(obj) {
      const self = this
      if (obj.nodes != null) {
        this.$utils.sort.sortConsiderChineseNumber(obj.nodes)
        obj.nodes.forEach(item => {
          self.modifyArrKey(item)
        })
      }
      if (obj.domains != null && obj.domains.length > 0) {
        this.$utils.sort.sortConsiderChineseNumber(obj.domains)
        obj.domains.forEach(item => {
          if (obj.nodes == null) {
            obj.nodes = []
          }
          obj.nodes.push(item)
        })
      }
    },
    renderContent(h, { node, data, store }) {
      if (typeof data.classId === 'string') {
        return (
          <span
            style="flex: 1; display: flex;align-items: center;"
            data-code={data.code}
          >
            <span class="tree-icon domain"></span>
            <span>{node.label}</span>
          </span>
        )
      } else {
        return (
          <span style="flex: 1; display: flex;align-items: center;">
            <span class="icon-i-folder">
              <span class="path1"></span>
              <span class="path2"></span>
            </span>
            <span>{node.label}</span>
          </span>
        )
      }
    },
    handleItemClicked(data, node) {
      if (typeof data.classId === 'string') {
        this.nowDomain = data
        this.enableSelect = true
      } else {
        this.enableSelect = false
      }
    },
    filterNode(value, data, node) {
      if (!value) return true
      return (
        (data.className && data.className.indexOf(value) !== -1) ||
        (data.domainCode && data.domainCode.indexOf(value) !== -1)
      )
    },
    handleSelect() {
      this.standardVisible = false
      this.enableSelect = false
      this.keyword = ''
      this.innerLoadStandard()
      // 选定相关数据
      this.relationData = this.nowDomain.className
    },
    // getDataTypeList () {
    //   this.$http.post(this.$url + '/service/domains/dropdown/data').then(res=>{
    //     this.dataTypeList = res.data.business;
    //   }).catch(e => {
    //     this.$showFailure(e)
    //   })
    // },
    selectBranch(index) {
      this.$utils.branchSelect.open(true).then(res => {
        if (index === 1) {
          this.standardOwner = res.map(e => e.fullName).toString()
          this.formData.departmentOwner.value = res.map(e => e.bm).toString()
        } else if (index === 2) {
          this.standardAdmin = res.map(e => e.fullName).toString()
          this.formData.departmentManager.value = res.map(e => e.bm).toString()
        } else {
          this.standardBranch = res.map(e => e.fullName).toString()
          this.formData.departmentUser.value = res.map(e => e.bm).toString()
        }
      })
    },
    getStandardCodeList() {
      // this.$http.get(`${this.$url}/service/domains/codes`).then(res => {
      //   this.standardCodeList = res.data.sort((a, b) => {
      //     return a.name.localeCompare(b.name)
      //   })
      // }).catch(e => {
      //   this.$showFailure(e)
      // })
    },
    addCodeValue() {
      this.isEditCodeValue = false
      this.codeValueObj = {}
      this.addCodeValueVisible = true
    },
    deleteCodeRow(row) {
      const index = this.tableAllData
        .map(e => JSON.stringify(e))
        .indexOf(JSON.stringify(row))
      this.tableAllData.splice(index, 1)
      this.tableAllData2 = JSON.parse(JSON.stringify(this.tableAllData))
      this.tabledataFilter()
    },
    handleConfirm() {
      this.tableKeyword = ''
      if (!this.isEditCodeValue) {
        const obj = {
          value: '',
          definition: '',
          definition2: '',
          definition3: '',
          definition4: '',
          order: null,
        }
        Object.keys(obj).forEach(e => {
          obj[e] = this.codeValueObj[e] ? this.codeValueObj[e] : ''
        })
        obj.order =
          this.orderList.sort((a, b) => {
            return b - a
          })[0] + 1
        this.orderList.push(obj.order)
        this.tableAllData.push(obj)
        this.tableAllData2 = JSON.parse(JSON.stringify(this.tableAllData))
      } else {
        const index = this.tableAllData
          .map(e => JSON.stringify(e))
          .indexOf(JSON.stringify(this.oldCodeValueObj))
        this.tableAllData[index] = this.codeValueObj
        this.tableAllData2 = JSON.parse(JSON.stringify(this.tableAllData))
      }
      this.handleCurrentChange(1)
      this.addCodeValueVisible = false
    },
    handleSizeChange(val) {
      this.manyEachPage = val
      this.handleCurrentChange(1)
      this.currentPage = 1
    },
    handleCurrentChange(val) {
      try {
        this.codeData.values = this.tableAllData2.slice(
          (val - 1) * this.manyEachPage,
          (val - 1) * this.manyEachPage + this.manyEachPage
        )
      } catch (e) {
        this.codeData.values = this.tableAllData2.slice(val * this.manyEachPage)
      }
      if (this.tableColumnDef.length) {
        try {
          this.tableData = this.tableAllData2.slice(
            (val - 1) * this.manyEachPage,
            (val - 1) * this.manyEachPage + this.manyEachPage
          )
        } catch (e) {
          this.tableData = this.tableAllData2.slice(val * this.manyEachPage)
        }
      }
    },
    closeSelect() {
      this.standardVisible = false
      this.keyword = ''
      this.innerLoadStandard()
    },
    editRow(row, index) {
      this.isEditCodeValue = true
      this.oldCodeValueObj = JSON.parse(JSON.stringify(row))
      this.codeValueObj = JSON.parse(JSON.stringify(row))
      this.addCodeValueVisible = true
    },
    changeTheme() {
      this.standardOptions = []
      this.themeArr.forEach(item => {
        if (item.className === this.formData.theme.value && item.children) {
          this.standardOptions = item.children
        }
      })
    },
    labelText() {
      let obj = {}
      if (this.typeId.value === '3') {
        obj = {
          typeName: '数据字典',
          standard: '字典信息',
          domainCode: '字典编码',
          status: '字典状态',
          name: '字典名称',
          nameAbbr: '字典',
        }
      } else if (this.typeId.value === '2') {
        obj = {
          typeName: '指标',
          standard: '指标信息',
          domainCode: '指标编码',
          status: '指标状态',
          name: '指标名称',
          nameAbbr: '指标',
        }
      } else {
        obj = {
          typeName: '数据标准',
          standard: this.$version.domain.propertyType.standard,
          domainCode: this.$version.domain.property.domainCode,
          status: '标准状态',
          name: '标准名称',
          nameAbbr: '标准',
        }
      }

      return obj
    },
  },
  watch: {
    // processInstanceId (newVal) {
    //   this.dataInit()
    // },
    // taskId (newVal) {
    //   this.dataInit()
    // },
    keyword(value) {
      this.$refs.mainTree.filter(value)
    },
    relationData(value) {
      this.formData.relatedData.value = value
    },
    applyArea(value) {
      this.formData.departmentFiled.value = JSON.stringify(
        value.map(e => '' + e + '')
      )
    },
    standardOwner(val) {
      if (!val) {
        this.formData.departmentOwner.value = ''
      }
    },
    standardAdmin(val) {
      if (!val) {
        this.formData.departmentManager.value = ''
      }
    },
    standardBranch(val) {
      if (!val) {
        this.formData.departmentUser.value = ''
      }
    },
    referenceCode(val) {
      this.formData.referenceCode.value = val
    },
    standardPath(val) {
      if (val.length) {
        this.formData.catalogId.value = val[val.length - 1]
      }
    },
    tableKeyword() {
      clearTimeout(this.firstTimeout) // 防抖
      this.firstTimeout = setTimeout(() => {
        this.tabledataFilter()
      }, 800)
    },
  },
}
</script>
<style scoped lang="scss">
$primary-color: #409eff;

/deep/ .el-tab-pane {
  padding-top: 0px;
  padding-bottom: 0px;
  .doc {
    .docName {
      &:hover {
        //color: $primary-color;
      }
    }
  }
}
/deep/ .detail {
  //height: 28px !important;
}
/deep/ .details-box .detail.broader {
  /*width: 450px !important;*/
}
.table-form-box {
  height: 345px;
  position: relative;
  overflow: hidden;
  .table-box {
    position: absolute;
    top: 40px;
    left: -20px;
    right: -20px;
    bottom: 0px;
    /deep/ .db-table {
      position: absolute !important;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
  }
  .table-form-btn {
    position: absolute;
    bottom: 0;
    right: 0;
  }
}
.change-form,
.catalog-apply-form,
.assets-apply-form {
  .apply-reason {
    height: 32px;
    line-height: 32px;
    margin-top: 10px;
    margin-bottom: 10px;
    .reason-title {
      float: left;
      padding-left: 7px;
      background-color: rgba(64, 158, 255, 0.1);
      width: 80px;
      font-size: 12px;
      color: #555;
      font-weight: 500;
      &:after {
        content: '';
        width: 0px;
        height: 0px;
        border-top: 16px solid transparent;
        border-bottom: 16px solid transparent;
        border-left: 16px solid rgba(64, 158, 255, 0.1);
        position: absolute;
        top: 9px;
        left: 80px;
      }
      .change-icon {
        font-size: 16px;
        color: #409eff;
        line-height: 32px;
        float: left;
      }
      .change-text {
        display: inline-block;
        line-height: 32px;
        margin-left: 7px;
      }
    }
    .reason-content {
      float: left;
      margin-left: 20px;
      width: calc(100% - 100px);
    }
  }
}
/deep/.datablau-detail .detail-form {
  padding: 0;
}
</style>
<style lang="scss">
.apply-detail-dialog {
  .el-dialog__body {
    padding-bottom: 0 !important;
    bottom: 0 !important;
  }
  .el-form-item:last-child {
    margin-bottom: 18px !important;
  }
}
.green-checkbox {
  .el-checkbox__input.is-checked .el-checkbox__inner {
    background-color: #66bf16;
  }
}
.apply-detail-page {
  position: relative;
  min-height: 300px;
  height: auto;
  max-height: 60vh;
  top: -5px;
  .apply-form,
  .authority-wrapper {
    .el-input {
      width: 340px !important;
    }
    .el-textarea {
      width: 800px;
      .el-textarea__inner {
        border: none;
      }
    }
    input {
      border: none;
    }
  }

  // .task-assign-list{
  //   padding-top:0;
  // }
  .apply-table-data {
    padding-top: 10px;
  }

  .apply-section {
    border: 1px solid var(--border-color-lighter);
    margin-bottom: 20px;
    padding: 20px 10px;
  }
  .apply-section-2 {
    border-left: 1px solid var(--border-color-lighter);
    border-right: 1px solid var(--border-color-lighter);
    border-bottom: 1px solid var(--border-color-lighter);
    padding: 20px 10px;
    margin-bottom: 20px;
  }
  .apply-section-3 {
    border: 1px solid var(--border-color-lighter);
    padding: 20px;
  }
  .item-title {
    // border-left: 2px solid blue;
    // padding-left: 20px;
    // margin-bottom: 10px;
  }
  .assgin-btn-outer {
    padding-top: 20px;
  }
  .top-form {
    .el-input.el-input--mini {
      max-width: 300px;
    }
  }
  .approval-opinion {
    .datablau-input {
      width: 100%;
    }
  }
  #pane-fifth {
    .el-input {
      width: 335px !important;
    }
  }

  .details-box {
    .detail {
      /*width: 450px !important;*/
      .value {
        /*此处影响到指标详情了,如果需要以下3行,请使用更精确的css选择器*/
        /*height: 28px !important;*/
        /*width: 280px !important;*/
        /*max-width: 280px !important;*/
        display: inline-block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .label {
        line-height: 28px !important;
        display: inline-block;
        //white-space: nowrap;
        //overflow: hidden;
        //text-overflow: ellipsis;
      }
      .el-tooltip.value {
        position: relative;
        top: 2px;
      }
    }
  }
}
.apply-detail-page .top-form .el-input.el-input--mini {
  max-width: 245px;
}
.el-form.page-form .el-form-item__label {
  width: 94px;
}
.apply-detail-page {
  .el-form.page-form .el-input {
    width: 320px;
  }
}
#codeTable {
  th:nth-child(2),
  th:nth-child(3) {
    /*div::before {
      display: inline-block;
      content: '*';
      color: red;
    }*/
  }
}
#codeValueInput {
  text-decoration: underline red;
}
.authority-wrapper {
  padding-top: 10px;
  ul {
    text-align: left;
  }
  li > span,
  li > .el-checkbox-group,
  li > .el-radio-group {
    display: inline-block;
  }
  li > span {
    font-size: 12px;
    width: 100px;
    text-align: right;
    margin-right: 10px;
  }
  li > .el-checkbox-group {
    width: 400px;
  }
  li > .el-radio-group {
    width: 660px;
  }
  li > .el-textarea {
    width: 660px;
  }
  li > .el-input {
    width: 200px;
  }
  li + li {
    margin-top: 10px;
  }
}
</style>

<style scoped lang="scss">
.authority-wrapper {
  li {
    /deep/ .datablau-input {
      display: inline-block;
    }
  }
}
.oldChange {
  background: rgb(254, 240, 240);
}
.newChange {
  background: rgb(240, 249, 235);
}
</style>
