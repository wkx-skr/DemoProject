<template>
  <div class="api-userinfo api-user-info">
    <datablau-dialog
      title="添加用户"
      :visible.sync="showApplyDetail"
      append-to-body
      width="800px"
    >
      <apply-info
        modeType="addUser"
        @applySuccess="applySuccess"
        :applyDetail="detailData"
        v-if="showApplyDetail"
      ></apply-info>
    </datablau-dialog>
    <div class="filter-line">
      <div class="left-filter">
        <span class="filter-label">授权信息记录：</span>
        <datablau-select
          clearable
          size="mini"
          v-model="filterRange"
          placeholder="请选择"
          @change="changeRange"
          style="height: 30px; display: inline-block"
        >
          <el-option
            v-for="(item, index) in filterRangeType"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          ></el-option>
        </datablau-select>
      </div>
      <!--<div class="right-btn-container">-->
      <!--  <el-button size="mini" type="primary" @click="showAdd">新增</el-button>-->
      <!--</div>-->
    </div>
    <datablau-eltable
      class="api-detail-list"
      ref="tabWitdTable"
      :totalShow="totalShow"
      :getShowData="getShowData"
      :columnDefs="columnDefs"
      :hideDefaultFilter="hideDefaultFilter"
      :hideTopLine="hideTopLine"
      :defaultParaData="defaultParaData"
      :tableOption="tableOption"
    ></datablau-eltable>
  </div>
</template>

<script>
import ddsHTTP from '../ddsHTTP.js'
import applyInfo from './applyInfo.vue'

export default {
  components: {
    applyInfo,
  },
  props: {
    detailData: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      showApplyDetail: false,
      inlineInfo: true,
      searchFormData: {},
      totalShow: 0,
      columnDefs: null,
      hideTopLine: false,
      hideDefaultFilter: true,
      defaultParaData: null,
      tableOption: {
        rowSelection: 'single',
      },
      allData: null,
      filterRangeType: [
        { name: '近一周', value: 'week' },
        { name: '近一月', value: 'month' },
        { name: '近一年', value: 'year' },
      ],
      filterRange: '',
    }
  },
  computed: {},
  beforeMount() {
    const formatterPath = para => {
      return para.value && para.value.join('/')
    }
    const formatterCreateTime = para => {
      const result = new Date(para.data.createTime).toLocaleDateString()
      return result
    }
    const formatterEffectiveTime = para => {
      if (para.data.effectiveTime) {
        const result = new Date(para.data.effectiveTime).toLocaleDateString()
        return result
      } else {
        return '长期'
      }
    }
    const columnDefs = [
      {
        type: ['firstEmptyColumn'],
      },
      {
        headerName: '用户',
        field: 'applyUser',
        tooltipField: 'applyUser',
        // width: 200,
      },
      {
        headerName: '授权应用',
        field: 'appName',
        tooltipField: 'appName',
        // width: 200,
      },
      // {
      //   headerName: '所属部门',
      //   field: 'userDepartment',
      //   tooltipField: 'userDepartment',
      //   width: 200
      // },
      {
        headerName: '授权时间',
        valueFormatter: formatterCreateTime,
        tooltipValueGetter: formatterCreateTime,
        // cellRenderer: params => {
        //   const result = new Date(params.data.createTime).toLocaleDateString()
        //   return result
        // },
        // width: 200,
      },
      {
        headerName: '到期时间',
        valueFormatter: formatterEffectiveTime,
        tooltipValueGetter: formatterEffectiveTime,
        // cellRenderer: params => {
        //   const result = new Date(
        //     params.data.effectiveTime
        //   ).toLocaleDateString()
        //   return result
        // },
        // width: 200,
      },

      // {
      //   headerName: '操作',
      //   width: 100,
      //   type: ['optionsWithContent'],
      //   cellRendererParams: {
      //     tabComponent: this,
      //     options: [
      //       {name: 'remove', text: '移除用户', method: 'removeItem'}
      //     ]
      //   }
      // }
    ]

    this.columnDefs = columnDefs

    this.defaultParaData = {
      keyword: '',
      pageSize: 20,
      currentPage: 1,
    }
  },
  mounted() {},
  methods: {
    showAdd() {
      this.showApplyDetail = true
    },
    applySuccess() {
      this.showApplyDetail = false
      this.refreshData()
    },
    removeItem(data) {
      const newPromise = Promise.resolve
      newPromise
        .then(() => {
          this.$showSuccess('移除成功')
          this.refreshData()
        })
        .cathch(e => {
          this.$showFailure(e)
        })
    },
    getShowData(para) {
      return new Promise((resolve, reject) => {
        const obj = {
          currentPage: para.currentPage - 1,
          pageSize: para.pageSize,
          type: this.filterRange,
          apiId: this.detailData ? this.detailData.id : '',
        }

        ddsHTTP
          .getApiUserList(obj)
          .then(res => {
            // this.tableLoading = false
            this.totalShow = res.data.totalItems
            resolve(res.data.content)
          })
          .catch(e => {
            this.tableLoading = false
            reject(e)
          })
      })
    },
    refreshData() {
      this.$refs.tabWitdTable && this.$refs.tabWitdTable.refreshData()
    },
    changeRange() {
      this.refreshData()
    },
  },
  watch: {
    detailData() {
      this.refreshData()
    },
  },
}
</script>

<style lang="scss" scoped>
@mixin absPos {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.api-userinfo {
  @include absPos();
  left: 0;
  height: auto;

  .filter-line {
    margin-top: 10px;
    height: 40px;

    .left-filter {
      display: inline-block;
      width: 50%;
      .filter-label {
        margin-left: 20px;
      }
    }

    .right-btn-container {
      float: right;
    }
  }
  .api-detail-list {
    top: 45px;
    /deep/.tab-bottom-line {
      position: fixed;
      left: 161px;
      right: 0;
    }
  }
}
</style>

<style lang="scss">
.api-user-info {
  .tab-with-table .tab-top-line .button-container {
    float: none;
    //border: 1px solid red;
  }
}
</style>
