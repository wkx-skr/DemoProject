<template>
  <div style="padding-top: 16px" class="cart-apply-details">
    <p style="font-size: 14px; font-weight: 600">当前数据范围：</p>
    <div class="table-data">
      <datablau-form-submit>
        <datablau-table :data="assetsList" height="100%">
          <el-table-column
            label="名称"
            prop="logicalName"
            min-width="100"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              {{
                scope.row.logicalName
                  ? `${scope.row.name}(${scope.row.logicalName})`
                  : scope.row.name
              }}
            </template>
          </el-table-column>
          <el-table-column
            label="数据范围"
            prop="columnList"
            min-width="120"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <span v-if="scope.row.allTable">全表</span>
              <span v-else>
                {{
                  scope.row.columnList
                    .map(item =>
                      item.alias ? `${item.name}(${item.alias})` : item.name
                    )
                    .join('、')
                }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            label="数据权属"
            prop="deptName"
            min-width="100"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            label="数据管家"
            prop="managerList"
            min-width="100"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              {{ scope.row.managerList.join(',') }}
            </template>
          </el-table-column>
          <el-table-column
            label="安全等级"
            prop="securityLevel"
            min-width="80"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            label="安全分类"
            prop="securityPath"
            min-width="100"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            label="业务系统"
            prop="category"
            min-width="100"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            label="数据资产目录"
            prop="catalogPath"
            min-width="100"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            label="备注"
            prop="remark"
            min-width="80"
            show-overflow-tooltip
          ></el-table-column>
        </datablau-table>
        <!-- <div class="table-form-btn" slot="buttons">
          <datablau-pagination
            @current-change="handlePageChange"
            @size-change="handleAssetSizeChange"
            :current-page.sync="tableFormParams.pageNum"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="tableFormParams.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="tableFormParams.total"
            class="page"
          ></datablau-pagination>
        </div> -->
      </datablau-form-submit>
    </div>
  </div>
</template>

<script>
import item from '@/view/dataIndex/indexApply/item.vue'

export default {
  name: 'AssetCartApplyDetails',
  props: {
    getDetailData: {
      type: Object,
      default() {
        return {}
      },
    },
    commonData: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  mounted() {
    console.log(this.getDetailData)
  },
  methods: {
    handleAssetSizeChange(val) {
      this.tableFormParams.pageSize = val
      this.tableFormParams.pageNum = 1
      this.getAssets()
    },
    handlePageChange(val) {
      this.tableFormParams.pageNum = val
      this.getAssets()
    },
    getAssets() {
      if (this.commonData.processInstanceId) {
        this.$http
          .post(`/assets/shopping/cart/list`, {
            formId: this.commonData.processInstanceId,
          })
          .then(res => {
            this.assetsList = res.data.data.content || []
            this.tableFormParams.total = res.data.data.totalElements || 0
          })
      }
    },
  },
  data() {
    return {
      assetsList: [],
      tableFormParams: {
        pageNum: 1,
        pageSize: 20,
        total: 0,
      },
    }
  },
  watch: {
    getDetailData: {
      handler() {
        const formItem = this.getDetailData.formDtos.find(
          item => item.code === 'formId'
        )
        if (formItem) {
          this.$http
            .post(`/assets/shopping/cart/list`, { formId: formItem.value })
            .then(res => {
              this.assetsList = res.data.data
            })
        }
      },
    },
  },
}
</script>

<style lang="scss" scoped>
.cart-apply-details {
  position: relative;
  height: 350px;
}
.table-data {
  position: absolute;
  top: 40px;
  left: -20px;
  right: -20px;
  bottom: 0px;
  /deep/ .db-table {
    position: absolute !important;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
}
</style>
