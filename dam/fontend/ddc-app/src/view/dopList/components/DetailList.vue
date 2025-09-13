<template>
  <div class="detail-list">
    <!-- 表格区域 -->
    <div class="table-row">
      <!-- 导出按钮 -->
      <div class="table-header">
        <datablau-button
          type="primary"
          @click="download"
          :loading="exportLoading"
        >
          导出
        </datablau-button>
      </div>

      <datablau-table
        class="datablau-table-info"
        ref="detailTable"
        :data="tableData"
        height="100%"
        highlight-current-row
        @sort-change="$emit('sort-change', $event)"
        :border="true"
        v-loading="loading"
      >
        <el-table-column
          label="资产类型"
          prop="dataType"
          show-overflow-tooltip
        />

        <el-table-column
          label="所属批次ID"
          prop="batchId"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          label="参考数据编码"
          prop=""
          v-if="showRefence"
          show-overflow-tooltip
        >
          <template v-slot="{ row }">
            <div
              style="color: #409eff; cursor: pointer"
              @click="getDetailData(row, 2)"
            >
              {{ row.domainCode }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="数据编码"
          width="150"
          prop="code"
          show-overflow-tooltip
        >
          <template v-slot="{ row }">
            <div
              style="color: #409eff; cursor: pointer"
              @click="getDetailData(row, 1)"
            >
              {{ row.code }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="中文名称" prop="cnName" show-overflow-tooltip />
        <el-table-column label="英文名称" prop="enName" show-overflow-tooltip />
        <el-table-column
          label="创建人"
          prop="applyCreator"
          show-overflow-tooltip
        />
        <template v-if="!(tableData[0].dataType === '资产DL123' || tableData[0].dataType === '资产DL45')">
          <el-table-column
            label="相似标准名称"
            prop="anotherDomainNames"
            show-overflow-tooltip
          />
          <el-table-column
            label="跳过原因"
            prop="skipReason"
            show-overflow-tooltip
          />
        </template>
        <el-table-column
          label="创建时间"
          prop="createTime"
          show-overflow-tooltip
          :formatter="$dateFormatter"
        />
        <el-table-column
          label="审核状态"
          prop="orderState"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <status-tag :status="scope.row.orderState" />
          </template>
        </el-table-column>
        <el-table-column
          label="审核类型"
          prop="orderType"
          show-overflow-tooltip
        >
          <template slot-scope="scope" v-if="scope.row.orderType">
            <order-type-tag :type="scope.row.orderType" />
          </template>
        </el-table-column>
      </datablau-table>
    </div>

    <!-- 分页区域 -->
    <div class="footer-row">
      <datablau-pagination
        style="float: right"
        @size-change="$emit('size-change', $event)"
        @current-change="$emit('current-change', $event)"
        :current-page.sync="pagination.currentPage"
        :page-sizes="pagination.pageSizes"
        :page-size="pagination.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
      />
    </div>

    <DescriptionDialog
      :visible="descriptionDialogVisible"
      :details="details"
      :descriptionType="descriptionType"
      :tagsTreeArr="tagsTreeArr"
      @cancel="closeDialog"
    />
    <TabDialog :visible="tabDialogVisible" :tabs="tabs" @cancel="closeDialog" />
  </div>
</template>

<script>
import StatusTag from '@/components/StatusTag.vue'
import OrderTypeTag from '@/components/OrderTypeTag.vue'
import DescriptionDialog from './DescriptionDialog.vue'
import TabDialog from './TabDialog.vue'

export default {
  name: 'DetailList',
  components: {
    StatusTag,
    OrderTypeTag,
    DescriptionDialog,
    TabDialog,
  },
  computed: {
    showRefence() {
      return (
        this.tableData.length > 0 && this.tableData[0].dataType == '标准数据元'
      )
    },
  },
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    tableData: {
      type: Array,
      default: () => [],
    },
    pagination: {
      type: Object,
      required: true,
    },
    filterForm: {
      type: Object,
      required: true,
    },
    currentBatchId: {
      type: [String, Number],
      default: null,
    },
  },
  data() {
    return {
      exportLoading: false,
      tabDialogVisible: false,
      descriptionDialogVisible: false,
      tabs: [],
      details: {},
      // 1、标准元数据 2、参考数据 3、业务术语
      descriptionType: 0,
      dl45ExportData: [],
      tagsTreeArr: [],
    }
  },
  methods: {
    async getDetailData(row, type) {
      if (row.dataType === '资产DL123') {
        this.getDl123Data(row)
      }
      if (row.dataType === '资产DL45') {
        //
        this.getDl45Data(row)
      }
      // 标准数据元详情
      if (row.dataType === '标准数据元' && type == 1) {
        this.getMeatData(row.neId)
        this.getTags(row.neId)
      }
      // 标准数据元参考数据
      if (row.dataType === '标准数据元' && type == 2) {
        this.getReferenceData(row.domainCode)
        this.getTags(row.domainCode)
      }
      if (row.dataType === '业务术语') {
        this.getBusinessData(row)
      }
    },
    download() {
      let dataType = this.tableData[0].dataType
      let neId = this.tableData[0].neId
      if (dataType == '资产DL45') {
        this.dl45ExportData =
          (this.tableData[0] && JSON.parse(this.tableData[0].neData)) || []
      }
      const fns = {
        资产DL123: () => {
          this.$datablauDownload(
            '/assets/catalog/need/apply/asset',
            [neId],
            '资产DL123'
          )
        },
        资产DL45: () => {
          this.$datablauDownload(
            '/archy/object/objects/export/compare',
            { ...this.dl45ExportData },
            '资产DL45'
          )
        },
        标准数据元: () => {
          this.$datablauDownload(
            '/domain/domains/domain/exportDomainData',
            { domainIds: [neId], categoryId: 1 },
            '标准数据元'
          )
        },
        业务术语: () => {
          this.$datablauDownload('/domain/ns/ns/exportNs', [neId], '业务术语')
        },
      }
      fns[dataType]()
    },
    // dl123
    async getDl123Data(row) {
      let batchId = this.tableData[0].batchId
      let dl123Res = await this.$http({
        url: `/assets/catalog/dop/catalog/detail/${row.neId}/${batchId}`,
        method: 'get',
      })
      let tableResults = [dl123Res.data && dl123Res.data.data]
      let tabs = [
        {
          name: 'tab1',
          title: '业务域',
          columns: [
            {
              label: '业务域编码',
              prop: 'buCode',
              showOverflowTooltip: true,
            },
            {
              label: '业务域中文名',
              prop: 'lOneName',
              showOverflowTooltip: true,
            },
            {
              label: '业务域英文名',
              prop: 'englishName',
              showOverflowTooltip: true,
            },
            {
              label: '业务域定义',
              prop: 'comment',
              showOverflowTooltip: true,
            },
            {
              label: '数据主管',
              prop: 'dataUser',
              showOverflowTooltip: true,
            },
          ],
          data: tableResults,
        },
        {
          name: 'tab2',
          title: '主题域',
          columns: [
            {
              label: '业务域编码',
              prop: 'buCode',
              showOverflowTooltip: true,
            },
            {
              label: '业务域中文名',
              prop: 'lOneName',
              showOverflowTooltip: true,
            },
            {
              label: '主题域编码',
              prop: 'subCode',
              showOverflowTooltip: true,
            },
            {
              label: '主题域中文名',
              prop: 'lTwoName',
              showOverflowTooltip: true,
            },
            {
              label: '主题域英文名',
              prop: 'englishName',
              showOverflowTooltip: true,
            },
            {
              label: '主题域定义',
              prop: 'comment',
              showOverflowTooltip: true,
            },
            {
              label: '数据主管',
              prop: 'dataUser',
              showOverflowTooltip: true,
            },
          ],
          data: tableResults,
        },
        {
          name: 'tab3',
          title: '业务对象',
          columns: [
            {
              label: '业务域编码',
              prop: 'buCode',
              minWidth: 100,
              showOverflowTooltip: true,
            },
            {
              label: '业务域中文名',
              prop: 'lOneName',
              minWidth: 120,
              showOverflowTooltip: true,
            },
            {
              label: '主题域编码',
              prop: 'subCode',
              minWidth: 100,
              showOverflowTooltip: true,
            },
            {
              label: '主题域中文名',
              prop: 'lTwoName',
              minWidth: 120,
              showOverflowTooltip: true,
            },
            {
              label: '业务对象编码',
              prop: 'subObjCode',
              minWidth: 100,
              showOverflowTooltip: true,
            },
            {
              label: '业务对象中文名',
              prop: 'lThreeName',
              minWidth: 120,
              showOverflowTooltip: true,
            },
            {
              label: '业务对象英文名',
              prop: 'englishName',
              minWidth: 120,
              showOverflowTooltip: true,
            },
            {
              label: '业务对象定义',
              prop: 'comment',
              minWidth: 120,
              showOverflowTooltip: true,
            },
            {
              label: '数据主管',
              prop: 'dataUser',
              minWidth: 100,
              showOverflowTooltip: true,
            },
            {
              label: '数据管家',
              prop: 'butler',
              minWidth: 100,
              showOverflowTooltip: true,
            },
          ],
          data: tableResults,
        },
      ]
      this.tabs = tableResults && tableResults[0].level ? [tabs[tableResults[0].level-1]] : []
      this.tabDialogVisible = true
    },
    // dl45
    async getDl45Data(row) {
      let dl45Res = this.tableData[0]
      this.dl45ExportData = (dl45Res.neData && JSON.parse(dl45Res.neData)) || {
        columnResults: [],
        tableResults: [],
      }
      const { columnResults, tableResults } = this.dl45ExportData
      this.tabs = [
        {
          name: 'tab1',
          title: '实体',
          columns: [
            {
              label: '类型',
              prop: 'type',
              showOverflowTooltip: true,
            },
            {
              label: '业务对象中文名',
              prop: 'objectName',
              showOverflowTooltip: true,
            },
            {
              label: '逻辑实体英文名',
              prop: 'tableName',
              showOverflowTooltip: true,
            },
            {
              label: '逻辑实体中文名',
              prop: 'tableChName',
              showOverflowTooltip: true,
            },
            {
              label: '逻辑数据实体定义',
              prop: 'definition',
              showOverflowTooltip: true,
            },
          ],
          data: tableResults,
        },
        {
          name: 'tab2',
          title: '属性',
          columns: [
            {
              label: '类型',
              prop: 'type',
              minWidth: 50,
              showOverflowTooltip: true,
            },
            {
              label: '业务对象中文名',
              prop: 'objectName',
              minWidth: 120,
              showOverflowTooltip: true,
            },
            {
              label: '逻辑实体英文名',
              prop: 'tableName',
              minWidth: 130,
              showOverflowTooltip: true,
            },
            {
              label: '属性英文名',
              prop: 'columnName',
              minWidth: 130,
              showOverflowTooltip: true,
            },
            {
              label: '属性中文名',
              prop: 'columnChName',
              minWidth: 140,
              showOverflowTooltip: true,
            },
            /*{
              label: '属性英文名',
              prop: 'columnEnName',
              minWidth: 140,
              showOverflowTooltip: true,
            },*/
            {
              label: '属性数据类型',
              prop: 'dataType',
              minWidth: 150,
              showOverflowTooltip: true,
            },
            {
              label: '业务定义',
              prop: 'definition',
              minWidth: 140,
              showOverflowTooltip: true,
            },
            {
              label: '主键',
              prop: 'pk',
              minWidth: 120,
              showOverflowTooltip: true,
            },
            {
              label: '非空',
              prop: 'notNull',
              minWidth: 80,
              showOverflowTooltip: true,
            },
            {
              label: '默认值',
              prop: 'defaultValue',
              minWidth: 80,
              showOverflowTooltip: true,
            },
          ],
          data: columnResults,
        },
      ]
      this.tabDialogVisible = true
    },
    // 标准数据元
    async getMeatData(neId) {
      let res = await this.$http({
        url: `/domain/domains/domain/getDomainById`,
        method: 'post',
        data: {
          domainId: neId,
        },
      })
      this.descriptionType = 1
      this.details = res.data
      this.descriptionDialogVisible = true
      return
    },
    // 参考数据
    async getReferenceData(code) {
      try {
        let res = await this.$http({
          url: `/domain/domains/code/getCode`,
          method: 'post',
          data: { code: code, categoryId: 1 },
        })
        this.descriptionType = 2
        this.details = res.data
        this.descriptionDialogVisible = true
      } catch (error) {
        this.$showFailure(error)
      }
    },
    // 业务术语
    async getBusinessData(row) {
      try {
        let res = await this.$http({
          url: `/domain/ns/ns/getNs/${row.neId}`,
          method: 'get',
        })
        this.descriptionType = 3
        this.details = res.data
        this.descriptionDialogVisible = true
      } catch (error) {
        this.$showFailure(error)
      }
    },
    getTags(id) {
      this.$http({
        url: `/domain/tag/tags/get?itemId=${id}`,
        data: { code: id, categoryId: 1 },
        method: 'post',
      })
        .then(res => {
          this.tagsTreeArr = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    closeDialog() {
      this.descriptionDialogVisible = false
      this.tabDialogVisible = false
      this.details = {}
      this.tabs = []
      this.tagsTreeArr = []
    },
  },
}
</script>

<style scoped lang="scss">
.detail-list {
  height: 100%;

  .table-row {
    position: absolute;
    top: 20px;
    bottom: 60px;
    left: 0;
    right: 0;
    padding: 0 20px;
  }

  .table-header {
    margin-bottom: 10px;
  }

  .footer-row {
    position: absolute;
    bottom: 10px;
    left: 0;
    right: 0;
    height: 50px;
    padding: 10px 20px;
    box-sizing: border-box;
  }
}
</style>
