<template>
  <div class="dataSourceDialog">
    <datablau-dialog
      :visible.sync="dialogVisible"
      :title="$t('meta.lineageManage.lineageCatalogue.selectDataSource')"
      width="1000px"
      :height="'500px'"
      :before-close="handleClose"
      append-to-body
    >
      <div class="content" style="height: 330px">
        <datablau-input
          :iconfont-state="true"
          :placeholder="$t('meta.dataSource.nameSys')"
          v-model="keyword"
          style="width: 300px; display: inline-block; margin-top: 2px"
          clearable
        ></datablau-input>
        <datablau-table
          style="margin-top: 10px"
          @selection-change="handleSelectionChange"
          :data="displayData"
          :show-column-selection="optionTable.showColumnSelection"
          :column-selection="optionTable.columnSelection"
          :border="optionTable.columnResizable"
          :data-selectable="optionTable.selectable"
          @sort-change="handleSortChange"
          height="100%"
          v-loading="displayDataLoading"
        >
          <el-table-column
            :label="$t('meta.dataSource.name')"
            min-width="180"
            prop="definition"
            show-overflow-tooltip
            sortable="custom"
          ></el-table-column>
          <el-table-column
            :label="$t('meta.dataSource.type')"
            min-width="120"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <database-type
                :key="scope.row.type"
                :value="scope.row.type"
                :size="24"
              ></database-type>
            </template>
          </el-table-column>
          <el-table-column
            prop="categoryName"
            min-width="150"
            :label="$t('meta.dataSource.system')"
            show-overflow-tooltip
            sortable="custom"
          ></el-table-column>
          <el-table-column
            prop="createUser"
            :label="$t('meta.dataSource.creator')"
            min-width="80"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            prop="creationTime"
            :label="$t('meta.dataSource.createTime')"
            min-width="130"
            :formatter="$timeFormatter"
            show-overflow-tooltip
            sortable="custom"
          ></el-table-column>
        </datablau-table>
      </div>
      <span slot="footer">
        <div class="page">
          <datablau-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[20, 50, 100]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
          ></datablau-pagination>
        </div>
        <div>
          <datablau-button @click="close">
            {{ $t('common.button.cancel') }}
          </datablau-button>
          <datablau-button type="primary" @click="addDataSource">
            {{ $t('common.button.ok') }}
          </datablau-button>
        </div>
      </span>
    </datablau-dialog>
  </div>
