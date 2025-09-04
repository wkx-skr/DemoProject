<template>
  <div id="problemProgramme">
    <datablau-list-search style="margin: 0 20px">
      <template slot="title">
        <div>{{ $t('common.page.problemProgramme') }}</div>
      </template>
      <div>
        <el-form>
          <el-form-item>
            <datablau-input
              maxlength="256"
              clearable
              v-model="searchWord"
              :iconfont-state="true"
              :placeholder="$t('quality.page.problemProgramme.searchWord')"
              @keyup.enter.native="filter"
            ></datablau-input>
          </el-form-item>
        </el-form>
      </div>
      <template slot="buttons">
        <datablau-button
          type="important"
          @click="addTab"
          style="margin-right: 10px"
        >
          {{ $t('quality.page.problemProgramme.newScheme') }}
        </datablau-button>
        <datablau-dropdown
          trigger="click"
          class="rightButton two2"
          style="display: inline-block"
        >
          <datablau-button
            type="secondary"
            class="el-dropdown-link rightButton"
          >
            {{ $t('common.button.more') }}
            <i class="el-icon-arrow-down el-icon--right"></i>
          </datablau-button>
          <el-dropdown-menu style="margin-top: 4px" slot="dropdown">
            <el-dropdown-item
              icon="el-icon-upload"
              @click.native="importScheme"
            >
              {{ $t('quality.page.problemProgramme.importScheme') }}
            </el-dropdown-item>
            <el-dropdown-item
              icon="el-icon-download"
              @click.native="exportTask"
            >
              {{ $t('quality.page.problemProgramme.downloadTemplate') }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </datablau-dropdown>
      </template>
    </datablau-list-search>

    <datablau-form-submit style="margin-top: 84px">
      <datablau-table
        ref="multipleTable"
        :data="tableData"
        tooltip-effect="dark"
        style="width: 100%; height: 100%"
        height="100%"
        v-loading="loading"
        :header-cell-style="{
          color: '#494850',
          'font-size': '12px',
          'font-weight': 'bold',
        }"
        @selection-change="handleSelectionChange"
        :data-selectable="option.selectable"
        :auto-hide-selection="option.autoHideSelectable"
        :show-column-selection="option.showColumnSelection"
        :column-selection="option.columnSelection"
        :border="option.columnResizable"
      >
        <el-table-column width="18">
          <datablau-icon
            :data-type="'repairjob'"
            :size="18"
            style="margin-top: 8px"
          ></datablau-icon>
        </el-table-column>
        <el-table-column
          prop="name"
          :label="$t('quality.page.problemProgramme.programmeName')"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="creator"
          :label="$t('quality.page.problemProgramme.creator')"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="createTime"
          :label="$t('quality.page.problemProgramme.createTime')"
          :formatter="$timeFormatter"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :label="$t('quality.page.problemProgramme.operation')"
          align="center"
          width="200"
          fixed="right"
        >
          <template slot-scope="scope">
            <datablau-button
              type="icon"
              @click.stop="handleRowClick(scope.row)"
              :title="$version.button.scan"
            >
              <i class="iconfont icon-see"></i>
            </datablau-button>
            <datablau-button
              type="icon"
              :disabled="scope.row.builtIn === 1"
              :title="$version.button.edit"
              @click.stop="addEdit(scope.row)"
            >
              <i class="iconfont icon-bianji"></i>
            </datablau-button>
          </template>
        </el-table-column>
      </datablau-table>
      <template slot="buttons">
        <div class="left-button" v-show="!deleteDisabled">
          <span class="check-info"></span>
          <span class="footer-row-info">
            {{
              $t('common.deleteMessage', {
                selection: selection.length,
              })
            }}
          </span>
          <datablau-button
            type="danger"
            class="el-icon-delete"
            @click="deleteThis"
            :disabled="deleteDisabled"
          >
            {{ $t('domain.common.delete') }}
          </datablau-button>
        </div>
        <datablau-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page.sync="currentPage"
          :page-sizes="[20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          style="display: inline-block; float: right"
        ></datablau-pagination>
      </template>
    </datablau-form-submit>
    <div class="our-detail" v-if="showDetaiil">
      <div class="model-item-page-title">
        <datablau-breadcrumb
          style="height: auto; line-height: initial; display: inline-block"
          :node-data="nodeData"
          @back="removeTab"
          @nodeClick="nodeClick"
        ></datablau-breadcrumb>
      </div>
      <addOrEdit v-if="showTab === 'add'" @removeTab="removeTab"></addOrEdit>
      <addOrEdit
        v-if="showTab === 'scan'"
        @removeTab="removeTab"
        :type="'scan'"
        :detailId="detailId"
      ></addOrEdit>
      <addOrEdit
        v-if="showTab === 'edit'"
        @removeTab="removeTab"
        :type="'edit'"
        :detailId="detailId"
      ></addOrEdit>
    </div>
    <el-upload
      style="z-index: -9999; height: 0"
      :action="$quality_url + '/quality/dispatch/uploadTemplate'"
      :show-file-list="false"
      v-if="showUpload"
      :before-upload="showBegain"
      :on-success="handleUpdateMetadataSuccess"
      :headers="$headers"
      :on-error="handleUpdateMetadataError"
    >
      <el-button type="text" size="small" ref="updateTemplate"></el-button>
    </el-upload>
  </div>
</template>

<script>
import main from './main.js'
export default main
</script>

<style lang="scss">
@import '~@/next/components/basic/color.sass';
#problemProgramme {
  width: 100%;
  background-color: var(--default-bgc);
  position: absolute;
  top: 0;
  bottom: 0;
  overflow: auto;
  .left-button {
    position: absolute;
    top: 50%;
    -webkit-transform: translateY(-50%);
    transform: translateY(-50%);
    left: 20px;
    .check-info {
      width: 14px;
      height: 14px;
      display: inline-block;
      background: $primary-color;
      margin-right: -13px;
      vertical-align: middle;
    }
    .footer-row-info {
      height: 50px;
      margin-right: 10px;
      &:before {
        content: '\e6da';
        font-family: 'element-icons';
        font-size: 12px;
        font-weight: 200;
        margin-right: 5px;
        vertical-align: middle;
        line-height: 13px;
        color: white;
      }
    }
  }
}
.our-detail {
  background: #fff;
  position: absolute;
  width: 100%;
  z-index: 12;
  top: 0;
  bottom: 0;
  .model-item-page-title {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    z-index: 9;
    height: 40px;
    margin: 0 20px;
    font-size: 16px;
    // line-height: 40px;
    padding-top: 8px;
    background: var(--default-bgc);
    border-bottom: 1px solid var(--border-color-lighter);
    // border-bottom: 1px solid red;
    button {
      margin-top: 8px;
    }
    .item-title {
      font-size: 18px;
    }
    .bottom-line {
      position: absolute;
      right: 20px;
      bottom: 0;
      left: 20px;
      display: inline-block;
      border-bottom: 1px solid #ddd;
    }
  }
}
</style>
