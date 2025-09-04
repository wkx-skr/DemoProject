<template>
  <div
    class="meta-model-relation-list"
    :class="{ 'parent-list': direction === 'PARENT' }"
  >
    <datablau-form-submit v-if="tableData && tableData.length > 0">
      <datablau-table :data="tableData" height="100%">
        <el-table-column label="序号" type="index" width="60"></el-table-column>
        <el-table-column
          :label="tableLabelList[90000003]"
          prop="physicalName"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <datablau-button type="text" @click="jumpToDetail(scope.row)">
              {{ scope.row.physicalName }}
            </datablau-button>
          </template>
        </el-table-column>
        <el-table-column
          :label="tableLabelList[80100005]"
          prop="logicalName"
          show-overflow-tooltip
        ></el-table-column>
        <!-- <el-table-column
          label="数据类型"
          v-if="direction !== 'CHILDREN'"
          prop="dataType"
          show-overflow-tooltip
        ></el-table-column> -->
        <el-table-column
          :label="tableLabelList[90000004]"
          prop="definition"
          show-overflow-tooltip
        ></el-table-column>
      </datablau-table>
      <template slot="buttons" v-if="direction !== 'PARENT'">
        <datablau-pagination
          style="float: right"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
          :current-page.sync="currentPage"
          :page-sizes="[20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalShow"
          class="page"
        ></datablau-pagination>
      </template>
    </datablau-form-submit>
    <div v-else>
      <div class="container" style="width: 100%; text-align: center">
        <datablau-icon
          :data-type="'no-result'"
          icon-type="svg"
          :size="80"
          style="display: inline-block; margin: 0 auto"
        ></datablau-icon>
        <p style="">暂无数据</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'metaModelRelationList',
  data() {
    return {
      keyword: '',
      currentPage: 1,
      pageSize: 20,
      tableLoading: false,
      totalShow: 0,
      tableData: null,
    }
  },
  props: {
    objectId: {
      required: true,
      type: [String, Number],
    },
    direction: {
      default: 'PARENT', // PARENT, CHILDREN
    },
    childTypeId: {
      default: null,
      type: [String, Number],
    },
    defaultProperties: {},
  },
  components: {},
  computed: {},
  mounted() {
    if (this.defaultProperties && this.defaultProperties.length) {
      this.tableLabelList = this.defaultProperties.reduce((acc, curr) => {
        acc[curr.code] = curr.value
        return acc
      }, {})
    } else {
      this.tableLabelList = {
        90000003: '名称',
        90000004: '定义',
        80100005: '中文名',
      }
    }
    this.dataInit()
  },
  methods: {
    dataInit() {
      this.getShowData()
    },
    handleSizeChange(size) {
      this.pageSize = size
      this.getShowData()
    },
    handleCurrentChange(page) {
      this.currentPage = page
      this.getShowData()
    },
    getShowData() {
      let para = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        direction: this.direction,
        childTypeId: this.childTypeId,
        objectId: this.objectId,
      }
      this.$http
        .post(`/metadata/mm/getRelatedObjectsByObjectId`, para)
        .then(res => {
          let data = res.data
          this.totalShow = data.totalItems
          this.tableData = data.content
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    jumpToDetail(row) {
      let isBlank = (this.$route.query.blank || '').toLowerCase() === 'true'
      if (isBlank) {
        let pageUrl = this.BaseUtils.RouterUtils.getFullUrl('dataCatalog', {
          objectId: row.objectId,
          type: 'META_MODEL',
          blank: true,
        })
        window.open(pageUrl)
      } else {
        let pageUrl = this.BaseUtils.RouterUtils.getFullUrl('dataCatalog', {
          objectId: row.objectId,
          type: 'META_MODEL',
          blank: true,
        })
        window.open(pageUrl)
        // window.location.href = pageUrl
        // this.$emit('addHistory', pageUrl)
        // this.$emit('addHistory', {
        //   name: 'dataCatalog',
        //   query: {
        //     objectId: row.objectId,
        //     type: 'META_MODEL',
        //     blank: false,
        //   },
        // })
        // window.location.href = pageUrl
      }
    },
  },
  watch: {
    keyword() {
      this.currentPage = 1
      this.getShowData()
    },
  },
}
</script>

<style lang="scss" scoped>
.meta-model-relation-list {
  height: 400px;
  position: relative;
  //border: 1px solid red;
  &.parent-list {
    height: 120px;
  }
}
</style>
