<template>
  <div
    class="tab-page"
    style="
      position: absolute;
      left: 0;
      right: 0;
      overflow: auto;
      min-width: 800px;
    "
  >
    <div style="">
      <!-- <span class="d-return icon-i-return" @click="goBack">
        {{ $t('common.button.return') }}
      </span>
      <span
        style="
          font-size: 16px;
          color: #20293b;
          font-weight: bold;
          font-family: Noto-Sans-Regular, serif;
        "
      >
        导出元数据
      </span> -->
      <datablau-breadcrumb
        class="top-bread"
        :node-data="displayPath"
        :couldClick="false"
        @back="goBack"
        separator=">"
      ></datablau-breadcrumb>
    </div>
    <div class="filter-row">
      <div class="search-container" v-if="!currentTag">
        <datablau-input
          clearable
          maxlength="100"
          :iconfont-state="true"
          :placeholder="
            isLogical
              ? '输入关键字搜索实体'
              : $t('meta.DS.treeSubOperation.keyWord')
          "
          v-model="keyword"
        ></datablau-input>
      </div>
      <div v-else style="display: inline-block">
        <el-tooltip :content="$t('meta.DS.treeSubOperation.notSupportKeyWord')">
          <i class="el-icon-info"></i>
        </el-tooltip>
      </div>
      <!--      <span class="gun">|</span>-->
      <!--      <el-button type="text" size="mini" @click="callTagSelector">根据标签筛选</el-button>-->
      <!--      <el-button type="text" size="mini" @click="cancelTagSelect" v-if="currentTag">取消标签筛选</el-button>-->
      <el-tag
        style="margin-left: 0.3em"
        size="small"
        v-for="(v, i) in currentTag"
        v-if="currentTag && i < 5"
        :key="i"
      >
        {{ tagNames[i] }}
      </el-tag>
      <span v-if="currentTag && currentTag.length > 5">
        {{
          $t('meta.DS.treeSubOperation.tagLen', { tagLen: currentTag.length })
        }}
      </span>
      <div class="schemaSelect">
        <span>{{ isLogical ? '主题' : 'Schema' }}</span>
        <datablau-select
          v-model="schemaList"
          multiple
          placeholder=""
          collapse-tags
          @change="schemaChange"
          style="width: 240px; display: inline-block"
        >
          <el-option
            v-for="item in schemaOptions"
            :key="item"
            :label="item"
            :value="item"
          ></el-option>
        </datablau-select>
      </div>
    </div>

    <datablau-form-submit class="download-list-info">
      <datablau-table
        height="100%"
        ref="columnsTable"
        :data-selectable="true"
        :data="currentableData"
        tooltip-effect="dark"
        class="table"
        size="mini"
        :auto-hide-selection="true"
        v-datablauLoading="tableLoading"
        @select="select"
        @select-all="selectAll"
      >
        <!-- <el-table-column type="selection" width="55"></el-table-column> -->
        <!--        <el-table-column-->
        <!--          prop="name"-->
        <!--          label="逻辑名称"-->
        <!--        >-->
        <!--        </el-table-column>-->
        <el-table-column
          prop="name"
          :label="$t('meta.DS.treeSubOperation.metadataName')"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :label="$t('meta.DS.treeSubOperation.type')"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            {{
              scope.row.typeId === 80000004
                ? isLogical
                  ? '实体'
                  : $t('meta.common.sourceType.table')
                : $t('meta.common.sourceType.view')
            }}
          </template>
        </el-table-column>
        <el-table-column
          prop="schema"
          :label="isLogical ? '主题' : 'Schema'"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="description"
          :label="$t('meta.DS.treeSubOperation.desc')"
          show-overflow-tooltip
        ></el-table-column>
      </datablau-table>
      <template slot="buttons">
        <div class="bottom">
          <div style="position: absolute">
            <span style="margin-right: 20px">
              {{
                $t('meta.DS.treeSubOperation.selLen', {
                  selLen: selectList.length,
                })
              }}
            </span>
            <datablau-button
              type="success"
              @click="download"
              size="small"
              :disabled="downloadDisabled || !!downloading"
            >
              <i
                class="el-icon-loading"
                v-if="downloading === DownloadingEnum.Selected"
              ></i>
              {{ $t('meta.DS.treeSubOperation.downloadSel') }}
            </datablau-button>
            <datablau-button
              @click="downloadAll"
              size="small"
              :disabled="!!downloading"
            >
              <i
                class="el-icon-loading"
                v-if="downloading === DownloadingEnum.All"
              ></i>
              {{ $t('meta.DS.treeSubOperation.downloadAll') }}
            </datablau-button>
            <!--      <el-checkbox v-model="isSimple" style="float:left;" v-if="false">简版</el-checkbox>-->
          </div>
          <datablau-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[20, 50, 100]"
            :page-size="manyEachPage"
            layout="total, sizes, prev, pager, next"
            :pager-count="5"
            class="page"
            :total="total"
          ></datablau-pagination>
        </div>
      </template>
    </datablau-form-submit>
  </div>
</template>

<script>
import downloadTab from './downloadTab'
export default downloadTab
</script>
<style lang="scss">
.el-table::before {
  display: none;
}
</style>
<style lang="scss" scoped="scoped">
@import '~@/next/components/basic/color.sass';
$border-color: #e0e0e0;
.tab-page {
  position: absolute;
  top: 0;
  width: 100%;
  bottom: 0;
  overflow: auto;
  .top-bread {
    margin: 0 0 0 20px;
    height: 40px;
    padding-top: 8px;
    border-bottom: 1px solid var(--border-color-lighter);
  }
  .filter-row {
    position: absolute;
    top: 43px;
    padding-left: 20px;
    height: 54px;
    line-height: 54px;
    .search-container {
      display: inline-block;
      width: 50%;
      max-width: 240px;
      min-width: 200px;
    }
  }
  .download-list-info {
    position: absolute;
    top: 100px;
    bottom: 0;
    left: 0;
    right: 0;
    overflow: hidden;
  }
  .download-table-row {
    margin-top: 50px;
  }
  .footer-row {
  }
}
.schemaSelect {
  //float: right;
  display: inline-block;
  margin-right: 20px;
  height: 34px;
  line-height: 34px;
  span {
    margin-right: 10px;
  }
  /deep/ .el-input__inner {
    vertical-align: top;
  }
}
.table {
  position: absolute !important;
  top: 0;
  overflow-y: auto;
  bottom: 42px;
  width: 100%;
}
.page {
  position: absolute;
  right: 20px;
}
</style>
