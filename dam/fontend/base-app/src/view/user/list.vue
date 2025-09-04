<template>
  <div class="tab-page tab-page-ver2 user-manage-list">
    <div class="row-inner">
      <!-- <span class="label">模糊搜索</span> -->
      <datablau-input
        :iconfont-state="true"
        clearable
        v-model="keyword"
        class="inner-input"
        :placeholder="$t('common.placeholder.normal')"
      ></datablau-input>
      <datablau-checkbox2
        v-model="showAllUser"
        class="show-all-user"
        :options="optionsTrue"
        :option-keys="optionKeys"
      ></datablau-checkbox2>
    </div>
    <div class="page-btn-group right-top">
      <!-- <datablau-button
          type="secondary"
          size="mini"
          @click="refresh"
          style="width: 73px"
        >
          <i class="el-icon-refresh"></i>
          刷新
        </datablau-button> -->
      <datablau-button
        type="important"
        size="small"
        v-if="!$prohibitResetPassword"
        @click="addTab"
        class="iconfont icon-tianjia"
      >
        {{ $t('system.user.create') }}
      </datablau-button>
    </div>
    <!-- 使用datablau-form-submit组件，设置表格的翻页是动态的 -->
    <datablau-form-submit style="margin-top: 44px">
      <datablau-table
        ref="multipleTable"
        class="datablau-table user-list-table"
        :data="dataDisplay"
        show-overflow-tooltip
        size="small"
        height="100%"
        @selection-change="handleSelectionChange"
        :data-selectable="true"
        :show-column-selection="false"
        :checkDisabledObj="checkDisabledObj"
      >
        <el-table-column
          prop="username"
          :label="$t('system.user.loginName')"
          min-width="100px"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <datablau-list-icon dataType="icon-userlogo"></datablau-list-icon>
            {{ scope.row.username }}
          </template>
        </el-table-column>
        <el-table-column
          prop="fullUserName"
          :label="$t('system.user.fullName')"
          min-width="100px"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="gender"
          :label="$t('system.user.gender')"
          align="center"
        >
          <template slot-scope="scope">
            <img
              :src="[
                !!scope.row.gender
                  ? scope.row.gender === '男'
                    ? maleImg
                    : femaleImg
                  : '',
              ]"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="emailAddress"
          label="Email"
          min-width="145px"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="phoneNumber"
          :label="$t('system.user.phone')"
          align="center"
          width="120"
        ></el-table-column>
        <el-table-column
          prop="creationTimestamp"
          min-width="125px"
          :formatter="$timeFormatter"
          :label="$t('system.user.creationTime')"
        ></el-table-column>
        <el-table-column
          prop="enabled"
          :label="$t('system.user.status')"
          width="100"
        >
          <template slot-scope="scope">
            <datablau-switch
              v-model="scope.row.enabled"
              :active-value="true"
              :inactive-value="false"
              :disabled="scope.row.username === $user.username"
              @change="changeEnabled(scope)"
            ></datablau-switch>
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('system.user.operation')"
          header-align="center"
          align="center"
          width="100"
          fixed="right"
        >
          <template slot-scope="scope">
            <datablau-button
              size="small"
              type="text"
              @click="editDetail(scope.row)"
            >
              <datablau-tooltip
                effect="dark"
                :content="$t('common.button.edit')"
                placement="bottom"
                style="margin-right: 6px"
              >
                <i class="iconfont icon-bianji"></i>
              </datablau-tooltip>
            </datablau-button>
          </template>
        </el-table-column>
        <!-- <el-table-column width="10"></el-table-column> -->
      </datablau-table>
      <template slot="buttons">
        <div class="user-row-page-footer" v-show="!deleteDisabled">
          <span class="check-info"></span>
          <span class="footer-span">
            {{ $t('system.user.countMessage', [multipleSelection.length]) }}
          </span>
          <datablau-button
            :type="'danger'"
            size="small"
            class="footer-button"
            @click="disabledUsers"
          >
            {{ $t('common.button.disable') }}
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
  </div>
</template>

<script>
import list from './list.js'
export default list
</script>

<style lang="scss" scoped>
@import './list.scss';
</style>
