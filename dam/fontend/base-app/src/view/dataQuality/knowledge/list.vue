<template>
  <div class="tab-page tab-page-ver2">
    <div style="min-width: 800px; position: relative; margin-left: 20px">
      <div class="row-inner">
        <!--        <span class="label">模糊搜索</span>-->
        <datablau-select
          v-model="searchType"
          @change="handleSearchTypeChange"
          style="
            display: inline-block;
            margin-right: 10px;
            vertical-align: bottom;
          "
          :style="{ width: $i18n.locale === 'zh' ? '11em' : '200px' }"
        >
          <el-option
            value="name"
            :label="$t('quality.page.knowledgebase.fileNameSearch')"
          ></el-option>
          <el-option
            value="rule"
            :label="$t('quality.page.knowledgebase.ruleSearch')"
          ></el-option>
        </datablau-select>
        <datablau-input
          maxlength="100"
          clearable
          v-model="keyword"
          style="
            width: 240px;
            min-width: 150px;
            margin-right: 1em;
            display: inline-block;
          "
          :iconfont-state="true"
          :placeholder="$t('quality.page.knowledgebase.placeholderWord')"
        ></datablau-input>
      </div>
      <div style="position: absolute; right: 20px; top: 0">
        <datablau-button type="secondary" @click="refresh">
          <i class="el-icon-refresh"></i>
          {{ $t('quality.page.knowledgebase.refresh') }}
        </datablau-button>
        <datablau-button
          type="important"
          @click="addTab"
          v-if="$auth['QUALITY_KBM_ADD']"
        >
          {{ $t('quality.page.knowledgebase.add') }}
        </datablau-button>
      </div>
    </div>
    <datablau-form-submit style="margin-top: 44px">
      <datablau-table
        :data="dataDisplay"
        ref="multipleTable"
        height="100%"
        style="min-width: 800px"
        @selection-change="handleSelectionChange"
        :data-selectable="option.selectable"
        :auto-hide-selection="option.autoHideSelectable"
        :show-column-selection="option.showColumnSelection"
        :column-selection="option.columnSelection"
        :border="option.columnResizable"
      >
        <!-- <el-table-column width="8"></el-table-column> -->
        <!-- <el-table-column
          width="26"
        >
          <template slot-scope="scope">
            <span class="tree-icon knowledge"></span>
          </template>
        </el-table-column> -->
        <el-table-column width="18">
          <datablau-icon
            :data-type="'knowledge'"
            :size="18"
            style="margin-top: 8px"
          ></datablau-icon>
        </el-table-column>
        <el-table-column
          show-overflow-tooltip
          prop="title"
          :label="$t('quality.page.knowledgebase.table.title')"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="techRules"
          :formatter="ruleFormatter"
          show-overflow-tooltip
          :label="$t('quality.page.knowledgebase.table.techRules')"
        ></el-table-column>
        <el-table-column
          prop="lastModifyTime"
          :label="$t('quality.page.knowledgebase.table.lastModifyTime')"
          :formatter="$timeFormatter"
          width="190"
        ></el-table-column>
        <el-table-column
          prop="lastModifier"
          :label="$t('quality.page.knowledgebase.table.lastModifier')"
        >
          <template slot-scope="scope">
            <span>{{ getPeopleName([scope.row.lastModifier]) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('quality.page.knowledgebase.table.operation')"
          align="center"
          width="120"
          fixed="right"
        >
          <template slot-scope="scope">
            <datablau-button
              :title="$t('common.button.scan')"
              type="icon"
              @click="handleRowClick(scope.row)"
            >
              <i class="iconfont icon-see"></i>
            </datablau-button>
            <datablau-button
              type="icon"
              v-if="$auth['QUALITY_KBM_EDIT']"
              :title="$t('common.button.edit')"
              @click.prevent.stop="handleEdit(scope.$index)"
            >
              <!--                <i class="icon-edit"></i>-->
              <i class="iconfont icon-bianji"></i>
            </datablau-button>
          </template>
        </el-table-column>
        <el-table-column
          v-if="hasAccess"
          width="10"
          fixed="right"
        ></el-table-column>
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
            v-if="$auth['QUALITY_KBM_DELETE']"
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
          layout="total, sizes, prev, pager, next, jumper"
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

<style lang="scss" scoped="scoped">
@import './list.scss';
</style>
