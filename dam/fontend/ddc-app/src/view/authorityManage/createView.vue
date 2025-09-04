<template>
  <div class="create-view" id="createview">
    <div class="center-conta">
      <div class="create-view-contianer">
        <el-dialog
          :visible.sync="showCreateSql"
          :append-to-body="true"
          title="生成SQL语句"
          class="create-sql-dialog"
        >
          <create-sql
            ref="createSql"
            @submitSql="setSql"
            :tableObjectId="tableId"
            :schemaName="schemaName"
            :getTableData="getTableData"
            :defaultSqlContent="sqlContent"
          ></create-sql>
        </el-dialog>
        <el-dialog
          :visible.sync="showTestResult"
          :append-to-body="true"
          title="测试结果"
          class="api-test-result"
        >
          <div class="rigth-part dialog-container">
            <div class="view-columns create-view-item">
              <span class="right-title">视图字段</span>
              <div class="item-con">
                <div class="view-col-con">
                  <el-table
                    class="view-col-table"
                    ref="viewColumns"
                    :data="viewColumns"
                    header-row-class-name="colunm-table-head"
                    header-cell-class-name="table-header-cell"
                    cell-class-name="table-cell-clearpadding"
                    max-height="300"
                  >
                    <!-- height="300" -->
                    <el-table-column
                      show-overflow-tooltip
                      prop="name"
                      label="名称"
                    ></el-table-column>
                    <el-table-column
                      show-overflow-tooltip
                      prop="order"
                      label="序号"
                    ></el-table-column>
                    <el-table-column
                      show-overflow-tooltip
                      prop="alias"
                      label="别名"
                    ></el-table-column>
                    <el-table-column
                      show-overflow-tooltip
                      prop="dataType"
                      label="数据类型"
                    ></el-table-column>
                    <el-table-column
                      show-overflow-tooltip
                      prop="description"
                      label="描述"
                    ></el-table-column>
                  </el-table>
                </div>
              </div>
            </div>
            <div class="ex-data create-view-item">
              <span class="right-title">样例数据</span>
              <div class="item-con">
                <div class="exdata-con" v-if="viewColumns.length > 0">
                  <el-table
                    class="examp-data-table"
                    ref="exampData"
                    header-cell-class-name="table-header-cell"
                    cell-class-name="table-cell-clearpadding"
                    max-height="300"
                    :data="exampData"
                    header-row-class-name="colunm-table-head"
                  >
                    <el-table-column
                      v-for="item in viewColumns"
                      show-overflow-tooltip
                      :key="item.order"
                      :prop="item.name"
                      :label="item.name"
                    ></el-table-column>
                  </el-table>
                </div>
              </div>
            </div>
          </div>
        </el-dialog>
        <div class="scroll-box">
          <div class="top-con">
            <el-form
              ref="form"
              label-width="110px"
              label-position="right"
              size="small"
              :model="formContent"
              :rules="formRuls"
            >
              <el-form-item label="视图名称" prop="name">
                <!-- :rules="{required: true}" -->
                <el-input
                  size="mini"
                  v-model="formContent.name"
                  placeholder="请输入名称"
                  clearable
                ></el-input>
              </el-form-item>
              <el-form-item label="描述">
                <el-input
                  type="textarea"
                  v-model="formContent.description"
                  placeholder="请输入描述"
                  resize="none"
                  clearable
                  size="mini"
                  class="description"
                ></el-input>
              </el-form-item>
              <el-form-item label="依赖数据源" v-if="false">
                <el-select
                  size="mini"
                  v-model="formContent.virds"
                  placeholder="请选择数据源"
                  clearable
                  filterable
                  multiple
                >
                  <el-option
                    v-for="item in virdsArr"
                    :key="item.name"
                    :label="item.name"
                    :value="item.name"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="所属数据源">
                {{ modelName }}
              </el-form-item>
              <el-form-item label="绑定到表">
                <el-select
                  size="mini"
                  v-model="bindTableVds"
                  placeholder="请选择数据源"
                  clearable
                  filterable
                  @change="handleVurDschange"
                  v-if="false"
                >
                  <el-option
                    v-for="item in virdsArr"
                    :key="item.modelId"
                    :label="item.name"
                    :value="item.name"
                  ></el-option>
                </el-select>
                <el-select
                  size="mini"
                  v-model="formContent.bindTableObjectId"
                  placeholder="请选择表"
                  clearable
                  filterable
                >
                  <el-option
                    v-for="item in tablesArr"
                    :key="item.objectId"
                    :label="item.name"
                    :value="item.objectId"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="SQl语句">
                <el-input type="textarea" v-model="sqlContent"></el-input>
              </el-form-item>
              <el-form-item label="过期时间">
                <el-date-picker
                  class="data-picker"
                  v-model="formContent.expire"
                  align="right"
                  type="date"
                  placeholder="选择日期"
                  value-format="timestamp"
                  size="mini"
                  :picker-options="pickerOptions1"
                ></el-date-picker>
              </el-form-item>
              <el-form-item>
                <el-checkbox v-model="shareable">其他人可以申请</el-checkbox>
              </el-form-item>
              <el-form-item>
                <el-button @click="handleTestModel1" size="small">
                  测试
                </el-button>
                <span class="test-icon">
                  <i class="el-icon-success" v-if="testState === 'success'"></i>
                  <i class="el-icon-error" v-if="testState === 'fail'"></i>
                  <i class="el-icon-loading" v-if="testState === 'start'"></i>
                </span>
                <el-button @click="handleCreateSQL" size="small">
                  自定义SQL
                </el-button>
              </el-form-item>
            </el-form>
          </div>
          <div class="middle-con" v-if="false">
            <div class="left-form">
              <div class="right-sql create-view-item">
                <div class="title-item">
                  <span class="red-start">SQL</span>
                  <!-- <el-tooltip
                    content="SQL语句可以自行编辑，FROM 语句中表名需要带上数据库名称，为数据源名称。"
                  >
                    <i class="fa fa-info-circle"></i>
                  </el-tooltip> -->
                </div>
                <div class="item-con">
                  <el-input
                    v-model="sqlContent"
                    placeholder="请输入SQL语句"
                    type="textarea"
                    class="sql-con"
                    resize="none"
                  ></el-input>
                  <div class="sql-btn">
                    <span class="btn-sql" @click="handleCreateSQL">
                      自动生成
                    </span>
                    <span class="btn-sql" @click="handleTestModel2">
                      测试SQL
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="bottom-btn">
          <span
            class="btn-item cir-btn"
            v-if="createViewable"
            @click="handleCreateViews"
          >
            {{ $t('common.button.ok') }}
          </span>
          <span class="btn-item cir-btn disabled-green-btn" v-else>{{ $t('common.button.ok') }}</span>
          <span class="btn-item" @click="handleCancle"> {{ $t('common.button.cancel') }} </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import createView from './createView.js'
