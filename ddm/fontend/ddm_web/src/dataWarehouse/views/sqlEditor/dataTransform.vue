<template>
    <div class="data-Transform">
        <datablau-dialog
          :visible.sync="dialogVisible"
          title="生成DML"
          width="600px"
          append-to-body
        >
          <div class="content">
            <datablau-input style="display:block" v-model="dml"  type='textarea'></datablau-input>
          </div>
          <span slot="footer">
            <datablau-button type="primary" @click="copyDml">
              复制
            </datablau-button>
          </span>
        </datablau-dialog>
        <div class="transform-cont">
          <!-- 第一步 -->
          <div class="first-step" v-show="stepType ==='1' ">
            <div class="step" style="padding-top:40px">
              <datablau-form size="small" label-width="114px" @submit.native.prevent>
                <el-form-item label="任务名称" required>
                  <datablau-input :themeBlack="true" placeholder="请输入" maxlength="200"  :disabled="editState" style="width:500px" v-model.trim="transformName"></datablau-input>
                </el-form-item>
                <el-form-item label="任务描述">
                  <datablau-input :themeBlack="true"  style="width:500px" type="textarea" v-model.trim="transformDescribe"></datablau-input>
                </el-form-item>
                <el-form-item label="增量任务">
                  <datablau-switch
                      style="display: inline-block"
                      v-model="isIncrease"
                      :themeBlack="true"
                    ></datablau-switch>
                </el-form-item>
              </datablau-form>
            </div>
            <div class="transform-btn">
              <div class="nextStep">
                <datablau-button
                  type="important"
                  :disabled="transformName==='' || (!authPro['PROCEDURE_EDIT'] && !authPro.isAdmin)"
                  @click="nextStep('2')"
                  :themeBlack="true"
                >下一步</datablau-button>
              </div>
            </div>
          </div>
          <!-- 第二步 -->
          <div class="second-step" v-show="stepType === '2'">
            <div class="step">
              <datablau-detail-subtitle :themeBlack="true" title="源数据" mt="14px"></datablau-detail-subtitle>
              <div class="source-data">
                <span class="label">数据源</span>
                <datablau-select
                  style="width:368px;display: inline-block;"
                  filterable
                  clearable
                  class="select-panel"
                  v-model="dataSourceId"
                  placeholder="请选择数据源"
                  isIcon="iconfont icon-shujuyuan iconBlack"
                  @change="getChemaList()"
                  :themeBlack="true"
                >
                  <el-option
                    v-for="(ds,index) in dataSourceList"
                    :key="index"
                    :label="ds.damDsName"
                    :value="ds.damDsId">
                    <div slot="default">
                      <database-type style="display: inline-block" :size="24"
                                    :value="ds.type" hide-label>
                      </database-type>&nbsp;{{ds.damDsName}}
                    </div>
                  </el-option>
                </datablau-select>
                <span class="label">Schema</span>
                <datablau-select
                style="width:368px;display: inline-block;"
                  filterable
                  clearable
                  class="select-panel"
                  isIcon="iconfont icon-schema iconBlack"
                  v-model="schemaName"
                  @change="getSourceTables"
                  :themeBlack="true"
                  placeholder="请选择schema">
                  <el-option
                    v-for="(i,index) in schemaList"
                    :key="index"
                    :label="i"
                    :value="i">
                  </el-option>
                </datablau-select>
                <datablau-tooltip
                  content="刷新数据源"
                  placement="bottom"
                  effect="dark"
                >
                  <datablau-button   class="icon-refresh iconfont" :disabled="!dataSourceId || !schemaName" style="display: inline-block;margin-top: 4px;" type="icon" @click="refreshTableForm('from')" ></datablau-button>
                </datablau-tooltip>
                <div style="margin:16px 0px">
                  <span class="label">表范围</span>
                  <datablau-radio
                    v-model="tableTypes"
                    @change="tableTypesChange"
                    style="margin-bottom: 10px;display: inline-block"
                    :disabled="dataSourceId === '' || schemaName === ''"
                    :themeBlack="true"
                  >
                    <el-radio :label="'single'" >单表</el-radio>
                    <el-radio :label="'multiple'" >多表</el-radio>
                  </datablau-radio>
                </div>
                <span class="label" v-if="tableTypes === 'single'">&nbsp;</span>
                <datablau-select
                style="width:368px;display: inline-block;margin-right:12px"
                  filterable
                  clearable
                  class="select-panel"
                  isIcon="iconfont icon-schema iconBlack"
                  v-model="tableName"
                  @change="getColList"
                  remote
                  reserve-keyword
                  :remote-method="remoteTableData"
                  v-if="tableTypes === 'single'"
                  :themeBlack="true"
                  placeholder="请选择源表">
                  <el-option
                    v-for="i in tableData"
                    :key="i"
                    :label="i"
                    :value="i">
                  </el-option>
                </datablau-select>
                <datablau-button :themeBlack="true" v-show="dataSourceId !== '' && tableName !== '' && schemaName !== '' && tableTypes === 'single'" type="important"  @click="dataExploration">数据预览</datablau-button>
                <div v-if="dataExplorationVisible && tableTypes === 'single'" style="position: absolute;
                  top: 222px;
                  left: 120px;
                  right: 0;
                  bottom: 30px;">
                  <datablau-table :themeBlack="true" :themeBlackHeader="true" :data="dataExplorationData" height="100%" v-show="dataExplorationColumn && dataExplorationColumn.length">
                    <el-table-column
                        v-for="item in dataExplorationColumn"
                        :label="item"
                        :key="item"
                        :prop="item"
                        :formatter="jsonFormatter"
                        :min-width="120"
                        show-overflow-tooltip
                    >
                      <div slot="header">
                        <datablau-tooltip
                            :content="item"
                            placement="top-start"
                        >
                          <span class="show-tooltip-header">
                            {{ item }}
                          </span>
                        </datablau-tooltip>
                      </div>
                      <template slot-scope="scope">
                        {{ scopeJsonFormatter(scope) }}
                      </template>
                    </el-table-column>
                  </datablau-table>
                  <div class="no-data" v-if="(!dataExplorationColumn || !dataExplorationColumn.length)">
                    <div class="center-content">
                      <datablau-icon :data-type="'no-result'" icon-type="svg" :size="20"></datablau-icon>
                    </div>
                  </div>
                </div>
                <div v-if="tableTypes === 'multiple'">
                  <div style="padding-left: 118px;position: absolute;    left: 0px;right: 8px;bottom: 0;top: 154px;">
                    <datablau-checkbox  :themeBlack="true" :checkboxType="'single'" v-model="allTablesChecked" style="border-bottom: 1px solid #3D3D3D;padding-bottom: 16px;">
                      <datablau-icon style="vertical-align: text-top;margin-right:1px" :data-type="'table'" icon-type="svg" :size="14" ></datablau-icon> 所有表
                    </datablau-checkbox>
                    <div v-selectLazyLoad="lazyloadingMultiple" style="position: absolute;left: 80px;
    right: 0;
    bottom: 0;
    top: 42px;
                    overflow: auto;
                    ">
                      <datablau-tree
                        :data="tableDataMultiple"
                        node-key="name"
                        ref="tableDataMultiple"
                        :default-expanded-keys="expandKeys"
                        :expand-on-click-node="false"
                        :props="defaultProps"
                        :data-supervise="false"
                        :show-checkbox="!allTablesChecked"
                        :data-icon-function="dataIconFunction"
                        :render-content="renderContent"
                        @check-change="tableDataMultipleChange"
                        :default-checked-keys="defaultCheckedKeys"
                        :themeBlack="true"
                      ></datablau-tree>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="transform-btn">
              <div class="nextStep">
                <datablau-button
                  type="normal"
                  @click="backStep('1')"
                  :themeBlack="true"
                >上一步</datablau-button>
                <datablau-button
                  type="important"
                  @click="nextStep('3')"
                  :disabled="disabledSecond "
                  :themeBlack="true"
                >下一步</datablau-button>
              </div>
            </div>
          </div>
          <!-- 第三步 -->
          <div class="third-step" v-show="stepType === '3'">
            <div class="step">
              <datablau-detail-subtitle :themeBlack="true" title="目标定义" mt="14px"></datablau-detail-subtitle>
              <div class="selectType">
                <span class="label">范围设定</span>
                <datablau-radio
                  v-model="selectType"
                  @change="selectTypeChange"
                  :themeBlack="true"
                >
                  <el-radio :label="1" >已有目标表</el-radio>
                  <el-radio :label="2" >根据源表自动生成目标表</el-radio>
                </datablau-radio>
              </div>
              <div style="margin-top:24px" v-if="selectType === 1">
                <span class="label">清空目标记录</span>
                <datablau-switch
                style="display: inline-block"
                  v-model="clearTargetRecord"
                  :themeBlack="true"
                ></datablau-switch>
                <!-- <datablau-checkbox  v-if="selectType === 1" :themeBlack="true"  :checkboxType="'single'" v-model="clearTargetRecord" :disabled="selectType===2">
                    清空目标记录
                </datablau-checkbox> -->
              </div>
              <div class="tableNaming" v-if="selectType !== 1" style="margin-top:16px">
                <span class="label">目标表命名前缀</span>
                <datablau-input style="width:368px"  :themeBlack="true" placeholder="前缀：ODS_" clearable v-model="prefixValue"></datablau-input>
                <span class="label">目标表命名后缀</span>
                <datablau-input  style="width:368px" :themeBlack="true" placeholder="后缀：_ODS" clearable v-model="suffixValue"></datablau-input>
              </div>
              <div v-if="targetSpliterShow" style="margin-top: 10px;">
                <span style="color:#bbb"><i style="color: #F56C6C;margin-right: 4px;">*</i>目标表分隔符：</span>
                  <datablau-input
                    v-model.trim="targetSpliter"
                    :themeBlack="true"
                    placeholder=""
                    style="width :300px"></datablau-input>
              </div>
              <div class="target-data" >
              <datablau-detail-subtitle :themeBlack="true" title="目标数据" mt="14px"></datablau-detail-subtitle>
                <div>
                  <span class="label">数据源</span>
                  <datablau-select
                    style="width:368px;display: inline-block"
                    filterable
                    clearable
                    class="select-panel"
                    v-model="dataSourceId2"
                    placeholder="请选择数据源"
                    isIcon="iconfont icon-shujuyuan iconBlack"
                    @change="getChemaList2()"
                    :themeBlack="true"
                  >
                    <el-option
                      v-for="(ds,index) in dataSourceList"
                      :key="index"
                      :label="ds.damDsName"
                      :value="ds.damDsId">
                      <div slot="default">
                        <database-type style="display: inline-block" :size="24"
                                      :value="ds.type" hide-label>
                        </database-type> {{ds.damDsName}}
                      </div>
                    </el-option>
                  </datablau-select>
                  <span class="label">数据源</span>
                  <datablau-select
                  style="width:368px;display: inline-block;"
                    filterable
                    clearable
                    class="select-panel"
                    isIcon="iconfont icon-schema iconBlack"
                    v-model="schemaName2"
                    @change="getSourceTables2"
                    :themeBlack="true"

                    placeholder="请选择schema">
                    <el-option
                      v-for="i in schemaList2"
                      :key="i"
                      :label="i"
                      :value="i">
                    </el-option>
                  </datablau-select>
                  <datablau-tooltip
                    content="刷新数据源"
                    placement="bottom"
                    effect="dark"
                  >
                    <datablau-button class="icon-refresh iconfont" :disabled="!dataSourceId2 || !schemaName2" style="display: inline-block;margin-top: 4px;margin-left:8px" type="icon" @click="refreshTableForm('to')" ></datablau-button>
                  </datablau-tooltip>
                  <div>
                    <span class="label" v-if="tableTypes === 'single' && selectType === 1 ">目标表</span>
                    <datablau-select
                    style="width:368px;display: inline-block"
                      filterable
                      clearable
                      class="select-panel"
                      isIcon="iconfont icon-schema iconBlack"
                      v-model="tableName2"
                      placeholder="请选择目标表"
                      @change="getColList2"
                      remote
                      reserve-keyword
                      :remote-method="remoteTableData2"
                      v-if="tableTypes === 'single' && selectType === 1 "
                      @clear="tableName2Clear"
                      :themeBlack="true"
                      >
                      <el-option
                        v-for="i in tableData2"
                        :key="i"
                        :label="i"
                        :value="i">
                      </el-option>
                    </datablau-select>
                  </div>
                </div>
              </div>
              <div class="addField"
              style="position: absolute;
                  top: 230px;
                  left: 0;
                  right: 0;
                  bottom: 0;
              " v-if="selectType === 2" :style="{top:targetSpliterShow === true ? '260px':'230px'}">
                <span class="label">目标表增加字段</span>
                <datablau-button
                  type="normal"
                  style="margin:10px 0;display: inline-block;width:100px"
                  @click="addColumnNew"
                  :themeBlack="true"
                ><i class="iconfont icon-tianjia" style="margin-right:4px;vertical-align: text-bottom;"></i>添加字段</datablau-button>

                <div style="position: absolute;left: 118px;
                  right: 0;
                  bottom: 0;
                  top: 65px;">
                  <datablau-table
                      :data="tableDataCol"
                      height="100%"
                      ref="tableDetailList"
                      @cell-mouse-enter="handleCellMouseEnter"
                      @keydown.native="onKeyPress"
                      :themeBlack="true"
                    >
                      <el-table-column fixed label="#" width="30">
                        <template slot-scope="scope">{{scope.$index+1}}</template>
                      </el-table-column>
                      <el-table-column
                        fixed
                        label="中文名称"
                        prop="cnName"
                        :min-width="150"
                      >
                        <template slot-scope="scope">
                          <datablau-input :themeBlack="true"  clearable v-model="scope.row.cnName"></datablau-input>
                        </template>
                      </el-table-column>
                      <el-table-column
                      fixed
                      label="字段名称"
                      prop="name"
                      :min-width="150"
                    >
                      <template slot="header" slot-scope="scope">
                        <span :data="scope.$index" class="table-label required">字段名称</span>
                      </template>
                      <template slot-scope="scope">
                        <el-form
                          size="mini"
                          :themeBlack="true"
                          :ref='`name-form${scope.$index}`'
                          @submit.native.prevent
                          :model="tableDataCol[scope.$index]">
                          <el-form-item
                            style="height:31px;margin-bottom:1px;"
                            prop="name"
                            :rules="rules.columnName"
                          >
                            <datablau-input
                              size="mini"
                              :themeBlack="true"
                              @keydown.native="updateColumnsMapOfIndexEditor(tableDataCol[scope.$index])"
                              v-model="tableDataCol[scope.$index].name"
                              @change="clearLimitedDomain(limitedDsApply && limitedDsApplyConfig.rColName && !!scope.row.domainId ,scope)"
                            ></datablau-input>
                          </el-form-item>
                        </el-form>
                      </template>
                      </el-table-column>
                      <el-table-column
                        label="数据类型"
                        prop="dataType"
                        :min-width="160"
                        class-name="data-type"
                      >
                        <template slot="header">
                          <span class="table-label required" >数据类型</span>
                        </template>
                        <template slot-scope="scope">
                          <el-form
                            size="mini"
                            :themeBlack="true"
                            @submit.native.prevent
                            :model="tableDataCol[scope.$index]">
                            <el-form-item
                              style="height:29px;margin-bottom:1px;"
                              :rules="rules.dataType"
                            >
                              <el-autocomplete
                              class="dataTypeAutocomplete"
                                size="mini"
                                @focus="onFocus(scope.$index)"
                                @input="onInput"
                                @select="onSelect"
                                clearable
                                v-model="tableDataCol[scope.$index].dataType"
                                :fetch-suggestions="queryDataType"
                                popper-class="dataTypeAutocompleteBlack"
                              >
                                <template slot-scope="{ item }">
                                  <div @click.stop v-if="item.type" style="cursor:initial;color:#aaaaaa;margin-left: -20px;width: 138px;padding-left: 20px;">{{item.value}}</div>
                                  <span v-else style="margin-left:2em;">{{item.value}}</span>
                                </template>
                              </el-autocomplete>
                            </el-form-item>
                          </el-form>
                        </template>
                      </el-table-column>
                      <el-table-column
                        label="默认值"
                        prop="value"
                        :min-width="150"
                      >
                      <template slot="header" slot-scope="scope">
                        <span :data="scope.$index" class="table-label required">默认值
                          <datablau-tips class="settingIcon" :effect=" $route.path.indexOf('sql_editor') !== -1?'light':'dark'"
                              content="默认值设置需要满足目标数据库规范。<br>
        目标是Oracle库示例：<br>
        1、字符默认值：'ABCD'<br>
        2、数值默认值：1234<br>
        3、函数默认值：SYSDATE<br>
        4. 日期默认值：'yyyy-MM-dd'" icon="icon-tips" style="display:inline-block;margin-left:8px;color:#999"></datablau-tips>
                        </span>
                      </template>
                        <template slot-scope="scope">
                          <datablau-input :themeBlack="true" clearable v-model="scope.row.value"></datablau-input>
                        </template>
                      </el-table-column>
                      <el-table-column
                        :label="$store.state.$v.dataEntity.Operation"
                        :width="80"
                      >
                        <template slot-scope="scope">

                          <datablau-button
                              type="text"
                              @click.stop="deleteRow(scope.row, scope.$index)"
                              style="position: relative;
                                      right: 4px;"
                            >
                            <i class="iconfont icon-delete"></i>
                          </datablau-button>
                        </template>
                      </el-table-column>
                    </datablau-table>
                </div>

              </div>
            </div>

            <div class="transform-btn">
              <div class="nextStep">
                <datablau-button
                  type="normal"
                  @click="backStep('2')"
                  :themeBlack="true"
                >上一步</datablau-button>
                <datablau-button
                  type="important"
                  @click="nextStep('4')"
                  :disabled="disabledThird"
                  :themeBlack="true"
                >
                下一步
              </datablau-button>
              </div>
            </div>
          </div>
          <!-- 第四步 条件过滤 Conditional filtering -->
          <div class="fourth-step" v-show="stepType === '4'">
            <div class="step">
              <div class="rowLevel">
              <datablau-detail-subtitle :themeBlack="true" title="行级限制" mt="14px"></datablau-detail-subtitle>
                <datablau-radio :themeBlack="true" style="" v-model="rowLevelValue"  @change="rowLevelChange">
                  <el-radio style="" :label="1">所有记录</el-radio>
                  <el-radio style="" :label="2">
                    同步前
                    <datablau-input :themeBlack="true" style="width: 80px;margin: 0 4px;" v-model="rowNumber" clearable></datablau-input>
                    条记录
                  </el-radio>
                </datablau-radio>
              </div>
              <div class="data-filter">
              <datablau-detail-subtitle :themeBlack="true" title="数据过滤" mt="14px"></datablau-detail-subtitle>
              <div>
                <datablau-button
                  type="important"
                  @click="newCondition"
                  :themeBlack="true"
                ><i class="iconfont icon-tianjia" style="margin-right:4px;vertical-align: text-bottom;"></i>新建条件</datablau-button>
              </div>
              </div>
              <div class="filter-table">
                <datablau-table
                    :data="filterTableData"
                    height="100%"
                    :themeBlack="true"
                  >
                    <el-table-column
                      label="表名"
                      prop="tableName"
                      width="200"
                    >
                    <template slot-scope="scope">
                      <datablau-select
                          style="width:180px"
                          v-model="scope.row.tableName"
                          clearable
                          filterable
                          @change="filterNameChange(scope.row,scope.$index)"
                          :themeBlack="true"
                      >
                          <el-option
                          v-for="item in filterDataForm.tableData"
                          :key="item.name"
                          :label="item.name"
                          :value="item.name"
                          ></el-option>
                      </datablau-select>
                    </template>
                    </el-table-column>
                    <el-table-column
                      label="条件"
                      prop="conditionSql"
                      width="500"
                    >
                    <template slot="header" slot-scope="scope">
                <span :data="scope.$index" class="table-label required">默认值
                  <datablau-tips class="settingIcon" :effect=" $route.path.indexOf('sql_editor') !== -1?'light':'dark'"
                      content="条件设置符合源数据库标准。<br>例如源是ORACLE 条件：timestamp > SYSDATE()" icon="icon-tips" style="display:inline-block;margin-left:8px;color:#999"></datablau-tips>
                </span>
              </template>
                    <template slot-scope="scope">
                      <datablau-select
                        style="width:180px;display: inline-block;"
                            v-model="scope.row.field"
                            clearable
                            filterable
                            :themeBlack="true"
                        >
                            <el-option
                            v-for="item in scope.row.fieldOption"
                            :key="item.name"
                            :label="item.name"
                            :value="item.name"
                            ></el-option>
                      </datablau-select>
                      <datablau-select
                      style="width:100px;display: inline-block;"
                          v-model="scope.row.condition"
                          clearable
                          filterable
                          allow-create
                          :themeBlack="true"
                      >
                          <el-option
                          v-for="item in conditionOption"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value"
                          ></el-option>
                      </datablau-select>
                      <datablau-input :themeBlack="true" style="width:180px;display: inline-block;" v-model="scope.row.conditionNum" clearable></datablau-input>
                    </template>
                    </el-table-column>
                    <el-table-column
                      :label="$store.state.$v.dataEntity.Operation"
                      fixed="right"
                    >
                      <template slot-scope="scope">
                        <datablau-button
                            type="text"
                            @click.stop="deleteCondition(scope.row, scope.$index)"
                            style="position: relative;
                                    right: 4px;"
                          >
                          <i class="iconfont icon-delete"></i>
                        </datablau-button>
                      </template>
                    </el-table-column>
                </datablau-table>
              </div>
            </div>
            <div class="transform-btn">
              <div class="nextStep">
                <datablau-button
                  type="normal"
                  @click="backStep('3')"
                  :themeBlack="true"
                >上一步</datablau-button>
                <datablau-button
                  type="important"
                  @click="nextStep('5')"
                  :disabled="disabledFifth"
                  class="creatDdlIcon"
                  :themeBlack="true"
                >
                下一步
                </datablau-button>
              </div>
            </div>
          </div>
        </div>

    </div>
