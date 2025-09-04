<template>
  <div class="check-application-page">
<!--    <el-dialog
      title="创建虚拟数据源"
      :visible.sync="dialogCrVdsVisible"
      :append-to-body="true"
    >
      <create-virds
        ref="createVirds"
        @handleCreated="handleCreated"
        :choosedObjectId="choosedObjectId"
      ></create-virds>
    </el-dialog>
    <el-dialog
      title="创建视图"
      :visible.sync="dialogCrviewsVisible"
      :append-to-body="true"
      class="create-view"
    >
      <create-view
        ref="createView"
        class="create-view-dialog"
        @handleCreated="handleViewCreated"
        :choosedObjectId="choosedObjectId"
      ></create-view>
    </el-dialog>
    <div class="center-content">
      <div class="page-header">
        <i class="fa fa-cog"></i>
        权限申请审核
      </div>
      <div class="content-box">
        <div class="base-info">
          <div class="form-title title-item">基本信息</div>
          <el-form
            label-position="right"
            label-width="110px"
            size="small"
            :model="userInfo"
            ref="userInfo"
          >
            <el-form-item label="申请人：">
              {{ userInfo.userName }}
            </el-form-item>
            <el-form-item label="申请类型">
              <el-radio
                v-model="userInfo.applType"
                label="longType"
                value="longType"
              >
                长期使用
              </el-radio>
              <el-radio
                v-model="userInfo.applType"
                label="shortType"
                value="shortType"
              >
                临时使用
              </el-radio>
              <el-radio-group
                v-model="userInfo.lastTime"
                :disabled="userInfo.applType !== 'shortType'"
                class="time-radio-group"
              >
                <el-radio-button
                  name="一星期"
                  label="week"
                  class="time-left-radio"
                >
                  一星期
                </el-radio-button>
                <el-radio-button name="一个月" label="month">
                  一个月
                </el-radio-button>
                <el-radio-button name="三个月" label="3month">
                  三个月
                </el-radio-button>
              </el-radio-group>
              <el-radio
                v-model="userInfo.applType"
                label="cosType"
                value="cosType"
              >
                自定义
              </el-radio>
              <el-date-picker
                v-model="userInfo.lastTimePoint"
                align="right"
                type="date"
                placeholder="选择日期"
                value-format="timestamp"
                size="mini"
                :disabled="userInfo.applType !== 'cosType'"
                class="clear-border-radius"
                :picker-options="pickerOptions1"
              ></el-date-picker>
            </el-form-item>
            <el-form-item label="备注：">
              <el-input
                type="textarea"
                size="mini"
                v-model="userInfo.description"
                placeholder="请输入备注"
                :disabled="true"
              ></el-input>
            </el-form-item>
            <el-form-item label="回复信息：" v-if="isTarget">
              <el-input
                type="textarea"
                size="mini"
                v-model="userInfo.message"
                placeholder="请输入回复信息"
              ></el-input>
            </el-form-item>
          </el-form>
        </div>
        <div class="appli-list">
          <div class="table-title title-item">申请列表</div>
          <div class="table-contain">
            <el-table
              class="appla-table-table"
              ref="applaTableData"
              v-loading="loadingDetail"
              header-cell-class-name="table-header-cell"
              cell-class-name="table-cell-clearpadding"
              :data="applaTableData"
            >
              &lt;!&ndash; @selection-change="handleSelectionChange" &ndash;&gt;
              &lt;!&ndash; <el-table-column
              type="selection"
              width="55"
              class-name="table-check-box"
              :selectable="(row, index) => {return !row.responed && isTarget;}"
            ></el-table-column> &ndash;&gt;
              <el-table-column width="50"></el-table-column>
              <el-table-column
                prop="name"
                label="名称"
                sortable="custom"
                width="150"
                show-overflow-tooltip
              >
                &lt;!&ndash; physicalName &ndash;&gt;
                <template slot-scope="scope">
                  <span>{{ scope.row.detail.physicalName }}</span>
                </template>
              </el-table-column>
              <el-table-column
                label="所属数据源"
                width="150"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  <span>{{ scope.row.detail.modelName }}</span>
                </template>
              </el-table-column>
              <el-table-column label="管理员" width="150">
                <template slot-scope="scope">
                  <span>{{ scope.row.detail.owner }}</span>
                </template>
              </el-table-column>
              <el-table-column label="审核结果" width="150">
                <template slot-scope="scope">
                  <span class="response-status">
                    {{
                      scope.row.responed
                        ? scope.row.responed === 'reject'
                          ? '拒绝'
                          : '通过'
                        : '申请中'
                    }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="name" label="视图">
                <template slot-scope="scope">
                  <div
                    class="item-container"
                    v-for="item in scope.row.views"
                    :key="item.uuid"
                    @mouseenter="setCurrentPopover(item)"
                    @mouseleave="clearCurrentPopover"
                  >
                    <el-popover
                      placement="left-start"
                      trigger="hover"
                      :open-delay="300"
                      :key="item.uuid"
                      v-if="showTooltipView === item.uuid"
                    >
                      <div class="popover-con view-detail">
                        <p
                          class="view-detail-container"
                          :class="{ 'long-text': currentView.longText }"
                        >
                          <el-form
                            label-position="left"
                            label-width="60px"
                            class="view-detail-form"
                          >
                            <el-form-item label="名称：">
                              <span>{{ currentView.name }}</span>
                              <span
                                @click="handleSkip2View(currentView)"
                                class="check-btn"
                              >
                                查看
                              </span>
                            </el-form-item>
                            <el-form-item label="描述：">
                              <span>{{ currentView.description }}</span>
                            </el-form-item>
                          </el-form>
                        </p>
                      </div>
                      <span
                        :ref="item.uuid"
                        slot="reference"
                        class="view-item btn-item"
                        :class="{
                          'choosed-view': scope.row.choosedViewId === item.uuid,
                          'btn-disable': !!scope.row.responed,
                        }"
                        @click="
                          () => {
                            !scope.row.responed &&
                              isTarget &&
                              handleChooseView(scope.row, item)
                          }
                        "
                      >
                        {{ item.name }}
                      </span>
                    </el-popover>
                    <span
                      :ref="item.uuid"
                      v-else
                      class="view-item btn-item"
                      :class="{
                        'choosed-view': scope.row.choosedViewId === item.uuid,
                        'btn-disable': !!scope.row.responed,
                      }"
                      @click="
                        () => {
                          !scope.row.responed &&
                            isTarget &&
                            handleChooseView(scope.row, item)
                        }
                      "
                    >
                      {{ item.name }}
                    </span>
                  </div>
                  <el-button
                    type="text"
                    @click="handleCreateView(scope.row)"
                    class="add-view-btn btn-item"
                    v-if="!scope.row.responed && isTarget"
                  >
                    +新建视图
                  </el-button>
                  <el-tooltip
                    content="该数据源未创建虚拟数据源，请先创建虚拟数据源。"
                    v-if="false"
                  >
                    <i class="fa fa-info-circle"></i>
                  </el-tooltip>
                </template>
              </el-table-column>
            </el-table>
            &lt;!&ndash; @sort-change="handleSortChange" &ndash;&gt;
          </div>
        </div>
        <div class="bottom-btn-box" v-if="isTarget">
          <p v-for="item in outgoingFlows" :key="item.id" class="bottom-btn">
            <span
              class="submit-btn"
              @click="handleApply(item)"
              v-if="acceptable && item.name === '通过'"
            >
              通过
            </span>
            <span
              class="submit-btn btn-disable"
              v-if="!acceptable && item.name === '通过'"
            >
              通过
            </span>
            <span
              class="submit-btn"
              @click="handleApply(item)"
              v-if="rejectable && item.name === '驳回'"
            >
              拒绝
            </span>
            <span
              class="submit-btn btn-disable"
              v-if="!rejectable && item.name === '驳回'"
            >
              拒绝
            </span>
          </p>
          &lt;!&ndash; <span>
            <span v-for="item in outgoingFlows" :key="item.id">
              <span
                class="submit-btn"
                @click="handleAcceptApplica"
                v-if="acceptable"
              >
                通过
              </span>
              <span
                class="submit-btn btn-disable"
                v-else
              >
                拒绝
              </span>
            </span>
          </span> &ndash;&gt;
          &lt;!&ndash; <span
            class="submit-btn"
            @click="handleAcceptApplica"
            v-if="acceptable"
          >
            通过
          </span>
          <span
            class="submit-btn btn-disable"
            v-else
          >
            通过
          </span>
          <span
            class="submit-btn"
            @click="handleRejectApplica"
            v-if="rejectable"
          >
            拒绝
          </span>
          <span
            class="submit-btn btn-disable"
            v-else
          >
            拒绝
          </span> &ndash;&gt;
          <span class="submit-btn" @click="handleBack">返回</span>
        </div>
        <div class="bottom-btn-box" v-else>
          <span class="submit-btn" @click="handleBack">返回</span>
        </div>
      </div>
    </div>-->
  </div>