</template>
<script>
import HTTP from '@/http/main'
import DatabaseType from '@/components/dataSource/DatabaseType.vue'
export default {
  components: { DatabaseType },
  data() {
    return {
      optionTable: {
        selectable: true,
        autoHideSelectable: true,
        showColumnSelection: true,
        columnSelection: [],
        columnResizable: true,
      },
      displayData: [],
      currentPage: 1,
      pageSize: 20,
      keyword: '',
      emptyPara: {
        keyword: '',
        currentPage: 1,
        sortData: {
          prop: '',
          order: 'ascending',
        },
        pageSize: 20,
      },
      keywordFilterProps: ['definition', 'type', 'categoryName'],
      selectionData: [],
      total: 0,
      displayDataLoading: true,
    }
  },
  props: ['dialogVisible', 'folderId'],
  beforeMount() {},
  mounted() {
    this.innerLoadDataSources()
  },
  methods: {
    handleSortChange(sortData) {
      this.sortData = sortData
      // sortData = {column, prop, order}
      const obj = {
        sortData: {
          prop: sortData.prop,
          order: sortData.order,
        },
        keyword: this.keyword,
        currentPage: this.currentPage,
        pageSize: this.pageSize,
      }
      this.changeDSDisplay(obj)
    },
    open() {
      this.innerLoadDataSources()
    },
    addDataSource() {
      let obj = []
      this.selectionData.forEach(element => {
        obj.push({
          // id: '',
          folderId: this.folderId,
          itemId: element.modelId,
          refType: 'DATAOBJECT',
          selectSchemas: element.schemas && element.schemas.split(';'),
        })
      })
      this.$http
        .post(
          this.$meta_url + '/service/lineage/folder/addOrUpdateFolderRefs',
          obj
        )
        .then(res => {
          this.$message.success(
            this.$t(
              'meta.lineageManage.lineageCatalogue.successfullyDataSource'
            )
          )
          this.$emit('closeDialog')
          this.$emit('getTreeRef', 'third')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    close() {
      this.$emit('closeDialog')
    },
    handleSelectionChange(val) {
      this.selectionData = val
    },
    openTabByQuery() {
      const modelId = this.$route.query.id
      if (modelId) {
        this.allData.forEach(item => {
          if (item.modelId === Number.parseInt(modelId)) {
            this.handleEdit(null, item)
          }
        })
      }
    },
    handleClose() {
      this.$emit('closeDialog')
    },
    innerLoadDataSources() {
      var self = this
      self.loadingDS = true
      this.displayDataLoading = true
      this.$http
        .post(`${this.$meta_url}/models/fromre/`)
        .then(res => {
          this.displayDataLoading = false
          if (!res.data || !Array.isArray(res.data)) {
            return
          }
          /* this.$utils.sort.sortConsiderChineseNumber(
            res.data,
            'creationTime',
            'descending'
          ) */
          self.allData = res.data
          let flagNames = []
          if (JSON.stringify(this.$dataSource.fakeData) !== '{}') {
            Object.values(this.$dataSource.fakeData).forEach(item => {
              flagNames = self.allData.slice(0, 20).map(a => {
                return a.definition
              })
              if (item.type && !flagNames.includes(item.definition)) {
                self.allData.unshift(item)
              }
            })
          }
          if (this.keyword === '') {
            self.changeDSDisplay()
          } else {
            this.keyword = ''
          }
          // this.openTabByQuery()
        })
        .catch(e => {
          this.loadingDS = false
          this.$showFailure(e)
        })
    },
    // 列表数据
    changeDSDisplay(para, allData) {
      allData = allData || this.allData
      const arr = []
      if (!para) {
        para = _.clone(this.emptyPara)
        para.pageSize = this.pageSize
        para.keyword = this.keyword
        para.currentPage = this.currentPage
      }
      para.keyword = para.keyword || this.keyword
      const keyword = para.keyword.trim().toLowerCase()
      allData.forEach(item => {
        let bool = false
        this.keywordFilterProps.forEach(prop => {
          if (item[prop] && item[prop].toLowerCase().indexOf(keyword) !== -1) {
            bool = true
          }
        })
        if (bool) {
          arr.push(item)
        }
      })
      this.total = arr.length
      this.dsData = arr
      if (para.sortData && para.sortData.prop) {
        const order =
          para.sortData.order !== 'descending' ? 'ascending' : 'descending'
        this.$utils.sort.sortConsiderChineseNumber(
          arr,
          para.sortData.prop,
          order
        )
      }
      localStorage.setItem('arr', JSON.stringify(arr))
      const currentPage = para.currentPage || 1 // 任意其它条件改变, currentPage 变为 1
      const pageSize = para.pageSize || this.pageSize
      this.displayData = arr.slice(
        pageSize * (currentPage - 1),
        pageSize * currentPage
      )

      this.loadingDS = false
    },
    /** 响应事件 */
    // 分页 设置
    handleSizeChange(size) {
      const obj = {
        keyword: this.keyword,
        currentPage: 1,
        sortData: this.sortData,
        pageSize: size,
      }
      this.currentPage = 1
      this.pageSize = size
      this.changeDSDisplay(obj)
    },
    handleCurrentChange(currentPage) {
      this.currentPage = currentPage
      const obj = {
        keyword: this.keyword,
        currentPage: this.currentPage,
        sortData: this.sortData,
        pageSize: this.pageSize,
      }
      this.changeDSDisplay(obj)
    },
  },
  watch: {
    keyword(newVal) {
      const obj = {
        keyword: newVal,
        currentPage: 1,
        sortData: this.sortData,
        pageSize: this.pageSize,
      }
      this.currentPage = 1
      this.changeDSDisplay(obj)
    },
  },
}
</script>
<style scoped lang="scss">
.page {
  position: absolute;
  left: 20px;
}
</style>
<style lang="scss"></style>
