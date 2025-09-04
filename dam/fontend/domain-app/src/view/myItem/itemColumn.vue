<template>
  <div style="">
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="740px"
      append-to-body
    >
      <div style="position: relative; top: -20px">{{ dialogProfile }}</div>
      <div id="profiling-chart" style="height: 350px"></div>
    </el-dialog>
    <el-table
      v-if="metadata === false"
      :data="tableData"
      :header-cell-style="style.headerCellStyle"
      :cell-style="style.cellStyle"
    >
      <el-table-column width="40" align="right">
        <template slot-scope="scope">
          {{ $utils.string.appendLeadingZero(scope.$index + 1) }}
        </template>
      </el-table-column>
      <el-table-column :width="30" label=""></el-table-column>
      <!--<el-table-column
        prop="physicalName"
        label="字段名"
        show-overflow-tooltip
      >
      </el-table-column>-->
      <el-table-column label="" :width="55">
        <template slot-scope="scope">
          <div style="line-height: 32px" v-if="scope.row.type">
            <span v-html="iconHtmlFormat(dataTypeFormatter(scope.row))"></span>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('meta.DS.tableDetail.dataQuality.infoName')"
        show-overflow-tooltip
        :width="190"
      >
        <template slot-scope="scope">
          <div style="line-height: 32px">
            <!--<img :src="iconSrc(dataTypeFormatter(scope.row))" :alt="dataTypeFormatter(scope.row)" style="height:24px;position:relative;top:6px;margin-right:0.5em;">-->
            {{ logicalNameFormatter(scope.row) }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('meta.DS.tableDetail.dataQuality.notNull')"
        align="center"
        :width="160"
      >
        <template slot-scope="scope">
          <profile-rate
            v-if="scope.row.profile && scope.row.profile.rowCount > 0"
            :data="scope.row.profile"
          ></profile-rate>
          <!--<div v-else>暂无数据</div>-->
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('meta.DS.tableDetail.dataQuality.rangeDistribute')"
        :width="180"
        align="center"
      >
        <template slot-scope="scope">
          <profile-distribute
            v-if="scope.row.profile && scope.row.profile.rowCount > 0"
            :fullData="scope.row"
            :data="scope.row.profile"
            @pushDialog="handlePushDialog"
          ></profile-distribute>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('meta.DS.tableDetail.dataQuality.tag')"
        :min-width="120"
      >
        <template slot-scope="scope">
          <div class="tag-box blue">
            <el-tooltip
              style="margin: 2px"
              v-for="t in scope.row.tags"
              :key="t.id"
              :disabled="!$globalData.tagDescriptionMap.get(t.id)"
              :content="$globalData.tagDescriptionMap.get(t.id)"
            >
              <el-tag size="small">{{ t.name }}</el-tag>
              <!-- <span
              class="tag">{{t.name}}</span> -->
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="definition"
        :label="$t('meta.DS.tableDetail.dataQuality.desc')"
      >
        <template slot-scope="scope">
          <div
            style=""
            class="two-line-eclipse"
            :title="scope.row.definition"
            v-html="nl2br(scope.row.definition)"
          ></div>
        </template>
      </el-table-column>
    </el-table>
    <datablau-table
      :data="tableData"
      :max-height="heightValue"
      v-if="metadata === true"
      :show-column-selection="columnOption.showColumnSelection"
      :component-case-name="'item-column'"
      height="100%"
    >
      <el-table-column
        width="50"
        align="right"
        :label="$t('meta.DS.tableDetail.dataQuality.num')"
      >
        <template slot-scope="scope">
          {{ $utils.string.appendLeadingZero(scope.$index + 1) }}
        </template>
      </el-table-column>
      <el-table-column :width="30" label=""></el-table-column>
      <!-- <el-table-column label="" :width="55">
        <template slot-scope="scope">
          <div style="line-height: 32px" v-if="scope.row.type">
            <span v-html="iconHtmlFormat(dataTypeFormatter(scope.row))"></span>
          </div>
        </template>
      </el-table-column> -->
      <el-table-column
        prop="logicalName"
        :label="$t('meta.DS.tableDetail.dataQuality.infoName')"
        show-overflow-tooltip
        :width="190"
      >
        <template slot-scope="scope">
          <div style="line-height: 32px">
            <!--<img :src="iconSrc(dataTypeFormatter(scope.row))" :alt="dataTypeFormatter(scope.row)" style="height:24px;position:relative;top:6px;margin-right:0.5em;">-->
            {{ logicalNameFormatter(scope.row) }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('meta.DS.tableDetail.dataQuality.dataType')"
        prop="physicalName"
        width="138"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          <div
            style="line-height: 32px; display: inline-block"
            v-if="scope.row.type"
          >
            <datablau-tooltip
              :content="scope.row.type"
              placement="bottom"
              effect="dark"
            >
              <span
                v-html="iconHtmlFormat(dataTypeFormatter(scope.row))"
              ></span>
            </datablau-tooltip>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('meta.DS.tableDetail.dataQuality.notNullPercent')"
        align="center"
        :width="$i18n.locale === 'en' ? 200 : 160"
      >
        <template slot-scope="scope">
          <profile-rate
            v-if="scope.row.profile && scope.row.profile.rowCount > 0"
            :data="scope.row.profile"
          ></profile-rate>
          <!--<div v-else>暂无数据</div>-->
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('meta.DS.tableDetail.dataQuality.rangeDistribute')"
        :width="180"
        align="center"
      >
        <template slot-scope="scope">
          <div v-if="scope.row.access === true">
            <profile-distribute
              v-if="scope.row.profile && scope.row.profile.rowCount > 0"
              :fullData="scope.row"
              :data="scope.row.profile"
              @pushDialog="handlePushDialog"
            ></profile-distribute>
          </div>
          <span v-if="scope.row.access === false">
            {{ $t('meta.DS.tableDetail.dataQuality.noPermission') }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        prop="definition"
        :label="$t('meta.DS.tableDetail.dataQuality.dataRange')"
      >
        <template slot-scope="scope">
          <p v-if="scope.row.access === true">
            {{ scope.row.profile.profilingResult.minValue }}～{{
              scope.row.profile.profilingResult.maxValue
            }}
          </p>
          <span v-if="scope.row.access === false">
            {{ $t('meta.DS.tableDetail.dataQuality.noPermission') }}
          </span>
        </template>
      </el-table-column>
    </datablau-table>
    <!-- <div :style="style.more" v-if="data.length > 6">
      <el-button type="text" v-if="!showFullData" @click="handleExpand">
        展开其它{{ data.length - 6 }}个字段
      </el-button>
      <el-button type="text" v-else @click="handleCollapse">收起</el-button>
    </div> -->
  </div>
</template>
<script>
import itemColumn from './itemColumn.js'
export default itemColumn
</script>
