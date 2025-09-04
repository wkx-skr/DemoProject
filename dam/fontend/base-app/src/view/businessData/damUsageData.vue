<template>
  <div
    class="usage-table"
    :class="{ 'table-add-min-height': !tableHidePagination }"
  >
    <datablau-dialog
      append-to-body
      title="添加业务实体"
      :visible.sync="dialogVisible"
      v-if="dialogVisible"
      size="m"
      height="400"
    >
      <business-object
        class="yewu-dailog"
        :fromDialog="true"
        @bind="handleBindObject"
      ></business-object>
      <!--<search-business-column
        search-view
        search-table
        @selected="handleObjectSelect"
      ></search-business-column>-->
    </datablau-dialog>
    <div style="height: 260px; position: relative">
      <datablau-tab-with-table
        :key="tableKey"
        class="table-tab-container"
        :totalShow="totalShow"
        :columnDefs="columnDefs"
        :getShowData="getShowData"
        :hideTopLine="hideTopLine"
        :hideBottomLine="true"
        :tableHidePagination="true"
        no-pagination
        :tableOption="tableOption"
        :frameworkComponents="frameworkComponents"
      ></datablau-tab-with-table>
    </div>
    <div class="dialog-bottom">
      <datablau-button type="text" size="mini" @click="appendQuote(true)">
        添加输入类型的业务实体
      </datablau-button>
      <datablau-button type="text" size="mini" @click="appendQuote(false)">
        添加输出类型的业务实体
      </datablau-button>
      <datablau-button style="float: right" type="secondary" @click="close">
        关闭
      </datablau-button>
    </div>
  </div>
</template>

