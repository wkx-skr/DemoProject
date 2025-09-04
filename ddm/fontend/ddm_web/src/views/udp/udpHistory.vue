<template>
  <div class="udp-list-tab history-wrapper">
    <datablau-eltable
      class="table-tab-container"
      ref="categoryTable"
      :totalShow="totalShow"
      :columnDefs="columnDefs"
      :getShowData="getShowData"
      :hideTopLine="hideTopLine"
      :hideBottomLine="hideTopLine"
      :tableOption="tableOption"
      :tableHidePagination="tableHidePagination"
      :defaultParaData="defaultParaData"
    >
      <div class="right-btn-container" slot="header">
        <el-button
          size="mini"
          @click="refreshTable"
          style="margin-right: 20px;"
        >{{$v.udp.Refresh}}</el-button>
      </div>
      <div class="bottom-btn-container" slot="footer"></div>
    </datablau-eltable>
  </div>
</template>

<script>
import _ from 'lodash'
import sort from '@/resource/utils/sort'
import HTTP from '@/resource/http.js'

export default {
  data () {
    return {
      // *** tab with table ***
      tabName: this.$v.udp.udpAttribute, // '自定义属性',
      totalShow: 0,
      columnDefs: [],
      hideTopLine: false,
      tableOption: {
        // rowSelection: 'single',
      },
      tableHidePagination: false,
      defaultParaData: {
        currentPage: 1,
        pageSize: 20
      },
      selection: [],

      // *** edit dialog ***
      dialogVisible: false,
      // addCategoryData: {
      //   name: '',
      //   description: ''
      // },
      editCategoryData: {
        id: '',
        name: '',
        description: ''
      },
      dialogTitle: this.$v.udp.createBusinessLine, // '创建业务条线',
      isAddCategory: false,
      editRules: {
        name: {
          required: true,
          trigger: 'blur',
          message: this.$v.udp.mustName
        }
      }

    }
  },
  props: {
    udpId: {
      type: [String, Number],
      required: true
    },
    valueTypeArr: {
      type: Array,
      required: true
    },
    targetTypeArr: {
      type: Array,
      required: true
    }
  },
  components: {
    // tabWithTable
  },
  beforeMount () {
    let formatterTime = (data) => {
      let t = this.$timeFormatter(data.value)
      return t
    }
    let targetFomatter = (data) => {
      let typeId = parseInt(data.value[0])
      let target = this.targetTypeArr.find(item => item.typeId === typeId) || {}
      return target.label
    }
    let categoriesFomatter = (data) => {
      // console.log(data, 'data')
      let arr = data.value.map(item => item.name)
      return arr.join(',')
    }
    let typeFormatter = (data) => {
      let result = ''
      this.valueTypeArr.forEach(item => {
        if (data.value === item.value) {
          result = item.label
        }
      })
      return result
    }
    let columnDefs = [
      {
        type: ['firstEmptyColumn']
      },
      // {
      //   headerName: this.$v.udp.objectHierarchy, // '对象层级',
      //   field: 'targetTypes',
      //   // tooltipField: 'targetTypes',
      //   valueFormatter: targetFomatter,
      //   tooltipValueGetter: targetFomatter,
      //   width: 150
      //   // type: ['customFilter'],
      //   // filterParams: {
      //   //   getFilterItem: this.getTargetFilterItem
      //   // }
      // },
      {
        headerName: this.$v.udp.name, // '名称',
        field: 'name',
        tooltipField: 'name',
        minWidth: 150,
        type: ['customSortCol']
      },
      {
        headerName: this.$v.udp.dataType, // '数据类型',
        field: 'valueType',
        // tooltipField: 'valueType',
        valueFormatter: typeFormatter,
        tooltipValueGetter: typeFormatter,
        width: 150
      },
      {
        headerName: this.$v.udp.defaultValue, // '默认值',
        field: 'defaultValue',
        tooltipField: 'defaultValue',
        minWidth: 150
        // type: ['customSortCol'],
      },
      {
        headerName: this.$v.udp.description, // '备注',
        field: 'description',
        tooltipField: 'description',
        minWidth: 150
        // type: ['customSortCol'],
      },
      {
        headerName: this.$v.udp.BelongingbusinessLine, // '所属业务条线',
        field: 'categories',
        // tooltipField: 'description',
        valueFormatter: categoriesFomatter,
        tooltipValueGetter: categoriesFomatter,
        minWidth: 150
      },
      {
        headerName: this.$v.udp.Modifier, // '修改人',
        field: 'modifier',
        tooltipField: 'modifier',
        width: 150,
        type: ['customSortCol']
      },
      {
        headerName: this.$v.udp.modificationTime, // '修改时间',
        field: 'creationTimestamp',
        // tooltipField: 'createTime',
        valueFormatter: formatterTime,
        tooltipValueGetter: formatterTime,
        width: 150,
        suppressSizeToFit: true,
        type: ['customSortCol']
      }
    ]
    this.columnDefs = columnDefs
  },
  computed: {
    editBottomItemConfirm () {
      let bool = false
      bool = !!(this.editCategoryData && this.editCategoryData.name)
      return bool
    },
    couldDeleteBatch () {
      let arr = this.selection
      return arr && Array.isArray(arr) && arr.length > 0
    }
  },
  mounted () {

  },
  methods: {

    // *** tab with table ***
    getShowData (para) {
      return new Promise((resolve, reject) => {
        let currentPage = para.currentPage
        let pageSize = para.pageSize
        let keyword = para.keyword || ''

        let urlPara = {
          udpId: this.udpId,
          successCallback: data => {
            if (!data || !Array.isArray(data)) {
              data = []
            }

            let keyword = para.keyword || ''
            keyword = _.trim(keyword)
            if (keyword) {
              let result = []
              keyword = keyword.toLowerCase()
              let name = ''
              data.forEach(item => {
                name = item.name || ''
                name = name.toLowerCase()
                let index = name.indexOf(keyword)
                if (index !== -1) {
                  result.push(item)
                }
              })
              data = result
            }
            if (para.sortData && para.sortData.colId) {
              let colId = para.sortData.colId
              let order = para.sortData.sort === 'asc' ? 'ascending' : 'descending'
              sort.sortConsiderChineseNumber(data, colId, order)
            }

            this.totalShow = data.length

            let s = para.pageSize
            let c = para.currentPage

            let arr = data.slice(s * (c - 1), s * c)
            resolve(arr)
          },
          failureCallback: (e) => {
            this.$showFailure(e)
            reject(e)
          }

        }

        HTTP.getUdpHistory(urlPara)
      })
    },
    // gridSelectionChanged (para) {
    //   let api = para.api
    //   let arr = api.getSelectedNodes()
    //   let result = []
    //   arr.forEach(item => {
    //     result.push(item.data)
    //   })
    //   this.selection = result
    //   // console.log(this.selection, 'selection')
    // },

    // *** edit dialog ***
    // showAddDialog () {
    //   this.isAddCategory = true
    //   this.editCategoryData = {
    //     name: '',
    //     description: ''
    //   }
    //   this.dialogVisible = true
    // },
    // showEditDialog ({ data, api, e }) {
    //   // console.log({ data, api, e }, '{data, api, e}')
    //   this.isAddCategory = false
    //   this.editCategoryData = _.cloneDeep(data)
    //   this.dialogVisible = true
    // },
    // deleteCategoryItem ({ data, api, e }) {
    //   this.$confirm(this.$v.udp.deleteTips, this.$v.udp.Tips, {
    //     type: 'warning'
    //   }).then(() => {
    //     let id = data.id
    //     let para = { id }
    //     let callback = () => {
    //       this.$message.success(this.$v.udp.deletedSuccessfully)
    //       this.refreshTable()
    //     }
    //     this.deleteItem(para, callback)
    //   }).catch((e) => {
    //     console.info(e)
    //   })
    // },
    // saveEditObj () {
    //   if (this.editCategoryData && this.editCategoryData.name) {
    //     let requestBody = {
    //       name: this.editCategoryData.name,
    //       description: this.editCategoryData.description
    //     }
    //     if (!this.isAddCategory) {
    //       requestBody.id = this.editCategoryData.id
    //     }
    //     let para = {
    //       requestBody: requestBody,
    //       successCallback: (data) => {
    //         let sucMsg = this.isAddCategory ? this.$v.udp.addedSuccessfully : this.$v.udp.ModifiedSuccessfully
    //         this.$message.success(sucMsg)
    //         this.dialogVisible = false
    //         this.refreshTable()
    //       },
    //       failureCallback: e => {
    //         this.$showFailure(e)
    //       }
    //     }
    //
    //     if (this.isAddCategory) {
    //       HTTP.createUdpCategory(para)
    //     } else {
    //       HTTP.updateUdpCategory(para)
    //     }
    //   } else {
    //     this.$showFailure(this.$v.udp.nullValue)
    //   }
    // },
    refreshTable () {
      if (this.$refs.categoryTable && this.$refs.categoryTable.refreshData) {
        this.$refs.categoryTable.refreshData()
      }
    },
    // deleteItem (para, callback) {
    //   let delePara = {
    //     categoryId: para.id,
    //     successCallback: callback,
    //     failureCallback: e => {
    //       this.$showFailure(e)
    //     }
    //   }
    //   HTTP.deleteCategory(delePara)
    // },

    // async delete  category item
    // async deleteItemAsync (para, callback) {
    //   this.deleteItem(para, callback)
    // },

    // deleteBatch () {
    //   let arr = this.selection.map(item => {
    //     let obj = {
    //       id: item.id
    //     }
    //     return obj
    //   })
    //   // let arr = this.selection.map(item => {id:item.id});
    //   let callback = () => {
    //     this.$message.success(this.$v.udp.deletedSuccessfully)
    //     this.refreshTable()
    //   }
    //   let para = {
    //     fun: this.deleteItemAsync,
    //     paraArr: arr,
    //     callback
    //   }
    //   this.$confirm(this.$v.udp.deleteTips, this.$v.udp.Tips, {
    //     type: 'warning'
    //   }).then(() => {
    //     this.seriesFunCallback(para)
    //   }).catch(e => console.info(e))
    // },
    // seriesFunCallback ({ fun, paraArr, callback }) {
    //   let delCallback = null
    //   let nextCallback = () => {
    //     paraArr.shift()
    //     this.seriesFunCallback({ fun, paraArr, callback })
    //   }
    //   let obj = null
    //   if (paraArr && Array.isArray(paraArr) && paraArr.length > 1) {
    //     delCallback = nextCallback
    //     obj = paraArr[0]
    //   } else if (paraArr && Array.isArray(paraArr) && paraArr.length === 1) {
    //     obj = paraArr[0]
    //     delCallback = () => {
    //       paraArr.shift()
    //       callback && callback()
    //     }
    //   } else {
    //     callback && callback()
    //   }
    //   try {
    //     obj && fun(obj, delCallback)
    //   } catch (e) {
    //     this.$showFailure(e)
    //   }
    // },
    tableLayout () {
      if (this.$refs.categoryTable && this.$refs.categoryTable.resetTableStyle) {
        this.$refs.categoryTable.resetTableStyle()
      }
    }
  },
  watch: {
    udpId (newVal) {
      this.refreshTable()
    }
  }
}
</script>

<style lang="scss" scoped>
.udp-list-tab {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  overflow: hidden;
}
</style>
