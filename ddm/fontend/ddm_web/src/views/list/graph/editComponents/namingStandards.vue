<template>
  <div class="naming-standard-wrapper">
    <datablau-dialog
      title="翻译设置"
      append-to-body
      width="800px"
      height="500px"
      custom-class="er-setting"
      :visible.sync="categoryVisible">
      <div class="category-wrapper">
        <div  style="color:#555"><i class="iconfont icon-tips" style="font-size: 14px;margin-right: 6px;vertical-align: middle;"></i>翻译优先级（中文名相同时，分类优先级更高的词根生效，拖动来调整顺序）</div>
        <datablau-table
          :data="categoryData"
          row-key="name"
        >
          <el-table-column
            width="65"
          >
            <template slot-scope="scope">
              <datablau-button type="icon" class="iconfont icon-up" :disabled="scope.$index === 0"  @click="upCategory(scope.$index)"></datablau-button>
              <datablau-button type="icon" class="iconfont icon-down" :disabled="scope.$index === categoryData.length - 1" @click="downCategory(scope.$index)"></datablau-button>
            </template>
          </el-table-column>
          <el-table-column
            label="优先级"
            width="60"
          >
            <template slot-scope="scope">
              {{scope.$index + 1}}
            </template>
          </el-table-column>
          <el-table-column
            label="命名词典分类"
          >
            <template slot-scope="scope">
              {{scope.row.name}}
            </template>
          </el-table-column>
          <el-table-column
            width="60"
            label="生效"
          >
            <template slot-scope="scope">
              <!--<datablau-checkbox :checkboxType="'single'" v-model="scope.row.checked">
              </datablau-checkbox>-->
              <datablau-switch
                size="mini"
                v-model="scope.row.checked"></datablau-switch>
            </template>
          </el-table-column>
        </datablau-table>
      </div>
      <div slot="footer">
        <datablau-button  type="cancel" @click="categoryVisible = false"></datablau-button>
        <datablau-button type="primary" @click="categoryOrderConfirm">
          确定
        </datablau-button>
      </div>
    </datablau-dialog>
    <div class="top-row">
      <datablau-input v-model="query" @input="searchStandards" :iconfont-state="true" placeholder="请输入关键词" size="mini" clearable></datablau-input>
      <div style="float: right">
        <!--<datablau-button @click="publishAllStandards" class="iconfont icon-publish" type="secondary" size="mini" >
          发布全部
        </datablau-button>
        <datablau-button class="iconfont icon-tianjia" type="secondary" size="mini" >
          新增词汇
        </datablau-button>-->
        <datablau-button @click="openClassDialog" class="iconfont icon-shezhi" type="secondary" size="mini" >
          翻译设置
        </datablau-button>
      </div>
    </div>
    <div class="table-box">
      <datablau-table
        :data="tableShowData"
        height="100%"
        @sort-change="sortChange"
      >
        <el-table-column
          sortable="custom"
          prop="chName"
          label="中文名"
        >
        </el-table-column>
        <el-table-column
          sortable="custom"
          prop="enName"
          label="英文名称"
        >
        </el-table-column>
        <el-table-column
          sortable="custom"
          prop="abbr"
          label="英文缩写"
        >
        </el-table-column>
        <el-table-column
          sortable="custom"
          prop="category"
          label="分类"
        >
        </el-table-column>
        <!--<el-table-column
          label="类型"
        >
          <template slot-scope="scope">
            <span v-if="scope.row.type === 'private'">自定义标准</span>
            <span v-else-if="scope.row.type === 'public'">企业级标准</span>
          </template>
        </el-table-column>
        <el-table-column
          prop=""
          label="操作"
          :width="110"
        >
          <template slot-scope="scope">
            <div v-if="scope.row.type === 'private'">
              <i title="发布" class="iconfont icon-publish" @click="publishStandard(scope.row)"></i>
              <i title="修改" class="iconfont icon-bianji"></i>
              <i title="删除" class="iconfont icon-delete"></i>
            </div>
          </template>
        </el-table-column>-->
      </datablau-table>
    </div>
    <span class="bottom-wrapper" slot="footer">
      <div class="bottom-box" >
        <datablau-pagination
          style="display: inline-block;"
          class="page"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        ></datablau-pagination>
        <el-button style="float: right;height: 30px;width: 64px;" @click="$emit('closeNamingStandardDialog')" size="mini">关闭</el-button>
      </div>
    </span>
  </div>
</template>

