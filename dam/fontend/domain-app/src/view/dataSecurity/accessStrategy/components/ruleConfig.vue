<template>
  <div class="ruleBox">
    <datablau-form-submit ref="formSubmit">
      <datablau-form
        :model="formContent"
        ref="demoForm"
        :rules="rules"
        :label-width="'130px'"
      >
        <el-form-item prop="actionList" label="数据执行动作">
          <datablau-select
            v-model="formContent.actionList"
            clearable
            :disabled="true"
            class="actionSel"
            multiple
            style="width: 320px; height: 32px"
          >
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item prop="allow" label="数据访问动作">
          <datablau-radio v-model="formContent.allow" class="visitRadio">
            <el-radio :label="true">允许</el-radio>
            <el-radio :label="false">拒绝</el-radio>
          </datablau-radio>
        </el-form-item>
        <el-form-item prop="modelId" label="数据源">
          <datablau-select
            v-model="formContent.modelId"
            clearable
            filterable
            style="width: 320px"
            @change="selectSchema('', 'change')"
            @close="selectSchema('', 'change')"
          >
            <el-option
              v-for="item in dataOriginOpt"
              :key="item.modelId"
              :label="item.definition"
              :value="item.modelId"
            ></el-option>
          </datablau-select>
        </el-form-item>
      </datablau-form>
      <!--schema-->
      <div class="schema">
        <div class="lineBox">
          <datablau-button type="icon" @click="handleClick('schema')">
            <i class="el-icon-arrow-down upDow" v-if="schema"></i>
            <i class="el-icon-arrow-up" v-else></i>
          </datablau-button>
          Schema
        </div>
        <div class="conTab" v-show="schema">
          <datablau-radio
            v-model="formContent.schemaRange"
            @change="schemaRadioChange"
            class="visitRadio"
          >
            <el-radio label="ALL">全部</el-radio>
            <el-radio label="INCLUDE">包含</el-radio>
            <el-radio label="EXCLUDE">不包含</el-radio>
          </datablau-radio>
          <datablau-dropdown
            class="btnAdd"
            trigger="click"
            :hide-on-click="false"
            v-if="formContent.schemaRange != 'ALL'"
          >
            <datablau-button type="text" @click="dropdownClick">
              <i class="iconfont icon-tianjia"></i>
              添加schema
            </datablau-button>
            <el-dropdown-menu slot="dropdown">
              <datablau-checkbox
                v-model="schemaList"
                @change="val => schemaChange(val, true)"
              >
                <el-dropdown-item
                  v-for="(item, k) in schemaItem"
                  :key="item + k"
                >
                  <el-checkbox :label="item"></el-checkbox>
                </el-dropdown-item>
                <el-dropdown-item v-if="schemaItem.length === 0">
                  暂无数据
                </el-dropdown-item>
              </datablau-checkbox>
            </el-dropdown-menu>
          </datablau-dropdown>
          <div class="dataBox">
            <template v-if="schemaList.length > 0">
              <div class="schema-content">
                <el-tag
                  :closable="formContent.schemaRange !== 'ALL'"
                  :class="{ grey: formContent.schemaRange === 'ALL' }"
                  class="tagSch"
                  v-for="v in schemaList"
                  :key="v"
                  @close="tagSchemaClose(v)"
                >
                  <el-tooltip effect="dark" :content="v" placement="top-start">
                    <span>{{ v.length > 12 ? v.substr(0, 12) + '…' : v }}</span>
                  </el-tooltip>
                </el-tag>
              </div>
            </template>
            <template v-if="schemaList.length === 0">
              <div class="nodata">
                <div class="noresult-img">
                  <img src="@/assets/images/search/no-result.svg" alt="" />
                  <p>
                    {{ $t('meta.DS.tableDetail.noData') }}
                  </p>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
      <!--表、视图-->
      <div class="view">
        <div class="lineBox">
          <datablau-button type="icon" @click="handleClick('view')">
            <i class="el-icon-arrow-down upDow" v-if="view"></i>
            <i class="el-icon-arrow-up" v-else></i>
          </datablau-button>
          表/视图
        </div>
        <div class="conTab" v-show="view">
          <datablau-radio
            v-model="formContent.tableRange"
            @change="viewRadioChange"
            class="visitRadio"
          >
            <el-radio label="ALL">全部</el-radio>
            <el-radio label="INCLUDE">包含</el-radio>
            <el-radio label="EXCLUDE">不包含</el-radio>
          </datablau-radio>
          <datablau-button
            type="text"
            class="btnAdd"
            @click="addDataTable"
            v-if="formContent.tableRange != 'ALL'"
          >
            <i class="iconfont icon-tianjia"></i>
            添加表/视图
          </datablau-button>
          <div class="dataBox dropBox" v-if="formContent.tableRange === 'ALL'">
            <div class="drop"><img :src="viewAll" alt="" /></div>
            <p>schema下，全部的数据表/视图</p>
          </div>
          <div class="dataBox height400" v-else>
            <tableCom
              :tableData="curTableList"
              @delectData="
                ary => {
                  delectData(ary, 'viewTagList')
                }
              "
              @dataUpdate="
                obj => {
                  obj.typeId = '80000004'
                  getTableFieldList(obj)
                }
              "
            ></tableCom>
          </div>
        </div>
      </div>
      <!--字段-->
      <div class="field">
        <div class="lineBox">
          <datablau-button type="icon" @click="handleClick('field')">
            <i class="el-icon-arrow-down upDow" v-if="field"></i>
            <i class="el-icon-arrow-up" v-else></i>
          </datablau-button>
          字段
        </div>
        <div class="conTab" v-show="field">
          <datablau-radio
            v-model="formContent.columnRange"
            @change="fieldRadioChange"
            class="visitRadio"
          >
            <el-radio label="ALL">全部</el-radio>
            <el-radio label="INCLUDE">包含</el-radio>
            <el-radio label="EXCLUDE">不包含</el-radio>
          </datablau-radio>
          <datablau-button
            type="text"
            class="btnAdd"
            @click="showFieldLog"
            v-if="formContent.columnRange != 'ALL'"
          >
            <i class="iconfont icon-tianjia"></i>
            添加字段
          </datablau-button>
          <div class="dataBox dropBox" v-if="formContent.columnRange === 'ALL'">
            <div class="drop"><img :src="fieldAll" alt="" /></div>
            <p>
              {{ getCopywriting(formContent.tableRange, 'column') }}
            </p>
          </div>
          <div class="dataBox height400" v-else>
            <tableCom
              :tableData="curFieldList"
              @delectData="
                ary => {
                  delectData(ary, 'fieldTagList')
                }
              "
              @dataUpdate="
                obj => {
                  obj.typeId = '80000005'
                  getTableFieldList(obj)
                }
              "
            ></tableCom>
          </div>
        </div>
      </div>

      <template slot="buttons">
        <div>
          <datablau-button type="normal" @click="prev">上一步</datablau-button>
          <datablau-button type="normal" @click="next">下一步</datablau-button>
          <datablau-button class="cut-apart-btn" type="secondary" @click="back">
            取消
          </datablau-button>
        </div>
      </template>
    </datablau-form-submit>
    <datablau-dialog
      :title="'添加表/视图'"
      width="960px"
      :before-close="close"
      :height="height"
      :table="true"
      v-if="dataSheetLog"
      :visible.sync="dataSheetLog"
    >
      <div class="content">
        <div class="tagBox" ref="selectedItems" v-if="tableTag.length !== 0">
          <span style="color: #409eff; margin-left: 10px">
            已选：{{ tableTag.length }}条数据
          </span>
          <el-tag
            :closable="true"
            v-for="(item, index) in tableTag"
            :key="item.id"
            @close="tagClose(item, index)"
          >
            {{ item.physicalName }}
          </el-tag>
        </div>
        <div class="floatBox">
          <div class="treeBoxLeft">
            <datablau-tree
              v-loading="treeLoading"
              @node-click="handleNodeClick"
              default-expand-all
              node-key="key"
              :props="defaultProps"
              :data="treeData"
              :show-overflow-tooltip="true"
              :data-supervise="true"
              :data-icon-function="dataIconFunction"
              ref="tree"
              empty-text="暂无数据"
            ></datablau-tree>
          </div>
          <div class="right">
            <div class="top-box">
              <datablau-input
                v-model="assetName"
                :iconfont-state="true"
                placeholder="搜索数据表/视图名称"
                style="width: 240px"
                clearable
              ></datablau-input>
              <div class="security-box">
                <span class="lable">安全等级</span>
                <datablau-select
                  style="width: 120px; display: inline-block"
                  v-model="levelId"
                  filterable
                  clearable
                  placeholder="全部 "
                >
                  <el-option
                    v-for="item in levelList"
                    :key="item.tagId"
                    :label="item.name"
                    :value="item.tagId"
                  ></el-option>
                </datablau-select>
              </div>
              <datablau-button
                type="normal"
                style="margin-left: 10px"
                @click="searchFileName"
              >
                搜索
              </datablau-button>
              <template v-if="dataSheetLog">
                <el-checkbox
                  @change="changeTable"
                  v-model="isTable"
                  style="margin-left: 16px"
                >
                  表
                </el-checkbox>
                <el-checkbox @change="changeView" v-model="isView">
                  视图
                </el-checkbox>
              </template>
            </div>

            <div class="tableBox">
              <datablau-table
                height="100%"
                ref="assetsTable"
                class="datablau-table table"
                :data="tableSheet"
                v-loading="tableLodaing"
                :show-column-selection="false"
                :data-selectable="false"
                row-key="id"
                @selection-change="handleSelectionChange"
              >
                <el-table-column
                  type="selection"
                  width="20"
                  :selectable="row => !row.disabled"
                  :reserve-selection="true"
                ></el-table-column>
                <el-table-column
                  prop="physicalName"
                  label="数据资产名称"
                  show-overflow-tooltip
                >
                  <template scope="{row}">
                    <i
                      style="position: relative; margin-right: 5px; top: 2px"
                      :class="['iconfont', 'icon-' + typeIconMap[row.type]]"
                    ></i>
                    {{ row.physicalName
                    }}{{ row.logicalName && `（${row.logicalName}）` }}
                  </template>
                </el-table-column>
                <el-table-column label="技术部门" show-overflow-tooltip>
                  <template slot-scope="scope">
                    {{
                      !$modelCategoriesDetailsMap[scope.row.modelCategoryId]
                        ? '--'
                        : $modelCategoriesDetailsMap[scope.row.modelCategoryId]
                            .itDepartmentName
                    }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="manager"
                  label="数据管家"
                  show-overflow-tooltip
                >
                  <template slot-scope="scope">
                    {{ dealdataManagers(scope.row.dataManagers) }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="tagNames"
                  label="安全等级"
                  show-overflow-tooltip
                >
                  <template slot-scope="scope">
                    {{ getSecurityName(scope.row.tagNames) }}
                  </template>
                </el-table-column>
              </datablau-table>
            </div>
          </div>
        </div>
      </div>
      <template slot="footer">
        <datablau-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[20, 50, 100, 200]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          style="float: left"
        ></datablau-pagination>
        <datablau-button type="secondary" @click="close">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button
          type="important"
          :disabled="!tableTag.length"
          @click="sure('viewTagList')"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
      </template>
    </datablau-dialog>
    <datablau-dialog
      :title="'添加字段'"
      :height="height"
      :before-close="close"
      width="960px"
      :table="true"
      v-if="fieldLog"
      :visible.sync="fieldLog"
    >
      <div class="content">
        <div
          class="tagBox"
          ref="selectedFieldItems"
          v-if="tableTag.length !== 0"
        >
          <span style="color: #409eff; margin-left: 10px">
            已选：{{ tableTag.length }}条数据
          </span>
          <el-tag
            :closable="true"
            ref="selectedField"
            v-for="(item, index) in tableTag"
            :key="item.id"
            @close="tagClose(item, index)"
          >
            {{ item.physicalName }}
          </el-tag>
        </div>
        <div class="floatBox">
          <div class="right" style="width: 100%">
            <div class="searchBox">
              <datablau-input
                v-model="assetName"
                :iconfont-state="true"
                placeholder="搜索字段名称"
                style="width: 200px"
                clearable
              ></datablau-input>
              <datablau-select
                v-model="tableName"
                v-selectLazyLoad="lazyloading"
                :remote-method="tableSelect"
                @clear="clearTable"
                @focus="changeSelectTable"
                clearable
                remote
                filterable
                class="actionSel"
                placeholder="数据表/视图名称"
                style="width: 200px; display: inline-block"
              >
                <el-option
                  v-for="item in tableNameOption"
                  :key="item.objectId"
                  :label="item.objectName || item.physicalName || item.name"
                  :value="item.objectId"
                ></el-option>
                <el-option
                  v-if="selectTableLoading"
                  value=""
                  class="table-option"
                >
                  {{ $t('assets.assetList.loading') }}
                </el-option>
              </datablau-select>
              <div class="security-box">
                <span class="lable" style="margin-left: 0">安全等级</span>
                <datablau-select
                  style="width: 120px; display: inline-block"
                  v-model="levelId"
                  filterable
                  clearable
                  placeholder="全部 "
                >
                  <el-option
                    v-for="item in levelList"
                    :key="item.tagId"
                    :label="item.name"
                    :value="item.tagId"
                  ></el-option>
                </datablau-select>
              </div>
              <datablau-button type="normal" @click="queryClick">
                搜索
              </datablau-button>
            </div>
            <!-- :default-sort="{ prop: 'physicalName', order: sort }" -->
            <datablau-table
              height="100%"
              :data="tableSheet"
              class="datablau-table table"
              ref="assetsField"
              v-loading="filedLodaing"
              :show-column-selection="false"
              :data-selectable="false"
              @selection-change="handleSelectionChange"
              row-key="id"
            >
              <el-table-column
                type="selection"
                width="20"
                :selectable="row => !row.disabled"
                :reserve-selection="true"
              ></el-table-column>
              <el-table-column
                prop="physicalName"
                label="数据资产名称"
                show-overflow-tooltip
              >
                <template scope="{row}">
                  <i
                    style="position: relative; margin-right: 5px; top: 2px"
                    :class="['iconfont', 'icon-' + typeIconMap[row.type]]"
                  ></i>
                  {{ row.physicalName
                  }}{{ row.logicalName && `(${row.logicalName})` }}
                </template>
              </el-table-column>

              <el-table-column
                prop="parentPhysicalName"
                label="所在表/视图"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                prop="schema"
                label="schema"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                prop="branch"
                label="技术部门"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{
                    !$modelCategoriesDetailsMap[scope.row.modelCategoryId]
                      ? '--'
                      : $modelCategoriesDetailsMap[scope.row.modelCategoryId]
                          .itDepartmentName
                  }}
                </template>
              </el-table-column>
              <!-- <el-table-column
                prop="manager"
                label="数据管家"
                show-overflow-tooltip
              ></el-table-column> -->
              <el-table-column
                prop="tagNames"
                label="安全等级"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ getSecurityName(scope.row.tagNames) }}
                </template>
              </el-table-column>
            </datablau-table>
          </div>
        </div>
      </div>
      <template slot="footer">
        <datablau-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[20, 50, 100, 200]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          style="float: left"
        ></datablau-pagination>
        <datablau-button type="secondary" @click="close">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button
          type="important"
          :disabled="!tableTag.length"
          @click="sure('fieldTagList')"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
      </template>
    </datablau-dialog>
  </div>
