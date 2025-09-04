<template>
  <div class="tab-page model-compare-page" v-loading="loading || !schemasReady">
    <el-dialog
      :title="$t('meta.DS.treeSubOperation.selModel')"
      :visible.sync="dialog2Visible"
      width="700px"
      append-to-body
    >
      <choose-model v-if="dialog2Visible" :expandBranch="true"></choose-model>
    </el-dialog>
    <div style="margin-left: 10px; font-size: 16px; font-weight: bold">
      数据源绑定模型
    </div>
    <div
      id="diff-tree-box"
      v-loading="!showTree"
      :style="{ visibility: schemasReady }"
      v-show="hasSchemas"
    >
      <div
        class="compare-mapping"
        :class="{ selected: item.id === currentMapping }"
        v-for="item in compareMappings"
        :key="item.id + 'ddmMapVersion:' + ddmMapVersion"
        @click="getHistory(item)"
        v-loading="!getAllModels"
      >
        <!--        <span class="title">schemas</span>-->
        <span>
          {{ item.originPath || '历史数据,暂无此属性' }}
        </span>
        <br />
        <span>分支：</span>
        <span>{{ item.originBranch || '历史数据,暂无此属性' }}</span>
        <br />
        <span>版本：</span>
        <span>{{ item.versionName || '历史数据,暂无此属性' }}</span>

        <datablau-button type="icon" class="delete-btn">
          <i
            style="font-size: 16px; color: red"
            class="el-icon-delete"
            @click="deleteCompareMapping(item, $event)"
          ></i>
        </datablau-button>
        <br />
      </div>
      <div>
        <datablau-button
          v-if="compareMappings.length && currentMapping !== 'add'"
          style="margin-left: 10px"
          type="important"
          @click="addNewMapping"
        >
          <i class="el-icon-plus"></i>
          {{ $t('meta.DS.treeSubOperation.addNew') }}
        </datablau-button>

        <datablau-button
          v-if="hasSchemas"
          :disabled="!couldSave"
          :style="{
            'margin-left':
              compareMappings.length && currentMapping !== 'add' ? '0' : '10px',
            float:
              compareMappings.length && currentMapping !== 'add' ? 'right' : '',
            'margin-top': compareMappings.length ? '' : '14px',
          }"
          type="important"
          @click="saveCompareMapping"
        >
          <i class="iconfont icon-save" style="font-size: 14px"></i>

          {{ $t('meta.DS.treeSubOperation.saveNew') }}
        </datablau-button>
      </div>
    </div>
    <div
      id="diff-content-box"
      :style="{ visibility: schemasReady }"
      :class="{ 'full-horizontal': !hasSchemas }"
    >
      <div class="message">
        <div class="part-title source-name">{{ sourceData.name }}</div>
        <el-form
          class="top-plan-info"
          label-position="right"
          label-width="100px"
          size="small"
          :inline="false"
        >
          <el-form-item label="数据源schema" v-if="hasSchemas">
            <el-select
              v-model="selectedSchemas"
              multiple
              filterable
              :placeholder="$t('meta.common.pleaseSelect')"
              :popper-append-to-body="false"
            >
              <el-option
                v-for="item in schemasOptions"
                :key="item"
                :label="item"
                :value="item"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('meta.DS.treeSubOperation.bindDevModel')">
            <datablau-tag v-if="dsToDdm">{{ dsToDdm }}</datablau-tag>
            <span style="color: #409eff; cursor: pointer" @click="addBind2">
              {{ dsToDdm ? '修改' : '添加' }}
            </span>
          </el-form-item>
          <el-form-item :label="$t('meta.DS.treeSubOperation.modelVersion')">
            <el-select
              v-model="modelVersion"
              v-if="modelVersionData && modelVersionData.length > 0"
              :popper-append-to-body="false"
              @change="changeVersion"
            >
              <el-option
                v-for="item in modelVersionData"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
            <!--当选项没有加载完成或者选项为空, 不能选择-->
            <el-select
              v-model="emptyString"
              v-else
              :popper-append-to-body="false"
            >
              <el-option
                v-for="item in modelVersionData"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
            <!-- <el-checkbox-group v-model="defaultVersion" @change="defaultVersionChange" style="display: inline-block;margin-left: 10px;">
              <el-checkbox label="默认最新版本" name="type"></el-checkbox>
            </el-checkbox-group> -->
          </el-form-item>
          <datablau-tabs v-model="curTab" @tab-click="handleTabChange">
            <el-tab-pane label="模型比较" name="compare"></el-tab-pane>
            <el-tab-pane label="模型同步" name="sync"></el-tab-pane>
            <el-tab-pane label="模型关系" name="relation"></el-tab-pane>
          </datablau-tabs>

          <ul v-if="curTab === 'sync'" style="margin-bottom: 30px">
            <div style="margin-bottom: 10px">
              <span>执行同步</span>
              <datablau-switch
                style="display: inline-block; margin-left: 20px"
                v-model="syncEnable"
              ></datablau-switch>
            </div>
            <div style="display: inline-block; width: 90px">
              {{ $t('meta.DS.treeSubOperation.syncPro') }}
            </div>
            <li>
              <div class="synchronizationStrategy">
                {{ $t('meta.DS.treeSubOperation.syncStrategy') }}
                <i style="cursor: pointer" class="el-icon-question"></i>
                <div class="synchronizationStrategy-tips">
                  <p style="text-align: left">
                    <span style="color: #4386f5">
                      {{ $t('meta.DS.treeSubOperation.DAMISNull') }}：
                    </span>
                    {{ $t('meta.DS.treeSubOperation.DAMISNullDesc') }}
                  </p>
                  <p style="text-align: left">
                    <span style="color: #4386f5">
                      {{ $t('meta.DS.treeSubOperation.DDMNotNull') }}：
                    </span>
                    {{ $t('meta.DS.treeSubOperation.DDMNotNullDesc') }}
                  </p>
                  <p style="text-align: left">
                    <span style="color: #4386f5">
                      {{ $t('meta.DS.treeSubOperation.DDMAllPro') }}：
                    </span>
                    {{ $t('meta.DS.treeSubOperation.DDMAllProDesc') }}
                  </p>
                </div>
              </div>
            </li>
            <li>
              <el-checkbox-group
                @change="defaultVersionChange"
                v-model="defaultVersion"
                style="display: inline-block"
                :style="{ width: $i18n.locale === 'zh' ? '90px' : '170px' }"
              >
                <el-checkbox label="domain" name="type">
                  {{ $t('meta.DS.treeSubOperation.dataStandard') }}
                </el-checkbox>
              </el-checkbox-group>
              <el-select v-model="strategyArr1" :popper-append-to-body="false">
                <el-option
                  :label="$t('meta.DS.treeSubOperation.DAMISNull1')"
                  value="DAM_FIRST"
                ></el-option>
                <el-option
                  :label="$t('meta.DS.treeSubOperation.DDMNotNull1')"
                  value="DDM_FIRST"
                ></el-option>
                <el-option
                  :label="$t('meta.DS.treeSubOperation.DDMAllPro')"
                  value="DDM"
                ></el-option>
              </el-select>
            </li>
            <li style="margin: 10px 0">
              <el-checkbox-group
                @change="defaultVersionChange"
                v-model="defaultVersion"
                style="display: inline-block"
                :style="{ width: $i18n.locale === 'zh' ? '90px' : '170px' }"
              >
                <el-checkbox label="standard" name="type">
                  {{ $t('meta.DS.treeSubOperation.standardCode') }}
                </el-checkbox>
              </el-checkbox-group>
              <el-select v-model="strategyArr5" :popper-append-to-body="false">
                <el-option
                  :label="$t('meta.DS.treeSubOperation.DAMISNull1')"
                  value="DAM_FIRST"
                ></el-option>
                <el-option
                  :label="$t('meta.DS.treeSubOperation.DDMNotNull1')"
                  value="DDM_FIRST"
                ></el-option>
                <el-option
                  :label="$t('meta.DS.treeSubOperation.DDMAllPro')"
                  value="DDM"
                ></el-option>
              </el-select>
            </li>
            <li style="margin: 10px 0">
              <el-checkbox-group
                @change="defaultVersionChange"
                v-model="defaultVersion"
                style="display: inline-block"
                :style="{ width: $i18n.locale === 'zh' ? '90px' : '170px' }"
              >
                <el-checkbox label="aliasName" name="type">
                  {{ $t('meta.DS.treeSubOperation.chineseName') }}
                </el-checkbox>
              </el-checkbox-group>
              <el-select v-model="strategyArr2" :popper-append-to-body="false">
                <el-option
                  :label="$t('meta.DS.treeSubOperation.DAMISNull1')"
                  value="DAM_FIRST"
                ></el-option>
                <el-option
                  :label="$t('meta.DS.treeSubOperation.DDMNotNull1')"
                  value="DDM_FIRST"
                ></el-option>
                <el-option
                  :label="$t('meta.DS.treeSubOperation.DDMAllPro')"
                  value="DDM"
                ></el-option>
              </el-select>
            </li>
            <li style="margin: 10px 0">
              <el-checkbox-group
                @change="defaultVersionChange"
                v-model="defaultVersion"
                style="display: inline-block"
                :style="{ width: $i18n.locale === 'zh' ? '90px' : '170px' }"
              >
                <el-checkbox label="definition" name="type">
                  {{ $t('meta.DS.treeSubOperation.descInfo') }}
                </el-checkbox>
              </el-checkbox-group>
              <el-select v-model="strategyArr4" :popper-append-to-body="false">
                <el-option
                  :label="$t('meta.DS.treeSubOperation.DAMISNull1')"
                  value="DAM_FIRST"
                ></el-option>
                <el-option
                  :label="$t('meta.DS.treeSubOperation.DDMNotNull1')"
                  value="DDM_FIRST"
                ></el-option>
                <el-option
                  :label="$t('meta.DS.treeSubOperation.DDMAllPro')"
                  value="DDM"
                ></el-option>
              </el-select>
            </li>
            <li>
              <el-checkbox-group
                @change="defaultVersionChange"
                v-model="defaultVersion"
                style="display: inline-block"
                :style="{ width: $i18n.locale === 'zh' ? '90px' : '170px' }"
              >
                <el-checkbox label="udp" name="type">
                  {{ $t('meta.DS.treeSubOperation.customPro') }}
                </el-checkbox>
              </el-checkbox-group>
              <el-select v-model="strategyArr3" :popper-append-to-body="false">
                <el-option
                  :label="$t('meta.DS.treeSubOperation.DAMISNull1')"
                  value="DAM_FIRST"
                ></el-option>
                <el-option
                  :label="$t('meta.DS.treeSubOperation.DDMNotNull1')"
                  value="DDM_FIRST"
                ></el-option>
                <el-option
                  :label="$t('meta.DS.treeSubOperation.DDMAllPro')"
                  value="DDM"
                ></el-option>
              </el-select>
              <el-checkbox
                style="margin-left: 10px"
                v-model="udpSyncStrategyArr"
                :disabled="defaultVersionUdp"
              >
                {{ $t('meta.DS.treeSubOperation.createUdpForMetadata') }}
              </el-checkbox>
            </li>
          </ul>
        </el-form>
      </div>
      <div class="preview">
        <div v-if="curTab === 'compare'" style="margin-bottom: 10px">
          <span>执行比较</span>
          <datablau-switch
            style="display: inline-block; margin-left: 20px"
            v-model="compareEnable"
          ></datablau-switch>
        </div>
        <div v-if="curTab === 'relation'" style="margin-bottom: 10px">
          <span>执行关联</span>
          <datablau-switch
            style="display: inline-block; margin-left: 20px"
            v-model="lineageEnable"
          ></datablau-switch>
          <span style="vertical-align: middle">
            <i class="iconfont icon-tips">
              执行关联模型关系后，建模人执行关联员可以在模型中查看实体、属性与元数据的血缘关系
            </i>
          </span>
        </div>
        <div class="sub-title part-title" v-if="curTab !== 'relation'">
          {{
            curTab === 'sync'
              ? '同步结果'
              : curTab === 'compare'
              ? '比较结果'
              : ''
          }}
        </div>
        <el-form class="report-des" label-position="right" size="small">
          <el-form-item
            :label="$t('meta.DS.treeSubOperation.exeTime')"
            v-if="curTab === 'sync'"
          >
            <el-select
              v-model="syncTime"
              value-key="time"
              @change="getDataSync"
              filterable
              :placeholder="$t('meta.DS.treeSubOperation.selcompareTime')"
              :popper-append-to-body="false"
            >
              <el-option
                v-for="h in syncTimeArr"
                :key="h.lable"
                :value="h.value"
                :label="h.lable"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="curTab === 'sync'">
            <div class="count-table-container">
              <el-table
                :data="syncDataTable"
                class="plain-table diff-count-table"
                ref="multipleTable"
                border
                :cell-class-name="getCountCellClass"
              >
                <el-table-column
                  align="center"
                  header-align="center"
                  prop="type"
                  :label="$t('meta.DS.treeSubOperation.pro')"
                ></el-table-column>
                <el-table-column
                  align="center"
                  header-align="center"
                  prop="column"
                  :label="$t('meta.DS.treeSubOperation.syncNum')"
                ></el-table-column>
              </el-table>
            </div>
          </el-form-item>
          <!-- <el-form-item>
            {{diffCountTable}}
            <el-table :data="[{name:'表',added:result.table.added,modified:result.table.modified,removed:result.table.removed},
            {name:'字段',added:result.column.added,modified:result.column.modified,removed:result.column.removed},
            {name:'索引',added:result.index.added,modified:result.index.modified,removed:result.index.removed},
            {name:'视图',added:result.view.added,modified:result.view.modified,removed:result.view.removed},
          ]" class="plain-table" ref="multipleTable" :stripe="true" border>
              <el-table-column prop="name" label="类型"></el-table-column>
              <el-table-column prop="added" label="仅数据源包含"></el-table-column>
              <el-table-column prop="modified" label="均包含"></el-table-column>
              <el-table-column prop="removed" label="仅模型包含"></el-table-column>
            </el-table>
          </el-form-item> -->
          <el-form-item
            :label="$t('meta.DS.treeSubOperation.exeTime')"
            v-if="curTab === 'compare'"
          >
            <el-select
              v-model="time"
              value-key="time"
              @change="getData"
              filterable
              :placeholder="$t('meta.DS.treeSubOperation.selcompareTime')"
              :popper-append-to-body="false"
            >
              <el-option
                v-for="h in histories"
                :key="h.time"
                :value="h"
                :label="h.time"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="curTab === 'compare'">
            <div class="count-table-container">
              <el-table
                :data="diffCountTable"
                class="plain-table diff-count-table"
                ref="multipleTable"
                border
                :cell-class-name="getCountCellClass"
              >
                <el-table-column
                  :width="$i18n.local === 'zh' ? '' : 220"
                  align="center"
                  header-align="center"
                  prop="type"
                ></el-table-column>
                <el-table-column
                  align="center"
                  header-align="center"
                  prop="table"
                  :label="$t('meta.DS.treeSubOperation.table')"
                ></el-table-column>
                <el-table-column
                  align="center"
                  header-align="center"
                  prop="column"
                  :label="$t('meta.DS.treeSubOperation.column')"
                ></el-table-column>
                <el-table-column
                  align="center"
                  header-align="center"
                  prop="index"
                  :label="$t('meta.DS.treeSubOperation.index')"
                ></el-table-column>
                <el-table-column
                  align="center"
                  header-align="center"
                  prop="view"
                  :label="$t('meta.DS.treeSubOperation.view')"
                ></el-table-column>
              </el-table>
            </div>
          </el-form-item>
        </el-form>
      </div>
      <report-detail
        v-if="!componentDestroyed && curTab === 'compare'"
        :tableData="tableData"
        :data="nameObj"
        ref="reportDetail"
        :key="componentKey"
      ></report-detail>
      <!-- <report-detail v-if="!componentDestroyed" :data="nameObj" ref="reportDetail"></report-detail> -->
    </div>
  </div>
