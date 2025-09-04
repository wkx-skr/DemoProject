<template>
  <div class="table-box">
    <el-upload
      style="z-index: -9999; height: 0"
      :action="
        '/domain/metricManagement/importMetric?categoryId=' +
        CategoryId[indexPage]
      "
      :show-file-list="false"
      :on-success="onUploadSuccess"
      :headers="$headers"
      :on-error="onUploadError"
    >
      <el-button type="text" size="small" ref="uploadBtn"></el-button>
    </el-upload>
    <datablau-dialog
      :title="$t('indicator.dimension.udp')"
      :visible.sync="showUdps"
      append-to-body
      :height="450"
      size="l"
    >
      <udps
        v-if="showUdps"
        :categoryTypeId="CategoryId[indexPage]"
        @getUdps="getUdps"
        @closeUdpDialog="showUdps = false"
      ></udps>
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
              {{ $t('quality.page.qualityRule.index.exportCurrent') }}
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
    <datablau-list-search style="padding: 10px 20px 0 0">
      <div>
        <datablau-input
          v-model="searchFormData.domainName"
          iconfont-state
          style="display: inline-block; width: 260px"
          clearable
          :placeholder="$t('indicator.definition.searchPlaceholder')"
        ></datablau-input>
        {{ $t('indicator.definition.state') }}:
        <datablau-select
          size="mini"
          v-model="searchFormData.stateValue"
          style="width: 100px"
        >
          <el-option
            v-for="item in stateOptions"
            :key="item.value"
            :value="item.value"
            :label="item.label"
          ></el-option>
        </datablau-select>
        <span
          v-if="indexPage === IndexPage.Basic_and_Derive"
          style="margin-left: 10px"
        >
          指标类型：
        </span>
        <datablau-select
          v-if="indexPage === IndexPage.Basic_and_Derive"
          v-model="searchFormData.metricsType"
          style="width: 100px"
        >
          <el-option :value="null" label="全部"></el-option>
          <el-option
            :value="IndexType[0]"
            :label="IndexTypeLabel[0]"
          ></el-option>
          <el-option
            :value="IndexType[1]"
            :label="IndexTypeLabel[1]"
          ></el-option>
        </datablau-select>
        <datablau-button
          type="primary"
          @click="handleSearch"
          style="margin-left: 10px"
        >
          {{ $t('quality.page.ruleReport.query') }}
        </datablau-button>
      </div>
      <template slot="buttons">
        <!--<datablau-button
          type="secondary"
          @click="showUdpDialog"
          style="margin-left: 10px; float: right"
          class="iconfont icon-expand"
        >
          扩展属性
        </datablau-button>-->
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
              {{ $t('quality.page.qualityRule.index.exportCurrent') }}
            </el-dropdown-item>
            <el-dropdown-item
              command="downloadTemplate"
              icon="iconfont icon-download"
            >
              {{ $t('system.systemSetting.downloadTemplate') }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-dropdown
          v-if="indexPage === IndexPage.Basic_and_Derive"
          style="float: right; vertical-align: top; margin-left: 10px"
          @command="handleAddCommand"
          trigger="click"
        >
          <datablau-button type="important" class="iconfont icon-tianjia">
            {{ $t('indicator.definition.add') }}
            <i class="el-icon-arrow-down el-icon--right"></i>
          </datablau-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="staticAdd">
              &nbsp;原子指标&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </el-dropdown-item>
            <el-dropdown-item command="staticAdd2">
              &nbsp;衍生指标
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <datablau-button
          v-else-if="indexPage === IndexPage.Fork"
          type="primary"
          @click="staticAdd3"
          class="iconfont icon-tianjia"
        >
          {{ $t('indicator.definition.add') }}
        </datablau-button>
      </template>
    </datablau-list-search>
    <div v-if="false" class="row-filter" :class="{ full: alwaysShowFilters }">
      <template v-if="alwaysShowFilters || showMoreFilters">
        <div style="height: 10px" v-if="!alwaysShowFilters"></div>
        <span class="label">{{ $t('indicator.definition.state') }}</span>
        <datablau-select
          v-model="conditions.state"
          style="width: 100px; display: inline-block"
          @change="handleConditionsChange"
        >
          <el-option key="all" label="全部" value=""></el-option>
        </datablau-select>
        <span class="label">业务部门</span>
        <datablau-select
          v-model="conditions.businessDepartment"
          style="width: 100px; display: inline-block"
          @change="handleConditionsChange"
        >
          <el-option key="all" label="全部" value=""></el-option>
        </datablau-select>
        <datablau-button
          v-show="!alwaysShowFilters"
          @click="showFilterTag"
          class="iconfont icon-filter"
          type="text"
        >
          {{ showMoreFilters ? '收起更多过滤' : '更多过滤' }}
        </datablau-button>
      </template>
    </div>
    <div
      class="table-area"
      :class="{
        short: !alwaysShowFilters && showMoreFilters,
        'has-top': !isRoot,
      }"
    >
      <datablau-table
        :data="tableData"
        height="100%"
        data-selectable
        v-loading="tableLoading"
        @selection-change="handleSelectionChange"
        @sort-change="changeSort"
      >
        <el-table-column :width="18" fixed="left">
          <template slot-scope="scope">
            <datablau-icon
              :data-type="'index'"
              :size="18"
              style="position: relative; top: 3px"
            ></datablau-icon>
          </template>
        </el-table-column>
        <el-table-column
          fixed="left"
          :label="$t('indicator.definition.domainCode')"
          prop="domainCode"
          show-overflow-tooltip
          :min-width="100"
          sortable="domainCode"
        ></el-table-column>
        <el-table-column
          :label="$t('indicator.definition.chineseName')"
          prop="chineseName"
          show-overflow-tooltip
          :min-width="100"
          sortable="chineseName"
        ></el-table-column>
        <el-table-column
          :label="$t('indicator.definition.englishName')"
          prop="englishName"
          show-overflow-tooltip
          :min-width="100"
        ></el-table-column>
        <el-table-column
          label="指标类型"
          prop="metricType"
          show-overflow-tooltip
          :min-width="100"
        >
          <template slot-scope="scope">
            {{ IndexTypeLabel[IndexType[scope.row.metricType]] }}
          </template>
        </el-table-column>
        <el-table-column
          label="所属目录"
          prop="pathStr"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :label="$t('indicator.definition.measureUnit')"
          prop="measureUnit"
          show-overflow-tooltip
          :width="100"
        ></el-table-column>
        <el-table-column
          label="业务定义部门"
          prop="descriptionDepartmentName"
          :min-width="120"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :label="$t('indicator.definition.submitter')"
          prop="submitter"
          show-overflow-tooltip
          :width="100"
        >
          <template slot-scope="scope">
            {{ userMap[scope.row.submitter] }}
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('indicator.definition.state')"
          prop="state"
          show-overflow-tooltip
          :width="100"
        >
          <template slot-scope="scope">
            <span :style="`color:${getStatusColor(scope.row.state)}`">
              <span
                :style="`background-color:${getStatusColor(scope.row.state)}`"
                class="circle"
              ></span>
              {{ statusFormatter(scope.row.state) }}
            </span>
          </template>
        </el-table-column>
        <!--<el-table-column
          label="运行状态"
          prop=""
          show-overflow-tooltip
          :min-width="100"
        ></el-table-column>-->
        <el-table-column
          label="发布时间"
          prop="firstPublish"
          :formatter="$timeFormatter"
          show-overflow-tooltip
          :width="140"
          sortable="firstPublish"
        ></el-table-column>
        <el-table-column
          label="最后更新时间"
          prop="lastModification"
          :formatter="$timeFormatter"
          show-overflow-tooltip
          :width="140"
          sortable="lastModification"
        ></el-table-column>
        <el-table-column
          :label="$t('quality.page.dataQualityRepairJob.documents.operation')"
          header-align="left"
          align="left"
          fixed="right"
          :width="110"
        >
          <template slot-scope="scope">
            <datablau-button
              type="icon"
              class="iconfont icon-see"
              from-table
              @click="handleView(scope.row)"
              :tooltip-content="$t('common.button.scan')"
              :tooltip-options="{ placement: 'top', openDelay: 500 }"
            ></datablau-button>
            <datablau-button
              type="icon"
              :disabled="scope.row.state !== 'D' && scope.row.state !== ''"
              @click="toUpdate(scope.row)"
            >
              <datablau-tooltip
                :content="$t('common.button.edit')"
                placement="top"
                :open-delay="500"
              >
                <i class="iconfont icon-bianji"></i>
              </datablau-tooltip>
            </datablau-button>
            <datablau-button
              type="icon"
              from-table
              :disabled="scope.row.state !== 'D'"
              @click="deleteSingleStandard(scope.row)"
            >
              <i class="iconfont icon-delete"></i>
            </datablau-button>
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
      <datablau-button type="" v-show="multipleLength" @click="exportSelection">
        <i class="iconfont icon-export"></i>
        导出
      </datablau-button>
      <datablau-button @click="toChange" :disabled="disabledControl('A')">
        {{ $t('domain.common.change') }}
      </datablau-button>
      <datablau-button
        @click="toAbandon"
        :disabled="disabledControl('A')"
        :loading="toAbandonLoading"
      >
        {{ $t('domain.common.discard') }}
      </datablau-button>
      <datablau-button
        @click="toPublish"
        :disabled="disabledControl('D')"
        :loading="toPublishLoading"
        class="iconfont icon-publish"
      >
        {{ $t('domain.common.publish') }}
      </datablau-button>
      <datablau-button
        type="danger"
        class="iconfont icon-delete"
        @click="deleteStandard(false)"
        :disabled="disabledControl('D')"
      >
        {{ $t('common.button.delete') }}
      </datablau-button>
      <datablau-pagination
        style="padding-top: 10px; float: right"
        class="ddc-pagination"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[20, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></datablau-pagination>
    </div>
  </div>
</template>
<script>
import Table from './table.js'
export default Table
</script>
<style lang="scss" scoped>
@import '~@/next/components/basic/color.sass';
@import '../base';
</style>
<style lang="scss">
.table-box .circle {
  position: relative;
  bottom: 1px;
  display: inline-block;
  margin-right: 7px;
  background-color: #5cb793;
  border-radius: 3.5px;
  width: 7px;
  height: 7px;
}
</style>
