<template>
  <div id="data-masking-rule" v-loading="loading">
    <div class="content-box">
      <datablau-form-submit>
        <datablau-detail-subtitle
          title="基本信息"
          mt="20px"
        ></datablau-detail-subtitle>
        <el-form
          v-loading="formLoading"
          :rules="rules"
          :model="form"
          ref="form"
          label-width="180px"
        >
          <el-form-item label="任务名称" prop="name">
            <datablau-input
              class="maxlength-input"
              style="width: 500px"
              v-model="form.name"
              placeholder="请输入任务名称"
              maxlength="100"
              show-word-limit
            ></datablau-input>
          </el-form-item>

          <el-form-item label="数据源" prop="elementObjectId">
            <datablau-select
              filterable
              clearable
              style="width: 500px; display: inline-block"
              v-model="form.elementObjectId"
              placeholder="选择源数据源"
            >
              <el-option
                v-for="item in generalList"
                :key="item.modelId"
                :label="item.definition"
                :value="item.modelId"
              ></el-option>
            </datablau-select>
            <datablau-tooltip
              content="数据识别支持数据库类型：MySQL， SQLserver，Oracle，Vertica，Hive"
              placement="right"
            >
              <i class="iconfont icon-tips"></i>
            </datablau-tooltip>
          </el-form-item>
          <el-form-item label="运行时刻">
            <datablau-radio v-model="timeType">
              <el-radio
                label="select"
                style="margin-bottom: 10px; margin-top: 6px"
              >
                选择
              </el-radio>
              <el-radio label="custom">自定义</el-radio>
            </datablau-radio>
          </el-form-item>
          <el-form-item
            label="调度周期"
            :required="timeType !== 'select'"
            prop="time"
            v-if="showCron"
          >
            <select-period
              v-if="timeType === 'select'"
              :hasLable="true"
              :cron="schedule"
              @getCronString="getCronString"
              :returnEachChange="true"
              defaultCheck="scheduleByWeekdays"
            ></select-period>
            <datablau-input
              v-else
              :placeholder="'请输入cron语句'"
              class="form-item-width-input"
              v-model="form.time"
            ></datablau-input>
          </el-form-item>
          <el-form-item :label="'时间过滤'">
            <datablau-select
              style="width: 500px"
              multiple
              v-model="timeTemplate"
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
          <el-form-item label="任务是否启用">
            <datablau-switch
              v-model="enable"
              @change="changeEnable"
            ></datablau-switch>
          </el-form-item>
          <!-- <el-form-item label="是否重新扫描数据源">
            <datablau-radio v-model="scan">
              <el-radio label="no">否</el-radio>
              <el-radio
                label="yes"
                style="margin-bottom: 10px; margin-top: 6px"
              >
                是
              </el-radio>
            </datablau-radio>
          </el-form-item> -->
        </el-form>
        <div class="rule-list-title">
          <datablau-detail-subtitle
            title="规则列表"
            mt="0px"
          ></datablau-detail-subtitle>
          <div class="input-box">
            <div class="rightSwitch flex-box">
              <datablau-button
                type="important"
                :class="{
                  iconfont: true,
                  'icon-tianjia': true,
                }"
                @click="showRules"
                style="float: right"
              >
                添加规则
              </datablau-button>
            </div>
          </div>
        </div>
        <div class="table-box">
          <datablau-table
            ref="table"
            :data="currentRule"
            size="small"
            class="datablau-table table"
            style="width: 100%"
            height="100%"
          >
            <el-table-column prop="" label="" width="30">
              <i
                class="iconfont icon-menu-gzgl"
                style="font-size: 20px; color: #bf794e"
              ></i>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              prop="ruleName"
              label="规则名称"
              min-width="120"
            ></el-table-column>
            <el-table-column prop="ruleMode" label="识别对象" min-width="120">
              <template slot-scope="scope">
                <!-- <div
                  v-show="scope.row.discernType === 80000004"
                  class="meta-data surface"
                >
                  表
                </div>
                <div
                  v-show="scope.row.discernType === 80500008"
                  class="meta-data view"
                >
                  视图
                </div>
                <div
                  v-show="scope.row.discernType === 80000005"
                  class="meta-data field"
                >
                  字段
                </div> -->
                <div
                  v-if="scope.row.mlModel === 'TABLE_ONLY'"
                  class="meta-data surface"
                >
                  表
                </div>
                <div v-else class="meta-data field">字段</div>
              </template>
            </el-table-column>
            <el-table-column
              sortable
              :formatter="timeFormatter"
              prop="createTime"
              label="创建时间"
              min-width="120"
            ></el-table-column>
            <el-table-column
              label="操作"
              fixed="right"
              align="center"
              min-width="100"
            >
              <template slot-scope="scope">
                <datablau-tooltip
                  effect="dark"
                  content="删除"
                  placement="bottom"
                >
                  <datablau-button
                    @click="deleteRule(scope.$index)"
                    type="text"
                  >
                    <i class="el-icon-delete delete"></i>
                  </datablau-button>
                </datablau-tooltip>
              </template>
            </el-table-column>
          </datablau-table>
        </div>
        <div slot="buttons">
          <datablau-button type="important" @click="beforeSave">
            确认
          </datablau-button>
          <datablau-button type="secondary" @click="closeEdit">
            {{ $t('common.button.cancel') }}
          </datablau-button>
        </div>
      </datablau-form-submit>
    </div>

    <rule-selector
      v-if="showRS"
      :idList="taskDetail.ruleIds || []"
      @addRules="addRules"
      :currentRule="currentRule"
      @close="showRS = false"
    ></rule-selector>
  </div>
