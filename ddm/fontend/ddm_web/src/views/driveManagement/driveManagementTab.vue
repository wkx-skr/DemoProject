<template>
  <div id="data-source" class="tab-page tabPageAbs" style="top:0">
    <div class="table-row" style="">
      <datablau-table
        class="datablau-table"
        ref="dsTableTypeLis"
        v-loading="loadingDS"
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
                <p>{{$v.drive.defaultDriver + '：'}}</p>
                <el-select size="mini" @change="handleDefaultDriverChange" v-model="defaultDriverValue"
                           :placeholder="$v.drive.pleaseSelect">
                  <el-option
                    v-for="item in defaultDriverArr"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
              </div>
              <div style="max-height:200px;overflow: auto;" v-if="!loadingDS2">
                <el-table
                  class="datablau-table"
                  ref="dsTable"
                  v-loading="loadingDS2"
                  :data="displayData"
                  height="100%"
                  highlight-current-row
                  :row-style="{background:'#fafafa'}"
                  :header-cell-style="{background:'#fafafa'}"
                >
                  <el-table-column
                    :label="$v.drive.driveName"
                    min-width="180"
                    prop="driverName"
                    show-overflow-tooltip>
                    <template slot-scope="scope">
                      <p style="margin-left:10px">{{ scope.row.driverName }}</p>
                      <div class="builtInDriverStyle" v-if="props.row.builtInDriver === scope.row.driverName">
                        {{$v.drive.builtIin}}
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column
                    :label="$v.drive.driverClassName"
                    min-width="180"
                    prop="driverClassName"
                    show-overflow-tooltip>
                  </el-table-column>
                  <el-table-column
                    :label="$v.drive.driveFile"
                    min-width="180"
                    prop="storedFileName"
                    show-overflow-tooltip>
                  </el-table-column>
                  <el-table-column
                    prop="creationTime"
                    :label="$version.tableHeader.createTime"
                    min-width="130"
                    :formatter="$timeFormatter"
                    show-overflow-tooltip>
                  </el-table-column>
                  <el-table-column
                    :label="$v.drive.operation"
                    width="130"
                    header-align="center"
                    align="center"
                    fixed="right"
                  >
                    <template slot-scope="scope">
                      <div class="tool">
                        <el-button
                          type="text"
                          size="small"
                          class="btn-in-table"
                          :disabled="props.row.builtInDriver === scope.row.driverName"
                          @click="handleDelete(scope.row)">
                          {{ $v.drive.delete }}
                        </el-button>
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
            <!-- <el-table
              class="datablau-table"
              ref="dsTable"
              v-loading="loadingDS"
              :data="displayData"
              row-key="modelId"
              height="100%"
              highlight-current-row
            >
              <el-table-column
                label="驱动名称"
                min-width="180"
                prop="driverName"
                show-overflow-tooltip>
              </el-table-column>
              <el-table-column
                label="驱动类名称"
                min-width="180"
                prop="driverClassName"
                show-overflow-tooltip>
              </el-table-column>
              <el-table-column
                label="驱动文件"
                min-width="180"
                prop="storedFileName"
                show-overflow-tooltip>
              </el-table-column>
              <el-table-column
                prop="creationTime"
                :label="$version.tableHeader.createTime"
                min-width="130"
                :formatter="$timeFormatter"
                show-overflow-tooltip>
              </el-table-column>
              <el-table-column
                :label="$version.tableHeader.operation" width="130" header-align="right" align="right" >
                <template slot-scope="scope">
                  <div class="tool" >
                      <el-button
                        type="text"
                        size="small"
                        class="btn-in-table"
                        @click="handleDelete(scope.row)">
                        删除
                      </el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table> -->
          </template>
        </el-table-column>
        <el-table-column
          :label="$v.drive.databaseType"
          min-width="180"
          prop="type"
          show-overflow-tooltip>
          <template slot-scope="scope">
            <database-type style="margin-left:10px" :key="scope.row.type" :value="scope.row.type"
                           :size="24"></database-type>
          </template>
        </el-table-column>
        <el-table-column
          :label="$v.drive.numberOfDrives"
          min-width="180"
          prop="driverCountByType"
          show-overflow-tooltip>
        </el-table-column>
        <el-table-column
          :label="$v.drive.builtInDriver"
          min-width="180"
          prop="builtInDriver"
          show-overflow-tooltip>
        </el-table-column>
        <el-table-column
          :label="$v.drive.CurrentDefaultDriver"
          prop="defaultDriver"
          show-overflow-tooltip>
        </el-table-column>
        <el-table-column
          :label="$v.drive.operation"
          width="130"
          header-align="center"
          align="center"
          fixed="right"
        >
          <template slot-scope="scope">
            <div class="tool" style="margin-right:10px">
              <el-button
                type="text"
                size="small"
                :title="$version.button.edit"
                class="btn-in-table"
                @click="addDs(scope.row)">
                {{ $v.drive.addDriver }}
              </el-button>
            </div>
          </template>
        </el-table-column>
      </datablau-table>
    </div>
  </div>
</template>

<script>
import js from './driveManagementTab.js'

export default js
</script>
<style lang="scss">
.el-table.datablau-table tr.current-row td, .el-table.datablau-table tr.current-row + tr td {
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
.tab-page.tabPageAbs .table-row {
  position: absolute;
  top: 0;
  bottom: 20px;
  left: 20px;
  right: 20px;
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
  color: #409eff;;
  width: 56px;
  height: 26px;
  line-height: 22px;
  text-align: center;
  border-radius: 2px;
  margin-left: 8px;
}

</style>
