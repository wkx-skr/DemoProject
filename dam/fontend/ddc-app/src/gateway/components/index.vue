<template>
  <div class="gateway-page">
    <datablau-dialog
      :title="dialogTitle"
      :visible.sync="addDialog"
      v-if="addDialog"
      :close-on-click-modal="false"
      size="l"
      :height="590"
      :hasBorder="true"
    >
      <el-form
        :model="form"
        ref="addForm"
        label-width="140px"
        class="demo-ruleForm"
      >
        <el-form-item
          label="网关类型"
          prop="gatewayType"
          class="el-form-item-50"
        >
          <div class="gateway-types">
            <div
              @click="changeType('DATAMASKING_GATEWAY')"
              class="type"
              :class="{
                'active-type': form.gatewayType === 'DATAMASKING_GATEWAY',
              }"
            >
              <!-- <i class="iconfont icon-suoxiao"></i> -->
              脱敏网关
            </div>
            <div
              @click="changeType('PROXY_GATEWAY')"
              class="type"
              :class="{
                'active-type': form.gatewayType === 'PROXY_GATEWAY',
              }"
            >
              透明网关
            </div>
          </div>
        </el-form-item>
        <el-form-item
          label="网关名称"
          prop="name"
          :rules="[{ required: true, message: '网关名称不能为空' }]"
        >
          <datablau-input
            type="text"
            v-model="form.name"
            style="width: 560px"
          ></datablau-input>
        </el-form-item>
        <el-form-item
          label="数据源"
          prop="modelId"
          :rules="[
            { required: true, message: '数据源不能为空', trigger: 'change' },
          ]"
        >
          <el-select
            filterable
            v-model="form.modelId"
            placeholder="请选择数据源"
            style="width: 560px"
          >
            <el-option
              :label="item.definition"
              :value="item.modelId"
              v-for="item in form.gatewayType === 'PROXY_GATEWAY'
                ? allDataSource
                : dataSource"
              :key="item.modelId"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="服务网关端口"
          prop="servicePort"
          :rules="[{ required: true, message: '端口不能为空' }]"
        >
          <datablau-input
            v-model.number="form.servicePort"
            style="width: 560px"
          ></datablau-input>
        </el-form-item>
        <el-form-item
          label="用户登录方式"
          prop="isCustom"
          v-if="form.gatewayType !== 'PROXY_GATEWAY'"
        >
          <datablau-radio v-model="form.isCustom">
            <el-radio
              :label="true"
              style="margin-bottom: 10px; margin-top: 6px"
            >
              自定义用户登录
            </el-radio>
            <el-radio :label="false">DAM用户登录</el-radio>
          </datablau-radio>
        </el-form-item>
        <el-form-item
          v-if="form.isCustom && form.gatewayType !== 'PROXY_GATEWAY'"
          label="用户名"
          prop="serviceUsername"
          :rules="[{ required: true, message: '用户名不能为空' }]"
        >
          <datablau-input
            style="width: 560px"
            type="text"
            v-model="form.serviceUsername"
          ></datablau-input>
        </el-form-item>
        <el-form-item
          v-if="form.isCustom && form.gatewayType !== 'PROXY_GATEWAY'"
          label="密码"
          prop="servicePassword"
          :rules="[{ required: true, message: '密码不能为空' }]"
        >
          <datablau-input
            style="width: 560px"
            type="password"
            v-model="form.servicePassword"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="启用状态" prop="state">
          <el-switch v-model="form.state"></el-switch>
          {{ form.state ? '已启用' : '未启用' }}
        </el-form-item>
        <el-form-item
          label="网关组"
          prop="groupId"
          :rules="[
            { required: true, message: '网关组不能为空', trigger: 'change' },
          ]"
        >
          <el-select
            v-model="form.groupId"
            placeholder="请选择网关组"
            style="width: 560px"
          >
            <el-option
              :label="item.groupName"
              :value="item.id"
              v-for="item in teamData"
              :key="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <div class="dialog-bottom">
          <datablau-button type="secondary" @click="resetForm('addForm')">
            {{ $t('common.button.cancel') }}
          </datablau-button>
          <datablau-button type="important" @click="handleSure('addForm')">
            {{ $t('common.button.ok') }}
          </datablau-button>
        </div>
      </el-form>
    </datablau-dialog>
    <datablau-dialog
      :title="dialogTitle"
      :visible.sync="editDialog"
      :close-on-click-modal="false"
      size="l"
      :height="520"
    >
      <el-form
        :model="editForm"
        ref="editForm"
        label-width="140px"
        class="demo-ruleForm"
      >
        <el-form-item label="网关类型" prop="gatewayType">
          <div class="gateway-types">
            <span v-if="editForm.gatewayType === 'DATAMASKING_GATEWAY'">
              脱敏网关
            </span>
            <span v-if="editForm.gatewayType === 'PROXY_GATEWAY'">
              透明网关
            </span>
          </div>
        </el-form-item>
        <el-form-item label="数据源：" prop="databaseName">
          <span>{{ editForm.databaseName }}</span>
        </el-form-item>
        <el-form-item label="服务网关端口：" prop="servicePort">
          <span>{{ editForm.servicePort }}</span>
        </el-form-item>
        <el-form-item
          label="网关名称"
          prop="name"
          :rules="[{ required: true, message: '名称不能为空' }]"
        >
          <datablau-input
            type="text"
            v-model="editForm.name"
            style="width: 560px"
          ></datablau-input>
        </el-form-item>
        <el-form-item
          v-if="editForm.isCustom && editForm.gatewayType !== 'PROXY_GATEWAY'"
          label="用户名"
          prop="serviceUsername"
          :rules="[{ required: true, message: '用户名不能为空' }]"
        >
          <datablau-input
            style="width: 560px"
            type="text"
            v-model="editForm.serviceUsername"
          ></datablau-input>
        </el-form-item>
        <el-form-item
          v-if="editForm.isCustom && editForm.gatewayType !== 'PROXY_GATEWAY'"
          label="密码"
          prop="servicePassword"
          :rules="[{ required: true, message: '密码不能为空' }]"
        >
          <datablau-input
            style="width: 560px"
            type="text"
            v-model="editForm.servicePassword"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="启用状态" prop="state">
          <el-switch v-model="editForm.state"></el-switch>
          {{ editForm.state ? '已启用' : '未启用' }}
        </el-form-item>
        <el-form-item label="网关组" prop="team">
          <el-select
            v-model="editForm.groupId"
            placeholder="请选择网关组"
            style="width: 560px"
          >
            <el-option
              :label="item.groupName"
              :value="item.id"
              v-for="item in teamData"
              :key="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <div class="dialog-bottom">
          <datablau-button type="secondary" @click="resetEditForm('editForm')">
            {{ $t('common.button.cancel') }}
          </datablau-button>
          <datablau-button type="important" @click="handleEditSure('editForm')">
            {{ $t('common.button.ok') }}
          </datablau-button>
        </div>
      </el-form>
    </datablau-dialog>
    <!-- :title="detailTitle + '的详情'" -->
    <datablau-dialog
      title="查看详情"
      :visible.sync="detailDialog"
      :close-on-click-modal="false"
      size="m"
      :noPadding="true"
      :before-close="handleClose"
    >
      <el-form :model="editForm" ref="editForm" label-width="120px">
        <el-form-item label="网关类型：" prop="gatewayType">
          <span v-if="editForm.gatewayType === 'DATAMASKING_GATEWAY'">
            脱敏网关
          </span>
          <span v-if="editForm.gatewayType === 'PROXY_GATEWAY'">透明网关</span>
        </el-form-item>
        <el-form-item label="网关名称：" prop="name">
          <span>{{ editForm.name }}</span>
        </el-form-item>
        <el-form-item label="数据源：" prop="databaseName">
          <span>{{ editForm.databaseName }}</span>
        </el-form-item>
        <el-form-item label="服务网关端口：" prop="servicePort">
          <span>{{ editForm.servicePort }}</span>
        </el-form-item>
        <el-form-item label="启动状态：" prop="enable">
          <span>{{ editForm.enable == 1 ? '已启动' : '已关闭' }}</span>
        </el-form-item>

        <el-form-item
          label="登录类型状态："
          prop="isCustom"
          v-if="editForm.gatewayType !== 'PROXY_GATEWAY'"
        >
          <span>
            {{ editForm.isCustom ? '自定义账号登录' : 'DAM账号登录' }}
          </span>
        </el-form-item>
        <el-form-item
          label="账号："
          prop="serviceUsername"
          v-if="editForm.isCustom && editForm.gatewayType !== 'PROXY_GATEWAY'"
        >
          <span>{{ editForm.serviceUsername }}</span>
        </el-form-item>
        <el-form-item
          label="密码："
          prop="servicePassword"
          v-if="editForm.isCustom && editForm.gatewayType !== 'PROXY_GATEWAY'"
        >
          <span>{{ editForm.servicePassword }}</span>
        </el-form-item>
        <el-form-item label="网关组：" prop="team">
          <span>{{ editForm.groupName }}</span>
        </el-form-item>
      </el-form>
    </datablau-dialog>
    <datablau-dialog
      title="网关组管理"
      :visible.sync="showTeam"
      size="l"
      :height="500"
    >
      <div class="add-team">
        <datablau-button
          type="text"
          class="iconfont icon-tianjia"
          @click="addTeam"
        >
          添加网关组
        </datablau-button>
      </div>
      <datablau-table
        :data="teamData"
        :row-class-name="tableRowClassName"
        :show-column-selection="false"
        class="datablau-table-border"
      >
        <el-table-column prop="groupName" label="网关组">
          <template slot-scope="scope">
            <datablau-input
              :id="'group-name-' + scope.row.index"
              class="edit--table-input"
              :class="{ 'no-edit-input': scope.row.edit }"
              placeholder="请输入网关组名称"
              :disabled="scope.row.edit"
              clearable
              v-model="scope.row.groupName"
              @input="changeInput($event, scope.row)"
            ></datablau-input>
          </template>
        </el-table-column>
        <el-table-column prop="groupCode" label="网关组编码">
          <template slot-scope="scope">
            <datablau-input
              :id="'group-code-' + scope.row.index"
              class="edit--table-input"
              :class="{ 'no-edit-input': scope.row.edit }"
              placeholder="请输入网关组编码"
              :disabled="scope.row.edit"
              clearable
              v-model="scope.row.groupCode"
              @input="changeInputCode($event, scope.row)"
            ></datablau-input>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template slot-scope="scope">
            <datablau-tooltip
              effect="dark"
              :content="scope.row.edit ? '编辑' : '保存'"
              placement="bottom"
            >
              <datablau-button type="text" @click="editTeam(scope.row)">
                <i
                  class="iconfont"
                  :class="[scope.row.edit ? 'icon-bianji' : 'icon-save']"
                ></i>
              </datablau-button>
            </datablau-tooltip>
            <datablau-tooltip effect="dark" content="删除" placement="bottom">
              <datablau-button type="text" @click="deleteTeam(scope.row)">
                <i class="iconfont icon-delete"></i>
              </datablau-button>
            </datablau-tooltip>
          </template>
        </el-table-column>
      </datablau-table>
      <span slot="footer">
        <div class="page">
          <datablau-pagination
            class="turn-pages"
            @size-change="handleTeamSizeChange"
            @current-change="handleTeamCurrentChange"
            :current-page.sync="teamPage"
            :page-sizes="[10, 20, 50]"
            :page-size="teamSize"
            layout="total, sizes, prev, jumper, next"
            :total="teamTotal"
          ></datablau-pagination>
        </div>
        <datablau-button type="secondary" @click="closeTeam">
          关 闭
        </datablau-button>
      </span>
    </datablau-dialog>
    <datablau-dialog
      title="健康状况"
      :visible.sync="showStatus"
      size="m"
      :height="4920"
    >
      <datablau-table :data="curStatusData">
        <el-table-column prop="groupName" label="网关组"></el-table-column>
        <el-table-column prop="system" label="系统名称"></el-table-column>
        <el-table-column label="状态" width="120" align="center">
          <template>
            <span type="text" style="color: #409eff">可用</span>
          </template>
        </el-table-column>
      </datablau-table>
      <span slot="footer">
        <datablau-pagination
          class="turn-pages"
          @size-change="handleStatusSizeChange"
          @current-change="handleStatusCurrentChange"
          :current-page.sync="statusPage"
          :page-sizes="[10, 20, 50]"
          :page-size="statusSize"
          layout="total, sizes, prev, jumper, next"
          :total="statusTotal"
        ></datablau-pagination>
      </span>
    </datablau-dialog>
    <div class="gateway-header">
      <datablau-list-search style="margin-top: 10px">
        <div
          class="title"
          style="
            line-height: 34px;
            font-weight: 600;
            float: left;
            font-size: 16px;
          "
        >
          数据安全网关
        </div>
        <template slot="buttons">
          <datablau-button type="normal" @click="handleStatus">
            健康状况
          </datablau-button>
          <datablau-button type="normal" @click="teamManage">
            网关组管理
          </datablau-button>
          <datablau-button
            type="important"
            class="iconfont icon-tianjia"
            @click="handleAdd"
          >
            新增安全网关
          </datablau-button>
        </template>
      </datablau-list-search>
    </div>
    <div class="tabs-box">
      <datablau-form-submit>
        <datablau-table
          :show-column-selection="false"
          style="height: 100%"
          :data="tableData"
          :border="false"
          v-loading="loading"
          @selection-change="handleSelectionChange"
        >
          <el-table-column prop="groupId" label="网关组" show-overflow-tooltip>
            <template slot-scope="scope">
              <span>{{ scope.row.groupName }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="name"
            label="网关名称"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            prop="gatewayType"
            label="网关类型"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <span
                v-if="scope.row.gatewayType === 'DATAMASKING_GATEWAY'"
                class="datamasking-color"
              >
                脱敏网关
              </span>
              <span
                v-if="scope.row.gatewayType === 'PROXY_GATEWAY'"
                class="proxy-color"
              >
                透明网关
              </span>
            </template>
          </el-table-column>
          <el-table-column
            prop="modelId"
            label="数据源选择"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <!-- <database-type :value="'MYSQL'" :size="24"></database-type> -->
              <span>{{ scope.row.databaseName }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="servicePort"
            label="服务网关端口"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            prop="state"
            label="启动状态"
            header-align="center"
            align="center"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.state"
                @change="handleState(scope.row)"
              ></el-switch>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" align="center">
            <template slot-scope="scope">
              <div>
                <datablau-tooltip
                  effect="dark"
                  content="查看"
                  placement="bottom"
                >
                  <datablau-button type="text" @click="detail(scope.row)">
                    <i class="iconfont icon-see"></i>
                  </datablau-button>
                </datablau-tooltip>
                <datablau-tooltip
                  effect="dark"
                  :content="$t('common.button.edit')"
                  placement="bottom"
                >
                  <datablau-button type="text" @click="edit(scope.row)">
                    <i class="iconfont icon-bianji"></i>
                  </datablau-button>
                </datablau-tooltip>
                <datablau-tooltip
                  effect="dark"
                  content="删除"
                  placement="bottom"
                >
                  <datablau-button
                    type="text"
                    @click="deleteObject(scope.row)"
                    :disabled="scope.row.state"
                  >
                    <i class="iconfont icon-delete"></i>
                  </datablau-button>
                </datablau-tooltip>
              </div>
            </template>
          </el-table-column>
        </datablau-table>
        <template slot="buttons">
          <!-- <div class="query" @click="audit">
              <datablau-button type="text">IP扫描</datablau-button>
            </div> -->
          <datablau-pagination
            class="turn-pages"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page.sync="currentPage"
            :page-sizes="[20, 50, 100]"
            :page-size="pageSize"
            layout="total, sizes, prev, jumper, next"
            :total="total"
          ></datablau-pagination>
        </template>
      </datablau-form-submit>
    </div>
  </div>
</template>

<script>
import Index from './index.js'
export default Index
</script>

<style scoped lang="scss">
.error-input {
  /deep/ .el-input__inner {
    border-color: #f56c6c;
    &::placeholder {
      color: #f56c6c;
    }
  }
}
.add-team {
  /deep/ span {
    margin-left: 6px;
  }
}
.datablau-table-border {
  /deep/ .el-table__body {
    .el-table__row {
      border-bottom: 1px solid red;
      box-sizing: border-box;
    }
  }
}
.edit--table-input {
  /deep/ .el-input {
    height: 30px;
    line-height: 30px;
    .el-input__inner {
      line-height: 28px;
      height: 30px;
    }
    .el-input_suffix {
      line-height: 28px;
      height: 30px;
    }
  }
}
.gateway-types {
  height: 34px;
  .type {
    cursor: pointer;
    width: 272px;
    height: 50px;
    line-height: 50px;
    border: 1px solid #dddddd;
    border-radius: 2px;
    font-size: 14px;
    font-weight: 500;
    color: #555555;
    text-align: center;
    float: left;
    &:first-child {
      float: left;
      margin-right: 16px;
    }
    &.active-type {
      color: #409eff;
      border: 1px solid #409eff;
    }
    i {
      margin-right: 10px;
      font-size: 32px;
      vertical-align: middle;
    }
  }
}
.datamasking-color {
  height: 22px;
  line-height: 22px;
  display: inline-block;
  padding: 0 6px;
  color: #f28200;
  background-color: transparentize(#f28200, 0.9);
  border-radius: 2px;
}
.proxy-color {
  height: 22px;
  line-height: 22px;
  display: inline-block;
  padding: 0 6px;
  color: #40c2ff;
  background-color: transparentize(#40c2ff, 0.9);
  border-radius: 2px;
}
/deep/ .is-block.text {
  min-width: auto;
}
/deep/ .el-form-item {
  height: 34px;
  line-height: 34px;
  margin-bottom: 14px;
  &.el-form-item-50 {
    height: 50px;
    line-height: 50px;
    .el-form-item__label {
      height: 50px;
      line-height: 50px;
    }
    .el-form-item__content {
      height: 50px;
      line-height: 50px;
    }
  }
  .el-form-item__label {
    height: 34px;
    line-height: 34px;
  }
  .el-form-item__content {
    height: 34px;
    line-height: 34px;
  }
}
.no-edit-input {
  /deep/ .el-input__inner {
    border: 0;
  }
}
.page {
  /deep/ .datablau-pagination {
    float: left;
    text-align-last: left;
  }
}
.gateway-page {
  width: 100%;
  background-color: #fff;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  .gateway-header {
    padding: 0 20px;
  }
  .tabs-box {
    position: absolute;
    top: 54px;
    left: 0px;
    right: 0px;
    bottom: 0px;
    /deep/ .datablau-table {
      height: 100%;

      .el-table__body-wrapper {
        position: absolute;
        top: 42px;
        left: 0px;
        right: 0px;
        bottom: 0px;
        overflow: auto;
      }
    }
  }
  .query {
    float: left;
  }
  .turn-pages {
    vertical-align: middle;
  }
}
</style>
