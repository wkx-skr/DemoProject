<template>
  <div>
    <datablau-dialog
      :title="`重置 '${content.username}' 的密码`"
      :visible.sync="passwordDialog.dialogFormVisible"
      append-to-body
      :close-on-click-modal="false"
      v-if="passwordDialog.dialogFormVisible"
      size="l"
    >
      <datablau-form
        :model="passwordDialog.resetPasswordForm"
        :rules="passwordDialog.inputRules"
        ref="resetPasswordForm"
        :label-width="$i18n.locale === 'en' ? '140px' : '130px'"
      >
        <el-form-item
          :label="$t('system.user.oldPass')"
          prop="oldPassword"
          v-if="false"
        >
          <datablau-input
            v-model="passwordDialog.resetPasswordForm.oldPassword"
            auto-complete="off"
            type="password"
            style="width: 100%"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="请输入您的密码" prop="loginPassword">
          <datablau-input
            v-model="passwordDialog.resetPasswordForm.loginPassword"
            auto-complete="off"
            type="password"
            style="width: 100%"
          ></datablau-input>
        </el-form-item>
        <el-form-item
          :label="$t('system.user.newPass')"
          :label-position="labelPosition"
          prop="password"
        >
          <datablau-input
            v-model="passwordDialog.resetPasswordForm.password"
            auto-complete="off"
            type="password"
            style="width: 100%"
          ></datablau-input>
        </el-form-item>
        <!-- 弹窗中的新密码的校验 -->
        <el-form-item label="" v-if="$strongPassword">
          <check-password-box
            :password="passwordDialog.resetPasswordForm.password"
            :boxWidth="dialogBoxWidth"
          ></check-password-box>
        </el-form-item>
