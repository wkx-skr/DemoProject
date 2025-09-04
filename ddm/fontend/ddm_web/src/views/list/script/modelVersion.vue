<template>
  <div class="table-container-version">
    <el-dialog
      width="800px"
      :title="$store.state.$v.dataEntity.ddlScript"
      :visible.sync="exportDDLVisible"
      v-if="exportDDLVisible"
      append-to-body
    >
      <export-ddl
        :model-id="modelId"
      ></export-ddl>
    </el-dialog>
    <el-dialog
      width="800px"
      title="JPA Class"
      :visible.sync="exportJPAVisible"
      v-if="exportJPAVisible"
      append-to-body
    >
      <export-jpa
        :model-id="modelId"
      ></export-jpa>
    </el-dialog>
    <div class="title">{{$store.state.$v.modelDetail.version}}</div>
    <el-button
      v-if="isLogical || isConceptual"
      disabled
      :title="$store.state.$v.dataEntity.noLogi"
      @click="exportJPAVisible=true"
      type="primary"
      size="small" style="position:absolute;right:160px;top:15px;">
      <i class="fa fa-code"></i>
      JPA Class</el-button>
    <el-button
      v-else
      @click="exportJPAVisible=true"
      type="primary"
      size="small" style="position:absolute;right:160px;top:15px;">
      <i class="fa fa-code"></i>
      JPA Class</el-button>
    <el-button
      :disabled="isLogical || isConceptual"
      @click="exportDDLVisible=true"
      type="primary"
      size="small" style="position:absolute;right:20px;top:15px;"><i class="fa fa-code"></i> {{$store.state.$v.dataEntity.ddlScript}}</el-button>
    <div id="top-table-box" style="overflow:auto;">
      <el-table
        :data="tableData"
        v-loading="tableLoading"
        class="datablau-table"
        row-class-name="row-can-click"
        row-key="d"
        lazy
        :load="load"
        :height="tableHeight"
        @row-click="handleRowClick"
      >
        <el-table-column
          width="30"
          class-name="arrow-field"
        ></el-table-column>

        <el-table-column
          v-if="true"
          width="20"
          class-name="index-line-field">
          <template slot-scope="scope">
            <div class="line-box" >
              <span class="top-line" v-if="scope.$index !== 0"></span>
              <span class="center-dot" v-if="scope.row.creator"></span>
              <span class="bottom-line" v-if="!scope.row.isLast || !scope.row.creator"></span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="name"
          :label="$store.state.$v.modelDetail.versionNum"
          min-width="180"
          show-overflow-tooltip
          class-name="version-no"></el-table-column>
        <el-table-column
          width="160"
          :label="$store.state.$v.modelDetail.commitTime"
          show-overflow-tooltip
          :formatter="$timeFormatter"
          prop="timestamp">
        </el-table-column>
        <el-table-column
          prop="creator"
          min-width="80"
          :label="$store.state.$v.modelDetail.Submitter"
          show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{scope.row.creator? scope.row.creator : scope.row.user}}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$store.state.$v.modelDetail.descOrRecord"
          show-overflow-tooltip
          min-width="250"
        >
          <template slot-scope="scope">
            <div v-if="!scope.row.user" :data-id="scope.row.d" v-html="nl2br(scope.row.description)"></div>
            <div v-else-if="!scope.row.isOpen">
              <el-button type="text" size="mini" @click="scanLog(scope.row)">{{$store.state.$v.modelDetail.viewRecord}}</el-button>
            </div>
            <div v-else>
              <ul class="man-list">
                <li v-if="scope.row.log.length>0">{{$store.state.$v.modelDetail.total2}}{{scope.row.log.length}}{{$store.state.$v.modelDetail.nRecord}}</li>
                <li v-else>{{$store.state.$v.modelDetail.noRecord}}</li>
                <li
                  v-for="(l,k) in scope.row.log"
                  :key="k"
                >{{k+1}}. {{logFormatter(l)}}</li>
              </ul>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script>
import modelVersion from './modelVersion'
export default modelVersion
</script>

<style scoped lang="scss">
.title {
  font-size:14px;
  font-weight:bold;
  padding-bottom:18px;
  margin-bottom:1.5em;
  border-bottom:1px solid #dddddd;
}
.man-list {
  padding:10px 0;
  li {
    margin-left:0em;
    line-height:1.5em;
  }
}
.table-container-version {
  /*position:absolute;*/
  /*top:20px;left:20px;right:20px;*/
  /*bottom:20px;*/
  /*overflow:auto;*/
}
</style>
<style lang="scss">
@import './modelVersion';
</style>
