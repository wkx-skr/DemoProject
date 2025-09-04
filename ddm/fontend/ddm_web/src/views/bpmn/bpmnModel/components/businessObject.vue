<template>
  <div>
    <!--<datablau-dialog
      title="添加组织机构"
      :visible.sync="businessDetailModal"
      append-to-body
      width="800px"
      height="560px"
      custom-class="task-detail-dialog-wrapper"
    >-->
      <template>
        <div class="boxCon">
          <div class="tree-container">
            <datablau-input
              style="display: block;margin-bottom: 5px;"
              v-model="keyword"
              :placeholder="$store.state.$v.common.placeholder"
              size="small"
              prefix-icon="el-icon-search"
              clearable
              :iconfont-state="true"
            ></datablau-input>
            <div class="tree-box" style="overflow: auto;flex: 1">
              <db-tree
                class="grey-tree has-cnt"
                ref="categoryTree"
                :data="treeData"
                :props="defaultProps"
                :default-expanded-keys="defaultKey"
                :filter-node-method="filterNode"
                @node-click="handleNodeClick"
                :default-expand-all="false"
                :expand-on-click-node="false"
                :highlight-current="true"
                node-key="id"
                :dataOptionsFunctionIsAsync="true"
                :data-icon-function="dataIconFunction"
                :label-formatter="treeLabelFormatter"
                :showOverflowTooltip="true"
                :dataSupervise="true"
              ></db-tree>
            </div>
        </div>
          <div class="right" style="flex: 1">
            <datablau-input
              style="display: block;margin-bottom: 5px;width: 240px"
              v-model="keywordTable"
              :placeholder="'搜索名称、编码'"
              size="small"
              prefix-icon="el-icon-search"
              clearable
              :iconfont-state="true"
              @input="getDataInnerKeyWord"
            ></datablau-input>
            <div style="height: 400px">
            <datablau-table
              :data="tableData"
              height="400px"
              ref="staffTable"
              :single-select="true"
              rowKey="id"
              :auto-hide-selection="false"
              v-loading="loading"
              :checkDisabledObj="checkDisabledObj"
              :reserve-selection="true"
              @selection-change="handleSelectionChange"
              :singleDefaultSelect="singleDefaultSelect"
            >
              <!--<el-table-column
                type="selection"
                :selectable="selectable"
                width="25">
                <template ></template>
              </el-table-column>-->
              <el-table-column
                show-overflow-tooltip
                label="名称"
                prop="name"
                min-width="90"
              >
                <template slot-scope="scope">
                  <datablau-list-icon iconType="svg" :dataType="'business_object'"></datablau-list-icon>
                  <span
                    @click.stop="handleCheck({data: scope.row})"
                    class="list-table-link"
                  >
              {{ scope.row.name }}
            </span>
                </template>

              </el-table-column>
              <el-table-column
                show-overflow-tooltip
                label="编码"
                prop="code"
              >
              </el-table-column>
              <el-table-column
                show-overflow-tooltip
                label="路径"
                prop="path"
                min-width="120"
              >
              </el-table-column>
              <el-table-column
                label="创建时间"
                show-overflow-tooltip
                :formatter="$timeFormatter"
                prop="createTime"
              >
                <template slot="header">
                  创建时间
                </template>
              </el-table-column>
            </datablau-table>
            </div>
          </div>
        </div>
      </template>
      <div slot="footer" class="footer">
        <datablau-pagination
          style="float: left"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[20, 50,100]"
          :page-size="pageSize"
          layout="total, sizes,  pager,  jumper"
          :total="total">
        </datablau-pagination>
        <div style="float: right">
          <datablau-button type="secondary" @click="closeStructure">
            {{ $t('common.button.cancel') }}
          </datablau-button>
          <datablau-button
            type="primary"
            @click="saveStructure"
            :disabled="structureDisabled"
          >
            {{ $t('common.button.ok') }}
          </datablau-button>
        </div>
      </div>
<!--    </datablau-dialog>-->
  </div>
</template>

<script>
import string from '@/resource/utils/string'
import HTTP from '@/resource/http'
import dbTree from '@/views/modelLibrary/tree/DatablauTree.vue'
import moment from 'moment'