</template>

<script>
import ruleConfig from './ruleConfig.js'
export default ruleConfig
</script>

<style scoped lang="scss">
.security-box {
  display: inline-block;
  .lable {
    margin-left: 16px;
    margin-right: 8px;
  }
}
.datablau-option {
  .table-option {
    text-align: center;
  }
}
.ruleBox {
}
.table-row {
  // position: absolute;
}
/deep/.visitRadio {
  position: relative;
  top: -1px;
}
/deep/.actionSel input {
  height: 100% !important;
}
.schema,
.view,
.field {
  padding: 0 20px;
}
.view,
.field {
  margin-top: 18px;
}
.lineBox {
  position: relative;
  &:after {
    content: '';
    height: 1px;
    background: #efefef;
    position: absolute;
    top: 15px;
    left: 85px;
    right: 20px;
  }
}
.field .lineBox {
  &:after {
    left: 66px;
  }
}
.is-block.icon {
  color: #999;
}
.conTab {
  padding-left: 108px;
  margin-top: 12px;
  width: 938px;
  position: relative;
}
.toolTip {
  float: left;
  margin-top: -16px;
  position: relative;
  z-index: 11;
  margin-left: 220px;
}
.btnAdd {
  position: absolute;
  top: -3px;
  right: 0;
  i {
    position: relative;
    top: 2px;
  }
}
.dataBox {
  margin-top: 16px;
  border: 1px solid #dddddd;
  border-radius: 2px;
  width: 100%;
  height: 104px;
  position: relative;
  .schema-content {
    height: 100%;
    overflow-y: auto;
  }
  .nodata {
    height: 104px;
    line-height: 104px;
  }
}
/deep/.grey {
  background: #f5f5f5;
  color: #555555;
}
.dropBox {
  height: 120px;
  text-align: center;
  line-height: 86px;
  font-size: 12px;
  .drop {
    display: inline-block;
    width: 64px;
    height: 64px;
    /*background: rgba(64, 158, 255, 0.1);*/
    border-radius: 40px;
    vertical-align: middle;
    margin-right: 24px;
    position: relative;
    /*top: 10px;*/
  }
  span {
    color: #409eff;
  }
  p {
    display: inline-block;
    /*padding-top: 27px;*/
    position: relative;
    top: 13px;
    text-align: left;
    /*line-height: 100px;*/
  }
}
.height400 {
  height: 400px;
}
.field {
  padding-bottom: 30px;
}
/deep/.datablau-checkbox2 .el-checkbox-group {
  max-height: 224px;
  overflow: scroll;
}
.tagSch {
  margin-right: 8px;
  margin-bottom: 8px;
}
.noresult-img {
  text-align: center;

  p {
    display: inline-block;
  }
  img {
    width: 85px;
    margin-right: 10px;
  }
}
.content {
  display: flex;
  flex-direction: column;
  /*position: absolute;*/
  /*top: 10px;*/
  /*bottom: 5px;*/
  .floatBox {
    display: flex;
    flex: 1 1 auto;
    height: 395px;
    overflow: hidden;
  }
  .treeBoxLeft {
    border: 1px solid #ddd;
    width: 200px;
    height: 395px;
    overflow-y: auto;
  }
  .right {
    width: 720px;
    padding: 0 10px;
    display: flex;
    flex-direction: column;
    height: 395px;
    position: relative;
    .top-box {
    }
    .tableBox {
      flex: 1;
      position: absolute;
      top: 32px;
      bottom: 0;
      left: 10px;
      right: 0;
    }
  }
}
.tagBox {
  max-height: 60px;
  overflow-y: scroll;
  margin-bottom: 10px;
  width: 100%;
  flex-shrink: 0;
}

.el-tag {
  margin: 3px 6px;
}
.searchBox {
  & > div {
    float: left;
    margin-right: 20px;
  }
  &:after {
    content: '';
    display: block;
    clear: both;
  }
}
</style>