</template>
<script>
import addIRtask from './addIRtask.js'
export default addIRtask
</script>
<style lang="scss" scoped>
.content-box {
  position: absolute;
  top: 0px;
  right: 0;
  bottom: 0px;
  left: 0px;

  overflow: auto;
  /deep/ .row-content {
    padding: 0 20px;
  }
  .el-form {
    /deep/ .el-form-item {
      margin-bottom: 14px;
      .el-form-item__label {
        line-height: 34px;
      }
      .el-form-item__content {
        line-height: 34px;
        .el-form-item {
          margin-bottom: 0;
          .el-form-item__label {
            width: auto !important;
          }
          .el-form-item__content {
            margin-left: 0 !important;
          }
        }
      }
    }
  }
}
#data-masking-rule {
  box-sizing: border-box;
  padding: 0 20px;
  position: absolute;
  top: -8px;
  left: 0;
  right: 0;
  bottom: 0;
  //解决ie不兼容var的问题
  background-color: #fff;
  background-color: var(--default-bgc);
  z-index: 9;
  &.data-masking-rule {
    .content-box {
      top: 0;
    }
  }
  .rule-list-title {
    .input-box {
      float: right;
    }
  }

  .switch {
    margin-right: 20px;
    span {
      margin-right: 10px;
    }
  }
  .table-box {
    position: absolute;
    top: 390px;
    left: 0;
    bottom: 0px;
    right: 0;
    padding: 0 20px;
    min-height: 150px;
    .edit {
      color: #7d8493;
      font-size: 19px;
      padding-left: 30px;
      padding-right: 20px;
    }
    .delete {
      font-size: 16px;
    }
    /deep/ .el-table {
      .el-table__body-wrapper {
        position: absolute;
        top: 41px;
        left: 0;
        right: 0;
        bottom: 0;
      }
    }
  }
  @media screen and (-ms-high-contrast: active), (-ms-high-contrast: none) {
    .table-box {
      top: 330px;
    }
  }
  .label {
    padding-left: 20px;
    padding-right: 10px;
    display: inline-block;
  }
  .header {
    box-sizing: border-box;
    height: 40px;
    line-height: 40px;
    .title {
      display: inline-block;
      font-size: 13px;
      color: rgb(190, 190, 190);
    }
    .back-btn {
      display: inline-block;
      float: right;
    }
  }
  .row {
    padding-top: 18px;
    width: 100%;
    height: 40px;
    .label {
      float: left;
      text-align: right;
      width: 80px;
      padding-right: 12px;
    }
    .box {
      float: left;
    }
  }
  .tag-row {
    height: unset;
    padding-top: 18px;
    overflow: hidden;
  }
}
</style>
<style lang="scss">
#dir-rule-edit {
  .el-radio.is-bordered.is-checked {
    border-color: #4d91f7;
    background-color: #edf4ff;
  }
  #standard {
    .el-tag {
      background: #e4f2e5;
      color: #57a07f;
      .el-icon-close {
        color: #57a07f;
        &:hover {
          color: #e4f2e5;
          background-color: #57a07f;
        }
      }
    }
  }
}
.flex-box {
  display: flex;
  align-items: center;
}
.flex-box.booled {
  margin-bottom: 10px;
}
.booled > span {
  display: block;
  width: 100px;
  padding-right: 20px;
  text-align: right;
}
.is-block.noUsed {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
