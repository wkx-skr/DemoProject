<template>
  <div>
    <div class="noresult" v-show="versionTableData.length === 0">
      <div class="noresult-img">
        <img src="static/kgimg/noresult.svg" alt="" />
        <p>{{ $t('domain.common.noData') }}</p>
      </div>
    </div>
    <datablau-table
      v-show="versionTableData.length > 0"
      :data="versionTableData"
      @select="versionSelect"
      size="mini"
      ref="multipleTable"
      :data-selectable="!noCompare"
    >
      <!--class="datablau-table"-->
      <!--<el-table-column type="selection"></el-table-column>-->
      <el-table-column
        :label="$t('domain.domain.versionName')"
        :min-width="172"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.version }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="timestamp"
        :label="$t('domain.domain.changeTime')"
        :min-width="172"
        :formatter="$timeFormatter"
      ></el-table-column>
      <el-table-column
        prop="operator"
        :min-width="172"
        :label="$t('domain.code.operator')"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.operator }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="changes"
        :min-width="172"
        :label="$t('domain.code.change')"
      ></el-table-column>
    </datablau-table>
    <datablau-button
      style="margin-top: 20px"
      type="normal"
      v-if="!noCompare"
      v-show="versionTableData.length > 0"
      size="mini"
      :disabled="CompareDisabled"
      @click="versionCompare"
      :tooltip-content="
        CompareDisabled ? $t('domain.code.chooseTwoVersions') : ''
      "
    >
      {{ $t('domain.code.versionComparison') }}
    </datablau-button>
    <el-dialog
      class="jobs-sta"
      :title="$t('domain.code.versionComparison')"
      :visible.sync="showVersionCompareDialog"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-checkbox v-model="onlyShowChange">
        {{ $t('domain.code.onlyShowChange') }}
      </el-checkbox>
      <el-table
        max-height="360px"
        ref="domainTable"
        :data="compareResultTableData"
        size="small"
        :cell-style="cellStyle"
        style="margin-bottom: 20px"
        v-loading="smallVersionLoading"
      >
        <el-table-column
          :label="$t('domain.code.attrVersion')"
          prop="name"
        ></el-table-column>
        <el-table-column
          :label="smallVersionName1"
          prop="old"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :label="smallVersionName2"
          prop="new"
          show-overflow-tooltip
        ></el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import version from './version'
export default version
</script>

<style scoped>
.table-container {
  max-height: 500px;
  margin-top: 10px;
}
</style>
