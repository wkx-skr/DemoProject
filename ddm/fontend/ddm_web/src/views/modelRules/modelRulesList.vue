<template>
  <div class="content-area">
    <datablau-dialog
      :title="$v.RuleChecking.releaseVersion"
      :visible.sync="editionDialogVisible"
      ref="editionDialog"
      width="480px"
      height="290"
      :close-on-click-modal="false"
      append-to-body
      custom-class="release-version-dialog rule-version-dialog"
    >
      <el-form ref="releaseVersion" label-position="right" label-width="80px" size="mini" :rules="editionRules" :model="editionArr">
        <el-form-item :label="$v.RuleChecking.versionNumber" prop="editionCode">
          <datablau-input style="width: 100%" v-model="editionArr.editionCode"></datablau-input>
        </el-form-item>
        <el-form-item :label="$v.RuleChecking.versionDescription" prop="message">
          <datablau-input
            class="rule-version-description"
            style="width:100%;resize: none;" type="textarea"
            v-model="editionArr.message"
          ></datablau-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <datablau-button
          size="small"
          style="margin-top:10px;"
          @click="closeEditionDialog"
          type="cancel"
        ></datablau-button>
         <datablau-button
           size="small"
           type="primary"
           style="margin-top:10px;"
           @click="saveEdition"
           :disabled="!canSave"
         >确定</datablau-button>
       </span>
    </datablau-dialog>
    <div class="top-header-info-panel-wrapper">
      <b>{{ $v.RuleChecking.modelRuleManagement }}</b>
      <p
        class="version-title"
        style="display: inline-block;font-size: 12px;padding-left:10px;color: #777777;"
      >
        {{ $v.RuleChecking.currentRelease }}：
        <span v-if="versionArr.length !== 0">
          <span style="margin-right:10px">【{{ versionArr.curVer }}】</span>
          <span v-if="versionArr.length !== 0">{{ $timeFormatter(versionArr.createTime) }}</span> by
          <span>{{ versionArr.creator }}</span>
          <span
            class="split-line"
            style="display: inline-block;border-left: 2px solid #DCDFE6; vertical-align: text-bottom; height:15px; margin: 3px 10px 0;"
          > </span>
          <span>版本描述</span>
          <datablau-tooltip
            class="item" effect="dark" :content="versionArr.message" placement="top"
          >
            <i class="iconfont icon-tips" style="display: inline-block;margin-left:4px;font-size: 14px;"></i>
          </datablau-tooltip>

      </span>
        <span class="version-title2" v-if="versionArr.length === 0">{{ $v.RuleChecking.unPublished }}</span>
      </p>

      <!--<datablau-button-->
      <!--    type="text"-->
      <!--    size="small"-->
      <!--    class="publish-button"-->
      <!--    @click="releaseVersion"-->
      <!--&gt;-->
      <!--  {{ $v.RuleChecking.publishRuleVersion }}-->
      <!--</datablau-button>-->
    </div>
    <div class="top-title">
      <datablau-input
          size="small"
          :iconfont-state="true"
          v-model="keyword"
          placeholder="搜索编码"
      ></datablau-input>

      <!--数据库类型-->
      <div class="screenBox">
        <span class="label">模型类型</span>
        <datablau-select
          size="small"
          style="display:inline-block;width: 140px"
          v-model="searchArr.dataBaseValue"
          clearable
          filterable
          placeholder="请选择"
        >
          <el-option-group
            v-for="group in dataBaseArr"
            :key="group.type"
            :label="isEN ? group.type : group.name">
            <el-option
              v-for="item in group.dataSourceTypeList"
              :value="item.second"
              :label="item.text2 || item.text"
              :key="item.second"
            ></el-option>
          </el-option-group>
        </datablau-select>
      </div>

      <!--严重程度-->
      <div class="screenBox">
        <span class="label">{{ $v.RuleChecking.severity }}</span>
        <datablau-select size="small" style="display:inline-block;width: 100px" v-model="searchArr.severityValue"
                         clearable>
          <el-option
              v-for="item in severityArr"
              :value="item.name"
              :label="item.label"
              :key="item.name"
          ></el-option>
        </datablau-select>
      </div>

      <!--状态-->
      <div class="screenBox">
        <span class="label">{{ $v.RuleChecking.state }}</span>
        <datablau-select
            size="small" style="display:inline-block;width: 100px"
            v-model="searchArr.stateValue"
            clearable
        >
          <el-option
              v-for="item in stateArr"
              :value="item.name"
              :label="item.label"
              :key="item.name"
          ></el-option>
        </datablau-select>
      </div>
      <div class="top-button">
        <datablau-button
          type="important"
          size="small"
          class="publish-button iconfont icon-publish"
          @click="releaseVersion"
        >
          {{ $v.RuleChecking.publishRuleVersion }}
        </datablau-button>
        <datablau-button
          type="important" size="small" style="float:right;margin-right:20px" @click="addModelRules"
          class="icon-tianjia iconfont"
        >
          {{ $v.RuleChecking.createRule }}
        </datablau-button>
      </div>
    </div>
    <datablau-form-submit class="submit-component rule-table">
      <datablau-table
        :data="tableData"
        row-class-name="row-can-click1"
        height="100%"
        v-loading="loadingTableData"
      >
        <!--编码-->
        <el-table-column
          prop="name"
          :label="$v.RuleChecking.number"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <datablau-list-icon dataType="icon-menu-gzgl"></datablau-list-icon>
            {{ scope.row.code }}
          </template>
        </el-table-column>

        <!--对象-->
        <el-table-column
            width="100"
            prop="name"
            :label="$v.RuleChecking.obj"
            show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span class="type-box " :class="'a' + scope.row.typeId">{{ typeIdArr[scope.row.typeId] }}</span>
          </template>
        </el-table-column>

        <!--严重程度-->
        <el-table-column
            width="150"
            prop="name"
            :label="$v.RuleChecking.severity"
            show-overflow-tooltip
        >
          <template slot-scope="scope">
            <div class="severity">
              <!--<div class="dot" :class="scope.row.ruleSeverity"></div>-->
              <div class="dot" :class="scope.row.severity"></div>
              {{ scope.row.severity }}
            </div>
          </template>
        </el-table-column>

        <!--描述-->
        <el-table-column
            min-width="200"
            prop="tagDef"
            :label="$v.RuleChecking.describe"
            show-overflow-tooltip
        >
          <template slot-scope="scope">
            {{ scope.row.message }}
          </template>
        </el-table-column>

        <!--数据库类型-->
        <el-table-column
            prop="name"
            :label="$v.RuleChecking.applicationDatabaseType"
            min-width="100"
            show-overflow-tooltip
        >
          <template slot-scope="scope">
            {{ scope.row.dbTypes.map(item => databaseTypeMap[item]).join(', ') }}
          </template>
          <!--<template slot-scope="scope">-->
          <!--  <span v-for="(type, index) in scope.row.dbTypes" :key="index">-->
          <!--    <Database-Type-->
          <!--        style="display:inline-block"-->
          <!--        :key="type"-->
          <!--        :value="type"-->
          <!--        :size="24"-->
          <!--    ></Database-Type>-->
          <!--    <i v-if="(index+1) !== scope.row.dbTypes.length">、</i></span>-->
          <!--</template>-->
        </el-table-column>

        <!--创建人-->
        <el-table-column
            width="80"
            prop="name"
            :label="$v.RuleChecking.founder"
            show-overflow-tooltip
        >
          <template slot-scope="scope">
            {{ scope.row.creator }}
          </template>
        </el-table-column>

        <!--创建时间-->
        <el-table-column
            width="120"
            prop="createTime"
            :label="$v.RuleChecking.time"
            :formatter="$timeFormatter"
            show-overflow-tooltip
            header-align="center"
        >
        </el-table-column>

        <!--状态-->
        <el-table-column
            width="100"
            prop="name"
            label="启用状态"
            show-overflow-tooltip
            align="center"
        >
          <template slot-scope="scope">
            <datablau-switch
              style="margin-right: 5px;"
              v-model="scope.row.enable"
              @change="enableState(scope.row)"
            ></datablau-switch>
          </template>
        </el-table-column>

        <!--操作-->
        <el-table-column
            :label="$v.RuleChecking.operation"
            width="120"
            header-align="center"
            align="center"
            fixed="right"
        >
          <template slot-scope="scope">
            <!-- <i class="el-icon-edit-outline" @click="initEditTag(scope.row)"></i>
            <i class="el-icon-delete" @click="deleteTag(scope.row)"></i> -->
            <datablau-button
                type="text"
                @click="
                   seeRules(scope.row, 'see')
                  "
            >
              <datablau-tooltip
                  effect="dark"
                  :content="$v.RuleChecking.see"
                  placement="bottom"
              >
                <i class="iconfont icon-see"></i>
              </datablau-tooltip>
            </datablau-button>
            <datablau-button
                type="text"
                :disabled="scope.row.logicalType === 'IfElse'"
                @click="
                   seeRules(scope.row, 'edit')
                  "
            >
              <datablau-tooltip
                  effect="dark"
                  :content=" scope.row.logicalType === 'IfElse' ? '新版本不再支持 If/Else 类型规则的编辑' : $v.RuleChecking.edit "
                  placement="bottom"
              >
                <i class="iconfont icon-bianji"></i>
              </datablau-tooltip>
            </datablau-button>
            <datablau-button
                type="text"
                @click="
                   deleteRules(scope.row)
                  "
            >
              <datablau-tooltip
                  effect="dark"
                  :content="$v.RuleChecking.delete"
                  placement="bottom"
              >
                <i class="iconfont icon-delete"></i>
              </datablau-tooltip>
            </datablau-button>
          </template>
        </el-table-column>
      </datablau-table>
      <template slot="buttons">
        <datablau-pagination
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            :page-size="pageSize"
            :page-sizes="[20, 50, 100]"
            :current-page.sync="currentPage"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        ></datablau-pagination>
      </template>
    </datablau-form-submit>
  </div>
