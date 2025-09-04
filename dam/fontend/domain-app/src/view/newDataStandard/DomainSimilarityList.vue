<script>
import {
  checkStatusFormatter,
  getStatusColor,
  stateOptions,
  statusFormatter,
} from '@/view/dataStandardGlossary/glossaryConstants'

export default {
  name: 'DomainSimilarityList',
  props: {
    domainId: {
      type: String,
      default: '',
    },
  },
  created() {
    this.getList(false)
  },
  beforeDestroy() {
    this.tableData = []
    this.detailTableData = []
  },
  mounted() {
    // this.getList()
  },
  data() {
    return {
      tableData: [],
      detailTableData: [],
      similarityDetailDialogVis: false,
      statusFormatter,
      getStatusColor,
      checkStatusFormatter,
      stateOptions: stateOptions(this),
      skipLoading: true,
      selection: [],
      searchFormData: {
        keyword: '',
      },
      tableLoading: false,
      tableDetailLoading: false,
    }
  },
  methods: {
    getList(reset) {
      if (reset) {
        this.searchFormData = {
          keyword: '',
        }
      }
      const url = this.$domain_url + '/domains/similarity/getSimilarityGroup'
      this.tableLoading = true
      this.$http
        .post(url, { domainId: this.domainId, chineseName: this.searchFormData.keyword })
        .then(res => {
          this.tableData = res.data
        })
        .catch(err => {
          this.$showFailure(err)
        })
        .finally(() => {
          this.tableLoading = false
        })
    },
    viewDetail(row) {
      this.similarityDetailDialogVis = true
      const url = this.$domain_url + '/domains/similarity/getSimilarityDetail'
      this.tableDetailLoading = true
      this.$http
        .post(url, { clusterId: row.clusterId })
        .then(res => {
          this.detailTableData = res.data
        })
        .catch(err => {
          this.$showFailure(err)
        })
        .finally(() => {
          this.tableDetailLoading = false
        })
    },
    concatName(list) {
      return list && list.length
        ? list.map(item => item.chineseName).join(',')
        : ''
    },
    skipCheck() {
      if (this.selection && this.selection.length) {
        this.$confirm(
          '确认跳过检查么，如存在相似标准，该标准在发布审批时可能被驳回。',
          '提示',
          {
            confirmButtonText: this.$t('common.button.ok'),
            cancelButtonText: this.$t('common.button.cancel'),
            type: 'warning',
          }
        )
          .then(() => {
            this.skipLoading = true
            this.$http
              .post(`${this.$domain_url}/domains/similarity/skip`, [
                ...this.selection.map(item => item.domainId),
              ])
              .then(res => {
                this.$showSuccess(res.message)
                this.skipLoading = false
                this.similarityDetailDialogVis = false
                this.$emit('skipFinished')
              })
              .catch(err => {
                this.skipLoading = false
                this.$showFailure(err)
              })
          })
          .catch(() => {})
      }
    },
    tableSelectionChanged(selection) {
      this.selection = selection
    },
  },
}
</script>

