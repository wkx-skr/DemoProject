<template>
  <div class="udp-list-tab">
    <datablau-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      v-if="dialogVisible"
      :append-to-body="true"
      width="600px"
      class="edit-category-dia"
      size="m"
      :close-on-click-modal="false"
    >
      <div class="edit-category-dialog-body" v-if="dialogVisible">
        <datablau-form
          ref="editCategory"
          label-position="right"
          label-width="90px"
          size="small"
          :model="editCategoryData"
          :rules="editRules"
        >
          <el-form-item :label="$v.udp.businessline +'：'" prop="name">
            <datablau-input v-model="editCategoryData.name" size="mini" style="width: 100%;"></datablau-input>
          </el-form-item>
          <el-form-item :label="$v.udp.description+ '：'" prop="description">
            <datablau-input
              type="textarea"
              v-model="editCategoryData.description"
              size="mini"
              style="width: 100%;"
            ></datablau-input>
          </el-form-item>
        </datablau-form>
      </div>
      <div slot="footer" class="category-dialog-footer dialog-bottom">
        <datablau-button @click="dialogVisible = false" type="secondary" size="mini">{{
            $v.udp.cancel
          }}
        </datablau-button>
        <datablau-button type="primary" @click="saveEditObj" class="" :disabled="!editBottomItemConfirm || savePending" size="mini">
          {{ $v.udp.Yes }}
        </datablau-button>
      </div>
    </datablau-dialog>
    <datablau-eltable
      class="table-tab-container"
      ref="categoryTable"
      :totalShow="totalShow"
      :columnDefs="columnDefs"
      :getShowData="getShowData"
      :hideTopLine="hideTopLine"
      :hideBottomLine="hideTopLine"
      :tableHidePagination="tableHidePagination"
      :defaultParaData="defaultParaData"
      :paginationLayout="'total, sizes, prev, pager, next'"
      :searchPlaceholder="'搜索属性名称'"
      :tableOption="tableOption"
      labelPosition="normal"
      @gridSelectionChanged="gridSelectionChanged"
    >
      <div class="right-btn-container" slot="header">
        <datablau-button
          type="normal"
          size="mini"
          @click="showAddDialog"
          class="iconfont icon-tianjia"
          style="margin-right: 20px;"
        > 添加业务条线
        </datablau-button>
        <!--<datablau-button-->
        <!--  size="mini"-->
        <!--  @click="refreshTable"-->
        <!--  type="secondary"-->
        <!--  style="margin-right: 20px;"-->
        <!--&gt;{{ $v.udp.Refresh }}-->
        <!--</datablau-button>-->
      </div>
      <div class="bottom-btn-container" slot="footer">
        <!--<datablau-button-->
        <!--  type="danger"-->
        <!--  size="small"-->
        <!--  class="delete-btn"-->
        <!--  @click="deleteBatch"-->
        <!--  :disabled="!couldDeleteBatch"-->
        <!--&gt;{{ $v.udp.delete }}-->
        <!--</datablau-button>-->
        <datablau-button
          class="delete-btn"
          type="secondary"
          @click="closeDialog"
        >{{ $v.customStatus.close }}
        </datablau-button>
      </div>
    </datablau-eltable>
  </div>
</template>

<script>
import HTTP from '@/resource/http.js'
import _ from 'lodash'