<script>
import { AgGridVue } from 'ag-grid-vue'
import MyScanRenderer from './MyScanRenderer'
import businessObject from '../businessObject/list.vue'
export default {
  components: { AgGridVue, businessObject },
  data() {
    return {
      totalShow: 0,
      columnDefs: null,
      hideTopLine: true,
      gridApi: null,
      columnApi: null,
      // showBottom: false,
      frameworkComponents: null,
      tableHidePagination: false,

      tableOption: {},
      selections: [],
      dialogVisible: false,
      isInput: undefined,
      tableData: null,
      tableKey: 0,
    }
  },
  props: {
    objectData: {
      type: Object,
      required: true,
    },
  },
  beforeMount() {
    this.frameworkComponents = {
      MyScanRenderer: MyScanRenderer,
    }
    const tableOption = {
      rowSelection: false,
    }
    this.tableOption = tableOption
    const columnDefs = [
      {
        headerName: '数据对象名称',
        field: 'businessTabName',
        tooltipField: 'businessTabName',
        width: 280,
        /* cellRenderer:params=>{
            let objectId = params.data.tableObjectId;
            if(params.data.model){
              return `<i class="fa fa-object-ungroup"></i> ${params.value}`
            }else{
              return `<i class="fa fa-object-ungroup"></i> <el-button class="el-button el-button--text for-jump" data-id="${objectId}">${params.value}</el-button>`;
            }
          } */
      },
      /*  {
          headerName: '来源',
          field: 'modelName',
          tooltipField: 'modelName',
          cellRenderer:params=>{
            if(params.data.model){
              return `<i class="tree-icon model" style="margin-left:-7px;"></i>${params.value}`;
            }else{
              return `<i class="tree-icon database"></i>${params.value}`;
            }

          },
          minWidth: 200,
        }, */
      {
        headerName: '类型',
        field: 'input',
        width: 80,
        cellRenderer: params => {
          if (params.data.model) {
            return ''
          } else {
            return params.value ? '输入' : '输出'
          }
        },
      },
      {
        headerName: '操作',
        width: 100,
        cellRenderer: 'MyScanRenderer',
      },
    ]
    this.columnDefs = columnDefs
  },
  computed: {},
  mounted() {
    //      this.getData();
    $(document).on('click', '.for-jump', function () {
      const objectId = $(this).attr('data-id')
      const pos = location.href.indexOf('#/')
      const baseUrl = location.href.slice(0, pos + 2)
      window.open(baseUrl + 'main/meta?objectId=' + objectId)
    })
    this.$bus.$on('unbindDamReference', table => {
      this.unbind(table)
    })
  },
  beforeDestroy() {
    this.$bus.$off('unbindDamReference')
    $(document).off('click', '.for-jump')
  },
  methods: {
    handleBindObject(row) {
      this.$http
        .post(
          `${this.$url}/service/busiObjects/objects/${this.objectData.objId}/bind/${row.businessTabId}?input=${this.isInput}`
        )
        .then(res => {
          this.tableKey++
          this.$blauShowSuccess(this.$version.common.operationSucceed)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    close() {
      this.$emit('close')
    },
    appendQuote(isInput) {
      this.isInput = isInput
      this.dialogVisible = true
    },
    handleObjectSelect(objectId) {
      this.$http
        .post(
          `${this.$url}/service/busiObjects/objects/${this.objectData.objId}/bind/${objectId}?input=${this.isInput}`
        )
        .then(res => {
          //          this.getShowData();
          this.tableKey++
          this.$blauShowSuccess(this.$version.common.operationSucceed)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    unbind(table) {
      const tableId = table.businessTabId
      const url = `${this.$url}/service/busiObjects/objects/${this.objectData.objId}/unbind/${tableId}?input=${table.input}`
      this.$DatablauCofirm('确定要解除绑定吗？', '', {
        confirmButtonText: this.$t('common.button.ok'),
        cancelButtonText: this.$t('common.button.cancel'),
        type: 'warning',
      })
        .then(() => {
          this.$http
            .delete(url)
            .then(res => {
              //            this.getShowData();
              this.tableKey++
              this.$blauShowSuccess(this.$version.common.operationSucceed)
            })
            .catch(e => this.$showFailure(e))
        })
        .catch(() => {})
    },
    getData() {
      const objectId = this.objectData.objId
      const url = `${this.$url}/service/busiObjects/objects/${objectId}/dam/bindings`
      this.$http
        .get(url)
        .then(res => {
          const tableData = []
          /* let url = `${this.$url}/service/busiObjects/objects/${objectId}/ddm/usage?currentPage=0&pageSize=1000`;
          this.$http.get(url).then(res=>{
            res.data.forEach(item=>{
              tableData.push({
                modelName:item.modelName,
                tableName:item.tableName,
                model:true,
              })
            });
          }).catch(e=>{
            this.$showFailure(e);
          }); */
          this.tableData = res.data
          this.totalShow = res.data.length
        })
        .catch(e => this.$showFailure(e))
    },
    getShowData(para) {
      const objectId = this.objectData.objId
      const url = `${this.$url}/service/busiObjects/objects/${objectId}/dam/bindings`
      return new Promise((resolve, reject) => {
        this.$http
          .get(url)
          .then(res => {
            const tableData = res.data
            this.totalShow = tableData.length
            this.$utils.sort.sort(tableData, 'businessTabName')
            resolve(tableData)
            /* let url = `${this.$url}/service/busiObjects/objects/${objectId}/ddm/usage?currentPage=1&pageSize=1000`;
            this.$http.get(url).then(res=>{
              res.data.items.forEach(item=>{
                tableData.push({
                  modelName:item.modelName,
                  tableName:item.tableName,
                  model:true,
                });
              });
              this.totalShow = tableData.length;
              this.$utils.sort.sort(tableData,'tableName');
              resolve(tableData);
            }).catch(e=>{
              reject(e);
              this.$showFailure(e);
            }); */
            //            let data = [];
            //            let resdata = res.data;
            //            this.totalShow = resdata.length;
            //            data = resdata;
            //            resolve(data);
          })
          .catch(e => {
            reject(e)
            this.$showFailure(e)
          })
      })
    },
    gridSelectionChanged(para) {
      const api = para.api
      const selections = api.getSelectedRows()

      this.selections = selections
    },
  },
  watch: {},
}
</script>

<style lang="scss" scoped>
.yewu-dailog {
  /deep/ .footer-row-all {
    border-top: 0;
    box-shadow: none;
  }
}
.usage-table {
  // position: relative;
  &.table-add-min-height {
    /*min-height: 600px;*/
    // overflow: auto;
  }
}
.el-dialog__wrapper {
  /deep/ .el-dialog {
    margin-top: 20px !important;
  }
}
.is-block.text {
  line-height: 34px;
  height: 34px;
}

// 弹出框样式
.el-dialog__wrapper {
  /deep/ .el-dialog {
    margin-top: 20px !important;
    position: relative;
    padding-top: 50px;
    padding-bottom: 20px;
    // padding-bottom: 64px;

    .el-dialog__header {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      box-sizing: border-box;
      height: 50px;
      padding: 20px 20px 0;
      box-sizing: border-box;
      border-bottom: 1px solid #ddd;
      margin-bottom: 10px;

      .el-dialog__headerbtn {
        top: 20px;

        i {
          font-size: 14px;
        }
      }

      .el-dialog__title {
        color: #555;
        font-weight: 500;
      }
    }

    .el-dialog__body {
      padding-top: 0;
      overflow: auto;
      margin-top: 10px;
      padding-bottom: 0;

      .form-item-footer {
        // position: absolute;
        bottom: 20px;
        left: 0;
        width: 100%;
        // padding: 0 20px;
        text-align: right;
      }
    }

    .el-dialog__footer {
      padding-bottom: 0;
    }
  }
}
</style>
