<template>
  <div class="gateway-page">
    <!-- 新建安全网关 -->
    <datablau-dialog
      :title="dialogTitle"
      :visible.sync="addDialog"
      v-if="addDialog"
      :close-on-click-modal="false"
      size="m"
      :height="form.custom ? 510 : 410"
    >
      <el-form
        :model="form"
        ref="addForm"
        label-width="110px"
        class="demo-ruleForm"
      >
        <el-form-item
          label="网关名称"
          prop="name"
          :rules="[{ required: true, message: '网关名称不能为空' }]"
        >
          <datablau-input
            type="text"
            v-model="form.name"
            style="width: 480px"
          ></datablau-input>
        </el-form-item>
        <el-form-item
          label="采集名称"
          prop="modelId"
          :rules="[
            { required: true, message: '采集名称不能为空', trigger: 'change' },
          ]"
        >
          <el-select
            filterable
            v-model="form.modelId"
            placeholder="请选择采集名称"
            style="width: 480px"
          >
            <el-option
              :label="item.definition"
              :value="item.modelId"
              v-for="item in gatherList"
              :key="item.modelId"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="服务网关端口"
          prop="port"
          :rules="[{ required: true, message: '端口不能为空' }]"
        >
          <datablau-input
            v-model.number="form.port"
            style="width: 480px"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="用户登录方式" prop="custom">
          <datablau-radio v-model="form.custom">
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
          v-if="form.custom"
          label="用户名"
          prop="serviceUsername"
          :rules="[{ required: true, message: '用户名不能为空' }]"
        >
          <datablau-input
            style="width: 480px"
            type="text"
            v-model="form.serviceUsername"
          ></datablau-input>
        </el-form-item>
        <el-form-item
          v-if="form.custom"
          label="密码"
          prop="servicePassword"
          :rules="[{ required: true, message: '密码不能为空' }]"
        >
          <datablau-input
            style="width: 480px"
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
            style="width: 480px"
          >
            <el-option
              :label="item.name"
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
    <!-- 编辑安全网关 -->
    <datablau-dialog
      :title="dialogTitle"
      :visible.sync="editDialog"
      :close-on-click-modal="false"
      size="m"
      :height="editForm.custom ? 460 : 360"
    >
      <el-form
        :model="editForm"
        ref="editForm"
        label-width="110px"
        class="demo-ruleForm"
      >
        <el-form-item label="采集名称：" prop="modelName">
          <span>{{ editForm.modelName }}</span>
        </el-form-item>
        <el-form-item label="服务网关端口：" prop="port">
          <span>{{ editForm.port }}</span>
        </el-form-item>
        <el-form-item
          label="网关名称"
          prop="name"
          :rules="[{ required: true, message: '名称不能为空' }]"
        >
          <datablau-input
            type="text"
            v-model="editForm.name"
            style="width: 480px"
          ></datablau-input>
        </el-form-item>
        <el-form-item
          v-if="editForm.custom"
          label="用户名"
          prop="serviceUsername"
          :rules="[{ required: true, message: '用户名不能为空' }]"
        >
          <datablau-input
            style="width: 480px"
            type="text"
            v-model="editForm.serviceUsername"
          ></datablau-input>
        </el-form-item>
        <el-form-item
          v-if="editForm.custom"
          label="密码"
          prop="servicePassword"
          :rules="[{ required: true, message: '密码不能为空' }]"
        >
          <datablau-input
            style="width: 480px"
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
            style="width: 480px"
          >
            <el-option
              :label="item.name"
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
      :height="editForm.custom ? 465 : 370"
      :before-close="handleClose"
    >
      <el-form :model="editForm" ref="editForm" label-width="120px">
        <el-form-item label="网关名称：" prop="name">
          <span>{{ editForm.name }}</span>
        </el-form-item>
        <el-form-item label="采集名称：" prop="modelName">
          <span>{{ editForm.modelName }}</span>
        </el-form-item>
        <el-form-item label="服务网关连接IP：" prop="datablauConnectUrl">
          <span>{{ editForm.datablauConnectUrl }}</span>
        </el-form-item>
        <el-form-item label="启动状态：" prop="enable">
          <span>{{ editForm.enable == 1 ? '已启动' : '已关闭' }}</span>
        </el-form-item>

        <el-form-item label="登录类型状态：" prop="custom">
          <span>
            {{ editForm.custom ? '自定义账号登录' : 'DAM账号登录' }}
          </span>
        </el-form-item>
        <el-form-item
          label="账号："
          prop="serviceUsername"
          v-if="editForm.custom"
        >
          <span>{{ editForm.serviceUsername }}</span>
        </el-form-item>
        <el-form-item
          label="密码："
          prop="servicePassword"
          v-if="editForm.custom"
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
        <el-table-column prop="name" label="网关组">
          <template slot-scope="scope">
            <datablau-input
              :id="'group-name-' + scope.row.index"
              class="edit--table-input"
              :class="{ 'no-edit-input': scope.row.edit }"
              placeholder="请输入网关组名称"
              :disabled="scope.row.edit"
              clearable
              v-model="scope.row.name"
              @input="changeInput($event, scope.row)"
            ></datablau-input>
          </template>
        </el-table-column>
        <el-table-column prop="code" label="网关组编码">
          <template slot-scope="scope">
            <datablau-input
              :id="'group-code-' + scope.row.index"
              class="edit--table-input"
              :class="{ 'no-edit-input': scope.row.edit }"
              placeholder="请输入网关组编码"
              :disabled="canEdit(scope.row)"
              clearable
              v-model="scope.row.code"
              @input="changeInputCode($event, scope.row)"
            ></datablau-input>
          </template>
        </el-table-column>
        <!-- <el-table-column prop="nodes" label="系统名称">
          <template slot-scope="scope">
            {{ (scope.row.nodes || []).join(',') }}
          </template>
        </el-table-column>
        <el-table-column
          prop="online"
          label="状态"
          header-align="center"
          align="center"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <el-switch v-model="scope.row.online" :disabled="true"></el-switch>
          </template>
        </el-table-column> -->
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
        <!-- <div class="page">
          <datablau-pagination
            class="turn-pages"
            @size-change="handleTeamSizeChange"
            @current-change="handleTeamCurrentChange"
            :current-page.sync="teamPage"
            :page-sizes="[10, 20, 50]"
            :page-size="teamSize"
            layout="total, sizes, prev, pager, next"
            :total="teamTotal"
          ></datablau-pagination>
        </div> -->
        <datablau-button type="secondary" @click="closeTeam">
          关 闭
        </datablau-button>
      </span>
    </datablau-dialog>
    <template v-if="listShow">
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
            <datablau-button
              type="normal"
              class="iconfont icon-download"
              @click="exportJdbc"
            >
              网关驱动下载
            </datablau-button>
            <datablau-button type="normal" @click="teamManage">
              网关组管理
            </datablau-button>
            <datablau-button
              type="important"
              class="iconfont icon-tianjia"
              @click="handleAdd"
            >
              新建
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
            <el-table-column
              prop="groupName"
              label="网关组"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              prop="lable"
              label="网关名称"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              prop="modelId"
              label="采集名称"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <span>{{ scope.row.modelName }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="port"
              label="服务网关端口"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              prop="enable"
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
          <!-- <template slot="buttons">
          <datablau-pagination
            class="turn-pages"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page.sync="currentPage"
            :page-sizes="[20, 50, 100]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
          ></datablau-pagination>
        </template> -->
        </datablau-form-submit>
      </div>
    </template>
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