</template>

<script>
import main from './modelRulesList.js'
export default main
</script>

<style lang="scss" scoped>
@import '~@/next/components/basic/color.sass';
.content-area {
  z-index: 0;
  left: 0;

  .top-header-info-panel-wrapper {
    height: 40px;
    line-height: 40px;
    margin-top: -20px;
    vertical-align: top;

    .publish-button {
      display: inline-block;
      vertical-align: top;
      margin-left: 10px;
      margin-top: 7px;
    }

    b, p, span {
      vertical-align: top;
    }
  }

  .type-box {
    display: inline-block;
    width: 60px;
    height: 22px;
    border-radius: 2px;
    background: rgba(0, 136, 153, .1);
    color: #008899;
    text-align: center;
    line-height: 22px;

    &.a80000004, &.a80500008 {
      background: rgba(0, 149, 217, .1);
      color: #0095D9;
    }

    &.a80000006 {
      background: rgba(75, 92, 196, .1);
      color: #4B5CC4;
    }

    &.a80000005 {
      background: rgba(180, 76, 151, .1);
      color: #B44C97;
    }

    // 业务对象, 模型
    &.a80100073, &.a80010001 {
      background: rgba(64, 158, 255, .1);
      color: $primary-color;
    }
  }

  .severity {
    .dot {
      display: inline-block;
      margin-right: 6px;
      width: 10px;
      height: 10px;

      &.WARN {
        background: #FF8632;
      }

      &.ERROR {
        background: #FF2E2E;
      }

      &.INFO {
        background: #FFC009;
      }
    }
  }

  .submit-component {
    position: absolute;
    left: 0;
    right: 0;
    top: 73px;
    bottom: 0;

    .rule-table {
      left: 20px;
      right: 20px;

      .el-icon-edit-outline {
        font-size: 16px;
        margin-right: 18px;
        cursor: pointer;
      }

      .el-icon-delete {
        font-size: 16px;
        cursor: pointer;
      }
    }
  }
}

