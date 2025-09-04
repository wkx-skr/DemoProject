<template>
  <datablau-dialog
    custom-class="standard-dialog-page"
    :title="title"
    :visible="showItem"
    v-if="showItem"
    :before-close="closeDialog"
    width="960px"
    :height="height"
    :table="true"
    ref="standardDialog"
  >
    <div class="standard-box">
      <div class="standard-content">
        <div class="tree-box lazy-tree-box">
          <classify-tree
            :clickChild="classifyTree"
            :isNeed="true"
          ></classify-tree>
        </div>
        <div class="right-standard-box">
          <div class="table-seach">
            <datablau-input
              style="width: 240px; display: inline-block; vertical-align: top"
              clearable
              :iconfont-state="true"
              :placeholder="$t('intelligence.searchInfoItem')"
              v-model="key"
            ></datablau-input>
            <datablau-button
              type="normal"
              @click="qureySure"
              style="
                display: inline-block;
                margin-left: 8px;
                vertical-align: top;
              "
            >
              {{ $t('securityModule.search') }}
            </datablau-button>
          </div>
          <div class="table-box">
            <datablau-table
              v-loading="loading"
              :loading="loading"
              :data="tableData"
              ref="table"
              class="datablau-table table"
              height="100%"
              show-overflow-tooltip
              :show-column-selection="false"
              :data-selectable="false"
              :single-select="true"
              @selection-change="singleSelect"
              :header-cell-style="{
                color: '#494850',
                'font-size': '12px',
                'font-weight': 'bold',
              }"
              :row-key="getRowKeys"
              :reserve-selection="true"
            >
              <!-- <el-table-column
                type="selection"
                width="20"
                :selectable="row => row.itemId !== infoItemId"
                :reserve-selection="true"
              ></el-table-column> -->
              <el-table-column width="28">
                <template slot-scope="scope">
                  <datablau-icon
                    :data-type="'infoitems'"
                    :size="20"
                    style="position: relative; top: 3px"
                  ></datablau-icon>
                </template>
              </el-table-column>
              <el-table-column
                :min-width="120"
                prop="name"
                :label="$t('intelligence.infoItemName')"
                show-overflow-tooltip
              >
                <!-- <template slot-scope="scope">
                  {{ getName(scope.row) }}
                </template> -->
              </el-table-column>
              <el-table-column
                :min-width="120"
                prop="stdCode"
                :label="$t('intelligence.infoItemCode')"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                :min-width="120"
                prop="sensitiveCatalogName"
                :label="$t('intelligence.infoItemThema')"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                :min-width="120"
                prop="businessDepartment"
                :label="$t('securityModule.businessDefinition')"
                show-overflow-tooltip
              ></el-table-column>
            </datablau-table>
          </div>
        </div>
      </div>
    </div>
    <div slot="footer" class="footer">
      <datablau-pagination
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
        :current-page="pagination.page"
        :page-sizes="[20, 50, 100, 200]"
        :page-size="pagination.size"
        layout="total, sizes, prev, pager, next"
        :pager-count="5"
        class="page"
        :total="total"
      ></datablau-pagination>
      <div class="footer-btn">
        <datablau-button type="secondary" @click="closeDialog">
          {{ $t('securityModule.cancel') }}
        </datablau-button>
        <datablau-button
          type="primary"
          @click="submitAssets"
          :disabled="selectedAssets.length === 0"
        >
          {{ $t('securityModule.sure') }}
        </datablau-button>
      </div>
    </div>
  </datablau-dialog>
</template>

<script>
import addItem from './addItem.js'
export default addItem
</script>

<style scoped lang="scss">
.standard-box {
  width: 100%;
  height: 395px;
  .selected-items {
    width: 100%;
    max-height: 60px;
    overflow-y: scroll;
    padding-bottom: 10px;
  }
  .standard-content {
    height: 395px;
    .tree-box {
      height: 100%;
      width: 210px;
      overflow-y: auto;
      padding: 10px 0;
      box-sizing: border-box;
      border: 1px solid #ddd;
      float: left;
      position: relative;
      /deep/ .tree-search-box {
        .datablau-select {
          position: absolute;
          top: 0px;
          left: 10px;
          right: 10px;
        }
      }
      /deep/ .tree-inner-box {
        left: 0px;
        right: 0px;
      }
    }
    .right-standard-box {
      width: 700px;
      height: 100%;
      float: left;
      margin-left: 10px;
      box-sizing: border-box;
      position: relative;
      .table-seach {
      }
      .table-box {
        position: absolute;
        top: 44px;
        bottom: 0;
        left: 0;
        right: 0;
        /deep/ .has-gutter {
          .el-checkbox {
            display: none;
          }
        }
      }
    }
  }
}
.footer {
  .page {
    float: left;
  }
  .footer-btn {
    float: right;
  }
}
</style>
<style lang="scss">
.standard-dialog-page {
  .datablau-dialog-content {
    overflow: hidden !important;
  }
}
</style>
