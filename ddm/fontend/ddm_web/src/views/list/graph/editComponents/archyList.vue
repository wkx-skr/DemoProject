<template>
  <div class="archy-list-wrapper" v-loading="loading">
    <datablau-input
      style="display: block"
      v-model="keyword"
      placeholder="搜索业务对象名称，编码"
      size="small"
      prefix-icon="el-icon-search"
      clearable
      :iconfont-state="true"
      @input="debouncedGetData"
    ></datablau-input>
    <div class="table-data-wrapper">
      <div title="基础标准" class="path-box">
        <i class="el-icon-arrow-left" @click="goBack"></i>
        <span class="cat-box">{{categoryData.name}}</span>
      </div>
      <div class="table-content-wrapper">
        <datablau-table
          :data="tableData"
          :show-header="false"
          height="100%"
          row-key="id"
          lazy
          :load="load"
        >
          <!--属性名称-->
          <el-table-column
            prop="name"
            label="业务对象"
            show-overflow-tooltip
            min-width="150px"
          >
            <template slot-scope="scope">
              <div class="archy-item" :class="scope.row.combinedId ? 'table-archy' : 'business-model-archy'" :logicalModelVersionId="scope.row.logicalModelVersionId" :parentId="scope.row.parentId" :id="scope.row.id">
                <img width="20" :src="scope.row.combinedId ? tableImg :businessImg" alt="">
                <span class="name-wrapper">{{scope.row.alias ? `${scope.row.name}(${scope.row.alias})`: scope.row.name}}</span>
              </div>
            </template>
          </el-table-column>
        </datablau-table>
      </div>
    </div>
    <div class="pagination-footer">
      <datablau-pagination
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        :page-size="pageSize"
        :page-sizes="[20, 50, 100]"
        :current-page.sync="currentPage"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      ></datablau-pagination>
    </div>
  </div>
</template>

<script>
import lodash from 'lodash'
import HTTP from '@/resource/http'

export default {
  props: {
    categoryData: {

    }
  },
  mounted () {
    this.getData()
  },
  data () {
    return {
      debouncedGetData: lodash.debounce(this.getData, 500),
      businessImg: require('@/assets/images/search/business_object.svg'),
      tableImg: require('@/assets/images/tables/table.svg'),
      keyword: '',
      tableData: [],
      loading: false,
      total: 0,
      pageSize: 20,
      currentPage: 1
    }
  },
  methods: {
    load (tree, treeNode, resolve) {
      this.$http.post(`${HTTP.$archyServerUrl}object/object/info/${tree.id}?setEntity=true`, {}).then(res => {
        resolve((res.data.entities || []).map((item) => ({
          ...item,
          parentId: tree.id,
          logicalModelVersionId: tree.logicalModelVersionId, // 业务对象的版本号
          id: item.combinedId
        })))
        this.$nextTick(() => {
          this.$bus.$emit('addEntityListener', tree.id)
        })
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    handleSizeChange (size) {
      this.pageSize = size
      this.getData()
    },
    handleCurrentChange (current) {
      this.currentPage = current
      this.getData()
    },
    goBack () {
      this.$emit('clearCategory')
    },
    getData () {
      this.loading = true
      let obj = {
        pageSize: this.pageSize,
        currentPage: this.currentPage
      }
      obj.requestBody = {
        name: this.keyword,
        subjectTag: null,
        subjectId: this.categoryData.id,
        state: ['A'], // 已发布
        releasedStartDate: null,
        releasedEndDate: null,
        createStartDate: null,
        createEndDate: null
      }
      HTTP.getBusinessObjList(obj)
        .then(res => {
          this.loading = false
          this.total = res.totalElements
          this.tableData = res.content.map(item => ({
            hasChildren: true,
            ...item
          }))
          this.$nextTick(() => {
            this.$bus.$emit('addArchyListener')
          })
        })
        .catch(e => {
          this.$showFailure(e)
          this.loading = false
        })
    }
  }
}
</script>

<style lang="scss" scoped>
/deep/ .el-table .cell {
  overflow: visible;
}
.archy-item {
  display: inline-block;
}
.name-wrapper {
  display: inline-block;
  margin-left: 5px;
}
.archy-list-wrapper {
  position:absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 8px;
  .table-data-wrapper {
    position: absolute;
    left: 0;
    right: 0;
    top: 44px;
    bottom: 30px;
    overflow: hidden;
    .table-content-wrapper {
      position: absolute;
      top: 35px;
      bottom: 0;
      left: 0;
      right: 0;
      overflow: auto;
    }
  }
  .pagination-footer {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 30px;
    overflow-x: auto;
    overflow-y: hidden;
    box-shadow: 0px -2px 4px 0px rgba(85, 85, 85, 0.2);
    display: flex;
    align-items: center;
  }
  .path-box {
    height: 30px;
    display: flex;
    align-items: center;
    font-size: 12px;
    font-weight: 400;
    color: #555555;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    border-bottom: 1px solid #ddd;
    i {
      font-size: 13px;
      margin-right: 6px;
      cursor: pointer;
      color: #999;
      &:hover {
        color: #409eff;
      }
    }
  }
}
</style>
