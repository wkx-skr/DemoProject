<template>
  <div>
    <el-dialog
      :title="$t('system.group.addMember')"
      :visible.sync="dialogVisible"
      width="600px"
      :close-on-click-modal="false"
      append-to-body
    >
      <add-user
        v-if="dialogVisible"
        :selected="selectedUserIds"
        :allUsers="allUsers"
      ></add-user>
    </el-dialog>
    <el-dialog
      :title="limitTitle"
      :visible.sync="showAddLimit"
      width="660px"
      :close-on-click-modal="false"
      append-to-body
      @close="closeLimit"
    >
      <datablau-form
        label-width="80px"
        :rules="limitRules"
        ref="limitForm"
        :model="limitFormData"
        size="mini"
      >
        <el-form-item label="模块" prop="roleModule">
          <datablau-select
            v-model="limitFormData.roleModule"
            placeholder="请选择"
            clearable
            filterable
            allow-create
            @change="changeSelModule"
            :disabled="isEdit || isDelete"
          >
            <el-option
              v-for="(item, idx) in roleModuleData"
              :key="item + idx"
              :value="item"
              :label="item"
            ></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item label="功能" prop="roleModuleClass">
          <datablau-select
            v-model="limitFormData.roleModuleClass"
            placeholder="请选择"
            clearable
            filterable
            allow-create
            default-first-option
            @change="changeSelModuleClass"
            :disabled="isEdit || isDelete"
          >
            <el-option
              v-for="(item, idx) in roleModuleClassData"
              :key="item + idx"
              :value="item"
              :label="item"
            ></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item label="权限名称" prop="roleFriendlyName">
          <datablau-select
            :style="{
              width: isEdit ? '80%' : '500px',
              display: 'inline-block',
            }"
            v-if="!isEditLimitName"
            v-model="limitFormData.roleFriendlyName"
            placeholder="请选择"
            collapse-tags
            clearable
            filterable
            allow-create
            default-first-option
            @change="changeSelFriendlyName"
          >
            <!--            :multiple="isDelete"-->

            <el-option
              v-for="(item, idx) in roleFriendlyNameData"
              :key="item + idx"
              :value="item.roleFriendlyName + '-' + item.roleName"
              :label="item.roleFriendlyName"
            ></el-option>
          </datablau-select>
          <datablau-input
            style="width: 80%"
            v-else
            v-model="editRoleFriendlyName"
          ></datablau-input>
          <datablau-button
            style="margin-left: 20px"
            v-if="isEdit"
            type="icon"
            size="mini"
            @click="changeIsEdit"
            :disabled="!limitFormData.roleFriendlyName"
          >
            <div v-if="!isEditLimitName">
              <i class="iconfont icon-bianji"></i>
            </div>
            <div v-else>
              <i class="iconfont icon-right"></i>
            </div>
          </datablau-button>
        </el-form-item>
        <el-form-item label="权限编码" prop="roleName" v-if="!isDelete">
          <datablau-input
            :disabled="isEdit"
            v-model="limitFormData.roleName"
            placeholder="请输入"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="描述" prop="roleDescription" v-if="!isDelete">
          <datablau-input
            v-model="limitFormData.roleDescription"
            placeholder="请输入"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="api" prop="selApi" v-if="!isDelete">
          <datablau-select
            v-model="selApi"
            placeholder="请选择"
            multiple
            clearable
            filterable
            @change="changeApi"
          >
            <el-option
              v-for="(item, index) in apiList"
              :key="item.url + index"
              :value="index"
              :label="item.urlWidthMethod"
            ></el-option>
          </datablau-select>
        </el-form-item>
      </datablau-form>
      <div slot="footer" class="limitFooterBtn">
        <datablau-button type="secondary" @click.native.stop="closeLimit">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button type="primary" @click.native.stop="saveLimit">
          {{ $t('common.button.ok') }}
        </datablau-button>
      </div>
    </el-dialog>
    <datablau-form-submit>
      <div style="padding: 20px 0">
        <datablau-form
          class="page-form"
          label-position="right"
          label-width="180px"
          :model="content"
          :rules="rules"
          ref="content"
        >
          <el-form-item :label="$t('system.group.name')" prop="name">
            <datablau-input
              v-model="content.name"
              :placeholder="
                $t('common.placeholder.prefix') + $t('system.group.name')
              "
            ></datablau-input>
          </el-form-item>
          <el-form-item :label="$t('system.group.description')">
            <datablau-input
              type="textarea"
              v-model="content.description"
              :placeholder="
                $t('common.placeholder.prefix') + $t('system.group.description')
              "
              show-word-limit
              maxlength="255"
              :autosize="{ minRows: 2, maxRows: 6 }"
              class="group-detail-textarea"
            ></datablau-input>
          </el-form-item>
        </datablau-form>
        <datablau-tabs
          v-model="activeName"
          class="group-detail-tabs"
          style="margin-left: 20px; margin-right: 20px"
        >
          <el-tab-pane
            :label="$t('system.group.permissionSetting')"
            name="access"
          >
            <datablau-button
              class="addLimit"
              @click="addLimit"
              v-if="enableEditLimit"
            >
              {{ $t('system.group.addPermission') }}
            </datablau-button>
            <el-table
              :data="treegroups"
              :span-method="objectSpanMethod"
              border
              class="datablau-table"
              style="margin-top: -10px; margin-right: 20px"
            >
              <el-table-column
                prop="roleModule"
                :label="$t('system.group.module')"
                width="180"
              >
                <template slot-scope="scope">
                  <el-checkbox
                    :label="scope.row.roleModule"
                    v-model="checkRoleModule[scope.row.roleModule]"
                    :indeterminate="
                      checkRoleModuleIndeterminate[scope.row.roleModule]
                    "
                    @change="handleCheckRoleModuleChange(scope.row.roleModule)"
                  ></el-checkbox>
                </template>
              </el-table-column>
              <el-table-column
                prop="roleModuleClass"
                width="140"
                :label="$t('system.group.function')"
              >
                <template slot-scope="scope">
                  <el-checkbox
                    :label="scope.row.roleModuleClass"
                    v-model="checkRoleModuleClass[scope.row.roleModuleClass]"
                    :indeterminate="
                      checkRoleModuleClassIndeterminate[
                        scope.row.roleModuleClass
                      ]
                    "
                    @change="
                      handleCheckRoleModuleClassChange(
                        scope.row.roleModuleClass
                      )
                    "
                  ></el-checkbox>
                </template>
              </el-table-column>
              <el-table-column :label="$t('system.group.permission')">
                <template slot-scope="scope">
                  <el-checkbox-group
                    v-model="checkList"
                    :key="scope.row.roleModuleClass"
                    @change="handleCheckListChange(scope.row.roleModuleClass)"
                  >
                    <el-checkbox
                      :label="item.id"
                      v-for="(item, index) in treegroups"
                      :key="item.id"
                      v-if="
                        scope.row.roleModuleClass == item.roleModuleClass &&
                        scope.row.roleModule == item.roleModule
                      "
                    >
                      {{ item.roleFriendlyName }}
                    </el-checkbox>
                  </el-checkbox-group>
                </template>
              </el-table-column>
              <el-table-column
                v-if="enableEditLimit"
                :label="$t('system.group.operation')"
                :width="$i18n.locale === 'en' ? '140px' : '120'"
                header-align="center"
                align="center"
              >
                <template slot-scope="scope">
                  <datablau-button type="text" @click="editLimit(scope.row)">
                    {{ $t('common.button.edit') }}
                  </datablau-button>
                  <datablau-button type="text" @click="delLimit(scope.row)">
                    {{ $t('common.button.delete') }}
                  </datablau-button>
                </template>
              </el-table-column>
            </el-table>
            <!-- <el-input type="textarea" v-model="content.roleIds" placeholder="请选择权限" @focus="checkgroup(content.roleIds)"></el-input> -->
            <!-- <el-select
          v-model="content.roleIds"
          multiple
          placeholder="请选择权限"
          >
          <el-option
          v-for="role in $roles"
          :key="role.userRoleId"
          :label="role.roleFriendlyName"
          :value="role.userRoleId"
          >{{role.roleFriendlyName}} <span style="font-size:12px;color:#666;opacity:0.8">（{{role.roleDescription}}）</span>
          </el-option>
        </el-select> -->
          </el-tab-pane>
          <el-tab-pane :label="$t('system.group.member')" name="user">
            <datablau-table
              v-if="getUser && showUserTable"
              :data="getUser"
              class="datablau-table user-table"
              style="margin-top: -10px"
              ref="multipleTable"
              :max-height="500"
              border
              show-overflow-tooltip
              :show-column-selection="false"
            >
              <el-table-column
                prop="username"
                :label="$t('system.user.loginName')"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                prop="name"
                :formatter="nameFormatter"
                :label="$t('system.user.fullName')"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                prop="gender"
                :label="$t('system.user.gender')"
                align="center"
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
                prop="title"
                :label="$t('system.user.title')"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                prop="emailAddress"
                :label="$t('system.user.email')"
                width="180"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                prop="phoneNumber"
                :label="$t('system.user.phone')"
                align="center"
                width="120"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                :label="$t('system.group.operation')"
                header-align="center"
                align="center"
                :width="$i18n.locale === 'en' ? 100 : 80"
              >
                <template slot-scope="scope">
                  <datablau-button
                    size="small"
                    type="text"
                    @click="deleteUser(scope.$index, scope.row)"
                  >
                    {{ $t('common.button.remove') }}
                  </datablau-button>
                </template>
              </el-table-column>
            </datablau-table>
            <datablau-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page.sync="currentPage"
              :page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total"
              class="page"
              style="float: right; margin-top: 20px; margin-right: 0px"
            ></datablau-pagination>
            <datablau-button
              type="secondary"
              size="small"
              style="margin-top: 20px"
              @click="addUsers"
            >
              <!-- 选择成员 -->
              {{ $t('system.group.addMember') }}
            </datablau-button>
          </el-tab-pane>
        </datablau-tabs>
      </div>
      <div slot="buttons">
        <datablau-button
          size="small"
          type="important"
          style="width: 77px"
          @click="confirm"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
        <datablau-button
          size="small"
          type="secondary"
          class="white-btn"
          @click="remove"
        >
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button
          v-if="ifDefaultGroup"
          type="secondary"
          class="white-btn"
          @click="initialization"
        >
          {{ $t('system.group.initialize') }}
        </datablau-button>
      </div>
    </datablau-form-submit>
  </div>
</template>

<script>
import detail from './detail.js'
export default detail
</script>

<style lang="scss" scoped="scoped">
.group-detail-tabs {
  margin-top: 10px;
  /deep/ .el-tabs__nav .el-tabs__item.is-active {
    border: none !important;
  }
  /deep/ .el-tabs__nav .el-tabs__item {
    border: none !important;
  }
  /deep/ .el-tabs__header {
    display: block !important;
  }
  .el-tab-pane .addLimit {
    margin-bottom: 20px;
  }
}
.group-detail-textarea {
  /deep/ .el-input__count {
    line-height: 20px !important;
  }
}
.user-table {
  border-bottom: 1px solid #e0e0e0;
}
.el-dialog {
  padding-bottom: 20px;
  .el-dialog__footer .limitFooterBtn {
    text-align: right;
  }
}
</style>
