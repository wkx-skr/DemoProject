<template>
  <div class="box top-right-corner-vue">
    <div style="display: inline-block; position: relative; top: -8px">
      <slot></slot>
    </div>
    <el-popover placement="left" width="160" trigger="hover" ref="logList">
      <!-- @show="getLogs" -->
      <div class="log-con">
        <ul class="log-con-ul">
          <li
            v-for="(item, index) in logsArr"
            :key="index"
            @click="handleDownloadLog(item)"
            class="log-item"
          >
            <span-with-tooltip
              :content="item.fullName"
              :widthStr="'100%'"
            ></span-with-tooltip>
          </li>
          <li v-if="!logsArr || logsArr.length === 0">
            <span v-if="showLogLoading !== 'finished'">
              {{ $t('common.info.loading') }}
            </span>
            <span v-else>{{ $t('el.empty.description') }}</span>
          </li>
        </ul>
      </div>
    </el-popover>
    <el-badge
      :value="unReadNotiCount"
      type="danger"
      :max="99"
      :hidden="unReadNotiCount <= 0"
      class="news"
    >
      <el-tooltip
        :content="$t('common.bucket.message')"
        :hide-after="1000"
        effect="dark"
      >
        <datablau-button
          type="icon"
          low-key
          no-background
          @click="skip2Noti"
          style="position: relative; top: -1px; color: #d6dcea"
        >
          <i class="iconfont icon-menu-news"></i>
        </datablau-button>
      </el-tooltip>
    </el-badge>
    <el-tooltip
      :content="$t('common.task.title')"
      :hide-after="1000"
      effect="dark"
    >
      <el-popover
        placement="right"
        width="600"
        trigger="manual"
        v-model="taskPopover"
        popper-class="task-popper"
      >
        <div style="padding-left: 12px">
          <p
            class="title"
            style="
              height: 32px;
              font-size: 14px;
              font-weight: 600;
              color: #555;
              line-height: 32px;
            "
          >
            {{ $t('common.task.taskProgressOverview') }}
          </p>
          <datablau-tabs
            v-model="taskTabName"
            @tab-click="handleTaskTabChange"
            class="task-tabs"
          >
            <el-tab-pane
              :label="$t('common.task.importTask')"
              name="import"
            ></el-tab-pane>
            <el-tab-pane
              :label="$t('common.task.exportTask')"
              name="export"
            ></el-tab-pane>
            <el-tab-pane
              :label="$t('common.task.explorationTask')"
              name="profiling"
            ></el-tab-pane>
            <el-tab-pane
              :label="$t('common.task.otherTasks')"
              name="other"
            ></el-tab-pane>
          </datablau-tabs>
          <div
            style="
              width: 100%;
              overflow: hidden;
              margin-top: 2px;
              margin-bottom: 37px;
            "
            :style="{
              height: tableHeight + 'px',
            }"
          >
            <datablau-table
              ref="taskTable"
              :data-selectable="option.selectable"
              :auto-hide-selection="option.autoHideSelectable"
              :show-column-selection="option.showColumnSelection"
              :column-selection="option.columnSelection"
              :border="option.columnResizable"
              :data="taskData"
              height="100%"
              style="
                margin-bottom: 37px;
                border-bottom: 1px solid #eee;
                padding-right: 12px;
              "
              :expand-row-keys="taskTableExpends"
              row-key="jobId"
              :row-class-name="getRowClassName"
              @row-click="handleRowClick"
              @expand-change="handleTableExpand"
            >
              <el-table-column
                type="expand"
                :width="taskTabName === 'import' ? 20 : 1"
              >
                <template slot-scope="scope">
                  <div
                    style="
                      padding: 8px;
                      box-shadow: inset 0 4px 4px 0 rgba(0, 0, 0, 0.06);
                    "
                    v-if="importTaskResult.errorMessage"
                  >
                    <p
                      style="
                        max-height: 100px;
                        overflow: auto;
                        background: #f5f5f5;
                        padding: 12px;
                        color: #555;
                      "
                    >
                      {{ importTaskResult.errorMessage }}
                    </p>
                  </div>
                  <div class="import-result" v-else>
                    <div
                      class="success-title"
                      v-if="importTaskResult.showNumber !== false"
                    >
                      <i class="el-icon-success success-icon"></i>
                      <span
                        style="
                          margin-left: 8px;
                          line-height: 19px;
                          float: left;
                          display: inline-block;
                        "
                      >
                        {{ $t('common.task.importSuccessful')
                        }}{{ importTaskResult.success }}
                        {{ $t('common.task.strip') }}
                      </span>
                    </div>
                    <div
                      v-if="
                        importTaskResult.resultType ===
                        'com.datablau.data.common.data.instantjob.ImportInstantJobResult'
                      "
                    >
                      <div class="error-group">
                        <div class="error-title">
                          <i
                            class="el-icon-error fail-icon"
                            v-if="importTaskResult.showNumber !== false"
                          ></i>
                          <span
                            v-if="importTaskResult.showNumber !== false"
                            class="error-reason"
                          >
                            {{ $t('common.task.errorMessage2')
                            }}{{ importTaskResult.failed }}
                            {{ $t('common.task.strip') }}
                          </span>
                          <datablau-button
                            style="float: right"
                            type="text"
                            v-if="importTaskResult.failed !== 0"
                            @click="handleDownload(importTaskResult.fileId)"
                          >
                            <span style="display: flex; align-items: center">
                              <span>{{ $t('common.task.incorrectData') }}</span>
                              <datablau-tooltip
                                :content="$t('common.task.incorrectDataTip')"
                                placement="bottom"
                              >
                                <i
                                  style="font-size: 14px; padding-left: 4px"
                                  class="iconfont icon-tips"
                                ></i>
                              </datablau-tooltip>
                            </span>
                          </datablau-button>
                        </div>
                      </div>
                    </div>
                    <div v-else>
                      <div
                        v-if="importTaskResult.errorMsg.length"
                        class="error-group"
                      >
                        <div class="error-title">
                          <i class="el-icon-error fail-icon"></i>
                          <span
                            class="error-reason"
                            v-if="importTaskResult.errorMsg.length === 1"
                          >
                            {{ importTaskResult.errorMsg[0] }}
                          </span>
                          <span class="error-reason" v-else>
                            {{ $t('common.task.errorMessage')
                            }}{{ importTaskResult.failed }}
                            {{ $t('common.task.strip') }}
                          </span>
                        </div>
                        <div
                          v-if="importTaskResult.errorMsg.length > 1"
                          class="error-list"
                        >
                          {{ importTaskResult.errorMsg.join('， ') }}
                        </div>
                      </div>
                      <div v-else>
                        <div
                          v-for="errorKey in Object.keys(
                            importTaskResult.errorListMap || {}
                          )"
                          :key="errorKey"
                          class="error-group"
                        >
                          <!-- 数据资产模块的数据资产导入结果展示 -->
                          <template
                            v-if="
                              scope.row.jobName.slice(0, 6) ===
                                '数据资产导入' &&
                              errorKey &&
                              importTaskResult.errorListMap[errorKey]
                            "
                          >
                            <div class="error-title">
                              <i
                                v-if="errorKey === 'INITIATE_CHANGE'"
                                class="el-icon-success success-icon"
                              ></i>
                              <i v-else class="el-icon-error fail-icon"></i>
                              <span class="error-reason">
                                {{ importTaskResult.messageMap[errorKey] }}:
                              </span>
                              <span class="error-count">
                                {{
                                  Object.values(
                                    importTaskResult.errorListMap[errorKey]
                                  ).reduce((a, b) => {
                                    return a + b.length
                                  }, 0)
                                }}
                                {{ $t('common.task.strip') }}
                              </span>
                              <span
                                class="copy"
                                v-copy="
                                  Object.entries(
                                    importTaskResult.errorListMap[errorKey]
                                  )
                                    .map(
                                      arr =>
                                        importTaskResult.messageMap[arr[0]] +
                                        ':' +
                                        arr[1]
                                    )
                                    .join('\n')
                                "
                              >
                                {{ $t('common.task.copy') }}
                              </span>
                            </div>
                            <div class="error-list">
                              {{
                                Object.entries(
                                  importTaskResult.errorListMap[errorKey]
                                )
                                  .map(
                                    arr =>
                                      importTaskResult.messageMap[arr[0]] +
                                      ' : ' +
                                      arr[1]
                                  )
                                  .join('\n')
                              }}
                            </div>
                          </template>
                          <template
                            v-else-if="
                              scope.row.jobName.slice(0, 6) !==
                                '数据资产导入' &&
                              errorKey &&
                              importTaskResult.errorListMap[errorKey] &&
                              importTaskResult.errorListMap[errorKey].length
                            "
                          >
                            <div class="error-title">
                              <i
                                v-if="errorKey === 'INITIATE_CHANGE'"
                                class="el-icon-success success-icon"
                              ></i>
                              <i v-else class="el-icon-error fail-icon"></i>
                              <span class="error-reason">
                                {{ importTaskResult.messageMap[errorKey] }}:
                              </span>
                              <span class="error-count">
                                {{
                                  importTaskResult.errorListMap[errorKey].length
                                }}
                                {{ $t('common.task.strip') }}
                              </span>
                              <span
                                class="copy"
                                v-copy="
                                  importTaskResult.errorListMap[errorKey].join(
                                    '， '
                                  )
                                "
                              >
                                {{ $t('common.task.copy') }}
                              </span>
                            </div>
                            <div class="error-list">
                              {{
                                importTaskResult.errorListMap[errorKey].join(
                                  '， '
                                )
                              }}
                            </div>
                          </template>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                min-width="250"
                prop="jobName"
                :label="$t('common.task.taskName')"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  <span :class="{ highlight: scope.row.highlight }">
                    {{ scope.row.jobName }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column
                min-width="150"
                prop="stage"
                :label="$t('common.task.taskStatus')"
              >
                <template slot-scope="scope">
                  <!-- <span>{{ getStatus(scope.row.stage) }}</span> -->
                  <p
                    v-if="
                      scope.row.stage === 'FINISHED' ||
                      scope.row.stage === 'RUNNING'
                    "
                    style="display: inline-block"
                  >
                    <datablau-progressed
                      class="task-progress"
                      :percent="scope.row.percent"
                      :strokeWidth="8"
                    ></datablau-progressed>
                  </p>
                  <span v-if="scope.row.stage === 'FAILED'">
                    {{ $t('common.task.taskFailed') }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column
                :label="$t('common.task.operation')"
                min-width="100"
                align="center"
              >
                <template slot-scope="scope">
                  <datablau-button
                    v-if="taskTabName === 'export'"
                    type="text"
                    @click="scanResult(scope.row)"
                    :disabled="!(scope.row.stage === 'FINISHED')"
                    :tooltip-content="$t('common.task.export')"
                    class="iconfont icon-import"
                  ></datablau-button>
                  <datablau-button
                    v-if="taskTabName === 'profiling'"
                    type="icon"
                    @click="goProfiling(scope.row)"
                    class="iconfont icon-see"
                    :tooltip-content="$t('common.button.scan')"
                  ></datablau-button>
                  <datablau-button
                    type="text"
                    @click="deleteThis(scope.row)"
                    class="iconfont icon-qingchu"
                    :disabled="
                      !(
                        scope.row.stage === 'FINISHED' ||
                        scope.row.stage === 'FAILED'
                      )
                    "
                    :tooltip-content="$t('common.task.cleanUp')"
                    style="margin-left: 0"
                  ></datablau-button>
                </template>
              </el-table-column>
            </datablau-table>
          </div>
          <datablau-button
            style="position: absolute; bottom: 6px; right: 20px"
            type="secondary"
            @click="closeTask"
          >
            {{ $t('common.button.close') }}
          </datablau-button>
        </div>
        <div slot="reference" class="task">
          <datablau-button type="icon" low-key no-background @click="showTask">
            <i class="iconfont icon-wentiqingdan" style="color: #d6dcea"></i>
          </datablau-button>
        </div>
      </el-popover>
    </el-tooltip>
    <datablau-dropdown
      style="display: inline-block"
      @command="handleCommand"
      trigger="click"
      :hide-on-click="hidenDropdown"
      @visible-change="handleHideDropdown"
    >
      <span class="el-dropdown-link">
        <div class="portrait">
          <datablau-button
            type="icon"
            class="iconfont icon-userlogo"
            style="color: #d6dcea; line-height: 32px"
            :tooltipContent="$user.fullname"
          ></datablau-button>
        </div>
      </span>
      <el-dropdown-menu slot="dropdown" class="menu">
        <el-dropdown-item
          command="user"
          @mouseenter.native="popoverLanguagevisible = false"
        >
          <span class="d-figure">{{ $t('common.bucket.workbench') }}</span>
        </el-dropdown-item>
        <el-dropdown-item command="logout">
          <span class="d-figure">{{ $t('common.bucket.logout') }}</span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </datablau-dropdown>
  </div>
</template>
<script>
import TopRightCorner from './topRightCorner.js'
export default TopRightCorner
</script>
<style lang="scss" scoped>
@import './topRightCorner.scss';
.task-progress {
  width: 100px;
  ::v-deep .el-progress__text {
    line-height: 13px;
    font-size: 12px !important;
  }
}
.import-result {
  width: 100%;
  padding: 16px 0;
  padding-left: 10px;
  box-shadow: inset 0px 4px 4px 0px rgba(0, 0, 0, 0.11);
  .success-title {
    height: 20px;
    line-height: 20px;
    color: #555;
    i {
      font-size: 20px;
      vertical-align: middle;
      margin-left: 0;
      float: left;
      &.success-icon {
        color: #66bf16;
      }
    }
  }
  .error-title {
    height: 20px;
    line-height: 20px;
    margin-top: 8px;
    i {
      font-size: 20px;
      vertical-align: middle;
      margin-left: 0;
      float: left;
      &.success-icon {
        color: #66bf16;
      }
      &.same-icon {
        color: #e6ad00;
      }
      &.fail-icon {
        color: #ff4b53;
      }
    }
    .error-reason {
      margin-left: 8px;
      float: left;
      line-height: 19px;
    }
    .error-count {
      margin-left: 6px;
    }
    .copy {
      float: right;
      padding: 5px 10px;
      color: #409eff;
      cursor: pointer;
      font-weight: normal;
      height: 14px;
      line-height: 14px;
    }
  }
  .error-list {
    margin-top: 8px;
    padding: 10px;
    background-color: #f5f5f5;
    line-height: 18px;
    max-height: 100px;
    overflow-y: scroll;
    width: 100%;
  }
}
</style>
<style lang="scss">
.task-popper {
  z-index: 2000 !important;
  .hide-expand {
    .el-table__expand-icon {
      visibility: hidden;
    }
  }
  .show-expand {
    cursor: pointer;
    visibility: visible;
  }
  .el-table__body,
  .el-table__footer,
  .el-table__header {
    table-layout: auto;
  }
}
.top-right-corner-vue {
  .searchButton {
    border-color: transparent;
  }
  .is-block.icon {
    margin-left: 4px;
  }
  .is-block.icon + .is-block.icon {
    margin-left: 8px;
  }
  .el-badge__content {
    height: 15px;
    line-height: 12px;
    padding: 0 3px;
  }
  .el-badge__content.is-fixed {
    top: 5px;
  }
  .el-dropdown {
    font-size: 12px;
  }
}
.highlight {
  color: #409eff;
}
.task-tabs {
  .el-tabs .el-tab-pane {
    padding: 0;
  }
}
</style>