</template>
<script>
import dataTransform from './dataTransform.js'

export default dataTransform
</script>
<style lang="scss">
.iconBlack{
  color: #BBBBBB;
}
.dataTypeAutocomplete{
  .el-input--mini .el-input__inner{
    height: 30px;
    line-height: 30px;
    border-radius: 2px;
    background-color: transparent;
    border: 1px solid #4D4D4D;
    color: #c6c6c6;
  }
}
.dataTypeAutocompleteBlack{
  background-color: #2A2A2A;
  border: 1px solid #333333;
  .popper__arrow::after{
    border-bottom-color: #2A2A2A !important;
    border-top-color: #2A2A2A !important;
  }
  .popper__arrow {
    border-bottom-color: #2A2A2A !important;
    border-top-color: #2A2A2A !important;
    }
  li{
    color: #bbb;
  }
  li:hover{
    background-color:rgba(24, 127, 255, .2);
    color: #bbb;
  }
}
</style>
<style lang="scss" scoped>
.no-data, .table-outer {
  position: absolute;
  left: 20px;
  top: 32px;
  bottom: 0;
  right: 20px;

  .center-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
.transform-cont{
  position: absolute;
  top: 74px;
  bottom: 0px;
  left: 0px;
  right: 0px;
  overflow: auto;
  // .first-step{
    .step{
      position: absolute;
      top: 0px;
      bottom: 50px;
      left: 20px;
      right: 20px;
      overflow: auto;
    }
  // }
  .second-step{
    .source-data {
      // display: inline-block;
      .label{
        display: inline-block;
        width: 110px;
        color: #bbbbbb !important;
        text-align: right;
        margin-right: 8px;
      }
    }
  }
  .third-step{
    .label{
        display: inline-block;
        width: 110px;
        color: #bbbbbb !important;
        text-align: right;
        margin-right: 8px;
      }
    .selectType{
      display: flex;
      align-items: flex-start;
    }
    .target-data {
      display: inline-block;
      margin-top: 20px;
      // .label{
      //   margin-bottom: 10px;
      //   display: block;
      // }
    }
    .addField{
      margin-top: 20px;
    }
  }
  .fourth-step{
    .filter-table{
      position: absolute;top:177px;bottom: 0px;left: 0px;right: 0px;
    }
  }
}
.transform-btn{
  position: absolute;
  bottom: 0px;
  left: 0px;
  height: 50px;
  right: 0;
  box-shadow: 0px -5px 14px -8px rgba(0, 0, 0, 0.2);
    padding: 8px 20px;
    border-top: 1px solid #3D3D3D;
}
#container{
    width: 622px;
    // height: 1000px;
    padding: 20px;
    position: relative; /*一定加上这句，否则连线位置发生错乱*/
  }

  .left{
    float: left;
    width: 150px;
  }
  .right{
    float: right;
    width: 150px;
  }

  .left li,.right li{
    width: 100%;
    border-radius: 4px;
    border: 1px solid #1e90ff;
    background: #70a1ff;
    margin-bottom: 20px;
    padding: 0px 5px;
    text-align: center;
    color: white;
    cursor: pointer;

    font-size: 12px;
    div{
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
.select-panel{
  margin-bottom: 8px;
}
.creatDdlIcon{
  i {
      animation: loading-rotate 2s linear infinite;
      font-size: 12px;
      position: absolute;
      left: 5px;
      top: 5px;
    }
}
/deep/.el-input__inner::placeholder{
  color: #888888;
}
/deep/.el-input.is-disabled .el-input__inner{
  color: #AFB1B4;
}
    .data-Transform {
        // position: relative;
        // height: 100%;
        .part-first{
          padding: 100px 100px;
        }
        .tool {
            .label {
                margin-right: 10px;
                font-size: 12px;
            }
            // height: 40px;
            .datablau-select {
                margin-right: 10px;
                width: 180px;
                display: block;
            }
            .source-data {
              display: inline-block;
              .label{
                margin-bottom: 10px;
                display: block;
              }
            }
            .target-data{
              display: inline-block;
              vertical-align: top;
              margin-left: 250px;
              .label{
                margin-bottom: 10px;
                display: block;
              }
            }
        }
        .scripddl{
          position: relative;
          height: 500px;
        }
    }
    #graph {
        // position: absolute;
        top: 174px;
        left: 0;
        right: 0;
        bottom: 44px;
        height: 1000px;
        border: 1px solid #646464;
    }
.table-label {
  position:relative;
  &.required {
    &::before {
      content: '*';
      color: #e86666;
      //position:absolute;
      //left:-8px;
      font-size:13px;
    }
  }
}
</style>