<!--        <el-form-item
          :label="$t('system.user.newPass')"
          :label-position="labelPosition"
          v-if="$auth['ROLE_SUPERUSER'] === undefined && false"
          prop="newPassword"
        >
          <datablau-input
            v-model="passwordDialog.resetPasswordForm.newPassword"
            auto-complete="off"
            type="password"
            style="width: 100%"
          ></datablau-input>
        </el-form-item>
        &lt;!&ndash; 弹窗中的密码校验 &ndash;&gt;
        <el-form-item
          label=""
          v-if="
            $auth['ROLE_SUPERUSER'] === undefined && $strongPassword && false
          "
        >
          <check-password-box
            :password="passwordDialog.resetPasswordForm.newPassword"
            :boxWidth="dialogBoxWidth"
          ></check-password-box>
        </el-form-item>-->
        <el-form-item
          :label="$t('system.user.placeholder.confirmPassword')"
          :label-position="labelPosition"
          prop="confirmPassword"
        >
          <datablau-input
            v-model="passwordDialog.resetPasswordForm.confirmPassword"
            auto-complete="off"
            type="password"
            style="width: 100%"
          ></datablau-input>
        </el-form-item>
      </datablau-form>
      <div slot="footer" class="dialog-bottom">
        <datablau-button
          size="mini"
          type="secondary"
          @click="passwordDialog.dialogFormVisible = false"
        >
          {{ $version.common.cancel }}
        </datablau-button>
        <datablau-button
          size="mini"
          type="important"
          style="width: 74px"
          @click="confirmResetPassword"
        >
          {{ $version.common.set }}
        </datablau-button>
      </div>
    </datablau-dialog>
    <datablau-dialog
      :title="resetName"
      :visible.sync="dialogRoleOrManage"
      size="l"
      append-to-body
      :close-on-click-modal="false"
      class="show-table-detail"
      :height="609"
    >
      <datablau-input
        class="search-input"
        :iconfont-state="true"
        :placeholder="$t('common.placeholder.normal')"
        v-model="keyword"
        :clearable="true"
      ></datablau-input>
      <datablau-table
        ref="tableRole"
        style="margin-top: 0"
        class="datablau-table table user-dialog-table"
        :data="tableData"
        :data-selectable="true"
        :height="440"
        :key="resetName"
        @selection-change="datablauSelectionChanged"
      >
        <el-table-column
          v-for="item in columnDefs"
          :key="item.field"
          :label="item.headerName"
          :prop="item.field"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span v-if="item.field === 'categoryName'">
              {{
                scope.row.categoryName +
                '(' +
                scope.row.categoryAbbreviation +
                ')'
              }}
            </span>
            <span v-else>{{ scope.row[item.field] }}</span>
          </template>
        </el-table-column>
      </datablau-table>
      <div class="dialog-table-footer">
        <datablau-button
          size="small"
          type="secondary"
          class="white-btn"
          @click="removeRole"
        >
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button
          size="small"
          type="important"
          @click="confirmRole"
          :disabled="roleTableSelect.length === 0"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
      </div>
    </datablau-dialog>
    <datablau-form-submit>
      <div>
        <datablau-form
          class="page-form detail-form"
          label-position="right"
          label-width="180px"
          :rules="rules"
          ref="content"
          :model="content"
        >
          <!-- v-model="content"  -->
          <div class="form-sub-title detail-title">
            <i class="user-detail-tu"></i>
            <span>{{ $t('system.user.accountSettings') }}</span>
          </div>

          <el-form-item
            :label="$t('system.user.loginName')"
            :prop="Boolean(preData) ? '' : 'username'"
          >
            <datablau-input
              v-model="content.username"
              :placeholder="
                $t('common.placeholder.prefix') + $t('system.user.loginName')
              "
              :disabled="Boolean(preData)"
              style="display: inline-block"
            ></datablau-input>
            <!-- <el-tooltip content="登录名可以包含字母，数字，下划线，减号，不包含空格，长度为4到100位" placement="right" effect="dark"> -->
            <datablau-tooltip
              :content="$t('system.user.info.lengthTooltip')"
              placement="right"
              v-if="!Boolean(preData)"
            >
              <i class="iconfont icon-tips"></i>
            </datablau-tooltip>
          </el-form-item>
          <el-form-item
            :label="$t('system.user.tenant')"
            v-if="$appName === 'DDD'"
            prop="tenantId"
          >
            <datablau-select v-model="content.tenantId">
              <el-option
                v-for="item in tenantList"
                :key="item.id"
                :label="item.tenantCode"
                :value="item.id"
              ></el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item :label="$t('system.user.role')" class="detail-juese">
            <datablau-button
              type="text"
              class="iconfont icon-tianjia detail-btn"
              @click="addDialogArr('role')"
            >
              {{ $t('system.user.addRole') }}
            </datablau-button>
            <div class="detail-el-tag">
              <el-tag
                style="margin-left: 10px; margin-top: 5px"
                type=""
                size="mini"
                closable
                v-for="val in selectionRoleList"
                :key="val.id"
                @close="removeTag('role', val)"
              >
                {{ val.name }}
              </el-tag>
            </div>
          </el-form-item>
          <el-form-item
            :label="$t('system.user.category')"
            class="detail-juese"
            v-if="$appName !== 'DDM'"
          >
            <datablau-button
              type="text"
              class="iconfont icon-tianjia detail-btn"
              @click="addDialogArr('manage')"
            >
              {{ $t('system.user.addCategory') }}
            </datablau-button>
            <div class="detail-el-tag">
              <el-tag
                style="margin-left: 10px; margin-top: 5px"
                type=""
                size="mini"
                closable
                v-for="val in selectionManageList"
                :key="val.categoryId"
                @close="removeTag('manage', val)"
              >
                {{ val.categoryName + '(' + val.categoryAbbreviation + ')' }}
              </el-tag>
            </div>
          </el-form-item>
          <el-form-item
            :label="$t('system.user.password')"
            v-if="!preData"
            prop="password"
          >
            <datablau-input
              v-model="content.password"
              type="password"
              :placeholder="
                $t('common.placeholder.prefix') + $t('system.user.password')
              "
              clearable
              @blur="testConfirmPassword"
              style="display: inline-block"
            ></datablau-input>
            <!-- <el-tooltip content="密码必须包含大小写字母、数字和特殊字符中的两种，长度为8位以上" placement="right" effect="dark"> -->
            <datablau-tooltip
              :content="$t('system.user.validator.strongRule')"
              placement="right"
            >
              <i class="iconfont icon-tips"></i>
            </datablau-tooltip>
          </el-form-item>
          <!-- 用来进行密码输入提示校验的 -->
          <el-form-item label="" v-if="!preData && $strongPassword">
            <check-password-box
              :password="content.password"
              :boxWidth="boxWidth"
            ></check-password-box>
          </el-form-item>
          <el-form-item
            :label="$t('system.user.placeholder.confirmPassword')"
            v-if="!preData"
            prop="confirmPassword"
          >
            <datablau-input
              v-model="content.confirmPassword"
              type="password"
              :placeholder="$t('system.user.placeholder.retypePass')"
            ></datablau-input>
          </el-form-item>
          <el-form-item :label="$t('system.user.title')">
            <datablau-input
              v-model="content.title"
              :placeholder="$t('system.user.placeholder.title')"
              clearable
            ></datablau-input>
          </el-form-item>
          <el-form-item :label="$t('system.user.gender')">
            <datablau-radio
              v-model="content.gender"
              style="height: 34px; line-height: 34px"
            >
              <el-radio label="男">{{ $t('system.user.male') }}</el-radio>
              <el-radio label="女">{{ $t('system.user.female') }}</el-radio>
            </datablau-radio>
          </el-form-item>
          <el-form-item
            :label="$t('system.user.organization')"
            prop="bm"
            :rules="{
              required: true,
              message:
                $t('system.user.organization') +
                $t('system.user.validator.notEmpty'),
            }"
          >
            <datablau-input
              clearable
              class="width"
              maxlength="100"
              readonly
              v-model="bms"
              :placeholder="
                $t('common.placeholder.selectPrefix') +
                $t('system.user.organization')
              "
              @focus="addBm"
            ></datablau-input>
          </el-form-item>
          <div class="form-sub-title detail-title">
            <i class="user-detail-tu"></i>
            <span>{{ $t('system.user.informationSettings') }}</span>
          </div>
          <el-form-item :label="$t('system.user.fullName')" prop="fullUserName">
            <datablau-input
              v-model="content.fullUserName"
              :placeholder="
                $t('common.placeholder.prefix') + $t('system.user.fullName')
              "
            ></datablau-input>
          </el-form-item>
          <el-form-item :label="$t('system.user.email')" prop="emailAddress">
            <datablau-input
              v-model="content.emailAddress"
              :placeholder="
                $t('common.placeholder.prefix') + $t('system.user.email')
              "
            ></datablau-input>
          </el-form-item>
          <el-form-item :label="$t('system.user.phone')" prop="phoneNumber">
            <datablau-input
              v-model="content.phoneNumber"
              :placeholder="
                $t('common.placeholder.prefix') + $t('system.user.phone')
              "
            ></datablau-input>
          </el-form-item>
        </datablau-form>
      </div>
      <div slot="buttons">
        <datablau-button type="important" @click="confirm">
          {{ $t('common.button.ok') }}
        </datablau-button>
        <datablau-button type="secondary" @click="remove">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button
          type="important"
          @click="resetPassword"
          v-if="preData && !$prohibitResetPassword"
        >
          {{ $t('system.user.changePassword') }}
        </datablau-button>
      </div>
    </datablau-form-submit>
  </div>
