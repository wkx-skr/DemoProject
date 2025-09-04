<template>
  <div v-loading="loading">
    <div class="row-header">
      <div style="padding: 8px 0" class="overhidden2">
        <datablau-breadcrumb
          style="height: auto; line-height: initial"
          :node-data="nodeData"
          @back="backClick"
          :couldClick="false"
        ></datablau-breadcrumb>
      </div>
    </div>
    <div class="row-main" style="padding-bottom: 0" id="table-details-wrapper">
      <div class="first-part">
        <div class="first-partLeft">
          <div class="datablauIcon">
            <datablau-icon
              class="iconBox"
              data-type="TABLE"
              :size="48"
            ></datablau-icon>
          </div>
          <div class="logicalNameBox">
            <p class="physicalName overhidden">{{ formData.name }}</p>
          </div>
        </div>
      </div>
      <datablau-tabs
        v-if="readOnly"
        style="
          clear: both;
          position: absolute;
          top: 86px;
          bottom: 0;
          left: 20px;
          right: 20px;
        "
        class="tabs-table-details"
        v-model="activeName"
        @tab-click="tabClick"
      >
        <el-tab-pane
          :label="$t('indicator.demand.basic')"
          name="first"
        ></el-tab-pane>
        <el-tab-pane
          :label="$t('indicator.demand.analysis')"
          name="message"
        ></el-tab-pane>

        <el-tab-pane
          :label="$t('indicator.demand.task')"
          name="task"
        ></el-tab-pane>

        <!-- <el-tab-pane label="图谱分析" name="third">
          <knowledgeGraph
            ref="knowledgeGraph"
            v-if="summaryLoaded"
            :summary="summary"
          ></knowledgeGraph>
        </el-tab-pane> -->
        <!-- <el-tab-pane label="变更历史" name="seventh">
          <datablau-table
            v-loading="changeHistoryLoading"
            :data="changeHistoryArr"
            :show-column-selection="historyOption.showColumnSelection"
            :column-selection="historyOption.columnSelection"
            :border="historyOption.columnResizable"
          >
            <el-table-column
              prop="versionIndex"
              label="版本号"
              show-overflow-tooltip
              min-width="200"
            ></el-table-column>
            <el-table-column
              label="提交时间"
              prop="createTime"
              :formatter="$timeFormatter"
              min-width="200"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              label="提交人"
              prop="submitter"
              show-overflow-tooltip
              min-width="200"
            ></el-table-column>
            <el-table-column
              label="描述或修改记录"
              show-overflow-tooltip
              min-width="200"
            >
              <template slot-scope="scope">
                <span
                  v-for="(record, index) in scope.row.changeHistory"
                  :key="index"
                >
                  {{ record }}
                </span>
              </template>
            </el-table-column>
          </datablau-table>
          <div class="noresult" style="" v-show="changeHistoryArr.length === 0">
            <div class="noresult-img">
              <img src="/static/kgimg/noresult.svg" alt="" />
              <p>暂无数据</p>
            </div>
          </div>
        </el-tab-pane> -->
      </datablau-tabs>
      <div class="tabContent">
        <div v-if="activeName === 'first'">
          <div class="descriptionMessage" style="padding-bottom: 100px">
            <div class="descriptionMessage-title" style="margin-bottom: 10px">
              <p class="message-title">{{ $t('indicator.demand.basic') }}</p>
            </div>
            <el-form
              class="page-form multiple-column"
              inline
              label-position="right"
              :label-width="$i18n.locale === 'en' ? '12em' : '7em'"
              :rules="formRules"
              ref="form"
              :model="formData"
            >
              <div>
                <el-form-item
                  :label="$t('system.systemSetting.dir')"
                  prop="categorys"
                >
                  <el-cascader
                    clearable
                    v-model="formData.categorys"
                    :options="options"
                    filterable
                    :props="{ checkStrictly: true }"
                    ref="cascader"
                    style="margin-top: -5px"
                    :disabled="true"
                  ></el-cascader>
                  <!-- <datablau-input v-model="formData.categoryId"></datablau-input> -->
                </el-form-item>
                <el-form-item
                  :label="$t('indicator.demand.code')"
                  prop="requirementCode"
                >
                  <datablau-input
                    maxlength="200"
                    v-model="formData.requirementCode"
                    :disabled="true"
                  ></datablau-input>
                </el-form-item>
                <br />
                <el-form-item :label="$t('indicator.demand.name')" prop="name">
                  <datablau-input
                    maxlength="200"
                    v-model="formData.name"
                    :disabled="true"
                  ></datablau-input>
                </el-form-item>
                <el-form-item
                  :label="$t('indicator.demand.priority')"
                  prop="requirementPriority"
                >
                  <datablau-select
                    v-model="formData.requirementPriority"
                    :disabled="true"
                  >
                    <el-option
                      v-for="item in priorityOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    ></el-option>
                  </datablau-select>
                </el-form-item>
                <el-form-item
                  :label="$t('indicator.demand.state')"
                  prop="requirementStauts"
                >
                  <datablau-select
                    v-model="formData.requirementStauts"
                    :disabled="true"
                  >
                    <el-option
                      v-for="item in stautsOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    ></el-option>
                  </datablau-select>
                </el-form-item>
                <el-form-item
                  :label="$t('indicator.demand.module')"
                  prop="module"
                >
                  <datablau-select v-model="formData.module" :disabled="true">
                    <el-option
                      :label="$t('indicator.demand.维度')"
                      value="维度"
                    ></el-option>
                    <el-option
                      :label="$t('indicator.demand.指标')"
                      value="指标"
                    ></el-option>
                    <!-- <el-option label="服务" value="服务"></el-option>
                <el-option label="指标建模" value="指标建模"></el-option>
                <el-option label="指标开发" value="指标开发"></el-option> -->
                  </datablau-select>
                </el-form-item>
                <el-form-item
                  :label="$t('indicator.demand.type.label')"
                  prop="dmndType"
                >
                  <datablau-select v-model="formData.dmndType" :disabled="true">
                    <el-option
                      :label="$t('indicator.demand.type.新增')"
                      value="新增"
                    ></el-option>
                    <el-option
                      :label="$t('indicator.demand.type.优化')"
                      value="优化"
                    ></el-option>
                    <el-option
                      :label="$t('indicator.demand.type.缺陷修复')"
                      value="缺陷修复"
                    ></el-option>
                  </datablau-select>
                </el-form-item>
                <el-form-item
                  :label="$t('indicator.demand.source')"
                  prop="requirementSource"
                >
                  <datablau-input
                    maxlength="200"
                    v-model="formData.requirementSource"
                    :disabled="true"
                  ></datablau-input>
                </el-form-item>
                <el-form-item
                  :label="$t('indicator.demand.owner')"
                  prop="requirementLeader"
                >
                  <datablau-select
                    v-model="formData.requirementLeader"
                    :disabled="true"
                  ></datablau-select>
                </el-form-item>
                <el-form-item
                  :label="$t('indicator.demand.scene')"
                  prop="requirementScene"
                >
                  <datablau-input
                    maxlength="200"
                    v-model="formData.requirementScene"
                    :disabled="true"
                  ></datablau-input>
                </el-form-item>
                <el-form-item
                  :label="$t('indicator.demand.businessLine')"
                  prop="businessLine"
                >
                  <datablau-input
                    maxlength="200"
                    v-model="formData.businessLine"
                    :disabled="true"
                  ></datablau-input>
                </el-form-item>
                <br />
                <el-form-item
                  :label="$t('indicator.demand.description')"
                  prop="requirementDescription"
                  style="margin-bottom: 0"
                >
                  <!-- <mavon-editor
                style="height: 300px; width: 900px"
                :toolbars="toolbars"
                v-model="formData.requirementDescription"
              /> -->
                  <datablau-input
                    v-model="formData.requirementDescription"
                    type="textarea"
                    :rows="4"
                    :disabled="true"
                  ></datablau-input>
                </el-form-item>
              </div>
            </el-form>
            <div class="descriptionMessage-title" style="margin-bottom: 10px">
              <p class="message-title">
                {{
                  $t('quality.page.dataQualityRepairJob.documents.enclosure')
                }}
              </p>
            </div>
            <div style="padding-right: 20px">
              <documents
                :content="jobDetails"
                :key="documentKey"
                :readonly="true"
                v-if="haveDocument"
              ></documents>
            </div>
          </div>
        </div>
      </div>
      <div class="tabContent" v-if="activeName === 'message'">
        <div class="fieldMessage" style="height: 100%">
          <!-- <div class="fieldMessage-title">
            <p class="message-title">需求分析</p>
          </div> -->
          <div class="table-area" style="height: 100%; padding-right: 20px">
            <datablau-table :data="tableData" height="100%">
              <el-table-column
                min-width="120"
                :label="$t('assets.summaryInfo.object')"
                prop="dataItem"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ scope.row.dataItem }}
                </template>
              </el-table-column>
              <el-table-column
                min-width="120"
                :label="$t('indicator.demand.analysisProps.description')"
                prop="businessDescription"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ scope.row.businessDescription }}
                </template>
              </el-table-column>
              <el-table-column
                min-width="120"
                :label="$t('common.page.modelCategory')"
                prop="systemName"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ scope.row.systemName }}
                </template>
              </el-table-column>
              <el-table-column
                min-width="120"
                :label="$t('meta.report.dbs')"
                prop="dataDatabase"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ scope.row.dataDatabase }}
                </template>
              </el-table-column>
              <el-table-column
                min-width="140"
                label="SCHEMA"
                prop="dataSchema"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ scope.row.dataSchema }}
                </template>
              </el-table-column>
              <el-table-column
                min-width="120"
                :label="$t('meta.report.table')"
                prop="dataTable"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ scope.row.dataTable }}
                </template>
              </el-table-column>
              <el-table-column
                min-width="120"
                :label="
                  $t('quality.page.qualityExamineJob.displayRules.columnName')
                "
                prop="dataColumnName"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ scope.row.dataColumnName }}
                </template>
              </el-table-column>
              <el-table-column
                min-width="120"
                :label="$t('domain.code.fieldCName')"
                prop="dataColumnChName"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ scope.row.dataColumnChName }}
                </template>
              </el-table-column>
              <el-table-column
                min-width="120"
                :label="$t('meta.DS.treeSubOperation.columnType')"
                prop="columnType"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ scope.row.columnType }}
                </template>
              </el-table-column>
            </datablau-table>
          </div>
        </div>
      </div>
      <div class="tabContent" v-if="activeName === 'task'">
        <div class="fieldMessage">
          <div class="fieldMessage-title" style="margin-bottom: 10px">
            <p class="message-title">
              {{ $t('meta.DS.tableDetail.lineage.relIndex') }}
            </p>
          </div>
          <div class="table-area">
            <datablau-table :data="tableData1" height="100%">
              <el-table-column
                min-width="120"
                :label="$t('indicator.demand.taskProps.category')"
                prop="pathStr"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ scope.row.pathStr }}
                </template>
              </el-table-column>
              <el-table-column
                :label="$t('domain.common.indicatorCoding')"
                prop="domainCode"
                show-overflow-tooltip
                :min-width="100"
              ></el-table-column>
              <el-table-column
                :label="$t('domain.common.indicatorName')"
                prop="chineseName"
                show-overflow-tooltip
                :min-width="100"
              ></el-table-column>
              <el-table-column
                :label="$t('domain.domain.enName')"
                prop="englishName"
                show-overflow-tooltip
                :min-width="100"
              ></el-table-column>
              <el-table-column
                :label="$t('assets.commonHead.englishText')"
                prop="abbreviation"
                show-overflow-tooltip
                :min-width="100"
              ></el-table-column>
              <!--        <el-table-column label="频率" prop=""></el-table-column>-->
              <el-table-column
                :label="$t('indicator.demand.taskProps.unit')"
                prop="measureUnit"
                show-overflow-tooltip
                :min-width="100"
              ></el-table-column>
              <el-table-column
                min-width="120"
                :label="$t('assets.knowledgeGraph.edges.techLeader')"
                prop="techOwner"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ scope.row.techOwner }}
                </template>
              </el-table-column>
              <el-table-column
                min-width="120"
                :label="$t('assets.knowledgeGraph.edges.busiLeader')"
                prop="businessOwner"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ scope.row.businessOwner }}
                </template>
              </el-table-column>
            </datablau-table>
          </div>
        </div>
        <div class="fieldMessage">
          <div class="fieldMessage-title" style="margin-bottom: 10px">
            <p class="message-title">
              {{ $t('indicator.demand.taskProps.dimension') }}
            </p>
          </div>
          <div class="table-area">
            <datablau-table :data="tableData2" height="100%">
              <el-table-column
                min-width="120"
                :label="$t('indicator.demand.taskProps.category')"
                prop="categoryName"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ scope.row.categoryName ? scope.row.categoryName : '' }}
                </template>
              </el-table-column>
              <el-table-column
                min-width="120"
                :label="$t('quality.page.qualityRule.domainTable.chineseName')"
                prop="dimensionName"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ scope.row.dimensionName }}
                </template>
              </el-table-column>
              <el-table-column
                min-width="120"
                :label="$t('quality.page.qualityRule.domainTable.englishName')"
                prop="englishName"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ scope.row.englishName }}
                </template>
              </el-table-column>
              <el-table-column
                min-width="140"
                :label="$t('indicator.demand.taskProps.hierarchySize')"
                prop="hierarchySize"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ scope.row.hierarchySize ? scope.row.hierarchySize : '' }}
                </template>
              </el-table-column>
              <el-table-column
                min-width="120"
                :label="$t('assets.knowledgeGraph.edges.techLeader')"
                prop="technicalLeader"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ scope.row.technicalLeader }}
                </template>
              </el-table-column>
              <el-table-column
                min-width="120"
                :label="$t('assets.knowledgeGraph.edges.busiLeader')"
                prop="businessLeader"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ scope.row.businessLeader }}
                </template>
              </el-table-column>
              <el-table-column
                min-width="120"
                :label="$t('indicator.demand.taskProps.managementLeader')"
                prop="managementLeader"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ scope.row.managementLeader }}
                </template>
              </el-table-column>
            </datablau-table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import details from './details'

export default details
</script>
<style lang="scss" scoped>
@import './details.scss';
.overhidden {
  display: inline-block;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.overhidden2 {
  max-width: 800px;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
<style lang="scss">
.ruleForm {
  .el-form-item {
    min-width: 532px;
    display: inline-block;
    &:nth-of-type(odd) {
      margin-right: 100px;
      /*outline: 1px solid indianred;*/
    }
    margin-right: 100px;
  }
  .el-form-item__error {
    padding-top: 0;
  }
}
</style>
<style lang="scss">
.tabContent .el-input__inner {
  border: none;
}
.tabContent .el-textarea__inner {
  border: none;
}
.tabContent .el-input__prefix {
  display: none;
}
.tabContent .el-input__suffix {
  display: none;
}
</style>
