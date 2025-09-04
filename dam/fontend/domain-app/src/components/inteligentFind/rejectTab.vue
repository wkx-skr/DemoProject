<template>
  <div class="tab-page rec-job-result tab-page-ver2 rejectTab">
    <div class="filter-row">
      <div class="row-inner">
        <div class="search-container">
          <span>{{ $t('domain.common.chooseSystem') }} &nbsp;&nbsp;</span>
          <datablau-select
            v-model="choosedCategoryId"
            filterable
            clearable
            size="mini"
            class="normal-width-input"
            @change="handleCategoryChange"
          >
            <el-option
              v-for="c in $userModelCategoryDetail"
              :label="c.categoryName + '(' + c.categoryAbbreviation + ')'"
              :value="c.categoryId"
              :key="c.categoryId"
              :disabled="!c.isSelf"
            ></el-option>
          </datablau-select>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <span>{{ $t('domain.common.chooseDataSource') }} &nbsp;&nbsp;</span>
          <datablau-select
            v-model="currentModel"
            filterable
            clearable
            size="mini"
            @change="handleModelChange"
            class="normal-width-input"
          >
            <el-option
              v-for="item in modelsArr"
              :label="item.definition"
              :value="item.modelId"
              :key="item.modelId"
            ></el-option>
          </datablau-select>
        </div>
      </div>
    </div>
    <div
      class="table-row domain-detail"
      ref="tableLine"
      style="top: 50px; padding: 0"
    >
      <datablau-table
        v-loading="isLoading"
        ref="recDomTable"
        border
        :data="tableDataShow"
        :height="tableHeight"
        :data-selectable="$auth['INTELLIGENT_VIEW']"
        @selection-change="handleSelectionChange"
        @filter-change="filterHandler"
        @sort-change="handleSortChange"
      >
        <el-table-column width="28">
          <datablau-icon
            :data-type="'column'"
            :size="18"
            style="margin-top: 8px"
          ></datablau-icon>
        </el-table-column>
        <el-table-column
          :label="$t('domain.dataFind.enName')"
          prop="name"
          min-width="100"
          sortable="custom"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :label="$t('domain.dataFind.cName')"
          prop="alias"
          column-key="alias"
          show-overflow-tooltip
          min-width="100"
          sortable="custom"
        >
          <template slot-scope="scope">
            <el-popover placement="top-start" trigger="hover">
              <div class="popover-con column-rec-dom">
                <el-form
                  label-position="left"
                  label-width="130"
                  class="cloumn-detail"
                >
                  <el-form-item
                    :label="`${$t('domain.common.owningSystem')}：`"
                  >
                    <span>
                      {{ modelCategoryMap[scope.row.modelCategoryId] }}
                    </span>
                  </el-form-item>
                  <el-form-item
                    :label="`${$t('domain.common.owningDataSource')}：`"
                  >
                    <span>{{ modelMap[scope.row.modelId] }}</span>
                  </el-form-item>
                  <el-form-item :label="`${$t('domain.dataFind.cName')}：`">
                    <span>{{ scope.row.alias }}</span>
                  </el-form-item>
                  <el-form-item :label="`${$t('domain.dataFind.enName')}：`">
                    <span>{{ scope.row.name }}</span>
                  </el-form-item>
                </el-form>
              </div>
              <span slot="reference">{{ scope.row.alias }}</span>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('domain.dataFind.resourcesPath')"
          prop="name"
          column-key="name"
          min-width="150"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span>{{ scope.row.path }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('domain.dataFind.notRecommendedStandard')"
          prop="domains"
          :width="550"
        >
          <template slot-scope="scope">
            <div
              class="container"
              v-for="item in scope.row.domains"
              :key="item.id"
            >
              <el-popover
                placement="left-start"
                trigger="hover"
                :open-delay="300"
                :key="item.id"
                :popper-options="domDetailPopOption"
                v-if="
                  showTooltipDom === item.id &&
                  showTooltipRow === scope.row.objectId
                "
              >
                <div class="popover-con rec-dom-con">
                  <p
                    class="domain-detail"
                    :class="{ 'long-text': currentDomain.longText }"
                  >
                    <el-form
                      label-position="left"
                      label-width="90px"
                      class="dom-detail"
                    >
                      <el-form-item :label="`${$t('domain.dataFind.name')}：`">
                        <span>{{ currentDomain.domainChName }}</span>
                        <span
                          @click="handleSkip2Domain(currentDomain)"
                          class="check-btn"
                        >
                          {{ $t('domain.common.check') }}
                        </span>
                      </el-form-item>
                      <el-form-item
                        :label="`${$t('domain.dataFind.enName')}：`"
                      >
                        <span>{{ currentDomain.domainEnName }}</span>
                      </el-form-item>
                      <el-form-item :label="`${$t('domain.dataFind.path')}：`">
                        <span>{{ currentDomain.path }}</span>
                      </el-form-item>
                      <el-form-item
                        :label="`${$t('domain.common.domainPropCode')}：`"
                      >
                        <span>{{ currentDomain.domainCode }}</span>
                      </el-form-item>
                      <el-form-item
                        :label="`${$t('domain.dataFind.businessDefinition')}：`"
                      >
                        <span>{{ currentDomain.description }}</span>
                      </el-form-item>
                      <el-form-item
                        :label="`${$t('domain.common.dataType')}：`"
                      >
                        <span>{{ currentDomain.dataType }}</span>
                      </el-form-item>
                    </el-form>
                  </p>
                </div>
                <el-button
                  class="rec-dom-btn normal-btn"
                  size="mini"
                  type="primary"
                  @mouseenter.native="
                    getDomainDetail(item.id, scope.row.objectId, $event)
                  "
                  @mouseleave.native="
                    clearDomainDetail(item.id, scope.row.objectId, $event)
                  "
                  slot="reference"
                  ref="'' + item.id + scope.row.objectId"
                >
                  {{ item.cnName }}
                </el-button>
              </el-popover>
              <el-button
                class="rec-dom-btn normal-btn"
                type="primary"
                size="mini"
                v-else
                @mouseenter.native="
                  getDomainDetail(item.id, scope.row.objectId, $event)
                "
                @mouseleave.native="
                  clearDomainDetail(item.id, scope.row.objectId, $event)
                "
                slot="reference"
                ref="'' + item.id + scope.row.objectId"
              >
                {{ item.cnName }}
              </el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('domain.common.operation')"
          ref="check"
          header-align="center"
          align="center"
          fixed="right"
          v-if="$auth['INTELLIGENT_VIEW']"
          width="150"
        >
          <template slot-scope="scope">
            <span>
              <datablau-button
                type="text"
                @click="handlerejDom(scope)"
                size="small"
              >
                {{ $t('domain.dataFind.reRecommend') }}
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
        v-if="$auth['INTELLIGENT_VIEW']"
        v-show="mutipleLength"
        size="small"
        type="normal"
        @click="rejBat"
        :disabled="deleteDisabled"
      >
        {{ $t('domain.dataFind.BatchReRecommend') }}
      </datablau-button>
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
import rejectTab from './rejectTab.js'

export default rejectTab
</script>

<style lang="scss">
.tab-page.tab-page-ver2.rec-job-result {
  .filter-row {
    .row-inner {
      .search-container {
        min-width: 670px;
        padding-left: 20px;
        .el-input {
          padding-left: 0;
        }
      }

      .rightButton {
        float: right;
        margin-right: 20px;

        .margin20 {
          margin-left: 20px;
        }
      }
    }

    i {
      display: inline-block;
      font-size: 16px;
      margin-left: 10px;
      line-height: 28px;
      color: #aaa;
    }

    .right-fresh {
      float: right;
      margin-right: 30px;
      padding: 0;
      width: 70px;
      //height: 30px;
      text-align: center;
    }
  }

  .table-row {
    font-size: 10px;
    padding: 0 20px;

    .rec-dom-btn {
      padding: 6px 10px;
      margin: 3px 3px;
      width: 100px;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
  }

  .normal-width-input {
    display: inline-block;
    width: 200px;
  }

  .footer-row {
    border-top: 1px solid #e0e0e0;
    padding-top: 10px;
  }
}
</style>
<style lang="scss">
$blue: #0084ff;
$lightblue: #e8f0fc;
$normal-color: #409eff;
$normal-bg-color: transparentize(#409eff, 0.9);
$border-color-secondary: #d2d2d2;
$text-default: #555555;
$btnpad: 4px 9px;
$poplheight: 20px;
.rec-job-result {
  min-width: 1100px;

  .current-btn {
    background-color: $normal-bg-color;
    color: $normal-color;
    border: 1px solid $normal-color;
    border-radius: 0;
  }

  .normal-btn {
    border: 1px solid $border-color-secondary;
    background-color: #ffffff;
    color: $text-default;
    border-radius: 0;
    padding: $btnpad;
  }

  .table-row {
    .el-table__row {
      font-size: 12px;

      .cell {
        padding-top: 5px;
        padding-bottom: 5px;

        .container {
          display: inline-block;
        }
      }

      .el-button--mini,
      .el-button--small {
        font-size: 12px;
      }
    }
  }
}

div.popover-con.column-rec-dom {
  padding: 5px 10px;
  min-width: 300px;
  max-width: 550px;

  .cloumn-detail {
    .el-form-item {
      margin: 0;
      padding: 0;
      line-height: $poplheight;

      .el-form-item__label,
      .el-form-item__content {
        line-height: $poplheight;
      }
    }

    .el-form-item__label {
      font-weight: bold;
    }
  }
}

.popover-con.rec-dom-con {
  padding: 5px 10px;
  max-height: 400px;
  overflow: auto;

  .domain-detail {
    min-width: 380px;
    max-width: 550px;

    &.long-text {
      max-width: 800px;
    }
  }

  .dom-detail {
    .el-form-item {
      margin: 0;
      padding: 0;
      line-height: $poplheight;

      .el-form-item__label,
      .el-form-item__content {
        line-height: $poplheight;
      }

      .check-btn {
        color: #409eff;
        cursor: pointer;
        margin-left: 20px;
      }
    }

    .el-form-item__label {
      font-weight: bold;
    }
  }
}
</style>