</template>

<script>
import detail from './detail.js'
export default detail
</script>

<style lang="scss" scoped>
$primary-color: #409eff;
.margin {
  margin-top: 10px;
  margin-left: 23px;
}
/deep/ .el-form.page-form .el-input {
  width: 500px;
}
.detail-form {
  position: absolute;
  // bottom: 50px;
  top: 3px;
  right: 0;
  left: 0;
  overflow: auto;
  padding-bottom: 20px;
  .el-form-item__content {
    display: flex;
    align-items: center;
  }
  /deep/ .el-form-item__label {
    line-height: 34px;
    height: 34px;
  }

  .detail-title {
    display: flex;
    align-items: center;
    .user-detail-tu {
      display: inline-block;
      width: 4px;
      height: 16px;
      background: $primary-color;
      margin-right: 6px;
    }
  }
  .detail-juese {
    /deep/ .detail-btn,
    .is-block {
      padding-left: 0px;
      span {
        padding-left: 6px;
      }
    }
    .detail-el-tag {
      width: 800px;
      margin-left: -10px;
      .el-tag--light {
        margin-left: 4px !important;
      }
    }
  }
  .detail-btn {
    height: 34px;
    line-height: 34px;
  }
}
.search-input {
  width: 300px;
}
.dialog-table-footer {
  position: absolute;
  bottom: 0;
  right: 20px;
}
.reset-password-box {
  background: #f5f5f5;
  width: 500px;
  padding: 10px;
  .col-66bf16 {
    color: #66bf16;
  }
  i {
    color: #66bf16;
    margin-right: 8px;
  }
}
.point {
  transform: translateY(-2px);
  display: inline-block;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #555555;
  margin-right: 8px;
}
.left-bottom {
  position: absolute;
  bottom: 0;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  right: 0;
  left: 0;
  padding-right: 20px;
  border-top: 1px solid #e0e0e0;
  margin: 0 !important;
}
.user-dialog-table {
  border-bottom: 1px solid #e0e0e0;
}
</style>
