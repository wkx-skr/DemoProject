<template>
  <div class="box top-right-corner-vue">
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
              {{ $version.common.loading }}
            </span>
            <span v-else>{{ $version.common.empty }}</span>
          </li>
        </ul>
      </div>
    </el-popover>
    <datablau-switch
      v-if="$store.state.isDevOrTest"
      active-text="en"
      inactive-text="中"
      active-value="en"
      inactive-value="zh"
      v-model="$i18n.locale"
      style="
        display: inline-block;
        margin-right: 10px;
        position: relative;
        top: -5px;
      "
    ></datablau-switch>
    <datablau-input
      v-if="$i18n.locale === 'zh' && $esconnectable && !$store.state.isDdcHome"
      style="display: inline-block"
      search-narrow
      iconfont-state
      v-model="keyword"
      :placeholder="$t('common.placeholder.normal')"
      @keydown.enter.native="handleSearch"
    ></datablau-input>
    <datablau-button
      v-if="$store.state.isDevOrTest"
      type="icon"
      low-key
      no-background
      @click="handleDevCommand('frontendDevelopmentDocument')"
    >
      <i class="fa fa-book"></i>
    </datablau-button>
    <el-badge
      :value="unReadNotiCount"
      type="danger"
      :max="99"
      :hidden="unReadNotiCount <= 0"
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
          style="position: relative; top: -1px"
        >
          <i class="iconfont icon-bell"></i>
        </datablau-button>
      </el-tooltip>
    </el-badge>
    <el-tooltip
      :content="$t('common.bucket.version')"
      :hide-after="1000"
      effect="dark"
    >
      <datablau-button type="icon" low-key no-background @click="showInfo">
        <i class="iconfont icon-banben"></i>
      </datablau-button>
    </el-tooltip>
    <el-tooltip content="任务" :hide-after="1000" effect="dark">
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
            任务进度总览
          </p>
          <datablau-tabs
            v-model="taskTabName"
            @tab-click="handleTaskTabChange"
            class="task-tabs"
          >
            <el-tab-pane label="导入任务" name="import"></el-tab-pane>
            <el-tab-pane label="导出任务" name="export"></el-tab-pane>
            <el-tab-pane label="探查任务" name="profiling"></el-tab-pane>
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
                  <div class="import-result">
                    <div class="success-title">
                      <i class="el-icon-success success-icon"></i>
                      <span
                        style="
                          margin-left: 8px;
                          line-height: 19px;
                          float: left;
                          display: inline-block;
                        "
                      >
                        导入成功：{{ importTaskResult.success }} 条
                      </span>
                    </div>
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
                        <span class="error-reason" v-else>错误信息</span>
                      </div>
                      <div
                        v-if="importTaskResult.errorMsg.length > 1"
                        class="error-list"
                      >
                        {{ importTaskResult.errorMsg.join('， ') }}
                      </div>
                    </div>
                    <div
                      v-else
                      v-for="errorKey in Object.keys(
                        importTaskResult.errorListMap || {}
                      )"
                      :key="errorKey"
                      class="error-group"
                    >
                      <!-- 数据资产模块的数据资产导入结果展示 -->
                      <template
                        v-if="
                          scope.row.jobName.slice(0, 6) === '数据资产导入' &&
                          errorKey &&
                          importTaskResult.errorListMap[errorKey]
                        "
                      >
                        <div class="error-title">
                          <i class="el-icon-error fail-icon"></i>
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
                            条
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
                            复制
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
                          scope.row.jobName.slice(0, 6) !== '数据资产导入' &&
                          errorKey &&
                          importTaskResult.errorListMap[errorKey] &&
                          importTaskResult.errorListMap[errorKey].length
                        "
                      >
                        <div class="error-title">
                          <i class="el-icon-error fail-icon"></i>
                          <span class="error-reason">
                            {{ importTaskResult.messageMap[errorKey] }}:
                          </span>
                          <span class="error-count">
                            {{ importTaskResult.errorListMap[errorKey].length }}
                            条
                          </span>
                          <span
                            class="copy"
                            v-copy="
                              importTaskResult.errorListMap[errorKey].join(
                                '， '
                              )
                            "
                          >
                            复制
                          </span>
                        </div>
                        <div class="error-list">
                          {{
                            importTaskResult.errorListMap[errorKey].join('， ')
                          }}
                        </div>
                      </template>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                min-width="250"
                prop="jobName"
                label="任务名称"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  <span :class="{ highlight: scope.row.highlight }">
                    {{ scope.row.jobName }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column min-width="150" prop="stage" label="任务状态">
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
                  <span v-if="scope.row.stage === 'FAILED'">任务失败</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" min-width="100" align="center">
                <template slot-scope="scope">
                  <datablau-button
                    v-if="taskTabName === 'export'"
                    type="text"
                    @click="scanResult(scope.row)"
                    :disabled="
                      !(
                        scope.row.stage === 'FINISHED' ||
                        scope.row.stage === 'FAILED'
                      )
                    "
                    tooltip-content="导出"
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
                    tooltip-content="清除"
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
            关闭
          </datablau-button>
        </div>
        <datablau-button
          slot="reference"
          type="icon"
          low-key
          no-background
          @click="showTask"
        >
          <i class="iconfont icon-wentiqingdan"></i>
        </datablau-button>
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
        <div class="user" :class="{ 'is-ddc-home': $store.state.isDdcHome }">
          <div class="portrait">
            <i class="iconfont icon-schema"></i>
          </div>
          <el-tooltip :disabled="userNameDisabled" :content="displayName">
            <div class="name oneline-eclipse">
              {{ displayName }}
            </div>
          </el-tooltip>
          <i class="el-icon-arrow-down"></i>
        </div>
      </span>
      <el-dropdown-menu slot="dropdown" class="menu">
        <el-dropdown-item
          command="user"
          @mouseenter.native="popoverLanguagevisible = false"
        >
          <span class="d-figure">{{ $t('common.bucket.workbench') }}</span>
        </el-dropdown-item>
        <el-dropdown-item
          v-if="$isAdmin"
          @mouseenter.native="handleDownlogEnter"
          @mouseleave.native="handleDownlogLeave"
          divided
        >
          <span v-popover="'logList'">
            <span class="d-figure">
              {{ $t('common.bucket.serverLog') }}
            </span>
            <span class="loading-log">
              <i
                v-if="showLogLoading === 'finished'"
                class="el-icon-circle-check-outline"
              ></i>
            </span>
          </span>
        </el-dropdown-item>
        <el-dropdown-item command="error">
          <span class="d-figure">{{ $t('common.bucket.errorList') }}</span>
        </el-dropdown-item>
        <el-dropdown-item command="version">
          <span class="d-figure">{{ $t('common.bucket.version') }}</span>
        </el-dropdown-item>
        <el-dropdown-item command="help" divided>
          <span class="d-figure">{{ $t('common.bucket.help') }}</span>
        </el-dropdown-item>
        <el-dropdown-item
          command="changeProduct"
          v-if="gatewayEnable && otherProduct"
        >
          <span class="d-figure">{{ $t('common.bucket.changeProduct') }}</span>
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
  /deep/.el-progress__text {
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
