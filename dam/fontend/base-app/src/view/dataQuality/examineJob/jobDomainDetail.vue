<template>
  <div class="jobDomainDetail-detail">
    <datablau-form-submit>
      <div
        class="mode-edit quality-details"
        v-if="writable"
        style="margin: 64px 20px 20px"
      >
        <div class="row-section" style="margin-bottom: 20px">
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
          </el-form-item>
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
        <div class="dataRule-content">
          <p>
            <datablau-detail-subtitle
              title="数据规则范围"
              mb="0px"
            ></datablau-detail-subtitle>
            <span style="color: #777777; font-size: 12px; margin-left: 8px">
              <i class="iconfont icon-tips" style="font-size: 16px"></i>
              数据修改实时保存
            </span>
          </p>
          <el-dropdown @command="handleCommand" trigger="click">
            <datablau-button type="normal" class="iconfont icon-tianjia">
              新建数据范围规则
              <i
                class="el-icon-arrow-down el-icon--right"
                style="color: #409eff"
              ></i>
            </datablau-button>
            <el-dropdown-menu slot="dropdown" class="menu head-dropdown">
              <el-dropdown-item command="domainAdd">
                <i class="iconfont icon-tianjia"></i>
                基于基础标准
              </el-dropdown-item>
              <el-dropdown-item command="domainCode">
                <i class="iconfont icon-tianjia"></i>
                基于标准代码
              </el-dropdown-item>
              <el-dropdown-item command="metaDataAdd">
                <i class="iconfont icon-tianjia"></i>
                基于元数据
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <div class="dataRule-data">
          <div
            style="
              margin: 0 auto;
              display: flex;
              flex-flow: column;
              justify-content: center;
              align-items: center;
            "
            v-if="dataRuleData.length === 0"
          >
            <img src="../../searchGlobal/nothing.svg" alt="" />
            <p style="padding-top: 6px">暂无数据</p>
          </div>
          <div class="dataRule-dataleft" v-show="dataRuleData.length !== 0">
            <div
              style="
                position: absolute;
                top: 5px;
                left: 8px;
                right: 8px;
                bottom: 50px;
              "
            >
              <datablau-table
                :data="dataRuleData"
                height="100%"
                row-key="label"
                highlight-current-row
                ref="dataRuleData"
                @row-click="dataRuleDataRowClick"
              >
                <el-table-column width="25px">
                  <template slot-scope="scope">
                    <div style="display: flex; align-items: center">
                      <datablau-icon
                        style="flex-shrink: 0"
                        data-type="table"
                        :isIcon="true"
                        :size="18"
                      ></datablau-icon>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="tablePhysicalName"
                  label="表/视图名称"
                  show-overflow-tooltip
                  width="120"
                >
                  <template slot-scope="scope">
                    {{ scope.row.tablePhysicalName }}
                    <span
                      v-if="
                        scope.row.tableLogicalName &&
                        scope.row.tableLogicalName !== ''
                      "
                    >
                      ({{ scope.row.tableLogicalName }})
                    </span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="modelName"
                  label="数据源"
                  show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                  prop="modelCategoryName"
                  label="业务系统"
                  show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                  label="条件设置"
                  show-overflow-tooltip
                  width="200"
                >
                  <template slot-scope="scope">
                    <datablau-button
                      type="icon"
                      class="iconfont icon-tianjia"
                      @click.stop="conditionAdd(scope.row)"
                    ></datablau-button>
                    <span
                      v-if="scope.row.condition"
                      style="
                        width: 140px;
                        height: 24px;
                        background: rgba(124, 137, 168, 0.1);
                        border-radius: 2px;
                        display: inline-block;
                        padding: 0 4px;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        color: #7c89a8;
                        vertical-align: bottom;
                      "
                    >
                      {{ scope.row.condition }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column
                  label="操作"
                  header-align="center"
                  align="center"
                  fixed="right"
                  width="100"
                  key="cluResOper"
                >
                  <template slot-scope="scope">
                    <span>
                      <datablau-button
                        type="icon"
                        size="small"
                        @click="deleteDataRuleRangeTableId(scope.row)"
                      >
                        <datablau-tooltip content="删除" placement="top">
                          <i class="iconfont icon-delete"></i>
                        </datablau-tooltip>
                      </datablau-button>
                    </span>
                  </template>
                </el-table-column>
              </datablau-table>
            </div>
            <div
              class="dataRuleData-pagination"
              style="
                position: absolute;
                left: 8px;
                right: 8px;
                bottom: 0px;
                height: 50px;
                display: flex;
                align-items: center;
                justify-content: end;
                border-top: 1px solid #dddddd;
              "
            >
              <datablau-pagination
                @current-change="dataRuleDataCurrentChange"
                @size-change="dataRuleDataSizeChange"
                :current-page="dataRuleDataPage"
                :page-size="dataRuleDataSize"
                :total="dataRuleDataTotal"
                layout="total, sizes, prev, pager, next, jumper"
              ></datablau-pagination>
            </div>
          </div>
          <div class="dataRule-dataright" v-show="dataRuleData.length !== 0">
            <p
              style="
                padding-top: 13px;
                padding-left: 8px;
                display: flex;
                align-items: center;
              "
            >
              <datablau-icon
                style="flex-shrink: 0; margin-right: 3px"
                data-type="table"
                :isIcon="true"
                :size="18"
                v-if="dataRuleDataRow.tablePhysicalName"
              ></datablau-icon>
              {{ dataRuleDataRow.tablePhysicalName }}
              <span v-if="dataRuleDataRow.tableLogicalName">
                ( {{ dataRuleDataRow.tableLogicalName }})
              </span>
            </p>
            <div
              style="
                position: absolute;
                top: 45px;
                left: 8px;
                right: 8px;
                bottom: 0px;
              "
            >
              <datablau-table :data="dataRuleColumnData" height="100%">
                <el-table-column
                  prop="physicalName"
                  label="字段名称"
                  show-overflow-tooltip
                >
                  <template slot-scope="scope">
                    {{ scope.row.physicalName }}
                    <span v-if="scope.row.logicalName">
                      ({{ scope.row.logicalName }})
                    </span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="domainName"
                  label="数据标准"
                  show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                  prop="standardName"
                  label="标准代码"
                  show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                  prop="chineseName"
                  label="数据规则"
                  width="300"
                >
                  <template slot-scope="scope">
                    <div style="display: flex; align-items: center">
                      <datablau-button
                        type="icon"
                        @click="
                          updateRuleClick(
                            scope.row.dataRuleStatusList,
                            scope.row.id,
                            scope.row.domainCode
                          )
                        "
                      >
                        <i class="iconfont icon-tianjia"></i>
                      </datablau-button>
                      <span
                        class="builtInRuleType"
                        v-for="(
                          t, index
                        ) in scope.row.dataRuleStatusList.filter(
                          item => item.enable === true
                        )"
                        v-show="scope.row.dataRuleStatusList && index < 2"
                        :key="index"
                        :style="{
                          background:
                            t.dataRuleType !== 'REGEXP'
                              ? 'rgba(111, 84, 235, 0.1)'
                              : 'rgba(78,190,247,0.1)',
                          color:
                            t.dataRuleType !== 'REGEXP' ? '#6f54eb' : '#4ebef7',
                        }"
                      >
                        {{ t.name }}
                      </span>
                      <el-popover
                        placement="bottom"
                        width="318"
                        trigger="click"
                      >
                        <div style="height: 250px; position: relative">
                          <p
                            style="
                              color: #555555;
                              font-size: 14px;
                              padding: 8px;
                              font-weight: 500;
                            "
                          >
                            数据规则共
                            {{
                              scope.row.dataRuleStatusList.filter(
                                item => item.enable === true
                              ).length
                            }}
                            条
                          </p>
                          <div
                            style="
                              position: absolute;
                              top: 32px;
                              left: 12px;
                              right: 12px;
                              bottom: 0;
                            "
                          >
                            <datablau-table
                              :data="
                                scope.row.dataRuleStatusList.filter(
                                  item => item.enable === true
                                )
                              "
                              height="100%"
                            >
                              <el-table-column
                                prop="name"
                                label="名称"
                                show-overflow-tooltip
                              ></el-table-column>
                              <el-table-column
                                prop="description"
                                label="描述"
                                show-overflow-tooltip
                              ></el-table-column>
                            </datablau-table>
                          </div>
                        </div>
                        <datablau-button
                          slot="reference"
                          type="text"
                          style="margin-left: 4px"
                          v-show="
                            scope.row.dataRuleStatusList.filter(
                              item => item.enable === true
                            ).length > 0
                          "
                        >
                          更多
                        </datablau-button>
                      </el-popover>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  label="操作"
                  header-align="center"
                  align="center"
                  fixed="right"
                  width="100"
                  key="cluResOper"
                >
                  <template slot-scope="scope">
                    <span>
                      <datablau-button
                        type="icon"
                        size="small"
                        @click="deleteDataRuleRangeId(scope.row)"
                      >
                        <datablau-tooltip content="删除" placement="top">
                          <i class="iconfont icon-delete"></i>
                        </datablau-tooltip>
                      </datablau-button>
                    </span>
                  </template>
                </el-table-column>
              </datablau-table>
            </div>
          </div>
        </div>
      </div>
      <div slot="buttons">
        <datablau-button type="important" @click="onSubmit">
          {{ $t('common.button.save') }}
        </datablau-button>
        <datablau-button type="secondary" @click="removeTab">
          {{ $t('common.button.close') }}
        </datablau-button>
      </div>
    </datablau-form-submit>
    <datablau-dialog
      size="xl"
      :visible.sync="simplePageVisible"
      height="560px"
      @close="closeDialogDataRule"
    >
      <template slot="title">
        <p style="font-size: 16px; color: #555555">
          新建数据范围规则
          <span style="font-size: 13px; color: #777777; padding-left: 8px">
            {{ simplePageList[simplePage] }}
          </span>
        </p>
      </template>
      <div class="simplePage-columnList">
        <div class="columnListleft">
          <p>共{{ allRightValue ? allRightValueNum : columnList.length }}条</p>
          <datablau-button type="text" @click="closeColumnList">
            全部清除
          </datablau-button>
        </div>
        <div class="columnListright">
          <datablau-tooltip
            v-for="(v, i) in columnList"
            :content="v.name"
            placement="top"
            :disabled="tooltiplong"
            :key="i"
          >
            <el-tag
              @mouseover.native="getTooltip($event)"
              style="margin-left: 4px; margin-bottom: 4px"
              size="small"
              closable
              :key="v.objectId"
              @close="handleCloseColumn(v, i)"
            >
              <span
                style="
                  display: inline-block;
                  max-width: 64px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                  vertical-align: bottom;
                "
              >
                {{ v.name }}
              </span>
            </el-tag>
          </datablau-tooltip>
        </div>
      </div>
      <div
        class="simplePage-content"
        :style="{
          top: columnList.length > 0 ? '68px' : '0',
          borderTop: columnList.length > 0 ? '1px solid #dddddd' : 'none',
        }"
      >
        <div
          class="simplePage-tree"
          :style="{
            height: columnList.length > 0 ? '382px' : '448px',
          }"
        >
          <datablau-input
            v-model="treeKeyword"
            :iconfont-state="true"
            placeholder="搜索"
            clearable
            style="width: 200px"
          ></datablau-input>
          <datablau-tree
            v-if="simplePageVisible"
            ref="mainTree"
            :style="{
              height: columnList.length > 0 ? '330px' : '390px',
            }"
            style="overflow: auto; height: 330px; margin-top: 8px"
            class="grey-tree"
            :data="treeData"
            :props="defaultPropsList[simplePage]"
            :show-checkbox="false"
            :node-key="simplePageListKey[simplePage]"
            :key="treeKey"
            :default-expanded-keys="expandedKeys"
            :default-expand-all="false"
            :expand-on-click-node="false"
            :highlight-current="true"
            auto-expand-parent
            :check-strictly="false"
            :filter-node-method="filterNode"
            :data-supervise="true"
            :current-node-key="defaultCurrentNode"
            :showOverflowTooltip="true"
            :data-icon-function="dataIconFunction"
            @node-click="handleItemClicked"
          ></datablau-tree>
        </div>
        <div
          class="simplePage-father"
          :style="{
            height: columnList.length > 0 ? '382px' : '448px',
          }"
        >
          <datablau-input
            v-model="firstKeyword"
            :iconfont-state="true"
            placeholder="搜索"
            clearable
            style="width: 200px"
          ></datablau-input>
          <datablau-switch
            v-if="simplePage === 'metaDataAdd'"
            v-model="allLeftValue"
            style="display: inline-block; margin-left: 16px"
            @change="changeAllLeftValue"
            active-text="全选"
            :disabled="tableDataLeft.length === 0"
          ></datablau-switch>
          <div
            style="
              position: absolute;
              top: 52px;
              left: 8px;
              right: 8px;
              bottom: 40px;
            "
          >
            <datablau-table
              :data="tableDataLeft"
              :data-selectable="!allLeftValue"
              height="100%"
              @selection-change="handleSelectionChangeLeft"
              :reserve-selection="true"
              :auto-hide-selection="false"
              show-column-selection
              row-key="label"
              ref="tableDataLeft"
              v-if="simplePageVisible"
            >
              <el-table-column width="24px">
                <template slot-scope="scope">
                  <div style="display: flex; align-items: center">
                    <datablau-icon
                      v-if="simplePage === 'domainAdd'"
                      style="flex-shrink: 0"
                      data-type="datastandard"
                      :isIcon="true"
                      :size="18"
                    ></datablau-icon>
                    <datablau-icon
                      v-if="simplePage === 'domainCode'"
                      style="flex-shrink: 0"
                      :data-type="'index'"
                      :size="18"
                    ></datablau-icon>
                    <datablau-icon
                      v-if="
                        simplePage === 'metaDataAdd' &&
                        scope.row.type === 'TABLE'
                      "
                      style="flex-shrink: 0"
                      data-type="table"
                      :isIcon="true"
                      :size="18"
                    ></datablau-icon>
                    <datablau-icon
                      v-if="
                        simplePage === 'metaDataAdd' &&
                        scope.row.type === 'VIEW'
                      "
                      style="flex-shrink: 0"
                      data-type="view"
                      :isIcon="true"
                      :size="18"
                    ></datablau-icon>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                prop="physicalName"
                label="表/视图名称"
                show-overflow-tooltip
                v-if="simplePage === 'metaDataAdd'"
              >
                <template slot-scope="scope">
                  {{ scope.row.physicalName }}
                  <span v-if="scope.row.logicalName">
                    ({{ scope.row.logicalName }})
                  </span>
                </template>
              </el-table-column>
              <el-table-column
                prop="chineseName"
                label="技术部门"
                show-overflow-tooltip
                v-if="simplePage === 'metaDataAdd'"
              >
                <template slot-scope="scope">
                  {{
                    !$modelCategoriesDetailsMap[scope.row.modelCategoryId]
                      ? '--'
                      : $modelCategoriesDetailsMap[scope.row.modelCategoryId]
                          .itDepartmentName
                  }}
                </template>
              </el-table-column>
              <el-table-column
                prop="chineseName"
                label="名称"
                show-overflow-tooltip
                v-if="simplePage === 'domainAdd'"
              >
                <template slot-scope="scope">
                  {{ scope.row.chineseName }}
                </template>
              </el-table-column>
              <el-table-column
                prop="domainCode"
                label="编码"
                v-if="simplePage === 'domainAdd'"
              ></el-table-column>
              <el-table-column
                prop="name"
                label="名称"
                show-overflow-tooltip
                v-if="simplePage === 'domainCode'"
              >
                <template slot-scope="scope">
                  {{ scope.row.name }}
                </template>
              </el-table-column>
              <el-table-column
                prop="code"
                label="编号"
                v-if="simplePage === 'domainCode'"
              ></el-table-column>
            </datablau-table>
          </div>
          <div class="simplePage-pagination">
            <datablau-pagination
              @current-change="handleCurrentChangeLeft"
              @size-change="handleSizeChangeLeft"
              :current-page="currentPageLeft"
              :page-size="pageSizeLeft"
              :total="totalLeft"
              layout="total, sizes, prev, pager, next, jumper"
              style="overflow-x: auto; overflow-y: hidden"
            ></datablau-pagination>
          </div>
        </div>
        <div
          class="simplePage-son"
          :style="{
            height: columnList.length > 0 ? '382px' : '448px',
          }"
        >
          <datablau-input
            v-model="couKeyword"
            style="width: 200px"
            :iconfont-state="true"
            placeholder="搜索"
            clearable
          ></datablau-input>
          <datablau-switch
            v-model="allRightValue"
            style="display: inline-block; margin-left: 16px"
            @change="changeAllRightValue"
            :disabled="tableDataRight.length === 0"
            active-text="全选"
          ></datablau-switch>
          <div
            style="
              position: absolute;
              top: 52px;
              left: 8px;
              right: 8px;
              bottom: 40px;
            "
          >
            <datablau-table
              :data="tableDataRight"
              v-if="simplePageVisible"
              :data-selectable="!allRightValue"
              height="100%"
              @selection-change="handleSelectionChangeRight"
              :reserve-selection="true"
              :auto-hide-selection="false"
              row-key="objectId"
              ref="tableDataRightTable"
            >
              <el-table-column
                prop="name"
                label="字段名称"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ scope.row.name }}
                  <span v-if="scope.row.logicalName">
                    ({{ scope.row.logicalName }})
                  </span>
                </template>
              </el-table-column>
              <el-table-column
                prop="parentName"
                label="表名称"
                show-overflow-tooltip
                v-if="simplePage !== 'metaDataAdd'"
              >
                <template slot-scope="scope">
                  {{ scope.row.parentName }}
                  <span v-if="scope.row.parentAlias">
                    ({{ scope.row.parentAlias }})
                  </span>
                </template>
              </el-table-column>
              <el-table-column
                prop="modelName"
                label="数据源"
                show-overflow-tooltip
                v-if="simplePage !== 'metaDataAdd'"
              >
                <template slot-scope="scope">
                  {{ scope.row.modelName }}
                </template>
              </el-table-column>
              <el-table-column
                prop="domainName"
                label="基础标准"
                show-overflow-tooltip
                v-if="simplePage === 'metaDataAdd'"
              >
                <template slot-scope="scope">
                  {{ scope.row.domainName }}
                </template>
              </el-table-column>
              <el-table-column
                prop="standardCodeName"
                label="标准代码"
                show-overflow-tooltip
                v-if="simplePage === 'metaDataAdd'"
              >
                <template slot-scope="scope">
                  {{ scope.row.standardCodeName }}
                </template>
              </el-table-column>

              <el-table-column
                prop="parentName"
                label="所属表/视图"
                show-overflow-tooltip
                width="90"
                v-if="simplePage === 'metaDataAdd'"
              >
                <template slot-scope="scope">
                  {{ scope.row.parentName }}
                </template>
              </el-table-column>
            </datablau-table>
          </div>
          <div class="simplePage-pagination">
            <datablau-pagination
              @current-change="handleCurrentChangeRight"
              :current-page="currentPageRight"
              @size-change="handleSizeChangeRight"
              :page-size="pageSizeRight"
              :total="totalRight"
              layout="total, sizes, prev, pager, next, jumper"
            ></datablau-pagination>
          </div>
        </div>
      </div>
      <div slot="footer">
        <datablau-button
          type="primary"
          @click="createDataRule"
          :disabled="!allRightValue && columnList.length === 0"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
        <datablau-button type="secondary" @click="closeDialogDataRule">
          {{ $t('common.button.cancel') }}
        </datablau-button>
      </div>
    </datablau-dialog>
    <datablau-dialog
      size="l"
      :visible.sync="ruleDataVisible"
      height="500px"
      title="添加数据规则"
    >
      <div class="ruleData-content">
        <!-- <div class="ruleData-search">
          <datablau-input
            v-model="ruleDataTableKeyword"
            :iconfont-state="true"
            placeholder="搜索"
            clearable
            style="width: 200px; margin-right: 10px"
          ></datablau-input>
          <datablau-button type="secondary" @click="ruleDataTableSearch">
            搜索
          </datablau-button>
        </div> -->
        <div class="ruleData-table">
          <datablau-table class="datablau-table thin" :data="ruleDataTable">
            <el-table-column
              label=""
              :width="56"
              show-overflow-tooltip
              align="right"
            >
              <template slot-scope="scope">
                <span
                  class="builtInRuleType2"
                  :style="{
                    background: scope.row.builtInRule
                      ? 'rgba(111, 84, 235, 0.1)'
                      : 'rgba(78,190,247,0.1)',
                    color: scope.row.builtInRule ? '#6f54eb' : '#4ebef7',
                  }"
                >
                  {{ scope.row.builtInRule ? '内置' : '自定义' }}
                </span>
              </template>
            </el-table-column>
            <el-table-column
              label="规则名称"
              prop="name"
              :min-width="150"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <span>
                  {{ scope.row.name }}
                </span>
              </template>
            </el-table-column>
            <el-table-column
              label="规则类型"
              prop="techRuleType"
              :min-width="120"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <span>
                  {{ searchQuery(scope.row.techRuleType) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column
              label="描述"
              prop="description"
              :min-width="120"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              label="是否校验"
              prop="enable"
              :min-width="120"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <datablau-switch
                  v-model="scope.row.enable"
                  @change="changeEnableValue(scope.row)"
                ></datablau-switch>
              </template>
            </el-table-column>
          </datablau-table>
        </div>
      </div>
      <div slot="footer">
        <!-- <div>
          <datablau-pagination
            style="display: inline-block; float: left"
            class="pagination-component"
            @size-change="ruleDataTableSizeChange"
            @current-change="ruleDataTableCurrentChange"
            :current-page.sync="ruleDataTableCurrentPage"
            :page-sizes="[20, 50, 100]"
            :page-size="ruleDataTablePageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="ruleDataTableTotal"
          ></datablau-pagination>
        </div> -->
        <datablau-button type="primary" @click="updateRuleSave">
          {{ $t('common.button.ok') }}
        </datablau-button>
        <datablau-button type="secondary" @click="updateRuleClose">
          {{ $t('common.button.cancel') }}
        </datablau-button>
      </div>
    </datablau-dialog>
    <advancedFiltering
      :dtoMap="dtoMap"
      :filteringDialog="filteringDialog"
      @sqlCompletion="sqlCompletion"
      @closeDialog="closeFilteringDialog"
    ></advancedFiltering>
  </div>
</template>

<script>
import jobDomainDetail from './jobDomainDetail.js'
export default jobDomainDetail
</script>
<style lang="scss" scoped>
.jobDomainDetail-detail {
  margin-top: 64px;
  margin-left: 20px;
  margin-right: 20px;
  .quality-details .row-table {
    padding: 0;
  }
  .dataRule-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 12px;
    margin-bottom: 12px;
  }
}
.simplePage-columnList {
  position: absolute;
  top: 0;
  left: 16px;
  right: 16px;
  height: 68px;
  display: flex;
  padding: 8px 0;
  .columnListleft {
    display: flex;
    align-items: baseline;
    width: 122px;
  }
  .columnListright {
    height: 52px;
    width: 86%;
    overflow: auto;
  }
}
.simplePage-content {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 68px;
  border-bottom: 1px solid #dddddd;
  border-top: 1px solid #dddddd;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  transition: all 0.2s ease-out 0s;
  .simplePage-tree {
    width: 224px;
    height: 382px;
    padding-left: 16px;
    padding-right: 8px;
    padding-top: 12px;
    border-right: 1px solid #dddddd;
  }
  .simplePage-father {
    width: 323px;
    height: 382px;
    padding-left: 8px;
    padding-right: 8px;
    padding-top: 12px;
    border-right: 1px solid #dddddd;
    position: relative;
  }
  .simplePage-son {
    width: 411px;
    height: 382px;
    padding-left: 8px;
    padding-top: 12px;
    padding-right: 8px;
    position: relative;
  }
  .simplePage-pagination {
    position: absolute;
    left: 8px;
    right: 8px;
    bottom: 0;
    height: 40px;
    border-top: 1px solid #dddddd;
    display: flex;
    align-items: center;
    justify-content: end;
  }
}
.dataRule-data {
  height: 500px;
  background: #ffffff;
  border: 1px solid #dddddd;
  border-radius: 8px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  .dataRule-dataleft {
    width: 50%;
    border-right: 1px solid #dddddd;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
  }
  .dataRule-dataright {
    width: 50%;
    position: absolute;
    top: 0;
    /* left: 0; */
    right: 0;
    bottom: 0;
  }
}
.builtInRuleType {
  height: 24px;
  border-radius: 4px;
  margin-left: 8px;
  max-width: 92px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 4px;
}
.builtInRuleType2 {
  width: 44px;
  height: 24px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
}
</style>
<style lang="scss"></style>
