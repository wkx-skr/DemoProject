<template>
  <div class="examineJob-detail">
    <datablau-dialog
      :title="$t('quality.page.qualityExamineJob.addTechnicalRules')"
      :visible.sync="chooseRulesDialogVisible"
      :width="$i18n.locale === 'zh' ? '1050px' : '1120px'"
      append-to-body
    >
      <choose-quality-rules
        v-if="chooseRulesDialogVisible"
        :selectedRules="rulesDisplay"
        :categoryId="jobDetails.modelCategoryId"
        @closeDialog="closeDialog"
        @qualityRulesSelected="qualityRulesSelected"
        :permissionLevel="'WRITE'"
      ></choose-quality-rules>
    </datablau-dialog>
    <datablau-form-submit>
      <div
        class="mode-edit quality-details"
        v-if="writable"
        style="margin: 64px 20px 20px"
      >
        <div class="row-section" style="margin-bottom: 20px">
          <!-- <span>创建检核任务</span>
        <span class="d-return icon-i-return return" style="transform: translate(20px, 5px)" @click="closeAdd"> {{$t('common.button.return')}}</span> -->
          <!-- <div style="position: relative; height: 35px">
          <el-button
            style="position: absolute; right: 25px"
            type="primary"
            size="mini"
            @click="closeAdd"
          >
            返回
          </el-button>
        </div> -->
          <div class="db-fieldMessage-title">
            <p class="message-title">
              {{ $t('quality.page.qualityExamineJob.essential') }}
            </p>
          </div>
        </div>
        <el-form
          :inline-message="true"
          label-position="right"
          label-width="180px"
          ref="form"
          :rules="validateRules"
          :model="jobDetails"
        >
          <el-form-item
            :label="$t('quality.page.qualityExamineJob.taskName')"
            prop="name"
          >
            <datablau-input
              maxlength="100"
              v-model="jobDetails.name"
              :placeholder="
                $t('quality.page.qualityExamineJob.taskNamePlaceholder')
              "
              clearable
              style="width: 500px"
            ></datablau-input>
            <!--          <el-checkbox v-model="disable">停用</el-checkbox>-->
          </el-form-item>
          <!-- <el-form-item
          label="调度方式"
        >
          <el-radio v-model="scheduleType" label="wait">{{labelFormatter('scheduleType', 'wait')}}</el-radio>
          <el-radio v-model="scheduleType" label="run">{{labelFormatter('scheduleType', 'run')}}</el-radio>
          <el-radio v-model="scheduleType" label="schedule">{{labelFormatter('scheduleType', 'schedule')}}</el-radio>
        </el-form-item> -->
          <el-form-item
            :label="$t('quality.page.qualityExamineJob.runtime')"
            :required="true"
          >
            <datablau-radio v-model="isUserCron">
              <el-radio :label="false">
                {{ $t('quality.page.qualityExamineJob.choice') }}
              </el-radio>
              <el-radio :label="true">
                {{ $t('quality.page.qualityExamineJob.custom') }}
              </el-radio>
            </datablau-radio>
          </el-form-item>
          <el-form-item
            :label="$t('quality.page.qualityExamineJob.repetitionPeriod')"
            :required="true"
            v-if="isUserCron"
          >
            <datablau-input
              :placeholder="
                $t('quality.page.qualityExamineJob.cronPlaceholder')
              "
              class="form-item-width-input"
              v-model="jobDetails.schedule"
            ></datablau-input>
          </el-form-item>
          <!-- <br /> -->
          <select-period
            v-if="!isUserCron"
            style="margin-left: 120px; color: #606266; margin-top: 16px"
            @getCronString="getCronString"
            :returnEachChange="true"
            :cron="jobDetails.schedule"
            defaultCheck="scheduleByWeekdays"
          ></select-period>
          <el-form-item
            :label="$t('quality.page.qualityExamineJob.timeFiltering')"
          >
            <datablau-select
              style="width: 500px"
              multiple
              v-model="canExecuteDateTemplates"
              clearable
            >
              <el-option
                v-for="o in dateTemplates"
                :key="o.id"
                :label="o.name"
                :value="o.id"
              ></el-option>
            </datablau-select>
          </el-form-item>
        </el-form>
        <div class="row-section" style="margin-top: 40px; margin-bottom: 20px">
          <div class="db-fieldMessage-title">
            <p class="message-title">
              {{ $t('quality.page.qualityExamineJob.problemManagement') }}
            </p>
          </div>
        </div>
        <el-form
          :inline-message="true"
          label-position="right"
          label-width="180px"
          ref="form"
          :rules="validateRules"
          :model="jobDetails"
        >
          <el-form-item
            :label="$t('quality.page.qualityExamineJob.businessSystem')"
            prop="modelCategoryId"
          >
            <datablau-select
              v-model="jobDetails.modelCategoryId"
              @change="handleModelCategoryChange"
              @focus="categoryFocus"
              filterable
              :placeholder="$t('quality.page.qualityExamineJob.selectSystem')"
              ref="select"
              style="display: inline-block; width: 500px"
            >
              <el-option
                v-for="item in systemList"
                :key="item.categoryId"
                :label="
                  item.categoryName + '（' + item.categoryAbbreviation + '）'
                "
                :value="item.categoryId"
              ></el-option>
            </datablau-select>
            &nbsp;
            <!--          <el-checkbox v-model="autoDistributeIssue" @change="disabledEmail">发现问题自动登记</el-checkbox>-->
          </el-form-item>
          <el-form-item label="邮件通知">
            <datablau-switch v-model="sendMail"></datablau-switch>
          </el-form-item>
          <el-form-item
            v-show="sendMail"
            :label="$t('quality.page.qualityExamineJob.recipients')"
            prop="emailReceivers"
          >
            <datablau-button
              style="margin-right: 10px"
              type="text"
              @click="selectStaff"
              class="iconfont icon-tianjia"
            >
              新增
            </datablau-button>
            <span style="color: #555555; vertical-align: middle">
              共{{ emailReceivers.length }}名
            </span>
            <div>
              <el-tag
                v-for="(username, idx) in emailReceivers"
                :key="username"
                closable
                style="margin-left: 10px"
                @close="handleClose(idx)"
              >
                {{ username }}
              </el-tag>
            </div>
          </el-form-item>
        </el-form>
        <div
          class="db-fieldMessage-title"
          style="margin-top: 40px; margin-bottom: 20px"
        >
          <p class="message-title">
            {{ $t('quality.page.qualityExamineJob.qualityRule') }}
          </p>
        </div>
        <div class="search-part">
          <el-form
            class="examineJob-search-part"
            size="mini"
            inline
            ref="searchForm"
            style="display: inline-block; position: relative"
            :model="searchFormData"
          >
            <el-form-item prop="ruleName" style="margin-right: 20px">
              <datablau-input
                clearable
                :placeholder="
                  $t('quality.page.qualityExamineJob.rulePlaceholder')
                "
                v-model="searchFormData.ruleName"
              ></datablau-input>
            </el-form-item>
            <el-form-item
              :label="
                $t('quality.page.qualityExamineJob.rulesDisplay.bigClass')
              "
              prop="bigClassSelectOption"
              style="margin-right: 20px"
            >
              <datablau-select
                v-model="searchFormData.bigClassSelectOption"
                @change="getSmallClassList()"
                clearable
              >
                <el-option
                  v-for="item in $bigClassList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </datablau-select>
            </el-form-item>
            <el-form-item
              :label="
                $t('quality.page.qualityExamineJob.rulesDisplay.ruleSubclass')
              "
              prop="smallClassSelectOption"
              style="margin-right: 20px"
            >
              <datablau-select
                v-model="searchFormData.smallClassSelectOption"
                clearable
              >
                <el-option
                  v-for="item in smallClassList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </datablau-select>
            </el-form-item>
            <el-form-item
              :label="
                $t('quality.page.qualityExamineJob.rulesDisplay.businessType')
              "
              prop="bizTypeSelectOption"
              style="margin-right: 10px"
            >
              <el-select v-model="searchFormData.bizTypeSelectOption" clearable>
                <el-option
                  v-for="item in $typeList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <datablau-button type="normal" @click="showSearch">
                {{ $t('common.button.search') }}
              </datablau-button>
              <datablau-button type="secondary" @click="reset">
                {{ $t('common.button.reset') }}
              </datablau-button>
            </el-form-item>
          </el-form>
          <div style="text-align: right">
            <datablau-button
              type="secondary"
              @click="removeAllRules"
              :disabled="removeIsPending"
              class="el-icon-delete"
            >
              {{ $t('quality.page.qualityExamineJob.removeAll') }}
            </datablau-button>
            <datablau-button
              type="secondary"
              @click="chooseRulesDialogVisible = true"
              :disabled="!jobDetails.modelCategoryId"
              class="el-icon-plus"
            >
              {{ $t('quality.page.qualityExamineJob.addTechnicalRules') }}
            </datablau-button>
          </div>
        </div>
        <div
          class="row-table sub-table-row"
          :class="jobDetails.name"
          style="height: 400px"
        >
          <datablau-table
            :data="rulesDisplay"
            ref="multipleTable"
            v-if="showRuleTable"
            v-loading="smallTableLoading"
            height="100%"
          >
            <el-table-column
              prop="name"
              :label="$t('quality.page.qualityExamineJob.rulesDisplay.name')"
              min-width="120"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              prop="targetDB"
              :label="$t('quality.page.qualityExamineJob.rulesDisplay.system')"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              prop="levelOneName"
              :label="
                $t('quality.page.qualityExamineJob.rulesDisplay.bigClass')
              "
              show-overflow-tooltip
            >
              <!--            <template slot-scope="scope">-->
              <!--              <span>{{bigRuleFormatter(rulesDisplay[scope.$index].bigClassSelectOption)}}</span>-->
              <!--            </template>-->
            </el-table-column>
            <!-- <el-table-column
              prop="levelTwoName"
              :label="
                $t('quality.page.qualityExamineJob.rulesDisplay.ruleSubclass')
              "
              show-overflow-tooltip
            > -->
            <!--            <template slot-scope="scope">-->
            <!--              <span>{{smallRuleFormatter(rulesDisplay[scope.$index].smallClass)}}</span>-->
            <!--            </template>-->
            <!-- </el-table-column> -->
            <el-table-column
              prop="bizTypeSelectOption"
              :label="
                $t('quality.page.qualityExamineJob.rulesDisplay.businessType')
              "
              show-overflow-tooltip
            >
              <!--            <template slot-scope="scope">-->
              <!--              <span>{{typeFormatter(rulesDisplay[scope.$index].bizType)}}</span>-->
              <!--            </template>-->
            </el-table-column>
            <!--          <el-table-column prop="state" label="规则类型" show-overflow-tooltip>-->
            <!--            <template slot-scope="scope">-->
            <!--              <span>{{stateFormatter(rulesDisplay[scope.$index].state)}}</span>-->
            <!--            </template>-->
            <!--          </el-table-column>-->
            <el-table-column
              prop="publicState"
              :label="$t('quality.page.dataQualityRules.table.releaseStatus')"
              width="130"
            >
              <template slot-scope="scope">
                {{ statusFormatter(scope.row) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="creator"
              :label="$t('quality.page.qualityExamineJob.rulesDisplay.creator')"
              width="130"
            >
              <template slot-scope="scope">
                <span>{{ scope.row.creator }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="createTime"
              :label="
                $t('quality.page.qualityExamineJob.rulesDisplay.createTime')
              "
              width="190"
              :formatter="$timeFormatter"
            ></el-table-column>
            <el-table-column
              :label="
                $t('quality.page.qualityExamineJob.rulesDisplay.operation')
              "
              align="center"
              fixed="right"
            >
              <template slot-scope="scope">
                <datablau-button
                  type="text"
                  @click="deleteRule(scope.row.id)"
                  :disabled="!scope.row.auth"
                >
                  {{ $t('common.button.remove') }}
                </datablau-button>
              </template>
            </el-table-column>
          </datablau-table>
          <datablau-pagination
            @current-change="handleCurrentPageChange"
            @size-change="handlePageSizeChange"
            :current-page.sync="multipleCriteria.page.currentPage"
            :page-sizes="[10, 20, 50]"
            :page-size.sync="multipleCriteria.page.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            class="page"
            style="margin-top: 10px"
          ></datablau-pagination>
        </div>
        <list-in-rule
          style="margin-top: 40px"
          ref="listInRule"
          :item-id="details ? details.id : -1"
          from-job
          @update-parameterIds="updateParameterIds"
        ></list-in-rule>
      </div>
      <div slot="buttons">
        <datablau-button
          type="important"
          @click="onSubmit"
          :disabled="removeIsPending"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
        <datablau-button type="secondary" @click="removeTab">
          {{ $t('common.button.cancel') }}
        </datablau-button>
      </div>
    </datablau-form-submit>

    <div class="quality-details" v-if="!writable">
      <div class="row-title">
        <div class="title">{{ jobDetails.name }}</div>
        <el-button
          class="edit-btn"
          size="small"
          type="primary"
          v-if="jobDetails.writable"
          @click="writable = true"
        >
          {{ $t('common.button.edit') }}
        </el-button>
      </div>
      <div class="row-description"></div>
      <div class="row-section">
        <section-label :edit="false">
          {{ $t('quality.page.qualityExamineJob.essential') }}
        </section-label>
      </div>
      <div class="item">
        <div class="label">
          {{ $t('quality.page.qualityExamineJob.schedulingMode') }}
        </div>
        <div class="value">
          {{ labelFormatter('scheduleType', scheduleType) }}
        </div>
      </div>
      <div class="item" v-if="scheduleType === 'schedule'">
        <div class="label">
          {{ $t('quality.page.qualityExamineJob.schedulingTasks') }}
        </div>
        <div class="value">
          {{
            jobDetails.selectedWeekDays
              .map(item => labelFormatter('selectedWeekDays', item))
              .join('、')
          }}
        </div>
      </div>
      <div class="item" v-if="scheduleType === 'schedule'">
        <div class="label">
          {{ $t('quality.page.qualityExamineJob.runtime') }}
        </div>
        <div class="value">
          {{ moment(jobDetails.selectedTime).format('HH:mm:ss') }}
        </div>
      </div>
      <div class="item">
        <div class="label">
          {{ $t('quality.page.qualityExamineJob.rulesDisplay.system') }}
        </div>
        <div class="value" v-if="jobDetails.modelCategoryId">
          {{
            $modelCategories.filter(
              item => item.categoryId === jobDetails.modelCategoryId
            )[0].displayName
          }}
        </div>
      </div>
      <!--      <div class="item">
        <div class="label">
          {{ $t('quality.page.qualityExamineJob.dataSource') }}
        </div>
        <div
          class="value"
          v-if="jobDetails.modelId && dataSources && dataSources.length > 0"
        >
          {{
            dataSources.filter(item => item.modelId === jobDetails.modelId)[0]
              .definition
          }}
        </div>
      </div>-->
      <div class="item">
        <div class="label">
          {{ $t('quality.page.qualityExamineJob.owner') }}
        </div>
        <div class="value">{{ jobDetails.owner }}</div>
      </div>
      <div class="row-section" style="margin-top: 30px">
        <section-label :edit="false">
          {{ $t('quality.page.qualityExamineJob.qualityRule') }}
        </section-label>
      </div>
      <div class="row-table sub-table-row" :class="jobDetails.name">
        <el-table
          :data="rulesDisplay"
          class="datablau-table inner"
          v-if="showRuleTable"
          :height="tableHeight"
        >
          <el-table-column width="40" label="#">
            <template slot-scope="scope">
              {{ scope.$index + 1 }}
            </template>
          </el-table-column>
          <el-table-column width="26">
            <template slot-scope="scope">
              <span class="tree-icon tech-rule"></span>
            </template>
          </el-table-column>
          <el-table-column
            prop="name"
            :label="$t('quality.page.qualityExamineJob.rulesDisplay.name')"
            min-width="180"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            prop="type"
            :label="$t('quality.page.qualityExamineJob.rulesDisplay.ruleImpl')"
            :min-width="100"
          >
            <template slot-scope="scope">
              <rule-impl :type="scope.row.type" :key="scope.row.id"></rule-impl>
            </template>
          </el-table-column>
          <el-table-column
            min-width="180"
            show-overflow-tooltip
            prop="catalog"
            :label="$t('quality.page.qualityExamineJob.rulesDisplay.catalog')"
          ></el-table-column>
          <el-table-column
            prop="category"
            :label="$t('quality.page.qualityExamineJob.rulesDisplay.ruleType')"
            :formatter="$categoryFormatter"
          ></el-table-column>
          <el-table-column
            prop="creator"
            :label="$t('quality.page.qualityExamineJob.rulesDisplay.creator')"
            width="130"
          >
            <template slot-scope="scope">
              <span>{{ scope.row.creator }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="createTime"
            :label="
              $t('quality.page.qualityExamineJob.rulesDisplay.createTime')
            "
            width="190"
            :formatter="$timeFormatter"
          ></el-table-column>
        </el-table>
      </div>
      <div class="row-section" style="margin-top: 20px; margin-bottom: 0">
        <section-label :edit="false">
          {{ $t('quality.page.qualityExamineJob.repairTask') }}
        </section-label>
      </div>

      <div class="item full-width" v-if="autoCreateTask">
        <i
          class="el-icon-check"
          style="font-weight: bold; font-size: 16px; color: #6acf72"
        ></i>
        {{ $t('quality.page.qualityExamineJob.sameCreatTask') }}
      </div>
      <div class="item full-width" v-else>
        <i
          class="el-icon-close"
          style="font-weight: bold; font-size: 16px; color: #d94e00"
        ></i>
        {{ $t('quality.page.qualityExamineJob.noCreatTask') }}
      </div>
      <div class="item full-width" v-if="sendMail">
        <i
          class="el-icon-check"
          style="font-weight: bold; font-size: 16px; color: #6acf72"
        ></i>
        {{ $t('quality.page.qualityExamineJob.emailCreatTask') }}
      </div>
      <div class="item full-width" v-else>
        <i
          class="el-icon-close"
          style="font-weight: bold; font-size: 16px; color: #d94e00"
        ></i>
        {{ $t('quality.page.qualityExamineJob.nosendEmail') }}
      </div>
      <div class="row-table" style="margin-top: 5px">
        <el-table
          class="datablau-table inner"
          :data="mailList"
          v-show="sendMail && mailList && mailList.length > 0"
        >
          <el-table-column width="40" label="#">
            <template slot-scope="scope">
              {{ scope.$index + 1 }}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('quality.page.qualityExamineJob.addresseeEmail')"
            prop="address"
          ></el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import jobDetail from './jobDetail.js'
export default jobDetail
</script>
<style lang="scss" scoped>
.examineJob-detail {
  margin-top: 64px;
  margin-left: 20px;
  margin-right: 20px;
  .quality-details .row-table {
    padding: 0;
  }
}
</style>
<style lang="scss">
.examineJob-detail {
  .el-form-item {
    margin-bottom: 16px;
  }
  .el-form-item--mini .el-form-item__label {
    line-height: 34px;
  }
  .el-form.page-form .el-form-item__label {
    line-height: 34px;
  }
  .examineJob-search-part {
    .el-form-item__label {
      padding-right: 6px;
    }
  }
}
</style>
