<template>
  <div
    class="tab-page cluster-item-detail tab-page-ver2"
    style="overflow: hidden; top: 40px"
  >
    <div class="filter-row">
      <div class="row-inner" :class="{ 'row-inner-en': $i18n.locale === 'en' }">
        <div class="search-container" style="width: 180px">
          <datablau-input
            class="filter-input"
            :placeholder="$t('domain.common.queryPlaceholder')"
            v-model="keyword"
            :clearable="true"
            :iconfont-state="true"
          ></datablau-input>
        </div>
        <div class="search-container">
          <span>{{ $t('domain.common.chooseSystem') }} &nbsp;&nbsp;</span>
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
          <!-- <datablau-tooltip
            :content="$t('domain.domainCluster.onlySystemWithDataSource')"
            placement="right"
            effect="dark"
          >
            <i class="iconfont icon-tips"></i>
          </datablau-tooltip> -->
        </div>
        <div class="search-container">
          <span>{{ $t('domain.common.chooseDataSource') }} &nbsp;&nbsp;</span>
          <datablau-select
            class="filter-input"
            clearable
            v-model="modelName"
            @change="changeModel"
            :placeholder="$t('domain.common.pleaseSelect')"
          >
            <el-option
              v-for="(item, index) in dataSourceArr"
              :key="index"
              :label="item.definition"
              :value="item.modelId"
            ></el-option>
          </datablau-select>
        </div>
      </div>
    </div>
    <div class="table-row cluster-item-table" ref="tableLine" style="top: 50px">
      <datablau-table
        v-loading="isLoading || allDataLoading"
        ref="clusterItemTable"
        :data="tableDataShow"
        :data-selectable="false"
        :height="tableHeight"
        @selection-change="handleSelectionChange"
        @filter-change="filterHandler"
        @sort-change="handleSortChange"
      >
        <!-- <el-table-column
          type="selection"
          width="55"
          v-if="hasAccess"
          :key="hasAccess"
        ></el-table-column> -->
        <el-table-column
          :label="$t('domain.domainCluster.cName')"
          prop="alias"
          column-key="alias"
          show-overflow-tooltip
          sortable="custom"
        ></el-table-column>
        <el-table-column
          :label="$t('domain.domainCluster.enName')"
          prop="name"
          column-key="name"
          show-overflow-tooltip
          sortable="custom"
        ></el-table-column>
        <el-table-column
          :label="$t('domain.common.owningSystem')"
          prop="modelCategoryName"
          column-key="modelCategoryName"
          show-overflow-tooltip
          sortable="custom"
        ></el-table-column>
        <el-table-column
          :label="$t('domain.common.owningDataSource')"
          prop="modelName"
          column-key="modelName"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :label="$t('domain.domainCluster.owningTable')"
          prop="tableName"
          column-key="tableName"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :label="$t('domain.common.dataType')"
          prop="dataTypeFormatter"
          column-key="dataType"
        >
          <!-- max-width="80" -->
        </el-table-column>
        <el-table-column
          :label="$t('domain.domainCluster.dataLength')"
          prop="dataType"
          column-key="dataScale"
          :formatter="getDataScale"
        >
          <!-- min-width="80" -->
        </el-table-column>
        <el-table-column
          :label="$t('domain.domainCluster.dataPrecision')"
          prop="dataType"
          column-key="dataPrecision"
          :formatter="getPrecision"
        >
          <!-- min-width="80" -->
        </el-table-column>
        <el-table-column
          :label="$t('domain.common.score')"
          prop="score"
          column-key="score"
          width="100"
          show-overflow-tooltip
          sortable="custom"
        ></el-table-column>
      </datablau-table>
    </div>
    <div class="row-page-info" style="width: 100%; padding-left: 0">
      <span v-show="mutipleLength" class="check-info"></span>
      <span v-show="mutipleLength" class="footer-row-info">
        {{
          $t('common.deleteMessage', {
            selection: mutipleLength,
          })
        }}
      </span>
      <!-- <datablau-button
        v-if="hasAccess"
        type="important"
        v-show="mutipleLength"
        @click="handlecreateDomain"
        :disabled="acceptDisabled"
      >
        {{ $t('domain.common.createDomain') }}
      </datablau-button> -->
      <datablau-pagination
        style="padding-top: 10px; float: right"
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
import reClusterItem from './reClusterItem.js'
export default reClusterItem
</script>

<style lang="scss">
.cluster-item-detail.tab-page-ver2 {
  margin: 0 20px;
  .filter-row {
    .row-inner {
      .search-container {
        max-width: 280px;
        display: inline-block;
        // width: 180px;
        .el-input {
          // max-width: 200px;
          padding-left: 0;
        }
        // .el-input__inner {
        //   height: 30px;
        // }
        // .el-input--suffix {
        //   height: 35px;
        // }
      }
      .current-domain {
        display: inline-block;
        min-width: 200px;
        // border: 1px solid red;
      }
      .domain-title {
        // border: 1px solid red;
        &:hover {
          cursor: pointer;
        }
      }

      &.row-inner-en {
        .search-container {
          max-width: 360px;
        }
      }
    }
  }
}
</style>
