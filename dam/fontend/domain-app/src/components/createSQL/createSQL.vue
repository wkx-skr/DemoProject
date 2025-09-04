<template>
  <div>
    <el-dialog
      :title="itemForSQL ? '生成SQL' : '生成正则表达式'"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      custom-class="create-sql-dia"
      append-to-body
    >
      <div class="form-container">
        <el-form
          class="createsql-form"
          label-position="right"
          label-width="100px"
          ref="createSQLForm"
          :rules="rules"
          size="mini"
          :validate-on-rule-change="false"
          v-if="itemForSQL"
        >
          <el-form-item label="规则模板" :rules="[{ required: true }]">
            <el-select
              v-model="SQLmodelType"
              @change="handleSQLModelChange"
              placeholder="请选择"
              clearable
            >
              <el-option value="1" label="数值值域检查"></el-option>
              <el-option value="2" label="唯一性检查"></el-option>
              <el-option value="3" label="空值检查"></el-option>
              <el-option v-if="false" value="4" label="日期格式"></el-option>
              <el-option value="5" label="主外键检查"></el-option>
              <el-option value="6" label="字段长度检查"></el-option>
              <el-option v-if="false" value="7" label="字段类型"></el-option>
              <el-option value="8" label="字符值域检查"></el-option>
            </el-select>
            <!-- <el-tooltip effect="light" content="该项非必选，可用于自动生成sql模板。" placement="right">
            <i class="el-icon-info"></i>
          </el-tooltip> -->
          </el-form-item>
          <el-form-item
            label="所属系统"
            prop="modelCategoryId"
            v-if="modelFromDam"
          >
            <el-select
              v-model="modelCategoryId"
              filterable
              placeholder="请选择所属系统"
              @change="handleCategoryChange"
              clearable
            >
              <el-option
                v-for="item in allCategories"
                :key="item.categoryId"
                :label="
                  item.categoryName + '(' + item.categoryAbbreviation + ')'
                "
                :value="item.categoryId"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="所属模型" v-if="modelFromDam">
            <el-select
              placeholder="请选择模型"
              v-model="modelId"
              @change="handleModelChange"
              clearable
              filterable
            >
              <el-option
                v-for="m in modelsArr"
                :key="m.modelId"
                :value="m.modelId"
                :label="m.definition"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="所属模型" v-else>
            <el-input
              readonly
              placeholder="请点击右侧按纽选择所属模型"
              v-model="modelName"
              clearable
              @clear="handleModelNameClear"
            ></el-input>
            <el-button @click="handleSelectModel">选择模型</el-button>
          </el-form-item>
          <el-form-item
            label="所属表"
            :rules="[{ required: this.requiredMap.table }]"
          >
            <el-select
              :disabled="!showTableSelector"
              @change="handleTableChange"
              v-model="tableId"
              filterable
              placeholder="请选择所属表"
              clearable
              v-if="hasModel && modelFromDam"
              :loading="modelComplete"
              loading-text="加载中"
            >
              <el-option
                v-for="item in tablesArr"
                :key="item.objectId"
                :label="item.physicalName"
                :value="item.objectId"
              ></el-option>
            </el-select>
            <el-select
              :disabled="!showTableSelector"
              @change="handleTableChange"
              v-model="tableId"
              filterable
              placeholder="请选择所属表"
              clearable
              v-else-if="hasModel && !modelFromDam"
              :loading="modelComplete"
              loading-text="加载中"
            >
              <el-option
                v-for="item in tablesArr"
                :key="item.tableId"
                :label="item.physicalName"
                :value="item.tableId"
              ></el-option>
            </el-select>
            <el-input
              v-else
              placeholder="请输入所属表"
              v-model="tableName"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item
            label="所属列"
            :rules="[{ required: this.requiredMap.column }]"
          >
            <el-select
              :disabled="!showColumnSelector"
              v-model="columnId"
              filterable
              @change="handleColumnChange"
              placeholder="请选择所属列"
              clearable
              v-if="hasModel && modelFromDam"
              :loading="columnsComplete"
              loading-text="加载中"
            >
              <el-option
                v-for="item in columnsArr"
                :key="item.objectId"
                :label="item.physicalName"
                :value="item.objectId"
              ></el-option>
            </el-select>
            <el-select
              :disabled="!showColumnSelector"
              v-model="columnId"
              filterable
              @change="handleColumnChange"
              placeholder="请选择所属列"
              clearable
              v-else-if="hasModel && !modelFromDam"
              :loading="columnsComplete"
              loading-text="加载中"
            >
              <el-option
                v-for="item in columnsArr"
                :key="item.columnId"
                :label="item.physicalName"
                :value="item.columnId"
              ></el-option>
            </el-select>
            <el-input
              v-else
              placeholder="请输入所属列"
              v-model="columnName"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item
            label="值域选项"
            v-show="showValueRange"
            :rules="[{ required: true }]"
          >
            <el-select v-model="rangeType" placeholder="请选择" clearable>
              <el-option value="大于">大于</el-option>
              <el-option value="等于">等于</el-option>
              <el-option value="小于">小于</el-option>
              <el-option value="大于等于">大于等于</el-option>
              <el-option value="小于等于">小于等于</el-option>
              <el-option value="区间">区间</el-option>
            </el-select>
            &nbsp;&nbsp;
          </el-form-item>
          <el-form-item
            label="范围"
            v-show="showValueRange"
            :rules="[{ required: true }]"
          >
            <el-input
              v-model.number="rangeValue"
              :placeholder="
                rangeType === '区间' ? '请输入最小值' : '请输入数字'
              "
              :class="{ halfWidth: rangeType === '区间' }"
              clearable
            ></el-input>
            <el-input
              v-model.number="rangeValueMax"
              :placeholder="'请输入最大值'"
              v-if="rangeType === '区间'"
              class="halfWidth"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item
            label="字段长度"
            v-show="showLengthRange"
            :rules="[{ required: true }]"
          >
            <el-input
              v-model.number="lengthValue"
              :placeholder="'请输入数字字段长度'"
            ></el-input>
          </el-form-item>
          <el-form-item
            label="标准代码"
            v-if="showCharRange"
            :rules="[{ required: true }]"
          >
            <el-cascader
              :options="codeDataTree"
              :props="{
                value: 'code',
                label: 'name',
              }"
              v-model="choosedCode"
              placeholder="请选择标准代码"
              clearable
              filterable
              @change="handleCodeChange"
            ></el-cascader>
          </el-form-item>
          <el-form-item
            label="外键关联表"
            :rules="[{ required: this.requiredMap.table2 }]"
            v-if="showPriKey"
          >
            <el-select
              :disabled="!showTableSelector"
              @change="handleTableChange2"
              v-model="tableId2"
              filterable
              placeholder="请选择所属表"
              clearable
              v-if="hasModel && modelFromDam"
            >
              <el-option
                v-for="item in tablesArr"
                :key="item.objectId"
                :label="item.physicalName"
                :value="item.objectId"
              ></el-option>
            </el-select>
            <el-select
              :disabled="!showTableSelector"
              @change="handleTableChange2"
              v-model="tableId2"
              filterable
              placeholder="请选择所属表"
              clearable
              v-else-if="hasModel && !modelFromDam"
            >
              <el-option
                v-for="item in tablesArr"
                :key="item.tableId"
                :label="item.physicalName"
                :value="item.tableId"
              ></el-option>
            </el-select>
            <el-input
              v-else
              placeholder="请输入所属表"
              v-model="tableName2"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item
            label="外键关联列"
            :rules="[{ required: this.requiredMap.column2 }]"
            v-if="showPriKey"
          >
            <el-select
              :disabled="!showColumnSelector"
              v-model="columnId2"
              filterable
              @change="handleColumnChange2"
              placeholder="请选择所属列"
              clearable
              v-if="hasModel && modelFromDam"
            >
              <el-option
                v-for="item in columnsArr2"
                :key="item.objectId"
                :label="item.physicalName"
                :value="item.objectId"
              ></el-option>
            </el-select>
            <el-select
              :disabled="!showColumnSelector"
              v-model="columnId2"
              filterable
              @change="handleColumnChange2"
              placeholder="请选择所属列"
              clearable
              v-else-if="hasModel && !modelFromDam"
            >
              <el-option
                v-for="item in columnsArr2"
                :key="item.columnId"
                :label="item.physicalName"
                :value="item.columnId"
              ></el-option>
            </el-select>
            <el-input
              v-else
              placeholder="请输入所属列"
              v-model="columnName2"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item
            :rules="[{ required: this.requiredMap.dbType }]"
            label="数据库类型"
          >
            <el-select
              v-model="DBtype"
              placeholder="请选择"
              clearable
              filterable
            >
              <el-option label="Oracle" value="ORACLE"></el-option>
              <el-option label="SQL Server" value="SQLSERVER"></el-option>
              <el-option label="MySQL" value="MYSQL"></el-option>
              <el-option label="PostgreSQL" value="POSTGRESQL"></el-option>
              <el-option label="DB2" value="DB2"></el-option>
              <el-option label="GBase" value="GBASE"></el-option>
              <el-option label="Hana" value="HANA"></el-option>
              <el-option label="Hive" value="HIVE"></el-option>
              <el-option label="ODPS" value="ODPS"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button
              size="small"
              type="primary"
              @click="handleCreateSQL"
              :disabled="!canCreate"
            >
              生成SQL
            </el-button>
          </el-form-item>
          <el-form-item
            :label="itemForSQL ? '生成的SQL' : '生成的正则'"
            prop="SQLContent"
          >
            <el-input
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 80 }"
              v-model="SQLContent"
              placeholder="请输入SQL语句"
            ></el-input>
          </el-form-item>
        </el-form>
        <el-form
          class="createsql-form"
          label-position="right"
          label-width="100px"
          ref="createSQLForm"
          :rules="rules"
          size="mini"
          :validate-on-rule-change="false"
          v-else
        >
          <el-form-item label="规则模板">
            <!-- <el-input
            placeholder="请选择"
            value="日期格式"
            clearable
            :disabled="true"
          ></el-input> -->
            <span>日期格式</span>
            <el-tooltip
              effect="dark"
              content="自动生成正则表达式，用于筛选不符合特定格式的日期字符串，如果需要筛选出不符合规则的数据，请选择完全匹配。"
              placement="right"
            >
              <i class="iconfont icon-tips"></i>
            </el-tooltip>
          </el-form-item>
          <el-form-item label="日期格式" :rules="[{ required: true }]">
            <!-- @change="" -->
            <el-select
              v-model="dateType"
              filterable
              placeholder="请选择日期格式"
              clearable
            >
              <el-option
                v-for="(item, index) in dateTypeArr"
                :key="index"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button
              size="small"
              type="primary"
              @click="handleCreateSQL"
              :disabled="!canCreate"
            >
              生成SQL
            </el-button>
          </el-form-item>
          <el-form-item
            :label="itemForSQL ? '生成的SQL' : '生成的正则'"
            prop="SQLContent"
          >
            <el-input
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 80 }"
              v-model="SQLContent"
              placeholder="请输入SQL语句"
            ></el-input>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          size="small"
          @click="handleReturnSQL"
          :disabled="confirmDisabled"
        >
          {{ $t('common.button.ok') }}
        </el-button>
        <el-button size="small" @click="dialogVisible = false">
          {{ $t('common.button.close') }}
        </el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="选择模型"
      :visible.sync="dialog2Visible"
      width="700px"
      append-to-body
    >
      <choose-model
        v-if="dialog2Visible"
        @modelSelected="modelSelected"
      ></choose-model>
    </el-dialog>
  </div>
</template>

<script>
import createSQL from './createSQL.js'
export default createSQL
</script>

<style lang="scss">
.create-sql-dia {
  width: 40%;
  min-width: 550px;
  max-width: 650px;
  .form-container {
    // border: 1px solid red;
    overflow: auto;
    max-height: 600px;
    min-height: 300px;
    .createsql-form {
      .el-input {
        width: 300px;
        &.halfWidth {
          width: 140px;
        }
      }
      .el-textarea {
        width: 90%;
      }
    }
  }
}
</style>