export default {
  data () {
    return {

      // *** tab with table ***
      tabName: this.$v.udp.udpAttribute, // '自定义属性'
      totalShow: 0,
      columnDefs: [],
      hideTopLine: false,
      tableOption: {
        // rowSelection: 'single',
        selectable: false,
        autoHideSelectable: false,
        showColumnSelection: true,
        columnSelection: [],
        columnResizable: true
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
      savePending: false,
      editRules: {
        name: [
          {
            required: true,
            trigger: 'blur',
            message: this.$v.udp.mustName // '名称是必填的'
          }, {
            trigger: 'blur',
            validator: (rule, value, callback) => {
              if (this.isNameDuplicate()) {
                callback(new Error('名称不能重复'))
              } else {
                callback()
              }
            }
          }
        ]
      }

    }
  },
  components: {
  },
  beforeMount () {
    let formatterTime = (data) => {
      let t = this.$timeFormatter(data.value)
      return t
    }
    let columnDefs = [
      // {
      //   type: ['selectionCheckboxColumn']
      // },
      {
        headerName: this.$v.udp.name, //  '名称',
        field: 'name',
        tooltipField: 'name',
        // width: 150,
        minWidth: 150
        // type: ['customSortCol'],
      },
      {
        headerName: this.$v.udp.description, // '备注',
        field: 'description',
        tooltipField: 'description',
        // width: 150,
        minWidth: 150
        // type: ['customSortCol'],
      },
      {
        headerName: this.$v.udp.operation, // '操作',
        width: 100,
        type: ['optionsWithContent'],
        cellRendererParams: {
          tabComponent: this,
          options: [
            { name: 'edit', icon: 'iconfont icon-bianji', text: this.$v.udp.edit, method: 'showEditDialog' },
            { name: 'remove', icon: 'iconfont icon-delete', text: this.$v.udp.delete, method: 'deleteCategoryItem' }
          ]
        }
      }
    ]
    this.columnDefs = columnDefs
  },
  computed: {
    editBottomItemConfirm () {
      let bool = false
      bool = !!(this.editCategoryData && this.editCategoryData.name)
      if (this.isNameDuplicate()) {
        bool = false
      }
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
          successCallback: data => {
            if (!data || !Array.isArray(data)) {
              data = []
            }

            this.$globalData.udpCategories = data

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

        HTTP.getUdpCategories(urlPara)
          .then(res => {})
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
    gridSelectionChanged (para) {
      let api = para.api
      let arr = api.getSelectedNodes()
      let result = []
      arr.forEach(item => {
        result.push(item.data)
      })
      this.selection = result
      // console.log(this.selection, 'selection')
    },

    // *** edit dialog ***
    showAddDialog () {
      this.isAddCategory = true
      this.editCategoryData = {
        name: '',
        description: ''
      }
      this.dialogVisible = true
    },
    showEditDialog ({ data, api, e }) {
      this.dialogTitle = this.$v.udp.EditBusinessLines // '编辑业务条线'
      // console.log({ data, api, e }, '{data, api, e}')
      this.isAddCategory = false
      this.editCategoryData = _.cloneDeep(data)
      this.dialogVisible = true
    },
    deleteCategoryItem ({ data, api, e }) {
      this.$confirm(this.$v.udp.deleteTips, this.$v.udp.Tips, {
        type: 'warning'
      }).then(() => {
        let id = data.id
        let para = { id }
        let callback = () => {
          this.$message.success(this.$v.udp.deletedSuccessfully)
          this.refreshTable()
        }
        this.deleteItem(para, callback)
      }).catch((e) => {
        console.info(e)
      })
    },
    saveEditObj () {
      this.savePending = true
      if (this.editCategoryData && this.editCategoryData.name) {
        let requestBody = {
          name: this.editCategoryData.name,
          description: this.editCategoryData.description
        }
        if (!this.isAddCategory) {
          requestBody.id = this.editCategoryData.id
        }
        let para = {
          requestBody: requestBody,
          successCallback: (data) => {
            let sucMsg = this.isAddCategory ? this.$v.udp.addedSuccessfully : this.$v.udp.ModifiedSuccessfully
            this.$message.success(sucMsg)
            this.dialogVisible = false
            this.refreshTable()
            this.savePending = false
          },
          failureCallback: e => {
            this.$showFailure(e)
            this.savePending = false
          }
        }

        if (this.isAddCategory) {
          HTTP.createUdpCategory(para)
        } else {
          HTTP.updateUdpCategory(para)
        }
      } else {
        this.$showFailure(this.$v.udp.nullValue)
        this.savePending = false
      }
    },
    refreshTable () {
      if (this.$refs.categoryTable && this.$refs.categoryTable.refreshData) {
        this.$refs.categoryTable.refreshData()
      }
    },
    deleteItem (para, callback) {
      let delePara = {
        categoryId: para.id,
        successCallback: callback,
        failureCallback: e => {
          this.$showFailure(e)
        }
      }
      HTTP.deleteCategory(delePara)
    },

    // async delete  category item
    async deleteItemAsync (para, callback) {
      this.deleteItem(para, callback)
    },

    deleteBatch () {
      let arr = this.selection.map(item => {
        let obj = {
          id: item.id
        }
        return obj
      })
      // let arr = this.selection.map(item => {id:item.id});
      let callback = () => {
        this.$message.success(this.$v.udp.deletedSuccessfully)
        this.refreshTable()
      }
      let para = {
        fun: this.deleteItemAsync,
        paraArr: arr,
        callback
      }
      this.$confirm(this.$v.udp.deleteTips, this.$v.udp.Tips, {
        type: 'warning'
      }).then(() => {
        this.seriesFunCallback(para)
      }).catch(e => console.info(e))
    },
    closeDialog () {
      this.$emit('closeDialog')
    },
    seriesFunCallback ({ fun, paraArr, callback }) {
      let delCallback = null
      let nextCallback = () => {
        paraArr.shift()
        this.seriesFunCallback({ fun, paraArr, callback })
      }
      let obj = null
      if (paraArr && Array.isArray(paraArr) && paraArr.length > 1) {
        delCallback = nextCallback
        obj = paraArr[0]
      } else if (paraArr && Array.isArray(paraArr) && paraArr.length === 1) {
        obj = paraArr[0]
        delCallback = () => {
          paraArr.shift()
          callback && callback()
        }
      } else {
        callback && callback()
      }
      try {
        obj && fun(obj, delCallback)
      } catch (e) {
        this.$showFailure(e)
      }
    },
    tableLayout () {
      if (this.$refs.categoryTable && this.$refs.categoryTable.resetTableStyle) {
        this.$refs.categoryTable.resetTableStyle()
      }
    },
    isNameDuplicate () {
      let bool = false
      let arr = this.$globalData.udpCategories
      if (this.editCategoryData.name) {
        let index = arr.map(item => item.name).indexOf(this.editCategoryData.name)
        if (index !== -1) {
          let oldData = arr[index]
          if (oldData.id !== this.editCategoryData.id) {
            bool = true
          }
        }
      }
      return bool
    }
  },
  watch: {

  }
}
</script>

<style lang="scss" scoped>
.udp-list-tab {
  height: 600px;
}
</style>

<style lang="scss">
.edit-category-dia {
  .edit-category-dialog-body {
    position: relative;
    .el-input, .el-textarea {
      max-width: 400px;
    }
  }
  .category-dialog-footer {}
}
</style>
