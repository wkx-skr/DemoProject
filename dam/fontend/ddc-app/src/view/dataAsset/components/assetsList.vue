<template>
  <div class="assets-list-page" :style="{ top: topH + 84 + 'px' }">
    <div class="assets-list-search-box" ref="searchBox">
      <datablau-list-search>
        <el-form ref="form">
          <el-form-item label="">
            <datablau-input
              :iconfont-state="true"
              style="width: 150px"
              clearable
              type="text"
              v-model="form.name"
              :placeholder="$t('assets.assetList.search')"
              @keydown.enter.native="query"
            ></datablau-input>
          </el-form-item>
          <el-form-item :label="$t('assets.assetList.assetsType')">
            <datablau-select
              style="width: 120px"
              v-model="form.type"
              filterable
              clearable
              :placeholder="$t('assets.assetList.assetsType')"
            >
              <el-option
                v-for="(item, key) in assetsTypeList"
                :key="key"
                :label="item.name"
                :value="item.type"
              ></el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item
            :label="$t('assets.assetList.dataSecurityLevel')"
            v-if="$featureMap['FE_SECURITY']"
          >
            <datablau-select
              clearable
              style="width: 120px"
              v-model="form.access"
              filterable
              :placeholder="$t('assets.assetList.dataSecurityLevel')"
            >
              <el-option
                v-for="item in accessList"
                :key="item.id"
                :label="item.name"
                :value="item.builtInCode"
              ></el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item
            :label="$t('assets.assetList.assetStatus')"
            v-if="type !== 1"
          >
            <datablau-select
              style="width: 100px"
              v-model="form.state"
              filterable
              :placeholder="$t('assets.assetList.assetStatus')"
            >
              <el-option
                v-for="item in stateList"
                :key="item.id"
                :label="item.name"
                :value="item.state"
              ></el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item class="btn">
            <datablau-button type="normal" @click="query">
              {{ $t('common.button.query') }}
            </datablau-button>
            <datablau-button type="secondary" @click="reset">
              {{ $t('common.button.reset') }}
            </datablau-button>
          </el-form-item>
        </el-form>
      </datablau-list-search>
    </div>
    <div class="table-box">
      <datablau-form-submit>
        <datablau-table
          :show-column-selection="false"
          height="100%"
          :default-sort="{ prop: 'publishTime', order: 'ascending' }"
          :data-selectable="false"
          ref="dsTable"
          v-loading="loading"
          @selection-change="handleSelectionChange"
          @sort-change="sortChange"
          :data="displayData"
          row-key="assetsId"
          reserve-selection
          :rowSelectable="rowSelectable"
          row-class-name="row-can-click"
          @row-click="toDetail"
        >
          <el-table-column width="28">
            <template slot-scope="scope">
              <datablau-icon
                :data-type="
                  getAssetsType(scope.row.subAssetsType, 3, scope.row)
                "
                v-if="
                  scope.row &&
                  scope.row.subAssetsType !== AssetsTypeEnum.META_MODEL
                "
                :size="20"
                style="position: relative; top: 3px"
              ></datablau-icon>
              <img
                v-else
                :src="metaModelIconMap[scope.row.itemTypeId]"
                alt=""
                width="20"
                height="20"
              />
            </template>
          </el-table-column>
          <el-table-column
            label="资产编号"
            prop="assetsCode"
            :min-width="125"
            sortable
            show-overflow-tooltip
          >
            <template slot="header">
              <span>
                资产编号
                <i
                  v-if="
                    !autoIncState &&
                    displayData &&
                    displayData.find(
                      item =>
                        item.status === 'UNPUBLISHED' ||
                        item.status === 'OFFLINE'
                    )
                  "
                  class="iconfont icon-bianji"
                  @click="toEditAssetsCode"
                  style="font-size: 14px; color: #999"
                ></i>
              </span>
            </template>
            <template slot-scope="scope">
              <span
                v-if="
                  !editingAssetsCode ||
                  ['PUBLISHED', 'UNDER_REVIEW'].indexOf(scope.row.status) !== -1
                "
              >
                {{ scope.row.assetsCode || '--' }}
              </span>
              <datablau-input
                v-else
                v-model="scope.row.assetsCode"
                @blur="checkkAssetsCodeValidate(scope.row)"
                @clear="() => (scope.row.codeInvalid = false)"
                placeholder="编号最长70位"
                maxlength="70"
                clearable
                :style="{
                  border: scope.row.codeInvalid ? '1px solid red' : 'none',
                }"
              ></datablau-input>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('assets.assetList.assetName')"
            prop="assetsName"
            :min-width="minScreen ? 180 : 120"
            show-overflow-tooltip
          ></el-table-column>
          <!-- <el-table-column
            v-if="$featureMap['FE_SECURITY']"
            :min-width="98"
            :label="$t('assets.assetList.dataSecurityLevel')"
            prop="tagId"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              {{ getSecurityLevel(scope.row.tagCode) }}
            </template>
          </el-table-column> -->
          <el-table-column
            :width="minScreen ? 100 : 90"
            align="center"
            :label="$t('assets.assetList.assetsType')"
            prop="assetsType"
          >
            <template slot-scope="scope">
              <div
                v-if="scope.row.subAssetsType !== 'METAMODEL_OBJECT'"
                class="type-class"
                :style="getAssetsType(scope.row.subAssetsType, 2)"
              >
                {{ getAssetsType(scope.row.subAssetsType, 1) }}
              </div>
              <div
                v-else
                class="type-class"
                :style="getAssetsType2(scope.row, 2)"
              >
                {{ getAssetsType2(scope.row, 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('assets.assetList.authoritativeSource')"
            prop="sourcePath"
            show-overflow-tooltip
            :min-width="minScreen ? 150 : 90"
          >
            <!-- <template slot-scope="scope">
              {{ scope.row.sourcePath ? scope.row.sourcePath : '--' }}
            </template> -->
          </el-table-column>
          <el-table-column
            :label="$t('assets.assetList.assetDirectory')"
            prop="catalogPath"
            :min-width="minScreen ? 150 : 100"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              {{ scope.row.catalogNamePath }}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('assets.assetList.dataOwnership')"
            prop="departmentNameList"
            :min-width="minScreen ? 120 : 90"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <span>
                {{ getDepartmentName(scope.row) }}
              </span>
            </template>
          </el-table-column>
          <!-- <el-table-column
            :label="$t('assets.assetList.assetStatus')"
            prop="state"
            align="center"
            :width="minScreen ? 120 : 100"
          >
            <template slot-scope="scope">
              <div
                class="audit-status"
                :style="'color:' + getStatusColor(scope.row.status)"
              >
                <span
                  :style="`background-color:${getStatusColor(
                    scope.row.status
                  )}`"
                  class="circle"
                ></span>
                {{ transState(scope.row.status) }}
              </div>
            </template>
          </el-table-column> -->
          <!-- <el-table-column
            :label="$t('assets.assetList.releaseTime')"
            prop="publishTime"
            sortable="custom"
            :min-width="140"
            :formatter="$timeFormatter"
            show-overflow-tooltip
          ></el-table-column> -->
          <el-table-column
            :label="$t('assets.assetList.operation')"
            :width="100"
            align="center"
            fixed="right"
            prop="operation"
          >
            <template slot-scope="scope">
              <datablau-button
                type="text"
                :tooltip-content="$t('common.button.scan')"
                class="iconfont icon-see"
                @click.stop="toDetail(scope.row)"
              ></datablau-button>
              <!-- <datablau-button
                type="text"
                v-if="!type"
                :tooltip-content="$t('common.button.delete')"
                class="iconfont icon-delete"
                :disabled="
                  scope.row.status === 'UNDER_REVIEW' ||
                  scope.row.status === 'PUBLISHED'
                "
                @click="remove(scope.row)"
              ></datablau-button> -->
            </template>
          </el-table-column>
        </datablau-table>
        <template slot="buttons">
          <div class="bottom">
            <template v-if="!type">
              <span v-if="selections.length > 0" class="check-info"></span>
              <span v-if="selections.length > 0" class="footer-row-info">
                {{
                  $t('assets.assetList.selectedTip', { num: selections.length })
                }}
              </span>
              <!-- <datablau-tooltip
                effect="dark"
                :content="$t('assets.assetList.publishTips')"
                placement="bottom"
                v-if="selections.length > 0"
                :disabled="canOffline"
              >
                <datablau-button
                  v-if="selections.length > 0"
                  class="iconfont icon-Offline"
                  @click="handlePublishOrOffline('offline')"
                  :disabled="!canOffline"
                >
                  {{ $t('assets.assetList.offline') }}
                </datablau-button>
              </datablau-tooltip> -->

              <!-- <datablau-tooltip
                effect="dark"
                :content="$t('assets.assetList.offlineTips')"
                placement="bottom"
                v-if="selections.length > 0"
                :disabled="canPublish"
              >
                <datablau-button
                  style="margin-left: 10px"
                  v-if="selections.length > 0"
                  class="iconfont icon-publish"
                  @click="handlePublishOrOffline('publish')"
                  :disabled="!canPublish"
                >
                  {{ $t('assets.assetList.publish') }}
                </datablau-button>
              </datablau-tooltip> -->
              <!-- <datablau-tooltip
                effect="dark"
                :content="$t('assets.assetList.deleteTips')"
                placement="bottom"
                v-if="selections.length > 0"
                :disabled="canDelete"
              >
                <datablau-button
                  style="margin-left: 10px"
                  type="danger"
                  class="el-icon-delete"
                  @click="batchDelete"
                  :disabled="!canDelete"
                >
                  {{ $t('assets.assetList.delete') }}
                </datablau-button>
              </datablau-tooltip> -->
            </template>
            <template v-if="editingAssetsCode">
              <datablau-button
                type="normal"
                @click="saveAssetsCode"
                :disabled="!!displayData.find(item => item.codeInvalid)"
                :tooltip-content="
                  displayData.find(item => item.codeInvalid)
                    ? $t('assets.assetList.codeErrorTips')
                    : ''
                "
              >
                {{ $t('common.button.ok') }}
              </datablau-button>
              <datablau-button type="secondary" @click="cancelAssetsCode">
                {{ $t('common.button.cancel') }}
              </datablau-button>
            </template>
            <datablau-pagination
              @current-change="handlePageChange"
              @size-change="handleSizeChange"
              :current-page.sync="form.page"
              :page-sizes="[20, 50, 100, 200]"
              :page-size="form.size"
              layout="total, sizes, prev, jumper, next "
              :total="total"
              class="page"
            ></datablau-pagination>
          </div>
        </template>
      </datablau-form-submit>
    </div>
  </div>
</template>

<script>
import assetsList from './assetsList'
export default assetsList
</script>

<style scoped lang="scss">
$primary-color: #409eff;
/deep/ .el-form-item__content {
  min-width: auto !important;
}
/deep/ .el-table.datablau-table {
  .el-table__body {
    .cell {
      // padding-left: 0 !important;
    }
  }
  .el-input--suffix .el-input__inner {
    padding-right: 21px;
    padding-left: 6px;
  }
  .el-input__suffix {
    right: 2px;
  }
  .el-input__icon.el-icon-circle-close.el-input__clear {
    left: 2px;
    right: 2px;
    font-size: 12px;
    width: 20px;
  }
}
.audit-status {
  position: relative;
  text-align: center;
  span {
    width: 6px;
    height: 6px;
    display: inline-block;
    margin-right: 4px;
    border-radius: 3px;
  }
}
.type-class {
  width: 70px;
  height: 22px;
  line-height: 22px;
  font-size: 12px;
  text-align: center;
  border-radius: 2px;
  margin: 0 auto;
}
.assets-list-page {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 172px;
  .assets-list-search-box {
    padding: 0 16px;
  }
  .table-box {
    position: absolute;
    top: 44px;
    left: 0;
    right: 0;
    bottom: 0;
  }

  .bottom {
    box-sizing: border-box;
    padding: 10px 20px 0;
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 50px;

    .check-info {
      width: 14px;
      height: 14px;
      display: inline-block;
      background: $primary-color;
      margin-right: -13px;
      vertical-align: middle;
    }

    .footer-row-info {
      height: 50px;
      margin-right: 10px;
      &:before {
        content: '\e6da';
        font-family: 'element-icons';
        font-size: 12px;
        font-weight: 200;
        margin-right: 5px;
        vertical-align: middle;
        line-height: 13px;
        color: white;
      }
    }
    .page {
      float: right;
    }
  }
}
</style>
