<template>
  <div class="tab-page tab-page-ver2 group-list">
    <div class="">
      <div class="group-row-inner">
        <!-- <span class="label">模糊搜索</span> -->
        <datablau-input
          :iconfont-state="true"
          clearable
          v-model="keyword"
          class="inner-input"
          :placeholder="$t('common.placeholder.normal')"
        ></datablau-input>
      </div>
      <div class="page-btn-group right-top">
        <datablau-button
          type="important"
          size="small"
          class="iconfont icon-tianjia"
          @click="addTab"
        >
          {{ $t('system.group.create') }}
        </datablau-button>
      </div>
    </div>
    <datablau-form-submit style="margin-top: 44px">
      <datablau-table
        :data="dataDisplay"
        class="datablau-table group-table"
        ref="multipleTable"
        height="100%"
        @selection-change="handleSelectionChange"
        :data-selectable="true"
        :show-column-selection="false"
      >
        <el-table-column
          prop="name"
          :label="$t('system.group.name')"
        >
          <template slot-scope="scope">
            <datablau-list-icon dataType="icon-jiaose"></datablau-list-icon>
            {{ scope.row.name }}
          </template>
        </el-table-column>
        <el-table-column
          prop="description"
          :label="$t('system.group.description')"
          show-overflow-tooltip
        ></el-table-column>

        <el-table-column
          :label="$t('system.group.operation')"
          header-align="center"
          align="right"
          width="80"
          fixed="right"
        >
          <template slot-scope="scope">
            <datablau-button
              size="small"
              type="text"
              @click="editDetail(scope.$index)"
            >
              <datablau-tooltip
                effect="dark"
                :content="$t('common.button.edit')"
                placement="bottom"
                style="margin-right: 6px"
              >
                <i class="iconfont icon-bianji"></i>
              </datablau-tooltip>
              <!-- 编辑 -->
            </datablau-button>
          </template>
        </el-table-column>
      </datablau-table>
      <!-- 设置下面的翻页 -->
      <template slot="buttons">
        <div class="group-row-page-footer" v-show="!deleteDisabled">
          <span class="check-info"></span>
          <span class="footer-span">
            {{
              $t('common.deleteMessage', {
                selection: multipleSelection.length,
              })
            }}
          </span>
          <datablau-button
            type="danger"
            size="small"
            class="iconfont icon-delete delete"
            @click="preDeleteRows"
          >
            {{ $t('common.button.delete') }}
          </datablau-button>
        </div>
        <datablau-pagination
          class="page"
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
    <!-- <div class="table-row">

    </div>
    <div class="footer-row">

    </div> -->
  </div>
</template>

<script>
import list from './list.js'
export default list
</script>

<style lang="scss" scoped>
@import './list.scss';
</style>
