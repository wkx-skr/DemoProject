<template>
  <div class="organization-manage">
    <datablau-tabs
      v-model="activeName"
      @tab-click="handleClick"
      :before-leave="beforeLeaveTab"
      class="manage-tab"
    >
      <el-tab-pane :label="$t('system.organization.basic')" name="first">
        <div class="form-part">
          <div v-if="isEdit" class="top-title">
            {{ $t('system.organization.create') }}
          </div>
          <datablau-form-submit>
            <div style="padding: 50px 0">
              <datablau-form
                label-width="180px"
                v-show="!showLeftMag"
                ref="addForm"
              >
                <el-form-item
                  :label="$t('system.organization.property.organizationCode')"
                >
                  <span style="padding-left: 20px">{{ form.bm }}</span>
                </el-form-item>
                <el-form-item
                  :label="
                    $t('system.organization.property.organizationFullName')
                  "
                >
                  <span style="padding-left: 20px">{{ form.fullName }}</span>
                </el-form-item>
                <el-form-item
                  :label="
                    $t('system.organization.property.organizationAbbreviation')
                  "
                >
                  <span style="padding-left: 20px">{{ form.simpleName }}</span>
                </el-form-item>
                <el-form-item
                  :label="$t('system.organization.property.principalLeader')"
                >
                  <span style="padding-left: 20px">{{ form.leaderName }}</span>
                </el-form-item>
                <el-form-item
                  :label="$t('system.organization.property.deputyLeader')"
                >
                  <span style="padding-left: 20px">
                    {{ form.deputyLeaderName }}
                  </span>
                </el-form-item>
                <el-form-item
                  :label="$t('system.organization.property.updateTime')"
                  v-if="toEdit && !isEdit"
                >
                  <span style="padding-left: 20px">
                    {{ $timeFormatter(form.updateTime) }}
                  </span>
                </el-form-item>
              </datablau-form>
              <datablau-form
                v-show="showLeftMag"
                label-width="180px"
                :model="form"
                ref="addForm"
                :rules="rules"
                :disabled="isDisabled"
              >
                <el-form-item
                  :label="$t('system.organization.property.organizationCode')"
                  prop="bm"
                >
                  <datablau-input
                    v-if="form.bm || isEdit"
                    clearable
                    maxlength="100"
                    type="text"
                    :placeholder="
                      $t('common.placeholder.prefix') +
                      $t('system.organization.property.organizationCode')
                    "
                    v-model="form.bm"
                    :disabled="!isEdit"
                    :class="{
                      noClick: isEdits == true ? true : false,
                      'user-group-input': true,
                    }"
                  ></datablau-input>
                  <!-- <el-input v-else clearable maxlength="100" type="text" placeholder="请输入机构编码" v-model="toBm2"></el-input> -->
                  <!-- <el-input clearable maxlength="100" type="text" placeholder="请输入机构编码" v-model="form.bm"></el-input> -->
                </el-form-item>
                <el-form-item
                  :label="
                    $t('system.organization.property.organizationFullName')
                  "
                  prop="fullName"
                >
                  <datablau-input
                    clearable
                    maxlength="100"
                    type="text"
                    :placeholder="
                      $t('common.placeholder.prefix') +
                      $t('system.organization.property.organizationFullName')
                    "
                    v-model="form.fullName"
                    class="user-group-input"
                  ></datablau-input>
                </el-form-item>
                <el-form-item
                  :label="
                    $t('system.organization.property.organizationAbbreviation')
                  "
                  prop="simpleName"
                >
                  <datablau-input
                    clearable
                    maxlength="100"
                    type="text"
                    :placeholder="
                      $t('common.placeholder.prefix') +
                      $t(
                        'system.organization.property.organizationAbbreviation'
                      )
                    "
                    v-model="form.simpleName"
                    class="user-group-input"
                  ></datablau-input>
                </el-form-item>
                <el-form-item
                  :label="$t('system.organization.property.principalLeader')"
                  prop="leader"
                >
                  <!-- readonly -->
                  <datablau-input
                    clearable
                    maxlength="100"
                    type="text"
                    :placeholder="
                      $t('common.placeholder.prefix') +
                      $t('system.organization.property.principalLeader')
                    "
                    v-model="form.leaderName"
                    class="user-group-input"
                    @clear="clearOwner(1)"
                    @focus="selectOwner(1)"
                    @change="clearOwner(1)"
                  ></datablau-input>
                </el-form-item>
                <el-form-item
                  :label="$t('system.organization.property.deputyLeader')"
                  prop="deputyLeader"
                >
                  <datablau-input
                    clearable
                    maxlength="100"
                    type="text"
                    :placeholder="
                      $t('common.placeholder.prefix') +
                      $t('system.organization.property.deputyLeader')
                    "
                    v-model="form.deputyLeaderName"
                    class="user-group-input"
                    @clear="clearOwner(2)"
                    @focus="selectOwner(2)"
                    @change="clearOwner(2)"
                  ></datablau-input>
                </el-form-item>
                <el-form-item
                  :label="$t('system.organization.property.updateTime')"
                  v-if="toEdit && !isEdit"
                >
                  <datablau-datePicker
                    :key="form.updateTime"
                    :datePickerType="'datetime'"
                    :disabled="true"
                    :dateTime="form.updateTime"
                    v-model="form.updateTime"
                    placeholder=""
                    class="tab-pane-data-picker"
                  ></datablau-datePicker>
                </el-form-item>
                <el-form-item></el-form-item>
              </datablau-form>
            </div>
            <div slot="buttons">
              <div v-if="!isEdit">
                <datablau-button
                  v-show="toEdit"
                  type="important"
                  size="mini"
                  style="width: 74px"
                  @click="showEdit"
                >
                  {{ $t('common.button.edit') }}
                </datablau-button>
                <!-- <datablau-button
                v-show="toEdit"
                type="important"
                style="width: 74px;"
                @click="deleteOrganization"
                size="mini"
              >
                删除
              </datablau-button> -->
                <datablau-button
                  v-show="!toEdit"
                  type="important"
                  size="mini"
                  style="width: 74px"
                  @click="editOrganization"
                >
                  {{ $t('common.button.save') }}
                </datablau-button>
                <datablau-button
                  v-if="!toEdit"
                  type="secondary"
                  size="mini"
                  style="width: 74px"
                  @click="backEdit"
                >
                  {{ $t('common.button.cancel') }}
                </datablau-button>
              </div>
              <div v-if="isEdit">
                <datablau-button
                  type="important"
                  style="width: 74px"
                  @click="save"
                  size="mini"
                >
                  {{ $t('common.button.save') }}
                </datablau-button>
                <datablau-button
                  type="secondary"
                  style="width: 74px"
                  @click="cancel"
                  size="mini"
                >
                  {{ $t('common.button.cancel') }}
                </datablau-button>
              </div>
            </div>
          </datablau-form-submit>
        </div>
      </el-tab-pane>
      <el-tab-pane
        :label="$t('system.organization.members')"
        name="second"
        v-if="!isAdd"
        ref="tabStaff"
      >
        <div class="top-select">
          <datablau-input
            maxlength="100"
            :iconfont-state="true"
            style="
              width: 280px;
              position: relative;
              top: -1px;
              display: inline-block;
            "
            v-model="keyword"
            clearable
            :placeholder="$t('system.organization.placeholder.userSearch')"
          ></datablau-input>
          <datablau-checkbox2
            v-model="checked"
            :options="optionsTrue"
            :option-keys="optionKeys"
            @change="showOnlyUse"
            style="display: inline-block; margin-left: 10px"
          ></datablau-checkbox2>

          <datablau-button
            type="important"
            style="width: 110px; position: absolute; right: 0"
            size="mini"
            @click="selectOwner2()"
          >
            {{ $t('system.organization.newMember') }}
          </datablau-button>
        </div>
        <datablau-form-submit style="margin-top: 54px">
          <datablau-table
            class="datablau-table table"
            show-overflow-tooltip
            :show-column-selection="false"
            height="100%"
            v-loading="tableLoading"
            :data="staffData"
          >
            <el-table-column
              :label="$t('system.organization.property.idx')"
              type="index"
              width="50"
            ></el-table-column>
            <el-table-column
              :label="$t('system.user.loginName')"
              :width="$i18n.locale === 'zh' ? '' : 100"
              show-overflow-tooltip
            >
              <template slot-scope="scope">{{ scope.row.username }}</template>
            </el-table-column>
            <el-table-column
              :label="$t('system.user.fullName')"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                {{ scope.row.fullUserName }}
              </template>
            </el-table-column>

            <el-table-column
              :label="$t('system.user.organization')"
              prop="orgFullName"
              width="130"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              :label="$t('system.user.role')"
              show-overflow-tooltip
              min-width="100"
            >
              <template slot-scope="scope">
                {{ scope.row.roles.toString() }}
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('system.user.gender')"
              align="center"
              prop="gender"
              width="100"
            >
              <template slot-scope="scope">
                <img
                  :src="[
                    !!scope.row.gender
                      ? scope.row.gender === $t('system.user.male')
                        ? maleImg
                        : femaleImg
                      : '',
                  ]"
                />
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('system.user.title')"
              align="left"
              prop="title"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              :label="$t('system.user.phone')"
              align="center"
              prop="phoneNumber"
              min-width="100"
            ></el-table-column>
            <el-table-column
              :label="$t('system.user.email')"
              align="left"
              prop="emailAddress"
              min-width="120"
              show-overflow-tooltip
            ></el-table-column>
          </datablau-table>
          <template slot="buttons">
            <datablau-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page.sync="currentPage"
              :page-sizes="[20, 50, 100]"
              :page-size="pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total"
              class="page"
            ></datablau-pagination>
          </template>
        </datablau-form-submit>
      </el-tab-pane>
    </datablau-tabs>
  </div>