</template>

<script>
import differenceReport from './differenceReport.js'
export default differenceReport
</script>

<style lang="scss" scoped="scoped">
@import './differenceReport.scss';
@import '@/next/components/basic/color.sass';

$comBtnBlue: #4386f5;
#diff-tree-box {
  position: absolute;
  left: 0;
  width: 200px;
  top: 24px;
  bottom: 0;
}
#diff-content-box {
  position: absolute;
  overflow: auto;
  left: 200px;
  .el-tab-pane {
    padding: 10px 0;
  }

  &.full-horizontal {
    left: 0;
  }
  top: 24px;
  right: 0;
  bottom: 0;
  padding: 10px 20px 20px;
  .part-title {
    font-size: 16px;
    font-weight: bold;
  }
}
.compare-mapping {
  margin: 10px 0 10px 10px;
  // background: #e3f1ff;
  border: 1px solid #aaa;
  border-radius: 2px;
  cursor: pointer;
  position: relative;
  border-left: 3px solid #4386f5;
  .delete-btn {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
  }
  &.selected {
    background: #479eff;
    background-color: #e8f0fe;
    border: 1px solid #fff;
    border-left: 3px solid #4386f5;
  }
  padding: 10px;
  color: #494949;
  .title {
    display: inline-block;
    width: 5em;
    font-weight: bold;
  }
  line-height: 2em;
  &.add-con {
    border: 1px solid #aaa;
  }
}
.model-compare-page {
  top: 8px;
  .el-button.el-button--primary {
    // background-color: $comBtnBlue;
  }
}
</style>

