<template>
  <div>
    <div class="top-back-line">
      <datablau-breadcrumb
        style="height: auto; line-height: initial; display: inline-block"
        :node-data="nodeData"
        @back="backToFolder"
      ></datablau-breadcrumb>
    </div>
    <div
      style="position: absolute; top: 54px; left: 20px; right: 20px; bottom: 0"
    >
      <datablau-list-search class="search-outer">
        <datablau-input
          type="text"
          clearable
          maxlength="100"
          size="mini"
          style="width: 200px !important"
          v-model="keywords"
          placeholder="搜索规则名称"
        ></datablau-input>
        <template slot="buttons">
          <div style="margin-right: 20px">
            <datablau-button @click="addRow" class="iconfont icon-tianjia">
              新建
            </datablau-button>
          </div>
        </template>
      </datablau-list-search>
      <datablau-form-submit style="top: 34px; left: -20px; right: -20px">
        <datablau-table class="datablau-table thin" :data="tableData">
          <el-table-column
            label=""
            :width="56"
            show-overflow-tooltip
            align="right"
          >
            <template slot-scope="scope">
              <span
                class="builtInRuleType"
                :style="{
                  background: scope.row.builtInRule
                    ? 'rgba(111, 84, 235, 0.1)'
                    : 'rgba(78,190,247,0.1)',
                  color: scope.row.builtInRule ? '#6f54eb' : '#4ebef7',
                }"
              >
                {{ scope.row.builtInRule ? '内置' : '自定义' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            label="规则名称"
            prop="name"
            :min-width="150"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <span>
                {{ scope.row.name }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            label="规则类型"
            prop="techRuleType"
            :min-width="120"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <span>
                {{ searchQuery(scope.row.techRuleType) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="规则内容" prop="content" :min-width="120">
            <template slot-scope="scope">
              <el-popover placement="right" width="400" trigger="click">
                <datablau-detail-subtitle
                  title="规则内容"
                  mt="0px"
                  mb="8px"
                ></datablau-detail-subtitle>
                <div
                  style="
                    max-height: 300px;
                    overflow: auto;
                    word-wrap: break-word;
                    font-size: 12px;
                    padding-left: 8px;
                  "
                >
                  {{ scope.row.content }}
                </div>
                <p
                  style="
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    width: 100px;
                  "
                  slot="reference"
                  class="content-p-reference"
                >
                  {{ scope.row.content }}
                </p>
              </el-popover>
              <span></span>
            </template>
          </el-table-column>
          <el-table-column
            label="描述"
            prop="description"
            :min-width="120"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            label="创建人"
            prop="creator"
            :min-width="120"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            label="创建时间"
            prop="createTime"
            :min-width="200"
            :formatter="$timeFormatter"
            show-overflow-tooltip
          ></el-table-column>
          <!-- <el-table-column
            label="核验是否使用"
            prop="enable"
            :min-width="120"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <datablau-switch
                v-model="scope.row.enable"
                @change="changeEnableValue(scope.row)"
              ></datablau-switch>
            </template>
          </el-table-column> -->
          <el-table-column
            :label="$t('domain.common.operation')"
            fixed="right"
            :min-width="120"
            v-if="$auth['DATA_STANDARD_EDIT']"
          >
            <template slot-scope="scope">
              <datablau-button
                type="icon"
                :title="$t('domain.common.edit')"
                class="iconfont icon-bianji"
                :disabled="scope.row.builtInRule"
                @click="editRow(scope.row, scope.$index)"
              ></datablau-button>
              <datablau-button
                type="icon"
                class="iconfont icon-delete"
                :title="$t('domain.common.delete')"
                :disabled="scope.row.builtInRule"
                @click="deleteRow(scope.row, scope.$index)"
              ></datablau-button>
            </template>
          </el-table-column>
        </datablau-table>
        <template slot="buttons">
          <div class="left-btn"></div>
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
  </div>
</template>
<script>
import dataRuleManage from './dataRuleManage'
export default dataRuleManage
</script>
<style lang="scss" scope>
.manageBox {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #fff;
}
.top-back-line {
  height: 44px;
  margin: 0 20px;
  font-size: 16px;
  line-height: 44px;
  background: #fff;
  border-bottom: 1px solid #ddd;
}
.builtInRuleType {
  width: 44px;
  height: 24px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
}
.content-p-reference {
  &:hover {
    color: #409eff;
    cursor: pointer;
  }
}
</style>
