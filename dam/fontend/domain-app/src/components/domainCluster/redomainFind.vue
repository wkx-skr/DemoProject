<template>
  <div
    class="tab-page cluster-result-tab2 tab-page-ver2"
    style="overflow: hidden; top: 20px"
  >
    <column-detail-popover
      v-for="item in columnsPopArr"
      :key="item.id"
      :columnId="item.id"
      :referDom="item.referDom"
      :oldColumnData="item.columnData"
      :boundariesElement="columnPopBoun"
      :showOnce="showOnceMap[item.id]"
    ></column-detail-popover>
    <datablau-filter-row>
      <div class="row-inner ver-middle">
        <datablau-input
          :placeholder="$t('domain.domainCluster.searchDemoData')"
          v-model="keyword"
          :clearable="true"
          class="filter-input"
          :iconfont-state="true"
          style="width: 200px"
        ></datablau-input>
        <datablau-checkbox
          class="filter-input"
          style="margin-left: 20px"
          :checkboxType="'single'"
          v-model="isFullWordOrigin"
          @change="matchTypeChange"
        >
          {{ $t('domain.domainCluster.nameMatchesKeywordExactly') }}
        </datablau-checkbox>
        <span>
          &nbsp;&nbsp; {{ $t('domain.common.chooseSystem') }}: &nbsp;&nbsp;
        </span>
        <datablau-select
          class="filter-input"
          clearable
          v-model="categoryName"
          :placeholder="$t('domain.common.pleaseSelect')"
          @change="changeCategory"
        >
          <el-option
            v-for="(item, index) in categoryNameArr"
            :key="index"
            :label="item"
            :value="item"
          ></el-option>
        </datablau-select>
        <datablau-tooltip
          style="margin-right: 20px"
          :content="$t('domain.domainCluster.onlySystemWithDataSource')"
          placement="right"
          effect="dark"
        >
          <i class="iconfont icon-tips"></i>
        </datablau-tooltip>
        <span>{{ $t('domain.common.chooseDataSource') }}: &nbsp;&nbsp;</span>
        <datablau-select
          class="filter-input"
          clearable
          v-model="modeName"
          :placeholder="$t('domain.common.pleaseSelect')"
        >
          <el-option
            v-for="(item, index) in dataSourceArr"
            :key="index"
            :label="item.definition"
            :value="item.modelId"
          ></el-option>
        </datablau-select>
        <div class="page-btn-group right-top">
          <datablau-button
            v-if="false"
            type="secondary"
            @click="refresh"
            :disabled="isLoading"
          >
            <!--TODO:-->
            <!--need refresh button-->
            {{ $t('domain.common.refresh') }}
          </datablau-button>
          <!-- <datablau-button
            type="important"
            @click="addJobTab"
            class="iconfont icon-shezhi"
            v-if="$isAdmin || $auth['RECOMMENDED_VIEW']"
          >
            {{ $t('domain.domainCluster.manageJob') }}
          </datablau-button> -->
        </div>
      </div>
    </datablau-filter-row>
    <div class="table-row domain-detail" ref="tableLine" style="top: 50px">
      <datablau-table
        v-loading="isLoading || allDataLoading"
        ref="clusterResult"
        :data="tableDataShow"
        :data-selectable="hasAccess"
        :height="tableHeight"
        @selection-change="handleSelectionChange"
        @filter-change="handleFilterChange"
        @sort-change="handleSortChange"
        key="clusterResult"
      >
        <el-table-column width="28">
          <datablau-icon
            :data-type="'column'"
            :size="18"
            style="margin-top: 8px"
          ></datablau-icon>
        </el-table-column>
        <el-table-column
          :width="$i18n.locale === 'en' ? '150' : '100'"
          :label="$t('domain.domainCluster.fieldsCount')"
          column-key="totalCounts"
          sortable="coutom"
          prop="totalCounts"
        ></el-table-column>
        <el-table-column
          :label="`${$t('domain.domainCluster.sampleData')}`"
          min-width="750"
          column-key="example"
        >
          <template slot-scope="scope">
            <div class="table-cell">
              <div class="container">
                <span
                  class="example-item"
                  v-for="item in scope.row.columns.slice(0, 5)"
                  :key="item.id"
                  @mouseenter="showColumnDetail(item, scope.row, $event)"
                  @mouseleave="hideColumnDetail(item, scope.row, $event)"
                >
                  {{ item.alias || item.name }}
                </span>
              </div>
              <!-- <span class="dotted">...</span> -->
            </div>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('domain.common.operation')"
          ref="check"
          header-align="center"
          align="center"
          fixed="right"
          width="100"
          key="cluResOper"
        >
          <template slot-scope="scope">
            <span>
              <datablau-button
                type="icon"
                @click="handleCheckItem(scope.row)"
                size="small"
              >
                <datablau-tooltip
                  :content="$t('domain.common.check')"
                  placement="top"
                >
                  <i class="iconfont icon-see"></i>
                </datablau-tooltip>
              </datablau-button>
            </span>
            <span>
              <datablau-button
                type="icon"
                @click="handleDeleteItem(scope.row)"
                size="small"
              >
                <datablau-tooltip :content="$t('domain.dataFind.reRecommend')" placement="top">
                  <i class="iconfont icon-chehui"></i>
                </datablau-tooltip>
              </datablau-button>
            </span>
          </template>
        </el-table-column>
      </datablau-table>
    </div>
    <div class="row-page-info" style="width: 100%; padding-right: 20px">
      <span v-show="mutipleLength" class="check-info"></span>
      <span v-show="mutipleLength" class="footer-row-info">
        {{
          $t('common.deleteMessage', {
            selection: mutipleLength,
          })
        }}
      </span>
      <datablau-button
        v-if="hasAccess"
        type="primary"
        v-show="mutipleLength"
        @click="handleDeleteItem()"
        :disabled="deleteDisabled"
      >
        {{ $t('domain.dataFind.reRecommend') }}
      </datablau-button>
      <datablau-pagination
        style="padding-top: 10px; float: right"
        class="ddc-pagination"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="currentPage"
        :page-sizes="[20, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        :pager-count="7"
      ></datablau-pagination>
    </div>
  </div>