</template>

<script>
import tabPane from './tabPane.js'
export default tabPane
</script>
<style lang="scss">
.organization-manage {
  height: 100%;
  background-color: var(--default-bgc);
}
.manage-tab .el-tabs__content {
  height: 100% !important;
}
.manage-tab .el-tabs {
  height: 100% !important;
}
</style>
<style scoped lang="scss">
.manage-tab {
  margin-top: 10px;
  /deep/ .el-tabs__header {
    background-color: var(--default-bgc) !important;
    padding: 0 20px;
  }
}
/deep/ .manage-tab .el-tabs__content {
  height: calc(100% - 34px) !important;
}

.manage-tab {
  background: var(--default-bgc);
  position: absolute;
  right: 0;
  left: 0;
  bottom: 0;
  top: 0;
}
.el-tabs--border-card > .el-tabs__header .el-tabs__item.is-active {
  color: #6e9a3a !important;
}
.el-input {
  width: 300px;
}
.el-select {
  width: 300px;
}
.bottom-btn {
  margin: 30px 0 0 185px;
}
.top-btn {
  display: inline-block;
  margin-left: 40px;
}

.top-select {
  position: absolute;
  top: 10px;
  left: 20px;
  right: 20px;
  // width: 100%;
}
.table-part {
  position: absolute;
  top: 54px;
  left: 20px;
  right: 20px;
  bottom: 50px;
  .table {
    height: 100%;
  }
}
.page-part {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  // border-top: 1px solid var(--border-color-lighter);
  box-shadow: 0 -5px 14px -8px rgba(0, 0, 0, 0.2);
  .page {
    position: absolute;
    right: 20px;
    bottom: 10px;
  }
}
.form-part {
  margin: 30px 0 0 0px;
  /deep/ .el-form-item__label {
    line-height: 34px;
    height: 34px;
  }
}
.user-group-input {
  width: 300px !important;
  /deep/ .el-input {
    width: 100%;
  }
  /deep/ .el-input__inner {
    height: 34px !important;
    line-height: 34px !important;
    border-radius: 2px !important;
    padding-left: 10px !important;
  }
}
.tab-pane-data-picker {
  /deep/ .el-date-editor.el-input,
  .el-date-editor.el-input__inner {
    width: 300px !important;
  }
}
.top-title {
  position: absolute;
  top: 20px;
  font-size: 16px;
  font-weight: bold;
  left: 20px;
}
.staff-table {
  height: 350px;
  border-top: 1px solid #cecece;
}
.confirm-btn {
  position: absolute;
  bottom: 10px;
  right: 30px;
}
.noClick {
  background-color: #efefef;
}
</style>
