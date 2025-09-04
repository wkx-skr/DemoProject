<template>
  <div class="choose-table-item tab-page">
    <div class="filter-row">
      <div class="row-inner" style="margin-top: 10px">
        <div class="search-container">
          <datablau-input
            size="small"
            :placeholder="$t('domain.dataFind.searchDataPlaceholder')"
            v-model="keyword"
            :clearable="true"
            :iconfont-state="true"
            class="normal-width-input"
          ></datablau-input>
          <datablau-button
            style="float: right; margin-right: 20px"
            @click="handleBatchChange(false)"
            v-if="!domainVertify"
          >
            {{ $t('domain.dataFind.disableThisPage') }}
          </datablau-button>
          <datablau-button
            style="float: right; margin-right: 10px"
            @click="handleBatchChange(true)"
            v-if="!domainVertify"
          >
            {{ $t('domain.dataFind.enableThisPage') }}
          </datablau-button>
        </div>
      </div>
    </div>
    <div class="table-row" style="top: 60px">
      <datablau-table
        ref="dsTable"
        v-loading="loadingDS"
        :data="displayData"
        :key="dsDataKey"
        :height="tableHeight"
        :data-selectable="false"
        :auto-hide-selection="true"
        @selection-change="handleSelectionChange"
        @select="handleSelecedtChange"
        @sort-change="handleSortChange"
        @select-all="handleSelectAll"
      >
        <el-table-column width="28">
          <datablau-icon
            :data-type="'datasource'"
            :size="18"
            style="margin-top: 8px"
          ></datablau-icon>
        </el-table-column>
        <el-table-column
          :label="$t('domain.dataFind.dataSource')"
          min-width="100"
          prop="definition"
          show-overflow-tooltip
          sortable="custom"
        >
          <template slot-scope="scope">
            {{ scope.row.definition }}
          </template>
        </el-table-column>
        <el-table-column
          prop="type"
          :label="$t('domain.dataFind.type')"
          sortable="custom"
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
          :label="$t('domain.common.owningSystem')"
          show-overflow-tooltip
          sortable="custom"
        ></el-table-column>
        <el-table-column
          prop="creationTime"
          :label="$t('domain.dataFind.dateCreated')"
          min-width="180"
          :formatter="$timeFormatter"
          sortable="custom"
        ></el-table-column>
        <el-table-column
          :label="$t('domain.dataFind.taskDetail')"
          min-width="180"
          v-if="domainVertify"
        >
          <template slot-scope="scope">
            <datablau-button type="text" @click="handleClickSee(scope.row)">
              {{ $t('domain.common.check') }}
            </datablau-button>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('domain.dataFind.referenceProperty')"
          min-width="200"
          v-if="!domainVertify && !domainCluster"
        >
          <template slot-scope="scope">
            <datablau-checkbox2
              :min="1"
              v-model="scope.row.compareConfig"
              :options="optionsList"
              @change="checkBoxChange(scope.row, scope.row.compareConfig)"
              :option-keys="optionKeys"
              :key="scope.row.modelId"
            ></datablau-checkbox2>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('domain.dataFind.enable')"
          width="100"
          v-if="!domainVertify"
        >
          <template slot-scope="scope">
            <datablau-switch
              :key="switcherKey"
              v-model="choosedMap[scope.row.modelId]"
              @change="handleSwitchChange"
            ></datablau-switch>
          </template>
        </el-table-column>
      </datablau-table>
    </div>
    <div class="row-page-info" style="width: 100%; padding-right: 20px">
      <datablau-pagination
        style="padding-top: 10px; float: right"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="currentPage"
        :page-sizes="[20, 50, 100, 500]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></datablau-pagination>
    </div>
  </div>
</template>