</template>

<script>
// import checkApplication from './checkApplication.js'
// export default checkApplication
export default {}
</script>

<style lang="scss">
@import '../../assets/styles/constForDDC.sass';
$marginleft: 30px;
$greybgc: #f5f5f5;
.check-application-page {
  width: 100%;
  height: 100%;

  position: relative;
  background-color: $greybgc;
  .center-content {
    position: relative;
    max-width: 1440px;
    width: 100%;
    margin: 0 auto;
    height: 100%;
    .page-header {
      height: 50px;
      line-height: 50px;
      font-weight: bold;
    }
    .content-box {
      position: absolute;
      top: 50px;
      bottom: 20px;
      left: 0;
      right: 0;
      // min-height: 700px;
      background-color: #fff;
      // padding: 0 20px;
      overflow: auto;
      .title-item {
        height: 50px;
        line-height: 50px;
        margin: 10px 0 0 $marginleft;
        font-weight: bold;
      }
      .base-info {
        width: 80%;
        .mes-title {
          width: 200px;
        }
        textarea {
          max-width: 625px;
          min-height: 70px;
        }
      }
      .appli-list {
        .table-contain {
          // padding: 0 25px;
          .appla-table-table {
            border: $greyBorder2;
            .response-status {
              background-color: #f9f9f9;
              border: 1px solid #ddd;
              border-radius: 4px;
              display: inline-block;
              padding: 0px 10px;
            }
          }
        }
      }
    }
    .bottom-btn-box {
      margin-top: 20px;
      padding-left: 20px;
      .bottom-btn {
        display: inline-block;
      }
      .submit-btn {
        background-color: #4278c9;
        color: #fff;
        display: inline-block;
        width: 70px;
        height: 35px;
        margin-right: 10px;
        line-height: 35px;
        text-align: center;
        cursor: pointer;
        &.btn-disable {
          cursor: not-allowed;
          background-color: $deepBlueForBtnDisabled;
        }
      }
    }
  }
  @media only screen and (max-width: 1440px) {
    .page-header {
      padding-left: 20px;
    }
  }
}
</style>
<style lang="scss">
@import '../../assets/styles/constForDDC.sass';
$poplheight: 20px;
.check-application-page {
  .item-container {
    display: inline-block;
  }
  .btn-item {
    display: inline-block;
    cursor: pointer;
    width: 80px;
    height: 24px;
    line-height: 20px;
    padding: 2px 4px;
    margin: 6px 0px 6px 10px;
    border-radius: 0;
    text-align: center;
    font-size: 12px;
    vertical-align: middle;
  }
  .view-item {
    background-color: $lightBlueForBtn;
    color: $deepBlueForBtn;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    &.choosed-view {
      background-color: $deepBlueForBtn;
      color: #fff;
    }
    &.btn-disable {
      cursor: not-allowed;
    }
  }
  .add-view-btn {
    border: $greyBorder;
  }
  // .response-status {
  //   color: #F9F9F9;
  //   // color: red;
  // }
  font-size: 12px;
  .el-form-item__label,
  .el-radio__label,
  .el-radio-button__inner {
    font-size: 12px;
  }
  .table-cell-clearpadding {
    padding: 0 0px;
  }
  .clear-border-radius {
    input,
    textarea {
      border-radius: 0;
    }
  }

  .time-radio-group {
    color: #000;
    .el-radio-button {
      .el-radio-button__inner {
        border: 1px solid $grey;
        // background-color: #ffffff;
        // color: #A9AAB0;
        box-shadow: none;
        border: 1px solid #d7dae2;
        border-left: none;
      }
      &.el-radio-button.is-active {
        .el-radio-button__inner {
          // background-color: #EFF2F7;
        }
      }
    }
    .time-left-radio {
      .el-radio-button__inner {
        border: 1px solid #d7dae2;
      }
    }
  }

  // 自定义 table style
  .table-header-cell {
    background: #f6f6f6;
    height: 34px;
    border-bottom: $greyBorder2;
  }
  .table-check-box {
    text-align: center;
  }
}
.popover-con.view-detail {
  padding: 5px 10px;
  // max-height: 200px;
  overflow: auto;
  .view-detail-container {
    min-width: 80px;
    max-width: 550px;
    &.long-text {
      max-width: 800px;
    }
  }
  .view-detail-container {
    .el-form-item {
      margin: 0;
      padding: 0;
      line-height: $poplheight;
      .el-form-item__label,
      .el-form-item__content {
        line-height: $poplheight;
      }
      .check-btn {
        color: #409eff;
        cursor: pointer;
        margin-left: 20px;
      }
    }
    .el-form-item__label {
      font-weight: bold;
    }
  }
}
</style>