</template>

<script>
import redomainFind from './redomainFind.js'
export default redomainFind
</script>

<style lang="scss">
.cluster-result-tab2 {
  .filter-row {
    .row-inner {
      margin-top: 0;
      // height: 100%;
      &.ver-middle:before,
      .ver-middle:before {
        content: '';
        display: inline-block;
        height: 100%;
        vertical-align: middle;
      }
      .search-container {
        max-width: 200px;
        display: inline-block;
        vertical-align: middle;
        white-space: nowrap;
        .search-input {
          margin-right: 20px;
        }
      }
      .righth-btn-box {
        // display: inline-block;
        float: right;
        height: 100%;
        margin-right: 20px;
        .right-fresh {
          display: inline-block;
          vertical-align: middle;
        }
      }
    }
  }
  .table-cell {
    .container {
      display: flex;
      align-items: center;
      margin-right: 50px;
      .example-item {
        display: inline-block;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        width: 180px;
        cursor: default;
        margin-right: 20px;
      }
    }
    .dotted {
      float: right;
      margin-top: -30px;
    }
  }
}
</style>
<style lang="scss">
.cluster-result-tab2 {
  .table-row {
    .el-table__row {
      font-size: 12px;
      .cell {
        .table-cell {
          // text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
          .container {
            .example-item {
            }
          }
        }
      }
      .el-button--mini,
      .el-button--small {
        font-size: 12px;
      }
    }
  }
}
.row-inner {
  .filter-input {
    width: 180px;
    display: inline-block;
  }
  .el-select {
    .el-input__inner {
      height: 30px;
    }
    .el-input--suffix {
      height: 35px;
    }
  }
}
.domain-detail {
  margin: 0 20px;
}
</style>