.is-block.text {
  padding-left: 4px;
  padding-right: 4px;
}

.datablau-switch {
  display: inline-block;
}

.top-title {
  margin-top: 0px;
  position: relative;

  .screenBox {
    display: inline-block;

    .label {
      font-size: 12px;
      margin-right: 10px;
      margin-left: 20px;
      font-weight: bold;
    }
  }

  .el-input {
    width: 200px;
    height: 34px;
    vertical-align: middle;
  }

  .top-button {
    position: absolute;
    right: 0;
    top: -1px;
  }
}

.fa {
  font-size: 16px;
  color: #4386F5;
}

.version-title2 {
  display: inline-block;
  font-size: 12px;
  background: rgb(237, 244, 255);
  color: rgb(70, 131, 245);
  width: 65px;
  height: 20px;
  text-align: center;
  line-height: 20px;
  margin-left: 5px;
  margin-top: 8px;
}
</style>
<style lang="scss">
.el-tooltip__popper {
  max-width: 60% !important;
}

.el-dialog__wrapper .release-version-dialog.rule-version-dialog.el-dialog {
  .el-dialog__body {
    bottom: 44px;
  }

  .el-dialog__footer {
    padding-top: 0;
    height: 54px;
    //border: 1px solid red;
  }
}

.rule-version-description .el-textarea .el-textarea__inner {
  resize: none;
  height: 92px;
}
</style>
