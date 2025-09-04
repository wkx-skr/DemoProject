<template>
  <div id="data-source" class="tab-page tabPageAbs" style="top: 0">
    <div class="table-row" style="top: 0; bottom: 10px">
      <datablau-table
        class="datablau-table-info"
        ref="dsTableTypeLis"
        :data="driverTypeList"
        height="100%"
        highlight-current-row
        :key="dsDataKey"
        row-key="type"
        :expand-row-keys="expandRowKeys"
        @row-click="handleRowClick"
        @expand-change="expandChange"
      >
        <el-table-column type="expand" :width="16">
          <template slot-scope="props">
            <div class="classificationList">
              <div class="defaultDriver">
                <p>{{ $t('meta.driveManage.default') }}：</p>
                <datablau-select-weak
                  size="mini"
                  :optionsData="optionsData"
                  @change="handleDefaultDriverChange"
                  v-model="defaultDriverValue"
                  :placeholder="$t('meta.common.pleaseSelect')"
                ></datablau-select-weak>
              </div>
              <div style="max-height: 200px; overflow: auto" v-if="!loadingDS2">
                <datablau-table
                  class="datablau-table"
                  ref="dsTable"
                  v-loading="loadingDS2"
                  :data="displayData"
                  height="100%"
                  highlight-current-row
                  :row-style="{ background: '#fafafa' }"
                  :header-cell-style="{ background: '#fafafa' }"
                >
                  <el-table-column
                    :label="$t('meta.driveManage.name')"
                    min-width="180"
                    prop="driverName"
                    show-overflow-tooltip
                  >
                    <template slot-scope="scope">
                      <p style="margin-left: 10px">
                        {{ scope.row.driverName }}
                      </p>
                      <div
                        class="builtInDriverStyle"
                        v-if="props.row.builtInDriver === scope.row.driverName"
                      >
                        {{ $t('meta.driveManage.built-in') }}
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column
                    :label="$t('meta.driveManage.driverClassName')"
                    min-width="180"
                    prop="driverClassName"
                    show-overflow-tooltip
                  ></el-table-column>
                  <el-table-column
                    :label="$t('meta.driveManage.driverFile')"
                    min-width="180"
                    prop="storedFileName"
                    show-overflow-tooltip
                  ></el-table-column>
                  <el-table-column
                    prop="creationTime"
                    :label="$t('meta.driveManage.createTime')"
                    min-width="130"
                    :formatter="$timeFormatter"
                    show-overflow-tooltip
                  ></el-table-column>
                  <el-table-column
                    :label="$t('meta.driveManage.operation')"
                    width="130"
                    header-align="center"
                    align="center"
                  >
                    <template slot-scope="scope">
                      <div class="tool">
                        <el-button
                          type="text"
                          size="small"
                          class="btn-in-table"
                          :disabled="
                            props.row.builtInDriver === scope.row.driverName
                          "
                          @click="handleDelete(scope.row)"
                        >
                          {{ $t('common.button.delete') }}
                        </el-button>
                      </div>
                    </template>
                  </el-table-column>
                </datablau-table>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('meta.driveManage.dbType')"
          min-width="180"
          prop="type"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <database-type
              style="margin-left: 10px"
              :key="scope.row.type"
              :value="scope.row.type"
              :size="24"
            ></database-type>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('meta.driveManage.driverNum')"
          min-width="180"
          prop="driverCountByType"
          show-overflow-tooltip
        ></el-table-column>
        <!--        <el-table-column
          :label="$t('meta.driveManage.innerDriver')"
          min-width="180"
          prop="builtInDriver"
          show-overflow-tooltip
        ></el-table-column>-->
        <el-table-column
          :label="$t('meta.driveManage.defaultDriver')"
          prop="defaultDriver"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :label="$t('meta.driveManage.operation')"
          width="130"
          header-align="center"
          align="center"
        >
          <template slot-scope="scope">
            <div class="tool" style="margin-right: 10px">
              <datablau-button
                type="text"
                size="small"
                :title="$t('common.button.edit')"
                class="btn-in-table"
                @click="addDs(scope.row)"
              >
                {{ $t('meta.driveManage.add') }}
              </datablau-button>
            </div>
          </template>
        </el-table-column>
      </datablau-table>
    </div>
    <!-- <div class="footer-row">
      <el-pagination
        style="float:right;"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="currentPage"
        :page-sizes="[20, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </div> -->
  </div>
</template>

<script>
import js from './driveManagementTab.js'
export default js
</script>
<style lang="scss">
.el-table.datablau-table tr.current-row td,
.el-table.datablau-table tr.current-row + tr td {
  border-top: 1px solid var(--border-color-lighter) !important;
}
.el-table__expand-icon > .el-icon {
  z-index: 999;
}
.el-table tr {
  cursor: pointer;
}
</style>
<style lang="scss" scoped>
.table-row {
  padding: 0 20px;
}
.classificationList {
  background: rgb(250, 250, 250);
  padding: 20px 30px 10px 30px;
  // max-height: 600px;
  p {
    display: inline-block;
  }
  .defaultDriver {
    display: inline-block;
    margin-left: 10px;
    margin-bottom: 10px;
  }
}
.builtInDriverStyle {
  display: inline-block;
  border: 1px solid #409eff;
  color: #409eff;
  width: 42px;
  height: 22px;
  line-height: 20px;
  text-align: center;
  border-radius: 2px;
  margin-left: 8px;
}
.tab-page {
  .datablau-table-info {
    height: 100%;
  }
}
</style>
