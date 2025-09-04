<template>
  <div class="data-show-page">
    <div class="center-box">
      <div class="message-box">
        <p class="view-name">{{ viewName }}</p>
        <div class="form-box">
          <div class="sqlorpara">
            <div
              class="parachoosed"
              :class="{ 'choosed-item': !showSql }"
              @click="
                () => {
                  showSql = false
                }
              "
            >
              条件编辑器
            </div>
            <div
              class="sqlhoosed"
              :class="{ 'choosed-item': showSql }"
              @click="
                () => {
                  showSql = true
                }
              "
            >
              SQL
            </div>
          </div>
          <div class="form-conta">
            <el-form
              label-position="right"
              label-width="110px"
              size="small"
              ref="form"
              class="para-form"
              v-if="!showSql"
            >
              <el-form-item label="选择字段" size="mini">
                <el-select
                  v-model="choosedColumns"
                  filterable
                  clearable
                  class="half-width"
                  :multiple="true"
                >
                  <el-option
                    v-for="item in viewColumns"
                    :label="item.name"
                    :value="item.name"
                    :key="item.name"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="分页" size="mini">
                <span>每页条目数：</span>
                <el-input
                  size="mini"
                  v-model="pageSize"
                  placeholder="pageSize"
                  class="page-input"
                ></el-input>
                <span>页码：</span>
                <el-input
                  size="mini"
                  v-model="currentPage"
                  placeholder="currentPage"
                  class="page-input"
                ></el-input>
              </el-form-item>
              <el-form-item label="where条件" size="mini">
                <el-input
                  size="mini"
                  v-model="where"
                  placeholder="请输入SQL语句"
                  class="half-width"
                  clearable
                ></el-input>
              </el-form-item>
              <el-form-item label="分组" size="mini">
                <el-select
                  v-model="groupBy"
                  filterable
                  clearable
                  class="half-width"
                  :multiple="true"
                >
                  <el-option
                    v-for="item in viewColumns"
                    :label="item.name"
                    :value="item.name"
                    :key="item.id"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="排序" size="mini">
                <el-select
                  v-model="orderBy"
                  filterable
                  clearable
                  class="half-width"
                  :multiple="true"
                >
                  <el-option
                    v-for="item in viewColumns"
                    :label="item.name"
                    :value="item.name"
                    :key="item.id"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-form>
            <el-input
              size="mini"
              type="textarea"
              v-model="sqlContent"
              placeholder="请输入SQL语句"
              class="sql-content"
              resize="none"
              clearable
              v-if="showSql"
            ></el-input>
          </div>
          <div class="btn-execu" @click="getSqlData">执行</div>
        </div>
        <div class="data-contain" ref="dataShowCon">
          <el-tabs v-model="showResultTab" @tab-click="handleChangeTab">
            <el-tab-pane label="查询结果" name="queryResult">
              <div class="query-result tab-item">
                <el-table
                  :data="resultData"
                  :height="dataTableHeight"
                  header-row-class-name="table-head-row"
                  header-cell-class-name="table-header-cell"
                  cell-class-name="table-cell"
                  v-if="showResultTab === 'queryResult'"
                >
                  <el-table-column
                    v-for="(item, index) in resultColumns"
                    :key="index"
                    :label="item.name"
                    show-overflow-tooltip
                  >
                    <template slot="header" slot-scope="scope">
                      <span-with-tooltip
                        :content="item.name"
                        :classString="'table-header-span'"
                      ></span-with-tooltip>
                    </template>
                    <template slot-scope="scope">
                      <span>{{ scope.row[index] }}</span>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-tab-pane>
            <el-tab-pane label="字段" name="fieldsInfo">
              <div class="fields-info tab-item">
                <el-table
                  :data="viewColumns"
                  :height="dataTableHeight"
                  header-row-class-name="table-head-row"
                  header-cell-class-name="table-header-cell"
                  cell-class-name="table-cell"
                >
                  <el-table-column
                    prop="order"
                    label="序号"
                    width="100"
                  ></el-table-column>
                  <el-table-column
                    prop="name"
                    label="名称"
                    width="180"
                    show-overflow-tooltip
                  ></el-table-column>
                  <el-table-column
                    prop="alias"
                    label="别名"
                    width="180"
                    show-overflow-tooltip
                  ></el-table-column>
                  <el-table-column
                    prop="dataType"
                    label="数据类型"
                    width="100"
                    show-overflow-tooltip
                  ></el-table-column>
                  <el-table-column
                    prop="description"
                    label="描述"
                    show-overflow-tooltip
                  ></el-table-column>
                </el-table>
              </div>
            </el-tab-pane>
            <el-tab-pane label="信息" name="queryInfo">
              <div class="query-info tab-item">
                <el-form
                  label-position="right"
                  label-width="110px"
                  size="small"
                  ref="queryInfo"
                  class="query-info-form"
                >
                  <el-form-item label="执行时间" size="mini">
                    <p class="query-info-item">
                      {{ $timeFormatter(execuTime) || '无' }}
                    </p>
                  </el-form-item>
                  <el-form-item label="url" size="mini">
                    <p class="query-info-item">
                      {{ apiShow }}
                      &nbsp;
                      <el-button
                        type="text"
                        class="check-btn"
                        @click="handleCopyUrl"
                      >
                        复制
                      </el-button>
                    </p>
                  </el-form-item>
                  <el-form-item
                    label="执行结果"
                    size="mini"
                    v-if="execuSucces !== null"
                  >
                    <p class="query-info-item">
                      {{ execuSucces ? '运行成功' : '运行失败' }}
                    </p>
                  </el-form-item>
                  <el-form-item
                    label="原因"
                    size="mini"
                    v-if="execuSucces !== null && execuSucces !== true"
                  >
                    <p class="query-info-item">{{ execuErrMsg }}</p>
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>
            <el-tab-pane label="执行历史" name="queryHistory">
              <div class="query-history tab-item">
                <el-table
                  :data="execuHistoryData"
                  :height="dataTableHeight"
                  @row-click="handleClickRow"
                  :row-style="{ cursor: 'pointer' }"
                  header-row-class-name="table-head-row"
                  header-cell-class-name="table-header-cell"
                  cell-class-name="table-cell"
                >
                  <el-table-column
                    prop="execuTime"
                    label="时间"
                    width="250"
                    :formatter="$timeFormatter"
                  ></el-table-column>
                  <el-table-column
                    prop="SQL"
                    label="SQL"
                    show-overflow-tooltip
                  ></el-table-column>
                  <!-- <el-table-column label="操作" show-overflow-tooltip>
                    <template slot-scope="scope">
                      <el-button @click="removeHisItem(scope)" type="text" size="mini">删除</el-button>
                    </template>
                  </el-table-column> -->
                </el-table>
                <div class="bottom-line">
                  <el-button
                    @click="removeHisAll"
                    class="clear-his-btn"
                    size="mini"
                  >
                    清空
                  </el-button>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import dataShow from './dataShow.js'
