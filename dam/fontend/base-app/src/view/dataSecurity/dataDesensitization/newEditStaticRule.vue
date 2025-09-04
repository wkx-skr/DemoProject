<template>
  <div v-loading="loading" id="edit-static-rule">
    <div class="datablau-breadcrumb-header">
      <div>
        <datablau-breadcrumb
          @back="closeEdit"
          :node-data="nodeData"
          :couldClick="false"
        ></datablau-breadcrumb>
      </div>
    </div>
    <datablau-form-submit>
      <div class="descriptionMessage-title" style="margin-top: 20px">
        <p class="message-title">基本信息</p>
      </div>
      <div v-loading="topLoading" class="top">
        <el-form
          :rules="rules"
          :model="form"
          class="top-form"
          ref="form"
          size="small"
          style="height: 144px"
        >
          <el-form-item
            :label="'任务名称' + (!editMode && !secondStep ? '' : '：')"
            prop="name"
          >
            <datablau-input
              v-if="!editMode && !secondStep"
              style="width: 300px"
              v-model="form.name"
              placeholder="请输入任务名称"
              :maxlength="100"
              show-word-limit
            ></datablau-input>
            <p v-else>{{ form.name }}</p>
          </el-form-item>
          <el-form-item
            :label="'脱敏数据源' + (!editMode && !secondStep ? '' : '：')"
            prop="originId"
          >
            <datablau-select
              filterable
              :class="{ 'input-no-border': editMode || secondStep }"
              :disabled="editMode || secondStep"
              style="width: 300px"
              v-model="form.originId"
              placeholder="选择源数据源"
              @change="handleOdsChange"
            >
              <el-option
                v-for="item in currentDsOpts"
                :key="item.modelId"
                :label="item.definition"
                :value="item.modelId"
              ></el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item
            :label="'目标数据源' + (!editMode && !secondStep ? '' : '：')"
            :class="{ 'input-no-border': editMode || secondStep }"
            prop="tragetId"
          >
            <datablau-select
              filterable
              :disabled="editMode || isDisabled || secondStep"
              style="width: 300px"
              v-model="form.tragetId"
              placeholder="选择源数据源"
            >
              <el-option
                v-for="item in targetDs"
                :key="item.modelId"
                :label="item.definition"
                :value="item.modelId"
              ></el-option>
            </datablau-select>
          </el-form-item>
        </el-form>
        <div class="row-box">
          <select-period
            :cron="cron"
            @getCronString="getCronString"
            defaultCheck="scheduleByWeekdays"
          ></select-period>
          <el-form
            class="check-box"
            label-width="180px"
            size="mini"
            style="display: block"
          >
            <el-form-item label="任务配置">
              <el-checkbox style="margin-top: 0" v-model="cb1" label="">
                如果目标库的表不存在，则进行创建
              </el-checkbox>
              <el-checkbox v-model="cb2" label="">
                复制脱敏数据到目标表之前，清空目标表的数据
              </el-checkbox>
              <el-checkbox v-model="cb3" label="">
                创建目标表时，复制索引
              </el-checkbox>
            </el-form-item>
          </el-form>
        </div>
        <br />
      </div>
      <div
        style="margin-top: 10px"
        v-show="originTables.length > 0"
        class="content-box"
      >
        <el-tabs v-model="activeName">
          <el-tab-pane label="数据脱敏" name="1">
            <div class="inner-box">
              <div class="left">
                <div class="descriptionMessage-title">
                  <p class="message-title">脱敏设置</p>
                </div>
                <datablau-table
                  row-class-name="pointer"
                  :data="originTables"
                  @row-click="handleRowClick"
                  class="datablau-table table"
                  style="width: 100%; margin-top: 10px"
                >
                  <el-table-column
                    prop=""
                    label="表名"
                    min-width="100"
                    show-overflow-tooltip
                  >
                    <template slot-scope="scope">
                      {{ getoriginalTableName('physicalName', scope.row) }}
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop=""
                    label="中文名"
                    min-width="100"
                    show-overflow-tooltip
                  >
                    <template slot-scope="scope">
                      {{ getoriginalTableName('logicalName', scope.row) }}
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop=""
                    label="是否脱敏"
                    fixed="right"
                    header-align="center"
                    align="center"
                    width="120"
                  >
                    <template slot-scope="scope">
                      <el-switch
                        v-model="scope.row.enabled"
                        :active-value="true"
                        :inactive-value="false"
                        @click.stop.native="function () {}"
                        @change="
                          updateDatamaskingTableStatus($event, scope.row.id)
                        "
                        style="position: relative; bottom: 3px"
                      ></el-switch>
                    </template>
                  </el-table-column>
                </datablau-table>
                <datablau-pagination
                  style="margin-top: 20px"
                  v-show="activeName === '1' && originTables.length > 0"
                  @size-change="handleSizeChange"
                  @current-change="handleCurrentChange"
                  :current-page.sync="currentPage"
                  :page-sizes="[10, 20, 50, 100]"
                  :page-size.sync="pageSize"
                  layout="total, prev, pager, next"
                  :total="total"
                  class="page"
                ></datablau-pagination>
              </div>
              <div class="right" v-loading="colsLoading">
                <div class="descriptionMessage-title" v-show="cols.length > 0">
                  <p class="message-title">
                    脱敏规则配置-{{ currentTableName }}
                  </p>
                </div>
                <!-- <el-button  type="primary" size="mini" @click="showColSelector = true">添加字段</el-button>                        -->
                <datablau-table
                  v-show="cols.length > 0"
                  :data="cols"
                  size="small"
                  class="datablau-table table"
                  style="width: 100%; margin-top: 10px"
                >
                  <el-table-column prop="" label="字段名" width="210">
                    <template slot-scope="scope">
                      {{ scope.row.originalColumn.physicalName }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="name" label="中文名" width="210">
                    <template slot-scope="scope">
                      {{ scope.row.originalColumn.logicalName }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="" label="数据安全等级" min-width="100">
                    <template slot-scope="scope">
                      {{
                        scope.row.dataAuthTag ? scope.row.dataAuthTag.name : ''
                      }}
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop=""
                    label="脱敏规则"
                    fixed="right"
                    header-align="center"
                    align="center"
                    width="220"
                  >
                    <template slot-scope="scope">
                      <el-select
                        size="mini"
                        v-model="scope.row.rules[0].ruleId"
                        placeholder="选择脱敏规则"
                        @change="updateMaskingCols($event, scope.row.id)"
                        clearable
                      >
                        <el-option
                          v-for="val in currentRules"
                          :key="val.id"
                          :label="val.name"
                          :value="val.id"
                        ></el-option>
                      </el-select>
                    </template>
                  </el-table-column>
                </datablau-table>
                <datablau-pagination
                  style="margin-top: 20px"
                  v-show="activeName === '1' && cols.length > 0"
                  @size-change="rightHandleSizeChange"
                  @current-change="rightHandleCurrentChange"
                  :current-page.sync="rightCurrentPage"
                  :page-sizes="[10, 20, 50, 100]"
                  :page-size.sync="rightPageSize"
                  layout="total, prev, pager, next"
                  :total="rightTotal"
                  class="page"
                ></datablau-pagination>
                <div v-show="cols.length === 0" class="tips">
                  <img :src="bg" />
                  <p>从左侧选择数据表，进行脱敏策略设置</p>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      <div slot="buttons">
        <div class="buttons">
          <datablau-button type="secondary" @click="closeEdit">
            关闭
          </datablau-button>
          <datablau-button
            v-if="!editMode && !secondStep"
            type="important"
            @click="beforeSave"
          >
            下一步
          </datablau-button>
          <datablau-button
            v-if="(editMode || secondStep) && form.tragetId && form.originId"
            type="important"
            @click="saveOption"
          >
            保存
          </datablau-button>
          <datablau-button
            v-if="(editMode || secondStep) && !(form.tragetId && form.originId)"
            type="danger"
            @click="deleteOption"
          >
            删除任务
          </datablau-button>
        </div>
      </div>
    </datablau-form-submit>

    <table-selector
      v-if="showTableSelector"
      @close="showTableSelector = false"
      @addData="addTables"
      :id="form.originId"
    ></table-selector>
    <!-- <el-dialog
            title="运行设置"
            :visible.sync="dialogVisible"
            width="858px"
            :modal-append-to-body='false'
            >
            <select-period style="transform: translateX(-27px);margin-top:10px"
                :cron='cron'
                @getCronString="getCronString"
                defaultCheck="scheduleByWeekdays"
            ></select-period>
            <el-checkbox v-model="cb1" label="">如果目标库的表不存在，则进行创建</el-checkbox>
            <el-checkbox v-model="cb2" label="">复制脱敏数据到目标表之前，清空目标表的数据</el-checkbox>
            <el-checkbox v-model="cb3" label="">创建目标表时，复制索引</el-checkbox>
            <span slot="footer">
                <el-button size='mini' type="primary" @click="saveOption">确定</el-button>
                <el-button size='mini' @click=" dialogVisible = false">取消</el-button>
            </span>
        </el-dialog> -->
  </div>
</template>
<script>
import newEditStaticRule from './newEditStaticRule'
export default newEditStaticRule
</script>
<style lang="scss" scoped>
.input-no-border {
  /deep/ .el-input__inner {
    border: 0;
  }
}
#edit-static-rule {
  overflow: auto;
  box-sizing: border-box;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  //解决ie不兼容var的问题
  background-color: #fff;
  background-color: var(--default-bgc);
  z-index: 9;
  /deep/ .form-submit {
    top: 40px;
    .row-content {
      padding: 0 20px;
      .top {
        max-width: 1000px;
        margin-top: 20px;
        .top-form {
          .el-form-item {
            margin-bottom: 14px;
            .el-form-item__label {
              width: 180px;
              line-height: 34px;
            }
            .el-form-item__content {
              width: 300px;
              line-height: 34px;
              display: inline-block;
            }
          }
        }
      }
    }
    .row-buttons {
      .page {
        float: left;
      }
    }
  }
  .row-box {
    /deep/ .el-form-item {
      margin-bottom: 14px;
      .el-form-item__label {
        width: 180px !important;
      }
    }
  }
  .check-box {
    display: inline-block;
  }
  .content-box {
    // position: absolute;
    // left: 0;
    // right: 0;
    // top: 300px;
    // bottom: 50px;
    .inner-box {
      height: 100%;
    }
    .left {
      position: relative;
      float: left;
      width: 40%;
      height: 100%;
      overflow: auto;
      /deep/ .el-pagination {
        text-align: center;
      }
    }
    .right {
      padding-left: 20px;
      position: relative;
      float: left;
      width: 58%;
      height: 100%;
      margin-left: 2%;
      // overflow: auto;
      /deep/ .el-pagination {
        text-align: center;
      }
      .title {
        font-size: 16px;
        line-height: 35px;
        display: inline-block;
      }
      .tips {
        text-align: center;
        margin-top: 80px;
        // position: absolute;
        // top: 50%;
        // left: 50%;
        // transform: translate(-50%, -50%);
        p {
          padding-top: 20px;
          text-align: center;
          font-size: 12px;
        }
      }
    }
    .disc {
      font-size: 12px;
      margin: 10px 0 10px 15px;
    }
  }
  .title-line {
    margin-top: 10px;
    position: relative;
    height: 20px;
    p {
      float: left;
      padding-left: 6px;
      border-left: 4px solid #4386f5;
      width: 70px;
      font-size: 14px;
      background-color: var(--default-bgc);
    }
    .line {
      position: absolute;
      top: 50%;
      width: 100%;
      transform: translateY(-50%);
      border-bottom: 1px solid #e0e0e0;
      z-index: -1;
    }
  }
  .bottom {
    box-sizing: border-box;
    padding: 10px 20px;
    //padding-top: 10px;
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 50px;
    background-color: var(--default-bgc);
    .page {
      float: left;
    }
    .page2 {
      float: right;
    }
  }
}
</style>
<style lang="scss">
#edit-static-rule {
  .pointer {
    cursor: pointer;
  }
  .el-tabs {
    &.el-tabs--top {
      height: 100%;
      position: relative;
    }
    .el-tabs__header {
      display: none;
    }
    // .el-tabs__content {
    //   position: absolute;
    //   top: 20px;
    //   right: 0;
    //   bottom: 0;
    //   left: 0;
    //   overflow: hidden;
    // }
    .el-tab-pane {
      padding: 0;
      height: 100%;
      overflow: hidden;
    }
  }
  .el-checkbox {
    // margin-top: 10px;
    display: block;
    max-width: 280px;
  }
  .el-dialog__footer {
    padding-top: 50px;
    text-align: right;
  }
  .el-select {
    margin-right: 5px;
  }
}
</style>
