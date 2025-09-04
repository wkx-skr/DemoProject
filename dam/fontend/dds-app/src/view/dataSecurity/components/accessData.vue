<template>
  <div class="access-data-page">
    <datablau-list-search
      :noMinWidth="true"
      ref="accessBox"
      style="padding: 0px 20px"
    >
      <el-form ref="accessForm">
        <el-form-item label="">
          <datablau-input
            :iconfont-state="true"
            style="width: 200px"
            clearable
            type="text"
            v-model="accessForm.name"
            placeholder="搜索"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="安全等级">
          <datablau-checkbox v-model="checkLevelIds" @change="checkChange">
            <el-checkbox
              style="margin-left: 6px"
              v-for="item in levelList"
              :key="item.tagId"
              :label="item.tagId"
            >
              {{ item.name }}
            </el-checkbox>
          </datablau-checkbox>
        </el-form-item>
      </el-form>
    </datablau-list-search>
    <div class="table-box">
      <datablau-form-submit>
        <datablau-table
          v-loading="accessLoading"
          :loading="accessLoading"
          :data-selectable="false"
          :show-column-selection="false"
          height="100%"
          ref="table"
          :data="accessTableData"
          row-key="id"
        >
          <el-table-column width="25">
            <template slot-scope="scope">
              <i
                style="position: relative; top: 2px"
                :class="['iconfont', 'icon-' + scope.row.type]"
              ></i>
            </template>
          </el-table-column>
          <el-table-column
            :label="'数据资产名称'"
            prop="tableName"
            :min-width="120"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <el-popover
                popper-class="table-popover-pop"
                placement="bottom"
                width="420"
                trigger="hover"
                transition="fade-in-linear"
              >
                <div class="catalog-name" slot="reference">
                  {{
                    scope.row.tableCNName
                      ? `${scope.row.tableName}(${scope.row.tableCNName})`
                      : scope.row.tableName
                  }}
                </div>
                <table-pop :columnObj="scope.row.columnObj"></table-pop>
              </el-popover>
            </template>
            <!-- <span v-else>{{ scope.row.tableName }}</span> -->
          </el-table-column>
          <el-table-column
            :label="'权威来源'"
            prop="sourcePath"
            :min-width="120"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            :label="'数据资产目录'"
            prop="assetCatalog"
            :min-width="120"
            show-overflow-tooltip
          >
            <template
              slot-scope="scope"
              v-if="scope.row.assetCatalog.length !== 0"
            >
              <span>{{ scope.row.assetCatalog[0] }}</span>
              <el-popover
                v-if="scope.row.assetCatalog.length > 1"
                placement="bottom"
                title=""
                width="240"
                trigger="hover"
                transition="fade-in-linear"
                style="margin-left: 8px"
              >
                <p
                  v-html="scope.row.assetCatalog.join('<br/>')"
                  style="font-size: 12px; color: #555; line-height: 24px"
                ></p>
                <span slot="reference" style="color: #409eff; cursor: pointer">
                  更多
                </span>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column
            :label="'数据分类'"
            prop="securityCatalog"
            :min-width="120"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            :label="'安全等级'"
            prop="tagName"
            :min-width="120"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            :label="'行级访问'"
            prop="rowString"
            :min-width="120"
            show-overflow-tooltip
          ></el-table-column>
        </datablau-table>
        <template slot="buttons">
          <div class="bottom">
            <datablau-pagination
              @current-change="handleAccessPageChange"
              @size-change="handleAccessSizeChange"
              :current-page.sync="accessForm.page"
              :page-sizes="[20, 50, 100, 200]"
              :page-size="accessForm.size"
              layout="total, sizes, prev, pager, next, jumper"
              :total="accessTotal"
              class="page"
            ></datablau-pagination>
          </div>
        </template>
      </datablau-form-submit>
    </div>
  </div>
</template>

<script>
import API from '@/view/dataSecurity/util/api'
import { getAttrList } from '@/view/dataSecurity/util/util'
import tablePop from '@/view/dataSecurity/intelligenceClassification/identifyResult/components/tablePop.vue'
export default {
  components: {
    tablePop,
  },
  props: {
    userName: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      accessForm: {
        name: '',
        page: 1,
        size: 20,
      },
      accessLoading: false,
      accessTableData: [],
      accessTotal: 0,
      levelList: [],
      checkLevelIds: [],
      firstTimeout: null,
    }
  },
  mounted() {
    this.getSecurity()
    this.getAccessDate()
  },
  methods: {
    getSecurity() {
      getAttrList(API).then(data => {
        this.levelList = data
      })
    },
    handleAccessPageChange(page) {
      this.accessForm.page = page
      this.getAccessDate()
    },
    handleAccessSizeChange(size) {
      this.accessForm.page = 1
      this.accessForm.size = size
      this.getAccessDate()
    },
    checkChange(ids) {
      this.accessForm.page = 1
      this.getAccessDate()
    },
    getAccessDate() {
      this.accessLoading = true
      const params = {
        username: this.userName,
        query: this.accessForm.name,
        tagIds: this.checkLevelIds,
        currentPage: this.accessForm.page,
        pageSize: this.accessForm.size,
        sort: 'DESC', // ASC/DESC
      }
      API.getAccessData(params)
        .then(res => {
          const data = res.data.data
          this.accessLoading = false
          this.accessTotal = data.totalItems
          data.content.map(item => {
            if (item.typeId === 80000004) {
              item.type = 'biao'
            } else {
              item.type = 'shitu'
            }
            let table = []
            let tableMap = {}
            tableMap.type = item.typeId
            tableMap.tableName = item.tableName
            tableMap.tableAlias = item.tableCNName
            tableMap.tableDesc = item.describe
            table.push(tableMap)
            item.columnRangeDtoList.map(m => {
              m.columnDesc = m.definition
              m.columnAlias = m.columnCNName
              m.objectId = m.columnId
            })
            const column = item.columnRangeDtoList
            item.columnObj = {
              table,
              column,
            }
          })
          this.accessTableData = data.content || []
        })
        .catch(e => {
          this.accessLoading = false
          this.$showFailure(e)
        })
    },
  },
  watch: {
    'accessForm.name'(val) {
      clearTimeout(this.firstTimeout) // 防抖
      this.firstTimeout = setTimeout(() => {
        this.accessForm.page = 1
        this.getAccessDate()
      }, 800)
    },
  },
}
</script>
<style lang="scss">
.table-popover-pop {
  padding: 15px 8px;
}
</style>
<style lang="scss" scoped>
.catalog-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 8px;
  border-radius: 2px;
  cursor: pointer;
  &:hover {
    background: transparentize($color: #409eff, $amount: 0.9);
    color: #409eff;
  }
}
.access-data-page {
  position: absolute;
  top: 10px;
  left: 0;
  right: 0;
  bottom: 0;
  .table-box {
    position: absolute;
    top: 32px;
    left: 0;
    right: 0;
    bottom: 0;
  }
}
</style>
