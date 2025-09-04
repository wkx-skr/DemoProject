<template>
  <div>
    <div
      style="position: absolute; top: 10px; left: 0; right: 0; bottom: 0"
      class="data-rule"
    >
      <div class="topBtns" v-if="!isAssets">
        <datablau-button
          @click="manage"
          type="secondary"
          class="iconfont icon-shezhi"
        >
          管理
        </datablau-button>
        <datablau-button @click="addRow" class="iconfont icon-tianjia">
          新建
        </datablau-button>
        <datablau-button @click="association" class="iconfont icon-binding">
          关联
        </datablau-button>
      </div>
      <div
        style="
          position: absolute;
          top: 44px;
          left: 0px;
          right: 0px;
          bottom: 60px;
        "
      >
        <datablau-table
          class="datablau-table thin"
          :data="tableData"
          height="100%"
        >
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
            v-if="$auth['DATA_STANDARD_EDIT'] && !isAssets"
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
                @click="deleteRow(scope.row, scope.$index)"
              ></datablau-button>
            </template>
          </el-table-column>
        </datablau-table>
      </div>
      <div
        style="
          width: 100%;
          position: absolute;
          bottom: 0px;
          right: 0;
          height: 50px;
          background: #fff;
          border-top: 1px solid #eee;
        "
      >
        <datablau-pagination
          class="pagination-component"
          @size-change="handleSizeChange"
          style="padding-top: 10px"
          @current-change="handleCurrentChange"
          :current-page.sync="currentPage"
          :page-sizes="[20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        ></datablau-pagination>
      </div>
    </div>
    <datablau-dialog
      title="引用数据规则"
      size="l"
      :visible.sync="associationVisible"
      height="500px"
    >
      <div
        style="
          position: absolute;
          top: 0;
          left: 20px;
          right: 20px;
          bottom: 0;
          overflow: hidden;
        "
      >
        <datablau-table
          :data-selectable="true"
          @selection-change="handleSelectionChange"
          class="datablau-table thin"
          :data="associationData"
          height="100%"
          :auto-hide-selection="false"
        >
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
          <el-table-column
            label="描述"
            prop="description"
            :min-width="120"
            show-overflow-tooltip
          ></el-table-column>
        </datablau-table>
      </div>
      <div slot="footer">
        <div>
          <datablau-pagination
            style="display: inline-block; float: left"
            class="pagination-component"
            @size-change="handleSizeChangeAss"
            @current-change="handleCurrentChangeAss"
            :current-page.sync="currentPageAss"
            :page-sizes="[20, 50, 100]"
            :page-size="pageSizeAss"
            :pager-count="5"
            layout="total, sizes, prev, pager, next, jumper"
            :total="totalAss"
          ></datablau-pagination>
        </div>
        <datablau-button
          type="primary"
          @click="domainRuleBind"
          :disabled="selectionAssData.length === 0"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
        <datablau-button type="secondary" @click="closeAssociationVisible">
          {{ $t('common.button.cancel') }}
        </datablau-button>
      </div>
    </datablau-dialog>
  </div>
</template>
<script>
import dataRule from './dataRule'
export default dataRule
</script>
<style lang="scss" scope>
.data-rule {
  text-align: right;
  .star {
    color: red;
  }
  .hasStar {
    &::before {
      position: absolute;
      top: -4px;
      left: 4px;
      content: '*';
      color: red;
    }
  }
  .hasStarInput {
    &::before {
      position: absolute;
      top: -7px;
      left: -6px;
      content: '*';
      color: red;
      z-index: 99;
    }
  }
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
</style>
