<template>
  <div class="boxReview">
    <template v-if="listShow">
      <datablau-list-search
        :noMinWidth="true"
        ref="searchBox"
        @domResize="domResize"
        style="padding: 0 20px"
      >
        <template slot="title">
          <div>{{ $t('reviewAndRelease.title') }}</div>
        </template>
        <div class="search-content" ref="searchContent">
          <datablau-form
            class="add-form"
            :inline="true"
            label-position="right"
            label-width="60px"
            :model="searchForm"
            ref="addForm"
          >
            <el-form-item prop="assetName">
              <datablau-input
                v-model="searchForm.assetName"
                clearable
                :iconfont-state="true"
                :placeholder="$t('reviewAndRelease.searchName')"
                @keyup.native.enter="handleSearch"
                style="width: 140px"
              ></datablau-input>
            </el-form-item>
            <el-form-item
              :label="$t('securityModule.busSystem')"
              prop="categoryId"
            >
              <datablau-select
                v-model="searchForm.categoryId"
                clearable
                filterable
                @change="systemChange"
                style="width: 140px"
              >
                <el-option
                  v-for="item in options"
                  :key="item.categoryName + item.categoryId"
                  :label="item.categoryName"
                  :value="item.categoryId"
                ></el-option>
              </datablau-select>
            </el-form-item>
            <el-form-item
              :label="$t('securityModule.collectName')"
              prop="datasourceId"
            >
              <datablau-select
                v-model="searchForm.datasourceId"
                clearable
                filterable
                @change="gatherChange"
                style="width: 140px"
              >
                <el-option
                  v-for="item in gatherList"
                  :key="item.modelId"
                  :label="item.definition"
                  :value="item.modelId"
                ></el-option>
              </datablau-select>
            </el-form-item>
            <el-form-item
              :label="$t('securityModule.datasource')"
              prop="modelId"
              label-width="50px"
            >
              <datablau-select
                v-model="searchForm.modelId"
                clearable
                filterable
                @change="datasourceIdChange"
                style="width: 140px"
              >
                <el-option
                  v-for="item in dataSourceList"
                  :key="item.definition + item.modelId"
                  :label="item.definition"
                  :value="item.modelId"
                ></el-option>
              </datablau-select>
            </el-form-item>
            <el-form-item :label="'schema'" prop="schema" label-width="50px">
              <datablau-select
                v-model="searchForm.schema"
                clearable
                filterable
                style="width: 150px"
              >
                <el-option
                  v-for="item in schemaList"
                  :key="item"
                  :label="item"
                  :value="item"
                ></el-option>
              </datablau-select>
            </el-form-item>
            <el-form-item
              :label="$t('securityModule.securityLevel')"
              prop="level"
              label-width="70px"
            >
              <datablau-select
                v-model="searchForm.tagId"
                clearable
                filterable
                style="width: 120px"
              >
                <el-option
                  v-for="item in levelList"
                  :key="item.tagId"
                  :label="item.name"
                  :value="item.tagId"
                ></el-option>
              </datablau-select>
            </el-form-item>
            <el-form-item
              :label="$t('reviewAndRelease.inventoryMode')"
              prop="inventoryModel"
            >
              <datablau-select
                v-model="searchForm.inventoryModel"
                clearable
                filterable
                style="width: 120px"
              >
                <el-option
                  v-for="item in inventory"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </datablau-select>
            </el-form-item>
            <el-form-item :label="$t('reviewAndRelease.sortTime')">
              <datablau-dateRange
                v-model="eventStartTime"
                :placeholder="$t('reviewAndRelease.selectTime')"
                :default-time="['00:00:00', '23:59:59']"
                ref="eventStartTime"
              ></datablau-dateRange>
            </el-form-item>
            <el-form-item class="btn">
              <datablau-button type="normal" @click="search">
                {{ $t('securityModule.search') }}
              </datablau-button>
              <datablau-button
                type="secondary"
                class="white-btn"
                @click="revise"
              >
                {{ $t('securityModule.reset') }}
              </datablau-button>
            </el-form-item>
          </datablau-form>
        </div>
      </datablau-list-search>
      <datablau-form-submit
        class="tableRow"
        :style="{ 'margin-top': topH + 'px' }"
      >
        <datablau-table
          height="100%"
          class="elTable"
          ref="deTable"
          :reserve-selection="true"
          :row-key="'id'"
          v-loading="loading"
          :loading="loading"
          :data-selectable="true"
          :show-column-selection="false"
          @sort-change="sortChange"
          :default-sort="{ prop: 'checkTime', order: '' }"
          :data="structureList"
          @selection-change="handleSelectionChange"
        >
          <el-table-column width="28">
            <template slot-scope="scope">
              <datablau-icon
                :data-type="'logicaltable'"
                v-if="scope.row.logical && scope.row.type === 80000004"
                :size="16"
                style="margin-left: 5px; top: 2px"
              ></datablau-icon>
              <datablau-icon
                :data-type="'logicalcolumn'"
                v-else-if="scope.row.logical && scope.row.type === 80000005"
                :size="16"
                style="margin-left: 5px; top: 2px"
              ></datablau-icon>
              <i
                v-else
                style="position: relative; margin-left: 5px; top: 2px"
                :class="['iconfont', 'icon-' + typeIconMap[scope.row.type]]"
              ></i>
            </template>
          </el-table-column>
          <el-table-column
            prop="assetName"
            :min-width="150"
            :label="$t('securityModule.dataAssetsName')"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              {{
                scope.row.alias
                  ? scope.row.assetName + '(' + scope.row.alias + ')'
                  : scope.row.assetName
              }}
            </template>
          </el-table-column>
          <el-table-column
            prop="inventoryModel"
            :label="$t('reviewAndRelease.inventoryMode')"
            show-overflow-tooltip
          >
            <template scope="{row}">
              <span class="inventory" :class="row.inventoryModel.toLowerCase()">
                {{ inventoryModel[row.inventoryModel] }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            prop="categoryName"
            :label="$t('securityModule.busSystem')"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            prop="datasourceName"
            :label="$t('securityModule.collectName')"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            prop="modelName"
            :label="$t('securityModule.datasource')"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            prop="schemaName"
            label="schema"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            prop="tableName"
            :label="$t('reviewAndRelease.table')"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              {{ scope.row.tableName || '--' }}
            </template>
          </el-table-column>
          <el-table-column
            prop="catalogPath"
            :label="$t('securityModule.inSecurityClassify')"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            prop="authStdName"
            :label="$t('reviewAndRelease.infoItem')"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              {{ scope.row.authStdName || '--' }}
            </template>
          </el-table-column>
          <el-table-column
            prop="levelName"
            :label="$t('securityModule.securityLevel')"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            prop="checkUserName"
            :label="$t('reviewAndRelease.sortPeople')"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            prop="checkTime"
            :label="$t('reviewAndRelease.sortTime')"
            sortable="custom"
            width="140"
            show-overflow-tooltip
          ></el-table-column>
        </datablau-table>
        <template slot="buttons">
          <template v-if="selectList.length > 0">
            <btn-tip :num="selectList.length"></btn-tip>
            <datablau-button type="normal" @click="primary">
              {{ $t('reviewAndRelease.pass') }}
            </datablau-button>
            <datablau-button
              type="secondary"
              class="white-btn"
              @click="cancelbtn"
            >
              {{ $t('reviewAndRelease.reject') }}
            </datablau-button>
          </template>
          <datablau-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="pageNo"
            :page-sizes="[20, 50, 100, 200]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            class="left-btn"
          ></datablau-pagination>
        </template>
      </datablau-form-submit>
    </template>
    <datablau-dialog
      :title="$t('securityModule.tip')"
      size="s"
      :visible.sync="safetyShow"
      height="260"
    >
      <div class="title">
        <i class="el-icon-success success-icon"></i>
        {{ $t('securityModule.successNum', { num: successAssets.length }) }}
      </div>
      <div class="title">
        <i class="el-icon-error fail-icon"></i>
        {{ $t('securityModule.failNum', { num: failList.length }) }}
        <div class="copy" v-copy="failList.join('，')">
          {{ $t('securityModule.copy') }}
        </div>
      </div>
      <div class="list">
        {{ failList.join('，') }}，{{ $t('reviewAndRelease.errorTip') }}
      </div>
    </datablau-dialog>
  </div>
</template>

<script>
import main from './main.js'
export default main
</script>

<style scoped lang="scss">
@import '~@/next/components/basic/color.sass';
.tableRow {
  margin-top: 95px;
  background: #fff;
  padding: 0 20px;
  // transition: margin-top 0.6s;
}
.reviewAndBox {
  padding: 0 20px;
}
.boxReview {
  background: #fff;
  height: 100%;
  /deep/ .el-form {
    .el-form-item {
      .el-form-item__label {
        margin-top: 0;
      }
    }
  }
}
.left-btn {
  float: right;
}
/deep/ {
  .row-content > div {
    height: 100%;
  }
}
.tile {
  font-size: 16px;
  vertical-align: middle;
  font-weight: 600;
  height: 44px;
  /*padding-top: 8px;*/
  line-height: 44px;
  color: #555;
}
.filtersBox {
  display: inline-block;
}
.nextLine {
  margin-top: 43px;
  position: absolute;
  /* top: 50px; */
  left: 21px;
}
.inventory {
  display: inline-block;
  width: 68px;
  height: 22px;
  border-radius: 2px;
  text-align: center;
  line-height: 22px;
}
.manual_inventory {
  background: rgba(64, 158, 255, 0.1);
  color: #409eff;
}
.data_identification {
  background: rgba(140, 92, 255, 0.1);
  color: #8c5cff;
}
.batch_import {
  background: rgba(67, 193, 202, 0.1);
  color: #43c1ca;
}
.title {
  line-height: 30px;
  color: #555;
  font-weight: 600;
  i {
    color: #ff4b53;
    font-size: 24px;
    vertical-align: middle;
    margin-right: 6px;
    margin-left: 0;
  }
  .success-icon {
    color: #66bf16;
  }
  .copy {
    float: right;
    padding: 5px 10px;
    color: #409eff;
    cursor: pointer;
    font-weight: 400;
    height: 30px;
    line-height: 30px;
  }
}
.list {
  margin-bottom: 6px;
  margin-top: 6px;
  height: 120px;
  padding: 8px 10px;
  box-sizing: border-box;
  background: #f5f5f5;
  color: #555;
  overflow-y: auto;
}
</style>