export default dataShow
</script>

<style lang="scss">
@import '../../assets/styles/constForDDC.sass';
// $bottomHeight: 300px;
.data-show-page {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #f4f4f4;
  .center-box {
    margin: 0 auto;
    position: relative;
    max-width: 1240px;
    width: 100%;
    margin: 0 auto;
    height: 100%;
    .message-box {
      position: absolute;
      top: 20px;
      bottom: 20px;
      left: 0;
      right: 0;
      background-color: #fff;
      font-size: 18px;
      text-align: center;
      padding-left: 20px;
      // background-color: red;
      overflow: auto;
      .view-name {
        padding: 20px 0 0 0;
        font-weight: bold;
        font-size: 16px;
        text-align: left;
      }
      .form-box {
        text-align: left;
        padding: 20px 0 20px 0;
        .form-conta {
          margin-bottom: 10px;
        }
        .sqlorpara {
          // border: 1px solid red;
          font-size: 14px;
          // padding-bottom: 14px;
          border-bottom: $greyBorder;
          margin-bottom: 20px;
          .parachoosed,
          .sqlhoosed {
            display: inline-block;
            padding-bottom: 14px;
            cursor: pointer;
            // width: 86px;
            margin-right: 20px;
            text-align: left;
            &.choosed-item {
              border-bottom: 2px solid $deepBlueForBtn;
              color: $deepBlueForBtn;
            }
          }
        }
        .url-form-item {
          .url-btn {
            display: inline-block;
            width: 70%;
            .url-input {
              width: 100%;
              max-width: 800px;
            }
            .check-btn {
              float: left;
            }
          }
        }
        .half-width {
          width: 490px;
          min-height: 40px;
        }
        .page-input {
          width: 5%;
        }
        .btn-execu {
          background-color: $deepBlueForBtn;
          color: #fff;
          width: 80px;
          line-height: 38px;
          text-align: center;
          border-radius: 2px;
          font-size: 12px;
          cursor: pointer;
        }
        .sql-content {
          // border: 2px solid red;
          width: 800px;
          height: 160px;
        }
      }
      .data-contain {
        // border: $testBorder;
        .tab-item {
          width: 100%;
          &.query-history {
            .bottom-line {
              text-align: left;
              padding-top: 10px;
              // .clear-his-btn {}
            }
          }
        }
        .view-data {
          text-align: left;
          overflow: auto;
          width: 100%;
          height: 100%;
        }
        .query-info {
          .query-info-form {
            text-align: left;
            .query-info-item {
              display: inline-block;
              padding-left: 10px;
            }
          }
        }
      }
    }
  }
}
</style>

<style lang="scss">
$inputMinHeight: 40px;
.data-show-page {
  .para-form {
    .el-form-item {
      min-height: $inputMinHeight;
      margin-bottom: 10px;
      .el-form-item__label {
        line-height: $inputMinHeight;
      }
    }
    .el-select .el-input.is-focus .el-input__inner {
      border-color: #dcdfe6;
    }
    .half-width {
      input {
        width: 100%;
        min-height: $inputMinHeight;
      }
    }
  }
  input,
  textarea {
    border-radius: 0;
    min-height: $inputMinHeight;
    &:hover,
    &:focus {
      border-color: #dcdfe6;
    }
  }
  .sql-content {
    textarea {
      width: 100%;
      height: 100%;
    }
  }

  // 自定义 table style
  $tableRowHeigth: 40px;
  .el-table__header-wrapper {
    // border: 1px solid #DDDDDD;
    // background: #F6F6F6;
    thead {
      background-color: transparent;
      .table-head-row {
        background: #f6f6f6;
        height: $tableRowHeigth;
        color: #000;
        border: none;
        th {
          background-color: transparent;
        }
        .table-header-cell {
          .table-header-span {
            // line-height: 29px;
            vertical-align: middle;
          }
        }
      }
    }
  }
  .table-check-box {
    text-align: center;
  }
  .table-cell {
    padding: 0 10px;
    line-height: $tableRowHeigth;
    .cell {
      line-height: $tableRowHeigth;
    }
  }

  .span-with-nowrap {
  }
}
</style>
