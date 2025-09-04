<template>
  <div class="datastandard-folder-detail" id="domainFolder">
    <!-- :class="{ 'less-search-line': !showMoreSearchCondition }" -->
    <datablau-list-search class="search-outer">
      <el-form
        ref="searchForm"
        v-resize="domResize"
        :inline="true"
        :model="searchFormData"
      >
        <el-form-item prop="domainName" style="width: 200px">
          <datablau-input
            clearable
            maxlength="100"
            type="text"
            style="width: 200px"
            v-model="searchFormData.domainName"
            :placeholder="
              $t('domain.common.search') + $t('domain.common.spacing') + $t('domain.domain.domainTypeName')
            "
          ></datablau-input>
        </el-form-item>
        <el-form-item prop="domainCode" style="width: 200px">
          <datablau-input
            type="text"
            clearable
            maxlength="100"
            size="mini"
            style="width: 200px;!important"
            v-model="searchFormData.domainCode"
            :placeholder="
              $t('domain.common.search') + $t('domain.common.spacing') + $t('domain.domain.domainTypeCode', { type: labelText.name })
            "
          ></datablau-input>
        </el-form-item>
        <el-form-item
          :label="$t('domain.common.state')"
          prop="stateValue"
          v-if="useWorkflow"
        >
          <datablau-select
            size="mini"
            v-model="searchFormData.stateValue"
            style="width: 120px"
          >
            <el-option
              v-for="item in stateOptions"
              :key="item.value"
              :value="item.value"
              :label="item.label"
            ></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item
          :label="$t('domain.domain.tecDefinitionDep')"
          prop="ownerOrg"
        >
          <datablau-select
            ref="ownerChooseSelect"
            v-model="searchFormData.ownerOrg"
            clearable
            size="mini"
            :placeholder="
              $t('domain.common.selectionPlaceholder', {
                name: $t('domain.domain.tecDefinitionDep'),
              })
            "
            @focus="selectOwnerOrg"
            :style="`width: ${$i18n.locale === 'en' ? 260 : 150}px`"
          >
            <el-option
              v-for="item in ownerOrgOptions"
              :key="item.id"
              :label="item.fullName"
              :value="item.bm"
            ></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item :label="$t('domain.domain.owner')" prop="department">
          <!-- v-if="showMoreSearchCondition" -->
          <datablau-select
            ref="submitterChooseSelect"
            clearable
            size="mini"
            type="text"
            maxlength="100"
            style="width: 170px"
            @focus="selectSubmitter"
            v-model="searchFormData.submitter"
            :placeholder="
              $t('domain.common.selectionPlaceholder', {
                name: $t('domain.domain.owner'),
              })
            "
          >
            <el-option
              v-for="item in submitterOrgOptions"
              :key="item.id"
              :label="item.fullName"
              :value="item.bm"
            ></el-option>
          </datablau-select>
        </el-form-item>
        <!-- v-if="showMoreSearchCondition" -->
        <!-- v-if="showMoreSearchCondition" -->
        <el-form-item v-if="useWorkflow">
          <el-button-group style="display: inline-block">
            <datablau-select
              v-model="searchTimeType"
              class="inline-search-item"
              @change="changeDateChoose"
              :style="`width: ${$i18n.locale === 'en' ? 220 : 120}px`"
            >
              <el-option
                value="start"
                :label="$t('domain.domain.filterPublishedDateStart')"
              ></el-option>
              <el-option
                value="end"
                :label="$t('domain.domain.filterPublishedDateEnd')"
              ></el-option>
              <el-option
                value="startend"
                :label="$t('domain.domain.filterPublishedDateStartEnd')"
              ></el-option>
            </datablau-select>
            <datablau-datePicker
              type="date"
              size="mini"
              value-format="timestamp"
              v-if="searchTimeType === 'start'"
              v-model="searchFormData.startTime"
              class="inline-search-item"
              :placeholder="$t('el.datepicker.selectDate')"
              key="startTime"
            ></datablau-datePicker>
            <datablau-datePicker
              type="date"
              size="mini"
              value-format="timestamp"
              v-model="searchFormData.endTime"
              v-if="searchTimeType === 'end'"
              class="inline-search-item"
              :placeholder="
                $t('domain.common.selectionPlaceholder', {
                  name: $t('domain.domain.date'),
                })
              "
              key="endTime"
            ></datablau-datePicker>
            <!-- :date-time="eventStartTime" -->
            <datablau-dateRange
              @changeDateTime="changeEventStartTime"
              v-model="eventStartTime"
              :placeholder="
                $t('domain.common.selectionPlaceholder', {
                  name: $t('domain.domain.date'),
                })
              "
              ref="eventStartTime"
              v-if="searchTimeType === 'startend'"
              class="inline-search-item"
              key="startend"
            ></datablau-dateRange>
          </el-button-group>
        </el-form-item>
      </el-form>
      <template slot="buttons">
        <div style="margin-right: 20px">
          <datablau-button
            size="mini"
            type="normal"
            @click="handleCurrentChange(1)"
          >
            {{ $t('domain.common.search') }}
          </datablau-button>
          <datablau-button size="mini" type="secondary" @click="resetQuery()">
            {{ $t('domain.common.reset') }}
          </datablau-button>
          <datablau-button
            v-if="topNum > 70"
            style="margin-left: 0"
            @click="showSelect = !showSelect"
            class="iconfont icon-filter"
            type="text"
          >
            {{
              showSelect
                ? $t('domain.common.shrink')
                : $t('domain.common.expansion')
            }}{{ $t('domain.common.spacing') }}{{ $t('domain.common.filter') }}
          </datablau-button>
        </div>
        <div v-if="stas !== false && hasEditAuth">
          <datablau-button
            type="primary"
            class="iconfont icon-tianjia"
            size="mini"
            @click="add"
          >
            {{ $t('common.button.add') }}
          </datablau-button>
          <el-dropdown
            trigger="click"
            @command="moreHandle"
            class="more-fun-btn"
          >
            <datablau-button size="mini" type="secondary" icon="el-icon-plus">
              {{ $t('common.button.more') }}
              <i class="el-icon-arrow-down el-icon--right"></i>
            </datablau-button>
            <el-dropdown-menu
              class="more-drop-box"
              slot="dropdown"
              v-if="labelText.nameAbbr === $t('domain.common.standard')"
            >
              <el-dropdown-item icon="iconfont icon-expand" command="d">
                {{ $t('domain.common.upd') }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </template>
    </datablau-list-search>
    <datablau-form-submit
      :style="{ top: showSelect && topNum > 70 ? topNum + 'px' : '52px' }"
    >
      <datablau-table
        class="datablau-table"
        height="100%"
        ref="domainTable"
        :data="tableData"
        @sort-change="changeSort"
        @selection-change="tableSelectionChanged"
        :data-selectable="hasEditAuth"
      >
        <el-table-column :width="hasEditAuth ? '20px' : '25px'">
          <div style="display: flex; align-items: center">
            <datablau-icon
              v-if="typeIds !== 2"
              style="flex-shrink: 0"
              data-type="datastandard"
              :isIcon="true"
              :size="18"
            ></datablau-icon>
            <datablau-icon
              v-else
              style="flex-shrink: 0"
              :data-type="'index'"
              :size="18"
            ></datablau-icon>
          </div>
        </el-table-column>
        <el-table-column
          min-width="120px"
          :label="$t('domain.domainStandard.chineseName')"
          prop="chineseName"
          sortable="chineseName"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span>
              {{ scope.row.chineseName }}
            </span>
          </template>
        </el-table-column>
        <!--<el-table-column-->
        <!--  :label="$version.tableHeader.enName"-->
        <!--  prop="englishName"-->
        <!--  sortable="englishName"-->
        <!--  min-width="120px"-->
        <!--  show-overflow-tooltip-->
        <!--&gt;</el-table-column>-->
        <el-table-column
          width="100px"
          sortable="domainCode"
          :label="$t('domain.domainStandard.domainStandardCode')"
          prop="domainCode"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :label="$version.tableHeader.status"
          prop="state"
          sortable="state"
          :min-width="80"
          show-overflow-tooltip
          v-if="useWorkflow"
        >
          <template slot-scope="scope">
            <span :style="`color:${getStatusColor(scope.row.state)}`">
              <span
                :style="`background-color:${getStatusColor(scope.row.state)}`"
                class="circle"
              ></span>
              {{ statusFormatter(scope.row.state) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('domain.domainStandard.domainTheme')"
          prop="path"
          :min-width="120"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <i
              class="iconfont icon-file"
              style="font-size: 14px; color: #409eff"
            ></i>
            &nbsp;
            {{ (scope.row.path && scope.row.path[1]) || '' }}
          </template>
        </el-table-column>
        <!--<el-table-column-->
        <!--  :label="$version.tableHeader.owner"-->
        <!--  prop="submitter"-->
        <!--  sortable="submitter"-->
        <!--  :min-width="90"-->
        <!--  show-overflow-tooltip-->
        <!--&gt;</el-table-column>-->
        <el-table-column
          :label="$t('domain.domain.tecDefinitionDep')"
          prop="descriptionDepartmentName"
          :min-width="120"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          v-if="useWorkflow"
          :label="$version.tableHeader.publishTime"
          width="140"
          column-key="publish"
          sortable="firstPublish"
          prop="firstPublish"
          :formatter="$timeNoSecondFormatter"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :label="$version.tableHeader.lastModificationTime"
          width="140"
          column-key="last"
          prop="lastModification"
          sortable="lastModification"
          :formatter="$timeNoSecondFormatter"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :label="$t('domain.common.operation')"
          align="right"
          header-align="center"
          width="120"
          fixed="right"
        >
          <template slot-scope="scope">
            <datablau-button
              style="margin: 0 3px"
              size="small"
              type="icon"
              v-if="stas !== 'false' && useDam && scope.row.state === 'A'"
              @click="
                subscribeRow(
                  subscribeList.includes(scope.row.domainId),
                  scope.row
                )
              "
            >
              <datablau-tooltip
                :content="$t('domain.common.unsubscribe')"
                placement="top"
                v-if="subscribeList.includes(scope.row.domainId)"
              >
                <i class="iconfont icon-dingyue"></i>
              </datablau-tooltip>
              <datablau-tooltip
                :content="$t('domain.common.subscription')"
                placement="top"
                v-else
                class="not-subscribe"
              >
                <i class="iconfont icon-dingyue"></i>
              </datablau-tooltip>
            </datablau-button>

            <div
              class="edit-btn domain-edit"
              v-if="
                stas !== 'false' &&
                hasEditAuth &&
                labelText.nameAbbr === $t('domain.common.standard') &&
                ($auth['DATA_STANDARD_EDIT'] || $auth['ROLE_DOMAIN_VIEW'])
              "
            >
              <datablau-button
                style="margin: 0 3px"
                type="icon"
                v-if="
                  useWorkflow &&
                  (scope.row.state === 'D' || scope.row.state === '')
                "
                @click="openEdit(scope.row)"
              >
                <datablau-tooltip
                  :content="$t('common.button.edit')"
                  placement="top"
                >
                  <i class="iconfont icon-bianji"></i>
                </datablau-tooltip>
              </datablau-button>
              <datablau-button
                style="margin: 0 3px"
                type="icon"
                v-if="!useWorkflow"
                @click="openEdit(scope.row)"
              >
                <datablau-tooltip
                  :content="$t('common.button.edit')"
                  placement="top"
                >
                  <i class="iconfont icon-bianji"></i>
                </datablau-tooltip>
              </datablau-button>
            </div>

            <div
              class="edit-btn dict-btn"
              v-if="
                stas !== 'false' &&
                hasEditAuth &&
                labelText.nameAbbr === $t('domain.common.dictionary') &&
                $auth['DATA_STANDARD_DICT_EDIT']
              "
            >
              <datablau-button
                style="margin: 0 3px"
                type="icon"
                v-if="
                  useWorkflow &&
                  (scope.row.state === 'D' || scope.row.state === '')
                "
                @click="openEdit(scope.row)"
              >
                <datablau-tooltip
                  :content="$t('common.button.edit')"
                  placement="top"
                >
                  <i class="iconfont icon-bianji"></i>
                </datablau-tooltip>
              </datablau-button>
              <datablau-button
                style="margin: 0 3px"
                type="icon"
                @click="openEdit(scope.row)"
                v-if="!useWorkflow"
              >
                <datablau-tooltip
                  :content="$t('common.button.edit')"
                  placement="top"
                >
                  <i class="iconfont icon-bianji"></i>
                </datablau-tooltip>
              </datablau-button>
            </div>

            <div
              v-if="
                stas !== 'false' &&
                hasEditAuth &&
                labelText.nameAbbr === $t('domain.common.dictionary') &&
                $auth['DATA_STANDARD_DIM_EDIT']
              "
              class="edit-btn index-btn"
            >
              <datablau-button
                style="margin: 0 3px"
                type="icon"
                v-if="
                  useWorkflow &&
                  (scope.row.state === 'D' || scope.row.state === '')
                "
                @click="openEdit(scope.row)"
              >
                <datablau-tooltip
                  :content="$t('common.button.edit')"
                  placement="top"
                >
                  <i class="iconfont icon-bianji"></i>
                </datablau-tooltip>
              </datablau-button>
              <datablau-button
                style="margin: 0 3px"
                type="icon"
                @click="openEdit(scope.row)"
                v-if="!useWorkflow"
              >
                <datablau-tooltip
                  :content="$t('common.button.edit')"
                  placement="top"
                >
                  <i class="iconfont icon-bianji"></i>
                </datablau-tooltip>
              </datablau-button>
            </div>
            <datablau-button
              style="margin: 0 3px"
              type="icon"
              @click="openScan(scope.row)"
            >
              <datablau-tooltip
                :content="$t('domain.common.check')"
                placement="top"
              >
                <i class="iconfont icon-see"></i>
              </datablau-tooltip>
            </datablau-button>
          </template>
        </el-table-column>
      </datablau-table>
      <template slot="buttons">
        <div class="left-btn" v-show="selection && selection.length > 0">
          <span
            class="footer-row-info"
            v-if="
              ($auth['DATA_STANDARD_DELETE'] || $auth['ROLE_DOMAIN_DELETE']) &&
              useWorkflow
            "
            v-show="stas !== 'false'"
          >
            {{
              $t('common.deleteMessage', {
                selection: selection.length,
              })
            }}
          </span>
          <div
            style="display: inline-block"
            v-if="labelText.nameAbbr === $t('domain.common.standard')"
          >
            <datablau-button
              class="iconfont icon-delete"
              type="danger"
              size="mini"
              @click="toDelete"
              v-if="!useWorkflow"
              v-show="stas !== 'false'"
            >
              {{ $t('common.button.delete') }}
            </datablau-button>
            <!--hidden when useWorkflow false-->
            <datablau-button
              class="iconfont icon-delete"
              type="danger"
              size="mini"
              @click="toDelete"
              :disabled="disabledControl('D')"
              v-if="useWorkflow"
              v-show="stas !== 'false'"
            >
              {{ $t('common.button.delete') }}
            </datablau-button>
            <datablau-button
              type="primary"
              size="mini"
              @click="toPublish"
              :disabled="disabledControl('D')"
              :loading="toPublishLoading"
              v-if="useWorkflow"
              v-show="stas !== 'false'"
            >
              {{ $t('domain.common.applyPublish') }}
            </datablau-button>
            <datablau-button
              type="primary"
              size="mini"
              @click="toChange"
              :disabled="disabledControl('A')"
              v-if="useWorkflow && topNum < 140"
              v-show="stas !== 'false'"
            >
              {{ $t('domain.common.applyChange') }}
            </datablau-button>

            <el-popover
              v-if="topNum > 140"
              placement="top"
              width="80"
              trigger="click"
            >
              <div style="width: 100%; height: 100%">
                <datablau-button
                  style="
                    width: 70px;
                    margin-left: 50%;
                    margin-bottom: 10px;
                    transform: translateX(-50%);
                  "
                  type="primary"
                  size="mini"
                  @click="toChange"
                  :disabled="disabledControl('A')"
                  v-if="useWorkflow"
                  v-show="stas !== 'false'"
                >
                  {{ $t('domain.common.applyChange') }}
                </datablau-button>
                <datablau-button
                  style="
                    width: 70px;
                    margin-left: 50%;
                    transform: translateX(-50%);
                  "
                  type="primary"
                  size="mini"
                  @click="toAbandon"
                  :disabled="disabledControl('A')"
                  :loading="toAbandonLoading"
                  v-if="useWorkflow"
                  v-show="stas !== 'false'"
                >
                  {{ $t('domain.common.applyDiscard') }}
                </datablau-button>
              </div>
              <datablau-button
                style="padding-left: 0"
                slot="reference"
                type="text"
              >
                <span style="font-size: 16px">
                  {{ '>>' }}
                </span>
              </datablau-button>
            </el-popover>

            <datablau-button
              type="primary"
              size="mini"
              @click="toAbandon"
              :disabled="disabledControl('A')"
              :loading="toAbandonLoading"
              v-if="useWorkflow && topNum < 140"
              v-show="stas !== 'false'"
            >
              {{ $t('domain.common.applyDiscard') }}
            </datablau-button>
          </div>
        </div>
        <datablau-pagination
          class="pagination-component"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page.sync="currentPage"
          :page-sizes="[20, 50, 100]"
          :page-size="pageSize"
          :pager-count="5"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        ></datablau-pagination>
      </template>
    </datablau-form-submit>
  </div>
</template>
<script>
import folderDetail from './folderDetail'

export default folderDetail
</script>
<style lang="scss" scoped>
#domainFolder .st-page-form {
  @media (max-width: 1525px) {
    .el-form-item__content {
      //border: 1px solid red;
      width: 110px;

      .el-input {
        width: 110px;
      }

      .el-button {
        padding: 7px 10px;
      }
    }
  }
}

.datastandard-folder-detail {
  position: relative;
  height: 100%;
  width: 100%;

  .inline-search-item {
    display: inline-block;
  }

  .search-outer {
    padding: 10px 20px 0 20px;

    /deep/ .datablau-form-box .el-select.is-single {
      width: 100% !important;
    }
    /deep/ .datablau-form-box {
      // min-width: 1000px;
      display: flex;
    }
    /deep/ .datablau-form-box .list-buttons {
      // min-width: 1000px;
      display: flex;
      float: none;
      flex-shrink: 0;
    }
    /deep/ .datablau-form-box .list-search-box {
      // display: flex;
      // flex-wrap: wrap;
      // flex-grow: 1;
      overflow-x: auto;
      margin-right: 0;
      // min-width: 840px;
      overflow-y: hidden;
    }
    /deep/ .datablau-form-box .list-search-box .el-form {
      // flex-grow: 1;
      min-width: 0;
    }
    /deep/
      .datablau-form-box
      .list-search-box
      .el-form
      .el-form-item
      .el-form-item__content {
      min-width: auto;
    }

    .more-condition-btn {
      //border: 1px solid red;
      position: absolute;
      top: 18px;
      right: 350px;

      i {
        transform: rotate(180deg);
      }
    }

    .more-fun-btn {
      margin-left: 10px;
    }
  }

  /deep/ .list-title {
    display: none;
  }

  .search-form {
    padding: 10px 0 0 20px;

    &.el-form.el-form--inline /deep/ .el-form-item {
      margin-bottom: 4px;
    }
  }

  /deep/ .form-submit {
    top: 105px;
  }

  /deep/ .row-buttons {
    text-align: left;
  }

  .left-btn {
    position: absolute;
    left: 0;
    height: 100%;
    width: 600px;
    padding-left: 20px;

    .footer-row-info {
      margin-right: 10px;
    }
  }

  .pagination-component {
    float: right;
    margin-right: 20px;
  }

  .hide-btn {
    visibility: hidden;
  }

  .not-subscribe {
    i.icon-dingyue {
      color: #999;
    }
  }
}

.edit-btn {
  display: inline-block;
}

.datastandard-folder-detail.less-search-line {
  /deep/ .form-submit {
    top: 80px;
  }

  .more-condition-btn {
    i {
      transform: rotate(0deg);
    }
  }
}
</style>
<style lang="scss">
.datastandard-folder-detail {
  border-top: 1px solid rgba(0, 0, 0, 0);

  .ag-root {
    // ag-grid root
    $headerHigth: 50px;

    .ag-header {
      .ag-header-row {
        .ag-header-cell {
          height: $headerHigth;
          line-height: $headerHigth;

          &::after {
            height: $headerHigth;
          }
        }
      }
    }
  }

  .circle {
    position: relative;
    bottom: 1px;
    display: inline-block;
    margin-right: 7px;
    background-color: #5cb793;
    border-radius: 3.5px;
    width: 7px;
    height: 7px;
  }
}
.more-drop-box .el-dropdown-menu__item {
  .iconfont {
    color: #999;
    font-size: 14px;
  }
  &:hover {
    color: #409eff;
    .iconfont {
      color: #409eff;
    }
  }
}
.el-popover {
  min-width: 100px;
}
</style>