<style lang="scss">
$greyFont: #9499a6;
#diff-content-box {
  .top-plan-info,
  .report-des {
    margin-top: 20px;
    .el-form-item__label {
      color: $greyFont;
    }
    .el-select,
    .el-input {
      width: 300px;
    }
    .setting-compare-modle {
      i {
        font-size: 16px;
        color: #898989;
      }
    }
    .save-plan-line {
      margin-top: 10px;
    }

    .report-result {
      display: inline-block;
      border-left: 3px solid #fff;
      border-left-color: #2b9062;
      height: 30px;
      font-size: 12px;
      line-height: 30px;
      // padding: 0 28px 0 25px;
      font-weight: normal;
      width: 120px;
      text-align: center;
      background: url('~@/assets/images/bg_no_diff.svg') no-repeat -3px 0px / cover;
      color: #fff;
      &.is-diff {
        border-left-color: #b72f1d;
        background: url('~@/assets/images/bg_diff.svg') no-repeat -3px 0px / cover;
      }
    }

    $borderColor: #ddd;

    .count-table-container {
      width: 99%;
      position: relative;
    }
    .diff-count-table {
      $headHeight: 30px;
      border: 1px solid $borderColor;
      thead {
        tr,
        th {
          box-sizing: border-box;
          background-color: #ecedf2;
          padding: 0;
          margin: 0;
          height: $headHeight;
          line-height: $headHeight;
          .cell {
            box-sizing: border-box;
            height: $headHeight;
            line-height: $headHeight;
            margin: 0;
            padding: 0;
          }
        }
        th {
          border-right: 1px solid $borderColor;
        }
      }
      .el-table__header {
        border-bottom: 1px solid $borderColor;
      }
      &.el-table td.count-table-cell {
        padding: 15px 0;
        border-right: 1px solid $borderColor;
        border-bottom: 1px solid $borderColor;
        box-sizing: border-box;
      }
      .el-table__body {
        box-sizing: border-box;
      }
      .count-table-cell.type-column {
        font-weight: bold;
      }
      .diff-data-count.count-not-none {
        background-color: #fff8f2;
      }
    }
  }
}
</style>
