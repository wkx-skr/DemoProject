<template>
  <div class="table-box">
    <el-upload
      style="z-index: -9999; height: 0"
      :action="importUrl"
      :show-file-list="false"
      :on-success="onUploadSuccess"
      :headers="$headers"
      :on-error="onUploadError"
    >
      <el-button type="text" size="small" ref="uploadBtn"></el-button>
    </el-upload>
    <datablau-dialog
      :title="$t('meta.DS.udp.udp')"
      :visible.sync="showUdps"
      v-if="showUdps"
      :close-on-click-modal="true"
      append-to-body
      size="l"
    >
      <set-udp
        @closeSetUp="closeSetUp"
        @update-udps="updateUdps"
        :type-id="String(ldmType)"
      ></set-udp>
    </datablau-dialog>
    <datablau-folder-header
      style="margin-left: -20px"
      :data-title="folderDetail.name"
      :data-description="folderDetail.description"
      :key="headerKey"
      v-show="!isRoot"
    >
      <div slot="buttons">
        <el-dropdown
          v-if="!isRoot"
          style="float: right; vertical-align: top; margin-left: 10px"
          @command="handleAddCommand"
          trigger="click"
        >
          <datablau-button class="">
            {{ $t('quality.page.ruleTemplate.moreOperation') }}
            <i class="el-icon-arrow-down el-icon--right"></i>
          </datablau-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              command="showUdpDialog"
              icon="iconfont icon-expand"
            >
              {{ $t('indicator.dimension.udp') }}
            </el-dropdown-item>
            <el-dropdown-item command="importIndex" icon="iconfont icon-import">
              {{ $t('quality.page.ruleTemplate.button.import') }}
            </el-dropdown-item>
            <el-dropdown-item command="exportIndex" icon="iconfont icon-export">
              {{ $t('quality.page.ruleTemplate.button.export') }}
            </el-dropdown-item>
            <el-dropdown-item
              command="downloadTemplate"
              icon="iconfont icon-download"
            >
              {{ $t('system.systemSetting.downloadTemplate') }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </datablau-folder-header>
    <datablau-list-search style="padding: 9px 20px 0 0">
      <div>
        <datablau-input
          v-model="searchFormData.name"
          :style="{
            width:
              modifierCategory === ModifierCategory.BASE ? '280px' : '330px',
          }"
          :placeholder="Label.searchPlaceholder"
          clearable
          iconfont-state
        ></datablau-input>
        <datablau-checkbox></datablau-checkbox>
      </div>
      <template slot="buttons">
        <datablau-button
          type="important"
          class="iconfont icon-tianjia"
          @click="addItem"
        >
          {{ Label.new }}
        </datablau-button>
        <el-dropdown
          v-if="isRoot"
          style="float: right; vertical-align: top; margin-left: 10px"
          @command="handleAddCommand"
          trigger="click"
        >
          <datablau-button class="">
            {{ $t('quality.page.ruleTemplate.moreOperation') }}
            <i class="el-icon-arrow-down el-icon--right"></i>
          </datablau-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              command="showUdpDialog"
              icon="iconfont icon-expand"
            >
              {{ $t('indicator.dimension.udp') }}
            </el-dropdown-item>
            <el-dropdown-item command="importIndex" icon="iconfont icon-import">
              {{ $t('quality.page.ruleTemplate.button.import') }}
            </el-dropdown-item>
            <el-dropdown-item command="exportIndex" icon="iconfont icon-export">
              {{ $t('quality.page.ruleTemplate.button.export') }}
            </el-dropdown-item>
            <el-dropdown-item
              command="downloadTemplate"
              icon="iconfont icon-download"
            >
              {{ $t('system.systemSetting.downloadTemplate') }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
    </datablau-list-search>
    <!--  .table-area使用绝对定位，top默认值50px，需根据实际情况进行覆盖    -->
    <div class="table-area" :class="{ 'has-top': !isRoot }">
      <datablau-table
        :data="tableData"
        height="100%"
        data-selectable
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          :label="Label.code"
          prop="code"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :label="Label.name"
          prop="name"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          label="英文名称"
          prop="englishName"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          label="英文简称"
          prop="abbrName"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          v-if="modifierCategory === ModifierCategory.BASE"
          label="来源数据标准"
          prop="domain"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          label="业务定义"
          prop="businessDefinition"
          show-overflow-tooltip
          :min-width="160"
        ></el-table-column>
        <el-table-column
          label="最后更新时间"
          prop="updateTime"
          :min-width="160"
          :formatter="$timeFormatter"
        ></el-table-column>
        <el-table-column
          label="操作"
          header-align="left"
          align="left"
          fixed="right"
          :width="74"
        >
          <template slot-scope="scope">
            <datablau-button type="icon" @click="editItem(scope.row)">
              <datablau-tooltip
                :content="$t('common.button.edit')"
                placement="bottom"
                :open-delay="500"
              >
                <i class="iconfont icon-bianji"></i>
              </datablau-tooltip>
            </datablau-button>
            <datablau-button type="icon" @click="deleteItem(scope.row)">
              <datablau-tooltip
                :content="$t('common.button.delete')"
                placement="bottom"
                :open-delay="500"
              >
                <i class="iconfont icon-delete"></i>
              </datablau-tooltip>
            </datablau-button>
            <!--<datablau-button
              type="icon"
              class="iconfont icon-see"
              from-table
              @click="viewItem(scope.row)"
              :tooltip-content="$t('common.button.scan')"
              :tooltip-options="{ placement: 'top' }"
            ></datablau-button>-->
            <!--            <datablau-button type="text" from-table @click="handleEdit(scope.row)">编辑</datablau-button>-->
            <!--            <datablau-button type="text" from-table>删除</datablau-button>-->
          </template>
        </el-table-column>
      </datablau-table>
    </div>
    <div class="row-page-info">
      <span v-if="multipleLength" class="check-info"></span>
      <span v-if="multipleLength" class="footer-row-info">
        {{
          $t('common.deleteMessage', {
            selection: multipleLength,
          })
        }}
      </span>
      <datablau-button
        class="iconfont icon-export"
        @click="exportIndexByIds"
        v-show="multipleLength"
      >
        {{ $t('common.button.export') }}
      </datablau-button>
      <datablau-button
        type="danger"
        class="iconfont icon-delete"
        @click="deleteItems"
        v-show="multipleLength"
      >
        {{ $t('common.button.delete') }}
      </datablau-button>
      <datablau-pagination
        style="padding-top: 10px; float: right"
        class="ddc-pagination"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[20, 50, 100, 500]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></datablau-pagination>
    </div>
  </div>
</template>
<script>
import Table from './tables.js'
export default Table
</script>
<style lang="scss" scoped>
@import '~@/next/components/basic/color.sass';
@import '../indexManagement/base';
</style>
