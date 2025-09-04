<template>
  <div class="detail-outer">
    <el-dialog
      style="margin-top: 20px"
      :title="(currentObject ? '修改' : '新增') + '业务活动'"
      size="m"
      width="640px"
      :visible.sync="showObjectDialog"
      v-if="showObjectDialog"
      append-to-body
      :close-on-click-modal="false"
    >
      <object-detail
        :detail="currentObject"
        @saveAndClose="saveAndClose"
        @close="close"
      ></object-detail>
    </el-dialog>
    <datablau-dialog
      class="object-dialog"
      :title="damUsageDialogTitle"
      size="m"
      height="400"
      :visible.sync="showDamUsageDialog"
      v-if="showDamUsageDialog"
    >
      <dam-usage-data
        :objectData="currentObject"
        @close="handleDamUsageClose"
        class="reference-table"
      ></dam-usage-data>
    </datablau-dialog>

    <div class="title-line">
      <span class="title oneline-eclipse" :title="detail.name">
        {{ detail.name }}
      </span>
      <datablau-button
        size="mini"
        type="text"
        style="margin-left: 1em"
        @click="changeToEditMode"
        v-if="hasAccess"
      >
        <i class="el-icon-edit"></i>
        编辑
      </datablau-button>
    </div>
    <div class="description-line">
      <!--<div class="description" v-html="n2br(detail.description)"></div>-->
      <div class="details-box">
        <div class="detail">
          <span class="label">业务流程编号</span>
          <span class="value">{{ detail.flowCode }}</span>
        </div>
        <div class="detail">
          <span class="label">业务域</span>
          <span class="value">{{ detail.path0 }}</span>
        </div>
        <div class="detail">
          <span class="label">一级业务职能</span>
          <span class="value">{{ detail.path1 }}</span>
        </div>
        <div class="detail">
          <span class="label">二级业务职能</span>
          <span class="value">{{ detail.path2 }}</span>
        </div>
        <div class="detail">
          <span class="label">三级业务职能</span>
          <span class="value">{{ detail.path3 }}</span>
        </div>
        <div class="detail" v-if="detail.pathMore">
          <span class="label">三级以下业务职能</span>
          <span class="value">{{ detail.pathMore.split(';').join('/') }}</span>
        </div>
        <!--<div class="detail">
          <span class="label">确认的数据对象</span>
          <span class="value">{{detail.confirmedBusiObj}}</span>
        </div>-->
      </div>
    </div>
    <div class="prop-line alg-line" v-if="objects">
      <div class="title">业务活动</div>
      <datablau-button
        type="text"
        style="float: right"
        @click="modifyObject"
        size="mini"
      >
        <i class="el-icon-plus"></i>
        新增业务活动
      </datablau-button>
      <div class="details-box">
        <datablau-table
          v-if="showTable"
          class="plain-table"
          :data="objects"
          :max-height="400"
        >
          <el-table-column
            min-width="140"
            show-overflow-tooltip
            label="活动名称"
          >
            <template slot-scope="scope">
              <i class="tree-icon business-action"></i>
              {{ scope.row.busiName }}
            </template>
          </el-table-column>
          <el-table-column
            min-width="120"
            show-overflow-tooltip
            prop="busiCode"
            label="活动编号"
          ></el-table-column>
          <!--<el-table-column
            min-width="120"
            show-overflow-tooltip
            prop="inputObj"
            label="输入数据对象"
          ></el-table-column>
          <el-table-column
            min-width="120"
            show-overflow-tooltip
            prop="outputObj"
            label="输出数据对象"
          ></el-table-column>-->
          <el-table-column
            min-width="120"
            prop="crossAreas"
            show-overflow-tooltip
            label="是否跨主题域"
          ></el-table-column>
          <el-table-column
            min-width="140"
            show-overflow-tooltip
            prop="isRecommend"
            label="是否建议主数据对象"
          ></el-table-column>
          <el-table-column
            min-width="160"
            show-overflow-tooltip
            label="负责部门"
          >
            <template slot-scope="scope">
              {{
                scope.row.departments ? scope.row.departments.join('; ') : ''
              }}
            </template>
          </el-table-column>
          <el-table-column
            min-width="160"
            show-overflow-tooltip
            label="对应源系统的表"
          >
            <template slot-scope="scope">
              {{ scope.row.srcTable ? scope.row.srcTable.join('; ') : '' }}
            </template>
          </el-table-column>
          <el-table-column
            min-width="120"
            show-overflow-tooltip
            prop="srcSys"
            label="对应源系统名称"
          ></el-table-column>
          <el-table-column
            label="操作"
            align="center"
            fixed="right"
            :min-width="240"
          >
            <template slot-scope="scope">
              <datablau-button
                class="operation-text-btn"
                type="text"
                size="mini"
                @click="showUsageTableAndView(scope.row)"
              >
                查看数据对象
              </datablau-button>
              <datablau-button
                class="operation-text-btn"
                type="text"
                size="mini"
                @click="modifyObject(scope.row)"
              >
                修改
              </datablau-button>
              <datablau-button
                class="operation-text-btn"
                type="text"
                size="mini"
                @click="deleteObject(scope.row)"
              >
                {{ $t('common.button.delete') }}
              </datablau-button>
            </template>
          </el-table-column>
        </datablau-table>
      </div>
    </div>
  </div>
</template>

<script>
import code from './scan.js'
export default code
</script>

<style scoped lang="scss">
@import './scan.scss';

// 弹出框样式
.el-dialog__wrapper {
  &.object-dialog {
    /deep/ .el-dialog {
      min-height: 465px;
    }
  }
  /deep/ .el-dialog {
    margin-top: 20px !important;
    position: relative;
    padding-top: 50px;
    padding-bottom: 20px;
    // padding-bottom: 64px;
    min-height: 490px;
    overflow: hidden;
    .el-dialog__header {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      box-sizing: border-box;
      height: 50px;
      line-height: 50px;
      padding: 0 20px;
      box-sizing: border-box;
      border-bottom: 1px solid #ddd;
      margin-bottom: 10px;

      .el-dialog__headerbtn {
        top: 0px;

        i {
          font-size: 14px;
        }
      }

      .el-dialog__title {
        color: #555;
        font-weight: 500;
      }
    }

    .el-dialog__body {
      padding-top: 0;
      overflow: auto;
      margin-top: 10px;
      padding-bottom: 0;

      .form-item-footer {
        // position: absolute;
        bottom: 20px;
        left: 0;
        width: 100%;
        // padding: 0 20px;
        text-align: right;
      }
    }

    .el-dialog__footer {
      padding-bottom: 0;
    }
  }
}
</style>

<style lang="scss">
.reference-table {
  // min-height: 300px;
}
</style>