<script>
import string from '@/resource/utils/string.js'
import _ from 'lodash'
import $ from 'jquery'
import Sortable from 'sortablejs'
export default {
  data () {
    return {
      categoryData: [],
      categoryVisible: false,
      tableDataBak: [],
      tableData: [],
      tableShowData: [],
      total: 0,
      pageSize: 20,
      currentPage: 1,
      query: '',
      orderBy: 'chineseName',
      sort: 'desc',
      propMap: {
        chName: 'chineseName',
        enName: 'englishName',
        abbr: 'abbreviation',
        category: 'category'
      },
      sortMap: {
        ascending: 'asc',
        descending: 'desc'
      }
    }
  },
  mounted () {
    this.currentPage = 1
    this.getNamingStandards()
    this.getCategories()
  },
  methods: {
    categoryOrderConfirm () {
      let orderMap = {}
      this.categoryData.forEach((category, index) => {
        orderMap[category.name] = {
          index,
          checked: category.checked
        }
      })
      localStorage.setItem('categoryOrderMap', JSON.stringify(orderMap))
      this.$emit('changeCategoryOrder', this.categoryData.filter(i => i.checked).map(i => i.name === '默认' ? '' : i.name))
      this.categoryVisible = false
    },
    rowDrop () {
      const tbody = $('.category-wrapper .el-table__body-wrapper tbody')[0]
      const _this = this
      Sortable.create(tbody, {
        onEnd ({ newIndex, oldIndex }) {
          const currRow = _this.categoryData.splice(oldIndex, 1)[0]
          _this.categoryData.splice(newIndex, 0, currRow)
        }
      })
    },
    upCategory (index) {
      this.categoryData.splice(index - 1, 0, this.categoryData.splice(index, 1)[0])
    },
    downCategory (index) {
      this.categoryData.splice(index + 1, 0, this.categoryData.splice(index, 1)[0])
    },
    getCategories () {
      this.$http.get(this.$url + '/service/nametranslate/category').then(res => {
        this.categoryData = res.data.map(item => ({
          name: item === '' ? '默认' : item,
          checked: true
        }))
        let categoryStr = localStorage.getItem('categoryOrderMap')
        if (categoryStr) {
          let categoryOrderMap = JSON.parse(categoryStr)
          this.categoryData.forEach(i => {
            i.checked = Boolean(categoryOrderMap[i.name] && categoryOrderMap[i.name].checked)
          })
          this.categoryData = this.categoryData.sort((a, b) => {
            if (!categoryOrderMap[a.name]) {
              categoryOrderMap[a.name] = {
                index: this.categoryData.length
              }
            }
            if (!categoryOrderMap[b.name]) {
              categoryOrderMap[b.name] = {
                index: this.categoryData.length
              }
            }
            return categoryOrderMap[a.name].index - categoryOrderMap[b.name].index
          })
        }
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    openClassDialog () {
      this.categoryVisible = true
      this.getCategories()
      this.$nextTick(() => {
        this.rowDrop()
      })
    },
    sortChange ({ column, prop, order }) {
      console.log(column, prop, order)
      this.currentPage = 1
      this.orderBy = this.propMap[prop]
      this.sort = this.sortMap[order]
      this.getNamingStandards()
    },
    searchStandards () {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        // this.tableData = []
        // if (this.query) {
        //   this.tableData = this.tableDataBak.filter(item => string.matchKeyword(item, this.query, 'chName', 'enName', 'abbr', 'category'))
        // } else {
        //   this.tableData = _.cloneDeep(this.tableDataBak)
        // }
        // this.currentPage = 1
        // this.getShowContent()
        this.currentPage = 1
        this.getNamingStandards()
      }, 400)
    },
    publishAllStandards () {
      this.$http.post(this.$url + '/service/namingstandards/public', this.tableData.filter(item => item.type === 'private')).then(res => {
        this.currentPage = 1
        this.$message.success('全部发布成功')
        this.getNamingStandards()
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    publishStandard (data) {
      this.$http.post(this.$url + '/service/namingstandards/public', [data]).then(res => {
        this.currentPage = 1
        this.$message.success('发布成功')
        this.getNamingStandards()
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    handleSizeChange (size) {
      this.pageSize = size
      this.getNamingStandards()
    },
    handleCurrentChange (current) {
      this.currentPage = current
      this.getNamingStandards()
    },
    getNamingStandards () {
      this.$http.post(this.$url + '/service/namingstandards/search', {
        currentPage: this.currentPage - 1,
        keyword: this.query,
        pageSize: this.pageSize,
        orderBy: this.orderBy,
        sort: this.sort
      }).then(res => {
        this.tableDataBak = []
        // if (res.data.publicNamingStandard) {
        //   res.data.publicNamingStandard.forEach(item => {
        //     item.type = 'public'
        //     this.tableDataBak.push(item)
        //   })
        // }
        // if (res.data.privateNamingStandard) {
        //   res.data.privateNamingStandard.forEach(item => {
        //     item.type = 'private'
        //     this.tableDataBak.push(item)
        //   })
        // }
        // this.searchStandards()
        this.total = res.data.totalItems
        this.tableShowData = res.data.items
        // this.getShowContent()
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    getShowContent () {
      this.tableShowData = this.tableData.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
    }
  }
}
</script>

<style lang="scss" scoped>
  .is-block {
    height: 30px;
    line-height: 28px;
  }
  .icon-tianjia.iconfont.is-block {
    height: 30px;
    line-height: 30px;
    font-size: 12px;
     &::before {
      font-size: 14px;
      color: #999;
    }
    &:hover::before {
      color: #409EFF;
    }

  }
  .bottom-wrapper {
    position: absolute;
    bottom: -20px;
    left: 0px;
    right: 0px;
    height: 59px;
    padding: 0 20px;
    padding-top: 10px;
  }
  .bottom-box {
    height: 49px;
  }
  .datablau-input /deep/ .el-input__inner {
    height: 30px;
    line-height: 30px;
  }
  .naming-standard-wrapper {
    font-size: 12px;
  }
.table-box {
  position: absolute;
  top: 50px;
  left: 20px;
  right: 20px;
  bottom: 40px;
}
  .iconfont {
    cursor: pointer;
    font-size: 14px;
    &:hover {
      color: #409EFF;
    }
  }
</style>
