<template>
  <div class="tab-page system-setting tab-page-ver2">
    <div class="filter-row" style="height: 34px">
      <div class="row-inner">
        <!-- <span class="label">模糊搜索</span> -->
        <datablau-input
          clearable
          v-model="keyword"
          :iconfont-state="true"
          style="width: 240px"
          :placeholder="$t('quality.page.settingList.placeholder')"
        ></datablau-input>
      </div>
      <div class="page-btn-group right-top">
        <datablau-button type="secondary" @click="refresh">
          <i class="el-icon-refresh"></i>
          {{ $t('quality.page.settingList.refresh') }}
        </datablau-button>
        <datablau-button type="important" @click="addTab">
          {{ $t('quality.page.settingList.add') }}
        </datablau-button>
      </div>
    </div>
    <datablau-form-submit style="margin-top: 44px">
      <datablau-table
        :data="dataDisplay"
        ref="multipleTable"
        height="100%"
        :checkDisabledObj="checkDisabledObj"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        @filter-change="handleFilterChange"
        :data-selectable="option.selectable"
        :auto-hide-selection="option.autoHideSelectable"
        :show-column-selection="option.showColumnSelection"
        :column-selection="option.columnSelection"
        :border="option.columnResizable"
      >
        <!-- <el-table-column
          type="selection"
          :selectable="selectable"
        ></el-table-column> -->
        <el-table-column
          prop="name"
          sortable="custom"
          :label="$t('quality.page.settingList.table.name')"
        ></el-table-column>
        <el-table-column
          prop="valueType"
          :filters="[
            { value: 'LONG', text: 'LONG' },
            { value: 'DOUBLE', text: 'DOUBLE' },
            { value: 'STRING', text: 'STRING' },
            { value: 'SECRET', text: 'SECRET' },
            { value: 'LIST_LONG', text: 'LIST_LONG' },
            { value: 'LIST_DOUBLE', text: 'LIST_DOUBLE' },
            { value: 'LIST_STRING', text: 'LIST_STRING' },
            { value: 'LIST_SECRET', text: 'LIST_SECRET' },
          ]"
          :label="$t('quality.page.settingList.table.valueType')"
        ></el-table-column>
        <el-table-column
          prop="valueGenerator"
          :filters="[
            { value: 'GROOVY', text: 'GROOVY' },
            { value: 'PLAIN', text: 'PLAIN' },
            { value: 'SQL', text: 'SQL' },
          ]"
          :label="$t('quality.page.settingList.table.valueGenerator')"
        ></el-table-column>
        <el-table-column
          prop="description"
          :label="$t('quality.page.settingList.table.description')"
        ></el-table-column>
        <!-- <el-table-column
          prop="level"
          label="参数级别"
          :formatter="levelFormatter"
        ></el-table-column>
        <el-table-column
          prop="scope"
          width="90"
          label="可见范围"
          :formatter="scopeFormatter"
        ></el-table-column> -->
        <el-table-column
          :label="$t('quality.page.settingList.table.operation')"
          align="center"
          width="120"
          fixed="right"
        >
          <template slot-scope="scope">
            <datablau-button type="text" @click="handleEdit(scope.$index)">
              <span v-if="selectable(scope.row)">
                {{ $t('common.button.edit') }}
              </span>
              <span v-else>
                {{ $t('common.button.scan') }}
              </span>
            </datablau-button>
            <datablau-button type="text" @click="handleTest(scope.$index)">
              {{ $t('quality.page.settingList.table.test') }}
            </datablau-button>
          </template>
        </el-table-column>
      </datablau-table>
      <template slot="buttons">
        <div class="left-button" v-show="multipleSelection.length > 0">
          <span class="check-info"></span>
          <span class="footer-row-info">
            {{
              $t('common.deleteMessage', {
                selection: multipleSelection.length,
              })
            }}
          </span>
          <datablau-button
            type="danger"
            class="el-icon-delete"
            @click="preDeleteRows"
            :disabled="deleteDisabled"
          >
            {{ $t('common.button.delete') }}
          </datablau-button>
        </div>

        <datablau-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, jumper, next"
          :total="total"
        ></datablau-pagination>
      </template>
    </datablau-form-submit>
  </div>
</template>

<script>
import list from './list.js'
export default list
</script>
<style lang="scss">
.tabPageAbs .filter-row .row-inner .el-input,
.tab-page-ver2 .filter-row .row-inner .el-input {
  margin-left: 20px;
  padding-left: 0 !important;
}
.system-setting {
  .table-row {
    position: absolute;
    margin-top: 10px;
    top: 34px;
    left: 20px;
    right: 20px;
    border-bottom: 1px solid #eee;
  }
}
</style>
<style lang="scss" scoped>
@import '~@/next/components/basic/color.sass';
.system-setting {
  .icon-green {
    color: #48bbc2;
  }

  .icon-red {
    color: #fc595a;
  }
  .tab-page {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;

    .filter-row {
      height: 34px;
      .row-inner {
        min-width: 900px;
        .search-container {
          display: inline-block;
          width: 50%;
          max-width: 300px;
          min-width: 200px;
        }
        .rightButton {
          float: right;
          margin-right: 20px;
          .margin20 {
            margin-left: 20px;
          }
        }
      }
    }
  }
  .left-button {
    position: absolute;
    top: 50%;
    left: 20px;
    -webkit-transform: translateY(-50%);
    transform: translateY(-50%);
    .check-info {
      display: inline-block;
      width: 14px;
      height: 14px;
      margin-right: -13px;
      vertical-align: middle;
      background: $primary-color;
    }
    .footer-row-info {
      height: 50px;
      margin-right: 10px;
      &::before {
        margin-right: 5px;
        font-family: 'element-icons';
        font-size: 12px;
        font-weight: 200;
        line-height: 13px;
        color: white;
        vertical-align: middle;
        content: '\e6da';
      }
    }
  }
}
</style>
