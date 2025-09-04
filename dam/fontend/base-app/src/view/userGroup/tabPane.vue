<template>
  <div class="user-group-tab">
    <datablau-tabs
      v-if="editWholeTreeData"
      class="tab-card2"
      v-model="activeName"
      @tab-click="handleClick"
      :class="{ tabCard3: isIEState === false }"
    >
      <el-tab-pane :label="$t('system.userGroup.basicInfo')" name="first">
        <div class="form-part">
          <datablau-form-submit>
            <div style="padding: 50px 0">
              <datablau-form
                label-width="180px"
                :model="form"
                ref="groupForm"
                :disabled="true"
              >
                <el-form-item
                  :label="$t('system.userGroup.groupName')"
                  prop="groupName"
                >
                  <datablau-tooltip
                    :content="form.groupName"
                    placement="bottom"
                    :disabled="isShowTooltip"
                  >
                    <datablau-input
                      class="user-group-input note-show-tooltip"
                      clearable
                      type="text"
                      v-model="form.groupName"
                      maxlength="100"
                      @mouseover.native="inputOnMouserOver($event)"
                    ></datablau-input>
                  </datablau-tooltip>
                </el-form-item>
                <el-form-item :label="$t('system.userGroup.mask')" prop="note">
                  <datablau-tooltip
                    :content="form.note"
                    placement="bottom"
                    :disabled="isShowTooltip"
                  >
                    <datablau-input
                      class="user-group-input note-show-tooltip"
                      clearable
                      type="text"
                      v-model="form.note"
                      maxlength="100"
                      @mouseover.native="inputOnMouserOver($event)"
                    ></datablau-input>
                  </datablau-tooltip>
                </el-form-item>
                <el-form-item
                  :label="$t('system.userGroup.creator')"
                  prop="creator"
                >
                  <datablau-input
                    class="user-group-input"
                    clearable
                    type="text"
                    v-model="form.creator"
                    maxlength="100"
                  ></datablau-input>
                </el-form-item>
                <el-form-item
                  :label="$t('system.userGroup.createTime')"
                  prop="createTime"
                >
                  <datablau-datePicker
                    :key="form.createTime"
                    :dateTime="form.createTime"
                    v-model="form.createTime"
                    :datePickerType="'datetime'"
                    :disabled="true"
                    :placeholder="$t('system.userGroup.createDate')"
                    class="user-group-input"
                  ></datablau-datePicker>
                </el-form-item>
                <el-form-item
                  :label="$t('system.userGroup.updater')"
                  prop="updater"
                >
                  <datablau-input
                    class="user-group-input"
                    clearable
                    type="text"
                    v-model="form.updater"
                    maxlength="100"
                  ></datablau-input>
                </el-form-item>
                <el-form-item
                  :label="$t('system.userGroup.updateTime')"
                  prop="updateTime"
                >
                  <datablau-datePicker
                    :key="form.updateTime"
                    :dateTime="form.updateTime"
                    v-model="form.updateTime"
                    :datePickerType="'datetime'"
                    :disabled="true"
                    :placeholder="$t('system.userGroup.createDate')"
                    class="user-group-input"
                  ></datablau-datePicker>
                </el-form-item>
              </datablau-form>
            </div>
            <div slot="buttons">
              <datablau-button
                type="important"
                style="width: 74px"
                size="mini"
                @click="editGroup"
              >
                {{ $t('common.button.edit') }}
              </datablau-button>
              <datablau-button
                type="secondary"
                style="width: 74px"
                size="mini"
                @click="deleteStaffGroup"
                :disabled="isDisableds"
              >
                {{ $t('common.button.delete') }}
              </datablau-button>
            </div>
          </datablau-form-submit>
        </div>
      </el-tab-pane>
      <el-tab-pane :label="$t('system.userGroup.memberList')" name="second">
        <div class="top-select">
          <datablau-input
            maxlength="100"
            style="
              width: 280px;
              position: relative;
              top: -1px;
              display: inline-block;
            "
            v-model="keyword"
            clearable
            :iconfont-state="true"
            :placeholder="$t('system.userGroup.placeholder')"
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
            @click="addNewStaff"
          >
            {{ $t('system.userGroup.addNewMember') }}
          </datablau-button>
        </div>
        <datablau-form-submit style="margin-top: 54px">
          <datablau-table
            class="datablau-table table"
            height="100%"
            v-loading="tableLoading"
            :data="groupData"
            show-overflow-tooltip
            :show-column-selection="false"
          >
            <el-table-column
              :label="$t('system.userGroup.index')"
              type="index"
              width="50"
            ></el-table-column>
            <el-table-column
              :label="$t('system.userGroup.username')"
              prop="username"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              :width="$i18n.locale === 'zh' ? '' : 100"
              :label="$t('system.userGroup.fullUserName')"
              prop="fullUserName"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              :label="$t('system.userGroup.org')"
              prop="orgFullName"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              :label="$t('system.userGroup.sysRole')"
              align="left"
              show-overflow-tooltip
              min-width="110"
            >
              <template slot-scope="scope">
                <!-- <el-tooltip
                  class="item"
                  effect="dark"
                  :content="scope.row.roles.toString()"
                  placement="top"
                >
                  <p
                    style="
                      width: 106px;
                      overflow: hidden;
                      white-space: nowrap;
                      text-overflow: ellipsis;
                    "
                  > -->
                {{ scope.row.roles.toString() }}
                <!-- </p>
                </el-tooltip> -->
              </template>
            </el-table-column>
            <!-- <el-table-column label="所属机构" align="center" prop="orgFullName" width="150"></el-table-column> -->
            <!--            <el-table-column label="系统角色" prop="tuNo" align="center"></el-table-column>-->
            <!--            <el-table-column label="所在用户组" align="center" prop="group"></el-table-column>-->
            <el-table-column
              :label="$t('system.userGroup.sex')"
              align="center"
              prop="gender"
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
              :label="$t('system.userGroup.position')"
              align="left"
              prop="title"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              :label="$t('system.userGroup.phoneNumber')"
              align="center"
              prop="phoneNumber"
              min-width="100"
              :width="$i18n.locale === 'zh' ? 100 : 120"
            ></el-table-column>
            <el-table-column
              :label="$t('system.userGroup.email')"
              align="left"
              prop="emailAddress"
              min-width="120"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              :label="$t('system.userGroup.operation')"
              align="center"
              width="100"
            >
              <template slot-scope="scope">
                <datablau-button
                  type="text"
                  size="mini"
                  @click="removeStaff(scope.row)"
                  :disabled="scope.row.isDisable"
                >
                  {{ $t('common.button.remove') }}
                </datablau-button>
              </template>
            </el-table-column>
          </datablau-table>
          <!-- 设置下面的翻页 -->
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
        <!-- <div class="table-part">

        </div> -->
        <!-- <div class="page-part">

        </div> -->
      </el-tab-pane>
    </datablau-tabs>
    <div
      v-if="!editWholeTreeData"
      style="
        position: absolute;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #909399;
        font-size: 14px;
      "
    >
      <p>{{ $t('el.empty.description') }}</p>
    </div>
    <!--    <el-dialog
      title="添加新成员"
      :visible.sync="dialogVisible"
      width="830px"
      append-to-body
      :before-close="resetData"
    >
      <el-form
        :model="addFormData"
        ref="addStaff"
        size="mini"
        inline
        label-width="80px"
      >
        <el-form-item label="所属机构" prop="organizationName">
          &lt;!&ndash; <el-select v-model="addFormData.toId" filterable clearable>
            <el-option
              v-for="item in organizatOptions"
              :key="item.toId"
              :value="item.toId"
              :label="item.toFname"
            ></el-option>
          </el-select> &ndash;&gt;
          <el-input
            type="text"
            clearable
            maxlength="100"
            @focus="selectOrganization()"
            v-model="addFormData.organizationName"
          ></el-input>
        </el-form-item>
        <el-form-item label="员工编号" prop="tuNo">
          <el-input
            type="text"
            clearable
            maxlength="100"
            placeholder="请输入员工编号"
            v-model="addFormData.tuNo"
          ></el-input>
        </el-form-item>
        <el-form-item label="用户组" prop="groupId">
          <el-select v-model="addFormData.groupId" filterable clearable>
            <el-option
              v-if="item.id !== form.id"
              v-for="item in allGroup"
              :key="item.id"
              :value="item.id"
              :label="item.groupName"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="用户中文名" prop="tuCname">
          <el-input
            type="text"
            clearable
            maxlength="100"
            placeholder="请输入用户中文名"
            v-model="addFormData.tuCname"
          ></el-input>
        </el-form-item>
        <el-form-item prop="state">
          <el-checkbox v-model="addFormData.state">
            仅显示已启用用户
          </el-checkbox>
        </el-form-item>
        <el-form-item>
          <div style="display: inline-block; width: 400px"></div>
          <el-button type="primary" size="mini" @click="search2">
            查询
          </el-button>
          &nbsp;
          <el-button type="primary" size="mini" @click="reset2">重置</el-button>
        </el-form-item>
      </el-form>
      <div class="staff-table">
        <el-table
          height="100%"
          class="datablau-table"
          :data="newStaffData"
          @selection-change="handleSelectionChange"
          v-loading="staffLoading"
        >
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column
            type="index"
            width="50"
            label="序号"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column label="员工编号" prop="tuNo"></el-table-column>
          <el-table-column label="中文名" prop="tuCname"></el-table-column>
          <el-table-column label="性别" prop="tuSex">
            <template slot-scope="scope">
              <span>{{ sexFormatter(newStaffData[scope.$index].tuSex) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="职务" prop="tuTitle"></el-table-column>
          <el-table-column
            label="邮件地址"
            prop="tuEmail"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            label="所属机构"
            prop="toFname"
            show-overflow-tooltip
          ></el-table-column>
        </el-table>
      </div>
      <div>
        <el-pagination
          @size-change="handleSizeChange2"
          @current-change="handleCurrentChange2"
          :current-page.sync="currentPage2"
          :page-sizes="[20]"
          :page-size="pageSize2"
          layout="total, prev, pager, next"
          :total="total2"
          style="display: inline-block; margin-top: 10px"
        ></el-pagination>
        <div style="display: inline-block; width: 420px"></div>
        <el-button type="primary" size="mini" @click="add">添加</el-button>
      </div>
    </el-dialog>-->
  </div>
</template>

<script>
import tabPane from './tabPane.js'
export default tabPane
</script>
<style lang="scss">
.user-group-tab {
  height: 100%;
  background-color: var(--default-bgc);
}
.tabCard3 .el-tabs__content {
  height: 97% !important;
}
.el-message-box__status {
  top: 14px !important;
}
.tab-card2 .el-tabs {
  height: 100% !important;
}
</style>
<style scoped lang="scss">
/deep/ .tab-card2 .el-tabs__content {
  height: calc(100% - 33px) !important;
}
.tab-card2 {
  background: var(--heading-ddc-bgc);
  position: absolute;
  right: 0;
  left: 0;
  bottom: 0;
  top: 0;
}
.tab-card2 {
  margin-top: 10px;
  /deep/ .el-tabs__header {
    background-color: var(--default-bgc) !important;
    padding: 0 20px;
  }
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
.top-btn-2 {
  display: inline-block;
  // margin-left: 40px;
}
.top-select {
  position: absolute;
  top: 10px;
  left: 20px;
  right: 20px;
}
.table-part {
  position: absolute;
  top: 54px;
  left: 20px;
  right: 20px;
  bottom: 50px;
  // border-top: 1px solid #e5e5e5;
  // overflow: auto;
  .table {
    height: 100%;
  }
}
.staff-table {
  height: 350px;
  border-top: 1px solid #cecece;
}
.form-part {
  margin: 30px 0 0 0;
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
  /deep/ .el-date-editor.el-input,
  .datablau-datapicker .el-date-editor.el-input__inner {
    width: 300px !important;
  }
  /deep/ .el-input__inner {
    height: 34px;
    line-height: 34px;
    border-radius: 2px;
    padding-left: 10px;
  }
}
.note-show-tooltip {
  /deep/ .el-input__inner {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
}
.page-part {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 50px;
  // border-top: 1px solid var(--border-color-lighter);
  box-shadow: 0 -5px 14px -8px rgba(0, 0, 0, 0.2);
  .page {
    position: absolute;
    right: 20px;
    bottom: 10px;
  }
}
</style>
