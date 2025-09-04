<template>
  <div class="create-sql-page">
    <div class="condition-box">
      <div class="data-choose">
        <div class="item-con">
          <div class="select-line">
            <span class="item-title">数据库：</span>
            <el-select
              size="mini"
              v-model="modelName"
              placeholder="请选择表"
              clearable
              filterable
              v-if="false"
              @change="handleTableChange"
            >
              <el-option
                v-for="item in tablesArr"
                :key="item.objectId"
                :label="item.name"
                :value="item.objectId"
              ></el-option>
            </el-select>
            <span v-else class="model-name">{{ modelName }}</span>
            <span class="item-title">表：</span>
            <el-select
              size="mini"
              v-model="currentTableId"
              placeholder="请选择表"
              clearable
              filterable
              @change="handleTableChange"
            >
              <el-option
                v-for="item in tablesArr"
                :key="item.objectId"
                :label="item.name"
                :value="item.objectId"
              ></el-option>
            </el-select>
          </div>
          <div class="middle-con">
            <div class="column-table-box">
              <el-table
                class="column-table"
                ref="columnTable"
                :height="300"
                :data="columnsArr"
                header-cell-class-name="table-header-cell"
                header-row-class-name="table-head-row"
                cell-class-name="table-cell"
                @selection-change="handleSelectionChange"
              >
                <el-table-column
                  type="selection"
                  width="50"
                  header-align="center"
                  class-name="table-check-box"
                ></el-table-column>
                <el-table-column
                  prop="physicalName"
                  label="名称"
                ></el-table-column>
                <el-table-column
                  prop="logicalName"
                  label="中文名称"
                ></el-table-column>
              </el-table>
            </div>
            <div class="select-condition">
              <span class="title-item">筛选条件</span>
              <div class="item-con">
                <div
                  class="input-box"
                  v-for="(item, index) in conditionArr"
                  :key="index"
                >
                  <el-select
                    size="mini"
                    v-model="item.columnName"
                    placeholder="请选择列"
                    clearable
                    filterable
                    class="cond-item"
                  >
                    <el-option
                      v-for="item2 in columnsArr"
                      :key="item2.physicalName"
                      :label="item2.physicalName"
                      :value="item2.physicalName"
                    ></el-option>
                  </el-select>
                  <el-select
                    size="mini"
                    v-model="item.operater"
                    placeholder="请选择模式"
                    clearable
                    filterable
                    class="cond-item"
                  >
                    <el-option
                      v-for="item2 in operaterArr"
                      :key="item2.value"
                      :label="item2.label"
                      :value="item2.value"
                    ></el-option>
                  </el-select>
                  <el-input
                    v-model="item.range"
                    size="mini"
                    placeholder="请输入范围"
                    clearable
                    class="cond-item"
                  ></el-input>
                  <el-button
                    class="add-btn"
                    icon="el-icon-plus"
                    @click="handleAddSQLCondi"
                    v-if="index === conditionArr.length - 1"
                  ></el-button>
                  <el-button
                    class="add-btn"
                    icon="el-icon-minus"
                    @click="handleRemoveSQLCondi(index)"
                    v-else
                  ></el-button>
                </div>
                <div class="single-condition-item" v-show="false">
                  <span class="">GROUP BY</span>
                  <el-select
                    size="mini"
                    v-model="groupByColunm"
                    placeholder="请选择列"
                    clearable
                    filterable
                    multiple
                    class="group-by-col"
                  >
                    <el-option
                      v-for="item2 in columnsArr"
                      :key="item2.physicalName"
                      :label="item2.physicalName"
                      :value="item2.physicalName"
                    ></el-option>
                  </el-select>
                </div>
                <div class="single-condition-item">
                  <span class="">ORDER BY</span>
                  <el-select
                    size="mini"
                    v-model="orderByColunm"
                    placeholder="请选择列"
                    clearable
                    filterable
                  >
                    <el-option
                      v-for="item2 in columnsArr"
                      :key="item2.physicalName"
                      :label="item2.physicalName"
                      :value="item2.physicalName"
                    ></el-option>
                  </el-select>
                  <el-checkbox v-model="orderDesc">降序</el-checkbox>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="sql-line">
        <div class="sql-con">
          <el-input type="textarea" v-model="sqlContent"></el-input>
        </div>
        <div class="bottom-btn-line">
          <el-button @click="handleCreateSql" :disabled="!canCreateSql">
            生成SQL
          </el-button>
          <el-button @click="handleSubmitSql" :disabled="!canSubmitSql">

            {{ $t('common.button.ok') }}

          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import createSql from './createSql.js'
export default createSql
</script>

<style lang="scss">
@import '../../assets/styles/constForDDC.sass';

.create-sql-page {
  min-width: 880px;

  .condition-box {
    .data-choose {
      position: relative;
      width: 100%;

      .no-vDs-info {
        display: inline-block;
        margin-left: 10px;
      }
    }
    .middle-con {
      position: relative;
      width: 100%;
      .column-table-box {
        position: relative;
        display: inline-block;
        width: 48%;
        height: 302px;
        margin: 10px 0;
        border: $greyBorder2;
        .column-table {
        }
      }
      .select-condition {
        position: absolute;
        top: 10px;
        right: 0;
        display: inline-block;
        width: 48%;
        height: 302px;
        border: $greyBorder2;
        padding-left: 4px;
        overflow: auto;
        .item-con {
          .input-box {
            margin-bottom: 5px;
            .cond-item {
              width: 30%;
            }
            .add-btn {
              border: 1px solid #aaa;
              border-radius: 0;
              text-align: center;
              margin: 0;
              padding: 0;
            }
          }
          .single-condition-item {
            margin: 5px 0;
            span {
              margin-right: 10px;
            }
            .group-by-col {
            }
          }
        }
      }
    }
    .sql-line {
      .sql-con {
        margin: 0 0 10px 0;
      }
    }
  }
}
</style>
<style lang="scss">
@import '../../assets/styles/tableStyleWidthBorder.scss';
.create-sql-page {
  .item-title {
    margin-left: 20px;
  }
  input,
  textarea {
    border-radius: 0;
    &:focus {
      outline: none;
      border-color: #dcdfe6;
    }
  }
  @include tableStyle;
  .column-table-box {
    .column-table {
      .colunm-table-head {
        .cell {
          background-color: #f6f6f6;
        }
      }
    }
  }
}
</style>
