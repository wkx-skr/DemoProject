<template>
  <div class="create-application-page">
    <div class="center-content">
      <div class="page-header">
        <i class="fa fa-cog"></i>
        权限申请
      </div>
      <div class="content-box">
        <div class="base-info">
          <div class="form-title title-item">基本信息</div>
          <el-form
            label-position="right"
            label-width="110px"
            size="small"
            ref="userInfo"
            :model="userInfo"
          >
            <el-form-item label="标题">
              <!-- <el-input size="mini" v-model="userInfo.title" placeholder="请输入标题" class="mes-title" :disabled="true"></el-input> -->
              <span>{{ userInfo.title }}</span>
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
                class="clear-border-radius"
                align="right"
                type="date"
                placeholder="选择日期"
                value-format="timestamp"
                size="mini"
                :disabled="userInfo.applType !== 'cosType'"
                :picker-options="pickerOptions1"
              ></el-date-picker>
            </el-form-item>
            <el-form-item label="备注">
              <el-input
                type="textarea"
                size="mini"
                v-model="userInfo.description"
                placeholder="请输入备注"
                class="clear-border-radius"
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
              :data="applaTableData"
              header-cell-class-name="table-header-cell"
              cell-class-name="table-cell-clearpadding"
              @selection-change="handleSelectionChange"
            >
              <el-table-column
                type="selection"
                width="55"
                header-align="center"
                class-name="table-check-box"
              ></el-table-column>
              <el-table-column prop="name" label="名称">
                <!-- sortable="custom" -->
                <template slot-scope="scope">
                  <span>{{ scope.row.detail.physicalName }}</span>
                </template>
              </el-table-column>
              <el-table-column label="所属数据源">
                <template slot-scope="scope">
                  <span>{{ scope.row.detail.modelName }}</span>
                </template>
              </el-table-column>
              <el-table-column label="管理员">
                <template slot-scope="scope">
                  <span>{{ scope.row.detail.owner }}</span>
                </template>
              </el-table-column>
              <el-table-column
                label="操作"
                fixed="right"
                width="60"
                header-align="center"
                align="center"
              >
                <template slot-scope="scope">
                  <el-button
                    type="text"
                    size="mini"
                    @click="handleRemoveAppliTable(scope)"
                  >
                    {{ $t('common.button.delete') }}
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <!-- @sort-change="handleSortChange" -->
          </div>
        </div>
        <div class="bottom-btn-box">
          <el-button
            class="submit-btn"
            @click="handleSubmit"
            :disabled="!cansubmit"
            :class="{ 'disabled-subbtn': !cansubmit }"
          >
            提交
          </el-button>
          <el-button class="submit-btn cancle-btn" @click="handleCancle">

            {{ $t('common.button.cancel') }}

          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import createApplication from './createApplication.js'
export default createApplication
</script>

<style lang="scss">
@import '../../assets/styles/constForDDC.sass';

$marginleft: 30px;
$greybgc: var(--ddc-search-main-bgc);
.create-application-page {
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
      background-color: var(--white-grey-bgc);
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
          }
        }
      }
    }
    .bottom-btn-box {
      margin-top: 20px;
      .submit-btn {
        display: inline-block;
        margin: 0;
        margin-left: $marginleft;
        padding: 0;
        border-radius: 0;
        background-color: $deepBlueForBtn;
        color: #fff;
        display: inline-block;
        width: 80px;
        height: 40px;
        line-height: 35px;
        text-align: center;
        font-size: 12px;
        // cursor: pointer;
        &.disabled-subbtn {
          background-color: $deepBlueForBtnDisabled;
        }
        &.cancle-btn {
          margin-left: 10px;
        }
      }
    }

    .el-radio-button__orig-radio:checked + .el-radio-button__inner {
      color: var(--default-opposite-color);
      background-color: var(--color-primary);
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
.create-application-page {
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
    background: var(--main-content-bgc);
    height: 34px;
    border-bottom: $greyBorder2;
  }
  .table-check-box {
    text-align: center;
  }
}
</style>