<script>
import DatabaseType from '@/components/dataSource/DatabaseType.vue'
const moment = require('moment')
export default {
  data() {
    this.BASE_URL = this.$url + '/service/'
    this.uploadHost = this.BASE_URL + 'upload'
    return {
      selection: [],
      mutipleLength: 0,
      selectCal: 0,
      deltaData: [],
      allData: [],
      total: 0,
      dsData: [],
      dsDataKey: 0,
      displayData: [],
      keyword: '',
      keywordFilterProps: ['definition', 'type', 'categoryName'],
      emptyPara: {
        keyword: '',
        currentPage: 1,
        sortData: {
          prop: '',
          order: 'ascending',
        },
        pageSize: 50,
      },
      sortData: {
        prop: '',
        order: 'ascending',
      },
      loadingDS: true,
      deleteDisabled: true,
      currentRow: null,
      tableHeight: 0,
      showTable: false,
      currentPage: 1,
      pageSize: 50,
      choosedItem: [],
      choosedMap: {},
      optionsList: JSON.stringify([
        {
          valueKey: '16',
          labelKey: this.$t('domain.dataFind.fieldCName'),
          disabled: false,
        },
        {
          valueKey: '1',
          labelKey: this.$t('domain.dataFind.fieldName'),
          disabled: false,
        },
        {
          valueKey: '256',
          labelKey: this.$t('domain.dataFind.fieldDefinition'),
          disabled: false,
        },
      ]),
      optionKeys: JSON.stringify({
        value: 'valueKey',
        label: 'labelKey',
      }),
      compareConfig: {},
      switcherKey: 0,
    }
  },
  props: [
    'choosedModels',
    'compareConfigObj',
    'domainVertify',
    'domainCluster',
  ],
  components: {
    DatabaseType,
  },
  computed: {},

  mounted() {
    var self = this
    this.choosedModels.forEach(item => {
      this.choosedMap[item + ''] = true
      this.choosedItem.push(item)
    })
    this.innerLoadDataSources()
    this.resizeTable()
    $(window).resize(this.resizeTable)
  },
  beforeDestroy() {
    $(window).unbind('resize', this.resizeTable)
  },

  methods: {
    handleClickSee(row) {
      this.$bus.$emit('modelData', row)
    },
    checkBoxChange(row, value) {
      let re = 0
      value.forEach(element => {
        re = re | element
      })
      this.$set(this.compareConfig, row.modelId, re)
      this.handleChooseDS()
    },
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
      const obj = {
        keyword: this.keyword,
        currentPage: currentPage,
        sortData: this.sortData,
        pageSize: this.pageSize,
      }
      this.changeDSDisplay(obj)
    },
    handleSelecedtChange(selection, row) {
      this.$set(
        this.choosedMap,
        row.modelId + '',
        !this.choosedMap[row.modelId + '']
      )
    },
    handleSelectAll(selection) {
      if (selection.length === 0) {
        this.displayData.forEach(item => {
          this.$set(this.choosedMap, item.modelId + '', false)
        })
      } else {
        this.displayData.forEach(item => {
          this.$set(this.choosedMap, item.modelId + '', true)
        })
      }
    },
    handleSortChange(sortData) {
      this.sortData = sortData
      const obj = {
        sortData: {
          prop: sortData.prop,
          order: sortData.order,
        },
        keyword: this.keyword,
        currentPage: 1,
        pageSize: this.pageSize,
      }
      this.currentPage = 1
      this.changeDSDisplay(obj)
    },

    handleSelectionChange(val) {
      this.selection = val
      this.mutipleLength = val.length
      this.deleteDisabled = this.selection.length == 0
    },
    handleChooseDS() {
      let arr = []
      for (const key in this.choosedMap) {
        if (this.choosedMap[key + '']) {
          arr.push(key - 0)
        }
      }
      let arrFilter = []
      this.allData.forEach(ele => {
        arr.filter(function (item) {
          if (item === ele.modelId) {
            arrFilter.push(item)
          }
        })
      })
      if (this.domainCluster) {
        this.$emit('chooseDatasource', arrFilter)
      } else {
        this.$emit('chooseDatasource', arrFilter, this.compareConfig)
      }
    },
    handleSwitchChange() {
      this.$nextTick(() => {
        this.switcherKey++
      })
      this.handleChooseDS()
    },
    handleBatchChange(isTrue) {
      this.displayData
        .map(i => i.modelId)
        .forEach(item => {
          this.choosedMap[item] = isTrue
        })
      this.$nextTick(() => {
        this.switcherKey++
      })
      this.handleChooseDS()
    },
    resizeTable() {
      this.$nextTick(() => {
        this.tableHeight = $('.choose-table-item .table-row')[0].offsetHeight
      })
      // setTimeout(() => {
      //   this.tableHeight = $(".choose-table-item .table-row")[0].offsetHeight;
      // }, 300);
    },
    changeDSDisplay(para, allData) {
      allData = allData || this.allData
      const arr = []
      if (!para) {
        para = _.clone(this.emptyPara)
        para.pageSize = this.pageSize
        para.keyword = this.keyword
        this.currentPage = para.currentPage
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
      if (!this.domainCluster) {
        if (this.compareConfigObj) {
          arr.forEach(element => {
            element.compareConfig = []
          })
          let reList = [1, 16, 256]
          let re = 0
          const map = new Map(Object.entries(this.compareConfigObj))
          arr.forEach(ele => {
            let value = map.get(ele.modelId.toString())
            if (value) {
              reList.forEach(item => {
                if ((value & item) !== 0) {
                  ele.compareConfig.push((value & item).toString())
                }
                ele.compareConfig = [...new Set(ele.compareConfig)]
                let re1 = 0
                ele.compareConfig.forEach(element => {
                  re1 = re1 | element
                })
                this.$set(this.compareConfig, ele.modelId, re1)
              })
            } else {
              ele.compareConfig.push('16')
              ele.compareConfig.push('1')
              ele.compareConfig = [...new Set(ele.compareConfig)]
              let re2 = 0
              ele.compareConfig.forEach(e => {
                re2 = re2 | e
              })
              this.$set(this.compareConfig, ele.modelId, re2)
            }
          })
        } else {
          arr.forEach(element => {
            element.compareConfig = ['16']
            let re = 0
            element.compareConfig.forEach(element => {
              re = re | element
            })
            this.$set(this.compareConfig, element.modelId, re)
          })
        }
      }
      if (para.sortData && para.sortData.prop) {
        const order =
          para.sortData.order !== 'descending' ? 'ascending' : 'descending'
        this.$utils.sort.sortConsiderChineseNumber(
          arr,
          para.sortData.prop,
          order
        )
      }
      const currentPage = para.currentPage || 1
      const pageSize = para.pageSize || this.pageSize
      this.displayData = arr.slice(
        pageSize * (currentPage - 1),
        pageSize * currentPage
      )
      this.$nextTick(() => {
        this.resetChoosedItem()
      })
      this.loadingDS = false
    },
    resetChoosedItem() {
      this.displayData.forEach(item => {
        if (this.choosedMap[item.modelId + '']) {
          this.$refs.dsTable.toggleRowSelection(item, true)
        }
      })
    },
    versionFormat: function (row) {
      return row.connectionInfo.versioning
        ? this.$t('domain.common.true')
        : this.$t('domain.common.false')
    },
    showSuccess(msg) {
      this.$message({
        title: 'Success',
        message: msg,
        type: 'success',
      })
    },
    innerLoadDataSources() {
      var self = this
      self.loadingDS = true
      self.$http
        .get(self.$meta_url + '/service/models/fromre/range')
        .then(res => {
          if (!res.data || !Array.isArray(res.data)) {
            return
          }
          this.$utils.sort.sortConsiderChineseNumber(res.data, 'definition')
          self.allData = res.data
          if (this.$dataSource.fakeData && this.$dataSource.fakeData.type) {
            self.allData.push(this.$dataSource.fakeData)
          }
          if (this.keyword === '') {
            self.changeDSDisplay()
          } else {
            this.keyword = ''
          }
        })
        .catch(e => {
          this.loadingDS = false
          this.$showFailure(e)
        })
    },
    removetab() {
      // this.$emit('removeTab')
      this.$bus.$emit('goBackHome', this.$t('domain.dataFind.dataRange'))
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
<style lang="scss" scoped>
.tab-page {
  .table-row {
    padding: 0 20px;
  }

  .footer-row {
    z-index: 9;
  }
}
</style>