<template>
  <div>
    <datablau-dialog
      :title="'相似标准'"
      width="70%"
      height="600px"
      :visible.sync="similarityDetailDialogVis"
    >
      <datablau-table
        :data="detailTableData"
        :loading="tableDetailLoading"
        data-selectable
        @selection-change="tableSelectionChanged"
        ref="domainSimilarityTable"
      >
        <el-table-column :label="'中文名'" prop="chineseName"></el-table-column>
        <el-table-column :label="'编码'" prop="domainCode"></el-table-column>
        <el-table-column :label="'主题'" prop="folderId">
          <template slot-scope="scope">
            <i
              class="iconfont icon-file"
              style="font-size: 14px; color: #409eff"
            ></i>
            &nbsp;
            <!--{{ scope.row.path ? scope.row.path.join('/') : '' }}-->
            {{ (scope.row.path && scope.row.path[1]) || '' }}
          </template>
        </el-table-column>
        <el-table-column :label="'状态'" prop="state">
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
        <el-table-column :label="'标准检查'" prop="checkState">
          <template slot-scope="scope">
            {{ checkStatusFormatter(scope.row.checkState) }}
          </template>
        </el-table-column>
        <el-table-column
          :label="'业务定义部门'"
          prop="descriptionDepartmentName"
        ></el-table-column>
        <el-table-column :label="'数据类型'" prop="dataType"></el-table-column>
        <el-table-column :label="'数据长度'" prop="dataScale"></el-table-column>
        <el-table-column
          :label="'数据精度'"
          prop="dataPrecision"
        ></el-table-column>
        <el-table-column :label="'提交人'" prop="submitter"></el-table-column>
        <el-table-column
          :label="'相似度'"
          prop="score"
          width="60"
        ></el-table-column>
      </datablau-table>
      <span slot="footer">
        <datablau-button
          type="primary"
          :disabled="!selection || !selection.length"
          @click="skipCheck"
        >
          {{ '跳过检查' }}
        </datablau-button>
        <datablau-button
          type="secondary"
          @click="similarityDetailDialogVis = false"
        >
          {{ $t('common.button.cancel') }}
        </datablau-button>
      </span>
    </datablau-dialog>
    <datablau-list-search class="search-outer">
      <el-form ref="searchForm" :inline="true" :model="searchFormData">
        <el-form-item prop="domainName" style="width: 200px">
          <datablau-input
            clearable
            maxlength="100"
            type="text"
            v-model="searchFormData.keyword"
            :placeholder="'搜索中文名称'"
          ></datablau-input>
        </el-form-item>
        <el-form-item style="margin-left: 50px">
          <datablau-button
            size="mini"
            type="normal"
            :disabled="tableLoading"
            @click="getList(false)"
          >
            {{ $t('domain.common.search') }}
          </datablau-button>
          <datablau-button
            size="mini"
            type="secondary"
            :disabled="tableLoading"
            @click="getList(true)"
          >
            {{ $t('domain.common.reset') }}
          </datablau-button>
        </el-form-item>
        <!--        <el-form-item prop="domainCode" style="width: 200px">
          <datablau-input
            type="text"
            clearable
            maxlength="100"
            size="mini"
            style="width: 200px;!important"
            v-model="searchFormData.domainCode"
            :placeholder="$t('domain.domain.searchDomainCode')"
          ></datablau-input>
        </el-form-item>
        <el-form-item :label="$t('domain.common.state')" prop="stateValue">
          <datablau-select
            size="mini"
            v-model="searchFormData.stateValue"
            style="width: 120px"
          >
            <el-option
              v-for="item in stateOptions"
              :key="item.value"
              :value="item.value"
              :label="item.label"
            ></el-option>
          </datablau-select>
        </el-form-item>-->
      </el-form>
      <template slot="buttons">
        <div style="margin-right: 20px">
          <!--          <datablau-button size="mini" type="normal" @click="getList(false)">
            {{ $t('domain.common.search') }}
          </datablau-button>
          <datablau-button size="mini" type="secondary" @click="getList(true)">
            {{ $t('domain.common.reset') }}
          </datablau-button>-->
          <!--          <datablau-button
            size="mini"
            type="primary"
            @click="similarityCheck()"
            v-if="$auth['DATA_STANDARD_ADD'] || $auth['ROLE_DOMAIN_ADD']"
          >
            相似标准检查
          </datablau-button>-->
        </div>
      </template>
    </datablau-list-search>
    <datablau-table :loading="tableLoading" :data="tableData">
      <el-table-column
        :label="'标准数量'"
        prop="totalCounts"
        width="60"
      ></el-table-column>
      <el-table-column :label="'标准名称'" prop="name">
        <template slot-scope="scope">
          {{ concatName(scope.row.columns) }}
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('domain.common.operation')"
        :width="80"
        align="center"
      >
        <template slot-scope="scope">
          <datablau-button type="text" @click="viewDetail(scope.row)">
            {{ $t('common.button.scan') }}
          </datablau-button>
        </template>
      </el-table-column>
    </datablau-table>
  </div>
</template>

<style scoped lang="scss"></style>
