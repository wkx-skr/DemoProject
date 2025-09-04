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
          <div v-if="formData.projectName " style="vertical-align: super;
    display: inline-block;
    margin-left: 15px;
    color: #bbb;">
            <p class="" style="display: flex;
    align-items: center;">项目名称：{{ formData.projectName }}<span class="physicalName overhidden" style="margin-left: 10px;
    font-size: 16px;
    color: #999;" v-if="this.$route.query.version">(历史-版本号：{{this.$route.query.version}}）</span></p>
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
          left: 0px;
          right: 20px;
        "
        class="tabs-table-details"
        v-model="activeName"
        @tab-click="tabClick"
      >
        <el-tab-pane
          label="需求信息"
          name="first"
        ></el-tab-pane>
        <el-tab-pane
          label="技术信息"
          name="message"
        ></el-tab-pane>

        <el-tab-pane
          :label="$t('indicator.demand.task')"
          name="task"
        ></el-tab-pane>
        <el-tab-pane
        v-if="!this.$route.query.version"
          label="变更历史"
          name="history"
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
                  label="优先级别"
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
                  label="类型"
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
                  :label="$t('indicator.demand.owner')"
                  prop="requirementLeader"
                >
                  <datablau-select
                    v-model="formData.requirementLeader"
                    :disabled="true"
                  ></datablau-select>
                </el-form-item>
                <el-form-item label="需求日期" >
                  <datablau-datePicker
                    v-model="formData.requirementDate"
                    :placeholder="'选择日期'"
                    value-format="timestamp"
                    type="date"
                    ref="eventStartTime"
                    :disabled="true"
                  ></datablau-datePicker>
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
            <div >
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
          <div class="fieldMessage-title">
            <p class="message-title">技术信息</p>
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
                <el-form-item label="预计完成" prop="doneTime">
                    <datablau-datePicker
                    :now-before-state="true"
                      v-model="formData.doneTime"
                      :placeholder="'选择日期'"
                      value-format="timestamp"
                      type="date"
                      ref="doneTime"
                      :disabled="true"
                    ></datablau-datePicker>
                </el-form-item>
                <el-form-item
                    label="负责人"
                    prop="techDirector"
                  >
                    <datablau-input
                      v-model="formData.techDirector"
                      readonly
                      :disabled="true"
                    ></datablau-input>
                </el-form-item>
                <br />
                <el-form-item
                label="技术描述"
                prop="techDescription"
              >
                <datablau-input
                  v-model="formData.techDescription"
                  type="textarea"
                  :rows="4"
                  :disabled="true"
                ></datablau-input>
              </el-form-item>
              </div>
          </el-form>
          <div class="fieldMessage-title">
            <p class="message-title">关联数据项</p>
          </div>
          <div class="table-area" style="height: 100%;">
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
        <div class="fieldMessage" v-if="formData.module === '维度' || formData.module === '指标'">
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
        <div class="fieldMessage" v-if="formData.module === '维度' || formData.module === '指标'">
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
        <div class="fieldMessage" v-if="formData.module === 'D3'">
          <div class="fieldMessage-title" style="margin-bottom: 10px">
            <p class="message-title">
             相关工作流
            </p>
          </div>
          <div style="position: absolute;
    top: 25px;
    left: 0;
    right: 20px;
    bottom: 0;">
            <datablau-table :data="workflowTableData" height="100%">
              <el-table-column
                  type="index"
                  width="50">
                </el-table-column>
                <el-table-column
                  label="工作流名称"
                  prop="name"
                  show-overflow-tooltip
                >
                  <template slot-scope="scope">
                    {{ scope.row.name }}
                  </template>
                </el-table-column>
                <el-table-column
                  label="状态"
                  prop="releaseState"
                  show-overflow-tooltip
                >
                  <template slot-scope="scope">
                    {{ scope.row.releaseState === 'ONLINE' ? '上线' : '下线' }}
                  </template>
                </el-table-column>
                <el-table-column
                  label="创建时间"
                  prop="createTime"
                  :formatter="$timeFormatter"
                  show-overflow-tooltip
                >
                  <template slot-scope="scope">
                    {{ scope.row.createTime }}
                  </template>
                </el-table-column>
                <el-table-column
                  label="更新时间"
                  prop="updateTime"
                  :formatter="$timeFormatter"
                  show-overflow-tooltip
                >
                  <template slot-scope="scope">
                    {{ scope.row.updateTime }}
                  </template>
                </el-table-column>
            </datablau-table>
          </div>
        </div>
      </div>
      <div class="tabContent" style="top: 122px;" v-if="activeName === 'history'">
        <div class="fieldMessage">
          <div style="position: absolute;left: 0;
          top: 0;right: 20px;bottom: 0;">
            <datablau-table :data="historyData" height="100%">
              <el-table-column
                label="版本号"
                prop="version"
                show-overflow-tooltip
                :min-width="100"
              ></el-table-column>
              <el-table-column
                label="提交时间"
                :formatter="$timeFormatter"
                prop="historyCreateTime"
                show-overflow-tooltip
                :min-width="100"
              ></el-table-column>
              <el-table-column
                label="提交人"
                prop="requirementEditor"
                show-overflow-tooltip
                :min-width="100"
              ></el-table-column>
              <el-table-column
                label="描述或修改记录"
                show-overflow-tooltip
                :min-width="100"
              >
              <template >
                需求变更
              </template>
            </el-table-column>
              <el-table-column
                min-width="120"
                label="操作"
                prop="techOwner"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  <datablau-button
                    type="text"
                    @click="historyView(scope.row)"
                  >查看</datablau-button>
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