export default createView
</script>

<style lang="scss">
$confirmBlue: #4278c9;
@import '../../assets/styles/constForDDC.sass';
.create-view {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #f4f4f4;

  .center-conta {
    position: relative;
    min-width: 900px;
    max-width: 1240px;
    width: 100%;
    margin: 0 auto;
    height: 100%;
    padding: 20px 0;

    .create-view-contianer {
      position: relative;
      width: 100%;
      height: 100%;
      background-color: #fff;
      .red-start::before {
        content: '*';
        color: #f56c6c;
        margin-right: 4px;
        font-size: 14px;
      }
      .scroll-box {
        position: absolute;
        top: 0px;
        // top: 20px;
        left: 0;
        right: 0;
        bottom: 60px;
        overflow: auto;
        .title-item {
          position: absolute;
          left: -80px;
          top: 2px;
        }
        .item-con {
          overflow: auto;
        }
        .top-con {
          // position: absolute;
          // top: 0;
          // left: 0;
          // right: 0;
          // margin: 0;
          // height: 130px;;
          padding: 20px 0 0 0;
          border-top: 1px solid #eee;
          // border-bottom: 1px solid #aaa;
          input,
          textarea {
            width: 100%;
            border-radius: 0;
          }
          .description {
            width: 400px;
            height: 50px;
            textarea {
              width: 100%;
              height: 100%;
            }
          }
          .test-icon {
            display: inline-block;
            width: 20px;
            .el-icon-success {
              color: #479eff;
            }
            .el-icon-loading {
              color: #479eff;
            }
            .el-icon-error {
              color: #f55c5c;
            }
          }
        }
        .middle-con {
          position: relative;
          // position: absolute;
          // top: 130px;
          // bottom: 60px;
          // left: 0;
          // right: 0;
          .create-view-item {
            position: relative;
            margin-bottom: 10px;
          }
          .left-form {
            $inputWidth: 150px;
            width: 49%;
            height: 100%;
            display: inline-block;
            position: relative;
            padding-left: 100px;
            padding-top: 10px;
            input {
              width: $inputWidth;
            }
            .right-sql {
              position: relative;
              .sql-con {
                height: 180px;
                // width: 100%;
                border: 1px solid #dddddd;
                &.el-textarea {
                  border: none;
                }
              }
              .sql-btn {
                width: 100%;
                background-color: #eff2f7;
                height: 50px;
                text-align: center;
                line-height: 50px;
                .btn-sql {
                  width: 50%;
                  float: left;
                  border: 1px solid #dddddd;
                  cursor: pointer;
                }
              }
            }
            .data-choose {
              width: 100%;
              position: relative;
              .no-vDs-info {
                display: inline-block;
                margin-left: 10px;
              }
            }
            .deadtime {
              position: relative;
              .item-con {
                .data-picker {
                  // width: $inputWidth;
                }
              }
            }
          }
          .rigth-part {
            position: absolute;
            top: 0;
            right: 20px;
            bottom: 0;
            // padding-top: 10px;
            padding-left: 100px;
            width: 49%;
            // border: $testBorder;
            .right-title {
              position: absolute;
              left: -80px;
              top: 15px;
            }

            .view-columns {
              position: relative;
              .view-col-con {
                border: $greyBorder2;
                margin: 10px 0;
                height: 302px;
              }
            }
            .ex-data {
              position: relative;
              margin-top: 10px;
              .exdata-con {
                border: $greyBorder2;
                max-height: 302px;
              }
            }
          }
          .ex-Data {
            // border: $testBorder;
            margin: 20px;
          }
        }
      }
      .bottom-btn {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 60px;
        padding: 10px 0 20px 20px;
        border-top: $greyBorder2;
        .btn-item {
          width: 70px;
          height: 34px;
          display: inline-block;
          line-height: 34px;
          text-align: center;
          cursor: pointer;
          border: 1px solid #aaa;
          &.cir-btn {
            background-color: $confirmBlue;
            color: #fff;
            margin-right: 20px;
          }
          &.disabled-green-btn {
            cursor: not-allowed;
            background-color: $deepBlueForBtnDisabled;
          }
        }
      }
    }
  }
}
</style>
<style lang="scss">
.create-view {
  &#createview {
    .center-conta {
      input,
      textarea {
        border-radius: 0;
        &:focus {
          outline: none;
          border-color: #dcdfe6;
        }
      }
    }
    .top-con {
      .el-form-item__content {
        width: 400px;
      }
    }
  }
  // 自定义 table style
  .el-table__header-wrapper {
    border: 1px solid #dddddd;
  }
  .colunm-table-head {
    background-color: #f6f6f6;
    th,
    tr {
      background-color: #f6f6f6;
    }
  }
  .table-header-cell {
    height: 34px;
    color: #000;
    padding: 0 10px;
  }
  .table-check-box {
    text-align: center;
  }
  .view-table-cell {
    padding: 0 10px;
    line-height: 34px;
    .cell {
      line-height: 34px;
    }
  }

  .sql-con {
    textarea {
      width: 100%;
      height: 100%;
    }
  }
  .select-condition {
    .input-box {
      & > div.el-select,
      & > div.el-input {
        width: 30%;
        display: inline-block;
        input {
          width: 100%;
        }
      }
    }
  }
}

.create-sql-dialog {
  .el-dialog {
    min-width: 1000px;
  }
}
.api-test-result {
  .el-dialog__body {
    padding: 10px 30px 20px;
  }
  .dialog-container {
    // border: 1px solid red;
    min-height: 500px;
    .right-title {
      border-left: 2px solid #c6b57f;
      padding-left: 4px;
      display: inline-block;
      margin: 10px 0 15px;
    }
  }
}
</style>