export default {
  data () {
    return {
      structureDisabled: true,
      businessDetailModal: true,
      keyword: '',
      treeData: [],
      defaultProps: {
        label: 'name',
        children: 'children',
        id: 'id'
      },
      loading: true,
      defaultKey: [],
      keywordTable: '',
      tableData: [],
      pageSize: 20,
      currentPage: 1,
      total: 0,
      treeDataSelect: null,
      selection: [],
      ary: [],
      checkDisabledObj: {
        id: []
      },
      singleDefaultSelect: this.oldData ? this.oldData.id : ''
    }
  },
  components: {
    dbTree
  },
  props: {
    allModal: {
      type: Array,
      default: () => []
    },
    oldData: {
      type: Object,
      default: () => {}
    }
  },
  watch: {
    keyword (value) {
      this.$refs.categoryTree.filter(value)
    },
    allModal (val) {
    }
  },
  methods: {
    closeStructure () {
      this.businessDetailModal = false
      this.$emit('closeMode', this.selection)
    },
    saveStructure () {
      this.businessDetailModal = false
      this.$emit('result', this.selection)
      this.$emit('closeMode')
    },
    handleSizeChange (val) {
      this.pageSize = val
      this.getDataInner()
    },
    handleCurrentChange (val) {
      this.currentPage = val
      this.getDataInner()
    },
    handleNodeClick (item) {
      this.treeDataSelect = item
      this.getDataInner()
    },
    filterNode (value, data, node) {
      if (!value) {
        return true
      }
      if (!data.name) {
        return false
      }
      let hasValue = false
      if (string.matchKeyword(node.data, value, 'name', 'alias')) {
        hasValue = true
      }
      return hasValue
    },

    dataIconFunction (data, node) {
      if (node.level === 2) {
        return 'tree-icon business-area'
      } else if (node.level === 3) {
        return 'tree-icon theme-area'
      } else if (node.data.damModelCategoryId) {
        if (node.expanded) {
          return 'iconfont icon-openfilebinding'
        } else {
          return 'iconfont icon-filebinding'
        }
      } else {
        if (node.expanded) {
          return 'iconfont icon-openfile'
        } else {
          return 'iconfont icon-file'
        }
      }
    },
    treeLabelFormatter (node) {
      let modelCount = 0
      const ForEach = (node) => {
        if (!node) return
        if (node.childNodes) {
          node.childNodes.forEach((item) => {
            ForEach(item)
          })
        }
      }
      ForEach(node)
      node.modelCount = modelCount
      let alias = node.data.alias && node.level !== 1 ? `(${node.data.alias})` : ''
      // ${node.data.damModelCategoryId ? '*' : ''}
      return `${node.label}${alias}`
    },

    dataInit (para = {}, callback) {
      HTTP.getBusinessObjCategoryTree()
        .then(data => {
          /* data.forEach(item => {
            if (item.id === this.oldData.id) {

            }
          }) */
          this.treeData = data
          this.loading = false
          this.defaultKey = data[0] ? [data[0].id] : []
          this.$nextTick(() => {
            this.$refs.categoryTree && this.$refs.categoryTree.setCurrentKey(this.defaultKey[0])
            // let defaultNode = this.$refs.categoryTree.getNode(this.defaultKey[0])
            this.handleNodeClick(data[0])
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getDataInnerKeyWord () {
      this.pageSize = 20
      this.currentPage = 1
      this.getDataInner()
    },
    getDataInner (para) {
      // getData (para) {
      // console.log('currentCategory', this.currentCategory)
      // let para = {}
      this.loading = true
      let obj = {
        pageSize: this.pageSize,
        currentPage: this.currentPage
      }
      obj.requestBody = {
        name: this.keywordTable,
        subjectTag: [],
        subjectId: this.treeDataSelect.id,
        state: ['A'],
        releasedStartDate: null,
        releasedEndDate: null,
        createStartDate: null,
        createEndDate: null
      };
      ['releasedStartDate', 'releasedEndDate', 'createStartDate', 'createEndDate'].forEach(key => {
        // timeFormatter
        if (obj.requestBody[key]) {
          obj.requestBody[key] = moment(obj.requestBody[key]).format('YYYY-MM-DDTHH:mm:ss.SSSZ')
        }
      })
      this.tableData = null
      HTTP.getBusinessObjList(obj)
        .then(res => {
          this.loading = false
          this.total = res.totalElements
          this.tableData = res.content
          this.$nextTick(() => {
            let ary = this.oldData ? this.allModal.filter(item => item.id !== this.oldData.id) : this.allModal
            this.checkDisabledObj.id = ary.map(item => item.id)
            this.singleDefaultSelect = this.oldData ? this.oldData.id : ''
          })
        })
        .catch(e => {
          this.$showFailure(e)
          this.loading = false
        })
    },
    handleSelectionChange (val) {
      this.selection = val
      this.structureDisabled = false
    },
    selectable (row, index) {
      let obj = this.ary.find(i => i.id === row.id)
      if (obj) {
        return false
      } else {
        return true
      }
    }
  },
  mounted () {
    this.ary = []
    /* this.allModal.flat().forEach(item => {
      let obj = this.oldData.find(i => i.id === item.id)
      !obj && this.ary.push(item)
    }) */
    this.dataInit()
  }
}
</script>

<style scoped lang='scss'>
.boxCon{
  display: flex;
  /*height: 450px;*/
  border-bottom: 1px solid #ddd;
  position: absolute;
  top: -1px;
  left: 0;
  right: 0;
  bottom: 37px;
}
  .tree-container{
    width: 250px;
    padding: 10px;
    border-right: 1px solid #ddd;
    position: relative;
    display: flex;
    flex-direction: column;
  }
.right{
  padding-left: 7px;
  padding-top: 10px;
}
.footer{
  position: absolute;
  bottom: -7px;
  left: 20px;
  right: 20px;
}
/deep/ .el-table .el-table-column--selection{
  .cell {
    text-align: center;
  }
}

</style>
<style lang="scss">
  .right {
    /deep/.db-tabl{
      height: 384px;
    }
  }
</style>
